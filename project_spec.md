# Project Spec — Open Source Narrative Engine (RPG + Bokverktyg)

Status: living document, v0.30
Relaterade dokument: `narrative-core-addendum.md` (v0.2-beslut)

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
