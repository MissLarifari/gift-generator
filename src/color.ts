// Colour maths for the picker: the saturation/value square and the hue slider
// work in HSV, the 3dx tag and the input fields work in hex and RGB, so the
// two have to convert cleanly in both directions.
//
// UI-only. Nothing here touches the gift code; the engine still only ever sees
// a "#rrggbb" string.

export type Rgb = [number, number, number];
export type Hsv = [number, number, number]; // h 0-360, s 0-1, v 0-1

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const hex2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');

/** "#abc" and "#aabbcc" both read; anything else gives null. */
export function hexToRgb(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export const rgbToHex = ([r, g, b]: Rgb): string => `#${hex2(r)}${hex2(g)}${hex2(b)}`;

export function rgbToHsv([r, g, b]: Rgb): Hsv {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : d / max, max];
}

export function hsvToRgb([h, s, v]: Hsv): Rgb {
  const H = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((H / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    H < 60 ? [c, x, 0] :
    H < 120 ? [x, c, 0] :
    H < 180 ? [0, c, x] :
    H < 240 ? [0, x, c] :
    H < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export const hsvToHex = (hsv: Hsv): string => rgbToHex(hsvToRgb(hsv));

/** Falls back to the given hue when the colour is grey and has none of its own. */
export function hexToHsv(hex: string, fallbackHue = 0): Hsv | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [h, s, v] = rgbToHsv(rgb);
  return [s === 0 ? fallbackHue : h, s, v];
}

export const isHex = (s: string): boolean => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim());

/** Black text on a light colour, white on a dark one. */
export const readableInk = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  const [r, g, b] = rgb;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#101318' : '#ffffff';
};
