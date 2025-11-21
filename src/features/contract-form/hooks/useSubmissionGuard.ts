/**
 * Hook for submission guard logic
 *
 * Validates all submission requirements before form submission using
 * Single FormProvider architecture.
 *
 * ## ARCHITECTURE
 *
 * Simple validation with 2 sources:
 * - formState.isValid: Covers ALL fields (FinalContractData)
 * - Company status validation: Checks GUS data and active status
 *
 * No complex aggregation or multiple form contexts needed.
 *
 * @returns Object with isBlocked flag and blockReason message
 */

import { useFormContext, useFormState } from 'react-hook-form';

import type { FinalContractData } from '../schema/companySchemas';
import { useCompanyStatusValidation } from './useCompanyStatusValidation';

/**
 * Return type for useSubmissionGuard hook
 */
interface SubmissionGuard {
  /** Whether submission should be blocked */
  isBlocked: boolean;
  /** User-friendly reason why submission is blocked (undefined if not blocked) */
  blockReason?: string;
}

/**
 * Hook to validate all submission requirements before form submission
 *
 * V2 Architecture: Much simpler with Single FormProvider
 * - Single formState.isValid covers all fields (SharedFormData + company data)
 * - No need to aggregate validation from multiple sources
 * - Just combine with company status validation
 *
 * @returns Validation result with isBlocked flag and optional blockReason message
 */
export function useSubmissionGuard(): SubmissionGuard {
  // Get form context for validation state (FinalContractData - everything)
  const { control } = useFormContext<FinalContractData>();

  // Subscribe to form validation state (re-renders when validation changes)
  // This validates ALL fields: SharedFormData + company data
  const { isValid: isFormValid } = useFormState({ control });

  // Check company status validation (only applies to 'company' user type)
  // Returns { isBlocked: false } for other types
  const { isBlocked: isCompanyBlocked, blockReason: companyBlockReason } =
    useCompanyStatusValidation();

  // Check if form has validation errors
  const isFormInvalid = !isFormValid;
  const formInvalidReason = isFormInvalid
    ? 'Proszę wypełnić wszystkie wymagane pola poprawnie'
    : undefined;

  // Combine all blocking conditions
  // Priority: company status > form validation
  const isBlocked = isCompanyBlocked || isFormInvalid;
  const blockReason = companyBlockReason ?? formInvalidReason;

  return { isBlocked, blockReason };
}
