import type { GuideCategoryId, GuideMainSectionId } from "../GuidePanel";
import type { HandbookCategoryId, HandbookSectionId } from "../HandbookPanel";

const guideCategories: Record<GuideCategoryId, string> = {
  "getting-started": "Introduction",
  "basic-writing": "Basic Writing",
  "the-writer": "The Writer",
  images: "Images",
  "focused-workflow": "Focused Workflow",
  "advanced-tools": "Advanced Writing Tools",
  "world-bible": "Story Bible",
  "polish-publish": "Polish & Publish",
  troubleshooting: "Troubleshooting"
};

const guideSections: Record<GuideMainSectionId, { heading: string; body: string }> = {
  privacy: {
    heading: "A fully closed digital safe",
    body: "StoryBook AI is built around one rule: your manuscript is your property, and it should never leave your computer. There is no way out to the internet in the app itself — no API keys for ChatGPT, Claude, or other cloud services (that's not a missing feature, it's a deliberate choice), and the fonts ship bundled with the app instead of being fetched from anywhere. Your text lives only in your browser, and the AI model runs only on your own processor. The separate desktop app (optional) can check whether a newer version of itself exists — never of your manuscript, which it doesn't even have access to. Whatever you're writing — a diary, trade secrets, or your next big fantasy epic — every letter stays with you."
  },
  author: {
    heading: "Author beats AI, always",
    body: "The model proposes; you decide. A detail the model invents in prose stays a proposal — shown with a light dashed underline — until you lock it into the Story Bible. Nothing crosses into canon on its own."
  },
  chapters: {
    heading: "Chapters: Draft, Recast, Analyze",
    body: "Draft writes new prose from what is established. Recast rewrites the same chapter in a different point of view or tense, keeping the same events. Analyze reviews a chapter for common craft issues without rewriting a word — telling instead of showing (instead of \"Lisa was furious,\" it might suggest \"Lisa slammed the door so hard the coffee cups rattled\"), filler dialogue, or a beat that clashes with a locked trait. Reader (in Settings, and per chapter) sets who it is written for — Board book through Adult — so sentence length and word choice match that age. Below the text, Rare and Clichés toggle two optional highlights — uncommon words for that reader, and phrasing that reads as AI-generated (\"a testament to\", overused em dashes) — one at a time, off by default."
  },
  "editor-tools": {
    heading: "The right-click menu",
    body: "Select a passage and right-click for Extend (continues on from where the selection ends), Elaborate (expands the passage itself), Rewrite… (give your own instruction, like \"make her angrier\"), Illustration prompt… (see Images), and Manual editing (rewrite just the marked passage yourself, by hand — the rest of the chapter stays as it was). Right-click with nothing selected instead, and you get a single option, Write a beat…: describe what happens next in one line, and the model writes just that — a short paragraph, not the rest of the scene — dropped in exactly at your cursor. Selecting a passage also shows a small Bold/Italic/Underline toolbar above it (or Ctrl+B/I/U) — display formatting only, saved separately from the text itself, so it never reaches the model."
  },
  "add-picture": {
    heading: "A picture for the chapter",
    body: "Add your own image — JPEG, PNG, or WebP — to the top of a chapter. It's decorative, not AI-generated: pick a file from your computer and it appears above the chapter's opening lines, carrying through when you publish to HTML, ePub, or PDF."
  },
  "illustration-prompts": {
    heading: "Illustration prompts",
    body: "Select a passage and choose Illustration prompt… from the right-click menu. The model writes an image-generation prompt — not a picture — built from the passage, your locked Story Bible facts, and your manuscript's illustration style, ready to paste into whatever image generator you use; StoryBook AI stays fully local and never generates the image itself. Set a default style under Settings → Illustration style, or open the style library to save named, reusable styles — each with its own genre tags and an example image — so every prompt keeps a consistent look across the book."
  },
  "brainstorm-synopsis": {
    heading: "Brainstorm & Synopsis",
    body: "Brainstorm is your private corkboard — scratch paper or a wall of sticky notes, one note per idea, draggable, no order required. Draft never leans on a note you haven't lifted into Synopsis. (Ask the model about your notes, or have it extend or elaborate one, and it naturally reads what you're asking about — but nothing from there becomes canon or leaks into chapter-writing on its own.) Lift the ideas that stick into Synopsis: the shape of the whole book, in a few sentences. It's what the AI model leans on when it later helps you write chapters."
  },
  method: {
    heading: "Development method",
    body: "An optional, ready-made set of steps for growing a spark into a shape — Snowflake, Three-Act Structure, Save the Cat, or Hero's Journey. It never keeps anything of its own: a beat-based method's beats become threads in Plotlines, and Snowflake's steps write straight into Synopsis, the same as any other note you lift there. Switching method, or choosing none, never deletes anything either of those already hold."
  },
  plotlines: {
    heading: "Plotlines",
    body: "Track which thread runs through which chapter in a table, so a thread that has gone quiet for ten chapters is easy to spot."
  },
  scenes: {
    heading: "Scenes",
    body: "A long chapter can be split into scenes — pick where one ends and the next begins, name it, add a short note. Once a chapter has scenes, Draft, Recast and Analyze can each target just one of them."
  },
  timeline: {
    heading: "Timeline",
    body: "Reading order and story-time order are not always the same thing. Give a chapter a story-time note, and see how the book falls when sorted by when things actually happen, next to where it sits in the manuscript."
  },
  "story-bible": {
    heading: "Story Bible",
    body: "The single source of truth for your story's facts — who someone is, where a place is, what a name means. A fact starts as a proposal, from you or from an extraction pass, and only becomes locked truth once you approve it. Locked facts are what the model is told it must not contradict — if a new proposal contradicts an already-locked fact (say, someone suddenly has brown eyes when you've locked blue), it gets flagged extra clearly in the review queue. Open a card and press Interview to chat about it — in a character's own voice, or, for a place, object, group, or concept, with a worldbuilding collaborator who discusses it in the third person — built only from what is locked so far. A way to hear a voice or explore lore and spot gaps, not to create new canon. If something said is worth keeping, press Extract facts to propose it for the Story Bible, same review queue as any other extraction — nothing is added until you approve it. Ctrl+click (Cmd+click on Mac) a known name anywhere in your prose to jump straight to its card — a plain click still just places your cursor there, as usual."
  },
  continuity: {
    heading: "Continuity warnings",
    body: "When a chapter can see a fact that was only established later in the manuscript, it is flagged — not necessarily wrong, maybe it is a flashback, just worth a glance. Proofread goes further: it checks a person or object's recorded place across the whole story, in story-time order, and flags a jump that looks impossible or unexplained given how much time passed."
  },
  proofread: {
    heading: "Proofread",
    body: "A last pass over the whole manuscript: grammar, repeated scenes, style and mood drift between chapters, age-appropriateness, a continuity check, a look for planted details that never pay off (a gun shown in chapter 4 that no one ever fires), and a fact check against the whole book. When Reader is set to a children's or YA level, it also flags swearing, violence, or explicit content that does not fit that age. Notes only — nothing is rewritten for you. It pauses and resumes, and only re-checks what has changed."
  },
  "ask-manuscript": {
    heading: "Ask Manuscript",
    body: "Ask a question about your own story and get an answer built only from what is actually written — with the chapters it came from, so you can check it yourself."
  },
  publish: {
    heading: "Publish",
    body: "Export a clean reading copy — Markdown, RTF, ODT, HTML, ePub, or PDF. Brainstorm never leaves the book; only the manuscript itself does."
  }
};

const handbookCategories: Record<HandbookCategoryId, string> = {
  "getting-started": "Getting Started",
  "how-you-work": "How You Can Work",
  plan: "Plan the Story",
  "story-bible-world": "Story Bible & World",
  writing: "Writing",
  revise: "Revise the Manuscript",
  "images-publish-backup": "Images, Publishing & Backup",
  help: "Help & Troubleshooting"
};

