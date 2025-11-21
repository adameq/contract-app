/**
 * Loading skeleton components for React 19 Suspense fallbacks
 *
 * Provides consistent loading states for different sections of the form
 * while data is being fetched using the use() hook.
 */

import { Building2, FileText } from 'lucide-react';

import { Spinner } from '@/shared/components/ui/spinner';

/**
 * Base skeleton component with common styling
 */
interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
}

function Skeleton({
  className = '',
  height = 'h-4',
  width = 'w-full',
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${height} ${width} ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton line component for text content
 */
function SkeletonLine({ width = 'w-full' }: { width?: string }) {
  return <Skeleton height="h-4" width={width} className="mb-2" />;
}

/**
 * Skeleton input field component
 */
function SkeletonInput({ label }: { label?: string }) {
  return (
    <div className="space-y-2">
      {label && <SkeletonLine width="w-24" />}
      <Skeleton height="h-10" className="rounded-md" />
    </div>
  );
}

/**
 * Progress indicator for loading states
 */
interface ProgressIndicatorProps {
  stage: 'initializing' | 'fetching' | 'processing';
  estimatedTime?: string;
  context: string;
}

function ProgressIndicator({
  stage,
  estimatedTime,
  context,
}: ProgressIndicatorProps) {
  const getStageMessage = (stage: string, context: string) => {
    switch (stage) {
      case 'initializing':
        return `Inicjalizacja ${context}...`;
      case 'fetching':
        return `Pobieranie danych ${context}...`;
      case 'processing':
        return `Przetwarzanie ${context}...`;
      default:
        return `Ładowanie ${context}...`;
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
      <Spinner />
      <span>{getStageMessage(stage, context)}</span>
      {estimatedTime && (
        <span className="text-xs text-gray-500">({estimatedTime})</span>
      )}
    </div>
  );
}

/**
 * Company data loading skeleton
 * Used while fetching company information from GUS registry
 */
interface CompanyDataSkeletonProps {
  showProgressIndicator?: boolean;
  estimatedTime?: string;
}

export function CompanyDataSkeleton({
  showProgressIndicator = true,
  estimatedTime = '2-3 sekundy',
}: CompanyDataSkeletonProps) {
  return (
    <div className="space-y-4">
      {showProgressIndicator && (
        <ProgressIndicator
          stage="fetching"
          estimatedTime={estimatedTime}
          context="danych firmy"
        />
      )}

      <div className="flex items-center gap-2 text-blue-600 mb-4">
        <Building2 className="w-5 h-5" />
        <span className="font-medium text-sm">
          Pobieranie danych z rejestru GUS
        </span>
      </div>

      <div className="grid gap-4">
        {/* Company name */}
        <SkeletonInput label="Nazwa firmy" />

        {/* REGON */}
        <div className="grid grid-cols-2 gap-4">
          <SkeletonInput label="REGON" />
          <SkeletonInput label="KRS" />
        </div>

        {/* Address */}
        <div className="space-y-4">
          <SkeletonLine width="w-16" />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <SkeletonInput />
            </div>
            <SkeletonInput />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SkeletonInput />
            <SkeletonInput />
          </div>
        </div>
      </div>

      {/* Hint text */}
      <div className="text-xs text-gray-500 mt-3">
        Dane są automatycznie pobierane z Głównego Urzędu Statystycznego
      </div>
    </div>
  );
}

/**
 * Address fields loading skeleton
 * Used for address validation/completion
 */
export function AddressFieldsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-blue-600 mb-3">
        <FileText className="w-4 h-4" />
        <span className="font-medium text-sm">Uzupełnianie adresu</span>
      </div>

      <div className="grid gap-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <SkeletonInput />
          </div>
          <SkeletonInput />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SkeletonInput />
          <SkeletonInput />
        </div>
      </div>
    </div>
  );
}

/**
 * Generic form section skeleton
 * Reusable for various form sections
 */
interface FormSectionSkeletonProps {
  title?: string;
  fieldCount?: number;
  showIcon?: boolean;
}

export function FormSectionSkeleton({
  title = 'Ładowanie sekcji',
  fieldCount = 3,
  showIcon = true,
}: FormSectionSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600 mb-4">
        {showIcon && <Spinner />}
        <span className="font-medium text-sm">{title}</span>
      </div>

      <div className="space-y-3">
        {Array.from({ length: fieldCount }, (_, i) => (
          <SkeletonInput key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Form initialization skeleton
 * Used when the entire form is loading
 */
export function FormInitializationSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-3">
        <Spinner className="w-8 h-8 mx-auto text-blue-500" />
        <div>
          <SkeletonLine width="w-48 mx-auto" />
          <SkeletonLine width="w-32 mx-auto" />
        </div>
      </div>

      <div className="space-y-6">
        <FormSectionSkeleton
          title="Ładowanie danych użytkownika"
          fieldCount={2}
        />
        <FormSectionSkeleton title="Ładowanie danych firmy" fieldCount={4} />
        <FormSectionSkeleton title="Ładowanie adresu" fieldCount={3} />
      </div>
    </div>
  );
}

/**
 * Smart skeleton that adapts based on context and elapsed time
 */
interface SmartSkeletonProps {
  context: 'company-data' | 'address' | 'generic';
  showProgress?: boolean;
  estimatedTime?: string;
}

export function SmartSkeleton({
  context,
  showProgress = true,
  estimatedTime,
}: SmartSkeletonProps) {
  switch (context) {
    case 'company-data':
      return (
        <CompanyDataSkeleton
          showProgressIndicator={showProgress}
          estimatedTime={estimatedTime}
        />
      );
    case 'address':
      return <AddressFieldsSkeleton />;
    default:
      return <FormSectionSkeleton showIcon={showProgress} />;
  }
}

/**
 * Skeleton for error recovery states
 * Shows when retrying after an error
 */
export function RetryingSkeleton({ context }: { context: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-orange-600">
        <Spinner />
        <span className="text-sm font-medium">Ponowne próby {context}...</span>
      </div>
      <div className="space-y-2">
        <SkeletonLine width="w-3/4" />
        <SkeletonLine width="w-1/2" />
      </div>
    </div>
  );
}
