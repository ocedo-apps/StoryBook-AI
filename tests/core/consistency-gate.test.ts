import { describe, expect, it } from "vitest";
import {
  applyAuthorDraft,
  applyExtractorDrafts,
  approveFact,
  evaluateCandidate,
  rejectFact,
  reviseFact
} from "@core/ConsistencyGate";
import type { FactDraft, NarrativeFact } from "@core/NarrativeFact";

const emmaIdentity: FactDraft = {
  entity_ref: "emma",
  entity_label: "Emma",
  predicate: "core.identity",
  value: "Bartender at the Aurora Room"
};

function lockedEmma(): NarrativeFact {
  return {
    id: "locked-1",
    entity_ref: "emma",
    entity_label: "Emma",
    predicate: "core.identity",
    value: "Bartender at the Aurora Room",
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-14T00:00:00.000Z"
  };
}

describe("evaluateCandidate", () => {
  it("auto-approves a duplicate of locked truth", () => {
    const decision = evaluateCandidate(emmaIdentity, [lockedEmma()], "extractor");
    expect(decision).toEqual({ kind: "auto_approve", existingId: "locked-1" });
  });

  it("proposes a new predicate as new", () => {
    const draft: FactDraft = { ...emmaIdentity, predicate: "core.trait", value: "Slow to trust" };
    expect(evaluateCandidate(draft, [lockedEmma()], "extractor").kind).toBe("propose_new");
  });

  it("flags an extractor contradiction and lets the author supersede", () => {
    const draft: FactDraft = { ...emmaIdentity, value: "A visiting scholar" };
    expect(evaluateCandidate(draft, [lockedEmma()], "extractor")).toEqual({
      kind: "flagged_conflict",
      againstId: "locked-1"
    });
    expect(evaluateCandidate(draft, [lockedEmma()], "author")).toEqual({
      kind: "valid_change",
      supersedesId: "locked-1"
    });
  });
});

describe("applyAuthorDraft", () => {
  it("locks a new fact and supersedes the old one on change", () => {
    const added = applyAuthorDraft([], emmaIdentity, 0);
    expect(added).toHaveLength(1);
    expect(added[0]?.status).toBe("locked");

    const changed = applyAuthorDraft(added, { ...emmaIdentity, value: "Keeps the night keys" }, 1);
    const live = changed.filter((fact) => !fact.superseded_by);
    expect(live).toHaveLength(1);
    expect(live[0]?.value).toBe("Keeps the night keys");
    expect(changed.some((fact) => fact.superseded_by === live[0]?.id)).toBe(true);
  });
});

describe("applyExtractorDrafts", () => {
  it("records proposals and flags, and skips duplicates", () => {
    const facts = [lockedEmma()];
    const next = applyExtractorDrafts(
      facts,
      [
        emmaIdentity,
        { ...emmaIdentity, value: "A visiting scholar" },
        { ...emmaIdentity, predicate: "core.trait", value: "Steady hands" }
      ],
      0,
      "ch1"
    );
    expect(next.some((fact) => fact.status === "flagged")).toBe(true);
    expect(next.some((fact) => fact.status === "ai_proposed" && fact.predicate === "core.trait")).toBe(true);
    const again = applyExtractorDrafts(next, [{ ...emmaIdentity, predicate: "core.trait", value: "Steady hands" }], 0, "ch1");
    expect(again.filter((fact) => fact.status === "ai_proposed")).toHaveLength(1);
  });
});

describe("approveFact / rejectFact", () => {
  it("locks a proposal and drops a rejected one that was never truth", () => {
    const withProposal = applyExtractorDrafts(
      [],
      [{ ...emmaIdentity, predicate: "core.event", value: "The quay flooded last winter" }],
      0,
      "ch1"
    );
    const proposed = withProposal.find((fact) => fact.status === "ai_proposed");
    expect(proposed).toBeTruthy();
    const locked = approveFact(withProposal, proposed!.id);
    expect(locked.find((fact) => fact.id === proposed!.id)?.status).toBe("locked");

    const flagged = applyExtractorDrafts(
      [lockedEmma()],
      [{ ...emmaIdentity, value: "A visiting scholar" }],
      0,
      "ch1"
    );
    const flag = flagged.find((fact) => fact.status === "flagged");
    expect(rejectFact(flagged, flag!.id).some((fact) => fact.id === flag!.id)).toBe(false);
    expect(rejectFact(flagged, "locked-1").some((fact) => fact.id === "locked-1")).toBe(true);
  });

  it("approving a flagged fact supersedes the locked row it fought", () => {
    const flagged = applyExtractorDrafts(
      [lockedEmma()],
      [{ ...emmaIdentity, value: "A visiting scholar" }],
      0,
      "ch1"
    );
    const flag = flagged.find((fact) => fact.status === "flagged");
    const approved = approveFact(flagged, flag!.id);
    expect(approved.find((fact) => fact.id === "locked-1")?.superseded_by).toBe(flag!.id);
    expect(approved.find((fact) => fact.id === flag!.id)?.status).toBe("locked");
  });
});

