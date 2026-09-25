import { describe, it, expect } from 'vitest';
import { lineIsSelfContained, canReorderLines, moveCodeLine } from '../reorder';
import { generate } from '../generate';
import { composeLook, LOOKS } from '../../data/looks';
import { createDefaultState } from '../../state';

describe('moving a line of the gift', () => {
  const code = 'eins\nzwei\ndrei';

  it('lifts a line out and puts it back where asked', () => {
    expect(moveCodeLine(code, 0, 2)).toBe('zwei\ndrei\neins');
    expect(moveCodeLine(code, 2, 0)).toBe('drei\neins\nzwei');
    expect(moveCodeLine(code, 1, 0)).toBe('zwei\neins\ndrei');
  });

  it('changes nothing when there is nothing to change', () => {
    expect(moveCodeLine(code, 1, 1)).toBe(code);
    expect(moveCodeLine(code, 0, 9)).toBe(code);
    expect(moveCodeLine(code, -1, 0)).toBe(code);
  });

  it('keeps every line, just in another order', () => {
    const moved = moveCodeLine(code, 0, 2).split('\n').sort();
    expect(moved).toEqual(code.split('\n').sort());
  });
});

describe('when moving would break the tags', () => {
  it('a line that closes what it opens is fine', () => {
    expect(lineIsSelfContained('<size=44><color=#ff4fa3>hallo</color></size>')).toBe(true);
    expect(lineIsSelfContained('nur worte')).toBe(true);
  });

  it('a tag left open, or closed in the wrong order, is not', () => {
    expect(lineIsSelfContained('<color=#ff4fa3>hallo')).toBe(false);
    expect(lineIsSelfContained('hallo</color>')).toBe(false);
    expect(lineIsSelfContained('<size=44><color=#fff>x</size></color>')).toBe(false);
  });

  it('a gift whose colour runs across two lines is not offered the handles', () => {
    expect(canReorderLines('<color=#ff4fa3>oben\nunten</color>')).toBe(false);
  });

  // Everything the generator writes is safe to move: it wraps line by line.
  it('every layout the app builds can be reordered', () => {
    for (const look of LOOKS) {
      const code = generate(composeLook(createDefaultState(), look)).code;
      expect(canReorderLines(code), look.label).toBe(true);
    }
  });
});
