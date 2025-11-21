import { AlertCircle, Check, Edit } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

import { useStepNavigation } from '../../hooks/useStepNavigation';

interface ReviewSectionProps {
  title: string;
  stepNumber: number;
  children: React.ReactNode;
  hasErrors?: boolean; // Indicates if any field in this section has validation errors
}

export function ReviewSection({
  title,
  stepNumber,
  children,
  hasErrors = false,
}: ReviewSectionProps) {
  const { goToStep } = useStepNavigation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {hasErrors ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : (
            <Check className="h-5 w-5 text-success" />
          )}
          {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            goToStep(stepNumber);
          }}
          type="button"
          className="cursor-pointer dark:hover:bg-accent dark:hover:text-accent-foreground"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edytuj
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
