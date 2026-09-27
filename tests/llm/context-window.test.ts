import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONTEXT_WINDOW,
  MAX_CONTEXT_WINDOW,
  MIN_CONTEXT_WINDOW,
  clampContextWindow,
  parseContextWindow,
  readContextWindow,
  writeContextWindow
} from "@llm/contextWindow";

function memoryStore(seed: Record<string, string> = {}): Storage {
  const data = { ...seed };
  return {
    get length() {
      return Object.keys(data).length;
    },
    clear() {
      for (const key of Object.keys(data)) delete data[key];
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key]! : null;
    },
    key() {
      return null;
    },
    removeItem(key: string) {
      delete data[key];
    },
    setItem(key: string, value: string) {
      data[key] = value;
    }
  };
}

describe("parseContextWindow", () => {
  it("defaults to 8192 and clamps to the min/max bounds", () => {
    expect(parseContextWindow(null)).toBe(DEFAULT_CONTEXT_WINDOW);
    expect(parseContextWindow("")).toBe(DEFAULT_CONTEXT_WINDOW);
    expect(parseContextWindow("nope")).toBe(DEFAULT_CONTEXT_WINDOW);
    expect(clampContextWindow(1)).toBe(MIN_CONTEXT_WINDOW);
    expect(clampContextWindow(999_999)).toBe(MAX_CONTEXT_WINDOW);
    expect(parseContextWindow("16384")).toBe(16384);
  });

  it("round-trips through localStorage", () => {
    const store = memoryStore();
    expect(readContextWindow(store)).toBe(DEFAULT_CONTEXT_WINDOW);
    writeContextWindow(32768, store);
    expect(readContextWindow(store)).toBe(32768);
    writeContextWindow(1, store);
    expect(readContextWindow(store)).toBe(MIN_CONTEXT_WINDOW);
  });
});
