/**
 * Custom error classes for API communication
 * Provides structured error handling with HTTP status codes
 */

/**
 * Custom error class for HTTP errors
 * Extends the native Error class with HTTP-specific properties
 *
 * @example
 * ```typescript
 * if (!response.ok) {
 *   throw new HttpError(
 *     `Request failed with status ${response.status}`,
 *     response.status,
 *     response.statusText
 *   );
 * }
 * ```
 */
export class HttpError extends Error {
  /**
   * @param message - Human-readable error message
   * @param status - HTTP status code (e.g., 404, 500)
   * @param statusText - HTTP status text (e.g., "Not Found", "Internal Server Error")
   * @param response - Optional response body for additional error details
   */
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText?: string,
    public readonly response?: unknown
  ) {
    super(message);
    this.name = 'HttpError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if error is a specific status code
   */
  hasStatus(status: number): boolean {
    return this.status === status;
  }
}

/**
 * Type guard to check if an error is an HttpError
 *
 * @example
 * ```typescript
 * import { logger } from '@/shared/lib/logger';
 *
 * try {
 *   await fetchData();
 * } catch (error) {
 *   if (isHttpError(error)) {
 *     logger.error('HTTP request failed', error, { status: error.status });
 *   }
 * }
 * ```
 */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/**
 * Common HTTP status codes for easy reference
 */
export const HttpStatus = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

/**
 * Custom error class for validation errors
 * Used when the server returns field-level validation errors (typically HTTP 422)
 *
 * @example
 * ```typescript
 * if (response.status === 422) {
 *   const errorData = await response.json();
 *   throw new ValidationError(
 *     'Validation failed',
 *     errorData.errors || {}
 *   );
 * }
 * ```
 */
export class ValidationError extends Error {
  /**
   * @param message - Human-readable error message
   * @param errors - Field-level validation errors (field name -> error message)
   */
  constructor(
    message: string,
    public readonly errors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Check if there are errors for a specific field
   */
  hasFieldError(field: string): boolean {
    return field in this.errors;
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(field: string): string | undefined {
    return this.errors[field];
  }

  /**
   * Get all field names that have errors
   */
  getErrorFields(): string[] {
    return Object.keys(this.errors);
  }
}

/**
 * Type guard to check if an error is a ValidationError
 *
 * @example
 * ```typescript
 * try {
 *   await submitForm();
 * } catch (error) {
 *   if (isValidationError(error)) {
 *     logger.error('Validation failed', error, { errors: error.errors });
 *   }
 * }
 * ```
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Custom error class for client-side validation failures
 * Thrown BEFORE making HTTP request when input validation fails
 *
 * Distinct from:
 * - HttpError: represents server HTTP responses
 * - ValidationError: represents server-side validation errors (HTTP 422)
 *
 * Use this when validating user input on the client before sending to server.
 *
 * @example
 * ```typescript
 * if (!isValidNip(nip)) {
 *   throw new ClientValidationError(
 *     'NIP jest nieprawidłowy. Sprawdź poprawność numeru.',
 *     'nip',
 *     nip
 *   );
 * }
 * ```
 */
export class ClientValidationError extends Error {
  /**
   * @param message - Human-readable error message for display
   * @param field - Field name that failed validation (e.g., 'nip', 'userType')
   * @param value - Invalid value that was provided (for debugging)
   */
  constructor(
    message: string,
    public readonly field: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ClientValidationError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClientValidationError);
    }
  }
}

/**
 * Type guard to check if an error is a ClientValidationError
 *
 * @example
 * ```typescript
 * try {
 *   await fetchCompanyData(nip);
 * } catch (error) {
 *   if (isClientValidationError(error)) {
 *     logger.warn('Client validation failed', error, {
 *       field: error.field,
 *       value: error.value
 *     });
 *   }
 * }
 * ```
 */
export function isClientValidationError(
  error: unknown
): error is ClientValidationError {
  return error instanceof ClientValidationError;
}

/**
 * Custom error class for network-related errors
 * Thrown when network requests fail due to connectivity issues, timeouts, or fetch failures
 *
 * This provides a reliable way to identify network errors across different browsers
 * and environments, instead of relying on fragile instanceof checks for TypeError/DOMException.
 *
 * Common network error scenarios:
 * - Network unavailable (offline)
 * - DNS resolution failure
 * - Connection timeout
 * - Connection refused
 * - CORS errors
 * - AbortController cancellations (when not user-initiated)
 *
 * Uses ES2022 Error.cause for automatic error chaining and better debugging.
 *
 * @example
 * ```typescript
 * try {
 *   const response = await fetch(url);
 * } catch (error) {
 *   // Wrap native network errors in NetworkError
 *   // Cause can be any type (Error, DOMException, object, string, etc.)
 *   throw new NetworkError('Failed to fetch data', error);
 * }
 * ```
 */
export class NetworkError extends Error {
  /**
   * @param message - Human-readable error message
   * @param cause - Original error that caused the network failure (any type supported via Error.cause)
   */
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'NetworkError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }

  /**
   * Check if the error was caused by request abortion (AbortController)
   */
  isAborted(): boolean {
    return (
      this.cause instanceof DOMException &&
      (this.cause as DOMException).name === 'AbortError'
    );
  }

  /**
   * Check if the error was caused by a timeout
   */
  isTimeout(): boolean {
    return (
      this.cause instanceof DOMException &&
      (this.cause as DOMException).name === 'TimeoutError'
    );
  }
}

/**
 * Type guard to check if an error is a NetworkError
 *
 * @example
 * ```typescript
 * import { logger } from '@/shared/lib/logger';
 *
 * try {
 *   await fetchData();
 * } catch (error) {
 *   if (isNetworkError(error)) {
 *     logger.error('Network request failed', error, {
 *       isAborted: error.isAborted(),
 *       isTimeout: error.isTimeout()
 *     });
 *   }
 * }
 * ```
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}
