import type { FieldId, Layout } from './types';

export type LineMap = Partial<Record<FieldId, string | null>>;

// Only dekoTop / topText / bottomText get the * X * star wrap.
export function withStars(t: string | null | undefined, on: boolean): string | null | undefined {
  if (!t) return t;
  return on ? `* ${t} *` : t;
}

// Split a fully-wrapped field string into [openingTags, plainInner, closingTags]
// IFF it is a clean symmetric tag nest around plain text (no nested tags, no
// leading/trailing literals like the `* … *` star wrap). Returns null otherwise,
// which makes the line un-mergeable (gradients, rainbows, star-wrapped lines,
// kaomoji containing < or > are all left untouched — correctness over savings).
function decompose(s: string): { pre: string; inner: string; suf: string } | null {
  const m = s.match(/^((?:<(?:size=\d+|color=#[0-9a-fA-F]{6}|b|i)>)+)([^<>]*)((?:<\/(?:size|color|b|i)>)+)$/);
  if (!m) return null;
  const [, pre, inner, suf] = m;
  const opens = (pre.match(/<(\w+)/g) ?? []).map((x) => x.slice(1));
  const closes = (suf.match(/<\/(\w+)>/g) ?? []).map((x) => x.slice(2, -1));
  if (opens.length !== closes.length) return null;
  // symmetric nest: outermost open matches outermost (last) close, …
  for (let i = 0; i < opens.length; i++) if (opens[i] !== closes[closes.length - 1 - i]) return null;
  return { pre, inner, suf };
}

// Stack field strings vertically, but collapse runs of adjacent lines that
// share an IDENTICAL tag wrapper (same size + colour + bold/italic) into a
// single wrapper holding the lines separated by '\n'. So the star pyramid
//   <size=16><color=#ffd84d>✦</color></size>
//   <size=16><color=#ffd84d>✦ · ✦</color></size>
//   <size=16><color=#ffd84d>✦ · ✦ · ✦</color></size>
// becomes
//   <size=16><color=#ffd84d>✦
//   ✦ · ✦
//   ✦ · ✦ · ✦</color></size>
// A run of length 1 re-emits the original string verbatim (byte-identical).
function mergeStack(parts: (string | null | undefined)[]): string {
  const lines = parts.filter(Boolean) as string[];
  const out: string[] = [];
  let run: { pre: string; suf: string; inners: string[] } | null = null;
  const flush = () => {
    if (run) {
      out.push(run.pre + run.inners.join('\n') + run.suf);
      run = null;
    }
  };
  for (const line of lines) {
    const d = decompose(line);
    if (d && run && run.pre === d.pre && run.suf === d.suf) {
      run.inners.push(d.inner);
    } else {
      flush();
      run = d ? { pre: d.pre, suf: d.suf, inners: [d.inner] } : null;
      if (!d) out.push(line);
    }
  }
  flush();
  return out.join('\n');
}

export function applyLayout(
  lm: LineMap,
  layout: Layout,
  lineOrder: FieldId[],
  stars: { dekoTop: boolean; topText: boolean; bottomText: boolean },
): string {
  const ord = lineOrder;
  const w: Record<FieldId, string | null | undefined> = {
    dekoTop: withStars(lm.dekoTop, stars.dekoTop),
    topText: withStars(lm.topText, stars.topText),
    mainText: lm.mainText,
    bottomText: withStars(lm.bottomText, stars.bottomText),
    kaomoji: lm.kaomoji,
    dekoBottom: lm.dekoBottom,
  };

  // 'pyramid' stacks centered like 'center' — its triangle comes from gold deco
  // lines that grow in width (3dxchat centers every line, so leading-space
  // indent can't work); the text sits normally below.
  if (layout === 'center' || layout === 'pyramid' || layout === 'sparkle' || layout === 'heart') return mergeStack(ord.map((f) => w[f]));
  if (layout === 'inline') {
    return mergeStack([[w.dekoTop, w.topText, w.mainText, w.dekoTop].filter(Boolean).join(' '), w.bottomText, w.kaomoji, w.dekoBottom]);
  }
  return mergeStack(Object.values(w));
}
