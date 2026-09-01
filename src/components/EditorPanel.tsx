import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Sparkles, Type, Palette, LayoutGrid, Wand2, Trash2, Download, Upload, Lightbulb, Heart } from 'lucide-react';
import type { GiftState, FieldId, Layout, FontStyle } from '../engine';
import { FIELDS, LAYOUTS, FONT_STYLES, HAS_BOLD_ITALIC, HAS_STAR, HAS_FONT, DECO_PRESETS, SYMBOLS, KAOMOJI, type Commit } from '../state';
import { buildShareUrl, decodeState } from '../share';
import { TEMPLATE_CATEGORIES } from '../data/templates';
import { useI18n } from '../i18n';
import CustomEditor from './CustomEditor';

// New tabbed "Customize" editor (Text / Deco / Layout / Colors) in the pink/violet
// look. Self-contained: drives the same GiftState via `commit`; no engine/App changes.
const BIKEY: Record<string, 'top' | 'main' | 'bottom'> = { topText: 'top', mainText: 'main', bottomText: 'bottom' };
const LINE_LIMIT = 46;

// Local palette — kept inline so the rest of the app (still cyan) is untouched.
const PINK = '#e15c9e';
const PANEL = '#0f0d18';
const CARD = '#16121f';
const FIELDBG = '#0e0c16';
const BORDER = 'rgba(255,255,255,.08)';
const BORDER_ON = 'rgba(225,92,158,.5)';
const TXT = '#ece9f6';
const MUTED = '#8b84a6';
const CAP = '#6f6a85';

type Tab = 'text' | 'deco' | 'layout' | 'colors';

const labelStyle: CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '.12em', color: MUTED };

