import { isTauri } from "@tauri-apps/api/core";
import { fetch as tauriHttpFetch } from "@tauri-apps/plugin-http";

/**
 * In the desktop app, routes local-server requests through the Tauri HTTP
 * plugin — the Rust backend makes the request, not the webview, so it is
 * never subject to the webview's own CORS check (project_spec.md,
 * 2026-10-08: a tester's local server, reachable fine from the browser app,
 * was blocked from the installed desktop app because Tauri's production
 * build loads from its own internal origin, not http://localhost:5175, and
 * few local model servers allow that origin by default). The plain web app
 * has no Rust backend to route through, so it always uses the browser's own
 * fetch there, where the target server's CORS configuration still applies
 * exactly as before.
 */
export function localServerFetch(): typeof fetch {
  return isTauri() ? (tauriHttpFetch as unknown as typeof fetch) : globalThis.fetch.bind(globalThis);
}
