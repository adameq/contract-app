import { cva } from 'class-variance-authority';

/**
 * CVA variants for PEP Question component styling
 * Replaces imperative CSS logic with declarative variants
 */

export const pepIconContainerVariants = cva(
  'w-10 h-10 xl:w-12 xl:h-12 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
  {
    variants: {
      status: {
        default: 'bg-muted text-muted-foreground',
        complete: 'bg-success text-success-foreground',
      },
    },
    defaultVariants: {
      status: 'default',
    },
  }
);

export const pepSectionVariants = cva(
  'space-y-4 min-w-0 overflow-hidden p-4 rounded-lg border transition-all duration-300',
  {
    variants: {
      status: {
        default: 'border-border',
        complete: 'ring-2 ring-success bg-success/5 border-success/20',
      },
    },
    defaultVariants: {
      status: 'default',
    },
  }
);

export const pepRadioButtonVariants = cva(
  'border rounded-lg transition-all hover:bg-accent/20 py-3 px-4 cursor-pointer flex items-center justify-center gap-3 min-w-0 flex-1 sm:flex-none sm:w-32',
  {
    variants: {
      status: {
        default: '',
        complete: '',
      },
      selected: {
        true: '',
        false: 'border-border hover:border-primary/50',
      },
    },
    compoundVariants: [
      // Default status variants
      {
        status: 'default',
        selected: true,
        class: 'border-primary bg-primary/5 dark:bg-primary/10',
      },
      // Complete status variants
      {
        status: 'complete',
        selected: true,
        class: 'border-success bg-success/10',
      },
    ],
    defaultVariants: {
      status: 'default',
      selected: false,
    },
  }
);

export type PEPStatus = 'complete' | 'in-progress' | 'incomplete';