describe("reviseFact", () => {
  it("lets the author thicken a pending extraction before it locks", () => {
    const proposed = applyExtractorDrafts([], [emmaIdentity], 0, "ch1");
    const id = proposed[0]!.id;
    const revised = reviseFact(proposed, id, "Bartender at the Aurora Room. Keeps the night keys.");
    expect(revised[0]?.value).toContain("night keys");
    expect(revised[0]?.status).toBe("ai_proposed");
    expect(revised[0]?.source).toBe("author");
  });

  it("supersedes a locked fact when the author adds more", () => {
    const next = reviseFact([lockedEmma()], "locked-1", "Bartender at the Aurora Room. Keeps the night keys.");
    const live = next.filter((fact) => !fact.superseded_by);
    expect(live).toHaveLength(1);
    expect(live[0]?.value).toContain("night keys");
    expect(live[0]?.status).toBe("locked");
    expect(next.find((fact) => fact.id === "locked-1")?.superseded_by).toBe(live[0]?.id);
  });

  it("keeps a hidden claim hidden after the author thickens it", () => {
    const next = reviseFact(
      [{ ...lockedEmma(), hidden_from_ai: true }],
      "locked-1",
      "Bartender at the Aurora Room. Keeps the night keys."
    );
    const live = next.find((fact) => !fact.superseded_by);
    expect(live?.hidden_from_ai).toBe(true);
    expect(live?.value).toContain("night keys");
  });
});

describe("scene provenance", () => {
  it("stamps scene_id on a locked author fact, same as chapter_id", () => {
    const added = applyAuthorDraft([], emmaIdentity, 0, "ch1", "ch1:scene-1");
    expect(added[0]?.chapter_id).toBe("ch1");
    expect(added[0]?.scene_id).toBe("ch1:scene-1");
  });

  it("stamps scene_id on proposed and flagged extractor facts", () => {
    const facts = [lockedEmma()];
    const next = applyExtractorDrafts(
      facts,
      [{ ...emmaIdentity, value: "A visiting scholar" }, { ...emmaIdentity, predicate: "core.trait", value: "Steady hands" }],
      0,
      "ch1",
      "ch1:scene-1"
    );
    const flagged = next.find((fact) => fact.status === "flagged");
    const proposed = next.find((fact) => fact.status === "ai_proposed");
    expect(flagged?.scene_id).toBe("ch1:scene-1");
    expect(proposed?.scene_id).toBe("ch1:scene-1");
  });

  it("carries scene_id over when an approved flagged fact supersedes its rival", () => {
    const flagged = applyExtractorDrafts([lockedEmma()], [{ ...emmaIdentity, value: "A visiting scholar" }], 0, "ch1", "ch1:scene-2");
    const flag = flagged.find((fact) => fact.status === "flagged");
    const approved = approveFact(flagged, flag!.id);
    expect(approved.find((fact) => fact.id === flag!.id)?.scene_id).toBe("ch1:scene-2");
  });

  it("carries the current scene_id when the author revises a locked fact", () => {
    const next = reviseFact(
      [{ ...lockedEmma(), chapter_id: "ch1", scene_id: "ch1:scene-1" }],
      "locked-1",
      "Bartender at the Aurora Room. Keeps the night keys."
    );
    const live = next.find((fact) => !fact.superseded_by);
    expect(live?.scene_id).toBe("ch1:scene-1");
  });

  it("leaves scene_id unset when no scene was passed, same as chapter_id", () => {
    const added = applyAuthorDraft([], emmaIdentity, 0);
    expect(added[0]?.chapter_id).toBeUndefined();
    expect(added[0]?.scene_id).toBeUndefined();
  });
});
