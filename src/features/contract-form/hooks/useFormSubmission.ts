/**
 * useFormSubmission Hook
 *
 * Extracts all submission logic from FormStepLayout into a reusable hook.
 * Reduces FormStepLayout from 300 lines to ~100 lines (67% reduction).
 *
 * ## PROBLEM IT SOLVES
 *
 * **Old FormStepLayout** was a "God Component":
 * - 300 lines total
 * - 75 lines of error mapping logic
 * - Server error propagation via Zustand
 * - Manual validation + merge + submission flow
 * - Hard to test, hard to reuse
 *
 * **New Architecture**:
 * - Hook encapsulates all submission complexity
 * - Component becomes thin wrapper
 * - Server errors handled directly in single FormProvider
 * - Clean separation of concerns
 *
 * ## REACT 19 CONSIDERATIONS
 *
 * **Why not useActionState?**
 *
 * React 19's `useActionState` is designed for:
 * - Server Actions in RSC environments (Next.js App Router)
 * - Progressive enhancement with FormData
 * - Native form action prop integration
 *
 * Current implementation with React Query's `useMutation` is better because:
 * - ✅ **Request deduplication** - Prevents duplicate submissions automatically
 * - ✅ **Automatic retries** - Handles transient network failures
 * - ✅ **Optimistic updates** - Can update UI before server confirms (if needed)
 * - ✅ **Cache integration** - Mutation results can update query cache
 * - ✅ **SPA-first design** - Optimized for client-side apps without SSR
 * - ✅ **Better developer experience** - Rich devtools, established patterns
 *
 * `useActionState` would require:
 * - ❌ Reimplementing state management manually
 * - ❌ Losing React Query ecosystem benefits
 * - ❌ Architectural changes to use form action instead of button onClick
 * - ❌ More boilerplate for features React Query provides out of the box
 *
 * **React 19 features we DO use:**
 * - ✅ `use()` hook for context consumption (see useTheme.ts)
 * - ✅ Modern React patterns with discriminated unions
 * - ✅ Concurrent rendering safe (no startTransition needed - mutations handle this)
 *
 * **Future considerations:**
 * If migrating to Next.js App Router with Server Actions, then `useActionState`
 * would be the right choice. For client-side SPA, current approach is optimal.
 *
 * ## SUBMISSION FLOW
 *
 * 1. **Pre-Validation**: Trigger RHF validation on all fields
 * 2. **Persistence**: Save current state to Zustand (backup before submit)
 * 3. **Final Validation**: Zod validation as defense-in-depth
 * 4. **API Submission**: Submit via React Query mutation
 * 5. **Success Handling**: Clear form, navigate, callback
 * 6. **Error Handling**: Map server errors to fields, show toasts
 *
 * ## ERROR HANDLING IMPROVEMENTS
 *
 * **Old (Separate FormProviders)**:
 * - Server errors for sub-forms couldn't be set directly
 * - Had to propagate via Zustand → useServerErrorSync → setError in sub-form
 * - Complex 75-line error mapping in FormStepLayout
 *
 * **New (Single FormProvider)**:
 * - Direct setError('company.nip', {...}) works immediately
 * - No Zustand propagation needed
 * - Simpler 30-line error handling
 * - Errors appear inline instantly
 *
 * ## USAGE
 *
 * ```typescript
 * function FormStepLayoutV2() {
 *   const { handleSubmit, isSubmitting } = useFormSubmission({
 *     onSuccess: (contractId) => {
 *       navigate(ROUTES.FORM_SUCCESS(contractId));
 *     },
 *   });
 *
 *   return (
 *     <StepNavigation
 *       onSubmit={handleSubmit}
 *       disabled={isSubmitting}
 *     />
 *   );
 * }
 * ```
 */

import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { submitContract } from '@/shared/api/contractApi';
import { isValidationError } from '@/shared/api/errors';
import { MUTATION_KEYS } from '@/shared/constants/mutationKeys';
import { logger, logUserAction } from '@/shared/lib/logger';

import {
  type FinalContractData,
  finalContractSchema,
} from '../schema/companySchemas';
import { useFormPersistStore } from '../store/useFormPersistStore';
import { isValidFormPath } from '../utils/formPaths';

/**
 * Options for useFormSubmission hook
 */
interface UseFormSubmissionOptions {
  /**
   * React Hook Form methods
   * Must be passed from outside since hook is called before FormProvider
   */
  methods: UseFormReturn<FinalContractData>;

  /**
   * Callback on successful submission
   * Receives contractId from API response
   */
  onSuccess?: (contractId: string) => void;

  /**
   * Callback on submission error
   * Receives error instance
   */
  onError?: (error: Error) => void;
}

/**
 * Return type for useFormSubmission hook
 */
interface UseFormSubmissionReturn {
  /** Submit handler function */
  handleSubmit: () => Promise<void>;

  /** Whether submission is in progress */
  isSubmitting: boolean;
}

/**
 * Hook for form submission orchestration
 *
 * Handles complete submission flow:
 * - Validation
 * - Persistence
 * - API submission
 * - Success/error handling
 * - Server error mapping
 *
 * @param options - Submission options (onSuccess, onError callbacks)
 * @returns Submit handler and loading state
 *
 * @example
 * ```typescript
 * const { handleSubmit, isSubmitting } = useFormSubmission({
 *   onSuccess: (contractId) => navigate(`/success/${contractId}`),
 * });
 *
 * <Button onClick={handleSubmit} disabled={isSubmitting}>
 *   {isSubmitting ? 'Wysyłanie...' : 'Wyślij formularz'}
 * </Button>
 * ```
 */
