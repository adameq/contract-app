import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  /**
   * Validation state - can be provided via prop or data-validation-state attribute
   * When using TypedFormField with validation option, this is automatically set via data attribute
   */
  validationState?: 'default' | 'success' | 'error' | 'loading';
  variant?:
    | 'default'
    | 'success-filled'
    | 'disabled-success'
    | 'disabled-muted';
  /**
   * Whether to show validation icon - can be provided via prop or data-show-validation-icon attribute
   * When using TypedFormField with validation option, this is automatically set via data attribute
   */
  showValidationIcon?: boolean;
  /**
   * Additional classes for the input element itself
   * Use this for input-specific styling (padding, text, etc.)
   */
  inputClassName?: string;
}

// ✅ DECLARATIVE: Single source of truth for validation state configuration
const validationConfig = {
  success: {
    classes:
      'border-success ring-success/20 dark:ring-success/40 focus-visible:border-success focus-visible:ring-success/50',
    icon: CheckCircle,
    iconColor: 'text-success',
    textColor: 'text-success',
  },
  error: {
    classes:
      'border-destructive ring-destructive/20 dark:ring-destructive/40 focus-visible:border-destructive focus-visible:ring-destructive/50',
    icon: XCircle,
    iconColor: 'text-destructive',
    textColor: 'text-destructive',
  },
  loading: {
    classes:
      'border-primary ring-primary/20 dark:ring-primary/40 focus-visible:border-primary focus-visible:ring-primary/50',
    icon: Loader2,
    iconColor: 'text-primary animate-spin',
    textColor: 'text-primary',
  },
} as const;

// ✅ DECLARATIVE: Single source of truth for visual variant configuration
const variantConfig = {
  'success-filled': {
    classes:
      'bg-green-50/30 text-foreground cursor-not-allowed border-green-200/50',
  },
  'disabled-success': {
    classes:
      'bg-green-50/40 text-[color:var(--color-disabled-text)] cursor-not-allowed border-[color:var(--color-disabled-border)]',
  },
  'disabled-muted': {
    classes:
      'bg-muted/20 text-[color:var(--color-disabled-text)] cursor-not-allowed border-dashed border-[color:var(--color-disabled-border)]',
  },
} as const;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputClassName,
      type,
      validationState: validationStateProp,
      variant = 'default',
      showValidationIcon: showValidationIconProp,
      ...props
    },
    ref
  ) => {
    // ✅ Read validation state from data attributes (new pattern) or props (backward compatibility)
    // Data attributes are set by TypedFormField when using validation option
    const validationState =
      (props['data-validation-state'] as
        | 'default'
        | 'success'
        | 'error'
        | 'loading'
        | undefined) ??
      validationStateProp ??
      'default';

    const showValidationIcon =
      props['data-show-validation-icon'] === 'true' ||
      (showValidationIconProp ?? false);

    // ✅ DECLARATIVE: Object lookup instead of switch statement
    const currentValidation =
      validationConfig[validationState as keyof typeof validationConfig];
    const validationClasses = currentValidation?.classes ?? '';
    const ValidationIcon = currentValidation?.icon;
    const iconColorClasses = currentValidation?.iconColor ?? '';

    // ✅ DECLARATIVE: Object lookup for visual variants
    const currentVariant = variantConfig[variant as keyof typeof variantConfig];
    const variantClasses = currentVariant?.classes ?? '';

    return (
      <div className={cn('relative', className)}>
        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            validationClasses,
            variantClasses,
            showValidationIcon && 'pr-10', // Add padding for icon
            inputClassName
          )}
          {...props}
        />

        {/* Validation icon */}
        {showValidationIcon && ValidationIcon && (
          <div className="absolute right-3 top-0 h-9 flex items-center justify-center">
            <ValidationIcon className={cn('h-4 w-4', iconColorClasses)} />
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
