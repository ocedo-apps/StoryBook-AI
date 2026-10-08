import { afterEach, describe, expect, it } from "vitest";
import { fetch as tauriHttpFetch } from "@tauri-apps/plugin-http";
import { localServerFetch } from "@llm/tauriFetch";

describe("localServerFetch", () => {
  afterEach(() => {
    delete (globalThis as { isTauri?: boolean }).isTauri;
  });

  it("uses the browser's own fetch outside Tauri", () => {
    const picked = localServerFetch();
    expect(picked).not.toBe(tauriHttpFetch);
    expect(typeof picked).toBe("function");
  });

  it("routes through the Tauri HTTP plugin (Rust, not the webview — bypasses CORS) when running as the desktop app", () => {
    (globalThis as { isTauri?: boolean }).isTauri = true;
    expect(localServerFetch()).toBe(tauriHttpFetch);
  });
});
