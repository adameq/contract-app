import { CheckCircle, HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useId, useMemo } from 'react';
import {
  Controller,
  type Path,
  type PathValue,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';

import type { PEPFlagPath } from '../config/pepConfig';
import type { SharedFormData } from '../schema/sharedSchema';
import { PEPFieldsContext } from './hooks/usePEPFieldsContext';
import {
  pepIconContainerVariants,
  pepRadioButtonVariants,
  pepSectionVariants,
  type PEPStatus,
} from './PEPQuestion.variants';

/**
 * String value constants for RadioGroupItem components
 * RadioGroup requires string values, but our form field is boolean | null
 */
const RADIO_VALUES = {
  TRUE: 'true',
  FALSE: 'false',
} as const;

/**
 * Converts boolean | null to string for RadioGroup
 * @param value - Form field value (boolean | null | undefined)
 * @returns String representation for RadioGroup ('true' | 'false' | '')
 */
const booleanToRadioValue = (value: boolean | null | undefined): string => {
  return value == null ? '' : String(value);
};

/**
 * Converts RadioGroup string value to boolean | null
 * @param value - RadioGroup value ('true' | 'false' | '')
 * @returns Boolean value for form field (true | false | null)
 */
const radioValueToBoolean = (value: string): boolean | null => {
  if (value === RADIO_VALUES.TRUE) return true;
  if (value === RADIO_VALUES.FALSE) return false;
  return null;
};

// Type helper to ensure only boolean | null paths are accepted
type BooleanFieldPath<T> = {
  [K in Path<T>]: PathValue<T, K> extends boolean | null ? K : never;
}[Path<T>];

interface PEPQuestionProps {
  // Konfiguracja pytania
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  dialog: {
    title: string;
    description: ReactNode;
    triggerLabel: string;
  };

  // Pole w React Hook Form, które odpowiada za status PEP (true/false/null)
  // Now uses React Hook Form's Path type for type safety
  isPepFlagField: BooleanFieldPath<SharedFormData> & PEPFlagPath;

  // Dodatkowe pola formularza (renderowane gdy wybrano "TAK")
  // Children have access to PEPFieldsContext via usePEPFieldsContext() hook
  // to optimize performance by skipping operations when fields are hidden
  children: ReactNode;

  // ✅ SIMPLIFIED API: Single source of truth for visual state
  // Calculated in usePEPSectionState hook (eliminates logic duplication)
  status: PEPStatus;
}

/**
 * Generyczny komponent PEPQuestion
 * Renderuje pojedynczy blok pytania PEP z logiką statusu, RadioGroup i opcjonalnymi polami
 * ✅ TYPE-SAFE: Eliminates duplicate useWatch calls by receiving state from parent
 * ✅ PURE COMPONENT: No business logic - status calculated in hook
 */
export function PEPQuestion({
  title,
  icon: IconComponent,
  dialog,
  isPepFlagField,
  children,
  status,
}: PEPQuestionProps) {
  const { control } = useFormContext<SharedFormData>();

  // Unikalne ID dla dostępności
  const fieldsetId = useId();
  const errorId = useId();
  const dialogDescriptionId = useId();

  // ✅ NO BUSINESS LOGIC: Status comes from hook (Single Source of Truth)

  // ✅ PERFORMANCE: Watch field value at component level for Provider
  // This allows us to create Provider outside Controller's render function
  const isPepValue = useWatch<SharedFormData>({
    control,
    name: isPepFlagField,
  });

  // ✅ PERFORMANCE: Memoize context value to prevent unnecessary re-renders
  // Only recreate when the actual field value changes
  const contextValue = useMemo(
    () => ({ isHidden: isPepValue !== true }),
    [isPepValue]
  );

  // ✅ CVA REFACTOR: Declarative styling with variants
  const iconContainerClassName = pepIconContainerVariants({
    status: status === 'complete' ? 'complete' : 'default',
  });

  const sectionClassName = pepSectionVariants({
    status: status === 'complete' ? 'complete' : 'default',
  });

  // ✅ CVA REFACTOR: Helper function for radio button styling
  const getButtonStyleClass = (
    isSelectedValue: boolean,
    currentValue: boolean | null | undefined
  ) => {
    return pepRadioButtonVariants({
      status: status === 'complete' ? 'complete' : 'default',
      selected: currentValue === isSelectedValue,
    });
  };

  // ✅ UX CONSISTENCY: Helper function for RadioGroupItem styling based on completion status
  const getRadioGroupItemClass = () => {
    return status === 'complete'
      ? 'text-success border-success [&_svg]:fill-success'
      : 'text-primary border-primary [&_svg]:fill-primary';
  };

  return (
    <div className={sectionClassName}>
      {/* Nagłówek sekcji z ikoną, tytułem i triggerem do modala */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 xl:gap-4">
          <div className={iconContainerClassName}>
            <IconComponent className="h-5 w-5 xl:h-6 xl:w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold leading-tight">
              <span className="break-words hyphens-auto">{title}</span>
            </h3>
          </div>

          {/* Wskaźnik ukończenia */}
          {status === 'complete' && (
            <div className="flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
          )}
        </div>

        {/* Button help pod tytułem */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="link"
              size="sm"
              className="min-h-11 p-2 text-xs sm:text-sm font-normal justify-start cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" />
              {dialog.triggerLabel}
            </Button>
          </DialogTrigger>
          <DialogContent
            className="flex flex-col max-h-[90vh] p-0 sm:max-w-md"
            aria-describedby={dialogDescriptionId}
          >
            <div className="p-4 sm:p-6 border-b border-border">
              <DialogHeader>
                <DialogTitle>{dialog.title}</DialogTitle>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div
                id={dialogDescriptionId}
                className="text-foreground text-sm wrap-anywhere"
                role="region"
                aria-label="Szczegóły definicji"
              >
                {dialog.description}
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-border">
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Zamknij</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ PERFORMANCE OPTIMIZATION: Provider moved outside Controller render
           to prevent creating new Provider instances on every Controller re-render.
           Context value is memoized and only updates when isPepValue changes.

           This allows child components to use usePEPFieldsContext() to skip
           expensive operations (effects, API calls, subscriptions) when fields
           are hidden, without unnecessary re-renders.

           @see usePEPFieldsContext - Hook for accessing hidden state */}
      <PEPFieldsContext.Provider value={contextValue}>
        {/* RadioGroup z Controller dla opcji TAK/NIE */}
        <Controller
          name={isPepFlagField}
          control={control}
          render={({ field, fieldState }) => (
            <fieldset
              id={fieldsetId}
              className="border-0 p-0 m-0"
              aria-describedby={fieldState.error ? errorId : undefined}
              aria-invalid={!!fieldState.error}
              aria-required="true"
            >
              <legend className="sr-only">
                Oświadczenie dotyczące statusu PEP
              </legend>

              <div className="w-full">
                <div className="space-y-3">
                  <RadioGroup
                    value={booleanToRadioValue(field.value)}
                    onValueChange={value =>
                      field.onChange(radioValueToBoolean(value))
                    }
                    className="flex flex-col xs:flex-row sm:flex-row gap-3 xs:gap-4 sm:justify-start"
                  >
                    {/* Opcja NIE */}
                    <Label
                      htmlFor={`${isPepFlagField}-no`}
                      className={getButtonStyleClass(false, field.value)}
                    >
                      <RadioGroupItem
                        value={RADIO_VALUES.FALSE}
                        id={`${isPepFlagField}-no`}
                        className={getRadioGroupItemClass()}
                      />
                      <span className="font-semibold">NIE</span>
                    </Label>

                    {/* Opcja TAK */}
                    <Label
                      htmlFor={`${isPepFlagField}-yes`}
                      className={getButtonStyleClass(true, field.value)}
                    >
                      <RadioGroupItem
                        value={RADIO_VALUES.TRUE}
                        id={`${isPepFlagField}-yes`}
                        className={getRadioGroupItemClass()}
                      />
                      <span className="font-semibold">TAK</span>
                    </Label>
                  </RadioGroup>

                  {/* Błędy walidacji */}
                  {fieldState.error && (
                    <div
                      id={errorId}
                      className="text-red-600 dark:text-red-400 text-sm mt-2"
                      role="alert"
                      aria-live="polite"
                    >
                      {fieldState.error.message}
                    </div>
                  )}
                </div>
              </div>
            </fieldset>
          )}
        />

        {/* Dodatkowe pola formularza gdy wybrano "TAK" */}
        {/* ✅ UX IMPROVEMENT: Use hidden attribute instead of conditional rendering
             to preserve field state when user toggles between TAK/NIE.
             This prevents data loss if user accidentally toggles or changes their mind.
             Fields remain mounted in React tree and registered in React Hook Form,
             maintaining all entered values and validation state.

             ✅ ACCESSIBILITY: aria-hidden ensures hidden fields are explicitly removed
             from accessibility tree in all browsers, preventing screen reader confusion.

             ✅ SECURITY: Hidden field values are automatically cleared on form submission
             by pepDeclarationsSchema.transform() when isPep flag is false.
             See sharedSchema.ts:209-256 for data sanitization logic.

             @see usePEPFieldsContext - Hook for accessing hidden state in child components
             @see sharedSchema.ts pepDeclarationsSchema - Data sanitization on submit */}
        <div hidden={isPepValue !== true} aria-hidden={isPepValue !== true}>
          {children}
        </div>
      </PEPFieldsContext.Provider>
    </div>
  );
}
