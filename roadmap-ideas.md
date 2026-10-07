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
| 24 | Positionsmedvetna Story Bible-fakta (story-tid, inte lässordning) | ✅ byggd (v0.99.26) |
| 25 | Textformatering (fet/kursiv/understruken) i kapiteltexten | ✅ byggd (v0.99.43) |
| 26 | Dölj snabbstartskorten på förstasidan när en lokal AI redan är ansluten | ⬜ ej påbörjad — avvaktar, se nedan |
| 27 | Riktig mobilanpassning av redigeringsytan | ⬜ ej påbörjad — avvaktar, se nedan |
| 28 | Import från andra skrivverktyg — adapterarkitektur | ⬜ ej påbörjad — se nedan |
| 29 | Serier — flagga att en bok tillhör en serie, ärv Story Bible från föregående bok | ⬜ ej påbörjad — se nedan |
| 30 | Extract facts känner inte igen namn-varianter av samma person | ⬜ ej påbörjad — se nedan |
| 31 | Story Core — gemensam bas för StoryBook, Sandbox (RPG) och möjliga framtida appar | ⬜ 2.0-riktning, medvetet inte nu — se nedan |
| 32 | Fri fråga till AI om det skrivna — kritisk hantverksfeedback på fri text | ⬜ ej påbörjad — se nedan |
| 33 | Timeline som gantschema, ihopslaget med Plotlines | ✅ byggd som punktbaserad vy (v0.99.62) — se nedan |
| 34 | Startskript för Mac och Linux (som `starta.bat`) | ✅ byggd (v0.99.71) — se nedan |

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

**Uppdatering (v1.0.36) — fixade ett verkligt gap en testare hittade.**
"Bara låsta fakta som kontext" filtrerade för hårt: bara den
intervjuade entitetens EGNA fakta, ingenting om andra entiteter alls.
Frågar författaren karaktären om någon annan måste modellen antingen
säga "vet inte" eller hitta på — och ett påhitt om en annan, redan
etablerad karaktär kan motsäga den karaktärens riktiga, låsta fakta.
`relatedEntityContext()` (`characterInterview.ts`) drar nu in fakta om
andra entiteter som faktiskt nämns, antingen i den intervjuades egna
fakta eller i konversationen — en nivå bara, inga kedjade nämningar.
Se `project_spec.md`s ändringslogg v1.0.35 → v1.0.36 för detaljer.

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

**Status (v0.99.26): frågorna besvarade, alla fyra delar byggda.**
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
- ✅ **Permanent synlig understrykning** (v0.99.26) för fakta-
  omnämnanden i prosan (fråga 2), togglebar precis som Ovanliga
  ord/Klichéer — tredje knapp i samma rad (`STORY BIBLE NAMES`), av
  som standard, återanvänder samma `<mark>`-overlay-teknik
  (`RareMarkup`-mönstret) i ett nytt `is-facts`-läge. Bara i Synopsis
  och kapiteltexten — Brainstorm har ingen `ProseCanvas`/namnlänkar
  att markera i, så ingen tredje knapp dök upp där.

### 25. Textformatering (fet/kursiv/understruken) i kapiteltexten ✅ byggd (v0.99.43, export/scen-gränser kvar)
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

**Uppdatering — byggd (v0.99.43), på ett säkrare sätt än ovan skisserat.**
I stället för markup-tecken i själva textsträngen (t.ex. `**fett**`)
landade lösningen på en helt separat lista, `chapter.formatting:
{start, end, style}[]`, som pekar in i den oförändrade `chapter.prose`-
strängen via samma teckenintervall (`TextSpan`) appen redan använder för
markeringar. Fördelen mot markup-tecken: `chapter.prose` som skickas till
AI:n (Draft/Recast/Analysera/Extract facts/ordräkning) är exakt likadan
som innan, tecken för tecken — ingen filtrering in och ut, och ingen risk
att modellen imiterar syntaxen. Bara redigerarens visningslager
(`htmlFromProse`/`ProseCanvas`) känner till formateringen alls.

Byggd: markera text → en flytande verktygsrad (Fet/Kursiv/Understruken)
eller Ctrl+B/I/U, klick igen tar bort. AI-redigeringar (Förläng/Brodera
ut/Skriv om/Beat/Manuell redigering) flyttar och klipper
formateringsintervallen korrekt när texten ändras.

**Kvarstående, medvetet avgränsat i den här första versionen:**
- Scen-nivåns Skriv utkast/Omskriv nollställer hela kapitlets formatering
  (inte bara den berörda scenen) — en mer exakt lösning är möjlig senare.
- Synopsis och Brainstorm har fortfarande ingen formatering, bara
  kapitelprosan.
- **Export (RTF/ODT/HTML/ePub/PDF) skriver ännu inte ut fetstilen/
  kursiven/understrykningen** — publicerad text kommer ut ren, som innan.
  Naturligt nästa litet steg om/när det blir aktuellt.

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

### 27. Riktig mobilanpassning av redigeringsytan
Uppstod ur en fråga om appen är mobilanpassad. Testat i en simulerad
telefon-webbläsare (390px bred) innan svar: sidan kraschar inte och
layouten viker om sig — förstasidan ser bra ut, och kapitel-editorns tre
kolumner (vänsterpanel/skrivyta/Story Bible) blir en enda scrollbar
kolumn under 960px bredd (`.editor-body` i `styles.css`).

**Två verkliga begränsningar hittade:**
- Vänsterpanelen (Brainstorm, Synopsis, Kapitellista osv.) staplas
  *ovanför* skrivytan istället för att ligga i en egen flik/undermeny —
  man scrollar förbi hela den listan för att nå texten.
- AI-redigeringsmenyn (Förläng/Brodera ut/Skriv om/Beat) öppnas via
  högerklick på markerad text (`onContextMenu` i `ProseCanvas.tsx`) —
  ingen tryck-och-håll-motsvarighet finns byggd, och det är helt otestat
  på riktig pekskärm.

**Status: avvaktar.** Författaren vill inte prioritera det nu — mobilen
är inte förstahandsvalet för att skriva text, appen är i grunden tänkt
för dator. Skulle kräva en egen mobilnavigering (flikväxling istället
för stapling) plus en tryck-och-håll-öppnad meny som ersättning för
högerklicket för att bli en riktig lösning, inte en snabb CSS-fix.

### 28. Import från andra skrivverktyg — adapterarkitektur
Uppstod ur en idé författaren fick från ChatGPT om att bygga vidare på
"Importera lore" till stöd för externa appar (SillyTavern, Campfire,
Authoric AI m.fl.), inte bara fritt inklistrad text.

**Nuläget bekräftat i koden innan förslaget diskuterades**: `Importera
lore` (`LoreImportCard.tsx` + `importLoreArticle` i `BookStore.tsx`) tar
redan en artikel i taget, kör den genom exakt samma extraktor
(`EXTRACTOR_SYSTEM`) som kapitel och intervjuer, och förslagen hamnar i
samma granskningskö som all annan extraktion — originaltexten sparas
aldrig i boken, bara de fakta författaren väljer att godkänna. ChatGPTs
beskrivning av nuläget stämde exakt.

