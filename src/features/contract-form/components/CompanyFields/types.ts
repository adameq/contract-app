/**
 * Unified Company Fields Types
 *
 * This module defines the comprehensive type system for the unified CompanyFields component
 * that replaces all duplicate company field components (CompanyFieldsDisabled, CompanySection,
 * CompanyFieldsEditable, CompanyFieldsDisabledWithData).
 */

import type { LucideIcon } from 'lucide-react';

import type { CompanyData } from '@/shared/api/types';

import type { CompanyFormData } from '../../schema/companySchemas';

/**
 * Available states for the CompanyFields component
 * Each state determines the visual appearance and behavior of the fields
 */
export type CompanyFieldsState =
  | 'disabled' // Fields disabled with info message (before valid NIP)
  | 'loading' // Loading state with skeleton components
  | 'active' // Active/editable fields with real-time validation
  | 'populated' // Fields populated with GUS data, disabled by default
  | 'edit-mode' // Fields in manual edit mode with warnings
  | 'error'; // Error state for failed API calls or deregistered entities

/**
 * Configuration for each state - defines behavior and styling
 */
export interface StateConfig {
  /** Whether fields should be disabled */
  readonly: boolean;
  /** Whether to show validation feedback */
  showValidation: boolean;
  /** Whether data can be cleared/restored */
  allowDataActions: boolean;
  /** CSS class for field styling */
  fieldClassName?: string;
  /** Custom message type to display */
  messageType?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Messages that can be displayed in different states
 *
 * Icons use lucide-react components for consistent styling and accessibility.
 * This replaces the previous emoji-based approach with proper icon components.
 */
export interface CompanyFieldsMessages {
  /** Info message for disabled state */
  info?: {
    title: string;
    description: string;
    icon?: LucideIcon;
  };
  /** Success message for populated state */
  success?: {
    title: string;
    description: string;
    icon?: LucideIcon;
    actionLabel?: string;
  };
  /** Warning message for edit mode */
  warning?: {
    title: string;
    description: string;
    icon?: LucideIcon;
    actionLabel?: string;
  };
  /** Error message for failed states */
  error?: {
    title: string;
    description: string;
    icon?: LucideIcon;
    actionLabel?: string;
  };
}

/**
 * Main props interface for the unified CompanyFields component
 */
export interface CompanyFieldsProps {
  /** Current state determining component behavior */
  state: CompanyFieldsState;

  /** NIP number for success messages and data context */
  nip?: string;

  /** Callback when user requests to edit the data */
  onEditRequest?: () => void;

  /** Callback when user wants to restore original GUS data */
  onRestoreRequest?: () => void;

  /** Whether edit action is currently allowed */
  canEdit?: boolean;

  /** Whether restore action is currently allowed */
  canRestore?: boolean;

  /** Custom CSS class name */
  className?: string;

  /** Whether to show info messages (default: true) */
  showMessages?: boolean;

  /** Override default messages for specific states */
  customMessages?: Partial<CompanyFieldsMessages>;

  /** Section title override */
  title?: string;

  /** Section subtitle override */
  subtitle?: string;

  /**
   * Company API state (for status indicators and messages only)
   *
   * Contains metadata from the API response (status, source, etc.) used to:
   * - Display company status indicators (active/suspended/deregistered)
   * - Format data source descriptions in success messages
   * - Determine appropriate error messages
   *
   * Note: This is NOT used as the primary data source for field values.
   * The component always reads from React Hook Form state via useWatch
   * to ensure consistency across all states and avoid dual source of truth.
   */
  companyApiState?: CompanyData;
}

/**
 * Internal state for the CompanyFields component
 */
export interface CompanyFieldsInternalState {
  /** Whether component is currently in edit mode */
  isEditMode: boolean;

