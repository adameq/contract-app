import React from 'react';
import type { FieldValues, Path } from 'react-hook-form';

import { TypedFormField } from '@/shared/components/common';
import { NipInput } from '@/shared/components/ui/nip-input';
import {
  deriveNipValidationResult,
  deriveValidationPropsFor,
} from '@/shared/lib/validation/helpers';

interface NipInputSectionProps<TFieldValues extends FieldValues = FieldValues> {
  className?: string;
  onEnterPress?: () => void;
  /** Field name path - defaults to 'nip' for CompanyFormData/ConsumerVatFormData */
  nipFieldName?: Path<TFieldValues>;
}

/**
 * Simplified NIP input section focused purely on input and validation
 *
 * Features:
 * - NIP validation and formatting
 * - Dynamic description based on validation state
 * - Manual data fetching via button (no automatic fetching)
 *
 * ARCHITECTURE:
 * - Pure input component - no data fetching
 * - Validation feedback only
 * - Manual triggers through Enter key callback
 * - React.memo prevents re-renders when callbacks are stable
 * - Generic field name support for different FormProvider contexts
 *
 * Layout: Label → Input → Description → Error
 */
export const NipInputSection = React.memo(function NipInputSection<
  TFieldValues extends FieldValues = FieldValues,
>({
  className,
  onEnterPress,
  nipFieldName = 'nip' as Path<TFieldValues>,
}: NipInputSectionProps<TFieldValues>) {
  return (
    <div className={className}>
      <TypedFormField<TFieldValues, Path<TFieldValues>>
        name={nipFieldName}
        label="Numer NIP"
        required
        className="space-y-2"
        defaultValue={'' as never}
      >
        {({ field, fieldState, id, ...ariaProps }) => {
          // Derive validation props from React Hook Form state
          const validationProps = deriveValidationPropsFor('nip', fieldState);

          // Get full validation result - Single Source of Truth
          const validationResult = deriveNipValidationResult(fieldState);

          // Map validation state directly to description text
          const getDescriptionText = (): string => {
            switch (validationResult.validationState) {
              case 'error':
                return 'Sprawdź format numeru NIP';
              case 'success':
                return '✓ NIP prawidłowy';
              case 'default':
              default:
                return '10-cyfrowy numer NIP';
            }
          };

          return (
            <div className="space-y-2">
              {/* NIP Input */}
              <div className="relative w-full">
                <NipInput
                  value={field.value}
                  onValueChange={field.onChange}
                  {...ariaProps}
                  id={id}
                  onEnterPress={onEnterPress}
                  {...validationProps}
                />
              </div>

              {/* Dynamic description - based on validation state */}
              {!fieldState.error && (
                <p
                  className={
                    validationResult.validationState === 'error'
                      ? 'text-sm text-destructive'
                      : 'text-sm text-muted-foreground'
                  }
                >
                  {getDescriptionText()}
                </p>
              )}
            </div>
          );
        }}
      </TypedFormField>
    </div>
  );
});

NipInputSection.displayName = 'NipInputSection';
