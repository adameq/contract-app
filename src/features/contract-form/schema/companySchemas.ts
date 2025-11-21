/**
 * Company Data Schemas
 *
 * Contains validation schemas for company-specific data based on user type:
 * - Company: Full company data (name, NIP, REGON, KRS, address)
 * - Consumer-VAT: Only NIP (for VAT whitelist verification)
 * - Consumer: Empty (no company data needed)
 *
 * These schemas are used by separate FormProviders that mount/unmount
 * based on user type selection, eliminating discriminated union complexity.
 *
 * Part of the Separate FormProviders architecture - each userType gets
 * its own isolated form with a single, non-discriminated data shape.
 */

import { z } from 'zod';

import {
  addressSchema,
  companyNameFieldSchema,
  EMPTY_ADDRESS,
  krsFieldSchema,
  nipFieldSchema,
  regonFieldSchema,
  registrySignatureFieldSchema,
} from './fieldSchemas';
// ============================================================================
// FINAL CONTRACT DATA (FOR SUBMISSION)
// ============================================================================
/**
 * Final Contract Data Validation
 *
 * This section provides Zod schemas to validate the merged contract data
 * before submission to the API.
 *
 * Architecture:
 * - During form filling: SharedFormData and CompanyFormData are separate
 * - At submission: useFormManager merges them into FinalContractData
 * - Before API call: finalContractSchema validates the merged data
 *
 * This provides defense-in-depth validation:
 * 1. Individual forms validate their own data (SharedFormData, CompanyFormData)
 * 2. Final schema validates the complete merged structure before API submission
 * 3. Prevents corrupted/invalid data from reaching the server
 */
import {
  defaultSharedValues,
  type SharedFormData,
  sharedFormSchema,
} from './sharedSchema';

// ============================================================================
// COMPANY USER TYPE
// ============================================================================

/**
 * Full company data schema for 'company' user type
 *
 * Validates all company fields:
 * - Company name (min 2 characters)
 * - NIP (10 digits, checksum validated)
 * - REGON (9 or 14 digits, required)
 * - KRS (10 digits or "0", optional - not all businesses have KRS)
 * - Company address (all fields required)
 */
export const companyDataSchema = z.object({
  name: companyNameFieldSchema,
  nip: nipFieldSchema,
  regon: regonFieldSchema,
  krs: krsFieldSchema.optional().default(''), // Optional - not all businesses have KRS
  registrySignature: registrySignatureFieldSchema,
  address: addressSchema,
});

export type CompanyFormData = z.infer<typeof companyDataSchema>;

/**
 * Default values for company form
 */
export const defaultCompanyValues: CompanyFormData = {
  name: '',
  nip: '',
  regon: '',
  krs: '',
  registrySignature: '',
  address: { ...EMPTY_ADDRESS },
};

// ============================================================================
// CONSUMER-VAT USER TYPE
// ============================================================================

/**
 * Consumer-VAT data schema for 'consumer-vat' user type
 *
 * Consumer-VAT is a PRIVATE PERSON who has a NIP for VAT purposes.
 * They don't run a business, so they only need:
 * - NIP (for VAT whitelist verification)
 * - VAT status (fetched from API)
 *
 * Note: No company name, REGON, KRS, or company address needed.
 */
export const consumerVatDataSchema = z.object({
  nip: nipFieldSchema,
  vatStatus: z
    .object({
      status: z.enum(['active', 'exempt', 'not-registered']).nullable(),
      isChecked: z.boolean(),
    })
    .optional(),
});

export type ConsumerVatFormData = z.infer<typeof consumerVatDataSchema>;

/**
 * Default values for consumer-vat form
 */
export const defaultConsumerVatValues: ConsumerVatFormData = {
  nip: '',
  vatStatus: {
    status: null,
    isChecked: false,
  },
};

// ============================================================================
// CONSUMER USER TYPE
// ============================================================================

/**
 * Consumer data schema for 'consumer' user type
 *
 * Regular consumers don't have any company data.
 * This is an empty schema for consistency.
 */
export const consumerDataSchema = z.object({});

export type ConsumerFormData = z.infer<typeof consumerDataSchema>;

/**
 * Default values for consumer form (empty)
 */
export const defaultConsumerValues: ConsumerFormData = {};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get default company data for a specific user type
 * Type-safe function that returns the correct defaults
 */
export function getDefaultCompanyData(userType: 'company'): CompanyFormData;
export function getDefaultCompanyData(
  userType: 'consumer-vat'
): ConsumerVatFormData;
export function getDefaultCompanyData(userType: 'consumer'): ConsumerFormData;
export function getDefaultCompanyData(
  userType: 'company' | 'consumer-vat' | 'consumer'
): CompanyFormData | ConsumerVatFormData | ConsumerFormData {
  switch (userType) {
    case 'company':
      return defaultCompanyValues;
    case 'consumer-vat':
      return defaultConsumerVatValues;
    case 'consumer':
      return defaultConsumerValues;
  }
}

