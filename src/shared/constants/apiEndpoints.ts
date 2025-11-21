/**
 * API Endpoints configuration
 *
 * Single source of truth for all API endpoint paths used in the application.
 * Prevents hardcoded endpoint strings scattered across API client files.
 *
 * USAGE:
 * ```typescript
 * import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
 *
 * const endpoint = `${API_BASE_URL}${API_ENDPOINTS.COMPANIES}`;
 * const response = await fetch(endpoint, { method: 'POST', ... });
 * ```
 *
 * BENEFITS:
 * - Single source of truth for endpoint paths
 * - Type-safe with TypeScript literal types
 * - Easy to update (change in one place)
 * - Autocomplete support in IDEs
 * - Prevents typos in endpoint strings
 */

/**
 * API endpoint paths
 *
 * All paths start with '/' and are relative to API_BASE_URL.
 * Use `as const` for literal type inference.
 */
export const API_ENDPOINTS = {
  /** Company data endpoint - fetches company information by NIP from GUS/CEIDG/KRS */
  COMPANIES: '/api/companies',

  /** VAT status endpoint - checks NIP against Polish VAT white list */
  VAT_STATUS: '/api/vat-status',

  /** Contract submission endpoint - submits completed form data */
  CONTRACT_SUBMIT: '/contracts/submit',

  /** Pipedrive PID validation endpoint - validates Person ID with creation date (Cloudflare Function) */
  VALIDATE_PID: '/api/validate-pid',
} as const;

/**
 * Type for API endpoint paths
 * Useful for type-safe function parameters
 */
export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
