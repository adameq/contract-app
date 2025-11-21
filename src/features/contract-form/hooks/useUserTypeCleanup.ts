/**
 * useUserTypeCleanup Hook
 *
 * Centralizes cleanup logic when userType changes.
 *
 * ## Responsibilities
 *
 * When userType changes (e.g., company → consumer), this hook:
 *
 * 1. **React Hook Form**: Atomically resets form state to match new schema
 * 2. **Persistence**: Immediately saves cleaned data to sessionStorage
 * 3. **React Query**: Clears cached API data (GUS, VAT status)
 * 4. **Validation**: Clears company validation state
 *
 * Works in tandem with key-based component remounting for full cleanup.
 *
 * ## Usage
 *
 * ```typescript
 * const methods = useForm<FinalContractData>({...});
 * const userType = methods.watch('userType');
 * useUserTypeCleanup(userType, methods);
 * ```
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { queryKeyMatchers } from '@/shared/constants/queryKeys';
import { usePrevious } from '@/shared/hooks';

import type { FinalContractData } from '../schema/companySchemas';
import { type FormUserType } from '../schema/sharedSchema';
import { useCompanyValidationStore } from '../store/useCompanyValidationStore';
import { useFormPersistStore } from '../store/useFormPersistStore';
import { buildCleanedFormData } from '../utils/formDataHelpers';

/**
 * Cleanup hook triggered when userType changes
 *
 * @param userType - Current userType from form
 * @param methods - RHF methods for field manipulation
 */
export function useUserTypeCleanup(
  userType: FormUserType,
  methods: UseFormReturn<FinalContractData>
): void {
  const queryClient = useQueryClient();
  const prevUserType = usePrevious(userType);
  const { saveForm } = useFormPersistStore();
  const { clear: clearValidationState } = useCompanyValidationStore();

  // Standard useEffect for cleanup side effects
  //
  // LIFECYCLE CLARIFICATION:
  // - useEffect runs ASYNCHRONOUSLY after commit phase (after DOM updates)
  // - Child components have already rendered and registered their fields
  // - Component remounting (via key prop in parent) forces field re-registration
  //
  // CLEANUP MECHANISM:
  // 1. userType changes → key prop changes in parent component
  // 2. Key change → React unmounts old components → auto-unregisters old fields
  // 3. useEffect runs → resets form state + clears cache
  // 4. React mounts new components → registers new fields
  //
  // NOTE: The primary fix for "uncontrolled to controlled" warning is explicit
  // defaultValue prop in FieldRenderer.tsx. This hook ensures form state and
  // cache stay synchronized with userType changes.
  useEffect(() => {
    // Skip on initial mount (no previous type) or when type hasn't changed
    if (!prevUserType || prevUserType === userType) {
      return;
    }

    // ============================================================================
    // CLEANUP PHASE 1: Construct Cleaned Form Data
    // ============================================================================

    // Get current form data (preserves user input for other fields)
    const currentFormData = methods.getValues();

    // OPTIMIZATION: Use helper function with structuredClone
    // Replaces manual deep merge (75 lines → 1 line)
    // Uses structuredClone when available (faster than manual spread)
    const cleanedFormData = buildCleanedFormData(currentFormData, userType);

    // ============================================================================
    // CLEANUP PHASE 2: React Hook Form - Atomic Reset
    // ============================================================================

    // Single atomic reset - RHF handles all cleanup internally
    //
    // Why single reset() is sufficient:
    // - Component unmounting (via key prop) auto-unregisters old fields
    // - reset() with keepValues: false replaces entire form state
    // - reset() with keepDefaultValues: false updates _defaultValues
    // - No manual unregister needed - trust RHF to handle field cleanup
    //
    // NOTE: The primary fix for "uncontrolled to controlled" warning is in
    // FieldRenderer.tsx (explicit defaultValue prop). This reset ensures
    // form state matches new userType schema.

    methods.reset(cleanedFormData, {
      keepDefaultValues: false, // Update _defaultValues to match new schema
      keepValues: false, // Replace ALL values with cleanedFormData
    });

    // ============================================================================
    // CLEANUP PHASE 3: Persistence Store Sync
    // ============================================================================

    // Save cleaned data to sessionStorage immediately
    //
    // NOTE: Direct store calls are always immediate/synchronous.
    // This bypasses the useFormPersistence hook's debounce (500ms) by calling
    // the store directly, preventing race conditions where stale data could be
    // restored before cleanup completes.
    saveForm(cleanedFormData);

    // ============================================================================
    // CLEANUP PHASE 4: React Query Cache
    // ============================================================================

    // Clear cached API data when leaving userTypes that fetched it
    if (prevUserType === 'company') {
      queryClient.removeQueries({
        predicate: query => queryKeyMatchers.isCompanyQuery(query.queryKey),
      });
    }

    if (prevUserType === 'company' || prevUserType === 'consumer-vat') {
      queryClient.removeQueries({
        predicate: query => queryKeyMatchers.isVatStatusQuery(query.queryKey),
      });
    }

    // ============================================================================
    // CLEANUP PHASE 5: Company Validation State
    // ============================================================================

    // Clear validation state when leaving 'company' type
    // Forces re-validation if user returns to company userType
    if (prevUserType === 'company') {
      clearValidationState();
    }
  }, [
    userType,
    prevUserType,
    methods,
    queryClient,
    saveForm,
    clearValidationState,
  ]);
}
