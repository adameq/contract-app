import { useCallback } from 'react';
import { isValidPhoneNumber } from 'react-phone-number-input';

import type { ValidationState } from '@/shared/lib/validation/helpers';

/**
 * Custom hook for phone number validation with stable reference
 *
 * Provides a memoized validation function that:
 * - Returns consistent ValidationState values
 * - Triggers validation only for 3+ character inputs
 * - Handles isValidPhoneNumber exceptions gracefully
 * - Maintains stable function reference to prevent re-renders
 */
export const usePhoneValidation = () => {
  /**
   * Memoized validation function with stable reference
   * No dependencies - pure function based on input parameter only
   */
  const validatePhone = useCallback((value: string): ValidationState => {
    // No validation for empty or short values (< 3 chars)
    if (!value || value.length < 3) {
      return 'default';
    }

    try {
      // Use react-phone-number-input validation for 3+ characters
      return isValidPhoneNumber(value) ? 'success' : 'error';
    } catch {
      // Handle any validation errors gracefully
      return 'error';
    }
  }, []); // Empty dependencies - pure function

  return validatePhone;
};
