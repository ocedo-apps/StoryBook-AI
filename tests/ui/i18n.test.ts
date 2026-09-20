import { describe, expect, it } from "vitest";
import { count, format, messageLeafPaths } from "../../src/ui/i18n/format";
import { en } from "../../src/ui/i18n/en";
import { nb } from "../../src/ui/i18n/nb";
import { sv } from "../../src/ui/i18n/sv";
import { matchLocale, parseLocale, LOCALE_PACKS } from "../../src/ui/i18n/locale";
import { STORE_ERROR, translateError } from "../../src/ui/i18n/errors";

describe("matchLocale", () => {
  it("keeps a known id", () => {
    expect(parseLocale("sv")).toBe("sv");
    expect(parseLocale("en")).toBe("en");
    expect(parseLocale("nb")).toBe("nb");
  });

  it("maps a regional tag onto the registered prefix", () => {
    expect(matchLocale("sv-SE")).toBe("sv");
    expect(matchLocale("en_GB")).toBe("en");
    expect(matchLocale("nb-NO")).toBe("nb");
  });

  it("maps Norwegian aliases onto Bokmål", () => {
    expect(matchLocale("no")).toBe("nb");
    expect(matchLocale("no-NO")).toBe("nb");
  });

  it("falls back to English when the locale is unknown", () => {
    expect(matchLocale("fr")).toBe("en");
    expect(matchLocale("")).toBe("en");
    expect(matchLocale(null)).toBe("en");
  });
});

describe("catalogs", () => {
  it("give every registered pack the same message leaves as English", () => {
    const english = messageLeafPaths(en);
    expect(english.length).toBeGreaterThan(80);
    for (const pack of LOCALE_PACKS) {
      expect(messageLeafPaths(pack.messages)).toEqual(english);
    }
  });

  it("keeps POV as camera mode and Viewpoint as the named character", () => {
    expect(en.craft.pov).toBe("POV");
    expect(en.craft.povAria).toBe("Point of view");
    expect(en.craft.viewpoint).toBe("Viewpoint");
    expect(sv.craft.pov).toBe("Perspektiv");
    expect(sv.craft.povAria).toBe("Berättarperspektiv");
    expect(sv.craft.viewpoint).toBe("Synvinkel");
    expect(nb.craft.pov).toBe("Perspektiv");
    expect(nb.craft.povAria).toBe("Fortellerperspektiv");
    expect(nb.craft.viewpoint).toBe("Synsvinkel");
  });
});

describe("format", () => {
  it("fills named placeholders and leaves unknown keys", () => {
    expect(format("Replace “{title}”", { title: "Night Keys" })).toBe("Replace “Night Keys”");
    expect(format("Hello {name}", {})).toBe("Hello {name}");
  });

  it("picks one vs other", () => {
    const forms = { one: "{count} chapter", other: "{count} chapters" };
    expect(count(1, forms)).toBe("1 chapter");
    expect(count(3, forms)).toBe("3 chapters");
  });
});

describe("translateError", () => {
  it("maps store codes through the active catalog", () => {
    expect(translateError(STORE_ERROR.noModel, en)).toBe(en.errors.noModel);
    expect(translateError("not-backup", en)).toBe(en.backup.errors["not-backup"]);
    expect(translateError("raw ollama", en)).toBe("raw ollama");
  });
});