  /** Whether to show help text */
  showHelpText: boolean;
}

/**
 * Field definition for consistent field rendering
 *
 * **Architecture Change:**
 * - BEFORE: Used ContractFormData['company'] (discriminated union)
 * - AFTER: Uses CompanyFormData directly (modular schema)
 * - REASON: Separate FormProviders architecture with isolated company data
 */
export interface CompanyFieldDefinition {
  /** Field name in the form */
  name: keyof CompanyFormData;

  /** Field label */
  label: string;

  /** Field description/help text */
  description: string;

  /** Whether field is required */
  required: boolean;

  /** Field type for rendering appropriate input */
  type: 'text' | 'business-number' | 'address';

  /** For business-number type, specify which kind */
  businessType?: 'regon' | 'krs';

  /** Placeholder text */
  placeholder?: string;

  /** Field-specific CSS classes */
  className?: string;
}

/**
 * Address fields configuration
 *
 * **Architecture Change:**
 * - BEFORE: namePrefix was 'company.address' (nested in discriminated union)
 * - AFTER: namePrefix is 'address' (flat CompanyFormData structure)
 * - REASON: Separate FormProviders - CompanyFields operates in CompanyFormData context
 */
export interface AddressFieldsConfig {
  /** Prefix for address field names (relative to CompanyFormData) */
  namePrefix: 'address';

  /** Whether address fields are disabled */
  disabled: boolean;

  /** CSS class for address fields container */
  className?: string;

  /** Title for address section */
  title?: string;

  /** Subtitle for address section */
  subtitle?: string;
}

/**
 * Type guard to check if state requires GUS data
 */
export const requiresCompanyData = (state: CompanyFieldsState): boolean => {
  return state === 'populated' || state === 'edit-mode';
};

/**
 * Type guard to check if state allows editing
 */
export const allowsEditing = (state: CompanyFieldsState): boolean => {
  return state === 'active' || state === 'edit-mode';
};

/**
 * Type guard to check if state shows loading
 */
export const isLoadingState = (state: CompanyFieldsState): boolean => {
  return state === 'loading';
};

/**
 * Determines the appropriate CompanyFields state based on query and edit status
 *
 * @param isLoading - Whether data is currently being fetched
 * @param hasData - Whether company data is available
 * @param isEditMode - Whether component is in manual edit mode
 * @param isActive - Whether company is active (optional, defaults to true for backward compatibility)
 * @returns The appropriate CompanyFieldsState
 */
export function getCompanyFieldsState(
  isLoading: boolean,
  hasData: boolean,
  isEditMode: boolean,
  isActive = true
): CompanyFieldsState {
  if (isLoading) return 'loading';
  if (!hasData) return 'disabled';
  // Check if company is inactive - show error state
  if (hasData && !isActive) return 'error';
  return isEditMode ? 'edit-mode' : 'populated';
}

/**
 * State configuration mapping
 */
export const STATE_CONFIG: Record<CompanyFieldsState, StateConfig> = {
  disabled: {
    readonly: true,
    showValidation: false,
    allowDataActions: false,
    fieldClassName:
      'bg-muted/30 text-muted-foreground cursor-not-allowed border-dashed border-muted-foreground/20',
    messageType: 'info',
  },
  loading: {
    readonly: true,
    showValidation: false,
    allowDataActions: false,
  },
  active: {
    readonly: false,
    showValidation: true,
    allowDataActions: false,
  },
  populated: {
    readonly: true,
    showValidation: false,
    allowDataActions: true,
    fieldClassName:
      'bg-green-50/30 text-foreground cursor-not-allowed border-green-200/50',
    messageType: 'success',
  },
  'edit-mode': {
    readonly: false,
    showValidation: true,
    allowDataActions: true,
    messageType: 'warning',
  },
  error: {
    readonly: true,
    showValidation: false,
    allowDataActions: false,
    fieldClassName:
      'bg-red-50/30 text-muted-foreground cursor-not-allowed border-red-200/50',
    messageType: 'error',
  },
} as const;
