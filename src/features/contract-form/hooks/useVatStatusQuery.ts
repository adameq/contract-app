/**
 * React Query hook for fetching VAT status (consumer-vat)
 *
 * This hook checks NIP against Polish VAT white list (Biała Lista VAT).
 * It does NOT fetch full company data from GUS.
 *
 * For full company data fetching, use useCompanyQuery instead.
 *
 * **TYPE SAFETY**: This hook enforces strict types at the boundary
 * - Requires `nip: string` (not `string | undefined`)
 * - Requires `userType: 'consumer-vat'` (not nullable union)
 * - Callers must ensure data availability before calling
 * - No runtime validation needed - TypeScript guarantees correctness
 *
 * **VALIDATION LAYERS** (defense-in-depth):
 * 1. **TypeScript**: Compile-time type checking (this hook)
 * 2. **Form validation (Zod)**: Real-time UX feedback during input
 * 3. **UI gating**: Button disabled if NIP invalid
 * 4. **Query enabled flag**: Runtime control of query execution
 * 5. **Backend validation**: Server-side validation as ultimate defense
 *
 * @param nip - Valid NIP number (required, non-empty)
 * @param userType - Must be 'consumer-vat' (enforced by TypeScript)
 * @param options - React Query options (enabled defaults to false for manual triggering)
 *
 * @throws {HttpError} If API call fails (from fetchVatStatus)
 *
 * @example
 * ```tsx
 * // Strict types - TypeScript enforces data availability
 * const vatStatusQuery = useVatStatusQuery(nip, 'consumer-vat', {
 *   enabled: false, // Manual trigger
 * });
 *
 * // Trigger validation when user clicks button
 * <Button onClick={() => vatStatusQuery.refetch()}>
 *   Sprawdź status VAT
 * </Button>
 * ```
 */

import { useQuery } from '@tanstack/react-query';

import { fetchVatStatus } from '@/shared/api/gus';
import type { VatStatusData } from '@/shared/api/types';
import { queryKeys } from '@/shared/constants/queryKeys';
import {
  DEFAULT_GC_TIME,
  DEFAULT_STALE_TIME,
} from '@/shared/constants/reactQuery';
import { isValidNip } from '@/shared/lib/validation';

export function useVatStatusQuery(
  nip: string,
  userType: 'consumer-vat',
  options?: {
    enabled?: boolean;
    onSuccess?: (data: VatStatusData) => void;
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
    queryKey: queryKeys.vatStatus(nip),
    queryFn: async ({ signal }) => {
      // No runtime validation needed - TypeScript guarantees nip is valid
      // React Query guarantees queryFn only executes when enabled === true
      return await fetchVatStatus(nip, signal);
    },
    // Enable query only when all validation conditions pass
    enabled: shouldEnableQuery,
    // Use default cache times from shared constants
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    // Callbacks
    ...options,
  });
}
