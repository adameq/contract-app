import { useCallback, useLayoutEffect, useRef } from 'react';

import { sanitizeNipInput } from '@/shared/lib/validation';

/**
 * Configuration for formatted input behavior
 *
 * @template TRaw - Type of the raw value (usually string)
 * @template TDisplay - Type of the display value (usually string)
 */
export interface FormattedInputConfig<TRaw = string, TDisplay = string> {
  /**
   * Function to format raw input for display
   * @param rawValue - Raw value from form state
   * @returns Formatted value for display in the input
   */
  format: (rawValue: TRaw) => TDisplay;

  /**
   * Function to parse formatted input to clean value
   * @param displayValue - User input (potentially formatted)
   * @returns Clean raw value for form state
   */
  parse: (displayValue: TDisplay) => TRaw;
  /** Maximum length of the formatted value */
  maxLength?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Input mode for mobile keyboards */
  inputMode?:
    | 'text'
    | 'numeric'
    | 'decimal'
    | 'tel'
    | 'search'
    | 'email'
    | 'url';
  /** Custom keyboard event filter */
  keyFilter?: (e: React.KeyboardEvent<HTMLInputElement>) => boolean;
  /** Custom cursor position calculation after formatting */
  calculateCursorPosition?: (
    oldValue: string,
    newValue: string,
    oldCursor: number,
    wasFormatted: boolean
  ) => number;
}

/**
 * Return type for useFormattedInput hook
 *
 * @template _TRaw - Type of the raw value (unused in interface, kept for type compatibility)
 * @template TDisplay - Type of the display value
 */
export interface FormattedInputProps<_TRaw = string, TDisplay = string> {
  /**
   * Formatted value for display in the input field (e.g., "12-345" for postal code)
   * Use this for the input's value prop to show formatted text to users
   */
  displayValue: TDisplay;

  /**
   * Change handler that emits the raw value to parent component
   * The emitted value is the parsed/cleaned value, not the formatted display value
   * Named consistently with standard React input components
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * ✅ **Reliable cursor positioning**: Ref for the input element that enables
   * reliable cursor positioning using useLayoutEffect instead of setTimeout.
   * Attach this ref to your input element for proper cursor behavior.
   */
  inputRef: React.RefObject<HTMLInputElement>;

  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  maxLength?: number;
  placeholder?: string;
  inputMode?: FormattedInputConfig['inputMode'];
}

/**
 * Generic hook for creating formatted input components
 *
 * **📦 ARCHITECTURE DECISION**: Custom implementation preferred over react-imask.
 * Evaluated react-imask and found our solution better for this project: ~3KB vs ~40KB bundle,
 * zero dependencies, tailored for Polish identifiers, full control over cursor logic.
 *
 * **Key Features**:
 * - 🎨 **Automatic formatting**: Converts raw values to formatted display
 * - 📝 **Clean output**: `onChange` always emits parsed/cleaned value
 * - 🎯 **Smart cursor**: Maintains cursor position during formatting
 * - 🔧 **Separation of concerns**: Formatting logic separate from validation
 *
 * **API Contract**:
 * - **Input**: Raw value from form state (e.g., "12345")
 * - **displayValue**: Formatted value for UI display (e.g., "12-345")
 * - **onChange**: Always emits parsed/cleaned value (e.g., "12345")
 *
 * @example
 * ```tsx
 * function PostalCodeInput({ value, onValueChange, ...props }) {
 *   const { displayValue, onChange, inputRef, ...rest } =
 *     useFormattedInput(value, onValueChange, inputConfigs.postalCode);
 *
 *   return (
 *     <Input
 *       {...props}
 *       {...rest}
 *       ref={inputRef}       // ← Required for reliable cursor positioning
 *       value={displayValue} // ← Shows "12-345" to user
 *       onChange={onChange}  // ← Emits "12345" to form state
 *     />
 *   );
 * }
 *
 * // ✅ Form validation works with cleaned values
 * const schema = z.string().regex(/^\d{5}$/, "Must be 5 digits");
 * // Form state: { postalCode: "12345" } ← Cleaned value
 * // User sees: "12-345" ← Formatted display
 * ```
 */
