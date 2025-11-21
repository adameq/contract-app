/**
 * GUS API service for fetching company data
 * Integrated with Polish GUS BIR1 registry API
 */

import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';
import { getErrorMessageFromResponse } from '@/shared/constants/apiErrorMessages';
import {
  CONTENT_TYPE,
  HTTP_HEADER,
  HTTP_METHOD,
} from '@/shared/constants/httpConfig';
import { safeFetch } from '@/shared/lib/fetch';
import { logApiCall, logApiResponse } from '@/shared/lib/logger';

import { HttpError, HttpStatus } from './errors';
import { handleApiError } from './gus.errors';
import type { CompanyData, CompanyDataSource, VatStatusData } from './types';

// API configuration - initialized once at module load time
// In production: Use companies-app.thespace.rent subdomain
// In development: Use localhost for direct backend access
const API_BASE_URL = (() => {
  const url = import.meta.env.VITE_BACKEND_API_URL as string | undefined;
  // In production, use companies-app.thespace.rent
  // In development, fallback to localhost for direct backend access
  return import.meta.env.PROD
    ? (url ?? 'https://companies-app.thespace.rent')
    : (url ?? 'http://localhost:3001');
})();

const API_KEY = (() => {
  const key = import.meta.env.VITE_BACKEND_API_KEY as string | undefined;
  if (!key && import.meta.env.PROD) {
    throw new Error(
      'VITE_BACKEND_API_KEY environment variable is required in production'
    );
  }
  return key ?? 'test-api-key-for-development-at-least-32-characters-long';
})();

/**
 * Fetch company data from GUS API by NIP
 *
 * **TRUST BOUNDARY**: This function trusts that the caller (useCompanyQuery hook)
 * has validated the NIP before calling. This is part of the validation boundary pattern
 * where the hook layer validates and the API layer handles HTTP communication.
 *
 * **Architecture layers:**
 * - Hook layer (useCompanyQuery): Validates input, narrows TypeScript types
 * - API layer (this): Focuses on HTTP communication and error handling
 * - Backend: Final server-side validation (defense-in-depth)
 *
 * **TYPE CONTRACT**: This function ONLY accepts userType === 'company'
 * - The 'company' literal type reflects the actual caller requirements
 * - useCompanyQuery is the only caller and always passes 'company'
 * - Type safety eliminates need for runtime validation
 *
 * @param nip - 10-digit NIP number (validated by useCompanyQuery)
 * @param userType - User type context (always 'company' from useCompanyQuery)
 * @param signal - AbortSignal for request cancellation
 * @returns Promise with company data
 * @throws {HttpError} When API request fails or backend validation fails
 * @throws {NetworkError} When network/connectivity issues occur
 * @throws {DOMException} When request is aborted (AbortError)
 */
export async function fetchCompanyByNip(
  nip: string,
  userType: 'company',
  signal?: AbortSignal
): Promise<CompanyData> {
  try {
    const endpoint = `${API_BASE_URL}${API_ENDPOINTS.COMPANIES}`;

    logApiCall(HTTP_METHOD.POST, endpoint, { nip, userType });

    const response = await safeFetch(endpoint, {
      method: HTTP_METHOD.POST,
      headers: {
        [HTTP_HEADER.CONTENT_TYPE]: CONTENT_TYPE.JSON,
        [HTTP_HEADER.AUTHORIZATION]: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ nip }),
      signal,
    });

    logApiResponse(HTTP_METHOD.POST, endpoint, response.status, {
      nip,
      userType,
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: { code?: string; message?: string };
      };

      // Use centralized error message mapping
      const errorMessage = getErrorMessageFromResponse(
        errorData,
        response.status
      );

      if (response.status === 404) {
        // 404 - Company not found in GUS registry
        throw new HttpError(
          errorMessage,
          HttpStatus.NOT_FOUND // Map to NOT_FOUND for UI logic (shows "Wprowadź ręcznie")
        );
      }

      if (response.status === 429) {
        // 429 - Rate limit exceeded
        throw new HttpError(errorMessage, HttpStatus.TOO_MANY_REQUESTS);
      }

      if (response.status >= 500) {
        // 5xx - Server/API error (preserve original 5xx status)
        throw new HttpError(errorMessage, response.status);
      }

      // Handle all other error statuses (4xx client errors, etc.)
      // Preserve original status code for proper error handling in UI
      throw new HttpError(errorMessage, response.status);
    }

    // unified-company-data-server returns UnifiedCompanyDataDto directly (no wrapper)
    const data = (await response.json()) as UnifiedCompanyDataDto;

    // Map unified API data to CompanyData format
    return mapUnifiedDataToCompanyData(data, nip);
  } catch (error) {
    handleApiError(error, {
      component: 'fetchCompanyByNip',
      endpoint: `${API_BASE_URL}${API_ENDPOINTS.COMPANIES}`,
      method: HTTP_METHOD.POST,
      requestData: { nip, userType },
    });
  }
}

/**
 * Type for unified-company-data-server API response (UnifiedCompanyDataDto)
 */
