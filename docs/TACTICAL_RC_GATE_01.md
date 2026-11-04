# Tactical Ops RC Gate 01

**Decyzja: HOLD dla G0 i S4.** Baza frontendu `7ffa44997b71cb4c7c3fa230abaf88c9f72444dc` zawiera PR #238 i #239 oraz bundle `v3.6.32-player-voice-v1`. Ten RC zamyka luki walidacji wersji kontraktu i brakującego profilu V3. Oficjalna akceptacja wymaga dowodu z działającego backendu i sesji z graczami.

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

Porównanie bajtów bundle’a wykonuj na Ubuntu z Node 22, tak jak w CI. Kanoniczny workflow zsynchronizował IIFE `v3.6.34-rc-gate-01` z Ubuntu w `7d1e2f3`.

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

## Zamknięcie inżynierskie

- W testach wire stary parser przyjmował kontrakt misji bez V3. Start oraz projekcje aktywnych prób Canon, Field Ops i Chapter wymagają teraz prawidłowego `combatProfileV3`, jeśli mają zaakceptowany kontrakt. Starsze próby bez kontraktu zachowują dotychczasowe parsowanie. Osobny format onboardingowego Foundation publikuje `foundationRunRules` i korzysta z własnego inicjalizatora walki. Zachowano ten protokół.
- Trzy workflow zgłaszały `unreviewed UX production change: js/browser_guest_entry_v1.js`. Plik został dodany na `main` przez PR #237. Test zachowuje ścisłe historyczne porównania App/Battle i porównuje zmiany kodu produkcyjnego z dokładnym SHA `7ffa449`, dopuszczając pięć wskazanych plików RC. Porównanie obejmuje również `index.html`.
- Właściciel potwierdził 3/3 zgodnych plików backendu na dysku. Katalog roboczy i moment startu API są zgodne z tą wersją źródeł. To dowód tożsamości plików i chronologii. Tożsamość modułów w pamięci i przebieg sesji QA pozostają do potwierdzenia.

## Handoff runtime

Uruchom wyłącznie po wyraźnej zgodzie właściciela na start, wznowienie, zapis wyniku i dwa ponowienia na jednym wskazanym koncie QA. Preferuj istniejące środowisko izolowane z tym samym backendem i kandydatem frontendu. Próbę na produkcji przeprowadza właściciel po osobnej zgodzie na zapis na tym koncie. Zaloguj konto QA zwykłym wejściem Telegram lub zatwierdzoną sesją aplikacji. Użyj jednego okna z konsolą deweloperską. Zaplanuj test z dala od zmiany rotacji, bez innych prób ani aktywności na tym koncie. Wybierz zwykłe Field Relay Hold albo Relay Intercept ze wsparciem HOUND, bez aktywnej próby, z dostępną nagrodą first clear i niezaliczonym wyzwaniem rotacji. Jeśli takich warunków brakuje, zapisz HOLD dla brakującego przypadku.

W konsoli zalogowanej aplikacji uruchom poniższy kod. Instalacja wyłącznie obserwuje wywołania. Start i pierwszy zapis wykonuje zwykły klient. Skrypt używa `window.apiPost` z tej sesji do `POST /webapp/tactical-foundation/state` i do powtórzeń `POST /webapp/tactical-foundation/mission/continue`. Treść autoryzacji obsługuje aplikacja. Raportuj wyłącznie zwracane podsumowania i obserwacje UI. Surowe żądania, odpowiedzi, nagłówki i identyfikatory pozostają w sesji QA.

