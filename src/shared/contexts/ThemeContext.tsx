/**
 * Theme Context
 *
 * Provides theme management functionality across the application.
 * Handles theme state, localStorage persistence, and cross-tab synchronization.
 *
 * ARCHITECTURE:
 * - Single source of truth for theme state
 * - Encapsulates all theme logic (storage, DOM updates, events)
 * - Consumed via useTheme hook for type safety
 *
 * INITIAL THEME LOADING:
 * - index.html script sets initial theme before React loads (prevents flicker)
 * - This context reads the current state from DOM on mount
 * - No duplication of logic - index.html handles SSR, context handles runtime
 */

import { createContext, useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  /** Current theme */
  theme: Theme;
  /** Set theme (updates DOM and localStorage) */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
}

/**
 * Theme context - use via useTheme hook
 */
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

/**
 * Theme Provider Component
 *
 * Wraps the app and provides theme functionality to all children.
 * Manages theme state, localStorage, and cross-tab synchronization.
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from DOM (set by index.html script)
  // This ensures no flickering and respects user's saved preference
  const [theme, setThemeState] = useState<Theme>(() => {
    // SSR fallback
    if (typeof window === 'undefined') return 'light';

    // Check what's already set by index.html script
    return document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
  });

  /**
   * Update theme in DOM
   * Internal helper - not exposed to consumers
   */
  const updateThemeDOM = useCallback((newTheme: Theme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setThemeState(newTheme);
  }, []);

  /**
   * Set theme (public API)
   * Updates state, DOM, and localStorage
   */
  const setTheme = useCallback(
    (newTheme: Theme) => {
      updateThemeDOM(newTheme);
      localStorage.setItem('theme', newTheme);
    },
    [updateThemeDOM]
  );

  /**
   * Toggle theme helper
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  /**
   * Cross-tab synchronization
   * Listen for theme changes in other tabs/windows
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'theme' && event.newValue) {
        const newTheme = event.newValue as Theme;
        // Update DOM only - no localStorage write (change came from another tab)
        updateThemeDOM(newTheme);
      }
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateThemeDOM]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
