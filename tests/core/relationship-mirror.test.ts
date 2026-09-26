import { describe, expect, it } from "vitest";
import { relationshipMirrorDraft, withRelationshipMirror, withRelationshipMirrorFor } from "@core/relationshipMirror";
import type { NarrativeFact } from "@core/NarrativeFact";
import type { EntityKind } from "@core/bibleGroups";

function lockedIdentity(entity_ref: string, entity_label: string): NarrativeFact {
  return {
    id: `${entity_ref}-identity`,
    entity_ref,
    entity_label,
    predicate: "core.identity",
    value: `${entity_label} is a character in the story`,
    sequence_index: 0,
    status: "locked",
    source: "author",
    created_at: "2026-09-26T00:00:00.000Z"
  };
}

function lockedRelationship(entity_ref: string, entity_label: string, value: string, id = `${entity_ref}-rel`): NarrativeFact {
  return {
    id,
    entity_ref,
    entity_label,
    predicate: "core.relationship",
    value,
    sequence_index: 1,
    status: "locked",
    source: "author",
    created_at: "2026-09-26T00:00:00.000Z"
  };
}

const kinds: EntityKind[] = [];

describe("relationshipMirrorDraft", () => {
  it("drafts the same claim for the other named character, names swapped", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const draft = relationshipMirrorDraft(fact, [...facts, fact], kinds);
    expect(draft).toEqual({
      entity_ref: "erik",
      entity_label: "Erik",
      predicate: "core.relationship",
      value: "Met Anna at the docks ten years ago"
    });
  });

  it("does nothing for a non-relationship predicate", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = { ...lockedRelationship("anna", "Anna", "Met Erik at the docks"), predicate: "core.identity" as const };
    expect(relationshipMirrorDraft(fact, [...facts, fact], kinds)).toBeUndefined();
  });

  it("does nothing when the value names no known character", () => {
    const facts = [lockedIdentity("anna", "Anna")];
    const fact = lockedRelationship("anna", "Anna", "Trusts no one since the war");
    expect(relationshipMirrorDraft(fact, [...facts, fact], kinds)).toBeUndefined();
  });

  it("refuses to guess when the value names more than one other character", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik"), lockedIdentity("björn", "Björn")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik and Björn at the same time, at the docks");
    expect(relationshipMirrorDraft(fact, [...facts, fact], kinds)).toBeUndefined();
  });
});

describe("withRelationshipMirror", () => {
  it("queues a pending proposal on the other character when nothing conflicts yet", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const next = withRelationshipMirror([...facts, fact], fact, kinds);
    const mirrored = next.find((row) => row.entity_ref === "erik" && row.predicate === "core.relationship");
    expect(mirrored?.status).toBe("ai_proposed");
    expect(mirrored?.value).toBe("Met Anna at the docks ten years ago");
  });

  it("flags a real conflict instead of silently locking, when Erik's own facts already disagree", () => {
    const erikExisting = lockedRelationship("erik", "Erik", "Has never met Anna", "erik-existing");
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik"), erikExisting];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const next = withRelationshipMirror([...facts, fact], fact, kinds);
    const flagged = next.find((row) => row.entity_ref === "erik" && row.status === "flagged");
    expect(flagged).toBeTruthy();
    expect(flagged?.conflict_with).toBe("erik-existing");
  });

  it("never locks the mirrored claim directly", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const next = withRelationshipMirror([...facts, fact], fact, kinds);
    expect(next.some((row) => row.entity_ref === "erik" && row.predicate === "core.relationship" && row.status === "locked")).toBe(
      false
    );
  });
});

describe("withRelationshipMirrorFor", () => {
  it("no-ops when the matching claim never actually landed as locked truth", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const next = withRelationshipMirrorFor(facts, { entity_ref: "anna", predicate: "core.relationship", value: "Never established" }, kinds);
    expect(next).toBe(facts);
  });

  it("finds the freshly-locked fact by its claim and mirrors it", () => {
    const facts = [lockedIdentity("anna", "Anna"), lockedIdentity("erik", "Erik")];
    const fact = lockedRelationship("anna", "Anna", "Met Erik at the docks ten years ago");
    const applied = [...facts, fact];
    const next = withRelationshipMirrorFor(
      applied,
      { entity_ref: "anna", predicate: "core.relationship", value: "Met Erik at the docks ten years ago" },
      kinds
    );
    expect(next.some((row) => row.entity_ref === "erik" && row.status === "ai_proposed")).toBe(true);
  });
});
