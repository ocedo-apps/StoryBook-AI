import { describe, expect, it } from "vitest";
import {
  emptyEventProfile,
  eventProfileFor,
  eventProfileIsEmpty,
  eventsAtLocation,
  participantsAtLocation,
  upsertEventProfile
} from "@core/eventProfile";

describe("eventProfileFor / emptyEventProfile", () => {
  it("returns an empty profile for an event with no row yet", () => {
    expect(eventProfileFor([], "the-storm")).toEqual(emptyEventProfile("the-storm"));
  });

  it("finds the matching row by entity_ref", () => {
    const rows = [{ entity_ref: "the-storm", where: "harbor", participants: ["emma"] }];
    expect(eventProfileFor(rows, "the-storm")).toEqual(rows[0]);
  });
});

describe("upsertEventProfile", () => {
  it("sets where and participants", () => {
    const next = upsertEventProfile([], { entity_ref: "the-storm", where: "harbor", participants: ["emma", "jeff"] });
    expect(next).toEqual([{ entity_ref: "the-storm", where: "harbor", participants: ["emma", "jeff"] }]);
  });

  it("drops the row entirely once where and participants are both cleared", () => {
    const once = upsertEventProfile([], { entity_ref: "the-storm", where: "harbor" });
    expect(upsertEventProfile(once, { entity_ref: "the-storm", where: undefined, participants: [] })).toEqual([]);
  });

  it("replaces the existing row for that entity_ref rather than duplicating it", () => {
    const once = upsertEventProfile([], { entity_ref: "the-storm", where: "harbor" });
    const twice = upsertEventProfile(once, { entity_ref: "the-storm", where: "lighthouse" });
    expect(twice).toEqual([{ entity_ref: "the-storm", where: "lighthouse", participants: [] }]);
  });

  it("ignores a blank where, same as unset", () => {
    const next = upsertEventProfile([], { entity_ref: "the-storm", where: "   " });
    expect(eventProfileIsEmpty(next[0] ?? emptyEventProfile("the-storm"))).toBe(true);
  });
});

describe("eventsAtLocation / participantsAtLocation", () => {
  const profiles = [
    { entity_ref: "the-storm", where: "harbor", participants: ["emma", "jeff"] },
    { entity_ref: "the-reveal", where: "harbor", participants: ["jeff", "marcus"] },
    { entity_ref: "the-departure", where: "lighthouse", participants: ["emma"] }
  ];

  it("lists every event placed at a location", () => {
    expect(eventsAtLocation(profiles, "harbor")).toEqual(["the-storm", "the-reveal"]);
    expect(eventsAtLocation(profiles, "lighthouse")).toEqual(["the-departure"]);
    expect(eventsAtLocation(profiles, "nowhere")).toEqual([]);
  });

  it("unions participants across every event at that location, de-duplicated, first-seen order", () => {
    expect(participantsAtLocation(profiles, "harbor")).toEqual(["emma", "jeff", "marcus"]);
  });

  it("returns nothing for a location with no events", () => {
    expect(participantsAtLocation(profiles, "nowhere")).toEqual([]);
  });
});
