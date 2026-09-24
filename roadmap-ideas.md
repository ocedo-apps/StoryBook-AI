# Roadmap-idéer — författarverktygets djup

Status: levande dokument, v1.0 (2026-09-24)
Källa: samtal mellan författaren, ChatGPT och kodnings-AI om vad som är ett
bra verktyg för en författare, jämfört mot StoryBook AI:s faktiska läge.
Relaterat dokument: `project_spec.md` (§1, §9, §10, §12 särskilt relevanta).

Syftet med det här dokumentet är att **bevara idéerna**, inklusive de som
inte prioriteras nu eller inte alls — inte att vara ett bindande löfte om
vad som byggs. Ordningen nedan är den vi kommit fram till tillsammans,
inte en ensidig lista.

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

## Det enda stora arkitekturbeslutet

Innan någon Scene-kod skrivs måste den här frågan besvaras, med samma
noggrannhet som specen redan lagt på gränsen mellan kanon,
skrivinstruktion och RPG-runtime (§4.1, §7.1, §9):

> Vad är en Scene i StoryBook AI? Vad äger `BookScene` själv? Vad är
> `NarrativeFact`? Vad är bara skrivinstruktion (som kapitlets brief,
> POV, Voice redan är)? Och exakt vilken del av en Scene får korsa
> integrationsgränsen till Sandbox?

Ett konkret inspel till den diskussionen, redan verifierat mot koden:
Story Bible har redan en egen entitetskategori för platser
(`LOCATIONS`-fliken, samma `entity_ref`-system som karaktärer). En
scens `location_ref` (och `entity_refs[]`) bör peka på befintliga Story
Bible-entiteter, inte bli ett nytt fritextfält som duplicerar det
systemet. `story_time` bör troligen luta sig mot samma `core.*`-
namnrymdstänk som redan styr vad som får korsa gränsen till Sandbox,
snarare än en helt egen scen-specifik tidsrepresentation.

Det här beslutet är ett eget designspår, parallellt med kodningsordningen
nedan — inte punkt 1 i kön.

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

### 4. Model-provider-abstraktion ✅ byggd (v0.72)
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

### 7. AI-pipelinen blir scen-medveten, gradvis — extraktion klar (v0.74), Draft/Recast/Analyze återstår
Draft, Recast, Analyze, `extractFactsFromProse` lär sig förstå en
enskild scen istället för ett helt kapitel — införs stegvis, inte som
en enda stor omskrivning. Extract facts-flödet stämplar nu `scene_id`
(v0.74). Draft/Recast/Analyze rör inte fakta och har inget att stämpla
— deras prompter blir meningsfullt scen-medvetna först när riktig
scen-uppdelning finns att rikta dem mot, inte innan.

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

### 10. Continuity 2.0
Spatial kontinuitet (omöjlig förflyttning), objekttillstånd
(`gun.location`), kunskapstillstånd ("possible knowledge leak: Henrik
vet inte det här än"). Detta är LLM-steg 3-territoriet som
`ConsistencyGate` medvetet lämnat utanför v1 (§5, §6, §11) — men
strukturerad data från scenproveniens (punkt 6) gör att mycket av det
kan lösas deterministiskt, utan modellanrop.

### 11. Plotlines / scen-matris
Trådar kopplade direkt till scener (`scene.plotline_ids[]`), visuellt
som en matris scen × plotline.

### 12. Setup/payoff/ledtrådsspårning
"Pistolen introducerades scen 4, ingen payoff än." AI kan föreslå,
författaren markerar. Bra särart för genrefiction, men inte brådskande.

### 13. Utvecklingsmetoder som pluggbart lager
Generalisera den befintliga pipelinen (Brainstorm → Synopsis →
Dispositioner → Kapitel) till en valbar "Development Method"
(Snowflake, Three Act, Save the Cat, Hero's Journey, …). Metoderna får
bara producera/redigera samma underliggande data (Synopsis, Story
Bible, Plotlines, Scener) — aldrig en egen parallell databas.

### 14. Hel-manus developmental analys
Hierarkisk: scen-analys → kapitel-syntes → akt-syntes →
manus-rapport. Aldrig hela manuset i ett enda modellanrop. Sist i kön
— störst att bygga rätt, minst värde utan allt ovanstående på plats.

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
