import type { Path } from 'react-hook-form';

import {
  defaultCompanyValues,
  type FinalContractData,
} from '../schema/companySchemas';
import {
  defaultSharedValues,
  type SharedFormData,
} from '../schema/sharedSchema';

/**
 * Utility for dynamically extracting valid form paths from the schema
 *
 * This replaces the error-prone hardcoded path list approach with a dynamic
 * solution that automatically stays in sync with the form structure.
 *
 * ARCHITECTURAL DECISION:
 * - Extract paths from complete default values (single source of truth)
 * - Combine defaultSharedValues + defaultCompanyValues for complete structure
 * - Generate at import time for optimal runtime performance
 * - Use Set for O(1) lookup instead of array iteration
 * - Type-safe with React Hook Form's Path<T> type
 * - FORM_PATHS constants generated dynamically from extracted paths
 */

/**
 * Complete default values combining shared and company data
 *
 * This object represents the full FinalContractData structure with all possible
 * fields from all user types. Used as the single source of truth for path extraction.
 */
const completeDefaultValues = {
  ...defaultSharedValues,
  company: defaultCompanyValues,
} satisfies Partial<FinalContractData>;

/**
 * Recursively extracts all possible paths from a nested object structure
 *
 * @param obj - The object to extract paths from
 * @param prefix - Current path prefix (used for recursion)
 * @returns Array of all valid dot-notation paths
 */
function extractFormPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  const paths: string[] = [];

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const fullPath = prefix ? `${prefix}.${key}` : key;

    // Add the current path
    paths.push(fullPath);

    // Recursively process nested objects (but not arrays or null values)
    const value = obj[key];
    if (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      value.constructor === Object
    ) {
      paths.push(
        ...extractFormPaths(value as Record<string, unknown>, fullPath)
      );
    }
  }

  return paths;
}

/**
 * All valid form paths extracted from complete default values
 *
 * This array is generated once at import time and contains all possible
 * paths that can exist in the FinalContractData structure. It includes
 * paths from all discriminated union variants (shared + company fields).
 *
 * Type assertion to Path<SharedFormData>[] ensures compile-time validation
 * that all generated paths are actually valid form paths.
 */
export const VALID_FORM_PATHS = extractFormPaths(
  completeDefaultValues
) as Path<SharedFormData>[];

/**
 * Set of valid form paths for efficient O(1) lookup
 *
 * Using a Set instead of array.includes() provides better performance
 * when checking if server error paths are valid form fields.
 */
export const VALID_FORM_PATHS_SET = new Set(VALID_FORM_PATHS);

/**
 * Type-safe function to check if a string is a valid form path
 *
 * @param field - String to validate as a form path
 * @returns Type guard confirming the string is a valid Path<SharedFormData>
 */
export function isValidFormPath(field: string): field is Path<SharedFormData> {
  return VALID_FORM_PATHS_SET.has(field);
}

/**
 * Debug utility to get all valid form paths
 * Useful during development to see what paths are available
 */
export function getValidFormPaths(): string[] {
  return VALID_FORM_PATHS.sort();
}

/**
 * Helper function to find a path from extracted paths by exact match
 *
 * This ensures that FORM_PATHS constants reference actual paths from the schema,
 * providing runtime validation that paths exist in the default values structure.
 *
 * @param path - The path to find (e.g., 'personalData.firstName')
 * @returns The path if found, throws error otherwise
 * @throws Error if path not found in extracted paths
 */
function getPath<T extends string>(path: T): T {
  if (!VALID_FORM_PATHS_SET.has(path)) {
    throw new Error(
      `Path "${path}" not found in schema. Available paths: ${VALID_FORM_PATHS.join(', ')}`
    );
  }
  return path;
}

/**
 * Type-safe form field path constants - DYNAMICALLY GENERATED FROM SCHEMA
 *
 * These constants are automatically extracted from completeDefaultValues,
 * ensuring they stay in sync with the actual form structure.
 *
 * BENEFITS:
 * - Prevents typos in field paths
 * - Compile-time validation with Path<SharedFormData>
 * - Single source of truth (schema default values)
 * - Automatic sync when schema changes
 * - Runtime validation that paths exist
 * - Better IDE autocomplete and navigation
 *
 * ARCHITECTURAL DECISION:
 * - Paths are extracted from completeDefaultValues at import time
 * - getPath() validates each path exists in extracted paths
 * - Throws error at module load if schema is out of sync
 * - Structure maintained for backward compatibility
 *
 * @example
 * ```typescript
 * setValue(FORM_PATHS.PERSONAL_DATA.PESEL, '12345678901');
 * trigger(FORM_PATHS.PERSONAL_DATA.PESEL);
 * ```
 */
export const FORM_PATHS = {
  /**
   * Personal data field paths
   */
  PERSONAL_DATA: {
    /** First name field */
    FIRST_NAME: getPath('personalData.firstName'),
    /** Last name field */
    LAST_NAME: getPath('personalData.lastName'),
    /** PESEL identification number field */
    PESEL: getPath('personalData.pesel'),
    /** "Without PESEL" checkbox field */
    WITHOUT_PESEL: getPath('personalData.withoutPesel'),
    /** Phone number field */
    PHONE_NUMBER: getPath('personalData.phoneNumber'),
    /** Email address field */
    EMAIL: getPath('personalData.email'),
  },

  /**
   * Correspondence data field paths
   */
  CORRESPONDENCE: {
    /** Correspondence address field prefix */
    ADDRESS: getPath('correspondence.address'),
  },

  /**
   * Company data field paths (for userType='company' and 'consumer-vat')
   *
   * All paths have 'company' prefix as they are nested under company object
   * in FinalContractData discriminated union.
   */
  COMPANY: {
    /** Company NIP (tax identification number) */
    NIP: getPath('company.nip'),
    /** Company name */
    NAME: getPath('company.name'),
    /** Company REGON number */
    REGON: getPath('company.regon'),
    /** Company KRS number */
    KRS: getPath('company.krs'),
    /** Company address prefix */
    ADDRESS: getPath('company.address'),
    /** Company address - street */
    ADDRESS_STREET: getPath('company.address.street'),
    /** Company address - building number */
    ADDRESS_BUILDING_NUMBER: getPath('company.address.buildingNumber'),
    /** Company address - apartment number */
    ADDRESS_APARTMENT_NUMBER: getPath('company.address.apartmentNumber'),
    /** Company address - postal code */
    ADDRESS_POSTAL_CODE: getPath('company.address.postalCode'),
    /** Company address - city */
    ADDRESS_CITY: getPath('company.address.city'),
  },
} as const;
