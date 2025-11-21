/**
 * Business logic validation functions
 *
 * This module provides:
 * - Centralized business validation logic
 * - Consistent validation interfaces
 * - Single source of truth for business rules
 * - Type-safe validation operations
 */

import { validatePhoneNumberLength } from 'libphonenumber-js';
import { isValidPhoneNumber } from 'react-phone-number-input';

import { VALIDATION_MESSAGES } from './messages';
import { VALIDATION_PATTERNS } from './patterns';
import type { ValidationResult } from './types';

/**
 * Company name validation with business rules
 * Validates length and allowed characters for Polish company names
 *
 * @param name - Company name to validate
 * @returns ValidationResult with detailed error information
 */
export const validateCompanyName = (name: string): ValidationResult => {
  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.LENGTH.COMPANY_NAME_MIN,
    };
  }

  if (trimmed.length > 200) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.LENGTH.COMPANY_NAME_MAX,
    };
  }

  if (!VALIDATION_PATTERNS.COMPANY_NAME.test(trimmed)) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.FORMAT.COMPANY_NAME_INVALID,
    };
  }

  return { isValid: true };
};

/**
 * Street address validation with Polish address rules
 * Validates length and allowed characters for street addresses
 *
 * @param street - Street address to validate
 * @returns ValidationResult with detailed error information
 */
export const validateStreetAddress = (street: string): ValidationResult => {
  const trimmed = street.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: VALIDATION_MESSAGES.LENGTH.STREET_MIN };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: VALIDATION_MESSAGES.LENGTH.STREET_MAX };
  }

  if (!VALIDATION_PATTERNS.STREET.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.FORMAT.STREET_INVALID };
  }

  return { isValid: true };
};

/**
 * Building number validation
 * Validates format and length for building numbers (supports formats like 12A, 12/3, 12-14)
 *
 * @param buildingNumber - Building number to validate
 * @returns ValidationResult with detailed error information
 */
export const validateBuildingNumber = (
  buildingNumber: string
): ValidationResult => {
  const trimmed = buildingNumber.trim();

  if (trimmed.length < 1) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REQUIRED.BUILDING_NUMBER,
    };
  }

  if (trimmed.length > 20) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.LENGTH.BUILDING_NUMBER_MAX,
    };
  }

  if (!VALIDATION_PATTERNS.BUILDING_NUMBER.test(trimmed)) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.FORMAT.BUILDING_NUMBER_INVALID,
    };
  }

  return { isValid: true };
};

/**
 * City name validation with Polish city naming rules
 * Validates length and allowed characters for city names
 *
 * @param city - City name to validate
 * @returns ValidationResult with detailed error information
 */
export const validateCity = (city: string): ValidationResult => {
  const trimmed = city.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: VALIDATION_MESSAGES.LENGTH.CITY_MIN };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: VALIDATION_MESSAGES.LENGTH.CITY_MAX };
  }

  if (!VALIDATION_PATTERNS.CITY.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.FORMAT.CITY_INVALID };
  }

  return { isValid: true };
};

/**
 * Postal code validation for Polish postal codes
 * Validates 5-digit format (component handles formatting display)
 *
 * @param postalCode - Postal code to validate (digits only)
 * @returns ValidationResult with detailed error information
 */
export const validatePostalCode = (postalCode: string): ValidationResult => {
  if (!VALIDATION_PATTERNS.POSTAL_CODE.test(postalCode)) {
    return { isValid: false, error: VALIDATION_MESSAGES.FORMAT.POSTAL_CODE };
  }

  return { isValid: true };
};

/**
 * Person name validation (first name or last name)
 * Validates length and allowed characters for Polish names
 *
 * @param name - Name to validate
 * @param fieldName - Type of name field (firstName or lastName)
 * @returns ValidationResult with detailed error information
 */
