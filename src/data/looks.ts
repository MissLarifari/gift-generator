import type { FieldId, FontStyle, GiftState, StyleRange } from '../engine';

// A "look" is the build of a gift without its words: which deco lines it uses,
// which line carries the colour, how big the big word is, which script runs.
// Applying one keeps the text and swaps everything around it — so the same
// sentence can be tried in either build.
//
// These two are lifted from the sets Lari already writes in: the note (one deco
// row, one loud word) and the two-word build (two loud words with the deco row
// stacked between them).

export interface Look {
  id: string;
  label: string;
  hint: string;
  text: Partial<Record<FieldId, string>>;
  /** Words shown when the look is applied to an empty gift, so the build is
   *  visible in full instead of a couple of lonely deco rows. */
  sample: Partial<Record<FieldId, string>>;
  /** Ranges that belong to the sample words — the loud word inside a small
   *  white line. Only meaningful together with `sample`; a user's own words
   *  have their own shape. */
  sampleRanges?: Partial<Record<FieldId, StyleRange[]>>;
  /** What the build becomes over SOMEONE ELSE'S words. The example's loud word
   *  lives in a range measured for that example, so it cannot carry over; these
   *  values put the loudness on the whole line instead. Without this the second
   *  half of the two-part build stayed small and white on every gift but the
   *  example, which made the build silently not a two-parter at all. */
  applied?: { sizes?: Partial<Record<FieldId, number>>; noColor?: Partial<Record<FieldId, boolean>> };
  colors: Partial<Record<FieldId, string>>;
  fonts: Partial<Record<FieldId, FontStyle>>;
  sizes: Partial<Record<FieldId, number>>;
  noColor: Partial<Record<FieldId, boolean>>;
  /** Optional: a build that needs its lines in a different order. */
  lineOrder?: FieldId[];
  /** Sparkle frames a gift with the deco it ALREADY has, mirrored to the
   *  bottom — otherwise picking a Christmas card in Sparkle would swap its
   *  stars for Sparkle's own row and every category would look alike. */
  mirrorDeco?: boolean;
}

export const LOOKS: Look[] = [
  {
    id: 'note',
    label: 'Notiz',
    hint: 'Eine Deko-Reihe, ein lautes Wort',
    text: { dekoTop: '° ✿ ★ ✿ °', kaomoji: 'ʚɞ', dekoBottom: '' },
    sample: { topText: '.. this is ..', mainText: 'just because ♡', bottomText: '.. no reason needed' },
    colors: { dekoTop: '#ff9ec7', mainText: '#ff4fa3', kaomoji: '#ff9ec7' },
    fonts: { dekoTop: 'normal', topText: 'fancy', mainText: 'fancy', bottomText: 'fancy', dekoBottom: 'normal' },
    sizes: { mainText: 44, topText: 14, bottomText: 14 },
    noColor: { topText: true, bottomText: true, mainText: false },
    lineOrder: ['dekoTop', 'topText', 'mainText', 'bottomText', 'kaomoji', 'dekoBottom'],
  },
  {
    // One sentence broken over two loud halves with the deco row set BETWEEN
    // them — that middle row is what makes this build. It is the bottom deco
    // line moved up by lineOrder; 3dxchat centres every line either way.
    id: 'twoWords',
    label: 'Zweiteiler',
    hint: 'Ein Satz, zwei laute Hälften, Deko in der Mitte',
    // Wordless on purpose. The deco a look ALWAYS applies has to fit any
    // sentence: the worded rows ".. du bist .." and "★ in ✦" belong to the
    // example below, where they are part of that one sentence. Applied over
    // someone else's words they read as gibberish, which is exactly what
    // happened: "du bist / stay a little / in / im comfy".
    text: { dekoTop: '▶ .. ✿ .. ◀', dekoBottom: '° ✿ ★ ✦ ✿', kaomoji: '↖(✿ ∩◡∩)↗', topText: '' },
    // Lari's own build, byte for byte: the lead-in ".. das" / ".. der" stays
    // small and untagged white; only the loud word carries size and colour.
    // The size therefore lives in the RANGE, and the line's base is small.
    // The example carries its own deco, because here the words in it ARE the
    // sentence: du bist / das salz / in / der suppe.
    sample: { dekoTop: '▶ .. du bist .. ◀', dekoBottom: '° ✿ ★ in ✦ ✿', mainText: '.. das salz', bottomText: '.. der suppe ✿★' },
    // Only the BOTTOM line splits. The main line stays whole and loud: it must
    // carry a <size> tag no matter what (engine rule), so a small lead-in there
    // would cost its own <size=14> wrapper — 15 bytes that push the build over
    // 255. Lari's hand-written target has the main line in one wrapper; so do we.
    sampleRanges: {
      bottomText: [{ start: 7, end: 15, style: { size: 40, color: '#ff4fa3', noColor: false } }],
    },
    applied: { sizes: { bottomText: 40 }, noColor: { bottomText: false } },
    colors: { mainText: '#ffd84d', bottomText: '#ff4fa3', dekoBottom: '#ff9ec7', kaomoji: '#ff9ec7' },
    fonts: { dekoTop: 'fancy', topText: 'fancy', mainText: 'fancy', bottomText: 'fancy', dekoBottom: 'fancy' },
    sizes: { mainText: 40, bottomText: 14, topText: 14 },
    // Everything not loud is untagged white — 3dxchat draws that for free.
    noColor: { topText: true, dekoTop: true, mainText: false, bottomText: true },
    lineOrder: ['dekoTop', 'topText', 'mainText', 'dekoBottom', 'bottomText', 'kaomoji'],
  },
  {
    // Sparkle — the note with deco at BOTH ends, framing the loud word. Lifted
    // back out of the pre-redesign layout defaults on 2026-09-05 (Lari asked
    // for it by screenshot), deco and colours unchanged from there.
    id: 'sparkle',
    label: 'Sparkle',
    mirrorDeco: true,
    hint: 'Deko oben und unten, das laute Wort dazwischen',
    text: { dekoTop: '˚ ⋆ ✦ ⋆ ˚', dekoBottom: '˚ ⋆ ✦ ⋆ ˚', kaomoji: '(ʀ>ω<ʀ)' },
    sample: { topText: '.. stop being ..', mainText: 'so cute', bottomText: '.. i cant handle it ..' },
    colors: { dekoTop: '#ff7ad9', dekoBottom: '#ff7ad9', kaomoji: '#ff7ad9', mainText: '#ff4fa3' },
    fonts: { dekoTop: 'normal', topText: 'fancy', mainText: 'fancy', bottomText: 'fancy', dekoBottom: 'normal' },
    sizes: { mainText: 44, topText: 14, bottomText: 14 },
    noColor: { topText: true, bottomText: true, mainText: false },
    lineOrder: ['dekoTop', 'topText', 'mainText', 'bottomText', 'kaomoji', 'dekoBottom'],
  },
];

