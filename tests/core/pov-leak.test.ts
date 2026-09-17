import { describe, expect, it } from "vitest";
import type { CastMember } from "@core/characterProfile";
import type { CraftFields } from "@core/craft";
import { flagPovLeaks } from "@core/povLeak";

const emmaLimited: CraftFields = { pov: "limited", tense: "past", viewpoint: "Emma" };
const emmaFirst: CraftFields = { pov: "first", tense: "past", viewpoint: "Emma" };
const objective: CraftFields = { pov: "objective", tense: "past", viewpoint: "Emma" };
const omniscient: CraftFields = { pov: "omniscient", tense: "past", viewpoint: "" };

const pair: CastMember[] = [
  { label: "Emma", pronoun: "she" },
  { label: "Jeff", pronoun: "he" }
];

const twoMen: CastMember[] = [
  { label: "Emma", pronoun: "she" },
  { label: "Jeff", pronoun: "he" },
  { label: "Tom", pronoun: "he" }
];

describe("flagPovLeaks", () => {
  it("flags another named mind in limited", () => {
    const hits = flagPovLeaks("Emma locked the quay. Jeff wondered about the keys.", emmaLimited, pair);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.who).toBe("Jeff");
    expect(hits[0]?.cue).toBe("wondered");
  });

  it("does not flag the viewpoint mind", () => {
    expect(flagPovLeaks("Emma wondered about the keys on the hook.", emmaLimited, pair)).toEqual([]);
  });

  it("flags a unique other pronoun", () => {
    const hits = flagPovLeaks(
      "Emma locked the door. Jeff stood in the rain. He wondered if the tide would turn.",
      emmaLimited,
      pair
    );
    expect(hits).toHaveLength(1);
    expect(hits[0]?.who.toLowerCase()).toBe("he");
  });

  it("does not flag an ambiguous he when two men are in the chapter", () => {
    expect(
      flagPovLeaks("Emma waited. Jeff stood by Tom. He wondered about the keys.", emmaLimited, twoMen)
    ).toEqual([]);
  });

  it("still flags a named mind when pronouns collide", () => {
    const hits = flagPovLeaks("Emma waited. Jeff stood by Tom. Jeff wondered about the keys.", emmaLimited, twoMen);
    expect(hits.some((hit) => hit.who === "Jeff")).toBe(true);
  });

  it("flags a capitalized name even before that person is in the Story Bible", () => {
    const hits = flagPovLeaks("Emma locked the quay. Jeff wondered about the keys.", emmaLimited, [
      { label: "Emma", pronoun: "she" }
    ]);
    expect(hits.some((hit) => hit.who === "Jeff")).toBe(true);
  });

  it("skips omniscient", () => {
    expect(flagPovLeaks("Jeff wondered about the keys.", omniscient, pair)).toEqual([]);
  });

  it("flags viewpoint interiority in objective", () => {
    const hits = flagPovLeaks("Emma wondered about the keys.", objective, pair);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.who).toBe("Emma");
  });

  it("allows I in first person and still flags another name", () => {
    expect(flagPovLeaks("I wondered about the keys on the hook.", emmaFirst, pair)).toEqual([]);
    const hits = flagPovLeaks("I locked the door. Jeff wondered about the tide.", emmaFirst, pair);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.who).toBe("Jeff");
  });

  it("ignores thought inside dialogue", () => {
    expect(flagPovLeaks('Jeff said, "I wondered about the keys."', emmaLimited, pair)).toEqual([]);
  });

  it("skips limited with no viewpoint", () => {
    expect(
      flagPovLeaks("Jeff wondered about the keys.", { pov: "limited", tense: "past", viewpoint: "" }, pair)
    ).toEqual([]);
  });
});
