/**
 * Centralized query key management for TanStack Query
 *
 * Benefits:
 * - Type-safe query keys
 * - Single source of truth
 * - Easy refactoring (change key structure in one place)
 * - Precise cache invalidation/removal
 * - Self-documenting API
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
 */

/**
 * Query key factory functions
 * Each function returns a tuple with specific structure
 *
 * Factory pattern ensures consistency and type safety across the application.
 * All query keys are constructed through these functions, preventing typos
 * and structural inconsistencies.
 */
export const queryKeys = {
  /**
   * Company data query key
   *
   * Structure: ['company', nip: string, userType: 'company']
   *
   * @param nip - Company's NIP number
   * @param userType - Must be 'company' (type-safe)
   * @returns Readonly tuple representing the query key
   *
   * @example
   * ```ts
   * queryKey: queryKeys.company('1234567890', 'company')
   * // Returns: ['company', '1234567890', 'company'] as const
   * ```
   */
  company: (nip: string, userType: 'company') =>
    ['company', nip, userType] as const,

  /**
   * VAT status query key
   *
   * Structure: ['vat-status', nip: string]
   *
   * @param nip - Company's NIP number
   * @returns Readonly tuple representing the query key
   *
   * @example
   * ```ts
   * queryKey: queryKeys.vatStatus('1234567890')
   * // Returns: ['vat-status', '1234567890'] as const
   * ```
   */
  vatStatus: (nip: string) => ['vat-status', nip] as const,

  /**
   * Pipedrive PID validation query key
   *
   * Structure: ['pipedrive', 'validate', pid: string, created: string]
   *
   * @param pid - Pipedrive Person ID
   * @param created - Creation date (YYYY-MM-DD) for security validation
   * @returns Readonly tuple representing the query key
   *
   * @example
   * ```ts
   * queryKey: queryKeys.pipedriveValidation('12345', '2024-03-15')
   * // Returns: ['pipedrive', 'validate', '12345', '2024-03-15'] as const
   * ```
   */
  pipedriveValidation: (pid: string, created: string) =>
    ['pipedrive', 'validate', pid, created] as const,
} as const;

/**
 * Query key matchers for removeQueries/invalidateQueries predicates
 *
 * Each matcher validates the exact structure of the query key to prevent
 * accidental removal of unrelated queries.
 *
 * These matchers are crucial for cache management when user type changes,
 * ensuring we only remove the intended queries and not future queries like
 * ['company-settings'], ['company-list'], ['vat-status-history'], etc.
 */
export const queryKeyMatchers = {
  /**
   * Matches company data queries
   *
   * Validates structure: ['company', string, string]
   * - First element must be 'company'
   * - Must have exactly 3 elements
   * - Second element (NIP) must be string
   * - Third element (userType) must be string
   *
   * @param queryKey - Query key to validate
   * @returns true if matches company query structure
   *
   * @example
   * ```ts
   * queryKeyMatchers.isCompanyQuery(['company', '123', 'company']) // true
   * queryKeyMatchers.isCompanyQuery(['company-list']) // false
   * queryKeyMatchers.isCompanyQuery(['company', '123']) // false (too short)
   * ```
   */
  isCompanyQuery: (queryKey: unknown[]): boolean =>
    queryKey[0] === 'company' &&
    queryKey.length === 3 &&
    typeof queryKey[1] === 'string' && // NIP
    typeof queryKey[2] === 'string', // userType

  /**
   * Matches VAT status queries
   *
   * Validates structure: ['vat-status', string]
   * - First element must be 'vat-status'
   * - Must have exactly 2 elements
   * - Second element (NIP) must be string
   *
   * @param queryKey - Query key to validate
   * @returns true if matches VAT status query structure
   *
   * @example
   * ```ts
   * queryKeyMatchers.isVatStatusQuery(['vat-status', '123']) // true
   * queryKeyMatchers.isVatStatusQuery(['vat-status-history']) // false
   * queryKeyMatchers.isVatStatusQuery(['vat-status', '123', 'extra']) // false (too long)
   * ```
   */
  isVatStatusQuery: (queryKey: unknown[]): boolean =>
    queryKey[0] === 'vat-status' &&
    queryKey.length === 2 &&
    typeof queryKey[1] === 'string', // NIP
} as const;
