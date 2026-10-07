import type { Messages } from "./en";

export const nb: Messages = {
  common: {
    cancel: "Avbryt",
    close: "Lukk",
    stop: "Stopp",
    save: "Lagre",
    copy: "Kopier",
    copied: "Kopiert",
    infoAbout: "Mer om {field}"
  },
  app: {
    crash: "Appen støtte på en feil.",
    tryAgain: "Prøv på nytt",
    missingRoot: "Mangler elementet #root"
  },
  chrome: {
    language: "Språk",
    light: "Lyst",
    dark: "Mørkt",
    lightTitle: "Bruk en lys side",
    darkTitle: "Bruk en mørk side"
  },
  appBar: {
    nav: "Manuskripter",
    newManuscript: "Nytt manuskript…",
    viewAll: "Vis alle manuskripter",
    goHome: "Gå til alle manuskripter"
  },
  home: {
    headline: "Skriv prosaen.",
    truth: "Story Bible holder sanning.",
    lede:
      "Et lokalt manuskriptverktøy. Gi boken en tittel, vek fram fortellingen i Brainstorm, og løft en Synopsis når den er klar. Modellen tar fram utkast til kapitlene — du bestemmer.",
    newManuscript: "Start nytt manuskript",
    titlePlaceholder: "Tittel",
    open: "Opprett",
    importBackup: "Importer sikkerhetskopi",
    shelf: "Manuskripter",
    shelfHeading: "Dine manuskripter",
    searchPlaceholder: "Søk manuskripter…",
    noSearchResults: "Ingen manuskripter samsvarer med søket.",
    emptyShelf: "Ingen manuskripter ennå. En tittel er nok til å starte.",
    delete: "Slett",
    deleteConfirm: "Slett “{title}”? Dette kan ikke angres.",
    replaceConfirm: "Erstatt “{title}” med denne sikkerhetskopien? Alt som er skrevet siden den filen går tapt.",
    chapters: { one: "{count} kapittel", other: "{count} kapitler" },
    facts: { one: "{count} låst faktum", other: "{count} låste fakta" },
    connectFound: { one: "Tilkoblet — {count} modell funnet.", other: "Tilkoblet — {count} modeller funnet." },
    connectNotFound:
      "Ikke tilkoblet ennå. Har du ingen lokal AI-server? Vi anbefaler Ollama — gratis, fra ollama.com. Installer en modell (søk på «stheno» for en tilpasset skjønnlitteratur, eller en hvilken som helst vanlig chattmodell, f.eks. llama3), så dukker den opp her automatisk.",
    desktopInstallOllama: "Installer Ollama",
    desktopGpuSuggestion: "Basert på grafikkortets minne (~{gb} GB) takler denne datamaskinen trolig {tier}.",
    desktopGpuTier3b: "en liten modell, omtrent 3 milliarder parametere (4-bit)",
    desktopGpuTier7b: "en modell på omtrent 7-8 milliarder parametere (4-bit)",
    desktopGpuTier14b: "en modell på omtrent 13-14 milliarder parametere (4-bit)",
    desktopGpuTier30b: "en modell på omtrent 30-34 milliarder parametere (4-bit)",
    desktopGpuTier70b: "en stor modell, 70 milliarder parametere eller mer (4-bit)",
    desktopCheckUpdate: "Se etter oppdateringer",
    desktopCheckingUpdate: "Ser etter oppdateringer…",
    desktopUpdateAvailable: "En ny versjon finnes ({latest}, du har {current}).",
    desktopViewChangelog: "Vis endringslogg",
    desktopDownloadUpdate: "Last ned oppdatering",
    desktopUpToDate: "Du har den nyeste versjonen ({current}).",
    desktopUpdateCheckFailed: "Kunne ikke se etter oppdateringer: {error}"
  },
  editor: {
    manuscriptTitle: "Manuskripttittel",
    writing: "Skriving",
    primer: "Startprompt",
    primerTitle: "Startprompt for denne skrivemodellen",
    primerLede: "Den går ut før hver skrivejobb. Kapitlets regler følger likevel. Tom betyr bare de reglene.",
    primerRestore: "Bruk startprompten",
    primerAria: "Startprompt for {model}",
    review: "Gjennomgang",
    noModels: "Ingen lokale modeller funnet",
    backup: "Sikkerhetskopi",
    backupDue: "! Sikkerhetskopi",
    backupDueTitle: "Manuskriptet har endret seg siden siste JSON-sikkerhetskopi",
    backupTitle: "Sikkerhetskopi",
    appExport: "Eksporter for andre apper",
    appExportTitle: "Last ned en StoryCore-eksport av manuset — låste Story Bible-fakta og kapitler, til for at en søsterapp som ComicBook AI skal kunne importere. Et øyeblikksbilde, ingen levende kobling.",
    publish: "Publiser",
    archiveNav: "Arkiv",
    toolsNav: "Verktøy",
    settings: "Innstillinger",
    settingsLede:
      "Hvordan dette manuskriptet skrives. Ikke Story Bible. Kapitlene kan fortsatt overstyre kamera, stemme og Leser.",
    generalHeading: "Generelt",
    illustrationsHeading: "Illustrasjoner",
    proseLanguage: "Prosaens språk",
    proseLanguagePlaceholder: "f.eks. engelsk",
    proseLanguageTitle: "Språket setningene skrives på. Tomt gjetter fra manuskriptet. En skriveinstruksjon, ikke kanon.",
    modelsHeading: "AI-innstillinger",
    engineLabel: "Motor",
    engineOllama: "Ollama",
    engineOpenAiCompatible: "LM Studio / annen lokal server",
    engineLede: "Ingen skytjenester eller kontoer, aldri — bare en server som kjører på denne maskinen eller ditt lokale nettverk.",
    baseUrlLabel: "Serveradresse",
    baseUrlPlaceholder: "http://localhost:1234",
    baseUrlLede: "Den lokale adressen LM Studio (eller en annen lokal server, som llama.cpp) lytter på — vises som regel når du starter dens lokale server.",
    contextWindowLabel: "Kontekstvindu",
    contextWindowLede: "Hvor mye tekst modellen får vite at den faktisk kan se på. Ollamas eget standardverdi er ofte mye mindre enn det modellen og maskinen din faktisk klarer, noe som kan gjøre at Draft mister oversikten over detaljer som ble skrevet bare et avsnitt eller to tilbake. Et høyere tall krever mer minne (RAM/VRAM) — senk det hvis genereringen blir svært treg eller mislykkes.",
    contextWindowSuggest: "Foreslå fra modellen",
    contextWindowSuggesting: "Sjekker…",
    contextWindowSuggested: "Satt til {value}, modellens egen rapporterte maksverdi.",
    contextWindowSuggestError: "Klarte ikke hente dette fra modellen — angi det for hånd.",
    contextWindowOpenAiNote: "For LM Studio og andre OpenAI-kompatible servere settes kontekstlengden når du laster modellen der, ikke her.",
    filterLoreLabel: "Vis bare relevant lore for Skriv utkast",
    filterLoreLede: "Avslått som standard. Lore-fakta (importert, ikke skrevet i et kapittel) tas ellers alltid med, uansett om kapittelet faktisk handler om dem. Slå på denne hvis Story Bible-en din har mye importert lore og prompten begynner å bli for stor — da tas bare lore med hvis navnet (eller, for Hendelser, en deltaker eller et sted) nevnes i kapittelets brief eller tekst så langt. Pin en enkelt lore-fakta for å alltid ta den med uansett, med samme knapp som allerede finnes i Story Bible.",
    historyLimit: "Versjoner",
    historyLimitLede:
      "Hvor mange tidligere versjoner av et kapittel som lagres, fra Lag utkast, Omskriv, Forleng, Utdyp og Skriv om. Så snart grensen nås, forsvinner den eldste versjonen først. Det du skriver selv for hånd lagres ikke som en egen versjon — bare disse handlingene gjør det.",
    uiLanguageStays: "Sidens språk blir liggende i hodet.",
    brainstorm: "Brainstorm",
    synopsis: "Synopsis",
    briefs: "Disposisjoner",
    briefsLede:
      "Hvert kort er et kapittel. Dra et kort så følger det med, og de andre glir unna. Dobbeltklikk på en tittel for å skrive kapittelet.",
    reorderBriefs: "Kapitteldisposisjoner. Dra for å endre rekkefølgen.",
    openChapter: "Skriv {title}",
    chapters: "Kapitler",
    add: "Legg til",
    untitled: "Uten tittel",
    removeChapter: "Slett {title}",
    removeChapterFallback: "kapittel",
    discardChapterConfirm: "Flytt “{title}” til Forkastede kapitler?",
    discardedChapters: "Forkastede kapitler",
    restoreChapter: "Gjenopprett {title}",
    restoreDiscarded: "Gjenopprett",
    throwAwayChapter: "Kast {title}",
    throwAwayConfirm: "Kast “{title}” for godt? Kapittelet forsvinner. Dette kan ikke angres.",
    chapterFactsNote: {
      one: "{count} faktum i Story Bible kommer fra dette kapittelet. Det fjernes eller endres ikke automatisk — sjekk Story Bible hvis du vil oppdatere eller slette det for hånd.",
      other: "{count} fakta i Story Bible kommer fra dette kapittelet. De fjernes eller endres ikke automatisk — sjekk Story Bible hvis du vil oppdatere eller slette dem for hånd."
    },
    reorderChapters: "Kapitler. Dra for å endre rekkefølgen.",
    showBrief: "Vis brief for {title}",
    hideBrief: "Skjul brief for {title}",
    continuesCleared:
      "{title} fortsetter ikke lenger fra “{from}”, fordi det kapittelet kommer senere. Nå følger det forrige kapittel i listen.",
    voice: "Forfatterstemme",
    voicePlaceholder: "Tone, rytme, ordvalg",
    chapterVoiceInherit: "Manuskriptets stemme",
    manuscript: "Manuskript",
    brief: "Brief",
    briefPlaceholder: "Hva kapitlet må gjøre. En skriveinstruksjon, ikke kanon.",
    chapterTitle: "Kapitteltittel",
    chapterBrief: "Kapittelbrief",
    chapterVoice: "Kapitlets forfatterstemme",
    voiceCue: "Forfatterstemme",
    reader: "Leser",
    readerTitle: "Hvem teksten skrives for. Velg aldersgruppen som passer best — Voksen skriver uten aldersgrenser i tankene.",
    readerTierHint:
      "Kapitler som skrives for denne leseren får kortere setninger og enklere ord, tilpasset aldersgruppen. Korrekturlesing flagger også banning, vold eller eksplisitt innhold som ikke passer den alderen.",
    readerCategories: {
      board: "Pekebok (opp til 3 år)",
      early: "Lettlest (4–7 år)",
      chapter: "Kapittelbok (8–9 år)",
      middle: "Mellomalder (10–12 år)",
      ya: "Ungdom (13–17 år)",
      adult: "Voksen"
    },
    chapterReader: "Kapitlets leser",
    chapterSettingsToggle: "Kapitlets innstillinger",
    chapterReaderInheritOption: "Samme som manuskriptet — {category}",
    readerCue: "Leser",
    placeholdersCue: "Har en plassholder å komme tilbake til",
    newStrand: "ny tråd",
    startChapter: "Start kapittel {n}",
    draft: "Lag utkast",
    extract: "Hent ut fakta",
    extracting: "Henter ut…",
    analyze: "Analyser",
    askPassage: "Spør om kapittelet…",
    proofread: "Korrektur",
    notes: "Notater",
    history: "Historikk",
    recast: "Omskriv prosa",
    recasting: "Omskriver…",
    recastTitle: "Omskriv kapitlet til gjeldende perspektiv, tempus og synsvinkel",
    stop: "Stopp",
    brainstormChat: "Diskuter idéer…",
    openSynopsis: "Åpne synopsis",
    maximize: "Maksimer",
    restore: "Gjenopprett",
    maximizeTitle: "Skjul paneler og skriv",
    restoreTitle: "Vis paneler (Esc)",
    pinPanel: "Fest panelet",
    unpinPanel: "Skjul panelet automatisk — før pekeren mot kanten for å hente det fram igjen",
    brainstormLede:
      "Privat kladd. En lapp per idé. Dra dem fritt — det finnes ingen rekkefølge ennå. Når en lapp er klar, dra den til kolonnen Til synopsis til høyre.",
    brainstormPlaceholder: "En idé…",
    synopsisLede:
      "Historien i kortform: hvem som er med, hva som skjer og hvordan den ender. Utkastene tar alltid utgangspunkt i denne oppsummeringen – men ingenting blir bindende før du fastslår det som fakta.",
    synopsisPlaceholder: "Historien i noen setninger.",
    chapterPlaceholder: "Kapitlet lever her. Skriv utkast, skriv om til det er ditt.",
    chapterImageAdd: "Legg til kapittelbilde",
    chapterImageReplace: "Bytt bilde",
    chapterImageRemove: "Fjern bilde",
    instructTitle: "Endre dette notatet",
    instructHint: "Si til modellen hva den skal gjøre med det markerte notatet. Bare det spannet byttes ut.",
    instructPlaceholder: "Hva skal endres?",
    instructAction: "Skriv om",
    addNote: "Ny lapp",
    removeNote: "Fjern lapp",
    removeNoteConfirm: "Kast denne lappen?",
    noteLabel: "Brainstorm-lapp",
    reorderNotes: "Dra for å flytte lappen",
    noteColor: "Lappens farge",
    noteColors: {
      paper: "Papir",
      rust: "Rust",
      sage: "Salvie",
      gold: "Gull",
      lilac: "Lilla"
    },
    sendLane: "Til synopsis",
    sendLaneLede: "Slipp lapper her. Rekkefølgen i kolonnen er rekkefølgen de lander som avsnitt.",
    sendLaneEmpty: "Slipp lapper her",
    sendToSynopsis: "Send til synopsis",
    extractNoteFacts: "Hent ut fakta",
    extractNoteFactsHint: "Finn mulige Story Bible-fakta i denne lappen. De havner i granskingskøen som kandidater — ingenting blir kanon før du låser det.",
    extractSynopsisFacts: "Hent ut fakta",
    extractSynopsisFactsHint: "Finn mulige Story Bible-fakta i denne synopsis. De havner i granskingskøen som kandidater — ingenting blir kanon før du låser det.",
    extractBriefFacts: "Hent ut fakta",
    extractBriefFactsHint: "Finn mulige Story Bible-fakta i denne brief-en. De havner i granskingskøen som kandidater — ingenting blir kanon før du låser det.",
    chapterSummary: "Kapittelsammendrag",
    summaryPlaceholder: "Hva som faktisk skjer i dette kapittelet — skriv for hånd, eller oppsummer under når det finnes tekst.",
    summarizeChapterAction: "Oppsummer kapittel",
    summarizeChapterHint: "Et kort sammendrag av hva som skjer i dette kapittelet, så senere kapitlers Skriv utkast/Fortsett/Utdyp/Beat kan se det uten å trenge hele kapittelets tekst.",
    summarizing: "Oppsummerer…"
  },
  backup: {
    title: "Sikkerhetskopi",
    body: "En JSON-kopi appen kan lese tilbake. Importer sikkerhetskopi på hyllen gjenoppretter den. Alt som er skrevet siden den filen går tapt.",
    whatHappened: "Historikk",
    whatHappenedPlaceholder: "Valgfritt. Omskriv kapittel 2, ny forfatterstemme på 3.",
    documentName: "Dokumentnavn",
    action: "Sikkerhetskopi",
    errors: {
      "not-backup": "Den filen er ikke en manuskriptsikkerhetskopi.",
      "sandbox-export": "Den filen er en karteksport fra Sandbox. Importer den i Sandbox, ikke her.",
      "not-manuscript": "Den filen er ikke en StoryBook-manuskriptsikkerhetskopi.",
      "newer-format": "Denne sikkerhetskopien kommer fra en nyere StoryBook. Oppdater appen og prøv på nytt.",
      unreadable: "Manuskriptet i filen kunne ikke leses."
    }
  },
  illustration: {
    fieldLabel: "Illustrasjonsstil",
    browseLibrary: "Bla i biblioteket…",
    libraryTitle: "Illustrasjonsstiler",
    searchPlaceholder: "Søk stiler…",
    searchResults: "Søkeresultater",
    saveCurrentAsNew: "Lagre gjeldende tekst som ny stil",
    select: "Bruk denne stilen",
    edit: "Endre",
    delete: "Fjern",
    untagged: "Utaggede",
    noResults: "Ingen stiler passer.",
    newStyleTitle: "Ny stil",
    editStyleTitle: "Endre stil",
    nameLabel: "Navn",
    promptTextLabel: "Prompttekst",
    genreTagsLabel: "Sjangertagger",
    genreTagsPlaceholder: "Kommaseparert, f.eks. Fantasy, Eventyr",
    exampleImageLabel: "Eksempelbilde",
    uploadImage: "Last opp bilde",
    replaceImage: "Bytt bilde",
    removeImage: "Fjern bilde",
    deleteConfirm: "Fjerne “{name}” fra biblioteket? Dette kan ikke angres.",
    promptTitle: "Illustrasjonsprompt",
    promptHint: "Generert fra utdraget, låste Story Bible-fakta og manuskriptets illustrasjonsstil.",
    generating: "Genererer…",
    generateError: "Kunne ikke generere en prompt denne gangen.",
    viewFullImage: "Vis bildet i full størrelse",
    noStyleSelected: "Ingen stil valgt",
    customStyleLabel: "Egen prompt",
    editTextManually: "Rediger teksten manuelt",
    hideManualEdit: "Skjul manuell tekst",
    orientationLabel: "Illustrasjonsformat",
    orientations: {
      landscape: "Liggende",
      portrait: "Stående"
    }
  },
  aiContext: {
    trigger: "Vis AI-kontekst…",
    title: "AI-kontekst",
    hint: "Nøyaktig hva som ble sendt til modellen for den siste jobben, inkludert det som ble utelatt.",
    empty: "Ingen AI-jobb har kjørt ennå denne økten. Kjør en skrive- eller vurderingsjobb og kom tilbake hit.",
    operation: "Jobb",
    model: "Modell",
    tokensEstimate: "~{n} tokens (grovt estimat)",
    systemInstructions: "Systeminstruks",
    whatWasSent: "Det som ble sendt",
    whatCameBack: "Hva modellen svarte (rått, uredigert)",
    target: {
      prose: "kapittel",
      synopsis: "synopsis",
      brainstorm: "brainstorm-lapp"
    },
    operations: {
      draft: "Skriv utkast",
      recast: "Recast",
      extend: "Fortsett",
      elaborate: "Utdyp",
      instruct: "Skriv om",
      "brainstorm-chat": "Brainstorm-chat",
      "word-swap": "Ordalternativer",
      "sentence-split": "Setningsdeling",
      "paragraph-break": "Avsnittsdeling",
      extract: "Hent fakta",
      analyze: "Analyser",
      illustrate: "Illustrasjonsprompt",
      proofread: "Korrekturlesing",
      "ask-manuscript": "Spør manuset",
      "ask-passage": "Spør om passasje",
      interview: "Karakterintervju",
      develop: "Utviklingsmetode",
      "extract-interview": "Hent ut fakta (intervju)",
      "extract-brainstorm": "Hent ut fakta (brainstorm)",
      "extract-synopsis": "Hent ut fakta (synopsis)",
      "extract-brief": "Hent ut fakta (brief)",
      "import-lore": "Importer lore",
      beat: "Skriv en beat",
      summarize: "Oppsummer kapittel"
    }
  },
  askManuscript: {
    nav: "Spør manuset",
    title: "Spør manuset ditt",
    placeholder: "Still et spørsmål om historien din. Svaret bruker bare det som faktisk er skrevet — med kapitlene det er hentet fra, så du selv kan sjekke det.",
    action: "Spør",
    asking: "Spør…",
    answerHeading: "Svar",
    sourcesHeading: "Kilder",
    jumpToChapter: "Åpne «{chapter}»"
  },
  askPassage: {
    title: "Spør om dette kapittelet",
    lede: "Spør om hva som helst om kapittelets håndverk — tempo, spenning, stemme, om slutten funker. Vær så kritisk du vil, dette er bare til å lese, ingenting lagres.",
    placeholder: "F.eks. «Bygger dette mot en sterk slutt?»",
    action: "Spør",
    asking: "Spør…",
    answerHeading: "Svar"
  },
  interview: {
    action: "Intervju",
    title: "Intervju med {name}",
    titleWorld: "Spør om {name}",
    lede: "En privat samtale med {name}, bygget bare på det som til nå er låst i Story Bible. Ingenting som sies her blir kanon av seg selv — en måte å høre stemmen på og oppdage hull i det som er etablert.",
    ledeWorld: "En privat samtale om {name}, bygget bare på det som til nå er låst i Story Bible. Ingenting som sies her blir kanon av seg selv — en måte å utforske idéer på og oppdage hull i det som er etablert.",
    placeholder: "Spør {name} om noe…",
    placeholderWorld: "Spør om noe angående {name}…",
    ask: "Spør",
    asking: "Spør…",
    you: "Du",
    thinking: "{name} tenker…",
    thinkingWorld: "Tenker på {name}…",
    empty: "Ingenting spurt om ennå. Start samtalen med {name} nedenfor.",
    emptyWorld: "Ingenting spurt om ennå. Start med å utforske {name} nedenfor.",
    extractAction: "Hent ut fakta",
    extracting: "Henter ut…",
    extractAsOf: "Fra og med",
    extractAsOfHint: "Hvilket kapittel — eller, for et kapittel delt i scener, hvilken scene — denne fakta hører til i historiens egen tidsrekkefølge, ikke manuskriptets sideorden. Et Draft for hele kapittelet ser en fakta allerede fra kapittelets første side; et scene-for-scene-Draft ser den først fra og med sin egen scene. Velg punktet der det faktisk blir sant (f.eks. når to karakterer møtes for første gang, eller en avsløring midt i et kapittel), ikke bare det kapittelet du tilfeldigvis har åpent.",
    extractWholeChapter: "Hele kapittelet",
    extractSceneFallback: "Scene {index}",
    personalityLabel: "Personlighet for denne samtalen — prøv deg fram, lagre til profilen når tonen føles riktig",
    personalityPlaceholder: "Hvordan de snakker og reagerer",
    personalitySave: "Lagre til profilen"
  },
  brainstormChat: {
    title: "Tenk høyt",
    lede: "En løs samtale fram og tilbake om historien din — som å snakke med en kompis. Ingenting her er kanon, og ingenting lagres; dra selv inn de ideene du fester deg ved på tavlen.",
    placeholder: "Skriv hva du tenker på…",
    send: "Send",
    sending: "Tenker…",
    you: "Du",
    partner: "Partner",
    thinking: "Tenker…",
    empty: "Ingenting sagt ennå. Begynn å tenke høyt om en idé nedenfor.",
    addToNotes: "Legg til i notatene"
  },
  timeline: {
    nav: "Tidslinje",
    title: "Tidslinje",
    lede: "Leserekkefølgen er ikke alltid når ting skjer. Gi et kapittel en tidsnotat og flytt det for å se hvor det egentlig hører hjemme, sammenlignet med hvor det ligger i manuset.",
    readingPosition: "Manusposisjon {n}",
    storyTimeCaption: "Kronologisk posisjon",
    storyTimePlaceholder: "F.eks. «Tre år tidligere»",
    storyTimeLabel: "Fortellertid for «{chapter}»",
    outOfOrder: "Avviker fra leserekkefølgen",
    moveEarlier: "Flytt tidligere",
    moveLater: "Flytt senere"
  },
  continuity: {
    leakCount: {
      one: "{count} faktum fra senere i historien",
      other: "{count} fakta fra senere i historien"
    },
    leakHint: "Disse er allerede låst sannhet, men etablert etter dette kapitlet — modellen kan likevel se dem her. Ikke nødvendigvis et problem (kanskje er dette kapitlet et hopp fremover), men verdt en rask sjekk.",
    establishedIn: "Etablert i «{chapter}»"
  },
  placeholders: {
    count: {
      one: "{count} plassholder å komme tilbake til",
      other: "{count} plassholdere å komme tilbake til"
    },
    empty: "Plassholder",
    jumpTo: "I «{chapter}»"
  },
  darlings: {
    count: {
      one: "{count} yndling bevart",
      other: "{count} yndlinger bevart"
    },
    jumpTo: "I «{chapter}»",
    restore: "Gjenopprett",
    discard: "Kast for godt"
  },
  plotlines: {
    nav: "Tråder",
    title: "Tråder",
    lede: "Hvilke tråder som går gjennom hvilket kapittel, på et blikk. Merk et kapittel mot hver tråd det berører.",
    chapterColumn: "Kapittel",
    addPlaceholder: "Nytt trådnavn",
    addAction: "Legg til",
    removeThread: "Fjern tråden «{title}»",
    renameLabel: "Trådens navn",
    cellLabel: "{chapter} — {thread}",
    emptyPlotlines: "Ingen tråder ennå. Legg til en under for å starte matrisen.",
    emptyChapters: "Skriv et kapittel først — matrisen trenger noe å vise.",
    colorSwatchLabel: "Sett «{thread}» til fargen {color}",
    colorNames: {
      lime: "Limegrønn",
      green: "Grønn",
      cyan: "Cyan",
      blue: "Blå",
      violet: "Fiolett",
      magenta: "Magenta",
      orange: "Oransje",
      coral: "Korall",
      grey: "Grå",
      charcoal: "Mørkegrå"
    },
    editAction: "Rediger",
    editLabel: "Rediger tråden «{title}»",
    editTitle: "Rediger tråd",
    colorFieldLabel: "Farge",
    descriptionLabel: "Beskrivelse (valgfritt)",
    descriptionPlaceholder: "Vises som en tooltip over trådens navn og dens stolper",
    hideFromAiLabel: "Skjul for AI",
    hideFromAiHint: "Sendes ikke med i Skriv/Fortsett/Utdyp-prompten for kapitler merket med denne tråden. Vises fortsatt for deg mens du skriver.",
    chapterThreadsLabel: "Tråder:"
  },
  method: {
    nav: "Utviklingsmetode",
    title: "Utviklingsmetode",
    lede: "En utviklingsmetode er en ferdig serie steg for å la historien din vokse fra en gnist til en form. Den beholder aldri noe eget — hvert steg skriver bare inn i Synopsis eller Tråder, som du allerede har. Hopp over dette helt hvis du heller vil skrive fritt.",
    pickerLede: "Velg en metode for å få en veiledet vei. Du kan ombestemme deg senere — ingenting som allerede er skrevet, blir noensinne slettet.",
    useAction: "Bruk denne metoden",
    changeAction: "Bytt metode",
    noneAction: "Ingen metode — skriv fritt",
    activeBadge: "I bruk",
    beatsHeading: "Vendepunkter",
    beatsHint: "Hvert vendepunkt under ble en tråd i Tråder. Åpne Tråder for å merke hvilke kapitler som dekker hvilket vendepunkt.",
    openPlotlines: "Åpne Tråder",
    assistAction: "Foreslå en start",
    assisting: "Tenker…",
    draftPlaceholder: "Skriv din egen tekst, eller be assistenten om en start…",
    suggestionHeading: "Forslag",
    useSuggestionAction: "Bruk denne teksten",
    sendToSynopsisAction: "Send til Synopsis",
    sentToSynopsis: "Lagt til i Synopsis.",
    removeOldBeatsConfirm: {
      one: "Fjerne den {count} gjenglemte tråden fra {method} — {titles}?",
      other: "Fjerne de {count} gjenglemte trådene fra {method} — {titles}?"
    },
    methods: {
      snowflake: {
        name: "Snowflake Method",
        description:
          "Start med én setning og la historien vokse utover i noen stadig bredere runder. En forenklet, tre-stegs variant av Randy Ingermansons metode.",
        steps: {
          logline: {
            label: "Én setning",
            prompt: "Oppsummer hele historien i én setning — karakteren, hva hen vil ha, og hva som står i veien."
          },
          paragraph: {
            label: "Ett avsnitt",
            prompt: "La setningen vokse til et kort avsnitt: opptakten, konflikten som utvikler den, vendepunktet underveis, og hvordan det ender."
          },
          synopsis: {
            label: "Full synopsis",
            prompt: "La avsnittet vokse til en full synopsis — hele bokens form, scene for scene der det hjelper."
          }
        }
      },
      "three-act": {
        name: "Three-Act Structure",
        description: "Den klassiske formen opptakt / konfrontasjon / oppløsning, som sju gjenkjennelige vendepunkter.",
        steps: {
          setup: { label: "Opptakt", hint: "Hverdagsverdenen, før historien forstyrrer den." },
          inciting: { label: "Utløsende hendelse", hint: "Hendelsen som setter historien i bevegelse." },
          "break-two": { label: "Steget inn i andre akt", hint: "Karakteren bestemmer seg — det er ingen vei tilbake til hverdagsverdenen." },
          midpoint: { label: "Midtpunkt", hint: "En falsk seier eller falskt nederlag som øker innsatsen." },
          "all-is-lost": { label: "Alt er tapt", hint: "Lavpunktet — det ser ut som karakteren ikke kan vinne." },
          climax: { label: "Klimaks", hint: "Den endelige konfrontasjonen hele historien har bygget mot." },
          resolution: { label: "Oppløsning", hint: "Den nye hverdagsverdenen, etter historiens forandring." }
        }
      },
      "save-the-cat": {
        name: "Save the Cat",
        description: "Blake Snyders 15 vendepunkter — en detaljert, prosentbasert struktur som er populær i sjangerlitteratur og film.",
        steps: {
          "opening-image": { label: "Åpningsbilde", hint: "Et glimt av karakterens verden før historien." },
          "theme-stated": { label: "Temaet sies", hint: "Noen sier, nesten i forbifarten, hva historien egentlig handler om." },
          "set-up": { label: "Opptakt", hint: "Verdenen, persongalleriet, og hva som mangler i karakterens liv." },
          catalyst: { label: "Katalysator", hint: "Hendelsen som setter historien i bevegelse." },
          debate: { label: "Nøling", hint: "Karakteren nøler — kan hen virkelig gjøre dette?" },
          "break-two": { label: "Steget inn i andre akt", hint: "Karakteren velger å handle og forlater den gamle verdenen." },
          "b-story": { label: "B-historien", hint: "En ny tråd begynner — ofte en relasjon som bærer temaet." },
          "fun-and-games": { label: "Løftet innfris", hint: "Grunnideen leverer det den lovet — de klassiske scenene." },
          midpoint: { label: "Midtpunkt", hint: "En falsk seier eller falskt nederlag; innsatsen økes, klokken begynner å tikke." },
          "bad-guys-close-in": { label: "Motstanden presser på", hint: "Både ytre og indre press hardner." },
          "all-is-lost": { label: "Alt er tapt", hint: "Lavpunktet — ofte markert av et tap eller en død." },
          "dark-night": { label: "Sjelens mørke natt", hint: "Karakteren sitter igjen i tapet før hen finner en vei videre." },
          "break-three": { label: "Steget inn i tredje akt", hint: "Karakteren finner løsningen, ofte fra B-historiens lærdom." },
          finale: { label: "Finale", hint: "Karakteren handler på lærdommen og løser historiens problem." },
          "final-image": { label: "Sluttbilde", hint: "Et bilde som speiler åpningsbildet og viser hvor mye som har forandret seg." }
        }
      },
      "hero-journey": {
        name: "Hero's Journey",
        description: "Campbells og Voglers mytiske struktur — tolv steg for en karakter som forlater den kjente verdenen og vender tilbake forandret.",
        steps: {
          "ordinary-world": { label: "Hverdagsverdenen", hint: "Livet før eventyret." },
          call: { label: "Kallet", hint: "Noe forstyrrer hverdagsverdenen." },
          refusal: { label: "Å avvise kallet", hint: "Frykt eller nøling holder karakteren tilbake." },
          mentor: { label: "Å møte mentoren", hint: "Noen gir karakteren det hen trenger for å gå videre." },
          threshold: { label: "Å krysse terskelen", hint: "Karakteren bestemmer seg og forlater hverdagsverdenen." },
          tests: { label: "Prøvelser, allierte, fiender", hint: "Den nye verdenens regler, venner og rivaler læres." },
          approach: { label: "Tilnærming til den indre hulen", hint: "Forberedelser til den sentrale prøvelsen." },
          ordeal: { label: "Den store prøvelsen", hint: "Den sentrale krisen — en berøring med døden, bokstavelig eller ikke." },
          reward: { label: "Belønningen", hint: "Karakteren tar det hen kom for." },
          "road-back": { label: "Veien tilbake", hint: "Å bestemme seg for å fullføre reisen og vende tilbake." },
          resurrection: { label: "Gjenoppstandelsen", hint: "En siste, mer avgjørende prøve som beviser at forandringen er ekte." },
          return: { label: "Hjemkomsten med eliksiren", hint: "Karakteren kommer hjem forandret, med noe å gi tilbake." }
        }
      }
    }
  },
  guide: {
    nav: "Guide",
    title: "Guide",
    intro: "En kort gjennomgang — hvordan du får appen til å snakke med en modell, og hva alt gjør når den først gjør det.",
    openFromHome: "Ny her? Les hurtigstarten",
    closeAction: "Lukk",
    fromErrorLink: "Se hurtigstartguiden",
    helpFor: "Guide: {topic}",
    connectAiButton: "Koble til en lokal AI",
    quickstartHeading: "Kom i gang med en lokal AI",
    quickstartCards: [
      {
        heading: "Installer en lokal AI-server",
        body: "Har du ikke allerede en installert, anbefaler vi Ollama — gratis, fra ollama.com. Foretrekker du noe annet? LM Studio eller en annen lokal server fungerer også."
      },
      {
        heading: "Velg din AI-modell",
        body: "AI-modellen er det som faktisk skriver og resonnerer med deg. Vi anbefaler en modell trent for skjønnlitterær prosa, for eksempel fluffy/l3-8b-stheno-v3.2 (søk etter «stheno» i Ollama). Ellers fungerer enhver vanlig chat-modell — for eksempel llama3 eller mistral."
      },
      {
        heading: "Koble den til StoryBook AI",
        body: "Kjører du Ollama? Ingenting å stille inn — StoryBook AI finner den automatisk. Kjører du LM Studio eller en annen server i stedet? Åpne Innstillinger → Modeller, velg den under Motor, og lim inn serveradressen den viser deg."
      }
    ],
    categories: {
      "getting-started": "Introduksjon",
      "basic-writing": "Grunnleggende skriving",
      "the-writer": "Skriveverktøyet",
      images: "Bilder",
      "focused-workflow": "Fokusert arbeidsflyt",
      "advanced-tools": "Avanserte skriveverktøy",
      "world-bible": "Story Bible",
      "polish-publish": "Puss & publiser",
      troubleshooting: "Feilsøking"
    },
    sections: {
      privacy: {
        heading: "Et helt lukket digitalt pengeskap",
        body: "StoryBook AI er bygget rundt én regel: manuset ditt er din eiendom, og det skal aldri forlate datamaskinen din. Det finnes ingen vei ut til internett i selve appen — ingen API-nøkler til ChatGPT, Claude eller andre skytjenester (det er ikke en manglende funksjon, men et bevisst valg), og skriftene følger med i appen i stedet for å hentes utenfra. Teksten din lever bare lokalt i nettleseren, og AI-modellen kjører bare på din egen prosessor. Den frittstående skrivebordsappen (valgfri) kan sjekke om det finnes en nyere versjon av seg selv — aldri av manuset ditt, som den ikke engang har tilgang til. Uansett hva du skriver — dagbok, forretningshemmeligheter eller det neste store fantasy-eposet — blir hver bokstav hos deg."
      },
      author: {
        heading: "Forfatteren vinner alltid over AI-en",
        body: "Modellen foreslår, du bestemmer. En detalj modellen finner på i prosaen forblir et forslag — vist med en lett stiplet understrek — til du låser den i Story Bible. Ingenting blir kanon av seg selv."
      },
      chapters: {
        heading: "Kapitler: Lag utkast, Omskriv, Analyser",
        body: "Lag utkast skriver ny prosa ut fra det som allerede er etablert. Omskriv skriver om samme kapittel i et annet perspektiv eller tempus, med samme hendelser. Analyser gjennomgår et kapittel for vanlige skriveproblemer uten å skrive om en eneste linje — for eksempel å \"fortelle\" i stedet for å vise (i stedet for \"Lisa var rasende\" foreslår den kanskje \"Lisa smalt igjen døren så kaffekoppene skalv\"), fyll-dialog, eller et trekk som kolliderer med et låst karaktertrekk. Leser (i Innstillinger, og per kapittel) angir hvem teksten skrives for — Pekebok til Voksen — slik at setningslengde og ordvalg passer den alderen. Under teksten veksler Sjeldne ord og Klisjeer mellom to valgfrie markeringer — uvanlige ord for den leseren, og formuleringer som høres AI-skrevne ut (\"et bevis på\", overbrukte tankestreker) — én om gangen, avslått som standard."
      },
      "editor-tools": {
        heading: "Høyreklikkmenyen",
        body: "Merk et avsnitt og høyreklikk for Forleng (fortsetter der merkingen slutter), Utdyp (utvider selve avsnittet), Skriv om… (din egen instruks, f.eks. «gjør henne sintere»), Illustrasjonsprompt… (se Images) og Manuell redigering (skriv om bare det markerte avsnittet selv, for hånd — resten av kapittelet blir liggende). Høyreklikker du i stedet uten å merke noe, får du ett eneste valg, Skriv en beat…: beskriv i én linje hva som skjer videre, så skriver modellen bare den beaten — et kort avsnitt, ikke resten av scenen — og setter den inn akkurat der markøren står. Merker du et avsnitt dukker det også opp en liten Fet/Kursiv/Understreket-verktøylinje over det (eller Ctrl+B/I/U) — bare visuell formatering, lagret atskilt fra selve teksten, så den når aldri modellen."
      },
      "add-picture": {
        heading: "Et bilde til kapittelet",
        body: "Legg til et eget bilde — JPEG, PNG eller WebP — øverst i et kapittel. Det er dekorativt, ikke AI-generert: velg en fil fra datamaskinen din, så vises det over kapittelets første linjer, og følger med når du publiserer til HTML, ePub eller PDF."
      },
      "illustration-prompts": {
        heading: "Illustrasjonsprompter",
        body: "Merk et avsnitt og velg Illustrasjonsprompt… i høyreklikkmenyen. Modellen skriver en bildegenereringsprompt — ikke et bilde — bygget på avsnittet, dine låste Story Bible-fakta og manusets illustrasjonsstil, klar til å limes inn i det bildeverktøyet du bruker; StoryBook AI forblir helt lokalt og genererer aldri selve bildet. Sett en standardstil under Innstillinger → Illustrasjonsstil, eller åpne stilbiblioteket for å lagre navngitte, gjenbrukbare stiler — hver med egne sjangertagger og et eksempelbilde — slik at hver prompt holder samme utseende gjennom hele boken."
      },
      "brainstorm-synopsis": {
        heading: "Idémyldring & Synopsis",
        body: "Idémyldring er din private oppslagstavle — kladdepapir eller en tavle med post-it-lapper, ett notat per idé, dragbart, ingen rekkefølge kreves. Lag utkast lener seg aldri på et notat du ikke har løftet over til Synopsis. (Spør du modellen om notatene dine, eller ber den forlenge eller utdype et av dem, leser den selvsagt det du spør om — men ingenting derfra blir kanon eller lekker inn i kapittelskrivingen av seg selv.) Løft ideene som holder mål over til Synopsis: formen på hele boken, i noen setninger. Det er dette AI-modellen lener seg på når den senere hjelper deg å skrive kapitler."
      },
      method: {
        heading: "Utviklingsmetode",
        body: "En valgfri, ferdig serie steg for å la en gnist vokse til en form — Snowflake, Three-Act Structure, Save the Cat eller Hero's Journey. Den beholder aldri noe eget: en vendepunktbasert metodes vendepunkter blir tråder i Tråder, og Snowflakes steg skriver rett inn i Synopsis, akkurat som enhver annen notat du sender dit. Å bytte metode, eller velge ingen, sletter aldri noe som allerede finnes i noen av dem."
      },
      plotlines: {
        heading: "Tråder (Plotlines)",
        body: "Hold styr på hvilken tråd som går gjennom hvilket kapittel i en tabell, så en tråd som har vært stille i ti kapitler er lett å oppdage."
      },
      scenes: {
        heading: "Scener",
        body: "Et langt kapittel kan deles opp i scener — velg hvor en slutter og neste begynner, gi den navn, legg til et kort notat. Når et kapittel har scener, kan Lag utkast, Omskriv og Analyser hver for seg rettes mot bare én av dem."
      },
      timeline: {
        heading: "Tidslinje",
        body: "Leserekkefølge og historiens egen tidsrekkefølge er ikke alltid det samme. Gi et kapittel et tidsnotat, og se hvordan boken faller når den sorteres etter når ting faktisk skjer, ved siden av hvor det ligger i manuskriptet."
      },
      "story-bible": {
        heading: "Story Bible",
        body: "Den ene sannhetskilden for historiens fakta — hvem noen er, hvor et sted ligger, hva et navn betyr. Et faktum starter som et forslag, fra deg eller fra en ekstraksjon, og blir bare låst sannhet når du godkjenner det. Låste fakta er det modellen får vite at den ikke får motsi — motsier et nytt forslag et allerede låst faktum (for eksempel at noen plutselig har brune øyne når du har låst blå), blir det flagget ekstra tydelig i gjennomgangskøen. Åpne et kort og trykk Intervju for å chatte om det — i en karakters egen stemme, eller for et sted, en gjenstand, en gruppe eller et konsept, med en verdensbygger-kollega som drøfter det i tredje person — bygget bare på det som til nå er låst. En måte å høre en stemme på eller utforske lore og oppdage hull, ikke skape ny kanon. Sies det noe verdt å ta vare på, trykk Hent ut fakta for å foreslå det til Story Bible — samme gjennomgangskø som all annen ekstraksjon, ingenting legges til før du godkjenner. Ctrl-klikk (Cmd-klikk på Mac) på et navn du kjenner igjen hvor som helst i teksten for å hoppe rett til kortet — et vanlig klikk plasserer bare markøren der, som vanlig."
      },
      continuity: {
        heading: "Kontinuitetsvarsler",
        body: "Når et kapittel kan se et faktum som først ble etablert senere i manuskriptet, blir det flagget — ikke nødvendigvis feil, kanskje er det et tilbakeblikk, bare verdt en rask sjekk. Korrekturlesing går lenger: den sjekker en persons eller en gjenstands registrerte sted gjennom hele historien, i historiens egen tidsrekkefølge, og flagger en forflytning som ser umulig eller uforklart ut gitt hvor mye tid som har gått."
      },
      proofread: {
        heading: "Korrekturlesing",
        body: "En siste gjennomgang av hele manuskriptet: grammatikk, gjentatte scener, stil- og stemningsdrift mellom kapitler, alderstilpasning, en kontinuitetssjekk, et søk etter plantede detaljer som aldri innfris (en pistol som vises i kapittel 4, men som ingen noensinne avfyrer), og en faktasjekk mot hele boken. Når Leser er satt til et barne- eller ungdomsnivå, flagger den også banning, vold eller eksplisitt innhold som ikke passer den alderen. Bare notater — ingenting skrives om for deg. Den pauser og gjenopptar, og sjekker bare på nytt det som faktisk har endret seg."
      },
      "ask-manuscript": {
        heading: "Spør manuskriptet",
        body: "Still et spørsmål om din egen historie og få et svar bygget bare på det som faktisk er skrevet — med kapitlene det kom fra, så du kan sjekke det selv."
      },
      publish: {
        heading: "Publiser",
        body: "Eksporter en ren lesekopi — Markdown, RTF, ODT, HTML, ePub eller PDF. Idémyldring forlater aldri boken; bare selve manuskriptet gjør det."
      }
    },
    faqHeading: "Feilsøking",
    faq: [
      {
        heading: "«Ingen lokal modell funnet»",
        body: "StoryBook AI når ikke den lokale serveren din. Kjører du Ollama? Sørg for at den kjører. Kjører du LM Studio eller en annen server? Sjekk Innstillinger → Modeller — motoren og serveradressen må stemme med det som faktisk kjører på datamaskinen din."
      },
      {
        heading: "Hvor lagres boken min?",
        body: "På din egen datamaskin, i nettleserens lokale lagring — ingenting lastes opp noe sted. Bruk Sikkerhetskopi innimellom for å lagre en kopi du kan gjenopprette fra, i tilfelle du sletter nettleserdataene dine."
      },
      {
        heading: "Kan jeg kjøre appen på en annen datamaskin eller mobil i hjemmenettverket mitt?",
        body: "Ja, men det er to separate ting. For å nå selve appen fra en annen enhet, start den med \"npm run dev -- --host\" og bruk nettverksadressen terminalen viser (f.eks. http://192.168.1.23:5175) i stedet for localhost. For at den enheten også skal kunne snakke med den lokale AI-modellen din, må modellserveren (f.eks. Ollama) selv tillate det: la den lytte bredt (OLLAMA_HOST=0.0.0.0), tillat adressen (OLLAMA_ORIGINS), og pek appens modellinnstilling mot datamaskinens nettverksadresse i stedet for localhost. Husk at hver enhet likevel har sitt eget bibliotek — manuskripter deles ikke automatisk mellom dem, du må flytte en bok mellom enheter via Sikkerhetskopi/Gjenopprett."
      },
      {
        heading: "Kan jeg bruke en betalt AI-tjeneste i stedet?",
        body: "Nei — med vilje. StoryBook AI snakker bare noensinne med en modell som kjører på din egen datamaskin eller nettverk. Det er ikke en manglende funksjon; det er hele poenget: manuskriptet ditt trenger aldri å forlate maskinen din."
      }
    ]
  },
  handbook: {
    title: "Guide",
    intro:
      "StoryBook AI inneholder mange verktøy, men du trenger ikke lære deg alt før du begynner.\nDu kan skrive en hel bok bare ved å opprette kapitler og skrive i editoren. De andre verktøyene finnes der når du trenger hjelp med idéer, struktur, karakterer, kontinuitet, redigering eller publisering.\n\nBegynn enkelt. Legg til struktur når historien trenger det.",
    categories: {
      "getting-started": "Kom i gang",
      "how-you-work": "Slik kan du jobbe",
      plan: "Planlegg historien",
      "story-bible-world": "Story Bible & verdenen",
      writing: "Skrive",
      revise: "Bearbeide manuset",
      "images-publish-backup": "Bilder, publisering & sikkerhetskopi",
      help: "Hjelp & feilsøking"
    },
    sections: {
      "connect-local-ai": {
        heading: "Koble til en lokal AI",
        body: "StoryBook AI jobber med en lokal AI-modell.\nDet betyr at AI-funksjonene bruker modellen du selv har koblet til StoryBook AI.\nFor å bruke funksjoner som utkast, omskriving, analyse og intervjuer trenger du derfor først en fungerende lokal AI-tilkobling.\n\nFølg hurtigstarten for å:\n1. Installere en lokal AI-løsning.\n2. Velge en modell.\n3. Koble den til StoryBook AI.\n\nNår tilkoblingen fungerer kan du begynne å skrive."
      },
      "first-book": {
        heading: "Opprett din første bok",
        body: "Opprett et nytt manus og gi det et navn.\nDu trenger ikke opprette en Synopsis, Story Bible eller en detaljert plan før du begynner.\n\nDu kan gå rett til:\nKapitler → Kapittel 1 → Begynn å skrive\n\nSkriv selv i editoren akkurat som i et vanlig skriveprogram.\nVil du ha hjelp kan du bruke AI-verktøyene."
      },
      "first-chapter": {
        heading: "Ditt første kapittel",
        body: "Et kapittel består i bunn og grunn av to ting:\n\nKapittelbrief\nHva kapittelet skal oppnå.\n\nManus\nTeksten leseren faktisk kommer til å lese.\n\nEn brief kan for eksempel være:\n”Erik ankommer den gamle jernbanestasjonen. Der møter han en kvinne som virker å kjenne faren hans. Hun nekter å forklare hvordan, og legger igjen et gammelt fotografi på bordet.”\n\nSelve kapittelet er så historien som vokser frem fra dette.\nDu kan skrive kapittelet selv eller bruke Skriv utkast for å få et første utkast å jobbe videre med."
      },
      "map-of-storybook-ai": {
        heading: "Et kart over StoryBook AI",
        body: "UTFORSK\n💡 Brainstorm · 💬 Intervju verdenen\nHer får idéer være usikre.\n↓\nPLANLEGG\n📖 Synopsis · 🗂 Kapittelbriefer · 🎬 Scener · 🧵 Tråder · 🕒 Tidslinje\nHer former du historien.\n↓\nETABLER\n📚 Story Bible · 🔎 Trekk ut fakta · ✓ Gjennomgå · 🔒 Lås\nHer bestemmer du hva som skal regnes som etablert.\n↓\nSKRIV\n✍️ Kapitler — Skriv utkast · Skriv en beat · Forleng · Utdyp · Skriv om\n↓\nGJENNOMGÅ\n🔎 Analyser · 💬 Spør manuset · 🗨 Spør om en passasje · ✓ Kontinuitet · ✓ Korrekturles\n↓\nFERDIGSTILL\n🖼 Bilder · 📤 Publiser · 💾 Sikkerhetskopier\n\nDet er et kart.\nIkke en obligatorisk rekkefølge."
      },
      "no-required-workflow": {
        heading: "Du trenger ikke bruke alt",
        body: "StoryBook AI kan brukes på mange ulike måter.\nDet finnes ingen obligatorisk arbeidsflyt.\n\nDu kan for eksempel jobbe slik:\n\nJeg vil bare begynne å skrive\nKapittel → Skriv → Neste kapittel. Planlegg først når du trenger det.\n\nJeg vil planlegge historien\nBrainstorm → Synopsis → Kapittelbriefer → Kapitler\n\nJeg vil jobbe svært strukturert\nSynopsis → Fortellermetode → Tråder → Kapittelbriefer → Scener → Tidslinje → Kapitler\n\nJeg har allerede et manus\nLegg inn eksisterende tekst → Analyser → Story Bible → Bearbeid → Publiser\n\nJeg kommer fra et annet skriveverktøy\nTa med manus og lore → Importer → Gjennomgå → Fortsett å skrive\n\nDu velger selv hvor mye struktur du trenger."
      },
      "three-workflows": {
        heading: "Tre komplette arbeidsflyter",
        body: "Jeg skriver intuitivt\nNytt manus → Kapittel 1 → Skriv → Kapittel 2 → Skriv\nNår historien vokser: Trekk ut fakta → Story Bible\nSenere: Analyser → Korrekturles → Publiser\nDu trenger aldri lage en detaljert plan.\n\nJeg vil planlegge først\nBrainstorm → Synopsis → Kapittelbriefer → Skriv kapitler → Story Bible → Analyser → Korrekturles → Publiser\nDet gir struktur uten å kreve en dramaturgisk modell.\n\nJeg vil planlegge mye\nBrainstorm → Snowflake → Synopsis → Tre akter / Save the Cat / Heltens reise → Tråder → Kapittelbriefer → Scener → Tidslinje → Skriv → Story Bible + kontinuitet → Analyser → Korrekturles → Publiser\nDet er en mer strukturert måte å jobbe på.\nDet er ikke mer riktig enn de andre."
      },
      "which-tool-do-i-need": {
        heading: "Hvilket verktøy trenger jeg?",
        body: "”Jeg vet ikke hva historien handler om.” → Brainstorm\n”Jeg har en idé men får den ikke til en hel historie.” → Snowflake\n”Jeg har mange idéer men ingen helhet.” → Synopsis\n”Jeg trenger en enkel dramatisk struktur.” → Tre akter\n”Jeg vil jobbe med flere tydelige beats.” → Save the Cat\n”Historien handler om hovedpersonens forandringsreise.” → Heltens reise\n”Jeg vet ikke helt hvem karakteren min er ennå.” → Intervju verdenen\n”Jeg vil prøve idéer om karakteren uten å påvirke boken.” → Intervju verdenen\n”Jeg trenger å huske hva som faktisk gjelder.” → Story Bible\n”Jeg mister oversikten over hva kapittelet skal gjøre.” → Kapittelbrief\n”Kapittelet har blitt for komplisert.” → Scener\n”Jeg mister oversikten over ulike handlinger og relasjoner.” → Tråder\n”Jeg mister oversikten over når ting skjer.” → Tidslinje\n”Jeg har satt meg fast midt i en scene.” → Skriv en beat, Forleng eller Utdyp\n”Jeg vet ikke om kapittelet fungerer.” → Analyser\n”Jeg vil ha ærlig, kritisk tilbakemelding på et konkret spørsmål.” → Spør om kapittelet / Spør om en passasje\n”Jeg finner ikke tilbake til noe i det lange manuset mitt.” → Spør manuset\n”Historien er ferdig og jeg vil pusse på teksten.” → Korrekturles\n”Jeg vil gi noen boken å lese.” → Publiser"
      },
      "most-important-principle": {
        heading: "Det viktigste prinsippet",
        body: "StoryBook AI inneholder mange funksjoner fordi ulike forfattere jobber på ulike måter.\nDet betyr ikke at alle funksjonene må brukes.\n\nBegynn med historien.\nNår du støter på et problem, velg verktøyet som hjelper med akkurat det problemet.\n\nUtforsk når du trenger idéer.\nPlanlegg når du trenger retning.\nLås fakta når noe skal bli etablert.\nSkriv når du vet nok til å fortsette.\nGjennomgå når du vil forstå hva du har skrevet.\n\nOg fremfor alt:\nVerktøyene skal tilpasse seg måten du skriver på — ikke omvendt."
      },
      "brainstorm-free": {
        heading: "Brainstorm – tenk fritt",
        body: "Brainstorm er din private kladdeblokk.\nHer trenger ingenting være bestemt.\n\nSkriv for eksempel:\n”Tenk om kvinnen på toget egentlig kjenner Eriks far?”\neller:\n”Kanskje fyrtårnet ikke er forlatt?”\neller:\n”Ville historien fungere bedre om broren fortsatt lever?”\n\nÉn lapp per idé.\nFlytt dem rundt og eksperimenter.\n\nBrainstorm påvirker ikke automatisk historien\nDette er viktig. En idé i Brainstorm blir ikke automatisk en del av historien og skal ikke begynne å styre vanlige kapitelutkast.\nNår du bestemmer at en idé skal gå videre, drar du den til Send til synopsis.\nDu bestemmer altså hvilke idéer som forlater kladdebordet."
      },
      "synopsis-short": {
        heading: "Synopsis – historien i kortform",
        body: "Synopsis beskriver historien som helhet. Her samler du:\n• hvem som er viktige\n• hva som skjer\n• hvilke større konflikter som finnes\n• hvor historien er på vei\n\nEksempel\nBrainstorm: ”Tenk om kvinnen på toget kjenner Eriks far?”\nNår du bestemmer deg for å bruke idéen kan den utvikles til:\n”Under reisen møter Erik en kvinne som viser seg å kjenne til omstendighetene rundt farens forsvinning.”\nDet hører hjemme i Synopsis.\n\nTenk:\nBrainstorm = kanskje\nSynopsis = historiens plan\nKapittelbrief = kapittelets oppgave\nManus = selve historien"
      },
      "chapter-briefs": {
        heading: "Kapittelbriefer",
        body: "En kapittelbrief beskriver hva et kapittel skal oppnå.\nDen trenger ikke være velskrevet.\nDen er en instruksjon til deg selv og til AI når du bruker skrivehjelpen.\n\nEksempel\n”Erik møter kvinnen i spisevognen. Hun antyder at hun kjente faren hans, men nekter å si hvordan. Kapittelet slutter med at hun legger igjen et fotografi på bordet.”\n\nBriefen er ikke selve historien.\nDen beskriver hva historien skal gjøre.\n\nSynopsis = hele historien\nBrief = ett kapittel\nManus = det leseren får"
      },
      "development-methods": {
        heading: "Fortellermetoder",
        body: "StoryBook AI inneholder flere metoder som kan hjelpe deg å utvikle eller strukturere historien.\nDe er helt frivillige.\nDu kan alltid velge:\nIngen metode – skriv fritt"
      },
      "snowflake-method": {
        heading: "Snowflake",
        body: "Snowflake passer når du har en idé men ennå ikke en hel historie.\nDen hjelper deg å utvikle innholdet steg for steg.\n\nÉn setning\n”En journalist vender tilbake til hjemøya for å undersøke farens tjue år gamle forsvinning.”\n↓\nEtt avsnitt\nUtvikle grunnidéen med konflikt, utvikling og retning.\n↓\nFull synopsis\nBygg videre til du har en sammenhengende beskrivelse av historien.\n↓\nSend til Synopsis\n\nDu kan skrive selv eller bruke AI som støtte underveis.\n\nSnowflake hjelper først og fremst med å svare på:\n”Hva er dette egentlig for en historie jeg holder på å skrive?”"
      },
      "three-act": {
        heading: "Tre akter",
        body: "Tre akter passer når du vil ha en enkel dramatisk ryggrad.\nStoryBook AI bruker sentrale vendepunkter som:\n• Opptakt\n• Utløsende hendelse\n• Steget inn i andre akt\n• Midtpunkt\n• Alt er tapt\n• Klimaks\n• Oppløsning\n\nDisse blir Tråder du kan koble til historiens kapitler.\n\nEksempel\nUtløsende hendelse: ”Nora finner et brev fra sin forsvunne far.” (Kapittel 3)\nSenere — Midtpunkt: ”Nora oppdager at brevet ble skrevet etter datoen faren skal ha forsvunnet.” (Kapittel 12)\n\nMetoden hjelper deg å se historiens større bevegelse.\nDen skriver ikke historien for deg."
      },
      "save-the-cat": {
        heading: "Save the Cat",
        body: "Save the Cat gir flere holdepunkter enn Tre akter, blant annet:\n• Åpningsbilde\n• Temaet uttales\n• Opptakt\n• Katalysator\n• Nøling\n• Steget inn i andre akt\n• B-historien\n• Løftet innfris\n• Midtpunkt\n• Motstanden presser på\n• Alt er tapt\n• Sjelens mørke natt\n• Steget inn i tredje akt\n• Finale\n• Sluttbilde\n\nDisse opprettes som Tråder.\nDu bestemmer selv hvordan – og om – de passer historien din.\n\nEventuelle prosentangivelser er retningslinjer, ikke regler for nøyaktig hvor noe må skje.\nBruk metoden som et kart, ikke en fasit."
      },
      "heros-journey": {
        heading: "Heltens reise",
        body: "Heltens reise passer historier der hovedpersonens forandring står i sentrum.\nStoryBook AI bruker tolv steg:\n1. Hverdagsverdenen\n2. Kallet\n3. Å avvise kallet\n4. Å møte mentoren\n5. Å krysse terskelen\n6. Prøvelser, allierte og fiender\n7. Nærmer seg den innerste hulen\n8. Den store prøvelsen\n9. Belønningen\n10. Veien tilbake\n11. Gjenoppstandelsen\n12. Hjemkomsten med eliksiren\n\nOgså disse opprettes som Tråder.\n\n”Reisen” trenger ikke være bokstavelig. En karakter kan forlate sin trygge verden ved å flytte, starte et forhold, miste jobben, oppdage en hemmelighet eller ta en beslutning som forandrer livet."
      },
      "method-differences": {
        heading: "Forskjellen mellom metodene",
        body: "Snowflake\nIdé → Én setning → Ett avsnitt → Full synopsis → Synopsis\nSnowflake utvikler historiens innhold.\n\nTre akter / Save the Cat / Heltens reise\nMetode → Beats og vendepunkter → Tråder → Kapitler\nDisse hjelper deg å strukturere historiens utvikling.\n\nDu kan bytte metode senere. Det du allerede har skrevet i Synopsis eller opprettet som Tråder, slettes ikke bare fordi du velger en annen metode eller går tilbake til å skrive fritt."
      },
      scenes: {
        heading: "Scener",
        body: "Når et kapittel blir langt eller komplisert kan det være lettere å dele det opp i Scener.\n\nKapittel 8 – Fyrtårnet\nScene 1: Nora ankommer øya.\nScene 2: Hun bryter seg inn i fyrtårnet.\nScene 3: Hun finner fotografiene.\nScene 4: Noen låser døren utenfra.\n\nTenk:\nBrief = kapittelets oppdrag\nScener = veien gjennom kapittelet\n\nDu trenger ikke bruke Scener for enkle kapitler der du allerede har oversikten."
      },
      plotlines: {
        heading: "Tråder",
        body: "Tråder hjelper deg å følge det som utvikler seg gjennom historien. Det kan være:\n• hovedkonflikten\n• et forhold\n• et mysterium\n• en hemmelighet\n• en rivalisering\n• en karakterforandring\n• dramaturgiske beats\n\nEksempel\n🔴 Farens forsvinning\n🟡 Nora og Elias\n🔵 Fyrtårnets historie\n\nDu kan se hvordan disse forekommer gjennom kapitlene. Hvis en viktig sidehandling plutselig forsvinner i ti kapitler, blir det lettere å oppdage."
      },
      timeline: {
        heading: "Tidslinje",
        body: "Tidslinje svarer på spørsmålet: Når skjer dette?\nDen blir spesielt nyttig når kapittelrekkefølgen ikke er det samme som historiens kronologi.\n\nKapittelrekkefølge\nKapittel 1 – 2026: Nora vender tilbake.\nKapittel 2 – 2006: Faren forsvinner.\nKapittel 3 – 2026: Nora finner brevet.\nKapittel 4 – 1998: Faren møter Elias.\n\nKronologisk rekkefølge\n1998 → 2006 → 2026\n\nTidslinje hjelper deg å holde styr på forskjellen."
      },
      "scenes-plotlines-timeline": {
        heading: "Scener, Tråder og Tidslinje",
        body: "De svarer på tre ulike spørsmål.\n\nScener: Hva skjer?\nTråder: Hva utvikler seg?\nTidslinje: Når skjer det?\n\nDen samme hendelsen kan derfor finnes i alle tre uten at verktøyene gjør samme jobb."
      },
      "story-bible-memory": {
        heading: "Story Bible – historiens hukommelse",
        body: "Story Bible samler informasjon historien trenger å huske. Det kan være:\n• personer\n• steder\n• relasjoner\n• grupper\n• gjenstander\n• hendelser\n• regler og begreper i verdenen\n\nAnta at manuset sier:\n”Nora gikk opp trappen til fyrtårnet. Hun hadde ikke vært der siden faren forsvant for tjue år siden.”\n\nStoryBook AI kan identifisere mulige fakta. Eksempel:\n”Nora har en far.”\n”Noras far forsvant for tjue år siden.”\n”Nora har vært ved fyrtårnet tidligere.”\n\nDu gjennomgår forslagene. Først når du bestemmer at noe skal låses, blir det etablert informasjon StoryBook AI kan forholde seg til."
      },
      "what-is-canon": {
        heading: "Hva betyr kanon?",
        body: "Kanon er det du har bestemt skal regnes som sant i historien.\nIkke all tekst trenger å bli kanon.\n\nHvis AI skriver:\n”Nora dro det røde skjerfet tettere rundt halsen.”\ntrenger du ikke lagre fargen på skjerfet bare fordi den tilfeldigvis dukket opp i teksten.\n\nMen hvis skjerfet senere blir viktig, kan informasjonen være verdt å låse.\n\nStory Bible skal huske det som trenger å være konsekvent. Den trenger ikke bli en database over hver detalj i hver setning."
      },
      "interview-world": {
        heading: "Intervju verdenen",
        body: "Story Bible trenger ikke bare brukes til å lagre det du allerede vet. Du kan også bruke Intervju verdenen for å oppdage mer.\n\nI stedet for å fylle ut lange skjemaer kan du utforske en karakter gjennom samtale.\n\nAnta at du vet:\n”Nora Berg. 38 år. Journalist. Vokste opp på øya. Faren forsvant da hun var atten.”\n\nSpør for eksempel:\n”Hvorfor ble du journalist?”\n”Hva husker du fra dagen faren din forsvant?”\n”Hvem stoler du minst på?”\n”Hva ville du aldri innrømme for Elias?”\n”Hva er du mest redd for å oppdage?”\n\nIntervjuet kan hjelpe deg å finne personlighet, motiv, bakgrunn, relasjoner og konflikter."
      },
      "interview-sandbox": {
        heading: "Intervjuet er en sandkasse",
        body: "Dette er svært viktig: det som sies under intervjuet påvirker ikke hvordan boken skrives. AI får dikte opp og eksperimentere under samtalen.\n\nAnta at Nora sier:\n”Faren min pleide å ta meg med til fyrtårnet da jeg var liten.”\nDet betyr ikke at StoryBook AI heretter kan bruke dette som etablert informasjon når et kapittel skrives.\nDu må først velge å gjøre informasjonen til et faktum.\n\nArbeidsflyten er:\nIntervju → AI sier noe interessant → Trekk ut fakta → Gjennomgå → Lås fakta → Story Bible → Nå kan informasjonen påvirke fremtidig AI-skriving\n\nTenk:\nIntervju ≠ kanon\nLåste fakta = kanon\n\nDet gjør at du kan stille ville spørsmål og prøve idéer uten å risikere at de begynner å påvirke historien."
      },
      "interview-to-story": {
        heading: "Fra intervju til historie",
        body: "Under intervjuet sier Nora kanskje:\n”Moren min løy alltid om hva som skjedde med pappa. Jeg lærte tidlig at voksne forteller den versjonen av sannheten som passer dem.”\n\nDu synes idéen er interessant. Etter intervjuet kan StoryBook AI hjelpe deg å identifisere mulige fakta:\n”Noras mor holdt tilbake informasjon om farens forsvinning.”\n\nNå velger du.\nLås faktumet — da blir informasjonen en etablert del av Story Bible.\nIkke lås det — da forblir det bare noe som ble utforsket under intervjuet, og skal ikke behandles som etablert informasjon når boken skrives.\n\nNår et faktum først blir sant senere i kapittelet\nEn viktig detalj: et faktum som låses til et kapittel gjelder fra kapittelets første side. Draft kan altså bruke faktumet allerede der — selv om det egentlig først blir sant senere i kapittelet.\n\nEksempel: hovedpersonen møter en gammel venn, Marcus, i kapittel 6. Kapittelet åpner som en vanlig gjenforening. Først et stykke ut innser hovedpersonen at Marcus i hemmelighet har arbeidet mot ham hele tiden — Marcus er antagonisten. Plukker du ut «Marcus er antagonisten» fra Intervjuet og låser det til kapittel 6, har Draft tilgang til avsløringen allerede når den innledende gjenforeningen skal skrives som om ingen ennå vet hva Marcus egentlig driver med.\n\nLås faktumet til en bestemt scene i stedet\nSkal faktumet først bli tilgjengelig når avsløringen skjer, kan du koble det til scenen der det skjer.\n\nDel først kapittel 6 i scener (Scener → Del i to…) på punktet der avsløringen skjer, slik at gjenforeningen og avsløringen blir egne scener. Når du deretter plukker ut faktumet fra Intervjuet, viser velgeren «Fra og med» kapittelets scener — velg avsløringens scene i stedet for «Hele kapittelet». Nå får Draft tilgang til faktumet først fra og med den scenen.\n\nSkriver du scene for scene (Scener → Draft), kan du dermed skrive gjenforeningen uten at Draft ennå har tilgang til faktumet. Når du når frem til avsløringens scene, får Draft tilgang til det, og det gjelder deretter for resten av kapittelet.\n\nViktig: dette fungerer bare ved scenevis Draft\nScenekoblingen påvirker bare Draft når du skriver én scene om gangen. Kjører du Draft for hele kapittelet, får Draft tilgang til alle fakta som hører til kapittelet, uansett hvilken scene de er koblet til.\n\nForetrekker du å skrive hele kapitler i ett strekk, gjelder derfor den enklere løsningen fortsatt: vent med å låse faktumet til du har skrevet forbi vendepunktet, eller skriv kapittelet i to omganger og lås faktumet først før den andre omgangen."
      },
      "brainstorm-vs-interview": {
        heading: "Brainstorm og intervju",
        body: "De er to ulike måter å utforske historien på.\n\nBrainstorm — du ser på historien utenfra:\n”Tenk om Noras mor vet mer om forsvinningen?”\n\nIntervju — du undersøker historien innenfra:\n”Nora, tror du moren din vet hva som skjedde med faren din?”\n\nIngen av dem trenger automatisk å forandre historien. De er steder der du får lov til å tenke."
      },
      "three-levels-of-information": {
        heading: "Tre nivåer av informasjon",
        body: "En nyttig mental modell er:\n\nUtforsk\nBrainstorm og intervjuer. ”Tenk om…?” Her får idéene være usikre.\n↓\nPlanlegg\nSynopsis, briefer, Scener og Tråder. ”Dette tenker jeg skal skje.” Her former du historien.\n↓\nEtabler\nLåste fakta i Story Bible. ”Dette er sant i historiens verden.” Her finnes informasjon StoryBook AI kan forholde seg til når historien skrives."
      },
      "extract-facts": {
        heading: "Trekk ut fakta fra manuset",
        body: "Du trenger ikke fylle Story Bible manuelt mens du skriver. Når et kapittel inneholder informasjon som er verdt å huske, kan StoryBook AI hjelpe deg å trekke ut mulige fakta.\n\nArbeidsflyten er:\nKapittel → Trekk ut fakta → Forslag → Gjennomgå → Godkjenn og lås → Story Bible\n\nAI foreslår. Du bestemmer."
      },
      "moving-from-other-tool": {
        heading: "Flytte fra et annet skriveverktøy",
        body: "Har du allerede jobbet med historien et annet sted, trenger du ikke begynne på nytt. Du har kanskje allerede:\n• et manus\n• karakterbeskrivelser\n• steder\n• verdensbygging\n• lore\n• organisasjoner\n• gjenstander\n• historikk\n• regler for verdenen\n\nStoryBook AI kan hjelpe deg å ta med materialet."
      },
      "import-lore": {
        heading: "Importer lore",
        body: "Åpne: Story Bible → Importer lore\n\nLim inn en artikkel eller tekst fra ditt eksisterende materiale. Det kan for eksempel være:\n”Fyrtårnet ble bygget i 1892 på øyas nordspiss. Tårnet har vært ubemannet siden 1987. Lokalbefolkningen unngår stedet etter mørkets frembrudd.”\n\nStoryBook AIs lokale AI leser teksten og foreslår fakta. Du gjennomgår deretter forslagene.\n\nOriginalteksten lagres ikke som en del av boken. Det er faktaene du velger å godkjenne som føres videre.\n\nDagens lore-import jobber med én artikkel eller tekst om gangen."
      },
      "lore-relevance-filter": {
        heading: "Hold en stor importert Story Bible relevant",
        body: "Fakta som manuset selv har etablert — skrevet i et kapittel, eller godkjent fra et intervju — tas alltid med i Skriv utkast. De er historiens eget minne, og det finnes ingen trygg måte å utelate dem på. Importert lore (Importer lore) er annerledes: det er bakgrunnsinformasjon, bare nyttig når kapittelet som skrives faktisk handler om det. Med en stor importert verden kan det svelle prompten kraftig å ta med hver eneste slik fakta i hvert Skriv utkast-kall — og begrave den håndfullen som faktisk er relevant for akkurat det kapittelet.\n\nInnstillinger → Vis bare relevant lore for Skriv utkast (avslått som standard) endrer det: en importert lore-fakta tas bare med hvis dens eget navn nevnes i kapittelet, eller — for en Hendelse, som et historisk slag eller en sponsoravtale — hvis en deltaker eller stedet nevnes i stedet, selv om selve hendelsen aldri nevnes ved navn.\n\nHvis filteret noen gang gjetter feil på en bestemt fakta, fest den: den samme syklus-knappen i Story Bible som allerede brukes til å overstyre en fakta sin posisjon i story-tiden, betyr nå også «ta alltid med denne, uansett»."
      },
      "already-have-manuscript": {
        heading: "Du har allerede et manus",
        body: "Har du allerede skrevet deler av eller hele historien, trenger du ikke begynne med Brainstorm eller en fortellermetode. Begynn med teksten du har.\n\nEn mulig arbeidsflyt er:\nEksisterende manus → Kapitler → Trekk ut fakta → Story Bible → Analyser og bearbeid → Fortsett å skrive\n\nBrainstorm, Synopsis og fortellermetoder er hjelpemidler. De er ikke obligatoriske steg."
      },
      "write-with-ai": {
        heading: "Skriv sammen med AI",
        body: "AI trenger ikke skrive hele kapitler. Velg det minste verktøyet som løser problemet.\n\nSkriv utkast — når kapittelet ennå ikke har noen tekst.\nForleng — når du har begynt å skrive men trenger å komme videre.\nUtdyp — når en passasje går for fort eller trenger mer innhold.\nSkriv om — når du vet hva du vil forandre. Eksempel: ”Gjør dialogen mer ubehagelig uten at personene sier rett ut hva de er sinte for.”\nSkriv en beat — når du vet nøyaktig hvilken mindre hendelse som skal skje. Eksempel: ”Nora hører steg i trappen og gjemmer brevet før døren åpnes.”"
      },
      "smallest-tool": {
        heading: "Velg det minste verktøyet",
        body: "Helt tomt kapittel → Skriv utkast\nEn mindre hendelse mangler → Skriv en beat\nPassasjen er for tynn → Utdyp\nJeg trenger å komme videre → Forleng\nJeg vet hva jeg vil forandre → Skriv om\nJeg vil vite om kapittelet fungerer → Analyser\n\nDet gir deg mer kontroll enn å generere om store mengder tekst."
      },
      "ai-not-autopilot": {
        heading: "AI er ikke autopilot",
        body: "StoryBook AI er ikke bygget rundt: ”Skriv boken min.”\n\nTanken er heller:\nDu bestemmer retningen.\n↓\nAI hjelper der du vil ha hjelp.\n↓\nDu leser resultatet.\n↓\nDu endrer, beholder eller forkaster det.\n↓\nHistorien utvikler seg.\n\nDu kan skrive flere kapitler helt uten AI. Du kan bruke AI bare når du sitter fast. Eller lage råutkast som du deretter skriver kraftig om. Alt dette er normale måter å bruke StoryBook AI på."
      },
      "pov-tense-voice": {
        heading: "Perspektiv, tid og fortellerstemme",
        body: "StoryBook AI kan få informasjon om hvordan historien skal fortelles. Det kan for eksempel dreie seg om:\n• perspektiv\n• tid (tempus)\n• synsvinkel\n• fortellerstemme\n\nEnkeltkapitler kan ved behov avvike fra bokens grunninnstillinger. Det kan være nyttig hvis hoveddelen av romanen fortelles i tredjeperson, men et bestemt kapittel trenger en annen synsvinkel.\n\nHvis du bruker AI til større omskrivinger etter en slik endring, bør du alltid lese resultatet nøye.\n\nPerspektiv handler om mer enn å bytte pronomen."
      },
      reader: {
        heading: "Leser",
        body: "Du kan angi hvilken type leser historien retter seg mot. Det kan hjelpe AI å tilpasse for eksempel ordvalg og setningsbygning når den skriver sammen med deg.\n\nDet er skrivestøtte. Det er ikke en automatisk vurdering av hvilken alder den ferdige boken passer for."
      },
      "author-voice": {
        heading: "Forfatterstemme",
        body: "To forfattere kan beskrive den samme hendelsen på helt ulike måter. Forfatterstemmen hjelper AI å forstå hvordan du vil at prosaen skal føles. Det kan dreie seg om:\n• setningslengde\n• mengden miljøbeskrivelse\n• dialog\n• rytme\n• direkte eller tilbakeholdent språk\n• andre stilistiske trekk\n\nDet er veiledning for AI. Ikke regler for hvordan du må skrive. Din egen tekst har alltid siste ord."
      },
      "analyze-chapter": {
        heading: "Analyser et kapittel",
        body: "Analyser gjennomgår teksten uten å skrive den om for deg. Hensikten er å hjelpe deg å oppdage ting du selv kanskje vil undersøke nærmere.\n\nTenk på analysen som en ekstra leser.\nIkke: ”Slik skal du skrive.”\nMen: ”Her er noe du kanskje vil se nærmere på.”\n\nDu bestemmer om innspillet er relevant."
      },
      continuity: {
        heading: "Kontinuitet",
        body: "Jo lengre manuset blir, desto vanskeligere blir det å huske alt. En person kan få ulik øyenfarge. Et sted kan plutselig forandre seg. En karakter kan virke å kjenne til informasjon hen ennå ikke burde kjenne til.\n\nHer hjelper Story Bible og historiens kontinuitetsverktøy deg å sammenligne det du skriver med det som allerede er etablert.\n\nHvem vet hva?\nKontinuitet handler ikke bare om fysiske detaljer. Det handler også om informasjon. Leseren kjenner kanskje til en hemmelighet. Det betyr ikke at alle karakterene gjør det.\n\nDette blir spesielt viktig i mysterier, thrillere, flere perspektiver og historier der informasjon avsløres gradvis."
      },
      "ask-manuscript": {
        heading: "Spør manuset",
        body: "Når boken har blitt lang, kan du bruke Spør manuset til å undersøke din egen historie.\n\nEksempel:\n”Når møter Erik kvinnen på toget for første gang?”\n”I hvilke kapitler nevnes fyrtårnet?”\n”Hva vet Lena om Eriks far?”\n”Når får leseren vite at fotografiet er fra 1932?”\n\nDu kan også spørre:\n”Hvilke kapitler handler mest om forholdet mellom Nora og Elias?”\neller:\n”Hvor nevnes nøkkelen før den blir viktig senere?”\n\nSvaret er et hjelpemiddel for deg. Det blir ikke automatisk kanon og skal ikke i seg selv forandre kapitlene."
      },
      "ask-about-passage": {
        heading: "Spør om et kapittel eller en passasje",
        body: "Analyser sjekker faste kategorier. Spør manuset svarer på faktaspørsmål om det som allerede er skrevet. Ingen av dem kan svare på noe i stil med: «Bygger dette mot en sterk slutt?» eller «Virker dette argumentet troverdig, eller konstruert?» — Spør om kapittelet / Spør om en passasje er til for akkurat den typen spørsmål: ditt eget, om håndverket, med et ærlig — og kritisk, hvis du ber om det — svar.\n\nTo måter å bruke det på:\n«Spør om kapittelet…» (ved siden av Analyser) — spør om hele kapittelet.\nMarker en passasje i teksten, velg så «Spør…» fra menyen dens — spør bare om den passasjen, med den omkringliggende teksten som kontekst.\n\nEksempel:\n«Gjør slutten at du vil lese neste kapittel?»\n«Viser denne scenen for mye, for fort?»\n\nSvaret er bare til å lese. Ingenting endres eller lagres — akkurat som Spør manuset."
      },
      history: {
        heading: "Historikk",
        body: "AI-assistert skriving innebærer ofte eksperimentering. En omskriving blir kanskje bedre. Eller du oppdager at den gamle versjonen faktisk fungerte bedre.\n\nNår tidligere versjoner er tilgjengelige, kan Historikk hjelpe deg å sammenligne og gå tilbake.\n\nTenk: Prøv → Les → Behold eller gå tilbake\n\nDu trenger ikke akseptere en endring bare fordi AI laget den."
      },
      proofread: {
        heading: "Korrekturles",
        body: "Korrekturlesing passer senere i prosessen.\n\nTidligere var kanskje spørsmålet: ”Hvordan kan scenen utvikle seg?”\nNå blir spørsmålet: ”Er det noe her som trenger å rettes eller sjekkes?”\n\nDet er sjelden meningsfullt å pusse på hver setning hvis du fortsatt planlegger å skrive om hele kapitler. Jobb gjerne fra stort til smått:\nHistorien → Kontinuiteten → Kapitlene → Språket → Korrekturlesingen → Din egen sluttlesing\n\nAI kan finne ting. Forfatteren avgjør hva som fungerer."
      },
      "images-illustrations": {
        heading: "Bilder og illustrasjoner",
        body: "StoryBook AI kan hjelpe deg å jobbe med bilder på to ulike måter.\n\nEgne bilder\nDu kan legge til bilder i historien. Nyttig for illustrerte historier, barnebøker eller prosjekter der bilder er en del av leseopplevelsen.\n\nIllustrasjonsprompter\nDu kan også bruke tekst fra historien som grunnlag for en bildebeskrivelse.\n\nEksempel — manus: ”Erik sto alene på perrongen. Tåken lå tett over sporene, og stasjonsklokken hadde stoppet på 03:17.”\nStoryBook AI kan hjelpe deg å gjøre om passasjen til en illustrasjonsprompt basert på motivet og prosjektets valgte visuelle stil. Selve historieteksten endres ikke."
      },
      publish: {
        heading: "Publiser",
        body: "Når historien er klar til å forlate arbeidsflaten, bruker du Publiser.\n\nTenk på forskjellen:\nStoryBook-prosjektet = verkstedet ditt\nPubliseringen = det leseren får\n\nBrainstorm, arbeidsnotater og annen planlegging trenger derfor ikke bli med i den publiserte historien. Velg formatet som passer hvordan teksten skal brukes, og jobb videre med resultatet der det trengs."
      },
      backup: {
        heading: "Sikkerhetskopi",
        body: "Publisering og sikkerhetskopiering er ikke det samme.\n\nEn publisert bok er for leseren. En StoryBook-sikkerhetskopi er for å kunne gjenopprette selve prosjektet. Den kan derfor inneholde informasjon som ikke finnes i den publiserte versjonen.\n\nLagre sikkerhetskopier jevnlig, spesielt før større endringer.\n\nImporter sikkerhetskopi brukes til StoryBook AIs egne sikkerhetskopier. Det er ikke det samme som å importere et manus eller lore fra et annet skriveprogram."
      },
      "network-ai-server": {
        heading: "En AI-server på en annen datamaskin i nettverket",
        body: "Har du en kraftig datamaskin eller server på samme nettverk, og vil skrive i StoryBook AI fra en annen maskin — en bærbar, for eksempel? Det går, men krever innstillinger tre steder: i StoryBook AI, på servermaskinen, og i brannmuren dens.\n\nMotoren må være «LM Studio / annen lokal server»\nÅpne Innstillinger → Modeller. Uansett om den andre maskinen faktisk kjører Ollama eller LM Studio, velg den motoren — det er den eneste som viser et felt for serveradresse. Ollama-motoren peker alltid mot din egen datamaskin (localhost) og kan ikke pekes om via grensesnittet.\n\nSkriv inn den andre datamaskinens nettverksadresse\nI feltet Serveradresse: http://[den andre maskinens nettverks-IP]:[port] — for eksempel http://192.168.1.50:11434 for Ollama, eller http://192.168.1.50:1234 for LM Studio. Ikke legg til /v1 på slutten, StoryBook AI gjør det selv. Finn den andre maskinens nettverksadresse med ipconfig (Windows) eller ifconfig/ip addr (Mac/Linux) på nettopp den maskinen.\n\nLa serveren lytte på nettverket, ikke bare seg selv\nKjører den andre maskinen Ollama: start den med miljøvariabelen OLLAMA_HOST=0.0.0.0 slik at den lytter bredt, og OLLAMA_ORIGINS satt til adressen StoryBook AI faktisk kjører fra — ellers avviser den nettleserens forespørsel selv om selve forbindelsen fungerer.\nKjører den LM Studio: fanen Developer → Server-innstillingene → slå på «Serve on Local Network» og «Enable CORS».\n\nBrannmuren på servermaskinen\nDen må tillate innkommende forbindelser på porten (11434 for Ollama, vanligvis 1234 for LM Studio) fra resten av nettverket — ellers slipper forespørselen aldri gjennom, selv om alt ovenfor er riktig satt opp.\n\nHver datamaskin har for øvrig sitt eget bibliotek med manuskripter — bare AI-tilkoblingen deles, ikke det du har skrevet. Vil du fortsette på samme bok fra begge maskinene, bruk Sikkerhetskopi/Gjenopprett for å flytte den."
      },
      "ai-writing-wrong-things": {
        heading: "Hvis AI begynner å skrive feil ting",
        body: "Tenk først på hvilken informasjon modellen faktisk har fått.\n\nKapittelbriefen er utdatert\nSjekk om briefen fortsatt beskriver kapittelet du vil skrive.\n\nSynopsis har ikke fulgt med historiens utvikling\nHistorien har kanskje endret seg siden du planla den.\n\nIdéen finnes bare i Brainstorm\nBrainstorm er et utforskende område. En idé der skal ikke automatisk behandles som en del av historien.\n\nInformasjonen kommer bare fra et intervju\nSamme prinsipp gjelder her. Det som ble sagt under intervjuet påvirker ikke hvordan boken skrives, med mindre du har valgt å låse informasjonen som et faktum.\n\nViktig informasjon mangler i Story Bible\nHvis noe må være konsekvent, kan det trenge å bli etablert og låst som et faktum.\n\nInstruksjonen din er for bred\nI stedet for: ”Skriv om scenen så den blir bedre.”\nprøv: ”Gjør dialogen mellom Nora og Elias mer tilbakeholden. De mistenker hverandre, men ingen vil vise det ennå.”\n\nJo tydeligere problemet er, desto lettere blir det å velge riktig verktøy."
      },
      "marker-conversion-no-match": {
        heading: "«Convert markers to formatting» finner ingen markeringer",
        body: "Som regel betyr det at tegnet du skrev inn i feltet ikke er nøyaktig samme tegn som i manuskriptet — lett å oppleve med anførselstegn, siden \" (rett anførselstegn) og «smarte»/typografiske anførselstegn (som tekstbehandlere ofte bytter til automatisk) ser nesten like ut, men er ulike tegn for datamaskinen.\n\nSikreste løsning: åpne kapittelet, marker ett av de faktiske tegnene i teksten din, kopier det (Ctrl/Cmd+C), og lim det inn i feltet for åpnings- eller avslutningstegn i stedet for å skrive det på tastaturet på nytt. Da er det garantert nøyaktig riktig tegn."
      }
    }
  },
  scenes: {
    toggleCount: {
      one: "{count} scene",
      other: "{count} scener"
    },
    titlePlaceholder: "Navnløs scene",
    titleLabel: "Tittel for scene {index}",
    briefPlaceholder: "Skrivenotat bare for denne scenen (valgfritt)",
    briefLabel: "Notat for scene {index}",
    mergeWithNext: "Slå sammen med neste ↓",
    splitHere: "Del i to…",
    splitHint: "Velg hvor den nye scenen skal starte:",
    draft: "Lag utkast",
    recast: "Omskriv",
    analyze: "Analyser",
    addScene: "Legg til scene",
    addSceneDisabledHint: "Fullfør denne scenen før du legger til neste"
  },
  publish: {
    title: "Publiser",
    body: "En lesbar kopi av historien. Lar brainstorm ligge. RTF og ODT åpnes i Scrivener. HTML åpnes i en hvilken som helst nettleser. ePub åpnes i en e-bokleser. PDF er klar til utskrift.",
    documentName: "Dokumentnavn",
    format: "Format",
    font: "Skrift",
    systemFont: "Standardserif (Times/Georgia)",
    paragraphStyle: "Avsnittsformat",
    paragraphStyleSpaced: "Tom linje mellom avsnitt",
    paragraphStyleIndented: "Innrykk, ingen tom linje (klassisk bokstil)",
    action: "Publiser",
    markdown: "Markdown",
    txt: "Ren tekst",
    rtf: "RTF",
    odt: "ODT",
    html: "HTML",
    epub: "ePub",
    pdf: "PDF"
  },
  progress: {
    title: "Fremgang",
    setGoal: "Sett mål",
    editGoal: "Endre mål",
    removeGoal: "Fjern mål",
    saveGoal: "Lagre mål",
    targetWordsLabel: "Måltall ord",
    deadlineLabel: "Sluttdato",
    daysPerWeekLabel: "Skrivedager per uke",
    wordsOfTarget: "{current} av {target} ord",
    percentComplete: "{percent} % dit",
    dailyPaceNeeded: "~{perDay} ord/dag trengs for å rekke det",
    overdue: "Sluttdato passert — {remaining} ord igjen",
    targetReached: "Mål nådd"
  },
  find: {
    action: "Søk/Erstatt",
    title: "Søk og erstatt",
    body: "Treffene markeres i tekstfeltet. Pilene hopper til neste eller forrige. Story Bible blir liggende. Brainstorm blir liggende med mindre du tar den med.",
    find: "Søk",
    replaceWith: "Erstatt med",
    matchCase: "Skill store og små",
    wholeWord: "Hele ord",
    includeBrainstorm: "Ta med brainstorm",
    here: "Denne siden",
    echoes: "Gjentatte ord",
    phrases: "Gjentatte fraser",
    noneEcho: "Ingen gjentatte ord på denne siden.",
    nonePhrases: "Ingen gjentatte fraser på denne siden.",
    none: "Ingenting matcher.",
    hits: { one: "{count} treff", other: "{count} treff" },
    snippetHint: "Linjene under en overskrift er ordet med teksten rundt. Søkevinduet ligger oppå siden, så stedene listes her.",
    moreSnippets: "Og {count} til på dette stedet.",
    fields: {
      title: "Tittel",
      brief: "Brief",
      voice: "Forfatterstemme",
      viewpoint: "Synsvinkel"
    },
    replace: "Erstatt",
    replaceCount: "Erstatt {count}",
    showHit: "Vis {place}",
    untitled: "Uten tittel",
    prev: "Forrige treff",
    next: "Neste treff",
    position: "{current} av {total}"
  },
  proofread: {
    action: "Korrektur",
    title: "Korrektur",
    runningTitle: "Korrektur pågår — et godt tidspunkt for kaffe.",
    lede: "En siste Review-runde over hele manuskriptet. Bare sitater og notater. Ingenting skrives om.",
    grammar: "Grammatikk",
    scenes: "Gjentatte scener",
    style: "Stil og følelse mellom kapitler",
    age: "Aldersrapport",
    continuity: "Kontinuitet",
    setups: "Plantet & innfridd",
    facts: "Faktakontroll",
    grammarProgress: "Grammatikk — {done} av {total} kapitler ferdige",
    scenesProgress: "Leter etter gjentatte scener — {done} av {total} avsnittspar sammenlignet",
    styleProgress: "Stil- og følelseskonsekvens mellom kapitler",
    ageProgress: "Setter sammen aldersrapporten",
    continuityProgress: "Sjekker at ingen er på to steder samtidig",
    setupsProgress: "Leter etter plantede detaljer som ikke er innfridd ennå",
    factsProgress: "Kontrollerer fakta mot Story Bible — {done} av {total} kapitler ferdige",
    now: "Akkurat nå: {detail}",
    nowGrammar: "leser kapittel {n}…",
    nowScenes: "sammenligner kapittel {a} med kapittel {b}…",
    nowStyle: "lytter etter et skifte i register eller følelse…",
    nowAge: "veier prosaen mot Leser…",
    nowContinuity: "sjekker hvem og hva som er hvor, og når…",
    nowSetups: "sjekker hva som er plantet, og hva som er innfridd…",
    nowFacts: "kontrollerer kapittel {n} mot Story Bible…",
    stillWorking: "Jobber fortsatt — et enkelt kapittel kan ta noen minutter på tregere maskinvare. Ingenting har stanset.",
    percent: "{n}%",
    continue: "Fortsett",
    runAgain: "Kjør på nytt",
    resultsTitle: "Notater fra korrektur",
    emptyResults: "Ingenting fast denne gangen.",
    clickHint: "Klikk på en linje for å åpne kapitlet.",
    stale: "Kapitlet er endret siden passet.",
    suggestion: "Forslag",
    chapter: "Kapittel {n}",
    chapters: "Kapittel {a} og {b}",
    paused: "Pauset. Det som rakk å bli ferdig er lagret.",
    error: "Passet stoppet. Det som rakk å bli ferdig er lagret.",
    craft: "Kamera på kortene",
    contentFlag: "Innholdsvarsel",
    stageSkipped: "Ikke valgt denne gangen",
    scopeSummary: "Omfang: bare {chapter}. Grammatikk og Faktasjekk gjelder bare det kapitlet; de andre stegene sammenligner alltid hele manuset.",
    setupTitle: "Før vi kjører",
    setupLede: "Kryss av det du vil kontrollere denne gangen. Alt er forhåndsavkrysset, akkurat som før.",
    setupStagesLabel: "Hva skal kontrolleres",
    setupScopeLabel: "Omfang",
    setupScopeManuscript: "Hele manuset",
    setupScopeChapter: "Bare \"{chapter}\" (det åpne kapitlet)",
    setupScopeChapterHint: "Gjelder bare Grammatikk og Faktasjekk — de eneste to stegene som skalerer med antall kapitler. De andre sammenligner alltid mellom kapitler, så de kjøres over hele manuset uansett.",
    setupStart: "Start korrekturlesing",
    setupNothingSelected: "Velg minst én ting å kontrollere."
  },
  craft: {
    pov: "Perspektiv",
    povAria: "Fortellerperspektiv",
    chapterPov: "Kapitlets fortellerperspektiv",
    tense: "Tempus",
    tenseAria: "Tempus",
    chapterTense: "Kapitlets tempus",
    viewpoint: "Synsvinkel",
    viewpointPlaceholder: "Hvem er i fokus?",
    viewpointAria: "Synsvinkelkarakter",
    chapterViewpoint: "Kapitlets synsvinkelkarakter",
    viewpointInherit: "{name} (manuskript)",
    usual: "Vanlige",
    more: "Flere",
    inheritPov: "Manuskript · {label}",
    inheritTense: "Manuskript · {label}",
    continuesFrom: "Fortsetter fra",
    previousChapter: "Forrige kapittel",
    previousChapterNamed: "Forrige kapittel · {label}",
    noneStrand: "Ingen · ny tråd",
    modes: {
      limited: "Tredje person begrenset",
      first: "Første person",
      omniscient: "Tredje person allvitende",
      objective: "Tredje person objektiv",
      second: "Andre person"
    },
    tenses: {
      past: "Fortid",
      present: "Nåtid"
    }
  },
  bible: {
    title: "Story Bible",
    search: "Søk i Story Bible",
    searchPlaceholder: "Finn et navn eller en påstand",
    shelves: "Story Bible-hyller",
    review: "Gjennomgå fakta",
    reviewCount: "Gjennomgang · {count}",
    lockedCount: "{count} låste",
    exportCards: "Eksporter kort",
    exportCardsTitle: "Last ned karakterer, steder og gjenstander til Sandbox",
    importLoreNav: "Importer lore",
    importLoreTitle: "Importer en lore-artikkel",
    importLoreLede: "Lim inn tekst fra din egen lorebok. En AI leser gjennom den og foreslår fakta til riktig kort — akkurat som når fakta hentes ut fra et kapittel. Ingenting låses direkte; alt havner i granskingskøen. Selve teksten lagres ikke i boken, bare faktaene den gir opphav til.",
    importLoreArticleTitle: "Artikkelens navn (valgfritt, vises i granskingen)",
    importLoreArticleTitlePlaceholder: "F.eks. \"Fyrtårnet\" eller \"Ordenens regler\"",
    importLoreText: "Tekst å hente fakta fra",
    importLoreTextPlaceholder: "Lim inn artikkelen her…",
    importLoreAction: "Hent ut fakta",
    importLoreExtracting: "Henter ut…",
    importLoreUpload: "Last opp fil",
    importLoreFoundCount: "Fant {count}",
    importLoreArticlesCount: { one: "{count} artikkel", other: "{count} artikler" },
    importLoreExtractingProgress: "Henter ut {current} av {total}…",
    importLoreActionCount: "Hent ut fakta fra {count}",
    nothingMatches: "Ingenting matcher.",
    hidden: "Skjult",
    name: "Navn",
    close: "Lukk",
    reviewBody: "Foreslåtte rader i Story Bible. Gjør dem tydeligere, lås — eller avvis.",
    hideFromDraft: "Skjul for utkast",
    interview: "Intervju",
    interviewPickerTitle: "Hvem eller hva vil du intervjue?",
    interviewPickerLede: "Hvilket som helst kort i Story Bible — ikke bare karakterer. Et sted eller en gjenstand kan også intervjues, i tredje person, som en måte å bygge ut verdenen din på.",
    showToDraft: "Vis for utkast",
    hiddenNote: "Modellen ser ikke dette kortet før du viser det igjen.",
    deleteEntity: "Slett dette kortet",
    deleteConfirm: "Slette “{name}” helt, med alle fakta, bilder og profil? Dette kan ikke angres.",
    thisIsA: "Dette er en",
    pictures: "Bilder",
    picturesAside: "(Til senere eksport. Utkast ser aldri disse.)",
    removePicture: "Slett bilde {n}",
    addImage: "Legg til bilde",
    addingImage: "Legger til bilde",
    addFact: "Legg til fakta",
    addFactHint: "Legger du til et påstand under en kategori som allerede har en, tilbys du å erstatte den — den tidligere verdien er fortsatt synlig i Historikk, koblet til kapittelet du skriver nå.",
    claimPlaceholder: "Påstanden, på én linje",
    lockInto: "Lås til Story Bible",
    addChoiceTitle: "Erstatt eller legg til?",
    addChoiceBody: "Feltet {predicate} har allerede “{existing}”. Skal den nye teksten erstatte den, eller ligge ved siden av som enda en {predicate}-rad?",
    addChoiceKeepBoth: "Legg til som enda en",
    addChoiceReplace: "Erstatt den eksisterende",
    history: "Historikk",
    historyAside: "(Å erstatte et påstand under legger til en rad her.)",
    historyCurrent: "nå",
    asOfLabel: "Vis Story Bible slik den var ved",
    asOfNow: "Nåtiden",
    asOfBanner: "Viser Story Bible slik den var ved «{chapter}» — skrivebeskyttet.",
    asOfBack: "Tilbake til nåtiden",
    asOfEntityLede: "Slik det sto ved «{chapter}».",
    mentions: "Omtaler",
    mentionsAside: "(Hvert kapittel som nevner denne entiteten i prosaen.)",
    aliases: "Alias",
    aliasesAside: "(Kallenavn og titler. Teller også som en omtale.)",
    aliasesPlaceholder: "Kommaseparerte kallenavn",
    exclusions: "Unntak",
    exclusionsAside: "(Fraser som ikke skal telle som en omtale.)",
    exclusionsPlaceholder: "Kommaseparerte fraser som skal ignoreres",
    replaceTitle: "Erstatt i manuskriptet?",
    replaceBody: "Erstatt “{from}” med “{to}” på {places}. Brainstorm blir liggende urørt.",
    places: { one: "{count} sted", other: "{count} steder" },
    keepTexts: "Behold tekstene",
    replace: "Erstatt",
    pronoun: "Pronomen",
    age: "Omtrentlig alder",
    looks: "Utseende",
    looksPlaceholder: "Kropp og ansikt. Ikke klær.",
    tags: "Tagger",
    tagsAside: "(Bare hyllen. Utkast ser aldri disse.)",
    tagsPlaceholder: "Kommaseparerte trekk",
    personality: "Personlighet",
    personalityPlaceholder: "Hvordan de pleier å være",
    goals: "Mål",
    goalsPlaceholder: "Hva de vil",
    fears: "Frykter",
    fearsPlaceholder: "Hva de er redde for",
    eventWhere: "Hvor",
    eventWhereNone: "Ikke plassert ennå",
    eventParticipants: "Hvem som var der",
    eventsHere: "Hendelser her",
    peopleHere: "Personer her",
    namePlaceholder: "Navn",
    factText: "Faktatekst",
    sourceLabel: "Kilde: {source}",
    sources: {
      chapter: "Kapittel",
      interview: "Intervju",
      lore: "Lore",
      brainstorm: "Brainstorm",
      synopsis: "Synopsis",
      brief: "Brief"
    },
    conflictsWith: "Kolliderer med: {value}",
    similarTo: "Ligner: {value} — ser ut som samme fakta, bare mer detaljert",
    lock: "Lås",
    merge: "Slå sammen",
    keepSeparate: "Behold begge",
    reject: "Avvis",
    show: "Vis",
    hide: "Skjul",
    showClaim: "Vis denne påstanden for utkast",
    hideClaim: "Skjul denne påstanden for utkast",
    positionOverrideAuto: "Auto",
    positionOverrideInclude: "Alltid med",
    positionOverrideExclude: "Aldri med",
    positionOverrideToInclude: "Inkluder alltid i Lag utkast, uansett kapittelets posisjon i story-tiden og uansett relevansfilteret for lore",
    positionOverrideToExclude: "Utelat alltid fra Lag utkast, uansett kapittelets posisjon i story-tiden",
    positionOverrideToAuto: "Gå tilbake til automatisk posisjonering (styres av story-tiden)",
    edit: "Rediger",
    editFact: "Rediger fakta",
    save: "Lagre",
    updateFact: "Oppdater…",
    updateFactHint: "Merk at dette endres herfra — fyller inn Legg til fakta under, koblet til kapittelet du skriver nå. I motsetning til Rediger, som retter det det alltid har vært.",
    kinds: {
      characters: "Karakterer",
      locations: "Steder",
      objects: "Gjenstander",
      groups: "Grupper",
      events: "Hendelser",
      concepts: "Konsepter"
    },
    singular: {
      characters: "Karakter",
      locations: "Sted",
      objects: "Gjenstand",
      groups: "Gruppe",
      events: "Hendelse",
      concepts: "Konsept"
    },
    newLabel: {
      characters: "Ny karakter",
      locations: "Nytt sted",
      objects: "Ny gjenstand",
      groups: "Ny gruppe",
      events: "Ny hendelse",
      concepts: "Nytt konsept"
    },
    empty: {
      characters: "Ingen karakterer ennå.",
      locations: "Ingen steder ennå.",
      objects: "Ingen gjenstander ennå.",
      groups: "Ingen grupper ennå.",
      events: "Ingen hendelser ennå.",
      concepts: "Ingen konsepter ennå."
    },
    predicates: {
      "core.identity": "Identitet",
      "core.trait": "Karaktertrekk",
      "core.place": "Sted",
      "core.object": "Gjenstand",
      "core.group": "Gruppe",
      "core.relationship": "Relasjon",
      "core.event": "Hendelse",
      "core.concept": "Konsept"
    },
    pronouns: {
      she: "Hun",
      he: "Han",
      it: "Hen"
    }
  },
  canvas: {
    jumpToEntity: "Ctrl-klikk (Cmd-klikk på Mac) for å åpne {name}s Story Bible-kort",
    extend: "Forleng",
    elaborate: "Utdyp",
    beat: "Skriv en beat…",
    beatTitle: "Skriv en beat",
    beatHint: "Kort og konkret: hva skjer nå? Modellen skriver bare den beaten, ikke mer, og setter den inn akkurat der markøren står.",
    beatPlaceholder: "Hva skjer videre, i én linje",
    beatAction: "Skriv beaten",
    rewriteMenu: "Skriv om…",
    illustrate: "Illustrasjonsprompt…",
    lift: "Løft til synopsis",
    cutToDarling: "Klipp til yndlinger",
    formatToolbar: "Formatering",
    bold: "Fet",
    italic: "Kursiv",
    underline: "Understreket",
    manual: "Manuell redigering",
    insteadOf: "I stedet for “{word}”",
    looking: "Søker…",
    noAlts: "Ingen alternativer denne gangen.",
    retry: "Prøv på nytt",
    manualTitle: "Manuell redigering",
    manualBody: "Skriv om bare det markerte avsnittet. Resten av teksten blir liggende.",
    apply: "Bruk",
    rewriteTitle: "Skriv om",
    rewriteHint: "Si til modellen hvordan det markerte avsnittet skal endres. Bare det spannet byttes ut.",
    rewritePlaceholder: "Hva skal endres?",
    rewriteAction: "Skriv om",
    ask: "Spør…",
    askTitle: "Spør om denne passasjen",
    askHint: "Spør om hva som helst om den markerte passasjen — vær så kritisk du vil. Svaret er bare til å lese, ingenting endres eller lagres.",
    askPlaceholder: "Hva vil du vite?",
    askAction: "Spør",
    placeholderAdd: "Legg til plassholder…",
    placeholderAddTitle: "Legg til plassholder",
    placeholderAddHint: "En rask notis til deg selv — et navn, en fakta, en dato du fyller inn senere. Fortsett å skrive; kom tilbake når du vil.",
    placeholderPlaceholder: "Hva trenger du å komme tilbake til?",
    placeholderAddAction: "Legg til",
    placeholderViewTitle: "Plassholder",
    placeholderSave: "Lagre",
    placeholderResolve: "Marker som løst",
    placeholderOpen: "Åpne denne plassholderen",
    placeholderEmptyNote: "Plassholder",
    rewriteChips: {
      group: "Snarveier fra Statistikk og Analyse",
      povLeakCamera:
        "Bli i det aktuelle kameraet. Ikke gå inn i et sinn kameraet ikke kan kjenne. Samme hendelser.",
      povLeak: {
        label: "Fiks perspektivbrudd",
        prompt:
          "Bli i {who}s oppfatning. Ikke gjengi en annen karakters tanker eller følelser. Samme hendelser."
      },
      strongerVerbs: {
        label: "Sterkere verb",
        prompt:
          "Bytt svake verb pluss måtesadverb mot sterkere verb (løp fort → raste). Ikke bare ta bort -t-ordene. Samme hendelser."
      },
      activeVoice: {
        label: "Aktiv form",
        prompt:
          "Gjør mulige passiver aktive (døren ble åpnet av henne → hun åpnet døren). Samme hendelser."
      },
      showDontTell: {
        label: "Vis, fortell ikke",
        prompt:
          "Der en følelse navngis, la kroppen eller scenen bære den. Ikke legg til forklaring. Samme hendelser."
      },
      breakLong: {
        label: "Bryt den lange setningen",
        prompt:
          "Bryt den lange setningen. Behold meningen. Et kort støt etter en lang linje, ikke en rekke like korte."
      }
    },
    modelAside: "Modellen la til dette. Det ligger ikke i manuset."
  },
  stats: {
    label: "Statistikk",
    wordsShort: { one: "{count} ord", other: "{count} ord" },
    rareOn: "Sjeldne ord på",
    rareOff: "Sjeldne ord av",
    rareOnTitle: "Skjul uvanlige ord",
    rareOffTitle: "Merk uvanlige ord",
    ticsOn: "Klisjeer på",
    ticsOff: "Klisjeer av",
    ticsOnTitle: "Skjul AI-klingende fraser",
    ticsOffTitle: "Merk AI-klingende fraser",
    factsOn: "Story Bible-navn på",
    factsOff: "Story Bible-navn av",
    factsOnTitle: "Skjul understreking av Story Bible-navn",
    factsOffTitle: "Understrek navn som finnes i Story Bible",
    rareMarkTitle: "Uvanlig ord — kan være vanskeligere for denne leseren",
    ticPhraseTitle: "Høres ut som en AI-generert frase",
    ticDashTitle: "Dette avsnittet støtter seg tungt på tankestreker",
    title: "Slik leses det",
    emptyTitle: "Ingen prosa ennå",
    writeSome: "Skriv litt prosa for å se hvordan det leses.",
    sentence: "Setning {n} · {words}",
    alreadyShort: "Allerede kort.",
    suggestSplit: "Foreslå en deling",
    looking: "Søker…",
    noSplit: "Ingen deling denne gangen.",
    split: "Deling",
    editSplit: "Rediger deling",
    useSplit: "Bruk denne delingen",
    paragraph: "Avsnitt {n} · {words}",
    packedHint: "Handling, et langt blikk bakover og stablede sanser i denne blokken.",
    suggestBreak: "Foreslå et brudd",
    noBreak: "Ingen brudd denne gangen.",
    break: "Brudd",
    editBreak: "Rediger avsnittsbrudd",
    useBreak: "Bruk dette bruddet",
    clickBar: "Klikk på en stolpe for å lese setningen.",
    mixedFocus: "Blandet fokus",
    mixedOne: "Denne blokken blander nåtidig handling, et langt blikk bakover og stablede sanser.",
    mixedMany: "Disse blokkene blander nåtidig handling, et langt blikk bakover og stablede sanser.",
    echo: "Gjentakelser",
    echoBody: "Samme ord eller frase gjentas på kort avstand. Klikk for å søke. Et omkved kan være poenget.",
    reuse: "Gjentatt frase",
    reuseBody: "Samme ordkjede dukker opp i mer enn ett avsnitt. Klikk for å søke. Et omkved kan være poenget.",
    reuseWhere: "Avsnitt {list} · {n} ord",
    openFind: "Søk «{phrase}» i teksten",
    povLeak: "Perspektivbrudd",
    foot: "{words} ord · {sentences} setninger · {spoken}% tale",
    highlight: "Merk i teksten",
    keepHighlight: "Behold merking",
    measures: "Hva dette måler",
    raise: "Hvordan du hever det",
    remember: "Husk",
    longSentences: "{n}+ ord",
    rareList: "Utenfor den kjente listen",
    hideGauge: "Skjul denne måleren.",
    aboutGauge: "Om denne måleren.",
    gaugeAria: "{label} {score}. {detail}",
    sparkTitle: "{count} ord",
    sparkAria: "Setning {n}, {count} ord",
    leakObjective: "Disse linjene ligner tanke. Objektiv viser bare det et kamera ville sett. Et forslag, ikke en dom.",
    leakFirstNamed: "Disse linjene ligner et annet sinn enn {who}. Et forslag, ikke en dom.",
    leakOther: "Disse linjene ligner et annet sinn. Et forslag, ikke en dom.",
    leakLimitedNamed: "Begrenset til {who} — disse linjene ligner et annet sinn. Et forslag, ikke en dom.",
    directnessReadout:
      "{adverbs} -t-adverb / 1 000 · {passives} mulige passiver / 1 000 · starter på 100, minus de to.",
    pacingSpanSame: "{count} ord hver",
    pacingSpanRange: "{min}–{max} ord",
    pacingReadout:
      "{mix} · {mean} ord typisk · {span}. Variasjon hever; en stabel av {n}+-setninger eller en monoton senker.",
    vocabularyReadout: "{share}% uvanlige · variasjon {ttr}. En mix scorer høyere enn bare enkelt eller bare sjeldent.",
    vocabularyReadoutKid: "{share}% uvanlige · variasjon {ttr}. Kjente ord scorer høyere for denne leseren.",
    mix: {
      mixed: "Blandet",
      choppy: "Kort og jevnt",
      sweeping: "Langt og jevnt",
      even: "Jevnt"
    },
    profiles: {
      empty: { label: "Ingen prosa ennå", genres: "" },
      short: { label: "For kort å måle", genres: "Skriv litt mer" },
      breezy: { label: "Raskt og lett", genres: "Thriller / YA" },
      brisk: { label: "Rørlig", genres: "Eventyr / romantikk" },
      balanced: { label: "Balansert", genres: "Allmenn fiksjon" },
      atmospheric: { label: "Tett og atmosfærisk", genres: "Litterært / episk fantasy" },
      heavy: { label: "Tungt", genres: "Litterært / eksperimentelt" }
    },
    gauges: {
      directness: {
        label: "Direkthet",
        measures: "Hvor direkte du skriver, ut fra andelen måtesadverb og mulige passiver.",
        raise: [
          "Bytt et svakt verb pluss adverb mot et sterkere verb (løp fort → stormet).",
          "Gjør om en mulig passiv til aktiv (døren ble åpnet av henne → hun åpnet døren)."
        ],
        remember:
          "100 er ikke alltid målet. I drømmeaktige eller atmosfæriske passasjer kan passiver og måtesadverb være det rette valget. La scenen lede."
      },
      pacing: {
        label: "Tempo",
        measures:
          "Hvor mye setningslengden varierer, og om lange linjer stables. En mix av korte og lange holder oftest farten.",
        raise: [
          "Bryt en rekke setninger på {n}+ ord. Klikk på en høy stolpe for å granske en.",
          "Følg en lang linje med et kort treff, eller omvendt.",
          "Hvis hver setning er like lang, varier én."
        ],
        remember:
          "Jevn, knallhard prosa kan være poenget — en slåsskamp, en jakt, dialog. Et sveipende avsnitt kan også være det. Dette flagger en monoton eller en stabel lange linjer, ikke en sjanger."
      },
      vocabulary: {
        label: "Vokabular",
        measures: "Balansen mellom kjente ord og uvanlige. Navn i Story Bible telles ikke med.",
        raise: [
          "Hvis prosaen bare har vanlige ord, gjør et presist substantiv eller verb ofte mer enn en rekke adjektiv.",
          "Hvis uvanlige ord hoper seg opp, bytt noen mot enklere — med mindre akkurat den diksjonen er forfatterstemmen.",
          "Merk i teksten viser ord utenfor Dale–Challs kjente liste."
        ],
        remember: "Uvanlig kan være poenget. En havnehistorie trenger kai og blindpassasjer. 100 er en mix, ikke et enklere vokabular."
      }
    }
  },
  notes: {
    review: "Gjennomgang",
    title: "Kapittelnotater",
    emptyTitle: "Ingenting å flagge",
    intro:
      "Gjennomgangen prøver å finne linjer som verken viser karakterens personlighet eller driver scenen framover.",
    introReader: "Rett mot {category}, rundt {age} år.",
    paragraph: "Avsnitt {n}",
    note: "Notat",
    clickHint: "Klikk på et notat for å lese sitatet. Notater er ikke omskrivinger.",
    nothingSolid: "Gjennomgangsmodellen fant ingenting solid i denne runden.",
    foot: "Notater flagger et sted. De skriver ikke om kapitlet og rører ikke Story Bible.",
    categories: {
      show_vs_tell: {
        label: "Vis, ikke fortell",
        blurb: "En navngitt følelse der kroppen eller scenen kunne bære den."
      },
      dialogue_purpose: {
        label: "Dialog",
        blurb: "En talt linje som verken viser karakter eller flytter scenen."
      },
      voice_drift: {
        label: "Forfatterstemme",
        blurb: "Registeret gled fra feltet Forfatterstemme."
      },
      character_fidelity: {
        label: "Karakter",
        blurb: "Et slag som sitter mot et låst Story Bible-karaktertrekk."
      },
      child_agency: {
        label: "Handling",
        blurb: "En voksen tar det avgjørende steget. Barnet skal gjøre det."
      },
      lecture: {
        label: "Pekepinn",
        blurb: "En moral som sies av en voksen, ikke tjenes av protagonistens valg."
      }
    }
  },
  history: {
    kicker: "Kapittel",
    title: "Historikk",
    emptyTitle: "Ingen historikk ennå",
    intro:
      "Tidligere versjoner fra utkast, omskriving, forlengelse, utvidelse og omskriv. Gjenopprett hopper til den versjonen. Senere rader blir liggende.",
    empty: "Modellen har ikke skrevet om dette kapittelet ennå.",
    emptyProse: "(tomt)",
    clickHint: "Klikk på en versjon for å lese den, og Gjenopprett for å legge den i kapittelet.",
    restore: "Gjenopprett",
    compare: "Sammenlign",
    compareHint: "Klikk på en annen versjon for å sammenligne med denne. Gjenopprett bruker fortsatt den valgte versjonen.",
    comparePair: "{from} → {to}",
    live: "Kapittelet nå",
    same: "Disse to er like.",
    fromOnly: "Bare i denne teksten, det du mister hvis du gjenoppretter",
    toOnly: "Bare i denne teksten, det du får hvis du gjenoppretter",
    foot: "Listen er ikke angring. Det du skriver selv lagres ikke. Prompter ser bare det aktuelle kapittelet.",
    ops: {
      draft: "Utkast",
      recast: "Omskriving",
      extend: "Forleng",
      elaborate: "Utvid",
      rewrite: "Skriv om",
      beat: "Beat",
      restore: "Gjenopprett",
      format: "Formatering",
      darling: "Yndling"
    }
  },
  markerConvert: {
    nav: "Konverter markeringer",
    heading: "Konverter markeringer til formatering",
    intro:
      "Gjør om tegn som *asterisker* — eller par av åpnings-/avslutningstegn som «smarte anførselstegn» — fra et importert manus til ekte fet skrift, kursiv eller understreking. Markeringene fjernes fra teksten — bare formateringen blir igjen. Lengre markeringer kjøres først, slik at \"**\" ikke tolkes som to enkle \"*\" — legg til begge hvis manuset ditt bruker dem til ulike ting.",
    openLabel: "Åpningstegn",
    openPlaceholder: "f.eks. * eller «",
    closeLabel: "Avslutningstegn",
    closePlaceholder: "f.eks. * eller »",
    becomes: "blir",
    styleLabel: "Stil",
    addRule: "Legg til rad",
    removeRule: "Fjern",
    convertAction: "Konverter hele manuset",
    converting: "Konverterer…",
    resultSummary: "Konverterte {markers} i {chapters}.",
    resultNone: "Ingen markeringer funnet — ingenting å konvertere.",
    markersCount: { one: "{count} markering", other: "{count} markeringer" },
    chaptersCount: { one: "{count} kapittel", other: "{count} kapitler" }
  },
  errors: {
    ollamaOrigins: "Den lokale serveren tok ikke imot nettleseren. Kjører du Ollama? Start den med OLLAMA_ORIGINS=http://localhost:5175. Kjører du LM Studio eller en annen server? Se etter en innstilling for hvilke nettadresser som får koble til (kalles ofte CORS eller allowed origins).",
    noModel: "Ingen lokal modell funnet. Start Ollama eller din lokale server, og last inn på nytt.",
    notJson: "Den filen er ikke JSON.",
    backupUnreadable: "Kunne ikke lese den sikkerhetskopien.",
    shelfUnreadable: "Kunne ikke lese hyllen.",
    recastEmpty: "Skriv eller ta fram litt prosa før du omskriver.",
    extractEmpty: "Skriv eller ta fram litt prosa før du henter ut fakta.",
    analyzeEmpty: "Skriv eller ta fram litt prosa før du analyserer kapitlet.",
    extractorNone: "Ekstraktoren fant ingen uttalte fakta i dette kapitlet.",
    interviewExtractorNone: "Ekstraktoren fant ingen uttalte fakta i denne samtalen.",
    brainstormExtractorNone: "Ekstraktoren fant ingen uttalte fakta i denne lappen.",
    synopsisExtractorNone: "Ekstraktoren fant ingen uttalte fakta i synopsis.",
    briefExtractorNone: "Ekstraktoren fant ingen uttalte fakta i denne brief-en.",
    importLoreNone: "Ekstraktoren fant ingen uttalte fakta i den innlimte teksten.",
    summarizeNone: "Kunne ikke oppsummere dette kapittelet — prøv igjen, eller skriv sammendraget for hånd.",
    proofreadEmpty: "Skriv eller ta fram litt kapittelprosa før korrektur.",
    askManuscriptEmpty: "Skriv eller ta fram litt kapittelprosa før du spør om manuset.",
    askManuscriptNoMatch: "Ingenting i manuset matcher det spørsmålet.",
    serverUrlMissing: "Skriv inn den lokale serverens adresse i Innstillinger.",
    busy: "En annen handling pågår allerede. Vent til den er ferdig, og prøv igjen.",
    timeout: "Den lokale modellen svarte ikke i tide. Den kan fortsatt laste, eller datamaskinen din kan trenge lengre tid enn vanlig — sjekk at den kjører, prøv så igjen.",
    imageChoose: "Velg en bildefil.",
    imageRead: "Kunne ikke lese det bildet.",
    imageAdd: "Kunne ikke legge til det bildet."
  }
};
