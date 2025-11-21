# Pipedrive Integration - Dokumentacja

Implementacja bezpiecznej walidacji Person ID z Pipedrive dla kontroli dostępu do formularza.

## 📋 Spis treści

- [Architektura](#architektura)
- [Bezpieczeństwo](#bezpieczeństwo)
- [Konfiguracja](#konfiguracja)
- [Development](#development)
- [Deployment](#deployment)
- [Testowanie](#testowanie)

---

## Architektura

### Przebieg walidacji

```
1. Użytkownik → URL z parametrami
   https://form.thespace.rent/?pid=12345&option=01&created=2024-03-15

2. React App → Cloudflare Function
   POST /api/validate-pid
   Body: { pid: "12345", option: "01", created: "2024-03-15" }

3. Cloudflare Function → Pipedrive API
   GET /v1/persons/12345?api_token=XXXXXX

4. Walidacja wielowarstwowa:
   ✓ Osoba istnieje w Pipedrive
   ✓ Custom field = '234' (formularz wygenerowany)
   ✓ Data utworzenia = 2024-03-15 (zapobiega zgadywaniu PID)

5. Cloudflare Function → React App
   { valid: true, personData: { id, name } }

6. React App:
   - valid = true → Wyświetl formularz
   - valid = false → Redirect na thespace.rent
```

### Komponenty

**Backend (Cloudflare Functions):**
- `/functions/api/validate-pid.ts` - Endpoint walidacji
- `/functions/types.ts` - TypeScript types
- `/functions/tsconfig.json` - TS config

**Frontend (React):**
- `src/shared/api/pipedrive.ts` - API client
- `src/shared/api/pipedrive.types.ts` - Types
- `src/features/contract-form/hooks/usePidValidation.ts` - Hook walidacji
- `src/features/contract-form/store/useFormPersistStore.ts` - Store (rozszerzony)
- `src/features/contract-form/components/layout/FormStepLayout.tsx` - Integracja

---

## Bezpieczeństwo

### ✅ Co jest bezpieczne

1. **Token Pipedrive NIGDY w przeglądarce**
   - Token tylko w Cloudflare env vars
   - Nigdy w bundle JS
   - Nigdy w Network tab

2. **Walidacja wielowarstwowa**
   - PID musi istnieć
   - Custom field musi mieć wartość '234'
   - **Data utworzenia musi się zgadzać** (zapobiega zgadywaniu PID)

3. **Dodatkowa warstwa: Data utworzenia**
   - Użytkownik musi znać PID + datę utworzenia
   - Exact match (YYYY-MM-DD)
   - Znacznie trudniejsze do zgadnięcia niż sam PID

### ⚠️ Potencjalne problemy

**CORS (jeśli bezpośrednie wywołanie Pipedrive):**
- Obecna implementacja: Cloudflare Function = proxy → **brak problemu**
- Gdyby client-side: Pipedrive API może blokować CORS

**Rate limiting:**
- Cloudflare automatycznie limituje
- Można dodać własny rate limiting w Function

---

## Konfiguracja

### 1. Environment Variables

#### **Cloudflare Dashboard** (Production/Preview)

Przejdź do: `Cloudflare Dashboard → Pages → Settings → Environment Variables`

Dodaj następujące zmienne:

```bash
# Pipedrive API
PIPEDRIVE_API_URL=https://api.pipedrive.com/v1
PIPEDRIVE_API_TOKEN=your-actual-pipedrive-token

# Custom field configuration
PIPEDRIVE_CUSTOM_FIELD_KEY=f65fca61a8ac7eef5757b18f3e1a15739901c529
PIPEDRIVE_CUSTOM_FIELD_VALUE=234

# Feature flag
PIPEDRIVE_ENABLED=false  # Ustaw 'true' gdy gotowe do użycia
```

#### **Local Development** (.dev.vars)

```bash
# 1. Skopiuj example file
cp .dev.vars.example .dev.vars

# 2. Edytuj .dev.vars i uzupełnij prawdziwe wartości
# 3. .dev.vars jest gitignored - NIE commituj!
```

#### **React App** (.env)

```bash
# Feature flag dla frontendu
VITE_PIPEDRIVE_ENABLED=false  # 'true' aby włączyć walidację
```

### 2. Pipedrive Automation

Skonfiguruj automation w Pipedrive który generuje linki do formularza:

```
Format URL:
https://form.thespace.rent/?pid={{person.id}}&option=01&created={{person.add_time | date: 'Y-m-d'}}

Przykład:
https://form.thespace.rent/?pid=12345&option=01&created=2024-03-15
```

**Parametry:**
- `pid` - Pipedrive Person ID (wymagany)
- `option` - Numer opcji formularza 01-10 (wymagany)
- `created` - Data utworzenia osoby YYYY-MM-DD (wymagany, dla bezpieczeństwa)

---

## Development

### Instalacja

```bash
cd thespace-react-form

# Install dependencies (includes wrangler)
pnpm install

# Setup local env vars
cp .dev.vars.example .dev.vars
# Edytuj .dev.vars i uzupełnij prawdziwe wartości
```

### Local Development

**Opcja 1: Vite dev server (bez Functions)**
```bash
pnpm dev
# URL: http://localhost:5173
# Uwaga: Endpoint /api/validate-pid NIE będzie działał!
```

**Opcja 2: Wrangler (z Functions - ZALECANE)**
```bash
# Build React app
pnpm build

# Start Wrangler dev server z Functions
pnpm dev:functions

# URL: http://localhost:8788
# Uwaga: Wymaga rebuild po zmianach w React code
```

**Opcja 3: Hybrid (Vite + Wrangler proxy)**

W `vite.config.ts` dodaj:
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788', // Wrangler dev server
        changeOrigin: true,
      },
    },
  },
});
```

Uruchom w dwóch terminalach:
```bash
# Terminal 1: Wrangler (Functions)
pnpm dev:functions

# Terminal 2: Vite (React HMR)
pnpm dev
```

### Testowanie Local

```bash
# 1. Upewnij się że .dev.vars jest skonfigurowany
# 2. Upewnij się że VITE_PIPEDRIVE_ENABLED=true w .env
# 3. Uruchom dev:functions
pnpm dev:functions

# 4. Test valid PID
curl http://localhost:8788/?pid=VALID_PID&option=01&created=2024-03-15

# 5. Test invalid PID
curl http://localhost:8788/?pid=99999&option=01&created=2024-01-01
# Powinien redirect na thespace.rent
```

---

## Deployment

### Cloudflare Pages

**Automatyczny deployment:**

1. Push do GitHub → Cloudflare Pages automatycznie buduje
2. Functions z `/functions` są automatycznie deployowane
3. Routing: `/api/validate-pid` → `functions/api/validate-pid.ts`

**Konfiguracja env vars:**

Cloudflare Dashboard → Pages → Settings → Environment Variables

**⚠️ WAŻNE:**
- Zmienne dla **Production** i **Preview** ustawiane osobno
- Zmienne NIE są commitowane do repo
- Token Pipedrive trzymaj tylko w Dashboard!

### GitHub Actions (opcjonalnie)

Jeśli masz własny workflow, możesz użyć GitHub Secrets:

```yaml
env:
  PIPEDRIVE_API_TOKEN: ${{ secrets.PIPEDRIVE_API_TOKEN }}
  PIPEDRIVE_API_URL: ${{ secrets.PIPEDRIVE_API_URL }}
  # ... etc
```

---

## Testowanie

### Test Cases

#### ✅ Valid PID Test

**URL:**
```
https://form.thespace.rent/?pid=12345&option=01&created=2024-03-15
```

**Expected:**
1. Spinner "Weryfikacja dostępu..."
2. Cloudflare Function wywołuje Pipedrive API
3. Walidacja passes
4. Formularz się wyświetla
5. PID zapisany w Zustand store
6. PID dołączony do submission payload

**Check:**
- DevTools → Network → `/api/validate-pid` → Response: `{ valid: true }`
- DevTools → Application → Session Storage → `pipedrivePersonId: "12345"`
- Po submit → Make.com webhook otrzymuje `pID` i `optionNr`

#### ❌ Invalid PID Tests

**1. Nieistniejący PID:**
```
https://form.thespace.rent/?pid=99999&option=01&created=2024-01-01
```
Expected: Redirect → `https://thespace.rent`

**2. Błędna data utworzenia:**
```
https://form.thespace.rent/?pid=12345&option=01&created=2020-01-01
```
Expected: Redirect → `https://thespace.rent`

**3. Brak parametrów:**
```
https://form.thespace.rent/
```
Expected (jeśli `PIPEDRIVE_ENABLED=true`): Redirect → `https://thespace.rent`

**4. Custom field ≠ '234':**
```
https://form.thespace.rent/?pid=12345&option=01&created=2024-03-15
```
(gdzie osoba ma field ≠ '234')
Expected: Redirect → `https://thespace.rent`

### Debug Mode

**Włącz console logi:**

W `usePidValidation.ts` i `validate-pid.ts` są console.log/error.

Check:
- DevTools → Console
- Cloudflare → Functions → Logs (realtime)

---

## FAQ

### Q: Czy token Pipedrive jest bezpieczny?

**A:** TAK. Token znajduje się tylko w:
- Cloudflare environment variables (nie w kodzie)
- Server-side Function execution (nie w przeglądarce)

Nigdy nie trafia do:
- ❌ Bundle JS
- ❌ Network requests z przeglądarki
- ❌ Git repository

### Q: Czy użytkownik może ominąć walidację?

**A:** NIE, jeśli `PIPEDRIVE_ENABLED=true`:
- Hook `usePidValidation` sprawdza PID przed renderowaniem formularza
- Nieprawidłowy PID → automatyczny redirect
- Brak możliwości manipulacji (wszystko server-side)

### Q: Co jeśli ktoś zgadnie PID?

**A:** Musi również zgadnąć **datę utworzenia** (YYYY-MM-DD):
- 365 możliwości na rok
- Exact match wymagany
- Znacznie trudniejsze niż samo zgadywanie PID

### Q: Jak wyłączyć walidację?

**A:** Ustaw `VITE_PIPEDRIVE_ENABLED=false` w `.env`:
- Hook automatycznie skipuje walidację
- Formularz dostępny bez PID
- Przydatne do testowania

### Q: Jak dodać VITE_PIPEDRIVE_ENABLED do .env?

**A:** Edytuj `.env`:
```bash
# Inne zmienne...

# Pipedrive Integration
VITE_PIPEDRIVE_ENABLED=true  # lub false
```

Restart dev servera po zmianie!

### Q: Co się stanie jeśli Pipedrive API nie działa?

**A:**
- Cloudflare Function zwraca error
- React app wykrywa error
- Użytkownik widzi redirect na `thespace.rent`
- Logi w Cloudflare Dashboard → Functions

### Q: Jak testować lokalnie bez prawdziwego Pipedrive?

**A:** Możesz zmodyfikować `validate-pid.ts` żeby zwracał mock data:
```typescript
// W validate-pid.ts, zakomentuj prawdziwe API call
// i zastąp mockiem:

if (pid === '12345' && created === '2024-03-15') {
  return jsonResponse({
    valid: true,
    personData: { id: 12345, name: 'Test User' }
  });
}
```

**Uwaga:** Pamiętaj żeby to usunąć przed deploymentem!

---

## Troubleshooting

### Problem: `/api/validate-pid` zwraca 404

**Diagnoza:**
- Functions nie są deployowane
- Vite dev server (nie obsługuje Functions)

**Rozwiązanie:**
```bash
# Użyj Wrangler dev server zamiast Vite
pnpm dev:functions
```

### Problem: "Missing Pipedrive parameters" w console

**Diagnoza:**
- URL nie ma wymaganych parametrów
- `VITE_PIPEDRIVE_ENABLED=true` ale brak `?pid=...`

**Rozwiązanie:**
```bash
# Dodaj parametry do URL
http://localhost:8788/?pid=12345&option=01&created=2024-03-15

# LUB wyłącz feature flag
VITE_PIPEDRIVE_ENABLED=false
```

### Problem: Token Pipedrive nie działa

**Diagnoza:**
- Token nieprawidłowy
- Token nie ma uprawnień do `/persons`

**Rozwiązanie:**
1. Sprawdź token w Pipedrive Settings
2. Upewnij się że ma scope: `Read Persons`
3. Sprawdź czy `.dev.vars` ma prawdziwy token (nie example!)

### Problem: "Creation date mismatch"

**Diagnoza:**
- Parametr `created` w URL nie zgadza się z `add_time` z Pipedrive

**Rozwiązanie:**
```bash
# 1. Sprawdź prawdziwą datę utworzenia osoby w Pipedrive
# 2. Użyj tej samej daty w URL

# Przykład:
# Osoba utworzona: 2024-03-15 10:30:45
# URL musi mieć: created=2024-03-15
```

---

## Roadmap

Potencjalne ulepszenia:

- [ ] Rate limiting per IP
- [ ] Logging/analytics walidacji
- [ ] Dashboard do zarządzania dostępami
- [ ] Email notifications przy nieprawidłowych próbach
- [ ] Time window validation (np. link ważny 24h)

---

## Support

W przypadku problemów:

1. Sprawdź logi w Cloudflare Dashboard → Functions
2. Sprawdź console w DevTools
3. Sprawdź czy wszystkie env vars są ustawione
4. Przetestuj z mock data lokalnie

---

**Ostatnia aktualizacja:** 2025-01-05
