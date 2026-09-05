import type { GiftState, FieldId, Layout, FontStyle } from './engine';

export type Commit = (producer: (s: GiftState) => GiftState, coalesceKey?: string) => void;

export const favKey = (catLabel: string, itemL: string) => `${catLabel}::${itemL}`;

export const FIELDS: FieldId[] = ['dekoTop', 'topText', 'mainText', 'bottomText', 'kaomoji', 'dekoBottom'];
export const LAYOUTS: Layout[] = ['center', 'inline', 'pyramid', 'sparkle', 'heart', 'custom'];
// How the Layout section groups them: plain alignments first, shaped presets
// after. 'custom' is deliberately absent — it is the raw-code mode and lives
// under Advanced, not among the looks.
export const LAYOUT_ALIGN: Layout[] = ['center', 'inline'];
export const LAYOUT_PRESETS: Layout[] = ['pyramid', 'sparkle', 'heart'];

export const FIELD_LABELS: Record<FieldId, string> = {
  dekoTop: 'Deco Top',
  topText: 'Obere Zeile',
  mainText: 'Haupttext',
  bottomText: 'Untere Zeile',
  kaomoji: 'Kaomoji',
  dekoBottom: 'Deco Bottom',
};

export const FONT_STYLES = [
  { id: 'normal', label: 'Aa' },
  { id: 'fancy', label: 'αв' },
  { id: 'smallcaps', label: 'ꜱᴄ' },
  { id: 'thai', label: 'ล†' },
  { id: 'flipped', label: 'ɟlıp' },
] as const;

// Fields that carry bold/italic, a star wrap, deco presets, kaomoji or font choice.
export const HAS_BOLD_ITALIC: FieldId[] = ['topText', 'mainText', 'bottomText'];
export const HAS_STAR: FieldId[] = ['dekoTop', 'topText', 'bottomText'];
export const HAS_FONT: FieldId[] = ['dekoTop', 'topText', 'mainText', 'bottomText', 'dekoBottom'];

// Deco lines that the Decoration section owns (dropdowns, not free text) —
// except in the pyramid layout, where every field is a plain text line.
export const DECO_FIELDS: FieldId[] = ['dekoTop', 'kaomoji', 'dekoBottom'];

// The deco colours a fresh gift starts with. Picking a template resets to these
// before the template's own decoColors apply, so a category that colours its deco
// doesn't leave that colour behind on the next template picked.
export const DEFAULT_DECO_COLORS: Partial<Record<FieldId, string>> = { dekoTop: '#555555', kaomoji: '#ffd84d', dekoBottom: '#5c5c7a' };

// The plain top-to-bottom stack every layout but the pyramid uses.
export const DEFAULT_LINE_ORDER: FieldId[] = ['dekoTop', 'topText', 'mainText', 'bottomText', 'kaomoji', 'dekoBottom'];
export type EditorSection = 'text' | 'style' | 'deco' | 'layout' | 'advanced';
export const editorSectionOf = (layout: Layout, f: FieldId): EditorSection =>
  layout !== 'pyramid' && DECO_FIELDS.includes(f) ? 'deco' : 'text';

export const DECO_PRESETS: Partial<Record<FieldId, string[]>> = {
  dekoTop: ['˚ ⋆ ✦ ⋆ ˚', '· ˚ ⋆ ✦ ⋆ ˚ ·', '♡ · ♥ · ♡', '· ily ·←', '❀ · ❀ · ❀', '✦ · · · ✦', '♥ · ♥ · ♥', '★.° ★.°', '· · ·'],
  dekoBottom: ['˚ ⋆ ✦ ⋆ ˚', '· ˚ ⋆ ✦ ⋆ ˚ ·', '♡ · ♥ · ♡', '.. ･ ✦ ･ ..', '· · · · ·', '♡ ·° ☆ ·° ♡', '❀ ♡ ✦ ♡ ❀', '~ · ~ · ~'],
};

export const SYMBOLS = ['♡', '♥', '❀', '✿', '✦', '★', '·', '°', '˚', '⋆', '←', '→', '∞', '~', '｡ﾟ'];

export const KAOMOJI = ['ʚɞ', 'ʚ♡ɞ', '(✿˘‿˘)', '(❀◡❀)', '(✿╹‿╹)ノ', '(❀˘‿˘)ノ', '(✿≧‿≦)', '(◉_◉❀)', '(˘³˘)♥', '(♡˘▽˘♡)', '(◍•ᴗ•◍)❤', '(◕‿◕✿)'];

