/**
 * Development-only assertion utilities
 *
 * These functions are used to validate assumptions during development.
 * In production builds, Vite replaces `import.meta.env.DEV` with `false`,
 * causing dead code elimination to completely remove these functions and
 * all calls to them from the production bundle.
 *
 * This provides zero-overhead runtime validation during development while
 * keeping the production bundle clean and performant.
 *
 * @module assert
 *
 * @example
 * ```ts
 * import { assert, invariant } from '@/shared/lib/assert';
 *
 * // Validate configuration during development
 * assert(config.type === 'valid', 'Invalid config type');
 *
 * // Check runtime invariants
 * invariant(user !== null, 'User must be authenticated');
 * ```
 */

/**
 * Development-only assertion
 *
 * Validates a condition during development and throws an error if false.
 * In production builds, this function is completely removed via tree-shaking.
 *
 * Use for validating assumptions that should always be true:
 * - Configuration correctness
 * - Type safety checks beyond TypeScript
 * - Development-time validation
 *
 * @param condition - The condition to validate
 * @param message - Error message shown if assertion fails
 *
 * @example
 * ```ts
 * assert(fieldConfig.type === 'text', `Expected text field, got: ${fieldConfig.type}`);
 * assert(value >= 0, 'Value must be non-negative');
 * ```
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (import.meta.env.DEV) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
}

/**
 * Development-only invariant check
 *
 * Validates a critical program invariant during development.
 * In production builds, this function is completely removed via tree-shaking.
 *
 * Similar to assert but with stronger semantic meaning:
 * - `assert`: "This should always be true based on my understanding"
 * - `invariant`: "This MUST be true or the program is in an invalid state"
 *
 * Use for checking critical conditions:
 * - Required data must exist
 * - State must be valid before operations
 * - Impossible code paths
 *
 * @param condition - The invariant to validate
 * @param message - Error message shown if invariant is violated
 *
 * @example
 * ```ts
 * invariant(user !== null, 'User must be authenticated at this point');
 * invariant(step >= 1 && step <= 6, `Invalid step number: ${step}`);
 * ```
 */
export function invariant(
  condition: boolean,
  message: string
): asserts condition {
  if (import.meta.env.DEV) {
    if (!condition) {
      throw new Error(`Invariant violation: ${message}`);
    }
  }
}

/**
 * Development-only warning
 *
 * Logs a warning to console during development.
 * In production builds, this function is completely removed via tree-shaking.
 *
 * Use for non-critical issues that developers should know about:
 * - Deprecated API usage
 * - Performance anti-patterns
 * - Potential bugs that don't break functionality
 *
 * @param condition - If false, warning is logged
 * @param message - Warning message to display
 *
 * @example
 * ```ts
 * devWarn(items.length > 0, 'Empty list may cause render issues');
 * devWarn(!isDeprecated, 'Using deprecated API, migrate to new version');
 * ```
 */
export function devWarn(condition: boolean, message: string): void {
  if (import.meta.env.DEV) {
    if (!condition) {
      console.warn(`[DEV WARNING]: ${message}`);
    }
  }
}
