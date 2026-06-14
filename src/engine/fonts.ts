// Font transforms — ported 1:1 from the original tool. Output must be
// byte-identical, so the maps and the normalize-then-apply logic are copied
// exactly (including the FONT_REVERSE exclusion of ASCII-valued flips).

export type FontStyle = 'normal' | 'fancy' | 'smallcaps' | 'thai' | 'flipped';

const FM: Record<string, string> = { a: 'α', b: 'в', c: '¢', d: '∂', e: 'є', f: 'f', g: 'g', h: 'н', i: 'ι', j: 'נ', k: 'к', l: 'ℓ', m: 'м', n: 'η', o: 'σ', p: 'ρ', q: 'q', r: 'я', s: 'ѕ', t: 'т', u: 'υ', v: 'ν', w: 'ω', x: 'χ', y: 'у', z: 'z' };
const SM: Record<string, string> = { a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ' };
const TM: Record<string, string> = { a: 'ล', b: 'в', c: '¢', d: '∂', e: 'э', f: 'ƒ', g: 'φ', h: 'ђ', i: 'เ', j: 'נ', k: 'к', l: 'ℓ', m: 'м', n: 'и', o: '๏', p: 'ק', q: 'ợ', r: 'я', s: 'ร', t: '†', u: 'µ', v: '√', w: 'ω', x: 'җ', y: 'ý', z: 'ž' };
const UM: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ı', j: 'ɾ',
  k: 'ʞ', l: 'ʃ', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
  u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': "'", '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', _: '‾',
};

// Every variant char back to its ASCII source — but skip identity mappings
// and any flip whose value is a plain ASCII letter (n→u, p→d, …), which
// would otherwise silently rewrite normally-typed letters.
const FONT_REVERSE: Record<string, string> = (() => {
  const r: Record<string, string> = {};
  [FM, SM, TM, UM].forEach((m) =>
    Object.keys(m).forEach((k) => {
      const v = m[k];
      if (v !== k && !/^[a-zA-Z]$/.test(v)) r[v] = k;
    }),
  );
  return r;
})();

export function normalizeFontChars(text: string): string {
  return text.split('').map((c) => FONT_REVERSE[c] || c).join('');
}

export function applyFont(text: string, style: FontStyle): string {
  if (!style || style === 'normal') return text;
  const ascii = normalizeFontChars(text);
  if (style === 'fancy') return ascii.split('').map((c) => FM[c.toLowerCase()] || c).join('');
  if (style === 'smallcaps') return ascii.split('').map((c) => SM[c.toLowerCase()] || c).join('');
  if (style === 'thai') return ascii.split('').map((c) => TM[c.toLowerCase()] || c).join('');
  if (style === 'flipped') {
    return ascii
      .split('\n')
      .map((line) => line.split('').map((c) => UM[c.toLowerCase()] || c).reverse().join(''))
      .join('\n');
  }
  return ascii;
}
