import type { Messages } from "./en";

export const sv: Messages = {
  common: {
    cancel: "Avbryt",
    close: "Stäng",
    stop: "Stopp",
    save: "Spara",
    copy: "Kopiera",
    copied: "Kopierat"
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
  home: {
    headline: "Skriv prosan.",
    truth: "Story Bible håller sanning.",
    lede:
      "Ett lokalt manusverktyg. Ge boken en titel, väx fram berättelsen i Brainstorm, och lyft en Synopsis när den är redo. Modellen tar fram utkast till kapitlen — du bestämmer.",
    newManuscript: "Nytt manus",
    titlePlaceholder: "Titel",
    open: "Öppna",
    importBackup: "Importera backup",
    shelf: "Manus",
    emptyShelf: "Inga manus ännu. En titel räcker för att börja.",
    delete: "Radera",
    deleteConfirm: "Radera “{title}”? Det går inte att ångra.",
    replaceConfirm: "Ersätt “{title}” med den här säkerhetskopian? Allt som skrivits sedan den filen går förlorat.",
    chapters: { one: "{count} kapitel", other: "{count} kapitel" },
    facts: { one: "{count} låst faktum", other: "{count} låsta fakta" }
  },
  editor: {
    allManuscripts: "Alla manus",
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
    publish: "Publicera",
    settings: "Inställningar",
    settingsLede:
      "Hur det här manuset skrivs. Inte Story Bible. Kapitlen kan fortfarande överstyra kamera, röst och Läsare.",
    proseLanguage: "Prosans språk",
    proseLanguagePlaceholder: "t.ex. engelska",
    proseLanguageTitle: "Språket meningarna skrivs på. Tomt gissar från manuset. En skrivinstruktion, inte kanon.",
    modelsHeading: "Modeller",
    engineLabel: "Motor",
    engineOllama: "Ollama",
    engineOpenAiCompatible: "LM Studio / annan lokal server",
    engineLede: "Inga molntjänster eller konton, aldrig — bara en server som körs på den här datorn eller ditt lokala nätverk.",
    baseUrlLabel: "Serveradress",
    baseUrlPlaceholder: "http://localhost:1234",
    baseUrlLede: "Den lokala adress LM Studio (eller en annan lokal server, t.ex. llama.cpp) lyssnar på — visas oftast när du startar dess lokala server.",
    historyLimit: "Versioner per kapitel",
    historyLimitLede:
      "Hur många tidigare versioner av ett kapitel som sparas, från Skriv utkast, Omskriv, Förläng, Utveckla och Skriv om. Så fort gränsen nås försvinner den äldsta versionen först. Det du skriver själv för hand sparas inte som en egen version — bara de här åtgärderna gör det.",
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
    reorderChapters: "Kapitel. Dra för att ändra ordningen.",
    showBrief: "Visa disposition för {title}",
    hideBrief: "Dölj disposition för {title}",
    continuesCleared:
      "{title} fortsätter inte längre från “{from}”, för det kapitlet kommer senare. Nu följer det föregående i listan.",
    voice: "Författarröst",
    voicePlaceholder: "Torr, maritim, korta meningar",
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
    newStrand: "ny tråd",
    startChapter: "Börja kapitel {n}",
    draft: "Skriv utkast",
    extract: "Extrahera fakta",
    extracting: "Extraherar…",
    analyze: "Analysera",
    proofread: "Korrekturläsning",
    notes: "Anteckningar",
    history: "Historik",
    recast: "Omskriv prosan",
    recasting: "Omskriver…",
    recastTitle: "Omskriv kapitlet till nuvarande perspektiv, tempus och synvinkel",
    stop: "Stopp",
    ask: "Fråga…",
    askTitle: "Fråga",
    askBody: "Svaret läggs till i dina anteckningar. Det är inte kanon, och kapitelutkastet ser det inte.",
    askPlaceholder: "Vem är blinda passageraren? Ge tre alternativ och tryck på det svagaste.",
    askAction: "Fråga",
    openSynopsis: "Öppna synopsis",
    maximize: "Maximera",
    restore: "Återställ",
    maximizeTitle: "Dölj paneler och skriv",
    restoreTitle: "Visa paneler (Esc)",
    brainstormLede:
      "Privat kladd. En lapp per idé. Dra dem fritt — det finns ingen ordning än. Dra en lapp till kolumnen till höger när den ska bli handling.",
    brainstormPlaceholder:
      "En mystisk blinda passagerare. Som känner skeppet. Besättningen gör det inte. Tänk om hon är kaptenens syster — eller någon de aldrig mött?",
    synopsisLede:
      "Berättelsen i kortform: vem som är med, vad som händer, och var den landar. Utkast utgår alltid från den här sammanfattningen — men inget blir bindande förrän du låser det som fakta.",
    synopsisPlaceholder:
      "Emma har nattnycklarna. En främling betalar med salt. Till vintern måste hon lämna kajen, annars tar kanalen baren.",
    chapterPlaceholder: "Kapitlet lever här. Skriv utkast, skriv om tills det är ditt.",
    chapterImageAdd: "Lägg till kapitelbild",
    chapterImageReplace: "Byt bild",
    chapterImageRemove: "Ta bort bild",
    instructTitle: "Ändra den här noten",
    instructHint: "Säg åt modellen vad den ska göra med den markerade noten. Bara det spannet byts ut.",
    instructPlaceholder: "Ge två slut. Tryck på varför hon stannar. Tre namn på blinda passageraren.",
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
    sendToSynopsis: "Skicka till synopsis"
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
      ask: "Fråga brainstorm",
      "word-swap": "Ordalternativ",
      "sentence-split": "Meningsbrytning",
      "paragraph-break": "Styckebrytning",
      extract: "Extrahera fakta",
      analyze: "Analysera",
      illustrate: "Illustrationsprompt",
      proofread: "Korrekturläsning",
      "ask-manuscript": "Fråga manuset",
      interview: "Karaktärsintervju",
      develop: "Utvecklingsmetod",
      "extract-interview": "Extrahera fakta (intervju)"
    }
  },
  askManuscript: {
    nav: "Fråga manuset",
    title: "Fråga ditt manus",
    lede: "Ställ en fråga om din berättelse. Svaret använder bara det som faktiskt är skrivet — med de kapitel det hämtats från, så att du själv kan kontrollera det.",
    placeholder: "Var träffades Henrik och Elin första gången?",
    action: "Fråga",
    asking: "Frågar…",
    answerHeading: "Svar",
    sourcesHeading: "Källor",
    jumpToChapter: "Öppna ”{chapter}”",
    empty: "Ställ en fråga om ditt manus så visas svaret här, tillsammans med källorna."
  },
  interview: {
    action: "Intervju",
    title: "Intervjua {name}",
    lede: "Ett privat samtal med {name}, byggt bara på det som hittills är låst i din Story Bible. Inget som sägs här blir kanon av sig självt — ett sätt att höra rösten och upptäcka luckor i det som är etablerat.",
    placeholder: "Fråga {name} något…",
    ask: "Fråga",
    asking: "Frågar…",
    you: "Du",
    thinking: "{name} tänker…",
    empty: "Inget frågat än. Börja samtalet med {name} nedan.",
    extractAction: "Plocka ut fakta",
    extracting: "Plockar ut…"
  },
  timeline: {
    nav: "Tidslinje",
    title: "Tidslinje",
    lede: "Läsordningen är inte alltid när saker händer. Ge ett kapitel en tidsnotering och flytta det för att se var det egentligen hör hemma, jämfört med var det ligger i manuset.",
    readingPosition: "Manusposition {n}",
    storyTimePlaceholder: "När händer det här? T.ex. ”Tre år tidigare”",
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
    emptyChapters: "Skriv ett kapitel först — matrisen behöver något att visa."
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
    quickstartHeading: "Snabbstart",
    quickstartSteps: [
      {
        heading: "1. Installera en lokal modell",
        body: "Enklast är Ollama. Ladda ner den från ollama.com och installera den som vilket program som helst, öppna den sen och hämta en modell — den visar ett bibliotek att välja från. Vilken vanlig chattmodell som helst funkar för att börja (t.ex. llama3 eller mistral — några gigabyte att ladda ner, en gång). Föredrar du LM Studio eller en annan lokal server istället? Det funkar också — se nästa steg."
      },
      {
        heading: "2. Peka StoryBook AI mot den",
        body: "Inget att ställa in om du använde Ollama — StoryBook AI hittar den automatiskt på din dator. Kör du LM Studio eller en annan lokal server istället? Öppna Inställningar → Modeller, välj den under Motor, och klistra in serveradressen den visar dig."
      },
      {
        heading: "3. Starta ditt manus",
        body: "En titel räcker. Öppna det, så hamnar du här — i Brainstorm så fort du har idéer, men först: ett privat skissutrymme utan något att ställa in än."
      },
      {
        heading: "4. Skriv",
        body: "Dra de idéer som är klara till Synopsis — formen på hela berättelsen. Öppna sen ett kapitel och tryck Skriv utkast: modellen skriver utifrån ditt Synopsis, din Story Bible och kapitlets egen instruktion. Inget den skriver blir låst sanning förrän du säger till — skriv om det, byt kamera, eller be om en analys när som helst."
      }
    ],
    howHeading: "Så är appen uppbyggd",
    sections: [
      {
        heading: "Författaren vinner alltid över AI:n",
        body: "Modellen föreslår, du bestämmer. En detalj modellen hittar på i prosan förblir ett förslag — visas med en lätt streckad understrykning — tills du låser den i Story Bible. Inget blir kanon av sig självt."
      },
      {
        heading: "Brainstorm & Synopsis",
        body: "Brainstorm är där idéer lever innan de blir berättelse — en anteckning per idé, dragbar, ingen ordning krävs. Dra de som håller till Synopsis: formen på hela boken, i några meningar. Varje kapitelutkast lutar sig mot Synopsis, aldrig mot brainstorm-anteckningar du inte lyft över."
      },
      {
        heading: "Kapitel: Skriv utkast, Omskriv, Analysera",
        body: "Skriv utkast skriver ny prosa utifrån det som redan är etablerat. Omskriv skriver om samma kapitel i ett annat perspektiv eller tempus, med samma händelser kvar. Analysera granskar ett kapitel för vanliga skrivproblem — berättar istället för att visa, meningslös dialog, ett drag som krockar med ett låst karaktärsdrag — utan att skriva om en enda rad. Läsare (i Inställningar, och per kapitel) anger vem texten skrivs för — Pekbok till Vuxen — så meningslängd och ordval matchar den åldern. Under texten växlar Ovanliga ord och Klichéer mellan två valfria markeringar — ovanliga ord för den läsaren, och formuleringar som låter AI-skrivna (\"ett bevis på\", överanvända tankstreck) — en i taget, avstängt som standard."
      },
      {
        heading: "Scener",
        body: "Ett långt kapitel kan delas upp i scener — välj var en slutar och nästa börjar, namnge den, lägg till en kort anteckning. När ett kapitel har scener kan Skriv utkast, Omskriv och Analysera var för sig riktas mot bara en av dem."
      },
      {
        heading: "Story Bible",
        body: "Den enda sanningskällan för din berättelses fakta — vem någon är, var en plats ligger, vad ett namn betyder. Ett fakta börjar som ett förslag, från dig eller från en extraktion, och blir bara låst sanning när du godkänner det. Låsta fakta är det modellen får veta att den inte får motsäga. Öppna en karaktärs kort och tryck Intervjua för att chatta med dem, i deras egen röst, byggt bara på det som hittills är låst — ett sätt att höra rösten och upptäcka luckor, inte skapa ny kanon. Säger de något värt att spara, tryck Plocka ut fakta för att föreslå det till Story Bible — samma granskningskö som all annan extraktion, inget läggs till förrän du godkänner. Ctrl-klicka (Cmd-klicka på Mac) på ett namn du känner igen var som helst i din text för att hoppa direkt till kortet — ett vanligt klick placerar bara markören där, som vanligt."
      },
      {
        heading: "Kontinuitetsvarningar",
        body: "När ett kapitel kan se ett fakta som bara etablerades senare i manuset flaggas det — inte nödvändigtvis fel, kanske är det en tillbakablick, bara värt en snabb koll. Korrekturläsningen går längre: den kontrollerar en persons eller ett föremåls registrerade plats genom hela berättelsen, i berättelsens egen tidsordning, och flaggar en förflyttning som ser omöjlig eller oförklarad ut med tanke på hur mycket tid som gått."
      },
      {
        heading: "Timeline",
        body: "Läsordning och berättelsens egen tidsordning är inte alltid samma sak. Ge ett kapitel en tidsanteckning, och se hur boken faller ut sorterad efter när saker faktiskt händer, bredvid var det ligger i manuset."
      },
      {
        heading: "Trådar (Plotlines)",
        body: "Håll koll på vilken tråd som går genom vilket kapitel i en tabell, så en tråd som varit tyst i tio kapitel är lätt att upptäcka."
      },
      {
        heading: "Utvecklingsmetod",
        body: "En valfri, färdig serie steg för att låta en gnista växa till en form — Snowflake, Three-Act Structure, Save the Cat eller Hero's Journey. Den behåller aldrig något eget: en vändpunktsbaserad metods vändpunkter blir trådar i Trådar, och Snowflakes steg skriver rakt in i Synopsis, precis som vilken annan anteckning du lyfter dit. Att byta metod, eller välja ingen alls, tar aldrig bort något som redan finns i endera."
      },
      {
        heading: "Korrekturläsning",
        body: "En sista genomgång av hela manuset: grammatik, upprepade scener, stil- och känsloglidning mellan kapitel, åldersanpassning, en kontinuitetskontroll, en koll efter planterade detaljer som aldrig löses in (en pistol som visas i kapitel 4 men som ingen någonsin avfyrar), och en faktakontroll mot hela boken. När Läsare är satt till en barn- eller ungdomsnivå flaggar den dessutom svordomar, våld eller explicit innehåll som inte passar den åldern. Bara anteckningar — inget skrivs om åt dig. Den pausar och återupptar, och kollar bara om det som faktiskt ändrats."
      },
      {
        heading: "Fråga manuset",
        body: "Ställ en fråga om din egen berättelse och få ett svar byggt bara på det som faktiskt är skrivet — med kapitlen det kom från, så att du kan kontrollera det själv."
      },
      {
        heading: "Publicera",
        body: "Exportera en ren läskopia — Markdown, RTF, ODT, HTML, ePub eller PDF. Brainstorm lämnar aldrig boken; bara själva manuset gör det."
      }
    ],
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
        heading: "Kan jag använda en betald AI-tjänst istället?",
        body: "Nej — medvetet. StoryBook AI pratar bara någonsin med en modell som körs på din egen dator eller nätverk. Det är inte en saknad funktion; det är hela poängen: ditt manus behöver aldrig lämna din maskin."
      }
    ]
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
    analyze: "Analysera"
  },
  publish: {
    title: "Publicera",
    body: "En läsbar kopia av berättelsen. Lämnar brainstorm utanför. RTF och ODT öppnas i Scrivener. HTML öppnas i valfri webbläsare. ePub öppnas i en e-boksläsare. PDF är redo att skriva ut.",
    documentName: "Dokumentnamn",
    format: "Format",
    font: "Typsnitt",
    systemFont: "Standardserif (Times/Georgia)",
    action: "Publicera",
    markdown: "Markdown",
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
    action: "Sök",
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
    contentFlag: "Innehållsvarning"
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
    review: "Granskning",
    reviewCount: "Granskning · {count}",
    lockedCount: "{count} låsta",
    exportCards: "Exportera kort",
    exportCardsTitle: "Ladda ner karaktärer, platser och föremål till Sandbox",
    nothingMatches: "Inget matchar.",
    hidden: "Dold",
    name: "Namn",
    close: "Stäng",
    reviewBody: "Föreslagna rader i Story Bible. Förtydliga dem, lås — eller förkasta.",
    hideFromDraft: "Dölj för utkast",
    interview: "Intervjua",
    showToDraft: "Visa för utkast",
    hiddenNote: "Modellen ser inte det här kortet förrän du visar det igen.",
    thisIsA: "Detta är en",
    pictures: "Bilder",
    picturesAside: "(För senare export. Utkast ser aldrig dessa.)",
    removePicture: "Radera bild {n}",
    addImage: "Lägg till bild",
    addingImage: "Lägger till bild",
    addFact: "Lägg till fakta",
    claimPlaceholder: "Påståendet, på en rad",
    lockInto: "Lås till Story Bible",
    history: "Historik",
    historyCurrent: "nu",
    asOfLabel: "Visa Story Bible som den var vid",
    asOfNow: "Nuläget",
    asOfBanner: "Visar Story Bible som den såg ut vid ”{chapter}” — skrivskyddat.",
    asOfBack: "Tillbaka till nuläget",
    asOfEntityLede: "Som det stod vid ”{chapter}”.",
    mentions: "Omnämnanden",
    mentionsAside: "(Varje kapitel där den här entiteten nämns i prosan.)",
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
    tagsPlaceholder: "medelålders, dubbel natur",
    personality: "Personlighet",
    personalityPlaceholder: "Hur de brukar vara",
    namePlaceholder: "Namn",
    factText: "Faktatext",
    conflictsWith: "Krockar med: {value}",
    similarTo: "Liknar: {value} — verkar vara samma fakta, fast mer detaljerad",
    lock: "Lås",
    merge: "Slå ihop",
    reject: "Förkasta",
    show: "Visa",
    hide: "Dölj",
    showClaim: "Visa det här påståendet för utkast",
    hideClaim: "Dölj det här påståendet för utkast",
    edit: "Redigera",
    editFact: "Redigera fakta",
    save: "Spara",
    kinds: {
      characters: "Karaktärer",
      locations: "Platser",
      objects: "Föremål",
      groups: "Grupper",
      events: "Händelser"
    },
    singular: {
      characters: "Karaktär",
      locations: "Plats",
      objects: "Föremål",
      groups: "Grupp",
      events: "Händelse"
    },
    newLabel: {
      characters: "Ny karaktär",
      locations: "Ny plats",
      objects: "Nytt föremål",
      groups: "Ny grupp",
      events: "Ny händelse"
    },
    empty: {
      characters: "Inga karaktärer ännu.",
      locations: "Inga platser ännu.",
      objects: "Inga föremål ännu.",
      groups: "Inga grupper ännu.",
      events: "Inga händelser ännu."
    },
    predicates: {
      "core.identity": "Identitet",
      "core.trait": "Karaktärsdrag",
      "core.place": "Plats",
      "core.object": "Föremål",
      "core.group": "Grupp",
      "core.relationship": "Relation",
      "core.event": "Händelse"
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
    rewriteMenu: "Skriv om…",
    illustrate: "Illustrationsprompt…",
    lift: "Lyft till synopsis",
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
    rewritePlaceholder: "Kortare. Mer spänning. I Emmas röst. Skär bort metaforen.",
    rewriteAction: "Skriv om",
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
      restore: "Återställ"
    }
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
    proofreadEmpty: "Skriv eller ta fram lite kapitelprosa innan korrekturläsning.",
    askManuscriptEmpty: "Skriv eller ta fram lite kapitelprosa innan du frågar om manuset.",
    askManuscriptNoMatch: "Inget i manuset matchar den frågan.",
    serverUrlMissing: "Ange din lokala servers adress i Inställningar.",
    imageChoose: "Välj en bildfil.",
    imageRead: "Kunde inte läsa den bilden.",
    imageAdd: "Kunde inte lägga till den bilden."
  }
};
