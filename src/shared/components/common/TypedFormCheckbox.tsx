import { type ReactNode } from 'react';
import { useId } from 'react';
import {
  Controller,
  type ControllerRenderProps,
  type FieldError,
  type FieldValues,
  type Path,
  type UseControllerProps,
} from 'react-hook-form';

import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';

interface TypedFormCheckboxRenderProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: {
    error?: FieldError;
  };
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface TypedFormCheckboxProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> extends UseControllerProps<TFieldValues, TName> {
  label: ReactNode;
  description?: string;
  className?: string;
  /** Custom checkbox render function (optional - uses default Checkbox if not provided) */
  children?: (
    props: TypedFormCheckboxRenderProps<TFieldValues, TName>
  ) => ReactNode;
  /** Callback when checkbox value changes */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Type-safe FormCheckbox component for checkbox form fields
 *
 * Specialized wrapper for checkbox inputs with side-by-side label layout.
 * Unlike TypedFormField (which uses top label), this component places the
 * label beside the checkbox for better checkbox UX.
 *
 * Features:
 * - Side-by-side checkbox + label layout
 * - Optional description below checkbox
 * - Type-safe React Hook Form integration
 * - Same API patterns as TypedFormField
 * - Support for custom checkbox render function
 *
 * Usage:
 * ```tsx
 * <TypedFormCheckbox<ContractFormData, "personalData.withoutPesel">
 *   name="personalData.withoutPesel"
 *   label="Nie mam numeru PESEL"
 *   description="Proszę zaznaczyć jeśli nie posiada Pan/Pani polskiego numeru PESEL"
 *   onCheckedChange={handleCheckboxChange}
 * />
 * ```
 *
 * Advanced usage with custom render:
 * ```tsx
 * <TypedFormCheckbox name="field" label="Label">
 *   {({ field, id, ...ariaProps }) => (
 *     <CustomCheckbox {...field} id={id} {...ariaProps} />
 *   )}
 * </TypedFormCheckbox>
 * ```
 */
export function TypedFormCheckbox<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  label,
  description,
  className,
  name,
  rules,
  defaultValue,
  control,
  disabled,
  shouldUnregister,
  children,
  onCheckedChange,
}: TypedFormCheckboxProps<TFieldValues, TName>) {
  const id = useId();

  return (
    <Controller
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      control={control}
      disabled={disabled}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => {
        const errorId = `${id}-error`;
        const descriptionId = `${id}-description`;

        // Build aria-describedby to include both description and error when both present
        const ariaDescribedBy =
          [
            description ? descriptionId : null,
            fieldState.error ? errorId : null,
          ]
            .filter(Boolean)
            .join(' ') || undefined;

        const renderProps: TypedFormCheckboxRenderProps<TFieldValues, TName> = {
          field,
          fieldState,
          id,
          'aria-invalid': !!fieldState.error,
          'aria-describedby': ariaDescribedBy,
        };

        return (
          <div className={cn('space-y-2', className)} data-rhf-name={name}>
            <div className="flex items-center space-x-3">
              {/* Render custom checkbox or default Checkbox */}
              {children ? (
                children(renderProps)
              ) : (
                <Checkbox
                  checked={field.value ?? false}
                  id={id}
                  onCheckedChange={checked => {
                    field.onChange(checked);
                    onCheckedChange?.(checked);
                  }}
                  disabled={disabled}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={ariaDescribedBy}
                />
              )}

              <div className="space-y-1 flex-1">
                <Label
                  htmlFor={id}
                  className="text-sm font-medium cursor-pointer leading-tight"
                >
                  {label}
                </Label>
                {description && (
                  <div
                    id={descriptionId}
                    className="text-xs text-muted-foreground"
                  >
                    {description}
                  </div>
                )}
              </div>
            </div>

            {/* Show error below checkbox */}
            {fieldState.error && (
              <p id={errorId} className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
