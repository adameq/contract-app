/**
 * Company Validation Synchronization Hook
 *
 * **PURPOSE**: Synchronizes React Query fetch results with Zustand validation store
 *
 * ## ARCHITECTURAL DECISION: SEPARATION OF CONCERNS
 *
 * This hook separates data fetching from state synchronization:
 * - **useCompanyQuery**: Responsible ONLY for fetching data (React Query)
 * - **useCompanyValidationSync**: Responsible ONLY for synchronizing validation state (Zustand)
 *
 * **Why separate?**
 * - Single Responsibility Principle: Each hook has one clear job
 * - Testability: Can test fetching and sync logic independently
 * - Reusability: useCompanyQuery can be used without forced state synchronization
 * - Explicit data flow: Synchronization is visible at component level
 *
 * ## USAGE
 *
 * ```tsx
 * function CompanyDataSection() {
 *   const companyQuery = useCompanyQuery(nip, 'company', { enabled: false });
 *
 *   // Explicit synchronization - clearly visible in component
 *   useCompanyValidationSync(nip, companyQuery.data, companyQuery.isSuccess);
 *
 *   // ...
 * }
 * ```
 *
 * ## HOW IT WORKS
 *
 * 1. Observes React Query state (data, isSuccess) via useEffect
 * 2. When data changes AND fetch was successful:
 *    - Checks if company is active
 *    - Updates validation store (setApproved / setRejected)
 * 3. When NIP changes: Validation state is cleared (handled by store)
 *
 * ## LIFECYCLE
 *
 * - **On mount**: No action (waits for first fetch)
 * - **On successful fetch**: Updates validation store based on company.isActive
 * - **On NIP change**: Effect re-runs with new data
 * - **On unmount**: No cleanup needed (validation state persists in session)
 */

import { useEffect } from 'react';

import type { CompanyData } from '@/shared/api/types';

import { useCompanyValidationStore } from '../store/useCompanyValidationStore';

/**
 * Hook for synchronizing React Query company data with validation store
 *
 * Observes company query state and updates validation store when:
 * - Fetch completes successfully (isSuccess = true)
 * - Company data is available (data != null)
 *
 * @param nip - Company NIP number (required for validation state)
 * @param data - Company data from React Query (undefined if not fetched yet)
 * @param isSuccess - Whether fetch was successful (from React Query)
 *
 * @example
 * ```tsx
 * const companyQuery = useCompanyQuery(nip, 'company', { enabled: false });
 * useCompanyValidationSync(nip, companyQuery.data, companyQuery.isSuccess);
 * ```
 */
export function useCompanyValidationSync(
  nip: string,
  data: CompanyData | undefined,
  isSuccess: boolean
) {
  // Get validation store actions
  const { setApproved, setRejected } = useCompanyValidationStore();

  useEffect(() => {
    // Only synchronize if fetch was successful and data is available
    if (!isSuccess || !data) {
      return;
    }

    // Update validation store based on company status
    if (data.isActive) {
      setApproved(nip);
    } else {
      setRejected(nip, 'inactive');
    }
  }, [nip, data, isSuccess, setApproved, setRejected]);
}
