import { CheckCircle, Info } from 'lucide-react';
import { useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { OptionPicker } from '@/shared/components/common/OptionPicker';
import { Badge } from '@/shared/components/ui/badge';
import { signatureOptions } from '@/shared/constants/signatureOptions';

import type { SharedFormData } from '../schema/sharedSchema';
import type { SignatureOption } from '../ui-types';
// Standard import used for QualifiedSignatureInfoDialog - lazy loading not beneficial for small components
// that are conditionally rendered but likely to be needed during the user session
import { QualifiedSignatureInfoDialog } from './QualifiedSignatureInfoDialog';
import {
  cardVariants,
  iconContainerVariants,
} from './SignatureOptionCard.variants';

export function SignatureMethodSection() {
  const { control } = useFormContext<SharedFormData>();

  return (
    <section
      className="w-full max-w-7xl mx-auto p-6"
      id="signature-method-section"
      aria-labelledby="signature-method-heading"
    >
      <div className="space-y-6">
        <h2
          id="signature-method-heading"
          className="text-xl xl:text-2xl font-bold text-foreground text-left"
        >
          Proszę wybrać najwygodniejszy dla Pana/Pani sposób podpisania umowy:
        </h2>

        <Controller
          name="signatureMethod"
          control={control}
          render={({ field: { value, onChange } }) => (
            <OptionPicker<SignatureOption>
              options={signatureOptions}
              value={value}
              onChange={onChange}
              aria-label="Sposób podpisania umowy pośrednictwa"
              allowDeselection={true}
              gridClassName="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 justify-items-center max-w-4xl mx-auto"
              selectionAnnouncementTemplate={option =>
                option
                  ? `Wybrano metodę: ${option.title}`
                  : 'Nie wybrano metody podpisu'
              }
              renderOption={({
                option,
                isSelected,
                onSelect,
                position,
                isFirstOption,
                refCallback,
              }) => (
                <SignatureOptionCard
                  key={option.id}
                  option={option}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  position={position}
                  isFirstOption={isFirstOption}
                  refCallback={refCallback}
                />
              )}
            />
          )}
        />
      </div>
    </section>
  );
}

// Individual option card component (reusable)
interface SignatureOptionCardProps {
  option: SignatureOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
  position: number;
  isFirstOption: boolean;
  refCallback?: (element: HTMLElement | null) => void;
}

function SignatureOptionCard({
  option,
  isSelected,
  onSelect,
  position,
  isFirstOption,
  refCallback,
}: SignatureOptionCardProps) {
  const IconComponent = option.icon;

  // Simple derived values - no memoization needed
  const descriptionId = `${option.id}-description`;

  // Event handlers - only select card when clicking card itself, not interactive children
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Ignore clicks on interactive elements (buttons, links, inputs)
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.closest('button') !== null ||
        target.closest('a') !== null;

      if (!isInteractive) {
        onSelect(option.id);
      }
    },
    [onSelect, option.id]
  );

  // Keyboard handler for accessibility (Enter/Space to activate)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(option.id);
      }
    },
    [onSelect, option.id]
  );

  // CVA-based style variants - consistent with shadcn/ui approach
  const cardClassName = cardVariants({ selected: isSelected });
  const iconContainerClassName = iconContainerVariants({
    selected: isSelected,
  });

  return (
    <div
      ref={refCallback}
      className={cardClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isSelected || (!isSelected && isFirstOption) ? 0 : -1}
      role="radio"
      aria-checked={isSelected}
      aria-describedby={descriptionId}
      aria-setsize={signatureOptions.length}
      aria-posinset={position}
      aria-label={`${option.title} - opcja ${position} z ${signatureOptions.length}`}
    >
      {/* Card content area */}
      <div className="p-3 sm:p-4 xl:p-5 flex flex-col h-full">
        {/* Top row with badge on left and checkmark on right */}
        <div className="flex justify-between items-start mb-2 min-h-[24px]">
          {/* Badge on the left */}
          {option.badge && (
            <Badge
              variant={option.badgeVariant ?? 'secondary'}
              className="text-xs font-medium"
            >
              {option.badge}
            </Badge>
          )}
          {/* Checkmark on the right */}
          {isSelected && (
            <div className="flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
          )}
        </div>

        <div className="space-y-1 sm:space-y-2 xl:space-y-3 flex-1">
          {/* Icon and Title in one line - cleaner layout */}
          <div className="flex items-center gap-3 xl:gap-4">
            {/* Icon - larger and more prominent */}
            <div className={iconContainerClassName}>
              <IconComponent className="h-5 w-5 xl:h-6 xl:w-6" />
            </div>

            {/* Title - left aligned for horizontal layout */}
            <h3 className="font-semibold text-sm xl:text-base text-foreground text-left flex-1">
              {option.title}
            </h3>
          </div>

          {/* Content */}
          <div className="space-y-2">
            {option.subtitle && (
              <p className="text-xs text-muted-foreground font-medium">
                {option.subtitle}
              </p>
            )}
            <p
              id={descriptionId}
              className="text-xs xl:text-sm text-foreground leading-relaxed"
            >
              {option.description}
            </p>
            {option.warning && (
              <div
                className={`rounded-lg p-2 mt-2 ${
                  option.infoType === 'info'
                    ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
                    : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    option.infoType === 'info'
                      ? 'text-blue-800 dark:text-blue-200'
                      : 'text-foreground'
                  }`}
                >
                  {option.infoType === 'info' ? (
                    <Info className="inline h-3 w-3 mr-1" />
                  ) : (
                    '⚠️ '
                  )}
                  {option.warning}
                </p>
              </div>
            )}
            {/* Info dialog trigger - dialogs manage their own state */}
            {option.requiresModal && (
              <div className="mt-4">
                <QualifiedSignatureInfoDialog />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
