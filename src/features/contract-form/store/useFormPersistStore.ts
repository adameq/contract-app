/**
 * Form Persistence Store (Zustand V2)
 *
 * Simplified persistence layer for the new Single FormProvider architecture.
 * Stores complete FinalContractData without splitting by userType.
 *
 * ## SINGLE CONCERN: PERSISTENCE
 *
 * This store has ONE responsibility: persist and restore complete form data.
 * It does NOT store:
 * - ❌ Validation state (RHF owns this)
 * - ❌ Server errors (RHF handles directly)
 * - ❌ Sub-form slices (complete data only)
 *
 * ## ARCHITECTURE BENEFITS
 *
 * Compared to old useCompanyFormStore (460 lines):
 * - ✅ 83% smaller (~80 lines vs 460 lines)
 * - ✅ Single concern (persistence only)
 * - ✅ No selectors (direct access)
 * - ✅ No validation sync
 * - ✅ No error propagation
 * - ✅ No memoization requirements
 *
 * ## USAGE
 *
 * ```typescript
 * // Save immediately (used by multiple hooks)
 * const { saveForm } = useFormPersistStore();
 * saveForm(formData); // Always immediate/synchronous
 *
 * // Restore (in useFormInitialization hook)
 * const { restoreForm } = useFormPersistStore();
 * const savedData = restoreForm();
 *
 * // Clear (on reset/submit)
 * const { clearForm } = useFormPersistStore();
 * clearForm();
 *
 * // NOTE: Debouncing happens at the HOOK level, not here:
 * // - useFormPersistence: debounced auto-save (500ms)
 * // - useUserTypeCleanup: immediate save (no debounce)
 * // - useFormSubmission: immediate save (no debounce)
 * ```
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PipedrivePersonData } from '@/shared/api/pipedrive.types';

import type { FinalContractData } from '../schema/companySchemas';

/**
 * Store state shape - minimal, single concern
 */
interface FormPersistState {
  /** Complete form data (discriminated union by userType) */
  formData: FinalContractData | null;

  /**
   * Save complete form data to store (persists to sessionStorage)
   *
   * IMPORTANT: This method is ALWAYS immediate/synchronous.
   * It writes directly to the Zustand store, which then persists to sessionStorage.
   *
   * Debouncing (if needed) is the responsibility of the CALLING layer:
   * - useFormPersistence: Calls saveForm() after 500ms debounce (for auto-save)
   * - useUserTypeCleanup: Calls saveForm() directly (for immediate cleanup)
   * - useFormSubmission: Calls saveForm() directly (before API call)
   *
   * This design keeps the store simple and moves timing concerns to the hooks.
   */
  saveForm: (data: FinalContractData) => void;

  /** Restore form data from store (loads from sessionStorage) */
  restoreForm: () => FinalContractData | null;

  /** Clear all form data from store and sessionStorage */
  clearForm: () => void;

  // Pipedrive integration state
  /** Pipedrive Person ID from URL (?pid=...) */
  pipedrivePersonId: string | null;
  /** Form option from URL (?option=...) */
  pipedriveOption: string | null;
  /** Creation date from URL (?created=...) used for validation */
  pipedriveCreated: string | null;
  /** Person data from validated Pipedrive response */
  pipedrivePersonData: PipedrivePersonData | null;

  /**
   * Save Pipedrive validation data
   * Called after successful PID validation
   */
  setPipedriveData: (data: {
    pid: string;
    option: string;
    created: string;
    personData: PipedrivePersonData;
  }) => void;

  /** Clear Pipedrive data (e.g., on form reset or logout) */
  clearPipedriveData: () => void;
}

/**
 * Form Persistence Zustand Store
 *
 * Simple persistence adapter for React Hook Form state.
 * Automatically syncs to sessionStorage via persist middleware.
 *
 * Storage key: 'contract-form-persist' in sessionStorage
 */
export const useFormPersistStore = create<FormPersistState>()(
  persist(
    (set, get) => ({
      // Initial state - Form data
      formData: null,

      // Save complete form data (always immediate/synchronous)
      saveForm: (data: FinalContractData) => {
        set({ formData: data });
      },

      // Restore form data (for hook convenience)
      // Note: Consumers can also use useFormPersistStore(state => state.formData)
      restoreForm: () => {
        return get().formData;
      },

      // Clear all data
      clearForm: () => {
        set({ formData: null });
      },

      // Initial state - Pipedrive data
      pipedrivePersonId: null,
      pipedriveOption: null,
      pipedriveCreated: null,
      pipedrivePersonData: null,

      // Save Pipedrive validation data
      setPipedriveData: (data) => {
        set({
          pipedrivePersonId: data.pid,
          pipedriveOption: data.option,
          pipedriveCreated: data.created,
          pipedrivePersonData: data.personData,
        });
      },

      // Clear Pipedrive data
      clearPipedriveData: () => {
        set({
          pipedrivePersonId: null,
          pipedriveOption: null,
          pipedriveCreated: null,
          pipedrivePersonData: null,
        });
      },
    }),
    {
      name: 'contract-form-persist', // sessionStorage key
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

/**
 * Direct selector for form data (if needed)
 * Most hooks will just use: useFormPersistStore(state => state.formData)
 */
export const selectFormData = (state: FormPersistState) => state.formData;
