/**
 * PeselFieldGroup Component
 *
 * Isolated component that encapsulates PESEL input field and "without PESEL" checkbox.
 * This component uses useWatch internally to monitor the checkbox state, isolating
 * re-renders to just this component when the checkbox toggles.
 *
 * **Performance characteristics:**
 * - Uses useWatch hook to subscribe to 'personalData.withoutPesel' field
 * - Re-renders when checkbox state changes (as expected)
 * - Has no props, so React.memo would provide no benefit
 * - Optimization comes from hook isolation, not memoization
 * - Checkbox handler is stable (memoized in usePeselToggle hook)
 *
 * **Why no React.memo:**
 * Component has no props to compare, and it re-renders when form state changes
 * anyway due to useWatch hook. The performance benefit comes from isolating
 * the useWatch subscription to this component, not from preventing re-renders.
 */

import { useFormContext, useWatch } from 'react-hook-form';

import { TypedFormCheckbox, TypedFormField } from '@/shared/components/common';
import { PeselInput } from '@/shared/components/ui/pesel-input';

import { usePeselToggle } from '../hooks/usePeselToggle';
import type { FinalContractData } from '../schema/companySchemas';
import { FORM_PATHS } from '../utils/formPaths';

/**
 * Component that groups PESEL input with its toggle checkbox
 *
 * By isolating the useWatch hook here, we prevent the entire SignatoryDataSection
 * from re-rendering on every checkbox toggle - only this component re-renders.
 *
 * @example
 * ```tsx
 * <PeselFieldGroup />
 * ```
 */
export function PeselFieldGroup() {
  const { control } = useFormContext<FinalContractData>();
  const { handleWithoutPeselChange } = usePeselToggle();

  // Watch withoutPesel value - isolated to this component only
  const withoutPesel = useWatch({
    control,
    name: 'personalData.withoutPesel',
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
      {/* PESEL field - left column */}
      <TypedFormField<FinalContractData, typeof FORM_PATHS.PERSONAL_DATA.PESEL>
        name={FORM_PATHS.PERSONAL_DATA.PESEL}
        label="Numer PESEL"
        description="11-cyfrowy numer PESEL (tylko cyfry)"
        disabled={withoutPesel}
        rules={{
          required: !withoutPesel
            ? 'PESEL jest wymagany (lub zaznacz "Nie mam numeru PESEL")'
            : false,
        }}
        validation={{ showSuccessIcon: true }}
      >
        {({ field, validation, id, fieldState: _, ...ariaProps }) => (
          <PeselInput
            value={field.value}
            onValueChange={field.onChange}
            {...ariaProps}
            id={id}
            variant={withoutPesel ? 'disabled-muted' : 'default'}
            tabIndex={withoutPesel ? -1 : undefined}
            {...validation}
          />
        )}
      </TypedFormField>

      {/* Without PESEL checkbox - right column, aligned with PESEL input */}
      <TypedFormCheckbox<
        FinalContractData,
        typeof FORM_PATHS.PERSONAL_DATA.WITHOUT_PESEL
      >
        name={FORM_PATHS.PERSONAL_DATA.WITHOUT_PESEL}
        label="Nie mam numeru PESEL"
        description="Proszę zaznaczyć jeśli nie posiada Pan/Pani polskiego numeru PESEL"
        onCheckedChange={handleWithoutPeselChange}
        className="md:pt-6"
      />
    </div>
  );
}
