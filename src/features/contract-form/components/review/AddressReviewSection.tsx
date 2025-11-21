/**
 * Address Review Section (Step 3)
 *
 * Displays summary of correspondence address.
 * Memoized to prevent unnecessary re-renders when other form data changes.
 */

import React from 'react';
import type { FieldErrors } from 'react-hook-form';

import type { SharedFormData } from '../../schema/sharedSchema';
import { AddressReview } from './AddressReview';
import { ReviewSection } from './ReviewSection';

interface AddressReviewSectionProps {
  correspondence: SharedFormData['correspondence'];
  errors?: FieldErrors<SharedFormData>; // Validation errors from React Hook Form
}

export const AddressReviewSection = React.memo(function AddressReviewSection({
  correspondence,
  errors,
}: AddressReviewSectionProps) {
  // Extract errors for correspondence address fields
  const addressErrors = errors?.correspondence?.address;

  // Check if section has any errors
  const hasErrors = !!addressErrors && Object.keys(addressErrors).length > 0;

  return (
    <ReviewSection
      title="Adres korespondencyjny"
      stepNumber={3}
      hasErrors={hasErrors}
    >
      <AddressReview address={correspondence?.address} errors={addressErrors} />
    </ReviewSection>
  );
});

AddressReviewSection.displayName = 'AddressReviewSection';
