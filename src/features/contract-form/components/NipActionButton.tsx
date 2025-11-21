/**
 * NipActionButton Component
 *
 * Trigger button component that calls the onAction callback when clicked.
 * This component does NOT perform data fetching itself.
 *
 * The actual data fetching logic resides in the parent TaxDataSection component.
 *
 * PERFORMANCE STRATEGY:
 * - Receives validation state as props (no useWatch)
 * - Only parent TaxDataSection watches NIP field (single subscription)
 * - Only re-renders when props change (nipIsValid, isLoading)
 * - Button rendering is lightweight (simple JSX, no expensive operations)
 * - React.memo prevents re-renders when parent re-renders but props are unchanged
 *
 * Re-render triggers:
 * - nipIsValid prop changes (validation state changes) - expected
 * - isLoading prop changes (fetch start/end) - expected
 * - Parent re-renders for other reasons - prevented by React.memo
 */

import { Search } from 'lucide-react';
import React from 'react';

import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/ui/spinner';
import { cn } from '@/shared/lib/utils';

import type { UserType } from '../schema/sharedSchema';

interface NipActionButtonProps {
  /** User type to determine fetch capabilities and button text */
  userType: UserType;
  /** Whether NIP is valid (no validation errors) */
  nipIsValid: boolean;
  /** Whether data is currently being fetched */
  isLoading: boolean;
  /** Callback when action button is clicked - triggers data fetching in parent (can be async) */
  onAction: () => void | Promise<void>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Action button component that receives NIP validation state as props
 *
 * This component receives the validation state from the parent
 * TaxDataSection component. By receiving props instead of using useWatch,
 * we prevent double subscription on the same field.
 *
 * The button acts as a trigger - it calls the onAction callback which
 * contains the actual data fetching logic in the parent component.
 *
 * @example
 * ```tsx
 * <NipActionButton
 *   userType="company"
 *   nipIsValid={nipIsValid}
 *   isLoading={isLoading}
 *   onAction={handleFetchData}
 * />
 * ```
 */
export const NipActionButton = React.memo(function NipActionButton({
  userType,
  nipIsValid,
  isLoading,
  onAction,
  className,
}: NipActionButtonProps) {
  // Only render button for company userType
  if (userType !== 'company') {
    return null;
  }

  // Determine if we can fetch based on NIP validity
  const canFetch = nipIsValid;

  const buttonText = 'Pobierz dane firmy';
  const loadingText = 'Pobieranie danych...';

  return (
    <Button
      type="button"
      onClick={() => void onAction()}
      disabled={!canFetch || isLoading}
      className={cn(
        'flex items-center justify-center gap-2 whitespace-nowrap',
        className
      )}
    >
      {isLoading ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        <>
          <Search className="h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
});

/**
 * Performance characteristics:
 * - Re-renders when nipIsValid changes (validation state)
 * - Re-renders when isLoading changes (fetch state)
 * - Does NOT re-render when parent re-renders for unrelated reasons
 *
 * ✅ PERFORMANCE OPTIMIZATION STRATEGY:
 * - No useWatch subscription (receives state via props)
 * - Parent TaxDataSection has single subscription on NIP field
 * - Eliminates double subscription on the same field
 * - Button rendering is cheap: simple JSX with conditional icon/text
 * - React.memo prevents unnecessary re-renders when onAction callback is stable (useCallback in parent)
 *
 * ✅ WHY React.memo:
 * - Parent (TaxDataSection) uses useCallback for onAction - callback is stable
 * - Memo prevents re-renders when parent re-renders but props haven't changed
 * - Shallow comparison is cheap for primitive props (userType, nipIsValid, isLoading)
 * - Reduces unnecessary renders when other parts of parent state change
 */

NipActionButton.displayName = 'NipActionButton';