**Förslaget, i korthet**: ett adapterlager framför samma pipeline —
`Extern fil → känn igen format → dela upp i artiklar → normalisera →
faktaplockning → granskningskö → Story Bible` — med ett gemensamt
internt format (`ImportedLoreArticle` / `ImportedLoreBundle`) så att
StoryBooks kärna aldrig behöver känna till SillyTavern eller Campfires
egna datastrukturer. UX: känn igen formatet, visa "47 poster hittades",
låt författaren välja Importera alla/Välj poster, kör igenom
granskningskön som vanligt — aldrig hoppa över granskningen bara för
att källan är strukturerad.

**Bedömning: arkitekturen är rätt**, och matchar redan hur
Utvecklingsmetoder (punkt 13) är byggda — ett adapterlager som bara
matar in i befintlig data/pipeline, ingen egen parallell databas.

**Rekommenderad byggordning, något omvänd mot ChatGPTs ursprungsförslag:**
1. **Generisk flerartikel-import** — bygg om `LoreImportCard` till en
   batch-vy: dela upp inklistrad text/fil i flera block, förhandsgranska
   antalet hittade block, välj vilka som ska köras genom extraktorn. Ger
   nytta oavsett källformat och blir den gemensamma ytan varje
   formatspecifik adapter sen matar in i — hellre än att bygga
   SillyTavern-specifik parsning innan själva rörledningen finns.
2. SillyTavern Lorebook / World Info (strukturerade poster med
   nyckelord — mappar naturligt till `ImportedLoreArticle`).
3. SillyTavern Character Cards.
4. Campfire — när det finns en verklig export-/backupfil att bygga och
   testa mot, inte förr.
5. Authoric AI — samma princip, vänta på exempeldata.
6. Övriga verktyg efter faktisk efterfrågan.

**Medvetet sparat till senare, inte avvisat**: den bredare
`ImportedWritingProject` (hela projekt — kapitel, karaktärer, trådar,
inte bara lore). Tydlig scope-utvidgning jämfört med ren lore-import,
av samma skäl som en egen parallell Snowflake-databas avvisades
(punkt 13): bygg inte det stora innan det mindre är bevisat värt.

**Författarens uppföljning (2026-09-27): flerstegsflöde med
innehållsklassificering.** Konkretisering av byggsteg 1 ovan, i tre
steg istället för ett:
1. **Ladda upp.** En fil (json eller text). Alternativet att klistra
   in text direkt (dagens enda väg) ska finnas kvar parallellt, inte
   ersättas — filuppladdning är ett tillägg, inte en ersättning.
2. **Analysera filen.** Innan extraktorn körs, försöka avgöra vilken
   typ av innehåll filen faktiskt är: världsbygge/lore, karaktär(er),
   manus/prosa, med mera. Sannolikt en enkel klassificeringsfråga till
   modellen (samma mönster som extraktorn redan använder), inte en ny
   pipeline.
3. **Gren beteendet efter klassificering.** Lore/karaktärer/världsbygge
   fortsätter genom dagens flöde (faktaplockning → granskningskö). Om
   filen istället klassas som manus/prosa, erbjud "Convert markers to
   formatting" (byggd v0.99.48, nu egen knapp i toppmenyn) som en del
   av importflödet — importerat manus har ofta kvar markörer
   (`*kursiv*` och liknande) från det andra skrivverktyget, vilket är
   precis det verktyget redan löser.

**Status: byggsteg 1 skeppat (v0.99.61).** `LoreImportCard` är nu en
batch-vy: `splitLoreArticles()` delar inklistrad/uppladdad text på
Markdown-rubriker till kandidatartiklar, visar en bockningslista med
alla ivalda som standard, kör dem sekventiellt genom extraktorn med
"X av Y"-förlopp. En filuppladdningsknapp finns också (steg 1 i
författarens 3-stegsuppföljning ovan), men **utan** innehålls-
klassificering eller gren efter typ — det är fortfarande steg 2 och 3,
inte påbörjade. Byggsteg 2–6 (SillyTavern m.fl. formatadaptrar) inte
påbörjade.

### 29. Serier — flagga att en bok tillhör en serie, ärv Story Bible från föregående bok
Författarens förslag: kunna markera att ett manus är del av en serie och
fortsätter från en tidigare bok, och då ta med den bokens Lore/Story
Bible istället för att börja om från noll.

Det här är i praktiken den smalare, konkreta delen av "fler-boks-/
serie-stöd" som redan flaggades som "en helt annan arkitekturnivå" och
medvetet lämnades utanför under Novelcrafter-jämförelsen (se ovan) — inte
en ny idé, utan författaren som specifikt efterfrågar just den här biten
av den större frågan.

**Öppna frågor att ta ställning till den dag det byggs, inte nu:**
1. **Kopia eller levande länk?** Varje bok är idag ett helt fristående
   `Book`-objekt (egen Story Bible, egna kapitel, egen lagring i
   IndexedDB via `Repository.ts`) — inget korsreferererar mellan böcker.
   En engångs-**kopia** av bok 1:s låsta fakta in i bok 2 vid det
   tillfälle serien kopplas (med en valfri "uppdatera från bok 1"-knapp
   senare) matchar den befintliga arkitekturen — varje bok äger
   fortfarande sin egen sanning. En **levande länk** (ändringar i bok 1
   syns automatiskt i bok 2) vore kraftfullare men kopplar ihop två
   böckers data på ett sätt hela resten av appen idag medvetet undviker.
2. **Allt eller ett urval?** En del av bok 1:s fakta må inte längre
   stämma i bok 2 (t.ex. "letar fortfarande efter amuletten" efter att
   amuletten hittades). Att bara kopiera in allt som ny låst kanon utan
   granskning bryter mot appens grundprincip — författaren, inte
   automatiken, avgör vad som blir kanon. Troligen behöver överförda
   fakta gå genom samma granskningskö som Extract facts/Importera lore
   redan använder, inte hamna direkt som låsta.
3. **Story time-kontinuitet.** `story_time_order` finns redan per bok
   (Timeline, punkt 9) — men ingen mekanism idag för att säga "bok 2:s
   tidslinje fortsätter där bok 1:s slutade".
4. **Datamodell**, om/när det byggs: troligen ett par valfria fält på
   `Book` (typ `series_title?`, `series_position?`), samma
   "missing on older saves"-mönster som `continues_from`, `discarded_at`
   m.fl. redan använder — ingen brytande ändring.

### 30. Extract facts känner inte igen namn-varianter av samma person
Upptäckt via faktisk testning (Baskervilles hund, v0.99.57): efter
faktaplockning ur ett kapitel hamnade "Dr. James Mortimer" och "Dr.
Mortimer" som två separata Story Bible-kort, likaså "Henry Baskerville"
och "Sir Henry Baskerville" — samma person, olika sätt att skriva namnet
på i texten.

**Vad som redan fixades (v0.99.57), som en separat, snävare bugg**:
`entity_ref` (kortets stabila identitet) togs tidigare från modellens
egna påhittade förslag per fakta-rad, vilket kunde ge exakt samma
skrivna namn två olika kort inom en och samma extraktion. Det är nu
alltid en deterministisk funktion av det visade namnet — samma
teckenföljd ger alltid samma kort.

**Det här är nästa, svårare lager**: två OLIKA skrivna namn som syftar
på samma person. Extraktorn ser idag bara det aktuella kapitlets text —
ingenting om vilka kort som redan finns i Story Bible — så den har
ingen chans att känna igen att "Dr. Mortimer" är samma person som redan
etablerade "Dr. James Mortimer".

