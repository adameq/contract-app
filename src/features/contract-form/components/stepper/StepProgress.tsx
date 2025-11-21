/**
 * Step Progress Component
 *
 * Pure UI component that displays a progress bar showing completion percentage
 * based on filled required fields (not steps). All application state management
 * (form reset, cache clearing, etc.) is handled by the parent component via the
 * onReset callback.
 *
 * ARCHITECTURE CHANGE (October 2024):
 * - BEFORE: Progress based on current step (step X of 6)
 * - AFTER: Progress based on filled required fields (dynamic per user type)
 * - Uses useFormCompletion hook to calculate completion percentage
 *
 * SEPARATION OF CONCERNS:
 * - This component: UI rendering (progress bar, button, dialog)
 * - Parent component: Application state management (via useFormReset hook)
 * - useFormCompletion hook: Field completion logic
 */

import { RotateCcw } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';

import { useFormCompletion } from '../../hooks/v2/useFormCompletion';

interface StepProgressProps {
  /** Callback to reset the entire form - provided by parent component */
  onReset?: () => void;
}

export function StepProgress({ onReset }: StepProgressProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Get form completion based on filled required fields
  const { completedCount, totalCount, percentage } = useFormCompletion();

  // Simplified reset handler - delegates to parent via callback
  const handleReset = () => {
    onReset?.();
    setShowResetDialog(false);
  };

  return (
    <>
      <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Reset button */}
          <div className="flex justify-center mb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="cursor-pointer text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground transition-colors"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Resetuj formularz
            </Button>
          </div>

          <div className="space-y-2">
            {/* Progress bar */}
            <Progress value={percentage} className="h-2" />

            {/* Field completion counter */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedCount} z {totalCount} pól wypełnionych
              </span>
              <span className="font-medium text-foreground">
                {percentage}% ukończono
              </span>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Czy na pewno chcesz zresetować formularz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja usunie wszystkie wprowadzone dane i nie można jej cofnąć.
              Zostaniesz przekierowany do pierwszego kroku formularza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer dark:border-border dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground">
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors"
            >
              Resetuj formularz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
