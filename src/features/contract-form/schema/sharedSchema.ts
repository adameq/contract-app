/**
 * Shared Form Schema
 *
 * Contains validation schemas for data shared across all user types:
 * - Signature method
 * - Personal data
 * - Correspondence address
 * - PEP declarations
 * - User type selection
 *
 * This schema is used by the main FormProvider that wraps steps 1-4
 * and the user type selection in step 5.
 *
 * Part of the Separate FormProviders architecture that eliminates
 * discriminated union complexity and type assertions.
 */

import { z } from 'zod';

import { VALIDATION_MESSAGES } from '@/shared/lib/validation';

import {
  getPEPFlagBySection,
  getPEPFlagPathArray,
  pepSectionsConfig,
} from '../config/pepConfig';
import {
  buildValidationPath,
  getSectionDataByConfig,
  isFieldRequired,
} from '../utils/pepValidation';
import {
  addressSchema as fieldAddressSchema,
  emailFieldSchema,
  firstNameFieldSchema,
  lastNameFieldSchema,
  peselFieldSchema,
  phoneNumberFieldSchema,
} from './fieldSchemas';

// ============================================================================
// SIGNATURE METHOD
// ============================================================================

/**
 * Signature method - how the contract will be signed
 * Nullable to represent "not selected yet" state
 */
export const signatureMethodSchema = z
  .enum(['in-person', 'qualified'])
  .nullable();

export type SignatureMethod = NonNullable<
  z.infer<typeof signatureMethodSchema>
>;

// ============================================================================
// PERSONAL DATA
// ============================================================================

/**
 * Personal data schema with conditional PESEL validation
 * PESEL is required only when withoutPesel is false
 */
export const personalDataSchema = z
  .object({
    firstName: firstNameFieldSchema,
    lastName: lastNameFieldSchema,
    pesel: z.string(), // Base string, validation applied conditionally
    withoutPesel: z.boolean(),
    phoneNumber: phoneNumberFieldSchema,
    email: emailFieldSchema,
  })
  .superRefine((data, ctx) => {
    // PESEL validation only when user indicates they have one
    if (!data.withoutPesel) {
      const result = peselFieldSchema.safeParse(data.pesel);
      if (!result.success) {
        result.error.issues.forEach(issue => {
          ctx.addIssue({
            ...issue,
            path: ['pesel', ...issue.path],
          });
        });
      }
    }
  });

export type PersonalData = z.infer<typeof personalDataSchema>;

// ============================================================================
// CORRESPONDENCE ADDRESS
// ============================================================================

/**
 * Correspondence address schema
 * Uses field-level validation from fieldSchemas
 */
export const correspondenceSchema = z.object({
  address: fieldAddressSchema,
});

export type Correspondence = z.infer<typeof correspondenceSchema>;

// ============================================================================
// PEP DECLARATIONS
// ============================================================================

/**
 * PEP (Politically Exposed Person) sub-schemas
 */
const pepPersonalDataSchema = z.object({
  positionOrFunction: z.string(),
  institutionName: z.string(),
});

const pepFamilyDataSchema = z.object({
  familyMemberPoliticianName: z.string(),
  familyMemberRelationshipType: z.string(),
  familyMemberPosition: z.string(),
  familyMemberInstitution: z.string(),
});

const pepCoworkerDataSchema = z.object({
  coworkerPoliticianName: z.string(),
  coworkerCooperationType: z.string(),
  coworkerPositionOrFunction: z.string(),
  coworkerInstitutionName: z.string(),
});

/**
 * PEP Declarations Schema
 *
 * ✅ SIMPLIFIED ARCHITECTURE
 * All PEP configuration consolidated in pepConfig.ts (single source of truth).
 * Helper functions derive field access from the unified config.
 *
 * **To rename a field:**
 * 1. Update the field name here in the schema
 * 2. Update the corresponding field in pepConfig.ts (flagField/dataField)
 * 3. TypeScript will catch any remaining errors via type checking
 *
 * ✅ DATA SANITIZATION (Security Fix)
 * `.transform()` at the end clears nested field data when PEP flag is false.
 * Prevents accidental submission of hidden field values.
 *
 * @see src/features/contract-form/config/pepConfig.ts - Single source of truth for all PEP metadata
 * @see src/features/contract-form/utils/pepValidation.ts - Validation helper functions
 */
