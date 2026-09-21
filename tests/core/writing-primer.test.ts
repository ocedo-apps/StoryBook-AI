import { describe, expect, it } from "vitest";
import {
  DEFAULT_WRITING_PRIMER,
  clearWritingPrimer,
  readWritingPrimer,
  withWritingPrimer,
  writeWritingPrimer
} from "@core/writingPrimer";

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

describe("withWritingPrimer", () => {
  it("puts the start prompt in front of the job rules", () => {
    expect(withWritingPrimer("You draft one chapter.", "Stay in scene.")).toBe("Stay in scene.\n\nYou draft one chapter.");
  });

  it("leaves the job rules alone when the primer is empty", () => {
    expect(withWritingPrimer("You draft one chapter.", "  ")).toBe("You draft one chapter.");
  });

  it("tells the start prompt not to write film direction", () => {
    expect(DEFAULT_WRITING_PRIMER).toMatch(/not as a film treatment/i);
    expect(DEFAULT_WRITING_PRIMER).toMatch(/cameras, shots, or cuts/i);
  });
});

describe("writing primer storage", () => {
  it("returns the start prompt until a model has its own text", () => {
    expect(readWritingPrimer("stheno-custom:latest", memoryStore())).toBe(DEFAULT_WRITING_PRIMER);
  });

  it("keeps an edited primer on that model", () => {
    const store = memoryStore();
    writeWritingPrimer("hermes", "Skönlitterär prosa på svenska.", store);
    expect(readWritingPrimer("hermes", store)).toBe("Skönlitterär prosa på svenska.");
    expect(readWritingPrimer("stheno-custom:latest", store)).toBe(DEFAULT_WRITING_PRIMER);
  });

  it("treats a cleared field as empty, not as the start prompt", () => {
    const store = memoryStore();
    writeWritingPrimer("stheno-custom:latest", "", store);
    expect(readWritingPrimer("stheno-custom:latest", store)).toBe("");
  });

  it("restores the start prompt when the model entry is removed", () => {
    const store = memoryStore();
    writeWritingPrimer("stheno-custom:latest", "Custom.", store);
    clearWritingPrimer("stheno-custom:latest", store);
    expect(readWritingPrimer("stheno-custom:latest", store)).toBe(DEFAULT_WRITING_PRIMER);
  });
});
