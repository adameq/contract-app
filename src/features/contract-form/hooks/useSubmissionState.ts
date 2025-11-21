/**
 * Custom hook for accessing submission state without prop drilling
 *
 * This hook provides access to submission state from React Query mutation
 * without requiring props to be passed down through the component tree.
 *
 * ARCHITECTURAL BENEFITS:
 *
 * 1. Eliminates prop drilling:
 *    - FormActions doesn't need props from App
 *    - Components can be more autonomous
 *    - Easier testing in isolation
 *
 * 2. Optimized re-renders:
 *    - Only components using this hook re-render on state changes
 *    - App component doesn't re-render when submission state changes
 *    - Better performance in complex forms
 *
 * 3. Consistent with React Hook Form patterns:
 *    - Similar to useFormState from react-hook-form
 *    - Components self-manage their state subscriptions
 *    - Follows "components know what they need" principle
 */

import { useMutationState } from '@tanstack/react-query';

import type { ContractSubmissionResponse } from '@/shared/api/contractApi';
import { MUTATION_KEYS } from '@/shared/constants/mutationKeys';

/**
 * Hook to access contract submission state from React Query mutation cache
 *
 * This hook allows components to subscribe to submission state without
 * requiring props from parent components. It uses React Query's
 * useMutationState to track the latest mutation state.
 *
 * @returns Submission state object with loading, success, error, and data states
 *
 * @example
 * ```tsx
 * function FormActions() {
 *   const { isSubmitting, isSuccess, error, data } = useSubmissionState();
 *
 *   if (isSubmitting) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *   if (isSuccess) return <Success data={data} />;
 *
 *   return <SubmitButton />;
 * }
 * ```
 */
export function useSubmissionState() {
  // Subscribe to the latest contract submission mutation state
  const mutationState = useMutationState({
    filters: { mutationKey: MUTATION_KEYS.CONTRACT_SUBMISSION },
    select: mutation => ({
      isPending: mutation.state.status === 'pending',
      isSuccess: mutation.state.status === 'success',
      isError: mutation.state.status === 'error',
      error: mutation.state.error,
      data: mutation.state.data as ContractSubmissionResponse | undefined,
    }),
  });

  // Get the latest mutation state (most recent submission)
  const latestState = mutationState[0];

  // Return default state if no mutation exists yet
  return (
    latestState ?? {
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
    }
  );
}

/**
 * Type alias for the return type of useSubmissionState
 * Useful for TypeScript consumers
 */
export type SubmissionState = ReturnType<typeof useSubmissionState>;
