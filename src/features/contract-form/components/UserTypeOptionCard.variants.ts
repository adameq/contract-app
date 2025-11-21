import { cva } from 'class-variance-authority';

/**
 * CVA variants for UserTypeOptionCard components
 * Provides consistent styling variants for selected/default states
 */

export const cardVariants = cva(
  'relative transition-all duration-300 group overflow-hidden cursor-pointer bg-background border border-border rounded-lg',
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
