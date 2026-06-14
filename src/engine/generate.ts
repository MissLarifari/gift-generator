import { applyFont } from './fonts';
import { colorTag } from './colorTags';
import { applyLayout, type LineMap } from './layouts';
import { giftChars, giftBytes } from './count';
import { DEFAULT_SIZES, type GiftState } from './types';

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

// Pure port of the original generate() code-building path: per-field
// applyFont → colorTag → (bold/italic) → size wrap, then applyLayout.
export function generate(state: GiftState): GenerateResult {
  const t = state.text;
  const lm: LineMap = {
    dekoTop: t.dekoTop
      ? sz(colorTag(applyFont(t.dekoTop, state.fonts.dekoTop), state.grads.dekoTop, state.colors.dekoTop, state.noColor.dekoTop), state.sizes.dekoTop, DEFAULT_SIZES.dekoTop)
      : null,
    topText: t.topText
      ? sz(wrapBI(colorTag(applyFont(t.topText, state.fonts.topText), state.grads.topText, state.colors.topText, state.noColor.topText), state.bold.top, state.italic.top), state.sizes.topText, DEFAULT_SIZES.topText)
      : null,
    mainText: t.mainText
      ? (() => {
          let m = colorTag(applyFont(t.mainText, state.fonts.mainText), state.grads.mainText, state.colors.mainText, state.noColor.mainText);
          if (state.bold.main) m = `<b>${m}</b>`;
          if (state.italic.main) m = `<i>${m}</i>`;
          return `<size=${state.sizes.mainText}>${m}</size>`;
        })()
      : null,
    bottomText: t.bottomText
      ? sz(wrapBI(colorTag(applyFont(t.bottomText, state.fonts.bottomText), state.grads.bottomText, state.colors.bottomText, state.noColor.bottomText), state.bold.bottom, state.italic.bottom), state.sizes.bottomText, DEFAULT_SIZES.bottomText)
      : null,
    kaomoji: t.kaomoji
      ? sz(colorTag(applyFont(t.kaomoji, state.fonts.kaomoji), state.grads.kaomoji, state.colors.kaomoji, state.noColor.kaomoji), state.sizes.kaomoji, DEFAULT_SIZES.kaomoji)
      : null,
    dekoBottom: t.dekoBottom
      ? sz(colorTag(applyFont(t.dekoBottom, state.fonts.dekoBottom), state.grads.dekoBottom, state.colors.dekoBottom, state.noColor.dekoBottom), state.sizes.dekoBottom, DEFAULT_SIZES.dekoBottom)
      : null,
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
