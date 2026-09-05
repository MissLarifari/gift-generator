import { applyFont } from './fonts';
import { colorTag } from './colorTags';
import { applyLayout, type LineMap } from './layouts';
import { giftChars, giftBytes } from './count';
import { DEFAULT_SIZES, type FieldId, type GiftState } from './types';
import { resolveRuns } from './ranges';

export type CounterStatus = 'ok' | 'warn' | 'over';

export interface GenerateResult {
  code: string;
  chars: number;
  bytes: number;
  charStatus: CounterStatus;
  byteStatus: CounterStatus;
  lines: LineMap;
  over: boolean;
}

const sz = (text: string, s: number, def: number) => (s !== def ? `<size=${s}>${text}</size>` : text);
const wrapBI = (s: string, b: boolean, i: boolean) => {
  if (b) s = `<b>${s}</b>`;
  if (i) s = `<i>${s}</i>`;
  return s;
};

// A field with styled ranges is cut into runs that share one effective style.
// Colour, bold and italic are wrapped per run; the SIZE is hoisted and written
// once around the whole line whenever every run agrees on it — which is nearly
// always, since ranges are mostly about colour. Repeating <size> per run was
// costing 15 bytes a piece for nothing. (Size outside, colours inside — the
// same rule the 3dx client rewards everywhere.) Only when runs really differ in
// size does each carry its own.
function renderRanges(state: GiftState, f: FieldId): string | null {
  const ranges = state.ranges?.[f];
  const text = state.text[f];
  if (!ranges?.length || !text) return null;
  const bi = f === 'topText' ? 'top' : f === 'mainText' ? 'main' : f === 'bottomText' ? 'bottom' : null;
  const base = {
    color: state.colors[f],
    noColor: state.noColor[f],
    size: state.sizes[f],
    font: state.fonts[f],
    bold: bi ? state.bold[bi] : false,
    italic: bi ? state.italic[bi] : false,
  };
  const noGrad = { on: false, c1: '#000000', c2: '#000000' };
  const runs = resolveRuns(text, base, ranges);
  const inner = (run: (typeof runs)[number]) => {
    const st = run.style;
    return wrapBI(colorTag(applyFont(run.text, st.font ?? 'normal'), noGrad, st.color ?? base.color, !!st.noColor), !!st.bold, !!st.italic);
  };
  const sizes = new Set(runs.map((r) => r.style.size ?? base.size));
  if (sizes.size === 1) {
    const size = [...sizes][0];
    const body = runs.map(inner).join('');
    // The main line always carries its size tag, like the plain path does.
    return f === 'mainText' ? `<size=${size}>${body}</size>` : sz(body, size, DEFAULT_SIZES[f]);
  }
  return runs
    .map((run) => {
      const size = run.style.size ?? base.size;
      return f === 'mainText' ? `<size=${size}>${inner(run)}</size>` : sz(inner(run), size, DEFAULT_SIZES[f]);
    })
    .join('');
}

// Pure port of the original generate() code-building path: per-field
// applyFont → colorTag → (bold/italic) → size wrap, then applyLayout.
// A field with ranges takes the branch above instead.
export function generate(state: GiftState): GenerateResult {
  const t = state.text;
  const piece = (f: FieldId) => renderRanges(state, f);
  const lm: LineMap = {
    dekoTop: piece('dekoTop') ?? (t.dekoTop
      ? sz(colorTag(applyFont(t.dekoTop, state.fonts.dekoTop), state.grads.dekoTop, state.colors.dekoTop, state.noColor.dekoTop), state.sizes.dekoTop, DEFAULT_SIZES.dekoTop)
      : null),
    topText: piece('topText') ?? (t.topText
      ? sz(wrapBI(colorTag(applyFont(t.topText, state.fonts.topText), state.grads.topText, state.colors.topText, state.noColor.topText), state.bold.top, state.italic.top), state.sizes.topText, DEFAULT_SIZES.topText)
      : null),
    mainText: piece('mainText') ?? (t.mainText
      ? (() => {
          let m = colorTag(applyFont(t.mainText, state.fonts.mainText), state.grads.mainText, state.colors.mainText, state.noColor.mainText);
          if (state.bold.main) m = `<b>${m}</b>`;
          if (state.italic.main) m = `<i>${m}</i>`;
          return `<size=${state.sizes.mainText}>${m}</size>`;
        })()
      : null),
    bottomText: piece('bottomText') ?? (t.bottomText
      ? sz(wrapBI(colorTag(applyFont(t.bottomText, state.fonts.bottomText), state.grads.bottomText, state.colors.bottomText, state.noColor.bottomText), state.bold.bottom, state.italic.bottom), state.sizes.bottomText, DEFAULT_SIZES.bottomText)
      : null),
    kaomoji: piece('kaomoji') ?? (t.kaomoji
      ? sz(colorTag(applyFont(t.kaomoji, state.fonts.kaomoji), state.grads.kaomoji, state.colors.kaomoji, state.noColor.kaomoji), state.sizes.kaomoji, DEFAULT_SIZES.kaomoji)
      : null),
    dekoBottom: piece('dekoBottom') ?? (t.dekoBottom
      ? sz(colorTag(applyFont(t.dekoBottom, state.fonts.dekoBottom), state.grads.dekoBottom, state.colors.dekoBottom, state.noColor.dekoBottom), state.sizes.dekoBottom, DEFAULT_SIZES.dekoBottom)
      : null),
  };

  const code = state.layout === 'custom' ? (state.customText || '') : applyLayout(lm, state.layout, state.lineOrder, state.stars);
  const chars = giftChars(code);
  const bytes = giftBytes(code);
  return {
    code,
    chars,
    bytes,
    charStatus: chars > 240 ? 'over' : chars > 210 ? 'warn' : 'ok',
    byteStatus: bytes > 255 ? 'over' : bytes > 230 ? 'warn' : 'ok',
    lines: lm,
    over: chars > 240 || bytes > 255,
  };
}
