/**
 * Informational messages for contract form components
 *
 * Centralized message constants to enable easy maintenance and future i18n support.
 * All user-facing informational text should be defined here rather than hardcoded in components.
 */

/**
 * Informational message displayed when company data is successfully fetched from GUS registry
 *
 * Context: Shown in display-only mode after successful GUS API lookup
 * Location: CompanyFields component (below company data display)
 */
export const GUS_DATA_INFO_MESSAGE =
  'Powyższe dane zostały pobrane z oficjalnego rejestru GUS i są gotowe do przesłania wraz z formularzem. W przypadku jakichkolwiek rozbieżności prosimy o kontakt z obsługą.';
