/**
 * React Query configuration constants
 *
 * Centralized configuration for TanStack Query to avoid magic numbers
 * and maintain consistency across the application.
 *
 * ARCHITECTURAL DECISIONS:
 * - All time values in milliseconds for consistency
 * - MAX_RETRY_ATTEMPTS applies to transient errors only (5xx, network)
 * - STALE_TIME < GC_TIME enables stale-while-revalidate pattern
 */

/**
 * Maximum number of retry attempts for transient errors
 * (server errors 5xx, network failures)
 *
 * Used in QueryProvider retry logic for:
 * - Server errors (500, 502, 503, etc.)
 * - Network errors (timeouts, connection failures)
 *
 * Client errors (4xx) are never retried regardless of this value.
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Default stale time for queries (5 minutes)
 *
 * How long until a query is considered stale and needs refetching.
 * After this time, data is still served from cache but refetch happens in background.
 */
export const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes

/**
 * Default garbage collection time for queries (10 minutes)
 *
 * How long inactive queries remain in cache.
 * Longer than staleTime to enable stale-while-revalidate pattern:
 * - Stale cached data displays instantly on re-mount
 * - Fresh data fetches in background to update the UI
 */
export const DEFAULT_GC_TIME = 1000 * 60 * 10; // 10 minutes

/**
 * Base retry delay in milliseconds (1 second)
 *
 * Used as base for exponential backoff formula in QueryProvider.
 * Formula: min(BASE_RETRY_DELAY * 2^attemptIndex, MAX_RETRY_DELAY)
 * Example timing: 1s → 2s → 4s → 8s → 10s (capped at MAX_RETRY_DELAY)
 */
export const BASE_RETRY_DELAY = 1000; // 1 second

/**
 * Maximum retry delay in milliseconds (10 seconds)
 *
 * Cap for exponential backoff to prevent excessively long waits.
 * Prevents "thundering herd" problem while keeping response times acceptable.
 */
export const MAX_RETRY_DELAY = 10000; // 10 seconds

/**
 * Time conversion helpers
 * Use these for better readability when overriding defaults
 */
export const TIME = {
  /** Convert minutes to milliseconds */
  minutes: (n: number) => 1000 * 60 * n,
  /** Convert hours to milliseconds */
  hours: (n: number) => 1000 * 60 * 60 * n,
  /** Convert seconds to milliseconds */
  seconds: (n: number) => 1000 * n,
} as const;
