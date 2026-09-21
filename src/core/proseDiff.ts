export const LIVE_HISTORY_ID = "__live__";

export type ProseDiffHunk = { type: "eq" | "ins" | "del"; text: string };

/** Words and the whitespace between them, so joining reconstructs the text. */
export function tokenizeProse(text: string): string[] {
  if (text === "") return [];
  return text.match(/\s+|[^\s]+/g) ?? [];
}

export function defaultCompareId(selectedId: string, revisionIds: readonly string[]): string | null {
  if (revisionIds.length === 0) return null;
  if (selectedId === LIVE_HISTORY_ID) return revisionIds[0] ?? null;
  return LIVE_HISTORY_ID;
}

export function joinHunks(hunks: readonly ProseDiffHunk[], skip: ProseDiffHunk["type"]): string {
  let out = "";
  for (const hunk of hunks) {
    if (hunk.type === skip) continue;
    out += hunk.text;
  }
  return out;
}

export function diffProse(from: string, to: string): ProseDiffHunk[] {
  if (from === to) return from ? [{ type: "eq", text: from }] : [];
  const a = tokenizeProse(from);
  const b = tokenizeProse(to);
  return mergeHunks(myersTokens(a, b));
}

function mergeHunks(hunks: ProseDiffHunk[]): ProseDiffHunk[] {
  const merged: ProseDiffHunk[] = [];
  for (const hunk of hunks) {
    const last = merged[merged.length - 1];
    if (last && last.type === hunk.type) last.text += hunk.text;
    else merged.push({ type: hunk.type, text: hunk.text });
  }
  return merged;
}

/** Myers shortest-edit script on tokens. */
function myersTokens(a: readonly string[], b: readonly string[]): ProseDiffHunk[] {
  const n = a.length;
  const m = b.length;
  if (n === 0 && m === 0) return [];
  if (n === 0) return [{ type: "ins", text: b.join("") }];
  if (m === 0) return [{ type: "del", text: a.join("") }];

  const max = n + m;
  const offset = max;
  const v = new Int32Array(2 * max + 1);
  const traces: Int32Array[] = [];

  for (let d = 0; d <= max; d++) {
    traces.push(Int32Array.from(v));
    for (let k = -d; k <= d; k += 2) {
      const kIndex = k + offset;
      let x: number;
      if (k === -d || (k !== d && v[kIndex - 1]! < v[kIndex + 1]!)) {
        x = v[kIndex + 1]!;
      } else {
        x = v[kIndex - 1]! + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x += 1;
        y += 1;
      }
      v[kIndex] = x;
      if (x >= n && y >= m) return backtrack(a, b, traces, d, offset);
    }
  }
  return [{ type: "del", text: a.join("") }, { type: "ins", text: b.join("") }];
}

function backtrack(
  a: readonly string[],
  b: readonly string[],
  traces: readonly Int32Array[],
  dHit: number,
  offset: number
): ProseDiffHunk[] {
  const hunks: ProseDiffHunk[] = [];
  let x = a.length;
  let y = b.length;

  for (let d = dHit; d >= 0; d--) {
    const v = traces[d];
    if (!v) break;
    const k = x - y;
    let prevK: number;
    if (k === -d || (k !== d && v[k - 1 + offset]! < v[k + 1 + offset]!)) prevK = k + 1;
    else prevK = k - 1;
    const prevX = v[prevK + offset] ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      hunks.push({ type: "eq", text: a[x - 1]! });
      x -= 1;
      y -= 1;
    }
    if (d === 0) break;
    if (x === prevX) {
      hunks.push({ type: "ins", text: b[y - 1]! });
      y -= 1;
    } else {
      hunks.push({ type: "del", text: a[x - 1]! });
      x -= 1;
    }
  }

  hunks.reverse();
  return hunks;
}
