// Colour / gradient / rainbow tag wrapping — ported 1:1. The exact word
// splitting, the <=2-char single-word shortcut, and the 3-segment cap all
// matter for byte-identical output.

export interface Grad {
  on: boolean;
  c1: string;
  c2: string;
  rainbow?: boolean;
}

function hexToRgb(h: string) {
  return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) };
}
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

export function gradientText(text: string, c1: string, c2: string): string {
  const words = text.split(' ').filter((w) => w.length > 0);
  if (!words.length) return text;
  const r1 = hexToRgb(c1), r2 = hexToRgb(c2);
  if (words.length === 1) {
    const w = words[0];
    if (w.length <= 2) return `<color=${c1}>${w}</color>`;
    const t = Math.ceil(w.length / 3);
    const p = [w.slice(0, t), w.slice(t, t * 2), w.slice(t * 2)].filter((x) => x);
    return p
      .map((x, i) => {
        const f = i / (p.length - 1) || 0;
        return `<color=${rgbToHex(r1.r + (r2.r - r1.r) * f, r1.g + (r2.g - r1.g) * f, r1.b + (r2.b - r1.b) * f)}>${x}</color>`;
      })
      .join('');
  }
  return words
    .map((w, i) => {
      const f = i / (words.length - 1);
      return `<color=${rgbToHex(r1.r + (r2.r - r1.r) * f, r1.g + (r2.g - r1.g) * f, r1.b + (r2.b - r1.b) * f)}>${w}</color>`;
    })
    .join(' ');
}

const PRIDE_PALETTE = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#a0c4ff', '#bdb2ff'];

export function rainbowText(text: string): string {
  const pick = (n: number) => Array.from({ length: n }, (_, i) => PRIDE_PALETTE[Math.round((i * (PRIDE_PALETTE.length - 1)) / (n - 1 || 1))]);
  const words = text.split(' ').filter((w) => w.length > 0);
  if (!words.length) return text;
  if (words.length === 1) {
    const w = words[0];
    if (w.length <= 2) return `<color=${PRIDE_PALETTE[0]}>${w}</color>`;
    const t = Math.ceil(w.length / 3);
    const parts = [w.slice(0, t), w.slice(t, t * 2), w.slice(t * 2)].filter(Boolean);
    const cols = pick(parts.length);
    return parts.map((x, i) => `<color=${cols[i]}>${x}</color>`).join('');
  }
  const n = Math.min(words.length, 3);
  const cols = pick(n);
  return words
    .map((w, i) => ({ w, b: Math.min(Math.floor((i * n) / words.length), n - 1) }))
    .reduce<{ b: number; ws: string[] }[]>((acc, { w, b }) => {
      const last = acc[acc.length - 1];
      if (last && last.b === b) last.ws.push(w);
      else acc.push({ b, ws: [w] });
      return acc;
    }, [])
    .map(({ b, ws }) => `<color=${cols[b]}>${ws.join(' ')}</color>`)
    .join(' ');
}

export function colorTag(text: string, grad: Grad, color: string, noColor: boolean): string {
  if (grad?.rainbow) return rainbowText(text);
  if (grad?.on) return gradientText(text, grad.c1, grad.c2);
  if (noColor) return text;
  return `<color=${color}>${text}</color>`;
}
