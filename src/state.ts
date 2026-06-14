import type { GiftState, FieldId, Layout, FontStyle } from './engine';

export type Commit = (producer: (s: GiftState) => GiftState, coalesceKey?: string) => void;

export const favKey = (catLabel: string, itemL: string) => `${catLabel}::${itemL}`;

export const FIELDS: FieldId[] = ['dekoTop', 'topText', 'mainText', 'bottomText', 'kaomoji', 'dekoBottom'];
export const LAYOUTS: Layout[] = ['center', 'inline', 'compact', 'framed', 'minimal', 'pyramid', 'flipped', 'custom'];

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

export const DECO_PRESETS: Partial<Record<FieldId, string[]>> = {
  dekoTop: ['· ily ·←', '❀ · ❀ · ❀', '✦ · · · ✦', '♥ · ♥ · ♥', '★.° ★.°', '· · ·'],
  dekoBottom: ['.. ･ ✦ ･ ..', '· · · · ·', '♡ ·° ☆ ·° ♡', '❀ ♡ ✦ ♡ ❀', '~ · ~ · ~'],
};

export const SYMBOLS = ['♡', '♥', '❀', '✿', '✦', '★', '·', '°', '˚', '⋆', '←', '→', '∞', '~', '｡ﾟ'];

export const KAOMOJI = ['(✿˘‿˘)', '(❀◡❀)', '(✿╹‿╹)ノ', '(❀˘‿˘)ノ', '(✿≧‿≦)', '(◉_◉❀)', '(˘³˘)♥', '(♡˘▽˘♡)', '(◍•ᴗ•◍)❤', '(◕‿◕✿)'];

export function createDefaultState(): GiftState {
  const grad = () => ({ on: false, c1: '#ff71b8', c2: '#b388ff', rainbow: false });
  return {
    text: {
      dekoTop: '· ily ·←',
      topText: '.. stop being ..',
      mainText: 'so cute',
      bottomText: '.. i cant handle it ..',
      kaomoji: '(❀◡❀)',
      dekoBottom: '.. ･ ✦ ･ ..',
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
  compact: { text: { dekoTop: '· · ·', topText: 'wollt nur sagen', mainText: 'danke dir', bottomText: 'für alles', kaomoji: '(˘³˘)♥', dekoBottom: '· · ·' } },
  framed: { text: { dekoTop: '❀ · ❀ · ❀', topText: 'du bist mein', mainText: 'liebling', bottomText: '· kein scherz ·', kaomoji: '', dekoBottom: '' } },
  minimal: { text: { dekoTop: '', topText: '', mainText: 'nur wir', bottomText: '', kaomoji: '(❀◡❀)', dekoBottom: '' } },
  // Star pyramid — gold deco lines that grow in width (✦ / ✦·✦ / ✦·✦·✦) form
  // the triangle, since 3dxchat centers every line and strips leading spaces
  // (no indent possible). The text sits normally below, fully editable.
  pyramid: {
    text: { dekoTop: '✦\n✦ · ✦\n✦ · ✦ · ✦', topText: 'youre my', mainText: 'shining star', bottomText: '', kaomoji: '', dekoBottom: '' },
    colors: { dekoTop: '#ffd84d' },
  },
  flipped: {
    text: { dekoTop: '.. ↓ ..', topText: 'ɢʀᴀᴠɪᴛʏ ɢᴀᴠᴇ ᴜᴘ\nᴀɴᴅ sᴏ ᴅɪᴅ ɪ\n', mainText: 'ꜰᴀʟʟɪɴɢ', bottomText: 'pɹɐɥ ꜰᴏʀ ʏᴏᴜ ♡', kaomoji: '(◡‿◡)', dekoBottom: 'ɴᴏᴡ ɪᴍ ᴊᴜsᴛ' },
    colors: { mainText: '#ff4d8c', topText: '#c4b5fd', bottomText: '#a78bfa' },
    noColor: { dekoTop: true, dekoBottom: true, kaomoji: true },
    lineOrder: ['dekoTop', 'topText', 'dekoBottom', 'mainText', 'bottomText', 'kaomoji'],
  },
  custom: { text: { dekoTop: '', topText: '', mainText: '', bottomText: '', kaomoji: '', dekoBottom: '' } },
};
