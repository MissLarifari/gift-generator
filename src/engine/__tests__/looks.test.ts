import { describe, it, expect } from 'vitest';
import { LOOKS, lookIdOf, composeLook } from '../../data/looks';
import { generate } from '../generate';
import { createDefaultState } from '../../state';

// The two-word look is Lari's own build. This is the code she wrote out by
// hand, kept verbatim as the specification: the lead-in ".. der" small and
// untagged (3dxchat draws untagged text white for free), only the loud word
// carrying size and colour. If the engine or the look drifts, this says so
// before she has to.
const LARI = [
  '▶ .. ∂υ вιѕт .. ◀',
  '<size=40><color=#ffd84d>.. ∂αѕ ѕαℓz</color></size>',
  '<color=#ff9ec7>° ✿ ★ ιη ✦ ✿</color>',
  '.. ∂єя <size=40><color=#ff4fa3>ѕυρρє ✿★</color></size>',
  '<color=#ff9ec7>↖(✿ ∩◡∩)↗</color>',
].join('\n');

function applied(id: string) {
  const look = LOOKS.find((l) => l.id === id)!;
  const s = createDefaultState();
  return {
    ...s,
    text: { ...s.text, ...look.text, ...look.sample },
    colors: { ...s.colors, ...look.colors },
    fonts: { ...s.fonts, ...look.fonts },
    sizes: { ...s.sizes, ...look.sizes },
    noColor: { ...s.noColor, ...look.noColor },
    lineOrder: look.lineOrder ?? s.lineOrder,
    ranges: { ...look.sampleRanges },
  };
}

describe('Zweiteiler look', () => {
  it('is byte-for-byte the code Lari wrote by hand, and fits', () => {
    const r = generate(applied('twoWords'));
    expect(r.code).toBe(LARI);
    expect(r.over).toBe(false);
    expect(r.bytes).toBeLessThanOrEqual(255);
  });

  it('the small lead-in is free: it carries no tag at all', () => {
    const r = generate(applied('twoWords'));
    const bottom = r.code.split('\n')[3];
    expect(bottom.startsWith('.. ∂єя <size=40>')).toBe(true); // no wrapper before it
  });

  it('is still recognised as twoWords when the size sits in a range', () => {
    const st = applied('twoWords');
    expect(st.sizes.bottomText).toBe(14);   // the line's base is small
    expect(lookIdOf(st)).toBe('twoWords');  // …the range makes it loud
  });

  it('the note look is unaffected and still reads as note', () => {
    expect(lookIdOf(applied('note'))).toBe('note');
    expect(generate(applied('note')).over).toBe(false);
  });
});

describe('what a look applies over words that are already there', () => {
  // "du bist / stay a little / in / im comfy" — the two-word look used to
  // carry its example's sentence fragments in the deco it always applies.
  it('no look brings words of its own in its deco rows', () => {
    for (const l of LOOKS) {
      for (const f of ['dekoTop', 'dekoBottom', 'topText'] as const) {
        const v = l.text[f];
        if (v) expect(v, `${l.id}.${f}`).not.toMatch(/\p{L}{2,}/u);
      }
    }
  });

  it('the example keeps them, because there they are the sentence', () => {
    const two = LOOKS.find((l) => l.id === 'twoWords')!;
    expect(two.sample.dekoTop).toContain('du bist');
    expect(two.sample.dekoBottom).toContain('in');
  });
});

describe('the two-part build over words that are not the example', () => {
  // It used to fall apart here: the loudness of the second half lives in a
  // range measured for the example, so on any other gift the bottom line
  // stayed small and untagged — a "two-part" build with one loud half.
  const own = () => {
    const s = createDefaultState();
    return { ...s, text: { ...s.text, mainText: 'dont chase me', bottomText: 'unless you can keep up' } };
  };
  const two = LOOKS.find((l) => l.id === 'twoWords')!;

  it('makes the second half loud', () => {
    const out = composeLook(own(), two);
    expect(out.sizes.bottomText).toBe(40);
    expect(out.noColor.bottomText).toBe(false);
  });

  it('and is still recognised as the two-part build afterwards', () => {
    expect(lookIdOf(composeLook(own(), two))).toBe('twoWords');
  });

  it('keeps the words it was given', () => {
    const out = composeLook(own(), two);
    expect(out.text.mainText).toBe('dont chase me');
    expect(out.text.bottomText).toBe('unless you can keep up');
  });

  it('the example itself is untouched by this — it keeps its byte-exact shape', () => {
    const out = composeLook(createDefaultState(), two);
    expect(out.sizes.bottomText).toBe(14);
    expect(generate(out).code).toBe(LARI);
  });
});

describe('loading a card into a layout', () => {
  // One ready-made card IS the note look's example, word for word. Without
  // keepWords it was taken for an untouched gift and its words were thrown
  // away in favour of the new look's example.
  const sparkle = LOOKS.find((l) => l.id === 'sparkle')!;
  const note = LOOKS.find((l) => l.id === 'note')!;

  const card = () => {
    const s = createDefaultState();
    return { ...s, text: { ...s.text, ...note.sample, dekoTop: '° ✿ ★ ✿ °' } };
  };

  it('keeps the words of the card', () => {
    const out = composeLook(card(), sparkle, true);
    expect(out.text.mainText).toBe(note.sample.mainText);
  });

  it('and only adds the frame', () => {
    const out = composeLook(card(), sparkle, true);
    expect(out.text.dekoBottom).toBe('° ✿ ★ ✿ °');
    expect(out.lineOrder[5]).toBe('dekoBottom');
  });

  it('Sparkle mirrors the gift its own deco, not its own', () => {
    const out = composeLook(card(), sparkle, true);
    expect(out.text.dekoTop).toBe('° ✿ ★ ✿ °');
  });

  it('without keepWords an empty gift still gets the example', () => {
    const out = composeLook(createDefaultState(), sparkle);
    expect(out.text.mainText).toBe(sparkle.sample.mainText);
  });
});
