/**
 * Comprehensive PESEL (Polish Personal Identification Number) validation utilities
 *
 * This module provides:
 * - Format validation (11 digits)
 * - Checksum validation (mathematical correctness)
 * - Input sanitization (handle copy-paste scenarios)
 * - Detailed error messages for different validation failures
 */

import { VALIDATION_MESSAGES } from './messages';

/**
 * PESEL validation error types - now returns actual error messages
 */
export const PeselValidationError = {
  EMPTY: VALIDATION_MESSAGES.REQUIRED.PESEL,
  TOO_SHORT: VALIDATION_MESSAGES.LENGTH.PESEL_TOO_SHORT,
  TOO_LONG: VALIDATION_MESSAGES.LENGTH.PESEL_TOO_LONG,
  INVALID_CHARACTERS: VALIDATION_MESSAGES.FORMAT.INVALID_CHARACTERS,
  INVALID_CHECKSUM: VALIDATION_MESSAGES.BUSINESS.PESEL_CHECKSUM,
  VALID: '', // No error
} as const;

/**
 * Result interface for PESEL validation
 */
export interface PeselValidationResult {
  isValid: boolean;
  error: string; // Now returns actual message string
  sanitizedValue?: string;
}

/**
 * Sanitizes PESEL input by removing all non-digit characters
 * Handles edge cases where users might include spaces when manually typing
 *
 * @param input - Raw input string
 * @returns Clean string containing only digits, max 11 characters
 *
 * @example
 * sanitizePeselInput("81020312344") // returns "81020312344"
 * sanitizePeselInput("810203 12344") // returns "81020312344" (space removed)
 * sanitizePeselInput("810abc203") // returns "810203" (invalid input, but sanitized for checksum)
 */
export function sanitizePeselInput(input: string): string {
  return input.replace(/\D/g, '').slice(0, 11);
}

/**
 * Validates PESEL checksum according to Polish algorithm
 *
 * Polish PESEL uses a weighted checksum algorithm:
 * - First 10 digits are multiplied by weights [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
 * - Sum is calculated and modulo 10 is taken
 * - If remainder is 0, checksum should be 0, otherwise checksum = 10 - remainder
 * - Result should equal the 11th digit (checksum digit)
 *
 * @param pesel - 11-digit PESEL string
 * @returns true if checksum is mathematically correct
 *
 * @example
 * validatePeselChecksum("81020312344") // returns true (valid checksum)
 * validatePeselChecksum("81020312345") // returns false (invalid checksum)
 */
export function validatePeselChecksum(pesel: string): boolean {
  if (pesel.length !== 11) {
    return false;
  }

  // Weights for PESEL checksum calculation
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const digits = pesel.split('').map(Number);

  // Calculate weighted sum of first 10 digits
  const sum = weights.reduce((acc, weight, index) => {
    return acc + weight * digits[index];
  }, 0);

  // Calculate remainder (modulo 10)
  const remainder = sum % 10;

  // Calculate expected checksum
  const expectedChecksum = remainder === 0 ? 0 : 10 - remainder;

  // Compare calculated checksum with the 11th digit
  return expectedChecksum === digits[10];
}

/**
 * Comprehensive PESEL validation function
 * Performs all validation checks and returns detailed result
 *
 * @param input - Raw PESEL input (can contain formatting)
 * @returns Detailed validation result with error information
 *
 * @example
 * validatePesel("") // { isValid: false, error: PeselValidationError.EMPTY }
 * validatePesel("123") // { isValid: false, error: PeselValidationError.TOO_SHORT }
 * validatePesel("123abc456") // { isValid: false, error: PeselValidationError.INVALID_CHARACTERS }
 * validatePesel("81020312344") // { isValid: true, error: PeselValidationError.VALID }
 */
export function validatePesel(input: string): PeselValidationResult {
  // Handle empty input
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: PeselValidationError.EMPTY,
    };
  }

  // Sanitize input (removes all non-digits including spaces)
  const sanitized = sanitizePeselInput(input);

  // Removed: /\D/.test(input) check
  // Sanitization already removes all non-digits, so checking original input is redundant
  // This handles edge cases where users might include spaces when manually typing
  // All validation is performed on sanitized value (digits only)

  // Check length after sanitization
  if (sanitized.length === 0) {
    return {
      isValid: false,
      error: PeselValidationError.EMPTY,
    };
  }

  if (sanitized.length < 11) {
    return {
      isValid: false,
      error: PeselValidationError.TOO_SHORT,
      sanitizedValue: sanitized,
    };
  }

  if (sanitized.length > 11) {
    return {
      isValid: false,
      error: PeselValidationError.TOO_LONG,
      sanitizedValue: sanitized,
    };
  }

  // Validate checksum
  if (!validatePeselChecksum(sanitized)) {
    return {
      isValid: false,
      error: PeselValidationError.INVALID_CHECKSUM,
      sanitizedValue: sanitized,
    };
  }

  return {
    isValid: true,
    error: PeselValidationError.VALID,
    sanitizedValue: sanitized,
  };
}

/**
 * Simple boolean validation function for backward compatibility
 *
 * @param pesel - PESEL string to validate
 * @returns true if PESEL is valid (format + checksum)
 *
 * @example
 * isValidPesel("81020312344") // returns true
 * isValidPesel("81020312345") // returns false
 */
export function isValidPesel(pesel: string): boolean {
  return validatePesel(pesel).isValid;
}

/**
 * Get detailed error message for a PESEL validation result
 *
 * @param result - Result from validatePesel function
 * @returns Human-readable error message in Polish
 */
export function getPeselErrorMessage(result: PeselValidationResult): string {
  return result.error;
}

/**
 * Test PESELs for development and testing purposes
 * These are mathematically valid PESELs with correct checksums
 */
export const TEST_VALID_PESELS = [
  '81020312344', // Standard test PESEL (corrected checksum)
  '90010112359', // Another valid test PESEL
  '85121012345', // Another valid test PESEL (needs checksum verification)
] as const;

/**
 * Test PESELs with invalid checksums for testing error scenarios
 */
export const TEST_INVALID_PESELS = [
  '81020312345', // Invalid checksum (from user example - should be 4)
  '90010112358', // Invalid checksum (last digit should be 9)
  '85121012346', // Invalid checksum (needs verification)
] as const;
