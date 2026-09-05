import { describe, it, expect } from 'vitest';
import { resolveRuns, applyRange, shiftRanges, diffPoint, charLen, togglePick } from '../ranges';
import { generate } from '../generate';
import { createDefaultState } from '../../state';
import { byteLen } from '../count';

// Ranges are the one place the engine grew in the 2026-09 rebuild. These pin
// down the two things that matter: runs merge when they look the same (so a
// range only costs bytes where it changes something), and a field WITHOUT
// ranges renders byte-for-byte as before.

const base = { color: '#ff4f9a', size: 38 };

describe('resolveRuns', () => {
  it('no ranges → one run, the base style', () => {
    expect(resolveRuns('.. der suppe', base)).toEqual([{ text: '.. der suppe', style: base }]);
  });

  it('cuts at range edges and falls through to the base for the rest', () => {
    const runs = resolveRuns('.. der suppe ✿★', base, [{ start: 3, end: 6, style: { color: '#ffffff' } }]);
    expect(runs.map((r) => r.text)).toEqual(['.. ', 'der', ' suppe ✿★']);
    expect(runs[1].style.color).toBe('#ffffff');
    expect(runs[1].style.size).toBe(38);        // inherited
    expect(runs[2].style.color).toBe('#ff4f9a'); // back to base
  });

  it('merges neighbouring runs that end up identical', () => {
    // A range that repeats the base colour changes nothing → single run.
    const runs = resolveRuns('abcdef', base, [{ start: 2, end: 4, style: { color: '#ff4f9a' } }]);
    expect(runs).toHaveLength(1);
  });

  it('counts astral characters as one, so ✿ is never split', () => {
    const t = '✿★ hi';
    expect(charLen(t)).toBe(5);
    const runs = resolveRuns(t, base, [{ start: 0, end: 2, style: { color: '#fff' } }]);
    expect(runs[0].text).toBe('✿★');
  });

  it('the later range wins where two overlap', () => {
    const runs = resolveRuns('abcdef', base, [
      { start: 0, end: 6, style: { color: '#111111' } },
      { start: 2, end: 4, style: { color: '#222222' } },
    ]);
    expect(runs.map((r) => r.style.color)).toEqual(['#111111', '#222222', '#111111']);
  });
});

describe('applyRange', () => {
  it('trims what it overlaps so the newest choice wins cleanly', () => {
    const out = applyRange([{ start: 0, end: 10, style: { color: '#a' } }], 3, 6, { color: '#b' });
    expect(out).toEqual([
      { start: 0, end: 3, style: { color: '#a' } },
      { start: 3, end: 6, style: { color: '#b' } },
      { start: 6, end: 10, style: { color: '#a' } },
    ]);
  });
});

describe('shiftRanges + diffPoint', () => {
  it('typing before a range moves it along', () => {
    const { at, delta } = diffPoint('der suppe', 'XXder suppe');
    expect({ at, delta }).toEqual({ at: 0, delta: 2 });
    expect(shiftRanges([{ start: 4, end: 9, style: {} }], at, delta)).toEqual([{ start: 6, end: 11, style: {} }]);
  });
  it('deleting through a range shrinks it instead of leaving a ghost', () => {
    const out = shiftRanges([{ start: 2, end: 6, style: {} }], 3, -5);
    expect(out).toEqual([{ start: 2, end: 3, style: {} }]);
  });
});

describe('generate with ranges', () => {
  const withText = () => {
    const s = createDefaultState();
    return { ...s, text: { ...s.text, bottomText: '.. der suppe' }, colors: { ...s.colors, bottomText: '#ff4f9a' } };
  };

  it('a field without ranges renders exactly as before', () => {
    const s = withText();
    const plain = generate(s).code;
    const withEmpty = generate({ ...s, ranges: { bottomText: [] } }).code;
    expect(withEmpty).toBe(plain);
  });

  it('a white, untagged range costs no colour wrapper', () => {
    const s = withText();
    const tagged = generate({ ...s, ranges: { bottomText: [{ start: 3, end: 6, style: { color: '#ffffff' } }] } }).code;
    const untagged = generate({ ...s, ranges: { bottomText: [{ start: 3, end: 6, style: { noColor: true } }] } }).code;
    expect(tagged).toContain('<color=#ffffff>der</color>');
    expect(untagged).toContain('>der<'); // sits between the neighbours' closing/opening tags
    expect(untagged).not.toContain('<color=#ffffff>');
    expect(byteLen(untagged)).toBeLessThan(byteLen(tagged));
  });
});

describe('size hoisting', () => {
  const line = () => {
    const s = createDefaultState();
    return { ...s, text: { ...s.text, bottomText: '.. der suppe' }, colors: { ...s.colors, bottomText: '#ff4f9a' }, sizes: { ...s.sizes, bottomText: 40 } };
  };

  it('writes the shared size once around the whole line, not per run', () => {
    const code = generate({ ...line(), ranges: { bottomText: [{ start: 3, end: 6, style: { noColor: true } }] } }).code;
    expect(code.split('<size=40>').length - 1).toBe(1);
    expect(code).toContain('<size=40><color=#ff4f9a>.. </color>der<color=#ff4f9a> suppe</color></size>');
  });

  it('untagged white at the FRONT costs nothing: ".. der" white + "suppe" pink == plain line bytes', () => {
    const plain = byteLen(generate(line()).code);
    const styled = byteLen(generate({ ...line(), ranges: { bottomText: [{ start: 0, end: 6, style: { noColor: true } }] } }).code);
    expect(styled).toBe(plain);
  });

  it('a range that really changes the size falls back to per-run sizes', () => {
    const code = generate({ ...line(), ranges: { bottomText: [{ start: 7, end: 12, style: { size: 60 } }] } }).code;
    expect(code).toContain('<size=40>');
    expect(code).toContain('<size=60>');
  });
});

describe('togglePick', () => {
  // The anchor is an argument, not a ref read inside a state updater. React is
  // free to run an updater twice; when the anchor moved inside it, the second
  // run filled i..i and shift-click left two loose characters behind.
  it('shift fills the whole stretch from the anchor', () => {
    expect([...togglePick([7], 7, 11, true)]).toEqual([7, 8, 9, 10, 11]);
  });

  it('fills backwards too', () => {
    expect([...togglePick([11], 11, 7, true)].sort((a, b) => a - b)).toEqual([7, 8, 9, 10, 11]);
  });

  it('is idempotent, so a repeated updater run cannot change the outcome', () => {
    const once = togglePick([7], 7, 11, true);
    expect([...togglePick([7], 7, 11, true)]).toEqual([...once]);
  });

  it('a plain click toggles one character', () => {
    expect([...togglePick([3, 4], null, 4, false)]).toEqual([3]);
    expect([...togglePick([3], null, 4, false)]).toEqual([3, 4]);
  });

  it('shift without an anchor behaves like a plain click', () => {
    expect([...togglePick([], null, 5, true)]).toEqual([5]);
  });
});
