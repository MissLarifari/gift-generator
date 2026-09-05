import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, rgbToHsv, hsvToRgb, hsvToHex, hexToHsv, isHex, readableInk } from '../color';

// The picker drags in HSV and writes hex. If the two disagree the swatch and
// the code drift apart, so the round trip is what these guard.

describe('hex and rgb', () => {
  it('reads the long and the short form', () => {
    expect(hexToRgb('#ff4fa3')).toEqual([255, 79, 163]);
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
    expect(hexToRgb('ff4fa3')).toEqual([255, 79, 163]);
  });

  it('refuses what is not a colour', () => {
    expect(hexToRgb('#ff4fa')).toBeNull();
    expect(hexToRgb('pink')).toBeNull();
    expect(isHex('#ff4fa3')).toBe(true);
    expect(isHex('#zzz')).toBe(false);
  });

  it('writes back what it read', () => {
    expect(rgbToHex([255, 79, 163])).toBe('#ff4fa3');
    expect(rgbToHex([0, 0, 0])).toBe('#000000');
  });

  it('clamps instead of producing nonsense', () => {
    expect(rgbToHex([300, -5, 12.4])).toBe('#ff000c');
  });
});

describe('hsv round trip', () => {
  for (const hex of ['#ff4fa3', '#ffd84d', '#3ad1c4', '#000000', '#ffffff', '#4ec0ef', '#997bb9']) {
    it(`survives ${hex}`, () => {
      const hsv = hexToHsv(hex)!;
      expect(hsvToHex(hsv)).toBe(hex);
    });
  }

  it('puts the primaries on the hues they belong to', () => {
    expect(Math.round(rgbToHsv([255, 0, 0])[0])).toBe(0);
    expect(Math.round(rgbToHsv([0, 255, 0])[0])).toBe(120);
    expect(Math.round(rgbToHsv([0, 0, 255])[0])).toBe(240);
  });

  it('keeps the hue of a grey instead of snapping it to red', () => {
    // Dragging the square down to black must not lose which hue you were on.
    expect(hexToHsv('#808080', 300)![0]).toBe(300);
  });

  it('full value and no saturation is white', () => {
    expect(hsvToRgb([210, 0, 1])).toEqual([255, 255, 255]);
  });
});

describe('readableInk', () => {
  it('picks dark ink on a light colour and light on a dark one', () => {
    expect(readableInk('#ffd84d')).toBe('#101318');
    expect(readableInk('#3b1a2a')).toBe('#ffffff');
  });
});
