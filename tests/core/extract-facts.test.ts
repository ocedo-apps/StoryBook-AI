import { describe, expect, it } from "vitest";
import { INTERVIEW_EXTRACTOR_SYSTEM, interviewExtractorUserPrompt, parseExtractorPayload } from "@core/extractFacts";

describe("parseExtractorPayload", () => {
  it("reads a clean facts array", () => {
    const drafts = parseExtractorPayload(
      JSON.stringify({
        facts: [
          {
            entity_label: "Emma",
            predicate: "core.identity",
            value: "Bartender at the Aurora Room"
          }
        ]
      })
    );
    expect(drafts).toEqual([
      {
        entity_ref: "emma",
        entity_label: "Emma",
        predicate: "core.identity",
        value: "Bartender at the Aurora Room"
      }
    ]);
  });

  it("derives entity_ref from entity_label, ignoring any entity_ref the model invented", () => {
    // Regression: the model picks a fresh entity_ref on every call (it never sees
    // which refs already exist), so two facts about the exact same displayed name
    // could get different self-chosen refs and land as two separate Story Bible
    // cards. entity_ref must be a pure function of entity_label instead.
    const drafts = parseExtractorPayload(
      JSON.stringify({
        facts: [
          { entity_label: "Dr. James Mortimer", entity_ref: "dr-mortimer", predicate: "core.identity", value: "A country doctor" },
          { entity_label: "Dr. James Mortimer", entity_ref: "james-mortimer", predicate: "core.trait", value: "Owns a spaniel" }
        ]
      })
    );
    expect(drafts.map((d) => d.entity_ref)).toEqual(["dr-james-mortimer", "dr-james-mortimer"]);
  });

  it("recovers JSON from fenced model output and drops unknown predicates", () => {
    const raw = `Here you go:\n\`\`\`json\n{"facts":[{"entity":"The quay","predicate":"core.place","value":"Stone dock on the salt canal"},{"entity":"Emma","predicate":"rpg.stat","value":"12"}]}\n\`\`\``;
    const drafts = parseExtractorPayload(raw);
    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.predicate).toBe("core.place");
    expect(drafts[0]?.entity_ref).toBe("the-quay");
  });

  it("accepts a group predicate", () => {
    const drafts = parseExtractorPayload(
      JSON.stringify({
        facts: [
          {
            entity_label: "Order of the Celestial Watch",
            predicate: "core.group",
            value: "A sworn society aboard the Odyssey"
          }
        ]
      })
    );
    expect(drafts[0]?.predicate).toBe("core.group");
    expect(drafts[0]?.entity_ref).toBe("order-of-the-celestial-watch");
  });

  it("returns an empty list when the model found nothing", () => {
    expect(parseExtractorPayload('{"facts":[]}')).toEqual([]);
  });

  it("salvages complete facts from a response truncated mid-array (hit its token budget)", () => {
    const raw =
      '{"facts":[' +
      '{"entity_label":"Jeff","entity_ref":"jeff","predicate":"core.identity","value":"Captain of the Odyssey"},' +
      '{"entity_label":"Odyssey","entity_ref":"odyssey","predicate":"core.object","value":"A type-A cargo ship"},' +
      '{"entity_label":"Odyssey","entity_ref":"odyssey","predicate":"core.trait","value":"The largest hypersonic cargo mo';
    const drafts = parseExtractorPayload(raw);
    expect(drafts).toHaveLength(2);
    expect(drafts.map((d) => d.entity_label)).toEqual(["Jeff", "Odyssey"]);
  });

  it("salvages complete facts truncated right after a trailing comma, with no partial object at all", () => {
    const raw =
      '{"facts":[{"entity_label":"Emma","entity_ref":"emma","predicate":"core.identity","value":"Bartender"},';
    const drafts = parseExtractorPayload(raw);
    expect(drafts).toEqual([{ entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender" }]);
  });

  it("still throws when truncation cuts off before even one fact object closes", () => {
    expect(() => parseExtractorPayload('{"facts":[{"entity_label":"Emma","entity_ref":"emma","predicate":"core.id')).toThrow();
  });
});

describe("interviewExtractorUserPrompt", () => {
  it("names the interviewee so first-person turns can be resolved to them", () => {
    // Regression: a generic extractor prompt found zero facts in an
    // interviewee's first-person answer ("my favorite food is meatballs")
    // because nothing told it "my" resolves to the interviewee. The prompt
    // must say so explicitly, not rely on the model inferring it from
    // "Henrik: ..." turn labels in the transcript alone.
    const prompt = interviewExtractorUserPrompt("Author: Hi\n\nHenrik: My favorite food is meatballs.", "Henrik");
    expect(prompt).toContain("Interviewee: Henrik");
    expect(prompt).toContain('"I"/"me"/"my"');
    expect(prompt).toContain("My favorite food is meatballs.");
  });
});

describe("INTERVIEW_EXTRACTOR_SYSTEM", () => {
  it("instructs first-person statements to resolve to the interviewee, not the pronoun", () => {
    expect(INTERVIEW_EXTRACTOR_SYSTEM).toContain("first person");
    expect(INTERVIEW_EXTRACTOR_SYSTEM).toContain('never "I" or "the interviewee"');
  });

  it("names age and relationship status as core.trait examples", () => {
    // Regression: a tester's interview answers plainly stated an age
    // ("I'm in my mid-thirties, let's say 35") and a relationship status
    // ("I don't have a girlfriend... last relationship ended") and the
    // extractor found neither, most likely because "a stable
    // characteristic" alone didn't read as covering either one.
    expect(INTERVIEW_EXTRACTOR_SYSTEM).toContain("an age, a relationship status");
  });

  it("tells the model a hedged or approximate answer is still extractable", () => {
    // Regression: "let's say 35" is the interviewee's own hedge, not the
    // model's guess — the "no guesses" rule must not be read as excluding it.
    expect(INTERVIEW_EXTRACTOR_SYSTEM).toContain("let's say 35");
    expect(INTERVIEW_EXTRACTOR_SYSTEM).toContain("still extract it");
  });
});
