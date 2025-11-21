import { AlertCircle } from 'lucide-react';

interface DataRowProps {
  label: string;
  value: string | null | undefined;
  error?: { message?: string }; // Field error from React Hook Form
  optional?: boolean; // Whether the field is optional (shows "-" instead of "do uzupełnienia" when empty)
}

export function DataRow({ label, value, error, optional = false }: DataRowProps) {
  // Treat empty strings as missing values (form defaults use '' not undefined)
  const displayValue = value?.trim() ? value.trim() : null;

  // Determine if field has an error
  const hasError = !!error;

  return (
    <div className="flex justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium flex items-center gap-1.5">
        {displayValue ? (
          // Has value - check for validation error
          <>
            <span className={hasError ? 'text-destructive' : ''}>
              {displayValue}
            </span>
            {hasError && (
              <AlertCircle
                className="h-3.5 w-3.5 text-destructive flex-shrink-0"
                aria-label="Błąd walidacji"
              />
            )}
          </>
        ) : (
          // No value - show appropriate indicator based on whether field is optional
          <span className={optional ? 'text-muted-foreground' : 'text-destructive italic'}>
            {optional ? '-' : 'do uzupełnienia'}
          </span>
        )}
      </span>
    </div>
  );
}