export const validatePersonName = (
  name: string,
  fieldName: 'firstName' | 'lastName'
): ValidationResult => {
  const trimmed = name.trim();

  if (trimmed.length < 1) {
    const errorKey = fieldName === 'firstName' ? 'FIRST_NAME' : 'LAST_NAME';
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED[errorKey] };
  }

  if (trimmed.length < 2) {
    const errorKey =
      fieldName === 'firstName' ? 'FIRST_NAME_MIN' : 'LAST_NAME_MIN';
    return { isValid: false, error: VALIDATION_MESSAGES.LENGTH[errorKey] };
  }

  const maxLength = fieldName === 'firstName' ? 50 : 100;
  if (trimmed.length > maxLength) {
    const errorKey =
      fieldName === 'firstName' ? 'FIRST_NAME_MAX' : 'LAST_NAME_MAX';
    return { isValid: false, error: VALIDATION_MESSAGES.LENGTH[errorKey] };
  }

  if (!VALIDATION_PATTERNS.NAME.test(trimmed)) {
    const errorKey =
      fieldName === 'firstName' ? 'FIRST_NAME_INVALID' : 'LAST_NAME_INVALID';
    return { isValid: false, error: VALIDATION_MESSAGES.FORMAT[errorKey] };
  }

  return { isValid: true };
};

/**
 * Phone number validation using international standards
 * Uses validatePhoneNumberLength for detailed error messages on all length issues
 *
 * @param phoneNumber - Phone number to validate (international format)
 * @returns ValidationResult with detailed error information
 *
 * @example
 * validatePhoneNumber("") // { isValid: false, error: "Numer telefonu jest wymagany" }
 * validatePhoneNumber("+48") // { isValid: false, error: "Numer telefonu jest za krótki" }
 * validatePhoneNumber("+48 501") // { isValid: false, error: "Numer telefonu jest za krótki" }
 * validatePhoneNumber("+48 501 234 56") // { isValid: false, error: "Numer telefonu jest za krótki" }
 * validatePhoneNumber("+48123456789012345") // { isValid: false, error: "Numer telefonu jest za długi" }
 * validatePhoneNumber("+9991112223333") // { isValid: false, error: "Nieprawidłowy kod kraju" }
 * validatePhoneNumber("+48501234567") // { isValid: true }
 */
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  // Check if empty
  if (!phoneNumber || phoneNumber.trim() === '') {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REQUIRED.PHONE,
    };
  }

  try {
    // Primary check: validatePhoneNumberLength gives detailed errors for ALL length issues
    // This ensures we show specific messages (TOO_SHORT, TOO_LONG, etc.) instead of generic "Invalid"
    const lengthResult = validatePhoneNumberLength(phoneNumber);

    if (lengthResult) {
      // Map library error codes to Polish messages
      const errorMessages: Record<NonNullable<typeof lengthResult>, string> = {
        TOO_SHORT: VALIDATION_MESSAGES.FORMAT.PHONE_TOO_SHORT,
        TOO_LONG: VALIDATION_MESSAGES.FORMAT.PHONE_TOO_LONG,
        INVALID_LENGTH: VALIDATION_MESSAGES.FORMAT.PHONE_INVALID_LENGTH,
        INVALID_COUNTRY: VALIDATION_MESSAGES.FORMAT.PHONE_INVALID_COUNTRY,
        NOT_A_NUMBER: VALIDATION_MESSAGES.FORMAT.PHONE_NOT_A_NUMBER,
      };

      return {
        isValid: false,
        error: errorMessages[lengthResult] || VALIDATION_MESSAGES.FORMAT.PHONE,
      };
    }

    // Length OK - use isValidPhoneNumber for final validation
    const isValid = isValidPhoneNumber(phoneNumber);

    return {
      isValid,
      error: isValid ? undefined : VALIDATION_MESSAGES.FORMAT.PHONE,
    };
  } catch {
    // Fallback for unexpected errors
    return { isValid: false, error: VALIDATION_MESSAGES.FORMAT.PHONE };
  }
};

/**
 * Email validation with basic format checking
 * Uses standard email pattern validation
 *
 * @param email - Email address to validate
 * @returns ValidationResult with detailed error information
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim();

  if (!VALIDATION_PATTERNS.EMAIL.test(trimmed)) {
    return { isValid: false, error: VALIDATION_MESSAGES.FORMAT.EMAIL };
  }

  return { isValid: true };
};

/**
 * Business validation functions registry
 * Provides easy access to all business validation functions
 */
export const businessValidators = {
  companyName: validateCompanyName,
  streetAddress: validateStreetAddress,
  buildingNumber: validateBuildingNumber,
  city: validateCity,
  postalCode: validatePostalCode,
  personName: validatePersonName,
  phoneNumber: validatePhoneNumber,
  email: validateEmail,
} as const;

/**
 * Type for accessing business validators
 */
export type BusinessValidatorKey = keyof typeof businessValidators;
