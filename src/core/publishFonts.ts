import asapRegularUrl from "../assets/fonts/asap/Asap-Regular.ttf?url";
import asapBoldUrl from "../assets/fonts/asap/Asap-Bold.ttf?url";
import literataRegularUrl from "../assets/fonts/literata/Literata-Regular.ttf?url";
import literataBoldUrl from "../assets/fonts/literata/Literata-Bold.ttf?url";
import loraRegularUrl from "../assets/fonts/lora/Lora-Regular.ttf?url";
import loraBoldUrl from "../assets/fonts/lora/Lora-Bold.ttf?url";
import sourceSerif4RegularUrl from "../assets/fonts/source-serif-4/SourceSerif4-Regular.ttf?url";
import sourceSerif4BoldUrl from "../assets/fonts/source-serif-4/SourceSerif4-Bold.ttf?url";

export const PUBLISH_FONT_IDS = ["system", "lora", "literata", "source-serif-4", "asap"] as const;
export type PublishFontId = (typeof PUBLISH_FONT_IDS)[number];

export type PublishFontOption = {
  id: PublishFontId;
  label: string;
  /** The bare family name, used in @font-face declarations, RTF/ODT font tables, and PDF metadata. */
  name: string;
  /** The CSS font-family value, name plus fallbacks. */
  stack: string;
  category: "serif" | "sans";
};

export const PUBLISH_FONTS: PublishFontOption[] = [
  {
    id: "system",
    label: "System serif (Times/Georgia)",
    name: "Georgia",
    stack: `Georgia, "Times New Roman", serif`,
    category: "serif"
  },
  { id: "lora", label: "Lora", name: "Lora", stack: `Lora, Georgia, serif`, category: "serif" },
  { id: "literata", label: "Literata", name: "Literata", stack: `Literata, Georgia, serif`, category: "serif" },
  {
    id: "source-serif-4",
    label: "Source Serif 4",
    name: "Source Serif 4",
    stack: `"Source Serif 4", Georgia, serif`,
    category: "serif"
  },
  { id: "asap", label: "Asap", name: "Asap", stack: `Asap, Arial, sans-serif`, category: "sans" }
];

const PUBLISH_FONT_FILES: Record<Exclude<PublishFontId, "system">, { regular: string; bold: string }> = {
  lora: { regular: loraRegularUrl, bold: loraBoldUrl },
  literata: { regular: literataRegularUrl, bold: literataBoldUrl },
  "source-serif-4": { regular: sourceSerif4RegularUrl, bold: sourceSerif4BoldUrl },
  asap: { regular: asapRegularUrl, bold: asapBoldUrl }
};

export function publishFontById(id: PublishFontId): PublishFontOption {
  return PUBLISH_FONTS.find((font) => font.id === id) ?? PUBLISH_FONTS[0]!;
}

export type PublishFontEmbed = { regular: Uint8Array; bold: Uint8Array };

/** Fetches the regular and bold font files for embedding. `system` has none — the formats fall back to their built-in default. */
export async function loadPublishFontEmbed(id: PublishFontId): Promise<PublishFontEmbed | undefined> {
  if (id === "system") return undefined;
  const files = PUBLISH_FONT_FILES[id];
  const [regular, bold] = await Promise.all([
    fetch(files.regular).then((res) => res.arrayBuffer()),
    fetch(files.bold).then((res) => res.arrayBuffer())
  ]);
  return { regular: new Uint8Array(regular), bold: new Uint8Array(bold) };
}
