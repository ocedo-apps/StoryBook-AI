export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Stable entity key from a displayed name. "Emma Vale" → "emma-vale". */
export function slugify(label: string): string {
  const slug = label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "unnamed";
}

export function normalizeValue(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
