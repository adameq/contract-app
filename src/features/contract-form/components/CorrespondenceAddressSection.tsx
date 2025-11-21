import { AddressFields } from '@/shared/components/common/AddressFields';

import type { FinalContractData } from '../schema/companySchemas';
import { FORM_PATHS } from '../utils/formPaths';

export function CorrespondenceAddressSection() {
  return (
    <section
      className="w-full max-w-7xl mx-auto p-6"
      id="correspondence-address-section"
      aria-labelledby="correspondence-address-heading"
    >
      <div className="space-y-6">
        {/* Section title */}
        <h2
          id="correspondence-address-heading"
          className="text-xl sm:text-2xl font-semibold text-foreground"
        >
          Adres do korespondencji podpisującego umowę
        </h2>

        <AddressFields<FinalContractData>
          namePrefix={FORM_PATHS.CORRESPONDENCE.ADDRESS}
        />
      </div>
    </section>
  );
}
