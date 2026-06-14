import { useEffect, useRef } from 'react';
import { Info, ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import type { GiftState, FieldId, Layout, FontStyle } from '../engine';
import { FIELDS, LAYOUTS, FONT_STYLES, HAS_BOLD_ITALIC, HAS_STAR, HAS_FONT, DECO_PRESETS, SYMBOLS, KAOMOJI, type Commit } from '../state';
import { useI18n } from '../i18n';
import CustomEditor from './CustomEditor';

const BIKEY: Record<string, 'top' | 'main' | 'bottom'> = { topText: 'top', mainText: 'main', bottomText: 'bottom' };

export default function EditorPanel({
  state,
  commit,
  onOpenColor,
  open,
  setOpen,
  onSetLayout,
  focusReq,
}: {
  state: GiftState;
  commit: Commit;
  onOpenColor: (f: FieldId) => void;
  open: FieldId[];
  setOpen: (f: FieldId[]) => void;
  onSetLayout: (l: Layout) => void;
  focusReq?: { f: FieldId; n: number } | null;
}) {
  const { t } = useI18n();
  const layoutLabel = (l: Layout) => t('layout_' + l);
  const fieldLabel = (f: FieldId) => t('fl_' + f);
  const cardRefs = useRef<Partial<Record<FieldId, HTMLDivElement | null>>>({});
  const inputRefs = useRef<Partial<Record<FieldId, HTMLInputElement | null>>>({});

  // Focus a field's text input when the app requests it (e.g. tapping a line in
  // the mobile preview). The field is already opened via `open`, so its input is
  // mounted by the time this effect runs.
  useEffect(() => {
    if (!focusReq) return;
    const el = inputRefs.current[focusReq.f];
    if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }, [focusReq]);

  // Scroll a newly-opened line into view (single opens — header click or middle
  // preview focus), but stay put on Expand-all (bulk) and on collapses.
  const prevOpen = useRef<FieldId[]>(open);
  useEffect(() => {
    const added = open.filter((f) => !prevOpen.current.includes(f));
    prevOpen.current = open;
    if (added.length === 1) cardRefs.current[added[0]]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [open]);

  const typeText = (f: FieldId, v: string) => commit((s) => ({ ...s, text: { ...s.text, [f]: v } }), 'text:' + f);
  const setFieldValue = (f: FieldId, v: string) => commit((s) => ({ ...s, text: { ...s.text, [f]: v } }));
  const setSize = (f: FieldId, n: number) => commit((s) => ({ ...s, sizes: { ...s.sizes, [f]: n } }), 'size:' + f);
  const setFont = (f: FieldId, st: FontStyle) => commit((s) => ({ ...s, fonts: { ...s.fonts, [f]: s.fonts[f] === st ? 'normal' : st } }));
  const setLayout = onSetLayout;
  const toggleBI = (f: FieldId, kind: 'bold' | 'italic') => {
    const k = BIKEY[f];
    commit((s) => ({ ...s, [kind]: { ...s[kind], [k]: !s[kind][k] } }) as GiftState);
  };
  const toggleStar = (f: 'dekoTop' | 'topText' | 'bottomText') => commit((s) => ({ ...s, stars: { ...s.stars, [f]: !s.stars[f] } }));
  const appendSym = (f: FieldId, sym: string) => commit((s) => ({ ...s, text: { ...s.text, [f]: s.text[f] + sym } }));

  const dotBg = (f: FieldId) => {
    const g = state.grads[f];
    if (state.noColor[f]) return 'repeating-conic-gradient(#2a3650 0% 25%, transparent 0% 50%) 50% / 8px 8px';
    if (g.on || g.rainbow) return `linear-gradient(90deg, ${g.rainbow ? '#ffadad' : g.c1}, ${g.rainbow ? '#bdb2ff' : g.c2})`;
    return state.colors[f];
  };

  const chip = (label: string, onClick: () => void, activeChip = false): React.ReactNode => (
    <button
      key={label}
      onClick={onClick}
      style={{
        fontSize: 11, padding: '4px 8px', borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap',
        ...(activeChip
          ? { background: 'linear-gradient(90deg,var(--ind),var(--cyan))', color: '#08131f', fontWeight: 600, border: 'none' }
          : { background: 'rgba(87,224,240,.08)', border: '1px solid rgba(87,224,240,.22)', color: '#bfeefa' }),
      }}
    >
      {label}
    </button>
  );

  const allOpen = open.length === FIELDS.length;

  return (
    <div className="flex flex-col overflow-y-auto" style={{ gap: 9, paddingRight: 4 }}>
      {/* So geht's */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '11px 12px' }}>
        <div className="flex items-center gap-[5px]" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: '#bfeefa', marginBottom: 8 }}>
          <Info size={13} /> {t('howto_title')}
        </div>
        {[t('g_step_pick'), t('g_step_edit'), t('g_step_copy')].map((step, i) => (
          <div key={i} className="flex items-center gap-[8px]" style={{ fontSize: 12.5, color: '#e3ecfb', marginBottom: 6 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(90deg,var(--ind),var(--cyan))', color: '#08131f', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}>{i + 1}</span>
            {step}
          </div>
        ))}
      </div>

      {/* Layout */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 9 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7e8fb5', marginBottom: 7 }}>{t('layout')}</div>
        <div className="flex flex-wrap gap-[5px]">
          {LAYOUTS.map((l) => chip(layoutLabel(l), () => setLayout(l), state.layout === l))}
        </div>
      </div>

      {state.layout === 'custom' ? (
        <CustomEditor value={state.customText} commit={commit} />
      ) : (
      <>
      {/* Zeilen-Header + Alles einklappen */}
      <div className="flex items-center justify-between" style={{ padding: '0 2px', marginTop: 1 }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7e8fb5' }}>{t('g_lines')}</span>
        <button
          onClick={() => setOpen(allOpen ? [] : [...FIELDS])}
          className="flex items-center gap-[5px]"
          style={{
            fontSize: 11, fontWeight: 600, borderRadius: 7, cursor: 'pointer', padding: '4px 9px',
            ...(allOpen
              ? { color: '#08131f', background: 'linear-gradient(90deg,var(--ind),var(--cyan))', border: 'none' }
              : { color: '#bfeefa', background: 'rgba(87,224,240,.1)', border: '1px solid rgba(87,224,240,.3)' }),
          }}
        >
          {allOpen ? <ChevronsDownUp size={12} /> : <ChevronsUpDown size={12} />}
          {allOpen ? t('g_collapse_all') : t('g_expand_all')}
        </button>
      </div>

      {/* Line accordion */}
      {FIELDS.map((f) => {
        const isOpen = open.includes(f);
        const val = state.text[f];
        return (
          <div
            key={f}
            ref={(el) => { cardRefs.current[f] = el; }}
            style={{ background: 'var(--surface)', border: `1px solid ${isOpen ? 'rgba(87,224,240,.5)' : 'var(--border)'}`, borderRadius: 11, boxShadow: isOpen ? '0 0 16px rgba(87,224,240,.14)' : 'none' }}
          >
            {/* header — always visible, toggles open/closed */}
            <div onClick={() => setOpen(isOpen ? open.filter((x) => x !== f) : [...open, f])} className="flex items-center gap-[9px]" style={{ padding: '9px 11px', cursor: 'pointer' }}>
              <button
                aria-label="Farbe"
                onClick={(e) => { e.stopPropagation(); onOpenColor(f); }}
                style={{ width: 18, height: 18, borderRadius: '50%', flex: '0 0 auto', cursor: 'pointer', border: '1px solid rgba(255,255,255,.2)', background: dotBg(f) }}
              />
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: isOpen ? 'var(--ind)' : '#7e8fb5' }}>{fieldLabel(f)}</div>
                {!isOpen && (
                  <div style={{ fontSize: 12, color: val ? '#c4d2ee' : '#4a5876', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val || t('g_empty')}</div>
                )}
              </div>
              {isOpen ? <ChevronUp size={15} style={{ color: 'var(--ind)', flex: '0 0 auto' }} /> : <ChevronDown size={15} style={{ color: 'var(--muted)', flex: '0 0 auto' }} />}
            </div>

            {isOpen && (
              <div style={{ padding: '0 11px 11px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* text */}
                <input
                  ref={(el) => { inputRefs.current[f] = el; }}
                  value={val}
                  onChange={(e) => typeText(f, e.target.value)}
                  placeholder={t('g_text_ph')}
                  style={{ width: '100%', background: 'rgba(6,9,18,.4)', border: '1px solid var(--border)', borderRadius: 7, padding: '7px 9px', color: 'var(--text)', fontSize: 13, outline: 'none' }}
                />
                {/* font + size */}
                <div className="flex items-center flex-wrap" style={{ gap: 5 }}>
                  {HAS_FONT.includes(f) && FONT_STYLES.map((fs) => chip(fs.label, () => setFont(f, fs.id as FontStyle), state.fonts[f] === fs.id))}
                  <span className="flex items-center gap-[4px]" style={{ marginLeft: 'auto' }}>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{t('size')}</span>
                    <input type="number" value={state.sizes[f]} onChange={(e) => setSize(f, parseInt(e.target.value) || 0)} style={{ width: 46, background: 'rgba(6,9,18,.4)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 6px', color: 'var(--text)', fontSize: 12, outline: 'none' }} />
                  </span>
                </div>
                {/* bold / italic / star */}
                {(HAS_BOLD_ITALIC.includes(f) || HAS_STAR.includes(f)) && (
                  <div className="flex gap-[5px]">
                    {HAS_BOLD_ITALIC.includes(f) && chip('B', () => toggleBI(f, 'bold'), state.bold[BIKEY[f]])}
                    {HAS_BOLD_ITALIC.includes(f) && chip('I', () => toggleBI(f, 'italic'), state.italic[BIKEY[f]])}
                    {HAS_STAR.includes(f) && chip('★', () => toggleStar(f as 'dekoTop' | 'topText' | 'bottomText'), state.stars[f as 'dekoTop' | 'topText' | 'bottomText'])}
                  </div>
                )}
                {/* deco presets */}
                {DECO_PRESETS[f] && (
                  <div>
                    <div style={{ fontSize: 10, color: '#7e8fb5', margin: '2px 0 5px' }}>{t('g_pick_deco')}</div>
                    <div className="flex flex-wrap gap-[5px]">{DECO_PRESETS[f]!.map((p) => chip(p, () => setFieldValue(f, p)))}</div>
                  </div>
                )}
                {/* symbols for deco lines */}
                {(f === 'dekoTop' || f === 'dekoBottom') && (
                  <div>
                    <div style={{ fontSize: 10, color: '#7e8fb5', margin: '2px 0 5px' }}>{t('plus_symbol')}</div>
                    <div className="flex flex-wrap gap-[5px]">{SYMBOLS.map((sym) => chip(sym, () => appendSym(f, sym)))}</div>
                  </div>
                )}
                {/* kaomoji */}
                {f === 'kaomoji' && (
                  <div>
                    <div style={{ fontSize: 10, color: '#7e8fb5', margin: '2px 0 5px' }}>{t('kaomoji')}</div>
                    <div className="flex flex-wrap gap-[5px]">{KAOMOJI.map((k) => chip(k, () => setFieldValue('kaomoji', k)))}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      </>
      )}
    </div>
  );
}