export default function EditorPanel(props: {
  state: GiftState;
  commit: Commit;
  onOpenColor: (f: FieldId) => void;
  open: FieldId[];
  setOpen: (f: FieldId[]) => void;
  onSetLayout: (l: Layout) => void;
  focusReq?: { f: FieldId; n: number } | null;
}) {
  const { state, commit, onOpenColor, onSetLayout, focusReq } = props;
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('text');
  const [flash, setFlash] = useState('');
  const inputRefs = useRef<Partial<Record<FieldId, HTMLInputElement | null>>>({});

  const fieldLabel = (f: FieldId) => (state.layout === 'pyramid' ? t('pyr_' + f) : t('fl_' + f));

  // Tapping a preview line (mobile) asks the editor to focus that field's input.
  useEffect(() => {
    if (!focusReq) return;
    setTab('text');
    requestAnimationFrame(() => {
      const el = inputRefs.current[focusReq.f];
      if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }, [focusReq]);

  const typeText = (f: FieldId, v: string) => commit((s) => ({ ...s, text: { ...s.text, [f]: v } }), 'text:' + f);
  const setFieldValue = (f: FieldId, v: string) => commit((s) => ({ ...s, text: { ...s.text, [f]: v } }));
  const setSize = (f: FieldId, n: number) => commit((s) => ({ ...s, sizes: { ...s.sizes, [f]: n } }), 'size:' + f);
  const setFont = (f: FieldId, st: FontStyle) => commit((s) => ({ ...s, fonts: { ...s.fonts, [f]: s.fonts[f] === st ? 'normal' : st } }));
  const toggleBI = (f: FieldId, kind: 'bold' | 'italic') => {
    const k = BIKEY[f];
    commit((s) => ({ ...s, [kind]: { ...s[kind], [k]: !s[kind][k] } }) as GiftState);
  };
  const toggleStar = (f: 'dekoTop' | 'topText' | 'bottomText') => commit((s) => ({ ...s, stars: { ...s.stars, [f]: !s.stars[f] } }));
  const appendSym = (f: FieldId, sym: string) => commit((s) => ({ ...s, text: { ...s.text, [f]: s.text[f] + sym } }));

  const clearAll = () => commit((s) => ({ ...s, text: { dekoTop: '', topText: '', mainText: '', bottomText: '', kaomoji: '', dekoBottom: '' } }));

  // Randomize = apply a random template (mirrors App.applyTemplate's core).
  const randomize = () => {
    const cat = TEMPLATE_CATEGORIES[Math.floor(Math.random() * TEMPLATE_CATEGORIES.length)];
    const item = cat.items[Math.floor(Math.random() * cat.items.length)];
    commit((s) => {
      const th = cat.theme;
      const text = { ...s.text, mainText: item.main, topText: item.top, bottomText: item.bottom };
      if (th.deco.dekoTop != null) text.dekoTop = th.deco.dekoTop;
      if (th.deco.dekoBottom != null) text.dekoBottom = th.deco.dekoBottom;
      if (th.deco.kaomoji != null) text.kaomoji = th.deco.kaomoji;
      const colors = { ...s.colors, mainText: th.mainColor, topText: th.topColor, bottomText: th.botColor };
      const grads = { ...s.grads, mainText: th.mainGrad ? { on: true, c1: th.mainGrad.c1, c2: th.mainGrad.c2, rainbow: th.mainGrad.rainbow } : { ...s.grads.mainText, on: false, rainbow: false } };
      const noColor = { ...s.noColor, mainText: false, topText: false, bottomText: false };
      return { ...s, text, colors, grads, noColor };
    });
  };

  const exportGift = async () => {
    try { await navigator.clipboard.writeText(buildShareUrl(state)); setFlash(t('g_link_copied2')); setTimeout(() => setFlash(''), 1600); } catch { /* ignore */ }
  };
  const importGift = () => {
    const raw = window.prompt(t('g_import_prompt'));
    if (!raw) return;
    const m = raw.match(/g=([A-Za-z0-9\-_]+)/);
    const st = decodeState(m ? m[1] : raw.trim());
    if (st) commit(() => st); else window.alert(t('g_import_fail'));
  };

  const dotBg = (f: FieldId) => {
    const g = state.grads[f];
    if (state.noColor[f]) return 'repeating-conic-gradient(#3a2a3e 0% 25%, transparent 0% 50%) 50% / 8px 8px';
    if (g.on || g.rainbow) return `linear-gradient(90deg, ${g.rainbow ? '#ffadad' : g.c1}, ${g.rainbow ? '#bdb2ff' : g.c2})`;
    return state.colors[f];
  };

  const pill = (label: string, onClick: () => void, active = false, extra: CSSProperties = {}) => (
    <button
      key={label}
      onClick={onClick}
      style={{ fontSize: 12, padding: '5px 9px', borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap', ...(active ? { background: PINK, color: '#fff', border: 'none' } : { background: CARD, border: `1px solid ${BORDER}`, color: '#c9c3da' }), ...extra }}
    >
      {label}
    </button>
  );

  const tabBtn = (id: Tab, icon: React.ReactNode, label: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className="flex items-center justify-center"
      style={{ flex: 1, gap: 5, fontSize: 12, borderRadius: 8, padding: '7px 4px', cursor: 'pointer', border: 'none', ...(tab === id ? { background: PINK, color: '#fff' } : { background: 'transparent', color: MUTED }) }}
    >
      {icon}{label}
    </button>
  );

  const mainControls = (f: FieldId) => (
    <div style={{ marginTop: 8 }}>
      <div className="flex items-center flex-wrap" style={{ gap: 6 }}>
        {HAS_FONT.includes(f) && FONT_STYLES.map((fs) => pill(fs.label, () => setFont(f, fs.id as FontStyle), state.fonts[f] === fs.id))}
        <span className="flex items-center" style={{ gap: 4, marginLeft: HAS_FONT.includes(f) ? 'auto' : 0 }}>
          <span style={{ fontSize: 11, color: MUTED }}>{t('size')}</span>
          <input type="number" value={state.sizes[f]} onChange={(e) => setSize(f, parseInt(e.target.value) || 0)} style={{ width: 46, background: FIELDBG, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '4px 6px', color: TXT, fontSize: 12, outline: 'none' }} />
        </span>
      </div>
      {(HAS_BOLD_ITALIC.includes(f) || HAS_STAR.includes(f)) && (
        <div className="flex" style={{ gap: 6, marginTop: 6 }}>
          {HAS_BOLD_ITALIC.includes(f) && pill('B', () => toggleBI(f, 'bold'), state.bold[BIKEY[f]], { fontWeight: 700 })}
          {HAS_BOLD_ITALIC.includes(f) && pill('I', () => toggleBI(f, 'italic'), state.italic[BIKEY[f]], { fontStyle: 'italic' })}
          {HAS_STAR.includes(f) && pill('★', () => toggleStar(f as 'dekoTop' | 'topText' | 'bottomText'), state.stars[f as 'dekoTop' | 'topText' | 'bottomText'])}
        </div>
      )}
    </div>
  );

  const lineRow = (f: FieldId, withControls: boolean) => {
    const val = state.text[f];
    const len = [...val].length;
    return (
      <div key={f} style={{ marginBottom: 12 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <span style={labelStyle}>{fieldLabel(f)}</span>
          <span style={{ fontSize: 11, color: len > LINE_LIMIT ? '#ff6b6b' : CAP }}>{len}/{LINE_LIMIT}</span>
        </div>
        <div className="flex items-center" style={{ gap: 8, background: FIELDBG, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '8px 10px' }}>
          <button aria-label={t('g_color')} onClick={() => onOpenColor(f)} style={{ width: 15, height: 15, borderRadius: '50%', flex: '0 0 auto', cursor: 'pointer', border: '1px solid rgba(255,255,255,.2)', background: dotBg(f) }} />
          <input ref={(el) => { inputRefs.current[f] = el; }} value={val} onChange={(e) => typeText(f, e.target.value)} placeholder={t('g_text_ph')} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: TXT, fontSize: 13 }} />
        </div>
        {f === 'kaomoji' && (
          <select value={KAOMOJI.includes(val) ? val : ''} onChange={(e) => { if (e.target.value) setFieldValue('kaomoji', e.target.value); }} style={{ width: '100%', marginTop: 6, background: FIELDBG, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '8px 10px', color: TXT, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            <option value="">{t('kaomoji')} …</option>
            {KAOMOJI.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        )}
        {withControls && mainControls(f)}
      </div>
    );
  };

  const decoDropdown = (f: 'dekoTop' | 'dekoBottom') => {
    const val = state.text[f];
    const presets = DECO_PRESETS[f] || [];
    return (
      <div style={{ marginBottom: 11 }}>
        <div style={{ ...labelStyle, marginBottom: 6 }}>{fieldLabel(f)}</div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <select value={val} onChange={(e) => setFieldValue(f, e.target.value)} style={{ flex: 1, minWidth: 0, background: FIELDBG, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '9px 10px', color: TXT, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            <option value="">{t('g_none')}</option>
            {val !== '' && !presets.includes(val) && <option value={val}>{val}</option>}
            {presets.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {HAS_STAR.includes(f) && pill('★', () => toggleStar(f as 'dekoTop'), state.stars[f as 'dekoTop'])}
        </div>
      </div>
    );
  };

  const qa = (icon: React.ReactNode, label: string, onClick: () => void) => (
    <button onClick={onClick} className="flex items-center" style={{ gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '10px 11px', fontSize: 12.5, color: TXT, cursor: 'pointer' }}>
      {icon}{label}
    </button>
  );

  const layoutPreview = (l: Layout) => {
    const bar = (w: string, c = '#5a5570') => <span style={{ display: 'block', height: 4, width: w, borderRadius: 2, background: c }} />;
    let bars: React.ReactNode;
    if (l === 'pyramid') bars = <>{bar('22%', '#f3c24f')}{bar('45%', '#f3c24f')}{bar('70%', '#f3c24f')}</>;
    else if (l === 'sparkle') bars = <>{bar('40%', '#ff7ad9')}{bar('70%', PINK)}{bar('40%', '#ff7ad9')}</>;
    else if (l === 'heart') bars = <>{bar('45%', '#ff4d8c')}{bar('65%', PINK)}{bar('45%', '#ff4d8c')}</>;
    else if (l === 'inline') bars = <>{bar('46%')}{bar('80%', PINK)}</>;
    else if (l === 'custom') bars = <span className="mono" style={{ fontSize: 12, color: MUTED }}>{'</>'}</span>;
    else bars = <>{bar('50%')}{bar('70%', PINK)}{bar('40%')}</>;
    return bars;
  };

  const header = (
    <div className="flex items-center" style={{ gap: 8 }}>
      <Sparkles size={16} style={{ color: PINK }} />
      <span style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#cdb8d8' }}>{t('g_customize')}</span>
      <button onClick={randomize} aria-label={t('g_randomize')} title={t('g_randomize')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
        <Wand2 size={15} />
      </button>
    </div>
  );

  const tabBar = (
    <div className="flex" style={{ gap: 4, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 4 }}>
      {tabBtn('text', <Type size={15} />, t('g_tab_text'))}
      {tabBtn('deco', <Sparkles size={15} />, t('g_tab_deco'))}
      {tabBtn('layout', <LayoutGrid size={15} />, t('layout'))}
      {tabBtn('colors', <Palette size={15} />, t('g_tab_colors'))}
    </div>
  );

  const textFields: FieldId[] = state.layout === 'pyramid' ? FIELDS : ['topText', 'mainText', 'bottomText', 'kaomoji'];

  const textTab = state.layout === 'custom' ? (
    <CustomEditor value={state.customText} commit={commit} />
  ) : (
    <>
      {textFields.map((f) => lineRow(f, true))}
      {state.layout !== 'pyramid' && (<>{decoDropdown('dekoTop')}{decoDropdown('dekoBottom')}</>)}

      <div style={{ marginBottom: 14 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>{t('g_quick_actions')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {qa(<Wand2 size={16} style={{ color: PINK }} />, t('g_randomize'), randomize)}
          {qa(<Trash2 size={16} style={{ color: '#ff6b6b' }} />, t('g_clear_all'), clearAll)}
          {qa(<Download size={16} style={{ color: '#57c7e0' }} />, t('g_import'), importGift)}
          {qa(<Upload size={16} style={{ color: '#57c7e0' }} />, t('g_export'), exportGift)}
        </div>
        {flash && <div style={{ fontSize: 11, color: PINK, marginTop: 6 }}>{flash}</div>}
      </div>

      <div className="flex items-center" style={{ gap: 10, background: '#120f1c', border: `1px solid ${BORDER}`, borderRadius: 11, padding: '11px 12px' }}>
        <Lightbulb size={16} style={{ color: '#f3c24f', flex: '0 0 auto' }} />
        <span style={{ fontSize: 12, color: '#b8b2c8' }}>{t('g_tip')}</span>
        <Heart size={16} style={{ marginLeft: 'auto', color: PINK, flex: '0 0 auto' }} />
      </div>
    </>
  );

  const decoTab = (
    <>
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>{t('fl_dekoTop')}</div>
        <div className="flex flex-wrap" style={{ gap: 6 }}>{(DECO_PRESETS.dekoTop || []).map((p) => pill(p, () => setFieldValue('dekoTop', p)))}</div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>{t('fl_dekoBottom')}</div>
        <div className="flex flex-wrap" style={{ gap: 6 }}>{(DECO_PRESETS.dekoBottom || []).map((p) => pill(p, () => setFieldValue('dekoBottom', p)))}</div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...labelStyle, marginBottom: 8 }}>{t('plus_symbol')}</div>
        <div className="flex flex-wrap" style={{ gap: 6 }}>{SYMBOLS.map((s) => pill(s, () => appendSym('dekoTop', s)))}</div>
      </div>
      <div>
        <div style={{ ...labelStyle, marginBottom: 8 }}>{t('kaomoji')}</div>
        <div className="flex flex-wrap" style={{ gap: 6 }}>{KAOMOJI.map((k) => pill(k, () => setFieldValue('kaomoji', k)))}</div>
      </div>
    </>
  );

  const layoutTab = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {LAYOUTS.map((l) => {
        const active = state.layout === l;
        return (
          <button key={l} onClick={() => onSetLayout(l)} style={{ textAlign: 'left', border: `1px solid ${active ? BORDER_ON : BORDER}`, background: active ? 'rgba(225,92,158,.08)' : CARD, borderRadius: 10, padding: 10, cursor: 'pointer', boxShadow: active ? '0 0 14px rgba(225,92,158,.16)' : 'none' }}>
            <div style={{ fontSize: 12, color: active ? '#fff' : '#c9c3da', marginBottom: 8 }}>{t('layout_' + l)}</div>
            <div className="flex flex-col items-center" style={{ gap: 3, minHeight: 22, justifyContent: 'center' }}>{layoutPreview(l)}</div>
          </button>
        );
      })}
    </div>
  );

  const colorsTab = (
    <>
      <div style={{ ...labelStyle, marginBottom: 8 }}>{t('g_per_line')}</div>
      <div className="flex flex-col" style={{ gap: 7 }}>
        {FIELDS.map((f) => (
          <button key={f} onClick={() => onOpenColor(f)} className="flex items-center justify-between" style={{ background: FIELDBG, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '9px 11px', cursor: 'pointer' }}>
            <span style={{ fontSize: 12.5, color: '#b8b2c8' }}>{fieldLabel(f)}</span>
            <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: dotBg(f) }} />
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex flex-col overflow-y-auto" style={{ paddingRight: 4, scrollbarGutter: 'stable' }}>
      <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {header}
        {tabBar}
        {tab === 'text' && textTab}
        {tab === 'deco' && decoTab}
        {tab === 'layout' && layoutTab}
        {tab === 'colors' && colorsTab}
      </div>
    </div>
  );
}
