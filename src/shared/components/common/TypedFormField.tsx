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

import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import {
  deriveValidationDataAttributes,
  type ValidationDataAttributes,
  type ValidationOptions,
} from '@/shared/lib/validation/helpers';

interface TypedFormFieldRenderProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> extends Partial<ValidationDataAttributes> {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: {
    error?: FieldError;
  };
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface TypedFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
> extends UseControllerProps<TFieldValues, TName> {
  label: ReactNode;
  description?: string;
  children: (
    props: TypedFormFieldRenderProps<TFieldValues, TName>
  ) => ReactNode;
  className?: string;
  /**
   * Optional validation configuration for automatic validation state derivation
   * When provided, validation data attributes will be automatically derived from
   * fieldState and included in the render props (data-validation-state,
   * data-show-validation-icon)
   *
   * @example
   * ```tsx
   * <TypedFormField
   *   name="firstName"
   *   validation={{ showSuccessIcon: true }}
   * >
   *   {({ field, id, ...props }) => (
   *     <Input {...field} {...props} id={id} />
   *   )}
   * </TypedFormField>
   * ```
   *
   * The data attributes are automatically spread via ...props:
   * - data-validation-state: 'default' | 'success' | 'error' | 'loading'
   * - data-show-validation-icon: 'true' | 'false'
   */
  validation?: ValidationOptions;
}

/**
 * Type-safe FormField component that properly infers field types
 *
 * This component wraps React Hook Form's Controller with a clean API for
 * rendering form fields. It uses RHF's Path<T> and ControllerRenderProps
 * to provide type-safe field values and handlers.
 *
 * **Type Safety for Discriminated Unions:**
 * When using discriminated unions (like ContractFormData with userType),
 * TypeScript infers the union of all possible types for a field path.
 * For example, `company.name` is typed as `string | undefined` because
 * it's required for 'company' but optional for 'consumer' user types.
 * This is correct behavior - the component must handle all possible states.
 *
 * **Required Field Detection:**
 * The component automatically detects if a field is required by checking
 * the `rules.required` prop from React Hook Form. A visual indicator (*)
 * is displayed for required fields. RHF automatically adds `aria-required`
 * to the input element based on validation rules.
 *
 * Usage:
 * ```tsx
 * <TypedFormField<ContractFormData, "company.name">
 *   name="company.name"
 *   label="Company Name"
 *   rules={{ required: "Company name is required" }}  // ✅ Auto-detected
 * >
 *   {({ field, fieldState, id, ...ariaProps }) => (
 *     <Input
 *       {...field}      // ✅ Includes value, onChange, onBlur, name, ref
 *       {...ariaProps}  // ✅ Includes aria-invalid, aria-describedby (RHF adds aria-required)
 *       id={id}
 *       // ❌ NO need for value={field.value} - already included in spread!
 *     />
 *   )}
 * </TypedFormField>
 * ```
 *
 * **Important:** The `{...field}` spread already includes the `value` prop from
 * React Hook Form. There's no need to explicitly pass `value={field.value}` as
 * it's redundant. Ensure your form's `defaultValues` initialize all fields to
 * avoid undefined values (e.g., strings should default to `''`).
 */
export function TypedFormField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  label,
  description,
  children,
  className,
  name,
  rules,
  defaultValue,
  control,
  disabled,
  shouldUnregister,
  validation: validationOptions,
}: TypedFormFieldProps<TFieldValues, TName>) {
  const id = useId();

  // ✅ Auto-detect if field is required from validation rules
  // RHF's rules.required can be boolean, string (error message), or validation object
  const isRequired = !!rules?.required;

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
        // This follows WCAG 2.1 guidelines for form accessibility
        const ariaDescribedBy =
          [
            description ? descriptionId : null,
            fieldState.error ? errorId : null,
          ]
            .filter(Boolean)
            .join(' ') || undefined;

        // ✅ Auto-derive validation data attributes when validation option is provided
        // Data attributes follow web standards and reduce coupling between components
        const validationDataAttrs = validationOptions
          ? deriveValidationDataAttributes(fieldState, validationOptions)
          : {};

        return (
          <div className={cn('space-y-2', className)} data-rhf-name={name}>
            <Label htmlFor={id} required={isRequired}>
              {label}
            </Label>

            {children({
              field,
              fieldState,
              id,
              'aria-invalid': !!fieldState.error,
              'aria-describedby': ariaDescribedBy,
              ...validationDataAttrs,
            })}

            {/* Always show description when available (UX: user keeps context) */}
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            {/* Show error below description (clear visual hierarchy) */}
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
