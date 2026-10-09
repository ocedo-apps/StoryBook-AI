import type { Messages } from "./en";

export const sv: Messages = {
  common: {
    cancel: "Avbryt",
    close: "Stäng",
    stop: "Stopp",
    save: "Spara",
    copy: "Kopiera",
    copied: "Kopierat",
    infoAbout: "Mer om {field}"
  },
  app: {
    crash: "Appen stötte på ett fel.",
    tryAgain: "Försök igen",
    missingRoot: "Saknar elementet #root"
  },
  chrome: {
    language: "Språk",
    light: "Ljust",
    dark: "Mörkt",
    lightTitle: "Använd en ljus sida",
    darkTitle: "Använd en mörk sida"
  },
  appBar: {
    nav: "Manuskript",
    newManuscript: "Nytt manuskript…",
    viewAll: "Visa alla manuskript",
    goHome: "Gå till alla manuskript"
  },
  home: {
    headline: "Skriv prosan.",
    truth: "Story Bible håller sanning.",
    lede:
      "Ett lokalt manusverktyg. Ge boken en titel, väx fram berättelsen i Brainstorm, och lyft en Synopsis när den är redo. Modellen tar fram utkast till kapitlen — du bestämmer.",
    newManuscript: "Starta nytt manus",
    titlePlaceholder: "Titel",
    open: "Skapa",
    importBackup: "Importera backup",
    shelf: "Manus",
    shelfHeading: "Dina manus",
    searchPlaceholder: "Sök manus…",
    noSearchResults: "Inga manus matchar sökningen.",
    emptyShelf: "Inga manus ännu. En titel räcker för att börja.",
    delete: "Radera",
    deleteConfirm: "Radera “{title}”? Det går inte att ångra.",
    replaceConfirm: "Ersätt “{title}” med den här säkerhetskopian? Allt som skrivits sedan den filen går förlorat.",
    chapters: { one: "{count} kapitel", other: "{count} kapitel" },
    facts: { one: "{count} låst faktum", other: "{count} låsta fakta" },
    connectFound: { one: "Ansluten — {count} modell hittad.", other: "Ansluten — {count} modeller hittade." },
    connectNotFound:
      "Inte ansluten än. Har du ingen lokal AI-server? Vi rekommenderar Ollama — gratis, från ollama.com. Installera en modell (sök på ”stheno” för en anpassad för skönlitteratur, eller vilken vanlig chattmodell som helst, t.ex. llama3), så dyker den upp här automatiskt.",
    desktopInstallOllama: "Installera Ollama",
    desktopGpuSuggestion: "Baserat på grafikkortets minne (~{gb} GB) klarar den här datorn troligen {tier}.",
    desktopGpuTier3b: "en liten modell, ungefär 3 miljarder parametrar (4-bit)",
    desktopGpuTier7b: "en modell på ungefär 7-8 miljarder parametrar (4-bit)",
    desktopGpuTier14b: "en modell på ungefär 13-14 miljarder parametrar (4-bit)",
    desktopGpuTier30b: "en modell på ungefär 30-34 miljarder parametrar (4-bit)",
    desktopGpuTier70b: "en stor modell, 70 miljarder parametrar eller mer (4-bit)",
    desktopCheckUpdate: "Kolla efter uppdateringar",
    desktopCheckingUpdate: "Letar efter uppdateringar…",
    desktopUpdateAvailable: "En ny version finns ({latest}, du har {current}).",
    desktopViewChangelog: "Visa ändringslogg",
    desktopDownloadUpdate: "Ladda ner uppdatering",
    desktopUpToDate: "Du har den senaste versionen ({current}).",
    desktopUpdateCheckFailed: "Kunde inte kolla efter uppdateringar: {error}"
  },
  editor: {
    manuscriptTitle: "Manustitel",
    writing: "Skrivande",
    primer: "Startprompt",
    primerTitle: "Startprompt för den här skrivmodellen",
    primerLede: "Den går ut före varje skrivjobb. Kapitlets regler följer ändå. Tom betyder bara de reglerna.",
    primerRestore: "Använd startprompten",
    primerAria: "Startprompt för {model}",
    review: "Granskning",
    noModels: "Inga lokala modeller hittades",
    backup: "Säkerhetskopia",
    backupDue: "! Säkerhetskopia",
    backupDueTitle: "Manuset har ändrats sedan senaste JSON-säkerhetskopian",
    backupTitle: "Säkerhetskopia",
    appExport: "Exportera för andra appar",
    appExportTitle: "Ladda ner en StoryCore-export av manuset — låsta Story Bible-fakta och kapitel, till för att en syskonapp som ComicBook AI ska kunna importera. En ögonblicksbild, ingen levande koppling.",
    publish: "Publicera",
    archiveNav: "Arkiv",
    toolsNav: "Verktyg",
    settings: "Inställningar",
    settingsLede:
      "Hur det här manuset skrivs. Inte Story Bible. Kapitlen kan fortfarande överstyra kamera, röst och Läsare.",
    generalHeading: "Allmänt",
    typographyHeading: "Typografi",
    illustrationsHeading: "Illustrationer",
    proseLanguage: "Prosans språk",
    proseLanguagePlaceholder: "t.ex. engelska",
    proseLanguageTitle: "Språket meningarna skrivs på. Tomt gissar från manuset. En skrivinstruktion, inte kanon.",
    modelsHeading: "AI-inställningar",
    engineLabel: "Motor",
    engineOllama: "Ollama",
    engineOpenAiCompatible: "LM Studio / annan lokal server",
    engineLede: "Inga molntjänster eller konton, aldrig — bara en server som körs på den här datorn eller ditt lokala nätverk.",
    baseUrlLabel: "Serveradress",
    baseUrlPlaceholder: "http://localhost:1234",
    baseUrlLede: "Den lokala adress LM Studio (eller en annan lokal server, t.ex. llama.cpp) lyssnar på — visas oftast när du startar dess lokala server.",
    connectionPresetsCurrentLabel: "Nuvarande anslutning",
    connectionPresetActive: "Aktiv",
    connectionPresetUpdate: "Uppdatera",
    connectionPresetNew: "+ Ny modell",
    connectionPresetDelete: "Ta bort",
    connectionPresetDeleteConfirm: "Ta bort “{name}”? Det går inte att ångra.",
    connectionPresetNameLabel: "Namn på anslutning",
    contextWindowLabel: "Kontextfönster",
    contextWindowLede: "Hur mycket text modellen får veta att den faktiskt får titta på. Ollamas eget standardvärde är ofta mycket mindre än vad din modell och dator egentligen klarar, vilket kan göra att Draft tappar bort detaljer som skrevs bara ett stycke eller två tillbaka. Ett högre tal kräver mer minne (RAM/VRAM) — sänk det om genereringen blir mycket långsam eller misslyckas.",
    contextWindowSuggest: "Föreslå från modellen",
    contextWindowSuggesting: "Kontrollerar…",
    contextWindowSuggested: "Satt till {value}, modellens egna rapporterade maxvärde.",
    contextWindowSuggestError: "Kunde inte hämta det här från modellen — ange det för hand.",
    contextWindowOpenAiNote: "För LM Studio och andra OpenAI-kompatibla servrar sätts kontextlängden när du laddar modellen där, inte här.",
    filterLoreLabel: "Visa bara relevant lore för Skriv utkast",
    filterLoreLede: "Avstängt som standard. Lore-fakta (importerade, inte skrivna i ett kapitel) tas annars alltid med, oavsett om kapitlet faktiskt handlar om dem. Slå på det här om din Story Bible har mycket importerad lore och prompten börjar bli för stor — då tas bara lore vars namn (eller, för Händelser, en deltagare eller plats) nämns i kapitlets brief eller text hittills. Pinna en enskild lore-fakta för att alltid ta med den oavsett, med samma knapp som redan finns i Story Bible.",
    historyLimit: "Versioner",
    historyLimitLede:
      "Hur många tidigare versioner av ett kapitel som sparas, från Skriv utkast, Omskriv, Förläng, Utveckla och Skriv om. Så fort gränsen nås försvinner den äldsta versionen först. Det du skriver själv för hand sparas inte som en egen version — bara de här åtgärderna gör det.",
    dropCapLabel: "Anfang",
    dropCapLede:
      "En stor begynnelsebokstav på varje kapitels första stycke, som sträcker sig över valt antal rader. Visas direkt i skrivytan och följer med till Publish-export (HTML, ePub, RTF, ODT; PDF inte än).",
    dropCapOff: "Av",
    dropCapLines: "{n} rader",
    bodyFontLabel: "Typsnitt",
    bodyFontLede:
      "Typsnittet för manusets brödtext — i själva redigeraren, och med i varje export från Publish, så det blir ett val istället för ett separat, osparat val varje gång.",
    fontCategorySerif: "Serif",
    fontCategorySans: "Sans serif",
    uiLanguageStays: "Sidans språk ligger kvar i headern.",
    brainstorm: "Brainstorm",
    synopsis: "Synopsis",
    briefs: "Dispositioner",
    briefsLede:
      "Varje kort är ett kapitel. Dra ett kort så följer det med, och de andra glider undan. Dubbelklicka på en titel för att skriva kapitlet.",
    reorderBriefs: "Kapiteldispositioner. Dra för att byta ordning.",
    openChapter: "Skriv {title}",
    chapters: "Kapitel",
    add: "Lägg till",
    untitled: "Namnlöst",
    removeChapter: "Radera {title}",
    removeChapterFallback: "kapitel",
    discardChapterConfirm: "Flytta “{title}” till Borttagna kapitel?",
    discardedChapters: "Borttagna kapitel",
    restoreChapter: "Återställ {title}",
    restoreDiscarded: "Återställ",
    throwAwayChapter: "Kasta {title}",
    throwAwayConfirm: "Kasta “{title}” för gott? Kapitlet försvinner. Det går inte att ångra.",
    chapterFactsNote: {
      one: "{count} faktum i Story Bible kommer från det här kapitlet. Det tas inte bort eller ändras automatiskt — kolla Story Bible om du vill uppdatera eller ta bort det för hand.",
      other: "{count} fakta i Story Bible kommer från det här kapitlet. De tas inte bort eller ändras automatiskt — kolla Story Bible om du vill uppdatera eller ta bort dem för hand."
    },
    reorderChapters: "Kapitel. Dra för att ändra ordningen.",
    showBrief: "Visa disposition för {title}",
    hideBrief: "Dölj disposition för {title}",
    continuesCleared:
      "{title} fortsätter inte längre från “{from}”, för det kapitlet kommer senare. Nu följer det föregående i listan.",
    voice: "Författarröst",
    voicePlaceholder: "Ton, rytm, ordval",
    chapterVoiceInherit: "Manusets röst",
    manuscript: "Manus",
    brief: "Disposition",
    briefPlaceholder: "Vad kapitlet måste göra. En skrivinstruktion, inte kanon.",
    chapterTitle: "Kapitelrubrik",
    chapterBrief: "Kapiteldisposition",
    chapterVoice: "Kapitlets författarröst",
    voiceCue: "Författarröst",
    reader: "Läsare",
    readerTitle: "Vem texten skrivs för. Välj den åldersgrupp som stämmer bäst — Vuxen skriver utan åldersgränser i åtanke.",
    readerTierHint:
      "Kapitel som skrivs för den här läsaren får kortare meningar och enklare ord, anpassat efter åldersgruppen. Korrekturläsningen flaggar dessutom svordomar, våld eller explicit innehåll som inte passar den åldern.",
    readerCategories: {
      board: "Pekbok (upp till 3 år)",
      early: "Lättläst (4–7 år)",
      chapter: "Kapitelbok (8–9 år)",
      middle: "Mellanålder (10–12 år)",
      ya: "Ungdom (13–17 år)",
      adult: "Vuxen"
    },
    chapterReader: "Kapitlets läsare",
    chapterSettingsToggle: "Kapitlets inställningar",
    chapterReaderInheritOption: "Samma som manuset — {category}",
    readerCue: "Läsare",
    placeholdersCue: "Har en platshållare att återkomma till",
    newStrand: "ny tråd",
    startChapter: "Börja kapitel {n}",
    draft: "Skriv utkast",
    extract: "Extrahera fakta",
    extracting: "Extraherar…",
    analyze: "Analysera",
    askPassage: "Fråga om kapitlet…",
    proofread: "Korrekturläsning",
    notes: "Anteckningar",
    history: "Historik",
    recast: "Omskriv prosan",
    recasting: "Omskriver…",
    recastTitle: "Omskriv kapitlet till nuvarande perspektiv, tempus och synvinkel",
    stop: "Stopp",
    brainstormChat: "Bolla idéer…",
    openSynopsis: "Öppna synopsis",
    maximize: "Maximera",
    restore: "Återställ",
    maximizeTitle: "Dölj paneler och skriv",
    restoreTitle: "Visa paneler (Esc)",
    pinPanel: "Nåla fast panelen",
    unpinPanel: "Dölj panelen automatiskt — för muspekaren mot kanten för att ta fram den igen",
    brainstormLede:
      "Privat kladd. En lapp per idé. Dra dem fritt — det finns ingen ordning än. När en lapp är redo drar du den till kolumnen Till synopsis till höger.",
    brainstormPlaceholder: "En idé…",
    synopsisLede:
      "Berättelsen i kortform: vem som är med, vad som händer, och var den landar. Utkast utgår alltid från den här sammanfattningen — men inget blir bindande förrän du låser det som fakta.",
    synopsisPlaceholder: "Berättelsen i några meningar.",
    chapterPlaceholder: "Kapitlet lever här. Skriv utkast, skriv om tills det är ditt.",
    chapterImageAdd: "Lägg till kapitelbild",
    chapterImageReplace: "Byt bild",
    chapterImageRemove: "Ta bort bild",
    instructTitle: "Ändra den här noten",
    instructHint: "Säg åt modellen vad den ska göra med den markerade noten. Bara det spannet byts ut.",
    instructPlaceholder: "Vad ska ändras?",
    instructAction: "Skriv om",
    addNote: "Ny lapp",
    removeNote: "Ta bort lapp",
    removeNoteConfirm: "Kasta den här lappen?",
    noteLabel: "Brainstorm-lapp",
    reorderNotes: "Dra för att flytta lappen",
    noteColor: "Lappens färg",
    noteColors: {
      paper: "Papper",
      rust: "Rost",
      sage: "Salvia",
      gold: "Guld",
      lilac: "Lila"
    },
    sendLane: "Till synopsis",
    sendLaneLede: "Släpp lappar här. Ordningen i kolumnen är ordningen de landar som stycken.",
    sendLaneEmpty: "Släpp lappar här",
    sendToSynopsis: "Skicka till synopsis",
    extractNoteFacts: "Plocka ut fakta",
    extractNoteFactsHint: "Hitta möjliga Story Bible-fakta i den här lappen. De hamnar i granskningskön som kandidater — inget blir kanon förrän du låser det.",
    extractSynopsisFacts: "Plocka ut fakta",
    extractSynopsisFactsHint: "Hitta möjliga Story Bible-fakta i det här synopsiset. De hamnar i granskningskön som kandidater — inget blir kanon förrän du låser det.",
    extractBriefFacts: "Plocka ut fakta",
    extractBriefFactsHint: "Hitta möjliga Story Bible-fakta i den här brief:en. De hamnar i granskningskön som kandidater — inget blir kanon förrän du låser det.",
    chapterSummary: "Kapitelsammanfattning",
    summaryPlaceholder: "Vad som faktiskt händer i det här kapitlet — skriv för hand, eller sammanfatta nedan när det finns text.",
    summarizeChapterAction: "Sammanfatta kapitel",
    summarizeChapterHint: "En kort sammanfattning av vad som händer i det här kapitlet, så att senare kapitels Skriv utkast/Fortsätt/Utveckla/Beat kan se det utan att behöva hela kapitlets text.",
    summarizing: "Sammanfattar…"
  },
  backup: {
    title: "Säkerhetskopia",
    body: "En JSON-kopia som appen kan läsa tillbaka. Importera backup på hyllan återställer den. Allt som skrivits sedan den filen går förlorat.",
    whatHappened: "Historik",
    whatHappenedPlaceholder: "Valfritt. Omskriv kapitel 2, ny författarröst på 3.",
    documentName: "Dokumentnamn",
    action: "Säkerhetskopia",
    errors: {
      "not-backup": "Den filen är inte en manussäkerhetskopia.",
      "sandbox-export": "Den filen är en kartexport från Sandbox. Importera den i Sandbox, inte här.",
      "not-manuscript": "Den filen är inte en StoryBook-manussäkerhetskopia.",
      "newer-format": "Den här säkerhetskopian kommer från en nyare StoryBook. Uppdatera appen och försök igen.",
      unreadable: "Manuset i filen gick inte att läsa."
    }
  },
  illustration: {
    fieldLabel: "Illustrationsstil",
    browseLibrary: "Bläddra i biblioteket…",
    libraryTitle: "Illustrationsstilar",
    searchPlaceholder: "Sök stilar…",
    searchResults: "Sökresultat",
    saveCurrentAsNew: "Spara nuvarande text som ny stil",
    select: "Använd den här stilen",
    edit: "Ändra",
    delete: "Ta bort",
    untagged: "Otaggade",
    noResults: "Inga stilar matchar.",
    newStyleTitle: "Ny stil",
    editStyleTitle: "Ändra stil",
    nameLabel: "Namn",
    promptTextLabel: "Prompttext",
    genreTagsLabel: "Genretaggar",
    genreTagsPlaceholder: "Kommaseparerat, t.ex. Fantasy, Äventyr",
    exampleImageLabel: "Exempelbild",
    uploadImage: "Ladda upp bild",
    replaceImage: "Byt bild",
    removeImage: "Ta bort bild",
    deleteConfirm: "Ta bort “{name}” från biblioteket? Det går inte att ångra.",
    promptTitle: "Illustrationsprompt",
    promptHint: "Genererad från stycket, låsta Story Bible-fakta och manusets illustrationsstil.",
    generating: "Genererar…",
    generateError: "Kunde inte generera en prompt den här gången.",
    viewFullImage: "Visa bilden i full storlek",
    noStyleSelected: "Ingen stil vald",
    customStyleLabel: "Egen prompt",
    editTextManually: "Redigera texten manuellt",
    hideManualEdit: "Dölj manuell text",
    orientationLabel: "Illustrationsformat",
    orientations: {
      landscape: "Liggande",
      portrait: "Stående"
    }
  },
  aiContext: {
    trigger: "Visa AI-kontext…",
    title: "AI-kontext",
    hint: "Exakt vad som skickades till modellen för det senaste jobbet, inklusive det som uteslöts.",
    empty: "Inget AI-jobb har körts än den här sessionen. Kör ett skriv- eller granskningsjobb och kom sedan tillbaka hit.",
    operation: "Jobb",
    model: "Modell",
    tokensEstimate: "~{n} tokens (grov uppskattning)",
    systemInstructions: "Systeminstruktion",
    whatWasSent: "Det som skickades",
    whatCameBack: "Vad modellen svarade (rått, oredigerat)",
    target: {
      prose: "kapitel",
      synopsis: "synopsis",
      brainstorm: "brainstorm-lapp"
    },
    operations: {
      draft: "Skriv utkast",
      recast: "Recast",
      extend: "Fortsätt",
      elaborate: "Utveckla",
      instruct: "Skriv om",
      "brainstorm-chat": "Brainstorm-chatt",
      "word-swap": "Ordalternativ",
      "sentence-split": "Meningsbrytning",
      "paragraph-break": "Styckebrytning",
      extract: "Extrahera fakta",
      analyze: "Analysera",
      illustrate: "Illustrationsprompt",
      proofread: "Korrekturläsning",
      "ask-manuscript": "Fråga manuset",
      "ask-passage": "Fråga om passage",
      interview: "Karaktärsintervju",
      develop: "Utvecklingsmetod",
      "extract-interview": "Extrahera fakta (intervju)",
      "extract-brainstorm": "Extrahera fakta (brainstorm)",
      "extract-synopsis": "Extrahera fakta (synopsis)",
      "extract-brief": "Extrahera fakta (brief)",
      "import-lore": "Importera lore",
      beat: "Skriv en beat",
      summarize: "Sammanfatta kapitel"
    }
  },
  askManuscript: {
    nav: "Fråga manuset",
    title: "Fråga ditt manus",
    placeholder: "Ställ en fråga om din berättelse. Svaret använder bara det som faktiskt är skrivet — med de kapitel det hämtats från, så att du själv kan kontrollera det.",
    action: "Fråga",
    asking: "Frågar…",
    answerHeading: "Svar",
    sourcesHeading: "Källor",
    jumpToChapter: "Öppna ”{chapter}”"
  },
  askPassage: {
    title: "Fråga om det här kapitlet",
    lede: "Fråga vad som helst om kapitlets hantverk — tempo, spänning, röst, om slutet funkar. Var så kritisk du vill, det här är bara till för att läsas, inget sparas.",
    placeholder: "T.ex. ”Bygger det här upp mot ett starkt slut?”",
    action: "Fråga",
    asking: "Frågar…",
    answerHeading: "Svar"
  },
  interview: {
    action: "Intervju",
    title: "Intervjua {name}",
    titleWorld: "Fråga om {name}",
    lede: "Ett privat samtal med {name}, byggt bara på det som hittills är låst i din Story Bible. Inget som sägs här blir kanon av sig självt — ett sätt att höra rösten och upptäcka luckor i det som är etablerat.",
    ledeWorld: "Ett privat samtal om {name}, byggt bara på det som hittills är låst i din Story Bible. Inget som sägs här blir kanon av sig självt — ett sätt att utforska idéer och upptäcka luckor i det som är etablerat.",
    placeholder: "Fråga {name} något…",
    placeholderWorld: "Fråga något om {name}…",
    ask: "Fråga",
    asking: "Frågar…",
    you: "Du",
    thinking: "{name} tänker…",
    thinkingWorld: "Tänker på {name}…",
    empty: "Inget frågat än. Börja samtalet med {name} nedan.",
    emptyWorld: "Inget frågat än. Börja utforska {name} nedan.",
    extractAction: "Plocka ut fakta",
    extracting: "Plockar ut…",
    extractAsOf: "Från och med",
    extractAsOfHint: "Vilket kapitel — eller, för ett kapitel som delats i scener, vilken scen — den här faktan hör till i berättelsens egen tidsordning, inte manusets sidordning. Ett Draft för hela kapitlet ser en fakta redan från kapitlets första sida; ett scen-för-scen-Draft ser den först från och med sin egen scen. Välj punkten där det faktiskt blir sant (t.ex. när två karaktärer möts första gången, eller en avslöjande vändning mitt i ett kapitel), inte bara vilket kapitel du råkar ha öppet.",
    extractWholeChapter: "Hela kapitlet",
    extractSceneFallback: "Scen {index}",
    personalityLabel: "Personlighet för det här samtalet — testa dig fram, spara till profilen när tonen känns rätt",
    personalityPlaceholder: "Hur de pratar och reagerar",
    personalitySave: "Spara till profilen"
  },
  brainstormChat: {
    title: "Bolla idéer",
    lede: "Ett löst samtal fram och tillbaka om din story — som att prata med en polare. Inget här är kanon, och inget sparas; dra själv in de idéer du fastnar för på brädet.",
    placeholder: "Skriv vad du tänker på…",
    send: "Skicka",
    sending: "Tänker…",
    you: "Du",
    partner: "Partner",
    thinking: "Tänker…",
    empty: "Inget sagt än. Börja bolla en idé nedan.",
    addToNotes: "Lägg till i anteckningar"
  },
  timeline: {
    nav: "Tidslinje",
    title: "Tidslinje",
    lede: "Läsordningen är inte alltid när saker händer. Ge ett kapitel en tidsnotering och flytta det för att se var det egentligen hör hemma, jämfört med var det ligger i manuset.",
    readingPosition: "Manusposition {n}",
    storyTimeCaption: "Kronologisk position",
    storyTimePlaceholder: "T.ex. ”Tre år tidigare”",
    storyTimeLabel: "Berättelsetid för ”{chapter}”",
    outOfOrder: "Avviker från läsordningen",
    moveEarlier: "Flytta tidigare",
    moveLater: "Flytta senare"
  },
  continuity: {
    leakCount: {
      one: "{count} fakta från senare i berättelsen",
      other: "{count} fakta från senare i berättelsen"
    },
    leakHint: "De här är redan låst sanning, men etablerade efter det här kapitlet — modellen kan ändå se dem här. Inte nödvändigtvis ett problem (kanske är det här kapitlet ett hopp framåt), men värt en snabb koll.",
    establishedIn: "Etablerad i ”{chapter}”"
  },
  placeholders: {
    count: {
      one: "{count} platshållare att återkomma till",
      other: "{count} platshållare att återkomma till"
    },
    empty: "Platshållare",
    jumpTo: "I ”{chapter}”"
  },
  darlings: {
    count: {
      one: "{count} älskling sparad",
      other: "{count} älsklingar sparade"
    },
    jumpTo: "I ”{chapter}”",
    restore: "Återställ",
    discard: "Släng för gott"
  },
  plotlines: {
    nav: "Trådar",
    title: "Trådar",
    lede: "Vilka trådar som går genom vilket kapitel, på en snabb blick. Bocka av ett kapitel mot varje tråd det rör.",
    chapterColumn: "Kapitel",
    addPlaceholder: "Ny tråds namn",
    addAction: "Lägg till",
    removeThread: "Ta bort tråden ”{title}”",
    renameLabel: "Trådens namn",
    cellLabel: "{chapter} — {thread}",
    emptyPlotlines: "Inga trådar än. Lägg till en nedanför för att starta matrisen.",
    emptyChapters: "Skriv ett kapitel först — matrisen behöver något att visa.",
    colorSwatchLabel: "Sätt ”{thread}” till färgen {color}",
    colorNames: {
      lime: "Limegrön",
      green: "Grön",
      cyan: "Turkos",
      blue: "Blå",
      violet: "Violett",
      magenta: "Magenta",
      orange: "Orange",
      coral: "Korall",
      grey: "Grå",
      charcoal: "Mörkgrå"
    },
    editAction: "Redigera",
    editLabel: "Redigera tråden ”{title}”",
    editTitle: "Redigera tråd",
    colorFieldLabel: "Färg",
    descriptionLabel: "Beskrivning (frivillig)",
    descriptionPlaceholder: "Visas som en tooltip över trådens namn och dess staplar",
    hideFromAiLabel: "Dölj för AI",
    hideFromAiHint: "Skickas inte med i Skriv/Fortsätt/Utveckla-prompten för kapitel taggade med den här tråden. Visas fortfarande för dig medan du skriver.",
    chapterThreadsLabel: "Trådar:"
  },
  method: {
    nav: "Utvecklingsmetod",
    title: "Utvecklingsmetod",
    lede: "En utvecklingsmetod är en färdig serie steg för att låta din berättelse växa från en gnista till en form. Den behåller aldrig något eget — varje steg skriver bara in i Synopsis eller Trådar, som du redan har. Hoppa över det här helt om du hellre skriver fritt.",
    pickerLede: "Välj en metod för att få en vägledd väg. Du kan ändra dig senare — inget som redan är skrivet tas någonsin bort.",
    useAction: "Använd den här metoden",
    changeAction: "Byt metod",
    noneAction: "Ingen metod — skriv fritt",
    activeBadge: "Används",
    beatsHeading: "Vändpunkter",
    beatsHint: "Varje vändpunkt nedan blev en tråd i Trådar. Öppna Trådar för att markera vilka kapitel som täcker vilken vändpunkt.",
    openPlotlines: "Öppna Trådar",
    assistAction: "Föreslå en start",
    assisting: "Tänker…",
    draftPlaceholder: "Skriv egen text, eller be assistenten om en start…",
    suggestionHeading: "Förslag",
    useSuggestionAction: "Använd den här texten",
    sendToSynopsisAction: "Skicka till Synopsis",
    sentToSynopsis: "Tillagd i Synopsis.",
    removeOldBeatsConfirm: {
      one: "Ta bort den {count} kvarglömda tråden från {method} — {titles}?",
      other: "Ta bort de {count} kvarglömda trådarna från {method} — {titles}?"
    },
    methods: {
      snowflake: {
        name: "Snowflake Method",
        description:
          "Börja med en enda mening och låt berättelsen växa utåt i några allt bredare omgångar. En förenklad, tre-stegs variant av Randy Ingermansons metod.",
        steps: {
          logline: {
            label: "En mening",
            prompt: "Sammanfatta hela berättelsen i en mening — karaktären, vad hen vill ha, och vad som står i vägen."
          },
          paragraph: {
            label: "Ett stycke",
            prompt: "Väx meningen till ett kort stycke: upptakten, konflikten som utvecklar den, vändpunkten på vägen, och hur det slutar."
          },
          synopsis: {
            label: "Full synopsis",
            prompt: "Väx stycket till en full synopsis — hela bokens form, scen för scen där det hjälper."
          }
        }
      },
      "three-act": {
        name: "Three-Act Structure",
        description: "Den klassiska formen upptakt / konfrontation / upplösning, som sju igenkännbara vändpunkter.",
        steps: {
          setup: { label: "Upptakt", hint: "Vardagsvärlden, innan berättelsen rubbar den." },
          inciting: { label: "Utlösande händelse", hint: "Händelsen som sätter berättelsen i rörelse." },
          "break-two": { label: "Steget in i andra akten", hint: "Karaktären bestämmer sig — det finns ingen väg tillbaka till vardagsvärlden." },
          midpoint: { label: "Mittpunkt", hint: "En falsk seger eller falskt nederlag som höjer insatserna." },
          "all-is-lost": { label: "Allt är förlorat", hint: "Lågpunkten — det ser ut som att karaktären inte kan vinna." },
          climax: { label: "Klimax", hint: "Den slutgiltiga konfrontationen som hela berättelsen har byggt mot." },
          resolution: { label: "Upplösning", hint: "Den nya vardagsvärlden, efter berättelsens förändring." }
        }
      },
      "save-the-cat": {
        name: "Save the Cat",
        description: "Blake Snyders 15 vändpunkter — en detaljerad, procentbaserad struktur som är populär i genrelitteratur och film.",
        steps: {
          "opening-image": { label: "Öppningsbild", hint: "En glimt av karaktärens värld innan berättelsen." },
          "theme-stated": { label: "Temat sägs", hint: "Någon säger, nästan i förbifarten, vad berättelsen egentligen handlar om." },
          "set-up": { label: "Upptakt", hint: "Världen, persongalleriet, och vad som saknas i karaktärens liv." },
          catalyst: { label: "Katalysator", hint: "Händelsen som sätter berättelsen i rörelse." },
          debate: { label: "Tvekan", hint: "Karaktären tvekar — kan hen verkligen göra det här?" },
          "break-two": { label: "Steget in i andra akten", hint: "Karaktären väljer att agera och lämnar den gamla världen bakom sig." },
          "b-story": { label: "B-berättelsen", hint: "En andra tråd börjar — ofta en relation som bär temat." },
          "fun-and-games": { label: "Löftet infrias", hint: "Grundidén levererar det den lovade — de klassiska scenerna." },
          midpoint: { label: "Mittpunkt", hint: "En falsk seger eller falskt nederlag; insatserna höjs, klockan börjar ticka." },
          "bad-guys-close-in": { label: "Motståndet trycker på", hint: "Både yttre och inre press hårdnar." },
          "all-is-lost": { label: "Allt är förlorat", hint: "Lågpunkten — ofta markerad av en förlust eller en död." },
          "dark-night": { label: "Själens mörka natt", hint: "Karaktären sitter kvar i förlusten innan hen hittar en väg framåt." },
          "break-three": { label: "Steget in i tredje akten", hint: "Karaktären hittar lösningen, ofta från B-berättelsens lärdom." },
          finale: { label: "Final", hint: "Karaktären agerar på lärdomen och löser berättelsens problem." },
          "final-image": { label: "Slutbild", hint: "En bild som speglar öppningsbilden och visar hur mycket som förändrats." }
        }
      },
      "hero-journey": {
        name: "Hero's Journey",
        description: "Campbells och Voglers mytiska struktur — tolv steg för en karaktär som lämnar den kända världen och återvänder förändrad.",
        steps: {
          "ordinary-world": { label: "Vardagsvärlden", hint: "Livet innan äventyret." },
          call: { label: "Kallelsen", hint: "Något rubbar vardagsvärlden." },
          refusal: { label: "Att avvisa kallelsen", hint: "Rädsla eller tvekan håller karaktären tillbaka." },
          mentor: { label: "Att möta mentorn", hint: "Någon ger karaktären det hen behöver för att gå vidare." },
          threshold: { label: "Att korsa tröskeln", hint: "Karaktären bestämmer sig och lämnar vardagsvärlden." },
          tests: { label: "Prövningar, allierade, fiender", hint: "Den nya världens regler, vänner och rivaler lärs in." },
          approach: { label: "Närmande till den inre grottan", hint: "Förberedelser inför den centrala prövningen." },
          ordeal: { label: "Den stora prövningen", hint: "Den centrala krisen — en beröring med döden, bokstavlig eller inte." },
          reward: { label: "Belöningen", hint: "Karaktären tar det hen kom för." },
          "road-back": { label: "Vägen tillbaka", hint: "Att bestämma sig för att fullfölja resan och återvända." },
          resurrection: { label: "Återuppståndelsen", hint: "En sista, mer avgörande prövning som bevisar att förändringen är äkta." },
          return: { label: "Återkomsten med elixiret", hint: "Karaktären kommer hem förändrad, med något att ge tillbaka." }
        }
      }
    }
  },
  guide: {
    nav: "Guide",
    title: "Guide",
    intro: "En kort genomgång — hur du får appen att prata med en modell, och vad allt gör när den väl gör det.",
    openFromHome: "Ny här? Läs snabbstarten",
    closeAction: "Stäng",
    fromErrorLink: "Se snabbstartsguiden",
    helpFor: "Guide: {topic}",
    connectAiButton: "Anslut en lokal AI",
    quickstartHeading: "Kom igång med en lokal AI",
    quickstartCards: [
      {
        heading: "Installera en lokal AI-server",
        body: "Har du inte redan en installerad rekommenderar vi Ollama — gratis, från ollama.com. Föredrar du något annat? LM Studio eller en annan lokal server fungerar också."
      },
      {
        heading: "Välj din AI-modell",
        body: "AI-modellen är det som faktiskt skriver och resonerar med dig. Vi rekommenderar en modell tränad för skönlitterär prosa, till exempel fluffy/l3-8b-stheno-v3.2 (sök efter \"stheno\" i Ollama). Annars fungerar vilken allmän chattmodell som helst — till exempel llama3 eller mistral."
      },
      {
        heading: "Koppla den till StoryBook AI",
        body: "Kör du Ollama? Inget att ställa in — StoryBook AI hittar den automatiskt. Kör du LM Studio eller en annan server istället? Öppna Inställningar → Modeller, välj den under Motor, och klistra in serveradressen den visar dig."
      }
    ],
    categories: {
      "getting-started": "Introduktion",
      "basic-writing": "Grundläggande skrivande",
      "the-writer": "Skrivverktyget",
      images: "Bilder",
      "focused-workflow": "Fokuserat arbetsflöde",
      "advanced-tools": "Avancerade skrivverktyg",
      "world-bible": "Story Bible",
      "polish-publish": "Polera & publicera",
      troubleshooting: "Felsökning"
    },
    sections: {
      privacy: {
        heading: "Ett helt stängt digitalt kassaskåp",
        body: "StoryBook AI är byggd kring en enda regel: ditt manus är din egendom, och det ska aldrig lämna din dator. Det finns ingen väg ut mot internet i själva appen — inga API-nycklar till ChatGPT, Claude eller andra molntjänster (det är inte en saknad funktion, utan ett medvetet val), och typsnitten ligger paketerade i appen istället för att hämtas utifrån. Din text lagras enbart lokalt i webbläsaren, och AI-modellen körs enbart på din egen processor. Den fristående skrivbordsappen (frivillig) kan kolla om det finns en nyare version av sig själv — aldrig av ditt manus, som den inte ens har tillgång till. Oavsett vad du skriver — dagbok, företagshemligheter eller nästa stora fantasy-epos — stannar varje bokstav hos dig."
      },
      author: {
        heading: "Författaren vinner alltid över AI:n",
        body: "Modellen föreslår, du bestämmer. En detalj modellen hittar på i prosan förblir ett förslag — visas med en lätt streckad understrykning — tills du låser den i Story Bible. Inget blir kanon av sig självt."
      },
      chapters: {
        heading: "Kapitel: Skriv utkast, Omskriv, Analysera",
        body: "Skriv utkast skriver ny prosa utifrån det som redan är etablerat. Omskriv skriver om samma kapitel i ett annat perspektiv eller tempus, med samma händelser kvar. Analysera granskar ett kapitel för vanliga skrivproblem utan att skriva om en enda rad — till exempel \"berätta\" istället för att visa (istället för \"Lisa var jättearg\" föreslår den kanske \"Lisa smällde igen dörren så att kaffekopparna skallrade\"), meningslös dialog, eller ett drag som krockar med ett låst karaktärsdrag. Läsare (i Inställningar, och per kapitel) anger vem texten skrivs för — Pekbok till Vuxen — så meningslängd och ordval matchar den åldern. Under texten växlar Ovanliga ord och Klichéer mellan två valfria markeringar — ovanliga ord för den läsaren, och formuleringar som låter AI-skrivna (\"ett bevis på\", överanvända tankstreck) — en i taget, avstängt som standard."
      },
      "editor-tools": {
        heading: "Högerklicksmenyn",
        body: "Markera ett stycke och högerklicka för Förläng (fortsätter där markeringen slutar), Brodera ut (utvecklar själva stycket), Skriv om… (din egen instruktion, t.ex. \"gör henne argare\"), Illustrationsprompt… (se Images) och Manuell redigering (skriv om bara det markerade stycket själv, för hand — resten av kapitlet ligger kvar). Högerklickar du istället utan att markera något får du ett enda val, Skriv en beat…: beskriv i en rad vad som händer härnäst, så skriver modellen bara den beaten — ett kort stycke, inte resten av scenen — och lägger in den precis vid markören. Markerar du ett stycke dyker det också upp en liten Fet/Kursiv/Understruken-verktygsrad ovanför (eller Ctrl+B/I/U) — bara visuell formatering, sparas separat från själva texten, så den når aldrig modellen."
      },
      "add-picture": {
        heading: "En bild till kapitlet",
        body: "Lägg till en egen bild — JPEG, PNG eller WebP — högst upp i ett kapitel. Den är dekorativ, inte AI-genererad: välj en fil från din dator så visas den ovanför kapitlets första rader, och följer med när du publicerar till HTML, ePub eller PDF."
      },
      "illustration-prompts": {
        heading: "Illustrationsprompter",
        body: "Markera ett stycke och välj Illustrationsprompt… i högerklicksmenyn. Modellen skriver en bildgenereringsprompt — inte en bild — byggd på stycket, dina låsta Story Bible-fakta och manusets illustrationsstil, redo att klistras in i vilket bildverktyg du än använder; StoryBook AI förblir helt lokal och genererar aldrig själva bilden. Sätt en standardstil under Inställningar → Illustrationsstil, eller öppna stilbiblioteket för att spara namngivna, återanvändbara stilar — var och en med egna genretaggar och en exempelbild — så att varje prompt håller samma look genom hela boken."
      },
      "brainstorm-synopsis": {
        heading: "Brainstorm & Synopsis",
        body: "Brainstorm är din privata anslagstavla — ett kladdpapper eller en tavla med post-it-lappar, en anteckning per idé, dragbar, ingen ordning krävs. Skriv utkast lutar sig aldrig mot en anteckning du inte lyft över till Synopsis. (Frågar du modellen om dina anteckningar, eller ber den förlänga eller utveckla en av dem, läser den förstås det du frågar om — men inget därifrån blir kanon eller läcker in i kapitel-skrivandet av sig självt.) Dra de idéer som håller till Synopsis: formen på hela boken, i några meningar. Det är detta AI-modellen lutar sig mot när den senare hjälper dig skriva kapitel."
      },
      method: {
        heading: "Utvecklingsmetod",
        body: "En valfri, färdig serie steg för att låta en gnista växa till en form — Snowflake, Three-Act Structure, Save the Cat eller Hero's Journey. Den behåller aldrig något eget: en vändpunktsbaserad metods vändpunkter blir trådar i Trådar, och Snowflakes steg skriver rakt in i Synopsis, precis som vilken annan anteckning du lyfter dit. Att byta metod, eller välja ingen alls, tar aldrig bort något som redan finns i endera."
      },
      plotlines: {
        heading: "Trådar (Plotlines)",
        body: "Håll koll på vilken tråd som går genom vilket kapitel i en tabell, så en tråd som varit tyst i tio kapitel är lätt att upptäcka."
      },
      scenes: {
        heading: "Scener",
        body: "Ett långt kapitel kan delas upp i scener — välj var en slutar och nästa börjar, namnge den, lägg till en kort anteckning. När ett kapitel har scener kan Skriv utkast, Omskriv och Analysera var för sig riktas mot bara en av dem."
      },
      timeline: {
        heading: "Timeline",
        body: "Läsordning och berättelsens egen tidsordning är inte alltid samma sak. Ge ett kapitel en tidsanteckning, och se hur boken faller ut sorterad efter när saker faktiskt händer, bredvid var det ligger i manuset."
      },
      "story-bible": {
        heading: "Story Bible",
        body: "Den enda sanningskällan för din berättelses fakta — vem någon är, var en plats ligger, vad ett namn betyder. Ett fakta börjar som ett förslag, från dig eller från en extraktion, och blir bara låst sanning när du godkänner det. Låsta fakta är det modellen får veta att den inte får motsäga — motsäger ett nytt förslag redan låst fakta (till exempel att någon plötsligt har bruna ögon fast du låst att de är blå) flaggas det extra tydligt i granskningskön. Öppna ett kort och tryck Intervjua för att chatta om det — i en karaktärs egen röst, eller för en plats, ett föremål, en grupp eller ett koncept, med en världsbyggar-kollega som diskuterar det i tredje person — byggt bara på det som hittills är låst. Ett sätt att höra en röst eller utforska lore och upptäcka luckor, inte skapa ny kanon. Är något som sägs värt att spara, tryck Plocka ut fakta för att föreslå det till Story Bible — samma granskningskö som all annan extraktion, inget läggs till förrän du godkänner. Ctrl-klicka (Cmd-klicka på Mac) på ett namn du känner igen var som helst i din text för att hoppa direkt till kortet — ett vanligt klick placerar bara markören där, som vanligt."
      },
      continuity: {
        heading: "Kontinuitetsvarningar",
        body: "När ett kapitel kan se ett fakta som bara etablerades senare i manuset flaggas det — inte nödvändigtvis fel, kanske är det en tillbakablick, bara värt en snabb koll. Korrekturläsningen går längre: den kontrollerar en persons eller ett föremåls registrerade plats genom hela berättelsen, i berättelsens egen tidsordning, och flaggar en förflyttning som ser omöjlig eller oförklarad ut med tanke på hur mycket tid som gått."
      },
      proofread: {
        heading: "Korrekturläsning",
        body: "En sista genomgång av hela manuset: grammatik, upprepade scener, stil- och känsloglidning mellan kapitel, åldersanpassning, en kontinuitetskontroll, en koll efter planterade detaljer som aldrig löses in (en pistol som visas i kapitel 4 men som ingen någonsin avfyrar), och en faktakontroll mot hela boken. När Läsare är satt till en barn- eller ungdomsnivå flaggar den dessutom svordomar, våld eller explicit innehåll som inte passar den åldern. Bara anteckningar — inget skrivs om åt dig. Den pausar och återupptar, och kollar bara om det som faktiskt ändrats."
      },
      "ask-manuscript": {
        heading: "Fråga manuset",
        body: "Ställ en fråga om din egen berättelse och få ett svar byggt bara på det som faktiskt är skrivet — med kapitlen det kom från, så att du kan kontrollera det själv."
      },
      publish: {
        heading: "Publicera",
        body: "Exportera en ren läskopia — Markdown, RTF, ODT, HTML, ePub eller PDF. Brainstorm lämnar aldrig boken; bara själva manuset gör det."
      }
    },
    faqHeading: "Felsökning",
    faq: [
      {
        heading: "”Ingen lokal modell hittades”",
        body: "StoryBook AI når inte din lokala server. Kör du Ollama? Se till att den är igång. Kör du LM Studio eller en annan server? Kolla Inställningar → Modeller — motorn och serveradressen måste stämma med det som faktiskt körs på din dator."
      },
      {
        heading: "Var lagras min bok?",
        body: "På din egen dator, i webbläsarens lokala lagring — inget laddas upp någonstans. Använd Backup då och då för att spara en kopia du kan återställa från, ifall du rensar webbläsarens data."
      },
      {
        heading: "Kan jag köra appen på en annan dator eller mobil i mitt hemnätverk?",
        body: "Ja, men det är två separata saker. För att nå själva appen från en annan enhet, starta den med \"npm run dev -- --host\" och använd nätverksadressen terminalen visar (t.ex. http://192.168.1.23:5175) istället för localhost. För att den enheten också ska kunna prata med din lokala AI-modell måste modellservern (t.ex. Ollama) själv tillåta det: låt den lyssna brett (OLLAMA_HOST=0.0.0.0), tillåt adressen (OLLAMA_ORIGINS), och peka appens modellinställning mot datorns nätverksadress istället för localhost. Tänk på att varje enhet ändå har sitt eget bibliotek — manus delas inte automatiskt mellan dem, du får flytta en bok mellan enheter via Backup/Återställ."
      },
      {
        heading: "Kan jag använda en betald AI-tjänst istället?",
        body: "Nej — medvetet. StoryBook AI pratar bara någonsin med en modell som körs på din egen dator eller nätverk. Det är inte en saknad funktion; det är hela poängen: ditt manus behöver aldrig lämna din maskin."
      }
    ]
  },
  handbook: {
    title: "Guide",
    intro:
      "StoryBook AI innehåller många verktyg, men du behöver inte lära dig allt innan du börjar.\nDu kan skriva en hel bok genom att skapa kapitel och skriva i editorn. De andra verktygen finns där när du behöver hjälp med idéer, struktur, karaktärer, kontinuitet, redigering eller publicering.\n\nBörja enkelt. Lägg till struktur när berättelsen behöver den.",
    categories: {
      "getting-started": "Kom igång",
      "how-you-work": "Så kan du arbeta",
      plan: "Planera berättelsen",
      "story-bible-world": "Story Bible & världen",
      writing: "Skriva",
      revise: "Bearbeta manuset",
      "images-publish-backup": "Bilder, publicering & backup",
      help: "Hjälp & felsökning"
    },
    sections: {
      "connect-local-ai": {
        heading: "Koppla en lokal AI",
        body: "StoryBook AI arbetar med en lokal AI-modell.\nDet innebär att AI-funktionerna använder den modell du själv har anslutit till StoryBook AI.\nFör att använda funktioner som utkast, omskrivning, analys och intervjuer behöver du därför först ha en fungerande lokal AI-anslutning.\n\nFölj snabbstarten för att:\n1. Installera en lokal AI-lösning.\n2. Välja en modell.\n3. Ansluta den till StoryBook AI.\n\nNär anslutningen fungerar kan du börja skriva."
      },
      "first-book": {
        heading: "Skapa din första bok",
        body: "Skapa ett nytt manus och ge det ett namn.\nDu behöver inte skapa en Synopsis, Story Bible eller detaljerad plan innan du börjar.\n\nDu kan gå direkt till:\nKapitel → Kapitel 1 → Börja skriva\n\nSkriv själv i editorn precis som i ett vanligt skrivprogram.\nVill du ha hjälp kan du använda AI-verktygen."
      },
      "first-chapter": {
        heading: "Ditt första kapitel",
        body: "Ett kapitel består i grunden av två saker:\n\nKapitelbrief\nVad kapitlet ska göra.\n\nManus\nTexten som läsaren faktiskt kommer att läsa.\n\nEn brief kan exempelvis vara:\n”Erik anländer till den gamla järnvägsstationen. Där möter han en kvinna som verkar känna hans far. Hon vägrar förklara hur och lämnar ett gammalt fotografi på bordet.”\n\nSjälva kapitlet är sedan berättelsen som växer fram ur detta.\nDu kan skriva kapitlet själv eller använda Skriv utkast för att få ett första material att arbeta vidare med."
      },
      "map-of-storybook-ai": {
        heading: "En karta över StoryBook AI",
        body: "UTFORSKA\n💡 Brainstorm · 💬 Intervjua världen\nHär får idéer vara osäkra.\n↓\nPLANERA\n📖 Synopsis · 🗂 Kapitelbriefs · 🎬 Scener · 🧵 Trådar · 🕒 Timeline\nHär formar du berättelsen.\n↓\nETABLERA\n📚 Story Bible · 🔎 Extrahera fakta · ✓ Granska · 🔒 Lås\nHär bestämmer du vad som ska betraktas som etablerat.\n↓\nSKRIV\n✍️ Kapitel — Skriv utkast · Skriv en beat · Förläng · Brodera ut · Skriv om\n↓\nGRANSKA\n🔎 Analysera · 💬 Fråga manuset · 🗨 Fråga om en passage · ✓ Kontinuitet · ✓ Korrekturläs\n↓\nFÄRDIGSTÄLL\n🖼 Bilder · 📤 Publicera · 💾 Säkerhetskopiera\n\nDet är en karta.\nInte en obligatorisk ordning."
      },
      "no-required-workflow": {
        heading: "Du behöver inte använda allt",
        body: "StoryBook AI kan användas på många olika sätt.\nDet finns inget obligatoriskt arbetsflöde.\n\nDu kan exempelvis arbeta så här:\n\nJag vill bara börja skriva\nKapitel → Skriv → Nästa kapitel. Planera först när du behöver det.\n\nJag vill planera berättelsen\nBrainstorm → Synopsis → Kapitelbriefs → Kapitel\n\nJag vill arbeta mycket strukturerat\nSynopsis → Berättelsemetod → Trådar → Kapitelbriefs → Scener → Timeline → Kapitel\n\nJag har redan ett manus\nLägg in befintlig text → Analysera → Story Bible → Bearbeta → Publicera\n\nJag kommer från ett annat skrivverktyg\nTa med manus och lore → Importera → Granska → Fortsätt skriva\n\nDu väljer själv hur mycket struktur du behöver."
      },
      "three-workflows": {
        heading: "Tre kompletta arbetsflöden",
        body: "Jag skriver intuitivt\nNytt manus → Kapitel 1 → Skriv → Kapitel 2 → Skriv\nNär berättelsen växer: Extrahera fakta → Story Bible\nSenare: Analysera → Korrekturläs → Publicera\nDu behöver aldrig skapa en detaljerad plan.\n\nJag vill planera först\nBrainstorm → Synopsis → Kapitelbriefs → Skriv kapitel → Story Bible → Analysera → Korrekturläs → Publicera\nDet ger struktur utan att kräva en dramaturgisk modell.\n\nJag vill planera mycket\nBrainstorm → Snowflake → Synopsis → Tre akter / Save the Cat / Hjältens resa → Trådar → Kapitelbriefs → Scener → Timeline → Skriv → Story Bible + kontinuitet → Analysera → Korrekturläs → Publicera\nDet är ett mer strukturerat sätt att arbeta.\nDet är inte mer rätt än de andra."
      },
      "which-tool-do-i-need": {
        heading: "Vilket verktyg behöver jag?",
        body: "”Jag vet inte vad berättelsen handlar om.” → Brainstorm\n”Jag har en idé men får inte ihop en hel berättelse.” → Snowflake\n”Jag har många idéer men ingen helhet.” → Synopsis\n”Jag behöver en enkel dramatisk struktur.” → Tre akter\n”Jag vill arbeta med fler tydliga beats.” → Save the Cat\n”Berättelsen handlar om huvudpersonens förändringsresa.” → Hjältens resa\n”Jag vet inte riktigt vem min karaktär är ännu.” → Intervjua världen\n”Jag vill prova idéer om karaktären utan att påverka boken.” → Intervjua världen\n”Jag behöver komma ihåg vad som faktiskt gäller.” → Story Bible\n”Jag tappar bort vad kapitlet ska göra.” → Kapitelbrief\n”Kapitlet har blivit för komplicerat.” → Scener\n”Jag tappar bort olika handlingar och relationer.” → Trådar\n”Jag tappar bort när saker händer.” → Timeline\n”Jag har fastnat mitt i en scen.” → Skriv en beat, Förläng eller Brodera ut\n”Jag vet inte om kapitlet fungerar.” → Analysera\n”Jag vill ha ärlig, kritisk feedback på en specifik fråga.” → Fråga om kapitlet / Fråga om en passage\n”Jag hittar inte tillbaka till något i mitt långa manus.” → Fråga manuset\n”Berättelsen är klar och jag vill putsa texten.” → Korrekturläs\n”Jag vill ge någon boken att läsa.” → Publicera"
      },
      "most-important-principle": {
        heading: "Den viktigaste principen",
        body: "StoryBook AI innehåller många funktioner eftersom olika författare arbetar på olika sätt.\nDet betyder inte att alla funktioner måste användas.\n\nBörja med berättelsen.\nNär du stöter på ett problem, välj det verktyg som hjälper med just det problemet.\n\nUtforska när du behöver idéer.\nPlanera när du behöver riktning.\nLås fakta när något ska bli etablerat.\nSkriv när du vet tillräckligt för att fortsätta.\nGranska när du vill förstå vad du har skrivit.\n\nOch framför allt:\nVerktygen ska anpassa sig efter ditt sätt att skriva – inte tvärtom."
      },
      "brainstorm-free": {
        heading: "Brainstorm – tänk fritt",
        body: "Brainstorm är ditt privata kladdblock.\nHär behöver ingenting vara bestämt.\n\nSkriv exempelvis:\n”Tänk om kvinnan på tåget egentligen känner Eriks far?”\neller:\n”Kanske är fyrtornet inte övergivet?”\neller:\n”Skulle berättelsen fungera bättre om brodern fortfarande lever?”\n\nEn lapp per idé.\nFlytta runt dem och experimentera.\n\nBrainstorm påverkar inte automatiskt berättelsen\nDet här är viktigt. En idé i Brainstorm blir inte automatiskt en del av berättelsen och ska inte börja styra vanliga kapitelutkast.\nNär du bestämmer att en idé ska gå vidare drar du den till Till synopsis.\nDu bestämmer alltså vilka idéer som lämnar kladdbordet."
      },
      "synopsis-short": {
        heading: "Synopsis – berättelsen i kortform",
        body: "Synopsis beskriver berättelsen som helhet. Här samlar du:\n• vilka som är viktiga\n• vad som händer\n• vilka större konflikter som finns\n• vart berättelsen är på väg\n\nExempel\nBrainstorm: ”Tänk om kvinnan på tåget känner Eriks far?”\nNär du bestämmer dig för att använda idén kan den utvecklas till:\n”Under resan möter Erik en kvinna som visar sig känna till omständigheterna kring hans fars försvinnande.”\nDet hör hemma i Synopsis.\n\nTänk:\nBrainstorm = kanske\nSynopsis = berättelsens plan\nKapitelbrief = kapitlets uppgift\nManus = själva berättelsen"
      },
      "chapter-briefs": {
        heading: "Kapitelbriefs",
        body: "En kapitelbrief beskriver vad ett kapitel ska åstadkomma.\nDen behöver inte vara välskriven.\nDen är en instruktion till dig själv och till AI när du använder skrivhjälpen.\n\nExempel\n”Erik möter kvinnan i restaurangvagnen. Hon antyder att hon kände hans far men vägrar berätta hur. Kapitlet slutar med att hon lämnar ett fotografi på bordet.”\n\nBriefen är inte själva berättelsen.\nDen beskriver vad berättelsen ska göra.\n\nSynopsis = hela berättelsen\nBrief = ett kapitel\nManus = det läsaren får"
      },
      "development-methods": {
        heading: "Berättelsemetoder",
        body: "StoryBook AI innehåller flera metoder som kan hjälpa dig utveckla eller strukturera berättelsen.\nDe är helt frivilliga.\nDu kan alltid välja:\nIngen metod – skriv fritt"
      },
      "snowflake-method": {
        heading: "Snowflake",
        body: "Snowflake passar när du har en idé men ännu inte en hel berättelse.\nDen hjälper dig utveckla innehållet steg för steg.\n\nEn mening\n”En journalist återvänder till sin hemö för att undersöka sin fars tjugo år gamla försvinnande.”\n↓\nEtt stycke\nUtveckla grundidén med konflikt, utveckling och riktning.\n↓\nFull synopsis\nBygg vidare tills du har en sammanhängande beskrivning av berättelsen.\n↓\nSkicka till Synopsis\n\nDu kan skriva själv eller använda AI som stöd under processen.\n\nSnowflake hjälper framför allt till att besvara:\n”Vad är det egentligen för berättelse jag håller på att skriva?”"
      },
      "three-act": {
        heading: "Tre akter",
        body: "Tre akter passar när du vill ha en enkel dramatisk stomme.\nStoryBook AI använder centrala vändpunkter som:\n• Upptakt\n• Utlösande händelse\n• Steget in i andra akten\n• Mittpunkt\n• Allt är förlorat\n• Klimax\n• Upplösning\n\nDessa blir Trådar som du kan koppla till berättelsens kapitel.\n\nExempel\nUtlösande händelse: ”Nora hittar ett brev från sin försvunne far.” (Kapitel 3)\nSenare — Mittpunkt: ”Nora upptäcker att brevet skrevs efter datumet då hennes far påstås ha försvunnit.” (Kapitel 12)\n\nMetoden hjälper dig se berättelsens större rörelse.\nDen skriver inte berättelsen åt dig."
      },
      "save-the-cat": {
        heading: "Save the Cat",
        body: "Save the Cat ger fler hållpunkter än Tre akter. Bland annat:\n• Öppningsbild\n• Temat sägs\n• Upptakt\n• Katalysator\n• Tvekan\n• Steget in i andra akten\n• B-berättelsen\n• Löftet infrias\n• Mittpunkt\n• Motståndet trycker på\n• Allt är förlorat\n• Själens mörka natt\n• Steget in i tredje akten\n• Final\n• Slutbild\n\nDessa skapas som Trådar.\nDu bestämmer sedan hur – och om – de passar din berättelse.\n\nEventuella procentangivelser är riktmärken, inte regler för exakt var något måste inträffa.\nAnvänd metoden som karta, inte som facit."
      },
      "heros-journey": {
        heading: "Hjältens resa",
        body: "Hjältens resa passar berättelser där huvudpersonens förändring står i centrum.\nStoryBook AI använder tolv steg:\n1. Vardagsvärlden\n2. Kallelsen\n3. Att avvisa kallelsen\n4. Att möta mentorn\n5. Att korsa tröskeln\n6. Prövningar, allierade och fiender\n7. Närmande till den inre grottan\n8. Den stora prövningen\n9. Belöningen\n10. Vägen tillbaka\n11. Återuppståndelsen\n12. Återkomsten med elixiret\n\nÄven dessa skapas som Trådar.\n\n”Resan” behöver inte vara bokstavlig. En karaktär kan lämna sin trygga värld genom att flytta, börja en relation, förlora sitt arbete, upptäcka en hemlighet eller fatta ett beslut som förändrar livet."
      },
      "method-differences": {
        heading: "Skillnaden mellan metoderna",
        body: "Snowflake\nIdé → En mening → Ett stycke → Full synopsis → Synopsis\nSnowflake utvecklar berättelsens innehåll.\n\nTre akter / Save the Cat / Hjältens resa\nMetod → Beats och vändpunkter → Trådar → Kapitel\nDe hjälper dig strukturera berättelsens utveckling.\n\nDu kan byta metod senare. Det du redan har skrivit i Synopsis eller skapat som Trådar raderas inte bara för att du väljer en annan metod eller återgår till fritt skrivande."
      },
      scenes: {
        heading: "Scener",
        body: "När ett kapitel blir långt eller komplicerat kan det vara lättare att dela upp det i Scener.\n\nKapitel 8 – Fyrtornet\nScen 1: Nora anländer till ön.\nScen 2: Hon bryter sig in i fyrtornet.\nScen 3: Hon hittar fotografierna.\nScen 4: Någon låser dörren utifrån.\n\nTänk:\nBrief = kapitlets uppdrag\nScener = vägen genom kapitlet\n\nDu behöver inte använda Scener för enkla kapitel där du redan har överblicken."
      },
      plotlines: {
        heading: "Trådar",
        body: "Trådar hjälper dig följa sådant som utvecklas genom berättelsen. Det kan vara:\n• huvudkonflikten\n• en relation\n• ett mysterium\n• en hemlighet\n• en rivalitet\n• en karaktärsförändring\n• dramaturgiska beats\n\nExempel\n🔴 Faderns försvinnande\n🟡 Nora och Elias\n🔵 Fyrtornets historia\n\nDu kan se hur dessa förekommer genom kapitlen. Om en viktig sidohandling plötsligt försvinner under tio kapitel blir det lättare att upptäcka."
      },
      timeline: {
        heading: "Timeline",
        body: "Timeline svarar på frågan: När händer detta?\nDen blir särskilt användbar när kapitelordningen inte är samma sak som berättelsens kronologi.\n\nKapitelordning\nKapitel 1 – 2026: Nora återvänder.\nKapitel 2 – 2006: Fadern försvinner.\nKapitel 3 – 2026: Nora hittar brevet.\nKapitel 4 – 1998: Fadern träffar Elias.\n\nKronologisk ordning\n1998 → 2006 → 2026\n\nTimeline hjälper dig hålla reda på skillnaden."
      },
      "scenes-plotlines-timeline": {
        heading: "Scener, Trådar och Timeline",
        body: "De svarar på tre olika frågor.\n\nScener: Vad händer?\nTrådar: Vad utvecklas?\nTimeline: När händer det?\n\nSamma händelse kan därför finnas i alla tre utan att verktygen gör samma sak."
      },
      "story-bible-memory": {
        heading: "Story Bible – berättelsens minne",
        body: "Story Bible samlar information som berättelsen behöver komma ihåg. Det kan vara:\n• personer\n• platser\n• relationer\n• grupper\n• föremål\n• händelser\n• regler och begrepp i världen\n\nAnta att manuset säger:\n”Nora gick uppför trappan till fyrtornet. Hon hade inte varit där sedan hennes far försvann för tjugo år sedan.”\n\nStoryBook AI kan identifiera möjliga fakta. Exempel:\n”Nora har en far.”\n”Noras far försvann för tjugo år sedan.”\n”Nora har tidigare varit vid fyrtornet.”\n\nDu granskar förslagen. Först när du bestämmer att något ska låsas blir det etablerad information som StoryBook AI kan förhålla sig till."
      },
      "what-is-canon": {
        heading: "Vad betyder kanon?",
        body: "Kanon är sådant du har bestämt ska betraktas som sant i berättelsen.\nAll text behöver inte bli kanon.\n\nOm AI skriver:\n”Nora drog den röda halsduken tätare kring halsen.”\nbehöver du inte spara färgen på halsduken bara för att den råkade förekomma i texten.\n\nMen om halsduken senare blir viktig kan informationen vara värd att låsa.\n\nStory Bible ska komma ihåg det som behöver vara konsekvent. Den behöver inte bli en databas över varje detalj i varje mening."
      },
      "interview-world": {
        heading: "Intervjua världen",
        body: "Story Bible behöver inte bara användas för att lagra sådant du redan vet. Du kan också använda Intervjua världen för att upptäcka mer.\n\nIstället för att fylla i långa formulär kan du utforska en karaktär genom samtal.\n\nAnta att du vet:\n”Nora Berg. 38 år. Journalist. Uppvuxen på ön. Hennes far försvann när hon var arton.”\n\nFråga exempelvis:\n”Varför blev du journalist?”\n”Vad minns du av dagen då din far försvann?”\n”Vem litar du minst på?”\n”Vad skulle du aldrig erkänna för Elias?”\n”Vad är du mest rädd för att upptäcka?”\n\nIntervjun kan hjälpa dig hitta personlighet, motiv, bakgrund, relationer och konflikter."
      },
      "interview-sandbox": {
        heading: "Intervjun är en sandlåda",
        body: "Det här är mycket viktigt: det som sägs under intervjun påverkar inte hur boken skrivs. AI får hitta på och experimentera under samtalet.\n\nAnta att Nora säger:\n”Min far brukade ta med mig till fyrtornet när jag var liten.”\nDet betyder inte att StoryBook AI hädanefter får använda detta som etablerad information när ett kapitel skrivs.\nFörst måste du välja att göra informationen till fakta.\n\nArbetsflödet är:\nIntervju → AI säger något intressant → Extrahera fakta → Granska → Lås fakta → Story Bible → Nu kan informationen påverka framtida AI-skrivande\n\nTänk:\nIntervju ≠ kanon\nLåsta fakta = kanon\n\nDet gör att du kan ställa vilda frågor och prova idéer utan att riskera att de börjar påverka berättelsen."
      },
      "interview-to-story": {
        heading: "Från intervju till berättelse",
        body: "Under intervjun kanske Nora säger:\n”Min mor ljög alltid om vad som hände med pappa. Jag lärde mig tidigt att vuxna berättar den version av sanningen som passar dem.”\n\nDu tycker att idén är intressant. Efter intervjun kan StoryBook AI hjälpa dig identifiera möjliga fakta:\n”Noras mor undanhöll information om faderns försvinnande.”\n\nNu väljer du.\nLås faktan — då blir informationen en etablerad del av Story Bible.\nLås den inte — då förblir den något som bara utforskades under intervjun och ska inte behandlas som etablerad information när boken skrivs.\n\nNär en fakta blir sann senare i kapitlet\nEn viktig detalj: en fakta som låses till ett kapitel gäller från kapitlets första sida. Draft får alltså använda faktan redan där — även om den egentligen blir sann först senare i kapitlet.\n\nExempel: huvudpersonen träffar en gammal vän, Marcus, i kapitel 6. Kapitlet börjar som en vanlig återförening. Först en bit in inser huvudpersonen att Marcus i hemlighet har arbetat emot honom hela tiden — Marcus är antagonisten. Plockar du ut ”Marcus är antagonisten” från intervjun och låser den till kapitel 6, har Draft tillgång till avslöjandet redan när den inledande återföreningen ska skrivas som om ingen ännu vet vad Marcus egentligen gör.\n\nLås faktan till en specifik scen istället\nOm faktan ska bli tillgänglig först när avslöjandet sker kan du koppla den till den scen där det händer.\n\nDela först kapitel 6 i scener (Scener → Dela i två…) vid punkten där avslöjandet sker, så att återföreningen och avslöjandet blir separata scener. När du sedan plockar ut faktan från intervjun visar väljaren Från och med kapitlets scener — välj avslöjandets scen istället för Hela kapitlet. Nu får Draft tillgång till faktan först från och med den scenen.\n\nSkriver du scen för scen (Scener → Draft) kan du därför skriva återföreningen utan att Draft ännu har tillgång till faktan. När du kommer till avslöjandets scen får Draft tillgång till den, och den gäller sedan för resten av kapitlet.\n\nViktigt: det fungerar bara vid scenvis Draft\nScenkopplingen påverkar bara Draft när du skriver en scen i taget. Kör du Draft för hela kapitlet får Draft tillgång till alla fakta som hör till kapitlet, oavsett vilken scen de är kopplade till.\n\nFöredrar du att skriva hela kapitel i ett svep gäller därför den enklare lösningen fortfarande: vänta med att låsa faktan tills du har skrivit förbi vändningen, eller skriv kapitlet i två omgångar och lås faktan först inför den andra omgången."
      },
      "brainstorm-vs-interview": {
        heading: "Brainstorm och intervju",
        body: "De är två olika sätt att utforska berättelsen.\n\nBrainstorm — du tittar på berättelsen utifrån:\n”Tänk om Noras mor vet mer om försvinnandet?”\n\nIntervju — du undersöker berättelsen inifrån:\n”Nora, tror du att din mor vet vad som hände med din far?”\n\nIngen av dem behöver automatiskt förändra berättelsen. De är platser där du får tänka."
      },
      "three-levels-of-information": {
        heading: "Tre nivåer av information",
        body: "En användbar mental modell är:\n\nUtforska\nBrainstorm och intervjuer. ”Tänk om…?” Här får idéerna vara osäkra.\n↓\nPlanera\nSynopsis, briefs, Scener och Trådar. ”Det här tänker jag ska hända.” Här formar du berättelsen.\n↓\nEtablera\nLåsta fakta i Story Bible. ”Det här är sant i berättelsens värld.” Här finns information som StoryBook AI kan förhålla sig till när berättelsen skrivs."
      },
      "extract-facts": {
        heading: "Extrahera fakta ur manus",
        body: "Du behöver inte fylla Story Bible manuellt medan du skriver. När ett kapitel innehåller information som kan vara värd att komma ihåg kan StoryBook AI hjälpa dig extrahera möjliga fakta.\n\nArbetsflödet är:\nKapitel → Extrahera fakta → Förslag → Granska → Godkänn och lås → Story Bible\n\nAI föreslår. Du bestämmer."
      },
      "moving-from-other-tool": {
        heading: "Flytta från ett annat skrivverktyg",
        body: "Har du redan arbetat med berättelsen någon annanstans behöver du inte börja om. Du kanske redan har:\n• manus\n• karaktärsbeskrivningar\n• platser\n• worldbuilding\n• lore\n• organisationer\n• föremål\n• historik\n• regler för världen\n\nStoryBook AI kan hjälpa dig ta med materialet."
      },
      "import-lore": {
        heading: "Importera lore",
        body: "Öppna: Story Bible → Importera lore\n\nKlistra in en artikel eller text från ditt befintliga material. Det kan exempelvis vara:\n”Fyrtornet byggdes 1892 på öns norra udde. Tornet har varit obemannat sedan 1987. Lokalbefolkningen undviker platsen efter mörkrets inbrott.”\n\nStoryBook AI:s lokala AI läser texten och föreslår fakta. Du granskar sedan förslagen.\n\nOriginaltexten sparas inte som en del av boken. Det är de fakta du väljer att godkänna som förs vidare.\n\nDen nuvarande lore-importen arbetar med en artikel eller text i taget."
      },
      "lore-relevance-filter": {
        heading: "Håll en stor importerad Story Bible relevant",
        body: "Fakta som manuset självt har etablerat — skrivet i ett kapitel, eller godkänt från en intervju — tas alltid med i Skriv utkast. De är berättelsens egna minne, och det finns inget säkert sätt att utelämna dem. Importerad lore (Importera lore) är annorlunda: det är bakgrundsinformation, bara användbar när kapitlet som skrivs faktiskt handlar om det. Med en stor importerad värld kan det svälla prompten rejält att ta med varenda sådan fakta i varje Skriv utkast-anrop — och begrava den handfull som faktiskt är relevant för just det kapitlet.\n\nInställningar → Visa bara relevant lore för Skriv utkast (avstängt som standard) ändrar det: en importerad lore-fakta tas bara med om dess eget namn nämns i kapitlet, eller — för en Händelse, som ett historiskt slag eller ett sponsringsavtal — om en deltagare eller platsen nämns istället, även om själva händelsen aldrig nämns vid namn.\n\nOm filtret någon gång gissar fel på en viss fakta, pinna den: samma cykel-knapp i Story Bible som redan används för att styra en fakta story-tid-position betyder nu också ”ta alltid med den här, oavsett”."
      },
      "already-have-manuscript": {
        heading: "Du har redan ett manus",
        body: "Har du redan skrivit delar av eller hela berättelsen behöver du inte börja med Brainstorm eller en berättelsemetod. Börja med texten du har.\n\nEtt möjligt arbetsflöde är:\nBefintligt manus → Kapitel → Extrahera fakta → Story Bible → Analysera och bearbeta → Fortsätt skriva\n\nBrainstorm, Synopsis och berättelsemetoder är hjälpmedel. De är inte obligatoriska steg."
      },
      "write-with-ai": {
        heading: "Skriv tillsammans med AI",
        body: "AI behöver inte skriva hela kapitel. Välj det minsta verktyget som löser problemet.\n\nSkriv utkast — när kapitlet ännu inte har någon text.\nFörläng — när du har börjat skriva men behöver komma vidare.\nBrodera ut — när en passage går för fort eller behöver mer innehåll.\nSkriv om — när du vet vad du vill förändra. Exempel: ”Gör dialogen mer obekväm utan att personerna säger rakt ut vad de är arga över.”\nSkriv en beat — när du vet exakt vilken mindre händelse som ska ske. Exempel: ”Nora hör steg i trappan och gömmer brevet innan dörren öppnas.”"
      },
      "smallest-tool": {
        heading: "Välj minsta verktyget",
        body: "Helt tomt kapitel → Skriv utkast\nEn mindre händelse saknas → Skriv en beat\nPassagen är för tunn → Brodera ut\nJag behöver komma vidare → Förläng\nJag vet vad jag vill förändra → Skriv om\nJag vill veta om kapitlet fungerar → Analysera\n\nDet ger dig mer kontroll än att generera om stora mängder text."
      },
      "ai-not-autopilot": {
        heading: "AI är inte autopilot",
        body: "StoryBook AI är inte byggt kring: ”Skriv min bok.”\n\nTanken är snarare:\nDu bestämmer riktningen.\n↓\nAI hjälper där du vill ha hjälp.\n↓\nDu läser resultatet.\n↓\nDu ändrar, behåller eller kastar det.\n↓\nBerättelsen utvecklas.\n\nDu kan skriva flera kapitel helt utan AI. Du kan använda AI bara när du fastnar. Eller skapa råutkast som du sedan skriver om kraftigt. Alla är normala sätt att använda StoryBook AI."
      },
      "pov-tense-voice": {
        heading: "Perspektiv, tempus och berättarröst",
        body: "StoryBook AI kan få information om hur berättelsen ska berättas. Det kan exempelvis handla om:\n• perspektiv\n• tempus\n• synvinkel\n• berättarröst\n\nEnskilda kapitel kan vid behov avvika från bokens grundinställningar. Det kan vara användbart om huvuddelen av romanen exempelvis berättas i tredje person men ett särskilt kapitel behöver en annan synvinkel.\n\nOm du använder AI för större omskrivningar efter en sådan förändring bör du alltid läsa resultatet noggrant.\n\nPerspektiv handlar om mer än att byta pronomen."
      },
      reader: {
        heading: "Läsare",
        body: "Du kan ange vilken typ av läsare berättelsen riktar sig till. Det kan hjälpa AI anpassa exempelvis ordval och meningsbyggnad när den skriver tillsammans med dig.\n\nDet är ett skrivstöd. Det är inte en automatisk bedömning av vilken ålder den färdiga boken passar för."
      },
      "author-voice": {
        heading: "Författarröst",
        body: "Två författare kan beskriva samma händelse på helt olika sätt. Författarrösten hjälper AI förstå hur du vill att prosan ska kännas. Det kan handla om:\n• meningslängd\n• mängden miljöbeskrivning\n• dialog\n• rytm\n• direkt eller återhållsamt språk\n• andra stilistiska egenskaper\n\nDet är vägledning för AI. Inte regler för hur du måste skriva. Din egen text har alltid sista ordet."
      },
      "analyze-chapter": {
        heading: "Analysera ett kapitel",
        body: "Analysera granskar texten utan att skriva om den åt dig. Syftet är att hjälpa dig upptäcka sådant du själv kanske vill undersöka närmare.\n\nTänk på analysen som en extra läsare.\nInte: ”Så här ska du skriva.”\nUtan: ”Här finns något du kanske vill titta på.”\n\nDu bestämmer om synpunkten är relevant."
      },
      continuity: {
        heading: "Kontinuitet",
        body: "Ju längre manuset blir, desto svårare blir det att minnas allt. En person kan få olika ögonfärg. En plats kan plötsligt förändras. En karaktär kan verka känna till information som hen ännu inte borde känna till.\n\nHär hjälper Story Bible och berättelsens kontinuitetsverktyg dig att jämföra det du skriver med sådant som redan etablerats.\n\nVem vet vad?\nKontinuitet handlar inte bara om fysiska detaljer. Det handlar också om information. Läsaren kanske känner till en hemlighet. Det betyder inte att alla karaktärer gör det.\n\nDet blir särskilt viktigt i mysterier, thrillers, flera perspektiv och berättelser där information avslöjas stegvis."
      },
      "ask-manuscript": {
        heading: "Fråga manuset",
        body: "När boken blivit lång kan du använda Fråga manuset för att undersöka din egen berättelse.\n\nExempel:\n”När träffar Erik kvinnan på tåget första gången?”\n”I vilka kapitel nämns fyrtornet?”\n”Vad vet Lena om Eriks far?”\n”När får läsaren veta att fotografiet är från 1932?”\n\nDu kan också fråga:\n”Vilka kapitel handlar mest om relationen mellan Nora och Elias?”\neller:\n”Var nämns nyckeln innan den blir viktig senare?”\n\nSvaret är ett hjälpmedel för dig. Det blir inte automatiskt kanon och ska inte i sig förändra kapitlen."
      },
      "ask-about-passage": {
        heading: "Fråga om ett kapitel eller en passage",
        body: "Analysera kollar fasta kategorier. Fråga manuset svarar på faktafrågor om det som redan är skrivet. Ingen av dem kan svara på något i stil med: ”Bygger det här upp mot ett starkt slut?” eller ”Känns det här argumentet trovärdigt, eller konstruerat?” — Fråga om kapitlet / Fråga om en passage är till för just den typen av fråga: din egen, om hantverket, med ett ärligt — och kritiskt, om du ber om det — svar.\n\nTvå sätt att använda det:\n”Fråga om kapitlet…” (bredvid Analysera) — fråga om hela kapitlet.\nMarkera en passage i texten, välj sedan ”Fråga…” i dess meny — fråga bara om den passagen, med den omgivande texten som sammanhang.\n\nExempel:\n”Får slutet dig att vilja läsa nästa kapitel?”\n”Visar den här scenen för mycket, för fort?”\n\nSvaret är bara till för att läsas. Inget ändras eller sparas — precis som Fråga manuset."
      },
      history: {
        heading: "Historik",
        body: "AI-assisterat skrivande innebär ofta experiment. En omskrivning kanske blir bättre. Eller så upptäcker du att den gamla versionen fungerade bättre.\n\nNär tidigare versioner finns tillgängliga kan Historik hjälpa dig jämföra och gå tillbaka.\n\nTänk: Prova → Läs → Behåll eller återgå\n\nDu behöver inte acceptera en förändring bara för att AI skapade den."
      },
      proofread: {
        heading: "Korrekturläs",
        body: "Korrekturläsning passar senare i processen.\n\nTidigare kanske frågan var: ”Hur kan scenen utvecklas?”\nNu blir frågan: ”Finns det något här som behöver rättas eller kontrolleras?”\n\nDet är sällan meningsfullt att finslipa varje mening om du fortfarande tänker skriva om hela kapitel. Arbeta gärna från stort till smått:\nBerättelsen → Kontinuiteten → Kapitlen → Språket → Korrekturläsningen → Din egen slutläsning\n\nAI kan hitta saker. Författaren avgör vad som fungerar."
      },
      "images-illustrations": {
        heading: "Bilder och illustrationer",
        body: "StoryBook AI kan hjälpa dig arbeta med bilder på två olika sätt.\n\nEgna bilder\nDu kan lägga till bilder till berättelsen. Det kan vara användbart för illustrerade berättelser, barnböcker eller projekt där bilder är en del av läsupplevelsen.\n\nIllustrationsprompter\nDu kan också använda text ur berättelsen som grund för en bildbeskrivning.\n\nExempel — manus: ”Erik stod ensam på perrongen. Dimman låg tät över spåren och stationsklockan hade stannat på 03:17.”\nStoryBook AI kan hjälpa dig omvandla passagen till en illustrationsprompt baserad på motivet och projektets valda visuella stil. Själva berättelsetexten ändras inte."
      },
      publish: {
        heading: "Publicera",
        body: "När berättelsen är redo att lämna arbetsytan använder du Publicera.\n\nTänk på skillnaden:\nStoryBook-projektet = din verkstad\nPubliceringen = det läsaren får\n\nBrainstorm, arbetsanteckningar och annan planering behöver alltså inte följa med i den publicerade berättelsen. Välj det format som passar hur texten ska användas och arbeta sedan vidare med resultatet där det behövs."
      },
      backup: {
        heading: "Säkerhetskopiera",
        body: "Publicering och säkerhetskopiering är inte samma sak.\n\nEn publicerad bok är till för läsaren. En StoryBook-säkerhetskopia är till för att kunna återställa själva projektet. Den kan därför innehålla information som inte finns i den publicerade versionen.\n\nSpara säkerhetskopior regelbundet, särskilt innan större förändringar.\n\nImportera backup används för StoryBook AI:s egna säkerhetskopior. Det är inte samma sak som att importera ett manus eller lore från ett annat skrivprogram."
      },
      "network-ai-server": {
        heading: "En AI-server på en annan dator i nätverket",
        body: "Har du en kraftfull dator eller server på samma nätverk, och vill skriva på StoryBook AI från en annan dator — en bärbar, till exempel? Det går, men kräver inställningar på tre ställen: i StoryBook AI, på serverdatorn, och i dess brandvägg.\n\nMotorn måste vara ”LM Studio / annan lokal server”\nÖppna Inställningar → Modeller. Oavsett om den andra datorn faktiskt kör Ollama eller LM Studio, välj den motorn — det är den enda som visar ett fält för serveradress. Ollama-motorn pekar alltid mot din egen dator (localhost) och går inte att peka om via gränssnittet.\n\nSkriv in den andra datorns nätverksadress\nI fältet Serveradress: http://[den andra datorns nätverks-IP]:[port] — till exempel http://192.168.1.50:11434 för Ollama, eller http://192.168.1.50:1234 för LM Studio. Lägg inte till /v1 på slutet, StoryBook AI gör det själv. Hitta den andra datorns nätverksadress med ipconfig (Windows) eller ifconfig/ip addr (Mac/Linux) på just den datorn.\n\nLåt servern lyssna på nätverket, inte bara sig själv\nKör den andra datorn Ollama: starta den med miljövariabeln OLLAMA_HOST=0.0.0.0 så den lyssnar brett, och OLLAMA_ORIGINS satt till adressen StoryBook AI faktiskt körs ifrån — annars nekar den webbläsarens anrop även om själva anslutningen fungerar.\nKör den LM Studio: fliken Developer → Server-inställningarna → slå på ”Serve on Local Network” och ”Enable CORS”.\n\nBrandväggen på serverdatorn\nDen måste tillåta inkommande anslutningar på porten (11434 för Ollama, oftast 1234 för LM Studio) från resten av nätverket — annars släpps anropet aldrig igenom, även om allt ovan är rätt.\n\nVarje dator har för övrigt sitt eget bibliotek av manus — bara AI-anslutningen delas, inte det du skrivit. Vill du fortsätta på samma bok från båda datorerna, använd Backup/Återställ för att flytta den."
      },
      "ai-writing-wrong-things": {
        heading: "Om AI börjar skriva fel saker",
        body: "Fundera först på vilken information modellen faktiskt har fått.\n\nKapitelbriefen är gammal\nKontrollera om briefen fortfarande beskriver kapitlet du vill skriva.\n\nSynopsis har inte följt med berättelsens utveckling\nBerättelsen kanske har förändrats sedan du planerade den.\n\nIdén finns bara i Brainstorm\nBrainstorm är ett utforskande område. En idé där ska inte automatiskt behandlas som en del av berättelsen.\n\nInformationen kommer bara från en intervju\nSamma princip gäller här. Det som sades under intervjun påverkar inte hur boken skrivs om du inte har valt att låsa informationen som fakta.\n\nViktig information saknas i Story Bible\nOm något måste vara konsekvent kan det behöva etableras och låsas som fakta.\n\nDin instruktion är för bred\nIstället för: ”Skriv om scenen så att den blir bättre.”\nprova: ”Gör dialogen mellan Nora och Elias mer reserverad. De misstänker varandra men ingen vill visa det ännu.”\n\nJu tydligare problemet är, desto lättare blir det att välja rätt verktyg."
      },
      "marker-conversion-no-match": {
        heading: "”Convert markers to formatting” hittar inga markeringar",
        body: "Oftast beror det på att tecknet du skrev in i fältet inte är exakt samma tecken som finns i manuset — lätt hänt med citattecken, eftersom \" (rakt citattecken) och ” ” (smarta/typografiska citattecken, som ordbehandlare ofta byter till automatiskt) ser nästan likadana ut men är olika tecken för datorn.\n\nSäkraste lösningen: öppna kapitlet, markera ett av de riktiga tecknen i din text, kopiera det (Ctrl/Cmd+C), och klistra in det i fältet för öppnings- eller avslutningstecken istället för att skriva om det på tangentbordet. Då är det garanterat exakt rätt tecken."
      }
    }
  },
  scenes: {
    toggleCount: {
      one: "{count} scen",
      other: "{count} scener"
    },
    titlePlaceholder: "Namnlös scen",
    titleLabel: "Titel för scen {index}",
    briefPlaceholder: "Skrivanteckning bara för den här scenen (frivilligt)",
    briefLabel: "Anteckning för scen {index}",
    mergeWithNext: "Slå ihop med nästa ↓",
    splitHere: "Dela i två…",
    splitHint: "Välj var den nya scenen ska börja:",
    draft: "Skriv utkast",
    recast: "Omskriv",
    analyze: "Analysera",
    addScene: "Lägg till scen",
    addSceneDisabledHint: "Skriv klart den här scenen innan du lägger till nästa"
  },
  publish: {
    title: "Publicera",
    body: "En läsbar kopia av berättelsen. Lämnar brainstorm utanför. RTF och ODT öppnas i Scrivener. HTML öppnas i valfri webbläsare. ePub öppnas i en e-boksläsare. PDF är redo att skriva ut.",
    documentName: "Dokumentnamn",
    format: "Format",
    font: "Typsnitt",
    systemFont: "Standardserif (Times/Georgia)",
    fontSetInSettings: "ställs in i Settings → Typography",
    paragraphStyle: "Styckeformat",
    paragraphStyleSpaced: "Tom rad mellan stycken",
    paragraphStyleIndented: "Indrag, ingen tom rad (klassiskt bokformat)",
    action: "Publicera",
    markdown: "Markdown",
    txt: "Ren text",
    rtf: "RTF",
    odt: "ODT",
    html: "HTML",
    epub: "ePub",
    pdf: "PDF"
  },
  progress: {
    title: "Framsteg",
    setGoal: "Sätt mål",
    editGoal: "Ändra mål",
    removeGoal: "Ta bort mål",
    saveGoal: "Spara mål",
    targetWordsLabel: "Målantal ord",
    deadlineLabel: "Slutdatum",
    daysPerWeekLabel: "Skrivdagar per vecka",
    wordsOfTarget: "{current} av {target} ord",
    percentComplete: "{percent} % dit",
    dailyPaceNeeded: "~{perDay} ord/dag behövs för att hinna",
    overdue: "Slutdatum passerat — {remaining} ord kvar",
    targetReached: "Mål uppnått"
  },
  find: {
    action: "Sök/Ersätt",
    title: "Sök och ersätt",
    body: "Träffarna markeras i textfältet. Pilarna hoppar till nästa eller föregående. Story Bible lämnas. Brainstorm lämnas om du inte tar med den.",
    find: "Sök",
    replaceWith: "Ersätt med",
    matchCase: "Skilj på versaler",
    wholeWord: "Hela ord",
    includeBrainstorm: "Ta med brainstorm",
    here: "Den här sidan",
    echoes: "Upprepade ord",
    phrases: "Upprepade fraser",
    noneEcho: "Inga upprepade ord på den här sidan.",
    nonePhrases: "Inga upprepade fraser på den här sidan.",
    none: "Inget matchar.",
    hits: { one: "{count} träff", other: "{count} träffar" },
    snippetHint: "Raderna under en rubrik är ordet med texten runt om. Sökrutan ligger ovanpå sidan, så ställena listas här.",
    moreSnippets: "Och {count} till på den här platsen.",
    fields: {
      title: "Titel",
      brief: "Disposition",
      voice: "Författarröst",
      viewpoint: "Synvinkel"
    },
    replace: "Ersätt",
    replaceCount: "Ersätt {count}",
    showHit: "Visa {place}",
    untitled: "Namnlöst",
    prev: "Föregående träff",
    next: "Nästa träff",
    position: "{current} av {total}"
  },
  proofread: {
    action: "Korrekturläsning",
    title: "Korrekturläsning",
    runningTitle: "Korrekturläsning pågår — bra tillfälle för en fika.",
    lede: "En sista Review-runda över hela manuset. Bara citat och anteckningar. Ingenting skrivs om.",
    grammar: "Grammatik",
    scenes: "Upprepade scener",
    style: "Stil och känsla mellan kapitel",
    age: "Åldersrapport",
    continuity: "Kontinuitet",
    setups: "Planterat & inlöst",
    facts: "Faktakontroll",
    grammarProgress: "Grammatik — {done} av {total} kapitel klara",
    scenesProgress: "Letar upprepade scener — {done} av {total} styckepar jämförda",
    styleProgress: "Stil- och känslokonsekvens mellan kapitel",
    ageProgress: "Sammanställer åldersrapport",
    continuityProgress: "Kontrollerar att ingen är på två platser samtidigt",
    setupsProgress: "Letar efter planterade detaljer som inte lösts in än",
    factsProgress: "Kontrollerar fakta mot Story Bible — {done} av {total} kapitel klara",
    now: "Just nu: {detail}",
    nowGrammar: "läser kapitel {n}…",
    nowScenes: "jämför kapitel {a} med kapitel {b}…",
    nowStyle: "lyssnar efter ett skifte i register eller känsla…",
    nowAge: "väger prosan mot Läsare…",
    nowContinuity: "kontrollerar vem och vad som är var, och när…",
    nowSetups: "kontrollerar vad som planterats, och vad som lösts in…",
    nowFacts: "kontrollerar kapitel {n} mot Story Bible…",
    stillWorking: "Jobbar fortfarande — ett enda kapitel kan ta några minuter på långsammare hårdvara. Inget har fastnat.",
    percent: "{n}%",
    continue: "Fortsätt",
    runAgain: "Kör igen",
    resultsTitle: "Anteckningar från korrektur",
    emptyResults: "Inget fast den här gången.",
    clickHint: "Klicka på en rad för att öppna kapitlet.",
    stale: "Kapitlet har ändrats sedan passet.",
    suggestion: "Förslag",
    chapter: "Kapitel {n}",
    chapters: "Kapitel {a} och {b}",
    paused: "Pausad. Det som hunnit klart är sparat.",
    error: "Passet stannade. Det som hunnit klart är sparat.",
    craft: "Kamera på korten",
    contentFlag: "Innehållsvarning",
    stageSkipped: "Inte vald den här gången",
    scopeSummary: "Omfattning: bara {chapter}. Grammatik och Faktakontroll gäller bara det kapitlet; övriga steg jämför alltid hela manuset.",
    setupTitle: "Innan vi kör",
    setupLede: "Kryssa i det du vill kontrollera den här gången. Allt är förbockat som standard, precis som förut.",
    setupStagesLabel: "Vad ska kontrolleras",
    setupScopeLabel: "Omfattning",
    setupScopeManuscript: "Hela manuset",
    setupScopeChapter: "Bara \"{chapter}\" (det öppna kapitlet)",
    setupScopeChapterHint: "Gäller bara Grammatik och Faktakontroll — de är de enda två stegen som skalar med antal kapitel. De andra jämför alltid mellan kapitel, så de körs över hela manuset oavsett.",
    setupStart: "Starta korrekturläsning",
    setupNothingSelected: "Välj minst en sak att kontrollera."
  },
  craft: {
    pov: "Perspektiv",
    povAria: "Berättarperspektiv",
    chapterPov: "Kapitlets berättarperspektiv",
    tense: "Tempus",
    tenseAria: "Tempus",
    chapterTense: "Kapitlets tempus",
    viewpoint: "Synvinkel",
    viewpointPlaceholder: "Vem är i fokus?",
    viewpointAria: "Synvinkelkaraktär",
    chapterViewpoint: "Kapitlets synvinkelkaraktär",
    viewpointInherit: "{name} (manus)",
    usual: "Vanliga",
    more: "Fler",
    inheritPov: "Manus · {label}",
    inheritTense: "Manus · {label}",
    continuesFrom: "Fortsätter från",
    previousChapter: "Föregående kapitel",
    previousChapterNamed: "Föregående kapitel · {label}",
    noneStrand: "Ingen · ny tråd",
    modes: {
      limited: "Tredje person begränsad",
      first: "Första person",
      omniscient: "Tredje person allvetande",
      objective: "Tredje person objektiv",
      second: "Andra person"
    },
    tenses: {
      past: "Dåtid",
      present: "Nutid"
    }
  },
  bible: {
    title: "Story Bible",
    search: "Sök i Story Bible",
    searchPlaceholder: "Hitta ett namn eller ett påstående",
    shelves: "Story Bible-hyllor",
    review: "Granska fakta",
    reviewCount: "Granskning · {count}",
    lockedCount: "{count} låsta",
    exportCards: "Exportera kort",
    exportCardsTitle: "Ladda ner karaktärer, platser och föremål till Sandbox",
    importLoreNav: "Importera lore",
    importLoreTitle: "Importera en lore-artikel",
    importLoreLede: "Klistra in text från din egen lorebok. En AI läser igenom den och föreslår fakta till rätt kort — precis som när fakta plockas ut ur ett kapitel. Inget låses direkt; allt hamnar i granskningskön. Texten sparas inte i boken, bara de fakta som blir av den.",
    importLoreArticleTitle: "Artikelns namn (frivilligt, syns i granskningen)",
    importLoreArticleTitlePlaceholder: "T.ex. \"Fyrtornet\" eller \"Ordens regler\"",
    importLoreText: "Text att extrahera fakta ur",
    importLoreTextPlaceholder: "Klistra in artikeln här…",
    importLoreAction: "Extrahera fakta",
    importLoreExtracting: "Extraherar…",
    importLoreUpload: "Ladda upp fil",
    importLoreFoundCount: "Hittade {count}",
    importLoreArticlesCount: { one: "{count} artikel", other: "{count} artiklar" },
    importLoreExtractingProgress: "Extraherar {current} av {total}…",
    importLoreActionCount: "Extrahera fakta från {count}",
    nothingMatches: "Inget matchar.",
    hidden: "Dold",
    name: "Namn",
    close: "Stäng",
    reviewBody: "Föreslagna rader i Story Bible. Förtydliga dem, lås — eller förkasta.",
    hideFromDraft: "Dölj för utkast",
    interview: "Intervjua",
    interviewPickerTitle: "Vem eller vad vill du intervjua?",
    interviewPickerLede: "Vilket kort som helst i Story Bible — inte bara karaktärer. En plats eller ett objekt går också att intervjua, i tredje person, som ett sätt att bygga ut din värld.",
    showToDraft: "Visa för utkast",
    hiddenNote: "Modellen ser inte det här kortet förrän du visar det igen.",
    deleteEntity: "Ta bort kortet",
    deleteConfirm: "Ta bort “{name}” helt, med alla dess fakta, bilder och profil? Det går inte att ångra.",
    thisIsA: "Detta är en",
    pictures: "Bilder",
    picturesAside: "(För senare export. Utkast ser aldrig dessa.)",
    removePicture: "Radera bild {n}",
    addImage: "Lägg till bild",
    addingImage: "Lägger till bild",
    addFact: "Lägg till fakta",
    addFactHint: "Lägger du till ett påstående under en kategori som redan har ett erbjuds du att ersätta det — det tidigare värdet syns kvar i Historik, kopplat till kapitlet du skriver just nu.",
    claimPlaceholder: "Påståendet, på en rad",
    lockInto: "Lås till Story Bible",
    addChoiceTitle: "Ersätt eller lägg till?",
    addChoiceBody: "Fältet {predicate} har redan “{existing}”. Ska den nya texten ersätta den, eller ligga kvar som en till {predicate}-rad?",
    addChoiceKeepBoth: "Lägg till som ytterligare en",
    addChoiceReplace: "Ersätt den befintliga",
    history: "Historik",
    historyAside: "(Att ersätta ett påstående nedan lägger till en rad här.)",
    historyCurrent: "nu",
    asOfLabel: "Visa Story Bible som den var vid",
    asOfNow: "Nuläget",
    asOfBanner: "Visar Story Bible som den såg ut vid ”{chapter}” — skrivskyddat.",
    asOfBack: "Tillbaka till nuläget",
    asOfEntityLede: "Som det stod vid ”{chapter}”.",
    mentions: "Omnämnanden",
    mentionsAside: "(Varje kapitel där den här entiteten nämns i prosan.)",
    aliases: "Alias",
    aliasesAside: "(Smeknamn och titlar. Räknas också som ett omnämnande.)",
    aliasesPlaceholder: "Kommaseparerade smeknamn",
    exclusions: "Undantag",
    exclusionsAside: "(Fraser som inte ska räknas som omnämnande.)",
    exclusionsPlaceholder: "Kommaseparerade fraser att ignorera",
    replaceTitle: "Ersätt i manuset?",
    replaceBody: "Ersätt “{from}” med “{to}” på {places}. Brainstorm lämnas orörd.",
    places: { one: "{count} ställe", other: "{count} ställen" },
    keepTexts: "Behåll texterna",
    replace: "Ersätt",
    pronoun: "Pronomen",
    age: "Ungefärlig ålder",
    looks: "Utseende",
    looksPlaceholder: "Kropp och ansikte. Inte kläder.",
    tags: "Etiketter",
    tagsAside: "(Bara hyllan. Utkast ser aldrig dessa.)",
    tagsPlaceholder: "Kommaseparerade drag",
    personality: "Personlighet",
    personalityPlaceholder: "Hur de brukar vara",
    goals: "Mål",
    goalsPlaceholder: "Vad de vill",
    fears: "Rädslor",
    fearsPlaceholder: "Vad de är rädda för",
    eventWhere: "Var",
    eventWhereNone: "Inte placerad än",
    eventParticipants: "Vilka som var där",
    eventsHere: "Händelser här",
    peopleHere: "Personer här",
    namePlaceholder: "Namn",
    factText: "Faktatext",
    sourceLabel: "Källa: {source}",
    sources: {
      chapter: "Kapitel",
      interview: "Intervju",
      lore: "Lore",
      brainstorm: "Brainstorm",
      synopsis: "Synopsis",
      brief: "Brief"
    },
    conflictsWith: "Krockar med: {value}",
    similarTo: "Liknar: {value} — verkar vara samma fakta, fast mer detaljerad",
    lock: "Lås",
    merge: "Slå ihop",
    keepSeparate: "Behåll båda",
    reject: "Förkasta",
    show: "Visa",
    hide: "Dölj",
    showClaim: "Visa det här påståendet för utkast",
    hideClaim: "Dölj det här påståendet för utkast",
    positionOverrideAuto: "Auto",
    positionOverrideInclude: "Alltid med",
    positionOverrideExclude: "Aldrig med",
    positionOverrideToInclude: "Inkludera alltid i Skriv utkast, oavsett kapitlets position i story-tiden och oavsett relevansfiltret för lore",
    positionOverrideToExclude: "Uteslut alltid från Skriv utkast, oavsett kapitlets position i story-tiden",
    positionOverrideToAuto: "Återgå till automatisk positionering (styrs av story-tiden)",
    edit: "Redigera",
    editFact: "Redigera fakta",
    save: "Spara",
    updateFact: "Uppdatera…",
    updateFactHint: "Markera att det här ändras härifrån — fyller i Lägg till fakta nedan, kopplat till kapitlet du skriver just nu. Till skillnad från Redigera, som rättar vad det alltid varit.",
    kinds: {
      characters: "Karaktärer",
      locations: "Platser",
      objects: "Föremål",
      groups: "Grupper",
      events: "Händelser",
      concepts: "Koncept"
    },
    singular: {
      characters: "Karaktär",
      locations: "Plats",
      objects: "Föremål",
      groups: "Grupp",
      events: "Händelse",
      concepts: "Koncept"
    },
    newLabel: {
      characters: "Ny karaktär",
      locations: "Ny plats",
      objects: "Nytt föremål",
      groups: "Ny grupp",
      events: "Ny händelse",
      concepts: "Nytt koncept"
    },
    empty: {
      characters: "Inga karaktärer ännu.",
      locations: "Inga platser ännu.",
      objects: "Inga föremål ännu.",
      groups: "Inga grupper ännu.",
      events: "Inga händelser ännu.",
      concepts: "Inga koncept ännu."
    },
    predicates: {
      "core.identity": "Identitet",
      "core.trait": "Karaktärsdrag",
      "core.place": "Plats",
      "core.object": "Föremål",
      "core.group": "Grupp",
      "core.relationship": "Relation",
      "core.event": "Händelse",
      "core.concept": "Koncept"
    },
    pronouns: {
      she: "Hon",
      he: "Han",
      it: "Hen"
    }
  },
  canvas: {
    jumpToEntity: "Ctrl-klicka (Cmd-klicka på Mac) för att öppna {name}s Story Bible-kort",
    extend: "Förläng",
    elaborate: "Brodera ut",
    beat: "Skriv en beat…",
    beatTitle: "Skriv en beat",
    beatHint: "Kort och konkret: vad händer härnäst? Modellen skriver bara den beaten, inget mer, och lägger in den precis vid markören.",
    beatPlaceholder: "Vad händer härnäst, i en rad",
    beatAction: "Skriv beaten",
    rewriteMenu: "Skriv om…",
    illustrate: "Illustrationsprompt…",
    lift: "Lyft till synopsis",
    cutToDarling: "Klipp till älsklingar",
    formatToolbar: "Formatering",
    bold: "Fet",
    italic: "Kursiv",
    underline: "Understruken",
    manual: "Manuell redigering",
    insteadOf: "I stället för “{word}”",
    looking: "Söker…",
    noAlts: "Inga alternativ den här gången.",
    retry: "Försök igen",
    manualTitle: "Manuell redigering",
    manualBody: "Skriv om bara det markerade stycket. Resten av texten ligger kvar.",
    apply: "Verkställ",
    rewriteTitle: "Skriv om",
    rewriteHint: "Säg åt modellen hur det markerade stycket ska ändras. Bara det spannet byts ut.",
    rewritePlaceholder: "Vad ska ändras?",
    rewriteAction: "Skriv om",
    ask: "Fråga…",
    askTitle: "Fråga om den här passagen",
    askHint: "Fråga vad som helst om den markerade passagen — var så kritisk du vill. Svaret är bara till för att läsas, inget ändras eller sparas.",
    askPlaceholder: "Vad vill du veta?",
    askAction: "Fråga",
    placeholderAdd: "Lägg till platshållare…",
    placeholderAddTitle: "Lägg till platshållare",
    placeholderAddHint: "En snabb notering till dig själv — ett namn, en fakta, ett datum du fyller i senare. Fortsätt skriva; kom tillbaka när du vill.",
    placeholderPlaceholder: "Vad behöver du återkomma till?",
    placeholderAddAction: "Lägg till",
    placeholderViewTitle: "Platshållare",
    placeholderSave: "Spara",
    placeholderResolve: "Markera löst",
    placeholderOpen: "Öppna den här platshållaren",
    placeholderEmptyNote: "Platshållare",
    rewriteChips: {
      group: "Snabbval från Statistik och Analys",
      povLeakCamera:
        "Stanna i den aktuella kameran. Gå inte in i ett medvetande kameran inte kan känna. Samma händelser.",
      povLeak: {
        label: "Fixa perspektivbrott",
        prompt:
          "Stanna i {who}s varseblivning. Återge inte en annan karaktärs tankar eller känslor. Samma händelser."
      },
      strongerVerbs: {
        label: "Starkare verb",
        prompt:
          "Byt svaga verb plus sättsadverb mot starkare verb (sprang snabbt → rusade). Ta inte bara bort -t-orden. Samma händelser."
      },
      activeVoice: {
        label: "Aktiv form",
        prompt:
          "Gör misstänkta passiver aktiva (dörren öppnades av henne → hon öppnade dörren). Samma händelser."
      },
      showDontTell: {
        label: "Visa, berätta inte",
        prompt:
          "Där en känsla namnges, låt kroppen eller scenen bära den. Lägg inte till förklaring. Samma händelser."
      },
      breakLong: {
        label: "Bryt den långa meningen",
        prompt:
          "Bryt den långa meningen. Behåll betydelsen. En kort stöt efter en lång rad, inte en rad lika korta."
      }
    },
    modelAside: "Modellen lade till det här. Det ligger inte i manuset."
  },
  stats: {
    label: "Statistik",
    wordsShort: { one: "{count} ord", other: "{count} ord" },
    rareOn: "Ovanliga ord på",
    rareOff: "Ovanliga ord av",
    rareOnTitle: "Dölj ovanliga ord",
    rareOffTitle: "Markera ovanliga ord",
    ticsOn: "Klichéer på",
    ticsOff: "Klichéer av",
    ticsOnTitle: "Dölj AI-klingande fraser",
    ticsOffTitle: "Markera AI-klingande fraser",
    factsOn: "Story Bible-namn på",
    factsOff: "Story Bible-namn av",
    factsOnTitle: "Dölj understrykning av Story Bible-namn",
    factsOffTitle: "Stryk under namn som finns i Story Bible",
    rareMarkTitle: "Ovanligt ord — kan vara svårare för den här läsaren",
    ticPhraseTitle: "Låter som en AI-genererad fras",
    ticDashTitle: "Det här avsnittet lutar sig tungt mot tankstreck",
    title: "Så läses det",
    emptyTitle: "Ingen prosa ännu",
    writeSome: "Skriv lite prosa för att se hur det läses.",
    sentence: "Mening {n} · {words}",
    alreadyShort: "Redan kort.",
    suggestSplit: "Föreslå en delning",
    looking: "Söker…",
    noSplit: "Ingen delning den här gången.",
    split: "Delning",
    editSplit: "Redigera delning",
    useSplit: "Använd den här delningen",
    paragraph: "Stycke {n} · {words}",
    packedHint: "Handling, en lång blick bakåt och staplade sinnen i det här blocket.",
    suggestBreak: "Föreslå en brytning",
    noBreak: "Ingen brytning den här gången.",
    break: "Brytning",
    editBreak: "Redigera styckesbrytning",
    useBreak: "Använd den här brytningen",
    clickBar: "Klicka på en stapel för att läsa meningen.",
    mixedFocus: "Blandat fokus",
    mixedOne: "Det här blocket blandar nutida handling, en lång blick bakåt och staplade sinnen.",
    mixedMany: "De här blocken blandar nutida handling, en lång blick bakåt och staplade sinnen.",
    echo: "Upprepningar",
    echoBody: "Samma ord eller fras upprepas på kort avstånd. Klicka för att söka. En refräng kan vara poängen.",
    reuse: "Upprepad fras",
    reuseBody: "Samma ordkedja dyker upp i mer än ett stycke. Klicka för att söka. En refräng kan vara poängen.",
    reuseWhere: "Styckena {list} · {n} ord",
    openFind: "Sök “{phrase}” i texten",
    povLeak: "Perspektivbrott",
    foot: "{words} ord · {sentences} meningar · {spoken}% tal",
    highlight: "Markera i texten",
    keepHighlight: "Behåll markering",
    measures: "Vad detta mäter",
    raise: "Hur du höjer det",
    remember: "Kom ihåg",
    longSentences: "{n}+ ord",
    rareList: "Utanför den välkända listan",
    hideGauge: "Dölj den här mätaren.",
    aboutGauge: "Om den här mätaren.",
    gaugeAria: "{label} {score}. {detail}",
    sparkTitle: "{count} ord",
    sparkAria: "Mening {n}, {count} ord",
    leakObjective: "De här raderna liknar tanke. Objektiv visar bara vad en kamera skulle se. Ett förslag, inte en dom.",
    leakFirstNamed: "De här raderna liknar ett annat medvetande än {who}. Ett förslag, inte en dom.",
    leakOther: "De här raderna liknar ett annat medvetande. Ett förslag, inte en dom.",
    leakLimitedNamed: "Begränsad till {who} — de här raderna liknar ett annat medvetande. Ett förslag, inte en dom.",
    directnessReadout:
      "{adverbs} -t-adverb / 1 000 · {passives} möjliga passiver / 1 000 · börjar på 100, minus de två.",
    pacingSpanSame: "{count} ord vardera",
    pacingSpanRange: "{min}–{max} ord",
    pacingReadout:
      "{mix} · {mean} ord typiskt · {span}. Variation höjer; en stapel av {n}+-meningar eller en monoton sänker.",
    vocabularyReadout: "{share}% ovanliga · variation {ttr}. En mix poängsätter högre än bara enkelt eller bara sällsynt.",
    vocabularyReadoutKid: "{share}% ovanliga · variation {ttr}. Bekanta ord poängsätter högre för den här läsaren.",
    mix: {
      mixed: "Blandat",
      choppy: "Kort och jämnt",
      sweeping: "Långt och jämnt",
      even: "Jämnt"
    },
    profiles: {
      empty: { label: "Ingen prosa ännu", genres: "" },
      short: { label: "För kort att mäta", genres: "Skriv lite till" },
      breezy: { label: "Snabbt och lätt", genres: "Thriller / YA" },
      brisk: { label: "Rörligt", genres: "Äventyr / romantik" },
      balanced: { label: "Balanserat", genres: "Allmän fiktion" },
      atmospheric: { label: "Tätt och atmosfäriskt", genres: "Litterärt / episk fantasy" },
      heavy: { label: "Tungt", genres: "Litterärt / experimentellt" }
    },
    gauges: {
      directness: {
        label: "Direkthet",
        measures: "Hur direkt du skriver, utifrån andelen sättsadverb och möjliga passiver.",
        raise: [
          "Byt ett svagt verb plus adverb mot ett starkare verb (sprang snabbt → rusade).",
          "Gör om en möjlig passiv till aktiv (dörren öppnades av henne → hon öppnade dörren)."
        ],
        remember:
          "100 är inte alltid målet. I drömlika eller atmosfäriska passager kan passiver och sättsadverb vara rätt val. Låt scenen leda."
      },
      pacing: {
        label: "Tempo",
        measures:
          "Hur mycket meningslängden varierar, och om långa rader staplas. En mix av korta och långa håller oftast farten.",
        raise: [
          "Bryt en svit av meningar på {n}+ ord. Klicka på en hög stapel för att granska en.",
          "Följ en lång rad med en kort stöt, eller tvärtom.",
          "Om varje mening är lika lång, variera en."
        ],
        remember:
          "Jämn, knackig prosa kan vara poängen — ett slagsmål, en jakt, dialog. Ett svepande stycke kan också vara det. Det här flaggar en monoton eller en stapel långa rader, inte en genre."
      },
      vocabulary: {
        label: "Ordförråd",
        measures: "Balansen mellan bekanta ord och ovanliga. Namn i Story Bible räknas bort.",
        raise: [
          "Om prosan bara har vanliga ord gör ett precist substantiv eller verb ofta mer än en rad adjektiv.",
          "Om ovanliga ord hopar sig, byt några mot enklare — om inte just den diktionen är författarrösten.",
          "Markera i texten visar ord utanför Dale–Challs bekanta lista."
        ],
        remember: "Ovanligt kan vara poängen. En hamnhistoria behöver kaj och blinda passagerare. 100 är en mix, inte ett enklare ordförråd."
      }
    }
  },
  notes: {
    review: "Granskning",
    title: "Kapitelanteckningar",
    emptyTitle: "Inget att flagga",
    intro:
      "Granskningen försöker hitta rader som varken visar karaktärens personlighet eller driver scenen framåt.",
    introReader: "Riktad till {category}, runt {age} år.",
    paragraph: "Stycke {n}",
    note: "Anteckning",
    clickHint: "Klicka på en anteckning för att läsa citatet. Anteckningar är inte omskrivningar.",
    nothingSolid: "Granskningsmodellen hittade inget hållbart i den här vändan.",
    foot: "Anteckningar flaggar ett ställe. De skriver inte om kapitlet och rör inte Story Bible.",
    categories: {
      show_vs_tell: {
        label: "Gestaltning",
        blurb: "En namngiven känsla där kroppen eller scenen kunde bära den."
      },
      dialogue_purpose: {
        label: "Dialog",
        blurb: "En talad rad som varken visar karaktär eller flyttar scenen."
      },
      voice_drift: {
        label: "Författarröst",
        blurb: "Registret gled från fältet Författarröst."
      },
      character_fidelity: {
        label: "Karaktär",
        blurb: "Ett slag som sitter mot ett låst Story Bible-karaktärsdrag."
      },
      child_agency: {
        label: "Handling",
        blurb: "En vuxen tar det avgörande steget. Barnet ska göra det."
      },
      lecture: {
        label: "Pekpinne",
        blurb: "En moral som sägs av en vuxen, inte tjänas av protagonistens val."
      }
    }
  },
  history: {
    kicker: "Kapitel",
    title: "Historik",
    emptyTitle: "Ingen historik än",
    intro:
      "Tidigare versioner från utkast, omskrivning, förlängning, utvidgning och omskriv. Återställ hoppar till den versionen. Senare rader blir kvar.",
    empty: "Modellen har inte skrivit om det här kapitlet än.",
    emptyProse: "(tomt)",
    clickHint: "Klicka på en version för att läsa den, och Återställ för att lägga den i kapitlet.",
    restore: "Återställ",
    compare: "Jämför",
    compareHint: "Klicka på en annan version för att jämföra med den här. Återställ använder fortfarande den valda versionen.",
    comparePair: "{from} → {to}",
    live: "Kapitlet nu",
    same: "De här två är lika.",
    fromOnly: "Bara i den här texten, det du tappar om du återställer",
    toOnly: "Bara i den här texten, det du får om du återställer",
    foot: "Listan är inte ångra. Det du skriver själv sparas inte. Prompter ser bara det aktuella kapitlet.",
    ops: {
      draft: "Utkast",
      recast: "Omskrivning",
      extend: "Förläng",
      elaborate: "Utvidga",
      rewrite: "Skriv om",
      beat: "Beat",
      restore: "Återställ",
      format: "Formatering",
      darling: "Älskling"
    }
  },
  markerConvert: {
    nav: "Konvertera markeringar",
    heading: "Konvertera markeringar till formatering",
    intro:
      "Gör om tecken som *asterisker* — eller par av öppnings-/avslutningstecken som ”smarta citattecken” — från ett importerat manus till riktig fetstil, kursiv eller understrykning. Markeringarna tas bort ur texten — bara formateringen blir kvar. Längre markeringar körs först, så \"**\" inte tolkas som två enstaka \"*\" — lägg till båda om ditt manus använder dem för olika saker.",
    openLabel: "Öppningstecken",
    openPlaceholder: "t.ex. * eller ”",
    closeLabel: "Avslutningstecken",
    closePlaceholder: "t.ex. * eller ”",
    becomes: "blir",
    styleLabel: "Stil",
    addRule: "Lägg till rad",
    removeRule: "Ta bort",
    convertAction: "Konvertera hela manuset",
    converting: "Konverterar…",
    resultSummary: "Konverterade {markers} i {chapters}.",
    resultNone: "Inga markeringar hittades — inget att konvertera.",
    markersCount: { one: "{count} markering", other: "{count} markeringar" },
    chaptersCount: { one: "{count} kapitel", other: "{count} kapitel" }
  },
  errors: {
    ollamaOrigins: "Den lokala servern tog inte emot webbläsaren. Kör du Ollama? Starta den med OLLAMA_ORIGINS=http://localhost:5175. Kör du LM Studio eller en annan server? Leta efter en inställning för vilka webbadresser som får ansluta (kallas ofta CORS eller allowed origins).",
    noModel: "Ingen lokal modell hittades. Starta Ollama eller din lokala server och ladda om.",
    notJson: "Den filen är inte JSON.",
    backupUnreadable: "Kunde inte läsa den säkerhetskopian.",
    shelfUnreadable: "Kunde inte läsa hyllan.",
    recastEmpty: "Skriv eller ta fram lite prosa innan du omskriver.",
    extractEmpty: "Skriv eller ta fram lite prosa innan du extraherar fakta.",
    analyzeEmpty: "Skriv eller ta fram lite prosa innan du analyserar kapitlet.",
    extractorNone: "Extraktorn hittade inga uttalade fakta i det här kapitlet.",
    interviewExtractorNone: "Extraktorn hittade inga uttalade fakta i det här samtalet.",
    brainstormExtractorNone: "Extraktorn hittade inga uttalade fakta i den här lappen.",
    synopsisExtractorNone: "Extraktorn hittade inga uttalade fakta i synopsis.",
    briefExtractorNone: "Extraktorn hittade inga uttalade fakta i den här brief:en.",
    importLoreNone: "Extraktorn hittade inga uttalade fakta i den inklistrade texten.",
    summarizeNone: "Kunde inte sammanfatta det här kapitlet — försök igen, eller skriv sammanfattningen för hand.",
    proofreadEmpty: "Skriv eller ta fram lite kapitelprosa innan korrekturläsning.",
    askManuscriptEmpty: "Skriv eller ta fram lite kapitelprosa innan du frågar om manuset.",
    askManuscriptNoMatch: "Inget i manuset matchar den frågan.",
    serverUrlMissing: "Ange din lokala servers adress i Inställningar.",
    busy: "En annan åtgärd pågår redan. Vänta tills den är klar och försök igen.",
    timeout: "Den lokala modellen svarade inte i tid. Den kanske fortfarande laddas, eller så behöver din dator längre tid än vanligt — kolla att den kör, försök sedan igen.",
    imageChoose: "Välj en bildfil.",
    imageRead: "Kunde inte läsa den bilden.",
    imageAdd: "Kunde inte lägga till den bilden."
  }
};
