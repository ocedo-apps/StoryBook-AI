import { invoke, isTauri } from "@tauri-apps/api/core";

export function isDesktopApp(): boolean {
  return isTauri();
}

export type ModelSizeTier = "3b" | "7b" | "14b" | "30b" | "70b";

export interface GpuSuggestion {
  vramMb: number;
  tier: ModelSizeTier;
}

interface GpuSuggestionPayload {
  vram_mb: number;
  tier: string;
}

const KNOWN_TIERS: ModelSizeTier[] = ["3b", "7b", "14b", "30b", "70b"];

export async function detectGpuSuggestion(): Promise<GpuSuggestion | null> {
  if (!isDesktopApp()) return null;
  const result = await invoke<GpuSuggestionPayload | null>("detect_gpu_suggestion");
  if (!result) return null;
  const tier = KNOWN_TIERS.includes(result.tier as ModelSizeTier) ? (result.tier as ModelSizeTier) : "7b";
  return { vramMb: result.vram_mb, tier };
}

export async function openOllamaDownloadPage(): Promise<void> {
  if (!isDesktopApp()) return;
  await invoke("open_ollama_download_page");
}
