/**
 * Form Step 2: Dane osobowe
 *
 * User provides signatory information and contact data
 */

import { ContactDataSection } from '../components/ContactDataSection';
import { SignatoryDataSection } from '../components/SignatoryDataSection';

export default function FormStep2Page() {
  return (
    <div className="space-y-6">
      <SignatoryDataSection />
      <ContactDataSection />
    </div>
  );
}
