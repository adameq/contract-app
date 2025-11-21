/**
 * KRS (Polish Court Register) validation utility
 *
 * Provides validation for KRS numbers which must be exactly 10 digits
 * and can start with 0 (unlike NIP which cannot start with 0).
 *
 * **BUSINESS LOGIC NOTE**: Not all business forms in Poland require KRS:
 * - JDG (Jednoosobowa Działalność Gospodarcza) - does NOT require KRS
 * - Some partnerships - may not have KRS
 * - Limited liability companies (Sp. z o.o.) - REQUIRE KRS
 * - Joint-stock companies (S.A.) - REQUIRE KRS
 *
 * For businesses without KRS, the field should be left empty (optional field).
 * Empty string = no KRS assigned/not applicable.
 */

import { VALIDATION_MESSAGES } from './messages';
import { sanitizeKrsInput } from './sanitizers';
import type { ValidationResult } from './types';

/**
 * Validates KRS number format
 *
 * **SEPARATION OF CONCERNS**: This function validates FORMAT only.
 * Optionality (empty string handling) should be handled at schema composition level.
 *
 * **FORMAT VALIDATION**: KRS validation is based solely on length checking (10 digits).
 * Unlike NIP or PESEL, KRS numbers do not have a publicly available checksum algorithm.
 * This is consistent with standard practice for KRS validation in Polish systems.
 *
 * **VALID FORMAT**: Exactly 10 digits for actual KRS numbers.
 * Empty string should be handled at schema level (optional field).
 *
 * @param value - The KRS number to validate (should be non-empty when called)
 * @returns ValidationResult with consistent interface
 */
export function validateKrs(value: string): ValidationResult {
  // Sanitize input using unified sanitizer
  const cleanValue = sanitizeKrsInput(value);

  // Empty string should be handled at schema level (optional field)
  // This function expects non-empty value for format validation
  if (!cleanValue) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REQUIRED.KRS,
      sanitizedValue: cleanValue,
    };
  }

  // KRS validation: exactly 10 digits (no checksum validation available)
  if (cleanValue.length !== 10) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.FORMAT.KRS_INVALID,
      sanitizedValue: cleanValue,
    };
  }

  return {
    isValid: true,
    sanitizedValue: cleanValue,
  };
}