interface UnifiedCompanyDataDto {
  nip: string;
  nazwa: string;
  adres: {
    wojewodztwo?: string | null;
    powiat?: string | null;
    gmina?: string | null;
    miejscowosc: string;
    kodPocztowy: string;
    ulica?: string | null;
    numerBudynku?: string | null;
    numerLokalu?: string | null;
  };
  status: string;
  isActive: boolean;
  dataRozpoczeciaDzialalnosci?: string | null;
  pkd?:
    | {
        kod: string;
        nazwa: string;
        czyGlowny: boolean;
      }[]
    | null;
  zrodloDanych: string;
  dataAktualizacji: string;
  regon?: string | null;
  krs?: string | null;
  dataZakonczeniaDzialalnosci?: string | null;
  formaPrawna?: string | null;
  typPodmiotu: string;
  kapitalZakladowy?: number | null;
  registrySignature: string;
}

/**
 * Map unified-company-data-server response to CompanyData format
 *
 * **NULL/UNDEFINED MAPPING STRATEGY:**
 * All optional text fields use empty string ('') instead of undefined for consistency.
 * This ensures:
 * - Consistent data shape across all optional fields
 * - Compatibility with React Hook Form controlled inputs (expects strings)
 * - Simpler component logic (no null/undefined checks needed)
 * - Alignment with form default values and schema patterns
 *
 * @param data - Unified API response data
 * @param nip - NIP number that was searched
 * @returns CompanyData object with consistent optional field handling
 */
function mapUnifiedDataToCompanyData(
  data: UnifiedCompanyDataDto,
  nip: string
): CompanyData {
  return {
    name: data.nazwa,
    nip: nip, // Use the NIP that was searched
    regon: data.regon ?? '',
    krs: data.krs ?? '', // Empty string for consistency with regon and RHF controlled inputs
    registrySignature: data.registrySignature, // Official registry signature for legal evidence
    status: data.status,
    isActive: data.isActive,
    address: {
      street: data.adres.ulica ?? '',
      buildingNumber: data.adres.numerBudynku ?? '',
      apartmentNumber: data.adres.numerLokalu ?? '',
      city: data.adres.miejscowosc,
      postalCode: data.adres.kodPocztowy,
      // All optional fields use empty string for consistency with RHF controlled inputs
      wojewodztwo: data.adres.wojewodztwo ?? '',
      powiat: data.adres.powiat ?? '',
      gmina: data.adres.gmina ?? '',
    },
    // Map additional fields
    displayType:
      data.typPodmiotu === 'PRAWNA' ? 'podmiotu prawnego' : 'podmiotu',
    formaWlasnosci: data.formaPrawna?.toLowerCase() ?? 'spółka',
    // Map source from zrodloDanych
    source: data.zrodloDanych as CompanyDataSource,
  };
}

/**
 * Check VAT status from white list (Biała Lista VAT)
 *
 * This function is used for consumer-vat users who need to verify their NIP
 * against the Polish VAT white list without fetching full company data.
 *
 * @param nip - 10-digit NIP number
 * @param signal - AbortSignal for request cancellation
 * @returns Promise with VAT status data
 * @throws {HttpError} When API request fails or NIP not found on white list
 * @throws {NetworkError} When network/connectivity issues occur
 * @throws {DOMException} When request is aborted (AbortError)
 */
export async function fetchVatStatus(
  nip: string,
  signal?: AbortSignal
): Promise<VatStatusData> {
  try {
    const endpoint = `${API_BASE_URL}${API_ENDPOINTS.VAT_STATUS}`;

    logApiCall(HTTP_METHOD.POST, endpoint, { nip });

    const response = await safeFetch(endpoint, {
      method: HTTP_METHOD.POST,
      headers: {
        [HTTP_HEADER.CONTENT_TYPE]: CONTENT_TYPE.JSON,
        [HTTP_HEADER.AUTHORIZATION]: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ nip }),
      signal,
    });

    logApiResponse(HTTP_METHOD.POST, endpoint, response.status, { nip });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: { code?: string; message?: string };
      };

      const errorMessage = getErrorMessageFromResponse(
        errorData,
        response.status
      );

      if (response.status === 404) {
        // 404 - NIP not found on VAT white list
        throw new HttpError(
          errorMessage || 'NIP nie znajduje się na białej liście VAT',
          HttpStatus.NOT_FOUND
        );
      }

      if (response.status === 429) {
        // 429 - Rate limit exceeded
        throw new HttpError(errorMessage, HttpStatus.TOO_MANY_REQUESTS);
      }

      if (response.status >= 500) {
        // 5xx - Server/API error
        throw new HttpError(errorMessage, response.status);
      }

      // Handle all other error statuses
      throw new HttpError(errorMessage, response.status);
    }

    const data = (await response.json()) as VatStatusData;
    return data;
  } catch (error) {
    handleApiError(error, {
      component: 'fetchVatStatus',
      endpoint: `${API_BASE_URL}${API_ENDPOINTS.VAT_STATUS}`,
      method: HTTP_METHOD.POST,
      requestData: { nip },
    });
  }
}
