import { describe, it, expect } from 'vitest';
import { groupByOpening } from '../data/grouping';
import { ENTRIES } from '../data/tags';

// Grouping by ANY shared word puts "you are the calm in my chaos" next to
// "take the slow way over here", because both contain "the". The shared
// BEGINNING is the thing that makes two sayings read as variations of one.

const id = (s: string) => s;

describe('grouping by the shared opening', () => {
  it('puts the sayings that start the same way together', () => {
    const g = groupByOpening([
      'you are the calm in my chaos',
      'you are the quiet in my noise',
      'you are the reason i am awake',
      'stay a little longer',
    ], id);
    expect(g[0].label).toBe('you are');
    expect(g[0].items).toHaveLength(3);
  });

  it('leaves what is left over in a group with no name', () => {
    const g = groupByOpening([
      'you are the calm in my chaos',
      'you are the quiet in my noise',
      'you are the reason i am awake',
      'stay a little longer',
    ], id);
    const rest = g.find((x) => x.label === '');
    expect(rest?.items).toEqual(['stay a little longer']);
  });

  it('never names a group after a filler word alone', () => {
    const g = groupByOpening([
      'the calm in my chaos', 'the quiet in my noise', 'the reason i am awake',
    ], id);
    expect(g.every((x) => x.label !== 'the')).toBe(true);
  });

  it('trims filler off the end, so "you are the" is called "you are"', () => {
    const g = groupByOpening([
      'you are the calm', 'you are the quiet', 'you are the reason',
    ], id);
    expect(g[0].label).toBe('you are');
  });

  it('takes the longest opening the group still shares', () => {
    const g = groupByOpening([
      'i keep my place close', 'i keep my place right', 'i keep my place where',
      'i want you here', 'i want you near', 'i want you now',
    ], id);
    // "i keep my place" is four words, past what a name may be; "i want you"
    // is three and all three sayings have it, so it wins over "i want".
    expect(g.map((x) => x.label).sort()).toEqual(['i keep', 'i want you']);
  });

  it('makes no group out of two sayings that merely rhyme', () => {
    const g = groupByOpening(['one lonely line', 'another lonely line'], id);
    expect(g).toEqual([{ label: '', items: ['one lonely line', 'another lonely line'] }]);
  });

  it('loses no gift and repeats none', () => {
    const texts = ENTRIES.map((e) => `${e.item.top} ${e.item.main} ${e.item.bottom}`);
    const g = groupByOpening(texts, id, 3);
    const out = g.flatMap((x) => x.items);
    expect(out).toHaveLength(texts.length);
    expect(new Set(out).size).toBe(new Set(texts).size);
  });

  it('folds the real library into something you can read at a glance', () => {
    const texts = ENTRIES.map((e) => `${e.item.top} ${e.item.main} ${e.item.bottom}`.trim());
    const g = groupByOpening(texts, id, 3);
    // Nine hundred sayings fold into roughly a hundred closed lines — an
    // eighth of the list, and the biggest opening gathers dozens at once.
    expect(g.length).toBeLessThan(texts.length / 5);
    expect(g[0].items.length).toBeGreaterThan(20);
  });
});

// Beside "you are" and "you make", a bucket called "you" is not a group — it
// is "starts with you but is none of the above". The shelf showed exactly that
// next to each other, and it read as broken.
describe('no remainder pretending to be a group', () => {
  it('drops a one-word name that a longer group already starts with', () => {
    const g = groupByOpening([
      'you are the calm', 'you are the quiet', 'you are the reason',
      'you make it easy', 'you make it warm', 'you make it home',
      'you smell of rain', 'you sing off key', 'you never sit still',
      'you walked past me', 'you stayed too long',
    ], id, 3);
    expect(g.map((x) => x.label)).not.toContain('you');
    // "you make it" because all three share that much — the longest opening
    // wins, which is the rule; what matters here is that no bare "you" exists.
    expect(g.map((x) => x.label).filter(Boolean).sort()).toEqual(['you are', 'you make it']);
  });

  it('still allows a single word nothing longer is built on', () => {
    // Five, because a single word has to be shared by more before it counts.
    const g = groupByOpening([
      'halloween is coming', 'halloween again already', 'halloween once more',
      'halloween treats now', 'halloween night out',
      'a quiet evening', 'a loud morning',
    ], id, 3);
    expect(g[0].label).toBe('halloween');
  });
});
