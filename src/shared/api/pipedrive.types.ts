/**
 * TypeScript types for Pipedrive API integration (React app side)
 */

/**
 * Request payload for PID validation
 * Sent to: POST /api/validate-pid (Cloudflare Function)
 */
export interface ValidatePidRequest {
  /** Pipedrive Person ID */
  pid: string;
  /** Form option number (01-10) */
  option: string;
  /** Expected creation date in YYYY-MM-DD format */
  created: string;
}

/**
 * Response from PID validation endpoint
 * Received from: POST /api/validate-pid (Cloudflare Function)
 */
export interface ValidatePidResponse {
  /** Whether validation passed all checks */
  valid: boolean;
  /** Limited person data (only returned on success) */
  personData?: {
    id: number;
    name: string;
  };
  /** Error message (only returned on failure) */
  error?: string;
}

/**
 * Pipedrive person data stored in application state
 */
export interface PipedrivePersonData {
  id: number;
  name: string;
}
