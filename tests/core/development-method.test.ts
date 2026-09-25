import { describe, expect, it } from "vitest";
import { createBook } from "@core/BookSchema";
import {
  DEVELOPMENT_METHODS,
  developExpandUserPrompt,
  developmentMethodById,
  materializeBeats
} from "@core/developmentMethod";

describe("developmentMethodById", () => {
  it("finds a method by id", () => {
    expect(developmentMethodById("snowflake")?.id).toBe("snowflake");
    expect(developmentMethodById("three-act")?.id).toBe("three-act");
  });

  it("returns undefined for an unknown or missing id", () => {
    expect(developmentMethodById("nope")).toBeUndefined();
    expect(developmentMethodById(undefined)).toBeUndefined();
  });
});

describe("DEVELOPMENT_METHODS", () => {
  it("gives every method at least one step, all beat or all expand", () => {
    for (const method of DEVELOPMENT_METHODS) {
      expect(method.steps.length).toBeGreaterThan(0);
      const kinds = new Set(method.steps.map((step) => step.kind));
      expect(kinds.size).toBe(1);
    }
  });

  it("never repeats a step id within one method", () => {
    for (const method of DEVELOPMENT_METHODS) {
      const ids = method.steps.map((step) => step.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("materializeBeats", () => {
  it("adds one plotline per beat, using the given labels", () => {
    const book = createBook("Test");
    const method = developmentMethodById("three-act")!;
    const labels = Object.fromEntries(method.steps.map((step) => [step.id, `Beat: ${step.id}`]));
    const next = materializeBeats(book, method, labels);
    expect(next.plotlines).toHaveLength(method.steps.length);
    expect(next.plotlines.map((p) => p.title)).toContain("Beat: setup");
  });

  it("skips a beat whose label already exists as a plotline title", () => {
    const book = createBook("Test");
    const method = developmentMethodById("three-act")!;
    const labels = Object.fromEntries(method.steps.map((step) => [step.id, `Beat: ${step.id}`]));
    const once = materializeBeats(book, method, labels);
    const twice = materializeBeats(once, method, labels);
    expect(twice.plotlines).toHaveLength(method.steps.length);
  });

  it("does nothing for an expansion-based method (no beat steps)", () => {
    const book = createBook("Test");
    const method = developmentMethodById("snowflake")!;
    const next = materializeBeats(book, method, {});
    expect(next.plotlines).toHaveLength(0);
  });

  it("skips a beat with no resolved label", () => {
    const book = createBook("Test");
    const method = developmentMethodById("three-act")!;
    const next = materializeBeats(book, method, {});
    expect(next.plotlines).toHaveLength(0);
  });
});

describe("developExpandUserPrompt", () => {
  it("includes the step label, prompt, and the author's draft", () => {
    const book = createBook("Test");
    const prompt = developExpandUserPrompt({
      book,
      stepLabel: "One sentence",
      stepPrompt: "Sum it up in one sentence.",
      priorStepsText: "",
      draft: "A thief must return home."
    });
    expect(prompt).toContain("One sentence");
    expect(prompt).toContain("Sum it up in one sentence.");
    expect(prompt).toContain("A thief must return home.");
    expect(prompt).toContain("first step");
  });

  it("includes prior steps text when given", () => {
    const book = createBook("Test");
    const prompt = developExpandUserPrompt({
      book,
      stepLabel: "One paragraph",
      stepPrompt: "Grow it.",
      priorStepsText: "A thief must return home.",
      draft: ""
    });
    expect(prompt).toContain("already worked out");
    expect(prompt).toContain("A thief must return home.");
    expect(prompt).toContain("propose one");
  });
});
