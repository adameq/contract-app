/**
 * Theme Toggle Component
 *
 * Pure presentation component for toggling between light and dark themes.
 * All theme logic is handled by ThemeContext/useTheme hook.
 *
 * ARCHITECTURE:
 * - Purely presentational (no business logic)
 * - Uses useTheme hook for theme state and controls
 * - Simple switch UI with sun/moon icons
 */

import { Moon, Sun } from 'lucide-react';

import { Switch } from '@/shared/components/ui/switch';
import { useTheme } from '@/shared/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={checked => {
          setTheme(checked ? 'dark' : 'light');
        }}
        aria-label={`Przełącz na motyw ${theme === 'light' ? 'ciemny' : 'jasny'}`}
        className="cursor-pointer"
      />
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
