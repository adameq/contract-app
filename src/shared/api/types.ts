/**
 * Shared API types
 *
 * Common types used across API modules
 */

/**
 * CEIDG Status types
 */
export type CeidgStatus =
  | 'AKTYWNY'
  | 'WYKRESLONY'
  | 'ZAWIESZONY'
  | 'OCZEKUJE_NA_ROZPOCZECIE_DZIALANOSCI'
  | 'WYLACZNIE_W_FORMIE_SPOLKI';

/**
 * Company data source types
 */
export type CompanyDataSource = 'CEIDG' | 'KRS' | 'GUS';

/**
 * Company data from various APIs (CEIDG, KRS, GUS)
 */
export interface CompanyData {
  name: string;
  nip: string;
  regon: string;
  status: CeidgStatus;
  isActive: boolean;
  address: {
    street: string;
    buildingNumber: string;
    apartmentNumber?: string;
    city: string;
    postalCode: string;
    wojewodztwo?: string;
    powiat?: string;
    gmina?: string;
  };
  registrySignature: string; // Official registry signature for legal evidence
  // Additional fields for different sources
  krs?: string;
  displayType?: string;
  formaWlasnosci?: string;
  source?: CompanyDataSource; // Source of the data
}

/**
 * GUS API Types
 */
export type BusinessFormType =
  | 'spółka'
  | 'stowarzyszenie'
  | 'jednoosobowa_dzialalnosc';
export type DisplayType =
  | 'spółki'
  | 'stowarzyszenia'
  | 'jednoosobowej działalności gospodarczej';

export interface RegisteredAddress {
  miejscowosc: string;
  kodPocztowy: string;
  ulica: string;
  numerNieruchomosci: string;
  numerLokalu?: string;
}

/**
 * Company data from GUS API (new format)
 */
export interface GusCompanyData {
  regon: string;
  nazwa: string;
  adresRejestrowy: RegisteredAddress;
  krs?: string;
  formaWlasnosci: BusinessFormType;
  displayType: DisplayType;
  czyAktywny: boolean;
  sourceInfo: {
    typ: 'P' | 'F';
    formaPrawna?: string;
    hasKrs: boolean;
  };
}

/**
 * VAT status data from white list API
 * Used for consumer-vat user type to verify NIP on Polish VAT white list
 */
export interface VatStatusData {
  nip: string;
  status: 'AKTYWNY' | 'NIEAKTYWNY';
  verificationDate?: string;
}
