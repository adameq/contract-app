/**
 * Centralized validation module - Single source of truth for all validation
 *
 * This module provides:
 * - Unified export for all validation functions
 * - Consistent interfaces across the application
 * - Single import point for validation needs
 * - Type-safe validation operations
 */

// Types and interfaces
export type {
  ExtendedValidationFunction,
  ExtendedValidationResult,
  ValidationConfig,
  ValidationFunction,
  ValidationResult,
} from './types';
export { ValidationErrorType } from './types';

// Validation patterns
export type { ValidationPatternKey } from './patterns';
export {
  getValidationPattern,
  matchesPattern,
  PATTERN_GROUPS,
  VALIDATION_PATTERNS,
} from './patterns';

// Sanitization utilities
export type { SanitizerKey } from './sanitizers';
export {
  createSanitizer,
  sanitizeAddress,
  sanitizeBuildingNumber,
  sanitizeCompanyName,
  sanitizeEmail,
  sanitizeKrsInput,
  sanitizeName,
  sanitizeNipInput,
  sanitizePeselInput,
  sanitizePhoneInput,
  sanitizePostalCodeInput,
  sanitizeRegonInput,
  SANITIZERS,
  sanitizeText,
  sanitizeToAlphanumeric,
  sanitizeToDigitsOnly,
  sanitizeToLettersOnly,
} from './sanitizers';

// Validation messages
export type { ValidationMessagePath } from './messages';
export {
  getValidationMessage,
  VALIDATION_MESSAGES,
  validationMessages,
} from './messages';

// Business validation functions
export type { BusinessValidatorKey } from './business';
export {
  businessValidators,
  validateBuildingNumber,
  validateCity,
  validateCompanyName,
  validateEmail,
  validatePersonName,
  validatePhoneNumber,
  validatePostalCode,
  validateStreetAddress,
} from './business';

// Polish business identifier validators
export { validateKrs } from './krs';
export type { NipValidationResult } from './nip';
export {
  getNipErrorMessage,
  isValidNip,
  TEST_INVALID_NIPS,
  TEST_VALID_NIPS,
  validateNip,
  validateNipChecksum,
} from './nip';
export {
  validatePesel,
  // Add other PESEL exports as needed
} from './pesel';

// Validation helpers (from helpers.ts)
export type {
  ValidationResult as HelperValidationResult,
  ValidationOptions,
  ValidationProps,
  ValidationState,
} from './helpers';
export {
  // Special case functions
  deriveErrorOnlyValidationProps,
  deriveNipValidationResult, // Returns ValidationResult (with isValid) for NIP logic checks
  // Base validation functions
  deriveValidationProps,
  // Generic validation function - recommended for all validation needs
  deriveValidationPropsFor,
  deriveValidationResult,
} from './helpers';

/**
 * Utility functions for working with validation results
 */

/**
 * Check if any validation results have errors
 * Note: This works with ValidationResult from business validators
 *
 * @param results - Validation results object
 * @returns true if any validation failed
 */
export const hasValidationErrors = (
  results: Record<string, ValidationResult>
): boolean => {
  return Object.values(results).some(result => {
    // Defensive programming: check if result has the expected structure
    const unknownResult = result as unknown;
    if (!unknownResult || typeof unknownResult !== 'object') {
      return false;
    }
    const obj = unknownResult as Record<string, unknown>;
    return 'isValid' in obj && typeof obj.isValid === 'boolean' && !obj.isValid;
  });
};

/**
 * Get all error messages from validation results
 * Note: This works with ValidationResult from business validators
 *
 * @param results - Validation results object
 * @returns Array of error messages
 */
export const getValidationErrors = (
  results: Record<string, ValidationResult>
): string[] => {
  return Object.values(results)
    .filter(result => {
      // Defensive programming: check if result has the expected structure
      const unknownResult = result as unknown;
      if (!unknownResult || typeof unknownResult !== 'object') {
        return false;
      }
      const obj = unknownResult as Record<string, unknown>;
      return (
        'isValid' in obj &&
        typeof obj.isValid === 'boolean' &&
        !obj.isValid &&
        'error' in obj &&
        typeof obj.error === 'string'
      );
    })
    .map(result => {
      const obj = result as unknown as Record<string, unknown>;
      return obj.error as string;
    })
    .filter(Boolean);
};
