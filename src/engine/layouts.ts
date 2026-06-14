import type { FieldId, Layout } from './types';

export type LineMap = Partial<Record<FieldId, string | null>>;

// Only dekoTop / topText / bottomText get the * X * star wrap.
export function withStars(t: string | null | undefined, on: boolean): string | null | undefined {
  if (!t) return t;
  return on ? `* ${t} *` : t;
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

  // 'flipped' shares the center vertical stack — its identity is font/colour.
  // 'pyramid' also stacks centered, but generate() has already replaced its
  // mainText with a multi-line word-pyramid block (cumulative growing lines);
  // here it just stacks like center (3dxchat centers each line → real triangle).
  if (layout === 'center' || layout === 'flipped' || layout === 'pyramid') return ord.map((f) => w[f]).filter(Boolean).join('\n');
  if (layout === 'inline') {
    return [[w.dekoTop, w.topText, w.mainText, w.dekoTop].filter(Boolean).join(' '), w.bottomText, w.kaomoji, w.dekoBottom].filter(Boolean).join('\n');
  }
  if (layout === 'compact') {
    return [w.dekoTop, [w.topText, w.mainText, w.bottomText].filter(Boolean).join(' · '), w.kaomoji, w.dekoBottom].filter(Boolean).join('\n');
  }
  if (layout === 'framed') {
    const body = ord.map((f) => w[f]).filter(Boolean) as string[];
    if (w.dekoTop && !w.dekoBottom) body.push(w.dekoTop);
    return body.join('\n');
  }
  if (layout === 'minimal') {
    return ord.filter((f) => f === 'mainText' || f === 'kaomoji').map((f) => w[f]).filter(Boolean).join('\n');
  }
  return Object.values(w).filter(Boolean).join('\n');
}
