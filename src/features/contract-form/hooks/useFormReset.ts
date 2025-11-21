/**
 * Form Reset Hook
 *
 * Centralized logic for resetting the entire form to initial state.
 * This hook encapsulates all the side effects required for a complete reset:
 * - React Hook Form state
 * - Session storage persistence
 * - React Query cache
 * - Router navigation
 *
 * SEPARATION OF CONCERNS:
 * - Application state management logic extracted from UI components
 * - Can be reused across multiple components (progress bar, error boundary, header)
 * - Easier to test in isolation
 *
 * @example
 * ```tsx
 * function FormStepLayout() {
 *   const { handleReset } = useFormReset();
 *   return <StepNavigation onReset={handleReset} />;
 * }
 * ```
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/shared/constants/routes';

import {
  DEFAULT_FINAL_CONTRACT_DATA,
  type FinalContractData,
} from '../schema/companySchemas';
import { useFormPersistStore } from '../store/useFormPersistStore';

/**
 * Hook for resetting the entire form to initial state
 *
 * Performs a complete reset of all application state:
 * 1. React Hook Form state → default values (FinalContractData)
 * 2. Session storage → cleared (via Zustand persist)
 * 3. React Query cache → cleared (company data, etc.)
 * 4. Router → navigate to first step
 *
 * **Architecture:**
 * - Single FormProvider with FinalContractData
 * - Single Zustand persist store (sessionStorage cleared automatically)
 * - Simple coordination without multiple storage keys
 *
 * @param reset - React Hook Form reset function (passed as param to avoid useFormContext before FormProvider)
 * @returns Object with handleReset function
 */
export function useFormReset(reset: (values: FinalContractData) => void) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearForm } = useFormPersistStore();

  const handleReset = useCallback(() => {
    // 1. Reset React Hook Form state to defaults (FinalContractData)
    reset(DEFAULT_FINAL_CONTRACT_DATA);

    // 2. Clear Zustand persistence store (sessionStorage cleared automatically)
    clearForm();

    // 3. Clear all React Query cached data (company data, etc.)
    queryClient.clear();

    // 4. Navigate back to first step
    void navigate(ROUTES.FORM_STEP_1);
  }, [reset, navigate, queryClient, clearForm]);
  // Note: All dependencies are stable references from React Hook Form, React Router, React Query, and Zustand

  return { handleReset };
}
