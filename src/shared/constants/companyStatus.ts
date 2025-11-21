/**
 * Company Status Constants and Utilities
 *
 * Comprehensive handling of company statuses from Polish business registries.
 * Provides status classification, display names, and user-facing messages.
 */

import type { CeidgStatus } from '@/shared/api/types';

/**
 * Status classification for business logic
 */
export type CompanyStatusCategory =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended';

/**
 * Polish display names for company statuses
 */
export const COMPANY_STATUS_DISPLAY: Record<CeidgStatus, string> = {
  AKTYWNY: 'Aktywna',
  WYKRESLONY: 'Wykreślona z rejestru',
  ZAWIESZONY: 'Działalność zawieszona',
  OCZEKUJE_NA_ROZPOCZECIE_DZIALANOSCI: 'Oczekuje na rozpoczęcie działalności',
  WYLACZNIE_W_FORMIE_SPOLKI: 'Wyłącznie w formie spółki',
} as const;

/**
 * Status category mapping for business logic
 */
export const COMPANY_STATUS_CATEGORY: Record<
  CeidgStatus,
  CompanyStatusCategory
> = {
  AKTYWNY: 'active',
  WYKRESLONY: 'inactive',
  ZAWIESZONY: 'suspended',
  OCZEKUJE_NA_ROZPOCZECIE_DZIALANOSCI: 'pending',
  WYLACZNIE_W_FORMIE_SPOLKI: 'inactive',
} as const;

/**
 * Status icons for visual representation
 * 🟢 Green only for active companies
 * 🔴 Red for all non-active statuses
 */
export const COMPANY_STATUS_ICON: Record<CompanyStatusCategory, string> = {
  active: '🟢',
  inactive: '🔴',
  suspended: '🔴',
  pending: '🔴',
} as const;

/**
 * Detailed error messages for inactive company statuses
 * Used in CompanyFields error state
 */
export const COMPANY_STATUS_ERROR_MESSAGES: Record<
  Exclude<CompanyStatusCategory, 'active'>,
  {
    title: string;
    description: string;
  }
> = {
  inactive: {
    title: 'Firma została wykreślona z rejestru',
    description:
      'Nie można złożyć umowy dla firmy, która została wykreślona z CEIDG lub KRS. Prosimy sprawdzić aktualny status firmy lub użyć innych danych kontaktowych.',
  },
  suspended: {
    title: 'Działalność gospodarcza jest zawieszona',
    description:
      'Firma ma zawieszoną działalność gospodarczą. Nie można złożyć umowy dla podmiotu z zawieszonym statusem. Prosimy o wznowienie działalności lub kontakt z naszym biurem.',
  },
  pending: {
    title: 'Firma oczekuje na rozpoczęcie działalności',
    description:
      'Firma jest zarejestrowana, ale jeszcze nie rozpoczęła działalności gospodarczej. Nie można złożyć umowy dla podmiotu, który nie prowadzi aktywnej działalności.',
  },
} as const;

/**
 * Get status category for a given status
 */
export function getCompanyStatusCategory(
  status: CeidgStatus
): CompanyStatusCategory {
  return COMPANY_STATUS_CATEGORY[status];
}

/**
 * Get display name for a status
 */
export function getCompanyStatusDisplay(status: CeidgStatus): string {
  return COMPANY_STATUS_DISPLAY[status];
}

/**
 * Get icon for a status category
 */
export function getCompanyStatusIcon(category: CompanyStatusCategory): string {
  return COMPANY_STATUS_ICON[category];
}

/**
 * Check if status allows contract signing
 */
export function isStatusActive(status: CeidgStatus): boolean {
  return COMPANY_STATUS_CATEGORY[status] === 'active';
}

/**
 * Get error message for non-active status
 */
export function getStatusErrorMessage(
  status: CeidgStatus
): { title: string; description: string } | null {
  const category = COMPANY_STATUS_CATEGORY[status];
  if (category === 'active') return null;
  return COMPANY_STATUS_ERROR_MESSAGES[category];
}

/**
 * Format status for display with icon and text
 */
export function formatStatusDisplay(status: CeidgStatus): {
  icon: string;
  text: string;
  category: CompanyStatusCategory;
} {
  const category = getCompanyStatusCategory(status);
  return {
    icon: getCompanyStatusIcon(category),
    text: getCompanyStatusDisplay(status),
    category,
  };
}
