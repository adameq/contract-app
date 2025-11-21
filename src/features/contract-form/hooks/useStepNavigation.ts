/**
 * Hook for programmatic step navigation
 *
 * Provides functions to navigate between form steps with validation
 * and state management integration.
 */

import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ROUTES } from '@/shared/constants/routes';

import { getTotalSteps } from '../utils/pageConfig';

interface UseStepNavigationReturn {
  currentStep: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  hasNextStep: boolean;
  hasPreviousStep: boolean;
}

/**
 * Hook for navigating between form steps
 */
export function useStepNavigation(): UseStepNavigationReturn {
  const navigate = useNavigate();
  const params = useParams<{ step: string }>();

  // Get current step from URL params
  const currentStep = params.step ? parseInt(params.step, 10) : 1;

  /**
   * Navigate to the next step
   */
  const goToNextStep = useCallback(() => {
    const nextStep = currentStep + 1;

    // Don't go beyond last step
    if (nextStep > getTotalSteps()) {
      return;
    }

    // Navigate to next step
    void navigate(ROUTES.FORM_STEP(nextStep));
  }, [currentStep, navigate]);

  /**
   * Navigate to the previous step
   */
  const goToPreviousStep = useCallback(() => {
    const previousStep = currentStep - 1;

    // Don't go before first step
    if (previousStep < 1) {
      return;
    }

    void navigate(ROUTES.FORM_STEP(previousStep));
  }, [currentStep, navigate]);

  /**
   * Navigate to a specific step
   *
   * BUSINESS DECISION: All steps are freely accessible without validation
   *
   * Users can jump to any step without completing previous steps.
   * This design choice enables:
   * - Free navigation between steps for review/editing
   * - Better user experience (no forced linear progression)
   * - Auto-saved progress (Zustand store with sessionStorage)
   * - Final validation on submit instead of per-step validation
   *
   * @see router.tsx validateStepParamLoader - Detailed rationale for free navigation
   */
  const goToStep = useCallback(
    (step: number) => {
      // Validate step number is within range
      if (step < 1 || step > getTotalSteps()) {
        return;
      }

      // Steps are freely accessible - navigate directly
      void navigate(ROUTES.FORM_STEP(step));
    },
    [navigate]
  );

  // Determine if next/previous steps exist (for UI state only)
  // These flags indicate step availability, NOT navigation permission
  // Navigation is always free - these are used for button visibility/state
  const hasNextStep = currentStep < getTotalSteps();
  const hasPreviousStep = currentStep > 1;

  return {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    hasNextStep,
    hasPreviousStep,
  };
}
