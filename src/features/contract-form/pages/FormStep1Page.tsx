/**
 * Form Step 1: Podstawy
 *
 * User selects signature method (userType moved to step 3)
 */

import { SignatureMethodSection } from '../components/SignatureMethodSection';

export default function FormStep1Page() {
  return (
    <div className="space-y-8">
      {/* Main form title - only displayed on step 1 */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Formularz danych do umowy pośrednictwa
        </h1>
      </div>

      <SignatureMethodSection />
    </div>
  );
}
