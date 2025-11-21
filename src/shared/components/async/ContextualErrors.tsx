/**
 * Contextual error components for React 19 use() hook integration
 *
 * Provides specialized error handling components for different contexts
 * with appropriate recovery actions and user-friendly messaging.
 */

import {
  AlertCircle,
  Clock,
  Edit3,
  RefreshCw,
  SkipForward,
  WifiOff,
} from 'lucide-react';

import {
  HttpStatus,
  isClientValidationError,
  isHttpError,
} from '@/shared/api/errors';

/**
 * Generic error utilities using HttpError
 * These work with any HttpError, not just GUS-specific errors
 */

/**
 * Get a generic error title based on error type
 */
const getErrorTitle = (error: Error): string => {
  // Handle client validation errors first (before HTTP request)
  if (isClientValidationError(error)) {
    return 'Błąd walidacji';
  }

  if (!isHttpError(error)) {
    return 'Błąd';
  }

  switch (error.status) {
    case HttpStatus.BAD_REQUEST:
      return 'Nieprawidłowe dane';
    case HttpStatus.NOT_FOUND:
      return 'Nie znaleziono';
    case HttpStatus.GATEWAY_TIMEOUT:
      return 'Przekroczono czas oczekiwania';
    case HttpStatus.SERVICE_UNAVAILABLE:
    case HttpStatus.BAD_GATEWAY:
      return 'Błąd połączenia';
    default:
      if (error.isServerError()) {
        return 'Błąd serwera';
      }
      if (error.isClientError()) {
        return 'Błąd danych';
      }
      return 'Błąd';
  }
};

/**
 * Check if error is retryable based on HTTP status
 */
const isRetryableError = (error: Error): boolean => {
  if (!isHttpError(error)) return true; // Allow retry for unknown errors

  // Network and timeout errors are retryable
  return (
    error.status === HttpStatus.GATEWAY_TIMEOUT ||
    error.status === HttpStatus.SERVICE_UNAVAILABLE ||
    error.status === HttpStatus.BAD_GATEWAY ||
    error.isServerError()
  );
};

/**
 * Check if manual entry should be suggested
 * BUSINESS REQUIREMENT: Company must be found in registry to proceed
 * Manual entry is NOT allowed for company not found errors
 */
const shouldSuggestManualEntry = (_error: Error): boolean => {
  // Never suggest manual entry for company data errors
  // Company must be found in CEIDG registry (business requirement)
  return false;
};

/**
 * Check if input correction should be suggested (for validation errors)
 */
const shouldSuggestCorrection = (error: Error): boolean => {
  // Client validation errors always suggest correction (user input was invalid)
  if (isClientValidationError(error)) {
    return true;
  }

  // Server validation errors (400 Bad Request) also suggest correction
  return isHttpError(error) && error.status === HttpStatus.BAD_REQUEST;
};

/**
 * Base error component props
 */
interface BaseErrorProps {
  error: Error;
  onRetry?: () => void;
  onSkip?: () => void;
  onManualEntry?: () => void;
  className?: string;
}

/**
 * Get error icon based on HTTP status
 */
function getErrorIcon(error: Error) {
  if (!isHttpError(error)) {
    return AlertCircle;
  }

  switch (error.status) {
    case HttpStatus.SERVICE_UNAVAILABLE:
    case HttpStatus.BAD_GATEWAY:
      return WifiOff;
    case HttpStatus.GATEWAY_TIMEOUT:
      return Clock;
    case HttpStatus.BAD_REQUEST:
      return Edit3;
    default:
      return AlertCircle;
  }
}

/**
 * Get error color classes based on HTTP status
 */
function getErrorColorClasses(error: Error): string {
  if (!isHttpError(error)) {
    return 'border-red-200 bg-red-50 text-red-800';
  }

  switch (error.status) {
    case HttpStatus.SERVICE_UNAVAILABLE:
    case HttpStatus.BAD_GATEWAY:
      return 'border-orange-200 bg-orange-50 text-orange-800';
    case HttpStatus.GATEWAY_TIMEOUT:
      return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    case HttpStatus.BAD_REQUEST:
      return 'border-blue-200 bg-blue-50 text-blue-800';
    case HttpStatus.NOT_FOUND:
      return 'border-gray-200 bg-gray-50 text-gray-800';
    default:
      if (error.isServerError()) {
        return 'border-red-200 bg-red-50 text-red-800';
      }
      return 'border-gray-200 bg-gray-50 text-gray-800';
  }
}

/**
 * Action button component for error recovery
 */
interface ActionButtonProps {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

function ActionButton({
  onClick,
  icon: Icon,
  children,
  variant = 'secondary',
}: ActionButtonProps) {
  const baseClasses =
    'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';

  const variantClasses =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      : 'bg-white border border-current hover:bg-gray-50 focus:ring-gray-500';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
      type="button"
    >
      <Icon className="w-3.5 h-3.5" />
      {children}
    </button>
  );
}

/**
 * Company data error component
 * Specialized for GUS registry data fetching errors
 */
