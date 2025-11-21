import type { FieldError } from 'react-hook-form';

/**
 * Validation helpers for consistent form field validation states
 *
 * ARCHITECTURAL DECISION:
 * These helpers derive validation state from React Hook Form's fieldState ONLY.
 * They do NOT run any validation logic - that's handled by Zod schemas.
 *
 * Since React Hook Form is configured with mode: 'onChange', validation
 * runs on every keystroke and fieldState.error is always up-to-date.
 *
 * This eliminates duplicate validation and ensures a single source of truth.
 */

/**
 * Validation state enum for visual feedback
 */
export type ValidationState = 'default' | 'success' | 'error' | 'loading';

/**
 * Result of validation state derivation for Input components
 * Only includes props that should be passed to DOM elements
 */
export interface ValidationProps {
  validationState: ValidationState;
  showValidationIcon: boolean;
}

/**
 * Extended validation result including isValid for logic checks
 * The isValid property should NOT be spread onto DOM elements
 */
export interface ValidationResult extends ValidationProps {
  isValid: boolean;
}

/**
 * Options for validation state derivation
 *
 * These options control UI behavior only - validation logic lives in Zod schemas.
 */
export interface ValidationOptions {
  /** Whether to show success icon when valid */
  showSuccessIcon?: boolean;
}

/**
 * Base function to derive validation props from React Hook Form state
 *
 * This is the single source of truth for all validation state derivation.
 * It ONLY interprets fieldState from React Hook Form - all validation logic
 * lives in Zod schemas. With mode: 'onChange', fieldState.error is always
 * up-to-date, so we can trust it completely.
 *
 * IMPORTANT: This function does NOT check field length or value - that's
 * Zod's responsibility. If a field is required and empty, Zod will return
 * an error. If a field is optional and empty, Zod won't return an error.
 * This ensures Zod is the single source of truth for all validation rules.
 *
 * @param fieldState - React Hook Form field state (has error and isDirty)
 * @param options - UI configuration options (icons, display behavior)
 * @returns Validation props for UI rendering
 */
const deriveValidationPropsInternal = (
  fieldState: { error?: FieldError; isDirty?: boolean; isTouched?: boolean },
  options: ValidationOptions = {}
): ValidationResult => {
  const { showSuccessIcon = true } = options;

  // Always show error state if React Hook Form has an error
  if (fieldState.error) {
    return {
      validationState: 'error',
      showValidationIcon: true,
      isValid: false,
    };
  }

  // Success state: No error + field value has been changed
  // In onChange mode, isDirty is the precise indicator of user modification.
  // Zod has already validated everything (required fields, length, format, checksum, etc.)
  if (fieldState.isDirty) {
    return {
      validationState: 'success',
      showValidationIcon: showSuccessIcon,
      isValid: true,
    };
  }

  // Default state - field hasn't been modified yet
  return {
    validationState: 'default',
    showValidationIcon: false,
    isValid: false,
  };
};

/**
 * Export a clean version that only returns Input-compatible props
 */
export const deriveValidationProps = (
  fieldState: { error?: FieldError; isDirty?: boolean; isTouched?: boolean },
  options: ValidationOptions = {}
): ValidationProps => {
  const result = deriveValidationPropsInternal(fieldState, options);
  // Return only props safe for DOM elements
  return {
    validationState: result.validationState,
    showValidationIcon: result.showValidationIcon,
  };
};

/**
 * Data attributes interface for validation state
 * Using data attributes follows web standards and reduces coupling between components
 */
export interface ValidationDataAttributes {
  'data-validation-state': ValidationState;
  'data-show-validation-icon': string; // string because data attributes are always strings
}

/**
 * Derive validation state as data attributes for reduced coupling
 *
 * This function returns HTML data attributes instead of custom props, following
 * web standards and reducing implicit coupling between TypedFormField and Input.
 *
 * **Benefits:**
 * - Standard HTML pattern - no special knowledge needed by child components
 * - Reduced coupling - components don't depend on TypedFormField's API
 * - Better reusability - components work anywhere, not just inside TypedFormField
 * - Cleaner API - child components just spread all props without filtering
 *
 * @param fieldState - React Hook Form field state
 * @param options - UI configuration options
 * @returns Data attributes object that can be spread onto any HTML element
 *
 * @example
 * ```tsx
 * const dataAttrs = deriveValidationDataAttributes(fieldState, { showSuccessIcon: true });
 * // Returns: { 'data-validation-state': 'success', 'data-show-validation-icon': 'true' }
 * <input {...dataAttrs} />
 * ```
 */
