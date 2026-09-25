import { describe, it, expect } from 'vitest';
import { directory, everyFilter, everyListed, giftsBehind } from '../data/directory';
import { ENTRIES } from '../data/tags';

// The shelf used to navigate by the names of its own data columns. These are
// the five questions instead — and the point of the test is that renaming the
// navigation did not quietly drop a corner of the library on the way.

describe('the category directory', () => {
  it('strands no gift: every filter is listed, or covered by one that is', () => {
    const listed = everyListed();
    const set = new Set(listed);
    const stranded = everyFilter().filter((f) => {
      if (set.has(f)) return false;
      // Not listed itself — then every gift behind it has to be reachable
      // through something that is. The birthday celebration is like this: its
      // cards all carry the birthday theme, which is the bigger chip.
      const mine = giftsBehind(f);
      return !listed.some((l) => {
        const theirs = new Set(giftsBehind(l));
        return mine.every((e) => theirs.has(e));
      });
    });
    expect(stranded).toEqual([]);
  });

  it('offers nothing that is empty', () => {
    for (const g of directory(ENTRIES)) {
      for (const e of g.entries) expect(e.n, e.label).toBeGreaterThan(0);
    }
  });

  it('drops a whole heading when the layout leaves nothing under it', () => {
    expect(directory([])).toEqual([]);
  });

  it('keeps the holidays in the order of the year, not the alphabet', () => {
    const feiertage = directory(ENTRIES).find((g) => g.title === 'g_cat_holidays')!;
    expect(feiertage.entries.map((e) => e.label)).toEqual([
      'Valentine', 'Womens Day', 'St Patricks', 'Easter', '4th of July',
      'Halloween', 'Thanksgiving', 'Hanukkah', 'Christmas', 'New Year',
    ]);
  });

  it('counts against what is actually on the shelf, not the whole library', () => {
    const half = ENTRIES.filter((e) => e.tags.themes.includes('love'));
    const d = directory(half);
    const love = d.flatMap((g) => g.entries).find((e) => e.id === 'theme:love')!;
    expect(love.n).toBe(half.length);
  });
});
