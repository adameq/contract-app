/**
 * CompanyDataErrorWithEdit - Error handler for CEIDG API failures
 *
 * BUSINESS REQUIREMENT: Company must be found in CEIDG registry to proceed.
 * Manual data entry is NOT allowed - companies must exist in the official registry.
 *
 * ✅ **BUSINESS LOGIC**: Only retry allowed, no manual entry
 * ✅ **USER FRIENDLY**: Clear error messaging with retry option
 * ✅ **COMPLIANCE**: Ensures only registered companies can proceed
 */

import { AlertCircle } from 'lucide-react';
import React from 'react';

import { CompanyDataError } from '@/shared/components/async/ContextualErrors';

interface CompanyDataErrorWithEditProps {
  /** The error that occurred */
  error: Error;
  /** NIP that was being fetched */
  nip?: string;
  /** Retry callback to refetch data */
  onRetry: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Error component for CEIDG API failures
 *
 * BUSINESS REQUIREMENT: Company must be found in CEIDG registry.
 * Only retry is allowed - no manual data entry.
 *
 * @example
 * ```tsx
 * // In QueryStateRenderer error callback:
 * <CompanyDataErrorWithEdit
 *   error={error}
 *   nip={nip}
 *   onRetry={retry}
 * />
 * ```
 */
export function CompanyDataErrorWithEdit({
  error,
  nip,
  onRetry,
  className,
}: CompanyDataErrorWithEditProps) {
  return (
    <div className={className}>
      {/* Show only error with retry option */}
      <div className="space-y-4">
        {/* Use existing error component for consistency */}
        <CompanyDataError error={error} nip={nip} onRetry={onRetry} />

        {/* Business requirement notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-700">
                <strong>Wymaganie:</strong> Firma musi być zarejestrowana w
                rejestrze CEIDG aby przejść dalej. Sprawdź poprawność numeru NIP
                lub spróbuj ponownie za chwilę.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
