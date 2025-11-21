/**
 * Step Navigation Component
 *
 * Provides Previous/Next/Submit buttons for navigating between form steps.
 *
 * ## ARCHITECTURE
 *
 * This component uses `useSubmissionState()` hook to access submission state
 * directly from React Query, eliminating prop drilling and making it autonomous.
 *
 * **Key Benefits**:
 * - No prop drilling for submission state
 * - Consistent with FormActions component pattern
 * - Optimized re-renders (only when submission state changes)
 * - Fully autonomous and testable in isolation
 * - Aligns with V2 Single FormProvider architecture
 */

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useEffect } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/ui/spinner';
import { cn } from '@/shared/lib/utils';

import { useStepNavigation } from '../../hooks/useStepNavigation';
import { useSubmissionGuard } from '../../hooks/useSubmissionGuard';
import { useSubmissionState } from '../../hooks/useSubmissionState';
import { StepProgress } from './StepProgress';

interface StepNavigationProps {
  onSubmit?: () => void;
  onReset?: () => void;
}

export function StepNavigation({ onSubmit, onReset }: StepNavigationProps) {
  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    hasNextStep,
    hasPreviousStep,
  } = useStepNavigation();

  // Get submission state directly from React Query mutation cache
  // This eliminates prop drilling and makes the component autonomous
  const { isPending: isSubmitting } = useSubmissionState();

  // Get submission guard (combines form validation + company status validation)
  const { isBlocked } = useSubmissionGuard();

  const isLastStep = currentStep === 6;

  /**
   * Handle next step navigation without validation
   */
  const handleNext = useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  /**
   * Handle previous step navigation (no validation needed)
   */
  const handlePrevious = useCallback(() => {
    goToPreviousStep();
  }, [goToPreviousStep]);

  /**
   * Handle keyboard navigation
   * Ctrl/Cmd + Enter: Next step (if exists)
   * Ctrl/Cmd + Backspace: Previous step (if exists)
   *
   * Navigation is always free - these checks only prevent out-of-bounds navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl (Windows/Linux) or Cmd (Mac)
      const isModifierPressed = e.ctrlKey || e.metaKey;

      if (!isModifierPressed) {
        return;
      }

      // Ctrl/Cmd + Enter: Next step (only if next step exists)
      if (e.key === 'Enter' && hasNextStep) {
        e.preventDefault();
        handleNext();
      }

      // Ctrl/Cmd + Backspace: Previous step (only if previous step exists)
      if (e.key === 'Backspace' && hasPreviousStep) {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrevious, hasNextStep, hasPreviousStep]);

  // Define buttons once - reused in both mobile and desktop layouts
  // This eliminates duplication of button logic and ensures consistency

  const previousButton = (
    <Button
      type="button"
      variant="outline"
      onClick={handlePrevious}
      disabled={!hasPreviousStep || isSubmitting}
      className={cn(
        'cursor-pointer',
        currentStep === 1 && 'invisible',
        'flex-1 md:flex-none md:min-w-32', // Responsive width
        'dark:border-border dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground'
      )}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Wstecz
    </Button>
  );

  const nextSubmitButton = isLastStep ? (
    <Button
      type="submit"
      onClick={onSubmit}
      disabled={isSubmitting || isBlocked}
      className={cn(
        'cursor-pointer',
        'flex-1 md:flex-none md:min-w-32', // Responsive width
        'dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90'
      )}
    >
      {isSubmitting ? (
        <>
          <Spinner className="mr-2" />
          Wysyłanie...
        </>
      ) : (
        'Wyślij formularz'
      )}
    </Button>
  ) : (
    <Button
      type="button"
      onClick={handleNext}
      disabled={!hasNextStep || isSubmitting}
      className={cn(
        'cursor-pointer',
        'flex-1 md:flex-none md:min-w-32', // Responsive width
        'dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90'
      )}
    >
      Dalej
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-6 space-y-3">
        {/* Mobile: Stack vertically - progress on top, buttons below */}
        <div className="md:hidden space-y-4">
          <StepProgress onReset={onReset} />
          <div className="flex items-center justify-between gap-3">
            {previousButton}
            {nextSubmitButton}
          </div>
        </div>

        {/* Desktop: Horizontal layout - progress centered between buttons */}
        <div className="hidden md:flex items-center justify-center gap-6">
          {previousButton}
          <div className="w-96 lg:w-[32rem] xl:w-[40rem]">
            <StepProgress onReset={onReset} />
          </div>
          {nextSubmitButton}
        </div>
      </div>
    </div>
  );
}
