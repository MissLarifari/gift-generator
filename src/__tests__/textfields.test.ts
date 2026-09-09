import { describe, it, expect } from 'vitest';
import { isDecoLine } from '../engine';
import { LOOKS, composeLook } from '../data/looks';
import { createDefaultState } from '../state';
import { DECO_FIELDS } from '../state';
import type { FieldId } from '../engine';

// Which lines belong in the Text section is decided by their CONTENT, not by
// their name. The two-part build runs its sentence through the deco rows —
// "du bist" above, "in meinem" between the two loud words. Those are words, so
// they belong with the text; a row of pure symbols stays with the decoration.

const hasWords = (v: string) => v.trim() !== '' && !isDecoLine(v);

describe('what counts as text rather than decoration', () => {
  it('the two-parter carries words in its deco rows', () => {
    const s = composeLook(createDefaultState(), LOOKS.find((l) => l.id === 'twoWords')!);
    const wordy = DECO_FIELDS.filter((f) => hasWords(s.text[f] ?? ''));
    expect(wordy).toContain('dekoTop');       // "▶ .. du bist .. ◀"
    expect(wordy).toContain('dekoBottom');    // "° ✦ in meinem ✦ °"
  });

  it('a kaomoji is never mistaken for words', () => {
    for (const look of LOOKS) {
      const s = composeLook(createDefaultState(), look);
      expect(hasWords(s.text.kaomoji ?? ''), look.id).toBe(false);
    }
  });

  it('the note keeps its symbol row out of the text', () => {
    const s = composeLook(createDefaultState(), LOOKS.find((l) => l.id === 'note')!);
    expect(hasWords(s.text.dekoTop ?? '')).toBe(false);   // "° ✿ ★ ✿ °"
  });

  // Whatever the build, the three real text lines are always offered.
  it('always offers the three text lines', () => {
    const drei: FieldId[] = ['mainText', 'topText', 'bottomText'];
    for (const f of drei) expect(DECO_FIELDS.includes(f)).toBe(false);
  });
});