export function useFormattedInput<TRaw = string, TDisplay = string>(
  value: TRaw,
  onRawValueChange: ((value: TRaw) => void) | undefined,
  config: FormattedInputConfig<TRaw, TDisplay>
): FormattedInputProps<TRaw, TDisplay> {
  const {
    format,
    parse,
    maxLength,
    placeholder,
    inputMode = 'text',
    keyFilter,
    calculateCursorPosition,
  } = config;

  // ✅ **NEW: Reliable cursor positioning with useLayoutEffect**
  // Refs for tracking input element and desired cursor position
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  // ✅ **RELIABLE CURSOR POSITIONING**: useLayoutEffect runs synchronously after DOM updates
  // but before browser paint, ensuring cursor is positioned correctly
  useLayoutEffect(() => {
    if (
      inputRef.current &&
      cursorPositionRef.current !== null &&
      typeof inputRef.current.setSelectionRange === 'function'
    ) {
      const targetPosition = cursorPositionRef.current;
      inputRef.current.setSelectionRange(targetPosition, targetPosition);
      cursorPositionRef.current = null; // Reset after applying
    }
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const cursorPosition = e.target.selectionStart ?? 0;
      const oldDisplayValue = format(value ?? '');

      // Parse input to get clean, raw value
      const rawValue = parse(input);

      // Format the raw value for display
      const newDisplayValue = format(rawValue);

      // ✅ CLEAN API: Pass RAW value to onRawValueChange - Zod schema validates raw data!
      // This separates formatting concerns from validation concerns
      onRawValueChange?.(rawValue);

      // ✅ **IMPROVED: Reliable cursor positioning with useLayoutEffect**
      // Handle cursor positioning after formatting
      const wasFormatted = newDisplayValue !== input;

      if (calculateCursorPosition && wasFormatted) {
        // Calculate new cursor position and store it in ref
        const newPosition = calculateCursorPosition(
          oldDisplayValue,
          newDisplayValue,
          cursorPosition,
          wasFormatted
        );

        // Store the desired position - useLayoutEffect will apply it synchronously
        cursorPositionRef.current = newPosition;
      }
    },
    [value, onRawValueChange, format, parse, calculateCursorPosition]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow essential keys (backspace, delete, tab, escape, enter, arrows, etc.)
      const isEssentialKey =
        [
          'Backspace',
          'Tab',
          'Escape',
          'Enter',
          'Delete',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Home',
          'End',
        ].includes(e.key) ||
        (e.key === 'a' && e.ctrlKey) || // Ctrl+A
        (e.key === 'c' && e.ctrlKey) || // Ctrl+C
        (e.key === 'v' && e.ctrlKey) || // Ctrl+V
        (e.key === 'x' && e.ctrlKey); // Ctrl+X

      if (isEssentialKey) {
        return;
      }

      // Use custom key filter if provided
      if (keyFilter) {
        if (!keyFilter(e)) {
          e.preventDefault();
        }
        return;
      }

      // Default behavior: allow all keys (override in config if needed)
    },
    [keyFilter]
  );

  // Format the raw value for display in the input
  const displayValue = format(value || ('' as TRaw));

  // Validation state is now provided externally via props
  // This maintains separation of concerns: formatting in hook, validation in Zod schema

  return {
    displayValue,

    // 📝 Clear contract: onChange always emits parsed/cleaned value
    // Named consistently with standard React input components
    onChange: handleChange,

    // ✅ **Reliable cursor positioning ref**
    inputRef,

    onKeyDown: keyFilter ? handleKeyDown : undefined,
    maxLength,
    placeholder,
    inputMode,
  };
}

/**
 * Predefined configurations for common input types
 */
