/**
 * Enhanced fetch wrapper with automatic NetworkError wrapping and optional timeout
 * Provides consistent error handling and timeout management across all API calls
 */

import { NetworkError } from '@/shared/api/errors';

/**
 * Extended RequestInit with optional timeout parameter
 */
export interface SafeFetchOptions extends RequestInit {
  /**
   * Optional timeout in milliseconds
   * If specified and no signal is provided, automatically creates an AbortSignal with timeout
   * If both timeout and signal are provided, the external signal takes precedence
   *
   * @example
   * ```typescript
   * // 10-second timeout
   * await safeFetch('/api/data', { timeout: 10000 });
   *
   * // External signal takes precedence over timeout
   * await safeFetch('/api/data', { signal, timeout: 10000 }); // timeout ignored
   * ```
   */
  timeout?: number;
}

/**
 * Wrapper around native fetch that automatically converts network errors to NetworkError
 * and provides optional built-in timeout support
 *
 * This ensures consistent error handling across the application by wrapping:
 * - TypeError: Network unavailable, CORS errors, DNS failures
 * - DOMException (non-abort): Timeouts, connection issues
 *
 * AbortError is preserved to allow proper request cancellation handling.
 *
 * **Timeout Behavior:**
 * - If `timeout` is specified and no `signal` is provided, creates AbortSignal.timeout()
 * - If both `timeout` and `signal` are provided, external `signal` takes precedence
 * - This ensures backward compatibility with React Query and other signal providers
 *
 * **Browser Support:**
 * - AbortSignal.timeout() requires Chrome 103+, Firefox 100+, Safari 16+ (September 2022)
 * - All modern browsers support this API
 *
 * @example
 * ```typescript
 * // Without timeout (existing behavior - backward compatible)
 * const response = await safeFetch('/api/data');
 *
 * // With timeout (new feature)
 * const response = await safeFetch('/api/data', { timeout: 10000 });
 *
 * // With external signal (React Query pattern - signal takes precedence)
 * const response = await safeFetch('/api/data', { signal, timeout: 10000 });
 *
 * // Error handling
 * try {
 *   const response = await safeFetch('/api/data', { timeout: 5000 });
 * } catch (error) {
 *   if (isNetworkError(error)) {
 *     // Handle network error
 *   } else if (error instanceof DOMException && error.name === 'AbortError') {
 *     // Handle timeout or cancellation
 *   }
 * }
 * ```
 */
export async function safeFetch(
  input: RequestInfo | URL,
  init?: SafeFetchOptions
): Promise<Response> {
  // Extract timeout and signal from options
  const { timeout, signal, ...fetchInit } = init ?? {};

  // Determine final signal:
  // 1. If external signal provided, use it (React Query, manual cancellation)
  // 2. If timeout specified and no signal, create timeout signal
  // 3. Otherwise, no signal (infinite wait)
  const finalSignal =
    signal !== undefined
      ? signal // External signal takes precedence
      : timeout !== undefined
        ? AbortSignal.timeout(timeout) // Create timeout signal
        : undefined; // No signal

  try {
    return await fetch(input, { ...fetchInit, signal: finalSignal });
  } catch (error) {
    // Wrap network errors (TypeError, DOMException except AbortError) in NetworkError
    if (
      error instanceof TypeError ||
      (error instanceof DOMException && error.name !== 'AbortError')
    ) {
      throw new NetworkError('Network request failed', error);
    }

    // Re-throw AbortError (timeout or cancellation) and other errors as-is
    throw error;
  }
}
