/**
 * Centralized API error handling for GUS services
 *
 * This module provides a reusable error handler that encapsulates the error handling
 * logic for GUS API calls. It handles HttpError, NetworkError, AbortError, and
 * unexpected errors with consistent logging and re-throwing behavior.
 */

import { logger } from '@/shared/lib/logger';

import { HttpError, NetworkError } from './errors';

/**
 * Context for API error handling
 * Contains request metadata for logging purposes
 */
interface ApiErrorContext {
  /** Component/function name where error occurred */
  component: string;
  /** Full API endpoint URL */
  endpoint: string;
  /** HTTP method (POST, GET, etc.) */
  method: string;
  /** Request data for logging (will be sanitized by logger) */
  requestData: Record<string, unknown>;
}

/**
 * Handle API errors with consistent logging and re-throwing
 *
 * **DEFENSE-IN-DEPTH**: Logs ALL errors at API layer before re-throwing
 * This ensures errors are logged even if UI layer doesn't handle them properly.
 * Provides better debugging visibility and error correlation with API call logs.
 *
 * **Error handling flow:**
 * 1. HttpError → Log as error with status code → Re-throw for UI handling
 * 2. AbortError → Log as warning (intentional cancellation) → Re-throw for caller detection
 * 3. NetworkError → Log as error with connectivity details → Re-throw for UI handling
 * 4. Unexpected → Log as error with type info → Re-throw for UI handling
 *
 * @param error - The caught error (HttpError, NetworkError, DOMException, or unknown)
 * @param context - Request context for logging (component, endpoint, method, requestData)
 * @throws Always re-throws the error after logging
 *
 * @example
 * ```typescript
 * try {
 *   const response = await safeFetch(endpoint, options);
 *   // ... handle response
 * } catch (error) {
 *   handleApiError(error, {
 *     component: 'fetchCompanyByNip',
 *     endpoint: `${API_BASE_URL}/api/companies`,
 *     method: 'POST',
 *     requestData: { nip, userType },
 *   });
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  context: ApiErrorContext
): never {
  const { component, endpoint, method, requestData } = context;

  // Handle HttpError (expected API errors with status codes)
  if (error instanceof HttpError) {
    logger.error(`${method} ${endpoint} returned error response`, error, {
      component,
      endpoint,
      method,
      ...requestData,
      statusCode: error.status,
      errorType: 'HttpError',
    });
    throw error; // Re-throw for UI handling
  }

  // Handle abort error (user-initiated cancellation or timeout)
  if (error instanceof DOMException && error.name === 'AbortError') {
    // Log as warning - this might be intentional (user navigated away, component unmounted)
    logger.warn(`${method} ${endpoint} request aborted`, {
      component,
      endpoint,
      method,
      ...requestData,
      errorType: 'AbortError',
      reason: 'Request cancelled (user action, timeout, or component unmount)',
    });
    throw error; // Re-throw so caller can detect cancellation
  }

  // Handle NetworkError (connectivity issues, CORS, DNS failures, etc.)
  if (error instanceof NetworkError) {
    logger.error(`${method} ${endpoint} network error`, error, {
      component,
      endpoint,
      method,
      ...requestData,
      errorType: 'NetworkError',
      isAborted: error.isAborted(),
      isTimeout: error.isTimeout(),
    });
    throw error; // Re-throw for UI handling
  }

  // Handle unexpected errors (should not happen in normal operation)
  logger.error(
    `Unexpected error in ${method} ${endpoint} request`,
    error instanceof Error ? error : new Error(String(error)),
    {
      component,
      endpoint,
      method,
      ...requestData,
      errorType: error?.constructor?.name ?? typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
    }
  );

  throw error; // Re-throw for UI handling
}
