import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Star, Sparkles, ChevronDown, X,
  Heart, CandyCane, Users, Smile, Laugh, Skull, HandHeart, WandSparkles, Flame, Lock, FlameKindling,
  Eye, Coffee, VenetianMask, Wine, Leaf, Rainbow, TreePine, Ghost, Egg, Clover, HeartPulse, Venus,
  Flag, Drumstick, PartyPopper, Diamond, Gem, Cake, type LucideIcon,
} from 'lucide-react';
import { TEMPLATE_CATEGORIES, type TplCategory, type TplItem } from '../data/templates';
import { favKey } from '../state';
import { useI18n } from '../i18n';

export type { TplCategory, TplItem };

// Template browser: search, a short row of category chips (the rest behind
// "More"), and compact visual cards. Data + props are unchanged — this is the
// UI layer only; picking a card still calls onApply(category, item).

const CATEGORY_ICON: Record<string, LucideIcon> = {
  New: Sparkles, Romance: Heart, Cute: CandyCane, Friendship: Users, Funny: Smile, 'Funny / Chaotic': Laugh,
  'Friends / Roast': Skull, 'Flirty bold': HandHeart, Wicked: WandSparkles, Dominant: Flame,
  Submissive: Lock, Spicy: FlameKindling, Voyeur: Eye, Aftercare: Coffee, 'Goth / Dark': VenetianMask,
  'Drunk vibes': Wine, 'Soft / Cottagecore': Leaf, Pride: Rainbow, Christmas: TreePine, Halloween: Ghost,
  Easter: Egg, 'St Patricks': Clover, Valentine: HeartPulse, 'Womens Day': Venus, '4th of July': Flag,
  Thanksgiving: Drumstick, Hanukkah: Star, 'New Year': PartyPopper, Wedding: Diamond, Anniversary: Gem, Birthday: Cake,
};

// The handful of categories that earn a permanent chip; everything else sits
// behind "More" so the top of the sidebar stays quiet.
const PRIMARY_CHIPS: { key: string; label: string }[] = [
  { key: 'Romance', label: 'Romance' },
  { key: 'Friendship', label: 'Friendship' },
  { key: 'Funny', label: 'Funny' },
  { key: 'Flirty bold', label: 'Flirty' },
  { key: 'Spicy', label: 'Spicy' },
];
const PRIMARY_KEYS = PRIMARY_CHIPS.map((c) => c.key);

