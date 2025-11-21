import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import { Input } from '@/shared/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';

/**
 * ⚠️ INTENTIONALLY LIMITED COUNTRY LIST ⚠️
 *
 * This list is deliberately restricted to EU countries + Poland's neighbors + select EFTA countries.
 * The limitation is by design for business/legal reasons, not a technical oversight.
 *
 * DO NOT expand this list without proper business approval and legal review.
 *
 * Includes:
 * - All 27 EU member countries
 * - Poland's direct neighbors (excluding Russia for obvious reasons)
 * - Select EFTA countries (Norway, Switzerland, Iceland, Liechtenstein)
 * - Turkey (strategic business partner)
 *
 * If you need to add countries, consult with business stakeholders first.
 */
const ALLOWED_COUNTRIES: RPNInput.Country[] = [
  // Kraje UE (27 krajów)
  'AT', // Austria
  'BE', // Belgia
  'BG', // Bułgaria
  'HR', // Chorwacja
  'CY', // Cypr
  'CZ', // Czechy
  'DK', // Dania
  'EE', // Estonia
  'FI', // Finlandia
  'FR', // Francja
  'DE', // Niemcy
  'GR', // Grecja
  'HU', // Węgry
  'IE', // Irlandia
  'IT', // Włochy
  'LV', // Łotwa
  'LT', // Litwa
  'LU', // Luksemburg
  'MT', // Malta
  'NL', // Holandia
  'PL', // Polska
  'PT', // Portugalia
  'RO', // Rumunia
  'SK', // Słowacja
  'SI', // Słowenia
  'ES', // Hiszpania
  'SE', // Szwecja

  // Sąsiedzi Polski (bez Rosji)
  'UA', // Ukraina
  'BY', // Białoruś

  // Dodatkowe kraje
  'TR', // Turcja
  'NO', // Norwegia (EFTA)
  'CH', // Szwajcaria (EFTA)
  'IS', // Islandia (EFTA)
  'LI', // Liechtenstein (EFTA)
];

// Preferowane kraje na górze listy (99% PL, 0.5% UA)
const PREFERRED_COUNTRIES: RPNInput.Country[] = ['PL', 'UA'];

interface PhoneInputProps
  extends Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> {
  onChange?: (value: RPNInput.Value) => void;
  // Input component specific props
  validationState?: 'default' | 'success' | 'error' | 'loading';
  showValidationIcon?: boolean;
  // Common input props that might be needed
  className?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  'aria-required'?: boolean | 'false' | 'true';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/**
 * Static flag component - memoized to prevent re-renders
 */
const FlagComponent = React.memo<RPNInput.FlagProps>(
  ({ country, countryName }) => {
    const Flag = flags[country];

    return (
      <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
        {Flag && <Flag title={countryName} />}
      </span>
    );
  }
);
FlagComponent.displayName = 'FlagComponent';

/**
 * Static input component - memoized to prevent re-renders
 * Uses our Input component with validation support
 *
 * Note: className applies to the wrapper (for flex-1 layout in RPNInput flexbox)
 * inputClassName would apply to the actual input element (if needed)
 */
const InputComponent = React.memo(
  React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
    ({ inputClassName, ...props }, ref) => (
      <Input
        className="flex-1"
        inputClassName={cn('rounded-e-lg rounded-s-none', inputClassName)}
        {...props}
        ref={ref}
      />
    )
  )
);
InputComponent.displayName = 'InputComponent';

/**
 * Country entry type for dropdown
 */
interface CountryEntry {
  label: string;
  value: RPNInput.Country | undefined;
}

interface CountrySelectProps {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
}