export const inputConfigs = {
  /**
   * Polish postal code (XX-XXX format)
   * Input: "12345" (raw) → Display: "12-345" → Output: "12345" (raw)
   */
  postalCode: {
    format: (value: string) => {
      const digits = value.replace(/\D/g, '').slice(0, 5);
      return digits.length > 2
        ? `${digits.slice(0, 2)}-${digits.slice(2)}`
        : digits;
    },
    parse: (value: string) => value.replace(/\D/g, '').slice(0, 5),
    maxLength: 6,
    placeholder: '00-000',
    inputMode: 'numeric' as const,
    keyFilter: (e: React.KeyboardEvent) => {
      // Only allow digits
      return /^[0-9]$/.test(e.key);
    },
    calculateCursorPosition: (
      oldValue: string,
      newValue: string,
      oldCursor: number,
      wasFormatted: boolean
    ) => {
      if (!wasFormatted) return oldCursor;

      // Smart cursor positioning for postal code
      const digits = newValue.replace(/\D/g, '');
      if (digits.length >= 3 && newValue.includes('-')) {
        if (oldCursor === 2) return 4; // After "XX-X"
        if (oldCursor === 3) return 4; // Skip dash
        if (oldCursor > 3 && !oldValue.includes('-')) return oldCursor + 1;
      }
      return oldCursor;
    },
  } satisfies FormattedInputConfig,

  /**
   * Polish PESEL (11 digits, no formatting)
   * Input: "12345678901" (raw) → Display: "12345678901" → Output: "12345678901" (raw)
   */
  pesel: {
    format: (value: string) => value.replace(/\D/g, '').slice(0, 11),
    parse: (value: string) => value.replace(/\D/g, '').slice(0, 11),
    maxLength: 11,
    placeholder: '12345678901',
    inputMode: 'numeric' as const,
    keyFilter: (e: React.KeyboardEvent) => {
      // Only allow digits
      return /^[0-9]$/.test(e.key);
    },
  } satisfies FormattedInputConfig,

  /**
   * Polish NIP (10 digits, no formatting)
   * Input: "1234567890" (raw) → Display: "1234567890" → Output: "1234567890" (raw)
   */
  nip: {
    format: (value: string) => sanitizeNipInput(value),
    parse: (value: string) => sanitizeNipInput(value),
    maxLength: 10,
    placeholder: '1234567890',
    inputMode: 'numeric' as const,
    keyFilter: (e: React.KeyboardEvent) => {
      // Only allow digits
      return /^[0-9]$/.test(e.key);
    },
  } satisfies FormattedInputConfig,

  /**
   * Phone number (international format, no special formatting as react-phone-number-input handles it)
   * Input: "+48123456789" (raw) → Display: "+48123456789" → Output: "+48123456789" (raw)
   */
  phone: {
    format: (value: string) => value, // No formatting - react-phone-number-input handles this
    parse: (value: string) => value, // No parsing needed
    placeholder: 'Enter phone number',
    inputMode: 'tel' as const,
    // No keyFilter - allow international phone number characters
  } satisfies FormattedInputConfig,

  /**
   * Polish REGON (9 or 14 digits, no formatting)
   * Input: "123456789" (raw) → Display: "123456789" → Output: "123456789" (raw)
   */
  regon: {
    format: (value: string) => value.replace(/\D/g, '').slice(0, 14),
    parse: (value: string) => value.replace(/\D/g, '').slice(0, 14),
    maxLength: 14,
    placeholder: '123456789',
    inputMode: 'numeric' as const,
    keyFilter: (e: React.KeyboardEvent) => {
      // Only allow digits
      return /^[0-9]$/.test(e.key);
    },
  } satisfies FormattedInputConfig,

  /**
   * Polish KRS (10 digits, no formatting)
   * Input: "1234567890" (raw) → Display: "1234567890" → Output: "1234567890" (raw)
   */
  krs: {
    format: (value: string) => value.replace(/\D/g, '').slice(0, 10),
    parse: (value: string) => value.replace(/\D/g, '').slice(0, 10),
    maxLength: 10,
    placeholder: 'Opcjonalne',
    inputMode: 'numeric' as const,
    keyFilter: (e: React.KeyboardEvent) => {
      // Only allow digits
      return /^[0-9]$/.test(e.key);
    },
  } satisfies FormattedInputConfig,
} as const;
