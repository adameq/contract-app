/**
 * Error fallback component for missing step configuration
 *
 * This component is rendered when step configuration is corrupted or missing.
 * It should never appear in production if STEP_CONFIGS is properly maintained.
 *
 * Provides:
 * - Clear error message for developers
 * - Recovery action for users (return to step 1)
 * - Better UX than white screen or crash
 *
 * **Resilience Design**:
 * Uses Link component instead of useNavigate() for maximum reliability in error scenarios.
 * If React Router context is broken (critical error), Link gracefully degrades to <a> tag,
 * while useNavigate() would throw and crash. This ensures users can always recover.
 */

import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';

export function StepNotFoundError() {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-red-600">
            Configuration Error
          </h1>
          <p className="text-gray-600">
            Step configuration is missing or corrupted.
          </p>
          <p className="text-sm text-gray-500">
            This should not happen in production. Please contact support if you
            see this message.
          </p>
        </div>

        <Button asChild size="lg">
          <Link to="/form/step/1">Return to Start</Link>
        </Button>
      </div>
    </div>
  );
}
