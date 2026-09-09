import { describe, it, expect } from 'vitest';
import { TEMPLATE_CATEGORIES, composeTemplate } from '../data/templates';
import { LOOKS, composeLook } from '../data/looks';
import { generate } from '../engine';
import { createDefaultState } from '../state';

// The field editor and the code box are two ways to write the same gift, and
// the switch between them rests on one rule: the code in the box is "still the
// fields'" exactly while it equals what the fields would print. If that ever
// stops holding for a freshly applied card, the switch would warn about lost
// work on every gift and nobody would trust the warning again.

const handEdited = (built: Parameters<typeof generate>[0], code: string) => generate(built).code !== code;

describe('the switch between code and fields', () => {
  it('sees a freshly applied card as untouched', () => {
    for (const cat of TEMPLATE_CATEGORIES.slice(0, 6)) {
      const item = cat.items[0];
      if (!item) continue;
      const built = composeTemplate(createDefaultState(), cat, item);
      expect(handEdited(built, generate(built).code), `${cat.label} · ${item.l}`).toBe(false);
    }
  });

  it('sees a card that arrived through a layout as untouched too', () => {
    for (const look of LOOKS) {
      const built = composeLook(createDefaultState(), look);
      expect(handEdited(built, generate(built).code), look.id).toBe(false);
    }
  });

  it('notices a single character typed into the box', () => {
    const built = composeLook(createDefaultState(), LOOKS[0]);
    expect(handEdited(built, generate(built).code + '!')).toBe(true);
  });

  // Printing has to be repeatable, or the comparison would flap on its own.
  it('prints the same gift the same way every time', () => {
    const built = composeLook(createDefaultState(), LOOKS[0]);
    expect(generate(built).code).toBe(generate(built).code);
  });
});
