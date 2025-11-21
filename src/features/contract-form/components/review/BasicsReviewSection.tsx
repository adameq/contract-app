/**
 * Basics Review Section (Step 1)
 *
 * Displays summary of signature method and user type selections.
 * Memoized to prevent unnecessary re-renders when other form data changes.
 */

import React from 'react';
import type { FieldErrors } from 'react-hook-form';

import { getSignatureMethodLabel } from '@/shared/utils/optionHelpers';

import type { SharedFormData } from '../../schema/sharedSchema';
import { DataRow } from './DataRow';
import { ReviewSection } from './ReviewSection';

interface BasicsReviewSectionProps {
  signatureMethod: SharedFormData['signatureMethod'];
  errors?: FieldErrors<SharedFormData>; // Validation errors from React Hook Form
}

export const BasicsReviewSection = React.memo(function BasicsReviewSection({
  signatureMethod,
  errors,
}: BasicsReviewSectionProps) {
  // Check if section has any errors
  const hasErrors = !!errors?.signatureMethod;

  return (
    <ReviewSection title="Podstawy" stepNumber={1} hasErrors={hasErrors}>
      <div className="space-y-1">
        <DataRow
          label="Sposób podpisania"
          value={
            signatureMethod ? getSignatureMethodLabel(signatureMethod) : null
          }
          error={errors?.signatureMethod}
        />
      </div>
    </ReviewSection>
  );
});

BasicsReviewSection.displayName = 'BasicsReviewSection';
