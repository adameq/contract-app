/**
 * Root Layout
 *
 * Top-level layout wrapper that initializes the React Router.
 *
 * ARCHITECTURE:
 * - RootLayout provides the RouterProvider (app-level)
 * - RootOutlet (defined in router config) wraps all routes and provides
 *   router context to global UI components like Toaster
 * - This separation ensures clean provider hierarchy and proper context access
 *
 * CONTEXT HIERARCHY:
 * main.tsx: ThemeProvider → QueryProvider → RootLayout
 * RootLayout: RouterProvider
 * router.tsx: RootOutlet → Toaster + all routes
 *
 * @see src/app/main.tsx - Provider hierarchy
 * @see src/app/layouts/RootOutlet.tsx - Router context for global UI
 * @see src/app/router.tsx - Router configuration
 */

import { RouterProvider } from 'react-router-dom';

import { router } from '../router';

/**
 * Root layout component
 *
 * Initializes React Router which handles all routing and renders RootOutlet.
 */
export function RootLayout() {
  return <RouterProvider router={router} />;
}