```js
(() => {
  if (window.rc241 || typeof window.apiPost !== 'function') throw Error('QA_SETUP');
  const post = window.apiPost;
  const root = '/webapp/tactical-foundation';
  const settle = `${root}/mission/continue`;
  const stable = value => JSON.stringify(value, (_, x) => x && typeof x === 'object' && !Array.isArray(x)
    ? Object.fromEntries(Object.keys(x).sort().map(k => [k, x[k]])) : x);
  const same = (a, b) => stable(a) === stable(b);
  const state = async () => (await post(`${root}/state`, {})).data;
  let started, resumed, settled, body, repeated = false;
  window.apiPost = async (path, payload) => {
    const response = await post(path, payload);
    if (path === `${root}/mission/start` && response.ok && response.run?.fieldContext) {
      if (!started) started = structuredClone(response.run);
      else resumed = structuredClone(response.run);
    }
    if (path === settle && !settled && started && response.ok && response.fieldResult?.runId === started.runId) {
      body = structuredClone(payload);
      settled = structuredClone(response);
    }
    return response;
  };
  const frozen = ({started: _, ...run}) => run;
  const projection = s => [s.revision, s.fieldOps.records[started.missionId], s.fieldOps.commander,
    s.fieldOps.veteranCareer, s.fieldOps.rotationProgress, s.fieldOps.careerRecord, s.fieldOps.region,
    s.fieldOps.masteryPath, s.playerGrowth, s.packMastery];
  window.rc241 = {
    async battle() {
      if (!started) throw Error('QA_NO_FIELD_START');
      const active = (await state()).fieldOps?.activeMissionRun;
      const run = resumed || started;
      const tiles = [...document.querySelectorAll('#tacticalOpsRoot .t-grid > i')];
      const rules = run.rulesContract;
      return {mission: run.missionId, vnext: rules?.rulesetVersion === 'tactical-intent-vnext.0',
        backendSnapshot: rules?.source === 'BACKEND_SNAPSHOT', missionRevision: rules?.missionRevision,
        rewardPolicyVersion: rules?.rewardPolicyVersion, masterySnapshotVersion: rules?.masterySnapshotVersion,
        profileV3: rules?.combatProfileVersion === 3 && run.combatProfileV3?.version === 3,
        persisted: !!active && same(frozen(run), frozen(active)), newRun: started.started === true,
        resumedSame: resumed ? !resumed.started && same(frozen(started), frozen(resumed)) : null,
        grid: [new Set(tiles.map(t => t.style.left)).size, new Set(tiles.map(t => t.style.top)).size]};
    },
    async repeat() {
      if (!settled || repeated) throw Error('QA_NO_FRESH_SETTLEMENT');
      repeated = true;
      const receipt = settled.fieldResult;
      const before = await state();
      const retry = await post(settle, body);
      let duplicateBlocked = false;
      try {
        await post(settle, {...body, expectedRevision: before.revision, requestId: `rc241-${crypto.randomUUID()}`});
      } catch (error) {
        duplicateBlocked = error.status === 409 && error.data?.code === 'run_already_committed';
      }
      const after = await state();
      return {victory: receipt.victory, firstClear: settled.firstClear, challenge: receipt.firstCycleChallenge,
        xp: receipt.xpGranted, bones: receipt.bonesGranted,
        durable: before.fieldOps.lastCompletedMissionRunId === started.runId &&
          !before.fieldOps.activeMissionRun && same(projection(before), projection(settled.data)),
        sameReceipt: retry.idempotent === true && retry.firstClear === settled.firstClear && same(retry.fieldResult, receipt),
        duplicateBlocked, progressionUnchanged: same(projection(before), projection(after))};
    },
    stop() { window.apiPost = post; delete window.rc241; }
  };
})();
```

1. **START.** Zapisz salda XP i Bones z UI. Rozpocznij wskazaną misję z War Table, a na planszy uruchom `await rc241.battle()`. Oczekuj `newRun`, `persisted`, `profileV3`, `vnext` i `backendSnapshot` równych `true`, `grid: [10, 7]` oraz wersji 1 dla polityki nagród i Mastery. Oczekuj rewizji 1 dla Relay Hold albo 2 dla Relay Intercept, jeśli serwer oferuje rewizję 2. Zapisz typ celu i rundę HOUND z HUD. Brak capability lub zaakceptowanego VNext daje HOLD dla tego środowiska. VNext bez poprawnego profilu lub z błędną geometrią daje NO-GO dla tej próby.
2. **RESUME.** Wyjdź do War Table przed zakończeniem, wznów tę samą próbę i ponów `await rc241.battle()`. Oczekuj `resumedSame: true`, `persisted: true`, tej samej geometrii, celu i rundy HOUND. Porównanie obejmuje ID, skład, profile, wzrost, Mastery i kontekst wewnątrz sesji. Zmiana zaakceptowanych danych daje NO-GO.
3. **SETTLEMENT i REPEAT.** Wygraj i spełnij warunek wyzwania z Briefu. Poczekaj na potwierdzenie zapisu w Results i odnotuj zmianę sald. Uruchom `await rc241.repeat()` raz. Wymagane są `victory`, `firstClear`, `challenge`, `durable`, `sameReceipt`, `duplicateBlocked` i `progressionUnchanged` równe `true`. Odśwież projekcję sald w aplikacji i sprawdź, że XP i Bones wzrosły tylko o delty z pierwszego zapisu. Powtórny przyrost, niespójny receipt lub brak trwałego zapisu daje NO-GO. Jeśli warunek zwycięstwa lub challenge nie został spełniony, raportuj brak pokrycia. Zakończ `rc241.stop()`.

