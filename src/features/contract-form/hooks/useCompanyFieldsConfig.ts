/**
 * useCompanyFieldsConfig Hook
 *
 * Centralizes all business logic for CompanyFields component configuration.
 * This hook extracts logic from the UI component to maintain separation of concerns.
 *
 * Features:
 * - Generates appropriate titles and subtitles based on state
 * - Provides complete configuration for each state
 * - Handles custom overrides for flexibility
 * - Memoizes values for performance
 * - Single source of truth for field labels and metadata
 */

import type { ControllerFieldState, Path } from 'react-hook-form';

import {
  formatCityWithPostalCode,
  formatStreetAddress,
} from '@/shared/lib/utils';
import {
  deriveValidationPropsFor,
  type ValidationProps,
} from '@/shared/lib/validation/helpers';

import type {
  CompanyFieldsState,
  StateConfig,
} from '../components/CompanyFields/types';
import { STATE_CONFIG } from '../components/CompanyFields/types';
import type { FinalContractData } from '../schema/companySchemas';
import { FORM_PATHS } from '../utils/formPaths';

// ============================================================================
// Discriminated Union Types for Field Configuration
// ============================================================================

/**
 * Base configuration - common fields for all field types
 *
 * NOTE: formName uses string for flexibility across different FormProvider contexts.
 * In CompanyFormData context: 'name', 'nip', 'regon', 'krs'
 * (no 'company.' prefix in Separate FormProviders architecture)
 *
 * formPath: Type-safe path to the field in FinalContractData schema.
 * Eliminates need for FIELD_PATH_MAP lookups and provides compile-time safety.
 */
interface FieldConfigBase {
  readonly key: string;
  readonly label: string;
  readonly formName: string;
  readonly formPath: Path<FinalContractData>;
  readonly required: boolean;
  readonly displayFormatter: (value: string) => string;
  readonly descriptionKey?: string;
  readonly validationDeriver?: (
    fieldState: ControllerFieldState
  ) => ValidationProps;
}

/**
 * Text field configuration (name)
 * Full-width text input with placeholder
 */
type TextFieldConfig = FieldConfigBase & {
  readonly type: 'text';
  readonly placeholder: string;
  readonly gridColumn: 'full';
};

/**
 * Business number field configuration (regon, krs)
 * Half-width business number input with specific type
 */
type BusinessNumberFieldConfig = FieldConfigBase & {
  readonly type: 'business-number';
  readonly businessType: 'regon' | 'krs';
  readonly gridColumn: 'half';
};

/**
 * Hidden field configuration (nip)
 * Not rendered in main section - handled separately
 */
type HiddenFieldConfig = FieldConfigBase & {
  readonly type: 'hidden';
  readonly renderInMainSection: false;
};

/**
 * Discriminated union of all field configuration types
 * Use switch on `type` field for type-safe handling
 */
export type FieldConfig =
  | TextFieldConfig
  | BusinessNumberFieldConfig
  | HiddenFieldConfig;

/**
 * Complete configuration object for all company fields
 * Ensures each field has the correct type
 */
export interface CompanyFieldsConfig {
  readonly name: TextFieldConfig;
  readonly nip: HiddenFieldConfig;
  readonly regon: BusinessNumberFieldConfig;
  readonly krs: BusinessNumberFieldConfig;
}

/**
 * Format KRS number for display (remove leading zeros)
 */
function formatKrs(krs: string | undefined): string {
  if (!krs) return '';
  // Remove leading zeros for display
  const formatted = krs.replace(/^0+/, '');
  return formatted || '0';
}

/**
 * Format KRS for display with "Nie dotyczy" fallback
 * Used in display-only mode to show user-friendly text for missing KRS
 */
function formatKrsForDisplay(krs: string | undefined): string {
  const formatted = formatKrs(krs);
  if (!formatted) {
    return 'Nie dotyczy';
  }
  return formatted.padStart(10, '0');
}

