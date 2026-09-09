import { describe, it, expect } from 'vitest';
import { optimize } from '../engine';
import { generate } from '../engine';
import { LOOKS, composeLook } from '../data/looks';
import { createDefaultState } from '../state';

// The optimizer used to only shave tags. A gift that is still too long after
// all of those has to give something up, and decoration is the first thing that
// can go — so each deco row is offered as its own button, with the row itself
// in the label so it is clear which one is meant.

const sparkle = generate(composeLook(createDefaultState(), LOOKS.find((l) => l.id === 'sparkle')!)).code;

describe('dropping a decoration row', () => {
  const cuts = optimize(sparkle).filter((t) => t.id === 'cutdeco');

  it('offers one button per decoration row', () => {
    expect(cuts.length).toBeGreaterThanOrEqual(2);   // Sparkle carries two
  });

  it('names the row it would remove', () => {
    for (const c of cuts) expect(c.arg && c.arg.length > 0).toBe(true);
  });

  it('really removes exactly that one line', () => {
    for (const c of cuts) {
      expect(c.fixed.split('\n').length).toBe(sparkle.split('\n').length - 1);
      expect(c.saves).toBeGreaterThan(0);
    }
  });

  it('says it changes the look, because it does', () => {
    for (const c of cuts) expect(c.changesLook).toBe(true);
  });

  it('keeps every tip separately pressable', () => {
    const ids = optimize(sparkle).map((t) => t.uid);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // The words are the gift. Whatever else the optimizer offers, it never
  // offers to throw the message away.
  it('never offers to drop a line with words in it', () => {
    const worte = optimize(sparkle)
      .filter((t) => t.id === 'cutdeco')
      .filter((t) => /[a-z]{2}/i.test(t.arg ?? ''));
    expect(worte).toEqual([]);
  });
});
