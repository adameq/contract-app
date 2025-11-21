/**
 * TanStack Query Type Extensions
 *
 * This file extends TanStack Query types to provide type safety for custom
 * meta fields used throughout the application.
 *
 * Module augmentation allows us to extend third-party types without modifying
 * the original library, providing better developer experience with:
 * - Autocomplete for meta fields
 * - Type checking to prevent typos
 * - IntelliSense documentation
 *
 * @see QueryProvider.tsx - Mutation retry logic using meta.retryOnNetworkError
 */

import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  /**
   * Extended mutation meta interface
   *
   * Add custom meta fields that can be used in mutation configuration.
   * These fields are accessible in mutation callbacks and retry logic.
   */
  interface MutationMeta {
    /**
     * Enable retry on network errors for idempotent mutations
     *
     * When set to true, the mutation will retry on network failures
     * (connection issues, timeouts) following the same retry strategy as queries.
     *
     * **Only use for idempotent operations** - mutations that can be safely
     * retried without side effects (e.g., saveDraft, updatePreferences).
     *
     * **Do not use for non-idempotent operations** like payment processing,
     * order creation, or any mutation with side effects.
     *
     * @default false (mutations don't retry by default)
     *
     * @example
     * ```typescript
     * useMutation({
     *   mutationFn: saveDraft,
     *   meta: { retryOnNetworkError: true }
     * })
     * ```
     *
     * @see QueryProvider.tsx:143-164 - Retry logic implementation
     */
    retryOnNetworkError?: boolean;

    // Add more custom meta fields here as needed:
    // skipErrorLogging?: boolean;
    // customTimeout?: number;
  }

  /**
   * Extended query meta interface
   *
   * Add custom meta fields for query-specific configuration.
   * Reserved for future use.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface QueryMeta {
    // Add custom query meta fields here as needed:
    // backgroundRefetch?: boolean;
    // customCacheTime?: number;
  }
}
