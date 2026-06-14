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

// Auto word-pyramid: split mainText into words and emit cumulative lines
// (word 1 / word 1-2 / word 1-2-3 …). 3dxchat centers every line, so each
// longer line is the next, wider tier — a real pyramid for ANY phrase.
//
// For a solid colour the WHOLE block is wrapped in ONE <size><color> tag
// (a single colour tag spans multiple lines in 3dxchat — verified in-game by
// the gold star deco). That keeps it byte-cheap so long phrases still fit.
// Gradient/rainbow split per word and can't span newlines, so they fall back
// to per-line styling. Returns null when empty.
function pyramidMain(state: GiftState): string | null {
  const words = state.text.mainText.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const size = state.sizes.mainText;
  const grad = state.grads.mainText;
  const phrases = words.map((_, i) => words.slice(0, i + 1).join(' '));
  const wrap = (m: string) => {
    if (state.bold.main) m = `<b>${m}</b>`;
    if (state.italic.main) m = `<i>${m}</i>`;
    return `<size=${size}>${m}</size>`;
  };
  if (!grad.on && !grad.rainbow) {
    // one tag for the whole multi-line block
    return wrap(colorTag(applyFont(phrases.join('\n'), state.fonts.mainText), grad, state.colors.mainText, state.noColor.mainText));
  }
  return phrases.map((p) => wrap(colorTag(applyFont(p, state.fonts.mainText), grad, state.colors.mainText, state.noColor.mainText))).join('\n');
}

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

  // Pyramid replaces the single main line with a centered word-pyramid block.
  if (state.layout === 'pyramid') lm.mainText = pyramidMain(state);

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
