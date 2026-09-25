export const en = {
  common: {
    cancel: "Cancel",
    close: "Close",
    stop: "Stop",
    save: "Save",
    copy: "Copy",
    copied: "Copied"
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
    primer: "Primer",
    primerTitle: "Start prompt for this writing model",
    primerLede: "This goes out before every writing job. The chapter rules still follow. Empty means those rules only.",
    primerRestore: "Use start prompt",
    primerAria: "Start prompt for {model}",
    review: "Review",
    noModels: "No local models found",
    backup: "Backup",
    backupDue: "! Backup",
    backupDueTitle: "This manuscript has changed since the last JSON backup",
    backupTitle: "Backup",
    publish: "Publish",
    settings: "Settings",
    settingsLede:
      "How this manuscript is written. Not Story Bible. Chapters can still override camera, Voice, and Reader.",
    proseLanguage: "Prose language",
    proseLanguagePlaceholder: "e.g. English",
    proseLanguageTitle: "The language the sentences are written in. Empty infers from the manuscript. A writing instruction, not canon.",
    modelsHeading: "Models",
    engineLabel: "Engine",
    engineOllama: "Ollama",
    engineOpenAiCompatible: "LM Studio / other local server",
    engineLede: "No cloud accounts or subscriptions, ever — only a server running on this computer or your local network.",
    baseUrlLabel: "Server address",
    baseUrlPlaceholder: "http://localhost:1234",
    baseUrlLede: "The local address LM Studio (or another local server, such as llama.cpp) is listening on — usually shown when you start its local server.",
    historyLimit: "Versions per chapter",
    historyLimitLede:
      "How many earlier versions of a chapter are kept, going back through Draft, Recast, Extend, Elaborate, and Rewrite. Once you go over the limit, the oldest version is dropped first. Typing on your own doesn't create a version — only those actions do.",
    uiLanguageStays: "The page language stays in the header.",
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
    readerTitle: "Who this is written for. Pick the closest age group — Adult writes with no age limits in mind.",
    readerTierHint:
      "Chapters written for this reader use shorter sentences and simpler words, matched to the age group. Proofread will also flag swearing, violence, or explicit content that does not fit that age.",
    readerCategories: {
      board: "Board book (up to age 3)",
      early: "Early reader (ages 4–7)",
      chapter: "Chapter book (ages 8–9)",
      middle: "Middle grade (ages 10–12)",
      ya: "YA (ages 13–17)",
      adult: "Adult"
    },
    chapterReader: "Chapter reader",
    chapterSettingsToggle: "Chapter settings",
    chapterReaderInheritOption: "Same as manuscript — {category}",
    readerCue: "Reader",
    newStrand: "new strand",
    startChapter: "Start Chapter {n}",
    draft: "Draft",
    extract: "Extract facts",
    extracting: "Extracting…",
    analyze: "Analyze",
    proofread: "Proofread",
    notes: "Notes",
    history: "History",
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
    chapterImageAdd: "Add chapter illustration",
    chapterImageReplace: "Replace image",
    chapterImageRemove: "Remove image",
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
  illustration: {
    fieldLabel: "Illustration style",
    browseLibrary: "Browse library…",
    libraryTitle: "Illustration styles",
    searchPlaceholder: "Search styles…",
    searchResults: "Search results",
    saveCurrentAsNew: "Save current text as new style",
    select: "Use this style",
    edit: "Edit",
    delete: "Delete",
    untagged: "Untagged",
    noResults: "No styles match.",
    newStyleTitle: "New style",
    editStyleTitle: "Edit style",
    nameLabel: "Name",
    promptTextLabel: "Prompt text",
    genreTagsLabel: "Genre tags",
    genreTagsPlaceholder: "Comma-separated, e.g. Fantasy, Adventure",
    exampleImageLabel: "Example image",
    uploadImage: "Upload image",
    replaceImage: "Replace image",
    removeImage: "Remove image",
    deleteConfirm: "Delete “{name}” from the library? This can’t be undone.",
    promptTitle: "Illustration prompt",
    promptHint: "Generated from the passage, locked Story Bible facts, and the manuscript’s illustration style.",
    generating: "Generating…",
    generateError: "Couldn’t generate a prompt this time.",
    viewFullImage: "View full image",
    noStyleSelected: "No style selected",
    customStyleLabel: "Custom prompt",
    editTextManually: "Edit text manually",
    hideManualEdit: "Hide manual text",
    orientationLabel: "Illustration orientation",
    orientations: {
      landscape: "Landscape",
      portrait: "Portrait"
    }
  },
  aiContext: {
    trigger: "View AI context…",
    title: "AI context",
    hint: "Exactly what was sent to the model for the last job that ran, including anything it excluded.",
    empty: "No AI request yet this session. Run a writing or review job, then come back here.",
    operation: "Operation",
    model: "Model",
    tokensEstimate: "~{n} tokens (rough estimate)",
    systemInstructions: "System instructions",
    whatWasSent: "What was sent",
    target: {
      prose: "chapter",
      synopsis: "synopsis",
      brainstorm: "brainstorm note"
    },
    operations: {
      draft: "Draft",
      recast: "Recast",
      extend: "Extend",
      elaborate: "Elaborate",
      instruct: "Rewrite",
      ask: "Ask Brainstorm",
      "word-swap": "Word alternatives",
      "sentence-split": "Sentence split",
      "paragraph-break": "Paragraph break",
      extract: "Extract facts",
      analyze: "Analyze",
      illustrate: "Illustration prompt",
      proofread: "Proofread",
      "ask-manuscript": "Ask Manuscript"
    }
  },
  askManuscript: {
    nav: "Ask Manuscript",
    title: "Ask your manuscript",
    lede: "Ask a question about your story. The answer only uses what is actually written — with the chapters it drew from, so you can check it yourself.",
    placeholder: "Where did Henrik first meet Elin?",
    action: "Ask",
    asking: "Asking…",
    answerHeading: "Answer",
    sourcesHeading: "Sources",
    jumpToChapter: "Open “{chapter}”",
    empty: "Ask a question about your manuscript and the answer will appear here, with its sources."
  },
  timeline: {
    nav: "Timeline",
    title: "Timeline",
    lede: "Reading order is not always when things happen. Give a chapter a story-time note and move it to see how it actually falls, compared to where it sits in the manuscript.",
    readingPosition: "Manuscript position {n}",
    storyTimePlaceholder: "When does this happen? E.g. “Three years earlier”",
    storyTimeLabel: "Story time for “{chapter}”",
    outOfOrder: "Out of reading order",
    moveEarlier: "Move earlier",
    moveLater: "Move later"
  },
  continuity: {
    leakCount: {
      one: "{count} fact from later in the story",
      other: "{count} facts from later in the story"
    },
    leakHint: "These are already locked truth, but established after this chapter — the model can still see them here. Not necessarily a problem (maybe this chapter is a flash-forward), just worth a glance.",
    establishedIn: "Established in “{chapter}”"
  },
  plotlines: {
    nav: "Plotlines",
    title: "Plotlines",
    lede: "Which threads run through which chapter, at a glance. Mark a chapter against every thread it touches.",
    chapterColumn: "Chapter",
    addPlaceholder: "New thread name",
    addAction: "Add",
    removeThread: "Remove thread “{title}”",
    renameLabel: "Thread name",
    cellLabel: "{chapter} — {thread}",
    emptyPlotlines: "No threads yet. Add one below to start the matrix.",
    emptyChapters: "Write a chapter first — the matrix needs something to show."
  },
  guide: {
    nav: "Guide",
    title: "Guide",
    intro: "A short walkthrough — how to get the app talking to a model, and what everything does once it is.",
    openFromHome: "New here? Read the quickstart",
    closeAction: "Close",
    fromErrorLink: "See the quickstart guide",
    quickstartHeading: "Quickstart",
    quickstartSteps: [
      {
        heading: "1. Install a local model",
        body: "The simplest option is Ollama. Download it from ollama.com and install it like any other program, then open it and pull a model — it will show you a library to pick from. Any general chat model works to start (for example llama3 or mistral — a few gigabytes to download, once). Prefer LM Studio or another local server instead? That works too — see the next step."
      },
      {
        heading: "2. Point StoryBook AI at it",
        body: "Nothing to configure if you used Ollama — StoryBook AI finds it automatically on your computer. Using LM Studio or another local server instead? Open Settings → Models, choose it under Engine, and paste the server address it shows you."
      },
      {
        heading: "3. Start your manuscript",
        body: "A title is all it takes. Open it, and you land here — in Brainstorm once you have ideas, but first: a private scratch space with nothing to configure yet."
      },
      {
        heading: "4. Write",
        body: "Drag the ideas that are ready into Synopsis — the shape of the whole story. Then open a chapter and press Draft: the model writes from your Synopsis, your Story Bible, and that chapter's own brief. Nothing it writes is locked truth until you say so — rewrite it, recast the camera, or ask for an analysis pass any time."
      }
    ],
    howHeading: "How the app is built",
    sections: [
      {
        heading: "Author beats AI, always",
        body: "The model proposes; you decide. A detail the model invents in prose stays a proposal — shown with a light dashed underline — until you lock it into the Story Bible. Nothing crosses into canon on its own."
      },
      {
        heading: "Brainstorm & Synopsis",
        body: "Brainstorm is where ideas live before they are story — one note per idea, draggable, no order required. Lift the ones that stick into the Synopsis: the shape of the whole book, in a few sentences. Every chapter draft leans on the Synopsis, never on brainstorm notes you have not lifted."
      },
      {
        heading: "Chapters: Draft, Recast, Analyze",
        body: "Draft writes new prose from what is established. Recast rewrites the same chapter in a different point of view or tense, keeping the same events. Analyze reviews a chapter for common craft issues — telling instead of showing, filler dialogue, a beat that clashes with a locked trait — without rewriting a word."
      },
      {
        heading: "Scenes",
        body: "A long chapter can be split into scenes — pick where one ends and the next begins, name it, add a short note. Once a chapter has scenes, Draft, Recast and Analyze can each target just one of them."
      },
      {
        heading: "Story Bible",
        body: "The single source of truth for your story's facts — who someone is, where a place is, what a name means. A fact starts as a proposal, from you or from an extraction pass, and only becomes locked truth once you approve it. Locked facts are what the model is told it must not contradict."
      },
      {
        heading: "Continuity warnings",
        body: "When a chapter can see a fact that was only established later in the manuscript, it is flagged — not necessarily wrong, maybe it is a flashback, just worth a glance."
      },
      {
        heading: "Timeline",
        body: "Reading order and story-time order are not always the same thing. Give a chapter a story-time note, and see how the book falls when sorted by when things actually happen, next to where it sits in the manuscript."
      },
      {
        heading: "Plotlines",
        body: "Track which thread runs through which chapter in a table, so a thread that has gone quiet for ten chapters is easy to spot."
      },
      {
        heading: "Proofread",
        body: "A last pass over the whole manuscript: grammar, repeated scenes, style and mood drift between chapters, age-appropriateness, and a fact check against the whole book. Notes only — nothing is rewritten for you. It pauses and resumes, and only re-checks what has changed."
      },
      {
        heading: "Ask Manuscript",
        body: "Ask a question about your own story and get an answer built only from what is actually written — with the chapters it came from, so you can check it yourself."
      },
      {
        heading: "Publish",
        body: "Export a clean reading copy — Markdown, RTF, ODT, HTML, ePub, or PDF. Brainstorm never leaves the book; only the manuscript itself does."
      }
    ],
    faqHeading: "Troubleshooting",
    faq: [
      {
        heading: "“No local model found”",
        body: "StoryBook AI cannot reach your local server. Using Ollama? Make sure it is running. Using LM Studio or another server? Check Settings → Models — the engine and server address need to match what is actually running on your computer."
      },
      {
        heading: "Where is my book stored?",
        body: "On your own computer, in the browser's local storage — nothing is uploaded anywhere. Use Backup from time to time to save a copy you can restore from, in case you clear your browser's data."
      },
      {
        heading: "Can I use a paid AI service instead?",
        body: "No — on purpose. StoryBook AI only ever talks to a model running on your own computer or network. That is not a missing feature; it is the whole point: your manuscript never has to leave your machine."
      }
    ]
  },
  scenes: {
    toggleCount: {
      one: "{count} scene",
      other: "{count} scenes"
    },
    titlePlaceholder: "Untitled scene",
    titleLabel: "Scene {index} title",
    briefPlaceholder: "Writing note for this scene only (optional)",
    briefLabel: "Scene {index} brief",
    mergeWithNext: "Merge with next ↓",
    splitHere: "Split into two…",
    splitHint: "Pick where the new scene starts:",
    draft: "Draft",
    recast: "Recast",
    analyze: "Analyze"
  },
  publish: {
    title: "Publish",
    body: "A readable copy of the story. Leaves brainstorm out. RTF and ODT open in Scrivener. HTML opens in any browser. ePub opens in an e-reader. PDF is ready to print.",
    documentName: "Document name",
    format: "Format",
    font: "Font",
    systemFont: "System serif (Times/Georgia)",
    action: "Publish",
    markdown: "Markdown",
    rtf: "RTF",
    odt: "ODT",
    html: "HTML",
    epub: "ePub",
    pdf: "PDF"
  },
  progress: {
    title: "Progress",
    setGoal: "Set goal",
    editGoal: "Edit goal",
    removeGoal: "Remove goal",
    saveGoal: "Save goal",
    targetWordsLabel: "Target word count",
    deadlineLabel: "Deadline",
    daysPerWeekLabel: "Writing days per week",
    wordsOfTarget: "{current} of {target} words",
    percentComplete: "{percent}% of the way there",
    dailyPaceNeeded: "~{perDay} words a day needed to make it",
    overdue: "Deadline passed — {remaining} words still to go",
    targetReached: "Target reached"
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
    echoes: "Repeated words",
    phrases: "Repeated phrases",
    noneEcho: "No repeated words on this page.",
    nonePhrases: "No repeated phrases on this page.",
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
  proofread: {
    action: "Proofread",
    title: "Proofread",
    runningTitle: "Proofreading in progress — a good time for a cup of tea.",
    lede: "A last Review pass over the whole manuscript. Quotes and notes only. Nothing is rewritten.",
    grammar: "Grammar",
    scenes: "Repeated scenes",
    style: "Style and mood across chapters",
    age: "Age report",
    facts: "Fact check",
    grammarProgress: "Grammar — {done} of {total} chapters done",
    scenesProgress: "Looking for repeated scenes — {done} of {total} paragraph pairs compared",
    styleProgress: "Style and mood consistency between chapters",
    ageProgress: "Compiling the age report",
    factsProgress: "Checking facts against the Story Bible — {done} of {total} chapters done",
    now: "Now: {detail}",
    nowGrammar: "reading chapter {n}…",
    nowScenes: "comparing chapter {a} with chapter {b}…",
    nowStyle: "listening for a shift in register or mood…",
    nowAge: "weighing the prose against Reader…",
    nowFacts: "checking chapter {n} against the Story Bible…",
    stillWorking: "Still working — a single chapter can take a few minutes on slower hardware. Nothing is stuck.",
    percent: "{n}%",
    continue: "Continue",
    runAgain: "Run again",
    resultsTitle: "Proofread notes",
    emptyResults: "Nothing solid this time.",
    clickHint: "Click a line to open that chapter.",
    stale: "This chapter has changed since the pass.",
    suggestion: "Suggestion",
    chapter: "Chapter {n}",
    chapters: "Chapters {a} and {b}",
    paused: "Paused. What finished is saved.",
    error: "The pass stopped. What finished is saved.",
    craft: "Camera on the cards",
    contentFlag: "Content check"
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
    history: "History",
    historyCurrent: "current",
    asOfLabel: "View Story Bible as of",
    asOfNow: "Current",
    asOfBanner: "Viewing the Story Bible as it stood at “{chapter}” — read-only.",
    asOfBack: "Back to current",
    asOfEntityLede: "As it stood at “{chapter}”.",
    mentions: "Mentions",
    mentionsAside: "(Every chapter that names this entity in its prose.)",
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
    similarTo: "Similar to: {value} — looks like the same fact, more detailed",
    lock: "Lock",
    merge: "Merge",
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
    illustrate: "Illustration prompt…",
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
    rewriteAction: "Rewrite",
    rewriteChips: {
      group: "Shortcuts from Stats and Analyze",
      povLeakCamera:
        "Stay in the current camera. Do not enter a mind the camera cannot know. Keep the same events.",
      povLeak: {
        label: "Fix POV leak",
        prompt:
          "Stay in {who}’s perception. Do not report another character’s thoughts or feelings. Keep the same events."
      },
      strongerVerbs: {
        label: "Stronger verbs",
        prompt:
          "Swap weak verbs plus manner-adverbs for stronger verbs (ran quickly → rushed). Do not only delete the -ly words. Keep the same events."
      },
      activeVoice: {
        label: "Active voice",
        prompt:
          "Recast possible passives as active (the door was opened by her → she opened the door). Keep the same events."
      },
      showDontTell: {
        label: "Show, don’t tell",
        prompt:
          "Where a feeling is named, let the body or the scene carry it. Do not add explanation. Keep the same events."
      },
      breakLong: {
        label: "Break the long sentence",
        prompt:
          "Break the long sentence. Keep the meaning. Prefer a short hit after a long line, not a string of equal shorts."
      }
    },
    modelAside: "The model added this. It is not in the manuscript."
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
    echoBody: "The same word or phrase repeats in a short span. Click one to find it. A refrain can be the point.",
    reuse: "Repeated phrase",
    reuseBody: "The same stretch of words appears in more than one paragraph. Click one to find it. A refrain can be the point.",
    reuseWhere: "Paragraphs {list} · {n} words",
    openFind: "Find “{phrase}” in the text",
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
  history: {
    kicker: "Chapter",
    title: "History",
    emptyTitle: "No history yet",
    intro:
      "Earlier versions from Draft, Recast, Extend, Elaborate, and Rewrite. Restoring jumps to that version. Later rows stay.",
    empty: "The model has not rewritten this chapter yet.",
    emptyProse: "(empty)",
    clickHint: "Click a version to read it, then Restore to put it in the chapter.",
    restore: "Restore",
    compare: "Compare",
    compareHint: "Click another version to compare with this one. Restore still uses the selected version.",
    comparePair: "{from} → {to}",
    live: "Live chapter",
    same: "These two are the same.",
    fromOnly: "Only in this text — what you lose if you restore",
    toOnly: "Only in this text — what you gain if you restore",
    foot: "This list is not undo. Typing is not kept. Prompts only see the live chapter.",
    ops: {
      draft: "Draft",
      recast: "Recast",
      extend: "Extend",
      elaborate: "Elaborate",
      rewrite: "Rewrite",
      restore: "Restore"
    }
  },
  errors: {
    ollamaOrigins: "The local server did not accept the browser. Using Ollama? Start it with OLLAMA_ORIGINS=http://localhost:5175. Using LM Studio or another server? Look for a setting about which web addresses are allowed to connect (often called CORS or allowed origins).",
    noModel: "No local model found. Start Ollama or your local server, then reload.",
    notJson: "That file is not JSON.",
    backupUnreadable: "Could not read that backup.",
    shelfUnreadable: "Could not read the shelf.",
    recastEmpty: "Write or draft some prose before recasting the camera.",
    extractEmpty: "Write or draft some prose before extracting facts.",
    analyzeEmpty: "Write or draft some prose before analyzing the chapter.",
    extractorNone: "Extractor found no stated facts in this chapter.",
    proofreadEmpty: "Write or draft some chapter prose before proofreading.",
    askManuscriptEmpty: "Write or draft some chapter prose before asking about the manuscript.",
    askManuscriptNoMatch: "Nothing in the manuscript matches that question.",
    serverUrlMissing: "Enter your local server's address in Settings.",
    imageChoose: "Choose an image file.",
    imageRead: "Could not read that image.",
    imageAdd: "Could not add that image."
  }
};

export type Messages = typeof en;
