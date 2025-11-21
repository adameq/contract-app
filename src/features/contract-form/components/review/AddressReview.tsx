import type { FieldErrors } from 'react-hook-form';

import type { Address } from '../../schema/fieldSchemas';
import { DataRow } from './DataRow';

interface AddressReviewProps {
  address?: Address;
  errors?: FieldErrors<Address>; // Address field errors
}

export function AddressReview({ address, errors }: AddressReviewProps) {
  if (!address) return null;

  /**
   * Helper to safely extract field errors from RHF's FieldErrors<T>
   * Centralizes error extraction for better maintainability
   */
  function getFieldError(field: keyof Address) {
    if (!errors) return undefined;
    return errors[field];
  }

  return (
    <div className="space-y-1">
      <DataRow
        label="Ulica"
        value={address.street}
        error={getFieldError('street')}
      />
      <DataRow
        label="Nr budynku"
        value={address.buildingNumber}
        error={getFieldError('buildingNumber')}
      />
      <DataRow
        label="Nr lokalu"
        value={address.apartmentNumber}
        error={getFieldError('apartmentNumber')}
        optional
      />
      <DataRow
        label="Miasto"
        value={address.city}
        error={getFieldError('city')}
      />
      <DataRow
        label="Kod pocztowy"
        value={address.postalCode}
        error={getFieldError('postalCode')}
      />
    </div>
  );
}
