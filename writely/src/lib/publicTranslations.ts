const english = {
  landing: {
    homeLabel: "Writely home",
    privateSpace: "Your private writing space",
    heroStart: "Give ideas",
    heroAccent: "room",
    heroDescription:
      "Writely keeps the page calm, saves every change, and brings in AI only for the words you choose.",
    heroAction: "Start a private draft",
    principles: [
      {
        number: "01",
        title: "Quiet by default",
        description: "A clean page that keeps the next sentence in view.",
      },
      {
        number: "02",
        title: "Saved as you write",
        description:
          "Autosave and a local recovery copy protect unfinished work.",
      },
      {
        number: "03",
        title: "AI stays in its place",
        description:
          "It only sees the passage you select, when you ask for help.",
      },
    ],
    aiLabel: "Selected-text AI",
    aiTitle: "Ask for a better sentence. Keep the final say.",
    aiDescription:
      "Select the exact passage that needs help, compare the rewrite with your original, and replace it only when it still sounds like you.",
    aiPrivacy: "Only the selected text is sent to AI.",
    focusLabel: "Focus Mode",
    focusTitle: "Give the sentence the whole room.",
    focusDescription:
      "Fade the surrounding interface when you want one clear page and fewer reasons to look away.",
    autosaveLabel: "Autosave & recovery",
    autosaveTitle: "Keep writing. Saving stays quiet.",
    autosaveDescription:
      "Every change is saved, with a recent local recovery copy ready when the connection is not.",
    exportLabel: "Export",
    exportTitle: "Take the finished draft with you.",
    exportDescription:
      "Move from writing to sharing with TXT, Markdown, and Word exports.",
    closingLabel: "One clear page. One thought at a time.",
    closingTitle: "Your next sentence deserves a quieter place.",
    closingDescription:
      "Open a private draft, let Writely handle the saving, and stay with the work in front of you.",
    startWriting: "Start writing",
    desktopBeta: "Writely · Desktop beta",
    privacy: "Privacy",
    settings: "Settings & Help",
  },
  demo: {
    bold: "Bold",
    italic: "Italic",
    list: "List",
    writingLabel: "Writing space",
    previewTitle: "A quieter place to think",
    previewParagraph:
      "Some thoughts arrive softly. Writely gives them room before the rest of the interface asks for attention.",
    previewList: [
      "Let the interface grow quiet around the words.",
      "Begin with the thought.",
      "Shape the language at your own pace.",
    ],
    formattingLabel: "Formatting demo",
    aiOriginalLabel: "Original",
    aiOriginal:
      "The meeting was long and there were many different things that we discussed together.",
    aiImprovedLabel: "Improved · {action}",
    aiActions: {
      improveClarity: "Improve clarity",
      makeConcise: "Make more concise",
      improveFlow: "Improve flow",
    },
    aiResults: {
      improveClarity:
        "We discussed several decisions during the long meeting and clarified the next steps.",
      improveClarityExplanation:
        "Vague wording clarified · next steps made explicit",
      makeConcise: "The meeting ran long as we worked through several topics.",
      makeConciseExplanation: "Repetition removed · meaning preserved",
      improveFlow:
        "The meeting ran long, but together we worked through each topic in turn.",
      improveFlowExplanation: "Ideas connected · rhythm smoothed",
    },
    focusPreviewLabel: "Read-only Writely document preview",
    focusTitle: "A quieter page",
    focusBody:
      "The best sentence often arrives after the interface gets out of the way.",
    enterFocus: "Enter Focus Mode",
    exitFocus: "Exit Focus Mode",
    autosaveInputLabel: "Autosave demo writing",
    autosavePlaceholder: "Type a line…",
    localDraft: "Local draft",
    saving: "Saving…",
    saved: "Saved",
    recoveryKept: "Recovery copy kept",
    tryFailedSave: "Try a failed save",
    keepRecovery: "Keep recovery copy",
    exportTitle: "Project brief",
    exportParagraph: "The draft is ready to share.",
    exportStrong: "Key ideas",
    exportMiddle: "stay clear;",
    exportEmphasis: "your voice",
    exportAfter: "remains.",
    downloadStarted: "{format} download started",
    exportFailed: "{format} export failed. Please try again.",
  },
  privacy: {
    title: "Privacy, in plain language",
    intro:
      "Writely collects only the information needed to provide and protect your writing workspace.",
    storesTitle: "What Writely stores",
    storesAccount:
      "When you sign in with Google, Writely receives basic account information such as your name, email address, and profile image.",
    storesDocuments:
      "Writely also stores your document titles, writing, formatting, editor settings, and save information so your documents can be opened, edited, and recovered.",
    storesUsage:
      "We may store your AI usage total and any feedback you choose to submit.",
    aiTitle: "How AI works",
    aiSelected: "Writely AI works only on text you select.",
    aiProvider:
      "When you choose an AI action, the selected text and instruction are sent to Groq to generate a response. The rest of your document is not included in that request.",
    aiRetention:
      "Writely does not save the selected text, instruction, or AI response in its own database after the request is completed. Groq may process or temporarily retain request data according to its own policies and the data settings used by Writely.",
    recoveryTitle: "Recovery copies",
    recoveryDescription:
      "Writely may keep a recent unsaved copy of your writing in your browser. This helps recover your work after a refresh, closed tab, connection problem, or failed save.",
    recoveryRemoval:
      "You can remove this local recovery data by clearing your browser storage.",
    providersTitle: "Service providers",
    providersIntro:
      "Writely uses third-party services to operate the product, including:",
    providers: [
      "Google for sign-in",
      "Groq for AI processing",
      "Hosting and database providers for storing and delivering the service",
    ],
    providersRole:
      "These services may process the information needed to perform their role.",
    choicesTitle: "Your choices",
    choicesDescription:
      "You may request access to, correction of, or deletion of your personal information and Writely account.",
    contact: "Privacy contact: code.dreamer666@gmail.com",
    betaTitle: "Beta notice",
    betaDescription:
      "Writely is currently in beta. This notice may be updated when the product or its data practices change.",
    updated: "Last updated: 24 July 2026",
  },
};

export type PublicCopy = typeof english;

export const PUBLIC_COPY = english;
