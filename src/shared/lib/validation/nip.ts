/**
 * Comprehensive NIP (Polish Tax Identification Number) validation utilities
 *
 * This module provides:
 * - Format validation (10 digits)
 * - Checksum validation (mathematical correctness)
 * - Input sanitization (handle copy-paste scenarios)
 * - Detailed error messages for different validation failures
 */

import { VALIDATION_MESSAGES } from './messages';

/**
 * NIP validation error types - now returns actual error messages
 */
export const NipValidationError = {
  EMPTY: VALIDATION_MESSAGES.REQUIRED.NIP,
  TOO_SHORT: VALIDATION_MESSAGES.LENGTH.NIP_TOO_SHORT,
  TOO_LONG: VALIDATION_MESSAGES.LENGTH.NIP_TOO_LONG,
  INVALID_CHARACTERS: VALIDATION_MESSAGES.FORMAT.INVALID_CHARACTERS,
  ALL_ZEROS: VALIDATION_MESSAGES.BUSINESS.NIP_ALL_ZEROS,
  INVALID_CHECKSUM: VALIDATION_MESSAGES.BUSINESS.NIP_CHECKSUM,
  VALID: '', // No error
} as const;

/**
 * Result interface for NIP validation
 */
export interface NipValidationResult {
  isValid: boolean;
  error: string; // Now returns actual message string
  sanitizedValue?: string;
}

/**
 * Sanitizes NIP input by removing all non-digit characters
 * Useful for handling copy-paste scenarios where users might paste
 * formatted NIPs like "123-456-78-90" (official printed format)
 *
 * @param input - Raw input string
 * @returns Clean string containing only digits, max 10 characters
 *
 * @example
 * sanitizeNipInput("123-456-78-90") // returns "1234567890"
 * sanitizeNipInput("123 456 78 90") // returns "1234567890"
 * sanitizeNipInput("1234567890") // returns "1234567890"
 * sanitizeNipInput("123abc456") // returns "123456" (invalid input, but sanitized for checksum)
 */
export function sanitizeNipInput(input: string): string {
  return input.replace(/\D/g, '').slice(0, 10);
}

/**
 * Validates NIP checksum according to Polish algorithm
 *
 * Polish NIP uses a weighted checksum algorithm:
 * - First 9 digits are multiplied by weights [6, 5, 7, 2, 3, 4, 5, 6, 7]
 * - Sum is calculated and modulo 11 is taken
 * - Result should equal the 10th digit (checksum digit)
 *
 * @param nip - 10-digit NIP string
 * @returns true if checksum is mathematically correct
 *
 * @example
 * validateNipChecksum("1234563218") // returns true (valid checksum)
 * validateNipChecksum("1234563219") // returns false (invalid checksum)
 */
export function validateNipChecksum(nip: string): boolean {
  if (nip.length !== 10) {
    return false;
  }

  // Weights for NIP checksum calculation
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const digits = nip.split('').map(Number);

  // Calculate weighted sum of first 9 digits
  const sum = weights.reduce((acc, weight, index) => {
    return acc + weight * digits[index];
  }, 0);

  // Calculate checksum (modulo 11)
  const checksum = sum % 11;

  // Handle special case where checksum is 10 (invalid NIP)
  if (checksum === 10) {
    return false;
  }

  // Compare calculated checksum with the 10th digit
  return checksum === digits[9];
}

/**
 * Comprehensive NIP validation function
 * Performs all validation checks and returns detailed result
 *
 * @param input - Raw NIP input (can contain formatting)
 * @returns Detailed validation result with error information
 *
 * @example
 * validateNip("") // { isValid: false, error: NipValidationError.EMPTY }
 * validateNip("123") // { isValid: false, error: NipValidationError.TOO_SHORT }
 * validateNip("123abc456") // { isValid: false, error: NipValidationError.INVALID_CHARACTERS }
 * validateNip("1234563218") // { isValid: true, error: NipValidationError.VALID }
 */
export function validateNip(input: string): NipValidationResult {
  // Handle empty input
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: NipValidationError.EMPTY,
    };
  }

  // Sanitize input (removes all non-digits including dashes and spaces)
  const sanitized = sanitizeNipInput(input);

  // Removed: /\D/.test(input) check
  // Sanitization already removes all non-digits, so checking original input is redundant
  // This allows users to paste formatted NIPs (e.g., "123-456-32-18" from invoices)
  // All validation is performed on sanitized value (digits only)

  // Check length after sanitization
  if (sanitized.length === 0) {
    return {
      isValid: false,
      error: NipValidationError.EMPTY,
    };
  }

  if (sanitized.length < 10) {
    return {
      isValid: false,
      error: NipValidationError.TOO_SHORT,
      sanitizedValue: sanitized,
    };
  }

  if (sanitized.length > 10) {
    return {
      isValid: false,
      error: NipValidationError.TOO_LONG,
      sanitizedValue: sanitized,
    };
  }

  // Check for all zeros (invalid NIP)
  // NIP consisting of only zeros is mathematically valid (checksum = 0)
  // but it's not a real/valid NIP issued by Polish tax authorities
  if (/^0+$/.test(sanitized)) {
    return {
      isValid: false,
      error: NipValidationError.ALL_ZEROS,
      sanitizedValue: sanitized,
    };
  }

  // Validate checksum
  if (!validateNipChecksum(sanitized)) {
    return {
      isValid: false,
      error: NipValidationError.INVALID_CHECKSUM,
      sanitizedValue: sanitized,
    };
  }

  return {
    isValid: true,
    error: NipValidationError.VALID,
    sanitizedValue: sanitized,
  };
}

/**
 * Simple boolean validation function for backward compatibility
 *
 * @param nip - NIP string to validate
 * @returns true if NIP is valid (format + checksum)
 *
 * @example
 * isValidNip("1234563218") // returns true
 * isValidNip("1234563219") // returns false
 */
export function isValidNip(nip: string): boolean {
  return validateNip(nip).isValid;
}

/**
 * Get detailed error message for a NIP validation result
 *
 * @param result - Result from validateNip function
 * @returns Human-readable error message in Polish
 */
export function getNipErrorMessage(result: NipValidationResult): string {
  return result.error;
}

/**
 * Test NIPs for development and testing purposes
 * These are mathematically valid NIPs with correct checksums
 */
export const TEST_VALID_NIPS = [
  '1234563218', // Standard test NIP
  '5260001246', // Another valid test NIP
  '7740001454', // Another valid test NIP
] as const;

/**
 * Test NIPs with invalid checksums for testing error scenarios
 */
export const TEST_INVALID_NIPS = [
  '0000000000', // Invalid: all zeros (not issued by tax authorities)
  '1234563219', // Invalid checksum (last digit should be 8)
  '5260001247', // Invalid checksum (last digit should be 6)
  '7740001455', // Invalid checksum (last digit should be 4)
] as const;
