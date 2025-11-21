/**
 * Unified input sanitization utilities
 *
 * This module provides:
 * - Consistent sanitization functions across all validators
 * - Eliminates duplicated sanitization logic
 * - Handles common copy-paste scenarios (formatted inputs)
 * - Type-safe sanitization operations
 */

/**
 * Remove all non-digit characters from input
 * Replaces duplicated `replace(/\D/g, '')` patterns across the codebase
 *
 * @param value - Input string that may contain digits and other characters
 * @returns String containing only digits
 *
 * @example
 * sanitizeToDigitsOnly("123-45-67-89") // returns "123456789"
 * sanitizeToDigitsOnly("123 abc 456") // returns "123456"
 */
export function sanitizeToDigitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Remove all non-letter characters from input
 * Includes Polish characters: ąćęłńóśźżĄĆĘŁŃÓŚŹŻ
 *
 * @param value - Input string that may contain letters and other characters
 * @returns String containing only letters (with Polish diacritics)
 */
export function sanitizeToLettersOnly(value: string): string {
  return value.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '');
}

/**
 * Keep only alphanumeric characters (letters + digits)
 * Includes Polish characters
 *
 * @param value - Input string
 * @returns String containing only letters and digits
 */
export function sanitizeToAlphanumeric(value: string): string {
  return value.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9]/g, '');
}

/**
 * NIP sanitization - removes formatting and limits to 10 digits
 * Handles common NIP formats: 123-456-78-90, 123 456 78 90
 *
 * @param value - Raw NIP input
 * @returns Clean NIP string (max 10 digits)
 */
export function sanitizeNipInput(value: string): string {
  return sanitizeToDigitsOnly(value).slice(0, 10);
}

/**
 * PESEL sanitization - removes formatting and limits to 11 digits
 * Handles spaces, dashes, and other formatting
 *
 * @param value - Raw PESEL input
 * @returns Clean PESEL string (max 11 digits)
 */
export function sanitizePeselInput(value: string): string {
  return sanitizeToDigitsOnly(value).slice(0, 11);
}

/**
 * REGON sanitization - removes formatting, allows 9 or 14 digits
 * Handles various REGON formats
 *
 * @param value - Raw REGON input
 * @returns Clean REGON string (max 14 digits)
 */
export function sanitizeRegonInput(value: string): string {
  return sanitizeToDigitsOnly(value).slice(0, 14);
}

/**
 * KRS sanitization - removes formatting and limits to 10 digits
 * KRS can start with 0 (unlike NIP)
 *
 * @param value - Raw KRS input
 * @returns Clean KRS string (max 10 digits)
 */
export function sanitizeKrsInput(value: string): string {
  return sanitizeToDigitsOnly(value).slice(0, 10);
}

/**
 * Postal code sanitization - removes formatting and limits to 5 digits
 * Handles formats like: 12-345, 12 345
 *
 * @param value - Raw postal code input
 * @returns Clean postal code string (max 5 digits)
 */
export function sanitizePostalCodeInput(value: string): string {
  return sanitizeToDigitsOnly(value).slice(0, 5);
}

/**
 * Phone number sanitization - removes common phone formatting
 * Keeps + for international codes and digits
 *
 * @param value - Raw phone input
 * @returns Sanitized phone string
 */
export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^+\d]/g, '');
}

/**
 * General text sanitization - trims whitespace and normalizes spaces
 * Useful for names, addresses, company names
 *
 * @param value - Input text
 * @returns Trimmed text with normalized spaces
 */
export function sanitizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Email sanitization - trims and converts to lowercase
 *
 * @param value - Raw email input
 * @returns Sanitized email string
 */
export function sanitizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Name sanitization - allows letters, spaces, hyphens, and apostrophes
 * Handles Polish characters and common name formats
 *
 * @param value - Raw name input
 * @returns Sanitized name string
 */
export function sanitizeName(value: string): string {
  const cleaned = value.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s'-]/g, '');
  return sanitizeText(cleaned);
}

/**
 * Company name sanitization - allows business-appropriate characters
 * Includes letters, digits, spaces, and common business symbols
 *
 * @param value - Raw company name input
 * @returns Sanitized company name string
 */
export function sanitizeCompanyName(value: string): string {
  const cleaned = value.replace(
    /[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s.#@&()'",-]/g,
    ''
  );
  return sanitizeText(cleaned);
}

/**
 * Address sanitization - allows address-appropriate characters
 * Includes letters, digits, spaces, dots, commas, hyphens
 *
 * @param value - Raw address input
 * @returns Sanitized address string
 */
export function sanitizeAddress(value: string): string {
  const cleaned = value.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s.,-]/g, '');
  return sanitizeText(cleaned);
}

/**
 * Building number sanitization - allows alphanumeric with specific symbols
 * Handles formats like: 12, 12A, 12/3, 12-14
 *
 * @param value - Raw building number input
 * @returns Sanitized building number string
 */
export function sanitizeBuildingNumber(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9\s./-]/g, '');
  return sanitizeText(cleaned);
}

/**
 * Generic sanitization function factory
 * Creates custom sanitizers based on allowed character patterns
 *
 * @param allowedPattern - RegExp pattern for allowed characters
 * @returns Sanitization function
 */
export function createSanitizer(
  allowedPattern: RegExp
): (value: string) => string {
  return (value: string) => {
    const cleaned = value.replace(
      new RegExp(`[^${allowedPattern.source}]`, 'g'),
      ''
    );
    return sanitizeText(cleaned);
  };
}

/**
 * Combined sanitization options
 */
export const SANITIZERS = {
  digitsOnly: sanitizeToDigitsOnly,
  lettersOnly: sanitizeToLettersOnly,
  alphanumeric: sanitizeToAlphanumeric,
  nip: sanitizeNipInput,
  pesel: sanitizePeselInput,
  regon: sanitizeRegonInput,
  krs: sanitizeKrsInput,
  postalCode: sanitizePostalCodeInput,
  phone: sanitizePhoneInput,
  text: sanitizeText,
  email: sanitizeEmail,
  name: sanitizeName,
  companyName: sanitizeCompanyName,
  address: sanitizeAddress,
  buildingNumber: sanitizeBuildingNumber,
} as const;

/**
 * Type for accessing sanitizers
 */
export type SanitizerKey = keyof typeof SANITIZERS;
