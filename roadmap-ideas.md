# Roadmap-idéer — författarverktygets djup

Status: levande dokument, v1.0 (2026-09-24)
Källa: samtal mellan författaren, ChatGPT och kodnings-AI om vad som är ett
bra verktyg för en författare, jämfört mot StoryBook AI:s faktiska läge.
Relaterat dokument: `project_spec.md` (§1, §9, §10, §12 särskilt relevanta).

Syftet med det här dokumentet är att **bevara idéerna**, inklusive de som
inte prioriteras nu eller inte alls — inte att vara ett bindande löfte om
vad som byggs. Ordningen nedan är den vi kommit fram till tillsammans,
inte en ensidig lista.

## Läge just nu (uppdateras allteftersom)

| # | Punkt | Läge |
|---|-------|------|
| 1 | AI Context Inspector | ✅ byggd (v0.69) |
| 2 | Story Bible: History-vy | ✅ byggd (v0.70) |
| 3 | Story Bible: Mentions v1 | ✅ byggd (v0.71) |
| 4 | Model-provider-abstraktion | ✅ byggd (v0.72, Settings-UI v0.84) |
| 5 | Scene-migrering, "tråkig" v1 | ✅ byggd (v0.73) — datamodell fanns, scenindelning saknades |
| 5b | Minimal scen-delning/sammanslagning + arkitekturbeslutet låst | ✅ byggd (v0.81) |
| 6 | Fakta får scenproveniens | ✅ byggd (v0.74) |
| 6b | Sammanslagningsförslag för snarlika fakta | ✅ byggd (v0.77) |
| 7 | AI-pipelinen blir scen-medveten | ✅ byggd (v0.82) |
| 8 | Lokalt semantiskt index + Ask Manuscript | ✅ byggd (v0.75) |
| 9 | Story time + Timeline | ✅ byggd (v0.76) |
| 10 | Continuity 2.0 | ✅ byggd (kunskapsläckor v0.78, spatial kontinuitet v0.94) |
| 11 | Plotlines / scen-matris | ✅ byggd (v0.79) |
| 12 | Setup/payoff/ledtrådsspårning | ✅ byggd (v0.98) |
| 13 | Utvecklingsmetoder som pluggbart lager | ✅ byggd (v0.99) |
| 14 | Hel-manus developmental analys | ⬜ ej påbörjad |
| 15 | Klickbara namn i manuset → Story Bible | ✅ byggd (v0.97) |
| 16 | Tidsmedveten Story Bible | ✅ byggd (v0.87) |
| 17 | AI-skrivtics-markering | ✅ byggd (v0.95) |
| 18 | Character Interviews | ✅ byggd (v0.96) |
| 19 | Korrekturläsning: Faktakontroll-steg | ✅ byggd (v0.80) |
| 20 | Korrekturläsning: stil-steget kollar även känsla | ✅ byggd (v0.80) |
| 21 | Integrerad guide + snabbstart | ✅ byggd (v0.85) |
| 22 | "?"-genvägar från rubriker till guiden | ✅ byggd (v0.93) |
| 23 | Läsarålder som fasta nivåer + innehållsflaggning i Korrekturläsning | ✅ byggd (v0.91) |
| 24 | Positionsmedvetna Story Bible-fakta (story-tid, inte lässordning) | ✅ byggd (v0.99.25) — permanent understrykning för fakta-omnämnanden kvar, se nedan |
| 25 | Textformatering (fet/kursiv/understruken) i kapiteltexten | ⬜ ej påbörjad — avvaktar, se nedan |
| 26 | Dölj snabbstartskorten på förstasidan när en lokal AI redan är ansluten | ⬜ ej påbörjad — avvaktar, se nedan |

Plus det egna designspåret ("Det enda stora arkitekturbeslutet" nedan,
Scene/BookScene/NarrativeFact-gränsen) — ett öppet samtal, inte en
kodningspunkt, fortfarande inte moget.

---

## Den korrigering som ändrade allt

ChatGPTs ursprungliga analys utgick från att "Scene" saknas helt i
StoryBook AI-ekosystemet och föreslog att bygga den isolerat på
bokverktygssidan. Det stämmer inte fullt ut: **Sandbox-sidan (RPG-appen)
har redan ett Storyboard med scenkopplingar och story-flaggor** — ett
scen-grafskoncept, fast på RPG-sidan, byggt för kampanj→bok-export av
kapitel-skal (§7.1, §12 i `project_spec.md`).

Slutsatsen blev därför inte "författarfunktioner först, RPG-bryggan
senare" utan: **bygg de författarfunktioner som samtidigt gör
RPG-konverteringen mer naturlig.** Scene är en sådan funktion — RPG-scener
är redan scen-formade, så scen-granularitet i boken gör bryggan bättre,
inte sämre. Det är därför `SceneProjection` (bok-scen ↔ Sandbox
storyboard-kandidat) väۋs in parallellt med Scene-modellen istället för
att ligga som ett separat sista steg.

---

## Det enda stora arkitekturbeslutet — löst (v0.81)

ChatGPT granskade roadmapen (2026-09-24) och pekade på en verklig lucka:
`chapter.scenes` fanns i schemat sen v0.73 men skrevs aldrig till någonstans
— `chapterScenes()` härledde alltid exakt en scen från `chapter.prose`.
Statustabellens "✅ byggd" på punkt 5 var alltså optimistisk; brödtexten
under punkt 5/7 var redan ärlig om det, men raden i tabellen gav fel
intryck vid en snabb blick. Innan mer scen-byggande (setup/payoff,
tidsmedveten bibel, riktig spatial kontinuitet) behövde frågan faktiskt
besvaras:

> Vad är en Scene i StoryBook AI? Vad äger `BookScene` själv? Vad är
> `NarrativeFact`? Vad är bara skrivinstruktion? Och exakt vilken del av
> en Scene får korsa integrationsgränsen till Sandbox?

**Beslutet, byggt i v0.81 (`bookScene.ts`):**

