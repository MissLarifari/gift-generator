import { THEMES, VIBES, ENTRIES, usedNamed, type Entry } from './tags';

/**
 * The categories, said in words instead of in tag-table terms.
 *
 * The shelf used to navigate by the shape of its own data — "Themen",
 * "Stimmungen", "Feiertage", "Anlässe" — which are the names of four columns,
 * not four questions anyone asks. This is the same data under headings that
 * say what you are choosing: who it is for, how it should sound, what the
 * occasion is, which holiday, and the grown-up shelf.
 *
 * Nothing here is invented. Every entry points at a filter that already
 * exists, and one with no gifts behind it never reaches the screen — see
 * `directory()`, which counts against whatever the layout and language allow.
 */

export type DirView =
  | { k: 'theme'; id: string }
  | { k: 'vibe'; id: string }
  | { k: 'holiday'; id: string }
  | { k: 'celebration'; id: string }
  | { k: 'hot'; id: string };

export interface DirEntry { id: string; label: string; view: DirView; n: number }
/** `title` is an i18n key; the entries carry their labels ready to show. */
export interface DirGroup { title: string; entries: DirEntry[] }

const theme = (id: string): Omit<DirEntry, 'n'> =>
  ({ id: 'theme:' + id, label: THEMES.find((t) => t.id === id)?.label ?? id, view: { k: 'theme', id } });
const vibe = (id: string): Omit<DirEntry, 'n'> =>
  ({ id: 'vibe:' + id, label: VIBES.find((v) => v.id === id)?.label ?? id, view: { k: 'vibe', id } });
const named = (k: 'holiday' | 'celebration' | 'hot', id: string): Omit<DirEntry, 'n'> =>
  ({ id: k + ':' + id, label: id, view: { k, id } as DirView });

/**
 * The five headings, and what goes under each.
 *
 * Order inside a group is by hand, not by size: the ones people reach for
 * first come first. Holidays run through the year, as they do everywhere else
 * in this project.
 */
const PLAN: { title: string; of: Omit<DirEntry, 'n'>[] }[] = [
  { title: 'g_cat_who', of: [
    theme('friends'), theme('bestfriend'), theme('love'), theme('crush'),
    theme('partner'), theme('special'), theme('thinking'),
  ] },
  { title: 'g_cat_mood', of: [
    vibe('sweet'), vibe('funny'), vibe('romantic'), vibe('flirty'), theme('support'),
    vibe('savage'), vibe('chaotic'), vibe('cute'), vibe('soft'), vibe('emotional'),
    vibe('wholesome'), vibe('sarcastic'), vibe('roast'), vibe('dark'),
  ] },
  { title: 'g_cat_occasion', of: [
    // The birthday THEME, not the birthday celebration: the celebration's
    // cards carry the theme too, so the theme is the larger of the two and
    // listing both put "Birthday" on screen twice with different counts.
    theme('birthday'), theme('thanks'),
    named('celebration', 'Anniversary'), named('celebration', 'Wedding'),
  ] },
  { title: 'g_cat_holidays', of: [
    named('holiday', 'Valentine'), named('holiday', 'Womens Day'), named('holiday', 'St Patricks'),
    named('holiday', 'Easter'), named('holiday', '4th of July'), named('holiday', 'Halloween'),
    named('holiday', 'Thanksgiving'), named('holiday', 'Hanukkah'), named('holiday', 'Christmas'),
    named('holiday', 'New Year'),
  ] },
  { title: 'g_cat_spicy', of: [
    vibe('spicy'), named('hot', 'Tease'), named('hot', 'Horny'),
    named('hot', 'That Was Insane'), named('hot', 'Still Thinking'),
  ] },
];

const countIn = (rows: Entry[], v: DirView): number => rows.filter((e) =>
  v.k === 'theme' ? e.tags.themes.includes(v.id)
    : v.k === 'vibe' ? e.tags.vibes.includes(v.id)
      : e.tags[v.k] === v.id).length;

/**
 * The directory as the shelf should draw it right now: counted against the
 * gifts the chosen layout and language leave, and with the empty ones gone.
 * A category with nothing behind it is a promise the shelf cannot keep.
 */
export function directory(rows: Entry[]): DirGroup[] {
  return PLAN
    .map((g) => ({
      title: g.title,
      entries: g.of.map((e) => ({ ...e, n: countIn(rows, e.view) })).filter((e) => e.n > 0),
    }))
    .filter((g) => g.entries.length > 0);
}

/** Every filter the tag table knows, so none can be orphaned unnoticed. */
export const everyFilter = (): string[] => [
  ...THEMES.filter((t) => countIn(ENTRIES, { k: 'theme', id: t.id }) > 0).map((t) => 'theme:' + t.id),
  ...VIBES.filter((v) => countIn(ENTRIES, { k: 'vibe', id: v.id }) > 0).map((v) => 'vibe:' + v.id),
  ...usedNamed(ENTRIES, 'holiday').map((h) => 'holiday:' + h),
  ...usedNamed(ENTRIES, 'celebration').map((c) => 'celebration:' + c),
  ...usedNamed(ENTRIES, 'hot').map((h) => 'hot:' + h),
];

export const everyListed = (): string[] => PLAN.flatMap((g) => g.of.map((e) => e.id));

/** The gifts behind one filter id, for checking that nothing is stranded. */
export function giftsBehind(id: string, rows: Entry[] = ENTRIES): Entry[] {
  const [k, rest] = [id.slice(0, id.indexOf(':')), id.slice(id.indexOf(':') + 1)];
  return rows.filter((e) =>
    k === 'theme' ? e.tags.themes.includes(rest)
      : k === 'vibe' ? e.tags.vibes.includes(rest)
        : e.tags[k as 'holiday' | 'celebration' | 'hot'] === rest);
}
