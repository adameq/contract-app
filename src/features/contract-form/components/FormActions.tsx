import { useFormContext, useFormState } from 'react-hook-form';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/ui/spinner';

import { useSubmissionGuard } from '../hooks/useSubmissionGuard';
import { useSubmissionState } from '../hooks/useSubmissionState';
import type { FinalContractData } from '../schema/companySchemas';
import { FormSubmitStatus } from './FormSubmitStatus';

interface SubmitButtonProps {
  isPending: boolean;
  isBlocked: boolean;
  blockReason?: string;
}

function SubmitButton({
  isPending,
  isBlocked,
  blockReason,
}: SubmitButtonProps) {
  const isDisabled = isPending || isBlocked;

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="submit"
        size="lg"
        className="min-w-40 flex items-center gap-2"
        disabled={isDisabled}
        title={blockReason}
      >
        {isPending && <Spinner />}
        {isPending ? 'Wysyłanie...' : 'Wyślij formularz'}
      </Button>
      {isBlocked && blockReason && (
        <p className="text-sm text-destructive text-center max-w-md">
          {blockReason}
        </p>
      )}
    </div>
  );
}

/**
 * Component handling form submission status and submit button.
 *
 * This component uses useSubmissionState hook to access submission state
 * directly from React Query, eliminating the need for props and making
 * it autonomous. This prevents unnecessary re-renders of parent components
 * and improves the overall performance.
 *
 * SUBMISSION GUARD:
 * - Uses useSubmissionGuard hook for centralized validation logic
 * - Single source of truth for all submission blocking conditions
 * - Combines form validation and company status checks
 * - Consistent with StepNavigation submit button behavior
 *
 * ERROR DISPLAY:
 * - Shows RHF root errors (e.g., unrecognized server validation errors)
 * - Persistent display (doesn't disappear like toasts)
 * - Clear visibility near submit button for better UX
 *
 * BENEFITS:
 * - No prop drilling required
 * - Component is fully autonomous
 * - Optimized re-renders (only when submission state changes)
 * - Easier testing in isolation
 * - DRY principle (validation logic in one hook)
 * - Clean component code (minimal validation logic)
 */
export function FormActions() {
  // Get form context for error state (uses FinalContractData for full form access)
  const { control } = useFormContext<FinalContractData>();
  const { errors } = useFormState({ control });

  // Get submission state directly from React Query mutation cache
  const { isPending } = useSubmissionState();

  // Get submission guard (combines form validation + company status validation)
  const { isBlocked, blockReason } = useSubmissionGuard();

  return (
    <div className="container mx-auto px-4 py-8">
      <FormSubmitStatus />

      {/* Display root-level errors (e.g., unrecognized server validation errors) */}
      {errors.root?.serverError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Błąd walidacji</AlertTitle>
          <AlertDescription>{errors.root.serverError.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <SubmitButton
          isPending={isPending}
          isBlocked={isBlocked}
          blockReason={blockReason}
        />
      </div>
    </div>
  );
}
