/**
 * Form Step 4: Deklaracje PEP
 *
 * User provides PEP (Politically Exposed Person) declarations
 */

import { PEPDeclarationSection } from '../components/PEPDeclarationSection';

export default function FormStep4Page() {
  return (
    <div className="space-y-6">
      <PEPDeclarationSection />
    </div>
  );
}
