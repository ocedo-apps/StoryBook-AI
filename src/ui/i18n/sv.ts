import type { Messages } from "./en";

export const sv: Messages = {
  common: {
    cancel: "Avbryt",
    close: "Stäng",
    stop: "Stopp",
    save: "Spara"
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
    noModels: "Inga Ollama-modeller",
    backup: "Säkerhetskopia",
    backupDue: "! Säkerhetskopia",
    backupDueTitle: "Manuset har ändrats sedan senaste JSON-säkerhetskopian",
    backupTitle: "Säkerhetskopia",
    publish: "Publicera",
    settings: "Inställningar",
    settingsLede:
      "Hur det här manuset skrivs. Inte Story Bible. Kapitlen kan fortfarande överstyra kamera, röst och Läsare.",
    proseLanguage: "Prosans språk",
    proseLanguagePlaceholder: "Svenska",
    proseLanguageTitle: "Språket meningarna skrivs på. Tomt gissar från manuset. En skrivinstruktion, inte kanon.",
    modelsHeading: "Modeller",
    historyLimit: "Versioner per kapitel",
    historyLimitLede:
      "Hur många tidigare versioner varje kapitel behåller efter utkast, omskrivning, förlängning, utvidgning och omskriv. Äldsta försvinner först. Det du skriver själv sparas inte.",
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
    readerPlaceholder: "Ålder",
    readerTitle: "Vem prosan ställs mot. Tomt lämnar dagens vuxna bas.",
    readerCategories: {
      board: "Pekbok",
      early: "Lättläst",
      chapter: "Kapitelbok",
      middle: "Mellanålder",
      ya: "Ungdom",
      adult: "Vuxen"
    },
    chapterReader: "Kapitlets läsare",
    chapterReaderInherit: "{age} (manus)",
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
  publish: {
    title: "Publicera",
    body: "En läsbar kopia av berättelsen. Lämnar brainstorm utanför. RTF och ODT öppnas i Scrivener. HTML öppnas i valfri webbläsare. ePub öppnas i en e-boksläsare.",
    documentName: "Dokumentnamn",
    format: "Format",
    action: "Publicera",
    markdown: "Markdown",
    rtf: "RTF",
    odt: "ODT",
    html: "HTML",
    epub: "ePub"
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
    style: "Stil mellan kapitel",
    age: "Åldersrapport",
    grammarProgress: "Grammatik — {done} av {total} kapitel klara",
    scenesProgress: "Letar upprepade scener — {done} av {total} styckepar jämförda",
    styleProgress: "Stilkonsekvens mellan kapitel",
    ageProgress: "Sammanställer åldersrapport",
    now: "Just nu: {detail}",
    nowGrammar: "läser kapitel {n}…",
    nowScenes: "jämför kapitel {a} med kapitel {b}…",
    nowStyle: "lyssnar efter ett skifte i registret…",
    nowAge: "väger prosan mot Läsare…",
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
    craft: "Kamera på korten"
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
    lock: "Lås",
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
    extend: "Förläng",
    elaborate: "Brodera ut",
    rewriteMenu: "Skriv om…",
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
    ollamaOrigins: "Ollama tog inte emot webbläsaren. Starta den med OLLAMA_ORIGINS=http://localhost:5175",
    noModel: "Ingen lokal modell. Starta Ollama och ladda om.",
    notJson: "Den filen är inte JSON.",
    backupUnreadable: "Kunde inte läsa den säkerhetskopian.",
    shelfUnreadable: "Kunde inte läsa hyllan.",
    recastEmpty: "Skriv eller ta fram lite prosa innan du omskriver.",
    extractEmpty: "Skriv eller ta fram lite prosa innan du extraherar fakta.",
    analyzeEmpty: "Skriv eller ta fram lite prosa innan du analyserar kapitlet.",
    extractorNone: "Extraktorn hittade inga uttalade fakta i det här kapitlet.",
    proofreadEmpty: "Skriv eller ta fram lite kapitelprosa innan korrekturläsning.",
    imageChoose: "Välj en bildfil.",
    imageRead: "Kunde inte läsa den bilden.",
    imageAdd: "Kunde inte lägga till den bilden."
  }
};
