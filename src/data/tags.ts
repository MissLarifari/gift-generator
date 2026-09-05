import { TEMPLATE_CATEGORIES, type TplCategory, type TplItem } from './templates';

// Tags instead of one long list of categories.
//
// The shelf used to show all 33 categories one under the other — "Friends",
// "Friends / Roast", "Funny", "Funny / Chaotic" — which is a database dump, not
// a browser. Two of those are the same subject in different tones, and that is
// exactly the split this file makes:
//
//   THEME — who or what the gift is FOR   (friends, love, partner …)
//   VIBE  — how it SOUNDS                 (roast, sweet, spicy …)
//
// So "Friends / Roast" stops being a category and becomes theme=friends with
// vibe=roast, and "Friends + Sweet" becomes possible without anyone writing a
// "Friends / Sweet" category.
//
// NOTE ON THE NAME: `theme` was already taken — a TplTheme is a card's COLOURS
// and fonts. The subject tag is therefore `themes`, plural, which suits an
// array anyway.
//
// Nothing here rewrites the 607 gifts. The tags hang off the CATEGORY they are
// already in (see CATEGORY_TAGS), so the mapping is one table instead of six
// hundred edits, and a single card can still override it later.

export interface Tag {
  id: string;
  label: string;
  /** The card's accent. Themes and vibes have no colours of their own, and a
   *  grid of identical grey boxes is the thing that made this look technical. */
  tint: string;
  /** Three words on the card, so you can tell what is inside without opening it. */
  blurb: string;
}

/** Who or what a gift is for. */
export const THEMES: Tag[] = [
  { id: 'friends', label: 'Friends', tint: '#9dd6a8', blurb: 'loyal, warm, easy' },
  { id: 'bestfriend', label: 'Best Friend', tint: '#65c7b7', blurb: 'the one who knows' },
  { id: 'love', label: 'Love', tint: '#ff6ba0', blurb: 'romantic, honest, deep' },
  { id: 'crush', label: 'Crush', tint: '#ff9ec7', blurb: 'playful, subtle, teasing' },
  { id: 'partner', label: 'Partner', tint: '#c9a7ff', blurb: 'close, quiet, yours' },
  { id: 'special', label: 'Someone Special', tint: '#ffd84d', blurb: 'small notes, big meaning' },
  { id: 'thinking', label: 'Thinking of You', tint: '#7fd4ff', blurb: 'short, soft, unprompted' },
  { id: 'support', label: 'Support', tint: '#86efac', blurb: 'gentle, steady, there' },
  { id: 'thanks', label: 'Thank You', tint: '#e4c88c', blurb: 'grateful and plain' },
  { id: 'birthday', label: 'Birthday', tint: '#ff71b8', blurb: 'cake, chaos, cheers' },
  { id: 'family', label: 'Family', tint: '#fbbf24', blurb: 'close by blood or choice' },
  { id: 'goodbye', label: 'Goodbye', tint: '#8b919b', blurb: 'soft endings' },
];

/** How a gift sounds. */
export const VIBES: Tag[] = [
  { id: 'sweet', label: 'Sweet', tint: '#ff9ec7', blurb: 'kind and simple' },
  { id: 'cute', label: 'Cute', tint: '#ffc6dd', blurb: 'small and silly' },
  { id: 'wholesome', label: 'Wholesome', tint: '#9dd6a8', blurb: 'warm, no edge' },
  { id: 'soft', label: 'Soft', tint: '#b9e6c2', blurb: 'quiet and gentle' },
  { id: 'romantic', label: 'Romantic', tint: '#ff6ba0', blurb: 'meant sincerely' },
  { id: 'emotional', label: 'Emotional', tint: '#c9a7ff', blurb: 'says the real thing' },
  { id: 'funny', label: 'Funny', tint: '#ffd84d', blurb: 'dry with a punchline' },
  { id: 'sarcastic', label: 'Sarcastic', tint: '#e4c88c', blurb: 'straight face, sharp' },
  { id: 'roast', label: 'Roast', tint: '#ff7a45', blurb: 'rude, affectionately' },
  { id: 'chaotic', label: 'Chaotic', tint: '#ff5a5a', blurb: 'no plan, all in' },
  { id: 'savage', label: 'Savage', tint: '#e879f9', blurb: 'grins while it lands' },
  { id: 'flirty', label: 'Flirty', tint: '#ff4fa3', blurb: 'bold and direct' },
  { id: 'spicy', label: 'Spicy', tint: '#ff9933', blurb: 'hot, never explicit' },
  { id: 'dark', label: 'Dark', tint: '#9b7bd4', blurb: 'moonlit and calm' },
];

export interface Tags {
  themes: string[];
  vibes: string[];
  /** A holiday and a celebration keep a section of their own, as before. */
  holiday?: string;
  celebration?: string;
}

/**
 * The migration table: every existing category, translated into tags. Written
 * out by hand rather than guessed from the label, because "Wicked" is savage
 * and funny and no rule would work that out.
 */
