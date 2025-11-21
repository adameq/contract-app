import { TypedFormField } from '@/shared/components/common';
import { Input } from '@/shared/components/ui/input';
import { PhoneInput } from '@/shared/components/ui/phone-input';

import type { FinalContractData } from '../schema/companySchemas';
import { FORM_PATHS } from '../utils/formPaths';

/**
 * ContactDataSection component for phone and email input fields.
 */
export function ContactDataSection() {
  return (
    <section
      className="w-full max-w-7xl mx-auto p-6"
      id="contact-data-section"
      aria-labelledby="contact-data-heading"
    >
      <div className="space-y-6">
        {/* Section title */}
        <h2
          id="contact-data-heading"
          className="text-xl sm:text-2xl font-semibold text-foreground"
        >
          Dane kontaktowe
        </h2>

        {/* Contact form grid - back to 2 columns with phone + email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Phone Field */}
          <TypedFormField<
            FinalContractData,
            typeof FORM_PATHS.PERSONAL_DATA.PHONE_NUMBER
          >
            name={FORM_PATHS.PERSONAL_DATA.PHONE_NUMBER}
            label="Numer telefonu komórkowego"
            required
            validation={{ showSuccessIcon: true }}
          >
            {({ field, validation, id, fieldState: _, ...ariaProps }) => (
              <PhoneInput {...field} {...ariaProps} id={id} {...validation} />
            )}
          </TypedFormField>

          {/* Email Field */}
          <TypedFormField<
            FinalContractData,
            typeof FORM_PATHS.PERSONAL_DATA.EMAIL
          >
            name={FORM_PATHS.PERSONAL_DATA.EMAIL}
            label="Adres e-mail"
            required
            validation={{ showSuccessIcon: true }}
          >
            {({ field, validation, id, fieldState: _, ...ariaProps }) => (
              <Input
                {...field}
                {...ariaProps}
                id={id}
                type="email"
                placeholder="example@domain.com"
                {...validation}
              />
            )}
          </TypedFormField>
        </div>
      </div>
    </section>
  );
}