/**
 * Country select option component - memoized to prevent re-renders
 *
 * **Performance optimization**: Now effectively memoized using stable onChange from parent.
 *
 * Previously, memoization was ineffective due to unstable `onChange` from RPNInput library.
 * Now uses ref-based stable wrapper from CountrySelect, allowing all props to remain stable:
 * - `onChange` - stable via useCallback + ref pattern in CountrySelect
 * - `onSelectComplete` - stable via useCallback in CountrySelect
 * - `country`, `countryName`, `selectedCountry` - primitives (stable by default)
 *
 * This prevents unnecessary re-renders of ~35 country items when parent re-renders.
 */
const CountrySelectOption = React.memo<
  RPNInput.FlagProps & {
    selectedCountry: RPNInput.Country;
    onChange: (country: RPNInput.Country) => void;
    onSelectComplete: () => void;
  }
>(({ country, countryName, selectedCountry, onChange, onSelectComplete }) => {
  const handleSelect = () => {
    onChange(country);
    onSelectComplete();
  };

  return (
    <CommandItem className="gap-2 group" onSelect={handleSelect}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon
        className={cn(
          'ml-auto size-4',
          country === selectedCountry ? 'opacity-100' : 'opacity-0'
        )}
      />
    </CommandItem>
  );
});
CountrySelectOption.displayName = 'CountrySelectOption';

/**
 * Country select dropdown - memoized to prevent re-renders
 */
const CountrySelect = React.memo<CountrySelectProps>(
  ({ disabled, value: selectedCountry, options: countryList, onChange }) => {
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    const [searchValue, setSearchValue] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    // Stable onChange wrapper using ref pattern
    // This allows CountrySelectOption to be memoized effectively
    const onChangeRef = useRef(onChange);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const handleCountryChange = useCallback((country: RPNInput.Country) => {
      onChangeRef.current(country);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
      setSearchValue(value);
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const viewportElement = scrollAreaRef.current.querySelector(
            '[data-radix-scroll-area-viewport]'
          );
          if (viewportElement) {
            viewportElement.scrollTop = 0;
          }
        }
      }, 0);
    }, []);

    const handleSelectComplete = useCallback(() => {
      setIsOpen(false);
    }, []);

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen} modal>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10"
            disabled={disabled}
          >
            <FlagComponent
              country={selectedCountry}
              countryName={selectedCountry}
            />
            <ChevronsUpDown
              className={cn(
                '-mr-2 size-4 opacity-50',
                disabled ? 'hidden' : 'opacity-100'
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              value={searchValue}
              onValueChange={handleSearchChange}
              placeholder="Search country..."
            />
            <CommandList>
              <ScrollArea ref={scrollAreaRef} className="h-72">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countryList.map(({ value, label }) =>
                    value ? (
                      <CountrySelectOption
                        key={value}
                        country={value}
                        countryName={label}
                        selectedCountry={selectedCountry}
                        onChange={handleCountryChange}
                        onSelectComplete={handleSelectComplete}
                      />
                    ) : null
                  )}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
CountrySelect.displayName = 'CountrySelect';

/**
 * Ultra-optimized PhoneInput component with React.memo
 *
 * Key optimizations:
 * - All sub-components are memoized
 * - Uses Input component for consistent validation styling
 * - Stable function references using useCallback
 * - No duplicate relative divs - Input handles validation
 * - Minimal re-render dependencies
 */
export const PhoneInput = React.memo(
  React.forwardRef<
    React.ComponentRef<typeof RPNInput.default>,
    PhoneInputProps
  >(({ className, onChange, value, ...props }, ref) => {
    // Stable onChange handler
    const handleChange = useCallback(
      (value: RPNInput.Value) => {
        onChange?.(value || ('' as RPNInput.Value));
      },
      [onChange]
    );

    return (
      <RPNInput.default
        ref={ref}
        className={cn('flex', className)}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={InputComponent}
        smartCaret={false}
        defaultCountry="PL"
        countries={ALLOWED_COUNTRIES}
        countryOptionsOrder={PREFERRED_COUNTRIES}
        value={value ?? undefined}
        onChange={handleChange}
        {...props}
      />
    );
  })
);
PhoneInput.displayName = 'PhoneInput';
