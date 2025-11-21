/**
 * Stepper Component
 *
 * Visual step indicator showing progress through the form steps
 */

import { Check } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';

import { useStepNavigation } from '../../hooks/useStepNavigation';
import { getAllSteps, type StepConfig } from '../../utils/pageConfig';

interface StepBadgeProps {
  step: StepConfig;
  status: 'completed' | 'current' | 'upcoming';
  onClick?: () => void;
  isClickable: boolean;
}

function StepBadge({ step, status, onClick, isClickable }: StepBadgeProps) {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isUpcoming = status === 'upcoming';

  // Completed steps get filled background, current/upcoming get outline only
  const badgeVariant = isCompleted ? 'default' : 'outline';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={isClickable ? onClick : undefined}
            disabled={!isClickable}
            className={cn(
              'rounded-full transition-all',
              isClickable && 'cursor-pointer hover:scale-110',
              !isClickable && 'cursor-default'
            )}
            aria-label={`${step.label} - ${status === 'completed' ? 'ukończono' : status === 'current' ? 'aktywny' : 'oczekujący'}`}
          >
            <Badge
              variant={badgeVariant}
              className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold',
                isCurrent && 'ring-2 ring-primary ring-offset-2',
                isUpcoming && 'opacity-50'
              )}
            >
              {isCompleted ? <Check className="h-5 w-5" /> : step.id}
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-input/30 dark:bg-input/30">
          <div className="text-center text-foreground">
            <p className="font-semibold">{step.label}</p>
            <p className="text-xs">{step.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Stepper() {
  const { currentStep, goToStep } = useStepNavigation();

  // All steps are always active (no conditional steps)
  // Step 5 contains UserTypeSection so must be shown to all users
  const activeSteps = getAllSteps();

  return (
    <div className="w-full bg-background hidden md:block">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
        <nav aria-label="Form progress" className="w-full">
          {/* Desktop: Horizontal stepper */}
          <ol className="flex items-center justify-between">
            {activeSteps.map((step, idx) => {
              // Determine step status based on position relative to currentStep
              // This provides intuitive visual feedback with free navigation:
              // - All steps BEFORE current are shown as completed
              // - Current step is highlighted
              // - All steps AFTER current are shown as upcoming
              const completed = step.id < currentStep;
              const current = step.id === currentStep;
              const status = completed
                ? 'completed'
                : current
                  ? 'current'
                  : 'upcoming';

              // All steps are clickable - free navigation enabled
              const isClickable = true;

              // Separator is highlighted if the step AFTER it has been visited
              const nextStep = activeSteps[idx + 1];
              const isNextStepVisitedOrCurrent =
                nextStep && nextStep.id <= currentStep;

              return (
                <li
                  key={step.id}
                  className={cn(
                    'flex items-center',
                    idx < activeSteps.length - 1 ? 'flex-1' : 'flex-none'
                  )}
                >
                  {/* Step Badge */}
                  <StepBadge
                    step={step}
                    status={status}
                    onClick={() => {
                      goToStep(step.id);
                    }}
                    isClickable={isClickable}
                  />

                  {/* Separator line (except for last step) */}
                  {idx < activeSteps.length - 1 && (
                    <Separator
                      className={cn(
                        'flex-1 mx-3 h-[2px]',
                        isNextStepVisitedOrCurrent && 'bg-primary'
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