export function createDefaultState(): GiftState {
  const grad = () => ({ on: false, c1: '#ff71b8', c2: '#b388ff', rainbow: false });
  return {
    // Empty on purpose since 2026-09-05: a new gift starts blank, not with
    // somebody else's example words in it.
    text: {
      dekoTop: '',
      topText: '',
      mainText: '',
      bottomText: '',
      kaomoji: '',
      dekoBottom: '',
    },
    sizes: { dekoTop: 12, topText: 14, mainText: 60, bottomText: 14, kaomoji: 16, dekoBottom: 12 },
    fonts: { dekoTop: 'normal', topText: 'normal', mainText: 'normal', bottomText: 'normal', kaomoji: 'normal', dekoBottom: 'normal' },
    colors: { dekoTop: '#555555', topText: '#8f8f8f', mainText: '#ff71b8', bottomText: '#8f8f8f', kaomoji: '#ffd84d', dekoBottom: '#5c5c7a' },
    noColor: { dekoTop: false, topText: false, mainText: false, bottomText: false, kaomoji: false, dekoBottom: false },
    grads: { dekoTop: grad(), topText: grad(), mainText: grad(), bottomText: grad(), kaomoji: grad(), dekoBottom: grad() },
    bold: { top: false, main: false, bottom: false },
    italic: { top: false, main: false, bottom: false },
    stars: { dekoTop: false, topText: false, bottomText: false },
    layout: 'center',
    lineOrder: ['dekoTop', 'topText', 'mainText', 'bottomText', 'kaomoji', 'dekoBottom'],
    customText: '',
  };
}

// Per-layout presets — ported verbatim from the legacy layoutDefaults.
// Picking a layout loads these (text + optional fonts/colors/noColor/lineOrder)
// ONLY while the gift is still "pristine" (its text equals the current layout's
// preset), so exploring layouts shows each one's distinct look without clobbering
// a user's own text. Once edited, switching only re-arranges (layout + lineOrder).
export interface LayoutDefault {
  text: Record<FieldId, string>;
  fonts?: Partial<Record<FieldId, FontStyle>>;
  sizes?: Partial<Record<FieldId, number>>;
  colors?: Partial<Record<FieldId, string>>;
  noColor?: Partial<Record<FieldId, boolean>>;
  lineOrder?: FieldId[];
}

export const LAYOUT_DEFAULTS: Record<Layout, LayoutDefault> = {
  center: { text: { dekoTop: '· ily ·←', topText: '.. stop being ..', mainText: 'so cute', bottomText: '.. i cant handle it ..', kaomoji: '(❀◡❀)', dekoBottom: '.. ･ ✦ ･ ..' } },
  inline: { text: { dekoTop: '❀', topText: 'you are', mainText: 'so cute', bottomText: '.. i cant handle it ..', kaomoji: '(❀◡❀)', dekoBottom: '.. ✦ ..' } },
  // Star pyramid — each star row is its OWN line (so every line is separately
  // clickable & editable): 3 gold star rows that grow in width (✦ / ✦·✦ / ✦·✦·✦)
  // form the triangle (3dxchat centers every line; leading-space indent can't
  // work), then 2 text lines below. lineOrder stacks them top→bottom; the stars
  // live in dekoTop/dekoBottom/bottomText, the text in topText/mainText.
  pyramid: {
    text: { dekoTop: '✦', dekoBottom: '✦ · ✦', bottomText: '✦ · ✦ · ✦', topText: 'youre my', mainText: 'shining star', kaomoji: '' },
    sizes: { dekoTop: 16, dekoBottom: 16, bottomText: 16 },
    colors: { dekoTop: '#ffd84d', dekoBottom: '#ffd84d', bottomText: '#ffd84d' },
    lineOrder: ['dekoTop', 'dekoBottom', 'bottomText', 'topText', 'mainText', 'kaomoji'],
  },
  // Sparkle — centered stack with pink ✦ deco top & bottom (and pink kaomoji).
  sparkle: {
    text: { dekoTop: '˚ ⋆ ✦ ⋆ ˚', topText: '.. stop being ..', mainText: 'so cute', bottomText: '.. i cant handle it ..', kaomoji: '(ʀ>ω<ʀ)', dekoBottom: '˚ ⋆ ✦ ⋆ ˚' },
    colors: { dekoTop: '#ff7ad9', dekoBottom: '#ff7ad9', kaomoji: '#ff7ad9' },
  },
  // Heart — centered text framed by pink hearts on ALL sides: heart deco top/bottom
  // PLUS each text line wrapped with hearts (♡ … ♡) so it's surrounded left/right too.
  heart: {
    text: { dekoTop: '♡ · ♥ · ♡', topText: '♡ you + me ♡', mainText: '♥ = forever ♥', bottomText: '', kaomoji: '(♡˘▽˘♡)', dekoBottom: '♡ · ♥ · ♡' },
    colors: { dekoTop: '#ff4d8c', dekoBottom: '#ff4d8c', topText: '#ff7ad9', kaomoji: '#ff7ad9' },
  },
  custom: { text: { dekoTop: '', topText: '', mainText: '', bottomText: '', kaomoji: '', dekoBottom: '' } },
};
