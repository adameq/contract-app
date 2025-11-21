/**
 * useFormPersistence Hook
 *
 * Handles bidirectional sync between React Hook Form state and persistence store.
 * Provides auto-save on changes and restore on mount.
 *
 * ## ARCHITECTURE
 *
 * In the new Single FormProvider architecture:
 * - RHF owns all form state (single source of truth)
 * - Zustand provides persistence only (sessionStorage adapter)
 * - This hook bridges the two: RHF ↔ Zustand ↔ sessionStorage
 *
 * ## FLOW
 *
 * **On Mount:**
 * 1. Check Zustand store for saved data
 * 2. If found, reset RHF with saved data
 * 3. Form state restored from previous session
 *
 * **During Editing:**
 * 1. RHF state changes (user types in fields)
 * 2. Hook watches changes via `watch` callback
 * 3. Debounces (500ms default)
 * 4. Saves to Zustand store
 * 5. Zustand persist middleware saves to sessionStorage
 *
 * **On Tab Close (beforeunload):**
 * 1. Emergency save triggers immediately
 * 2. Bypasses debounce to prevent data loss
 * 3. Ensures changes are persisted even if user closes tab quickly
 *
 * **On Unmount:**
 * 1. Cleanup debounce timer
 * 2. Unsubscribe from watch
 * 3. Remove beforeunload listener
 * 4. Data remains in storage for next mount
 *
 * ## COMPARISON TO OLD ARCHITECTURE
 *
 * **Old (Separate FormProviders):**
 * - useFormAutoSave in main form (SharedFormData)
 * - useFormStateSync in each sub-form (CompanyFormData, etc.)
 * - Manual coordination between multiple save points
 * - Complex selector patterns
 *
 * **New (Single FormProvider):**
 * - Single useFormPersistence in layout
 * - Saves complete FinalContractData
 * - No coordination needed
 * - Simple direct save
 *
 * ## USAGE
 *
 * ```typescript
 * function FormStepLayoutV2() {
 *   const methods = useForm<FinalContractData>({...});
 *
 *   // Single hook call handles all persistence
 *   useFormPersistence(methods.watch, methods.reset);
 *
 *   return <FormProvider {...methods}>...</FormProvider>;
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import type { UseFormReset, UseFormWatch } from 'react-hook-form';

import type { FinalContractData } from '../schema/companySchemas';
import { useFormPersistStore } from '../store/useFormPersistStore';
import { shallowCompareFormData } from '../utils/formDataHelpers';

/**
 * Hook for auto-save and restore of complete form data
 *
 * Manages bidirectional sync between RHF and persistence store:
 * - Restores saved data on mount
 * - Auto-saves changes during editing (debounced for performance)
 * - Emergency save on tab close (beforeunload) to prevent data loss
 * - Cleans up on unmount
 *
 * ## DATA LOSS PREVENTION
 *
 * Two-layer save strategy:
 * 1. **Debounced save** (500ms) - Normal UX, reduces storage writes
 * 2. **Emergency save** (beforeunload) - Failsafe when tab closes
 *
 * This ensures no data is lost even if user closes tab immediately after typing.
 *
 * @param watch - RHF watch function for subscribing to changes
 * @param reset - RHF reset function for restoring saved data
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 *
 * @example
 * ```typescript
 * const methods = useForm<FinalContractData>({...});
 * useFormPersistence(methods.watch, methods.reset, 500);
 * ```
 */
export function useFormPersistence(
  watch: UseFormWatch<FinalContractData>,
  reset: UseFormReset<FinalContractData>,
  delay = 500 // Balance between performance and data loss prevention
): void {
  // Access persistence store actions
  const { saveForm, formData: savedData } = useFormPersistStore();

  // Ref to track last saved data for comparison
  // Using ref instead of closure variable for stable reference
  const lastSavedDataRef = useRef<FinalContractData | null>(null);

  // Ref to track whether initial data restoration has occurred
  // Ensures restoration happens exactly once while satisfying exhaustive-deps
  const hasRestoredRef = useRef(false);

  // Restore saved data on mount
  useEffect(() => {
    if (savedData && !hasRestoredRef.current) {
      // Reset form with saved data
      // This triggers validation and updates all field states
      reset(savedData);
      hasRestoredRef.current = true;
    }
  }, [savedData, reset]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // Subscribe to all form changes
    const subscription = watch(data => {
      // Clear pending save
      clearTimeout(timeoutId);

      // Schedule new save with debounce
      timeoutId = setTimeout(() => {
        const currentData = data as FinalContractData;

        // OPTIMIZATION 1: Shallow comparison before stringify
        // Check primitive fields first (fast) - avoids expensive stringify
        if (shallowCompareFormData(lastSavedDataRef.current, currentData)) {
          // Primitives match, do full comparison with stringify
          const currentSerialized = JSON.stringify(currentData);
          const lastSerialized = lastSavedDataRef.current
            ? JSON.stringify(lastSavedDataRef.current)
            : null;

          if (currentSerialized === lastSerialized) {
            // Data unchanged, skip save
            return;
          }
        }

        // OPTIMIZATION 2: Direct save without requestIdleCallback
        // requestIdleCallback adds overhead for large serialization
        // Better to just do it after debounce (already deferred)
        lastSavedDataRef.current = currentData;
        saveForm(currentData);
      }, delay);
    });

    // Cleanup: cancel pending save and unsubscribe
    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [watch, saveForm, delay]);

  // Emergency save on tab close (beforeunload)
  // Prevents data loss if user closes tab during debounce window
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Get current form data directly from watch
      const currentData = watch();

      // Force immediate save without comparison
      // We accept redundant saves to ensure no data loss
      saveForm(currentData);
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [watch, saveForm]);
}
