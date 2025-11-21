/**
 * Pipedrive API service for validating Person ID
 *
 * Security architecture:
 * - All validation happens server-side via Cloudflare Function
 * - Pipedrive API token never exposed to client
 * - Multi-layer validation: PID + custom field + creation date
 */

import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import {
  CONTENT_TYPE,
  HTTP_HEADER,
  HTTP_METHOD,
} from '@/shared/constants/httpConfig';
import { safeFetch } from '@/shared/lib/fetch';
import { logApiCall, logApiResponse } from '@/shared/lib/logger';

import { HttpError, HttpStatus } from './errors';
import type {
  ValidatePidRequest,
  ValidatePidResponse,
} from './pipedrive.types';

/**
 * Validate Pipedrive Person ID with multi-layer security
 *
 * Security layers:
 * 1. PID must exist in Pipedrive
 * 2. Custom field must have specific value (form generation permission)
 * 3. Creation date must match exactly (prevents PID guessing)
 *
 * This function calls our own Cloudflare Function endpoint which:
 * - Validates against Pipedrive API server-side
 * - Never exposes API token to client
 * - Returns minimal data needed for form submission
 *
 * @param request - Validation request with PID, option, and creation date
 * @param signal - AbortSignal for request cancellation
 * @returns Promise with validation result and optional person data
 * @throws {HttpError} When validation fails or API request fails
 * @throws {NetworkError} When network/connectivity issues occur
 * @throws {DOMException} When request is aborted (AbortError)
 */
export async function validatePid(
  request: ValidatePidRequest,
  signal?: AbortSignal
): Promise<ValidatePidResponse> {
  try {
    const endpoint = API_ENDPOINTS.VALIDATE_PID;

    logApiCall(HTTP_METHOD.POST, endpoint, {
      pid: request.pid,
      option: request.option,
      created: request.created,
    });

    const response = await safeFetch(endpoint, {
      method: HTTP_METHOD.POST,
      headers: {
        [HTTP_HEADER.CONTENT_TYPE]: CONTENT_TYPE.JSON,
      },
      body: JSON.stringify(request),
      signal,
    });

    logApiResponse(HTTP_METHOD.POST, endpoint, response.status, {
      pid: request.pid,
    });

    if (!response.ok) {
      const errorData = (await response
        .json()
        .catch(() => ({}))) as ValidatePidResponse;

      // Get error message from response or use generic message
      const errorMessage =
        errorData.error || getErrorMessageByStatus(response.status);

      if (response.status === 400) {
        // 400 - Invalid request parameters
        throw new HttpError(errorMessage, HttpStatus.BAD_REQUEST);
      }

      if (response.status === 403) {
        // 403 - PID validation failed (wrong field value or date mismatch)
        throw new HttpError(errorMessage, HttpStatus.FORBIDDEN);
      }

      if (response.status === 404) {
        // 404 - Person not found in Pipedrive
        throw new HttpError(errorMessage, HttpStatus.NOT_FOUND);
      }

      if (response.status === 429) {
        // 429 - Rate limit exceeded
        throw new HttpError(
          'Zbyt wiele próб walidacji. Spróbuj ponownie za chwilę.',
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      if (response.status >= 500) {
        // 5xx - Server error
        throw new HttpError(errorMessage, response.status);
      }

      // Handle all other error statuses
      throw new HttpError(errorMessage, response.status);
    }

    const data = (await response.json()) as ValidatePidResponse;
    return data;
  } catch (error) {
    // Re-throw HttpError as is
    if (error instanceof HttpError) {
      throw error;
    }

    // Log unexpected errors
    console.error('PID validation error:', {
      error,
      component: 'validatePid',
      endpoint: API_ENDPOINTS.VALIDATE_PID,
      request,
    });

    // Re-throw other errors (NetworkError, AbortError, etc.)
    throw error;
  }
}

/**
 * Get user-friendly error message by HTTP status code
 */
function getErrorMessageByStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Nieprawidłowe parametry żądania';
    case 403:
      return 'Brak uprawnień dostępu do formularza';
    case 404:
      return 'Nie znaleziono osoby w systemie';
    case 429:
      return 'Zbyt wiele próб. Spróbuj ponownie za chwilę.';
    case 500:
    case 502:
    case 503:
      return 'Błąd serwera. Spróbuj ponownie później.';
    default:
      return 'Nie udało się zweryfikować dostępu';
  }
}
