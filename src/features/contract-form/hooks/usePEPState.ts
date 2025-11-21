import { useFormContext, useWatch } from 'react-hook-form';

import {
  getPEPFlagPath,
  getPEPSectionPath,
  pepSectionsConfig,
} from '../config/pepConfig';
import type { SharedFormData } from '../schema/sharedSchema';
import { checkPEPSectionCompleteness } from '../utils/pepValidation';

/**
 * Custom hook for centralized PEP state management
 * Eliminates duplicate useWatch calls and provides single source of truth for PEP completeness
 */
export function usePEPState() {
  const { control } = useFormContext<SharedFormData>();

  // ✅ SINGLE SOURCE OF TRUTH: Single useWatch call for all PEP data
  const pepDeclarations = useWatch({
    control,
    name: 'pepDeclarations',
  });

  // ✅ CENTRALIZED LOGIC: Calculate completeness for all sections
  const completeness = pepSectionsConfig.reduce(
    (acc, sectionConfig) => {
      acc[sectionConfig.id] = checkPEPSectionCompleteness(
        sectionConfig,
        pepDeclarations
      );
      return acc;
    },
    {} as Record<'personal' | 'family' | 'coworker', boolean>
  );

  // ✅ NORMALIZED STATE: PEP flags in structured object
  const flags = {
    personal: pepDeclarations?.isPersonPEP ?? null,
    family: pepDeclarations?.isFamilyMemberPEP ?? null,
    coworker: pepDeclarations?.isCloseAssociatePEP ?? null,
  } as const;

  // ✅ DERIVED STATE: Clean, normalized structure
  return {
    // Raw PEP declarations data
    pepDeclarations,

    // Normalized completeness object (replaces individual isXComplete properties)
    completeness,

    // Normalized flags object (replaces individual isXPEP properties)
    flags,

    // Overall completeness
    isAllComplete: Object.values(completeness).every(Boolean),
  };
}

/**
 * Hook for individual PEP section state with granular subscriptions
 *
 * ✅ PERFORMANCE OPTIMIZED: Each section only subscribes to its own fields
 * This prevents unnecessary re-renders when other sections' data changes.
 *
 * Instead of watching entire pepDeclarations object (causing all 3 sections to re-render
 * on any change), we watch only the specific fields needed for this section.
 *
 * **GRANULAR SUBSCRIPTIONS**: Watches only section-specific flag and data fields
 * **SINGLE SOURCE OF TRUTH**: Calculates status here (not in component)
 *
 * @param sectionId - Which PEP section ('personal' | 'family' | 'coworker')
 */
export function usePEPSectionState(
  sectionId: 'personal' | 'family' | 'coworker'
) {
  const { control } = useFormContext<SharedFormData>();

  // ✅ CONFIG-DRIVEN: Use path builders from pepConfig (eliminates hardcoding)
  // ✅ GRANULAR SUBSCRIPTION: Watch only this section's flag field
  // This prevents re-render when other sections' flags change
  const flagPath = getPEPFlagPath(sectionId);

  const isPepFlagValue = useWatch({
    control,
    name: flagPath,
  });

  // ✅ CONFIG-DRIVEN: Use path builders from pepConfig (eliminates hardcoding)
  // ✅ GRANULAR SUBSCRIPTION: Watch only this section's data fields
  // This prevents re-render when other sections' data changes
  const dataPath = getPEPSectionPath(sectionId);

  const sectionData = useWatch({
    control,
    name: dataPath,
  });

  // Find the section config for completeness check
  const sectionConfig = pepSectionsConfig.find(
    config => config.id === sectionId
  );

  // ✅ CENTRALIZED LOGIC: Calculate completeness for this section only
  const isComplete = sectionConfig
    ? checkPEPSectionCompleteness(sectionConfig, {
        isPersonPEP: sectionId === 'personal' ? isPepFlagValue : null,
        isFamilyMemberPEP: sectionId === 'family' ? isPepFlagValue : null,
        isCloseAssociatePEP: sectionId === 'coworker' ? isPepFlagValue : null,
        personalData: sectionId === 'personal' ? sectionData : undefined,
        familyData: sectionId === 'family' ? sectionData : undefined,
        coworkerData: sectionId === 'coworker' ? sectionData : undefined,
      })
    : false;

  // ✅ CENTRALIZED LOGIC: Calculate status here (Single Source of Truth)
  // This eliminates the need for getStatus() in PEPQuestion component
  const status: 'complete' | 'in-progress' | 'incomplete' = isComplete
    ? 'complete'
    : isPepFlagValue === true
      ? 'in-progress'
      : 'incomplete';

  return {
    status,
    // Return only the data needed (not entire pepDeclarations object)
    pepFlagValue: isPepFlagValue,
    sectionData,
  };
}
