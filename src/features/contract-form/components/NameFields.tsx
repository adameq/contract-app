/**
 * NameFields Component
 *
 * Pure component that renders first name and last name input fields.
 * This component has no reactive dependencies and doesn't use useWatch,
 * ensuring it only re-renders when its props actually change.
 *
 * Performance optimization: Completely isolated from PESEL field changes,
 * preventing unnecessary re-renders when the "without PESEL" checkbox toggles.
 */

import React from 'react';

import { TypedFormField } from '@/shared/components/common';
import { Input } from '@/shared/components/ui/input';

import type { FinalContractData } from '../schema/companySchemas';
import { FORM_PATHS } from '../utils/formPaths';

/**
 * Component that renders first name and last name fields
 *
 * This is a pure presentation component with no reactive state.
 * It only re-renders when the actual field values change, not when
 * unrelated form state (like withoutPesel) changes.
 *
 * @example
 * ```tsx
 * <NameFields />
 * ```
 */
export function NameFields() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* First name */}
      <TypedFormField<
        FinalContractData,
        typeof FORM_PATHS.PERSONAL_DATA.FIRST_NAME
      >
        name={FORM_PATHS.PERSONAL_DATA.FIRST_NAME}
        label="Imię"
        required
        validation={{ showSuccessIcon: true }}
      >
        {({ field, validation, id, fieldState: _, ...ariaProps }) => (
          <Input
            {...field}
            {...ariaProps}
            id={id}
            placeholder="Wprowadź imię"
            {...validation}
          />
        )}
      </TypedFormField>

      {/* Last name */}
      <TypedFormField<
        FinalContractData,
        typeof FORM_PATHS.PERSONAL_DATA.LAST_NAME
      >
        name={FORM_PATHS.PERSONAL_DATA.LAST_NAME}
        label="Nazwisko"
        required
        validation={{ showSuccessIcon: true }}
      >
        {({ field, validation, id, fieldState: _, ...ariaProps }) => (
          <Input
            {...field}
            {...ariaProps}
            id={id}
            placeholder="Wprowadź nazwisko"
            {...validation}
          />
        )}
      </TypedFormField>
    </div>
  );
}

/**
 * Performance characteristics:
 * - No useWatch hooks - completely stable
 * - No props to compare - component only re-renders when parent re-renders
 * - Isolated from PESEL field and checkbox state changes
 * - No memoization needed for components without props
 */
