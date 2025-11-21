import { Building2, User, UserCheck } from 'lucide-react';

import type { UserTypeOption } from '@/features/contract-form/ui-types';

export const userTypeOptions: UserTypeOption[] = [
  {
    id: 'company',
    title: 'Firma',
    subtitle: 'Podmiot gospodarczy',
    description:
      'Jednoosobowa Działalność Gospodarcza, Spółka z o. o., Spółka Osobowa, Stowarzyszenie, Spółdzielnia itd.',
    icon: Building2,
    badge: 'Biznes',
    badgeVariant: 'green',
  },
  {
    id: 'consumer-vat',
    title: 'Konsument (Płatnik VAT)',
    subtitle: 'Osoba prywatna z VAT',
    description:
      'Osoba prywatna, nie prowadząca działalności gospodarczej, ale rozliczająca podatek VAT (po zgłoszeniu VAT-R).',
    icon: UserCheck,
    badge: 'VAT',
    badgeVariant: 'blue',
  },
  {
    id: 'consumer',
    title: 'Konsument',
    subtitle: 'Osoba prywatna',
    description:
      'Osoba prywatna, nie prowadząca działalności gospodarczej oraz nie rozliczająca podatku VAT z Urzędem Skarbowym. Ta opcja dotyczy również osób, które planują lub są w trakcie zakładania działalności gospodarczej lub spółki.',
    icon: User,
    badge: 'Standard',
    badgeVariant: 'amber',
  },
];
