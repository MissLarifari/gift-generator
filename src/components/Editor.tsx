import { useCallback, useImperativeHandle, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from 'react';
import { Bold, Italic, Palette, Type, CaseSensitive, Smile, Eraser, Undo2, Rainbow, ArrowLeft, Pipette } from 'lucide-react';
import { applyFont, gradientText, giftChars, giftBytes, parseCode, hasTag, retag, untag, type FontStyle } from '../engine';
import { FONT_STYLES, SYMBOLS, KAOMOJI } from '../state';
import { useI18n } from '../i18n';
import { hexToHsv, hsvToHex, hexToRgb, rgbToHex, type Rgb } from '../color';

// The editor, built the way the 3dxchat tool builds it: one box holding the
// real code, a column of buttons beside it, and every button acting on what
// you selected with the mouse. No fields, no modes — select, click, done.
//
// The code in the box is the truth. That is what makes pasting a finished gift
// from the game work, and it is why the byte count cannot drift from what the
// client will actually receive.

const LIMIT_CHARS = 240;
const LIMIT_BYTES = 255;

// The three colours 3dxchat itself uses in chat, straight off Colin's tool
// (status.3dxchat.net/profile-editor) — the only preset colours it offers.
const SYSTEM: [string, string][] = [['#4ec0ef', 'e_sys_male'], ['#ff0d87', 'e_sys_female'], ['#997bb9', 'e_sys_me']];

/** The shades Lari's own gifts run on — first, because they are used most. */
const FAVOURITES = ['#ffd84d', '#ff4fa3', '#ff9ec7', '#e8467c', '#9dd6a8', '#7fd4ff', '#c9a7ff', '#ff7a45'];

// A full spread instead of a handful of presets: twelve hues, five shades each,
// plus a grey ramp. Generated rather than typed out, so the steps stay even.
const HUES = [0, 18, 36, 52, 80, 140, 172, 196, 216, 252, 286, 320];
const SHADES: [number, number][] = [[92, 84], [90, 70], [92, 56], [80, 43], [68, 30]];
const GREYS = ['#ffffff', '#e0e0e0', '#bdbdbd', '#9e9e9e', '#757575', '#565656', '#333333', '#000000'];

function hsl(h: number, s: number, l: number): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const v = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * v).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const SIZES = [10, 12, 14, 18, 24, 30, 40, 50];

type Pop = 'color' | 'gradient' | 'size' | 'font' | 'symbol' | null;

/** What the preview can ask the editor to do when a line of the gift is clicked. */
export interface EditorHandle {
  selectLine: (start: number, end: number, deco: boolean) => void;
}

// Declared out here, not inside the editor: a component created during render
// is a new component every render, and these buttons would be torn down and
// rebuilt on every keystroke — losing the mousedown that guards the selection.
function Btn({ on, icon, label, onClick, onArm, disabled }: {
  on?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  /** Runs on mousedown, before focus can move: remembers the selection. */
  onArm: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="toolbtn"
      data-on={on}
      disabled={disabled}
      // Never take focus off the box: the selection must survive the click.
      onMouseDown={(e) => { e.preventDefault(); onArm(); }}
      onClick={onClick}
      title={label}
    >
      {icon}<span>{label}</span>
    </button>
  );
}


const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Chrome's own eyedropper, where the browser has it. */
type Dropper = { open: () => Promise<{ sRGBHex: string }> };
const eyeDropper = (): Dropper | null => {
  const w = window as unknown as { EyeDropper?: new () => Dropper };
  return w.EyeDropper ? new w.EyeDropper() : null;
};

/**
 * The picker itself: the saturation/value square, the hue bar under it and the
 * three RGB fields — the widget the browser pops up for <input type="color">,
 * but sitting in the panel so no second window has to open over the gift.
 */
