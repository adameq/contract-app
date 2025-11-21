/**
 * Application route paths
 *
 * Single source of truth for all navigation paths in the application.
 * Prevents hardcoded route strings scattered across components and hooks.
 *
 * USAGE:
 * ```typescript
 * import { ROUTES, DEFAULT_FORM_STEP } from '@/shared/constants/routes';
 *
 * // Static routes
 * navigate(ROUTES.ROOT);
 * navigate(ROUTES.FORM_STEP_1);
 *
 * // Dynamic routes with parameters
 * navigate(ROUTES.FORM_STEP(3));
 * navigate(ROUTES.FORM_SUCCESS('contract-123'));
 * ```
 *
 * BENEFITS:
 * - Single source of truth for route paths
 * - Type-safe route parameters
 * - Autocomplete support for route paths
 * - Easy to update routes (change in one place)
 * - Prevents typos in navigation code
 * - Clear distinction between static and dynamic routes
 */

/**
 * Application routes
 *
 * Mix of static paths (strings) and dynamic path builders (functions).
 * Dynamic routes use template literals for type-safe parameter injection.
 */
export const ROUTES = {
  /** Root path - redirects to first form step */
  ROOT: '/',

  /** First form step - static path for quick access */
  FORM_STEP_1: '/form/step/1',

  /**
   * Dynamic form step path
   * @param step - Step number (1-based index)
   * @returns Path to specific form step
   * @example ROUTES.FORM_STEP(3) // '/form/step/3'
   */
  FORM_STEP: (step: number) => `/form/step/${step}` as const,

  /**
   * Form success page with contract ID
   * @param contractId - Unique contract identifier
   * @returns Path to success page with contract details
   * @example ROUTES.FORM_SUCCESS('abc123') // '/form/success/abc123'
   */
  FORM_SUCCESS: (contractId: string) => `/form/success/${contractId}` as const,
} as const;

/**
 * Default form step number
 *
 * Used for:
 * - Form reset (return to first step)
 * - Initial navigation (root redirects here)
 * - Invalid step number fallback
 */
export const DEFAULT_FORM_STEP = 1;

/**
 * Type for static route paths (excluding functions)
 * Useful for type-safe route guards and redirects
 */
export type StaticRoute = Extract<(typeof ROUTES)[keyof typeof ROUTES], string>;
