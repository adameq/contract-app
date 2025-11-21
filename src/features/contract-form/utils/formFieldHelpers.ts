/**
 * Form Field Helpers
 *
 * Utilities for checking field completion and building required fields list.
 * Used by useFormCompletion hook to calculate form progress based on filled fields.
 */

import type { FormState } from 'react-hook-form';

import type { FinalContractData } from '../schema/companySchemas';
import { finalContractSchema } from '../schema/companySchemas';
import type { UserType } from '../schema/sharedSchema';

/**
 * Field path type for type-safe field access
 */
export type FieldPath = string;

/**
 * Get value from nested object using dot notation path
 * Simplified version of lodash.get
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;

  const keys = path.split('.');
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Get list of required fields based on user type
 *
 * Returns array of field paths (dot notation) that must be filled
 * for the form to be considered complete.
 *
 * @param userType - Current user type selection
 * @returns Array of required field paths
 */
export function getRequiredFieldsList(
  userType: UserType | 'none'
): FieldPath[] {
  // Base fields required for all user types
  const baseFields: FieldPath[] = [
    'signatureMethod',
    'personalData.firstName',
    'personalData.lastName',
    'personalData.pesel_or_withoutPesel', // Special: either pesel OR withoutPesel checkbox
    'personalData.phoneNumber',
    'personalData.email',
    'correspondence.address.street',
    'correspondence.address.buildingNumber',
    'correspondence.address.city',
    'correspondence.address.postalCode',
    // PEP groups: each group includes flag + conditional fields
    'pepDeclarations.personal_group',
    'pepDeclarations.family_group',
    'pepDeclarations.coworker_group',
    'userType',
  ];

  // Additional fields based on user type
  const typeSpecificFields: Record<UserType | 'none', FieldPath[]> = {
    company: [
      'company.name',
      'company.nip',
      'company.regon',
      'company.address.street',
      'company.address.buildingNumber',
      'company.address.city',
      'company.address.postalCode',
    ],
    'consumer-vat': ['company.nip'],
    consumer: [],
    none: [],
  };

  return [...baseFields, ...typeSpecificFields[userType]];
}

/**
 * Check if PESEL field is completed
 *
 * PESEL is completed when:
 * - User filled in PESEL and it's valid (no errors), OR
 * - User checked "without PESEL" checkbox
 */
function isPeselCompleted(
  formData: Partial<FinalContractData>,
  errors: FormState<FinalContractData>['errors']
): boolean {
  const personalData = formData.personalData;
  if (!personalData) return false;

  // If "without PESEL" is checked, consider it completed
  if (personalData.withoutPesel === true) {
    return true;
  }

  // Otherwise, PESEL must be filled and valid
  const peselValue = personalData.pesel;
  const hasPeselError = !!errors.personalData?.pesel;

  return !!peselValue && peselValue.trim() !== '' && !hasPeselError;
}

/**
 * Check if PEP group (flag + conditional fields) is completed
 *
 * A PEP group is considered completed when:
 * 1. Flag is selected (true or false, not null)
 * 2. If flag is true, all conditional fields must be filled
 * 3. If flag is false, conditional fields are ignored
 *
 * @param formData - Current form data
 * @param section - Which PEP section (personal, family, coworker)
 * @returns true if group is completed
 */
function isPepGroupCompleted(
  formData: Partial<FinalContractData>,
  section: 'personal' | 'family' | 'coworker'
): boolean {
  const pepDeclarations = formData.pepDeclarations;
  if (!pepDeclarations) return false;

  // Configuration for each PEP section
  const sectionConfig = {
    personal: {
      flag: pepDeclarations.isPersonPEP,
      dataPath: 'personalData',
      fields: ['positionOrFunction', 'institutionName'],
    },
    family: {
      flag: pepDeclarations.isFamilyMemberPEP,
      dataPath: 'familyData',
      fields: [
        'familyMemberPoliticianName',
        'familyMemberRelationshipType',
        'familyMemberPosition',
        'familyMemberInstitution',
      ],
    },
    coworker: {
      flag: pepDeclarations.isCloseAssociatePEP,
      dataPath: 'coworkerData',
      fields: [
        'coworkerPoliticianName',
        'coworkerCooperationType',
        'coworkerPositionOrFunction',
        'coworkerInstitutionName',
      ],
    },
  }[section];

  // 1. Flag must be selected (true or false, not null)
  if (sectionConfig.flag === null || sectionConfig.flag === undefined) {
    return false; // User hasn't answered yet
  }

  // 2. If flag is false, group is completed (no fields required)
  if (sectionConfig.flag === false) {
    return true;
  }

  // 3. Flag is true - check all conditional fields are filled
  const sectionData = getNestedValue(
    pepDeclarations,
    sectionConfig.dataPath
  ) as Record<string, unknown> | undefined;

  if (!sectionData) return false;

  return sectionConfig.fields.every(fieldName => {
    const value = sectionData[fieldName];
    return typeof value === 'string' && value.trim() !== '';
  });
}