interface CompanyDataErrorProps extends BaseErrorProps {
  nip?: string;
  onNipEdit?: () => void;
}

export function CompanyDataError({
  error,
  nip: _nip,
  onRetry,
  onSkip,
  onManualEntry,
  onNipEdit,
  className = '',
}: CompanyDataErrorProps) {
  const ErrorIcon = getErrorIcon(error);
  const colorClasses = getErrorColorClasses(error);

  // Use generic error title function
  const title = getErrorTitle(error);
  // Error message is already localized at the source (in API layer)
  const message = error.message;

  return (
    <div className={`p-4 border rounded-lg ${colorClasses} ${className}`}>
      <div className="flex items-start gap-3">
        <ErrorIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-sm mb-3 break-words">{message}</p>

          <div className="flex flex-wrap gap-2">
            {/* Retry for network/timeout errors */}
            {isRetryableError(error) && onRetry && (
              <ActionButton
                onClick={onRetry}
                icon={RefreshCw}
                variant="primary"
              >
                Spróbuj ponownie
              </ActionButton>
            )}

            {/* Manual entry for not found errors */}
            {shouldSuggestManualEntry(error) && onManualEntry && (
              <ActionButton onClick={onManualEntry} icon={Edit3}>
                Wprowadź ręcznie
              </ActionButton>
            )}

            {/* NIP correction for validation errors */}
            {shouldSuggestCorrection(error) && onNipEdit && (
              <ActionButton onClick={onNipEdit} icon={Edit3}>
                Popraw NIP
              </ActionButton>
            )}

            {/* Skip option */}
            {onSkip && (
              <ActionButton onClick={onSkip} icon={SkipForward}>
                Pomiń
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generic form section error component
 * For general form section errors
 */
interface FormSectionErrorProps extends BaseErrorProps {
  sectionName: string;
  description?: string;
}

export function FormSectionError({
  error,
  sectionName,
  description,
  onRetry,
  onSkip,
  className = '',
}: FormSectionErrorProps) {
  const ErrorIcon = getErrorIcon(error);
  const colorClasses = getErrorColorClasses(error);

  return (
    <div className={`p-4 border rounded-lg ${colorClasses} ${className}`}>
      <div className="flex items-start gap-3">
        <ErrorIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">
            Błąd w sekcji: {sectionName}
          </h3>
          <p className="text-sm mb-2 break-words">
            {description ?? error.message}
          </p>

          {(onRetry ?? onSkip) && (
            <div className="flex gap-2">
              {onRetry && (
                <ActionButton
                  onClick={onRetry}
                  icon={RefreshCw}
                  variant="primary"
                >
                  Spróbuj ponownie
                </ActionButton>
              )}

              {onSkip && (
                <ActionButton onClick={onSkip} icon={SkipForward}>
                  Pomiń sekcję
                </ActionButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Critical error component for form-wide errors
 * Used when the entire form cannot be loaded
 */
interface FormCriticalErrorProps {
  error: Error;
  onReset: () => void;
}

export function FormCriticalError({ error, onReset }: FormCriticalErrorProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Nie można załadować formularza
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Wystąpił krytyczny błąd podczas ładowania formularza. Spróbuj
            odświeżyć stronę lub skontaktuj się z pomocą techniczną.
          </p>
          <details className="text-xs text-gray-500 mb-4">
            <summary className="cursor-pointer hover:text-gray-700">
              Szczegóły błędu
            </summary>
            <p className="mt-2 p-2 bg-gray-50 rounded text-left break-all">
              {error.message}
            </p>
          </details>
        </div>

        <ActionButton onClick={onReset} icon={RefreshCw} variant="primary">
          Odśwież formularz
        </ActionButton>
      </div>
    </div>
  );
}

/**
 * Network error component for offline states
 */
interface NetworkErrorProps {
  onRetry: () => void;
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
      <div className="flex items-start gap-3">
        <WifiOff className="w-5 h-5 text-orange-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-orange-800 text-sm mb-1">
            Brak połączenia
          </h3>
          <p className="text-orange-700 text-sm mb-3">
            Sprawdź połączenie internetowe i spróbuj ponownie.
          </p>
          <ActionButton onClick={onRetry} icon={RefreshCw} variant="primary">
            Sprawdź połączenie
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

/**
 * Timeout error component
 */
interface TimeoutErrorProps {
  context: string;
  onRetry: () => void;
  onSkip?: () => void;
}

export function TimeoutError({ context, onRetry, onSkip }: TimeoutErrorProps) {
  return (
    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 text-sm mb-1">
            Przekroczono czas oczekiwania
          </h3>
          <p className="text-yellow-700 text-sm mb-3">
            {context} trwa dłużej niż zwykle. Spróbuj ponownie lub pomiń ten
            krok.
          </p>
          <div className="flex gap-2">
            <ActionButton onClick={onRetry} icon={RefreshCw} variant="primary">
              Spróbuj ponownie
            </ActionButton>
            {onSkip && (
              <ActionButton onClick={onSkip} icon={SkipForward}>
                Pomiń
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
