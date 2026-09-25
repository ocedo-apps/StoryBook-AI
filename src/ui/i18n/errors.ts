export const STORE_ERROR = {
  ollamaOrigins: "store:ollama-origins",
  noModel: "store:no-model",
  notJson: "store:not-json",
  backupUnreadable: "store:backup-unreadable",
  shelfUnreadable: "store:shelf-unreadable",
  recastEmpty: "store:recast-empty",
  extractEmpty: "store:extract-empty",
  analyzeEmpty: "store:analyze-empty",
  extractorNone: "store:extractor-none",
  interviewExtractorNone: "store:interview-extractor-none",
  proofreadEmpty: "store:proofread-empty",
  askManuscriptEmpty: "store:ask-manuscript-empty",
  askManuscriptNoMatch: "store:ask-manuscript-no-match",
  serverUrlMissing: "store:server-url-missing"
} as const;

export type StoreErrorCode = (typeof STORE_ERROR)[keyof typeof STORE_ERROR];

const STORE_ERROR_KEYS: Record<StoreErrorCode, keyof import("./en").Messages["errors"]> = {
  [STORE_ERROR.ollamaOrigins]: "ollamaOrigins",
  [STORE_ERROR.noModel]: "noModel",
  [STORE_ERROR.notJson]: "notJson",
  [STORE_ERROR.backupUnreadable]: "backupUnreadable",
  [STORE_ERROR.shelfUnreadable]: "shelfUnreadable",
  [STORE_ERROR.recastEmpty]: "recastEmpty",
  [STORE_ERROR.extractEmpty]: "extractEmpty",
  [STORE_ERROR.analyzeEmpty]: "analyzeEmpty",
  [STORE_ERROR.extractorNone]: "extractorNone",
  [STORE_ERROR.interviewExtractorNone]: "interviewExtractorNone",
  [STORE_ERROR.proofreadEmpty]: "proofreadEmpty",
  [STORE_ERROR.askManuscriptEmpty]: "askManuscriptEmpty",
  [STORE_ERROR.askManuscriptNoMatch]: "askManuscriptNoMatch",
  [STORE_ERROR.serverUrlMissing]: "serverUrlMissing"
};

export function isStoreError(value: string): value is StoreErrorCode {
  return value in STORE_ERROR_KEYS;
}

export function translateError(text: string, messages: import("./en").Messages): string {
  if (isStoreError(text)) return messages.errors[STORE_ERROR_KEYS[text]];
  if (Object.prototype.hasOwnProperty.call(messages.backup.errors, text)) {
    return messages.backup.errors[text as keyof typeof messages.backup.errors];
  }
  return text;
}
