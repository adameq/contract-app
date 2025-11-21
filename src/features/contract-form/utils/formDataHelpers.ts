/**
 * Form Data Helpers
 *
 * Performance-optimized utilities for form data manipulation.
 * Reduces deep merge overhead in hooks.
 *
 * ## OPTIMIZATION STRATEGIES
 *
 * 1. **Shallow comparison before stringify**
 *    - Avoids expensive JSON.stringify when possible
 *    - Checks primitive fields first (userType, signatureMethod)
 *
 * 2. **Module-level memoization**
 *    - Pre-computed default values
 *    - Reused across hook calls
 */

import type {
  CompanyFormData,
  ConsumerFormData,
  ConsumerVatFormData,
  FinalContractData,
} from '../schema/companySchemas';
import {
  defaultCompanyValues,
  defaultConsumerValues,
  defaultConsumerVatValues,
} from '../schema/companySchemas';
import { defaultSharedValues } from '../schema/sharedSchema';

/**
 * Shallow comparison of form data primitives
 *
 * Compares top-level primitive fields to quickly detect changes
 * without expensive JSON.stringify. If primitives differ, data changed.
 *
 * @param a - First data object
 * @param b - Second data object
 * @returns true if primitives are identical
 */
export function shallowCompareFormData(
  a: FinalContractData | null,
  b: FinalContractData | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  // Compare primitive fields (fast)
  return (
    a.userType === b.userType &&
    a.signatureMethod === b.signatureMethod &&
    a.personalData?.firstName === b.personalData?.firstName &&
    a.personalData?.lastName === b.personalData?.lastName &&
    a.personalData?.pesel === b.personalData?.pesel
  );
}

/**
 * Get cleaned company data for userType
 *
 * Returns deeply-cloned default values for new userType.
 * Uses structuredClone for performance when available.
 *
 * @param userType - Target user type
 * @returns Cleaned company data matching userType schema
 */
export function getCleanedCompanyData(
  userType: FinalContractData['userType']
): CompanyFormData | ConsumerVatFormData | ConsumerFormData {
  switch (userType) {
    case 'company':
      // Deep clone to prevent reference sharing
      return typeof structuredClone === 'function'
        ? structuredClone(defaultCompanyValues)
        : {
            ...defaultCompanyValues,
            address: { ...defaultCompanyValues.address },
          };

    case 'consumer-vat':
      return typeof structuredClone === 'function'
        ? structuredClone(defaultConsumerVatValues)
        : {
            ...defaultConsumerVatValues,
            vatStatus: defaultConsumerVatValues.vatStatus
              ? { ...defaultConsumerVatValues.vatStatus }
              : undefined,
          };

    case 'consumer':
    case 'none':
    default:
      return typeof structuredClone === 'function'
        ? structuredClone(defaultConsumerValues)
        : { ...defaultConsumerValues };
  }
}

/**
 * Filter out undefined values from an object
 *
 * This prevents undefined values from overriding default empty strings
 * during merge operations, which causes React "uncontrolled to controlled" warnings.
 *
 * @param obj - Object to filter
 * @returns Object with undefined values removed
 *
 * @example
 * ```typescript
 * filterUndefined({ a: 1, b: undefined, c: '' })
 * // Returns: { a: 1, c: '' }
 * ```
 */
function filterUndefined<T extends Record<string, unknown>>(
  obj: T | undefined
): Partial<T> {
  if (!obj) return {};
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * Merge form data with defaults
 *
 * Ensures all required fields are defined (prevents "uncontrolled to controlled" warnings).
 * Optimized with structuredClone when available.
 *
 * IMPORTANT: Filters out undefined values from saved data to ensure they don't
 * override default empty strings, which would cause React controlled/uncontrolled warnings.
 *
 * @param savedData - Saved form data (potentially incomplete)
 * @returns Complete form data with all fields defined
 */
export function mergeWithDefaults(
  savedData: Partial<FinalContractData> | null
): FinalContractData {
  if (!savedData) {
    return typeof structuredClone === 'function'
      ? structuredClone(defaultSharedValues)
      : { ...defaultSharedValues };
  }

  // Use structuredClone for base if available
  const base =
    typeof structuredClone === 'function'
      ? structuredClone(defaultSharedValues)
      : { ...defaultSharedValues };

  // Deep merge saved data
  const merged: FinalContractData = {
    ...base,
    ...savedData,
    personalData: {
      ...base.personalData,
      ...filterUndefined(savedData.personalData),
    },
    correspondence: {
      ...base.correspondence,
      address: {
        ...base.correspondence.address,
        ...filterUndefined(savedData.correspondence?.address),
      },
    },
    pepDeclarations: {
      ...base.pepDeclarations,
      ...savedData.pepDeclarations,
      personalData: {
        ...base.pepDeclarations.personalData,
        ...filterUndefined(savedData.pepDeclarations?.personalData),
      },
      familyData: {
        ...base.pepDeclarations.familyData,
        ...filterUndefined(savedData.pepDeclarations?.familyData),
      },
      coworkerData: {
        ...base.pepDeclarations.coworkerData,
        ...filterUndefined(savedData.pepDeclarations?.coworkerData),
      },
    },
    // Preserve company data if exists, otherwise use base default
    // Type assertion safe because savedData.company matches userType if it exists
    company: (savedData.company ??
      base.company) as FinalContractData['company'],
  };

  return merged;
}

/**
 * Build cleaned form data for userType change
 *
 * Constructs complete form data with:
 * - Current form values (preserved)
 * - New userType
 * - Cleaned company data matching new userType
 *
 * Optimized for userType change cleanup.
 *
 * @param currentData - Current form data
 * @param newUserType - Target user type
 * @returns Complete cleaned form data
 */
export function buildCleanedFormData(
  currentData: FinalContractData,
  newUserType: FinalContractData['userType']
): FinalContractData {
  const newCompanyData = getCleanedCompanyData(newUserType);

  // Use structuredClone for base if available
  const base =
    typeof structuredClone === 'function'
      ? structuredClone(defaultSharedValues)
      : { ...defaultSharedValues };

  return {
    ...base,
    ...currentData,
    personalData: {
      ...base.personalData,
      ...filterUndefined(currentData.personalData),
    },
    correspondence: {
      ...base.correspondence,
      address: {
        ...base.correspondence.address,
        ...filterUndefined(currentData.correspondence?.address),
      },
    },
    pepDeclarations: {
      ...base.pepDeclarations,
      ...currentData.pepDeclarations,
      personalData: {
        ...base.pepDeclarations.personalData,
        ...filterUndefined(currentData.pepDeclarations?.personalData),
      },
      familyData: {
        ...base.pepDeclarations.familyData,
        ...filterUndefined(currentData.pepDeclarations?.familyData),
      },
      coworkerData: {
        ...base.pepDeclarations.coworkerData,
        ...filterUndefined(currentData.pepDeclarations?.coworkerData),
      },
    },
    userType: newUserType, // NEW userType
    company: newCompanyData, // NEW cleaned company data
  };
}
