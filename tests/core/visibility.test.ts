import { describe, expect, it } from "vitest";
import {
  nextPositionOverride,
  setFactHidden,
  setFactPositionOverride,
  toggleHiddenEntity,
  visibleLockedFacts,
  visibleLockedFactsAtPosition
} from "@core/visibility";
import type { NarrativeFact } from "@core/NarrativeFact";

const emma: NarrativeFact = {
  id: "1",
  entity_ref: "emma",
  entity_label: "Emma",
  predicate: "core.identity",
  value: "Bartender",
  sequence_index: 0,
  status: "locked",
  source: "author",
  created_at: "2026-09-16T00:00:00.000Z"
};

const motive: NarrativeFact = {
  ...emma,
  id: "2",
  predicate: "core.trait",
  value: "She killed the skipper",
  hidden_from_ai: true
};

describe("visibility", () => {
  it("omits a hidden claim but keeps the rest of the card", () => {
    const visible = visibleLockedFacts([emma, motive], []);
    expect(visible.map((row) => row.id)).toEqual(["1"]);
  });

  it("omits the whole entity when the card is hidden", () => {
    expect(visibleLockedFacts([emma, motive], ["emma"])).toEqual([]);
  });

  it("toggles a card and a claim back on", () => {
    const hidden = toggleHiddenEntity([], "emma");
    expect(hidden).toEqual(["emma"]);
    expect(toggleHiddenEntity(hidden, "emma")).toEqual([]);
    const shown = setFactHidden([motive], "2", false);
    expect(shown[0]?.hidden_from_ai).toBeUndefined();
  });
});

describe("visibleLockedFactsAtPosition", () => {
  const ranks = new Map([
    ["ch1", 0],
    ["ch2", 1]
  ]);

  it("keeps a fact established at or before the target position", () => {
    const fact: NarrativeFact = { ...emma, chapter_id: "ch1" };
    expect(visibleLockedFactsAtPosition([fact], [], ranks, 0).map((row) => row.id)).toEqual(["1"]);
    expect(visibleLockedFactsAtPosition([fact], [], ranks, 1).map((row) => row.id)).toEqual(["1"]);
  });

  it("drops a fact established later in story time than the target position", () => {
    const fact: NarrativeFact = { ...emma, chapter_id: "ch2" };
    expect(visibleLockedFactsAtPosition([fact], [], ranks, 0)).toEqual([]);
  });

  it("keeps a fact with no chapter_id — nothing to place on the story-time clock", () => {
    expect(visibleLockedFactsAtPosition([emma], [], ranks, 0).map((row) => row.id)).toEqual(["1"]);
  });

  it("position_override: include always shows it, even from a later chapter", () => {
    const fact: NarrativeFact = { ...emma, chapter_id: "ch2", position_override: "include" };
    expect(visibleLockedFactsAtPosition([fact], [], ranks, 0).map((row) => row.id)).toEqual(["1"]);
  });

  it("position_override: exclude always hides it, even from an earlier chapter", () => {
    const fact: NarrativeFact = { ...emma, chapter_id: "ch1", position_override: "exclude" };
    expect(visibleLockedFactsAtPosition([fact], [], ranks, 1)).toEqual([]);
  });

  it("still applies the entity-wide and per-fact hide toggles on top", () => {
    const fact: NarrativeFact = { ...emma, chapter_id: "ch1", position_override: "include", hidden_from_ai: true };
    expect(visibleLockedFactsAtPosition([fact], [], ranks, 0)).toEqual([]);
  });
});

describe("position override setter/cycle", () => {
  it("cycles automatic -> include -> exclude -> automatic", () => {
    expect(nextPositionOverride(undefined)).toBe("include");
    expect(nextPositionOverride("include")).toBe("exclude");
    expect(nextPositionOverride("exclude")).toBeNull();
  });

  it("sets and clears the override on the matching fact only", () => {
    const withOverride = setFactPositionOverride([emma, motive], "1", "include");
    expect(withOverride.find((f) => f.id === "1")?.position_override).toBe("include");
    expect(withOverride.find((f) => f.id === "2")?.position_override).toBeUndefined();
    const cleared = setFactPositionOverride(withOverride, "1", null);
    expect(cleared.find((f) => f.id === "1")?.position_override).toBeUndefined();
  });
});
