/**
 * Grouping the shelf by what the sayings actually say.
 *
 * Three hundred one-liners in a row all start to look alike. But they are not
 * unrelated: dozens of them open the same way — "you are the …", "i keep my
 * …", "stay a little …". That opening is the group.
 *
 * The rule is the longest shared BEGINNING, not any shared word. Grouping by
 * any word puts "you are the calm in my chaos" and "take the slow way over
 * here" together under "the", which tells you nothing. The beginning is what
 * you read first and what makes two sayings feel like variations of one.
 */

/** Words that carry no subject on their own, so a group is never named after
 *  one and never ends on one. */
const FILLER = new Set(['the', 'a', 'an', 'and', 'in', 'of', 'to', 'my']);

/** The longest opening a group is named after. Beyond three words the groups
 *  split into pairs and the list is a list again, just with arrows. */
const MAX_WORDS = 3;

export interface Group<T> {
  /** The shared opening, or '' for the leftovers. */
  label: string;
  items: T[];
}

const words = (s: string): string[] => s.toLowerCase().split(/\s+/).filter(Boolean);

/** Drops filler from the end of a candidate: "you are the" names itself "you
 *  are", which is the part that means something. */
const trimFiller = (parts: string[]): string[] => {
  const out = [...parts];
  while (out.length && FILLER.has(out[out.length - 1])) out.pop();
  return out;
};

/**
 * Sorts a list into groups by their shared opening.
 *
 * Longest opening first, so "you are the calm" wins over "you are" where it
 * can — but a group needs at least `min` members, which stops the long ones
 * from shattering the list into pairs. Whatever is left over comes back in a
 * group with an empty label, which the caller shows as "Other" at the bottom.
 */
/** Below this many sayings a list is short enough to read as it is — folding
 *  it away only adds clicks. Measured against the shelf: a vibe with 46 gifts
 *  became seven closed lines, which hid everything and explained nothing. */
export const GROUP_FROM = 60;

export function groupByOpening<T>(items: T[], textOf: (x: T) => string, min = 2): Group<T>[] {
  // Bookkeeping by POSITION, not by the item itself. Two gifts can carry the
  // very same sentence — the library has a few — and keying a map on the value
  // would quietly fold them into one and drop the rest on the floor.
  const parts = items.map((x) => words(textOf(x)));

  const candidates = new Map<string, number[]>();
  parts.forEach((w, i) => {
    // Trimming makes different lengths collapse onto the same name — "you are
    // the" and "you are" both come out as "you are" — so each saying may only
    // be counted once per name, or a group of three reports six.
    const seen = new Set<string>();
    for (let n = Math.min(MAX_WORDS, w.length); n >= 1; n--) {
      const label = trimFiller(w.slice(0, n)).join(' ');
      if (!label || FILLER.has(label) || seen.has(label)) continue;
      seen.add(label);
      const bucket = candidates.get(label);
      if (bucket) bucket.push(i); else candidates.set(label, [i]);
    }
  });

  const order = [...candidates.entries()].sort((a, b) => {
    const wa = a[0].split(' ').length, wb = b[0].split(' ').length;
    return wb - wa || b[1].length - a[1].length || a[0].localeCompare(b[0]);
  });

  const taken = new Set<number>();
  const groups: Group<T>[] = [];
  const firstWords = new Set<string>();
  for (const [label, all] of order) {
    const free = all.filter((i) => !taken.has(i));
    // A one-word opening says much less than a two-word one — "on" or "one" is
    // a coincidence, "you are" is a shape. So a single word has to be shared by
    // noticeably more sayings before it earns a group of its own.
    const needed = label.includes(' ') ? min : Math.max(min, 5);
    if (free.length < needed) continue;
    // A single word that a longer group already starts with is a remainder,
    // not a group: beside "you are" and "you make", a bucket called "you"
    // means "starts with you but is none of the above". Those go to the
    // leftovers, where a remainder belongs.
    if (!label.includes(' ') && firstWords.has(label)) continue;
    firstWords.add(label.split(' ')[0]);
    free.forEach((i) => taken.add(i));
    groups.push({ label, items: free.map((i) => items[i]) });
  }

  // Biggest groups first — the openings that really repeat.
  groups.sort((a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label));

  const rest = items.filter((_, i) => !taken.has(i));
  if (rest.length) groups.push({ label: '', items: rest });
  return groups;
}
