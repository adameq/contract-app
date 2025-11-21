/**
 * Custom hook for managing PESEL field toggle behavior
 *
 * ARCHITECTURE DECISIONS:
 *
 * 1. Separation of Concerns:
 *    - Extracts business logic from UI components
 *    - UI components remain pure and focused on presentation
 *    - Business logic is testable and reusable
 *
 * 2. Single Responsibility:
 *    - This hook has one job: manage PESEL field state when toggling "without PESEL"
 *    - Clear PESEL when user doesn't have one
 *    - Trigger validation when PESEL becomes required again
 *
 * 3. Hook Composition:
 *    - Uses React Hook Form's primitives (setValue, trigger)
 *    - Returns a handler function that encapsulates the business logic
 *    - Maintains type safety with ContractFormData
 *
 * 4. Why not useEffect:
 *    - Event-driven approach is more predictable than effect-based
 *    - No risk of effect dependency loops
 *    - User action directly triggers the logic
 *    - More explicit and easier to trace
 */

import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import type { SharedFormData } from '../schema/sharedSchema';
import { FORM_PATHS } from '../utils/formPaths';

/**
 * Hook for managing PESEL field behavior when toggling "without PESEL" checkbox
 *
 * @returns Object containing:
 * - handleWithoutPeselChange: Handler for checkbox change events
 *
 * @example
 * ```tsx
 * function SignatoryDataSection() {
 *   const { handleWithoutPeselChange } = usePeselToggle();
 *
 *   return (
 *     <Checkbox
 *       onCheckedChange={handleWithoutPeselChange}
 *       // ... other props
 *     />
 *   );
 * }
 * ```
 */
export function usePeselToggle() {
  const { setValue, trigger, clearErrors } = useFormContext<SharedFormData>();

  /**
   * Handles the "without PESEL" checkbox change
   *
   * Business logic:
   * - Updates checkbox state in form
   * - When checked (user has no PESEL): Clear the PESEL field and any errors
   * - When unchecked (user has PESEL): Trigger validation for required PESEL
   *
   * This consolidates ALL state management for the PESEL toggle in one place,
   * preventing duplicate setValue calls and timing issues.
   *
   * ✅ STABLE CALLBACK: Memoized for React.memo compatibility
   *
   * **React Hook Form Stability:**
   * Functions from useFormContext (setValue, trigger, clearErrors) are
   * guaranteed stable references by RHF. Including them in deps is safe and
   * explicit, though they won't cause re-renders due to their stability.
   *
   * Following React best practices by including all external dependencies,
   * making the code future-proof and consistent with other hooks in the codebase.
   */
  const handleWithoutPeselChange = useCallback(
    (checked: boolean) => {
      // First, update the checkbox state
      setValue(FORM_PATHS.PERSONAL_DATA.WITHOUT_PESEL, checked);

      if (checked) {
        // User indicates they don't have PESEL
        // Clear the field to prevent stale/invalid data
        setValue(FORM_PATHS.PERSONAL_DATA.PESEL, '');
        // Clear any validation errors since field is now optional
        clearErrors(FORM_PATHS.PERSONAL_DATA.PESEL);
      } else {
        // User indicates they have PESEL
        // Trigger validation since the field is now required
        // Using void operator to handle the promise properly
        void trigger(FORM_PATHS.PERSONAL_DATA.PESEL);
      }
    },
    [setValue, trigger, clearErrors]
  );

  return {
    handleWithoutPeselChange,
  };
}