Przekaż tylko status każdego kroku, publiczną nazwę misji, wersje, wymiary, cel, rundę HOUND, zwrócone wartości logiczne oraz delty nagród. W razie błędu przekaż kod i etap. Ten protokół sprawdza zachowanie obsługującej sesję instancji API. Identyfikacja konkretnych modułów w pamięci wymaga osobnego dowodu pochodzenia runtime.

## Handoff S4

Na Samsungu S26 Ultra i iPhonie 13 użyj Telegrama. Powtórz na Androidzie standalone po udostępnieniu buildu. Sprawdź, czy HUD i Action Dock mieszczą się w obszarze dostępnym na dotyk, także po zmianie orientacji i powrocie z tła. Zapisz platformę, build, misję, rodzaj połączenia, wynik oraz krótkie kroki do odtworzenia problemu. Użyj wyłącznie zatwierdzonych kont QA.

1. Przejdź **WAR TABLE → BRIEF → SQUAD → BATTLE → RESULTS → NEXT OPERATION**. Rozpocznij od misji wskazanej przez War Table. Sprawdź, czy cel i wybór składu wystarczą do podjęcia pierwszej decyzji. W walce sprawdź ruch, umiejętność i SKIP, w tym akcję ocalałego sojusznika po utracie Alphy, jeśli reguły na to pozwalają.
2. W kwalifikującym się Field Relay Hold lub Relay Intercept ze wsparciem porównaj rzeczywisty spawn HOUND z zapowiedzią. Dla bazowej rundy 2 oczekuj rundy 2 przy Pressure 2–3, rundy 3 przy 0–1. Potwierdź, że wznowienie wcześniej przyjętej próby zachowuje jej rundę. Alternatywnie sprawdź Dead Relay Hold z prawdziwym Courier Trace i bez niego według reguł zaakceptowanej rewizji.
3. Porównaj jedno istniejące ulepszenie składu przed zakupem i po nim. Przykład: w Signal Atlas wybierz dostępne ulepszenie CNC Suppress, zapisz pokazywany i faktyczny efekt przed/po w porównywalnych nowych próbach. Sprawdź, czy stara zaakceptowana próba zachowała własny snapshot. Użyj właściwego celu, dystansu i statusów dla obu pomiarów.
4. Po wyniku odczytaj potwierdzony zysk i wykonaj sugerowaną kolejną akcję. W osobnej sesji QA przeładuj Results, ponów rozliczenie i sprawdź pojedynczy first clear/challenge. Wykonaj także jedną porażkę, aby sprawdzić czytelny, prawdziwy wynik i dalszą opcję.
5. Przeprowadź pięć sesji bez podpowiedzi, w tym jedną z Kacprem. Po przejściu zadaj cztery pytania. **Jaki był twój cel? Która decyzja zmieniła walkę? Co zyskał twój Pack? Co zrobisz dalej i dlaczego?** Zapisz odpowiedzi i miejsca zatrzymania przed wyjaśnieniem mechanik.

Próg S4 według blueprintu. Co najmniej 4/5 testerów samodzielnie nazywa cel i warunek zwycięstwa (H1), a co najmniej 4/5 wskazuje rzeczywistą zdobycz i następny próg (H2). Zapisz, czy różne plany prowadziły do różnych skutków (H3), co zmieniło ulepszenie (H4) i czy tester sam podjął następną próbę lub podał konkretny powód powrotu (H5).
