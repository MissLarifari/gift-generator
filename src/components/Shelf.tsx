import { useCallback, useMemo, useRef, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Star, Clock, LayoutGrid, Wand2 } from 'lucide-react';
import { type TplCategory, type TplItem } from '../data/templates';
import { ENTRIES, usedThemes, usedVibes, usedNamed, THEMES, VIBES, type Entry } from '../data/tags';
import { LOOKS, lookIdOf, fitsLook, sayingShapeOf, type Look } from '../data/looks';
import { directory, type DirView } from '../data/directory';
import { categoryIcon } from '../data/categoryIcons';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '../i18n';

/** Below this many gifts a list reads fine as it is; folding it into
 *  categories only adds clicks. */
const GROUP_FROM = 60;

// The shelf: a browser, not a filter list.
//
// It asks one question at a time —
//   layout  →  section (Themes / Vibes / Holidays / …)  →  one of those  →  gifts
// — and only the step you are on is on screen. The way back is a breadcrumb.
//
// Reworked 2026-09-06 for how it reads rather than what it does: the panel has
// a head, every control sits in a named section with one line saying what it is
// for, the layout is one segmented control instead of three loose pills, and
// the sections you pick from are cards with their own colour instead of grey
// rows. The gift cards themselves stay small on purpose — a shelf of six
// hundred wants density.

const FAVS_KEY = 'gifty_favs_v2';
const RECENT_KEY = 'gifty_recent';
const RECENT_MAX = 30;
const USES_KEY = 'gifty_uses';
const LANG_KEY = 'gifty_gift_lang';
const LOOKS_OPEN_KEY = 'gifty_looks_open';
/** How many recents to show as a strip under the categories. */
const STRIP = 8;

/** Which language the gift TEXT is in. Not the interface language — someone
 *  can browse German sayings with an English interface, and does. */
type GiftLang = 'all' | 'en' | 'de';
const readGiftLang = (): GiftLang => {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'en' || v === 'de' || v === 'all') return v;
  } catch { /* private mode */ }
  return 'all';
};

type View =
  | { k: 'home' }
  | { k: 'all' }
  | { k: 'favs' }
  | { k: 'recent' }
  | { k: 'themes' } | { k: 'theme'; id: string }
  | { k: 'vibes' } | { k: 'vibe'; id: string }
  | { k: 'holidays' } | { k: 'holiday'; id: string }
  | { k: 'celebrations' } | { k: 'celebration'; id: string }
  | { k: 'hots' } | { k: 'hot'; id: string };

/** Which section a drilled-in view belongs to — for the breadcrumb. */
const PARENT: Record<string, View['k']> = {
  theme: 'themes', vibe: 'vibes', holiday: 'holidays', celebration: 'celebrations', hot: 'hots',
};

const readCounts = (): Record<string, number> => {
  try {
    const v = JSON.parse(localStorage.getItem(USES_KEY) ?? '{}');
    return v && typeof v === 'object' ? v as Record<string, number> : {};
  } catch { return {}; }
};

/** Same gift every day, a different one tomorrow. No randomness at render. */
const daySeed = (): number => {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

const readList = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch { return []; }
};
const writeList = (key: string, v: string[]) => {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* private mode */ }
};

/** Whether the layout list was left standing open last time. */
const readLooksOpen = (): boolean => {
  try { return localStorage.getItem(LOOKS_OPEN_KEY) === '1'; } catch { return false; }
};
const writeLooksOpen = (v: boolean) => {
  try { localStorage.setItem(LOOKS_OPEN_KEY, v ? '1' : '0'); } catch { /* private mode */ }
};

