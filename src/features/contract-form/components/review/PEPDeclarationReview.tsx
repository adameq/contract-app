import { Badge } from '@/shared/components/ui/badge';

import { DataRow } from './DataRow';

interface PEPDeclarationReviewProps {
  question: string;
  isPEP: boolean | null;
  fields?: { label: string; value: string | null | undefined }[];
}

export function PEPDeclarationReview({
  question,
  isPEP,
  fields,
}: PEPDeclarationReviewProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{question}</span>
        <Badge variant={isPEP == null ? 'destructive' : 'outline'}>
          {isPEP === true ? 'Tak' : isPEP === false ? 'Nie' : 'do uzupełnienia'}
        </Badge>
      </div>
      {isPEP && fields && (
        <div className="space-y-1 pl-4">
          {fields.map(field => (
            <DataRow
              key={field.label}
              label={field.label}
              value={field.value}
            />
          ))}
        </div>
      )}
    </div>
  );
}
