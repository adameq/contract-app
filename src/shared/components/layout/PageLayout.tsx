/**
 * Page Layout
 *
 * Generic layout wrapper for standalone pages outside the form flow.
 * Provides consistent structure with header, Suspense boundary, and content area.
 *
 * ARCHITECTURE:
 * - Shared AppHeader (logo + theme toggle, no title)
 * - Centralizes Suspense boundary for lazy-loaded pages
 * - Consistent structure with FormStepLayout but without form-specific elements
 * - Supports both direct children and nested routes via Outlet
 *
 * USAGE:
 * Used in router.tsx for pages that don't use FormStepLayout:
 * - Success page (/form/success/:contractId)
 * - 404 page (*)
 * - Future pages: error page, about page, etc.
 *
 * @example
 * ```tsx
 * // In router.tsx - Direct children (simplified, recommended for standalone pages)
 * {
 *   path: '/form/success/:contractId',
 *   element: <PageLayout><FormSuccessPage /></PageLayout>,
 * }
 *
 * // Alternative - Nested routes (for pages with child routes)
 * {
 *   path: '/dashboard',
 *   element: <PageLayout />,
 *   children: [
 *     { index: true, element: <DashboardHome /> },
 *     { path: 'settings', element: <DashboardSettings /> },
 *   ],
 * }
 * ```
 */

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { ErrorBoundary } from '@/shared/components/async/ErrorBoundary';
import { StepLoadingFallback } from '@/shared/components/common/StepLoadingFallback';
import { logger } from '@/shared/lib/logger';

import { AppHeader } from './AppHeader';

interface PageLayoutProps {
  /**
   * Optional children to render directly.
   * If provided, children are rendered instead of <Outlet />.
   * This allows simpler composition for standalone pages.
   */
  children?: ReactNode;
}

/**
 * Generic page layout component
 *
 * Provides:
 * - Shared header with logo and theme toggle
 * - Error boundary for lazy-loaded pages
 * - Centralized Suspense boundary for lazy-loaded pages
 * - Consistent container and padding structure
 * - Flexible rendering: direct children or nested routes
 */
export function PageLayout({ children }: PageLayoutProps) {
  /**
   * Error handler for page loading errors
   * Logs errors to monitoring system for debugging
   */
  const handleError = (error: Error) => {
    logger.error('Page loading error caught by ErrorBoundary', error, {
      component: 'PageLayout',
      location: window.location.pathname,
    });
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Generic header without title (logo + theme toggle only) */}
      <AppHeader />

      {/* Main content area */}
      <main className="container mx-auto flex-1 max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Error boundary catches lazy loading errors and render errors */}
        <ErrorBoundary onError={handleError}>
          {/* Suspense boundary for lazy-loaded standalone pages */}
          {/* Uses same fallback as form steps for consistency */}
          <Suspense fallback={<StepLoadingFallback />}>
            {/* Render direct children if provided, otherwise use Outlet for nested routes */}
            {children ?? <Outlet />}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
