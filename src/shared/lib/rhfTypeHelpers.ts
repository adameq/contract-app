/**
 * React Hook Form Type-Safe Utilities
 *
 * This module provides type-safe utilities for working with React Hook Form
 * and discriminated union types like FinalContractData.
 *
 * **Problem**:
 * TypeScript cannot narrow discriminated unions in RHF's setValue/useWatch
 * without runtime type guards, leading to unsafe type assertions.
 *
 * **Solution**:
 * - Type guards to narrow unions at runtime
 * - Type-safe path builders for discriminated union fields
 * - Generic wrappers that understand discriminated unions
 *
 * @module rhfTypeHelpers
 */

import type {
  FieldValues,
  Path,
  SetValueConfig,
  UseFormReturn,
} from 'react-hook-form';

import type {
  CompanyFormData,
  ConsumerFormData,
  ConsumerVatFormData,
  FinalContractData,
} from '@/features/contract-form/schema/companySchemas';
import type { FormUserType } from '@/features/contract-form/schema/sharedSchema';

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

/**
 * Maps userType to corresponding company data type
 *
 * This centralized mapping is used by generic functions like setCompanyValue
 * to automatically infer the correct data type based on userType.
 *
 * To add a new user type:
 * 1. Add entry here: 'new-type': NewCompanyDataType
 * 2. Update switch statement in setCompanyValue implementation
 */
type UserTypeToCompanyDataMap = {
  company: CompanyFormData;
  'consumer-vat': ConsumerVatFormData;
  consumer: ConsumerFormData;
  none: ConsumerFormData;
};

/**
 * Utility type to narrow FinalContractData based on userType
 *
 * Provides type-safe narrowing of the discriminated union without runtime type guards.
 *
 * @example
 * ```typescript
 * function handleCompanyData<T extends FormUserType>(
 *   userType: T,
 *   data: NarrowedFinalContractData<T>
 * ) {
 *   // data.company is correctly typed based on T
 * }
 * ```
 */
export type NarrowedFinalContractData<T extends FormUserType> =
  T extends 'company'
    ? FinalContractData & {
        userType: 'company';
        company: CompanyFormData;
      }
    : T extends 'consumer-vat'
      ? FinalContractData & {
          userType: 'consumer-vat';
          company: ConsumerVatFormData;
        }
      : T extends 'consumer' | 'none'
        ? FinalContractData & {
            userType: 'consumer' | 'none';
            company: ConsumerFormData;
          }
        : never;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if userType is 'company'
 */
export function isCompanyUserType(
  userType: FormUserType | null | undefined
): userType is 'company' {
  return userType === 'company';
}

/**
 * Type guard to check if userType is 'consumer-vat'
 */
export function isConsumerVatUserType(
  userType: FormUserType | null | undefined
): userType is 'consumer-vat' {
  return userType === 'consumer-vat';
}

/**
 * Type guard to check if userType is 'consumer'
 */
export function isConsumerUserType(
  userType: FormUserType | null | undefined
): userType is 'consumer' {
  return userType === 'consumer';
}

/**
 * Type guard to narrow FinalContractData to FinalCompanyData
 */
export function isFinalCompanyData(
  data: FinalContractData
): data is FinalContractData & {
  userType: 'company';
  company: CompanyFormData;
} {
  return data.userType === 'company';
}

/**
 * Type guard to narrow FinalContractData to FinalConsumerVatData
 */
export function isFinalConsumerVatData(
  data: FinalContractData
): data is FinalContractData & {
  userType: 'consumer-vat';
  company: ConsumerVatFormData;
} {
  return data.userType === 'consumer-vat';
}

/**
 * Type guard to narrow FinalContractData to FinalConsumerData
 */
export function isFinalConsumerData(
  data: FinalContractData
): data is FinalContractData & {
  userType: 'consumer';
  company: ConsumerFormData;
} {
  return data.userType === 'consumer';
}

// ============================================================================
// TYPE-SAFE PATH BUILDERS
// ============================================================================

