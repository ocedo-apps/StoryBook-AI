import { describe, expect, it } from "vitest";
import {
  formatCharacterProfilesForPrompt,
  parseTagList,
  profileFor,
  upsertCharacterProfile
} from "@core/characterProfile";
import type { NarrativeFact } from "@core/NarrativeFact";

const emmaFact: NarrativeFact = {
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

describe("character profiles", () => {
  it("splits unique tags and keeps first casing", () => {
    expect(parseTagList("middle-aged, double nature; Middle-aged")).toEqual(["middle-aged", "double nature"]);
  });

  it("drops an empty card so old books stay sparse", () => {
    const once = upsertCharacterProfile([], { entity_ref: "emma", looks: "salt-cut hands" });
    expect(profileFor(once, "emma").looks).toBe("salt-cut hands");
    expect(upsertCharacterProfile(once, { entity_ref: "emma", looks: "" })).toEqual([]);
  });

  it("omits tags from the writing prompt", () => {
    const prompt = formatCharacterProfilesForPrompt(
      [emmaFact],
      [
        {
          entity_ref: "emma",
          pronoun: "she",
          approximateAge: 42,
          looks: "salt-cut hands",
          personality: "dry, keeps her own counsel",
          tags: ["double nature", "SECRETTAG"]
        }
      ]
    );
    expect(prompt).toContain("Emma · Pronoun: she");
    expect(prompt).toContain("Emma · Approximate age: 42");
    expect(prompt).toContain("Emma · Looks: salt-cut hands");
    expect(prompt).toContain("Emma · Personality: dry, keeps her own counsel");
    expect(prompt).not.toContain("SECRETTAG");
    expect(prompt).not.toContain("double nature");
  });

  it("skips a profile with no locked entity", () => {
    expect(
      formatCharacterProfilesForPrompt([], [{ entity_ref: "emma", looks: "salt-cut hands", personality: "", tags: [] }])
    ).toBe("");
  });
});
