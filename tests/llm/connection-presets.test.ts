import { describe, expect, it } from "vitest";
import {
  loadConnectionPresets,
  matchesPreset,
  newConnectionPreset,
  saveConnectionPresets,
  CONNECTION_PRESETS_KEY,
  type ConnectionPreset
} from "@llm/connectionPresets";

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

describe("loadConnectionPresets", () => {
  it("returns an empty list when nothing is stored, or the stored value is malformed", () => {
    expect(loadConnectionPresets(memoryStore())).toEqual([]);
    expect(loadConnectionPresets(memoryStore({ [CONNECTION_PRESETS_KEY]: "not json" }))).toEqual([]);
    expect(loadConnectionPresets(memoryStore({ [CONNECTION_PRESETS_KEY]: "{}" }))).toEqual([]);
    expect(loadConnectionPresets(memoryStore({ [CONNECTION_PRESETS_KEY]: "[1,2,3]" }))).toEqual([]);
  });

  it("filters out entries that don't look like a connection preset, keeping the valid ones", () => {
    const stored = [
      { id: "a", name: "Strata", engine: "openai-compatible", baseUrl: "http://127.0.0.1:8080" },
      { id: "b", name: "Missing engine" },
      { id: "c", name: "Bad engine", engine: "claude", baseUrl: "" },
      null
    ];
    const store = memoryStore({ [CONNECTION_PRESETS_KEY]: JSON.stringify(stored) });
    expect(loadConnectionPresets(store)).toEqual([stored[0]]);
  });

  it("round-trips through save/load", () => {
    const store = memoryStore();
    const presets: ConnectionPreset[] = [
      { id: "a", name: "Ollama", engine: "ollama", baseUrl: "" },
      { id: "b", name: "LM Studio", engine: "openai-compatible", baseUrl: "http://localhost:1234" }
    ];
    saveConnectionPresets(presets, store);
    expect(loadConnectionPresets(store)).toEqual(presets);
  });
});

describe("matchesPreset", () => {
  it("matches an Ollama preset on engine alone — there's no address to compare", () => {
    const preset: ConnectionPreset = { id: "a", name: "Ollama", engine: "ollama", baseUrl: "" };
    expect(matchesPreset(preset, "ollama", "")).toBe(true);
    expect(matchesPreset(preset, "ollama", "http://doesnt-matter")).toBe(true);
    expect(matchesPreset(preset, "openai-compatible", "")).toBe(false);
  });

  it("matches an OpenAI-compatible preset on engine and trimmed address", () => {
    const preset: ConnectionPreset = { id: "a", name: "Strata", engine: "openai-compatible", baseUrl: "http://127.0.0.1:8080" };
    expect(matchesPreset(preset, "openai-compatible", "http://127.0.0.1:8080")).toBe(true);
    expect(matchesPreset(preset, "openai-compatible", "  http://127.0.0.1:8080  ")).toBe(true);
    expect(matchesPreset(preset, "openai-compatible", "http://127.0.0.1:8081")).toBe(false);
    expect(matchesPreset(preset, "ollama", "http://127.0.0.1:8080")).toBe(false);
  });
});

describe("newConnectionPreset", () => {
  it("names the first preset \"New connection\", and numbers later ones to stay unique", () => {
    expect(newConnectionPreset("ollama", "", []).name).toBe("New connection");
    expect(newConnectionPreset("ollama", "", ["New connection"]).name).toBe("New connection 2");
    expect(newConnectionPreset("ollama", "", ["New connection", "New connection 2"]).name).toBe("New connection 3");
    expect(newConnectionPreset("ollama", "", ["New connection 2"]).name).toBe("New connection");
  });

  it("carries the given engine and address, with a fresh id", () => {
    const preset = newConnectionPreset("openai-compatible", "http://127.0.0.1:8080", []);
    expect(preset.engine).toBe("openai-compatible");
    expect(preset.baseUrl).toBe("http://127.0.0.1:8080");
    expect(preset.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});