**Två möjliga vägar, inte valda än:**
1. **Ge extraktorn kontext.** Skicka med en lista över redan etablerade
   namn (bara `entity_label`, inte hela fakta) i prompten, och be
   modellen återanvända ett existerande namn när den känner igen samma
   person istället för att hitta på ett nytt. Billigt i tokens, men
   modellen kan fortfarande missa eller felaktigt slå ihop två olika
   personer med snarlika namn.
2. **En riktig "slå ihop kort"-funktion i Story Bible.** Författaren
   märker duplicaten (som nu) och slår ihop dem manuellt — författaren,
   inte automatiken, avgör vad som är samma person, i linje med appens
   grundprincip. Kräver en ny UI-flöde: välj två kort, välj vilket namn
   som vinner, flytta alla fakta till samma `entity_ref`.
   `renameEntityLabel`/`replaceNameInManuscript` gör redan halva jobbet
   (byta visat namn) men ingen av dem slår ihop TVÅ redan skilda kort
   till ett.

   **Författarens konkretisering av UX (2026-09-27):** markera flera
   kort i rosterlistan, välj "Slå samman", få ett förslag att justera
   innan man låser det — inte en tyst sammanslagning direkt.
   - Förslaget bygger vidare på mönster som redan finns i koden istället
     för att uppfinna nya: samma "behåll båda / ersätt"-val som redan
     visas när en ny fakta krockar med en befintlig (`addChoiceKeepBoth`
     / `addChoiceReplace` i `BiblePanel.tsx`) återanvänds här per
     predikat där de valda korten har olika värden — ingen tyst
     överskrivning, författaren väljer rad för rad.
   - Vilket namn som blir kortets nya visade namn ska gå att välja/
     justera, inte automatiskt bli det först markerade kortets — själva
     bytet av visat namn kan återanvända `renameEntityLabel`.
   - Efter sammanslagning: samma fråga som redan finns vid namnbyte
     ("byt ut namnet i själva manustexten också?", `replaceNameInManuscript`)
     bör ställas för varje namn som förlorar, inte bara ett.
   - Öppen fråga inte löst än: vad händer om de markerade korten har
     olika `kind` (t.ex. en "person" och en "grupp" råkar markeras ihop)
     — troligen varna eller blockera snarare än gissa.

Troligen båda på sikt — (1) minskar hur ofta det händer, (2) ger ett sätt
att städa upp när det ändå händer. Ingetdera byggt än.

**Status: idé nedskriven, inte påbörjad.** Inget kodat än (utöver
v0.99.57-fixen ovan, som är en förutsättning, inte samma sak).

---

### 31. Story Core — gemensam bas för StoryBook, Sandbox (RPG) och möjliga framtida appar ✅ byggsteg 1 (v1.0.35)
**Bakgrund (författarens egen historik, 2026-09-27):** Sandbox AI
(RPG-motorn) byggdes först. Under speltestning märktes att det som
uppstod ofta liknade prosa mer än spelloggar, vilket ledde till att
StoryBook AI påbörjades — ursprungstanken var nog att dela Lore mellan
dem, men i takt med att StoryBook växte fick den appen prioritet.
Sandbox är vilande just nu, inte nedlagt, och ska troligen startas upp
igen. Det förklarar varför bryggan mellan apparna (`sandboxExport.ts`,
en enkelriktad, medvetet lossy JSON-export) inte utvecklats vidare på
över 90 versioner av StoryBook — inte för att den räckte, utan för att
ena sidan stått stilla.

**Förslaget, i korthet:** separera generell story/lore-logik
(karaktärer, platser, objekt, grupper, relationer, kanon-fakta, stabila
entity-id:n, på sikt Visual Identity) till en delad "Story Core" som
flera appar bygger ovanpå — StoryBook, Sandbox, och möjliga framtida
klienter (en Comic Creator, men också sådant som TTS eller
video-generering nämndes som exempel på vad en riktigt frikopplad
kärna skulle kunna möjliggöra för tredje part). Tänkt monorepo-struktur:
`apps/{storybook,rpg,comic}` + `packages/{story-core,lore,local-ai,...}`.
Genomgången i detalj i den här konversationen (kodgranskning mot
`BookSchema`, `NarrativeFact`, `ConsistencyGate`, `sandboxExport.ts`,
`Repository.ts` m.fl.).

**Slutsats från granskningen, författaren instämmer:**
- Projektet har redan **provat en mer ambitiös version** av precis den
  här idén en gång, tidigt (v0.1 i `project_spec.md`s historik: en
  delad `NarrativeFact`-tabell med namnrymdade `core.*/rpg.*/book.*`-
  predikat) — och medvetet backat till något lättare (v0.2–v0.3): varje
  app äger sin egen sanning helt, och bara en **explicit, engångs,
  användarutlöst projektion** korsar gränsen. Det som faktiskt byggdes
  (`sandboxExport.ts`) är ännu mindre delat än det: en enkelriktad,
  lossy omformning till Sandbox eget kortformat, inga delade typer.
- Redan bra separerat och inte värt att röra: Scene (v0.81-beslutet,
  bara `title` får någonsin korsa gränsen som `SceneProjection`, ej
  byggd), Plotlines vs Sandbox Storyboard (medvetet olika modeller,
  "löser olika problem").
- Genuint delningsbart redan idag, som idé snarare än kod: predikat-
  vokabulären (`core.identity/trait/place/...`, redan app-agnostisk),
  och själva mönstret improvisation → extrahera → granska → lås.
