# Tactical Ops RC Gate 01

**Decyzja: HOLD dla G0 i S4.** Baza frontendu `7ffa44997b71cb4c7c3fa230abaf88c9f72444dc` zawiera PR #238 i #239 oraz bundle `v3.6.32-player-voice-v1`. Ten RC zamyka lukę walidacji wersji kontraktu. Oficjalna akceptacja wymaga dowodu z wdrożonego backendu i sesji z graczami.

## Przepływ kontraktu

1. `battleStore.ts` wybiera żądanie startu na podstawie projekcji serwera lub zapisanej próby. `foundationProgression.ts` wysyła je do `/webapp/tactical-foundation/{start,mission/start,chapter/mission/start}`. Lokalny Battlefield Lab ustawia podgląd. Reguły oficjalnej walki są wybierane ponownie przy `beginBattle` z zaakceptowanego kontraktu.
2. W lokalnej kopii backendu `webapp_tactical_foundation.py` przekazuje żądanie do `tactical_ops_foundation.py`. `tactical_vnext_contract.py` tworzy `BACKEND_SNAPSHOT` z identyfikatorem i rewizją misji oraz wersjami profilu walki, Mastery i polityki nagród. Starsze próby bez kontraktu zachowują tryb Legacy.
3. `foundationProgression.ts` parsuje odpowiedź startu i zapisany aktywny run. `operations.ts` składa reguły z zaakceptowanej rewizji i kontekstu. `battleStore.ts` inicjalizuje planszę i scheduler przez `types.ts` i `intentContract.ts`. Wznowienie ponownie buduje walkę z zaakceptowanych danych. Pokrycie dotyczy reguł runu, bez założenia odtworzenia każdej wykonanej tury.
4. `/continue` przesyła identyfikator próby, rewizję i raport klienta. Lokalny backend sprawdza zapisany kontrakt, sprawdza powtórzenia po `requestId` i `runId`, a zapis realizuje przez `with_user_v2_strict`. Results pokazuje przyznany progres po dopasowaniu potwierdzenia. Raport klienta i potwierdzenie zapisu mają różne znaczenie. Te testy nie są serwerowym odtworzeniem walki.

## Dowody

| Bramka | Stan i dowód |
| --- | --- |
| Start, wznowienie, geometria i rewizje | **Lokalnie.** Wire i Foundation Grid przechodzą dla 8×5 i 10×7. Backendowy `test_tactical_vnext_contract` sprawdza start/wznowienie Legacy i VNext dla 12 misji. G2 i Intercept sprawdzają zachowanie rewizji 1 i 2. |
| Nieobsługiwane wersje | **Lokalnie.** Przed poprawką wire kończy się na `Missing expected rejection: start accepted {"missionRevision":2}` dla Field Relay Hold. Po poprawce start i odczyt aktywnego runu odrzucają pięć kombinacji z nieobsługiwaną wersją. Akceptowane są profil 3, Mastery 1, polityka nagród 1 i rewizja misji 1, z rewizją 2 dla Field Relay Intercept i Dead Relay Hold. |
| Moment wejścia HOUND i Courier Trace | **Lokalnie.** G2/S3 sprawdzają Trace true/false, G4 sprawdza Pressure 3/2/1/0 i maksymalnie jedną dodatkową rundę. Obniżenie globalnej presji zachowuje timing już przyjętej próby. |
| Rozliczenie i trwałość | **Lokalnie.** `test_tactical_ops_foundation_persistence` sprawdza ponowienie żądania, inny `requestId` dla rozliczonego `runId`, zapis i ponowny odczyt, replay bez drugiego first clear, nagrodę challenge oraz stary cykl. G3, Progression V2 i Results sprawdzają projekcję i widoczność potwierdzonego progresu. |
| Rzeczywista emisja i trwały zapis | **Brak dowodu produkcyjnego.** Potrzebne są identyfikacja działających modułów oraz zanonimizowane porównanie startu, ponownego odczytu, rozliczenia i ponowienia w zatwierdzonym środowisku QA. |
| Pełna akceptacja S4 | **Brak testów fizycznych i pięciu ślepych sesji.** |

