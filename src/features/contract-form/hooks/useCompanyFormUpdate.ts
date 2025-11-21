/**
 * useCompanyFormUpdate Hook
 *
 * Custom hook that encapsulates form update logic with React Hook Form context.
 * Eliminates prop drilling of RHF methods to utility functions.
 *
 * ARCHITECTURE:
 * - Hook internally accesses useFormContext (no prop drilling)
 * - Returns memoized update function for stable references
 * - Delegates to pure utility function (updateFormWithCompanyData) for testability
 * - Works with FinalContractData (Single FormProvider pattern)
 *
 * BENEFITS:
 * - ✅ No prop drilling of getValues, reset, formState
 * - ✅ Component doesn't need to know about RHF internals
 * - ✅ Stable callback reference (useCallback memoization)
 * - ✅ Maintains pure utility function for testing
 * - ✅ Type-safe with FinalContractData
 *
 * @example
 * ```tsx
 * function CompanyDataSection() {
 *   const { updateCompanyData } = useCompanyFormUpdate();
 *
 *   const handleFetch = async () => {
 *     const data = await fetchCompanyData();
 *     updateCompanyData(data, { preserveUserEdits: false });
 *   };
 * }
 * ```
 */

import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import type { CompanyData } from '@/shared/api/types';

import type { FinalContractData } from '../schema/companySchemas';
import type { FormUpdateOptions } from '../utils/formUpdates';
import { updateFormWithCompanyData } from '../utils/formUpdates';

/**
 * Hook for updating company form with API data
 *
 * Works with FinalContractData in Single FormProvider architecture.
 *
 * Provides a clean API for updating form without exposing RHF internals.
 * Internally uses useFormContext to access form methods.
 *
 * @returns Object with updateCompanyData function
 *
 * @example
 * ```tsx
 * const { updateCompanyData } = useCompanyFormUpdate();
 * updateCompanyData(apiData); // Updates company.nip, company.name, etc.
 * ```
 */
export function useCompanyFormUpdate() {
  // Access form context - FinalContractData (Single FormProvider pattern)
  const { getValues, reset, setValue, formState } =
    useFormContext<FinalContractData>();

  /**
   * Update company form with API data
   *
   * ✅ STABLE CALLBACK: Memoized for React.memo compatibility
   *
   * **React Hook Form Stability:**
   * Functions from useFormContext (getValues, reset, setValue, formState) are
   * guaranteed stable references by RHF. Including them in deps is safe and
   * explicit, though they won't cause re-renders due to their stability.
   *
   * @param companyData - Company data from API
   * @param options - Update behavior options
   */
  const updateCompanyData = useCallback(
    (companyData: CompanyData, options?: FormUpdateOptions) => {
      updateFormWithCompanyData(
        companyData,
        { getValues, reset, setValue, formState },
        options
      );
    },
    [getValues, reset, setValue, formState]
  );

  return { updateCompanyData };
}
