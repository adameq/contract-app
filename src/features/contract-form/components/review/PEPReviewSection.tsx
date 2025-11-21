/**
 * PEP Review Section (Step 4)
 *
 * Displays summary of PEP declarations (personal, family, coworker).
 * Memoized to prevent unnecessary re-renders when other form data changes.
 */

import React from 'react';
import type { FieldErrors } from 'react-hook-form';

import type { SharedFormData } from '../../schema/sharedSchema';
import { PEPDeclarationReview } from './PEPDeclarationReview';
import { ReviewSection } from './ReviewSection';

interface PEPReviewSectionProps {
  pepDeclarations: SharedFormData['pepDeclarations'];
  errors?: FieldErrors<SharedFormData>; // Validation errors from React Hook Form
}

export const PEPReviewSection = React.memo(function PEPReviewSection({
  pepDeclarations,
  errors,
}: PEPReviewSectionProps) {
  // Extract errors for PEP declarations
  const pepErrors = errors?.pepDeclarations;

  // Check if section has any errors
  const hasErrors = !!pepErrors && Object.keys(pepErrors).length > 0;

  return (
    <ReviewSection title="Deklaracje PEP" stepNumber={4} hasErrors={hasErrors}>
      <div className="space-y-4">
        <PEPDeclarationReview
          question="Czy jestem osobą PEP?"
          isPEP={pepDeclarations?.isPersonPEP ?? null}
          fields={[
            {
              label: 'Stanowisko/Funkcja',
              value: pepDeclarations?.personalData?.positionOrFunction,
            },
            {
              label: 'Nazwa instytucji',
              value: pepDeclarations?.personalData?.institutionName,
            },
          ]}
        />

        <PEPDeclarationReview
          question="Czy członek rodziny jest PEP?"
          isPEP={pepDeclarations?.isFamilyMemberPEP ?? null}
          fields={[
            {
              label: 'Imię i nazwisko członka rodziny',
              value: pepDeclarations?.familyData?.familyMemberPoliticianName,
            },
            {
              label: 'Stopień pokrewieństwa',
              value: pepDeclarations?.familyData?.familyMemberRelationshipType,
            },
            {
              label: 'Stanowisko',
              value: pepDeclarations?.familyData?.familyMemberPosition,
            },
            {
              label: 'Instytucja',
              value: pepDeclarations?.familyData?.familyMemberInstitution,
            },
          ]}
        />

        <PEPDeclarationReview
          question="Czy współpracownik jest PEP?"
          isPEP={pepDeclarations?.isCloseAssociatePEP ?? null}
          fields={[
            {
              label: 'Imię i nazwisko współpracownika',
              value: pepDeclarations?.coworkerData?.coworkerPoliticianName,
            },
            {
              label: 'Typ współpracy',
              value: pepDeclarations?.coworkerData?.coworkerCooperationType,
            },
            {
              label: 'Stanowisko/Funkcja',
              value: pepDeclarations?.coworkerData?.coworkerPositionOrFunction,
            },
            {
              label: 'Nazwa instytucji',
              value: pepDeclarations?.coworkerData?.coworkerInstitutionName,
            },
          ]}
        />
      </div>
    </ReviewSection>
  );
});

PEPReviewSection.displayName = 'PEPReviewSection';
