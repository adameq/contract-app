/**
 * DataList Components
 *
 * Semantic components for displaying data in definition list format.
 * Extracted from CompanyFields for reusability across the application.
 *
 * These components use semantic HTML (<dl>, <dt>, <dd>) for better accessibility
 * and SEO. They're ideal for displaying key-value pairs in structured data contexts.
 *
 * Usage:
 * ```tsx
 * <DataSection title="Company Information">
 *   <DataRow label="Company Name" value={companyName} />
 *   <DataRow label="NIP" value={nip} />
 * </DataSection>
 * ```
 *
 * For simpler flex-based layouts (without semantic HTML), use review/DataRow.tsx instead.
 */

import React from 'react';

/**
 * DataRow - Displays a single labeled data value in definition list format
 *
 * Features:
 * - Semantic HTML (<dt> for label, <dd> for value)
 * - Responsive layout (stacked on mobile, side-by-side on desktop)
 * - Consistent empty value handling ("do uzupełnienia" for null/undefined)
 * - Accessible and SEO-friendly
 *
 * @param label - The label/key for the data (e.g., "Company Name")
 * @param value - The value to display (null/undefined shows "do uzupełnienia")
 */
export function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2">
      <dt className="text-sm font-medium text-muted-foreground sm:w-1/3">
        {label}
      </dt>
      <dd className="text-sm text-foreground mt-1 sm:mt-0 sm:w-2/3">
        {value ?? (
          <span className="text-destructive italic">do uzupełnienia</span>
        )}
      </dd>
    </div>
  );
}

/**
 * DataSection - Container for grouped DataRow items with title
 *
 * Features:
 * - Section title with bottom border
 * - Definition list (<dl>) semantics for grouped data
 * - Dividers between rows for visual separation
 * - Consistent spacing and typography
 *
 * @param title - Section title (e.g., "Company Identification")
 * @param children - DataRow components or other content
 */
export function DataSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-md font-medium text-foreground border-b border-border pb-2">
        {title}
      </h4>
      <dl className="divide-y divide-border/50">{children}</dl>
    </div>
  );
}