export const pepDeclarationsSchema = z
  .object({
    // Personal PEP
    isPersonPEP: z.boolean().nullable(),
    personalData: pepPersonalDataSchema,

    // Family PEP
    isFamilyMemberPEP: z.boolean().nullable(),
    familyData: pepFamilyDataSchema,

    // Coworker PEP
    isCloseAssociatePEP: z.boolean().nullable(),
    coworkerData: pepCoworkerDataSchema,
  })
  .superRefine((data, ctx) => {
    // Validate PEP flags and required fields
    pepSectionsConfig.forEach(config => {
      const isPepFlag = getPEPFlagBySection(data, config.id);

      // Check 1: Validate PEP flag is selected (not null or undefined)
      if (isPepFlag == null) {
        const flagMessages = {
          personal: VALIDATION_MESSAGES.REQUIRED.PEP_PERSONAL_SELECTION,
          family: VALIDATION_MESSAGES.REQUIRED.PEP_FAMILY_SELECTION,
          coworker: VALIDATION_MESSAGES.REQUIRED.PEP_COWORKER_SELECTION,
        };

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: flagMessages[config.id],
          path: [...getPEPFlagPathArray(config.id)],
        });
        return; // Skip field validation if flag not selected
      }

      // Check 2: Validate required fields when flag is true
      if (isPepFlag === true) {
        const sectionData = getSectionDataByConfig(data, config);

        config.fields.forEach(field => {
          const value = (sectionData as Record<string, unknown>)[field.name];
          if (
            isFieldRequired(field) &&
            (typeof value !== 'string' || value.trim().length === 0)
          ) {
            const message =
              VALIDATION_MESSAGES.REQUIRED[
                field.validationMessageKey as keyof typeof VALIDATION_MESSAGES.REQUIRED
              ];
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: message ?? `Pole ${field.label} jest wymagane`,
              path: buildValidationPath(config, field.name),
            });
          }
        });
      }
    });
  })
  .transform(data => {
    /**
     * ✅ SECURITY FIX: Clear nested field data when PEP flag is false
     *
     * PROBLEM:
     * Hidden fields (when isPep === false) remain registered in React Hook Form.
     * Their values are preserved for UX reasons (user can toggle back).
     * BUT these values would be submitted to API if not cleared here.
     *
     * SOLUTION:
     * Transform clears nested data objects when their flag is false,
     * ensuring only relevant data is submitted.
     *
     * EXAMPLE SCENARIO:
     * 1. User selects "TAK" (YES) and fills PEP details
     * 2. User changes to "NIE" (NO) - fields hidden but values preserved in RHF
     * 3. On submit, this transform clears those hidden field values
     * 4. API receives clean data: { isPersonPEP: false, personalData: { empty } }
     */
    return {
      ...data,
      // Clear personal PEP data when flag is false
      personalData:
        data.isPersonPEP === false
          ? { positionOrFunction: '', institutionName: '' }
          : data.personalData,
      // Clear family PEP data when flag is false
      familyData:
        data.isFamilyMemberPEP === false
          ? {
              familyMemberPoliticianName: '',
              familyMemberRelationshipType: '',
              familyMemberPosition: '',
              familyMemberInstitution: '',
            }
          : data.familyData,
      // Clear coworker PEP data when flag is false
      coworkerData:
        data.isCloseAssociatePEP === false
          ? {
              coworkerPoliticianName: '',
              coworkerCooperationType: '',
              coworkerPositionOrFunction: '',
              coworkerInstitutionName: '',
            }
          : data.coworkerData,
    };
  });

export type PEPDeclarations = z.infer<typeof pepDeclarationsSchema>;

// ============================================================================
// USER TYPE
// ============================================================================

/**
 * User type determines which company data fields are required
 */
export const userTypeSchema = z.enum([
  'company',
  'consumer-vat',
  'consumer',
  'none',
]);

export type FormUserType = z.infer<typeof userTypeSchema>;
export type UserType = Exclude<FormUserType, 'none'>;

// Type guards
export const isUserTypeSelected = (
  userType: FormUserType
): userType is UserType => {
  return userType !== 'none';
};

// ============================================================================
// SHARED FORM SCHEMA (Main Form)
// ============================================================================

/**
 * Shared form schema - data common to all user types
 * Used by the main FormProvider (steps 1-5)
 */
export const sharedFormSchema = z.object({
  signatureMethod: signatureMethodSchema,
  personalData: personalDataSchema,
  correspondence: correspondenceSchema,
  pepDeclarations: pepDeclarationsSchema,
  userType: userTypeSchema,
});

export type SharedFormData = z.infer<typeof sharedFormSchema>;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default values for shared form
 */
export const defaultSharedValues: SharedFormData = {
  userType: 'none',
  signatureMethod: null,
  personalData: {
    firstName: '',
    lastName: '',
    pesel: '',
    withoutPesel: false,
    phoneNumber: '',
    email: '',
  },
  correspondence: {
    address: {
      street: '',
      buildingNumber: '',
      apartmentNumber: '',
      city: '',
      postalCode: '',
    },
  },
  pepDeclarations: {
    isPersonPEP: null,
    personalData: {
      positionOrFunction: '',
      institutionName: '',
    },
    isFamilyMemberPEP: null,
    familyData: {
      familyMemberPoliticianName: '',
      familyMemberRelationshipType: '',
      familyMemberPosition: '',
      familyMemberInstitution: '',
    },
    isCloseAssociatePEP: null,
    coworkerData: {
      coworkerPoliticianName: '',
      coworkerCooperationType: '',
      coworkerPositionOrFunction: '',
      coworkerInstitutionName: '',
    },
  },
};
