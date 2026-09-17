import { describe, expect, it } from "vitest";
import { createBook } from "@core/BookSchema";
import { addEntityPicture } from "@core/entityMedia";
import {
  exportSandboxCards,
  SANDBOX_LIBRARY_FORMAT,
  SANDBOX_LIBRARY_KIND,
  sandboxCardCount,
  sandboxExportFilename,
  sandboxRealmId
} from "@core/sandboxExport";
import type { NarrativeFact } from "@core/NarrativeFact";

function fact(
  partial: Pick<NarrativeFact, "id" | "entity_ref" | "entity_label" | "predicate" | "value">
): NarrativeFact {
  return {
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-16T00:00:00.000Z",
    ...partial
  };
}

describe("exportSandboxCards", () => {
  it("writes an empty Sandbox library backup when the Story Bible has no cards", () => {
    const book = createBook("Night Keys");
    const payload = exportSandboxCards(book, "2026-09-18T00:00:00.000Z");
    expect(payload.kind).toBe(SANDBOX_LIBRARY_KIND);
    expect(payload.format).toBe(SANDBOX_LIBRARY_FORMAT);
    expect(sandboxCardCount(payload)).toBe(0);
    expect(payload.realms).toEqual([]);
    expect(payload.campaigns).toEqual([]);
  });

  it("projects characters, places, and objects, and skips groups", () => {
    const book = createBook("Night Keys");
    const withCanon = {
      ...book,
      facts: [
        fact({ id: "1", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender at the Aurora Room" }),
        fact({ id: "2", entity_ref: "aurora-room", entity_label: "Aurora Room", predicate: "core.place", value: "A bar on the quay" }),
        fact({ id: "3", entity_ref: "night-keys", entity_label: "Night keys", predicate: "core.object", value: "Open the Aurora Room after dark" }),
        fact({ id: "4", entity_ref: "quay-crew", entity_label: "the quay crew", predicate: "core.group", value: "They keep the salt" })
      ],
      profiles: [
        {
          entity_ref: "emma",
          pronoun: "she" as const,
          approximateAge: 42,
          looks: "salt-cut hands",
          personality: "dry, keeps her own counsel",
          tags: ["middle-aged"]
        }
      ],
      media: addEntityPicture(
        [],
        "emma",
        { thumbDataUrl: "data:image/jpeg;base64,thumb", imageDataUrl: "data:image/jpeg;base64,PORTRAIT" }
      )
    };
    const payload = exportSandboxCards(withCanon, "2026-09-18T00:00:00.000Z");
    expect(sandboxCardCount(payload)).toBe(3);
    expect(payload.characters).toHaveLength(1);
    expect(payload.characters[0]?.name).toBe("Emma");
    expect(payload.characters[0]?.id).toBe(`sb-${book.id}-emma`);
    expect(payload.characters[0]?.pronoun).toBe("she");
    expect(payload.characters[0]?.approximateAge).toBe(42);
    expect(payload.characters[0]?.appearance).toBe("salt-cut hands");
    expect(payload.characters[0]?.personality).toContain("dry, keeps her own counsel");
    expect(payload.characters[0]?.personality).toContain("Bartender at the Aurora Room");
    expect(payload.characters[0]?.tags).toEqual(["middle-aged"]);
    expect(payload.characters[0]?.portraitDataUrl).toBe("data:image/jpeg;base64,PORTRAIT");
    expect(payload.places).toHaveLength(1);
    expect(payload.places[0]?.name).toBe("Aurora Room");
    expect(payload.places[0]?.note).toBe("A bar on the quay");
    expect(payload.places[0]?.realmId).toBe(sandboxRealmId(book.id));
    expect(payload.realms).toEqual([
      expect.objectContaining({ id: sandboxRealmId(book.id), name: "Night Keys" })
    ]);
    expect(payload.objects[0]?.name).toBe("Night keys");
    expect(payload.objects[0]?.note).toContain("Open the Aurora Room");
    expect(payload.objects.some((item) => item.name === "the quay crew")).toBe(false);
  });

  it("uses locked claims as personality when the card has no profile", () => {
    const book = {
      ...createBook("Night Keys"),
      facts: [fact({ id: "1", entity_ref: "emma", entity_label: "Emma", predicate: "core.identity", value: "Bartender at the Aurora Room" })]
    };
    const payload = exportSandboxCards(book);
    expect(payload.characters[0]?.personality).toBe("Bartender at the Aurora Room");
    expect(payload.characters[0]?.appearance).toBe("");
  });

  it("ignores unlocked proposals", () => {
    const book = {
      ...createBook("Night Keys"),
      facts: [
        {
          ...fact({ id: "1", entity_ref: "stranger", entity_label: "the stranger", predicate: "core.identity", value: "Pays in salt" }),
          status: "ai_proposed" as const,
          source: "extractor" as const
        }
      ]
    };
    expect(sandboxCardCount(exportSandboxCards(book))).toBe(0);
  });

  it("names the download from the manuscript title", () => {
    const book = createBook("Night Keys");
    expect(sandboxExportFilename(book, "2026-09-18T12:00:00.000Z")).toBe("night-keys-sandbox-cards-2026-09-18.json");
  });
});
