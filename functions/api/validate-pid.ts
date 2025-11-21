/**
 * Cloudflare Pages Function for validating Pipedrive Person ID
 *
 * Security features:
 * - Validates PID against Pipedrive API (server-side only)
 * - Checks custom field value
 * - Validates exact creation date match (prevents PID guessing)
 * - API token never exposed to client
 *
 * @endpoint POST /api/validate-pid
 */

import type {
  PipedrivePersonApiResponse,
  ValidatePidRequest,
  ValidatePidResponse,
  Env,
} from '../types';

/**
 * Handle POST requests for PID validation
 */
export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    // Parse request body
    const body = (await context.request.json()) as ValidatePidRequest;
    const { pid, option, created } = body;

    // 1. Validate required parameters
    if (!pid || !option || !created) {
      return jsonResponse(
        {
          valid: false,
          error: 'Missing required parameters: pid, option, created',
        },
        400
      );
    }

    // 2. Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(created)) {
      return jsonResponse(
        {
          valid: false,
          error: 'Invalid date format. Expected YYYY-MM-DD',
        },
        400
      );
    }

    // 3. Validate option format (01-10)
    const optionRegex = /^(0[1-9]|10)$/;
    if (!optionRegex.test(option)) {
      return jsonResponse(
        {
          valid: false,
          error: 'Invalid option. Expected 01-10',
        },
        400
      );
    }

    // 4. Validate PID is numeric
    if (!/^\d+$/.test(pid)) {
      return jsonResponse(
        {
          valid: false,
          error: 'Invalid PID format. Expected numeric value',
        },
        400
      );
    }

    // 5. Call Pipedrive API
    const apiUrl = context.env.PIPEDRIVE_API_URL;
    const apiToken = context.env.PIPEDRIVE_API_TOKEN;

    if (!apiUrl || !apiToken) {
      console.error('Missing Pipedrive API configuration');
      return jsonResponse(
        {
          valid: false,
          error: 'Server configuration error',
        },
        500
      );
    }

    const pipedriveUrl = `${apiUrl}/persons/${pid}?api_token=${apiToken}`;
    const pipedriveResponse = await fetch(pipedriveUrl);

    if (!pipedriveResponse.ok) {
      if (pipedriveResponse.status === 404) {
        return jsonResponse(
          {
            valid: false,
            error: 'Person not found',
          },
          404
        );
      }

      console.error(
        'Pipedrive API error:',
        pipedriveResponse.status,
        await pipedriveResponse.text()
      );
      return jsonResponse(
        {
          valid: false,
          error: 'Failed to validate with Pipedrive',
        },
        502
      );
    }

    const pipedriveData =
      (await pipedriveResponse.json()) as PipedrivePersonApiResponse;

    // 6. Check if response is successful
    if (!pipedriveData.success || !pipedriveData.data) {
      return jsonResponse(
        {
          valid: false,
          error: 'Person not found or invalid response',
        },
        404
      );
    }

    // 7. Validate custom field value
    const fieldKey = context.env.PIPEDRIVE_CUSTOM_FIELD_KEY;
    const expectedFieldValue = context.env.PIPEDRIVE_CUSTOM_FIELD_VALUE;

    if (!fieldKey || !expectedFieldValue) {
      console.error('Missing custom field configuration');
      return jsonResponse(
        {
          valid: false,
          error: 'Server configuration error',
        },
        500
      );
    }

    const actualFieldValue = pipedriveData.data[fieldKey];
    if (actualFieldValue !== expectedFieldValue) {
      console.log(
        `Custom field mismatch: expected "${expectedFieldValue}", got "${actualFieldValue}"`
      );
      return jsonResponse(
        {
          valid: false,
          error: 'Person does not have required permissions',
        },
        403
      );
    }

    // 8. Validate creation date (SECURITY: prevents PID guessing)
    const addTime = pipedriveData.data.add_time; // Format: "YYYY-MM-DD HH:MM:SS"

    if (!addTime) {
      console.error('Missing add_time in Pipedrive response');
      return jsonResponse(
        {
          valid: false,
          error: 'Invalid person data',
        },
        500
      );
    }

    // Extract date part (YYYY-MM-DD) from timestamp
    const createdDate = addTime.split(' ')[0];

    if (createdDate !== created) {
      console.log(
        `Creation date mismatch: expected "${created}", got "${createdDate}"`
      );
      return jsonResponse(
        {
          valid: false,
          error: 'Invalid creation date',
        },
        403
      );
    }

    // 9. All validations passed - return success
    return jsonResponse({
      valid: true,
      personData: {
        id: pipedriveData.data.id,
        name: pipedriveData.data.name,
      },
    });
  } catch (error) {
    console.error('Validation error:', error);
    return jsonResponse(
      {
        valid: false,
        error: 'Internal server error',
      },
      500
    );
  }
}

/**
 * Helper function to create JSON response with proper headers
 */
function jsonResponse(
  data: ValidatePidResponse,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // CORS headers - adjust origin for production
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
