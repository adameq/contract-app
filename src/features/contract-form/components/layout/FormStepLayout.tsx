/**
 * Form Step Layout
 *
 * Main layout component for the multi-step contract form using Single FormProvider architecture.
 *
 * ## ARCHITECTURE
 *
 * **Single FormProvider Pattern**:
 * - One FormProvider manages complete FinalContractData (discriminated union)
 * - Direct field access without state synchronization
 * - Smart hooks encapsulate all complex logic
 * - Direct error handling via RHF's setError
 *
 * ## HOOK COMPOSITION
 *
 * Clean separation of concerns via specialized hooks:
 * 1. useFormInitialization() - Get initial values from storage/defaults
 * 2. useForm() - Initialize React Hook Form
 * 3. useFormPersistence() - Auto-save/restore with debounce
 * 4. useUserTypeCleanup() - Cleanup when user type changes
 * 5. useFormSubmission() - Complete submission orchestration
 * 6. useFormReset() - Reset all form state
 *
 * Each hook is independently testable with single responsibility.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Suspense } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Outlet, useNavigate } from 'react-router-dom';

import { ErrorBoundary } from '@/shared/components/async/ErrorBoundary';
import { StepLoadingFallback } from '@/shared/components/common/StepLoadingFallback';
import { AppHeader } from '@/shared/components/layout/AppHeader';
import { ROUTES } from '@/shared/constants/routes';
import { logger } from '@/shared/lib/logger';

import { useFormInitialization } from '../../hooks/useFormInitialization';
import { useFormPersistence } from '../../hooks/useFormPersistence';
import { useFormReset } from '../../hooks/useFormReset';
import { useFormSubmission } from '../../hooks/useFormSubmission';
import { usePidValidation } from '../../hooks/usePidValidation';
import { useUserTypeCleanup } from '../../hooks/useUserTypeCleanup';
import type { FinalContractData } from '../../schema/companySchemas';
import { finalContractSchema } from '../../schema/companySchemas';
import { StepNavigation } from '../stepper/StepNavigation';
import { Stepper } from '../stepper/Stepper';

/**
 * Form Step Layout Component
 *
 * Simplified layout with Single FormProvider architecture.
 * Uses smart hooks to encapsulate all complex logic.
 */
export function FormStepLayout() {
  const navigate = useNavigate();

  // ============================================================================
  // PIPEDRIVE VALIDATION (Access Control)
  // ============================================================================

  // Validate Pipedrive Person ID before allowing form access
  // Multi-layer security: PID + custom field + creation date
  // Invalid PIDs result in redirect to main site
  const { isValidating, isEnabled } = usePidValidation();

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  // Get initial form values (from storage or defaults)
  const initialValues = useFormInitialization();

  // Initialize React Hook Form with complete discriminated union
  // This single FormProvider manages ALL form state
  const methods = useForm<FinalContractData>({
    defaultValues: initialValues,
    resolver: zodResolver(finalContractSchema),
    mode: 'onChange',
  });

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  // Auto-save to Zustand → sessionStorage (500ms debounce)
  // Restores on mount automatically
  useFormPersistence(methods.watch, methods.reset);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  // Watch userType for cleanup coordination
  const userType = methods.watch('userType');

  // Handle cleanup when userType changes
  // Unregisters old fields, clears React Query cache
  useUserTypeCleanup(userType, methods);

  // ============================================================================
  // SUBMISSION
  // ============================================================================

  // Handle form submission with full error handling
  // Includes validation, persistence, API call, error mapping
  const { handleSubmit } = useFormSubmission({
    methods,
    onSuccess: contractId => {
      // Navigate to success page after submission
      void navigate(ROUTES.FORM_SUCCESS(contractId));
    },
  });

  // ============================================================================
  // RESET
  // ============================================================================

  // Handle form reset
  // Pass reset function directly to avoid useFormContext before FormProvider
  const { handleReset } = useFormReset(methods.reset);

  // ============================================================================
  // ERROR BOUNDARY
  // ============================================================================

  // Error handler for ErrorBoundary
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error('Form step error caught', error, {
      component: 'FormStepLayout',
      action: 'errorBoundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Block form rendering during PID validation (after all hooks are called)
  if (isEnabled && isValidating) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-muted-foreground">Weryfikacja dostępu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={handleError}>
      <FormProvider {...methods}>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header with logo and theme toggle */}
          <AppHeader />

          {/* Stepper */}
          <Stepper />

          {/* Main content area - React Router Outlet */}
          <main className="container mx-auto flex-1 max-w-5xl px-4 sm:px-6 lg:px-8">
            {/* Centralized step transition animations */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Suspense boundary for lazy-loaded step pages */}
              <Suspense fallback={<StepLoadingFallback />}>
                <Outlet />
              </Suspense>
            </div>
          </main>

          {/* Navigation - autonomous component using useSubmissionState hook */}
          <StepNavigation
            onSubmit={() => void handleSubmit()}
            onReset={handleReset}
          />
        </div>
      </FormProvider>
    </ErrorBoundary>
  );
}
