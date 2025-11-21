/**
 * React Query hook for fetching company data
 * Replaces the custom cache + use() hook pattern with standard React Query
 *
 * ARCHITECTURAL DECISIONS:
 *
 * 1. Why React Query instead of custom cache:
 *    - Standard, battle-tested solution
 *    - Built-in DevTools support
 *    - No need for 400+ lines of custom cache code
 *    - Automatic deduplication and cache management
 *
 * 2. Why not Suspense:
 *    - This is user-triggered data fetching (button click)
 *    - Suspense is for initial renders, not interactions
 *    - Better UX with inline loading states
 *    - No component unmounting/remounting
 *
 * 3. enabled: false pattern:
 *    - Data is fetched only on user action (button click)
 *    - Prevents automatic fetching on mount
 *    - User controls when to fetch via refetch()
 */

import { useQuery } from '@tanstack/react-query';

import { fetchCompanyByNip } from '@/shared/api/gus';
import type { CompanyData } from '@/shared/api/types';
import { queryKeys } from '@/shared/constants/queryKeys';
import {
  DEFAULT_GC_TIME,
  DEFAULT_STALE_TIME,
} from '@/shared/constants/reactQuery';
import { isValidNip } from '@/shared/lib/validation';

/**
 * React Query hook for fetching company data (company user type only)
 *
 * **IMPORTANT: Company-specific hook**
 * This hook is designed specifically for 'company' user type ONLY.
 * It fetches full company data from GUS registry (name, regon, krs, address, etc.).
 *
 * For 'consumer-vat' users who only need VAT status verification, use useVatStatusQuery instead.
 * For 'consumer' users, no company data is needed.
 *
 * **TYPE SAFETY**: This hook enforces strict types at the boundary
 * - Requires `nip: string` (not `string | undefined`)
 * - Requires `userType: 'company'` (not nullable union)
 * - Callers must ensure data availability before calling
 * - No runtime validation needed - TypeScript guarantees correctness
 *
 * **VALIDATION LAYERS** (defense-in-depth):
 * 1. **TypeScript**: Compile-time type checking (this hook)
 * 2. **Form validation (Zod)**: Real-time UX feedback during input
 * 3. **UI gating (NipActionButton)**: Button disabled if NIP invalid
 * 4. **Query enabled flag**: Runtime control of query execution
 * 5. **Backend validation**: Server-side validation as ultimate defense
 *
 * @param nip - Valid NIP number (required, non-empty)
 * @param userType - Must be 'company' (enforced by TypeScript)
 * @param options - React Query options (enabled defaults to false for manual triggering)
 *
 * @throws {HttpError} If API call fails (from fetchCompanyByNip)
 *
 * @example
 * ```tsx
 * // Strict types - TypeScript enforces data availability
 * const companyQuery = useCompanyQuery(nip, 'company', {
 *   enabled: false, // Manual trigger
 * });
 *
 * // Trigger fetch when user clicks button
 * <NipActionButton
 *   onAction={() => companyQuery.refetch()}
 * />
 * ```
 */
export function useCompanyQuery(
  nip: string,
  userType: 'company',
  options?: {
    enabled?: boolean;
    onSuccess?: (data: CompanyData) => void;
    onError?: (error: Error) => void;
  }
) {
  // Validation logic: Only validates NIP format (type system guarantees non-null)
  // enabled flag controls query execution based on:
  // - Manual trigger (options.enabled)
  // - NIP format validity (isValidNip includes checksum validation)
  const shouldEnableQuery =
    (options?.enabled ?? false) && // Manual trigger via enabled option
    isValidNip(nip); // NIP validation (format + checksum)

  return useQuery({
    // Query key identifies the data being fetched
    // REACT QUERY BEST PRACTICE: Keys represent data identity, not execution state
    // - NIP is guaranteed to be string (TypeScript)
    // - userType is always 'company' (TypeScript)
    queryKey: queryKeys.company(nip, userType),
    queryFn: async ({ signal }) => {
      // No runtime validation needed - TypeScript guarantees nip and userType are valid
      // React Query guarantees queryFn only executes when enabled === true
      return await fetchCompanyByNip(nip, userType, signal);
    },
    // Enable query only when all validation conditions pass (see shouldEnableQuery above)
    // React Query guarantees queryFn won't execute if enabled is false
    enabled: shouldEnableQuery,
    // Use default cache times from shared constants
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    // Rely on global retry configuration from QueryProvider

    // Pass through optional callbacks without modification
    // Note: Validation state synchronization is now handled by useCompanyValidationSync hook
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
