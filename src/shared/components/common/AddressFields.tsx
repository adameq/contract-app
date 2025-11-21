import React from 'react';
import type { FieldValues, Path } from 'react-hook-form';

import { TypedFormField } from '@/shared/components/common/TypedFormField';
import { Input } from '@/shared/components/ui/input';
import { PostalCodeInput } from '@/shared/components/ui/postal-code-input';
import {
  type AddressPath,
  buildAddressFieldPath,
} from '@/shared/lib/types/addressPaths';
import { deriveValidationPropsFor } from '@/shared/lib/validation/helpers';

interface AddressFieldsProps<T extends FieldValues> {
  namePrefix: AddressPath<T>;
  streetLabel?: string;
  buildingLabel?: string;
  apartmentLabel?: string;
  postalCodeLabel?: string;
  cityLabel?: string;
  className?: string;
  disabled?: boolean;
  variant?:
    | 'default'
    | 'success-filled'
    | 'disabled-success'
    | 'disabled-muted';
}

/**
 * Reusable address fields component with full type safety
 *
 * Renders a complete address form section with:
 * - Street/Location field (full width)
 * - Building number and apartment number (2-column grid)
 * - Postal code and city (2-column grid)
 *
 * Type Safety:
 * - namePrefix must be a valid address path from the form data type
 * - TypeScript validates at compile-time that the path exists
 * - No manual type casting required
 *
 * @template T - Form data type extending FieldValues
 * @param namePrefix - Type-safe path to address object (e.g., "company.address")
 * @param streetLabel - Label for street field
 * @param buildingLabel - Label for building number field
 * @param apartmentLabel - Label for apartment number field
 * @param postalCodeLabel - Label for postal code field
 * @param cityLabel - Label for city field
 * @param className - Additional CSS classes
 * @param disabled - Whether fields should be disabled
 * @param variant - Visual variant for input styling
 *
 * @example
 * // TypeScript ensures only valid address paths are accepted:
 * <AddressFields<ContractFormData> namePrefix="company.address" />
 * <AddressFields<ContractFormData> namePrefix="correspondence.address" />
 *
 * // TypeScript error - invalid path:
 * <AddressFields<ContractFormData> namePrefix="invalid.path" />
 */
export function AddressFields<T extends FieldValues>({
  namePrefix,
  streetLabel = '*Ulica',
  buildingLabel = '*Numer',
  apartmentLabel = 'Nr lokalu (opcjonalnie)',
  postalCodeLabel = '*Kod pocztowy',
  cityLabel = '*Miasto',
  className = '',
  disabled = false,
  variant = 'default',
}: AddressFieldsProps<T>) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Street field - full width */}
      <TypedFormField<T, Path<T>>
        name={buildAddressFieldPath<T>(namePrefix, 'street')}
        label={streetLabel}
        defaultValue={'' as never}
      >
        {({ field, fieldState, id, ...ariaProps }) => {
          const validationProps = disabled
            ? {}
            : deriveValidationPropsFor('standard', fieldState);
          return (
            <Input
              {...field}
              {...ariaProps}
              id={id}
              placeholder="ul. Główna, os. Młodych, pl. Konstytucji"
              disabled={disabled}
              variant={variant}
              {...validationProps}
            />
          );
        }}
      </TypedFormField>

      {/* House and apartment numbers row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Building number */}
        <TypedFormField<T, Path<T>>
          name={buildAddressFieldPath<T>(namePrefix, 'buildingNumber')}
          label={buildingLabel}
          defaultValue={'' as never}
        >
          {({ field, fieldState, id, ...ariaProps }) => {
            const validationProps = disabled
              ? {}
              : deriveValidationPropsFor('standard', fieldState);
            return (
              <Input
                {...field}
                {...ariaProps}
                id={id}
                placeholder="15, 15A, 15/2, bez numeru"
                disabled={disabled}
                variant={variant}
                {...validationProps}
              />
            );
          }}
        </TypedFormField>

        {/* Apartment number */}
        <TypedFormField<T, Path<T>>
          name={buildAddressFieldPath<T>(namePrefix, 'apartmentNumber')}
          label={apartmentLabel}
          defaultValue={'' as never}
        >
          {({ field, fieldState, id, ...ariaProps }) => {
            const validationProps = disabled
              ? {}
              : deriveValidationPropsFor('standard', fieldState);
            return (
              <Input
                {...field}
                {...ariaProps}
                id={id}
                placeholder="np. 5, 5A"
                disabled={disabled}
                variant={variant}
                {...validationProps}
              />
            );
          }}
        </TypedFormField>
      </div>

      {/* Postal code and city row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Postal code */}
        <TypedFormField<T, Path<T>>
          name={buildAddressFieldPath<T>(namePrefix, 'postalCode')}
          label={postalCodeLabel}
          defaultValue={'' as never}
        >
          {({ field, fieldState, id, ...ariaProps }) => {
            const validationProps = disabled
              ? {}
              : deriveValidationPropsFor('postalCode', fieldState);
            return (
              <PostalCodeInput
                value={field.value}
                onValueChange={field.onChange}
                {...ariaProps}
                id={id}
                disabled={disabled}
                variant={variant}
                className="w-full"
                {...validationProps}
              />
            );
          }}
        </TypedFormField>

        {/* City */}
        <TypedFormField<T, Path<T>>
          name={buildAddressFieldPath<T>(namePrefix, 'city')}
          label={cityLabel}
          defaultValue={'' as never}
        >
          {({ field, fieldState, id, ...ariaProps }) => {
            const validationProps = disabled
              ? {}
              : deriveValidationPropsFor('standard', fieldState);
            return (
              <Input
                {...field}
                {...ariaProps}
                id={id}
                placeholder="Warszawa, Bielsko-Biała"
                disabled={disabled}
                variant={variant}
                {...validationProps}
              />
            );
          }}
        </TypedFormField>
      </div>
    </div>
  );
}
