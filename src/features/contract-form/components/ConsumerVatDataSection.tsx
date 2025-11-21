/**
 * Consumer-VAT Data Section Component
 *
 * ⚠️ **FOR USER TYPE 'consumer-vat' ONLY** ⚠️
 *
 * This component should ONLY be rendered when `userType === 'consumer-vat'`.
 * It is specifically designed for private persons who have a NIP for VAT purposes
 * but do not run a registered business.
 *
 * **Why the restriction**:
 * - No GUS API integration (consumer-vat doesn't fetch company data)
 * - Only validates NIP format (frontend validation)
 * - No company fields (name, REGON, KRS, address) - just NIP
 * - NIP will be verified at final form submission for VAT whitelist
 *
 * **Key differences from CompanyDataSection**:
 * - ❌ NO fetch button (no API call)
 * - ❌ NO company data fields
 * - ❌ NO edit mode
 * - ✅ ONLY NIP input with frontend validation
 *
 * **For other user types, use**:
 * - `userType === 'company'` → `CompanyDataSection` (full company data with GUS)
 * - `userType === 'consumer'` → `ConsumerSection` (no company data at all)
 *
 * ## Architecture: Single FormProvider (V2)
 *
 * **Type Binding**: Explicitly uses `FinalContractData` (no generics)
 * - Component is tightly coupled to FinalContractData structure
 * - No false abstraction - clarity over unnecessary flexibility
 *
 * **Usage** (Nested Context):
 * ```tsx
 * <FormProvider<FinalContractData>>
 *   {userType === 'consumer-vat' && <ConsumerVatDataSection />}
 * </FormProvider>
 * // Field path: company.nip
 * ```
 *
 * ARCHITECTURAL NOTES:
 * - Much simpler than CompanyDataSection (no API, no edit mode, no complex fields)
 * - Works with Single FormProvider architecture (FinalContractData context)
 * - Uses FORM_PATHS constants for type-safe field paths
 * - No discriminated unions
 * - No async state management
 * - Just frontend NIP validation, nothing more
 */

import { cn } from '@/shared/lib/utils';

import type { FinalContractData } from '../schema/companySchemas';
import { FORM_PATHS } from '../utils/formPaths';
import { NipInputSection } from './NipInputSection';

interface ConsumerVatDataSectionProps {
  className?: string;
}

/**
 * Consumer-VAT Data Section
 *
 * Type-safe component for consumer-vat users (FinalContractData).
 *
 * Simple component with just NIP input for consumer-vat users.
 * No API calls, no company data, just frontend NIP validation.
 *
 * Business context:
 * - Consumer-vat users are private persons with NIP for VAT
 * - They don't run a business, so no company data needed
 * - NIP is required for VAT whitelist verification (handled at final submit)
 * - Frontend validation ensures correct NIP format (10 digits, checksum)
 */
export function ConsumerVatDataSection({
  className,
}: ConsumerVatDataSectionProps) {
  return (
    <section
      className={cn('w-full max-w-7xl mx-auto p-6', className)}
      id="consumer-vat-data-section"
      aria-labelledby="consumer-vat-data-heading"
    >
      <div className="space-y-6">
        {/* Section title */}
        <h2
          id="consumer-vat-data-heading"
          className="text-xl sm:text-2xl font-semibold text-foreground"
        >
          Dane podatkowe (Płatnik VAT)
        </h2>

        {/* NIP Input - no fetch button for consumer-vat */}
        <div className="flex-1">
          {/*
            UX DECISION: Enter key in NIP input has no action

            Why no Enter action:
            - Consumer-vat users only provide NIP (no API fetch needed)
            - Frontend validation happens automatically (Zod + React Hook Form)
            - No primary action to trigger - validation is automatic
            - NIP will be verified at final form submission (VAT whitelist check)

            Note on consistency:
            - ConsumerVatDataSection: Enter does nothing (no action exists)
            - CompanyDataSection: Enter triggers fetch (clear action exists)
            - Different behavior is appropriate for different contexts

            Navigation alternatives:
            - Ctrl/Cmd + Enter: Navigate to next step (global keyboard shortcut)
            - Tab: Move focus to next interactive element
          */}
          <NipInputSection<FinalContractData>
            nipFieldName={FORM_PATHS.COMPANY.NIP}
            onEnterPress={undefined}
          />
        </div>
      </div>
    </section>
  );
}
