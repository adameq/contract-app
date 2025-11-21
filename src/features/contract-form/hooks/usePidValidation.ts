/**
 * Pipedrive PID Validation Hook
 *
 * Multi-layer security validation for form access control:
 * 1. PID must exist in Pipedrive
 * 2. Custom field must have specific value (form generation permission)
 * 3. Creation date must match exactly (prevents PID guessing attacks)
 *
 * Security architecture:
 * - All validation happens server-side via Cloudflare Function
 * - Pipedrive API token never exposed to client
 * - Invalid PIDs result in immediate redirect to main site
 *
 * Feature flag:
 * - Controlled by VITE_PIPEDRIVE_ENABLED environment variable
 * - When disabled, validation is skipped entirely
 * - Allows testing without Pipedrive dependency
 *
 * Usage:
 * ```tsx
 * function FormLayout() {
 *   const { isValidating, isEnabled } = usePidValidation();
 *
 *   if (isEnabled && isValidating) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   return <Form />;
 * }
 * ```
 *
 * URL format:
 * https://form.thespace.rent/?pid=12345&option=01&created=2024-03-15
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { validatePid } from '@/shared/api/pipedrive';
import { queryKeys } from '@/shared/constants/queryKeys';

import { useFormPersistStore } from '../store/useFormPersistStore';

/**
 * Hook return type
 */
interface UsePidValidationReturn {
  /** Whether PID validation is currently in progress */
  isValidating: boolean;
  /** Whether Pipedrive validation is enabled (feature flag) */
  isEnabled: boolean;
  /** Whether validation passed successfully */
  isValid: boolean;
}

/**
 * Validate Pipedrive Person ID on mount
 *
 * Behavior:
 * - Feature disabled: Skip validation entirely
 * - Missing params: Redirect to thespace.rent
 * - Invalid PID: Redirect to thespace.rent
 * - Valid PID: Store data in Zustand and allow form access
 *
 * @returns Validation state
 */
export function usePidValidation(): UsePidValidationReturn {
  const setPipedriveData = useFormPersistStore((s) => s.setPipedriveData);
  const [shouldValidate, setShouldValidate] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Feature flag - check if Pipedrive validation is enabled
  const isEnabled = import.meta.env.VITE_PIPEDRIVE_ENABLED === 'true';

  // Extract URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const pid = searchParams.get('pid');
  const option = searchParams.get('option');
  const created = searchParams.get('created');

  // Check if we have all required parameters
  const hasAllParams = Boolean(pid && option && created);

  // Initial validation check - runs once on mount
  useEffect(() => {
    if (!isEnabled) {
      // Feature disabled - skip validation
      setShouldValidate(false);
      return;
    }

    if (!hasAllParams) {
      // Missing required parameters - redirect
      if (!hasRedirected) {
        console.warn(
          'Missing required Pipedrive parameters (pid, option, created). Redirecting...'
        );
        setHasRedirected(true);
        window.location.href = 'https://thespace.rent';
      }
      return;
    }

    // All params present - enable validation
    setShouldValidate(true);
  }, [isEnabled, hasAllParams, hasRedirected]);

  // React Query validation
  const validationQuery = useQuery({
    queryKey: queryKeys.pipedriveValidation(pid ?? '', created ?? ''),
    queryFn: async ({ signal }) => {
      // This only runs if enabled === true (React Query guarantee)
      return await validatePid(
        {
          pid: pid!,
          option: option!,
          created: created!,
        },
        signal
      );
    },
    enabled: shouldValidate && hasAllParams,
    retry: false, // Don't retry on validation failure
    staleTime: Infinity, // Cache forever - validation won't change
    gcTime: Infinity, // Keep in cache forever (within session)
  });

  // Handle validation result
  useEffect(() => {
    if (!shouldValidate || !validationQuery.data) {
      return;
    }

    const { valid, personData, error } = validationQuery.data;

    if (valid && personData) {
      // Success - store validated data
      setPipedriveData({
        pid: pid!,
        option: option!,
        created: created!,
        personData,
      });

      console.log('PID validation successful:', {
        pid,
        personName: personData.name,
      });
    } else {
      // Validation failed - redirect
      if (!hasRedirected) {
        console.warn('PID validation failed:', error);
        setHasRedirected(true);
        window.location.href = 'https://thespace.rent';
      }
    }
  }, [
    validationQuery.data,
    shouldValidate,
    pid,
    option,
    created,
    setPipedriveData,
    hasRedirected,
  ]);

  // Handle query error (network/server errors)
  useEffect(() => {
    if (!shouldValidate) {
      return;
    }

    if (validationQuery.error) {
      // Error occurred - redirect
      if (!hasRedirected) {
        console.error('PID validation error:', validationQuery.error);
        setHasRedirected(true);
        window.location.href = 'https://thespace.rent';
      }
    }
  }, [validationQuery.error, shouldValidate, hasRedirected]);

  return {
    isValidating: shouldValidate && validationQuery.isLoading,
    isEnabled,
    isValid: Boolean(validationQuery.data?.valid),
  };
}
