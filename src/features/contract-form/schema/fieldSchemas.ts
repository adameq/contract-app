/**
 * Field-level validation schemas for contract form
 *
 * This module provides:
 * - Reusable field schemas with built-in validation
 * - Idiomatic Zod validation using built-in methods where possible
 * - Custom validators only for complex business logic (checksums, external libraries)
 * - Single source of truth for field validation logic
 *
 * ARCHITECTURE:
 * - Simple validations (length, format): Use Zod's built-in methods (.min, .max, .regex, .email)
 * - Complex validations (checksums, phone): Use .refine() with dedicated validator functions
 * - Validation after transform: Use .pipe() in Zod v4 (transform returns ZodPipe, not original type)
 * - This approach ensures correct error messages and optimal performance
 */

import { z } from 'zod';

import {
  sanitizeNipInput,
  validateKrs,
  validateNip,
  validatePesel,
  validatePhoneNumber,
} from '@/shared/lib/validation';
import { VALIDATION_MESSAGES } from '@/shared/lib/validation/messages';
import { VALIDATION_PATTERNS } from '@/shared/lib/validation/patterns';

/**
 * Address field schemas
 *
 * Using idiomatic Zod built-in methods for simple validations:
 * - .trim() for whitespace normalization
 * - .min() / .max() for length constraints
 * - .regex() for pattern matching
 *
 * This approach ensures correct error messages and optimal performance.
 */
export const streetFieldSchema = z
  .string()
  .trim()
  .min(2, VALIDATION_MESSAGES.LENGTH.STREET_MIN)
  .max(100, VALIDATION_MESSAGES.LENGTH.STREET_MAX)
  .regex(VALIDATION_PATTERNS.STREET, VALIDATION_MESSAGES.FORMAT.STREET_INVALID);

export const buildingNumberFieldSchema = z
  .string()
  .trim()
  .min(1, VALIDATION_MESSAGES.REQUIRED.BUILDING_NUMBER)
  .max(20, VALIDATION_MESSAGES.LENGTH.BUILDING_NUMBER_MAX)
  .regex(
    VALIDATION_PATTERNS.BUILDING_NUMBER,
    VALIDATION_MESSAGES.FORMAT.BUILDING_NUMBER_INVALID
  );

export const cityFieldSchema = z
  .string()
  .trim()
  .min(2, VALIDATION_MESSAGES.LENGTH.CITY_MIN)
  .max(50, VALIDATION_MESSAGES.LENGTH.CITY_MAX)
  .regex(VALIDATION_PATTERNS.CITY, VALIDATION_MESSAGES.FORMAT.CITY_INVALID);

export const postalCodeFieldSchema = z
  .string()
  .transform(s => s.replace(/\D/g, '').slice(0, 5)) // Sanitize: digits only, max 5
  .pipe(z.string().length(5, VALIDATION_MESSAGES.FORMAT.POSTAL_CODE));

/**
 * Personal data field schemas
 *
 * Using idiomatic Zod methods for simple validations.
 * Phone number uses .refine() because it requires external library (react-phone-number-input).
 */
export const firstNameFieldSchema = z
  .string()
  .trim()
  .min(2, VALIDATION_MESSAGES.LENGTH.FIRST_NAME_MIN)
  .max(50, VALIDATION_MESSAGES.LENGTH.FIRST_NAME_MAX)
  .regex(
    VALIDATION_PATTERNS.NAME,
    VALIDATION_MESSAGES.FORMAT.FIRST_NAME_INVALID
  );

export const lastNameFieldSchema = z
  .string()
  .trim()
  .min(2, VALIDATION_MESSAGES.LENGTH.LAST_NAME_MIN)
  .max(100, VALIDATION_MESSAGES.LENGTH.LAST_NAME_MAX)
  .regex(
    VALIDATION_PATTERNS.NAME,
    VALIDATION_MESSAGES.FORMAT.LAST_NAME_INVALID
  );

export const emailFieldSchema = z
  .string()
  .trim()
  .email(VALIDATION_MESSAGES.FORMAT.EMAIL);

export const phoneNumberFieldSchema = z.string().superRefine((value, ctx) => {
  const result = validatePhoneNumber(value);
  if (!result.isValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.error ?? 'Nieprawidłowy numer telefonu',
    });
  }
});

/**
 * Company data field schemas
 *
 * Using idiomatic Zod methods for simple validations.
 * NIP, REGON, KRS, PESEL use .refine() because they require checksum validation.
 */
export const companyNameFieldSchema = z
  .string()
  .trim()
  .min(2, VALIDATION_MESSAGES.LENGTH.COMPANY_NAME_MIN)
  .max(200, VALIDATION_MESSAGES.LENGTH.COMPANY_NAME_MAX)
  .regex(
    VALIDATION_PATTERNS.COMPANY_NAME,
    VALIDATION_MESSAGES.FORMAT.COMPANY_NAME_INVALID
  );

/**
 * NIP (Tax Identification Number) field schema
 *
 * ARCHITECTURE: Schema-level type guarantee
 * - .catch('') ensures undefined/null values become empty strings
 * - Eliminates need for defensive ?? '' syntax in components
 * - Provides single source of truth for type handling
 * - Works correctly with .transform() and .superRefine() chains
 *
 * This pattern ensures NIP is ALWAYS a string throughout the form lifecycle,
 * even during initial render or form state transitions.
 */