### Macierz 12 misji

Każdy wiersz ma lokalny test backendowego startu/wznowienia w obu trybach, walidację bazowej definicji i test składów Step 5. Wszystkie wpisy inwentarza mają `LEGACY`, rewizję `0` i `premiumReady: false`. Symulacje poniżej podają zwycięstwa/porażki. S2/G1 wykorzystują syntetyczne profile i strategie, Legacy używa jednej prostej strategii. Brak porażki w próbie pozostawia osobną ścieżkę niepowodzenia bez pokrycia w tej macierzy.

| Misja | Cel | Legacy | S2 | G1 |
| --- | --- | ---: | ---: | ---: |
| `broken-signal-breach` | ELIMINATE | 1/0 | 4/0 | 24/0 |
| `broken-signal-recover` | RECOVER | 1/0 | 12/0 | 72/0 |
| `broken-signal-commander` | BOSS | 1/0 | 12/0 | 72/0 |
| `dead-relay-courier` | INTERCEPT | 0/1 | 12/0 | 52/20 |
| `dead-relay-hold` | HOLD | 1/0 | 12/0 | 72/0 |
| `dead-relay-guardian` | BOSS | 1/0 | 12/0 | 72/0 |
| `field-relay-recovery` | RECOVER | 1/0 | 12/0 | 72/0 |
| `field-relay-hold` | HOLD | 1/0 | 12/0 | 72/0 |
| `field-squad-survival` | SURVIVE | 1/0 | 12/0 | 72/0 |
| `field-relay-intercept` | INTERCEPT | 1/0 | 12/0 | 50/22 |
| `field-isolated-hold` | HOLD | 1/0 | 12/0 | 72/0 |
| `field-rearguard` | SURVIVE | 1/0 | 12/0 | 72/0 |

S2 wykazało ruch, umiejętności, SKIP, telegraphy, kontry i dwie drogi zwycięstwa o różnych kosztach w każdej misji. G1 wykazało 74 przerwania intencji. Osobny test Player Clarity sprawdza kontynuację CNC po śmierci Alphy. Ręcznie pozostaje sprawdzić kontrolę ocalałego składu oraz czytelność celu na urządzeniach. Brakuje pełnego cyklu od produkcyjnego startu do potwierdzenia dla każdego wiersza, każdej rewizji i porażki.

## Uruchomienie

Po instalacji zależności w repozytorium frontendu uruchom poniższe polecenia. Workflow `Tactical VNext global contract` wykonuje podstawową bramkę, sprawdza składnię i porównuje wygenerowany bundle i loader z commitem.

```bash
node tools/verify_tactical_ops_vnext_contract.mjs
node tools/verify_tactical_vnext_run_contract_wire.mjs
node tools/verify_tactical_vnext_step5_squad_matrix.mjs
node tools/simulate_tactical_vnext_step0_legacy.mjs
node tools/simulate_tactical_s2_full_combat.mjs
npm run verify:tactical-ops:g1
npm run build:tactical-ops
node --check js/tactical_ops.js
git diff --exit-code -- js/tactical_ops.js js/boot_loaders.js
```

W odizolowanej kopii źródeł backendu `python -B -m unittest test_tactical_vnext_contract test_tactical_ops_foundation_persistence`. Testy wykorzystują fikcyjne dane, tymczasowy zapis i loopback. Powyższe polecenie służy wyłącznie do pracy lokalnej.

Wynik lokalny obejmuje 29 przechodzących uruchomień skryptów frontendu, w tym G1–G4, S2, Intercept i Results. Backend zwrócił 21/21 testów kontraktu i 34/34 trwałości w głównej kopii, 77/77 w odtworzonej paczce G1 oraz 4/4 w kandydacie projekcji G3. Wyniki backendu mają oddzielne bazy i częściowo nakładające się przypadki. Uruchomienie samych testów G1 na głównej, mieszanej kopii dało 11/16, w tym dwa błędy braku `activate_v2`. Dlatego dowód G1 jest przypisany do odtworzonej paczki.

