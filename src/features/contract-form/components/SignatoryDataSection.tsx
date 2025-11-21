import { NameFields } from './NameFields';
import { PeselFieldGroup } from './PeselFieldGroup';

/**
 * SignatoryDataSection Component
 *
 * Optimized component that renders signatory data fields without reactive state.
 * Uses isolated child components (PeselFieldGroup and NameFields) to prevent
 * unnecessary re-renders.
 *
 * Performance: This component no longer uses useWatch, ensuring it doesn't
 * re-render when the "without PESEL" checkbox toggles.
 */
export function SignatoryDataSection() {
  return (
    <section
      className="w-full max-w-7xl mx-auto p-6"
      id="signatory-data-section"
      aria-labelledby="signatory-data-heading"
    >
      <div className="space-y-6">
        {/* Section title */}
        <h2
          id="signatory-data-heading"
          className="text-xl sm:text-2xl font-semibold text-foreground"
        >
          Dane podpisującego umowę
        </h2>

        {/* Signatory data form container with optimized components */}
        <div className="space-y-6">
          {/* Personal Data Subsection */}
          <div className="space-y-6">
            {/* Name fields first - logical order (basic personal data) */}
            <NameFields />

            {/* PESEL field and checkbox - isolated component with useWatch */}
            <PeselFieldGroup />
          </div>
        </div>
      </div>
    </section>
  );
}
