import { useCallback, useMemo, useRef } from 'react';

// Generic interface for options - requires only id property
interface OptionWithId {
  id: string;
}

interface UseKeyboardNavigationProps<T extends OptionWithId> {
  options: T[];
  selectedValue: string;
  onSelect: (id: string) => void;
  isDisabled?: boolean;
}

/**
 * Custom hook for handling keyboard navigation in option lists
 * Uses refs for proper React-based DOM manipulation instead of document.querySelector
 * Supports arrow keys, Home, End navigation with accessibility compliance
 *
 * @template T - Option type that extends OptionWithId (must have id property)
 */
export function useKeyboardNavigation<T extends OptionWithId>({
  options,
  selectedValue,
  onSelect,
  isDisabled = false,
}: UseKeyboardNavigationProps<T>) {
  // Map of option IDs to their DOM element refs
  const optionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Function to register an option's ref
  const registerOption = useCallback(
    (optionId: string, element: HTMLElement | null) => {
      if (element) {
        optionRefs.current.set(optionId, element);
      } else {
        optionRefs.current.delete(optionId);
      }
    },
    []
  );

  // Function to focus a specific option by ID
  const focusOption = useCallback((optionId: string) => {
    const element = optionRefs.current.get(optionId);
    if (element) {
      element.focus();
    }
  }, []);

  // Create refs map for each option (memoized for performance)
  const optionRefCallbacks = useMemo(() => {
    return options.reduce(
      (acc, option) => {
        acc[option.id] = (element: HTMLElement | null) => {
          registerOption(option.id, element);
        };
        return acc;
      },
      {} as Record<string, (element: HTMLElement | null) => void>
    );
  }, [options, registerOption]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Prevent keyboard navigation when disabled
      if (isDisabled ?? options.length === 0) {
        return;
      }

      const currentIndex = options.findIndex(opt => opt.id === selectedValue);
      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex =
            currentIndex === -1 ? 0 : (currentIndex + 1) % options.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex =
            currentIndex === -1
              ? 0
              : (currentIndex - 1 + options.length) % options.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = options.length - 1;
          break;
        case 'Enter':
        case ' ':
          // Activation: re-select currently selected option (idempotent)
          // With roving tabindex, only selected option is focusable,
          // so Enter/Space will always be on the selected option
          e.preventDefault();
          if (selectedValue && currentIndex !== -1) {
            onSelect(selectedValue);
          }
          return;
        default:
          return;
      }

      if (nextIndex !== currentIndex && options[nextIndex]) {
        const nextOptionId = options[nextIndex].id;
        onSelect(nextOptionId);
        // Focus the newly selected option using ref instead of querySelector
        focusOption(nextOptionId);
      }
    },
    [options, selectedValue, onSelect, isDisabled, focusOption]
  );

  return {
    handleKeyDown,
    focusOption,
    optionRefCallbacks,
  };
}