export default function Shelf({
  onApply,
  onApplyLook,
  activeLook,
  onFold,
}: {
  onApply: (cat: TplCategory, item: TplItem) => void;
  onApplyLook: (look: Look) => void;
  activeLook?: string | null;
  onFold?: () => void;
}) {
  const { t } = useI18n();
  // A collected look is a decorated note and takes the note's sayings; and its
  // category is named in German in the data, so the shelf asks i18n for it.
  const categoryLabel = useCallback((cat: TplCategory) => cat.theme.lookId ? t('look_' + cat.theme.lookId) : cat.label, [t]);
  const [q, setQ] = useState('');
  // Opens on the whole shelf. "Start" was a page you had to leave before you
  // could choose anything, and it is not a category — the gift of the day it
  // held still shows, above the list.
  const [view, setView] = useState<View>({ k: 'all' });
  const [cross, setCross] = useState<string[]>([]);   // vibe filter inside a theme, and back
  const [favs, setFavs] = useState<string[]>(() => readList(FAVS_KEY));
  const [recent, setRecent] = useState<string[]>(() => readList(RECENT_KEY));
  const [uses, setUses] = useState<Record<string, number>>(readCounts);
  const [giftLang, setGiftLang] = useState<GiftLang>(readGiftLang);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggleGroup = (label: string) => setOpen((prev) => {
    const next = new Set(prev);
    if (!next.delete(label)) next.add(label);
    return next;
  });
  const query = q.trim().toLowerCase();

  /* ---------- what the layout allows ---------- */

  // How many there are in each language, so the control can say so before it
  // is pressed — an empty section after a click is the worse way to find out.
  const shelfShape = sayingShapeOf(activeLook);

  const langCounts = useMemo(() => {
    const fits = ENTRIES.filter((e) => fitsLook(lookIdOf({ ...e.cat.theme, ...e.item.theme }), shelfShape));
    return { all: fits.length, en: fits.filter((e) => e.lang === 'en').length, de: fits.filter((e) => e.lang === 'de').length };
  }, [shelfShape]);

  /**
   * A remembered language that has nothing behind it is ignored.
   *
   * Without this the shelf can strand you: pick German, the German cards go
   * away in a later version, and every count reads 0 — while the switch that
   * would undo it is hidden, because it hides itself when there is nothing to
   * sort. An empty shelf and no way back. So the stored choice only counts as
   * long as it holds cards.
   */
  const shownLang: GiftLang = langCounts[giftLang] > 0 ? giftLang : 'all';

  const base = useMemo(
    () => ENTRIES.filter((e) =>
      (shownLang === 'all' || e.lang === shownLang)
      && fitsLook(lookIdOf({ ...e.cat.theme, ...e.item.theme }), shelfShape)),
    [shelfShape, shownLang],
  );

  const pickLang = useCallback((v: GiftLang) => {
    setGiftLang(v);
    try { localStorage.setItem(LANG_KEY, v); } catch { /* private mode */ }
  }, []);

  const everyday = useMemo(() => base.filter((e) => !e.tags.holiday && !e.tags.celebration && !e.tags.hot), [base]);
  const holidays = useMemo(() => base.filter((e) => e.tags.holiday), [base]);
  const parties = useMemo(() => base.filter((e) => e.tags.celebration), [base]);
  const hots = useMemo(() => base.filter((e) => e.tags.hot), [base]);
  const favSet = useMemo(() => new Set(favs), [favs]);
  const byKey = useMemo(() => new Map(base.map((e) => [e.key, e])), [base]);

  /* ---------- favourites and recents ---------- */

  const toggleFav = useCallback((key: string) => {
    setFavs((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [key, ...prev];
      writeList(FAVS_KEY, next);
      return next;
    });
  }, []);

  const use = useCallback((e: Entry) => {
    // Counted, so "most used" is your own history and not a made-up ranking.
    setUses((prev) => {
      const next = { ...prev, [e.key]: (prev[e.key] ?? 0) + 1 };
      try { localStorage.setItem(USES_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
    setRecent((prev) => {
      const next = prev[0] === e.key ? prev : [e.key, ...prev.filter((k) => k !== e.key)].slice(0, RECENT_MAX);
      if (next !== prev) writeList(RECENT_KEY, next);
      return next;
    });
    onApply(e.cat, e.item);
  }, [onApply]);

  /* ---------- the rows on screen ---------- */

  const rows = useMemo((): Entry[] => {
    if (query) {
      return base.filter((e) =>
        `${e.item.l} ${e.item.main} ${e.item.top} ${e.item.bottom} ${e.cat.label} ${categoryLabel(e.cat)}`.toLowerCase().includes(query));
    }
    switch (view.k) {
      case 'all': return base;
      case 'favs': return favs.map((k) => byKey.get(k)).filter((e): e is Entry => !!e);
      case 'recent': return recent.map((k) => byKey.get(k)).filter((e): e is Entry => !!e);
      case 'theme': return everyday.filter((e) => e.tags.themes.includes(view.id))
        .filter((e) => cross.length === 0 || cross.some((v) => e.tags.vibes.includes(v)));
      case 'vibe': return everyday.filter((e) => e.tags.vibes.includes(view.id))
        .filter((e) => cross.length === 0 || cross.some((th) => e.tags.themes.includes(th)));
      case 'holiday': return holidays.filter((e) => e.tags.holiday === view.id);
      case 'celebration': return parties.filter((e) => e.tags.celebration === view.id);
      case 'hot': return hots.filter((e) => e.tags.hot === view.id);
      default: return [];
    }
  }, [query, view, cross, base, everyday, holidays, parties, hots, favs, recent, byKey, categoryLabel]);

  const go = (v: View) => { setView(v); setCross([]); };
  /** Is this directory entry the one being shown? */
  const sameDir = (v: DirView) => view.k === v.k && 'id' in view && view.id === v.id;

  // Which category is showing, and whether the list of them is open.
  //
  // Choosing one folds the list away. With all thirty-seven chips standing
  // open the sayings sit below them, off the bottom of the panel — you click
  // a category, the chip lights up, and nothing you can see happens.
  // Closed on arrival, so the shelf opens on gifts rather than on a wall of
  // category names with the list pushed off the bottom.
  const [catsOpen, setCatsOpen] = useState(false);
  // The layout list is the one fold that stays exactly as you left it.
  //
  // Picking a category rewrites the list directly below it, so folding it away
  // puts the answer where the chips were. Picking a LAYOUT changes the preview
  // on the far side of the screen, and folding the list takes away the very
  // thing being compared with nothing in its place — trying five layouts in a
  // row meant opening the list five times over. So a pick leaves it alone, the
  // fold is only ever the head button, and that choice outlives the visit.
  const [looksOpen, setLooksOpen] = useState(readLooksOpen);
  const foldLooks = (v: boolean) => { setLooksOpen(v); writeLooksOpen(v); };
  const chosen = directory(base).flatMap((g) => g.entries).find((e) => sameDir(e.view));
  const results = useRef<HTMLDivElement>(null);
  const pickCat = (v: DirView) => {
    go(v as View);
    setCatsOpen(false);
    // The panel itself does not scroll — it hides its overflow and the list
    // inside it does the scrolling. So put that list back at its top; a
    // scrollIntoView here would move the page instead and fix nothing.
    requestAnimationFrame(() => { if (results.current) results.current.scrollTop = 0; });
  };

  /* ---------- pieces ---------- */

  const nav = (k: View['k'], icon: React.ReactNode, label: string, n?: number) => (
    <button key={k} className="nav" data-on={view.k === k || PARENT[view.k] === k} onClick={() => go({ k } as View)}>
      {icon} {label}
      {n !== undefined && <span className="n">{n}</span>}
    </button>
  );

  /** What you pick from before any gift is shown. */
  const cards = (items: { id: string; label: string; n: number; tint: string; blurb?: string }[], to: (id: string) => View) => (
    <div className="catgrid">
      {items.map((x) => (
        <button key={x.id} className="catcard" style={{ ['--tint' as string]: x.tint }} onClick={() => go(to(x.id))}>
          <span className="catcard-dot" />
          <span className="catcard-body">
            <span className="catcard-t">{x.label}</span>
            <span className="catcard-n">{x.blurb ? x.blurb : `${x.n} ${t('g_gifts')}`}</span>
          </span>
          <span className="catcard-n" style={{ marginTop: 0, flex: '0 0 auto' }}>{x.n}</span>
          <ChevronRight size={14} className="catcard-go" />
        </button>
      ))}
    </div>
  );

  /** Vibes are many and short, so they get a denser grid of their own. */
  const vibeCards = (rowsIn: Entry[]) => (
    <div className="vibegrid">
      {usedVibes(rowsIn).map((v) => (
        <button key={v.id} className="vibecard" style={{ ['--tint' as string]: v.tint }}
          onClick={() => go({ k: 'vibe', id: v.id })} title={v.blurb}>
          <span className="vibecard-dot" />
          <span className="vibecard-t">{v.label}</span>
          <span className="vibecard-n">{rowsIn.filter((e) => e.tags.vibes.includes(v.id)).length}</span>
        </button>
      ))}
    </div>
  );

  const head = (title: string, sub: string, n?: number, cls = '') => (
    <div className={'sechead ' + cls}>
      <span className="sechead-t">{title}</span>
      <span className="sechead-s">{sub}</span>
      {n !== undefined && <span className="sechead-n">{n}</span>}
    </div>
  );

  /** A strip of gifts under a heading — only drawn when it has something. */
  const strip = (title: string, sub: string, list: Entry[]) => {
    if (list.length === 0) return null;
    return (
      <>
        {head(title, sub, list.length, 'gap-t')}
        <div className="cardgrid">{list.slice(0, STRIP).map(card)}</div>
      </>
    );
  };

  const card = (e: Entry, i: number) => {
    const on = favSet.has(e.key);
    return (
      <div key={e.key + '#' + i} className="spark-wrap">
        <button className="spark" onClick={() => use(e)} title={categoryLabel(e.cat)}>
          <div className="spark-t">
            {e.lang === 'de' && <span className="spark-lang">DE</span>}
            {e.item.main || e.item.l}
          </div>
          {(e.item.top || e.item.bottom) && (
            <div className="spark-s">{[e.item.top, e.item.bottom].filter(Boolean).join(' · ')}</div>
          )}
        </button>
        <button className="fav" data-on={on} onClick={() => toggleFav(e.key)}
          title={t('g_favorites')} aria-label={t('g_favorites')} aria-pressed={on}>
          <Star size={12} fill={on ? 'currentColor' : 'none'} />
        </button>
      </div>
    );
  };

  const crumb = (parent: View['k'], parentLabel: string, here: string, n: number, filter?: React.ReactNode) => (
    <>
      <button className="crumb" onClick={() => go({ k: parent } as View)}>
        <ChevronLeft size={13} /> {parentLabel}
      </button>
      <div className="flex items-baseline" style={{ gap: 8, margin: '9px 0 11px' }}>
        <span className="crumb-h">{here}</span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{n} {t('g_gifts')}</span>
      </div>
      {filter}
    </>
  );

  /** The cross filter inside a drilled-in view: vibes in a theme, themes in a vibe. */
  const crossRow = (label: string, all: { id: string; label: string }[]) => (
    <div style={{ marginBottom: 13 }}>
      <div className="navlab">{label}</div>
      <div className="navrow">
        <button className="nav" data-on={cross.length === 0} onClick={() => setCross([])}>{t('g_all')}</button>
        {all.map((x) => (
          <button key={x.id} className="nav" data-on={cross.includes(x.id)}
            onClick={() => setCross((c) => (c.includes(x.id) ? c.filter((v) => v !== x.id) : [...c, x.id]))}>
            {x.label}
          </button>
        ))}
      </div>
    </div>
  );

  /**
   * The whole saying, read out. A two-part gift carries half its sentence in
   * the deco rows, so "tiny" alone is not the gift — "you are my tiny bit of
   * happy" is. The frame characters are stripped, the words are kept.
   */
  const readable = (e: Entry): string => {
    const words = (x?: string | null) => (x ?? '').replace(/[^a-z ]/gi, ' ').replace(/\s+/g, ' ').trim();
    const d = e.item.theme?.deco;
    const parts = d?.dekoBottom
      ? [words(d.dekoTop), e.item.top, e.item.main, words(d.dekoBottom), e.item.bottom]
      : [e.item.top, e.item.main, e.item.bottom];
    return parts.map((x) => (x ?? '').replace(/^\.\. ?|\.\.$/g, '').trim()).filter(Boolean).join(' ');
  };

  /** The gift held up on the landing view. Same one all day. */
  const spotlight = () => {
    if (base.length === 0) return null;
    const e = base[daySeed() % base.length];
    return (
      <button className="spotlight" onClick={() => use(e)}>
        <span className="spot-eyebrow"><Wand2 size={11} /> {t('g_spotlight')}</span>
        <span className="spot-main">{readable(e) || e.item.main || e.item.l}</span>
        <span className="spot-sub">{categoryLabel(e.cat)}</span>
        <span className="spot-foot">
          {e.tags.vibes.slice(0, 3).map((v) => (
            <span key={v} className="spot-tag">{VIBES.find((x) => x.id === v)?.label ?? v}</span>
          ))}
        </span>
      </button>
    );
  };

  const pick = (keys: string[]) => keys.map((k) => byKey.get(k)).filter((e): e is Entry => !!e);

  /** Your own most-used, by count — not an invented ranking. */
  const popular = () => pick(Object.entries(uses).sort((a, b) => b[1] - a[1]).map(([k]) => k)).slice(0, STRIP);

  /** The last card of every category is the one most recently written into it. */
  const newest = useMemo(() => {
    const seen = new Map<string, Entry>();
    for (const e of base) seen.set(e.cat.label, e);
    return [...seen.values()].reverse().slice(0, STRIP);
  }, [base]);

  /**
   * A section that is empty only because of the build, and the way out of it.
   *
   * Gifts are shaped: a note-shaped saying does not exist under the two-part
   * build, so a section holding 38 cards in one build holds none in another.
   * Clicking it showed a heading and nothing underneath, which reads as
   * broken — the same trap the language switch above already guards against,
   * and the reason that guard was written.
   */
  const notNamed = (e: Entry) => !e.tags.holiday && !e.tags.celebration && !e.tags.hot;

  const emptyHint = (pred: (e: Entry) => boolean) => {
    const elsewhere = LOOKS.find((lk) => sayingShapeOf(lk.id) !== shelfShape
      && ENTRIES.some((e) => pred(e)
        && (shownLang === 'all' || e.lang === shownLang)
        && fitsLook(lookIdOf({ ...e.cat.theme, ...e.item.theme }), sayingShapeOf(lk.id))));
    return (
      <div style={{ padding: '13px 2px 2px' }}>
        <p className="hint" style={{ margin: '0 0 11px' }}>{elsewhere ? t('g_none_look') : t('g_none_here')}</p>
        {elsewhere && (
          <button className="allcard" onClick={() => onApplyLook(elsewhere)}>
            <Wand2 size={15} style={{ color: 'var(--muted)', flex: '0 0 auto' }} />
            <span className="allcard-t">{t('g_to_look').replace('%s', t('look_' + elsewhere.id))}
              <span className="allcard-s">{t('g_to_look_sub')}</span></span>
            <ChevronRight size={14} style={{ color: 'var(--dim)', flex: '0 0 auto' }} />
          </button>
        )}
      </div>
    );
  };

  /* ---------- the body ---------- */

  const body = () => {
    if (query) return grid(rows);
    const themeCards = () => cards(
      usedThemes(everyday).map((x) => ({ ...x, n: everyday.filter((e) => e.tags.themes.includes(x.id)).length })),
      (id) => ({ k: 'theme', id }));

    const allCard = () => (
      <button className="allcard gap-t" onClick={() => go({ k: 'all' })}>
        <LayoutGrid size={15} style={{ color: 'var(--muted)', flex: '0 0 auto' }} />
        <span className="allcard-t">{t('g_all_gifts')}<span className="allcard-s">{t('g_all_gifts_sub')}</span></span>
        <span className="sechead-n">{base.length}</span>
        <ChevronRight size={14} style={{ color: 'var(--dim)', flex: '0 0 auto' }} />
      </button>
    );

    switch (view.k) {
      case 'home':
        return <>
          {spotlight()}
          {head(t('g_by_theme'), t('g_pick_cat'), usedThemes(everyday).length, 'gap-t')}
          {themeCards()}
          {head(t('g_by_vibe'), t('grp_Vibes'), usedVibes(everyday).length, 'gap-t')}
          {vibeCards(everyday)}
          {allCard()}
          {strip(t('g_popular'), t('g_library'), popular())}
          {strip(t('g_recent'), t('g_library'), pick(recent))}
          {strip(t('g_favorites'), t('g_library'), pick(favs))}
          {strip(t('g_new'), t('g_templates'), newest)}
        </>;
      case 'themes':
        return <>
          {head(t('grp_Themen'), t('g_pick_cat'), usedThemes(everyday).length)}
          {usedThemes(everyday).length ? themeCards() : emptyHint(notNamed)}
          {strip(t('g_recent'), t('g_library'), pick(recent))}
        </>;
      case 'vibes':
        return <>
          {head(t('grp_Vibes'), t('g_by_vibe'), usedVibes(everyday).length)}
          {usedVibes(everyday).length ? vibeCards(everyday) : emptyHint(notNamed)}
          {strip(t('g_popular'), t('g_library'), popular())}
        </>;
      case 'holidays': {
        const names = usedNamed(holidays, 'holiday');
        return <>
          {head(t('grp_Holidays'), t('g_pick_cat'), names.length)}
          {names.length ? cards(names.map((h) => ({
            id: h, label: h, tint: holidays.find((e) => e.tags.holiday === h)?.cat.theme.mainColor ?? 'var(--accent)',
            n: holidays.filter((e) => e.tags.holiday === h).length,
          })), (id) => ({ k: 'holiday', id })) : emptyHint((e) => !!e.tags.holiday)}
          {strip(t('g_recent'), t('g_library'), pick(recent))}
        </>;
      }
      case 'celebrations': {
        const names = usedNamed(parties, 'celebration');
        return <>
          {head(t('grp_Celebrations'), t('g_pick_cat'), names.length)}
          {names.length ? cards(names.map((h) => ({
            id: h, label: h, tint: parties.find((e) => e.tags.celebration === h)?.cat.theme.mainColor ?? 'var(--accent)',
            n: parties.filter((e) => e.tags.celebration === h).length,
          })), (id) => ({ k: 'celebration', id })) : emptyHint((e) => !!e.tags.celebration)}
          {strip(t('g_recent'), t('g_library'), pick(recent))}
        </>;
      }
      case 'hots': {
        const names = usedNamed(hots, 'hot');
        return <>
          {head(t('grp_Hot'), t('g_pick_cat'), names.length)}
          {names.length ? cards(names.map((h) => ({
            id: h, label: h, tint: hots.find((e) => e.tags.hot === h)?.cat.theme.mainColor ?? 'var(--accent)',
            n: hots.filter((e) => e.tags.hot === h).length,
          })), (id) => ({ k: 'hot', id })) : emptyHint((e) => !!e.tags.hot)}
          {strip(t('g_recent'), t('g_library'), pick(recent))}
        </>;
      }
      case 'theme': {
        const label = THEMES.find((x) => x.id === view.id)?.label ?? view.id;
        const inTheme = everyday.filter((e) => e.tags.themes.includes(view.id));
        return <>{crumb('themes', t('grp_Themen'), label, rows.length, crossRow(t('g_vibe'), usedVibes(inTheme)))}{grid(rows)}</>;
      }
      case 'vibe': {
        const label = VIBES.find((x) => x.id === view.id)?.label ?? view.id;
        const inVibe = everyday.filter((e) => e.tags.vibes.includes(view.id));
        return <>{crumb('vibes', t('grp_Vibes'), label, rows.length, crossRow(t('g_theme'), usedThemes(inVibe)))}{grid(rows)}</>;
      }
      case 'holiday':
        return <>{crumb('holidays', t('grp_Holidays'), view.id, rows.length)}{grid(rows)}</>;
      case 'celebration':
        return <>{crumb('celebrations', t('grp_Celebrations'), view.id, rows.length)}{grid(rows)}</>;
      case 'hot':
        return <>{crumb('hots', t('grp_Hot'), view.id, rows.length)}{grid(rows)}</>;
      case 'favs':
        return rows.length ? grid(rows) : <p className="hint" style={{ padding: '22px 4px' }}>{t('g_no_favs')}</p>;
      case 'recent':
        return rows.length ? grid(rows) : <p className="hint" style={{ padding: '22px 4px' }}>{t('g_no_recent')}</p>;
      default:
        return grid(rows);
    }
  };

  function grid(list: Entry[]) {
    if (list.length === 0) return <p className="hint" style={{ padding: '22px 4px' }}>{t('g_no_fit')}</p>;
    // A short list reads fine as it is; folding it away only adds clicks. And
    // a search is already a filter — hiding its hits again would be hiding the
    // answer. Both stay flat.
    if (query || list.length < GROUP_FROM) return <div className="cardgrid">{list.map(card)}</div>;

    // Folded by the category each gift comes from.
    //
    // This used to fold by the words the sayings share, which produced honest
    // but useless headings — "at 5", "i want 5", "du bist mein 9". A heading
    // has to be a category, and every gift already belongs to exactly one.
    // The icon wears the category's own colour — the one its loud line is
    // printed in. Nothing to invent and nothing to keep in step: a category
    // that changes its pink changes its icon with it.
    const byCat = new Map<string, { items: Entry[]; icon: LucideIcon; tint: string }>();
    for (const e of list) {
      const label = categoryLabel(e.cat);
      const bucket = byCat.get(label);
      if (bucket) bucket.items.push(e);
      else byCat.set(label, {
        items: [e],
        icon: categoryIcon(e.cat.label, e.cat.theme.lookId),
        tint: e.cat.theme.mainColor,
      });
    }
    const groups = [...byCat.entries()]
      .map(([label, g]) => ({ label, ...g }))
      .sort((a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label));
    if (groups.length < 2) return <div className="cardgrid">{list.map(card)}</div>;

    return (
      <div className="cardgrid">
        {groups.map((g) => {
          const label = g.label || t('g_other');
          const shown = open.has(label);
          const Icon = g.icon;
          return (
            <div key={label} className="giftgroup">
              <button className="group-head" aria-expanded={shown} onClick={() => toggleGroup(label)}>
                <ChevronRight size={13} className="group-arrow" data-open={shown} />
                <Icon size={13} className="group-icon" style={{ color: g.tint }} aria-hidden="true" />
                <span className="group-name">{label}</span>
                <span className="group-n">{g.items.length}</span>
              </button>
              {shown && <div className="group-items">{g.items.map(card)}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    // selection-column is what the workspace grid and the mobile tabs address
    // this panel by; without it the shelf stays on screen under "Bearbeiten".
    <section className="selection-column slab flex flex-col" aria-label={t('g_select')} style={{ minHeight: 0 }}>
      {/* No inline overflow here: it beat the stylesheet, and the stylesheet is
          what decides that this column scrolls as one. */}
      {/* 1 — whose panel this is */}
      <div className="panel-head flex items-start justify-between" style={{ gap: 10 }}>
        <div>
          <div className="panel-title">{t('g_templates')}</div>
          <div className="panel-sub">{t('g_panel_sub')}</div>
        </div>
        {onFold && (
          <button className="icon-btn" onClick={onFold} title={t('g_fold')} aria-label={t('g_fold')} style={{ width: 26, height: 26, flex: '0 0 auto' }}>
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* 2 — the layout decides which gifts exist at all.
          Seventeen names laid out at once came to 301px of a 866px panel and
          left the sayings 186. So the section shows the one that is chosen and
          opens the rest on a click. Unlike the categories it then stays
          open, because choosing a layout is something you do several times
          over before one of them is the right one. */}
      <div className="sec">
        <button className="cats-head" aria-expanded={looksOpen} aria-controls="shelf-looks"
          onClick={() => foldLooks(!looksOpen)}>
          <span>
            <span className="sec-t">{t('layout')}</span>
            <span className="sec-s" style={{ marginBottom: 0 }}>{t('g_layout_sub')}</span>
          </span>
          {!looksOpen && <span className="cats-now">{activeLook ? t('look_' + activeLook) : t('g_choose_layout')}</span>}
          <ChevronRight size={13} className="cats-arrow" data-open={looksOpen} />
        </button>
        <div id="shelf-looks" hidden={!looksOpen}>
          <div className="seg layout-picker" role="group" aria-label={t('layout')} style={{ marginTop: 8 }}>
            {LOOKS.map((l) => (
              <button key={l.id} data-on={activeLook === l.id}
                onClick={() => onApplyLook(l)} title={t('look_' + l.id + '_h')}>
                {t('look_' + l.id)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2b — and which language the sayings are written in. Hidden while the
          library is English only: a switch with nothing behind it is a promise
          the shelf cannot keep. */}
      {langCounts.de > 0 && langCounts.en > 0 && <div className="sec sec-lang">
        <div className="sec-t">{t('g_lang_title')}</div>
        <div className="sec-s">{t('g_lang_sub')}</div>
        <div className="seg" role="group" aria-label={t('g_lang_title')}>
          {(['all', 'en', 'de'] as GiftLang[]).map((v) => (
            <button key={v} data-on={shownLang === v} onClick={() => pickLang(v)} disabled={langCounts[v] === 0}>
              {t('g_lang_' + v)} <span className="seg-n">{langCounts[v]}</span>
            </button>
          ))}
        </div>
      </div>}

      {/* 3 — the sayings: where you look for one, and the three shelves that
          are not a category — everything, your own, and where you just were. */}
      <div className="sec sec-sayings">
        <div className="sec-t">{t('g_sayings_title')}</div>
        <div className="sec-s">{t('g_sayings_sub')}</div>
        <div className="searchbox">
          <Search size={14} style={{ color: 'var(--dim)', flex: '0 0 auto' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('g_search_gifts')} aria-label={t('g_search_gifts')} />
          {q && <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={() => setQ('')} aria-label={t('cancel')}><X size={13} /></button>}
        </div>
        <div className="navrow" style={{ marginTop: 10 }}>
          {nav('all', <LayoutGrid size={11} />, t('g_all'), base.length)}
          {nav('favs', <Star size={11} />, t('g_favorites'), favs.length || undefined)}
          {nav('recent', <Clock size={11} />, t('g_recent'), recent.length || undefined)}
        </div>
      </div>

      {/* 4 — the categories, and they are categories of SAYINGS. Five
          headings that say what you are choosing, instead of the four names
          the tag table happens to use for its own columns. */}
      <div className="sec sec-cats">
        <button className="cats-head" aria-expanded={catsOpen} aria-controls="shelf-cats"
          onClick={() => setCatsOpen((v) => !v)}>
          <span className="sec-t">{t('g_categories')}</span>
          {chosen && !catsOpen && <span className="cats-now">{chosen.label} <span className="n">{chosen.n}</span></span>}
          <ChevronRight size={13} className="cats-arrow" data-open={catsOpen} />
        </button>
        <div id="shelf-cats" hidden={!catsOpen}>
          {directory(base).map((g) => (
            <div className="catgroup" key={g.title}>
              <div className="catgroup-t">{t(g.title)}</div>
              <div className="navrow">
                {g.entries.map((e) => (
                  <button key={e.id} className="nav" data-on={sameDir(e.view)} onClick={() => pickCat(e.view)}>
                    {e.label} <span className="n">{e.n}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 — what you came for */}
      <div ref={results} className="scroll-y" style={{ flex: 1, minHeight: 0, padding: '14px 15px 18px' }}>
        {/* Where you are and what is switched on, in one line. */}
        <div className="status">
          <span>{t('layout')}: <b>{activeLook ? t('look_' + activeLook) : '—'}</b></span>
          <span className="dot" />
          <span><b>{base.length}</b> {t('g_gifts')}</span>
          {favs.length > 0 && <><span className="dot" /><span><b>{favs.length}</b> {t('g_favorites')}</span></>}
        </div>

        {query && (
          <div className="flex items-baseline" style={{ gap: 8, marginBottom: 11 }}>
            <span className="crumb-h">{q.trim()}</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{rows.length} {t('g_hits')}</span>
          </div>
        )}
        {body()}
      </div>
    </section>
  );
}
