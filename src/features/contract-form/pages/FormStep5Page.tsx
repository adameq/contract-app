/**
 * Form Step 5: Dane firmowe
 *
 * User selects their type (company, consumer-vat, consumer) and provides
 * company data conditionally based on the selected type.
 *
 * ## ARCHITECTURE
 *
 * **Single FormProvider (Clean)**:
 * - Main context manages FinalContractData (complete form state)
 * - UserTypeSection works directly with FinalContractData
 * - CompanyDataSection uses FORM_PATHS constants for type-safe field paths
 * - No sub-FormProviders needed - true Single FormProvider architecture
 */

import { useFormContext, useWatch } from 'react-hook-form';

import { CompanyDataSection } from '../components/CompanyDataSection';
import { ConsumerVatDataSection } from '../components/ConsumerVatDataSection';
import { UserTypeSection } from '../components/UserTypeSection';
import type { FinalContractData } from '../schema/companySchemas';

/**
 * Form Step 5 Page Component
 *
 * Clean Single FormProvider architecture:
 * - All sections work directly with FinalContractData
 * - CompanyDataSection uses fieldPathPrefix for nested paths
 * - No wrapper components or sub-FormProviders needed
 */
export default function FormStep5Page() {
  // Access main form context (FinalContractData)
  const { control } = useFormContext<FinalContractData>();

  // Watch userType to determine which section to render
  const userType = useWatch({ control, name: 'userType' });

  return (
    <div className="space-y-6">
      {/* UserTypeSection works with FinalContractData directly */}
      <UserTypeSection />

      {/*
        ===========================
        CONDITIONAL RENDERING LOGIC
        ===========================

        This section renders different data collection components based on the user's type.
        The form uses a discriminated union where `userType` determines the data structure.

        Each user type has different business requirements and data collection needs:

        ┌─────────────────┬──────────────┬──────────────────┬─────────────────────┐
        │ User Type       │ Component    │ GUS API          │ Fields Required     │
        ├─────────────────┼──────────────┼──────────────────┼─────────────────────┤
        │ company         │ CompanyData  │ ✅ Full fetch    │ All company data    │
        │ consumer-vat    │ ConsumerVat  │ ❌ None          │ Only NIP            │
        │ consumer        │ Consumer     │ ❌ None          │ None                │
        └─────────────────┴──────────────┴──────────────────┴─────────────────────┘
      */}

      {/*
        COMPANY USER TYPE (userType === 'company')

        **Business Context**:
        - User runs a registered business/organization
        - Requires full company data from Polish business registries
        - Subject to VAT regulations and company validation

        **Component**: CompanyDataSection
        **Features**:
        - ✅ Full GUS API integration (fetches data from CEIDG/KRS)
        - ✅ Fetch button to load company data automatically
        - ✅ Edit mode for manual data corrections
        - ✅ All company fields: name, NIP, REGON, KRS, full address
        - ✅ Inactive company validation (blocks inactive companies)
        - ✅ React Query caching for performance

        **Field Path Prefix**: "company"
        - Fields are stored in FinalContractData under 'company' key
        - Example paths: company.nip, company.name, company.address.street

        **Why CompanyDataSection?**:
        - Most complex user type with full data requirements
        - API integration needed for data accuracy
        - Edit mode allows corrections when API data is outdated

        **Key Prop**: Dynamic key includes userType to force remount on change
        - Example: key="company-company" ensures React detects userType switch
        - Ensures complete unmount/remount cycle with clean state initialization
        - Works in tandem with useUserTypeCleanup hook (useLayoutEffect)
      */}
      {userType === 'company' && (
        <CompanyDataSection key={`company-${userType}`} userType={userType} />
      )}

      {/*
        CONSUMER-VAT USER TYPE (userType === 'consumer-vat')

        **Business Context**:
        - Private person with NIP number for VAT purposes
        - NOT running a registered business
        - Needs NIP for VAT whitelist verification only

        **Component**: ConsumerVatDataSection
        **Features**:
        - ✅ NIP input with frontend validation (10 digits, checksum)
        - ❌ NO GUS API integration (no company data fetch)
        - ❌ NO fetch button (manual entry only)
        - ❌ NO edit mode (nothing to restore)
        - ❌ NO company fields (name, REGON, KRS, address)

        **Field Path Prefix**: "company"
        - Only company.nip is populated (reuses company structure)
        - Other company fields remain empty/undefined
        - NIP verified at final submission against VAT whitelist

        **Why ConsumerVatDataSection?**:
        - Simpler than CompanyDataSection (no API, no complex state)
        - Consumer-vat is distinct from company (no business data)
        - Frontend validation sufficient (backend verifies on submit)

        **Key Prop**: Dynamic key includes userType to force remount on change
        - Example: key="company-company" ensures React detects userType switch
        - Ensures complete unmount/remount cycle with clean state initialization
        - Works in tandem with useUserTypeCleanup hook (useLayoutEffect)
      */}
      {userType === 'consumer-vat' && (
        <ConsumerVatDataSection key={`consumer-vat-${userType}`} />
      )}

      {/*
        CONSUMER USER TYPE (userType === 'consumer')

        **Business Context**:
        - Regular consumer (private person)
        - No business, no VAT registration
        - Simplest data requirements

        **No Component Rendered**:
        - ❌ NO company data collection
        - ❌ NO NIP input
        - ❌ NO API integration
        - ❌ NO section displayed

        **Field Path**: None
        - No company fields populated
        - FinalContractData.company remains empty/undefined

        **Why nothing is rendered?**:
        - No data collection needed for regular consumers
        - Simplest user type with minimal requirements
        - No need to display empty section or informational message
      */}
    </div>
  );
}
