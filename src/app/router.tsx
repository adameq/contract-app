/**
 * React Router Configuration
 *
 * Defines all routes for the multistep form with route guards
 */

import {
  createBrowserRouter,
  type LoaderFunctionArgs,
  redirect,
} from 'react-router-dom';

// Import app-level pages
import { NotFoundPage } from '@/app/config/pages';
// Import form components
import { FormStepLayout } from '@/features/contract-form/components/layout/FormStepLayout';
import { DynamicStepPage } from '@/features/contract-form/pages/DynamicStepPage';
import {
  FormSuccessPage,
  getTotalSteps,
} from '@/features/contract-form/utils/pageConfig';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { ROUTES } from '@/shared/constants/routes';

import { RootOutlet } from './layouts/RootOutlet';

/**
 * Page lazy loading strategy
 *
 * Pages are lazy loaded from their appropriate configuration files:
 * - App-level pages (404): Configured in @/app/config/pages.ts
 * - Form step pages (FormStep1-6): Configured in feature pageConfig with metadata
 * - Feature pages (Success): Configured in feature pageConfig
 *
 * Benefits:
 * - Proper separation: app-level vs feature-level pages
 * - Reduces initial bundle size via code splitting
 * - Only loads pages when user navigates to them
 * - Clear architectural boundaries
 */

/**
 * Step parameter validation loader
 *
 * BUSINESS DECISION: Steps are freely accessible without validation
 *
 * Rationale for allowing free navigation:
 * 1. **User Experience**: Users can navigate back to review/edit previous steps at any time
 * 2. **Auto-save**: Form progress is automatically saved to session storage (see FormStepLayout.tsx:38-50)
 * 3. **Final Validation**: All validation happens on final submit (step 6), not during navigation
 * 4. **Trust**: Users are trusted to complete the form correctly without forced linear progression
 * 5. **Flexibility**: Better UX than wizard-style forms that lock previous steps
 *
 * This loader ONLY validates that the step number is within valid range (1-6).
 * It does NOT enforce:
 * - Sequential progression (step 1 → 2 → 3...)
 * - Field validation before advancing
 * - Step completion tracking
 *
 * @see FormStepLayout.tsx - Auto-save implementation
 * @see useStepNavigation.ts - Navigation without validation
 */
function validateStepParamLoader({ params }: LoaderFunctionArgs) {
  const step = params.step ? parseInt(params.step, 10) : 1;

  // Validate step number is within range
  if (isNaN(step) || step < 1 || step > getTotalSteps()) {
    return redirect(ROUTES.FORM_STEP_1);
  }

  // Steps are freely accessible - no validation required
  return null;
}

/**
 * Root router configuration
 *
 * ARCHITECTURE:
 * - RootOutlet wraps all routes and provides router context to global UI (Toaster)
 * - All routes are children of RootOutlet, ensuring single Toaster instance
 * - /form parent route logically groups all form-related routes
 *   - /form/step/:step uses FormStepLayout (with stepper, navigation, FormProvider)
 *   - /form/success/:contractId uses PageLayout (simple header, no stepper)
 * - 404 catch-all at root level for non-form pages
 */
export const router = createBrowserRouter([
  {
    element: <RootOutlet />,
    children: [
      {
        path: '/',
        loader: ({ request }) => {
          // Preserve query params during redirect (e.g., ?pid=123&option=01&created=2024-01-01)
          const url = new URL(request.url);
          const search = url.search;
          return redirect(ROUTES.FORM_STEP_1 + search);
        },
      },
      {
        // Parent route for all form-related paths
        path: '/form',
        children: [
          {
            index: true,
            loader: ({ request }) => {
              // Preserve query params during redirect
              const url = new URL(request.url);
              const search = url.search;
              return redirect(ROUTES.FORM_STEP_1 + search);
            },
          },
          {
            // Form step pages with full form layout (stepper, navigation, FormProvider)
            element: <FormStepLayout />,
            children: [
              {
                path: 'step/:step',
                loader: validateStepParamLoader,
                element: <DynamicStepPage />,
              },
            ],
          },
          {
            // Success page with simple layout (header only, no stepper)
            // Uses PageLayout to provide consistent structure without form elements
            element: <PageLayout />,
            children: [
              {
                path: 'success/:contractId',
                element: <FormSuccessPage />,
              },
            ],
          },
        ],
      },
      {
        // Catch-all 404 page at root level
        element: <PageLayout />,
        children: [
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);
