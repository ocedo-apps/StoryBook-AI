export const en = {
  common: {
    cancel: "Cancel",
    close: "Close",
    stop: "Stop",
    save: "Save"
  },
  app: {
    crash: "The app hit an error.",
    tryAgain: "Try again",
    missingRoot: "Missing #root element"
  },
  chrome: {
    language: "Language",
    light: "Light",
    dark: "Dark",
    lightTitle: "Use a light page",
    darkTitle: "Use a dark page"
  },
  home: {
    headline: "Write the prose.",
    truth: "The Story Bible holds truth.",
    lede:
      "A local manuscript tool. Title the book, grow the story in Brainstorm, and lift a Synopsis when it is ready. The model drafts the chapters — you decide.",
    newManuscript: "New manuscript",
    titlePlaceholder: "Title",
    open: "Open",
    importBackup: "Import backup",
    shelf: "Manuscripts",
    emptyShelf: "No manuscripts yet. A title is enough to start.",
    delete: "Delete",
    deleteConfirm: "Delete “{title}”? This cannot be undone.",
    replaceConfirm: "Replace “{title}” with this backup? Anything written since that backup will be lost.",
    chapters: { one: "{count} chapter", other: "{count} chapters" },
    facts: { one: "{count} locked fact", other: "{count} locked facts" }
  },
  editor: {
    allManuscripts: "All manuscripts",
    manuscriptTitle: "Manuscript title",
    writing: "Writing",
    review: "Review",
    noModels: "No Ollama models",
    backup: "Backup",
    backupDue: "! Backup",
    backupDueTitle: "This manuscript has changed since the last JSON backup",
    backupTitle: "Backup",
    export: "Export",
    brainstorm: "Brainstorm",
    synopsis: "Synopsis",
    briefs: "Briefs",
    briefsLede:
      "Each card is a chapter. Drag a card and it follows your pointer; the others slide aside. Double-click a title to write that chapter.",
    reorderBriefs: "Chapter briefs. Drag to change order.",
    openChapter: "Write {title}",
    chapters: "Chapters",
    add: "Add",
    untitled: "Untitled",
    removeChapter: "Remove {title}",
    removeChapterFallback: "chapter",
    discardChapterConfirm: "Move “{title}” to Discarded chapters?",
    discardedChapters: "Discarded chapters",
    restoreChapter: "Restore {title}",
    restoreDiscarded: "Restore",
    throwAwayChapter: "Throw away {title}",
    throwAwayConfirm: "Throw away “{title}”? The chapter will be gone. This cannot be undone.",
    reorderChapters: "Chapters. Drag to change order.",
    showBrief: "Show brief for {title}",
    hideBrief: "Hide brief for {title}",
    continuesCleared:
      "{title} no longer continues from “{from}”, because that chapter now comes later. It follows the previous chapter in the list.",
    voice: "Voice",
    voicePlaceholder: "Dry, maritime, short sentences",
    chapterVoiceInherit: "Manuscript voice",
    manuscript: "Manuscript",
    brief: "Brief",
    briefPlaceholder: "What this chapter must do. A writing instruction, not canon.",
    chapterTitle: "Chapter title",
    chapterBrief: "Chapter brief",
    chapterVoice: "Chapter voice",
    voiceCue: "Voice",
    reader: "Reader",
    readerPlaceholder: "Age",
    readerTitle: "Who the prose is for. Empty keeps today’s adult baseline.",
    readerCategories: {
      board: "Board book",
      early: "Early reader",
      chapter: "Chapter book",
      middle: "Middle grade",
      ya: "YA",
      adult: "Adult"
    },
    chapterReader: "Chapter reader",
    chapterReaderInherit: "{age} (manuscript)",
    readerCue: "Reader",
    newStrand: "new strand",
    startChapter: "Start Chapter {n}",
    draft: "Draft",
    extract: "Extract facts",
    extracting: "Extracting…",
    analyze: "Analyze",
    notes: "Notes",
    recast: "Recast prose",
    recasting: "Recasting…",
    recastTitle: "Rewrite this chapter to the current POV, tense, and viewpoint",
    stop: "Stop",
    ask: "Ask…",
    askTitle: "Ask",
    askBody: "The reply is appended to your notes. It is not canon, and chapter draft will not see it.",
    askPlaceholder: "Who is the stowaway? Give me three options and press on the weakest.",
    askAction: "Ask",
    openSynopsis: "Open synopsis",
    maximize: "Maximize",
    restore: "Restore",
    maximizeTitle: "Hide panels and write",
    restoreTitle: "Restore panels (Esc)",
    brainstormLede:
      "Private scratch. One note per idea. Drag them anywhere — there is no order yet. Drag a note into the send column when it should become plot.",
    brainstormPlaceholder:
      "A mysterious stowaway. Who knows the ship. The crew does not. What if she is the captain’s sister — or no one they have met?",
    synopsisLede:
      "The story in a nutshell: who’s involved, what happens, and how it ends. Drafts are always based on this summary — but nothing becomes set in stone until you finalise it as fact.",
    synopsisPlaceholder:
      "Emma keeps the night keys. A stranger pays in salt. By winter she has to leave the quay, or the canal takes the bar.",
    chapterPlaceholder: "The chapter lives here. Draft, then rewrite until it is yours.",
    instructTitle: "Change this note",
    instructHint: "Tell the model what to do with the marked note. Only that span is replaced.",
    instructPlaceholder: "Give me two endings. Press on why she stays. Three names for the stowaway.",
    instructAction: "Rewrite",
    addNote: "New note",
    removeNote: "Remove note",
    removeNoteConfirm: "Throw away this note?",
    noteLabel: "Brainstorm note",
    reorderNotes: "Drag to move this note",
    noteColor: "Note colour",
    noteColors: {
      paper: "Paper",
      rust: "Rust",
      sage: "Sage",
      gold: "Gold",
      lilac: "Lilac"
    },
    sendLane: "To synopsis",
    sendLaneLede: "Drop notes here. Order in this column is the order they land as paragraphs.",
    sendLaneEmpty: "Drop notes here",
    sendToSynopsis: "Send to synopsis"
  },
  backup: {
    title: "Backup",
    body: "A JSON copy this app can read back. Import backup on the shelf restores it. Anything written since that file will be lost.",
    whatHappened: "What happened",
    whatHappenedPlaceholder: "Optional. Recast chapter 2, new Voice on 3.",
    documentName: "Document name",
    action: "Backup",
    errors: {
      "not-backup": "That file is not a manuscript backup.",
      "sandbox-export": "That file is a Sandbox card export. Import it in Sandbox, not here.",
      "not-manuscript": "That file is not a StoryBook manuscript backup.",
      "newer-format": "This backup is from a newer StoryBook. Update the app, then try again.",
      unreadable: "The manuscript inside this file could not be read."
    }
  },
  export: {
    title: "Export",
    body: "A readable copy of the story. Leaves brainstorm out. RTF and ODT open in Scrivener.",
    documentName: "Document name",
    markdown: "Markdown",
    rtf: "RTF",
    odt: "ODT"
  },
  find: {
    action: "Find",
    title: "Find & replace",
    body: "Matches light up in the text. Arrows jump to the next or previous. Story Bible stays. Brainstorm stays unless you include it.",
    find: "Find",
    replaceWith: "Replace with",
    matchCase: "Match case",
    wholeWord: "Whole word",
    includeBrainstorm: "Include brainstorm",
    here: "This page",
    none: "Nothing matches.",
    hits: { one: "{count} match", other: "{count} matches" },
    snippetHint: "The lines under a heading are the word with the text around it. The search window covers the page, so the places are listed here.",
    moreSnippets: "And {count} more in this place.",
    fields: {
      title: "Title",
      brief: "Brief",
      voice: "Voice",
      viewpoint: "Viewpoint"
    },
    replace: "Replace",
    replaceCount: "Replace {count}",
    showHit: "Show {place}",
    untitled: "Untitled",
    prev: "Previous match",
    next: "Next match",
    position: "{current} of {total}"
  },
  craft: {
    pov: "POV",
    povAria: "Point of view",
    chapterPov: "Chapter point of view",
    tense: "Tense",
    tenseAria: "Tense",
    chapterTense: "Chapter tense",
    viewpoint: "Viewpoint",
    viewpointPlaceholder: "Whose head?",
    viewpointAria: "Viewpoint character",
    chapterViewpoint: "Chapter viewpoint character",
    viewpointInherit: "{name} (manuscript)",
    usual: "Usual",
    more: "More",
    inheritPov: "Manuscript · {label}",
    inheritTense: "Manuscript · {label}",
    continuesFrom: "Continues from",
    previousChapter: "Previous chapter",
    previousChapterNamed: "Previous chapter · {label}",
    noneStrand: "None · new strand",
    modes: {
      limited: "3rd limited",
      first: "1st person",
      omniscient: "3rd omniscient",
      objective: "3rd objective",
      second: "2nd person"
    },
    tenses: {
      past: "Past",
      present: "Present"
    }
  },
  bible: {
    title: "Story Bible",
    search: "Search Story Bible",
    searchPlaceholder: "Find a name or claim",
    shelves: "Story Bible shelves",
    review: "Review",
    reviewCount: "Review · {count}",
    lockedCount: "{count} locked",
    exportCards: "Export cards",
    exportCardsTitle: "Download characters, places, and objects for Sandbox",
    nothingMatches: "Nothing matches.",
    hidden: "Hidden",
    name: "Name",
    close: "Close",
    reviewBody: "Proposed Story Bible rows. Thicken them, then lock — or reject.",
    hideFromDraft: "Hide from Draft",
    showToDraft: "Show to Draft",
    hiddenNote: "The model cannot see this card until you show it again.",
    thisIsA: "This is a",
    pictures: "Pictures",
    picturesAside: "(For later export. Draft never sees these.)",
    removePicture: "Remove picture {n}",
    addImage: "Add image",
    addingImage: "Adding image",
    addFact: "Add fact",
    claimPlaceholder: "The claim, in one line",
    lockInto: "Lock into Story Bible",
    replaceTitle: "Replace in manuscript?",
    replaceBody: "Replace “{from}” with “{to}” in {places}. Brainstorm is left alone.",
    places: { one: "{count} place", other: "{count} places" },
    keepTexts: "Keep texts",
    replace: "Replace",
    pronoun: "Pronoun",
    age: "Approximate age",
    looks: "Looks",
    looksPlaceholder: "Body and face. Not clothes.",
    tags: "Tags",
    tagsAside: "(Shelf only. Draft never sees these.)",
    tagsPlaceholder: "middle-aged, double nature",
    personality: "Personality",
    personalityPlaceholder: "How they tend to be",
    namePlaceholder: "Name",
    factText: "Fact text",
    conflictsWith: "Conflicts with: {value}",
    lock: "Lock",
    reject: "Reject",
    show: "Show",
    hide: "Hide",
    showClaim: "Show this claim to Draft",
    hideClaim: "Hide this claim from Draft",
    edit: "Edit",
    editFact: "Edit fact",
    save: "Save",
    kinds: {
      characters: "Characters",
      locations: "Locations",
      objects: "Objects",
      groups: "Groups",
      events: "Events"
    },
    singular: {
      characters: "Character",
      locations: "Location",
      objects: "Object",
      groups: "Group",
      events: "Event"
    },
    newLabel: {
      characters: "New character",
      locations: "New location",
      objects: "New object",
      groups: "New group",
      events: "New event"
    },
    empty: {
      characters: "No characters yet.",
      locations: "No locations yet.",
      objects: "No objects yet.",
      groups: "No groups yet.",
      events: "No events yet."
    },
    predicates: {
      "core.identity": "Identity",
      "core.trait": "Trait",
      "core.place": "Place",
      "core.object": "Object",
      "core.group": "Group",
      "core.relationship": "Relationship",
      "core.event": "Event"
    },
    pronouns: {
      she: "She",
      he: "He",
      it: "It"
    }
  },
  canvas: {
    extend: "Extend",
    elaborate: "Elaborate",
    rewriteMenu: "Rewrite…",
    lift: "Lift to synopsis",
    manual: "Manual Edit",
    insteadOf: "Instead of “{word}”",
    looking: "Looking…",
    noAlts: "No alternatives this time.",
    retry: "Retry",
    manualTitle: "Manual Edit",
    manualBody: "Rewrite only the marked passage. The rest of the text stays put.",
    apply: "Apply",
    rewriteTitle: "Rewrite",
    rewriteHint: "Tell the model how to change the marked passage. Only that span is replaced.",
    rewritePlaceholder: "Shorter. More tension. In Emma’s voice. Cut the metaphor.",
    rewriteAction: "Rewrite"
  },
  stats: {
    label: "Stats",
    wordsShort: { one: "{count} word", other: "{count} words" },
    rareOn: "Rare on",
    rareOff: "Rare off",
    rareOnTitle: "Hide uncommon words",
    rareOffTitle: "Mark uncommon words",
    title: "How it reads",
    emptyTitle: "No prose yet",
    writeSome: "Write some prose to see how it reads.",
    sentence: "Sentence {n} · {words}",
    alreadyShort: "Already short.",
    suggestSplit: "Suggest a split",
    looking: "Looking…",
    noSplit: "No split this time.",
    split: "Split",
    editSplit: "Edit split",
    useSplit: "Use this split",
    paragraph: "Paragraph {n} · {words}",
    packedHint: "Action, a long look back, and stacked senses in this block.",
    suggestBreak: "Suggest a break",
    noBreak: "No break this time.",
    break: "Break",
    editBreak: "Edit paragraph break",
    useBreak: "Use this break",
    clickBar: "Click a bar to read that sentence.",
    mixedFocus: "Mixed focus",
    mixedOne: "This block mixes present action, a long look back, and stacked senses.",
    mixedMany: "These blocks mix present action, a long look back, and stacked senses.",
    echo: "Echo",
    echoBody: "The same word or phrase repeats in a short span. A refrain can be the point.",
    povLeak: "POV leak",
    foot: "{words} words · {sentences} sentences · {spoken}% spoken",
    highlight: "Highlight in text",
    keepHighlight: "Keep highlighting",
    measures: "What this measures",
    raise: "How to raise it",
    remember: "Remember",
    longSentences: "{n}+ words",
    rareList: "Off the familiar list",
    hideGauge: "Hide this gauge.",
    aboutGauge: "About this gauge.",
    gaugeAria: "{label} {score}. {detail}",
    sparkTitle: "{count} words",
    sparkAria: "Sentence {n}, {count} words",
    leakObjective: "These lines look like thought. Objective only shows what a camera would see. A candidate, not a verdict.",
    leakFirstNamed: "These lines look like a mind other than {who}. A candidate, not a verdict.",
    leakOther: "These lines look like another mind. A candidate, not a verdict.",
    leakLimitedNamed: "Limited to {who} — these lines look like another mind. A candidate, not a verdict.",
    directnessReadout:
      "{adverbs} -ly / 1k · {passives} possible passives / 1k · start at 100, minus those two.",
    pacingSpanSame: "{count} words each",
    pacingSpanRange: "{min}–{max} words",
    pacingReadout:
      "{mix} · {mean} words typical · {span}. Variation raises it; a stack of {n}+ lines or a monotone lowers it.",
    vocabularyReadout: "{share}% uncommon · variety {ttr}. A mix scores higher than all-plain or all-rare.",
    vocabularyReadoutKid: "{share}% uncommon · variety {ttr}. Familiar words score higher for this reader.",
    mix: {
      mixed: "Mixed",
      choppy: "Short & even",
      sweeping: "Long & even",
      even: "Steady"
    },
    profiles: {
      empty: { label: "No prose yet", genres: "" },
      short: { label: "Too short to score", genres: "Write a little more" },
      breezy: { label: "Fast & breezy", genres: "Thriller / YA" },
      brisk: { label: "Brisk", genres: "Adventure / romance" },
      balanced: { label: "Balanced", genres: "General fiction" },
      atmospheric: { label: "Dense & atmospheric", genres: "Literary / epic fantasy" },
      heavy: { label: "Heavy", genres: "Literary / experimental" }
    },
    gauges: {
      directness: {
        label: "Directness",
        measures: "How directly you write, from the share of manner-adverbs and possible passives.",
        raise: [
          "Swap a weak verb plus adverb for a stronger verb (ran quickly → rushed).",
          "Recast a possible passive as an active (the door was opened by her → she opened the door)."
        ],
        remember:
          "100 is not always the aim. In dreamlike or atmospheric passages, passives and manner-adverbs can be the right choice. Let the scene lead."
      },
      pacing: {
        label: "Pacing",
        measures:
          "How much sentence length varies, and whether long lines stack. A mix of short and long usually keeps momentum.",
        raise: [
          "Break a run of {n}+ word sentences. Click a tall bar to inspect one.",
          "Follow a long line with a short hit, or the other way around.",
          "If every sentence is the same length, vary one."
        ],
        remember:
          "Even, punchy prose can be the point — a fight, a chase, dialogue. A sweeping passage can be too. This flags a monotone or a stack of long lines, not a genre."
      },
      vocabulary: {
        label: "Vocabulary",
        measures: "The balance of familiar words and uncommon ones. Names in the Story Bible are left out.",
        raise: [
          "If the prose is all common words, one precise noun or verb often does more than a string of adjectives.",
          "If uncommon words pile up, swap a few for plainer ones — unless that diction is the voice.",
          "Highlight in text marks words off the Dale–Chall familiar list."
        ],
        remember: "Unusual can be the point. A harbour story needs quay and stowaway. 100 is a mix, not a simpler vocabulary."
      }
    }
  },
  notes: {
    review: "Review",
    title: "Chapter notes",
    emptyTitle: "Nothing to flag",
    intro:
      "The review tries to find lines that neither reveal the character’s personality nor drive the scene forward.",
    introReader: "Aimed at {category} readers about {age}.",
    paragraph: "Paragraph {n}",
    note: "Note",
    clickHint: "Click a note to read the quote. Notes are not rewrites.",
    nothingSolid: "The Review model found nothing solid in this pass.",
    foot: "Notes flag a spot. They do not rewrite the chapter or touch the Story Bible.",
    categories: {
      show_vs_tell: {
        label: "Show vs tell",
        blurb: "A named feeling where the body or the scene could carry it."
      },
      dialogue_purpose: {
        label: "Dialogue",
        blurb: "A spoken line that neither reveals character nor moves the scene."
      },
      voice_drift: {
        label: "Voice",
        blurb: "The register slipped from the Voice field."
      },
      character_fidelity: {
        label: "Character",
        blurb: "A beat that sits against a locked Story Bible trait."
      },
      child_agency: {
        label: "Agency",
        blurb: "An adult makes the decisive move. The child should."
      },
      lecture: {
        label: "Lecture",
        blurb: "A moral stated by an adult, not earned by the protagonist’s choice."
      }
    }
  },
  errors: {
    ollamaOrigins: "Ollama did not accept the browser. Start it with OLLAMA_ORIGINS=http://localhost:5175",
    noModel: "No local model. Start Ollama, then reload.",
    notJson: "That file is not JSON.",
    backupUnreadable: "Could not read that backup.",
    shelfUnreadable: "Could not read the shelf.",
    recastEmpty: "Write or draft some prose before recasting the camera.",
    extractEmpty: "Write or draft some prose before extracting facts.",
    analyzeEmpty: "Write or draft some prose before analyzing the chapter.",
    extractorNone: "Extractor found no stated facts in this chapter.",
    imageChoose: "Choose an image file.",
    imageRead: "Could not read that image.",
    imageAdd: "Could not add that image."
  }
};

export type Messages = typeof en;