/**
 * Company field metadata configuration
 * Single source of truth for all field labels, form names, and formatting
 *
 * Benefits:
 * - Eliminates label duplication between display and form modes
 * - Centralized formatting logic for each field
 * - Type-safe field references
 * - Easy to add new fields or modify existing ones
 *
 * @example
 * ```typescript
 * // Display mode:
 * <DataRow
 *   label={COMPANY_FIELDS_CONFIG.name.label}
 *   value={COMPANY_FIELDS_CONFIG.name.displayFormatter(data.name)}
 * />
 *
 * // Form mode:
 * <TypedFormField
 *   name={COMPANY_FIELDS_CONFIG.name.formName}
 *   label={getFieldLabel('name')}
 * />
 * ```
 */
export const COMPANY_FIELDS_CONFIG = {
  name: {
    key: 'name' as const,
    descriptionKey: 'companyName' as const,
    label: 'Nazwa firmy',
    formName: 'name' as const,
    formPath: FORM_PATHS.COMPANY.NAME,
    required: true,
    displayFormatter: (value: string) => value,
    validationDeriver: (fieldState: ControllerFieldState) =>
      deriveValidationPropsFor('companyName', fieldState),
    type: 'text' as const,
    placeholder: 'np. Przykładowa Firma sp. z o.o.',
    gridColumn: 'full' as const,
  },
  nip: {
    key: 'nip' as const,
    label: 'NIP',
    formName: 'nip' as const,
    formPath: FORM_PATHS.COMPANY.NIP,
    required: true,
    displayFormatter: (value: string) => value,
    type: 'hidden' as const,
    // NIP field is handled separately (in NipInputSection)
    // Not rendered in CompanyFields main section
    renderInMainSection: false as const,
  },
  regon: {
    key: 'regon' as const,
    label: 'REGON',
    formName: 'regon' as const,
    formPath: FORM_PATHS.COMPANY.REGON,
    required: true,
    displayFormatter: (value: string) => value,
    validationDeriver: (fieldState: ControllerFieldState) =>
      deriveValidationPropsFor('regon', fieldState),
    type: 'business-number' as const,
    businessType: 'regon' as const,
    gridColumn: 'half' as const,
  },
  krs: {
    key: 'krs' as const,
    label: 'KRS',
    formName: 'krs' as const,
    formPath: FORM_PATHS.COMPANY.KRS,
    required: false,
    displayFormatter: formatKrsForDisplay,
    validationDeriver: (fieldState: ControllerFieldState) =>
      deriveValidationPropsFor('krs', fieldState),
    type: 'business-number' as const,
    businessType: 'krs' as const,
    gridColumn: 'half' as const,
  },
} as const satisfies CompanyFieldsConfig;

/**
 * Address display configuration for display-only mode
 *
 * Centralizes address formatting logic in a configuration object.
 * This decouples the presentation layer from formatting utilities.
 *
 * WHY SEPARATE FROM COMPANY_FIELDS_CONFIG:
 * - Address is a composite field (multiple display rows for one data field)
 * - Only used in display-only mode (not rendered in form fields)
 * - Different structure than simple scalar fields (name, nip, etc.)
 * - Avoids overloading COMPANY_FIELDS_CONFIG with display-only concerns
 *
 * @example
 * ```tsx
 * <DataSection title="Adres firmy">
 *   {ADDRESS_DISPLAY_CONFIG.map(({ key, label, formatter }) => (
 *     <DataRow
 *       key={key}
 *       label={label}
 *       value={formatter(companyData.address)}
 *     />
 *   ))}
 * </DataSection>
 * ```
 */
export const ADDRESS_DISPLAY_CONFIG = [
  {
    key: 'street' as const,
    label: 'Ulica i numer',
    formatter: formatStreetAddress,
  },
  {
    key: 'city' as const,
    label: 'Miasto',
    formatter: formatCityWithPostalCode,
  },
] as const;

/**
 * Type for address display configuration entries
 */
export type AddressDisplayEntry = (typeof ADDRESS_DISPLAY_CONFIG)[number];

