/**
 * Company Validation State Store (Zustand)
 *
 * Manages explicit validation state for company data, decoupled from React Query cache.
 *
 * ## ARCHITECTURAL DECISION: EXPLICIT VALIDATION STATE
 *
 * This store separates validation state from data fetching infrastructure.
 * Previously, validation logic queried React Query cache to infer validation state.
 * Now, validation decisions are explicitly captured and stored.
 *
 * **Why separate from cache?**
 * - Validation state has different lifecycle than cached data
 * - Cache can be garbage collected, but validation decision should persist (within session)
 * - Enables changing data layer (React Query → RTK Query) without touching validation
 * - Explicit state is easier to test and debug
 *
 * ## STATE SHAPE
 *
 * ```ts
 * {
 *   nip: string | null              // NIP being validated
 *   status: ValidationStatus        // Validation decision
 *   reason: ValidationReason | null // Why validation passed/failed
 *   validatedAt: number | null      // Timestamp of validation
 * }
 * ```
 *
 * ## LIFECYCLE
 *
 * 1. **Initial**: `status: 'not-validated'`
 * 2. **After successful fetch**: `status: 'approved'` (if active) or `status: 'rejected'` (if inactive)
 * 3. **On userType change**: Cleared via `clear()`
 * 4. **On session end**: Cleared (sessionStorage)
 *
 * ## USAGE
 *
 * ```ts
 * // In useCompanyQuery (onSuccess callback)
 * const { setApproved, setRejected } = useCompanyValidationStore();
 * if (data.isActive) {
 *   setApproved(nip);
 * } else {
 *   setRejected(nip, 'inactive');
 * }
 *
 * // In useCompanyStatusValidation
 * const validationState = useCompanyValidationStore();
 * return validateCompanyStatus(userType, nip, validationState);
 *
 * // In cleanup hooks
 * const { clear } = useCompanyValidationStore();
 * clear(); // On userType change
 * ```
 *
 * ## COMPARISON WITH useFormPersistStore
 *
 * - **useFormPersistStore**: Persists form data (user input)
 * - **useCompanyValidationStore**: Persists validation decisions (system state)
 * - Both use sessionStorage, but serve different concerns
 * - Validation store is ~80 lines (similar size to form persist store)
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Validation status values
 *
 * - `not-validated`: Initial state, no validation performed yet
 * - `approved`: Company validated and approved for submission (active status)
 * - `rejected`: Company validated but rejected for submission (inactive or other issues)
 */
export type ValidationStatus = 'not-validated' | 'approved' | 'rejected';

/**
 * Validation reason codes
 *
 * - `active`: Company is active (approved)
 * - `inactive`: Company is inactive (rejected)
 * - `not-fetched`: Company data was never fetched (rejected)
 */
export type ValidationReason = 'active' | 'inactive' | 'not-fetched';

/**
 * Company validation state shape
 */
export interface CompanyValidationState {
  /** NIP number of the company being validated (null if no validation) */
  nip: string | null;

  /** Current validation status */
  status: ValidationStatus;

  /** Reason for validation status (for debugging and user feedback) */
  reason: ValidationReason | null;

  /** Timestamp when validation was performed (Date.now()) */
  validatedAt: number | null;
}

/**
 * Store actions for managing validation state
 */
interface CompanyValidationActions {
  /**
   * Mark company as approved for submission (active status)
   *
   * Called when company data is successfully fetched and company is active.
   *
   * @param nip - Company NIP number
   */
  setApproved: (nip: string) => void;

  /**
   * Mark company as rejected for submission (inactive status)
   *
   * Called when company data is fetched but company is inactive.
   *
   * @param nip - Company NIP number
   * @param reason - Reason for rejection (currently only 'inactive')
   */
  setRejected: (nip: string, reason: 'inactive') => void;

  /**
   * Mark company as not validated
   *
   * Used when user hasn't triggered fetch yet, or when we want to force re-validation.
   *
   * @param nip - Company NIP number
   */
  setNotValidated: (nip: string) => void;

  /**
   * Clear all validation state
   *
   * Used when:
   * - User type changes (company → consumer)
   * - Form is reset
   * - Session needs to be cleared
   */
  clear: () => void;
}

/**
 * Complete store interface
 */
type CompanyValidationStore = CompanyValidationState & CompanyValidationActions;

/**
 * Initial validation state
 */
const initialState: CompanyValidationState = {
  nip: null,
  status: 'not-validated',
  reason: null,
  validatedAt: null,
};

/**
 * Company Validation Zustand Store
 *
 * Explicit validation state management, decoupled from React Query cache.
 * Automatically synced to sessionStorage for persistence across navigation.
 *
 * Storage key: 'company-validation-state' in sessionStorage
 */
export const useCompanyValidationStore = create<CompanyValidationStore>()(
  persist(
    set => ({
      // Initial state
      ...initialState,

      // Mark company as approved (active status)
      setApproved: (nip: string) => {
        set({
          nip,
          status: 'approved',
          reason: 'active',
          validatedAt: Date.now(),
        });
      },

      // Mark company as rejected (inactive status)
      setRejected: (nip: string, reason: 'inactive') => {
        set({
          nip,
          status: 'rejected',
          reason,
          validatedAt: Date.now(),
        });
      },

      // Mark company as not validated
      setNotValidated: (nip: string) => {
        set({
          nip,
          status: 'not-validated',
          reason: 'not-fetched',
          validatedAt: Date.now(),
        });
      },

      // Clear all validation state
      clear: () => {
        set(initialState);
      },
    }),
    {
      name: 'company-validation-state', // sessionStorage key
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

/**
 * Selectors for accessing validation state
 */
export const selectValidationStatus = (state: CompanyValidationStore) =>
  state.status;
export const selectValidationNip = (state: CompanyValidationStore) => state.nip;
export const selectValidationReason = (state: CompanyValidationStore) =>
  state.reason;
