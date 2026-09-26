import type { Messages } from "./en";

export const nb: Messages = {
  common: {
    cancel: "Avbryt",
    close: "Lukk",
    stop: "Stopp",
    save: "Lagre",
    copy: "Kopier",
    copied: "Kopiert"
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
    facts: { one: "{count} låst faktum", other: "{count} låste fakta" }
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
    publish: "Publiser",
    settings: "Innstillinger",
    settingsLede:
      "Hvordan dette manuskriptet skrives. Ikke Story Bible. Kapitlene kan fortsatt overstyre kamera, stemme og Leser.",
    proseLanguage: "Prosaens språk",
    proseLanguagePlaceholder: "f.eks. engelsk",
    proseLanguageTitle: "Språket setningene skrives på. Tomt gjetter fra manuskriptet. En skriveinstruksjon, ikke kanon.",
    modelsHeading: "Modeller",
    engineLabel: "Motor",
    engineOllama: "Ollama",
    engineOpenAiCompatible: "LM Studio / annen lokal server",
    engineLede: "Ingen skytjenester eller kontoer, aldri — bare en server som kjører på denne maskinen eller ditt lokale nettverk.",
    baseUrlLabel: "Serveradresse",
    baseUrlPlaceholder: "http://localhost:1234",
    baseUrlLede: "Den lokale adressen LM Studio (eller en annen lokal server, som llama.cpp) lytter på — vises som regel når du starter dens lokale server.",
    historyLimit: "Versjoner per kapittel",
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
    voicePlaceholder: "Tørr, maritim, korte setninger",
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
    newStrand: "ny tråd",
    startChapter: "Start kapittel {n}",
    draft: "Lag utkast",
    extract: "Hent ut fakta",
    extracting: "Henter ut…",
    analyze: "Analyser",
    proofread: "Korrektur",
    notes: "Notater",
    history: "Historikk",
    recast: "Omskriv prosa",
    recasting: "Omskriver…",
    recastTitle: "Omskriv kapitlet til gjeldende perspektiv, tempus og synsvinkel",
    stop: "Stopp",
    ask: "Spør…",
    askTitle: "Spør",
    askBody: "Svaret legges til i notatene dine. Det er ikke kanon, og kapittelutkastet ser det ikke.",
    askPlaceholder: "Hvem er blindpassasjeren? Gi tre alternativer og trykk på det svakeste.",
    askAction: "Spør",
    openSynopsis: "Åpne synopsis",
    maximize: "Maksimer",
    restore: "Gjenopprett",
    maximizeTitle: "Skjul paneler og skriv",
    restoreTitle: "Vis paneler (Esc)",
    brainstormLede:
      "Privat kladd. En lapp per idé. Dra dem fritt — det finnes ingen rekkefølge ennå. Dra en lapp til kolonnen til høyre når den skal bli handling.",
    brainstormPlaceholder:
      "En mystisk blindpassasjer. Som kjenner skipet. Mannskapet gjør det ikke. Tenk om hun er kapteinens søster — eller noen de aldri har møtt?",
    synopsisLede:
      "Historien i kortform: hvem som er med, hva som skjer og hvordan den ender. Utkastene tar alltid utgangspunkt i denne oppsummeringen – men ingenting blir bindende før du fastslår det som fakta.",
    synopsisPlaceholder:
      "Emma har nattnøklene. En fremmed betaler med salt. Til vinteren må hun forlate kaien, ellers tar kanalen baren.",
    chapterPlaceholder: "Kapitlet lever her. Skriv utkast, skriv om til det er ditt.",
    chapterImageAdd: "Legg til kapittelbilde",
    chapterImageReplace: "Bytt bilde",
    chapterImageRemove: "Fjern bilde",
    instructTitle: "Endre dette notatet",
    instructHint: "Si til modellen hva den skal gjøre med det markerte notatet. Bare det spannet byttes ut.",
    instructPlaceholder: "Gi to slutter. Trykk på hvorfor hun blir. Tre navn på blindpassasjeren.",
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
    sendToSynopsis: "Send til synopsis"
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
      ask: "Spør brainstorm",
      "word-swap": "Ordalternativer",
      "sentence-split": "Setningsdeling",
      "paragraph-break": "Avsnittsdeling",
      extract: "Hent fakta",
      analyze: "Analyser",
      illustrate: "Illustrasjonsprompt",
      proofread: "Korrekturlesing",
      "ask-manuscript": "Spør manuset",
      interview: "Karakterintervju",
      develop: "Utviklingsmetode",
      "extract-interview": "Hent ut fakta (intervju)",
      "import-lore": "Importer lore",
      beat: "Skriv en beat"
    }
  },
  askManuscript: {
    nav: "Spør manuset",
    title: "Spør manuset ditt",
    lede: "Still et spørsmål om historien din. Svaret bruker bare det som faktisk er skrevet — med kapitlene det er hentet fra, så du selv kan sjekke det.",
    placeholder: "Hvor møttes Henrik og Elin første gang?",
    action: "Spør",
    asking: "Spør…",
    answerHeading: "Svar",
    sourcesHeading: "Kilder",
    jumpToChapter: "Åpne «{chapter}»",
    empty: "Still et spørsmål om manuset ditt, så vises svaret her, sammen med kildene."
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
    personalityLabel: "Personlighet for denne samtalen — prøv deg fram, lagre til profilen når tonen føles riktig",
    personalityPlaceholder: "F.eks. \"Kort og fåmælt, ser alltid problemet først\"",
    personalitySave: "Lagre til profilen"
  },
  timeline: {
    nav: "Tidslinje",
    title: "Tidslinje",
    lede: "Leserekkefølgen er ikke alltid når ting skjer. Gi et kapittel en tidsnotat og flytt det for å se hvor det egentlig hører hjemme, sammenlignet med hvor det ligger i manuset.",
    readingPosition: "Manusposisjon {n}",
    storyTimePlaceholder: "Når skjer dette? F.eks. «Tre år tidligere»",
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
    emptyChapters: "Skriv et kapittel først — matrisen trenger noe å vise."
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
    quickstartStepsHeading: "Slik jobber du med StoryBook AI",
    quickstartSteps: [
      {
        heading: "1. Start manuskriptet ditt",
        body: "Skriv en tittel i feltet «Start nytt manuskript» på forsiden og trykk Opprett — det er alt som trengs. Du havner rett i Idémyldring: et privat skisserom uten noe å stille inn, der du skriver ned idéer i ditt eget tempo."
      },
      {
        heading: "2. Skriv",
        body: "Dra idéene som er klare til Synopsis — formen på hele historien. Åpne så et kapittel og trykk Lag utkast: modellen skriver ut fra ditt Synopsis, din Story Bible og kapittelets egen instruks. Ingenting den skriver blir låst sannhet før du sier ifra — skriv det om, bytt kamera, eller be om en analyse når som helst."
      }
    ],
    howHeading: "Slik er appen bygd opp",
    sections: [
      {
        heading: "Et helt lukket digitalt pengeskap",
        body: "StoryBook AI er bygget rundt én regel: manuset ditt er din eiendom, og det skal aldri forlate datamaskinen din. Det finnes ingen vei ut til internett i appen — ingen API-nøkler til ChatGPT, Claude eller andre skytjenester (det er ikke en manglende funksjon, men et bevisst valg), ingen oppdateringssjekker mot GitHub, og skriftene følger med i appen i stedet for å hentes utenfra. Teksten din lever bare lokalt i nettleseren, og AI-modellen kjører bare på din egen prosessor. Uansett hva du skriver — dagbok, forretningshemmeligheter eller det neste store fantasy-eposet — blir hver bokstav hos deg."
      },
      {
        heading: "Forfatteren vinner alltid over AI-en",
        body: "Modellen foreslår, du bestemmer. En detalj modellen finner på i prosaen forblir et forslag — vist med en lett stiplet understrek — til du låser den i Story Bible. Ingenting blir kanon av seg selv."
      },
      {
        heading: "Idémyldring & Synopsis",
        body: "Idémyldring er din private oppslagstavle — kladdepapir eller en tavle med post-it-lapper, ett notat per idé, dragbart, ingen rekkefølge kreves. Lag utkast lener seg aldri på et notat du ikke har løftet over til Synopsis. (Spør du modellen om notatene dine, eller ber den forlenge eller utdype et av dem, leser den selvsagt det du spør om — men ingenting derfra blir kanon eller lekker inn i kapittelskrivingen av seg selv.) Løft ideene som holder mål over til Synopsis: formen på hele boken, i noen setninger. Det er dette AI-modellen lener seg på når den senere hjelper deg å skrive kapitler."
      },
      {
        heading: "Kapitler: Lag utkast, Omskriv, Analyser",
        body: "Lag utkast skriver ny prosa ut fra det som allerede er etablert. Omskriv skriver om samme kapittel i et annet perspektiv eller tempus, med samme hendelser. Analyser gjennomgår et kapittel for vanlige skriveproblemer uten å skrive om en eneste linje — for eksempel å \"fortelle\" i stedet for å vise (i stedet for \"Lisa var rasende\" foreslår den kanskje \"Lisa smalt igjen døren så kaffekoppene skalv\"), fyll-dialog, eller et trekk som kolliderer med et låst karaktertrekk. Leser (i Innstillinger, og per kapittel) angir hvem teksten skrives for — Pekebok til Voksen — slik at setningslengde og ordvalg passer den alderen. Under teksten veksler Sjeldne ord og Klisjeer mellom to valgfrie markeringer — uvanlige ord for den leseren, og formuleringer som høres AI-skrevne ut (\"et bevis på\", overbrukte tankestreker) — én om gangen, avslått som standard."
      },
      {
        heading: "Scener",
        body: "Et langt kapittel kan deles opp i scener — velg hvor en slutter og neste begynner, gi den navn, legg til et kort notat. Når et kapittel har scener, kan Lag utkast, Omskriv og Analyser hver for seg rettes mot bare én av dem."
      },
      {
        heading: "Story Bible",
        body: "Den ene sannhetskilden for historiens fakta — hvem noen er, hvor et sted ligger, hva et navn betyr. Et faktum starter som et forslag, fra deg eller fra en ekstraksjon, og blir bare låst sannhet når du godkjenner det. Låste fakta er det modellen får vite at den ikke får motsi — motsier et nytt forslag et allerede låst faktum (for eksempel at noen plutselig har brune øyne når du har låst blå), blir det flagget ekstra tydelig i gjennomgangskøen. Åpne et karakterkort og trykk Intervju for å chatte med dem, i deres egen stemme, bygget bare på det som til nå er låst — en måte å høre stemmen på og oppdage hull, ikke skape ny kanon. Sier de noe verdt å ta vare på, trykk Hent ut fakta for å foreslå det til Story Bible — samme gjennomgangskø som all annen ekstraksjon, ingenting legges til før du godkjenner. Ctrl-klikk (Cmd-klikk på Mac) på et navn du kjenner igjen hvor som helst i teksten for å hoppe rett til kortet — et vanlig klikk plasserer bare markøren der, som vanlig."
      },
      {
        heading: "Kontinuitetsvarsler",
        body: "Når et kapittel kan se et faktum som først ble etablert senere i manuskriptet, blir det flagget — ikke nødvendigvis feil, kanskje er det et tilbakeblikk, bare verdt en rask sjekk. Korrekturlesing går lenger: den sjekker en persons eller en gjenstands registrerte sted gjennom hele historien, i historiens egen tidsrekkefølge, og flagger en forflytning som ser umulig eller uforklart ut gitt hvor mye tid som har gått."
      },
      {
        heading: "Tidslinje",
        body: "Leserekkefølge og historiens egen tidsrekkefølge er ikke alltid det samme. Gi et kapittel et tidsnotat, og se hvordan boken faller når den sorteres etter når ting faktisk skjer, ved siden av hvor det ligger i manuskriptet."
      },
      {
        heading: "Tråder (Plotlines)",
        body: "Hold styr på hvilken tråd som går gjennom hvilket kapittel i en tabell, så en tråd som har vært stille i ti kapitler er lett å oppdage."
      },
      {
        heading: "Utviklingsmetode",
        body: "En valgfri, ferdig serie steg for å la en gnist vokse til en form — Snowflake, Three-Act Structure, Save the Cat eller Hero's Journey. Den beholder aldri noe eget: en vendepunktbasert metodes vendepunkter blir tråder i Tråder, og Snowflakes steg skriver rett inn i Synopsis, akkurat som enhver annen notat du sender dit. Å bytte metode, eller velge ingen, sletter aldri noe som allerede finnes i noen av dem."
      },
      {
        heading: "Korrekturlesing",
        body: "En siste gjennomgang av hele manuskriptet: grammatikk, gjentatte scener, stil- og stemningsdrift mellom kapitler, alderstilpasning, en kontinuitetssjekk, et søk etter plantede detaljer som aldri innfris (en pistol som vises i kapittel 4, men som ingen noensinne avfyrer), og en faktasjekk mot hele boken. Når Leser er satt til et barne- eller ungdomsnivå, flagger den også banning, vold eller eksplisitt innhold som ikke passer den alderen. Bare notater — ingenting skrives om for deg. Den pauser og gjenopptar, og sjekker bare på nytt det som faktisk har endret seg."
      },
      {
        heading: "Spør manuskriptet",
        body: "Still et spørsmål om din egen historie og få et svar bygget bare på det som faktisk er skrevet — med kapitlene det kom fra, så du kan sjekke det selv."
      },
      {
        heading: "Publiser",
        body: "Eksporter en ren lesekopi — Markdown, RTF, ODT, HTML, ePub eller PDF. Idémyldring forlater aldri boken; bare selve manuskriptet gjør det."
      }
    ],
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
        heading: "Kan jeg bruke en betalt AI-tjeneste i stedet?",
        body: "Nei — med vilje. StoryBook AI snakker bare noensinne med en modell som kjører på din egen datamaskin eller nettverk. Det er ikke en manglende funksjon; det er hele poenget: manuskriptet ditt trenger aldri å forlate maskinen din."
      }
    ]
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
    action: "Publiser",
    markdown: "Markdown",
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
    action: "Søk",
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
    review: "Gjennomgang",
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
    nothingMatches: "Ingenting matcher.",
    hidden: "Skjult",
    name: "Navn",
    close: "Lukk",
    reviewBody: "Foreslåtte rader i Story Bible. Gjør dem tydeligere, lås — eller avvis.",
    hideFromDraft: "Skjul for utkast",
    interview: "Intervju",
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
    claimPlaceholder: "Påstanden, på én linje",
    lockInto: "Lås til Story Bible",
    addChoiceTitle: "Erstatt eller legg til?",
    addChoiceBody: "Feltet {predicate} har allerede “{existing}”. Skal den nye teksten erstatte den, eller ligge ved siden av som enda en {predicate}-rad?",
    addChoiceKeepBoth: "Legg til som enda en",
    addChoiceReplace: "Erstatt den eksisterende",
    history: "Historikk",
    historyCurrent: "nå",
    asOfLabel: "Vis Story Bible slik den var ved",
    asOfNow: "Nåtiden",
    asOfBanner: "Viser Story Bible slik den var ved «{chapter}» — skrivebeskyttet.",
    asOfBack: "Tilbake til nåtiden",
    asOfEntityLede: "Slik det sto ved «{chapter}».",
    mentions: "Omtaler",
    mentionsAside: "(Hvert kapittel som nevner denne entiteten i prosaen.)",
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
    tagsPlaceholder: "middelaldrende, dobbel natur",
    personality: "Personlighet",
    personalityPlaceholder: "Hvordan de pleier å være",
    namePlaceholder: "Navn",
    factText: "Faktatekst",
    conflictsWith: "Kolliderer med: {value}",
    similarTo: "Ligner: {value} — ser ut som samme fakta, bare mer detaljert",
    lock: "Lås",
    merge: "Slå sammen",
    reject: "Avvis",
    show: "Vis",
    hide: "Skjul",
    showClaim: "Vis denne påstanden for utkast",
    hideClaim: "Skjul denne påstanden for utkast",
    positionOverrideAuto: "Auto",
    positionOverrideInclude: "Alltid med",
    positionOverrideExclude: "Aldri med",
    positionOverrideToInclude: "Inkluder alltid i Lag utkast, uansett kapittelets posisjon i story-tiden",
    positionOverrideToExclude: "Utelat alltid fra Lag utkast, uansett kapittelets posisjon i story-tiden",
    positionOverrideToAuto: "Gå tilbake til automatisk posisjonering (styres av story-tiden)",
    edit: "Rediger",
    editFact: "Rediger fakta",
    save: "Lagre",
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
    beatPlaceholder: "Hun åpner brevet og leser den første linjen høyt.",
    beatAction: "Skriv beaten",
    rewriteMenu: "Skriv om…",
    illustrate: "Illustrasjonsprompt…",
    lift: "Løft til synopsis",
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
    rewritePlaceholder: "Kortere. Mer spenning. I Emmas stemme. Skjær bort metaforen.",
    rewriteAction: "Skriv om",
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
      restore: "Gjenopprett"
    }
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
    importLoreNone: "Ekstraktoren fant ingen uttalte fakta i den innlimte teksten.",
    proofreadEmpty: "Skriv eller ta fram litt kapittelprosa før korrektur.",
    askManuscriptEmpty: "Skriv eller ta fram litt kapittelprosa før du spør om manuset.",
    askManuscriptNoMatch: "Ingenting i manuset matcher det spørsmålet.",
    serverUrlMissing: "Skriv inn den lokale serverens adresse i Innstillinger.",
    imageChoose: "Velg en bildefil.",
    imageRead: "Kunne ikke lese det bildet.",
    imageAdd: "Kunne ikke legge til det bildet."
  }
};
