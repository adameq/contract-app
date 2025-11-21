/**
 * Advanced ErrorBoundary component using react-error-boundary
 *
 * Provides error handling for components that use the use() hook
 * with customizable fallback UI, error recovery, and automatic reset functionality.
 *
 * This replaces the custom ErrorBoundary implementation with react-error-boundary
 * while maintaining the same API and adding modern error boundary features.
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

import { logger } from '@/shared/lib/logger';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: ErrorBoundaryFallbackProps) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: (string | number | boolean | null | undefined)[];
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  hasErrored: boolean;
}

/**
 * Default fallback component for error boundary
 */
function DefaultErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/30 dark:border-red-800">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-red-800 dark:text-red-200 text-sm">
            Wystąpił błąd
          </h3>
          <p className="text-red-700 dark:text-red-300 text-sm mt-1 break-words">
            {error.message ?? 'Nieoczekiwany błąd aplikacji'}
          </p>
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 text-sm font-medium text-red-800 dark:text-red-200 bg-white dark:bg-red-950 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
            type="button"
          >
            <RefreshCw className="w-3 h-3" />
            Spróbuj ponownie
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ErrorBoundary wrapper component using react-error-boundary
 *
 * Features:
 * - Automatic reset on prop changes (resetKeys)
 * - Custom fallback UI
 * - Error logging with detailed information
 * - Manual error recovery
 * - Modern hook-based error boundary control
 */
export function ErrorBoundary({
  children,
  fallback,
  onError,
  resetKeys,
}: ErrorBoundaryProps) {
  // Enhanced error handler with detailed logging
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    logger.error('ErrorBoundary caught an error', error, {
      component: 'ErrorBoundary',
      action: 'handleError',
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Call optional error handler
    onError?.(error, errorInfo);
  };

  // Custom fallback renderer that maintains API compatibility
  const fallbackRender = ({
    error,
    resetErrorBoundary,
  }: {
    error: Error;
    resetErrorBoundary: () => void;
  }) => {
    if (fallback) {
      return fallback({
        error,
        resetErrorBoundary,
        hasErrored: true,
      });
    }
    return (
      <DefaultErrorFallback
        error={error}
        resetErrorBoundary={resetErrorBoundary}
      />
    );
  };

  return (
    <ReactErrorBoundary
      fallbackRender={fallbackRender}
      onError={handleError}
      resetKeys={resetKeys}
    >
      {children}
    </ReactErrorBoundary>
  );
}
