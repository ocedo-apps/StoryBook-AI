import { describe, expect, it } from "vitest";
import { createBook, updateChapter, type Book } from "@core/BookSchema";
import { persistCoreImport, persistCoreRestore } from "@core/coreRestoreWorkflow";
import type { CoreBookRevision } from "@core/coreRevisionRestore";

function fixture() {
  const old = { ...createBook("Novel"), id: "original" };
  const current = updateChapter(old, old.chapters[0]!.id, { prose: "Latest local work" });
  const source: CoreBookRevision = {
    workspace: { id: "private-workspace", owner_app: "storybook", kind: "private-snapshot", project_id: old.id },
    revision: { id: "old-revision", workspace_id: "private-workspace", body: old, deleted: false }
  };
  return { old, current, source };
}

describe("private Core restore persistence", () => {
  it("does not replace the current manuscript if its safety checkpoint fails", async () => {
    const { current, source } = fixture();
    const calls: string[] = [];
    await expect(persistCoreRestore(source, "same-book", {
      currentBook: current, availableSeriesIds: new Set(), idExists: async () => false,
      checkpointCurrent: async () => { calls.push("checkpoint"); throw new Error("Core offline"); },
      save: async () => { calls.push("replace"); }
    })).rejects.toThrow("Core offline");
    expect(calls).toEqual(["checkpoint"]);
  });

  it("checkpoints before restoring into the same ID and retains newer translation links", async () => {
    const { current, source } = fixture();
    const linked = { ...current, translation_group_id: "later-family" };
    const calls: string[] = [];
    let saved: Book | undefined;
    const restored = await persistCoreRestore(source, "same-book", {
      currentBook: linked, availableSeriesIds: new Set(), idExists: async () => false,
      checkpointCurrent: async book => { expect(book.chapters[0]?.prose).toBe("Latest local work"); calls.push("checkpoint"); },
      save: async book => { saved = book; calls.push("replace"); }
    });
    expect(calls).toEqual(["checkpoint", "replace"]);
    expect(saved).toEqual(restored);
    expect(restored.id).toBe("original");
    expect(restored.translation_group_id).toBe("later-family");
    expect(restored.chapters[0]?.prose).not.toBe("Latest local work");
  });

  it("creates an independent manuscript after checking for an ID collision", async () => {
    const { current, source } = fixture();
    let checkpointed = false;
    let saved: Book | undefined;
    const ids = ["original", "occupied", "fresh"];
    const created = await persistCoreRestore(source, "new-book", {
      currentBook: current, availableSeriesIds: new Set(),
      createId: () => ids.shift()!, idExists: async id => id === "occupied",
      checkpointCurrent: async () => { checkpointed = true; },
      save: async book => { saved = book; }
    });
    expect(checkpointed).toBe(false);
    expect(saved?.id).toBe("fresh");
    expect(created.id).toBe("fresh");
    expect(current.id).toBe("original");
  });
});

describe("private Core import persistence (\"Import Codex book\", no manuscript open at all)", () => {
  it("refuses to import a manuscript already present locally", async () => {
    const { source } = fixture();
    await expect(
      persistCoreImport(source, { idExists: async () => true, save: async () => { throw new Error("must not save"); } })
    ).rejects.toThrow("already in your library");
  });

  it("imports the manuscript with its own original identity, not a fresh fork", async () => {
    const { old, source } = fixture();
    const linkedSource: CoreBookRevision = {
      ...source,
      revision: { ...source.revision, body: { ...old, translation_group_id: "family-a", series_id: "series-a" } }
    };
    let saved: Book | undefined;
    const imported = await persistCoreImport(linkedSource, {
      idExists: async () => false,
      save: async (book) => { saved = book; }
    });
    expect(imported.id).toBe("original");
    expect(imported.translation_group_id).toBe("family-a");
    expect(imported.series_id).toBe("series-a");
    expect(saved).toEqual(imported);
  });
});
