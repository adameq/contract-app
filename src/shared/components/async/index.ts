/**
 * Async components exports for React 19 use() hook integration
 *
 * Centralized exports for all async-related components that work
 * with React 19's use() hook and Suspense boundaries.
 */

// ErrorBoundary exports
export {
  ErrorBoundary,
  type ErrorBoundaryFallbackProps,
} from './ErrorBoundary';

// Modern error boundary utilities
export {
  useErrorBoundary,
  useErrorBoundaryControl,
  withErrorBoundary,
} from './errorBoundary.helpers';

// AsyncBoundary removed - using React Query instead of Suspense for user interactions

// Loading skeleton exports
export {
  AddressFieldsSkeleton,
  CompanyDataSkeleton,
  FormInitializationSkeleton,
  FormSectionSkeleton,
  RetryingSkeleton,
  SmartSkeleton,
} from './LoadingSkeletons';

// Contextual error exports
export {
  CompanyDataError,
  FormCriticalError,
  FormSectionError,
  NetworkError,
  TimeoutError,
} from './ContextualErrors';
