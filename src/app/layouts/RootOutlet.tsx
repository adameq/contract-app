/**
 * Root Outlet Component
 *
 * Root-level layout that wraps all application routes.
 * Provides global UI components (like Toaster) with proper router context.
 *
 * ARCHITECTURE DECISION:
 * This component is rendered BY the router (as a route element), which means
 * it has full access to router context. The Toaster component can now use
 * router-aware features like <Link />, useNavigate(), useLocation(), etc.
 *
 * CONTEXT HIERARCHY:
 * main.tsx: ThemeProvider → QueryProvider → RootLayout → RouterProvider
 * router.tsx: RootOutlet (rendered by router) → Toaster + child routes
 *
 * This is the correct approach for providing router context to global UI:
 * - RootOutlet is a CHILD of RouterProvider (rendered by router)
 * - Toaster is a CHILD of RootOutlet, so it has router context
 * - All routes render through <Outlet />, maintaining single Toaster instance
 *
 * @see https://ui.shadcn.com/docs/components/sonner - Toaster documentation
 * @see https://reactrouter.com/en/main/components/outlet - Outlet documentation
 */

import { Outlet } from 'react-router-dom';

import { Toaster } from '@/shared/components/ui/sonner';

/**
 * Root outlet component
 *
 * Renders global UI components that need router context, plus the current route.
 * Single Toaster instance shared across all routes.
 */
export function RootOutlet() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
