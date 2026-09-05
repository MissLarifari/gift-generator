import { useCallback, useMemo, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Star, Clock, Tag as TagIcon, Sparkles, CalendarDays, PartyPopper, LayoutGrid, Home, Wand2 } from 'lucide-react';
import { type TplCategory, type TplItem } from '../data/templates';
import { ENTRIES, usedThemes, usedVibes, usedNamed, THEMES, VIBES, type Entry } from '../data/tags';
import { LOOKS, lookIdOf, fitsLook, type Look } from '../data/looks';
import { useI18n } from '../i18n';

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
/** How many recents to show as a strip under the categories. */
const STRIP = 8;

type View =
  | { k: 'home' }
  | { k: 'all' }
  | { k: 'favs' }
  | { k: 'recent' }
  | { k: 'themes' } | { k: 'theme'; id: string }
  | { k: 'vibes' } | { k: 'vibe'; id: string }
  | { k: 'holidays' } | { k: 'holiday'; id: string }
  | { k: 'celebrations' } | { k: 'celebration'; id: string };

/** Which section a drilled-in view belongs to — for the breadcrumb. */
const PARENT: Record<string, View['k']> = {
  theme: 'themes', vibe: 'vibes', holiday: 'holidays', celebration: 'celebrations',
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
  const [q, setQ] = useState('');
  const [view, setView] = useState<View>({ k: 'home' });
  const [cross, setCross] = useState<string[]>([]);   // vibe filter inside a theme, and back
  const [favs, setFavs] = useState<string[]>(() => readList(FAVS_KEY));
  const [recent, setRecent] = useState<string[]>(() => readList(RECENT_KEY));
  const [uses, setUses] = useState<Record<string, number>>(readCounts);
  const query = q.trim().toLowerCase();

  /* ---------- what the layout allows ---------- */

  const base = useMemo(
    () => ENTRIES.filter((e) => fitsLook(lookIdOf({ ...e.cat.theme, ...e.item.theme }), activeLook)),
    [activeLook],
  );

  const everyday = useMemo(() => base.filter((e) => !e.tags.holiday && !e.tags.celebration), [base]);
  const holidays = useMemo(() => base.filter((e) => e.tags.holiday), [base]);
  const parties = useMemo(() => base.filter((e) => e.tags.celebration), [base]);
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
        `${e.item.l} ${e.item.main} ${e.item.top} ${e.item.bottom} ${e.cat.label}`.toLowerCase().includes(query));
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
      default: return [];
    }
  }, [query, view, cross, base, everyday, holidays, parties, favs, recent, byKey]);

  const go = (v: View) => { setView(v); setCross([]); };

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
        <button className="spark" onClick={() => use(e)} title={e.cat.label}>
          <div className="spark-t">{e.item.main || e.item.l}</div>
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
        <span className="spot-sub">{e.cat.label}</span>
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
          {themeCards()}
          {strip(t('g_recent'), t('g_library'), pick(recent))}
        </>;
      case 'vibes':
        return <>
          {head(t('grp_Vibes'), t('g_by_vibe'), usedVibes(everyday).length)}
          {vibeCards(everyday)}
          {strip(t('g_popular'), t('g_library'), popular())}
        </>;
      case 'holidays':
        return <>
          {head(t('grp_Holidays'), t('g_pick_cat'), usedNamed(holidays, 'holiday').length)}
          {cards(usedNamed(holidays, 'holiday').map((h) => ({
            id: h, label: h, tint: holidays.find((e) => e.tags.holiday === h)?.cat.theme.mainColor ?? 'var(--accent)',
            n: holidays.filter((e) => e.tags.holiday === h).length,
          })), (id) => ({ k: 'holiday', id }))}
          {strip(t('g_recent'), t('g_library'), pick(recent))}
        </>;
      case 'celebrations':
        return <>
          {head(t('grp_Celebrations'), t('g_pick_cat'), usedNamed(parties, 'celebration').length)}
          {cards(usedNamed(parties, 'celebration').map((c) => ({
            id: c, label: c, tint: parties.find((e) => e.tags.celebration === c)?.cat.theme.mainColor ?? 'var(--accent)',
            n: parties.filter((e) => e.tags.celebration === c).length,
          })), (id) => ({ k: 'celebration', id }))}
          {strip(t('g_recent'), t('g_library'), pick(recent))}
        </>;
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
    return <div className="cardgrid">{list.map(card)}</div>;
  }

  return (
    <section className="slab flex flex-col" style={{ minHeight: 0, overflow: 'hidden' }}>
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

      {/* 2 — the layout decides which gifts exist at all */}
      <div className="sec">
        <div className="sec-t">{t('layout')}</div>
        <div className="sec-s">{t('g_layout_sub')}</div>
        <div className="seg" role="group" aria-label={t('layout')}>
          {LOOKS.map((l) => (
            <button key={l.id} data-on={activeLook === l.id} onClick={() => onApplyLook(l)} title={t('look_' + l.id + '_h')}>
              {t('look_' + l.id)}
            </button>
          ))}
        </div>
      </div>

      {/* 3 + 4 — search, then the two ways in */}
      <div className="sec">
        <div className="searchbox">
          <Search size={14} style={{ color: 'var(--dim)', flex: '0 0 auto' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('g_search_gifts')} aria-label={t('g_search_gifts')} />
          {q && <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={() => setQ('')} aria-label={t('cancel')}><X size={13} /></button>}
        </div>

        <div style={{ marginTop: 13 }}>
          <div className="navlab">{t('g_browse')}</div>
          <div className="navrow">
            {nav('home', <Home size={11} />, t('g_home'))}
            {nav('themes', <TagIcon size={11} />, t('grp_Themen'), everyday.length)}
            {nav('vibes', <Sparkles size={11} />, t('grp_Vibes'), everyday.length)}
            {nav('holidays', <CalendarDays size={11} />, t('grp_Holidays'), holidays.length)}
            {nav('celebrations', <PartyPopper size={11} />, t('grp_Celebrations'), parties.length)}
          </div>
        </div>

        <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px dashed var(--line-soft)' }}>
          <div className="navlab">{t('g_library')}</div>
          <div className="navrow">
            {nav('favs', <Star size={11} />, t('g_favorites'), favs.length || undefined)}
            {nav('recent', <Clock size={11} />, t('g_recent'), recent.length || undefined)}
            {nav('all', <LayoutGrid size={11} />, t('g_all'), base.length)}
          </div>
        </div>
      </div>

      {/* 5 — what you came for */}
      <div className="scroll-y" style={{ flex: 1, minHeight: 0, padding: '14px 15px 18px' }}>
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