/**
 * Union type of all company form data types
 * Used for storage and API communication
 */
export type AnyCompanyFormData =
  | CompanyFormData
  | ConsumerVatFormData
  | ConsumerFormData;

/**
 * Final contract data for 'company' user type
 */
export type FinalCompanyData = Omit<SharedFormData, 'userType'> & {
  userType: 'company';
  company: CompanyFormData;
};

/**
 * Final contract data for 'consumer-vat' user type
 */
export type FinalConsumerVatData = Omit<SharedFormData, 'userType'> & {
  userType: 'consumer-vat';
  company: ConsumerVatFormData;
};

/**
 * Final contract data for 'consumer' user type
 */
export type FinalConsumerData = Omit<SharedFormData, 'userType'> & {
  userType: 'consumer';
  company: ConsumerFormData;
};

/**
 * Final contract data for 'none' user type (not yet selected)
 */
export type FinalNoneData = Omit<SharedFormData, 'userType'> & {
  userType: 'none';
  company: ConsumerFormData; // Empty object
};

/**
 * Union of all final contract data types
 * This matches the structure of the original ContractFormData discriminated union
 */
export type FinalContractData =
  | FinalCompanyData
  | FinalConsumerVatData
  | FinalConsumerData
  | FinalNoneData;

/**
 * Default initial values for complete form
 *
 * Combines defaultSharedValues with defaultConsumerValues (empty)
 * to create a valid FinalContractData for 'none' userType.
 *
 * This is the single source of truth for initial/reset form state.
 * Used by:
 * - useFormInitialization (initial form values)
 * - useFormReset (reset to defaults)
 */
export const DEFAULT_FINAL_CONTRACT_DATA: FinalContractData = {
  ...defaultSharedValues,
  userType: 'none',
  company: defaultConsumerValues, // Empty object for 'none' type
};

// ============================================================================
// FINAL CONTRACT VALIDATION SCHEMAS
// ============================================================================

/**
 * Final contract schema for 'company' user type
 *
 * Validates merged data: SharedFormData + CompanyFormData
 */
const finalCompanySchema = sharedFormSchema.extend({
  userType: z.literal('company'),
  company: companyDataSchema,
});

/**
 * Final contract schema for 'consumer-vat' user type
 *
 * Validates merged data: SharedFormData + ConsumerVatFormData
 */
const finalConsumerVatSchema = sharedFormSchema.extend({
  userType: z.literal('consumer-vat'),
  company: consumerVatDataSchema,
});

/**
 * Final contract schema for 'consumer' user type
 *
 * Validates merged data: SharedFormData + empty company data
 */
const finalConsumerSchema = sharedFormSchema.extend({
  userType: z.literal('consumer'),
  company: consumerDataSchema,
});

/**
 * Final contract schema for 'none' user type
 *
 * Used during form initialization before user selects their type.
 * This is required for React Hook Form's resolver to work correctly
 * during the transient state when userType hasn't been selected yet.
 *
 * IMPORTANT: Forms with userType='none' cannot be submitted to API.
 * The final submission validation will reject 'none' userType.
 */
const finalNoneSchema = sharedFormSchema.extend({
  userType: z.literal('none'),
  company: consumerDataSchema, // Empty object, same as consumer
});

/**
 * Discriminated union schema for final contract data
 *
 * This schema validates the complete merged data during form editing.
 * It uses userType as the discriminator to determine which schema to apply.
 *
 * VALIDATION FLOW:
 * - During editing: Validates all user types including 'none' (transient state)
 * - Before submission: useFormSubmission filters out 'none' and rejects submission
 *
 * USER TYPES:
 * - 'none': Transient state (before selection) - cannot be submitted
 * - 'company': Full company data required
 * - 'consumer-vat': NIP required for VAT consumers
 * - 'consumer': No company data required
 *
 *
 * BENEFITS:
 * - Validates all fields during editing (real-time validation)
 * - Catches data corruption from sessionStorage/Zustand
 * - Type-safe validation (schema matches FinalContractData type)
 * - Works correctly in all form states including initialization
 *
 * @example
 * ```typescript
 * const result = finalContractSchema.safeParse(formData);
 * if (!result.success) {
 *   console.error('Validation failed:', result.error);
 * }
 * ```
 */
export const finalContractSchema = z.discriminatedUnion('userType', [
  finalNoneSchema, // ⚠️ Must be first for initialization to work
  finalCompanySchema,
  finalConsumerVatSchema,
  finalConsumerSchema,
]);
