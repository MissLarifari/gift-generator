import { describe, it, expect } from 'vitest';
import { createDefaultState } from '../state';
import { encodeState, decodeState } from '../share';

describe('share encode/decode', () => {
  it('round-trips the default state exactly', () => {
    const s = createDefaultState();
    expect(decodeState(encodeState(s))).toEqual(s);
  });

  it('round-trips a heavily customised state', () => {
    const s = createDefaultState();
    s.text.mainText = 'happy birthday 🎂';
    s.layout = 'pyramid';
    s.sizes.mainText = 48;
    s.fonts.mainText = 'fancy';
    s.colors.mainText = '#ffd700';
    s.grads.mainText = { on: true, c1: '#ffd700', c2: '#ff8c00', rainbow: false };
    s.bold.main = true;
    s.italic.top = true;
    s.stars.topText = true;
    s.noColor.dekoBottom = true;
    s.lineOrder = ['mainText', 'kaomoji', 'topText', 'bottomText', 'dekoTop', 'dekoBottom'];
    expect(decodeState(encodeState(s))).toEqual(s);
  });

  it('survives unicode in every text field', () => {
    const s = createDefaultState();
    s.text = { dekoTop: '❀·❀', topText: 'αв', mainText: 'ꜱᴄ ล†', bottomText: '∞~', kaomoji: '(◕‿◕✿)', dekoBottom: '｡ﾟ' };
    expect(decodeState(encodeState(s))).toEqual(s);
  });

  it('fills missing keys from defaults (forward-compat)', () => {
    // Simulate an old/partial link that only carried a couple of fields.
    const partial = { text: { mainText: 'hi' }, layout: 'minimal' };
    const encoded = btoa(JSON.stringify(partial)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const out = decodeState(encoded)!;
    expect(out.layout).toBe('minimal');
    expect(out.text.mainText).toBe('hi');
    // untouched fields fall back to defaults
    expect(out.sizes.mainText).toBe(60);
    expect(out.colors.mainText).toBe('#ff71b8');
  });

  it('returns null on garbage input', () => {
    expect(decodeState('not-valid-base64!!!')).toBeNull();
    expect(decodeState('')).toBeNull();
  });
});
