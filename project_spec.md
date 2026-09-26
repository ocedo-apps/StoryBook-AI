# Project Spec — Open Source Narrative Engine (RPG + Bokverktyg)

Status: living document, v0.99.34
Relaterade dokument: `narrative-core-addendum.md` (v0.2-beslut),
`roadmap-ideas.md` (idéer och prioritering för Scene, Context
Inspector, Ask Manuscript m.fl. — v1.0, 2026-09-24)

**Ändringslogg v0.99.33 → v0.99.34:** "Skriv en beat" — lokaliserad
generering mitt i en scen, den enklare av de två lösningar som
diskuterades för Draft-funktionens andra stora begränsning (jämfört
med Writingway 2: "a more localised generation for immediate beats").

- Högerklicka **utan** att markera något i ett kapitel öppnar nu en
  minimal meny med ett enda val: "Skriv en beat…". Skriv en kort,
  konkret instruktion ("Hon öppnar brevet och läser första raden
  högt") och modellen skriver bara den beaten — ett kort stycke, inte
  resten av scenen — och lägger in den precis vid markören. Fungerar
  även i en tom scen. Högerklick **med** en markering fungerar precis
  som förut (Förläng/Brodera ut/Skriv om-menyn, orörd).
- Byggt genom att återanvända ~90 % av det befintliga
  Förläng/Skriv om-maskineriet: samma `PASSAGE_SYSTEM`, samma
  `rewriteSpan`-store-action, samma historik. `PassageMode` fick ett
  nytt `"beat"`-alternativ i `generateProse.ts`, med en egen
  instruktionsram ("skriv bara nästa beat, inte resten av scenen") och
  utan det vanliga "Marked passage"-blocket, eftersom en beat inte
  utgår från något markerat.
- Hittade och rättade en riktig, sedan tidigare existerande bugg i
  `applyExtend()` (`textSpan.ts`) under arbetet: den lade bara till ett
  mellanslag *före* en infogning, aldrig efter — ofarligt så länge
  "Förläng" alltid kördes längst bak i kapitlet (inget kom efter), men
  skulle ha klistrat ihop ord ("hesitated.The stranger") så fort något
  infogas mitt i texten, vilket "Skriv en beat" gör som normalfall.
  Fixad för båda hållen nu.
- 654/654 gröna (5 nya tester: beat-prompten, `applyExtend` vid en ren
  markörposition, historik-mappningen). Verifierat i webbläsaren:
  högerklick mellan två meningar utan markering gav rätt minimeny på
  rätt plats, öppnade instruktionsrutan, skrev en instruktion, avbröt
  utan sidoeffekt; högerklick med markering visade fortfarande hela
  den vanliga menyn (ingen regression). Själva AI-genereringen gick
  inte att se klart i den här sessionen (ingen lokal Ollama/LM Studio
  att prata med) — värt att prova i din egen miljö.

**Ändringslogg v0.99.32 → v0.99.33:** Korrekturläsningen går nu att
begränsa — svar på författarens fråga om att snabba upp eller dela
upp passet, särskilt på svagare hårdvara.

- **Ny ruta innan varje körning** ("Innan vi kör"): kryssa i vilka av
  de sju stegen (Grammatik, Upprepade scener, Stil, Ålder,
  Kontinuitet, Planterat & inlöst, Faktakontroll) som ska köras den
  här gången. Allt förbockat som standard — rör man inget beter sig
  allt precis som förut. Visas både vid första körningen och varje
  gång man trycker "Kör igen", så valet aldrig är inaktuellt.
- **Omfattning: hela manuset eller bara det öppna kapitlet.** Gäller
  bara Grammatik och Faktakontroll — de enda två steg vars kostnad
  faktiskt växer med antal kapitel (ett anrop per kapitel vardera). De
  andra fem jämför alltid mellan kapitel och körs över hela manuset
  oavsett, men är redan billiga (ett enda anrop var, eller upp till 24
  för Upprepade scener som redan var takat).
- Ett avbockat steg körs fortfarande igenom i sin tur (så
  förloppsindikatorn och stegordningen håller ihop) men gör inget
  jobb och visas som "Inte vald den här gången" i listan, tydligt
  skilt från ett steg som faktiskt är klart.
- Ny `enabledStages`/`scopeChapterId` på `ProofreadJob`
  (`proofreadSchema.ts`), båda med säkra defaultvärden (alla steg,
  hela manuset) för äldre sparfiler. `startProofreadJob()` tar dem som
  valfria argument; varje steg-funktion i `proofreadRun.ts` kollar sitt
  eget namn mot `enabledStages` och hoppar direkt till nästa steg om
  avbockat, precis samma mönster som redan användes för "redan klar".
- 651/651 gröna (3 nya tester som täcker: ett helt avbockat steg körs
  aldrig, bara ett ikryssat steg körs, och Grammatik+Faktakontroll
  begränsas korrekt till en enda kapitel-id). Verifierat i webbläsaren:
  öppnade Korrekturläsning på ett nytt manus, såg inställningsrutan
  (inte en automatisk körning), bockade av fem av sju steg, växlade
  till "Bara kapitel 1", startade — inställningarna satt exakt rätt.
  Själva körningen gick inte att se klart i den här sessionen (ingen
  lokal Ollama/LM Studio att prata med), samma begränsning som tidigare
  AI-beroende funktioner i den här sessionen.

**Ändringslogg v0.99.31 → v0.99.32:** De tre stegen för att göra
Story Bible redo för en stor, importerad lorebok — svar på
testarens fråga om hur man organiserar rik lore som inte passar
prydligt i person/plats/föremål.

- **Ersätt eller lägg till.** Manuell "Lägg till fakta" skrev tidigare
  alltid över den befintliga faktan av samma typ — omöjligt att t.ex.
  ha flera Identitet-rader om en plats samtidigt. Nu frågar rutan när
  ett fält redan har något: "Ersätt den befintliga" (som förut) eller
  "Lägg till som ytterligare en" (ny, oberoende rad, aldrig
  automatiskt sammanslagen med den andra). Ny `applyAuthorAddition()`
  i `ConsistencyGate.ts` — samma låsning som `applyAuthorDraft` men
  utan att leta upp och skriva över en befintlig rad. En exakt
  dubblett no-opar fortfarande.
- **Nytt fält: Koncept.** En sjätte flik i Story Bible (`core.concept`
  som nytt predikat) för sånt som varken är person, plats, föremål,
  grupp eller händelse — ett magisystem, en historisk era, en sedvänja,
  en lag. Klassificeras automatiskt precis som de andra fem.
- **Importera lore.** Ny knapp i Story Bible-panelen: klistra in text
  ur en befintlig lorebok, kör den genom samma extraktor som redan
  används för kapitel och intervjuer, och låt resultatet hamna i
  granskningskön som vanligt — inget låses direkt. Texten sparas
  aldrig i boken, bara de fakta som blir av den. Ny `importLoreArticle`
  i `BookStore.tsx`, inte knuten till något kapitel.
- 648/648 gröna (5 nya tester — kärnlogiken är det som är testat;
  själva gränssnittet, bekräftat manuellt nedan, har inga automatiska
  tester i det här projektet). Verifierat i webbläsaren end-to-end:
  skapade ett koncept ("Den ihåliga eden") och såg det landa rätt
  under den nya fliken; lade till en andra Identitet-fakta på en
  karaktär, valde "Lägg till som ytterligare en", båda fanns kvar;
  lade till en tredje och valde "Ersätt den befintliga" — bara den
  ursprungliga byttes ut, den oberoende raden orörd, historiken
  bevarad. Importera lore-formuläret öppnar och validerar rätt; själva
  extraktions-anropet gick inte att testa live i den här sessionen
  (ingen lokal Ollama/LM Studio att prata med), samma begränsning som
  för Fråga manuset tidigare.

**Ändringslogg v0.99.30 → v0.99.31:** Tre buggar rättade från en
testares feedback: Fråga manuset, Extrahera fakta, och scener i ett
tomt kapitel.

- **Fråga manuset såg nästan ingenting.** Rotorsaken: varje källa
  kapades till 220 tecken — och alltid kapitlets *första* 220 tecken,
  oavsett vad frågan handlade om. Med ett långt kapitel fick modellen
  bara se inledningen. Ny `excerptWindow()` i `askManuscript.ts`
  centrerar nu utdraget kring där frågans egna ord faktiskt
  förekommer i texten, och taket höjdes samtidigt till 1000 tecken.
  Fixade också en separat bugg på samma ställe: bara kapitlets
  *första* scen skickades som källa — ett kapitel med flera scener
  hade osynliga scener för funktionen. Nu är varje scen sin egen källa.
- **Extrahera fakta kastade ett JSON-fel** (det olösta ärendet från
  tidigare) — rotorsak hittad: modellen fick bara 1200 tokens för att
  räkna upp ALLA fakta i ett helt, odelat kapitel i ett enda svar. Med
  många fakta att hitta blev svaret helt enkelt avkapat mitt i, vilket
  gav exakt det JSON-felet. Två fixar: budgeten höjdes till 4000
  tokens (gäller extraktion från kapitel, intervju, och
  korrekturläsningens fakta-steg), och `parseExtractorPayload` i
  `extractFacts.ts` räddar nu de fakta som faktiskt hann bli klara
  innan avbrottet istället för att kasta bort alla vid minsta
  JSON-fel.
- **Scenpanelen i ett tomt kapitel.** Scener kunde bara skapas genom
  att dela redan skriven text — utan text fanns inget att dela vid,
  så "Skriv utkast"-knappen för scener syntes aldrig i ett tomt
  kapitel. Ny `addScene()` i `bookScene.ts` lägger till en tom scen
  direkt efter kapitlets nuvarande text (kräver bara att den
  *föregående* scenen redan har text — annars finns inget att skilja
  den nya från). Ny "Lägg till scen"-knapp i scenpanelen, avstängd
  tills den senaste scenen har något skrivet. Scen-för-scen-skrivande
  från noll fungerar nu: skriv scen 1, lägg till scen 2, skriv den,
  osv.
- 643/643 gröna (13 nya tester). Verifierat i webbläsaren:
  scen-bugg-fixen end-to-end (tomt kapitel → skrev scen 1 → "Lägg
  till scen" gick från avstängd till aktiv → klickade → scen 2 dök
  upp tom och redo). Fråga manuset och Extrahera fakta är verifierade
  på funktionsnivå (nya riktade tester som återskapar exakt den
  rapporterade bristen) men inte end-to-end i webbläsaren — den här
  sessionen har ingen lokal Ollama/LM Studio att prata med, så en
  riktig fråga-och-svar-runda gick inte att köra. Värt att dubbelkolla
  i din egen miljö.

**Ändringslogg v0.99.29 → v0.99.30:** Relations-fakta som nämner en
annan namngiven karaktär speglas nu automatiskt som ett förslag på den
andra karaktärens kort — svar på författarens fråga om vad som händer
när en intervjufråga till A ("hur lärde du känna B?") egentligen
handlar om två personer.

- Ny `relationshipMirror.ts`: när en fakta av typen Relation blir låst
  och texten nämner exakt en annan känd karaktär vid namn, dras samma
  påstående (namnen bytta) genom precis samma granskningskö som en
  fakta AI:n hittar i kapiteltext — aldrig låst direkt. Är den andra
  karaktären inte omnämnd, eller nämns två eller fler, görs ingen
  gissning alls.
- Just därför löser det här också det författaren egentligen var
  orolig för: skriver den andra karaktärens profil redan något annat
  om samma relation, dyker spegelförslaget upp som en riktig krock
  ("Krockar med: ...") i Granskning — inte en tyst dubbelsanning i
  Story Bible. Är fältet tomt hos den andra blir det bara ett vanligt
  väntande förslag att låsa eller förkasta.
- Kopplat in där en Relations-fakta faktiskt blir låst sanning: manuell
  "Lägg till fakta", godkännande av ett AI-förslag (t.ex. från Intervju
  eller kapitel-extraktion), och redigering av en redan låst fakta —
  samma tre ställen i `BookStore.tsx` (`addFact`, `approve`, `revise`).
  `applyExtractorDrafts` i `ConsistencyGate.ts` fick sitt `chapter_id`
  valfritt för att kunna återanvändas här utan ett kapitel i bakgrunden.
- 630/630 gröna (9 nya tester i `relationship-mirror.test.ts`).
  Verifierat i webbläsaren end-to-end: skapade Anna och Erik, lät Anna
  berätta att hon träffat Erik vid hamnen — Erik fick automatiskt ett
  väntande förslag om samma möte, ingenting låstes direkt. Låste
  förslaget. Ändrade sedan Annas version till att hon aldrig träffat
  Erik — spegelförslaget för Erik dök nu upp flaggat som en krock mot
  det redan låsta, istället för att tyst skriva över.

**Ändringslogg v0.99.28 → v0.99.29:** Intervju med karaktär kan nu
testa olika personlighet/ton innan man sparar den till profilen.

- Ny textruta överst i Intervju-kortet: "Personlighet för detta
  samtal — testa dig fram, spara till profilen när tonen känns rätt".
  Fylls från karaktärens sparade `personality`-fält, men varje ändring
  påverkar nästa svar direkt i samma samtal — helt oberoende av om
  man någonsin sparar.
- Egen "Spara till profil"-knapp, avstängd så länge texten är
  identisk med det sparade värdet. Sparar via `upsertCharacterProfile`
  (samma mekanism som redigering av utseende/taggar).
- `characterInterviewSystem()` i `characterInterview.ts` tar en ny
  valfri 4:e parameter `personalityDraft` — vinner över profilens
  sparade `personality` när den är satt, annars faller tillbaka på
  profilen som förut.
- Hittade och rättade en riktig bugg under verifieringen, inte ny
  kod utan en sovande bugg i `CharacterFields` (profil-formuläret i
  karaktärskortet): dess unmount-städning skrev alltid tillbaka sitt
  eget `draft`-state till profilen, oavsett om något faktiskt
  ändrats där. Så länge inget annat kunde ändra profilen medan
  kortet var öppet syntes det aldrig — men nu när Intervju-panelen
  kan spara `personality` medan karaktärskortet står öppet bakom den,
  skrev den gamla (tomma) `draft`-snapshotten över den nysparade
  texten så fort man stängde karaktärskortet. Fix: unmount-städningen
  flushar nu bara om `dirtyRef.current` är sant, precis som den
  vanliga `flush()`-funktionen redan gjorde.
- 621/621 gröna (3 nya enhetstester). Verifierat i webbläsaren
  end-to-end: öppnade Intervju, fältet var tomt, skrev en
  personlighetsbeskrivning, sparade, stängde Intervju-kortet OCH
  karaktärskortet, öppnade karaktären igen och Intervju igen — texten
  låg kvar. Innan bugfixen försvann den i just det steget.

**Ändringslogg v0.99.27 → v0.99.28:** Städade en föräldralös
`scene_id`-koppling — författaren märkte att om en fakta hör till en
scen som sen slås ihop bort, blev kopplingen dinglande.

- Ny `sceneIdRemovedByMerge()` i `bookScene.ts` — säger vilket scen-id
  `mergeSceneWithNext()` är på väg att ta bort, utan att själv ändra
  något (ren funktion, samma stil som grannfunktionerna).
- Ny store-action `mergeScene()` i `BookStore.tsx` som gör båda
  delarna atomiskt i en enda `patchBook`: uppdaterar `chapter.scenes`
  OCH flyttar över `scene_id` på varje berörd fakta till den
  kvarvarande scenen, istället för att lämna det pekande på ett
  scen-id som inte längre finns. "Slå ihop med nästa"-knappen i
  Scener-panelen kör nu den nya funktionen istället för att bara
  patcha `scenes[]` för sig.
- 618/618 gröna (3 nya enhetstester). Verifierat i webbläsaren end-
  to-end: delade ett kapitel i två scener, satte en fakta på scen 2
  direkt i databasen, slog ihop scenerna, läste tillbaka — faktans
  `scene_id` pekade nu på scen 1:s id, inte längre på det borttagna.

**Ändringslogg v0.99.26 → v0.99.27:** Rättade att kapitelnamnet
försvann när man maximerar skrivytan.

- Orsak: kapitelnamn-fältet (`<input className="chapter-title">`) låg
  inuti samma `.chapter-head`-omslag som `ChapterSettingsSection`
  (POV/tempo/brief-inställningarna) — när maximerat läge gömde hela
  `.chapter-head` för att ge mer skrivyta, försvann fältet med, som
  ett oavsiktligt sidoeffekt.
- Fix: bytte den maximerade CSS-regeln från att gömma `.chapter-head`
  till att bara gömma `.chapter-settings` (inställnings-widgeten
  själv, som redan är sitt eget element) — kapitelnamnet är nu en
  direkt syskon-nod till `.chapter-settings` i samma omslag och
  påverkas inte.
- 615/615 gröna. Verifierat i webbläsaren: satte ett kapitelnamn,
  maximerade, namnet syns kvar överst.

**Ändringslogg v0.99.25 → v0.99.26:** Permanent, togglebar
understrykning av Story Bible-namn i prosan — sista biten av roadmap
#24, klart nu.

- Ny "STORY BIBLE NAMES"-knapp bredvid "RARE"/"CLICHÉS" i
  synopsis- och kapitel-fotern, av som standard. Återanvänder exakt
  samma overlay-teknik som de två andra (en osynlig `.prose-rare`-
  kopia av texten med `<mark>`-spann bakom den riktiga, genomskinliga
  redigeringsytan) — ingen ny renderingsmekanik, bara ett nytt
  `is-facts`-läge i samma system.
- Träffdetekteringen fanns redan (`findNameHitsInText` i
  `bibleMentions.ts`, byggd för Ctrl/Cmd-klick i roadmap #15) — den
  hade bara aldrig fått en synlig markering, bara osynlig hovring.
  Ny `FactMarkup`-komponent i `ProseCanvas.tsx` kopierar
  `RareMarkup`s `<mark>`-splitsningsmönster.
- Ny CSS-variabel `--fact-mark` (blåton, skiljer sig från rost/
  gult/lila som de andra tre lägena redan använder), satt i både
  ljust och mörkt tema.
- Bara i Synopsis och kapiteltexten — Brainstorm har ingen
  `ProseCanvas`/namnlänkar kopplade, så ingen tredje knapp dök upp
  där (skulle ha varit en död knapp).
- 615/615 gröna (ingen ny testfil — rent UI-lager ovanpå redan testad
  logik). Verifierat i webbläsaren: skrev "Emma... Emma..." i ett
  kapitel, slog på knappen, fick två understrukna träffar, slog av
  igen och overlayen försvann helt.

**Ändringslogg v0.99.24 → v0.99.25:** Positionsmedvetna Story
Bible-fakta (roadmap #24) — författaren svarade ja på alla tre öppna
frågor, tre av fyra delar byggda.

- **Grundfixet**: ny `storyTimeRankByChapterId()` i `timeline.ts`.
  `knowledgeLeaksForChapter` (Continuity) och `factsAsOfSequence`
  ("Visa Story Bible som den var vid") går nu efter `story_time_order`
  istället för lässordning — en flashback-struktur (kapitel som läses
  senare men händer tidigare i berättelsen) hanteras nu rätt i båda.
  `factsAsOfSequence` bytte signatur (tar en rank-karta + målposition
  istället för en rå sequence_index) eftersom en fakta bara har en
  frusen lässordningsstämpel, inte en story-tidsposition — den måste
  slås upp via `chapter_id`.
- **Skriv utkast blir positionsmedveten**: ny
  `formatBibleForPromptAtPosition()` i `generateProse.ts`, används av
  Draft (kapitel och scen) — bara fakta som story-tidsmässigt redan
  hänt vid det kapitlet skickas till modellen. Recast, Proofread,
  Analysera och Brainstorm rör jag inte — de jobbar med text som redan
  finns, inte med vad ett kapitel "får" veta än.
- **Säkerhetsventilen**: nytt fält `position_override` per fakta
  (`"include"`/`"exclude"`, `NarrativeFact.ts`). Ny knapp i Story
  Bible-kortet bredvid "Dölj"/"Redigera" — Auto → Alltid med → Aldrig
  med → Auto, ett klick i taget. Vinner alltid över den automatiska
  story-tidsgissningen, för när den gissar fel.
- Kvar: permanent synlig understrykning i prosan för fakta-
  omnämnanden (fråga 2) — dokumenterat i roadmap-ideas.md som nästa
  steg, inte byggt än.
- 615/615 gröna (15 nya tester: story-tids-flashback-scenarier för
  Continuity och "as of"-vyn, positionsfiltrering i Draft, override-
  cykeln). Verifierat i webbläsaren: låste en fakta, klickade
  override-knappen genom alla tre lägen, och bekräftade att "Visa
  Story Bible som den var vid"-vyn fortfarande fungerar end-to-end.

**Ändringslogg v0.99.23 → v0.99.24:** Två separata orsaker till samma
klagomål — författaren märkte att vissa manus (t.ex. "the trio") alltid
öppnade på Kapitel 1 med Proofread-rutan i vägen.

- **Kommer ihåg var du var.** Nytt: `readLastPosition()` i
  `BookStore.tsx` läser en per-manus localStorage-nyckel
  (`storybook-ai.last-position.<id>`) och landar dig där du senast var
  — flik OCH kapitel — istället för att `openingSurface()` alltid
  gissar Kapitel 1 så fort manuset har skriven text. En ny `useEffect`
  sparar position varje gång flik eller kapitel ändras medan ett manus
  är öppet. Gäller både klick från förstasidan och auto-återställning
  vid appstart. Rensas när ett manus raderas.
- **Proofread-rutan slutar tjuvstarta.** Den öppnade sig automatiskt
  om ett korrekturpass stod som "running" ELLER "paused" i sparat
  läge — även ett pass som bara var pausat för länge sen. Nu bara
  "running" (faktiskt pågående just när du öppnar). Ett pausat pass
  väntar tyst tills du själv trycker på Korrekturläsning-knappen.
- 597/597 gröna. Verifierat i webbläsaren: skapade ett tomt manus
  (öppnar på Guide per design), navigerade till Tidslinjen, stängde
  och öppnade igen — landade direkt på Tidslinjen. Verifierade också
  att en "paused"-status inte längre tvingar fram Proofread-rutan.

**Ändringslogg v0.99.22 → v0.99.23:** Samma korsnedtoning, nu även
mellan editorns egna flikar (Brainstorm, Synopsis, Tidslinje,
Plotlines, Utvecklingsmetod, Fråga manuset, Inställningar, Guide och
att klicka ett kapitel) — författaren undrade om rail-växlingar också
tonade, det gjorde de inte förrän nu.

- `withViewTransition()` tar nu en valfri `durationMs` (standard
  320ms, som tidigare). Rail-växlingarna kör 160ms — de klickas mycket
  oftare än att öppna ett manus, så en kortare, snabbare ton känns
  bättre än att återanvända bok-övergångens längd.
- Duration sätts via en CSS-variabel (`--vt-duration`) på `:root`
  precis innan varje övergång startar, så samma globala
  `::view-transition-old/new(root)`-regel kan servera båda
  hastigheterna utan dubblerad CSS.
- Täcker alla nio `EditorSurface`-värden (kryssade av mot typen i
  `BookSchema.ts` för att inte missa någon).
- 597/597 gröna. Verifierat i webbläsaren: instrumenterade
  `startViewTransition` och läste av `--vt-duration` vid varje
  anrop — rail gav `160ms`, bok-övergångar gav `320ms`.

**Ändringslogg v0.99.21 → v0.99.22:** Korsnedtoning mellan förstasidan
och manussidan, på författarens begäran.

- Använder webbläsarens inbyggda View Transitions API
  (`document.startViewTransition`) istället för ett eget animations-
  bibliotek — noll nya beroenden, fungerar automatiskt i alla
  Chromium-baserade webbläsare. Webbläsare utan stöd (äldre Firefox)
  hoppar bara direkt till nya sidan, ingen krasch.
- Ny hjälpfunktion `withViewTransition()` i `BookStore.tsx`, som
  slår in själva state-bytet (`setBook` + tillhörande setters) i
  `flushSync` så att React hinner rendera klart innan webbläsaren tar
  sin "efter"-ögonblicksbild.
- Satte den bara runt de fem ställen där bok-läget faktiskt växlar
  på författarens egen handling — öppna ett manus, skapa ett nytt,
  importera en backup, gå tillbaka till förstasidan, radera det
  öppna manuset. Rörde INTE de täta `setBook`-anropen för
  autosparning/redigering (skulle ha gett en blinkning vid varje
  knapptryck).
- Justerade tondurationen till 320ms (webbläsarens standard är
  250ms) för en lite lugnare känsla.
- 597/597 gröna. Verifierat i webbläsaren: fångade en mellanbild
  mitt i övertoningen där båda sidorna syns blandade, och bekräftade
  att övergången bara triggas en gång per klick.

**Ändringslogg v0.99.20 → v0.99.21:** "Nytt manus" → "Starta nytt
manus", "Öppna" → "Skapa" — dels rättar en miss från v0.99.19 (bad om
etikettbytet redan då, jag byggde bara fontstorleken), dels
författarens observation att "Öppna" kändes fel för en knapp som
skapar ett nytt manus, inte öppnar ett befintligt.

- Valde "Skapa" framför "Starta" för knappen — annars säger etikett
  och knapp samma ord två gånger på rad ("Starta nytt manus" ...
  "Starta"). "Skapa" beskriver den faktiska handlingen, "Starta"
  passar bättre som rubriktonen ovanför.
- Uppdaterade samtidigt Guidens steg 1, som citerar båda texterna
  ordagrant ("tryck Öppna") — annars hade instruktionen pekat på
  knappar som inte längre finns. Alla tre språk (sv/en/nb).
- 597/597 gröna. Verifierat i webbläsaren på svenska: "STARTA NYTT
  MANUS" / "Skapa".

**Ändringslogg v0.99.19 → v0.99.20:** Rättade en riktig bugg —
författaren hade rätt, rubrikerna var fortfarande 11px trots
v0.99.19s ändring.

- Orsak: `.home-heading-lg` (min nya modifier-klass) låg TIDIGARE i
  `styles.css` än `.field-label` och `.settings-heading`. Alla tre är
  enkla klass-selektorer med samma specificitet, så CSS avgör genom
  källordning vid oavgjort — och eftersom basklasserna kom senare i
  filen vann deras `0.68rem` över min `1.125rem`, oavsett att elementet
  hade båda klasserna i `className`.
- Fix: kedjade selektorn (`.field-label.home-heading-lg`,
  `.settings-heading.home-heading-lg`) istället för att förlita mig på
  källordning — det ger högre specificitet som alltid vinner, oavsett
  var i filen reglerna står.
- Den här gången mätte jag `getComputedStyle(...).fontSize` direkt i
  webbläsaren istället för att bara titta på en skärmdump — alla tre
  ("Nytt manus", "Kom igång med en lokal AI", "Dina manus") gav exakt
  `18px`. Skärmdumpen jag skickade förra gången var för otydlig för
  att jag skulle se felet med blotta ögat.
- 597/597 gröna.

**Ändringslogg v0.99.18 → v0.99.19:** Tre saker på förstasidan, på
författarens begäran: större etiketter, en "Dina manus"-rubrik, och
ett sökfält ovanför manuslistan.

- "Nytt manus" och "Kom igång med en lokal AI" höjda till 18px
  (1.125rem). Båda delar CSS-klass (`field-label`/`settings-heading`)
  med en massa andra ställen i appen (Story Bible-fält, Inställningar,
  resten av Guiden), så storleken höjs via en ny modifier-klass,
  `.home-heading-lg`, istället för på basklassen — bara förstasidan
  påverkas.
- Ny rubrik "Dina manus" ovanför listan, samma `.home-heading-lg`-
  storlek som systrarna, så de tre känns som en enhet.
- Nytt sökfält (`.book-shelf-search`) filtrerar listan på titel medan
  du skriver, döljs när biblioteket är tomt (inget att söka i än) och
  visar "Inga manus matchar sökningen." om filtret ger noll träffar.
  Listan var redan sorterad senast redigerad-först (`Repository.ts`),
  så det behövde jag inte ändra.
- 597/597 gröna. Verifierat i webbläsaren: skapade tre testmanus,
  sökte fram exakt ett.

**Ändringslogg v0.99.17 → v0.99.18:** Flyttade "Importera backup"
till en knapp under "Läs snabbstarten", samma bredd på båda — på
författarens begäran.

- Ny kolumn, `.home-heading-actions` (flex-column, `align-items:
  stretch`), runt de två knapparna — stretch gör att båda automatiskt
  får bredden av den bredaste texten ("Ny här? Läs snabbstarten"),
  utan att jag behövde hårdkoda ett bredd-värde.
- Städade bort `.home-restore`, som blev föräldralös CSS när knappen
  flyttade ut ur sin gamla `<p>`-wrapper.
- 597/597 gröna. Verifierat i ljust tema vid 1600px — båda knapparna
  267px breda.

**Ändringslogg v0.99.16 → v0.99.17:** Flyttade "Ny här? Läs
snabbstarten" från en trång länk ovanför "Nytt manus"-fältet till en
tydlig, ordentligt tilltagen knapp uppe till höger, i höjd med
rubriken — på författarens begäran.

- Ny rad, `.home-heading-row` (flex, `justify-content: space-between`),
  runt `<h1>` och den nya knappen — rubriken tar kvarvarande bredd,
  knappen håller sin egen.
- Ny knappstil, `.home-guide-button`: bordad rektangel (inte den
  rostorangea primärfärgen, som är reserverad för "Öppna") — tydligt
  klickbar utan att konkurrera med huvudhandlingen.
- 597/597 gröna. Verifierat i både ljust och mörkt tema vid 1600px.

**Ändringslogg v0.99.15 → v0.99.16:** Fördubblade förstasidans bredd
och la tillbaka loggan högst upp på sidan, på författarens begäran.

- `.home` gick från `max-width: 40rem` till `80rem` — dubbelt, som
  efterfrågat. Allt innehåll (rubrik, ingress, formulär, snabbstarts-
  korten) drar nytta av den extra bredden; korten gick från ~187px
  till 400px vid 1920px fönsterbredd.
- Hittade samtidigt en regression: den stora loggan högst upp på
  förstasidan (`.home-logo`, redan definierad i CSS:en) försvann av
  misstag när den globala verktygsraden lades till (commit aee1fee)
  — bilderna togs bort ur `Home.tsx` men CSS-reglerna blev kvar
  oanvända. Bara den lilla loggan i verktygsraden (1.7rem) fanns kvar,
  inte den ursprungliga stora versionen på själva sidan. Lade tillbaka
  `<img>`-taggarna (samma tema-växling ljus/mörk som redan fanns).
- Samtidigt upptäcktes att `.home-brand` fortfarande var ett
  tvåkolumns-rutnät (`grid-template-columns: 1fr auto`) kvarlämnat
  från samma refaktorering — det gjorde att loggan och rubriken skulle
  hamna i fel rutnätsceller. Bytte till vanligt blockflöde, vilket
  samtidigt rättade till att "Ny här? Läs snabbstarten"-länken av
  misstag hamnade centrerad istället för vänsterställd som allt annat.
- 597/597 gröna. Verifierat i webbläsaren vid 1920px (ingen logga/
  layoutbugg) och 1100px (ingen horisontell overflow).

**Ändringslogg v0.99.14 → v0.99.15:** Visar nu snabbstartskorten
("Kom igång med en lokal AI") även på förstasidan, inte bara i
Guiden — författarens idé för att en ovan användare ska få infon
direkt, utan att behöva klicka in i Guiden.

- Extraherade korten till en delad komponent, `QuickstartCards.tsx`
  (samma ikoner, samma i18n-text), som både `GuidePanel.tsx` och
  `Home.tsx` nu använder — ingen duplicerad kod eller text att hålla
  i synk.
- På förstasidan ligger korten direkt under fältet "Nytt manus", inte
  ovanför — att skriva en titel kräver ingen AI alls, så den
  handlingen ska synas först, med korten som stödinformation strax
  under.
- Tills vidare visas korten alltid på förstasidan (oavsett om det
  redan finns manus), på författarens uttryckliga begäran — hon vill
  se hur det ser ut i praktiken innan vi låser till "bara vid tomt
  bibliotek". Görs villkorligt i ett senare steg om hon vill det.
- 597/597 gröna. Verifierat i webbläsaren (1400px bredd, korten ~187px
  breda inom förstasidans 40rem-tak — läsbart, inte trångt).

**Ändringslogg v0.99.13 → v0.99.14:** Rättade förvirrande text i
Guidens steg 1 ("Starta ditt manus"), efter författarens feedback.

- Gamla texten ("En titel räcker. Öppna det, så hamnar du här — i
  Brainstorm så fort du har idéer, men först: ett privat
  skissutrymme...") nämnde aldrig VAR man skriver titeln, och
  ordningen "Brainstorm så fort du har idéer, men först..." lästes
  som självmotsägande.
- Kontrollerade samtidigt om en ovan användare redan har ett tydligt
  formulärfält att utgå från: det finns redan — förstasidan visar
  alltid ett fält märkt "Nytt manus" med platshållartexten "Titel"
  och en Öppna-knapp, plus "Inga manus ännu. En titel räcker för att
  börja." när hyllan är tom. Ingen ny UI behövdes, bara text i Guiden
  som pekar på det som redan finns.
- Ny text: "Skriv en titel i fältet ”Nytt manus” på förstasidan och
  tryck Öppna — det är allt som krävs. Du hamnar direkt i Brainstorm:
  ett privat skissutrymme utan något att ställa in, där du skriver
  ner idéer i din egen takt." Uppdaterad i alla tre språk (sv/en/nb).
- 597/597 gröna. Verifierat i webbläsaren.

**Ändringslogg v0.99.12 → v0.99.13:** Rullade tillbaka tvåkolumns-
korten från v0.99.12 — författaren tyckte inte det blev bra: "Man
tappar 1-2-3 känslan. På min skärm skulle de rymmas i bredd. Krymp
hellre bredden om skärmen är smalare än min."

- Tillbaka till tre kolumner (`.guide-quickstart-grid`, samma rutnät
  för både kort- och stegraden igen). `.guide-card-grid` borttagen.
- Tog samtidigt bort `max-width: 60rem`-taket på hela blocket helt
  (`max-width: none`) — författarens egen skärmbild av tvåkorts-
  versionen visade tydligt oanvänt utrymme till höger om korten, vilket
  bevisar att taket (inte sidopanelerna) var den faktiska begränsningen
  på hennes skärm.
- Verifierat med Playwright vid tre fönsterbredder — kolumnantalet
  ligger fast på tre hela vägen, bredden krymper proportionerligt:
  2200px → 397px/kort, 1400px → 173px/kort, 1100px → 89px/kort. Vid
  den smalaste testade bredden (1100px, smalare än appen i övrigt är
  tänkt för — sidopanelerna ensamma tar redan ~745px) blir korttexten
  tät, men det matchar exakt vad som efterfrågades: krympa hellre än
  att tappa radkänslan.
- 597/597 gröna. Verifierat i webbläsaren.

**Ändringslogg v0.99.11 → v0.99.12:** Gjorde guide-korten 50% bredare,
på författarens begäran.

- Mätte innan jag gissade: bara vidga behållarens `max-width`-tak
  (60rem → 90rem) gav knappt märkbar skillnad (+3%) eftersom taket
  aldrig var den faktiska begränsningen — de fasta 23.25rem-breda
  sidopanelerna på ömse sidor äter redan det mesta av utrymmet på
  normala skärmar. Provade även att låta blocket blöda ut över
  `.manuscript`s 8%-padding (+20%), fortfarande inte i närheten.
- Den faktiska lösningen: bytte kortraden från tre kolumner till två
  (`.guide-card-grid`, separat rutnät från stegraden nedanför som
  fortfarande använder tre). Att gå från en tredjedels till en
  halv bredd per kort är matematiskt exakt +50% — uppmätt till
  +52,6% i praktiken (472px mot tidigare 309px vid 1920px
  visningsbredd). Tredje kortet radbryts naturligt till en egen rad,
  i samma bredd som de andra två — ingen specialbehandling behövdes.
- 597/597 gröna. Verifierat i webbläsaren.

**Ändringslogg v0.99.10 → v0.99.11:** Snabbstarten i Guiden byggd om
till ett kortlägge, efter författarens egen mockup och design-review
i förra rundan.

- "Kom igång med en lokal AI" blev tre kort (Installera en lokal
  AI-server / Välj din AI-modell / Koppla den till StoryBook AI) —
  tidigare var detta två hopklämda textstycken. Rättade samtidigt de
  problem som identifierades i mockupen: LM Studio blandades ihop med
  en chattmodell (det är en server, precis som Ollama, inte en
  modell) i författarens utkast — separerat till rätt kort nu.
- Nya ikoner: tre minimala linje-SVG:er (nedladdning, gnista, kedjelänk)
  i cirkulära märken med samma indragna kant-stil som "?"-hjälpknapparna
  redan använder, färgade med `--ink` (samma rostorange som appens
  primärknappar). Inga platshållar-clipart-ikoner — bara enkla streck,
  konsekvent med loggans handtecknade känsla.
- "Så jobbar du med StoryBook AI" (de gamla stegen 3–4, "Starta ditt
  manus" / "Skriv") flyttades till en egen rubrik under korten och
  omnumrerades till 1–2, eftersom de nu är ett eget litet flöde
  snarare än en fortsättning på kortens numrering.
- Layout på författarens begäran: stegen under korten begränsas till
  bredden av två kort (`grid-column: span 2` i samma
  tre-kolumners-rutnät som korten ovanför), så den tredje kolumnens
  yta lämnas tom till höger — reserverad för framtida bilder/
  illustrationer om det känns värt att lägga till senare.
- Datamodellen delades: `guide.quickstartSteps` (4 poster) blev
  `guide.quickstartCards` (3, nya) + `guide.quickstartSteps` (2,
  omnumrerade) i alla tre språkfiler, plus en ny
  `guide.quickstartStepsHeading`-sträng.
- 597/597 gröna. Verifierat i webbläsaren i båda teman, både i
  Hem-sidans guide-overlay och Editorns fullsideguide.

**Ändringslogg v0.99.9 → v0.99.10:** Fixade en skrollbugg författaren
upptäckte: långt innehåll i mittenytan (t.ex. hela Guiden) fick HELA
sidan att skrolla istället för bara mittenkolumnen, så att
vänstermenyn och Story Bible-panelen rullade bort ur synhåll.

- Root cause: varken `.manuscript` (mittenytans delade basklass —
  Kapitel, Synopsis, Brainstorm, Guide, Inställningar, Fråga manuset,
  Tidslinje, Trådar, Utvecklingsmetod använder alla den) eller
  `.rail`/`.rail-right` hade `overflow-y: auto`. Bara `min-height: 0`
  fanns satt — en nödvändig men inte tillräcklig förutsättning; utan
  ett faktiskt `overflow`-värde rinner för högt innehåll bara ut ur
  sin grid-cell och förlänger hela sidans skrollbara yta istället för
  att skrolla för sig. Upptäcktes egentligen redan vid gårdagens
  layout-omarbetning (ett mätvärde flaggade det: `body.scrollHeight`
  var 3782px mot 850px synligt — avfärdades då som troligen ofarligt
  eftersom stillbilder såg korrekta ut, men en stillbild av en
  oskrollad överfylld sida ser identisk ut oavsett om skrollningen
  fungerar rätt eller inte. Läxan: mät faktiskt skrollbeteende, inte
  bara en enda skärmdump, när en `overflow`-relaterad ändring görs.
- Fix: `overflow-y: auto` tillagt direkt på de två delade basklasserna
  (`.manuscript`, `.rail`) istället för i varje enskild sid-klass —
  några sidor (`.settings-page`, `.plotline-matrix-page`,
  `.method-panel`) hade redan egna ad-hoc-lösningar av samma problem,
  men Guide hade ingen, vilket är precis hur buggen visade sig. Tog
  också bort `.rail-right`s `overflow: hidden` (som klippte innehåll
  istället för att skrolla det — troligen menat som en
  dubbel-skrollbar-fix, men fel medel).
- Verifierat med faktisk skrollning (inte bara en stillbild denna
  gång): `document.body.scrollHeight` matchar nu exakt
  `window.innerHeight`, och `window.scrollY` förblir 0 efter att ha
  skrollat mittenkolumnen 900px för hand — sidan skrollar inte alls
  längre, bara den kolumn som faktiskt är för lång.
- 597/597 gröna.

**Ändringslogg v0.99.8 → v0.99.9:** Två snabba uppföljningar på
gårdagens topprad, båda på författarens begäran.

- Manustitel-fältet var för smalt (`max-width: 24rem`) och klippte
  längre titlar — brett ut till `40rem`.
- Flyttade Inställningar från vänstermenyn till bok-radens knapprad
  (bredvid Säkerhetskopiera/Sök) — samma `store.showSettings()`-anrop
  som förut, bara ett nytt anropsställe. Vänstermenyn har nu bara
  kvar de faktiska skrivverktygen (Brainstorm → Synopsis →
  Utvecklingsmetod → Dispositioner → Kapitel → Fråga manuset →
  Tidslinje → Trådar → Korrekturläsning) plus Publicera längst ner —
  precis den uppdelning författaren bad om.
- 597/597 gröna. Verifierat i webbläsaren: full titel syns nu, och
  Inställningar öppnas och markeras aktiv korrekt från sin nya plats.

**Ändringslogg v0.99.7 → v0.99.8:** Ny global topprad, delad mellan
Hem-sidan och Editorn — författarens förslag, med hennes egen
uppdelning i två rader: en app-nivå-rad (logga, Manuskript-meny,
Guide, Språk, Tema) och en bok-nivå-rad (titel, ordräkning/mål,
Säkerhetskopiera, Sök) så det blir tydligt vad som gäller hela appen
och vad som bara gäller boken som är öppen.

- Ny `AppTopBar.tsx`, monterad i `Shell()` (`App.tsx`) ovanför
  `<Editor/>`/`<Home/>` så den alltid syns, oavsett vy.
- **Manuskript-menyn**: "Nytt manuskript…" högst upp, en tunn linje,
  sen upp till 10 senast ändrade manuskript (återanvänder
  `Repository.list()`s befintliga sortering — den sorterade redan
  fallande på `updated_at`, inget nytt sorteringsbehov), och —
  bara om fler än 10 manuskript finns — "Visa alla manuskript" längst
  ner. Verifierat med 11 skapade manuskript: exakt de 10 senaste
  visas, det äldsta utelämnas, "Visa alla" dyker upp. Egen
  klick-utanför-stänger-menyn-logik (samma mönster som redan fanns
  för högerklicksmenyn i `ProseCanvas.tsx`).
- **Guide, Språk, Tema** flyttade från att finnas dubbelt (Guide i
  vänstermenyn i Editorn + eget Hem-header; Språk/Tema i både
  Editorns och Hems egna headers) till att bara finnas en gång, i den
  nya globala raden. Guide-knappen är kontext-medveten: har man en
  bok öppen växlar den Editorns "guide"-yta (samma mekanism som
  förut, bara flyttad startpunkt); har man ingen bok öppen öppnar den
  samma overlay-modal Hem redan hade — det tillståndet lyftes upp
  till `Shell()` och skickas ner till `Home` som props istället för
  att vara Hems egen lokala `useState`.
- Loggan i den globala raden är nu klickbar → går till "alla
  manuskript" (samma som gamla "Alla manus"-knappen, som togs bort ur
  Editorns egen header eftersom Manuskript-menyn gör den överflödig).
  Nödvändigt tillägg: annars fanns det ingen väg tillbaka till Hem
  när man har 10 eller färre manuskript (då syns inte "Visa alla").
- Hems egen stora logga (byggd för två ändringsloggar sedan) togs
  bort helt — att ha loggan både stor på Hem och liten i den globala
  raden hade blivit dubbelt. `.eyebrow`-ersättaren `.home-chrome`
  (Språk/Tema) städades bort som dödkod av samma anledning.
- Layout-fälla som fångades under verifieringen: `.editor` satte
  `height: 100%` rakt av, vilket funkade så länge Editorn var
  `#root`s enda barn. Med `AppTopBar` som ny syskon-rad hade det gett
  Editorn 100% av `#root`s höjd OVANPÅ topprademns egen höjd — sidan
  hade blivit för hög. Löst genom att göra `Shell()`s wrapper till en
  flex-kolumn (`.app-shell`) och byta `.editor` till `flex: 1;
  min-height: 0` istället, samma mönster Editorn redan använder
  internt för sin egen header+innehåll-uppdelning.
- Döda i18n-nycklar (`editor.allManuscripts`) och CSS (`.home-chrome`)
  städade bort i samma veva.
- 597/597 gröna. Verifierat grundligt i webbläsaren: menyn i båda
  teman, växling mellan böcker utan omväg via Hem, Guide från både
  Hem och Editor (inklusive växling bort från en annan yta), och
  >10-manuskript-fallet.
**Ändringslogg v0.99.6 → v0.99.7:** Linjerade "Använd den här
metoden"-knapparna i metodväljarens kort. `.method-card` var
`display: grid; align-content: start`, så olika lång
beskrivningstext gav olika kort-höjder innan knappen, trots att
korten själva var lika höga (grid sträcker rader som standard).
Ändrat till `display: flex; flex-direction: column` med
`margin-top: auto` på knappen, så den alltid botten-justeras — exakt
mönstret författaren pekade på (Snowflake-kortet, med sin längre
text, hade redan knappen där den skulle vara). 597/597 gröna,
verifierat i webbläsaren med alla fyra korten i rad.

**Ändringslogg v0.99.5 → v0.99.6:** Rättade ordningen i vänstermenyn
på författarens begäran. Fråga manuset, Tidslinje och Trådar låg
tidigare klämda mellan Synopsis och Utvecklingsmetod/Dispositioner,
vilket bröt själva skrivpipelinen mitt itu. Flyttade de tre till att
stå tillsammans med de andra manus-omfattande referensverktygen,
direkt före Korrekturläsning/Publicera (de behöver ändå skrivet
material för att vara meningsfulla). Utvecklingsmetod satt redan rätt
(precis före Dispositioner, eftersom dess resultat landar i just
Synopsis/Trådar) och rördes inte. Ny ordning: Brainstorm → Synopsis →
Utvecklingsmetod → Dispositioner → Kapitel → Fråga manuset →
Tidslinje → Trådar → Korrekturläsning → Publicera — en obruten
skrivpipeline följt av en grupp referensverktyg. Ren
JSX-omflyttning, ingen ny logik. 597/597 gröna, verifierat i
webbläsaren.

**Ändringslogg v0.99.4 → v0.99.5:** Författaren skrev om stora delar av
Guiden själv och bad mig faktagranska den mot koden innan den lades
in. Granskningen hittade en sak som var direkt fel och en som
riskerade att missleda — båda korrigerade innan texten gick in, efter
författarens beslut på varje punkt.

- **"Helt isolerad" var inte sant.** `index.html` laddade tre
  typsnitt (Figtree, Newsreader, IBM Plex Mono) från Google Fonts vid
  varje start — den enda externa nätverkskopplingen som gick att
  hitta någonstans i `src/`. Löst genom att bunta typsnitten lokalt:
  hämtade woff2-filerna direkt (5 unika filer efter att ha filtrerat
  bort `latin-ext`-delmängden, som inte behövs för sv/en/nb — några
  av typsnitten visade sig vara variabla fonter där flera
  deklarerade vikter pekar på samma fil), lade dem i
  `public/fonts/`, skrev egna `@font-face`-regler i `styles.css` och
  tog bort Google Fonts-länkarna helt. Verifierat med Playwright: hela
  appen laddades och renderade korrekt med *alla* icke-lokala
  värdnamn blockerade på nätverksnivå — noll externa anrop, typsnitten
  bekräftat "loaded" via `document.fonts`. Nu stämmer påståendet i
  guidens nya filosofi-avsnitt.
- **Stheno-rekommendationen pekade fel.** `l3-8b-stheno` går inte att
  hitta i Ollama rakt av — riktiga Ollama-namn är namnrymdade
  (`fluffy/l3-8b-stheno-v3.2`, verifierat via websökning). Rättat i
  snabbstartens steg 1 i alla tre språk.
- Mindre rättningar: knappen heter "Lås" i granskningskön, inte
  "Godkänn". "AI:n läser inte Brainstorm" stämde inte helt — Fråga/
  Förläng/Utveckla-funktionerna läser faktiskt anteckningarna när man
  använder dem (det som är sant är att inget därifrån blir kanon av
  sig självt); omformulerat med författarens egna "anslagstavla/
  post-it"-metafor. Ett exempel om en fakta-konflikt (bruna kontra
  låsta blå ögon) flyttades från Analysera-avsnittet (som bara
  jämför mot karaktärsdrag, inte sakuppgifter) till Story
  Bible-avsnittet (där konfliktflaggning faktiskt sker).
- Ny sektion "Ett helt stängt digitalt kassaskåp" (första i "Så är
  appen uppbyggd") — ny `GUIDE_SECTION_IDS`-post `"privacy"` i
  `GuidePanel.tsx`, plus motsvarande `guide.sections[0]` i alla tre
  språkfiler. Ingen ny "?"-hjälpknapp kopplad till den (inget enskilt
  navigeringselement den hör till), men anker-id:t finns för framtida
  bruk.
- Innehållet är nu översatt och konsekvent i alla tre språk (en/sv/
  nb) — appens beteende och dess egen dokumentation stämmer nu
  överens på den punkt som var den enda kända medvetna luckan.
- 597/597 gröna genom hela arbetet (typsnittsbytet och textändringarna
  rör ingen kärnlogik). Verifierat i webbläsaren i både engelskt och
  svenskt gränssnitt.

**Ändringslogg v0.99.3 → v0.99.4:** Justerade proportionerna på
startsidans nya rubrik, på författarens direkta begäran: loggan
dubbelt så stor (`.home-logo` 2.6rem → 5.2rem), rubriktexten till 75%
(`.home h1` `clamp(2rem, 5vw, 3.1rem)` → `clamp(1.5rem, 3.75vw,
2.325rem)`). 597/597 gröna, verifierat i båda teman.

**Ändringslogg v0.99.2 → v0.99.3:** Riktig logga överst på
"alla manuskript"-sidan (`Home.tsx`), istället för textetiketten
"StoryBook AI". Författarens egen skiss-till-solid-logga, levererad
som PNG med transparent bakgrund.

- Upptäckte under verifieringen att appens **standardläge är mörkt**
  (`[data-theme="light"]` är overridet, inget attribut = mörkt) — och
  loggans svarta text försvann nästan helt mot den nästan svarta
  bakgrunden. Löste det genom att generera en andra variant
  (`logo-dark.png`, RGB-inverterad med bevarad alfakanal via Pillow —
  svart text blir vit, den grå skiss-/rasterstrukturen blir ljusgrå)
  och visa rätt variant med samma `[data-theme="light"]`-mönster
  resten av appen redan använder för temaväxling — ingen ny
  temainfrastruktur behövdes.
- Ren stopgap-lösning: om författaren har en egen avsedd mörk variant
  (t.ex. med guldaccenten istället för vitt) byts `public/logo-dark.png`
  ut direkt, ingen kodändring krävs.
- Tog bort den nu oanvända `.eyebrow`-CSS-regeln (loggan ersätter den
  textetiketten helt, och den användes ingen annanstans i kodbasen).
- Bilder sparade i `public/logo.png` / `public/logo-dark.png`, samma
  konvention som `public/illustration-examples/` redan använder
  (absolut sökväg i `<img src>`, inget Vite-asset-import).
- 597/597 gröna (inga kärnlogik-tester påverkade — rent UI/asset).
  Verifierat i webbläsaren i båda teman.

**Ändringslogg v0.99.1 → v0.99.2:** Två småförbättringar av
Karaktärsintervjun, båda direkt efterfrågade av författaren efter
förra ändringen.

- Avatarerna var bottenjusterade (`align-items: flex-end`) så att de
  hamnade vid sista raden i en lång replik istället för högst upp vid
  namnet — ologiskt när bubblan är flera stycken lång. Ändrat till
  `flex-start` så avataren alltid ligger i kant med repliktexten.
- Ny "Plocka ut fakta"-knapp i intervjuns huvud. Skickar hela
  transkriptet genom exakt samma extraktor som redan används för
  kapitelprosa (`EXTRACTOR_SYSTEM`/`extractorUserPrompt`/
  `parseExtractorPayload` i `extractFacts.ts`, samma
  `applyExtractorDrafts()` som kapitel-extraktionen) — inget nytt att
  bygga där. Extraktorn är entitetsagnostisk och plockar upp fakta om
  VEM SOM HELST som nämns i samtalet, inte bara den intervjuade
  karaktären (verifierat: en intervju med Kraighten som nämnde vännen
  Tonnison gav förslag på båda). Landar i exakt samma
  granskningskö ("Review") som all annan extraherad fakta — inget
  låses förrän författaren själv godkänner, i linje med "författaren
  slår alltid AI"-principen. Provenens (vilket kapitel/sekvensindex
  fakta registreras mot) återanvänder samma mönster som `addFact()`
  redan gör för manuellt tillagda fakta: det just nu öppna kapitlet,
  eftersom en intervju inte har någon egen manusposition.
- 597/597 gröna (inga nya kärntester behövdes — funktionen är ren
  återanvändning av redan testad extraktor- och gate-logik). Verifierat
  i webbläsaren med ett mockat AI-svar: avataren ligger nu i kant med
  namnet, och "Plocka ut fakta" ger tre korrekta förslag i
  granskningskön efter ett samtal.

**Ändringslogg v0.99 → v0.99.1:** Fixade en CSS-specificitetsbugg i
Karaktärsintervjun där texten rann utanför fönstrets kant, och byggde
om samtalet till ett SMS-liknande utseende med avatarer, på
författarens direkta begäran.

- Root cause: `.interview-card` (som sätter `display: flex` för att
  transkriptet ska kunna krympa och rulla internt) och `.edit-card`
  (som sätter `display: grid`) hade samma specificitet men `.edit-card`
  stod senare i filen, så grid-layouten vann. Utan flex-behållaren
  ignorerade transkriptets `flex: 1 1 auto`/`overflow-y: auto` sin
  container helt, så hela kortet växte förbi sin `max-height` med
  standardvärdet `overflow: visible` — texten rann synligt utanför
  kortets kant, precis som författaren beskrev och visade i en
  skärmdump. Samma mönster som specificitetsbugen som fixades tidigare
  för kapitel-inställningarna: löst med sammansatt selektor
  (`.edit-card.interview-card`) istället för `.interview-card` ensamt,
  plus `overflow: hidden` på kortet och `min-height: 0` på
  transkriptet (den klassiska flexbox-fällan där ett flex-barn annars
  vägrar krympa under sitt eget innehåll även med `overflow-y: auto`
  satt).
- Repliker visas nu som pratbubblor i par med en rund avatar — en
  generisk personikon för författaren, karaktärens första Story
  Bible-bild (om en finns, `picturesFor()` — samma funktion Story
  Bible-panelen redan använder) annars en bokstavsplacerad cirkel med
  karaktärens initial. Författarens repliker hamnar till höger,
  karaktärens till vänster — SMS-mönstret författaren efterfrågade.
- Verifierat i webbläsaren med ett mockat lokalt AI-svar (fyra
  utbyten i rad, i ett medvetet lågt fönster för att stresstesta
  buggen): kortet håller sig nu inom synligt fönster oavsett hur lång
  konversationen blir, med korrekt rullning istället för överflöde.
  597/597 gröna, typkontrollen ren.

**Ändringslogg v0.98 → v0.99:** Utvecklingsmetoder som pluggbart
lager (roadmap #13) — ett valbart "Development Method" (Snowflake,
Three-Act Structure, Save the Cat, Hero's Journey) som generaliserar
den befintliga pipelinen Brainstorm → Synopsis → Dispositioner →
Kapitel. Precis som roadmap-punkten kräver äger en metod aldrig någon
egen data: den skriver bara in i det som redan finns.

- Två sorters steg, båda återanvändning av befintlig funktionalitet:
  **vändpunktsbaserade** metoder (Three-Act, Save the Cat, Hero's
  Journey) materialiserar varje vändpunkt som en tråd i Trådar
  (`materializeBeats()` bygger vidare på `addPlotline()`, med
  dubblettskydd på titel) — författaren kopplar sedan kapitel till
  vändpunkter precis som med vilken annan tråd som helst.
  **Expansionsbaserade** metoder (Snowflake) är en guidad
  stegsekvens där varje steg har ett eget utkastfält, en valfri
  AI-föreslagning (`developExpand`, samma icke-strömmande
  `provider.chat()`-mönster som Ask Manuscript) och en "Skicka till
  Synopsis"-knapp som återanvänder `liftFragmentToSynopsis()` från
  Brainstorm.
- Ny `Book.development_method?: string` — bara vilken metod som är
  vald, inget annat. Ny ytenum-medlem `"method"`.
- All visningstext (metodnamn, beskrivningar, vändpunktsetiketter,
  ledtrådar, steg-prompter) ligger i `i18n` under
  `method.methods.<id>`, inte i kärnlogiken — kärnan
  (`developmentMethod.ts`) håller bara ordning på steg-id, steg-typ
  och (för vändpunkter) ungefärlig position. Metodernas egna namn
  (Snowflake Method, Save the Cat, osv.) hålls omedvetet oöversatta i
  alla tre språk, i linje med tidigare beslut att globalt kända
  skrivtermer förblir sina originalnamn — men alla beskrivningar,
  vändpunktsetiketter och stegtexter är fullt översatta till svenska
  och norska.
- Ny guide-sektion ("Development method" / "Utvecklingsmetod" /
  "Utviklingsmetode") mellan Plotlines och Proofread, plus
  "?"-hjälpknapp i navigeringen som för alla andra ytor.
- 10 nya tester för `developmentMethodById`, metodernas
  steg-invarianter (ingen blandning av vändpunkt/expansion inom en
  metod, inga dubbla steg-id), `materializeBeats` (lägger till,
  dedupliserar, gör inget för expansionsmetoder eller vid saknad
  etikett) och `developExpandUserPrompt`. 597/597 gröna. Verifierat i
  webbläsaren: metodväljaren, en vändpunktsmetod som fyller Trådar
  korrekt, och Snowflakes "Skicka till Synopsis" som faktiskt lyfter
  texten till Synopsis-sidan.

**Ändringslogg v0.97 → v0.98:** Setup/payoff-spårning (roadmap #12) —
"pistolen introducerades i kapitel 4, ingen payoff än". Byggd som ett
sjunde Korrekturläsnings-steg ("Setups & payoffs"), samma mönster som
Continuity (#10): återanvänder hela stegmaskinen, "bara
anteckningar"-principen och flagg-renderingen, inget nytt UI-skelett.

- Deterministisk detektering var inte möjligt den här gången (till
  skillnad från Continuitys platshistorik) — att avgöra om något är
  "planterat" och saknar payoff kräver berättarförståelse, så det är
  ett riktigt AI-omdöme. Modellen ombeds vara försiktig: bara flagga
  det som läser som medvetet planterat, hellre missa en flagga än ge
  ett falskt alarm, och aldrig flagga något en senare kapitel-utdrag
  redan verkar lösa in.
- Återanvänder Style-stegets etablerade mönster för att hålla hela
  manuset i EN modellanrop utan att skicka full prosa: ett kompakt
  utdrag per kapitel (första två styckena + sista stycket, klippta).
  Samma teknik, ny användning — inget nytt att uppfinna där.
- Medveten avgränsning mot roadmap-punkt 14 (hel-manus developmental
  analys): den punkten säger uttryckligen "aldrig hela manuset i ett
  enda modellanrop" för en djup analys av allt manuset. Setup/payoff
  är en mycket smalare fråga (bara "märktes X, löstes X in") som
  klarar sig med kompakta utdrag i ett anrop — inte samma sak som en
  fullständig utvecklingsanalys.
- Ingen ny persisterad datamodell (t.ex. en Plotlines-liknande
  spårningslista med öppna/lösta poster) — medvetet vald bort till
  förmån för den lättare Proofread-formen, i linje med att
  författaren själv beskrev punkten som "inte brådskande". En sådan
  lista är en möjlig framtida utbyggnad om flaggorna visar sig för
  flyktiga i praktiken.

Nya tester för `parseSetupResult` (kapitelmappning, tomt vid saknad
observation/okänt kapitel, tomt vid oparsad JSON). Integrationstestet
för hela pipelinen uppdaterat till sju steg. Fixade även en
föråldrad testfixtur ("skips chapters already recorded in factsDone
when resumed") som inte satte de nya continuityDone/setupsDone-
flaggorna och därför fick ett extra anrop den inte förväntade sig.
587/587 gröna. Verifierat i webbläsaren: flaggan renderas korrekt
under en egen "Setups & payoffs"-rubrik.

**Ändringslogg v0.96 → v0.97:** Klickbara namn i manuset → Story
Bible-kortet (roadmap #15) — omvänd riktning mot Mentions (punkt 3):
Ctrl-klicka (Cmd-klicka på Mac) på ett namn medan du skriver hoppar
direkt till dess Story Bible-kort. Vanligt klick fungerar precis som
förut (placerar markören), så det stör aldrig vanlig redigering.

- Ny `findNameHitsInText()` i `bibleMentions.ts` — samma
  matchningslogik (`mentionPattern`/`matchesFor`) som Mentions redan
  använder, bara körd i motsatt riktning (en text, alla entiteter,
  istället för en entitet, alla kapitel). Vid namnkrock mellan två
  entiteter (t.ex. "Henrik" och "Henrik Andersson" som separata
  poster) vinner den längsta träffen.
- Ingen permanent markering i texten — bara en tooltip vid hovring
  ("Ctrl-klicka för att öppna Henriks kort") plus själva klicket.
  Medvetet val: till skillnad från ovanliga ord/klichéer (en
  granskningsvy man slår på) är namnhoppet en navigeringsgenväg som
  ska finnas där hela tiden utan att tynga ner texten visuellt.
- Krävde att lösa samma tekniska hinder som tooltip-tillägget i
  v0.96 löste (markeringslagret har `pointer-events: none`) — men nu
  även för klick, inte bara hovring, via `onClickCapture` på den
  riktiga textytan så vanlig markörplacering aldrig störs.
- `BiblePanel` fick en ny `openEntitySignal`-prop (ett nytt objekt
  varje gång, så samma namn kan klickas två gånger i rad utan att
  behöva stängas emellan) eftersom kortets öppna/stängda-state bor
  lokalt i `BiblePanel`, inte i storen.

Nya tester för `findNameHitsInText` (rätt entitet per träff, längsta
match vinner vid krock, tomt vid inga/okända namn). 584/584 gröna.
Verifierat i webbläsaren: hovring visar tooltipen, Ctrl-klick öppnar
rätt kort, vanligt klick gör det inte.

**Ändringslogg v0.95 → v0.96:** Character Interviews (roadmap #18) +
tooltips på markeringarna från v0.95, efter direkt önskemål om båda.

- **Character Interviews**: en tredje chattform vid sidan av Fråga
  manuset (fakta ur manuset) och Brainstorms Ask (tänkepartner) —
  chatta MED en specifik karaktär, i första person, byggt bara på
  deras egna låsta fakta (`visibleLockedFacts` filtrerat på
  `entity_ref`, samma princip som Draft redan använder). Modellen
  ombeds erkänna luckor ("jag vet inte") istället för att hitta på ny
  bakgrund som fakta — syftet är att upptäcka röst och hål i det
  etablerade, inte skapa kanon.
  - Ny "Intervjua"-knapp på en karaktärs kort i Story Bible (bara för
    `kind === "characters"` — platser/föremål/grupper får ingen).
  - Riktig flerturs-chatt: hela samtalshistoriken skickas med varje
    fråga (systemet har redan stöd för `assistant`-roll i
    meddelande-arrayen, bara `PromptDebugMessage`-typen behövde
    vidgas), så modellen minns tidigare svar i samma samtal.
  - Medvetet inte sparat till manuset — flyktigt precis som Fråga
    manuset-svaret, borta när kortet stängs. En enkel utökning senare
    om det visar sig behövas.
- **Tooltips på markeringarna** (ovanliga ord + AI-klichéer, v0.95):
  författaren bad om en kort förklaring till varför något är
  markerat. Upptäckte under bygget att markeringslagret medvetet har
  `pointer-events: none` (det ligger bakom den riktiga texten så att
  skrivning/markering fungerar normalt) — vilket gör att en vanlig
  HTML `title` aldrig hade visats. Löst med ett litet eget
  hover-lager: `onMouseMove` på den riktiga textytan räknar ut vilket
  ord/vilken fras muspekaren står över (samma `offsetFromPoint`-teknik
  högerklicket för "ordalternativ" redan använder) och visar en liten
  ruta med anledningen — skild text för ovanliga ord, klichéfraser och
  överanvända tankstreck.

Nya tester för `characterInterviewSystem` (bara egna fakta, erkänner
luckor, respekterar dolda fakta) och utökade tester för
`findAiTicHits` (nu taggade `kind: "phrase" | "dash"`). 580/580 gröna.
Verifierat i webbläsaren: skapa karaktär → Intervjua → flerturs-samtal
med rätt historik, samt att tooltipen dyker upp vid hovring och
försvinner när musen flyttas bort.

**Ändringslogg v0.94 → v0.95:** AI-skrivtics-markering (roadmap #17).
Precis som roadmap-anteckningen förutspådde: billigt att bygga, ingen
AI inblandad — samma mekanism som "ovanliga ord"-markeringen redan
använder (`rareWords.ts`/`RareMarkup`), bara en ny fråga (`aiTics.ts`)
och en ny överlagringsfärg.

- Ny `findAiTicHits()`: en kurerad lista klichéfraser ("a testament
  to", "tapestry of", "delve into" m.fl.) plus en täthetskontroll för
  tankstreck — flaggar bara tankstreck när de faktiskt är
  överanvända (mer än ett per ~150 ord), inte ett enstaka naturligt
  bruk.
- Ny "Klichéer"-växel bredvid den befintliga "Ovanliga ord"-växeln
  under texten, i Brainstorm, Synopsis och kapitelvyn. De två är
  ömsesidigt uteslutande (en åt gången) snarare än staplade, för att
  hålla överlägget läsbart och undvika att bygga en sammanslagen
  markeringsmotor för v1.
- Ny lila överlagringsfärg (`--tic-mark`) skild från "ovanliga
  ord"-markeringens rost-orange, så de två aldrig kan förväxlas när
  man växlar mellan dem.
- Ren visning, ingen interaktion byggd ovanpå träffarna (till skillnad
  från "ovanliga ord", där högerklick öppnar ordalternativ) —
  medvetet avgränsat för att hålla detta som ren markering, precis som
  roadmap-anteckningen bad om.
- Guiden uppdaterad: Kapitel-avsnittet nämner nu båda växlarna, i alla
  tre språk — passade på att dokumentera "Ovanliga ord" också, som
  aldrig stod i guiden sedan tidigare.

Nya tester för `findAiTicHits` (frasträff, tyst på vanlig prosa,
tankstreck-täthet, inga överlappande träffar). 577/577 gröna.
Verifierat i webbläsaren: rätt fraser flaggas, växeln byter läge
korrekt, och att aktivera "Ovanliga ord" stänger av "Klichéer"
automatiskt.

**Ändringslogg v0.93 → v0.94:** Continuity 2.0 färdigställd (roadmap
#10) — den återstående halvan (spatial kontinuitet + objekttillstånd)
som kunskapsläckor (v0.78) lämnade öppen. Vägvalet mellan en
författar-underhållen platskarta och ett AI-baserat omdöme diskuterades
uttryckligen; AI-vägen vald, som en ny Korrekturläsnings-etapp — samma
"anteckningar, inget skrivs om"-princip som resten av Korrekturläsning.

- **Ny etapp "Continuity"** mellan Åldersrapport och Faktakontroll.
  Deterministisk förberedelse (`manuscriptPlaceChains` i
  `proofread.ts`, återanvänder `bookFactChains`/`chainsWithHistory`
  från Tidsmedvetna Story Bible och `timelineEntries` från Timeline —
  ingen ny datamodell): för varje entitet (person ELLER föremål) vars
  `core.place`-fakta ändrats, en tidslinje i berättelsens egen
  tidsordning (inte lässordning, så en tillbakablick inte ser ut som
  en omöjlig förflyttning). Bara detta skickas till modellen, som
  flaggar en förflyttning som ser omöjlig eller oförklarad ut givet
  hur mycket berättartid som gått — inte varje platsbyte (det är
  normalt att en berättelse rör sig).
- Samma mekanism täcker roadmap-textens två separata exempel
  ("omöjlig förflyttning" och "gun.location") eftersom båda bara är
  `core.place`-fakta på olika sorters entiteter — ingen anledning att
  bygga två system.
- Flaggade träffar visas som "Chapter A och B" med citat från båda
  platsvärdena, samma mönster som upprepade-scener-etappen redan
  använder.
- Explicit avgränsning: bara plats. Annat objekttillstånd (t.ex.
  "förstörd") fångas inte — ingen befintlig fakta-predikat modellerar
  det tydligt idag, och att gissa på core.trait/core.event hade varit
  spekulativt. Kvar för en framtida session om det visar sig behövas.
- Guiden uppdaterad: "Continuity warnings"-avsnittet nämner nu även
  den nya kontrollen, i alla tre språk.

Nya tester för `manuscriptPlaceChains` (story-tids-sortering, hoppar
över entiteter med bara en plats) och `parseContinuityResult`
(korrekt kapitel-mappning, avvisar okänd entitet/kapitelnummer).
Integrationstestet för hela Korrekturläsnings-pipelinen uppdaterat
till sex etapper. 571/571 gröna. Verifierat i webbläsaren: hela
pipelinen kör igenom utan fel och landar på "done" med den nya etappen
med, samt att guide-texten renderas rätt.

**Ändringslogg v0.92 → v0.93:** Roadmap-punkt 22, tidigare uppskjuten:
"?"-genvägar från rubriker till guiden, plus att guiden själv fick
ikapp de två senaste funktionerna den inte nämnde.

- **Guiden uppdaterad**: "Kapitel"-avsnittet nämner nu Reader-fältets
  fasta åldersnivåer (Pekbok–Vuxen), och "Korrekturläsning"-avsnittet
  nämner nu att den flaggar svordomar/våld/explicit innehåll när
  läsaren är satt till en barn- eller ungdomsnivå. Guiden låg efter
  sedan v0.91 — bara text, ingen ny funktion.
- **"?"-knappar** vid åtta rubriker/navigeringsposter som redan hade
  en motsvarande sektion i guiden: Brainstorm, Synopsis, Fråga
  manuset, Timeline, Trådar, Kapitel, Korrekturläsning, Publicera —
  plus Story Bible-rubriken i högerspalten. Varje knapp hoppar rakt
  till rätt avsnitt i guiden med skroll, samma `openGuide(anchor)` och
  samma stabila ankare (`GUIDE_SECTION_IDS`) som felbannerns
  guide-länk redan använde. Inställningar, Scener, Kontinuitet och
  "Author beats AI" fick medvetet ingen knapp — de saknar en enda
  tydlig rubrik att fästa den vid.
- Ny delad `GuideHelpButton`-komponent i `Editor.tsx`; `BiblePanel`
  fick en ny valfri `onOpenGuide`-prop eftersom guide-hoppet (med
  vilket ankare) styrs av lokalt state i `Editor.tsx`, inte av storen.

Ingen ändring av befintlig funktionalitet. 567/567 gröna. Verifierat i
webbläsaren: alla nio "?"-knappar renderas, och en klickad knapp
(testat på Trådar och Story Bible) öppnar guiden skrollad till rätt
avsnitt.

**Ändringslogg v0.91 → v0.92:** Kapitelinställningarna (Voice, Reader,
POV, Tense, Viewpoint, Fortsätter från, Skriv om-knappen) låg tidigare
alltid synliga under kapitelrubriken, även om man sällan ändrar dem.
Flyttade hela blocket ovanför rubriken och gjorde det till en
ihopfällbar sektion ("▸ Chapter settings"), samma mönster som den
befintliga scen-listans ihopfällning.

Nytt: sektionen öppnas automatiskt om kapitlet faktiskt avviker från
manuset (egen Voice, Reader, POV, Tense, Viewpoint eller
Fortsätter-från satt) — annars är den stängd som standard, eftersom
inget finns att se. Öppen/stängd räknas om varje gång man byter
kapitel (inte en global inställning), så man aldrig missar en aktiv
avvikelse på ett kapitel bara för att ett annat kapitel var stängt.

Ingen ändring av vad fälten gör, bara var de ligger och att de går att
gömma undan. 567/567 gröna. Verifierat i webbläsaren: stängt läge,
öppet läge, och att ett kapitel med en satt avvikelse öppnas
automatiskt efter omladdning.

**Ändringslogg v0.90 → v0.91:** Läsarålder som färdiga nivåer +
innehållsflaggning i Korrekturläsningen, efter författarens önskemål
om att ålder ska väljas ur fasta grupper (som PEGI/åldersklassning för
dataspel) istället för ett fritt nummer, och att korrekturläsningen
ska flagga svordomar, våld och explicit innehåll när boken är för barn.

- **Läsarväljaren är nu en lista, inte ett sifferfält** — både på
  manusnivå (Settings) och per kapitel. De sex nivåerna (Pekbok,
  Lättläst, Kapitelbok, Mellanålder, Ungdom, Vuxen) fanns redan som
  begrepp i koden (`READER_CATEGORIES`), de styrde bara aldrig själva
  input-fältet. Ny `READER_TIER_AGE`-tabell ger varje nivå en
  representativ ålder som matas in i den befintliga läsbarhetsmotorn
  (`readerTuning`) helt oförändrad — ingen ny logik för hur texten
  anpassas, bara hur ålder väljs. Ett test säkrar att varje nivås ålder
  alltid mappar tillbaka till exakt den nivån, så de två inte kan glida
  isär.
- Kapitelnivåns väljare har nu "Samma som manuset" som eget alternativ
  högst upp (visar vilken nivå det faktiskt blir, t.ex. "Samma som
  manuset — Mellanålder (10–12 år)") istället för ett tomt fält vars
  betydelse man var tvungen att gissa sig till.
- Ny förklaringstext under väljaren, synlig så fort nivån inte är
  Vuxen: att kortare meningar och enklare ord används, och att
  Korrekturläsningen också flaggar svordomar, våld och explicit
  innehåll som inte passar åldern. Svar på författarens fråga om en
  sådan förklaring borde finnas.
- **Korrekturläsningens ålderssteg flaggar nu innehåll, inte bara
  läsbarhet.** Samma AI-anrop som redan körs (inget nytt API-steg):
  när läsaren är under 18 uppmanas modellen att aktivt läsa efter
  svordomar, grafiskt våld och sexuellt/explicit innehåll som inte
  passar åldern — även om det annars tjänar historien. Ålderslämplig
  fara, rädsla eller sorg räknas inte som en flagga, bara sånt en
  förälder eller bibliotekarie skulle reagera på för just den åldern.
  Sådana träffar märks `"category":"content"` och visas med en egen
  röd "Innehållsvarning"-etikett i resultatlistan, skilt från vanliga
  hantverksnoteringar.
- Bekräftat att textens svårighetsgrad redan styrs av en egen
  läsbarhetsmotor (`readerTuning` — meningslängd, andel ovanliga ord,
  stavelser), kopplad sedan tidigare till statistikpanelen, redigeraren
  och korrekturläsningen. Inget nytt behövde byggas där, bara att rätt
  ålder nu matas in via de fasta nivåerna.

Nytt test för `READER_TIER_AGE`-invarianten och för att
`parseAgeResult` läser `category` rätt. 567/567 gröna. Verifierat i
webbläsaren: båda väljarna (manus och kapitel), förklaringstexten och
att layouten får plats utan att klippas vid 1300px bredd.

**Ändringslogg v0.89 → v0.90:** Författaren pekade på ett konkret
exempel från en skärmdump: "Oldest drop first. Typing is not kept."
under versionshistorik-inställningen — kort, kommaseparerad
telegramtext, inte en mening en UI-designer skulle skriva. Skrev om
hjälptexten i alla tre språk till hela, naturliga meningar som
förklarar både att äldsta versionen försvinner när gränsen nås och
att egen handskriven text inte räknas som en version (bara Skriv
utkast, Omskriv, Förläng, Utveckla och Skriv om gör det).

Ingen kod ändrad, bara text. 565/565 gröna oförändrat.

**Ändringslogg v0.88 → v0.89:** Författaren satte en stående regel:
all text som visas för användaren måste vara tydlig och enkel — hellre
en mening för mycket än text man måste fundera över. Bad om en
genomgång av det senast byggda (LM Studio-motorn, Tidsmedveten Story
Bible, Guiden, Korrekturläsningens tålamods-text) i alla tre språk.

Hittade konkreta exempel på precis den risken, mest i motor-inställningen
— den mest tekniska hörnan av det som byggts nyligen:

- **"OpenAI-kompatibel server"** i serveradress-hjälptexten — ett
  begrepp en författare inte har anledning att känna till (kan
  dessutom felaktigt låta som att det krävs ett OpenAI-konto). Bytt
  till bara "en annan lokal server, t.ex. llama.cpp".
- **"CORS"** i felmeddelandet för en avvisad anslutning — rent
  webbutvecklarjargong. Omskrivet så vanligt språk kommer först
  ("en inställning för vilka webbadresser som får ansluta"), med de
  tekniska orden kvar inom parentes bara som sökhjälp om man behöver
  fråga om det någon annanstans.
- **"Molnnycklar"** i motor-inställningens hjälptext — syftar på
  API-nycklar, inte uppenbart för någon som inte kodar. Bytt till
  "molntjänster eller konton".
- **"Som den var"** som etikett för Tidsmedvetna Story Bible-väljaren
  — grammatiskt en ofullständig fras i sammanhanget. Bytt till en
  komplett mening: "Visa Story Bible som den var vid: Nuläget".
- Snabbstartens första steg ("hämta en modell") gav ingen konkret
  bild av vad man letar efter. Lade till exempel-modellnamn (llama3,
  mistral) och ett förtydligande att Ollama själv visar ett bibliotek
  att välja från.

Ingen kod ändrad, bara text — och bara i de tre redan existerande
språkfilerna. Inga nya tester (rent copy). 565/565 gröna oförändrat.
Verifierat i webbläsaren: skärmdumpar av både den uppdaterade
motor-hjälptexten och felbannern bekräftade att den nya texten får
plats och läses tydligt i sitt sammanhang.

**Ändringslogg v0.87 → v0.88:** Följd av författarens rapport om att
Korrekturläsningen såg ut att fastna på 0%. Genomgång av koden hittade
ingen bugg — men avslöjade en verklig svaghet i återkopplingen: under
tiden ETT kapitel bearbetas (vilket på begränsad hårdvara, t.ex. ett
8GB VRAM-kort, legitimt kan ta flera minuter) ändrades ingenting alls
synligt förutom en statisk "Now: reading chapter 1…"-rad, med noll
visuell signal om att appen fortfarande jobbar.

Två tillägg till `ProofreadCard.tsx`, ingen ändring av själva
körlogiken: en liten pulserande tre-punkts-animation bredvid
"Now:"-raden (ren CSS, `prefers-reduced-motion`-medveten), synlig hela
tiden under körning — och en ny rad, "Still working — a single chapter
can take a few minutes on slower hardware. Nothing is stuck.", som
dyker upp om samma steg-detalj stått oförändrad i 20 sekunder (en
`setTimeout` som nollställs varje gång `detail` faktiskt ändras).
Stänger loopen från supportfrågan permanent, istället för att bara
svara en gång i chatten.

Inga nya tester (rent presentations- och timing-lager, ingen ny
kärnlogik). 565/565 gröna oförändrat. Verifierat i webbläsaren: mockad
25 sekunders fördröjning på AI-anropet, bekräftade pulsanimationen
syns direkt och att tålamods-raden dyker upp efter 20 sekunder, inte
tidigare.

**Ändringslogg v0.86 → v0.87:** Roadmap-punkt 16, Tidsmedveten Story
Bible — visa en entitets tillstånd som det var vid en viss läsposition
i manuset, inte bara den senaste låsta versionen. Novelcrafter-
jämförelsens starkaste idé (§ konkurrensjämförelsen ovan), vald att
byggas nu, före Setup/payoff (punkt 12), eftersom alla byggstenar
redan fanns — det som saknades var att koppla ihop dem i ett UI.

Ny "Som den var"-väljare högst upp i Story Bible: "Nu" eller ett
valfritt kapitel. Väljer man ett kapitel byts hela rosterlistan till
ett skrivskyddat ögonblick av boken vid den läspositionen — tydlig
banner, "Tillbaka till nuläget"-knapp, redigeringsknappar (Ny, Review,
Export) dolda eftersom de inte är meningsfulla mot ett historiskt
ögonblick. Klick på en person/plats öppnar ett nytt, minimalt kort
(inte det vanliga redigeringskortet) med bara det som var sant då.

Teknisk kärna: `factsAsOfSequence()` (`bibleHistory.ts`) återanvänder
samma fakta-kedjelogik som redan byggde History-vyn (`chainsWithHistory`/
`factHistoryForEntity`, punkt 2) — en kedja per entitet+predikat, plockar
den senaste posten vars `sequence_index` inte överskrider vald position.
En kedja utan något etablerat än utesluts helt. `groupBibleEntities()`
skrevs om till ett tunt skal ovanpå en ny `groupFacts()` som tar emot
en redan vald fakta-lista — samma klassificerings-/grupperingslogik
återanvänd för både det vanliga och det tidsmedvetna läget, det vanliga
läget rör sig inte en millimeter (samma tester, oförändrat resultat).

Byggd på läsordning (`sequence_index`), inte story-tid-ordningen
(punkt 9) — "vad visste jag vid kapitel 5" är en läsordningsfråga.
Story-tid-baserad visning sparas som en möjlig framtida variant.

9 nya tester (`bibleHistory.test.ts`: `bookFactChains`, `factsAsOfSequence`).
565/565 gröna totalt. Verifierat i webbläsaren: skapade en person i
kapitel 1 ("journalist"), lät den ersättas i kapitel 3 ("redaktör"),
bekräftade att "Som den var: Kapitel 1" visar det gamla värdet, "Kapitel
3" och "Nu" visar det nya, och att växlingen mellan lägena fungerar rent.

**Ändringslogg v0.85 → v0.86:** Andra delen av förberedelsen för
externa testare: en integrerad guide med snabbstart. Författaren
misstänkte, rimligt nog, att andra författare som testar appen inte
är de mest tekniska — och appen kräver faktiskt ett tekniskt steg
(en lokal modellserver) innan den gör något alls.

Ny sida i navigeringen, "Guide" (`GuidePanel.tsx`), byggd som ren text
utan AI, i tre delar: en fyrastegs snabbstart (installera Ollama eller
LM Studio, peka appen mot den, starta ett manus, börja skriva), en
förklaring av appens elva huvuddelar, och tre felsökningsfrågor.

`GuidePanel` byggdes medvetet fristående från bokdata (tar bara ett
valfritt `scrollTo`-ankare), så samma komponent funkar både som en
sida i manus-navigeringen OCH som en overlay på hemskärmen innan ett
manus ens finns — hemskärmen fick en "New here? Read the
quickstart"-länk som öppnar den. Ett nytt, tomt manus (inga kapitel,
inget synopsis, inga brainstorm-anteckningar) öppnas nu direkt på
Guide istället för Inställningar (`openingSurface()`) — en ny
författare har inget att ställa in än, men allt att lära sig.

Den globala felbannern ("Ingen lokal modell hittades" m.fl.) fick en
direktlänk till exakt rätt paragraf i Felsökning-avsnittet, med
automatisk skroll dit — `GuidePanel` exporterar stabila,
språkoberoende ankare (`GUIDE_SECTION_IDS`, `GUIDE_FAQ_IDS`) som
andra delar av appen kan peka på, redo för nästa steg: små
"?"-genvägar vid andra panelers rubriker (författarens idé, sparad
som roadmap-punkt 22, inte byggd än).

561/561 gröna (samma antal — `openingSurface`s testfall bytte bara
förväntat värde). Verifierat i webbläsaren: guiden öppnas korrekt från
både hemskärmen och manus-navigeringen på alla tre språk, ett nytt
manus landar på Guide, och felbannerns länk hoppar till och skrollar
fram rätt paragraf.

**Ändringslogg v0.84 → v0.85:** Författaren har fått externa testare
och bad om en genomgång av gränssnittet med det i åtanke. Gick igenom
alla placeholder-texter, hjälptexter och exempel i samtliga tre
språkfiler (`en.ts`, `sv.ts`, `nb.ts`) efter innehåll som antar svensk
kontext eller är otydligt för någon som inte känt appen från start.

Hittade en konkret bugg: fältet "Prose language" i Inställningar
visade "Swedish" som exempeltext i den ENGELSKA gränssnittsversionen
(ett kvarglömt spår från när appen bara fanns på svenska) — och även
i de andra språken visade fältet det egna gränssnittsspråkets namn som
exempel, vilket är en felaktig utgångspunkt i sig (en författare som
kör appen på svenska skriver inte nödvändigtvis sin bok på svenska).
Bytt i alla tre språk till ett neutralt "t.ex. engelska"-mönster,
frikopplat från gränssnittsspråket.

Övriga formulärtexter höll redan god kvalitet — skrivna med appens
etablerade, förklarande ton (se t.ex. `proseLanguageTitle`s hjälptext,
som redan säger att tomt fält gissar automatiskt). Inget annat
Sverige-specifikt hittades i en full genomsökning av placeholder-fält.

561/561 gröna. Verifierat i webbläsaren.

**Ändringslogg v0.83 → v0.84:** LM Studio (och andra OpenAI-kompatibla
lokala servrar, t.ex. llama.cpp-server) går nu faktiskt att välja.
`OpenAICompatibleLocalProvider` har funnits färdigbyggd och testad
sen v0.72 (punkt 4), men `BookStore.tsx` skapade alltid en
`OllamaModelProvider` rakt av på alla 16 ställen som pratar med
modellen — abstraktionen fanns, men ingen väg dit i gränssnittet.
Författare som bett om stöd för andra motorer fick alltså nej trots
att koden redan klarade det.

**Vad som byggdes:** en "Motor"-väljare längst upp i
Inställningar → Modeller: Ollama (som förut) eller "LM Studio / annan
lokal server". Väljer man det senare dyker ett serveradress-fält upp
(förifyllt med LM Studios eget standardvärde `http://localhost:1234`,
fritt att ändra för llama.cpp-server eller annan port). Alla 16
anropsställena går nu genom en enda `makeProvider()`-funktion som
läser motorval + serveradress ur en ref (samma mönster som
`writingPrimerRef`/`historyLimitRef` redan använder för att slippa
tråckla state genom varje `useCallback`s beroendelista). Provider-
klasserna i `src/llm/provider.ts` är helt oförändrade — bara
anropsstället fick en väg att faktiskt nå den redan byggda adaptern.

Modellistan (Skriv- och Review-väljarna) hämtas nu från vald motors
egen endpoint (`/api/tags` för Ollama, `/v1/models` för det
OpenAI-kompatibla spåret) och laddas om automatiskt så fort motor
eller serveradress ändras — ingen kvarhängande lista från förra
motorn om anslutningen till den nya misslyckas. Felmeddelandena för
"ingen modell hittades" och CORS-problem skrevs om från Ollama-
specifika till generella, eftersom de nu gäller båda motorerna.
Motor och serveradress sparas i `localStorage` precis som modellvalen
redan gjorde — en maskininställning, inte manusinnehåll, så den följer
inte med i bokfilen.

Inga nya provider-tester behövdes (`OpenAICompatibleLocalProvider` var
redan täckt av 16 tester sen v0.72). Verifierat i webbläsaren: bytte
motor, serveradressen förifylldes, `/v1/models` anropades och
modellistorna bytte till de nya namnen, körde Draft och bekräftade att
anropet gick till `/v1/chat/completions` — inte `/api/chat` — och att
valet överlevde en omladdning av sidan.

**Ändringslogg v0.82 → v0.83:** Täppte luckan som v0.82 lämnade öppen:
fakta-extraktion (både den manuella "Extract facts"-knappen och
Korrekturläsningens faktasteg) läste tidigare hela kapitlets prosa i
ett enda anrop och stämplade varje föreslaget fakta med den FÖRSTA
scenens id — fel så fort ett kapitel faktiskt har flera scener (en
fakta etablerad i scen 3 blev felaktigt märkt som scen 1).

Båda ställena kör nu extraktionen en gång per scen istället för en
gång per kapitel — en loop över `chapterScenes(chapter)`, samma mönster
som Draft/Recast/Analyze redan fick i v0.82. `applyExtractorDrafts()`
tog redan en `scene_id`-parameter (byggd i v0.74) så själva
skrivbacken behövde ingen ändring, bara anropsstället. Ett kapitel utan
delningar — fortfarande den överväldigande majoriteten — beter sig
exakt som innan; loopen kör bara ett varv.

Korrekturläsningens faktasteg behöll medvetet EN sammanfattande flagga
per kapitel (inte en per scen), så ett kraftigt uppdelat kapitel inte
svämmar över med flaggor — bara hur många fakta som hittades ändras,
räknat över kapitlets alla scener.

2 nya tester (`runFacts` i `proofread.test.ts` för multi-scen-fallet).
561/561 gröna totalt. Verifierat i webbläsaren: delade ett kapitel i
två scener med olika namngivna personer i var sin scen, körde Extract
facts, bekräftade två separata AI-anrop (ett per scen, med rätt
scen-riktad prompt) och att båda personernas fakta hamnade rätt i
Story Bible-granskningskön.

**Ändringslogg v0.81 → v0.82:** Sista delen av roadmap-punkt 7:
Draft, Recast och Analyze blir scen-medvetna. Extract facts stämplade
redan `scene_id` (v0.74); nu när riktig scen-uppdelning finns (v0.81)
kunde de tre skrivfunktionerna byggas ut till att fungera på en
enskild scen.

Varje scenkort i "Scener"-panelen (synligt bara när kapitlet är delat
i fler än en scen) fick tre knappar: Skriv utkast, Omskriv och
Analysera — alla riktade mot bara den scenens text, inte hela
kapitlet. Draft för en scen får dessutom kontext om föregående/nästa
scens kant (sista raderna respektive första raderna), så den nya
texten varken upprepar eller motsäger sina grannar.

Den avgörande tekniska biten: en scen äger ingen egen text, bara en
delningspunkt i `chapter.prose` (v0.81-beslutet). Ny funktion
`replaceSceneProse()` i `bookScene.ts` löser skrivbacken generellt —
ersätter en scens del av kapitlets stycken och flyttar alla senare
sceners delningspunkter med exakt det antal stycken skillnaden blev,
oavsett om scenen växer eller krymper. Draft och Recast strömmar
live precis som kapitel-varianterna, spliced mot scenens eget
stycke-intervall på varje textbit. Analyze skickar bara scenens prosa
och räknar om `paragraphIndex` från scen-relativ till kapitel-absolut
innan resultatet visas — Chapter notes-vyn behövde ingen ändring alls.

Känd öppen lucka, inte löst nu: `extractFactsFromProse` (manuell
Extract facts-knapp, Korrekturläsningens faktasteg) arbetar
fortfarande över hela kapitlets prosa och stämplar `scene_id` från
den första scenen — en fakta som etableras i scen 3 av ett delat
kapitel stämplas idag felaktigt som scen 1. Ingen regression (samma
beteende som innan v0.81, bara mer synlig nu när riktiga
flerscenskapitel kan finnas), men värd en egen uppföljning.

24 nya tester (`bookScene.ts`s `replaceSceneProse`, samt prompt-
byggarna `draftSceneUserPrompt`/`recastSceneUserPrompt`/
`analyzeSceneUserPrompt`). 560/560 gröna totalt. Verifierat i
webbläsaren: delade ett kapitel i två scener, körde Draft på scen 1
(texten hamnade rätt, scen 2 orörd), Recast på scen 2 (bytte bara den
scenens text, scen 1:s nya text orörd), och Analyze på scen 1 (hittade
bara ett påstått fel i den scenens egen text).

**Ändringslogg v0.80 → v0.81:** ChatGPT granskade `roadmap-ideas.md` och
pekade på en verklig lucka: statustabellens "Scene-migrering ✅ byggd"
(punkt 5) gav intrycket att scenindelning fanns, men `chapter.scenes`
skrevs faktiskt aldrig till någonstans — `chapterScenes()` härledde
alltid exakt en scen från hela kapitlets `prose`. Löste det öppna
designspåret ("Det enda stora arkitekturbeslutet" i roadmapen) och
byggde den minsta skrivbara scen-ytan ovanpå beslutet.

**Beslutet:** en Scene äger bara en delningspunkt plus metadata, aldrig
egen prosa. `bookScene.ts` fick om `chapter.scenes[]` till
`{ id, startParagraph, title?, brief? }` — `startParagraph` är ett
styckeindex i `chapter.prose` (via `splitFlowParagraphs`, samma
styckedelning `ProseCanvas` redan visar). Varje scens prosa härleds
genom att dela `chapter.prose` vid de lagrade styckena, aldrig lagrad
separat — samma "alltid färsk, aldrig en stale snapshot"-princip
`chapterScenes()` redan hade. `location_ref`, `entity_refs[]` och ett
scen-eget `story_time` byggdes medvetet INTE nu — de väntar på en
verklig konsument. `NarrativeFact` förblir det enda kanon-lagret.

**UI:** ny kollapsad "Scener"-panel (`ScenesPanel.tsx`) mellan
kapitlets kort-fält och prosan — öppen automatiskt så fort fler än en
scen finns. Varje scenkort visar ett förhandsvisat textutdrag, ett
titel-fält, ett brief-fält, en "Dela i två…"-lista av kapitlets stycken
att dela vid, och (utom på sista scenen) "Slå ihop med nästa". Rör
aldrig `ProseCanvas` eller kapitlets enda textfält — bara ett nytt
härlett index ovanpå samma `prose`-sträng.

`chapterScenes()`s befintliga konsumenter (Ask Manuscript, Korrekturläsningens
faktasteg, extraktionens `scene_id`-stämpling) märker inte av
förändringen: utan delningar beter sig allt exakt som innan, bara med
ett nytt `startParagraph: 0`-fält i den härledda scenen.

17 nya/uppdaterade tester (`book-scene.test.ts` skrevs om helt för den
nya formen: split/merge/rename/clamp-fall). Verifierat i webbläsaren:
delade ett kapitel i två scener, namngav den första, skrev en brief,
laddade om sidan och bekräftade att titel/brief/delning överlevde,
slog ihop scenerna igen och bekräftade att titeln följde med, och att
själva kapitel-prosan aldrig rördes genom hela flödet.

**Ändringslogg v0.79 → v0.80:** Två utökningar av Korrekturläsningen,
efter en fråga om Novelcrafter-jämförelsen ledde in på om
"kontrollera fakta mot hela boken" redan fanns där (nej) och om
Korrekturläsningens befintliga motor (helboks-genomgång, paus/
återuppta, förloppsindikator, "kolla bara det som ändrats") var rätt
grund att bygga det på (ja).

**Femte steget: Faktakontroll.** Nytt steg "facts" i
`PROOFREAD_STAGES`, sist i kedjan (grammatik → upprepade scener →
stil → ålder → fakta). Bygger INGEN ny AI-prompt — återanvänder hela
den befintliga Extract facts-pipelinen (`EXTRACTOR_SYSTEM`,
`extractorUserPrompt`, `parseExtractorPayload`, `applyExtractorDrafts`
från `ConsistencyGate`) per levande kapitel, i lässordning. Nya
förslag och sammanslagningsförslag hamnar i exakt samma Story
Bible-granskningskö som en manuell "Extract facts"-klick redan
skapar — ingen ny granskningsyta byggd. Korrekturläsningens resultat
visar bara en pekare per kapitel ("N nya fakta föreslagna — se Story
Bible → Review"), klickbar för att hoppa till kapitlet.

Ny `ProofreadIO.saveFacts()`-kanal (vid sidan av den befintliga
jobb-`save()`) så att fakta som extraherats tidigt i passet är
synliga för `ConsistencyGate` när senare kapitel körs — annars hade
sammanslagningsförslag och konflikter inte kunnat upptäckas mellan
kapitel inom samma körning. Två befintliga stegvakter (`runScenes`,
`runStyle`) hade en förbisedd hårdkodad lista över senare steg som
inte kände igen "facts" — fixat så återupptagning mitt i faktasteget
inte av misstag kör om tidigare steg.

**Stil-steget kollar nu även känsla, inte bara register.** Författaren
påpekade att stil-jämförelsen mellan kapitel borde omfatta känsla/
stämning, inte bara diktion/meningsbyggnad mot den deklarerade
Voice-texten. Ingen ny arkitektur behövdes — steget skickar redan alla
kapitel till modellen i ett enda anrop, så den kan redan bedöma
stämningsskiften mellan grannkapitel. Bara `STYLE_SYSTEM`-prompten
utökad med en andra flaggbar dimension (stämning som rycker till utan
att berättelsen själv motiverar det), plus motsvarande gränssnittstext
("Style and mood across chapters").

12 nya/uppdaterade tester (`proofread.test.ts`): faktaextraktion per
kapitel, sammanslagningsförslag för en nästan-dubblett mot en låst
fakta (samma `isPossibleEnrichment()`-logik som punkt 6b), tyst
utebliven flagga när inget nytt tillförs, tolerans för ett
oparserbart AI-svar, och att återupptagning hoppar över redan klara
kapitel. Verifierat i webbläsaren: körde hela Korrekturläsningen med
mockad Ollama, bekräftade Faktakontroll-sektionen, klick som hoppade
till rätt kapitel, och att det föreslagna faktumet landade korrekt
i Story Bible-granskningskön.

**Ändringslogg v0.78 → v0.79:** Elfte punkten från `roadmap-ideas.md`
byggd: **Plotlines / scen-matris**. Uttryckligen INTE en nodgraf som
Sandbox-sidans Storyboard (scenkopplingar, story-flaggor för
spelbara förgreningar) — ett medvetet vägval efter en snabb
diskussion, eftersom de löser olika problem: Sandbox-noderna är för
spelbara scenövergångar i ett RPG, det här är bara en tabell för att
se vilka trådar som rör sig genom vilka kapitel.

Ny `Plotline`-typ (`{id, title, color}`, `src/core/BookSchema.ts`) på
`book.plotlines[]`, och `Chapter.plotline_ids?: string[]` — precis
som `story_time` (punkt 9) medvetet på kapitel-nivå i v1, inte på
scenen, eftersom ett kapitel fortfarande är en enda scen.

`src/core/plotlines.ts`: `addPlotline()`/`renamePlotline()`/
`removePlotline()` (tar bort tråden ur varje kapitel som bar den)/
`toggleChapterPlotline()`, plus `plotlineMatrixRows()` som bygger
matrisens rader (ett per levande kapitel, i lässordning). Nya trådar
cyklar genom samma femfärgspalett som brainstorm-lapparna redan
använder (`NOTE_COLORS`), så varje kolumn syns tydligt isär.

Ny sida "Plotlines" i sidonavigeringen: en riktig HTML-tabell,
kapitel som rader (klickbara, hoppar till kapitlet), trådar som
färgkodade kolumner med redigerbar rubrik och en borttagningsknapp,
och en rund kryssruta-liknande cell i varje skärningspunkt som fylls
med trådens färg när den är aktiv. Ett formulär under tabellen för
att lägga till nya trådar.

9 nya tester i `plotlines.test.ts`. Verifierat i webbläsaren: skapade
två trådar, bockade av två olika kapitel mot olika trådar, döpte om
en tråd, hoppade till ett kapitel via radrubriken, bekräftade att
allt överlevde en omladdning, och tog sedan bort en tråd och
bekräftade att den försvann ur matrisen utan att röra den andra.

**Ändringslogg v0.77 → v0.78:** Tionde punkten från `roadmap-ideas.md`
byggd, första skivan: **Continuity 2.0 — kunskapsläckor**. Punkt 10
täcker tre olika saker (spatial kontinuitet, objekttillstånd,
kunskapstillstånd); bara den sista är byggbar utan antingen en
författar-underhållen platskarta eller ett AI-anrop, så den kom
först. Spatial kontinuitet och full objekttillståndsspårning kräver
strukturerad platsdata författaren inte skriver in idag — kvar i kön.

Ny ren funktion `knowledgeLeaksForChapter()` (`src/core/continuity.ts`,
inget AI-anrop): för ett kapitel, hitta varje låst fakta modellen kan
se som etablerades i ett levande kapitel SENARE i lässordningen —
möjligt eftersom fakta redan bär `chapter_id` (och `sequence_index`
på både fakta och kapitel). Fakta utan `chapter_id` (allmän
worldbuilding), gömda fakta, och fakta i borttagna kapitel flaggas
aldrig — inget att jämföra mot.

Ny `ContinuityWarning`-komponent i kapitelredigeraren (samma `aside`-
plats som kapitelbilden): en ihopfälld rad "N fakta från senare i
berättelsen" i varningsfärg, som vid klick expanderar till en lista
med varje fakta och en "Etablerad i "..."-länk som hoppar dit — samma
klick-och-hoppa-mönster som Mentions/Ask Manuscript/Timeline redan
använder. Medvetet informativ, inte blockerande: en tidig-kapitel-
läcka kan vara helt avsiktlig (ett hopp framåt i tiden), så texten
säger uttryckligen "inte nödvändigtvis ett problem".

10 nya tester i `continuity.test.ts`. Verifierat i webbläsaren: låste
en fakta ("Henrik: Secretly the killer") medan kapitel 2 var aktivt,
bekräftade att kapitel 2 självt inte visar någon varning, att kapitel
1 (tidigare i lässordningen) korrekt visar och expanderar varningen,
och att klick på "Established in" hoppar till rätt kapitel.

**Ändringslogg v0.76 → v0.77:** **Sammanslagningsförslag för snarlika
fakta** (`roadmap-ideas.md` punkt 6b, utanför ursprungssamtalet).
Löser en konkret irritation: extraktorn skapade tidigare en egen
flaggad konflikt varje gång ett kapitel omnämnde samma fakta lite mer
detaljerat än förut ("Jeff is a captain" → "Jeff is a captain on a
space ship"), trots att det inte är en motsägelse.

Ny deterministisk funktion `isPossibleEnrichment()`
(`src/core/ConsistencyGate.ts`, inget AI-anrop): två värden under
samma entitet+predikat räknas som samma påstående, bara mer
detaljerat, om det ena värdet innehåller det andra som delsträng,
eller om de flesta av det kortare värdets meningsbärande ord (efter
att stoppord som "a/the/on/in" filtrerats bort) också finns i det
längre. `evaluateCandidate()` skiljer nu på tre lägen istället för
två när ett extraherat värde skiljer sig från en låst fakta: om det
nya värdet inte tillför något (redan täckt av det befintliga) hoppas
det helt över — inget att granska; om det är en tydlig nästan-dubblett
föreslås en sammanslagning; annars flaggas en riktig konflikt precis
som förut. Genuint divergerande detaljer ("en rymdskeppskapten" vs
"kaptenen på Odyssey") känns korrekt igen som en riktig konflikt, inte
en sammanslagning — den skillnaden kräver fortfarande ett
författarbeslut.

Nytt `.optional()`-fält `NarrativeFact.is_merge_suggestion` (samma
additiva mönster som `hidden_from_ai`). Granskningskön i Story Bible
(`BiblePanel.tsx`) visar en sammanslagningsrad annorlunda än en
konflikt: lugn grön ram istället för larmfärgad, "Similar to: …,
looks like the same fact, more detailed" istället för "Conflicts
with…", och en "Merge"-knapp istället för "Lock" — texten är redan
förifylld med det föreslagna sammanslagna värdet, redigerbar innan
låsning precis som idag. "Review"-knappens larmfärgade läge triggas
nu bara av riktiga konflikter, inte rena sammanslagningsförslag.
Godkännande återanvänder exakt samma `approveFact()`-mekanik som
konflikter redan har (ersätter den gamla fakta, låser den nya) — ingen
ny kod behövdes där.

16 nya tester (11 i `consistency-gate.test.ts`, 2 i
`narrative-fact.test.ts` för schema-rundturen). Verifierat i
webbläsaren: skapade en låst fakta "Jeff: A captain", körde Extract
facts med en mockad modell som föreslog "A captain on a space ship" —
granskningsraden visade rätt grön styling, rätt förifylld text, rätt
"Similar to"-notering, och klick på "Merge" låste den sammanslagna
fakta korrekt utan att någon konflikt-UI visades.

**Ändringslogg v0.75 → v0.76:** Nionde punkten från `roadmap-ideas.md`
byggd: **Story time + Timeline**. Löser den öppna specfrågan i §11
("`sequence_index` är kapitelordning i boken, inte RPG:ts story-clock")
genom att göra skillnaden synlig och redigerbar för författaren, i en
ny sida "Timeline" i sidonavigeringen.

Två nya fält på `Chapter` (`src/core/BookSchema.ts`): `story_time`
(fri text, en skrivnotering som "Tre år tidigare") och
`story_time_order` (sorteringsnyckel, saknas = faller tillbaka på
`sequence_index` så en oredigerad bok har en tidslinje som exakt
matchar manusordningen). Medvetet kapitel-nivå i v1, inte
scen-nivå — eftersom ett kapitel fortfarande bara är en enda scen
(punkt 5), skulle ett scen-nivå-fält bara duplicera samma data och
riskera att bli inaktuellt mot `prose`-redigeringar, samma
resonemang som styrde `chapterScenes()`-designen. Flyttas till scenen
själv den dagen riktig scen-uppdelning finns.

Ny ren logik i `src/core/timeline.ts`: `timelineEntries()` sorterar
levande kapitel efter `story_time_order` och flaggar varje kapitel
vars position där skiljer sig från dess läsordning (`outOfOrder`) —
en tydlig signal om en flashback/framåtblick. `moveStoryTimeOrder()`
byter plats på ett kapitel med sin granne och skriver om hela
tidslinjens `story_time_order` till en ren 0..N-1-rangordning — den
enda platsen det fältet någonsin skrivs.

Timeline-sidan visar varje levande kapitel: titel (klickbar,
hoppar till kapitlet — samma mönster som Mentions och Ask Manuscript),
ursprunglig manusposition, en redigerbar textruta för `story_time`,
upp/ner-knappar för att flytta det på tidslinjen, och en orange
"OUT OF READING ORDER"-flagga när ordningen skiljer sig.

7 nya tester i `timeline.test.ts`. Verifierat i webbläsaren: skapade
tre kapitel, gav ett en tidsnotering och flyttade det till toppen av
tidslinjen — flaggan visades korrekt på båda påverkade raderna,
manuspositionen förblev oförändrad, klick hoppade till rätt kapitel,
och både ordningen och tidsnoteringen överlevde en omladdning av
sidan.

**Ändringslogg v0.74 → v0.75:** Åttonde punkten från `roadmap-ideas.md`
byggd: **Lokalt semantiskt index + Ask Manuscript v1** — första
funktionen med tydligt synligt värde sedan Mentions. Ny sida "Ask
Manuscript" i sidonavigeringen (bredvid Settings/Brainstorm/Synopsis):
författaren ställer en fråga om sin egen berättelse, och svaret bygger
uteslutande på det som faktiskt är skrivet.

Retrieval (`src/core/askManuscript.ts`, ren logik, inga AI-anrop):
varje kapitels enda scen (roadmap-punkt 5) blir en sökbar källa.
Primärväg är embedding-baserad kosinuslikhet mellan frågan och varje
kapitel, via `embed()` från model-provider-abstraktionen (punkt 4).
Om embeddings misslyckas — t.ex. för att den laddade modellen inte har
embeddingstöd — faller appen automatiskt och tyst tillbaka på en
deterministisk nyckelordsöverlappning, så funktionen aldrig kräver att
författaren ställer in en separat embeddingsmodell för att fungera.

De bästa träffarna (standard: 4) skickas som citat till modellen med
en systemprompt som uttryckligen förbjuder påhitt utanför citaten och
kräver att den säger ifrån när svaret inte finns i manuset. Käll-listan
under svaret byggs alltid deterministiskt av vår egen sökkod — aldrig
av vad modellen själv råkar nämna — så den är alltid korrekt. Varje
källa visar kapitelnamn, ett citat, och en klickbar länk (återanvänder
samma "hoppa till kapitel"-mönster som Mentions v1) som hoppar rakt dit
i manusredigeraren.

`Chapter.scenes[]` (punkt 5) och `chapterScenes()` återanvänds
oförändrade som källgranularitet — ingen ombyggnad krävdes. Ny
AI Context Inspector-operation "Ask Manuscript". 10 nya tester i
`ask-manuscript.test.ts` (kosinuslikhet, gräns-fall, topK, uteslutning
av nollträffar, nyckelordsfallback, promptformat). Verifierat i
webbläsaren med mockad Ollama i två körningar: (1) embeddings fungerar
— rätt kapitel rankas överst, svar och källor renderas, klick hoppar
till rätt kapitel; (2) embeddings misslyckas (500) — nyckelordsfallback
tar över tyst, författaren märker ingen skillnad förutom att svaret
fortfarande kommer fram.

**Ändringslogg v0.73 → v0.74:** Sjätte och sjunde punkten från
`roadmap-ideas.md` byggda tillsammans, eftersom de i praktiken är
samma tråd: **fakta får scenproveniens**, och **extraktions-pipelinen
blir scen-medveten**.

`NarrativeFact.scene_id` är ett nytt `.optional()`-fält, exakt samma
additiva "missing on older saves"-mönster som `chapter_id` redan har.
Trådat genom hela `ConsistencyGate.ts` där `chapter_id` redan går:
`factFromDraft()`, `applyAuthorDraft()`, `applyExtractorDrafts()` tar
nu en valfri `scene_id`; `approveFact()` för en godkänd flaggad
konflikt och `reviseFact()` för en omskriven låst fakta bär båda vidare
den ursprungliga `scene_id`:n till den nya raden, precis som de redan
gör för `chapter_id`.

I `BookStore.tsx` skickar både **Extract facts**-knappen och den
manuella "lägg till fakta"-vägen från Story Bible nu med
`chapterScenes(chapter)[0]?.id` som `scene_id` — den enda scen ett
kapitel har i den här "tråkiga" fasen (punkt 5). Med det kan appen
utan något AI-anrop redan svara "i vilken scen etablerades det här?".

**Medvetet avgränsat:** Draft, Recast och Analyze rör inte vid
`scene_id` i det här steget, eftersom de inte skapar fakta — och
eftersom ett kapitel bara har en (hela kapitlet) scen finns det ännu
inget att rikta en prompt mot som skulle skilja sig från dagens
kapitel-omfång. Att låta de prompterna själva bli scen-medvetna får
vänta tills riktig scen-uppdelning finns att rikta dem mot — annars
byggs kod för ett läge som inte existerar än.

10 nya tester (5 i `consistency-gate.test.ts` under "scene
provenance", 1 i `narrative-fact.test.ts` för schema-rundturen).
Ingen ny UI-yta — `scene_id` visas inte någonstans än, så ingen
webbläsarverifiering: täckt av testsviten (484/484 gröna, ren
typecheck).

**Ändringslogg v0.72 → v0.73:** Femte punkten från `roadmap-ideas.md`
byggd: **Scene-migrering, "tråkig" v1** — helt osynlig för författaren,
ingen big bang. Nytt `BookScene`-schema (`src/core/bookScene.ts`),
medvetet minimalt (bara `id`, `sequence_index`, `prose` — fältytan
växer stegvis i senare roadmap-punkter, inte allt på en gång).
`Chapter.scenes` är ett nytt `.optional()`-fält på `ChapterSchema`,
samma "missing on older saves"-mönster som `continues_from`,
`discarded_at` och `startImage` redan använder.

Medvetet val: ingen eager backfill vid inläsning (till skillnad från
`ensureBrainstormNotes`). Istället en ren härledningsfunktion
`chapterScenes(chapter)`: har kapitlet redan explicita scener
returneras de som de är, annars beräknas en enda scen som omsluter
`chapter.prose` **vid varje anrop** — aldrig en lagrad ögonblicksbild
som kan bli inaktuell när prosan redigeras. `chapter.prose` förblir
den faktiska sanningskällan tills riktig scen-uppdelning finns; inget
befintligt kod läser ännu från `scenes`. Grunden är därmed på plats
för nästa steg (fakta får scenproveniens, punkt 6) utan risk att
bygga in ett tyst inaktuellt-data-fel. 4 nya tester i
`book-scene.test.ts`, plus två nya i `book-schema.test.ts` (rundtur
av explicita scener, bekräftar att äldre kapitel utan `scenes`
fortfarande laddas). Ingen UI-yta att verifiera i webbläsaren — rent
datamodells-fundament.

**Ändringslogg v0.71 → v0.72:** Fjärde punkten från `roadmap-ideas.md`
byggd: **Model-provider-abstraktion**. Nytt gränssnitt
`LocalModelProvider` (`src/llm/provider.ts`) med `chat()`,
`streamChat()`, `embed()`, `supportsEmbeddings()`, `listModels()`,
`healthCheck()` — designat med embeddings-behovet för framtida Ask
Manuscript (punkt 8) i åtanke, utan att bygga den funktionen än.

Två adaptrar: `OllamaModelProvider` — ett tunt omslag runt det
befintliga Ollama-transportlagret (`completeOllamaChat`,
`OllamaProvider.streamCompletion`, `listOllamaModels`), utan att ändra
dess request/response-format, plus ett nytt `embed()` mot Ollamas
`/api/embed`. `OpenAICompatibleLocalProvider` — andra adaptern för
LM Studio/llama.cpp-server-typ av lokala servrar via det
OpenAI-kompatibla REST-kontraktet (`/v1/chat/completions` med SSE-
streaming, `/v1/models`, `/v1/embeddings`).

**Explicit regel, inte bara konvention:** `assertLocalOnlyBaseUrl()`
stoppar konstruktion av båda adaptrarna mot kända molnvärdar (OpenAI,
Anthropic, Google, Azure, Cohere, Together, Groq, OpenRouter,
Perplexity, Mistral, Fireworks, DeepSeek) — abstraktionen kan aldrig
tyst glida in i molnstöd, i linje med §9 "Inga molnnycklar".

BookStore.tsx migrerad att faktiskt använda den nya abstraktionen:
alla fyra strömmande anropsställen (draft, recast, rewriteSpan,
askBrainstorm) byter `new OllamaProvider({model})` mot
`new OllamaModelProvider({model})`, alla sju icke-strömmande
anropsställen (word-swap, sentence-split, paragraph-break, extract,
analyze, illustrate, proofread) byter `completeOllamaChat({model, ...})`
mot `new OllamaModelProvider({model}).chat({...})` — samma
underliggande fetch-anrop, bara via det nya gränssnittet, så
abstraktionen är i skarpt bruk och inte död kod. 16 nya tester i
`tests/llm/provider.test.ts` (cloud-host-spärren, Ollama-delegering,
OpenAI-kompatibel SSE-parsning, listModels/embed/healthCheck för
båda adaptrarna). Verifierat i webbläsaren med mockad Ollama: både det
strömmande Draft-flödet och det icke-strömmande Extract-flödet
fungerade som förut genom den nya provider-koden. Tredje punkten från `roadmap-ideas.md`
byggd: **Story Bible Mentions v1**, deterministisk namn-sökning enligt
planen — ingen embedding. Ny funktion `mentionsForEntity()`
(`src/core/bibleMentions.ts`) bygger en kombinerad regex av entitetens
fulla namn plus dess enskilda namn-tokens (`nameVariantsForLabel()`,
återanvänder `entityNameTokens()` från `proseStats.ts`), längst-först
sorterad så "Henrik Andersson" vinner över bara "Henrik" där båda
skulle matcha samma ställe — annars hade en fras dubbelräknats som
både helnamn och förnamn. `snippetAround()` i `findReplace.ts`
exporterad för återanvändning istället för att skriva om samma
kontext-utklippslogik. Matchar bara levande kapitels prosa (inte
synopsis eller brainstorm — brainstorm är uttryckligen privat, §9).

Ny sektion "Mentions" i `EntityOverlay`, direkt under History: ett
kapitel per rad med träffantal och upp till två citat, och hela raden
är klickbar — klick hoppar direkt till det kapitlet i
manusredigeraren och stänger Story Bible-kortet. Tolv nya tester i
`bible-mentions.test.ts` (grundläggande räkning, skiftlägesokänslig
matchning, helordsgräns, ingen dubbelräkning av fullnamn+förnamn,
uteslutning av borttagna kapitel, kapitelordning). Verifierat i
webbläsaren: skapade två kapitel som nämnde "Henrik" olika många
gånger, skapade karaktären, och Mentions-sektionen visade rätt
kapitel, rätt antal, citat, och klick på en rad navigerade korrekt
till rätt kapitel och stängde kortet.

**Ändringslogg v0.69 → v0.70:** Andra punkten från `roadmap-ideas.md`
byggd: **Story Bible History-vy**. Precis som förutspått var det
nästan gratis — `NarrativeFact` hade redan `chapter_id` och
`superseded_by`-kedjan, ingen ny lagring behövdes. Ny funktion
`factHistoryForEntity()` (`src/core/bibleHistory.ts`) bygger kedjor
genom att gå baklänges från varje "head"-fakta (den utan
`superseded_by`) via `facts.find(f => f.superseded_by === current.id)`
— en kedja per oberoende "plats", inte en per predikat, så flera
samtidiga `core.trait`-rader som aldrig efterträtt varandra blir
korrekt separata enradskedjor istället för att felaktigt slås ihop.
`chainsWithHistory()` filtrerar bort enradskedjor (inget att visa).
Ny sektion "History" i `EntityOverlay` (`BiblePanel.tsx`), mellan
faktalistan och "Add fact"-formuläret: varje kedja visar
predikatnamn, en tidslinje med kapitel-etikett + värde per rad, och
en "CURRENT"-markering på den aktiva raden. Sju nya tester i
`bible-history.test.ts` (kedjebyggning, oberoende samtidiga fakta,
uteslutning av aldrig-låsta ai_proposed/flagged-rader, sortering).
Verifierat i webbläsaren: skapade en karaktär med en `core.trait`-
fakta, låste sedan en motstridande fakta för samma predikat, och
History-sektionen visade korrekt båda raderna i ordning med
kapitel-etiketter och CURRENT-märkning på den senaste.

**Ändringslogg v0.68 → v0.69:** Första punkten från `roadmap-ideas.md`
byggd: **AI Context Inspector**, v1 read-only enligt planen (inga
include/exclude-kryssrutor än). En "Visa AI-kontext…"-länk i
Settings, bredvid modellval, öppnar en dialog som visar operation,
modell, en grov tokenuppskattning och de faktiska system- och
användarmeddelandena som skickades för det senaste jobbet som körts —
inte en separat sammanfattning som kan hamna fel, utan den riktiga
texten.

Instrumenterat vid alla 13 ställen appen pratar med modellen
(`draftChapter`, `recastChapter`, `rewriteSpan` [extend/elaborate/
instruct × kapitel/synopsis/brainstorm], `askBrainstorm`,
`suggestAlternatives`, `suggestSentenceSplit`, `suggestParagraphBreak`,
`extractChapter`, `analyzeChapter`, `generateIllustrationPrompt`,
`startProofread`) — ett `recordPrompt()`-anrop direkt i
`BookStore.tsx` före varje faktiskt anrop, inte i transportlagret
(`src/llm/ollama.ts`), för att inte koppla ihop en framtida
provider-abstraktion (nästa punkt i roadmapen) med detta
debug-lager. Fångar avsikten innan anropet skickas, så den syns i
inspektorn även om själva Ollama-anropet sedan misslyckas eller
avbryts. Ny typ `PromptDebugEntry` (`src/ui/promptDebug.ts`) plus en
grov tokenuppskattning (~4 tecken/token, ingen riktig tokenizer
kopplad). Fem nya tester för uppskattningsfunktionerna.

Verifierat med Playwright mot en mockad Ollama (route-interception av
`/api/tags` och `/api/chat`, eftersom den riktiga Ollama-instansen
inte är nåbar i den här sandlådan): tomt läge innan något jobb körts,
sedan en riktig Draft-körning som visar korrekt operation ("Draft"),
skrivmodell, ~522 tokens uppskattat, och de faktiska system-/
användarmeddelandena — läsbara, inte trunkerade eller
sammanfattade.

**Ändringslogg v0.67 → v0.68:** Nytt dokument `roadmap-ideas.md` —
sammanfattar och rangordnar idéerna från ett flerpassdiskussion med
ChatGPT om vad som är ett bra författarverktyg, jämfört mot appens
faktiska läge (Scene som förstklassig entitet, AI Context Inspector,
Story Bible History/Mentions, lokal provider-abstraktion inklusive
embeddings, Ask Manuscript med belägg, Timeline, Continuity 2.0,
Plotlines, Setup/payoff, pluggbara utvecklingsmetoder,
hel-manus-analys). Innehåller den centrala korrigeringen att Sandbox-
sidan redan har ett Storyboard/scen-grafskoncept (RPG-sidan) som
ChatGPTs analys inte kände till, vilket ändrar slutsatsen från
"författarfunktioner först, RPG-bryggan senare" till "bygg de
författarfunktioner som samtidigt gör RPG-konverteringen mer
naturlig" — Scene-modellen är en sådan funktion snarare än en
konkurrerande prioritet. Ingen kod ändrad; rent planeringsdokument.
Nästa steg: bygga AI Context Inspector (v1, read-only) som första
konkreta implementation från listan.

**Ändringslogg v0.66 → v0.67:** Kapitelbilden låg tidigare som fast
chrome ovanför den skrollbara textrutan, vilket krympte ytan för
själva texten. Flyttade in kapitelbilden i samma scrollbox som
prosan, via `ProseCanvas`s befintliga `aside`-slot (kombinerad med
`ModelAsideCallout` i en fragment i stället för att lägga
`ChapterStartImageBanner` som en fast syskon-nod före
`<ProseCanvas>`). Krävde en omstrukturering av hur `ProseCanvas`
skrollar: `.prose-wrap` är nu själva scrollboxen (`overflow-y: auto`)
istället för `.prose` (textfältet) självt. `.prose` och dess osynliga
overlay `.prose-rare` (används för att markera ovanliga ord och
sök-träffar utan att röra den redigerbara DOM:en) skrollade tidigare
oberoende av varandra och synkades manuellt via `syncRareScroll()`
(`rare.scrollTop = area.scrollTop`); nu växer båda till sin naturliga
höjd och skrollar tillsammans automatiskt som en enda region, så hela
synkfunktionen och `onScroll`-hanteraren kunde tas bort helt.
"Hoppa till sökträff"-effekten riktar nu om sin `scrollTop`-justering
mot den nya yttre scrollboxen istället för textfältet. Detta är en
känslig del av appen (ordmarkering, sök-i-kapitel), så verifierat
grundligt med Playwright: bifogade en bild, fyllde kapitlet med 60
stycken text, bekräftade att `.prose-wrap` faktiskt blir skrollbart
och att bilden försvinner ur vy vid nedskrollning; skrev text direkt
i fältet för att bekräfta redigering fungerar; slog på
"ovanliga ord"-markering och mätte att `.prose` och `.prose-rare` får
exakt samma höjd (ingen förskjutning) både före och efter skrollning;
körde Sök-i-kapitel och bekräftade att det hoppar till och markerar
rätt träff. Alla fyra beteenden skärmdumpade och kontrollerade
visuellt.

**Ändringslogg v0.65 → v0.66:** Kapitel kan nu få en egen
illustration — en bred banderollbild högst upp i kapitelredigeraren,
ovanför själva texten. Nytt fält `startImage` (`EntityPictureSchema`
återanvänd: `thumbDataUrl` + `imageDataUrl`, optional) på `Chapter` i
`BookSchema.ts`. Ny komponent `ChapterStartImageBanner`
(`ChapterStartImage.tsx`): tom ruta med "Add chapter illustration"
när ingen bild finns, annars bilden i full manusbredd med
"Replace image"/"Remove image" som chip-knappar i hörnet (samma
fixerade mörka bakgrund oavsett bildens ljushet som redan används på
biblioteks-korten). Återanvänder `picturesFromFile()` (samma
klientsidesbeskärning som karaktärsbilder: miniatyr 256px + exportbild
1200px, JPEG). `BlobThumbnail`-liknande felhantering via befintliga
`m.errors.imageChoose/imageRead/imageAdd`-texter.

Bilden bäddas nu även in i Publish-exporterna — men bara i de tre
"läsfärdiga" formaten (HTML, ePub, PDF), inte i RTF/ODT/Markdown som är
redigeringsformat där bilden ändå sällan är slutmålet. Ny funktion
`bytesFromDataUrl()` i `manuscriptExport.ts` avkodar bildens data-URL
till råbytes. HTML: `<img class="chapter-image">` direkt i sidan
(base64, självständig fil). ePub: bilden packas som en riktig
JPEG-resurs i zip-paketet (`OEBPS/images/chapter-N.jpg`) med egen
manifest-post, refererad från kapitlets xhtml-sida. PDF: `pdf-lib`s
`embedJpg()` + en ny `PdfWriter.image()`-metod som skalar bilden för
att få plats inom sidans marginaler innan kapiteltexten skrivs ut.
Sju nya tester i `manuscript-export.test.ts` (ett nytt "chapter start
image"-block: dataflöde genom `buildManuscriptExport`, HTML-inbäddning,
ePub-resurs+referens, PDF-sidantal, och att RTF/ODT/Markdown aldrig
läcker bilddata) plus ett round-trip-test för `startImage` i
`book-schema.test.ts`. Verifierat end-to-end med Playwright: laddade
upp en bild på ett kapitel, publicerade till alla tre format via den
riktiga UI-flödet, och kontrollerade den nedladdade filens innehåll
(HTML renderad och skärmdumpad, ePub/PDF byte-inspekterade).

**Ändringslogg v0.64 → v0.65:** Nytt fält `illustration_orientation`
("landscape" | "portrait", default "landscape") på `Book` — låter
författaren välja liggande eller stående format i Settings, som en
liten växlingsknapp (Landscape/Portrait) precis under
stilförhandsgranskningskortet. `applyOrientationHint()` i
`illustrationPrompt.ts` lägger deterministiskt till en klartextrad i
slutet av den genererade prompten ("Landscape orientation (4:3 aspect
ratio)." respektive "Portrait orientation (3:4 aspect ratio).") —
skriven som vanlig text snarare än en verktygsspecifik flagga som
Midjourneys `--ar`, så den fungerar oavsett vilket externt
AI-bildverktyg författaren klistrar in prompten i. Byggd enligt samma
mönster som `enforceNoTextConstraint()`: deterministisk efterbearbetning
istället för att lita på att modellen själv inkluderar det. Delad
`ILLUSTRATION_ORIENTATIONS`/`ORIENTATION_HINTS` i `illustrationStyle.ts`
för att undvika en cirkulär import mellan `BookSchema.ts` och
`illustrationPrompt.ts`. Nya tester i `illustration-prompt.test.ts`
(hint-tillägg, ingen dubblering) och `book-schema.test.ts` (default
"landscape", migrering av äldre sparfiler utan fältet).

**Ändringslogg v0.63 → v0.64:** Tredje exempelbilden i
Romantik-gruppen: "Regency period pen-and-ink romance"
(`builtin-romance-4`) — liggande monokrom bläckteckning med
cross-hatching, matchar stilens beskrivning perfekt. Nedskalad till
1024×768 (299 KB, från 1448×1086). Romantik-gruppen har nu 3 av 6
stilar klara.

**Ändringslogg v0.62 → v0.63:** Andra exempelbilden i
Romantik-gruppen: "Modern chick-lit romance" (`builtin-romance-5`) —
liggande digital målning med rosa akvarellstänk-bakgrund, nedskalad
till 1024×768 (144 KB, från 1448×1086). Författaren hade först märkt
bilden som "Regency period", men eftersom `builtin-romance-4`
("Regency period pen-and-ink romance") uttryckligen beskrivs som
monokrom bläckteckning och bilden är i färg med akvarellstänk,
flaggade jag mismatchen innan jag lade in den — författaren höll med
och bekräftade att den passar `builtin-romance-5` istället (rosa/
vinröd akvarellpalett matchar den stilens beskrivning). Romantik-
gruppen har nu 2 av 6 stilar klara.

**Ändringslogg v0.61 → v0.62:** Första exempelbilden i
Romantik-gruppen: "1980s romance painterly illustration"
(`builtin-romance-2`) — liggande dramatisk oljemålning i klassisk
1980-talsstil, nedskalad till 1024×768 (229 KB, från 1448×1086).
Verifierad även mot det nya förhandsgranskningskortet i Settings.
Romantik-gruppen har nu 1 av 6 stilar klara.

**Ändringslogg v0.60 → v0.61:** Lyfte fram länken till
illustrationsbiblioteket i Settings — den låg tidigare som en liten
diskret textlänk under en rå textruta med hela stilprompten. Ersatte
det med ett kompakt förhandsgranskningskort (`.illustration-style-preview`):
en miniatyrbild (eller en grå platshållare om ingen bild finns) +
den valda stilens namn + "Browse library…" som klickuppmaning, hela
kortet är en knapp som öppnar biblioteket. Om `book.illustration_style`
inte matchar någon sparad stil (fri text) visas "Custom prompt"/"Egen
prompt" istället för namnet. Den råa textrutan finns kvar men är nu
dold bakom en "Edit text manually"/"Redigera texten manuellt"-växel,
ihopfälld som standard, för den som vill finjustera texten för hand.
Ny delad hjälpfunktion `findStyleByPromptText()` i `illustrationStyle.ts`
(samma matchningslogik som redan fanns i `IllustrationStyleLibraryCard`,
nu återanvänd). `BlobThumbnail` flyttad från `IllustrationStyleLibraryCard.tsx`
till en egen fil `BlobThumbnail.tsx` med en ny "settings"-variant, så
komponenten kan återanvändas i inställningskortet. Två nya tester för
`findStyleByPromptText` i `illustration-style.test.ts`.

**Ändringslogg v0.59 → v0.60:** Innehållsstädning: 12 av de 55
builtin-stilarna innehöll ordet "book cover" i sin prompttext (och
en, `builtin-romance-2`, även i namnet: "1980s romance novel cover").
Eftersom illustrationerna genereras för att sitta inuti boken, inte
som ett bokomslag, bytte alla 12 ut "book cover illustration" /
"book cover artwork" / "book cover painting" mot motsvarande text
utan "book cover" (t.ex. "Epic High Fantasy book cover illustration"
→ "Epic High Fantasy illustration"). Berörda stilar:
`builtin-fantasy-1`, `-5`, `builtin-scifi-2`, `builtin-horror-3`,
`builtin-literary-1`, `-2`, `-6`, `builtin-adventure-1`, `-5`, `-6`,
`builtin-romance-2` (namn + prompt), `builtin-romance-5`. Obs: eftersom
`ensureSeeded()` medvetet aldrig skriver över en redan seedad
builtin-rads text (för att skydda författarens egna redigeringar),
uppdateras inte redan sparade bibliotek automatiskt av denna fix —
den nya texten gäller för nyseedade bibliotek. Ett bibliotek som
redan har den gamla texten kan få den uppdaterad genom att radera
stilen (papperskorgsikonen) och ladda om sidan, så seedas den på nytt
med den rättade texten.

**Ändringslogg v0.58 → v0.59:** Bugfix: att redigera prompten på den
stil som redan var vald för den öppna boken och trycka Spara verkade
inte göra något. Orsak: `book.illustration_style` sätts som en ren
textkopia av stilens `promptText` vid valtillfället (`Editor.tsx`,
`onSelect`) — inte en levande referens till biblioteksposten. Att
spara en ändring i `IllustrationStyleLibraryCard`s redigeringsformulär
uppdaterade bara biblioteksposten i IndexedDB, aldrig bokens redan
kopierade text, så illustrationsgenereringen fortsatte använda den
gamla prompten. Lade till en ny prop `onReapplyIfCurrent` på
`IllustrationStyleLibraryCard`: `handleSave` jämför nu stilens id mot
den stil som matchar bokens aktuella text innan sparningen, och om de
matchar anropas `onReapplyIfCurrent` så att boken omedelbart får den
nya prompttexten (utan att stänga dialogen, till skillnad från
`onSelect`). Verifierat med ett Playwright-skript: väljer en stil,
öppnar biblioteket igen, redigerar samma stils prompt, sparar — kortet
behåller sin tjocka markeringsram och manuskriptets stilfält visar
den nya texten direkt.

**Ändringslogg v0.57 → v0.58:** Bugfix: `ensureSeeded()` lade bara
till builtin-stilar som helt saknades i biblioteket, men fyllde
aldrig i en exempelbild på en redan seedad stil i efterhand. Eftersom
författaren redan hade kört appen innan de flesta exempelbilderna
fanns, låg alla 55 builtin-stilar redan i IndexedDB utan bild — nya
bildvägar i `BUILTIN_EXAMPLE_IMAGE_PATHS` gjorde därför ingenting vid
`git pull` + omstart, eftersom ingen stil räknades som "saknad".
Lade till en separat efterhandsfyllning i `ensureSeeded()`: varje
befintlig builtin-rad utan `exampleImage` som nu har en bildväg får
bilden hämtad och sparad, utan att röra namn/prompt/taggar eller
skriva över en bild som redan finns (author-uppladdad eller
tidigare seedad). Två nya tester i
`illustration-style-repository.test.ts` täcker efterhandsfyllningen
och att en befintlig bild aldrig skrivs över.

**Ändringslogg v0.56 → v0.57:** Tjugofemte exempelbilden: "Victorian
woodcut & engraving (19th century)" (`builtin-historical-1`) —
liggande gravyr av en skotsk ruinby med berg och kust i bakgrunden,
nedskalad till 1024×768 (350 KB, från 1448×1086).

**Ändringslogg v0.55 → v0.56:** Tjugofjärde exempelbilden:
"Turn-of-the-century watercolor (Carl Larsson style)"
(`builtin-historical-6`) — liggande interiörscen med kvinna, katt och
blommor vid fönstret, nedskalad till 1024×768 (270 KB, från
1448×1086). Historisk/Vintage-gruppen är nu komplett, alla sex stilar
har exempelbilder.

**Ändringslogg v0.54 → v0.55:** Tjugotredje exempelbilden: "Nordic
Art Nouveau (John Bauer style)" (`builtin-historical-5`) — liggande
sagoslott med troll, tomte och vattenfall, nedskalad till 1024×768
(376 KB, från 1448×1086). Författaren skickade först en stående
version av samma motiv och bytte själv ut den mot denna liggande
version innan den lades in. Historisk/Vintage-gruppen har nu 4 av 6
stilar klara.

**Ändringslogg v0.53 → v0.54:** Tjugoandra exempelbilden:
"Hand-colored engraving & fairytale watercolor" (`builtin-historical-2`)
— liggande scen med resande vid ett vinterläger nära en by, nedskalad
till 1024×768 (344 KB, från 1448×1086). Historisk/Vintage-gruppen har
nu 3 av 6 stilar klara.

**Ändringslogg v0.52 → v0.53:** Tjugoförsta exempelbilden: "Edwardian
pastoral storybook illustration" (`builtin-historical-4`) — liggande
snöig stugidyll med rödhake och stenbro, nedskalad till 1024×768
(332 KB, från 1448×1086). Historisk/Vintage-gruppen har nu 2 av 6
stilar klara.

**Ändringslogg v0.51 → v0.52:** Tjugonde exempelbilden: "1930s
lithographic poster & screen print" (`builtin-historical-3`) —
liggande WPA-affischstil med flugfiskare vid en å, nedskalad till
1024×768 (262 KB). Ersätter den tidigare inskickade stående versionen
(1122×1402) som författaren själv flaggade mot liggande-regeln innan
den hann läggas in. Historisk/Vintage-gruppen har nu 1 av 6 stilar
klara.

**Ändringslogg v0.50 → v0.51:** Nittonde exempelbilden: "Solarpunk
utopian future" (`builtin-scifi-6`) — nedskalad till 1024px bredd
(232 KB, från 1536×1024). Sci-fi-gruppen är nu komplett, alla sex
stilar har exempelbilder.

**Ändringslogg v0.49 → v0.50:** Bytte ut "Retro-futurist 70s space
art"-bilden (`builtin-scifi-2`) mot en liggande version av samma
motiv — författaren vill hålla stående/liggande konsekvent (liggande)
över hela biblioteket. Samma filväg, bara innehållet i JPG-filen
bytt (1024×768 mot tidigare 1024×1536) — ingen ändring i
`illustrationStyleSeeds.ts` behövdes eftersom sökvägen är oförändrad.

**Ändringslogg v0.48 → v0.49:** Artonde exempelbilden: "Retro-futurist
70s space art (Chris Foss style)" (`builtin-scifi-2`) — porträttbild,
redan 1024px bred (402 KB, 1024×1536, ingen nedskalning behövdes).

**Ändringslogg v0.47 → v0.48:** Sjuttonde exempelbilden: "Hard sci-fi
realistic space exploration" (`builtin-scifi-3`) — nedskalad till
1024px bredd (194 KB, från 1672×941).

**Ändringslogg v0.46 → v0.47:** Sextonde exempelbilden: "Epic space
opera" (`builtin-scifi-4`) — nedskalad till 1024px bredd (272 KB,
från 1448×1086).

**Ändringslogg v0.45 → v0.46:** Femtonde exempelbilden: "Cyberpunk
neon noir" (`builtin-scifi-1`) — nedskalad till 1024px bredd (269
KB, från 1448×1086).

**Ändringslogg v0.44 → v0.45:** Fjortonde exempelbilden, första ur
Sci-fi-gruppen: "Biopunk organic sci-fi (Moebius/Giger fusion)"
(`builtin-scifi-5`) — nedskalad till 1024px bredd (262 KB, från
1448×1086).

**Ändringslogg v0.43 → v0.44:** Trettonde exempelbilden: "Classic
pen-and-ink sketch" (`builtin-storybook-2`) — nedskalad till 1024px
bredd (181 KB, från 2000×1091). Barnbok-gruppen är nu komplett, alla
sex stilar har exempelbilder.

**Ändringslogg v0.42 → v0.43:** Tolfte exempelbilden: "Gouache & naive
storybook" (`builtin-storybook-3`) — nedskalad till 1024px bredd (179
KB, från 2000×1091). Bara "Classic pen-and-ink sketch" kvar av
Barnbok-gruppen.

**Ändringslogg v0.41 → v0.42:** Elfte exempelbilden: "Ethereal
fairytale illustration (Golden Age)" (`builtin-storybook-4`) —
nedskalad till 1024px bredd (214 KB, från 1500×818).

**Ändringslogg v0.40 → v0.41:** Tionde exempelbilden: "Modern digital
picture book" (`builtin-storybook-6`) — nedskalad till 1024px bredd
(73 KB, från 2000×1091).

**Ändringslogg v0.39 → v0.40:** Nionde exempelbilden, första ur
Barnbok-gruppen: "Dense ink cross-hatch storybook" (`builtin-
storybook-5`) — nedskalad till 1024px bredd (232 KB, från 1500×818).

**Ändringslogg v0.38 → v0.39:** Genomgående fix, illustrationsstilarna
blandade rendering med konkret scen — plats, tid på dygnet, handling.
Rapporterat av författaren: en stil som t.ex. bakar in "vid en dimmig
sjö vid gryning" bär in den scenen i VARJE genererad prompt oavsett
vad stycket faktiskt handlar om, eftersom kombineringsinstruktionen
ber modellen väva ihop styckets scen OCH stilens text — och stilens
egen scen då läcker in på stycken den inte hör hemma i.

Gick igenom alla 55 inbyggda promptar och strök allt scen-specifikt
(plats, tid på dygnet, väder, konkret handling/karaktär/objekt) —
behöll bara medium, teknik, penseldragskvalitet, färgpalett,
ljuskaraktär (som teknik, inte tidpunkt — "dramatisk sidobelysning"
ja, "vid gryning" nej) och stämningsord. Namngivna konstnärsreferenser
(Frazetta, Alan Lee, Chris Foss, Beksiński, John Bauer, Carl Larsson,
Moebius/Giger) och palett-färgnamn som råkar låna tidsord ("twilight
blue", "moonlight ivory") behölls — de beskriver en kulör, inte att
scenen faktiskt utspelar sig i skymning. Barnbok-gruppen var redan
mestadels ren; störst städning i Fantasy, Sci-fi, Horror/Gothic,
Detective/Noir, Adventure och Romance.

Lade även till en andra försvarslinje i själva kombineringsprompten
(`src/core/illustrationPrompt.ts`): systeminstruktionen säger nu
explicit att stilen bara beskriver RENDERING, aldrig VAD som avbildas,
och att modellen ska ignorera scen/plats/tid om en stiltext råkar
nämna det — skyddar även mot egna, författarskrivna stilar som
råkar blanda in scen på samma sätt.

**Ändringslogg v0.37 → v0.38:** Åttonde exempelbilden: "Raw scribble
portrait" (`builtin-literary-7`) — nedskalad till 1024px bredd (322
KB, från 1448×1086). Hela Litterär/Realistisk-gruppen (alla sju
stilar) har nu exempelbilder.

**Ändringslogg v0.36 → v0.37:** Sjunde exempelbilden: "Nordic realism
& atmospheric nature" (`builtin-literary-1`) — nedskalad till 1024px
bredd (186 KB, från 1448×1086). Bara "Raw scribble portrait" kvar av
Litterär/Realistisk-gruppen.

**Ändringslogg v0.35 → v0.36:** Sjätte exempelbilden: "Pastoral
memory prose & coming-of-age" (`builtin-literary-6`) — nedskalad till
1024px bredd (210 KB, från 1370×1148).

**Ändringslogg v0.34 → v0.35:** Femte exempelbilden: "Psychological
drama & character study" (`builtin-literary-5`) — nedskalad till
1024px bredd (160 KB, från 1448×1086).

**Ändringslogg v0.33 → v0.34:** Fjärde exempelbilden: "Magical
realism & rural landscape" (`builtin-literary-4`) — nedskalad till
1024px bredd (197 KB, från 1448×1086).

**Ändringslogg v0.32 → v0.33:** Tredje exempelbilden: "Impressionistic
urban realism" (`builtin-literary-3`), stilnamn angivet av författaren
den här gången — nedskalad till 1024px bredd (268 KB, från 1448×1086).

**Ändringslogg v0.31 → v0.32:** Andra exempelbilden på plats:
"Contemporary quiet everyday realism" (`builtin-literary-2`,
Litterär/Realistisk) — nedskalad till 1024px bredd (159 KB, från
1448×1086). Filsökvägen chatten ger mig är ett systemgenererat
sekvensnummer (`15.webp` i en delad mapp), inte författarens riktiga
filnamn — kunde alltså inte läsa stilen därifrån som hoppats, matchade
istället mot bildens faktiska innehåll: matbord med kaffekopp,
uppslagen anteckningsbok, ljusstake, och paletten
terrakotta/salvia/cream/bärnsten — alla specifikt nämnda i just den
stilens promptext, ett tydligt fall att lita på utan att fråga.

**Ändringslogg v0.30 → v0.31:** Mekanism för att skeppa riktiga
exempelbilder med appen istället för att varje författare måste ladda
upp dem själva i sin egen webbläsare. Bilder läggs som vanliga
statiska filer under `public/illustration-examples/` (Vite serverar
dem direkt), och en ny lookup, `BUILTIN_EXAMPLE_IMAGE_PATHS` i
`illustrationStyleSeeds.ts` (stil-id → sökväg), säger vilken bild som
hör till vilken inbyggd stil — en separat struktur eftersom en `Blob`
(vad `exampleImage` faktiskt är) inte går att hårdkoda som ett
statiskt värde i en TypeScript-fil.

`ensureSeeded()` hämtar (`fetch`) och konverterar till `Blob` för varje
ny inbyggd stil som har en bildsökväg, innan raden skrivs till
IndexedDB — `withBuiltinExampleImage` i `IllustrationStyleRepository.ts`.
Best-effort: misslyckas hämtningen (nätverksfel, saknad fil) skeppas
stilen ändå, bara utan bild — blockerar aldrig hela fröningen. Testat
både med mockad `fetch` (lyckad och misslyckad) och i riktig
webbläsare mot Vites statiska filserver.

Första bilden på plats: "Graphic retro picture book"
(`builtin-storybook-1`, Barnbok) — författarens flygande-matta-bild,
nedskalad till 1024px bredd (139 KB, från ett 2000×1091 original).
Fler bilder droppas in i chatten efter hand, samma inkrementella
mönster som prompttexterna följde.

**Ändringslogg v0.29 → v0.30:** Bugfix, förstoringsglas- och
redigera/radera-ikonerna på illustrationskorten var näst intill
osynliga mot ljusa/varma fotobilder — rapporterat med skärmdump.
Grundorsak: bakgrunden bakom ikonerna var `var(--overlay)`, som i
ljust läge bara är 32% opacitet — knappt märkbar mot en redan ljus
bild, så ikonens `currentColor`-linjer föll platt mot bakgrunden
bakom. Bytte till en fast, temaoberoende mörk platta (`rgb(10 8 6 /
0.6)`, `0.8` vid hover) med ljus ikonfärg (`#f3eadc`, `#fff` vid
hover) — samma princip som redan användes för lightboxens
Close-knapp (v0.28): en bildvisares kontroller ska synas mot vilken
bildinnehåll som helst, inte följa apptemat. Gäller nu både
förstoringsglaset och penna/×-ikonerna. Explicita hover-regler
lades till för att inte den globala `.icon-button:hover{color:
var(--text)}`-regeln (samma specificitet för förstoringsglaset,
skulle annars vinna på källordning) skulle tvätta ur färgen igen.

**Ändringslogg v0.28 → v0.29:** Bytte förstoringsglas-ikonen från
emoji (🔍) till en handritad inline-SVG (`ZoomIcon` i
`IllustrationStyleLibraryCard.tsx`, cirkel + handtag, `stroke:
currentColor` så den följer knappens textfärg i båda teman). Författaren
länkade en specifik ikon från Flaticon — flaticon.com är blockerad i
den här sandboxade miljön så filen gick inte att hämta, och Flaticons
gratisikoner kräver dessutom normalt attribution. Byggde en egen SVG
istället: inget licenskrav, ingen extern fil, samma mönster som
✎/×-ikonerna redan följer.

**Ändringslogg v0.27 → v0.28:** Förstoringsglas-ikon i exempelbildens
nedre högra hörn på varje kort (visas bara när stilen faktiskt har en
bild) — klick öppnar bilden i en egen lightbox-ruta i full storlek
(`max-width/height: min(90vw, 60rem)/80vh`, `object-fit: contain`, ingen
uppskalning bortom originalstorleken). Ikonen sitter i botten-höger av
bilden, inte topp-höger, eftersom pennan/×-knapparna redan låg där.

Escape-hanteringen i biblioteksrutan utökades till tre nivåer
(lightbox → redigeringsvy → hela rutan) i samma villkorskedja istället
för en till fristående `window`-lyssnare — en andra oberoende
Escape-lyssnare på samma `window`-mål hade riskerat att båda
lyssnarna triggar på en enda knapptryckning (stänger lightbox OCH hela
biblioteket samtidigt) eftersom `stopPropagation` inte hindrar andra
lyssnare på samma mål, bara `stopImmediatePropagation` gör det.

Bugg hittad och fixad under implementationen: lightboxens bakgrund
återanvände samma halvgenomskinliga `--overlay`-variabel som redan
låg bakom hela biblioteksrutan — två travade halvgenomskinliga lager
över en redan ogenomskinlig panel gjorde knappt något, så "Close"-
knappen var nästan oläslig mot kortinnehållet som lyste igenom. Löst
med en egen, fast mörk bakgrund (`rgb(10 8 6 / 0.88)`) oberoende av
ljust/mörkt tema — konventionellt för en bildvisare där bilden själv
ska synas tydligt, inte samma regel som gäller för rutor-i-rutor.

**Ändringslogg v0.26 → v0.27:** Öppnar man biblioteket när manuset
redan har en vald illustrationsstil hoppar rutan direkt till rätt
genre och scrollar fram till det kortet (`scrollIntoView({block:
"nearest"})`, effekten körs en gång per öppning) — det markerade
kortet får en tjockare kant (`border-width: 2px` mot `1px` annars) så
det syns tydligt bland de andra i samma genre. "Vald stil" avgörs
genom att matcha manusets `illustration_style`-fält mot varje stils
`promptText` (trimmat, exakt match) — hittas ingen träff (fri text
som inte kommer från biblioteket) beter sig rutan som innan, första
genren vald, inget kort markerat. Genren att hoppa till väljs från
stilens `genreTags[0]`, eller "Otaggade" om stilen saknar taggar.

**Ändringslogg v0.25 → v0.26:** Kortgallret i illustrationsbiblioteket
fick konstant höjd (rymmer alltid två rader) och alla kort samma
höjd, oavsett hur olika lång namn/prompttext är — begärt efter att
sett gallret hoppa i höjd mellan genrer med 6 respektive 7 kort.
`.illustration-style-grid` gick från flexibel (`min-height:0` +
växer/krymper efter innehåll) till `height: min(34rem, 65vh)` — fast
på normala skärmar, men krymper mot `65vh` istället för att klippa
oåtkomligt innehåll på ovanligt korta viewports (samma `overflow-y:
auto`-mekanism finns kvar för fler kort än två rader).

Kortets namn och prompttext fick egna fasta höjder (`2.6rem`
respektive `3.3rem`, med absolut `line-height` och `line-clamp`
2/3 rader) istället för att variera med textlängd — annars fick
kortgallrets rader olika höjd beroende på om ett kort råkade få ett
tvåradigt namn. Bugg hittad under implementationen: att bara sätta
fast höjd på kortets INNEHÅLL (namn/prompt) räckte inte — `.illustration-style-card`
själv saknade egen höjd, och dess CSS Grid-rad (implicit, auto-storlek)
räknade fel på hur högt ett `line-clamp`-barn faktiskt behöver, vilket
klippte bort halva namnet och HELA prompttexten på alla kort. Fixat
genom att ge `.illustration-style-card` en egen explicit `height:
16.5rem` — kortets totalhöjd är nu auktoritativ och beror inte på
grid-radens auto-uträkning av barn med `line-clamp`.

**Ändringslogg v0.24 → v0.25:** Illustrationsbiblioteket byggdes om
till en två-panels master-detail-vy istället för den kollapsningsbara
listan — begärt av författaren efter att biblioteket växt till 55
stilar i nio genrer. Vänster kolumn: genre-lista, en rad per genre med
antal, klick byter vilken genre som visas (rensar ev. sökfält).
Höger panel: kortgalleri för vald genre — varje kort har en stor
exempelbild överst, namn, och en 3-radig trunkerad förhandsvisning av
prompttexten (`-webkit-line-clamp`/`line-clamp`). Klick på ett kort
applicerar direkt och stänger rutan (bekräftat med författaren —
inget separat bekräftelsesteg). Pennikonen för redigera (och × för
egna stilar) ligger nu som en liten overlay i kortets hörn istället
för bredvid en rad.

Sök filtrerar nu över alla genrer samtidigt och visar resultaten som
en platt "Sökresultat"-pseudo-kategori högst upp i vänsterkolumnen,
automatiskt vald — inte begränsad till en genre i taget. Att klicka en
riktig genre i listan rensar sökfältet, så sök- och bläddra-lägena
aldrig blandas ihop. Rutan är nu `min(68rem, 95vw)` bred (tidigare
42rem) för att rymma två kolumner; en `@media (max-width: 640px)`
lägger genre-listan ovanpå kortgallret som en horisontellt
scrollbar rad på smala skärmar istället för sida vid sida.

**Ändringslogg v0.23 → v0.24:** Genre-grupperna i illustrationsbiblioteket
är nu stängda by default — med nio genrer och 55 stilar blev listan för
lång att överblicka öppen. `open={search.trim().length > 0}` istället
för ett statiskt `open`: stängt i vila, men söker man öppnas de grupper
som faktiskt matchar automatiskt (annars skulle sökresultat gömmas bakom
manuellt stängda `<details>`). Manuellt expanderade grupper stör inte —
Reacts attributdiff lämnar `open` orört mellan renderingar där det
beräknade värdet inte ändras, så ett handklick på en rubrik överlever
t.ex. att skriva i sökfältet utan att träffa den gruppen.

**Ändringslogg v0.22 → v0.23:** Ny genre-tagg **Romance**, sex
namngivna stilar, samma mönster som tidigare leveranser. Biblioteket
har nu 55 inbyggda stilar över nio genrer (55 = 6×8 + 7 Litterär/
Realistisk sen v0.22). Första promptens text kom på svenska
(Romantik 1) — översatt till engelska för konsekvens med övriga 54
promptar, eftersom fältet matas till en engelskspråkig
bildgenereringstjänst och `enforceNoTextConstraint` (v0.20) letar
efter engelska nyckelfraser ("no text", "textless" osv.) för att
avgöra om stilens no-text-villkor behöver skrivas tillbaka.

**Ändringslogg v0.21 → v0.22:** Lade till en sjunde stil under
Litterär/Realistisk, "Raw scribble portrait" — författaren trodde den
redan fanns i biblioteket och letade efter en "Romantic"-grupp, men
ingetdera hade faktiskt kommit fram i tidigare leveranser (verifierat
med grep innan svar, inget gissat). Prompten kom med i den här
begäran och är nu tillagd; ingen "Romantic"-tagg finns ännu — väntar
på att författaren skickar den texten, om den ska finnas.

**Ändringslogg v0.20 → v0.21:** Bugfix, biblioteksrutan rann utanför
skärmen istället för att scrolla — rapporterat med skärmdump, listan
med 48 stilar försvann nedåt utan synlig scrollbar. Grundorsak: klassiskt
CSS Grid-fel. `.edit-card` är `display: grid` utan egen
`grid-template-rows`, så alla barn (rubrikrad, sökfält, "spara som
ny"-knapp, stilgruppslistan) fick var sin `auto`-rad som växer efter
innehåll. Grid-objekt har `min-height: auto` som standard — det
förhindrar en rad från att krympa under sitt eget innehålls höjd även
om raden själv har `overflow: auto`. Kortet saknade dessutom `overflow:
hidden`, så `max-height: 85vh` klippte aldrig något — resten
"läckte" bara vidare nedåt, osynligt och utan scroll.

Fix i tre steg på `.edit-card.illustration-library-card` och
`.illustration-style-groups`: `overflow: hidden` på kortet så
`max-height` faktiskt klipper; `grid-template-rows: auto auto auto
minmax(0, 1fr)` så stilgruppslistan blir den enda flexibla raden som
fyller återstående utrymme istället för att växa fritt; `min-height: 0`
på själva listan som extra säkerhet. Verifierat i webbläsare: listans
`scrollHeight` (2869px) är nu korrekt större än dess synliga
`clientHeight` (444px), och att scrolla listan till botten visar
faktiskt sista raden.

**Ändringslogg v0.19 → v0.20:** Bugfix, illustrationsprompten tappade
sina "no text"-instruktioner. Rapporterat av författaren: startstilens
`"..., textless, no text, no captions, no titles, no printed words,
clean illustration without typography."` fanns med i modellanropet,
men den sammansatta prompten modellen skrev innehöll ingen sådan
instruktion alls — den genererade bilden fick rubriker och text den
inte skulle ha. Grundorsak: granskningsmodellen tolkar "no
text/textless"-satser som ett genereringsparametrar snarare än ett
visuellt drag, och skriver bort dem när den formulerar om stilen till
en ny scenbeskrivning — särskilt märkbart med mindre lokala modeller.

Två lager fix i `src/core/illustrationPrompt.ts`: (1) systemprompten
säger nu explicit att såna tekniska villkor ska kopieras ordagrant,
aldrig omformuleras eller strykas; (2) en deterministisk efterkontroll,
`enforceNoTextConstraint`, som — om stilen deklarerade ett
"no text"-villkor men modellens svar saknar det — skriver tillbaka
den exakta satsen i slutet. Ren funktion, testad separat från
LLM-anropet, körs i `BookStore.tsx` direkt efter `completeOllamaChat`
returnerar. Rör aldrig svaret om stilen aldrig deklarerade villkoret
(t.ex. en egen stil utan den satsen), eller om modellen redan skötte
sig.

**Ändringslogg v0.18 → v0.19:** Riktig promptext för de återstående
fyra genre-taggarna: Barnbok, Fantasy, Sci-fi och Horror/Gothic, sex
namngivna varianter vardera — samma mönster som v0.18. Alla åtta
genrer i illustrationsbiblioteket har nu sin riktiga text, 48 inbyggda
stilar totalt, inga platshållare kvar. `builtin-storybook`,
`builtin-fantasy`, `builtin-scifi`, och `builtin-horror` (de fyra
enstaka placeholder-id:na från v0.17) döptes om till `-1`…`-6` per
genre i samma veva — konsekvent med hur `-literary-`/`-historical-`/
`-noir-`/`-adventure-` redan var numrerade i v0.18. `ensureSeeded`s
per-id-matchning (v0.18) gör bytet säkert: de gamla enstaka
placeholder-raderna hade redan aldrig hunnit nå en riktig
webbläsarsession eftersom hela biblioteksfunktionen är oanvänd i
produktion ännu.

**Ändringslogg v0.17 → v0.18:** Riktig promptext för fyra av de åtta
genre-taggarna i illustrationsbiblioteket: Litterär/Realistisk,
Historisk/Vintage, Deckare/Noir (ny tagg, fanns inte i v0.17) och
Äventyr (ny tagg). Varje genre fick sex namngivna varianter istället
för den enda platshållarposten från v0.17 — biblioteket har nu 28
inbyggda stilar totalt, fyra genrer (Children's book, Fantasy, Sci-fi,
Horror/Gothic) väntar fortfarande på sin egen omgång riktig text.

`ensureSeeded` byggdes om från "sätt frö en gång, bara när biblioteket
är helt tomt" till att lägga till varje inbyggd stil vars id saknas,
oavsett om biblioteket redan innehåller andra rader. Den gamla
logiken hade permanent blockerat alla framtida tillskott av inbyggda
stilar så fort ett enda bibliotek innehöll något alls (en egen stil,
eller bara en redan fröad platshållare) — ett äkta fel, inte bara en
förberedelse för den här leveransen, eftersom författaren själv
aviserat fler omgångar text ("Jag skickar prompterna senare"). Rör
aldrig en rad som redan finns, oavsett om det är en författarredigerad
inbyggd stil eller en egen.

**Ändringslogg v0.16 → v0.17:** **Illustrationsstil-bibliotek och
prompt-generering.** Nytt appnivå-bibliotek med illustrationsstilar
(`src/core/illustrationStyle.ts`), oberoende av vilket manus som är
öppet — sex inbyggda startstilar genre-taggade (`origin: "builtin"`),
sparas i en ny IndexedDB-store (`illustration_styles`, `DB_VERSION`
1→2 i samma fysiska databas som `books`, inte en egen databas). Sex
inbyggda stilars promptText är fortfarande platshållartext —
författaren har lovat skicka den riktiga texten senare, `ensureSeeded`
skriver aldrig över ett fält som redan finns i IndexedDB så bytet blir
säkert när texten kommer.

Nytt fält `Book.illustration_style: string` (per-manus, i Settings
bredvid Voice) — biblioteket *fyller* fältet vid val, skriver aldrig
över det automatiskt och fältet är alltid redigerbart efteråt, samma
"karta, inte grind"-princip som resten av appen. Biblioteksrutan
(`IllustrationStyleLibraryCard.tsx`) är sökbar och kollapsningsbar per
genre-tagg (native `<details>`), stödjer "Spara nuvarande text som ny
stil" och redigering/borttagning av egna (`origin: "custom"`) stilar —
de sex inbyggda går att redigera men inte radera. Valfri exempelbild
per stil lagras som `Blob` direkt i IndexedDB (structured-clone,
ingen base64) — visas som en CSS-begränsad miniatyr, ingen
bildredigering/beskärning i appen.

Ny meny-knapp i markeringsmenyn i kapiteltext, "Illustrationsprompt…",
mellan Omskriv… och Manuell redigering. Anropar granskningsmodellen
(`completeOllamaChat` med `reviewModel`, samma busy/abort/felmönster
som `analyzeChapter`) med det markerade stycket, låsta Story
Bible-fakta för de entiteter vars namn faktiskt förekommer i stycket
(`relevantEntitiesForPassage` i `src/core/illustrationPrompt.ts`,
återanvänder `entityNameTokens`/`normalizeWord` från
`proseStats.ts` för namnmatchningen) och manusets valda
illustrationsstil. Resultatet visas i en dockad ruta (samma form som
Omskriv-dialogen) med Kopiera-knapp, ingen automatisk användning.

Medvetet hållet utanför `src/core/`↔`src/llm/`-gränsen: filen
definierar en egen strukturellt identisk meddelandetyp istället för
att importera `ChatMessage` från `@llm/types`, eftersom ingen annan
fil i `core/` gör det.

**Ändringslogg v0.15 → v0.16:** Framsteg-knappen flyttade ut ur
`model-fields`-klustret (Språk/Tema/Backup/Sök) till en egen,
horisontellt centrerad plats mitt i headern — den drunknade bland de
andra knapparna på högerkanten. `position: absolute; left: 50%` på
`.editor-top` (redan `position: relative` sedan tidigare), tar den ur
grid-flödet så den inte konkurrerar med de tre befintliga
grid-kolumnerna (Alla manus / titelfält / högerkluster). Verifierat
att den inte överlappar titelfältet eller högerklustret ner till 900px
bredd.

**Ändringslogg v0.14 → v0.15:** **Framsteg** (v1 av flera
"Progress & Momentum"-idéer inspirerade av en konkurrentapp, Smithword
— bara ordmål + omräknande pace byggt hittills, Milstolpar och
Sessionsräknare är separata, ej byggda ännu). Ny knapp i headerns
högerkluster, bredvid Säkerhetskopia/Sök — samma "ambient status,
klick för detalj"-mönster som Backup redan hade, inte gömd bakom
Synopsis. Knappens text *är* mätvärdet, ingen egen etikett: utan mål
`"X ord · Sätt mål"`, med mål `"Z % dit"` — samma princip som
`! BACKUP`-texten redan följer. Klick öppnar en dockad Progress-ruta
(samma `edit-card`-mönster som Stats/Publicera).

Datamodell: `Book.goal?: { targetWords, deadline, daysPerWeek }`,
helt valfritt — inget mål betyder ingen pace-UI alls, bara
`X ord`-läget. Paceberäkningen (`computeGoalPace` i
`src/core/writingGoal.ts`) räknas om vid varje render, sparas aldrig:
om författaren hamnar efter stiger `dailyPaceNeeded` istället för att
bara visa en lägre procent utan vägledning — exakt principen som
beskrevs i ursprungsidén. `remainingWritingDays` skalar kalenderdagar
kvar med `daysPerWeek/7` (ett snitt, inte en vald veckodagsmängd —
enklare, ingen extra UI för att peka ut specifika dagar). Total
ordräkning (`manuscriptWordCount`) är bara `countWords` summerat över
`sortedChapters` — inget nytt spårat, samma mönster som redan gällde
för `currentWordCount`.

Medvetet avgränsat från ursprungsidén efter granskning: Milstolpar
(§3 i förslaget) påstod "ingen ny tracking" men det stämmer inte
riktigt — `NarrativeFact` saknar `locked_at` (bara `created_at` och
nuvarande `status`), och kapitelhistoriken är FIFO-begränsad så det
allra första Draft-anropet kan ha fallit ur `revisions` på ett gammalt,
mycket omskrivet kapitel. Båda luckorna identifierade men inte
åtgärdade än — väntar tills Milstolpar faktiskt byggs.

**Ändringslogg v0.13 → v0.14:** **Backup**-knappen i headern (den som
blir `! BACKUP` när en säkerhetskopia är försenad) gör sig nu påmind
med en liten "nudge" — 2px vertikal rörelse, tre snabba studsar
komprimerade till de sista ~8% av en 8-sekunders loop, resten av tiden
står texten still. Ren CSS (`@keyframes backup-nudge`), ingen
JS-timer. Respekterar `prefers-reduced-motion` genom appens redan
befintliga globala regel (`*,*::before,*::after{animation-duration:
0.001ms!important}` när `reduce` är satt) — inget nytt lokalt undantag
behövdes, det är samma mönster som redan skyddar resten av appen.
Verifierat: rörelsen syns i normalläge (mätt `transform` över flera
punkter i loopen), men fryser till i praktiken oförändrad när
`prefers-reduced-motion: reduce` är på — den roströda färgen bär
signalen ändå, orörd i båda fallen. Eskalerande täthet (tätare loop ju
längre backupen dröjt) diskuterat men inte byggt — inte nödvändigt för
v1.

**Ändringslogg v0.12 → v0.13:** Bugfix, PDF med Lora/Source Serif 4
(troligen alla fyra bäddade typsnitt) visade bara en bråkdel av kapitel
1:s text hos en användare. Kunde inte återskapas med `pdfjs` — varken
textutdrag eller en riktig canvas-rendering (samma motor som Firefox
använder) visade något fel, i flera varianter (korta/långa kapitel,
svenska tecken, kursiv/rak dialog). Mest sannolika förklaring: `pdf-lib`
+ `@pdf-lib/fontkit`s `{ subset: true }` — som bara bäddar in de glyfer
som faktiskt används — producerar en glyftabell som vissa läsare
(Adobe Acrobat namngavs som misstänkt, ospecificerat vilken användaren
körde) hanterar ofullständigt; kända problem i den kategorin finns
dokumenterade för `pdf-lib`s subset-läge. Fixen är att sluta subsetta:
`packPdf` bäddar nu in hela typsnittsfilen (`embedFont` utan
`subset`-flaggan, standard är `false`). Kostnad: en PDF med inbäddat
typsnitt växer från ~10 KB till ~140 KB för en kort roman — helt
rimligt för en lokalt nedladdad fil, och undviker hela
kompatibilitetskategorin. Inte bekräftat löst av användaren än (väntar
på att de testar igen efter `git pull` + `npm install`).

**Ändringslogg v0.11 → v0.12:** Typsnittsval i Publicera. Ny dropdown
**Typsnitt** bredvid Format, fyra kurerade OFL-typsnitt utöver
standardutseendet: **Lora**, **Literata**, **Source Serif 4**, **Asap**
(sans, resten serif) — valda av användaren, `.ttf`-filerna hämtade från
Google Fonts (alla OFL, licenstext bundlad per typsnitt i
`src/assets/fonts/<namn>/OFL.txt`) och committade i repot, inte hämtade
över nät vid publicering. Genomslag skiljer sig per format, av
tekniska skäl:
- **HTML**: typsnittet bäddas in som `@font-face` med base64-data —
  filen är fortfarande en enda fristående `.html`, ingen nätåtkomst
  krävs för att läsa den senare.
- **ePub**: typsnittet läggs in som riktiga `.ttf`-filer i paketet
  (`OEBPS/fonts/`), samma sätt som e-boksläsare förväntar sig — inte
  base64, det hade varit onödigt stort och ovanligt för formatet.
- **PDF**: `pdf-lib`s `embedFont` med `{ subset: true }` — bara de
  glyfer som faktiskt förekommer i manuset bäddas in, inte hela
  typsnittsfilen. Kräver `@pdf-lib/fontkit` (nytt beroende,
  `pdf.registerFontkit(fontkit)`) eftersom `pdf-lib`s inbyggda
  `StandardFonts`-lista bara täcker de 14 PDF-standardtypsnitten
  (Times/Helvetica/Courier-familjerna), inte godtyckliga TTF-filer.
- **RTF/ODT**: bara typsnittsnamnet skrivs in (`\fonttbl` respektive en
  ny ODT-stil `style:font-name`), ingen inbäddning. Båda är i första
  hand redigeringsformat (Scrivener, Word) där författaren ändå väljer
  om typsnitt saknas lokalt — att bädda in riktiga fonter i RTF/ODT är
  tekniskt möjligt men ovanligt stödd tvärs verktyg, så det byggdes
  inte.
- **Markdown**: inget typsnittsbegrepp, orört.

`ManuscriptExport`-formaterarna tar nu en valfri sjätte/sjunde
parameter `font?: PublishFont` (`{ name, stack, embed? }`) — standard
(`system`, inget värde) ger exakt samma Times/Georgia/Liberation
Serif-utseende som innan denna version, så inget befintligt anrop
behövde ändras. Katalogen och nätverksladdningen
(`loadPublishFontEmbed`, en `fetch` per vald font vid publicering, inte
vid appstart) sitter i en ny `src/core/publishFonts.ts`, separat från
formaterarna själva så de förblir rena/testbara utan webbläsarmiljö.

**Ändringslogg v0.10 → v0.11:** Tre justeringar av Publicera efter
användartest. (1) Rubriken flyttade ner ett snäpp — sitter nu direkt
under Korrektur i vänsterpanelen (inte efter Ta bort-listan), så
arbetsflödet blir Brainstorming → … → Korrektur → Publicera i en
obruten linje, oavsett om manuset har borttagna kapitel eller ej. (2)
Synopsis och kapitel-brief är borta ur alla sex format. Båda är
skrivinstruktioner/kartor för författaren, inte text som ska ut till
läsaren — samma resonemang som redan gällde brainstorm (som aldrig var
med). `ManuscriptExport`/`ManuscriptExportChapter` tappade fälten
`synopsis` och `brief` helt, så det är strukturellt omöjligt för ett
format att råka ta med dem. (3) Kapitel börjar alltid på egen sida i
RTF (`\page`), ODT (ny stil `ChapterHeading` med
`fo:break-before="page"`) och PDF (`PdfWriter.newPage()` tvingas före
varje kapitelrubrik, även ett kort kapitel). ePub hade redan det på
köpet — varje kapitel är sin egen xhtml-fil/spine-post, en sidvändning
i sig för läsaren. HTML fick en `@media print`-regel
(`break-before:page` på kapitelrubriken) för samma effekt vid
utskrift/skriv-ut-till-PDF, men ingen ändring på skärmen — Markdown har
inget sidbegrepp alls och lämnades orört.

**Ändringslogg v0.9 → v0.10:** **PDF** i Publicera, sjätte formatet.
Format-listan är nu en dropdown under filnamnet (inte en knapp per
format — fem knappar i rad hade slutat rymmas). PDF är den första
export-beroendet i den här appen: `pdf-lib` (MIT, inga canvas/DOM-krav,
väljer det framför `jspdf` som drar med sig `html2canvas`/`canvg`/
`dompurify` — helt oanvänt för ren textexport). Sidlayouten
(rubrikstorlekar, radbrytning, sidbrytning) är egen kod ovanpå
`pdf-lib`s ritprimitiv (`drawText`, `widthOfTextAtSize`) — biblioteket
har ingen inbyggd automatisk radbrytning som räknar rader åt oss, så
en liten `PdfWriter`-klass gör det (mäter varje rad, bryter sida när
den skulle gå under marginalen). Samma `ManuscriptExport`-mellanformat
som HTML/ePub/ODT. `packPdf` är asynkron (`pdf-lib`s `save()` är det),
till skillnad från de andra format-funktionerna — enda undantaget i
Publicera-flödet.

**Ändringslogg v0.8 → v0.9:** **Publicera** ersätter **Exportera**.
Knappen flyttade från headern till en egen rubrik längst ner i vänsterpanelen
(under Kapitel/Ta bort-listan, samma nivå som Inställningar/Brainstorm/
Synopsis/Dispositioner ovanför kapitellistan); klick öppnar samma sorts
dockade ruta som Stats, inte en egen modaltyp. Två nya format utöver
Markdown/RTF/ODT: **HTML** (en fristående sida, inbäddad CSS, öppnas i
valfri webbläsare) och **ePub** (EPUB 3 — `META-INF/container.xml`,
`content.opf`, `nav.xhtml`, ett xhtml-kapitel per bokkapitel plus
titelsida/synopsis/Story Bible-sida när de finns). Ingen ny beroende:
epub-paketeringen återanvänder samma noll-beroende zip-writer
(`zipStore`/`crc32`) som redan byggde ODT, `mimetype` läggs okomprimerad
som första post precis som OCF/EPUB kräver. Samma `ManuscriptExport`
mellanformat som redan matade Markdown/RTF/ODT matar nu HTML och ePub
också — ingen egen datamodell för de nya formaten. PDF är inte med i den
här omgången (öppen fråga, se §11).

**Ändringslogg v0.7 → v0.8:** Kapitelhistorik (`proseHistory.ts`,
`proseDiff.ts`, `ChapterHistoryCard.tsx`). Varje skrivjobb på ett
kapitel — Draft, Recast, Extend, Elaborate, Rewrite, och Återställ sig
själv — snapshottar prosan **som den var innan jobbet körs**, nyast
först, till en per-kapitel `revisions`-lista på `Chapter`
(`ProseRevisionSchema`: `id`, `at`, `op`, `prose`; `op` är
`draft | recast | extend | elaborate | rewrite | restore`). Historik-kortet
visar valfri version sida vid sida mot en annan (eller mot "nu",
`LIVE_HISTORY_ID`) med ord-nivå-diff — Myers shortest-edit-script, samma
algoritmfamilj som `git diff`, tokeniserar ord + mellanslag så
återskapning blir exakt. **Återställ hoppar prosan till den valda
versionen, men skriver aldrig över tyst:** om det som står nu skiljer
sig från målet sparas det aktuella som en ny `restore`-rad i historiken
först — inget försvinner utan att själv få en rad man kan hoppa tillbaka
till. Antal sparade versioner per kapitel är inställningsbart
(**Versions per chapter**, 3–50, default 12, `localStorage`); äldsta
faller bort vid taket (FIFO), aldrig en rad man aktivt bad om.
Direkt svar på en öppen fråga från v0.7: det här är precis den
säkerhetsnivå (jämför-före-återställ, inget tyst overwrite) som nu
efterfrågas för den planerade kapitel-import-funktionen (§11) också —
samma mönster kan återanvändas där när den byggs.

**Ändringslogg v0.6 → v0.7:** Kampanj → bok är inte längre helt parkerad —
en första, medvetet lossy bit finns nu på **Sandbox-sidan**. Sandbox
Storyboard (ett fritt canvas där kampanjens scener är kort man kopplar
med pilar — se `storyboardLinks.ts`) kan gruppera scener till namngivna
**kapitel** och exportera **kapitel-skal** som JSON
(`sandbox-storyboard-chapters`, format 1): `{ id, title, sequence_index,
brief }` per kapitel, `brief` ihopsatt av de grupperade scenernas namn,
Trigger-innehåll och Pre-defined Reply-etiketter — skrivinstruktion, inte
prosa, samma "kapitel-skal, ingen text"-gräns som redan gäller Export
cards åt andra hållet. Ingen importer finns här än (§11, §12) — filen
är byggd för att kunna läsas in som nya kapitel (titel + brief, ingen
`NarrativeFact`), men inget läser den ännu. Story-flaggor (`storyFlags`,
när Sandbox-scener kräver att ett villkor finns/saknas) och ett nytt
`CheckEngine` för d20-baserade föremålsförsök stannar helt inom RPG-appen
— `rpg.*`, korsar inte gränsen, nämns här bara för fullständighetens
skull.

**Ändringslogg v0.5 → v0.6:** ytorna runt texten. UI på engelska, svenska
och norskt bokmål. JSON-backup som appen kan läsa tillbaka, plus
Markdown/RTF/ODT. Sök/ersätt. **Reader** (ålder på manus och kapitel)
retunerar sällsynta ord, meningslängd och Analyze. Borttagna kapitel:
X flyttar till en sektion i manuset, Återställ tar tillbaka, ett andra
kast tar bort för gott. **Dispositioner** är ett rutnät av kapitelkort —
samma brief, samma `sequence_index`. **Brainstorm** är fria lappar (färg,
dra); en kolumn till höger skickar valda lappar till synopsis och tar
bort dem från kladden. Lift-overlayn är borta. Ljust/mörkt. **Export
cards** skickar låsta karaktärer, platser och föremål till Sandbox-hyllor.
Kampanjutkast (You, redan hänt / spelbar scen) är inte byggt.

**Ändringslogg v0.4 → v0.5:** skrivloopen har två modeller. **Writing**
(Stheno som default) tar Draft, Recast, Extend, Elaborate, Rewrite och
Brainstorm Ask. **Review** (Qwen-instruct som default) tar Extract, word
swap, menings- och styckebrytning, och **Analyze**. Analyze är opt-in,
aldrig omskrivning, aldrig Brainstorm, aldrig faktamutation. Flaggar
citat i fyra kategorier (show vs tell, dialogue, voice, character).
Statsytan har Directness / Pacing / Vocabulary plus Echo, upprepad fras,
POV-läcka och packade stycken. Rare-markering + högerklick för synonymförslag mot
Review. Apparna ligger som syskon på GitHub
(`ocedo-apps/StoryBook-AI`, `ocedo-apps/Sandbox-AI`). Inga molnnycklar —
lokal Ollama. Manus bor i IndexedDB, inte i git. JSON-backup och
dokumentexport, sök/ersätt och Reader kom i v0.6.

**Ändringslogg v0.3 → v0.4:** skrivloopen har en kamera och en
explicit recast. Manuset har POV, tempus och viewpoint; kapitlet kan
ärva eller överstyra. Det är skrivinstruktion, inte Story Bible.
Dropdowns skriver inte om befintlig prosa — **Recast prose** är opt-in
och recastar bara det öppna kapitlet, samma händelser och ordning.
**Continues from** styr vilken tidigare kapitelprosa Draft får se
(föregående / namngivet kapitel / ny strand), inte kanon. Generatorn har
en stående styckeregel: nytt stycke när fokuset skiftar mellan handling,
bakgrund och inre tanke. Användarens namn på sanningen är **Story Bible**,
aldrig “Bible”.

**Ändringslogg v0.2 → v0.3:** produktprioritet vänd. StoryBook AI är en
fristående skrivapp (`D:\StoryBook_ai`), inte en del av Sandbox AI.
Primärt: hjälp att skriva prosa mot en Story Bible. Därefter, senare:
export av en *kampanjgrund* till Sandbox (hyllor + Campaign Builder-utkast,
aldrig en live-`Session`). Kampanj → bok parkeras. I den här appen *är*
`NarrativeFact` intern sanning (Story Bible). Mot Sandbox förblir den en
gränsprojektion vid explicit export.

**Ändringslogg v0.1 → v0.2:** tre klargöranden från RPG-motorns perspektiv,
inga arkitekturomtag. (1) `NarrativeFact` är en gränsprojektion mot RPG:t,
inte delad runtime-sanning — `Session`/`StateEngine` förblir orört.
(2) Namnkollision löst: `ConsistencyGate`, inte `AuthorityResolver`.
(3) Explicit lista över vad som INTE korsar gränsen.

---

## 1. Vision

Ett open source-ekosystem av två syskonapplikationer — en AI-driven RPG-motor
och ett AI-driven bokskrivningsverktyg — som delar en gemensam,
motorneutral sanningsmodell för narrativa fakta. Målet är inte att
konkurrera kommersiellt, utan att bygga ett fritt alternativ som **kvalitetsmässigt
kan mäta sig med** de kommersiella och ledande open source-verktygen på
marknaden, med en konkret bonus-egenskap ingen av dem har: möjligheten att
konvertera mellan en spelad kampanj och en skriven bok.

**Grundprincip, ärvd från RPG-motorn och gällande båda apparna:**
Systemet äger sanningen, AI:n föreslår, människan (spelare eller författare)
har alltid sista ordet. AI:n får aldrig tyst motsäga något som redan är
etablerat.

---

## 2. Vad detta INTE är

- Inte ett försök att bli störst eller mest funktionsrikt — kommersiell
  konkurrenskraft är uttryckligen inte målet.
- Inte ett verktyg för att generera hela verk från en enda prompt (jfr.
  Inkfluence/Talefy-stilen) — det motsäger grundprincipen om
  människan-har-sista-ordet.
- Inte marknadsfört eller designat kring att mata in tredjepartsverk
  (se §8, Upphovsrätt).

---

## 3. Systemöversikt

**Viktigt (v0.2-korrigering av v0.1):** `narrative-core` är INTE ett
fundament någon av apparna byggs på ovanpå — det är en gräns-integration
som anropas vid explicita konverteringstillfällen. RPG-appens egen
sanningskälla (typad, Zod-validerad `Session`, muterad enbart via
`StateEngine`, läst av `ContextEngine`/`LayerEngine`/Inspector via typade
dot-paths) förblir precis som idag, helt orörd. `NarrativeFact` läggs
aldrig in under den.

```
┌────────────────────────────┐        ┌──────────────────┐
│   RPG-app                    │        │   Bokverktyg-app   │
│                               │        │                     │
│  Sanningskälla: Session       │        │  Sanningskälla:      │
│  (Zod, StateEngine-ägd,       │        │  Story Bible /        │
│  ContextEngine/LayerEngine/   │        │  NarrativeFact         │
│  Inspector läser dot-paths)   │        │  (kan vara direkt       │
│                               │        │  intern här — se not)   │
└──────────┬────────────────────┘        └─────────┬─────────┘
           │                                          │
           │ projectToNarrativeFacts()                │
           │ — körs EN GÅNG vid explicit               │
           │   "exportera till bok"-handling            │
           │ — läser bara core.*-värdiga fält            │
           │ — speglar ALDRIG löpande spel                │
           ▼                                              │
   ┌───────────────────────────────────────────┐         │
   │           narrative-core (integration)       │◄────────┘
   │                                               │
   │  • NarrativeFact — GRÄNSPROJEKTION,           │
   │    inte delad runtime-sanning                 │
   │  • Namnrymdade predikat (core/rpg/book)       │
   │  • ConsistencyGate (fd "AuthorityResolver" —  │
   │    se §5 för namnbytet)                        │
   │  • Story-clock-validator                      │
   │  • Konverteringsfunktioner (kampanj↔bok)       │
   │                                               │
   │  Definierar men implementerar INTE:            │
   │  FactExtractor / ConflictReasoner / Novelizer  │
   │  (LLM-beroende adapters, appspecifika)         │
   └───────────────────────────────────────────┘
           ▲
           │ projectFromNarrativeFacts()
           │ — AI föreslår rpg.*-berikning (stats,
           │   position) som aldrig fanns i boken
           │ — människa godkänner innan det blir
           │   riktigt RPG-sessionstillstånd
```

**Not för bokverktyget (v0.3, nu implementerat så):** `NarrativeFact` *är*
bokverktygets Story Bible. Mot Sandbox förblir den en exportprojektion vid
ett explicit senare steg. Asymmetrin är avsiktlig.

Apparna är syskon, två repon. StoryBook AI körs fristående (port 5175):
https://github.com/ocedo-apps/StoryBook-AI
Sandbox AI (port 5173):
https://github.com/ocedo-apps/Sandbox-AI

**Export cards** skickar låsta kort till Sandbox **Import backup** (hyllor,
inte en live-`Session`). Kampanjutkast byggs inte än.

---

## 4. Kärndatamodell: `NarrativeFact`

Full spec i `narrativefact-schema.md`. Sammanfattning:

- En enda fakta-tabell delas av båda apparna. `entity_ref` är samma rad
  oavsett app.
- Predikat är namnrymdade: `core.*` (läses av båda), `rpg.*` (bara
  RPG-projektionen), `book.*` (bara bok-projektionen). Detta löser
  schemakrocken mellan spelets tunga objekt/rum/relations-fält och
  bokens lättare karaktärsbibel utan att bygga två separata modeller.
- Fakta raderas aldrig — de efterträds (`superseded_by`), vilket ger
  gratis undo och en historik som story-clock-validatorn kan läsa.
- `story_position.sequence_index` ger en motoroberoende, monoton
  tidsordning oavsett om käll-eventet var en spelsession/turn eller ett
  kapitel/scen.

### 4.1 Explicit gräns: vad som INTE korsar över (tillagt v0.2)

Den delade ytan är smalare än v0.1:s diagram antydde. Följande stannar
kvar i RPG-appen, representeras aldrig i `NarrativeFact`, och förväntas
INTE överleva en kampanj→bok→kampanj-cykel — de återskapas manuellt i
RPG-appen vid bok→kampanj-konvertering, inte rekonstrueras från fakta:

- Layer-systemet (core/relationship/environment/state-trigger-lager,
  `once`/`hasFired`/`sinceLayerFired`/`deferWhileSensitive`)
- Session State Machine, turordnings-idempotens
- Party-systemet (My Party/Prospects/Stay/Come)
- Once-beats
- Regelsystemets attributdefinitioner och bandlogik (hög/låg/mitten-
  betydelser, `maxShift`, `isWarmBeat`)
- Story-clock/förfluten-tid-spårning, om/när det byggs

**Vad som faktiskt korsar gränsen** är: karaktärsidentitet och historia,
etablerade världs-/plats-fakta, relationshistorik (den *narrativa* faktan
att förtroende utvecklades på ett visst sätt — INTE de levande numeriska
förtroende-/förtrogenhet-/spänningsfälten själva, som är RPG-mekaniska),
samt plothändelser. `core.*`-fakta är den faktiska delade ytan; `rpg.*`-
och `book.*`-namnrymderna finns just för att merparten av respektive apps
egen mekanik inte ska och inte bör generaliseras.

---

## 5. Valideringsgrind: `ConsistencyGate` (fd "AuthorityResolver" — namn ändrat i v0.2)

**Namnbyte, ingen funktionsändring:** RPG-motorn har redan en egen,
befintlig `AuthorityResolver` — en synkron källa+lås-kontroll utan
historiksökning eller LLM-anrop, körd per mutation. Den nya
konsistensmekanismen som beskrivs nedan och i `authority-resolver-design.md`
är en **annan, orelaterad mekanism** som råkade få samma namn i v0.1. Den
heter från och med v0.2 **`ConsistencyGate`**. Läs `authority-resolver-design.md`
med den namnersättningen i huvudet — designen och de fyra utfallen är
oförändrade, bara namnet skiljer sig.

- `ConsistencyGate` lever i `narrative-core`, verkar bara på
  `NarrativeFact`-kandidater som produceras vid konvertering (eller vid
  författande i bokverktyget).
- Den är **inte** kopplad till RPG-motorns turordningsloop som standard.
  RPG-appens befintliga per-mutations skrivbehörighetskontroll (dess egna
  `AuthorityResolver`, `LockManager`, etc.) påverkas inte och ändras inte.
- Om djupare plot-konsistenskontroll för levande RPG-spel önskas senare är
  det en separat, opt-in framtida integration — inte något som ska glida
  in som standard bara för att `ConsistencyGate` redan finns.

Körs per kandidatfakta efter Pass 2-extraktion, innan commit:

- Tre-stegs filter för att hålla lokal LLM-belastning låg: (1)
  deterministisk kandidatsökning, (2) strukturell jämförelse, (3)
  LLM-resonemang — bara steg 3 kostar en modellrunda, och bara för
  kandidater som klarat sig förbi 1–2.
- Fyra utfall: auto-approve, giltig förändring, flaggad konflikt
  (default), tvingad omskrivning (opt-in, medvetet INTE default — se
  §9 för resonemanget om varför osynlig auto-omskrivning avvisades).
- Detta är den funktionella kärndifferentieringen mot Sudowrite/
  Novelcrafter (som saknar enforcement helt) och delvis mot Novarrium
  (som har prevention+verification men, baserat på tillgänglig
  information, oklar author-in-the-loop-granularitet och ingen synlig
  event log/undo).

---

## 6. Modellstrategi (lokal-first)

Två dropdowns under **Inställningar**, implementerat:

- **Writing / Generator** (default `stheno-custom:latest`) — Draft,
  Recast, Extend, Elaborate, Rewrite, Brainstorm Ask. Optimerad för
  prosaröst, inte för strikt JSON. **Startprompt** (Primer) ligger
  framför varje skrivjobb; defaulttexten gäller tills författaren
  ändrar den per modell. Tom primer = bara jobbets regler.
- **Review / Extraktor-Granskare** (default `qwen2.5-coder:7b`, väljer
  Qwen-instruct om den finns i listan) — Extract facts, word swap,
  menings- och styckebrytning, Analyze. Optimerad för schema och
  omdöme.

Sekventiell körning, inte simultan — bokverktyget är draft-and-review,
inte live-streaming. Inga moln-API-nycklar. Deterministisk
pre-filtrering (ConsistencyGate steg 1–2) minskar antalet LLM-anrop per
kapitel. Steg 3 (LLM-resonemang) är inte kopplat i v1 av skrivappen —
motsägelser är samma entity + predikat + annat värde.

---

## 7. Pipelines

**Skrivloopen (v1, det som finns nu):**
Generatorn skriver prosa mot synops, låsta `core.*`-fakta, kapitelbrief,
löst kamera (POV / tempus / viewpoint), Reader och — vid Draft — slutet av
det kapitel **Continues from** pekar på. Brainstorm läses aldrig.
Författaren redigerar. **Recast prose** är ett separat, opt-in jobb: samma
kapitel, ny kamera, ingen ny plot. `extractFactsFromProse` föreslår
kandidater.
`ConsistencyGate` (steg 1–2) auto-godkänner dubbletter, föreslår ny fakta,
flaggar motsägelser. Författaren låser eller avvisar. Avvisade förslag som
aldrig blev sanning tas bort; låsta rader efterträds. **Analyze** är en
tyngre Review-pass på det öppna kapitlet: citat + note, ingen omskrivning.

Jobb mot prosa, plus backup och kort-export:

- `draftChapter` / passage-rewrite (Extend, Elaborate, Rewrite) — Writing.
  Rewrite-chips fyller instruktionen (POV-läcka, starkare verb, aktiv form,
  visa/berätta, lång mening). De kör inte omskrivningen av sig själva.
- `recastChapter` — Writing. Befintlig kapitelprosa till den *aktuella*
  kameran. Körs inte när dropdowns ändras.
- Word swap, sentence split, paragraph break — Review, punktoperationer.
  Författaren redigerar förslaget och klickar Use. Ingen statisk tesaurus.
- `analyzeChapter` — Review, opt-in. Fyra kategorier: `show_vs_tell`,
  `dialogue_purpose`, `voice_drift` (hoppas över om Voice är tom),
  `character_fidelity`. Aldrig Brainstorm. Aldrig faktarader. Inverterade
  flaggor (noten medger att raden redan visar / avslöjar karaktär) slängs.
- **Korrekturläsning** — Review, opt-in, hela manuset. I vänsterlisten
  under Kapitel, sist i kedjan Inställningar → Brainstorm → Synopsis →
  Dispositioner → Kapitel. Inte ett låst steg. Grammatik/stavning,
  samma händelse i olika ord (lokal kandidat + modell), stil mellan kapitel,
  åldersrapport mot Reader. Citat och not, ingen omskrivning. Progress och
  resultat sparas på boken i IndexedDB så en stängd flik kan fortsätta.
  Aldrig Brainstorm.
- `extractFactsFromProse` — Review, efter accepterad prosa.
- Stats (Tier 1) — deterministiskt: Directness, Pacing, Vocabulary,
  Echo, upprepad fras, POV-läcka, packade stycken, Rare-markering. Klick på
  Echo eller upprepad fras öppnar Sök med ordet. Ingen modell.
- Sök/ersätt, JSON-backup, **Publicera** (Markdown/RTF/ODT/HTML/ePub/PDF) —
  ingen modell. Sök har snabbsökningar för upprepade ord och fraser på
  den öppna sidan.
- `projectFactsToCampaign` — senare. Läser `core.*`, föreslår `rpg.*`,
  skriver hyllor + Campaign Builder-utkast. Aldrig en live-`Session`.
  Första skivan är **Export cards** (karaktärer, platser, föremål).

### 7.1 Kamera, recast och skrivinstruktion (v0.4)

Det som styr *hur* texten skrivs är inte Story Bible. Följande är
skrivinstruktion och ska inte låsas som `NarrativeFact`:

- kapitelbrief
- POV, tempus, viewpoint (manusdefault + kapitel-override)
- Continues from
- Voice (ton, inte kamera)
- **Prosans språk** — vilket språk meningarna skrivs på. Inte UI-språk.
  Tomt gissar från synopsis, brief och befintlig prosa.
- Reader — vem prosa och granskning ställs mot. Inte kanon. Manuset sätter
  default; kapitlet kan överstyra. En 12-åring retunerar sällsynta ord,
  meningslängd och Analyze; den skriver inte om boken till barnbok av sig
  själv. Tom Reader lämnar den vuxna Dale–Chall-basen.

**Kamera.** Manuset sätter default, på **Inställningar** (första steget
i vänsterlisten). Kapitlet ärver tills författaren
överstyr. Limited och first person kräver viewpoint. Draft, Extend,
Elaborate och Rewrite honorar den lösta kameran. Voice beskriver röst,
inte person eller tempus. Prosans språk ligger på Inställningar, skilt
från sidans språk i headern. Writing- och Review-modellerna ligger där
också.

**Recast.** Ändrad kamera lämnar befintlig prosa orörd tills författaren
ber om **Recast prose**. Då skrivs *det öppna kapitlet* om: samma
händelser, ordning, namn och betydelse; inga nya scener eller fakta;
ingen bortklippt plot. Fel återställer originalet. Stop behåller det som
hunnit komma. Recast körs inte över hela manuset.

**Continues from.** Default är föregående kapitel i listan. Ett namngivet
tidigare kapitel byter strand. *None* öppnar en ny. Draft får slutet av
den valda prosan (några sista stycken), inte hela boken. Det är kontext
för generatorn, inte ett påstående i Story Bible. Namngivna trådar kan
visas i kapitelvyn.

**Dispositioner.** En yta där varje levande kapitel är ett kort med samma
brief som Draft redan läser. Flytta korten: `sequence_index` följer med.
Inte en extra synopsis per kapitel.

**Brainstorm-lappar.** En lapp per idé, fritt på tavlan, valfri färg.
Ask lägger svaret på en ny lapp. Dra till kolumnen **Till synopsis**;
ordningen där är styckeordningen. **Skicka till synopsis** limmar text
på kartan, tar bort de lapparna från kladden och öppnar synopsis.
Tomma lappar stannar. Det som ligger kvar på tavlan är privat.

**Stycken.** Generatorn får en stående regel: ett stycke får vara långt
om ett motiv håller det; nytt stycke när fokuset skiftar mellan handling,
bakgrund och inre tanke. Statsytan kan flagga packade stycken och föreslå
en redigerbar brytning. Visuellt gap mellan stycken, inte tomma rader i
texten.

**Bok → kampanjgrund (senare, medvetet lossy):**
Karaktärer, platser som namngivna kort, premiss, lore. Författaren märker
plothändelser som *redan hänt* / *spelbar scen* / *låt bli*. Rumsgraf,
You, rule-set och party återskapas i Sandbox.

**Kampanj → bok:** export av kapitel-skal finns nu på Sandbox-sidan
(Storyboard → gruppera scener i kapitel → **Export chapters**, se
ändringslogg v0.7). Ingen importer här än — den här appen läser inte
filen, och `NarrativeFact` skapas inte av den. Fortfarande inte v1 på
skrivapps-sidan.

---

## 8. Upphovsrätt och avsett bruk

Arkitekturen gör importfunktionen källagnostisk av nödvändighet — den kan
tekniskt extrahera en Story Bible/kampanj ur vilken text som helst,
inklusive tredje parts skyddade verk. Det är inte en brist att designa
bort tekniskt (en spärr skulle vara lätt att kringgå och skulle straffa
legitima användare som importerar sina egna verk), utan en fråga om
**avsett bruk och kommunikation**:

- Verktyget dokumenteras och marknadsförs som avsett för egna verk.
- En bekräftelsedialog vid import ("du intygar att du har rätt att
  använda denna text") — medveten bekräftelse, inte teknisk spärr,
  samma mönster som många verktyg använder för känsligt AI-genererat
  innehåll.
- Ren privat, lokal användning är ett annat läge än att bygga eller
  marknadsföra en distribuerad tjänst kring tredjepartsverk — det
  senare undviks uttryckligen som produktidentitet.

---

## 9. Medvetna designval och avvägningar

Dokumenterade här så de inte glöms bort eller omprövas av misstag:

- **Author > AI, alltid.** Enklare hierarki än RPG-motorns
  player/AI-uppdelning eftersom det inte finns någon spelare att skydda
  från AI:n i bokläget — bara en författare med full auktoritet.
- **Flaggad konflikt är default, inte tvingad omskrivning.** Osynlig
  auto-omskrivning (vilket Novarrium verkar göra) bedöms motsäga
  author > AI-principen. Tvingad omskrivning finns kvar som opt-in för
  den som vill ha mindre friktion.
- **Bok→kampanj är inte lovad som symmetrisk.** Att sälja in det som
  friktionsfritt vore missvisande — det kräver genuint mänskligt
  beslutsfattande (särskilt kring förgreningspunkter) som inte kan
  automatiseras bort.
- **Objekt/rum/relationsschemat från RPG:t transfereras INTE rakt av**
  till bokens karaktärsbibel — det är för tungt. Lösningen är
  namnrymdade predikat snarare än ett gemensamt tungt schema.
- **Skrivinstruktion är inte kanon.** Brief, POV, tempus, viewpoint,
  Continues from, Voice och Reader styr generator och granskning.
  De är inte `NarrativeFact`. Story Bible rymmer atomära påståenden om världen.
- **Kameraändring recastar inte tyst.** Dropdowns är inställning.
  Omskrivning kräver Recast, per kapitel. Samma skäl som mot osynlig
  auto-omskrivning i ConsistencyGate: författaren har sista ordet.
- **Historik skriver aldrig över tyst (v0.8).** Återställ till en
  tidigare version sparar först det som redan stod där som en ny rad,
  om det skiljer sig — samma "författaren har sista ordet, inget
  försvinner osynligt"-princip som Recast och ConsistencyGate. Det är
  också mönstret den framtida kapitel-importen (§11) ska följa, inte
  en tyst overwrite.
- **Brainstorm är privat.** Ask och skicka-till-synopsis är författarens
  scratch. Draft, Recast, Extract och Analyze läser det aldrig. En lapp
  blir handling först när den landar på kartan.
- **Analyze skriver inte om.** Citat + note. Författaren har sista ordet.
  Introt i notes-rutan: *The review tries to find lines that neither
  reveal the character’s personality nor drive the scene forward.*
- **Inga molnnycklar.** Lokal Ollama. Manus i IndexedDB, inte i git.
- **All text till författaren måste vara tydlig och enkel (2026-09-25).**
  Hellre en mening för mycket än text man måste fundera över — gäller
  knappar, felmeddelanden, hjälptexter, guiden, allt. Inga
  utvecklartermer (API, CORS, "OpenAI-kompatibel" osv.) i
  författarvänd text utan att först förklaras i vanligt språk. En
  stående regel för allt nytt som skrivs, inte en engångsstädning.

---

## 10. Konkurrensläge (referens)

| | Sudowrite | Novelcrafter | Novarrium | AuthorAgent (OSS) | Detta projekt |
|---|---|---|---|---|---|
| Faktautvinning | Manuell | Manuell | Automatisk | Automatisk | Automatisk |
| Enforcement/avvisning | Nej | Nej | Ja (påstått) | Ja (diff+evidens) | Ja, med explicit gate |
| Författargodkännande innan lås | N/A | N/A | Oklart | Oklart | Explicit steg |
| Event log / undo på fakta | Nej | Nej (dokumentversionering) | Oklart | Oklart | Ja |
| Lokal-first | Nej | Delvis (BYOK) | Nej | Ja | Ja |
| Koppling till spelmotor | Nej | Nej | Nej | Nej | **Ja — unik vinkel** |
| Licens | Kommersiell | Kommersiell | Kommersiell | MIT (OSS) | Open source |

AuthorAgent är den närmaste jämförelsepunkten på ren
konsistens-funktionalitet. Projektets faktiska differentiering ligger
därför tydligast i (a) den explicita författar-godkännande-/event
log-arkitekturen och (b) RPG-kopplingen, som ingen granskad konkurrent
(kommersiell eller OSS) har.

---

## 11. Öppna frågor / kvarstående beslut

- **Flaggningströskel** i praktiken: extraktorn är snäv (bara påstådda
  fakta). Empiri mot riktiga kapitel avgör om den är för tyst eller för
  högljudd. Analyze mot Qwen är densamma frågan — filter fångar inverterade
  flaggor, inte dåligt hantverksomdöme i grunden.
- **LLM-steg 3 i ConsistencyGate** (semantiska motsägelser som inte är
  samma predikat+värde) — inte v1.
- **Bok → kampanjgrund:** UI för *redan hänt / spelbar scen / låt bli*,
  och mapping mot realm/landmark/focal. Inte nu. Export cards täcker
  bara låsta kort.
- **Kampanj → bok, importsidan:** läsa Sandbox `sandbox-storyboard-chapters`-
  JSON här och skapa kapitel-skal (titel + brief i det befintliga
  `Chapter`-fältet, `sequence_index` från filen, ingen prosa). Inte
  byggt. Filformatet finns redan (Sandbox-sidan, v0.7); det är bara
  läsvägen in i den här appen som saknas. Säkerhetsmönstret finns
  redan att återanvända (v0.8 kapitelhistorik): jämför mot vad som
  redan finns innan import, skriv aldrig över tyst — en importerad
  kapitel-skal som råkar dela titel med ett befintligt kapitel bör
  landa som en ny `revisions`-rad eller ett eget nytt kapitel, aldrig
  en tyst overwrite av `prose`.
- `sequence_index` är kapitelordning i boken. Det är inte RPG:ts
  story-clock.
- **ODF utöver ODT** (t.ex. kalkyl/presentation-varianter): inte
  efterfrågat, inget beslut att fatta förrän det är. PDF är löst (v0.10,
  `pdf-lib`).
- **Progress & Momentum, resten av förslaget** (v0.15 byggde bara
  ordmål + pace): Milstolpar-tidslinje (kräver `NarrativeFact.locked_at`
  — se v0.15-loggen), Sessionsräknare (ny state: en räknare, debounce
  så navigering inom ett sittande pass inte dubbelräknar), en
  "Fortsätt"-panel på Hem (förslag ur manusstatus, aldrig blockerande).
  Ordning beslutad om/när de byggs: Milstolpar → Sessioner → Fortsätt.
- **Engångs-startgrind** (samma förslag, punkt 5): ett medvetet avsteg
  från "karta, inte grind"-principen, ska INTE byggas som en
  självklar del av ovanstående. Lutar mot nej eller en mjukare variant
  via `openingSurface()` istället för en egen blockerande skärm — inte
  avgjort.

---

## 12. Nästa steg

Skrivappen är igång som fristående Vite/React-app (port 5175), syskon till
Sandbox på GitHub. Kamera, Recast, Continues from, dual models, Stats,
Analyze, Proofread, backup, Publicera (Markdown/RTF/ODT/HTML/ePub/PDF, sist i
vänsterpanelen efter Korrektur, v0.11; fyra valbara OFL-typsnitt utöver
standardutseendet, v0.12), Framsteg (ordmål + omräknande pace i headern,
v0.15), sök/ersätt, Reader, borttagna kapitel, Dispositioner,
Brainstorm-lappar och
kapitelhistorik (v0.8, diff + säkert återställ) finns. Sandbox-sidan har nu ett
Storyboard (scenkopplingar, story-flaggor) och kapitel-export
(kapitel-skal som JSON, v0.7) — se ändringsloggen. Nästa produktsteg här
är kampanjexport, inte mer skrivhjälp:

- `projectFactsToCampaign` — You, *redan hänt* / *spelbar scen* / *låt bli*.
- Läsa Sandbox kapitel-skal-JSON in som nya kapitel här (den nya
  öppna frågan i §11) — ett mindre, fristående steg som kan tas
  oavsett `projectFactsToCampaign`.
- Polering som väntar, inte v1: färgfilter på lappar, send-kolumn på smal
  skärm, modellomskrivning av det som skickas till synopsis.
