/**
 * React Query Provider setup
 * Configures QueryClient with optimal settings for the application
 *
 * ARCHITECTURAL DECISIONS:
 *
 * 1. Why React Query (TanStack Query):
 *    - Industry standard for server state management
 *    - Replaces complex useEffect + useState patterns
 *    - Built-in caching, synchronization, and background updates
 *    - Excellent TypeScript support
 *
 * 2. Configuration choices:
 *    - staleTime: 5 minutes (balance between freshness and performance)
 *    - gcTime: 10 minutes (cache persists longer for stale-while-revalidate pattern:
 *                          stale data shows instantly, fresh data fetches in background)
 *    - Query retry strategy (defense-in-depth):
 *      • Retry 5xx server errors (transient server issues)
 *      • Retry NetworkError (fetch failures, timeouts, connection issues)
 *      • NO retry for 4xx client errors (invalid requests)
 *      • NO retry for parsing errors (code bugs, not transient)
 *      • NO retry for unknown errors (fail-fast for debugging)
 *      • NO retry for user-initiated aborts
 *    - Mutation retry strategy (opt-in):
 *      • Default: NO retry (mutations have side effects)
 *      • Opt-in: Set meta.retryOnNetworkError for idempotent mutations
 *      • Only retries NetworkError (same logic as queries)
 *      • Use case: saveDraft, updatePreferences, etc.
 *    - refetchOnWindowFocus: false (form data shouldn't auto-refresh)
 *
 * 3. Provider pattern:
 *    - Component-level QueryClient using useState with lazy initializer
 *    - Why useState instead of module-level singleton:
 *      • SSR-ready architecture (isolated instances per request if SSR is added)
 *      • Easier unit testing (fresh instance per test without module mocking)
 *      • Recommended pattern by TanStack Query for maximum flexibility
 *      • Zero performance cost (lazy initializer runs only once per mount)
 *      • Zero functional difference in current client-only SPA
 *    - Configuration at app level (consistent behavior)
 *    - DevTools in development only (no production overhead)
 *
 * 4. Why not Redux/Zustand for server state:
 *    - React Query is purpose-built for server state
 *    - Automatic cache invalidation and synchronization
 *    - Less boilerplate than Redux
 *    - Better handling of async operations
 */

import type { Mutation } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

import { isHttpError, isNetworkError } from '@/shared/api/errors';
import {
  BASE_RETRY_DELAY,
  DEFAULT_GC_TIME,
  DEFAULT_STALE_TIME,
  MAX_RETRY_ATTEMPTS,
  MAX_RETRY_DELAY,
} from '@/shared/constants/reactQuery';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * React Query Provider component
 *
 * Features:
 * - Component-level QueryClient with lazy initialization
 * - Optimized query client configuration
 * - Development tools integration
 * - Error boundary support
 * - Retry logic configuration
 *
 * Implementation notes:
 * - useState with lazy initializer ensures client is created only once per mount
 * - In client-only SPA: single instance created when App mounts
 * - If SSR is added: isolated instance per request (prevents state leakage)
 * - Testing: each test gets fresh instance without module mocking
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient with lazy initializer (runs only once per component mount)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: how long until a query is considered stale
            staleTime: DEFAULT_STALE_TIME,
            // GC time: how long inactive queries remain in cache
            // Longer than staleTime to enable stale-while-revalidate:
            // - Stale cached data displays instantly on re-mount
            // - Fresh data fetches in background to update the UI
            gcTime: DEFAULT_GC_TIME,
            // Retry strategy: Only retry transient errors (server/network issues)
            // DON'T retry permanent errors (client errors, parsing errors, unknown errors)
            retry: (failureCount, error) => {
              // 1. HttpError - check status code
              if (isHttpError(error)) {
                // Only retry 5xx server errors (transient server issues)
                // Examples: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable
                if (error.isServerError()) {
                  return failureCount < MAX_RETRY_ATTEMPTS;
                }
                // Don't retry 4xx client errors (invalid requests won't succeed on retry)
                // Examples: 400 Bad Request, 404 Not Found, 422 Validation Error
                return false;
              }

              // 2. NetworkError - retry (transient connection issues)
              // Our custom NetworkError wraps native fetch errors for reliable detection
              // across different browsers and environments (no more fragile instanceof checks!)
              if (isNetworkError(error)) {
                // Don't retry user-initiated aborts
                if (error.isAborted()) {
                  return false;
                }
                // Retry network timeouts and connection failures
                return failureCount < MAX_RETRY_ATTEMPTS;
              }

              // 3. All other errors - DON'T retry (fail-fast for debugging)
              // Examples: SyntaxError (JSON parsing), RangeError, ReferenceError
              // These indicate code bugs, not transient failures
              return false;
            },
            // Retry delay: Exponential backoff with cap
            // Uses React Query's default exponential backoff (1s → 2s → 4s → 8s...)
            // capped at MAX_RETRY_DELAY to prevent excessively long waits
            retryDelay: attemptIndex =>
              Math.min(BASE_RETRY_DELAY * 2 ** attemptIndex, MAX_RETRY_DELAY),
            // Refetch on window focus (useful for keeping data fresh)
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Retry configuration for mutations
            // Default: Don't retry (mutations often have side effects)
            // Override: Set meta.retryOnNetworkError for idempotent mutations
            //
            // Example usage for idempotent mutations:
            // useMutation({
            //   mutationFn: saveDraft,
            //   meta: { retryOnNetworkError: true }
            // })
            retry: (failureCount, error, mutation?: Mutation) => {
              // Check if mutation opted-in to network error retry
              const retryOnNetworkError =
                mutation?.options?.meta?.retryOnNetworkError;

              if (retryOnNetworkError) {
                // Mutation opted-in: retry only on network errors (same logic as queries)
                if (isNetworkError(error)) {
                  if (error.isAborted()) {
                    return false; // Don't retry user-initiated aborts
                  }
                  return failureCount < MAX_RETRY_ATTEMPTS;
                }
                // Don't retry HTTP errors or other errors
                return false;
              }

              // Default behavior: no retry for mutations
              return false;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools automatically excluded from production builds via tree-shaking */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