export const nipFieldSchema = z
  .string()
  .catch('') // Guarantees string type - undefined/null → ''
  .transform(sanitizeNipInput)
  .superRefine((value, ctx) => {
    const result = validateNip(value);
    if (!result.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error || 'Nieprawidłowy NIP',
      });
    }
  });

export const regonFieldSchema = z
  .string()
  .transform(s => s.replace(/\D/g, '')) // Sanitize: digits only
  .pipe(
    z
      .string()
      .min(1, VALIDATION_MESSAGES.REQUIRED.REGON) // Empty string fails validation
      .regex(
        VALIDATION_PATTERNS.REGON,
        VALIDATION_MESSAGES.FORMAT.REGON_INVALID
      )
  );

export const krsFieldSchema = z
  .string()
  .transform(s => s.trim())
  .pipe(
    z.string().superRefine((value, ctx) => {
      // Empty string is valid (optional field)
      if (!value) return;

      // Validate only when user entered something
      const result = validateKrs(value);
      if (!result.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error ?? 'Nieprawidłowy KRS',
        });
      }
    })
  );

/**
 * Registry signature field schema
 * Accepts any string representing official registry signature for legal evidence
 * No specific format validation as this comes from different sources (KRS, CEIDG, GUS)
 */
export const registrySignatureFieldSchema = z
  .string()
  .min(1, 'Sygnatura weryfikacji jest wymagana');

/**
 * PESEL field schema - Format and checksum validation
 *
 * @warning IMPORTANT: CONDITIONAL VALIDATION REQUIRED
 *
 * This schema ONLY validates PESEL format and checksum when called.
 * It does NOT handle conditional logic based on the withoutPesel flag.
 *
 * **You must use this within a parent schema that conditionally applies validation.**
 *
 * @example
 * // ✅ CORRECT: Conditional application in parent schema
 * const personalDataSchema = z
 *   .object({
 *     pesel: z.string(), // Base string, validation applied conditionally
 *     withoutPesel: z.boolean(),
 *     // ... other fields
 *   })
 *   .superRefine((data, ctx) => {
 *     // Only validate PESEL when user has one
 *     if (!data.withoutPesel) {
 *       const result = peselFieldSchema.safeParse(data.pesel);
 *       if (!result.success) {
 *         result.error.issues.forEach(issue => {
 *           ctx.addIssue({
 *             ...issue,
 *             path: ['pesel', ...issue.path],
 *           });
 *         });
 *       }
 *     }
 *   });
 *
 * @example
 * // ❌ INCORRECT: Direct usage without conditional logic
 * const schema = z.object({
 *   pesel: peselFieldSchema, // This will ALWAYS validate, ignoring withoutPesel
 * });
 *
 * @see {@link personalDataSchema} in sharedSchema.ts for reference implementation
 *
 * **Architectural Reasoning:**
 * - Field schema: Focused on format and business rule validation (PESEL checksum)
 * - Parent schema: Handles cross-field conditional logic (withoutPesel flag)
 * - This separation maintains clear boundaries and single responsibility
 */
export const peselFieldSchema = z.string().superRefine((value, ctx) => {
  const result = validatePesel(value);
  if (!result.isValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.error || 'Nieprawidłowy PESEL',
    });
  }
});

/**
 * Composed address schema using field schemas
 */
export const addressSchema = z.object({
  street: streetFieldSchema,
  buildingNumber: buildingNumberFieldSchema,
  /**
   * Apartment number field - explicitly optional with empty string default.
   * Uses .optional().default('') to make the optional nature declarative.
   * Empty string represents "no apartment number" (common form field convention).
   */
  apartmentNumber: z.string().optional().default(''),
  city: cityFieldSchema,
  postalCode: postalCodeFieldSchema,
});

export type Address = z.infer<typeof addressSchema>;

/**
 * Base address schema for partial usage
 */
export const baseAddressSchema = z.object({
  street: z.string(),
  buildingNumber: z.string(),
  /**
   * Apartment number field - explicitly optional with empty string default.
   * Uses .optional().default('') to make the optional nature declarative.
   * Empty string represents "no apartment number" (common form field convention).
   */
  apartmentNumber: z.string().optional().default(''),
  city: z.string(),
  postalCode: z.string(),
});

/**
 * Empty address schema for placeholder usage
 *
 * Enforces all address fields must be empty strings for unused address data.
 * Used in placeholder schemas (consumer-vat, consumer, none user types) to:
 * - Strengthen data integrity at client level
 * - Prevent data injection via dev tools
 * - Make explicit which fields should be empty
 *
 * @example
 * ```typescript
 * const placeholderSchema = z.object({
 *   address: emptyAddressSchema, // All fields must be empty strings
 * });
 * ```
 */
export const emptyAddressSchema = z.object({
  street: z.literal(''),
  buildingNumber: z.literal(''),
  apartmentNumber: z.literal(''),
  city: z.literal(''),
  postalCode: z.literal(''),
});

/**
 * Empty address constant for stable reference in useWatch defaultValue
 *
 * Provides a stable object reference to prevent unnecessary re-renders when used
 * as defaultValue in useWatch hooks. Creating inline objects in useWatch causes
 * new references on every render, defeating memoization.
 *
 * @example
 * ```typescript
 * const address = useWatch({
 *   control,
 *   name: 'company.address',
 *   defaultValue: EMPTY_ADDRESS, // ✅ Stable reference
 * });
 * ```
 */
export const EMPTY_ADDRESS = {
  street: '',
  buildingNumber: '',
  apartmentNumber: '',
  city: '',
  postalCode: '',
} as const;
