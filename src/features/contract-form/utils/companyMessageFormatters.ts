/**
 * Company Message Formatters
 *
 * Pure utility functions for formatting company-related messages.
 * Extracted from CompanyFieldsMessages component to maintain separation
 * of concerns - business logic separated from presentation.
 *
 * Benefits:
 * - Testable in isolation (no component rendering required)
 * - Reusable across multiple components
 * - Clear business logic documentation
 * - Type-safe with proper TypeScript interfaces
 */

import type { CompanyData } from '@/shared/api/types';
import { formatStatusDisplay } from '@/shared/constants/companyStatus';

/**
 * Status indicator with icon and text representation
 */
interface StatusIndicator {
  icon: string;
  text: string;
}

/**
 * Get status indicator based on company status
 *
 * Uses the centralized status mapping from companyStatus constants.
 *
 * @param status - Company status from API (AKTYWNY, WYKRESLONY, etc.)
 * @returns Status indicator with icon and text
 *
 * @example
 * getStatusIndicator('AKTYWNY')  // { icon: '🟢', text: 'Aktywna' }
 * getStatusIndicator('WYKRESLONY') // { icon: '🔴', text: 'Wykreślona z rejestru' }
 * getStatusIndicator('ZAWIESZONY') // { icon: '🟡', text: 'Działalność zawieszona' }
 */
export function getStatusIndicator(
  status: CompanyData['status']
): StatusIndicator {
  const formatted = formatStatusDisplay(status);
  return {
    icon: formatted.icon,
    text: formatted.text,
  };
}

/**
 * Format company source description based on data source and status
 *
 * Creates a detailed description message showing:
 * - Which registry the data came from (CEIDG, KRS, or GUS)
 * - NIP number
 * - Company activity status with visual indicator
 * - Additional warnings for GUS-only data
 *
 * @param companyData - Company data including source and status
 * @param nip - Company NIP number
 * @returns Formatted description string ready for display
 *
 * @example
 * // CEIDG data
 * formatCompanySourceDescription(
 *   { source: 'CEIDG', isActive: true, ... },
 *   '1234567890'
 * )
 * // Returns: "Znaleziono i wypełniono dane z rejestru CEIDG dla NIP 1234567890. Status firmy: 🟢 AKTYWNA"
 *
 * @example
 * // GUS fallback data
 * formatCompanySourceDescription(
 *   { source: 'GUS', isActive: false, ... },
 *   '9876543210'
 * )
 * // Returns: "Znaleziono i wypełniono dane z rejestru GUS dla NIP 9876543210. Status podmiotu: 🔴 NIEAKTYWNA. ⚠️ Podmiot nie jest wpisany do CEIDG ani KRS"
 */
export function formatCompanySourceDescription(
  companyData: CompanyData,
  nip: string
): string {
  // Get status indicator with proper status display
  const { icon: statusIcon, text: statusText } = getStatusIndicator(
    companyData.status
  );

  // Determine source (with fallback for legacy data)
  const source = companyData.source ?? 'GUS';

  // Build description based on data source
  switch (source) {
    case 'CEIDG':
      return `Znaleziono i wypełniono dane z rejestru CEIDG dla NIP ${nip}. Status firmy: ${statusIcon} ${statusText}`;

    case 'KRS':
      return `Znaleziono i wypełniono dane z rejestru KRS dla NIP ${nip}. Status firmy: ${statusIcon} ${statusText}`;

    case 'GUS':
      return `Znaleziono i wypełniono dane z rejestru GUS dla NIP ${nip}. Status podmiotu: ${statusIcon} ${statusText}. ⚠️ Podmiot nie jest wpisany do CEIDG ani KRS`;

    default:
      // Fallback for unknown sources (should never happen with proper typing)
      return `Znaleziono i wypełniono dane dla NIP ${nip}. Status: ${statusIcon} ${statusText}`;
  }
}
