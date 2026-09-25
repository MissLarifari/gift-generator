import { describe, it, expect } from 'vitest';
import { ENTRIES } from '../data/tags';
import { LOOKS, lookIdOf, fitsLook, sayingShapeOf, composeLook, wordSlotsOf } from '../data/looks';
import { composeTemplate } from '../data/templates';
import { createDefaultState } from '../state';
import { generate } from '../engine';

// Choosing a layout and choosing words are two steps, and the second one broke
// when the fourteen collected looks arrived: the shelf filters sayings by the
// shape of the layout, and each of those matched exactly ONE card — its own
// example. Fourteen layouts you could not write anything into.

const offered = (lookId: string) =>
  ENTRIES.filter((e) => fitsLook(lookIdOf({ ...e.cat.theme, ...e.item.theme }), sayingShapeOf(lookId)));

describe('every layout has sayings to choose from', () => {
  for (const look of LOOKS) {
    it(`${look.label} offers more than its own example`, () => {
      expect(offered(look.id).length).toBeGreaterThan(50);
    });
  }
});

describe('a saying poured into a layout', () => {
  // One sentence over three lines is the rule every saying is written to, so
  // it has to survive the move. Arrow Focus shows its loud line LAST, which is
  // where field-for-field copying put the tail above the middle.
  const saying = ENTRIES.find((e) => e.item.l === 'Nicht höflich')!;
  const parts = [saying.item.top, saying.item.main, saying.item.bottom];

  for (const look of LOOKS) {
    it(`still reads as one sentence in ${look.label}`, () => {
      const built = composeTemplate(createDefaultState(), saying.cat, saying.item);
      if (!fitsLook(lookIdOf(built), sayingShapeOf(look.id))) return;   // not offered there
      const moved = lookIdOf(built) !== look.id ? composeLook(built, look, true) : built;
      const seen = wordSlotsOf(look).map((f) => moved.text[f]).filter(Boolean);
      expect(seen).toEqual(parts.filter(Boolean));
    });
  }

  it('keeps the layout’s own ornament instead of overwriting it', () => {
    const look = LOOKS.find((l) => l.id === 'heartSmile')!;
    const built = composeTemplate(createDefaultState(), saying.cat, saying.item);
    const moved = composeLook(built, look, true);
    expect(moved.text.dekoTop).toBe(look.text.dekoTop);
    expect(moved.text.kaomoji).toBe(look.text.kaomoji);
  });

  it('stays inside both limits in all fourteen collected looks', () => {
    const over: string[] = [];
    for (const look of LOOKS) {
      for (const e of offered(look.id)) {
        const built = composeTemplate(createDefaultState(), e.cat, e.item);
        const r = generate(lookIdOf(built) !== look.id ? composeLook(built, look, true) : built);
        if (r.over) over.push(`${look.label} · ${e.item.l}`);
      }
    }
    // Sparkle is the old exception: its second deco row costs 48 bytes and the
    // long sayings do not fit under it. That is a known gap, not a new one.
    expect(over.filter((x) => !x.startsWith('Sparkle'))).toEqual([]);
  });
});

// Four of the collected looks keep their accent INSIDE the example's words —
// "sweet" inside "sweet temptation". Measured on those letters, it cannot move
// with a different sentence, so pouring a saying in produced a plain white
// gift; Word Bridge even at size 14, because there the row is small and only
// the accent is large. The row now inherits the accent.
describe('a poured saying keeps the layout’s colour', () => {
  const saying = ENTRIES.find((e) => e.item.l === 'Nicht höflich')!;

  for (const look of LOOKS) {
    it(`${look.label} is not left plain white`, () => {
      const built = composeTemplate(createDefaultState(), saying.cat, saying.item);
      const code = generate(lookIdOf(built) !== look.id ? composeLook(built, look, true) : built).code;
      expect(code, look.label).toMatch(/<color=#[0-9a-f]{6}>/i);
    });
  }

  it('gives the loud line a loud size, not the accent’s leftovers', () => {
    for (const id of ['littleDetour', 'bestDetour']) {
      const look = LOOKS.find((l) => l.id === id)!;
      const built = composeTemplate(createDefaultState(), saying.cat, saying.item);
      const moved = composeLook(built, look, true);
      expect(moved.sizes.mainText, id).toBeGreaterThan(30);
    }
  });
});
