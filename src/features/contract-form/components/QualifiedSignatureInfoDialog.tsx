import { Info } from 'lucide-react';
import { useId } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';

/**
 * Qualified Signature Info Dialog
 * Self-contained dialog component with internal state management
 */
export function QualifiedSignatureInfoDialog() {
  // Unique ID for accessibility
  const dialogDescriptionId = useId();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className="text-sm h-auto p-0 font-normal"
        >
          <Info className="h-4 w-4 mr-1" aria-hidden="true" />
          Więcej informacji
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col max-h-[90vh] p-0 sm:max-w-[600px]"
        aria-describedby={dialogDescriptionId}
      >
        <div className="p-4 sm:p-6 border-b border-border">
          <DialogHeader>
            <DialogTitle>
              Informacje o Kwalifikowanym Podpisie Elektronicznym
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div
            id={dialogDescriptionId}
            className="space-y-4 text-sm text-foreground"
            role="region"
            aria-label="Szczegóły informacji o Kwalifikowanym Podpisie Elektronicznym"
          >
            <p>
              Zgodnie z zapisami Ustawy o Gospodarce Nieruchomościami (art. 180a
              Ustawy z dnia 21 sierpnia 1997 r. z późniejszymi zmianami), umowa
              pośrednictwa wymaga zabezpieczenia w formie kwalifikowanego
              podpisu elektronicznego, aby była prawnie wiążąca.
            </p>

            {/* mObywatel - recommended option */}
            <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-500 dark:border-green-700 rounded-lg p-4">
              <p className="font-bold text-green-800 dark:text-green-200 mb-2 text-base">
                ✓ Zalecana opcja: Aplikacja mObywatel (DARMOWA)
              </p>
              <p className="mb-2">
                Polska jako pierwsza w UE oferuje{' '}
                <strong>bezpłatny podpis kwalifikowany</strong> w rządowej
                aplikacji mObywatel. Możesz podpisać{' '}
                <strong>5 dokumentów miesięcznie za darmo</strong>.
              </p>

              <div className="space-y-2 mb-3">
                <p className="font-medium">Wymagania:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Plastikowy e-dowód (wydany po 4 marca 2019 r.)</li>
                  <li>Aplikacja mObywatel z aktywnym mDowód</li>
                  <li>Smartfon z modułem NFC</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Przydatne linki:</p>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="https://www.youtube.com/watch?v=ldUaq02Jf4U"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link hover:text-link-hover hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    >
                      https://www.youtube.com/watch?v=ldUaq02Jf4U
                    </a>{' '}
                    - Instrukcja wideo, jak korzystać z podpisu kwalifikowanego
                    w mObywatel
                  </li>
                  <li>
                    <a
                      href="https://info.mobywatel.gov.pl/uslugi/podpis-kwalifikowany"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link hover:text-link-hover hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    >
                      https://info.mobywatel.gov.pl/uslugi/podpis-kwalifikowany
                    </a>{' '}
                    - Oficjalna strona mObywatel ze szczegółowymi informacjami o
                    usłudze
                  </li>
                  <li>
                    <a
                      href="https://podpis.mobywatel.gov.pl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link hover:text-link-hover hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    >
                      https://podpis.mobywatel.gov.pl/
                    </a>{' '}
                    - Strona do podpisywania dokumentów przez komputer
                    (potwierdzenie przez telefon)
                  </li>
                </ul>
              </div>
            </div>

            {/* Other qualified signature providers */}
            <div>
              <p className="font-medium mb-2">
                Inne dopuszczone kwalifikowane podpisy elektroniczne:
              </p>
              <p className="mb-2">
                Alternatywnie można użyć certyfikatu od innych zaufanych
                dostawców:{' '}
                <a
                  href="https://autenti.com/pl/podpisy-kwalifikowane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:text-link-hover hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  https://autenti.com/pl/podpisy-kwalifikowane
                </a>
              </p>

              <div className="space-y-1">
                <p className="text-success">✓ Podpisy kwalifikowane InfoCert</p>
                <p className="text-success">
                  ✓ Podpisy kwalifikowane SimplySign
                </p>
                <p className="text-success">✓ Podpisy kwalifikowane CenCert</p>
                <p className="text-success">✓ Podpisy kwalifikowane EuroCert</p>
                <p className="text-success">✓ Podpisy kwalifikowane Sigillum</p>
                <p className="text-success">
                  ✓ Podpisy kwalifikowane mSzafir (przez bankowość online)
                </p>
              </div>
            </div>

            {/* Not acceptable signatures */}
            <div>
              <p className="mb-2">
                Zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE)
                Nr 910/2014 z dnia 23 lipca 2014 r. w sprawie identyfikacji
                elektronicznej i usług zaufania,{' '}
                <span className="text-destructive font-medium">
                  nie są dopuszczalne
                </span>{' '}
                następujące formy podpisu:
              </p>

              <div className="space-y-1">
                <p className="text-destructive">✗ Profil Zaufany ePUAP</p>
                <p className="text-destructive">✗ Zwykły e-podpis</p>
                <p className="text-destructive">
                  ✗ Zaawansowany e-podpis (bez certyfikatu kwalifikowanego)
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 border-t border-border">
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Zamknij</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
