import { describe, it, expect } from 'vitest';
import { generate } from '../generate';
import type { GiftState } from '../types';

// Golden fixtures captured from the LIVE legacy generator (the oracle).
// The engine port must produce byte-identical output, so we feed the same
// state and assert exact code + char/byte counts.

const D: GiftState = {
  text: { dekoTop: '', topText: '', mainText: '', bottomText: '', kaomoji: '', dekoBottom: '' },
  sizes: { dekoTop: 12, topText: 14, mainText: 60, bottomText: 14, kaomoji: 16, dekoBottom: 12 },
  fonts: { dekoTop: 'normal', topText: 'normal', mainText: 'normal', bottomText: 'normal', kaomoji: 'normal', dekoBottom: 'normal' },
  colors: { dekoTop: '#555555', topText: '#8f8f8f', mainText: '#ff71b8', bottomText: '#8f8f8f', kaomoji: '#ffd84d', dekoBottom: '#5c5c7a' },
  noColor: { dekoTop: false, topText: false, mainText: false, bottomText: false, kaomoji: false, dekoBottom: false },
  grads: {
    dekoTop: { on: false, c1: '#ff71b8', c2: '#b388ff', rainbow: false },
    topText: { on: false, c1: '#ff71b8', c2: '#b388ff', rainbow: false },
    mainText: { on: false, c1: '#ff71b8', c2: '#b388ff', rainbow: false },
    bottomText: { on: false, c1: '#ff71b8', c2: '#b388ff', rainbow: false },
    kaomoji: { on: false, c1: '#ff71b8', c2: '#b388ff', rainbow: false },
    dekoBottom: { on: false, c1: '#ff71b8', c2: '#b388ff', rainbow: false },
  },
  bold: { top: false, main: false, bottom: false },
  italic: { top: false, main: false, bottom: false },
  stars: { dekoTop: false, topText: false, bottomText: false },
  layout: 'center',
  lineOrder: ['dekoTop', 'topText', 'mainText', 'bottomText', 'kaomoji', 'dekoBottom'],
  customText: '',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function S(o: any): GiftState {
  const c: GiftState = JSON.parse(JSON.stringify(D));
  if (o.text) Object.assign(c.text, o.text);
  if (o.sizes) Object.assign(c.sizes, o.sizes);
  if (o.fonts) Object.assign(c.fonts, o.fonts);
  if (o.colors) Object.assign(c.colors, o.colors);
  if (o.noColor) Object.assign(c.noColor, o.noColor);
  if (o.grads) Object.keys(o.grads).forEach((f) => Object.assign((c.grads as any)[f], o.grads[f]));
  if (o.bold) Object.assign(c.bold, o.bold);
  if (o.italic) Object.assign(c.italic, o.italic);
  if (o.stars) Object.assign(c.stars, o.stars);
  if (o.layout) c.layout = o.layout;
  if (o.lineOrder) c.lineOrder = o.lineOrder;
  return c;
}

const B = { dekoTop: '· ily ·←', topText: '.. stop being ..', mainText: 'so cute', bottomText: '.. i cant handle it ..', kaomoji: '(❀◡❀)', dekoBottom: '.. ･ ✦ ･ ..' };

interface Case { name: string; state: GiftState; code: string; chars: number; bytes: number }

const CASES: Case[] = [
  { name: 'default-center', state: S({ text: B }), chars: 233, bytes: 249, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color>
<size=60><color=#ff71b8>so cute</color></size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'fancy-main', state: S({ text: B, fonts: { mainText: 'fancy' } }), chars: 233, bytes: 255, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color>
<size=60><color=#ff71b8>ѕσ ¢υтє</color></size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'smallcaps-top', state: S({ text: B, fonts: { topText: 'smallcaps' } }), chars: 233, bytes: 261, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. sᴛᴏᴘ ʙᴇɪɴɢ ..</color>
<size=60><color=#ff71b8>so cute</color></size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'thai-bottom', state: S({ text: B, fonts: { bottomText: 'thai' } }), chars: 233, bytes: 270, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color>
<size=60><color=#ff71b8>so cute</color></size>
<color=#8f8f8f>.. เ ¢ลи† ђลи∂ℓэ เ† ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'flipped-font-main', state: S({ text: { ...B, mainText: 'just flip me' }, fonts: { mainText: 'flipped' } }), chars: 238, bytes: 261, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color>
<size=60><color=#ff71b8>ǝɯ dıʃɟ ʇsnɾ</color></size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'gradient-main', state: S({ text: B, grads: { mainText: { on: true, c1: '#ff71b8', c2: '#b388ff' } } }), chars: 256, bytes: 272, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color>
<size=60><color=#ff71b8>so</color> <color=#b388ff>cute</color></size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'rainbow-main', state: S({ text: B, grads: { mainText: { on: true, rainbow: true } } }), chars: 256, bytes: 272, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color>
<size=60><color=#ffadad>so</color> <color=#bdb2ff>cute</color></size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'nocolor-main', state: S({ text: B, noColor: { mainText: true } }), chars: 210, bytes: 226, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color>
<size=60>so cute</size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'bold-italic', state: S({ text: B, bold: { main: true, top: true }, italic: { main: true } }), chars: 254, bytes: 270, code: `<color=#555555>· ily ·←</color>
<b><color=#8f8f8f>.. stop being ..</color></b>
<size=60><i><b><color=#ff71b8>so cute</color></b></i></size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'custom-sizes', state: S({ text: B, sizes: { dekoTop: 20, mainText: 80, bottomText: 24 } }), chars: 265, bytes: 281, code: `<size=20><color=#555555>· ily ·←</color></size>
<color=#8f8f8f>.. stop being ..</color>
<size=80><color=#ff71b8>so cute</color></size>
<size=24><color=#8f8f8f>.. i cant handle it ..</color></size>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'layout-inline', state: S({ text: B, layout: 'inline' }), chars: 263, bytes: 283, code: `<color=#555555>· ily ·←</color> <color=#8f8f8f>.. stop being ..</color> <size=60><color=#ff71b8>so cute</color></size> <color=#555555>· ily ·←</color>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'layout-compact', state: S({ text: B, layout: 'compact' }), chars: 235, bytes: 253, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color> · <size=60><color=#ff71b8>so cute</color></size> · <color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'layout-framed', state: S({ text: B, layout: 'framed' }), chars: 233, bytes: 249, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color>
<size=60><color=#ff71b8>so cute</color></size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'layout-minimal', state: S({ text: B, layout: 'minimal' }), chars: 76, bytes: 82, code: `<size=60><color=#ff71b8>so cute</color></size>
<color=#ffd84d>(❀◡❀)</color>` },

  { name: 'layout-flipped', state: S({ text: B, layout: 'flipped' }), chars: 233, bytes: 249, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color>
<size=60><color=#ff71b8>so cute</color></size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'reorder', state: S({ text: B, lineOrder: ['mainText', 'topText', 'dekoTop', 'kaomoji', 'bottomText', 'dekoBottom'] }), chars: 233, bytes: 249, code: `<size=60><color=#ff71b8>so cute</color></size>
<color=#8f8f8f>.. stop being ..</color>
<color=#555555>· ily ·←</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },

  { name: 'long-warn', state: S({ text: { ...B, mainText: 'this is a really long main message to push the counter into the warning zone yes' } }), chars: 306, bytes: 322, code: `<color=#555555>· ily ·←</color>
<color=#8f8f8f>.. stop being ..</color>
<size=60><color=#ff71b8>this is a really long main message to push the counter into the warning zone yes</color></size>
<color=#8f8f8f>.. i cant handle it ..</color>
<color=#ffd84d>(❀◡❀)</color>
<color=#5c5c7a>.. ･ ✦ ･ ..</color>` },
];

describe('gift engine — byte-identical to the legacy generator', () => {
  for (const c of CASES) {
    it(c.name, () => {
      const r = generate(c.state);
      expect(r.code).toBe(c.code);
      expect(r.chars).toBe(c.chars);
      expect(r.bytes).toBe(c.bytes);
    });
  }
});

// New (non-legacy) behaviour: the pyramid layout expands mainText into
// cumulative word lines so it forms a real triangle when 3dxchat centers it.
// Solid colour → ONE tag wraps the whole multi-line block (byte-cheap).
describe('pyramid — auto word-pyramid', () => {
  it('wraps the growing lines in a single solid-colour tag', () => {
    const r = generate(S({ text: { ...D.text, mainText: 'you are my star' }, sizes: { mainText: 26 }, colors: { mainText: '#ff71b8' }, layout: 'pyramid' }));
    expect(r.code).toBe(`<size=26><color=#ff71b8>you
you are
you are my
you are my star</color></size>`);
  });

  it('keeps deco / top around the pyramid (single-tag main block)', () => {
    const r = generate(S({ text: { dekoTop: '✦', topText: 'happy birthday', mainText: 'i love you', bottomText: '', kaomoji: '', dekoBottom: '' }, sizes: { mainText: 26 }, colors: { dekoTop: '#ffd84d', topText: '#8f8f8f', mainText: '#ff71b8' }, layout: 'pyramid' }));
    expect(r.code).toBe(`<color=#ffd84d>✦</color>
<color=#8f8f8f>happy birthday</color>
<size=26><color=#ff71b8>i
i love
i love you</color></size>`);
  });

  it('single word → single line (degenerate pyramid)', () => {
    const r = generate(S({ text: { ...D.text, mainText: 'hi' }, layout: 'pyramid' }));
    expect(r.code).toBe(`<size=60><color=#ff71b8>hi</color></size>`);
  });

  it('gradient main falls back to per-line styling', () => {
    const r = generate(S({ text: { ...D.text, mainText: 'a b c' }, sizes: { mainText: 26 }, grads: { mainText: { on: true, c1: '#ff71b8', c2: '#b388ff' } }, layout: 'pyramid' }));
    // each cumulative line styled on its own (gradients can't span newlines)
    expect(r.code.split('\n').length).toBe(3);
    expect(r.code).toContain('<size=26>');
    expect(r.code.startsWith('<size=26>')).toBe(true);
  });
});
