import { useMemo, useState } from 'react';
import {
  Search, Star, Sparkles,
  Heart, CandyCane, Users, Smile, Laugh, Skull, HandHeart, WandSparkles, Flame, Lock, FlameKindling,
  Eye, Coffee, VenetianMask, Wine, Leaf, Rainbow, TreePine, Ghost, Egg, Clover, HeartPulse, Venus,
  Flag, Drumstick, PartyPopper, Diamond, Gem, Cake, type LucideIcon,
} from 'lucide-react';
import { TEMPLATE_CATEGORIES, type TplCategory, type TplItem } from '../data/templates';
import { favKey } from '../state';
import { useI18n } from '../i18n';

export type { TplCategory, TplItem };

// New templates panel (pink/violet): search + category filter chips, favorite
// cards, and an icon grid of all themes. Click a theme → its phrases; click a
// phrase/favorite → apply. Same data + props as before, only the UI changed.
const PINK = '#e15c9e';
const PANEL = '#0f0d18';
const CARD = '#16121f';
const FIELDBG = '#0e0c16';
const BORDER = 'rgba(255,255,255,.08)';
const MUTED = '#8b84a6';

const CATEGORY_ICON: Record<string, LucideIcon> = {
  New: Sparkles, Romance: Heart, Cute: CandyCane, Friendship: Users, Funny: Smile, 'Funny / Chaotic': Laugh,
  'Friends / Roast': Skull, 'Flirty bold': HandHeart, Wicked: WandSparkles, Dominant: Flame,
  Submissive: Lock, Spicy: FlameKindling, Voyeur: Eye, Aftercare: Coffee, 'Goth / Dark': VenetianMask,
  'Drunk vibes': Wine, 'Soft / Cottagecore': Leaf, Pride: Rainbow, Christmas: TreePine, Halloween: Ghost,
  Easter: Egg, 'St Patricks': Clover, Valentine: HeartPulse, 'Womens Day': Venus, '4th of July': Flag,
  Thanksgiving: Drumstick, Hanukkah: Star, 'New Year': PartyPopper, Wedding: Diamond, Anniversary: Gem, Birthday: Cake,
};

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
  const query = q.trim().toLowerCase();

  const isFav = (c: TplCategory, i: TplItem) => favorites.includes(favKey(c.label, i.l));
  const favItems = useMemo(() => {
    const out: { c: TplCategory; i: TplItem }[] = [];
    for (const c of TEMPLATE_CATEGORIES) for (const i of c.items) if (favorites.includes(favKey(c.label, i.l))) out.push({ c, i });
    return out;
  }, [favorites]);

  const searchResults = query
    ? TEMPLATE_CATEGORIES.flatMap((c) => c.items.filter((i) => `${i.l} ${i.main} ${i.top} ${i.bottom}`.toLowerCase().includes(query)).map((i) => ({ c, i })))
    : [];

  const activeCat = cat ? TEMPLATE_CATEGORIES.find((c) => c.label === cat) ?? null : null;

  const icon = (label: string, size: number, color: string) => {
    const Ic = CATEGORY_ICON[label];
    return Ic ? <Ic size={size} style={{ color, flex: '0 0 auto' }} /> : <span style={{ width: Math.round(size * 0.55), height: Math.round(size * 0.55), borderRadius: '50%', background: color, display: 'inline-block', flex: '0 0 auto' }} />;
  };

  const secLabel = (text: string) => <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', color: MUTED, margin: '2px 0 8px' }}>{text}</div>;

  const chip = (text: string, active: boolean, onClick: () => void) => (
    <button key={text} onClick={onClick} style={{ flex: '0 0 auto', fontSize: 11.5, padding: '5px 11px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', ...(active ? { background: PINK, color: '#fff', border: 'none' } : { background: CARD, border: `1px solid ${BORDER}`, color: '#c9c3da' }) }}>{text}</button>
  );

  const phraseRow = (c: TplCategory, i: TplItem) => (
    <div key={c.label + i.l} className="flex items-center" style={{ gap: 6, background: FIELDBG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '7px 9px' }}>
      <button onClick={() => onApply(c, i)} className="flex-1 flex items-center" style={{ gap: 8, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#dbe6fb', fontSize: 12.5, minWidth: 0 }}>
        {icon(c.label, 14, c.theme.mainColor)}
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.main || i.l}</span>
      </button>
      <button onClick={() => onToggleFav(c, i)} aria-label="Favorit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav(c, i) ? '#f3c24f' : MUTED, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>
        <Star size={13} fill={isFav(c, i) ? '#f3c24f' : 'transparent'} />
      </button>
    </div>
  );

  const favCard = ({ c, i }: { c: TplCategory; i: TplItem }) => (
    <div key={c.label + i.l} onClick={() => onApply(c, i)} style={{ position: 'relative', flex: '0 0 auto', width: 150, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 10px', cursor: 'pointer' }}>
      <button onClick={(e) => { e.stopPropagation(); onToggleFav(c, i); }} aria-label="Favorit" style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#f3c24f', display: 'grid', placeItems: 'center' }}>
        <Star size={13} fill="#f3c24f" />
      </button>
      <div className="flex flex-col items-center text-center" style={{ gap: 2, minHeight: 54, justifyContent: 'center' }}>
        {i.top && <div style={{ fontSize: 10.5, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{i.top}</div>}
        <div style={{ fontSize: 14, fontWeight: 500, color: c.theme.mainColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{i.main}</div>
        {i.bottom && <div style={{ fontSize: 10.5, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{i.bottom}</div>}
      </div>
      <div className="flex items-center" style={{ gap: 5, marginTop: 8, fontSize: 10, color: MUTED }}>
        {icon(c.label, 11, c.theme.mainColor)}<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col overflow-y-auto" style={{ paddingRight: 4, scrollbarGutter: 'stable' }}>
      <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#cdb8d8' }}>{t('g_tab_templates')}</div>

        {/* search */}
        <div className="flex items-center" style={{ gap: 8, background: FIELDBG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 11px' }}>
          <Search size={15} style={{ color: MUTED, flex: '0 0 auto' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('g_search_ph')} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#ece9f6', fontSize: 13 }} />
        </div>

        {/* filter chips */}
        <div className="flex" style={{ gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {chip('All', cat === null && !query, () => { setCat(null); setQ(''); })}
          {TEMPLATE_CATEGORIES.map((c) => chip(c.label, cat === c.label && !query, () => { setCat(c.label); setQ(''); }))}
        </div>

        {query ? (
          <div className="flex flex-col" style={{ gap: 5 }}>
            <div style={{ fontSize: 10, color: MUTED }}>{searchResults.length} {t('g_hits')}</div>
            {searchResults.slice(0, 60).map(({ c, i }) => phraseRow(c, i))}
          </div>
        ) : activeCat ? (
          <div className="flex flex-col" style={{ gap: 5 }}>
            <button onClick={() => setCat(null)} className="flex items-center" style={{ gap: 7, background: 'none', border: 'none', cursor: 'pointer', color: '#c9c3da', fontSize: 12.5, padding: '0 0 4px' }}>
              <span style={{ color: PINK }}>←</span> {icon(activeCat.label, 15, activeCat.theme.mainColor)} <span style={{ fontWeight: 500 }}>{activeCat.label}</span>
            </button>
            {activeCat.items.map((i) => phraseRow(activeCat, i))}
          </div>
        ) : (
          <>
            {favItems.length > 0 && (
              <div>
                {secLabel(t('g_favorites'))}
                <div className="flex" style={{ gap: 8, overflowX: 'auto', paddingBottom: 4 }}>{favItems.map((f) => favCard(f))}</div>
              </div>
            )}
            <div>
              {secLabel(t('g_grp_themes'))}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {TEMPLATE_CATEGORIES.map((c) => (
                  <button key={c.label} onClick={() => setCat(c.label)} className="flex flex-col items-center justify-center" style={{ gap: 7, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 5px', cursor: 'pointer', minHeight: 74 }}>
                    {icon(c.label, 22, c.theme.mainColor)}
                    <span style={{ fontSize: 10.5, color: '#c9c3da', textAlign: 'center', lineHeight: 1.2 }}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
