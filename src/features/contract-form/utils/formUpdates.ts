/**
 * Form Update Utilities - Pure functions for explicit form state management
 *
 * This module provides explicit, controllable form update functions that replace
 * the anti-pattern of automatic useEffect-based form updates in hooks.
 *
 * **Philosophy**:
 * - 🎯 **Explicit over Implicit**: Components decide when to update forms
 * - ⚡ **Performance**: Uses React Hook Form's optimized reset() for batch updates
 * - 🧪 **Testable**: Pure functions are easier to test than useEffect side effects
 * - 🔄 **Controllable**: Components can decide whether to use API data or preserve user edits
 *
 * **Usage Pattern**:
 * ```tsx
 * // ✅ NEW: Explicit pattern (recommended)
 * const taxData = useTaxDataCoordination(nip, userType); // Pure data hook
 * const formMethods = useFormContext();
 *
 * const handleUseApiData = useCallback(() => {
 *   if (taxData?.companyData) {
 *     updateFormWithCompanyData(taxData.companyData, formMethods);
 *   }
 * }, [taxData, formMethods]);
 *
 * // ❌ OLD: Automatic pattern (deprecated)
 * const { taxData } = useTaxDataWithForm(nip, userType); // Auto-updates in useEffect
 * ```
 */

import type { UseFormReturn } from 'react-hook-form';

import type { CompanyData } from '@/shared/api/types';

import type {
  CompanyFormData,
  FinalContractData,
} from '../schema/companySchemas';

/**
 * Type for React Hook Form methods needed for updates
 * Works with FinalContractData (Single FormProvider pattern)
 */
type FormMethods = Pick<
  UseFormReturn<FinalContractData>,
  'getValues' | 'reset' | 'setValue' | 'formState'
>;

/**
 * Options for form update behavior
 */
export interface FormUpdateOptions {
  /** Whether to trigger validation after update */
  shouldValidate?: boolean;
  /** Whether to mark fields as touched */
  shouldTouch?: boolean;
  /** Whether to preserve existing user edits (merge with API data) */
  preserveUserEdits?: boolean;
}

/**
 * Default options for form updates
 */
const DEFAULT_UPDATE_OPTIONS: FormUpdateOptions = {
  shouldValidate: false,
  shouldTouch: false,
  preserveUserEdits: false,
};

/**
 * Update form with company data from API
 *
 * Works with FinalContractData in Single FormProvider architecture.
 *
 * **Performance**: Uses setValue() for optimal nested updates.
 *
 * **KRS Support**: Automatically populates KRS field from API response.
 * API returns empty string for entities without KRS (e.g., CEIDG businesses).
 *
 * @param companyData - Company data from API
 * @param formMethods - React Hook Form methods (FinalContractData)
 * @param options - Update behavior options
 *
 * @example
 * ```tsx
 * updateFormWithCompanyData(apiData, formMethods, {
 *   preserveUserEdits: true
 * });
 * // Updates: company.nip, company.name, company.regon, etc.
 * ```
 */
export function updateFormWithCompanyData(
  companyData: CompanyData,
  formMethods: FormMethods,
  options?: FormUpdateOptions
): void {
  const opts = { ...DEFAULT_UPDATE_OPTIONS, ...options };
  const { getValues, setValue, formState } = formMethods;

  // Extract current company data from nested context (FinalContractData)
  const currentValues = getValues();
  const currentCompanyData = (currentValues.company ?? {}) as CompanyFormData;

  // Extract dirty fields from nested path
  const nestedDirtyFields = formState.dirtyFields as Record<string, unknown>;
  const dirtyFields =
    (nestedDirtyFields.company as Partial<
      Record<keyof CompanyFormData, boolean | object>
    >) ?? {};

  // Prepare company data update with API data (supports KRS for companies from KRS registry)
  const companyUpdate: CompanyFormData = {
    name: companyData.name ?? '',
    nip: currentCompanyData?.nip ?? '', // Preserve NIP (user input)
    regon: companyData.regon ?? '',
    // Use KRS from API (empty string if not in KRS registry)
    krs: companyData.krs, // API always returns string (value or '')
    registrySignature: companyData.registrySignature ?? '',
    address: {
      street: companyData.address.street ?? '',
      buildingNumber: companyData.address.buildingNumber ?? '',
      apartmentNumber: companyData.address.apartmentNumber ?? '',
      city: companyData.address.city ?? '',
      postalCode: companyData.address.postalCode ?? '',
    },
  };

  const finalCompanyData = opts.preserveUserEdits
    ? mergeCompanyData(currentCompanyData, companyUpdate, dirtyFields)
    : companyUpdate;

  // Update form using setValue with 'company' path (nested context in FinalContractData)
  setValue('company', finalCompanyData, {
    shouldValidate: opts.shouldValidate,
    shouldTouch: opts.shouldTouch,
    shouldDirty: true,
  });
}

