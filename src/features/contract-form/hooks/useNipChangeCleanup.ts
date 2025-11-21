/**
 * useNipChangeCleanup Hook
 *
 * Centralizes cleanup logic when NIP changes after company data has been fetched.
 *
 * ## Problem Solved
 *
 * **Data Integrity Bug**: User can change NIP after fetching company data, resulting
 * in mismatched data - new NIP with old company data (name, REGON, address, etc.)
 *
 * ## Responsibilities
 *
 * When NIP changes (user edits the field), this hook:
 *
 * 1. **React Hook Form**: Resets all company fields to defaults (preserves new NIP)
 * 2. **Persistence**: Immediately saves cleaned data to sessionStorage
 * 3. **React Query**: Clears cached API data for old NIP
 * 4. **Validation**: Clears company validation state
 *
 * ## Architecture Pattern
 *
 * Follows the same pattern as `useUserTypeCleanup` - proven, tested, maintainable.
 *
 * ## Usage
 *
 * ```typescript
 * const methods = useFormContext<FinalContractData>();
 * const nip = useWatch({ control: methods.control, name: 'company.nip' });
 * useNipChangeCleanup(nip, 'company', methods);
 * ```
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { queryKeyMatchers } from '@/shared/constants/queryKeys';
import { usePrevious } from '@/shared/hooks';

import { defaultCompanyValues } from '../schema/companySchemas';
import type { FinalContractData } from '../schema/companySchemas';
import { useCompanyValidationStore } from '../store/useCompanyValidationStore';
import { useFormPersistStore } from '../store/useFormPersistStore';

/**
 * Cleanup hook triggered when NIP changes
 *
 * @param nip - Current NIP value from form
 * @param userType - Current userType (must be 'company')
 * @param methods - RHF methods for field manipulation
 */
export function useNipChangeCleanup(
  nip: string,
  userType: 'company',
  methods: UseFormReturn<FinalContractData>
): void {
  const queryClient = useQueryClient();
  const prevNip = usePrevious(nip);
  const { saveForm } = useFormPersistStore();
  const { clear: clearValidationState } = useCompanyValidationStore();

  useEffect(() => {
    // Skip on initial mount (no previous NIP) or when NIP hasn't changed
    if (!prevNip || prevNip === nip) {
      return;
    }

    // ============================================================================
    // CLEANUP PHASE 1: Construct Cleaned Company Data
    // ============================================================================

    // Get current form data (preserves all other fields like personalData, etc.)
    const currentFormData = methods.getValues();

    // Build cleaned company data: defaults + new NIP
    // Resets all fields (name, regon, krs, address, registrySignature) except NIP
    const cleanedCompanyData = {
      ...defaultCompanyValues,
      nip, // Preserve new NIP value
    };

    // Complete form data with cleaned company section
    const cleanedFormData: FinalContractData = {
      ...currentFormData,
      company: cleanedCompanyData,
    };

    // ============================================================================
    // CLEANUP PHASE 2: React Hook Form - Atomic Reset
    // ============================================================================

    // Single atomic reset - RHF handles all cleanup internally
    // Updates form state to match cleaned data with new NIP
    methods.reset(cleanedFormData, {
      keepDefaultValues: false, // Update _defaultValues
      keepValues: false, // Replace ALL values with cleanedFormData
    });

    // ============================================================================
    // CLEANUP PHASE 3: Persistence Store Sync
    // ============================================================================

    // Save cleaned data to sessionStorage immediately
    // Bypasses useFormPersistence debounce to prevent race conditions
    saveForm(cleanedFormData);

    // ============================================================================
    // CLEANUP PHASE 4: React Query Cache
    // ============================================================================

    // Clear cached API data for old NIP
    // Forces fresh fetch when user clicks "Pobierz dane" button
    queryClient.removeQueries({
      predicate: query => queryKeyMatchers.isCompanyQuery(query.queryKey),
    });

    // ============================================================================
    // CLEANUP PHASE 5: Company Validation State
    // ============================================================================

    // Clear validation state to force re-validation with new NIP
    // Ensures validation store doesn't have stale approval for old NIP
    clearValidationState();
  }, [
    nip,
    prevNip,
    userType,
    methods,
    queryClient,
    saveForm,
    clearValidationState,
  ]);
}
