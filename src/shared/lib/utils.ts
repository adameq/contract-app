import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Address formatting utilities
 * Provides consistent address formatting across the application
 */

/**
 * Format street address with building and apartment number
 *
 * @param address - Address object containing street, building, and optional apartment number
 * @returns Formatted street address string (e.g., "Marszałkowska 1/2")
 *
 * @example
 * ```typescript
 * formatStreetAddress({
 *   street: "Marszałkowska",
 *   buildingNumber: "1",
 *   apartmentNumber: "2"
 * })
 * // Returns: "Marszałkowska 1/2"
 *
 * formatStreetAddress({
 *   street: "Marszałkowska",
 *   buildingNumber: "1"
 * })
 * // Returns: "Marszałkowska 1"
 * ```
 */
export function formatStreetAddress(address: {
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
}): string {
  const apartment = address.apartmentNumber
    ? `/${address.apartmentNumber}`
    : '';
  return `${address.street} ${address.buildingNumber}${apartment}`;
}

/**
 * Format city with postal code (Polish format: postal code first)
 *
 * @param address - Address object containing city and postal code
 * @returns Formatted city string (e.g., "00-001 Warszawa")
 *
 * @example
 * ```typescript
 * formatCityWithPostalCode({
 *   city: "Warszawa",
 *   postalCode: "00-001"
 * })
 * // Returns: "00-001 Warszawa"
 * ```
 */
export function formatCityWithPostalCode(address: {
  city: string;
  postalCode: string;
}): string {
  return `${address.postalCode} ${address.city}`;
}

/**
 * Format full address (all fields in one string)
 *
 * @param address - Complete address object
 * @returns Formatted full address string (e.g., "Marszałkowska 1/2, 00-001 Warszawa")
 *
 * @example
 * ```typescript
 * formatFullAddress({
 *   street: "Marszałkowska",
 *   buildingNumber: "1",
 *   apartmentNumber: "2",
 *   city: "Warszawa",
 *   postalCode: "00-001"
 * })
 * // Returns: "Marszałkowska 1/2, 00-001 Warszawa"
 * ```
 */
export function formatFullAddress(address: {
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  city: string;
  postalCode: string;
}): string {
  return `${formatStreetAddress(address)}, ${formatCityWithPostalCode(address)}`;
}
