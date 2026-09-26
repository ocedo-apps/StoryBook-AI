import { describe, expect, it } from "vitest";
import { parseExtractorPayload } from "@core/extractFacts";

describe("parseExtractorPayload", () => {
  it("reads a clean facts array", () => {
    const drafts = parseExtractorPayload(
      JSON.stringify({
        facts: [
          {
            entity_label: "Emma",
            entity_ref: "Emma Vale",
            predicate: "core.identity",
            value: "Bartender at the Aurora Room"
          }
        ]
      })
    );
    expect(drafts).toEqual([
      {
        entity_ref: "emma-vale",
        entity_label: "Emma",
        predicate: "core.identity",
        value: "Bartender at the Aurora Room"
      }
    ]);
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
