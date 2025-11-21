import { TypedFormField } from '@/shared/components/common';
import { Input } from '@/shared/components/ui/input';

import {
  getPEPDataFieldPath,
  getPEPFlagPath,
  type PEPSectionConfig,
} from '../config/pepConfig';
import { usePEPSectionState } from '../hooks/usePEPState';
import type { FinalContractData } from '../schema/companySchemas';
import { PEPQuestion } from './PEPQuestion';

interface PEPSectionProps {
  config: PEPSectionConfig;
}

/**
 * ✅ FULLY GENERIC: PEP Section Component (TYPE-SAFE Enhanced)
 *
 * Eliminates code duplication across all PEP sections.
 * Uses configuration-driven approach with type-safe paths.
 *
 * TYPE-SAFE IMPROVEMENTS IMPLEMENTED:
 * - Type-safe path builders eliminate dangerous casting
 * - Centralized state management with usePEPSectionState hook
 * - Single source of truth for completeness calculation
 * - Eliminates duplicate useWatch calls
 *
 * Single source of truth for PEP section structure and behavior.
 */
export function PEPSection({ config }: PEPSectionProps) {
  // ✅ CENTRALIZED STATE: Single hook for all PEP section state
  // Hook now calculates status (Single Source of Truth)
  const { status } = usePEPSectionState(config.id);

  return (
    <PEPQuestion
      title={config.title}
      icon={config.icon}
      isPepFlagField={getPEPFlagPath(config.id)}
      status={status}
      dialog={config.dialog}
    >
      {/* Form fields - PEPQuestion handles conditional rendering based on flag value */}
      <div className="mt-6 space-y-4">
        {/* ✅ PRD IMPROVEMENT: Use gridColumns config for flexible layouts */}
        <div
          className={
            config.gridColumns === 2
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
              : 'grid grid-cols-1 gap-4'
          }
        >
          {/* ✅ TYPE-SAFE: Field rendering using type-safe path builders */}
          {config.fields.map(field => {
            const fieldPath = getPEPDataFieldPath(config.id, field.name);
            return (
              <TypedFormField<FinalContractData, typeof fieldPath>
                key={field.name}
                name={fieldPath}
                label={field.label}
                validation={{ showSuccessIcon: true }}
              >
                {({
                  field: formField,
                  validation,
                  id,
                  fieldState: _,
                  ...ariaProps
                }) => (
                  <Input
                    {...formField}
                    {...ariaProps}
                    id={id}
                    placeholder={field.placeholder}
                    {...validation}
                  />
                )}
              </TypedFormField>
            );
          })}
        </div>
      </div>
    </PEPQuestion>
  );
}