## Otwarte przypadki

- **P0 · dowód wdrożenia.** Ustalić wersje działających modułów i porównać zanonimizowaną projekcję zaakceptowanego runu przed i po wznowieniu. Zebrać wersje kontraktu, typ celu, wymiary planszy, skład jako role, wersje zamrożonego progresu, faktyczną rundę wsparcia i delty po pierwszym zapisie i ponowieniu. Włączyć jedną próbę Legacy, rewizje 1 i 2 oraz przypadki first clear/challenge. Raportować zgodność runu jako tak/nie, bez identyfikatorów graczy, sesji, żądań i runów.
- **P0 · niezależna luka w odpowiedzi klienta.** W wire fixture zaakceptowany run z kontraktem 3 przechodzi przez `startOperationMission` bez `combatProfileV3`. `applyRunCombatProfile` zwraca wówczas bazowe spawny. Lokalny backend dołącza profil i ma osobny test uszkodzonego zapisu. Dowód dotyczy syntetycznej odpowiedzi i ścieżki frontendu. Obserwacja z produkcji pozostaje otwarta.
- **P1 · istniejący test pochodzenia źródeł.** `node tools/verify_tactical_premium_integration.mjs` na bazie `7ffa449` z plikami LF odrzuca `js/browser_guest_entry_v1.js` jako `unreviewed UX production change`. To osobna bramka z listą zmian dozwolonych dla wcześniejszej integracji UX. Wymaga rozstrzygnięcia przed przyjęciem tego RC.
- **P1 · S4.** Wykonać poniższy handoff i zapisać wyniki.

## Handoff S4

Na Samsungu S26 Ultra i iPhonie 13 użyj Telegrama. Powtórz na Androidzie standalone po udostępnieniu buildu. Zapisz platformę, build, misję, rodzaj połączenia, wynik oraz krótkie kroki do odtworzenia problemu. Użyj wyłącznie zatwierdzonych kont QA.

1. Przejdź **WAR TABLE → BRIEF → SQUAD → BATTLE → RESULTS → NEXT OPERATION**. Rozpocznij od misji wskazanej przez War Table. Sprawdź, czy cel i wybór składu wystarczą do podjęcia pierwszej decyzji. W walce sprawdź ruch, umiejętność i SKIP, w tym akcję ocalałego sojusznika po utracie Alphy, jeśli reguły na to pozwalają.
2. W kwalifikującym się Field Relay Hold lub Relay Intercept ze wsparciem porównaj rzeczywisty spawn HOUND z zapowiedzią. Dla bazowej rundy 2 oczekuj rundy 2 przy Pressure 2–3, rundy 3 przy 0–1. Potwierdź, że wznowienie wcześniej przyjętej próby zachowuje jej rundę. Alternatywnie sprawdź Dead Relay Hold z prawdziwym Courier Trace i bez niego według reguł zaakceptowanej rewizji.
3. Porównaj jedno istniejące ulepszenie składu przed zakupem i po nim. Przykład: w Signal Atlas wybierz dostępne ulepszenie CNC Suppress, zapisz pokazywany i faktyczny efekt przed/po w porównywalnych nowych próbach. Sprawdź, czy stara zaakceptowana próba zachowała własny snapshot. Użyj właściwego celu, dystansu i statusów dla obu pomiarów.
4. Po wyniku odczytaj potwierdzony zysk i wykonaj sugerowaną kolejną akcję. W osobnej sesji QA przeładuj Results, ponów rozliczenie i sprawdź pojedynczy first clear/challenge. Wykonaj także jedną porażkę, aby sprawdzić czytelny, prawdziwy wynik i dalszą opcję.
5. Przeprowadź pięć sesji bez podpowiedzi, w tym jedną z Kacprem. Po przejściu zadaj cztery pytania. **Jaki był twój cel? Która decyzja zmieniła walkę? Co zyskał twój Pack? Co zrobisz dalej i dlaczego?** Zapisz odpowiedzi i miejsca zatrzymania przed wyjaśnieniem mechanik.
