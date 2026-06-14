import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LayoutGrid, Gift, SlidersHorizontal } from 'lucide-react';
import { generate } from './engine';
import type { FieldId, Layout } from './engine';
import { createDefaultState, favKey, FIELDS, LAYOUT_DEFAULTS } from './state';
import { readShareFromUrl, clearShareHash } from './share';
import { useHistory } from './useHistory';
import { useIsMobile } from './useIsMobile';
import { useI18n } from './i18n';
import Topbar from './components/Topbar';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import TemplatesPanel, { type TplCategory, type TplItem } from './components/TemplatesPanel';
import ColorPickerOverlay, { type ColorState } from './components/ColorPickerOverlay';

export default function App() {
  const { t } = useI18n();
  const { state, commit, undo, redo, reset, canUndo, canRedo } = useHistory(readShareFromUrl() ?? createDefaultState());
  const result = useMemo(() => generate(state), [state]);
  const [colorField, setColorField] = useState<FieldId | null>(null);
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<'templates' | 'preview' | 'edit'>('preview');
  // Which lines are "open" in the editor (multi-open accordion) — shared so editing
  // the middle opens that line on the left, and Expand/Collapse all toggles every card.
  const [openFields, setOpenFields] = useState<FieldId[]>(['mainText']);
  const focusField = useCallback((f: FieldId) => {
    setOpenFields((prev) => (prev.includes(f) ? prev : [...prev, f]));
  }, []);

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
      const colors = { ...s.colors, mainText: t.mainColor, topText: t.topColor, bottomText: t.botColor };
      const grads = {
        ...s.grads,
        mainText: t.mainGrad ? { on: true, c1: t.mainGrad.c1, c2: t.mainGrad.c2, rainbow: t.mainGrad.rainbow } : { ...s.grads.mainText, on: false, rainbow: false },
      };
      const fonts = t.mainGrad?.rainbow ? { ...s.fonts, topText: 'normal' as const, mainText: 'normal' as const, bottomText: 'normal' as const } : s.fonts;
      const noColor = { ...s.noColor, mainText: false, topText: false, bottomText: false };
      return { ...s, text, colors, grads, fonts, noColor };
    });

  const colorInitial: ColorState = colorField
    ? { noColor: state.noColor[colorField], gradient: state.grads[colorField].on, color: state.colors[colorField], c1: state.grads[colorField].c1, c2: state.grads[colorField].c2 }
    : { noColor: false, gradient: false, color: '#ffffff', c1: '#ff71b8', c2: '#b388ff' };

  return (
    <div className="relative h-full">
      <div className="sky" />
      <div className="cloud" style={{ width: 230, height: 120, background: 'rgba(255,255,255,.08)', bottom: -40, left: -50 }} />
      <div className="cloud" style={{ width: 200, height: 100, background: 'rgba(255,122,217,.10)', top: 120, right: -50 }} />
      <div className="cloud" style={{ width: 160, height: 80, background: 'rgba(120,220,255,.09)', bottom: 60, left: '46%' }} />

      <div className="relative z-10 h-full flex flex-col">
        <Topbar result={result} undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} compact={isMobile} />
        {(() => {
          const editorPanel = <EditorPanel state={state} commit={commit} onOpenColor={setColorField} open={openFields} setOpen={setOpenFields} onSetLayout={setLayout} />;
          const previewPanel = <PreviewPanel state={state} result={result} commit={commit} onReset={() => reset(createDefaultState())} onFocusField={focusField} />;
          const templatesPanel = <TemplatesPanel onApply={(c, i) => { applyTemplate(c, i); if (isMobile) setMobileTab('preview'); }} favorites={favorites} onToggleFav={toggleFav} />;

          if (isMobile) {
            const tab = (id: 'templates' | 'preview' | 'edit', icon: ReactNode, label: string) => (
              <button onClick={() => setMobileTab(id)} className="flex flex-col items-center justify-center gap-[2px]" style={{ padding: '8px 0', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', background: mobileTab === id ? 'rgba(87,224,240,.08)' : 'transparent', border: 'none', borderTop: `2px solid ${mobileTab === id ? 'var(--ind)' : 'transparent'}`, color: mobileTab === id ? 'var(--ind)' : 'var(--muted)' }}>
                {icon}{label}
              </button>
            );
            return (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: 10 }}>
                  <div style={{ display: mobileTab === 'templates' ? 'block' : 'none' }}>{templatesPanel}</div>
                  <div style={{ display: mobileTab === 'preview' ? 'block' : 'none' }}>{previewPanel}</div>
                  <div style={{ display: mobileTab === 'edit' ? 'block' : 'none' }}>{editorPanel}</div>
                </div>
                <nav className="shrink-0 grid grid-cols-3" style={{ borderTop: '1px solid var(--border)', background: 'rgba(13,20,48,.85)', backdropFilter: 'blur(8px)' }}>
                  {tab('templates', <LayoutGrid size={18} />, t('g_tab_templates'))}
                  {tab('preview', <Gift size={18} />, t('preview'))}
                  {tab('edit', <SlidersHorizontal size={18} />, t('g_tab_edit'))}
                </nav>
              </>
            );
          }

          return (
            <>
              <div className="grid" style={{ gridTemplateColumns: '296px 1fr 322px', gap: 13, padding: 14, height: 'calc(100% - 56px - 30px)' }}>
                {editorPanel}
                {previewPanel}
                {templatesPanel}
              </div>
              <footer className="shrink-0 flex items-center justify-center text-center" style={{ height: 30, padding: '0 14px', borderTop: '1px solid var(--border)', background: 'rgba(6,9,18,.4)', fontSize: 10.5, color: 'var(--dim)', letterSpacing: '.2px' }}>
                {t('g_disclaimer')}
              </footer>
            </>
          );
        })()}
      </div>

      <ColorPickerOverlay
        open={!!colorField}
        fieldLabel={colorField ? t('fl_' + colorField) : ''}
        initial={colorInitial}
        onClose={() => setColorField(null)}
        onApply={(cs) => {
          if (colorField) applyColor(colorField, cs);
          setColorField(null);
        }}
      />
    </div>
  );
}
