/**
 * Unified validation types for consistent validation across the application
 *
 * This module provides:
 * - Standard interfaces for all validation functions
 * - Type-safe validation result handling
 * - Consistent error message structure
 */

/**
 * Standard validation result interface used across all validators
 * Replaces inconsistent interfaces like NipValidationResult, etc.
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message in Polish (undefined when isValid is true) */
  error?: string;
  /** Sanitized/cleaned version of the input value */
  sanitizedValue?: string;
}

/**
 * Extended validation result with additional metadata
 * Used for complex validations that need extra information
 */
export interface ExtendedValidationResult extends ValidationResult {
  /** Type or category of the validated value */
  type?: string;
  /** Length of the sanitized value */
  length?: number;
  /** Additional metadata specific to the validator */
  metadata?: Record<string, unknown>;
}

/**
 * Validation function type signature
 * All validation functions should implement this interface
 */
export type ValidationFunction = (value: string) => ValidationResult;

/**
 * Extended validation function type signature
 * For validators that return additional metadata
 */
export type ExtendedValidationFunction = (
  value: string
) => ExtendedValidationResult;

/**
 * Validation error categories for consistent error handling
 */
export const ValidationErrorType = {
  REQUIRED: 'required',
  FORMAT: 'format',
  LENGTH: 'length',
  CHECKSUM: 'checksum',
  BUSINESS: 'business',
} as const;

/**
 * Validation configuration for creating standardized validators
 */
export interface ValidationConfig {
  /** Minimum length required */
  minLength?: number;
  /** Maximum length allowed */
  maxLength?: number;
  /** Regex pattern for format validation */
  pattern?: RegExp;
  /** Custom validation function for complex logic */
  customValidator?: (value: string) => boolean;
  /** Whether to sanitize input before validation */
  sanitize?: boolean;
  /** Sanitization function to use */
  sanitizer?: (value: string) => string;
}
