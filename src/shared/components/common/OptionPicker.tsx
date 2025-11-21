import React, { useCallback } from 'react';

import { useKeyboardNavigation } from '@/shared/hooks';

/**
 * Generic option interface - requires id and title
 * @template TId - The type of the option ID (defaults to string for backward compatibility)
 */
export interface Option<TId extends string = string> {
  id: TId;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; // React component type
}

/**
 * Props for the individual option render function
 */
export interface OptionRenderProps<T extends Option<string>> {
  option: T;
  isSelected: boolean;
  onSelect: (id: T['id']) => void;
  position: number;
  isFirstOption: boolean;
  refCallback?: (element: HTMLElement | null) => void;
}

/**
 * Props for the OptionPicker component
 */
export interface OptionPickerProps<T extends Option<string>> {
  // Data
  options: T[];
  value: T['id'] | null;
  onChange: (value: T['id'] | null) => void;

  // Rendering
  renderOption: (props: OptionRenderProps<T>) => React.ReactNode;

  // Accessibility
  'aria-label': string;
  selectionAnnouncementTemplate?: (option: T | null) => string;

  // Layout
  gridClassName?: string;

  // Behavior
  allowDeselection?: boolean; // Whether clicking selected option deselects it
  isDisabled?: boolean; // Generic disable functionality (replaces modal-specific logic)
}

/**
 * ✅ REFACTORED: Generic OptionPicker component with clean separation of concerns
 *
 * FEATURES:
 * - Pure option selection logic without modal coupling
 * - Generic disable functionality via isDisabled prop
 * - Keyboard navigation support (useKeyboardNavigation)
 * - Flexible and reusable across different contexts
 * - Memoized to prevent unnecessary re-renders
 * - Type-safe ID handling - no type casts needed!
 *
 * Parent components are responsible for their own state management (modals, etc.)!
 */
function OptionPickerComponent<T extends Option<string>>({
  options,
  value,
  onChange,
  renderOption,
  'aria-label': ariaLabel,
  selectionAnnouncementTemplate = option =>
    option?.title ? `Wybrano: ${option.title}` : 'Nie wybrano opcji',
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 xl:gap-4',
  allowDeselection = false,
  isDisabled = false,
}: OptionPickerProps<T>) {
  // Toggle option function with deselection support
  const toggleOption = useCallback(
    (optionId: T['id']) => {
      if (isDisabled) return; // Don't allow selection when disabled

      if (value === optionId && allowDeselection) {
        // Deselect if same option is clicked and deselection is allowed
        onChange(null);
      } else {
        // Select new option
        onChange(optionId);
      }
    },
    [value, onChange, allowDeselection, isDisabled]
  );

  // ✅ GENERIC: Keyboard navigation with generic disable support
  const { handleKeyDown, optionRefCallbacks } = useKeyboardNavigation({
    options,
    selectedValue: value ?? '',
    onSelect: toggleOption,
    isDisabled,
  });

  // Memoize the option select handler
  const handleOptionSelect = useCallback(
    (optionId: string) => {
      if (isDisabled) return;
      toggleOption(optionId);
    },
    [isDisabled, toggleOption]
  );

  // Get current selection for aria-live announcements
  const selectedOption = options.find(option => option.id === value);
  const selectionAnnouncement = selectionAnnouncementTemplate(
    selectedOption ?? null
  );

  return (
    <>
      {/* Aria-live region for selection announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selectionAnnouncement}
      </div>

      <div
        className={gridClassName}
        role="radiogroup"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {options.map((option, index) =>
          renderOption({
            option,
            isSelected: value === option.id,
            onSelect: handleOptionSelect,
            position: index + 1,
            isFirstOption: index === 0,
            refCallback: optionRefCallbacks[option.id],
          })
        )}
      </div>
    </>
  );
}

/**
 * Memoized OptionPicker component to prevent unnecessary re-renders
 * Re-renders only when props actually change
 */
export const OptionPicker = React.memo(
  OptionPickerComponent
) as typeof OptionPickerComponent;
