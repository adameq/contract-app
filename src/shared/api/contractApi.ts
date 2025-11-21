/**
 * Contract API client for JSON submissions
 * Sends form data directly to Make.com webhook
 *
 * ARCHITECTURAL DECISIONS:
 *
 * 1. JSON over FormData:
 *    - FormData is designed for HTML forms and file uploads
 *    - JSON naturally handles nested objects and arrays
 *    - Type-safe serialization/deserialization with TypeScript
 *    - Better debugging (human-readable in network tab)
 *
 * 2. Direct webhook submission:
 *    - Simple microservices architecture
 *    - No intermediate backend required
 *    - UUID generation on client side
 *    - Easy to add proxy server later (just change .env)
 *
 * 3. Error handling strategy:
 *    - Throw HttpError for HTTP errors with status code and response body
 *    - Let network errors propagate for proper TanStack Query error handling
 *    - Errors are handled by mutation's onError callback, not caught in API layer
 */

import type { FinalContractData } from '@/features/contract-form/schema';
import { useFormPersistStore } from '@/features/contract-form/store/useFormPersistStore';
import {
  CONTENT_TYPE,
  HTTP_HEADER,
  HTTP_METHOD,
} from '@/shared/constants/httpConfig';
import { safeFetch } from '@/shared/lib/fetch';

import { HttpError } from './errors';

// Make.com webhook configuration from environment variables
const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL as
  | string
  | undefined;
const MAKE_API_KEY = import.meta.env.VITE_MAKE_API_KEY as string | undefined;

if (!MAKE_WEBHOOK_URL) {
  console.error(
    'VITE_MAKE_WEBHOOK_URL is not defined in environment variables. Please add it to your .env file.'
  );
}

if (!MAKE_API_KEY) {
  console.error(
    'VITE_MAKE_API_KEY is not defined in environment variables. Please add it to your .env file.'
  );
}

/**
 * API response type for contract submission
 */
export interface ContractSubmissionResponse {
  success: boolean;
  message: string;
  contractId?: string;
  errors?: Record<string, string>;
}

/**
 * Submit contract form data to Make.com webhook
 *
 * NOTE: This function throws errors on failure for proper TanStack Query integration.
 * The mutation's onError callback will handle these errors appropriately.
 *
 * @param data - Contract form data from React Hook Form
 * @returns Promise with submission response including generated contractId
 * @throws {Error} When webhook URL is not configured
 * @throws {HttpError} When webhook returns HTTP errors
 * @throws {NetworkError} When network/connectivity issues occur
 */
export async function submitContract(
  data: FinalContractData
): Promise<ContractSubmissionResponse> {
  // Validate configuration
  if (!MAKE_WEBHOOK_URL) {
    throw new Error(
      'Make.com webhook URL is not configured. Please set VITE_MAKE_WEBHOOK_URL in your .env file.'
    );
  }

  if (!MAKE_API_KEY) {
    throw new Error(
      'Make.com API key is not configured. Please set VITE_MAKE_API_KEY in your .env file.'
    );
  }

  // Generate unique contract ID
  const contractId = crypto.randomUUID();

  // Get Pipedrive data from store (if validated)
  const pipedrivePersonId = useFormPersistStore.getState().pipedrivePersonId;
  const pipedriveOption = useFormPersistStore.getState().pipedriveOption;
  const pipedriveCreated = useFormPersistStore.getState().pipedriveCreated;

  // Prepare payload with contractId and optional Pipedrive data
  const payload = {
    ...data,
    contractId,
    submittedAt: new Date().toISOString(),
    // Include Pipedrive data if available (matches legacy form format)
    ...(pipedrivePersonId && {
      pID: pipedrivePersonId,
      optionNr: pipedriveOption,
      // Optional: include creation date for audit trail
      pipedriveCreatedDate: pipedriveCreated,
    }),
  };

  // Send to Make.com webhook
  const response = await safeFetch(MAKE_WEBHOOK_URL, {
    method: HTTP_METHOD.POST,
    headers: {
      [HTTP_HEADER.CONTENT_TYPE]: CONTENT_TYPE.JSON,
      'x-make-apikey': MAKE_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Handle HTTP errors
    let responseBody: unknown;
    try {
      responseBody = (await response.json()) as unknown;
    } catch {
      // Response body is not JSON or empty
      responseBody = null;
    }

    throw new HttpError(
      `Webhook submission failed with status: ${response.status}`,
      response.status,
      response.statusText,
      responseBody
    );
  }

  // Return success response with generated contractId
  return {
    success: true,
    message: 'Formularz został wysłany pomyślnie',
    contractId,
  };
}