- En Scene äger **bara en delningspunkt + metadata** — aldrig egen prosa.
  `chapter.scenes[]` lagrar `{ id, startParagraph, title?, brief? }`, där
  `startParagraph` är ett styckeindex i `chapter.prose`. Prosan för varje
  scen härleds alltid genom att dela `chapter.prose` vid de lagrade
  styckena — exakt samma "alltid färsk, aldrig en stale snapshot"-princip
  som `chapterScenes()` redan hade för fallet utan delningar. Ingen risk
  för att scen-text och kapitel-text glider isär, för det finns bara en
  sanning (`chapter.prose`) att glida ifrån.
- `title` och `brief` är skrivinstruktion, samma status som `chapter.brief`
  — inte kanon. `brief` är den enda av de två som stannar i boken;
  `title` är det enda scen-fält som någonsin är tänkt att korsa gränsen
  till Sandbox (`SceneProjection`, ej byggd än).
- `location_ref`, `entity_refs[]` och ett scen-eget `story_time` är
  **medvetet uteslutna** ur den här skivan — de väntar på en verklig
  konsument (spatial kontinuitet, en scen-nivå Timeline) istället för att
  byggas i förskott. Story Bibles befintliga `LOCATIONS`-flik och
  `entity_ref`-system är fortfarande den tänkta ankarpunkten den dagen
  `location_ref` byggs, inte ett nytt fritextfält.
- `NarrativeFact` förblir den enda kanon-lagret. En scen bär aldrig fakta
  direkt, bara `scene_id`-bakreferenser från fakta (redan byggt, punkt 6).

Redigeringsytan förblir oförändrad — `ProseCanvas` och kapitlets enda
textfält rör ingen av den här koden. En ny "Scener"-panel (kollapsad som
standard, öppen automatiskt när fler än en scen finns) sitter mellan
kapitlets kort-fält och prosan: namnge en scen, skriv dess brief, dela
den vid valfritt stycke, eller slå ihop den med nästa. Se punkt 5b.

---

## Kodningsordning — vad vi bygger, och i vilken ordning

### 1. AI Context Inspector ✅ byggd (v0.69)
En yta som visar exakt vad som skickas till modellen för det jobb som
körs: operation, modell, systeminstruktion, vilka delar av manus/Story
Bible/skrivinstruktion som är med, tokenantal, och en "Show raw prompt"-
knapp. **V1 är read-only** — inga kryssrutor för att slå av/på
kontextdelar än. Anledning: bygg inte ett konfigurationssystem innan
det är bevisat att författare faktiskt vill styra kontexten manuellt.

Varför nu, före Scene: litet, avgränsat, kräver inga schemaändringar —
läser bara de prompt-byggande funktioner som redan finns
(`illustrationPromptMessages`, Draft/Extend/Rewrite-motsvarigheterna).
Förstärker appens kärnprincip (Author > AI, transparens) direkt, medan
Scene-designfrågan ovan får ta den tid den behöver.

### 2. Story Bible: History-vy ✅ byggd (v0.70)
Nästan gratis. `NarrativeFact` har redan `chapter_id` och
`superseded_by`-kedjan på varje rad — UI:t blir i praktiken en ren
rendering av data som redan finns, ingen ny lagring.

