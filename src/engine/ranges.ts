import type { FontStyle } from './fonts';

// Styling below the line level.
//
// A line is one string plus a base style. Anything that should look different
// inside it is a range over character offsets — not a chopped-up list of
// fragments — so editing the text keeps the styling attached to positions and
// the data stays readable:
//
//   { text: '.. der suppe ✿★', baseStyle: { color: '#ff4f9a', size: 38 },
//     ranges: [ { start: 3, end: 6, style: { color: '#ffffff' } } ] }
//
// Offsets count code points, not UTF-16 units, so ✿ and ★ count as one each
// and a range never lands in the middle of a character.

export interface TextStyle {
  color?: string;
  /** Untagged: 3dxchat draws its default white and the wrapper costs nothing. */
  noColor?: boolean;
  size?: number;
  font?: FontStyle;
  bold?: boolean;
  italic?: boolean;
}

export interface StyleRange {
  start: number;
  end: number;
  style: TextStyle;
}

/** Character-count of a string, counting astral characters as one. */
export const charLen = (s: string): number => [...s].length;

/** Slice by code point, so ranges never split a character in half. */
export const charSlice = (s: string, start: number, end: number): string =>
  [...s].slice(start, end).join('');

/**
 * Cut a line into the longest runs that share one effective style.
 *
 * Later ranges win over earlier ones on the properties they name; everything
 * they leave out falls through to the base. Neighbouring runs that end up
 * identical are merged, which matters: every extra run is another pair of tags
 * and the gift has 255 bytes to live in.
 */
export function resolveRuns(
  text: string,
  base: TextStyle,
  ranges: StyleRange[] = [],
): { text: string; style: TextStyle }[] {
  const n = charLen(text);
  if (!n) return [];

  const usable = ranges
    .filter((r) => r.end > r.start && r.start < n && r.end > 0)
    .map((r) => ({ ...r, start: Math.max(0, r.start), end: Math.min(n, r.end) }));

  if (!usable.length) return [{ text, style: base }];

  // Every range edge starts a new run.
  const cuts = new Set<number>([0, n]);
  for (const r of usable) { cuts.add(r.start); cuts.add(r.end); }
  const bounds = [...cuts].sort((a, b) => a - b);

  const out: { text: string; style: TextStyle }[] = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const from = bounds[i], to = bounds[i + 1];
    if (to <= from) continue;
    let style: TextStyle = { ...base };
    for (const r of usable) if (r.start <= from && r.end >= to) style = { ...style, ...r.style };
    const chunk = charSlice(text, from, to);
    const prev = out[out.length - 1];
    if (prev && sameStyle(prev.style, style)) prev.text += chunk;
    else out.push({ text: chunk, style });
  }
  return out;
}

function sameStyle(a: TextStyle, b: TextStyle): boolean {
  return (
    a.color === b.color &&
    !!a.noColor === !!b.noColor &&
    a.size === b.size &&
    a.font === b.font &&
    !!a.bold === !!b.bold &&
    !!a.italic === !!b.italic
  );
}

/**
 * Apply a style to a stretch of a line, returning the new range list.
 * Overlaps with what is already there are trimmed away first, so the newest
 * choice wins and the list never grows into a pile of dead entries.
 */
export function applyRange(
  ranges: StyleRange[],
  start: number,
  end: number,
  style: TextStyle,
): StyleRange[] {
  if (end <= start) return ranges;
  const out: StyleRange[] = [];
  for (const r of ranges) {
    if (r.end <= start || r.start >= end) { out.push(r); continue; }   // untouched
    if (r.start < start) out.push({ ...r, end: start });               // keep the head
    if (r.end > end) out.push({ ...r, start: end });                   // keep the tail
  }
  out.push({ start, end, style });
  return out.sort((a, b) => a.start - b.start);
}

/**
 * Keep ranges pointing at the right characters after the text changed.
 * Without this, typing at the front of a line would drag every colour along
 * with it. A crude but predictable rule: shift what sits after the edit.
 */
export function shiftRanges(ranges: StyleRange[], at: number, delta: number): StyleRange[] {
  if (!delta) return ranges;
  return ranges
    .map((r) => ({
      ...r,
      start: r.start >= at ? Math.max(at, r.start + delta) : r.start,
      end: r.end > at ? Math.max(at, r.end + delta) : r.end,
    }))
    .filter((r) => r.end > r.start);
}

/** Where two strings first differ, and by how much they differ in length. */
export function diffPoint(before: string, after: string): { at: number; delta: number } {
  const a = [...before], b = [...after];
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return { at: i, delta: b.length - a.length };
}

/**
 * Letter mode picks characters one by one; the engine wants ranges. Group the
 * picked indices into their contiguous stretches — {3,4,5,9} → [3,6), [9,10).
 */
export function spansOf(picked: Iterable<number>): [number, number][] {
  const idx = [...new Set(picked)].sort((a, b) => a - b);
  const out: [number, number][] = [];
  for (const i of idx) {
    const last = out[out.length - 1];
    if (last && last[1] === i) last[1] = i + 1;
    else out.push([i, i + 1]);
  }
  return out;
}

/**
 * One glyph click in letter mode. Pure on purpose: the anchor comes in as an
 * argument instead of being read from a ref inside a state updater, because
 * React may run an updater twice and the second run would see a moved anchor.
 *
 * @param anchor the index of the previous click, or null to start fresh
 */
export function togglePick(prev: Iterable<number>, anchor: number | null, i: number, shift: boolean): Set<number> {
  const next = new Set(prev);
  if (shift && anchor !== null) {
    const [a, b] = anchor < i ? [anchor, i] : [i, anchor];
    for (let n = a; n <= b; n++) next.add(n);
  } else if (next.has(i)) next.delete(i);
  else next.add(i);
  return next;
}
