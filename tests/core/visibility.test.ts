import { describe, expect, it } from "vitest";
import { setFactHidden, toggleHiddenEntity, visibleLockedFacts } from "@core/visibility";
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