/**
 * Which look a gift is built in — read off its build, not its exact deco.
 * Matching the deco string was too strict: Spicy is a note too, it just uses a
 * different star row. What actually separates the two is whether the bottom
 * line is a second loud word.
 */
export function lookIdOf(build: {
  sizes?: Partial<Record<FieldId, number>>;
  fonts?: Partial<Record<FieldId, FontStyle>>;
  ranges?: Partial<Record<FieldId, StyleRange[]>>;
  /** A whole gift carries its deco as text… */
  text?: Partial<Record<FieldId, string>>;
  /** …a template theme carries it here. Both are read, so one function serves both. */
  deco?: { dekoBottom?: string | null };
}): string | null {
  // A loud bottom line is what makes the two-word build — whether the size sits
  // on the whole line or on a range inside it.
  const loudBottom =
    (build.sizes?.bottomText ?? 14) >= 40 ||
    (build.ranges?.bottomText ?? []).some((r) => (r.style.size ?? 0) >= 40);
  if (loudBottom) return 'twoWords';
  // Deco at both ends is Sparkle; deco only on top is the plain note.
  if (build.text?.dekoBottom || build.deco?.dekoBottom) return 'sparkle';
  if (build.fonts?.mainText === 'fancy') return 'note';
  return null;
}

/**
 * Which builds take the SAME words. Sparkle is the note with a second deco row,
 * so every note-shaped saying fits it unchanged — the difference is decoration,
 * and decoration is not something a saying has to be written for.
 */
const SAME_WORDS: Record<string, string[]> = {
  note: ['note', 'sparkle'],
  sparkle: ['sparkle', 'note'],
  twoWords: ['twoWords'],
};

/** Does a gift built in `built` work in the look `wanted`? */
export function fitsLook(built: string | null, wanted: string | null | undefined): boolean {
  if (!wanted || !built) return false;
  return (SAME_WORDS[built] ?? [built]).includes(wanted);
}

/**
 * Is the gift still showing a look's own example, untouched? Then switching
 * builds may swap in the new example — otherwise half the lines would carry
 * over and the preview comes out lopsided. Anything typed is never replaced.
 */
export function isUntouchedSample(text: Partial<Record<FieldId, string>>): boolean {
  const t = (k: FieldId) => text[k] ?? '';
  if (!t('topText') && !t('mainText') && !t('bottomText')) return true;
  return LOOKS.some(
    (l) =>
      (l.sample.topText ?? '') === t('topText') &&
      (l.sample.mainText ?? '') === t('mainText') &&
      (l.sample.bottomText ?? '') === t('bottomText'),
  );
}

/**
 * Puts a look onto a gift: the deco rows, which line is loud, the script and
 * the sizes. The words are kept — unless the gift is still showing a look's
 * own example, in which case the new example takes over, so the build is
 * visible in full instead of a couple of lonely deco rows.
 *
 * One function so the gift the page opens with and the gift a click on the
 * layout chip builds cannot drift apart.
 */
export function composeLook(s: GiftState, look: Look, keepWords = false): GiftState {
  // keepWords: apply the FRAME only. Needed when a ready-made card is loaded
  // into a layout — one of those cards happens to be the note look's own
  // example, and without this it was mistaken for an empty gift and had its
  // words replaced by the new look's example.
  const fresh = !keepWords && isUntouchedSample(s.text);
  // Over someone else's gift, Sparkle keeps that gift's own deco row and just
  // repeats it underneath.
  const mirrored = look.mirrorDeco && !fresh && s.text.dekoTop
    ? { dekoTop: s.text.dekoTop, dekoBottom: s.text.dekoTop }
    : null;
  return {
    ...s,
    // The example's ranges (a loud word inside a small white line) only make
    // sense on the example's words.
    ranges: fresh ? { ...look.sampleRanges } : s.ranges,
    text: {
      ...s.text,
      ...look.text,
      ...mirrored,
      ...(fresh ? { topText: '', mainText: '', bottomText: '', ...look.sample } : null),
    },
    colors: { ...s.colors, ...look.colors },
    fonts: { ...s.fonts, ...look.fonts },
    sizes: { ...s.sizes, ...look.sizes, ...(fresh ? null : look.applied?.sizes) },
    noColor: { ...s.noColor, ...look.noColor, ...(fresh ? null : look.applied?.noColor) },
    lineOrder: look.lineOrder ? [...look.lineOrder] : s.lineOrder,
  };
}
