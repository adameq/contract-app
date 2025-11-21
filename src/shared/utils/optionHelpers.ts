/**
 * Helper functions for working with form options
 *
 * Provides type-safe lookups for option labels from centralized constants.
 * This eliminates data duplication and ensures consistency across the application.
 *
 * SINGLE SOURCE OF TRUTH:
 * - All labels come from constants/signatureOptions.ts and constants/userTypeOptions.ts
 * - No hardcoded label mappings in components
 * - Updates to labels only need to be made in one place
 */

import type {
  SignatureMethod,
  UserType,
} from '@/features/contract-form/schema';
import { signatureOptions } from '@/shared/constants/signatureOptions';
import { userTypeOptions } from '@/shared/constants/userTypeOptions';

/**
 * Get the display label for a signature method
 *
 * @param id - Signature method ID
 * @returns User-friendly label for the signature method
 *
 * @example
 * ```typescript
 * getSignatureMethodLabel('qualified')     // Returns: "Podpis kwalifikowany"
 * getSignatureMethodLabel('in-person')     // Returns: "Spotkanie z doradcą"
 * ```
 */
export function getSignatureMethodLabel(id: SignatureMethod): string {
  const option = signatureOptions.find(opt => opt.id === id);
  return option?.title ?? id; // Fallback to ID if not found (shouldn't happen with valid types)
}

/**
 * Get the display label for a user type
 *
 * @param id - User type ID
 * @returns User-friendly label for the user type
 *
 * @example
 * ```typescript
 * getUserTypeLabel('company')       // Returns: "Firma"
 * getUserTypeLabel('consumer-vat')  // Returns: "Konsument (Płatnik VAT)"
 * getUserTypeLabel('consumer')      // Returns: "Konsument"
 * ```
 */
export function getUserTypeLabel(id: UserType): string {
  const option = userTypeOptions.find(opt => opt.id === id);
  return option?.title ?? id; // Fallback to ID if not found (shouldn't happen with valid types)
}
