import { describe, expect, it } from "vitest";
import {
  applyAuthorAddition,
  applyAuthorDraft,
  applyExtractorDrafts,
  approveFact,
  evaluateCandidate,
  isPossibleEnrichment,
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

describe("applyAuthorAddition", () => {
  it("locks a second, independent fact under a predicate that already has one", () => {
    const withTrait = applyAuthorDraft([], { ...emmaIdentity, predicate: "core.trait", value: "Slow to trust" }, 0);
    const withBoth = applyAuthorAddition(withTrait, { ...emmaIdentity, predicate: "core.trait", value: "Keeps odd hours" }, 1);
    const live = withBoth.filter((fact) => !fact.superseded_by);
    expect(live).toHaveLength(2);
    expect(live.map((fact) => fact.value).sort()).toEqual(["Keeps odd hours", "Slow to trust"]);
    expect(live.every((fact) => fact.status === "locked")).toBe(true);
  });

  it("never supersedes the existing row, unlike applyAuthorDraft", () => {
    const withTrait = applyAuthorDraft([], { ...emmaIdentity, predicate: "core.trait", value: "Slow to trust" }, 0);
    const withBoth = applyAuthorAddition(withTrait, { ...emmaIdentity, predicate: "core.trait", value: "Keeps odd hours" }, 1);
    expect(withBoth.find((fact) => fact.value === "Slow to trust")?.superseded_by).toBeUndefined();
  });

  it("no-ops on an exact duplicate of what is already locked", () => {
    const withTrait = applyAuthorDraft([], { ...emmaIdentity, predicate: "core.trait", value: "Slow to trust" }, 0);
    const again = applyAuthorAddition(withTrait, { ...emmaIdentity, predicate: "core.trait", value: "slow to trust" }, 1);
    expect(again).toHaveLength(1);
  });

  it("locks straight in as a new row even with nothing else under that predicate yet", () => {
    const added = applyAuthorAddition([], emmaIdentity, 0);
    expect(added).toHaveLength(1);
    expect(added[0]?.status).toBe("locked");
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

describe("isPossibleEnrichment", () => {
  it("treats containment either direction as a near-duplicate", () => {
    expect(isPossibleEnrichment("A captain", "A captain on a space ship")).toBe(true);
    expect(isPossibleEnrichment("A captain on a space ship", "A captain")).toBe(true);
  });

  it("treats a high shared-word ratio as a near-duplicate even without containment", () => {
    expect(isPossibleEnrichment("Captain of the ship", "Captain and commander of the ship")).toBe(true);
  });

  it("does not flag genuinely different claims as near-duplicates", () => {
    expect(isPossibleEnrichment("A captain", "A cook")).toBe(false);
    expect(isPossibleEnrichment("A captain on a space ship", "A prisoner on the Odyssey")).toBe(false);
  });

  it("is false for an identical value", () => {
    expect(isPossibleEnrichment("A captain", "a captain")).toBe(false);
  });
});

function lockedJeffCaptain(): NarrativeFact {
  return {
    id: "locked-jeff",
    entity_ref: "jeff",
    entity_label: "Jeff",
    predicate: "core.identity",
    value: "A captain",
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-14T00:00:00.000Z"
  };
}

describe("possible_enrichment — near-duplicate facts get a merge suggestion", () => {
  it("evaluateCandidate proposes a merge instead of a hard conflict for an extractor near-duplicate", () => {
    const draft: FactDraft = { ...emmaIdentity, entity_ref: "jeff", entity_label: "Jeff", value: "A captain on a space ship" };
    const decision = evaluateCandidate(draft, [lockedJeffCaptain()], "extractor");
    expect(decision).toEqual({
      kind: "possible_enrichment",
      supersedesId: "locked-jeff",
      suggestedValue: "A captain on a space ship"
    });
  });

  it("applyExtractorDrafts creates a flagged, pre-merged suggestion rather than a conflict", () => {
    const draft: FactDraft = { entity_ref: "jeff", entity_label: "Jeff", predicate: "core.identity", value: "A captain on a space ship" };
    const next = applyExtractorDrafts([lockedJeffCaptain()], [draft], 1, "ch1");
    const suggestion = next.find((fact) => fact.is_merge_suggestion);
    expect(suggestion?.status).toBe("flagged");
    expect(suggestion?.value).toBe("A captain on a space ship");
    expect(suggestion?.conflict_with).toBe("locked-jeff");
  });

  it("a genuine conflict is never marked as a merge suggestion", () => {
    const draft: FactDraft = { entity_ref: "jeff", entity_label: "Jeff", predicate: "core.identity", value: "A cook" };
    const next = applyExtractorDrafts([lockedJeffCaptain()], [draft], 1, "ch1");
    const flagged = next.find((fact) => fact.status === "flagged");
    expect(flagged?.is_merge_suggestion).toBeUndefined();
  });

  it("approving a merge suggestion supersedes the old fact and locks the merged value, same mechanics as a conflict", () => {
    const draft: FactDraft = { entity_ref: "jeff", entity_label: "Jeff", predicate: "core.identity", value: "A captain on a space ship" };
    const withSuggestion = applyExtractorDrafts([lockedJeffCaptain()], [draft], 1, "ch1");
    const suggestion = withSuggestion.find((fact) => fact.is_merge_suggestion)!;
    const approved = approveFact(withSuggestion, suggestion.id);
    expect(approved.find((fact) => fact.id === "locked-jeff")?.superseded_by).toBe(suggestion.id);
    const live = approved.find((fact) => !fact.superseded_by);
    expect(live?.status).toBe("locked");
    expect(live?.value).toBe("A captain on a space ship");
    expect(live?.is_merge_suggestion).toBeUndefined();
  });

  it("skips a strictly less detailed restatement entirely — nothing new to review", () => {
    const detailed: NarrativeFact = { ...lockedJeffCaptain(), value: "A captain on the Odyssey, a cargo ship" };
    const draft: FactDraft = { entity_ref: "jeff", entity_label: "Jeff", predicate: "core.identity", value: "A captain" };
    const next = applyExtractorDrafts([detailed], [draft], 1, "ch1");
    expect(next).toHaveLength(1);
    expect(next[0]?.value).toBe("A captain on the Odyssey, a cargo ship");
  });
});
