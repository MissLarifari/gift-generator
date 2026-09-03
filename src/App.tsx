import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LayoutGrid, Gift, SlidersHorizontal, X } from 'lucide-react';
import { generate } from './engine';
import { DEFAULT_SIZES } from './engine';
import type { FieldId, Layout } from './engine';
import { createDefaultState, editorSectionOf, favKey, FIELDS, LAYOUT_DEFAULTS } from './state';
import { readShareFromUrl, clearShareHash } from './share';
import { useHistory } from './useHistory';
import { useIsMobile } from './useIsMobile';
import { useI18n } from './i18n';
import Topbar from './components/Topbar';
import EditorPanel, { type FocusRequest } from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import TemplatesPanel, { type TplCategory, type TplItem } from './components/TemplatesPanel';
import ColorPickerOverlay, { type ColorState } from './components/ColorPickerOverlay';
import AboutModal from './components/AboutModal';

const INTRO_KEY = 'gifty_intro_seen';

// Tiny first-visit hint: pick → customize → copy. Dismissed for good.
function IntroBar({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const steps = [t('g_intro_1'), t('g_intro_2'), t('g_intro_3')];
  return (
    <div
      className="flex items-center shrink-0"
      style={{ gap: 16, padding: '9px 16px', borderBottom: '1px solid var(--border)', background: 'var(--panel)', flexWrap: 'wrap' }}
    >
      {steps.map((s, i) => (
        <span key={s} className="flex items-center" style={{ gap: 7, fontSize: 12, color: 'var(--muted)' }}>
          <span className="mono" style={{ display: 'grid', placeItems: 'center', width: 18, height: 18, borderRadius: 5, background: 'var(--card)', border: '1px solid var(--border)', fontSize: 10, color: 'var(--accent)' }}>{i + 1}</span>
          {s}
        </span>
      ))}
      <button className="icon-btn" style={{ marginLeft: 'auto', width: 24, height: 24 }} onClick={onClose} aria-label={t('g_got_it')} title={t('g_got_it')}>
        <X size={14} />
      </button>
    </div>
  );
}

export default function App() {
  const { t } = useI18n();
  const { state, commit, undo, redo, reset, canUndo, canRedo } = useHistory(readShareFromUrl() ?? createDefaultState());
  const result = useMemo(() => generate(state), [state]);
  const [colorField, setColorField] = useState<FieldId | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<'templates' | 'preview' | 'edit'>('preview');
  const [showIntro, setShowIntro] = useState(() => {
    try { return !localStorage.getItem(INTRO_KEY); } catch { return false; }
  });
  const dismissIntro = useCallback(() => {
    setShowIntro(false);
    try { localStorage.setItem(INTRO_KEY, '1'); } catch { /* ignore */ }
  }, []);

  // A focus request the editor consumes to reveal the section a field lives in
  // (nonce retriggers even for the same field). On mobile it also jumps to the
  // Edit tab so tapping a preview line lands on a real, keyboard-ready input.
  // On desktop text lines edit inline in the preview, so the editor only
  // highlights the matching input; deco lines have no inline editor and hand
  // off fully (open the Decoration section + focus its dropdown).
  const focusNonce = useRef(0);
  const [focusReq, setFocusReq] = useState<FocusRequest | null>(null);
  const focusField = useCallback((f: FieldId) => {
    if (isMobile) setMobileTab('edit');
    focusNonce.current += 1;
    setFocusReq({ f, n: focusNonce.current, focus: isMobile || editorSectionOf(state.layout, f) === 'deco' });
  }, [isMobile, state.layout]);

  // A shared gift is loaded once into history; clear the hash so editing isn't pinned to it.
  useEffect(() => { clearShareHash(); }, []);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('gifty_favs') || '[]'); } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem('gifty_favs', JSON.stringify(favorites)); } catch { /* ignore */ }
  }, [favorites]);
  const toggleFav = useCallback((cat: TplCategory, item: TplItem) => {
    const k = favKey(cat.label, item.l);
    setFavorites((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));
  }, []);

  // Ctrl/Cmd+Z undo, Ctrl+Y / Ctrl+Shift+Z redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const applyColor = (f: FieldId, cs: ColorState) =>
    commit((s) => ({
      ...s,
      colors: { ...s.colors, [f]: cs.color },
      noColor: { ...s.noColor, [f]: cs.noColor },
      grads: { ...s.grads, [f]: { ...s.grads[f], on: cs.gradient, c1: cs.c1, c2: cs.c2, rainbow: false } },
    }));

  // Picking a layout loads its preset while pristine (text still matches the current
  // layout's preset); once edited, it only changes the join mode + line order.
  const setLayout = (l: Layout) =>
    commit((s) => {
      // custom starts empty — no pre-fill, no auto-preview
      if (l === 'custom') return { ...s, layout: 'custom' };
      const d = LAYOUT_DEFAULTS[l];
      const curD = LAYOUT_DEFAULTS[s.layout];
      const pristine = !!curD && FIELDS.every((f) => s.text[f] === curD.text[f]);
      if (pristine) {
        const base = createDefaultState();
        return {
          ...base,
          text: { ...d.text },
          fonts: { ...base.fonts, ...(d.fonts ?? {}) },
          sizes: { ...base.sizes, ...(d.sizes ?? {}) },
          colors: { ...base.colors, ...(d.colors ?? {}) },
          noColor: { ...base.noColor, ...(d.noColor ?? {}) },
          layout: l,
          lineOrder: d.lineOrder ? [...d.lineOrder] : [...base.lineOrder],
        };
      }
      return { ...s, layout: l, lineOrder: d.lineOrder ? [...d.lineOrder] : s.lineOrder };
    });

  const applyTemplate = (cat: TplCategory, item: TplItem) =>
    commit((s) => {
      const t = cat.theme;
      const text = { ...s.text, mainText: item.main, topText: item.top, bottomText: item.bottom };
      if (t.deco.dekoTop != null) text.dekoTop = t.deco.dekoTop;
      if (t.deco.dekoBottom != null) text.dekoBottom = t.deco.dekoBottom;
      if (t.deco.kaomoji != null) text.kaomoji = t.deco.kaomoji;
      const colors = { ...s.colors, mainText: t.mainColor, topText: t.topColor, bottomText: t.botColor, ...t.decoColors };
      const grads = {
        ...s.grads,
        mainText: t.mainGrad ? { on: true, c1: t.mainGrad.c1, c2: t.mainGrad.c2, rainbow: t.mainGrad.rainbow } : { ...s.grads.mainText, on: false, rainbow: false },
      };
      const fonts = t.mainGrad?.rainbow
        ? { ...s.fonts, topText: 'normal' as const, mainText: 'normal' as const, bottomText: 'normal' as const }
        : { ...s.fonts, topText: 'normal' as const, mainText: 'normal' as const, bottomText: 'normal' as const, ...t.fonts };
      const noColor = { ...s.noColor, mainText: false, topText: false, bottomText: false, ...t.noColor };
      const sizes = { ...s.sizes, topText: DEFAULT_SIZES.topText, mainText: DEFAULT_SIZES.mainText, bottomText: DEFAULT_SIZES.bottomText, ...t.sizes };
      return { ...s, text, colors, grads, fonts, noColor, sizes };
    });

  const colorInitial: ColorState = colorField
    ? { noColor: state.noColor[colorField], gradient: state.grads[colorField].on, color: state.colors[colorField], c1: state.grads[colorField].c1, c2: state.grads[colorField].c2 }
    : { noColor: false, gradient: false, color: '#ffffff', c1: '#ff71b8', c2: '#b388ff' };

  const editorPanel = <EditorPanel state={state} commit={commit} onOpenColor={setColorField} onSetLayout={setLayout} focusReq={focusReq} />;
  const previewPanel = <PreviewPanel state={state} result={result} commit={commit} onReset={() => reset(createDefaultState())} onFocusField={focusField} isMobile={isMobile} />;
  const templatesPanel = <TemplatesPanel onApply={(c, i) => { applyTemplate(c, i); if (isMobile) setMobileTab('preview'); }} favorites={favorites} onToggleFav={toggleFav} />;

  const mobileTabBtn = (id: 'templates' | 'preview' | 'edit', icon: ReactNode, label: string) => (
    <button
      onClick={() => setMobileTab(id)}
      className="flex flex-col items-center justify-center"
      style={{ gap: 3, padding: '9px 0', fontSize: 10.5, fontWeight: 500, cursor: 'pointer', background: 'transparent', border: 'none', borderTop: `2px solid ${mobileTab === id ? 'var(--accent)' : 'transparent'}`, color: mobileTab === id ? 'var(--text)' : 'var(--muted)' }}
    >
      {icon}{label}
    </button>
  );

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      <Topbar undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} onAbout={() => setAboutOpen(true)} compact={isMobile} />
      {showIntro && <IntroBar onClose={dismissIntro} />}

      {isMobile ? (
        <>
          <div className="flex-1 min-h-0 scroll-y" style={{ padding: 10 }}>
            <div style={{ display: mobileTab === 'templates' ? 'block' : 'none', height: '100%' }}>{templatesPanel}</div>
            <div style={{ display: mobileTab === 'preview' ? 'block' : 'none' }}>{previewPanel}</div>
            <div style={{ display: mobileTab === 'edit' ? 'block' : 'none', height: '100%' }}>{editorPanel}</div>
          </div>
          <nav className="shrink-0 grid grid-cols-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--panel)' }}>
            {mobileTabBtn('templates', <LayoutGrid size={17} />, t('g_tab_templates'))}
            {mobileTabBtn('preview', <Gift size={17} />, t('preview'))}
            {mobileTabBtn('edit', <SlidersHorizontal size={17} />, t('g_tab_edit'))}
          </nav>
        </>
      ) : (
        <main
          className="flex-1 min-h-0 grid"
          // The side columns may shrink so the preview never starves on a narrow
          // desktop (the breakpoint starts at 860px).
          style={{ gridTemplateColumns: 'minmax(236px, 298px) minmax(320px, 1fr) minmax(262px, 316px)', gap: 14, padding: 14 }}
        >
          {templatesPanel}
          {previewPanel}
          {editorPanel}
        </main>
      )}

      <ColorPickerOverlay
        open={!!colorField}
        fieldLabel={colorField ? t((state.layout === 'pyramid' ? 'pyr_' : 'fl_') + colorField) : ''}
        initial={colorInitial}
        onClose={() => setColorField(null)}
        onApply={(cs) => {
          if (colorField) applyColor(colorField, cs);
          setColorField(null);
        }}
      />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
