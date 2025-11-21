import {
  buildPEPValidationPath,
  getPEPDataBySection,
  getPEPFlagBySection,
  type PEPSectionConfig,
} from '../config/pepConfig';
import type { PEPDeclarations } from '../schema/sharedSchema';

/**
 * Utility functions for configuration-driven PEP validation with type-safe paths
 *
 * ✅ SIMPLIFIED: All logic moved to unified pepConfig.ts
 * ✅ SINGLE SOURCE OF TRUTH: pepConfig.ts contains all PEP metadata
 * ✅ TYPE-SAFE: Field names derived from config with type checking
 * ✅ MAINTAINABLE: Renaming schema fields only requires updating schema + config
 *
 * @see src/features/contract-form/config/pepConfig.ts - Single source of truth
 * @see src/features/contract-form/schema/sharedSchema.ts - PEPDeclarations schema definition
 */

/**
 * Type-safe helper to get section data by configuration from pepDeclarations
 * Re-exported from pepConfig for backward compatibility
 *
 * @deprecated Import directly from config/pepConfig.ts instead
 */
export function getSectionDataByConfig(
  pepDeclarations: PEPDeclarations,
  config: PEPSectionConfig
):
  | PEPDeclarations['personalData']
  | PEPDeclarations['familyData']
  | PEPDeclarations['coworkerData']
  | undefined {
  return getPEPDataBySection(pepDeclarations, config.id);
}

/**
 * Helper to build validation path for Zod error reporting
 * Re-exported from pepConfig for backward compatibility
 *
 * @deprecated Import directly from config/pepConfig.ts instead
 */
export function buildValidationPath(
  config: PEPSectionConfig,
  fieldName: string
): string[] {
  return buildPEPValidationPath(config.id, fieldName);
}

/**
 * Type guard to check if a field is required
 *
 * ✅ EXPLICIT VALIDATION: Only fields with explicit required: true are required
 * This eliminates magic default behavior and forces developers to consciously
 * declare field requirements in the configuration.
 *
 * @param field - Field configuration with required flag
 * @returns boolean indicating if field is required
 */
export function isFieldRequired(field: {
  required: boolean;
  label: string;
}): boolean {
  // ✅ EXPLICIT ONLY: Field is required only when explicitly declared as required: true
  // This prevents accidental required fields and makes configuration self-documenting
  return field.required === true;
}

/**
 * ✅ CONFIG-DRIVEN: Check PEP section completeness using pepDeclarations data
 * Uses unified pepConfig for all field access
 */
export function checkPEPSectionCompleteness(
  config: PEPSectionConfig,
  pepDeclarations: PEPDeclarations | null | undefined
): boolean {
  // Handle null/undefined pepDeclarations
  if (!pepDeclarations) return false;

  // ✅ CONFIG-DRIVEN: Get the PEP flag value using pepConfig helper
  const isPep = getPEPFlagBySection(pepDeclarations, config.id);

  // If user selected "NO", section is complete
  if (isPep === false) return true;

  // If user selected "YES", check if all fields are filled
  if (isPep === true) {
    // ✅ CONFIG-DRIVEN: Get section data using pepConfig helper
    const sectionData = getPEPDataBySection(pepDeclarations, config.id);

    if (!sectionData) return false;

    // Check if all configured fields have non-empty values
    return config.fields.every(field => {
      const value = (sectionData as Record<string, unknown>)[field.name];
      return typeof value === 'string' ? value.trim().length > 0 : !!value;
    });
  }

  // If neither true nor false (null/undefined), section is incomplete
  return false;
}
