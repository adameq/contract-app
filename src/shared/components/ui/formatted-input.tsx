import React, { forwardRef, useImperativeHandle } from 'react';

import {
  type FormattedInputConfig,
  useFormattedInput,
} from '@/shared/hooks/useFormattedInput';

import { Input } from './input';

interface FormattedInputProps<TRaw = string, TDisplay = string>
  extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  /** Raw value from form state (e.g., "12345" for postal code) */
  value?: TRaw;
  /**
   * Custom value change handler (alternative to onChange)
   * Receives the raw, unformatted value (e.g., receives "12345" not "12-345")
   */
  onValueChange?: (value: TRaw) => void;
  /**
   * Standard React onChange handler (for React Hook Form compatibility)
   * Receives a change event
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Formatting configuration (use inputConfigs.* for common types) */
  config: FormattedInputConfig<TRaw, TDisplay>;
}

/**
 * Generic FormattedInput component with configurable formatting
 *
 * **Purpose:** Simplifies use of useFormattedInput hook by handling all the
 * wiring internally. Use this for ad-hoc formatted inputs where specialized
 * components (like NipInput, PostalCodeInput) don't exist.
 *
 * **When to use:**
 * - ✅ For one-off or uncommon formatted input types
 * - ✅ When you need custom formatting logic
 * - ✅ When prototyping new input types
 *
 * **When NOT to use:**
 * - ❌ For common Polish identifiers - use specialized components:
 *   - `<NipInput />` for NIP numbers
 *   - `<PostalCodeInput />` for postal codes
 *   - `<PeselInput />` for PESEL numbers
 *   - `<BusinessNumberInput />` for REGON/KRS
 * - These specialized components may have additional features
 *   (validation icons, custom styling, etc.)
 *
 * **How it works:**
 * 1. Accepts raw value from form state (e.g., "12345")
 * 2. Uses config to format for display (e.g., "12-345")
 * 3. Parses user input back to raw value
 * 4. Calls onValueChange with raw value only
 * 5. Handles cursor positioning automatically
 *
 * @example
 * ```tsx
 * import { inputConfigs } from '@/shared/hooks/useFormattedInput';
 *
 * // With React Hook Form
 * <Controller
 *   name="customField"
 *   render={({ field }) => (
 *     <FormattedInput
 *       value={field.value}
 *       onValueChange={field.onChange}
 *       config={inputConfigs.postalCode}
 *     />
 *   )}
 * />
 *
 * // Custom config
 * <FormattedInput
 *   value={value}
 *   onValueChange={setValue}
 *   config={{
 *     format: (raw) => raw.toUpperCase(),
 *     parse: (display) => display.toLowerCase(),
 *     maxLength: 10,
 *     inputMode: 'text',
 *   }}
 * />
 * ```
 *
 * @see useFormattedInput - The underlying hook
 * @see inputConfigs - Predefined configs for common input types
 */
export const FormattedInput = forwardRef<HTMLInputElement, FormattedInputProps>(
  function FormattedInput<TRaw = string, TDisplay = string>(
    props: FormattedInputProps<TRaw, TDisplay>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) {
    const { onValueChange, onChange, value, config, ...rest } = props;

    // ✅ **STABLE CALLBACK PATTERN**: Use refs to avoid infinite loops
    // React Hook Form's onChange is not a stable reference, so we can't use it
    // directly in useCallback dependencies. Instead, we use refs to always call
    // the latest version while maintaining a stable callback reference.
    const onChangeRef = React.useRef(onChange);
    const onValueChangeRef = React.useRef(onValueChange);

    // Synchronize refs with latest props (runs before useCallback)
    onChangeRef.current = onChange;
    onValueChangeRef.current = onValueChange;

    // Combine both onChange handlers with stable reference
    const combinedChangeHandler = React.useCallback(
      (rawValue: TRaw) => {
        onValueChangeRef.current?.(rawValue);
        // Create a synthetic event for RHF's onChange
        if (onChangeRef.current) {
          const syntheticEvent = {
            target: { value: rawValue },
          } as React.ChangeEvent<HTMLInputElement>;
          onChangeRef.current(syntheticEvent);
        }
      },
      [] // Empty deps - stable reference that always calls latest callbacks
    );

    // Destructure to prevent internal hook values from reaching DOM
    const {
      displayValue,
      onChange: handleInputChange,
      inputRef,
      ...inputProps
    } = useFormattedInput(value as TRaw, combinedChangeHandler, config);

    // ✅ **STANDARD REACT PATTERN**: useImperativeHandle + forwardRef
    // This component needs to use the input ref in two places:
    // 1. Internally: useFormattedInput hook uses inputRef for cursor positioning
    // 2. Externally: React Hook Form needs access to the same input element
    //
    // useImperativeHandle is the idiomatic solution for exposing internal refs externally.
    // This is the recommended pattern when hooks need ref access AND the component uses forwardRef.
    useImperativeHandle(ref, () => inputRef.current, [inputRef]);

    return (
      <Input
        {...inputProps}
        {...rest}
        value={displayValue as string}
        onChange={
          handleInputChange as React.ChangeEventHandler<HTMLInputElement>
        }
        ref={inputRef}
      />
    );
  }
);

FormattedInput.displayName = 'FormattedInput';
