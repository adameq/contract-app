/**
 * Loading fallback component for lazy-loaded pages
 *
 * Shows skeleton UI while step pages are being code-split loaded.
 * Used as Suspense fallback for:
 * - Form steps (step 1-6)
 * - Success page
 *
 * Centralized in shared/components/common for reusability and consistency.
 */

import { Skeleton } from '@/shared/components/ui/skeleton';

export function StepLoadingFallback() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Section skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" /> {/* Heading */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" /> {/* Input field */}
          <Skeleton className="h-10 w-full" /> {/* Input field */}
          <Skeleton className="h-10 w-2/3" /> {/* Input field */}
        </div>
      </div>

      {/* Second section skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" /> {/* Heading */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" /> {/* Input field */}
          <Skeleton className="h-10 w-full" /> {/* Input field */}
        </div>
      </div>
    </div>
  );
}
