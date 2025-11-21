import React, { forwardRef, useImperativeHandle } from 'react';

import {
  inputConfigs,
  useFormattedInput,
} from '@/shared/hooks/useFormattedInput';

import { Input } from './input';

type BusinessNumberType = 'regon' | 'krs';

interface BusinessNumberInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  type: BusinessNumberType;
  /**
   * Value change handler that receives the raw, unformatted value
   * Compatible with React Hook Form's field.onChange (accepts both events and values)
   */
  onValueChange?: (value: string) => void;
}

/**
 * BusinessNumberInput component for REGON and KRS formatting
 *
 * Handles Polish business identifiers with appropriate validation:
 * - REGON: 9 or 14 digits
 * - KRS: 10 digits
 *
 * Features:
 * - Numeric input only
 * - Length validation based on type
 * - Modern key handling with useFormattedInput
 * - Consistent with other formatting inputs (NipInput, PeselInput)
 *
 * Now powered by the generic useFormattedInput hook for consistency
 * and reduced code duplication.
 */
export const BusinessNumberInput = forwardRef<
  HTMLInputElement,
  BusinessNumberInputProps
>((props, ref) => {
  const {
    type,
    onValueChange,
    value,
    validationState,
    variant,
    showValidationIcon,
    ...rest
  } = props;

  // Select appropriate config based on type
  const config = type === 'regon' ? inputConfigs.regon : inputConfigs.krs;

  // Destructure to prevent internal hook values from reaching DOM
  const {
    displayValue,
    onChange: handleInputChange,
    inputRef,
    ...inputProps
  } = useFormattedInput(
    value as string,
    onValueChange, // ✅ Pass onValueChange directly - RHF's field.onChange accepts raw values
    config
  );

  // ✅ **STANDARD REACT PATTERN**: useImperativeHandle + forwardRef
  // This component needs to use the input ref in two places:
  // 1. Internally: useFormattedInput hook uses inputRef for cursor positioning
  // 2. Externally: React Hook Form needs access to the same input element
  //
  // useImperativeHandle is the idiomatic solution for exposing internal refs externally.
  // This is the recommended pattern when hooks need ref access AND the component uses forwardRef.
  useImperativeHandle(ref, () => inputRef.current, [inputRef]);

  // Prioritize external validation props over useFormattedInput internal props
  const finalProps = {
    ...inputProps,
    value: displayValue, // Use formatted value for display
    onChange: handleInputChange, // Use renamed handler
    ...(validationState && { validationState }),
    ...(variant && { variant }),
    ...(showValidationIcon !== undefined && { showValidationIcon }),
  };

  return (
    <Input
      {...rest}
      {...finalProps}
      ref={inputRef} // ✅ Use inputRef from hook for reliable cursor positioning
      aria-describedby={`${type}-format`}
    />
  );
});

BusinessNumberInput.displayName = 'BusinessNumberInput';