/**
 * Type for field keys that should be rendered in identification section
 */
export type IdentificationFieldKey = 'name' | 'nip' | 'regon' | 'krs';

/**
 * Ordered array of identification fields for consistent rendering
 * This defines the order and fields to render in the identification section
 *
 * Benefits:
 * - Single source of truth for field order
 * - Easy to reorder fields (just change array order)
 * - Type-safe iteration over fields
 * - Automatic filtering of NIP (renderInMainSection: false)
 */
export const IDENTIFICATION_FIELDS_ORDER: readonly IdentificationFieldKey[] = [
  'name',
  'nip',
  'regon',
  'krs',
] as const;

/**
 * Get identification fields that should be rendered in main section
 * Filters out fields like NIP that are handled separately
 */
export function getIdentificationFieldsForRendering(): {
  key: IdentificationFieldKey;
  config: (typeof COMPANY_FIELDS_CONFIG)[IdentificationFieldKey];
}[] {
  return IDENTIFICATION_FIELDS_ORDER.filter(key => {
    const config = COMPANY_FIELDS_CONFIG[key];
    // Filter out fields that should not be rendered in main section
    return (
      !('renderInMainSection' in config) || config.renderInMainSection !== false
    );
  }).map(key => ({
    key,
    config: COMPANY_FIELDS_CONFIG[key],
  }));
}

/**
 * Get field label with asterisk for required fields
 *
 * @param field - Field key from COMPANY_FIELDS_CONFIG
 * @returns Label string with asterisk prefix if field is required
 *
 * @example
 * ```typescript
 * getFieldLabel('name')  // Returns: "*Nazwa firmy"
 * getFieldLabel('krs')   // Returns: "KRS"
 * ```
 */
export function getFieldLabel(
  field: keyof typeof COMPANY_FIELDS_CONFIG
): string {
  const config = COMPANY_FIELDS_CONFIG[field];
  return config.required ? `*${config.label}` : config.label;
}

/**
 * Subtitle mappings for each state
 * Centralized here for easy maintenance and testing
 */
const SUBTITLE_BY_STATE: Record<CompanyFieldsState, string | undefined> = {
  disabled: '(Pobierz dane firmy, aby odblokować pola)',
  loading: undefined,
  active: '(możesz edytować poniższe dane)',
  populated: '(pobrane z rejestru GUS)',
  'edit-mode': '(wypełnij wszystkie wymagane pola)',
};

/**
 * Address section subtitle mappings
 */
const ADDRESS_SUBTITLE_BY_STATE: Record<
  CompanyFieldsState,
  string | undefined
> = {
  disabled: undefined,
  loading: undefined,
  active: undefined,
  populated: '(adres siedziby z rejestru)',
  'edit-mode': '(adres siedziby zgodny z rejestrem)',
};

/**
 * Help text configuration for different states
 */
const HELP_TEXT_BY_STATE: Record<CompanyFieldsState, string | undefined> = {
  disabled: undefined,
  loading: undefined,
  active: undefined,
  populated: undefined,
  'edit-mode':
    'Upewnij się, że wprowadzone dane są zgodne z aktualnymi dokumentami rejestrowymi firmy. W przypadku wątpliwości sprawdź dane w wypisie z KRS lub zaświadczeniu o wpisie do CEIDG.',
};

interface UseCompanyFieldsConfigOptions {
  /** Custom title override */
  title?: string;
  /** Custom subtitle override */
  subtitle?: string;
}

interface CompanyFieldsConfig extends StateConfig {
  /** Section title */
  sectionTitle: string;
  /** Section subtitle */
  sectionSubtitle?: string;
  /** Address section subtitle */
  addressSubtitle?: string;
  /** Help text for the current state */
  helpText?: string;
  /** Address fields variant based on state */
  addressVariant:
    | 'default'
    | 'success-filled'
    | 'disabled-success'
    | 'disabled-muted'
    | undefined;
  /** Address fields className based on state */
  addressClassName: string | undefined;
  /** Field variant for identification fields */
  fieldVariant:
    | 'default'
    | 'success-filled'
    | 'disabled-success'
    | 'disabled-muted'
    | undefined;
}

