/**
 * API Error Messages
 *
 * Centralized mapping of backend API error codes to user-friendly Polish messages.
 * This allows the backend to return standardized error codes while the frontend
 * handles localization and user-friendly messaging.
 */

/**
 * API error codes and their corresponding user-friendly messages in Polish
 */
export const API_ERROR_MESSAGES = {
  // CEIDG API errors
  CEIDG_TOKEN_INVALID:
    'Nie można pobrać danych z rejestru CEIDG. Skontaktuj się z administratorem systemu w celu aktualizacji tokenów dostępu.',
  CEIDG_TIMEOUT:
    'Przekroczono czas oczekiwania na odpowiedź z rejestru CEIDG. Spróbuj ponownie za chwilę.',
  CEIDG_ERROR:
    'Błąd podczas pobierania danych z rejestru CEIDG. Spróbuj ponownie.',
  CEIDG_MAPPING_ERROR: 'Błąd podczas przetwarzania danych z rejestru CEIDG.',

  // Company data orchestration errors
  ENTITY_DEREGISTERED_FROM_REGON:
    'Firma z podanym NIP została wykreślona z rejestru REGON i prosimy o sprawdzenie i wprowadzenie ponownie poprawnego numeru NIP.',

  // GUS API errors
  GUS_ERROR: 'Błąd podczas pobierania danych z rejestru GUS. Spróbuj ponownie.',
  GUS_GENERIC_ORCHESTRATION_ERROR:
    'Błąd podczas pobierania danych z rejestru GUS.',
  GUS_REPORT_ERROR:
    'Błąd podczas pobierania szczegółowych danych z rejestru GUS.',

  // KRS API errors
  KRS_API_ERROR:
    'Błąd podczas pobierania danych z rejestru KRS. Spróbuj ponownie.',
  KRS_ORCHESTRATION_ERROR: 'Błąd podczas pobierania danych z rejestru KRS.',
  KRS_NUMBER_NOT_FOUND: 'Nie znaleziono numeru KRS w danych GUS.',

  // Generic orchestration errors
  ORCHESTRATION_ERROR:
    'Błąd podczas pobierania danych firmy. Spróbuj ponownie.',

  // Generic API errors
  NOT_FOUND: 'Nie znaleziono firmy o podanym numerze NIP.',
  TIMEOUT:
    'Przekroczono czas oczekiwania na odpowiedź. Spróbuj ponownie za chwilę.',
  API_ERROR: 'Błąd serwera. Spróbuj ponownie za chwilę.',
  RATE_LIMIT_EXCEEDED: 'Zbyt wiele zapytań. Spróbuj ponownie za chwilę.',

  // Validation errors
  MISSING_PARAMETER: 'Brakuje wymaganych parametrów.',
  INVALID_INPUT: 'Nieprawidłowe dane wejściowe.',

  // Network and server errors
  NETWORK_ERROR: 'Błąd połączenia sieciowego. Sprawdź połączenie z internetem.',
  INTERNAL_ERROR: 'Wewnętrzny błąd serwera. Spróbuj ponownie za chwilę.',
  SERVICE_UNAVAILABLE:
    'Usługa tymczasowo niedostępna. Spróbuj ponownie za chwilę.',
} as const;

/**
 * HTTP status code specific messages for cases where no error code is provided
 */
export const HTTP_STATUS_MESSAGES = {
  400: 'Nieprawidłowe żądanie. Sprawdź wprowadzone dane.',
  401: 'Brak uprawnień do wykonania tej operacji.',
  403: 'Brak dostępu do żądanych danych.',
  404: 'Nie znaleziono żądanych danych.',
  408: 'Przekroczono czas oczekiwania na odpowiedź.',
  409: 'Konflikt danych. Spróbuj ponownie.',
  429: 'Zbyt wiele zapytań. Spróbuj ponownie za chwilę.',
  500: 'Wewnętrzny błąd serwera. Spróbuj ponownie za chwilę.',
  502: 'Błąd bramy. Usługa tymczasowo niedostępna.',
  503: 'Usługa tymczasowo niedostępna. Spróbuj ponownie za chwilę.',
  504: 'Przekroczono czas oczekiwania na odpowiedź serwera.',
} as const;

/**
 * Get user-friendly error message for an API error code
 * @param errorCode - The error code from the API
 * @param fallbackMessage - Optional fallback message if code is not found
 * @returns Polish user-friendly error message
 */
export function getApiErrorMessage(
  errorCode: string,
  fallbackMessage?: string
): string {
  const message =
    API_ERROR_MESSAGES[errorCode as keyof typeof API_ERROR_MESSAGES];

  if (message) {
    return message;
  }

  return fallbackMessage ?? 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
}

/**
 * Get user-friendly error message for an HTTP status code
 * @param statusCode - The HTTP status code
 * @param fallbackMessage - Optional fallback message if status is not found
 * @returns Polish user-friendly error message
 */
export function getHttpStatusMessage(
  statusCode: number,
  fallbackMessage?: string
): string {
  const message =
    HTTP_STATUS_MESSAGES[statusCode as keyof typeof HTTP_STATUS_MESSAGES];

  if (message) {
    return message;
  }

  return fallbackMessage ?? 'Wystąpił błąd podczas przetwarzania żądania.';
}

/**
 * Get error message from API response
 * Tries to extract error code first, then falls back to HTTP status
 * @param response - Response object with potential error data
 * @param statusCode - HTTP status code
 * @returns Polish user-friendly error message
 */
export function getErrorMessageFromResponse(
  response: { error?: { code?: string; message?: string } } | null,
  statusCode: number
): string {
  // Try to get message from error code first
  if (response?.error?.code) {
    const codeMessage = getApiErrorMessage(response.error.code);
    if (codeMessage !== 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.') {
      return codeMessage;
    }
  }

  // Fallback to HTTP status code message
  return getHttpStatusMessage(statusCode, response?.error?.message);
}

/**
 * Type definitions for error codes
 */
export type ApiErrorCode = keyof typeof API_ERROR_MESSAGES;
export type HttpStatusCode = keyof typeof HTTP_STATUS_MESSAGES;
