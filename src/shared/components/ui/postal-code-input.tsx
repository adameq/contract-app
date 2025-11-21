import React, { forwardRef, useImperativeHandle } from 'react';

import {
  inputConfigs,
  useFormattedInput,
} from '@/shared/hooks/useFormattedInput';

import { Input } from './input';

interface PostalCodeInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  /**
   * Value change handler that receives the raw, unformatted value
   * Compatible with React Hook Form's field.onChange (accepts both events and values)
   */
  onValueChange?: (value: string) => void;
}

/**
 * PostalCodeInput component with automatic XX-XXX formatting
 *
 * Automatically formats Polish postal codes as user types:
 * - Input: "12345" → Output: "12-345"
 * - Handles cursor positioning and backspace intelligently
 * - Only allows digits and maintains 5-digit limit
 *
 * Now powered by the generic useFormattedInput hook for better maintainability
 * and consistency across all formatted input components.
 */
export const PostalCodeInput = forwardRef<
  HTMLInputElement,
  PostalCodeInputProps
>((props, ref) => {
  const { onValueChange, value, ...rest } = props;

  // Destructure to prevent internal hook values from reaching DOM
  const {
    displayValue,
    onChange: handleInputChange,
    inputRef,
    ...inputProps
  } = useFormattedInput(
    value as string,
    onValueChange, // ✅ Pass onValueChange directly - RHF's field.onChange accepts raw values
    inputConfigs.postalCode
  );

  // ✅ **STANDARD REACT PATTERN**: useImperativeHandle + forwardRef
  // This component needs to use the input ref in two places:
  // 1. Internally: useFormattedInput hook uses inputRef for cursor positioning
  // 2. Externally: React Hook Form needs access to the same input element
  //
  // useImperativeHandle is the idiomatic solution for exposing internal refs externally.
  // This is the recommended pattern when hooks need ref access AND the component uses forwardRef.
  useImperativeHandle(ref, () => inputRef.current, [inputRef]);

  // Note: Validation is now handled by Zod schema
  // We only handle formatting here, validation props are forwarded to Input

  return (
    <Input
      {...inputProps}
      {...rest}
      value={displayValue}
      onChange={handleInputChange}
      ref={inputRef} // ✅ Use inputRef from hook for reliable cursor positioning
      aria-describedby="postal-code-format"
    />
  );
});

PostalCodeInput.displayName = 'PostalCodeInput';
