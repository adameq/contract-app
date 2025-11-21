import { cva } from 'class-variance-authority';

/**
 * CVA variants for CompanyFieldsMessages component
 * Replaces hardcoded MESSAGE_STYLES object to enable proper Tailwind tree-shaking
 */

export const containerVariants = cva('text-center py-4 px-4 rounded-lg', {
  variants: {
    messageType: {
      info: 'bg-info/5 border border-info/20 dark:bg-info/10 dark:border-info/30',
      success:
        'bg-success/5 border border-success/20 dark:bg-success/10 dark:border-success/30',
      warning:
        'bg-warning/5 border border-warning/20 dark:bg-warning/10 dark:border-warning/30',
      error:
        'bg-destructive/5 border border-destructive/20 dark:bg-destructive/10 dark:border-destructive/30',
    },
  },
  defaultVariants: {
    messageType: 'info',
  },
});

export const titleVariants = cva('font-medium', {
  variants: {
    messageType: {
      info: 'text-info dark:text-info-foreground',
      success: 'text-success dark:text-success-foreground',
      warning: 'text-warning dark:text-warning-foreground',
      error: 'text-destructive dark:text-destructive-foreground',
    },
  },
  defaultVariants: {
    messageType: 'info',
  },
});

export const descriptionVariants = cva('text-sm', {
  variants: {
    messageType: {
      info: 'text-blue-800 dark:text-info-foreground/90',
      success: 'text-success/90 dark:text-success-foreground/90',
      warning: 'text-warning/90 dark:text-warning-foreground/90',
      error: 'text-destructive/90 dark:text-destructive-foreground/90',
    },
  },
  defaultVariants: {
    messageType: 'info',
  },
});

export const buttonVariants = cva('transition-colors', {
  variants: {
    messageType: {
      info: 'text-info border-info hover:bg-info/10',
      success: 'text-success border-success hover:bg-success/10',
      warning: 'text-warning border-warning hover:bg-warning/10',
      error: 'text-destructive border-destructive hover:bg-destructive/10',
    },
  },
  defaultVariants: {
    messageType: 'info',
  },
});

export type MessageType = 'info' | 'success' | 'warning' | 'error';
