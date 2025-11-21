/**
 * Form Success Page
 *
 * Displayed after successful form submission.
 *
 * **Data Clearing Strategy:**
 * Form data is cleared in FormStepLayout.tsx immediately after successful submission
 * (in onSuccess callback). No need to clear again here - data is already gone.
 */

import { Check, Download, Mail } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { ROUTES } from '@/shared/constants/routes';

export default function FormSuccessPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();

  const handleNewForm = () => {
    // Navigate to step 1 to start a new form
    // (storage already cleared in FormStepLayout.tsx onSuccess)
    void navigate(ROUTES.FORM_STEP_1);
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          {/* Success icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <Check className="h-8 w-8 text-success" />
          </div>

          <CardTitle className="text-3xl font-bold text-success">
            Formularz wysłany pomyślnie!
          </CardTitle>

          <p className="text-muted-foreground">
            Dziękujemy za wypełnienie formularza. Twoje dane zostały przekazane
            do przetworzenia.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Contract ID */}
          {contractId && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Numer umowy:
              </p>
              <p className="text-2xl font-mono font-bold">{contractId}</p>
              <p className="text-xs text-muted-foreground">
                Zachowaj ten numer do dalszej korespondencji
              </p>
            </div>
          )}

          {/* Next steps */}
          <div className="space-y-4">
            <h3 className="font-semibold">Co dalej?</h3>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="rounded-full bg-primary/10 p-2 mt-1">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Email potwierdzający</p>
                  <p className="text-sm text-muted-foreground">
                    Na podany adres email zostanie wysłane potwierdzenie z
                    dalszymi instrukcjami.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="rounded-full bg-primary/10 p-2 mt-1">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Umowa do pobrania</p>
                  <p className="text-sm text-muted-foreground">
                    Link do pobrania umowy w formacie PDF zostanie wysłany w
                    emailu potwierdzającym.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => void navigate(ROUTES.ROOT)}
            >
              Wróć na stronę główną
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={handleNewForm}
            >
              Wypełnij kolejny formularz
            </Button>
          </div>

          {/* Support info */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              Masz pytania? Skontaktuj się z nami:{' '}
              <a
                href="mailto:support@thespace.pl"
                className="text-primary hover:underline"
              >
                support@thespace.pl
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