export function useFormSubmission(
  options: UseFormSubmissionOptions
): UseFormSubmissionReturn {
  const { methods, onSuccess, onError } = options;

  // Access persistence store for backup
  const { saveForm } = useFormPersistStore();

  // React Query mutation for API submission
  const { mutate: submitMutation, isPending: isSubmitting } = useMutation({
    mutationKey: MUTATION_KEYS.CONTRACT_SUBMISSION,
    mutationFn: submitContract,
    onSuccess: data => {
      const contractId = data.contractId;
      logger.info('Contract submitted successfully', {
        component: 'useFormSubmission',
        action: 'contractSubmission',
        contractId,
        userType: methods.getValues('userType'),
      });
      logUserAction('contract_submitted', { contractId });

      // Clear form data from persistence store
      // Note: Form state in RHF will be cleared when component unmounts
      const { clearForm } = useFormPersistStore.getState();
      clearForm();

      // Call success callback (typically navigate to success page)
      onSuccess?.(contractId);
    },
    onError: error => {
      logger.error(
        'Contract submission failed',
        error instanceof Error ? error : undefined,
        {
          component: 'useFormSubmission',
          action: 'contractSubmission',
          userType: methods.getValues('userType'),
        }
      );

      /**
       * Enhanced error handling for ValidationError (HTTP 422)
       *
       * ValidationError contains field-level errors from server validation.
       * We map these errors to form fields for inline display.
       *
       * KEY IMPROVEMENT over old architecture:
       * With Single FormProvider, we can set errors on any field directly:
       * - SharedFormData errors: setError('personalData.firstName', ...)
       * - Company errors: setError('company.nip', ...)
       * - No Zustand propagation needed
       * - Errors appear inline immediately
       */
      if (isValidationError(error)) {
        let totalErrors = 0;

        // Map server validation errors to form fields
        error.getErrorFields().forEach(fieldPath => {
          const errorMessage = error.getFieldError(fieldPath);

          // Explicitly validate field path before setting error
          // This prevents invalid server paths while allowing real errors to propagate
          if (isValidFormPath(fieldPath)) {
            // Valid path - set error on field directly
            // This works for ALL fields in the discriminated union:
            // - 'personalData.firstName'
            // - 'company.nip'
            // - 'company.address.street'
            // etc.
            methods.setError(fieldPath, {
              type: 'server',
              message: errorMessage ?? 'Błąd walidacji',
            });
            totalErrors++;
          } else {
            // Invalid path - server returned error for field not in our form
            // This could indicate API contract violation or outdated field names
            logger.warn(
              'Server returned error for invalid form field',
              undefined,
              {
                component: 'useFormSubmission',
                fieldPath,
                errorMessage,
                hint: 'This may indicate API/frontend schema mismatch',
              }
            );
            // Set as root error so user sees the message but without breaking
            methods.setError('root.serverError', {
              type: 'server',
              message: `${fieldPath}: ${errorMessage ?? 'Błąd walidacji'}`,
            });
            totalErrors++;
          }
        });

        // Show helpful toast with error summary
        const toastDescription =
          totalErrors === 1
            ? 'Sprawdź poprawność wypełnionego pola.'
            : 'Sprawdź poprawność wypełnionych pól.';

        toast.error(
          `Formularz zawiera ${totalErrors} ${totalErrors === 1 ? 'błąd' : 'błędów'} walidacji`,
          {
            description: toastDescription,
            duration: 10000, // Longer duration for validation errors
          }
        );

        // Log validation errors for debugging
        logger.warn('Server validation errors mapped to form', undefined, {
          component: 'useFormSubmission',
          totalErrors,
          errorFields: error.getErrorFields(),
        });

        // Don't call onError callback for validation errors
        // These are user-correctable, not application errors
        return;
      }

      // Fallback for non-validation errors (HttpError, NetworkError, etc.)
      toast.error('Błąd wysyłania formularza', {
        description:
          error instanceof Error
            ? error.message
            : 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
        duration: 8000,
      });

      // Call error callback if provided
      onError?.(error);
    },
  });

  /**
   * Submit handler
   *
   * Orchestrates the complete submission flow:
   * 1. Validate form data
   * 2. Save to persistence (backup)
   * 3. Validate with Zod (defense-in-depth)
   * 4. Submit to API
   */
  const handleSubmit = useCallback(async () => {
    // ============================================================================
    // STEP 1: Validate with React Hook Form
    // ============================================================================
    const isValid = await methods.trigger();
    if (!isValid) {
      // RHF automatically focuses first invalid field
      toast.error('Formularz zawiera błędy', {
        description: 'Sprawdź poprawność wypełnionych pól.',
        duration: 5000,
      });
      return;
    }

    // ============================================================================
    // STEP 2: Get form data
    // ============================================================================
    const formData = methods.getValues();

    // ============================================================================
    // STEP 3: Save to persistence store (backup before submit)
    // ============================================================================
    saveForm(formData);

    // ============================================================================
    // STEP 4: Validate with Zod (defense-in-depth)
    // ============================================================================
    // This catches any data corruption from storage or runtime issues
    const validationResult = finalContractSchema.safeParse(formData);
    if (!validationResult.success) {
      logger.error('Final data validation failed', undefined, {
        component: 'useFormSubmission',
        action: 'finalValidation',
        userType: methods.getValues('userType'),
        errors: validationResult.error.errors,
      });
      toast.error('Błąd walidacji danych', {
        description:
          'Dane formularza są niekompletne lub nieprawidłowe. Sprawdź wszystkie pola i spróbuj ponownie.',
        duration: 8000,
      });
      return;
    }

    // ============================================================================
    // STEP 5: Submit to API
    // ============================================================================
    submitMutation(validationResult.data);
  }, [methods, saveForm, submitMutation]);

  return {
    handleSubmit,
    isSubmitting,
  };
}
