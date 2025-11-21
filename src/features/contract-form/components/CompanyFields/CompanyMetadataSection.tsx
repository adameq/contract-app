import { Info } from 'lucide-react';
import type { CompanyFieldsState } from './types';
import styles from './CompanyMetadataSection.module.css';

interface CompanyMetadataSectionProps {
  value?: string;
  state: CompanyFieldsState;
}

/**
 * CompanyMetadataSection
 *
 * Displays verification metadata for company data, including the official
 * registry signature that serves as legal evidence of data authenticity.
 *
 * **Always visible** - Shows placeholder when no data fetched yet to avoid
 * user confusion about where metadata will appear.
 *
 * Features:
 * - Read-only display of registry signature
 * - Information tooltip explaining the significance
 * - Placeholder text when data not yet fetched
 * - Visually separated from main company fields
 *
 * Registry Signature Examples:
 * - "KRS stanZDnia 15.01.2024" - Official KRS extract timestamp
 * - "CEIDG id 550e8400-e29b..." - CEIDG record UUID
 * - "GUS sessionId abc123..." - GUS SOAP session identifier
 * - "Edytowane ręcznie 03.11.2025" - Manual edit marker with date
 */
export function CompanyMetadataSection({
  value,
  state,
}: CompanyMetadataSectionProps) {
  // Determine display text based on state and value
  const displayValue = value || 'Oczekiwanie na pobranie danych z rejestru...';
  const isEmpty = !value;

  return (
    <div className={styles.metadataSection}>
      <div className={styles.metadataHeader}>
        <Info className={styles.infoIcon} size={16} />
        <span className={styles.headerText}>Metadane weryfikacji</span>
      </div>

      <div className={styles.signatureContainer}>
        <label className={styles.signatureLabel}>
          Sygnatura weryfikacji
        </label>
        <div
          className={styles.signatureValue}
          title={value || 'Brak danych'}
          style={{
            opacity: isEmpty ? 0.6 : 1,
            fontStyle: isEmpty ? 'italic' : 'normal'
          }}
        >
          {displayValue}
        </div>
        <p className={styles.signatureDescription}>
          Oficjalna sygnatura rejestru służąca jako dowód autentyczności danych
          w postępowaniach prawnych
        </p>
      </div>
    </div>
  );
}
