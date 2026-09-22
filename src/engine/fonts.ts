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

/**
 * Welche Zierschrift steht in diesem Text?
 *
 * Die Schrift ist kein Tag — sie steckt in den Buchstaben selbst. Um sie zu
 * erkennen, wird der Text auf a-z zurueckgefaltet und dann jede Schrift
 * ausprobiert: was sich wieder zum Original zusammensetzt, war es.
 *
 * 'flipped' ist absichtlich nicht dabei. Die Schrift dreht die Zeile um, ein
 * Buchstabe landet also woanders als er stand — fuer das Mitschreiben beim
 * Tippen, wo die Stelle stimmen muss, ist das nicht brauchbar.
 */
export function detectFont(text: string): FontStyle {
  const plain = normalizeFontChars(text);
  if (plain === text) return 'normal';
  for (const style of ['fancy', 'smallcaps', 'thai'] as const) {
    if (applyFont(plain, style) === text) return style;
  }
  return 'normal';
}

/**
 * Der frisch getippte Text in der Schrift der Zeile — oder null, wenn nichts
 * zu tun ist.
 *
 * `from` ist der Anfang der Markierung von VOR dem Tippen, `caret` steht
 * danach hinter dem Getippten. Dazwischen liegt genau das, was neu dasteht —
 * beim Tippen ueber eine Markierung genauso wie beim Tippen an einer Stelle.
 *
 * Warum nicht vorher und nachher vergleichen: bei ".. das salz" -> "mein herz"
 * ist das z am Ende gemeinsam, ein Vergleich wuerde es also auslassen und die
 * Zeile kaeme als "мєιη нєяz" heraus — ein schlichter Buchstabe mitten in der
 * Zierschrift. Der Cursor weiss es genau, der Vergleich raet.
 *
 * Spitze Klammern brechen ab: aus <size=40> wuerde sonst <ѕιzє=40>.
 */
export function scriptTyped(
  next: string, from: number, caret: number, font: FontStyle,
): { at: number; text: string } | null {
  if (font === 'normal' || caret <= from || from < 0) return null;
  // Steht der Cursor in einem angefangenen Tag? Dann Finger weg: wer gerade
  // "<b" getippt hat, tippt als naechstes ">" und meint ein Tag, kein Wort —
  // aus <b> wuerde sonst <в> und der Code waere hin.
  const davor = next.slice(0, caret);
  if (davor.lastIndexOf('<') > davor.lastIndexOf('>')) return null;
  const text = next.slice(from, caret);
  if (!text || /[<>]/.test(text)) return null;
  const done = applyFont(text, font);
  return done === text ? null : { at: from, text: done };
}
