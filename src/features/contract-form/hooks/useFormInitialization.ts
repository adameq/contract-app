/**
 * useFormInitialization Hook
 *
 * Provides initial form values from persistence store or defaults.
 * Simplifies FormStepLayout initialization logic.
 *
 * ## RESPONSIBILITIES
 *
 * 1. Check persistence store for saved data
 * 2. Return saved data if found
 * 3. Return defaults if not found
 * 4. Handle type safety for discriminated union
 *
 * ## ARCHITECTURE
 *
 * Single hook returns complete FinalContractData initial state:
 * - One persistence store (useFormPersistStore)
 * - One storage key (sessionStorage)
 * - Simple, direct access without coordination
 *
 * ## USAGE
 *
 * ```typescript
 * function FormStepLayout() {
 *   const initialValues = useFormInitialization();
 *
 *   const methods = useForm<FinalContractData>({
 *     defaultValues: initialValues,
 *     resolver: zodResolver(finalContractSchema),
 *     mode: 'onChange',
 *   });
 *
 *   return <FormProvider {...methods}>...</FormProvider>;
 * }
 * ```
 */

import type { FinalContractData } from '../schema/companySchemas';
import { useFormPersistStore } from '../store/useFormPersistStore';
import { mergeWithDefaults } from '../utils/formDataHelpers';

/**
 * Hook for getting initial form values
 *
 * Returns saved data from persistence store, or defaults if none exists.
 * Ensures returned value always matches FinalContractData structure.
 *
 * IMPORTANT: Merges saved data with defaults to prevent undefined values.
 * This prevents React "uncontrolled to controlled" warnings when:
 * - sessionStorage has partial data (missing nested fields)
 * - Schema changed and old data is incomplete
 *
 * @returns Initial form values (saved or defaults)
 *
 * @example
 * ```typescript
 * const initialValues = useFormInitialization();
 * const methods = useForm({ defaultValues: initialValues });
 * ```
 */
export function useFormInitialization(): FinalContractData {
  // Get saved data from persistence store
  const savedData = useFormPersistStore(state => state.formData);

  // OPTIMIZATION: Use helper function with structuredClone
  // Replaces manual deep merge (45 lines → 1 line)
  // Uses structuredClone when available (faster than manual spread)
  //
  // CRITICAL: Always merge with defaults to ensure all fields are defined
  // This prevents "uncontrolled to controlled" warnings when:
  // 1. savedData has missing nested fields (old sessionStorage data)
  // 2. User clears storage manually
  // 3. Schema structure changed between sessions
  return mergeWithDefaults(savedData);
}
