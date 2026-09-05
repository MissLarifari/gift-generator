import { byteLen, giftBytes, giftChars } from './count';
import { normalizeFontChars } from './fonts';

// Getting the gift under 255 bytes.
//
// Rewritten 2026-09-06 for the code-first editor. The old one read a structured
// GiftState and described what you could do; this one WORKS ON THE CODE and
// hands back the finished result, so a tip is a thing you press, not advice.
//
// Every saving here is measured, never estimated: a tip produces the fixed code
// and the difference in bytes is taken from it. If a rewrite saves nothing it
// does not appear.

export type TipId = 'white' | 'size14' | 'empty' | 'merge' | 'plain';

export interface Tip {
  id: TipId;
  /** i18n key for the one-line explanation. */
  key: string;
  /** Bytes this actually saves, measured on the result. */
  saves: number;
  /** The code with this one change applied. */
  fixed: string;
  /**
   * Does the gift look different afterwards? White loses its exact shade to
   * 3dxchat's own default, and plain script is a different script. The rest
   * render identically — they only drop weight the client ignores anyway.
   */
  changesLook: boolean;
}

const TAG = /<\/?(size|color|b|i)(?:=([^<>]*))?>/gi;

/** #ffffff, #fff, and the shades close enough that the default passes for them. */
const isWhite = (v: string): boolean => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v.trim());
  if (!m) return false;
  const h = m[1].length === 3 ? m[1].replace(/(.)/g, '$1$1') : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return r >= 235 && g >= 235 && b >= 235;
};

/** Drops one tag and its partner, keeping what sat between them. */
function unwrap(code: string, keep: (name: string, value: string | undefined) => boolean): string {
  const open: { name: string; drop: boolean; at: number; end: number }[] = [];
  const cut: [number, number][] = [];
  TAG.lastIndex = 0;
  for (let m = TAG.exec(code); m; m = TAG.exec(code)) {
    const closing = m[0][1] === '/';
    const name = m[1].toLowerCase();
    if (!closing) {
      open.push({ name, drop: !keep(name, m[2]), at: m.index, end: m.index + m[0].length });
      continue;
    }
    for (let i = open.length - 1; i >= 0; i--) {
      if (open[i].name !== name) continue;
      if (open[i].drop) { cut.push([open[i].at, open[i].end], [m.index, m.index + m[0].length]); }
      open.splice(i, 1);
      break;
    }
  }
  if (cut.length === 0) return code;
  cut.sort((a, b) => b[0] - a[0]);
  let out = code;
  for (const [a, b] of cut) out = out.slice(0, a) + out.slice(b);
  return out;
}

/** A tag pair with nothing but other tags between it does nothing at all. */
function dropEmpty(code: string): string {
  let out = code;
  for (let i = 0; i < 4; i++) {
    const next = out.replace(/<(size|color|b|i)(?:=[^<>]*)?>\s*<\/\1>/gi, '');
    if (next === out) return out;
    out = next;
  }
  return out;
}

/** "</color><color=#same>" is a seam that costs bytes and shows nothing. */
function mergeSeams(code: string): string {
  let out = code;
  for (let i = 0; i < 6; i++) {
    const next = out
      .replace(/<color=([^<>]*)>([^<>]*)<\/color><color=\1>/gi, '<color=$1>$2')
      .replace(/<size=([^<>]*)>([^<>]*)<\/size><size=\1>/gi, '<size=$1>$2')
      .replace(/<b>([^<>]*)<\/b><b>/gi, '<b>$1')
      .replace(/<i>([^<>]*)<\/i><i>/gi, '<i>$1');
    if (next === out) return out;
    out = next;
  }
  return out;
}

/** Doubled spaces and trailing ones cost a byte each and show nothing. */
const build = (id: TipId, key: string, code: string, fixed: string, changesLook: boolean): Tip | null => {
  if (fixed === code) return null;
  const saves = byteLen(code) - byteLen(fixed);
  return saves > 0 ? { id, key, saves, fixed, changesLook } : null;
};

/**
 * Everything worth pressing, biggest saving first. Each tip is measured against
 * the code as it stands, so applying one and asking again is the honest way to
 * stack them.
 */
export function optimize(code: string): Tip[] {
  const tips: (Tip | null)[] = [
    build('white', 'opt_white', code, unwrap(code, (n, v) => !(n === 'color' && !!v && isWhite(v))), true),
    build('size14', 'opt_size14', code, unwrap(code, (n, v) => !(n === 'size' && v?.trim() === '14')), false),
    build('empty', 'opt_empty', code, dropEmpty(code), false),
    build('merge', 'opt_merge', code, mergeSeams(code), false),
    build('plain', 'opt_plain', code, normalizeFontChars(code), true),
  ];
  return tips.filter((t): t is Tip => t !== null).sort((a, b) => b.saves - a.saves);
}

/** How much room is left, and whether it is time to worry. */
export function pressure(code: string): { chars: number; bytes: number; over: boolean; tight: boolean } {
  const chars = giftChars(code);
  const bytes = giftBytes(code);
  return { chars, bytes, over: chars > 240 || bytes > 255, tight: chars > 210 || bytes > 225 };
}
