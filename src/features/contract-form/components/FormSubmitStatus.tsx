import { AlertCircle, CheckCircle } from 'lucide-react';

import { Spinner } from '@/shared/components/ui/spinner';

import { useSubmissionState } from '../hooks/useSubmissionState';

/**
 * Component that displays form submission status (loading, errors, success).
 *
 * This component uses useSubmissionState hook to access submission state
 * directly from React Query, eliminating the need for props and making
 * it autonomous. This prevents unnecessary re-renders of parent components
 * and improves the overall performance.
 *
 * Displays different UI states based on React Query mutation state:
 * - Loading: Shows spinner during form submission
 * - Success: Shows confirmation message when submission succeeds
 * - Error: Shows error message when submission fails
 *
 * ARCHITECTURAL BENEFITS:
 * - No prop drilling required
 * - Component is fully autonomous
 * - Optimized re-renders (only when submission state changes)
 * - Consistent with FormActions and StepNavigation patterns
 * - Easier testing in isolation
 */
export function FormSubmitStatus() {
  // Get submission state directly from React Query mutation cache
  const { isPending, isSuccess, error, data } = useSubmissionState();

  // Don't show anything if there's no state to display
  if (!isPending && !isSuccess && !error) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Loading state from React Query mutation */}
      {isPending && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
          <Spinner className="h-5 w-5" />
          <span className="font-medium">Wysyłanie formularza...</span>
        </div>
      )}

      {/* Success state */}
      {isSuccess && !isPending && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Formularz został wysłany</p>
            <p className="text-sm mt-1">
              {data?.message ?? 'Formularz został pomyślnie wysłany'}
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isPending && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Nie udało się wysłać formularza</p>
            <p className="text-sm mt-1">
              {error.message ?? 'Wystąpił błąd podczas wysyłania formularza'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
