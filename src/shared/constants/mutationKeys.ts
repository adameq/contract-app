/**
 * Mutation keys for React Query
 * Centralized location for mutation keys to ensure consistency
 */

export const MUTATION_KEYS = {
  CONTRACT_SUBMISSION: ['contracts', 'submit'] as const,
  DRAFT_SAVE: ['contracts', 'draft'] as const,
} as const;
