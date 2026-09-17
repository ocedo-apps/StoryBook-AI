import { describe, expect, it } from "vitest";
import { classifyEntity, entityMatchesQuery, groupBibleEntities, peopleLabels } from "@core/bibleGroups";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(
  partial: Pick<NarrativeFact, "id" | "entity_ref" | "entity_label" | "predicate" | "value">
): NarrativeFact {
  return {
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-15T00:00:00.000Z",
    ...partial
  };
}

describe("classifyEntity", () => {
  it("treats identity and relationship as characters", () => {
    expect(classifyEntity([fact({ id: "1", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender" })])).toBe(
      "characters"
    );
    expect(
      classifyEntity([
        fact({ id: "2", entity_ref: "emma", entity_label: "Emma", predicate: "core.relationship", value: "Knows the stranger" })
      ])
    ).toBe("characters");
  });

  it("keeps a person in Characters even if they also have an event", () => {
    expect(
      classifyEntity([
        fact({ id: "1", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender" }),
        fact({ id: "2", entity_ref: "emma", entity_label: "Emma", predicate: "core.event", value: "Left the quay" })
      ])
    ).toBe("characters");
  });

  it("treats a named location as a location", () => {
    expect(
      classifyEntity([fact({ id: "1", entity_ref: "aurora-room", entity_label: "Aurora Room", predicate: "core.place", value: "A bar on the quay" })])
    ).toBe("locations");
  });

  it("treats a named thing as an object", () => {
    expect(
      classifyEntity([fact({ id: "1", entity_ref: "night-keys", entity_label: "Night keys", predicate: "core.object", value: "Open the Aurora Room after dark" })])
    ).toBe("objects");
  });

  it("treats a named order or crew as a group", () => {
    expect(
      classifyEntity([
        fact({ id: "1", entity_ref: "celestial-watch", entity_label: "Order of the Celestial Watch", predicate: "core.group", value: "A sworn society" })
      ])
    ).toBe("groups");
  });

  it("lets an override move a ship out of Characters", () => {
    const odyssey = [
      fact({ id: "1", entity_ref: "the-odyssey", entity_label: "The Odyssey", predicate: "core.identity", value: "A watch-ship" })
    ];
    expect(classifyEntity(odyssey)).toBe("characters");
    expect(classifyEntity(odyssey, "locations")).toBe("locations");
  });
});

describe("groupBibleEntities", () => {
  it("puts characters, locations, objects, and events in separate sections, names sorted", () => {
    const sections = groupBibleEntities([
      fact({ id: "p2", entity_ref: "stranger", entity_label: "Stranger", predicate: "core.identity", value: "Pays in salt" }),
      fact({ id: "pl", entity_ref: "aurora-room", entity_label: "Aurora Room", predicate: "core.place", value: "A bar on the quay" }),
      fact({ id: "ob", entity_ref: "night-keys", entity_label: "Night keys", predicate: "core.object", value: "Open the bar" }),
      fact({ id: "p1", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender" }),
      fact({ id: "t", entity_ref: "emma", entity_label: "Emma", predicate: "core.trait", value: "Keeps the night keys" }),
      fact({ id: "ev", entity_ref: "winter-flood", entity_label: "The winter flood", predicate: "core.event", value: "The quay flooded" })
    ]);

    expect(sections.map((section) => section.kind)).toEqual(["characters", "locations", "objects", "events"]);
    expect(sections[0]?.entities.map((entity) => entity.entity_label)).toEqual(["Emma", "Stranger"]);
    expect(sections[0]?.entities[0]?.facts.map((row) => row.predicate)).toEqual(["core.identity", "core.trait"]);
    expect(sections[1]?.entities[0]?.entity_label).toBe("Aurora Room");
    expect(sections[2]?.entities[0]?.entity_label).toBe("Night keys");
    expect(sections[3]?.entities[0]?.entity_label).toBe("The winter flood");
  });

  it("skips pending and superseded rows", () => {
    const sections = groupBibleEntities([
      fact({ id: "live", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender" }),
      {
        ...fact({ id: "old", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "A visiting scholar" }),
        superseded_by: "live"
      },
      {
        ...fact({ id: "pending", entity_ref: "quay", entity_label: "The quay", predicate: "core.place", value: "Where the bar sits" }),
        status: "ai_proposed"
      }
    ]);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.kind).toBe("characters");
    expect(sections[0]?.entities).toHaveLength(1);
  });

  it("puts an overridden ship on Locations and an order on Groups", () => {
    const sections = groupBibleEntities(
      [
        fact({ id: "1", entity_ref: "the-odyssey", entity_label: "The Odyssey", predicate: "core.identity", value: "A watch-ship" }),
        fact({
          id: "2",
          entity_ref: "celestial-watch",
          entity_label: "Order of the Celestial Watch",
          predicate: "core.identity",
          value: "A sworn society"
        }),
        fact({ id: "3", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender" })
      ],
      [
        { entity_ref: "the-odyssey", kind: "locations" },
        { entity_ref: "celestial-watch", kind: "groups" }
      ]
    );
    expect(sections.map((section) => section.kind)).toEqual(["characters", "locations", "groups"]);
    expect(sections[0]?.entities.map((entity) => entity.entity_label)).toEqual(["Emma"]);
    expect(sections[1]?.entities[0]?.entity_label).toBe("The Odyssey");
    expect(sections[2]?.entities[0]?.entity_label).toBe("Order of the Celestial Watch");
  });
});

describe("peopleLabels", () => {
  it("returns locked character names for the viewpoint list", () => {
    expect(
      peopleLabels([
        fact({ id: "p1", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender" }),
        fact({ id: "pl", entity_ref: "aurora-room", entity_label: "Aurora Room", predicate: "core.place", value: "A bar" })
      ])
    ).toEqual(["Emma"]);
  });

  it("does not offer a ship as a viewpoint after it is a location", () => {
    expect(
      peopleLabels(
        [fact({ id: "1", entity_ref: "the-odyssey", entity_label: "The Odyssey", predicate: "core.identity", value: "A watch-ship" })],
        [{ entity_ref: "the-odyssey", kind: "locations" }]
      )
    ).toEqual([]);
  });
});

describe("entityMatchesQuery", () => {
  it("matches a name or a claim", () => {
    const emma = {
      entity_ref: "emma",
      entity_label: "Emma",
      facts: [fact({ id: "1", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender at the Aurora Room" })]
    };
    expect(entityMatchesQuery(emma, "emma")).toBe(true);
    expect(entityMatchesQuery(emma, "aurora")).toBe(true);
    expect(entityMatchesQuery(emma, "stranger")).toBe(false);
  });

  it("matches looks, personality, and tags on the character card", () => {
    const emma = {
      entity_ref: "emma",
      entity_label: "Emma",
      facts: [fact({ id: "1", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender" })]
    };
    const profile = { looks: "salt-cut hands", personality: "keeps her own counsel", tags: ["double nature"] };
    expect(entityMatchesQuery(emma, "salt-cut", profile)).toBe(true);
    expect(entityMatchesQuery(emma, "counsel", profile)).toBe(true);
    expect(entityMatchesQuery(emma, "double", profile)).toBe(true);
    expect(entityMatchesQuery(emma, "stranger", profile)).toBe(false);
  });
});