- Ska inte flyttas ut: allt manus-specifikt (kapitel, prosa, scener,
  synopsis, brainstorm, historik, publicering) och AI-pipelinerna själva
  (redan uttryckligt principbeslut i `project_spec.md`: "narrative-core
  ... definierar men implementerar INTE FactExtractor/ConflictReasoner/
  Novelizer — LLM-beroende, appspecifika").
- Monorepo/delade paket: inte nu. Sandbox-AI är ett separat repo,
  Comic Creator finns inte alls, och den enda existerande bryggan har
  inte rörts på 90+ versioner — inget tecken på akut delnings-smärta.
  En liten, versionerad exportfil (samma anda som `sandboxExport.ts`,
  generaliserad) räcker långt innan ett monorepo är motiverat.
- Backupfiler/BookSchema: säkert så länge Story Core förblir ett
  konceptuellt lager (en namngiven delmängd av samma `Book`-JSON), inte
  en fysisk utflyttning av `facts`/`profiles`/`media` till en egen
  lagringsplats — den utflyttningen skulle kräva en riktig migration
  och är inte värd det utan bevisad nytta.

**Överenskommen väg framåt:** inget kodas nu. Värt att ta upp på nytt
**den dag Sandbox faktiskt startas upp igen** — då finns för första
gången två samtidigt aktiva konsumenter, vilket är precis det som
saknas idag för att motivera arbetet. Om/när det blir aktuellt: börja
med en enda liten, ren exportfil i StoryBook (generalisera
`sandboxExport.ts`), inte ett monorepo på dag ett.

**Status (2026-10-02): byggsteg 1 klart, utlöst av precis det villkor
som saknades ovan — en andra, samtidigt aktiv konsument.** Mats
påbörjade `ComicBook-AI` (story-till-serie), vilket gjorde frågan
konkret igen. Innan kod skrevs lästes det faktiska ComicBook-repot
(inte gissat): dess hemmasnickrade `storybookImport.ts` hade redan,
i sin första version, tre verkliga fel — bara 2 av 6 Story
Bible-kategorier hanterades, ingen statusfiltrering (en `ai_proposed`
fakta kunde läsas in som låst kanon), och `hidden_from_ai`/
`hidden_entities` respekterades inte trots att ComicBooks egen spec
kräver det.

Arkitekturdiskussion i flera steg landade i en generaliserad princip:
**varje app äger bara sin egen kanon — data från en annan app är
alltid ett förslag, aldrig en skrivning**, en utvidgning av "författare
> AI" till app-till-app-nivå snarare än en ny regel. Tre mekanism-
nivåer vägdes (ren exportfil / delad lokal "brevlåda"-mapp / en
levande delad databas) — valde den enklaste (ren fil, mottagaren
granskar genom sin egen befintliga kö, t.ex. Import lore) eftersom
de dyrare nivåerna löser ett upptäckbarhetsproblem ingen stött på än.

**Byggt:** nytt, separat repo `ocedo-apps/StoryCore` (publikt,
GPL-3.0 — måste vara publikt för att StoryBook AI:s egen publika
Windows-CI ska kunna hämta det med standard-`GITHUB_TOKEN`). Bara ett
schema + en validator (`ManuscriptExportSchema`/
`parseManuscriptExport`) — inget eget datalager, medvetet skilt från
StoryBook AI:s interna `Book`-typ som ändras varje release.
`packManuscriptExport()` i StoryBook AI (`src/core/
manuscriptAppExport.ts`), byggd på `visibleLockedFacts` (samma regel
Draft använder) istället för den mer tillåtande `lockedFacts` Publish-
exporten använder. Ny knapp "Exportera för andra appar".

**Kvarstår:** ComicBook AI:s sida — byta ut dess egen gissande
importkod mot StoryCore. Inte gjort än.

---

### 32. Fri fråga till AI om det skrivna — kritisk hantverksfeedback på fri text ✅ byggd (v1.0.33)
Författarens exempel: kunna skriva en egen, fri instruktion om det man
just skrivit, t.ex. "kolla om kapitlet är välskrivet och med en
intensitet som slutar med en cliffhanger. Var kritisk." — och få ett
öppet, ärligt, gärna kritiskt svar, inte en fast mall.

**Skiljer sig från två befintliga funktioner som kan se ut som samma
sak vid en snabb titt:**
- **Analyze** (`chapterFeedback.ts`, `ANALYZE_SYSTEM`) är redan en
  hantverkskritik av kapitlet — men med **fasta kategorier** (show vs
  tell, dialogpurposelöshet, röstglidning, karaktärstrohet, plus två
  barnsäkerhetskategorier), strukturerat JSON-svar, ingen fri fråga.
  Kan inte svara på "är slutet en stark cliffhanger?" om den frågan
  inte är en av de inbyggda kategorierna.
- **Ask Manuscript** (`askManuscript.ts`, `ASK_MANUSCRIPT_SYSTEM`)
  tillåter fri text, men är byggd för **faktafrågor mot hela manuset**
  via semantiskt sökta utdrag ("vilken färg har Emmas ögon?") — prompten
  förbjuder uttryckligen modellen att tycka eller gissa: "Never invent
  ... say so plainly instead of guessing." Fel ton och fel omfång för
  en kritisk hantverksbedömning av just det aktuella kapitlet.

Den riktiga luckan: fri fråga + kritiskt/tyckande svar + skopat till
det man just skrivit (kapitlet eller scenen), inte hela manuset och
inte en fast mall.

**Tänkbar form, inte bestämd:** ett textfält (liknande Ask Manuscripts
frågefält) i kapitel-/scenvyn, bredvid eller som ett nytt läge på
Analyze — skickar kapitlets (eller scenens) prosa plus författarens fria
fråga till Review-modellen (samma spår som Analyze/Extract/
Korrekturläsning, inte skrivmodellen), med en systemprompt som
uttryckligen UPPMUNTRAR ärlig, gärna hård kritik — motsatt ton mot
Ask Manuscripts försiktiga "säg hellre att du inte vet". Svaret är
efemärt precis som Ask Manuscripts svar — sparas inte i boken, ändrar
ingen fakta, är bara ett svar att läsa.

**Öppna frågor inte lösta än:** kapitel eller scen som skopa (troligen
båda, som Analyze redan kan välja); om svaret ska kunna citera exakta
rader ur prosan (som Analyze gör) eller bara resonera fritt; om det ska
vara en helt ny yta eller en frivillig fri fråga ovanpå Analyze.

**Status: byggd (v1.0.33).** Återanvänder Instructs markeringsmekanik
i `ProseCanvas.tsx` (nytt menyval "Fråga…") istället för att bygga ny
markerings-UI. Review-modellen (icke-strömmande, som Analyze/Ask
Manuscript), inte skrivmodellen. Ny systemprompt (`src/core/
askAboutPassage.ts`) som uttryckligen uppmuntrar ärlig, specifik kritik
— motsatt Ask Manuscripts försiktiga "säg hellre att du inte vet".
Täcker både markerad text (med omgivande kontext) och hela kapitlet
utan markering, via en ny knapp bredvid Analyze. Efemärt svar, sparas
aldrig, ändrar inget — som Ask Manuscript.

---

### 33. Timeline som gantschema, ihopslaget med Plotlines
Uppstod ur arbetet med webbsidans mockup (2026-09-28): skärmdumparna på
sajten är påhittade, men "Timeline som ett gantschema" var en idé värd
att spara på riktigt.

**Nuläget:** Timeline (`src/ui/Timeline.tsx`, `src/core/timeline.ts`) är
idag bara en omdragbar lista — ett kapitel per rad, i story-ordning, med
ett **fritextfält** för "story time" (t.ex. "Dag 3, morgon") och
upp/ner-knappar för att flytta ett kapitel i story-tidsordning. Ingen
visuell axel, ingen längd, ingen överlappsvy. Plotlines
(`src/core/plotlines.ts`, byggd v0.79) är en helt separat yta: en
matris av kapitel × namngivna trådar, uttryckligen byggd som "bara en
tabell", medvetet INTE en nodgraf (se v0.79-beslutet ovan).

**Förslaget:** slå ihop de två till en gantschema-vy — varje kapitel
blir en stapel på en tidsaxel, färgkodad efter vilken Plotline den
tillhör. Man skulle direkt se om två trådar rör sig parallellt eller om
en tråd har ett glapp, istället för att läsa en lista och en matris var
för sig.

**Den egentliga byggkostnaden är inte visualiseringen, det är
datamodellen.** `story_time` är idag medvetet fri text — ett gantschema
kräver däremot ett jämförbart värde att positionera och sortera staplar
efter (relativ dag/vecka, eller start+längd), inte en textrad ett
författare kan skriva vad som helst i. Det är en riktig
schemautvidgning, inte en ren UI-ombyggnad — och rör troligen samma typ
av avvägning som redan gjordes för `story_time_order` (punkt 9): hålla
det på kapitelnivå i v1 eftersom ett kapitel fortfarande är en enda
scen, tills en verklig anledning finns att gå ner på scennivå.

**Beslut (2026-09-29): bygg punktvarianten, inte den riktiga
Gantt-varianten.** Författarens bedömning: att dra/ändra
stapellängder i ett gantschema är inte intressant för författare —
värdet ligger i att se ordning och glapp, inte i exakt tidslängd.
Byggd som en tabell: kapitel som kolumner i story-tidsordning, trådar
som rader, en prick per kapitel×tråd — se `TimelineBoard.tsx` och
`timelineBoard.ts` (v0.99.62). Ersätter både Timeline-listan och
Trådmatrisen (samma nav-knapp, samma handlingar, bara ihopslagna).
Ingen schemautvidgning gjordes — `story_time` är fortsatt fri text,
kolumnernas bredd är rangordning, inte verklig tidsdistans. Den
riktiga stapel/längd-varianten (start + längd, en faktisk
schemautvidgning) är avfärdad, inte bara uppskjuten.

**Status: idé nedskriven, inte påbörjad.** Inget kodat.

---

### 34. Startskript för Mac och Linux (som `starta.bat`)
Uppstod ur diskussionen om webbsidans "Download"-knapp (2026-09-28):
istället för en riktig paketerad installerare (Electron/Tauri — stor,
löpande kostnad: kodsignering, macOS-notarisering, separata byggen per
OS, ~100-200MB för Chromium-runtimen), gör samma jobb som
`starta.bat` redan gör för Windows, fast för de andra två plattformarna.

**Vad `starta.bat` redan gör (för referens den dag detta byggs):**
kollar att Node.js finns (`where node`, ber användaren installera det
från nodejs.org annars), kör `npm install` första gången
(`node_modules` saknas), kör sedan `npm start`, med felmeddelanden om
något går fel. Rakt fram att spegla i ett `.command`-skript (macOS,
dubbelklickbart från Finder) och ett `.sh`-skript (Linux) med samma
tre steg (kolla Node, `npm install` vid behov, `npm start`).

**Känd, oundviklig friktion:** macOS Gatekeeper varnar ändå första
gången ("okänd utvecklare") för ett osignerat skript — användaren
måste högerklicka → Öppna en gång. Engångsirritation, inget som kräver
certifikat eller notarisering för det här (billigare) alternativet.

**Författarens tillägg, medvetet uppskjutet till om/när en riktig
installerare någon gång byggs (idé, inte plan):** kunna installera
Ollama automatiskt som en del av installationen, inte bara StoryBook
själv. Det adresserar det som redan konstaterades vara den större
tröskeln för en icke-teknisk författare (Ollama + modellnedladdning +
`OLLAMA_ORIGINS`-inställningen), inte bara `npm install`-steget. Hör
ihop med, men är ett separat, större steg än, det här skriptet —
loggat här som en anteckning för den dagen, inte som ett eget mål nu.

**Status: byggd (v0.99.71).** `starta.command` (macOS, dubbelklickbart
från Finder) och `starta.sh` (Linux, körs med `./starta.sh` i en
terminal) — samma tre steg som `starta.bat`: kollar Node, kör
`npm install` bara om `node_modules` saknas, kör sedan `npm start`.
`starta.command` är bara en tunn wrapper som anropar `starta.sh`, så
logiken finns på ett ställe. Gatekeeper-varningen (se ovan) gäller
fortfarande första gången på macOS — inget sätt att undvika den utan
kodsignering/notarisering, oförändrat från analysen ovan.
Ollama-auto-install-tillägget är fortfarande medvetet uppskjutet.

**Uppdatering (2026-09-30):** dagen som nämns ovan är nu — se #35.
Chromium-runtime-kostnaden i den ursprungliga analysen gäller
egentligen bara Electron; Tauri (som #35 landade på) använder OS:ets
egen webview och drar inte med sig den kostnaden. Kodsignerings-/
notariseringsresonemanget här står sig dock oförändrat och är samma
avvägning #35 gör.

---

### 35. Riktig installerare/uppdaterare för Windows (Tauri) — helhetsidé

**Bakgrund.** Uppföljning på #34: dagen "om/när en riktig
installerare någon gång byggs" är nu, efter att Mats installerade
OnlyOffice och undrade hur deras "Online installer" fungerar, och en
testares feedback (se project_spec.md v1.0.25) pekade på samma
tröskel — en icke-teknisk författare skräms av terminalfönster och
kommandorader, och Ollama + modellval + `OLLAMA_ORIGINS` är ett
större hinder än själva `npm install`-steget.

**Idén i korthet:** en fristående Windows-app som installerar
StoryBook AI, hjälper till att installera Ollama, föreslår en
modell utifrån datorns VRAM, och kollar efter uppdateringar — utan
att StoryBook AI själv slutar vara 100% lokalt.

**Vald teknik: Tauri, inte Electron.** Tauri använder OS:ets egen
webview istället för att bunta med ett helt Chromium (Electrons
kostnad, se #34-uppdateringen ovan) — mycket mindre nedladdning,
känns mindre skrämmande redan vid installationsögonblicket. Samma
React-app (StoryBook AI:s befintliga `dist/`-bygge) körs i Tauris
webview, ingen omskrivning av appen.

**Två delar:**
1. **En liten "online installer"-stub** (Inno Setup, med
   tillägget `ISDownloadPlugin` — byggt för precis den här typen av
   "ladda ner under installationen"-flöde, samma mönster som
   OnlyOffices nedladdningssida). Laddar ner och kör, i tur och
   ordning: Ollamas egen (tysta) Windows-installer om den saknas, och
   Tauri-launcherns installer.
2. **Tauri-launcher-appen** — den bestående delen. Serverar StoryBook
   AI lokalt i sin webview, läser av GPU/VRAM (`nvidia-smi`/WMI) och
   föreslår en modellstorlek (tumregel, inte exakt vetenskap — 8GB →
   7B q4, 16GB → 13B, 24GB+ → 30B+ osv, ramat som utgångspunkt), och
   sköter uppdateringskoll.

**Uppdateringskoll — hur StoryBook förblir 100% lokal.** StoryBooks
egen kod ska aldrig göra ett utgående nätverksanrop — det är löftet
som gör "100% lokal" trovärdigt. Två fall:
- Körs StoryBook inuti Tauri-appens egen webview (huvudscenariot):
  en "Kolla efter uppdateringar"-knapp i Inställningar anropar
  Tauris JS-brygga direkt (`invoke("check_for_updates")`) — Rust-
  skalet gör nätverksanropet, StoryBooks egen JS rör aldrig internet.
- Körs StoryBook i en vanlig webbläsarflik (t.ex. via `starta.bat`,
  se #34): ett eget registrerat URL-protokoll (`storybookai://
  check-update`) kan väcka den separat installerade Tauri-appen och
  låta den göra kollen. Knappen kollar `window.__TAURI__` för att
  veta vilket fall den är i.
- Samma `storybookai://`-protokoll kan senare användas för
  djuplänkar in i appen (t.ex. öppna ett specifikt manus), inte bara
  uppdateringskoll.

**Uppdateringar i två lager:** launcher-appen sig själv (Tauris
inbyggda updater-plugin) och StoryBook AI-bygget inuti den, separat
och oftare — det senare kräver ingen ny installer-nedladdning, bara
ett nytt `dist/`-bygge som launchern hämtar.

**Kodsignering — medvetet uppskjutet, inte avfärdat.** Inga pengar
för det just nu. Beslut: shippa osignerat, förklara varningen tydligt
i installationsflödet och på nedladdningssidan ("Windows kan visa en
varning... klicka Mer information → Kör ändå", med skärmdump) istället
för att låta användaren möta den oförberedd. Självsignering hjälper
inte (SmartScreen litar bara på CA-utfärdade certifikat). SmartScreens
rykte-system är per filversion/hash, inte per app — täta
installer-versionsbumpar bygger alltså inte upp förtroende gratis över
tid, värt att komma ihåg om varningen blir ett återkommande klagomål.
Två vägar när/om budget finns: ett EV-certifikat (omedelbart
förtroende, dyrare/kräver hårdvarutoken), eller distribution via
Microsoft Store (Microsoft granskar appen på riktigt, SmartScreen-
varningen försvinner helt, men kräver MSIX-paketering och att följa
Store-policyer). Den manuella vägen (`starta.bat`/`.command`/`.sh`,
#34) finns kvar som alternativ för den som inte vill lita på en .exe
alls.

**Miljöverklighet för det fortsatta arbetet** (konstaterat
2026-09-30 i den här sandlådan): Rust/Cargo finns och fungerar här,
så Tauri-appens logik kan byggas och verifieras i Linux-läge
(`cargo tauri dev`). Ingen Windows-korskompilering är installerad
(inget mingw, ingen NSIS/WiX) — den riktiga Windows-.exe:n måste
produceras via GitHub Actions med en `windows-latest`-runner (Tauris
officiella `tauri-action`), eller på en riktig Windows-dator. Samma
sak gäller Inno Setup-stubben — skrivs som källa här, kompileras till
.exe via CI eller på Windows.

**Föreslagen första etapp (inte hela installern på en gång):**
scaffolda en Tauri-app i repot som serverar det redan byggda
`dist/`-bygget, verifiera att den startar och visar StoryBook AI
korrekt via `cargo tauri dev` i Linux-sandlådan, och sätt upp ett
GitHub Actions-workflow som producerar den riktiga Windows-
artefakten. Ollama-detektion/auto-install, VRAM-avläsning +
modellförslag, uppdateringskoll-UI + protokollregistrering, och
Inno Setup-stubben byggs som separata steg efter det, på samma grund.

**Status: scaffolding-etappen klar (2026-09-30 kväll).** `src-tauri/`
finns i repot (`npx tauri init` + eget `se.ocedo.storybookai`-
identifier, 1320×860-fönster, mål begränsat till NSIS/Windows). Egen
ikon genererad (rust-färgad "S", samma ton som appens mörka tema) —
ren platshållare, byt gärna ut mot en riktig design senare. Verifierat
live i sandlådan: `cargo tauri dev` under Xvfb, skärmdump bekräftar
att StoryBook AI renderas korrekt i webviewen (samma startsida,
samma "Connect a local AI"-ruta) — skalet fungerar. Ett GitHub
Actions-workflow (`.github/workflows/desktop-build.yml`) bygger den
riktiga Windows-.exe:n på en `windows-latest`-runner via
`tauri-action`, osignerad (se signerings-resonemanget ovan),
laddas upp som artefakt.

**Uppdatering samma kväll: workflowet kört och GRÖNT.** Tre
körningar innan det gick igenom — alla tre riktiga, tidigare okända
buggar, inte flakiness: (1) `package.json` saknade ett `"tauri"`-
npm-script som `tauri-action` kör (`npm run tauri build`) — fel på
sekunder. (2) `npm run build` (`tsc -b && vite build`, det Tauri
faktiskt anropar) hade aldrig körts rent — `tsconfig.json` saknade
`"DOM.Iterable"` i `lib` (döljde i sin tur ett andra fel:
`Boolean(card)` typnarrowar inte `card: HTMLElement | null`, till
skillnad från `card !== null`). Det första felet hade jag själv
filtrerat bort som "förbefintligt, orelaterat" i varje
`tsc --noEmit`-körning hela sessionen, eftersom min egen
verifiering aldrig körde det riktiga `npm run build`-kommandot
end-to-end förrän Tauri-CI:n gjorde det på riktigt. Båda buggarna
fixade, verifierade lokalt (`npm run build` rent, alla 775 tester
gröna), pushade. Körning #3 lyckades: byggde och laddade upp en
~10 MB `storybook-ai-windows-installer`-artefakt
(https://github.com/ocedo-apps/StoryBook-AI/actions/runs/36757244097).
**Uppdatering: provkörd av Mats på en riktig Windows-dator samma
kväll — fungerade.** Installationen gick igenom, appen startade i
ett eget fönster (Tauris WebView2-skal, inte en flik i Mats vanliga
webbläsare — precis som tänkt). Hela kedjan (installer → launcher →
StoryBook AI renderad) bekräftad på riktig hårdvara, inte bara i
sandlådan. Ollama-detektion/auto-install, VRAM-avläsning +
modellförslag, uppdateringskoll-UI + `storybookai://`-
protokollregistrering är fortfarande inte påbörjade — nästa steg.

**Uppdatering: Ollama-hjälp + VRAM-modellförslag klart
(2026-09-30, Mats: "Då kör vi den delen nu").** Kunde inte
verifiera Ollamas faktiska nedladdnings-URL härifrån (`ollama.com`
blockerad för utgående nät i sandlådan) — löste det genom att aldrig
hårdkoda en `.exe`-länk: en ny knapp öppnar istället
`https://ollama.com/download` i systemets webbläsare
(`tauri-plugin-opener`), säkrare än att tyst ladda ner och köra en
tredjepartsinstallerare. VRAM läses via `nvidia-smi` (NVIDIA-only,
`None` annars) och mappas till en av fem storleksklasser genom en
ren, enhetstestad `suggest_model_tier()` i
`src-tauri/src/system_check.rs` — returnerar bara en nyckel (t.ex.
`"7b"`), texten ligger i `src/ui/i18n/{sv,en,nb}.ts` som allt annat
appspråk. Syns bara i desktop-appen när Ollama inte är anslutet
(`Home.tsx`s "Connect a local AI"-ruta), osynligt i vanlig
webbläsare. Detaljer i project_spec.md v1.0.28. **Inte verifierat
härifrån:** riktiga VRAM-siffror, det faktiska installationsflödet
på riktig hårdvara.

**Uppdatering: uppdateringskoll klar (2026-09-30, Mats valde denna
som nästa steg).** "Kolla efter uppdateringar"-knapp på hemskärmen
(desktop-only), jämför mot senaste GitHub Release. `storybookai://`
-protokollet byggt (`tauri-plugin-deep-link`) — viktig upptäckt:
till skillnad från macOS/iOS skickar Windows/Linux INGET event, utan
startar en helt ny app-instans med länken som kommandoradsargument;
löst genom att läsa `std::env::args()` i appens egen `setup()`.
CI publicerar nu en riktig, beständig GitHub Release (tagg
`v<version>`, `.exe` bifogad) istället för bara den 90-dagars-
förfallande workflow-artefakten — nödvändigt för att uppdaterings-
kollen ska ha något stabilt att jämföra mot och länka till. Guiden
uppdaterad enligt påminnelsen nedan (sparas kvar här som historik).
Detaljer i project_spec.md v1.0.29. **Inte verifierat härifrån:**
att Release-publiceringen går igenom i CI, att `storybookai://`
faktiskt fungerar på en riktig Windows-dator, att knappens
nätverksanrop mot api.github.com lyckas i produktion.

**Uppdatering: Inno Setup-stubben skriven (2026-10-01, Mats: "Vi kör
igång med stubben").** `installer-stub/storybook-ai-online-installer.iss`
— laddar ner och installerar Ollama tyst om det saknas (Ollamas
installer är själv Inno Setup-byggd, bekräftat via dess `/DIR=`-flagga,
så `/VERYSILENT`-flaggorna är Inno Setups egna universella, inte en
gissning om Ollama), laddar sedan ner StoryBook AI:s senaste installer
och lämnar över den normalt till användaren. Använder Inno Setup 6.3+:s
inbyggda `[Files]`-nedladdning, inte den gamla tredjeparts-DLN:n
("Inno Download Plugin") som inte går att källa pålitligt längre.
Kompileras via `Minionguyjpro/Inno-Setup-Action` på `windows-latest`
(ny `.github/workflows/installer-stub-build.yml`), publiceras till en
egen stabil Release-tagg (`installer-stub`), separat från appens
versionstaggar. Detaljer i project_spec.md. **Inte verifierat
härifrån:** `.iss`-filen har aldrig körts genom en riktig kompilator
(jrsoftware.org blockerad, kunde inte ens testa under Wine), så
räkna med minst någon CI-runda till innan det är grönt — samma
mönster som Tauri-bygget första gången.

**Kvarstår, inte påbörjat:** provköra hela stub-kedjan på riktig
Windows-hårdvara (med OCH utan Ollama förinstallerat), provköra
uppdateringsflödet (inte bara att det byggs) på riktig hårdvara.

**Guide-påminnelsen nedan är nu åtgärdad** (behållen som historik):
`handbookSections.privacy` (alla tre språk — "Ett helt stängt
digitalt kassaskåp") lovade tidigare uttryckligen "inga
uppdateringskontroller mot GitHub" som ett av flera konkreta
bevis för att appen är helt lokal. Den raden blev sakligt fel så
fort launcher-appen kan kolla GitHub för nya versioner av sig
själv — även om StoryBooks egen kod (webbappen) aldrig gör det
anropet själv (se resonemanget om Tauri-bryggan ovan). Huvud-
löftet ("ditt manus lämnar aldrig din dator") mjukades INTE upp —
det stämmer fortfarande, absolut. Bara GitHub-raden skärptes till:
"ingen del av StoryBook AI skickar ditt manus någonstans; den
fristående skrivbordsappen (frivillig) kan kolla om det finns en
nyare version av sig själv, aldrig av din text." Ändringen gjordes
i samma commit som uppdateringskollen faktiskt shippades.

---

### 36. Lokal bildgenerering — skicka illustrationsprompten till en lokal bild-AI istället för urklipp

**Bakgrund.** Mats: "Skulle man kunna ställa in så att man kan skapa
bilder lokalt om man har ett kort som klarar det? Så att den prompt
jag kopierar och klistrar in i t.ex Gemini istället körs mot min
lokala AI-bildgenerator?" Idag genererar StoryBook (via den lokala
LLM:en) en bildprompt-text som författaren kopierar och klistrar in
i ett externt verktyg (Gemini, Midjourney, m.fl.) för att faktiskt
skapa bilden — `src/core/illustrationPrompt.ts` bygger prompten,
`Editor.tsx` visar den i en dialog med en Kopiera-knapp
(`navigator.clipboard.writeText`). Själva bildgenereringen sker
alltså helt utanför appen idag, manuellt.

**Idén:** låt StoryBook skicka samma prompt direkt till en lokalt
körande bildgenerator (t.ex. AUTOMATIC1111 eller ComfyUI) via dess
lokala HTTP-API — samma mönster som Ollama-anropet, bara ett annat
lokalt API. Ingen molntjänst inblandad, passar "allt lokalt"-
principen (§9) rakt av.

**Vad som redan finns att bygga vidare på:** appen har redan
bild-blob-lagring (`entityMedia.ts`/`EntityMediaSchema`, används
idag för illustrationsstilarnas exempelbilder och
entity-bilder/`BlobThumbnail`) — en genererad bild skulle kunna
sparas där, ingen helt ny lagringsmekanism behövs.

**Huvudsaklig avvägning, varför det inte bara är att bygga:**
till skillnad från Ollama (en installer, dra ner en modell, klart)
är lokal bildgenerering betydligt krångligare att sätta upp —
Python-miljö, flera GB stora modellcheckpoints, ofta GPU-specifik
konfiguration. Det blir alltså en feature för en mindre skara med
kapabla grafikkort och viss teknisk tålamod, inte den bredare
icke-tekniska målgrupp installer-spåret (#35) är byggt för. Det
finns heller ingen Ollama-motsvarande de-facto-standard för lokal
bildgenerering än — A1111 och ComfyUI har olika API:er, så ett val
av backend (A1111 trolig favorit, störst spridning) blir en egen
designfråga, inte "stöd vilken som helst".

**Status: lagd som idé, inte påbörjad.** Mats: "Lägg in det som
idé" efter en inledande diskussion — inget konkret förslag
(UI, val av API, koppling till bild-lagringen) är utarbetat än.

---

### 37. Namnbyte till WrighterAI (eller WrajterAI) — checklista, inget beslut än

**Bakgrund.** Mats: "jag funderar på om jag ska döpa om appen till
WrighterAI eller WrajterAI. Det är svårt att hitta en dän för
StorybookAI och dessutom är Storybook redan ett begrepp för UI tror
jag." Giltig poäng — Storybook (storybook.js.org) är ett väletablerat
namn i frontend-utvecklingsvärlden, så namnkonflikten/domän-
konkurrensen är reell, inte överdriven. Min rekommendation mellan de
två alternativen: "Wrighter" (läses direkt som "writer" men bär också
"wright" = hantverkare/byggare, som i playwright/shipwright — matchar
appens idé om strukturerat hantverk) snarare än "Wrajter" (svårare
att läsa rätt på första anblicken).

**Inget beslutat än** — Mats: "jag är inte säker än. En checklista
kan vara bra." Så detta är ren förberedelse inför ett eventuellt
beslut, inte ett pågående arbete.

**Checklista, genomsökt i hela kodbasen (inte gissad):**

**A. Ren varumärkes-/visningstext (lågrisk, bara att göra när/om
beslutet tas):** `package.json` (`name`/`description`),
`index.html`-titeln, `tauri.conf.json`s `productName` (INTE
`identifier`, se B), loggan själv (`public/logo.png`/`logo-dark.png`
— kräver nydesign, inte bara filnamnsbyte), all UI-text på tre
språk som nämner namnet, README.md, CHANGELOG.md-rubriken,
Guide/Handbok-texter, och GitHub-repots eget namn
(`ocedo-apps/StoryBook-AI`).

**B. Interna tekniska ID:n kopplade till BEFINTLIGA testares data —
rekommendation: rör INTE dessa, oavsett beslut om namnbyte.** Det är
den farliga kategorin: byts de samtidigt som namnet tappar befintliga
testare tyst åtkomst till sitt sparade arbete.
- IndexedDB-databasnamnet (`"storybook-ai"`, `src/persistence/
  Repository.ts`) — där alla manus faktiskt lagras i webbläsaren.
  Byts det utan migrering öppnas en ny, tom databas; gamla manus
  "försvinner" (finns kvar på disk, appen hittar dem bara inte).
- 12 localStorage-nycklar (`storybook-ai.theme`, `.engine`,
  `.last-book`, `.base-url`, `.model`, `.review-model`, `.locale`,
  `.context-window`, `.prose-history-limit`, `.writing-primer`,
  `.last-json-backup.*`, `.manuscript`) — nollställer tyst alla
  inställningar om de byts.
- Backup-filens "kind"-stämpel (`MANUSCRIPT_BACKUP_KIND =
  "storybook-ai.manuscript"`, `src/core/manuscriptBackup.ts`) —
  bränd in i varje redan sparad `.json`-säkerhetskopia. Byts den
  utan bakåtkompatibilitet går gamla backuper inte att importera i
  en omdöpt app.
- Tauri-appens `identifier` (`se.ocedo.storybookai`,
  `src-tauri/tauri.conf.json`) — Windows egen app-identitet
  (register, uppdaterings-/avinstallationsposter). Byts den blir det
  en HELT NY app för Windows, inte en uppdatering av den gamla —
  befintliga desktop-testare får två installerade appar sida vid
  sida istället för att den gamla ersätts.

Rekommendation: behåll alla dessa interna ID:n som de är, för alltid
— osynliga för användaren ändå, så det gör hela namnbytet riskfritt
för befintliga testare.

**C. Infrastruktur som hänger ihop med repo-namnet** (måste göras i
samma svep om/när repot byter namn, annars tillfälligt trasiga
länkar): hårdkodade GitHub-URL:er i `.github/workflows/*.yml`,
`installer-stub/*.iss`, `src-tauri/src/update_check.rs`
(RELEASES_URL), `UpdateCheckDialog.tsx` (länk till ändringsloggen),
README, CHANGELOG; release-/installerfilnamnen
(`StoryBook-AI-Setup.exe`, `StoryBookAI-OnlineInstaller.exe`,
workflow-artefaktens namn); release-namnen själva ("StoryBook AI
v1.0.30").

**D. Utanför repot, Mats egna att-göra:** domänregistrering för det
nya namnet; eventuell befintlig närvaro (sociala medier, community)
under StoryBook AI-namnet; syskonrepot Sandbox-AI:s egen
dokumentation nämner StoryBook AI ("This is a sibling of Sandbox
AI") — inte kollat, den repon fanns inte i den här sessionen;
meddela befintliga testare om bytet — Mats egen poäng om att det
kan vara en snygg nyhet att kommunicera ("nu byter vi namn till
WrighterAI").

**Status: checklista klar, inget beslut.** Väntar på att Mats
bestämmer sig för om, och i så fall vilket, nytt namn.

---

### 38. Relevansfiltrering av lore-fakta i Story Bible-prompten ✅ byggd (v1.0.32)

**Bakgrund.** En testare jämförde StoryBook mot SillyTavern/Writingway
och pekade på en verklig arkitektur-brist: alla låsta Story
Bible-fakta skickas alltid med i Draft-prompten, oavsett om kapitlet
som skrivs faktiskt har med dem att göra. Det är rimligt för fakta
som härstammar från manuset själv (`origin: "chapter"`/`"interview"`
— de växer bara i takt med manuset, och att utelämna en redan
etablerad sanning vore ett kontinuitetsfel). Men en importerad
lore-fakta (`origin: "lore"`) är bakgrundsinformation, inte "vad
berättelsen redan sagt" — och en testare med en stor, importerad
setting kan få en Story Bible där lore-delen växer mycket snabbare än
manuset, vilket (a) sväller prompten i onödan och (b) begraver de
fakta som faktiskt är relevanta för kapitlet bland hundratals som
inte är det.

Konkret exempel som avslöjade bristen: en Patron-karaktärs
sponsring var inte skriven som en enda fakta utan som två separata
lore-artiklar — en om Patronen själv, en om själva sponsrings-
händelsen (en Event-entitet med `EventProfile.participants`) — och
ingen av dem nämnde varandra med namn. Ett rent namn-i-text-filter
hade missat kopplingen helt.

**Lösning.** Ny bok-inställning `filter_lore_by_relevance` (boolean,
default `false` — befintliga böcker beter sig exakt som innan).
Avstängd: ingen förändring alls. Påslagen: `origin: "lore"`-fakta tas
bara med i Draft-promptens Story Bible-sektion (kapitel- och
scen-nivå) om minst ett av:
- fakta är pinnad med `position_override: "include"` (samma fält/knapp
  som redan fanns för story-tid-positionering i `BiblePanel`, nu med
  bredare betydelse — texten i UI:t är uppdaterad för att spegla det),
- entitetens eget namn nämns i kapitlets brief/text-hittills/taggade
  Plotlines (eller scenens egen brief/text för en scen-riktad pass),
- för en Event-entitet: en deltagare eller platsen (`EventProfile.
  where`/`.participants`, från v1.0.27) nämns istället, även om
  händelsens eget namn aldrig nämns direkt — exakt vad som löser
  Patron/Event-scenariot ovan.

`origin: "chapter"`/`"interview"`/`"brainstorm"`/`"synopsis"`/
`"brief"`-fakta, och fakta utan `origin` alls (äldre sparfiler),
påverkas inte — de tas alltid med precis som innan.

**Avgränsning, medvetet.** Filtret sitter bara i
`formatBibleForPromptAtPosition` (Draft, kapitel + scen). Extend/
Elaborate/Instruct/Beat (`passageUserPrompt`) använder redan idag den
opositionerade `formatBibleForPrompt` och är opåverkade — en redan
existerande inkonsekvens i kodbasen, inte något som fixades här.
Recast/Analyze/Korrekturläsning/Brainstorm är avsiktligt opåverkade
sedan tidigare (de resonerar om text/anteckningar som redan finns,
inte om vad ett kapitel "får veta än").

Ingen ny transparens-UI byggdes för att visa exakt vilka fakta som
filtrerades bort — den befintliga Prompt Inspector-funktionen (visar
redan skickade meddelanden + uppskattat antal tokens) täcker behovet.

**Implementation:** `src/core/loreRelevance.ts` (ny fil —
`relevantContextText`, `isLoreFactRelevant`,
`filterLoreFactsByRelevance`), `filter_lore_by_relevance` i
`BookSchema.ts`, inkoppling i `generateProse.ts`s
`formatBibleForPromptAtPosition`, kryssruta i `SettingsPanel.tsx`,
uppdaterad tooltip-text för `position_override`-knappen i
`BiblePanel.tsx`/i18n.

---

### 39. Korrekturläsning: varna om öppna platshållare innan körning

Mats observation: om man har satt platshållare (post-it-lappar på en
textposition, `Chapter.placeholders`) så borde Korrekturläsning
påpeka det innan man kör — annars är det lätt att glömma bort en
olöst platshållare helt.

**Research gjord, inte byggd.** Platshållare är redan separat
metadata (inte inline-text i prosan), med en färdig `collectPlaceholders
(chapters)` (`src/core/placeholders.ts`) som ger en bok-bred,
grupperad-per-kapitel lista — exakt det en varning skulle behöva.
Korrekturläsning har idag noll medvetenhet om platshållare (ingen
träff i proofread.ts/proofreadRun.ts/proofreadSchema.ts).

**Föreslagen lösning:** `ProofreadSetupCard.tsx` är redan pre-flight-
dialogen som visas före varje körning (första start och "kör igen"),
och vet redan om körningen är kapitel- eller manus-scopead — naturlig
plats att räkna öppna platshållare (hela boken, eller bara det
scopade kapitlet) och visa en varning som "Kapitel 2 har 3 öppna
platshållar-noter" ovanför Start-knappen. Icke-blockerande (bara en
påminnelse, inte ett hinder) — platshållare är medvetet designade att
aldrig påverka vad som skickas till modellen, så det finns ingen
teknisk anledning att hindra körningen.

**Status: inte påbörjad.** Mats bad att spara idén här istället för
att bygga direkt.

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