/**
 * Validate form data and get field-level errors
 *
 * Uses finalContractSchema.safeParse() to validate the complete form,
 * ensuring all validation logic (including superRefine) is properly executed.
 * This provides a single source of truth for validation.
 *
 * ARCHITECTURE:
 * - Validates complete FinalContractData using discriminated union schema
 * - Handles all validation including complex superRefine logic (PEP, PESEL)
 * - Returns map of field paths to error status for quick lookups
 * - More expensive than field-level validation, but comprehensive and maintainable
 *
 * @param formData - Current form data
 * @returns Map of field paths to whether they have errors
 */
function getFieldErrors(
  formData: Partial<FinalContractData>
): Map<string, boolean> {
  const errorMap = new Map<string, boolean>();

  // Skip validation if userType is 'none' (not yet a valid submission state)
  // This prevents validation errors on initial form load
  if (formData.userType === 'none') {
    return errorMap;
  }

  // Validate complete form data using discriminated union schema
  const result = finalContractSchema.safeParse(formData);

  // If validation succeeds, no fields have errors
  if (result.success) {
    return errorMap;
  }

  // Build error map from validation issues
  result.error.issues.forEach(issue => {
    const fieldPath = issue.path.join('.');
    errorMap.set(fieldPath, true);
  });

  return errorMap;
}

/**
 * Check if a field is valid according to Zod schema validation
 *
 * Uses cached error map from full form validation to determine if
 * a specific field has validation errors.
 *
 * @param fieldPath - Path to the field
 * @param errorMap - Map of field errors from getFieldErrors()
 * @returns true if field is valid (no errors), false otherwise
 */
function isFieldValid(
  fieldPath: FieldPath,
  errorMap: Map<string, boolean>
): boolean {
  return !errorMap.has(fieldPath);
}

/**
 * Check if a single field is completed
 *
 * A field is considered completed when:
 * 1. It has a non-empty value
 * 2. It passes Zod validation (checked via finalContractSchema.safeParse)
 * 3. Special rules for PESEL, PEP, etc. are satisfied
 *
 * ARCHITECTURE:
 * - Uses finalContractSchema.safeParse() for validation (single source of truth)
 * - Handles all validation including superRefine (PEP flags, PESEL conditional)
 * - More expensive than field-level validation, but comprehensive and maintainable
 * - Error map is built once per call to calculateFormCompletion and reused
 *
 * @param formData - Current form data
 * @param errors - Validation errors from React Hook Form (used for PESEL special case)
 * @param fieldPath - Path to the field (dot notation)
 * @param errorMap - Map of field errors from getFieldErrors() (optional, computed if not provided)
 */
export function isFieldCompleted(
  formData: Partial<FinalContractData>,
  errors: FormState<FinalContractData>['errors'],
  fieldPath: FieldPath,
  errorMap?: Map<string, boolean>
): boolean {
  // Special case: PESEL (either filled OR withoutPesel checked)
  if (fieldPath === 'personalData.pesel_or_withoutPesel') {
    return isPeselCompleted(formData, errors);
  }

  // Special case: PEP groups (flag + conditional fields)
  if (fieldPath === 'pepDeclarations.personal_group') {
    return isPepGroupCompleted(formData, 'personal');
  }
  if (fieldPath === 'pepDeclarations.family_group') {
    return isPepGroupCompleted(formData, 'family');
  }
  if (fieldPath === 'pepDeclarations.coworker_group') {
    return isPepGroupCompleted(formData, 'coworker');
  }

  // Standard field: get value and check with Zod validation
  const value = getNestedValue(formData, fieldPath);

  // Check value based on type FIRST
  // Empty fields are never completed, regardless of validation
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;

  // Checkboxes are always "completed" once set
  if (typeof value === 'boolean') return true;

  // For 'userType' field, 'none' is not a valid completed state
  if (fieldPath === 'userType' && value === 'none') return false;

  // Field has value - now check if it passes Zod validation
  // Use provided error map, or compute if not provided
  const fieldErrorMap = errorMap ?? getFieldErrors(formData);
  return isFieldValid(fieldPath, fieldErrorMap);
}

/**
 * Count completed required fields
 *
 * ARCHITECTURE:
 * - Validates form once using finalContractSchema.safeParse()
 * - Builds error map once and reuses for all field checks
 * - This is more efficient than validating each field separately
 * - Single source of truth for validation (Zod schemas)
 *
 * @param formData - Current form data
 * @param errors - Validation errors from React Hook Form (used for PESEL special case)
 * @param userType - Current user type
 * @returns Object with completed count, total count, and percentage
 */
export function calculateFormCompletion(
  formData: Partial<FinalContractData>,
  errors: FormState<FinalContractData>['errors'],
  userType: UserType | 'none'
) {
  const requiredFields = getRequiredFieldsList(userType);

  // Build error map once and reuse for all field checks
  // This is more efficient than validating form separately for each field
  const errorMap = getFieldErrors(formData);

  const completedFields = requiredFields.filter(fieldPath =>
    isFieldCompleted(formData, errors, fieldPath, errorMap)
  );

  const completedCount = completedFields.length;
  const totalCount = requiredFields.length;
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    completedCount,
    totalCount,
    percentage,
  };
}
