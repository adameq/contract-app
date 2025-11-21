/**
 * Form Step 6: Podsumowanie
 *
 * Review all form data and submit
 *
 * ## ARCHITECTURE
 *
 * **Single FormProvider Simplification**:
 * - Direct useFormContext access to complete FinalContractData
 * - Single formState.isValid covers all fields automatically
 * - Simple, direct field error access without aggregation
 * - No complex validation merging needed
 *
 * All form sections are reviewed with direct data access:
 * - Step 1: Signature method
 * - Step 2: Personal data (name, PESEL, phone, email)
 * - Step 3: Correspondence address
 * - Step 4: PEP declarations
 * - Step 5: User type and company data (company data conditional on user type)
 */

import { AlertCircle, Check } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';
import { useFormState, useWatch } from 'react-hook-form';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert';

import {
  AddressReviewSection,
  BasicsReviewSection,
  CompanyReviewSection,
  PEPReviewSection,
  PersonalDataReviewSection,
} from '../components/review';
import type {
  CompanyFormData,
  ConsumerVatFormData,
  FinalContractData,
} from '../schema/companySchemas';

/**
 * Extract company-specific errors from FinalContractData errors
 *
 * FinalContractData has nested 'company' object, so errors need to be
 * extracted for CompanyReviewSection to display correctly.
 *
 * @param errors - Complete form errors from FinalContractData
 * @returns Company-specific errors for review section
 */
function extractCompanyErrors(
  errors: FieldErrors<FinalContractData>
): FieldErrors<CompanyFormData | ConsumerVatFormData> {
  // If no company errors, return empty object
  if (!errors.company) {
    return {};
  }

  // Return the company errors directly
  // TypeScript will infer this correctly as FieldErrors for company fields
  return errors.company as FieldErrors<CompanyFormData | ConsumerVatFormData>;
}

/**
 * Form Step 6 Page Component
 *
 * Simplified review page using Single FormProvider architecture.
 * No aggregation hooks needed - direct access to complete form state.
 */
export default function FormStep6Page() {
  // ============================================================================
  // FORM STATE ACCESS
  // ============================================================================

  // Watch complete form data (reactive)
  // Type annotation ensures correct discrimination
  const formData = useWatch<FinalContractData>();

  // Get validation state (covers ALL fields including company data)
  const { isValid, errors } = useFormState<FinalContractData>();

  // Extract company data based on userType for review display
  // In Single FormProvider, this is just a simple property access
  const companyData =
    formData.userType === 'company' || formData.userType === 'consumer-vat'
      ? formData.company
      : null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Validation alert - show if form is invalid */}
      {!isValid && (
        <Alert
          variant="destructive"
          className="dark:border-red-700/50 dark:bg-red-950/40"
        >
          <AlertCircle className="h-4 w-4 dark:text-red-400" />
          <AlertTitle className="dark:text-red-100">
            Formularz jest prawie gotowy
          </AlertTitle>
          <AlertDescription className="dark:text-red-200/90">
            Prosimy o uzupełnienie brakujących pól oznaczonych na czerwono. Może
            Pan/Pani szybko wrócić do każdej sekcji, klikając przycisk
            &ldquo;Edytuj&rdquo;.
          </AlertDescription>
        </Alert>
      )}

      {/* Success indicator - show only if form is valid */}
      {isValid && (
        <Alert className="border-success/50 bg-success/10">
          <Check className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">
            Formularz wypełniony poprawnie
          </AlertTitle>
          <AlertDescription>
            Sprawdź poniższe dane i kliknij &ldquo;Wyślij formularz&rdquo; aby
            zakończyć proces.
          </AlertDescription>
        </Alert>
      )}

      <h2 className="text-2xl font-bold">
        Proszę sprawdzić czy wszystkie wprowadzone dane są poprawne.
      </h2>

      <div className="space-y-4">
        {/* Step 1: Podstawy */}
        <BasicsReviewSection
          signatureMethod={formData.signatureMethod}
          errors={errors}
        />

        {/* Step 2: Dane osobowe */}
        <PersonalDataReviewSection
          personalData={formData.personalData}
          errors={errors}
        />

        {/* Step 3: Adres korespondencyjny */}
        <AddressReviewSection
          correspondence={formData.correspondence}
          errors={errors}
        />

        {/* Step 4: Deklaracje PEP */}
        <PEPReviewSection
          pepDeclarations={formData.pepDeclarations}
          errors={errors}
        />

        {/* Step 5: User type and company data (always visible) */}
        <CompanyReviewSection
          company={companyData}
          userType={formData.userType}
          errors={extractCompanyErrors(errors)}
          userTypeError={errors.userType}
        />
      </div>

      {/* Final note */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Co się stanie po wysłaniu formularza?</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>
              Pana/Pani dane zostaną bezpiecznie zapisane w naszym systemie.
            </li>
            <li>
              Otrzyma Pan/Pani od nas wiadomość e-mail ze wszystkimi
              szczegółami.
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
