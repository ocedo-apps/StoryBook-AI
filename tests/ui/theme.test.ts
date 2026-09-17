import { describe, expect, it } from "vitest";
import { parseTheme } from "../../src/ui/theme";

describe("parseTheme", () => {
  it("only treats light as light", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme(null)).toBe("dark");
    expect(parseTheme("")).toBe("dark");
  });
});
