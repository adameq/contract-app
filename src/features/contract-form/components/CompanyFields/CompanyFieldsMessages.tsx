/**
 * Company Fields Messages Component
 *
 * Handles all message types (info, success, warning, error) for the unified CompanyFields component.
 * This component centralizes all the different message boxes that were scattered across the
 * original components.
 *
 * Owns the rendering of action buttons (edit/restore) based on state and available callbacks.
 *
 * Message resolution logic has been extracted to CompanyFieldsMessages.utils.ts for:
 * - Better testability
 * - Declarative approach
 * - Single source of truth
 */

import React from 'react';

import type { CompanyData } from '@/shared/api/types';
import { Button } from '@/shared/components/ui/button';

import { MESSAGE_ICONS, resolveMessage } from './CompanyFieldsMessages.utils';
import {
  buttonVariants,
  containerVariants,
  descriptionVariants,
  titleVariants,
} from './CompanyFieldsMessages.variants';
import type {
  CompanyFieldsMessages as MessagesType,
  CompanyFieldsState,
} from './types';

interface CompanyFieldsMessagesProps {
  /** Type of message to display */
  type: 'info' | 'success' | 'warning' | 'error';

  /** Current component state */
  state: CompanyFieldsState;

  /** NIP number for success messages */
  nip?: string;

  /** Callback when user requests to edit the data */
  onEditRequest?: () => void;

  /** Callback when user wants to restore original GUS data */
  onRestoreRequest?: () => void;

  /** Whether edit action is currently allowed */
  canEdit?: boolean;

  /** Whether restore action is currently allowed */
  canRestore?: boolean;

  /** Custom messages to override defaults */
  customMessages?: Partial<MessagesType>;

  /** Company API state (for status indicators and message formatting) */
  companyApiState?: CompanyData;
}

/**
 * CompanyFieldsMessages component
 *
 * This component is now purely presentational - all message resolution logic
 * has been extracted to resolveMessage() utility for better testability.
 *
 * Architecture:
 * - Callbacks are always passed (no conditional creation with useMemo)
 * - Boolean flags (canEdit, canRestore) control button enabled/disabled state
 * - Simpler, more explicit pattern than checking for undefined callbacks
 *
 * Performance:
 * - React.memo prevents re-renders when parent re-renders but props are unchanged
 * - Shallow comparison works for all props
 */
export const CompanyFieldsMessages = React.memo(function CompanyFieldsMessages({
  type,
  state,
  nip,
  onEditRequest,
  onRestoreRequest,
  canEdit = false,
  canRestore = false,
  customMessages = {},
  companyApiState,
}: CompanyFieldsMessagesProps) {
  // Declarative message resolution - single function call, no imperative logic
  const message = resolveMessage({
    state,
    type,
    nip,
    companyApiState,
    customMessages,
  });

  // Don't render if no message
  // The resolveMessage() function handles all display logic, including checking
  // for empty descriptions. This component only needs to check for null.
  if (!message) return null;

  // Declarative button configuration - prepare data upfront
  const shouldShowButton = !!message.actionLabel;
  const isButtonEnabled =
    (state === 'populated' && canEdit) || (state === 'edit-mode' && canRestore);

  const onClickHandler =
    state === 'populated' ? onEditRequest : onRestoreRequest;
  const actionLabel = message.actionLabel;

  // Get icon component (use message icon if provided, otherwise default for type)
  const IconComponent = message.icon ?? MESSAGE_ICONS[type];

  return (
    <div className={containerVariants({ messageType: type })}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <IconComponent
          className="w-5 h-5 mt-0.5 flex-shrink-0"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Title */}
          {message.title && (
            <p className={titleVariants({ messageType: type })}>
              {message.title}
            </p>
          )}

          {/* Description */}
          <p className={descriptionVariants({ messageType: type })}>
            {message.description}
          </p>

          {/* Action button - declarative rendering */}
          {shouldShowButton && (
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClickHandler}
                disabled={!isButtonEnabled}
                className={buttonVariants({ messageType: type })}
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CompanyFieldsMessages.displayName = 'CompanyFieldsMessages';
