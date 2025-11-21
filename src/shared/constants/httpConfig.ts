/**
 * HTTP Configuration constants
 *
 * Standard HTTP methods, headers, and content types used across API clients.
 * Prevents hardcoded HTTP strings scattered throughout the codebase.
 *
 * USAGE:
 * ```typescript
 * import { HTTP_METHOD, HTTP_HEADER, CONTENT_TYPE } from '@/shared/constants/httpConfig';
 *
 * const response = await fetch(url, {
 *   method: HTTP_METHOD.POST,
 *   headers: {
 *     [HTTP_HEADER.CONTENT_TYPE]: CONTENT_TYPE.JSON,
 *     [HTTP_HEADER.API_KEY]: apiKey,
 *   },
 * });
 * ```
 *
 * BENEFITS:
 * - Type-safe HTTP configuration
 * - Prevents typos in method/header names
 * - Autocomplete support in IDEs
 * - Single source of truth
 * - Easy to extend with new methods/headers
 */

/**
 * HTTP Methods
 *
 * Standard HTTP request methods following REST conventions.
 * Use `as const` for literal type inference.
 */
export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

/**
 * HTTP Headers
 *
 * Common HTTP header names used in API requests.
 * Use bracket notation for dynamic header keys: `[HTTP_HEADER.CONTENT_TYPE]`
 */
export const HTTP_HEADER = {
  /** Content-Type header - specifies request/response body format */
  CONTENT_TYPE: 'Content-Type',

  /** Authorization header - Bearer token authentication */
  AUTHORIZATION: 'Authorization',

  /** X-API-Key header - custom API authentication header (legacy) */
  API_KEY: 'X-API-Key',
} as const;

/**
 * Content Types
 *
 * Standard MIME types for request/response bodies.
 */
export const CONTENT_TYPE = {
  /** application/json - JSON data format */
  JSON: 'application/json',

  /** multipart/form-data - form data with file uploads */
  FORM_DATA: 'multipart/form-data',

  /** application/x-www-form-urlencoded - URL-encoded form data */
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
} as const;

/**
 * Type exports for type-safe function parameters
 */
export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];
export type HttpHeader = (typeof HTTP_HEADER)[keyof typeof HTTP_HEADER];
export type ContentType = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];
