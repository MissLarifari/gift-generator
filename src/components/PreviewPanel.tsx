import { useEffect, useRef, useState, useMemo, type CSSProperties, type ReactNode } from 'react';
import { Copy, Share2, RotateCcw, X, Check, Ban, TriangleAlert, Lightbulb, ArrowRight, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from 'lucide-react';
import { applyFont, buildOptimizeTips } from '../engine';
import type { GiftState, GenerateResult, FieldId } from '../engine';
import { editorSectionOf, type Commit } from '../state';
import { buildShareUrl } from '../share';
import { useI18n } from '../i18n';

const PV_NOCOLOR = '#dadce0';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Render the custom free-form code's 3dx tags (size/color/b/i) into safe HTML:
// the user's own text is escaped first, then only these known tags are
// re-introduced as spans — arbitrary HTML/script can't be injected.
function customPreviewHtml(code: string): string {
  let html = esc(code);
  html = html.replace(/&lt;size=(\d+)&gt;([\s\S]*?)&lt;\/size&gt;/gi, (_m, sz: string, inner: string) => `<span style="font-size:${Math.max(0.5, parseInt(sz) / 14)}rem">${inner}</span>`);
  html = html.replace(/&lt;color=(#[0-9a-fA-F]{3,8})&gt;([\s\S]*?)&lt;\/color&gt;/gi, (_m, col: string, inner: string) => `<span style="color:${col}">${inner}</span>`);
  html = html.replace(/&lt;b&gt;([\s\S]*?)&lt;\/b&gt;/gi, (_m, inner: string) => `<b>${inner}</b>`);
  html = html.replace(/&lt;i&gt;([\s\S]*?)&lt;\/i&gt;/gi, (_m, inner: string) => `<i>${inner}</i>`);
  return html;
}

export default function PreviewPanel({
  state,
  result,
  commit,
  onReset,
  onFocusField,
  isMobile,
}: {
  state: GiftState;
  result: GenerateResult;
  commit: Commit;
  onReset: () => void;
  onFocusField: (f: FieldId) => void;
  isMobile?: boolean;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [editing, setEditing] = useState<FieldId | null>(null);
  const [reorder, setReorder] = useState(false);
  const [optOpen, setOptOpen] = useState(false);
  const optRef = useRef<HTMLDivElement>(null);
  const opt = useMemo(() => (state.layout === 'custom' ? { show: false, state: 'info' as const, headerMsg: '', tips: [] } : buildOptimizeTips(state, result.chars, result.bytes, result.lines, t)), [state, result, t]);
  const overLimit = result.over;

  useEffect(() => {
    if (!optOpen) return;
    const onDown = (e: MouseEvent) => { if (optRef.current && !optRef.current.contains(e.target as Node)) setOptOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOptOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [optOpen]);

  // Desktop: text lines edit inline in the preview (the editor just highlights the
  // matching input). Deco lines are dropdowns in the editor, so clicking one hands
  // off instead — the Decoration section opens with that dropdown focused, which
  // also teaches where the decos live. Mobile: always hand off (App jumps to the
  // Edit tab and focuses the field) — the inline input is too fiddly on touch.
  const startEdit = (f: FieldId) => {
    if (!isMobile && editorSectionOf(state.layout, f) !== 'deco') setEditing(f);
    onFocusField(f);
  };

  const setText = (f: FieldId, v: string) => commit((s) => ({ ...s, text: { ...s.text, [f]: v } }), 'text:' + f);
  const removeField = (f: FieldId) => commit((s) => ({ ...s, text: { ...s.text, [f]: '' } }));
  const resetFont = (f: FieldId) => commit((s) => ({ ...s, fonts: { ...s.fonts, [f]: 'normal' } }));
  const moveLine = (f: FieldId, dir: -1 | 1) =>
    commit((s) => {
      const order = [...s.lineOrder];
      const visible = order.filter((x) => s.text[x]);
      const vi = visible.indexOf(f);
      const target = visible[vi + dir];
      if (!target) return s;
      const i = order.indexOf(f), j = order.indexOf(target);
      [order[i], order[j]] = [order[j], order[i]];
      return { ...s, lineOrder: order };
    });
  const reorderBtn = (enabled: boolean, danger = false): CSSProperties => ({
    width: 24, height: 24, borderRadius: 6, display: 'grid', placeItems: 'center',
    background: 'var(--card)', border: '1px solid var(--border)',
    color: !enabled ? '#454c58' : danger ? 'var(--danger)' : 'var(--muted)', cursor: enabled ? 'pointer' : 'not-allowed',
  });

  const solidColor = (f: FieldId) => (state.noColor[f] ? PV_NOCOLOR : state.grads[f].on || state.grads[f].rainbow ? '#eaf2ff' : state.colors[f]);
  const fontSizeRem = (f: FieldId) => (f === 'mainText' ? Math.max(0.8, state.sizes[f] / 20) + 'rem' : state.sizes[f] / 14 + 'rem');

  const displayStyle = (f: FieldId): CSSProperties => {
    const g = state.grads[f];
    const base: CSSProperties = { fontSize: fontSizeRem(f), cursor: 'pointer', whiteSpace: 'pre-wrap' };
    if (f === 'mainText') Object.assign(base, { fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontStyle: state.italic.main ? 'italic' : 'normal', lineHeight: 1.1, textShadow: state.noColor.mainText ? 'none' : '0 0 18px rgba(255,122,217,.22)' });
    else if (f === 'dekoTop' || f === 'dekoBottom') Object.assign(base, { letterSpacing: '4px' });
    else if (f === 'topText') Object.assign(base, { fontWeight: state.bold.top ? 700 : 400, fontStyle: state.italic.top ? 'italic' : 'normal' });
    else if (f === 'bottomText') Object.assign(base, { fontWeight: state.bold.bottom ? 700 : 400, fontStyle: state.italic.bottom ? 'italic' : 'normal' });
    if (state.noColor[f]) base.color = PV_NOCOLOR;
    else if (g.on || g.rainbow) Object.assign(base, { background: `linear-gradient(to right, ${g.rainbow ? '#ffadad' : g.c1}, ${g.rainbow ? '#bdb2ff' : g.c2})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' });
    else base.color = state.colors[f];
    return base;
  };

  // One field as a clickable display OR an inline editor.
  const field = (f: FieldId, key?: string): ReactNode => {
    const raw = state.text[f];
    if (editing === f) {
      return (
        <input
          key={key || f}
          autoFocus
          value={raw}
          onChange={(e) => setText(f, e.target.value)}
          onBlur={() => setEditing(null)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur(); }}
          style={{
            color: solidColor(f), fontSize: fontSizeRem(f), fontFamily: f === 'mainText' ? 'Space Grotesk, sans-serif' : 'inherit',
            fontWeight: f === 'mainText' ? 700 : 400, textAlign: 'center', background: 'var(--accent-soft)',
            border: '1px solid var(--accent-line)', borderRadius: 6, padding: '0 6px', outline: 'none',
            width: Math.max(4, raw.length + 2) + 'ch', maxWidth: '100%',
          }}
        />
      );
    }
    if (!raw) return null;
    const shown = f === 'kaomoji' ? raw : applyFont(raw, state.fonts[f]);
    const click = () => startEdit(f);
    const canStar = f === 'dekoTop' || f === 'topText' || f === 'bottomText';
    const starred = canStar && state.stars[f as 'dekoTop' | 'topText' | 'bottomText'];
    if (!starred) {
      return <span key={key || f} onClick={click} title={t('click_edit')} style={displayStyle(f)}>{shown}</span>;
    }
    // mirror the engine's "* X *" wrap; the asterisks sit outside the colour tag → default colour
    const starStyle: CSSProperties = { fontSize: fontSizeRem(f), color: PV_NOCOLOR };
    return (
      <span key={key || f} onClick={click} title={t('click_edit')} style={{ cursor: 'pointer' }}>
        <span style={starStyle}>* </span>
        <span style={displayStyle(f)}>{shown}</span>
        <span style={starStyle}> *</span>
      </span>
    );
  };

  const row = (children: ReactNode, k: string) => <div key={k} style={{ minHeight: 4 }}>{children}</div>;
  const inlineRow = (children: ReactNode, k: string) => <div key={k} className="flex flex-wrap justify-center items-baseline" style={{ columnGap: 8, rowGap: 2 }}>{children}</div>;

  // Arrange preview lines to match the chosen layout (mirrors applyLayout).
  const body = (): ReactNode => {
    const order = state.lineOrder;
    if (reorder) {
      const visible = order.filter((f) => state.text[f]);
      return visible.map((f, idx) => (
        <div key={f} className="flex items-center justify-center" style={{ width: '100%', gap: 10 }}>
          <span style={displayStyle(f)}>{f === 'kaomoji' ? state.text[f] : applyFont(state.text[f], state.fonts[f])}</span>
          <span className="flex items-center" style={{ gap: 3 }}>
            <button onClick={() => moveLine(f, -1)} disabled={idx === 0} style={reorderBtn(idx !== 0)}><ArrowUp size={13} /></button>
            <button onClick={() => moveLine(f, 1)} disabled={idx === visible.length - 1} style={reorderBtn(idx !== visible.length - 1)}><ArrowDown size={13} /></button>
            <button onClick={() => removeField(f)} style={reorderBtn(true, true)}><X size={13} /></button>
          </span>
        </div>
      ));
    }
    switch (state.layout) {
      case 'inline':
        return [
          inlineRow([field('dekoTop', 'i-dt1'), field('topText', 'i-tt'), field('mainText', 'i-mt'), field('dekoTop', 'i-dt2')], 'i-row'),
          row(field('bottomText'), 'i-b'),
          row(field('kaomoji'), 'i-k'),
          row(field('dekoBottom'), 'i-db'),
        ];
      default: // center, pyramid, sparkle, heart (stack centered; pyramid's star
        // deco is multi-line and renders its line breaks via pre-wrap)
        return order.map((f) => row(field(f), f));
    }
  };

  const copy = () => {
    if (overLimit) return;
    navigator.clipboard?.writeText(result.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }).catch(() => {});
  };

  const share = () => {
    const url = buildShareUrl(state);
    navigator.clipboard?.writeText(url).then(() => { setShared(true); setTimeout(() => setShared(false), 1600); }).catch(() => {});
  };

  // The bar tracks whichever budget is tighter — 3dxchat enforces both the
  // 240-char and the 255-byte ceiling.
  const usedPct = Math.min(100, Math.round(Math.max(result.chars / 240, result.bytes / 255) * 100));
  const barColor = overLimit ? 'var(--danger)' : usedPct >= 88 ? 'var(--warn)' : 'var(--accent)';
  const actionTips = opt.tips.filter((tp) => tp.action);
  const optLoud = opt.show && (opt.state === 'over' || opt.state === 'warn');
  const optColor = opt.state === 'over' ? 'var(--danger)' : 'var(--warn)';

  const MAX = 468;

  return (
    <section className="flex flex-col" style={{ minHeight: 0 }}>
      {/* workspace header */}
      <div className="flex items-center justify-between shrink-0" style={{ maxWidth: MAX, width: '100%', margin: '0 auto', paddingBottom: 10 }}>
        <span className="sec-label">{t('preview')}</span>
        <button
          className="btn btn-sm"
          data-on={reorder}
          onClick={() => { setReorder((r) => !r); setEditing(null); }}
          style={reorder ? { background: 'var(--accent-soft)', borderColor: 'var(--accent-line)', color: '#c3c4ff' } : { background: 'transparent', color: 'var(--muted)' }}
        >
          {reorder ? <><Check size={13} /> {t('reorder_done')}</> : <><ArrowUpDown size={13} /> {t('reorder_btn')}</>}
        </button>
      </div>

      <div className="scroll-y flex-1" style={{ minHeight: 0 }}>
        <div style={{ maxWidth: MAX, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* sticky stage: the 3dxchat gift popup stays put while the code scrolls */}
          <div style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg)', paddingBottom: 12 }}>
            {/* 3dxchat profile popup mock — the gift itself renders exactly as before */}
            <div style={{ background: '#0f1115', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div className="flex items-center" style={{ gap: 8, padding: '7px 11px', background: 'rgba(255,255,255,.02)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>Sophey</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#fff', background: '#0a8f8a', padding: '3px 10px', borderRadius: 4 }}>Back To Profile</span>
                <X size={14} style={{ color: 'var(--dim)' }} />
              </div>
              <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
                {['Message', 'Gallery ( )', 'Gifts ( )', 'Send Gift', 'Unfriend', 'Report'].map((tb) => {
                  const on = tb === 'Gifts ( )';
                  return (
                    <span key={tb} style={{ flex: 1, textAlign: 'center', padding: '5px 1px', fontSize: 9.5, whiteSpace: 'nowrap', color: on ? 'var(--text)' : 'var(--dim)', borderBottom: on ? '2px solid var(--accent)' : '2px solid transparent' }}>{tb}</span>
                  );
                })}
              </div>
              <div className="flex flex-col items-center text-center" style={{ padding: '10px 14px 16px', gap: 5 }}>
                <div className="flex flex-col items-center" style={{ width: '100%' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, fontStyle: 'italic', color: '#ffffff' }}>MissLarifari</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--dim)', marginTop: 3 }}>Jun, 13 2026</span>
                </div>
                <div style={{ width: '90%', height: 1, background: 'var(--border)', margin: '5px auto 4px' }} />
                <div className="flex items-center justify-center" style={{ width: '100%', minHeight: 170, marginBottom: 2 }}>
                  <img src={import.meta.env.BASE_URL + 'gift-sticker.png'} alt="gift" style={{ maxWidth: 200, maxHeight: 200, width: 'auto', height: 'auto', objectFit: 'contain' }} />
                </div>
                {state.layout === 'custom' ? (
                  <div className="mono" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: '100%', fontSize: 13, lineHeight: 1.45, color: '#eaf2ff' }} dangerouslySetInnerHTML={{ __html: customPreviewHtml(state.customText) }} />
                ) : (
                  body()
                )}
              </div>
            </div>

          </div>

          {/* generated code */}
          <div
            onClick={copy}
            className="mono scroll-y"
            title={overLimit ? t('g_too_long') : t('copy_code')}
            style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', maxHeight: 132, whiteSpace: 'pre-wrap', wordBreak: 'break-word', cursor: overLimit ? 'default' : 'pointer' }}
          >
            {result.code || '…'}
          </div>

        </div>
      </div>
      {/* pinned footer: budget, primary actions, optimize — always visible */}
      <div className="shrink-0" style={{ maxWidth: MAX, width: '100%', margin: '0 auto', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* budget: thin bar + plain counts */}
          <div>
            <div style={{ height: 3, borderRadius: 2, background: 'var(--card)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: usedPct + '%', background: barColor, transition: 'width .16s ease, background .16s ease' }} />
            </div>
            <div className="flex items-center justify-between flex-wrap" style={{ marginTop: 7, gap: '2px 10px' }}>
              <span style={{ fontSize: 11.5, color: overLimit ? 'var(--danger)' : 'var(--muted)' }}>
                <span className="mono" style={{ color: overLimit ? 'var(--danger)' : 'var(--text)' }}>{result.chars}</span>
                <span className="mono"> / 240</span> {t('g_characters')}
              </span>
              <span className="mono" style={{ fontSize: 11, color: result.byteStatus === 'over' ? 'var(--danger)' : 'var(--dim)' }}>
                {result.bytes} / 255 {t('g_bytes_short')}
              </span>
            </div>
          </div>

          {/* primary actions stay with the preview, always reachable */}
          <div className="flex" style={{ gap: 8 }}>
            <button className="btn btn-primary" onClick={copy} disabled={overLimit} style={{ flex: 1 }}>
              {overLimit ? <><Ban size={15} /> {t('g_too_long')}</> : copied ? <><Check size={15} /> {t('copied')}</> : <><Copy size={15} /> {t('g_copy_gift')}</>}
            </button>
            <button className="btn" onClick={share} style={{ minWidth: 112 }}>
              {shared ? <><Check size={15} /> {t('g_link_copied')}</> : <><Share2 size={15} /> {t('g_share')}</>}
            </button>
          </div>
        {/* optimize + reset — quiet until the budget gets tight */}
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <div ref={optRef} style={{ position: 'relative' }}>
            <button
              className="btn btn-sm"
              onClick={() => setOptOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={optOpen}
              style={optLoud
                ? { background: 'transparent', borderColor: optColor, color: optColor }
                : { background: 'transparent', borderColor: 'transparent', color: 'var(--muted)' }}
            >
              {opt.state === 'over' ? <Ban size={13} /> : optLoud ? <TriangleAlert size={13} /> : <Lightbulb size={13} />}
              {t('g_optimize')}
              {optLoud && actionTips.length > 0 && (
                <span className="mono" style={{ fontSize: 10, padding: '0 5px', borderRadius: 999, background: optColor, color: '#10121a' }}>{actionTips.length}</span>
              )}
              <ChevronDown size={12} />
            </button>
            {optOpen && (
              <div className="pop" style={{ bottom: 'calc(100% + 6px)', left: 0, width: 320, padding: 12 }}>
                {opt.show ? (
                  <>
                    <div className="flex items-center" style={{ gap: 6, fontSize: 11.5, fontWeight: 600, color: opt.state === 'over' ? 'var(--danger)' : opt.state === 'warn' ? 'var(--warn)' : 'var(--muted)', marginBottom: 9 }}>
                      {opt.state === 'over' ? <Ban size={12} /> : opt.state === 'warn' ? <TriangleAlert size={12} /> : <Lightbulb size={12} />}
                      {opt.headerMsg}
                    </div>
                    <div className="flex flex-col" style={{ gap: 6 }}>
                      {opt.tips.map((tip, i) =>
                        tip.action ? (
                          <div key={i} className="flex items-center justify-between" style={{ gap: 8, fontSize: 11.5, color: 'var(--text)' }}>
                            <span>{tip.msg}</span>
                            <button
                              className="btn btn-sm"
                              onClick={() => (tip.action === 'font' ? resetFont(tip.field!) : removeField(tip.field!))}
                              style={{ flex: '0 0 auto', padding: '3px 9px', fontSize: 11 }}
                            >
                              {tip.action === 'font' ? t('opt_switch') : t('opt_remove')}
                            </button>
                          </div>
                        ) : (
                          <div key={i} className="flex items-start" style={{ gap: 6, fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45 }}>
                            {tip.level === 'warn' ? <TriangleAlert size={11} style={{ marginTop: 2, flex: '0 0 auto' }} /> : <ArrowRight size={11} style={{ marginTop: 2, flex: '0 0 auto' }} />}
                            {tip.msg}
                          </div>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <div className="hint">{t('g_opt_none')}</div>
                )}
              </div>
            )}
          </div>

          <button className="btn btn-sm btn-ghost" onClick={onReset} title={t('reset_all')}>
            <RotateCcw size={13} /> {t('g_reset')}
          </button>
        </div>
      </div>
    </section>
  );
}
