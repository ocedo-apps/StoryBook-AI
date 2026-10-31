# Project Spec — Open Source Narrative Engine (RPG + Bokverktyg)

Status: living document, v1.0.235
Relaterade dokument: `narrative-core-addendum.md` (v0.2-beslut),
`roadmap-ideas.md` (idéer och prioritering för Scene, Context
Inspector, Ask Manuscript m.fl. — v1.0, 2026-09-24)

**Separat spår — Windows-installerare/launcher (2026-09-30 kväll,
se roadmap-ideas.md #35).** Ingen version-bump här — det här är ett
eget delprojekt (Tauri-baserad desktop-app) vid sidan av StoryBook
AI-webbappen, inte en ändring av den. Mats: "Vi kan köra igång 😁"
efter att idén skrevs ner i sin helhet igår kväll.

**Genomfört (scaffolding-etappen):**

Miljökoll i sandlådan: Rust/Cargo 1.94.1 finns och fungerar, men
ingen Windows-korskompilering (inget mingw, ingen NSIS/WiX) — löste
det genom att installera Tauris Linux-byggberoenden
(`libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`,
`librsvg2-dev` m.fl. via apt) för att kunna utveckla och verifiera
appens logik i Linux-läge, och lägga den riktiga Windows-byggningen
på GitHub Actions istället för att kämpa med korskompilering här.

`npx tauri init --ci` scaffoldade `src-tauri/` rakt in i det
befintliga repot (Tauri v2.12.0) — pekar på det befintliga
`dist/`-bygget (`frontendDist`) och den befintliga Vite-dev-servern
på port 5175 (`devUrl`/`beforeDevCommand: npm run dev`), ingen
separat frontend-app. Justerade det genererade `tauri.conf.json`:
eget identifier (`se.ocedo.storybookai` istället för placeholder-
värdet `com.tauri.dev`), fönsterstorlek 1320×860 (standard-800×600
var för litet för ett skrivverktyg), och begränsade bundle-target
till `["nsis"]` — Windows-only, matchar planen.

Genererade en egen app-ikon istället för Tauris standard-robot: ett
beskuret "S" ur logotypens egen sketch-bokstav visade sig för
detaljrikt för att skalas ner snyggt (konstruktionslinjerna blir
grumliga brus vid 16–32px), så istället en ren, enkel platshållare —
en rost-färgad "S" (samma `--ink`-nyans som appens mörka tema,
`#d06a48` på `#14110e`) i Liberation Serif Bold. Genererade hela
ikonuppsättningen (.ico, .icns, alla PNG-storlekar) via
`npx tauri icon`.

**Verifierat live, inte bara "borde funka":** startade
`cargo tauri dev` under Xvfb (virtuell skärm) i sandlådan, väntade in
Rust-kompileringen (429 crates, ~1m30s) och Vite-dev-servern, tog en
skärmdump av det faktiska fönstret. StoryBook AI renderas korrekt i
Tauris webview — samma startsida, samma "Connect a local AI"-ruta,
samma mörka tema som i en vanlig webbläsare. Skalet fungerar.

Skrev `.github/workflows/desktop-build.yml` — bygger på
`windows-latest` via `tauri-apps/tauri-action`, osignerat (inget
kodsigneringscertifikat ännu, se roadmap-ideas.md #35), laddar upp
NSIS-installern som artefakt. Triggas manuellt eller vid push till
main som rör `src-tauri/`/`src/`. **Inte testat på riktigt än** —
kräver att workflowet faktiskt körs och att någon hämtar/provkör
.exe-filen på en Windows-dator, vilket jag inte kan göra härifrån.

`npm install` lade till `@tauri-apps/cli` (dev) och `@tauri-apps/api`
(runtime, för framtida `invoke()`-anrop från StoryBooks egen kod) —
verifierade att webbappens egen typecheck/tester/bygge fortfarande är
opåverkade (775 tester, rent bygge).

**Uppdatering samma kväll — CI-bygget kört på riktigt, grönt.**
Tre körningar, tre olika riktiga buggar innan det gick igenom (inte
flakiness): `package.json` saknade `"tauri"`-scriptet
`tauri-action` anropar; och `npm run build` (`tsc -b && vite build`)
hade aldrig körts rent — `tsconfig.json` saknade `"DOM.Iterable"` i
`lib`, vilket i sin tur dolde ett andra fel (`Boolean(card)`
narrowar inte `card: HTMLElement | null` för TypeScript, `card !==
null` gör det). Det första av de två tsc-felen hade jag själv
filtrerat bort som "förbefintligt, orelaterat" i varenda
`tsc --noEmit`-körning genom hela den här sessionen — min egen
verifiering körde aldrig det riktiga `npm run build`-kommandot
end-to-end, bara `tsc --noEmit` och `vite build` separat, vilket
råkade dölja att den faktiska build-kedjan var trasig. Fixade båda,
verifierade lokalt (rent bygge, alla 775 tester gröna) innan push.
Körning #3: grön, byggde och laddade upp en riktig ~10 MB
`storybook-ai-windows-installer`-artefakt. Länk till körningen:
https://github.com/ocedo-apps/StoryBook-AI/actions/runs/36757244097

**Uppdatering — Ollama-hjälp + VRAM-baserat modellförslag
(2026-09-30, Mats: "Då kör vi den delen nu").** Innan kodning:
försökte verifiera Ollamas faktiska Windows-installer-URL för att
kunna ladda ner/köra den direkt, men `ollama.com` är blockerad för
utgående nät i den här sandlådan (både `WebFetch` och rå `curl`,
även `github.com/ollama/ollama/releases` gav 403) — kunde alltså
inte verifiera en direkt `.exe`-länk. Löste det genom att INTE
hårdkoda en nedladdningslänk alls: en ny Tauri-kommando
(`open_ollama_download_page`, `src-tauri/src/system_check.rs`) öppnar
`https://ollama.com/download` i systemets vanliga webbläsare (via
`tauri-plugin-opener`) istället för att tyst ladda ner och köra en
tredjepartsinstallerare — säkrare design, och sidosteppar
verifieringsproblemet helt.

VRAM-avläsning: `nvidia-smi --query-gpu=memory.total
--format=csv,noheader,nounits` (NVIDIA-only — `None` för andra
tillverkare/ingen GPU, ärligt begränsad omfattning snarare än ett
falskt löfte). En ren, enhetstestad `suggest_model_tier(vram_mb)`
(samma fil) mappar VRAM till en av fem storleksklasser (3b/7b/14b/
30b/70b) — returnerar bara en stabil nyckel, ALDRIG färdig text,
eftersom Rust-sidan inte känner till appens språkval (sv/en/nb);
själva texten (`desktopGpuTier3b` osv.) ligger i
`src/ui/i18n/{sv,en,nb}.ts` precis som allt annat UI-språk. 5 nya
Rust-enhetstester (`cargo test`, gröna) för tröskelvärdena.

Frontend: ny `src/ui/desktopBridge.ts` (`isDesktopApp()` via
`@tauri-apps/api/core`s officiella `isTauri()`, tunna wrappers runt
`invoke()`), inkopplad i `Home.tsx`s befintliga "Connect a local
AI"-ruta — en "Installera Ollama"-knapp och VRAM-förslagsraden syns
bara när `isDesktopApp() && !connected`, dvs osynligt i en vanlig
webbläsarflik precis som planerat. Verifierat: `cargo check`/
`cargo test`/`cargo clippy`/`rustfmt --check` rent på Rust-sidan,
`npm run build` (den faktiska build-kedjan, inte bara `tsc --noEmit`
separat — lärdomen från förra rundans CI-miss) och alla 775 tester
gröna på webbapps-sidan innan push. **Inte verifierat härifrån:**
riktiga VRAM-siffror och det faktiska installationsflödet på en
riktig Windows-dator — det är Mats att bekräfta.

**Uppdatering — Uppdateringskoll klar (2026-09-30, Mats valde
"Uppdateringskoll i appen" som nästa steg).**

Rust-sidan (`src-tauri/src/update_check.rs`, ny modul): `GET
https://api.github.com/repos/ocedo-apps/StoryBook-AI/releases/latest`
(ureq 3.4 med rustls — verifierade dess exakta 3.x-API mot den
nedladdade crate-källan innan jag skrev mot den, eftersom 2.x→3.x
ändrade request/response-formen rejält). Jämför `tag_name` mot
`app.package_info().version` (satt via `tauri.conf.json`s eget
`"version"`-fält, samma siffra som `package.json` — en enda sanning,
ingen synk-risk mellan webbappens och launcherns versionsnummer).
En egen liten semver-tupel-parser (`parse_semver`, inte
`semver`-cratet — bara `major.minor.patch`, inget pre-release-behov)
gör själva jämförelsen, enhetstestad (6 tester totalt i modulen +
system_check.rs). Viktigt designval: Rust-sidan returnerar bara
siffror/URL:er, ALDRIG färdig UI-text — samma mönster som
GPU-tier-nycklarna i förra rundan, av samma skäl (appens språkval
sv/en/nb hör hemma i `src/ui/i18n`, inte hårdkodat i Rust).

`storybookai://`-protokollet: `tauri-plugin-deep-link` (registrerat
för schemat `storybookai` i `tauri.conf.json`). Upptäckte i
pluginets README ett viktigt Windows/Linux-specifikt beteende jag
inte kände till innan: till skillnad från macOS/iOS, där pluginet
skickar ett event, startar Windows/Linux OS:et en HELT NY
app-instans med länken som enda kommandoradsargument — ingen
`onOpenUrl`-lyssnare att sätta upp. Löste det genom att i appens
egen `setup()` anropa `handle_cli_arguments(std::env::args())` och,
om en `storybookai://`-länk hittas, köra samma uppdateringskoll direkt
och öppna GitHub-sidan om en nyare version finns — den enda rimliga
handlingen för en process vars enda syfte just då är att ha blivit
startad av den länken.

Generaliserade samtidigt `open_ollama_download_page` (förra rundan)
till en bredare `open_external_url(url)` — låst till `https://` (ett
enkelt guard-test), eftersom den nu har två anropare (Ollama-länken
OCH "Visa på GitHub"-länken i uppdateringsresultatet) och en ren
`<a target="_blank">` inte är garanterat att öppna systemets
webbläsare från Tauris webview på samma sätt på alla plattformar —
samma verifierade `tauri-plugin-opener`-väg för båda.

CI (`desktop-build.yml`): lade till ett publiceringssteg
(`softprops/action-gh-release`) som taggar `v<package.json-version>`
och bifogar `.exe`-filen som en riktig GitHub Release — inte bara den
90-dagars-förfallande workflow-artefakten som tidigare var enda sättet
att hämta bygget. Det här var nödvändigt, inte kosmetiskt:
uppdateringskollen behöver en beständig sanningskälla att jämföra mot
OCH en länk som faktiskt fortfarande fungerar om någon klickar den om
tre månader. Släppnoteringar hämtas automatiskt ur CHANGELOG.mds
översta `## [x.y.z]`-sektion (ett litet `awk`-skript), så det inte
blir ett separat steg att komma ihåg vid varje version.

Guiden uppdaterad enligt påminnelsen från förra rundan
(`handbookSections.privacy`, alla tre språk): tog bort "inga
uppdateringskontroller mot GitHub"-meningen, la till en ny mening om
att den fristående skrivbordsappen (frivilligt) kan kolla sin egen
version — aldrig manuset, som den inte ens har tillgång till.
Huvudlöftet orört.

Verifierat: `cargo check`/`test`/`clippy`/`rustfmt --check` rent (6
Rust-tester), `tsc --noEmit`, `npm run build` (den riktiga kedjan) och
alla 775 tester gröna, samt en live-skärmdump via `npm run tauri --
dev` under Xvfb som bekräftar att "Check for updates"- och "Install
Ollama"-knapparna renderas korrekt utan krasch (ingen `nvidia-smi` i
sandlådan, så GPU-förslaget uteblir tyst, som väntat). **Inte
verifierat härifrån:** att GitHub Release-publiceringen faktiskt
går igenom i CI, att `storybookai://`-länken faktiskt startar en ny
instans och triggar kollen på en riktig Windows-dator, att knappens
nätverksanrop mot api.github.com faktiskt lyckas i produktion (kunde
inte klick-testa det här — ingen `xdotool` i sandlådan).

**Uppdatering — Mats testkörde, hittade en verklig UX-bugg
(2026-09-30).** Mats installerade v1.0.29 på riktig hårdvara och
provade "Kolla efter uppdateringar": "Det är möjligt att det
fungerar men det blinkar bara till." Den ursprungliga lösningen
visade bara en liten `.quiet`-textrad under ledtexten på
hemskärmen — lätt att missa, ingen tydlig bekräftelse. Bytte ut den
mot en riktig modal dialog (`src/ui/UpdateCheckDialog.tsx`),
återanvänder det befintliga `.edit-overlay`/`.edit-card`-mönstret
som redan finns i appen (samma som t.ex. `ChapterFeedbackCard.tsx`)
istället för att uppfinna ett nytt UI-språk. Dialogen visar tydligt
"Letar..."/"Uppdatering finns"/"Senaste versionen"/fel, med två
knappar när en uppdatering finns: "Ladda ner uppdatering" (öppnar
release-sidan) och "Visa ändringslogg" (öppnar CHANGELOG.md direkt
på GitHub — det konkreta svaret på Mats önskemål om en
ändringslogg-länk).

Installerade `xdotool` i sandlådan (saknades tidigare, blockerade
klick-testning helt) för att kunna verifiera hela flödet på riktigt,
inte bara läsa koden. Upptäckte under tiden ett par praktiska
Xvfb-utan-fönsterhanterare-fällor: `import -window root` fångar
HELA skärmen i skärmkoordinater (inte fönstrets egna, trots att
fönstret ligger förskjutet på skärmen), och ett klick direkt efter
navigering hinner ibland fångas i en skärmdump innan webviewen
hunnit rita om sig — löst med `xdotool windowfocus` + en kort paus
innan skärmdumpen. Klickade igenom hela flödet: knappen öppnar
dialogen omedelbart, den visar "Letar efter uppdateringar…", och
växlar sedan till resultatet. I sandlådan blir resultatet ett
TLS-fel ("invalid peer certificate: UnknownIssuer") — inte en bugg,
utan förväntat: sandlådans utgående HTTPS går via en MITM-proxy för
loggning, som `rustls` (ureqs TLS-backend, med Mozillas publika
root-CA-lista inbyggd) korrekt vägrar lita på. På Mats riktiga
Windows-dator finns ingen sådan proxy, så anropet mot
api.github.com ska gå igenom rent. Stängknappen verifierad också
(klick + att dialogen faktiskt försvinner).

Verifierat: `tsc --noEmit`, `npm run build`, alla 775 tester, plus
den här live-klick-genomgången — den mest konkreta verifieringen av
en desktop-UI-funktion hittills i det här spåret.

**Uppdatering — Inno Setup-stubben skriven (2026-10-01, Mats:
"Vi kör igång med stubben").** Ingen version-bump här — rör varken
webbappen (`src/`) eller själva Tauri-launchern (`src-tauri/src/`),
bara ett nytt, fristående delprojekt i `installer-stub/`.

Research före kodning, inget gissat: `jrsoftware.org` (Inno Setups
egen sajt) är blockerad i den här sandlådan, precis som `ollama.com`
— men `raw.githubusercontent.com` fungerar, och Inno Setups
källkod ligger öppen på `jrsoftware/issrc`. Hämtade de OFFICIELLA
exempelskripten (`Examples/DownloadFiles.iss`,
`Examples/CodeDownloadFiles.iss`) direkt från den repon istället för
att lita på minnet eller en gammal tredjepartsplugin
("Inno Download Plugin", en Google Code-era DLL utan ren
CI-vänlig binärdistribution — övergiven till förmån för något
bättre). Upptäckte att Inno Setup 6.3+ har INBYGGT URL-nedladdning i
`[Files]`-sektionen (`Flags: external download`) — ingen
tredjeparts-DLL, inget `[Code]` behövs alls för själva
nedladdningen. Verifierade även `WelcomeLabel2` (den anpassade
välkomsttexten) genom att grep:a efter strängen i Inno Setups eget
Pascal-källskript (`Setup.WizardForm.pas`) snarare än att gissa om
meddelande-ID:t faktiskt finns.

Ollama-upptäckt: `{localappdata}\Programs\Ollama\ollama.exe` (Ollamas
dokumenterade binärsökväg). Ollamas egen Windows-installer visade sig
(via dess dokumenterade `/DIR=`-flagga — en Inno Setup-specifik
switch) vara byggd med Inno Setup, vilket gör
`/SP- /VERYSILENT /SUPPRESSMSGBOXES /NORESTART` till Inno Setups egna
universella tysta-installations-flaggor, inte en gissning om Ollama
specifikt — korsverifierat mot flera oberoende källor som listar
exakt samma flaggor för Ollama. StoryBook AI:s egen installer
lämnas INTE tyst — den visas normalt för användaren precis som idag,
eftersom jag inte kan verifiera Tauri-NSIS-installerns exakta
installationssökväg härifrån för att auto-starta appen efteråt.

Stubben laddar ner StoryBook AI från en NY, versionsoberoende URL
(`.../releases/latest/download/StoryBook-AI-Setup.exe`) — krävde en
liten CI-ändring i `desktop-build.yml`: varje bygge kopierar nu
installern till ett fast filnamn också, så stubben alltid hämtar
"senaste" utan att känna till versionsnumret eller anropa GitHub:s
API. Stubben själv publiceras till en EGEN, stabil Release-tagg
(`installer-stub`) separat från appens versionstaggar — den ändras
sällan och ska inte behöva en ny release varje gång appen gör det.

Kompileringen sker via `Minionguyjpro/Inno-Setup-Action` på en
`windows-latest`-runner (ny `.github/workflows/
installer-stub-build.yml`) — precis som Tauri-bygget kan jag inte
kompilera `.iss`-filer själv här (Inno Setup är Windows-only, och
`jrsoftware.org` är blockerad så jag kunde inte ens ladda ner
kompilatorn för att testa under Wine, som jag annars installerade
och övervägde). **Inte verifierat härifrån, flaggar extra tydligt:**
den faktiska `.iss`-syntaxen har aldrig körts genom en riktig
kompilator — baserad på noggrant verifierade officiella exempel, men
precis som Tauri-bygget (tre körningar förra gången) bör man räkna
med att CI avslöjar minst någon bugg jag inte kan se härifrån. Och
även om den kompilerar: hela flödet (nedladdning, tyst
Ollama-installation, övergång till StoryBook AI:s installer) är
helt oprovkört på riktig Windows-hårdvara.

**Uppdatering — CI grönt på första försöket (2026-10-01).**
Kompileringen gick igenom direkt, 1.2 sekunder, ingen bugg denna
gång (ovanligt — Tauri-bygget tog tre körningar förra gången).
Förklaringen till den misstänkt snabba körningen: `windows-latest`-
avbildningen har redan Inno Setup 6.7.1 förinstallerat, så
`install_latest: true`-parametern jag satte behövdes aldrig — och
visade sig dessutom inte ens stödjas av den exakta action-versionen
(`Minionguyjpro/Inno-Setup-Action@v1.2.2`), bara en ofarlig
"unexpected input"-varning i loggen. Tog bort den parametern.
Release `installer-stub` publicerad med `.exe`-filen bifogad:
https://github.com/ocedo-apps/StoryBook-AI/releases/tag/installer-stub

**Uppdatering — valbar Ollama-installation + LM Studio-hänsyn
(2026-10-01).** Mats: "Ska man få välja om man vill installera
Ollama? Vad händer om jag har LM Studio installerat? Eller om jag
hellre vill använda LM Studio?" — rätt invändning: förra versionen
installerade Ollama tyst om den inte upptäckte den, utan att fråga,
och kände inte till LM Studio alls (trots att StoryBook AI:s egna
Inställningar redan stödjer LM Studio och vilken annan
OpenAI-kompatibel lokal server som helst via "OpenAI-compatible"-
motorn — ingen kodändring behövdes där, bara stubben som inte ska
anta att alla vill ha Ollama).

Lade till en riktig valsida (`CreateInputOptionPage`, verifierad mot
det officiella `Examples/CodeDlg.iss` snarare än gissad) med EN
kryssruta "Install Ollama automatically" — förvald baserat på
upptäckt (av/på beroende på om Ollama ELLER LM Studio redan verkar
finnas), men alltid användarens eget slutgiltiga val oavsett
upptäckt. LM Studio-upptäckt via registernyckeln
`...\Uninstall\LM-Studio` (kollar både HKCU och HKLM, eftersom
LM Studio troligen installeras per användare precis som Ollama —
registersökvägen är bekräftad via sökning, men inte 100% säker på
vilken registerhive den faktiskt hamnar i, därav att båda kollas).
`[Files]`/`[Run]`-villkoren pekar nu på en `WantOllama`-funktion som
läser kryssrutans faktiska värde, inte bara auto-upptäckten direkt.

**Uppdatering — grönt efter två riktiga buggar till (2026-10-01).**
Första körningen med den nya Pascal-koden gav, som väntat, ett
verkligt kompileringsfel — den här gången hittade kompilatorn
faktiskt något jag inte kunde se bara genom att läsa dokumentation:

1. Radbrytningen `#13#10#13#10` råkade stå först på sin egen rad i
   strängkonkateneringen — ISPP (Inno Setups preprocessor) körs över
   HELA filen, även inuti `[Code]`, och en rad som börjar med `#`
   tolkas som ett direktiv oavsett sammanhang. Flyttade den till
   slutet av föregående rad istället.
2. Nästa körning gav ett nytt, separat fel: en lokal `const`-sektion
   mellan en funktionssignatur och dess `begin` — tillåtet i vanlig
   Delphi, men INTE i Inno Setups Pascal Script-dialekt
   ("'BEGIN' expected"). Flyttade konstanten till en global
   `const`-sektion istället, samma mönster som den befintliga
   `var`-sektionen.

Tredje körningen gick igenom. Släppfilen bekräftat uppdaterad
(asset-tidsstämpeln matchar exakt den sista körningen). Det här är
precis det jag flaggade för Mats skulle kunna hända — nya,
aldrig-kompilerade Pascal-funktioner (`CreateInputOptionPage`,
`RegKeyExists`, globala `const`) avslöjade saker en kompilator ser
men dokumentation/exempelskript inte alltid gör.

**Inte verifierat härifrån:** CI bevisar bara att skriptet
kompilerar, inte att vallogiken eller LM Studio-upptäckten faktiskt
stämmer på en riktig dator med LM Studio installerat.

**Kvarstår, inte påbörjat:** provköra .exe-filen (huvudappen) på en
riktig Windows-dator (inte gjort härifrån), provköra hela
stub-kedjan på riktig hårdvara i alla tre lägen (inget installerat,
Ollama installerat, LM Studio installerat) för att se att vallogiken
och auto-upptäckten faktiskt gör rätt sak.

---

**Ändringslogg v1.0.35 → v1.0.36 (2026-10-03):** Mats fick en
testarkommentar han inte riktigt förstod och bad mig förklara den.
Kommentaren: "Draft gets too much information while Interview gets
too little... interrogating them on something relating to other
subjects is pointless... inventing canon that doesn't exist could
contradict the already established facts." Verifierade mot koden
innan jag förklarade — stämde exakt: `characterInterviewSystem`
filtrerade bokens fakta till bara `fact.entity_ref === entityRef`,
alltså enbart den intervjuade entitetens egen post. Frågar författaren
om vem eller vad som helst annat måste modellen antingen säga "vet
inte" eller hitta på — och ett påhitt om t.ex. en annan karaktär kan
rakt motsäga den karaktärens egna, redan låsta fakta, eftersom
modellen aldrig fick se dem.

**Förslag lagt fram, godkänt rakt av ("Kör på det"):** låt Interview
även se fakta om andra entiteter som faktiskt nämns — antingen i den
intervjuades egna fakta (en relationsfakta som redan namnger någon),
eller i själva konversationen när författaren frågar om någon för
första gången. Återanvänder två redan byggda bitar rakt av:
`entityRefsAndLabels` (`bibleGroups.ts`) för listan att leta i, och
`findNameHitsInText` (`bibleMentions.ts`, samma namnigenkänning som
klickbara namn i prosan) för att hitta nämningarna. `visibleLockedFacts`
för synlighetsregeln, som redan användes för entitetens egna fakta.

**Implementation.** Ny funktion `relatedEntityContext(book, entityRef,
conversationText)` i `characterInterview.ts`: bygger en sökyta av
(a) den intervjuades egna faktatext + (b) konversationen hittills,
kör namnigenkänning mot alla andra entiteter, returnerar fakta för de
som faktiskt träffas. `characterInterviewSystem` fick en ny, valfri
sjätte parameter (`conversationText`, default `""`) och en ny
promptsektion ("Also established, about others mentioned in this
conversation...") när något hittas. `BookStore.tsx`s `askCharacter`
skickar nu in hela konversationshistoriken (redan tillgänglig i
scope) — ingen ny sparad state, prompten byggs om från grunden varje
tur precis som innan, så en ny nämning får effekt redan samma tur
den dyker upp.

Medvetet avgränsat till en nivå: en nämnd entitets egna nämningar
jagas inte vidare (Marcus fakta "Rivals with Theo" tas med ordagrant,
men Theos EGNA fakta dras inte in bara för att hans namn råkar stå i
Marcus fakta) — en djupare kedja hade riskerat att återskapa samma
"för mycket"-problem `filter_lore_by_relevance` finns till för att
undvika, fast på Interview-sidan istället för Skriv utkast.

6 nya tester (bl.a. att ingenting läggs till om inget nämns — exakt
oförändrat beteende — att en relationsfakta drar in den nämnda
personen från start, att en fråga i konversationen drar in personen
även utan egen relationsfakta, att entiteten själv aldrig räknas som
"relaterad", att andra nivån inte jagas, och att en dold-från-AI-fakta
hos den nämnda entiteten korrekt utelämnas). Alla 9 befintliga
Interview-tester oförändrat gröna. `tsc --noEmit`, `npm run build`
och hela testsviten (805 tester) gröna.

Ingen ny UI-yta — samma Interview-panel, bara vad systemprompten
innehåller ändras. Inte Playwright-verifierat den här gången av det
skälet (inget nytt att se renderas); litar på de 15 enhetstesterna
för att styrka logikens korrekthet istället.

v1.0.35 → v1.0.36.

---

**Ändringslogg v1.0.36 → v1.0.37 (2026-10-03):** Mats, om Brainstorms
Fråga-knapp: "Man skulle också ha en funktion för att bolla idéer och
diskutera hur berättelsen kan utvecklas. Mer som någon att resonera
med. Speciellt under Brainstorm." Jämfört med Interview (som redan har
precis den flerstegs-konversationsmekaniken, fast mot en
Story Bible-entitet) hade Brainstorms Fråga bara en engångsfråga: ett
enda svar som klistrades in som en ny lapp på brädet, inget minne av
tidigare frågor.

**Beslut (Mats):** samtalet ska vara flyktigt, inte sparas i bokfilen
— "Det är som att man pratar med en polare och tar de idéer man
fastnar för. Man behöver inte ha kvar diskussionen." Alltså samma
livscykel som Interviews egen historik: ren React-state, nollställs
när rutan stängs.

**Implementation.** `brainstorm.ts`: bytte ut den gamla
`BRAINSTORM_ASK_SYSTEM`/`brainstormAskUserPrompt` (en fråga åt gången)
mot `BRAINSTORM_CHAT_SYSTEM`/`brainstormChatSystemPrompt(book)` — hela
storyn + brädets lappar i systemprompten, konversationsturerna skickas
som egna meddelanden i listan (precis som `characterInterviewSystem`/
`askCharacter` redan gör), inte infogade i en enda textsträng.
`BookStore.tsx`: ersatte `askBrainstorm` med tre funktioner som
speglar Interviews `startInterview`/`askCharacter`/`closeInterview`
rakt av — `startBrainstormChat` (nollställer historiken),
`askBrainstormChat` (strömmar svaret turn för turn, samma
abort/timeout-hantering som Interview), `closeBrainstormChat`
(nollställer historiken igen, så en återöppning alltid börjar om).
Ny `Busy`-tagg `"brainstorm-chat"` ersatte den gamla `"ask"`-taggen
(uppdaterad i `useBookStore.ts` och `promptDebug.ts`/Prompt
Inspector-etiketten).

Nytt UI: `BrainstormChatCard.tsx`, en förenklad variant av
`CharacterInterviewCard.tsx` (samma `.interview-*`-CSS-klasser
återanvända rakt av — transcript, rader, avatarer, formulär — bara
utan porträtt-/personlighetskolumnen som är specifik för karaktärer).
Varje AI-tur får en egen "Lägg till i anteckningar"-knapp
(`onAddToNotes` → `addBrainstormNote` på brädet) istället för att
automatiskt sparas, eftersom ett helt samtal annars skulle svämma över
brädet med repliker ingen bad om att spara. Knappen i Brainstorms
footer bytte namn från "Fråga…" till "Bolla idéer…" (engelska: "Talk
it through…", bokmål: "Diskuter idéer…") och öppnar nu chattrutan
istället för en engångsdialog.

Alla tre språkfiler uppdaterade (`editor.brainstormChat` för
knappen, ny `brainstormChat`-sektion för själva chattrutans texter).
Tester i `brainstorm.test.ts` omskrivna till den nya
`brainstormChatSystemPrompt`-funktionen (samma hemlighets-/
bild-/tagg-/dold-entitet-filtrering verifierad, ärvd gratis från
`storyContext`). `tsc --noEmit`, hela testsviten (806 tester) och
`npm run build` gröna. Verifierat i riktig webbläsare (Playwright):
chattrutan öppnas och stängs korrekt (både Stäng-knappen och Escape),
visar tomt-läge och samtalshistorik, respekterar samma
ingen-modell-spärr som Interview, och renderar rätt på både engelska
och svenska.

v1.0.36 → v1.0.37.

---

**Ändringslogg v1.0.37 → v1.0.38 (2026-10-04):** Mats hittade en
YouTube-video om NEO (Hugh Howeys skrivapp, github.com/hughhowey/neo)
med flera smarta idéer för författarverktyg. Efter genomgång av koden
(bokhylle-UI, omslagsgenerering, Bind-till-en-bok, skärmspel m.m.)
valde vi **Placeholders** som första idén att bygga: en markör man kan
släppa mitt i skrivflödet utan att tappa tråden — "vad hette den där
staden igen?" — istället för att behöva stanna upp och slå upp det.

**Modell.** Ny `placeholders.ts`: `Placeholder = { id, at, note,
created_at }` — en punktmarkering över `prose`s egna teckenpositioner,
precis som den redan befintliga `formatting`-listan (fet/kursiv) ligger
*bredvid* prosan, aldrig invävd i den. `shiftPlaceholders(...)` speglar
`shiftFormattingRanges` rakt av: en markör innanför en redigerad sträcka
tas bort (sammanhanget den pekade på är borta), en före lämnas orörd,
en efter flyttas med längdskillnaden. Ny `Chapter.placeholders`-fält i
`BookSchema.ts`, samma policy som `formatting`: rensas (inte migreras)
vid hel regenerering (Draft, Recast, återställ en äldre revision),
skiftas annars genom exakt samma AI-redigeringsvägar som formatering
redan passerar (Draft, Extend/Elaborate/Instruct/Beat, Recast,
scen-Draft/Recast, Konvertera markeringar).

**Den svåra biten: vanlig handskrivning.** Till skillnad från
fet/kursiv — som läses direkt ur den redigerbara ytans faktiska
HTML-struktur efter varje tangenttryckning — finns platshållarens
markör INTE i den redigerbara texten själv (den ritas som ett eget
lager ovanpå, se nedan), så det finns inget att läsa tillbaka från
DOM:en vid vanlig skrivning. Löst med en ny `diffEditRange(before,
after)` i `placeholders.ts`: hittar gemensamt prefix/suffix mellan två
textsnapshots och räknar ut en motsvarande redigeringssträcka att
skicka till `shiftPlaceholders` — enda stället i hela funktionen som
behöver gissa snarare än att redan känna till sin egen redigering.

**UI.** Högerklicksmenyn vid insättningspunkten (samma `offsetFromPoint`
-mekanik som redan fanns för "Skriv en beat") fick ett nytt val, "Lägg
till platshållare…". Markören visas som en 📌 ovanpå texten — ett eget,
alltid synligt lager (`ProseCanvas.tsx`s nya `pointAtOffset`-baserade
`rectAtOffset` i `proseDom.ts`), till skillnad från den befintliga
sällsynta-ord/namn-overlayen som bara visas i vissa highlight-lägen.
Klick på markören öppnar en liten ruta med noteringen, "Spara",
"Markera löst" (tar bort den) och "Avbryt". Kapitellistan får en liten
prick vid kapitel med olösta platshållare, och en kompakt
"N platshållare att återkomma till"-panel (samma mönster som
Continuity-varningen) listar alla i hela boken med hopp till rätt
kapitel.

**Bugg hittad och fixad under vägen:** `pointAtOffset` (proseDom.ts,
privat hjälpfunktion för att gå från textposition till DOM-punkt)
returnerade `null` så fort den redigerbara ytan saknade `<p>`/`<div>`-
barn — vilket visade sig hända under helt vanlig skrivning (synk-
effekten skriver bara om DOM:en när den löpande texten faktiskt skiljer
sig från `value`, för att inte störa markören, så en nyss skriven
mening kan sakna `<p>`-omslag tills nästa fulla omsynk). `caretToOffset`
(samma fils motsvarighet i andra riktningen) hade redan en reservlösning
för exakt detta — kopierad hit. Platshållarens markör visades inte alls
förrän detta upptäcktes och fixades, trots att allt annat (data,
kontextmeny, panel, prick i kapitellistan) redan fungerade — hittat
genom att faktiskt klicka runt i en riktig webbläsare, inte bara läsa
koden.

20 nya tester (`placeholders.test.ts` + 3 nya i
`marker-conversion.test.ts`). Live-verifierat med Playwright på både
engelska och svenska: lägga till, flytta vid redigering (text infogad
före markören flyttade den korrekt), öppna/redigera/markera löst,
kapitel-prick, panelens antal och text, samt hopp mellan kapitel via
panelen. `tsc --noEmit`, hela testsviten (826 tester) och `npm run
build` gröna.

Nästa NEO-idé på tur, om Mats vill: panelerna till vänster/höger som
döljs och kommer fram när muspekaren närmar sig kanten — ren
layout/CSS, inget datamodellarbete, så ett mindre jobb än detta.

v1.0.37 → v1.0.38.

---

**Ändringslogg v1.0.38 → v1.0.39 (2026-10-05):** Nästa NEO-idé, den
enklaste av de fyra kvarvarande (Mats fråga "Vilken är enklast?" —
svaret jämfört de andra tre mot vad Placeholders redan visat sig kosta:
Darlings och Outline-spökstycken ligger i samma härad som Placeholders
positionsspårningsmässigt, Enter·Enter·Enter är störst eftersom "tre
Enter = nytt kapitel" betyder att faktiskt dela kapitlet och flytta
scener/formatering/platshållare med). Döljbara sidopaneler: ren
layout/CSS, ingen ny datamodell, ingen interaktion med textredigerarens
positionsspårning.

**Design, medvetet försiktig.** Standardläget (nålfast, 📌) är exakt
som idag — ingen befintlig användare ska bli överraskad av ändrat
beteende. En liten nål-knapp högst upp i varje panel (vänster: Kapitel-
panelen, höger: Story Bible) växlar till "lossad" (📍): panelen krymper
till en smal, 0,6rem bred kant mot skärmkanten istället för att
försvinna helt — en synlig antydan att något finns där. För muspekaren
mot kanten och panelen glider ut igen, som ett overlay *ovanpå*
manustexten (inte genom att bredda rutnätskolumnen) — avsiktligt vald
lösning för att undvika att själva skrivytan (och Placeholders nya
positionsberäkning från förra releasen) skulle behöva räkna om sin
layout varje gång en panel visas/döljs. 220 ms fördröjning innan den
stänger igen vid musen-lämnar, så den inte fladdrar om markören bara
snuddar förbi.

**Implementation.** Nålat-läge och hovring lever som vanlig
`useState` i `Editor.tsx` (samma mönster som `maximized` redan
använder — ingen bokdata, bara vystate, ingen anledning att spara
mellan sessioner för en första version). `BiblePanel.tsx` fick fem nya
props (`pinned`, `onTogglePinned`, `railClassName`,
`onMouseEnter`/`onMouseLeave`) istället för egen intern state, så all
klassuträkning för båda panelerna ligger på ett ställe i `Editor.tsx`.
Ny CSS: `.editor-body.is-left/-right-collapsed` krymper rutnäts-
kolumnen, `.rail.is-collapsed` döljer panelens eget innehåll
(`visibility:hidden` på barnen, bakgrundsfärgad kant kvar), `.rail.is-
floating` lyfter ut panelen ur rutnätsflödet (`position:absolute`
inom `.editor-body`, som fick `position:relative`) för overlay-
effekten.

**Kontrollerat mot "Maximera"** (den redan befintliga döljer-allt-
fokusläget): `.editor.is-maximized`-reglerna har högre CSS-specificitet
(tre klasser mot två) än mina nya regler, så Maximera vinner alltid
oavsett nålat/lossat tillstånd — verifierat live, inte bara läst i
koden.

Live-verifierat med Playwright: standardläge oförändrat, lossa höger
panel + flytta bort musen krymper den korrekt (huvudinnehållet får
tillbaka utrymmet), hovring över den smala kanten tar fram den igen
som overlay, klick genom den flytande panelen fungerar (navigerade
till Synopsis medan vänsterpanelen svävade), åternåla fungerar, och
Maximera döljer båda panelerna oavsett nålat-tillstånd. Svensk text
verifierad. `tsc --noEmit`, hela testsviten (826 tester, oförändrad —
inga nya kärnfunktioner att testa, bara UI-state och CSS) och `npm run
build` gröna.

Kvar av NEO-listan, om Mats vill fortsätta: Darlings, Enter·Enter·Enter,
Outline-spökstycken — i ungefärlig svårighetsordning.

v1.0.38 → v1.0.39.

---

**Ändringslogg v1.0.39 → v1.0.40 (2026-10-06):** Mats: "Jag kollar
[CI:n för v1.0.39] själv vid tillfälle. Kan vi ändå fortsätta med
nästa? Keep your darlings..." — nästa NEO-idé, Darlings ("döda dina
älsklingar", men behåll kropparna).

**Design.** Samma positionsspårningsmönster som Placeholders
(`Darling { id, at, text, created_at }`, en array vid sidan av
`chapter.prose`), men med en medveten avvikelse: `formatting` och
`placeholders` **nollställs** vid en helomskrivning av prosan (Recast,
återställ en äldre revision) eftersom gamla positioner då ändå inte
stämmer och inget värdefullt går förlorat. En Darling bär på riktig,
författad text — att nollställa den skulle radera den permanent, inte
bara en position. Den behålls därför alltid (aldrig nollställd), med
sin (nu möjligen inaktuella) position bara clampad till
`[0, prose.length]` när den återställs.

Klippa ut sker från samma markeringsmeny som Förläng/Utvidga/Skriv om
("Klipp till älsklingar") — ingen ny markörbaserad meny som
Placeholders fick, bara en ny rad i den befintliga. Till skillnad från
att lägga till en platshållare (som bara är ett `patchBook`, ingen
historik) går både klippet och återställningen via en ny historierad
("Älskling" i Historik) — att klippa bort ett helt stycke, eller lägga
tillbaka ett, kändes värt att kunna ångra samma väg som Omskrivning.

**Implementation.** `src/core/darlings.ts` (ny): `shiftDarlings` (samma
"före: orörd, inom: tappad, efter: skiftad"-algoritm som formatering/
platshållare), `cutToDarling`, `restoreDarling`, `discardDarling`,
`collectDarlings`. `BookSchema.ts`: `Chapter.darlings`, ny
`ProseHistoryOp`-variant `"darling"`. `BookStore.tsx`: tre nya actions
(`cutChapterDarling`, `restoreChapterDarling`,
`discardChapterDarling`, alla via `recordProseRevision` +
`flushSave`), och `darlings` vävt in i alla befintliga
positionsspårande vägar — `draftChapter`, `rewriteSpan` (Förläng/
Utvidga/Instruera/Beat), `recastChapter` (behåller, nollställer inte),
`restoreProseRevision` (lämnas helt orörd i patchen, vilket i sig
bevarar den), `applyMarkerConversion`/`convertMarkersToFormatting`.
`ProseCanvas.tsx`: nya props `darlings`/`onDarlingsChange` (skiftar vid
skrivning och manuell redigering, samma mönster som platshållare) och
`onCutToDarling` (den nya menyraden). Ny `DarlingsPanel.tsx` — samma
kompakta "N älsklingar sparade"-widget som `PlaceholdersPanel.tsx`,
men med Återställ/Släng-för-gott per rad istället för bara en hopp-
till-knapp.

Live-verifierat med Playwright: markera text → "Klipp till älsklingar"
tar bort stycket och lägger det i facket; fortsatt skrivning efter
klippet flyttar inte de kvarvarande älsklingarnas position fel;
Återställ lägger tillbaka texten på rätt plats även efter en senare
redigering någon annanstans i kapitlet; Släng för gott tar bort den för
gott; historikraden får etiketten "Darling"/"Älskling" och går att
återställa till som vilken annan rad. Svensk text verifierad.
`tsc --noEmit`, hela testsviten (843 tester, +17 sedan v1.0.39: nya
`darlings.test.ts` samt två nya fall i `marker-conversion.test.ts`) och
`npm run build` gröna.

v1.0.39 → v1.0.40.

---

**Ändringslogg v1.0.40 → v1.0.41 (2026-10-06):** Mats: "Kanske kan vi
omvandla --- till en HR?" — som svar på att jag beskrev
Enter·Enter·Enter (kapitel-delning på tre Enter) som den mest
invasiva kvarvarande NEO-idén. Ett `---`-stycke, det vanliga
manusskriv-konventet för scenbrytning, är en helt annan sak: rent
kosmetiskt, ingen ny datamodell, ingen scen- eller kapitel-delning.

**Implementation.** `htmlFromProse` (`proseFlow.ts`) har redan samma
mönster för ett annat specialfall — ett helt stycke som bara är en
modell-"Note:" blir en egen `<span class="prose-aside">` istället för
vanlig text. `markupProseBlock` fick en likadan tidig retur: ett
stycke som (efter trim) bara är tre eller fler bindestreck blir
`<span class="prose-hr">---</span>` istället för att gå igenom den
vanliga per-tecken-loopen. CSS gör texten osynlig (`color: transparent;
font-size: 0`) och ritar istället en kort, centrerad linje via
`background` på samma span — `chapter.prose` har fortfarande bokstavligt
`---` som text, så `proseFromElement` (DOM → sparad text) behöver
ingen ändring alls: den läser bara `textContent` per stycke, som är
oförändrat. Samma anledning som platshållare/formatering redan bevisat
fungerar genom en `<span>`-inpackning.

**Upptäckt i förbifarten, inte åtgärdat:** medan jag Playwright-
verifierade upptäckte jag en befintlig, orelaterad bugg — `flowBlocks`
(`proseDom.ts`) läser bara `:scope > p, :scope > div` som stycken.
Skriver man in i ett helt tomt kapitel hamnar FÖRSTA raden som en lös
textnod direkt i roten (webbläsarens eget beteende innan första Enter),
och när `proseFromElement` sedan bara samlar `<p>`/`<div>`-barn tappas
den raden helt och hållet ur det som sparas — reproducerat även helt
utan `---` inblandat. Flaggar det här till Mats separat; rör inte
min `---`-ändring, men värt att åtgärda.

Live-verifierat med Playwright: `---` som eget stycke, infogat via
"Manual Edit" (samma väg som undviker ovanstående bugg), renderar
korrekt som en tunn linje mellan styckena efter omladdning; befintlig
text runt omkring orörd. `tsc --noEmit`, hela testsviten (847 tester,
+4 sedan v1.0.40, alla i `prose-flow.test.ts`) och `npm run build`
gröna.

v1.0.40 → v1.0.41.

---

**Ändringslogg v1.0.41 → v1.0.42 (2026-10-06):** Mats: "Ta buggen nu" —
den jag flaggade i förbifarten under v1.0.41:s verifiering (första
raden i ett helt nytt kapitel kunde tappas tyst ur det som sparas).

**Rotorsak, hittad genom att stega igenom DOM:t steg för steg i
Playwright, inte genom att läsa koden.** `ProseCanvas.tsx`:s DOM-
synk-effekt sätter `area.innerHTML = "<p><br></p>"` för ett tomt
kapitel — men bara om `textChanged || formattingChanged` är sant.
Vid första monteringen av ett helt nytt, tomt kapitel är den
beräknade texten redan `""` (samma som `value`), så det villkoret
är falskt och hela grenen hoppas över — redigeringsytan börjar alltså
som ett bokstavligen tomt `<div>`, inte `<p><br></p>` som avsett.
Första tecknet man skriver hamnar då som en lös textnod direkt i
roten, utanför alla `<p>`/`<div>`-element. Så länge allt skrivs i ett
enda stycke är det osynligt (textnoden läses ändå via `flowBlocks`s
fallback för "inga block alls"), men så fort man trycker Enter och
skapar ett första riktigt syskon-element slutar den fallbacken gälla
— `flowBlocks` läser bara `:scope > p, :scope > div`, så den lösa
textnoden (hela första stycket) försvinner tyst ur det `proseFromElement`
sparar.

**Fix, medvetet minimal:** rörde varken `flowBlocks`, `proseFromElement`
eller någon annan offset-matematik i `proseDom.ts` — risken att
störa markören under pågående skrivning (samma försiktighet som redan
dokumenterad för platshållarnas DOM-fallback) gjorde det tryggare att
förhindra att den trasiga DOM-formen någonsin uppstår, istället för
att laga läsvägen i efterhand. `ProseCanvas.tsx`:s synk-effekt säkrar
nu `<p><br></p>` så fort kapitlet är tomt, oavsett om `textChanged`
råkar vara falskt — ett helt nytt kapitel (eller ett precis helt
urraderat) har alltid ett riktigt stycke att skriva i från första
tecknet.

**Verifiering:** ingen meningsfull enhetstest möjlig (testmiljön kör
`environment: "node"`, inget DOM alls, och `contentEditable`-skrivning
går inte att simulera i jsdom/happy-dom ändå) — samma situation som
platshållarnas DOM-fix tidigare. Live-verifierat med Playwright
istället: ett helt nytt kapitel visar nu `<p><br></p>` redan innan
första klicket; skriver man "Scene one... / --- / Scene two..." med
riktiga Enter-tryckningar överlever alla tre styckena en omladdning
oförändrade (tidigare tappades det första); samma sak efter att ha
markerat allt och raderat mitt i en session och skrivit igen. `tsc
--noEmit`, hela testsviten (847 tester, oförändrad — inget nytt att
testa i Node-miljön) och `npm run build` gröna.

v1.0.41 → v1.0.42.

---

**Ändringslogg v1.0.42 → v1.0.43 (2026-10-06):** Mats höll på att lägga
in "Baskervilles hund" och såg att Conan Doyle sätter brev-/citat-
text indragen med en vertikal linje. Frågade om vi kunde fixa det —
markera-och-högerklicka, eller ett tecken som `---`? Jag förordade ett
radmarkör-tecken av samma skäl som `---`: rent kosmetiskt, ingen ny
positionsspårad lista (vilket markera-och-högerklicka hade krävt,
eftersom citat är ett *block*-attribut, inte ett inline-attribut som
fet/kursiv/understruket som formateringssystemet redan är byggt för).
Mats valde `>` — Markdown/e-post-konventet, igenkänningsbart.

**Implementation.** Samma mönster som `---` i `proseFlow.ts`, fast en
nivå till: `QUOTE_PREFIX = /^>[ \t]?/` matchar `>` i styckets början.
`htmlFromProse` sätter `class="prose-quote"` på själva `<p>`:et när
styckets text matchar (behövs för indraget + vänsterlinje, till
skillnad från `---` som bara behövde en inre `<span>`).
`markupProseBlock` kapade ut sin gamla per-tecken-loop till en ny
`markupProseBlockBody`, så att markören (`>` plus ett ev. mellanslag)
kan packas in i en egen `<span class="prose-quote-marker">` (osynlig
via `font-size:0`) medan RESTEN av raden går igenom
`markupProseBlockBody` som vanligt — vilket betyder att fetstil/
kursiv/understruket och "Note:"-igenkänning fortfarande fungerar
inuti en citerad rad, inte bara i vanlig text. Flera `>`-rader i rad
får varsin `.prose-quote`-klass; CSS tar bort mellanrummet mellan dem
(`.prose-quote + .prose-quote { margin-top: 0; padding-top: 0.8em }`)
så vänsterlinjen blir obruten genom hela brevet, istället för att
synas som flera korta streck.

Precis som `---` behöver varken `proseFromElement` eller någon av
offset-funktionerna i `proseDom.ts` röras — markören är fortfarande
riktig text i en `<span>`, bara dold med CSS, så `textContent` per
stycke är oförändrat.

Live-verifierat med Playwright (efter v1.0.42:s DOM-seedningsfix,
som gjorde det möjligt att skriva flera stycken i rad utan att tappa
något): "Holmes handed me the letter." / "> My dear Sir," / "> It has
come to my knowledge..." / "I read the note..." — de två citat-
raderna får en sammanhängande vänsterlinje, texten före och efter är
opåverkad, allt överlever en omladdning oförändrat. `tsc --noEmit`,
hela testsviten (852 tester, +5 sedan v1.0.42, alla i
`prose-flow.test.ts`) och `npm run build` gröna.

v1.0.42 → v1.0.43.

---

**Ändringslogg v1.0.43 → v1.0.44 (2026-10-06):** Sista punkten på
NEO-listan — Outline-spökstycken. Kapitlets disposition ("vad det
här kapitlet ska göra", `chapter.brief`) ska visas som blek
spökprosa direkt i skrivytan istället för bara i det hopfällda
"Chapter settings"-fältet, som en mall att skriva över.

**Enklare än väntat.** Redigeringsytan har redan exakt den
mekaniken — en generisk platshållartext ("The chapter lives here...")
visas via `data-empty`/`data-placeholder`-attribut och en ren CSS
`::before`-regel (`.prose[data-empty="true"]::before { content:
attr(data-placeholder); ... }`) så fort kapitlets prosa är tom. Inget
nytt att bygga, bara byta VILKEN text som skickas in: `Editor.tsx`
skickar nu `chapter.brief.trim() || m.editor.chapterPlaceholder` som
`placeholder`-prop istället för alltid den generiska texten. Faller
tillbaka till den gamla texten för kapitel utan disposition satt —
ingen regression för befintliga böcker.

`chapter.brief` redigeras i ett `contentEditable="plaintext-only"`-
fält (`ChapterBriefCopy.tsx`) som kan innehålla egna radbrytningar
— en disposition skriven som "Scen 1: ...\n\nScen 2: ..." behåller
den strukturen i `innerText`. Enda CSS-ändringen: `white-space:
pre-line` på `::before`-regeln, så radbrytningarna syns som skilda
spökstycken istället för att klämmas ihop till en rad.

Helt riskfritt jämfört med allt annat denna session — rör varken
`proseFromElement`, `flowBlocks` eller någon av de känsliga DOM-
synk-vägarna; `::before` är en ren CSS-overlay som aldrig är en del
av det faktiska DOM-trädet `proseFromElement` läser.

Live-verifierat med Playwright: en disposition i två rader ("Scene
1: Arrival..." / "Scene 2: The letter...") visas som två skilda
spökstycken i skrivytan; börjar man skriva riktig text försvinner
spöktexten helt (ordräkningen visar bara den riktiga texten, aldrig
dispositionen); ett kapitel utan disposition visar fortfarande den
gamla generiska texten. `tsc --noEmit`, hela testsviten (852 tester,
oförändrad — ingen ny kärnlogik) och `npm run build` gröna.

v1.0.43 → v1.0.44.

---

**Ändringslogg v1.0.44 → v1.0.45 (2026-10-06):** En testare skrev ett
långt, "lite svidande men ändå intressant" svar på min fråga om de
fortfarande använder appen. Två konkreta punkter, båda kollade mot
koden innan jag svarade istället för att gissa:

1. **Traits/Identities i Story Bible** — förvirring, men inget
   trasigt. Alla fakta renderas likadant till modellen oavsett
   kategori (`renderBibleRows` i `generateProse.ts`), och relevans-
   filtret (`loreRelevance.ts`, av som standard) filtrerar per
   ENTITET, inte per fakta-kategori eller hur en entitets info är
   uppdelad. Kategorisering är alltså bara författarens egen
   överblick — inget att åtgärda i kod, mer en fråga om hjälptext,
   som jag lämnade öppen till Mats.
2. **Tomma rader mellan stycken i export** — ett äkta fynd. Alla fem
   formatgenererare i `manuscriptExport.ts` (HTML, ePub, RTF, ODT,
   PDF) tog kapitelprosans interna radbrytning bokstavligt och lade
   in en synlig tom rad/stycke mellan varje riktigt stycke, utan
   växel. Mats: "Lägg till en växel i Publicera-dialogen."

**Implementation.** Ny typ `ParagraphStyle = "spaced" | "indented"`
i `manuscriptExport.ts`. "spaced" är den gamla, oförändrade koden i
alla fem formatgenererare (bakåtkompatibel — alla 23 befintliga
export-tester gick igenom orört). "indented" delar istället upp
prosan med `splitFlowParagraphs` (samma funktion som redan
proseFlow.ts/htmlFromProse bygger på) och sätter varje stycke utan
tomrad mellan, med indrag på första raden — utom kapitlets allra
första stycke, som enligt typografisk konvention lämnas rakt (ingen
indrag direkt efter en rubrik). Varje format fick sin egen variant av
samma idé: HTML/ePub en CSS-klass (`.indented p{text-indent:1.5em}`,
`.first` undantaget) på `<body>`, RTF `\pard\sa0\fi0` / `\fi567` per
stycke (med en extra `\pard`-reset innan nästa kapitels rubrik, annars
ärver den kvarvarande indrag), ODT två nya stycke-stilar ("Indented"/
"IndentedFirst"), PDF en ny `PdfWriter.prose()`-metod som ritar
första radens x-position förskjuten. Even ren text fick växeln —
tab-indragna stycken, en radbrytning istället för två — eftersom
testarens faktiska arbetsflöde (klistra in kapitel i Writingway 2)
troligen går via just den vägen. Markdown rörs inte — där ÄR
tomraden vad som gör ett stycke till ett stycke, inget att växla.

Ny `<select>` i Publicera-dialogen, avstängd bara för Markdown-
formatet (tvärtemot typsnittsväljaren, som stängs av för både
Markdown och Ren text — den här gäller ren text också).

Live-verifierat med Playwright: växeln finns och defaultar till
"Tom rad" (`spaced`); växlar man till "Indrag" och publicerar HTML
visas första stycket rakt och andra indraget utan mellanrum, bekräftat
både i den nedladdade filen och i en renderad skärmdump. PDF-
visningen gick inte att skärmdumpa headless (Chromiums inbyggda PDF-
visare renderar inte sidinnehåll i det här automatiserings-läget) —
litar där på den gröna enhetstesten (sidantal, giltig PDF) och samma
beprövade rit-primitiver som redan används av `lines()`. `tsc
--noEmit`, hela testsviten (860 tester, +8 sedan v1.0.44, alla i
`manuscript-export.test.ts`) och `npm run build` gröna.

v1.0.44 → v1.0.45.

---

**Ändringslogg v1.0.45 → v1.0.46 (2026-10-06):** Samma testarsvar,
punkt 4: en skärmdump (jag har inte sett den) av hur Timeline-tabellen
blivit "downright frustrating to look at" — "det där med scrollbars"
sedan "ett par uppdateringar tillbaka" (`e554b8d`, Timeline+Trådar
slogs ihop till en matris). Mats: "Ja, fixa Timeline-tabellen nu."

**Två separata fel, inte ett.** Letade i stilmallen innan jag gissade:

1. **Den egentliga boven, inte bara saknade frysta rubriker.**
   `.plotline-matrix-scroll` sätter bara `overflow-x: auto` — men CSS-
   specen säger att så fort EN axel är något annat än `visible` tvingas
   DEN ANDRA axeln att också bete sig som `auto`, även om den aldrig
   sattes. Elementet är ett flex-barn till `.manuscript` (`display:
   flex; flex-direction: column`), och en flex-items automatiska
   minimihöjd kollapsar till 0 så fort overflow inte längre är
   `visible` på den axeln — så hela tabellen klämdes ihop till en
   decimeterhög låda med sin EGEN trånga vertikala scrollbar, istället
   för att få plats i sin naturliga höjd och låta sidan (som redan har
   `overflow-y: auto`) sköta scrollningen. Bekräftat empiriskt, inte
   bara via spec-läsning: ett Playwright-skript som letade upp varje
   element där `scrollHeight > clientHeight` hittade `.plotline-
   matrix-scroll` med `scrollH: 690` mot `clientH: 96` — en 96 pixlar
   hög ruta för en tabell som egentligen behöver 690. `flex-shrink: 0`
   på det elementet löste det direkt (om testade efteråt: samma sida
   visar nu `main.plotline-matrix-page` själv som den skrollande,
   `scrollH: 1028` mot `clientH: 434` — en enda, rimlig scrollbar).
2. **Inga frysta rubriker heller** — noll `position: sticky` i hela
   `styles.css` innan det här. Lade till på tre ställen: `.plotline-
   matrix thead th` (`position: sticky; top: 0`) för kapitel-
   rubrikraden, `.plotline-row-head` (`position: sticky; left: 0`) för
   trådnamnskolumnen, och hörncellen (`.plotline-matrix thead
   th.plotline-matrix-corner` — den extra specificiteten var nödvändig
   för att hörnets `z-index`/`left` skulle vinna över den mer
   generella thead-regeln) fäst i båda led samtidigt med högst
   `z-index` av de tre, så den alltid ritas ovanpå de andra två vid
   skärningspunkten.

Live-verifierat med Playwright: byggde en bok med 13 kapitel och 16
trådar för att garantera scrollning i båda led, mätte `scrollHeight`/
`clientHeight` på varje element i trädet före och efter fixen för att
bekräfta att den trånga rutan försvann, och tog skärmdumpar vid
scrollposition (0,0), vertikalt scrollad och scrollad i båda led
samtidigt — kapitelrubrikerna och trådnamnen stannar synliga i alla
tre fallen, precis som ett kalkylblad. `tsc --noEmit`, hela
testsviten (860 tester, oförändrad — ren CSS, inget att testa i
Node-miljön) och `npm run build` gröna.

v1.0.45 → v1.0.46.

---

**Ändringslogg v1.0.46 → v1.0.47 (2026-10-06):** Testarens punkt 3 —
"no way to get the model to remember anything beyond the chapter".
Jag frågade Mats vilken av två riktningar som skulle ge bäst resultat:
(A) en löpande, auto-genererad "berättelsen hittills" matad in i
Draft/Extend, eller (B) städa upp hur `core.event`-fakta särskiljs
från stabila fakta i Story Bible-rendringen. Rekommenderade A —
testaren tycker redan Story Bible-kurering är tungt ("my lore is too
much and too verbose"), så att be om MER manuell kategorisering (B)
lägger bördan fel; A löser klagomålet utan extra arbete av författaren.
Mats: "Bygg A."

**Rotorsak, bekräftad i koden innan design.** `formatPredecessorForDraft`
(`continuesFrom.ts`) skickar bara de tre sista styckena av föregående
kapitel — resten av manuset är helt osynligt för Draft/Extend/
Elaborate/Beat, oavsett hur långt bort i berättelsen man är.

**Design — position-medveten från grunden, inte en efterhandskonstruktion.**
Story Bible-fakta är redan position-medvetna (`formatBibleForPromptAtPosition`,
`visibleLockedFactsAtPosition` — ett kapitel ser aldrig fakta från ett
SENARE kapitel i berättelsetid, även om det skrevs först). En global,
en-enda sammanfattning för hela boken skulle bryta den garantin — redigerar
man ett tidigt kapitel efter att redan ha sammanfattat fram till kapitel 10
skulle framtida handling läcka in. Lösningen: varje kapitel får sitt EGET,
litet `summary`-fält (bakåtblickande motsvarighet till `brief`, som är
framåtblickande instruktion) — skrivet för hand eller genererat på
begäran, aldrig automatiskt. `formatStorySoFar` (ny, `generateProse.ts`)
samlar ihop alla TIDIGARE kapitels `summary`, i berättelsetidsordning,
via samma `storyTimeRankByChapterId`-infrastruktur Story Bible redan
bevisat fungerar korrekt — återanvänder, uppfinner inget nytt.

**Varför aldrig automatiskt.** Hela appens AI-mönster kräver en
uttrycklig författarhandling (Draft, Extrahera fakta, Analysera — allt
"Du bestämmer"). En auto-regenererad sammanfattning efter varje
redigering vore en svart låda som kan glida iväg med fel detaljer utan
att någon märker det. Ny "Sammanfatta kapitel"-knapp bredvid den
befintliga "Plocka ut fakta"-knappen i Kapitelinställningar, exakt
samma mönster: `provider.chat(...)` (inte streaming — kort, ett
svar), `reviewModel` (samma modellval som extraktion, inte
skrivmodellen), fältet är fritt redigerbart för hand precis som
`brief` redan är via samma `ChapterBriefCopy`-komponent återanvänd
rakt av.

**Omfång, medvetet begränsat.** Vävdes in i `draftUserPrompt`,
`draftSceneUserPrompt` och `passageUserPrompt` (Extend/Elaborate/
Instruct/Beat delar samma funktion) — INTE i Recast, som bara byter
POV/tempus på redan existerande text och inte uppfinner ny handling,
så "berättelsen hittills" tillför inget där. Tomt tills författaren
faktiskt sammanfattat något — inget tvång att fylla i alla kapitel
innan det börjar hjälpa.

**Verifiering.** 15 nya tester (`generate-prose.test.ts`:
position-medvetenhet — en senare kapitels sammanfattning läcker aldrig
till ett tidigare, respekterar omflyttning på Timeline, aldrig kapitlets
egen sammanfattning, uteslutet ur Recast med flit; `chapter-summary.test.ts`:
prompt-byggaren). Kunde inte Playwright-verifiera själva AI-anropet
(ingen Ollama kopplad i den här miljön), men verifierade UI:t live:
fältet dyker upp bredvid Chapter brief, sparar och överlever en
omladdning (samma 400 ms debounce-fönster som resten av appen —
första testkörningen missade det och trodde fältet inte sparade alls,
om-körd med längre väntan bekräftade att det fungerade hela tiden),
"Sammanfatta kapitel"-knappen är avstängd för ett tomt kapitel.
`tsc --noEmit`, hela testsviten (875 tester, +15 sedan v1.0.46) och
`npm run build` gröna.

v1.0.46 → v1.0.47.

---

**Ändringslogg v1.0.47 → v1.0.48 (2026-10-07):** Mats bad mig utreda
hur konkurrenter (NEO, Writingway 2, Novelcrafter) löser "appen minns
hela manuskriptet"-löftet — research, inte bygge, till en början.
NEO visade sig sakna AI-funktioner helt (ingen källa beskriver några).
Writingway 2:s variant är helt manuell checkbox-markering, bekräftat
genom att läsa källkoden rakt av. Novelcrafters "Codex" var den enda
av de tre med en faktisk, byggd mekanism: automatisk namn/alias-
detektering mot fri text, tre-läges AI-kontext per post (Always/Only
when detected/Never), "Progressions" (tidsbundna tillägg/ersättningar
i Codex, bara synliga från den scenen och framåt). Jämfört rakt mot
vår egen kod innan jag drog slutsatser: `NarrativeFact.superseded_by`
+ `visibleLockedFactsAtPosition` (`visibility.ts`) är redan vår
motsvarighet till Progressions — inget hål, bara sämre synliggjort.
Men två genuina hål hittades: inga aliaser (`loreRelevance.ts`/
`bibleMentions.ts` matchar bara mot `entity_label`), och ingen
exclusion-lista (ett namn som råkar vara ett vanligt ord, typ "Rose",
kan ge falska träffar). Mats: "Kör på dessa" — aliaser, exclusion-
lista, förenklad Trait/Identity-väljare, och tydligare UX för
tidsbundna ändringar (fyra punkter, byggs i separata versioner).

**Den här versionen: aliaser + exclusion-lista.** Nytt sidotabell-
schema `entityTracking.ts` (`entity_ref` → `aliases[]`, `exclusions[]`),
samma mönster som `profiles`/`entity_kinds`. Trätt in i båda ställena
namnmatchning redan fanns: `loreRelevance.ts`s `isNamed` tar nu med
alias-tokens i matchningen, och räknar om kontext-tokenmängden med
exclusion-fraser bortklippta när entiteten har några (annars återanvänds
den delade mängden — ingen extra kostnad för entiteter utan exclusions).
`bibleMentions.ts`s `mentionsForEntity` gör samma sak fast
positionsmedvetet: hittar alla träffar som vanligt, filtrerar sedan bort
de som faller helt inom en exclusion-fras-span, så att snippet-positionerna
i originaltexten aldrig rubbas. Ny "Aliases"/"Exclusions"-sektion i
Story Bible-kortet (`TrackingFields`, samma debounce-mönster som
`CharacterFields`), placerad direkt ovanför Mentions — orsak före verkan,
redigera aliaser/exclusions och se direkt vilka omnämnanden som räknas.

**Verifiering.** Nya tester i `lore-relevance.test.ts` (alias-träff,
exclusion döljer/avslöjar beroende på var i texten namnet står) och
`bible-mentions.test.ts` (samma, plus en för `nameVariantsForLabel`
med alias). Playwright-verifierat live: skapade en karaktär, fyllde i
alias + exclusion, laddade om sidan — båda fälten överlevde
(`Mimi, Miss Hald` / `hald mark`), layouten renderar rätt i kortet.
`tsc --noEmit`, hela testsviten (882 tester, +9 sedan v1.0.47) och
`npm run build` gröna.

v1.0.47 → v1.0.48.

---

**Ändringslogg v1.0.48 → v1.0.49 (2026-10-07):** Andra punkten av fyra
från samma Novelcrafter-genomgång: "Flexibla fält istället för fasta
Trait/Identity-kategorier", direkt adresserat mot testarens klagomål
("I still don't know which way is correct... I'm too used to UI where
everything is in one field").

**Övervägde en fullständig omskrivning** (fria, författardefinierade
kategorier à la Novelcrafters "Codex Details") men avvisade den —
`classifyEntity` (`bibleGroups.ts`) avgör karaktär/plats/objekt via
EXAKT vilka predikat en entitet har, `ConsistencyGate` matchar konflikter
på entity+predikat, och fakta-extraktionen (`extractFacts.ts`) är
constrained mot `CORE_PREDICATES` för att AI-anrop ska vara pålitliga.
Att göra kategorin fri text hade krävt att riva upp alla tre, med stor
regressionsrisk, för ett problem som i grunden är ett UI-problem, inte
ett datamodell-problem.

**Vald lösning, UI-bara, noll schemaändring.** Två ställen bad
författaren välja kategori manuellt: `NewEntityOverlay` (skapa nytt
kort) och Add fact-formuläret i `EntityOverlay` (lägga till mer på ett
befintligt kort). Första stället tog bort valet helt — allra första
fakta på ett nytt kort låses tyst till kortets naturliga standard
(`BIBLE_KIND_DEFAULT_PREDICATE`, Identity för karaktärer som förut,
bara inte något författaren behöver fundera på i precis det ögonblick
hen är mest osäker). Andra stället fick en ny, snävare lista per typ
(`BIBLE_KIND_ADD_PREDICATES`, `bibleGroups.ts`): karaktärer ser bara
"Trait" + "Relationship" — Identity är medvetet uteslutet eftersom den
redan är satt vid skapandet, och att fråga igen var precis den
förvirring testaren beskrev. Platser/objekt/grupper/händelser ser sin
egen huvudkategori + "Concept" som uppsamlingsheap. Gamla, redan låsta
Identity-fakta visas och fungerar precis som förut — bara den FRAMÅT-
RIKTADE valmöjligheten är borttagen, inget migrerat eller omklassat.

**Verifiering.** Nya tester i `bible-groups.test.ts` (Identity saknas
ur varje typs lista, karaktärers lista är exakt Trait+Relationship,
alla typer har minst ett val). Playwright-verifierat live: nytt kort
har noll `<select>` i overlayn, befintligt korts Add fact-dropdown
visar exakt `["Trait", "Relationship"]` för en karaktär.
`tsc --noEmit`, hela testsviten (885 tester, +3 sedan v1.0.48) och
`npm run build` gröna.

v1.0.48 → v1.0.49.

---

**Ändringslogg v1.0.49 → v1.0.50 (2026-10-07):** Fjärde och sista
punkten från Novelcrafter-genomgången: tydligare UX kring tidsbundna
ändringar (deras "Progressions"). Läste igenom hela kedjan innan jag
byggde något — `reviseFact`/"Edit"-knappen (`ConsistencyGate.ts`) går
redan via `applyAuthorDraft`, men med fakta-radens ORIGINALA
`sequence_index`/`chapter_id` — den RÄTTAR vad påståendet alltid varit,
den flyttar det inte framåt i tiden. Det är "Add fact"-formulärets
samma-predikat-väg (triggar Ersätt/Lägg till-dialogen) som faktiskt
förankras vid kapitlet författaren har öppet just nu — det är vår
riktiga Progression-mekanism, bara osynlig: inget på en låst fakta-rad
pekade mot den.

**Lösning.** Ny "Update…"-knapp på varje låst fakta-rad (bredvid
redan existerande "Edit") — förifyller Add fact-formulärets kategori-
väljare och fokuserar/scrollar till textfältet, så författaren inte
behöver gissa sig till eller skriva om kategorin för hand. Visas bara
när predikatet finns i `BIBLE_KIND_ADD_PREDICATES` (samma lista från
v1.0.49) — en gammal Identity-fakta har ingen "Update"-knapp, eftersom
den vägen inte längre erbjuds alls (konsekvent med förra versionens
beslut). En statisk hint-rad under "Add fact"-rubriken förklarar
mekaniken rakt ut, och Historik-rubriken fick en kort förklaring om
att ersättning där nedan är vad som fyller på listan.

**Verifiering.** Playwright-verifierat live: en Identity-rad saknar
Update-knappen, en Trait-rad har den, klick fokuserar och scrollar
till rätt fält med rätt förvald kategori, hint-texten renderar.
`tsc --noEmit`, hela testsviten (885 tester, oförändrat antal — ren
UI-tilläggsfunktion, inga nya datavägar att testa separat) och
`npm run build` gröna.

**Så avslutas de fyra punkterna från Novelcrafter-jämförelsen**
(aliaser v1.0.48, exclusion-lista v1.0.48, förenklad kategori-väljare
v1.0.49, tydligare tidsbunden-ändring-UX v1.0.50) — alla fyra byggda
efter att ha läst både konkurrentens dokumentation OCH vår egen kod
innan beslut togs, snarare än att anta att "konkurrenten gör X" per
automatik betydde "vi saknar X".

v1.0.49 → v1.0.50.

---

**Ändringslogg v1.0.50 → v1.0.51 (2026-10-07):** Mats bad om en skiss
(claude.ai Design-canvas, två artboards "Nu"/"Förslag") innan något
byggdes — vi testade flera varianter interaktivt över ett flertal
iterationer innan bygget: flytta vänsterpanelens lägesknappar upp,
slå ihop dem med de befintliga åtgärdsknapparna till EN rad, gruppera
filrelaterat under "Arkiv ▾" och verktyg under "Verktyg ▾" (ordning
Arkiv · Verktyg · Inställningar · Sök/Ersätt), flytta ordräknaren från
sin centrerade position i toppen ner till botten av vänsterpanelen.
Två saker jag missade i skissen först och som Mats fångade:
Korrekturläsning/Publicera fanns också i vänsterpanelen (inte bara de
fyra jag först visade), och ordräknar-/målknappen ("1802 ord · Sätt
mål") satt faktiskt centrerad i toppraden (`.progress-header`,
`position:absolute; left:50%`) — båda hittade genom att läsa
`Editor.tsx` på riktigt istället för att gissa utifrån skärmdumpar.

**Byggt, inte bara skissat denna gång.** `Editor.tsx`s `<header
className="editor-top">` gick från en 3-kolumns CSS-grid (titel /
centrerad ordräknare / knappar) till en flex-rad: titel, skiljelinje,
fem flikar (Brainstorm/Synopsis/Utvecklingsmetod/Dispositioner/
Tidslinje — alla sex "riktiga vyer" utom Fråga manuset, som Mats ville
ha grundad-fakta-verktyget separerat från den påhittande Intervjua-
funktionen och därför lade i Verktyg-menyn istället), `margin-left:auto`
på åtgärdsknapparna. Ny återanvändbar `TopMenu`-komponent (samma
klick-utanför/Escape-mönster som `AppTopBar.tsx`s egna "Manuscripts"-
meny, återanvänder dess CSS-klasser `app-top-menu*` rakt av istället
för att hitta på nya). Vänsterpanelen tappade åtta knappar
(Brainstorm/Synopsis/Utvecklingsmetod/Dispositioner/Fråga manuset/
Tidslinje/Korrekturläsning/Publicera) och fick en ny `.progress-footer`-
knapp (`margin-top:auto` i den redan flex-column:ade `.rail`) som
ersätter den gamla centrerade `.progress-header`.

**Breddändring, varsamt.** Båda sidopanelerna delade tidigare EN
gemensam bredd (23.25rem) i alla lägen (fast, ihopfälld till 0.6rem,
eller flytande 23.25rem vid hover på en opinnad panel). Delade upp till
vänster 15rem / höger 28rem genomgående — `.editor-body`s
grid-template-columns (tre varianter för kollapsat vänster/höger/
båda) och `.rail-left.is-floating`/`.rail-right.is-floating`s
bredd-regler, som tidigare delade en enda `.rail.is-floating { width:
23.25rem }`. Pin/kollaps/flyt-mekaniken i sig (`leftRailExpanded`,
hover-timers) rördes inte alls — bara vilka pixelvärden den slår mellan.

**Verifiering, grundlig givet hur stor ändringen är.** `tsc --noEmit`,
hela testsviten (885 tester, oförändrat — ren UI-omstrukturering,
ingen ny kärnlogik), `npm run build` gröna. Playwright-verifierat live
i flera omgångar: alla fem flikar synliga och klickbara, Arkiv-menyn
visar exakt Säkerhetskopia/Exportera/Importera lore/Publicera,
Verktyg-menyn visar exakt Konvertera markörer/Fråga manuset/
Korrekturläsning, Inställningar och Sök/Ersätt fungerar som
direktknappar, ordräknaren ("10 words · Set goal" efter att ha skrivit
en testmening) sitter längst ner i vänsterpanelen och öppnar
`ProgressCard` korrekt, Sök/Ersätt-panelen ankrar rätt i sin nya
position. Pin/kollaps/flyt-testat explicit (inte bara antaget
oförändrat): avpinnad + hover → `is-floating`, avpinnad + ingen hover
→ `is-collapsed` (tunn 0.6rem-remsa), båda med korrekt ny bredd.

v1.0.50 → v1.0.51.

---

**Ändringslogg v1.0.51 → v1.0.52 (2026-10-07):** Första riktiga
testarsvaret på kapitelsammanfattning (v1.0.47). Två symptom
rapporterade: (1) kapitel 1 fick en bra sammanfattning, men alla
andra kapitel bara "copy-paste:ar" början av kapiteltexten, samma
modell/prompt; (2) Qwen3-14B-Instruct gav "model returned an empty
response" i StoryBook trots att SAMMA modell via SAMMA LM Studio-
anslutning fungerar fint i Writingway 2 med samma sammanfattnings-
kommando. Testaren hade redan kontrollerat att kontexten som gick in
var kapiteltext + systemprompt, inget annat — så felsökningen kunde
starta direkt i vår egen anropskod istället för att misstänka
testarens uppsättning.

**Rotorsak, hittad genom att jämföra mot resten av filen, inte genom
att gissa.** `summarizeChapter` (`BookStore.tsx`) satte `maxTokens:
220` — grep:ade alla ~16 `maxTokens`-värden i filen och det var det
UTAN JÄMFÖRELSE lägsta, lägre än även rena ett-ords-förslag (140) och
betydligt lägre än andra "skriv en kort passage"-anrop (500–700).
220 tokens räcker knappt för själva 2–4-meningars-sammanfattningen —
och ger i praktiken NOLL utrymme för en modell som tänker/planerar
innan den svarar, vilket är vanligt hos moderna lokala modeller,
"reasoning"-modeller i synnerhet (Qwen3s inbyggda tankeläge, påslaget
som standard om inget i anropet stänger av det — något StoryBook
aldrig gjort, bekräftat genom att grep:a hela `src/llm/` efter
think/reasoning-hantering: ingen finns). En modell som tänker färdigt
EFTER 220 tokens aldrig hinner svara; antingen blir `content`-fältet
tomt (om servern separerar tankedelen) eller så är det ofärdiga
tankefragmentet — som ofta BÖRJAR med att modellen återger/citerar
texten den ska sammanfatta — allt som finns kvar, vilket exakt matchar
"copy-paste av kapitlets början".

**Fix, smal och säker.** Höjde `maxTokens` 220 → 700 (i linje med
andra kortsvars-anrop i samma fil), plus en kommentar som förklarar
varför — annars ser 700 ut som ett godtyckligt högt tal för "bara 2–4
meningar". Rörde inget annat: ingen ändring av systemprompten, ingen
`/no_think`-disabling eller annan modell-specifik gissning, eftersom
jag inte kan verifiera den sortens åtgärd utan tillgång till testarens
faktiska modeller.

**Verifiering, med en ärlig begränsning.** `tsc --noEmit`, hela
testsviten (885 tester, oförändrat — ingen av dem anropar en riktig
modell för just den här vägen) och `npm run build` gröna. Kunde INTE
live-verifiera mot en riktig lokal modell (ingen Ollama/LM Studio
kopplad i den här miljön) — rotorsaksanalysen vilar på kodläsning och
jämförelse med resten av filens mönster, inte på att ha reproducerat
och sedan fixat buggen framför ögonen. Sa det rakt ut till Mats istället
för att låtsas vara säkrare än jag är.

v1.0.51 → v1.0.52.

---

**Ändringslogg v1.0.52 → v1.0.53 (2026-10-07):** Mats delade en
mockup-skärmdump av Settings och frågade om den borde bli ett fönster
"ungefär som Convert makers men större" istället för en egen hel sida.
Höll med — Settings var den enda "riktiga" ytan (`surface`-switch) som
låtsades vara en vanlig header-knapp, inkonsekvent mot alla andra
header-actions (Backup, Publicera, Konvertera markörer, m.fl.) som
redan är overlay-dialoger. Mats bekräftade: bygg det, låt det fylla
upp sidan rejält — och efter en avbruten första instruktion, ett
förtydligande: skärmdumpen visar STORLEK, inte STIL — bygg stort, men
stilmässikt likt de andra dialogerna, inte mockupens platta
vit-med-svart-kant-look.

**Research före kod, som vanligt.** Läste `SettingsPanel.tsx` (433
rader) i sin helhet för att kartlägga varje fält/prop/handler som
måste bevaras. Bekräftade via grep att `surface` SPARAS per bok
(`readLastPosition`/`JSON.parse`) — vilket gjorde det riskabelt att
riva ut `EditorSurface`s `"settings"`-literal eller `BookStore.tsx`s
`showSettings`/`setSurface("settings")`-rörledning helt. Beslöt att
lämna den dö-men-ofarlig (en gammal sparad `surface:"settings"`-rad
faller nu bara igenom till standardvyn istället för att krascha) och
bara ändra hur `Editor.tsx` själv konsumerar den. Läste
`.edit-card.interview-card` och `.edit-card.bible-review-card` som
CSS-förlagor för en stor, höjd-begränsad, internt scrollande dialog —
samma mönster återanvändes rakt av, ingen ny layout uppfanns.

**Bygget.** `SettingsPanel.tsx` fick en egen `.edit-overlay`/
`.edit-card.settings-card`-skal (samma ägarskaps-konvention som varje
annan `XCard.tsx`: komponenten äger sitt eget overlay, tar en
`onClose`-callback istället för den gamla `onBack`), med Escape-stöd
utöver klick-utanför och en explicit Close-knapp. Innehållet
omorganiserades till två kolumner: General (prosaspråk, Läsare,
"Versions per chapter" — flyttad hit från AI-sektionen, POV/Tempus/
Synvinkel, Röst) + Illustrations till vänster, AI settings
(motor/bas-URL, modellval, kontextfönster, lore-relevans-kryssruta,
AI-kontext-inspektör, startprompt) till höger — var och en i ett
bordrat `.settings-block`-delkort. `modelsHeading`-strängen ("Models"/
"Modeller") döptes om till "AI settings"/"AI-inställningar" i alla tre
språkfiler; nya `generalHeading`/`illustrationsHeading`-nycklar
tillagda. `Editor.tsx` fick en ny `settingsOpen`-boolean + `openSettings()`
(speglar `openProofread`s mönster: stänger syskon-overlays innan den
öppnar), Settings-knappens `onClick` pekar dit istället för
`store.showSettings()`, och surface-rendering-kedjans
`onSettings && !onBoard ? <SettingsPanel/> : ...`-gren togs bort helt
(den gamla `onSettings`-variabeln och dess användning i `pageText`/
`activeReaderAge` togs också bort som nu obehövda).

**Ett självrättat misstag under bygget:** skrev först om
`.settings-heading`-CSS-regeln (en delad uppercase-etikett-stil) till
en ny `.settings-block-title`, vilket av misstag hade raderat
originalregeln — en grep avslöjade att `.settings-heading` återanvänds
på flera andra ställen (`Home.tsx`, `QuickstartCards.tsx`,
`GuidePanel.tsx`, `HandbookPanel.tsx`), inte bara i Settings. Återställde
originalregeln orörd och lade istället till en smalt scopead
`.settings-block .settings-heading { margin: 0 }`-override (blockets
egen `gap` sköter avståndet istället), och bytte `SettingsPanel.tsx`s
rubriker till att återanvända samma `settings-heading`-klass som
"Models"-rubriken alltid haft, istället för att uppfinna en parallell
stil.

**Verifiering, fullständig.** `tsc --noEmit`, hela testsviten (885
tester, oförändrat — ren UI-omstrukturering), `npm run build` gröna.
Playwright-verifierat live: dialogen öppnas från header-knappen, båda
kolumnerna renderar alla fält korrekt (inklusive den omplacerade
"Versions per chapter" i General), intern scroll fungerar och visar
resten av innehållet (Illustrations-blocket, modellval, startprompt),
stängning fungerar via Close-knappen, klick-utanför OCH Escape — och i
samtliga fall ligger den underliggande vyn (kapitlet) kvar oförändrad
efteråt, precis den gamla "testare fastnade i Settings"-bugg-fixen
(tidigare `onBack`) som nu löses naturligt av modal-mönstret istället.

v1.0.52 → v1.0.53.

---

**Ändringslogg v1.0.53 → v1.0.54 (2026-10-07):** Mats tittade på den
nybyggda Settings-dialogen och tyckte de förklarande meningarna under
varje fält tog för mycket plats. Skickade en liten rund ikon-bild som
referens och bad om att lägga den bakom varje rubrik/fält-etikett med
en tooltip som visar informationen istället för att den står permanent
på sidan.

**Återanvände en befintlig komponent istället för att bygga ny eller
använda den skickade bilden rakt av.** En grep efter "tooltip" hittade
`GuideHelpButton` i `GuidePanel.tsx` — en liten rund "?"-knapp som
redan visar hover/fokus-tooltips via en portal (`position:fixed`,
beräknad från knappens egen `getBoundingClientRect()`), byggd just för
att inte klippas av överflödande scroll-containers. Exakt samma problem
som Settings nya `.settings-card-columns{overflow-y:auto}` har. Den
bifogade bild-filen (en rund platshållar-ikon) användes inte som en
faktisk tillgång — en rastrerad skärmdump vore inkonsekvent med appens
SVG/ikon-konventioner; byggde istället mönstret den visade.

**Refaktor, bakåtkompatibel.** Bröt ut den generiska portal/position-
logiken ur `GuideHelpButton` till en ny `HelpTip({ heading?, body,
ariaLabel })`, och skrev om `GuideHelpButton` till ett tunt omslag
(`<HelpTip heading={entry.heading} body={entry.body} .../>`) som slår
upp Guide-sektionens text precis som förut. Själva den publika
`GuideHelpButton`-signaturen rördes inte, så `BiblePanel.tsx`s och
`Editor.tsx`s befintliga användningar av den (Story Bible-rubriken,
m.fl.) förblev oförändrade.

**I `SettingsPanel.tsx`:** tog bort alla ~10 `<p className="quiet">`-
förklaringar (prosaspråk, versions-gräns, motor, bas-URL, kontext-
fönster, lore-relevans, startprompt, samt den inledande dialog-ledan
och "UI-språket stannar"-noten) och ersatte var och en med en `HelpTip`
direkt efter respektive fälts egen `<span>`-etikett (eller, för de två
som inte hör till ett enskilt fält, efter dialogens eget "Settings"-
h2 respektive "AI settings"-h2). Tog samtidigt bort de duplicerade
`title=`-attributen på inputs som redan visade samma text som en
webbläsar-tooltip — nu bara en enda, synlig tooltip-väg per fält.
Kryssrutan för lore-relevans fick en liten omstrukturering (egen
flex-rad runt `<label>` + `HelpTip` som syskon, inte barn) för att
undvika att klicka på hjälp-ikonen av misstag också skulle växla
kryssrutan (en `<label>` växlar sin kopplade input vid klick var som
helst inuti den).

**Ett CSS-specificitetsfel, hittat och fixat innan commit.** Första
försöket gav varje fält-etikett en ny `.field-label-row { display:
flex }`-klass — men den förlorade mot den äldre, mer specifika
`.voice-field span:first-child`-regeln (klass+pseudo-klass+element
slår en ensam klass), så "?"-ikonen hamnade på en egen rad under
etiketten istället för bredvid den. Fångades i en Playwright-
skärmdump innan commit, inte efteråt. Fixat genom att matcha samma
selektor-form med klassen inkluderad
(`.voice-field span.field-label-row:first-child` osv.) istället för
att gissa på `!important` eller flytta regeln i filen.

**Verifiering.** `tsc --noEmit`, hela testsviten (885 tester,
oförändrat), `npm run build` gröna. Playwright-verifierat live: alla
nio "?"-ikoner hittas och går att hovra, varje tooltip visar exakt den
text som togs bort (inklusive den långa kontext-fönster-förklaringen,
som radbryter korrekt inom tooltipens fasta 280px-bredd utan att
klippas av dialogens egen scroll), och dialogens höjd krymper märkbart
nu när texterna inte längre tar permanent plats.

v1.0.53 → v1.0.54.

---

**Ändringslogg v1.0.54 → v1.0.55 (2026-10-07):** Mats skickade en
skärmdump av Settings-dialogen på ett högre fönster där den fortfarande
klipptes av `height: min(92vh, 54rem)`s 54rem-tak (864px) långt innan
92vh hann bli den begränsande faktorn — Illustrations-blocket och delar
av AI-kolumnen krävde skroll trots gott om ledigt utrymme kvar i
fönstret. Bad om att låta höjden växa när det finns plats, så man
slipper skrolla.

**Fix, en rad.** Höjde rem-taket från 54rem till 70rem och vh-andelen
från 92vh till 94vh (`height: min(94vh, 70rem)`), med en uppdaterad
kommentar som förklarar varför taket är högre än `.edit-card.interview-
card`s ~50rem — Settings två kolumner är helt enkelt högre än den
chattformade förlagan, och poängen nu är att utnyttja ett högt fönster
istället för att tvinga fram skroll som extra höjd hade undvikit.

**Verifiering, med tre fönsterhöjder.** `tsc --noEmit`, hela
testsviten (885 tester, oförändrat), `npm run build` gröna.
Playwright-verifierat live vid tre viewport-höjder: 1300px (dialogen
växer till hela 70rem-taket, båda kolumnerna ryms utan skroll, ingen
skev tomrymd i den kortare AI-kolumnen), ~1000px (nästan ingen skroll
kvar — bara någon enstaka rad), och 700px (den gamla interna skroll-
mekaniken fortfarande fungerar oförändrat som fallback på ett kort
fönster).

v1.0.54 → v1.0.55.

---

**Ändringslogg v1.0.55 → v1.0.56 (2026-10-07):** Mats påpekade att han i
sin mockup hade lagt flera fält sida vid sida (Prose language, Reader,
Versions per chapter samt POV, Tense, Viewpoint) för att spara plats,
och frågade om det var knepigt att bygga. Svarade att det INTE var
knepigt — `.craft-fields`/`.craft-field` är redan en grid-komponent,
bara utan `grid-template-columns` i Settings-kontexten, och samma
sida-vid-sida-mönster finns redan på riktigt i kapitelhuvudet
(`.chapter-head-top > .craft-field { flex: 1 1 0 }`). Mats bekräftade:
bygg det.

**Återanvände exakt kapitelhuvudets mönster för POV/Tense/Viewpoint**
istället för att uppfinna ett nytt: `.settings-card .craft-fields {
display:flex; flex-wrap:wrap; }` + `> .craft-field { flex:1 1 0;
min-width:8rem; }` — samma "lika breda flexibla kolumner som radbryter
vid behov"-regel som redan finns för `.chapter-head-top`, bara scopead
till Settings (`.craft-fields` har bara den enda användaren, verifierat
med grep innan ändringen gjordes direkt på basregeln istället för en
extra scopead override).

**Ny rad-wrapper för Prose language/Reader/Versions per chapter**, som
inte redan var `.craft-field`-element utan fristående `.voice-field`/
`.reader-field`-etiketter: ny `.settings-field-row { display:grid;
grid-template-columns: 2fr 1fr 1fr; gap:0.7rem; align-items:start; }`
runt de tre — Prose language får dubbel bredd mot Reader/Versions
eftersom fri text behöver mer plats än en kort dropdown eller en
1-2-siffrig siffra, precis den avvägning jag flaggade när Mats frågade.
`.settings-card .voice-field, .settings-card .reader-field { margin-
top:0 }` fanns redan sedan tidigare och nollställde automatiskt den
annars omaka marginal-skillnaden mellan `.voice-field` (0.75rem) och
`.reader-field` (0.55rem) som annars hade gjort raden skev.

**Städade en kvarglömd dubblett-kommentar** i samma CSS-område från en
tidigare session (två kommentarsblock som förklarade samma sak, ett av
dem syftade inte längre på någon regel) medan jag ändå var där.

**Verifiering.** `tsc --noEmit`, hela testsviten (885 tester,
oförändrat), `npm run build` gröna. Playwright-verifierat live: båda
raderna renderar sida vid sida med rätt breddfördelning, och hela
dialogen ryms nu UTAN skroll även vid bara 900px fönsterhöjd (tidigare
krävde det antingen det höjda 70rem-taket från v1.0.55 ELLER ett
högre fönster — nu räcker bara den kompaktare layouten på egen hand).

v1.0.55 → v1.0.56.

---

**Ändringslogg v1.0.56 → v1.0.57 (2026-10-07):** Mats hade två följd-
observationer på Settings: (1) "Suggest from model" borde ligga direkt
bakom Context window-fältet och synas tydligare, kanske som en riktig
knapp; (2) "View AI context…" — hör den verkligen hemma under Settings,
eller borde den ligga i Verktyg-menyn istället? Svarade med en
rekommendation för båda (knapp i rad med fältet; flytta till Verktyg
eftersom det är en diagnostisk åtgärd — visa vad som faktiskt
skickades — inte en inställning, samma kategori som Korrekturläsning/
Konvertera markörer som redan ligger där). Mats bekräftade: bygg båda.

**Suggest from model.** La input och knapp i en gemensam flex-rad
(`.context-window-row`) inuti samma `<label>`, och gav knappen en
kant/padding-variant av `.text-button` (samma knep som
`.illustration-orientation-toggle .text-button` redan använder för
Landscape/Portrait) så den läses som en riktig knapp istället för en
diskret länk. Resultat-meddelandet ("Suggested X" / fel) flyttade ner
till en egen rad under fält-raden istället för att dela rad med
knappen, eftersom knappen inte längre har plats kvar bredvid sig i
samma `edit-actions`-div.

**View AI context, flyttad till Verktyg.** `PromptInspectorCard` ägde
redan sitt eget fullständiga `.edit-overlay`/`.edit-card`-skal (samma
etablerade mönster som varje `XCard.tsx`) och tog bara `entry`+`onClose`
— inga ändringar i den komponenten behövdes. Tog bort triggerknappen +
renderingen från `SettingsPanel.tsx` (och därmed `lastPrompt`-propen,
`contextOpen`-state och `PromptInspectorCard`/`PromptDebugEntry`-
importerna, nu obehövda där). Lade till `aiContextOpen`-state +
`openAiContext()` i `Editor.tsx` (speglar `openProgress()`s mönster:
stänger syskon-overlays innan den öppnar sig själv), ett nytt
menuitem sist i Verktyg-menyn efter Korrekturläsning, och renderade
`PromptInspectorCard` bland de andra överlagen längst ner i
komponenten — `store.lastPrompt` fanns redan där, ingen ny data
behövdes.

**Verifiering.** `tsc --noEmit`, hela testsviten (885 tester,
oförändrat), `npm run build` gröna. Playwright-verifierat live: knappen
sitter bredvid fältet i Settings och "View AI context" finns inte
längre där; Verktyg-menyn visar det nya menyvalet sist, och klick på
det öppnar samma AI context-dialog som förut, oförändrad.

v1.0.56 → v1.0.57.

---

**Ändringslogg v1.0.57 → v1.0.58 (2026-10-07):** Mats skickade en
skärmdump med tre buggar från General-raderna: (1) Reader-fältet (age)
linjerade inte med Prose language/Versions per chapter, (2) Prose
language-kolumnen var onödigt bred ("jag kunde skriva
SwedishSwedishSwedish och det var ändå plats kvar") — gör kolumnerna
lika breda som POV/Tense/Viewpoint-raden under, (3) texten i Voice och
Start prompt renderades i 17px Newsreader-serif istället för 14px som
kapitelkorten i vänsterpanelen.

**Mätte innan jag gissade.** Playwright `getBoundingClientRect()` på
varje fält istället för att resonera fram orsaken från skärmdumpen
ensam. Resultat: Prose language/Versions inputs startade vid y=158.95,
Reader-selecten vid y=149.56 — en skillnad på exakt 9.4px, samma som
skillnaden mellan Prose languages etikett-höjd (22.4px, har en
HelpTip-ikon) och Readers (13px, hade bara en osynlig `title=`-attribut,
ingen ikon). Readers kortare etikett-rad gjorde att selecten under den
startade högre — inte en layoutbugg i sig, utan en direkt konsekvens av
att Reader var det enda fältet i raden utan en "?"-ikon.

**Fix 1, samma mönster som redan finns.** Gav Reader en egen `HelpTip`
(samma `m.editor.readerTitle`-text som redan fanns som osynlig
`title=`-attribut) + `field-label-row`-klassen — löste både
linjerings-buggen OCH gjorde Reader konsekvent med sina syskon i raden
(alla tre har nu en synlig info-ikon, inte bara två av tre). Lade också
till matchande padding på `.settings-card .reader-field input` (Versions
per chapter, Context window) som tidigare renderade märkbart kortare än
Readers select i samma rad, av samma "glömd styling"-anledning.

**Fix 2.** `.settings-field-row`s `grid-template-columns` ändrad från
`2fr 1fr 1fr` till `1fr 1fr 1fr` — matchar nu POV/Tense/Viewpoint-radens
jämna tredjedelar rakt av, som Mats bad om.

**Fix 3, samma rotorsak som historyLimit/contextWindow-dubbletterna i
v1.0.54 men denna gång en äkta cascade-bugg.** `.voice-field textarea`
(0.88rem) och `.primer-field` (0.92rem, sans) hade EXAKT samma
specificitet som den generella `.edit-card textarea`-regeln (1.05rem,
Newsreader-serif, min-height 10rem) — en ren källkodsordning-krock, och
`.edit-card textarea` råkade stå SENARE i filen och vann. Bekräftade med
Playwright `getComputedStyle` innan fix: båda textarea fick 16.8px
Newsreader. Fixade genom att scope:a om reglerna till
`.edit-card.settings-card .voice-field textarea` / `.primer-field` —
två klasser istället för en, vinner deterministiskt oavsett
källkodsordning, inte bara just nu av en slump.

**Verifiering.** `tsc --noEmit`, hela testsviten (885 tester,
oförändrat), `npm run build` gröna. Playwright `getBoundingClientRect`/
`getComputedStyle` EFTER fixen bekräftade: alla tre fält i raden
startar nu på exakt samma y-position, kolumnerna är lika breda, båda
textarea renderar 14.08px Figtree (sans) istället för 16.8px Newsreader
(serif). Screenshot bekräftar visuellt att allt fortfarande ryms utan
skroll.

**Inte byggt än, väntar på svar:** Mats undrade om "Versions per
chapter" borde bli bara "Revisions" (kortare, eftersom fält-texten
redan finns i tooltipen). Svarade med en rekommendation istället för
att bygga direkt, väntar på bekräftelse.

v1.0.57 → v1.0.58.

---

**Ändringslogg v1.0.58 → v1.0.59 (2026-10-07):** Mats bekräftade
Revisions-namnbytet från förra rundan ("Byt till revision") och gick
vidare till den sista kvarvarande helsides-ytan: Ask Manuscript (Fråga
manuset), som fortfarande var en egen sida, inte en modal som alla
andra verktyg. Bad om: samma storlek som Settings; ta bort texten ovanför
frågefältet OCH tomt-läge-texten under det; lägg den borttagna
förklaringen som frågefältets egen placeholder-text istället; och
säkerställ att frågefältet inte knuffas ut ur rutan om svaret blir
långt — med en direkt fråga om det borde bli samma mönster som
Claude/Gemini/ChatGPT (chattfönster med frågan fastnålad längst ner,
svaret scrollande ovanför).

**Revisions.** Döpte om `historyLimit` i alla tre språkfiler — men INTE
rakt av till det svenska ordet "revision" (som i vardagssvenska
nästan uteslutande betyder bokföringsrevision/finansiell granskning,
fel association för kapitelversioner). Engelska blev "Revisions" som
Mats bad om; svenska/norska kortades istället ner till bara
"Versioner"/"Versjoner" (samma riktning — kortare, tooltipen finns kvar
för den som undrar — men utan att importera en missvisande term).

**Ask Manuscript, samma modal-konvertering som Settings i v1.0.53.**
`AskManuscriptPanel` (`AskManuscript.tsx`) skrev om till att äga sitt
eget `.edit-overlay`/`.edit-card`-skal (samma ägarskaps-konvention som
varje annan `XCard.tsx`), med `onClose`-prop + Escape-hantering. I
`Editor.tsx`: tog bort `onAskManuscript = surface === "ask"` och dess
användning i `pageText`/`activeReaderAge`-ternaryerna samt
render-grenen i surface-kedjan (samma mönster som Settings — lämnade
`EditorSurface`s `"ask"`-literal och `store.showAsk()` dö-men-ofarliga,
av samma skäl: en gammal sparad `surface:"ask"` faller nu bara igenom
till standardvyn). Ny `askManuscriptOpen`-state + `openAskManuscript()`
(speglar `openAiContext()`s mönster: stänger syskon-overlays innan den
öppnar). Extra genomtänkt detalj: `onJumpToChapter` stänger nu även
modalen när man klickar en källa, eftersom det annars inte skulle synas
att man faktiskt hoppat till kapitlet — BiblePanels motsvarande
"hoppa till kapitel"-knapp (en ständigt synlig sidopanel, inte en
modal) stänger ingenting, så detta är en medveten avvikelse för den
nya modal-kontexten, inte en kopierad bugg.

**Chat-layouten.** `.ask-manuscript-scroll { flex:1 1 auto; min-
height:0; overflow-y:auto; }` + `.ask-manuscript-form { flex:0 0 auto;
border-top:1px solid var(--border-soft); }` — exakt samma `flex:1 1
auto`/`min-height:0`-mönster som `.settings-card-columns` redan
bevisat löser "långt innehåll ska scrolla internt, inte knuffa ut
resten av kortet". Bredd/höjd delas rakt av med Settings via en
utökad selektor (`.edit-card.settings-card, .edit-card.ask-manuscript-
card { width:min(78rem,100%); height:min(94vh,70rem); ... }`) istället
för att duplicera värdena — "lika stor som Settings" blir bokstavligt
sant, inte bara en ungefärlig matchning.

**En liten namnstädning på vägen.** `.settings-card-head` (den delade
rubrik+Close-knapp-raden) hette något Settings-specifikt trots att den
nu återanvänds av en annan dialog — döpte om till `.dialog-head`
(enda användningsstället i `SettingsPanel.tsx` uppdaterat i samma
ändring) istället för att låta namnet vilseleda nästa person som läser
koden.

**Textflytt.** `askManuscript.lede` (den gamla texten ovanför fältet)
blev `askManuscript.placeholder`s nya värde rakt av — orden var redan
exakt vad Mats bad om, bara en flytt av VAR de visas. `askManuscript.empty`
(tomt-läge-texten under fältet) togs bort helt utan ersättning, som
uttryckligen bett om.

**Verifiering.** `tsc --noEmit`, hela testsviten (885 tester,
oförändrat), `npm run build` gröna. Playwright-verifierat live: dialogen
matchar Settings storlek exakt, frågefältet visar rätt placeholder-text,
varken lede- eller tomt-läge-texten finns kvar, frågetexten man skrivit
bevaras i fältet, och samtliga tre stängningsvägar (Close-knapp, klick
utanför, Escape) fungerar. Kunde INTE live-testa hela svars-scroll-
flödet end-to-end (ingen lokal AI-modell kopplad i den här miljön) —
layout-mönstret är dock identiskt verifierat-fungerande kod från
Settings, inte en ny oprövad konstruktion.

v1.0.58 → v1.0.59.

---

**Ändringslogg v1.0.59 → v1.0.60 (2026-10-07):** Mats testade Ask
Manuscript live med en riktig modell och fick ett riktigt svar — första
gången i hela sessionen jag faktiskt sett resultatet av en AI-funktion
i en skärmdump, inte bara resonerat mig fram till att koden borde
fungera. Två finjusteringar: (1) svarstexten har redan en läsbar
max-bredd (48rem), men själva FÖNSTRET delade Settings breda
tvåkolumns-mått (78rem) — mycket tom yta till höger om texten. Fönstret
borde anpassa sig efter textbredden istället. (2) Frågefältet borde
vara två textrader högt (var tre) och lika brett som svarstexten (var
fullbrett över hela den breda dialogen).

**Bredd, frikopplad från Settings.** `.edit-card.ask-manuscript-card`
delar fortfarande HÖJDEN med Settings (`min(94vh,70rem)` — fortfarande
ett högt chattfönster, det var aldrig problemet) men fick sin egen
bredd: `min(51rem,100%)` — beräknat från svarstextens 48rem
läsbredd plus `.edit-card`s egen padding (2×1.15rem), så kortet blir
precis stort nog för innehållet istället för en godtycklig bredare
siffra. Frågefältet behövde ingen egen bredd-regel: när kortet själv
blev smalare matchar `.ask-manuscript-form`s fullbredd-stretch (grid-
items stretchar som standard) nu i praktiken svarstextens bredd automatiskt.

**Två rader, en andra cascade-bugg av exakt samma sort som
Voice/Primer-fixen i v1.0.58.** Satte `rows={2}` i `AskManuscript.tsx`,
men fältet förblev 160px högt — `.edit-card textarea`s generella
`min-height:10rem` vann fortfarande över `rows`-attributets naturliga
höjd, trots att `.ask-manuscript-form textarea`s egen `font: inherit`
(samma specificitet, men SENARE i filen) redan bevisligen vann för
typsnittet. Lade bara till `min-height: auto;` i samma regel — behövde
ingen extra scope-klass den här gången eftersom källkodsordningen
redan låg rätt till (samma mekanik som redan fungerade för `font:
inherit`, bara en egenskap jag hade missat första gången).

**Verifiering.** `tsc --noEmit`, hela testsviten (885 tester,
oförändrat), `npm run build` gröna. Playwright `getBoundingClientRect`/
`getComputedStyle`: kortet mäter nu exakt 816px (51rem) brett,
frågefältet 777px brett (matchar svarstextens 768px/48rem inom någon
pixels marginal) och 59px högt (genuint två rader, ner från 160px).
Screenshot bekräftar visuellt: ingen tom yta kvar till höger, kompakt
fönster som följer textens egen bredd.

v1.0.59 → v1.0.60.

---

**Ändringslogg v1.0.60 → v1.0.61 (2026-10-07):** Mats frågade om `---`
och `>` skulle skapa linjer i manuskriptet — jag svarade (grundat på
`proseFlow.ts`) att det redan var byggt och live. Han testade och det
funkade INTE: skrev `---`/`>` för hand och det stod kvar som bokstavlig
text. Min research var korrekt om VAD koden gör, men fel om NÄR den
faktiskt kör.

**Rotorsak #1, hittad genom att läsa reconciliation-effekten i
`ProseCanvas.tsx`, inte genom att gissa.** Live-redigeringens DOM-synk
(`useEffect` som jämför `proseFromElement(area)` mot `value`) hoppar
över att skriva om DOM:en när den extraherade texten redan matchar
`value` — medvetet, annars skulle varje knapptryckning slåss med
webbläsarens egen markör-hantering. Men `proseFromElement` läser EXAKT
samma text tillbaka oavsett om ett stycke är en vanlig `<p>---</p>`
eller redan uppmärkt som `<span class="prose-hr">---</span>` (spannet
göms bara visuellt) — så den jämförelsen kan ALDRIG upptäcka "det här
stycket behöver fortfarande uppgraderas". Skriva `---` för hand stod
därför kvar som tre bindestreck för alltid, och blev bara en linje vid
NÄSTA fullständiga ombyggnad (kapitelbyte, en AI-redigering) — aldrig
när författaren faktiskt skrev det.

**Fix #1.** Ny `blockMarkupNeedsSync()` (`proseDom.ts`) som skannar
varje styckes råtext mot `HR_BLOCK`/`QUOTE_PREFIX` (nu exporterade från
`proseFlow.ts`) och jämför mot styckets FAKTISKA CSS-klass i DOM:en —
en äkta mismatch (text säger `---` men klassen saknas, eller tvärtom)
tvingar fram en ombyggnad som annars hoppats över. Eftersom en sådan
ombyggnad inte alltid sker i slutet av texten (en scenbrytning mitt i
manuset, t.ex.) byggdes också en ny `pendingCaretOffset`-mekanism
(samma idé som den befintliga `pendingSelection` för formatterings-
växling, men för en kollapsad markör-position istället för en
markering) + `currentCaretOffset()` i `proseDom.ts`, så markören
hamnar rätt efteråt oavsett var i manuset ombyggnaden sker.

**Rotorsak #2, en EGEN bugg jag introducerade och fångade innan commit
genom att faktiskt testa live, inte bara läsa koden.** Efter fix #1
konverterades `---` korrekt till en linje medan man skrev — men
Enter-tangenten direkt efter gjorde sedan ingenting alls. Playwright-
isolerade experiment (ett separat scratch-HTML-dokument, inte appen)
visade exakt varför: `document.execCommand("insertParagraph")`
misslyckas TYST i Chromium när markören står i en `<span>` som är
tvingad till `display:block` för att se ut som en linje — webbläsaren
lägger bara till ett syskon-`<span>` i SAMMA `<p>` istället för att
skapa ett nytt stycke. Verifierat genom att testa 10+ CSS-kombinationer
isolerat: flyttar man samma styling till `<p>`-elementet istället
(redan block-nivå av sin egen tagg, ingen `display:block`-tvingning av
ett inline-element behövs) fungerar `execCommand` perfekt.

**Fix #2.** `htmlFromProse` i `proseFlow.ts` skriver nu `class="prose-
hr"` direkt på `<p>`:et för en scenbrytning istället för på ett inre
`<span>` — texten ligger okapslad direkt i stycket. CSS:en
(`.prose .prose-hr`) behövde inga ändringar, bara vilket element som
bär klassen.

**Rotorsak #3, hittad genom att faktiskt följa upp VARFÖR Enter
fortfarande inte fungerade efter fix #2 — inte nöja sig med "borde
funka nu".** Fix #2 löste execCommand-problemet i isolerade tester,
men i appen gjorde Enter DIREKT efter en `---`-rad fortfarande
ingenting. Orsak: webbläsarens `insertParagraph` KOPIERAR det delade
styckets klass till det nya, tomma stycket (`<p class="prose-hr">
<br></p>`) — och `blockMarkupNeedsSync` (fix #1) tolkade det tomma men
fel-klassade stycket som en mismatch (tom text matchar inte
`HR_BLOCK`, men klassen `prose-hr` fanns ändå), tvingade fram en
ombyggnad FRÅN `value` — som aldrig hört talas om det nya tomma
stycket — och raderade därmed precis det stycke webbläsaren just hade
skapat. Enter "gjorde ingenting" eftersom resultatet omedelbart
suddades ut igen.

**Fix #3.** `blockMarkupNeedsSync` hoppar nu över tomma stycken helt —
`proseFromElement` ignorerar dem ändå (de bidrar inget till den
extraherade texten), så en tillfälligt fel-klassad tom rad direkt
efter en Enter-delning är ofarlig och rättar sig själv automatiskt så
fort författaren skriver något riktigt i den.

**Verifiering, med upprepade live-tester tills det faktiskt
fungerade, inte en enda lyckad körning.** `tsc --noEmit`, hela
testsviten (885 tester, 3 uppdaterade för den nya `<p class="prose-
hr">`-markeringen istället för `<span>`), `npm run build` gröna.
Playwright, flera körningar: skrev `---` för hand → blev en linje
direkt; Enter direkt efter → skapade korrekt ett nytt stycke (inte
tyst ingenting); skrev `>` för hand → blev ett citat direkt; en
scenbrytning infogad MITT i manuset (inte sist) → markören hamnade
exakt rätt efteråt, bekräftat genom att fortsätta skriva och se texten
landa på rätt ställe. Ett tidigt tecken på problemet (en skärmdump som
inte visade den infogade texten alls) visade sig vara en Playwright-
skärmdump-artefakt, inte en app-bugg — bekräftat genom att dumpa
`innerHTML` direkt istället för att lita på en bild.

v1.0.60 → v1.0.61.

---

**Ändringslogg v1.0.61 → v1.0.62 (2026-10-07):** Mats testade v1.0.61
på riktigt och rapporterade två kvarvarande problem: (1) `---` gjorde
"något" men ingen linje syntes, och Enter efteråt flyttade texten ner
bara EN pixel (inte en normal radhöjd) — "känns som om fonten blir
pytteliten"; (2) skriver man `>` och sedan text DIREKT (utan Enter
emellan) syns ingenting alls — varken markören eller det man skriver —
förrän man trycker Enter. Detta rättar också en felaktig slutsats i
förra loggposten: skärmdumpen som inte visade något antogs vara en ren
Playwright-artefakt — det var den delvis, men det fanns en äkta
synlighets-bugg också, bara dold av att mina DOM-dumpar (som bekräftade
`---` fanns i texten) inte fångar CSS-rendering.

**Bugg 1, hittad genom `getComputedStyle`, inte gissning.** `.prose-hr`
hade `width: 3.5em` OCH `font-size: 0` på SAMMA element — `em` räknas
mot elementets EGEN font-size, så `3.5em` av `0` blev `0px` bredd.
Samma sak med `margin: 1.1em auto` — också nollställd, därav "flyttas
texten ner en pixel" (bara `height:1px` kvar, ingen marginal alls).
Detta är en förmodat UR-GAMMAL bugg (fanns redan innan den här sessionens
ändringar, bara aldrig upptäckt eftersom `---` tidigare bara renderades
efter kapitelbyte/AI-redigering, aldrig faktiskt betraktat noga av en
människa). Fix: `3.5em`/`1.1em` → `3.5rem`/`1.1rem` (rem räknas mot
root, inte det egna, nollställda font-size-värdet).

**Bugg 2, en konsekvens av v1.0.61:s egen fix, hittad genom att
faktiskt läsa `window.getSelection()` efter varje tangenttryckning.**
`.prose-quote-marker` göms på samma sätt (`font-size:0`). När `>`
precis konverterats och inget brödtext finns än, landar markören
(enda innehållet i stycket) EXAKT vid slutet av den gömda markör-
textnoden — och eftersom en nollstor inline-box inte ger webbläsaren
någon visuell "precis efter"-position skild från "fortfarande inuti",
fortsatte varje ny tangenttryckning att FÖRLÄNGA den gömda markören
istället för att bli synlig brödtext. Försökte först lösa det genom
att explicit flytta markören till förälderns barn-index efter markör-
spannet (`pointWithinBlock`) — fungerade för FÖRSTA tecknet men inte
pålitligt för efterföljande (webbläsarens egen caret-hantering vid en
nollstor box är inte pålitlig att styra med Range-positionering).

**Den faktiska lösningen, mer robust.** Istället för att försöka
kontrollera VAR tecken hamnar, upptäcker `blockMarkupNeedsSync` nu
när markör-spannets EGET innehåll har växt förbi den matchade
prefixen (`> `) — oavsett var tecknen råkade hamna i DOM:en — och
tvingar samma ombyggnad som redan finns för andra mismatchningar,
vilket flyttar de extra tecknen till synlig brödtext inom en
renderingscykel. Två finjusteringar krävdes för att detta inte skulle
äta bort det avsiktliga mellanslaget i "> ": (a) jämförelsen måste
använda OTRIMMAD text (ett precis-nu-skrivet avslutande mellanslag är
äkta innehåll, inte menings... löst skräp att trimma bort), och (b)
webbläsaren konverterar ofta ett mellanslag i slutet av en inline-körd
till en hårt mellanslag (` `) för att det inte ska kollapsa bort —
måste normaliseras innan jämförelse eller så såg "> " (vanligt
mellanslag, förväntat) och "> " (hårt mellanslag, verkligt DOM-
innehåll) ut som en mismatch och tvingade fram en onödig ombyggnad som
tappade mellanslaget varje gång.

**Verifiering, upprepad tills alla fyra scenarion höll samtidigt.**
`tsc --noEmit`, hela testsviten (885 tester, oförändrat), `npm run
build` gröna. Playwright: `getComputedStyle` bekräftar nu `width:56px`
(3.5rem) och korrekt marginal på HR-linjen; en fullständig skriv-
sekvens (`---`, Enter, `> text`, Enter, mer text) ger korrekt DOM och
en skärmdump där linjen faktiskt syns och citatet är korrekt indraget;
mellanslaget efter `>` bevaras genom hela sekvensen; Enter direkt
efter `---` fungerar fortfarande; infogning MITT i manuset fungerar
fortfarande. Körde om alla tidigare scenarion, inte bara de nya, för
att säkerställa att ingen av de nya fixarna rubbade det som redan
fungerade.

v1.0.61 → v1.0.62.

**README.md uppdaterad (2026-10-08), ingen versions-bump.** Mats frågade
om `project_spec.md` och `README.md` var i synk med senaste
uppdateringarna. `project_spec.md` var redan aktuell (status-raden
följer `package.json` vid varje release). `README.md` visade sig vara
orörd sedan 29 september — före hela den här sessionen — och hade
flera konkreta sakfel kvar efter v1.0.51:s ombyggnad av toppfältet
(Brainstorm/Synopsis/Development method/Briefs/Timeline blev flikar;
Backup/Export/Importera lore/Publicera/Konvertera markörer/Fråga
manuset/Korrektur/Visa AI-kontext flyttade till Arkiv- och
Verktygsmenyerna i headern) och efter v1.0.53/v1.0.59:s konvertering
av Inställningar/Fråga manuset till modala dialoger: "Settings is
first in the left rail", "Proofread sits under Chapters in the left
rail... Publish is the last item in the rail", "Versions per chapter"
(bytte namn till "Revisions" i v1.0.59). Läste hela filen (78 rader)
innan jag rättade, kontrollerade mot faktisk kod (`Editor.tsx`:s
`archiveNav`/`toolsNav`-menyer, `BookStore.tsx`:s modell-standardvärden)
istället för att gissa, och skrev om de drabbade meningarna i "Run"-
och "Loop"-avsnitten så de pekar på rätt meny/flik/dialog. Inget
app-kod ändrades, bara dokumentationen.

**README.md styckad till undersidor (2026-10-08), ingen versions-bump.**
Mats, direkt efter föregående rättning: "Jag tänker också att det inte
är en one-pager utan att det får bli undersidor." Flyttade innehållet
från den ensidiga README.md till en ny `docs/`-mapp: `docs/running.md`
(installation, starta-skript, `OLLAMA_ORIGINS`, Backup/Publicera/
Framsteg), `docs/models.md` (Engine/Writing/Review-modeller,
Context window), `docs/guide.md` (hela 18-stegs-loopen plus Analyze,
som tidigare låg direkt i README) och `docs/testing.md` (testkommandon).
`README.md` själv är nu en kort landningssida: pitch, syskon-
projektnotis, språknotis, en snabbstart och en "Documentation"-lista
med länkar till de fyra undersidorna, plus Changelog-länken. Inget
app-kod ändrades.

**Ändringslogg v1.0.62 → v1.0.63 (2026-10-08):** Mats visade ett
Reddit-citat om en molnlösning som tog 1,5h på ett 240k-ords manus,
och undrade om hans Nvidia P4000 (8GB) skulle klara motsvarande i
StoryBook AI:s Proofread. Jag läste `proofreadRun.ts`/`proofreadScenes.ts`
istället för att gissa och förklarade varför arkitekturen redan är
lokal-vänlig (scenjämförelsen görs med gratis lexikal förfiltrering i
JS, bara topp-24 kandidater går till modellen; Grammar går kapitel för
kapitel, inte hela boken i en kontext). Mats frågade uppföljningsfrågan:
finns det en risk att detta missar saker jämfört med att skicka hela
boken till en molnmodell? Vid genomläsning av Age-stegets prompt
(`ageUserPrompt` i `proofread.ts`) hittade jag en riktig bugg, inte bara
en avvägning: `AGE_SYSTEM` bad modellen "read closely for profanity,
graphic violence, and sexual or explicit content" när Reader är under
18 — men `ageUserPrompt` skickar bara aggregerad statistik (antal ord,
meningslängd, andel ovanliga ord), aldrig den faktiska prosan. Modellen
ombads alltså läsa text den aldrig fick se. Till skillnad från Grammar-
stegets `parseGrammarItems` (som verifierar varje citat mot kapitlets
riktiga text via `quoteInProse` innan det visas) gjorde `parseAgeResult`
ingen sådan kontroll alls — ett påhittat citat hade kunnat slinka igenom
oemotsagt.

**Fixen:** flyttade innehållskontrollen till Grammar-steget, som redan
läser varje kapitels fulla prosa (ett LLM-anrop per kapitel, inte hela
boken) och redan har citatverifiering. `GRAMMAR_SYSTEM` (konstant) blev
`grammarSystem(book, chapter)` (funktion) som lägger till en
content-regel ("profanity, graphic violence, sexual or explicit
content", tag `"category":"content"`, max 4 per kapitel utöver de 8
grammatikflaggorna) bara när kapitlets resolvade Reader-ålder (via
befintliga `resolveReader(book, chapter)`, samma per-kapitel-override-
mönster som Camera/Voice redan använder) är under 18 — noll extra
kostnad för vuxenmanus, som är det vanliga fallet. `grammarUserPrompt`
fick en ny `Reader (intended audience): about N.`-rad, också bara när
relevant. `parseGrammarItems` hanterar nu `category:"content"` med eget
tak (4) separat från grammatik-taket (8), och validerar dess citat mot
den riktiga prosan precis som grammatikflaggor redan gjorde — samma
`quoteInProse`-skydd, ingen ny kod för det. Tog bort den trasiga
instruktionen ur `AGE_SYSTEM`/`ageUserPrompt` och lade till en explicit
rad om att modellen inte fått kapiteltexten och inte ska hitta på citat
— skyddar även de kvarvarande "craft"-citaten (moral, vuxen tar beslutet
istället för barnet) som har samma underliggande textlöshet men inte är
lika allvarliga att flytta. `ProofreadFlagSchema`s kommentar om
`category` uppdaterad till att beskriva grammar-steget, inte age-steget.
UI:t (`ProofreadCard.tsx`) behövde ingen ändring — grupperingen är redan
generisk på `flag.stage`, så content-flaggor dyker nu bara upp under
"Grammar" istället för "Age", fortfarande med samma "Content check"-
badge.

Fem nya tester i `tests/core/proofread.test.ts`: content-regeln syns i
`grammarSystem` bara för en ung Reader; `grammarUserPrompt`s Reader-rad
likaså; `ageUserPrompt` nämner inte längre profanity/violence/explicit;
`parseGrammarItems` behåller ett content-citat bara om det faktiskt
finns i prosan, kapar vid 4, och ett påhittat citat ger `[]`. `npx tsc
--noEmit`, `npx vitest run` (889 tester, alla gröna) och `npm run build`
gröna. Ingen Playwright-körning denna gång — ändringen rör bara
prompt-konstruktion/parsing i `core/`, ingen UI-interaktion ändrades,
och grupperingslogiken i `ProofreadCard.tsx` lästes och lämnades orörd.

v1.0.62 → v1.0.63.

**Ändringslogg v1.0.63 → v1.0.64 (2026-10-08):** Mats lägger in Greven
av Monte Cristo (115 kapitel, en karaktär som uppträder under flera
namn — Edmond Dantès / Greven av Monte Cristo / Abbé Busoni / Lord
Wilmore) och undrade om Alias saknades, eller om han bara missade det.
Svaret: Alias finns (byggt tidigare i sessionen, task #1), men bara på
en entitets kort EFTER att minst en fakta är låst (`TrackingFields` i
`BiblePanel.tsx`, kräver en riktig `entity_ref`) — inte i
`NewEntityOverlay`, dialogen för att skapa en ny karaktär/plats/objekt
(bara Namn + ett första påstående). Mats, efter att ha fått det
förklarat: "Jag tror att det är bästa tt kunna redigera alias redan
när man skapar sin karaktär... flera som börjar med att bygga sin
Värld/Lore först" — ett tydligt byggbeslut, inte bara en sparad idé.

**Byggt:** `NewEntityOverlay` fick ett tredje fält, Alias
(samma `m.bible.aliases`/`aliasesAside`/`aliasesPlaceholder`-copy och
samma `.bible-field`-stil som det redan etablerade fältet på det låsta
kortet), mellan påstående-fältet och knapparna. `onCreate` fick en
fjärde parameter (`aliases: string[]`, parsad med befintliga
`parseTagList`). Anropsstället (`BiblePanel.tsx`, vid `<NewEntityOverlay>`)
kör `addFact` som vanligt och patchar därefter `entity_tracking` via
samma `upsertEntityTracking(current.entity_tracking, { entity_ref:
slugify(label), aliases })` + `touch(...)`-mönster som redan används av
det låsta kortets `onTracking`-hanterare — ingen ny kärnlogik, bara
samma byggsten anropad en gång till, direkt efter skapandet. Tomt
Alias-fält patchar ingenting (samma `aliases.length > 0`-vakt som
undviker en tom `entity_tracking`-rad).

Verifierat live i Playwright: skapade "Edmond Dantès" med alias
"Greven av Monte Cristo, Abbé Busoni, Lord Wilmore" i dialogen, öppnade
sedan samma kort och läste av att Alias-fältet redan var ifyllt med
exakt den strängen — hela vägen från dialog till sparad `entity_tracking`
till det efterföljande kortet fungerar. `npx tsc --noEmit`, `npx vitest
run` (889 tester, oförändrat — ingen ny kärnlogik att testa, bara en
UI-koppling av befintliga funktioner) och `npm run build` gröna.

v1.0.63 → v1.0.64.

**Ändringslogg v1.0.64 → v1.0.65 (2026-10-08):** Mats skickade en
skärmdump: Scene-kortet låg synligt längre ut åt vänster än "Chapter
settings", kapitelrubriken och själva prosan ovanför/under. Bad om att
det skulle "läggas under Chapter Settings och få samma bredd som det
övriga."

**Root cause:** `<ScenesPanel>` renderades som ett SYSKON till
`<div className="chapter-head">` i `Editor.tsx` (`<main
className="manuscript">` → `.chapter-head` + `<ScenesPanel>` +
`<ProseCanvas>` som tre separata direkta barn). `.chapter-head` har
`align-self: center; max-width: 54rem` för att bli en centrerad,
breddbegränsad kolumn i `.manuscript`s flex-column-layout — men
`.scenes-panel` saknade samma regel och föll därför tillbaka på flex-
standarden `align-self: stretch`, vilket gav den hela `.manuscript`s
fulla bredd istället för att vara centrerad och kapad till 54rem som
allt annat. På en bred skärm landar en full-bredd-box's vänsterkant
längre ut åt vänster än en centrerad, smalare kolumns vänsterkant —
exakt det Mats såg.

**Fixen:** flyttade `<ScenesPanel>`-JSX:en in i `.chapter-head`-diven
(efter `chapter-threads`, innan dess stängande tagg) istället för att
duplicera bredd-CSS:en på ett till ställe — ärver samma centrering och
54rem-tak automatiskt, och hamnar bokstavligen under Chapter settings
som efterfrågat. Tog också bort `.scenes-panel`s egna
`margin: 0.6rem 0.55rem 0.9rem` sido-marginal (0.6rem 0 0.9rem istället)
så den blir flush med rubrik/trådar ovanför, inte 0.55rem indragen på
var sida.

Verifierat live i Playwright (1854px bred vy): `.chapter-head`,
`.chapter-title` och `.scenes-panel` har nu identisk `x`-position (391)
och bredd (864px) — pixel-exakt samma kolumn. `npx tsc --noEmit`,
`npx vitest run` (889 tester, oförändrat — ren layoutändring) och
`npm run build` gröna.

v1.0.64 → v1.0.65.

**Ändringslogg v1.0.65 → v1.0.66 (2026-10-08):** Mats, direkt efter
Scene-bredd-fixen, bad om ytterligare omflyttning i samma `.chapter-head`-
kolumn: "Lägg in Add chapter illustration under Chapter settings och
Lägg kapitelnamnet under Scene."

**Genomfört.** `ChapterStartImageBanner` (omslagsbild för kapitlet)
renderades tidigare inne i `ProseCanvas`s `aside`-prop, som en av fem
saker i ett fragment (`ContinuityWarning`, `PlaceholdersPanel`,
`DarlingsPanel`, `ModelAsideCallout`) — alltså visuellt placerad
ovanför själva prosan, efter hela `.chapter-head`-blocket. Flyttade ut
den ur det fragmentet och in i `.chapter-head` som egen rad direkt
efter `<ChapterSettingsSection>`. Kapiteltitelns `<input>` och
`chapter-threads`-diven (plotline-trådarna, som följer med titeln som
en enhet) flyttades i sin tur till sist i `.chapter-head`, efter
`<ScenesPanel>`. Ny ordning: Chapter settings → omslagsbild → Scene →
kapiteltitel → trådar → (sedan prosan, med Continuity/Placeholders/
Darlings/Model-aside kvar där de var, bara `ChapterStartImageBanner`
borttagen ur den listan).

`.chapter-start-image` hade redan `align-self:center; max-width:54rem`
från tidigare (det tvingade den till samma bredd även när den satt
inuti den bredare `.prose-wrap`) — overflödigt men ofarligt nu när den
sitter i den redan breddbegränsade `.chapter-head`, så ingen CSS-ändring
behövdes för själva bilden.

Verifierat live i Playwright: läste `.chapter-head`s barnordning direkt
ur DOM:en efter rendering — `["chapter-settings", "chapter-start-image",
"scenes-panel", "chapter-title"]`, exakt den begärda ordningen — plus en
skärmdump som bekräftar visuellt att allt ligger i samma smala,
centrerade kolumn. `npx tsc --noEmit`, `npx vitest run` (889 tester,
oförändrat) och `npm run build` gröna.

v1.0.65 → v1.0.66.

**Ändringslogg v1.0.66 → v1.0.67 (2026-10-08):** Mats rättade mig
direkt: "Jag tänkte att Add illustration ligger INUTI Chapter settings."
— v1.0.66 hade bara placerat den som ett syskon direkt EFTER Chapter
settings, inte faktiskt inuti den fällbara panelen.

**Genomfört.** `ChapterSettingsSection` fick tre nya props
(`startImage`, `onSetStartImage`, `onRemoveStartImage`, typad med
`EntityPicture` från `@core/entityMedia`, nu importerad i Editor.tsx)
och renderar `<ChapterStartImageBanner>` som första barn i
`.chapter-settings-body` — alltså bara synlig när panelen är utfälld,
ovanför Voice/Reader/POV/Tense/Viewpoint. Anropsstället i `.chapter-
head` skickar nu bild-propsen in i `<ChapterSettingsSection>` istället
för att rendera `<ChapterStartImageBanner>` som eget syskon.

Verifierat live i Playwright: `.chapter-start-image` finns inte alls i
DOM:en innan Chapter settings fälls ut (`count: 0`), dyker upp som
`.chapter-settings-body`s FÖRSTA barn efter att ha klickat på toggle-
knappen (`count: 1`, ordning `["chapter-start-image", "chapter-head-
top", "chapter-craft"]`) — plus en skärmdump som bekräftar det
visuellt. `npx tsc --noEmit`, `npx vitest run` (889 tester, oförändrat)
och `npm run build` gröna.

v1.0.66 → v1.0.67.

**docs/models.md uppdaterad (2026-10-08), ingen versions-bump.** En
testare frågade om StoryBook AI skulle kunna stödja "Strata" ("works
with any OpenAI- or Anthropic-compatible client"), och Mats undrade om
svaret skulle vara "inte något vi jobbar med men vi följer frågan" —
samma typ av avsteg-från-filosofin-fråga som API-diskussionen tidigare
samma dag. Innan jag svarade sökte jag upp vad Strata faktiskt är
istället för att gissa: en lokal, MIT-licensierad inferensmotor som
kör på användarens egen dator och serverar ett OpenAI-kompatibelt API
på `http://127.0.0.1:8080/v1` plus Anthropics Messages-API — alltså
ingen molntjänst alls, bara ännu en lokal server av samma sort som
LM Studio.

**Verifierat live, inte bara i teorin:** byggde en liten Node-
testserver som efterliknar Stratas API-form (`GET /v1/models`,
`POST /v1/chat/completions` med SSE-streaming) och körde den riktiga
appen mot den via Settings → Engine → "LM Studio / other local
server". Första försöket gav "No local models found" tills jag insåg
att testservern saknade CORS-headers — exakt samma krav som Ollama har
(`OLLAMA_ORIGINS`). Med `Access-Control-Allow-Origin` tillagt
fungerade hela kedjan: modellen listades, och en riktig Draft-körning
skrev det strömmade svaret ("Hello from Strata.") till kapitlet.

Slutsats till Mats: StoryBook AI stöder redan Strata och liknande
lokala OpenAI-kompatibla servrar genom det befintliga "LM Studio /
other local server"-alternativet — ingen kodändring behövs, bara
dokumentation. Försökte först länka till Stratas GitHub-repo men sökte
upp att namnet pekar mot flera olika, oklart vilket som är det
kanoniska (`architectds/Strata` vs `kim-haneol/Strata` nämnda, ingen
bekräftad som primär källa) — tog bort länken istället för att gissa,
nämner bara namnet i text.

`docs/models.md` fick Strata tillagt i exempel-listan av OpenAI-
kompatibla servrar plus dess standardport (`127.0.0.1:8080`), och ett
nytt stycke om CORS/allowed-origins-kravet som gäller generellt för
alla sådana lokala servrar, inte bara Ollama. Inget app-kod ändrat.

**Ändringslogg v1.0.67 → v1.0.68 (2026-10-08):** Testarens uppföljnings-
fråga ("the desktop and the browser both have the same origin, right?
... the menus are inactive") gav bort rotorsaken: det gör de INTE.
Webbläsarappen körs på `http://localhost:5175`, men Tauris produktions-
bygge laddar från sin egen interna asset-protokoll-adress
(`http://<scheme>.localhost/` på Windows, enligt en Tauri-säkerhets-
rådgivning jag läste upp, inte gissade) — helt skild från `devUrl`,
som bara används av `tauri dev`. Stratas (och de flesta lokala
servrars) CORS-vitlistning var konfigurerad för webbläsar-origin,
aldrig för skrivbordsappens egen; därav "ingen anslutning". Mats,
efter att jag lagt fram alternativen: "Let's look into it through
Rust instead."

**Lösningen:** en native Rust-HTTP-klient omfattas aldrig av CORS
överhuvudtaget — det är ett rent webbläsar/webview-koncept. Lade till
Tauris egen, underhållna `tauri-plugin-http`/`@tauri-apps/plugin-http`
(inte en hemsnickrad Rust-proxy via Tauri Channels, som hade krävt att
manuellt återuppfinna streaming-SSE/Response-polyfill/AbortSignal-
semantik som pluginet redan löser) — en nästan drop-in `fetch()`-
ersättning där Rust-sidan faktiskt utför anropet. Ny
`src/llm/tauriFetch.ts`: `localServerFetch()` väljer pluginets `fetch`
i skrivbordsappen (`isTauri()` från `@tauri-apps/api/core`), annars
webbläsarens egen — webbappen saknar en Rust-backend att gå via, så
där gäller fortfarande serverns CORS-konfiguration precis som förut.

Minimalt invasivt tack vare ett redan existerande mönster:
`OllamaModelProvider`, `OpenAICompatibleLocalProvider`, `OllamaProvider`
och de fristående Ollama-funktionerna tar alla redan en valfri
`fetchImpl`-override, med exakt tre call-sites som satte defaulten
till `globalThis.fetch.bind(globalThis)` — bytte bara ut DEN defaulten
mot `localServerFetch()`, noll ändringar i själva request/response/
streaming/parsnings-logiken. `src-tauri/capabilities/default.json`
fick ett nytt scoped `http:default`-tillstånd (`{"url": "http://*"}` —
jokertecken matchar vilken host som helst under http, bekräftat i
pluginets egna Rust-enhetstester, men inget IP-intervall/CIDR-stöd).
`assertLocalOnlyBaseUrl`:s molnvärd-blocklista (TypeScript-nivå)
påverkas inte och gäller precis som förut, oavsett vilken `fetchImpl`
som används — ett oberoende skyddslager.

**Verifierat live, inte bara i teorin.** `cargo check`, `tsc --noEmit`,
hela testsviten (891 tester, 2 nya för `localServerFetch`) och
`npm run build` gröna. Byggde dessutom en fejkad Strata-server (Node,
SSE-streaming) och körde det faktiska skrivbordsbygget headless under
Xvfb (`cargo run`, 575 crates, ~1m30s kompilering) — appen startade
rent (`Finished dev profile`, `Running target/debug/storybook-ai-
desktop`, bara en ofarlig EGL/DRI3-varning som är förväntad utan GPU i
en headless sandlåda). En viktig gräns att vara ärlig om: det är
WebKitGTK på Linux, inte den riktiga Windows WebView2-binären
testaren faktiskt kör — den fulla webview→Rust→nätverk-kedjan är bara
bevisad i det här headless-läget, inte på Windows i produktion.

`docs/models.md` uppdateras INTE i den här ändringen — dess nuvarande
CORS/origin-råd gäller fortfarande fullt ut för webbappen, men är nu
bara delvis sant för skrivbordsappen (som inte längre behöver det
alls). Kvar att göra, inte bortglömt.

v1.0.67 → v1.0.68.

**Ändringslogg v1.0.68 → v1.0.69 (2026-10-09):** Testaren som provade
Strata på riktigt (via Mats) fick ett NYTT, mer specifikt fel efter
1.0.68: `url not allowed on the configured scope:
http://127.0.0.1:8080/v1/models` — framsteg (begäran går nu faktiskt
via Rust, det förra problemet är borta), men blockerad av Tauris egen
HTTP-scope, inte av CORS.

**Rotorsaken, denna gång verifierad direkt mot källkoden och
EMPIRISKT, inte bara läst och antagen.** `src-tauri/capabilities/
default.json` gav `tauri-plugin-http` tillståndet `"http://*"`, och
mitt eget påstående i förra loggposten att det här mönstret "matchar
vilken host som helst under http" byggde på pluginets egna Rust-
enhetstester (`scope.rs`) — men det testet (`domain_wildcard`) råkade
aldrig testa en URL med en icke-standard-port, så slutsatsen var en
övergeneralisering. Läste pluginets `build.rs`, som dokumenterar
mönstren rakt upp och ner: `"https://*"` tillåter bara port 443 (HTTPS
standardport) — INTE valfri port. Samma gäller `"http://*"` mot port
80. Eftersom varken Ollama (11434), LM Studio (1234) eller Strata
(8080) kör på port 80, blockerade scopet varje riktig lokal server —
mitt fix i 1.0.68 fungerade aldrig i praktiken för en enda verklig
installation, bara av misstag mot min egen testserver om den råkat
använda port 80 (den gjorde inte det heller, men den delen av
verifieringen — faktiskt låta webview-fönstret hämta modellistan, inte
bara se appen starta — blev aldrig klar innan jag skeppade).

Byggde ett litet fristående Rust-testprogram (`scope-check/`, samma
`urlpattern`-crate och samma parsningslogik som pluginet använder) och
körde det mot exakt testarens felande URL:
`http://*` → **matchar INTE** `http://127.0.0.1:8080/v1/models`
(bekräftar buggen med kod, inte gissning). `http://*:*` → matchar.
Ändrade `capabilities/default.json` till `"http://*:*"` — pluginets
egen dokumenterade syntax för "alla portar".

**Lärdom att skriva ner rakt ut:** "jag läste källkoden och ett test
som liknar fallet" räcker inte som verifiering när testet inte
faktiskt täcker det specifika fallet (port). Den riktiga
verifieringen den här gången var att reproducera exakt samma
matchning mot exakt samma felande URL, inte bara läsa om en
närliggande testfunktion och anta att den generaliserar.

`cargo check`, `tsc --noEmit`, hela testsviten (891 tester, oförändrat
— det här är en ren Rust-konfigurationsändring, ingen TypeScript-
logik rörd) och `npm run build` gröna.

v1.0.68 → v1.0.69.

**Ändringslogg v1.0.69 → v1.0.70 (2026-10-09):** Samma testare (via Mats)
rapporterade tre saker efter 1.0.69: anslutningen fungerar och Draft
går igenom, men Analyze misslyckas med `error sending request for
url` (ett transportfel, inte CORS/scope — misstänkt Strata-specifikt,
oklart ännu), "Write a beat" verkar inte generera något, och — ett
konkret förslag — stöd för att spara flera anslutningar så man
slipper skriva om adressen varje gång man byter mellan Ollama/LM
Studio/Strata. Draftade ett svar till testaren (tack + frågor om
LM Studio-jämförelsen och Stratas egen serverlogg, för att skilja
"Stratas fel" från "vårt fel"), och Mats frågade "Ska vi fixa
Connection preset?" — ja, och byggde den.

**Designprocess, itererad live i en Design-canvas-artifact innan en
rad kod skrevs.** Första utkastet: en dropdown ovanför Engine/Server
address, öppen lista med sparade servrar. Mats skickade en skärmdump
av sin egen redigering i canvasen (en "UPDATE"-knapp och två tomma
fält inuti det valda alternativet) och förtydligade: varje sparad
modell ska vara sin egen expanderbara "platta" som visar just DEN
modellens inställningar när den fälls ut — inte en enda delad
redigeringsyta. Byggde om mockupen till en lista av individuellt
expanderbara plattor, Mats godkände ("Japp nu är vi hemma") med två
sista justeringar (ta bort "Tap a tile..."-texten och NEW-märket).

**Riktig implementation.** Ny `src/llm/connectionPresets.ts` (inte
`core/` — modulen behöver `LlmEngine` från `./provider`, och ingen
annan fil i `core/` importerar från `llm/` eller tvärtom; höll samma
lagerindelning): `ConnectionPreset {id, name, engine, baseUrl}`,
`loadConnectionPresets`/`saveConnectionPresets` med samma
injicerbara-`Storage`-mönster som `contextWindow.ts` redan använder
(`store: Pick<Storage,...> = localStorage` — testbart utan jsdom,
projektets `vitest.config.ts` kör `environment:"node"`),
`matchesPreset` (en preset är "aktiv" när dess engine+adress matchar
det som faktiskt är live — Ollama jämförs bara på engine, ingen
adress att jämföra), `newConnectionPreset` med auto-namngivning
("New connection", "New connection 2", …). 9 nya enhetstester.

Ny `ConnectionPresetList`-komponent i `SettingsPanel.tsx`, ersätter
de tidigare fristående Engine/Server address-fälten helt. En lista av
plattor; den som matchar live-inställningarna är märkt "Active" och
startar utfälld. Klick på en ihopfälld platta fäller ut den OCH
applicerar dess sparade engine+adress direkt (samma handlingar som
redan fanns, `onEngine`/`onBaseUrl` — inget nytt draft-tillstånd
behövdes). Matchar inget sparat preset de faktiska live-
inställningarna (första körningen, eller en redigering som inte
sparats än) visas en "Current connection"-platta istället, alltid
synlig och redigerbar, så fälten aldrig kan bli onåbara bara för att
inga presets finns än. "Update" sparar de nuvarande live-värdena till
den utfällda plattans post; "+ New model" sparar dem som ett helt
nytt, namngivet preset.

**Två riktiga buggar hittade genom att faktiskt driva funktionen live
i webbläsaren (Playwright), inte bara genom `tsc`/`vitest`.** (1)
Namnbytet av ett nyskapat preset använde en inline ref-callback
(`ref={(el) => { if (...) { el.focus(); el.select(); } }}`) för att
fokusera fältet — klassisk React-fälla: en inline-funktion som
ref-prop är en NY funktionsreferens vid varje render, så React
anropar den på nytt vid varje omrendering, vilket betydde att
`el.select()` kördes efter VARJE tangenttryckning och markerade om
hela fältet — skrev man "Strata test rig" blev resultatet bara sista
tecknet, resten skrevs över av nästa markering. Fixat genom att byta
till `autoFocus` + `onFocus={(e) => e.target.select()}`, som bara
triggas vid faktisk fokusering, inte vid varje render. (2) Samma
textfält låg inuti en `<button>` (hela plattans huvud var en knapp,
med namnet som ett `<input>` inuti) — ogiltig HTML, och mellanslags-
tangenten under skrivning triggade knappens inbyggda "aktivera vid
mellanslag"-beteende istället för att skriva ett mellanslag, vilket
klippte av namnet vid första ordet. Löst genom att separera: en
ihopfälld platta är en riktig `<button>` (inget fält inuti, säkert),
en utfälld platta är en `<div>` med namnfältet som syskon till en
separat liten ihopfäll-knapp — aldrig ett fält inuti en knapp.

**Verifierat live, end-to-end, inte bara i teorin.** Körde appen i
en riktig webbläsare: skapade ett nytt preset, bytte namn (nu med
hela namnet bevarat), bekräftade "Active"-märket och att "Current
connection"-plattan försvann, skapade ett andra preset för Ollama,
bytte ENGINE till openai-compatible via att klicka på Strata-plattan
och bekräftade att både engine OCH adress återställdes exakt rätt,
tog bort Ollama-presetet med bekräftelsedialogen och bekräftade att
"Current connection" dök upp igen (inget sparat preset matchade
längre den levande anslutningen). `tsc --noEmit`, hela testsviten
(898 tester, 9 nya) och `npm run build` gröna.

v1.0.69 → v1.0.70.

**Ändringslogg v1.0.70 → v1.0.71 (2026-10-09):** Mats skickade en bild
av en bokskannad sida med en klassisk stor begynnelsebokstav och
frågade om StoryBook kunde göra samma sak — "heter det anfang?" (ja).
Diskuterade var den skulle höra hemma: först föreslog jag ett
Publish-tidsval (samma mönster som den befintliga paragraphStyle-
växeln, "spaced"/"indented"), men Mats påpekade det uppenbara jag
missat — om man inte ser anfangen förrän man exporterar kan man ju
inte skriva MED den i sikte. Det ändrade designen: en riktig Setting
på manuset (`Book.drop_cap_lines`, 0–5, 0 = av) som styr både en
live-förhandsvisning i skrivytan OCH export, istället för två
separata val att hålla synkade.

**Implementation.** `BookSchema.ts`: nytt fält `drop_cap_lines:
z.number().int().min(0).max(5).default(0)` — samma
`.default()`-mönster som alla andra inställningar för bakåtkompatibla
sparfiler, ingen separat migrering behövs. Settings fick en ny
dropdown ("Av" / "2–5 rader") i General, bredvid POV/Tense/Viewpoint.

**Live förhandsvisning:** `ProseCanvas` fick en ny valfri
`dropCapLines`-prop (bara satt av Editor för kapitelprosa, aldrig för
Synopsis/Brainstorm), som lägger till en `--drop-cap-lines`-CSS-
variabel och klassen `has-drop-cap` på skrivytan. Ren CSS gör resten:
`.prose.has-drop-cap > p:first-child::first-letter` — webbläsarens
egen `::first-letter`-pseudoelement, ingen JavaScript-radbrytnings-
logik. Storleksformeln (`N * 1.8em`) är en kalibrerad approximation
mot `.prose`:s egna `1.2rem`/`1.65`-radhöjd, inte exakt typografisk
kerning, men tillräckligt nära för att författaren ska se ungefär vad
de får.

**Export, tre format på riktigt, två medvetet uteslutna.** HTML och
ePub (samma `htmlParagraphs()`-funktion, ePub är bara HTML-sidor i en
zip) får samma `::first-letter`-CSS-trick som editorn, med en ny
`drop-cap`-klass bara på kapitlets FÖRSTA riktiga stycke (inte på
tomradsfiller-styckena). ODT fick den finaste lösningen: ODF-
standarden har ett eget, riktigt `<style:drop-cap style:lines="N"
style:length="1"/>`-element inom en styckestils `paragraph-
properties` — LibreOffice stödjer det direkt, så ODT:n får en äkta
anfang utan CSS-trick alls. RTF och PDF lämnades medvetet orörda,
med en förklarande kommentar i koden varför: RTF har inget enkelt
anfang-kontrollord (Words egen export gör det via en absolut-
positionerad ram, skört och inkonsekvent stöd mellan RTF-läsare);
PDF-skrivaren (`manuscriptExport.ts`s `PdfWriter`) lägger text rad
för rad för hand (pdf-lib, ingen webbläsarmotor bakom) och skulle
kräva att räkna ut en smalare radbredd för just de rader som ligger
bredvid den stora bokstaven — en riktig uppföljning, inte gjord nu.

`ManuscriptExport`-typen fick ett nytt obligatoriskt fält
`dropCapLines: number`, populerat från `book.drop_cap_lines` i
`buildManuscriptExport` — `tsc` hittade direkt att inget annat ställe
i kodbasen byggde en `ManuscriptExport`-literal för hand, så ingen
annan kod behövde röras.

**Verifierat live, inte bara i teorin.** Skapade ett nytt manus,
skrev en öppningsmening ("We will leave Danglars struggling..."),
slog på Anfang (3 rader) i Settings, och tog en skärmdump — en
proportionerlig stor "W" som texten flyter runt, visuellt mycket likt
bilden Mats skickade. Bekräftade även i webbläsaren att det beräknade
`font-size` på `::first-letter` var exakt `3 × 1.8em × 1.2rem =
103.68px`, inte bara "ser ut att stämma". 7 nya tester för export-
sidan (av/på, HTML spaced/indented, ePub, ODT spaced/indented,
bekräftelse att RTF/PDF förblir orörda). `tsc --noEmit`, hela
testsviten (905 tester, 7 nya) och `npm run build` gröna.

v1.0.70 → v1.0.71.

**Ändringslogg v1.0.71 → v1.0.72 (2026-10-09):** Mats testade anfangen
på riktigt och skickade en skärmdump: ett stort "O" med platt
avklippt topp och ett konstigt tomrum under — "trycks uppåt?".

**Rotorsak, reproducerad live innan jag gissade på en fix.** Startade
dev-servern, skrev en öppningsmening med riktiga Newsreader-typsnittet
och slog på Anfang (3 rader) — samma platta topp, bekräftat. Läste av
de faktiska beräknade CSS-värdena i webbläsaren:
`font-size: 103.68px` men `line-height: 85.0176px` — radboxen var
alltså KORTARE än själva bokstaven (85px mot bokstavens ~104px).
`line-height: 0.82` hade varit tänkt att visuellt krympa boxen mot
antal rader, men gör istället att webbläsaren klipper bokstavens topp
istället för att skala ner den, med utrymmet den "borde" ta upp kvar
som tomrum under — exakt det Mats såg.

**Fixen:** `line-height: 1` istället för `0.82`, både i editorns
`.prose.has-drop-cap`-regel (styles.css) och i exportens `dropCapCss()`
(manuscriptExport.ts, HTML/ePub). ODT berörs inte — den använder ODF:s
egna `style:drop-cap`-element, inget CSS-trick, så den hade aldrig
buggen. Testade om samma Playwright-scenario efter fixen: full rund
topp på "O", ingen klippning, inget överdrivet tomrum. Kommentarerna i
båda filerna uppdaterade för att förklara VARFÖR `line-height` måste
vara ≥ 1 — annars är det lätt att någon (inklusive jag själv) återgår
till en "snyggare" liten decimal nästa gång utan att komma ihåg varför
det klipper.

`tsc --noEmit`, hela testsviten (905 tester, oförändrat — inga
assertions bröts, de kollar bara på `font-size`-prefixet i CSS-
strängen) och `npm run build` gröna.

v1.0.71 → v1.0.72.

**Ändringslogg v1.0.72 → v1.0.73 (2026-10-09):** Mats, direkt efter
klippnings-fixen: Anfang känns "insprängd" bland POV/Tense/Viewpoint,
och föreslog en egen "Typografi"-sektion i Settings — med en betydligt
större vision bifogad: Brödtext (Font/Vikt/Punktstorlek/Färg), Rubrik
(samma fyra), och Anfang ON/OFF + Font/Vikt/Färg när på.

**Stannade upp innan jag byggde, eftersom detta är mycket större än
Anfang var.** Två öppna designfrågor som bara Mats kunde svara på:
(1) ska Brödtext/Rubrik-typografin även styra LIVE i skrivytan (samma
princip som Anfang: se vad man får medan man skriver) eller bara
Publish-export (som dagens enda typsnittsval, `PUBLISH_FONTS` i
`publishFonts.ts`, redan gör)? (2) hur stort ska första leveransen
vara? Mats svar: live i editorn OCKSÅ — men med en egen twist jag
inte föreslagit: TVÅ färger, en för mörkt och en för ljust manus-läge,
och frågade rent ut om det underlättar eller krånglar till det för
mig. Ärligt svar: underlättar — appens eget tema har redan exakt det
mönstret (`[data-theme="light"]`-overrides av samma CSS-variabler),
så två färger är den tekniskt KORREKTA lösningen, inte en genväg. En
enda färg hade garanterat sett fel ut i det ena läget och krävt
särbehandling ändå. Och: dela upp i två steg — sektionen + flytta
Anfang nu, Font/Vikt/Storlek/Färg-kontrollerna som uppföljning.

**Steg 1, genomfört.** Ny `<section>` "Typography" i `SettingsPanel.tsx`,
mellan General och Illustrations. Anfang-fältet flyttat dit från
`.craft-fields`-raden (som nu bara har POV/Tense/Viewpoint kvar, som
tänkt från början). Ren UI-flytt, ingen ny data, inget nytt schema-
fält — `drop_cap_lines` och all logik runt det orört. Ny i18n-nyckel
`typographyHeading` i alla tre språk.

**Verifierat live.** Skärmdump av Settings bekräftar: General →
Typography (Drop cap, tydligt egen rubrik) → Illustrations, exakt
layouten Mats bad om. `tsc --noEmit`, hela testsviten (905 tester,
oförändrat — en ren UI-flytt rör ingen testad logik) och
`npm run build` gröna.

Steg 2 (Font/Vikt/Punktstorlek/Färg för Brödtext och Rubrik, Font/
Vikt/Färg för Anfang, tvåfärgsschemat för mörkt/ljust) är INTE gjort
än — nästa uppföljning.

v1.0.72 → v1.0.73.

---

**Ändringslogg v1.0.73 → v1.0.74 (2026-10-09):** Steg 2 av Typografi-
visionen. Mats kom tillbaka med hela listan: samma typsnitt vid
Publish som man valt när man skriver, och en bädd på 13 typsnitt —
Alegreya, Fraunces, Source Serif Pro, Literata, Lora, Libron (finns
inte på Google Fonts, fri licens, låg på GIT — "jag har en ZIP om det
hjälper"), Spectral, PT Serif (serifer); PT Sans, Chivo, Asap, Open
Sans, Rubik (sans serif/groteskerna). Ställde tre uppföljningsfrågor
(Libron-filen, Regular/Bold-räcker-granularitet, byggordning) via
samma AskUserQuestion-mönster som förra steget — den här gången
avfärdade Mats alla tre utan att svara, och skickade istället
`Libron.zip` rakt in i tråden som sitt faktiska svar på fontfrågan.
Tolkade det som: sluta fråga, kör. Verifierade filerna ändå innan
något antogs — `fontTools` (Python, `name`-tabellen) bekräftar
familjen "Libron", v0.31, OFL 1.1, designer Nico Verbruggen, Reserved
Font Name (hindrar inte oförändrad paketering). Extraherade till
scratchpad men VÄVDE INTE IN dem än — det hör till fontbiblioteks-
utbyggnaden, ett eget uppföljningssteg.

**Smalnade själv av det här inkrementet** till bara Brödtext-Font,
med det befintliga 5-fonts-katalog (`PUBLISH_FONTS` i
`publishFonts.ts`: System/Lora/Literata/Source Serif 4/Asap) — inte
nämnt för Mats som en fråga, utan sagt rakt ut som min egen plan
("Sätter igång med Brödtext nu") och sedan körd. Vikt/Punktstorlek/
Färg, Rubrik-typografi, Anfangs egna Font/Vikt/Färg, och fontbiblio-
teks-utbyggnaden (9 nya fonts + Libron) är uttryckligen EJ med i detta
steg.

**Byggt:** nytt schemafält `body_font` i `BookSchema.ts`
(`z.enum(PUBLISH_FONT_IDS).default("literata")`, plus literal i
`createBook()`) — default "literata" eftersom redigerarens gamla
hårdkodade font (Newsreader) inte finns bland Publish's exporterbara
val. `styles.css` fick 8 nya `@font-face`-regler (Lora/Literata/
Source Serif 4/Asap × 400/700) som återanvänder EXAKT samma TTF-filer
som redan buntas för export-inbäddning — ingen ny fontdata, bara
samma filer nu även laddade live i webbläsaren. `ProseCanvas.tsx`
fick en ny valfri `bodyFontStack`-prop som sätter `fontFamily` inline
på `.prose`-diven (bara för kapitelprosan, inte Synopsis/Brainstorm).
`Editor.tsx`: tog bort det gamla, flyktiga `publishFontId`-useState:t
i Publish-dialogen helt, kopplade kapitel-`ProseCanvas` till
`book.body_font` via `publishFontById(...).stack`, och `saveExport()`
läser nu `book.body_font` istället för det borttagna lokala valet.
Publish-dialogens interaktiva `<select>` ersatt med en skrivskyddad
rad: "Literata — ställs in i Settings → Typography" (ny i18n-nyckel
`fontSetInSettings` i alla tre språk). Ny `<select>` i Settings →
Typography, före Drop cap, byggd på exakt samma mönster
(`PUBLISH_FONTS.map(...)`, `HelpTip` med ny `bodyFontLede`-text).

**Verifierat live, inte bara tsc/vitest.** Startade dev-servern,
skapade en bok: redigerarens `.prose` hade `font-family: Literata,
Georgia, serif` innan något ändrats (rätt default). Öppnade Settings,
bytte Font till Asap, stängde — `.prose` blev omedelbart `Asap, Arial,
sans-serif`, och `document.fonts` bekräftade att Asap verkligen laddat
(status "loaded", inte bara begärd). Öppnade Publish-dialogen: Font-
fältet visar nu "Literata — set in Settings → Typography" som ren
text, ingen `<select>` kvar. `tsc --noEmit` rent, alla 905 tester
gröna (oförändrat antal — ingen ny testad logik, bara prop-/schema-
plumbing), `npm run build` grön (de 4 export-TTF:erna syns fortfarande
i `dist/assets` som förut, nu dessutom refererade från `index.css`).

v1.0.73 → v1.0.74.

---

**Ändringslogg v1.0.74 → v1.0.75 (2026-10-09):** Fontbiblioteks-
utbyggnaden — nästa del av Typografi-steg 2. Frågade Mats om ordning
(fontbibliotek vs. Rubrik/Anfang-kontroller) och rekommenderade
fonterna först, eftersom Rubrik och Anfang ändå kommer vilja välja ur
samma utökade katalog — bygga dem mot dagens 5 fonter nu hade
betytt att göra om fontväljarna en gång till. Mats höll med, och
lade på två konkreta krav: gruppera listan på Serif/Sans serif, och
visa hur varje typsnitt faktiskt ser ut i listan man väljer ur.

**Hämtning.** `fonts.google.com` (själva webbsidan) är blockerad i
den här miljöns nätverkspolicy, men `fonts.googleapis.com`s CSS2-API
och dess `fonts.gstatic.com`-filserver är det INTE — testade innan
jag antog något. CSS2-API:et gav exakta `.ttf`-URL:er per familj och
vikt (`?family=Alegreya:wght@400;700`), så Alegreya, Fraunces,
Spectral, PT Serif, PT Sans, Chivo, Open Sans och Rubik hämtades
därifrån, Regular + Bold var. "Source Serif Pro" i Mats lista är
samma typsnitt som redan bundlade "Source Serif 4" (Adobe/Google döpte
om det) — ingen ny hämtning, bara samma katalogpost som förut.
Licenstexter (`OFL.txt`) hämtade separat från `google/fonts`-repots
`raw.githubusercontent.com`-speglar (fungerar, även om GitHubs eget
API är låst till det här projektets repo-scope).

**Verifierat, inte antaget.** Alla åtta nedladdade filer kontrollerade
med `fontTools` mot sin egen `name`-tabell (samma metod som för
Libron förra steget): rätt familj, rätt vikt (Regular/Bold skilde sig
faktiskt åt, inte samma fil två gånger), och licensfältet (14) pekar
på `scripts.sil.org/OFL` för samtliga — OFL 1.1, inklusive Open Sans
som Google numera licensierar under OFL (inte längre Apache 2.0, vilket
var värt att kolla snarare än att gissa från minnet). Libron-zippen
saknade en egen `OFL.txt` — byggde en ihop av fontens egen
copyright-kedja ur dess `name`-tabell (Newsreader → Readerly → Libron,
Nico Verbruggens Reserved-Font-Name-notis, allt redan verifierat förra
steget) plus den kanoniska OFL 1.1-brödtexten, hämtad från Newsreader-
fontens egen `OFL.txt` i samma GitHub-spegel eftersom Libron ärver just
den.

**Bundling.** Nio nya mappar under `src/assets/fonts/` (alegreya,
fraunces, spectral, pt-serif, pt-sans, chivo, open-sans, rubik,
libron), var och en med Regular+Bold-TTF och sin `OFL.txt`, i samma
struktur som de fyra existerande. `publishFonts.ts`: `PUBLISH_FONT_IDS`
växte från 5 till 14 (13 riktiga typsnitt + `system`), i Mats
ursprungliga ordning inom varje kategori; `PUBLISH_FONT_FILES`-kartan
fick motsvarande nya poster. Export-koden (`manuscriptExport.ts`)
rörde jag inte alls — den är redan helt generisk över `PublishFont`
(namn/stack/embed-bytes som data, inget hårdkodat per font-id), så
PDF/RTF/ODT/HTML/ePub fick de nya typsnitten gratis. `styles.css` fick
18 nya `@font-face`-regler (9 familjer × 2 vikter), samma mönster och
samma TTF-filer som export redan bundlar.

**UI: gruppering + förhandsvisning.** Bytte `SettingsPanel.tsx`s
Font-`<select>` till två `<optgroup>` (Serif/Sans serif, filtrerat på
`font.category`) med `style={{fontFamily: font.stack}}` på varje
`<option>`. Osäker på om webbläsare faktiskt renderar fontinställd
`<option>`-text i den öppna rullgardinen — verifierade live istället
för att anta: skärmdump av den faktiskt öppnade listan i Chromium (= samma
motor som Tauri-appens WebView2 på Windows) visar tydligt olika
bokstavsformer per rad — Fraunces, Libron och Spectral syns omedelbart
som egna typsnitt, inte bara olika text. Ny i18n-nyckel
`fontCategorySerif`/`fontCategorySans` i alla tre språk.

**Verifierat live i övrigt.** Bytte till Fraunces i Settings, stängde
dialogen: kapitlets `.prose` blev omedelbart `Fraunces, Georgia,
serif`. `document.fonts` bekräftar att alla 13 familjer (26
vikt-instanser) laddar och status blir "loaded" när de faktiskt
används. `tsc --noEmit` rent, 905 tester gröna (oförändrat — ren
data-/katalogutökning, ingen ny testad logik), `npm run build` grön
med alla 26 TTF-filer synliga i `dist/assets`.

**Kvar, uttryckligen inte med i detta steg:** Vikt/Punktstorlek/Färg-
kontroller, Rubrik-typografi, och Anfangs egna Font/Vikt/Färg — nu med
hela 13-fonts-katalogen att välja ur istället för 5, som var hela
poängen med att göra detta steg först.

v1.0.74 → v1.0.75.

---

**Ändringslogg v1.0.75 → v1.0.76 (2026-10-09):** Mats frågade rakt av
"Ska vi då rulla vidare med typografin?" efter att ha sparat
scenbrytar-idén — ja, och nästa i Mats egen ursprungliga ordning
(Brödtext: Font/Vikt/Punktstorlek/Färg, Rubrik: samma fyra, Anfang:
Font/Vikt/Färg) är Brödtextens Vikt.

**Begränsning, inte gissning.** Varje bundlat typsnitt har bara två
inbäddade vikter (Regular 400, Bold 700 — se `publishFonts.ts`), så
"Vikt" blev ett binärt Normal/Fet-val, inte en fri skala. En finare
skala (Light/Medium/SemiBold/...) hade krävt fler fontfiler per
familj — 13 typsnitt × fler vikter, en betydligt större hämtnings-
insats. Dokumenterat som medveten avgränsning i schemakommentaren,
inte tyst antagande.

**Arkitektur-utredning innan kod.** Läste igenom `manuscriptExport.ts`s
fem format-funktioner för att förstå hur "bold" redan användes — det
visade sig att `embed.bold` idag ENDAST används för rubriker (kapitel-
titlar, Story Bible-namn), aldrig för brödtexten själv; ingen
inline **fet**-markup i prosan finns. Så en Vikt-inställning för
Brödtext är en helt ny, oberoende axel, inte en konflikt med
rubrikernas befintliga fetstil. Per format:

- **HTML/ePub** — `body{font-weight:700}` i den delade CSS:en.
  Rubriker (`<h1>`-`<h3>`) ärver INTE detta eftersom webbläsarens UA-
  stilmall redan ger dem sin egen explicita `font-weight:bold`, mer
  specifik än den ärvda body-regeln — kontrasten mot rubriker bevaras
  automatiskt, inget särfall behövdes.
- **ODT** — `fo:font-weight="bold"` på "Standard"-stycket. Rubrikerna
  (Title/Heading_20_1/Heading_20_2) ärver `parent-style-name="Standard"`
  men sätter redan sin egen `fo:font-weight="bold"` explicit, så
  samma icke-regression som HTML.
- **RTF** — visade sig enklare än väntat: RTF:s fonttabell refererar
  bara ett typsnittsnamn, bäddar inga faktiska bytes (`\b` är en ren
  control word som läsarens egen fetstils-rendering av samma
  `\f0`-referens, inte ett separat inbäddat typsnitt). Så bara `\b`
  direkt efter `\f0\fs24` i dokumentets öppningsgrupp — rubrikerna är
  redan egna `{...}`-scopade grupper med sin egen `\b`, påverkas inte.
- **PDF** — `PdfWriter`s body-parameter blir `bold`-fonten istället
  för `body`-fonten när Vikt=Fet, rubrikerna fortsätter oförändrat
  använda `bold`. Känd, dokumenterad begränsning: med bara två vikter
  blir rubrik och fet brödtext visuellt identiska i PDF/RTF/ODT (till
  skillnad från HTML/ePub där UA-stilmallen räddar kontrasten) — samma
  typ av avvägning som redan finns i hela 2-vikts-arkitekturen, inget
  nytt den här ändringen introducerar.

**Byggt:** `body_font_weight: z.enum(["regular","bold"]).default
("regular")` i `BookSchema.ts`. Alla fem exportfunktioner
(`formatExportHtml`, `formatExportRtf`, `packOdt`, `packEpub`,
`packPdf`) fick en ny fjärde parameter `bodyWeight`, bakåtkompatibel
tack vare default-värdet — inga andra anrops-platser än `Editor.tsx`
behövde ändras. `ProseCanvas.tsx` fick en `bodyFontWeight`-prop,
samma mönster som `bodyFontStack`. Ny Vikt-`<select>` i Settings →
Typography, direkt efter Font. Ny i18n (`bodyWeightLabel`/
`bodyWeightLede`/`bodyWeightRegular`/`bodyWeightBold`) i alla tre
språk.

**Test.** Nytt `describe("body text weight", ...)`-block i
`manuscript-export.test.ts` (5 nya tester, totalt 910): default
ger ingen `font-weight`-override i HTML/ePub och ingen
`fo:font-weight` i ODT; Fet ger `font-weight:700` i HTML/ePub,
`fo:font-weight="bold"` i ODT, `\b` i RTF-preamblen, och olika PDF-
bytes (båda fortsatt giltiga, laddningsbara PDF:er) jämfört med
Normal. Två äldre tester som asserterade den exakta `body{...}`-CSS-
strängen uppdaterade för det nya `;font-weight:400`-tillägget.

**Verifierat live.** Skapade en bok, kontrollerade `.prose`s
`font-weight` i webbläsaren: 400 som grunddefault, 700 omedelbart
efter att ha valt Fet i Settings och stängt dialogen — både mätt via
`getComputedStyle` och synligt i en skärmdump (placeholder-texten
syns tydligt fetare). `tsc --noEmit` rent, 910 tester gröna,
`npm run build` grön.

**Kvar, uttryckligen inte med i detta steg:** Punktstorlek och Färg
för Brödtext, hela Rubrik-typografin, och Anfangs egna Font/Vikt/
Färg.

v1.0.75 → v1.0.76.

---

**Ändringslogg v1.0.76 → v1.0.77 (2026-10-09):** Mats, med en
skärmdump: "Nu är jag kinkig, men det finns inga genvägar till den
perfekta appen :) Det känns som om anfangen är för långt ner nu? Jag
har testat olika typsnitt med samma resultat." — bokstaven "O" sträckte
sig synligt in i en extra textrad under den avsedda höjden.

**Reproducerat innan något ändrades.** Byggde en bok med exakt Mats
text/struktur (samma sorts mening, drop_cap_lines=3) i Playwright och
fick identiskt resultat: en fjärde rad indragen istället för tre.
"Testat olika typsnitt, samma resultat" var en viktig ledtråd —
pekade mot ett räknefel i CSS:en snarare än ett font-specifikt
glyfproblem, eftersom `line-height:1` gör float-boxens höjd till ren
`font-size`, oberoende av vilket typsnitt som faktiskt är valt.

**Räknat ut, inte gissat.** Med `line-height:1` ska boxens höjd
(font-size) matcha N riktiga textrader (`N × .prose's font-size ×
line-height`) för att floaten ska sluta exakt vid rad N. Den gamla
`1.8em`-per-rad-multipeln var ~9% för stor jämfört med `.prose`s
egna 1.65-kvot — tillräckligt för att boxen skulle svälla in i en
extra rad. Men den "matematiskt exakta" ersättningen (multipel =
line-height-kvoten, 1.65) visade sig INTE vara säker heller: uppmätt
live tippade den över i en extra rad ändå, av en sub-pixel-marginal
— float-wrap-beräkningen i webbläsaren är tydligen inte pixel-exakt
mot teorin. Bisekterade istället live mot riktiga, radbrutna stycken
(Playwright, `Range.getClientRects()` för att räkna exakt hur många
rader som faktiskt indragits) tills jag hittade ett värde med
ordentlig marginal: **1.5**, verifierat korrekt vid alla
drop_cap_lines-värden (2–5), i både live-redigeraren (`.prose`s
1.65-kvot) och HTML/ePub-exportens helt andra bas
(`HTML_EXPORT_CSS_BASE`/`EPUB_CSS_BASE`s 1.6-kvot vid webbläsarens
standard-16px) — två separata bisektioner, båda landade oberoende på
samma tal.

**En andra bidragande orsak hittades under tiden:** `padding-top:
0.05em` på `::first-letter` lade till ytterligare höjd ovanpå boxen
(floatens botten flyttas nedåt av padding-top precis som av ett för
stort font-size) — tillräckligt för att själv tippa gränsen vid
exakt träff. Togs bort helt (kvar: `0.08em` höger-padding som
andningsrum mot följande text).

**Byggt:** `1.5em`-multipel och `padding: 0 0.08em 0 0` (ingen
topp-padding) i både `styles.css` (`.prose.has-drop-cap`) och
`manuscriptExport.ts`s `dropCapCss()`. ODT opåverkad — den använder
ODF:s egna `style:drop-cap`-element, ingen CSS-räkning inblandad.
Tre äldre tester som asserterade de gamla `1.8×N`-font-size-värdena
(`5.40em`/`7.20em`/`3.60em`) uppdaterade till de nya `1.5×N`-värdena
(`4.50em`/`6.00em`/`3.00em`).

**Verifierat live, flera lager.** (1) Mät antal faktiskt indragna
rader via `Range.getClientRects()` i live-redigeraren — exakt 3 vid
drop_cap_lines=3, för alla N 2–5. (2) Samma mätning mot en
fristående HTML-fil med exportens egna CSS-bas. (3) Laddade ner en
RIKTIG export via Publish-dialogen (inte bara simulerad CSS) och mätte
samma sak i den nedladdade filen — också exakt 3 rader, skärmdump
bekräftar en ren, odragen anfang. `tsc --noEmit` rent, alla 910
tester gröna, `npm run build` grön.

v1.0.76 → v1.0.77.

---

**Ändringslogg v1.0.77 → v1.0.78 (2026-10-10):** Mats frågade "Vad är
nästa steg för typografin" — svarade enligt hans egen ursprungliga
ordning (Punktstorlek härnäst för Brödtext). Han följde upp med en
teknisk fråga istället: är det svårt att läsa av vilka vikter ett
typsnitt faktiskt har (många har 300/500/600/800, inte bara 400/700)
och låta användaren välja bland dem?

**Testade mot Google Fonts CSS2-API innan jag svarade** (samma API som
redan används för att hämta fonterna): att SE vilka vikter som finns
är trivialt, men resultatet varierar rejält mellan de 13 typsnitten —
Fraunces/Chivo/Asap har 9 vikter, Lora bara 4, PT Serif/PT Sans bara
de två vi redan har. Den riktiga svårigheten är inte detektering utan
arkitekturen: Vikt-väljaren skulle behöva gå från en fast global lista
till en som ändras per valt Font, och export-sidan skulle behöva
bädda in fler filer per familj. Mats: "Vi avvaktar... en mer avancerad
typografi kan vara ett framtida projekt" — sparat som idé #42 i
`roadmap-ideas.md`, pushat separat, inte en del av det pågående
Typography-arbetet. Sedan: "kör vi med färgerna" — hoppade uttryckligen
över Punktstorlek för nu och gick direkt på Färg.

**Design, byggt på tidigare bekräftat mönster.** Mats hade redan (ett
tidigare steg i den här sessionen) bekräftat att TVÅ färger — en för
appens mörka tema, en för ljust — är den arkitektoniskt korrekta
lösningen, inte en genväg, eftersom appens eget tema redan har exakt
det `[data-theme="light"]`-mönstret. Nya fält `body_color_dark`/
`body_color_light` i `BookSchema.ts` (hex, regexvaliderat), med
defaultvärden satta till EXAKT de färger `.prose` redan rent faktiskt
renderas i idag (`--text: #f3eadc` mörkt / `#2a2218` ljust, lästa
direkt ur `styles.css` snarare än gissade) — så att välja en egen färg
är opt-in, ingenting ändras på ett obeört manus.

**Live-redigeraren:** `ProseCanvas` sätter båda färgerna som CSS
custom properties (`--prose-body-color-dark`/`-light`) på `.prose`;
en ny CSS-regel `[data-theme="light"] .prose { color: var(--prose-
body-color-light, var(--text)) }` väljer rätt en beroende på appens
aktiva tema, och `.prose` själv faller tillbaka på den mörka
variabeln (med `var(--text)` som sista skyddsnät om variabeln någon
gång saknas). Verifierat live: bytte mörkt-läges-färgen, bekräftade
att bara mörkt tema påverkades (`getComputedStyle` före/efter), växlade
sedan till ljust tema och bekräftade att den OPÅVERKADE ljus-färgen
fortfarande gällde där.

**Export — en explicit designavvägning, inte en fråga till Mats:**
publicerade dokument (HTML/ePub/ODT/RTF/PDF) har inget eget temaval,
så de använder alltid `body_color_light` — "mörk text på ljus sida"
är redan den konvention varje exportformats egen standardfärg följde
innan den här inställningen fanns (HTML_EXPORT_CSS_BASE:s
`color:#1a1a1a`, PDF:ens svarta standardtext). Trådat genom alla fem
format: HTML/ePub får `color:` i sin delade `body{...}`-regel (ärvs av
rubriker eftersom `color` är en nedärvd CSS-egenskap utan UA-
motstående regel på h1–h3); ODT får `fo:color` på "Standard"-stycket
(samma nedärvningsresonemang till Title/Heading-stilarna); RTF fick
sin första egna färgtabell (`{\colortbl;\red R\green G\blue B;}`) och
`\cf1` satt dokumentbrett, samma globala-tillämpning-mönster som Vikt
fick förra steget; PDF-skrivarens `PdfWriter` fick en valfri `color`-
parameter applicerad på alla icke-meta textritningar (meta-texten
behåller sin egen gråa `PDF_META_COLOR`, orörd).

**En verklig UI-bugg hittad och fixad under verifieringen, inte
gissad.** Första versionen återanvände `.craft-field`s "etikett
flyter ovanpå fältet"-grid-trick (samma som Font/Vikt redan använder)
— men en `<input type="color">` respekterar inte text-padding som en
`<select>` gör; swatchen fyllde hela boxen och klämdes ihop till en
tunn strimma UNDER etikett-texten istället för att synas separat.
Upptäckt via en live-skärmdump (inte antaget), inte via kodläsning.
Löst genom att helt hoppa av grid-overlap-mönstret för just
färgfälten (`.craft-field:has(> input[type="color"])` byter till
vanlig block-stapling, etikett ovanför, swatch under — samma enkla
mönster som `.voice-field` redan använder för textarean).

**Verifierat live, flera lager.** Live-redigeraren: default-färg
matchar exakt dagens `--text` (`rgb(243,234,220)`), ändring av
mörkt-läges-färgen slår igenom omedelbart och ENDAST i mörkt tema.
Settings-UI:t: skärmdump efter CSS-fixen visar två rena, tydliga
färgrutor (inte den trasiga versionen). Export: laddade ner en RIKTIG
HTML-export med en vald anpassad färg (`#114477`), bekräftade att
`body{...}`-regeln (den sista, vinnande i cascade) innehåller
`color:#114477`, och tog en skärmdump av den faktiskt renderade
exportfilen — rubrik, brödtext och kapitelrubrik i vald färg, medan
den gråa metaraden ("Exported...") orörd. `tsc --noEmit` rent, 915
tester gröna (910 + 5 nya för `describe("body text color", ...)` i
`manuscript-export.test.ts`, samma mönster som Vikt-testerna), `npm
run build` grön.

**Kvar, uttryckligen inte med i detta steg:** Punktstorlek för
Brödtext (hoppades över på Mats uttryckliga begäran, inte glömt),
hela Rubrik-typografin, Anfangs egna Font/Vikt/Färg, och den sparade
men avsiktligt uppskjutna idén om riktiga per-font-vikter (#42).

v1.0.77 → v1.0.78.

---

**Ändringslogg v1.0.78 → v1.0.79 (2026-10-10):** Lång designdiskussion
innan kod, som Mats själv bad om ("vi kan fundera kring det innan
kod"). Startpunkt: ska högerklicksmenyn vid textredigering få fler
val — ett som letar efter "Show don't Tell"-brott, och ett "Create
hook" som föreslår en cliffhanger-avslutning?

**Research innan rekommendation.** Läste `ProseCanvas.tsx`s befintliga
högerklicksmeny (RewriteMenu/CursorMenu) och hittade att "Show don't
tell" redan finns som en `rewriteChips`-instruktion (för markerad text
man redan bestämt sig för att skriva om) — inte en detektor. Jämförde
med de redan existerande mekaniska detektorerna (Rare words, Clichés/
`aiTics.ts`, POV-läcka, Echo/fras-upprepning) som alla är ordliste-
eller regex-baserade, alltid-på/av-togglar i kapitelverktygsfältet.
"Create hook" passar bäst som en syster till den redan existerande
"Beat"-markörmenyn (samma mekanik: markör-position, AI skriver en kort
fortsättning).

**Mats breddade frågan:** inte bara Show-don't-tell och Hooks, utan
ett menyval "Give writing tips" som letar efter olika skrivfallgropar
generellt. Hittade då att **"Analyze"-knappen i kapitelverktygsfältet
redan gör precis det här** (`chapterFeedback.ts`) — `show_vs_tell` är
dess FÖRSTA kategori av sex (plus `dialogue_purpose`, `voice_drift`,
`character_fidelity`, och barnlitteratur-specifika `child_agency`/
`lecture`). Skillnaden mot vad Mats bad om är bara scope: Analyze kör
på hela kapitlet/scenen via en knapp, inte en markering via
högerklick.

**Föreslagna nya fallgrops-kategorier** (filtrerade bort allt som
redan täcks av de mekaniska detektorerna, fokuserade på sånt som
kräver verklig läsförståelse): info-dump, sammanfattad istället för
levd scen, oförtjänt känsloskifte, scen utan vändning, övertydlig
subtext, "As you know, Bob"-dialog, svag kapitelavslutning (den sista
parar naturligt med Create hook — flagga svag avslutning, erbjud hook
som fix).

**Mats frågade om `MAX_ITEMS = 10`-taket.** Svar: ingen teknisk
grund, ren UX-avvägning (prompten säger explicit "prefer the
strongest flags, not one of each") — och taket är DELAT mellan alla
kategorier, inte per kategori, så fler kategorier konkurrerar om
samma lilla utrymme. Flaggade att fler kategorier i samma prompt är
en verklig kvalitetsrisk på svaga lokala modeller (appens hela
poäng), och att det inte går att testa i den här sandlådan (ingen
lokal modell ansluten) — rekommenderade att lägga till 2–3 kategorier
i taget och låta testare avgöra kvaliteten, inte alla sju på en gång.

**Mats verkliga test blev den riktiga vändpunkten.** Körde Analyze på
ett eget kapitel, fick EN flagga (`character_fidelity`: "He pushed
the feelings aside, focusing on the present."). Körde samma kapitel
genom Gemini separat — hittade tre show_vs_tell-brott (inklusive den
app redan hittat, men felkategoriserad), klichéer, och konstaterade
att avslutningen helt saknade en hook. Grävde i koden istället för
att bara acceptera "Gemini är bättre":

1. **`looksLikeTell()`-filtret var boven, delvis.** Ett efterhands-
   filter i `parseChapterFeedback` kräver att citatet innehåller
   specifika ord (felt/seemed/realized/was sad, etc) — testade Mats
   tre Gemini-citat direkt mot regexet i en Node-snutt: alla tre gav
   `false`. Så även om modellen korrekt flaggat alla tre som
   show_vs_tell, hade filtret tyst kastat dem — den enda som
   överlevde gjorde det bara för att modellen (oavsiktligt) la den
   under `character_fidelity` istället, en kategori utan filter.
2. **Mats frågade den viktiga följdfrågan:** läser AI:n och förstår,
   eller söker den ord? Svar: BÅDA, i två steg — modellen läser och
   bedömer fritt (steg 1, äkta förståelse), men appen kör sedan ett
   dumt sök-filter på modellens EGNA svar (steg 2) som kan kasta
   korrekta bedömningar om de inte råkar använda rätt ord. Filtret
   finns som en precisions-skyddsmekanism mot svaga lokala modeller
   som kan hitta på eller felkategorisera — en avvägning mellan att
   missa riktiga fynd och att visa falska. Just nu för strikt åt det
   försiktiga hållet.
3. **"Clichés"-knappen är strukturellt oförmögen** att fånga Mats
   scifi-troper ("stars like diamonds", "metal arms like skeletal
   fingers") — det är en fast lista på 22 generiska AI-fraser
   (`aiTics.ts`), och specifika troper är oändligt många och
   sammanhangsberoende. Ingen ordlista kan någonsin täcka det; det
   kräver modell-bedömning (en framtida Analyze-kategori), inte en
   utökad ordlista.
4. Mats bad att bredda filtret "så får vi se" — inkrementellt, inte
   ta bort det helt på en gång.

**Byggt.** `looksLikeTell()` breddad rejält: fler triggerverb
(sensed, noticed, understood, recognized, remembered, suspected,
wondered if, hoped, feared, wished, longed, ached, yearned, plural
"feelings"), nya fraser ("settling over", "washing over", "a sense/
wave/rush/pang/surge of", "filled [him/her/them] with"), och en
mycket längre lista känslo-adjektiv för was/were-mönstret (comforted,
overwhelmed, relieved, numb, torn, conflicted, m.fl.). Verifierade
mot Mats tre riktiga citat INNAN jag skrev koden, inte efteråt: 2 av
3 fångas nu ("He pushed the feelings aside..." och "A sense of
comfort settled over him"). Det tredje ("the only constant in his
life since Lyra's passing") namnger en relations betydelse utan ett
enda känsloord — konstaterat, dokumenterat i kodkommentaren som en
känd, accepterad gräns för vad ett regex kan generalisera till utan
att börja flagga helt normala meningar. Ny kodkommentar förklarar
filtrets syfte (en trolighetsspärr på modellens EGNA flaggor, inte en
egen detektor) och dess kända gräns, så nästa breddning görs mot
riktiga exempel precis som den här, inte gissade ord.

**Test.** Nytt test i `chapter-feedback.test.ts` (20 totalt, +1) som
kör exakt Mats tre citat genom `parseChapterFeedback` och bekräftar
att två nu går igenom medan det tredje (det kända, dokumenterade
gapet) fortfarande inte gör det — ett test som bevisar både
förbättringen OCH dess gräns, inte bara det som fungerar. `tsc
--noEmit` rent, 916 tester gröna, `npm run build` grön. Ingen live-
Playwright-verifiering den här gången — ren bakgrundslogik utan UI,
och ingen lokal modell ansluten i den här miljön för att köra en
riktig Analyze-anrop; unit-testet mot de faktiska funktionerna med
realistiskt modell-svar som JSON är rätt verifieringsnivå här.

**Kvar, uttryckligen inte med i detta steg:** nya Analyze-kategorier
(Kliché/trop, svag avslutning, m.fl.), Create hook-funktionen, och
en eventuell framtida borttagning av hela `looksLikeTell()`-filtret
om breddningen visar sig otillräcklig i praktiken.

v1.0.78 → v1.0.79.

---

**Ändringslogg v1.0.79 → v1.0.80 (2026-10-10):** Mats, med en
skärmdump av kapitelfoten: "STATS har blivit en liten text bland
andra. Den förtjänar en knapp bredvid Analyse."

**Läste `StatsTrigger`-komponenten innan jag ändrade nåt.** Den
renderade fyra `<button>` i en och samma `.stats-cluster`-`<span>`:
ordräkning+"Stats" (öppnar Stats-panelen), Rare, Clichés, Story Bible
Names — alla fyra styrda med samma tysta `.stats-trigger`-klass (ingen
bakgrund, ingen kant, 0.68rem versaltext). De riktiga knapparna
(Draft, Extract facts, Analyze, osv) sitter i en annan `<div
className="actions">`, som redan har en egen CSS-regel
(`.actions button:not(.primary)`) som ger VILKEN SOM HELST vanlig
`<button>` där den riktiga kantade knapp-looken — ingen ny CSS
behövdes, bara rätt plats i trädet.

**Byggt.** Delade `StatsTrigger` i två: samma komponent behåller
ordräkning (nu ren text, inte en knapp) plus de tre togglarna (Rare/
Clichés/Story Bible Names), oförändrat i övrigt. Ny `StatsButton`-
komponent — en vanlig knapp med `m.stats.label` ("Stats") — flyttad
in i `.actions`-raden på alla tre ställen som använde `StatsTrigger`
(kapitel, Synopsis, Brainstorm via dess `extraActions`-prop). I
kapitelpanelen (den Mats skärmdumpade) sitter den direkt FÖRE Analyze-
knappen — "bredvid Analyse" uppfyllt bokstavligt, inte bara i andan.

**Verifierat live.** Skapade en bok, skrev lite text, skärmdump av
hela sidan bekräftar layouten: "7 words RARE OFF CLICHÉS OFF STORY
BIBLE NAMES OFF" kvar som tyst klusterrad till vänster, "Maximize,
Draft, Extract facts, **Stats**, Analyze, Ask about chapter, History"
som riktiga kantade knappar till höger — Stats fullt synlig bland de
andra istället för begravd i småtext. Klickade på Stats-knappen,
bekräftade att panelen fortfarande öppnas (`.stats-card` syns i DOM:en)
— ingen regression i de tre ställena som delar komponenten. `tsc
--noEmit` rent, 916 tester gröna (oförändrat — ren UI-flytt, ingen ny
testad logik), `npm run build` grön.

v1.0.79 → v1.0.80.

---

**Ändringslogg v1.0.80 → v1.0.81 (2026-10-10):** Direkt uppföljning på
v1.0.79. Mats körde Analyze igen efter uppdateringen, fick exakt
samma enda flagga som förut. Bad honom öppna Tools → "View AI
context…" för att se modellens råa svar och avgöra om bollen låg hos
filtret eller hos modellens egen täckning — men skärmdumpen han
skickade visade bara "SYSTEM INSTRUCTIONS" och "WHAT WAS SENT", ingen
tredje sektion ("Vad modellen svarade") alls, inte ens scrollad förbi.

**Det ledde till den verkliga boven.** Läste `analyzeChapter` i
`BookStore.tsx` och jämförde mot de sju andra AI-operationerna
(Draft, Extract, Recast, m.fl.) — alla andra kallar
`recordPromptResponse(raw)` direkt efter sitt `chat()`-anrop, för att
spara modellens svar till inspektorn. `analyzeChapter` var ensam om
att UTELÄMNA den raden helt: den spelade in vad som skickades
(`recordPrompt`), men aldrig vad som kom tillbaka. Mats skärmdump var
alltså korrekt — det fanns bokstavligen inget att visa, inte ett UI-
missförstånd från hans sida.

**Byggt.** En rad: `recordPromptResponse(raw);` tillagd direkt efter
`chat()`-anropet i `analyzeChapter`, exakt samma plats och mönster
som de sex andra fungerande call-sites. `tsc --noEmit` rent, 916
tester gröna (oförändrat — `BookStore.tsx`s hooks har ingen egen
testsvit, samma gräns som redan gäller för resten av filen; verifierat
genom att jämföra mot 6 redan fungerande, identiska mönster i samma
fil snarare än att gissa), `npm run build` grön. Ingen live-körning
möjlig i den här sandlådan (ingen lokal modell ansluten) — flaggat
ärligt till Mats, som redan har en riktig lokal modell (qwen2.5-
coder:7b, synligt i hans egen skärmdump) för att verifiera på riktigt.

**Bonus-upptäckt från skärmdumpen:** Mats modell är `qwen2.5-
coder:7b` — en KODMODELL, inte en skrivmodell, körd för Review/Analyze.
Värt att nämna till Mats som en möjlig separat förklaring till svag
analys-täckning (utöver filtret och nu den här buggen) — inte agerat
på än, bara noterat.

v1.0.80 → v1.0.81.

---

**Ändringslogg v1.0.81 → v1.0.82 (2026-10-10):** Mats, en idé att
fundera på innan kod: en arbetsgång med Draft följt av en "städar-
omgång" — en egen hård redaktörsprompt han skrev själv (ta bort
expositionsinskott och relationsetiketter, strippa känsloord, byt ut
vaga påståenden mot konkreta detaljer, ta bort klyschor/purple prose,
knip åt dialogen) — som en egen knapp.

**Research innan rekommendation.** Läste `recastChapter` i
`BookStore.tsx` och fann att arkitekturen redan fanns, nästan
komponent för komponent: helkapitel-omskrivning, Story Bible/Voice/
Reader-kontext skickad med, sparad som en egen History-post. Mats två
följdfrågor — måste prompten gå att redigera i Settings, och ska det
bli en modal med original/omskrivning sida vid sida — visade sig
redan lösta: Voice-fältet är exakt samma mönster (fritext sparat på
boken, textarea i Settings), och History-panelen har redan en
komponent (`HistorySplit`/`DiffHunks` i `ChapterHistoryCard.tsx`) med
precis den sida-vid-sida-vyn, synkad scrollning och ord-för-ord-diff
— byggd för att jämföra revisioner, återanvändbar rakt av för att
jämföra Original mot ett Polish-förslag.

**Design bekräftad innan kod:** egen "Polish"-knapp i kapitelfoten
bredvid Draft (inte streamad direkt in i redigeraren som Draft/
Recast, eftersom resultatet måste granskas först); genererar men
skriver ingenting förrän författaren godkänner; en ny `op: "polish"`
i historiken, skild från Recast.

**Byggt:**
- `BookSchema.ts`: `DEFAULT_POLISH_PROMPT` (Mats egen text, nästan
  ordagrant — tillagd en enda rad: "Trim how a locked Story Bible
  fact is delivered, never the fact itself", eftersom en aggressiv
  klippning annars riskerar att radera den enda platsen ett låst
  faktum nämns, samma resonemang som redan styrde Recasts egen
  Story-Bible-kontext). Nytt fält `polish_prompt` (bok-nivå, inte en
  hårdkodad konstant som `RECAST_SYSTEM`, eftersom Mats bad om att
  redigera den per manus). `"polish"` tillagd i `PROSE_HISTORY_OPS`.
- `generateProse.ts`: `polishUserPrompt(book, chapter)` — samma form
  som `recastUserPrompt` (Story Bible, Voice, Reader, språk, aktuell
  prosa), men de redaktionella instruktionerna själva ligger i
  systemmeddelandet (`writingSystem(book.polish_prompt)`) istället
  för en hårdkodad konstant.
- `BookStore.tsx`: ny `polishChapter()` — till skillnad från Recast
  som strömmar rakt in i redigeraren, väntar Polish in hela svaret
  och lägger det i ett `polishDraft`-state (`{chapterId, original,
  candidate}`) istället för att skriva nåt. `acceptPolish()` sparar
  via `persistProseWrite` med `op: "polish"` (formatering/
  platshållare rensas som vid Recast — ett helomskrivet kapitel gör
  gamla positioner ogiltiga — men darlings behålls, samma
  resonemang). `discardPolish()` rensar bara draften. Hittade och
  fixade samma `recordPromptResponse`-mönster direkt (lärdomen från
  v1.0.81 satt färskt) så Polish syns korrekt i View AI context från
  start.
- Nytt `PolishReviewCard.tsx` — återanvänder `HistorySplit` (nu
  exporterad från `ChapterHistoryCard.tsx`) istället för att bygga en
  andra diff-vy.
- `SettingsPanel.tsx`: ny "Polish"-sektion, textarea bunden direkt
  till `book.polish_prompt` via befintlig `onPatch` (enklare än
  Writing-primerns eget localStorage-baserade flöde, eftersom det
  här är ett vanligt bok-fält), med samma "Återställ till
  standard"-knapp-mönster.
- i18n: nya nycklar i alla tre språk (`editor.polish*`,
  `polishReview.*`, `aiContext.operations.polish`,
  `history.ops.polish`, `errors.polishEmpty`).

**Verifierat live, på riktigt — inte bara UI-skelett.** Ingen lokal
modell finns i den här sandlådan, så byggde en minimal Ollama-
kompatibel mock-server (Node `http`, `/api/tags` + `/api/chat`,
CORS-headers) på port 11434 för att faktiskt kunna klicka igenom hela
flödet i en riktig webbläsare: skapade en bok, skrev prosa, öppnade
Settings → Polish (textarea visar default-prompten, Återställ-knappen
korrekt avstängd tills man ändrar), klickade Polish-knappen, fick
upp "Review Polish"-modalen med verklig ord-för-ord-diff (skärmdump
bekräftar både Original- och Polish-suggestion-kolumnerna), klickade
"Keep this version", bekräftade att kapitlets prosa faktiskt byttes
ut, och att History-panelen visar en ny "POLISH"-post med rätt
tidsstämpel och den gamla texten bevarad för återställning. `tsc
--noEmit` rent, 918 tester gröna (916 + 2 nya för `polishUserPrompt`
i `generate-prose.test.ts`), `npm run build` grön.

**Kvar, inte en del av detta steg:** per-scen Polish (ScenesPanel har
egna Draft/Recast/Analyze-knappar per scen — Polish fick bara
kapitelnivån den här gången), och eventuell integration med Darlings
för text Polish faktiskt klipper bort (just nu räddas bara darlings
som redan fanns innan Polish kördes, inte det Polish själv tar bort).

v1.0.81 → v1.0.82.

---

**Ändringslogg v1.0.82 → v1.0.83 (2026-10-10):** Mats skickade en
skärmdump av Polish-granskningen i bruk — ORIGINAL och POLISH
SUGGESTION var klämda in i två smala kolumner med egen scrollbar
vardera, och texten radbröt ord för ord. En rad under skärmdumpen:
"Fönstret kan vara mycket större". Rätt diagnos: `.polish-review-card`
återanvänder samma `HistorySplit`-komponent som History-vyns
jämförelse gör, men saknade historik-kortets breddöverstyrning. Alla
`.edit-card` är `width: min(36rem, 100%)` som grundinställning — en
rimlig bredd för en vanlig formulär-dialog, men `.edit-card.history-
card` höjer den till `min(84rem, 100%)` just för att den har samma
sida-vid-sida-diff. Polish-kortet fick aldrig den matchande regeln när
det byggdes i v1.0.82 — ett rent förbiseende, inte ett nytt
designbeslut. Fixen var en rad: lade till `.edit-card.polish-review-
card` i samma CSS-selector som `.edit-card.history-card`, så båda
delar `width: min(84rem, 100%)`. Verifierade live med Playwright mot
en riktig körning (mock-Ollama-servern från v1.0.82 återanvänd): skapa
bok, skriv text, klicka Polish, mät `.polish-review-card`s faktiska
bredd i DOM — 1344px vid 1400px-viewport (= 84rem, samma som History-
kortet), mot tidigare 36rem (576px). Skärmdump bekräftar båda
kolumnerna nu har gott om plats, ingen ordvis radbrytning.

v1.0.82 → v1.0.83.

---

**Ändringslogg v1.0.83 → v1.0.84 (2026-10-11):** Mats är igång med sitt
första riktiga bokförsök (en full Synopsis + 8 kapiteldispositioner,
ett sci-fi-drama om kapten Kael, ingenjören Emma, en hemlig
reaktorextraktor och ett moraliskt uppoffringsslut) och ställde en rad
praktiska "hur jobbar man"-frågor efter hand som han faktiskt
använder appen: hur Synopsis/Brief/Story Bible-extraktion hänger ihop
(extraktorn läser bara sin egen källa — Synopsis-knappen bara
Synopsis, kapitlets knapp bara den brief:en, aldrig korsvis; hans
förvirring kring "Source: Synopsis"-kort i Review-kön visade sig vara
att kön är global för hela boken, inte scopead till vad man just
extraherade — gamla, aldrig åtgärdade kandidater låg kvar och blandas
in), hur man tar bort en scen (ingen egen "ta bort"-knapp — man slår
ihop den med grannen via "Slå ihop med nästa", texten försvinner
aldrig, bara gränsen), och hur man skapar en scen överhuvudtaget
(upptäckte att "Dela i två…" bara ger en lista att välja styckesstart
ur, ingen fri textmarkering).

Det sista ledde till en riktig invändning: "Vore det inte logiskt att
man väljer det man vill ha som en scen och sedan klickar på (typ)
'Skapa scen från markering'?" — och efter att ha läst igenom hur
markeringsmenyn redan fungerar (Extend/Elaborate/Instruct/Fråga/Lyft
till synopsis/Klipp till älsklingar/Illustrationsprompt — samma
meny, samma `TextSpan`-mekanik i ProseCanvas.tsx redan i produktion)
var svaret: ja, bygg den, den passar rakt in.

**Bygget:** `createSceneFromSpan(chapter, span)` i `bookScene.ts` —
tar en rå teckenoffset-markering (samma `TextSpan` som Extend/
Elaborate redan använder) och snäpper ut den till hela de stycken den
rör vid (en scen kan bara börja vid en styckesgräns, aldrig mitt i en
mening — exporterade `splitFlowParagraphsWithOffsets` ur
proseFlow.ts, som redan fanns för formatteringsintervall, för att
hitta styckenas offset). Återanvänder `splitSceneAtParagraph` två
gånger (en split före markeringen, en efter) snarare än att bygga ny
delningslogik — alla dess no-op-vakter (paragraf 0, bortom slutet,
redan en scengräns) ärvs gratis.

Lade till en detalj utöver det raka fallet: om markeringen korsar en
redan existerande scengräns (t.ex. man markerar över två befintliga
scener), tas den gamla gränsen mitt i bort — markeringen vinner alltid
över vad som delade den innan, annars skulle "skapa EN scen från
markeringen" tyst ljuga och ge två. Skrev ett regressionstest just för
det fallet (fyra-styckes-kapitel, fyra existerande scener, markering
över två mittenstycken — den inre gränsen försvinner, de yttre
behåller sina id:n/titlar orört).

Menyn: ny `onCreateScene`-prop i ProseCanvas.tsx, villkorlig
menyrad "Create scene" (sv: "Skapa scen") precis som
`onCutToDarling`/`onIllustrate` redan är villkorliga. Kopplad i
Editor.tsx direkt via `store.patchBook` — inget nytt i BookStore
behövdes, exakt samma mönster som `onPatch` på ScenesPanel redan
använder för `chapter.scenes`.

Verifierat live: skrev tre stycken i en riktig körning, markerade
mittenstycket via `window.getSelection()`/Range (samma som en
användares musdrag ger), högerklick, "Create scene" i menyn — Scener-
panelen visade genast 3 scener med rätt innehåll vardera. 9 nya
enhetstester i `book-scene.test.ts` (tom markering, ingen prosa än,
markering som börjar vid kapitlets första stycke, markering till
kapitlets slut, hela kapitlet markerat kollapsar tillbaka till en
scen, gränsborttagningsfallet, idempotens vid omkörning på en redan
egen scen). 928 tester gröna, tsc rent.

v1.0.83 → v1.0.84.

---

**Ändringslogg v1.0.84 → v1.0.85 (2026-10-11):** Feedback vidarebefordrad
från en tester, två punkter. (1) Förslag: kollapsningsbara
sammanfattningar i sidopanelen — kollade koden, Kapitel-panelen
kollapsar redan automatiskt alla kapitel utom det öppna (`expandedBriefs`
i Editor.tsx, sedan tidigare), så det är oklart om testaren menar
något annat (Story Bible-panelen? en "fäll ihop alla"-knapp?) — svarade
Mats med vad som redan finns och bad om förtydligande innan jag bygger
fel sak. (2) Möjlig bugg, allvarligare: testaren körde PolyStrata (en
OpenAI-kompatibel lokal servercloner, fler modeller än Ollama) —
anslutningen funkade (`/v1/models` svarade), men Skriv utkast på ett
nytt kapitel gav noll ord, ingen felruta, två identiska försök,
testat med "thinking" både på låg nivå och avstängt. Strandens egen
monitor visade dock ~900 utdata-tokens.

**Root cause, hittad genom att läsa koden, inte gissa:** `draftChapter`
(och Recast/Beat/alla andra strömmande operationer) använder
`provider.streamChat()`, vars strömtolkning bara läser
`choices[0].delta.content` (OpenAI-kompatibel) respektive
`message.content` (Ollama). Den icke-strömmande `chat()`-varianten i
samma filer har redan ett vakt-kast — "X returned an empty reply." —
om svaret är tomt, men motsvarande vakt saknades helt i de strömmande
varianterna: om servern avslutar strömmen (ett `done`/`finish_reason`,
eller bara stänger anslutningen) utan att någonsin ha skickat en enda
`text_delta`, avslutades generatorn tyst — exakt "inget fel, bara noll
utdata". Troligaste förklaringen: en resonerande modell som PolyStrata
serverar strömmar hela sitt svar som `reasoning_content` (eller
motsvarande eget fält) snarare än `content`, oavsett "thinking"-läge på
klientsidan — appen läser bara `content`, så allt försvinner tyst.

**Fixen:** symmetrisk tom-ström-vakt i båda adaptrarna
(`OpenAICompatibleLocalProvider.streamChat` i provider.ts,
`OllamaProvider.streamCompletion` i ollama.ts) — håller koll på om
någon `text_delta` någonsin mottagits; om strömmen avslutas (explicit
`done`, eller bara att anslutningen stängs utan ett done alls) utan att
det hänt, skickas ett `error`-chunk istället för att tyst returnera.
Felmeddelandet namnger möjligheten rakt ut: "...check whether it
streams its answer as reasoning content rather than the final reply —
StoryBook AI only reads the final reply." Draft/Recast/etc:s befintliga
felhantering (samma `ollamaHint`/felbanner som allt annat) fångar detta
precis som vilket annat fel som helst — ingen ny kod behövdes i
BookStore.tsx.

Verifierat på två nivåer: (1) 4 nya enhetstester i provider.test.ts,
inklusive ett som exakt återskapar testarens scenario (en mockad SSE-
ström som bara skickar `reasoning_content`-deltor, aldrig `content`,
sen `[DONE]`) för båda adaptrarna, plus fallet där anslutningen bara
stängs utan ett done-meddelande alls. (2) Ett riktigt end-to-end-test:
byggde en minimal mock-server som efterliknar exakt det testaren
beskrev (`/v1/models` svarar, `/v1/chat/completions` strömmar bara
`reasoning_content`), kopplade StoryBook AI mot den som "LM Studio /
annan lokal server" i Settings, klickade Skriv utkast i en riktig
körning — felbannern dök upp direkt: "local-openai:reasoning-model-
fake finished without sending any reply text. If this is a
reasoning/thinking model, check whether it streams its answer as
reasoning content rather than the final reply...". Kapitlet förblev
orört (0 ord, ingen trasig text skriven) istället för att tyst
"lyckas" med ingenting. 930 tester gröna, tsc rent.

v1.0.84 → v1.0.85.

---

**Ändringslogg v1.0.85 → v1.0.86 (2026-10-11):** Mats skickade en
skärmdump från kapitel 12: Find & replace öppen, sökt på "sta" (86 av
105 träffar), och huvudtexten såg ut som en dubbelexponerad röra —
två överlappande kopior av stycken, läsbara men omöjliga att skilja
åt. Fråga: "Ser man alla historikens texter?"

Svaret är nej — inget med History inblandat, och kapitlets lagrade
prosa var aldrig skadad. Kollade `FindReplaceCard`/`findReplace.ts`
först för säkerhets skull: `FindScope` har bara `"manuscript"` (med
valfri `includeBrainstorm`), `"chapter"` eller andra ytor — ingen kod
väg in i revisionshistoriken alls, så 86/105 var bara whole-manuscript-
sökningens riktiga träffantal (chapter + 11 andra), inget larmande i
sig.

**Root cause**, hittad i CSS: `ProseCanvas` ritar highlight-overlayer
(Rare/AI-tics/Story Bible-namn/Find) som en separat `.prose-rare`-
div, absolut positionerad `inset:0` ovanpå den riktiga
`contenteditable`:n, aria-hidden, med sin egen fullständiga kopia av
texten plus `<mark>`-taggar. För att bara EN kopia ska synas gör en
regel i styles.css den riktiga `.prose`-texten transparent när en
overlay är aktiv: `.prose-wrap.is-rare .prose, .prose-wrap.is-tics
.prose, .prose-wrap.is-facts .prose { color: transparent; ... }`.
`is-find` — klassen `ProseCanvas` sätter på wrappern när Find &
replace är öppen — stod inte med i den listan. Troligen en ren
förbiseende när Find & replace-overlayen byggdes (dess egen `mark`-
färgregel, `.prose-wrap.is-find .prose-rare mark`, finns och funkar
fint) — glömde bara koppla in motsvarande "göm den riktiga texten"-
regeln. Resultatet: så fort Find var öppen stod två fullständiga,
oberoende radbrutna kopior av samma stycken synliga samtidigt —
overlayn (med gula sök-markeringar) ovanpå, den riktiga
redigeringstexten i normalt flöde under/bakom, båda fullt synliga,
exakt det sönderplockade dubbla intrycket i skärmdumpen.

**Fixen:** en rad — lade till `.prose-wrap.is-find .prose` i samma
selector-lista. Verifierat live: skrev två stycken, öppnade Find,
sökte "sta" — mätte `getComputedStyle` på den riktiga `.prose`-
elementets `color` (nu `rgba(0,0,0,0)`, transparent som den ska vara)
och skärmdump bekräftar normal, läsbar text med bara sökträffarna
gulmarkerade, ingen dubblettrendering alls. 930 tester gröna, tsc rent,
build grön.

v1.0.85 → v1.0.86.

---

**Ändringslogg v1.0.86 → v1.0.87 (2026-10-11):** Mats, en iakttagelse:
"När jag klistrar in texter så får jag ofta dubbla radmatningar (är
det markup som strular?) men om jag skapar en linje med > så tas
dessa extra radbrytningar bort." Ingen gissning den här gången —
spårade hela kedjan i koden innan jag sa något.

**Mekaniken:** `onPaste` i ProseCanvas.tsx körde hela det inklistrade
klippbordstexten genom ett enda `document.execCommand("insertText",
false, pasted)`, inklusive inbäddade tomrader. Chrome bestämmer själv
hur `\n`-tecken i en insertText-sträng blir DOM-struktur — det blev
ett nytt block PER RAD, tomrader inräknat, inte ett block per riktigt
stycke. `proseFromElement` (som läser DOM:en tillbaka till
`chapter.prose`) filtrerar bort tomma block när den bygger strängen,
så `value` blev alltid rätt — inget i den lagrade prosan var någonsin
trasigt. Men de extra tomma `<p>`-elementen låg kvar SYNLIGT i den
levande DOM:en som extra tomradsmellanrum, osynliga för
reconcile-effektens "hoppa över omritning om texten redan matchar
value"-genväg (en tom block ändrar ju ingenting den genvägen
kollar) — ända tills en ANNAN redigering tvingade fram en full
omritning från `value` (`area.innerHTML = htmlFromProse(value, ...)`,
som bara någonsin bygger riktiga, icke-tomma stycken). Att skriva "> "
för ett citat är precis en sådan trigger (`blockMarkupNeedsSync`
upptäcker att stycket nu borde ha `prose-quote`-klassen) — därför
försvann mellanrummen just då, exakt vad Mats observerade.

**Fixen:** bygg inklistringen stycke för stycke istället — dela upp
den inklistrade texten med `splitFlowParagraphs` (samma
styckesmodell appen redan använder överallt annars, kollapsar
godtyckligt många tomrader till exakt en styckesgräns) och infoga
varje stycke för sig, med samma `insertParagraph` en riktig
Enter-tryckning redan använder mellan dem. Skapar aldrig de tomma
blocken överhuvudtaget, istället för att städa upp dem i efterhand.

**Verifierat både före och efter**, inte bara efter: `git stash` på
fixen, klistrade in tre stycken separerade med tomrad via en riktig
`ClipboardEvent`/`DataTransfer` i en levande körning, räknade DOM-
blocken direkt — 5 block (3 riktiga + 2 tomma `<p>`), precis Mats
beskrivning. `git stash pop`, samma test igen — exakt 3 rena block,
inga tomma alls. Skärmdump bekräftar normal, enkelradad text utan
mellanrum. 930 tester gröna, tsc rent.

v1.0.86 → v1.0.87.

---

**Ändringslogg v1.0.87 → v1.0.88 (2026-10-13):** Mats bad om en
genomgång av hela roadmap-idéns öppna läge ("Vad ligger på vår todo
och vad anser du är rimligt att påbörja?"). Gick igenom tabellen och
varje punkts egen statusrad (de stämmer inte alltid överens — några
rubriker saknar ✅ trots att tabellen säger byggd, t.ex. #24/#33/#34 —
litade på statusraderna, inte bara rubrikerna). Rekommenderade #39
(varna om öppna platshållare innan Korrekturläsning) som bästa
startpunkt: minst risk, redan fullt scoped ner till filnamn och
funktion, ingen öppen designfråga.

Mats två tillägg innan vi satte igång: (1) stryk #29 (Serier) — täcks
nu av ett eget startat projekt, ComicbookAI, inte längre aktuellt
inom StoryBook AI. Markerad struken i tabellen och i sin egen sektion
(behållen som historik, inte borttagen — i linje med dokumentets egen
regel att bevara idéer). (2) Tog upp #30 (slå ihop Story Bible-kort
för samma person under olika namn) på nytt, oberoende, med ett eget
exempel — "Kapten Kael" / "Kaptenen" / "Kael" som tre separata kort.
Exakt samma funktion som redan fanns designad i detalj sedan ett
tidigare samtal (2026-09-27): markera flera kort → "Slå samman" → ett
justerbart förslag innan det låses. La till en notering om att det
återkom oberoende — tecken på ett återkommande problem, inte ett
engångsfynd.

**Byggde #39.** `ProofreadSetupCard.tsx` fick en ny `chapters`-prop
(samma lösa form `collectPlaceholders` redan tar), räknar öppna
platshållare via `collectPlaceholders` och visar en icke-blockerande
rad ovanför Starta-knappen — texten byter mellan "i det här kapitlet"
och "i manuset" beroende på vilken Omfattning-radio som är vald,
live, utan att behöva en ny prop. Återanvände `count()`-
pluraliseringshjälparen (samma mönster som `PlaceholdersPanel`
redan använder) istället för att uppfinna en ny. Ingen ny
BookStore-logik behövdes — `chapters` fanns redan tillgänglig i
Editor.tsx där kortet renderas.

Verifierat live: skapade ett kapitel, lade till en platshållare via
högerklicksmenyn ("Drop a placeholder…"), öppnade Korrekturläsning —
varningen "1 open placeholder note across the manuscript…" syntes
direkt ovanför Starta-knappen, bytte korrekt till "...in this
chapter…" när Omfattning växlades till det öppna kapitlet. 930 tester
gröna, tsc rent, build grön.

v1.0.87 → v1.0.88.

---

**Ändringslogg v1.0.88 → v1.0.89 (2026-10-13):** Mats: "Då kör vi med
#30" — slå ihop Story Bible-kort för samma person under olika namn
(Kapten Kael / Kaptenen / Kael), redan designad i detalj sedan ett
samtal 2026-09-27 och återbekräftad av Mats i samband med
todo-genomgången inför v1.0.88.

**Research innan kod:** kartlade ALLT i `Book` som är nyckel på
`entity_ref` innan jag skrev något, via `deleteEntity.ts` (som redan
gör en jämförbar operation) plus en grep efter varje förekomst av
`entity_ref` i `src/core/`: `facts`, `profiles`, `event_profiles`
(+ dess EGNA `participants`/`where`-korsreferenser till ANDRA
entiteter), `media`, `hidden_entities`, `entity_kinds` — och en som
`deleteEntity.ts` själv missade: `entity_tracking` (alias/exklusion-
listorna från "Build entity aliases + exclusion list"-arbetet).
Fixade den luckan i `deleteEntity.ts` samtidigt (ren bieffekt av att
behöva exakt samma lista för sammanslagningen — kommenterad i båda
filerna om varandra).

**Kärnlogik** (`src/core/mergeEntities.ts`, ny fil):
- `canMergeEntities` — vakt: minst två kort, alla måste lösa till
  samma `BibleKind` (blockerar, enligt den öppna frågan i #30:s
  ursprungstext — "troligen varna eller blockera").
- `buildMergeProposal` — grupperar de sammanslagna kortens aktiva
  låsta fakta per predikat; ett predikat med EN gemensam värdesträng
  (även om flera kort upprepar den exakt) hoppar helt över
  förslaget — inget att välja. Flera olika värden → en rad i
  förslaget, en kryssruta per unikt värde.
- `applyMerge` — flyttar varje fakta (alla statusar, även
  superseded, till den vinnande `entity_ref` + det valda namnet;
  äkta dubbletter (samma predikat, samma värde) kollapsas till EN
  kvarvarande fakta (äldst `created_at` vinner), resten superseded
  av den — aldrig raderade, i linje med `NarrativeFact`s egen regel
  "fakta raderas aldrig, bara efterträds". Värden författaren INTE
  kryssade i superseded av det kvarvarande valda värdets fakta.
  Profil/bild/event-profil: behåll vinnarens egen om den har
  innehåll, annars adoptera första förlorarens; taggar/bilder
  unionas (bilder takade vid `MAX_ENTITY_PICTURES`); ANDRA event-
  profilers `participants`/`where` som pekade på en förlorande ref
  skrivs om till vinnaren istället för att tas bort (skillnaden mot
  en riktig radering) — deduplicerat. `hidden_entities`: dold om
  NÅGON av de sammanslagna var dold (konservativt, exponerar aldrig
  något författaren medvetet gömt). Alias: varje förlorande korts
  GAMLA namn blir ett nytt alias på det sammanslagna kortet (själva
  poängen — en senare omnämning av "Kaptenen" ska fortfarande hitta
  kortet), plus union av redan existerande alias/exklusioner.

**UI** (`BiblePanel.tsx`): "Slå samman kort…" växlar ett
markeringsläge i roster-listan (kryssrutor istället för att öppna
kortet vid klick); "Slå samman (N)" öppnar `MergeEntitiesCard` —
namnväljare (radioknappar över kortens nuvarande namn + fritext),
en sektion per predikat där korten är oense (kryssrutor, minst en
måste vara ikryssad). Vid bekräftelse: `applyMerge` körs, och om
någon förlorande kort hade ett namn som fortfarande förekommer i
manustexten visas EN samlad "byt ut dessa också?"-ruta (en rad per
namn med egen kryssruta och träffantal) — återanvänder
`replaceNameInManuscript`, samma mekanik som den befintliga
namnbytesfunktionen.

**En bugg hittad under testskrivandet, inte i produktionskoden:**
mitt första testfixture-hjälpobjekt spred `...overrides` EFTER det
beräknade `id`-fältet, så två fakta med samma `overrides.id`-sträng
("identity") för olika entiteter kolliderade till bokstavligen samma
fakta-id — fick båda att "efterträda sig själva". Hittade det genom
att faktiskt köra och skriva ut mellanresultatet (inte gissa), rättade
testhjälparen (beräkna id EFTER spreaden), inte produktionskoden, som
var korrekt hela tiden.

**Verifierat grundligt:** 20 nya enhetstester i merge-entities.test.ts
(vakten, förslags-grupperingen, dubblett-kollaps, konfliktlösning i
båda riktningarna, profil/bild/event-profil-sammanslagning,
korsreferens-omskrivning, alias-tillägg, alla no-op-fall). Full
Playwright-körning: skapade två kort (Kael/Kaptenen) med gemensam
identitetsfakta och olika trait-fakta, nämnde "Kaptenen" i
kapiteltexten, markerade båda i rostern, slog samman, behöll Kaels
trait i konfliktvalet, bekräftade att "Steady under pressure." är
kvar aktiv och "Haunted by the mutiny." ligger kvar i Historik (inte
borttagen) men inte bland de aktiva fakta, bekräftade
"byt ut i manustexten"-rutan dök upp med rätt träffantal och att
texten faktiskt blev "Kael walked onto the bridge." efter bekräftelse.
950 tester gröna, tsc rent, build grön.

v1.0.88 → v1.0.89.

---

**Ändringslogg v1.0.89 → v1.0.90 (2026-10-13):** Mats om Extract
Facts-flödet: "Redan där skulle man istället få välja 'Merge with...'.
Känns som en omväg att man först ska låsa faktan för att sedan göra en
merge." — rätt observation: det gamla flödet krävde Lock → öppna kortet
→ Slå samman kort → välja värde, bara för att flytta en enda fakta till
ett redan existerande kort. Byggde "Merge with…" direkt på det väntande
faktakortet i granskningskön, väg 2 av #30 (väg 1, att ge extractorn
kontext för att undvika dubbletter från början, är fortfarande obyggd).

**Varför inte `addFact`:** BiblePanels befintliga `addFact`-omslag
härleder `entity_ref` som `slugify(label)` — osäkert här, eftersom
`entity_ref` och `slugify(nuvarande namn)` kan divergera efter ett
namnbyte (`renameEntityLabel` uppdaterar bara `entity_label`, aldrig
`entity_ref`). Ett val av "Kael" i Merge with…-listan måste landa på
Kaels FAKTISKA `entity_ref`, inte en nygissad slug av hans nuvarande
namn. Anropar därför `applyAuthorDraft`/`applyAuthorAddition`
(`ConsistencyGate.ts`) direkt via `patchBook`, med målets riktiga
`entity_ref` explicit — samma primitiv som redan driver den befintliga
"Replace or add?"-dialogen i EntityOverlays manuella fakta-formulär,
nu återanvänd.

**Flöde** (`BiblePanel.tsx`): varje väntande faktakort i
`ReviewOverlay` får en "Merge with…"-väljare (bara när det finns
existerande kort av samma `BibleKind` — klassificerat via
`classifyEntity`, exkluderar faktans egen ref). Vid val:
- Ingen konflikt (målet saknar en låst fakta för samma predikat, eller
  har exakt samma värde) → slås samman direkt: `applyAuthorDraft`
  skriver/ersätter, `withRelationshipMirrorFor` lägger till den
  omvända relationsfaktan om predikatet är `core.relationship`,
  `rejectFact` tar bort den gamla väntande raden ur kön, och om
  faktans ursprungliga `entity_label` skiljer sig från målets namn
  blir det ett nytt alias via den nya `addAlias`-hjälparen i
  `entityTracking.ts`.
- Konflikt (målet har redan ett annat värde för samma predikat) →
  samma "Replace or add?"-dialog som den befintliga manuella
  fakta-formuläret (återanvänder `addChoiceTitle`/`addChoiceBody`/
  `addChoiceKeepBoth`/`addChoiceReplace`), med "Lägg till som en till"
  → `applyAuthorAddition` (båda värden kvar) eller "Ersätt den
  befintliga" → `applyAuthorDraft` (ersätter).

**Bugg hittad och fixad under Playwright-verifiering:** konfliktdialogen
öppnas OVANPÅ den fortfarande öppna granskningskön (fakta kvar i kön
tills valet är klart) — samma typ av z-index-krock som redan löstes för
Interview vs. granskningskön (`.edit-overlay:has(.bible-review-card) {
z-index: 60; }`), men ett lager till: granskningsköns textarea fångade
klick menade för konfliktdialogens knappar ("Add as another" gick inte
att klicka — Playwright rapporterade att review-kortets `<textarea
aria-label="Fact text">` avlyssnade pekarhändelserna). Gav
konfliktdialogen en egen klass (`merge-fact-choice-overlay`) och
`z-index: 70` i styles.css, ett steg högre än granskningskön — den
reagerar på ett klick författaren precis gjorde och ska alltid vinna
över kön den öppnades från.

**Verifierat:** två levande Playwright-körningar mot en mockad
OpenAI-kompatibel extractor-server (alltid samma påstådda fakta för
"the Captain", Trait: "Scarred hands from engine work.") — ett utan
konflikt (Kael utan existerande Trait-fakta: faktan landar direkt på
Kael, granskningskön blir tom, kortet visar den nya traiten) och ett
med konflikt (Kael har redan "Steady under pressure.": "Replace or
add?"-dialogen visas med rätt befintligt värde, "Add as another"
klickbar efter z-index-fixet, Kael har båda traits kvar efteråt). 950
tester gröna, tsc rent, build grön.

v1.0.89 → v1.0.90.

---

**Ändringslogg v1.0.90 → v1.0.91 (2026-10-13):** #41 (Dekorativa
scenbrytare), nästa i den ordning Mats själv föreslog (41, 44, 28, 43)
och jag höll med om — minst omfattande och helt självständig av de
fyra. Bad Mats om de fyra exakta stilarna/symbolerna istället för att
gissa på den gamla, ospecifika anteckningen ("fyra CSS-stilar" utan
detaljer utöver vinjetten); fick en bild tillbaka med alla fyra:
Klassisk bokvinjett (❦, uttonande sepialinje), Minimalistisk diamant
(❖, solid grå linje), Fransk elegans (⚜, uttonande guldlinje),
Glimmer/Stjärna (✦, solid silverlinje). Mats skickade även exakta
Unicode-kodpunkter för tre av fyra i efterhand (❦ U+2766, ⚜ U+269C,
✦ U+2726) — stämde med bilden. Diamanten (❖ U+2756) fick jag själv
välja, samma Dingbats-block som de andra tre (bra typsnittsstöd).

**Upptäckt innan någon kod skrevs:** `manuscriptExport.ts` kände inte
alls igen `---`-scenbrytare i NÅGOT exportformat — varje format
(HTML/ePub/ODT/RTF/PDF) skrev bara ut de tre bindestrecken som vanlig
text. Inte en regression, aldrig byggt. Fixad som en nödvändig
förutsättning för hela funktionen (kan inte dekorera något exporten
inte ens känner igen), inte en sidoeffekt att separat besluta om.

**Fyra implementationslager, samma "olika trohet per format"-princip
Anfang (drop cap) redan etablerade:**
1. **Redigeraren** (`styles.css`): `.prose-hr` (oförändrad för
   "plain") plus fyra `.scene-break-*`-klasser — bredare uttonande
   gradientlinje (`linear-gradient`), symbolen centrerad via
   `::before`, en "stans" i linjen bakom symbolen via en solid
   bakgrundsfärg i exakt samma ton som panelen den ligger på.
2. **HTML/ePub** (`manuscriptExport.ts`, `sceneBreakCss`/
   `sceneBreakHtml`): samma teknik, egen CSS-kopia (som `dropCapCss`
   redan har sin egen oberoende bisekterade kopia av talet 1.5 —
   samma motivering, två separata statiska CSS-baser).
3. **ODT/RTF** (förenklat, ingen uttoning möjlig): en ensam centrerad
   rad med den riktiga symbolen — ODT via en ny `SceneBreak`-
   stycke-stil (`fo:text-align="center"`), RTF via `{\qc ...\par}`,
   inkapslad i en egen grupp så `\qc` aldrig läcker in i
   efterföljande stycken (RTF:s "spaced"-gren återställer annars
   aldrig justeringen explicit).
4. **PDF** (mest begränsat): `pdf-lib` kan bara rita tecken det
   inbäddade typsnittet faktiskt innehåller, och inget av de 13
   brödtextsnitten har dingbat-glyfer — att försöka `drawText()` med
   ❦/❖/⚜/✦ hade kastat ett fel. Löst med handritade vektorformer
   istället för en bunlad symbolfont (roadmap-idéns ursprungliga
   reservplan): diamant = en roterad kvadrat, stjärna/fleur-de-lis =
   handskrivna SVG-path:er (tre överlappande "kronblad" + en bas-list
   för fleur-de-lis, fyra uddar för stjärnan), löv = en enkel
   mandelformad siluett för vinjetten. Linjens uttoning byggs av ~12
   korta `drawLine`-segment med interpolerad opacitet (`pdf-lib` har
   ingen inbyggd gradient). Inte pixel-exakt mot bilden — ett
   kalligrafiskt löv/fleur-de-lis är inget värt att frihandsrita
   bezier-exakt — men läsbart som "dekorativ avdelare" i den lilla
   storlek en scenbrytare faktiskt renderas i.

**Verifiering, PDF-formerna specifikt:** kunde inte lita på att gissa
rätt blint, så byggde en visuell loop: skrev varje stils PDF via ett
scratch-vitest-test (direkt `tsx`-körning misslyckas på
typsnitts-assets, samma kända begränsning som tidigare i sessionen),
rastrerade med `ghostscript` (`gs -sDEVICE=png16m`, redan installerat)
till PNG, croppade/zoomade med ImageMagick och faktiskt TITTADE på
resultatet innan jag gick vidare. Diamant och stjärna blev exakta;
fleur-de-lis blev förvånansvärt igenkännbar trots att den är
handskriven blint; lövet är den svagaste av de fyra (liten,
mandelformad) men godkänd. LibreOffice headless (`--convert-to pdf`)
fanns installerat men fungerade inte i den här sandlådan — misslyckades
även på en ren textfil, så inte en bugg i min kod. Verifierade ODT/RTF
strukturellt istället (XML-validering, brace-balans, rätt
Unicode-kodpunkter i RTF:s `\uNNNN?`-escape) snarare än visuellt.

**Två buggar hittade och fixade under den visuella Playwright-
verifieringen, inte i teorin:**
- Symbolens "stans" i linjen i redigeraren använde `var(--paper)`
  (panel-ytans färg) som bakgrund — men redigeringsytan själv ligger
  på `--bg`, en skugga mörkare, vilket lämnade en synlig felmatchad
  rektangel bakom symbolen. Hittad genom att faktiskt sampla pixlar
  (`convert -format "%[pixel:p{x,y}]"`) mot en Playwright-skärmdump,
  inte genom att gissa. Fixad: `var(--bg)`.
- HTML-exportens "plain"-stil (den korta vanliga linjen) renderades
  helt osynlig — bredd och marginal var satta i `em`, men samma
  element sätter sin egen `font-size` till 0 (för att dölja
  textnoden "---"), så `em`-värden löstes mot den nollan och
  kollapsade till bredd 0. Exakt samma fälla som `.prose-hr` i
  `styles.css` redan har en kommentar om — men jag föll i den själv i
  den nya exportkoden ändå. Hittad genom `boundingBox()` i Playwright
  (bredd: 0), inte genom att läsa CSS:en. Fixad: `px` istället för
  `em`.

**Enhetstester** (`manuscript-export.test.ts`, nytt "scene break"-
block, 10 nya tester): default-värdet, HTML i båda styckeslägena,
ePub:s delade stylesheet, ODT i båda lägena inklusive asterismen
("* * *") för "plain" istället för bokstavliga bindestreck, RTF:s
gruppscopade `\qc`, och en PDF-rundtur för alla fem stilar (kan inte
assert:a det visuella innehållet i ett enhetstest, bara att sidorna
faktiskt skapas utan att kasta — det visuella är redan verifierat
separat ovan). 960 tester gröna, tsc rent, build grön.

v1.0.90 → v1.0.91.

---

**Ändringslogg v1.0.91 → v1.0.92 (2026-10-13):** Mats, efter att ha
testat v1.0.91: "ibland funkar inte > (ofta men inte ibland, jag har
inte hittat något mönster och ingen work-around)." Ingen reproducerbar
beskrivning att gå efter, så byggde flera Playwright-repro-skript och
provade olika realistiska redigeringsmönster tills en faktiskt visade
buggen, istället för att gissa i koden.

**Reproducerad:** blixtsnabb skrivning rakt av fungerade perfekt i
alla varianter (delay=0, fem citat i rad, mitt i manuset via
tangentbord). Felet visade sig först när jag simulerade hur en
författare FAKTISKT redigerar en redan skriven citatrad — klickade
nära början av en befintlig `>`-rad (ingenting synligt där att sikta
på, markören "> " är dold via `font-size: 0`), tryckte Home, tryckte
Enter. Resultatet: markören dubblerades och de två styckenas text
flöt ihop utan brytning — en riktig förlust av delningen (och delar
av författarens text), inte bara ett visuellt glapp.

**Rotorsak:** markörens span är fortfarande vanlig redigerbar text
(bara visuellt dold), så webbläsaren har inget sätt att veta att en
klick-position "precis innan" den är något annat än en position
"inuti" den — och om markören lämnar insättningspunkten där, splittar
webbläsarens egen `insertParagraph` dåligt.

**Tre smalare försök, alla levande-verifierade fel innan den som
höll:**
1. `contenteditable="false"` på markör-spannet — stoppar markören
   från att hamna inuti, men bröt helt vanlig skrivning av en
   NY "> "-rad (mitt-i-tangenttryckning-ombyggnaden kommer inte
   överens med ett icke-redigerbart span).
2. Flytta insättningspunkten till precis EFTER markören innan
   `insertParagraph` körs — webbläsarens delning lämnar då markören
   kvar i FÖRSTA halvan och kopierar den inte till den andra, så
   `.prose-quote`-klassen hamnar på text som inte längre börjar med
   ">" — fångat av synkroniseringslogiken, som tvingade fram en NY
   ombyggnad som tyst tappade citatformateringen istället för att
   bevara den.
3. Flytta insättningspunkten till styckets absoluta BÖRJAN (innan
   markören) och fortfarande låta `insertParagraph` köra — samma
   ihopflytande fel som ursprungsbuggen. Att själv bygga om DOM:en
   istället för att be `execCommand` göra det fixade själva
   delningen, men insättningspunkten hamnade kvar på exakt samma
   "stycke-offset 0"-gräns som visade sig lika instabil för NÄSTA
   tangenttryckning som den ursprungliga klicken — skrivning hamnade
   tillbaka inuti markören, samma korruption en bokstav försenad.

**Det som faktiskt höll:** bygg det tomma nya stycket själv (samma
form som `blockMarkupNeedsSync` redan behandlar som en vanlig
nyss-delad tom block) och lämna insättningspunkten PÅ det — rör aldrig
vid eller närmar sig markörens gräns alls, så det finns ingen gräns
kvar för en senare tangenttryckning att hamna tvetydigt på. Avviker
lite från ett vanligt styckes Enter-vid-start-beteende (som lämnar
insättningspunkten kvar vid den nedflyttade texten, inte den nya
tomma raden) — en rimlig, snarare mer användbar skillnad här, eftersom
en klick nära en citatrads osynliga start oftast betyder att
författaren är på väg att skriva ett nytt stycke FÖRE den, inte
återuppta citatet självt.

Eftersom den manuella DOM-ombyggnaden (till skillnad från
`execCommand`) inte triggar en nativ `input`-händelse, skickas en
syntetisk sådan explicit efteråt — annars såg nästa riktiga
tangenttrycknings synk-effekt sin egen (korrekta) DOM vara oense med
det fortfarande gamla `value`, och byggde om rakt över den, vilket
tyst upphävde delningen.

**Verifierat:** fem separata Playwright-repro-skript (blixtsnabb
skrivning i flera varianter, tangentbord-navigering via Ctrl+Home,
klick+Home+Enter på en befintlig citatrad, steg-för-steg-spårning av
varje mellanliggande DOM-tillstånd) — alla visar nu rent, korrekt
resultat: två separata, korrekt formade citatstycken istället för
ihopflutna/dubblerade. `window.getSelection()`/Range-API:erna som
behövs för att enhetstesta detta kräver en riktig DOM (`vitest`-miljön
är `node`, inte `jsdom`, i det här projektet) — litar på den levande
Playwright-verifieringen istället, samma mönster som resten av
`proseDom.ts`/`ProseCanvas.tsx` redan gör. 960 tester gröna
(oförändrat — ren DOM-redigeringslogik, inget nytt att testa i
`core/`), tsc rent, build grön.

**Mats andra fråga, HR "blev väldigt kort":** inte en bugg — den
korta linjen (`.prose-hr`, ~3.5rem) är och har alltid varit
standardutseendet, oförändrat av v1.0.91:s nya scenbrytarstilar.
Svarade separat i chatten att om han vill ha den längre/mer
dekorativ finns nu fyra alternativ i Settings → Typography →
Scene break.

v1.0.91 → v1.0.92.

---

**Ändringslogg v1.0.92 → v1.0.93 (2026-10-13):** #44 (Manuellt bifogad
kontext från andra kapitel/scener till Draft/Recast) — nästa i Mats
egen föreslagna ordning (41, 44, 28, 43) efter att #41 var klart.

**Research innan kod**, samma princip som #30: läste `continuesFrom.ts`
(`formatPredecessorForDraft`, `earlierChapters`, `chapterChoiceLabel`)
och `generateProse.ts`s fem prompt-byggande funktioner
(`draftUserPrompt`, `draftSceneUserPrompt`, `recastUserPrompt`,
`recastSceneUserPrompt`, `polishUserPrompt`/`passageUserPrompt`)
innan jag skrev något, för att återanvända exakt samma mönster
istället för att uppfinna ett nytt. Bestämde scope utifrån idéns egen
rubrik: bara Draft och Recast (båda hel-kapitel- och
scen-varianterna) — inte Polish eller Passage, som redan ser hela
den aktuella prosan och inte uppenbart behöver "bifoga en annan del
av manuset" på samma sätt.

**Datamodell** (`BookSchema.ts`): nytt fält `Chapter.context_refs:
ChapterContextRef[]` — `{chapter_id, scene_id?}`, inte bara
bar-sträng-id:n, eftersom kapitel-id:n och scen-id:n kommer från
samma `newId()`-pool och jag inte ville bygga en "gissa vad den här
strängen pekar på"-uppslagning. `scene_id` frånvarande = hela
kapitlet; närvarande = bara den scenen. Utökade `clearPointersTo`
(redan `continues_from`s egen städning vid `discardChapter`) att
även strippa `context_refs` som pekar på det kasserade kapitlet —
samma typ av upptäckt lucka som `entity_tracking`-fixen i #30, fast
den här gången förebyggd direkt istället för upptäckt i efterhand.

**Kärnlogik** (`src/core/chapterContext.ts`, ny fil):
`attachableChapters`/`attachableScenes` — bara tidigare kapitel/scener
med faktisk prosa (inget att bifoga från ett tomt kapitel, och ett
senare kapitel har per definition inget skrivet än).
`resolveContextRefs` — slår upp `context_refs` mot bokens nuvarande
kapitel/scener, hoppar tyst över allt som inte längre finns eller
blivit tomt (en scen som slagits ihop bort av en ny delning, ett
kapitel som tömts efter att ha fästs) — samma tysta-hoppa-över-mönster
som alla andra referenser i schemat redan har.
`formatAttachedContextForPrompt` — bygger promptblocket, hel prosa
per fäst kapitel/scen, inte bara en sammanfattningsrad som
`formatStorySoFar` ger. Trådat in i alla fyra Draft/Recast-funktioner
i `generateProse.ts`, direkt efter `formatStorySoFar`s eget block.

**UI** (`Editor.tsx`, ny `AttachedContextField`-komponent i
"Chapter settings", efter Continues from): en lista över redan fästa
kapitel/scener (var och en med en ×-borttagningsknapp, samma
`.icon-button`-mönster som kapitel-raderingsknappen), en väljare
(kapitel-dropdown, följt av en scen-dropdown som bara visas om det
valda kapitlet faktiskt har fler än en scen) plus en Fäst-knapp, och
en grov token-kostnadsuppskattning (återanvänder `estimateTokens` från
`promptDebug.ts`, redan byggd för AI Context Inspector — ingen ny
uppskattningslogik). Egen `key={chapter.id}` på komponenten så att en
halvvald kapitel/scen-kombination i väljaren nollställs rent vid
kapitelbyte, istället för att läcka in i nästa kapitels Attached
context. Bröt ut komponenten ur `.craft-field`s vanliga
overlay-etikett-grid (samma lösning som `body_color`-fältet redan
behövde för `<input type="color">` — en lista-plus-väljare passar
inte det enda-inputs-mönstret) men behöll `craft-field`-klassen för
dess `span:first-child`-etikettstil.

**Verifierat:** 15 nya enhetstester i `chapter-context.test.ts`
(attachable-filtrering, hel-kapitel- och scen-upplösning, tyst
hoppa-över av trasiga referenser, `addContextRef`/`removeContextRef`,
städning vid `discardChapter`, integrationstest mot
`draftUserPrompt` direkt). Två fulla Playwright-körningar: en för
hel-kapitel-fästning (fäst, se i listan, se token-kostnaden, ta
bort), en för scen-nivå (delade ett kapitel i två scener via
Scener-panelens "Split into two…", fäste specifikt "Scene 2", såg
"1 · Chapter 1 — Scene 2" i listan). 975 tester gröna, tsc rent,
build grön.

v1.0.92 → v1.0.93.

---

**Ändringslogg v1.0.93 → v1.0.94 (2026-10-13):** #40 (gör
Korrekturläsningens Style-sampling och Scenes-kandidattak hanterbara
efter användarens dator) — nästa i Mats ordning efter att han pausade
#28 i väntan på testarens exempelexporter. Redan grundligt utredd i
roadmap-ideas.md (research från en tidigare Reddit/hårdvaru-
diskussion), så research-steget var redan klart — gick direkt på
den föreslagna lösningens två separata signaler.

**Style** (`proofread.ts`, `styleUserPrompt`): skalar nu från
Settings → Context window istället för de hårdkodade 420/280-
teckengränserna. Ny `styleSampleBudget(contextWindow, chapterCount)`:
räknar ut tillgängliga tecken (`(contextWindow - 1200 reserverade
token) × 4 tecken/token`), delar per kapitel, 60/40-split mellan
huvud/svans (samma förhållande 420/280 redan hade), med golv
(420/280, dagens gamla gräns — aldrig mindre även vid ett litet
Context window) och tak (3000/2000, så ett fåtal kapitel vid ett
enormt Context window inte äter hela budgeten själva). Ny
`styleChapterSample`: skickar HELA kapitlet om det redan ryms inom
den kombinerade budgeten — löser direkt "en registerglidning mitt i
ett kapitel syns aldrig", eftersom inget sampling sker alls när
kapitlet får plats — annars samma form som förut (första två
styckena + sista stycket), bara klippt mot den skalade budgeten
istället för de gamla fasta talen. Viktigt att vara ärlig om i
koden: vid DAGENS standard-Context window (8192) blir budgeten redan
betydligt större än 420/280 för ett typiskt kapitelantal — inte en
regression, bara att 420/280 aldrig faktiskt var härlett ur
context-fönstret till att börja med, bara ett fast tal valt en gång.

`ProofreadIO` (`proofreadRun.ts`) fick ett nytt `contextWindow?:
number`-fält — valfritt så befintliga testers `ProofreadIO`-literal
inte behövde uppdateras, `styleUserPrompt`s eget defaultvärde
(8192, samma som `llm/contextWindow.ts`s `DEFAULT_CONTEXT_WINDOW`,
medvetet duplicerat snarare än importerat — `core/` har idag ingen
beroende alls på `llm/`-lagret, och jag ville inte bryta den
gränsen för ett enda tal) tar vid om det saknas. BookStore.tsx
trådar in `contextWindowRef.current` vid anropet.

**Scenes** (`proofreadScenes.ts`): nytt fält `Book.proofread_thoroughness:
"fast" | "balanced" | "thorough"`, default `"balanced"` = dagens
långvariga gräns på 24 — oförändrat för alla befintliga manus.
`MAX_CANDIDATES_BY_THOROUGHNESS`-karta: fast=12, balanced=24,
thorough=48. Till skillnad från Style är det här en antal-anrop-
fråga, inte en storleksfråga (varje kandidatpar är redan litet oavsett
Context window) — därför egen Settings-nivå istället för att återanvända
Context window som proxy, exakt som roadmap-idén föreslog.

**UI** (`SettingsPanel.tsx`): ny "Proofread thoroughness"-väljare i
AI settings, direkt under Context window-fältet (Snabb/Balanserad
(standard)/Grundlig).

**Verifierat:** nya enhetstester i `proofread.test.ts` — Scenes:
en fixture med fler kandidatpar än ens "thorough"s tak (tio kapitel,
varsina två nästan-parafraserade stycken) bekräftar att taket
faktiskt appliceras på alla tre nivåer, inte bara råkar stämma.
Style: `styleSampleBudget`s golv/tak/skalning direkt, plus
`styleUserPrompt`-integrationstester (ett kort kapitel skickas helt
utan klipp-ellips vid ett rymligt Context window; ett kapitel på 80
stycken faller tillbaka till huvud+svans med mellanstyckena
uteslutna vid ett snålt). Live Playwright-verifiering av den nya
Settings-väljaren: syns, visar "Balanced (default)" som startvärde,
går att ändra, och värdet överlever att stänga och återöppna
Settings. 986 tester gröna, tsc rent, build grön.

v1.0.93 → v1.0.94.

---

**Ändringslogg v1.0.94 → v1.0.95 (2026-10-13):** #43 (Språkversioner
av ett manus) — efter ett separat arkitektursnack innan bygget drog
igång ("Då tar vi ett snack om 43"). Användningsfallet (bekräftat via
fråga): publicera översatta utgåvor av samma manus. Det avgjorde valet
mellan de två tänkbara formerna — flerspråkig prosa i EN bok (Story
Bible-fakta taggade per språk, kapitel med parallella textversioner)
kontra separata, länkade böcker — till förmån för den lättare formen:
separata böcker. Story Bible-synk bedömdes inte kritisk (bekräftat via
fråga) — översätt en gång, underhåll separat i den översatta boken,
ingen tvåvägs-synk att bygga. Mats föreslog versionsnummer för att visa
vilket språk som "ligger efter"; föreslog istället att återanvända två
redan byggda mekanismer i kodbasen snarare än att uppfinna en tredje:
`proseHash`-mönstret från Proofread (en ögonblicksbild-hash istället
för globala versionsnummer, ett fält per kapitel) för inaktualitets-
flaggan, och `diffProse`/`HistorySplit` (redan delad mellan History-
panelen och Polish-granskningen) för att visa VAD som ändrats i
källan. Mats höll med om resonemanget. Granskade även vilka befintliga
AI-jobb som använder `model` (Writing) kontra `reviewModel` (Review) —
Writing driver stora kreativa jobb (Draft, Recast, Brainstorm-chatt,
Polish, Develop), Review driver mindre/analytiska (extraktion, analys,
grammatiknivå, sammanfattning) — och det motiverade en TREDJE,
dedikerad "Translate"-modellinställning snarare än att återanvända
någon av de två, med fallback till Writing-modellen om den inte är
satt.

**Schema** (`BookSchema.ts`): `Chapter` fick
`translated_from_chapter_id?: string` (vilket käll-kapitel i käll-
boken detta är en översättning av — sätts en gång när språkversionen
skapas) och `translated_from_snapshot?: string` (käll-kapitlets EGEN
prosa exakt som den löd senast översättningen genererades eller
accepterades — inte en hash, eftersom poängen är att kunna visa VAD
som ändrats, inte bara ATT något ändrats). `Book` fick
`translation_group_id?: string` (delas av original och alla dess
språkversioner — genereras en gång när den första översättningen
knoppas av) och `translated_from_book_id?: string` (boken denna
översattes FRÅN — en ren bok-id, eftersom kapitel-korrespondensen
redan sköts av varje kapitels egen `translated_from_chapter_id`).
Alla fyra fält `.optional()`, inte `.default()` — medvetet, för att
slippa röra `createChapter()`/`createBook()` eller några
testfixturer alls. `BookSummarySchema`/`summarizeBook()` fick
`prose_language`/`translation_group_id`/`translated_from_book_id`
(alla valfria, spreadas in bara när satta) så att hyllan (Home.tsx)
kan gruppera syskon utan att läsa in varje bok i sin helhet. tsc rent,
986 tester gröna direkt — inga fixture-ändringar behövdes.

**Kärnmodul** (ny fil `translation.ts`): `createLanguageVersion
(sourceBook, targetLanguage)` klonar kapitel-titlar/ordning från
källan med TOM prosa, varje nytt kapitel länkat till sin käll-
motsvarighet; kopierar också skriv-/typsnittsinställningar (voice,
kamera, typsnitt, scene-break-stil, läsarålder,
korrekturläsnings-grundlighet) så språkversionen känns som ett syskon
— men INTE synopsis, eftersom Story Bible medvetet stannar
källspråkigt enligt arkitektursnacket. `translationStatus(chapter,
sourceChapter)` → `"none" | "untranslated" | "stale" | "current" |
"orphaned"` (orphaned = käll-kapitlet pekar på finns inte längre,
samma "bara upplöses till inget"-hantering som andra döda referenser
i schemat). `sourceChangesSinceTranslation` wrappar `diffProse` mot
den sparade ögonblicksbilden. `acceptTranslation` skriver ny prosa +
uppdaterar ögonblicksbilden. `languageGroup`/`groupManuscripts` för
syskon-uppslagning (källa först, sedan språk bokstavsordning) —
`groupManuscripts` dedupar hela hyllan till distinkta kluster i
först-sedd-ordning. 16 nya enhetstester i `translation.test.ts`.

**Prompt** (`generateProse.ts`): ny `TRANSLATE_SYSTEM` +
`translateChapterUserPrompt(sourceBook, sourceChapter, targetLanguage)`
— läser bara käll-bokens EGNA Voice/Story Bible (den översatta boken
har ingen egen Bible), målboken bidrar bara med målspråket.

**BookStore.tsx:** nytt `translateModel`-state (localStorage-
persisterat som `reviewModel`, men tom sträng = "följ Writing-
modellen", ingen egen hårdkodad default eller auto-pick-logik —
enklare att bara falla tillbaka på vad `model` redan löstes till).
`newLanguageVersion(targetLanguage)`: speglar `newBook`, men sparar
även käll-boken med ny `translation_group_id` om den saknade en
sedan innan (samma spara). `translateChapter()`: speglar
`recastChapter` (helkapitel-regenerering, samma streaming/abort-
mönster) men läser först in käll-boken via `repo.get
(current.translated_from_book_id)`, validerar att käll-kapitlet har
prosa, och efter en lyckad generering sätter `translated_from_snapshot`
till käll-kapitlets prosa VID DEN TIDPUNKTEN (fångad innan
streaming startar, så en redigering av källan medan översättningen
pågår inte smyger in). Ny `loadBook(id)` — ren passthrough till
`repo.get`, exponerad för UI:t som behöver slå upp en annan bok utan
att öppna den (språkväxlaren, inaktualitets-kollen) — beräknas
alltså lat/on-demand, inte förberäknat in i varje hyll-rad, exakt
som planerat.

**UI:** `SettingsPanel.tsx`/`Home.tsx` fick en tredje `ModelSelect`
("Translate"), med ett nytt `followLabel`-stöd i `ModelSelect` self
("Use Writing model" som första alternativ, stannar vald istället
för att tvingas till första modellen i listan). Ny fil
`LanguageVersions.tsx`: `LanguageSwitcher` (visas i `editor-top`
bredvid titel-fältet, listar språksyskon rent från `summaries` — ingen
bok-inläsning behövs för grupperingen — plus ett inline-formulär för
"New language version…") och `TranslationStatus` (visas i kapitel-
editorns åtgärdsrad, bara för kapitel med `translated_from_chapter_id`
satt — laddar käll-boken en gång per kapitelbyte via `loadBook`,
visar status-etikett, en "Show what changed"-knapp som fäller ut
`HistorySplit`-diffen när inaktuell, och "Translate chapter"/
"Re-translate chapter"-knappen). `Home.tsx`s hylla grupperar nu källa
+ språkversioner i en rad med indragna syskon-rader istället för att
lista dem platt — `.book-shelf li` (som tvingade alla `<li>` till ett
2-kolumns-grid för [kort, radera]) fick en override för grupp-`<li>`:n
till `display: block`, 2-kolumns-layouten flyttades ner till
`.book-shelf-row`/`.book-shelf-siblings li`.

**i18n:** nya nycklar i alla tre språk (en/sv/nb) för modellväljaren,
språkväxlaren, inaktualitets-status/diff-vyn, samt `"translate"`
tillagt i `PROSE_HISTORY_OPS`/`PromptOperation`/historik- och
prompt-debug-etiketterna (tvingat fram av TypeScripts
`Record<ProseHistoryOp, string>`-fullständighetskrav — fångade varje
ställe som behövde uppdateras).

**Verifierat:** tsc rent, 1002 enhetstester gröna (986 + 16 nya),
`npm run build` grön. Live Playwright-verifiering av hela flödet:
skapade manus, skrev käll-prosa, skapade en svensk språkversion via
växlaren (titel oförändrad, språketikett "Svenska"), öppnade kapitel 1
i den nya boken — tomt, "Not translated yet" + Translate-knapp;
skrev manuellt in text (simulerar en hand-översättning) — status
växlade till "Source changed since this was translated" (ingen
ögonblicksbild sparad än), diff-vyn visade käll-texten korrekt som
helt infogad; växlade tillbaka till originalet via syskon-knappen;
gick till Hem och bekräftade att hyllan grupperar källa + "SVENSKA"
som en indragen syskon-rad under samma kort.

v1.0.94 → v1.0.95.

---

**Ändringslogg v1.0.95 → v1.0.96 (2026-10-13):** #45-uppföljning —
Mats klistrade in hela texten till "StoryScope: Investigating
idiosyncrasies in AI fiction" (Univ. of Maryland/Google DeepMind,
2026-08-10) efter att nätverksåtkomst till arxiv.org visat sig saknas
i sandboxen. Sammanfattad direkt i roadmap-ideas.md #45 (se den
posten för hela sammanfattningen och de fem AI-modellernas
"fingeravtryck"). Mats följdfråga: "Kan man justera prompten som går
till AI så att texten som genereras blir bättre?"

Rapportens tre starkaste, mest kapitel-nivå-åtgärdsbara fynd (jämfört
med mänsklig prosa i samma genre/premiss): AI-narration förklarar
temat/moralen rakt ut (77% vs 52%); AI visar känslor nästan
uteslutande kroppsligt istället för att namnge dem (81% vs 38%
kroppsligt; människor namnger rakt av 29% vs 8%); AI löser scener
oftare via huvudpersonens eget val eller tyst acceptans (69%/47% vs
46%/27%), människor tillåter mer tvetydighet. Valde dessa tre
specifikt eftersom de går att instruera BORT utan att först bygga om
datamodellen eller manusstrukturen — till skillnad från t.ex.
subplot-antal eller icke-linjär tidsstruktur, som är manus-nivå-beslut
Draft inte kan fatta åt författaren per kapitel.

**`generateProse.ts`:** ny rad tillagd sist i både `DRAFT_SYSTEM` och
`PASSAGE_SYSTEM` (före slutraden om output-format): "Let the scene's/
passage's meaning emerge from what happens, not from the narration
explaining it... Name a character's feeling plainly sometimes, not
only through bodily sensation and metaphor." `DRAFT_SYSTEM` fick
dessutom en tredje mening om upplösning ("need not resolve neatly
through the protagonist's own choice or quiet acceptance") — utelämnad
ur `PASSAGE_SYSTEM` eftersom en enskild markerad passage eller infogad
beat sällan ÄR scenens upplösning, så den meningen skulle sakna
sammanhang där. `RECAST_SYSTEM` rörd INTE — dess hela jobb är att
bevara exakt samma händelser/innebörd genom en kamera-/tempusändring,
inte forma nya narrativa val.

**`BookSchema.ts` (`DEFAULT_POLISH_PROMPT`):** en konkret motsägelse
hittad och flaggad innan ändring — punkt 2 i Mats egen handskrivna
Polish-prompt sa "STRIP ALL EMOTION NOUNS & ADJECTIVES... Show
physical reactions instead", vilket rakt motsäger rapportens fynd
(namngiven känsla är en MÄNSKLIG markör, kroppslig skildring en
AI-markör) — den gamla absoluta regeln drev alltså varje Polish-körning
ÅT det AI-hållet på just den axeln. Flaggat som en fråga ("medveten
stilistisk smak eller ska jag mjuka upp den") snarare än tyst ändrat,
eftersom det är Mats egen handskrivna text. Mats svarade: mjuka upp
den. Punkt 2 omdöpt till "VARY HOW EMOTION IS CONVEYED" — behåller
båda bullets struktur men vänder riktningen: namngiven känsla
tillåten som "sometimes the sharper, more human choice", kroppslig
ersättning bara när ordet är ren utfyllnad handlingen redan visar.
Doc-kommentaren ovanför konstanten utökad till att förklara båda
tilläggen (fakta-trimning sedan tidigare, nu även denna).

**Verifierat:** tsc rent, 1002 tester gröna (oförändrat antal — inga
tester asserterar den exakta prompttexten utöver några `toContain`/
`toMatch`-kontroller som fortfarande matchar), `npm run build` grön.
Ingen Playwright-verifiering — ren prompttextändring utan någon ny
eller ändrad UI-yta att klicka igenom; AI-beteendet den styr går inte
att verifiera utan en ansluten modell.

v1.0.95 → v1.0.96.

---

**Ändringslogg v1.0.96 → v1.0.97 (2026-10-13):** #14 (Hel-manus
developmental analys) — sista obyggda punkten av betydelse på hela
roadmapen, efter att en rutinkoll samma dag avslöjade att #24/#26/#33/
#34/#35 redan var klara men saknade sina byggd-markeringar. #14 var
uttryckligen "sist i kön — störst att bygga rätt, minst värde utan allt
ovanstående på plats"; det "ovanstående" (scen-medvetenhet, Story
Bible-provenience, Timeline, Plotlines, setup/payoff-spårningens
Proofread-steg, pluggbara utvecklingsmetoder) var nu klart, så punkten
var mogen.

**Arkitektursamtal innan bygget** (Mats bad uttryckligen om det):
grundlig kodgenomgång av vad som redan fanns att bygga vidare på —
`proofreadRun.ts`s flerstegs-, återupptagbara job-mönster (`ProofreadJob`
som ETT fält på Book, per-steg done-listor, `io.complete`/`io.save`-
abstraktion) identifierades som rätt mall att spegla. Tre beslut togs i
samtalet:
1. **Hoppa över akt-lagret i v1.** Inget `Book.acts`-koncept finns
   någonstans i schemat (grundligt sökt igenom innan påstått). Kör
   scen → kapitel → manus direkt, samma "bygg det mindre, bevisa värdet
   först"-princip som #33 redan följde för sitt gantschema-beslut.
2. **Analyze (#32) kan INTE återanvändas som den är.** Separat,
   grundlig diskussion: Analyze (`chapterFeedback.ts`) är linjenivå
   (show-vs-tell, dialog-syfte, röstdrift — flaggade citat inom ETT
   kapitel), #14 är strukturnivå (eskalerar spänningen genom boken,
   sjunker mitten, betalar trådarna av sig). Att stapla Analyze-resultat
   från alla kapitel ger "99 lokala anmärkningar", inte en läsning av
   bokens form. Beslutat: helt ny prompt/schema för scen- och
   kapitelstegen, men Plotlines-taggning, Timeline-position och
   Continuity-läckor återanvänds som GRATIS grundande kontext (facit
   istället för gissning) — aldrig omvandlat till output.
3. **Manuellt startad, OK att ta tid.** Mats ville ha en synlig
   "jobbar"-indikator — visade sig redan finnas (Proofreads tre
   pulserande prickar, `proofread-pulse-dot`). Generaliserade den till
   `.pulse-dots`/`@keyframes pulse-dot` i `styles.css` (bytte namn,
   flyttade ProofreadCard.tsx:s enda användning) istället för att
   duplicera samma animation under ett missvisande proofread-scopat
   klassnamn.

Utöver det, i en separat fråga från Mats: bekräftade i kod att ett
manus utan ifylld Timeline eller tomma kapitelbriefs INTE blir svårare
— `storyTimeOrder` faller tillbaka exakt till läsordning
(`chapter.story_time_order ?? chapter.sequence_index`, se
`timeline.ts`) när Timeline aldrig rörts, och brief är en
skrivinstruktion för Draft, inte något analysen läser. Plotlines-
taggning är den enda signalen där komplettering faktiskt höjer
precisionen.

**Schema** (ny fil `developmentalSchema.ts`, mönster speglat från
`proofreadSchema.ts`): `DEVELOPMENTAL_STAGES = ["scene","chapter",
"report"]`. `SceneReadSchema` (chapterId, sceneId, function:
advance_plot|reveal_character|build_world|breather|other, tension:
rises|falls|flat, note) — ALDRIG visad för författaren, bara
mellanliggande data uppåt till kapitelsteget. `ChapterReadSchema`
(pacing: too_slow|right_pace|too_fast, tension, threads: array av
{plotlineId, status: advanced|stalled|resolved}, note). `Developmental
ReportSchema` (summary: string, concerns: array av {chapterId, note})
— det enda författaren faktiskt läser. `DevelopmentalJobSchema`
speglar `ProofreadJobSchema`s form (status/stage/done-listor/
updated_at) men enklare: inga `enabledStages`/`scopeChapterId` — en
manusbred läsning ger ingen mening scopead till ett kapitel. `Book`
fick `developmental: DevelopmentalJobSchema.optional()`.

**Kärnmodul** (ny fil `developmental.ts`): tre system-prompts
(`SCENE_READ_SYSTEM`/`CHAPTER_SYNTHESIS_SYSTEM`/`REPORT_SYSTEM`), alla
JSON-only, alla med `recoverJsonObject`-baserade parsers som faller
tillbaka säkert på okända enum-värden (aldrig kraschar på ett
missformat svar, matchar `parseSetupResult`-mönstret). Trådnamn
mappas till `plotlineId` via exakt namn-matchning mot `plotlinesForChapter`
— ett påhittat trådnamn från modellen bara droppas tyst, aldrig sparat
som en ogiltig referens. `reportUserPrompt` slår upp trådnamnen igen
från `plotlineId` för att skicka läsbara namn till sista steget, inte
interna id:n. `hasAnyTaggedThread(book)` grundar förhandsvarningen i
setup-kortet.

**Orkestrering** (ny fil `developmentalRun.ts`, speglar
`proofreadRun.ts`s struktur rakt av): `runDevelopmental` kör
`runScenes` → `runChapters` → `runReport` sekventiellt, sparar efter
VARJE scen/kapitel (inte bara efter varje steg) så en krasch eller
paus mitt i återupptas exakt där den var. `throwIfAborted`-hjälparen
dupliceras lokalt (samma fem rader som proofreadRun.ts egen,
oexporterad privat funktion där — hellre en liten duplicering än att
öppna en ny beroenderiktning för fem rader kod).

**BookStore.tsx:** `startDevelopmentalAnalysis({restart?})` speglar
`startProofread` nästan exakt (samma lås-ref-mönster, samma `reviewModel`,
samma `EXTRACTOR_MAX_TOKENS`), minus stage/scope-alternativen. Egen
`developmentalLock`-ref (separat från `proofreadLock`, de två körs
oberoende). Auto-återupptagnings-`useEffect` om jobbet var "running"
vid en sidladdning, exakt som Proofreads egen.

**UI:** `DevelopmentalSetupCard.tsx` (nytt) — inget steg-/scope-val
alls (till skillnad från `ProofreadSetupCard`), bara ett villkorligt
varningsmeddelande om `hasAnyTaggedThread(book)` är falskt. `Developmental
Card.tsx` (nytt) — tre-stegs progress-lista (återanvänder `.proofread-stages`/
`.proofread-mark`-klasserna rakt av, generiska nog), sedan BARA den
slutgiltiga rapporten (sammanfattning som styckeindelad text + en
klickbar "Worth a look"-lista som hoppar till kapitlet) — scen- och
kapitelnivå-datan visas aldrig i UI:t, exakt det ursprungliga
"aldrig rådata, alltid syntetiserat"-beslutet. Ny post i `Tools`-menyn
i `Editor.tsx`, bredvid Proofread, med samma öppna/stäng-mönster
(`dismissDevelopmental()`/`dismissProofread()` stänger varandra
ömsesidigt när den andra öppnas).

**i18n:** ny `developmental:`-namnrymd i alla tre språk, samma
nyckelform som `proofread:`s (action/setupTitle/runningTitle/
percent/now-detaljer/etc.), plus `"developmental"` tillagt i
`PromptOperation` och `aiContext.operations` (tvingat fram av
TypeScript, fångade varje ställe som behövde uppdateras, samma mönster
som `"translate"` i v1.0.95).

**Verifierat:** tsc rent, 1025 tester gröna (986 + 16 från v1.0.95 +
23 nya i `developmental.test.ts` — scen-/kapitel-/rapport-prompter och
parsers var för sig, plus tre `runDevelopmental`-orkestreringstester:
fullt lyckat lopp scen→kapitel→rapport med `brainstorm` aldrig skickat,
återupptagning som INTE kör om en redan klar scen igen, AbortError
innan ett senare steg skrivs), `npm run build` grön. Live
Playwright-verifiering: Tools-menyns nya post syns och öppnar
setup-kortet; förhandsvarningen om otaggade trådar syns med exakt rätt
text när manuset saknar Plotlines-taggning; taggade sedan kapitel 1
mot en ny tråd via Timeline-brädet (samma `TimelineBoardPanel` #33
byggde) och bekräftade live att varningen försvinner — den riktiga
UI-kopplingen till `hasAnyTaggedThread(book)`, inte bara den isolerade
funktionen. Själva scen/kapitel/rapport-AI-kedjan kunde INTE
verifieras live (ingen ansluten modell i den här sandlådan) — samma
begränsning som genomgående den här sessionen.

v1.0.96 → v1.0.97.

**Ändringslogg v1.0.97 → v1.0.98 (2026-10-14):** Smarta citattecken.
Mats: "Jag tänkte på det här med \". Kan vi lägga in så att citat
omslutna med \" får riktiga citattecken?" Byggde både löpande
konvertering (medan man skriver) och en engångs-konvertering av redan
skrivet manus, som två separata mekanismer snarare än att försöka
pressa in det i det befintliga `applyMarkerConversion`-systemet
(vars egen dokumentationskommentar faktiskt nämner "smart quotes" som
exempel) — trots ytlig likhet är operationerna olika till sin natur:
ett rakt citattecken-byte bevarar textens längd exakt (varje annat
offset — formattering, placeholders, darlings — förblir giltigt
orört), medan markör-konvertering tar bort tecken och måste
offset-förskjuta allt efteråt. Enklare att bygga separat än att böja
den befintliga maskinen för ett fall den inte är gjord för.

**Kärnlogik** (ny fil `smartQuotes.ts`, ingen DOM-koppling — ren
TypeScript i `src/core/`): `smartQuoteFor(before)` avgör öppnande (")
kontra stängande (") utifrån tecknet direkt innan — inget (textstart),
whitespace, en öppnande parentes/klammer, ett bindestreck/tankstreck,
eller ett annat öppnande citattecken (för omedelbar nästling) ger
öppnande; allt annat ger stängande. Standardheuristiken ordbehandlare
använder. `smartenQuotes(text)` kör samma logik tecken för tecken över
en hel sträng — en ren ett-till-ett-substitution.

**Löpande konvertering** (`ProseCanvas.tsx`): ny gren längst upp i den
befintliga `onKeyDown`-hanteraren, fångar `"`-tangenten innan den
befintliga Enter-hanteringen. Hittar tecknet direkt före caretten via
`currentCaretOffset`/`proseFromElement` (redan existerande hjälpare i
`proseDom.ts`, återanvända rakt av), infogar sedan rätt citattecken med
`document.execCommand("insertText", ...)` — en enklare väg än
Enter-hanteringens manuella DOM-kirurgi och syntetiska `InputEvent`,
eftersom `execCommand` för en enkel tecken-infogning redan triggar ett
riktigt input-event själv (den tyngre lösningen i Enter-fallet behövs
bara för styckedelningens strukturella komplexitet, som ett enda tecken
inte har).

**Engångskonvertering** (`BookStore.tsx`): ny `smartenManuscriptQuotes`-
action, speglar `convertMarkersToFormatting`s loop-över-kapitel-och-
flushSave-struktur men enklare (ingen offset-förskjutning behövs). Ny
sektion i `MarkerConversionCard.tsx` (samma kort som redan har
markör-konvertering) med egen knapp och resultattext, kopplad in i
`Editor.tsx`s befintliga rendering av kortet.

**Verifierat:** tsc rent, full svit 1036 tester gröna (1025 + 11 nya i
`smart-quotes.test.ts`), `npm run build` grön. Live
Playwright-verifiering av båda vägarna: skrev `"` i kapitelredigeraren
på tre positioner (mitt i mening, styckestart, efter mellanslag) och
fick korrekt öppnande/stängande kurviga citattecken varje gång; satte
sedan in råa raka citattecken programmatiskt (förbi tangent-fångsten,
för att simulera ett befintligt/importerat manus), öppnade Tools →
Convert markers, klickade "Smarten quotes in whole manuscript" och
bekräftade både att redigerarens text uppdaterades till kurviga
citattecken och att resultattexten ("Smartened quotes across 1
chapter") visades korrekt.

v1.0.97 → v1.0.98.

**Ändringslogg v1.0.98 → v1.0.99 (2026-10-14):** Guide-uppdatering,
steg 1 av 7. Mats: "Vi har lyckats skapa ett riktigt kompetent verktyg
för den som vill skriva prosa. Jag tror att vi måste uppdatera vår
Guide alternativt skapa en riktig hjälp (Wiki?)"

**Diagnos innan bygget:** `git log -L` på `handbookSections`-blocket i
`en.ts` visade att Guidens faktiska innehåll inte ändrats sedan commit
`acd05b9` vid v1.0.34 (2026-10-02) — och den commiten var själv ett
"hinn ikapp"-jobb. Vi är nu vid v1.0.98 (2026-10-14): 12 dagar, 64
versioner utan en enda guide-uppdatering. En genomgång av CHANGELOG
`### Added` sedan v1.0.34 gav 25 helt nya funktioner utan någon
guide-text, plus flera strukturella UI-omflyttningar (Settings → stor
dialog, Ask Manuscript → dialog, verktygsraden → File/Tools-menyer)
som riskerar göra befintlig text missvisande, inte bara ofullständig.
Sammanställdes till en prioriterad lista, kategori för kategori
(samma 8 kategorier Guiden redan har), med Mats beslut: "Vi måste
fixa allt... ta det i den ordning som du tror blir bäst." Planerad
ordning: kategori för kategori nerifrån (Story Bible & World →
Writing → Revise → Images/Publishing/Backup → Help), med
översiktssektionerna (kartan, "which tool do I need", de tre
arbetsflödena) sist, eftersom de ska peka på allt det andra och bara
kan skrivas rätt när det finns att peka på.

**Steg 1: Story Bible & World.** Fyra nya sektioner, inga tidigare
dokumenterade (alla fyra källfunktioner skeppades EFTER v1.0.34, så
det är inte bara eftersläpning utan rena luckor):
- **Chapter summary** (kategori Plan the Story, inte Story Bible —
  hör ihop med `chapter-briefs` som syskon-fält, inte med Story
  Bible-fakta): Brief = vad kapitlet ska göra (skriven innan),
  Summary = vad det faktiskt gjorde (skriven efter, matar senare
  kapitels Draft/Extend/Elaborate/Beat i story-time-ordning).
- **Aliases and exclusion phrases**: alias löser "samma karaktär,
  olika namn i texten" (Em/Emma), exclusion phrases löser "namnet är
  också ett vanligt ord" (Rose/rosenträdgård).
- **Merge Story Bible cards**: två kort som visar sig vara samma sak
  (Kael/Kaptenen) — inget raderas, konfliktvärden väljs manuellt,
  gamla namn blir alias. Nämner också att samma sammanslagning
  fungerar direkt från granskningskön på väntande Extract
  facts-förslag, inte bara på redan låsta kort.
- **Edit vs. Update a fact**: skillnaden mellan att RÄTTA ett
  misstag (Edit, ingen historik) och att REGISTRERA en förändring i
  berättelsen (Update, ankrad till ett kapitel, gammalt värde kvar i
  History) — Identity-fakta får bara Edit.

Nya sektions-id:n registrerade i `HANDBOOK_SECTION_IDS`/
`HANDBOOK_SECTION_CATEGORY` (`HandbookPanel.tsx`), innehåll skrivet
för hand på alla tre språk (inte maskinöversatt) i samma ton och
med samma återkommande exempel-karaktärer (Nora/Erik/Elias) som
Guidens befintliga text.

**Verifierat:** tsc rent, full svit 1036 tester gröna (inga nya
tester behövdes — i18n-innehåll, inte logik), `npm run build` grön.
Live Playwright-verifiering: öppnade Guiden, klickade till kategori 3
(Plan the Story) och 4 (Story Bible & World), bekräftade att alla
fyra nya sektioner syns under rätt kategori med rätt numrering
(4.1–4.4).

v1.0.98 → v1.0.99. Återstår: Writing, Revise, Images/Publishing/
Backup, citattecken-FAQ:n (som nu delvis är inaktuell sedan Smarta
citattecken v1.0.98), mindre uppdateringar, och översiktssektionerna
sist.

**Ändringslogg v1.0.99 → v1.0.100 (2026-10-14):** Guide-uppdatering,
steg 2 av 7: Writing-kategorin. Fyra nya sektioner:
- **Attached context**: skillnaden mot Story Bible förklarad konkret
  — fakta ("ett övergivet fyrtorn") vs. den faktiska prosan ett
  tidigare kapitel/en scen faktiskt målades upp med, när det exakta
  ordvalet spelar roll.
- **Darlings**: "döda dina älsklingar, behåll kropparna" — Cut to
  Darlings, en bokgemensam hylla, återställ eller kasta för gott.
- **Placeholders**: högerklicksmarkör mitt i skrivandet, pricken i
  kapitellistan, panelen som listar alla öppna, kopplingen till att
  Proofread nu varnar om en är öppen.
- **Smart quotes**: kort sektion, pekar på både den löpande
  konverteringen och Tools → Convert markers →
  "Smarten quotes in whole manuscript".

Placerades i Guidens befintliga ordning: `attached-context` efter
`write-with-ai`, `darlings`/`placeholders` efter `ai-not-autopilot`,
`smart-quotes` efter `author-voice` (sist i kategorin, innan
`analyze-chapter` som inleder Revise). Samma mönster som steg 1: nya
sektions-id:n i `HANDBOOK_SECTION_IDS`/`HANDBOOK_SECTION_CATEGORY`,
innehåll skrivet för hand på alla tre språk.

**Verifierat:** tsc rent, 1036 tester gröna, `npm run build` grön.
Live Playwright: öppnade Guiden, klickade kategori 5 (Writing),
bekräftade att alla fyra nya sektioner syns.

v1.0.99 → v1.0.100. Återstår: Revise, Images/Publishing/Backup,
citattecken-FAQ:n, mindre uppdateringar, översiktssektionerna.

**Ändringslogg v1.0.100 → v1.0.101 (2026-10-14):** Guide-uppdatering,
steg 3 av 7: Revise-kategorin. Två nya sektioner plus en uppdatering:
- **Polish**: placerad direkt efter Analyze (samma kapitel-nivå-par —
  Analyze pekar bara ut, Polish skriver om), förklarar
  före/efter-jämförelsen och att inget rör kapitlet förrän man
  accepterar.
- **Developmental analysis**: placerad direkt efter Proofread (samma
  manus-brett-par — Proofread läser radnivå, Developmental läser
  formen), nämner tre-stegsprocessen, att den är manuellt startad,
  och att bara slutrapporten någonsin visas.
- **Proofread** uppdaterad: "stort till smått"-kedjan utökad med
  Developmental analysis och Polish, och texten namnger nu konkret de
  sju kontrollerna (grammatik, upprepade scener, stil/stämning,
  ålder, kontinuitet, upplägg/betalningar, faktakontroll) samt
  platshållarvarningen — allt sådant som fanns i produkten men aldrig
  i guide-texten.

Samma mönster: nya id:n i `HANDBOOK_SECTION_IDS`/
`HANDBOOK_SECTION_CATEGORY`, innehåll för hand på alla tre språk.

**Verifierat:** tsc rent, 1036 tester gröna, `npm run build` grön.
Live Playwright: kategori 6 (Revise) visar både Polish och
Developmental analysis.

v1.0.100 → v1.0.101. Återstår: Images/Publishing/Backup,
citattecken-FAQ:n, mindre uppdateringar, översiktssektionerna.

**Ändringslogg v1.0.101 → v1.0.102 (2026-10-14):** Guide-uppdatering,
steg 4 av 7: Images, Publishing & Backup-kategorin. Två nya
sektioner, två uppdaterade:
- **Typography** (ny, placerad efter Images and illustrations):
  samlar Font (13 typsnitt), Weight, Color, Drop cap och de fyra
  dekorativa Scene break-ornamenten under en rubrik — allihop
  funktioner som redan fanns men aldrig haft någon guide-text alls.
- **Language versions of a manuscript** (ny, placerad före Publish):
  språkväxlaren, länkade tomma kapitel, Translate chapter som för med
  sig Story Bible och Röst, "Source changed"-flaggan med diff, och
  tredje modellvalet (Translate) i Settings → AI settings.
- **Publish** uppdaterad: nämner nu Paragraph style-valet (tom rad vs.
  indragen klassisk bokstil).
- **Backup** uppdaterad: förklarar "Export for other apps"/StoryCore
  som en TREDJE sak, varken backup eller läskopia — ett ögonblicks-
  format för syskonappar som ComicBook AI, samma synlighetsregel som
  Draft använder.

**Verifierat:** tsc rent, 1036 tester gröna, `npm run build` grön.
Live Playwright: kategori 7 visar Typography, Language versions,
Paragraph style-omnämnandet i Publish och Export for other apps-
omnämnandet i Backup.

v1.0.101 → v1.0.102. Återstår: citattecken-FAQ:n, mindre
uppdateringar, översiktssektionerna sist.

**Ändringslogg v1.0.102 → v1.0.103 (2026-10-14):** Guide-uppdatering,
steg 5 av 7: skrev om `marker-conversion-no-match`-FAQ:n.
Ursprungstexten handlade uteslutande om att citattecken i manuset
kanske inte matchar exakt tecken i Convert markers-fälten — ett
problem Smarta citattecken (v1.0.98) nu löser automatiskt i de
flesta fall. Ny text leder med en pekare till Smart quotes-sektionen
(Skriva) för just citattecken-fallet, och behåller
kopiera-klistra-lösningen för allt annat Convert markers hanterar
(asterisker, egna par). Ingen ny sektion, bara en omskrivning — inga
ändringar i `HandbookPanel.tsx`.

**Verifierat:** tsc rent, 1036 tester gröna, `npm run build` grön.
Live Playwright: kategori 8 (Help) visar den omskrivna texten.

v1.0.102 → v1.0.103. Återstår: mindre uppdateringar
(scenes-sektionen m.fl.) och översiktssektionerna sist.

**Ändringslogg v1.0.103 → v1.0.104 (2026-10-14):** Guide-uppdatering,
steg 6 av 7: mindre uppdateringar. Ny **Connection presets**-sektion
i Getting Started (placerad direkt efter Connect a local AI, eftersom
den är en förlängning av samma anslutningsflöde). **Scenes**-sektionen
(Plan the Story) utökad med en mening om "Create scene" från en
textmarkering som alternativ till "Split into two…".
**most-important-principle** lämnades medvetet orörd — flaggades som
lägst prioritet i den ursprungliga genomgången ("inget akut") och
tillför inget konkret att uppdatera den med just nu.

**Verifierat:** tsc rent, 1036 tester gröna, `npm run build` grön.
Live Playwright: kategori 1 visar Connection presets, kategori 3
visar Create scene-meningen i Scenes.

v1.0.103 → v1.0.104. Återstår: översiktssektionerna
(map-of-storybook-ai, which-tool-do-i-need, three-workflows) — sista
steget, nu när allt de ska peka på faktiskt finns.

**Ändringslogg v1.0.104 → v1.0.105 (2026-10-14):** Guide-uppdatering,
steg 7 av 7 (sista steget). De tre översiktssektionerna uppdaterade
nu när allt de refererar till faktiskt finns att peka på:
- **map-of-storybook-ai** (kartan): GRANSKA-raden fick ✨ Polish och
  🧭 Developmental analysis, FÄRDIGSTÄLL-raden fick 🌐 Språkversioner
  — medvetet INGA av de mindre granulära funktionerna (Attached
  context, Darlings, Placeholders, Smart quotes, Merge cards) lades
  till, eftersom kartan är tänkt att vara grov/kategorinivå, inte en
  fullständig funktionslista; de hör hemma i den detaljerade guiden
  under, inte på kartan.
- **three-workflows**: "Analysera → Korrekturläs" utökades till
  "Analysera → Polish → Korrekturläs" i alla tre flöden;
  "Developmental analysis" lades bara till i det tredje, mest
  strukturerade flödet ("Jag vill planera mycket") — ett medvetet val
  eftersom Developmental analysis drar störst nytta av just den
  nivån av Plotlines/Timeline-ifyllnad som det flödet redan bygger
  upp, enligt samma grundande-princip som beskrevs vid #14:s bygge
  (v1.0.97).
- **which-tool-do-i-need**: sex nya rader (Attached context, Darlings,
  Placeholders, Polish, Developmental analysis, Språkversioner)
  insprängda på rätt plats i den befintliga problem→verktyg-listan.
  Samtidigt uppdaterades den gamla Proofread-raden ("jag vill putsa
  texten" → Korrekturläs), som blivit missvisande sedan Polish fick
  sin egen identitet som DET verktyg som faktiskt skriver om prosan
  — Proofread-raden omformulerad till att handla om en sista
  radgranskning istället.

**Verifierat:** tsc rent, 1036 tester gröna, `npm run build` grön.
Live Playwright: kategori 2 (How You Can Work) visar alla sex nya
termer i de uppdaterade översiktssektionerna.

v1.0.104 → v1.0.105. **Hela sjustegsgenomgången klar.** Guidens
innehåll är nu i linje med produkten igen efter att ha legat 64
versioner (v1.0.34 → v1.0.98) efter. Nästa gång det här får hända
igen bör vi fånga det tidigare — se separat anteckning i
roadmap-ideas.md om rutinen framåt.

**Ändringslogg v1.0.105 → v1.0.106 (2026-10-14):** Formatteringsfidelitet
i Publish-export. Mats bad om en IDML-export (se roadmap-ideas.md
#49) med ComicBook AI nämnt som referens — repot lades till i
sessionen, genomsökt grundligt (idml/InDesign/icml: noll träffar;
`PROJECT_SPEC.md` §11 listar bara PNG/PDF/CBZ, PNG/PDF själv ett
ännu obockat "Fas 6"). Mats bekräftade: bygg från grunden, inget att
återanvända.

**Ett fynd innan IDML-bygget ens började:** genomgång av
`manuscriptExport.ts` (1167 rader, alla sju exportformat) visade att
`chapter.formatting` (fet/kursiv/understruket, satt i editorn) ALDRIG
lästes av exporten — `ManuscriptExportChapter` hade inget
formatting-fält alls, varje paragraf-renderare körde `xmlEscape`
direkt på ren text. Fet/kursiv/understruket har alltså tystat
försvunnit ur RTF/ODT/HTML/ePub/PDF hela tiden, inte bara en
framtida brist i en ny IDML-export. Mats bekräftade: fixa detta
delat av alla format FÖRST, innan IDML byggs ovanpå samma
bristfälliga grund.

**Lösningen krävde förvånansvärt lite ny kod** — `proseFlow.ts` hade
redan `splitFlowParagraphsWithOffsets` (paragrafdelning med
offset-spårning, dokumenterad som exakt "as long as text is already
in the joined form... true for any chapter.prose that has passed
through the canvas") och `proseFormatting.ts` hade redan
`formattingSegments` (samma motor proseFlow.ts:s egen live HTML-
renderare `htmlFromProse` redan använder internt). Export behövde
bara koppla in dem, inte uppfinna dem.

**Designval, avgjorda innan kodningen:**
1. **Formatering beräknas mot RAW `chapter.prose`, inte den peelade
   `exportProse()`-versionen.** `manuscriptFromModel` (BookStore.tsx)
   kör redan `peelModelAsides` när en AI-text accepteras in i
   `chapter.prose` — peeling vid export är alltså en defensiv
   no-op i det normala fallet, inte huvudmekanismen. Ett nytt
   `rawProse`-fält lades till `ManuscriptExportChapter` vid sidan av
   det befintliga `prose` (som MD/TXT fortfarande använder oförändrat)
   — sidosteg hela frågan om hur peeling skulle förskjuta
   formateringsoffsets, istället för att försöka lösa den.
2. **Kursiv hoppas medvetet över i PDF.** PDF ritas av appens egen
   pdf-lib-kod (inga fonter från läsarens dator) och har bara
   Regular+Bold inbäddat per typsnitt — ingen Italic-fil för något av
   de 13 typsnitten. Fet (byt till redan inbäddad Bold-font) och
   understrykning (en ritad linje) löstes fullt ut. Mats bekräftade
   via fråga: hoppa över kursiv i PDF snarare än att skaffa
   Italic/Bold Italic-fontfiler för alla 13 typsnitt nu — samma
   "olika trohet per format"-mönster scenbrytare/anfang redan
   etablerat, tydligt dokumenterat i koden.

**Delad hjälpfunktion** `formattedRuns(text, offset, formatting)` i
`manuscriptExport.ts`: slår `formattingSegments` och slicear ut
`{text, styles}`-körningar. Varje rikt format kallar den en gång per
paragraf (PDF: en gång per redan radbruten rad, se nedan).

**Per format:**
- **HTML/ePub** (`htmlParagraphs`, delad av båda): bytte
  `splitFlowParagraphs`→`splitFlowParagraphsWithOffsets` (indragen
  stil) och en ny `splitLinesWithOffsets` (spaced-stilen, som aldrig
  kollapsat radbrytningar och därför behövde sin egen
  offset-bevarande variant). Återanvänder `wrapStyles` från
  proseFlow.ts (nu exporterad) för `<b>/<i>/<u>`-nästling.
- **RTF** (`rtfBlock`): samma offset-delning, ny `rtfRun` slår in
  varje körning i en egen `{...}`-grupp med `\b`/`\i`/`\ul` så inget
  läcker till nästa körning.
- **ODT** (`odtProse`): samma offset-delning, ny `odtRun` slår in
  körningar i `<text:span text:style-name="...">`. Sju nya
  `style:family="text"`-stilar i `odtStyles()` (Bold/Italic/
  Underline och de fyra kombinationerna) täcker varje möjlig
  bold/italic/underline-kombination.
- **PDF** (`PdfWriter.prose`): den enda riktiga nykodningen. Ny
  `wrapWithOffsets` (radbrytning som `wrap()` redan gjorde, men
  behåller varje radas [start,end) in i källtexten) + ny
  `drawStyledLine` som ritar en redan radbruten rad körning för
  körning, byter till `this.bold`-fonten och ritar en manuell linje
  under för underline. Radbrytningens bredd mäts alltid i
  kroppsfonten (ett dokumenterat, accepterat närmevärde — en lång fet
  körning nära marginalen kan i sällsynta fall sticka ut en aning).

**Verifierat:** tsc rent, full svit 1043 tester gröna (1036 + 7 nya i
`manuscript-export.test.ts`s nya "formatting fidelity"-block —
HTML/ePub-nästling, RTF-gruppering, ODT-spans + stilar, indragen
stil, PDF kraschar inte, tomt formatting oförändrat beteende). `npm
run build` grön. Live Playwright, den riktiga vägen genom UI:t (inte
bara enhetstester): skapade ett manus, markerade "locked" i
"Emma locked the door." via en exakt DOM Range, Ctrl+B,
bekräftade `<p>Emma <b>locked</b> the door.</p>` i editorn direkt;
exporterade sedan HTML/RTF/ODT/PDF genom den riktiga Publish-dialogen
(format-select, riktig nedladdning via Playwrights `download`-event)
och bekräftade `<b>locked</b>` i HTML, `{\b locked}` i RTF,
`<text:span text:style-name="Bold">locked</text:span>` + den
matchande stildefinitionen i ODT:ns uppackade `styles.xml`, och en
giltig PDF-fil.

v1.0.105 → v1.0.106. Grunden för IDML-exporten är nu korrekt —
nästa steg är IDML-formatet självt.

**Ändringslogg v1.0.106 → v1.0.107 (2026-10-14):** IDML-exporten
själv (roadmap-ideas.md #49, delsteg 2 av 2). Byggd helt från grunden
i `manuscriptExport.ts`, samma fil och samma `zipStore`-mönster som
ODT/ePub redan använder.

**Designbeslut, medvetet enkla för v1:**
- **Ett textblock per kapitel, ingen trådning mellan sidor.** Varje
  kapitel får en EGEN, generöst hög sida (`estimateChapterPageHeight`:
  uppskattad från teckenantal vid en konservativ tecken-per-rad-siffra
  för en 324pt-bred spalt vid 12pt, gånger en säkerhetsfaktor på 1.5,
  inklämd mellan 400pt och 14000pt). Medvetet val: en underskattning
  skulle TYST klippa bort text i InDesign (ett litet overflow-märke
  man lätt missar), medan en överskattning bara ger tomt utrymme
  längst ner på sidan — något en författare som flödar om i InDesign
  ändå åtgärdar först av allt. Ingen äkta flerspaltspaginering i v1;
  InDesign-författaren gör den riktiga sidlayouten själv.
- **Ingen MasterSpread tillämpas på någon riktig sida**
  (`AppliedMaster="n"` genomgående) — paketet innehåller en nästan
  tom MasterSpread bara för strukturell fullständighet, inget att få
  fel på eftersom inget sitter på den.
- **Tecken-formatering som lokala overrides, inte namngivna
  CharacterStyle-resurser.** `idmlRun` sätter `FontStyle`/`Underline`
  direkt på varje `<CharacterStyleRange>` mot den reserverade "no
  character style" — enklare än ODT:s sju namngivna stilar, eftersom
  IDML tillåter det och slipper hålla Styles.xml i synk.
- **`bodyColor` bärs INTE in i IDML**, till skillnad från alla andra
  format — ett tryck-layout-dokuments färg är författarens eget beslut
  att göra i InDesign, inte något värt att gissa en swatch för här.

**Paragraf-end-tecknet** (`&#13;`) är en explicit XML-teckenreferens,
inte en rå \r-byte — XML 1.0-specen kräver att parsrar normaliserar
bort rena \r/\r\n-tecken vid inläsning om de inte är escapade som en
teckenreferens, så en rå byte hade tyst försvunnit.

**Återanvänder samma delade plumbing som v1.0.106 byggde**
(`formattedRuns`, `splitFlowParagraphsWithOffsets`,
`splitLinesWithOffsets`) rakt av — samma HR_BLOCK-scenbrytdetektion,
samma spaced/indented-uppdelning som RTF/ODT/HTML redan har.

**Ärlig begränsning, sagd rakt ut till Mats:** till skillnad från
varje annat format i den här filen kunde den här INTE verifieras
genom att faktiskt öppnas i InDesign — inte tillgängligt i den här
miljön, samma sorts lucka som en AI-kedja ingen kan köra end-to-end
utan en ansluten modell. Vad som ÄR verifierat: zippen är giltig,
varje XML-fil är well-formed (ett eget litet tagg-balans-test, ingen
riktig XML-validator fanns tillgänglig i Node utan att lägga till ett
nytt beroende), och varje Self/src-korsreferens i designmap.xml
pekar på något paketet faktiskt innehåller. Mats bör öppna den
första riktiga exporten i InDesign och rapportera tillbaka vad som
eventuellt behöver rättas.

**Verifierat:** tsc rent, full svit 1049 tester gröna (1043 + 6 nya i
en ny "IDML export"-testgrupp: giltig zip med mimetype först,
well-formed XML + brainstorm uteslutet, en Spread+Story per kapitel
korrekt refererade från designmap.xml, fet formatering som ett lokalt
FontStyle-override i Story-XML:en, Story Bible-sidan bara när det
finns låsta fakta, MasterSpread aldrig tillämpad). `npm run build`
grön. Live Playwright, den riktiga vägen genom UI:t: skapade ett
manus, satte "locked" i fetstil via Ctrl+B, exporterade IDML genom
den riktiga Publish-dialogen (nytt "IDML (InDesign)"-alternativ i
format-väljaren), bekräftade med systemets egen `unzip` (oberoende av
testernas egen packare) att zippen är giltig, att
`Content>locked</Content` sitter i en `CharacterStyleRange
FontStyle="Bold"`, och att designmap.xml/container.xml/mimetype ser
strukturellt rätt ut.

v1.0.106 → v1.0.107. **Hela #49 klar från StoryBook AI:s sida** —
återstår bara Mats verkliga InDesign-test.

**Ändringslogg v1.0.107 → v1.0.108 (2026-10-15):** IDML-exporten
rättad efter Mats första riktiga test. Mats: "Gick inte att öppna i
Affinity (som har stöd för IDML) eller i InDesign. En fungerande
funktion finns i ComicbookAI, vet inte varför du inte kunde hitta
den" — med en skärmdump av ComicBook AI:s egen Export-dialog, som
faktiskt visar ett "IDML — InDesign / Affinity (beta)"-alternativ.

**Redde ut missförståndet först:** `git fetch` på det bifogade
ComicBook AI-repot visade 121 nya commits sedan den ursprungliga
klonen i den här sessionen — `git log` bekräftar att IDML-exporten
(`src/idmlExport.ts`) lades till i commit `b388e4f`, 2026-10-08,
MEDAN den ursprungliga sessionsklonen var fastlåst vid commit
`288a066` från 2026-10-03, fem dagar INNAN funktionen fanns.
Researchen tidigare i sessionen var korrekt för ögonblicksbilden den
hade — marken flyttade sig bara under den, eftersom `add_repo`s
grunda klon aldrig uppdaterades automatiskt när ComicBook AI-repot
fortsatte utvecklas parallellt.

**Men ComicBook AI:s egen IDML-export öppnades INTE heller för
Mats** — den är uttryckligen märkt "(beta)" i deras egen UI, med en
README full av "Current limitations". Så det här var aldrig ett
fall av att kopiera en bevisat fungerande referens, utan att läsa en
mer välinformerad (men själv obekräftad) implementation för att hitta
konkreta, verifierbara standardfel i min egen.

**Tre verkliga buggar hittade genom jämförelse, alla rättade:**
1. **`META-INF/container.xml` hade fel namnrymd och fel
   attributnamn.** Min version använde en påhittad
   `http://ns.adobe.com/AdobeInDesign/container/schema/1.0/`-namnrymd
   med `path`-attributet. ComicBook AI:s version (och den faktiska
   OCF-konventionen IDML:s paketering bygger på, samma mönster som
   andra OCF-baserade format) använder
   `urn:oasis:names:tc:opendocument:xmlns:container` med
   `full-path`/`media-type`-attribut. Det här är den FÖRSTA filen en
   IDML-läsare öppnar för att ens hitta resten av paketet — fel här
   kan göra att hela paketet aldrig hittas, oavsett hur korrekt allt
   annat är.
2. **designmap.xml saknade InDesigns egen
   `<?aid style="50" type="document" readerVersion="6.0"
   featureSet="257"?>`-processinstruktion**, som satt direkt efter
   XML-deklarationen i den fungerande referensen — ett paketmärke
   riktiga IDML-filer bär.
3. **Fel attributnamn-casing (`zeroPoint` istället för `ZeroPoint`)
   och en påhittad default-xmlns på `<Document>`-elementet** som
   referensen inte hade — bara `xmlns:idPkg` ska finnas där, inga
   av `<Document>`s egna barn (Spread/Story-referenser) ska sitta i
   någon namnrymd alls.

Lade också till `Intent="PrintIntent"` på DocumentPreference (fanns i
referensen, saknades i min), och tog bort den oanvända
`Resources/Tags.xml`-referensen helt — ComicBook AI:s fungerande
mönster behöver den aldrig, en osäkerhet mindre.

**Verifierat starkare än tidigare:** utöver tsc/testsvit/build körde
jag nu `xmllint --noout` (en riktig XML-parser, inte bara min egen
tagg-balans-approximation) på VARJE XML-fil i en riktig export genom
UI:t — alla godkända rent. `mimetype`-filen flaggas korrekt som
"inte XML" av xmllint (den är avsiktligt ren text, inte ett fel).

**Fortfarande kvar: InDesign-öppningstestet självt.** Jag har
fortfarande ingen InDesign/Affinity i den här miljön. De tre
rättningarna är standardbaserade, inte gissningar, men jag kan inte
bekräfta att paketet faktiskt öppnas förrän Mats testar igen. Om det
fortfarande inte går: det exakta felmeddelandet InDesign/Affinity
visar (inte bara "gick inte att öppna") är nästa sak att få, eftersom
det avgör om problemet sitter i paketstrukturen (det här lagret) eller
djupare i geometrin/stilarna.

v1.0.107 → v1.0.108.

**Ändringslogg v1.0.108 → v1.0.109 (2026-10-15):** IDML-exporten
rättad efter Mats andra riktiga test. Paketeringen från v1.0.108
fungerade — filerna öppnades nu i både Affinity och InDesign — men
Mats rapporterade: "Affinity kunde öppna IDML-filen men dokumentet
hade ingen text och siddimensionerna var konstiga. Affinity hittade
16 sidor. Indesign kunde öppna dokumentet men hade samma konstiga
sidformat men hittade 31 sidor. På sidan 29 fanns en pytteliten
textyta med kapitel 13 från boken." — med en skärmdump av InDesigns
Document Setup-dialog som visade en sidhöjd på 6639,2pt.

**Grundorsaken:** varje sida (titelsida, varje kapitel, Story
Bible-sidan) fick sin egen, individuellt uträknade `GeometricBounds`-
höjd — precis så hög som behövdes för just den sidans innehåll, inget
mer. Men InDesign och Affinity förväntar sig enhetlig sidgeometri
genom hela dokumentet, och litar inte på enskilda sidors
`GeometricBounds` när de varierar sida till sida — istället
flödar de om hela dokumentet till en egen uträknad standardstorlek,
vilket desynkar textramarnas placering från de faktiska sidorna. Det
förklarar både den konstiga enhetliga sidhöjden (InDesign/Affinity
räknade själva ut en, ignorerade mina olika per-sida-värden) och den
nästan helt saknade texten (textramarna hamnade på fel ställe relativt
de omflutna sidorna).

**Jämförelse med ComicBook AI:s egen (också obeta/obekräftad)
`idmlExport.ts` bekräftade riktningen**: den räknar ut sidbredd/höjd
EN gång, utanför sin per-sida-loop, och återanvänder samma värde för
varje sida i hela dokumentet — aldrig en egen höjd per sida.

**Rättningen i `src/core/manuscriptExport.ts`:** `packIdml` byggdes
om till två faser. Först samlas allt sidinnehåll (titel, varje
kapitel, Story Bible) i en lista med `{label, paragraphsXml,
neededHeight}` utan att bygga XML än. Sedan räknas EN gemensam
`pageHeight = Math.max(IDML_MIN_CHAPTER_HEIGHT, ...alla
neededHeight)` ut — den högsta sidan boken behöver. Först därefter
byggs varje Spread/Story-fil, och alla använder samma `pageHeight`.
`idmlPreferencesXml` (dokumentets `DocumentPreference
PageHeight`-attribut, exakt det fält Mats skärmdump visade) fick också
samma delade värde istället för den gamla hårdkodade
titelsidekonstanten.

**Accepterad avvägning:** ett kort kapitel får nu mer tomrum under
texten på sin sida än tidigare, eftersom alla sidor delar den enda
högsta sidans höjd. Det är en medveten konsekvens av enhetlig
sidstorlek, inte en ny bugg — värt att nämna till Mats eftersom det är
en synlig beteendeförändring.

**Verifiering:** ny test i `tests/core/manuscript-export.test.ts`
("gives every real page the same GeometricBounds height, matching
Preferences.xml") som läser höjdvärdet ur varje Spread-fils
`GeometricBounds` och bekräftar att de alla är identiska och matchar
`Resources/Preferences.xml`s `PageHeight`. Hela testsviten (1050 test,
79 filer), `tsc --noEmit` och `npm run build` kördes rent. Gjorde
också en riktig export genom UI:t igen (samma Playwright-flöde som
v1.0.108), körde `xmllint --noout` på varje XML-fil i resultatet —
alla godkända — och läste ut `GeometricBounds`/`PageHeight` direkt ur
den extraherade zippen: titelsidan och kapitel 1 delade exakt samma
höjd (720pt för det korta testmanuset), vilket matchade
Preferences.xml.

**Fortfarande kvar: InDesign/Affinity-öppningstestet självt.** Samma
begränsning som tidigare — jag kan inte själv öppna resultatet i
InDesign eller Affinity i den här miljön. Rättningen är
standardbaserad (bekräftad mot ComicBook AI:s mönster) och grundorsaks-
diagnosticerad från Mats exakta symptombeskrivning, inte en gissning,
men väntar fortfarande på ett tredje riktigt test för att bekräftas.

v1.0.108 → v1.0.109.

**Ändringslogg v1.0.109 → v1.0.110 (2026-10-15):** Sidstorlek/marginal
som riktig inställning, och IDML-exporten flödar nu text över flera
sidor istället för en enda jättehög sida per kapitel.

**Bakgrund.** Efter v1.0.109-fixen (enhetlig sidhöjd) frågade Mats:
"Sidhöjd morde sättas i Settings, t ex A4 eller Letter. Även
marginaler. Fixar vi att flöda texten till nästa sida?" — och, efter
att jag föreslog att göra det till en delad inställning för IDML/PDF/
ODT: "Det låter rätt. men ska sidformatet så ska det påverka
skrivytans format? Då blir det ännu mer WYSIWYG". Jag förklarade
skillnaden mellan en billig "skrivytans bredd följer sidans
proportioner"-variant och en dyr "riktiga sidbrytningar i editorn"-
variant, och Mats valde den billiga: "Kör den enkla versionen. Om man
verkligen ska jobba med manuskriptets utformning så blir det via
InDesign eller Affinity i vilket fall".

**Ny BookSchema-inställning:** `page_size` ("a4" | "letter" | "6x9",
default "6x9") och `page_margin` ("narrow" | "normal" | "wide",
default "normal") — fjärde och femte biten av Typography, samma
redigerare-plus-export-koppling som Font/Vikt/Färg/Drop cap/Scene
break. "6x9" (pocketbok/trade-trim) vald som default istället för ett
vanligt pappersformat, eftersom appens exporter är manus på väg mot en
bok, inte kontorsdokument.

**Delad sidgeometri i `manuscriptExport.ts`:** nya `PAGE_SIZES`
(punkter: a4 595.28×841.89, letter 612×792, 6x9 432×648) och
`PAGE_MARGINS` (narrow 36pt/0.5in, normal 54pt/0.75in — samma som
IDML:s gamla fasta marginal, wide 72pt/1in) uppslagstabeller.
`ManuscriptExport` fick nya fält `pageWidth`/`pageHeight`/`margin`,
uträknade en gång i `buildManuscriptExport` från bokens
`page_size`/`page_margin` — alla tre format läser från `doc`, exakt
samma mönster som `dropCapLines`/`sceneBreakStyle` redan använder,
så INGA nya parametrar behövdes i Editor.tsx:s anropsplatser.

**PDF:** hade redan en fast sidstorlek (A4 595.28×841.89pt, 56pt
marginal) hårdkodad direkt i koden — okänt för Mats tills han frågade
"gäller inte sidstorlek och marginal även för ODF och PDF?". `PdfWriter`-
klassen byggdes om från modulkonstanter (`PDF_PAGE_WIDTH` osv) till
instansfält satta i konstruktorn, så varje export nu respekterar
bokens egna värden istället för den gamla hårdkodningen.

**ODT:** hade tidigare INGEN sidstorlek alls i filen — ärvde vad
Word/LibreOffice råkade ha som standard (ofta A4 i Sverige, Letter i
USA). Lade till en riktig `style:page-layout`/`style:master-page` i
styles.xml (ODF:s egen konvention för sidgeometri), parametriserad
från samma `pageWidth`/`pageHeight`/`margin`.

**IDML: riktig flödning, inte bara enhetlig höjd.** Det här var den
faktiska lösningen på "Fixar vi att flöda texten till nästa sida?" —
och visade sig vara enklare än väntat. IDML-sidor behöver inte
innehålla exakt rätt text i förväg: InDesign/Affinity räknar själva ut
den riktiga rad-för-rad-textflödningen när filen öppnas, med sin egen
fontmotor (som den här webbappen aldrig har tillgång till). Så istället
för att denna kod gissar exakta radbrytningar räcker det att skapa
TILLRÄCKLIGT MÅNGA sidor och TRÅDA IHOP dem — `PreviousTextFrame`/
`NextTextFrame`-attribut som länkar flera `<TextFrame>` på olika sidor
till SAMMA `<Story>`, så InDesign/Affinity flödar texten mellan dem
automatiskt, precis som en riktig bokslayout.

Konkret: `packIdml` byggdes om från "en höjd-uppskattning per kapitel"
(`estimateChapterPageHeight`, borttagen) till en "sidantal-uppskattning
per kapitel" (`estimateChapterPageCount`) — samma teckenräknings-
metod och säkerhetsmarginal (1.5x) som tidigare, plus EN extra
buffertsida ovanpå det, eftersom en underskattning tyst skulle klippa
bort text (det enda utfallet värt att undvika; en överskattning lämnar
bara en tom sida sist, kosmetiskt). Varje kapitel/Story Bible-sida får
nu EN delad `<Story>`-fil (inte en per sida) och lika många
`<TextFrame>`-sidor som uppskattningen kräver, kedjade ihop. Alla
sidor i hela dokumentet delar nu samma FASTA storlek (den valda
sidstorleken ovan) istället för den gamla "högsta sidan boken behöver"-
uppskattningen från v1.0.109 — mer robust och verklighetstroget, eftersom
riktiga InDesign-dokument faktiskt har en fast sidstorlek rakt igenom.

**Skrivytans bredd (den "enkla" WYSIWYG-varianten Mats valde):**
`ProseCanvas.tsx` skalar nu `.prose-wrap`s `max-width` proportionellt
mot vald sidstorlek/marginal — INGEN riktig sidindelning (skrivytan
rullar fortfarande som en enda sammanhängande kolumn), bara en
närmare förhandsvisning än en fast bredd oavsett sidval. 504pt
(US Letter minus två "normal"-marginaler) är fastnaglad till kolumnens
gamla 54rem-bredd, så standardkombinationen (6x9/normal numera,
tidigare implicit Letter-liknande) renderas likadant som innan —
en smalare trim (6x9) eller bredare marginal krymper kolumnen
proportionellt istället.

**Bieffekt hittad och fixad under Playwright-verifieringen:** Settings-
panelens Typography-sektion (`.settings-card .craft-fields`, flexbox
med `min-width: 8rem` per fält) klämde ihop för många fält per rad när
Page size/Page margin lades till — "SCENE BREAK"s två-ords etikett
radbröts och överlappade visuellt fältet under. Höjde `min-width` till
9.5rem, vilket ger 3 fält per rad istället för 4 vid samma panelbredd;
bekräftat fixat med en ny skärmdump.

**Verifiering:** två nya testbeskrivningar i
`tests/core/manuscript-export.test.ts` — "page size" (default 6x9/
normal och en explicit A4/wide-kombination, kontrollerat i alla tre
format: PDF:s riktiga sidstorlek via pdf-lib, ODT:s
`style:page-layout`-attribut, IDML:s `Preferences.xml`) och en ny IDML-
tråndningstest ("threads a multi-page chapter's TextFrames together on
one shared Story") som bygger ett långt kapitel, hittar dess Story, och
verifierar att `PreviousTextFrame`/`NextTextFrame`-kedjan är korrekt
länkad från "n" genom varje mellanliggande sida till "n" igen. Den
gamla "en Spread/Story per kapitel"-testen uppdaterades till att tillåta
fler Spreads än Stories (en kort sida kan fortfarande behöva mer än en
sida p.g.a. buffertsidan). Hela testsviten (1053 test, 79 filer),
`tsc --noEmit` och `npm run build` kördes rent. Gjorde också en riktig
Playwright-körning genom UI:t — skapade ett kapitel, öppnade Settings,
bytte Page size till A4 och Page margin till Wide, exporterade IDML,
PDF och ODT — och verifierade direkt i de extraherade filerna att alla
tre respekterar exakt 595.28×841.89pt med 72pt marginal, samt att
`xmllint --noout` godkänner varje IDML-XML-fil rent.

**Fortfarande kvar: InDesign/Affinity-öppningstestet självt**, som för
varje tidigare IDML-ändring — jag kan inte själv öppna resultatet i
InDesign eller Affinity i den här miljön. Tråndningsmekanismen
(`PreviousTextFrame`/`NextTextFrame` på en delad Story) är InDesigns
egen dokumenterade konvention för flödande text, inte en gissning, men
väntar på ett riktigt test för att bekräftas.

v1.0.109 → v1.0.110.

**Ändringslogg v1.0.110 → v1.0.111 (2026-10-15):** IDML-exportens
trådningsmekanism (PreviousTextFrame/NextTextFrame) ersatt med egen,
verklig sidindelning — rättad efter Mats fjärde riktiga test, det
hittills allvarligaste felet.

**Mats rapport:** "Affinity får 115 sidor och Indesign 229 sidor.
Ingen text vad jag kan se. När jag kollar IDML filen så verkar XML
säga 115 spreads. 229 sidor är 115 spreads om ett spread blir 1 sida...
Vet inte om det är någon ledtråd. Jag hittade texter i katalogen
sidor..." — dvs texten FANNS i de råa Story-XML-filerna (han fick
gräva i den extraherade zippen för att hitta den), men syntes inte
alls i vare sig InDesign eller Affinity när filen öppnades.

**Egen strukturell revision innan någon ny rättning gissades fram**
(lärdom från tidigare rundor: gissa inte en femte gång på måfå).
Byggde en syntetisk 20-kapitels-bok (liknande Mats verkliga manus i
storlek) och körde den genom `packIdml` direkt, utan UI, för att
inspektera råa tal: `PagesPerDocument` i Preferences.xml matchade
exakt antalet `<Page>`-element i alla Spread-filer (621 i det
syntetiska testet — inget dolt 2x-fel i min egen räkning), alla
`designmap.xml`-referenser pekade på filer som faktiskt fanns i
zippen, och en separat kontroll av en bok UTAN page_size/page_margin
(simulerar ett gammalt sparat bokobjekt) visade att zod:s defaults
fylls i korrekt — ingen `NaN`/`undefined` läcker in i XML:en någonstans.
Så Mats "229 ≈ 2×115"-observation förklaras inte av ett dubbleringsfel
i min egen kod — gåtan satt i hur InDesign/Affinity faktiskt TOLKAR
trådningen, inte i vad jag genererade.

**Hämtade ComicBook AI-repot på nytt** (`git fetch`, ny commit
`b0ecc6f` sedan förra gången) för att se om deras IDML-export någonsin
fått trådning — svaret: nej, fortfarande oförändrad sedan `b388e4f`,
fortfarande en sida per kapitel/panel, ingen `PreviousTextFrame`/
`NextTextFrame`-kod alls. Det bekräftade att trådningsmekanismen jag
byggde i v1.0.110 ALDRIG haft någon verklig referensimplementation att
jämföras mot — jag byggde den helt från egen kunskap om IDML-
specifikationen, och den gick inte att verifiera förrän Mats testade
den i en riktig InDesign/Affinity-installation. Det är precis den typ
av overifierad gissning som tidigare rundor (v1.0.108, v1.0.109) lyckades
undvika genom att ha en konkret referens att jämföra mot.

**Beslut: ge upp trådning helt, bygg egen sidindelning istället.**
IDML behöver inte innehålla färdig radbrytning i förväg eftersom
InDesign/Affinity normalt räknar ut textflödet själva — MEN det kräver
tydligen en trådningsmekanism som fungerar, och jag har inget sätt att
verifiera att min gör det. Lösningen: sluta lita på läsarprogrammets
egen flödning helt, och räkna ut sidbrytningarna SJÄLV, med RIKTIGA
fontmått — samma `pdf-lib`-baserade radbrytning (`wrapTextLines`/
`wrapTextLinesWithOffsets`, nu flyttade till modulnivå och delade
mellan PDF- och IDML-exporten) som PDF-exporten redan använder för sin
egen, bevisat fungerande paginering.

**Ny arkitektur i `manuscriptExport.ts`:**
1. `IdmlBlock` — ett stycke/scenbrytare, separerat från sin eventuella
   sida OCH sin renderade XML. `idmlChapterBlocks`/`idmlBibleBlocks`
   bygger blocklistan (samma spaced/indented-uppdelning som tidigare),
   `idmlBlockXml` renderar ETT block till XML, `idmlBlockHeight` mäter
   ETT blocks verkliga höjd.
2. `idmlBlockHeight(block, bodyFont, boldFont, columnWidth)` — radbryter
   blockets text med `wrapTextLines` vid dess verkliga stilstorlek
   (`idmlStyleMetrics`: Title 28pt, ChapterHeading 20pt, Body 12pt — nya
   namngivna konstanter, delade med `idmlStylesXml` så de aldrig kan
   glida isär), i fetstil-fonten för rubriker/tvingat fet text (Story
   Bible-namn) eftersom fet text mäter bredare och skulle annars kunna
   underskatta radantalet.
3. `paginateIdmlBlocks(blocks, bodyFont, boldFont, columnWidth,
   pageHeight)` — en enkel girig packningsalgoritm: lägg block på
   aktuell sida tills nästa block inte får plats, starta då en ny sida.
   Kapitelrubriken är numera bara FÖRSTA blocket i kapitlets egen
   blocklista, så den paginerar som allt annat — inget separat
   "kortare första sida"-specialfall behövs längre. Ett enda block som
   är högre än en hel sida (ett extremt långt enda stycke) placeras
   ensamt på sin egen sida snarare än delas mitt i — en accepterad,
   sällsynt avvägning, säkrare än komplexiteten i att dela
   formateringsintervall mitt i ett block.
4. `packIdml` blev `async` (enda `pack*`-funktionen förutom `packPdf`
   som redan var det) eftersom paginering kräver riktiga fontmått —
   samma `embedFont`-mönster som `packPdf` redan använder, fast bara
   för att LÅNA fontmåtten, ingen PDF-sida skapas någonsin. Varje sida
   får nu sin EGEN, oberoende Story (aldrig delad, aldrig trådad) —
   `PreviousTextFrame`/`NextTextFrame` är nu ALLTID `"n"`/`"n"` i
   `idmlSpreadXml`, vars signatur tappade de båda trådningsparametrarna
   helt.

**Verifiering, betydligt starkare än tidigare rundor:**
- Ny test ("paginates a long chapter into several pages, each a
  separate, non-threaded Story with its own real content") som bygger
  ett 80-styckens kapitel, bekräftar fler än en sida behövs, att INGEN
  Spread har annat än `"n"`/`"n"`-trådning, och att första/sista
  stycket bara förekommer EN gång var i hela exporten (inget
  duplicerat eller tappat innehåll).
- Den syntetiska 20-kapitels-boken kördes om genom hela den nya
  koden: 401 sidor (ner från 621 i samma test före rättningen — mer
  rimligt för textmängden), noll trådningsreferenser kvar, och
  "Paragraph 0."/"Paragraph 39." (kapitel 1:s första och sista
  textstycke) förekommer exakt 20 gånger var — en gång per kapitel,
  aldrig duplicerat inom ett kapitel, aldrig tappat.
- En riktig export genom UI:t (60-styckens testkapitel) gav 10 sidor,
  `xmllint --noout` godkände varenda XML-fil, alla 10 Spreads hade
  exakt `PreviousTextFrame="n" NextTextFrame="n"`, alla delade samma
  432×648pt (6×9 tum) `GeometricBounds`, och "Paragraph 0 of"/
  "Paragraph 59 of" förekom exakt en gång var i Stories-katalogen.
- Hela testsviten (1053 test, 79 filer), `tsc --noEmit` och
  `npm run build` kördes rent.

**Fortfarande kvar: InDesign/Affinity-öppningstestet självt**, men med
en fundamentalt annorlunda riskprofil än tidigare rundor — den här
rättningen tar bort HELA den overifierade mekanismen (trådning) istället
för att justera dess parametrar, och ersätter den med en som återanvänder
redan bevisat fungerande kod (PDF-exportens egen fontmätning/radbrytning).
Mats bör testa igen — femte gången.

v1.0.110 → v1.0.111.

**Ändringslogg v1.0.111 → v1.0.112 (2026-10-15):** Hittade den
faktiska strukturella bristen i IDML-exportens TextFrame-geometri —
rättad efter Mats femte riktiga test, och äntligen med ett konkret,
jämförbart fynd istället för ännu en gissning.

**Mats rapport, med skärmdump:** "Affinity hittar 53 sidor, ingen
text. Indesign hittar 125 sidor och från sidan 64 så finns pyttesmå
textramar upp i vänstra hörnet. Om jag förstorar dessa textramar så
ligger texten där." Skärmdumpen visade en sida med läsbar text och en
korrekt stor markerad textram, och nästa sida nästan tom förutom en
mikroskopisk markeringsruta uppe i vänstra hörnet.

**Den faktiska roten, hittad genom direkt jämförelse mot ComicBook
AI:s kod** (inte spekulation den här gången): varje `<TextFrame>` jag
någonsin genererat — i alla fem tidigare IDML-rundor — definierade sin
storlek och position ENDAST via ett naket `GeometricBounds`-attribut
plus en identitets-`ItemTransform` ("1 0 0 1 0 0"). Jämförde direkt
mot `idmlExport.ts` i ComicBook AI (hämtad på nytt igen, ännu en ny
commit sedan sist) och såg att VARJE sidobjekt de ritar — bakgrunder,
paneler, textrutor — alltid bär ett `<Properties><PathGeometry>`
rektangel-objekt i objektets EGNA lokala koordinater (0,0 till
bredd,höjd), och att den FAKTISKA sidpositionen kommer från
`ItemTransform`s translation, aldrig från ett naket `GeometricBounds`.

IDML:s sidobjekt-modell är path-baserad (så att en ram kan vara
vilken form som helst, inte bara en rektangel) — `GeometricBounds` är
en cachead sammanfattning, inte den auktoritativa formen. En
`TextFrame` utan egen `PathGeometry` har ingen auktoritativ form för
en läsare att falla tillbaka på, vilket förklarar symptomen exakt:
olika program (Affinity/InDesign) föll tillbaka olika — ibland
fungerade det (troligen när läsaren råkade acceptera
`GeometricBounds` som tillräckligt), ibland kollapsade ramen till en
odefinierad minimal storlek, med texten ändå kvar i Story-innehållet
(därför syntes den när Mats förstorade ramen för hand).

**Rättning i `manuscriptExport.ts`:** ny `idmlRectPathGeometry(width,
height)` som bygger en sluten 4-punkters rektangel-path i lokala
koordinater (`PathOpen="false"`, varje `PathPointType`s
Left/RightDirection satt till samma punkt som dess Anchor eftersom
varje hörn är rakt, aldrig en kurva). `idmlSpreadXml`s `<TextFrame>`
tappade sitt `GeometricBounds`-attribut helt (för att undvika två
källor till sanning som kan säga emot varandra — exakt den risken
tidigare versioner bar på), fick `ItemTransform="1 0 0 1 ${margin}
${margin}"` (en ren translation till ramens sidposition) och en ny
`<Properties>${idmlRectPathGeometry(columnWidth,
columnHeight)}</Properties>` som första barn, före
`<TextFramePreference>`.

**Verifiering:** ny test ("gives every TextFrame a rectangular
PathGeometry positioned by ItemTransform, not a bare GeometricBounds")
som kontrollerar att varje genererad `<TextFrame>` saknar
`GeometricBounds` helt, bär rätt `ItemTransform`, och har en sluten
4-punkters rektangel-path med rätt lokala bredd/höjd. Hela testsviten
(1054 test, 79 filer), `tsc --noEmit` och `npm run build` kördes rent.
Gjorde också en riktig export genom UI:t (samma 60-styckens
testkapitel som förra rundan), extraherade zippen, körde
`xmllint --noout` på varenda XML-fil (alla godkända), och bekräftade
direkt i filerna: noll `GeometricBounds` kvar på någon `<TextFrame>`,
varje ram bär `ItemTransform="1 0 0 1 54 54"` och en korrekt
324×540pt rektangel-path.

**Fortfarande kvar: InDesign/Affinity-öppningstestet självt**, men med
den starkaste grunden hittills — det här är första gången rättningen
byggde på en DIREKT, sida-vid-sida-jämförelse mot en fungerande
referensimplementations faktiska XML-struktur (inte bara dess
namnrymder/attributnamn som i v1.0.108, och inte en egen uppfunnen
mekanism som i v1.0.110/111). Mats bör testa igen — sjätte gången.

v1.0.111 → v1.0.112.

**Ändringslogg v1.0.112 → v1.0.113 (2026-10-15):** Rättat InDesigns
sidduplicering (AllowPageShuffle) — första riktigt POSITIVA testet i
den här IDML-serien, och en liten, kirurgisk rättning.

**Mats rapport:** "I Affinity får jag 63 sidor med texten fullt
synlig. I Indesign får jag först 63 tomma sidor men sedan kommer
sidor med texten (totalt 125 sidor, motsvarar 1 första sida och 62
uppslag). I båda program ligger sidorna efter varandra, inte som
uppslag." — PathGeometry-fixen i v1.0.112 fungerade: Affinity visar nu
ALLA 63 sidor med texten korrekt synlig, exakt matchande det riktiga
sidantalet. Kvarstod bara ett InDesign-specifikt problem: InDesign
infogade en tom "kompanjonsida" före nästan varje riktig sida (utom
den första), vilket nästan dubblade sidantalet (63 → 125 = 1 + 62×2).

**Grundorsak, hittad på samma sätt som v1.0.112-fixen** (direkt
jämförelse mot ComicBook AI:s `idmlExport.ts`, hämtad på nytt igen):
deras `<Spread>` sätter `AllowPageShuffle="false"`, och deras
`<DocumentPreference>` har SAMMA attribut satt till `false` också. Min
kod satte `AllowPageShuffle="true"` på varje Spread och saknade
attributet helt på DocumentPreference. `AllowPageShuffle` styr om
InDesign får ombalansera/para ihop sidor i sin egen standard-layout
för motstående sidor (facing pages) — med `"true"` fick InDesign
fritt fram att göra precis det, och parade ihop varje fristående sida
med en tom vänstersida för att få jämna uppslag (utom första sidan,
som konventionellt står ensam). Affinity shufflar tydligen inte sidor
på samma sätt, vilket förklarar varför bara InDesign drabbades.

**Rättning:** `AllowPageShuffle="false"` på varje `<Spread>` i
`idmlSpreadXml`, och samma attribut tillagt på `<DocumentPreference>`
i `idmlPreferencesXml` — exakt matchande ComicBook AI:s mönster på
båda ställena.

**Verifiering:** ny test som kontrollerar att `AllowPageShuffle="false"`
finns på `DocumentPreference` och på varenda genererad `<Spread>`.
Hela testsviten (1055 test, 79 filer), `tsc --noEmit` och
`npm run build` kördes rent. En riktig export genom UI:t extraherades
och `xmllint --noout` godkände varje XML-fil; attributet bekräftades
direkt i både Preferences.xml och alla Spread-filer.

**Status: betydande framsteg bekräftat av Mats själv** — Affinity är
nu fullt korrekt (63/63 sidor, all text synlig). InDesign-rättningen
är kirurgisk och direkt baserad på samma fungerande referens som löste
PathGeometry-problemet. Väntar på Mats sjunde test för att bekräfta
att InDesign nu också visar exakt 63 sidor utan dubblering.

v1.0.112 → v1.0.113.

**Ändringslogg v1.0.113 → v1.0.114 (2026-10-15):** Länkade textrutor
återinförda i IDML-exporten — Mats bad om det direkt efter att ha
bekräftat att v1.0.113 fungerade i Affinity: "texten har en egen
textram per sida, det skulle helst vara länkade textrutor. Vet inte
om man kan fixa det?"

**Bakgrund — varför det här inte bara är att göra om v1.0.110:**
Trådning (PreviousTextFrame/NextTextFrame på en delad Story) byggdes
först i v1.0.110 och övergavs i v1.0.111 efter att ett riktigt test
visat alldeles för många sidor och ingen synlig text alls. Vid den
tidpunkten tolkades det som bevis på att själva trådningssyntaxen inte
gick att lita på. I efterhand stämmer inte det: de TVÅ faktiska
buggarna det testet råkade ut för — en `TextFrame` utan egen
`PathGeometry` (hittad och rättad i v1.0.112) och `AllowPageShuffle`
kvarlämnad som `"true"` (hittad och rättad i v1.0.113) — är båda
HELT OBEROENDE av trådning och skulle ha gått sönder lika illa för den
icke-trådade versionen också. De hade bara inte hittats än. Nu är
båda rättade, var och en bekräftad av ett eget riktigt test (Affinity
visade alla 63 sidor korrekt i v1.0.113). Så trådning byggs nu ovanpå
en grund som faktiskt är verifierad, inte samma gissning som innan.

**Vad som ändrades i `manuscriptExport.ts`:** `packIdml`s sidbyggnads-
loop byggdes om från "en Story per sida" (v1.0.111–113) till "en
Story per kapitel/enhet, trådad över så många sidor som behövs".
`paginateIdmlBlocks` (den riktiga fontmätnings-baserade uppskattningen
från v1.0.111) återanvänds nu BARA för sitt sidantal — inte längre för
att dela upp innehållet i separata bitar, eftersom InDesign/Affinity
nu gör den riktiga uppdelningen själva när ramarna är trådade. Varje
enhet med mer än en uppskattad sida får en extra buffertsida (en tom
sista ram är ofarlig; att ta slut på ramar mitt i ett kapitel skulle
tyst klippa bort text — den enda utkomsten värd att undvika), men
behöver inte vara lika generös som v1.0.110:s gamla
tecken-räknings-uppskattning längre, eftersom uppskattningen bara är
en startpunkt för InDesigns egen riktiga layout nu, inte den enda
sanningskällan.

`idmlSpreadXml` fick tillbaka sina `previousTextFrame`/`nextTextFrame`-
parametrar (borttagna i v1.0.111) — men med PathGeometry- och
AllowPageShuffle-rättningarna från v1.0.112/113 kvar intakta.

**Verifiering:** de två IDML-testerna som beskrev icke-trådat beteende
skrevs om till att beskriva trådat beteende istället — en test
bekräftar att varje enhet fortfarande får exakt en Story per kort
kapitel (title + 2 korta kapitel i testboken), en annan bygger ett
långt 80-styckens kapitel och bekräftar: EN Story för hela kapitlet
(inte flera), med båda första och sista stycket i den, trådad över
flera sidor med en korrekt PreviousTextFrame/NextTextFrame-kedja (från
"n" genom varje mellansida till "n" igen). Hela testsviten (1055
test), `tsc --noEmit` och `npm run build` kördes rent. Gjorde också en
egen manuell granskning av en syntetisk 20-kapitels-bok: 421 sidor (20
fler än v1.0.111–113:s 401, exakt motsvarande en buffertsida per
flersidigt kapitel), 21 Stories (en per enhet), varje kapitels Story
innehåller korrekt både sitt första och sista stycke. En riktig export
genom UI:t extraherades, `xmllint --noout` godkände varje XML-fil, och
trådningskedjan bekräftades direkt i filerna: titelsidan fristående
("n"/"n"), kapitlets 10 sidor korrekt kedjade från "n" till "n" genom
mellanliggande ramar, `AllowPageShuffle="false"` kvar överallt.

**Fortfarande kvar: InDesign/Affinity-öppningstestet självt**, men med
en betydligt mer välgrundad förväntan än v1.0.110:s första
trådningsförsök — de två konkreta bristerna som (i efterhand) orsakade
det försökets totala haveri är nu identifierade, rättade och var för
sig bekräftade genom riktiga tester. Mats bör testa igen — sjunde
gången, och förhoppningsvis den som äntligen ger länkade textrutor OCH
korrekt sidantal samtidigt.

v1.0.113 → v1.0.114.

**Ändringslogg v1.0.114 → v1.0.115 (2026-10-15):** Namngivna
paragrafstilar i IDML-exporten — en kosmetisk önskan, inte en bugg.

**Mats fråga:** "Kan man sätta så att kapitelnamne får en style (T ex
Chaptername) och prosan frå stilen Brödtext (eller vad det heter på
engelska)?" — dvs. att stilarna som visas i InDesigns egen
Paragraph Styles-panel ska heta något läsbart, inte de interna
programmerar-namnen ("ChapterHeading", "Body", "BodyFirst" osv) som
exporten hittills använt.

**Ändring i `manuscriptExport.ts`:** sex nya namngivna konstanter
(`IDML_STYLE_TITLE`, `IDML_STYLE_CHAPTER_NAME`, `IDML_STYLE_BODY_TEXT`,
`IDML_STYLE_BODY_TEXT_FIRST`, `IDML_STYLE_BODY_TEXT_INDENTED`,
`IDML_STYLE_SCENE_BREAK`) ersatte alla bokstavliga strängliteraler för
stilnamn genom hela IDML-sektionen — i `idmlStylesXml`s egna
stildefinitioner, i `idmlChapterBlocks`/`idmlBibleBlocks`/`packIdml`s
blockbyggande kod, och i de ställen som senare jämför mot namnen
(`idmlStyleMetrics`, `idmlBlockHeight`s fetstils-kontroll). Namngivna
konstanter istället för upprepade strängliteraler, så definitionen och
alla användningsställen aldrig kan glida isär vid en framtida ändring.

Nya namn: "Title" (oförändrat, redan ett vanligt läsbart ord),
"Chapter Name" (Mats egen föreslagna "Chaptername", med mellanslag),
"Body Text" (den engelska standardtermen Mats efterfrågade, matchar
InDesigns/Words egen "Body Text"-konvention), "Body Text First"/
"Body Text Indented" (de två indenterade-lägets varianter), "Scene
Break". Precis som riktiga InDesign-genererade IDML-filer rutinmässigt
använder läsbara namn direkt som sin interna `Self="ParagraphStyle/
<namn>"`-sökväg (t.ex. den reserverade "$ID/[No paragraph style]"),
används samma läsbara sträng både som `Self` och som `Name`-attributet
— inga mellanslag i XML-attributvärden är ett problem, bekräftat av
det befintliga mönstret.

**Omfattning:** bara IDML-exportens egna stilar — rörde INTE ODT:s
separata, likartat namngivna stilar ("Title"/"ChapterHeading"/
"SceneBreak" i `odtStyles`), som är ett helt annat kodblock för ett
annat format och aldrig nämndes.

**Verifiering:** ny test som kontrollerar att `Resources/Styles.xml`
definierar alla sex nya namnen korrekt (`Self="ParagraphStyle/<namn>"
Name="<namn>"`) och att en genererad Story faktiskt taggar
kapitelrubriken med "Chapter Name" och brödtext med "Body Text" (inte
de gamla namnen). Hela testsviten (1056 test, 79 filer),
`tsc --noEmit` och `npm run build` kördes rent. En riktig export genom
UI:t extraherades, `xmllint --noout` godkände varje XML-fil, och de
nya stilnamnen bekräftades direkt i både Styles.xml och de tillämpade
`AppliedParagraphStyle`-referenserna i Stories-filerna.

v1.0.114 → v1.0.115.

**Ändringslogg v1.0.115 → v1.0.116 (2026-10-15):** Publish slutade
spara filer helt — rättad, men ovanligt osäker rättning för den här
sessionen eftersom jag aldrig kunde återskapa felet själv.

**Mats rapport:** "Nu när jag väljer publish stannar rutan kvar ett
tag och försvinner sedan [utan att någon] save as... ruta [visas]. Jag
får alltså aldrig spara någon fil. Det gäller oavsett vilket
filformat jag väljer." — Publish-dialogen stängs (koden kör klart utan
att krascha), men operativsystemets/webbläsarens "Spara som"-dialog
visas aldrig, för NÅGOT exportformat.

**Återskapade inte felet själv** — körde samma Playwright-flöde (alla
åtta format: md, txt, rtf, odt, html, epub, pdf, idml) både mot
dev-servern och mot den riktiga produktionsbyggen (`npm run build` +
statisk server), och alla åtta laddades ner felfritt, utan konsolfel,
varje gång. Eftersom bugen inte går att återskapa i den här miljöns
Chromium-baserade testning, är den sannolikt specifik för Mats
faktiska körmiljö — mest troligt skrivbordsappens Windows-WebView2
(Tauri-appen har ingen egen fs/dialog-plugin kopplad, så ALL
nedladdning går via webbläsarens egna Blob-URL-mekanism).

**Grundorsak (välgrundad hypotes, inte bekräftad genom egen
återskapning):** `downloadBlob` i `downloadJson.ts` anropade
`URL.revokeObjectURL(url)` DIREKT efter `link.click()`, synkront. Det
är säkert i Chromium (som fångar blob-referensen vid själva klicket),
men inte garanterat i alla motorer — särskilt Windows WebView2 (det
Tauri-skrivbordsappen kör på) kan fortfarande hålla på att asynkront
starta nedladdningen (t.ex. medan dess egen nativa "Spara som"-dialog
är öppen) när URL:en återkallas, vilket tyst gör att nedladdningen
försvinner utan något felmeddelande. Det här matchar Mats symptom
exakt: dialogen stängs (koden kör klart), men "spara som"-dialogen
visas aldrig.

**Rättning:** `URL.revokeObjectURL(url)` sker nu efter en kort
fördröjning (`setTimeout`, 30 sekunder) istället för omedelbart —
tillräckligt för att nedladdningen hinner starta i vilken
webbläsar-/WebView-motor som helst, oavsett hur lång tid
operativsystemets egen Spara-dialog tar att svara på. Kostar
ingenting märkbart (en Blob-referens hålls kvar i minnet några
sekunder till).

**Verifiering:** `tsc --noEmit`, hela testsviten (1056 test) och
`npm run build` kördes rent. Samma Playwright-flöde (alla åtta format)
kördes om efter rättningen — fortfarande felfritt i den här miljön,
vilket bekräftar att ändringen inte stör något som redan fungerade,
men INTE att den faktiskt löser Mats problem, eftersom jag aldrig
kunde se felet uppstå själv.

**Viktigt att vara ärlig om:** det här är den FÖRSTA rättningen i
sessionen som skeppas utan att jag någonsin sett buggen inträffa —
varje tidigare IDML-rättning byggde på direkt jämförelse mot en
referensimplementation eller en konkret, reproducerbar skillnad i
genererade filer. Den här gången är det en välkänd, dokumenterad
webbplattformskompatibilitetsfälla som matchar symptomen exakt, och
en säker, riskfri ändring (kan inte göra något sämre), men den är
fortfarande en hypotes tills Mats bekräftar att Publish fungerar igen.

v1.0.115 → v1.0.116.

**Ändringslogg v1.0.116 → v1.0.117 (2026-10-16):** Dubbla radmatningar
mellan stycken i IDML rättade — och bekräftelse att v1.0.116 faktiskt
löste nedladdningsproblemet.

**Mats:** "Perfekt! Det blev bra i Affinity. Det blir dubbla
radmatningar mellan stycken, det är det enda." — bekräftar att både
nedladdningsfixen (v1.0.116) och hela IDML-kedjan av rättningar
(PathGeometry, AllowPageShuffle, trådning) nu fungerar i Affinity. Kvar
var bara ett kosmetiskt mellanrumsproblem.

**Grundorsak:** "spaced"-styckesläget (standardläget) sätter redan in
ett explicit tomt styckesblock mellan riktiga stycken
(`idmlChapterBlocks`) — samma "tomt-stycke-som-avskiljare"-konvention
varje annat exportformat använder. Men "Body Text"-paragrafstilen
hade ÄVEN ett eget `SpaceAfter="12"` (IDML_BODY_SIZE), som lades
OVANPÅ det tomma styckets egen radhöjd — resultatet blev dubbelt så
stort mellanrum som avsett.

**Rättning:** `SpaceAfter` på "Body Text"-stilen i `idmlStylesXml`
ändrat från `${IDML_BODY_SIZE}` till `"0"`. Scenbrytare, kapitelrubrik
och titel har sina egna, oförändrade SpaceBefore/SpaceAfter-värden
(påverkas inte). "Indented"-läget (som aldrig har tomma
avskiljarstycken) blir också mer konsekvent av samma ändring:
"Body Text First" ärvde tidigare Body Texts 12pt SpaceAfter trots att
"Body Text Indented" redan uttryckligen hade 0 — en latent
inkonsekvens ingen rapporterat än, nu löst på köpet.

**Verifiering:** ny test som kontrollerar att "Body Text"-stilen har
`SpaceAfter="0"`. Hela testsviten (1057 test, 79 filer),
`tsc --noEmit` och `npm run build` kördes rent. En riktig export genom
UI:t extraherades, `xmllint --noout` godkände varje XML-fil, och det
nya SpaceAfter-värdet bekräftades direkt i Styles.xml.

v1.0.116 → v1.0.117.

**Ändringslogg v1.0.117 → v1.0.118 (2026-10-16):** Hittade och rättade
en egen, nyligen införd bugg i sidantals-uppskattningen — men inte
säkert hela förklaringen till Mats senaste InDesign-rapport.

**Mats:** "Indesign fungerar inte. Den har 123 tomma sidor och sedan
124 sidor med text. Sparas sidorna som Spreads? Vi försöker fixa den
utan att sabba för Affinity." — ja, varje sida sparas som ett eget
`<Spread>`-element (med en `<Page>` och en `<TextFrame>` i), svarade
jag direkt. 123 tomma + 124 med text = 247 sidor totalt, i den
ordningen (alla tomma FÖRST, sedan allt med text) — ett annat mönster
än tidigare rundors fel.

**Egen undersökning innan någon ändring gjordes** (samma disciplin som
v1.0.111): byggde tre syntetiska testkapitel (berättande långa stycken,
dialog med många korta rader, blandat) och jämförde IDML:s egen
sidantals-UPPSKATTNING (`paginateIdmlBlocks(...).length`) mot PDF-
exportens FAKTISKA renderade sidantal för samma innehåll (PDF gör
riktig radbrytning med pdf-lib:s fontmått, ett pålitligt jämförelseobjekt).
Resultat innan rättning: PDF 9-10 sidor, IDML-uppskattning 13-16 sidor
— en verklig, mätbar överskattning, men bara ~1,4-1,6x, inte en
dramatisk 2x-nivå som skulle krävas för att själv förklara "ungefär
hälften av alla sidor tomma."

**En konkret, hittad bugg ändå:** `idmlBlockHeight` hade kvar ett
`+ size * 0.3`-tillägg per block, en rest från INNAN v1.0.117 tog bort
Body Text-stilens riktiga `SpaceAfter` (som då var `${IDML_BODY_SIZE}`,
dvs 12). Tillägget var uttryckligen avsett att approximera just det
SpaceAfter-värdet (se kodkommentaren som fanns redan). Men när
v1.0.117 satte det riktiga SpaceAfter till "0" glömdes den här
uppskattnings-kompensationen bort — den fortsatte lägga på 3,6pt extra
höjd per BLOCK (både riktiga stycken och tomma avskiljarstycken) som
inte längre motsvarar något i den faktiskt renderade filen. Eftersom
MERPARTEN av ett kapitels block är Body Text-stilade, adderar den här
överskattningen upp genom en hel bok.

**Rättning:** ny `idmlStyleSpaceAfter(styleName)` som returnerar
stilens FAKTISKA SpaceAfter/SpaceBefore-värde (0 för Body Text och dess
varianter, 18 för Title, 24+14 för Chapter Name, 10+10 för Scene
Break) istället för den gamla flata `size * 0.3`-gissningen. Effekt
uppmätt i samma jämförelse: Narrative 13→12, Dialogue 16→14, Mixed
16→14 — en verklig, om än modest (~10-15%), förbättring.

**Ärligt om vad som INTE är löst:** den kvarstående skillnaden mot
PDF:s faktiska sidantal (fortfarande ~1,2-1,4x) förklaras till stor
del av LEGITIMA skillnader, inte buggar — IDML:s kroppstext är 12pt
mot PDF:s 11pt (ett medvetet typografiskt val, inte en miss), och
IDML:s tomma avskiljarstycken kostar en HEL radhöjd (korrekt — en tom
paragraf upptar sin fulla Leading-höjd i InDesign) medan PDF:s egen
rendering medvetet komprimerar tomrader till 0,6x för en tightare
visuell look (PDF:s eget stilval, inte "mer korrekt"). Att kopiera
PDF:s 0,6x till IDML skulle göra uppskattningen MINDRE korrekt, med
risk för den värre felvarianten (text som klipps bort) — gjordes
därför INTE.

Så den här rättningen är en verifierad, riktig förbättring, men
sannolikt INTE hela förklaringen till "123 tomma sidor sedan 124 med
text, i den ordningen" — det GRUPPERADE mönstret (alla tomma först,
inte utspridda per kapitel) pekar snarare mot något i hur InDesign
specifikt TOLKAR flera trådade Stories vid import, som kräver mer
information från Mats för att fastställas.

**Verifiering:** hela testsviten (1057 test, 79 filer),
`tsc --noEmit`, `npm run build`, och en riktig export genom UI:t
(`xmllint --noout` godkände varje fil, trådningskedjan fortfarande
korrekt) kördes rent. Ingen ny testassertion lades till specifikt för
detta (inget tidigare test hårdkodade ett exakt sidantal som skulle
behöva uppdateras).

v1.0.117 → v1.0.118.

**Ändringslogg v1.0.118 → v1.0.119 (2026-10-16):** Publish fungerade
inte alls i Brave, bara i Chrome.

**Mats:** "Just det. Publish fungerar inte i Brave men i Chrome, du
nämnde att det var en skillnad. Kan man åtgärda det eller är Chrome
ett krav?" — detta visade sig alltså gälla webbversionen i en
webbläsare specifikt, inte (bara) skrivbordsappen som v1.0.116:s fix
delvis antog.

**Teori (inte reproducerad i den här miljön, samma begränsning som
v1.0.116 — Chromium-baserad Playwright-testning kan inte skilja Brave
från Chrome):** moderna webbläsare kan kräva att en nedladdning som
triggas programmatiskt (ett syntetiskt `<a download>`-klick) sker
inom, eller strax efter, en riktig användar-gest — annars blockeras
den tyst. Det "användaraktiverings"-fönstret kan förloras när ett
`await` korsar en riktig asynkron gräns (ett nätverksanrop), och
integritetshårdare webbläsare som Brave (via sina Shields) är rimligen
striktare med detta än Chrome. `saveExport` i `Editor.tsx` gjorde
`await loadPublishFontEmbed(book.body_font)` — ett riktigt
`fetch()`-anrop efter manuskriptets valda typsnitt — direkt innan
nedladdningen triggades, för varje format utom md/txt.

**Rättning:** `loadPublishFontEmbed` (`publishFonts.ts`) cachar nu
resultatet per typsnitts-id (en `Map<PublishFontId, Promise<...>>`) —
typsnittsfilerna är appens egna paketerade resurser, de ändras aldrig
i körtid, så ett förnyat `fetch()` vid varje Publish-klick var redan
slöseri oavsett. En misslyckad hämtning cachas INTE (ett tillfälligt
nätverksfel ska inte permanent förgifta alla senare Publish-försök för
det typsnittet). `openPublish()` i `Editor.tsx` anropar nu
`loadPublishFontEmbed(book.body_font)` direkt när Publish-dialogen
öppnas (före valet av format, "fire-and-forget") — så när användaren
faktiskt klickar Publish, oftast flera sekunder senare, är cachen redan
varm och anropet i `saveExport` löser sig omedelbart utan nätverksväntan.

**Ärligt om räckvidden:** detta tar bort den ENDA async-väntan för
rtf/odt/html/epub (vars enda asynkrona steg före nedladdningen var just
typsnitts-hämtningen) — där bör fixen fullt ut lösa problemet. PDF och
IDML har dock eget, oundvikligt asynkront arbete (riktig
font-inbäddning i pdf-lib, `PDFDocument`-skapande) EFTER att
typsnittet är hämtat, som den här fixen inte kan ta bort — där
minskar fixen väntan men eliminerar den inte helt.

**Verifiering:** hela testsviten (1057 test, 79 filer), `tsc --noEmit`
och `npm run build` kördes rent. En riktig Playwright-körning mot
dev-servern bekräftade att alla åtta format (md/txt/rtf/odt/html/
epub/pdf/idml) fortfarande laddas ner korrekt i den här miljöns
Chromium — men liksom v1.0.116 kan den specifika Brave-skillnaden inte
bekräftas direkt härifrån.

v1.0.118 → v1.0.119.

**Ändringslogg v1.0.119 → v1.0.120 (2026-10-16):** Hittade en verklig
strukturell brist i IDML-filen — alla sidor satt på exakt samma
position på pasteboard — efter att ha uteslutit flera andra teorier
genom direkt testning, inte gissning.

**Mats skickade tre uppföljande underlag** på "InDesign hanterar filen
fel, Affinity fixar det": (1) en skärmdump zoomad in på sidorna
111-128 i Pages-panelen — 9 tomma sidor, sedan 8 med text, sedan tomt
igen; (2) bekräftelse att InDesign visar en typsnittsvarning, och att
byte till ett typsnitt han faktiskt har installerat (och senare Times
New Roman) gav SAMMA resultat; (3) en tredje skärmdump som visade
VARIFRÅN kapitel 1:s riktiga text faktiskt börjar — sida 90 av 177,
med kapitlets rubrik "1. Chapter 1" och en läsbar styckestext synlig i
InDesigns eget förhandsgranskningsfönster.

**Teori 1 (typsnittssubstitution) — föreslagen, sedan utesluten av
Mats egna tester:** om InDesign ersätter ett typsnitt den inte har
installerat med något av helt andra mått än det vi mätte vår
sidantals-uppskattning mot, skulle text kunna ta slut långt tidigare
än väntat i en trådad story, och lämna resten av trådens rutor tomma.
Mats testade med ett typsnitt han faktiskt har installerat (ingen
varning) — samma resultat. Teorin föll.

**Jämförelse mot ComicBook AI:s referensskrivare** gav ingen ledtråd —
den trådar aldrig textrutor alls (varje serietidningssida är
fristående), så den täcker inte den delen av formatet alls.

**Genombrottet: testade vår EGEN genererade fil direkt, inte
InDesigns tolkning av den.** Byggde fyra engångs-debugtester
(`_debug-idml5.test.ts`, borttagen efter användning) som körde
`packIdml` med en tom anteckning, en MYCKET lång anteckning (6000
tecken), långa voice/viewpoint-fält, och till sist en syntetisk bok
med 90 kapitel — och räknade hur många trådade rutor varje enhets
(titel/kapitel) egen Story faktiskt fick. Resultat: helt rimligt i
alla fyra fallen (titelenheten fick som mest 5 rutor även med extremt
lång text; i 90-kapitelboken fick varje kapitel jämnt 3 rutor vardera,
ingen enhet stack ut). Detta uteslöt definitivt att VÅR egen fil
skulle snedfördela sidor till någon enskild enhet (t.ex. att
titelsidan skulle svälla till ~88 sidor) — om kapitel 1 (sequence_index
0) verkligen ligger direkt efter titelenheten i vår egen fil (vilket
koden garanterar), kan ingenting i vår genererade struktur själv
förklara 88+ tomma sidor före den.

**Den verkliga bristen, hittad genom att läsa koden med nya ögon
efter att ha uteslutit innehållet:** varje `<Spread>` i hela
dokumentet skrevs med `ItemTransform="1 0 0 1 0 0"` — exakt samma
pasteboard-position, oavsett vilken sida eller vilket kapitel. Ingen
riktig InDesign-skapad IDML-fil är någonsin strukturerad så — ett
InDesign-dokuments pasteboard är EN sammanhängande remsa, där varje
Spread upptar sitt eget efterföljande segment av den, aldrig flera
Spreads staplade exakt ovanpå varandra. ComicBook AI:s referensfil
visar samma mönster (`ItemTransform="1 0 0 1 0 0"` på varje spread),
men eftersom den ALDRIG trådar textrutor (varje sida fristående)
skulle ett sådant problem aldrig synas där — sidordningen för
oberoende sidor beror inte på pasteboard-position, men den ordning en
läsarapplikation väljer att visa/lösa upp en TRÅDAD storys automatiska
flöde över många Spreads skulle mycket väl kunna göra det.

**Rättning:** varje Spread får nu sin egen position på dokumentets
delade pasteboard (`spreadIndex * pageWidth` längs X), räknat löpande
över HELA dokumentet (inte återställt per enhet/kapitel) — exakt som
en riktig InDesign-pasteboard fungerar. `Page` och `TextFrame` behåller
sina egna, sidrelativa transformer oförändrade; bara Spreadens egen
plats på den delade pasteboarden flyttas.

**Ärligt om verifieringsnivån:** detta är INTE bekräftat lösa Mats
InDesign-problem — jag har fortfarande ingen InDesign att testa mot.
Vad jag HAR verifierat direkt: (1) att vår egen fil, genom upprepad
debugtestning, inte själv snedfördelar sidor till en enskild enhet —
det utesluter flera andra möjliga förklaringar; (2) att varje Spread i
en riktig export nu får en distinkt, stigande pasteboard-position i
designmap-ordning (0, 432, 864, ... pt för en 6x9-bok), bekräftat både
i ett nytt committat test och i en riktig export genom UI:t, där
`xmllint --noout` godkände varje XML-fil; (3) att detta är en
genuin, konkret skillnad mot hur en äkta InDesign-fil alltid är
strukturerad — samma kategori fynd som PathGeometry- och
AllowPageShuffle-bristerna som löste de två tidigare, bekräftade
buggarna. Men till skillnad från de två tidigare fixarna kunde den HÄR
specifika skillnaden inte bekräftas mot en tradad referensfil (ingen
sådan finns tillgänglig), så den vilar på allmän kunskap om hur
InDesign-dokument är uppbyggda snarare än en direkt jämförelse.

**Verifiering:** hela testsviten (1058 test, 79 filer — ett nytt
committat test lades till som kontrollerar att varje Spread får rätt,
stigande pasteboard-position), `tsc --noEmit`, `npm run build`, och en
riktig export genom UI:t (`xmllint --noout` godkände varje fil,
pasteboard-positionerna bekräftade direkt i de extraherade
Spread-filerna) kördes rent. Passade också på att städa bort två
kvarglömda, missvisande kodkommentarer (`paginateIdmlBlocks` och
`idmlSpreadXml`) som fortfarande beskrev förtrådnings-designen från
innan v1.0.114 och aldrig uppdaterades när trådning återinfördes.

v1.0.119 → v1.0.120.

**Ändringslogg v1.0.120 → v1.0.121 (2026-10-16):** Hittade den
VERKLIGA grundorsaken till hela "tomma sidor"-sagan — genom att
reproducera Mats exakta sidnummer i ett eget, kontrollerat test,
inte genom ännu en gissning.

**Mats testade v1.0.120 (pasteboard-fixen) och rapporterade två
saker:** (1) en skärmdump av sidorna 199-215 som nu visade ett mycket
mer normalt mönster — enstaka par av tomma sidor utspridda mellan
kapitel med text, istället för ett stort sammanhängande block; (2)
direkt följt av "Tyvärr..." och sedan "De första 106 sidorna är
tomma." Pasteboard-fixen hade alltså INTE löst huvudproblemet.

**Bad om två precisa detaljer** istället för att gissa vidare: vad
som visas på sida 1, och var kapitel 1:s rubrik först dyker upp. Mats
svar, med skärmdump: sida 1 helt tom; FÖRSTA tecknet kommer på sida
108 ("The Weight of the Course Exported 2026-10-16." — alltså
TITELSIDANS egen, korta text); kapitel 1:s rubrik på sida 109 direkt
därefter.

**Mats delade också en andra-hands-analys från Gemini** med två
påståenden. Utvärderade båda mot koden och mot ComicBook AI:s
referensskrivare innan något gjordes: (1) "108 spreads men bara 16
stories" beskriver bara hur trådningen är TÄNKT att fungera (fler
spreads än stories är designen, inte en bugg) — förklarar inget. (2)
"saknat `<Section>`-element tvingar InDesign infoga tomsidor för att
sida 1 ska bli en högersida" — den specifika mekanismen (recto-krav)
gäller bara med `FacingPages="true"`, men vi sätter uttryckligen
`FacingPages="false"`; och ComicBook AI:s egen, bekräftat fungerande
IDML-skrivare saknar OCKSÅ `<Section>` helt utan att orsaka
tomsidor där — så frånvaron kan inte ensam vara boven. Lade inte in
ett Section-element baserat på den analysen (även om det skulle
kunna göras som ofarlig hygien någon annan gång).

**Genombrottet:** avgörande ledtråden var att titelsidans EGEN,
mycket korta text (bara "{titel} {exportedLabel}") visades på sida
108 — inte att någon enhet svällt till 107 sidor verkligt innehåll.
Det är ett ORDNINGS-problem, inte ett INNEHÅLLS-problem. Och
titelenheten är, per koden, uteslutet ALLTID den allra första
posten i designmap.xml — så om InDesign visade den på plats 108 av
ett dokument, måste InDesign använda NÅGOT ANNAT än designmap.xml:s
egen referensordning för att avgöra Sidor-panelens visningsordning.

Byggde ett test med en syntetisk 30-kapitelsbok (121 sidor totalt)
och undersökte `idmlId()` — den funktion som genererar varje
`Self`-ID i filen (`uSpread6`, `uSpread13`, `uSpread15`, ... en enda
global, odelad, inkrementerande räknare delad mellan alla ID-typer).
Testade hypotesen: VAD HÄNDER om man sorterar spreadarnas ID-strängar
ALFABETISKT istället för i skapad/designmap-ordning? Resultat:
titelsidans spread (alltid `...6`, alltid index 0 i designmap) hamnar
då på index **108 av 121** — EXAKT samma sidnummer Mats oberoende
rapporterade för var titeltexten faktiskt visades i InDesign. Ingen
slump — en odelad, oblockerad `Self`-ID-sträng som "uSpread6" sorterar
EFTER alla "uSpread1XX"/"uSpread2XX"/.../"uSpread9XX" (lexikografiskt
jämförs tecken för tecken: "1" < "6", så "uSpread102" < "uSpread6" som
strängar, trots att 102 > 6 som tal). InDesigns Sidor-panel visade sig
alltså lista detta skrivarens trådade spreads i den SKRAMLADE
strängordningen, inte i designmap.xml:s faktiska ordning.

Detta förklarar RETROAKTIVT varenda observerat mönster i hela sagan:
"123 tomma sedan 124 med text", det utspridda "9 tomt/8 text"-mönstret
vid sidorna 111-128, "kapitel 1 börjar på sida 90", och nu "titelsidan
på sida 108" — alla är samma underliggande strängsorterings-skrambel,
bara med olika bokstorlekar och därmed olika exakta siffror. Det
förklarar också varför VARKEN font-bytet, VARKEN v1.0.118:s
uppskattningsfix, EJ HELLER v1.0.120:s pasteboard-positionsfix kunde
lösa det — ingen av dem rör vid den faktiska mekanismen InDesign
visade sig använda.

**Rättning:** `idmlId(prefix)` nollpaddar nu sitt löpnummer till en
fast bredd (6 siffror — plats för upp till en miljon ID:n, gott om
marginal för vilken bok som helst) innan det sätts ihop med prefixet.
Det gör att STRÄNGSORTERING av ID:n alltid stämmer överens med
skapandeordning/designmap-ordning, oavsett hur stor boken är.

**Verifiering, den mest konkreta i hela den här sagan:** (1) ett nytt
committat test byggde en 15-kapitelsbok, extraherade alla Spread-ID:n
ur en riktig genererad designmap.xml, och verifierade att de redan
ligger i strängsorterad ordning; (2) en riktig export genom UI:t med
10 fyllda kapitel (tillräckligt för att ID-räknaren ska korsa in i
tresiffriga tal, exakt den skala som exponerade buggen) — `xmllint
--noout` godkände varje XML-fil, och en oberoende sortering av de
extraherade Spread-ID:na bekräftade att alfabetisk ordning nu exakt
matchar designmap-ordningen; (3) hela testsviten (nu 1059 test, 79
filer, med det nya testet), `tsc --noEmit` och `npm run build` kördes
rent.
Till skillnad från v1.0.120:s pasteboard-fix (som vilade på allmän
kunskap om InDesign-dokuments uppbyggnad) är det HÄR en direkt,
siffermässig reproduktion av det exakta felet Mats rapporterade.

v1.0.120 → v1.0.121.

**Ändringslogg v1.0.121 → v1.0.122 (2026-10-16):** v1.0.121:s ID-fix
visade sig INTE lösa problemet — och den fortsatta utredningen
bevisade till slut, med Affinity som vittne, att själva filen är
korrekt och att InDesign hittar på sidor som inte finns där.

**Mats testade v1.0.121** och rapporterade, med skärmdump: "Jag är
ledsen... Samma 107 tomma sidor." Exakt samma resultat som innan
ID-nollpaddningen — trots att den ändringen skrev om VARJE ID-sträng i
filen. Så exakt en matchning efter en ändring som borde ha stört om
ordningen radikalt var i sig misstänkt.

**Uteslöt cache/stale-fil som förklaring:** bad Mats testa ett HELT
ANNAT manus ("Call of Cthulhu", aldrig öppnat förut) specifikt för att
få en IDML-fil som inte kunde vara en gammal, redan öppen version i
InDesign. Samma mönster ändå: 57 tomma sidor innan riktigt innehåll,
på ett totalt sidantal av 115 — samma ~50%-kvot som i alla tidigare
tester (123/239, 90/177, 106/215), nu bekräftat oberoende av
manusinnehåll, typsnitt OCH filcache.

**Genombrott #2 — bad Mats dela designmap.xml direkt.** Räknade raderna
för hand: filen innehöll exakt **58** `<idPkg:Spread>`-poster (3
kapitel, bekräftat av StoryList:s 4 stories: titel + 3 kapitel). Men
InDesign visade **115** sidor. 115 = 58 + 57 — en extra sida för varje
riktig sida utom den första. Första gången i hela sagan en SIFFRA som
direkt bevisade att det inte längre var en ordnings-/sorteringsfråga
(vilket v1.0.120 och v1.0.121 antog) utan en genuin DUBBLERING: 57
sidor existerar helt enkelt inte i vår egen fil.

**Två snabba, kodfria tester för att pricka in mekanismen,** båda via
Mats direkt i InDesign:
1. Klicka på en av de tomma sidorna med markeringsverktyget — "inget"
   gick att markera. Inte ens en tom textram. Bekräftar: detta är inte
   våra egna, bara ofyllda, trådade rutor (de skulle gått att markera
   som tomma textramar) — det är sidor InDesign skapat helt utanför
   vår fils egen struktur.
2. Typsnittsbyte Literata → Minion Pro (ett riktigt, installerat
   typsnitt) — samma resultat. Typsnittssubstitution uteslutet än en
   gång, nu även för det här specifika testet.

**Två InDesign-inställningar undersökta och uteslutna, också utan ny
kod:**
- Dokumentinställningar → "Visa uppslag" (Facing Pages): avbockad,
  bekräftat AV. "Antal sidor: 115" visade sig vara InDesigns egen,
  INTERNA sidräkning — inte bara en panelvisningsordning.
- "Smart textomformning" (Smart Text Reflow, Inställningar →
  Typografi): redan korrekt inställd ("Begränsa till primära
  textramar" ikryssad, vilket enligt Adobes egen dokumentation borde
  göra att den aldrig triggar på våra icke-mastersides-textramar).
  Stängde av funktionen helt ändå — exakt samma 57 tomma sidor.

**Genombrott #3 — Affinity-korsjämförelse.** Bad Mats öppna EXAKT
samma fil i Affinity (redan känt fungerande) och räkna sidorna där:
**58** — matchar vår fils verkliga innehåll EXAKT. Affinity visade
dock tomma buffertsidor i SLUTET av varje kapitels egen trådning
(10-15, 29-39, 51-58 — totalt 25 sidor), vilket är precis det redan
kända, ofarliga "modesta överskattnings"-mönstret (värdena matchar:
14+24+19 trådade rutor per kapitel minus verkligt behövt innehåll).
Detta BEVISADE slutgiltigt: vår fil är objektivt korrekt — samma fil,
öppnad i två olika program, ger 58 sidor i det ena (med redan förstådd,
ofarlig buffertförlust) och 115 "uppfunna" sidor i det andra. Felet är
100% InDesign-specifikt importbeteende, triggat av något i vår fils
struktur som bara InDesign reagerar på.

**Återstående, välgrundad men ännu INTE bekräftad teori:** filen
saknar helt ett `<Section>`-element — något en RIKTIG InDesign-
exporterad IDML-fil alltid har (bekräftat genom att varje sida i Mats
Sidor-panel visas med hakparenteser, InDesigns egen konvention för
"osektionerad" numrering). Verifierade elementets faktiska XML-schema
(`Self`, `Length`, `PageStart`, `PageNumberStart`, `ContinueNumbering`,
`IncludeSectionPrefix`, `SectionPrefix`, `Marker`) mot en riktig,
oberoende IDML-parsers källkod (`dimelords/idmllib`, ett Go-bibliotek)
via webbsökning — inte en gissning den här gången, eftersom jag inte
ville riskera att skriva ogiltig XML för ett element jag inte hade
sett en verklig definition av. `PageStart` pekar på det allra första
`<Page>`-elementets Self-id i hela dokumentet.

**Ärligt om var det här lämnar oss:** detta är den ENDA kvarstående,
konkreta strukturella skillnaden mot verklig IDML-konvention jag kan
identifiera just nu — men till skillnad från PathGeometry/
AllowPageShuffle-fixarna (bekräftade mot en riktig referensfil) och
ID-paddningsfixen (en siffermässig reproduktion som visade sig INTE
lösa det faktiska problemet), är det här INTE verifierat mot InDesign.
Fyra kodfixar och två inställningstester i rad har redan slagit fel på
den här bedriften, så jag kommunicerade tydligt till Mats att det här
är mitt bästa återstående, välgrundade försök — inte en garanti.

**Verifiering:** nytt committat test som kontrollerar att `<Section>`
har korrekt `Length` (matchar totalt antal riktiga sidor) och att
`PageStart` pekar på det första Spreadets egna Page-id. Hela
testsviten (1059 → 1060 test), `tsc --noEmit`, `npm run build`, och
en riktig export genom UI:t (`xmllint --noout` godkände varje fil,
Section-elementet bekräftat korrekt i den extraherade designmap.xml)
kördes rent.

v1.0.121 → v1.0.122.

**Ändringslogg v1.0.122 → v1.0.123 (2026-10-16):** Section-fixen gjorde
"ingen förändring i något av programmen" enligt Mats — men hans nästa
steg gav mig äntligen det jag saknat genom hela sagan: en RIKTIG,
InDesign-genererad referensfil.

**Mats skapade "Call of Cthulhu" FRÅN GRUNDEN i InDesign själv** (inte
via vår app) genom att klistra in ren text och låta InDesign sköta
pagineringen, exporterade som IDML, och delade hela designmap.xml
rakt av. Första gången i hela utredningen jag hade en äkta InDesign
21.6-export att jämföra mot, inte bara ComicBook AI:s referens (som
aldrig trådar textrutor och därför aldrig skulle avslöja ett
trådningsspecifikt problem).

**Två viktiga, direkta fynd från att läsa den riktiga filen:**

1. **Self-ID:n i en riktig InDesign-fil är INTE padda de, sekventiella
   decimaltal** — de är korta hexadecimaler av varierande längd
   ("ucf", "u105", "u10b", "u111"...). Om InDesign själv sorterade
   sidor lexikografiskt som strängar skulle den visa SINA EGNA sidor i
   fel ordning (eftersom "u105" < "ucf" som strängar, men "ucf" kommer
   först i den riktiga, korrekta visningsordningen). Detta bekräftar
   slutgiltigt att v1.0.121:s ID-sorteringsteori var fel från grunden
   — inte bara overifierad, utan direkt motbevisad av InDesigns eget
   beteende mot sin egen fil.

2. **Dokumentet saknar HELT ett `<Layer>`-element i vår egen skrivare**
   — något VARJE riktig IDML-fil har (bekräftat här i Mats riktiga
   export: `<Layer Self="ucc" Name="Lager 1" .../>`, refererat via
   `ActiveLayer="ucc"` på `<Document>`), och något jag missat att
   kontrollera i ALLA tidigare jämförelser — trots att ComicBook AI:s
   egen referensskrivare, som jag jämfört mot upprepade gånger för de
   tidigare bekräftade fixarna (PathGeometry, AllowPageShuffle), FAKTISKT
   redan sätter `ItemLayer` på varenda objekt den ritar och definierar
   `<Layer>`-element i sin egen designmap.xml. Ett konkret, dubbelt
   bekräftat (både ComicBook OCH en riktig InDesign-export) hål i vår
   fil jag helt enkelt missat att leta efter tidigare.

**Rättning:** en enda `<Layer Self="uLayer" Name="Layer 1" .../>`
deklareras nu i designmap.xml, refererad via `ActiveLayer` på
`<Document>`, och varje `<TextFrame>` får `ItemLayer="uLayer"` —
matchar exakt hur både ComicBook AI:s skrivare och Mats riktiga
InDesign-export gör det.

**Ärligt om var det här lämnar oss:** detta är ANNU EN
InDesign-jämförelse-baserad fix (samma kategori som PathGeometry/
AllowPageShuffle, nu bekräftad mot EN RIKTIG InDesign-fil för första
gången i den här specifika trådnings-sagan, inte bara ComicBook) —
men INTE verifierad att den faktiskt löser sidoduplicerings-problemet.
Sex kodfixar och två inställningstester i rad har nu föregått den här,
så jag håller tonen försiktig. Om det INTE löser det, har vi
åtminstone nu, tack vare Mats riktiga referensfil, en mycket bättre
bas för att hitta ÄNNU fler konkreta skillnader (XML-taggning via
`<idPkg:Tags>`/`<idPkg:BackingStory>`, DOMVersion-skillnader, fler
`<Document>`-attribut) om det behövs.

**Verifiering:** nytt committat test som kontrollerar att `<Layer>`
deklareras, att `ActiveLayer` refererar den, och att VARJE TextFrame i
en genererad fil får `ItemLayer` satt. Hela testsviten (1060 → 1061
test), `tsc --noEmit`, `npm run build`, och en riktig export genom
UI:t (`xmllint --noout` godkände varje fil, Layer/ActiveLayer/
ItemLayer bekräftade direkt i den extraherade designmap.xml och
Spreads-filerna) kördes rent.

v1.0.122 → v1.0.123.

**Ändringslogg v1.0.123 → v1.0.124 (2026-10-16):** Layer-fixen gjorde
heller ingen skillnad — men Mats delade två filer till från sin riktiga
InDesign-export som visade sig innehålla den hittills mest konkreta,
substantiella skillnaden i hela sagan.

**Mats:** "Tyvärr blev det inte bättre... Säg till om du vill se fler
XML filer från IDML-filen." Bad om `Spreads/Spread_ucf.xml` (den
första riktiga sidan) och `MasterSpreads/MasterSpread_ud6.xml` från
samma InDesign-genererade referensfil som designmap.xml redan kommit
från. Mats laddade upp båda filerna direkt.

**Två fynd, läst rakt av ur en riktig InDesigns egen export:**

1. **`AppliedMaster="ud6"` på den riktiga sidan** — INTE "n"! Vår
   skrivare sätter uttryckligen `AppliedMaster="n"` ("ingen master")
   på VARJE sida vi genererar. En riktig InDesign-sida har aldrig
   "ingen master" — den tillämpar alltid en verklig mastersida
   (`MasterPageTransform="1 0 0 1 0 0"` finns också, styr hur
   masterns eget innehåll ärvs).

2. **`AllowPageShuffle="true"` på Spread-nivå** — INTE "false"! Det
   här är särskilt slående eftersom vi medvetet satte den till
   `"false"` redan i v1.0.113, baserat på en tidigare, bekräftad
   bugg (från INNAN trådning fanns i arkitekturen — en annan, mer
   grundläggande sida-per-sida-design). En riktig InDesign-fil
   använder uppenbarligen `"true"` som sitt normala, förväntade värde.

**Resonemang kring varför det här sannolikt är den faktiska boven:**
kombinationen "ingen master" + tvingad `AllowPageShuffle=false` är en
sidkonfiguration INGEN riktig InDesign-fil någonsin producerar för en
vanlig innehållssida. InDesigns egen importvalidering må reagera
oförutsägbart på just den ovanliga kombinationen — t.ex. genom att
"reparera" eller kompensera för en sida som saknar en riktig master,
vilket skulle kunna trigga precis den sortens extra, tomma
sidor (med standardmastern "A" synlig, exakt det Mats observerat
genom hela sagan) vi jagat.

**Risk övervägd innan ändring:** v1.0.113:s ursprungliga
AllowPageShuffle-fix löste en bugg vars EGEN beskrivning var "en tom
följeslagarsida FÖRE VARJE sida" (utspridd/interfolierad) — ett annat
mönster än det nuvarande (ETT stort sammanhängande block). Eftersom
de två buggarnas mönster skiljer sig åt, och den tidigare fixen
testades i en arkitektur UTAN trådning och UTAN "ingen master",
bedömdes risken att återinföra den gamla buggen som låg — särskilt
eftersom "ingen master" (den troliga grundorsaken till BÅDA problemen)
försvinner samtidigt.

**Rättning:** `idmlSpreadXml` tar nu emot `masterSelf` och sätter
`AppliedMaster="${masterSelf}"` på varje riktig sida (aldrig "n").
`AllowPageShuffle` ändrat till `"true"` på både `<Spread>` och
`<DocumentPreference>`. `idmlMasterSpreadXml` fick också
`PrimaryTextFrame="n"` tillagt på `<MasterSpread>`-elementet — explicit
angivet i Mats riktiga fil, och relevant först nu när mastern faktiskt
tillämpas på riktiga sidor (tidigare, med "ingen master" överallt,
konsulterades mastern aldrig alls, så den detaljen kunde aldrig spela
någon roll förrän nu).

**Testuppdatering:** de två tidigare testerna "keeps the master spread
unapplied..." och "tells InDesign not to reshuffle..." bytte namn och
vändes till att verifiera det MOTSATTA (master tillämpad, shuffle
tillåten) — de gamla antagandena var, visar det sig, aldrig korrekta
mot hur riktiga InDesign-filer faktiskt ser ut.

**Verifiering:** hela testsviten (1061 test, 79 filer, två omskrivna
tester), `tsc --noEmit`, `npm run build`, och en riktig export genom
UI:t (`xmllint --noout` godkände varje fil; `AppliedMaster` och
`AllowPageShuffle="true"` bekräftade direkt i varje extraherad
Spread-fil och Preferences.xml) kördes rent.

v1.0.123 → v1.0.124.

**Ändringslogg v1.0.124 → v1.0.125 (2026-10-16 till 2026-10-17):**
AppliedMaster/AllowPageShuffle-fixen gjorde INTE heller någon
skillnad — men en lysande idé från Mats (spara om i InDesign och
jämföra DESS egen XML) vände hela utredningen i en ny riktning och
ledde till ännu ett konkret, verifierat strukturfel.

**Mats testade v1.0.124:** "Tyvärr inte bättre. Svårt att se om det
blir samma fel men Indesign inleder med 96 tomma sidor av totalt 191.
Affinity har tomma sidor efter kapitlen" — och senare bekräftat:
"Affinity har 96 sidor" totalt. Samma ~50%-kvot som alla tidigare
tester (96/191 ≈ 50%), helt oförändrad av både Layer- och
AppliedMaster/AllowPageShuffle-fixarna.

**Uteslöt "flera stories"-teorin direkt:** bad Mats testa ett absolut
minimalt manus (bara titel + ETT kort kapitel, 380 ord — alltså bara
2 stories i filen, inte många). Resultat: "gav 7 sidor varav de tre
första var tomma." Buggen uppstår alltså även i det minsta möjliga
fallet — utesluter definitivt att flera oberoende stories i samma
fil är orsaken.

**Mats egen idé, avgörande:** "Jag har öppnat ett av de större
manuskripten och sparat om som IDML ifrån Indesign. Kan det vara
intressant att se hur Indesign lägger upp sin XML med det felaktiga
antalet sidor?" — alltså: öppna VÅR (trasiga) export i InDesign, och
låt INDESIGN SJÄLV spara om filen, för att se vad InDesign internt
ANSER att dokumentet verkligen innehåller, inte bara vad det VISAR.

**Genombrott: InDesigns egen omsparade designmap.xml visade
`Section Length="7"` och exakt 7 `<idPkg:Spread>`-poster** — för
samma 380-ords enkapitelstest. Det här är INTE en visningsillusion
eller panelordningsbugg — det är InDesigns egen, permanent sparade
sanning om hur många sidor den tror innehållet behöver. 7 sidor för
380 ord är cirka 54 ord per sida, extremt glest för en normal
bok-layout (borde rymma flera hundra ord per sida vid 12pt text).

**Egen reproduktion mot Mats RIKTIGA text** (inte syntetisk
placeholder-text den här gången — det faktiska "Kael"/"Maja"-stycket
från JSON-exporten han delade): vår egen kod ger bara **2-4 riktiga
sidor** för exakt samma text, beroende på sidstorlek — långt under
InDesigns bekräftade 7. Det här är INTE en modest, redan accepterad
överskattning (som den ~1.2-1.6x vi sett förut) — det är InDesign som
komponerar SAMMA text till ungefär DUBBELT så många sidor som vi
själva byggde ramar för, med en orimligt låg textdensitet per sida.

**Ny tolkning:** det handlar sannolikt inte om att InDesign "hittar
på" extra tomma sidor i onödan, utan att varje textrams ANVÄNDBARA
yta tolkas som mycket mindre av InDesign än vad vi avsett — vilket
tvingar fram fler sidor för att få plats med samma text, med någon
förskjutning i hur de nya sidorna placeras/sorteras som gör att de
visas FÖRE det riktiga innehållet.

**Konkret skillnad hittad, jämfört mot Mats riktiga referensfils
`TextFramePreference`:** den riktiga filen skriver `InsetSpacing` som
en NÄSTLAD `<Properties><InsetSpacing type="list">`-struktur med fyra
separata `<ListItem type="unit">`-element. Vår skrivare skrev det som
en PLATT attributsträng (`InsetSpacing="0 0 0 0"`) — ett format
InDesigns striktare parser möjligen inte känner igen alls för en
listvärderad inställning (till skillnad från `TextColumnFixedWidth`,
ett enkelt skalärt värde, som förblir en platt attribut både i den
riktiga filen och hos oss). Om InDesign inte känner igen den platta
formen skulle hela `TextFramePreference`-elementet kunna kasseras och
ersättas med betydligt mindre standardmarginaler/yta per ram.

**Rättning:** `InsetSpacing` skrivs nu som en nästlad
`<Properties><InsetSpacing type="list">` med fyra
`<ListItem type="unit">0</ListItem>`, exakt som den riktiga filen.

**Ärligt om räckvidden:** detta är den NIONDE justeringen i den här
sagan (sex kodfixar plus två inställningstester innan denna), och
magnituden på problemet (behöver dubbelt så många sidor, inte bara
lite fler) gör att jag inte är säker på att InsetSpacing ensam
förklarar HELA gapet — men det är en konkret, nyupptäckt, verifierad
skillnad mot en riktig fil, inte en gissning.

**Verifiering:** nytt committat test som kontrollerar att
`InsetSpacing` aldrig skrivs som platt attribut och alltid som en
nästlad lista med fyra noll-värden. Hela testsviten (1062 test, 79
filer), `tsc --noEmit`, `npm run build`, och en riktig export genom
UI:t (`xmllint --noout` godkände varje fil, den nästlade strukturen
bekräftad direkt i den extraherade Spread-filen) kördes rent.

v1.0.124 → v1.0.125.

**Ändringslogg v1.0.125 → v1.0.126 (2026-10-17):** Hittade en EXAKT
matematisk formel bakom hela "tomma sidor"-sagan genom att räkna
siffrorna från två oberoende, riktiga rapporter precist — den mest
konkreta ledtråden hittills.

**Mats testade v1.0.125:** "Fortfarande 7 sidor med 3 tomma sidor. Nu
var det en tom sida på slutet också..." — InsetSpacing-fixen ändrade
INTE totalen (fortfarande 7/3), bara FLYTTADE en av de tomma sidorna
från början till slutet. Ett genuint, mätbart beteende som ändrades,
men inte huvudproblemet.

**Avgörande uppföljningsfråga besvarad:** bad Mats markera en riktig
textram och kolla om texten ser onormalt stor ut. Svar: "Det finns
ingen överskjutande text. Första stycket får kapitel-formatet men
sedan är det brödtext. Textrutorna fyller sidan." — INGEN
överskjutande text betyder att InDesign inte alls behöver de extra
sidorna för att få plats med texten. Slår hål på hela
"InDesign-behöver-mer-utrymme"-teorin från v1.0.125: de tomma sidorna
är genuint onödiga, inte en kapacitetskompensation.

**Mats egen idé:** kapitelbilder — skickas något som strular till
det även utan bild? Kollade koden direkt: `startImageDataUrl`
refereras bara i HTML/ePub/PDF-sektionerna (rad 409, 579, 1057),
ALDRIG i IDML-delen. Uteslöt det på under en minut utan att behöva
fråga Mats testa något.

**Genombrottet — räknade siffrorna exakt mot TVÅ oberoende rapporter:**
- Mats minimala test (titel + 1 kapitel): vår fil = 4 riktiga sidor
  (titel=1 ruta, kapitel=3 trådade rutor). InDesign visade 7 = 4+3.
- "Call of Cthulhu" (titel + 3 kapitel): vår fil = 58 riktiga sidor
  (titel=1, kapitlen 14+24+19 trådade rutor). InDesign visade 115 =
  58+57.

**3 = kapitlets EGNA 3 rutor. 57 = 14+24+19, exakt summan av alla tre
kapitlens EGNA rutor.** Ingen slump — en EXAKT matematisk formel:
varje enhet som är TRÅDAD ÖVER FLER ÄN EN sida (title är aldrig det,
bara 1 ruta) får sitt EGET rutantal dubblerat som extra tomma sidor.
Enheter med bara 1 ruta (aldrig trådade) förblir opåverkade.

**Kopplade mönstret till ett attribut** jag sett i båda Mats riktiga
referensexporter men inte agerat på: `AppliedAlternateLayout` (på
varje `<Page>`) och `AlternateLayout`/`AlternateLayoutLength` (på
`<Section>`). Riktiga sidor anger alltid `AppliedAlternateLayout`
explicit (en riktig referens om Mats dokument råkar ha en alternativ
layout konfigurerad, annars `"n"` på mastersidans egen sida) — vår
skrivare har ALDRIG satt det attributet alls, på någon sida.

**Teori:** InDesign genererar implicit en alternativ-layout-sidmängd
för trådat, flerramsinnehåll specifikt när frågan "finns en
alternativ layout?" lämnas obesvarad (attributet helt frånvarande)
istället för explicit besvarad ("n", ingen) — samma mönster som
`AppliedMaster="n"` behövde vara explicit tidigare i sagan, nu
applicerat på ett annat attribut med en mycket mer precist matchande
numerisk signatur den här gången.

**Rättning:** `AppliedAlternateLayout="n"` och `LayoutRule="UseMaster"`
läggs nu till på varje riktig sida; mastersidans egen sida får
`AppliedAlternateLayout="n" LayoutRule="Off"` — exakt matchande båda
attributvärdena från Mats riktiga referensfiler.

**Ärligt om räckvidden:** detta är den TIONDE justeringen i sagan,
men den FÖRSTA med en exakt, siffermässigt bekräftad formel bakom
sig (inte "ungefär hälften" utan en precis matchande summa i två
oberoende tester av olika storlek). Betydligt högre konfidens än de
flesta tidigare försöken, men fortfarande inte bekräftad mot riktig
InDesign.

**Verifiering:** nytt committat test som kontrollerar att
`AppliedAlternateLayout="n"` och rätt `LayoutRule` anges på varje
riktig sida OCH på mastersidans egen sida. Hela testsviten (1063
test, 79 filer), `tsc --noEmit`, `npm run build`, och en riktig
export genom UI:t (`xmllint --noout` godkände varje fil, båda
attributen bekräftade direkt i den extraherade Spread- och
MasterSpread-filen) kördes rent.

v1.0.125 → v1.0.126.

**Ändringslogg v1.0.126 → v1.0.127 (2026-10-17):** Den ELFTE
justeringen i "tomma sidor"-sagan — och den första som är en genuin,
omisskännlig kodfelaktighet snarare än ännu en skillnad mot ett
referensattribut.

**Mats testade v1.0.126:** "Tusan fortfarande fel. Affinity fick två
tomma sidor efter, Indesign 3 tomma sidor innan." — exakt samma
3-sidors-mönster (kapitlets egna 3 trådade rutor) som innan fixen,
helt opåverkat av `AppliedAlternateLayout`.

**Var ärlig med Mats** om läget: det ENDA konstanta genom alla elva
försök var trådningsmekanismen själv. Lade fram två vägar: (1)
fortsätta leta fler metadataskillnader, eller (2) återgå till
icke-trådad arkitektur (en Story per sida, garanterat eliminerar
triggern men offrar länkade textrutor). **Mats avvisade uttryckligen
alternativ 2:** "Vi ger oss inte... än. Att ha enskilda textsidor är
en mardröm för en grafiker, jag jobbar som grafiker så jag vet 😉 Jag
skickar de xml filer som finns i stories" — och skickade
`Story_u106.xml`/`Story_uea.xml` (Stories från InDesigns egen
omsparning av vår trasiga export) och, i nästa tur, `Story_udf.xml`:
den genuina, ALDRIG-genom-vår-kod "Call of Cthulhu"-storyn, där Mats
klistrade in den riktiga Lovecraft-texten direkt i InDesign och lät
InDesign paginera själv.

**Den avgörande upptäckten:** i Mats genuina referensfil ligger
dussintals verkliga, separata stycken (hela kapitlets brödtext) inom
EN ENDA `<ParagraphStyleRange>`/`<CharacterStyleRange>`, åtskilda
bara av syskon-`<Br/>`-element mellan varje styckes `<Content>` —
INTE som separata `<ParagraphStyleRange>`-element per stycke, och
INGENSTANS i hela filen (~270 rader) förekommer ett `&#13;`- eller
CR-tecken. Filens sista stycke bevisar mönstret: inget efterföljande
`<Br/>`, ingen CR — bara de stängande taggarna direkt. Det betyder
att `<Br/>` är en SEPARATOR mellan stycken med identisk formatering,
inte en terminator, och att själva elementgränsen (ett nytt
`<ParagraphStyleRange>` eller `<CharacterStyleRange>` som börjar) är
tillräcklig för att markera ett styckesslut när formateringen ändras
— bekräftat ytterligare av `Story_u106.xml`, där en tom avslutande
`<ParagraphStyleRange>` följer direkt efter den riktiga, grupperade
utan någon separator alls mellan dem.

**Vår kod gjorde tvärtom:** skapade ALLTID en separat
`<ParagraphStyleRange>` per stycke/block, med ett `&#13;`-tecken
inbakat i `<Content>`-texten på varje styckes sista textkörning
(`IDML_PARA_END`-konstanten, satt redan vid den trådade arkitekturens
återinförande). Till skillnad från de tio tidigare försöken (saknade
attribut som skilde sig från en referensfil) är detta en konkret,
otvetydig felaktighet i hur själva textinnehållet kodas — riktig
InDesign bäddar ALDRIG in ett styrtecken i `<Content>`.

**Varför just detta gav ny förhoppning:** för första gången en
rimlig kausal mekanism som specifikt förklarar varför ENDAST trådade
(flerrams-)enheter drabbas. Ett extra, felaktigt styrtecken som
upprepas en gång per stycke kan bara desynka InDesigns
omflödningsmotor där text faktiskt FLÖDAR över en rambrytning — vilket
aldrig händer för en otrådad enrams-enhet som titelsidan. Det matchar
exakt det ENDA konstanta mönstret genom hela sagan.

**Implementation:** skrev om hela paragraf-serialiseringen i
`manuscriptExport.ts`. Konsekutiva block med identisk
stycke-signatur (stilnamn + drop cap + forcerad fetstil) grupperas nu
till EN `<ParagraphStyleRange>` istället för en per block
(`idmlParagraphsXml`/`idmlBlockGroupKey`). Inom en grupp bygger
`idmlCharacterStyleRanges` en platt sekvens av textkörningar över
ALLA gruppens stycken och slår ihop konsekutiva körningar med
identisk teckenformatering (även över en styckesgräns) till SAMMA
`<CharacterStyleRange>`, med `<Br/>` infogat exakt vid den
styckesgränsen — annars (formatering ändras, mitt i ett stycke eller
mellan två stycken) startar en ny `<CharacterStyleRange>` utan någon
separator, precis som i referensfilen. `IDML_PARA_END`/`&#13;` är
helt borttaget — inget styrtecken bäddas in någonstans längre.

**Verifiering:** två nya committade tester — ett som bygger ett
kapitel med tre konsekutiva brödtextstycken och kontrollerar att de
hamnar i EN `<ParagraphStyleRange>` separerade av `<Br/>` (och att
inget Story-dokument innehåller `&#13;`), ett som kontrollerar att en
stiländring (kapitelrubrik → brödtext) startar en ny
`<ParagraphStyleRange>` utan någon `<Br/>` emellan. Hela testsviten
(1065 test, 79 filer), `tsc --noEmit` och `npm run build` kördes rent.
Riktig export genom UI:t (ett kapitel med 20 stycken separerade av
tomma rader) extraherad och kontrollerad direkt: alla XML-filer
godkända av `xmllint --noout`, kapitlets Story-fil visade exakt EN
`<ParagraphStyleRange>` för de 39 brödtext-blocken (20 riktiga stycken
+ 19 tomma rader) med 38 `<Br/>`-separatorer, noll `&#13;`-referenser
någonstans, och ingen efterföljande `<Br/>` efter sista stycket —
exakt matchande den riktiga referensfilens mönster.

**Ärligt om räckvidden:** detta är den FÖRSTA upptäckten i hela
sagan som är en omisskännlig korrekthetsbugg i textkodningen, inte
bara ännu en skillnad mot ett referensattribut — och den ger för
första gången en rimlig förklaring till VARFÖR bara trådning
triggar felet. Högre tillit än vid de elva tidigare försöken, men
efter den historiken bekräftas ingenting förrän Mats testat i riktig
InDesign igen.

v1.0.126 → v1.0.127.

**Ändringslogg v1.0.127 → v1.0.128 (2026-10-17):** Den TOLFTE
justeringen — Mats testade v1.0.127 och delade Story-filerna från vår
EGEN export: "Det här var en besvärlig nöt. Felet kvarstår." Filerna
visade exakt den struktur jag avsett (grupperade stycken, `<Br/>`,
inget `&#13;`) — CR/Br-rättningen var en genuin kodfelaktighet, men
inte den som orsakar de tomma sidorna.

**Mats föreslog själv** ett rimligt test: skicka texten helt utan
stilmallar, för att utesluta att stilmallsdefinitionerna gör något
konstigt. Utvärderade idén innan vi bad honom testa igen: titelsidan
(ALDRIG drabbad) blandar redan två stilar (Title + Body Text, plus
ev. Voice/Viewpoint-rader) utan problem — om stilmallar var boven
borde titelsidan också visa symptom, eftersom den också blandar
stilar. Det enda som skiljer en drabbad enhet från en opåverkad är
fortfarande bara ANTAL TRÅDADE RUTOR, inte vilka eller hur många
stilar som används. La fram det resonemanget för Mats istället för
att be honom köra ett test jag redan kunde argumentera mot.

**Kollade också Section Length** (tillagt i v1.0.122) för att utesluta
att vi råkat deklarera fel sidantal där — men `pageCount` räknas
direkt från antalet `<Spread>`-element vi faktiskt skriver, så det
stämmer alltid. Uteslöt det på under en minut.

**Ny, mer specifik ledtråd:** `packIdml` har, sedan trådning
återinfördes i v1.0.114, ALLTID lagt till en extra "säkerhetsruta"
utöver den riktiga höjduppskattningen — men ENDAST för enheter med
fler än 1 beräknad sida:
```
const frameCount = estimatedPages > 1 ? estimatedPages + 1 : estimatedPages;
```
Det är den ENDA strukturella skillnaden mellan en drabbad och en
opåverkad enhet som håller exakt genom HELA sagan, oavsett vilken av
de tolv tidigare rättningarna som var på plats: varje flerrams-trådad
enhet har garanterat en sista ruta i kedjan som ofta blir helt eller
nästan tom (ren marginal mot att uppskattningen räknar fel) — en
enrams-enhet (som titelsidan) har aldrig detta.

**Teori:** InDesign tolkar en trådad kedja som slutar i en nästan tom
ruta som ett tecken på att texten svämmar över, och kompenserar genom
att infoga fler sidor — möjligen med antalet redan använda sidor som
en extrapoleringsheuristik, vilket skulle förklara den exakta
matchningen (N extra = enhetens eget rutantal). Redan bekräftat att
det inte är en kapacitetsfråga i sig (ingen riktig overset-text,
Mats egen inspektion i InDesign) — så att ta bort just säkerhetsrutan,
utan att ändra hur en sidas innehåll mäts, är testet.

**Rättning:** `frameCount` sätts nu direkt till den riktiga
höjduppskattningen, ingen marginal utöver den. Risk: om uppskattningen
nånstans räknar fel kan det ge synlig overset-text — ett helt annat,
lätt att upptäcka och ofarligt problem jämfört med de mystiska tomma
sidorna.

**Verifiering:** hela testsviten (1065 test, 79 filer), `tsc --noEmit`
och `npm run build` kördes rent (inget befintligt test låste fast
"+1"-beteendet). Riktig export genom UI:t jämförd direkt: samma
kapitelinnehåll som i en tidigare export gav nu 3 trådade rutor
istället för 4 — säkerhetsrutan borttagen, bekräftat i den
extraherade filen.

**Ärligt om räckvidden:** trettonde försöket totalt, tolfte sedan
den ursprungliga rapporten. Mer specifikt resonerat än de flesta
tidigare (en kodrad som funnits genom HELA sagan, inte ett nytt
metadataattribut), men fortfarande en gissning tills Mats testat i
riktig InDesign.

v1.0.127 → v1.0.128.

**Ändringslogg v1.0.128 → v1.0.129 (2026-10-17):** Den fjortonde
justeringen, byggd på genuint nytt bevismaterial istället för en
gissning — den mest konkreta ledtråden hittills.

**Mats testade v1.0.128:** "Fortfarande fel i indesign med två tomma
sidor först." Men avgörande: säkerhetsrutans borttagande (v1.0.128)
krympte kapitlets rutantal från 3 till 2 — och de tomma sidorna
krympte EXAKT lika mycket, från 3 till 2. Dubbleringen skalar alltså
fortfarande exakt 1:1 med rutantalet, oavsett vilket antal vi ger
den. Det bevisar att säkerhetsrutan aldrig var boven; bara symptomets
storlek krympte proportionellt med indata.

**Tre riktade diagnostiska frågor till Mats** gav, för första gången,
information om VAR felet sitter, inte bara om det är bättre/sämre:
1. Berättarredigeraren visar texten bara EN gång — inget
   innehåll dupliceras internt.
2. Inget går att markera på de tomma sidorna — inte ens en tom
   textruta finns där.
3. Inget rött plustecken (overset) på sista riktiga textrutan.

Tillsammans utesluter detta definitivt textduplicering,
rutkapacitet och overset-driven sidinfogning. De tomma sidorna är
ett rent sido-/sektionsnivå-artefakt, helt frikopplat från vårt
faktiska innehåll.

**Genombrottet:** läste om `Spread_ucf.xml` (den äkta, native
"Call of Cthulhu"-filen, skickad för flera dagar sedan) och såg för
första gången något jag missat: den riktiga innehållssidan har
`AppliedAlternateLayout="ud5"` — en VERKLIG referens, inte `"n"`
som jag satte i v1.0.126! Bad Mats skicka samma fils `designmap.xml`
igen (den gick förlorad vid en tidigare kontext-komprimering, bara
sparad som inklistrad text). Den avslöjade vad `ud5` faktiskt är:
```
<Section Self="ud5" Length="14" AlternateLayoutLength="14" AlternateLayout="A4 V" ... PageStart="ud4" ContinueNumbering="true" ... />
```
**`ud5` är dokumentets egen `<Section>`!** `AppliedAlternateLayout`
på en riktig innehållssida pekar på SEKTIONEN själv — inte "n", och
inte något separat alternativlayout-objekt. 14 = exakt samma
rutantal som detta ensamma dokuments 14 trådade sidor (hela "Call of
Cthulhu"-texten i en enda tråd, ingen separat titelsida i just den
filen). Sektionen har dessutom `AlternateLayoutLength="14"` (samma
som `Length`) och en läsbar `AlternateLayout`-etikett ("A4 V" — A4
stående, exakt dokumentets egen sidstorlek) — båda helt frånvarande
i vår kod. Sektionen saknar också `PageNumberStart` och sätter
`ContinueNumbering="true"`, till skillnad från vår `PageNumberStart="1"
ContinueNumbering="false"`.

**Rättning:** `sectionSelf` genereras nu före sid-loopen (inte efter)
så varje riktig `<Page>` kan referera den via `AppliedAlternateLayout`
istället för `"n"`. `<Section>` får `AlternateLayoutLength` (samma
värde som `Length`) och en sidstorlek-härledd `AlternateLayout`-
etikett (tros vara kosmetisk, exakt ordalydelse inte avgörande),
`ContinueNumbering="true"` och ingen `PageNumberStart`, matchande
referensfilen exakt. Mastersidans egen `AppliedAlternateLayout="n"`
är oförändrad (bekräftat korrekt redan i v1.0.126).

**Ärligt om räckvidden:** detta är den mest konkret bevisade
rättningen i hela sagan — bokstavligen kopierade attributvärden från
en genuin, aldrig-tidigare-sedd dokumentnivå-XML, inte en gissning
baserad på mönsterigenkänning. Men referensfilen har bara EN story
(ingen separat titelsida), så jag kan inte vara helt säker på att
detta förklarar exakt varför bara FLERRAMS-enheter drabbas i vårt
flerenhets-dokument — bara att det är en konkret, bekräftad
skillnad mot äkta IDML som nu är rättad.

**Verifiering:** hela testsviten (1065 test, 79 filer, två befintliga
tester uppdaterade för den nya strukturen), `tsc --noEmit`, `npm run
build`, och en riktig export genom UI:t — `xmllint --noout` godkände
varje fil, och den extraherade designmap.xml visade exakt
`<Section ... Length="4" AlternateLayoutLength="4" AlternateLayout="6X9 V" ... ContinueNumbering="true" .../>`
med varje riktig sidas `AppliedAlternateLayout` pekande på sektionen,
mastersidan oförändrad med `"n"`.

v1.0.128 → v1.0.129.

**Ändringslogg v1.0.129 → v1.0.130 (2026-10-17):** Den femtonde
justeringen — den FÖRSTA som bygger på en genuin referens med exakt
vår egen fils form: två oberoende stories (en otrådad, en trådad över
flera sidor) i samma dokument.

**Mats testade v1.0.129:** fortfarande fel, två tomma sidor först.
Delade även en analys från ett annat AI-verktyg ("Gemini") som pekade
ut just `AppliedAlternateLayout` som boven och föreslog att ta bort
det helt. Kunde motbevisa det direkt utan nytt test: den äkta native-
referensfilen har EXAKT samma mönster (`AppliedAlternateLayout`
pekande på Sektionen) och fungerar utan problem för Mats — om det
vore boven borde hans egen fil visa samma symptom.

**Bad Mats skapa en genuint ny testfil** med två separata textrutor
(inte en enda flödad text) — efter två missförstådda försök (en
omsparning av samma enstory-fil, nerbantad till 2 sidor) fick jag
till slut exakt rätt fil: `Namnlöst-2`, med `StoryList="ue5 u108 ub1"`
— sida 1 en otrådad story ("TEST EGEN TEXTRUTA"), sidor 2–3 en
trådad story (placeholder-text över två rutor).

**Bekräftade:** EN delad `<Section>` täcker hela dokumentet även med
flera oberoende stories (inte en per story) — v1.0.129:s struktur var
alltså redan korrekt där, bara inte hela boven.

**Genombrottet:** bad Mats om de faktiska Spread- och Story-filerna
också. Jämförelsen avslöjade att vår `<Page>`, `<TextFrame>` och
`<Story>` är kraftigt avskalade mot vad en äkta export skriver — på
BÅDA stories, trådad som otrådad, inte något specifikt för trådning:

- `<Page>`: saknade `SnapshotBlendingMode`, `OptionalPage`,
  `AppliedTrapPreset`, `MasterPageTransform`, `TabOrder`,
  `GridStartingPoint`, `UseMasterGrid`, en `Descriptor`/`PageColor`-
  properties-block, och en `GridDataInformation`-block (även på
  mastersidans egen sida). `Page`s `Name` är i verkligheten sidans
  egna sekventiella nummer ("1","2","3"...), ALDRIG en egen
  kapitelrubrik som vi satte — det är inte en äkta IDML-konvention.
- `<TextFrame>`: saknade `ParentInterfaceChangeCount`/
  `TargetInterfaceChangeCount`/`LastUpdatedInterfaceChangeCount` och
  `HorizontalLayoutConstraints`/`VerticalLayoutConstraints` — båda
  paren flaggades redan för länge sen som oprövade kandidater, nu
  äntligen bekräftade med riktiga värden — plus
  `OverriddenPageItemProps`, `BeforeGroupingLayerPosition`,
  `FlexItemWidthMode`/`FlexItemHeightMode`, sex Gradient-nollor,
  `AppliedObjectStyle`, `Locked`, `Visible`, `Name`.
- `<Spread>`s `BindingLocation`: `"0"` BARA på dokumentets allra
  första Spread, `"1"` på alla andra — oavsett vilken story sidan
  tillhör (den otrådade sidan 1 fick "0", båda den trådade storyns
  sidor fick "1" — ett rent positionsattribut, inte
  trådningsspecifikt).
- `<Story>`: saknade `UserText`, `IsEndnoteStory`, en riktig
  `StoryTitle="$ID/"` (inte tom sträng), `StoryPreference`s
  `OpticalMarginSize`/`FrameType`, ett `InCopyExportOption`-element,
  och InDesign 21.x:s `Ai*`-attribut (innehållsursprung-deklaration).

**Rättning:** en samlad trohetsuppdatering snarare än ännu en
enskild-attribut-gissning — alla ovanstående tillagda, matchande den
äkta referensen exakt. Inget av dem enskilt skriker "sidduplicering",
men vår kods element var synbart ofullständiga på BÅDA referensens
stories, trådad som otrådad.

**Verifiering:** tre nya committade tester (sidnumrering + Binding-
Location, Page/TextFrame-attributens fulla uppsättning inklusive
mastersidan, Story-attributens fulla uppsättning). Hela testsviten
(1068 test, 79 filer), `tsc --noEmit`, `npm run build`, och en riktig
export genom UI:t — `xmllint --noout` godkände varje fil, och den
extraherade filen visade exakt `BindingLocation="0"` på första
spreaden och `"1"` på resten, `Page Name` som sekventiella nummer
("1","2","3","4"), och alla nya Story-attribut närvarande.

**Ärligt om räckvidden:** detta är den mest omfattande enskilda
rättningen i hela sagan, byggd på det bästa referensmaterialet vi
någonsin haft (genuint samma form som vår egen fil). Ingen enskild
ny attribut sticker ut som en uppenbar förklaring till den exakta
dubbleringsformeln — det här är en bred, väl underbyggd
trohetsuppdatering snarare än en riktad gissning.

v1.0.129 → v1.0.130.

**Ändringslogg v1.0.130 → v1.0.131 (2026-10-17):** Den sextonde
justeringen — och, enligt Mats egen direkta bekräftelse i InDesign,
äntligen den FAKTISKA lösningen på hela "tomma sidor"-sagan.

**Mats hand-redigerade** själv XML-filerna i en exporterad IDML och
rapporterade: "Jag har justerat i xmlfilerna så det fungerar..."
Tre ändringar:
1. `<Section>` återställd till den äldre formen (`PageNumberStart="1"
   ContinueNumbering="false"`, ingen `AlternateLayoutLength`/
   `AlternateLayout`).
2. `Preferences.xml`: `PagesPerDocument="5"` helt borttaget.
3. `Preferences.xml`: `AllowPageShuffle` ändrat från `"true"` till
   `"false"` på `DocumentPreference`.

**Bedömde vilka av de tre ändringarna som faktiskt hade stöd:** för
Section-återställningen gav Mats ingen egen motivering, och vi har
STARK motbevisning mot att gå tillbaka dit — exakt samma fulla
Section-form (med `AlternateLayoutLength`/`AlternateLayout`) finns
bokstavligen i Mats egna, fungerande native-referensfiler. Behöll
därför v1.0.129/130:s Section-struktur oförändrad. De två
Preferences.xml-ändringarna hade däremot tydlig, självständig
motivering och porterades rakt av.

**Mekanismen (nu äntligen begriplig):** `PagesPerDocument` läses
uppenbarligen av InDesign som en INSTRUKTION att i förväg bygga så
många GENERISKA tomma sidor, INNAN den ens läser designmap.xml:s
egna `<Spread>`-lista — som den sedan försöker stämma av sina
riktiga Spreads mot. En enskild, otrådad sida kan rent ersätta en av
de förbyggda tomma sidorna. En flerrams-tråd kan INTE det — att länka
en kedja av ramar kräver riktigt ramarbete som en generisk
platshållarsida aldrig var byggd för — så InDesign ger upp att stämma
av just den enhetens andel av de förbyggda tomma sidorna och lägger
istället till FÄRSKA sidor för tråden, medan dess egna övergivna
andel förbyggda tomma sidor bara blir kvar oanvända.

**Detta förklarar ÄNTLIGEN varje bevisbit från hela utredningen:**
bara flerrams-enheter drabbades, aldrig enrams; de tomma sidorna
hade ABSOLUT inget på sig (inte ens en tom ram — de var aldrig
riktiga Spreads); storyns egen text lästes alltid EN gång i
berättarredigeraren; och borttagningen av den gamla "+1"-
säkerhetsrutan i v1.0.128 krympte antalet tomma sidor med exakt 1 —
inte för att själva extrarutan var triggern, utan för att den
krympte `PagesPerDocument` med 1 också.

**Rättning:** `PagesPerDocument` helt borttaget (Mats bekräftade att
InDesign bygger sidsekvensen rent från designmap.xml:s egna Spreads
utan det). `DocumentPreference`s egen, dokumentövergripande
`AllowPageShuffle` sätts nu till `"false"` — ett HELT ANNAT attribut
än varje enskild `Spread`s egen `AllowPageShuffle` (bekräftat `"true"`
på varje riktig Spread sedan v1.0.124, lämnad oförändrad).

**Verifiering:** ett befintligt test uppdaterat för den nya
Preferences.xml-formen. Hela testsviten (1068 test, 79 filer),
`tsc --noEmit`, `npm run build`, och en riktig export genom UI:t —
`xmllint --noout` godkände varje fil, extraherad Preferences.xml
visade `PagesPerDocument` helt frånvarande och
`AllowPageShuffle="false"` på DocumentPreference, varje Spreads egen
`AllowPageShuffle="true"` oförändrad.

**Ärligt läge:** Mats har själv sett detta fungera i riktig InDesign
genom handredigering — den starkaste bekräftelsen hittills i hela
sagan. Nästa steg är att Mats testar APPENS EGEN export (inte hans
handredigerade fil) för att bekräfta att de porterade ändringarna
ensamma räcker.

v1.0.130 → v1.0.131.

**SAGAN AVSLUTAD (2026-10-17):** Mats testade v1.0.131:s egen export
genom appen (inte den handredigerade filen) med ett riktigt
flerkapitel-dokument (titel + 2 kapitel, 5 sidor totalt) och
bekräftade sida för sida: "Sida 1 - IDML-test... Sida 2 - 1. Chapter
1 The rain poured down... Sida 3 - TOM... sida 4 - 2. Chapter 2 The
rain poured down... Sida 5 - TOM." De två tomma sidorna oroade först,
men Mats egen diagnostik (skrev in numrerade testrader för att se var
text faktiskt svämmar över) visade att de är kapitel 1:s och 2:s
andra, trådade ram — en RIKTIG, korrekt kopplad textruta, bara nästan
tom eftersom höjduppskattningen reserverade några rader mer än
texten faktiskt behövde. Helt annan kategori än de gamla
spökesidorna (som aldrig hade ens en ram att klicka på) — samma
ofarliga marginal Affinity alltid visat efter varje kapitel, aldrig
boven i den här sagan.

Mats: "Vi firar. Om jag är den grafiker som ska ta hand om dokumentet
är det en enkel sak att ta bort sidor. Tack för allt jobb!" — bekräftat
avstått från att strama åt uppskattningen ytterligare; en nästan-tom
sista sida i en tråd är trivial för en grafiker att hantera manuellt.

**Facit för hela sextonförsöks-sagan:** den faktiska boven var
`DocumentPreference`s `PagesPerDocument` (InDesign förbyggde så många
generiska tomma sidor innan den läste de riktiga Spreads, och kunde
bara stämma av otrådat innehåll mot dem — en trådad kedja kunde inte
återanvända sin andel, vilket lämnade exakt dess egna rutantal som
övergivna, äkta tomma sidor) tillsammans med `DocumentPreference`s
dokumentövergripande `AllowPageShuffle`. De tolv föregående fixarna
(ID-padding, Section, Layer, AppliedMaster/AllowPageShuffle per
Spread, InsetSpacing, AppliedAlternateLayout, Story XML-ParagraphStyle-
Range/Br-omskrivning, borttagen säkerhetsruta, Page/TextFrame/Story-
trohetspasset) var alla genuina, bekräftade rättningar mot vad äkta
InDesign-export faktiskt skriver — men ingen av dem var roten.
Löstes till slut genom att Mats själv hand-redigerade en exporterad
fils XML och empiriskt testade i InDesign, inte genom ännu en
referensfils-jämförelse.

**Ändringslogg v1.0.131 → v1.0.132 (2026-10-18):** Mats rapporterade,
med nästan slut på sin egen användningsgräns för dagen, att "Skapa
backup" inte gjorde något alls i Brave — ingen dialogruta, ingen fil,
inget fel — och att han aldrig fick en "vanlig" spara-som-ruta.

Backup, Publish, app-exporten och Story Bible-kortexporten laddade
alla ner via samma gamla knep: en dold `<a download>` plus en
syntetisk klick. Bytte ut det mot ett försök med en riktig,
webbläsarnativ Spara-dialog först (File System Access API:ns
`showSaveFilePicker`, stöds av alla Chromium-webbläsare inklusive
Brave, samt skrivbordsappens egen WebView2), med det gamla
`<a download>`-tricket kvar som fallback där API:t helt saknas
(Firefox, Safari) eller misslyckas av annan anledning än att
användaren själv avbröt — att avbryta den nya dialogen respekteras nu
som ett riktigt "spara inte", inte en tyst omstart med fallback-vägen.

**Verifiering:** `tsc --noEmit`, hela testsviten (1068 test, 79
filer), `npm run build` kördes rent. Kunde inte fullt testa den
riktiga Spara-dialogen live (den väntar på en äkta OS-dialogruta som
en huvudlös testmiljö inte kan svara på), men bekräftade att
fallback-vägen (när `showSaveFilePicker` saknas, simulerat genom att
ta bort den innan sidan laddar) fungerar korrekt end-to-end genom en
riktig nedladdning i webbläsaren. Mats får testa den riktiga
dialogrutan i Brave själv när han är tillbaka.

v1.0.131 → v1.0.132.

**Ändringslogg v1.0.132 → v1.0.133 (2026-10-20):** Mats delade ett
meddelande han skrivit till testaren som pekade ut ett "definitivt
fel på StoryBook AI-sidan": Polish begär bara 1 800 output-tokens,
vilket inte räcker för en full redigering av ett 4 000-ords kapitel,
och svaret kontrolleras aldrig för om det faktiskt klipptes av vid
gränsen.

**Grundorsak:** `polishChapter` skickade alltid `maxTokens: 1800`,
oavsett kapitlets längd — rimligt för kortare texter, men Polish
skriver om HELA kapitlet (inte scen för scen som Draft/Recast), så
svaret behöver ungefär lika mycket utrymme som originaltexten. Och
varken `completeOllamaChat` (Ollama) eller
`OpenAICompatibleLocalProvider.chat()` (LM Studio/Strata-liknande
servrar) någonsin kollade om svaret faktiskt klipptes av vid
tokengränsen — bara innehållet lästes ut och returnerades som om det
vore ett komplett, färdigt svar. Samma brist påverkade alla
funktioner som använder den icke-strömmande `chat()`-vägen, inte bara
Polish — den strömmande vägen (`streamChat`) hade redan motsvarande
koll (`finishReason: "length"`).

**Rättning:** Polish:s tokenbudget skalar nu från kapitlets egen
uppskattade tokenlängd (`estimateTokens`, redan använd för
prompt-debug-vyn), med marginal för att omskrivningen kan bli lite
längre än originalet, och ett golv så korta kapitel fortfarande får
en rimlig budget. Båda lokala modell-adaptrarna kastar nu ett tydligt
fel när ett icke-strömmande svars egna `done_reason`/`finish_reason`
(eller, för Ollama, `eval_count >= maxTokens` när `done_reason`
saknas) säger att det klipptes av — istället för att tyst ge tillbaka
en ofullständig text som om den vore klar.

**Om "thinking"/reasoning_effort-tipset** i samma meddelande (om
Strata hanterar tankeläge annorlunda för externa API-klienter): det
är inte bekräftat som ett StoryBook AI-fel, utan en fråga riktad till
testaren att kolla på Strata-sidan — ingen kodändring gjord för det
just nu.

**Verifiering:** fyra nya committade tester (Ollama-avklippning via
`done_reason` och via `eval_count`-fallback, OpenAI-kompatibel
avklippning via `finish_reason`). Hela testsviten (1071 test, 79
filer), `tsc --noEmit`, `npm run build` kördes rent.

v1.0.132 → v1.0.133.

**Tillägg (samma dag):** medan ovanstående Polish-fix pågick fixade
Mats själv (via en egen gren/PR, `fix/backup-save-dialog`, mergead
rakt in i samma 1.0.133-release) den riktiga roten till
Brave-spara-dialog-buggen min egen v1.0.132 trodde sig lösa men inte
riktigt gjorde. Den faktiska buggen: `showSaveFilePicker` plockades
ut löst från `window` (`const picker = window.showSaveFilePicker`)
och anropades sen utan sin ursprungliga `this`-mottagare — något VARJE
riktig webbläsare kastar "Illegal invocation" för, inte alls Brave-
specifikt som jag antog. Rättat till `picker.call(window, ...)`.

Lade också till det som faktiskt behövdes för att undvika att
webbläsarens "transient activation" (tillåtelsen att öppna en
spara-dialog, som bara gäller en kort stund efter en riktig
användarklick) hinner ta slut: spara-dialogen öppnas nu synkront i
klick-/submit-hanteraren, INNAN typsnittsladdning eller PDF/IDML-
rendering (som kan ta sekunder) får chansen att äta upp den. Lade
till synliga sparar-/felstatusar i både Backup- och Publish-
dialogerna, samt en hjälptext om Braves egen "Fråga var varje fil ska
sparas"-inställning för fallback-vägen.

Mergeade in detta (`git merge origin/main`, inga konflikter — helt
skilda filer från min egen Polish-fix) innan push, körde om hela
verifieringskedjan (1083 test, 80 filer — inklusive en ny
`tests/ui/download-json.test.ts` från Mats egen gren), `tsc --noEmit`,
`npm run build`. Mats bekräftade direkt i Brave: "Brave är åtgärdat :)"

**Ändringslogg v1.0.133 → v1.0.134 (2026-10-20):** Mats undrade om
man kunde justera bredden på vänster- och högerpanelen, och kanske
trycka in dem mot kanten — och godkände att vi byggde det direkt
("Nej bygg gärna det.").

Det visade sig att "trycka in mot kanten" redan fanns: panelerna har
sedan tidigare ett pin/hover-baserat auto-dölj-system (inspirerat av
NEO:s "edge-reveal"-paneler) — avnålad panel krymper till en tunn
kantremsa och viks ut vid hover. Det som faktiskt saknades var att
kunna DRA i bredden.

**Implementation:** båda panelernas bredd flyttades från hårdkodade
CSS-värden (`15rem`/`28rem`) till React-state (`leftRailWidth`/
`rightRailWidth`, med rimliga min/max-gränser: 180–420px vänster,
280–620px höger), exponerat till CSS via egna variabler
(`--rail-left-w`/`--rail-right-w`) satta som inline-style på
`.editor-body`. Ett nytt dra-handtag (`.rail-resize-handle`,
`role="separator"`, `onPointerDown`) renderas längs panelens inre
kant — bara när panelen är nålad, annars är det inget att dra i.
Själva dragningen (`startRailResize`) lyssnar på `pointermove`/
`pointerup` på `window` snarare än på handtaget, så dragningen inte
avbryts om muspekaren hinner före handtagets smala hit-yta.

**En CSS-fiffighet som bet mig under verifieringen:** `.rail` sätter
bara `overflow-y: auto`, men CSS-specen säger att om EN axel är
`auto`/`scroll` och den andra är `visible`, blir den "visible" axeln
också implicit `auto` — så `overflow-x` blev tyst `auto` också. Mitt
första försök placerade handtaget till hälften UTANFÖR panelens
högra/vänstra kant (`right: -3px`/`left: -3px`, för att centrera
greppytan över kantlinjen), men den delen som stack ut klipptes bort
av den implicita `overflow-x: auto` och tog aldrig emot några
pekarhändelser — Playwright-testet visade att `elementFromPoint` på
handtagets mittpunkt träffade panelen (`<aside>`), inte handtaget.
Flyttade handtaget helt innanför panelens kant (`right: 0`/`left: 0`)
istället, vilket löste det.

**Verifiering:** `tsc --noEmit` och hela testsviten (1083 test, 80
filer) rent, `npm run build` rent. Körde även en riktig
drag-och-släpp-verifiering med Playwright mot `npm run dev` — skapade
en bok, drog i båda handtagen och bekräftade att CSS-variablerna
(och panelernas faktiska renderade bredd) ändras i rätt riktning för
båda paneler, samt att avnålning + att flytta musen bort fortfarande
kollapsar panelen till kantremsan som förut.

v1.0.133 → v1.0.134.

**Tillägg (samma dag, CI):** när jag kollade GitHub Actions-status för
pushen ovan upptäckte jag att "Desktop build (Windows)" faktiskt
misslyckats på VARJE commit sedan v1.0.127 (2026-10-17) — fem raka
körningar, inklusive IDML-sagans avslutande commits och Mats egen
Brave-fix, alla röda redan vid `npm ci`, långt innan den faktiska
appbygget ens startar. Ingen av oss hade märkt det eftersom varken
jag eller Mats följt upp CI-status mellan varje enskild commit under
den perioden.

**Grundorsak:** `package-lock.json`:s låsta post för
`@ocedo-apps/storycore` hade en `resolved`-URL av formen
`git+ssh://git@github.com/...` istället för `git+https://...` —
troligen bakad in av en `npm install` körd på en maskin med en
git-konfiguration som skriver om `https://github.com/` till
`ssh://git@github.com/` (vanligt för den som vill ha all GitHub-
trafik över SSH). GitHub Actions-löparen har ingen SSH-nyckel för
GitHub, bara token-baserad HTTPS-åtkomst via `actions/checkout`, så
`npm ci` kraschade med "Permission denied (publickey)" så fort den
skulle läsa det beroendet.

**Rättning:** ändrade den enda `resolved`-posten tillbaka till
`git+https://`. Verifierade med en RIKTIG `npm ci` (inte `--dry-run`,
som inte faktiskt testar nätverksklonen) i en isolerad temp-mapp —
gick igenom rent på 12 sekunder. Körde om hela testsviten (1083 test,
80 filer) och `tsc --noEmit` i huvudrepot efter att ha återställt
`node_modules` dit också (en tidigare dry-run-undersökning hade av
misstag tagit bort paketets installerade mapp lokalt).

v1.0.134 (samma version, utökad commit).

**Ändringslogg v1.0.134 → v1.0.135 (2026-10-20):** Mats, direkt efter
panel-resize-leveransen: "Själva redigeringsytan är exakt samma bredd
som texten, den skulle må bra av att ha padding och kanske en tunn
mörkgrålinje som visar redigeringsytans ytterkant."

`.prose` (den riktiga contentEditable-ytan kapitelprosan skrivs i)
hade `padding: 0.2rem 0 1rem` — praktiskt taget ingen horisontell
marginal alls, och `border: 0`, så ytan smälte ihop med bakgrunden.
Satte riktig padding (`1rem 1.5rem 1.25rem`) och en tunn
`1px solid var(--border-soft)`-ram med lätt rundning, samma i båda
teman (`--border-soft` är redan tema-medveten).

**En detalj som krävde eftertanke:** `.prose-rare`, en osynlig
absolutpositionerad tvilling av texten (`inset: 0` ovanpå `.prose`)
som ritar highlight-markeringar (sällsynta ord, klichéer, etc) ovanpå
den riktiga texten, måste matcha `.prose`:s nya padding EXAKT —
annars hamnar markeringarna fel mot den faktiska texten. Gav
`.prose-rare` samma padding plus en `1px solid transparent`-ram
(osynlig, men upptar lika mycket plats som `.prose`:s riktiga
`1px`-ram, viktigt eftersom båda är `box-sizing: border-box` och
syskon i samma förälder). Verifierade anpassningen med Playwright:
skrev text, slog på RARE-highlighting, och jämförde
`getBoundingClientRect()` för båda elementen — identiska rektanglar.

Övriga overlays (placeholder-markörer, markeringsmenyer,
format-verktygsfältet) positioneras redan dynamiskt via riktiga
`getBoundingClientRect()`-mätningar av den faktiska textgeometrin,
inte mot antagna CSS-konstanter, så de behövde ingen ändring.

**Verifiering:** `tsc --noEmit` och hela testsviten (1083 test, 80
filer) rent. Playwright mot `npm run dev`: skrev text, tog en
skärmdump som visar padding och ram tydligt, bekräftade pixelexakt
justering av highlight-overlayn enligt ovan.

v1.0.134 → v1.0.135.

**Ändringslogg v1.0.135 → v1.0.136 (2026-10-20):** Mats, direkt efter
att se en skärmdump av v1.0.135: "Visst löper sidan hela vägen ner?
På den bild du skapade såg det ut som om innehålssrutan var en input
box... typ." Helt rätt observation — `.prose` sizar bara till sitt
eget textinnehåll (vanligt block-element), så med kort text slutade
ramen strax under sista textraden istället för att nå ner mot botten
av det synliga området, precis som en liten `<textarea>` snarare än
en sida.

**Rättning:** `.prose-body` (den positionerande föräldern, redan
`flex`-barn i `.prose-wrap`) fick `flex: 1 1 auto` så den fyller allt
kvarvarande utrymme i den scrollande `.prose-wrap`-kolumnen; `.prose`
fick `min-height: 100%` så ramen/paddingen alltid når ner till botten
av det synliga området — men fortfarande bara ett golv, inte ett tak:
växer texten förbi det scrollar `.prose-wrap` som vanligt. Overlayn
`.prose-rare` (`inset: 0` på `.prose-body`) följer automatiskt med
eftersom den redan fyller sin förälders hela box.

**Verifiering:** Playwright mot `npm run dev` — tomt kapitel (ramen
sträckte sig från y≈336 till y≈760 i en 900px-vy, mot tidigare att
sluta direkt under texten), sedan 720 ord text (boxen växte till
~2572px scrollhöjd mot 425px synlig höjd, scrollade korrekt), och en
ny jämförelse av `.prose`/`.prose-rare`:s `getBoundingClientRect()`
i båda lägena — fortsatt identiska. `tsc --noEmit` och hela
testsviten (1083 test, 80 filer) rent.

v1.0.135 → v1.0.136.

**Ändringslogg v1.0.136 → v1.0.137 (2026-10-20):** Mats fortsatte
tankegången från padding/kant-ändringen: "Kan man tänka sig att
användaren kan välja bakgrund bakuom redigeringstexten?" — en
dekorativ bakgrund bakom redigeringsytan, utanpanelerna som idag. En
kort resonemangsrunda (inte byggd förrän han skickade riktiga bilder):
konstaterade att de fält som redan ligger ovanför prosan (kapitel-
rubrik, Chapter settings-toggle, scenpanel, trådchips) skulle behöva
en egen gemensam box för att inte bli oläsliga mot en mer påtaglig
bakgrund; Mats: "Vi kan ha en gemensam box." Följdfråga: "om man gör
det så, kan man ha bakgrunder utan att bry sig om texter?" — ja,
exakt poängen: om alla textbärande ytor är solida spelar bildens eget
innehåll ingen roll för läsbarheten.

Mats skickade sedan två riktiga Pexels-bilder (dimmig höstskog,
liggande; Vintergatan, stående) och bad om att rotera rymdbilden
("Rymdbilden kan roteras kanske") eftersom den stående bilden inte
passar bakom en bred redigeringsyta.

**Implementation:**
- Ny BookSchema-inställning `editor_background: "none" | "forest" |
  "milky-way"` (default `"none"`), ren redigerar-preferens — rör
  aldrig Publish-exporter, som saknar motsvarande "duk".
- Bilderna roterades (`convert -rotate 90` på Vintergatan-bilden,
  1000×1500 → 1500×1000) och lades i `src/assets/backgrounds/`,
  importerade via Vites `?url`-mönster (samma som typsnittsfilerna i
  `publishFonts.ts`) i en ny `src/ui/editorBackgrounds.ts`.
- `.manuscript` får bakgrundsbilden som inline-stil
  (`manuscriptBackgroundStyle` i Editor.tsx), satt på BÅDA
  `<main className="manuscript">`-instanserna (kapitelredigeraren och
  synopsis-vyn) så båda ProseCanvas-ytor delar samma bakgrund.
- `.chapter-head` fick en egen box (`background: var(--panel)`,
  `border`, `border-radius`, padding) — den gemensamma boxen Mats
  efterfrågade för titel/inställningar/scener/trådar tillsammans,
  istället för separata boxar för varje fält.
- **Viktig detalj som krävde omstrukturering**, inte bara ett tillägg:
  v1.0.135 satte `.prose`:s egen bakgrund till opak direkt — men
  `.prose`:s highlight-overlay-mekanism (RARE/TICS/FACTS/FIND) bygger
  på att `.prose`:s text blir `color: transparent` medan den UNDER-
  liggande `.prose-rare`-dubbletten (med riktiga highlight-`<mark>`)
  lyser igenom en transparent bakgrund. En opak `.prose`-bakgrund
  hade helt dolt den dubbletten varje gång en highlight-vy var
  påslagen. Löst genom att flytta det opaka utseendet (bakgrund, kant,
  rundning) EN nivå upp till `.prose-body` (den gemensamma föräldern
  till både `.prose` och `.prose-rare`) istället — `.prose` och
  `.prose-rare` är båda kvar transparenta/padding-matchade som innan
  v1.0.135, och highlight-mekanismen fungerar oförändrat, samtidigt
  som boxen alltid är solid oavsett vilket läge som är aktivt.

**Verifiering:** Playwright mot `npm run dev` i båda teman — satte
bakgrunden till Vintergatan (bekräftade `background-image` pekar på
rätt bundlad fil) och till Skogen, slog på RARE-highlighting och
kontrollerade att markeringarna fortfarande syns korrekt ovanpå den
solida kapitel-/prosa-boxen i båda fallen, tog skärmdumpar av alla
kombinationer. Ny testfall i `tests/core/book-schema.test.ts`:
default `"none"` samt att äldre sparfiler utan fältet fylls i korrekt
vid parsning. `tsc --noEmit`, hela testsviten (1084 test, 80 filer),
`npm run build` — alla rena.

v1.0.136 → v1.0.137.

**Ändringslogg v1.0.137 → v1.0.138 (2026-10-20):** Mats, direkt efter
att se bakgrundsfunktionen: "Textlänkarna och knapparna längst ner
borde ligga på en panelbakrund likt höger och vänster." `.manuscript-
foot` (ordräkning, highlight-togglarna, Draft/Polish/Stats/Analyze/
History-knapparna) låg bart direkt på `.manuscript`-bakgrunden, bara
avskilt med en tunn `border-top`-linje — samma problem som
kapitelhuvudet hade innan förra ändringen.

**Rättning:** `.manuscript-foot` fick samma boxbehandling som
`.chapter-head` och `.prose-body` (`background: var(--panel)`,
`border`, `border-radius`, padding runt om istället för bara
`border-top`), plus `align-self: center; max-width: 54rem` så den
är lika bred och centrerad som boxarna ovanför den — tidigare sträckte
den sig hela `.manuscript`:s bredd (synligt bara på breda fönster;
en redan existerande `.editor.is-maximized .manuscript-foot`-regel
hade för övrigt redan satt exakt samma centrering för maximerat läge,
vilket bekräftade att detta var rätt riktning, inte en gissning).

**Verifiering:** Playwright-skärmdump mot Vintergatan-bakgrunden —
fotraden syns nu som en tydlig, konsekvent panel-box. `tsc --noEmit`
och hela testsviten (1084 test, 80 filer) rent.

v1.0.137 → v1.0.138.

**Ändringslogg v1.0.138 → v1.0.139 (2026-10-20): "Importera från
Novelcrafter" — första import-adaptern.** Startpunkten var startsidan
i ComicBook AI — Mats bad mig kolla hur den var byggd (`rör ingen kod
i ComicbookAI`). Min första klon visade sig vara 84 commits efter
(`git fetch` + fast-forward löste det); hittade då `ProjectStart.tsx`
+ `projectStart.css` — fyra kort i 2×2 (Skapa sidor direkt / Starta
med manus / Importera från StoryBook AI / Öppna ett projekt). Vi
enades om att startsidans egna kort byggs SENARE; "Importera backup"
och "Nytt manus"-korten var redan uppenbara, men fjärde/import-kortet
krävde research.

**Research innan kod:** kollade vad StoryBook AI redan hade (mer än
väntat) — `LoreImportCard`/`splitLoreArticles` (källoberoende
batch-import till Story Bible, skeppad sedan v0.99.61), och en redan
nedtecknad princip i roadmap-ideas.md #28: "StoryBook AI skriver,
SandboxAI spelar" — SillyTavern/Campfire nedprioriterade medvetet
eftersom de är ROLLSPELS-verktyg (karaktärsstats, relationskartor),
fel målgrupp för ett skrivverktyg. Mats föreslog istället Scrivener,
Sudowriter, Novelcrafter — alla tre riktiga skrivverktyg, rätt
målgrupp. Vi valde Novelcrafter först (enklast format: JSON/Markdown,
och Mats hade redan kartlagt verktyget i en tidigare konkurrens-
jämförelse).

**Formatresearch:** Novelcrafter är INTE open source (trots Mats
antagande) — kollad via WebSearch, inget officiellt GitHub-repo.
Novelcrafters egen dokumentation (WebFetch mot deras hjälpsidor)
bekräftade: manusexport = ett enda Word- ELLER Markdown-dokument (inte
en ZIP av flera filer), med av/på-val för akt-titlar/scen-underrubriker/
sammanfattningar. Codex-exportens interna JSON/YAML-struktur är
UTTRYCKLIGEN inte dokumenterad ens av Novelcrafter själva. Beslut,
efter samma princip som redan gäller för Campfire i roadmap-ideas.md
("när det finns en verklig export-/backupfil att bygga och testa mot,
inte förr"): bygg manus-importen nu (välbeskrivet format), vänta med
Codex-importen (karaktärer/platser) tills Mats kan skicka en riktig
testexport.

**Implementation:**
- `src/core/manuscriptImport.ts` — källoberoende Markdown-till-kapitel-
  delare (parallell arkitektur till `loreImport.ts`): `headingLevelCounts`,
  `suggestChapterHeadingLevel` (gissar rubriknivå genom att välja den
  med flest förekomster — osäkert i grunden eftersom inga två
  skrivverktygs Markdown-export är överens om var "Akt" slutar och
  "Kapitel" börjar), `splitMarkdownIntoChapters(text, level)`. Text
  före första rubriken blir ett eget namnlöst inledande kapitel (precis
  som `splitLoreArticles`:s preamble-hantering — första implementation
  smälte av misstag ihop den med nästa kapitel, fångat av ett eget
  test och rättat innan leverans). En grundare rubrik än den valda
  nivån (en Akt-rubrik mellan kapitel) vikas istället in i NÄSTA
  kapitels text snarare än att bli ett eget spökkapitel.
- Ny `ImportManuscriptCard.tsx` — fil-uppladdning ELLER inklistring,
  en levande förhandsgranskning (rubriknivå-väljare + antal hittade
  kapitel + kapitellista) innan något importeras, samma UX-princip
  LoreImportCard redan etablerat ("visa vad som hittades, låt
  författaren justera, aldrig en tyst gissning").
- Ny store-action `importMarkdownManuscript` (BookStore.tsx) — kör
  varje kapitels prosa genom `applyMarkerConversion` (samma
  `DEFAULT_MARKER_CONVERSION_RULES` som "Convert markers to
  formatting"-verktyget) så `*kursiv*`/`**fet**` blir riktig formatering
  istället för bokstavliga asterisker i den importerade texten.
- Ny knapp "Importera från Novelcrafter" på startsidan, bredvid
  "Import backup" — det riktiga kortet kommer när startsidans fyra
  kort byggs, men funktionen själv behövde inte vänta på det.

**Verifiering:** nya enhetstester (`manuscript-import.test.ts`, 13
test, inklusive regressionstestet som fångade preamble-buggen).
Playwright mot `npm run dev`: laddade upp en syntetisk Novelcrafter-
liknande fil (två Akt-rubriker, tre kapitel, `*kursiv*`/`**fet**`),
bekräftade 3 korrekt identifierade kapitel i förhandsgranskningen,
körde den riktiga importen, och läste av det färdiga kapitlets
HTML — Akt-rubriken korrekt infälld som vanlig text, kursiv/fet
korrekt renderad som riktig formatering. `tsc --noEmit`, hela
testsviten (1097 test, 81 filer), `npm run build` — alla rena.

v1.0.138 → v1.0.139.

**Ändringslogg v1.0.139 → v1.0.140 (2026-10-20): avbrandning från
Novelcrafter.** Mats, efter att själv ha kollat vidare: "Jag har
kollat lite och det finns novelcraft och novelcrafter. Ybå olika
system." — "Novelcraft" och "Novelcrafter" visade sig vara TVÅ olika,
orelaterade verktyg. Hans slutsats: hellre ett generiskt
textfils-/Markdown-importflöde, och be användare som vill ha stöd
för ett specifikt annat system höra av sig med en riktig exportfil
att undersöka — exakt samma "vänta på verklig data innan en adapter
byggs"-princip som redan gäller för Campfire/Authoric i
roadmap-ideas.md #28.

Egentligen bara en ombrandning, inte en kodändring — funktionen
byggd i v1.0.139 (`manuscriptImport.ts`, `ImportManuscriptCard.tsx`)
var redan källoberoende rubrik-baserad textdelning, aldrig faktiskt
knuten till något Novelcrafter-specifikt dataformat. Döpte om
knapp/kort från "Importera från Novelcrafter" till "Importera manus
(textfil)" i alla tre språk, mjukade upp inledningstexten till att
nämna "en export från ett annat skrivverktyg, eller bara en
.txt/.md-fil du redan har" istället för att namedroppa Novelcrafter,
och lade till en rad som bjuder in kontakt för andra format. Ingen
etablerad kontaktkanal (ingen About-dialog, inget publikt e-post-
/supportfält) fanns att peka texten mot — höll den kanalneutral och
flaggade det till Mats.

**Verifiering:** `tsc --noEmit`, hela testsviten (1097 test, 81
filer) rent. Playwright-skärmdump bekräftar den omdöpta knappen och
kortets nya text.

v1.0.139 → v1.0.140.

**Ändringslogg v1.0.140 → v1.0.141 (2026-10-20): startsidans 2×2-kort,
äntligen.** Mats: "Då kan vi bygga startsidan med de kort vi känner
är rimliga. Nytt manus. Importera från Storybook och Importera bok
(TXT) samt guide" — de fyra korten som diskuterats sedan ComicBook
AI-genomgången (`ProjectStart.tsx`) landade äntligen som riktiga
kort hos oss, fast med våra egna fyra verkliga åtgärder istället för
ComicBooks sidvy/manus-uppdelning.

**Implementation:** ny `.home-start`-sektion (`"Var vill du
börja?"`) med en 2×2-kortgrid (`.home-start-cards`), samma visuella
språk som ComicBooks `.project-start-card` men med appens egna
CSS-variabler (`--panel`/`--border-soft`/`--ink`, redan identiskt
namngivna sen tidigare). Fyra kort:
1. **Starta nytt manus** — enda kortet med inbäddat innehåll (ett
   titelfält + Skapa-knapp) snarare än en ren knapp, eftersom det
   redan fanns ett färdigt, fungerande titelformulär att återanvända
   rakt av istället för ett extra klick-för-att-visa-steg.
2. **Importera backup** — kortet triggar samma dolda filinput som
   redan fanns.
3. **Importera manus (textfil)** — öppnar det redan byggda
   `ImportManuscriptCard`-overlayet (v1.0.139/140).
4. **Guiden** — samma `onOpenGuide`-handler som fanns sedan innan.

Tog samtidigt bort den gamla spridda `home-heading-actions`-knappraden
(Guide/Importera backup/Importera manus låg där som smala knappar)
och det fristående `<form className="new-book">`-blocket under den —
inga nya åtgärder, bara samma fyra omorganiserade till kort.
"Kolla uppdateringar" (bara i skrivbordsappen) fick ligga kvar som
egen knapp i header-raden, hör inte ihop med "var vill du börja".

**Verifiering:** `tsc --noEmit`, hela testsviten (1097 test, 81
filer), `npm run build` rent. Playwright mot `npm run dev`:
skärmdump av hela kortgriden, samt en fullständig funktionstest av
kort 1 (skrev en titel, klickade Skapa, bekräftade att manuset
skapades och öppnades korrekt).

v1.0.140 → v1.0.141.

**Ändringslogg v1.0.141 → v1.0.142 (2026-10-20): ⚙️/🎬-popovers
istället för inline Chapter settings/Scenes.** Två funderingar från
Mats, uttryckligen i samma anda som startsidans omorganisering —
"ge mer utrymme åt själva dokumentet":

1. "Om man ska flytta Chapter settings till ett kugghjul på själva
   Kapitlet i vänstra panelen. När man klickar på kapitlet får man
   en modal ruta..." Jag gillade tanken men föreslog att fundera på
   en lättare popover istället för en tung modal. Mats förtydligade:
   "Jag använder kanske fel term när jag säger modal ruta. Huvudsaken
   är att det är något som lägger sig ovanpå manuskriptet och inte
   skjuter iväg det som det är nu."
2. "Om man ska göra samma för scener men med en liten filmklappa som
   ikon." — samma mönster, egen ikon.

Godkänt rakt av: "Vi kan köra i vind."

**Grundorsak till varför det här var värt att bygga:** `Chapter
settings` (röst/reader-override, startbild) och `ScenesPanel` låg
båda inline i `.chapter-head`, var sitt eget hopfällbart avsnitt med
egen `▸`/`▾`-toggle — redan dolda som standard, men när öppnade
sköt de ner `ProseCanvas` i layouten istället för att lägga sig
ovanpå den.

**Implementation:**
- Nytt popover-state i `Editor.tsx` (`chapterPopover: {chapterId,
  kind: "settings"|"scenes", x, y} | null`), positionerat med
  `position: fixed` och `left`/`top` beräknat från den klickade
  ikonens egen `getBoundingClientRect()` — samma mönster
  `ProseCanvas`:s `selection-menu`/`format-toolbar` redan använder.
  Klick utanför eller Escape stänger (samma lyssnar-mönster kopierat
  rakt av från `ProseCanvas`s befintliga `menuRef`-hantering).
- Två nya ikonknappar (⚙️/🎬) i `.chapter-row-tools` på VARJE
  kapitelrad i vänsterpanelen — inte bara den öppna — så man kan
  ändra ett annat kapitels röst/reader eller kika på dess scener utan
  att först behöva öppna det.
- **Viktig teknisk upptäckt under implementationen:** `recastChapter`,
  `draftScene`, `recastScene`, `analyzeScene` m.fl. i `BookStore.tsx`
  är alla bundna till `chapterRef.current` (det GLOBALT aktiva
  kapitlet), inte ett kapitel-id som skickas in. Att öppna en popover
  för en ANNAN rad än den just nu öppna kapitel-vyn måste alltså
  också byta aktivt kapitel (`store.setChapterId`/`selectChapter`)
  INNAN popovern öppnas — annars skulle t ex "Recast" i inställnings-
  popovern för kapitel 3 tyst recasta kapitel 1 om det vore det
  egentligen öppna. Samma beteende som att klicka på själva
  kapitelraden, inte en ny bieffekt, men värt att dokumentera tydligt
  i koden eftersom det inte är uppenbart utifrån.
- `ChapterSettingsSection` och `ScenesPanel` avskalade — båda hade
  sin EGEN `▸`/`▾`-togglewrapper (nu överflödig eftersom popover-
  monteringen själv är av/på-mekanismen); togglern + dess chevron-CSS
  togs bort, komponenterna renderar nu bara sitt innehåll rakt av.
  Död `chapterHasSettingsOverride()`-hjälpfunktion (bara använd för
  togglens initiala `open`-state) borttagen.
- En första version visade "1 scene" DUBBELT (en gång i popover-
  huvudet, en gång i `ScenesPanel`s egen räkneradstext) — fångat i en
  Playwright-skärmdump under verifieringen, fixat genom att ge
  popover-huvudet en egen statisk rubrik ("Scenes"/"Scener") istället
  för att återupprepa antalet.

**Verifiering:** `tsc --noEmit`, hela testsviten (1097 test, 81
filer), `npm run build` rent. Playwright mot `npm run dev`:
bekräftade att inställningspopovern öppnas/stängs korrekt (klick
utanför OCH Escape), att klapperbrädan på en ICKE-aktiv kapitelrad
både byter aktivt kapitel OCH öppnar rätt popover, samt skärmdumpar
av båda popover-typerna innan och efter dubbleringsfixen.

v1.0.141 → v1.0.142.


**Ändringslogg v1.0.142 → v1.0.143 (2026-10-20): toning överst/underst
på manusytan, fast mot vyn vid scroll.** Mats skickade en mockup-bild
och skrev: "Jag skulle vilja få editorn så här. Paneler enligt bild
notera en lätt toning överst och underst som ligger över texten." Den
konkreta, direkt utpekade delen var toningen; resten av mockupens
utseende (svart ram, krämfärgad titelrad) tolkades som illustrativa
mockup-detaljer snarare än ett uttryckligt krav, och byggdes inte.

**Grundorsak till varför det här var klurigare än det såg ut:** Första
försöket lade två `.prose-fade`-divar (`position: absolute`, gradient
från panelens bakgrundsfärg till transparent) som barn till
`.prose-wrap` — samma element som har `overflow-y: auto` och alltså
ÄR scrollytan. Antagandet var att "samma teknik som ett sticky-huvud
över en scrollande lista innan `position: sticky` fanns" skulle gälla
här också. Det visade sig fel: ett `position: absolute`-element ärver
sin överordnade scrollbehållares scroll-offset så fort den
överordnade SJÄLV är den som scrollar, oavsett vilket element som
råkar vara dess "containing block". Den historiska sticky-tekniken
kräver att overlay-elementet ligger UTANFÖR det scrollande elementet
som syskon, inte som barn inuti det.

Felet upptäcktes genom att sätta `.prose-wrap.scrollTop = 300` via
Playwright och läsa av `.prose-fade-top`s `getBoundingClientRect()`
— `top` blev `-9.0625` (utanför synligt område) istället för att
stanna på `0`, vilket bevisade att toningsdiven hade följt med
scrollningen. `document.elementFromPoint()` på toningens förväntade
skärmposition returnerade appens egen topp-navigeringsrad, inte
toningsdiven alls.

**Fix:** Delade `.prose-wrap` i två nivåer. `.prose-wrap` behåller
sitt namn (för att slippa röra alla befintliga CSS-selektorer som
pekar på det, t ex `.prose-wrap .model-aside`,
`.prose-wrap.is-find .prose`) men förlorar `overflow-y`/
`scrollbar-gutter` — det är nu bara en icke-scrollande, positionerad
ytterram (`position: relative`) som håller de två toningsdivarna plus
en ny inre div. Den nya `.prose-scroll`-klassen tar över
`overflow-y: auto`, `scrollbar-gutter: stable` och `ref={scrollRef}`,
och omsluter både `aside` (modellens callout-ruta, som ska fortsätta
scrolla med innehållet som förut) och `.prose-body`. `format-toolbar`,
de olika `selection-menu`-varianterna och redigerings-overlayen
(manuell redigering, rewrite, beat, fråga-om-stycket) ligger kvar som
direkta barn av `.prose-wrap` utanför scrollytan — kontrollerat i
CSS att de redan använder `position: fixed` (inte `absolute`), så de
påverkas inte av vilken nivå de monteras i.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright mot `npm run dev`:
skrev lång text i ett kapitel, läste av `.prose-fade-top`s
`getBoundingClientRect().top` före och efter `.prose-scroll.scrollTop
= 300` — oförändrat (`~291px`) i båda fallen, dvs toningen rör sig
inte längre med scrollningen. Skärmdump efter scrollning bekräftar
att toningen syns tydligt överst/underst i manusytan medan texten
rullar under den.

v1.0.142 → v1.0.143.


**Ändringslogg v1.0.143 → v1.0.144 (2026-10-20): titelrad och
menyrad fullbredd, som i mockupen.** Direkt uppföljning till
toningsarbetet: "Jag vill också få till titelraden och menyraden som
på mockupen." Mockupens titelrad (kapitelrubriken) och undre
menyrad (ordräkning + Draft/Polish/osv) går ut kant i kant med hela
redigeringsytan, medan själva manustexten ligger kvar i en smalare,
centrerad spalt — bakgrundsbilden (t ex Vintergatan) syns alltså
fortfarande på sidorna om textspalten, men inte längre bakom
titelraden/menyraden.

Den svarta ytterramen och den krämfärgade exakta kulören i mockupen
tolkades fortfarande som illustrativa mockup-detaljer, inte ett
uttryckligt krav — byggdes inte.

**Implementation:** `.chapter-head` och `.manuscript-foot` var sedan
tidigare smala kort (`align-self: center; max-width: 54rem`), samma
bredd som textspalten, med `.manuscript`s egna `padding: 1.5rem 8%
1rem` som skapade "panelerna" runt dem där bakgrundsbilden syns. Löst
med en bleed-teknik: `margin-left/-right: -8%` på båda elementen
upphäver exakt `.manuscript`s 8%-padding (samma procentbas, samma
överordnade box) så att kortens bakgrundsfärg sträcker sig ända ut
till `.manuscript`s kant, medan `padding: calc(8% + 1.5rem)` på
samma elements insida håller innehållet (rubriktext, knapparna) kvar
på exakt samma horisontella position som innan — bara bakgrundsfärgen
flyttas ut, inte texten. Maximerat läge (`.editor.is-maximized`) hade
redan ett undantag som höll `.manuscript-foot` smal och centrerad
där; samma undantag utökades till att även gälla `.chapter-head`, så
fullskärmsläget ser ut som förut (ingen ändring där). Board-varianten
(`.manuscript-board .manuscript-foot`, används av Brainstorm/
Disposition-vyerna) fick motsvarande justering så den fortsätter
ligga kant i kant med sin egen, mycket smalare padding — inte påverkad
av den nya 8%-bleeden.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright mot `npm run dev`: med
Vintergatan som editorbakgrund, skärmdump bekräftar att titelraden
och menyraden nu går kant i kant med redigeringsytan medan
textspalten ligger kvar smal och centrerad i mitten — matchar
mockupen. Kontrollerat även utan bakgrundsbild (standardläget) och i
maximerat läge: inga regressioner, maximerat läge ser ut precis som
innan ändringen.

v1.0.143 → v1.0.144.


**Ändringslogg v1.0.144 → v1.0.145 (2026-10-20): titelrad/menyrad
kloss mot topp och botten, även i maximerat läge.** Direkt
uppföljning till fullbredds-ändringen, med en skärmdump av sin egen
pågående skrivsession: "Alltså ingen marginal runt top och botten
lister. Kloss mot vänster- och högerpaneler samt botten resp topp.
Låt editorn ligga kloss mot top och botten. Som på mockupen."
Skärmdumpen visade fortfarande ett synligt mellanrum (stjärnhimmel)
ovanför titelraden och under menyraden — kvarvarande vertikal padding
på `.manuscript` som den förra ändringen inte rörde (den tog bara
bort det horisontella gapet).

**Implementation:**
- `.manuscript`s egen padding ändrad från `1.5rem 8% 1rem` till `0
  8%` — tar bort den vertikala marginalen helt, behåller den
  horisontella 8%-paddingen (som titelradens/menyradens -8%-bleed
  fortfarande är beroende av för att räkna ut rätt).
- Samma för `.editor.is-maximized .manuscript`: `2.25rem 8% 1.25rem`
  → `0 8%`.
- Mats skärmdump visade titelraden/menyraden i FULL bredd trots att
  inga paneler (Chapters/Story Bible) syntes — dvs maximerat läge.
  Förra ändringen (v1.0.144) hade uttryckligen återställt
  `.chapter-head`/`.manuscript-foot` till smala, centrerade kort i
  just det läget (för att spegla hur `.manuscript-foot` redan betedde
  sig innan). Den återställningen stod nu i vägen för vad Mats
  faktiskt vill ha — togs bort helt, så maximerat läge nu ärver
  samma fullbredds-bleed som vanligt läge, ingen särbehandling kvar.
  `.manuscript-board .manuscript-foot`s egen (mycket smalare)
  padding-variant i maximerat läge rördes inte — oförändrad, separat
  vy (Brainstorm/Disposition).

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: mätte
`.manuscript-foot`s `getBoundingClientRect().bottom` mot
`window.innerHeight` — exakt lika (flush) i både vanligt och
maximerat läge. Skärmdumpar av båda lägena bekräftar visuellt att
titelraden ligger direkt an mot det ovanför liggande (app-headern/
felbannern i vanligt läge), och att menyraden ligger direkt an mot
fönsrets nederkant — maximerat läge ser nu ut precis som Mats
skärmdump.

v1.0.144 → v1.0.145.


**Ändringslogg v1.0.145 → v1.0.146 (2026-10-20): kvadratiska hörn på
titelrad/menyrad.** Mats: "Vi närmar oss. DÅ har vi sidorna på top
och botten kvar samt att editorn ska sträcka helt mellan topp och
botten." Mätningarna från v1.0.145 visade redan att titelraden och
menyraden låg exakt kloss mot kanterna (`getBoundingClientRect()`
matchade fönstrets kanter perfekt) — det som faktiskt syntes i
skärmdumpen var `border-radius: 6px` kvar från när de var smala,
centrerade kort. Nu när båda ligger kant i kant med redigeringsytan
på alla fyra sidor lämnar den rundade hörnradien en liten triangulär
flik av stjärnhimlen synlig i varje hörn — det var "sidorna" Mats
pekade på, inte en kvarvarande marginal.

**Fix:** `border-radius: 6px` borttagen från både `.chapter-head` och
`.manuscript-foot` — kvadratiska hörn på alla fyra sidor, ingen
särskild hantering per hörn behövdes eftersom båda elementen redan är
helt flush runt om.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright-skärmdump av maximerat
läge bekräftar att hörnen nu är skarpa — ingen stjärnhimmel synlig i
hörnen längre.

v1.0.145 → v1.0.146.


**Ändringslogg v1.0.146 → v1.0.147 (2026-10-20): titelns/menyns
INNEHÅLL i samma bredd som textspalten.** Mats skickade sin
ursprungliga mockup sida vid sida med en skärmdump av sitt eget
pågående manus i appen och frågade rakt av: "Ser du någon skillnad på
min mockup och din webb?" Noggrann jämförelse (pixelpositioner i
båda bilderna) avslöjade en verklig, konkret skillnad som tidigare
missats: i mockupen är kapiteltiteln och menyradens ordräkning/
knappar inte spridda över hela den fullbredda listen — de ligger
klustrade/centrerade i samma bredd som själva textspalten under.
I appen (efter v1.0.144-146) spreds de ut med `justify-content:
space-between` över listens HELA bredd, vilket gav ett annat intryck
— titeln satt långt till vänster om var texten faktiskt börjar, och
knapparna satt utspridda ända ut i kanterna.

**Fix:** Ny inre wrapper i både `.chapter-head` (`.chapter-head-inner`)
och `.manuscript-foot` (`.manuscript-foot-inner`, behövde läggas till
på två ställen i `Editor.tsx` — kapitel-vyn och synopsis-vyn har varsin
`<footer className="manuscript-foot">`). De yttre elementen
(`.chapter-head`/`.manuscript-foot`) sköter fortfarande den fullbredda
bakgrunden (bleed via negativ margin); de nya inre wrapprarna får
`max-width: 54rem; margin: 0 auto;` — exakt samma bredd och centrering
som `.prose-wrap`, så titeltexten och menyradens innehåll nu linjerar
lodrätt med textspaltens vänsterkant, precis som i mockupen.
Board-varianten (`manuscript-board`, Brainstorm/Disposition) fick en
egen override (`max-width: none` på sin `.manuscript-foot-inner`) så
dess knapprad fortsätter spridas över sin egen, redan smala bredd —
oförändrad där.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright-skärmdumpar av både
vanligt och maximerat läge bekräftar att titeln och menyradens
innehåll nu ligger i linje med textspaltens bredd, bakgrunden
fortfarande fullbredd.

v1.0.146 → v1.0.147.


**Ändringslogg v1.0.147 → v1.0.148 (2026-10-20): hittade grundorsaken
till den kvarvarande sliven — procent-baserad bleed-marginal
kompenserar inte exakt för procent-baserad padding.** Mats skickade
en extremt inzoomad beskärning (en tunn horisontell remsa) och
skrev: "Jag vet inte hur jag ska kunna förklara. Ta bort mellan
rummet mellan editor och topp/botten." Playwright-mätning av
`.chapter-head`s `getBoundingClientRect()` avslöjade det exakta
felet: `x: 17.9` istället för `0`, `right: 1382` istället för `1400`
— en kvarvarande ~18px flik av bakgrunden synlig längs vänster- OCH
högerkanten, som alla tidigare skärmdumpar råkat beskära bort eller
inte zooma in tillräckligt för att upptäcka.

**Grundorsak:** `.manuscript` hade `padding: 0 8%` och
`.chapter-head`/`.manuscript-foot` kompenserade med `margin-left/
-right: -8%` för att bleeda ut till kanten. Dessa två procenttal ser
identiska ut men räknas INTE mot samma bas: ett barns procentuella
margin räknas mot förälderns INNEHÅLLSbredd (efter förälderns egen
padding är avdragen), medan förälderns egen procentuella padding
räknas mot förälderns "containing block"-bredd (före dess egen
padding). I det här fallet: `.manuscript`s padding (8% av dess
containing block, ~1400px → 112px) och `.chapter-head`s kompenserande
margin (8% av `.manuscript`s INNEHÅLLSbredd, 1400−224=1176px →
94px) blev olika stora — en genuin CSS-fallgrop, inte ett
kopieringsfel. Mellanskillnaden (~18px) var precis den kvarvarande
sliven Mats pekade på.

**Fix:** Övergav hela bleed/kompensations-tekniken. `.manuscript`s
horisontella padding togs bort helt (ingen padding alls); gutter-
effekten (bakgrunden synlig vid sidorna) skapas nu enbart av att
`.prose-wrap`/`.chapter-head-inner`/`.manuscript-foot-inner` är
centrerade (`max-width: 54rem; margin: 0 auto;`) inom en annars
opaddad förälder — matematiskt exakt, inget procenttal att
missuppfatta. `.chapter-head`/`.manuscript-foot` är nu helt enkelt
`width: 100%` utan någon marginal-kompensation. Samma gamla
`padding: 0 8%`-regel för maximerat läge (`.editor.is-maximized
.manuscript`) var överflödig och borttagen — basreglen (ingen
padding) gäller nu i båda lägena.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: `.chapter-head`s
`getBoundingClientRect()` nu exakt `x: 0, right: 1400` (fönstrets
fulla bredd) i maximerat läge — ingen kvarvarande sliv. Beskurna
skärmdumpar av toppen och botten (samma extremt inzoomade stil som
Mats egen bild) bekräftar visuellt att bakgrunden inte längre syns
vid någon kant.

v1.0.147 → v1.0.148.


**Ändringslogg v1.0.148 → v1.0.149 (2026-10-20): inget mellanrum
ovanför/under själva textsidan.** Ny inzoomad beskärning från Mats,
den här gången av sömmen mellan prosatexten och det som ligger under
("Toward us?" med stjärnhimmel och sedan svart under) — "Då tar vi
nästa fel. Det ska inte vara mellanrum ovanför och under editor
fönstret." "Editor fönstret" = själva prosasidan (pappersrutan), inte
hela appen. `.prose-wrap` hade `margin-top: 1.35rem` (mellanrum mot
titelraden) och `.manuscript-foot` hade `margin-top: 1rem`
(mellanrum mot prosasidan) — båda kvar sedan innan, avsiktliga små
luftrum i det ursprungliga kortbaserade utseendet, men inte längre
rätt nu när allt annat ligger helt kloss.

**Fix:** Båda marginalerna borttagna. En redan existerande
maximerat-läge-regel (`.editor.is-maximized .prose-wrap { margin-top:
0; }`, från tidigare arbete) blev överflödig och togs bort — basregeln
gäller nu lika i båda lägena. Samma rundade-hörn-fälla som i v1.0.146
dök upp igen: `.prose-body` hade kvar `border-radius: 6px`, vilket nu
(när den ligger kloss mot både titelraden och menyraden) lämnade små
trekantiga stjärnhimmel-flikar i alla fyra hörn — borttagen, samma
lösning som för `.chapter-head`/`.manuscript-foot` tidigare.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: `.prose-body`s
`getBoundingClientRect().top` nu exakt lika med `.chapter-head`s
`bottom`, och dess `bottom` exakt lika med `.manuscript-foot`s `top`
— inget mellanrum numeriskt. Extremt inzoomade skärmdumpar av båda
sömmarna (samma stil som Mats egna bilder) bekräftar inga kvarvarande
flikar i hörnen.

v1.0.148 → v1.0.149.


**Ändringslogg v1.0.149 → v1.0.150 (2026-10-20): menyradens innehåll
tillbaka till full bredd.** Mats: "Slutligen ta tillbaka justify-
content: space-between så att menyn sprids på en rad över
bottenlistens HELA bredd." Rakt besked om att v1.0.147s
centrering av menyradens innehåll (ordräkning + knappar, till samma
bredd som textspalten) inte var vad han ville ha trots allt — bara
titelraden ska linjera med textspalten, inte menyraden.

**Fix:** `.manuscript-foot-inner` förlorade sin `max-width: 54rem;
margin: 0 auto;` — behåller `display:flex; justify-content:space-
between` men sprids nu över hela `.manuscript-foot`s bredd igen, som
innan v1.0.147. `.chapter-head`/`.chapter-head-inner` (titelraden)
orörda — den linjerar fortfarande med textspalten. Den nu
överflödiga `.editor.is-maximized .manuscript-board .manuscript-foot-
inner { max-width: none; }`-regeln (fanns bara för att motverka
basregelns `max-width:54rem`) togs bort.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Skärmdump bekräftar: ordräkningen
sitter nu längst till vänster i menyraden och knapparna ända ute
till höger, medan "Chapter 1"-titeln ovanför fortfarande ligger i
linje med textspaltens vänsterkant.

v1.0.149 → v1.0.150.


**Ändringslogg v1.0.150 → v1.0.151 (2026-10-20): padding i prosan så
text aldrig hamnar bakom toningen.** Mats initierade med en
begreppskontroll ("Förstår du vad jag menar med textytan/editorn?")
innan han beskrev problemet: "Jag tror vi behöver en padding i topp
och botten så att man skrolla så att texten inte ligger bakom
skuggan." Efter min bekräftelse av problemet (toningszonen är 44px
hög, men `.prose`s egen padding bara 16px topp / 20px botten — en
skrollad rad kunde alltså hamna inuti, och se blek ut, trots att det
är text man faktiskt skriver/läser, inte bara en hint om mer
innehåll) gav han exakta tal: "Paddingen kan vara topp 60 och botten
80."

**Fix:** `.prose`s `padding` ändrad från `1rem 1.5rem 1.25rem` till
`60px 1.5rem 80px` — båda större än toningens 44px, så en skrollad-
till-kanten textrad alltid hamnar utanför toningszonen, bara den
tomma paddingen kan ligga "bakom" toningen.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: skrev lång text,
skrollade till toppen respektive botten, skärmdumpar bekräftar att
första/sista textraden har tydlig luft innan toningszonen börjar —
ingen rad ser längre blek/dold ut vid kanterna.

v1.0.150 → v1.0.151.


**Ändringslogg v1.0.151 → v1.0.152 (2026-10-20): toningen tonade
scrollisten också.** Mats, direkt efter paddingfixen: "Slutligen ser
jag att toningen även tonar scrollisten i topp och botten. Det vore
snyggt om den inte gjorde det." Rimligt: `.prose-fade-top`/`-bottom`
spänner `.prose-wrap`s hela bredd (`left:0; right:0`) för att täcka
textspalten — men täcker därmed också den smala remsan längst till
höger där `.prose-scroll`s scrollbar renderas, eftersom den remsan
ligger inom samma box.

**Fix:** Scrollbarens bredd går inte att läsa direkt ur CSS (den
varierar mellan OS/webbläsare, och är 0 för auto-dolda overlay-
scrollbars på t ex macOS) — mätt istället i JS:
`scroller.offsetWidth - scroller.clientWidth` på `.prose-scroll`,
via en `ResizeObserver` (samma mönster som `ChapterList`s
`chapter-strands`-mätning i `Editor.tsx`) så den uppdateras om
fönstret ändrar storlek. Värdet sätts som inline `style={{ right:
scrollbarWidth }}` på båda `.prose-fade`-divarna, vilket vinner över
CSS-regelns `right: 0`.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: mätte scrollbarens
faktiska bredd (15px i detta Chromium-testläge) och bekräftade att
`getComputedStyle(fadeTop).right` är exakt samma värde, och att
`fadeTop`s `right`-kant i pixlar ligger exakt 15px innanför
`.prose-scroll`s egen högerkant — scrollbaren ligger alltså helt
utanför toningszonen.

v1.0.151 → v1.0.152.


**Ändringslogg v1.0.152 → v1.0.153 (2026-10-20): sex nya
tile-bakgrunder.** Mats frågade först principiellt: "Kan man ha
tiles eller ska det vara stora bilder?" — svarade att CSS stödjer
båda (`background-repeat: repeat` + naturlig storlek för sömlösa
tiles, `cover` + `no-repeat` för scenbilder som inte är gjorda för
att upprepas), med rekommendationen att välja teknik efter bildtyp.
Mats skickade sedan sex färdiga sömlösa tiles (korkbräda, mörkt
triangelmönster, grått tygmönster, beige skol-ikoner, ljusblå granar,
ljusgrått bladmönster) och ville ha alla sex som nya val, med skog
och Vintergatan kvar (bekräftat via fråga).

**Implementation:**
- Sex nya PNG-tiles i `src/assets/backgrounds/` (200–400px kvadrater,
  redan sömlösa från Mats).
- `BookSchema.ts`: `editor_background`-enumet utökat med `cork`,
  `triangles`, `fabric`, `school`, `pine`, `leaves`.
- `editorBackgrounds.ts`: ny `EDITOR_BACKGROUND_TILED`-record vid
  sidan av den befintliga `EDITOR_BACKGROUND_URLS` — markerar vilka
  bakgrunder är sömlösa tiles (alla sex nya) kontra stora foton (skog,
  Vintergatan).
- `Editor.tsx`s `manuscriptBackgroundStyle` grenar nu på detta:
  tiles får `backgroundRepeat: "repeat"` utan `backgroundSize`/
  `backgroundPosition` (visas i sin naturliga pixelstorlek, upprepad),
  foton behåller `cover`/`center`/`no-repeat` som förut.
- Sex nya i18n-nycklar (`editorBackgroundCork` m fl) i alla tre språk
  (en/sv/nb), nya `<option>`-rader i Settings-dropdownen.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent (de två minsta tiles, skol-ikoner
och löv, inlinades automatiskt som base64 av Vite eftersom de är
under 4kB — förväntat, inte ett fel). Playwright mot `npm run dev`:
bekräftade att alla nio alternativ finns i dropdownen, och
skärmdumpar av flera tiles (kork, trianglar, skol-ikoner) visar
sömlös upprepning utan synliga kanter, bakom den ogenomskinliga
titelraden/textrutan/menyraden.

v1.0.152 → v1.0.153.


**Ändringslogg v1.0.153 → v1.0.154 (2026-10-20): djupskugga på
textytans sidor.** Mats: "Kan man lägga till en skuggning till höger
och vänster om textytan/editorn?" Jag bekräftade tolkningen innan
jag byggde (en `box-shadow` som får pappersrutan att se ut som den
lyfter något från bakgrunden, skiljt från den redan befintliga topp/
botten-toningen som är en scroll-hint, inte en djupeffekt) — han
bekräftade: "Precis så. Kör på det."

**Implementation:** En vanlig `box-shadow` hade läckt uppåt/nedåt in
i de nu flush-anslutande `.chapter-head`/`.manuscript-foot`-barrna
(se v1.0.149s "inget mellanrum"-ändring) — löst med den etablerade
CSS-tekniken för sidledes-bara skuggor: stort negativt `spread`
(-14px) krymper skuggans källa långt in innanför boxens egna topp-/
bottenkanter innan den horisontella offseten (±14px) skjuter ut
kopior av den krympta skuggan förbi vänster/höger kant — nettoeffekt:
skugga syns bara i sidled, ingen läckage vid sömmarna upptill/
nedtill. Färgen matchar appens befintliga `--shadow`-tema-token
(samma RGB/opacitet som andra kort-skuggor i appen) via en ny
`--side-shadow-color`-variabel i båda temablocken (ljust/mörkt), satt
på `.prose-body`.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: `getComputedStyle`
bekräftar exakt `box-shadow`-värdet (båda hållen, rätt blur/spread/
färg), och en inzoomad skärmdump av det övre vänstra hörnet (sömmen
mot `.chapter-head`) visar ingen skugga läcker upp i titelraden.

v1.0.153 → v1.0.154.


**Ändringslogg v1.0.154 → v1.0.155 (2026-10-20): skuggan syntes inte
alls — klipptes av sin egen scrollförälder.** Mats, med en skärmdump
mot korkbakgrunden: "Jag ser ingen skuggning?" Rätt — skuggan
renderades men var helt osynlig.

**Grundorsak:** `box-shadow` satt på `.prose-body`, vars förälder
`.prose-scroll` har `overflow-y: auto`. En mindre känd CSS-regel:
när EN axel sätts till något annat än `visible` medan den andra är
kvar på `visible`, tvingar webbläsaren den andra axeln till `auto`
också — `.prose-scroll` klippte alltså även horisontellt, trots att
`overflow-x` aldrig satts explicit. Skuggan, som sträcker sig utanför
`.prose-body`s egen box, klipptes bort av sin egen förälder innan den
ens hann synas. Samma grundmekanism (fast ett helt annat symptom) som
den ursprungliga toningsbugg som löstes i v1.0.143 — ännu ett fall
av att en scrollande förälders `overflow`-hantering tyst äter
innehåll som sträcker sig utanför dess egen box.

**Fix:** Flyttade `box-shadow` från `.prose-body` till `.prose-wrap`
— ett nivå längre ut, utanför scroll-behållaren, och exakt lika brett
som `.prose-body` (båda opaddade, fyller samma kolumn), så skuggan
hamnar på precis samma plats visuellt utan att klippas. Kontrollerat
att `.manuscript` (nästa förälder ut, som också har `overflow-y:
auto` och alltså samma klipp-kvirk) inte klipper skuggan heller —
gutter-utrymmet runt `.prose-wrap` är hundratals pixlar brett, långt
mer än skuggans ~34px räckvidd.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright mot en ljus tile-
bakgrund (bra kontrast): skärmdump bekräftar tydlig skugga på båda
sidorna av textrutan, och en inzoomad skärmdump av hörnet mot
titelraden visar fortfarande inget läckage uppåt.

v1.0.154 → v1.0.155.


**Ändringslogg v1.0.155 → v1.0.156 (2026-10-20): tydligare skugga,
bredare textspalt, bredare inre marginal.** Mats, två punkter: "1.
Tydligare skuggning 2. Öka bredden på textytan/editorn och lägg in
en bredare inre marginal så att texten inte lägger så nära kanterna."

**Implementation:**
- Skugga: `--side-shadow-color`s opacitet höjd (mörkt 0.35→0.55,
  ljust 0.14→0.3), `box-shadow`s offset/blur ökat (±14px→±18px,
  20px→30px blur) och spreaden mindre negativ (-14px→-10px) så mer
  av skuggan faktiskt syns innan den krymps bort.
- Spaltbredd: `.prose-wrap`s `max-width` 54rem→60rem.
  `.chapter-head-inner` (titelraden, se v1.0.147s linjering mot
  textspalten) följer med till samma 60rem så titeln fortsätter ligga
  i linje med textspaltens vänsterkant.
- Inre marginal: `.prose`s horisontella padding 1.5rem→3rem (topp/
  botten-paddingen från v1.0.151, som håller text ur toningszonen,
  orörd).

**Bonusfynd under arbetet:** `.prose-rare` (den osynliga overlay-
divien som ritar rare-words/AI-tics/fakta-markeringar ovanpå den
riktiga texten) hade sin EGEN hårdkodade kopia av den gamla
paddingen (`1rem 1.5rem 1.25rem`) som aldrig uppdaterades när
`.prose`s egen padding ändrades i v1.0.151 — markeringarna hade
alltså redan då riskerat att glida isär från texten nära toppen/
botten av rutan. Synkad till samma padding-värden som `.prose` nu
har.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: skärmdump bekräftar
tydligt starkare skugga, bredare spalt och synlig marginal mellan
text och rutans kant, i maximerat läge.

v1.0.155 → v1.0.156.


**Ändringslogg v1.0.156 → v1.0.157 (2026-10-20): skuggan läckte in i
topp-/bottenlisten igen — rebalanserad.** Mats: "Skuggan borde bara
vara på sidorna av editorn inte under och över så att det blir
skugga på topp och bottenpanelen." En regression jag själv orsakade
i v1.0.156: ökade `blur` (20px→30px) för att göra skuggan tydligare
men minskade samtidigt den negativa `spread` (-14px→-10px) för att
få mer av skuggan att synas — nettoeffekten (blur minus |spread|)
gick från ~6px läckage (osynligt, godkänt i v1.0.154) till ~20px
läckage, tillräckligt för att synas tydligt ovanför/under textrutan
mot de nu flush-anslutande barrna.

**Fix:** Behöll den högre opaciteten från v1.0.156 (den gjorde
verkligen skuggan tydligare utan att läcka), men balanserade om
blur/spread så `|spread| > blur` igen — `-16px 0 22px -26px` istället
för `-18px 0 30px -10px`. Fyra pixlars marginal (26 vs 22) som
buffert mot blurens mjuka diffusa svans.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: inzoomad skärmdump av
hörnet mot titelraden visar inget läckage, helbildsskärmdump
bekräftar att skuggan fortfarande är tydligt synlig i sidled.

v1.0.156 → v1.0.157.


**Ändringslogg v1.0.157 → v1.0.158 (2026-10-20): soptunne-ikon för
att ta bort kapitel.** Mats: "För att ta bort ett kapitel skulle jag
vilja ha en soptunna i samma storlek som de andra ikonerna (kugghjul
och scenklappa)." Knappen för att ta bort ett kapitel (i
`.chapter-row-tools`, bredvid ⚙️/🎬) fanns redan — den kör
`discardChapter` (mjuk borttagning, hamnar i "Discarded chapters"-
listan, går att återställa) — men visade ett enkelt "×"-tecken, som
är ett tunt textglyf och därför ser mindre/olikt ut jämfört med de
fylliga emoji-ikonerna ⚙️/🎬 även vid samma CSS `font-size`.

**Fix:** Bytte "×" mot 🗑️ i den knappen. Rörde inte den separata
"×"-knappen i den egna "Discarded chapters"-listan (permanent
borttagning av redan kasserade kapitel) — Mats syftade uttryckligen
på raden med kugghjul/scenklapp-ikonerna, inte den listan.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: inzoomad skärmdump av
en kapitelrad bekräftar att 🗑️ nu matchar ⚙️/🎬 i storlek och stil.

v1.0.157 → v1.0.158.


**Ändringslogg v1.0.158 → v1.0.159 (2026-10-21): brief-kortet växer
inte med lång text — två CSS-fallgropar samtidigt.** Mats klistrade
in en lång, scen-för-scen-briefing för kapitel 1 (fyra scener +
"Chapter purpose") på Briefs-tavlan och frågade: "Har jag skrivit
för långt eller ska korten få bli större?" Inte hans fel — svaret
var ett genuint buggigt kort, inte en för lång text.

**Undersökning:** Skärmdump visade texten rinna rakt igenom kortets
egen kant och ner i verktygsfältet under — trots att
`.brief-card-copy` hade `overflow: visible` (ingen synlig
klippning-regel). Mätning med `getBoundingClientRect()` bekräftade:
`.brief-card`s egen renderade höjd stannade på exakt `min-height`
(192px) medan textens `scrollHeight` behövde 816px.

**Grundorsak, två separata CSS-fallgropar samtidigt:**
1. `.brief-card-copy` hade `flex: 1` — kortformen för `flex-grow:1;
   flex-shrink:1; flex-basis:0%`. En `flex-basis` på `0%` säger åt
   webbläsaren att IGNORERA elementets eget innehåll vid
   storleksberäkningen och istället fördela det utrymme som redan
   finns i föräldern — men föräldern (`.brief-card`) har ingen egen
   fast höjd, den ska ju själv växa EFTER barnens innehåll. Cirkulärt:
   ingen sida vågade växa efter den andra.
2. `.brief-board` (CSS Grid) hade `align-items` på standardvärdet
   `stretch` — varje korts höjd låstes till radens beräknade höjd
   innan den egna texten hunnit bidra till den beräkningen.

**Fix:** `.brief-card-copy`s `flex: 1` → `flex: 1 1 auto` (basis på
innehållets egen storlek istället för 0%), plus `align-items: start`
tillagt på `.brief-board` (korten stretchar inte längre till en
radhöjd som räknades ut för tidigt). Båda ändringarna krävdes
samtidigt — vardera för sig löste inte hela problemet (kontrollerat
under felsökningen: bara flex-basis-fixen gav fortfarande 192px).

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: klistrade in exakt
Mats text, mätte att kortets höjd nu överstiger textens `scrollHeight`
(873px vs 816px), och en skärmdump efter nedskrollning i tavlan
bekräftar att kortets kant nu sluter rent runt hela texten, inklusive
sista raden ("...assignment.").

v1.0.158 → v1.0.159.


**Ändringslogg v1.0.159 → v1.0.160 (2026-10-21): kapitel-popovern
kunde rinna av skärmens nederkant.** Mats, med en skärmdump av
Scenes-popovern (5 scener) som gick rakt av vid fönstrets nederkant,
inget sätt att skrolla fram resten: "När man har flera scener så
försvinner de ur skärmen. Fixa scroll alternativt att..."
(meningen avbröts, men tydligt nog för att agera på).

**Grundorsak:** `.chapter-popover` hade redan `max-height: calc(100vh
- 2rem); overflow-y: auto;` sedan den byggdes (v1.0.142) — avsedd att
förhindra exakt detta. Men `openChapterPopover` satte popoverns `top`
rakt av till den klickade ikonens egen `getBoundingClientRect().top`,
utan att bry sig om hur mycket utrymme som fanns KVAR under den
positionen. För en kapitelrad långt ner i listan (rad 7 av 7, t ex)
kan `top` redan ligga på 600-700px — CSS:ens platta `calc(100vh -
2rem)`-tak bryr sig inte om VARIFRÅN boxen mäts, bara dess egen
höjd, så popovern tilläts fortfarande växa till nästan hela
viewport-höjden även när den startade långt ner, och rann av botten
utan att själva scroll-mekaniken någonsin aktiverades (den skulle ha
fungerat om boxen bara fått rätt takhöjd att scrolla INOM).

**Fix:** `openChapterPopover` räknar nu ut `y` OCH en matchande
`maxHeight` tillsammans: `y` klipps så det alltid lämnar minst ~200px
utrymme under sig (annars flyttas popovern uppåt), och `maxHeight`
sätts explicit till precis det utrymme som finns kvar mellan `y` och
fönstrets nederkant (minus en liten marginal) — skickas som inline
`style.maxHeight`, vilket vinner över CSS-regelns platta
`calc(100vh-2rem)`. Nu kan popovern aldrig hamna där den inte får
plats att scrolla inom sig själv.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1097 test, 81
filer) grön, `npm run build` rent. Playwright: öppnade popovern på
den SISTA av sju kapitelrader i ett kort (700px högt) fönster,
injicerade extra högt innehåll (900px) för att tvinga fram
överflöde, mätte att popoverns `bottom` (684px) stannade inom
fönstrets `innerHeight` (700px) och att `maxHeight` beräknades exakt
rätt (291px) — popovern stannar helt på skärmen och skrollar internt
istället för att rinna av.

v1.0.159 → v1.0.160.


**Ändringslogg v1.0.160 → v1.0.161 (2026-10-21): riktig borttagning
av låsta fakta.** Uppföljning på två trådar från Mats samma kväll:
en direkt fråga ("Hur gör man för att ta bort en trait?") som jag
tidigare bara kunnat svara "det går inte, bara dölja/redigera" på,
och sedan en skärmdump efter en lyckad "Merge cards…"-körning som
visade fyra nästan identiska Identity-fakta kvar på det
sammanslagna kortet ("Chief Operations and Drive Maintenance",
"engineer", "Chief Engineer", "chief engineer of the Celestial
Hope") — merge flyttar över ALLA fakta från de gamla korten utan att
känna igen att flera säger "samma sak" med olika ord, så raderna
hopar sig. Mats: "...samt att jag vill kunna ta bort ett låst
fakta."

**Design-avvägning:** Dokumentationskommentaren i `NarrativeFact.ts`
säger uttryckligen "Facts are never deleted once locked; they are
superseded" — en medveten princip för spårbarhet. Men den principen
passar ett värde som ÄNDRAS över tid (t ex ögonfärg), inte ett
påstående som var fel från början eller en ren dubblett efter en
merge. Byggde ett nytt, separat spår för det senare fallet istället
för att väga på den befintliga supersede-mekaniken.

**Implementation:**
- Ny `retractFact(facts, factId)` i `ConsistencyGate.ts` — tar bort
  raden helt (till skillnad från `rejectFact`, som uttryckligen
  vägrar låsta rader). Om en ANNAN fakta hade markerat den borttagna
  som sin `superseded_by`, rensas den länken så att den äldre faktan
  blir aktuell igen istället för att peka på en rad som inte längre
  finns.
- Ny store-action `retractFact` i `BookStore.tsx`/`useBookStore.ts`,
  trädd igenom `BiblePanel.tsx` till `LockedFact`-komponenten.
- Ny "Remove"-knapp per faktarad, bredvid Edit — `window.confirm()`
  med faktans eget värde inbakat i bekräftelsetexten, samma mönster
  som `onDelete` för hela kort redan använder. Texten förklarar
  uttryckligen skillnaden mot Edit (rättar vad det alltid varit) och
  Update… (markerar en ändring från och med nu) så författaren väljer
  rätt verktyg.

**Verifiering:** `tsc --noEmit` rent (fick lägga till `retractFact`
i det explicita `BookStoreValue`-interfacet i `useBookStore.ts`,
inte bara den inferred return-typen i `BookStore.tsx`). Tre nya
enhetstester i `consistency-gate.test.ts` (tar bort en låst rad helt;
no-op för okänt id; återställer en tidigare superseded fakta till
aktuell) — hela testsviten 1100 test (81 filer) grön, `npm run
build` rent. Playwright: skapade en karaktär med en enda Identity-
fakta, klickade Remove, bekräftade dialogrutans exakta text, och att
"1 locked" blev "0 locked" och kortet försvann ur rostret helt
(inga fakta kvar).

v1.0.160 → v1.0.161.


**Ändringslogg v1.0.161 → v1.0.162 (2026-10-21): JSON-exporten utökad
för serieadaption i ComicBook AI.** Detaljerad specifikation från
Mats: utöka StorybookAI JSON-export med `brief` och `scenes` per
kapitel (ID, titel, beskrivning, ev beats/instruktioner), behåll
alla befintliga exportfält, stabila ID:n och korrekt ordning,
konsekvent hantering av tomma briefs/scenlistor, bevara prose/Story
Bible/bilder/illustrationsstil/metadata, och bakåtkompatibilitet
helst via nytt format/versionnummer. Uppmanad att först kontrollera
de faktiska fältnamnen i datamodellen innan strukturen bestämdes.

**Undersökning — vilken export är "StorybookAI JSON-export"?** Tre
kandidater fanns i kodbasen: `sandboxExport.ts` (lossy rollspels-
kort, fel använda typ helt), `manuscriptExport.ts`s `ManuscriptExport`
(intern struktur som bara driver PDF/EPUB/RTF/ODT/Markdown/IDML-
formatterarna — aldrig en egen nedladdningsbar JSON-fil, och
utelämnar bilder/galleri/illustrationsstil helt), och
`manuscriptBackup.ts`s `ManuscriptBackup` (kind `"storybook-ai.
manuscript"`, den faktiska "Export backup"-knappen i FILE-menyn).
Bara den sista matchar kravet "Bevara all befintlig data: prose,
Story Bible, bilder, illustrationsstil och övriga metadata" — den
är redan `{kind, format, book: Book, ...}`, en rå dump av HELA den
interna datamodellen.

**Viktigt delfynd:** `Chapter` har redan `brief: string` och
`scenes?: SceneMeta[]` som egna fält — en rå backup-fil innehåller
alltså redan dessa data tekniskt sett. Men `book.chapters` lagras
INTE förgarnterat i läsordning (kräver `sortedChapters()` för rätt
ordning) och innehåller även kasserade kapitel (`discarded_at`) —
en extern konsument som naivt itererade den råa arrayen skulle få
fel kapitelordning OCH se bortkastade kapitel som författaren
uttryckligen tagit bort. Dessutom beräknas en scens faktiska
textinnehåll ALDRIG lagrat — `chapterScenes(chapter)` delar upp
`chapter.prose` vid lagrade brytpunkter i farten; ett kapitel utan
explicita scenbrytningar har `scenes: undefined` men
`chapterScenes()` syntetiserar då EN scen som täcker hela kapitlet
(aldrig en tom lista för ett kapitel med text).

**Designval:** Rörde INTE `book`-fältet alls — `parseManuscriptBackup`
(återställning/restore i StoryBook självt) läser bara `book`, så en
gammal (format 1) och ny (format 2) backup-fil återställs identiskt;
`MANUSCRIPT_BACKUP_FORMAT` höjdes 1→2 enbart för att signalera det
nya fältets närvaro. La till ett nytt, SIDÅT fält
`adaptationChapters: ManuscriptBackupChapter[]` — inte döpt
`chapters` för att undvika förväxling med `book.chapters` i samma
fil. Byggs via `sortedChapters(book)` (rätt ordning, kasserade
exkluderade) + `chapterScenes(chapter)` (riktigt textinnehåll, aldrig
tom för ett kapitel med prosa) per scen: `id`, `sequence_index`,
`title?`, `description` (scenens egen text — "vad som faktiskt
händer"), `instructions?` (scenens `brief` — fokusinstruktioner/
obligatoriska händelser). Kapitel-nivå: `id`, `sequence_index`,
`title`, `brief` (alltid närvarande, `""` om tomt — "konsekvent" per
kravet), `prose`, `scenes`. `parseManuscriptBackup` beräknar
`adaptationChapters` FÄRSKT från den inlästa `book` snarare än att
lita på filens egna värde — håller det alltid i synk, fungerar även
för en gammal format-1-fil som saknar fältet helt.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1105 test, 81
filer) grön — sex nya tester i `manuscript-backup.test.ts`: rätt
ordning + kasserade kapitel exkluderade (med omindexering kontrollerad
— `discardChapter` packar om kvarvarande `sequence_index` till
sammanhängande, testet uppdaterat för att matcha det verkliga, korrekta
beteendet snarare än mitt första, felaktiga antagande), tomt/ifyllt
brief, ett odelat kapitel får exakt en scen som täcker hela prosan,
en explicit uppdelning ger rätt antal/ordning/titel/beskrivning/
instruktioner, och ett simulerat format-1-objekt (utan
`adaptationChapters` alls) ger ändå korrekt färskt beräknat resultat
vid inläsning. `npm run build` rent.

v1.0.161 → v1.0.162.


**Ändringslogg v1.0.163 (2026-10-21): rättade grundorsaken — det var
StoryCore-exporten, inte backup-filen.** ChatGPT (som utvecklar
ComicBook AI å Mats räkning) granskade den fil Mats skickat: "Filen
fungerar som grund för dagens import, men den innehåller ännu inte
den utökade export vi diskuterat. Synopsis, Briefs och scener/beats
saknas i just den bifogade filen." Mats: "Stämmer det?"

**Undersökning av den faktiska filen (inte gissning):** Mats bifogade
`the-weight-of-the-course-storycore-2026-10-21_1.json`. Python-
inspektion av filen visade `kind: "storycore.manuscript-export"`,
format 1 — INTE `kind: "storybook-ai.manuscript"` (backup-formatet
jag utökade i v1.0.162!). Två helt separata JSON-exporter existerar
i kodbasen: `manuscriptBackup.ts` (full backup/restore, knappen
"Backup" i FILE-menyn) och `manuscriptAppExport.ts` (knappen "Export
for other apps", producerar `@ocedo-apps/storycore`s `ManuscriptExport`
— ett EGET npm-paket, ett tredje repo, versionerat separat från
StoryBook AI självt, med sin egen Zod-validator och ett uttryckligt
"read-only, propose-only"-kontrakt i sin README: "StoryBook AI owns
Story Bible canon. Every other app is a reader of a point-in-time
export, never a writer back into it."). Filnamnsmönstret
`-storycore-<datum>.json` matchar `manuscriptAppExportFilename()`
exakt — det är den riktiga "StorybookAI JSON-export" Mats och
ChatGPT pratar om. Mitt v1.0.162-arbete var alltså en korrekt,
testad, men FEL export — löste inte problemet.

**Varför jag missade det första gången:** Bara två `_KIND`/`_FORMAT`-
konstanter fanns synliga vid en grep i `src/core/*.ts` förra gången
(`manuscriptBackup.ts` och `sandboxExport.ts`) — `manuscriptAppExport.ts`
existerade men dess kind-sträng (`storycore.manuscript-export`) kommer
från det EXTERNA paketet, inte en lokal konstant, så den grep:en
missade den tredje exporten helt. Lärdom: när en sökning hittar "alla"
kandidater men svaret ändå känns fel, kolla om något kommer från ett
externt beroende som inte syns i en lokal grep.

**Fix, i rätt repo denna gång — `ocedo-apps/storycore` (separat
GitHub-repo, lades till i sessionen via `add_repo`):**
- `ExportedChapterSchema` fick `brief: z.string().default("")` och
  `scenes: z.array(ExportedSceneSchema).default([])`; ny
  `ExportedSceneSchema` (`id`, `sequence_index`, `title?`,
  `description`, `instructions?`) — samma fältnamn och semantik som
  `adaptationChapters` fick i v1.0.162, för konsekvens mellan de två
  exportformaten även om de tjänar olika syften.
- `ManuscriptExportSchema` fick `synopsis: z.string().default("")`
  samt `format` ändrat från `z.literal(1)` till `z.union([z.literal(1),
  z.literal(2)])` — en strikt literal hade annars gjort att PAKETETS
  EGEN uppdatering refuserat alla befintliga format-1-filer.
  `MANUSCRIPT_EXPORT_FORMAT` höjd 1→2, paketversion 0.1.0→0.2.0,
  README uppdaterad. Åtta nya/ändrade tester i `tests/parse.test.ts`
  (bakåtkompatibilitet med en format-1-fil, framåtkompatibilitet med
  ett fullt format-2-exempel) — alla 8 test gröna, `npm run build`
  rent, pushat till `ocedo-apps/storycore`s `main`.
- Tillbaka i StoryBook AI: `npm install` för att hämta det nya
  commitet (paketversion 0.2.0 bekräftad i `node_modules`).
  `manuscriptAppExport.ts`s `packManuscriptExport` byggd om för att
  faktiskt FYLLA de nya fälten från riktig data: `synopsis:
  book.synopsis`, och per kapitel `brief: chapter.brief` +
  `scenes: chapterScenes(chapter).map(...)` (samma `sortedChapters`/
  `chapterScenes`-mönster som v1.0.162 redan etablerade).
- En bieffekt av `npm install`: lockfilens git-URL löstes om till
  `git+ssh://` istället för `git+https://` (en miljö-specifik
  URL-omskrivning, inte något jag valde) — samma typ av problem som
  CI/StoryCore-SSH-frågan som redan var uppskjuten till "tisdag"
  tidigare i projektet. Normaliserade tillbaka `package.json`s och
  lockfilens TOPP-nivå-beroendesträng till `git+https://...` för att
  hålla diffen minimal; den djupare `resolved`-raden (som faktiskt
  styr vad som hämtas) löser fortfarande om via ssh i den här miljön
  — ett separat, redan känt problem, inte något jag försökte dölja
  eller tysta ner.

**Verifiering:** `tsc --noEmit` rent i StoryBook AI, hela testsviten
(1109 test, 81 filer) grön — 13 test i `manuscript-app-export.test.ts`
(upp från 9: bakåtkompatibelt tomt brief, synopsis, odelat kapitel
→ en scen som täcker hela prosan, explicit uppdelning → rätt
ordning/titel/beskrivning/instruktioner). `npm run build` rent.

v1.0.162 → v1.0.163.

**Ändringslogg v1.0.164 (2026-10-21): två buggrapporter från Mats
(vidarebefordrade från ChatGPT, som utvecklar ComicBook AI) på den
nyss korrigerade v1.0.163-exporten:**

1. "Versionsnumret. Filen anger fortfarande format: 1." — Undersökte
   grundligt: `grep` i `node_modules/@ocedo-apps/storycore/dist/schema.js`
   bekräftade `MANUSCRIPT_EXPORT_FORMAT = 2` i det installerade paketet;
   en ren `npm run build` lyckades; ett försök att anropa
   `packManuscriptExport` direkt via `npx tsx -e "..."` misslyckades med
   ett ovidkommande verktygsfel (tsx:s Node-baserade loader kan inte
   tolka ett `.ttf`-typsnittsimport som dras in via importkedjan — Vites
   asset-hantering saknas i tsx). Verifierade istället via ett
   engångstest i vitest (som redan har korrekt asset-loader-konfiguration
   via projektets Vite-config): `packManuscriptExport(createBook(...))
   .format` loggades till `2`, kind till `"storycore.manuscript-export"`.
   Koden är alltså korrekt — den fil Mats/ChatGPT testade mot var med
   stor sannolikhet en export tagen innan v1.0.163 byggdes om i
   webbläsaren (samma mönster som brief-kort-buggen tidigare i projektet,
   där en hård omladdning behövdes).
2. "En tom scen i kapitel 1. Den femte scenposten saknar både text och
   instruktion." — Detta var en riktig bugg, inte ett testmiljöproblem.
   Rotorsak hittad i `bookScene.ts`s egen dokumentationskommentar:
   `addScene` lägger medvetet till en PLATSHÅLLAR-scen i slutet av ett
   kapitel (`startParagraph: paragraphs.length`, dvs noll paragrafer) —
   en "scen som väntar på sitt eget utkast" som författaren kan skriva in
   i senare. `normalizeSceneMetas` filtrerar INTE bort den (en split
   exakt VID `paragraphCount` överlever avsiktligt, enligt kommentaren)
   eftersom den är legitim i den egna Scener-panelen. Men en sådan tom
   platshållare har inget värde i en export till en annan app — varken
   för ComicBook AI:s beatförslag eller för backup-läsaren.
   Fix: ny delad hjälpfunktion `exportableScenes(chapter)` i
   `bookScene.ts`, som kör `chapterScenes(chapter)` och sedan filtrerar
   bort scener utan prosa OCH utan titel OCH utan brief — men behåller
   alltid minst en scen (en genuint tom kapitel-platshållare exporteras
   fortfarande som sin enda scen, annars skulle ett helt nyskapat kapitel
   exportera noll scener). De kvarvarande scenerna omnumreras
   (`sequence_index`) så ordningen blir sammanhängande även om en scen
   mitt i listan filtrerades bort. Används nu istället för
   `chapterScenes(chapter)` direkt i både `manuscriptAppExport.ts`s
   `packManuscriptExport` och `manuscriptBackup.ts`s
   `buildAdaptationChapters` — samma fix på båda ställena som v1.0.162/
   v1.0.163 redan höll synkroniserade.

**Verifiering:** `tsc --noEmit` rent. 2 nya test (ett i
`manuscript-app-export.test.ts`, ett i `manuscript-backup.test.ts`) som
bygger ett kapitel med `addScene` och kontrollerar att platshållar-scenen
inte finns med i exporten — hela testsviten 1111 test, 81 filer, grön.
`npm run build` rent.

v1.0.163 → v1.0.164.

**Ändringslogg v1.0.165 (2026-10-22): bekräftade att Ctrl+F5 löste
scen-popover-rapporten (samma gamla cache-mönster, ingen kodbugg — testat
med Playwright mot en ren dev-server utan att kunna återskapa något fel),
och städade sedan upp kapitelbrevets "Extract facts"/"Summarize
chapter"-kontroller på Mats begäran:**

- Båda var tidigare `.text-button`-länkar (ingen synlig kant), och under
  en tom sammanfattning stod en hel förklarande mening
  ("What actually happens in this chapter — write it by hand, or
  Summarize it below once there's prose."). Mats ville ha två små
  knappar och ingen förklarande text.
- Bytte båda knapparnas klass från `text-button chapter-brief-extract`
  till en ny `chapter-brief-action` (vanlig `<button>` utan
  text-button-reset, så webbläsarens/temats standardkant syns — samma
  mönster som `.scene-actions button` redan använder på andra håll i
  appen). "Summarize chapter" döptes om till bara "Summarize"
  (`summarizeChapterAction`, alla tre språk). `summaryPlaceholder`
  kortades till en enda rad utan förklaring ("What actually happens in
  this chapter."), likadant i sv/nb.
- Mats frågade också om Summarize skriver över eller lägger till en
  befintlig sammanfattning — läste `summarizeChapter` i `BookStore.tsx`:
  den ANROPAR `updateChapter(latest, chapterId, { summary })` med det nya
  AI-genererade resultatet, dvs den ERSÄTTER hela fältet, lägger inte
  till. Lade till den meningen i `summarizeChapterHint` (tooltip-texten
  på knappen) på alla tre språk, så det är synligt i appen också.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1111 test, 81
filer) grön — inga testfiler berörda av den här ändringen. Visuell
kontroll via Playwright mot dev-servern (skärmdump av kapitelbrevblocket)
bekräftade de två nya kantade knapparna och den kortade
placeholder-texten.

v1.0.164 → v1.0.165.

**Ändringslogg v1.0.166 (2026-10-22): Mats ville ha hela placeholder-
texten mellan knapparna borta, inte bara förkortad.** Satte
`summaryPlaceholder` till en tom sträng i alla tre språk —
`.chapter-brief-text:empty::before`s `content: attr(data-placeholder)`
blir då bara `""`, så inget visas, medan elementet (och dess
`min-height`) finns kvar så fältet fortfarande går att klicka i och
skriva för hand. Verifierat visuellt via Playwright-skärmdump mot
dev-servern. `tsc --noEmit` rent, hela testsviten (1111 test) grön —
inga tester berörda.

v1.0.165 → v1.0.166.

**Ändringslogg v1.0.167 (2026-10-22): "lägg knapparna bredvid varandra
om de ryms, annars under varandra, med samma bredd".** Flyttade "Extract
facts"-knappen (som tidigare satt direkt efter brief-fältet) ner till
samma rad som "Summarize", i en ny `<div className="chapter-brief-actions">`
efter båda textfälten (brief, sedan summary). Ny CSS:
`.chapter-brief-actions` är `display:flex; flex-wrap:wrap; gap:0.4rem`,
och `.chapter-brief-action` fick `flex: 1 1 0%` (flex-basis 0, inte
`auto`, så de två knapparna delar utrymmet exakt lika oavsett att
"Extract facts" och "Summarize" har olika textlängd) plus
`min-width: 7rem` (tvingar radbrytning till stapling när kapitelfältet
är smalare än båda knapparna tillsammans). Lade även till
`.chapter-brief-text + .chapter-brief-text { margin-top: 0.5rem }` så
brief- och summary-fälten (nu direkt efter varandra utan knapp emellan)
inte klibbar ihop visuellt.

**Verifiering:** Playwright mot dev-servern, två scenarier — en smal
kapitelrad (standardbredd, ~160px) där knapparna staplas men är lika
breda (159.8px vardera, uppmätt), och en bredare rad (`--rail-left-w`
satt till 400px via `page.evaluate`) där de står bredvid varandra, också
lika breda (156.7px vardera). `tsc --noEmit` rent, hela testsviten
(1111 test) grön.

v1.0.166 → v1.0.167.

**Ändringslogg v1.0.168 (2026-10-22): Mats föreslog att Summarize borde
visa AI-förslaget för godkännande/avvisning istället för att skriva över
tyst när det redan finns text — höll med (huvudavvägning: en liten
förslagsruta kontra risken att tappa handskriven text) och byggde det.**

- `summarizeChapter` i `BookStore.tsx` sparar inte längre resultatet
  själv — den GENERERAR bara och returnerar texten (`Promise<string |
  undefined>`, `undefined` vid fel/avbrott). Anroparen avgör om den ska
  sparas direkt. `flushSave` är inte längre en dependency här eftersom
  funktionen aldrig anropar den. Typen i `useBookStore.ts`s
  `BookStoreValue`-interface uppdaterad i takt.
- `Editor.tsx`: knappens `onClick` läser `item.summary.trim()` FÖRE
  anropet (det värde som redan finns i den aktuella renderingen — ingen
  extra `book.chapters.find`-slagning behövs, `item` ÄR redan det
  kapitlet). Tom sammanfattning → sparar direkt som förut. Icke-tom →
  lagrar förslaget i en ny lokal `pendingSummaries`-state
  (`Record<chapterId, string>`, ren UI-state, inte i boken) istället för
  att spara.
- Ny ruta `.chapter-summary-suggestion` visas när
  `pendingSummaries[item.id]` finns: etikett "Suggested summary", själva
  förslagstexten, och två knappar i samma rad-layout som
  `.chapter-brief-actions` redan etablerade — "Use this" (sparar
  förslaget, rensar `pendingSummaries`-posten) och "Discard" (rensar
  bara posten, lämnar fältet orört). Skriver man direkt i
  sammanfattningsfältet för hand medan ett förslag väntar rensas
  `pendingSummaries`-posten också, så ett gammalt förslag aldrig kan
  råka läggas in ovanpå en ny handskriven text.
- Nya i18n-nycklar `summarizeSuggestionLabel`/`applySummarySuggestion`/
  `rejectSummarySuggestion` på alla tre språk; `summarizeChapterHint`
  omskriven för att beskriva det nya tvåstegsbeteendet istället för
  "ersätter".

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1111 test, 81
filer) grön — inga befintliga test berörda (ingen tidigare testfil
täckte `BookStore.tsx`s hooks direkt). Byggde istället en riktig
ände-till-ände-kontroll: en minimal mock-Ollama-server (Node `http`,
CORS-headers, `/api/tags` + `/api/chat`) på port 11434, StoryBook AI
mot en riktig dev-server, drivet med Playwright genom hela flödet —
tom sammanfattning → direkt ifylld utan ruta; icke-tom → rutan dyker
upp, fältet orört; "Use this" → fältet uppdateras, rutan stängs;
nytt förslag → "Discard" → rutan stängs, fältet oförändrat. Inga
sidfel i konsolen genom hela körningen. `npm run build` rent.

v1.0.167 → v1.0.168.

**Ändringslogg v1.0.169 (2026-10-22): Mats fick en hel ny "kapitel"-text
från Summarize (titel, dialog, nya scener) — modellen tolkade uppgiften
som att FORTSÄTTA boken, inte sammanfatta kapitlet.**

- Detta hände på den direkta spara-vägen från v1.0.168 (tom
  sammanfattning → sparas direkt utan förhandsgranskning), så den dåliga
  texten hann landa osedd i hans bok. Bestämde att den vägen inte längre
  ska finnas — Summarize visar nu ALLTID förslagsrutan (Use this/
  Discard) innan något sparas, oavsett om fältet var tomt eller inte.
  `onClick` i `Editor.tsx` förenklad till att alltid lägga resultatet i
  `pendingSummaries`; `hadSummary`-grenen borttagen.
- `SUMMARIZE_CHAPTER_SYSTEM` i `chapterSummary.ts` skärpt: ny första
  rad "You are not continuing the story and not drafting a new
  chapter.", och uttryckligt "nothing invented, nothing from later in
  the book, no new scenes, no new dialogue, no events that aren't
  already in the prose you were given" samt "no chapter title" i
  formatkraven — tidigare löd det bara "state only what the chapter
  itself establishes", vilket tydligen inte räckte för att hindra en
  svagare/mindre instruktionslydig modell från att fortsätta berättelsen
  istället.
- `summarizeChapterHint` (tooltip på knappen) omskriven igen för att
  spegla det nya enhetliga beteendet: "Proposes it below... never saved
  until you choose."

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1111 test) grön
— `chapter-summary.test.ts`s enda påstående om `SUMMARIZE_CHAPTER_SYSTEM`
("innehåller '2-4 sentences', innehåller inte 'JSON'") håller fortfarande.
Playwright mot dev-servern med samma mock-Ollama-server som v1.0.168:
bekräftade att även det FÖRSTA klicket på en tom sammanfattning nu visar
förslagsrutan istället för att spara direkt. `npm run build` rent.

v1.0.168 → v1.0.169.

**Ändringslogg v1.0.170 (2026-10-22): "Brainstorm och Briefs har en
marginal mellan text och panelens yta medans Synopsis - Development
method - Timeline ligger kloss mot kanten."**

- Rotorsak: `.manuscript` förlorade sin horisontella padding långt
  tidigare (sidoskuggans CSS-arbete — se v1.0.15x-ändringarna om
  `.prose-wrap`/`.chapter-head-inner` som centrerar sig själva via egen
  `max-width`, så huvudkapitelredigeraren klarar sig utan
  `.manuscript`s egen padding). Brainstorm (`BrainstormBoard.tsx`) och
  Briefs (`DispositionBoard.tsx`) fick redan då en extra klass,
  `.manuscript-board` (`padding-left/right: 1.5rem`), för att kompensera
  — men Synopsis, Development method och Timeline/Plotlines (som alla
  delar `.manuscript` rakt av, utan någon egen inre `max-width`-wrapper
  runt sitt innehåll) fick aldrig den kompensationen, så de blev kvar
  kloss mot kanten.
- Fix: ny klass `.manuscript-inset` i `styles.css`, samma deklaration
  som `.manuscript-board` (delar samma CSS-regel via kommaseparerad
  selektor för att slippa duplicera värdena). Lades på `<main>` i tre
  ställen: Synopsis (`Editor.tsx`), `DevelopmentMethodPanel.tsx`, och
  `TimelineBoard.tsx`s `TimelineBoardPanel` (delas av både Timeline och
  Plotlines, så båda får fixen). Kontrollerade `.manuscript-foot`
  (footern i Synopsis) — den har redan sin egen oberoende padding och
  `width:100%`, så den blir nu konsekvent insmalnad precis som
  Brainstorms/Briefs redan fungerande footer, inget dubbelarbete.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1111 test) grön
— ingen testfil rör ren styling. Playwright-skärmdumpar av alla tre
sidor (Synopsis, Development method, Timeline) mot en körande
dev-server bekräftade samma inre marginal som Brainstorm redan hade.
`npm run build` rent.

v1.0.169 → v1.0.170.

**Ändringslogg v1.0.171 (2026-10-22): "Om man är på Briefs så funkar
inte scenklappan."**

- Rotorsak: ⚙️/🎬-popovern (kapitelinställningar och Scener) var bara
  renderad INUTI den sista grenen av den stora `onBrainstorm ? ... :
  onTimeline/onPlotlines ? ... : onBoard ? <DispositionBoard> : (
  kapitelredigeraren )`-kedjan i `Editor.tsx` — dvs bara när
  kapitelredigeraren själv visades. `openChapterPopover` sätter
  `chapterPopover`-state och (på Briefs) `store.selectChapter(...)`
  — men `selectChapter` väljer bara vilket kapitel som är markerat
  INOM Briefs-vyn, den navigerar inte bort från `onBoard`. Så
  `chapterPopover`-state sattes korrekt, men ingenting i DOM:en lyssnade
  på den eftersom `<DispositionBoard>` (och likadant Brainstorm,
  Synopsis, Development method, Timeline) helt ersätter huvudytan utan
  att någonsin montera den grenen där popovern låg.
- Fix: flyttade hela popover-blocket (ref, `role="dialog"`,
  `ChapterSettingsSection`/`ScenesPanel` — oförändrat i sig) ut ur den
  sista ternary-grenen och placerade det som syskon direkt efter hela
  kedjans stängande `)}`, före `<BiblePanel`. Den är redan
  `position: fixed` med `x`/`y` beräknade från det klickade ikonens
  egen position, så den beror inte på vilken container den sitter i —
  ingen ändring av själva popover-logiken behövdes, bara VAR i
  komponentträdet den monteras. `chapter`-variabeln (det aktiva
  kapitlet, `chapterId`-baserat) är redan deklarerad på komponentens
  toppnivå, så den var redan tillgänglig i det nya läget utan extra
  prop-drillning.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1111 test) grön.
Playwright mot dev-servern: testade 🎬 på alla sex ytor (Brainstorm,
Synopsis, Development method, Timeline, Briefs, och vanliga
kapitelredigeraren) i en enda körning — popovern öppnas korrekt på
samtliga nu, och den vanliga kapitelredigeraren (ingen regression)
fungerar precis som förut. Skärmdump av Scener-panelen öppen ovanpå
Briefs-vyn bekräftade visuellt. `npm run build` rent.

v1.0.170 → v1.0.171.

**Ändringslogg v1.0.172 (2026-10-22): Mats bad oss återanvända
Progress-rutan från ComicBook AI (`BeatAnalysisDialog.tsx` +
`beatAnalysisDialog.css`, eget repo `ocedo-apps/ComicBook-AI`) — samma
stil, animerade snurra, fokuslåsning, Escape/Avbryt och
bakgrundsspärr — för StoryBook AI:s egna AI-jobb.**

- La till `ocedo-apps/comicbook-ai` i sessionen och läste källan
  direkt: en 12-punkters SVG-cirkel som roterar (6s) samtidigt som
  varje punkt pulserar (1.2s, fasförskjuten), en `createPortal`-dialog
  med fokusfälla (Tab tvingas tillbaka till Avbryt-knappen), Escape
  och bakgrundsklick blockerade, alla syskon till portalen får
  `inert`+`aria-hidden` och `document.body.style.overflow:hidden`
  medan den är öppen, och fokus återställs till det som var fokuserat
  innan (eller `returnFocus`) när den stängs.
- **Avgörande fråga innan jag byggde något**: StoryBook AI har TVÅ
  sorters AI-jobb — sådana som redan strömmar text direkt synlig i
  editorn medan de kör (Draft, Extend/Elaborate/Instruct/Beat, Recast,
  Translate, brainstorm-/interview-chattarna), och Proofread/
  Developmental som redan har egna progress-barer (`ProofreadCard.tsx`,
  `DevelopmentalCard.tsx`, med paus/återuppta). En fullskärms-ruta
  skulle dölja eller krocka med allt det. Frågade Mats explicit
  (AskUserQuestion) om rutan skulle gälla ALLA jobb eller bara de
  "tysta" (inget synligt förrän klart) — han valde det rekommenderade:
  bara de tysta.
- Körde en fork-agent för att läsa igenom varenda `Busy`-variant i
  `BookStore.tsx` och klassificera live/tyst utifrån om den skriver
  till `setBook`/`patchBook` PER CHUNK i en synlig yta, eller bara
  applicerar resultatet en gång i slutet. Resultat — **tysta** (fick
  rutan): `extract`, `extract-interview`, `extract-brainstorm`,
  `extract-synopsis`, `extract-brief`, `analyze`, `polish`,
  `illustrate`, `ask-manuscript`, `ask-passage`, `develop`,
  `import-lore`, `summarize`. **Levande** (rörs inte): `draft`,
  `extend`/`elaborate`/`instruct`/`beat`, `recast`, `translate`,
  `brainstorm-chat`, `interview`, `proofread`, `developmental`.
- Ny `BusyDialog.tsx` — samma fokusfälla/inert/Escape-logik portad
  rakt av, men `title`/`status`/`help`/`cancelLabel` som props istället
  för ComicBook AI:s hårdkodade per-språk-funktion (StoryBook AI har
  redan ett riktigt i18n-system). CSS i `styles.css` (projektets enda
  stilmall, inget separat CSS-per-komponent som i ComicBook AI) som
  `.busy-dialog*`, samma 12-punkters SVG-snurra, `z-index: 80` (högst i
  appen — näst högst är 70, för ett bekräftelseval ovanpå ett
  granskningskort).
- Ny i18n-namnrymd `busy` (alla tre språk): delad `title`
  ("Working"/"Arbetar"/"Arbeider") och `help`-text, plus
  verb-ing-strängar för de jobb som saknade en sedan tidigare
  (`analyzing`, `polishing`, `illustrating`, `developing`,
  `importing` med `{current}`/`{total}`) — återanvänder redan
  befintliga strängar där de fanns (`m.editor.extracting`,
  `m.interview.extracting`, `m.askManuscript.asking`,
  `m.askPassage.asking`, `m.editor.summarizing`) istället för att
  duplicera dem.
- `SILENT_BUSY`-set + `silentBusyCopy(busy, m, importLoreProgress)` i
  `Editor.tsx` väljer titel/statustext per `Busy`-värde; rutan
  monterad som syskon efter hela surface-ternaryn (samma plats som
  v1.0.171s chapterPopover-fix), så den visas oavsett vilken sida man
  är på. `onCancel={store.stopDraft}` — den delade
  "avbryt-vad-som-helst-som-kör"-funktionen som redan fanns.
- **Dolt saknat stycke upptäckt under verifieringen**: `store.stopDraft`
  (`abortRef.current?.abort()`) fanns redan och användes av flera
  "tysta" jobb (`analyzeChapter`, `polishChapter` m.fl.) — men
  `extractChapter`, `extractSynopsis`, `extractBrainstormNote` och
  `summarizeChapter` saknade HELT `AbortController`/`signal`-koppling.
  Upptäckt genom att faktiskt testa Avbryt/Escape mot en konstgjord
  5-sekunders-fördröjd mock-Ollama-server i Playwright — rutan visades
  korrekt, men varken Escape eller Avbryt-knappen stängde den för
  Extract facts. Fixade alla fyra med exakt samma mönster
  (`abortRef.current?.abort(); const abort = new AbortController();
  abortRef.current = abort; ... signal: abort.signal ... catch
  AbortError → no-op ... finally abortRef.current = null`) som redan
  var etablerat i `analyzeChapter` m.fl.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1111 test) grön.
Playwright mot en körande dev-server med en konstgjord
5-sekunders-fördröjd mock-Ollama (för att hinna skärmdumpa/testa innan
svaret kommer): rutans text, fokus på Avbryt-knappen vid öppning,
`inert`+`aria-hidden` korrekt satt på `#root` (bekräftat separat från
ett första, felaktigt test som letade efter `inert` på fel element),
Escape stänger rutan OCH stoppar den faktiska förfrågan, Avbryt-knappen
likaså, och Draft (ett levande jobb) visar INTE rutan alls. Skärmdump
av rutan bekräftade utseendet matchar ComicBook AI:s stil. `npm run
build` rent.

v1.0.171 → v1.0.172.

**Ändringslogg v1.0.173 (2026-10-22): "Draft borde också få snurran då
det tar rätt bra med tid."**

- Draft hör till de "levande" jobben (strömmar text direkt synlig i
  editorn) som v1.0.172 uttryckligen höll BusyDialog borta från — men
  den döda väntan INNAN första token kommer (värst vid kallstart av
  modellen) har inget synligt alls att visa, exakt samma problem som de
  tysta jobben. Löste det genom att bara visa rutan för just den
  väntan, inte för själva strömningen.
- Ny state `draftAwaiting` i `BookStore.tsx` (bredvid `busy`): sätts
  `true` i både `draftChapter` och `draftScene` direkt efter
  `setBusy("draft")`, sätts `false` i samma ögonblick det första
  `text_delta`-chunket anländer (`if (raw === "") setDraftAwaiting(false)`
  precis innan `raw` fylls på), och i `finally` som vanlig städning.
  Exponerad via `useBookStore.ts`s `BookStoreValue`-interface.
- `silentBusyCopy` i `Editor.tsx` fick en fjärde parameter
  `draftAwaiting`: en tidig specialgren `if (busy === "draft") return
  draftAwaiting ? {...} : null;` innan den vanliga `SILENT_BUSY`-set-
  kontrollen, så Draft aldrig permanent läggs i mängden (det skulle
  visa rutan även under själva strömningen) utan bara matchar precis så
  länge väntan pågår. Ny status-text `m.busy.drafting` ("Drafting…"/
  "Skriver utkast…") på alla tre språk.
- Cancel/Escape i rutan fortsätter gå genom samma `store.stopDraft`
  som redan avbryter `draftChapter`/`draftScene` korrekt (båda hade
  redan fullt fungerande `AbortController`-koppling sedan tidigare,
  inget nytt behövdes där).

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1111 test) grön.
Byggde en andra mock-Ollama-server som FAKTISKT strömmar NDJSON-rader
(till skillnad från v1.0.172s enkla fördröjda engångssvar) — 2,5
sekunders tystnad, sedan sex ord med 150 ms mellanrum — och körde ett
Playwright-test mot den: rutan syns och visar "Drafting…" under de
första ~800 ms (den döda väntan), försvinner EXAKT när första ordet
strömmar in, och prosan fortsätter växa fram live i editorn precis som
innan ändringen. Stötte på ett miljöproblem under verifieringen: en
gammal mock-server-process från föregående ändringslogg hade
överlevt `pkill` (hängde kvar på port 11434) och gav tysta,
missvisande testresultat tills den identifierades via `ps aux` och
avslutades med `kill -9` — inte en kodbugg, men värt att notera för
nästa gång samma mönster uppstår. `npm run build` rent.

v1.0.172 → v1.0.173.

**Ändringslogg v1.0.174 (2026-10-22): "Comicbook lägger rutan med
rundade hörn i en 'lightbox' eller liknande. Kan vi göra samma i
Storybook?", med en skärmdump av ComicBook AI:s faktiska ruta (ljus,
krämfärgad, tydligt avskild från den nedtonade bakgrunden).**

- Testade först vår egen ruta i mörkt tema (StoryBook AI:s
  standardtema) och såg precis vad Mats pekade på: rutan använde
  `var(--panel)` — samma mörkbruna ton (`#1c1814`) som appens egen
  bakgrund (`#14110e`) — så kortet smälte nästan in i den nedtonade
  bakgrunden istället för att poppa fram. Kontrollerade ComicBook AI:s
  egna CSS-variabler (`src/styles.css`): samma mönster, `--panel` är
  också tema-beroende där (`#1c1814` mörkt / `#faf5ed` ljust) — Mats
  skärmdump var alltså taget i ComicBook AI:s LJUSA tema, inte en
  särbehandling de gör. Men önskemålet ("lightbox") är ändå rimligt
  och tydligt: rutan ska alltid vara en ljus yta som sticker ut mot en
  nedtonad bakgrund, oavsett vilket tema appen själv står i — annars
  blir just den mörka temat ologiskt lite kraftlös för en ruta som ska
  signalera "vänta, något pågår".
- Gjorde `.busy-dialog` hårdkodad till det ljusa temats egna
  värden (`background:#faf5ed; color:#2a2218; border:#d4c6b4`) istället
  för `var(--panel)`/`var(--text)`/`var(--border)` — en kommentar i
  CSS:en förklarar varför. Samma för snurran (`.busy-dialog-spinner`,
  var `var(--text)` → fast `#2a2218`) och hjälptexten
  (`.busy-dialog .quiet`, var `var(--text-dim)` som i mörkt tema är en
  ljusgrå ton gjord för mörk bakgrund och skulle blivit svårläst mot
  den nya krämfärgade ytan → fast `#6b5f52`, ljusa temats egen
  `--text-dim`). Skuggan byttes från `var(--shadow)` (som i mörkt tema
  är ljusare/svagare, byggd för en mörk yta) till en fast, kraftigare
  `0 20px 60px rgb(0 0 0 / 0.45)` som ger kortet tydligare djup mot
  vilken bakgrund som helst.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1111 test) grön
(ren styling, ingen testfil berörd). Playwright-skärmdumpar av rutan i
BÅDA app-teman (mörkt som standard, och ljust via temaväxlaren) mot en
konstgjort fördröjd mock-Ollama-server — rutan ser nu identisk ut i
båda fallen och matchar ComicBook AI:s skärmdump. `npm run build` rent.

v1.0.173 → v1.0.174.

**Ändringslogg v1.0.175 (2026-10-22): Mats testare rapporterade att
Polish bara skrev om kapitlets första scen av fem och "slaktade" den,
trots att LM Studios egen logg visade att modellen läst in och
planerat HELA kapitlet.**

- Testarens loggutdrag var den rykande pistolen: `"reasoning_content"`
  innehöll en fullständig scen-för-scen-plan för alla 7 scener i
  kapitlet, men `"finish_reason": "length"` och
  `"completion_tokens": 1800` med `"reasoning_tokens": 1131` av dem —
  modellen hade "tänkt högt" (skrev ut hela sin plan som
  `reasoning_content`, en separat kanal reasoning-modeller som körs via
  LM Studio ofta exponerar) och förbrukat 1131 av de 1800 tokens Polish
  bad om INNAN den ens börjat skriva den faktiska omskrivningen — bara
  669 tokens kvar räckte knappt till scen 1.
- Rotorsak i `polishMaxTokens(prose)` i `BookStore.tsx`: formeln
  skalade budgeten efter KAPITLETS längd (`max(1800, prose*1.3+200)`)
  men hade noll marginal avsatt för en tänkande modells egen
  planeringsfas — till skillnad från `summarizeChapter`, som redan hade
  en kommentar om exakt det här fenomenet ("a tight token budget
  starves any model that thinks/plans before answering... reasoning
  models especially") och ett löst tilltaget 700-tal.
- Fix: ny konstant `REASONING_HEADROOM_TOKENS = 2000`, adderad OVANPÅ
  den befintliga längdbaserade formeln (inte istället för — ett kort
  kapitels omskrivning är billig oavsett, men tänkandet innan den inte
  är kortare bara för att kapitlet är det).
- Undersökte också VARFÖR testaren inte fick ett tydligt felmeddelande
  istället för en tyst, avkapad text — koden har redan ett skydd
  (`OpenAICompatibleLocalProvider.chat()` i `provider.ts`, kastar ett
  fel när `finish_reason === "length"`) som `polishChapter`s egen
  catch-logik redan visar korrekt via `setError`. Byggde en
  mock-OpenAI-kompatibel-server (samma kontrakt som LM Studio
  exponerar) som replikerar exakt testarens siffror (1131
  reasoning-tokens, trunkering vid otillräcklig budget) för att
  bekräfta båda halvorna: med den nya budgeten (2000 + 1800 = 3800 för
  ett kort testkapitel, uppmätt direkt i mock-serverns mottagna
  `max_tokens`-fält) slutförs hela omskrivningen; tvingar man ändå fram
  en trunkering (en andra mock som alltid returnerar
  `finish_reason:"length"`) visar appen korrekt ett tydligt
  felbanner istället för att tyst acceptera den avhuggna texten som
  ett Polish-förslag. Skyddet fungerar alltså redan som det ska i
  nuvarande kod — om testaren körde en äldre version av appen förklarar
  det varför han inte såg felet.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1111 test) grön
(`polishMaxTokens` är inte exporterad och har ingen egen testfil sedan
tidigare — `BookStore.tsx` testas generellt inte som enhetstester i det
här projektet, så ingen ny testfil lades till för att inte bryta
mönstret). Två separata Playwright-körningar mot dev-servern med
Settings omställda till `openai-compatible`/`localhost:11435` (satt
direkt via `localStorage` för att undvika att navigera hela
Settings-UI:t): en mot en mock som replikerar testarens exakta
reasoning-kostnad (bekräftar att hela kapitlet nu går igenom), en mot
en mock som alltid trunkerar (bekräftar att felbannret visas och inget
Polish-förslag läggs fram). `npm run build` rent.

v1.0.174 → v1.0.175.

**Ändringslogg v1.0.176 (2026-10-23): Mats funderade på om man ska kunna
peka mot en lokal AI som inte ligger på datorn, utan någon annanstans på
det lokala nätverket — "Vi skapar den möjligheten och uppdaterar guide
och texter."**

- Research innan kod: `assertLocalOnlyBaseUrl` i `provider.ts` är en
  BLOCKLISTA mot kända molntjänster (openai.com, anthropic.com,
  googleapis.com m.fl.), inte en vitlista som kräver `localhost` — en
  LAN-adress som `http://192.168.1.50:11434` godkändes alltså redan av
  valideringen. Problemet var att Settings bara visade "Server
  address"-fältet för `openai-compatible`-motorn; Ollama-motorn
  konstruerades alltid UTAN `baseUrl` i `makeProvider`/`listEngineModels`,
  så den föll alltid tillbaka på `DEFAULT_OLLAMA_BASE_URL`
  (`localhost:11434`) oavsett vad som stod i den delade `baseUrl`-staten.
  Guiden sa till och med rakt ut: "The Ollama engine always points at
  your own computer (localhost) and can't be redirected from the
  interface."
- Kod: `makeProvider`s Ollama-gren och `listEngineModels`s Ollama-gren
  i `BookStore.tsx` skickar nu `baseUrl` (trimmad, tom sträng → `undefined`
  → `OllamaModelProvider`s egen default) precis som `openai-compatible`-
  grenen redan gjorde. `listEngineModels` konstruerar nu en
  `OllamaModelProvider`-instans istället för att anropa `listOllamaModels()`
  direkt, så Ollama får samma `assertLocalOnlyBaseUrl`-skydd som
  OpenAI-kompatibel redan hade.
- `connectionPresets.ts`s `matchesPreset`: tog bort specialfallet "Ollama
  saknar adress att jämföra, motor-match räcker" — båda motorerna
  jämför nu på adress. Uppdaterade testerna i
  `connection-presets.test.ts` i linje med det (nytt test: en sparad
  Ollama-preset mot en annan dator matchar bara den exakta adressen).
- UI: `SettingsPanel.tsx`s `baseUrlField` (i `ConnectionPresetList`)
  och `Home.tsx`s motsvarande fält i startskärmens anslutningsruta
  visas nu för BÅDA motorerna, med platshållartext som växlar mellan
  `DEFAULT_OLLAMA_BASE_URL` ("http://localhost:11434") och
  `DEFAULT_OPENAI_COMPATIBLE_BASE_URL` ("http://localhost:1234")
  beroende på vald motor, istället för en fast LM Studio-platshållare.
  `selectPreset` sätter nu `onBaseUrl(preset.baseUrl)` ovillkorligt
  (tidigare bara för `openai-compatible`).
- Texter (alla tre språk): `baseUrlLede` omskriven generiskt ("lämna
  tomt för den här datorns standard, eller ange en annan maskins
  nätverksadress"); den gamla LM Studio-specifika `baseUrlPlaceholder`-
  strängen borttagen helt (platshållaren är nu kod, inte i18n, se
  ovan). `ollamaOrigins`-felmeddelandet (visas vid CORS-avslag)
  omskrivet för att inte bara föreslå `OLLAMA_ORIGINS=http://localhost:5175`
  (fel råd när Ollama körs på en annan maskin) utan även nämna
  `OLLAMA_ORIGINS=*` som en enkel universallösning. Guide-sektionen
  "network-ai-server" ("En AI-server på en annan dator i nätverket")
  skriven om: stycket "Motorn måste vara LM Studio / annan lokal
  server... Ollama-motorn pekar alltid mot din egen dator" ersatt med
  "Välj motorn som matchar det som körs där... båda har nu ett fält för
  serveradress". FAQ-posten "Can I run the app on another computer...”
  redan var konsekvent med fixet (antog redan att man kunde peka om
  modellinställningen) — ingen ändring behövdes där.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1112 test, upp
från 1111 — ett nytt `matchesPreset`-test) grön. Playwright mot
dev-servern: en mock-"LAN-Ollama"-server på port 11435 (en annan port
än standard-11434, för att bevisa att appen faktiskt frågar den
KONFIGURERADE adressen och inte bara localhost av misstag) — valde
Ollama-motorn (standard), bekräftade att serveradressfältet nu syns
med rätt platshållare (`http://localhost:11434`), fyllde i
`http://localhost:11435`, och bekräftade att appen hämtade
`lan-model:latest` från just den porten. Skärmdump av
Inställningar bekräftade utseendet. `npm run build` rent.

v1.0.175 → v1.0.176.

**Ändringslogg v1.0.177 (2026-10-24): Mats funderade på hur bokserier
ska hanteras — "Ska fakta och historia följa med till nästa bok i
serien?" Efter ett par rundor landade scopet: "Om vi börjar med att man
kan importera filen med fakta som man sedan får låsa in i nästa bok,
plus att man får skriva in om det är nåt ytterligare som ska tas med"
— och "Ja, märk dem så" för att bekräfta att de importerade förslagen
ska märkas med en egen källa i granskningskön.**

- Research innan kod: `ManuscriptExport.bible` i `@ocedo-apps/storycore`
  innehåller redan precis rätt delmängd — bara låsta, synliga fakta,
  samma regel som `Draft` själv använder — så den befintliga "Export för
  andra appar"-filen från bok 1 kunde återanvändas rakt av som källa för
  seriekontinuitet, utan nytt exportformat. `applyExtractorDrafts`
  (`ConsistencyGate.ts`) var redan den generella mekanismen för att landa
  `FactDraft[]` som granskningskandidater (aldrig låsta direkt, med
  inbyggd konflikt-/dubblettdetektering) — återanvänds rakt av.
- Nytt: `src/core/seriesImport.ts` — `parseSeriesImport` (tunn wrapper
  runt `parseManuscriptExport`), `seriesImportEntities` (plattar ut
  `bible`-sektionerna till en rad per entitet, för en väljarlista) och
  `seriesFactDrafts` (de valda entiteternas fakta som `FactDraft[]`,
  hoppar över ett predikat som inte är ett giltigt `CorePredicate` —
  ska aldrig hända eftersom exporten bara någonsin kom från den här
  appen, men exportkontraktet lovar bara att det är *någon*
  predikatsträng).
- `FactOriginSchema` (`NarrativeFact.ts`) fick ett nytt värde `"series"`,
  och `importLoreArticles` i `BookStore.tsx` tar nu ett valfritt
  `origin`-argument (default `"lore"` som förut) istället för att vara
  hårdkodad — gör att fritextdelen av seriefunktionen kan återanvända
  hela extraktions-UI:t rakt av, bara med `origin: "series"`. Ny
  `importSeriesFacts`-funktion i `BookStore.tsx`: ingen AI-anrop alls
  — de strukturerade fakta från filen är redan kända, inte gissade från
  prosa — landar direkt via `applyExtractorDrafts(..., "series")`.
  Samtidigt: `importLoreArticles` saknade helt `AbortController`/
  `signal`-koppling (Cancel/Escape i dess BusyDialog gjorde ingenting),
  trots att `import-lore` finns i `SILENT_BUSY`-mängden — fixat med
  samma mönster som resten av de "tysta" operationerna använder, eftersom
  funktionen ändå redigerades för `origin`-parametern.
- Ny UI: `SeriesImportCard.tsx` — filuppladdning av föregående boks
  exportfil (`.json`), tydligt felmeddelande per `ManuscriptExportError`-
  kod (fel fil / fel sorts fil / nyare format / trasig fil), en lista
  över hittade entiteter grupperade på sin Bible-typ med kryssrutor
  (alla förvalda), en "Ta med N fakta"-knapp som visar hur många som
  faktiskt landade, samt ett fritextfält under en egen rubrik
  ("Något annat att ta med vidare?") som återanvänder extraktorn precis
  som `LoreImportCard`. Ny menypost "Importera föregående bok" i
  FILE-menyn, bredvid den befintliga "Importera lore"-posten.
- Granskningskön (`BiblePanel.tsx`) behövde ingen kodändring — den slår
  redan generiskt upp `m.bible.sources[fact.origin]` — bara en ny
  i18n-nyckel `series: "Föregående bok"` (alla tre språk) för att
  typchecka och visa rätt text.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1120 test, upp
från 1112 — 8 nya tester i `tests/core/series-import.test.ts` för
`parseSeriesImport`/`seriesImportEntities`/`seriesFactDrafts`, byggda på
riktiga `packManuscriptExport`-fixturer istället för handrullad JSON).
`npm run build` rent. Playwright mot dev-servern med en mock-Ollama-
server (port 11555, både streamande `/api/chat` för draft/polish-vägen
och icke-streamande `stream:false`-svar för extraktorns `chat()`-anrop):
skapade en bok, öppnade "Importera föregående bok", bekräftade att en
trasig fil gav rätt felmeddelande ("Den filen är inte en manusexport."),
laddade upp en riktig (schemavaliderad) exportfixtur från en fiktiv
"bok 1" — bekräftade att entitetslistan visade båda entiteterna med
rätt Bible-typ, att en avmarkerad entitet minskade räknaren från "Ta med
2 fakta" till "Ta med 1 faktum", och att importen gav "La till 1 faktum
i granskningskön." Testade sedan fritextfältet mot mocken och bekräftade
att även den landade fakta märkta "Source: Previous book"/"Källa:
Föregående bok" i granskningskön — skärmdump bekräftade utseendet
(båda korten, "Captain Reyes" och "Lighthouse Keeper", med texten
"Source: Previous book" under varje).

v1.0.176 → v1.0.177.

**Ändringslogg v1.0.178 (2026-10-24): Mats — "Vad händer med den
fungerande versionen av StorybookAI medans vi bygger [Series-nivån]?"
Enades om: bygg stegvis direkt på main, men håll varje steg additivt och
dolt tills det faktiskt fungerar end-to-end — ingen synlig startpunkt
förrän klart. Det här är steg 1 av 5 i den planen (schema +
persistence), inget UI, ingen koppling till befintlig kod.**

- Nytt: `src/core/SeriesSchema.ts` — `Series`-typen: `id`, `title`,
  samma `brainstorm`/`brainstorm_notes`/`synopsis`/`facts`-form som
  `Book` redan har (Mats: "Det vore bra om man har brainstorm och
  synopsis på serien också. Så att man kan starta att bygga sin
  värld/lore och generera grunden.") — samma flöde (brainstorma →
  lyft till synopsis → extrahera till låsta fakta) återanvänds rakt av
  på serienivå, bara en nivå ovanför böckerna. Avsiktligt INGA
  chapters/scenes — bara Book skriver prosa. `ensureBrainstormNotes`
  (redan generisk över `{id, brainstorm, brainstorm_notes}`) fungerar
  oförändrad för `Series` också. `createSeries`, `parseSeries`,
  `touchSeries`, `summarizeSeries` — samma mönster som motsvarande
  Book-funktioner. `SeriesSummary.bookCount` räknas INTE ut inifrån
  `Series` själv (en serie pekar inte på sina böcker, det är böckerna
  som pekar på sin serie) — anropraren skickar in antalet, från vilken
  boklista den redan har.
- `BookSchema.ts`: nytt valfritt fält `series_id` på `Book` (samma
  mönster som det redan befintliga `translation_group_id` för
  språkversioner) — en fristående bok är helt opåverkad, fältet saknas
  precis som idag. Tillagt i `BookSummarySchema`/`summarizeBook` också,
  för framtida hylla-gruppering (steg 2).
- Nytt: `src/persistence/SeriesRepository.ts` — samma CRUD-mönster som
  `BookRepository`, egen IndexedDB-store (`series`), DB-version
  uppgraderad 2 → 3 (`Repository.ts`s `openDb` skapar den nya storen i
  `onupgradeneeded`, rör inte befintliga `books`/`illustration_styles`-
  storer — en uppgradering en befintlig användare aldrig märker).
  `SeriesRepository.list` tar emot en `Map<seriesId, bookCount>` som
  anroparen bygger, istället för att fråga `BookRepository` själv — de
  två repositoryna förblir oberoende av varandra.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1131 test, upp
från 1120 — 11 nya: 6 för `SeriesSchema` i
`tests/core/series-schema.test.ts`, 5 för `SeriesRepository` i
`tests/persistence/series-repository.test.ts`, inklusive ett test som
sparar en `Series` och en `Book` i samma `fake-indexeddb`-databas och
bekräftar att de två storerna inte krockar). `npm run build` rent.
Ingen Playwright-körning den här gången — inget UI finns ännu att
klicka igenom, bara schema och persistence, exakt som planerat för
steg 1.

v1.0.177 → v1.0.178.

**Ändringslogg v1.0.179 (2026-10-24): Steg 2 av 5 i Series-planen —
organisera böcker i en serie, navigera mellan dem. Föregicks av en
förhandsvisning (Artifact-skiss, "Design"-typen, inte kod) som vi
diskuterade och justerade innan kodningen: Mats fråga om var
karaktärer "bor" (serie vs. bok — svar: samma `entity_ref` på båda
nivåerna, bokens egna fakta vinner vid krock), "Skicka till
serien"-mekaniken med automatiskt satt ursprung (`source_book_id`/
`source_chapter_id`, aldrig inskrivet för hand), och beslutet att rik
löptext/bilder per entitet är för författaren och extraktorn — inte
rådata rakt in i Draft-prompten. Det här steget bygger ännu inget av
det — bara själva organisationslagret: skapa/öppna en serie, se och
hantera dess böcker.**

- Nytt: `src/ui/SeriesStore.tsx` + `useSeriesStore.ts` — en egen,
  mycket mindre React-context än `BookStore.tsx`, som bara äger
  själva `Series`-posten (titel/brainstorm/synopsis/fakta senare) och
  dess CRUD. Läser `BookStore`s `summaries` för att räkna böcker per
  serie och lista en series böcker (`booksInSeries`) — måste därför
  monteras INNANFÖR `BookStoreProvider`. En bok skriver fortfarande
  bara via `BookStore` (enda ägaren av Book-persistence); series-sidan
  ber `BookStore` göra det via en ny funktion, `setBookSeries`, den
  äger inte skrivningen själv.
- `BookStore.tsx`: ny `setBookSeries(bookId, seriesId)` — fungerar på
  VILKEN bok som helst, inte bara den öppna (anropas från hyllan där
  inget är öppet än); routar genom befintlig `patchBook` när målet
  råkar vara den öppna boken, annars `repo.get` + `touch` + spara
  direkt, så det finns bara en kodväg för fältet oavsett. `newBook`
  tar nu ett valfritt andra argument, `seriesId`, som sätter
  `series_id` direkt vid skapandet (används av "+ Ny bok i den här
  serien").
- `App.tsx`: `SeriesStoreProvider` monterad innanför
  `BookStoreProvider`, runt `Shell`. `Shell`s routing utökad från
  `book ? Editor : Home` till `book ? Editor : seriesId ? SeriesWorkspace
  : Home` — stänger man en bok som öppnades inifrån en serie (Series-
  state fortfarande satt) hamnar man tillbaka i serien, inte på hela
  hyllan; stänger man en fristående bok (seriesId aldrig satt) hamnar
  man på hyllan precis som idag. Ingen ändring i hur en fristående bok
  beter sig.
- Nytt: `src/ui/SeriesWorkspace.tsx` — minimal serie-yta för det här
  steget: tillbaka-till-hyllan, redigerbar titel (samma debounce-
  mönster som bokens egen titel), lista över böcker i serien (klick
  öppnar boken), formulär för att skapa en ny bok direkt i serien,
  och en "Ta bort serien"-knapp — avstängd (med förklarande `title`)
  så länge serien har böcker kvar, för att aldrig lämna en bok
  pekandes på ett borttaget `series_id` i tysthet. Själva Brainstorm/
  Synopsis/Story Bible för serien — skissens egentliga poäng — är
  fortfarande nästa steg.
- `Home.tsx`: ny "Serier"-sektion ovanför den befintliga hyllan —
  skapa en serie (titel + Skapa-knapp, samma mönster som "Starta ett
  nytt manus"), varje serie som ett kort med bok-/fakta-antal och en
  "Öppna serien"-knapp. Den befintliga hyllan filtrerar nu bort böcker
  som redan tillhör en serie (de visas i sitt serie-kort istället) och
  byter rubrik till "Fristående manus" så fort minst en serie finns
  (annars oförändrad "Dina manus", för att inte introducera ett nytt
  begrepp för någon som aldrig rört vid serier). Varje kvarvarande
  fristående bok-rad fick en ny "Serie"-väljare bredvid
  Ta bort-knappen (bara synlig när minst en serie finns) för att
  flytta en redan existerande bok in i en serie i efterhand — den
  retroaktiva vägen in för manus skrivna innan den här funktionen
  fanns.
- i18n: ny `series`-namespace i alla tre språk (en/sv/nb) — rubriker,
  knapptexter, bekräftelsetexter, plural-former för "X böcker"/"X
  låsta fakta".
- CSS: `.series-shelf`/`.series-card`/`.series-workspace`/
  `.book-shelf-row-actions` m.fl., återanvänder befintliga design-
  tokens (`--panel`, `--border-soft`, `--font-prose` osv.) rakt av —
  ingen ny färgpalett.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1131 test,
oförändrat antal — ren UI/store-kod, inget nytt att enhetstesta utöver
det schema/persistence redan fick i steg 1) grön. `npm run build`
rent. Full Playwright-genomgång mot dev-servern (inget AI-anrop
inblandat i det här steget, så ingen mockserver behövdes): skapade en
serie, döpte om den inline, skapade en bok i den, stängde boken och
bekräftade att man hamnade tillbaka i serie-ytan (inte hyllan), gick
"Till hyllan" och bekräftade serie-kortet ("1 bok"), skapade en
fristående bok och bekräftade att hyllans rubrik bytt till "Standalone
manuscripts", flyttade den fristående boken in i serien via den nya
väljaren och bekräftade att den försvann från den fristående listan
och att serie-kortet nu visade "2 books", och bekräftade att
"Delete series"-knappen var avstängd så länge serien hade böcker.
Skärmdumpar av både serie-ytan och hyllan bekräftade utseendet —
matchar appens befintliga mörka tema utan avvikelser.

v1.0.178 → v1.0.179.

**Ändringslogg v1.0.180 (2026-10-24): Steg 3 av 5 i Series-planen —
den faktiska utdelningen: Brainstorm/Synopsis/Story Bible på
serienivå, plus "Skicka till serien". Föregicks av tre rundor
diskussion (ingen kod): var "bor" en karaktär — serie vs. bok (svar:
samma `entity_ref` på båda nivåerna, bokens egna fakta vinner vid
krock, en helt ny biroll behöver inget på serienivå alls förrän/om den
blir återkommande); "Skicka till serien"-mekaniken, med automatiskt
satt ursprung (aldrig inskrivet för hand); och att rik löptext/bilder
per entitet är för författaren och extraktorn — inte rådata rakt in i
Draft-prompten (den delen, rika entitetssidor med bild och historia,
är INTE byggd i det här steget — bara fakta-lagret, som planerat).**

- `NarrativeFact.ts`: tre nya valfria fält — `source_book_id`,
  `source_book_title`, `source_chapter_title`. Sätts ENDAST av
  författarens explicita "Skicka till serien"-knapp på ett redan låst
  bok-faktum, aldrig av extraktorn. Bok-titel och kapitel-titel
  denormaliseras vid promoveringstillfället (samma resonemang som
  `entity_label`) — serie-faktumet ska fortfarande gå att läsa
  ("Etablerad i: Bokens Titel, Kapitel N") även om boken senare döps
  om eller tas bort, utan en levande cross-repository-slagning varje
  gång serie-biblar renderas.
- `ConsistencyGate.ts`: `factFromDraft`s `args`-typ utökad med de tre
  nya fälten. Ny `applyPromotedFact` — samma beslutslogik som
  `applyAuthorDraft` (en författares eget påstående vinner alltid: en
  exakt dubblett no-opar, en genuin ändring överskrider seriens
  tidigare värde för den entiteten+predikatet) men taggar den nya
  raden med varifrån den kom. Fyra nya tester i
  `tests/core/consistency-gate.test.ts` (41 totalt i filen, upp från
  37).
- `SeriesStore.tsx`/`useSeriesStore.ts` utökade kraftigt: `setBrainstorm`/
  `setSynopsis` (samma debounce-mönster som bokens `patchBook`),
  `liftBrainstormToSynopsis` (återanvänder `liftFragmentToSynopsis`
  från `brainstorm.ts` rakt av — en ren strängfunktion utan Book-
  koppling), `extractSynopsis` (AI-anrop, bygger sin egen
  `LocalModelProvider` från `BookStore`s redan globala `engine`/
  `baseUrl`/`reviewModel`/`contextWindow` — motorinställningarna är
  delade mellan bok och serie, inte separata), `addFact`/`reviseFact`/
  `retractFact`/`approve`/`reject`/`keepSeparate` (alla tunna wrappers
  runt `ConsistencyGate`s redan existerande, helt Book-agnostiska
  funktioner — `evaluateCandidate`/`applyExtractorDrafts`/`approveFact`
  m.fl. opererar bara på `NarrativeFact[]`, ingen omskrivning behövdes
  för att återanvända dem på `Series.facts`), och `promoteBookFact`
  (anropar `applyPromotedFact`). `ollamaHint` exporterad från
  `BookStore.tsx` (var redan en ren funktion utan closure-state) för
  att återanvändas här istället för att dupliceras.
- Nytt: `src/ui/SeriesBiblePanel.tsx` — seriens egen Story Bible.
  Medvetet plattare än bokens `BiblePanel`: inga "kind"-sektioner,
  profiler, bilder eller kapitel-mentions, eftersom en serie inte har
  egna kapitel. Granskningskön återanvänder `PendingFact` — exporterad
  från `BiblePanel.tsx` (var redan en helt självständig, presentations-
  komponent utan Book-koppling) — rakt av, med `mergeOptions={[]}` för
  att dölja "slå ihop med"-väljaren (kräver bok-specifik `kind`-
  gruppering som inte finns på serienivå). Låsta fakta grupperas per
  entitet som kort, med "Etablerad i: ..."-raden synlig när
  `source_book_title` finns. Formulär för att lägga till ett faktum
  för hand (samma `applyAuthorAddition` som boken redan använder).
- `BiblePanel.tsx`: ny `onPromote`-prop trädd igenom `EntityOverlay`
  → `LockedFact`, bara given när `book.series_id` är satt — en ny
  "Skicka till serien"-knapp bredvid Redigera/Ta bort på varje låst
  faktum. Klick slår upp kapitlets titel (om faktumet är kopplat till
  ett) och anropar `promoteBookFact` med bok-id/titel + kapitel-titel.
- `SeriesWorkspace.tsx`: ombyggd med flikar (Brainstorm/Synopsis/
  Story Bible/Böcker) istället för en enda vy — Böcker-fliken är
  oförändrad från steg 2, bara flyttad in under en flik. Brainstorm
  är MEDVETET bara fritext (ingen post-it-tavla som bokens egen,
  ingen tray/send-mekanik) — ett enklare första steg; kan byggas ut
  senare om det visar sig behövas.
- i18n: `m.series.tabs`, lede-texter för Brainstorm/Synopsis,
  `extractFacts`/`extracting`, `lockedFactsHeading`/`noFactsYet`/
  `addFact`/`entityNamePlaceholder`, `establishedIn`/
  `establishedInChapter`, `sendToSeries` — alla tre språk.
- CSS: `.series-tabs`/`.series-tab`/`.series-tab-panel`/
  `.series-bible`/`.series-entity-grid`/`.series-entity-card` m.fl. —
  återanvänder samma design-tokens som tidigare steg.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1135 test, upp
från 1131 — 4 nya för `applyPromotedFact`) grön. `npm run build` rent.
Full Playwright-genomgång mot dev-servern med en mock-Ollama (port
11555, både streamande och icke-streamande `/api/chat`-svar, samma
mock som steg-3-feedbacken om fritextfältet i serie-importen tidigare
använde): skapade en serie, skrev i Brainstorm, lyfte till Synopsis,
extraherade fakta — bekräftade att det hamnade i granskningskön märkt
"Source: Synopsis", godkände det, bekräftade att det sedan visades
under "Series canon" grupperat på entitet. Skapade en bok i serien,
skapade en karaktär (Captain Reyes) med ett låst faktum i bokens egen
Story Bible, klickade "Send to series", stängde boken, gick tillbaka
till seriens Story Bible-flik och bekräftade att faktumet nu fanns
där, märkt "Established in: Book One, Chapter 1". Skärmdump bekräftade
utseendet — två entitetskort under "SERIES CANON", exakt som avsett.

v1.0.179 → v1.0.180.

**Ändringslogg v1.0.181 (2026-10-24): Steg 4 av 5 i Series-planen —
faktaupplösning. Det tidigare byggda var fortfarande overksamt: en
serie kunde hålla fakta, men en bok i serien märkte ingenting av det
när den faktiskt skrevs. Det här steget är det som gör föregående
steg verkligt — Draft/Recast m.fl. ser nu seriens låsta fakta.**

- Nytt i `NarrativeFact.ts`: `mergeInheritedFacts(bookFacts,
  seriesFacts)` — en ren funktion. Seriens LÅSTA fakta läggs på som en
  basnivå; ett bok-eget LÅST faktum för samma entitet+predikat vinner
  (ett bara flaggat eller föreslaget bok-faktum blockerar INTE
  ärvning — det är inte avgjort än, så seriens ord gäller tills
  författaren tar ställning). Returnerar bokens egna fakta oförändrade
  plus eventuella icke-överskridna seriefakta på slutet — resultatet
  är tänkt för läsning (prompt-byggande, visning), ALDRIG för att
  skrivas tillbaka som bokens egna `facts` (skulle duplicera
  seriekanon in i varje bok som ärver den). 6 nya tester i
  `tests/core/narrative-fact.test.ts` (14 totalt, upp från 8).
- `BookStore.tsx`: ny `SeriesRepository`-instans, en `seriesFactsRef`
  som hämtas om varje gång den öppna bokens `series_id` ändras (tom
  array för en fristående bok — ingen ändring i beteende alls för de).
  Ny `withInheritedFacts(book)`-hjälpfunktion: bygger en bok-formad
  vy med `mergeInheritedFacts` applicerad, ENDAST använd för
  prompt-byggande, aldrig för skrivningar (`patchBook` och liknande
  muterar fortfarande den riktiga `book`/`bookRef` rakt av). Istället
  för att röra generateProse.ts/characterInterview.ts/
  illustrationPrompt.ts internt (som alla läser `book.facts` själva),
  byts bara anropsplatserna i `BookStore.tsx` ut — `draftUserPrompt`,
  `recastUserPrompt`, `draftSceneUserPrompt`, `recastSceneUserPrompt`,
  `polishUserPrompt`, `passageUserPrompt` (extend/elaborate/instruct/
  beat), `relevantEntitiesForPassage` (illustrationsprompt-kontext)
  och `characterInterviewSystem` tar nu `withInheritedFacts(current)`
  istället för `current` rakt av — resten av koden i de modulerna är
  OFÖRÄNDRAD.
- Avsiktligt UTANFÖR det här steget (dokumenterad gräns, inte
  bortglömt): Proofread/Developmental-jobben och
  continuity-leak-varningen (`knowledgeLeaksForChapter`, Editor.tsx)
  rör vid `book.facts` på många ställen var och är egna, större
  bakgrundsjobb — risken att destabilisera dem uppvägde inte vinsten
  för det här steget. `applyExtractorDrafts`/`evaluateCandidate`s
  konflikt-jämförelse (när en NY bok-fakta föreslås) jämför fortfarande
  bara mot bokens egna fakta, inte seriens — en bok skulle alltså
  kunna föreslå något som redan motsägs av seriekanon utan att
  ConsistencyGate flaggar det. Kan tas som ett eget, mindre
  uppföljningssteg om det visar sig behövas i praktiken.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1141 test, upp
från 1135 — 6 nya för `mergeInheritedFacts`) grön. `npm run build`
rent. Playwright mot dev-servern med en mock-Ollama: skapade en serie,
låste ett faktum för hand ("Dun Sorrow" · Plats · "A fog-bound harbor
town") utan att skapa någon bok än, skapade sedan en bok i serien (noll
egna fakta), gick till Kapitel 1 och körde Draft, öppnade "View AI
context" (Tools-menyn) och bekräftade att prompten som faktiskt
skickades till modellen innehöll raden "Story Bible:\n- Dun Sorrow ·
Place: A fog-bound harbor town" — trots att boken själv aldrig haft
det faktumet. Skärmdump bekräftade att bokens egen Story Bible-panel
samtidigt visade "0 locked" — den ärvda faktan syns i prompten men
skrivs aldrig in i bokens egna, sparade fakta.

v1.0.180 → v1.0.181.

**Ändringslogg v1.0.182 (2026-10-24): Steg 5 av 5 i Series-planen —
export. Det sista steget i den ursprungliga planen (schema+persistence
→ organisation på hyllan → Brainstorm/Synopsis/Story Bible på
serienivå → faktaupplösning i Draft/Recast → det här: samma kanon
bakas in i filen en syskonapp faktiskt läser).**

- `manuscriptAppExport.ts`s `packManuscriptExport(book, exportedAt?,
  seriesFacts?)` — nytt tredje, valfritt argument (`NarrativeFact[]`,
  default `[]`). Använder samma `mergeInheritedFacts` som steg 4 redan
  byggde, nu som grund för `visibleLockedFacts` istället för
  `book.facts` direkt — exporten blir alltså precis den kanon Draft
  själv skriver med, inte bara bokens egen delmängd av den. En
  syskonapp som läser exporten har ingen möjlighet att hämta serien
  separat, så filen måste vara självbärande. En fristående bok (inget
  tredje argument, eller tomt) exporterar exakt som innan — ren
  bakåtkompatibilitet, inget beteende ändras för någon befintlig
  export-kod som anropar funktionen med två argument.
  `groupFacts`/`classifyEntity` hanterar redan en entitet utan post i
  bokens `entity_kinds` (klassificerar från predikatet istället) —
  ingen ändring behövdes där för att en ärvd entitet (som aldrig
  funnits i just den här boken) ska hamna i rätt Bible-sektion.
- `BookStore.tsx`: `seriesFactsRef` (satt i steg 4) fick en syskon-
  state, `seriesFacts`, så UI-lager som `Editor.tsx` kan läsa den
  reaktivt istället för att gå via en ref. `Editor.tsx`s "Export för
  andra appar"-knapp skickar nu `store.seriesFacts` som tredje
  argument.
- Medvetet UTANFÖR det här steget: Publish-exporten (människoläsbar,
  `buildManuscriptExport`) och backup-formatet rör vid den här ändringen
  INTE — Publish har redan sin egen, annorlunda visningslogik, och ett
  backup-snapshot ska vara exakt boken som den är, inte uppblandad med
  data som i praktiken lever någon annanstans.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1144 test, upp
från 1141 — 3 nya för `packManuscriptExport`s nya argument, i
`tests/core/manuscript-app-export.test.ts`, 17 totalt i filen).
`npm run build` rent. Playwright mot dev-servern (ingen AI-mock
behövdes — exporten är helt deterministisk): skapade en serie, låste
ett faktum för hand utan att skapa någon bok, skapade sedan en bok i
serien med noll egna fakta, körde FILE → "Export for other apps",
fångade den riktiga nedladdningen (`window.showSaveFilePicker`
avstängd i testet, annars hänger den riktiga filväljar-dialogen
Playwright inte kan styra) och läste den faktiska JSON-filen från
disk — bekräftade att `bible` innehöll "Dun Sorrow · Place: A
fog-bound harbor town" trots att boken aldrig haft det faktumet
själv.

v1.0.181 → v1.0.182.

Med det är alla fem steg i Series-planen levererade: schema+
persistence, organisation på hyllan, Brainstorm/Synopsis/Story Bible
på serienivå med "Skicka till serien", faktaupplösning i Draft/Recast/
Interview/Illustration, och nu export. Dokumenterade, medvetna gränser
kvar för framtida uppföljning: Proofread/Developmental/continuity-
leak-varningen ser fortfarande bara bokens egna fakta, inte seriens;
`ConsistencyGate`s konflikt-jämförelse för en NY bok-fakta jämför
fortfarande bara mot bokens egna, inte seriens; rika entitetssidor med
bild och löpande historia på serienivå (det Mats efterfrågade i
förhandsvisnings-diskussionen) är inte byggt.

**Ändringslogg v1.0.183 (2026-10-24): Uppföljning #1 av 2 på
Series-planen (Mats: "Om bok 1 har en fakta som lagts till serienivå
och användaren ändrar den faktan i bok 3 ska man då få någon slags
varning?"). Landade på två separata problem i samtalet: (1) tyst
överskridning vid LÅSNING — det här steget; (2) genuina krockar MELLAN
böcker utan att någon medvetet skrev över den andra — eget uppföljande
steg, inte byggt än.**

- `NarrativeFact.ts`: ny `seriesCanonConflict(entity_ref, predicate,
  value, seriesFacts)` — ren funktion, samma `lockedFacts`-filtrering
  som `mergeInheritedFacts` redan använder (bara LÅSTA, aktiva
  seriefakta räknas). Returnerar seriens nuvarande värde om det
  föreslagna värdet skiljer sig från det, annars `undefined`. 4 nya
  tester i `tests/core/narrative-fact.test.ts` (18 totalt, upp från
  14).
- `BiblePanel.tsx`: `EntityOverlay` fick en ny `seriesFacts`-prop
  (samma data `BookStore.tsx`s `seriesFacts`-state från export-steget
  redan exponerar) och ett nytt `seriesConflict`-state, samma mönster
  som den befintliga `addChoice`-bekräftelsen (en bok-egen krock under
  samma predikat). Två inkopplingspunkter, båda de vanligaste sätten
  en författare faktiskt låser ett nytt värde på: (a) "Add fact"-
  formuläret i en entitets kort — kollas EFTER den befintliga
  bok-egna krock-kollen (en redan pågående avvikelse i den här boken
  har företräde, inget poäng i att återupprepa seriens varning för
  något boken redan medvetet valt bort), (b) ett redan låst bok-faktum
  som redigeras via "Edit"/"Save" (`LockedFact`s inline-redigering) —
  den exakta scenen Mats beskrev ("bok 3 ändrar en fakta"). Vid krock:
  en bekräftelsedialog ("DIFFERS FROM THE SERIES" / "SKILJER SIG FRÅN
  SERIEN"), samma visuella mönster som `addChoice`-dialogen, med
  Avbryt/"Lås ändå". Bekräftat läses värdet in precis som vanligt — den
  här funktionen blockerar aldrig, bara gör avvikelsen synlig istället
  för tyst, exakt som Mats bad om.
- Medvetet UTANFÖR: `NewEntityOverlay` (att skapa en helt NY entitet
  vars namn råkar kollidera med en befintlig series-entitet) går
  fortfarande rakt igenom utan varning — mindre vanligt scenario,
  sparas som en känd, dokumenterad lucka snarare än att få samma
  behandling just nu.
- i18n: `m.series.conflictTitle`/`conflictBody`/`conflictLockAnyway`,
  alla tre språk.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1148 test, upp
från 1144 — 4 nya) grön. `npm run build` rent. Playwright mot
dev-servern (inget AI-anrop behövs, ren deterministisk UI-logik):
skapade en serie med ett låst faktum ("Elara Vane" · Identity ·
"Guardian of Dun Sorrow"), skapade sedan en bok i serien med en ny
karaktär av SAMMA namn och EXAKT samma värde — bekräftade att INGEN
varningsdialog visades (matchande värden ska vara tysta). Redigerade
sedan det bok-egna faktumet till ett annat värde via Edit/Save —
bekräftade att varningsdialogen nu visades, med rätt text ("The
series says Identity: ... this book would now say something else").
Klickade "Lock anyway" och bekräftade att det nya värdet faktiskt
låstes in i boken. Skärmdump bekräftade utseendet — matchar
`addChoice`-dialogens stil exakt.

v1.0.182 → v1.0.183.

**Ändringslogg v1.0.184 (2026-10-24): Uppföljning #2 av 2 på
Series-planen — "Blir #2 en kontroll man startar och sedan får den
snurra på?" Svar (bekräftat av Mats): nej, ren deterministisk
jämförelse av redan sparade låsta fakta, ingen AI inblandad, så ingen
bakgrundssnurra eller progressbar behövs — en knapp, ett omedelbart
resultat.**

- Nytt: `src/core/seriesConsistency.ts` —
  `crossBookConsistencyIssues(seriesFacts, seriesLabel, books)`. Andra
  halvan av det Mats efterfrågade ("skapar motstridiga fakta"), skild
  från det låsnings-tidiga varningen i v1.0.183
  (`seriesCanonConflict`): två syskonböcker ser ALDRIG varandras fakta
  alls, bara seriens — så ingenting hindrar dem från att oberoende låsa
  olika påståenden för samma entitet+predikat, utan att någon av dem
  medvetet skrev över den andra. Den här funktionen hittar det i
  efterhand: grupperar alla LÅSTA fakta (seriens egna + varje boks
  egna) per entitet+predikat, flaggar varje grupp med fler än ett
  distinkt (normaliserat) värde. Ren och synkron — `lockedFacts`-
  filtrering, samma `normalizeValue`-jämförelse som resten av
  ConsistencyGate redan använder. 6 nya tester i
  `tests/core/series-consistency.test.ts`.
- `SeriesStore.tsx`/`useSeriesStore.ts`: ny `BookRepository`-instans
  (läser varje bok i serien för dess fulla `facts`, inte bara
  `BookSummary`), `consistencyIssues`/`consistencyChecking`-state,
  `checkConsistency()` — body av funktionen är bara ett par `await`
  (hämta böcker, kör den rena funktionen), ingen job/progress-
  infrastruktur som Proofread/Developmental har. Nollställs vid
  `openSeries`/`closeSeries`/`createSeries` (ett resultat från en annan
  serie ska aldrig visas kvar).
- Nytt i `SeriesBiblePanel.tsx`: en "Konsistenskontroll"-sektion med
  en knapp och resultatlistan — varje flaggad post visar entitet +
  predikat, och en rad per källa (seriens eget namn, eller en
  bok-titel) med dess värde. "Inga motsägelser hittades." när allt
  stämmer.
- i18n: `m.series.consistencyHeading`/`consistencyCheck`/
  `consistencyChecking`/`consistencyLede`/`consistencyNone`, alla tre
  språk.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1154 test, upp
från 1148 — 6 nya) grön. `npm run build` rent. Playwright mot
dev-servern: skapade en serie, en bok ("Book Two") med en karaktär
("Elara Vane" · Identity · "A traveling merchant"), körde
konsistenskontrollen — bekräftade "No contradictions found." (bara en
källa, inget att jämföra mot). Skapade sedan en andra bok ("Book
Three") med SAMMA karaktärsnamn men ett AVVIKANDE värde ("A retired
soldier") utan att någonsin ha sett den första bokens version. Körde
kontrollen igen — bekräftade att den nu flaggade "Elara Vane ·
Identity" med båda böckernas värden listade under respektive
boktitel. Skärmdump bekräftade utseendet.

v1.0.183 → v1.0.184.

Med det är båda uppföljningsstegen på Series-planen levererade:
lås-tidig varning (#1) och en konsistenskontroll över hela serien
(#2). Kvarvarande, medvetna och dokumenterade luckor: `NewEntityOverlay`
(skapa en helt ny entitet vars namn kolliderar med en befintlig)
varnar fortfarande inte vid LÅSNING (#1 täcker bara "Add fact" och
redigering av ett redan låst faktum) — men själva konsistenskontrollen
(#2) hittar det ändå i efterhand, så inget faktiskt hål finns kvar i
TÄCKNING, bara i NÄR man får syn på det.

**Ändringslogg v1.0.185 (2026-10-24): Entitetssidor på serienivå —
den sista, tidigare medvetet avgränsade luckan från förhandsvisnings-
diskussionen ("en lista med korta faktatexter vore inte speciellt
intressant"). Mats: "Entitetsidorna vore bra att utveckla." Bygger
rakt på den uppdelning vi redan var överens om: rik text/bild = för
författaren och extraktorn, fakta = det Draft faktiskt ser.**

- `SeriesSchema.ts`: ny `SeriesEntityNoteSchema` (`entity_ref`,
  `history` — fri löptext) och ett nytt `entity_notes`-fält på
  `Series`. Återanvänder `entityMedia.ts`s redan helt generiska
  `EntityMediaSchema`/`EntityPicture` (bara `entity_ref` + bilder,
  ingen Book-koppling alls) rakt av för ett nytt `media`-fält på
  `Series` — ingen ny bildmodell behövde byggas. Nya hjälpfunktioner
  `entityNoteFor`/`setEntityNoteHistory` (samma mönster som fakta-
  hjälparna). 5 nya tester i `tests/core/series-schema.test.ts` (16
  totalt, upp från 11).
- `SeriesStore.tsx`: `setEntityHistory` (debounced, samma mönster som
  `setSynopsis`), `addEntityPicture`/`removeEntityPicture`
  (återanvänder `src/ui/entityImage.ts`s `picturesFromFile` — redan en
  helt generisk, Book-agnostisk fil→dataURL-konvertering — och
  `entityMedia.ts`s `addEntityPicture`/`removeEntityPicture`-rad-
  funktioner), och `extractEntityNote` — AI-anrop, samma mönster som
  `extractSynopsis` MEN med `EXTRACTOR_SYSTEM` (samma som en bok-lore-
  import använder: "established narrative facts from accepted prose")
  istället för `PLANNING_EXTRACTOR_SYSTEM` — en historiksida läser som
  fastslaget lore, inte en lös plan. Landar som `ai_proposed` under
  origin `"lore"` — samma etikett en boks egen lore-import redan
  visar i sin granskningskö, återanvänd en nivå upp istället för en
  ny origin-variant.
- Nytt: `src/ui/SeriesEntityDetailOverlay.tsx` — portätt/bilder
  (samma uppladdnings-UI som bokens `EntityOverlay` redan har, samma
  CSS-klasser, `MAX_ENTITY_PICTURES`), ett fritt "Historia &
  beskrivning"-fält med tydlig text om att det aldrig går till Draft
  som det är, "Extract facts from this text"-knapp, och en panel till
  höger märkt "what Draft sees" som visar entitetens redan låsta
  fakta (med proveniens, "Etablerad i: ...", när det finns) — samma
  tvådelade layout som förhandsvisnings-skissen (steg 4 i den
  tidigare Artifact-mockupen) redan lade fast.
- `BiblePanel.tsx`: `OverlayCard` exporterad (var redan en helt
  självständig presentationskomponent) för återanvändning i den nya
  overlayn.
- `SeriesBiblePanel.tsx`: varje entitetskorts namn är nu en klickbar
  knapp som öppnar den nya detaljsidan.
- i18n: `m.series.historyHeading`/`historyPlaceholder`/`historyHint`/
  `extractFromHistory`/`whatDraftSees`/`imagesNote`, alla tre språk.
  Återanvänder befintliga `m.bible.pictures`/`removePicture`/
  `addImage`/`addingImage`/`m.errors.image*`-nycklar rakt av — inga
  nya bildrelaterade strängar behövdes.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1159 test, upp
från 1154 — 5 nya) grön. `npm run build` rent. Playwright mot
dev-servern med mock-Ollama: låste ett faktum för "Elara Vane",
öppnade hennes entitetssida, bekräftade att "what Draft sees"-panelen
visade exakt det låsta faktumet (och inget annat), laddade upp en
bild och bekräftade en miniatyr (`.bible-picture-list img`, antal 1),
skrev en historik-text, klickade "Extract facts from this text",
stängde sidan och bekräftade att seriens granskningskö nu visade det
extraherade förslaget märkt "Source: Lore" — separat från det redan
låsta "Elara Vane"-kortet under "SERIES CANON". Skärmdump bekräftade
layouten (portätt, historik, "what Draft sees"-panelen) matchar
förhandsvisnings-skissen.

v1.0.184 → v1.0.185.

Med det är den sista medvetna luckan från Series-arbetet stängd:
schema+persistence, hylla, Brainstorm/Synopsis/Story Bible på
serienivå, "Skicka till serien", faktaupplösning i Draft/Recast/
Interview/Illustration, export, lås-tidig varning,
cross-bok-konsistenskontroll, och nu rika entitetssidor. Kvarvarande,
fortfarande medvetet avgränsat: Proofread/Developmental/continuity-
leak-varningen ser fortfarande bara bokens egna fakta; en AI-
extraherad bok-fakta jämförs fortfarande bara mot bokens egna vid
förslagstillfället, inte seriens; backup/restore rör fortfarande inte
vid Series-data alls.

**Ändringslogg v1.0.186 (2026-10-25): Två färska testarrapporter,
samma grundorsak — resonerande modeller äter upp sin egen svarsbudget
på dold "tänkande" innan de skriver ett enda synligt ord.**

Mats klistrade in två testarrapporter rakt av innan vi gick vidare
med "Spara"-frågan:

- Analyze mot en modell utan synlig "thinking"-toggle i LM Studios
  eget UI gav ett helt tomt svar — loggen visade
  `completion_tokens: 1800`, `reasoning_tokens: 1797` av samma
  1800-budget.
- Extract gav "cut off at the 4000-token limit (maxTokens) before it
  finished" på en annan lokal modell.

Samma buggklass som redan fixats för Polish i en tidigare session
(en resonerande modell fakturerar sitt dolda "tänkande" mot samma
`maxTokens`-budget som själva svaret), men den fixen satt bara på
Polish och var aldrig generaliserad.

- Nytt: `src/llm/tokenBudget.ts` — `REASONING_HEADROOM_TOKENS = 2000`
  och `withReasoningHeadroom(baseMaxTokens)`, en delad modul istället
  för att varje anropsställe skulle hitta på sin egen konstant. 2 nya
  tester i `tests/llm/tokenBudget.test.ts`.
- `BookStore.tsx`: `EXTRACTOR_MAX_TOKENS` (nu `withReasoningHeadroom(4000)`,
  exporterad) och `polishMaxTokens` skrivna om mot den delade hjälparen.
  Ny `ANALYZE_MAX_TOKENS = withReasoningHeadroom(1800)`, satt på
  Analyze-anropets båda ställen (scen-nivå och kapitel-nivå) — tidigare
  hårdkodat `maxTokens: 1800` utan något reserverat utrymme för
  resonemang alls.
- `SeriesStore.tsx`: tog bort sin egen dubblett-konstant, importerar
  nu `EXTRACTOR_MAX_TOKENS` från `BookStore.tsx` istället — samma
  budget-ökning når automatiskt seriens två extraktionsanrop
  (`extractSynopsis`, `extractEntityNote`).
- `src/llm/provider.ts` (`OpenAICompatibleLocalProvider.chat()`,
  LM Studio m.fl.) och `src/llm/ollama.ts` (`completeOllamaChat()`):
  båda körde sin "tomt svar"-kontroll FÖRE sin "avkapad vid gränsen"-
  kontroll, så en resonerande modell som tömde hela budgeten på
  tänkande utan att lämna någon synlig text alls fick det generiska
  "returned an empty reply" istället för den mycket mer användbara
  avkapningsförklaringen — exakt det första testarfallet (LM Studio
  rapporterade varken tomt innehåll som fel eller `finish_reason:
  "length"`). Vänd ordning på båda ställena. `OpenAICompatibleLocalProvider`
  läser nu även `usage.completion_tokens_details.reasoning_tokens` ur
  svaret (fanns i testarens egen LM Studio-logg, lästes aldrig förut)
  och räknar ≥90 % av budgeten åtgången på resonemang som samma fall
  som `finish_reason: "length"`, även om servern aldrig flaggade det
  explicit — felmeddelandet namnger då antalet resonemangstoken och
  föreslår att stänga av modellens "thinking"-läge eller höja
  svarsbudgeten. Ollamas native API saknar en motsvarande siffra, så
  den fixen är bara ordningsbytet.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1163 test, upp
från 1159 — 4 nya: 2 i `tokenBudget.test.ts`, 2 nya regressionstester
i `provider.test.ts` som återskapar båda testarrapporternas exakta
JSON-form) grön. `npm run build` rent. Ingen UI-förändring i denna
fix (ren fel-/budgethantering i LLM-lagret), så ingen ny Playwright-
körning utöver de befintliga som redan täcker samma anropskedjor.

v1.0.185 → v1.0.186.

**Ändringslogg v1.0.187 (2026-10-26): "Skrivtips" i Guiden — från
mockup till riktig funktion.**

Mats: "Lägg in i Guiden. Både svensk och engelsk." Direkt uppföljning
av artefakt-mockupen från föregående samtal (roadmap-ideas.md #53 —
numrerad om från #38 2026-10-26 när numret visade sig redan upptaget
av den äldre lore-relevans-punkten, se den ändringsloggens egen
notis), byggd på de skrivvanor- och hantverksinsikter vi redan
samlat in och Mats egen slutgiltiga text.

**Fel ställe, hittat och rättat innan commit:** byggde det först i
`GuidePanel.tsx` (den ankar-styrda referens-guiden, bara nåbar via
enstaka "?"-tooltips i editorn) eftersom min artefakt-mockup råkade
efterlikna just dess flik-stil. Playwright-verifieringen avslöjade
att appens faktiska "Guide"-knapp i topnaven (`m.guide.nav`, kopplad
till `store.showHandbook()` i `AppTopBar.tsx`) öppnar `HandbookPanel.tsx`
— den sekventiella, numrerade genomgången — inte `GuidePanel.tsx`
alls. En ny kategori i `GuidePanel.tsx` hade aldrig synts för en
vanlig användare. Rev manuellt tillbaka de fyra filerna (ingen
`git checkout`, bara motsvarande Edit-block i omvänd ordning — rent
diff bekräftat med `git diff --stat` innan ombyggnad) och byggde om
samma innehåll i rätt panel.

- `HandbookPanel.tsx`: ny kategori `"writing-tips"` i
  `HANDBOOK_CATEGORY_IDS` (före `"help"`, sist annars), 14 nya
  `HANDBOOK_SECTION_IDS` mappade dit i `HANDBOOK_SECTION_CATEGORY` —
  fem om skrivrutin, fyra om öppningsscener, fyra om en AI-assisterad
  texts egen röst, en källista.
- Innehållet återanvänder `handbook-body`s redan etablerade
  `\n`/`\n\n`-konvention (CSS `white-space: pre-line`, samma mönster
  som `connect-local-ai`/`map-of-storybook-ai` m.fl. redan använder)
  — bevarar Mats egna flerstyckestext med "Prova själv"/"Fråga
  dig"-rader intakt, till skillnad från `GuidePanel.tsx`s strikt
  en-paragraf-stil som hade tvingat en sammanpressning.
- Svensk text är Mats egen, oförändrad. Engelsk text är en översättning
  som bevarar samma struktur och ton. Norsk (`nb.ts`) tillkom för att
  TypeScript's delade `Record<HandbookSectionId, ...>`-typ kräver alla
  tre språkfilerna komplett — inte efterfrågat av Mats, men ett
  strukturellt krav för att bygget skulle vara typkorrekt; översatt
  separat, inte en direktöversättning av den svenska eller engelska
  texten.

**Verifiering:** `tsc --noEmit` rent genom hela processen (fångade
nb.ts-gapet direkt). Hela testsviten (1163 test, oförändrat — ingen
ny logik, bara i18n-data) grön. `npm run build` rent. Playwright mot
dev-servern bekräftade läget i båda riktningarna: engelsk vy via
"Open the Guide"-knappen visade alla 14 rubriker i rätt ordning under
flik "8. WRITING TIPS"; svensk vy (språkväxlaren satt till `sv`)
visade samma 14 under "8. SKRIVTIPS", rubrikerna exakt Mats egen
formulering. Skärmdumpar bekräftade styckesbrytningarna renderar
korrekt och att panelen matchar appens befintliga färgtema.

v1.0.186 → v1.0.187.

**Ändringslogg v1.0.188 (2026-10-26): Relationsspeglingen förstod
inte riktningen — "reluctant mentor to Wick" blev "reluctant mentor
to Amber".**

En testare: "the Story bible pulls the related character's entry and
suggest a change/addition to its own relationship tags. Except it
doesn't understand nuance - Wick gets 'reluctant mentor to Amber'
and Amber gets 'Rose's mother', which is plain wrong." Mats bad om en
förklaring, sedan: "Jag provar med 2" (det dyrare men rätta
alternativet, efter ett sidospår om vad "dyrare" faktiskt betyder —
inte pengar utan väntetid, se nedan).

**Grundorsak:** `relationshipMirrorDraft()` i `relationshipMirror.ts`
gjorde ren textsubstitution — letade upp den andra personens namn i
fakta-texten och bytte ut det mot den ursprungliga personens namn,
utan att röra något annat ord. Fungerar perfekt för symmetriska
relationer ("Träffade Erik vid hamnen" → "Träffade Anna vid hamnen"),
men för riktade relationer lämnas själva ROLLEN orörd: "reluctant
mentor to Wick" → "reluctant mentor to Amber" (ordet "mentor" byts
aldrig till "mentee"), "Amber's mother" → "Rose's mother"
(possessivet flippas aldrig). Inget AI-anrop i den gamla vägen —
synkron, deterministisk textersättning, aldrig menad att förstå
semantik.

**Fixen:** ett nytt AI-anrop (`relationshipMirrorDraftAI`,
`RELATIONSHIP_MIRROR_SYSTEM`) som ber Review-modellen skriva om
faktumet från den andra karaktärens perspektiv, med rollen
explicit vänd — korta, strukturerade instruktioner, inget nytt att
hitta på utöver det ursprungliga faktumet. Faller tillbaka till den
gamla mekaniska substitutionen om modellanropet kastar fel eller
returnerar tomt, så ett lås aldrig misslyckas bara för att
spegel-förslaget gjorde det. `RELATIONSHIP_MIRROR_MAX_TOKENS =
withReasoningHeadroom(60)` — samma reasoning-headroom-mönster som
v1.0.186, eftersom även ett par ord kräver budget för en resonerande
modells dolda tankepass.

- `src/core/relationshipMirror.ts`: detektionslogiken (`findMirrorTarget`)
  delad mellan mekanisk och AI-väg; `mechanicalMirrorValue` är nu
  explicit fallbacken, inte den enda vägen. Nya `relationshipMirrorDraftAI`,
  `withRelationshipMirrorAI`, `withRelationshipMirrorForAI`. 11 nya
  tester i `tests/core/relationship-mirror.test.ts` (24 totalt, upp
  från 13) — återskapar båda testarens exakta fall (Wick/mentor,
  Rose/mother) plus fallback-vägarna (kastat fel, tomt svar,
  citattecken runt svaret).
- `BookStore.tsx`: ny `mirrorRelationshipFact`-callback som binder
  `withRelationshipMirrorForAI` till Review-modellen, exporterad på
  store-kontexten (`useBookStore.ts`) så `BiblePanel.tsx`s merge-flöde
  kan återanvända samma provider-koppling istället för att duplicera
  den. `addFact`/`revise`/`approve` uppdaterade till den nya,
  asynkrona vägen.
- `BiblePanel.tsx`: `finalizeMergeFact` gjord async — AI-speglingen
  måste lösas INNAN `patchBook`s synkrona `mutate` körs, så den läser
  numera `book.facts` direkt (samma risknivå som andra async-sedan-
  commit-flöden i kodbasen redan har) istället för `patchBook`s egen
  `current`.

**Sidospår om "dyrare" (värt att notera för framtida svar):** Mats
frågade om "dyrare" betydde pengar — klargjorde att det är lokala
modeller, ingen API-kostnad, utan väntetid: en kall modellstart kan
ta upp mot en minut oavsett hur kort uppgiften är, och en resonerande
modell "tänker" en stund oavsett svarslängd (samma RELATIONSHIP_MIRROR_MAX_TOKENS-
poäng som v1.0.186). En redan varm, icke-resonerande modell svarar på
några sekunder även på en sån liten uppgift.

**Verifiering:** `tsc --noEmit` rent. Hela testsviten (1171 test, upp
från 1163 — 8 nya, `relationship-mirror.test.ts` gick från 9 till 17)
grön. `npm run build` rent. Playwright
mot dev-servern med en specialbyggd mock-Ollama (som känner igen
spegel-prompten på dess engelska formulering och svarar
"reluctant student of Amber"): skapade Amber och Wick, låste
"reluctant mentor to Wick" på Ambers kort, bekräftade att
granskningskön visade "Wick — Relationship: reluctant student of
Amber" — rollen korrekt vänd, inte testarens ursprungliga bugg.

v1.0.187 → v1.0.188.

**Ändringslogg v1.0.189 (2026-10-26): Uppföljning på v1.0.188 —
rollen vändes rätt, men attityden följde ändå med.**

Mats granskade resultatet och satte fingret på nästa lager av samma
bugg: "En sak att fundera på är om Reluctant verkligen kan speglas.
Att Wick är reluctant betyder inte att Amber är det?" — fast
omvänt, som han syftade på: att Amber är motvillig säger inget om
att Wick skulle vara det. Just det exempel min egen Playwright-
verifiering i v1.0.188 körde ("reluctant student of Amber") hade
redan detta fel inbyggt utan att jag såg det.

**Grundorsak:** `RELATIONSHIP_MIRROR_SYSTEM` instruerade modellen
att vända ROLLEN (mentor → mentee) men sa inget om att en känslo-/
attitydbeskrivande kvalificerare ("reluctant", "devoted", "jealous")
hör till ägaren av ursprungsfaktumet — inte till relationen i sig.
Utan den varningen smög attityden med vid rollvändningen, exakt
samma mekanism som gjorde v1.0.186/188 nödvändiga men ett steg
djupare: inte längre "fel roll", utan "en påhittad känsla hos fel
person".

**Fixen (Mats: "Kör på 2" — släpp attitydordet som default, hellre
än att försöka tillskriva det explicit):** ett nytt stycke i
`RELATIONSHIP_MIRROR_SYSTEM` som uttryckligen säger åt modellen att
droppa ett attityds-/känsloord om ORIGINALKARAKTÄRENS egen hållning
— "Amber: reluctant mentor to Wick" ska spegla till "Wick: Amber's
student" eller "mentored by Amber", aldrig "reluctant student of
Amber". Ren promptändring, ingen ny kodväg — detta går inte att
avgöra mekaniskt, bara styra via instruktionen.

- `src/core/relationshipMirror.ts`: nytt stycke i
  `RELATIONSHIP_MIRROR_SYSTEM`.
- 2 nya tester i `tests/core/relationship-mirror.test.ts` (19
  totalt, upp från 17) — samma mönster som
  `INTERVIEW_EXTRACTOR_SYSTEM`s egna innehålls-tester redan
  använder (`toContain` på instruktionstexten), plus ett test som
  bekräftar att pipen inte rör en redan attityds-fri modellsträng.

**Sidospår om "dyrare" fortsatte här:** ingen ny fråga den här
gången, bara en bekräftelse att "Kör på 2" syftade på alternativ 2
(släpp ordet) från den föregående diskussionen, inte en ny
kostnadsfråga.

**Verifiering:** `tsc --noEmit` rent. Hela testsviten (1173 test,
upp från 1171) grön. `npm run build` rent. Ingen ny Playwright-
körning — en mock kan bara eka vad jag själv hårdkodar i den, så den
skulle inte testa modellens faktiska språkliga omdöme; mekanismen
(spegelförslaget hamnar rätt i granskningskön) verifierades redan
live i v1.0.188.

v1.0.188 → v1.0.189.

**Ändringslogg v1.0.190 (2026-10-26): Critics — tre kritiker-personas
i en egen granskningsvy (roadmap-ideas.md #50, först av den
prioriterade ordningen 50 → 52 → 26).**

Direkt uppföljning av OnixWrite-jämförelsen (roadmap-ideas.md,
"Idéer från konkurrensjämförelse") — deras fem fasta kritiker-röster
på samma kapitel. Beslut tagna via tre riktade frågor innan bygget:
(1) egen flik bredvid Analyze, inte inbyggt i Analyze självt, (2) tre
personas — Otålig läsare, Pacing-kritiker, Förvirrad läsare — de två
med minst överlapp mot det Analyze/Proofread redan täcker (en
"Professionell kritiker" och en "Radredaktör" hade mest liknat
befintliga kategorier, medvetet uteslutna), (3) opt-in per körning
(kryssrutor, inget körs per automatik) för att hålla nere antalet
AI-anrop.

- Nytt: `src/core/critics.ts` — `CRITIC_PERSONA_IDS`, en egen
  systemprompt per persona (`CRITIC_SYSTEM_PROMPTS`, samma
  `{"items":[{"quote","observation"}]}`-kontrakt som `ANALYZE_SYSTEM`
  men i respektive personas röst), `criticUserPrompt` (manus + Reader,
  aldrig brainstorm eller Story Bible — en kritiker läser prosan, inte
  kanon), `parseCriticFeedback` (återanvänder `locateQuote` från
  `chapterFeedback.ts` för klickbar stycke-lokalisering). 9 nya tester
  i `tests/core/critics.test.ts`.
- `BookStore.tsx`: ny `runCritics(personas)` — ett AI-anrop per vald
  persona, körda parallellt (`Promise.all`), separat
  `criticFeedback`-state (`{chapterId, items}`, samma mönster som
  `chapterFeedback`) återställt vid varje boklast/stängning (alla sju
  befintliga `setChapterFeedback(null)`-rader fick en syskonrad).
  `CRITIC_MAX_TOKENS = withReasoningHeadroom(1800)` — samma
  reasoning-headroom-mönster som v1.0.186/188.
- Nytt: `CriticsSetupCard.tsx` (kryssrutor, inget ikryssat som
  startläge — till skillnad från `ProofreadSetupCard` där allt är
  ikryssat från start, eftersom varje kryssad persona här är ett eget
  AI-anrop författaren ska välja, inte en gratis delmängd av en redan
  beslutad körning) och `CriticFeedbackCard.tsx` (samma
  gruppera-och-klicka-för-detalj-mönster som `ChapterFeedbackCard.tsx`,
  grupperat per persona istället för kategori).
- `Editor.tsx`: ny knapp "Critics" bredvid "Analyze" i kapitelverktygs-
  raden, samma stopp/kör-mönster (`busy === "critics"`).
  `PromptOperation` (`promptDebug.ts`) fick ett nytt `"critics"`-värde
  (en första idé om att spåra per-persona i AI Context Inspector —
  `critic-${persona}` — visade sig inte vara en giltig typ; en delad
  `"critics"`-operation räcker, personan syns ändå i själva
  prompttexten).
- i18n: nytt `m.critics`-objekt (setup, resultat, tre personas med
  label+blurb) i alla tre språk, plus `m.editor.critics` och
  `m.aiContext.operations.critics`.

**Fel ställe, hittat och rättat INNAN commit den här gången** (lärdom
från v1.0.187): kollade `roadmap-ideas.md` för numrerings-krockar
INNAN jag började koda, inte efter — #50/51/52/53 var redan rättade
från den tidigare krocken (se föregående commit), så inget nytt
krockproblem uppstod den här gången.

**Containerbyte upptäckt och åtgärdat mitt i sessionen:** innan det
här bygget påbörjades visade `git log`/`git status` att den lokala
arbetskopian halkat efter origin (troligen en container-omstart under
den långa sessionen) — senaste lokala commit var `2c0b462` (långt
före sessionens start), medan origin/main redan låg på `d1aff17` med
alla tidigare commits denna session intakta. Inget förlorat: `git
fetch` + `git pull --ff-only` synkade rent (49 filer, strikt
fast-forward, inga konflikter), och `npm ci` fick köras om eftersom
`node_modules` inte fanns i den nya containern. Samma mönster upprepade
sig en gång till under Critics-bygget (`vitest`/`vite` saknade sina
egna `node_modules`-beroenden mitt i en testkörning) — samma fix,
`npm ci`.

**Verifiering:** `tsc --noEmit` rent (fångade en första version där
`baseUrl`-deprecation-varningen i `tsconfig.json` fick hela checken
att se "ren" ut trots oupptäckta typfel längre ner — `npm ci` och en
ren omkörning avslöjade det riktiga felet, en `PromptOperation`-typ
som inte tålde `critic-${persona}`). Hela testsviten (1182 test, upp
från 1173) grön. `npm run build` rent. Playwright mot dev-servern med
en mock-server som svarar olika beroende på vilken personas
systemprompt-text den ser: skapade ett kapitel med tre meningar, körde
alla tre personas i ett svep — bekräftade att UI-kortet gruppstyckade
resultatet per persona (Otålig läsare/Pacing-kritiker/Förvirrad
läsare, var sin unika observation), och att klick på ett citat öppnar
detaljvyn med stycke-nummer, citat och anteckning. Kört en gång till
med bara en persona vald, för att bekräfta att en-av-tre fungerar lika
bra som alla-tre.

v1.0.189 → v1.0.190.

**Ändringslogg v1.0.191 (2026-10-26): Kapitelradens ⚙️/🎬-emoji blev
egna SVG-ikoner.**

Mats: "Jag tänker på de ikoner som är bakom kapitlen.. Visst är de
typ lila?" Kollade koden: kugghjuls- och klappbräde-ikonerna i
Kapitel-listans radverktyg (`chapter-row-tools` i `Editor.tsx`) var
rena färgemoji (⚙️/🎬), vars färg kommer helt från OS:ets/webbläsarens
eget emoji-typsnitt — aldrig något appens egen `color: var(--text-dim)`
faktiskt styr. Chevronen (▾) är däremot en vanlig textglyf som redan
följer temat korrekt, lämnad orörd. Mats bekräftade efteråt att
ikonerna även var suddiga på hans skärm — ett annat symptom av samma
sak (färgemoji skalar sämre vid liten storlek än ett enkelt SVG-streck).

- `Editor.tsx`: två nya line-art-SVG:er (`SETTINGS_ICON`/`SCENES_ICON`),
  samma `viewBox="0 0 24 24" fill="none" stroke="currentColor"
  strokeWidth="1.5"`-stil som `QUICKSTART_ICONS` i `QuickstartCards.tsx`
  redan etablerat — ett kugghjul och en enkel klappbräde-approximation
  (filmruta med hack upptill). Två stale kodkommentarer som nämnde
  emojin uppdaterade till att beskriva knapparna istället.
- `styles.css`: `.icon-button svg { width: 0.95rem; height: 0.95rem;
  display: block; }` — storlek matchande den tidigare emoji-renderingen.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1182 test,
oförändrat — ren UI-ändring, ingen ny logik) grön. `npm run build`
rent. Playwright-skärmdumpar i båda temalägena (upptäckte på vägen
att temaknappens etikett namnger läget man BYTER TILL, inte det
nuvarande — "LIGHT" syns när appen redan är mörk) bekräftade att
ikonerna renderar skarpt och grått i båda, aldrig lila.

v1.0.190 → v1.0.191.

**Ändringslogg v1.0.192 (2026-10-26): Missade soptunnan.**

Mats, direkt efter förra releasen: "Är det inte en soptunna också?"
Rätt — `discardChapter`-knappen i samma kapitelradsverktyg hade kvar
🗑️. Sökte igenom hela `src/ui/*.tsx` med ett litet Node-skript
(ripgrep klarade inte de breda unicode-intervallen) efter alla
färgemoji för att inte missa fler i just den här raden — bara 🗑️ låg
kvar där, resten av träffarna (←→↑↓✓✎📌📍) är antingen vanliga
textglyfer (följer redan temat korrekt) eller 📌/📍 i en annan
kontext helt (vänsterpanelens/Story Bible-panelens fäst-knapp, inte
kapitelraden) — flaggat för Mats som en möjlig uppföljare, inte åtgärdat
här utan att fråga.

- `Editor.tsx`: nytt `TRASH_ICON`, samma line-art-stil som
  `SETTINGS_ICON`/`SCENES_ICON`.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1182 test,
oförändrat) grön. `npm run build` rent. Playwright-skärmdump med två
kapitel (soptunnan visas bara när fler än ett kapitel finns) bekräftade
skarp, grå rendering.

v1.0.191 → v1.0.192.

**Ändringslogg v1.0.193 (2026-10-26): Guide/Handbook-sidan saknade
sidmarginaler helt.**

Mats skickade en skärmdump: "Kan du fixa marginalerna på Guidesidan."
Fliken "6. REVISE THE MANUSCRIPT" såg ut att kapas vid högerkanten.
Reproducerade först i fel vy (Home-sidans modal, fungerade fint) och
fick sedan leta efter rätt återskapning — editorns inbyggda
Guide/Handbook-yta, nådd via "Guide" i topnaven när en bok är öppen
(`store.showHandbook()`), ett annat UI-spår än modalen.

**Grundorsak, bekräftad med `getComputedStyle` i en levande sida:**
`<main className="manuscript guide-page">` i både `GuidePanel.tsx`
och `HandbookPanel.tsx` hade `padding: 0px` — helt utan sidmarginal,
till skillnad från varje annan läsvy i appen (Synopsis, Timeline,
Development method), som alla också är `.manuscript` men dessutom
bär `manuscript-inset`-klassen (`padding-left/right: 1.5rem` i
`styles.css`). Guide/Handbook-sidorna fick aldrig den klassen när de
byggdes — texten och flik-raden låg alltså bokstavligen klistrade mot
både vänster- och högerrailens kant, inte bara "lite trångt".

- `GuidePanel.tsx`/`HandbookPanel.tsx`: `className="manuscript
  manuscript-inset guide-page"` — samma klass, ingen ny CSS behövdes.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1182 test,
oförändrat) grön. `npm run build` rent. Playwright bekräftade med
`getComputedStyle` att `.manuscript.guide-page` gick från `padding:
0px` till `padding: 0px 24px` (1,5rem), och en skärmdump vid samma
727px-bredd som Mats skickade visade flikraden med fullt andrum på
båda sidor. Dubbelkollade även att Home-sidans modal (som redan hade
egen kortpadding) inte fick dubbel marginal som ser fel ut — bara
lite mer luft, ingen regression.

v1.0.192 → v1.0.193.

**Ändringslogg v1.0.194 (2026-10-27): Storybook Core-anslutning, första
klient-integrationen.**

Mats bad mig "Kör på med klient-integrationen" efter att vi tillsammans
hade flyttat själva Core-tjänsten till ett eget repo (`ocedo-apps/StoryCore`,
se roadmap-ideas.md #31) och Mats hade provat tjänsten live på sin egen
dator (startat servern, loggat in på adminsidan, skapat en testarbetsyta
via API, tagit en backup och provat återställning — allt fungerade).
Den koden fanns redan uttänkt och byggd i 26 staplade draft-PR:ar i det
här repot (#2–#27, byggda av Mats tillsammans med ChatGPT Codex) — men
blandade server-kod (som redan flyttats) med klient-kod. Extraherade
bara klient-delarna (allt utom `packages/core-service/**`, som redan
ligger i StoryCore) ur den sista grenen i stapeln och applicerade som
en ren patch ovanpå `main`.

**Vad som landade:**
- Ny "Core"-knapp i topnaven, syns när ett manus är öppet
  (`AppTopBar.tsx`), öppnar `CoreConnectionDialog.tsx` — per-manus
  dialog för parkoppling och delningsval (Sandbox/Comic), av som
  standard.
- `src-tauri/src/core_bridge.rs` — Tauri-kommandon (`core_pair`,
  `core_connection`, `core_publish_shared`, `core_revoke_shared`) som
  pratar med Core över loopback (`127.0.0.1:43127`) och lagrar
  parkopplingsnyckeln i Windows Credential Manager (`keyring`-crate,
  Windows-only feature). Nyckeln lämnas aldrig till webvyn.
- `CoreSharingOutbox`/`CoreSharingRuntime` — en offline-tålig kö:
  varje lokalt sparande markerar ett redan delat manus som "pending"
  och försöker synka vid uppstart, återanslutning och var 30:e sekund.
  En nere-Core blockerar eller ändrar aldrig det lokala sparandet.
- `CoreManuscriptPublication.ts` — bygger publiceringen från den
  redan befintliga `packManuscriptExport()` (samma filter som Draft
  självt använder: fullständig prosa, bara låsta synliga Story
  Bible-fakta, aldrig Brainstorm eller ogranskat).
- `coreRevisionRestore.ts`/`coreRestoreWorkflow.ts` — förbereder
  återställning av en Core-version (byt ut befintligt manus eller
  skapa ett nytt), återanvänder Storybooks befintliga
  backup-importflöde (`parseManuscriptBackup`) precis som vi
  resonerade fram till i förra loggningen av #31.
- Två nya CI-workflows (`core-checks.yml` ubuntu, `core-desktop-checks.yml`
  windows-latest för Rust-bryggan) — plockade bort de rader som
  pekade på `packages/core-service` (flyttat), resten oförändrat.
- `docs/core-architecture.md` uppdaterad: pekar nu till StoryCore-repot
  för tjänstens egna kommandon istället för en lokal `packages/core-service`-
  sökväg som inte längre finns här.

**En sak till som gick sönder och fick lagas under tiden:** min
tidigare omstrukturering av StoryCore till `packages/schema` +
`packages/service` bröt faktiskt StoryBook AI:s redan existerande
git-dependency mot StoryCore (`@ocedo-apps/storycore` i detta repots
`package.json`, pekar på StoryCore-repots rot) — npm:s
git-dependencies kan inte peka på en undermapp, så roten måste
fortsätta VARA schema-paketet. Fixat i StoryCore (se dess egen logg)
innan den här integrationen byggdes vidare, annars hade `npm install`
här gått sönder helt.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (94 testfiler,
1240 test) grön, `npm run build` rent. Playwright-rök-test i
webbläsarversionen (inte Tauri): skapade ett nytt manus, Core-knappen
syns i topnaven, dialogen öppnas och visar korrekt "Core connection
requires the Windows desktop app" (det förväntade beteendet när
`isTauri()` är falskt) — ingen krasch, inga oväntade fel. Rust-sidan
(`core_bridge.rs`, `keyring`-beroendet) kunde INTE kompileras lokalt
i den här miljön (Linux-containern saknar GTK/WebKit-utvecklingsbibliotek
som hela Tauri-byggkedjan kräver på Linux, oavsett om ändringen rör
Rust eller inte) — det är precis därför `core-desktop-checks.yml`
redan var inriktad på `windows-latest` i den ursprungliga PR-stapeln.
Riktig verifiering av parkoppling/Credential Manager/publicering
kräver antingen Windows-CI eller Mats egen dator.

v1.0.193 → v1.0.194.

**Ändringslogg v1.0.195 (2026-10-27): "Skicka till Core" i
Backup-dialogen.**

Mats testade v1.0.194 på riktigt — parkopplade sin StoryBook AI mot
Core — och observerade att appens egen "Backup"-knapp (ordet som
redan används rakt av, både i UI och i Swedish-lokaliseringen
"Säkerhetskopia") inte alls rörde Core, bara den befintliga
JSON-filen. Vi resonerade fram till att det inte var fel att ha två
lager (JSON = garanterat beroendefri, Core-checkpoints = extra
skyddslager) — men att det var ett genuint UX-hål att
Core-checkpoint-knappen ("Spara privat version i Core") låg begravd
i en helt annan dialog (Core-anslutningsdialogen) än där man
naturligt letar efter "spara en säker kopia".

**Lösning:** en ny sekundärknapp "Skicka till Core" i samma
Backup-dialog som JSON-exporten, synlig bara när `isTauri()` är
sant (desktop) — annars osynlig, precis som Core-knappen i topnaven
redan är gated. Återanvänder exakt samma mekanism som redan fanns:
`store.checkpointBook()` (kö:ar en checkpoint, flush:ar debounced
redigeringar till lokal lagring först) följt av `flushCoreSnapshots()`
(skickar kön till Core, samma funktion Core-dialogens egen knapp
redan anropar) — ingen ny backend-logik, bara samma flöde nått från
ett nytt ställe. JSON-knappen (`m.backup.action`, primär) förblir
huvudvalet; Core-knappen är uttryckligen ett tillägg, inte en
ersättning — matchar invariant #10 i `core-architecture.md`
("Core is optional; an unavailable Core must never block or alter
local save").

Statustext efter klick: "Sparat i Core." vid lyckad send,
"Kunde inte nå Core just nu. Sparas lokalt och skickas automatiskt
när anslutningen är tillbaka." vid fel (checkpointen ligger redan i
den offline-tåliga kön och försöker igen automatiskt — felmeddelandet
är informativt, inte en varning om dataförlust).

**Verifiering:** `tsc --noEmit` rent, hela testsviten (94 filer,
1240 test, oförändrat) grön, `npm run build` rent. Playwright
bekräftade i webbläsarversionen (inte Tauri) att Backup-dialogen bara
visar "Cancel"/"Backup" — ingen "Skicka till Core"-knapp eller
hint-text läcker igenom till en miljö där den inte skulle fungera.
Inte testat i den riktiga Tauri-byggen i den här sessionen (samma
Linux-miljöbegränsning som v1.0.194); Mats kan testa på sin dator
när nästa desktop-bygge är klar.

v1.0.194 → v1.0.195.

**Ändringslogg v1.0.196 (2026-10-28): Core-dialogen omorganiserad i
flikar, efter en delad designartefakt med Mats.**

Mats laddade upp ett eget HTML-mockup-förslag (statisk prototyp, två
flikar "Delning"/"Versioner") och bad mig kommentera och bygga ett eget
förslag han kunde jämföra med — en interaktiv Design-canvas-artefakt
(claude.ai/artifact/ARH6MVVokSJiSZmZg88oUS), grundad i appens egna
riktiga färgtokens ur `styles.css` och verklig kopia från den befintliga
dialogen, inte generisk platshållartext. Mats testade artefakten live,
lämnade en kommentar direkt i artefakten ("Ska vi istället skriva namnet
på Manuskriptet?" — besvarad och löst i tråden), och bad sedan om två
till ändringar (titel-trunkering med "…", fast dialoghöjd oavsett
aktiv flik) innan han godkände och bad mig bygga in det på riktigt.

**Bytt i `CoreConnectionDialog.tsx`:**
- Parkoppling/anslutningsstatus (formulär, status rad, "Kontrollera
  anslutning") ligger kvar överst, utanför flikarna — gäller båda
  flikarna lika, går inte att dela upp.
- Ny flikrad "Delning"/"Versioner" (bara på desktop, samma `isTauri()`-
  gate som resten av dialogen): Delning-fliken fick sandbox/comic-
  kryssrutorna + delningsstatus; Versioner-fliken fick auto-spara-
  kryssrutan, "Spara privat version"-knappen, versionslistan och
  jämför/återställ-panelen — exakt samma logik/state som innan, bara
  flyttad under rätt flik, ingen ny datahantering.
- Rubriken visar nu `currentBook.title` (trunkerad till 32 tecken +
  "…" om längre, med fullständig titel i `title`-attributet för hover)
  istället för det statiska "Storybook Core" — det gamla värdet flyttades
  till en liten eyebrow-etikett ovanför istället, eftersom man redan vet
  att man öppnat Core-dialogen (man klickade just på en knapp som heter
  "Core") men inte annars ser vilket manus dialogen gäller.
- Ny CSS (`styles.css`): `.core-connection-card` fick fast höjd
  (`min(640px, 86vh)`) och flex-kolumn-layout istället för bara
  `max-height`/`overflow-y`, så att `.core-tab-panel` (den enda delen
  som faktiskt scrollar, `flex:1; min-height:0; overflow-y:auto`) är det
  som växer/krymper internt — inte hela dialogrutan — när man byter flik.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (94 filer, 1240
test, oförändrat) grön, `npm run build` rent. Playwright kunde inte
testa desktop-gated UI direkt (samma begränsning som tidigare), så jag
spoofade `window.isTauri = true` i en headless webbläsarsession för att
faktiskt rendera flikarna och mäta kortets höjd — bekräftat identisk
höjd (619.1875px) före och efter flikbyte, rubriken trunkerad korrekt,
Versioner-panelens innehåll (auto-spara-text m.m.) synligt och rätt.
De två `invoke`-felen som syntes i testet var väntade — spoofningen
ger ingen riktig Tauri-IPC-bro, inget appfel. Riktig parkoppling/
Credential Manager-flödet är fortfarande inte testat i den här miljön.

v1.0.195 → v1.0.196.

**Ändringslogg v1.0.196 → v1.0.197 (2026-10-28): automatisk
parkoppling mot en nyinstallerad Core — uppgift 4 och 5 av 5 i
"enklare installation/koppling"-jobbet** (uppgift 1–3, byggda i
StoryCore-repot, redan klara och verifierade på riktig Windows-CI:
auto-provisionering + bootstrap-fil, Node SEA-paketering till en
fristående `.exe`, en icke-upphöjd Windows-installerare med
Startup-genväg). Mats: "Kör på med 4 och 5."

**4 — Tauri-bryggan läser bootstrap-filen (`core_bridge.rs`):**
- Ny `bootstrap_path()`-hjälpfunktion (Windows-bara, bakom samma
  `#[cfg(target_os = "windows")]`-gränser som resten av bryggan):
  `%LOCALAPPDATA%\StoryCore\core.db.bootstrap.json` — exakt samma
  sökväg som Core-tjänstens egen `defaultDbPath()` i
  `packages/service/server.mjs` (StoryCore-repot) lämnar filen vid,
  eftersom installeraren aldrig skriver över den.
- Ny `core_auto_claim`-kommando: läser filen, tar `storybook`-fältet
  (ett 64-tecken hex-värde, samma validering som `core_pair` redan
  gör), verifierar det mot Core precis som manuell parkoppling
  (`check_identity`), sparar det i Windows Credential Manager vid
  träff — och sätter sedan `storybook`-fältet till `null` i filen på
  disk, så att en syskon-app (ComicBook AI, Sandbox) som läser samma
  fil senare får sitt eget, oanvända fält och aldrig samma token igen.
  Misslyckas tyst (vanligt `Result`-fel, ingen krasch) om filen saknas,
  är oläsbar eller redan är tömd på Storybooks fält — anroparen faller
  tillbaka till det manuella fältet precis som innan.
- Registrerad i `lib.rs`s `invoke_handler!`-lista.
- `CoreDesktopTransport.ts` fick en tunn `coreAutoClaim()`-wrapper
  (samma `isTauri()`-mönster som övriga `core_*`-anrop) som fångar
  alla fel internt och returnerar `false` istället för att kasta —
  UI-sidan ska aldrig behöva skilja "inget att hämta" från ett
  oväntat fel här.

**5 — UI försöker auto-parkoppling före det manuella fältet
(`CoreConnectionDialog.tsx`):** dialogens befintliga första
`useEffect` (den som laddar anslutningsstatus när dialogen öppnas)
anropar nu `coreAutoClaim()` innan `load()` när `desktop` är sant —
om den lyckas är `core_connection` redan parkopplad nästa gång
statusen läses in, och det manuella nyckelfältet (`desktop &&
!connection.paired`) visas aldrig. Misslyckas den (annan maskin,
redan hämtat fält, icke-Windows) syns ingen skillnad alls — samma
manuella fält som förut. Ingen ny state, inget nytt UI-villkor;
bara ett tyst försök insatt före den redan existerande laddningen.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (94 filer,
1240 test, oförändrat) grön, `npm run build` rent. Rust-sidan
(`core_bridge.rs`, `lib.rs`) kan inte bygga/typkontrolleras i den
här sandlådan (saknar GTK/WebKit för en fullständig Tauri-build) —
verifieras istället på riktig `windows-latest`-CI
(`desktop-build.yml`/`core-desktop-checks.yml`) efter push, samma
mönster som uppgift 1–3 i StoryCore.

v1.0.196 → v1.0.197.

**Ändringslogg v1.0.197 → v1.0.198 (2026-10-28): namnbytet — StoryBook
AI blir kaampi Write.** Mats har köpt kaampi.com/.se och bestämt
appnamnen för hela det kreativa ekosystemet: StoryBook AI → kaampi
Write, ComicBook AI → kaampi Comic, Sandbox AI → kaampi Explore,
StoryCore → kaampi Codex (de tre sistnämnda görs i sina egna repon).
Ocedo-apps-organisationen och Vira berörs inte — de hör inte till
kaampi-ekosystemet.

**Vad som byttes i det här repot:** varje synlig förekomst av
"StoryBook AI" — fönstertitel och `productName` i `tauri.conf.json`,
alla tre språkfiler (`i18n/en.ts`, `sv.ts`, `nb.ts`, 30 förekomster
var), `AppTopBar.tsx`/`Home.tsx` (bild-`alt`-text), felmeddelanden i
`ollama.ts`/`provider.ts`, launcher-skripten (`starta.bat/.sh/.command`),
README, `docs/guide.md`, `docs/running.md`, installer-stubben
(`installer-stub/storybook-ai-online-installer.iss`, både `MyAppName`
och löptext), `package.json`s och `Cargo.toml`s `description`-fält,
samt CI-workflow-namnen — blev "kaampi Write".

**Vad som INTE byttes, medvetet:**
- `tauri.conf.json`s `identifier` (`se.ocedo.storybookai`) och
  deep-link-schemat (`storybookai`) — Tauri/Windows egna
  app-identiteter. Byts de nu tappar den redan installerade appen på
  Mats dator sin koppling till sin egen installationspost (uppdatering/
  avinstallation skulle se ut som en helt ny app).
- Core-identitetssträngen `"app": "storybook"` som `check_identity`
  i `core_bridge.rs` jämför mot, och samma sträng på Core-tjänstens
  sida (StoryCore-repot) — en teknisk nyckel, inte ett visningsnamn.
  Byts den krävs synkroniserad ändring i båda repona samtidigt och
  Mats måste parkoppla om.
- Windows Credential Manager-posten (`se.ocedo.storybookai.core`) —
  rör Mats redan sparade, riktiga parkopplingsnyckel. Att byta den nu
  utan migrering skulle kräva ominstallation/omparkoppling i onödan.
- `package.json`s `name`-fält (`storybook-ai`, ren teknisk slug) och
  GitHub-repots URL/namn — repot flyttas inte i detta steg; det är
  Mats eget, separata steg (Transfer ownership till kaampi-orgen) när
  han är redo. GitHub:s omdirigering gör att den gamla länken
  fortsätter fungera under tiden.
- Historiska loggposter i `project_spec.md`, `CHANGELOG.md` och
  `roadmap-ideas.md` (allt ovanför den här posten) — de beskriver vad
  som hände under det namn appen bar då; att skriva om historien
  retroaktivt kändes mer missvisande än att bara fortsätta framåt
  under det nya namnet härifrån.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (94 filer, 1240
test, oförändrat — inget testar synliga strängar mot "StoryBook AI")
grön, `npm run build` rent.

v1.0.197 → v1.0.198.

**Ändringslogg v1.0.198 → v1.0.199 (2026-10-28): riktig kaampi-logga.**
Mats: "Storybook Tauri heter nu kaampi Write men i själva appen är
det fortfarande Storybook loggan. Men som tur är har jag en ny :)" —
skickade två SVG:er: `logo_kaampi.svg` (fristående "kaampi"-märket,
sparat som referens i `public/brand/kaampi.svg` för framtida bruk,
t.ex. en kaampi.com-webb) och `logo_kaampi_write.svg` (den
sammansatta "kaampi Write"-logotypen — samma märke plus det grå
"Write"-ordmärket, exakt samma bildförhållande som de gamla
`logo.png`/`logo-dark.png`, 1193×202 mot 1364×319).

Bytte `public/logo.png`→`public/logo.svg` (ljus bakgrund, originalet
rakt av) och `public/logo-dark.png`→`public/logo-dark.svg` (mörk
bakgrund — skapad genom att invertera de två textfärgerna,
rgb(35,31,32)→rgb(240,240,242) och rgb(103,112,132)→
rgb(168,176,194); den magentafärgade accentrutan rgb(255,0,143)
oförändrad i båda). Uppdaterade `<img>`-referenserna i
`AppTopBar.tsx` och `Home.tsx` till de nya filnamnen och tog bort de
gamla PNG-filerna. SVG istället för PNG var ett medvetet val, inte
bara en filtypskonvertering — skarpare rendering på alla
skärmstorlekar/upplösningar, och källan var redan vektor.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Renderade faktiskt hemskärmen i en
headless webbläsare i båda temalägena (knappen växlar appens eget
tema, inte OS:ets `prefers-color-scheme`) och bekräftade visuellt
att rätt variant visas mot rätt bakgrund — skärpa och kontrast ser
bra ut i båda.

**Kvarstående, inte löst här:** Tauri-app-ikonen
(`src-tauri/icons/*`, `.ico`/`.icns` för Windows/Mac, used för
installer/aktivitetsfält) är fortfarande den gamla StoryBook-ikonen.
Ingen av de två skickade loggorna är kvadratiska (bredformat
ordmärken), så en ny kvadratisk ikon/symbol behövs separat — frågat
Mats om han har en, inte löst i den här ändringen.

v1.0.198 → v1.0.199.

**Ändringslogg v1.0.199 → v1.0.200 (2026-10-28): app-ikonen.** Jag
frågade om en kvadratisk symbol för Tauri-app-ikonen eftersom
ingendera skickad logga var kvadratisk. Mats skickade ett 480×480
PNG: magenta kvadrat med ett vitt, seriffat "W" i samma stil som
"Write"-ordmärket.

Genererade hela ikonuppsättningen från källbilden med Tauris egen
`npx tauri icon`-kommando istället för att skala/beskära manuellt —
skriver alla storlekar/format (`.ico`, `.icns`, `32x32.png` upp till
`128x128@2x.png`, hela Windows Store-plattan `Square*Logo.png`/
`StoreLogo.png`) konsekvent från en enda källa. Kommandot skrev även
iOS/Android-ikonuppsättningar den här appen inte använder (inget
mobilt bundle-mål i `tauri.conf.json`) — de togs bort igen.

Källbilden sparad som `public/brand/app-icon-source.png` för
framtida ombygge (t.ex. om storlekskraven ändras).

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent. Den
faktiska ikon-/installer-bygget kan bara verifieras på riktig
Windows-CI (samma begränsning som alltid i den här sandlådan för
Tauri/Rust-sidan) — visuellt kontrollerad på skärm här innan commit.

v1.0.199 → v1.0.200.

**Ändringslogg v1.0.200 → v1.0.201 (2026-10-28): webbläsarflikens
favicon.** Mats: "Ska favico vara genomskinlig eller blir W vitt?" —
upptäckte att `index.html` aldrig haft någon `<link rel="icon">` alls,
så frågan gällde egentligen vad som skulle sättas första gången.
Förklarade att källbilden redan är solid magenta (ingen alfakanal),
och frågade vilket han ville ha. Mats: "Nej det blir bra med vitt W"
— dvs. samma solida magenta-ruta som app-ikonen, ingen genomskinlig
variant.

Lade till `public/favicon-32x32.png` och `public/favicon.png` (512px,
för skarpare bokmärken/högupplösta skärmar), båda beskurna direkt
från samma ikonkälla som Tauri-app-ikonen (`src-tauri/icons/32x32.png`
och `icon.png`) — inget nytt genererat, bara kopierat till `public/`
så Vite serverar dem som statiska filer. Två `<link rel="icon">`-
taggar i `index.html`s `<head>`.

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent.

v1.0.200 → v1.0.201.

**Ändringslogg v1.0.201 → v1.0.202 (2026-10-28): UI-typsnittet blir
Barlow.** Mats byggde en typsnittsjämförelse-artefakt
(claude.ai/artifact/RE3gw5TB8tdVi3KNE1SriG) som visade Figtree/
Newsreader mot Barlow/Source Serif 4 sida vid sida på en riktig vy
av hemskärmen. Gillade båda, men påpekade att serifferna är så lika
att det knappt märks, och att Newsreader är mjukare/mer editoriell
än Source Serif 4 — föreslog att behålla Newsreader men byta
Figtree → Barlow (som matchar kaampi-loggans Bahnschrift-känsla, och
dessutom är mer kondenserad, bra för trånga UI-strängar i
svenska/norska översättningarna).

**Teknisk skillnad mot Figtree:** Barlow finns bara som statiska
per-vikt-filer på Google Fonts, ingen `wght`-variabelaxel. Laddade
ner sex TTF:er (Regular/Medium/SemiBold/Bold + Italic/BoldItalic)
från google/fonts-repot, konverterade till woff2 med fontTools,
lade till som sex separata `@font-face`-block istället för
Figtrees enda variabla block. En vikt utan exakt matchning (t.ex.
`.core-tab`s 650) matchar nu automatiskt till närmaste statiska vikt
(700) via webbläsarens egen font-matchning — ingen skillnad i CSS,
bara i vilken fil som faktiskt laddas.

Bytt `--font-ui` till `"Barlow"` — alla ställen som redan använde
`var(--font-ui)` (arton stycken) fick den nya fonten automatiskt,
ingen annan kod ändrad. `public/fonts/figtree-variable.woff2`
borttagen, sex `barlow-*.woff2`-filer tillagda.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Renderade hemskärmen i en headless
webbläsare och läste faktiskt ut `getComputedStyle` för att bekräfta
att `<h1>` fortfarande får Newsreader och `<body>` nu får Barlow —
inte bara en visuell kontroll.

v1.0.201 → v1.0.202.

**Ändringslogg v1.0.202 → v1.0.203 (2026-10-28): kvarglömt
"Storybook" i Core-dialogen.** Mats skickade en skärmbild av
Core-anslutningsdialogen — eyebrow-etiketten sa fortfarande
"STORYBOOK CORE" och texten "This manuscript stays in Storybook's
local storage." Namnbytespasset den 28:e missade den här
komponenten helt, trots att `CoreConnectionDialog.tsx` faktiskt var
med i den ursprungliga träfflistan för "Sandbox"-sökningen — bara
inte åtgärdad då.

**Bytt i `CoreConnectionDialog.tsx` (alla tre språk):** `title`
("Storybook Core" → "kaampi Write Core"), `local`
("...i Storybook" → "...i kaampi Write"), `token`
("Parkopplingsnyckel för Storybook" → "...för kaampi Write"),
`sandbox` ("Visa i Sandbox" → "Visa i kaampi Explore") och `comic`
("Visa i Comic" → "Visa i kaampi Comic") — de sistnämnda två är
delningsswitcharna på Delning-fliken, samma "Sandbox"/"Comic"-
mönster som redan fixades i i18n-filerna och READMEn men som
missades just i den här komponentens egna inline-copy-objekt.

Passade även på att fixa två kvarglömda felmeddelanden i
`coreRevisionRestore.ts` ("A Storybook-owned private Core revision
is required." / "...not a full Storybook manuscript.") — ren
visningstext, rör inte den tekniska identitetssträngen
`owner_app !== "storybook"` några rader ovanför, som är orörd av
avsikt (Core-kontraktets egen nyckel, inte ett visningsnamn).

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent.

v1.0.202 → v1.0.203.

**Ändringslogg v1.0.203 → v1.0.204 (2026-10-28): mellanrum i
Core-dialogen.** Mats skickade en skärmbild av eyebrow-etiketten och
titeln i Core-dialogen ("STORYBOOK CORE" / "The Weight of the
Course" — från hans ännu inte uppdaterade körande app) och bad om
mer mellanrum mellan de två textraderna. `.core-connection-title`s
`margin-top` höjd från `0.25rem` till `0.5rem`.

Återskapade dialogen på riktigt i en headless webbläsare (nytt
manus, spoofad `window.isTauri`, klickade fram till Core-dialogen)
för att verifiera både mellanrummet och att v1.0.203:s namnbyte
faktiskt syns: eyebrow-etiketten läser nu "KAAMPI WRITE CORE", inte
"kaampi Codex" som Mats antog i sitt meddelande — flaggat till
honom i svaret, inte ändrat ensidigt eftersom det är ett namnval,
inte en bugg.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent, visuellt bekräftat i headless browser.

v1.0.203 → v1.0.204.

**Ändringslogg v1.0.204 → v1.0.205 (2026-10-28): "Core" blir
"kaampi Codex" i UI:t, och texterna skrivs om pedagogiskt.** Mats
föreslog "kaampi Write Codex" som eyebrow-titel istället för "kaampi
Write Core" ("Core har vi ju dumpat"), och bad om mer flytande,
pedagogisk text i dialogens förklarande stycken för någon som inte
använt Core/Codex och Write förut.

**Genomgång:** bytte varje synlig förekomst av ordet "Core" (som
produktnamn, inte den tekniska identitetssträngen) till "kaampi
Codex" — `CoreConnectionDialog.tsx` i alla tre språk (titel,
statusrader, knappar, flikinnehåll), Backup-dialogens "Send to
Core"-knapp och dess hjälptext/status, samt ett par felmeddelanden
(`BookStore.tsx`, `manuscriptBackup.ts`).

**Samtidigt fångade jag flera kvarglömda märkesnamn** det
ursprungliga namnbytespasset missade helt, eftersom min sökning då
bara letade efter "StoryBook AI"/"ComicBook AI" (med mellanslag) och
"StoryCore" (hela ordet) — inte böjda/sammansatta former: "A
StoryBook backup", "StoryBook-projektet", "StoryCore manuscript
export", kvarvarande "ComicBook AI" i kodkommentarer
(`manuscriptExport.ts`s IDML-jämförelser, `downloadJson.ts`,
`BusyDialog.tsx`), och "Sandbox Character Studio" i en kommentar.
Alla bytta till kaampi Write/Comic/Explore/Codex. Ett test
(`manuscript-backup.test.ts`) matchade på den gamla
felmeddelandetexten och behövde uppdateras i samma commit.

**Omskriven förklarande text (exempel, engelska):**
- `subtitle`: "Sharing and versions in Core for this manuscript." →
  "kaampi Codex is an optional local helper: it can back up this
  manuscript and share parts of it with your other kaampi apps."
- `local`: "This manuscript stays in kaampi Write's local storage."
  → "By default, this manuscript stays only in kaampi Write's own
  local storage on this computer — nothing else is needed."
- `disconnected`: "Core is not paired." → "kaampi Codex isn't
  connected yet. Pair it below to turn on automatic backups and
  sharing with your other kaampi apps."
- `offline`/`connected` fick samma behandling — förklarar vad
  tillståndet faktiskt betyder istället för bara ett statusord.
  Samma ton återskapad på svenska och norska, inte ord-för-ord-
  översatt.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test,
efter fixen av det brutna testet) grön, `npm run build` rent.
Återskapade dialogen i headless browser (nytt manus, spoofad
`window.isTauri`) för att bekräfta layouten håller med den längre
texten — ingen överlappning eller klippning trots att flera strängar
blev betydligt längre.

v1.0.204 → v1.0.205.

**Ändringslogg v1.0.205 → v1.0.206 (2026-10-28): mellanrums-fixen
gjorde faktiskt ingenting.** Mats: "Jag ser inte att mellanrummet
mellan kaampi Write Codex och Bokens namn har ökat?" — med rätta.
Mätte faktiskt avståndet i en headless browser istället för att bara
titta: `title.top - eyebrow.bottom` gav **0px**, trots att
`.core-connection-title`s `margin-top` redan höjts två gånger
(0.25rem → 0.5rem i v1.0.204, aldrig verifierat med en riktig
mätning, bara "ser rimligt ut").

**Grundorsaken:** `.edit-card h2 { margin: 0; ... }` (rad ~4902,
tagg+klass, specificitet 0-1-1) vann över `.core-connection-title`
(en klass, specificitet 0-1-0) oavsett käll-ordning eller hur stort
margin-värdet sattes — CSS-specificitet, inte storleken på värdet,
avgjorde. `.core-connection-card` ärver `.edit-card`s klass, så båda
reglerna matchade samma `<h2>`.

**Fix:** `.core-connection-title` → `.core-connection-card
.core-connection-title` (två klasser, specificitet 0-2-0), höjt till
`0.85rem`. Verifierade den här gången med en riktig DOM-mätning
(`getComputedStyle().marginTop`) innan commit: `13.6px`, inte 0.

**Lärdom värd att skriva ner:** en CSS-ändring i den här kodbasen är
inte "verifierad" förrän avståndet faktiskt mätts i en riktig
renderad sida — ett `npm run build` som lyckas säger ingenting om
huruvida en specificitetskonflikt tyst åt upp ändringen. Framtida
spacing-/layout-fixar bör mätas, inte bara byggas.

v1.0.205 → v1.0.206.

**Ändringslogg v1.0.206 → v1.0.207 (2026-10-28): en gemensam
stängningsikon.** Mats: "Jag upplever att vi har olika sätt för att
stänga dialogrutor. Ibland Close och ibland X." + skickade en SVG
(kvadrat med X, magenta/sage-ton) och bad att den användes
konsekvent, uppe till höger.

**Scoping (fråga till Mats, svarat "Börja smalt"):** ca 30 av
appens dialoger/kort har en "Close"-knapp, men bara en del av dem
har en egen rubrikrads-stängningskontroll (titel + stängningsknapp
i samma rad) — resten har bara EN "Close"/"Cancel"-knapp längst ner,
ofta ihop med en primär åtgärd ("Fråga", "Spara", "Starta"). Att
lägga till en ny hörn-X i de senare hade varit en omdesign av varje
enskilt korts layout, inte en konsekvensfix. Mats valde att bara
göra om de som redan har en egen hörnkontroll.

**Genomförande:** skapade `CloseIconButton.tsx` (en delad
komponent, SVG:n inbäddad med `fillRule="evenodd"` så X:et klipps ut
korrekt, färgad via CSS `--sage` genom en ny `.close-icon-button`-
modifierare på den redan existerande `.icon-button`-basklassen).
Bytte ut stängningsknappen i alla kort/dialoger med en egen
rubrikrad — tre återkommande CSS-mönster täckte nästan alla:
`dialog-head` (Core-dialogen, Sök i manus, Inställningar),
`stats-card-head` (Kritiker, Proofread, Developmental edit, Guide/
Handbook AI-setup, Prose Stats, Progress, Uppdateringskontroll — två
av dem, Proofread/Developmental, har en villkorlig Stopp-knapp under
körning som fick vara kvar som text) och `bible-card-head-actions`
(Story Bible-korten: import manus, lore-import, markerkonvertering,
plotline-redigering, serieimport, samt BiblePanels egna två
overlay-kort). Plus kapitel-popoverns `×`-tecken i `Editor.tsx`, som
redan var ikonbaserat men inkonsekvent.

~24 filer, ~26 ersatta knappar. Lämnade medvetet orört: fristående
footer-"Close"/"Cancel"-knappar ihop med en primär knapp (Fråga om
passage, Sök/ersätt, Prompt-inspektören, kapitel-banderollernas
inline-stäng, illustrera-dialogens footer) och bild-lightboxens egen
`illustration-lightbox-close` (en halvgenomskinlig pill ovanpå
godtyckliga bilder — en annan kontrast-situation, inte samma mönster
som en textdialogs rubrikrad).

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Renderade Inställningar-dialogen på
riktigt i headless browser och bekräftade visuellt att ikonen visas
uppe till höger i rubrikraden.

v1.0.206 → v1.0.207.

**Ändringslogg v1.0.207 → v1.0.208 (2026-10-28): stängningsikonen
hängde för lågt.** Mats skickade två skärmdumpar — ikonen satt
märkbart under det faktiska hörnet, med en pil som pekade på var den
borde vara istället. "Ikonen ska ligga högst upp i hörnet."

**Grundorsak:** rubrikraderna `CloseIconButton` sitter i använder
`align-items: baseline` (`.bible-card-head`,
`.bible-card-head-actions` — Story Bible-korten) eller `center`
(`.dialog-head`, `.stats-card-head` — Core-dialogen, Inställningar
m.fl.). Båda är fel för en ikon-only-knapp bredvid vanlig text:
baseline försöker linjera mot text som inte finns i en ikonknapp,
och center centrerar knappen mot hela radens höjd — för Core-
dialogens tre-raders rubrikblock (eyebrow+titel+undertext) landar
"centrum" en bra bit ner, inte vid toppen.

**Fix:** en rad, `align-self: flex-start` på `.close-icon-button` —
åsidosätter föräldraradens `align-items` oavsett vilket värde den
har (det är precis vad `align-self` är till för), så samma fix
gäller alla ~24 ställen utan att behöva särskiljas per rubrikmönster.

**Verifiering:** mätte faktiskt avståndet i headless browser igen
(samma lärdom som v1.0.206 - bygg-grönt bevisar inget om CSS-
specificitet eller alignment) på Core-dialogen: 18.6px från kortets
topp, vilket är exakt kortets egen top-padding (`1.1rem`) och inget
mer — ikonen ligger nu precis vid rubrikens egen topp, inte längre
ner. `align-self` åsidosätter `align-items` oavsett värde per CSS-
specifikationen, så samma mekanism gäller garanterat även de
baseline-justerade Story Bible-korten utan att behöva mäta varje
enskilt ställe för sig. `tsc --noEmit` rent, hela testsviten (1240
test) grön, `npm run build` rent.

v1.0.207 → v1.0.208.

**Ändringslogg v1.0.208 → v1.0.209 (2026-10-28): kapitelrubriken
centrerad.** Mats skickade en skärmdump av kapitelrubriken i
editorn ("Chapter 1 - A new beginning") och bad att den ligger
centrerad.

`.chapter-title` är en `<input>`, ingen `<h1>` — texten var
vänsterjusterad (webbläsarens standard) och fick dessutom
`padding-left: 0` från den befintliga regeln, som tidigare flushade
texten mot vänsterkanten. Lade till `text-align: center` och tog
bort `padding-left: 0`-overridet så fältet återgår till den delade
input-regelns symmetriska `0.7rem`-padding på båda sidor — annars
hade centrerad text landat synligt skev (noll padding vänster, 0.7rem
höger).

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Fyllde i ett kapitel i en headless
browser och läste `getComputedStyle`: `textAlign: "center"`,
`paddingLeft`/`paddingRight` båda `11.2px` (0.7rem) — symmetriskt,
inte bara "ser centrerat ut".

v1.0.208 → v1.0.209.

**Ändringslogg v1.0.209 → v1.0.210 (2026-10-28): stängningsikonens
färg.** Mats: "Visst kan du ändra färgen på Close ikonen som är
SVG?" — frågade vilken färg, svar: "Samma grå som i scrollisten
(alltså olika grå beroende på ljust eller mörkt tema)", med två
tätt beskurna skärmdumpar av scrollistens tumme.

Scrollisten är inte stylad i appens CSS alls (ingen
`::-webkit-scrollbar`-regel existerar) — den är webbläsarens/
webviewens egen native-rendering, inget CSS-värde att referera
direkt. Läste av de faktiska pixelfärgerna i Mats skärmdumpar med
Pillow istället för att gissa: mörkt tema `rgb(99,99,99)` =
`#636363`, ljust tema `rgb(209,209,209)` = `#d1d1d1`.

Lade till en ny tematoken `--scrollbar-gray` (bara för det här
syftet, inte en del av den vanliga färgpaletten) i både `:root` och
`[data-theme="light"]`, satte `.close-icon-button { color:
var(--scrollbar-gray); }` istället för `var(--sage)`.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Växlade mellan båda temana i headless
browser och läste `getComputedStyle().color`: `rgb(99, 99, 99)`
respektive `rgb(209, 209, 209)` — identiskt med de uppmätta
pixelvärdena från Mats egna skärmdumpar, inte bara en ungefärlig
gråton.

v1.0.209 → v1.0.210.

**Ändringslogg v1.0.210 → v1.0.211 (2026-10-29): FILE/TOOLS-menyerna
orsakade en horisontell scrollist.** Mats skickade en skärmdump:
"Jag noterar att de drop-down menyer som man får när man klickar på
File och Tools ligger så nära högerkanten att man får en scrollist
för fönstret."

**Grundorsak:** `.app-top-menu-panel` (den delade `TopMenu`-
komponentens meny-CSS, används av File/Tools/Settings/Find-Replace,
språkväljaren och temaväxlaren — alla sex sitter i den högerjusterade
delen av topplisten) var ankrad med `left: 0` relativt sin egen
trigger-knapp och växte sedan åt höger (`width: max(14rem, min(20rem,
60vw))`). För en trigger nära fönstrets högerkant skjuter panelen då
ut förbi kanten, vilket tvingar fram webbläsarens/webviewens
horisontella scrollist för hela appen — inte bara menyn, hela
fönstret fick en scrollist i botten.

**Fix:** en rad, `left: 0` → `right: 0` — panelen ankras nu vid
sin triggers högerkant och växer åt vänster istället, in i utrymme
som faktiskt finns. Gäller alla sex menyer samtidigt eftersom de
delar samma CSS-regel; ingen skillnad mellan dem att särskilja.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Öppnade både FILE- och TOOLS-menyn i en
headless browser och läste `document.documentElement.scrollWidth >
clientWidth` före och efter — `false` i båda fallen, ingen
horisontell overflow kvar.

v1.0.210 → v1.0.211.

**Ändringslogg v1.0.211 → v1.0.212 (2026-10-29): ny inställning —
pappersfärg för editorytan.** Mats: "Jag skulle vilja lägga till en
grej på settings. Om man borde kunna välja vilken färg man vill ha
editorytan, alltså själva 'pappret'. Mörkt tema kan vara bra men det
är lite jobbigt att skriva och läsa ljusa texter på mörk bakgrund, så
man borde kunna ändra."

**Scope, klargjort via två frågor till Mats innan implementation:**
1. Hur fri ska färgväljaren vara? → "Några färdiga färger att välja
   mellan (Rekommenderat)" — alltså fasta förinställningar, inte en
   fri färgväljare. Varje förinställning har en förvald, läsbar
   textfärg inbakad; ingen risk för att användaren råkar skapa en
   oläsbar kombination.
2. Ska pappersfärgen gälla hela appen eller per manus? → "Hela appen,
   ett val för dig (Rekommenderat)" — samma mönster som det befintliga
   mörkt/ljust-temat (`theme.ts`): ett globalt val sparat i
   `localStorage`, INTE ett fält på `Book` (till skillnad från det
   redan existerande `editor_background`-fältet, som bara styr en
   dekorativ textur runt manuskriptkortet, aldrig själva pappret/
   texten).

**Implementation:**
- Ny fil `src/ui/paper.ts`, byggd efter exakt samma mönster som
  `theme.ts`: `type Paper = "default" | "warm" | "sepia" | "gray" |
  "dark"`, `PAPER_KEY = "storybook-ai.paper"`, `readPaper()`/
  `applyPaper()` som sätter/läser `localStorage` och togglar ett eget
  `[data-paper]`-attribut på `<html>` — medvetet ett SEPARAT attribut
  från `[data-theme]`, inte infogat i det, så att "mörkt tema, ljust
  papper" förblir en giltig kombination. Det är hela poängen med
  funktionen.
- `index.html`s inline pre-paint-skript (samma som redan läser tema
  och språk innan första målning, för att undvika en flimrande fel-
  tema-blixt) läser nu även `storybook-ai.paper` och sätter
  `dataset.paper` tidigt.
- `main.tsx` anropar `applyPaper(readPaper())` vid uppstart, bredvid
  den redan existerande `applyTheme(readTheme())`.
- Två nya CSS custom properties, `--editor-paper-bg`/
  `--editor-paper-text`, definierade en gång på `:root` (mörkt tema)
  som `var(--panel)`/`var(--text)` — alltså en referens, inte ett
  fast värde. Ingen motsvarande omdefinition behövdes under
  `[data-theme="light"]`: CSS-egna egenskaper med `var()`-referenser
  löses dynamiskt vid användningsplatsen mot den egenskap som faktiskt
  gäller där, inte vid definitionsplatsen, så `--editor-paper-bg`
  följer automatiskt vilket tema som faktiskt är aktivt för "Följ
  temat"-läget. Verifierat (inte antaget) via `getComputedStyle()` i
  headless browser i båda temana — se Verifiering nedan.
- Fyra nya regler, `[data-paper="warm"|"sepia"|"gray"|"dark"]`,
  skrivna på toppnivå (inte under `[data-theme="light"]` eller
  `:root`) så att varje förinställning ger exakt samma utseende
  oavsett vilket tema som råkar vara aktivt — en varm sida ska se varm
  ut oavsett om resten av appen är mörk eller ljus:
  - `warm`: bakgrund `#faf5ed`, text `#2a2218` (samma som ljusa temats
    egna panel/text)
  - `sepia`: bakgrund `#f0e4cf`, text `#4a3826`
  - `gray`: bakgrund `#e8e6e2`, text `#2b2b2b`
  - `dark`: bakgrund `#1c1814`, text `#f3eadc` (samma som mörka temats
    egna panel/text)
- Fyra konsumentregler i `styles.css` bytte från `var(--panel)`/
  `var(--text)` till de nya tokens: `.prose-body`s bakgrund,
  `.prose-fade-top`/`.prose-fade-bottom`s gradienter, och `.prose`s
  textfärg (båda reglerna, bas och `[data-theme="light"] .prose`) —
  där textfärgsregeln redan hade en fallback-kedja för manusets egna
  publiceringsfärg (`--prose-body-color-dark`/`-light`); den kedjan är
  oförändrad, bara dess fallback-värde bytte från `var(--text)` till
  `var(--editor-paper-text)`, så prioritetsordningen blir: manusets
  egen publiceringsfärg (om satt) → det nya globala pappersvalet →
  temats standardtextfärg.
- Ny `<select>` i `SettingsPanel.tsx`s GENERAL-sektion, bredvid
  "Revisions"-fältet. Använder lokal `useState(readPaper)` +
  `applyPaper()` vid ändring — INTE `onPatch`/`book.*`, eftersom detta
  är ett globalt val, inte ett manus-fält. Samma mönster som
  `ThemeToggle.tsx`, bara med fem alternativ istället för en knapp.
- Nya i18n-strängar (`paperLabel`, `paperLede`, `paperOptions.{default,
  warm,sepia,gray,dark}`) i alla tre språkfiler (en/sv/nb).

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Körde ett headless Playwright-skript som
växlade `[data-theme]` och `[data-paper]` i alla 10 kombinationer
(2 teman × 5 förinställningar) och läste `getComputedStyle()` för
`--editor-paper-bg`/`--editor-paper-text` varje gång: "Följ temat"
gav `#1c1814`/`#f3eadc` i mörkt tema och `#faf5ed`/`#2a2218` i ljust
tema (alltså identiskt med temats egna `--panel`/`--text`, som
avsett), medan de fyra namngivna förinställningarna gav exakt samma
par oavsett vilket tema som var aktivt — bekräftar att "mörkt tema,
varmt papper" fungerar som den egentliga poängen med funktionen,
inte bara i teorin.

v1.0.211 → v1.0.212.

**Ändringslogg v1.0.212 → v1.0.213 (2026-10-29): Manuscripts-menyn
hamnade utanför skärmen.** Mats skickade en skärmdump: "När jag
klickar på manuscripts så hamnar dialogrutan utanför skärmen" — text
avklippt i vänsterkant ("w manuscript…", "t" istället för "Delete").

**Grundorsak:** v1.0.211s fix för FILE/TOOLS-menyernas överflöd
("left: 0" → "right: 0" på den delade `.app-top-menu-panel`-klassen)
var för bred. Klassen används på två helt olika ställen:
`AppTopBar.tsx`s "Manuscripts"-meny, som sitter nära fönstrets
VÄNSTERKANT, och `Editor.tsx`s `TopMenu`-komponent (FILE/TOOLS), som
sitter nära HÖGERKANTEN. Att ankra båda vid höger löste FILE/TOOLS
men bröt Manuscripts — den växte åt vänster rakt ut genom fönstrets
vänsterkant istället.

**Fix:** `.app-top-menu-panel` fick tillbaka sitt ursprungliga
`left: 0` som standard (rätt för Manuscripts), och en ny
modifierarklass `.app-top-menu-panel--end` (`left: auto; right: 0`)
lades till separat, applicerad bara på `Editor.tsx`s `TopMenu`-
instanser (FILE/TOOLS). De två ställena delar fortfarande grund-
stilen (bredd, padding, bakgrund, skugga) men ankras nu var för sig
utifrån var de faktiskt sitter i topplisten, istället för att dela en
enda ankringsregel som bara kan vara rätt för ena sidan åt gången.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. I en headless browser (1280×800 viewport):
öppnade Manuscripts-menyn på startskärmen och mätte dess
bounding box — helt innanför fönstret (x: 196–517px av 1280px),
`scrollWidth > clientWidth` falskt. Skapade sedan ett testmanus för
att nå editorn och öppnade FILE-, TOOLS- och Manuscripts-menyerna där
igen — alla tre fick bounding boxes helt innanför fönstret
(0 ≤ left och right ≤ 1280 för alla tre), ingen horisontell overflow
i något fall.

v1.0.212 → v1.0.213.

**Ändringslogg v1.0.213 → v1.0.214 (2026-10-29): scrollisten matchar
pappersfärgen.** Mats, efter att ha sett den varma pappersfärgen i
mörkt tema: "Det blev bra med pappersfärgen. Men kanske ska
scrollisten och få bli ljus om pappret är det. Eller vad tycker du?"
— skickade en skärmdump som visade en mörk scrollist mot ett ljust,
varmt papper, vilket stack ut.

**Grundorsak:** scrollisten är native rendering, inte stylad i CSS
(ingen `::-webkit-scrollbar`-regel finns i projektet). Webviewen
avgör scrollistens ljusa/mörka utseende via CSS-egenskapen
`color-scheme`, som bara var satt på `:root`/`[data-theme="light"]`
— alltså styrd av APPENS tema, helt oberoende av vilken pappersfärg
som faktiskt visades i den scrollbara ytan.

**Fix:** `color-scheme` sätts nu även direkt på `.prose-body` (den
faktiska scrollbara rutan) per `[data-paper]`-värde: `light` för
warm/sepia/gray, `dark` för `dark`-förinställningen. `color-scheme`
är en ärvd egenskap, så den nya regeln vinner över det som annars
ärvs från `:root`/temat, specifikt för den här ena rutan. "Följ
temat" (ingen `[data-paper]` satt) får ingen egen regel och fortsätter
därför ärva appens egen `color-scheme` som förut - exakt rätt
eftersom den förinställningen redan är tänkt att se ut som temat.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Körde hela flödet i en riktig headless
browser - inte bara DOM-attribut manipulerade för hand, utan de
faktiska UI-kontrollerna (temaväxlingsknappen, den nya pappers-
`<select>`en i Settings) - och läste `getComputedStyle(.prose-body)
.colorScheme` efter varje steg: mörkt tema + "Följ temat" gav `dark`,
en riktig klick på temaväxlaren gav `light` (följer alltså fortfarande
temat korrekt), och att därefter välja "Dark"-förinställningen i
Settings medan appens tema fortfarande var ljust gav `dark` igen -
bekräftar att pappersfärgens egen scrollist-färg nu är oberoende av
appens tema, precis som Mats efterfrågade. Tog också en skärmdump av
ett riktigt kapitel med varmt papper i mörkt tema för att se
pappersytan renderas korrekt i sitt sammanhang.

v1.0.213 → v1.0.214.

**Ändringslogg v1.0.214 → v1.0.215 (2026-10-29): Maximize flyttad till
kapitelnamnets panel, som ikon.** Mats: "Jag vill flytta Maximize till
panelen där kapitelnamnet står, längst till höger. Jag har två svg
filer som du kan använda istället för texterna Mazximize och
Restore" — skickade två SVG-filer (en rundad kvadrat med utåtpekande
pil för Maximize, två överlappande rektanglar för Restore), båda med
fast fyllnadsfärg.

**Implementation:**
- `MaximizeButton` (Editor.tsx, delad av Chapter/Synopsis/Brainstorm/
  Board-vyerna) renderar nu `<MaximizeIcon />`/`<RestoreIcon />`
  istället för `m.editor.maximize`/`m.editor.restore`-texten. Båda
  SVG:erna konverterade från Mats fasta hex-färger (`#212121`/
  `#1C274C`) till `fill="currentColor"`, samma mönster som
  `CloseIconButton` - följer knappens egen textfärg (och ärver
  hover-färgen) istället för att vara en fast färg som skulle bli
  osynlig eller fel i något av temana. Maximize-ikonens egen
  `opacity="0.5"`-bakgrundscirkel behölls som den var i originalet -
  ger samma två-nivåers "badge bakom pil"-effekt, bara i knappens
  egen nyans istället för fast marinblått.
- Flyttad bara för den faktiska kapitelredigeringsvyn (den enda med
  ett redigerbart kapitelnamn - Mats egen formulering, "panelen där
  kapitelnamnet står"): togs bort från `.manuscript-foot`s
  åtgärdsrad längst ner och lades istället i en ny `.chapter-head-row`
  bredvid `<input className="chapter-title">`, längst till höger i
  kapitelnamnpanelen. Synopsis/Brainstorm/Board behöll sin Maximize-
  knapp på sin gamla plats i respektive åtgärdsrad (Mats bad bara om
  den ena panelen) - men den delade komponenten gör att alla fyra nu
  visar ikonen istället för text.
- Ny CSS `.chapter-head-row` (flex-rad) + `.chapter-title { flex: 1 }`
  inom den raden - kapitelnamnets textfält tar upp återstående bredd
  istället för hela panelens bredd, vilket gör att dess egen
  centrerade text (från v1.0.206-ish centreringsfixen) hamnar en
  aning vänster om panelens sanna mittpunkt. En medveten avvägning:
  knappen sitter nu vid den faktiska högerkanten Mats bad om.
- Tog bort den gamla `.actions button.maximize-btn`-regeln (textknapp-
  stil, inte längre använd) och lade till en liten `.maximize-icon-
  button svg`-regel (1.25rem) - större än standardikonknappens
  0.95rem eftersom den nu står bredvid en 1.7rem-rubrik, inte i en
  tät åtgärdsrad med andra knappar.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Skapade ett testmanus i headless browser
och öppnade Kapitel 1 - mätte knappens bounding box mot `.chapter-
head-inner`s egen: knappens högerkant (627px) landade exakt på
panelens högerkant (627px), alltså verkligen "längst till höger".
Klickade knappen och läste `aria-label` efteråt ("Restore" istället
för "Maximize") och tog en skärmdump av både normalt och maximerat
läge - ikonen syns tydligt i båda, rubriken förblir synlig och
centrerad i maximerat läge, ingen dubblett kvar i den gamla
fotknappraden.

v1.0.214 → v1.0.215.

**Ändringslogg v1.0.215 → v1.0.216 (2026-10-29): Linux-stöd för
skrivbordsappen, inklusive Codex-parkoppling.** Mats undrade vad som
krävs för att erbjuda Write (och syskonapparna) på Linux/Mac. Svarade
med en kartläggning: själva kaampi Codex-tjänsten var redan
plattformsoberoende i sin kod (bara paketerings-/CI-lagret saknade
Linux), men Write hade två egna spärrar — `core_bridge.rs`s
`#[cfg(target_os = "windows")]` runt all Codex-parkoppling, och
`tauri.conf.json`s `bundle.targets` som bara listade `nsis`.

**Steg 1, i kaampi/Codex-repot (separat från den här ändringsloggen,
se det repots egen historik):** ett nytt CI-jobb på `ubuntu-latest`
som bygger och smoke-testar `storycore-service` för Linux, samt
`installer-linux/install.sh` - en `systemd --user`-tjänst som Linux-
motsvarighet till Windows Startup-genvägen. Byggde och körde SEA-
binären lokalt i den här sandlådan (Linux) innan något skrevs till
CI, för att vara säker på att det fungerar, inte bara borde.

**Steg 2, här i Write:**
- `src-tauri/Cargo.toml`: ny `[target.'cfg(target_os = "linux")'.dependencies]`-
  sektion, `keyring` med `linux-native`/`sync-secret-service`/
  `vendored`-features (Secret Service via D-Bus - GNOME Keyring,
  KWallet, etc.) - samma crate som redan användes för Windows
  Credential Manager, bara en annan backend.
- `src-tauri/src/core_bridge.rs`: alla `#[cfg(target_os = "windows")]`
  runt `credential()`/`saved_token()`/`core_pair`/`core_auto_claim`
  utökade till `#[cfg(any(target_os = "windows", target_os =
  "linux"))]`. Ny `bootstrap_path()`-gren för Linux: `~/.storycore/
  core.db.bootstrap.json`, matchar exakt Codex-tjänstens egen
  `defaultDbPath()`-fallback för alla icke-Windows-plattformar
  (`homedir()/.storycore` i `server.mjs`) - samma sökväg som redan
  verifierades fungera i kartläggningssamtalet.
- `src-tauri/tauri.conf.json`: `bundle.targets` utökad från `["nsis"]`
  till `["nsis", "deb", "appimage"]` - Tauris bundlare hoppar
  automatiskt över mål som inte gäller den aktuella plattformen, så
  samma konfigfil fungerar oförändrad på både `windows-latest` och
  `ubuntu-latest` i CI.
- `.github/workflows/desktop-build.yml`: nytt `build-linux`-jobb,
  speglar `build-windows` men installerar Linux-byggberoenden
  (`libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, `libayatana-
  appindicator3-dev`, `librsvg2-dev`, `libsoup-3.0-dev`, `patchelf` -
  samma lista som verifierades fungera lokalt, inte gissad från
  dokumentationen) och publicerar `.deb`/`.AppImage` till SAMMA
  `v<version>`-release som Windows-bygget, istället för att
  fragmentera i separata per-OS-releaser.
- Copy-strängen i `CoreConnectionDialog.tsx` ("Connecting to kaampi
  Codex is only possible in the Windows desktop app...") rättad i
  alla tre språk - sa uttryckligen "Windows", vilket inte längre
  stämmer eftersom `desktop = isTauri()` redan var plattforms-
  oberoende även innan den här ändringen; bara ordalydelsen var fel.
- README.md och running.md uppdaterade: "Windows desktop app" blev
  "Desktop app", med egna rader för `.deb`/`.AppImage`, och en notis
  om att macOS fortfarande saknar bygge.

**Verifiering, med riktig kompilering - inte bara `tsc`/vitest:**
installerade Tauris Linux-byggberoenden i den här sandlådan
(`libgtk-3-dev` m.fl., tillgängliga via `apt-get` efter `apt-get
update` - paketlistan var initialt för gammal) och körde `cargo
check`/`cargo test` på riktigt: alla 7 Rust-tester gröna, inklusive
`keyring`-cratets Linux-backend som faktiskt löstes och byggdes
(`dbus-secret-service`, `linux-keyutils`). Körde sedan en FULLSTÄNDIG
`npx tauri build --target x86_64-unknown-linux-gnu`: byggde både
`.deb` (17.7 MB) och `.AppImage` (92.2 MB) utan fel. `dpkg-deb
--info` på `.deb`-filen bekräftade att `libwebkit2gtk-4.1-0`/
`libgtk-3-0` autodetekterades korrekt som beroenden (medvetet INTE
override:ade `bundle.linux.deb.depends` manuellt - skulle ha
riskerat att tysta Tauris egen, korrekta auto-detektion). `ldd` på
den byggda binären bekräftade att alla dynamiska bibliotek löstes
(`not found` gav tom output). Körde sedan den faktiska binären under
`xvfb-run` (virtuell X-server) i tio sekunder - startade, renderade,
kraschade inte; enda utskriften var en harmlös EGL/DRI3-varning
(väntat utan riktig GPU i en headless miljö). `tsc --noEmit` rent,
hela testsviten (1240 test) grön, `npm run build` rent.

**Kvarstår innan Write faktiskt är fullt Linux-redo i praktiken:**
Mats måste installera kaampi Codex på sin egen Linux-maskin (se det
repots `installer-linux/install.sh`) och faktiskt para ihop en
Write-installation mot den på riktig hårdvara - allt ovan är
verifierat i en sandlåda utan en riktig Secret Service-daemon igång,
så `credential()?.set_password(...)`-anropet i `core_pair`/
`core_auto_claim` har inte körts mot en faktisk GNOME
Keyring/KWallet än. macOS är fortfarande helt obyggt (ingen Apple
Keychain-feature i `keyring`-beroendet, ingen signerings-/
notariseringsuppsättning).

v1.0.215 → v1.0.216.

**Ändringslogg v1.0.216 → v1.0.217 (2026-10-29): macOS-stöd för
skrivbordsappen, inklusive Codex-parkoppling.** Mats: "Kör macOS-
stödet nu också" - direkt uppföljning på Linux-arbetet, samma kväll.

**Steg 1, i kaampi/Codex-repot (separat från den här ändringsloggen,
se det repots egen historik):** ett nytt CI-jobb på `macos-latest`
som bygger och smoke-testar `storycore-service` för macOS, samt
`installer-macos/install.sh` - en `launchd`-LaunchAgent som macOS-
motsvarighet till systemd-tjänsten på Linux. Kunde INTE byggas och
köras lokalt i den här sandlådan som Linux-bygget kunde (Node SEA
kopierar den aktuella plattformens egen `node`-binär som bas - en
riktig macOS-binär kräver en riktig Mac, inte bara en annan
`--target`-flagga). Upptäckte och fixade på vägen en namnkrock: både
Linux- och macOS-binären hette tidigare bara `storycore-service`
(ingen filändelse) och hade krockat i samma GitHub Release - bytte
till `storycore-service-linux`/`storycore-service-macos`.

**Steg 2, här i Write:**
- `src-tauri/Cargo.toml`: ny `[target.'cfg(target_os = "macos")'.dependencies]`-
  sektion, `keyring` med `apple-native`-feature (Keychain).
- `src-tauri/src/core_bridge.rs`: alla `#[cfg(any(target_os =
  "windows", target_os = "linux"))]` utökade med `target_os =
  "macos"`. `bootstrap_path()` för macOS delar Linux-grenen rakt av
  (`~/.storycore/core.db.bootstrap.json`) - Codex-tjänstens egen
  `defaultDbPath()`-check i `server.mjs` är ett vanligt `!== 'win32'`,
  inte Linux-specifikt, så samma sökväg var redan rätt för macOS
  utan någon ändring på Codex-sidan.
- `src-tauri/tauri.conf.json`: `bundle.targets` utökad med `app`/`dmg`.
  Byggde om Linux-bundeln efteråt i sandlådan för att bekräfta att de
  nya, på Linux irrelevanta målen verkligen hoppas över tyst av
  bundlaren (precis som dokumenterat) - samma två filer (.deb,
  .AppImage) som innan, ingen regression.
- `.github/workflows/desktop-build.yml`: nytt `build-macos`-jobb på
  `macos-latest`, bygger en universal binär (`aarch64-apple-darwin` +
  `x86_64-apple-darwin` via `--target universal-apple-darwin`) - en
  enda nedladdning som kör nativt på både Apple Silicon och Intel,
  samma "användaren ska inte behöva veta sin egen hårdvara"-princip
  som redan gäller Windows-installeraren (roadmap-ideas.md #35).
  Publicerar bara `.dmg` till releasen (en `.app` är i sig en mapp,
  inte en enskild fil en GitHub Release kan hålla som asset).
- Dokumentation (README, running.md, workflow-kommentarer) uppdaterad
  genomgående: macOS är unsigned OCH onotariserad, vilket är värre än
  Windows SmartScreen-varningen - Gatekeeper VÄGRAR öppna appen alls
  från en vanlig dubbelklickning, inte bara varnar. Dokumenterat
  work-around (högerklicka → Open en gång, eller `xattr -cr`) i
  running.md.

**Verifiering - samma gräns som gäller Windows redan:** kunde inte
kompilera macOS-koden på riktigt här (provade `cargo check --target
x86_64-apple-darwin` ändå, av nyfikenhet - floppade exakt som väntat
på `objc2-exception-helper`s Objective-C-kompilering, som kräver
Apples egen `cc`/SDK, inte bara en Rust-target). Det som GICK att
verifiera gjordes: `cargo check`/`cargo test` på den riktiga Linux-
koden efter cfg-utökningarna (alla 7 Rust-test fortsatt gröna, ingen
regression av att lägga till en tredje `target_os`-gren), en
fullständig ombyggnad av Linux Tauri-bundeln för att bekräfta att de
nya `app`/`dmg`-målen inte stör något på Linux, YAML-syntaxkontroll
av alla ändrade workflow-filer, och XML-validering av den genererade
launchd-plisten i Codex-repot. `tsc --noEmit` rent, hela testsviten
(1240 test) grön, `npm run build` rent. Den faktiska macOS-
verifieringen (bygget går igenom, appen startar, Gatekeeper-
beteendet stämmer, Keychain-parkoppling fungerar på riktigt) vilar
helt på `macos-latest`-runnern i GitHub Actions - samma tillitsnivå
det här projektet redan haft för Windows-bygget under hela sessionen,
eftersom sandlådan aldrig kunnat bygga det själv heller.

v1.0.216 → v1.0.217.

**Ändringslogg v1.0.217 → v1.0.218 (2026-10-29): kapitelbilden flyttad
in i själva editorn, scrollar med texten.** Mats: "de bilder man kan
lägga in för varje kapitel borde synas överst i editorn. Eller?" -
jag kollade koden: `ChapterStartImageBanner` fanns redan (ladda upp
en bild per kapitel, `chapter.startImage`-fältet), men levde gömd
inne i kapitlets inställningspopover (kugghjulet i kapitellistan),
aldrig synlig medan man faktiskt skriver. Föreslog två lägen
(diskret miniatyr vs. alltid synlig bred banner) - Mats: "Jag skulle
hellre lägga den i själva editorn och att den scrollar upp med
texten."

**Grundfråga:** `.chapter-head` (rubriken, Maximize-ikonen) ligger
UTANFÖR den scrollande ytan - den stannar kvar medan prosan rullar
under. Mats ville ha bilden som en del av den scrollande ytan
istället, så den rullar bort tillsammans med texten när man läser/
skriver vidare nedåt - inte som ett fast element i huvudet.

**Implementation:**
- `ProseCanvas.tsx` fick en ny `chapterImage?: React.ReactNode`-prop,
  renderad direkt innanför `.prose-scroll` (den faktiska scroll-
  behållaren), före den redan existerande `aside`-proppen (använd för
  ContinuityWarning/PlaceholdersPanel/DarlingsPanel) - samma mönster,
  bara en ny plats i samma lista av saker som scrollar med texten.
- `Editor.tsx`: `chapterImage={<ChapterStartImageBanner .../>}`
  kopplad till kapitlets egna `ProseCanvas`-anrop, borttagen från
  `ChapterSettingsSection` (ingen dubblett-kontroll på två ställen).
  Städade bort de nu oanvända `startImage`/`onSetStartImage`/
  `onRemoveStartImage`-propparna från `ChapterSettingsSection` och
  den nu oanvända `EntityPicture`-importen.
- Ingen CSS-ändring behövdes - `.chapter-start-image` var redan byggd
  som en bred banner (max-bredd 54rem, matchar prosans egen 60rem-
  kolumn minus padding) snarare än en smal popover-widget, så den
  såg redan rätt ut direkt i den nya platsen.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. I en headless browser: skapade ett
testmanus, laddade upp en genererad testbild via filinputen - som nu
bekräftat sitter inne i `.prose-scroll`, inte i inställnings-
popovern (0 träffar där efteråt) - och mätte bildens `boundingBox()`
före och efter att manuellt sätta `scrollTop = 400` på scroll-
behållaren: bildens y-position gick från synlig till -260px, alltså
bevisat förflyttad utanför synfältet av scrollningen, inte bara ett
fast element som råkar se likadant ut. Skärmdump bekräftade också det
visuella: bilden (med "Replace image"/"Remove image"-knapparna)
sitter nu direkt under kapitelrubriken "Chapter 1", ovanför
brödtexten.

v1.0.217 → v1.0.218.

**Ändringslogg v1.0.218 → v1.0.219 (2026-10-29): Codex-status synlig
på startsidan.** Mats, efter installation på Linux: "det är inte
glasklart när jag startar Write hur jag connectar till Codex?" Kollade
koden: knappen som öppnar parkopplingsdialogen var bokstavligen
hårdkodad till texten "Core" (inte "Codex", inte översatt), och
visades bara uppe till höger EFTER att ett manus redan öppnats —
aldrig på startskärmen. Föreslog en lösning, Mats: "På startsidan
borde det finnas en information 'Codex connected'/'Connect to Codex
manually'. Minst lika viktigt som de andra 'korten'."

**Implementation:**
- Ny `CodexHomeCard.tsx`: en React-komponent som själv hämtar
  anslutningsstatus (`coreAutoClaim()` + `coreConnection()` från
  `CoreDesktopTransport.ts` — redan app-breda, inte manus-bundna,
  så ingen bok behövs för det här) och renderar tre lägen:
  - **Ansluten + nåbar:** grön statustext ("Connected — backups and
    sharing...").
  - **Parkopplad men inte nåbar just nu:** neutral statustext
    ("Paired, but not reachable...").
  - **Inte parkopplad:** samma inline-formulär-mönster som "Start a
    new manuscript"-kortet redan använder (textfält + en
    "Connect →"-knapp direkt i kortet) - inte en separat dialog.
- `Home.tsx`: kortet infogat i samma `.home-start-cards`-rutnät som
  de fyra befintliga korten (New manuscript/Import backup/Import
  manuscript/Guide), gated på `isDesktopApp()` - syns bara i
  skrivbordsappen, aldrig i webbläsarläge (där parkoppling ändå inte
  går att göra).
- Ny CSS för statustexten (`--sage` för "ansluten", `--text-dim` för
  "offline") - behövde höja selektor-specificiteten
  (`.home-start-card-copy > .home-codex-status.is-connected`) för att
  faktiskt slå den redan existerande `.home-start-card-copy > span`-
  regeln, samma typ av specificitetsfälla som redan dokumenterad
  tidigare i den här loggen (v1.0.206) - löst genom högre
  specificitet, inte `!important`.
- Nya i18n-strängar (`codexCard`, `codexConnected`, `codexOffline`,
  `codexCardLede`, `codexTokenPlaceholder`, `codexConnectAction`,
  `codexConnecting`) i alla tre språk.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Den riktiga `invoke()`-bryggan finns
förstås inte i en spoofad webbläsarmiljö (samma "Cannot read
properties of undefined (reading 'invoke')"-begränsning som synts
genomgående i den här sessionen) - mockade därför
`window.__TAURI_INTERNALS__.invoke` direkt i ett headless Playwright-
skript för att faktiskt kunna rendera och skärmdumpa alla tre lägena
(ansluten/offline/inte ansluten) istället för att bara anta att koden
"borde" se rätt ut. Alla tre skärmdumpar bekräftade rätt layout,
samma kortstorlek och mönster som de fyra andra korten, och att
formuläret bara visas i "inte ansluten"-läget.

v1.0.218 → v1.0.219.


**Ändringslogg v1.0.219 → v1.0.220 (2026-10-29): Settings delat i
"Settings" (app-brett) och "Manuscript settings" (per manus).** Lång
diskussion med Mats om startsidans trösklar ledde in på en sidospår:
Settings låg bara inne i ett öppet manus, men innehöll flera fält som
redan var app-breda (localStorage, inte `book.*`) — motor/modell,
baseUrl, context window, writing primer, revisions-gräns, pappersfärg.
Mats drog en tydlig parallell till Affinity: "Even om det är ett mycket
större system så har man Settings och sedan Document settings. [...]
SÅ vad sägs om Setting för appen i stort som ett huvudval och sedan
Manuscript settings när man är inne i editorn och det menyvalet kan
ligga där nuvarande Settings." Sista instruktionen: "Kör igång med det
och låt settings ligga som en egen topp meny grupperat med de andra
valen på vänster sida."

**Vad som faktiskt var app-brett (bekräftat i kod, inte bara via UI):**
`model`/`reviewModel`/`translateModel`/`engine`/`baseUrl` och
`contextWindow` (`src/llm/contextWindow.ts`), `historyLimit`
(`src/core/proseHistory.ts`) och `writingPrimer`
(`src/core/writingPrimer.ts`, nyckling på modellnamn) — alla
localStorage-baserade i `BookStore.tsx`, ingen av dem en `book.*`-fält.
Pappersfärgen (`src/ui/paper.ts`) likaså, fast den av bekvämlighet låg
i Settings GENERAL-sektion sedan tidigare — samma felplacering som nu
rättades till.

**Implementation:**
- Ny `AppSettingsDialog.tsx`: innehåller allt ovanstående plus hela
  `ConnectionPresetList`-funktionen (flyttad, inte kopierad, från
  `SettingsPanel.tsx`) och `ModelSelect` ×3 (Writing/Review/Translate,
  importerad från `SettingsPanel.tsx` som fortfarande exporterar den).
  Återanvänder `.settings-card`-klassens befintliga CSS (fältbredder,
  textarea-storlekar) men lägger till en egen modifier-klass
  `.app-settings-card` som smalnar av kortet till en kolumn
  (`min(42rem, 100%)` istället för de två kolumnernas `78rem`) — ingen
  ny CSS-struktur behövdes, bara `grid-template-columns: 1fr` under
  den klassen.
- `SettingsPanel.tsx` krympt rejält: tog bort hela AI-anslutnings-
  sektionen (`ConnectionPresetList`, modellväljarna, context window,
  writing primer), historyLimit-fältet och pappersfärgsfältet från
  GENERAL. Kvar: Prose language/Reader, POV/Tense/Viewpoint/Voice
  (GENERAL), hela Typography-sektionen, Illustrations, Proofread
  thoroughness + "Filter lore by relevance" (nu egen "Proofreading"-
  sektion, tidigare ihopblandad med AI-sektionen), och Polish — allt
  fortfarande `book.*`-fält eller bok-specifik craft. Rubriken bytte
  text från "Settings" till "Manuscript settings" (samma i18n-nyckel
  `settings`, bara ändrat värde — inget behövde döpas om i koden).
- `Home.tsx`: hela `<section className="home-connect">`-blocket
  ("Connect a local AI", kollapsande motor/baseUrl/modell-fält) borttaget
  tillsammans med sitt öppna/stängt-state och GPU-förslags-logiken —
  allt det flyttade in i `AppSettingsDialog.tsx` istället. Home.tsx
  tappade därmed sitt beroende av `ModelSelect`,
  `DEFAULT_OPENAI_COMPATIBLE_BASE_URL`/`DEFAULT_OLLAMA_BASE_URL` och
  flera `useBookStore()`-fält den inte längre behöver.
- `AppTopBar.tsx`: ny "Settings"-knapp i den vänsterjusterade
  menygruppen (efter "Guide", före den högerjusterade
  språk/tema-gruppen — exakt Mats instruktion), eget `settingsOpen`-
  state, villkorlig `<AppSettingsDialog>` som läser samtliga props
  direkt från det redan tillgängliga `useBookStore()`-objektet (kräver
  inget öppet manus).
- `Editor.tsx`: `<SettingsPanel>`-anropet trimmat till bara de props
  panelen fortfarande tar emot; flera nu oanvända store-fält
  (`models`/`model`/`writingPrimer`/`reviewModel`/`translateModel`)
  togs bort ur destruktureringen (`ollamaError` behölls — används
  fortfarande för felbannern).
- Nya i18n-nycklar i alla tre språk: `appSettings` ("Settings"),
  `appSettingsLede`, `editorSettingsHeading` ("Editor"),
  `proofreadHeading` ("Proofreading"). `settings`-nyckelns värde
  ändrat till "Manuscript settings" (sv: "Manusinställningar", nb:
  "Manuskriptinnstillinger").

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test,
94 testfiler) grön, `npm run build` rent. Visuell verifiering med
headless Playwright mot en riktig `vite preview`-build (inte bara
dev-server): bekräftade att `.home-connect` inte längre finns på
startsidan, att startsidans korträkning är tillbaka till fyra, att
"Settings"-knappen finns i topmenyn och öppnar `.app-settings-card`
med rubriken "Settings" samt AI-sektionen (motor/modell/context
window/primer) och en ny "Editor"-sektion (Revisions + pappersfärg)
vid skroll; att "Manuscript settings"-knappen inne i ett öppnat
manus öppnar den krympta `.settings-card` (utan AI-sektionen) med
rubriken "Manuscript settings" och intakta General/Typography/
Illustrations/Proofreading/Polish-sektioner.

v1.0.219 → v1.0.220.


**Ändringslogg v1.0.220 → v1.0.221 (2026-10-29): App Settings i två
kolumner, samma storlek som Manuscript settings.** Mats, direkt efter
v1.0.220 landat: "vi kan göra Settings rutan lika stor som Manuscript
Settings och ha två kolumner Sektionen Editor på höger sida." Den
smala enkolumns-varianten (`.app-settings-card`, `min(42rem, 100%)`)
tog bort `AI SETTINGS`-sektionen (motor/modell/context window/primer)
+ `EDITOR`-sektionen (revisions/pappersfärg) ovanpå varandra i en lång
scrollande kolumn - onödigt trångt jämfört med hur Manuscript settings
redan löser samma problem.

**Implementation:** Tog bort hela `.app-settings-card`-modifier-
klassen och dess smalnande CSS (`width: min(42rem, 100%)` +
`grid-template-columns: 1fr`) - dialogen återanvänder nu
`.settings-card` rakt av (samma `min(78rem, 100%)`-bredd,
`min(94vh, 70rem)`-höjd, samma tvåkolumns-grid som Manuscript
settings redan har). `AppSettingsDialog.tsx`: flyttade `EDITOR`-
sektionen (Revisions + Editor paper) till en andra
`.settings-card-column`, så "AI settings" står ensam i vänsterkolumnen
och "Editor" i högerkolumnen - istället för att båda sektionerna låg i
samma kolumn.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent, headless Playwright-skärmdump mot en
riktig `vite preview`-build bekräftade två `.settings-card-column`-
element och rätt visuell layout (AI settings vänster, Editor höger,
samma bredd/höjd som Manuscript settings).

v1.0.220 → v1.0.221.


**Ändringslogg v1.0.221 → v1.0.222 (2026-10-29): "Core"-knappen döpt
om till "Codex".** Mats: "Ska vi flytta on Codex inställningarna i
Settings? (Oavsett så byt namn från Core till Codex)". Kollade
`CoreConnectionDialog.tsx` i sin helhet: all text i själva dialogen
sa redan "kaampi Codex" genomgående (titel, status, alla etiketter) -
det var bara triggerknappen i `AppTopBar.tsx` som fortfarande hade det
hårdkodade, oöversatta ordet "Core" kvar.

**Beslut om flytten:** Nej, dialogen flyttas inte till den app-breda
Settings. Till skillnad från motor/modell/context window (v1.0.220)
är allt i den här dialogen bokbundet i grunden - `bookId`/`currentBook`
skickas in som obligatoriska props, och innehållet (delning med andra
kaampi-appar, privata versioner/checkpoints, återställning) är data
om just DET öppna manuset, inte appen som helhet. Parkoppling
(pair/token) finns redan på två ställen av bekvämlighetsskäl - i
`CodexHomeCard` på startsidan (v1.0.219) och överst i den här dialogen
- ett tredje ställe i Settings skulle bara vara ännu en kopia, inte en
konsolidering.

**Implementation:** Ny i18n-nyckel `codexNav` ("Codex" i alla tre
språk) i `AppTopBar.tsx`, ersätter den hårdkodade strängen "Core".

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent.

v1.0.221 → v1.0.222.


**Ändringslogg v1.0.222 → v1.0.223 (2026-10-29): app-switcher i
toppmenyn, hämtad från kaampi Explore.** Mats skickade en skärmdump av
Explores toppmeny: "Explore har en koppling överst i toppmenyn till
andra appar som jag tänker att vi kan lägga in i Writer också."

**Research i kaampi/Explore (klonad till sandlådan, `kaampi/Explore`
tillagt i sessionen):** `src/ui/home/AppSwitcher.tsx` +
`src/integrations/localApps.ts` + `server/localApps.ts`. Explore
löser korsursprungsproblemet (kolla om kaampi Write/Comic faktiskt kör
på en given localhost-port) med en egen Vite-serverplugin som gör
anropet server-side - webbläsaren pratar bara med Explores egen
origin, aldrig direkt med Write/Comics port. Write har ingen egen
backend (statisk SPA + Tauri-skal), så den trickseln går inte att
kopiera rakt av.

**Vad som faktiskt går att göra i Write:** redan löst en gång för
lokala AI-servrar - `tauriFetch.ts`s `localServerFetch()` dirigerar
om anropet genom Tauris HTTP-plugin (Rust, inte webview) i
skrivbordsappen, vilket kringgår CORS helt. Samma teknik återanvänd
här: `checkCompanionApp()` i nya `src/ui/companionApps.ts` försöker
bara en riktig kontroll i skrivbordsappen - webbappen har ingen
backend att gå via (precis samma begränsning Explores README redan
dokumenterar för sitt eget "hosted/static preview"-läge: "no local
status backend"), så där stannar statusen på "unknown" och adressen
får öppnas manuellt. Identitetskontrollen matchar varje app-plattas
faktiska `<title>`-tagg, normaliserad till [a-z0-9] - samma fallback
Explores egen `server/localApps.ts` redan använder för de två
syskon-apparna som ännu saknar en delad
`/.well-known/storycore-app.json`-identitetsfil (ingen av de tre
apparna serverar en sådan idag).

**Implementation:**
- `src/ui/companionApps.ts`: adresser (Explore `:5173`, Comic
  `:5176`), `safeAppAddress`/`isLoopbackAddress` (kopierade valideringar
  från Explores egen modul), `checkCompanionApp`, läs/spara adress i
  localStorage (`storybook-ai.companion-app-<id>`), `openCompanionAddress`
  som växlar mellan `openExternalUrl` (skrivbordsappen, samma Rust-
  öppnare som redan används för Ollama-nedladdning/ändringslogg) och
  `window.open` (webbappen).
- `src/ui/AppSwitcher.tsx`: ny komponent, visuellt en rad med "kaampi
  Write" (icke-interaktiv, markerad som aktuell app - samma mönster
  som Explores egen namn-knapp när den visar sin egen startsida), samt
  Explore/Comic som antingen en klickbar länk med statuspunkt (hittad,
  körs) eller en vanlig knapp som öppnar en liten dialog (adressfält,
  installationslänk, Försök igen/Spara adress/Öppna appen) - exakt
  Explores egen modal, fast byggd med Writes egna dialog-klasser
  (`edit-overlay`/`edit-card`) och alla tre språken istället för bara
  engelska.
- `AppTopBar.tsx`: `<AppSwitcher />` placerad mellan vänstergruppen
  (Manuscripts/Guide/Settings) och `.app-top-chrome` - `margin: 0
  auto` på `.app-switcher` delar flex-radens lediga utrymme med
  `.app-top-chrome`s egen `margin-left: auto`, vilket landar switchern
  ungefär mitt i raden, samma visuella placering som skärmdumpen av
  Explore.
- Nya i18n-nycklar (`companionApps.*`) i alla tre språk.

**Hittat i förbifarten, inte åtgärdat här:** Explores egen
title-matchning för Write (`server/localApps.ts`s `TITLE`-tabell)
förväntar sig fortfarande `"storybookai"` - en kvarleva från appens
gamla namn innan den döptes om till kaampi Write. Writes faktiska
`<title>` är `"kaampi Write"`, vilket normaliserar till
`"kaampiwrite"` - en missmatchning som gör att Explores egen
app-switcher troligen rapporterar Write som "wrong-app" även när
Write faktiskt kör. Det är en bugg i kaampi/Explore, inte i Write;
flaggat till Mats separat istället för att fixas i den här commiten.

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent. Headless Playwright mot en riktig `vite
preview`-build bekräftade layouten (tre poster i switchern, "kaampi
Write" markerad som aktuell) och webbläget (ingen backend att pröva
mot - dialogen visar korrekt "Automatic checks are only available in
the desktop app", förifylld standardadress, installationslänk,
Öppna appen-knapp). Det skrivbordsspecifika liveflödet (en riktig
`tauriFetch`-sökning mot en faktiskt körande Explore/Comic-instans)
går inte att testa i den här sandlådan - samma ärlighetsnivå som
redan hållits för macOS-bygget: byggt och typchecka rent, men den
riktiga nätverksvägen vilar på verklig användning.

v1.0.222 → v1.0.223.


**Ändringslogg v1.0.223 → v1.0.224 (2026-10-29): riktiga loggor i
app-switchern.** Mats, efter att v1.0.223 landat: "har du lagt in
loggorna också? Säg inte ut så på skärmbilderna?" - switchern visade
bara ren text, inga logotyper, till skillnad från skärmdumpen han
ursprungligen delade av Explores egen switcher. Skickade sedan fyra
officiella SVG-logotyper ("kaampi Write/Explore/Comic/Codex",
enhetlig stil - svart "kaampi" + rosa kvadrat + app-namnet i en egen
accentfärg per app).

**Fynd:** den skickade Write-logotypen var byte-identisk med Writes
redan befintliga `public/logo.svg` (ljust tema). Write har redan ett
ljust/mörkt par (`logo.svg`/`logo-dark.svg`) där den enda skillnaden
är en mekanisk färgswitch: "kaampi"+kvadrat går från nästan svart
(35,31,32) till nästan vitt (240,240,242), och själva app-namnets
accentfärg ljusas upp med en konstant offset per kanal (uppmätt:
+65/+64/+62, dvs grovt "+64"). Explore/Comic/Codex-logotyperna Mats
skickade hade bara den ljusa varianten - genererade mörka varianter
med exakt samma transform (Python-skript, `fill:rgb(35,31,32)` →
`rgb(240,240,242)`, accentfärgen +64 per kanal och klamrad vid 255),
sparade i `public/brand/companions/{explore,comic,codex}.svg` +
`-dark.svg`. Explore: (132,103,106)→(196,167,170). Comic:
(103,132,106)→(167,196,170). Codex: (189,147,0)→(253,211,64) -
sparad för framtida bruk, inte kopplad till något i den här ändringen.
Verifierade resultatet visuellt (ljust+mörkt bakgrund, headless
Playwright-skärmdump av alla fyra logotyper i båda varianterna) innan
de kopplades in - färgerna höll ihop visuellt med Writes egen
redan godkända mörka logotyp.

**Implementation:** `companionApps.ts`s `COMPANION_APPS`-post fick
`logoLight`/`logoDark`-sökvägar. Ny `CompanionLogo`-komponent i
`AppSwitcher.tsx` återanvänder AppTopBar.tsx:s egna
`.app-top-logo-light`/`.app-top-logo-dark`-klasser (ren visa/dölj per
`[data-theme]`, ingen storlek inbakad) för själva temaväxlingen, med
en egen `.app-switcher-brand`-klass bara för höjd/bredd i den
kompakta switcher-raden.

**Bugg hittad och fixad under verifieringen:** min första CSS-version
av `.app-switcher-brand` satte även `display: block` - det kolliderar
med `.app-top-logo-light`s `display: none` vid oavgjord specificitet
(båda är enkla klassväljare), och eftersom `.app-switcher-brand` låg
senare i stilmallen vann den, vilket visade BÅDA logotyperna
samtidigt (ljus+mörk övertonade varandra, syntes tydligt som
dubblerad/suddig text i den första skärmdumpen). Fixat genom att bara
sätta höjd/bredd i `.app-switcher-brand`, aldrig `display` - precis
den typ av specificitetsfälla som redan dokumenterats två gånger
tidigare i den här loggen (v1.0.206, v1.0.219).

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test)
grön, `npm run build` rent, headless Playwright-skärmdumpar av
toppmenyn i båda ljus- och mörkt-läge mot en riktig `vite
preview`-build bekräftade att buggen var borta och att alla tre
logotyper (Write/Explore/Comic) renderar rent i båda teman.

v1.0.223 → v1.0.224.


**Ändringslogg v1.0.224 → v1.0.225 (2026-10-29): pilot för
Sudowrite-stilig, pedagogisk Guide med riktiga skärmdumpar.** Mats
pekade på hur Sudowrite beskriver sin app: "mer som en riktig manual
med skärmdumpar... Kan vi åstadkomma nåt liknande men samma
pedagogiska (eller helst ännu mer pedagogisk) text och med
skärmdumpar. Snyggt uppdelat som de har?" med en länk till deras
dokumentation.

**Research:** hämtade Sudowrites dokumentationssida (WebFetch) för
att faktiskt se mönstret innan något byggdes, inte gissa: kategoriserad
sidomeny, en uppgift per artikel, kort intro följt av H2/H3-steg,
skärmdumpar direkt efter varje steg, märkta tips-rutor, citerade
exempel-prompter.

**Avstämning innan bygget:** frågade Mats två saker som avgör
omfånget - var dokumentationen ska bo (riktig hostad sajt vs.
markdown i repot vs. appens egen Guide/Handbook) och hur stort första
steget ska vara (pilot vs. allt på en gång). Svar: bygg ut appens
egen Guide/Handbook (`HandbookPanel.tsx` - redan nio kategorier, en
sektion per ämne, men hittills bara rubrik+en tät brödtextparagraf,
inga bilder), och börja med en pilot i en sektion innan resten görs om.

**Vald pilot:** "Write together with AI" (5.1, under kategorin
Writing) - samma typ av kärnfunktion som Sudowrites eget exempel
(deras "Write"-sida). Innehöll sedan tidigare en tät uppräkning av
Draft/Extend/Elaborate/Rewrite/Write a beat i en enda paragraf.

**Datamodell:** `HandbookPanel.tsx` fick en ny, valfri `HandbookStep`-
typ (`heading`, `body`, valfri `image: {src, alt}`), och
`handbookSections`-typen i `en.ts` fick två nya valfria fält (`steps?:
HandbookStep[]`, `tip?: string`) - alla andra sektioner opåverkade
eftersom fälten är valfria (`sv.ts`/`nb.ts` behöver inget ändras
förutom pilot-sektionen själv, tack vare strukturell typning mot
`Messages = typeof en`). `HandbookPanel.tsx`s renderare utökad: om en
sektion har `steps`, rendera varje steg som eget `<h4>` + stycke +
valfri bild; om sektionen har `tip`, rendera en sista tips-ruta.
Sektioner utan dessa fält renderas precis som innan.

**Riktiga skärmdumpar, inte fabricerade:** körde appens riktiga
dev-server i sandlådan, styrde den med headless Playwright (samma
teknik som använts genomgående i sessionen för att verifiera UI) -
skapade ett riktigt manus, skrev in ett exempelstycke prosa
("Nora pressed her back against the cold brick..."), och fångade tre
skärmdumpar av det faktiska gränssnittet: (1) ett tomt kapitel med
Draft-knappen, (2) en markering med högerklicksmenyn öppen
(Extend/Elaborate/Rewrite…), (3) ingen markering, högerklicksmenyn med
bara Write a beat…/Drop a placeholder…. Beskar bort den röda
Ollama-anslutningsbannern ur varje bild (inte representativt för en
lyckad anslutning) genom riktade element-/clip-skärmdumpar istället
för hela sidan. Sparade i `public/handbook/write-with-ai/`.

**Faktafel hittat och rättat under skrivandet:** första utkastet av
pilot-texten påstod att Draft-knappen byter text till "Continue" när
kapitlet redan har prosa - grep i `Editor.tsx` visade att knappen
alltid heter "Draft" (bekräftat även av `docs/guide.md` punkt 6:
"Draft fills or continues the chapter"). Rättat innan commit istället
för att låta ett plausibelt men fel påstående stå kvar i
användardokumentationen.

**Ny CSS:** `.handbook-steps`/`.handbook-step`/`.handbook-step-image`
(bild med ram, rundade hörn, skugga - samma `var(--shadow)` som
övriga kort) och `.handbook-tip` (vänsterkant i `var(--sage)`,
`var(--raised)`-bakgrund - samma färgspråk som redan etablerat för
"lyckad"-status i CodexHomeCard).

**Verifiering:** `tsc --noEmit` rent, hela testsviten (1240 test,
inklusive `tests/ui/i18n.test.ts`s strukturella konsistenskontroll
mellan språken) grön, `npm run build` rent. Headless Playwright mot
en riktig `vite preview`-build bekräftade att alla tre
steg-skärmdumpar och tips-rutan faktiskt renderas i Guide-vyn,
inbäddade mellan 5.1 och nästa sektion (5.2).

v1.0.224 → v1.0.225.


**Ändringslogg v1.0.225 → v1.0.226 (2026-10-29): Guide-pilotens
skärmdumpar om i ljust tema, högre upplösning.** Mats: "Jag tänker
att vi använder ljust tema för skärmdumparna. Kan du använda en högre
skärmupplösning för skärmdumparna. Jag har 2560x1440."

**Omtagning:** samma headless Playwright-teknik som innan, men nu med
`viewport: 2560x1440` (matchar Mats egen skärm) och ett klick på
tema-knappen innan något annat händer. Två tekniska problem dök upp
och fick lösas under tagningen, inte bara antas bort:
- Den tomma-kapitel-bilden blev onödigt dominerad av tomrum vid den
  höga upplösningen (sidan fyller tillgänglig höjd, och ett tomt
  kapitel har inget innehåll att fylla den med) — löst genom att
  tillfälligt köra den specifika skärmdumpen med en kortare
  webbläsarhöjd (820px) så Draft-knappen hamnar strax under
  platshållartexten, istället för hundratals pixlar tomrum.
- Exakt textmarkering (för Extend/Elaborate/Rewrite-skärmdumpen) gick
  fel första försöket — `Range.getBoundingClientRect()` på en
  flerradig markering returnerar EN rektangel som spänner över båda
  radernas fulla höjd, så hörnpunkterna hamnade inte på själva texten.
  Löst med `Range.getClientRects()` istället, som ger en rektangel
  per visuell rad, och drog musen genom varje radens mittpunkt.

**Resultat:** samma tre skärmdumpar (tomt kapitel + Draft, markering +
Extend/Elaborate/Rewrite-menyn, ingen markering + Write a beat-menyn),
nu i ljust tema vid 2560×1440 källupplösning — `.handbook-step-image`
skalar ner dem till `min(100%, 26rem)` i Guiden, så den högre
källupplösningen ger skarpare rendering vid den faktiska visningsstorleken,
ungefär som en retina-tillgång. Ersatte filerna på plats i
`public/handbook/write-with-ai/` (samma filnamn, samma i18n-referenser
— ingen kodändring behövdes, bara nya bilder).

**Verifiering:** `npm run build` rent, headless Playwright-skärmdump
av den renderade Guide-sidan mot en riktig `vite preview`-build
bekräftade att alla tre bilderna visas korrekt, skarpa och utan den
röda anslutningsbannern.

v1.0.225 → v1.0.226.


**Ändringslogg v1.0.226 → v1.0.227 (2026-10-29): Synopsis-rubriken
oläsbar mot mörk editorbakgrund.** Mats skickade en skärmdump: "Här
stötte jag på en litet problem. Jag har valt en mörkbakgrund i
editorn och appen har light mode. Då syns inte rubrikerna när man
t ex går till Synopsis" — rubriken "Synopsis" och ingresstexten
("The story in a nutshell: ...") var nästan osynliga, mörk text mot
en mörk strukturbakgrund. Uppföljningsfråga besvarad innan felsökning
startade: "Det är bara synopsis som ärver editorns bakgrund de andra
(Brainstorm Development method Briefs och Timeline) har sin egen
bakgrund" — vilket avgränsade felet korrekt.

**Grundorsak:** `editor_background` (BookSchema, nio lägen: none,
forest, milky-way, cork, triangles, fabric, school, pine, leaves)
målas som en inline `backgroundImage` direkt på `.manuscript`-elementet
i `Editor.tsx` (`manuscriptBackgroundStyle`). Synopsis-panelen renderar
`<h1 className="chapter-title">` och `<p className="synopsis-lede">`
som direkta barn till det elementet, utan egen pappersyta — till
skillnad från `ProseCanvas` som har sin egen ljusa `--editor-paper-bg`.
Båda textklasserna saknade egen `color`-regel och ärvde därför bara
`var(--text)` (appens ljusa tema-bläck, tänkt för ljust papper) —
fel när bakgrunden är ett mörkt foto eller mönster. Samma mönster
gäller `.chapter-title` som `<input>` i den vanliga kapitelvyn, men
Mats bekräftade att bara Synopsis är ett faktiskt observerat problem
där.

**Fix:** varje bakgrund klassad ljus/mörk efter uppmätt genomsnittlig
luminans (ImageMagick `-colorspace Gray -resize 1x1`, tröskel runt
140/255): forest (100), milky-way (36), triangles (12) och fabric (80)
räknas som mörka; cork (163), school (222), pine (231) och leaves
(241) som ljusa. Ny `EDITOR_BACKGROUND_DARK`-karta i
`editorBackgrounds.ts`. Ny `manuscriptBackgroundClassName()` i
`Editor.tsx` lägger till klassen `manuscript-dark-bg` på
`.manuscript`-elementet (båda renderingarna, Synopsis och vanlig
kapitelvy) när vald bakgrund är mörk. I `styles.css` sätter
`.manuscript.manuscript-dark-bg` en `--manuscript-ink: #fff8f3`
CSS-variabel, och `.chapter-title`/`.synopsis-lede` läser
`color: var(--manuscript-ink, var(--text))` — oförändrat utseende
när ingen eller en ljus bakgrund är vald, ljust bläck bara när
`--manuscript-ink` faktiskt är satt.

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent, 1240/1240
tester gröna (ingen av dem rörde detta, men inget gick sönder).
Headless Playwright mot en riktig körande dev-instans: skapade en
testbok, satte `editor_background: "fabric"` (mörk) i Manuscript
settings, öppnade Synopsis — rubrik och ingress syns nu tydligt i
ljust bläck mot den mörka strukturen, exakt samma vy som Mats
skärmdump men läsbar. Upprepade med `"cork"` (ljus bakgrund) för att
bekräfta att det normala mörka bläcket fortfarande används där —
ingen regression.

v1.0.226 → v1.0.227.


**Ändringslogg v1.0.227 → v1.0.228 (2026-10-29): toppraden harmonierad
mot kaampi Explore.** Mats skickade en skärmdump av Explores toppmeny:
"Kan vi försöka harmonera Toppraden med hur den ser ut för Explore.
Storlek på logga, marginaler och padding etc. Vi ska ha kvar Writers
menyval men logga storlekar laytout..."

**Första felsökning:** min lokala klon av kaampi/Explore (`/home/user/sandbox-ai`)
var 81 commits efter `origin/main` och visade fortfarande den gamla
"Sandbox AI ✧"-textbrandningen i `App.tsx` — inte alls det Mats
skärmdumpade. `git pull` hämtade in bland annat "Always show app logos
in the header switcher", som bytte Explores toppmeny till riktiga
SVG-loggor. Utan den uppdateringen hade jag matchat fel referens.

**Mätning av Explores faktiska värden** (`src/ui/experience.css`,
`.sb-header`/`.sb-brand`/`.sb-apps`): fast bal-höjd `84px`, padding
`0 33px` (bara horisontellt, ingen vertikal — höjden styr istället),
gap `22px`. Huvudloggan (`.sb-brand__logo`) `width: 240px`. Switcher-
loggorna (`.sb-switch-logo`, bilder, inte text) `width: 120px`, själva
knapparna `padding: 12px 10px; min-height: 44px; border-radius: 8px`,
aktiv flik `background: var(--panel-raised)`. Write och Explores
loggor delar samma SVG-viewBox-höjd (202 enheter; Write 1193 bred,
Explore 1358, Comic 1253) — så en höjdbaserad skalning (istället för
Explores breddbaserade) ger samma visuella skala oavsett appnamnets
längd: 240px bredd på Explores egen 1358-enheters logga motsvarar
≈36px höjd, vilket är vad `.app-top-logo` sattes till.

**Ändringar i `src/ui/styles.css`** (ingen React-ändring behövdes —
`AppSwitcher.tsx` använde redan bild-loggor, inte text):
- `.app-top-bar`: `height: 5.25rem` (84px), `padding: 0 2.0625rem`
  (33px, bara horisontellt), `gap: 1.375rem` (22px) — tidigare
  `padding: 0.5rem 1rem`, ingen fast höjd.
- `.app-top-logo`: `height: 1.7rem` → `2.25rem` (36px).
- `.app-switcher`: `gap: 0.3rem` → `0.625rem` (10px).
- `.app-switcher-item`: `padding: 0.35rem 0.6rem` →
  `0.75rem 0.625rem` (12px/10px), `border-radius: 7px` → `8px`,
  tillagt `min-height: 2.75rem` (44px) och `justify-content: center`.
- `.app-switcher-brand` (loggan inuti switcher-flikarna): `height: 0.85rem`
  → `1.25rem` (20px).

Writers egna menyval (Manuscripts, Guide, Settings) och höger-chrome
(Codex, språk, tema) rördes inte — bara storlek/padding/marginaler på
den delade raden, som Mats bad om.

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent, 1240/1240
tester gröna. Headless Playwright mot en riktig körande dev-instans
(ny bok, ljust tema) — skärmdump av den nya toppraden bekräftar större
logga, fast radhöjd, bredare switcher-flikar med samma avrundning och
bakgrundsmarkering på aktiv flik som Explores egen rad, med Writers
nav-knappar kvar till vänster.

v1.0.227 → v1.0.228.


**Ändringslogg v1.0.228 → v1.0.229 (2026-10-30): Codex flyttad in i
toppmenyn, hem-kortet borttaget.** Kom ur en designrunda kring en ny
startsida (ännu bara en designskiss, inte byggd på riktigt — se
Figma-liknande Design-canvasen "kaampi Write — ny startsida"). Mats
undrade om vi borde "pusha" för Codex på startsidan samt visa en liten
"Codex Connected"-notis när ansluten. Svarade att `CodexHomeCard`
redan gjorde exakt det — men bara i ett eget kort på Home, och bara i
skrivbordsappen. Mats observerade sen: "Jag tänker att vi har
toppmenyn redan på startsidan. Då finns Codex där?" — vilket visade
sig vara nästan sant men inte helt: `AppTopBar.tsx`s "Codex"-knapp var
villkorad på `store.book`, osynlig på Home eftersom inget manus är
öppet där. Föreslog att laga det istället för att duplicera i två
ställen; Mats: "Kör den vägen, ta bort hem-kortet."

**Problemet med att bara ta bort villkoret:** `CoreConnectionDialog`
(dialogen knappen öppnar) är tungt bok-scopad — kräver `bookId`/
`currentBook`, och dess två flikar (Delning, Versioner) är i grunden
per-manus-funktioner (checkpoint/restore, synliga-i-Explore/Comic).
Själva parkopplingen är däremot appbred sen tidigare (se
`CodexHomeCard`s egen kommentar). Att göra `bookId`/`currentBook`
valfria i den befintliga dialogen hade krävt att dölja halva
komponenten villkorligt — bedömde det som större regressionsrisk än
att bygga en egen, lätt variant för "inget manus öppet än".

**Lösning:**
- Ny `src/ui/CodexConnectDialog.tsx` — hämtad rakt ur `CodexHomeCard`s
  logik (samma `coreAutoClaim`/`coreConnection`/`pairCore`-anrop,
  samma tre lägen: connected/offline/push-med-parkopplingsformulär)
  men som en overlay-dialog (`edit-overlay`/`edit-card
  app-switcher-card`, samma mönster som `AppSwitcher.tsx`s
  `CompanionAppDialog`) istället för ett Home-kort. Ny i18n-nyckel
  `home.codexDesktopOnly` (alla tre språk) för webbläsarfallet —
  samma text som `CoreConnectionDialog`s egen `unavailable`-copy, för
  konsekvens mellan de två dialogerna.
- `AppTopBar.tsx`: "Codex"-knappen är nu alltid synlig (villkoret på
  `store.book` borttaget). Hämtar anslutningsstatus själv vid mount
  (`coreAutoClaim` → `coreConnection`) för en liten prick på knappen
  (`.app-switcher-dot`, samma klass som app-switcherns egen
  tillgänglig-indikator — sage när `reachable`, annars grå). Klick: med
  öppet manus → befintliga `CoreConnectionDialog` som förut; utan →
  nya `CodexConnectDialog`. Status synkas om när endera dialogen
  stängs, så prickens färg stämmer oavsett vilken väg man anslöt
  genom.
- `Home.tsx`: `CodexHomeCard`-raden borttagen helt.
  `src/ui/CodexHomeCard.tsx` raderad (ingen annan referens någonstans,
  bekräftat med grep innan borttagning — inga tester täckte den
  specifikt heller).
- `styles.css`: generaliserade `.home-start-card-copy >
  .home-codex-status.is-connected/.is-offline` till fristående
  `.home-codex-status.is-connected/.is-offline` (den gamla
  föräldra-kopplingen pekade mot ett kort som inte finns längre; den
  nya dialogen har ingen `.home-start-card-copy`-wrapper). Ny
  `.app-codex-nav { display:inline-flex; gap:0.4rem }` så knapp-text
  och prick hamnar i linje.

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent, 1240/1240
tester gröna (ingen av dem rörde Codex-UI specifikt, men inget gick
sönder). Headless Playwright mot en riktig körande dev-instans:
bekräftade "Codex"-knappen syns på Home (ingen bok öppen) med sin
prick; klick öppnar `CodexConnectDialog` och visar rätt
webbläsar-meddelande ("only possible in the desktop app..."), eftersom
`isTauri()` är falskt i den körande testmiljön; öppnade sen ett nytt
manus och bekräftade att den gamla bok-scopade `CoreConnectionDialog`
(Delning/Versioner-flikarna) fortfarande fungerar oförändrat därifrån.

Design-canvasens båda artboards ("innan ditt första manus" och "du har
redan manus") uppdaterade i efterhand så de inte längre visar
Codex-kort/notis på själva Home-ytan — en kommentar i varje artboard
pekar till toppmenyn istället, så skissen inte motsäger det som nu
faktiskt är byggt.

v1.0.228 → v1.0.229.


**Ändringslogg v1.0.229 → v1.0.230 (2026-10-31): maskot med pratbubbla,
första platsen på Home.** Lång designrunda, utgick från att Mats
mockade en egen version av startsidan (en "Design"-canvas han
dupplicerade från min skiss) med en ihopslagen pill-formad CTA och en
illustrerad maskot-karaktär istället för fyra likvärdiga kort. Jag
flaggade två saker innan vi gick vidare: maskoten är ett
varumärkesbeslut (ingen annan kaampi-app har illustrerade karaktärer),
och skissen visade fortfarande bara en smal kolumn, inte den breda
skärm-användning som var hela anledningen till att vi tog upp
startsidan. Mats skickade sen tre egna, färdiga karaktärsblad (inte
stock) — Kaamilla, Kaamy, en robot "Kaambot" — tänkta som ett
familjebrett maskotsystem för tips/meddelanden/frågor.

**Avgränsningar, i tur och ordning:**
- Går den att stänga av? Ja, uttryckligen efterfrågat — Write riktar
  sig delvis mot författare som kan tycka en pratande maskot är
  störande. Av som standard.
- En maskot för hela familjen, eller per app? Mats konstaterade själv
  att Comic är fel ställe — appens hela syfte är användarens egen
  bildkonst i en vald stil, så en konkurrerande illustrationsstil
  (hans exempel: "en Franquin-guide när man skapar en Manara-serie")
  är en riktig stilkrock på ett sätt som inte gäller Write/Explore
  (rena text/UI-ytor). Löst genom att göra inställningen per-app,
  byggd bara i Write denna gång.
- Tre karaktärer samtidigt, eller ett val? Mats idé: en
  inställningsskärm ("Who do you want to meet? Kaamilla, Kaamy,
  Kaambot?"), en vald maskot istället för tre som konkurrerar om
  samma plats. Bara Kaamilla har konst än; Kaamy/Kaambot är
  förberedda i typen (`MascotId`) men inte kopplade i UI:t förrän
  Mats skickar deras bilder — hellre det än ett väljarläge med
  alternativ som inte renderar något.

**Pratbubblans form, flera iterationer testade visuellt (headless
Playwright mot en lokal testsida, inte bara beskrivet i ord) innan
något byggdes på riktigt:**
- Första försöket: separat SVG-svans ovanpå en CSS-ruta. Mats:
  "svansen ligger ovanpå rutan" — två separata former möts aldrig
  pixelexakt utan dagar av finjustering. Övergavs.
- Mats förslag istället: låt ETT hörn av bubblans egen `border-radius`
  vara spetsigt (`border-bottom-left-radius: 0`) — ingen extra form,
  ingen söm, en enda CSS-rad.
- Var ska spetsen sitta, och var ska bubblan växa ifrån? Flera
  rundor: spetsen måste sitta vid MUNNEN, inte handen. Eftersom
  spetsen är bubblans BOTTEN-hörn måste bubblans TOPP vara fast
  förankrad nära munnen och växa nedåt — fel håll första försöket
  (förankrad nedåt, växte uppåt) gjorde att spetsen bara stämde för
  kort text. Mats: "Ska vi börja bygga rutan uppifrån med spetsen i
  botten. Så blir spetsen helt rätt för kortare texter och acceptabel
  vid längre?" — exakt den lösningen som landade.
- Två riktiga buggar Mats hittade i testet: (1) `max-height` räknade
  inte med paddingen (saknade `box-sizing: border-box`) så "4 raders"
  gräns i praktiken släppte igenom en femte rad; (2) bubblan hade en
  fast `max-width` oavsett textlängd — en bredare ruta för lång text
  ger färre rader på köpet, vilket också håller spetsen närmare
  munnen. Båda fixade och verifierade i samma testsida.
- Typsnitt: Mats ville bädda in Comic Relief (Google Fonts, SIL OFL)
  för bubbeltexten. Appen laddar annars ALDRIG typsnitt över nätet
  (se kommentaren överst i styles.css, "fully offline"-kravet) —
  laddade därför ner woff2-filerna (latin-subset, täcker å/ä/ö/æ/ø)
  och lade dem i `public/fonts/` precis som Barlow/Newsreader/IBM
  Plex Mono redan görs, istället för en `<link>` till
  fonts.googleapis.com.
- Länk/åtgärd i en bubbla: tre alternativ diskuterade (länk i texten;
  fristående knapp under; en särskilt formad "tips-knapp"). Landade
  på en knapp DOCKAD inuti bubblans egen ruta (Mats: "kör på det"),
  sen findjusterat på hans begäran: ingen avdelande linje, centrerad
  knapp, padding under. Samtidigt bestämt: har tipset en knapp
  kopplad till sig skippas den spetsiga formen helt — en docked-knapp
  gör bubblan garanterat 3+ rader, så spetsen skulle ändå hamnat långt
  från munnen; bättre en vanlig rundad ruta då.

**Byggt (inget av detta fanns i någon tidigare testsida, bara i
Write-koden):**
- `src/ui/mascot.ts` — `MascotId = "none" | "kaamilla"` (Kaamy/Kaambot
  tillagda i typen den dagen konst finns), localStorage-baklagrad
  precis som `theme.ts`. Appbred, inte manus-knuten (Mats: "Kanske
  ska inställningen vara per app?") — Homes tips behövs innan något
  manus finns. Egen `subscribeMascot()`-mekanism (en `Set` av
  lyssnare) eftersom webbläsarens `storage`-event bara triggar i
  ANDRA flikar, aldrig den flik som själv skrev värdet — utan den
  uppdaterades Home aldrig när inställningen ändrades i samma flik
  (hittad och fixad under egen Playwright-verifiering: valde
  Kaamilla i Settings, stängde dialogen, Home visade fortfarande
  inget — klassiskt "useState(läsFunktion) läser bara en gång vid
  mount"-fel).
- `src/ui/MascotTip.tsx` — avatar + bubbla, `action`-prop avgör
  spetsig/kort vs. rundad/med-knapp-läge.
- `public/mascots/kaamilla.png` — Mats egen bild, sparad rakt av.
- `src/ui/i18n/{en,sv,nb}.ts` — nya nycklar `mascotLabel`/
  `mascotLede`/`mascotOptions` i `editor`-namespacet (samma
  `editorSettingsHeading`-sektion som Pappersyta/Revisions).
- `AppSettingsDialog.tsx` — ny "Maskot"-väljare, tredje fältet i en
  redan existerande tre-kolumners `.settings-field-row` (ingen
  CSS-ändring behövdes där, griden var redan förberedd för tre).
- `Home.tsx` — när en maskot är vald ersätts "New here? Read the
  quickstart"-kortet i 2×2-griden med `<MascotTip>` ovanför griden
  (samma lede/action-text som kortet redan hade, `m.home.guideCardLede`/
  `guideCardAction`, inga nya översättningar för själva tipset); när
  maskoten är av (standard) är Home pixel-för-pixel oförändrad.

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent (mascots/
och de nya woff2-filerna bekräftat i `dist/`), 1240/1240 tester
gröna. Headless Playwright mot en riktig körande dev-instans,
flera pass: Home oförändrad med maskot av (regressionskoll);
Settings-dialogens nya fält; Home med Kaamilla aktiv i både ljust och
mörkt tema (bubbla, knapp och Comic Relief-typsnitt läsbart i båda);
inställningen kvar efter en full sidomladdning (localStorage); och
att "Open the Guide"-knappen i bubblan faktiskt öppnar Guide-overlayn.

v1.0.229 → v1.0.230.


**Ändringslogg v1.0.230 → v1.0.231 (2026-10-31): maskoten växer med
bubblan.** Mats: "Kan man låta Kaamilla (och andra karaktärer) få
växa på höjden om textrutan växer?" Testat visuellt i samma
Playwright-testsida som resten av bubbel-arbetet innan något ändrades
i appen.

**Lösning, ren CSS, ingen JS:** `.mascot-tip` bytte `align-items:
flex-start` → `stretch`; `.mascot-tip-avatar` bytte sin fasta `width:
5.25rem` mot `width: auto; height: auto; align-self: stretch` plus
`min-height: 4.5rem`/`max-height: 9rem` som tak och golv. Med både
bredd och höjd satta till `auto` sätter webbläsaren bildens bredd
utifrån dess egen bildproportion när höjden sträcks till radens höjd
— ingen distorsion, ingen uträkning i JS. Eftersom bubblans egen
`max-height` redan avgör radens höjd (den är det högsta
innehållsbestämda elementet), och avataren bara följer efter inom
sitt min/max-spann, påverkade ändringen inte heller var spetsen
hamnar i de korta `.has-point`-bubblorna.

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent, 1240/1240
tester gröna. Headless Playwright mot en riktig körande dev-instans:
Kaamilla syns tydligt större bredvid "Open the Guide"-tipsets högre
bubbla jämfört med tidigare, fortfarande skarp och oförvrängd.

v1.0.230 → v1.0.231.


**Ändringslogg v1.0.231 → v1.0.232 (2026-10-31): Kaamy + slumpade
poser.** Mats skickade Kaamys fem bilder (bas + axlar-upp, tummen upp,
kaffekopp, fundersam) — två sändningar innan filerna faktiskt
synkades till disk (en känd brist i den här sessionen: bilder i
meddelanden mitt i en pågående tur saknar ibland den filsökväg jag
behöver för att läsa dem; löst genom att be Mats skicka om, vilket
fungerade andra gången). Fyra Kaambot-bilder och en extra
Kaamilla-pose (tummen upp, blinkande) skickades också men drabbades av
samma synkproblem och är fortfarande inte mottagna när den här
versionen skrevs.

**Byggt:**
- `mascot.ts`: `MascotId` utökad med `"kaamy"`; ny `MASCOT_POSES`
  (ersätter den gamla `MASCOT_IMAGES`) — en array av poser per
  karaktär istället för en enda bild. Ny `pickMascotPose()` som väljer
  slumpmässigt ur arrayen.
- `MascotTip.tsx`: slår upp posen EN gång vid mount
  (`useState(() => pickMascotPose(mascot))`), inte vid varje
  omrendering — annars skulle bilden hoppa runt varje gång React
  renderar om komponenten av andra skäl.
- `Home.tsx`: `<MascotTip key={mascot} .../>` — nyckeln tvingar en
  ny mount (och därmed en ny slumpad pose) när användaren byter
  karaktär i Settings; annars hade komponenten behållit den gamla
  karaktärens pose-sträng efter ett byte.
- i18n: `mascotOptions.kaamy: "Kaamy"` i alla tre språk.

**Öppen fråga från Mats, inte avgjord än:** "Ska dessa kunna dyka upp
dynamiskt eller vet vi vart och när de dyker upp? Om det är det
senare så kan vi faktiskt bestämma vilken bild, finjustera
textbubblan etc." Svarade: idag är ALLA tips författade i kod på
fasta platser (just nu bara en: Home), inget genereras dynamiskt —
så vi kan tekniskt sett handplocka pose per tips. Rekommenderade
ändå att låta slumpmässigt/automatiskt vara standard även framöver
(skalar utan handpåläggning för varje ny tips-plats; stämmer också
bättre överens med att slumpa poser alls), men med en valfri
pose-override per tips för enstaka ställen där det är värt det.
Inte byggd — väntar på Mats beslut.

**Verifiering:** `tsc --noEmit` rent (en `noUncheckedIndexedAccess`-
varning löst med samma `!`-konvention som redan används i
`proseDom.ts`/`askManuscript.ts`), `npm run build` rent (alla tio
mascot-bilder bekräftade i `dist/mascots/`), 1240/1240 tester gröna.

v1.0.231 → v1.0.232.


**Ändringslogg v1.0.232 → v1.0.233 (2026-10-31): pill-formad
start-knapp på Home, på riktigt.** Startsidearbetet från tidigare i
sessionen (en Design-canvas, "kaampi Write — ny startsida") visade sig
inte vara källan till en skärmdump Mats skickade med en stor
rosa-pil-pill-ruta — efter lite fram och tillbaka (jag läste canvasen
på nytt, trodde Mats editerat den live i webbläsaren, men den visade
fortfarande min egen senaste version) klargjorde Mats: skärmdumpen var
av den riktiga körande appen, med en pill han byggt lokalt själv,
utanför den här sessionen. Bad om exakta mått: "Pillrutan är 1400x
150px med helt rundade hörn. Texten 'Start new...' är Barlow 18 px."
samt en pil-ikon exporterad som SVG från Affinity Designer (tre
överlappande pilar i kaampis rosa, 33/66/100% opacitet).

**Byggt, rakt i `Home.tsx`/`styles.css` (ingen ny mockup-runda
den här gången):**
- `public/icons/pill-arrow.svg` — Mats egen Affinity-export, sparad
  oförändrad.
- Ny `.home-hero-pill`: fast höjd 9.375rem (150px, pillformen ska
  inte sträckas av bredden), flytande bredd upp till 87.5rem
  (1400px), `border-radius: 999px`. Innehåller `.home-hero-label`
  (Barlow 18px/600) och en `.home-hero-row` med `.home-hero-input`
  (rundad textinmatning) + `.home-hero-submit` (rund rosa
  pil-knapp, Mats egen SVG).
- `Home.tsx`: den gamla lilla "New manuscript"-kortet (en av fyra
  likvärdiga kort i `.home-start-cards`) ersatt av den nya pillen,
  flyttad överst i `.home-start`-sektionen, före maskot-tipset. De
  återstående korten (Import backup, Import manuscript, och
  Guide-kortet när ingen maskot är vald) ligger kvar i griden —
  den klarar sig fint med färre kort (2 eller 3) utan CSS-ändring.
  Samma `title`/`setTitle`/`submitNew`-state återanvänt rakt av,
  ingen ny logik.

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent (ikonen
bekräftad i `dist/icons/`), 1240/1240 tester gröna. Headless
Playwright mot en riktig körande dev-instans, skickad till Mats som
skärmdump för avstämning — nära mockupen, men pilikonen sitter mindre
centrerad/större i sin runda knapp än i Mats egen bild; flaggat som
öppen finjustering, inte löst än.

v1.0.232 → v1.0.233.


**Ändringslogg v1.0.233 → v1.0.234 (2026-10-31): pillen rättad mot
mockupen.** Mats, direkt efter att v1.0.233 skickats: "Om du kollar
tycker du verkligen att det är likt?" — befogat, tre skillnader mot
hans Affinity-mockup:

1. Den gamla, separata "kaampi Write"-loggan ovanför rubriken fanns
   kvar i min version men inte i hans skärmdump (toppmenyn har redan
   en egen logga) — `.home-logo`/`.home-logo-light`/`.home-logo-dark`
   och de två `<img>`-taggarna i `Home.tsx` borttagna helt (ingen
   annan kod refererade klasserna, bekräftat med grep innan
   borttagning).
2. "Input fältet ska ligga bakom texten Start new..." — jag hade
   byggt två rader (etikett ovanför, fält+knapp under); Mats menade en
   enda rad, fält direkt efter etiketten. `.home-hero-row`-wrappern
   togs bort, `.home-hero-pill` är nu själv en rak flex-rad
   (`align-items: center`) med etikett, fält och knapp som tre syskon.
3. Pilen: 70×55px (`.home-hero-submit`) utan den rosa cirkelbakgrunden
   — knappen är nu osynlig (`background: none`), bara ikonen syns, i
   sin fulla angivna storlek istället för en nedskalad 24px-ikon i en
   60px rosa knapp.

Input-fältets exakta mått (890×69px) behölls som ett `max-width`/fast
`height` snarare än en helt fast bredd, så det kan krympa på smalare
fönster istället för att svämma över pillen — bredden är annars
precis Mats mått.

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent, 1240/1240
tester gröna. Headless Playwright mot samma körande dev-instans,
skickad till Mats som ny skärmdump för avstämning.

v1.0.233 → v1.0.234.


**Ändringslogg v1.0.234 → v1.0.235 (2026-10-31): varför pillen aldrig
blev 1400px, plus exakta avstånd.** Mats: "Är verkligen pill 1400 PX
bred?" — befogat, mätte med Playwright istället för att gissa.
`.home-hero-pill`s egen `max-width:1400px` var korrekt, men
`.home` (föräldern) rendrade bara 933px bred trots `max-width:1280px`
(senare testat upp till 1600px, fortfarande 933px) — `max-width` var
alltså aldrig den bindande begränsningen.

**Grundorsak, en klassisk flexbox-fälla:** `.home` sitter som
flex-item i `.app-shell` (`display:flex; flex-direction:column`).
`.home` hade `margin: 0 auto` men inget `width: 100%`. Auto-marginaler
på en flex-items tväraxel (horisontellt i en kolumn-flex) kopplar bort
standard-`stretch`-beteendet helt — elementet krymper istället till
sitt EGET INNEHÅLLS bredd ("shrink-to-fit", ungefär som
`width: fit-content`) och centreras sen med auto-marginalerna runt
den krympta boxen. `max-width` blir då en övre gräns som aldrig nås,
eftersom innehållet redan är smalare. Fix: lade till `width: 100%`
på `.home` — enda raden som faktiskt behövdes. Bekräftat med
Playwright-mätning efteråt: pillen 1400px exakt, `.home` 1600px
(dess nya `max-width`, höjt från 1280px samtidigt). Testat vid 1200px
fönsterbredd också — ingen horisontell overflow, pillen krymper
proportionerligt.

**Samma tur, tre exakta avstånd Mats mätte i sin mockup:** 75px
topbar→rubrik, 60px ingress→pill, 35px pill→maskot-bubbla.
`.home`s `padding-top` bytt från `12vh` (vy-höjdsrelativt, matchade
aldrig en fast siffra) till fast `4.6875rem` (75px). `.lede`s
`margin-bottom` nollställd (var `2.5rem`) och `.home-start`s
`margin-top` satt till exakt `3.75rem` (60px) istället för att låta
marginalerna kollapsa oförutsägbart. Ny scopead regel
`.home-start > .mascot-tip { margin-top: 2.1875rem }` (35px) —
medvetet INTE lagd direkt på `.mascot-tip` själv, eftersom den
komponenten är tänkt att återanvändas på andra ställen (Guide, tomma
vyer) med sina egna avståndsbehov.

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent, 1240/1240
tester gröna. Alla tre avstånd mätta direkt i DOM:en via Playwright
(`getBoundingClientRect`) och bekräftade exakta: 75/60/35px.

v1.0.234 → v1.0.235.

**Ändringslogg v1.0.235 → v1.0.236 (2026-10-31): fyrapunktsjämförelse
mot Mats referensbild.** Mats skickade en skärmdump av sin egen
referensmockup och jämförde mot det jag levererat: "Hela paketet är
centrerat. Texten ovanför pill och maskoten under är inskjuten. Texten
'Start a new...' har mer padding till vänster och höger. Den rosa
pilen (Create/Send) ligger alldeles för långt från höger kant på
pill."

**Fyra fix:**
1. **Centrering** — `.home`s `max-width` sänkt från `100rem` till
   exakt `90.5rem` (pillens egna `87.5rem` plus `.home`s sidopadding
   på `1.5rem` vardera). Nu matchar `.home`s innehållsbredd pillens
   egen bredd exakt, så hela paketet renderas centrerat i stället för
   vänsterjusterat med oanvänt utrymme till höger.
2. **Inskjutning** — `.home-brand` (rubrik + ingress) och
   `.home-start > .mascot-tip` (maskot-bubblan) fick båda
   `margin-left: 2.5rem`, så de sitter indragna relativt pillen och
   korten som spänner full bredd — exakt vad Mats observerade i sin
   referensbild.
3. **Padding kring "Start a new..."** — `.home-hero-pill`s
   horisontella padding höjd från `2.25rem` till `3rem`, och gap:et
   mellan label och input-fält höjt från `1.25rem` till `1.75rem`.
4. **Pilens position** — grundorsaken var att `.home-hero-input`s
   `max-width: 55.625rem`-tak lämnar oanvänt flex-grow-utrymme i
   raden som inte automatiskt omfördelas till den fasta
   `.home-hero-submit`-knappen bredvid. Fix: `margin-left: auto` på
   `.home-hero-submit`, vilket pinnar den mot pillens egna högerkant
   oavsett hur mycket input-fältet faktiskt växte.

**Verifiering:** `.home-hero-pill`s egen `max-width: 87.5rem` togs
bort (redundant nu när föräldern `.home` redan begränsar till samma
bredd) — bara `width: 100%` kvar. Playwright-mätning efteråt:
`.home` har identiskt vänster- och högermarginal mot fönsterkanten
(80px vardera vid 1608px fönsterbredd) — paketet är centrerat.
Pillen fortfarande exakt 1400px. Pilens högerkant sitter 49px från
pillens egen högerkant, samma som pillens högerpadding (3rem ≈ 48px)
— flush med padding, precis som vänstersidan. `tsc --noEmit` rent,
`npm run build` rent, 1240/1240 tester gröna.

v1.0.235 → v1.0.236.

**Ändringslogg v1.0.236 → v1.0.237 (2026-10-31): glapp mellan
input-fält och pil.** Mats, efter att ha sett skärmdumpen i chatten:
"Inputfältet måste sträckas ut så att det ligger snyggt nära pilen.
Det är ett glapp där nu." Orsak: `.home-hero-input` hade fortfarande
`max-width: 55.625rem` kvar från tidigare, vilket nu (efter att pilen
pinnats till höger med `margin-left: auto` i v1.0.236) lämnade ett
synligt tomrum mellan input-fältets högerkant och pilen. Fix: tog bort
`max-width` helt från `.home-hero-input` — `flex: 1 1 auto` fyller nu
hela det tillgängliga utrymmet i raden fram till pilen, med bara det
vanliga `gap`-avståndet (1.75rem) kvar.

**Verifiering:** Playwright-mätning: input-fältet 992px brett (växte
från tidigare tak på 890px), avstånd input→pil exakt 28px (=1.75rem,
radens eget `gap`), pilens högerkant fortfarande 49px från pillens
egen högerkant (oförändrat). `tsc --noEmit` rent, `npm run build`
rent, 1240/1240 tester gröna.

v1.0.236 → v1.0.237.

**Ändringslogg v1.0.237 → v1.0.238 (2026-10-31): pratbubblan ljus även
i Dark theme.** Mats: "Där satt den. EN sak jag ser nu är att
pratbubblan borde nog vara ljus även med Dark theme." `.mascot-bubble`
använde `background: var(--paper); color: var(--text)` — dessa tokens
flippar till mörka värden (`#231e18` / `#f3eadc`) i dark theme, så
bubblan blev en mörk ruta istället för en vit seriepratbubbla. Fix:
bytte till fasta hexvärden (samma som light themes `--paper`/`--text`/
`--border-soft`: `#fffdf8` / `#2a2218` / `#e4d8c8`) istället för
tema-variablerna, så bubblan alltid är ljus oavsett tema. Ingen
visuell skillnad i light theme (samma färger som förut), men i dark
theme syns den nu som en vit bubbla mot den mörka bakgrunden.

**Verifiering:** Playwright-skärmdump i dark theme bekräftar ljus
bubbla med mörk text, knappen "Open the Guide" fortfarande orange
(egen `.primary`-klass, opåverkad). `tsc --noEmit` rent, `npm run
build` rent, 1240/1240 tester gröna.

v1.0.237 → v1.0.238.

**Ändringslogg v1.0.238 → v1.0.239 (2026-10-31): ogiltig serveradress
bröt hela appen permanent.** Tester (via Mats): klistrade av misstag
in en ofullständig adress när hen ställde in en lokal API-server. Write
fastnade på en tom sida som bara sa att adressen inte var giltig —
ingen tillbaka-pil, inget synligt sätt ut. Stängde appen, öppnade den
igen — fortfarande fast.

**Grundorsak:** `listEngineModels` (`BookStore.tsx`) anropas
automatiskt i en `useEffect` vid varje appstart (och varje gång
motor/adress ändras) för att lista tillgängliga modeller. Den var en
vanlig, icke-async funktion som konstruerar en `OllamaModelProvider`
eller `OpenAICompatibleLocalProvider` direkt. De konstruktorerna
anropar `assertLocalOnlyBaseUrl` synkront, som kastar
`LocalProviderConfigError` direkt — INTE som en avvisad Promise — när
adressen inte går att tolka med `new URL(...)`. Eftersom
`listEngineModels` själv inte var `async`, lät den det synkrona
kastet undkomma funktionen helt, förbi `.catch()`:en på anropsstället,
rakt in i appens egen toppnivå-`ErrorBoundary` (`App.tsx`) — samma
krasch-skärm som finns för riktigt oväntade fel, fast helt utan
"tillbaka"-funktion utöver en "Försök igen"-knapp som bara
återmonterar trädet och genast kraschar likadant igen, eftersom den
trasiga adressen redan låg sparad i `localStorage`. Varje omstart av
appen körde om samma effekt mot samma trasiga adress — permanent fast,
precis som testaren beskrev.

**Fix:** en rad, `function` → `async function` på `listEngineModels`.
En `async`-funktion fångar automatiskt ett synkront kast i sin egen
kropp och gör om det till en vanlig avvisning — `.catch()`:en på
anropsstället (som redan fanns och redan hanterar detta korrekt via
`ollamaHint()`) fångar den nu som väntat, och felet visas som appens
vanliga "kan inte nå servern"-läge i Settings istället för att
kaschra hela appen.

**Verifiering:** Playwright, riktig reproduktion: satte
`storybook-ai.base-url` till en ofullständig adress
(`http://192.168.1.`) och `storybook-ai.engine` till
`openai-compatible` i `localStorage`, laddade om sidan. Före fixen
hade detta kraschat rakt in i `.crash`-skärmen (bekräftat via
kodläsning av kastkedjan, inte bara teori). Efter fixen: ingen
`.crash`-skärm, Home renderas helt normalt med sin vanliga rubrik.
`tsc --noEmit` rent, `npm run build` rent, 1240/1240 tester gröna.

v1.0.238 → v1.0.239.

**Ändringslogg v1.0.239 → v1.0.240 (2026-10-31): Kaambot + visuell
maskot-väljare.** Mats skickade tre bilder av en ny karaktär, Kaambot
(en liten robot), och en egen mockup av Settings → Assistant: fyra
bildkort (Kaamilla/Kaamy/Kaambot/None) istället för dropdownen som
fanns sen v1.0.230.

**Kaambot:** tre bilder sparade i `public/mascots/` -
`kaambot.png` (stående, 188×400), `kaambot-books.png` (bär böcker,
241×356), `kaambot-thumbsup.png` (inzoomat ansikte, tumme upp -
levererad som .webp, konverterad till PNG och nedskalad från
1086×1448 till 300×400 för att matcha de andra karaktärernas
filstorlek). `MascotId`, `MASCOT_IDS`, `MASCOT_POSES`,
`MASCOT_NAMES` och `parseMascot` i `mascot.ts` utökade - samma
mönster som Kaamy fick i v1.0.232, inga nya systembeteenden.

**Väljaren:** `AppSettingsDialog.tsx`s `<select>` ersatt med en egen
`.mascot-picker` - ett `role="radiogroup"` av `<button role="radio">`,
en per karaktär plus "None", var och en med sin bild (standardposen)
och sitt namn, vald karaktär markerad med en kantlinje
(`aria-checked`). Flyttad till en egen sektion "ASSISTANT" (tidigare
en rad inuti "EDITOR"), med en alltid synlig beskrivningstext ovanför
korten istället för gömd i en HelpTip-tooltip - Mats: "Jag tänker en
text ovanför 'korten' som beskriver vad assistenten är och när den
dyker upp samt att man kan ändra inställningen när som helst."
Textsträngen (alla tre språk) skriven om för att uttryckligen säga
det.

**Pixelprecision (Mats bad uttryckligen om det):** den nya
`<p className="mascot-picker-lede">` hade annars fått webbläsarens
standard-`<p>`-marginal (~1em) ovanpå `.settings-block`s egna grid-gap
(0.75rem) - dubbel luft, inte avsiktlig. Nollställde paragrafens egen
marginal så att precis EN sak styr avståndet (grid-gapet). Uppmätt
med Playwright efteråt: 12px mellan rubrik→text och text→kortrad,
exakt samma 12px på båda - ingen dubblering.

**Verifiering:** `tsc --noEmit` rent, `npm run build` rent, 1240/1240
tester gröna. Playwright-skärmdump av hela Settings-dialogen jämförd
mot Mats egen mockup - fyra kort, vald karaktär markerad, text ovanför
synlig.

v1.0.239 → v1.0.240.

**Ändringslogg v1.0.240 → v1.0.241 (2026-10-31): Kaamilla default +
engångs-introbubbla.** Mats: "Jag föreslåt att Kaamilla är default.
Och när hon dyker upp på startsidan första gången så står det [...]
I en bubbla till höger om hennes tips om guiden [...] RUtan ska inte
dyka upp om man har ändrat assistent eller slagit av den funktionen."

**Default:** `readMascot()` i `mascot.ts` skilde tidigare inte på
"aldrig satt" och "uttryckligen satt till none" - båda gav samma
resultat (`"none"`). Nu: `localStorage.getItem(MASCOT_KEY) === null`
(aldrig rört) ger `DEFAULT_MASCOT = "kaamilla"`; ett uttryckligt
sparat `"none"` ger fortfarande av, precis som förut. Avgörande
skillnad - annars skulle en författare som medvetet stängt av
assistenten se henne komma tillbaka.

**Introbubblan:** ny `MASCOT_INTRO_KEY`
(`storybook-ai.mascot-intro-seen`) i `mascot.ts`, separat flagga från
själva maskotvalet. `MascotTip.tsx` fick en ny valfri `intro`-prop -
en andra pratbubbla bredvid den befintliga Guide-bubblan (samma rad,
delar `.mascot-tip-bubbles`-wrappern, radbryter på smal skärm). Visas
i `Home.tsx` bara när `mascot === "kaamilla" && !mascotIntroSeen`.
Texten (alla tre språk): "This is Kaamilla, your assistant. She'll
occasionally pop up with tips and info. You can turn her off in
Settings, or switch to Kaamy or Kaambot there." + knapp "Understood".

**Permanent avstängning, båda vägarna Mats bad om:** `dismissMascotIntro()`
anropas dels direkt av "Understood"-knappen, dels automatiskt inuti
`setMascot()` självt - varje uttryckligt val i Settings (inklusive att
välja Kaamilla igen, eller stänga av helt) räknas som att författaren
redan känner till inställningen, så introt pensioneras även om man
aldrig sett eller klickat bort det. Testat uttryckligen: byt till Kaamy
och sen tillbaka till Kaamilla → introt kommer INTE tillbaka (författaren
har bevisligen redan rört inställningen).

**Verifiering:** ny `tests/ui/mascot.test.ts` för den rena
`parseMascot`-logiken (projektets vitest-miljö är `"node"`, utan DOM/
localStorage, så själva localStorage-beteendet - standardvalet,
introbubblan, permanent avstängning - verifierades istället med
Playwright, samma mönster som resten av appens localStorage-drivna UI
i den här loggen). Tre körningar: (1) tom localStorage → `null`
sparat värde, Kaamilla ändå default, introbubblan syns med båda
bubblorna sida vid sida; (2) klick på "Understood" → bubblan försvinner
direkt, flaggan sparas, borta även efter omladdning; (3) väljer "None"
i Settings innan introt någonsin synts → `mascot-intro-seen` ändå satt
till `"1"`. `tsc --noEmit` rent, `npm run build` rent, 1241/1241
tester gröna (en ny).

v1.0.240 → v1.0.241.

**Ändringslogg v1.0.241 → v1.0.242 (2026-10-31): "Create series from
this book".** Mats: "Om jag har en bok som jag är färdig med och
känner att jag vill ska utgöra första boken i en serie. Kan jag på
nåt sätt skapa en serie utifrån boken men de fakta om världen som bör
följa med?" Research (subagent) bekräftade: nej, inget sånt flöde
fanns. Tre separata manuella steg - skapa serie, koppla boken via
assign-to-series-dropdownen (bara `series_id`, rör aldrig bokens egna
`facts`), och sen "Send to series" en fakta i taget i Story Bible
(`promoteBookFact` i `SeriesStore.tsx`, inget bulk-läge). Mats: "Ja
det känns viktigt."

**Byggt:** en ny knapp "Create series from this book" i
`BiblePanel.tsx`s head-tools-rad (samma rad som "Merge cards…"),
synlig bara för en bok som ännu inte har `series_id`. Ett klick:
1. `createSeries(book.title)` - ny serie uppkallad efter boken.
2. `setBookSeries(book.id, created.id)` - kopplar boken.
3. Loop över `visibleLockedFacts(book.facts, book.hidden_entities)`
   (samma mängd fakta som räknas som bokens "canon" vid promptbygge -
   exkluderar sånt författaren gömt från modellen) - varje fakta skickas
   upp med `promoteBookFact`, exakt samma anrop den befintliga
   en-i-taget-knappen redan gjorde, bara i en loop istället för ett
   klick per fakta.

Ingen ny mekanism uppfanns - all logik (författarens fakta vinner,
canon-spårning "Established in: Bok, Kapitel N") återanvänds rakt av
från den befintliga "Send to series"-vägen. Serien börjar uppkallad
efter boken; döp om efteråt i Series-vyn om "X series" inte passar.

**Verifiering:** riktig Playwright-körning genom hela flödet - nytt
manus, ny karaktär med en låst fakta via Story Bible-formuläret,
klick på "Create series from this book", sen kontrollerat att (a)
knappen försvinner (boken har nu `series_id`, "Merge cards…" tar dess
plats i samma rad), (b) seriens egen Story Bible-flik visar fakta
"Aria" märkt "Established in: Seriestest, Chapter 1", (c) seriens
Books-flik listar boken med "1 chapter · 1 locked fact". `tsc
--noEmit` rent, `npm run build` rent, 1241/1241 tester gröna.

v1.0.241 → v1.0.242.

**Ändringslogg v1.0.242 → v1.0.243 (2026-10-31): riktig CSS-svans på
pratbubblan.** Mats, medan vi väntade på en CI-körning, länkade
Nicolas Gallaghers klassiska pure-CSS speech bubble-teknik: "Kanske
kan vi snygga till vår pratbubbla trots allt? Med en 'svans' på
sidan av bubblan?"

**Vad som fanns innan:** `.has-point` hade bara
`border-bottom-left-radius: 2px` - ett fyrkantigt hörn som ANTYDDE en
spets, ingen riktig triangel. Dessutom upptäcktes under arbetet att
den enda bubblan som faktiskt syns i appen idag (Home's Guide-tips)
alltid har en `action`-knapp, alltså `.has-action` - `.has-point`
users aldrig live. Mats egen efterfrågan gällde bubblan han faktiskt
ser, så lösningen fick täcka båda varianterna, inte bara den oanvända.

**Byggt:** Gallaghers två-triangel-trick (`::before` i bubblans
ramfärg `#e4d8c8`, något mindre `::after` i bubblans egen fyllnadsfärg
`#fffdf8` ovanpå, förskjuten med exakt ramens 1.5px tjocklek) på BÅDA
bubbelformerna, inte bara `.has-point`. Krävde en strukturändring:
radklippningen (`max-height`/`overflow: hidden`) flyttades från
bubblans egen box till en ny inre `.mascot-bubble-content`-wrapper
(`MascotTip.tsx`) - annars hade bubblans eget `overflow: hidden`
klippt bort svansens pseudo-element, som sitter UTANFÖR boxen via
negativt `left`. Svansen själv scopead till
`.mascot-tip-bubbles > .mascot-bubble:first-child` - annars hade en
eventuell andra bubbla bredvid (introbubblan från v1.0.241) också
fått en svans, pekandes meningslöst in i den första bubblan istället
för mot maskoten.

Den gamla motiveringen för att `.has-action` skulle hoppa över
spetsen helt ("en 3+ rader hög bubbla gör att hörn-hacket hamnar för
långt från munnen") gäller inte längre - en riktig svans ankras med
`top` på ett fast avstånd från bubblans egen överkant, oavsett hur
hög bubblan växer nedåt.

**Verifiering:** Playwright-skärmdumpar i både ljust och mörkt tema
(bubblan är ju alltid ljus sen v1.0.238) - svansen syns tydligt,
pekar mot Kaamillas mun, 1.5px ramring runt hela triangeln matchar
bubblans egen ram exakt. Närbild bekräftar skarp, prydlig kant utan
pixligt sönderfall. Introbubblan bredvid har korrekt ingen egen svans.
`tsc --noEmit` rent, `npm run build` rent, 1241/1241 tester gröna.

v1.0.242 → v1.0.243.


**Ändringslogg v1.0.34 → v1.0.35 (2026-10-02):** StoryCore — första
riktiga byggsteget, efter flera rundors arkitekturdiskussion (se
roadmap-ideas.md #31). Mats byggde ett tredje syskonprojekt
(`ComicBook-AI`, story-till-serie) och undrade om det var dags att ta
tag i idén om en gemensam bas. Jag klonade och läste det faktiska
ComicBook-repot istället för att gissa, och hittade tre konkreta,
redan existerande fel i dess hemmasnickrade `storybookImport.ts`:
(1) bara 2 av 6 Story Bible-kategorier hanterades (Objekt/Grupper/
Händelser/Koncept föll bort tyst), (2) ingen statusfiltrering — en
`ai_proposed`/flaggad fakta kunde importeras som om den vore låst
kanon, (3) `hidden_from_ai`/`hidden_entities` respekterades inte,
trots att ComicBooks egen spec uttryckligen kräver det.

**Arkitekturprincipen vi landade i, efter flera rundor:** varje app
äger bara sin egen kanon. Data från en annan app är alltid ett
förslag, aldrig en skrivning — en generalisering av appens egen
"författare > AI"-princip till app-till-app-nivå, inte en ny regel.
Mekanismen stannar medvetet enkel (nivå 1 av tre diskuterade): en
manuellt genererad exportfil som mottagaren importerar genom sin
egen befintliga granskningskö (Import lore), inte en delad, levande
databas eller ens en delad lokal "brevlåda"-mapp — båda skulle lösa
ett upptäckbarhetsproblem ingen har stött på än, till priset av
ett nytt, meddelandeprotokoll-liknande underhållsansvar.

**Nytt repo: `ocedo-apps/StoryCore`** (publikt, GPL-3.0 — samma
licens som StoryBook AI; måste vara publikt eftersom StoryBook AI:s
egen Windows-CI annars inte kan hämta en privat sidokomponent med
standard-`GITHUB_TOKEN`). Innehåller bara ett schema och en
validator (`ManuscriptExportSchema`/`parseManuscriptExport`) —
inget eget datalager. Medvetet skilt från StoryBook AI:s interna
`Book`-typ, som ändras nästan varje release; kontraktet versioneras
separat via sitt eget `format`-nummer.

Två verkliga fel hittade och fixade under byggandet, inte bara i
StoryBook AI:s egen kod: (a) paketets första version kompilerade med
TypeScripts "Bundler"-upplösning, som tillät extensionslösa imports
(`./schema`) — men den byggda `dist/index.js` behöll samma
extensionslösa form, vilket varken Node eller Vites egen
node_modules-upplösning accepterar. Upptäckt genom att faktiskt
installera och importera paketet i ett separat testprojekt, inte
bara lita på `tsc`/`vitest` internt. Löst genom att växla till
`moduleResolution`/`module: "NodeNext"`. (b) `package.json`-
beroendet löstes till `git+ssh://` i `package-lock.json` trots
explicit `git+https://`-syntax — verifierade (inte gissade) att det
bara är en kosmetisk lockfil-etikett genom att köra `npm ci` med
`GIT_SSH_COMMAND=false` i en simulerad CI-miljö; installationen
lyckades ändå, så ingen risk för StoryBook AI:s riktiga Windows-CI.

**StoryBook AI:s sida:** ny `packManuscriptExport()`
(`src/core/manuscriptAppExport.ts`) — den maskinläsbara systern till
den redan existerande `buildManuscriptExport()` (Publish), men byggd
på `visibleLockedFacts` istället för bara `lockedFacts`, eftersom en
syskonapp som matar in data i vidare AI-generering är samma sorts
konsument som Draft, inte en människa som läser en färdig bok. Ny
knapp "Exportera för andra appar" bredvid Backup-knappen, laddar ner
direkt utan dialog (ingen anteckning/filnamn att fylla i, till
skillnad från den vanliga backupen). 9 nya tester, bland annat att en
`ai_proposed`-fakta, en `hidden_from_ai`-fakta och en helt dold
entitet alla korrekt utelämnas, och att alla sex Story Bible-
kategorier (inte bara karaktärer/platser) tas med.

`tsc --noEmit`, `npm run build` och hela testsviten (799 tester)
gröna. ComicBook AI:s egen sida (byta ut `storybookImport.ts` mot
StoryCore) är nästa steg, inte gjort än.

v1.0.34 → v1.0.35.

---

**Ändringslogg v1.0.33 → v1.0.34 (2026-10-02):** Mats: "Kan du kolla
att Guiden är uppdaterad med de förändringar vi gjort." — berättigad
fråga: kollade handboksinnehållet (`handbookSections` i i18n-filerna)
mot de två senaste releaserna och hittade att ingen av dem fanns
dokumenterad.

**Två nya sektioner tillagda**, en per release, samma mönster som
tidigare Handbok-arbete (`HANDBOOK_SECTION_IDS`/`HANDBOOK_SECTION_
CATEGORY` i `HandbookPanel.tsx`, innehåll i `handbook.sections` på
alla tre språk):
- `"lore-relevance-filter"` (kategorin Story Bible & World, direkt
  efter "Importera lore") — förklarar den nya `filter_lore_by_
  relevance`-inställningen från v1.0.32: varför chapter/interview-
  fakta alltid tas med men importerad lore inte, hur relevans avgörs
  (namn nämnt, eller för en Händelse en deltagare/plats), och pin-
  knappens utökade betydelse.
- `"ask-about-passage"` (kategorin Bearbeta manuset, direkt efter
  "Fråga manuset") — förklarar den nya fria hantverksfrågan från
  v1.0.33: skillnaden mot Analysera (fasta kategorier) och Fråga
  manuset (försiktig faktakoll), de två ingångarna (knappen bredvid
  Analysera, markera text → "Fråga…"), och att svaret är efemärt.

Uppdaterade även de två befintliga översikts-sektionerna som räknar
upp verktygen för att inkludera den nya funktionen: "En karta över
StoryBook AI" (GRANSKA-raden) och "Vilket verktyg behöver jag?"
(ny FAQ-rad: "Jag vill ha ärlig, kritisk feedback på en specifik
fråga." → Fråga om kapitlet / Fråga om en passage).

Live-verifierat med Playwright: båda nya sektionerna renderar under
rätt kategori med korrekt numrering (4.11 respektive 6.4). `tsc
--noEmit`, `npm run build` och hela testsviten (790 tester) gröna —
ingen kod ändrad, bara i18n-innehåll och `HandbookPanel.tsx`s
sektionslistor.

v1.0.33 → v1.0.34.

---

**Ändringslogg v1.0.32 → v1.0.33 (2026-10-02):** Mats, apropå roadmap-
genomgången: "Den fria frågan till AI kanske kan vara aktuell. Jag
tänker att man kan markera text och ställa en fråga (eg. Bygger texten
upp ett starkt slut som lockar till att läsa nästa del?)" — roadmap-
punkt #32, hittills bara en nedskriven idé.

Research innan förslag: läste `askManuscript.ts` (`ASK_MANUSCRIPT_SYSTEM`
— medvetet försiktig, "säg hellre att du inte vet"), `chapterFeedback.ts`
(`ANALYZE_SYSTEM` — fasta kategorier, inget fritt läge) och Instruct-
lägets markerings-mekanik i `ProseCanvas.tsx` (`spanFromArea`/
`window.getSelection()` → `InstructState`-panel → `onInstruct(span,
instruction)`). Slutsats: markerings-mekaniken går att återanvända rakt
av — bara ett nytt menyval och en parallell panel-state, ingen ny
markeringslogik.

**Förslag lagt fram, godkänt rakt av ("Det låter rätt"):** återanvänd
Instructs markering, men Review-modellen (icke-strömmande `.chat()`,
som Analyze/Ask Manuscript) istället för skrivmodellen, och en
systemprompt som uttryckligen uppmuntrar ärlig kritik — motsatt Ask
Manuscripts försiktiga ton. Täcker både markerad text (med omgivande
kontext, samma `before/selected/after`-form som Instruct) och hela
kapitlet utan markering (en egen liten knapp bredvid Analyze).

**Implementation.** Ny fil `src/core/askAboutPassage.ts`:
`ASK_ABOUT_PASSAGE_SYSTEM` (uppmanar till specifik, ärlig kritik;
instruerar uttryckligen att det INTE är en faktakoll mot Story Bible,
bara ett hantverksomdöme), `askAboutSelectionUserPrompt` (markerad
passage + kontext) och `askAboutChapterUserPrompt` (hela kapitlet).
Ny handler `askAboutPassage` i `BookStore.tsx`, ny `askPassageAnswer`-
state, nytt menyval "Fråga…" i `ProseCanvas.tsx` (ny `AskState`,
`run("ask")`, `applyAsk`, spegling av Instructs mönster) bakom en ny
valfri `onAskAboutPassage`-prop. Ny `AskAboutPassageCard.tsx` — en
delad overlay för båda ingångarna: öppnad direkt via den nya knappen
("Fråga om kapitlet…" bredvid Analyze) visas en tom frågeruta; öppnad
efter en markerings-fråga visas svaret direkt, med frågerutan fri för
en uppföljning. Ny `"ask-passage"` i `PromptOperation`/`Busy`-unionerna
och i Prompt Inspectorns `operations`-etiketter.

Döpte om en i18n-nyckel under vägen (`askAction` användes först både
för menyvalet OCH skicka-knappen, vilket med den tillagda "…" i JSX
hade gett dubbla prickar "Fråga……" i menyn) — löst genom att följa
samma mönster Beat redan använder: `ask`/`askTitle`/`askHint`/
`askPlaceholder` (meny + overlay) och `askAction` (bara skicka-
knappen, ingen "…").

Ny testfil `tests/core/ask-about-passage.test.ts` (3 tester).
Live-verifierat med Playwright: båda ingångarna (knappen bredvid
Analyze, och markera text → "Fråga…" i menyn) renderar och fungerar
korrekt, inklusive att den markerade texten visas ordagrant i panelen.
`tsc --noEmit`, `npm run build` och hela testsviten (790 tester) gröna.

v1.0.32 → v1.0.33.

---

**Ändringslogg v1.0.31 → v1.0.32 (2026-10-01):** Uppföljning på
testarens arkitektur-kritik av Story Bible (se roadmap-ideas.md #38
för full bakgrund och lösning). Efter två korrigeringar av mig själv
på vägen — först att jag felaktigt trodde att story-tid-positionering
var orsaken till ett missat faktum, sedan att jag felaktigt trodde
att testarens Story Bible var tom när hen bara sa att extraherade
(ej godkända) fakta var för lösa — landade vi i den faktiska
poängen: Patron-sponsringen fanns som fakta, men uppdelad på två
separata lore-artiklar (Patronen själv, och en separat Event-artikel
om själva erbjudandet) som aldrig nämnde varandra med namn, plus en
bredare poäng: Story Bible blandar idag "vad berättelsen redan
etablerat" (chapter/interview-fakta, alltid med, rätt) och
"bakgrundsreferens" (importerad lore, alltid med, fel när mängden
blir stor — sväller prompten och begraver det relevanta).

Mats frågade "Hur stort jobb är det att fixa det?" — svarade med en
grundad uppskattning (måttlig, inte stor: `origin`-fältet fanns redan
från en tidigare session, filtret kunde byggas som ett fristående,
testbart lager ovanpå det utan att röra fact-datamodellen). Mats bad
sedan om ett förslag ("Skissa på ett förslag så tar vi det därifrån")
— jag lade fram två alternativ (A: explicit per-bok-inställning,
default av; B: automatiskt alltid-på baserat på fakta-antal) och
rekommenderade A, med motiveringen att author > AI-principen redan
etablerats för liknande inställningar (`context_window`) och att en
tyst beteendeändring för befintliga böcker vore fel. Mats: "A, kör
med förslaget."

**Implementation.** Ny bok-inställning `filter_lore_by_relevance`
(boolean, default `false`) i `BookSchema.ts`. Ny fil
`src/core/loreRelevance.ts`: `relevantContextText` (samlar kapitlets
brief/prosa/taggade Plotlines, plus scenens egen brief/prosa för en
scen-riktad pass — medvetet INTE Story Bible själv, annars blir all
lore "relevant" mot annan lore), `isLoreFactRelevant` (namn-match mot
entitetens egen label, eller — för en Event-entitet — mot en
deltagare/plats via `EventProfile`, v1.0.27; `position_override:
"include"` vinner alltid), `filterLoreFactsByRelevance` (lämnar
icke-lore-fakta orörda, filtrerar bara `origin: "lore"`). Inkopplat i
`generateProse.ts`s `formatBibleForPromptAtPosition` (Draft, kapitel
+ scen) bakom `book.filter_lore_by_relevance`.

Medveten avgränsning: Extend/Elaborate/Instruct/Beat
(`passageUserPrompt`) använder redan den opositionerade
`formatBibleForPrompt` och nås därför inte av filtret — en redan
existerande inkonsekvens i kodbasen (upptäckt under research för
storleks-uppskattningen), inte något jag försökte fixa här.

Kryssruta i `SettingsPanel.tsx` ("Visa bara relevant lore för Skriv
utkast") med förklarande text, bunden till `book.filter_lore_by_relevance`
via `onPatch`. Tooltip-texten för `position_override`-knappen i
`BiblePanel.tsx` (via i18n) uppdaterad på alla tre språk för att
spegla att "Alltid med" nu även betyder "ignorera relevansfiltret",
inte bara "ignorera story-tid-positionering" som innan — ingen ny
knapp, samma kontroll, bredare betydelse, precis som i förslaget.

Ny testfil `tests/core/lore-relevance.test.ts` (12 tester): icke-lore-
och fakta-utan-`origin` passerar alltid, lore-fakta utan namn-match
filtreras bort, namn-match i kontext-texten behåller fakta,
`position_override: "include"` vinner alltid, Event-fakta behålls via
deltagare eller plats även utan eget namn i texten (täcker
Patron/Event-scenariot exakt), samt `relevantContextText`s
sammansättning av brief/prosa/Plotlines/scen-fält.

Ny roadmap-post #38 i `roadmap-ideas.md` (refererad av kod-
kommentarer redan innan posten skrevs — nu finns den faktiskt).
`tsc --noEmit`, `npm run build` (den riktiga kedjan) och hela
testsviten gröna.

v1.0.31 → v1.0.32.

---

**Ändringslogg v1.0.30 → v1.0.31 (2026-10-01):** Mats: "jag skulle
vilja få in en sektion om hur man gör för att ställa in så att man
kör mot en lokal AI-server som är installerad på det lokala nätet
men inte på min dator." Ny Handbok-sektion, "An AI server on another
computer on the network" (kategorin Hjälp & felsökning), på alla tre
språk.

Research innan text skrevs, inget gissat: läste igenom hela
anslutnings-kedjan i koden (`SettingsPanel.tsx`, `BookStore.tsx`,
`llm/provider.ts`) för att slå fast en viktig, lätt missad detalj —
serveradress-fältet visas ENDAST när motorn är "OpenAI-compatible"
(`engine === "openai-compatible"` i `SettingsPanel.tsx`); väljer man
"Ollama" istället skickas inget `baseUrl` alls till
`OllamaModelProvider` (`BookStore.tsx` rad ~314), så den pekar alltid
mot `localhost:11434` oavsett vad man försöker ställa in. Innebär att
en Ollama-server på en ANNAN dator bara går att nå genom att välja
"OpenAI-compatible"-motorn och peka den mot den andra datorns
`http://IP:11434` (Ollama har ett eget OpenAI-kompatibelt API på
`/v1/chat/completions`, vilket `OpenAICompatibleLocalProvider` redan
antar — `/v1` ska INTE skrivas in av användaren, koden lägger till
det). Verifierade också `assertLocalOnlyBaseUrl` (samma fil) — den
blockerar bara kända molnvärdar, inte LAN-IP:er, så scenariot kräver
ingen kodändring, bara dokumentation.

Verifierade LM Studios faktiska inställningsnamn mot deras egen
dokumentation (`lmstudio.ai/docs/developer/core/server/
serve-on-network`) istället för att gissa: Developer-fliken →
Server-inställningar → "Serve on Local Network" + separat
"Enable CORS"-växel — två olika inställningar, inte en.

Ny sektion `"network-ai-server"` tillagd i `HANDBOOK_SECTION_IDS`/
`HANDBOOK_SECTION_CATEGORY` (`HandbookPanel.tsx`, kategorin "help"),
innehåll i `handbook.sections` i `sv.ts`/`en.ts`/`nb.ts`. Verifierat
live med Playwright (headless Chromium, det globalt installerade
paketet eftersom projektet inte har Playwright som eget
dev-beroende): öppnade Guiden, klickade till Hjälp-kategorin,
bekräftade att rubrik och brödtext renderas korrekt och fullständigt
— skärmdump bekräftar layouten. `tsc --noEmit`, `npm run build` (den
riktiga kedjan) och alla 775 tester gröna.

v1.0.30 → v1.0.31.

---

**Ändringslogg v1.0.26 → v1.0.27 (2026-09-30):** Uppföljning på
schema-diskussionen från förra rundan. Jag lade fram tre öppna
punkter innan jag kodade: (1) ska Event "where"/"participants" vara
fri text eller riktiga kopplingar till befintliga kort — avgörande
för om Location-härledningen ens går att bygga; (2) ska "Description"
gälla alla kategorier eller bara de som saknar motsvarighet idag
(Character har redan Looks+Personality); (3) var syns härledningen
rent konkret. Mats: "Kör på ditt förslag" — dvs riktiga kopplingar,
Description bara där det saknas, ny sektion i Location-kortet.

**Genomfört:**

Character: nya fält **goals** och **fears** i befintlig
`CharacterProfile` (`src/core/characterProfile.ts`) — exakt samma
mönster som Looks/Personality, Draft läser dem på samma sätt.
Ingen "Description" lades till för Character (redan täckt av
Looks+Personality, per punkt 2 ovan).

Event: helt ny sidotabell `EventProfile`
(`src/core/eventProfile.ts`, ny `event_profiles`-array på `Book`) —
**where** (en enda Location-referens) och **participants** (en lista
Character-referenser). Medvetet INGET "when"-fält — det är redan
bättre löst via kapitel/scen/story-time-rank på faktan, ett till
fritextfält där hade bara konkurrerat med det. UI: en `<select>`
för Where, en rad togglingsbara knappar för participants (samma
visuella språk som Character-kortets pronomen-väljare).

Location: INGEN ny lagring alls, per plan — bara en härledd,
skrivskyddad vy ("Events here" / "People here") som läser direkt ur
alla Events egna `where`/`participants`
(`eventsAtLocation`/`participantsAtLocation`-hjälpare i
`eventProfile.ts`). En sak att redigera, ingen synk-risk.

`deleteEntity.ts` fick städning: tar bort en Events egen profil om
Eventet självt raderas, men rensar OCKSÅ `entity_ref` ur andra
Events `participants`/`where` när en Character eller Location
raderas — annars hade Location-vyn kunnat visa en död referens (eller
värre, en helt annan framtida entitet som råkar återanvända samma
slug).

Nya enhetstester: 9 i `tests/core/event-profile.test.ts`
(upsert/tomt-fall/eventsAtLocation/participantsAtLocation), 2 nya i
`tests/core/delete-entity.test.ts` för scrubbnings-beteendet, 1 ny i
`tests/core/character-profile.test.ts` för goals/fears i
Draft-prompten. Fem befintliga testfiler behövde uppdateras (raka
`CharacterProfile`-literaler saknade de nya obligatoriska fälten
— zod `.default()` fyller i vid parsning men TypeScript kräver
fälten explicit på en literal).

Verifierat live med Playwright: skapade Nora (Character) med
Goals/Fears, The Lighthouse (Location), The Storm (Event) — satte
Where till The Lighthouse och togglade Nora som participant, öppnade
sedan Location-kortet igen och såg "Events here: The Storm" /
"People here: Nora" — helt härlett, ingenting dubbelmatat.

Med det här är schema-arbetet från förra rundans diskussion klart.

**Ändringslogg v1.0.25 → v1.0.26 (2026-09-30):** Mats: "Då kör vi på
Synopsis och kapitel/scen-Briefs" — de två återstående
planeringskällorna från v1.0.25-planen.

**Genomfört:** Ingen kärnkod behövde ändras — `origin`-fältet,
`PLANNING_EXTRACTOR_SYSTEM` och `applyExtractorDrafts` var redan
källoberoende sedan Brainstorm-rundan. Bara nya store-funktioner och
UI-krokar:

`extractSynopsis()` i `BookStore.tsx` — samma mönster som
Lore-import: ingen chapter_id/scene_id (Synopsis beskriver hela
berättelsen, inte en position i story time), origin "synopsis".
Knapp i Synopsis-vyns footer, bredvid "Start Chapter N",
inaktiverad tills synopsis har text.

`extractBrief(chapterId, sceneId?)` — här är chapter_id/scene_id
INTE valfritt bortvalt som för Synopsis/Brainstorm, utan medvetet
satt: en brief hör naturligt till ett kapitel (eller en scen), så
precis som Intervju-fakta sedan v1.0.23 attribueras resultatet till
den positionen och går genom samma story-time-grind. En fakta från
en scens egen brief förblir osynlig för Draft till just den scenens
egen omgång; en fakta från kapitlets HELA brief är synlig från
kapitlets första sida (samma "chapter_id utan scene_id"-beteende
som redan fanns). Två UI-krokar för samma funktion: en
"Extract facts"-knapp i vänsterlistans expanderbara kapitel-brief
(`Editor.tsx`, ny `.chapter-brief-extract`-knapp under
`ChapterBriefCopy`), och en i `ScenesPanel.tsx` per scen, bredvid
scenens egen brief-textruta (ny `.scene-brief-extract`). Båda
inaktiverade tills respektive brief-fält har text.

Nya i18n-strängar i alla tre språk: knappetiketter/hintar för
Synopsis och Brief, nya STORE_ERROR-koder
(synopsisExtractorNone/briefExtractorNone), nya busy-lägen
("extract-synopsis"/"extract-brief") och nya PromptInspector-
operationsetiketter. `bible.sources`-mappen (från v1.0.25) täckte
redan "synopsis" och "brief" som nycklar, så inget nytt där.

Verifierat live med Playwright: Synopsis-knappen inaktiverad tom/
aktiverad med text; kapitel-brief-knappen samma (med en fix i
testskriptet självt — klick på `.chapter-brief-toggle` när kapitlet
redan är valt stänger IGEN den brief som chapter-radens egen
onClick redan öppnade, inte en bugg i appen); scen-brief-knappen
samma. Inga krascher vid klick utan ansluten modell (samma
`STORE_ERROR.noModel`-väg som alla andra extraktions-knappar).
Ingen ny kärnlogik att enhetstesta utöver vad `applyExtractorDrafts`-
testerna redan täcker generiskt för godtyckligt `origin`.

Med det här är alla fyra planeringskällor från den ursprungliga
speccen (Brainstorm, Synopsis, kapitel-Brief, scen-Brief) klara,
utöver de tre som redan fanns (Kapitel, Intervju, Lore) — sju
källor totalt in i samma granskningskö. Schema-diskussionen
(gemensam kärna + Event/Location-profil) väntar fortfarande, per
Mats eget beslut i förra rundan.

**Ändringslogg v1.0.24 → v1.0.25 (2026-09-30):** En användares
kommentar (vidarebefordrad av Mats) argumenterade för att appen
"gör för lite för att föra information vidare automatiskt" och
efterlyste ett arbetsflöde: författaren skriver naturligt → AI
extraherar → författaren godkänner → kanon — med Brainstorm →
Synopsis som huvudexempel. Jag höll delvis med (efter att ha läst
`ConsistencyGate.ts`/`extractFacts.ts` fastslog jag att den pipen
redan finns och redan används av Kapitel/Intervju/Lore — luckan var
specifikt att Brainstorm/Synopsis/Briefs saknades som källor) men
nyanserade en separat kommentar om att Story Bible-kategorierna är
"kosmetiska" (bekräftat i kod: `classifyEntity` gissar kind enbart
från vilket predikat en faktas rader råkar använda — inget eget
kind-fält finns, förutom `CharacterProfile` som är ett särfall bara
för Character). Mats gav sedan ett konkret schema-förslag (gemensam
kärna + kategori-specifik struktur, typ Character:
traits/goals/fears, Event: when/where/participants/consequences,
Location: characteristics/inhabitants/relevant events) — jag
föreslog att skala ner det: Facts/Relationships/Source/Canon status
hör redan hemma på FAKTAN, inte entiteten (skulle vara ett steg
bakåt från "facts are never deleted, only superseded"); "traits"
och Event "when" krockar med sådant som redan finns bättre löst
(core.trait-fakta, respektive scen/kapitel-story-time-attribution);
goals/fears (Character) och participants/where (Event) är genuint
nya och konkret motiverade; Location inhabitants/relevant events
bör vara HÄRLEDDA vyer, inte separat lagrade (annars synk-risk).
Mats beslut: bygg extraktions-arbetet (Brainstorm → Synopsis →
Briefs) först, fundera på schemat efteråt. Han sa uttryckligen
"Vi börjar med Brainstorm arbetet".

**Genomfört (Brainstorm-delen, första av tre planerade källor):**

Ny `origin`-fält på `NarrativeFact` (`src/core/NarrativeFact.ts`) —
`"chapter" | "interview" | "lore" | "brainstorm" | "synopsis" |
"brief"`, valfritt, additivt, rent visuellt (påverkar varken
ConsistencyGate eller story-time-grinden, som fortsätter styras av
chapter_id/scene_id/status precis som innan). Trädde genom
`factFromDraft`/`applyExtractorDrafts` (`ConsistencyGate.ts`) som ny
sista valfri parameter. Satte den även på de TRE befintliga
extraktions-anropen (Kapitel → "chapter", Intervju → "interview",
Lore → "lore") i `BookStore.tsx` så käll-etiketten blir konsekvent
för alla källor direkt, inte bara den nya — annars hade
granskningskön sett inkonsekvent ut (vissa fakta med källa, andra
utan, utan anledning).

Ny tredje extraktor-systemprompt, `PLANNING_EXTRACTOR_SYSTEM`
(`src/core/extractFacts.ts`, delar `PREDICATE_GUIDE` — nu exporterad
— med de andra två) för planeringstext: till skillnad från
`EXTRACTOR_SYSTEM` (skriven för redan sann, accepterad prosa)
instruerar den uttryckligen att en spekulativ formulering ("Nora may
discover…") ska extraheras MED sin egen brasklapp kvar i värdet,
inte plattas till en skarp fakta — exakt Mats/användarens exempel.
Följer samma mönster som `INTERVIEW_EXTRACTOR_SYSTEM` redan
använder för brasklapps-svar ("let's say 35").

Ny store-funktion `extractBrainstormNote(noteId)` i `BookStore.tsx`
(ny busy-status `"extract-brainstorm"`) — extraherar en enskild
Brainstorm-lapps text, ingen chapter_id/scene_id (samma resonemang
som Lore-import: en lapp är inte manusprosa, inget "as of" en
story-time-position). Landar i samma granskningskö som allt annat,
aldrig låst direkt.

UI: `BrainstormBoard.tsx` fick en "Extract facts"-knapp per lapp
(i samma rad som färgprickarna, höger-justerad via ny `.idea-note-row`),
inaktiverad tills lappen har text. `BiblePanel.tsx`s `PendingFact`
visar nu en "Source: X"-rad när `fact.origin` är satt.

Nya enhetstester: 3 i `tests/core/consistency-gate.test.ts` för
origin-trådningen (ny fakta, flaggad konflikt, och att avsaknad av
origin inte sätter något — bakåtkompatibelt), 5 i
`tests/core/extract-facts.test.ts` för
`planningExtractorUserPrompt`/`PLANNING_EXTRACTOR_SYSTEM` (bland
annat regressionstestet att "Nora may discover…" måste behålla sin
brasklapp). Verifierat live med Playwright: ny bok, öppnade
Brainstorm, skapade en lapp, knappen inaktiverad tom/aktiverad med
text, klick utan ansluten modell misslyckas snyggt (samma
`STORE_ERROR.noModel`-väg som Kapitel/Intervju redan använder) utan
att krascha.

**Kvarstår** (nästa steg, enligt planen): Synopsis och
kapitel/scen-Briefs som ytterligare två extraktions-källor, samma
mönster. Schema-diskussionen (gemensam kärna + Event/Location-profil)
är medvetet uppskjuten till efteråt.

**Ändringslogg v1.0.23 → v1.0.24 (2026-09-30):** Mats bad mig ge
honom Guide-texten som ren text (satt vid en annan dator utan appen
installerad). Jag klistrade in den. Han föreslog sedan en omskriven
version med Markdown-formatering (`###` underrubriker, `**fet
stil**`, `>`-citat) för bättre struktur och skanningsbarhet, och
frågade vad jag tyckte.

**Ändring:** upptäckte och flaggade att `HandbookPanel.tsx` inte
renderar Markdown alls — `entry.body` läggs rakt in i en `<p
className="handbook-body">` med bara CSS `white-space: pre-line`
(bevarar radbrytningar, inget annat). Markdown-syntax skulle synas
som bokstavliga tecken i appen. Föreslog en anpassad version som
behåller Mats förbättrade struktur (korta "vägmärkes-rader" som
signalerar nya underavsnitt) men uttryckt i vanlig text, samma
mönster som redan används i texten ("Nu väljer du." följt av korta
rader). Mats godkände förslaget ("Ja gör det").

**Genomfört:** skrev om `handbookSections["interview-to-story"]`
(alla tre språk) med den godkända strukturen — fyra tydliga delar:
grundscenariot (lås/lås inte), "När en fakta blir sann senare i
kapitlet" (kapitel-nivå-problemet, samma Marcus-exempel), "Lås
faktan till en specifik scen istället" (den nya lösningen,
konkret steg-för-steg), och "Viktigt: det fungerar bara vid
scenvis Draft" (begränsningen, tydligt avgränsad som egen sista
del istället för en bisats i slutet). Innehållsmässigt oförändrat
mot v1.0.23 — bara omstrukturerat för läsbarhet.

**Ändringslogg v1.0.22 → v1.0.23 (2026-09-30):** Mats läste
förklaringen av kapitel-vs-punkt-nyansen och frågade om man kunde
lösa problemet genom att koppla fakta till en SCEN i kapitlet istället
för hela kapitlet — och bad om en teknisk bedömning av om det var
möjligt. Jag bekräftade att det var görbart (fältet `scene_id` finns
redan på `NarrativeFact` och sattes redan av kapitel-extraktion, bara
oanvänt av story-time-grinden; scenernas egen ordning finns redan i
`chapterScenes`) och förklarade begränsningen: det fungerar bara om
man skriver scen för scen, inte om man drafter hela kapitlet i ett
svep. Mats instruktion: "VI bygger in scenkopplingen och uppdaterar
Guiden så att man får med detta. Kanske med ett exempel som det med
kompisen som upptäcker att hans vän är antagonisten mitt i kapitlet
och hur arbetsgången blir för att lösa problemet."

**Ändring:** `factQualifiesAtPosition`/`visibleLockedFactsAtPosition`
(`src/core/visibility.ts`) tar nu en valfri `scenePosition` — en
scens index plus en karta över det egna kapitlets scen-index
(`sceneIndexById`, ny i `src/core/bookScene.ts`). En fakta från SAMMA
kapitel som drafteringen gäller kvalificerar nu bara om dess egen
`scene_id` ligger på eller före den scen som drafteras — men bara när
ett `scenePosition` faktiskt skickas in, dvs bara för ett scen-för-
scen-Draft (`draftSceneUserPrompt` i `generateProse.ts`, via
`formatBibleForPromptAtPosition`s nya valfria `sceneId`-parameter).
Ett Draft för hela kapitlet (`draftUserPrompt`, ingen `sceneId`) samt
Recast/Proofread/Analyze/Brainstorm/Ask Manuscript (som redan såg hela
Story Bible, utan positionsfiltrering) är helt opåverkade — additiv,
bakåtkompatibel ändring.

UI: `BookStore.tsx` har nu `interviewExtractSceneId` +
`setInterviewExtractPosition(chapterId, sceneId)` (ersätter den gamla
kapitel-bara settern). `CharacterInterviewCard.tsx`s "Från och med"-
väljare (döpt om från "Från och med kapitel" till bara "Från och
med") visar nu, för ett kapitel som delats i 2+ scener, en
`<optgroup>` per kapitel med "Hela kapitlet" plus varje scen — annars
en vanlig platt kapitel-rad precis som innan scener fanns med.
`Editor.tsx` bygger den nästlade kapitel+scen-strukturen via
`chapterScenes` (`@core/bookScene`).

Guiden: skrev om `handbookSections["interview-to-story"]` (alla tre
språk) med Mats eget scenario — en kompis, Marcus, som visar sig vara
antagonisten mitt i kapitel 6 — och den nya arbetsgången: dela
kapitlet i scener vid avslöjandet, plocka ut faktan från Intervjun och
koppla den till avslöjandets egen scen istället för "Hela kapitlet",
skriv sedan scen för scen. Nämner uttryckligen att detta bara hjälper
vid scen-för-scen-Draft — den äldre två-omgångs-lösningen står kvar
för den som föredrar att skriva hela kapitel i ett svep.

Nya enhetstester i `tests/core/visibility.test.ts` (6 st) täcker: en
scen-kopplad fakta från samma kapitel döljs för en tidigare scen och
visas från och med sin egen scen; en fakta utan `scene_id` förblir
kapitel-nivå-synlig oavsett scen; ett `scenePosition` ignoreras helt
för hela-kapitel-Draft och för fakta från tidigare kapitel; en
`scene_id` som inte går att slå upp i kapitlets egen scenlista faller
tillbaka till synlig (fail-open, samma princip som `chapter_id` utan
matchande rank). Verifierat live med Playwright: nytt manus, kapitel
delat i två scener, ny karaktär, Intervju öppnad, "Från och med"-
väljaren visar korrekt `<optgroup>` med "Hela kapitlet"/"Scen 1"/den
namngivna scenen, och valet av scenen slår igenom i UI:t.

**Ändringslogg v1.0.21 → v1.0.22 (2026-09-30):** Mats bad mig
dokumentera kapitel-vs-punkt-nyansen i Guiden, med sitt eget exempel:
huvudpersonen träffar en vän i kapitel 4 och får mitt i kapitlet
reda på att vännen skadat hans fru — kapitlet ska inledas som om de
är vänner, dynamiken vänder mitt i.

**Ändring:** utökade `handbookSections["interview-to-story"]` (alla
tre språk) med ett nytt stycke om detta — generaliserat exempel
("kapitel 6", "gammal vän", "skadat hans fru", matchar Mats scenario
utan att använda hans faktiska karaktärsnamn), som förklarar att en
låst fakta hör till HELA kapitlet, inte en punkt i det, och ger den
praktiska rekommendationen: vänta med att låsa till efter vändningen
är skriven, eller skriv kapitlet i två omgångar.

**Ändringslogg v1.0.20 → v1.0.21 (2026-09-30):** Uppföljning på
förra svaret om story-time. Mats konkreta exempel: han frågar Henrik
vem han gillar mest av Maja och Lena — men Henrik träffar dem först
i kapitel 4. Om Mats råkar ha fel kapitel öppet när han extraherar
fakta blir den faktan felaktigt "sann" redan från det öppna
kapitlet, enligt Draft. "Vet inte hur vi löser det."

**Grundproblemet:** till skillnad från kapitel-extraktion (där
käll-kapitlet ÄR den naturliga story-time-positionen, eftersom
faktan bokstavligen kom från den textens prosa) har en
Intervju-extraktion inget naturligt kapitel att höra till — den
kommer från ett fristående samtal. Koden gissade tyst: "vilket
kapitel råkar vara öppet i redigeraren just nu" (`chapterRef.current`
i `extractInterview`, `BookStore.tsx`), med kapitel 1 som reservval.
Helt osynligt för författaren, och kan bli fel exakt på det sätt
Mats beskriver.

**Fix:** gjorde det tysta gissandet till ett synligt, ändringsbart
val istället för att gissa bättre (det finns inget sätt att gissa
rätt här — bara författaren vet när i berättelsen en sådan fakta
faktiskt blir sann).

- Ny `<select>` "As of chapter" i Intervju-fönstrets header, före
  "Extract facts"-knappen — lista kapitlen i STORY TIME-ordning
  (inte manusets sidordning, via `timelineEntries(book)` från
  `@core/timeline`, som redan användes av Timeline-funktionen) så
  att man kan välja "kapitlet där de faktiskt möts" oavsett var det
  ligger i manuset.
- Nytt state `interviewExtractChapterId` i `BookStore.tsx` —
  initieras till samma default som förut (öppet kapitel, annars
  första kapitlet) när Intervjun startar, men är nu en explicit,
  synlig, ändringsbar variabel istället för att läsas direkt ur
  `chapterRef.current` vid extraktionstillfället.
- `extractInterview` använder `interviewExtractChapterId` (med
  samma gamla fallback-kedja kvar som skyddsnät).
- Ny CSS `.interview-extract-chapter` — kompakt etikett + select
  som får plats i header-raden utan att tränga undan
  Extract facts/Close-knapparna.
- Verifierat live i webbläsare: två kapitel skapade, dropdown visar
  båda med rätt titlar i rätt ordning, default matchar det öppna
  kapitlet, byte av val fungerar (`inputValue()` ändras korrekt).

**Ändringslogg v1.0.19 → v1.0.20 (2026-09-30):** Mats fråga: varför
flaggade extraktorn "prefers being with one special person at a
time" (Henrik, Trait) som en konflikt mot den redan låsta faktan
"heterosexual" — och borde man kunna välja "merge" eller "Add to
fact" och själv justera om det visar sig att de faktiskt inte
krockar?

**Grundorsak:** `evaluateCandidate` (`ConsistencyGate.ts`) kan bara
konstatera "samma entitet + samma predikat + olika värde" — den har
ingen semantisk förståelse. `core.trait` är en bred samlingskategori
(ålder, relationsstatus, sexuell läggning, vana, preferens — vi
breddade själva den beskrivningen tidigare i den här sessionen!) som
avsiktligt ska kunna hålla MÅNGA oberoende sanna påståenden samtidigt
för samma karaktär. Men gaten antar att en ny avvikande fakta under
samma entitet+predikat måste vara en rivaliserande beskrivning av
SAMMA sak — antingen en omskrivning (≥60% delade ord,
`isPossibleEnrichment`) eller en riktig konflikt. "heterosexual" och
"prefers being with one special person" delar noll ord, så den föll
igenom till `flagged_conflict` — trots att det är två fullkomligt
orelaterade, icke-motstridiga fakta.

**Fix, matchar exakt Mats eget förslag:** ny funktion
`keepFactSeparate(facts, factId)` i `ConsistencyGate.ts` — låser den
flaggade faktan UTAN att supersede:a faktan den flaggades mot, och
rensar `conflict_with`/`is_merge_suggestion`. Detta är samma
"flera samtidiga rader under ett predikat"-mekanism som
`applyAuthorAddition` redan stödjer för manuell inmatning
(dokumenterat i dess egen kommentar sedan tidigare) — nu nåbar från
granskningskön också. Ny knapp "Keep both" i `PendingFact`, mellan
Lock/Merge och Reject, synlig när faktan har en `against`-konflikt
(både riktiga konflikter och feltända merge-förslag). Respekterar
en redigerad textarea precis som Lock/Merge redan gör (kör
`reviseFact` först om värdet ändrats).

Ny store-action `keepSeparate(factId, value?)` i `BookStore.tsx`,
tillagd i `BookStoreValue`-typen i `useBookStore.ts`. Tre nya tester
i `tests/core/consistency-gate.test.ts`: låser utan att röra
motparten, rensar konflikt-fälten, no-op på en icke-flaggad fakta.
Verifierat visuellt mot Mats exakta exempel (Henrik/Trait/
"prefers being with..."/"Conflicts with: heterosexual") via en
DOM-injektion mot den byggda CSS-filen — layouten Lock / Keep both /
Reject ser ut precis som tänkt.

**Ändringslogg v1.0.18 → v1.0.19 (2026-09-30):** Mats skickade en
skärmdump av granskningskön (fungerade nu, tack vare v1.0.17:s
z-index-fix) med tre önskemål: rubriken "REVIEW" + Close försvann ur
bild när man scrollat ner i en lång lista; fälten för föreslagen
fakta kunde bli ~33% lägre (aldrig sett en fakta längre än några
ord); titeln till "REVIEW FACTS".

**Fix:**
- `ReviewOverlay` (`BiblePanel.tsx`) wrappar nu sitt innehåll
  (ledetext + fakta-lista) i en ny `<div className="bible-review-scroll">`.
  Ny CSS: `.edit-card.bible-review-card` blir `display:flex;
  flex-direction:column` med `max-height: min(88vh, 42rem)`, huvudet
  (`.bible-card-head`) `flex:0 0 auto` (fast), och
  `.bible-review-scroll` `flex:1 1 auto; overflow-y:auto` (det enda
  som scrollar). Tidigare scrollade hela `.edit-card` som ett block
  (ingen höjdgräns fanns) — troligen sidans egen scroll snarare än
  en intern scrollyta, vilket tog rubrik och Close-knapp med sig.
  Verifierat med en syntetisk DOM-injektion (12 fejkade
  fakta-förslag, scrollat listan 5000px): huvudet stannar kvar inom
  viewport (`getBoundingClientRect()` bekräftar) medan listan
  scrollar under.
- `PendingFact`s textarea: `rows={3}` → `rows={2}` — en exakt 33%
  minskning, matchar Mats siffra rakt av.
- `m.bible.review`: "Review" → "Review facts" (alla tre språk;
  `m.bible.reviewCount` — den lilla räknaren-knappen i
  Story Bible-rutan — rör ordet "Review" separat och lämnades orörd).

**Ändringslogg v1.0.17 → v1.0.18 (2026-09-30):** Mats skickade en
skärmdump: vänsterkolumnen (titel, porträtt, personlighet) hade fått
en egen scrollbar. Två önskemål till: gör hela rutan högre istället,
och låt Enter skicka frågan (radbyte ska vara Shift+Enter).

**Grundorsak till scrollbaren:** porträttet (v1.0.16) la till
ungefär en kolumnbreddss höjd (`aspect-ratio: 1` i en 16rem bred
kolumn ≈ 256px) till `.interview-info`s innehåll, men
`.interview-card`s höjd var fortfarande kvar på `min(90vh, 44rem)`
från v1.0.4. Uppmätte exakt via en Playwright-körning mot en riktig
karaktär med uppladdad bild: `.interview-info` behövde 700px men
hade bara 627px tillgängligt — 73px för lite.

**Fix:** `height: min(90vh, 44rem)` → `min(92vh, 50rem)` (+96px,
med marginal). Verifierade efteråt med samma mätmetod:
`infoScrollHeight === infoClientHeight` (723 === 723,
`needsScroll: false`) — vänsterkolumnen behöver inte längre scrolla
alls, med porträtt inkluderat.

**Enter-att-skicka:** `onKeyDown` på fråge-textarean i
`CharacterInterviewCard.tsx` — Enter (utan Shift) avbryter
standardbeteendet (radbyte) och anropar
`event.currentTarget.form?.requestSubmit()` istället, vilket kör
exakt samma `onSubmit`-logik som redan fanns (trimning,
busy/blocked-koll) snarare än att duplicera den. Shift+Enter
lämnas orört (radbyte som vanligt). Verifierat programmatiskt: text
skriven, Shift+Enter behöll båda raderna i fältet, vanlig Enter
tömde fältet (dvs. submit kördes) utan att lägga till ett tredje
radbyte.

**Ändringslogg v1.0.16 → v1.0.17 (2026-09-30):** Två önskemål: gör
"Extract facts"-knappen orange/tydligare, och ett verkligt fel —
"den fakta som extraheras läggs för godkännande i en ny ruta som
ligger under intervjun så man ser den inte."

**Grundorsak till det andra:** `BiblePanel.tsx` (rad ~99-102) har en
`useEffect` som öppnar granskningskön (`overlay: {type: "review"}`)
automatiskt så fort `pending.length` ökar — dvs. varje gång nya
`ai_proposed`/`flagged`-fakta dyker upp, oavsett vad användaren just
då tittar på. Både den rutan och Interview-kortet renderas som
`.edit-overlay` med samma `z-index: 50` — vilken som hamnar överst
avgörs då enbart av DOM-ordning. Eftersom `BiblePanel` (som äger
granskningskön) monteras tidigare i `Editor.tsx`s träd än
Interview-kortet, förlorade granskningsrutan alltid den kampen när
den triggades medan Interview redan var öppet: den öppnades
bokstavligen bakom, helt osynlig — inte bara lätt att missa.

**Fix:** `ReviewOverlay` (i `BiblePanel.tsx`) skickar nu
`className="bible-review-card"` till sin `OverlayCard`. Ny CSS-regel
i `styles.css`: `.edit-overlay:has(.bible-review-card) { z-index:
60; }` — granskningsrutan vinner nu alltid stapelordningen, oavsett
DOM-position, eftersom den reagerar på något som just hänt snarare
än något författaren själv öppnade. Verifierade mekaniken isolerat
(en fristående HTML-fil mot den byggda CSS-filen, granskningsrutan
FÖRST i DOM men ändå överst i skärmdumpen) eftersom ett riktigt
end-to-end-test hade krävt en körande lokal modell för att faktiskt
trigga extraktionen.

"Extract facts"-knappen (`CharacterInterviewCard.tsx`) bytte
`className` från `"text-button"` till `"primary"` — samma
orange/rost-knapp som "Ask", "Create", "Lock into Story Bible" m.fl.
redan använder (appens `--ink`-token är faktiskt en rostfärg, inte
svart, trots namnet). Verifierat live i webbläsare.

**Ändringslogg v1.0.15 → v1.0.16 (2026-09-30):** Mats skickade en
mockup (en skärmdump från Pinterest, med "Spara"-märket och krysset
i hörnet kvar — irrelevant, det visade bara VAR bilden skulle sitta):
ett stort porträtt av Lena högst upp i infokolumnen, mellan titeln
"Interview Lena" och ledetexten. Önskemål: platshållare om
personen/platsen saknar bild.

**Byggt:** Ny `EntityPortrait`-komponent i
`CharacterInterviewCard.tsx`, syskon till den redan existerande
`CharacterAvatar` (den lilla runda chatt-avataren) — samma
fallback-princip (initialbokstav) men i stor fyrkantig form
(`aspect-ratio: 1`, `border-radius: 8px`, `object-fit: cover`).
Placerad mellan `<h2>`-titeln och lede-paragrafen i
`.interview-info`, matchar mockupens ordning exakt.

Bilddatan fanns redan tillgänglig: `picturesFor(book.media,
entity.ref)[0]` (samma funktion som redan användes för den lilla
chatt-avataren via `thumbDataUrl`) har också ett `imageDataUrl`-fält
(fullstorlek, inte nedskalad thumb) — bättre lämpat för ett stort
porträtt. `Editor.tsx` läser nu båda ur samma `picturesFor(...)[0]`-
anrop istället för att anropa det två gånger.

Verifierat live i webbläsare med en full flödestest (Playwright):
skapade ett testmanus, skapade en ny karaktär "Lena" via Story
Bible, öppnade Interview utan bild → platshållaren visade "L"
exakt där mockupen visade bilden. Laddade sedan upp en (1×1 pixel,
bara för teknisk verifiering) testbild via karaktärskortets egen
bilduppladdning, öppnade Interview igen → `<img>` fyllde samma ruta
korrekt via `object-fit: cover`. Båda kodvägarna bekräftat
fungerande, inte bara typkontrollerade.

**Ändringslogg v1.0.14 → v1.0.15 (2026-09-29):** Mats: "ska man kunna
öppna och stänga rutan? Det är väl inte så ofta man byter Engine och
modeller... Då är det dumt att de tar upp plats i onödan." Rimlig
poäng — helt rätt att kontrollerna inte behöver synas varje besök
när allt redan fungerar.

**Byggt:** Följde samma mönster som `ScenesPanel.tsx` redan
etablerat i kodbasen (en `<button>` med en `▾`/`▸`-chevron,
`aria-expanded`, `useState`) istället för att uppfinna ett nytt.
`connectOpen` är `boolean | null` — `null` betyder "inget explicit
val gjort än" och då styr ett smart default: öppen så länge inget är
anslutet eller något är fel (`!connected`), ihopfälld så fort det
fungerar (`connected = models.length > 0 && !ollamaError`). En
manuell klick sätter `connectOpen` till ett riktigt booleskt värde
som sedan alltid vinner över defaultet, resten av sessionen (ingen
localStorage-persistens — bedömde det som onödigt för en så liten,
session-lokal preferens).

Statusraden (felmeddelande eller "Ansluten — N modeller hittade" /
"Inte ansluten än") ligger UTANFÖR den infällbara delen och syns
alltid, ihopfälld eller inte — bara själva Engine/serveradress/
modellväljarna göms undan. Så man ser alltid läget på en snabb blick
utan att behöva fälla ut något.

Ny CSS: `.home-connect-toggle` + återanvänd `.chevron`-klassen
(redan använd i `ScenesPanel.tsx`, `Editor.tsx` på två ställen — ny
scopad regel `.home-connect-toggle .chevron` följer samma mönster
som `.scenes-panel-toggle .chevron`).

Verifierat live i webbläsare: default-läget öppet när inget är
anslutet, kollapsar korrekt vid klick, öppnar igen vid nytt klick.

**Ändringslogg v1.0.13 → v1.0.14 (2026-09-29):** Rent utseende-polish
på anslutningsrutan, tre önskemål: samma ljusa färg som
manuskript-korten, full bredd som texten ovanför, större mellanrum
till "Start a new manuscript".

**Hittade en egen bugg under tiden:** `.home-connect` hade redan satt
`max-width: none` sedan v1.0.12, men rutan renderade ändå ut vid
~36rem — en cascade-krock jag inte märkte då. Elementet hade BÅDA
klasserna `settings-block home-connect`, och `.settings-block {
max-width: 36rem; }` ligger längre ner i `styles.css` än
`.home-connect` — vid lika specificitet (båda enkla klass-selektorer)
vinner den som deklareras sist i filen, oavsett klassordning i JSX.
Så `.settings-block`s 36rem vann hela tiden över mitt eget
`max-width: none`.

**Fix:** Tog bort `settings-block` från `Home.tsx`s
`<section>`-element helt — `.home-connect` behövde ingen av
`.settings-block`s regler (max-width, margin-top), bara sina egna.
Ny `.home-connect`: `margin: 1.4rem 0 2.2rem` (större gap nedåt till
nästa rubrik), `background: var(--panel)` (samma token som
`.book-card` använder — tidigare `var(--wash)`, en tonad
accent-färg, inte samma som manuskript-korten). Ingen `max-width`
alls nu, så rutan fyller samma bredd som resten av sidans
innehållskolumn (`new-book-row`, header-raden).

Verifierat live i både mörkt och ljust tema (Playwright, klickade
temaväxlaren för att tvinga fram `data-theme="light"` eftersom
`colorScheme` i Playwright bara styr `prefers-color-scheme`, inte
appens egen lagrade tema-inställning) — ljust tema matchar nu exakt
Mats skärmdump.

**Ändringslogg v1.0.12 → v1.0.13 (2026-09-29):** Mats testade
v1.0.12 live (skärmdump: Ollama ansluten, 10 modeller hittade,
Writing/Review ifyllda) och påpekade det uppenbara: nu när
anslutningsrutan faktiskt fungerar är de tre gamla förklarande
korten under den ("Install a local AI server" / "Choose your AI
model" / "Connect it to StoryBook AI") bara dubbelarbete.

**Ändring:** Tog bort `<section className="home-quickstart
guide-quickstart-block"><QuickstartCards .../></section>` från
`Home.tsx` helt (inklusive den nu döda `.home-quickstart`-CSS-regeln).
`QuickstartCards`-komponenten själv rörs inte — den används
fortfarande av samma "Connect a local AI"-knapp i Guide/Handbook
(inte omgjord den här omgången, se v1.0.12:s anteckning om det).

Kortens enda unika information — var man hittar Ollama om man inte
redan har en lokal server (gratis, ollama.com, sök "stheno" för en
skönlitteratur-anpassad modell) — flyttades in i anslutningsrutans
egen "inte ansluten"-text istället för att bara försvinna, i alla
tre språk.

Verifierat live i webbläsare igen (samma Playwright-uppsättning):
sidan är nu tydligt renare, ingen dubblering, inga nya konsolfel.

**Ändringslogg v1.0.11 → v1.0.12 (2026-09-29):** Uppföljning på de
två IA-frågorna som flaggades i v1.0.11 istället för att gissas på.
Mats fick två alternativ (lätt anslutningsruta direkt på startsidan,
eller auto-skapa ett tomt manus och hoppa till Settings) och valde
det förra uttryckligen som "Rekommenderas".

**Nyckelinsikt som gjorde detta enkelt:** `engine`, `baseUrl`,
`model`, `reviewModel` och `models` är redan GLOBALA — lagrade i
`localStorage` (`readEngine()` m.fl. i `BookStore.tsx`), inte kopplade
till något specifikt bokobjekt. Modellpolling
(`listEngineModels(engine, baseUrl)`, `BookStore.tsx:329-358`) körs
redan oberoende av om en bok är öppen, eftersom `useBookStore()` är
en enda context-hook som `Home` och `Editor` båda läser från. Ingen
arkitekturändring behövdes alls — bara UI på rätt ställe.

**Byggt:**
- Ny sektion "Connect a local AI" direkt på `Home.tsx`, mellan
  ledetexten och "Start a new manuscript" — Engine-väljare,
  serveradress-fält (när LM Studio/annan server är vald), en
  statusrad (återanvänder befintlig `ollamaHint`/`translateError`
  för fel, annars "Ansluten — N modeller hittade" eller "Inte
  ansluten än"), och Writing/Review-modellväljare när modeller
  hittats.
- `ModelSelect` (tidigare en privat funktion i `SettingsPanel.tsx`)
  exporterad och återanvänd på Home istället för att dupliceras.
- Nya i18n-nycklar `home.connectFound`/`home.connectNotFound` i
  alla tre språk.
- Verifierat live i webbläsare (Playwright, headless Chromium från
  `/opt/pw-browsers`) mot en riktig `npm run dev`-körning: sektionen
  renderar rätt under headern, Engine-växling till "LM Studio / other
  local server" visar serveradress-fältet korrekt, och utan en
  körande lokal server visas det befintliga CORS-felmeddelandet som
  förväntat — inga konsolfel utöver de väntade anslutningsfelen mot
  en server som inte finns i den här sandlådan.
- Den gamla "Connect a local AI"-knappen i Guide/Handbook (som bara
  öppnar textkorten) rördes INTE den här omgången — medvetet
  avgränsat, eftersom Mats fråga specifikt gällde att lägga
  kontrollerna på startsidan, inte att skriva om den knappens eget
  beteende (den är dessutom delad mellan Home- och
  Editor-kontexten, vilket gör en context-medveten omskrivning till
  en separat, större fråga).

**Ändringslogg v1.0.10 → v1.0.11 (2026-09-29):** En extern testares
UX-feedback (nio punkter, relayerad av Mats) — verifierade var och
en mot koden via en Explore-agent innan något fixades. Tre av de sex
konkreta punkterna åtgärdade direkt (rena, avgränsade fixar); två
(global åtkomst till Settings innan ett manus finns, "Connect a
local AI"-knappens navigering) flaggade tillbaka till Mats som en
IA-fråga som förtjänar ett beslut snarare än en gissning.

**1. Terminologi-krock i Brainstorm (åtgärdad):** `brainstormLede`
sa "Drag a note into the send column when it should become plot" —
men ingen kolumn heter "send" (den heter "To synopsis"), och appen
har dessutom en helt separat funktion som faktiskt heter
"Plotlines". "become plot" pekade alltså mot fel funktion, inte
bara en synonym-otydlighet. Omskriven i alla tre språk (en/sv/nb)
för att namnge den faktiska kolumnen istället.

**2. Långa Brainstorm-lappar bröt layouten (åtgärdad):** en ~400
ord lång lapp i "Till synopsis"-kolumnen hade inget tak på höjden
någonstans i kedjan (`.idea-send-note`, `.idea-note-copy`,
`.chapter-brief-text` — alla bara `min-height`), så den växte och
fyllde hela den smala 17.5rem-kolumnen, och alla andra lappar sköts
utanför synligt område; kolumnens egen `overflow:auto` blev den
enda scrollytan. Ny regel `.idea-send-note .idea-note-copy {
max-height: 10rem; overflow-y: auto; }` — bara textytan i just
"Till synopsis"-kolumnen får sin egen scroll, resten av appens
lappar (fria brädet) opåverkade.

**3. Ingen "tillbaka"-knapp från Settings (åtgärdad):** enda vägen
ut var logotypen i headern, som stänger hela manuset och tar en
till hyllan — inte bara Settings-panelen. En osynlig alternativ väg
fanns (klicka ett kapitel i sidopanelen, som förblir synlig och
klickbar), men testaren hittade den aldrig på egen hand. Ny explicit
"← Back to manuscript"-länk högst upp i `SettingsPanel.tsx`, kopplad
till `store.setChapterId(chapter.id)` — samma mekanism som att
klicka ett kapitel i sidopanelen, fast synlig och namngiven.

**4–5. "Connect a local AI" öppnar bara text, tar inte till
Settings — och Settings går inte att nå innan ett manus finns
(inte åtgärdade, flaggade till Mats):** dessa två hänger ihop.
Knappen på startsidan öppnar bara ett textmodal (tre steg-kort) som
i sista steget SÄGER åt användaren att gå till Settings → Models
manuellt, men länkar aldrig dit — för att den destinationen inte
existerar än. `SettingsPanel` renderas bara inuti `Editor`, som i
sin tur bara monteras när ett bok-objekt finns (`App.tsx`: `book ?
<Editor/> : <Home/>`). Att fixa knappen på riktigt kräver alltså
ett arkitekturbeslut (global Settings-yta oberoende av manus? eller
auto-skapa ett tomt manus vid "Connect a local AI"?) — inte en
gissning, så frågan gick tillbaka till Mats istället för en snabb
patch som bara flyttar problemet.

**Ändringslogg v1.0.9 → v1.0.10 (2026-09-29):** Första gången det
faktiska råa modellsvaret var synligt (tack vare v1.0.9:s
AI-kontext-utökning) — och det löste gåtan på riktigt, ingen mer
gissning.

**Vad Mats klistrade in:** Interviju-objektet var den här gången
"Henrik's apartment" (en plats, inte en karaktär!) och modellen
svarade i tredje person: "Henrik's apartment is generally tidy,
though perhaps not spotless..." — helt korrekt enligt
`characterInterviewSystem`, som bara svarar i jag-form för
`kind === "characters"`; platser/objekt/grupper/händelser/koncept
får tredjepersons-narration istället. Extraktorns råa svar var:
```json
[
    {"entity_label": "Henrik's apartment", "predicate": "core.trait", "value": "tidy"},
    ... 4 rader till ...
]
```
— en giltig JSON-array, bara utan `{"facts": [...]}`-omslaget som
promptens formatexempel visar.

**Två separata buggar hittade:**
1. **Den faktiska orsaken till tomma resultat:** `recoverJsonObject`
   antog alltid att svaret börjar med `{` och letade `start =
   body.indexOf("{")` — men i en bar array är det FÖRSTA `{`-tecknet
   inne i första array-elementet, inte array-öppningen `[` (som kom
   före). Resultatet: `body.slice(start, end+1)` skar ut flera
   kommaseparerade objekt utan omslutande hakparentes — ogiltig JSON,
   `JSON.parse` kastade. Och eftersom `recoverTruncatedFacts` fick
   samma `body.slice(start)` (som redan klippt bort den ledande `[`),
   kunde inte ens räddningslogiken hitta något att rädda — noll fakta,
   trots att svaret innehöll fem giltiga.
2. **En rent felaktig instruktion, hittad i samma genomläsning:**
   `INTERVIEW_EXTRACTOR_SYSTEM` påstod rakt ut "The interviewee's
   turns are in the first person" — sant bara för karaktärer, falskt
   för platser/objekt/etc. Skadade inte i det här fallet (narrationen
   namngav "Henrik's apartment" varje gång ändå), men var en tickande
   bomb för ett mindre tydligt tredjepersons-svar.

**Fix:**
- `recoverJsonObject` (`src/core/extractFacts.ts`) hittar nu vilken
  hakparentes — `{` eller `[` — som kommer FÖRST i svaret och
  tolkar det som toppnivåbehållaren. En bar array parsas direkt och
  wrappas i `{facts: [...]}`. Förenklade samtidigt räddningsvägen:
  `recoverTruncatedFacts` letar redan själv upp sin egen `[`, så hela
  `body` skickas dit oavsett form — ingen `.slice(start)` behövs
  längre, vilket också var roten till att räddningen misslyckades.
- `INTERVIEW_EXTRACTOR_SYSTEM` och `interviewExtractorUserPrompt`
  omskrivna för att täcka BÅDA fallen (jag-form för karaktärer,
  tredje person för platser/objekt/grupper/händelser/koncept) istället
  för att bara anta det förra.
- Nya tester i `tests/core/extract-facts.test.ts`: bar array (hela
  och trunkerad), samt att prompten nämner "third person" och
  "place, object, group, event, or concept".

**Ändringslogg v1.0.8 → v1.0.9 (2026-09-29):** Tre rundor in i samma
extraktions-tråd blev det uppenbart att jag gissade blint på
prompt-formuleringar utan att någonsin se vad den lokala modellen
faktiskt svarade — bara symtom relaterade via chatten (skärmdumpar
av UI:t, aldrig den råa modelltexten). Mats frågade var "Prompt
debug"-panelen fanns. Vid närmare koll (`PromptInspector.tsx`) visade
det sig att den panelen ("Visa AI-kontext…" i Settings) bara någonsin
visat vad som **skickades** till modellen — system- och
användarprompten — aldrig vad som kom tillbaka. Den hade alltså inte
hjälpt även om Mats hittat den; ett löfte jag gav som inte stämde.

**Fix:** `PromptDebugEntry` (`src/ui/promptDebug.ts`) fick ett nytt,
valfritt `response`-fält. Ny `recordPromptResponse(raw)`-funktion i
`BookStore.tsx`, kopplad in enbart i `extractInterview` och
`extractChapter` (fakta-extraktion, tråden vi faktiskt felsöker) —
sparar modellens råa svar direkt efter att det kommit tillbaka.
Övriga ~20 anropsställen som använder `recordPrompt` rörs inte alls;
de saknar helt enkelt `response` och panelen visar bara inget extra
för dem, precis som innan. `PromptInspectorCard` visar nu en ny
sektion "Vad modellen svarade (rått, oredigerat)" när fältet finns.
Medvetet scope-begränsat till just extraktion — inte ett
generellt "spela in alla svar"-system, bara den enda funktionen där
blind gissning just nu faktiskt stoppar upp felsökningen.

**Ändringslogg v1.0.7 → v1.0.8 (2026-09-29):** Efter v1.0.7 kom det
vänliga meddelandet ("Extractor found no stated facts in this
conversation") istället för det rå felet — så den delen av fixen
fungerade. Men testaren: "Det fanns fakta som inte fångades upp."
Skärmdumpen: Henrik hade precis sagt "I'm in my mid-thirties, let's
say 35" och "No, I don't have a girlfriend... it's been a while
since my last relationship ended." Två tydliga, konkreta fakta —
ålder och relationsstatus — och extraktorn returnerade fortfarande
`{"facts":[]}`. Inte längre ett formatfel (giltig JSON, bara tom),
alltså ett rent kategoriserings-/tolkningsproblem.

**Trolig grundorsak, två separata luckor i prompten:**
1. `core.trait` beskrevs bara som "a stable characteristic" — ingen
   av exemplen i prompten nämnde ålder eller relationsstatus, så en
   svagare modell hade inget att luta sig mot när den skulle avgöra
   om det passade in någonstans i taxonomin alls.
2. Henrik hedgar sitt eget svar ("let's say 35", "in my
   mid-thirties") — vardagligt och naturligt, men regeln "No
   metaphor, mood, subtext, or guesses" kan mycket väl ha fått
   modellen att tolka hans egen hedge som en osäkerhet den själv
   inte fick "gissa" på, istället för att inse att det är Henriks
   egen formulering av ett fakta han faktiskt påstår.

**Fix:**
- Bröt ut en delad `PREDICATE_GUIDE`-konstant i
  `src/core/extractFacts.ts` som både `EXTRACTOR_SYSTEM` (kapitel/
  lore) och `INTERVIEW_EXTRACTOR_SYSTEM` nu bygger sin
  predikatbeskrivning från — enda källan, så de inte glider isär
  igen. `core.trait` nämner nu uttryckligen "an age, a relationship
  status, an occupation, a physical trait" som exempel.
- `INTERVIEW_EXTRACTOR_SYSTEM` fick en ny mening som säger rakt ut
  att en hedgad/ungefärlig egen-beskrivning fortfarande ska
  extraheras, i den intervjuades egna ord.
- Nya tester i `tests/core/extract-facts.test.ts` för båda
  tilläggen.

**Ändringslogg v1.0.6 → v1.0.7 (2026-09-29):** Testaren körde om direkt
efter v1.0.6 (ny fråga: "what is your favourite food?", nytt svar från
Henrik, tydligt fortfarande i jag-form och med samma sorts konkreta
fakta). Den här gången kom inte det tidigare "hittade inga fakta"-
meddelandet, utan en helt annan, teknisk text direkt i UI:t:
"Extractor returned no JSON object."

**Grundorsak, två delar:**
1. Det är en rå, oöversatt JS-felsträng — `recoverJsonObject` i
   `src/core/extractFacts.ts` kastar det felet när modellens svar inte
   innehåller någon `{`/`}` alls att tolka som JSON, och `extractInterview`
   (liksom `extractChapter`) lät felet studsa vidare genom `ollamaHint`
   rakt ut till författaren istället för att visa samma vänliga
   "hittade inga fakta"-text som det tomma-facts-fallet redan har.
   Ur författarens perspektiv är de identiska händelser (inga
   användbara fakta kom ut), men bara den ena vägen gav en begriplig
   text.
2. Trolig bidragande orsak till att modellen inte producerade JSON
   alls: v1.0.6:s nya prompt hade en regel med ett undantag ("Skip
   small talk... but a concrete stated preference... is a fact, not
   small talk") — just den sortens nyanserade "men inte om"-regel är
   känd för att få svagare lokala modeller att börja resonera i
   klartext istället för att committa till det strikta JSON-formatet.
   En rimlig, inte helt säker, bidragande faktor.

**Fix:**
- `extractInterview` och `extractChapter` fångar nu ett
  parse-fel från `parseExtractorPayload` och behandlar det som en tom
  träfflista (`drafts = []`) istället för att låta felet studsa vidare
  — samma vänliga meddelande som tidigare för "hittade inget".
- `INTERVIEW_EXTRACTOR_SYSTEM` förenklad: tog bort undantagsregeln,
  la istället till en sista, explicit rad: "Respond with the JSON
  object and nothing else... even when the answer is {"facts":[]}."
  — placerad sist eftersom modeller generellt följer instruktioner
  närmast själva genereringen mer pålitligt än sådana som bara står
  först i prompten.
- `import-lore`-vägen (samma bakomliggande risk) rördes inte den här
  omgången — dess felhantering är redan strukturerad kring delvis
  lyckade batchar artikel för artikel, och en motsvarande fix där
  förtjänar egen eftertanke snarare än att buntas in här.

**Ändringslogg v1.0.5 → v1.0.6 (2026-09-29):** Ny buggtråd, inte samma
som Interview-visningsbuggen. Testaren: "Extract facts gick inte så
bra... Trots att texten inte var så lång och det fanns fakta i
Henriks svar" — och sen konkret: "Jag fick inga fakta". Skärmdumpen
visade Henriks svar på "what is you favourite food": "As a Swedish
guy, I gotta say my favorite food is definitely meatballs with
lingonberry jam... My mom used to make the best, just like my
grandmother taught her." Tydliga fakta (favoritmat, mammans/farmors
tradition) — men noll extraherades.

**Grundorsak:** `extractInterview` återanvände samma `EXTRACTOR_SYSTEM`
som kapitel-extraktion och lore-import — en prompt skriven för
tredjepersons berättartext ("accepted prose"). Men
`characterInterviewSystem` instruerar alltid karaktären att svara i
jag-form ("Answer every question in the first person, as yourself").
Transkriptet som skickades till extraktorn var alltså rader som
"Henrik: My favorite food is..." — och ingenstans stod det att "my"
i en sådan rad ska tolkas som en fakta om Henrik. En mindre lokal
modell (som testarens) har svårare att dra den kopplingen själv än
en stor molnmodell skulle haft, och missade därför fakta som
bokstavligen stod där.

**Fix:** Ny, separat systemprompt `INTERVIEW_EXTRACTOR_SYSTEM` i
`src/core/extractFacts.ts`, enbart för Intervju-extraktion — namnger
personen som intervjuas direkt i användarpromptet
("Interviewee: Henrik (this is who "I"/"me"/"my" refers to...)") och
säger uttryckligen i systempromptet att förstapersonspåståenden ska
tolkas som fakta om den intervjuade, aldrig om "jag" eller "den
intervjuade" som etikett. Kapitel-extraktion och lore-import
rörs inte — de är fortfarande genuint tredjepersonstext och
`EXTRACTOR_SYSTEM` passar dem. Nya tester i
`tests/core/extract-facts.test.ts` för både systempromptens
innehåll och att användarpromptet faktiskt namnger den intervjuade.

**Ändringslogg v1.0.4 → v1.0.5 (2026-09-29):** Rutan syntes fortfarande
inte tillräckligt bra för testaren efter v1.0.4:s CSS-fix (svaret
kom fram, men allt — titel, personlighetsfält, hela samtalet och
skrivfältet — låg fortfarande i en enda smal kolumn, `min(34rem,
100%)` bred). Önskemål: gör rutan bredare, lägg fråga/svar till
höger om "den andra texten", och låt svaret få bli en stor yta.

**Ändring:** `.edit-card.interview-card` breddad från `min(34rem,
100%)` till `min(64rem, 100%)`. Innehållet delades i två kolumner
via en ny `.interview-body`-container (`display: flex; gap: 1rem`):
`.interview-info` (fast bredd, `flex: 0 0 16rem`) med rubrik,
inledningstext och personlighetsfältet till vänster,
`.interview-chat` (`flex: 1 1 auto`) med transkriptet, felmeddelandet
och skrivformuläret till höger — det senare får nu större delen av
den nya bredden, så själva samtalet är det som växer. Under 640px
går layouten tillbaka till en enda kolumn (info ovanför chatten)
så det fortfarande fungerar på smala skärmar. Ingen ändring i
`askCharacter`-logiken eller CSS-höjdfixen från v1.0.4 — ren
layout ovanpå den.

**Ändringslogg v1.0.3 → v1.0.4 (2026-09-29):** Sista biten av samma
buggtråd — och den bekräftar att v1.0.3 faktiskt fungerade. Testaren:
"Jag tror att det kom ett svar men jag ser det inte" — rutan där
Henriks svar skulle synas var i det närmaste osynlig, hoppressad
till några pixlar. Ren CSS-bugg, inget fel i själva AI-anropet
längre.

**Grundorsak:** `.edit-card.interview-card` satte `max-height`, inte
`height`. `.interview-transcript` (mittsektionen med samtalet) är
`flex: 1 1 auto; min-height: 0;` — tänkt att fylla det utrymme som
blir över när rubrik, personlighetsfält och skrivfält tagit sitt.
Men en flex-container som bara har `max-height` (inte en definitiv
`height`) ger webbläsaren inget konkret tal att räkna "utrymme över"
utifrån — resultatet blev att mittsektionen kollapsade mot noll
istället för att expandera, även när den innehöll riktigt textinnehåll.
Detta var för övrigt exakt det jag misstänkte allra först i den här
buggtråden (en kommentar om en gåtfull "▼"-glyf i den första
skärmdumpen), men kunde inte bekräfta utan en riktig körning då.

**Fix:** `max-height` → `height` (fortfarande `min(90vh, 44rem)`,
samma gräns som förut). Ger `.interview-transcript` ett konkret
utrymme att fylla, som en vanlig chattruta — samma storlek oavsett
hur mycket eller lite historik den innehåller, istället för att krympa
ihop sig när det blir tomt.

**Kort avvägning, inte gjord:** samma `max-height`-mönster finns på
fler ställen i `styles.css`, men bara `.interview-card` har den
specifika kombinationen (flex-kolumn + `flex:1 1 auto; min-height:0`-
barn) som orsakar buggen. Gjorde ingen bredare genomsökning av alla
`max-height`-regler — inget annat ställe visade tecken på samma
problem vid en snabb koll.

**Ändringslogg v1.0.2 → v1.0.3 (2026-09-29):** Fortfarande samma
buggtråd. Testaren bekräftade: `git pull` gjort, servern omstartad,
felet kvarstod ändå — knappen blev dimmad, "Asking..." stod kvar,
inget svar kom, inte ens efter att ha lämnat och kommit tillbaka
till fönstret. **Den avgörande nya informationen:** "Jag kunde
utveckla text i manuset med AI" — Extend/Elaborate fungerade fint,
med samma Writing-modell. Det pekade bort från "modellen/Ollama är
trasig" och rakt mot något Interview-specifikt.

**Grundorsak:** jämförde `askCharacter` mot alla andra anrop som
använder Writing-modellen (Draft, Recast, Extend, Elaborate —
`draftChapter`, `rewriteSpan` m.fl.) och hittade skillnaden:
samtliga andra använder `provider.streamChat()` (strömmande, text
visas löpande allteftersom modellen genererar den) — `askCharacter`
var det enda stället som använde `provider.chat()` (icke-strömmande,
väntar in HELA svaret i ett enda svep innan något visas alls). På en
långsammare modell eller dator är det skillnaden mellan "syns
arbeta" och "ser ut att ha dött" — även om båda i teorin till slut
skulle svara, ger den strömmande varianten kontinuerlig, synlig
feedback hela vägen, medan den icke-strömmande ger noll feedback
tills (eller om) hela svaret kommer på en gång. 2-minutersgränsen
från v1.0.2 skulle förstås ha slagit till till slut — men om
generering av 400 tokens i ett enda svep tog längre än så på
testarens dator, hade upplevelsen ändå varit "hänger sig" långt
innan timeouten hann lösa ut.

**Fix:** `askCharacter` strömmar nu på samma sätt som resten av
appens Writing-modell-anrop — svaret skrivs fram löpande i
transkriptet istället för att dyka upp i ett enda stycke. Samma
`abortRef`/timeout-infrastruktur från v1.0.2 återanvänds oförändrad.
Städade också bort en liten kosmetisk krock min egen ändring annars
skulle introducerat: "tänker"-indikatorn i `CharacterInterviewCard`
visade sig tidigare hela tiden `busy` var sant — nu bara innan
första textbiten kommit, annars skulle den stått kvar under ett
redan synligt, växande svar.

**Ändringslogg v1.0.1 → v1.0.2 (2026-09-29):** v1.0.1 löste inte
buggen — samma testare rapporterade tillbaka: "verkar inte fungera
ändå... jag ställer frågan, knappen Ask blir dimmad och sedan händer
inget." Viktig skillnad från förra rapporten: att knappen faktiskt
BLIR dimmad bevisar att förra fixens väktare passerades korrekt —
förfrågan startade på riktigt den här gången. Så felet satt inte
där v1.0.1 tittade, utan längre in.

**Grundorsak, den här gången:** genomsökte hela `src/llm/`-lagret
(alla `fetch()`-anrop mot Ollama/OpenAI-kompatibel server) och
hittade att INGENSTANS i hela kedjan finns någon timeout — varken
för Interview, Draft, Extract facts eller något annat AI-anrop.
Om servern hänger (modellen laddas fortfarande, en avbruten
anslutning, fel port som tar emot TCP men aldrig svarar) väntar
`fetch` i praktiken för evigt. Eftersom `finally`-blocket som
nollställer `busy` bara körs när löftet faktiskt avgörs (löst eller
avvisat), och ett hängande `fetch` aldrig gör vare sig — förblir
knappen dimmad i all evighet, helt utan felmeddelande. Matchar
rapporten exakt.

**Fix:** ny `withRequestTimeout()`-hjälpfunktion i `BookStore.tsx` —
avbryter förfrågan efter 2 minuter (generöst för en långsam dator
eller en modell som laddas kallt första gången) och visar ett nytt
`STORE_ERROR.timeout`-felmeddelande istället för att vänta i all
oändlighet. Kopplad till både `askCharacter` och `extractInterview`
(den senare saknade dessutom avbrytningsstöd helt tidigare — nu
delar den samma `abortRef` som resten av Interview, så att stänga
panelen faktiskt avbryter en pågående förfrågan).

**Medvetet inte gjort än:** samma timeout-lucka finns i alla andra
AI-anrop i appen (Draft, Recast, Extract facts på kapitel, Ask
Manuscript, m.fl.) — bara Interview är fixad denna gång, eftersom
det är den enda som rapporterats. Bredda till resten är en
uppföljning värd att göra, inte gjord tyst i den här commiten.

**Ändringslogg v1.0 → v1.0.1 (2026-09-29):** Buggfix från
testarfeedback: "jag försöker intervjua en karaktär men det händer
inget när jag skickar frågan." Ingen felmeddelande, ingen ny rad i
transkriptet, ingen "tänker"-indikator — frågan bara försvann ur
fältet.

**Grundorsak:** `askCharacter`/`extractInterview` i `BookStore.tsx`
avbröt tyst (`if (... || busy || ...) return;`) närhelst appens
globala `busy`-flagga var satt av *vilken som helst* pågående
AI-åtgärd — men `CharacterInterviewCard`s egna knappar
inaktiverades bara när `busy === "interview"` specifikt. Var
`busy` satt till något annat (t.ex. en Draft som fortfarande
genererade i en annan flik av appen) såg Ask-knappen fortsatt
klickbar ut, men klick gav bokstavligen ingenting — exakt
symptombilden som rapporterades.

**Fix, två delar:** (1) `askCharacter`/`extractInterview` avbryter
aldrig längre tyst — ny `STORE_ERROR.busy` ("Another action is
already running...") visas alltid om gränsen träffas. (2) Ny
`blocked`-prop på `CharacterInterviewCard`, satt till sant när
global `busy` är något ANNAT än interview/extract-interview —
inaktiverar Ask-fältet, Extract facts-knappen och visar samma
meddelande proaktivt, innan man ens hinner klicka och undra varför
inget händer.

Ingen browser/Ollama tillgänglig i den här sessionen för att
återskapa buggen live — grundorsaken bekräftad genom noggrann
kodläsning (den tydliga diskrepansen mellan väktarens råa `busy`-
koll och UI-lagrets smalare `busy === "interview"`-koll), inte
genom att faktiskt trigga felet i appen.

**Ändringslogg v0.99.71 → v1.0 (2026-09-29):** StoryBook AI kallas nu
1.0. `package.json` bumpad från `0.1.0` till `1.0.0` — matchar nu
webbens och dokumentens språkbruk istället för att motsäga det.

Bedömningen som ledde hit: funktionsmässigt var projektet redan där
(§2 ovan — jämfört mot Scrivener/Sudowrite/Novelcrafter finns i
princip allt de har, plus flera saker de inte har; 27 av 34 spårade
roadmap-idéer byggda, resten medvetet "inte nu" eller 2.0-riktning).
Det enda konkreta som stod i vägen var leveranssättet för den
icke-tekniska författare produkten är byggd för: ingen enkel start på
Mac/Linux (bara Windows hade `starta.bat`) och `OLLAMA_ORIGINS`-
CORS-fällan var odokumenterad. Båda lösta samma dag (idé #34,
v0.99.71, plus webbens Getting Started-guide uppdaterad separat på
webbsidan, inte i det här repot).

Inget kodat i den här specifika commiten utöver versionsnumret —
detta är ett statusbeslut, inte en funktionsleverans.

**Ändringslogg v0.99.70 → v0.99.71:** Idé #34 — startskript för Mac
och Linux, samma jobb som `starta.bat` redan gjorde för Windows. Nya
`starta.command` (macOS, dubbelklickbart från Finder — precis som
`.bat`-filer fungerar på Windows) och `starta.sh` (Linux, körs med
`./starta.sh` i en terminal). Båda gör samma tre steg som
`starta.bat`: kollar att Node.js finns och pekar till nodejs.org om
inte, kör `npm install` bara första gången (`node_modules` saknas),
startar sedan appen med `npm start`. `starta.command` är bara en tunn
wrapper (`bash starta.sh`) så själva logiken finns på ett ställe,
inte duplicerad mellan de två filerna. README:s Run-avsnitt uppdaterat
att nämna alla tre plattformar. Känd, oundviklig friktion (inget nytt
att åtgärda, bara att veta om): macOS Gatekeeper varnar första gången
för ett osignerat skript ("okänd utvecklare") — användaren
högerklickar → Öppna en gång, sedan är det löst.

**Ändringslogg v0.99.69 → v0.99.70:** Kopplar ihop trådar (Plotlines)
med själva skrivytan, efter en diskussion om huruvida Scenes eller
Timeline/Trådar borde synas när man skriver. Landade på: trådarna,
inte scenerna (de är fortfarande medvetet frikopplade från kapitlet,
se v0.81-beslutet).

1. **Påminnelse i skrivytan.** Kapitelrubriken visar nu vilka trådar
   kapitlet är taggat mot (färgade chips, samma färger som i
   Timeline/Trådar), tyst när kapitlet inte har några. Ny
   `plotlinesForChapter()` i `plotlines.ts` — ren visning, ingen ny
   data.
2. **Del av AI-prompten.** `formatPlotlinesForPrompt()`
   (`generateProse.ts`) lägger till en "Threads this chapter should
   advance"-rad i Draft/Draft scen/Extend/Elaborate/Beat-prompterna,
   med samma tysta-om-tomt-mönster som Chapter brief redan har.
   Recast rörs inte — den lovar uttryckligen att inte lägga till
   händelser, så trådvägledning hade bara varit brus där.
3. **"Hide from AI"-kryssruta i Edit thread.** Ny `hide_from_ai`
   (optional, standard av) på Plotline — en tråd med den ikryssad
   skickas fortfarande med i skrivytans påminnelse (den är ju för
   författaren) men utelämnas ur AI-prompten. Låter författaren ha
   privata/meta-trådar (t.ex. "research att göra") som aldrig ska
   styra vad modellen skriver.

**Ändringslogg v0.99.68 → v0.99.69:** Två layoutjusteringar i
Timeline/Trådar-kolumnrubriken, på författarens begäran. ←/→-pilarna
för att flytta ett kapitels kronologiska position satt tidigare på
en egen rad längst ner — nu flankerar de istället "Manuscript
position N"-texten direkt ("← Manuscript position 1 →"), så
pilarna syns bredvid det de faktiskt flyttar. Och "ur ordning"-
flaggan (⚠ som visas för ett kapitel vars kronologiska position
skiljer sig från dess plats i manuset) har nu alltid en reserverad
tom rad under positionstexten, tom när kapitlet inte är ur ordning —
så kolumnerna håller samma höjd oavsett om flaggan visas eller inte,
istället för att hoppa till när den dyker upp. Ren layout, ingen
logikändring.

**Ändringslogg v0.99.67 → v0.99.68:** Story time-fältet i
Timeline/Trådar hade bara en lång placeholder-text ("When does this
happen? E.g. …") som förklaring — för lång för att rymmas i den
smala kolumnen, och den försvinner så fort man börjar skriva. Lade
till en kort, alltid synlig rubrik ovanför fältet — "Chronological
position" — parat med "Manuscript position N" som redan fanns, så de
två olika ordningarna (var kapitlet ligger i manuset vs. var det
ligger i berättelsens kronologi) syns bredvid varandra även efter man
skrivit något. Placeholder-texten förkortades till bara exemplet
("E.g. "Three years earlier""). Ren text-/i18n-ändring.

**Ändringslogg v0.99.66 → v0.99.67:** Två små visuella justeringar av
Timeline/Trådar-tabellen. Tabellens cellbakgrund är nu `var(--paper)`
(samma "vit"-ton som appens övriga kort) istället för att visa
sidbakgrunden rakt igenom. Och staplarna har fått lite andrum: en
sammanhängande körnings mittenceller ligger fortfarande helt ihop
(inget glapp mitt i en tråd), men själva körningens två yttersta
ändar är nu indragna ~0.25rem med rundade hörn, så stapeln som helhet
läses som en pill med luft runt om istället för att gå ända ut i
rutnätets kant. Ren CSS, ingen logik- eller dataändring.

**Ändringslogg v0.99.65 → v0.99.66:** Uppföljning på gårdagens
färgväljare, efter feedback: det klickbara 10-färgsrutnätet satt
tidigare alltid synligt i varje trådrad och tog både plats och
uppmärksamhet. Ersatt med en "Redigera tråd"-vy — radrubriken visar
nu bara trådens namn plus en liten "Redigera"-knapp; klick öppnar ett
kort (`PlotlineEditCard.tsx`, samma överlagsmönster som
Import lore/Convert markers) med namn, färgrutnät och ett nytt
frivilligt beskrivningsfält, sparas samlat via en ny
`updatePlotline()` (ersätter de tidigare separata
`renamePlotline`/`setPlotlineColor`). Beskrivningen visas som en
tooltip (webbläsarens vanliga `title`-attribut) när man hovrar
trådens namn eller någon av dess staplar — inget UI-bygge för det,
bara en `title`-attribut på rätt element. `Plotline.description` är
ett nytt, frivilligt fält i schemat (`.optional()`), så äldre
sparfiler läses in precis som förut, bara utan beskrivning.

**Ändringslogg v0.99.64 → v0.99.65:** Fri färgväljare för trådar i
Timeline/Trådar-vyn — författaren bad om att kunna välja bland 8
klara/tydliga färger plus grå och mörkgrå, istället för att bara
låta appen tilldela en färg automatiskt. Plotlines delade tidigare
palett med Brainstorm-lapparna (`NoteColor` — fem dämpade,
temaanpassade pastellfärger tänkta som bakgrund bakom mörk text på
ett kort), vilket är fel princip för en stapel utan text ovanpå.
Ny, egen `PlotlineColor`-palett (`plotlineColors.ts`), tio klara
kulörer (lime, grön, cyan, blå, violett, magenta, orange, korall,
grå, mörkgrå), helt frikopplad från Brainstorm — att bredda den ena
paletten rör aldrig den andra. Varje tråds radrubrik har nu ett
litet färgrutnät (10 klickbara prickar) för att välja om färgen; vald
färg visas som en vänsterkant-accent på radrubriken (inte som
bakgrund bakom texten — undviker kontrastproblem mellan mörk text
och en ljus/mörk slumpvis vald bakgrund) och som stapelns fyllnad i
tabellen, precis som tidigare men nu klarare.

Migrering: gamla sparfiler har trådar med de gamla notis-färgnamnen
("rust", "sage", "gold", "lilac", "paper") — `parsePlotlineColor()`
mappar varje gammalt namn till närmaste nya kulör (t.ex. rust→korall,
sage→grön) via `z.preprocess` i schemat, så en äldre bok laddar utan
fel och får bara en annan, klarare kulör på sina befintliga trådar.
Städade samtidigt bort `plotlineMatrixRows()`/`PlotlineMatrixRow` i
`plotlines.ts` — dött kvarglömt kod från förra veckans
Timeline/Trådar-sammanslagning (v0.99.62), aldrig upptäckt förrän nu.

**Ändringslogg v0.99.63 → v0.99.64:** Visuell uppföljning på den
ihopslagna Timeline/Trådar-vyn, efter en skiss från författaren: en
tråds ifyllda celler i en rad visas nu som en sammanhängande stapel
istället för separata prickar, när kapitlen ligger i följd. En lucka
i tråden (kapitel utan den tråden) bryter stapeln, så glappet syns
direkt. Ren rendering, ingen ny data — `TimelineBoard.tsx` räknar ut
var en sammanhängande körning börjar/slutar (`is-run-start`/
`is-run-end`) utifrån samma `activePlotlineIds` som redan fanns, och
CSS:en rundar bara hörnen i respektive ände av en körning. Varje
kapitels ruta går fortfarande att klicka för sig — att klicka mitt i
en stapel tar bort just det kapitlet ur tråden och delar stapeln i
två, precis som förut. Tomma rutor (kapitel som inte hör till tråden)
är nu osynliga tills man för musen över dem eller tabbar dit, istället
för att alltid visa en liten grå cirkel — en medveten avvägning för
att matcha skissen (rena, tomma luckor) utan att tappa möjligheten
att klicka i en tom ruta för att lägga till kapitlet i tråden.

**Ändringslogg v0.99.62 → v0.99.63:** Uppföljning på den ihopslagna
Timeline/Trådar-vyn: när man byter Utvecklingsmetod (eller går till
"Ingen metod") frågar appen nu om den ska ta bort förra metodens
kvarglömda trådar, om några av dem fortfarande finns kvar orörda.
Bakgrund: `materializeBeats()` lägger till en tråd per "beat" i en
vald metod (t.ex. Save the Cats 15 punkter), men själva metodbytet har
aldrig tagit bort den gamla metodens trådar — medvetet, för att aldrig
radera något automatiskt (se kommentaren i `developmentMethod.ts`).
I praktiken blev det istället tyst skräp: byter man metod en gång
till får man båda metodernas beat-trådar liggande i Trådmatrisen för
alltid, om man inte städar för hand. Ny funktion `beatPlotlines()`
hittar de trådar vars titel exakt matchar en beat-etikett från den
metod man lämnar; om några hittas frågar `window.confirm()` (samma
mönster som radering på andra ställen i appen) om de ska tas bort,
med namnen utskrivna så man ser exakt vad som försvinner innan man
svarar. Svarar man nej ligger de kvar precis som förut — inget
raderas utan att frågas.

**Ändringslogg v0.99.61 → v0.99.62:** Idé #33 (`roadmap-ideas.md`) —
Timeline och Trådar (Plotlines) slagna ihop till en enda vy. Tidigare
var det två separata sidor: Timeline en omdragbar lista (ett kapitel
per rad, fritextfält för story time) och Trådar en matris (kapitel ×
tråd). Nu är det en tabell: kapitel som kolumner i story-tidsordning
(`timelineBoardColumns()`, ny fil `timelineBoard.ts` — bygger vidare
på befintliga `timelineEntries()` och `chapter.plotline_ids`, inget
nytt sparat fält), trådar som rader. En ifylld prick i en rad visar
att kapitlet hör till den tråden — glapp i en tråd syns direkt som ett
uppehåll i raden istället för att man ska läsa en lista och en matris
var för sig. Alla handlingar från de gamla sidorna finns kvar på
samma ställe: klicka en tom ruta för att tagga ett kapitel mot en
tråd, klicka en prick för att hoppa till kapitlet, redigera story
time-texten i kolumnrubriken, flytta ett kapitel tidigare/senare i
story-tidsordning, lägg till/döp om/ta bort trådar. Kolumnernas
inbördes avstånd är fortfarande bara rangordning, inte verklig
tidsdistans — `story_time` är medvetet kvar som fri text (se idé
#33:s avvägning), ingen ny schemautvidgning. De gamla filerna
`Timeline.tsx` och `PlotlineMatrix.tsx` är borttagna, ersatta av
`TimelineBoard.tsx`.

**Ändringslogg v0.99.60 → v0.99.61:** Första steget av idé #28
(`roadmap-ideas.md`) — generisk flerartikel-import för "Import lore".
Tidigare gick det bara att klistra in *en* artikel åt gången med en
egen titel. Nu tolkar `splitLoreArticles()` (ny fil `loreImport.ts`)
den inklistrade eller uppladdade texten: hittar den Markdown-rubriker
(`# Rubrik`, alla nivåer 1–6) delas texten upp i flera kandidatartiklar
med rubriken som titel; hittas inga rubriker beter sig kortet exakt
som förut (fritt textfält + eget titelfält). Vid flera hittade artiklar
visas en bockningslista där alla är ivalda som standard — författaren
kan välja bort de som inte hör dit innan körningen. Körningen går
sekventiellt genom extraktorn (samma extraktor som kapitel- och
intervjuextraktion) med "X av Y"-förloppstext, och ett enskilt
artikelfel avbryter inte resten av batchen. Lade även till en
filuppladdningsknapp (samma dolda-input-mönster som bilduppladdning i
Story Bible) som en enklare väg in än att klistra in, för den som har
lore som textfil. Inget sparas i boken förutom de fakta som extraktorn
hittar — precis som tidigare landar allt i granskningskön, inget låses
direkt.

**Ändringslogg v0.99.59 → v0.99.60:** Buggfix från testarfeedback:
gick inte att skriva in ett eget värde i det nya Kontextfönster-fältet
(v0.99.58). Fältet klämde ihop (clampade) värdet mot minimigränsen
(1024) på **varje tangenttryckning**, inte bara när man lämnade
fältet. Skrev man t.ex. "32000" genom att markera allt och skriva om,
fångade `onChange` upp mellansteg som bara "3" — under minimum 1024 —
och klämde tyst upp det till 1024 mitt i skrivandet, som sedan bara
gick att bygga vidare på siffra för siffra i slutet (exakt det
testaren beskrev). Samma bugg fanns latent i det äldre
"Versioner per kapitel"-fältet också (samma kopierade mönster), fixad
samtidigt.

Löst genom att skilja på vad fältet **visar** medan man skriver och vad
som faktiskt **sparas**: ett obundet utkastvärde uppdateras fritt vid
varje tangenttryckning utan att klämmas, och klämningen (min/max) sker
först när man lämnar fältet (`onBlur`) — samma mönster som redan
används för att döpa om ett Story Bible-kort. Verifierat live: skriva
"32000" håller sig hela vägen till "32000" nu, ett för lågt eller för
högt värde kläms fortfarande korrekt vid blur, och "Föreslå från
modellen" fungerar oförändrat.
**Ändringslogg v0.99.58 → v0.99.59:** Fynd 2 från samma testarrapport
som v0.99.58 (kontextfönster): scen-till-scen-Draft skickade bara de
sista tre raderna av föregående scen som kontext
(`sceneTail()`/`draftSceneUserPrompt` i `generateProse.ts`), aldrig hela
scenen. En etablerad detalj tidigare än så — en karaktär som redan
satt sig ner, redan klätt av sig — nådde alltså aldrig modellen vid
nästa scens Draft, som sedan motsade den utan att egentligen ha sett
den.

Fixat: predecessor-blocket bär nu **hela texten från alla tidigare
scener i kapitlet**, inte bara en svans från den närmast föregående —
samma "modellen ser allt som skrivits i det här kapitlet hittills"-
garanti som ett odelat kapitels Draft redan hade. "Nästa scen"-förhandsvisningen (bara scenens första rader, till för att undvika
överlapp framåt, inte bakåtkontinuitet) är oförändrad — den löste inte
det rapporterade problemet och behövde inte samma fix.

Kostnaden är fler token per generering i kapitel med flera scener,
samma avvägning som redan gäller för ett långt odelat kapitel — därför
byggdes kontextfönster-inställningen (v0.99.58) först.

Ny regressionstest (`generate-prose.test.ts`) återskapar exakt
mönstret: en detalj fyra stycken tillbaka i föregående scen, som det
gamla tre-radersfönstret skulle ha tappat, finns nu med i prompten.
**Ändringslogg v0.99.57 → v0.99.58:** Buggfix från testarfeedback:
StoryBook satte aldrig ett kontextfönster (`num_ctx`) i sina anrop till
Ollama — bara `temperature` och `num_predict` (max antal genererade
token). Det gjorde att Ollamas eget, ofta mycket lägre, standardvärde
alltid gällde, oavsett hur stort kontextfönster modellen och datorn
faktiskt klarar. Ett fullt Draft-anrop (helt kapitel hittills + Story
Bible + synopsis) kan lätt passera det standardvärdet för ett kapitel
av normal längd, vilket tyst försämrar modellens grepp om nyss skriven
text — exakt det mönster en testare rapporterade (en karaktär
beskriven i strumporna, för att i nästa stycke ha "bara fötter" på
mattan).

Löst med ett nytt fält i Inställningar, **Kontextfönster**, som sätts
en gång för hela appen (samma nivå som motor/serveradress, inte per
bok) och skickas som `num_ctx` i varje Ollama-anrop
(`src/llm/contextWindow.ts`, standardvärde 8192 — säkrare än Ollamas
eget, men författaren kan höja eller sänka). En **"Föreslå från
modellen"**-knapp frågar Ollama (`/api/show`) vilket maxvärde den
anslutna modellen faktiskt rapporterar och föreslår det — appen kan
inte känna av VRAM (ingen webb-API för det finns), så det här är riktig
data om modellen istället för en gissning om hårdvaran. Gäller bara
Ollama; för LM Studio/andra OpenAI-kompatibla servrar sätts
kontextlängden när modellen laddas där, med en förklarande text i
UI:t istället för knappen.

**Kvarstående, medvetet inte löst denna gång**: en separat, mindre
fråga från samma testarrapport — scen-till-scen-Draft skickar bara de
sista tre raderna av föregående scen (`sceneTail()` i
`generateProse.ts`), vilket kan tappa en etablerad detalj (t.ex. att en
karaktär redan satt sig ner) om den låg tidigare än så i föregående
scen. Ett kontextfönster löser inte det — det är ett separat lager
(vad StoryBooks egen kod väljer att lägga i prompten, inte vad modellen
förmår ta emot). Inte byggt än.

**Ändringslogg v0.99.56 → v0.99.57:** Buggfix: Extract facts kunde
skapa flera Story Bible-kort för exakt samma person (testarens exempel:
"Dr. James Mortimer" två gånger, från samma kapitelextraktion).
Orsaken: `entity_ref` (den stabila identiteten bakom ett kort) togs
tidigare från modellens EGET påhittade förslag per fakta-rad — men
modellen ser aldrig vilka kort som redan finns, så två fakta om exakt
samma namn kunde få olika egenhändigt valda `entity_ref`. Fixat genom
att alltid räkna ut `entity_ref` deterministiskt från det visade namnet
(`entity_label`) i kod istället för att lita på modellens gissning —
samma exakta namn ger alltid samma kort nu, i samma extraktion eller i
en senare. Extraktor-prompten uppdaterad att inte längre be om
`entity_ref` alls (sparar tokens) och istället be modellen stava namnet
konsekvent genom hela extraktionen.

**Kvarstående, medvetet inte löst denna gång**: namn-VARIANTER av samma
person ("Dr. Mortimer" vs "Dr. James Mortimer", "Henry Baskerville" vs
"Sir Henry Baskerville") blir fortfarande separata kort — det kräver
antingen att extraktorn känner till redan etablerade kort (den ser idag
bara det aktuella kapitlet, inget av Story Bible) eller en riktig
"slå ihop kort"-funktion. Ingetdera byggt än.

**Ändringslogg v0.99.55 → v0.99.56:** Interview var för otydligt kopplat
till Story Bible för icke-karaktärer (platser, objekt m.fl.) — funktionen
fanns redan men syntes bara om man råkade öppna ett sådant korts egen
vy. Lade till en egen "Interview"-knapp uppe till höger i Story
Bible-panelen, bredvid rubriken. Den öppnar en väljare ("Vem eller vad
vill du intervjua?") grupperad efter typ (karaktärer, platser, objekt
osv.) — man väljer en artikel och intervjun startar direkt, samma flöde
som innan. För att göra plats flyttades "X låsta / Exportera kort" ner
till under "Visa Story Bible som av"-raden istället för att dela
utrymme högst upp.
**Ändringslogg v0.99.54 → v0.99.55:** "Convert markers to formatting"
flyttad från en sektion längst ner i Inställningar till en egen knapp i
toppmenyn ("Convert markers"), bredvid Import lore — samma resonemang
som flytten av Import lore: ett verktyg man plockar fram vid behov, oavsett
vilken sida i boken man står på, förtjänar en egen knapp istället för att
ligga gömt. Reglerna sparas fortfarande på boken precis som innan (v0.99.53).

**Ändringslogg v0.99.53 → v0.99.54:** Två UI-önskemål från testarfeedback.

- **"Import lore" flyttad till bokens toppmeny.** Låg tidigare gömd
  inne i Story Bible-panelen (bara synlig när man redan var där).
  Ligger nu som en egen knapp bredvid Inställningar/Backup/Sök, synlig
  oavsett vilken sida man står på — precis som de andra
  verktygsknapparna. Funktionen är oförändrad, bara mer upptäckbar.
- **Bokens titelfält var för smalt.** Hade inget minsta bredd satt i
  CSS:en, så fältet kunde krympa ner mot webbläsarens standardbredd
  för textfält istället för att faktiskt visa titeln. Satt en
  minimibredd (20rem) så det syns ordentligt, upp till samma maxbredd
  (40rem) som innan.

**Ändringslogg v0.99.52 → v0.99.53:** Buggfix: reglerna i "Convert
markers to formatting" sparades aldrig. De låg bara i komponentens
egna, tillfälliga state (`useState`), inte i själva boken — så varje
gång man lämnade Inställningar och kom tillbaka (eller laddade om
sidan) återställdes de till de två standardexemplen (`*`/`**`), och
allt man lagt till, ändrat eller tagit bort var borta. Fixat genom att
flytta reglerna till boken själv (`book.marker_conversion_rules`,
tillägg-fält, saknas på äldre sparfiler — då visas standardexemplen
istället utan att skriva dem), sparas nu på samma sätt och med samma
debounce som alla andra inställningar (Prosaspråk, Röst, med mera).
Verifierat live: ändra/ta bort/lägga till en regel, navigera bort och
tillbaka, och till och med ladda om sidan helt — reglerna ligger kvar.

**Ändringslogg v0.99.51 → v0.99.52:** Lade till en fråga i Guide →
8. Hjälp & felsökning om att "Convert markers to formatting" inte
hittar några markeringar — samma orsak som fixen i v0.99.51 (skrivna
raka citattecken matchar inte manusets smarta citattecken, eftersom de
är olika tecken för datorn). Rådet: kopiera det faktiska tecknet från
manustexten och klistra in det i fältet, istället för att skriva om
det, så det garanterat blir exakt rätt tecken.

**Ändringslogg v0.99.50 → v0.99.51:** "Convert markers to formatting"
fungerade inte med smarta/typografiska citattecken (”…”). Orsaken var
strukturell: verktyget antog att öppnings- och avslutningstecknet alltid
var exakt samma tecken (fungerar fint för `*`/`**`), men smarta
citattecken är två OLIKA tecken (U+201C öppnande, U+201D avslutande) —
en symmetrisk regel kunde aldrig matcha dem. Fixat genom att låta varje
regel ha ett separat öppnings- och avslutningstecken (`open`/`close`
istället för ett gemensamt `marker`); UI:t har nu två fält per rad
istället för ett. Verifierat live: kursivering av hela dialogreplikser
avgränsade med smarta citattecken fungerar nu korrekt, och raka
citattecken (`"…"`) fungerar precis som innan.

**Ändringslogg v0.99.49 → v0.99.50:** Tre buggar från testarfeedback,
alla hittade genom att faktiskt reproducera i webbläsaren istället för
att bara läsa kod.

- **Scenanteckningar sparade ingenting alls för ett aldrig delat
  kapitel.** `chapterScenes()` visar en underförstådd "scen 1" på flygande
  fot för kapitel som aldrig delats upp — men `updateSceneMeta()` letade
  bara bland *redan sparade* scener, hittade ingen, och gjorde inget.
  Skriva i scenanteckningen för det vanliga, odelade fallet (de allra
  flesta kapitel) sparades alltså aldrig, oavsett tecken. Fixat: samma
  "skapa den underförstådda scen-1:an om den inte redan finns"-mönster
  som `addScene`/`splitSceneAtParagraph` redan använde.
- **Mellanslag "fungerade inte" i scenanteckningar** (för kapitel som
  faktiskt var uppdelade, där ovanstående bugg inte slog till): fältet
  trimmade bort inledande/avslutande mellanslag på *varje* tangenttryckning,
  inte bara vid sparning. Skriver man i ett tomt fält är varje mellanslag
  man skriver per definition sist i texten — och blev alltså bortstädat
  innan nästa bokstav ens hann läggas till. Redigerar man i mitten av
  redan skriven text drabbades det aldrig, vilket stämde exakt med
  författarens iakttagelse. Fixat: trimning används nu bara för att
  avgöra om fältet ska räknas som tomt, aldrig för att ändra det sparade
  värdet.
- **"Intervjua"-funktionen för Story Bible-artiklar (även för
  icke-karaktärer) kändes obruten men gjorde "ingenting".** När frågan
  misslyckas (t.ex. ingen modell ansluten) försvann författarens egen
  fråga tyst ur samtalet igen, och felmeddelandet visades bara i den
  redan existerande sidbannern — som ligger *bakom* dialogrutans egen
  mörka bakgrund och knappt syns. Fixat: författarens fråga stannar kvar
  i samtalet, och ett tydligt felmeddelande visas nu direkt i
  intervju-rutan.
- 3 nya/utökade tester i `book-scene.test.ts`, 701/701 gröna totalt,
  typkontroll ren. Alla tre reproducerade och verifierade i webbläsaren
  (inte bara via kodläsning) före och efter fix.

**Ändringslogg v0.99.48 → v0.99.49:** Ny publiceringsformat "Ren text"
(.txt) — den andra delen av samma testarfeedback som Konvertera
markeringar (v0.99.48). Tidigare fanns bara Markdown/RTF/ODT/HTML/ePub/
PDF; ren text utan någon markup alls saknades helt.

- Ny `formatExportPlainText()` i `manuscriptExport.ts` — samma innehåll
  och struktur som Markdown-exporten, men helt utan `#`/`##`/`**`-tecken.
- Nytt "Ren text"-alternativ i Publicera-dialogens formatväljare,
  bredvid Markdown. Typsnittsväljaren inaktiveras för båda (ingen av
  dem har typsnitt att välja).
- 3 nya/utökade tester i `manuscript-export.test.ts`, 697/697 gröna
  totalt, typkontroll ren. Verifierat i webbläsaren: valde Ren text,
  laddade ner filen, kontrollerade att den heter `.txt` och innehåller
  exakt manustexten utan någon markup.

**Ändringslogg v0.99.47 → v0.99.48:** Ny "Konvertera markeringar till
formatering" i Inställningar — svar på en testares feedback: hens
importerade manus märker inre tankar med `*asterisker som det här*`,
och StoryBook AI lämnade tecknen kvar rakt av (bara manuell
kursivering fanns). Nu kan man definiera egna regler (tecken → Fet/
Kursiv/Understruken), köra dem över hela manuset, och få riktig,
synlig formatering — asterisk-tecknen tas bort ur texten helt.

- Ny `applyMarkerConversion()` i `markerConversion.ts`: hittar
  `*text*`-par, tar bort markeringstecknen ur `chapter.prose`, och
  lägger på en riktig formateringsrad istället — återanvänder
  `shiftFormattingRanges()` (samma primitiv varje AI-redigering redan
  går genom) så befintlig formatering längre fram i kapitlet flyttas
  korrekt. Längre markeringar (`**`) körs alltid före kortare (`*`) så
  `**fet text**` inte felaktigt tolkas som kursiv-inuti-kursiv.
- Ny sektion i Inställningar: en radlista (tecken → Fet/Kursiv/
  Understruken-väljare), förifylld med `*` → Kursiv och `**` → Fet,
  fritt redigerbar/utökningsbar. En knapp kör konverteringen över hela
  manuset i ett svep och visar en sammanfattning ("Konverterade 47
  markeringar i 12 kapitel").
- Varje ändrat kapitel får en ny Historik-rad (märkt "Formatering")
  med den gamla texten kvar — konverteringen är alltså reversibel per
  kapitel precis som alla andra skrivåtgärder.
- **Känd avgränsning**: en markering nested helt inuti en redan
  konverterad annan markering (t.ex. `**han sa *tyst* till henne**`)
  tappar den yttre stilen just över det inbäddade ordet — samma
  avvägning `shiftFormattingRanges` redan gör för alla andra
  redigeringar. Icke-nästlade markeringar (det vanliga fallet för en
  enskild markeringskonvention) påverkas inte.
- 7 nya tester i `marker-conversion.test.ts`, 696/696 gröna totalt,
  typkontroll ren. Verifierat i webbläsaren: skrev text med `*kursiv*`
  och `**fet**`, körde konverteringen, såg riktig kursiv/fetstil och
  inga asterisker kvar i varken den redigerbara ytan eller den rena
  texten — samt en ny "Formatering"-rad i kapitlets Historik med
  originaltexten bevarad.

**Ändringslogg v0.99.46 → v0.99.47:** Städat bort gamla exempeltexter ur
tomma formulärfält, efter att författaren märkte att Synopsis-fältet
visade "Emma keeps the night keys..." — en kvarleva från appens tidiga
testmanus (Emma/kanalen, en blind passagerare, Henrik och Elin). Bytt mot
korta, rent instruerande texter utan påhittad handling, på alla tre språk.

- **Synopsis**: "Emma har nattnycklarna..." → "Berättelsen i några
  meningar."
- **Brainstorm-lapp**: "En mystisk blinda passagerare..." → "En idé…"
- **Fråga (Brainstorm)**: "Vem är blinda passageraren?..." → "Ställ en
  fråga…"
- **Instruera en lapp**: "Ge två slut..." → "Vad ska ändras?"
- **Skriv om (högerklick)**: "Kortare. Mer spänning. I Emmas röst..." →
  "Vad ska ändras?"
- **Skriv en beat**: "Hon öppnar brevet..." → "Vad händer härnäst, i en
  rad"
- **Fråga manuset**: "Var träffades Henrik och Elin?" → "Ställ en fråga
  om ditt manus…"
- **Författarröst**: "Torr, maritim, korta meningar" → "Ton, rytm,
  ordval"
- **Story Bible-taggar**: "medelålders, dubbel natur" → "Kommaseparerade
  drag"
- **Intervju-personlighet**: "T.ex. Korthugget, ser alltid problem
  först" → "Hur de pratar och reagerar"
- Fält som redan var korta och rent instruerande (Titel, Namn, Sök,
  kapitelbrief, scenbrief m.fl.) lämnade orörda — de var redan precis
  det författaren efterfrågade.
- 689/689 gröna, typkontroll ren. Verifierat i webbläsaren: Synopsis,
  Brainstorm-lappen och Fråga manuset visar alla de nya, korta texterna.

**Ändringslogg v0.99.45 → v0.99.46:** De 10 "?"-knapparna ute i appen
(Story Bible, Kapitel, Brainstorm & Synopsis ×2, Utvecklingsmetod, Trådar,
Timeline, Korrekturläsning, Fråga manuset, Publicera) navigerar inte
längre bort till gamla Guiden — de visar nu gamla Guidens rubrik+text som
en tooltip direkt vid knappen, vid hover eller tangentbordsfokus.
Författaren testade och tyckte alla frågetecken kändes som en omväg ut ur
det man höll på med.

- Ny delad `GuideHelpButton` i `GuidePanel.tsx` (tidigare en privat kopia
  i `Editor.tsx`, plus en egen inline-knapp i `BiblePanel.tsx` — nu en
  enda komponent båda filerna importerar). Ingen `onOpen`-prop längre;
  knappen sköter sig helt själv.
- Tooltipen renderas via en React-portal rakt i `document.body`, positionerad
  med `position: fixed` beräknad från knappens egen `getBoundingClientRect()`
  och klämd innanför skärmens högerkant. Nödvändigt eftersom flera av
  knapparna sitter i vänster-/högerpanelerna (`.rail`, `overflow-y: auto`)
  — webbläsaren klipper då även horisontellt, så en vanlig
  `position: absolute`-tooltip där blev osynligt avklippt (upptäckt och
  fixat under verifieringen, inte något författaren behövde rapportera).
- `store.showGuide()`/`openGuide()` och gamla `GuidePanel`-sidan finns kvar
  oförändrade — nås fortfarande av felbannerns "Ingen lokal modell"-länk.
  Bara "?"-knapparnas egen navigering togs bort.
- 689/689 gröna, typkontroll ren. Verifierat i webbläsaren: hover visar
  tooltipen med rätt rubrik/text från gamla Guiden, klick navigerar inte
  längre bort (ingen flikbyte sker), och tooltipen stängs när musen flyttas
  bort eller vid Escape.

**Ändringslogg v0.99.44 → v0.99.45:** Guiden delas i två separata ytor —
en ny "Handbook" ersätter den gamla Guiden som appens avsiktliga,
sammanhängande genomgång (nås via toppmenyns "Guide"-knapp, förstasidans
"Läs snabbstarten" och ett nytt tomt manus), medan den gamla Guiden lever
kvar oförändrad som underlag för alla "?"-knappar ute i appen (framtida
tooltip-material). Författaren skrev hela den nya guidens innehåll: 47
avsnitt i 8 numrerade kategorier (Kom igång, Så kan du arbeta, Planera
berättelsen, Story Bible & världen, Skriva, Bearbeta manuset, Bilder/
publicering/backup, Hjälp & felsökning), numrerade "kategori.avsnitt"
(t.ex. "3.4 Berättelsemetoder") istället för en platt 1–47-lista.

- Ny `EditorSurface`-variant `"handbook"` och `store.showHandbook()`,
  helt parallell med den befintliga `"guide"`-ytan — ingen av de 10
  befintliga "?"-knapparna (Story Bible, Kapitel, Trådar, Timeline,
  Korrekturläsning, Fråga manuset, Publicera, Utvecklingsmetod,
  Brainstorm & Synopsis) eller felbannerns "no-model"-länk rörda; de
  öppnar exakt samma gamla Guide-innehåll som innan.
- Nytt tomt manus öppnas nu på Handbook istället för gamla Guiden
  (`openingSurface()`) — den nya guidens första tre avsnitt (Koppla en
  lokal AI, Skapa din första bok, Ditt första kapitel) är skrivna
  precis för det ögonblicket.
- Ny fil `HandbookPanel.tsx`, samma tabb-mönster som `GuidePanel.tsx`
  men enklare (inga ankare/scrollTo, ingen FAQ-lista — bara åtta
  kategoriflikar och en löpande numrering räknad från flikens position).
  "Koppla en lokal AI"-avsnittet får samma "Anslut en lokal AI"-knapp
  och popup som gamla Guidens Kom igång-flik.
- Fullt innehåll på alla tre språk (svenska efter författarens text,
  engelska och norska översatta i samma veva) — 47 avsnitt × 3 språk.
  Löptexten lagras som en sträng med radbrytningar (pilkedjor, korta
  rubrikrader, punktlistor) och renderas med `white-space: pre-line`
  (`.handbook-body`) snarare än en egen rich text-modell — enklast som
  fungerar för hur texten faktiskt är skriven.
- Passade på att fixa en sedan tidigare bugg upptäckt under arbetet:
  gamla Guidens 8 första flikrubriker stod kvar på engelska i både
  sv.ts och nb.ts (bara "Felsökning"/"Feilsøking" hade någonsin
  översatts) — nu översatta på båda språken.
- 689/689 gröna (en befintlig test uppdaterad för att förvänta sig
  `"handbook"` istället för `"guide"` som ny boks öppningsyta),
  typkontroll ren. Verifierat grundligt i webbläsaren: förstasidans
  snabbstartslänk och ett nytt tomt manus öppnar båda den nya Handbook
  med rätt 8 flikar och "kategori.avsnitt"-numrering; en "?"-knapp i ett
  kapitel öppnar fortfarande oförändrat den gamla Guiden.

**Ändringslogg v0.99.43 → v0.99.44:** Ny FAQ-punkt i Guidens Felsökning
om att köra appen på en annan dator/mobil i hemnätverket — uppstod ur en
fråga från författaren om appen (som medvetet aldrig går ut på internet)
ändå kan nås från andra enheter i samma hemnätverk.

- Ny punkt "Kan jag köra appen på en annan dator eller mobil i mitt
  hemnätverk?" mellan "Var lagras min bok?" och "Kan jag använda en
  betald AI-tjänst istället?" i alla tre språk. Svaret täcker två skilda
  saker: att nå själva appen (`npm run dev -- --host` + nätverksadressen
  terminalen visar) och att den lokala AI-modellen (t.ex. Ollama) också
  måste tillåta det (`OLLAMA_HOST=0.0.0.0`, `OLLAMA_ORIGINS`, samt
  modellinställningen i appen pekad mot nätverksadressen istället för
  localhost) — plus en tydlig varning om att varje enhet har sitt eget
  bibliotek (ingen delad bok mellan enheter utan Backup/Återställ).
- `GUIDE_FAQ_IDS` fick ett nytt id (`"network"`), infogat mellan
  `"storage"` och `"cloud"` — ren textändring, ingen ny logik.
- 689/689 gröna, typkontroll ren (samma kända, orelaterade
  `BrainstormBoard.tsx`-fel som tidigare). Verifierat i webbläsaren att
  den nya punkten dyker upp i rätt ordning i Felsöknings-fliken.

**Ändringslogg v0.99.42 → v0.99.43:** Fetstil, kursiv och understruket i
kapitelprosan — den säkrare vägen som skissades upp innan bygget: formatering
lever helt vid sidan av texten, aldrig inbäddad i den.

- Markera ett stycke text i ett kapitel och en liten verktygsrad
  (Fet/Kursiv/Understruken) dyker upp ovanför markeringen — eller
  Ctrl+B/I/U. Klicka igen för att ta bort formateringen från exakt den
  markeringen; övrig formatering i kapitlet rörs inte.
- `chapter.prose` är fortfarande, bokstavligen, bara en textsträng —
  precis som innan. Ny valfri kolumn `chapter.formatting`: en lista med
  teckenintervall ("tecken 40 till 52 är fet") som pekar in i den
  strängen, aldrig tecken inbäddade i den. Allt som läser prosan direkt
  — AI-prompterna, fakta-extraktionen, korrekturläsningen, ordräkningen
  — fortsätter läsa exakt samma rena text som innan. Modellen ser
  aldrig en `<b>`, ett `**`, eller något annat formateringstecken.
- Höger­klicksmenyns Förläng/Brodera ut/Skriv om/Skriv en beat/Manuell
  redigering flyttar och klipper formateringsintervallen korrekt när de
  ändrar texten, så en fet mening längre ner i kapitlet inte hoppar iväg
  när AI:n skriver in något tidigare i texten.
- Skriv utkast (som bygger vidare på det som redan finns) behåller
  formateringen på den gamla texten och lägger bara till oformaterad ny
  text. Omskriv (som skriver om hela kapitlet från grunden) och en
  återställd version från Historik nollställer formateringen istället —
  den gamla positionen stämmer inte längre mot en helt ny text.
- **Kända avgränsningar för den här första versionen**, medvetet
  avgränsat för att hålla ändringen hanterbar: scen-nivåns Skriv
  utkast/Omskriv nollställer HELA kapitlets formatering (inte bara den
  berörda scenen) tills en mer exakt scen-nivå-lösning byggs. Synopsis
  och Brainstorm har ännu ingen formatering — bara kapitelprosan. Export
  till RTF/ODT/HTML/ePub/PDF skriver ännu inte ut den fetstil/kursiv man
  satt i appen — texten kommer ut ren, som innan.
- Ny fil `proseFormatting.ts` (skift/växla/slå-ihop-logik för
  intervallen, 22 nya tester), `htmlFromProse` i `proseFlow.ts` gjord
  formateringsmedveten (5 nya tester, alla gamla oförändrade), två nya
  DOM-funktioner i `proseDom.ts` för att läsa av och återställa
  formatering/markering i redigeringsytan (verifierat i webbläsaren,
  ingen jsdom i det här projektets testuppsättning).
- 689/689 gröna, typkontroll ren. Verifierat grundligt i webbläsaren:
  markerade tre olika ord, satte fet/kursiv/understruken på var och en
  (inklusive Ctrl+U-genvägen), togglade av fetstilen igen och såg bara
  den ordets formatering försvinna, skrev mer text efteråt utan att
  något gick sönder, stängde och öppnade kapitlet igen och såg
  formateringen ligga kvar. Höger­klicksmenyn och Manuell
  redigering-dialogen fungerar oförändrat sida vid sida med den nya
  verktygsraden.

**Ändringslogg v0.99.41 → v0.99.42:** Guidens textblock 33% bredare —
författaren ville testa mer läsbredd under flikarna.

- `.guide-block` (varje flik-sektions textinnehåll) gick från 42rem
  till 56rem — 42 × 4⁄3 = 56, exakt 33% bredare. Berör alla flikar
  utom snabbstartskortens rad (den har redan `max-width: none` för
  sitt tre-kolumns-rutnät).
- Ren CSS-ändring, ingen ny logik. Verifierat i webbläsaren på
  Introduction och Advanced Writing Tools (den flik med flest
  staplade avsnitt) — ryms fint utan att tränga in i Story
  Bible-panelen till höger.

**Ändringslogg v0.99.40 → v0.99.41:** Felsökning fick sin egen flik,
längst till höger — författaren skickade en skiss av hur han ville ha
det, med en nionde flik utöver de åtta som redan fanns.

- Felsökningsfrågorna ("Ingen lokal modell hittades", var boken
  lagras, varför inga betaltjänster) låg tidigare alltid synliga under
  Introduction, oavsett om man brydde sig om dem just då. De har nu
  en egen flik, "Troubleshooting", sist i raden.
- Alla befintliga genvägar dit — länken "Se snabbstartsguiden" i
  felmeddelandet när ingen lokal modell hittas, med flera — landar
  fortfarande rätt, bara på den nya fliken istället för på
  Introduction.
- 662/662 gröna, typkontroll ren. Verifierat i webbläsaren: fliken
  ligger sist i raden, Introduction visar bara sekretesstexterna nu,
  och genvägen från felmeddelandet öppnar rätt flik.

**Ändringslogg v0.99.39 → v0.99.40:** "Getting Started" döpt om till
"Introduction" och rensad — de tre gråa installationskorten (Installera
server / Välj modell / Anslut den) ligger inte längre statiskt i vägen
för sekretesstexten, utan nås via en knapp istället.

- Fliken heter nu Introduction. Överst en enda orange knapp, "Connect
  a local AI" — klick öppnar en popup med exakt samma tre kort som
  innan (helt oförändrat innehåll, bara flyttat bakom en knapp).
  Escape eller Stäng-knappen stänger popupen igen.
- Under knappen står nu bara det som faktiskt är introduktionen: "Ett
  helt stängt digitalt kassaskåp" och "Författaren vinner alltid över
  AI:n", följt av Felsökning precis som innan.
- Hemsidans egna tre kort (samma `QuickstartCards`-komponent) rörs
  inte — bara Guidens kopia av dem flyttades bakom knappen, eftersom de
  redan syns där nya användare först landar.
- 662/662 gröna, typkontroll ren. Verifierat i webbläsaren: fliken
  heter Introduction, korten syns inte förrän man klickar knappen, och
  popupen stänger både via Stäng och Escape.

**Ändringslogg v0.99.38 → v0.99.39:** Två snabba finslip på gårdagens
flikindelade Guide.

- Flikknapparna (Getting Started, Basic Writing, osv.) använder nu
  appens orange märkesfärg (`--ink`) istället för den tidigare
  diskreta grå tonen — outline på vilande flikar, helt fylld på den
  aktiva — så de syns tydligt som klickbara mot den mörka bakgrunden.
- Tog bort "Så jobbar du med StoryBook AI"-stegen (1. Starta ditt
  manus / 2. Skriv) under snabbstartskorten på Getting Started —
  dubbelt upp nu när Basic Writing-fliken redan täcker det. De tre
  snabbstartskorten (installera server, välj modell, koppla den)
  ligger kvar oförändrade.
- 662/662 gröna, typkontroll ren. Verifierat i webbläsaren: flikarna
  är orange i både vilande och aktivt läge, stegtexten är borta,
  snabbstartskorten finns kvar.

**Ändringslogg v0.99.37 → v0.99.38:** Guiden omgjord från en lång
scroll till flikar — författarens observation: appen har vuxit sig för
stor för att någon ska orka läsa igenom en enda lång text, och han hade
rätt i att den behövde delas upp.

- 8 flikar istället för en enda lista: Getting Started (sekretess,
  författaren-vinner-över-AI, snabbstart mot en lokal AI-server,
  felsökning), Basic Writing (kapitel: Skriv utkast/Omskriv/Analysera),
  The Writer (ny text: högerklicksmenyn, en bild till kapitlet), Images
  (ny text: illustrationsprompter och stilbiblioteket), Focused
  Workflow (Brainstorm & Synopsis), Advanced Writing Tools
  (Utvecklingsmetod, Trådar, Scener, Timeline — författarens egen
  gruppering), Story Bible (Story Bible, kontinuitetsvarningar) och
  Polish & Publish (korrekturläsning, fråga manuset, publicera).
- Två helt nya avsnitt skrevs från grunden: högerklicksmenyn
  (Förläng/Brodera ut/Skriv om/Skriv en beat/Illustrationsprompt/Manuell
  redigering) och illustrationsprompter fanns inte alls i Guiden innan,
  trots att båda är riktiga, befintliga funktioner.
- Alla "?"-knappar i appen (t.ex. bredvid Utvecklingsmetod, Fråga
  manuset, Story Bible) pekar fortfarande rätt — de öppnar nu bara rätt
  flik också, inte bara rätt stycke. Story Bible-avsnittet uppdaterades
  samtidigt för att nämna att Intervjua numera fungerar för alla
  korttyper, inte bara karaktärer.
- `guide.sections` gick från en ordningsberoende array (skör — fel
  ordning i en enda språkfil hade parat ihop fel rubrik med fel text)
  till en `Record` nyckel-för-nyckel, så TypeScript numera flaggar om
  en sektion saknas i något språk.
- 662/662 gröna (ingen ny kärnlogik, bara innehåll och layout),
  typkontroll ren. Verifierat i webbläsaren: alla 8 flikar visar rätt
  innehåll, snabbstart och felsökning syns bara under Getting Started,
  och fyra olika "?"-knappar (Utvecklingsmetod, Fråga manuset, Kapitel,
  Story Bible) landade alla på rätt flik och rätt stycke.

**Ändringslogg v0.99.36 → v0.99.37:** Intervjun öppnad för hela Story
Bible, inte bara karaktärer — svar på författarens fråga: vissa
skriver fram sin lore först, andra kastar sig rakt in i prosan och vill
kunna fråga ut en by som just nämndes som fakta för att bygga ut den.

- "Intervjua"-knappen fanns tidigare bara på karaktärskort. Den finns
  nu på alla korttyper (platser, föremål, grupper, händelser, koncept).
  "Extrahera fakta ur samtalet"-knappen i intervjurutan fanns redan och
  är oförändrad — den återanvänder samma fakta-extraherare som
  kapitelextraktion och loreimport, så svaren kunde redan bli riktiga
  Story Bible-fakta. Det som saknades var bara tillgången för andra
  korttyper än karaktärer.
- Prompten skiljer nu på korttyp. Karaktärer fungerar precis som förut:
  modellen SVARAR SOM karaktären, i jag-form. För allt annat (en by, ett
  föremål, en grupp …) är modellen istället författarens
  världsbyggar-kollega som svarar i tredje person, utgår från det som
  redan är etablerat och föreslår rimliga, konkreta tillägg när något
  saknas — tydligt som förslag, aldrig som redan bestämt.
- Rutans text anpassar sig också: "Fråga om Ravendal" istället för
  "Intervjua Ravendal", "Fråga något om Ravendal…" istället för "Fråga
  Ravendal något…" och så vidare. "Personlighet"-fältet (för att testa
  fram en karaktärs röst) visas bara för karaktärer — en by har ingen
  röst att stämma av.
- Ny `kind`-parameter i `characterInterviewSystem()`, 3 nya tester (rätt
  tredjepersons-ramning, rätt förslag när inget är etablerat om en
  plats, inget personlighetsfält läcker in för icke-karaktärer). 662/662
  gröna, typkontroll ren. Verifierat i webbläsaren: skapade en plats
  ("Ravendal") och en karaktär ("Henrik") i samma bok — platsen fick
  "Fråga om Ravendal" utan personlighetsfält, karaktären fick precis
  samma "Intervjua Henrik"-upplevelse som innan, ingen regression.

**Ändringslogg v0.99.35 → v0.99.36:** Varning vid kapitelradering om
Story Bible-fakta kommer därifrån — svar på författarens fråga om vad
som händer med fakta när ett kapitel skrivs om eller raderas. Svaret
var: ingenting automatiskt, fakta finns bara kvar, oavkortade och utan
koppling till någon kapiteltext. Det gäller fortfarande (ingen
auto-korrigering byggd), men nu varnas författaren om det innan hen
raderar.

- Både "×" (flytta till Borttagna kapitel — går att ångra) och "Kasta
  för gott" (permanent, går inte att ångra) i kapitellistan visar nu,
  om kapitlet har låsta fakta i Story Bible som kom just därifrån, en
  extra rad i bekräftelserutan: "N fakta i Story Bible kommer från det
  här kapitlet. De tas inte bort eller ändras automatiskt — kolla
  Story Bible om du vill uppdatera eller ta bort dem för hand." Har
  kapitlet inga sådana fakta ser bekräftelserutan ut precis som förut.
- Ny funktion `lockedFactsFromChapter()` i `NarrativeFact.ts`, 2 nya
  tester (hittar bara låsta, ej ersatta, fakta för rätt kapitel —
  ignorerar väntande/flaggade förslag och fakta från andra kapitel).
- 659/659 gröna. Verifierat i webbläsaren: skapade en karaktär medan
  Kapitel 1 var öppet (fakta fick `chapter_id` för Kapitel 1), försökte
  radera Kapitel 1 — bekräftelserutan visade rätt varningstext med
  korrekt singular/plural-form ("1 fact"/"N facts"), avbröt (inget
  hände), raderade på riktigt (kapitlet flyttades till Borttagna
  kapitel, sen kastades för gott) — fakta och karaktären fanns kvar
  orörda i Story Bible genom hela flödet, precis som varningen sa.

**Ändringslogg v0.99.34 → v0.99.35:** "Ta bort det här kortet" — en
riktig raderingsfunktion i Story Bible, svar på testarens fråga "am I
blind or is there really no way to delete the articles?". Det stämde:
det gick inte.

- Varje kort (karaktär, plats, föremål, grupp, händelse, koncept) har
  nu en "Ta bort det här kortet"-knapp bredvid "Intervjua" och "Dölj
  för utkast". Klick öppnar en bekräftelseruta med kortets namn och en
  tydlig varning om att det inte går att ångra; avbryt lämnar allt
  orört.
- Bekräftar man raderas kortet helt och på riktigt: alla dess fakta
  (låsta, väntande och tidigare ersatta — inte bara de synliga),
  karaktärsprofilen, bilderna, "dölj för utkast"-flaggan och en
  eventuell manuell kategori-ändring. Skiljer sig medvetet från hur
  fakta annars hanteras i Story Bible (aldrig raderade, bara ersatta av
  nyare fakta) — den principen gäller för ett kort som fortfarande
  finns kvar och utvecklas, inte för ett kort som aldrig borde funnits:
  en duplikat, ett testkort, en struken karaktär. "Dölj för utkast"
  fanns redan för att behålla ett kort men gömma det för modellen; nu
  finns även den riktiga raderingen.
- Ny ren funktion `deleteEntity()` i `src/core/deleteEntity.ts`, 3 nya
  tester. 657/657 gröna totalt. Verifierat i webbläsaren: skapade ett
  testkort, kontrollerade att bekräftelsetexten stämde, avbröt (kortet
  fanns kvar), raderade på riktigt (kortet, dess fakta och allt annat
  försvann direkt ur listan, rutan stängdes).

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

**Lärdom från projektet (2026-09-27):** tidigt drevs mycket av arbetet av
att leta upp vad "konkurrenter" (Scrivener, Sudowrite, Novelcrafter m.fl.)
har och lägga till det. En jämförelse mot alla tre visar att StoryBook AI
nu har, helt eller delvis, i princip allt de har — plus flera saker de
inte har. Men fler funktioner var aldrig automatiskt bra: ett verktyg med
för många funktioner riskerar att kännas spretigt och tappa sitt
huvudfokus, att skriva en bok. **Slutsats: inga fler funktioner läggs
till proaktivt.** Nästa fas är att polera det som redan finns (UI,
kantfall, skavanker som riktig användning avslöjar) i den takt verklig
testarfeedback faktiskt pekar ut — inte genom att jaga fler
konkurrentjämförelser. Ny funktionalitet vägs mot om den hjälper
skrivandet, inte mot vad ett annat verktyg råkar erbjuda.

**Samma princip, bekräftad från en annan vinkel (2026-10-14).** Under
researchen för en tänkt Campfire-importadapter (roadmap-ideas.md #28)
blev det tydligt att StoryBook AI:s eventuella användare kommer från
olika håll med olika förväntningar — rena författare (Scrivener-typen)
kontra de som rollspelar fram sin berättelse (Campfire/SillyTavern-
typen, med RPG-stats, kartor, relationsgrafer). Mats: "Det känns
faktiskt bra att vi avgränsar vad Storybook ska göra. Annars finns
risken att Storybook blir lite av varje och tappar sin styrka som är
författande. Det kan bli en app som kan göra allt men inte passar
någon." Samma slutsats som 2026-09-27, nu med en konkret
positionering att stå på: **StoryBook AI är ett verktyg för att SKRIVA
en berättelse; SandboxAI är en motor för att SPELA den.** En funktion
som hör hemma i "spela"-sidan (t.ex. RPG-stats, en relationsgraf,
kartor) hör av princip inte hemma i StoryBook AI, oavsett om ett
annat skrivverktyg som Campfire råkar erbjuda den.

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

**Varför lokal-first, utöver privat data:** fritt modellval löser ett
problem som ständigt dyker upp bland molntjänster (t.ex. återkommande
Reddit-diskussioner om "vilken moln-AI är minst censurerad") —
skönlitterärt skrivande behöver ofta kunna hantera mörka teman, våld
eller andra kontroversiella ämnen utan att bli nekat eller urvattnat
mitt i ett kapitel. Med lokal AI väljer författaren själv modell,
alltså själv hur strikt eller tillåtande den modellen är tränad/
finjusterad att vara — "är den här modellen för strikt för min bok"
blir en modellvalsfråga författaren styr över, inte en begränsning
appen eller en molnleverantör sätter. Medvetet argument för
lokal-first-principen, inte en funktion att bygga.

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
