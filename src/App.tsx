import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Code2, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import Header from './components/Header';
import Shelf from './components/Shelf';
import Editor, { type EditorHandle } from './components/Editor';
import Preview from './components/Preview';
import Actions, { ThankYou } from './components/Actions';
import About from './components/About';
import Guestbook from './components/Guestbook';
import EditorPanel, { type FocusRequest } from './components/EditorPanel';
import ColorPickerOverlay, { type ColorState } from './components/ColorPickerOverlay';
import { generate, stripTags, type GiftState, type FieldId } from './engine';
import { composeTemplate, type TplCategory, type TplItem } from './data/templates';
import { LOOKS, composeLook, lookIdOf, type Look } from './data/looks';
import { moveCodeLine, canReorderLines } from './engine';
import { createDefaultState, type Commit } from './state';
import { useHistory } from './useHistory';
import { readShareCodeFromUrl, clearShareHash } from './share';
import { useI18n } from './i18n';

// Rebuilt 2026-09-05 around the way the 3dxchat tool works, which is the way
// Lari already works:
//   left   — the shelf of ready-made gifts, folded to a tab until wanted
//   middle — the editor: the real code, with the tool column beside it
//   right  — the gift as the recipient will see it
//
// The code in the box is the single source of truth. Templates and looks still
// compose a structured gift, but only to PRINT it into the box; nothing reads
// the structure back. That is what lets a finished gift be pasted in from the
// game and edited like anything else.

const MODE_KEY = 'gifty_edit_mode';
const VIEW_KEY = 'gifty_preview_plain';
const INTRO_KEY = 'gifty_seen_intro';

/**
 * Beim ersten Besuch geht das Blatt von selbst auf — sonst steht man vor einem
 * Werkzeug, ohne zu wissen wofuer es da ist. Wegklicken merkt es sich; wer es
 * wieder braucht, hat das Fragezeichen oben.
 *
 * Nicht bei einem geteilten Geschenk: wer einem Link folgt, kam wegen des
 * Geschenks und nicht wegen der Anleitung.
 */
const firstVisit = (shared: boolean): boolean => {
  if (shared) return false;
  try { return !localStorage.getItem(INTRO_KEY); } catch { return false; }
};

/**
 * Zwei Arten, dasselbe Geschenk zu bearbeiten.
 *
 * 'code'   der rohe 3dx-Code, so wie das Werkzeug im Spiel ihn will. Nichts
 *          ist versteckt, ein fertiges Geschenk laesst sich hineinkopieren.
 * 'fields' die alte Oberflaeche: Zeile fuer Zeile mit Knoepfen fuer Farbe,
 *          Groesse und Deko. Wer den Code umstaendlich findet, arbeitet hier.
 *
 * Beide schreiben in dasselbe Geschenk. Der Unterschied ist nur die Richtung:
 * die Felder BAUEN den Code, im Code steht er direkt da.
 */
type EditMode = 'code' | 'fields';
const readMode = (): EditMode => {
  try { return localStorage.getItem(MODE_KEY) === 'fields' ? 'fields' : 'code'; } catch { return 'code'; }
};

// Arriving at an empty page tells you nothing about what the tool does, so it
// opens on a finished gift: Lari's own two-part build, byte for byte. Built
// through composeLook, the same path the layout chip takes, so the two cannot
// drift apart. A shared link wins over it.
const START = composeLook(createDefaultState(), LOOKS.find((l) => l.id === 'twoWords') ?? LOOKS[0]);

