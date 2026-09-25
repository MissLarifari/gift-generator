import type { Look } from './looks';
import { DEFAULT_SIZES, FIELD_ORDER, type FieldId, type StyleRange } from '../engine';

const pink = '#ff25d9';
const rose = '#ff4fa3';
const blush = '#f6bfd5';
type Row = { field: FieldId; text: string; size?: number; color?: string; deco?: boolean; ranges?: StyleRange[] };
const accent = (text: string, word: string, color?: string, size?: number): StyleRange[] => [{
  start: [...text.slice(0, text.indexOf(word))].length,
  end: [...text.slice(0, text.indexOf(word) + word.length)].length,
  style: { ...(color ? { color, noColor: false } : {}), ...(size ? { size } : {}) },
}];

// Full style maps prevent colours or scripts from a previous gift leaking in.
// Only wordless rows go into `text`; all words belong to the editable sample.
function makeLook(id: string, label: string, hint: string, rows: Row[]): Look {
  const look: Look = { id, label, hint, text: {}, sample: {}, sampleRanges: {}, colors: {}, fonts: {}, sizes: {}, noColor: {}, lineOrder: rows.map(r => r.field) };
  for (const field of FIELD_ORDER) {
    look.sample[field] = '';
    look.colors[field] = '#ffffff';
    look.fonts[field] = field === 'mainText' ? 'fancy' : 'normal';
    look.sizes[field] = DEFAULT_SIZES[field];
    look.noColor[field] = true;
  }
  for (const row of rows) {
    look.sample[row.field] = row.text;
    if (row.deco) look.text[row.field] = row.text;
    look.sizes[row.field] = row.size ?? DEFAULT_SIZES[row.field];
    if (row.color) { look.colors[row.field] = row.color; look.noColor[row.field] = false; }
    if (row.ranges) look.sampleRanges![row.field] = row.ranges;
  }
  for (const field of FIELD_ORDER) if (!look.lineOrder!.includes(field)) look.lineOrder!.push(field);
  // What the look becomes over SOMEONE ELSE'S words. An accent is measured on
  // the example's letters — "sweet" inside "sweet temptation" — so it cannot
  // travel with a different sentence. The row takes the accent's colour and
  // size instead, which is what the accent was saying about that row anyway.
  // Without this, four of these came out plain white, two of them at size 14.
  const applied: NonNullable<Look['applied']> = { colors: {}, sizes: {}, noColor: {} };
  for (const row of rows) {
    const style = row.ranges?.[0]?.style;
    if (!style) continue;
    if (style.color) { applied.colors![row.field] = style.color; applied.noColor![row.field] = false; }
    if (style.size) applied.sizes![row.field] = style.size;
  }
  if (Object.keys(applied.colors!).length || Object.keys(applied.sizes!).length) look.applied = applied;
  return look;
}

const flower = (text = '✿ ° ♥ ° ✿'): Row => ({ field: 'dekoTop', text, deco: true, ranges: accent(text, '♥', blush) });
const face = (text = 'ʚɞ'): Row => ({ field: 'kaomoji', text, deco: true });
const arrow: Row = { field: 'dekoBottom', text: '▽', deco: true };
const target: Row = { field: 'mainText', text: '→ you ←', size: 60, ranges: accent('→ you ←', 'you', pink) };
const ribbon: Row = { field: 'dekoTop', text: 'ʚɞ ♥', color: blush, deco: true };
const flowers: Row = { field: 'kaomoji', text: '♥ ✿ ♥', deco: true };