export const CATEGORY_TAGS: Record<string, Tags> = {
  'Little Notes':       { themes: ['special', 'thinking'], vibes: ['sweet', 'soft'] },
  'Cute Notes':         { themes: ['special', 'thinking', 'support'], vibes: ['sweet', 'wholesome'] },
  'Two Parts':          { themes: ['special'], vibes: ['sweet', 'romantic'] },
  'Cute':               { themes: ['special'], vibes: ['cute', 'sweet'] },
  'Romance':            { themes: ['love', 'partner'], vibes: ['romantic', 'emotional'] },
  'Friends':            { themes: ['friends', 'bestfriend'], vibes: ['wholesome', 'sweet'] },
  'Friends / Roast':    { themes: ['friends', 'bestfriend'], vibes: ['roast', 'funny'] },
  'Funny':              { themes: ['friends'], vibes: ['funny', 'sarcastic'] },
  'Funny / Chaotic':    { themes: ['friends'], vibes: ['chaotic', 'funny'] },
  'Flirty bold':        { themes: ['crush'], vibes: ['flirty', 'spicy'] },
  'Wicked':             { themes: ['crush'], vibes: ['savage', 'funny'] },
  'Spicy':              { themes: ['partner', 'crush'], vibes: ['spicy', 'flirty'] },
  'Dominant':           { themes: ['partner'], vibes: ['spicy', 'dark'] },
  'Submissive':         { themes: ['partner'], vibes: ['spicy', 'soft'] },
  'Voyeur':             { themes: ['crush'], vibes: ['spicy', 'dark'] },
  'Aftercare':          { themes: ['partner', 'support'], vibes: ['soft', 'emotional'] },
  'Soft / Cottagecore': { themes: ['special', 'thinking'], vibes: ['soft', 'wholesome'] },
  'Goth / Dark':        { themes: ['special'], vibes: ['dark', 'emotional'] },
  'Drunk vibes':        { themes: ['friends'], vibes: ['chaotic', 'funny'] },
  'Pride':              { themes: ['special', 'support'], vibes: ['emotional', 'wholesome'] },

  'Valentine':    { themes: ['love'], vibes: ['romantic'], holiday: 'Valentine' },
  'Womens Day':   { themes: ['special', 'support'], vibes: ['emotional'], holiday: 'Womens Day' },
  'St Patricks':  { themes: ['friends'], vibes: ['funny'], holiday: 'St Patricks' },
  'Easter':       { themes: ['special'], vibes: ['sweet'], holiday: 'Easter' },
  '4th of July':  { themes: ['friends'], vibes: ['chaotic'], holiday: '4th of July' },
  'Halloween':    { themes: ['friends'], vibes: ['dark', 'funny'], holiday: 'Halloween' },
  'Thanksgiving': { themes: ['special', 'thanks'], vibes: ['emotional', 'wholesome'], holiday: 'Thanksgiving' },
  'Hanukkah':     { themes: ['special'], vibes: ['soft', 'wholesome'], holiday: 'Hanukkah' },
  'Christmas':    { themes: ['special'], vibes: ['wholesome', 'soft'], holiday: 'Christmas' },
  'New Year':     { themes: ['special'], vibes: ['emotional'], holiday: 'New Year' },

  'Birthday':    { themes: ['special', 'birthday'], vibes: ['funny', 'sweet'], celebration: 'Birthday' },
  'Wedding':     { themes: ['love', 'partner'], vibes: ['emotional', 'wholesome'], celebration: 'Wedding' },
  'Anniversary': { themes: ['love', 'partner'], vibes: ['romantic', 'emotional'], celebration: 'Anniversary' },
};

const NONE: Tags = { themes: [], vibes: [] };

/**
 * The tags of one gift. A card may carry its own; otherwise it inherits its
 * category's, which is how six hundred gifts get tagged by one table.
 */
export function tagsOf(cat: TplCategory, item?: TplItem): Tags {
  const base = CATEGORY_TAGS[cat.label] ?? NONE;
  const own = item?.tags;
  if (!own) return base;
  return {
    themes: own.themes ?? base.themes,
    vibes: own.vibes ?? base.vibes,
    holiday: own.holiday ?? base.holiday,
    celebration: own.celebration ?? base.celebration,
  };
}

/** Every gift, flattened, with its tags — the list the shelf filters. */
export interface Entry {
  cat: TplCategory;
  item: TplItem;
  tags: Tags;
  /**
   * What favourites and recents are stored under, so it has to survive a
   * reload AND new cards being inserted anywhere. Hence the words, not an
   * index: a category holds the same label twice — once as a note, once as a
   * two-parter — and only the text tells those two apart. The deco is in there
   * too, because a two-parter carries half its sentence in the deco rows:
   * without it, "i keep my PLACE close to YOU" and "i know my PLACE next to
   * YOU" are the same key.
   */
  key: string;
}

const entryKey = (cat: TplCategory, item: TplItem): string => {
  const d = item.theme?.deco;
  return `${cat.label}::${item.main}|${item.top}|${item.bottom}|${d?.dekoTop ?? ''}|${d?.dekoBottom ?? ''}`;
};

export const ENTRIES: Entry[] = TEMPLATE_CATEGORIES.flatMap((cat) =>
  cat.items.map((item) => ({ cat, item, tags: tagsOf(cat, item), key: entryKey(cat, item) })),
);

/** The tags that actually have gifts, in the order the lists above declare. */
export const usedThemes = (rows: Entry[]): Tag[] =>
  THEMES.filter((t) => rows.some((r) => r.tags.themes.includes(t.id)));

export const usedVibes = (rows: Entry[]): Tag[] =>
  VIBES.filter((v) => rows.some((r) => r.tags.vibes.includes(v.id)));

/** Holidays and celebrations keep their own names, in the order they are given. */
export const usedNamed = (rows: Entry[], field: 'holiday' | 'celebration'): string[] => {
  const seen: string[] = [];
  for (const key of Object.keys(CATEGORY_TAGS)) {
    const name = CATEGORY_TAGS[key][field];
    if (name && !seen.includes(name) && rows.some((r) => r.tags[field] === name)) seen.push(name);
  }
  return seen;
};
