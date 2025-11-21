import React, { forwardRef, useImperativeHandle } from 'react';

import {
  inputConfigs,
  useFormattedInput,
} from '@/shared/hooks/useFormattedInput';

import { Input } from './input';

interface NipInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'onKeyDown'> {
  /**
   * Value change handler that receives the raw, unformatted value
   * Compatible with React Hook Form's field.onChange (accepts both events and values)
   */
  onValueChange?: (value: string) => void;
  onEnterPress?: () => void;
}

/**
 * NipInput component for Polish NIP numbers (10 digits)
 *
 * Features:
 * - Accepts only digits (0-9)
 * - Automatically limits to 10 characters
 * - No visual formatting (NIP is displayed as plain numbers)
 * - Provides proper mobile keyboard (numeric)
 *
 * Now powered by the generic useFormattedInput hook for consistency
 * with other formatted input components.
 */
export const NipInput = forwardRef<HTMLInputElement, NipInputProps>(
  (props, ref) => {
    const {
      onValueChange,
      onEnterPress,
      value,
      validationState,
      showValidationIcon,
      ...rest
    } = props;

    // Destructure to prevent internal hook values from reaching DOM
    const {
      displayValue,
      onChange: handleInputChange,
      inputRef,
      ...inputProps
    } = useFormattedInput(
      value as string,
      onValueChange, // ✅ Pass onValueChange directly - RHF's field.onChange accepts raw values
      inputConfigs.nip
    );

    // ✅ **STANDARD REACT PATTERN**: useImperativeHandle + forwardRef
    // This component needs to use the input ref in two places:
    // 1. Internally: useFormattedInput hook uses inputRef for cursor positioning
    // 2. Externally: React Hook Form needs access to the same input element
    //
    // useImperativeHandle is the idiomatic solution for exposing internal refs externally.
    // This is the recommended pattern when hooks need ref access AND the component uses forwardRef.
    useImperativeHandle(ref, () => inputRef.current, [inputRef]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && onEnterPress) {
        event.preventDefault(); // Prevent form submission
        onEnterPress();
      }
    };

    // Prioritize external validation props over useFormattedInput internal props
    const finalProps = {
      ...inputProps,
      value: displayValue, // Use formatted value for display
      onChange: handleInputChange, // Use renamed handler
      ...(validationState && { validationState }),
      ...(showValidationIcon !== undefined && { showValidationIcon }),
    };

    return (
      <Input
        {...rest}
        {...finalProps}
        onKeyDown={handleKeyDown}
        ref={inputRef} // ✅ Use inputRef from hook for reliable cursor positioning
      />
    );
  }
);

NipInput.displayName = 'NipInput';
