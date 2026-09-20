export type CountCopy = {
  one: string;
  other: string;
  zero?: string;
  few?: string;
  many?: string;
};

/** `{name}` placeholders. Unknown keys stay in the string. */
export function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const value = vars[key];
    return value === undefined ? whole : String(value);
  });
}

/**
 * one/other now. A later locale may add zero, few, or many;
 * count() will pick them when present without changing callers.
 */
export function count(n: number, forms: CountCopy): string {
  let template = forms.other;
  if (n === 0 && forms.zero) template = forms.zero;
  else if (n === 1) template = forms.one;
  else if (n >= 2 && n <= 4 && forms.few) template = forms.few;
  else if (forms.many && n >= 5) template = forms.many;
  return format(template, { count: n });
}

export function messageLeafPaths(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return prefix ? [prefix] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => messageLeafPaths(item, prefix ? `${prefix}.${index}` : String(index)));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => messageLeafPaths(item, prefix ? `${prefix}.${key}` : key));
  }
  return prefix ? [prefix] : [];
}