export const ROMANTIC_LOOKS: Look[] = [
  makeLook('heartSmile', 'Blütenband', 'Blumen, rosa Herz und ein pinkes Lächeln', [flower(),
    { field: 'topText', text: 'you make my', size: 18 },
    { field: 'mainText', text: 'heart smile', size: 40, color: pink },
    { field: 'bottomText', text: 'every single day' }, face()]),
  makeLook('sweetTemptation', 'Echo', 'Große weiße Zierschrift mit süßem Farbakzent', [flower('✿ ♥ ✿'),
    { field: 'topText', text: '.. you are my ..' },
    { field: 'mainText', text: 'way too', size: 40 },
    { field: 'bottomText', text: 'sweet temptation', ranges: accent('sweet temptation', 'sweet', pink) }, face()]),
  makeLook('homeIsYou', 'Pfeilfokus', 'Weiße Pfeile zeigen auf dein pinkes Zuhause', [
    { field: 'dekoTop', text: '° ✿ ⋆', deco: true },
    { field: 'topText', text: 'if home were a person' },
    { field: 'bottomText', text: 'it would be' }, arrow, target, face('↖(✿ ◡‿◡)↗')]),
  makeLook('sneakyHeart', 'Einschub', 'Ein kleiner Einschub und ein großes rosa Herz', [
    { field: 'dekoTop', text: '✦ you ..' },
    { field: 'topText', text: '*sneαk*', size: 26, color: pink },
    { field: 'bottomText', text: 'right into' },
    { field: 'mainText', text: 'my heart', size: 44, color: rose },
    { field: 'dekoBottom', text: '.. and stay there ♥' }]),
  makeLook('littleDetour', 'Brücke', 'Ein Umweg mit Pfeil und rosa Lieblingsplatz', [
    { field: 'topText', text: '✿ my wings took a detour ..' },
    { field: 'bottomText', text: 'strαight to you', ranges: accent('strαight to you', 'strαight', undefined, 32) },
    { field: 'dekoTop', text: '↓', deco: true },
    { field: 'mainText', text: '♥ my favorite place ♥', size: 14, ranges: accent('♥ my favorite place ♥', 'favorite', rose, 36) }, face('(„• ᴗ •„)')]),
  makeLook('happyPlace', 'Blütenrahmen', 'Zwei pinke Zeilen wachsen zum Lieblingsort', [ribbon,
    { field: 'topText', text: 'you are' },
    { field: 'bottomText', text: 'my little', size: 30, color: pink },
    { field: 'mainText', text: 'happy place', size: 40, color: pink },
    { field: 'dekoBottom', text: 'in this world ..' }, flowers]),
  makeLook('favoriteTrouble', 'Blütenband · Mini', 'Blumen und ein großes pinkes Lieblingswort', [flower(),
    { field: 'topText', text: 'you are my' },
    { field: 'mainText', text: 'favorite', size: 40, color: pink },
    { field: 'bottomText', text: 'kind of trouble' }, face()]),
  makeLook('alwaysYou', 'Pfeilfokus · Mini', 'Alle kleinen Gedanken zeigen auf dich', [
    { field: 'dekoTop', text: '° ✿ ⋆', deco: true },
    { field: 'topText', text: 'all my little thoughts' },
    { field: 'bottomText', text: 'somehow lead to' }, arrow, target, face('(✿ ◡‿◡)')]),
  makeLook('stolenHeart', 'Einschub · Ausruf', 'Ein frecher Einschub und ein sicher verwahrtes Herz', [
    { field: 'dekoTop', text: '✦ excuse me ..' },
    { field: 'topText', text: '*yoink*', size: 26, color: pink },
    { field: 'bottomText', text: 'i am keeping' },
    { field: 'mainText', text: 'your heart', size: 44, color: rose },
    { field: 'dekoBottom', text: '.. safe with mine ♥' }]),
  makeLook('littleMagic', 'Echo · Finale', 'Große weiße Schrift mit einem pinken Zauberwort', [flower('✿ ♥ ✿'),
    { field: 'topText', text: 'you make' },
    { field: 'mainText', text: 'ordinary', size: 40 },
    { field: 'bottomText', text: 'feel like magic', ranges: accent('feel like magic', 'magic', pink) }, face()]),
  makeLook('oneMoreKiss', 'Blütenrahmen · Stufe', 'Ein kleiner Wunsch wird immer größer', [ribbon,
    { field: 'topText', text: 'just' },
    { field: 'bottomText', text: 'one more', size: 26, color: pink },
    { field: 'mainText', text: 'little kiss', size: 44, color: pink },
    { field: 'dekoBottom', text: '.. or maybe ten' }, flowers]),
  makeLook('bestDetour', 'Brücke · Kontrast', 'Ein verirrtes Herz findet seinen Lieblingsumweg', [
    { field: 'topText', text: '✿ my heart missed a turn ..' },
    { field: 'bottomText', text: 'got lost in you', ranges: accent('got lost in you', 'got lost', undefined, 32) },
    { field: 'dekoTop', text: '↓', deco: true },
    { field: 'mainText', text: '♥ best detour ever ♥', size: 14, ranges: accent('♥ best detour ever ♥', 'detour', rose, 36) }, face('(„• ᴗ •„)')]),
  makeLook('flyingHug', 'Herzband', 'Ein rosa Herz über einer fliegenden Umarmung', [flower('° ♥ °'),
    { field: 'topText', text: 'if hugs had wings' },
    { field: 'mainText', text: 'mine', size: 40, color: pink },
    { field: 'bottomText', text: 'would fly to you' }, face('↖(✿ ◡‿◡)↗')]),
  makeLook('guiltyCute', 'Vertikal', 'Eine pinke Warnung mit Pfeil auf die Schuldigen', [
    { field: 'dekoTop', text: '✦ warning ..' },
    { field: 'topText', text: 'too cute', size: 30, color: pink },
    { field: 'bottomText', text: 'to resist' },
    { field: 'kaomoji', text: '↓', deco: true },
    { field: 'mainText', text: 'thats you', size: 40, color: rose },
    { field: 'dekoBottom', text: '♥ guilty as charged ♥' }]),
];
