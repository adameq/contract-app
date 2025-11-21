/**
 * Centralized validation messages for the entire application
 *
 * This module provides:
 * - Consistent Polish validation messages
 * - Single source of truth for all error texts
 * - Type-safe message access
 * - Easy maintenance and updates
 */

export const VALIDATION_MESSAGES = {
  // Required field messages
  REQUIRED: {
    GENERIC: (field: string) => `${field} jest wymagane`,
    FIRST_NAME: 'Imię jest wymagane',
    LAST_NAME: 'Nazwisko jest wymagane',
    COMPANY_NAME: 'Nazwa firmy jest wymagana',
    STREET: 'Ulica jest wymagana',
    BUILDING_NUMBER: 'Numer domu jest wymagany',
    CITY: 'Miasto jest wymagane',
    PESEL: 'Numer PESEL jest wymagany',
    NIP: 'NIP jest wymagany',
    REGON: 'REGON jest wymagany',
    KRS: 'KRS jest wymagany',

    // PEP declaration fields
    PEP_POSITION: 'Stanowisko/funkcja jest wymagane',
    PEP_INSTITUTION: 'Nazwa instytucji jest wymagana',
    PEP_FAMILY_NAME: 'Imię i nazwisko członka rodziny jest wymagane',
    PEP_RELATIONSHIP: 'Stopień pokrewieństwa jest wymagany',
    PEP_FAMILY_POSITION: 'Stanowisko członka rodziny jest wymagane',
    PEP_FAMILY_INSTITUTION: 'Nazwa instytucji członka rodziny jest wymagana',
    PEP_COWORKER_NAME: 'Imię i nazwisko współpracownika jest wymagane',
    PEP_COOPERATION_TYPE: 'Rodzaj współpracy jest wymagany',
    PEP_COWORKER_POSITION: 'Stanowisko współpracownika jest wymagane',
    PEP_COWORKER_INSTITUTION: 'Nazwa instytucji współpracownika jest wymagana',

    // PEP flag selection messages
    PEP_PERSONAL_SELECTION: 'Wybierz odpowiedź dla oświadczenia osobistego PEP',
    PEP_FAMILY_SELECTION: 'Wybierz odpowiedź dla oświadczenia rodzinnego PEP',
    PEP_COWORKER_SELECTION:
      'Wybierz odpowiedź dla oświadczenia współpracowników PEP',

    PHONE: 'Numer telefonu jest wymagany',
  },

  // Format validation messages
  FORMAT: {
    EMAIL: 'Nieprawidłowy adres e-mail',
    PHONE: 'Nieprawidłowy numer telefonu',
    PHONE_TOO_SHORT: 'Numer telefonu jest za krótki',
    PHONE_TOO_LONG: 'Numer telefonu jest za długi',
    PHONE_INVALID_LENGTH: 'Nieprawidłowa długość numeru dla wybranego kraju',
    PHONE_INVALID_COUNTRY: 'Nieprawidłowy kod kraju',
    PHONE_NOT_A_NUMBER: 'To nie jest prawidłowy numer telefonu',
    POSTAL_CODE: 'Kod pocztowy musi składać się z 5 cyfr',
    INVALID_CHARACTERS: 'Pole może zawierać tylko cyfry',
    COMPANY_NAME_INVALID: 'Nazwa firmy zawiera niedozwolone znaki',
    STREET_INVALID: 'Ulica/miejscowość zawiera niedozwolone znaki',
    BUILDING_NUMBER_INVALID: 'Numer budynku zawiera niedozwolone znaki',
    CITY_INVALID: 'Miasto może zawierać tylko litery, spacje i myślniki',
    FIRST_NAME_INVALID:
      'Imię może zawierać tylko litery (w tym polskie znaki), spacje, myślniki i apostrofy',
    LAST_NAME_INVALID:
      'Nazwisko może zawierać tylko litery (w tym polskie znaki), spacje, myślniki i apostrofy',
    REGON_INVALID: 'REGON musi składać się z dokładnie 9 lub 14 cyfr',
    KRS_INVALID: 'KRS musi składać się z dokładnie 10 cyfr',
  },

  // Length validation messages
  LENGTH: {
    PESEL: 'PESEL musi składać się z dokładnie 11 cyfr',
    PESEL_TOO_SHORT: 'PESEL jest za krótki (wymagane 11 cyfr)',
    PESEL_TOO_LONG: 'PESEL jest za długi (maksymalnie 11 cyfr)',
    NIP: 'NIP musi składać się z dokładnie 10 cyfr',
    NIP_TOO_SHORT: 'NIP jest za krótki (wymagane 10 cyfr)',
    NIP_TOO_LONG: 'NIP jest za długi (maksymalnie 10 cyfr)',
    REGON: 'REGON musi składać się z dokładnie 9 lub 14 cyfr',
    KRS: 'KRS musi składać się z dokładnie 10 cyfr',
    POSTAL_CODE: 'Kod pocztowy musi składać się z 5 cyfr',
    COMPANY_NAME_MIN: 'Nazwa firmy musi mieć minimum 2 znaki',
    COMPANY_NAME_MAX: 'Nazwa firmy nie może przekraczać 200 znaków',
    STREET_MIN: 'Ulica/miejscowość musi mieć minimum 2 znaki',
    STREET_MAX: 'Ulica/miejscowość nie może przekraczać 100 znaków',
    BUILDING_NUMBER_MAX: 'Numer budynku nie może przekraczać 20 znaków',
    CITY_MIN: 'Miasto musi mieć minimum 2 znaki',
    CITY_MAX: 'Miasto nie może przekraczać 50 znaków',
    FIRST_NAME_MIN: 'Imię musi mieć minimum 2 znaki',
    FIRST_NAME_MAX: 'Imię nie może przekraczać 50 znaków',
    LAST_NAME_MIN: 'Nazwisko musi mieć minimum 2 znaki',
    LAST_NAME_MAX: 'Nazwisko nie może przekraczać 100 znaków',
  },

  // Business validation messages
  BUSINESS: {
    NIP_CHECKSUM: 'NIP ma nieprawidłową sumę kontrolną',
    NIP_ALL_ZEROS: 'NIP nie może składać się z samych zer',
    PESEL_CHECKSUM: 'Wpisany numer PESEL jest nieprawidłowy',
    REGON_CHECKSUM: 'REGON ma nieprawidłową sumę kontrolną',
    KRS_INVALID: 'KRS ma nieprawidłowy format',
    VAT_STATUS: 'Status VAT musi być sprawdzony i aktywny dla firm',
    CORRESPONDENCE_ADDRESS:
      'Wszystkie pola adresu korespondencyjnego są wymagane',
  },
} as const;

