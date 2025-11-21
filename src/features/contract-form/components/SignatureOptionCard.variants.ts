import { cva } from 'class-variance-authority';

/**
 * CVA variants for SignatureOptionCard components
 * Provides consistent styling variants for selected/default states
 */

export const cardVariants = cva(
  'relative transition-all duration-200 ease-in-out group overflow-hidden cursor-pointer bg-background border border-border rounded-lg',
  {
    variants: {
      selected: {
        true: 'ring-2 ring-success shadow-lg bg-success/10 focus-within:ring-2 focus-within:ring-success/50',
        false:
          'hover:shadow-md hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary/50',
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export const iconContainerVariants = cva(
  'w-10 h-10 xl:w-12 xl:h-12 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
  {
    variants: {
      selected: {
        true: 'bg-primary text-primary-foreground',
        false:
          'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export const actionButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all w-full h-8 px-3',
  {
    variants: {
      selected: {
        true: 'bg-success text-success-foreground shadow-xs',
        false:
          'border bg-background shadow-xs hover:bg-accent hover:text-foreground dark:hover:text-primary dark:bg-input/30 dark:border-input',
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);
