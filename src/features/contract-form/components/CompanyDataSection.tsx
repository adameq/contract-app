/**
 * Company Data Section Component
 *
 * ⚠️ **DESIGNED FOR USER TYPE 'company'** ⚠️
 *
 * This component should ONLY be rendered when `userType === 'company'`.
 * It is specifically designed for users who run a registered business/organization
 * and need to provide full company data fetched from Polish business registries.
 *
 * **Component characteristics**:
 * - Accepts `userType` as prop (passed from parent context)
 * - Uses company-specific GUS API integration
 * - Fetches full company data (name, REGON, KRS, address)
 * - Designed for company validation logic
 *
 * **For other user types, use**:
 * - `userType === 'consumer-vat'` → `ConsumerVatDataSection` (only NIP, no API)
 * - `userType === 'consumer'` → `ConsumerSection` (no company data)
 *
 * ## Architecture
 *
 * **Single FormProvider** (V2 Architecture):
 * ```tsx
 * <FormProvider<FinalContractData>>
 *   {userType === 'company' && (
 *     <CompanyDataSection userType={userType} />
 *   )}
 * </FormProvider>
 * // Field paths: company.nip, company.name, company.regon, etc.
 * ```
 *
 * Key features:
 * - Full GUS API integration (useCompanyQuery)
 * - Edit mode for manual data corrections
 * - NIP input with validation
 * - Fetch button to load data from Polish business registries
 * - All company fields (name, NIP, REGON, KRS, address)
 *
 * ARCHITECTURAL NOTES:
 * - Works with FinalContractData (Single FormProvider pattern)
 * - Receives userType as prop (not hardcoded)
 * - No discriminated unions
 * - Type-safe field paths via required fieldPathPrefix prop
 * - Natural cleanup on unmount via key-based mounting
 */

import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { CompanyDataSkeleton } from '@/shared/components/async/LoadingSkeletons';
import { cn } from '@/shared/lib/utils';

import { useCompanyFormUpdate } from '../hooks/useCompanyFormUpdate';
import { useCompanyQuery } from '../hooks/useCompanyQuery';
import { useCompanyValidationSync } from '../hooks/useCompanyValidationSync';
import { useEditMode } from '../hooks/useEditMode';
import { useNipChangeCleanup } from '../hooks/useNipChangeCleanup';
import type { FinalContractData } from '../schema/companySchemas';
import { FORM_PATHS } from '../utils/formPaths';
import { CompanyDataErrorWithEdit } from './company-data';
import { CompanyFields } from './CompanyFields';
import { getCompanyFieldsState } from './CompanyFields/types';
import { NipActionButton } from './NipActionButton';
import { NipInputSection } from './NipInputSection';

interface CompanyDataSectionProps {
  className?: string;
  /**
   * User type must be 'company' (enforced by TypeScript)
   * This component is exclusively designed for company users who need
   * full company data fetched from Polish business registries.
   */
  userType: 'company';
}

/**
 * Company Data Section with React Query
 *
 * Works with FinalContractData in Single FormProvider architecture.
 *
 * - No userType switching (always 'company')
 * - Type-safe field paths via FORM_PATHS constants
 * - Always shows all company fields
 *
 * NIP State Management:
 * - NIP is watched reactively via useWatch
 * - React Query's query key updates automatically with fresh NIP
 * - NipActionButton also watches NIP for button state
 */
