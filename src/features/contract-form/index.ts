/**
 * Contract Form Feature - Public API
 *
 * This module exports form section components for the multi-step contract form.
 * The form uses discriminated unions based on user type for conditional rendering.
 *
 * ## User Type-Specific Components
 *
 * These components should ONLY be rendered for specific user types.
 * Each has JSDoc warnings and development-mode runtime guards to catch misuse.
 *
 * ### CompanyDataSection
 * - **User Type**: `company` ONLY
 * - **Purpose**: Full company data with GUS API integration
 * - **Features**: NIP fetch, all company fields, edit mode, inactive company validation
 * - **Usage**: `{userType === 'company' && <CompanyDataSection fieldPathPrefix="company" />}`
 * - **See**: src/features/contract-form/components/CompanyDataSection.tsx
 *
 * ### ConsumerVatDataSection
 * - **User Type**: `consumer-vat` ONLY
 * - **Purpose**: NIP input for VAT consumers (no company data)
 * - **Features**: NIP validation only, no API, no fetch button
 * - **Usage**: `{userType === 'consumer-vat' && <ConsumerVatDataSection fieldPathPrefix="company" />}`
 * - **See**: src/features/contract-form/components/ConsumerVatDataSection.tsx
 *
 * ## Shared Components
 *
 * These components work across all user types without restrictions:
 *
 * - **UserTypeSection**: User type selection (company/consumer-vat/consumer)
 * - **SignatureMethodSection**: Signature method selection
 * - **SignatoryDataSection**: Personal data (name, PESEL, birth date, etc.)
 * - **ContactDataSection**: Contact information (phone, email)
 * - **CorrespondenceAddressSection**: Correspondence address (if different from company)
 * - **PEPDeclarationSection**: PEP (Politically Exposed Person) declaration
 * - **PEPQuestion**: Reusable PEP question component
 *
 * ## Architecture Notes
 *
 * - **Single FormProvider**: All components work with FinalContractData context
 * - **Progressive API**: Components support fieldPathPrefix for nested paths
 * - **Discriminated Unions**: userType field determines data structure
 * - **Type Safety**: Development guards catch incorrect component usage
 *
 * @module features/contract-form
 */

// ============================================================================
// User Type-Specific Components (Conditional Rendering Required)
// ============================================================================

/**
 * Company data section with GUS API integration
 * ⚠️ FOR userType='company' ONLY
 */
export { CompanyDataSection } from './components/CompanyDataSection';

/**
 * Consumer-VAT data section (NIP only, no company data)
 * ⚠️ FOR userType='consumer-vat' ONLY
 */
export { ConsumerVatDataSection } from './components/ConsumerVatDataSection';

// ============================================================================
// Shared Components (All User Types)
// ============================================================================

/**
 * User type selection section
 */
export { UserTypeSection } from './components/UserTypeSection';

/**
 * Signature method selection section
 */
export { SignatureMethodSection } from './components/SignatureMethodSection';

/**
 * Signatory personal data section
 */
export { SignatoryDataSection } from './components/SignatoryDataSection';

/**
 * Contact information section
 */
export { ContactDataSection } from './components/ContactDataSection';

/**
 * Correspondence address section
 */
export { CorrespondenceAddressSection } from './components/CorrespondenceAddressSection';

/**
 * PEP (Politically Exposed Person) declaration section
 */
export { PEPDeclarationSection } from './components/PEPDeclarationSection';

/**
 * Reusable PEP question component
 */
export { PEPQuestion } from './components/PEPQuestion';
