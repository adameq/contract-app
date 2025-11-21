/**
 * useTheme Hook
 *
 * Provides access to theme state and controls.
 * Must be used within ThemeProvider.
 *
 * REACT 19: Uses the new `use()` hook for consuming context.
 * The `use()` hook automatically throws if context is undefined,
 * providing better ergonomics than useContext.
 *
 * @returns Theme context with current theme and setter functions
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <button onClick={() => setTheme('dark')}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * ```
 */

import { use } from 'react';

import { ThemeContext } from '../contexts/ThemeContext';

export function useTheme() {
  const context = use(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
