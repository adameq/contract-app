import { cn } from '@/shared/lib/utils';

import { pepSectionsConfig } from '../config/pepConfig';
import { PEPSection } from './PEPSection';

interface PEPDeclarationSectionProps {
  className?: string;
}

/**
 * Main PEP Declaration Section Component
 * Contains three subsections for PEP status declarations as required by AML regulations
 * ✅ TYPE-SAFE: Uses centralized state management with no duplicate useWatch calls
 */
export function PEPDeclarationSection({
  className = '',
}: PEPDeclarationSectionProps) {
  // ✅ SIMPLIFIED: No need for useWatch - state is managed in individual sections

  return (
    <section
      className={cn('w-full max-w-7xl mx-auto p-4 sm:p-6', className)}
      id="pep-declarations-section"
      aria-labelledby="pep-declarations-heading"
    >
      <div className="space-y-8">
        {/* Section title and legal notice */}
        <div className="space-y-4">
          <h2
            id="pep-declarations-heading"
            className="text-xl sm:text-2xl font-semibold text-foreground"
          >
            Oświadczenie w sprawie zajmowania eksponowanego stanowiska
            politycznego
          </h2>

          {/* Legal disclaimer - natural text flow */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Będąc świadomy odpowiedzialności karnej za złożenie fałszywego
            oświadczenia, zgodnie z art. 46 Ustawy z dnia 1 marca 2018 r. o
            przeciwdziałaniu praniu pieniędzy oraz finansowaniu terroryzmu (Dz.
            U. z 2022 r. poz. 593, zwana dalej: Ustawą) oświadczam, że:
          </p>
        </div>

        {/* ✅ TYPE-SAFE: Generic PEP sections with centralized state management */}
        <div className="space-y-8">
          {pepSectionsConfig.map(sectionConfig => (
            <PEPSection key={sectionConfig.id} config={sectionConfig} />
          ))}
        </div>
      </div>
    </section>
  );
}