export default function TemplatesPanel({
  onApply,
  favorites,
  onToggleFav,
}: {
  onApply: (cat: TplCategory, item: TplItem) => void;
  favorites: string[];
  onToggleFav: (cat: TplCategory, item: TplItem) => void;
}) {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const query = q.trim().toLowerCase();

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => { if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMoreOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [moreOpen]);

  const isFav = (c: TplCategory, i: TplItem) => favorites.includes(favKey(c.label, i.l));

  const favItems = useMemo(() => {
    const out: { c: TplCategory; i: TplItem }[] = [];
    for (const c of TEMPLATE_CATEGORIES) for (const i of c.items) if (favorites.includes(favKey(c.label, i.l))) out.push({ c, i });
    return out;
  }, [favorites]);

  // Which cards to show, grouped by category so long lists stay scannable.
  const groups = useMemo(() => {
    const cats = query
      ? TEMPLATE_CATEGORIES
      : cat
        ? TEMPLATE_CATEGORIES.filter((c) => c.label === cat)
        : TEMPLATE_CATEGORIES;
    return cats
      .map((c) => ({ c, items: query ? c.items.filter((i) => `${i.l} ${i.main} ${i.top} ${i.bottom}`.toLowerCase().includes(query)) : c.items }))
      .filter((g) => g.items.length > 0);
  }, [query, cat]);

  const hitCount = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);
  const moreCats = TEMPLATE_CATEGORIES.filter((c) => !PRIMARY_KEYS.includes(c.label));
  const moreActive = cat != null && !PRIMARY_KEYS.includes(cat);

  const icon = (label: string, size: number, color: string) => {
    const Ic = CATEGORY_ICON[label];
    return Ic
      ? <Ic size={size} style={{ color, flex: '0 0 auto' }} />
      : <span style={{ width: Math.round(size * 0.5), height: Math.round(size * 0.5), borderRadius: '50%', background: color, display: 'inline-block', flex: '0 0 auto' }} />;
  };

  const pick = (c: TplCategory, i: TplItem) => { setSelected(favKey(c.label, i.l)); onApply(c, i); };

  const card = (c: TplCategory, i: TplItem, showCat: boolean) => {
    const k = favKey(c.label, i.l);
    const sub = [i.top, i.bottom].filter(Boolean).join(' · ');
    return (
      <div key={k} style={{ position: 'relative' }}>
        <button className="tpl" data-sel={selected === k} onClick={() => pick(c, i)} title={i.l}>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {i.main || i.l}
          </div>
          <div className="flex items-center" style={{ gap: 5, marginTop: 3, fontSize: 11, color: 'var(--muted)', minWidth: 0 }}>
            {showCat && icon(c.label, 11, c.theme.mainColor)}
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {showCat ? c.label : ''}{showCat && sub ? ' · ' : ''}{sub}
            </span>
          </div>
        </button>
        <button className="tpl-star" data-on={isFav(c, i)} onClick={() => onToggleFav(c, i)} aria-label="Favorite" title="Favorite">
          <Star size={13} fill={isFav(c, i) ? 'currentColor' : 'transparent'} />
        </button>
      </div>
    );
  };

  return (
    <section className="panel flex flex-col" style={{ minHeight: 0, overflow: 'hidden' }}>
      {/* header: search + chips */}
      <div style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="field">
          <Search size={14} style={{ color: 'var(--muted)', flex: '0 0 auto' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('g_search_gifts')} aria-label={t('g_search_gifts')} />
          {q && <button className="icon-btn" style={{ width: 20, height: 20 }} onClick={() => setQ('')} aria-label={t('cancel')}><X size={13} /></button>}
        </div>

        <div className="flex flex-wrap items-center" style={{ gap: 5 }}>
          <button className="chip" data-on={cat === null} onClick={() => { setCat(null); setMoreOpen(false); }}>{t('g_all')}</button>
          {PRIMARY_CHIPS.map((c) => (
            <button key={c.key} className="chip" data-on={cat === c.key} onClick={() => { setCat(cat === c.key ? null : c.key); setMoreOpen(false); }}>
              {c.label}
            </button>
          ))}
          <div ref={moreRef} style={{ position: 'relative' }}>
            <button className="chip" data-on={moreActive} onClick={() => setMoreOpen((o) => !o)} aria-haspopup="true" aria-expanded={moreOpen}>
              {moreActive ? cat : t('g_more')} <ChevronDown size={12} />
            </button>
            {/* anchored right — the panel clips overflow, so it must open inward */}
            {moreOpen && (
              <div className="pop" style={{ top: 'calc(100% + 6px)', right: 0, width: 212, maxHeight: 292, overflowY: 'auto' }}>
                {moreCats.map((c) => (
                  <button key={c.label} className="menu-item" data-on={cat === c.label} onClick={() => { setCat(c.label); setMoreOpen(false); }}>
                    {icon(c.label, 13, c.theme.mainColor)} {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* cards */}
      <div className="scroll-y" style={{ flex: 1, minHeight: 0, padding: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {query && (
          <div className="hint" style={{ marginTop: -2 }}>{hitCount} {t('g_hits')}</div>
        )}

        {!query && favItems.length > 0 && (
          <div>
            <div className="sec-label" style={{ marginBottom: 8 }}>{t('g_favorites')}</div>
            <div className="flex flex-col" style={{ gap: 6 }}>{favItems.map(({ c, i }) => card(c, i, true))}</div>
          </div>
        )}

        {groups.map(({ c, items }) => (
          <div key={c.label}>
            {(cat === null || query) && (
              <div className="sec-label flex items-center" style={{ gap: 6, marginBottom: 8 }}>
                {icon(c.label, 12, c.theme.mainColor)} {c.label}
              </div>
            )}
            <div className="flex flex-col" style={{ gap: 6 }}>{items.map((i) => card(c, i, cat !== null && !query))}</div>
          </div>
        ))}

        {groups.length === 0 && <div className="hint">0 {t('g_hits')}</div>}
      </div>
    </section>
  );
}
