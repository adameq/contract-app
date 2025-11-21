# TheSpace - Formularz Biznesowy (React)

Nowoczesna aplikacja formularza biznesowego dla polskich przedsiębiorstw z integracją z krajowymi rejestrami biznesowymi.

## 📋 Opis Projektu

Projekt TheSpace to zaawansowana aplikacja formularza biznesowego stworzona dla polskich firm i przedsiębiorców. Aplikacja umożliwia rejestrację i zarządzanie danymi biznesowymi z pełną integracją z polskimi rejestrami takimi jak GUS, CEIDG, CRBR i KRS.

### Cel Projektu

Migracja z przestarzałej aplikacji VanillaJS do nowoczesnego stosu React TypeScript z zaawansowanym zarządzaniem formularzem i walidacją.

## 🚀 Technologie

### Stack Technologiczny

- **React 19.1.1** - Najnowsza wersja React z funkcjami współbieżnymi
- **TypeScript 5.9.2** - Ścisłe typowanie i bezpieczeństwo kodu
- **Tailwind CSS 4.1.13** - Nowoczesne stylowanie utility-first
- **shadcn/ui** - Komponenty UI oparte na Radix UI + Tailwind
- **Vite 7.1.6** - Szybkie narzędzie do budowania z HMR
- **pnpm 10.17.0** - Wydajny menedżer pakietów

### Zarządzanie Formularzem

- **React Hook Form 7.63.0** - Wydajne zarządzanie formularzem
- **Zod 4.1.9** - Walidacja schematów TypeScript-first
- **Discriminated Unions** - Bezpieczne typowanie oparte na typie użytkownika

### Komponenty UI

- **Radix UI** - Dostępne, niezastylowane prymitywy UI
- **class-variance-authority** - Bezpieczne typowanie wariantów stylów
- **Lucide React** - Ikony SVG wysokiej jakości

## ✨ Funkcjonalności

### Typy Użytkowników

1. **Firma** - Pełny podmiot gospodarczy
   - Wymagane: NIP, REGON, KRS, nazwa firmy, adres, status VAT
   - Walidacja: Pełna walidacja rejestrów biznesowych
   - Integracja: Automatyczne pobieranie danych z GUS API

2. **Konsument z VAT** - Osoba prywatna z VAT
   - Wymagane: Tylko NIP
   - Walidacja: Format NIP + walidacja sumy kontrolnej
   - Zastosowanie: Osoby prywatne z rejestracją VAT

3. **Konsument** - Zwykła osoba prywatna
   - Wymagane: Tylko dane osobowe
   - Walidacja: Podstawowe informacje osobowe
   - Zastosowanie: Standardowi konsumenci

### Walidacja Polskich Numerów

- **NIP** - 10-cyfrowy numer identyfikacji podatkowej z walidacją sumy kontrolnej
- **PESEL** - 11-cyfrowy numer identyfikacji osobistej
- **REGON** - 9 lub 14-cyfrowy numer rejestru gospodarczego
- **KRS** - 10-cyfrowy numer rejestru sądowego
- **Kod pocztowy** - Walidacja formatu XX-XXX

### Integracja z Polskimi Rejestrami

