import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Type, Palette, LayoutGrid, Wand2, Trash2, Download, Upload, ChevronRight, Sparkles } from 'lucide-react';
import type { GiftState, FieldId, Layout, FontStyle } from '../engine';
import { FIELDS, LAYOUTS, FONT_STYLES, HAS_BOLD_ITALIC, HAS_STAR, HAS_FONT, DECO_PRESETS, SYMBOLS, KAOMOJI, type Commit } from '../state';
import { buildShareUrl, decodeState } from '../share';
import { TEMPLATE_CATEGORIES } from '../data/templates';
import { useI18n } from '../i18n';
import CustomEditor from './CustomEditor';

// Customization sidebar — the same controls as before, regrouped into four
// collapsible sections (Text / Style / Decoration / Layout) so the important
// ones sit on top. Every handler drives the existing GiftState via `commit`;
// no engine or state-shape change.
const BIKEY: Record<string, 'top' | 'main' | 'bottom'> = { topText: 'top', mainText: 'main', bottomText: 'bottom' };
const LINE_LIMIT = 46;

type Section = 'text' | 'style' | 'deco' | 'layout';

// Style targets, most-used first (FIELDS is in render order, which buries the main text).
const STYLE_TARGETS: FieldId[] = ['mainText', 'topText', 'bottomText', 'dekoTop', 'kaomoji', 'dekoBottom'];

// Module scope on purpose: picking at random is impure, so it must not sit in the
// component body where the react-hooks lint treats it as render-time work.
function pickRandomTemplate() {
  const cat = TEMPLATE_CATEGORIES[Math.floor(Math.random() * TEMPLATE_CATEGORIES.length)];
  const item = cat.items[Math.floor(Math.random() * cat.items.length)];
  return { cat, item };
}

