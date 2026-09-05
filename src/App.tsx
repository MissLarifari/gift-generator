import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { LayoutGrid, ChevronRight } from 'lucide-react';
import Header from './components/Header';
import Shelf from './components/Shelf';
import Editor, { type EditorHandle } from './components/Editor';
import Preview from './components/Preview';
import Actions, { ThankYou } from './components/Actions';
import About from './components/About';
import Guestbook from './components/Guestbook';
import { generate, type GiftState } from './engine';
import { composeTemplate, type TplCategory, type TplItem } from './data/templates';
import { LOOKS, composeLook, lookIdOf, type Look } from './data/looks';
import { createDefaultState } from './state';
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

const PANELS_KEY = 'gifty_panels_v2';

// Arriving at an empty page tells you nothing about what the tool does, so it
// opens on a finished gift: Lari's own two-part build, byte for byte. Built
// through composeLook, the same path the layout chip takes, so the two cannot
// drift apart. A shared link wins over it.
const START = composeLook(createDefaultState(), LOOKS.find((l) => l.id === 'twoWords') ?? LOOKS[0]);

// A folded panel: a tab you click to bring it back. The label runs vertically
// so the panel still says what it is while costing almost no width.
function Tab({ label, icon, onOpen }: { label: string; icon: ReactNode; onOpen: () => void }) {
  return (
    <button className="handle" onClick={onOpen} title={label} aria-label={label} aria-expanded={false}>
      <ChevronRight size={14} />
      {icon}
      <span className="handle-label">{label}</span>
    </button>
  );
}

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
  const build = useRef<GiftState>(shared ? createDefaultState() : START);
  const [about, setAbout] = useState(false);
  const [lookId, setLookId] = useState<string | null>(shared ? null : lookIdOf(START));
  // The layout you picked, kept as a choice rather than read back off the gift:
  // loading a card would otherwise silently drop you back into its own build.
  const picked = useRef<Look | null>(shared ? null : (LOOKS.find((l) => l.id === 'twoWords') ?? null));

  const emit = useCallback((next: GiftState) => {
    build.current = next;
    setLookId(lookIdOf(next));
    setCode(generate(next).code);
  }, [setCode]);

  const [panels, setPanels] = useState<{ left: boolean }>(() => {
    try {
      const raw = localStorage.getItem(PANELS_KEY);
      if (raw) return { left: !!JSON.parse(raw).left };
    } catch { /* ignore */ }
    // Below this the shelf, the editor and a 506px gift cannot all fit, and
    // the code box is the one that gets squeezed. So it starts folded — one
    // click still opens it, and then the gift column scrolls instead.
    return { left: window.innerWidth >= 1280 };
  });
  const toggleShelf = useCallback(() => {
    setPanels((p) => {
      const next = { left: !p.left };
      try { localStorage.setItem(PANELS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

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
    const built = composeTemplate(build.current, cat, item);
    const look = picked.current;
    emit(look && lookIdOf(built) !== look.id ? composeLook(built, look, true) : built);
  }, [emit]);

  const applyLook = useCallback((look: Look) => { picked.current = look; emit(composeLook(build.current, look)); }, [emit]);

  const resetAll = useCallback(() => {
    build.current = createDefaultState();
    setLookId(null);
    reset('');
  }, [reset]);

  return (
    <div className="h-full flex flex-col">
      <Header undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} onAbout={() => setAbout(true)} />

      <main
        className="flex-1 min-h-0 grid"
        // Editor in the middle, gift on the right — the shape of the tool Lari
        // already uses. The shelf folds to a 46px tab and gives back its width.
        style={{
          // Capped and centred: on a wide monitor an editor that keeps growing
          // is just a huge empty box — a line of gift code is rarely 80 chars.
          //
          // The gift column is a hard 506px. It is a replica measured against
          // the client, so a preview that quietly squeezes to 414 to make room
          // is worse than useless — it would lie about what the recipient sees.
          // Shelf and editor both take fr, so spare width is SHARED instead of
          // filling one to its cap before the other sees any — that ordering
          // once left the code box at 194px beside a fat shelf. The shelf gets
          // an equal share. Weighting it 1.3 looked right on a 1920 screen and
          // pinned the editor to its 420 floor on a 1480 one — the code box
          // back at 286 beside a 482 shelf.
          gridTemplateColumns: `${panels.left ? 'minmax(248px, 1fr)' : '46px'} minmax(420px, 1fr) 522px`,
          gap: 14,
          padding: 14,
          width: '100%',
          maxWidth: 1740,
          // Below roughly 1030 with the shelf open the three columns cannot
          // fit; scrolling sideways is honest, clipping the gift is not.
          overflowX: 'auto',
          margin: '0 auto',
          transition: 'grid-template-columns .22s ease',
        }}
      >
        {panels.left
          ? <Shelf onApply={applyTemplate} onApplyLook={applyLook} activeLook={lookId} onFold={toggleShelf} />
          : <Tab label={t('g_templates')} icon={<LayoutGrid size={15} />} onOpen={toggleShelf} />}

        {/* Der Editor steht auf seiner natuerlichen Hoehe; darunter blieb die
            halbe Spalte leer. Da gehoert das Gaestebuch hin. */}
        <div className="flex flex-col" style={{ minWidth: 0, minHeight: 0, gap: 14 }}>
          <Editor ref={editor} code={code} setCode={setCode} undo={undo} canUndo={canUndo} />
          <Guestbook />
        </div>

        {/* The gutter is reserved whether or not this scrolls, so the 506px
            replica keeps its width instead of losing 10px to a scrollbar. */}
        <section className="scroll-y" style={{ minHeight: 0, paddingTop: 4, overflowX: 'auto', scrollbarGutter: 'stable' }}>
          <div style={{ height: 'fit-content', width: 506, maxWidth: '100%', paddingBottom: 8 }}>
            <Preview code={code} onPickLine={(a, b, deco) => editor.current?.selectLine(a, b, deco)} />
            <Actions code={code} setCode={setCode} onReset={resetAll} />
            <ThankYou />
          </div>
        </section>
      </main>

      {about && <About onClose={() => setAbout(false)} />}
    </div>
  );
}