/**
 * Type-safe path builder for company fields in discriminated union
 *
 * This function helps build paths like 'company.nip' in a type-safe way
 * for discriminated unions where the company field structure depends on userType.
 *
 * @param fieldName - Field name within company object
 * @returns Type-safe path string for useWatch/setValue
 *
 * @example
 * ```typescript
 * const nip = useWatch({
 *   name: getCompanyFieldPath('nip'),
 *   control,
 * });
 * ```
 */
export function getCompanyFieldPath<K extends keyof CompanyFormData>(
  fieldName: K
): `company.${K}` {
  return `company.${fieldName}`;
}

/**
 * Type-safe path builder with optional prefix support
 *
 * @param fieldName - Base field name
 * @param prefix - Optional prefix (e.g., 'company')
 * @returns Prefixed path or base field name
 *
 * @example
 * ```typescript
 * buildFieldPath('nip', 'company') // 'company.nip'
 * buildFieldPath('nip', undefined) // 'nip'
 * ```
 */
export function buildFieldPath<T extends string>(
  fieldName: T,
  prefix?: string
): string {
  return prefix ? `${prefix}.${fieldName}` : fieldName;
}

// ============================================================================
// TYPE-SAFE SETVALUE WRAPPER FOR DISCRIMINATED UNIONS
// ============================================================================

/**
 * Type-safe setValue for company field in FinalContractData discriminated union
 *
 * This function provides a type-safe way to set the company field value
 * based on the userType. Uses TypeScript generics with mapped types to
 * automatically infer the correct value type from the userType parameter.
 *
 * @param methods - React Hook Form methods
 * @param userType - Current user type (generic parameter T is inferred from this)
 * @param value - Company data matching the userType (type is UserTypeToCompanyDataMap[T])
 * @param options - setValue options
 *
 * @example
 * ```typescript
 * // TypeScript automatically infers correct value type from userType
 * setCompanyValue(methods, 'company', companyData); // ✅ companyData must be CompanyFormData
 * setCompanyValue(methods, 'company', consumerData); // ❌ Type error!
 *
 * setCompanyValue(methods, 'consumer-vat', consumerVatData, {
 *   shouldValidate: false,
 * });
 * ```
 */
export function setCompanyValue<T extends FormUserType>(
  methods: UseFormReturn<FinalContractData>,
  userType: T,
  value: UserTypeToCompanyDataMap[T],
  options?: SetValueConfig
): void {
  // Type assertions are safe here because the generic constraint
  // guarantees that the correct value type is passed for each userType
  switch (userType) {
    case 'company':
      methods.setValue('company', value as CompanyFormData, options);
      break;
    case 'consumer-vat':
      methods.setValue('company', value as ConsumerVatFormData, options);
      break;
    case 'consumer':
    case 'none':
      methods.setValue('company', value as ConsumerFormData, options);
      break;
  }
}

// ============================================================================
// GENERIC TYPE-SAFE FORM METHODS
// ============================================================================

/**
 * Type-safe wrapper for form methods that work with union types
 *
 * This type allows passing form methods from either CompanyFormData or
 * FinalContractData contexts without 'as any' assertions.
 */
export type UnionFormMethods<
  TFlat extends FieldValues = FieldValues,
  TNested extends FieldValues = FieldValues,
> =
  | Pick<UseFormReturn<TFlat>, 'getValues' | 'reset' | 'setValue' | 'formState'>
  | Pick<
      UseFormReturn<TNested>,
      'getValues' | 'reset' | 'setValue' | 'formState'
    >;

/**
 * Type helper for setValue operations that work with both flat and nested contexts
 *
 * This type allows setValue to accept either flat field names or nested paths
 * depending on the form context, without requiring type assertions.
 */
export type FlexiblePath<
  TFlat extends FieldValues,
  TNested extends FieldValues,
  TPath extends string,
> =
  TPath extends Path<TFlat>
    ? Path<TFlat>
    : TPath extends Path<TNested>
      ? Path<TNested>
      : Path<TFlat> | Path<TNested>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Type predicate to check if a value is defined (non-null and non-undefined)
 *
 * This is useful for narrowing optional types without non-null assertions.
 *
 * @param value - Value to check
 * @returns True if value is defined
 *
 * @example
 * ```typescript
 * if (isDefined(nip)) {
 *   // TypeScript knows nip is string, not string | undefined
 *   await fetchCompanyByNip(nip);
 * }
 * ```
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
