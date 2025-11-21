/**
 * Centralized validation patterns for the entire application
 *
 * This module provides:
 * - Single source of truth for all regex patterns
 * - Consistent pattern definitions across components
 * - Easy maintenance and pattern updates
 * - Type-safe pattern access
 */

/**
 * All validation patterns used across the application
 * Moved from schema.ts to create a single source of truth
 */
export const VALIDATION_PATTERNS = {
  // Polish business identifiers
  REGON: /^(\d{9}|\d{14})$/, // Exactly 9 or 14 digits
  KRS: /^\d{10}$/, // 10 digits, can start with 0
  NIP: /^\d{10}$/, // Exactly 10 digits
  PESEL: /^\d{11}$/, // Exactly 11 digits
  POSTAL_CODE: /^\d{5}$/, // Raw 5 digits (formatting handled by components)

  // Business data patterns
  COMPANY_NAME: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s.#@&()'",-]+$/,
  STREET: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s.,-]+$/,
  BUILDING_NUMBER: /^[a-zA-Z0-9\s.-]+$/,
  CITY: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/,
  NAME: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s''-]+$/,

  // Contact information
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email pattern

  // Special patterns
  DIGITS_ONLY: /^\d+$/, // Only digits allowed
  LETTERS_ONLY: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/, // Only letters (with Polish characters)
  ALPHANUMERIC: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9]+$/, // Letters and numbers only
} as const;

/**
 * Pattern groups for logical organization
 */
export const PATTERN_GROUPS = {
  BUSINESS_IDENTIFIERS: {
    REGON: VALIDATION_PATTERNS.REGON,
    KRS: VALIDATION_PATTERNS.KRS,
    NIP: VALIDATION_PATTERNS.NIP,
    PESEL: VALIDATION_PATTERNS.PESEL,
  },
  ADDRESS_FIELDS: {
    STREET: VALIDATION_PATTERNS.STREET,
    BUILDING_NUMBER: VALIDATION_PATTERNS.BUILDING_NUMBER,
    CITY: VALIDATION_PATTERNS.CITY,
    POSTAL_CODE: VALIDATION_PATTERNS.POSTAL_CODE,
  },
  PERSONAL_INFO: {
    NAME: VALIDATION_PATTERNS.NAME,
    EMAIL: VALIDATION_PATTERNS.EMAIL,
  },
  COMPANY_DATA: {
    COMPANY_NAME: VALIDATION_PATTERNS.COMPANY_NAME,
  },
} as const;

/**
 * Type for accessing validation patterns
 */
export type ValidationPatternKey = keyof typeof VALIDATION_PATTERNS;

/**
 * Helper function to get pattern by key
 */
export const getValidationPattern = (key: ValidationPatternKey): RegExp => {
  return VALIDATION_PATTERNS[key];
};

/**
 * Test if a value matches a specific pattern
 */
export const matchesPattern = (
  value: string,
  pattern: ValidationPatternKey | RegExp
): boolean => {
  const regex =
    pattern instanceof RegExp ? pattern : VALIDATION_PATTERNS[pattern];
  return regex.test(value);
};
