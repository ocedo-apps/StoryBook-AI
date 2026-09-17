import { groupBibleEntities, type BibleEntityGroup } from "./bibleGroups";
import type { Book } from "./BookSchema";
import { profileFor } from "./characterProfile";
import { picturesFor, type EntityPicture } from "./entityMedia";
import { slugify } from "./ids";
import type { NarrativeFact } from "./NarrativeFact";

/** Same kind Sandbox Import backup already reads. */
export const SANDBOX_LIBRARY_KIND = "ai-sandbox-library";
export const SANDBOX_LIBRARY_FORMAT = 1;

export type SandboxCharacterCard = {
  id: string;
  name: string;
  knownAs: string;
  familyName: string;
  middleName: string;
  personality: string;
  mood: string;
  appearance: string;
  lore: [];
  position: string;
  scenario: string;
  tags: string[];
  source: "player";
  createdAt: string;
  updatedAt: string;
  pronoun?: string;
  approximateAge?: number;
  portraitDataUrl?: string;
};

export type SandboxPlaceCard = {
  id: string;
  name: string;
  lighting: string;
  noise: string;
  music: boolean;
  note: string;
  rooms: [];
  realmId: string;
  tags: string[];
  source: "player";
  createdAt: string;
  updatedAt: string;
  brief?: string;
  thumbDataUrl?: string;
  imageDataUrl?: string;
  gallery?: { thumbDataUrl: string; imageDataUrl: string }[];
};

export type SandboxRealmCard = {
  id: string;
  name: string;
  note: string;
  source: "player";
  createdAt: string;
  updatedAt: string;
};

export type SandboxObjectCard = {
  id: string;
  name: string;
  note: string;
  tags: string[];
  source: "player";
  createdAt: string;
  updatedAt: string;
};

export type SandboxLibraryExport = {
  kind: typeof SANDBOX_LIBRARY_KIND;
  format: number;
  exportedAt: string;
  characters: SandboxCharacterCard[];
  places: SandboxPlaceCard[];
  realms: SandboxRealmCard[];
  stories: [];
  voices: [];
  rulesets: [];
  objects: SandboxObjectCard[];
  campaigns: [];
};

function cardId(bookId: string, entityRef: string): string {
  return `sb-${bookId}-${entityRef}`;
}

export function sandboxRealmId(bookId: string): string {
  return `sb-realm-${bookId}`;
}

function joinClaims(facts: NarrativeFact[]): string {
  return facts
    .map((fact) => fact.value.trim())
    .filter(Boolean)
    .join("\n");
}

function coverAndGallery(pictures: EntityPicture[]): {
  thumbDataUrl?: string;
  imageDataUrl?: string;
  gallery?: { thumbDataUrl: string; imageDataUrl: string }[];
} {
  const [cover, ...rest] = pictures;
  if (!cover) return {};
  const out: {
    thumbDataUrl?: string;
    imageDataUrl?: string;
    gallery?: { thumbDataUrl: string; imageDataUrl: string }[];
  } = {
    thumbDataUrl: cover.thumbDataUrl,
    imageDataUrl: cover.imageDataUrl
  };
  if (rest.length > 0) {
    out.gallery = rest.map((picture) => ({
      thumbDataUrl: picture.thumbDataUrl,
      imageDataUrl: picture.imageDataUrl
    }));
  }
  return out;
}

function characterCard(book: Book, entity: BibleEntityGroup, stamped: string): SandboxCharacterCard {
  const profile = profileFor(book.profiles, entity.entity_ref);
  const claims = joinClaims(entity.facts);
  const fromProfile = profile.personality.trim();
  const personality =
    fromProfile && claims && !fromProfile.includes(claims) ? `${fromProfile}\n\n${claims}` : fromProfile || claims;
  const pictures = picturesFor(book.media, entity.entity_ref);
  const portrait = pictures[0]?.imageDataUrl;
  const card: SandboxCharacterCard = {
    id: cardId(book.id, entity.entity_ref),
    name: entity.entity_label,
    knownAs: "",
    familyName: "",
    middleName: "",
    personality,
    mood: "",
    appearance: profile.looks.trim(),
    lore: [],
    position: "",
    scenario: "",
    tags: [...profile.tags],
    source: "player",
    createdAt: stamped,
    updatedAt: stamped
  };
  if (profile.pronoun) card.pronoun = profile.pronoun;
  if (profile.approximateAge !== undefined) card.approximateAge = profile.approximateAge;
  if (portrait) card.portraitDataUrl = portrait;
  return card;
}

function placeCard(book: Book, entity: BibleEntityGroup, realmId: string, stamped: string): SandboxPlaceCard {
  const note = joinClaims(entity.facts);
  const pictures = coverAndGallery(picturesFor(book.media, entity.entity_ref));
  const card: SandboxPlaceCard = {
    id: cardId(book.id, entity.entity_ref),
    name: entity.entity_label,
    lighting: "",
    noise: "",
    music: false,
    note,
    rooms: [],
    realmId,
    tags: [],
    source: "player",
    createdAt: stamped,
    updatedAt: stamped
  };
  if (note) card.brief = note;
  if (pictures.thumbDataUrl) card.thumbDataUrl = pictures.thumbDataUrl;
  if (pictures.imageDataUrl) card.imageDataUrl = pictures.imageDataUrl;
  if (pictures.gallery) card.gallery = pictures.gallery;
  return card;
}

function objectCard(book: Book, entity: BibleEntityGroup, stamped: string): SandboxObjectCard {
  return {
    id: cardId(book.id, entity.entity_ref),
    name: entity.entity_label,
    note: joinClaims(entity.facts),
    tags: [],
    source: "player",
    createdAt: stamped,
    updatedAt: stamped
  };
}

/** Characters, locations, and objects as a Sandbox library backup. Lossy on purpose. */
export function exportSandboxCards(book: Book, exportedAt = new Date().toISOString()): SandboxLibraryExport {
  const sections = groupBibleEntities(book.facts, book.entity_kinds);
  const characters = sections.find((section) => section.kind === "characters")?.entities ?? [];
  const locations = sections.find((section) => section.kind === "locations")?.entities ?? [];
  const objects = sections.find((section) => section.kind === "objects")?.entities ?? [];
  const stamped = book.updated_at || exportedAt;
  const realmId = sandboxRealmId(book.id);

  const payload: SandboxLibraryExport = {
    kind: SANDBOX_LIBRARY_KIND,
    format: SANDBOX_LIBRARY_FORMAT,
    exportedAt,
    characters: characters.map((entity) => characterCard(book, entity, stamped)),
    places: locations.map((entity) => placeCard(book, entity, realmId, stamped)),
    realms:
      locations.length > 0
        ? [
            {
              id: realmId,
              name: book.title.trim() || "Untitled manuscript",
              note: "",
              source: "player",
              createdAt: stamped,
              updatedAt: stamped
            }
          ]
        : [],
    stories: [],
    voices: [],
    rulesets: [],
    objects: objects.map((entity) => objectCard(book, entity, stamped)),
    campaigns: []
  };
  return payload;
}

export function sandboxCardCount(payload: SandboxLibraryExport): number {
  return payload.characters.length + payload.places.length + payload.objects.length;
}

export function sandboxExportFilename(book: Book, exportedAt = new Date().toISOString()): string {
  const slug = slugify(book.title) || "manuscript";
  const day = exportedAt.slice(0, 10) || new Date().toISOString().slice(0, 10);
  return `${slug}-sandbox-cards-${day}.json`;
}
