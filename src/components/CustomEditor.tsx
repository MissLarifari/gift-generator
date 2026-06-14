import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { applyFont } from '../engine';
import type { FontStyle } from '../engine';
import { FONT_STYLES, SYMBOLS, KAOMOJI, DECO_PRESETS, type Commit } from '../state';
import { useI18n } from '../i18n';

// Free-form gift-code editor for the 'custom' layout. The textarea content IS
// the gift code (byte-for-byte); the toolbar wraps/transforms the selection.
export default function CustomEditor({ value, commit }: { value: string; commit: Commit }) {
  const { t } = useI18n();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const pendingSel = useRef<[number, number] | null>(null);
  const [size, setSize] = useState(40);
  const [color, setColor] = useState('#ff71b8');

  // After a toolbar edit re-renders the controlled textarea, restore the selection.
  useLayoutEffect(() => {
    if (pendingSel.current && taRef.current) {
      const [s, e] = pendingSel.current;
      taRef.current.focus();
      taRef.current.setSelectionRange(s, e);
      pendingSel.current = null;
    }
  });

  const setText = (v: string, coalesce: boolean) => commit((s) => ({ ...s, customText: v }), coalesce ? 'customText' : undefined);

  const wrap = (before: string, after: string) => {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const next = value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e);
    pendingSel.current = [s + before.length, e + before.length];
    setText(next, false);
  };

  const transform = (fn: (x: string) => string) => {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    if (s === e) return; // nothing selected
    const out = fn(value.slice(s, e));
    const next = value.slice(0, s) + out + value.slice(e);
    pendingSel.current = [s, s + out.length];
    setText(next, false);
  };

  // Insert a snippet (deco / symbol / kaomoji) at the cursor, replacing any
  // selection; the caret lands right after the inserted text.
  const insert = (str: string) => {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const next = value.slice(0, s) + str + value.slice(e);
    pendingSel.current = [s + str.length, s + str.length];
    setText(next, false);
  };

  const DECOS = [...(DECO_PRESETS.dekoTop ?? []), ...(DECO_PRESETS.dekoBottom ?? [])];

  const chip = (label: ReactNode, onClick: () => void, title: string): ReactNode => (
    <button
      key={title}
      onClick={onClick}
      title={title}
      style={{ fontSize: 11.5, minWidth: 26, padding: '4px 8px', borderRadius: 7, cursor: 'pointer', background: 'rgba(87,224,240,.08)', border: '1px solid rgba(87,224,240,.22)', color: '#bfeefa' }}
    >
      {label}
    </button>
  );
  const divider = <span style={{ width: 1, height: 18, background: 'var(--border)', flex: '0 0 auto' }} />;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: '#bfeefa' }}>{t('g_custom_code')}</div>

      {/* bold / italic / fonts */}
      <div className="flex flex-wrap items-center" style={{ gap: 6 }}>
        {chip(<b>B</b>, () => wrap('<b>', '</b>'), 'Bold')}
        {chip(<i>I</i>, () => wrap('<i>', '</i>'), 'Italic')}
        {divider}
        {FONT_STYLES.map((fs) => chip(fs.label, () => transform((x) => applyFont(x, fs.id as FontStyle)), fs.id))}
      </div>

      {/* size + color */}
      <div className="flex flex-wrap items-center" style={{ gap: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{t('size')}</span>
        {chip('S', () => wrap('<size=12>', '</size>'), '12')}
        {chip('M', () => wrap('<size=20>', '</size>'), '20')}
        {chip('L', () => wrap('<size=40>', '</size>'), '40')}
        <input type="number" value={size} min={1} max={200} onChange={(e) => setSize(parseInt(e.target.value) || 1)} style={{ width: 50, background: 'rgba(6,9,18,.4)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 6px', color: 'var(--text)', fontSize: 12, outline: 'none' }} />
        {chip('✓', () => wrap(`<size=${size}>`, '</size>'), 'Apply size')}
        {divider}
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{t('g_color')}</span>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 26, height: 26, padding: 0, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer' }} />
        {chip('✓', () => wrap(`<color=${color}>`, '</color>'), 'Apply color')}
      </div>

      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => setText(e.target.value, true)}
        placeholder={t('g_custom_ph')}
        spellCheck={false}
        className="mono"
        style={{ width: '100%', minHeight: 150, resize: 'vertical', background: 'rgba(6,9,18,.5)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 11px', color: 'var(--text)', fontSize: 12.5, lineHeight: 1.5, outline: 'none', whiteSpace: 'pre-wrap' }}
      />
      {/* insert deco / symbols / kaomoji at the cursor */}
      <div className="flex flex-col" style={{ gap: 7 }}>
        <div>
          <div style={{ fontSize: 10, color: '#7e8fb5', margin: '0 0 5px' }}>{t('g_pick_deco')}</div>
          <div className="flex flex-wrap" style={{ gap: 5 }}>{DECOS.map((p) => chip(p, () => insert(p), p))}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#7e8fb5', margin: '0 0 5px' }}>{t('plus_symbol')}</div>
          <div className="flex flex-wrap" style={{ gap: 5 }}>{SYMBOLS.map((sym) => chip(sym, () => insert(sym), sym))}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#7e8fb5', margin: '0 0 5px' }}>{t('kaomoji')}</div>
          <div className="flex flex-wrap" style={{ gap: 5 }}>{KAOMOJI.map((k) => chip(k, () => insert(k), k))}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t('g_custom_hint')}</div>
    </div>
  );
}
