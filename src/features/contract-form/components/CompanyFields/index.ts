/**
 * Unified Company Fields Module
 *
 * This module exports the unified CompanyFields component that replaces
 * all the duplicate company field components:
 * - CompanyFieldsDisabled
 * - CompanySection
 * - CompanyFieldsEditable
 * - CompanyFieldsDisabledWithData
 *
 * By importing from this module, you get access to a single, consistent
 * component that handles all company field states while eliminating
 * code duplication.
 */

// Main component
export { CompanyFields } from './CompanyFields';

// Types
export type {
  AddressFieldsConfig,
  CompanyFieldDefinition,
  CompanyFieldsMessages,
  CompanyFieldsProps,
  CompanyFieldsState,
  StateConfig,
} from './types';

// Utility functions
export {
  allowsEditing,
  isLoadingState,
  requiresCompanyData,
  STATE_CONFIG,
} from './types';

// Message component (for advanced use cases)
export { CompanyFieldsMessages } from './CompanyFieldsMessages';

// Field renderer component (for custom field rendering)
export type { FieldRendererProps } from './FieldRenderer';
export { FieldRenderer } from './FieldRenderer';
