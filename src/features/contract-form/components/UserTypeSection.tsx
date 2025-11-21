/**
 * User Type Section Component
 *
 * Allows user to select their type (company, consumer-vat, consumer).
 *
 * ## SIMPLIFIED ARCHITECTURE:
 *
 * This component is now much simpler thanks to Separate FormProviders pattern:
 * - No manual cleanup needed (CompanyDataBridge handles it)
 * - No type assertions needed
 * - Just updates userType in main FormProvider
 * - Bridge component watches and orchestrates sub-form mounting
 *
 * Old complexity:
 * - Had to call useUserTypeCleanup hook
 * - Manual cache cleanup
 * - Manual form reset with type assertions
 * - 50+ lines of cleanup logic
 *
 * New simplicity:
 * - Just onChange(newType) - that's it!
 * - Bridge watches and does cleanup automatically
 * - React key prop handles unmount/mount
 */

import { CheckCircle } from 'lucide-react';
import { useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { OptionPicker } from '@/shared/components/common/OptionPicker';
import { Badge } from '@/shared/components/ui/badge';
import { userTypeOptions } from '@/shared/constants/userTypeOptions';

import type { FormUserType, SharedFormData } from '../schema/sharedSchema';
import type { UserTypeOption } from '../ui-types';
import {
  cardVariants,
  iconContainerVariants,
} from './UserTypeOptionCard.variants';

export function UserTypeSection() {
  const { control } = useFormContext<SharedFormData>();

  return (
    <section
      className="w-full max-w-7xl mx-auto p-6"
      id="user-type-section"
      aria-labelledby="user-type-heading"
    >
      <div className="space-y-6">
        <h2
          id="user-type-heading"
          className="text-xl xl:text-2xl font-bold text-foreground text-left"
        >
          Proszę wskazać na jaki podmiot będzie podpisana umowa pośrednictwa.
        </h2>

        <Controller
          name="userType"
          control={control}
          render={({ field: { value, onChange } }) => (
            <UserTypeSelector
              selectedUserType={value}
              onUserTypeSelect={onChange}
            />
          )}
        />
      </div>
    </section>
  );
}

// ✅ REFACTORED: Thin wrapper component using generic OptionPicker
interface UserTypeSelectorProps {
  selectedUserType: FormUserType;
  onUserTypeSelect: (userType: FormUserType) => void;
}

function UserTypeSelector({
  selectedUserType,
  onUserTypeSelect,
}: UserTypeSelectorProps) {
  // ✅ SIMPLIFIED: No more manual hook management - OptionPicker handles everything!
  return (
    <OptionPicker<UserTypeOption>
      options={userTypeOptions}
      value={selectedUserType === 'none' ? null : selectedUserType}
      onChange={value => {
        // UserType doesn't support deselection, so value should never be null
        if (value !== null) {
          onUserTypeSelect(value);
        }
      }}
      aria-label="Typ użytkownika reprezentowanego w umowie"
      gridClassName="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 lg:gap-4"
      selectionAnnouncementTemplate={option =>
        option
          ? `Wybrano typ użytkownika: ${option.title}`
          : 'Nie wybrano typu użytkownika'
      }
      renderOption={({
        option,
        isSelected,
        onSelect,
        position,
        isFirstOption,
        refCallback,
      }) => (
        <UserTypeOptionCard
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
  );
}

// ✅ KEPT: Individual option card component (reusable)
interface UserTypeOptionCardProps {
  option: UserTypeOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
  position: number;
  isFirstOption: boolean;
  refCallback?: (element: HTMLElement | null) => void;
}

function UserTypeOptionCard({
  option,
  isSelected,
  onSelect,
  position,
  isFirstOption,
  refCallback,
}: UserTypeOptionCardProps) {
  const IconComponent = option.icon;

  // Simple derived values
  const descriptionId = `${option.id}-description`;

  // Event handlers - memoized for performance
  // Defensive: only select card when clicking card itself, not interactive children
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

  return (
    <div
      ref={refCallback}
      className={cardVariants({ selected: isSelected })}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isSelected || (!isSelected && isFirstOption) ? 0 : -1}
      role="radio"
      aria-checked={isSelected}
      aria-describedby={descriptionId}
      aria-setsize={userTypeOptions.length}
      aria-posinset={position}
      aria-label={`${option.title} - opcja ${position} z ${userTypeOptions.length}`}
    >
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
          {/* Icon and Title in one line */}
          <div className="flex items-center gap-3 xl:gap-4">
            {/* Icon */}
            <div className={iconContainerVariants({ selected: isSelected })}>
              <IconComponent className="h-5 w-5 xl:h-6 xl:w-6" />
            </div>

            {/* Title */}
            <h3 className="font-semibold text-sm xl:text-base text-foreground text-left flex-1">
              {option.title}
            </h3>
          </div>

          {/* Content */}
          <div className="space-y-2">
            {option.subtitle && (
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {option.subtitle}
              </p>
            )}
            <p
              id={descriptionId}
              className="text-xs xl:text-sm text-foreground leading-relaxed"
            >
              {option.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
