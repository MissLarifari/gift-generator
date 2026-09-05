import { describe, it, expect } from 'vitest';
import { TEMPLATE_CATEGORIES, CATEGORY_ORDER, composeTemplate } from '../data/templates';
import { generate } from '../engine';
import { LOOKS, lookIdOf, fitsLook } from '../data/looks';
import { createDefaultState } from '../state';

// 3dxchat refuses a gift over 240 characters or 255 bytes, and the ornate
// script costs 2-3 bytes a letter — so a saying that reads fine can still be
// unsendable. Every card is measured here rather than at the copy button.

const built = TEMPLATE_CATEGORIES.flatMap((cat) =>
  cat.items.map((item) => ({ cat, item, r: generate(composeTemplate(createDefaultState(), cat, item)) })),
);

describe('every ready-made gift fits', () => {
  it('there are cards to measure', () => {
    expect(built.length).toBeGreaterThan(60);
  });

  for (const { cat, item, r } of built) {
    it(`${cat.label} · ${item.l}`, () => {
      expect(r.chars, `${r.chars} characters`).toBeLessThanOrEqual(240);
      expect(r.bytes, `${r.bytes} bytes`).toBeLessThanOrEqual(255);
      expect(r.over).toBe(false);
    });
  }
});

describe('Two Parts', () => {
  const two = TEMPLATE_CATEGORIES.find((c) => c.label === 'Two Parts')!;

  it('is a set, not a pair', () => {
    expect(two.items.length).toBeGreaterThanOrEqual(12);
  });

  it('every card is recognised as the two-part build', () => {
    for (const item of two.items) {
      const st = composeTemplate(createDefaultState(), two, item);
      expect(lookIdOf(st), item.l).toBe('twoWords');
    }
  });

  it('the deco row sits BETWEEN the two loud words', () => {
    const st = composeTemplate(createDefaultState(), two, two.items[0]);
    const order = st.lineOrder;
    expect(order.indexOf('dekoBottom')).toBeGreaterThan(order.indexOf('mainText'));
    expect(order.indexOf('dekoBottom')).toBeLessThan(order.indexOf('bottomText'));
  });

  it('carries no apostrophes: the ornate script turns them into commas', () => {
    for (const item of two.items) {
      expect(item.main + item.top + item.bottom, item.l).not.toContain("'");
    }
  });
});

describe('what each layout has to offer', () => {
  // The shelf hides a category that has nothing in the picked layout, so a
  // layout with nothing at all would leave it empty. Every look needs stock.
  // Asks exactly what the shelf asks, so the test cannot pass while the shelf
  // shows an empty layout.
  const fitting = (id: string) =>
    TEMPLATE_CATEGORIES.flatMap((c) => c.items.filter((i) => fitsLook(lookIdOf({ ...c.theme, ...i.theme }), id)));

  for (const look of LOOKS) {
    it(`${look.label} has ready-made gifts`, () => {
      expect(fitting(look.id).length).toBeGreaterThan(0);
    });
  }

  it('the two-part build has a real choice, not a token pair', () => {
    expect(fitting('twoWords').length).toBeGreaterThanOrEqual(20);
  });

  it('Spicy reaches both builds', () => {
    const spicy = TEMPLATE_CATEGORIES.find((c) => c.label === 'Spicy')!;
    const ids = new Set(spicy.items.map((i) => lookIdOf({ ...spicy.theme, ...i.theme })));
    expect(ids).toEqual(new Set(['note', 'twoWords']));
  });
});

describe('the order the shelf shows', () => {
  // A category left out of CATEGORY_ORDER still appears, but at the end of its
  // group where nobody looks. This is the reminder to place it.
  it('every category has a place in the order', () => {
    const missing = TEMPLATE_CATEGORIES.map((c) => c.label).filter((l) => !CATEGORY_ORDER.includes(l));
    expect(missing).toEqual([]);
  });

  it('the order names nothing that does not exist', () => {
    const labels = new Set(TEMPLATE_CATEGORIES.map((c) => c.label));
    expect(CATEGORY_ORDER.filter((l) => !labels.has(l))).toEqual([]);
  });

  it('the holidays run through the year, not the alphabet', () => {
    const jahr = ['Valentine', 'Womens Day', 'St Patricks', 'Easter', '4th of July', 'Halloween', 'Thanksgiving', 'Hanukkah', 'Christmas', 'New Year'];
    expect(CATEGORY_ORDER.filter((l) => jahr.includes(l))).toEqual(jahr);
  });
});

describe('Sparkle', () => {
  it('is the note with a second deco row, so it takes the same sayings', () => {
    expect(fitsLook('note', 'sparkle')).toBe(true);
    expect(fitsLook('sparkle', 'note')).toBe(true);
  });

  it('does not swallow the two-part build', () => {
    expect(fitsLook('twoWords', 'sparkle')).toBe(false);
    expect(fitsLook('note', 'twoWords')).toBe(false);
  });

  it('is recognised by its deco at both ends', () => {
    const two = LOOKS.find((l) => l.id === 'sparkle')!;
    expect(lookIdOf({ text: two.text, fonts: two.fonts, sizes: two.sizes })).toBe('sparkle');
  });
});