export default function EditorPanel(props: {
  state: GiftState;
  commit: Commit;
  onOpenColor: (f: FieldId) => void;
  onSetLayout: (l: Layout) => void;
  focusReq?: { f: FieldId; n: number } | null;
}) {
  const { state, commit, onOpenColor, onSetLayout, focusReq } = props;
  const { t } = useI18n();
  const [open, setOpen] = useState<Record<Section, boolean>>({ text: true, style: false, deco: false, layout: true });
  const [styleTarget, setStyleTarget] = useState<FieldId>('mainText');
  const [flash, setFlash] = useState('');
  const fieldRefs = useRef<Partial<Record<FieldId, HTMLElement | null>>>({});

  const fieldLabel = (f: FieldId) => (state.layout === 'pyramid' ? t('pyr_' + f) : t('fl_' + f));
  const toggleSection = (s: Section) => setOpen((o) => ({ ...o, [s]: !o[s] }));

  // Which section a field's control lives in (used by the mobile hand-off).
  const sectionOf = (f: FieldId): Section =>
    state.layout === 'pyramid' || f === 'mainText' || f === 'topText' || f === 'bottomText' ? 'text' : 'deco';

  // Tapping a preview line (mobile) asks the editor to reveal + focus that field.
  useEffect(() => {
    if (!focusReq) return;
    const sec = sectionOf(focusReq.f);
    setOpen((o) => ({ ...o, [sec]: true }));
    requestAnimationFrame(() => {
      const el = fieldRefs.current[focusReq.f];
      if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const { cat, item } = pickRandomTemplate();
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
    if (state.noColor[f]) return 'repeating-conic-gradient(#3a4049 0% 25%, transparent 0% 50%) 50% / 8px 8px';
    if (g.on || g.rainbow) return `linear-gradient(90deg, ${g.rainbow ? '#ffadad' : g.c1}, ${g.rainbow ? '#bdb2ff' : g.c2})`;
    return state.colors[f];
  };

  /* ---------- section shell ---------- */

  const section = (id: Section, icon: ReactNode, label: string, children: ReactNode) => (
    <div className="sec">
      <button className="sec-head" data-open={open[id]} onClick={() => toggleSection(id)} aria-expanded={open[id]}>
        <ChevronRight size={14} style={{ flex: '0 0 auto', transform: open[id] ? 'rotate(90deg)' : 'none', transition: 'transform .14s ease' }} />
        {icon}
        <span className="sec-label" style={{ color: 'inherit' }}>{label}</span>
      </button>
      {open[id] && <div className="sec-body">{children}</div>}
    </div>
  );

  /* ---------- TEXT ---------- */

  const lineRow = (f: FieldId) => {
    const val = state.text[f];
    const len = [...val].length;
    return (
      <div key={f} style={{ marginBottom: 11 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
          <span className="sec-label" style={{ fontSize: 10 }}>{fieldLabel(f)}</span>
          <span className="mono" style={{ fontSize: 10, color: len > LINE_LIMIT ? 'var(--danger)' : 'var(--dim)' }}>{len}/{LINE_LIMIT}</span>
        </div>
        <div className="field">
          <button className="swatch" aria-label={t('g_color')} title={t('g_color')} onClick={() => onOpenColor(f)} style={{ background: dotBg(f) }} />
          <input
            ref={(el) => { fieldRefs.current[f] = el; }}
            value={val}
            onChange={(e) => typeText(f, e.target.value)}
            placeholder={t('g_text_ph')}
            aria-label={fieldLabel(f)}
          />
        </div>
      </div>
    );
  };

  const textFields: FieldId[] = state.layout === 'pyramid' ? FIELDS : ['mainText', 'topText', 'bottomText'];
  const textSection = state.layout === 'custom'
    ? <CustomEditor value={state.customText} commit={commit} />
    : <div style={{ marginBottom: -11 }}>{textFields.map((f) => lineRow(f))}</div>;

  /* ---------- STYLE ---------- */

  const f = styleTarget;
  const styleSection = (
    <>
      <div className="sec-label" style={{ fontSize: 10, marginBottom: 7 }}>{t('g_style_target')}</div>
      <div className="flex flex-wrap" style={{ gap: 5, marginBottom: 14 }}>
        {STYLE_TARGETS.map((id) => (
          <button key={id} className="chip" data-on={styleTarget === id} onClick={() => setStyleTarget(id)} style={{ fontSize: 11, padding: '4px 9px' }}>
            {fieldLabel(id)}
          </button>
        ))}
      </div>

      {HAS_FONT.includes(f) && (
        <>
          <div className="sec-label" style={{ fontSize: 10, marginBottom: 7 }}>{t('g_font')}</div>
          <div className="flex flex-wrap" style={{ gap: 5, marginBottom: 14 }}>
            {FONT_STYLES.map((fs) => (
              <button key={fs.id} className="tog" data-on={state.fonts[f] === fs.id} onClick={() => setFont(f, fs.id as FontStyle)} title={fs.id}>
                {fs.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between" style={{ gap: 10, marginBottom: 14 }}>
        <span className="sec-label" style={{ fontSize: 10 }}>{t('g_font_size')}</span>
        <input className="num" type="number" value={state.sizes[f]} onChange={(e) => setSize(f, parseInt(e.target.value) || 0)} aria-label={t('g_font_size')} />
      </div>

      {(HAS_BOLD_ITALIC.includes(f) || HAS_STAR.includes(f)) && (
        <div className="flex" style={{ gap: 5, marginBottom: 14 }}>
          {HAS_BOLD_ITALIC.includes(f) && (
            <>
              <button className="tog" data-on={state.bold[BIKEY[f]]} onClick={() => toggleBI(f, 'bold')} style={{ fontWeight: 700 }} title="Bold">B</button>
              <button className="tog" data-on={state.italic[BIKEY[f]]} onClick={() => toggleBI(f, 'italic')} style={{ fontStyle: 'italic' }} title="Italic">I</button>
            </>
          )}
          {HAS_STAR.includes(f) && (
            <button className="tog" data-on={state.stars[f as 'dekoTop']} onClick={() => toggleStar(f as 'dekoTop')} title="* … *">★</button>
          )}
        </div>
      )}

      <button className="btn btn-sm" onClick={() => onOpenColor(f)} style={{ width: '100%', justifyContent: 'flex-start' }}>
        <span className="swatch" style={{ background: dotBg(f) }} /> {t('g_color')}
      </button>
    </>
  );

  /* ---------- DECORATION ---------- */

  const decoSelect = (id: 'dekoTop' | 'dekoBottom') => {
    const val = state.text[id];
    const presets = DECO_PRESETS[id] || [];
    return (
      <div style={{ marginBottom: 12 }}>
        <div className="sec-label" style={{ fontSize: 10, marginBottom: 6 }}>{t('fl_' + id)}</div>
        <select
          ref={(el) => { fieldRefs.current[id] = el; }}
          className="select"
          value={val}
          onChange={(e) => setFieldValue(id, e.target.value)}
          aria-label={t('fl_' + id)}
        >
          <option value="">{t('g_none')}</option>
          {val !== '' && !presets.includes(val) && <option value={val}>{val}</option>}
          {presets.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    );
  };

  const kaoVal = state.text.kaomoji;
  const decoSection = (
    <>
      {decoSelect('dekoTop')}

      <div style={{ marginBottom: 12 }}>
        <div className="sec-label" style={{ fontSize: 10, marginBottom: 6 }}>{t('fl_kaomoji')}</div>
        <select
          ref={(el) => { fieldRefs.current.kaomoji = el; }}
          className="select"
          value={KAOMOJI.includes(kaoVal) ? kaoVal : kaoVal === '' ? '' : '__own'}
          onChange={(e) => { if (e.target.value !== '__own') setFieldValue('kaomoji', e.target.value); }}
          aria-label={t('fl_kaomoji')}
        >
          <option value="">{t('g_none')}</option>
          {kaoVal !== '' && !KAOMOJI.includes(kaoVal) && <option value="__own">{kaoVal}</option>}
          {KAOMOJI.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {decoSelect('dekoBottom')}

      <div className="sec-label" style={{ fontSize: 10, margin: '16px 0 7px' }}>{t('plus_symbol')}</div>
      <div className="flex flex-wrap" style={{ gap: 5 }}>
        {SYMBOLS.map((s) => (
          <button key={s} className="tog" onClick={() => appendSym('dekoTop', s)} title={t('fl_dekoTop')} style={{ minWidth: 28, height: 26, padding: '0 7px' }}>{s}</button>
        ))}
      </div>
    </>
  );

  /* ---------- LAYOUT ---------- */

  // Rough thumbnail of where the text lands, per layout.
  const layoutThumb = (l: Layout) => {
    const bar = (k: string, w: string, main = false) => <span key={k} className={'lay-bar' + (main ? ' lay-bar-main' : '')} style={{ width: w }} />;
    const dot = (k: string) => <span key={k} style={{ width: 3, height: 3, borderRadius: '50%', background: '#4a515c' }} />;
    const dots = (k: string) => (
      <span key={k} className="flex items-center" style={{ gap: 3 }}>
        {[0, 1, 2].map((i) => dot(k + i))}
      </span>
    );
    switch (l) {
      case 'inline':
        return <>{bar('a', '74%', true)}{bar('b', '44%')}</>;
      case 'pyramid':
        return <>{bar('a', '18%')}{bar('b', '38%')}{bar('c', '58%')}{bar('d', '72%', true)}</>;
      case 'sparkle':
        return <>{dots('a')}{bar('b', '64%', true)}{dots('c')}</>;
      case 'heart':
        return (
          <>
            {dots('a')}
            <span key="mid" className="flex items-center" style={{ gap: 4 }}>
              {dot('l')}
              {bar('m', '46px', true)}
              {dot('r')}
            </span>
            {dots('c')}
          </>
        );
      case 'custom':
        return <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>{'</>'}</span>;
      default:
        return <>{bar('a', '40%')}{bar('b', '66%', true)}{bar('c', '40%')}</>;
    }
  };

  const layoutSection = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
      {LAYOUTS.map((l) => (
        <button key={l} className="lay" data-on={state.layout === l} onClick={() => onSetLayout(l)}>
          <span className="lay-canvas">{layoutThumb(l)}</span>
          <span style={{ fontSize: 11.5, color: state.layout === l ? 'var(--text)' : 'var(--muted)' }}>{t('layout_' + l)}</span>
        </button>
      ))}
    </div>
  );

  /* ---------- panel ---------- */

  const quick = (icon: ReactNode, label: string, onClick: () => void) => (
    <button className="btn btn-sm btn-ghost" onClick={onClick} title={label} style={{ minWidth: 0, padding: '6px 8px', fontSize: 11.5, justifyContent: 'flex-start' }}>
      {icon}<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </button>
  );

  return (
    <section className="panel flex flex-col" style={{ minHeight: 0, overflow: 'hidden' }}>
      <div className="scroll-y" style={{ flex: 1, minHeight: 0 }}>
        {section('text', <Type size={14} />, t('g_sec_text'), textSection)}
        {state.layout !== 'custom' && section('style', <Palette size={14} />, t('g_sec_style'), styleSection)}
        {state.layout !== 'custom' && section('deco', <Sparkles size={14} />, t('g_sec_deco'), decoSection)}
        {section('layout', <LayoutGrid size={14} />, t('g_sec_layout'), layoutSection)}
      </div>

      <div className="shrink-0" style={{ borderTop: '1px solid var(--border)', padding: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {quick(<Wand2 size={13} />, t('g_randomize'), randomize)}
          {quick(<Trash2 size={13} />, t('g_clear_all'), clearAll)}
          {quick(<Download size={13} />, t('g_import'), importGift)}
          {quick(<Upload size={13} />, t('g_export'), exportGift)}
        </div>
        {flash && <div style={{ fontSize: 11, color: 'var(--accent)', textAlign: 'center', marginTop: 6 }}>{flash}</div>}
      </div>
    </section>
  );
}
