/**
 * useFormCompletion Hook
 *
 * Calculates form completion percentage based on filled required fields.
 *
 * ## Architecture
 *
 * This hook leverages existing validation infrastructure:
 * - Uses Zod schemas to determine required fields
 * - Leverages React Hook Form's formState for errors
 * - Watches form data reactively for real-time updates
 *
 * ## Performance
 *
 * - Memoizes required fields list (changes only with userType)
 * - Selective watching of only userType (not full form data)
 * - Efficient completion calculation
 *
 * @returns Object with completedCount, totalCount, and percentage
 */

import { useMemo } from 'react';
import { useFormState, useWatch } from 'react-hook-form';

import type { FinalContractData } from '../../schema/companySchemas';
import type { UserType } from '../../schema/sharedSchema';
import { calculateFormCompletion } from '../../utils/formFieldHelpers';

export interface FormCompletionResult {
  /**
   * Number of completed required fields
   */
  completedCount: number;

  /**
   * Total number of required fields for current user type
   */
  totalCount: number;

  /**
   * Completion percentage (0-100)
   */
  percentage: number;
}

/**
 * Hook to calculate form completion based on filled fields
 *
 * Dynamically adjusts required fields based on user type selection.
 * Special handling for:
 * - PESEL: Counts as completed if either filled OR "without PESEL" is checked
 * - PEP: Flag must be selected (true/false), and conditional fields required when flag is true
 * - User type specific fields: Company has most fields, consumer has least
 *
 * @example
 * ```tsx
 * function StepProgress() {
 *   const { completedCount, totalCount, percentage } = useFormCompletion();
 *
 *   return (
 *     <div>
 *       <Progress value={percentage} />
 *       <span>{percentage}% wypełniono</span>
 *       <span>{completedCount} z {totalCount} pól</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFormCompletion(): FormCompletionResult {
  // ============================================================================
  // FORM STATE ACCESS
  // ============================================================================

  // Get validation errors from React Hook Form
  const { errors } = useFormState<FinalContractData>();

  // Watch complete form data (needed for checking field values)
  // Note: This is reactive and will update when any field changes
  const formData = useWatch<FinalContractData>();

  // Watch userType separately for memoization optimization
  const userType = useWatch<FinalContractData, 'userType'>({
    name: 'userType',
  }) as UserType | 'none';

  // ============================================================================
  // COMPLETION CALCULATION
  // ============================================================================

  // Calculate completion whenever form data, errors, or userType changes
  const completion = useMemo(() => {
    return calculateFormCompletion(formData, errors, userType);
  }, [formData, errors, userType]);

  return completion;
}
