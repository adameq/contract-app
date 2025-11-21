/**
 * Company Review Section (Step 5)
 *
 * Displays user type selection and company data (conditional on user type).
 * Memoized to prevent unnecessary re-renders when other form data changes.
 *
 * **Architecture Change:**
 * - BEFORE: Received ContractFormData['company'] (discriminated union type)
 * - AFTER: Receives CompanyFormData | ConsumerVatFormData | null from Zustand
 * - REASON: Separate FormProviders architecture - company data is in Zustand
 *
 * For 'consumer': Shows only user type (no additional data)
 * For 'consumer-vat': Shows user type + NIP (tax identification for VAT consumers)
 * For 'company': Shows user type + full company details (name, NIP, REGON, KRS, address)
 */

import React from 'react';
import type { FieldErrors } from 'react-hook-form';

import { getUserTypeLabel } from '@/shared/utils/optionHelpers';

import type {
  CompanyFormData,
  ConsumerVatFormData,
} from '../../schema/companySchemas';
import type { SharedFormData, UserType } from '../../schema/sharedSchema';
import { AddressReview } from './AddressReview';
import { DataRow } from './DataRow';
import { ReviewSection } from './ReviewSection';

interface CompanyReviewSectionProps {
  company: CompanyFormData | ConsumerVatFormData | null;
  userType: UserType;
  errors?: FieldErrors<CompanyFormData | ConsumerVatFormData>; // Company form validation errors from Zustand
  userTypeError?: SharedFormData['userType']; // User type validation error
}

export const CompanyReviewSection = React.memo(function CompanyReviewSection({
  company,
  userType,
  errors,
  userTypeError,
}: CompanyReviewSectionProps) {
  // Title varies based on user type
  const title =
    userType === 'consumer'
      ? 'Typ użytkownika'
      : userType === 'consumer-vat'
        ? 'Dane podatkowe'
        : 'Dane firmowe';

  // For consumer-vat, show only NIP (they're not a company, just need VAT identification)
  const isConsumerVat = userType === 'consumer-vat';
  const isConsumer = userType === 'consumer';

  // Check if section has any errors (including userType)
  const hasErrors =
    !!userTypeError || (!!errors && Object.keys(errors).length > 0);

  // Type guard: For consumer-vat, errors can only be ConsumerVatFormData errors (just nip)
  // For company, errors must be CompanyFormData errors (all fields)
  const companyErrors = isConsumerVat
    ? undefined
    : (errors as FieldErrors<CompanyFormData>);

  return (
    <ReviewSection title={title} stepNumber={5} hasErrors={hasErrors}>
      <div className="space-y-1">
        {/* User Type - always displayed for step 5 */}
        <DataRow
          label="Typ użytkownika"
          value={
            userType && userType !== 'none' ? getUserTypeLabel(userType) : null
          }
          error={userTypeError}
        />

        {/* Company data - only for non-consumer user types */}
        {!isConsumer && (
          <>
            {!isConsumerVat && (
              <DataRow
                label="Nazwa firmy"
                value={(company as CompanyFormData | null)?.name}
                error={companyErrors?.name}
              />
            )}
            <DataRow label="NIP" value={company?.nip} error={errors?.nip} />
            {!isConsumerVat && (
              <>
                <DataRow
                  label="REGON"
                  value={(company as CompanyFormData | null)?.regon}
                  error={companyErrors?.regon}
                />
                <DataRow
                  label="KRS"
                  value={(company as CompanyFormData | null)?.krs}
                  error={companyErrors?.krs}
                  optional
                />
                <AddressReview
                  address={(company as CompanyFormData | null)?.address}
                  errors={companyErrors?.address}
                />
              </>
            )}
          </>
        )}
      </div>
    </ReviewSection>
  );
});

CompanyReviewSection.displayName = 'CompanyReviewSection';