### 3. Story Bible: Mentions v1 ✅ byggd (v0.71)
Skild fråga från History. "Visa alla fakta om Henrik" (History) är
inte samma sak som "visa alla gånger Henrik nämns i manuset"
(Mentions) — det senare kräver mention-detection. Görs billigt först:
normaliserad namn/alias-sökning (`Henrik`, `Henrik Andersson`, `Mr
Andersson`) över manus, ingen embedding. Semantisk träff ("hennes
äldre bror" utan att namnet nämns) är ett senare, separat steg —
se punkt 7.

### 4. Model-provider-abstraktion ✅ byggd (v0.72, Settings-UI v0.84)
`LocalModelProvider`-gränssnitt (`chat()`, `streamChat()`, `embed()`,
`supportsEmbeddings()`, `listModels()`, `healthCheck()`) med
`OllamaProvider` som första adapter, `OpenAICompatibleLocalProvider`
(LM Studio, llama.cpp-server m.fl.) som andra. Designas med
embeddings-behovet (punkt 7) i åtanke redan nu, så det inte behöver
byggas om senare. **Explicit regel, inte bara konvention:** endast
lokala endpoints — abstraktionen får aldrig tyst glida in i stöd för
molnleverantörer (OpenAI/Anthropic), det vore motsatsen till produktens
identitet (§9: "Inga molnnycklar").

Oberoende av Scene-arbetet, kan göras när som helst i kön.

**Uppdatering (v0.84):** `OpenAICompatibleLocalProvider` fanns byggd
och testad sen v0.72, men gick inte att faktiskt välja — appen skapade
alltid en `OllamaModelProvider` rakt av, på 16 ställen i `BookStore.tsx`.
Författare som frågade efter LM Studio-stöd kunde alltså inte få det
trots att koden redan klarade det. Åtgärdat: en "Motor"-väljare i
Inställningar (Ollama / LM Studio / annan lokal server), med ett
serveradress-fält som dyker upp för det senare alternativet. Alla 16
ställena går nu genom en enda `makeProvider()`-funktion som läser det
sparade valet — själva provider-klasserna är oförändrade, det var bara
tunnelseendet i `BookStore.tsx` som satt hindret i vägen. Modellistan
(Skriv/Review-väljarna) hämtas nu från vald motors endpoint
(`/api/tags` respektive `/v1/models`) och uppdateras automatiskt när
motor eller serveradress ändras.

### 5. Scene-migrering — "tråkig" v1 ✅ byggd (v0.73)
Ingen big bang. Första versionen bygger inte samtidigt Timeline, plot-
grid, scen-redigerare, continuity och nya AI-prompter. Bara:

```
Chapter
  scenes[]
```

med en migrering som gör befintlig `prose` till en enda inledande
scen — författaren ser i praktiken ingen skillnad direkt. Mönstret är
redan beprövat i den här kodbasen: `continues_from`, `discarded_at`
och `startImage` är alla `.optional()`-fält med "missing on older
saves"-migrering, och `parseBook()` kör redan en backfill-funktion
(`ensureBrainstormNotes`) vid inläsning. Samma disciplin gäller här.

Scenens fältyta växer sedan stegvis (title, brief, summary, pov,
viewpoint, tense, location_ref, story_time, entity_refs, plotline_ids)
— inte allt på en gång.

### 5b. Minimal scen-delning/sammanslagning + arkitekturbeslutet låst ✅ byggd (v0.81)
Uppstod ur ChatGPTs granskning av den här roadmapen: "scenmigrering byggd"
och "riktig scen-uppdelning saknas" är inte samma sak, och tabellraden
sa bara det första. Löste designfrågan (se "Det enda stora
arkitekturbeslutet" ovan) och byggde den minsta möjliga skrivbara
scen-ytan ovanpå den: `chapter.scenes[]` lagrar delningspunkter
(styckeindex i `chapter.prose`) plus valfri titel/brief per scen —
aldrig egen prosa, så kapitlets prosa förblir den enda sanningen. En ny
"Scener"-panel i kapitel-editorn (dold som standard tills en delning
finns) låter författaren namnge en scen, skriva en kort anteckning för
just den scenen, dela vid valfritt stycke eller slå ihop med nästa — allt
utan att röra `ProseCanvas` eller manusets enda textfält.
`chapterScenes()` (använd redan av Ask Manuscript, faktakontrollen i
Korrekturläsning m.fl.) märker inte av skillnaden: fallet utan delningar
fungerar exakt som innan.

### 6. Fakta får scenproveniens ✅ byggd (v0.74)
`NarrativeFact.scene_id` (optional, additivt, icke-brytande — precis
som `chapter_id` redan är). Ger utan LLM-anrop: när etablerades detta,
var etablerades det, vad var sant före/efter den här scenen, vad visste
läsaren vid den här punkten. Grunden för Continuity 2.0 (punkt 9).

### 6b. Sammanslagningsförslag för snarlika fakta ✅ byggd (v0.77)
Tillkom utanför ursprungssamtalet — författaren märkte att extraktorn
ibland skapar flera fakta under samma predikat som egentligen är
samma påstående, bara mer detaljerat ("Jeff is a captain" → "Jeff is
a captain on a space ship" → "Jeff is a captain on the Odyssey"), och
att var och en idag blir en egen konflikt att ta ställning till.
Deterministisk v1 (ingen AI-anrop): `isPossibleEnrichment()` i
`ConsistencyGate.ts` känner igen delsträngs-innehåll och hög
ordöverlapp mellan två värden under samma entitet+predikat. En
extraherad nästan-dubblett blir ett `is_merge_suggestion`-flaggat
fakta med det längre/mer detaljerade värdet förifyllt, istället för
en hård konflikt — granskningskön visar "Similar to: …" med en
"Slå ihop"-knapp (lugn grön ram) snarare än "Conflicts with…" (orange
larm). Genuint motsägande värden ("en rymdskeppskapten" vs "en
fånge") faller fortfarande igenom till den befintliga
konflikt-flaggningen, oförändrad. Detta är en liten, deterministisk
bit av det LLM-steg-3-territorium punkt 10 (Continuity 2.0) redan
pekar mot — inte ett substitut för semantisk motsägelseanalys, bara
den enkla delmängden som inte kräver ett modellanrop.

### 7. AI-pipelinen blir scen-medveten ✅ byggd (v0.82)
Extract facts stämplade `scene_id` redan från v0.74. Nu när riktig
scen-uppdelning finns (punkt 5b) kunde Draft, Recast och Analyze
byggas ut till att fungera på en enskild scen, inte bara hela
kapitlet — den sista delen av den här punkten.

Varje scenkort i "Scener"-panelen (bara synligt när kapitlet faktiskt
är delat i fler än en scen) fick tre knappar:

- **Skriv utkast (Draft)** för just den scenen — samma prompt-uppbyggnad
  som kapitel-varianten (Story Bible, Voice, Reader, synopsis), men
  "fortsätt från slutet" pekar bara på scenens egen text. Får dessutom
  ett stycke kontext om föregående scens sista rader och nästa scens
  första rader, så nya scenen varken upprepar eller motsäger sina
  grannar.
- **Omskriv (Recast)** kameran för bara den scenen.
- **Analysera (Analyze)** bara den scenens text — nyttigt i ett långt
  kapitel med många scener, då hela-kapitlet-analysen annars kan
  drunkna en enskild scens problem i mängden.

Den tekniska knuten var hur AI-resultatet skrivs tillbaka: en scen
äger ingen egen text (punkt 5b), bara en delningspunkt i
`chapter.prose`. Ny funktion `replaceSceneProse()` i `bookScene.ts`
löser det generellt — ersätter en scens del av kapitlets stycken och
flyttar alla senare sceners delningspunkter med exakt det antal stycken
som skillnaden blev. Både Draft och Recast strömmas precis som
kapitel-varianterna, med samma "sikt live medan modellen skriver"-känsla
— bara riktad mot scenens eget stycke-intervall i stället för hela
kapitlet.

**Uppdatering (v0.83):** luckan ovan — att fakta-extraktion stämplade
allt med den första scenens id — är täppt. Extract facts-knappen och
Korrekturläsningens faktasteg kör nu extraktionen en gång per scen
(inte en gång per kapitel) och stämplar varje förslag med just den
scenens id. `applyExtractorDrafts()` (redan byggd för att ta en
`scene_id`) anropas nu i en loop över `chapterScenes(chapter)` istället
för en gång med bara den första scenens id. Ett kapitel utan
delningar (den överväldigande majoriteten idag) beter sig exakt som
innan — loopen kör bara en gång. Korrekturläsningens sammanfattande
flagga förblir en per kapitel (inte en per scen) för att inte bli
pratig i ett kraftigt uppdelat kapitel.

### 8. Lokalt semantiskt index + Ask Manuscript ✅ byggd (v0.75)
Byggs medvetet efter Scene, inte parallellt — inte för att det är
tekniskt omöjligt före, utan för att Scene avgör vilken narrativ enhet
retrieval-systemet ska förankras i (annars byggs indexidentiteter,
provenance och citatlänkar om när Scene väl landar). Svar ska alltid
komma med belägg: käll-scen, citat, klickbar länk — aldrig bara
genererad prosa.

### 9. Story time + Timeline ✅ byggd (v0.76)
Narrative order (läsordning) mot story time (när det faktiskt händer).
Bygger på scenens `story_time`-fält (punkt 5) och löser det öppna
specfrågan om att `sequence_index` är bokordning, inte story-clock
(§11).

### 10. Continuity 2.0 ✅ byggd (kunskapsläckor v0.78, spatial kontinuitet v0.94)
Spatial kontinuitet (omöjlig förflyttning), objekttillstånd
(`gun.location`), kunskapstillstånd ("possible knowledge leak: Henrik
vet inte det här än"). Detta är LLM-steg 3-territoriet som
`ConsistencyGate` medvetet lämnat utanför v1 (§5, §6, §11) — men
strukturerad data från scenproveniens (punkt 6) gör att mycket av det
kan lösas deterministiskt, utan modellanrop.

Kunskapsläckor byggda (v0.78): `knowledgeLeaksForChapter()` varnar
när ett kapitel har fakta synliga som etablerades senare i
lässordningen.

Spatial kontinuitet byggd (v0.94), efter ett uttryckligt vägval:
författar-underhållen platskarta (helt deterministisk, men kräver
underhåll och täcker bara plats) mot AI-baserat omdöme som en ny
Korrekturläsnings-etapp (återanvänder befintlig maskin, håller
"anteckningar bara"-principen). Valde AI-vägen. Bygger på
`manuscriptPlaceChains()` (deterministisk förberedelse — varje
entitets `core.place`-historik i berättelsens egen tidsordning, inte
lässordning, återanvänder `bookFactChains`/`timelineEntries`) + en ny
"Continuity"-etapp som ber modellen flagga bara en förflyttning som
ser omöjlig eller oförklarad ut, inte varje platsbyte. Samma mekanism
täcker roadmap-textens `gun.location`-exempel också — ett föremåls
plats är samma predikat som en persons. Medvetet avgränsat till plats;
annat objekttillstånd (t.ex. "förstörd") har ingen tydlig
fakta-predikat idag och lämnas därför öppet.

### 11. Plotlines / scen-matris ✅ byggd (v0.79)
Trådar kopplade direkt till scener (`scene.plotline_ids[]`), visuellt
som en matris scen × plotline. Byggd som en riktig tabell (kapitel ×
tråd), inte en nodgraf som Sandbox-sidans Storyboard — de löser olika
problem. `plotline_ids` hamnade på `Chapter`, inte på scenen, samma
motivering som `story_time` (punkt 9).

### 12. Setup/payoff/ledtrådsspårning ✅ byggd (v0.98)
"Pistolen introducerades scen 4, ingen payoff än." AI kan föreslå,
författaren markerar. Bra särart för genrefiction, men inte brådskande.

Byggd som ett sjunde Korrekturläsnings-steg ("Setups & payoffs"),
samma mönster som Continuity (punkt 10) — återanvänder hela
stegmaskinen och "bara anteckningar"-principen. Till skillnad från
Continuitys platshistorik gick det inte att göra deterministiskt; att
avgöra vad som är "planterat" kräver berättarförståelse, så det är ett
riktigt AI-omdöme, försiktigt instruerat att hellre missa en flagga än
larma i onödan. Återanvänder Style-stegets etablerade teknik för att
hålla hela manuset i ett enda modellanrop utan full prosa (kompakta
per-kapitel-utdrag) — medvetet skilt från punkt 14 (hel-manus
developmental analys), som uttryckligen kräver att ALDRIG göra hela
manuset i ett enda anrop för en djupare analys. Ingen ny persisterad
spårningslista byggd (som Plotlines) — vald bort till förmån för den
lättare Proofread-formen, i linje med att punkten själv beskrevs som
"inte brådskande". En sådan lista är en möjlig framtida utbyggnad.

### 13. Utvecklingsmetoder som pluggbart lager ✅ byggd (v0.99)
Generaliserade den befintliga pipelinen (Brainstorm → Synopsis →
Dispositioner → Kapitel) till en valbar "Development Method"
(Snowflake, Three-Act Structure, Save the Cat, Hero's Journey).
Metoderna producerar/redigerar bara samma underliggande data (Synopsis
och Plotlines) — precis som kravet i punkten sa, ingen egen parallell
databas alls, bara `Book.development_method?: string` som minns
vilken metod som är vald.

Två sorters steg, båda ren återanvändning av det som redan fanns:

- **Vändpunktsbaserade** metoder (Three-Act, Save the Cat, Hero's
  Journey) materialiserar varje vändpunkt som en tråd i Plotlines så
  fort metoden väljs (`materializeBeats()`, byggd ovanpå den befintliga
  `addPlotline()`, med dubblettskydd på titel så att man kan byta fram
  och tillbaka mellan metoder utan att skräpa ner trådlistan).
  Författaren kopplar sedan kapitel till vändpunkter precis som med
  vilken annan tråd som helst — panelen visar bara en läslig
  referenslista (vändpunkt, ungefärlig position, en kort ledtråd) och
  en genväg till Plotlines-matrisen.
- **Expansionsbaserad** metod (Snowflake) är en guidad stegsekvens
  (en mening → ett stycke → full synopsis) med ett utkastfält per
  steg, en valfri AI-föreslagning och en "Skicka till
  Synopsis"-knapp som återanvänder `liftFragmentToSynopsis()` från
  Brainstorm rakt av. AI-förslaget använder samma icke-strömmande
  `provider.chat()`-mönster som Ask Manuscript, med författarens eget
  utkast (om något är skrivet) som kontext att växa vidare på, inte
  ersätta.

All visningstext — metodnamn, beskrivningar, vändpunktsetiketter,
ledtrådar, stegprompter — ligger i `i18n` under `method.methods.<id>`,
inte i kärnmodulen. `developmentMethod.ts` håller bara ordning på
steg-id, steg-typ (`beat`/`expand`) och för vändpunkter en ungefärlig
position — helt språkoberoende, precis som resten av kärnan. Metodernas
egna namn (Snowflake Method, Save the Cat, Three-Act Structure, Hero's
Journey) hålls medvetet oöversatta i alla tre språk, i linje med
tidigare beslut om globalt kända skrivtermer — men alla beskrivningar,
vändpunktsetiketter och stegtexter är fullt översatta till svenska och
norska, enligt den stående principen att all text till författaren
ska vara tydlig och lätt att förstå.

10 nya tester i `development-method.test.ts`. Verifierat i
webbläsaren: metodväljaren med alla fyra kort, en vändpunktsmetod som
fyller Plotlines-matrisen korrekt när man öppnar den, och Snowflakes
"Skicka till Synopsis" som faktiskt lyfter texten till
Synopsis-sidan.

### 14. Hel-manus developmental analys
Hierarkisk: scen-analys → kapitel-syntes → akt-syntes →
manus-rapport. Aldrig hela manuset i ett enda modellanrop. Sist i kön
— störst att bygga rätt, minst värde utan allt ovanstående på plats.

---

## Idéer från konkurrensjämförelse (Novelcrafter, 2026-09-24)

Författaren bad om en granskning av novelcrafter.com/features för att se
om något var smart att ta till sig. De flesta funktionerna där var
antingen redan täckta (Draft/Recast är redan "generera text som bara
lutar sig mot låsta Story Bible-fakta" — deras "Contextual Expansion"),
eller filosofiskt fel för den här appen (fritt anpassningsbara
kategorier/fält skulle bryta den medvetna gränsen mellan kanon och
skrivinstruktion som `core.*`-namnrymden finns för att hålla; fler-
boks-/serie-stöd är en helt annan arkitekturnivå). Fyra idéer var
värda att spara:

### 15. Klickbara namn i manuset → hoppa till Story Bible-kortet ✅ byggd (v0.97)
Omvänd riktning mot Mentions (punkt 3): Mentions går Story Bible →
manus ("var nämns Henrik"), den här går manus → Story Bible (klicka på
"Henrik" medan du skriver → öppna hans kort direkt). Samma
matchningslogik som redan finns i `bibleMentions.ts` går att återanvända
— jobbet är en klickbar overlay ovanpå prosan, liknande hur
"rare words"-markeringen redan fungerar i `ProseCanvas`.

Byggd med Ctrl/Cmd-klick snarare än vanligt klick, eftersom vanligt
klick redan är upptaget av markörplacering vid redigering — samma
"skriv normalt, extra funktion bakom en modifierartangent"-princip som
högerklicket för ordalternativ redan använder. Ingen permanent
markering i texten (till skillnad från ovanliga ord/klichéer), bara en
tooltip vid hovring — det här är en alltid-på navigeringsgenväg, inte
en granskningsvy man slår på.

### 16. Tidsmedveten Story Bible ("fakta som de var då") ✅ byggd (v0.87)
Den starkaste av de fyra. Visa en entitets tillstånd vid en viss punkt
i berättelsen istället för bara den senaste låsta versionen — när man
skriver kapitel 5 ser man vad som var sant *vid* kapitel 5, inte det
slutgiltiga svaret. Alla byggstenar fanns redan (History-kedjan från
punkt 2, scenprovenens från punkt 6) — det som saknades var att koppla
ihop dem i ett UI.

Ny "Som den var"-väljare högst upp i Story Bible-panelen: "Nu" (som
förut) eller ett valfritt kapitel. Väljer man ett kapitel byts hela
rosterlistan — namn, flikar, träfflista — till ett skrivskyddat
ögonblick av boken vid den läspositionen, med en tydlig banner och en
"Tillbaka till nuläget"-knapp. Klick på en person/plats öppnar ett
enkelt, eget kort (inte det vanliga redigeringskortet) som visar bara
vad som var sant då — inga redigerings-, bild- eller
omdöpningsverktyg, det vore fel i ett skrivskyddat läge.

Teknisk kärna: `factsAsOfSequence()` (`bibleHistory.ts`) återanvänder
exakt samma kedje-logik som redan byggde History-vyn (punkt 2) — går
igenom varje fakta-kedja (en per entitet+predikat) och plockar den
SENASTE posten vars `sequence_index` inte överskrider den valda
läspositionen. En kedja utan något etablerat än utesluts helt, precis
som en läsare (eller författaren, mitt i ett utkast) faktiskt skulle
veta vid den punkten — inte bokens slutgiltiga, färdiga sanning. Ny
`groupFacts()` i `bibleGroups.ts` (`groupBibleEntities()` omskriven
till ett tunt skal ovanpå den) tar emot en redan vald fakta-lista
istället för att själv filtrera på "nuvarande låst" — så samma
klassificerings-/grupperingslogik återanvänds för både det vanliga
och det tidsmedvetna läget, utan att det vanliga läget rör sig en
millimeter.

Byggd medvetet på läsordning (`sequence_index`), inte story-tid-
ordningen (punkt 9) — "vad visste jag vid kapitel 5" är i grunden en
läsordningsfråga, inte en berättelseklocka-fråga. Story-tid-baserad
visning sparas som en möjlig framtida variant, inte byggd nu.

### 17. AI-skrivtics-markering ✅ byggd (v0.95)
En lista med vanliga AI-klichéer ("a testament to", "tapestry of",
överdrivet tankstreck-bruk) markerade i texten, samma mekanism som
"rare words"-highlighting redan använder. Extra relevant eftersom
appen själv genererar text via AI. Billigt att bygga, inget nytt
AI-anrop.

Byggd precis som skisserat: ny `findAiTicHits()` i `aiTics.ts` (kurerad
frastlista + tankstreck-täthetskontroll, bara flaggad vid faktisk
överanvändning), en ny "Klichéer"-växel bredvid "Ovanliga ord" i
Brainstorm/Synopsis/kapitelvyn, ömsesidigt uteslutande med den
befintliga växeln för att hålla överlägget läsbart. Egen lila färg
skild från "ovanliga ord"-orange. Ren markering utan interaktion ovanpå
— högerklick-ordalternativ förblir en "ovanliga ord"-specifik grej.

**Tillägg (v0.96):** tooltips på markeringarna, efter önskemål om en
kort förklaring till varför något är markerat. Markeringslagret ligger
medvetet bakom den riktiga texten (`pointer-events: none`, så
skrivning fungerar normalt) — en vanlig HTML `title` hade aldrig
visats där. Löst med ett eget hover-lager på den riktiga textytan,
samma `offsetFromPoint`-teknik som högerklicket för "ordalternativ"
redan använder.

### 18. Character Interviews — chatta med en karaktär ✅ byggd (v0.96)
En tredje chattform utöver Ask Manuscript (punkt 8, frågar om
manuset) och Brainstorms generiska "Ask": chatta MED en specifik
karaktär, i deras egen röst, byggt bara på deras låsta fakta —
för att upptäcka röst, bakgrund och luckor i vad som är etablerat.
Återanvänder samma AI-infrastruktur (`OllamaModelProvider`,
`visibleLockedFacts` filtrerat per `entity_ref`) och samma
"bara låsta fakta som kontext"-princip som Draft redan har.

Byggd som en riktig flerturs-chatt (till skillnad från Ask Manuscript
och Brainstorms Ask, som är fråga-svar utan minne) — hela historiken
skickas med varje ny fråga, så karaktären minns vad som redan sagts.
Ny "Intervjua"-knapp på karaktärskort i Story Bible (bara för
`kind === "characters"`). Flyktigt precis som Ask Manuscript-svaret —
inget sparas till manuset, försvinner när kortet stängs.

### 19. Korrekturläsning: Faktakontroll-steg ✅ byggd (v0.80)
Uppstod ur en fråga om Novelcrafter-jämförelsen: fanns det redan ett
sätt att snabbt kontrollera fakta mot hela boken? Nej — Extract facts
var bara per kapitel, Ask Manuscript var fråga-för-fråga. Men
Korrekturläsningens motor (helboks-genomgång, paus/återuppta,
förloppsindikator, kör bara om vad som ändrats) var exakt rätt grund.
Nytt femte steg "facts" sist i kedjan — återanvänder hela den
befintliga Extract facts-pipelinen kapitel för kapitel, förslag och
sammanslagningsförslag hamnar i samma Story Bible-granskningskö som
en manuell extraktion redan skapar.

### 20. Korrekturläsning: stil-steget kollar även känsla ✅ byggd (v0.80)
Författaren påpekade att stil-jämförelsen mellan kapitel borde
omfatta känsla/stämning, inte bara diktion mot den deklarerade
Voice-texten. Ingen ny arkitektur — bara `STYLE_SYSTEM`-prompten
utökad, eftersom steget redan ser alla kapitel i ett enda anrop och
därför redan kan bedöma stämningsskiften mellan grannkapitel.

---

## Extern testning (2026-09-25)

Författaren fick sina första externa testare och bad om två saker
med det i åtanke: ett gränssnitt som inte antar svensk kontext eller
kräver att man redan känner appen, och en guide — helst inbyggd,
kanske PDF-exporterbar senare. Under samtalet tillkom ett tredje
behov: en tydlig snabbstart, eftersom författare i allmänhet inte är
de mest tekniska — och den här appen kräver faktiskt ett tekniskt
steg (en lokal modellserver) innan den gör något alls.

### 21. Integrerad guide + snabbstart ✅ byggd (v0.85)
Ny sida i navigeringen ("Guide"), samma mönster som Inställningar/
Timeline/Trådar — ren text, ingen AI inblandad, byggd i tre delar:

- **Snabbstart** (fyra steg): installera Ollama (eller LM Studio/en
  annan lokal server, se punkt 4 om motor-valet), peka appen mot den
  (automatiskt för Ollama, Inställningar → Modeller för resten),
  starta ett manus, börja skriva.
- **Hur appen är uppbyggd** (elva korta avsnitt): en förklaring per
  huvudfunktion — Author > AI-principen, Brainstorm/Synopsis,
  Skriv utkast/Omskriv/Analysera, Scener, Story Bible,
  kontinuitetsvarningar, Timeline, Trådar, Korrekturläsning, Fråga
  manuset, Publicera.
- **Felsökning**: tre vanliga frågor, bland dem "Ingen lokal modell
  hittades" — samma felmeddelande som redan visas i den globala
  felbannern.

**Var den dyker upp:** ett nytt manus utan kapitel, synopsis eller
brainstorm-anteckningar öppnas nu direkt på Guide istället för
Inställningar (`openingSurface()` i `BookSchema.ts`) — en ny
författare har inget att ställa in än, men allt att lära sig.
Hemskärmen (innan man ens skapat ett manus) fick en egen länk,
"New here? Read the quickstart", som öppnar samma guide-innehåll i
en overlay — `GuidePanel` är byggd fristående från bokdata så den
funkar i båda lägena utan duplicerad kod. Den globala felbannern
("Ingen lokal modell hittades" osv.) fick en direktlänk till precis
den paragrafen i Felsökning-avsnittet, med automatisk skroll dit.

**Framtida PDF-export** (nämnd som "kanske senare" i samtalet): inte
byggd nu, men arkitekturen ligger rätt för det — guide-innehållet är
redan strukturerad text i språkfilerna, så det borde kunna återanvända
Publish-flödets befintliga PDF-renderare istället för att bygga en ny.

### 22. "?"-genvägar från rubriker till guiden ✅ byggd (v0.93)
Författaren föreslog små "?"-ikoner vid huvudrubriker som hoppar rakt
till rätt avsnitt i guiden, istället för spridda hjälptexter som måste
hållas i synk på flera ställen. Byggd med de förberedda ankarna
(`GUIDE_SECTION_IDS`) och `Editor.tsx`s befintliga `openGuide(anchor)`
— samma mekanism felbannerns guide-länk redan använde.

Nio knappar: Brainstorm, Synopsis, Fråga manuset, Timeline, Trådar,
Kapitel, Korrekturläsning, Publicera (alla i vänsterspalten, via en ny
delad `GuideHelpButton`) och Story Bible (högerspalten, via en ny
`onOpenGuide`-prop på `BiblePanel` eftersom det ankar-styrande state:t
bor i `Editor.tsx`, inte storen). Inställningar, Scener, Kontinuitet
och "Author beats AI" fick ingen knapp — inget av dem har en enda
tydlig rubrik att fästa den vid, och en gissad placering hade känts
påklistrad snarare än hjälpsam.

### 23. Läsarålder som fasta nivåer + innehållsflaggning ✅ byggd (v0.91)
Författaren ville kunna ange vilken ålder läsaren förväntas ha, men
med fasta nivåer istället för ett fritt nummer — samma princip som
åldersklassning för dataspel (PEGI m.fl.). Om boken är för barn ska
Korrekturläsningen dessutom flagga svordomar, våld och explicit
innehåll.

- Läsarväljaren (manus- och kapitelnivå) är nu en lista med sex
  nivåer — Pekbok, Lättläst, Kapitelbok, Mellanålder, Ungdom, Vuxen —
  istället för ett sifferfält. Nivåerna fanns redan i motorn
  (`READER_CATEGORIES` i `reader.ts`), de styrde bara aldrig valet
  själva.
- Korrekturläsningens ålderssteg flaggar nu innehåll som inte passar
  åldern (svordomar, grafiskt våld, sexuellt/explicit material) när
  läsaren är under 18, tydligt märkt med en egen "Innehållsvarning"
  skild från vanliga hantverksnoteringar. Ålderslämplig fara eller
  sorg räknas inte som en flagga.
- Förklaringstext vid väljaren beskriver vad nivån gör: kortare
  meningar/enklare ord samt att Korrekturläsningen skärper sig för
  innehåll.
- Textens svårighetsgrad styrdes redan av en egen läsbarhetsmotor
  (`readerTuning` — meningslängd, ovanliga ord, stavelser), kopplad
  sedan tidigare till statistikpanelen, redigeraren och
  korrekturläsningen. Motsvarar i praktiken en egen Lexile-liknande
  skala, fast inte den licensierade Lexile-skalan själv. Inget nytt
  behövde byggas där.

---

## Positionsmedvetna Story Bible-fakta (2026-09-25)

### 24. Positionsmedvetna Story Bible-fakta — story-tid, inte lässordning
Författarens iakttagelse: manuset grenar via Continues from (kapitel 4
fortsätter från kapitel 1, kapitel 7 fortsätter från kapitel 5) — det
löper inte nödvändigtvis linjärt. En fakta låst "efter" kapitel 5
borde kanske inte synas när man skriver kapitel 4, om kapitel 4
story-tidsmässigt ligger före den händelsen.

**Bekräftat verkligt hål, inte en gissning** — grävde i koden innan
detta skrevs. Två redan byggda funktioner har exakt samma begränsning:

- `knowledgeLeaksForChapter` (Continuity, kunskapsläckor, punkt 10)
  jämför bara `sequence_index` (lässordning). Kodkommentaren erkänner
  problemet rakt ut ("not necessarily wrong, maybe it is a
  flashback") men löser det inte.
- `factsAsOfSequence` (Tidsmedvetna Story Bible, punkt 16, "visa som
  den var vid") har samma begränsning.

**Rekommendation: använd `story_time_order` (Timeline, punkt 9), inte
`continues_from`, som positionssignal.** `continues_from` säger vilken
tråd/gren ett kapitel fortsätter — inte när i berättelsen det händer,
och flera trådar kan pågå samtidigt vilket gör grenstrukturen svår att
härleda en entydig position ur. `story_time_order` är författarens
egen explicita tidslinje, redan byggd, och redan använd för
Continuitys spatiala kontroll (punkt 10, v0.94) för precis den här
sortens fråga. Att byta båda ovanstående funktionerna till story-tid
istället för lässordning är en välavgränsad, billig fix — högst
troligt nästa steg här.

**Tre öppna frågor innan resten byggs** (författaren har inte svarat
än):

1. **Hide/Show "generalisera till alla fakta-typer"** — kodgranskning
   visar att varje fakta, oavsett predikat och entitetstyp, redan har
   sin egen visa/dölj-växel i `EntityOverlay`, ograverat av typ.
   Antingen redan löst, eller menar författaren en **positionsberoende**
   växel (dold för kapitel 4, synlig för kapitel 7) snarare än dagens
   globala av/på.
2. **Live-understrykning för annan fakta än karaktär** — täcks delvis
   redan av punkt 15 (klickbara namn, alla entitetstyper redan, inte
   bara karaktärer) men bara som osynlig hovring, medvetet, för att
   inte belamra texten. Öppet om författaren vill ha en **permanent
   synlig** understrykning istället/också (samma stil som Ovanliga
   ord/Klichéer) — ett separat visuellt beslut.
3. **Att ändra vad Skriv utkast själv ser** (inte bara flagga) är ett
   större beslut än en Proofread-flagga: idag ser AI:n medvetet alltid
   *hela* den senaste låsta Story Bible, oavsett kapitel. Att göra det
   positionsmedvetet ändrar kärnbeteende i genereringen — om
   story-tiden inte är perfekt underhållen kan AI:n plötsligt
   "glömma" saker författaren förväntar sig att den vet. Värt att
   bygga, men kräver ett uttryckligt ja, inte bara en bugfix.

"Include when detected / Don't include when detected" (en
per-fakta-överstyrning när den automatiska positionslogiken gissar
fel) hänger ihop med fråga 3 — vettig som en säkerhetsventil OM
Draft görs positionsmedvetet, men inget att bygga isolerat innan det
beslutet är taget.

**Status (v0.99.25): frågorna besvarade, tre av fyra delar byggda.**
Författaren svarade ja på alla tre — positionsberoende växel,
permanent understrykning, och Draft blir positionsmedveten.

- ✅ **Grundfixet**: `knowledgeLeaksForChapter` och `factsAsOfSequence`
  går nu efter `story_time_order` (via ny `storyTimeRankByChapterId()`
  i `timeline.ts`), inte lässordning.
- ✅ **Skriv utkast blir positionsmedveten**: ny
  `formatBibleForPromptAtPosition()` i `generateProse.ts`, använd av
  Draft (kapitel och scen). Recast/Proofread/Analysera/Brainstorm
  fortsätter medvetet se hela Story Bible — de jobbar med text som
  redan finns, inte med vad ett kapitel "får" veta än.
- ✅ **Positionsberoende växel (säkerhetsventilen)**: nytt fält
  `position_override` (`"include" | "exclude"`) per fakta. Ny knapp i
  Story Bible-kortet (Auto / Alltid med / Aldrig med, klick cyklar)
  som alltid vinner över den automatiska gissningen.
- ⬜ **Permanent synlig understrykning** för fakta-omnämnanden i
  prosan (fråga 2) — inte byggd än. Klickbara namn (punkt 15) har
  redan träffdetektering och hover-tooltip men ingen synlig markering;
  skulle återanvända samma `<mark>`-mönster som Ovanliga ord/Klichéer
  (`RareMarkup` i `ProseCanvas.tsx`) i ett nytt `is-facts`-läge. Nästa
  steg när det blir aktuellt.

### 25. Textformatering (fet/kursiv/understruken) i kapiteltexten
Författarens förslag: markera text, högerklicka, tre kvadratiska
knappar (Fet/Kursiv/Understruken) som formaterar valet direkt.

**Inte lika enkelt som det låter — grävde i koden innan svar.**
Kapiteltexten lagras som ren text, ingen HTML. `proseFromElement()`
(`proseDom.ts`) bygger om strängen från `textContent` vid varje
tangenttryck, och `htmlFromProse()` (`proseFlow.ts`) skriver bara
`<p>`-taggar (plus en särskild markering för parentetiska AI-tillägg)
tillbaka till redigeraren — ingen av dem känner till eller bevarar
`<strong>`/`<em>`/`<u>`. Tre knappar som bara kör webbläsarens
inbyggda `execCommand("bold")` skulle alltså *se ut* att fungera ett
ögonblick men tappa formateringen igen vid nästa ändring, eftersom
hela texten byggs om från en sträng utan formateringsminne.

**Vad som faktiskt krävs**: en egen markup-konvention i själva
textsträngen (t.ex. `**fett**` som i Markdown), som sen måste tolkas
på tre ställen samtidigt för att vara meningsfull:
1. I redigeraren — `htmlFromProse()`/`markupProseBlock()` måste
   känna igen konventionen och rendera den visuellt.
2. I **alla** exportformat — Markdown-export får den gratis, men
   RTF/ODT/HTML/ePub/PDF måste var för sig lära sig samma syntax,
   annars kommer bokstavliga asterisker med i den publicerade boken.
3. Gentemot AI:n — modellen ser samma textsträng som skickas till
   Draft/Recast/Analysera. Antingen får den se markup-tecknen rakt av
   (risk: imiterar syntaxen inkonsekvent i egna förslag) eller så
   måste de filtreras bort innan prompten byggs och läggas tillbaka
   efteråt (mer att hålla reda på).
Understruket text har dessutom ingen standard i Markdown och skulle
behöva ett eget påhittat tecken.

**Status: avvaktar.** Författaren vill inte bygga det nu men ville ha
det kvar på listan. Fullt görbart när det blir aktuellt, men en
egen liten funktion (markup-konvention + tolkning på tre ställen) —
inte tre knappar.

### 26. Dölj snabbstartskorten på förstasidan när en lokal AI redan är ansluten
Snabbstartskorten ("Kom igång med en lokal AI") visas just nu alltid
på förstasidan (v0.99.15). Frågan är om de ska försvinna automatiskt
när uppsättningen är klar.

**Föreslagen lösning:** koppla synligheten till samma koll appen
redan gör på andra ställen — `models.length > 0` (om StoryBook AI
just nu faktiskt hittar en ansluten modell). Det har en bieffekt som
är en fördel, inte ett problem: korten dyker upp igen som påminnelse
om anslutningen skulle falla bort en dag (t.ex. glömt starta Ollama),
istället för att vara en engångs-onboarding kopplad till om man har
manus sen tidigare.

**Status: avvaktar.** Författaren vill kunna se sidan som en ny
användare skulle se den ett tag till, innan korten börjar gömma sig.
Enkelt att bygga när det blir aktuellt — en villkorsrendering runt
`<QuickstartCards />` i `Home.tsx`.

---

## Medvetet nedprioriterat just nu (inte avvisat)

- **Mer polish på illustrationsbiblioteket och Publish-exporterna.**
  Biblioteket är i ett bra, färdigt-nog läge efter arbetet i den här
  sessionen (två-kolumns bibliotek, orientering, kapitel-banderoller,
  HTML/ePub/PDF-inbäddning). Nästa stora arbetsinsats bör gå mot
  Story Bible/scen/konsistens-sidan, som är projektets faktiska
  differentiering (§1, §9, §10) — inte mer polish på en redan
  fungerande feature.

## Medvetet avvisat

- **Osynlig, tvingad LLM-baserad auto-omskrivning som default** i
  `ConsistencyGate`. Redan avgjort i §9 — motsäger author > AI-
  principen. Finns kvar som opt-in för den som vill ha mindre friktion.
- **En separat, parallell Snowflake-databas** (eller motsvarande för
  andra utvecklingsmetoder). Metoder får bara skriva till den
  befintliga datamodellen.
- **Cloud-modellstöd i provider-abstraktionen.** Explicit uteslutet —
  se punkt 4 ovan. Lokala endpoints only, för alltid, oavsett hur
  bekvämt det vore att lägga till OpenAI-stöd senare.
- **"Assisted Research" — webbsökning kombinerad med Story Bible**
  (Novelcrafter-jämförelsen ovan, punkt 15–18). Kräver internet/
  molntjänst för att fungera, rakt emot "allt lokalt, inget lämnar
  din dator"-principen — samma skäl som cloud-modellstöd ovan.
  Skulle kräva att appens grundidentitet omdefinierades, inte ett
  litet tillägg.
- **"Contextual Expansion" (Novelcrafter).** Inget nytt att bygga —
  det är redan vad Draft/Recast gör (generera text som bara lutar sig
  mot låsta Story Bible-fakta). Sparas här bara som anteckning om att
  jämförelsen redan är täckt, inte som en byggpunkt.
