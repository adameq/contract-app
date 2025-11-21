import { FileCheck, User } from 'lucide-react';

import type { SignatureOption } from '@/features/contract-form/ui-types';

export const signatureOptions: SignatureOption[] = [
  {
    id: 'qualified',
    title: 'Podpis kwalifikowany',
    subtitle: 'mObywatel lub podpis Kwalifikowany',
    description:
      'Umowę podpisze Pan(i) całkowicie zdalnie, używając darmowej aplikacji mObywatel lub własnego certyfikatu podpisu kwalifikowanego.',
    icon: FileCheck,
    badge: 'Najpopularniejszy',
    badgeVariant: 'green',
    requiresModal: true,
  },
  {
    id: 'in-person',
    title: 'Spotkanie z doradcą',
    subtitle: 'Spotkanie z naszym przedstawicielem',
    description:
      'Wygenerujemy umowę i prześlemy ją mailem. Nasz doradca skontaktuje się z Panem/Panią, aby umówić spotkanie w dogodnym terminie i podpisać umowę osobiście.',
    icon: User,
    badge: 'Bezpośredni kontakt',
    badgeVariant: 'default',
  },
];