export const deriveValidationDataAttributes = (
  fieldState: { error?: FieldError; isDirty?: boolean; isTouched?: boolean },
  options: ValidationOptions = {}
): ValidationDataAttributes => {
  const result = deriveValidationPropsInternal(fieldState, options);
  return {
    'data-validation-state': result.validationState,
    'data-show-validation-icon': String(result.showValidationIcon),
  };
};

/**
 * Get full validation result including isValid for logic checks
 * Use this when you need the isValid property for conditional logic
 */
export const deriveValidationResult = (
  fieldState: { error?: FieldError; isDirty?: boolean; isTouched?: boolean },
  options: ValidationOptions = {}
): ValidationResult => {
  return deriveValidationPropsInternal(fieldState, options);
};

// ============================================================================
// Configuration-driven validation architecture
// ============================================================================

/**
 * Centralized UI configuration for all field types
 *
 * These configurations control ONLY UI behavior (icons, display).
 * All validation logic (length, format, checksum) lives in Zod schemas.
 *
 * Single Source of Truth:
 * - Validation rules → Zod schemas in fieldSchemas.ts
 * - UI behavior → VALIDATION_CONFIGS below
 */
const VALIDATION_CONFIGS = {
  // Business IDs - show success icons
  nip: { showSuccessIcon: true },
  pesel: { showSuccessIcon: true },
  krs: { showSuccessIcon: true },
  regon: { showSuccessIcon: true },
  postalCode: { showSuccessIcon: true },

  // Text fields - show success icons
  firstName: { showSuccessIcon: true },
  lastName: { showSuccessIcon: true },
  companyName: { showSuccessIcon: true },
  email: { showSuccessIcon: true },
  phone: { showSuccessIcon: true },
  street: { showSuccessIcon: true },
  city: { showSuccessIcon: true },
  buildingNumber: { showSuccessIcon: true },
  businessNumber: { showSuccessIcon: true },
  pep: { showSuccessIcon: true },

  // Special cases - no success icons
  standard: { showSuccessIcon: false },
} as const;

/**
 * Internal helper to get validation props using configuration
 */
const deriveConfiguredValidationProps = (
  configKey: keyof typeof VALIDATION_CONFIGS,
  fieldState: { error?: FieldError; isDirty?: boolean; isTouched?: boolean }
): ValidationProps => {
  const config = VALIDATION_CONFIGS[configKey];
  return deriveValidationProps(fieldState, config);
};

/**
 * Generic validation props deriver - single function to replace all field-specific wrappers
 *
 * ARCHITECTURE: This generic function eliminates the need for 15+ nearly identical
 * derive*ValidationProps wrapper functions. Instead of one function per field type,
 * we have one function that accepts the field type as a parameter.
 *
 * Usage:
 * - deriveValidationPropsFor('nip', fieldState)
 * - deriveValidationPropsFor('pesel', fieldState)
 * - deriveValidationPropsFor('standard', fieldState)
 *
 * Type Safety: The fieldType parameter is constrained to keys in VALIDATION_CONFIGS,
 * ensuring only valid field types can be used.
 *
 * @param fieldType - The type of field (must exist in VALIDATION_CONFIGS)
 * @param fieldState - React Hook Form field state
 * @returns Validation props for UI rendering
 */
export const deriveValidationPropsFor = (
  fieldType: keyof typeof VALIDATION_CONFIGS,
  fieldState: { error?: FieldError; isDirty?: boolean; isTouched?: boolean }
): ValidationProps => deriveConfiguredValidationProps(fieldType, fieldState);

/**
 * NIP validation with full result for logic checks
 * Special case: Returns ValidationResult (includes isValid) instead of just ValidationProps
 */
export const deriveNipValidationResult = (fieldState: {
  error?: FieldError;
  isDirty?: boolean;
  isTouched?: boolean;
}): ValidationResult => {
  const config = VALIDATION_CONFIGS.nip;
  return deriveValidationResult(fieldState, config);
};

/**
 * Error-only validation (only shows error state, never success)
 */
export const deriveErrorOnlyValidationProps = (fieldState: {
  error?: FieldError;
}): ValidationProps => {
  return {
    validationState: fieldState.error ? 'error' : 'default',
    showValidationIcon: !!fieldState.error,
  };
};

// Note: createValidationHelper has been removed as it was running duplicate validation.
// All validation is now handled by React Hook Form + Zod schemas.
