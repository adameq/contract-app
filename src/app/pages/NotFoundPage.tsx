/**
 * 404 Not Found Page
 *
 * Displayed when user navigates to a non-existent route.
 * Uses PageLayout for consistent header (logo + theme toggle).
 *
 * **UX Benefits**:
 * - Clear communication that page doesn't exist
 * - Recovery action (return to form)
 * - Better than silent redirect (preserves user context)
 * - Consistent branding via shared header
 *
 * **SEO Benefits**:
 * - Proper 404 semantics (better than redirect)
 * - Search engines understand this is not a valid page
 * - Prevents indexing of invalid routes
 */

import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">
            Strona nie została znaleziona
          </h2>
          <p className="text-muted-foreground">
            Przepraszamy, strona którą próbujesz odwiedzić nie istnieje.
          </p>
        </div>

        <Button asChild size="lg">
          <Link to={ROUTES.FORM_STEP_1}>Przejdź do formularza</Link>
        </Button>
      </div>
    </div>
  );
}
