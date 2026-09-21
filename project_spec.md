# Project Spec — Open Source Narrative Engine (RPG + Bokverktyg)

Status: living document, v0.7
Relaterade dokument: `narrative-core-addendum.md` (v0.2-beslut)

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
- Sök/ersätt, JSON-backup, Markdown/RTF/ODT — ingen modell. Sök har
  snabbsökningar för upprepade ord och fraser på den öppna sidan.
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
- **Brainstorm är privat.** Ask och skicka-till-synopsis är författarens
  scratch. Draft, Recast, Extract och Analyze läser det aldrig. En lapp
  blir handling först när den landar på kartan.
- **Analyze skriver inte om.** Citat + note. Författaren har sista ordet.
  Introt i notes-rutan: *The review tries to find lines that neither
  reveal the character’s personality nor drive the scene forward.*
- **Inga molnnycklar.** Lokal Ollama. Manus i IndexedDB, inte i git.

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
  läsvägen in i den här appen som saknas.
- `sequence_index` är kapitelordning i boken. Det är inte RPG:ts
  story-clock.

---

## 12. Nästa steg

Skrivappen är igång som fristående Vite/React-app (port 5175), syskon till
Sandbox på GitHub. Kamera, Recast, Continues from, dual models, Stats,
Analyze, backup/export, sök/ersätt, Reader, borttagna kapitel,
Dispositioner och Brainstorm-lappar finns. Sandbox-sidan har nu ett
Storyboard (scenkopplingar, story-flaggor) och kapitel-export
(kapitel-skal som JSON, v0.7) — se ändringsloggen. Nästa produktsteg här
är kampanjexport, inte mer skrivhjälp:

- `projectFactsToCampaign` — You, *redan hänt* / *spelbar scen* / *låt bli*.
- Läsa Sandbox kapitel-skal-JSON in som nya kapitel här (den nya
  öppna frågan i §11) — ett mindre, fristående steg som kan tas
  oavsett `projectFactsToCampaign`.
- Polering som väntar, inte v1: färgfilter på lappar, send-kolumn på smal
  skärm, modellomskrivning av det som skickas till synopsis.
