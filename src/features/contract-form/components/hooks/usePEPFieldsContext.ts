/**
 * Hook for accessing PEP fields context
 *
 * Provides access to PEP fields visibility state, allowing child components
 * to optimize performance by skipping expensive operations when fields are hidden.
 *
 * This hook is extracted to a separate file to support Fast Refresh.
 * Fast Refresh only works when files export components only - exporting hooks
 * alongside components breaks Hot Module Replacement.
 *
 * REACT 19: Uses the new `use()` hook for consuming context.
 *
 * @see PEPQuestion.tsx for the context provider
 */

import { createContext, use } from 'react';

/**
 * Context value for PEP fields
 */
export interface PEPFieldsContextValue {
  /** Whether the PEP fields are currently hidden (when user selected "NIE") */
  isHidden: boolean;
}

/**
 * Context for PEP fields to access hidden state
 *
 * This allows child components to optimize performance by skipping
 * expensive operations (effects, API calls, etc.) when fields are hidden.
 *
 * @example
 * ```tsx
 * function CustomPEPField() {
 *   const { isHidden } = usePEPFieldsContext();
 *
 *   useEffect(() => {
 *     if (isHidden) return; // Skip expensive operations when hidden
 *     // ... fetch data, subscribe, etc.
 *   }, [isHidden]);
 * }
 * ```
 */
export const PEPFieldsContext = createContext<PEPFieldsContextValue | null>(
  null
);

/**
 * Hook to access PEP fields context
 *
 * REACT 19: Uses `use()` hook instead of `useContext()` for better ergonomics.
 *
 * Returns `{ isHidden: false }` if used outside PEPQuestion context.
 * This ensures components work correctly even when not wrapped in PEPQuestion.
 *
 * @returns Context value with isHidden flag
 *
 * @example
 * ```tsx
 * function MyPEPField() {
 *   const { isHidden } = usePEPFieldsContext();
 *
 *   if (isHidden) {
 *     return null; // or skip expensive operations
 *   }
 *
 *   return <div>PEP field content</div>;
 * }
 * ```
 */
export function usePEPFieldsContext(): PEPFieldsContextValue {
  const context = use(PEPFieldsContext);
  return context ?? { isHidden: false };
}
