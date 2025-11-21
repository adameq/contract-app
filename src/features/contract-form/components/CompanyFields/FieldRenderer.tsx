/**
 * FieldRenderer - Renders company identification fields
 *
 * Eliminates code duplication by extracting common field rendering logic.
 * Handles validation, descriptions, and input type selection based on field config.
 *
 * This component was extracted from CompanyFields to follow DRY principle.
 * Previously, identical logic was duplicated for full-width and half-width fields.
 */

import type { ReactElement } from 'react';
import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

import { TypedFormField } from '@/shared/components/common/TypedFormField';
import { BusinessNumberInput } from '@/shared/components/ui/business-number-input';
import { Input } from '@/shared/components/ui/input';
import { logger } from '@/shared/lib/logger';

import {
  type FieldConfig,
  getFieldDescription,
  getFieldLabel,
  type IdentificationFieldKey,
} from '../../hooks/useCompanyFieldsConfig';
import type { FinalContractData } from '../../schema/companySchemas';
import type { CompanyFieldsState } from './types';

/**
 * Aria props passed from TypedFormField to input components
 * These are the exact props provided by TypedFormField's render callback
 */
interface FormFieldAriaProps {
  'aria-invalid': boolean;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
}

/**
 * Props for FieldRenderer component
 */
export interface FieldRendererProps {
  /** Field key from COMPANY_FIELDS_CONFIG */
  fieldKey: IdentificationFieldKey;
  /** Field configuration object */
  config: FieldConfig;
  /** Current state of CompanyFields */
  state: CompanyFieldsState;
  /** Whether field is read-only */
  readonly: boolean;
  /** Whether to show validation indicators */
  showValidation: boolean;
  /** Optional className for read-only fields */
  fieldClassName?: string;
  /** Optional variant for read-only fields */
  fieldVariant?:
    | 'default'
    | 'success-filled'
    | 'disabled-success'
    | 'disabled-muted';
}

/**
 * Render appropriate input component based on field configuration
 *
 * Uses discriminated union with type-safe switch statement.
 * TypeScript ensures all cases are handled and knows exactly which
 * properties are available in each case.
 *
 * @param config - Field configuration from COMPANY_FIELDS_CONFIG
 * @param field - React Hook Form field props
 * @param ariaProps - Accessibility props from TypedFormField
 * @param id - Input element ID
 * @param readonly - Whether field is disabled
 * @param fieldClassName - Optional className for styling
 * @param fieldVariant - Optional variant for styling
 * @param validationProps - Validation state props (validationState, showValidationIcon, etc.)
 * @returns Appropriate input component (Input or BusinessNumberInput), or null for invalid config
 */
function renderInputByType(
  config: FieldConfig,
  field: ControllerRenderProps<FieldValues, string>,
  ariaProps: FormFieldAriaProps,
  id: string,
  readonly: boolean,
  fieldClassName?: string,
  fieldVariant?:
    | 'default'
    | 'success-filled'
    | 'disabled-success'
    | 'disabled-muted',
  validationProps?: Record<string, unknown>
): ReactElement | null {
  // Type-safe discriminated union with switch
  switch (config.type) {
    case 'text':
      // TypeScript knows config has placeholder and gridColumn
      return (
        <Input
          {...field}
          {...ariaProps}
          id={id}
          placeholder={config.placeholder}
          disabled={readonly}
          variant={readonly ? fieldVariant : undefined}
          {...validationProps}
        />
      );

    case 'business-number':
      // TypeScript knows config has businessType
      return (
        <BusinessNumberInput
          value={field.value as string}
          onValueChange={field.onChange}
          {...ariaProps}
          type={config.businessType}
          id={id}
          disabled={readonly}
          variant={readonly ? fieldVariant : undefined}
          {...validationProps}
        />
      );

    case 'hidden':
      // Defensive programming: Log error but don't crash application
      // This should never happen (hidden fields filtered by getIdentificationFieldsForRendering)
      // but we gracefully degrade rather than crash if misconfigured
      logger.error(
        'Hidden field incorrectly passed to FieldRenderer',
        undefined,
        {
          component: 'FieldRenderer',
          fieldKey: config.key,
          context: 'Hidden fields should be filtered before rendering',
        }
      );
      return null;

    default: {
      // Exhaustiveness check - TypeScript will error if we add new type without handling
      const _exhaustiveCheck: never = config;
      throw new Error(`Unknown field type in config`);
    }
  }
}

/**
 * FieldRenderer - Renders a single company identification field
 *
 * Handles:
 * - Field validation (if validator exists and validation is enabled)
 * - Field description based on current state
 * - Appropriate input type (Input vs BusinessNumberInput)
 * - Accessibility props (aria-*, id, etc.)
 *
 * Benefits:
 * - Eliminates duplication between full-width and half-width fields
 * - Single source of truth for field rendering logic
 * - Easy to test in isolation
 * - Consistent behavior across all company fields
 *
 * @example
 * ```tsx
 * <FieldRenderer
 *   fieldKey="name"
 *   config={COMPANY_FIELDS_CONFIG.name}
 *   state="active"
 *   readonly={false}
 *   showValidation={true}
 * />
 * ```
 */
export function FieldRenderer({
  fieldKey,
  config,
  state,
  readonly,
  showValidation,
  fieldClassName,
  fieldVariant,
}: FieldRendererProps) {
  // Get validation deriver from config (centralized in COMPANY_FIELDS_CONFIG)
  // Optional property - not all fields have validation (e.g., nip is handled separately)
  const validationDeriver =
    'validationDeriver' in config ? config.validationDeriver : undefined;

  // Get field description based on current state
  // getFieldDescription now handles descriptionKey mapping internally
  const description = getFieldDescription(state, fieldKey);

  return (
    <TypedFormField<FinalContractData, typeof config.formPath>
      name={config.formPath}
      label={getFieldLabel(fieldKey)}
      description={description}
      // CRITICAL FIX: Explicit defaultValue prevents "uncontrolled to controlled" warning
      // When userType changes (e.g., consumer-vat → company), new fields (company.name)
      // may not exist in RHF's _defaultValues yet. Controller will use this explicit
      // defaultValue instead of undefined, ensuring fields are controlled from the start.
      defaultValue={''}
    >
      {({ field, fieldState, id, ...ariaProps }) => {
        // Derive validation props if validator exists and validation is enabled
        const validationProps: Record<string, unknown> =
          validationDeriver && showValidation && !readonly
            ? validationDeriver(fieldState)
            : {};

        return renderInputByType(
          config,
          field,
          ariaProps,
          id,
          readonly,
          fieldClassName,
          fieldVariant,
          validationProps
        );
      }}
    </TypedFormField>
  );
}

FieldRenderer.displayName = 'FieldRenderer';
