/**
 * UI Component Types
 *
 * This file contains types that are specific to UI components and props,
 * separate from the data model types which are defined in schema.ts.
 *
 * ARCHITECTURAL DECISION:
 * - All data model types (ContractFormData, UserType, etc.) live in schema.ts
 * - All UI-specific types (component props, options, variants) live here
 * - This separation prevents circular dependencies and maintains clear boundaries
 */

import type {
  CompanyDataForUserType,
  SignatureMethod,
  UserType,
} from './schema';

// ============================================================================
// UI COMPONENT INTERFACES
// ============================================================================

/**
 * Common props for tax-related components
 */
export interface TaxDataProps {
  className?: string;
}

/**
 * Signature method option for UI display
 */
export interface SignatureOption {
  id: SignatureMethod;
  title: string;
  subtitle: string;
  description: string;
  warning?: string;
  infoType?: 'warning' | 'info';
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?:
    | 'default'
    | 'secondary'
    | 'green'
    | 'blue'
    | 'purple'
    | 'orange'
    | 'amber';
  requiresModal?: boolean;
}

/**
 * User type option for UI display
 */
export interface UserTypeOption {
  id: UserType;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?:
    | 'default'
    | 'secondary'
    | 'green'
    | 'blue'
    | 'purple'
    | 'orange'
    | 'amber';
}

/**
 * Extended interface for cleanup configuration - type-safe with generics
 *
 * Used by UserTypeSection to manage data cleanup when switching user types
 */
export interface UserTypeOptionWithCleanup<T extends UserType = UserType>
  extends UserTypeOption {
  id: T; // Narrow the id to specific UserType
  /**
   * Type-safe cleanup function that returns default company data for this user type.
   * Always resets to defaults when switching TO this user type for predictable behavior.
   *
   * @returns The default company data for this specific user type
   */
  cleanupFn: () => CompanyDataForUserType<T>;
}