function ColorField({ hex, setHex }: { hex: string; setHex: (h: string) => void }) {
  const { t } = useI18n();
  // Kept so dragging down to black or left to grey does not forget which hue
  // you were on — those colours carry no hue of their own to read back.
  const [lastHue, setLastHue] = useState(0);
  const sq = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  const [h, s, v] = hexToHsv(hex, lastHue) ?? [lastHue, 1, 1];
  const rgb = hexToRgb(hex) ?? [0, 0, 0];

  const fromSquare = (e: ReactPointerEvent) => {
    const el = sq.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setLastHue(h);
    setHex(hsvToHex([h, clamp01((e.clientX - r.left) / r.width), 1 - clamp01((e.clientY - r.top) / r.height)]));
  };

  const fromBar = (e: ReactPointerEvent) => {
    const el = bar.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nh = clamp01((e.clientX - r.left) / r.width) * 360;
    setLastHue(nh);
    setHex(hsvToHex([nh, s, v]));
  };

  const setChannel = (i: number, raw: string) => {
    const n = Math.min(255, Math.max(0, parseInt(raw, 10) || 0));
    const next = [...rgb] as Rgb;
    next[i] = n;
    setHex(rgbToHex(next));
  };

  // Written out at each element rather than through a helper: handing a
  // function that touches a ref to something called during render trips the
  // compiler, and there are only two of them.
  const grab = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  return (
    <div className="cp">
      <div
        ref={sq}
        className="cp-sv"
        style={{ background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, ${hsvToHex([h, 1, 1])})` }}
        onPointerDown={(e) => { grab(e); fromSquare(e); }}
        onPointerMove={(e) => { if (e.buttons === 1) fromSquare(e); }}
      >
        <span className="cp-dot" style={{ left: s * 100 + '%', top: (1 - v) * 100 + '%' }} />
      </div>

      <div className="cp-row">
        <button className="cp-eye" title={t('e_dropper')} aria-label={t('e_dropper')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => eyeDropper()?.open().then((r) => setHex(r.sRGBHex)).catch(() => {})}>
          <Pipette size={13} />
        </button>
        <span className="cp-now" style={{ background: hex }} />
        <div
          ref={bar}
          className="cp-hue"
          onPointerDown={(e) => { grab(e); fromBar(e); }}
          onPointerMove={(e) => { if (e.buttons === 1) fromBar(e); }}
        >
          <span className="cp-hue-dot" style={{ left: (h / 360) * 100 + '%' }} />
        </div>
      </div>

      <div className="cp-rgb">
        {(['R', 'G', 'B'] as const).map((label, i) => (
          <label key={label}>
            <input type="number" min={0} max={255} value={rgb[i]} onChange={(e) => setChannel(i, e.target.value)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/** Every popover wears the same head: what it is, and the way back out. */
function PopHead({ title, onBack, back }: { title: string; onBack: () => void; back: string }) {
  return (
    <div className="tp-headrow">
      <span className="tp-head">{title}</span>
      <button className="tp-back" onMouseDown={(e) => e.preventDefault()} onClick={onBack} title={back} aria-label={back}>
        <ArrowLeft size={13} />
      </button>
    </div>
  );
}

// The popover, out here for the same reason the buttons are: called as a
// function inside the editor's render it would be reading refs during render.
// As a component with plain props, everything it touches is an event handler.
function Panel({ pop, grad, setGrad, onColor, onSize, onTransform, onInsert, onBack }: {
  pop: Pop;
  grad: [string, string];
  setGrad: (g: [string, string]) => void;
  onColor: (hex: string) => void;
  onSize: (n: number) => void;
  onTransform: (fn: (s: string) => string) => void;
  onInsert: (s: string) => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [hex, setHex] = useState('#ff4fa3');
  if (!pop) return null;

  const back = t('e_back');
  const paint = onColor;
  const swatch = (c: string, size = 17) => (
    <button
      key={c}
      className="tp-swatch"
      style={{ background: c, width: size, height: size }}
      title={c}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => paint(c)}
    />
  );

  if (pop === 'color') {
    // A typed or pasted hex is the whole point of "the full palette": the
    // shade from a gift she already has, not the nearest swatch to it.
    const clean = hex.trim().replace(/^#?/, '#');
    const valid = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean);
    return (
      <div className="tp tp-wide">
        <PopHead title={t('e_color')} onBack={onBack} back={back} />

        <ColorField hex={valid ? clean : '#ff4fa3'} setHex={setHex} />

        <div className="tp-hexrow">
          <input
            className="tp-hex mono"
            value={hex}
            spellCheck={false}
            placeholder="#ff4fa3"
            aria-label={t('e_hex')}
            onChange={(e) => setHex(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && valid) paint(clean); }}
          />
          <button className="btn btn-sm" disabled={!valid} onMouseDown={(e) => e.preventDefault()} onClick={() => paint(clean)}>
            {t('e_apply')}
          </button>
        </div>

        <div className="tp-label">{t('e_sys')}</div>
        <div className="flex flex-col" style={{ gap: 4 }}>
          {SYSTEM.map(([c, key]) => (
            <button key={c} className="tp-row" onMouseDown={(e) => e.preventDefault()} onClick={() => paint(c)}>
              <span style={{ color: c, fontWeight: 700 }}>{t(key)}</span>
              <span className="mono" style={{ fontSize: 10.5 }}>{c}</span>
            </button>
          ))}
        </div>

        <div className="tp-label">{t('e_common')}</div>
        <div className="tp-grid">{FAVOURITES.map((c) => swatch(c, 20))}</div>

        <div className="tp-label">{t('e_shades')}</div>
        <div className="tp-matrix">
          {SHADES.map(([s, l]) => HUES.map((h) => swatch(hsl(h, s, l))))}
          {GREYS.map((c) => swatch(c))}
        </div>

        <p className="tp-hint">{t('e_white_free')}</p>
      </div>
    );
  }

  if (pop === 'gradient') return (
    <div className="tp">
      <PopHead title={t('e_gradient')} onBack={onBack} back={back} />
      <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
        <input type="color" className="tp-swatch" style={{ width: 26, height: 26 }} value={grad[0]} onChange={(e) => setGrad([e.target.value, grad[1]])} />
        <span style={{ flex: 1, height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${grad[0]}, ${grad[1]})` }} />
        <input type="color" className="tp-swatch" style={{ width: 26, height: 26 }} value={grad[1]} onChange={(e) => setGrad([grad[0], e.target.value])} />
      </div>
      <button className="btn btn-sm" onMouseDown={(e) => e.preventDefault()}
        onClick={() => onTransform((s) => gradientText(s, grad[0], grad[1]))}>{t('e_apply')}</button>
      <p className="tp-hint">{t('e_gradient_cost')}</p>
    </div>
  );

  if (pop === 'size') return (
    <div className="tp">
      <PopHead title={t('e_size')} onBack={onBack} back={back} />
      <div className="tp-grid">
        {SIZES.map((n) => (
          <button key={n} className="tp-chip" onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSize(n)}>{n}</button>
        ))}
      </div>
      <p className="tp-hint">{t('e_size_default')}</p>
    </div>
  );

  if (pop === 'font') return (
    <div className="tp">
      <PopHead title={t('e_font')} onBack={onBack} back={back} />
      <div className="flex flex-col" style={{ gap: 5 }}>
        {FONT_STYLES.map((fs) => (
          <button key={fs.id} className="tp-row" onMouseDown={(e) => e.preventDefault()}
            onClick={() => onTransform((s) => applyFont(s, fs.id as FontStyle))}>
            <span>{fs.label}</span><span className="mono">{applyFont('abc', fs.id as FontStyle)}</span>
          </button>
        ))}
      </div>
      <p className="tp-hint">{t('e_font_cost')}</p>
    </div>
  );

  return (
    <div className="tp">
      <PopHead title={t('e_symbols')} onBack={onBack} back={back} />
      <div className="tp-grid">
        {SYMBOLS.map((s) => (
          <button key={s} className="tp-chip" onMouseDown={(e) => e.preventDefault()} onClick={() => onInsert(s)}>{s}</button>
        ))}
      </div>
      <button className="btn btn-sm" style={{ width: '100%', marginTop: 9, justifyContent: 'center' }}
        onMouseDown={(e) => e.preventDefault()} onClick={() => onTransform(() => '')}>
        {t('e_clear')}
      </button>

      <div className="tp-label">{t('kaomoji')}</div>
      <div className="flex flex-col" style={{ gap: 4 }}>
        {KAOMOJI.map((s) => (
          <button key={s} className="tp-row" onMouseDown={(e) => e.preventDefault()} onClick={() => onInsert(s)}>
            <span className="mono">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Editor({
  code,
  setCode,
  undo,
  canUndo,
  ref,
}: {
  code: string;
  setCode: (next: string, coalesceKey?: string) => void;
  undo: () => void;
  canUndo: boolean;
  ref?: Ref<EditorHandle>;
}) {
  const { t } = useI18n();
  const box = useRef<HTMLTextAreaElement>(null);
  const sel = useRef<[number, number]>([0, 0]);
  const [pop, setPop] = useState<Pop>(null);
  const [grad, setGrad] = useState<[string, string]>(['#ff4fa3', '#ffd84d']);

  const chars = giftChars(code);
  const bytes = giftBytes(code);
  const { warnings } = parseCode(code);
  const over = chars > LIMIT_CHARS || bytes > LIMIT_BYTES;

  /* ---------- selection ---------- */

  // The selection is kept in a ref, refreshed on every event that can move it.
  // Buttons also block mousedown, so the box never loses focus and the caret
  // stays where you put it — the thing that makes "select, then click" work.
  const remember = () => {
    const el = box.current;
    if (el) sel.current = [el.selectionStart ?? 0, el.selectionEnd ?? 0];
  };

  const put = (next: string, a: number, b: number) => {
    setCode(next);
    requestAnimationFrame(() => {
      const el = box.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(a, b);
      sel.current = [a, b];
    });
  };

  /** Wraps the selection; with nothing selected it drops the pair at the caret. */
  const wrap = (open: string, close: string) => {
    const [a, b] = sel.current;
    const next = code.slice(0, a) + open + code.slice(a, b) + close + code.slice(b);
    put(next, a + open.length, b + open.length);
    setPop(null);
  };

  /**
   * Colour and size. If the selected stretch already opens such a tag, the
   * value in it is CHANGED; only an untagged stretch gets a new wrapper.
   * Selecting a whole coloured line and picking a new colour used to nest a
   * second <color> around it — 24 bytes for nothing, and unreadable code.
   */
  const applyValue = (name: 'color' | 'size', value: string) => {
    const [a, b] = sel.current;
    const inner = code.slice(a, b);
    if (hasTag(inner, name)) {
      const done = retag(inner, name, value);
      put(code.slice(0, a) + done + code.slice(b), a, a + done.length);
      setPop(null);
      return;
    }
    wrap(`<${name}=${value}>`, `</${name}>`);
  };

  /** Bold and italic toggle: pressing it on a stretch that has it takes it off. */
  const toggleFlag = (name: 'b' | 'i') => {
    const [a, b] = sel.current;
    const inner = code.slice(a, b);
    if (hasTag(inner, name)) {
      const done = untag(inner, name);
      put(code.slice(0, a) + done + code.slice(b), a, a + done.length);
      return;
    }
    wrap(`<${name}>`, `</${name}>`);
  };

  /** Rewrites the selected text itself — fonts, gradients, stripping tags. */
  const transform = (fn: (s: string) => string) => {
    const [a, b] = sel.current;
    if (a === b) return;
    const done = fn(code.slice(a, b));
    put(code.slice(0, a) + done + code.slice(b), a, a + done.length);
    setPop(null);
  };

  const insert = (s: string) => {
    const [a, b] = sel.current;
    put(code.slice(0, a) + s + code.slice(b), a + s.length, a + s.length);
  };

  // Clicking a line of the gift selects that line of code, so every tool then
  // acts on it. A deco row also opens the symbols, because that is the only
  // thing anyone wants to do with one.
  const selectLine = useCallback((start: number, end: number, deco: boolean) => {
    const el = box.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(start, end);
    sel.current = [start, end];
    setPop(deco ? 'symbol' : null);
  }, []);
  useImperativeHandle(ref, () => ({ selectLine }), [selectLine]);

  const stripSelection = () =>
    transform((s) => s.replace(/<\/?(size|color|b|i)(?:=[^<>]*)?>/gi, ''));

  return (
    // KEIN alignSelf hier: das Panel sitzt jetzt in einer FLEX-SPALTE, und dort
    // meint alignSelf die Waagerechte — es hat das Codefeld auf Inhaltsbreite
    // zusammengezogen (263px in einer 776px breiten Spalte).
    <section className="slab flex" style={{ minWidth: 0, minHeight: 0, flex: '3 1 0', position: 'relative' }}>
      <div className="toolcol">
        <Btn icon={<Bold size={14} />} label={t('e_bold')} onArm={remember} onClick={() => toggleFlag('b')} />
        <Btn icon={<Italic size={14} />} label={t('e_italic')} onArm={remember} onClick={() => toggleFlag('i')} />
        <Btn on={pop === 'color'} icon={<Palette size={14} />} label={t('e_color')} onArm={remember}
          onClick={() => setPop((p) => (p === 'color' ? null : 'color'))} />
        <Btn on={pop === 'gradient'} icon={<Rainbow size={14} />} label={t('e_gradient')} onArm={remember}
          onClick={() => setPop((p) => (p === 'gradient' ? null : 'gradient'))} />
        <Btn on={pop === 'size'} icon={<CaseSensitive size={14} />} label={t('e_size')} onArm={remember}
          onClick={() => setPop((p) => (p === 'size' ? null : 'size'))} />
        <Btn on={pop === 'font'} icon={<Type size={14} />} label={t('e_font')} onArm={remember}
          onClick={() => setPop((p) => (p === 'font' ? null : 'font'))} />
        <Btn on={pop === 'symbol'} icon={<Smile size={14} />} label={t('e_symbols')} onArm={remember}
          onClick={() => setPop((p) => (p === 'symbol' ? null : 'symbol'))} />
        {/* Abgesetzt, aber nicht ans Panelende verbannt: der Abstandhalter hat
            diese beiden bei hohem Panel allein unten stehen lassen. */}
        <span className="toolgap" />
        <Btn icon={<Eraser size={14} />} label={t('e_strip')} onArm={remember} onClick={stripSelection} />
        <Btn icon={<Undo2 size={14} />} label={t('e_undo')} onArm={remember} onClick={undo} disabled={!canUndo} />
      </div>

      {/* Floating rather than a column of its own: a palette wide enough to be
          useful would otherwise eat the width the code box needs. */}
      <Panel pop={pop} grad={grad} setGrad={setGrad} onColor={(c) => applyValue('color', c)} onSize={(n) => applyValue('size', String(n))}
        onTransform={transform} onInsert={insert} onBack={() => setPop(null)} />

      <div className="flex flex-col" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        <textarea
          ref={box}
          className="codebox"
          value={code}
          spellCheck={false}
          placeholder={t('e_placeholder')}
          onChange={(e) => { setCode(e.target.value, 'type'); remember(); }}
          onSelect={remember}
          onMouseUp={remember}
          onKeyUp={remember}
          onClick={() => setPop(null)}
        />

        <div className="codefoot">
          <span className={over ? 'over' : ''}><b>{chars}</b> / {LIMIT_CHARS} {t('chars')}</span>
          <span style={{ flex: 1 }} />
          <span className={bytes > LIMIT_BYTES ? 'over' : ''}>{bytes} / {LIMIT_BYTES} {t('bytes')}</span>
        </div>

        {warnings.length > 0 && (
          <ul className="warnbox">
            {warnings.map((w, i) => <li key={i}>{t(w.code === 'stray' ? 'warn_stray' : 'warn_unclosed', w.tag)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
