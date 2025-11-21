/**
 * Error Boundary Utility Functions
 *
 * This module contains utility functions and hooks for error boundary functionality
 * separated from the main ErrorBoundary component to optimize React Fast Refresh.
 */

import React from 'react';
import { useErrorBoundary } from 'react-error-boundary';

import { ErrorBoundary } from './ErrorBoundary';

/**
 * Modern hook for error boundary control
 *
 * Uses react-error-boundary's useErrorBoundary hook for proper error handling
 * without the problematic window.location.reload() pattern.
 */
export function useErrorBoundaryControl() {
  const { showBoundary, resetBoundary } = useErrorBoundary();

  return {
    showBoundary,
    resetBoundary,
    // Legacy compatibility
    resetErrorBoundary: resetBoundary,
  };
}

/**
 * Higher-order component for wrapping components with error boundary
 *
 * Uses the modern ErrorBoundary implementation with react-error-boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Record<string, unknown>
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;

  return WrappedComponent;
}

// Re-export useErrorBoundary hook from react-error-boundary for convenience
export { useErrorBoundary } from 'react-error-boundary';
