/**
 * Shared TypeScript types for Cloudflare Functions
 */

/**
 * Pipedrive Person API response structure
 * From: GET /v1/persons/{id}
 */
export interface PipedrivePersonApiResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    /**
     * Creation date and time of the person
     * Format: "YYYY-MM-DD HH:MM:SS" (e.g., "2024-03-15 10:30:45")
     */
    add_time: string;
    /**
     * Last updated date and time of the person
     * Format: "YYYY-MM-DD HH:MM:SS"
     */
    update_time: string;
    email: Array<{ value: string; primary: boolean }>;
    phone: Array<{ value: string; primary: boolean }>;
    /**
     * Custom fields - indexed by field key
     * Example: { 'f65fca61a8ac7eef5757b18f3e1a15739901c529': '234' }
     */
    [key: string]: any;
  };
}

/**
 * Validation request from client
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
 * Validation response to client
 */
export interface ValidatePidResponse {
  /** Whether validation passed all checks */
  valid: boolean;
  /** Limited person data (only on success) */
  personData?: {
    id: number;
    name: string;
  };
  /** Error message (only on failure) */
  error?: string;
}

/**
 * Cloudflare Pages Function environment bindings
 */
export interface Env {
  /** Pipedrive API token */
  PIPEDRIVE_API_TOKEN: string;
  /** Pipedrive API base URL */
  PIPEDRIVE_API_URL: string;
  /** Custom field key to check */
  PIPEDRIVE_CUSTOM_FIELD_KEY: string;
  /** Expected value for custom field */
  PIPEDRIVE_CUSTOM_FIELD_VALUE: string;
  /** Feature flag - whether PID validation is enabled */
  PIPEDRIVE_ENABLED: string;
}
