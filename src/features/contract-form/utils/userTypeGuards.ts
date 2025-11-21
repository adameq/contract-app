/**
 * User Type Guards and Assertions
 *
 * Provides runtime validation for component usage based on user type.
 * These guards help ensure components are rendered for the correct user types
 * during development, catching integration errors early.
 *
 * ## Use Cases
 *
 * 1. **Development-time validation**: Assert component is used correctly
 * 2. **Type narrowing**: Help TypeScript understand user type in branches
 * 3. **Documentation**: Make component requirements explicit
 *
 * ## Example Usage
 *
 * ```typescript
 * export function CompanyDataSection() {
 *   const userType = useWatch({ name: 'userType' });
 *
 *   // Development guard - catches misuse early
 *   if (process.env.NODE_ENV === 'development') {
 *     assertUserTypeIsCompany(userType, 'CompanyDataSection');
 *   }
 *
 *   // ... rest of component
 * }
 * ```
 */

import type { FormUserType } from '../schema/sharedSchema';

/**
 * Assert that user type is 'company'
 *
 * Throws an error in development if the component is rendered
 * with an incorrect user type. This helps catch integration bugs
 * during development before they reach production.
 *
 * **When to use**:
 * - In components that should ONLY render for userType === 'company'
 * - At the top of the component, after reading userType from form
 * - Wrap in `if (process.env.NODE_ENV === 'development')` check
 *
 * **Why not production**:
 * - Runtime assertions add bundle size
 * - Conditional rendering in parent should prevent this case
 * - Development-only checks are sufficient
 *
 * @param userType - Current user type from form
 * @param componentName - Name of component for error message
 * @throws Error if userType is not 'company' (development only)
 *
 * @example
 * ```typescript
 * if (process.env.NODE_ENV === 'development') {
 *   assertUserTypeIsCompany(userType, 'CompanyDataSection');
 * }
 * ```
 */
export function assertUserTypeIsCompany(
  userType: FormUserType | null | undefined,
  componentName: string
): asserts userType is 'company' {
  if (userType !== 'company') {
    throw new Error(
      `[${componentName}] This component should ONLY be rendered when userType='company'. ` +
        `Current userType: '${userType}'. ` +
        `Check the conditional rendering logic in the parent component (likely FormStep5Page).`
    );
  }
}

/**
 * Assert that user type is 'consumer-vat'
 *
 * Similar to assertUserTypeIsCompany but for consumer-vat user type.
 *
 * @param userType - Current user type from form
 * @param componentName - Name of component for error message
 * @throws Error if userType is not 'consumer-vat' (development only)
 *
 * @example
 * ```typescript
 * if (process.env.NODE_ENV === 'development') {
 *   assertUserTypeIsConsumerVat(userType, 'ConsumerVatDataSection');
 * }
 * ```
 */
export function assertUserTypeIsConsumerVat(
  userType: FormUserType | null | undefined,
  componentName: string
): asserts userType is 'consumer-vat' {
  if (userType !== 'consumer-vat') {
    throw new Error(
      `[${componentName}] This component should ONLY be rendered when userType='consumer-vat'. ` +
        `Current userType: '${userType}'. ` +
        `Check the conditional rendering logic in the parent component (likely FormStep5Page).`
    );
  }
}

/**
 * Assert that user type is 'consumer'
 *
 * Similar to assertUserTypeIsCompany but for consumer user type.
 *
 * @param userType - Current user type from form
 * @param componentName - Name of component for error message
 * @throws Error if userType is not 'consumer' (development only)
 *
 * @example
 * ```typescript
 * if (process.env.NODE_ENV === 'development') {
 *   assertUserTypeIsConsumer(userType, 'ConsumerSection');
 * }
 * ```
 */
export function assertUserTypeIsConsumer(
  userType: FormUserType | null | undefined,
  componentName: string
): asserts userType is 'consumer' {
  if (userType !== 'consumer') {
    throw new Error(
      `[${componentName}] This component should ONLY be rendered when userType='consumer'. ` +
        `Current userType: '${userType}'. ` +
        `Check the conditional rendering logic in the parent component (likely FormStep5Page).`
    );
  }
}

/**
 * Type guard to check if user type is 'company'
 *
 * **Type guard** (not assertion) - doesn't throw, just returns boolean.
 * Useful for conditional logic where you want to check the type
 * without throwing an error.
 *
 * @param userType - User type to check
 * @returns true if userType is 'company'
 *
 * @example
 * ```typescript
 * if (isCompanyUserType(userType)) {
 *   // TypeScript knows userType is 'company' here
 *   fetchCompanyData(userType);
 * }
 * ```
 */
export function isCompanyUserType(
  userType: FormUserType | null | undefined
): userType is 'company' {
  return userType === 'company';
}

/**
 * Type guard to check if user type is 'consumer-vat'
 *
 * @param userType - User type to check
 * @returns true if userType is 'consumer-vat'
 */
export function isConsumerVatUserType(
  userType: FormUserType | null | undefined
): userType is 'consumer-vat' {
  return userType === 'consumer-vat';
}

/**
 * Type guard to check if user type is 'consumer'
 *
 * @param userType - User type to check
 * @returns true if userType is 'consumer'
 */
export function isConsumerUserType(
  userType: FormUserType | null | undefined
): userType is 'consumer' {
  return userType === 'consumer';
}
