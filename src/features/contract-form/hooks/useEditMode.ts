/**
 * Edit Mode State Management Hook
 *
 * Manages only edit mode state. Form update logic has been moved to component level
 * for better separation of concerns and reduced complexity.
 *
 * Simplification benefits:
 * - ✅ Reduced boilerplate (no useReducer, no refs, no useLayoutEffect)
 * - ✅ Clearer separation of concerns (state vs form logic)
 * - ✅ Easier to understand and maintain
 * - ✅ Still provides stable references with useCallback
 */

import { useCallback, useMemo, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Simplified state shape - only edit mode
 */
interface EditModeState {
  /** Whether user is in edit mode */
  isEditMode: boolean;
}

/**
 * Simple actions for state management
 */
interface EditModeActions {
  /** Enter edit mode for manual data editing */
  enterEditMode: () => void;
  /** Exit edit mode */
  exitEditMode: () => void;
}

/**
 * Hook options
 */
export interface UseEditModeOptions {
  /** Callback fired when entering edit mode */
  onEnterEditMode?: () => void;
}

/**
 * Hook return value
 */
export interface UseEditModeReturn {
  /** Current state */
  state: EditModeState;
  /** Stable action functions */
  actions: EditModeActions;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Edit Mode State Management Hook
 *
 * Only manages edit mode state. Form update logic is handled by the component.
 *
 * @param options - Optional callbacks for mode transitions
 *
 * @example
 * ```tsx
 * function MyFormSection() {
 *   const { state, actions } = useEditMode({
 *     onEnterEditMode: () => {
 *       // Update registrySignature field when entering edit mode
 *       setValue('company.registrySignature', 'Edytowane ręcznie');
 *     }
 *   });
 *
 *   // Form update logic is now in the component
 *   const handleRestoreData = useCallback(() => {
 *     if (data) {
 *       updateFormWithData(data, { getValues, reset }, {
 *         preserveUserEdits: false,
 *       });
 *       actions.exitEditMode();
 *     }
 *   }, [data, getValues, reset, actions.exitEditMode]);
 *
 *   return (
 *     <FormFields
 *       onEditRequest={actions.enterEditMode}
 *       onRestoreRequest={handleRestoreData}
 *     />
 *   );
 * }
 * ```
 */
export function useEditMode(options?: UseEditModeOptions): UseEditModeReturn {
  // Simple state management with useState
  const [isEditMode, setIsEditMode] = useState(false);

  // Stable action functions
  const enterEditMode = useCallback(() => {
    setIsEditMode(true);
    // Fire callback if provided
    options?.onEnterEditMode?.();
  }, [options]);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const state: EditModeState = {
    isEditMode,
  };

  // Memoize actions object to ensure stable reference
  // This enables React.memo optimization in child components
  // enterEditMode and exitEditMode are stable (from useCallback with empty deps)
  const actions: EditModeActions = useMemo(
    () => ({
      enterEditMode,
      exitEditMode,
    }),
    [enterEditMode, exitEditMode]
  );

  return {
    state,
    actions,
  };
}