/**
 * Smart merge function that preserves user edits when they exist
 *
 * Works with CompanyFormData within FinalContractData (Single FormProvider pattern).
 *
 * **User Edit Detection:**
 * - Uses React Hook Form's dirtyFields to distinguish:
 *   - "User touched this field" (preserve value, even if empty)
 *   - "Field untouched" (use API data)
 * - This prevents data loss when user intentionally clears a field
 *
 * @param currentData - Current form data (may include user edits)
 * @param apiData - Fresh data from API
 * @param dirtyFields - React Hook Form's dirty field tracking
 * @returns Merged data preserving user edits based on dirtyFields
 */
function mergeCompanyData(
  currentData: CompanyFormData,
  apiData: Partial<CompanyFormData>,
  dirtyFields: Partial<Record<keyof CompanyFormData, boolean | object>>
): CompanyFormData {
  return {
    // Preserve dirty fields (user edited), use API data for clean fields
    name: dirtyFields.name ? currentData.name : (apiData.name ?? ''),
    nip: currentData.nip ?? apiData.nip ?? '', // Usually preserve user NIP input
    regon: dirtyFields.regon ? currentData.regon : (apiData.regon ?? ''),
    // Prefer API KRS data unless user edited it
    krs: dirtyFields.krs ? (currentData.krs ?? '') : (apiData.krs ?? ''),
    // Preserve registry signature if dirty (user manually edited), otherwise use API data
    registrySignature: dirtyFields.registrySignature
      ? (currentData.registrySignature ?? '')
      : (apiData.registrySignature ?? ''),
    address: {
      // For address, check if address object itself is dirty or individual fields
      street: (dirtyFields.address as { street?: boolean })?.street
        ? (currentData.address?.street ?? '')
        : (apiData.address?.street ?? ''),
      buildingNumber: (dirtyFields.address as { buildingNumber?: boolean })
        ?.buildingNumber
        ? (currentData.address?.buildingNumber ?? '')
        : (apiData.address?.buildingNumber ?? ''),
      apartmentNumber: (dirtyFields.address as { apartmentNumber?: boolean })
        ?.apartmentNumber
        ? (currentData.address?.apartmentNumber ?? '')
        : (apiData.address?.apartmentNumber ?? ''),
      city: (dirtyFields.address as { city?: boolean })?.city
        ? (currentData.address?.city ?? '')
        : (apiData.address?.city ?? ''),
      postalCode: (dirtyFields.address as { postalCode?: boolean })?.postalCode
        ? (currentData.address?.postalCode ?? '')
        : (apiData.address?.postalCode ?? ''),
    },
  };
}

/**
 * Utility to check if form data needs updating (prevents unnecessary updates)
 *
 * Works with CompanyFormData within FinalContractData (Single FormProvider pattern).
 *
 * @param currentData - Current form data
 * @param apiData - New API data
 * @returns true if update is needed
 */
export function shouldUpdateCompanyData(
  currentData: CompanyFormData,
  apiData: CompanyData
): boolean {
  return (
    currentData.name !== apiData.name ||
    currentData.regon !== apiData.regon ||
    currentData.krs !== apiData.krs || // API always returns string
    currentData.address.street !== apiData.address.street ||
    currentData.address.buildingNumber !== apiData.address.buildingNumber ||
    currentData.address.apartmentNumber !==
      (apiData.address.apartmentNumber ?? '') ||
    currentData.address.city !== apiData.address.city ||
    currentData.address.postalCode !== apiData.address.postalCode
  );
}