/**
 * Custom hook for CompanyFields configuration
 *
 * This hook centralizes all business logic related to determining
 * what content and configuration should be displayed based on the
 * current state of the company fields.
 *
 * @param state - Current state of the company fields
 * @param options - Optional overrides for title and subtitle
 * @returns Complete configuration for rendering CompanyFields
 *
 * @example
 * ```tsx
 * const config = useCompanyFieldsConfig('active', {
 *   title: 'Company Information'
 * });
 *
 * // Use config values in render
 * <h3>{config.sectionTitle}</h3>
 * {config.sectionSubtitle && <span>{config.sectionSubtitle}</span>}
 * ```
 */
export function useCompanyFieldsConfig(
  state: CompanyFieldsState,
  options: UseCompanyFieldsConfigOptions = {}
): CompanyFieldsConfig {
  const { title, subtitle } = options;

  // Section title with fallback
  const sectionTitle = title ?? 'Dane firmy';

  // Section subtitle based on state
  const sectionSubtitle = subtitle ?? SUBTITLE_BY_STATE[state];

  // Address subtitle based on state
  const addressSubtitle = ADDRESS_SUBTITLE_BY_STATE[state];

  // Help text based on state
  const helpText = HELP_TEXT_BY_STATE[state];

  // Get state configuration
  const stateConfig = STATE_CONFIG[state];

  // Address field configuration based on state
  const addressVariant =
    stateConfig.readonly && state === 'populated'
      ? ('success-filled' as const)
      : stateConfig.readonly && state === 'disabled'
        ? ('disabled-muted' as const)
        : undefined;

  const addressClassName = undefined;

  // Field variant configuration - same logic as address variant
  const fieldVariant =
    stateConfig.readonly && state === 'populated'
      ? ('success-filled' as const)
      : stateConfig.readonly && state === 'disabled'
        ? ('disabled-muted' as const)
        : undefined;

  return {
    ...stateConfig,
    sectionTitle,
    sectionSubtitle,
    addressSubtitle,
    helpText,
    addressVariant,
    addressClassName,
    fieldVariant,
  };
}

/**
 * Helper function to determine field descriptions based on state
 *
 * Accepts IdentificationFieldKey and uses descriptionKey from config for lookups.
 * This eliminates the need for magic string transformations in FieldRenderer.
 *
 * @param state - Current state
 * @param fieldKey - Field key from COMPANY_FIELDS_CONFIG
 * @returns Appropriate description for the field
 */
export function getFieldDescription(
  state: CompanyFieldsState,
  fieldKey: IdentificationFieldKey
): string {
  // Map fieldKey to description lookup key using config
  // For 'name', this uses descriptionKey ('companyName')
  // For other fields, it uses the key itself
  const config = COMPANY_FIELDS_CONFIG[fieldKey];
  const descriptionKey: 'companyName' | 'regon' | 'krs' =
    'descriptionKey' in config
      ? (config.descriptionKey as 'companyName')
      : (fieldKey as 'regon' | 'krs');

  const descriptions = {
    companyName: {
      populated: '',
      default: '',
    },
    regon: {
      populated: 'Numer REGON z rejestru GUS',
      default: '9 lub 14 cyfr',
    },
    krs: {
      populated: 'Numer KRS z rejestru sądowego',
      disabled: 'Pole opcjonalne – nie wszystkie podmioty posiadają KRS',
      default: 'Opcjonalne (dotyczy spółek, stowarzyszeń)',
    },
  };

  const fieldDescriptions = descriptions[descriptionKey];

  if (descriptionKey === 'krs' && state === 'disabled') {
    return (fieldDescriptions as typeof descriptions.krs).disabled;
  }

  if (state === 'populated' && 'populated' in fieldDescriptions) {
    return fieldDescriptions.populated;
  }

  return fieldDescriptions.default;
}