/**
 * Type for accessing validation messages
 */
export type ValidationMessagePath = keyof typeof VALIDATION_MESSAGES;

/**
 * Helper function to get validation message by path
 */
export const getValidationMessage = (
  category: keyof typeof VALIDATION_MESSAGES,
  key: string,
  ...args: string[]
): string => {
  const messageGroup = VALIDATION_MESSAGES[category] as Record<string, unknown>;
  const message = messageGroup[key];

  if (typeof message === 'function') {
    return (message as (...args: string[]) => string)(...args);
  }

  return (
    (message as string) ?? `Missing validation message: ${category}.${key}`
  );
};

/**
 * Convenience functions for common validation messages
 */
export const validationMessages = {
  required: (field: string) => VALIDATION_MESSAGES.REQUIRED.GENERIC(field),
  email: () => VALIDATION_MESSAGES.FORMAT.EMAIL,
  phone: () => VALIDATION_MESSAGES.FORMAT.PHONE,
  postalCode: () => VALIDATION_MESSAGES.FORMAT.POSTAL_CODE,
  pesel: () => VALIDATION_MESSAGES.LENGTH.PESEL,
  nip: () => VALIDATION_MESSAGES.LENGTH.NIP,
  regon: () => VALIDATION_MESSAGES.LENGTH.REGON,
  krs: () => VALIDATION_MESSAGES.LENGTH.KRS,
  nipChecksum: () => VALIDATION_MESSAGES.BUSINESS.NIP_CHECKSUM,
  peselChecksum: () => VALIDATION_MESSAGES.BUSINESS.PESEL_CHECKSUM,
  regonChecksum: () => VALIDATION_MESSAGES.BUSINESS.REGON_CHECKSUM,
  krsInvalid: () => VALIDATION_MESSAGES.BUSINESS.KRS_INVALID,
} as const;
