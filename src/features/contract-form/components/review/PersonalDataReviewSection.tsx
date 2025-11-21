/**
 * Personal Data Review Section (Step 2)
 *
 * Displays summary of signatory and contact data.
 * Memoized to prevent unnecessary re-renders when other form data changes.
 */

import React from 'react';
import type { FieldErrors } from 'react-hook-form';

import type { SharedFormData } from '../../schema/sharedSchema';
import { DataRow } from './DataRow';
import { ReviewSection } from './ReviewSection';

interface PersonalDataReviewSectionProps {
  personalData: SharedFormData['personalData'];
  errors?: FieldErrors<SharedFormData>; // Validation errors from React Hook Form
}

export const PersonalDataReviewSection = React.memo(
  function PersonalDataReviewSection({
    personalData,
    errors,
  }: PersonalDataReviewSectionProps) {
    // Extract errors for personal data fields
    const personalDataErrors = errors?.personalData;

    // Check if section has any errors
    const hasErrors =
      !!personalDataErrors && Object.keys(personalDataErrors).length > 0;

    return (
      <ReviewSection title="Dane osobowe" stepNumber={2} hasErrors={hasErrors}>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Dane sygnatariusza</h3>
            <div className="space-y-1">
              <DataRow
                label="Imię"
                value={personalData?.firstName}
                error={personalDataErrors?.firstName}
              />
              <DataRow
                label="Nazwisko"
                value={personalData?.lastName}
                error={personalDataErrors?.lastName}
              />
              <DataRow
                label="PESEL"
                value={
                  personalData?.withoutPesel
                    ? 'Brak numeru PESEL'
                    : personalData?.pesel
                }
                error={personalDataErrors?.pesel}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Dane kontaktowe</h3>
            <div className="space-y-1">
              <DataRow
                label="Telefon"
                value={personalData?.phoneNumber}
                error={personalDataErrors?.phoneNumber}
              />
              <DataRow
                label="Email"
                value={personalData?.email}
                error={personalDataErrors?.email}
              />
            </div>
          </div>
        </div>
      </ReviewSection>
    );
  }
);

PersonalDataReviewSection.displayName = 'PersonalDataReviewSection';
