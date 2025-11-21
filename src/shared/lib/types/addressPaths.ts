/**
 * Type-safe address path utilities
 *
 * Provides strongly-typed path construction for address fields in form data,
 * eliminating the need for manual type casting and ensuring compile-time safety.
 */

import type { FieldValues, Path } from 'react-hook-form';

/**
 * Individual address field names
 */
export type AddressFieldName =
  | 'street'
  | 'buildingNumber'
  | 'apartmentNumber'
  | 'city'
  | 'postalCode';

/**
 * Extract all valid address paths from form data type
 *
 * This conditional type extracts paths that point to address objects.
 * Supports both root-level and nested address fields:
 * - Root-level: "address"
 * - Nested with dot notation: "company.address", "correspondence.address"
 *
 * Examples:
 * - For CompanyFormData: "address" (root-level)
 * - For FinalContractData: "company.address", "correspondence.address" (nested)
 *
 * This makes AddressFields truly generic and reusable across different form structures.
 *
 * @template T - Form data type extending FieldValues
 */
export type AddressPath<T extends FieldValues> =
  | Extract<Path<T>, 'address'> // Root-level: "address"
  | Extract<Path<T>, `${string}.address`>; // Nested: "*.address"

/**
 * Type-safe helper to build complete field paths for address components
 *
 * Instead of manual string concatenation and type casting, this function:
 * 1. Accepts only valid address paths from the form data type
 * 2. Returns properly typed Path<T> without casting
 * 3. Includes runtime validation for additional safety
 *
 * @example
 * // TypeScript will only accept valid address paths:
 * buildAddressFieldPath<ContractFormData>("company.address", "street")
 * // ✅ Returns: "company.address.street" as Path<ContractFormData>
 *
 * buildAddressFieldPath<ContractFormData>("invalid.path", "street")
 * // ❌ TypeScript error: Argument not assignable to AddressPath<ContractFormData>
 *
 * @template T - Form data type extending FieldValues
 * @param namePrefix - Base path to address object (e.g., "company.address")
 * @param fieldName - Specific address field name (e.g., "street")
 * @returns Fully qualified path to the address field
 */
export function buildAddressFieldPath<T extends FieldValues>(
  namePrefix: AddressPath<T>,
  fieldName: AddressFieldName
): Path<T> {
  // Runtime validation for additional safety
  if (!namePrefix || typeof namePrefix !== 'string') {
    throw new Error(
      `Invalid namePrefix: expected string, got ${typeof namePrefix}`
    );
  }

  // Validate fieldName is one of the expected address fields
  const validFields: AddressFieldName[] = [
    'street',
    'buildingNumber',
    'apartmentNumber',
    'city',
    'postalCode',
  ];

  if (!validFields.includes(fieldName)) {
    throw new Error(`Invalid address field: ${String(fieldName)}`);
  }

  // TypeScript now knows this is a valid Path<T> due to the type constraints
  return `${namePrefix}.${fieldName}` as Path<T>;
}