export default function App() {
  const { t } = useI18n();
  const shared = readShareCodeFromUrl();
  const { state: code, commit, undo, redo, reset, canUndo, canRedo } = useHistory<string>(shared ?? generate(START).code);
  const setCode = useCallback((next: string, coalesceKey?: string) => commit(() => next, coalesceKey), [commit]);

  // The composition behind the last template or look. It is write-only: it
  // feeds generate(), and hand edits in the box never flow back into it.
  // The preview hands clicks to the editor: click a line of the gift and it
  // is selected in the code, ready for the tools.
  const editor = useRef<EditorHandle>(null);
  // Fruher ein ref und rein schreibend. Jetzt Zustand, weil die Felder-Ansicht
  // ihn ANZEIGT — ein ref waehrend des Renderns zu lesen ist in React 19 nicht
  // erlaubt, und die Ansicht muesste sich sonst nicht neu zeichnen.
  const [build, setBuild] = useState<GiftState>(shared ? createDefaultState() : START);
  const [mode, setMode] = useState<EditMode>(readMode);
  const [askSwitch, setAskSwitch] = useState(false);
  const [colorField, setColorField] = useState<FieldId | null>(null);
  const [hiField, setHiField] = useState<FieldId | null>(null);
  // Der Zaehler sorgt dafuer, dass zweimal dieselbe Zeile auch zweimal wirkt.
  const focusNonce = useRef(0);
  const [focusReq, setFocusReq] = useState<FocusRequest | null>(null);
  const [about, setAbout] = useState(() => firstVisit(!!shared));
  const [lookId, setLookId] = useState<string | null>(shared ? null : lookIdOf(START));
  // The layout you picked, kept as a choice rather than read back off the gift:
  // loading a card would otherwise silently drop you back into its own build.
  const picked = useRef<Look | null>(shared ? null : (LOOKS.find((l) => l.id === 'twoWords') ?? null));

  const emit = useCallback((next: GiftState) => {
    setBuild(next);
    setLookId(lookIdOf(next));
    setCode(generate(next).code);
  }, [setCode]);

  /**
   * Was die Felder-Ansicht aendert, geht denselben Weg wie eine Vorlage: das
   * Geschenk wird neu gebaut und in den Code geschrieben. Der Code bleibt die
   * eine Wahrheit, die Felder sind nur eine zweite Art, ihn zu schreiben.
   *
   * `coalesceKey` wird durchgereicht, damit Tippen EIN Rueckgaengig-Schritt
   * bleibt und nicht einer je Buchstabe.
   */
  const commitBuild = useCallback<Commit>((producer, coalesceKey) => {
    const next = producer(build);
    if (next === build) return;
    setBuild(next);
    setLookId(lookIdOf(next));
    setCode(generate(next).code, coalesceKey);
  }, [build, setCode]);

  /**
   * Welche Zeile des Geschenks gehoert zu dem Feld, in dem gerade geschrieben
   * wird? generate() gibt die fertig gesetzten Zeilen mit heraus — die suchen
   * wir im Code, statt die Reihenfolge ein zweites Mal nachzubauen. Findet sich
   * nichts, wird eben nichts hervorgehoben; falsch zeigen waere schlimmer.
   */
  /**
   * Welche Zeile des Codes gehoert zu welchem Feld — einmal berechnet, in beide
   * Richtungen benutzt: das Feld leuchtet die Zeile an, und ein Klick auf die
   * Zeile springt ins Feld.
   */
  const lineOfField = useMemo(() => {
    const out = new Map<FieldId, number>();
    const rendered = generate(build).lines;
    const zeilen = code.split('\n').map((l) => stripTags(l).trim());
    for (const [f, piece] of Object.entries(rendered) as [FieldId, string | null][]) {
      if (!piece) continue;
      const want = stripTags(piece).trim();
      if (!want) continue;
      const i = zeilen.indexOf(want);
      if (i >= 0) out.set(f, i);
    }
    return out;
  }, [build, code]);

  /** Die Zeile anklicken und im richtigen Feld landen. */
  const pickField = useCallback((start: number) => {
    const i = code.slice(0, start).split('\n').length - 1;
    for (const [f, n] of lineOfField) if (n === i) { focusNonce.current += 1; setFocusReq({ f, n: focusNonce.current, focus: true }); return; }
  }, [code, lineOfField]);

  const hiLine = useMemo(() => {
    if (!hiField) return null;
    const piece = generate(build).lines[hiField];
    if (!piece) return null;
    // Verglichen wird der reine Text, nicht der Code: generate() gibt die
    // Feld-Stuecke heraus, BEVOR benachbarte Tags zusammengefasst werden — die
    // fertige Zeile traegt also andere Tags, aber dieselben Buchstaben.
    const want = stripTags(piece).trim();
    if (!want) return null;
    const i = code.split('\n').findIndex((l) => stripTags(l).trim() === want);
    return i >= 0 ? i : null;
  }, [hiField, build, code]);

  // Steht im Kasten noch das, was aus den Feldern kommt? Wenn nicht, hat jemand
  // von Hand getippt — und ein Wechsel in die Felder wuerde das ueberschreiben.
  const handEdited = useMemo(() => generate(build).code !== code, [build, code]);

  const pickMode = useCallback((m: EditMode) => {
    // Von Hand geschriebener Code hat keine Felder, aus denen er stammt. Der
    // Wechsel wuerde ihn aus dem letzten Bauzustand neu erzeugen — das muss
    // vorher jemand bestaetigen, sonst ist die Arbeit still weg.
    if (m === 'fields' && handEdited) { setAskSwitch(true); return; }
    setAskSwitch(false);
    setMode(m);
    try { localStorage.setItem(MODE_KEY, m); } catch { /* privates Fenster */ }
  }, [handEdited]);

  const switchAnyway = useCallback(() => {
    setAskSwitch(false);
    setMode('fields');
    setCode(generate(build).code);
    try { localStorage.setItem(MODE_KEY, 'fields'); } catch { /* privates Fenster */ }
  }, [build, setCode]);

  const applyColor = useCallback((f: FieldId, cs: ColorState) =>
    commitBuild((s2) => ({
      ...s2,
      colors: { ...s2.colors, [f]: cs.color },
      noColor: { ...s2.noColor, [f]: cs.noColor },
      grads: { ...s2.grads, [f]: { ...s2.grads[f], on: cs.gradient, c1: cs.c1, c2: cs.c2, rainbow: false } },
    })), [commitBuild]);


  const [workspaceView, setWorkspaceView] = useState<'select' | 'edit' | 'preview'>('select');
  // The gift as the recipient sees it — window, avatar and all — is what the
  // preview has always been, and what makes it worth looking at. The slim
  // text-only view is the option, not the default, and the choice is kept.
  const [plainView, setPlainView] = useState(() => {
    try { return localStorage.getItem(VIEW_KEY) === '1'; } catch { return false; }
  });
  const togglePreview = useCallback(() => setPlainView((v) => {
    try { localStorage.setItem(VIEW_KEY, v ? '0' : '1'); } catch { /* private mode */ }
    return !v;
  }), []);
  const chooseLayout = () => setWorkspaceView('select');
  // Dragging a line in the preview is an edit to the code like any other, so
  // it lands in the same history and Ctrl+Z takes it back.
  const moveLine = useCallback((from: number, to: number) => {
    setCode(moveCodeLine(code, from, to));
  }, [code, setCode]);

  // A shared gift loads once; clear the hash so editing isn't pinned to it.
  useEffect(() => { clearShareHash(); }, []);

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

  // A card arrives in the layout you are standing in, not in the one it was
  // written for.
  const applyTemplate = useCallback((cat: TplCategory, item: TplItem) => {
    const built = composeTemplate(build, cat, item);
    const look = picked.current;
    emit(look && lookIdOf(built) !== look.id ? composeLook(built, look, true) : built);
  }, [build, emit]);

  const applyLook = useCallback((look: Look) => { picked.current = look; emit(composeLook(build, look)); }, [build, emit]);

  const resetAll = useCallback(() => {
    setBuild(createDefaultState());
    setLookId(null);
    reset('');
  }, [reset]);

  return (
    <div className="h-full flex flex-col">
      <Header undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} onAbout={() => setAbout(true)} />
      <nav className="workspace-tabs" aria-label={t('g_customize')}>
        {(['select', 'edit', 'preview'] as const).map(view => <button key={view} aria-current={workspaceView === view ? 'page' : undefined} onClick={() => setWorkspaceView(view)}>{t(view === 'select' ? 'g_select' : view === 'edit' ? 'g_edit' : 'preview')}</button>)}
      </nav>

      <main
        className="workspace flex-1 min-h-0"
        data-view={workspaceView}
        // Editor in the middle, gift on the right — the shape of the tool Lari
        // already uses. The shelf folds to a 46px tab and gives back its width.
        style={{
          // The responsive column layout lives in index.css.
          gap: 14,
          padding: 14,
          width: '100%',
          maxWidth: 1740,
          // Below roughly 1030 with the shelf open the three columns cannot
          // fit; scrolling sideways is honest, clipping the gift is not.
          margin: '0 auto',
          transition: 'grid-template-columns .22s ease',
        }}
      >
        <Shelf onApply={applyTemplate} onApplyLook={applyLook} activeLook={lookId} />

        {/* Der Editor steht auf seiner natuerlichen Hoehe; darunter blieb die
            halbe Spalte leer. Da gehoert das Gaestebuch hin. */}
        <div className="editor-column flex flex-col" style={{ minWidth: 0, minHeight: 0, gap: 14 }}>
          {/* Zwei Wege zum selben Geschenk. Der Code bleibt der Standard und
              die Wahrheit; die Felder sind fuer alle, denen er zu umstaendlich
              ist. Der Schalter steht ueber dem Kasten, nicht darin — er gehoert
              zu beiden Ansichten gleich. */}
          <div className="modebar">
            <div className="seg" role="group" aria-label={t('mode_title')}>
              <button data-on={mode === 'code'} onClick={() => pickMode('code')} title={t('mode_code_h')}>
                <Code2 size={12} /> {t('mode_code')}
              </button>
              <button data-on={mode === 'fields'} onClick={() => pickMode('fields')} title={t('mode_fields_h')}>
                <SlidersHorizontal size={12} /> {t('mode_fields')}
              </button>
            </div>
            <span className="hint" style={{ flex: 1, minWidth: 0 }}>
              {mode === 'code' ? t('mode_code_h') : t('mode_fields_h')}
            </span>
          </div>

          {askSwitch && (
            <div className="modewarn">
              <AlertTriangle size={14} style={{ flex: '0 0 auto', color: 'var(--warn)' }} />
              <span style={{ flex: 1 }}>{t('mode_warn')}</span>
              <button className="btn btn-sm" onClick={() => setAskSwitch(false)}>{t('mode_keep')}</button>
              <button className="btn btn-sm btn-danger" onClick={switchAnyway}>{t('mode_go')}</button>
            </div>
          )}

          {mode === 'code'
            ? <Editor ref={editor} code={code} setCode={setCode} undo={undo} canUndo={canUndo} />
            : <EditorPanel state={build} commit={commitBuild} onOpenColor={setColorField} looks={LOOKS} activeLook={lookId} onApplyLook={applyLook} onChooseLayout={chooseLayout} onFocusField={setHiField} focusReq={focusReq} />}
          <details className="quiet-details guestbook-disclosure">
            <summary>{t('gb_title')}</summary>
            <Guestbook />
          </details>
        </div>

        {/* The gutter is reserved whether or not this scrolls, so the 506px
            replica keeps its width instead of losing 10px to a scrollbar. */}
        <section className="preview-column scroll-y" aria-label={t('preview')} style={{ minHeight: 0, paddingTop: 4, overflowX: 'auto', scrollbarGutter: 'stable' }}>
          <div style={{ height: 'fit-content', width: 506, maxWidth: '100%', paddingBottom: 8 }}>
            <div className="preview-heading"><strong>{t('preview')}</strong><button className="btn btn-sm btn-ghost" aria-pressed={plainView} onClick={togglePreview}>{t(plainView ? 'g_game_view' : 'g_work_view')}</button></div>
            <Preview compact={plainView} code={code} onReorder={moveLine} hiLine={hiLine} onPickLine={(a, b, deco) => { setWorkspaceView('edit'); if (mode === 'code') editor.current?.selectLine(a, b, deco); else pickField(a); }} />
            {/* The grips only show under the cursor, so nothing on the page said
               the lines can be moved at all. This says it, and only where it is
               true — a gift whose tags run across lines gets no grips. */}
            {canReorderLines(code) && <p className="preview-hint">{t('e_move_hint')}</p>}
            <Actions code={code} setCode={setCode} onReset={resetAll} />
            <ThankYou />
          </div>
        </section>
      </main>

      <ColorPickerOverlay
        open={!!colorField}
        fieldLabel={colorField ? t((build.layout === 'pyramid' ? 'pyr_' : 'fl_') + colorField) : ''}
        initial={colorField
          ? { noColor: build.noColor[colorField], gradient: build.grads[colorField].on, color: build.colors[colorField], c1: build.grads[colorField].c1, c2: build.grads[colorField].c2 }
          : { noColor: false, gradient: false, color: '#ffffff', c1: '#ff71b8', c2: '#b388ff' }}
        onClose={() => setColorField(null)}
        onApply={(cs) => { if (colorField) applyColor(colorField, cs); setColorField(null); }}
      />
      {about && (
        <About onClose={() => {
          setAbout(false);
          try { localStorage.setItem(INTRO_KEY, '1'); } catch { /* privates Fenster */ }
        }} />
      )}
    </div>
  );
}
