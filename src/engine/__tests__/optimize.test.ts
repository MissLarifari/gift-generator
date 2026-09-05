import { describe, it, expect } from 'vitest';
import { optimize, pressure } from '../optimize';
import { parseCode } from '../parse';
import { byteLen } from '../count';

// A tip is a button, so the bar is higher than "sounds sensible": pressing it
// must not change what 3dxchat draws, except where the tip says it will.

/** What the client actually renders, with the defaults filled in. */
const shown = (code: string) =>
  parseCode(code).lines.map((runs) =>
    runs.map((r) => `${r.text}|${r.color ?? 'default'}|${r.size ?? 14}|${r.bold}|${r.italic}`).join(''));

const words = (code: string) => parseCode(code).lines.map((runs) => runs.map((r) => r.text).join(''));

const tip = (code: string, id: string) => optimize(code).find((t) => t.id === id);

describe('what it finds', () => {
  it('a white colour tag: the default is white and costs nothing', () => {
    const t = tip('<color=#ffffff>hello</color>', 'white')!;
    expect(t.fixed).toBe('hello');
    expect(t.saves).toBe(23);   // <color=#ffffff> is 15 bytes, </color> is 8
  });

  it('counts #fff and near-white as white too', () => {
    expect(tip('<color=#fff>a</color>', 'white')).toBeTruthy();
    expect(tip('<color=#fefefe>a</color>', 'white')).toBeTruthy();
    expect(tip('<color=#ff4fa3>a</color>', 'white')).toBeUndefined();
  });

  it('a size tag that only repeats the default', () => {
    const t = tip('<size=14>hi</size>', 'size14')!;
    expect(t.fixed).toBe('hi');
    expect(t.saves).toBe(16);
  });

  it('leaves a size that actually does something', () => {
    expect(tip('<size=40>hi</size>', 'size14')).toBeUndefined();
  });

  it('an empty tag pair', () => {
    expect(tip('a<color=#ff4fa3></color>b', 'empty')!.fixed).toBe('ab');
  });

  it('a seam between two identical colours', () => {
    expect(tip('<color=#ff4fa3>a</color><color=#ff4fa3>b</color>', 'merge')!.fixed)
      .toBe('<color=#ff4fa3>ab</color>');
  });

  it('leaves spacing alone: 3dxchat centres lines, so a space is not nothing', () => {
    expect(optimize('a  b   ')).toEqual([]);
  });

  it('ornate script folded back to plain letters', () => {
    const t = tip('\u2202\u03c5 \u0432\u03b9\u0455\u0442', 'plain')!;
    expect(t.fixed).toBe('du bist');
    expect(t.saves).toBeGreaterThan(5);
  });

  it('says nothing when there is nothing to say', () => {
    expect(optimize('hello')).toEqual([]);
  });

  it('offers the biggest saving first', () => {
    const list = optimize('<color=#ffffff><size=14>a  b</size></color>');
    expect(list.length).toBeGreaterThan(1);
    expect(list[0].saves).toBeGreaterThanOrEqual(list[1].saves);
  });
});

describe('pressing a tip is safe', () => {
  const CODE = [
    '<color=#ffffff>\u25b6 .. hello .. \u25c0</color>',
    '<size=14>.. small line ..</size>',
    '<size=40><color=#ff4fa3>loud</color></size><color=#ff4fa3> more</color>',
    'trailing  spaces   ',
  ].join('\n');

  for (const id of ['size14', 'empty', 'merge'] as const) {
    it(`${id} leaves the gift looking exactly the same`, () => {
      const t = tip(CODE, id);
      if (!t) return;                       // nothing to fix in this sample
      expect(t.changesLook).toBe(false);
      expect(shown(t.fixed)).toEqual(shown(CODE));
    });
  }

  it('white keeps every word and only lets go of the shade', () => {
    const t = tip(CODE, 'white')!;
    expect(t.changesLook).toBe(true);
    expect(words(t.fixed)).toEqual(words(CODE));
  });

  it('plain says up front that it changes the script', () => {
    expect(tip(CODE, 'plain')?.changesLook ?? true).toBe(true);
  });

  it('every tip really is lighter than what it replaces', () => {
    for (const t of optimize(CODE)) expect(byteLen(t.fixed)).toBeLessThan(byteLen(CODE));
  });

  it('tips can be stacked: apply one, ask again', () => {
    let code = CODE;
    for (let i = 0; i < 5; i++) {
      const next = optimize(code).find((t) => !t.changesLook);
      if (!next) break;
      code = next.fixed;
    }
    expect(byteLen(code)).toBeLessThan(byteLen(CODE));
    expect(words(code)).toEqual(words(CODE));
  });
});

describe('pressure', () => {
  it('knows when it is over and when it is merely tight', () => {
    expect(pressure('hi').over).toBe(false);
    expect(pressure('x'.repeat(241)).over).toBe(true);
    expect(pressure('x'.repeat(215)).tight).toBe(true);
  });
});