export function CompanyDataSection({
  className,
  userType,
}: CompanyDataSectionProps) {
  // Access form context - FinalContractData (Single FormProvider pattern)
  const formMethods = useFormContext<FinalContractData>();
  const { control, getFieldState, formState } = formMethods;

  // Hook for updating form with company data (eliminates prop drilling)
  const { updateCompanyData } = useCompanyFormUpdate();

  // ===========================
  // useWatch Subscriptions
  // ===========================

  // Watch NIP value - ensures React Query always has fresh value
  // ARCHITECTURAL DECISION: Single NIP subscription in parent
  // - Ensures useCompanyQuery query key is always up-to-date
  // - Prevents stale NIP in validation layers (enabled flag, queryFn)
  // - Passes NIP and validation state as props to NipActionButton
  //
  // TYPE SAFETY: nipFieldSchema uses .catch('') to guarantee string type
  // - No defensive ?? '' syntax needed
  // - Schema-level guarantee ensures NIP is always string
  const nip = useWatch({
    control,
    name: FORM_PATHS.COMPANY.NIP,
    defaultValue: '',
  });

  // ✅ PERFORMANCE OPTIMIZATION: No company object watch needed
  // CompanyFields manages its own granular subscriptions to individual fields
  // This prevents parent re-renders on every keystroke in company fields

  // Get NIP field validation state for NipActionButton
  const nipFieldState = getFieldState(FORM_PATHS.COMPANY.NIP, formState);
  const nipIsValid = !nipFieldState.error && !!nip;

  // ===========================
  // React Query Integration
  // ===========================

  // React Query hooks - data fetching only when refetch() is called
  // Query key updates automatically when nip changes (reactive)
  //
  // userType is passed as prop from parent component
  // ⚠️ Component is designed specifically for userType='company'
  // For other user types:
  // - 'consumer-vat' → use ConsumerVatDataSection
  // - 'consumer' → use ConsumerSection
  //
  // TYPE SAFETY: Schema guarantees nip is always string (nipFieldSchema.catch(''))
  // - No defensive syntax needed
  // - Component receives guaranteed string type from useWatch
  const companyQuery = useCompanyQuery(nip, userType, {
    enabled: false,
  });

  // Synchronize React Query results with validation store
  // This explicit synchronization makes data flow visible and testable
  // TYPE SAFETY: nip is guaranteed to be string by schema
  useCompanyValidationSync(nip, companyQuery.data, companyQuery.isSuccess);

  // Clear all company fields when NIP changes (prevents data integrity bug)
  // Ensures user cannot have mismatched NIP with old company data
  useNipChangeCleanup(nip, userType, formMethods);

  // Use simplified state management - only manages edit mode
  // Set "Edytowane ręcznie [data]" when entering edit mode
  const { state, actions } = useEditMode({
    onEnterEditMode: () => {
      const currentDate = new Date().toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      formMethods.setValue('company.registrySignature', `Edytowane ręcznie ${currentDate}`, {
        shouldDirty: true,
        shouldTouch: true,
      });
    },
  });

  // Loading state
  const isLoading = companyQuery.isLoading;

  // Extract stable refetch function from React Query hook
  // This is a stable reference guaranteed by React Query - no useCallback needed
  const { refetch: refetchCompany } = companyQuery;

  /**
   * Fetches full company data from GUS API
   *
   * Business logic:
   * - Fetches company data via GUS API
   * - Populates form ONLY if company is active
   * - Exits edit mode ONLY if fetch succeeded
   * - Inactive companies show error state (no form update, edit mode preserved)
   *
   * ✅ STABLE: Wrapped in useCallback for stable reference
   * All deps are stable (refetchCompany from React Query, updateCompanyData from hook, actions from useEditMode)
   * Enables React.memo optimization in child components
   */
  const fetchFullCompanyData = useCallback(async () => {
    const companyResult = await refetchCompany();

    // Direct form update ONLY if fetch succeeded AND company is active
    if (companyResult.isSuccess && companyResult.data?.isActive) {
      updateCompanyData(companyResult.data, { preserveUserEdits: false });
      // Exit edit mode only after successful fetch and form update
      actions.exitEditMode();
    }
    // If company is not active or fetch failed, we don't populate the form and preserve edit mode
    // User will see error message and can retry
  }, [refetchCompany, updateCompanyData, actions]);

  /**
   * Main fetch handler - fetches company data from GUS API
   *
   * ✅ STABLE CALLBACK: Used directly in NipInputSection onEnterPress
   * Used in NipActionButton onAction
   *
   * Edit mode is managed inside fetchFullCompanyData - exits only on success
   */
  const handleFetchData = useCallback(async () => {
    // Fetch company data (edit mode handled internally)
    await fetchFullCompanyData();
  }, [fetchFullCompanyData]);

  /**
   * Synchronous wrapper for Enter key press handler
   *
   * Fire-and-forget: Errors are handled declaratively by React Query error state.
   * This wrapper satisfies TypeScript's () => void signature requirement.
   */
  const handleEnterPress = useCallback(() => {
    void handleFetchData();
  }, [handleFetchData]);

  /**
   * Synchronous wrapper for retry button handler
   *
   * Fire-and-forget: Errors are handled declaratively by React Query error state.
   * This wrapper satisfies TypeScript's () => void signature requirement.
   */
  const handleRetry = useCallback(() => {
    void companyQuery.refetch();
  }, [companyQuery]);

  /**
   * Handle restoring company data from React Query state
   *
   * ✅ STABLE CALLBACK: All dependencies are stable references
   *
   * Despite appearing in deps array, these are guaranteed stable by their libraries:
   * - companyQuery.data: Stable reference from React Query (only changes when query succeeds)
   * - updateCompanyData: Stable from useCompanyFormUpdate (memoized)
   * - actions: Stable from useEditMode (memoized object)
   *
   * Uses data from useCompanyQuery hook instead of imperative cache access.
   */
  const handleRestoreCompanyData = useCallback(() => {
    // Get data from React Query hook state (declarative approach)
    const companyData = companyQuery.data;

    // Only restore if company data exists AND company is active
    if (companyData?.isActive) {
      updateCompanyData(companyData, { preserveUserEdits: false });
      actions.exitEditMode();
    }
  }, [companyQuery.data, updateCompanyData, actions]);

  // Prepare CompanyFields props based on state
  // IMPORTANT: Must be calculated BEFORE early return to maintain hook order
  //
  // Defense-in-depth: Default isActive to false (inactive) if API contract violated
  // - TypeScript contract: isActive is required boolean (not optional)
  // - If somehow undefined: fail-safe by showing error state immediately
  // - Better UX: immediate error feedback vs delayed block at submission
  const companyFieldsState = getCompanyFieldsState(
    companyQuery.isLoading,
    !!companyQuery.data,
    state.isEditMode,
    Boolean(companyQuery.data?.isActive)
  );
  const shouldAllowEdit = companyFieldsState === 'populated';

  // Check if data exists for restore functionality
  // React Query garbage collects cache after DEFAULT_GC_TIME (10 minutes)
  // If data is unavailable, restore operation would silently fail
  // Solution: Check data state from hook and disable restore button when missing
  const hasCacheData = companyQuery.isSuccess && !!companyQuery.data;
  const shouldAllowRestore = companyFieldsState === 'edit-mode' && hasCacheData;

  return (
    <section
      className={cn('w-full max-w-7xl mx-auto p-6', className)}
      id="company-data-section"
      aria-labelledby="company-data-heading"
    >
      <div className="space-y-6">
        {/* Section title */}
        <h2
          id="company-data-heading"
          className="text-xl sm:text-2xl font-semibold text-foreground"
        >
          Dane podatkowe / firmowe
        </h2>

        {/* NIP Input with fetch button */}
        <div className="flex flex-col md:flex-row md:items-start md:gap-3">
          <div className="flex-1">
            {/*
              UX DECISION: Enter key in NIP input triggers data fetch

              Why Enable Enter action:
              - Standard form UX: Enter triggers primary action associated with field
              - Better keyboard accessibility: no need to tab to fetch button
              - Clear primary action: "Pobierz dane z GUS" is the expected next step
              - Consistent with user expectations in data-entry forms

              Note on consistency:
              - CompanyDataSection: Enter triggers fetch (clear action exists)
              - ConsumerVatDataSection: Enter does nothing (no action to trigger)
              - Inconsistency is intentional and context-appropriate

              Navigation alternatives:
              - Ctrl/Cmd + Enter: Navigate to next step (global keyboard shortcut)
              - Tab: Move focus to next interactive element (alternative to Enter)
            */}
            <NipInputSection
              nipFieldName={FORM_PATHS.COMPANY.NIP}
              onEnterPress={handleEnterPress}
            />
          </div>

          {/*
            Fetch button - triggers GUS API data fetch

            userType passed from parent props (component context)
            NipActionButton shows "Pobierz dane z GUS" text based on this userType.
          */}
          <div className="mt-4 md:mt-0 md:pt-[1.375rem]">
            <NipActionButton
              userType={userType}
              nipIsValid={nipIsValid}
              isLoading={isLoading}
              onAction={handleFetchData}
              className="w-full md:w-auto"
            />
          </div>
        </div>

        {/* Company fields - always visible for company userType */}

        {/* Loading state - show skeleton */}
        {companyQuery.isLoading && (
          <CompanyDataSkeleton showProgressIndicator={true} />
        )}

        {/* Error state - show error with retry option */}
        {companyQuery.error && !companyQuery.isLoading && (
          <CompanyDataErrorWithEdit
            error={companyQuery.error}
            nip={nip}
            onRetry={handleRetry}
            className="space-y-6"
          />
        )}

        {/* Always render CompanyFields (handles both disabled and populated states) */}
        {!companyQuery.isLoading && !companyQuery.error && (
          <CompanyFields
            state={companyFieldsState}
            nip={nip}
            onEditRequest={actions.enterEditMode}
            onRestoreRequest={handleRestoreCompanyData}
            canEdit={shouldAllowEdit}
            canRestore={shouldAllowRestore}
            companyApiState={companyQuery.data}
            className="space-y-6"
          />
        )}
      </div>
    </section>
  );
}