const handbookSections: Record<HandbookSectionId, { heading: string; body: string }> = {
  "connect-local-ai": {
    heading: "Connect a local AI",
    body: "StoryBook AI works with a local AI model.\nThat means the AI features use the model you have connected to StoryBook AI yourself.\nTo use features like drafting, rewriting, analysis, and interviews, you first need a working local AI connection.\n\nFollow the quickstart to:\n1. Install a local AI solution.\n2. Choose a model.\n3. Connect it to StoryBook AI.\n\nOnce the connection works, you can start writing."
  },
  "first-book": {
    heading: "Create your first book",
    body: "Create a new manuscript and give it a name.\nYou don't need to create a Synopsis, Story Bible, or a detailed plan before you start.\n\nYou can go straight to:\nChapters → Chapter 1 → Start writing\n\nWrite in the editor just like in an ordinary word processor.\nWant help? Use the AI tools."
  },
  "first-chapter": {
    heading: "Your first chapter",
    body: "A chapter is, at its core, two things:\n\nChapter brief\nWhat the chapter needs to accomplish.\n\nManuscript\nThe text the reader will actually read.\n\nA brief might be, for example:\n\"Erik arrives at the old railway station. There he meets a woman who seems to know his father. She refuses to explain how, and leaves an old photograph on the table.\"\n\nThe chapter itself is then the story that grows out of that.\nYou can write the chapter yourself, or use Draft to get a first pass to work from."
  },
  "map-of-storybook-ai": {
    heading: "A map of StoryBook AI",
    body: "EXPLORE\n💡 Brainstorm · 💬 Interview the world\nHere ideas get to be uncertain.\n↓\nPLAN\n📖 Synopsis · 🗂 Chapter briefs · 🎬 Scenes · 🧵 Plotlines · 🕒 Timeline\nHere you shape the story.\n↓\nESTABLISH\n📚 Story Bible · 🔎 Extract facts · ✓ Review · 🔒 Lock\nHere you decide what counts as established.\n↓\nWRITE\n✍️ Chapters — Draft · Write a beat · Extend · Elaborate · Rewrite\n↓\nREVIEW\n🔎 Analyze · 💬 Ask Manuscript · 🗨 Ask about a passage · ✓ Continuity · ✓ Proofread\n↓\nFINISH\n🖼 Images · 📤 Publish · 💾 Backup\n\nIt's a map.\nNot a required order."
  },
  "no-required-workflow": {
    heading: "You don't need to use everything",
    body: "StoryBook AI can be used in many different ways.\nThere is no required workflow.\n\nYou could, for example, work like this:\n\nI just want to start writing\nChapter → Write → Next chapter. Plan later, when you need to.\n\nI want to plan the story\nBrainstorm → Synopsis → Chapter briefs → Chapters\n\nI want to work in a very structured way\nSynopsis → Development method → Plotlines → Chapter briefs → Scenes → Timeline → Chapters\n\nI already have a manuscript\nBring in the existing text → Analyze → Story Bible → Revise → Publish\n\nI'm coming from another writing tool\nBring your manuscript and lore → Import → Review → Keep writing\n\nYou decide how much structure you need."
  },
  "three-workflows": {
    heading: "Three complete workflows",
    body: "I write intuitively\nNew manuscript → Chapter 1 → Write → Chapter 2 → Write\nAs the story grows: Extract facts → Story Bible\nLater: Analyze → Proofread → Publish\nYou never have to create a detailed plan.\n\nI want to plan first\nBrainstorm → Synopsis → Chapter briefs → Write chapters → Story Bible → Analyze → Proofread → Publish\nThis gives structure without requiring a dramatic model.\n\nI want to plan a lot\nBrainstorm → Snowflake → Synopsis → Three-Act Structure / Save the Cat / Hero's Journey → Plotlines → Chapter briefs → Scenes → Timeline → Write → Story Bible + continuity → Analyze → Proofread → Publish\nThis is a more structured way of working.\nIt is not more correct than the others."
  },
  "which-tool-do-i-need": {
    heading: "Which tool do I need?",
    body: "\"I don't know what the story is about.\" → Brainstorm\n\"I have an idea but can't pull it into a whole story.\" → Snowflake\n\"I have many ideas but no whole.\" → Synopsis\n\"I need a simple dramatic structure.\" → Three-Act Structure\n\"I want more clear beats to work with.\" → Save the Cat\n\"The story is about the protagonist's transformation.\" → Hero's Journey\n\"I don't quite know who my character is yet.\" → Interview the world\n\"I want to try ideas about the character without affecting the book.\" → Interview the world\n\"I need to remember what's actually true.\" → Story Bible\n\"I keep losing track of what the chapter should do.\" → Chapter brief\n\"The chapter has gotten too complicated.\" → Scenes\n\"I keep losing track of different plots and relationships.\" → Plotlines\n\"I keep losing track of when things happen.\" → Timeline\n\"I'm stuck in the middle of a scene.\" → Write a beat, Extend, or Elaborate\n\"I don't know if the chapter works.\" → Analyze\n\"I want honest, critical feedback on a specific question.\" → Ask about chapter / Ask about a passage\n\"I can't find something again in my long manuscript.\" → Ask Manuscript\n\"The story is done and I want to polish the text.\" → Proofread\n\"I want to give someone the book to read.\" → Publish"
  },
  "most-important-principle": {
    heading: "The most important principle",
    body: "StoryBook AI contains many features because different authors work in different ways.\nThat doesn't mean every feature has to be used.\n\nStart with the story.\nWhen you hit a problem, choose the tool that helps with that specific problem.\n\nExplore when you need ideas.\nPlan when you need direction.\nLock facts when something should become established.\nWrite when you know enough to continue.\nReview when you want to understand what you've written.\n\nAnd above all:\nThe tools should adapt to how you write — not the other way around."
  },
  "brainstorm-free": {
    heading: "Brainstorm – think freely",
    body: "Brainstorm is your private scratchpad.\nNothing here needs to be decided yet.\n\nWrite things like:\n\"What if the woman on the train actually knows Erik's father?\"\nor:\n\"Maybe the lighthouse isn't abandoned?\"\nor:\n\"Would the story work better if the brother were still alive?\"\n\nOne note per idea.\nMove them around and experiment.\n\nBrainstorm doesn't automatically affect the story\nThis is important. An idea in Brainstorm doesn't automatically become part of the story, and shouldn't start steering ordinary chapter drafts.\nWhen you decide an idea should move forward, drag it to Send to Synopsis.\nYou decide which ideas leave the corkboard."
  },
  "synopsis-short": {
    heading: "Synopsis – the story in short form",
    body: "Synopsis describes the story as a whole. Here you gather:\n• who matters\n• what happens\n• what the major conflicts are\n• where the story is headed\n\nExample\nBrainstorm: \"What if the woman on the train knows Erik's father?\"\nOnce you decide to use the idea, it can develop into:\n\"During the journey, Erik meets a woman who turns out to know the circumstances of his father's disappearance.\"\nThat belongs in Synopsis.\n\nThink of it as:\nBrainstorm = maybe\nSynopsis = the story's plan\nChapter brief = the chapter's job\nManuscript = the story itself"
  },
  "chapter-briefs": {
    heading: "Chapter briefs",
    body: "A chapter brief describes what a chapter needs to accomplish.\nIt doesn't need to be well written.\nIt's an instruction to yourself, and to the AI when you use the writing tools.\n\nExample\n\"Erik meets the woman in the dining car. She hints that she knew his father but refuses to say how. The chapter ends with her leaving a photograph on the table.\"\n\nThe brief is not the story itself.\nIt describes what the story should do.\n\nSynopsis = the whole story\nBrief = one chapter\nManuscript = what the reader gets"
  },
  "development-methods": {
    heading: "Development methods",
    body: "StoryBook AI includes several methods that can help you develop or structure the story.\nThey are entirely optional.\nYou can always choose:\nNo method — write freely"
  },
  "snowflake-method": {
    heading: "Snowflake",
    body: "Snowflake works well when you have an idea but not yet a whole story.\nIt helps you develop the content step by step.\n\nOne sentence\n\"A journalist returns to her home island to investigate her father's twenty-year-old disappearance.\"\n↓\nOne paragraph\nDevelop the core idea with conflict, development, and direction.\n↓\nFull synopsis\nKeep building until you have a coherent description of the story.\n↓\nSend to Synopsis\n\nYou can write it yourself or use AI as support along the way.\n\nSnowflake mainly helps answer:\n\"What is this story I'm actually writing?\""
  },
  "three-act": {
    heading: "Three-Act Structure",
    body: "Three-Act Structure works well when you want a simple dramatic backbone.\nStoryBook AI uses key turning points such as:\n• Setup\n• Inciting incident\n• Break into two\n• Midpoint\n• All is lost\n• Climax\n• Resolution\n\nThese become Plotlines you can attach to the story's chapters.\n\nExample\nInciting incident: \"Nora finds a letter from her missing father.\" (Chapter 3)\nLater — Midpoint: \"Nora discovers the letter was written after the date her father is said to have disappeared.\" (Chapter 12)\n\nThe method helps you see the story's larger movement.\nIt doesn't write the story for you."
  },
  "save-the-cat": {
    heading: "Save the Cat",
    body: "Save the Cat offers more beats than Three-Act Structure, including:\n• Opening image\n• Theme stated\n• Setup\n• Catalyst\n• Debate\n• Break into two\n• B story\n• Fun and games\n• Midpoint\n• Bad guys close in\n• All is lost\n• Dark night of the soul\n• Break into three\n• Finale\n• Final image\n\nThese are created as Plotlines.\nYou then decide how — and whether — they fit your story.\n\nAny percentage markers are landmarks, not rules for exactly where something must happen.\nUse the method as a map, not an answer key."
  },
  "heros-journey": {
    heading: "Hero's Journey",
    body: "Hero's Journey works well for stories where the protagonist's transformation is central.\nStoryBook AI uses twelve steps:\n1. Ordinary World\n2. Call to Adventure\n3. Refusal of the Call\n4. Meeting the Mentor\n5. Crossing the Threshold\n6. Tests, Allies, Enemies\n7. Approach to the Inmost Cave\n8. The Ordeal\n9. Reward\n10. The Road Back\n11. Resurrection\n12. Return with the Elixir\n\nThese, too, are created as Plotlines.\n\nThe \"journey\" doesn't have to be literal. A character can leave their safe world by moving, starting a relationship, losing their job, discovering a secret, or making a decision that changes their life."
  },
  "method-differences": {
    heading: "The difference between the methods",
    body: "Snowflake\nIdea → One sentence → One paragraph → Full synopsis → Synopsis\nSnowflake develops the story's content.\n\nThree-Act Structure / Save the Cat / Hero's Journey\nMethod → Beats and turning points → Plotlines → Chapters\nThese help you structure the story's development.\n\nYou can switch methods later. What you've already written in Synopsis, or created as Plotlines, isn't deleted just because you choose a different method or go back to writing freely."
  },
  scenes: {
    heading: "Scenes",
    body: "When a chapter gets long or complicated, it can help to split it into Scenes.\n\nChapter 8 – The Lighthouse\nScene 1: Nora arrives on the island.\nScene 2: She breaks into the lighthouse.\nScene 3: She finds the photographs.\nScene 4: Someone locks the door from outside.\n\nThink of it as:\nBrief = the chapter's job\nScenes = the path through the chapter\n\nYou don't need to use Scenes for simple chapters where you already have the overview."
  },
  plotlines: {
    heading: "Plotlines",
    body: "Plotlines help you follow things that develop through the story. It could be:\n• the main conflict\n• a relationship\n• a mystery\n• a secret\n• a rivalry\n• a character's change\n• dramatic beats\n\nExample\n🔴 The father's disappearance\n🟡 Nora and Elias\n🔵 The lighthouse's history\n\nYou can see how these run through the chapters. If an important subplot suddenly vanishes for ten chapters, it becomes easy to spot."
  },
  timeline: {
    heading: "Timeline",
    body: "Timeline answers the question: When does this happen?\nIt becomes especially useful when chapter order isn't the same as the story's chronology.\n\nChapter order\nChapter 1 – 2026: Nora returns.\nChapter 2 – 2006: The father disappears.\nChapter 3 – 2026: Nora finds the letter.\nChapter 4 – 1998: The father meets Elias.\n\nChronological order\n1998 → 2006 → 2026\n\nTimeline helps you keep track of the difference."
  },
  "scenes-plotlines-timeline": {
    heading: "Scenes, Plotlines, and Timeline",
    body: "They answer three different questions.\n\nScenes: What happens?\nPlotlines: What develops?\nTimeline: When does it happen?\n\nThe same event can therefore live in all three without the tools doing the same job."
  },
  "story-bible-memory": {
    heading: "Story Bible – the story's memory",
    body: "Story Bible gathers information the story needs to remember. It could be:\n• people\n• places\n• relationships\n• groups\n• objects\n• events\n• rules and concepts in the world\n\nSuppose the manuscript says:\n\"Nora walked up the stairs to the lighthouse. She hadn't been there since her father disappeared twenty years ago.\"\n\nStoryBook AI can identify possible facts. For example:\n\"Nora has a father.\"\n\"Nora's father disappeared twenty years ago.\"\n\"Nora has been to the lighthouse before.\"\n\nYou review the suggestions. Only once you decide something should be locked does it become established information StoryBook AI can rely on."
  },
  "what-is-canon": {
    heading: "What does canon mean?",
    body: "Canon is whatever you've decided should be treated as true in the story.\nNot all text needs to become canon.\n\nIf the AI writes:\n\"Nora pulled the red scarf tighter around her neck.\"\nyou don't need to save the scarf's color just because it happened to appear in the text.\n\nBut if the scarf later becomes important, the information may be worth locking.\n\nStory Bible should remember what needs to stay consistent. It doesn't need to become a database of every detail in every sentence."
  },
  "interview-world": {
    heading: "Interview the world",
    body: "Story Bible doesn't just have to be used to store what you already know. You can also use Interview the world to discover more.\n\nInstead of filling out long forms, you can explore a character through conversation.\n\nSuppose you know:\n\"Nora Berg. 38. Journalist. Grew up on the island. Her father disappeared when she was eighteen.\"\n\nAsk things like:\n\"Why did you become a journalist?\"\n\"What do you remember from the day your father disappeared?\"\n\"Who do you trust the least?\"\n\"What would you never admit to Elias?\"\n\"What are you most afraid of discovering?\"\n\nThe interview can help you find personality, motive, background, relationships, and conflicts."
  },
  "interview-sandbox": {
    heading: "The interview is a sandbox",
    body: "This is very important: what's said during the interview doesn't affect how the book is written. The AI is free to invent and experiment during the conversation.\n\nSuppose Nora says:\n\"My father used to take me to the lighthouse when I was little.\"\nThat doesn't mean StoryBook AI is now free to use this as established information when a chapter is written.\nYou first have to choose to turn the information into a fact.\n\nThe workflow is:\nInterview → AI says something interesting → Extract facts → Review → Lock facts → Story Bible → Now the information can affect future AI writing\n\nThink of it as:\nInterview ≠ canon\nLocked facts = canon\n\nThat lets you ask wild questions and try out ideas without risking them starting to affect the story."
  },
  "interview-to-story": {
    heading: "From interview to story",
    body: "During the interview, Nora might say:\n\"My mother always lied about what happened to Dad. I learned early that adults tell whichever version of the truth suits them.\"\n\nYou find the idea interesting. After the interview, StoryBook AI can help you identify possible facts:\n\"Nora's mother withheld information about the father's disappearance.\"\n\nNow you choose.\nLock the fact — then it becomes an established part of Story Bible.\nDon't lock it — then it stays something explored during the interview, and shouldn't be treated as established information when the book is written.\n\nWhen a fact only becomes true later in the chapter\nOne important detail: a fact locked to a chapter applies from the chapter's first page. Draft can use the fact right there — even if it's actually only true later in the chapter.\n\nExample: your protagonist meets an old friend, Marcus, in chapter 6. The chapter opens as an ordinary reunion. Only partway through does the protagonist realize Marcus is the one who's secretly been working against him — Marcus is the antagonist. If you extract \"Marcus is the antagonist\" from the Interview and lock it to chapter 6, Draft has access to the reveal already when it writes the opening reunion, as if nobody yet knows what Marcus is really up to.\n\nLock the fact to a specific scene instead\nIf the fact should only become available once the reveal happens, you can link it to the scene where it happens.\n\nFirst split chapter 6 into scenes (Scenes → Split into two…) at the point where the reveal happens, so the reunion and the reveal become separate scenes. When you then extract the fact from the Interview, the \"As of\" picker shows that chapter's scenes — pick the reveal's scene instead of \"Whole chapter\". Draft now only gets access to the fact from that scene onward.\n\nIf you draft scene by scene (Scenes → Draft), you can write the reunion without Draft having access to the fact yet. Once you reach the reveal's scene, Draft gets access to it, and it then applies for the rest of the chapter.\n\nImportant: this only works with scene-by-scene Draft\nThe scene link only affects Draft when you write one scene at a time. Run Draft for the whole chapter, and Draft has access to every fact attributed to the chapter, whichever scene it's linked to.\n\nIf you prefer drafting whole chapters in one pass, the simpler workaround still applies: hold off locking the fact until you've written past the turn, or draft the chapter in two passes and lock the fact only before the second."
  },
  "brainstorm-vs-interview": {
    heading: "Brainstorm and interview",
    body: "They are two different ways of exploring the story.\n\nBrainstorm — you look at the story from the outside:\n\"What if Nora's mother knows more about the disappearance?\"\n\nInterview — you examine the story from within:\n\"Nora, do you think your mother knows what happened to your father?\"\n\nNeither has to automatically change the story. They're places where you get to think."
  },
  "three-levels-of-information": {
    heading: "Three levels of information",
    body: "A useful mental model:\n\nExplore\nBrainstorm and interviews. \"What if…?\" Here ideas get to be uncertain.\n↓\nPlan\nSynopsis, briefs, Scenes, and Plotlines. \"This is what I think will happen.\" Here you shape the story.\n↓\nEstablish\nLocked facts in Story Bible. \"This is true in the story's world.\" Here is information StoryBook AI can rely on when the story is written."
  },
  "extract-facts": {
    heading: "Extract facts from the manuscript",
    body: "You don't have to fill Story Bible by hand as you write. When a chapter contains information worth remembering, StoryBook AI can help you extract possible facts.\n\nThe workflow is:\nChapter → Extract facts → Suggestions → Review → Approve and lock → Story Bible\n\nAI suggests. You decide."
  },
  "moving-from-other-tool": {
    heading: "Moving from another writing tool",
    body: "If you've already worked on the story elsewhere, you don't need to start over. You might already have:\n• a manuscript\n• character descriptions\n• places\n• worldbuilding\n• lore\n• organizations\n• objects\n• history\n• rules of the world\n\nStoryBook AI can help you bring the material with you."
  },
  "import-lore": {
    heading: "Import lore",
    body: "Open: Story Bible → Import lore\n\nPaste an article or text from your existing material. It could be, for example:\n\"The lighthouse was built in 1892 on the island's northern point. It has been unmanned since 1987. The locals avoid the place after dark.\"\n\nStoryBook AI's local AI reads the text and suggests facts. You then review the suggestions.\n\nThe original text isn't saved as part of the book. It's the facts you choose to approve that carry forward.\n\nThe current lore import works with one article or text at a time."
  },
  "lore-relevance-filter": {
    heading: "Keeping a large imported Story Bible relevant",
    body: "Facts the manuscript itself has established — written in a chapter, or approved from an interview — always show up in Draft. They're the story's own memory, and there's no safe way to leave them out. Imported lore (Import lore) is different: it's background information, useful only when the chapter being drafted actually touches it. With a large imported setting, keeping every one of those facts in every Draft prompt can make the prompt huge and bury the handful that actually matter to the chapter at hand.\n\nSettings → Only show relevant lore for Draft (off by default) changes that: an imported lore fact only shows up if its own name is mentioned in the chapter, or — for an Event, such as a historical battle or a sponsorship deal — if one of its participants or its location is mentioned instead, even if the event itself is never named.\n\nIf the filter ever guesses wrong about a specific fact, pin it: the same cycle button in Story Bible already used to override a fact's story-time position now also means \"always include this one, regardless.\""
  },
  "already-have-manuscript": {
    heading: "You already have a manuscript",
    body: "If you've already written part of, or all of, the story, you don't need to start with Brainstorm or a development method. Start with the text you have.\n\nOne possible workflow:\nExisting manuscript → Chapters → Extract facts → Story Bible → Analyze and revise → Keep writing\n\nBrainstorm, Synopsis, and development methods are aids. They aren't required steps."
  },
  "write-with-ai": {
    heading: "Write together with AI",
    body: "AI doesn't have to write whole chapters. Choose the smallest tool that solves the problem.\n\nDraft — when the chapter has no text yet.\nExtend — when you've started writing but need to move forward.\nElaborate — when a passage moves too fast or needs more content.\nRewrite — when you know what you want to change. Example: \"Make the dialogue more uncomfortable without the characters saying outright what they're angry about.\"\nWrite a beat — when you know exactly which smaller event should happen. Example: \"Nora hears footsteps on the stairs and hides the letter before the door opens.\""
  },
  "smallest-tool": {
    heading: "Choose the smallest tool",
    body: "Completely empty chapter → Draft\nA smaller event is missing → Write a beat\nThe passage is too thin → Elaborate\nI need to move forward → Extend\nI know what I want to change → Rewrite\nI want to know if the chapter works → Analyze\n\nThis gives you more control than regenerating large amounts of text."
  },
  "ai-not-autopilot": {
    heading: "AI is not autopilot",
    body: "StoryBook AI isn't built around: \"Write my book.\"\n\nThe idea is instead:\nYou decide the direction.\n↓\nAI helps where you want help.\n↓\nYou read the result.\n↓\nYou change, keep, or discard it.\n↓\nThe story develops.\n\nYou can write several chapters entirely without AI. You can use AI only when you get stuck. Or generate rough drafts that you then rewrite heavily. All of these are normal ways to use StoryBook AI."
  },
  "pov-tense-voice": {
    heading: "Point of view, tense, and narrative voice",
    body: "StoryBook AI can be given information about how the story should be told. This can include:\n• point of view\n• tense\n• viewpoint\n• narrative voice\n\nIndividual chapters can, when needed, deviate from the book's overall settings. That can be useful if most of the novel is told in third person but one particular chapter needs a different viewpoint.\n\nIf you use AI for larger rewrites after such a change, always read the result carefully.\n\nPoint of view is about more than swapping pronouns."
  },
  reader: {
    heading: "Reader",
    body: "You can specify what kind of reader the story is aimed at. This can help AI adapt, for example, word choice and sentence structure when it writes together with you.\n\nIt's writing support. It is not an automatic rating of what age the finished book is suitable for."
  },
  "author-voice": {
    heading: "Author voice",
    body: "Two authors can describe the same event in completely different ways. Author voice helps AI understand how you want the prose to feel. It can involve:\n• sentence length\n• amount of setting description\n• dialogue\n• rhythm\n• direct or restrained language\n• other stylistic traits\n\nIt's guidance for AI. Not rules for how you must write. Your own text always has the final word."
  },
  "analyze-chapter": {
    heading: "Analyze a chapter",
    body: "Analyze reviews the text without rewriting it for you. The point is to help you notice things you might want to look into yourself.\n\nThink of the analysis as an extra reader.\nNot: \"This is how you should write.\"\nBut: \"Here's something you might want to look at.\"\n\nYou decide whether the observation is relevant."
  },
  continuity: {
    heading: "Continuity",
    body: "The longer a manuscript gets, the harder it is to remember everything. A person might end up with different eye colors. A place might suddenly change. A character might seem to know information they shouldn't know yet.\n\nHere, Story Bible and the story's continuity tools help you compare what you're writing against what's already established.\n\nWho knows what?\nContinuity isn't only about physical details. It's also about information. The reader might know a secret. That doesn't mean every character does.\n\nThis becomes especially important in mysteries, thrillers, multiple viewpoints, and stories where information is revealed gradually."
  },
  "ask-manuscript": {
    heading: "Ask Manuscript",
    body: "Once the book has grown long, you can use Ask Manuscript to examine your own story.\n\nExample:\n\"When does Erik first meet the woman on the train?\"\n\"In which chapters is the lighthouse mentioned?\"\n\"What does Lena know about Erik's father?\"\n\"When does the reader learn the photograph is from 1932?\"\n\nYou can also ask:\n\"Which chapters are mostly about the relationship between Nora and Elias?\"\nor:\n\"Where is the key mentioned before it becomes important later?\"\n\nThe answer is a tool for you. It doesn't automatically become canon, and shouldn't by itself change the chapters."
  },
  "ask-about-passage": {
    heading: "Ask about a chapter or a passage",
    body: "Analyze checks fixed categories. Ask Manuscript answers factual questions about what's already written. Neither can answer something like: \"Does this build toward a strong ending?\" or \"Is this argument believable, or does it feel forced?\" — Ask about chapter / Ask about a passage is for exactly that kind of question: your own, about the writing's craft, with an honest — and critical, if asked — answer.\n\nTwo ways to use it:\n\"Ask about chapter…\" (next to Analyze) — ask about the whole chapter.\nMark a passage in the text, then choose \"Ask…\" from its menu — ask about just that passage, with the surrounding text as context.\n\nExample:\n\"Does the ending make you want to read the next chapter?\"\n\"Is this scene showing too much, too fast?\"\n\nThe answer is just a read. Nothing is changed or saved — same as Ask Manuscript."
  },
  history: {
    heading: "History",
    body: "AI-assisted writing often means experimenting. A rewrite might turn out better. Or you might discover the old version actually worked better.\n\nWhen earlier versions are available, History can help you compare and go back.\n\nThink: Try → Read → Keep or revert\n\nYou don't have to accept a change just because AI made it."
  },
  proofread: {
    heading: "Proofread",
    body: "Proofreading fits later in the process.\n\nEarlier, the question might have been: \"How can the scene develop?\"\nNow the question becomes: \"Is there something here that needs fixing or checking?\"\n\nIt's rarely worth polishing every sentence if you still plan to rewrite whole chapters. Work from large to small:\nThe story → Continuity → The chapters → The language → Proofreading → Your own final read\n\nAI can find things. The author decides what works."
  },
  "images-illustrations": {
    heading: "Images and illustrations",
    body: "StoryBook AI can help you work with images in two different ways.\n\nYour own images\nYou can add images to the story. Useful for illustrated stories, children's books, or projects where images are part of the reading experience.\n\nIllustration prompts\nYou can also use text from the story as the basis for an image description.\n\nExample — manuscript: \"Erik stood alone on the platform. Fog lay thick over the tracks, and the station clock had stopped at 3:17.\"\nStoryBook AI can help you turn the passage into an illustration prompt based on the subject and the project's chosen visual style. The story text itself isn't changed."
  },
  publish: {
    heading: "Publish",
    body: "When the story is ready to leave the workspace, use Publish.\n\nThink of the difference:\nThe StoryBook project = your workshop\nThe published copy = what the reader gets\n\nBrainstorm, working notes, and other planning don't need to follow into the published story. Choose the format that fits how the text will be used, and continue working with the result from there when needed."
  },
  backup: {
    heading: "Backup",
    body: "Publishing and backing up aren't the same thing.\n\nA published book is for the reader. A StoryBook backup is for restoring the project itself. It can therefore contain information that isn't in the published version.\n\nSave backups regularly, especially before major changes.\n\nImport backup is used for StoryBook AI's own backups. That's not the same as importing a manuscript or lore from another writing program."
  },
  "network-ai-server": {
    heading: "An AI server on another computer on the network",
    body: "Have a powerful computer or server on the same network, and want to write in StoryBook AI from a different machine — a laptop, say? That works, but needs settings in three places: in StoryBook AI, on the server machine, and its firewall.\n\nThe engine must be “LM Studio / other local server”\nOpen Settings → Models. Whether the other machine is actually running Ollama or LM Studio, pick that engine — it's the only one with a server address field. The Ollama engine always points at your own computer (localhost) and can't be redirected from the interface.\n\nEnter the other computer's network address\nIn the Server address field: http://[the other computer's network IP]:[port] — for example http://192.168.1.50:11434 for Ollama, or http://192.168.1.50:1234 for LM Studio. Don't add /v1 at the end — StoryBook AI adds that itself. Find that computer's network address with ipconfig (Windows) or ifconfig/ip addr (Mac/Linux), run on that same machine.\n\nLet the server listen on the network, not just itself\nIf the other machine runs Ollama: start it with the environment variable OLLAMA_HOST=0.0.0.0 so it listens broadly, and OLLAMA_ORIGINS set to the address StoryBook AI is actually running from — otherwise it refuses the browser's request even once the connection itself works.\nIf it runs LM Studio: the Developer tab → Server settings → turn on “Serve on Local Network” and “Enable CORS”.\n\nThe server machine's firewall\nIt must allow inbound connections on that port (11434 for Ollama, usually 1234 for LM Studio) from the rest of the network — otherwise the request never gets through, even with everything above set correctly.\n\nEach computer also keeps its own separate shelf of manuscripts — only the AI connection is shared, not what you've written. To keep working on the same book from both machines, use Backup/Restore to move it across."
  },
  "ai-writing-wrong-things": {
    heading: "If AI starts writing the wrong things",
    body: "First, think about what information the model actually received.\n\nThe chapter brief is outdated\nCheck whether the brief still describes the chapter you want to write.\n\nSynopsis hasn't kept up with the story's development\nThe story may have changed since you planned it.\n\nThe idea only exists in Brainstorm\nBrainstorm is an exploratory space. An idea there shouldn't automatically be treated as part of the story.\n\nThe information only comes from an interview\nThe same principle applies here. What was said during the interview doesn't affect how the book is written unless you've chosen to lock the information as a fact.\n\nImportant information is missing from Story Bible\nIf something needs to stay consistent, it may need to be established and locked as a fact.\n\nYour instruction is too broad\nInstead of: \"Rewrite the scene to make it better.\"\ntry: \"Make the dialogue between Nora and Elias more guarded. They suspect each other but neither wants to show it yet.\"\n\nThe clearer the problem is, the easier it becomes to choose the right tool."
  },
  "marker-conversion-no-match": {
    heading: "\"Convert markers to formatting\" says nothing was found",
    body: "This usually means the character you typed into the field isn't quite the same character as the one in your manuscript — easy to happen with quotation marks, since \" (straight) and “ ” (smart/typographic, which word processors often switch to automatically) look almost identical but are different characters to the computer.\n\nSafest fix: open the chapter, select one of the actual marker characters in your text, copy it (Ctrl/Cmd+C), and paste it into the Opening or Closing marker field instead of retyping it on the keyboard. That guarantees an exact match."
  }
};

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
  appBar: {
    nav: "Manuscripts",
    newManuscript: "New manuscript…",
    viewAll: "View all manuscripts",
    goHome: "Go to all manuscripts"
  },
  home: {
    headline: "Write the prose.",
    truth: "The Story Bible holds truth.",
    lede:
      "A local manuscript tool. Title the book, grow the story in Brainstorm, and lift a Synopsis when it is ready. The model drafts the chapters — you decide.",
    newManuscript: "Start a new manuscript",
    titlePlaceholder: "Title",
    open: "Create",
    importBackup: "Import backup",
    shelf: "Manuscripts",
    shelfHeading: "Your manuscripts",
    searchPlaceholder: "Search manuscripts…",
    noSearchResults: "No manuscripts match your search.",
    emptyShelf: "No manuscripts yet. A title is enough to start.",
    delete: "Delete",
    deleteConfirm: "Delete “{title}”? This cannot be undone.",
    replaceConfirm: "Replace “{title}” with this backup? Anything written since that backup will be lost.",
    chapters: { one: "{count} chapter", other: "{count} chapters" },
    facts: { one: "{count} locked fact", other: "{count} locked facts" },
    connectFound: { one: "Connected — {count} model found.", other: "Connected — {count} models found." },
    connectNotFound:
      "Not connected yet. Don't have a local AI server? We recommend Ollama — free, from ollama.com. Install a model (search for “stheno” for one tuned for fiction, or any general chat model like llama3), and it will show up here automatically.",
    desktopInstallOllama: "Install Ollama",
    desktopGpuSuggestion: "Based on your graphics card's memory (~{gb} GB), this computer can likely run {tier}.",
    desktopGpuTier3b: "a small model, around 3 billion parameters (4-bit)",
    desktopGpuTier7b: "a model around 7-8 billion parameters (4-bit)",
    desktopGpuTier14b: "a model around 13-14 billion parameters (4-bit)",
    desktopGpuTier30b: "a model around 30-34 billion parameters (4-bit)",
    desktopGpuTier70b: "a large model, 70 billion parameters or more (4-bit)",
    desktopCheckUpdate: "Check for updates",
    desktopCheckingUpdate: "Checking for updates…",
    desktopUpdateAvailable: "A new version is available ({latest}, you have {current}).",
    desktopViewChangelog: "View changelog",
    desktopDownloadUpdate: "Download update",
    desktopUpToDate: "You have the latest version ({current}).",
    desktopUpdateCheckFailed: "Couldn't check for updates: {error}"
  },
  editor: {
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
    appExport: "Export for other apps",
    appExportTitle: "Download a StoryCore manuscript export — locked Story Bible facts and chapters, for a sibling app like ComicBook AI to import. A snapshot, not a live link.",
    publish: "Publish",
    settings: "Settings",
    backToManuscript: "← Back to manuscript",
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
    contextWindowLabel: "Context window",
    contextWindowLede: "How much text the model is told it may actually look at. Ollama's own default is often much smaller than what your model and computer can really handle, which can make Draft lose track of details that were just written a paragraph or two ago. A bigger number needs more memory (RAM/VRAM) — lower it if generation becomes very slow or fails.",
    contextWindowSuggest: "Suggest from model",
    contextWindowSuggesting: "Checking…",
    contextWindowSuggested: "Set to {value}, the model's own reported maximum.",
    contextWindowSuggestError: "Couldn't get this from the model — set it by hand.",
    contextWindowOpenAiNote: "For LM Studio and other OpenAI-compatible servers, the context length is set when you load the model there, not here.",
    filterLoreLabel: "Only show relevant lore for Draft",
    filterLoreLede: "Off by default. Lore facts (imported, not written in a chapter) are otherwise always included, whether or not the chapter is actually about them. Turn this on if your Story Bible has a lot of imported lore and the prompt is getting too large — only lore whose name (or, for Events, a participant or location) is mentioned in the chapter's brief or text so far gets included. Pin an individual lore fact to always include it regardless, with the same button already in the Story Bible.",
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
    chapterFactsNote: {
      one: "{count} fact in the Story Bible comes from this chapter. It will not be removed or changed automatically — check the Story Bible if you want to update or delete it by hand.",
      other: "{count} facts in the Story Bible come from this chapter. They will not be removed or changed automatically — check the Story Bible if you want to update or delete them by hand."
    },
    reorderChapters: "Chapters. Drag to change order.",
    showBrief: "Show brief for {title}",
    hideBrief: "Hide brief for {title}",
    continuesCleared:
      "{title} no longer continues from “{from}”, because that chapter now comes later. It follows the previous chapter in the list.",
    voice: "Voice",
    voicePlaceholder: "Tone, rhythm, word choice",
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
    placeholdersCue: "Has a placeholder to come back to",
    newStrand: "new strand",
    startChapter: "Start Chapter {n}",
    draft: "Draft",
    extract: "Extract facts",
    extracting: "Extracting…",
    analyze: "Analyze",
    askPassage: "Ask about chapter…",
    proofread: "Proofread",
    notes: "Notes",
    history: "History",
    recast: "Recast prose",
    recasting: "Recasting…",
    recastTitle: "Rewrite this chapter to the current POV, tense, and viewpoint",
    stop: "Stop",
    brainstormChat: "Talk it through…",
    openSynopsis: "Open synopsis",
    maximize: "Maximize",
    restore: "Restore",
    maximizeTitle: "Hide panels and write",
    restoreTitle: "Restore panels (Esc)",
    pinPanel: "Pin panel open",
    unpinPanel: "Auto-hide this panel — hover the edge to bring it back",
    brainstormLede:
      "Private scratch. One note per idea. Drag them anywhere — there is no order yet. When a note is ready, drag it into the To synopsis column on the right.",
    brainstormPlaceholder: "An idea…",
    synopsisLede:
      "The story in a nutshell: who’s involved, what happens, and how it ends. Drafts are always based on this summary — but nothing becomes set in stone until you finalise it as fact.",
    synopsisPlaceholder: "The story in a few sentences.",
    chapterPlaceholder: "The chapter lives here. Draft, then rewrite until it is yours.",
    chapterImageAdd: "Add chapter illustration",
    chapterImageReplace: "Replace image",
    chapterImageRemove: "Remove image",
    instructTitle: "Change this note",
    instructHint: "Tell the model what to do with the marked note. Only that span is replaced.",
    instructPlaceholder: "What should change?",
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
    sendToSynopsis: "Send to synopsis",
    extractNoteFacts: "Extract facts",
    extractNoteFactsHint: "Find possible Story Bible facts in this note. They land in the review queue as candidates — nothing here becomes canon until you lock it.",
    extractSynopsisFacts: "Extract facts",
    extractSynopsisFactsHint: "Find possible Story Bible facts in this synopsis. They land in the review queue as candidates — nothing here becomes canon until you lock it.",
    extractBriefFacts: "Extract facts",
    extractBriefFactsHint: "Find possible Story Bible facts in this brief. They land in the review queue as candidates — nothing here becomes canon until you lock it."
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
    whatCameBack: "What the model replied (raw, unedited)",
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
      "brainstorm-chat": "Brainstorm chat",
      "word-swap": "Word alternatives",
      "sentence-split": "Sentence split",
      "paragraph-break": "Paragraph break",
      extract: "Extract facts",
      analyze: "Analyze",
      illustrate: "Illustration prompt",
      proofread: "Proofread",
      "ask-manuscript": "Ask Manuscript",
      "ask-passage": "Ask about passage",
      interview: "Character interview",
      develop: "Development method",
      "extract-interview": "Extract facts (interview)",
      "extract-brainstorm": "Extract facts (brainstorm)",
      "extract-synopsis": "Extract facts (synopsis)",
      "extract-brief": "Extract facts (brief)",
      "import-lore": "Import lore",
      beat: "Write a beat"
    }
  },
  askManuscript: {
    nav: "Ask Manuscript",
    title: "Ask your manuscript",
    lede: "Ask a question about your story. The answer only uses what is actually written — with the chapters it drew from, so you can check it yourself.",
    placeholder: "Ask a question about your manuscript…",
    action: "Ask",
    asking: "Asking…",
    answerHeading: "Answer",
    sourcesHeading: "Sources",
    jumpToChapter: "Open “{chapter}”",
    empty: "Ask a question about your manuscript and the answer will appear here, with its sources."
  },
  askPassage: {
    title: "Ask about this chapter",
    lede: "Ask anything about the chapter's craft — pacing, tension, voice, whether the ending lands. Be as critical as you like; this is just a read, nothing is saved.",
    placeholder: "E.g. “Does this build toward a strong ending?”",
    action: "Ask",
    asking: "Asking…",
    answerHeading: "Answer"
  },
  interview: {
    action: "Interview",
    title: "Interview {name}",
    titleWorld: "Ask about {name}",
    lede: "A private conversation with {name}, built only from what is locked in your Story Bible so far. Nothing said here becomes canon on its own — a way to hear their voice and spot gaps in what is established.",
    ledeWorld: "A private conversation about {name}, built only from what is locked in your Story Bible so far. Nothing said here becomes canon on its own — a way to explore ideas and spot gaps in what is established.",
    placeholder: "Ask {name} something…",
    placeholderWorld: "Ask something about {name}…",
    ask: "Ask",
    asking: "Asking…",
    you: "You",
    thinking: "{name} is thinking…",
    thinkingWorld: "Thinking about {name}…",
    empty: "Nothing asked yet. Start the conversation with {name} below.",
    emptyWorld: "Nothing asked yet. Start exploring {name} below.",
    extractAction: "Extract facts",
    extracting: "Extracting…",
    extractAsOf: "As of",
    extractAsOfHint: "Which chapter — or, for a chapter split into scenes, which scene — these facts belong to in story time, not the manuscript's page order. A whole-chapter Draft sees a fact from that chapter's first page onward; a scene-by-scene Draft only sees it from its own scene onward. Pick where this actually becomes true (e.g. when two characters first meet, or a reveal partway through a chapter), not just whichever chapter you happen to have open.",
    extractWholeChapter: "Whole chapter",
    extractSceneFallback: "Scene {index}",
    personalityLabel: "Personality for this conversation — try it out, save to the profile once the tone feels right",
    personalityPlaceholder: "How they talk and react",
    personalitySave: "Save to profile"
  },
  brainstormChat: {
    title: "Talk it through",
    lede: "A loose back-and-forth about your story — like talking it over with a friend. Nothing here is canon, and none of it is kept; drag the ideas worth keeping onto the board yourself.",
    placeholder: "Say what's on your mind…",
    send: "Send",
    sending: "Thinking…",
    you: "You",
    partner: "Partner",
    thinking: "Thinking…",
    empty: "Nothing said yet. Start talking an idea through below.",
    addToNotes: "Add to notes"
  },
  timeline: {
    nav: "Timeline",
    title: "Timeline",
    lede: "Reading order is not always when things happen. Give a chapter a story-time note and move it to see how it actually falls, compared to where it sits in the manuscript.",
    readingPosition: "Manuscript position {n}",
    storyTimeCaption: "Chronological position",
    storyTimePlaceholder: "E.g. “Three years earlier”",
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
  placeholders: {
    count: {
      one: "{count} placeholder to come back to",
      other: "{count} placeholders to come back to"
    },
    empty: "Placeholder",
    jumpTo: "In “{chapter}”"
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
    emptyChapters: "Write a chapter first — the matrix needs something to show.",
    colorSwatchLabel: "Set “{thread}”'s color to {color}",
    colorNames: {
      lime: "Lime",
      green: "Green",
      cyan: "Cyan",
      blue: "Blue",
      violet: "Violet",
      magenta: "Magenta",
      orange: "Orange",
      coral: "Coral",
      grey: "Grey",
      charcoal: "Charcoal"
    },
    editAction: "Edit",
    editLabel: "Edit thread “{title}”",
    editTitle: "Edit thread",
    colorFieldLabel: "Color",
    descriptionLabel: "Description (optional)",
    descriptionPlaceholder: "Shown as a tooltip over the thread's name and its bars",
    hideFromAiLabel: "Hide from AI",
    hideFromAiHint: "Left out of the Draft/Extend/Elaborate prompt for chapters tagged with this thread. Still shown to you while writing.",
    chapterThreadsLabel: "Threads:"
  },
  method: {
    nav: "Development method",
    title: "Development method",
    lede: "A development method is a ready-made set of steps for growing your story from a spark into a shape. It never keeps anything of its own — every step just writes into Synopsis or Plotlines, which you already have. Skip this entirely if you'd rather write freeform.",
    pickerLede: "Pick a method to get a guided path. You can change your mind later — nothing already written is ever deleted.",
    useAction: "Use this method",
    changeAction: "Change method",
    noneAction: "No method — write freely",
    activeBadge: "In use",
    beatsHeading: "Beats",
    beatsHint: "Each beat below became a thread in Plotlines. Open Plotlines to mark which chapters cover which beat.",
    openPlotlines: "Open Plotlines",
    assistAction: "Suggest a start",
    assisting: "Thinking…",
    draftPlaceholder: "Write your own, or ask the assistant for a start…",
    suggestionHeading: "Suggestion",
    useSuggestionAction: "Use this text",
    sendToSynopsisAction: "Send to Synopsis",
    sentToSynopsis: "Added to Synopsis.",
    removeOldBeatsConfirm: {
      one: "Remove the {count} leftover thread from {method} — {titles}?",
      other: "Remove the {count} leftover threads from {method} — {titles}?"
    },
    methods: {
      snowflake: {
        name: "Snowflake Method",
        description:
          "Start with one sentence and grow the story outward in a few widening passes. A simplified, three-pass take on Randy Ingermanson's method.",
        steps: {
          logline: {
            label: "One sentence",
            prompt: "Sum up the whole story in one sentence — the character, what they want, and what stands in the way."
          },
          paragraph: {
            label: "One paragraph",
            prompt:
              "Grow that sentence into a short paragraph: the setup, the conflict that develops it, the turn partway through, and how it ends."
          },
          synopsis: {
            label: "Full synopsis",
            prompt: "Grow the paragraph into a full synopsis — the shape of the whole book, scene by scene where it helps."
          }
        }
      },
      "three-act": {
        name: "Three-Act Structure",
        description: "The classic setup / confrontation / resolution shape, as seven recognizable turning points.",
        steps: {
          setup: { label: "Setup", hint: "The ordinary world, before the story disturbs it." },
          inciting: { label: "Inciting incident", hint: "The event that starts the story moving." },
          "break-two": { label: "Break into Act Two", hint: "The character commits — there is no going back to the ordinary world." },
          midpoint: { label: "Midpoint", hint: "A false victory or false defeat that raises the stakes." },
          "all-is-lost": { label: "All is lost", hint: "The low point — it looks like the character cannot win." },
          climax: { label: "Climax", hint: "The final confrontation the whole story has been building to." },
          resolution: { label: "Resolution", hint: "The new ordinary world, after the story's change." }
        }
      },
      "save-the-cat": {
        name: "Save the Cat",
        description: "Blake Snyder's 15-beat sheet — a detailed, percentage-mapped structure popular in genre fiction and screenwriting.",
        steps: {
          "opening-image": { label: "Opening image", hint: "A snapshot of the character's world before the story." },
          "theme-stated": { label: "Theme stated", hint: "Someone states, almost in passing, what the story is really about." },
          "set-up": { label: "Set-up", hint: "The world, the cast, and what is missing from the character's life." },
          catalyst: { label: "Catalyst", hint: "The event that kicks the story into motion." },
          debate: { label: "Debate", hint: "The character hesitates — can they really do this?" },
          "break-two": { label: "Break into Two", hint: "The character chooses to act, leaving the old world behind." },
          "b-story": { label: "B story", hint: "A second thread begins — often a relationship that carries the theme." },
          "fun-and-games": { label: "Fun and games", hint: "The premise delivers on its promise — the trailer moments." },
          midpoint: { label: "Midpoint", hint: "A false victory or false defeat; stakes rise, the clock starts." },
          "bad-guys-close-in": { label: "Bad guys close in", hint: "External and internal pressure both tighten." },
          "all-is-lost": { label: "All is lost", hint: "The lowest point — often marked by a loss or a death." },
          "dark-night": { label: "Dark night of the soul", hint: "The character sits with the loss before finding a way forward." },
          "break-three": { label: "Break into Three", hint: "The character finds the solution, often from the B story's lesson." },
          finale: { label: "Finale", hint: "The character acts on the lesson and resolves the story's problem." },
          "final-image": { label: "Final image", hint: "A snapshot that mirrors the opening image, showing how much has changed." }
        }
      },
      "hero-journey": {
        name: "Hero's Journey",
        description: "Campbell and Vogler's mythic structure — twelve stages of a character leaving the known world and returning changed.",
        steps: {
          "ordinary-world": { label: "Ordinary world", hint: "Life before the adventure." },
          call: { label: "Call to adventure", hint: "Something disturbs the ordinary world." },
          refusal: { label: "Refusal of the call", hint: "Fear or doubt holds the character back." },
          mentor: { label: "Meeting the mentor", hint: "Someone gives the character what they need to go on." },
          threshold: { label: "Crossing the threshold", hint: "The character commits and leaves the ordinary world." },
          tests: { label: "Tests, allies, enemies", hint: "The new world's rules, friends, and rivals are learned." },
          approach: { label: "Approach to the inmost cave", hint: "Preparing for the central ordeal." },
          ordeal: { label: "Ordeal", hint: "The central crisis — a brush with death, literal or otherwise." },
          reward: { label: "Reward", hint: "The character takes hold of what they came for." },
          "road-back": { label: "The road back", hint: "Committing to finish the journey and return." },
          resurrection: { label: "Resurrection", hint: "A final, higher-stakes test that proves the change is real." },
          return: { label: "Return with the elixir", hint: "The character comes home changed, with something to give back." }
        }
      }
    }
  },
  guide: {
    nav: "Guide",
    title: "Guide",
    intro: "A short walkthrough — how to get the app talking to a model, and what everything does once it is.",
    openFromHome: "New here? Read the quickstart",
    closeAction: "Close",
    fromErrorLink: "See the quickstart guide",
    helpFor: "Guide: {topic}",
    connectAiButton: "Connect a local AI",
    quickstartHeading: "Getting started with a local AI",
    quickstartCards: [
      {
        heading: "Install a local AI server",
        body: "If you don't already have one, we recommend Ollama — free, from ollama.com. Prefer something else? LM Studio or another local server works too."
      },
      {
        heading: "Choose your AI model",
        body: "The AI model is what actually writes and reasons with you. We recommend one tuned for fiction, for example fluffy/l3-8b-stheno-v3.2 (search for \"stheno\" in Ollama). Otherwise, any general chat model works — for example llama3 or mistral."
      },
      {
        heading: "Connect it to StoryBook AI",
        body: "Using Ollama? Nothing to configure — StoryBook AI finds it automatically. Using LM Studio or another server instead? Open Settings → Models, choose it under Engine, and paste the server address it shows you."
      }
    ],
    categories: guideCategories,
    sections: guideSections,
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
        heading: "Can I run the app on another computer or phone on my home network?",
        body: "Yes, but it's two separate things. To reach the app itself from another device, start it with \"npm run dev -- --host\" and use the network address the terminal prints (e.g. http://192.168.1.23:5175) instead of localhost. For that device to also talk to your local AI model, the model server (e.g. Ollama) needs to allow it too: let it listen broadly (OLLAMA_HOST=0.0.0.0), allow the address (OLLAMA_ORIGINS), and point the app's model setting at that computer's network address instead of localhost. Keep in mind each device still keeps its own library — manuscripts aren't shared between them automatically; move a book between devices with Backup/Restore."
      },
      {
        heading: "Can I use a paid AI service instead?",
        body: "No — on purpose. StoryBook AI only ever talks to a model running on your own computer or network. That is not a missing feature; it is the whole point: your manuscript never has to leave your machine."
      }
    ]
  },
  handbook: {
    title: "Guide",
    intro:
      "StoryBook AI contains many tools, but you don't need to learn all of them before you start.\nYou can write a whole book just by creating chapters and writing in the editor. The other tools are there when you need help with ideas, structure, characters, continuity, editing, or publishing.\n\nStart simple. Add structure when the story needs it.",
    categories: handbookCategories,
    sections: handbookSections
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
    analyze: "Analyze",
    addScene: "Add scene",
    addSceneDisabledHint: "Finish writing this scene before adding the next"
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
    txt: "Plain text",
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
    continuity: "Continuity",
    setups: "Setups & payoffs",
    facts: "Fact check",
    grammarProgress: "Grammar — {done} of {total} chapters done",
    scenesProgress: "Looking for repeated scenes — {done} of {total} paragraph pairs compared",
    styleProgress: "Style and mood consistency between chapters",
    ageProgress: "Compiling the age report",
    continuityProgress: "Checking that no one is in two places at once",
    setupsProgress: "Looking for planted details that have not paid off yet",
    factsProgress: "Checking facts against the Story Bible — {done} of {total} chapters done",
    now: "Now: {detail}",
    nowGrammar: "reading chapter {n}…",
    nowScenes: "comparing chapter {a} with chapter {b}…",
    nowStyle: "listening for a shift in register or mood…",
    nowAge: "weighing the prose against Reader…",
    nowContinuity: "checking who and what is where, and when…",
    nowSetups: "checking what has been planted, and what has paid off…",
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
    contentFlag: "Content check",
    stageSkipped: "Not selected this time",
    scopeSummary: "Scope: just {chapter}. Grammar and Fact-check only cover that chapter; the other stages always compare the whole manuscript.",
    setupTitle: "Before we run this",
    setupLede: "Check off what you want checked this time. Everything is checked by default, same as before.",
    setupStagesLabel: "What to check",
    setupScopeLabel: "Scope",
    setupScopeManuscript: "Whole manuscript",
    setupScopeChapter: "Just \"{chapter}\" (the open chapter)",
    setupScopeChapterHint: "Only affects Grammar and Fact-check — the only two stages that scale with chapter count. The others always compare chapters to each other, so they run over the whole manuscript regardless.",
    setupStart: "Start proofreading",
    setupNothingSelected: "Pick at least one thing to check."
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
    review: "Review facts",
    reviewCount: "Review · {count}",
    lockedCount: "{count} locked",
    exportCards: "Export cards",
    exportCardsTitle: "Download characters, places, and objects for Sandbox",
    importLoreNav: "Import lore",
    importLoreTitle: "Import a lore article",
    importLoreLede: "Paste text from your own lorebook. An AI reads through it and proposes facts for the right cards — the same as extracting facts from a chapter. Nothing locks in directly; everything lands in the review queue. The text itself is never saved to the book, only whatever facts come out of it.",
    importLoreArticleTitle: "Article title (optional, shown in review)",
    importLoreArticleTitlePlaceholder: "e.g. \"The Lighthouse\" or \"Order's Rules\"",
    importLoreText: "Text to extract facts from",
    importLoreTextPlaceholder: "Paste the article here…",
    importLoreAction: "Extract facts",
    importLoreExtracting: "Extracting…",
    importLoreUpload: "Upload file",
    importLoreFoundCount: "Found {count}",
    importLoreArticlesCount: { one: "{count} article", other: "{count} articles" },
    importLoreExtractingProgress: "Extracting {current} of {total}…",
    importLoreActionCount: "Extract facts from {count}",
    nothingMatches: "Nothing matches.",
    hidden: "Hidden",
    name: "Name",
    close: "Close",
    reviewBody: "Proposed Story Bible rows. Thicken them, then lock — or reject.",
    hideFromDraft: "Hide from Draft",
    interview: "Interview",
    interviewPickerTitle: "Who do you want to interview?",
    interviewPickerLede: "Any Story Bible card — not just characters. A place or an object can be interviewed too, in the third person, as a way to build out your world.",
    showToDraft: "Show to Draft",
    hiddenNote: "The model cannot see this card until you show it again.",
    deleteEntity: "Delete this card",
    deleteConfirm: "Delete “{name}” entirely, along with all its facts, pictures, and profile? This cannot be undone.",
    thisIsA: "This is a",
    pictures: "Pictures",
    picturesAside: "(For later export. Draft never sees these.)",
    removePicture: "Remove picture {n}",
    addImage: "Add image",
    addingImage: "Adding image",
    addFact: "Add fact",
    claimPlaceholder: "The claim, in one line",
    lockInto: "Lock into Story Bible",
    addChoiceTitle: "Replace or add?",
    addChoiceBody: "{predicate} already has “{existing}”. Should the new text replace it, or sit alongside it as another {predicate} row?",
    addChoiceKeepBoth: "Add as another",
    addChoiceReplace: "Replace the existing one",
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
    tagsPlaceholder: "Comma-separated traits",
    personality: "Personality",
    personalityPlaceholder: "How they tend to be",
    goals: "Goals",
    goalsPlaceholder: "What they want",
    fears: "Fears",
    fearsPlaceholder: "What they're afraid of",
    eventWhere: "Where",
    eventWhereNone: "Not placed yet",
    eventParticipants: "Who was there",
    eventsHere: "Events here",
    peopleHere: "People here",
    namePlaceholder: "Name",
    factText: "Fact text",
    sourceLabel: "Source: {source}",
    sources: {
      chapter: "Chapter",
      interview: "Interview",
      lore: "Lore",
      brainstorm: "Brainstorm",
      synopsis: "Synopsis",
      brief: "Brief"
    },
    conflictsWith: "Conflicts with: {value}",
    similarTo: "Similar to: {value} — looks like the same fact, more detailed",
    lock: "Lock",
    merge: "Merge",
    keepSeparate: "Keep both",
    reject: "Reject",
    show: "Show",
    hide: "Hide",
    showClaim: "Show this claim to Draft",
    hideClaim: "Hide this claim from Draft",
    positionOverrideAuto: "Auto",
    positionOverrideInclude: "Always on",
    positionOverrideExclude: "Never on",
    positionOverrideToInclude: "Always include in Draft, regardless of the chapter's position in story time or the lore-relevance filter",
    positionOverrideToExclude: "Always exclude from Draft, regardless of the chapter's position in story time",
    positionOverrideToAuto: "Back to automatic positioning (goes by story time)",
    edit: "Edit",
    editFact: "Edit fact",
    save: "Save",
    kinds: {
      characters: "Characters",
      locations: "Locations",
      objects: "Objects",
      groups: "Groups",
      events: "Events",
      concepts: "Concepts"
    },
    singular: {
      characters: "Character",
      locations: "Location",
      objects: "Object",
      groups: "Group",
      events: "Event",
      concepts: "Concept"
    },
    newLabel: {
      characters: "New character",
      locations: "New location",
      objects: "New object",
      groups: "New group",
      events: "New event",
      concepts: "New concept"
    },
    empty: {
      characters: "No characters yet.",
      locations: "No locations yet.",
      objects: "No objects yet.",
      groups: "No groups yet.",
      events: "No events yet.",
      concepts: "No concepts yet."
    },
    predicates: {
      "core.identity": "Identity",
      "core.trait": "Trait",
      "core.place": "Place",
      "core.object": "Object",
      "core.group": "Group",
      "core.relationship": "Relationship",
      "core.event": "Event",
      "core.concept": "Concept"
    },
    pronouns: {
      she: "She",
      he: "He",
      it: "It"
    }
  },
  canvas: {
    jumpToEntity: "Ctrl+click (Cmd+click on Mac) to open {name}’s Story Bible card",
    extend: "Extend",
    elaborate: "Elaborate",
    beat: "Write a beat…",
    beatTitle: "Write a beat",
    beatHint: "Short and concrete: what happens next? The model writes only that beat, nothing more, and inserts it right at the cursor.",
    beatPlaceholder: "What happens next, in one line",
    beatAction: "Write the beat",
    rewriteMenu: "Rewrite…",
    illustrate: "Illustration prompt…",
    lift: "Lift to synopsis",
    formatToolbar: "Formatting",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
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
    rewritePlaceholder: "What should change?",
    rewriteAction: "Rewrite",
    ask: "Ask…",
    askTitle: "Ask about this passage",
    askHint: "Ask anything about the marked passage — be as critical as you like. The answer is just a read, nothing is changed or saved.",
    askPlaceholder: "What do you want to know?",
    askAction: "Ask",
    placeholderAdd: "Drop a placeholder…",
    placeholderAddTitle: "Drop a placeholder",
    placeholderAddHint: "A quick note to yourself — a name, a fact, a date you'll fill in later. Keep writing; come back to it anytime.",
    placeholderPlaceholder: "What do you need to come back to?",
    placeholderAddAction: "Drop it",
    placeholderViewTitle: "Placeholder",
    placeholderSave: "Save",
    placeholderResolve: "Mark resolved",
    placeholderOpen: "Open this placeholder",
    placeholderEmptyNote: "Placeholder",
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
    ticsOn: "Clichés on",
    ticsOff: "Clichés off",
    ticsOnTitle: "Hide AI-sounding phrases",
    ticsOffTitle: "Mark AI-sounding phrases",
    factsOn: "Story Bible names on",
    factsOff: "Story Bible names off",
    factsOnTitle: "Hide underlining of Story Bible names",
    factsOffTitle: "Underline names that exist in the Story Bible",
    rareMarkTitle: "Uncommon word — may be harder for this reader",
    ticPhraseTitle: "Reads like an AI-generated phrase",
    ticDashTitle: "This passage leans heavily on em dashes",
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
      beat: "Beat",
      restore: "Restore",
      format: "Formatting"
    }
  },
  markerConvert: {
    nav: "Convert markers",
    heading: "Convert markers to formatting",
    intro:
      "Turn characters like *asterisks* — or opening/closing pairs like “smart quotes” — from an imported manuscript into real bold, italic, or underline. The markers are removed from the text; only the formatting stays. Longer markers run first, so \"**\" is not mistaken for two single \"*\" — set both if your manuscript uses them for different things.",
    openLabel: "Opening marker",
    openPlaceholder: "e.g. * or “",
    closeLabel: "Closing marker",
    closePlaceholder: "e.g. * or ”",
    becomes: "becomes",
    styleLabel: "Style",
    addRule: "Add rule",
    removeRule: "Remove",
    convertAction: "Convert whole manuscript",
    converting: "Converting…",
    resultSummary: "Converted {markers} across {chapters}.",
    resultNone: "No markers found — nothing to convert.",
    markersCount: { one: "{count} marker", other: "{count} markers" },
    chaptersCount: { one: "{count} chapter", other: "{count} chapters" }
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
    interviewExtractorNone: "Extractor found no stated facts in this conversation.",
    brainstormExtractorNone: "Extractor found no stated facts in this note.",
    synopsisExtractorNone: "Extractor found no stated facts in the synopsis.",
    briefExtractorNone: "Extractor found no stated facts in this brief.",
    importLoreNone: "Extractor found no stated facts in the pasted text.",
    proofreadEmpty: "Write or draft some chapter prose before proofreading.",
    askManuscriptEmpty: "Write or draft some chapter prose before asking about the manuscript.",
    askManuscriptNoMatch: "Nothing in the manuscript matches that question.",
    serverUrlMissing: "Enter your local server's address in Settings.",
    busy: "Another action is already running. Wait for it to finish, then try again.",
    timeout: "The local model didn't respond in time. It may still be loading, or your hardware may need longer than usual — check that it's running, then try again.",
    imageChoose: "Choose an image file.",
    imageRead: "Could not read that image.",
    imageAdd: "Could not add that image."
  }
};

export type Messages = typeof en;
