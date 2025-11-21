import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  /** Whether to show the required field indicator (red asterisk) */
  required?: boolean;
}

/**
 * Label component with optional required indicator
 *
 * When `required={true}`, displays a red asterisk (*) after the label text.
 * This provides a clear visual indicator that the field is required,
 * in addition to the aria-required attribute on the input element.
 */
function Label({
  className,
  required = false,
  children,
  ...props
}: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </LabelPrimitive.Root>
  );
}

export { Label };
