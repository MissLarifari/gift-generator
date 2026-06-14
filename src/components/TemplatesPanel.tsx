import { useMemo, useState } from 'react';
import {
  Search, ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, Star,
  Heart, CandyCane, Users, Smile, Laugh, Skull, HandHeart, WandSparkles, Flame, Lock, FlameKindling,
  Eye, Coffee, VenetianMask, Wine, Leaf, Rainbow, TreePine, Ghost, Egg, Clover, HeartPulse, Venus,
  Flag, Drumstick, PartyPopper, Diamond, Gem, Cake, type LucideIcon,
} from 'lucide-react';
import { TEMPLATE_CATEGORIES, TEMPLATE_GROUPS, type TplCategory, type TplItem } from '../data/templates';
import { favKey } from '../state';
import { useI18n } from '../i18n';

export type { TplCategory, TplItem };

const GROUP_KEY: Record<string, string> = { Themen: 'g_grp_themes', Vibes: 'g_grp_vibes', Holidays: 'g_grp_holidays', Celebrations: 'g_grp_celebrations' };

// Per-category icons — closest lucide matches to the legacy FontAwesome set
// (heart, candy-cane, user-group, skull, fire, eye, cake, …). Keyed by label.
const CATEGORY_ICON: Record<string, LucideIcon> = {
  Romance: Heart, Cute: CandyCane, Friendship: Users, Funny: Smile, 'Funny / Chaotic': Laugh,
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
  const groupLabel = (g: string) => (GROUP_KEY[g] ? t(GROUP_KEY[g]) : g);
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<string>('Themen');
  const [openCats, setOpenCats] = useState<string[]>(['Romance']);

  const query = q.trim().toLowerCase();
  const searchResults = query
    ? TEMPLATE_CATEGORIES.flatMap((c) => c.items.filter((i) => `${i.l} ${i.main} ${i.top} ${i.bottom}`.toLowerCase().includes(query)).map((i) => ({ c, i })))
    : [];
  const cats = TEMPLATE_CATEGORIES.filter((c) => c.group === group);

  const favItems = useMemo(() => {
    const out: { c: TplCategory; i: TplItem }[] = [];
    for (const c of TEMPLATE_CATEGORIES) for (const i of c.items) if (favorites.includes(favKey(c.label, i.l))) out.push({ c, i });
    return out;
  }, [favorites]);

  const isFav = (c: TplCategory, i: TplItem) => favorites.includes(favKey(c.label, i.l));

  const phraseChip = (c: TplCategory, i: TplItem) => (
    <span key={c.label + i.l} className="inline-flex items-center" style={{ gap: 4, padding: '4px 5px 4px 10px', borderRadius: 7, background: 'rgba(87,224,240,.08)', border: '1px solid rgba(87,224,240,.22)' }}>
      <button onClick={() => onApply(c, i)} style={{ background: 'none', border: 'none', padding: 0, color: '#bfeefa', cursor: 'pointer', fontSize: 12 }}>{i.l}</button>
      <button onClick={() => onToggleFav(c, i)} title="Favorit" className="grid place-items-center" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: isFav(c, i) ? '#ffce8a' : '#5f7099' }}>
        <Star size={12} fill={isFav(c, i) ? '#ffce8a' : 'transparent'} />
      </button>
    </span>
  );

  return (
    <div className="flex flex-col overflow-y-auto" style={{ gap: 9, paddingRight: 4 }}>
      <div className="flex items-center gap-[7px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 11px' }}>
        <Search size={15} style={{ color: 'var(--muted)' }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('g_search_ph')} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13 }} />
      </div>

      <div className="flex gap-[5px] flex-wrap">
        {TEMPLATE_GROUPS.map((g) => (
          <button key={g} onClick={() => setGroup(g)} style={{ fontSize: 11, padding: '5px 9px', borderRadius: 8, cursor: 'pointer', ...(group === g && !query ? { background: 'linear-gradient(90deg,var(--ind),var(--cyan))', color: '#08131f', fontWeight: 600, border: 'none' } : { background: 'var(--surface)', border: '1px solid var(--border)', color: '#cdd9f0' }) }}>{groupLabel(g)}</button>
        ))}
      </div>

      {!query && favItems.length > 0 && (
        <div style={{ background: 'rgba(255,206,138,.07)', border: '1px solid rgba(255,206,138,.28)', borderRadius: 10, padding: '9px 11px' }}>
          <div className="flex items-center gap-[6px]" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: '#ffce8a', fontWeight: 600, marginBottom: 7 }}>
            <Star size={13} fill="#ffce8a" /> {t('g_favorites')}
          </div>
          <div className="flex flex-wrap gap-[5px]">{favItems.map(({ c, i }) => phraseChip(c, i))}</div>
        </div>
      )}

      {query ? (
        <div className="flex flex-col gap-[5px]">
          <div style={{ fontSize: 10, color: 'var(--dim)' }}>{searchResults.length} {t('g_hits')}</div>
          {searchResults.slice(0, 50).map(({ c, i }) => (
            <button key={c.label + i.l} onClick={() => onApply(c, i)} className="flex items-center justify-between" style={{ textAlign: 'left', fontSize: 12, padding: '7px 9px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: '#dbe6fb', cursor: 'pointer' }}>
              <span className="flex items-center gap-[7px]">{(() => { const Ic = CATEGORY_ICON[c.label]; return Ic ? <Ic size={13} style={{ color: c.theme.mainColor, flex: '0 0 auto' }} /> : <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c.theme.mainColor }} />; })()}{i.main}</span>
              <span style={{ fontSize: 9, color: '#7e8fb5' }}>{c.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
        <div className="flex items-center justify-between" style={{ padding: '0 2px', marginTop: 1 }}>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7e8fb5' }}>{groupLabel(group)}</span>
          <button
            onClick={() => { const vis = cats.map((c) => c.label); const allOpen = vis.every((l) => openCats.includes(l)); setOpenCats(allOpen ? openCats.filter((l) => !vis.includes(l)) : [...new Set([...openCats, ...vis])]); }}
            className="flex items-center gap-[5px]"
            style={{ fontSize: 11, fontWeight: 600, borderRadius: 7, cursor: 'pointer', padding: '4px 9px', ...(cats.every((c) => openCats.includes(c.label)) ? { color: '#08131f', background: 'linear-gradient(90deg,var(--ind),var(--cyan))', border: 'none' } : { color: '#bfeefa', background: 'rgba(87,224,240,.1)', border: '1px solid rgba(87,224,240,.3)' }) }}
          >
            {cats.every((c) => openCats.includes(c.label)) ? <><ChevronsDownUp size={12} /> {t('g_collapse_all')}</> : <><ChevronsUpDown size={12} /> {t('g_expand_all')}</>}
          </button>
        </div>
        {cats.map((c) => {
          const isOpen = openCats.includes(c.label);
          return (
            <div key={c.label} className="flex flex-col gap-[5px]">
              <button onClick={() => setOpenCats(isOpen ? openCats.filter((x) => x !== c.label) : [...openCats, c.label])} className="flex items-center justify-between" style={{ padding: '9px 11px', fontSize: 13, borderRadius: 10, cursor: 'pointer', background: isOpen ? 'rgba(255,255,255,.07)' : 'var(--surface)', border: `1px solid ${isOpen ? 'var(--border-2)' : 'var(--border)'}`, color: '#dbe6fb' }}>
                <span className="flex items-center gap-[9px]">{(() => { const Ic = CATEGORY_ICON[c.label]; return Ic ? <Ic size={15} style={{ color: c.theme.mainColor, flex: '0 0 auto' }} /> : <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.theme.mainColor }} />; })()} {c.label}</span>
                <span className="flex items-center gap-[6px]">
                  <span style={{ fontSize: 11, color: '#5f7099' }}>{c.items.length}</span>
                  {isOpen ? <ChevronUp size={14} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--muted)' }} />}
                </span>
              </button>
              {isOpen && <div className="flex flex-wrap gap-[5px]" style={{ padding: '0 2px 4px' }}>{c.items.map((i) => phraseChip(c, i))}</div>}
            </div>
          );
        })}
        </>
      )}
    </div>
  );
}
