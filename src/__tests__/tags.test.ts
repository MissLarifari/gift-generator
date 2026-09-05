import { describe, it, expect } from 'vitest';
import { TEMPLATE_CATEGORIES } from '../data/templates';
import { CATEGORY_TAGS, THEMES, VIBES, ENTRIES, tagsOf, usedThemes, usedVibes, usedNamed } from '../data/tags';

// The tag table replaces 33 flat categories with two questions: who is it for,
// and how does it sound. If a category slips out of the table its gifts vanish
// from every theme and vibe while still counting in "All" — silent, so tested.

describe('the migration table', () => {
  it('covers every category', () => {
    const missing = TEMPLATE_CATEGORIES.map((c) => c.label).filter((l) => !(l in CATEGORY_TAGS));
    expect(missing).toEqual([]);
  });

  it('names no category that does not exist', () => {
    const labels = new Set(TEMPLATE_CATEGORIES.map((c) => c.label));
    expect(Object.keys(CATEGORY_TAGS).filter((l) => !labels.has(l))).toEqual([]);
  });

  it('uses only declared themes and vibes', () => {
    const th = new Set(THEMES.map((t) => t.id));
    const vi = new Set(VIBES.map((v) => v.id));
    for (const [label, tags] of Object.entries(CATEGORY_TAGS)) {
      expect(tags.themes.filter((t) => !th.has(t)), label).toEqual([]);
      expect(tags.vibes.filter((v) => !vi.has(v)), label).toEqual([]);
    }
  });

  it('gives every gift at least one theme and one vibe', () => {
    const bare = ENTRIES.filter((e) => e.tags.themes.length === 0 || e.tags.vibes.length === 0);
    expect(bare.map((e) => e.cat.label)).toEqual([]);
  });

  it('every gift has a key of its own', () => {
    expect(new Set(ENTRIES.map((e) => e.key)).size).toBe(ENTRIES.length);
  });
});

describe('what the split buys', () => {
  const cat = (l: string) => TEMPLATE_CATEGORIES.find((c) => c.label === l)!;

  it('Friends / Roast is friends told as a roast, not a category', () => {
    const t = tagsOf(cat('Friends / Roast'));
    expect(t.themes).toContain('friends');
    expect(t.vibes).toContain('roast');
  });

  it('so Friends + Sweet and Friends + Roast both exist without a category for either', () => {
    const friends = ENTRIES.filter((e) => e.tags.themes.includes('friends'));
    expect(friends.filter((e) => e.tags.vibes.includes('roast')).length).toBeGreaterThan(0);
    expect(friends.filter((e) => e.tags.vibes.includes('sweet')).length).toBeGreaterThan(0);
  });

  it('a card may carry its own tags over its category', () => {
    const c = cat('Friends');
    expect(tagsOf(c, { ...c.items[0], tags: { vibes: ['dark'] } }).vibes).toEqual(['dark']);
    expect(tagsOf(c, { ...c.items[0], tags: { vibes: ['dark'] } }).themes).toContain('friends');
  });
});

describe('only what is filled shows up', () => {
  it('hides themes and vibes nothing is tagged with', () => {
    expect(usedThemes([]).length).toBe(0);
    expect(usedVibes([]).length).toBe(0);
  });

  it('lists the holidays and celebrations that exist', () => {
    expect(usedNamed(ENTRIES, 'holiday')).toContain('Christmas');
    expect(usedNamed(ENTRIES, 'celebration')).toEqual(['Birthday', 'Wedding', 'Anniversary']);
  });
});

describe('every tag carries its own look', () => {
  it('each theme and vibe has a colour and a blurb', () => {
    for (const t of [...THEMES, ...VIBES]) {
      expect(t.tint, t.id).toMatch(/^#[0-9a-f]{6}$/i);
      expect(t.blurb.length, t.id).toBeGreaterThan(3);
    }
  });

  it('no two themes share a colour', () => {
    expect(new Set(THEMES.map((t) => t.tint)).size).toBe(THEMES.length);
  });

  it('the shelf now opens on more than a handful of themes', () => {
    expect(usedThemes(ENTRIES).length).toBeGreaterThanOrEqual(9);
  });
});