**Aplikacja integruje się z dedykowanym API serwisem:** [TheSpace GUS API](https://github.com/adameq/thespace-gus-api)

- **GUS API** - Główny Urząd Statystyczny
- **CEIDG** - Centralna Ewidencja i Informacja o Działalności Gospodarczej
- **CRBR** - Centralny Rejestr Beneficjentów Rzeczywistych
- **KRS** - Krajowy Rejestr Sądowy

> **Architektura Multirepo**: API zostało wydzielone do osobnego repozytorium w celu umożliwienia konsumpcji przez wielu klientów (TheSpace form, integracja Pipedrive).

### System PEP (Politically Exposed Person)

- **Oświadczenia PEP** - Zgodność z przepisami AML
- **Trzy kategorie**: Osobiste, Rodzinne, Współpracownik
- **Dynamiczne generowanie pól** na podstawie konfiguracji
- **Szczegółowe definicje prawne** z wyjaśnieniami w dialogach

## 🛠️ Uruchomienie Projektu

### Wymagania

- Node.js 20+
- pnpm 8+

### Instalacja

```bash
# Sklonuj repozytorium
git clone [url-repozytorium]

# Przejdź do katalogu aplikacji React
cd thespace-react-form

# Zainstaluj zależności
pnpm install
```

### Deployment

**Platform:** Cloudflare Pages (Git Integration)

**Build Configuration:**
- Build command: `pnpm install && pnpm build`
- Build output directory: `dist`
- Node version: `20`

**Required Environment Variables:**
- `VITE_BACKEND_API_URL` - Backend API endpoint (e.g., https://companies-app.thespace.rent)
- `VITE_BACKEND_API_KEY` - Backend API authentication key
- `VITE_MAKE_WEBHOOK_URL` - Make.com webhook URL
- `VITE_MAKE_API_KEY` - Make.com API key

Environment variables are configured in Cloudflare Pages dashboard (not in GitHub Secrets).

### Komendy Deweloperskie

#### Podstawowe Komendy

```bash
pnpm dev               # Uruchomienie serwera deweloperskiego (localhost:5173)
pnpm build             # Budowanie do produkcji
pnpm build:check       # Sprawdzenie typów + budowanie (zalecane)
pnpm preview           # Podgląd buildu produkcyjnego
```

#### Kontrola Jakości Kodu

```bash
pnpm type-check        # Walidacja TypeScript
pnpm lint              # ESLint z type-aware rules
pnpm lint:fix          # Automatyczne naprawy ESLint
pnpm format:check      # Sprawdzenie formatowania Prettier
pnpm format:fix        # Automatyczne formatowanie
pnpm check             # Pełna walidacja (format + lint)
pnpm fix               # Automatyczne naprawy (format + lint)
```

## 📁 Struktura Projektu

```
src/
├── app/                    # Konfiguracja aplikacji
│   ├── App.tsx            # Główny komponent aplikacji
│   └── main.tsx           # Punkt wejścia aplikacji
├── features/              # Moduły funkcjonalne
│   └── contract-form/     # Główna funkcjonalność formularza
│       ├── components/    # Komponenty specyficzne dla funkcji
│       ├── hooks/         # Custom hooks
│       ├── constants/     # Stałe funkcji
│       ├── utils/         # Narzędzia funkcji
│       ├── schema.ts      # Schema walidacji Zod
│       └── types.ts       # Typy TypeScript
├── shared/               # Zasoby współdzielone
│   ├── components/       # Komponenty wielokrotnego użytku
│   │   ├── common/       # Wspólne komponenty biznesowe
│   │   └── ui/           # Komponenty shadcn/ui
│   ├── hooks/            # Generyczne hooks
│   ├── lib/              # Biblioteki narzędziowe
│   │   └── validation/   # Narzędzia walidacji
│   ├── api/              # Klient API (integracja z zewnętrznym API)
│   └── constants/        # Stałe globalne
└── assets/               # Zasoby statyczne
```

## 🏗️ Architektura

### Zarządzanie Stanem Formularza

- **React Hook Form** - Wydajne zarządzanie formularzem z minimalnymi re-renderami
- **Zod Discriminated Unions** - Bezpieczne typowanie oparte na typie użytkownika
- **Smart Cleanup** - Inteligentne czyszczenie danych przy zmianie typu użytkownika

### Optymalizacje Wydajności

- **React.memo** - Zapobieganie niepotrzebnym re-renderom
- **Izolowane komponenty** - Każda sekcja renderuje się niezależnie
- **AbortController** - Anulowanie nieaktualnych żądań do zewnętrznego API
- **Lazy Loading** - Gotowość do leniwego ładowania sekcji
- **Zewnętrzne API** - Integracja z dedykowanym serwisem TheSpace GUS API

### Wzorce Komponentów

- **Compound Components** - Kompozycja sekcji formularza
- **Configuration-driven** - Sekcje PEP oparte na konfiguracji
- **Custom Hooks Ecosystem** - Zestaw specjalistycznych hooks

## 🔧 Konfiguracja Deweloperska

### TypeScript

- Ścisłe sprawdzanie typów włączone
- Type-aware reguły ESLint
- Aliasy ścieżek: `@/` → `src/`

### ESLint

- Reguły dostępności (jsx-a11y)
- Integracja z Prettier
- Sortowanie i organizacja importów
- Usuwanie nieużywanych importów

### Stylowanie

- **Wyłącznie Tailwind CSS** - Bez niestandardowych plików CSS
- **shadcn/ui** - Obowiązkowe dla wszystkich komponentów UI
- **Class Variance Authority** - Bezpieczne typowanie wariantów

## 📚 Dokumentacja

### Szczegółowa Dokumentacja

Kompletna dokumentacja techniczna dostępna w pliku `CLAUDE.md` w katalogu głównym projektu.

### Kluczowe Pliki

- `src/features/contract-form/schema.ts` - Schema walidacji Zod
- `src/shared/lib/nipValidation.ts` - Logika walidacji NIP
- `src/shared/lib/validation/messages.ts` - Komunikaty błędów
- `src/features/contract-form/hooks/` - Custom hooks

## 🔒 Compliance i Bezpieczeństwo

### Zgodność Prawna

- **AML (Anti-Money Laundering)** - Zgodność z przepisami przeciwdziałania praniu pieniędzy
- **PEP Compliance** - Oświadczenia osób zajmujących eksponowane stanowiska polityczne
- **RODO/GDPR** - Ochrona danych osobowych

### Bezpieczeństwo

- **Sanityzacja inputów** - Wszystkie dane wejściowe są sanityzowane
- **Walidacja po stronie klienta i serwera** - Podwójna walidacja
- **Zabezpieczenia XSS** - Właściwe escapowanie w JSX

## 🤝 Rozwój

### Standardy Jakości

- Ścisłe typowanie TypeScript
- Reguły ESLint z type-aware sprawdzaniem
- Integracja Prettier
- Konwencje nazewnictwa i organizacji kodu

### Dodawanie Nowych Funkcji

1. Aktualizacja schema w `schema.ts`
2. Dodanie komponentów UI z shadcn/ui
3. Implementacja custom hooks jeśli potrzebne
4. Dodanie walidacji i komunikatów błędów
5. Testowanie i dokumentacja

## 📞 Wsparcie

Dla szczegółowych informacji technicznych i wzorców projektowych, zapoznaj się z plikiem `CLAUDE.md` w katalogu głównym projektu.

## 📄 Licencja

Projekt prywatny - wszystkie prawa zastrzeżone.
