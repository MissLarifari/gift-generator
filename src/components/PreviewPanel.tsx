import { useState, useMemo, type CSSProperties, type ReactNode } from 'react';
import { Copy, Share2, RotateCcw, X, Check, Ban, TriangleAlert, Lightbulb, ArrowRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { applyFont, buildOptimizeTips } from '../engine';
import type { GiftState, GenerateResult, FieldId } from '../engine';
import type { Commit } from '../state';
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
  const opt = useMemo(() => (state.layout === 'custom' ? { show: false, state: 'info' as const, headerMsg: '', tips: [] } : buildOptimizeTips(state, result.chars, result.bytes, result.lines, t)), [state, result, t]);
  const overLimit = result.over;

  // Desktop: edit inline in the preview. Mobile: hand off to the editor (App jumps
  // to the Edit tab and focuses the field) — the inline input is too fiddly on touch.
  const startEdit = (f: FieldId) => {
    if (!isMobile) setEditing(f);
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
    background: 'rgba(255,255,255,.06)', border: `1px solid ${danger ? 'rgba(255,122,217,.4)' : 'var(--border)'}`,
    color: !enabled ? '#3a4861' : danger ? '#ff9be3' : '#cdd9f0', cursor: enabled ? 'pointer' : 'not-allowed',
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
            fontWeight: f === 'mainText' ? 700 : 400, textAlign: 'center', background: 'rgba(87,224,240,.1)',
            border: '1px solid rgba(87,224,240,.55)', borderRadius: 6, padding: '0 6px', outline: 'none',
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

  const sep = (k: string) => <span key={k} style={{ color: 'var(--dim)' }}> · </span>;
  const row = (children: ReactNode, k: string) => <div key={k} style={{ minHeight: 4 }}>{children}</div>;
  const inlineRow = (children: ReactNode, k: string) => <div key={k} className="flex flex-wrap justify-center items-baseline" style={{ columnGap: 8, rowGap: 2 }}>{children}</div>;

  // Arrange preview lines to match the chosen layout (mirrors applyLayout).
  const body = (): ReactNode => {
    const order = state.lineOrder;
    const has = (f: FieldId) => !!state.text[f] || editing === f;
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
      case 'minimal':
        return order.filter((f) => f === 'mainText' || f === 'kaomoji').map((f) => row(field(f), f));
      case 'inline':
        return [
          inlineRow([field('dekoTop', 'i-dt1'), field('topText', 'i-tt'), field('mainText', 'i-mt'), field('dekoTop', 'i-dt2')], 'i-row'),
          row(field('bottomText'), 'i-b'),
          row(field('kaomoji'), 'i-k'),
          row(field('dekoBottom'), 'i-db'),
        ];
      case 'compact':
        return [
          row(field('dekoTop'), 'c-dt'),
          inlineRow([field('topText', 'c-tt'), has('topText') && has('mainText') ? sep('c-s1') : null, field('mainText', 'c-mt'), has('mainText') && has('bottomText') ? sep('c-s2') : null, field('bottomText', 'c-bt')], 'c-row'),
          row(field('kaomoji'), 'c-k'),
          row(field('dekoBottom'), 'c-db'),
        ];
      case 'framed': {
        const nodes = order.filter((f) => has(f)).map((f) => row(field(f), 'f-' + f));
        if (has('dekoTop') && !has('dekoBottom')) nodes.push(row(field('dekoTop', 'f-frame'), 'f-frame'));
        return nodes;
      }
      case 'pyramid': {
        // Auto word-pyramid: render mainText as cumulative growing lines
        // (you / you are / you are my …); other fields stack around it.
        const words = state.text.mainText.trim() ? state.text.mainText.trim().split(/\s+/).filter(Boolean) : [];
        const nodes: ReactNode[] = [];
        for (const f of order) {
          if (f !== 'mainText') { if (has(f)) nodes.push(row(field(f), f)); continue; }
          if (editing === 'mainText') { nodes.push(row(field('mainText'), 'pyr-edit')); continue; }
          words.forEach((_, i) => {
            const phrase = applyFont(words.slice(0, i + 1).join(' '), state.fonts.mainText);
            nodes.push(
              <div key={'pyr-' + i} style={{ minHeight: 4 }}>
                <span onClick={() => startEdit('mainText')} title={t('click_edit')} style={displayStyle('mainText')}>{phrase}</span>
              </div>,
            );
          });
        }
        return nodes;
      }
      default: // center, flipped (all stack centered)
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

  const budgetPct = Math.min(100, Math.round((result.bytes / 255) * 100));
  // Cloud-palette status colours (was amber/red, which clashed with the site)
  const headerColor = opt.state === 'over' ? 'var(--pink)' : opt.state === 'warn' ? 'var(--violet)' : 'var(--ind)';

  return (
    <div className="flex flex-col items-center overflow-y-auto" style={{ gap: 8 }}>
      <div className="flex items-center justify-between w-full" style={{ maxWidth: 460, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--muted)' }}>
        <span>{t('preview')}</span>
        <button onClick={() => { setReorder((r) => !r); setEditing(null); }} className="flex items-center gap-[5px]" style={{ fontSize: 11, textTransform: 'none', letterSpacing: 0, borderRadius: 7, padding: '4px 9px', cursor: 'pointer', border: '1px solid rgba(87,224,240,.35)', ...(reorder ? { background: 'linear-gradient(90deg,var(--ind),var(--cyan))', color: '#08131f', fontWeight: 600 } : { background: 'transparent', color: 'var(--ind)' }) }}>
          {reorder ? <><Check size={12} /> {t('reorder_done')}</> : <><ArrowUpDown size={12} /> {t('reorder_btn')}</>}
        </button>
      </div>

      {/* 3dxchat profile popup — restored, but tinted to the site palette (navy + cyan
          lines) instead of the legacy near-black #141420 */}
      <div className="w-full" style={{ maxWidth: 460, flexShrink: 0, background: 'rgba(10,15,34,.92)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 34px rgba(0,0,0,.4)' }}>
        {/* header */}
        <div className="flex items-center" style={{ gap: 8, padding: '7px 11px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--pink)' }}>Sophey</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#fff', background: '#0a8f8a', padding: '3px 10px', borderRadius: 4 }}>Back To Profile</span>
          <X size={14} style={{ color: '#7e8fb5' }} />
        </div>
        {/* tabs */}
        <div className="flex" style={{ background: 'rgba(255,255,255,.02)', borderBottom: '1px solid var(--border)' }}>
          {['Message', 'Gallery ( )', 'Gifts ( )', 'Send Gift', 'Unfriend', 'Report'].map((tb) => {
            const on = tb === 'Gifts ( )';
            return (
              <span key={tb} style={{ flex: 1, textAlign: 'center', padding: '5px 1px', fontSize: 9.5, whiteSpace: 'nowrap', color: on ? 'var(--ind)' : '#7e8fb5', background: on ? 'rgba(87,224,240,.08)' : 'transparent', borderBottom: on ? '2px solid var(--ind)' : '2px solid transparent' }}>{tb}</span>
            );
          })}
        </div>
        {/* body */}
        <div className="flex flex-col items-center text-center" style={{ padding: '10px 14px 16px', gap: 5 }}>
          <div className="flex flex-col items-center" style={{ width: '100%' }}>
            <span style={{ fontSize: 13, fontWeight: 600, fontStyle: 'italic', color: '#ffffff' }}>MissLarifari</span>
            <span className="mono" style={{ fontSize: 11, color: '#7e8fb5', marginTop: 3 }}>Jun, 13 2026</span>
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

      <div className="flex items-center w-full" style={{ maxWidth: 460, gap: 9 }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)' }}>{t('g_budget')}</span>
        <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: budgetPct + '%', background: result.byteStatus === 'over' ? '#ff6b6b' : result.byteStatus === 'warn' ? '#ffce8a' : 'linear-gradient(90deg,var(--ind),var(--cyan))' }} />
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{budgetPct}%</span>
      </div>

      <div onClick={copy} className="mono w-full" style={{ maxWidth: 460, fontSize: 11.5, lineHeight: 1.5, color: '#aab8d4', background: 'rgba(6,9,18,.55)', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 11px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', cursor: overLimit ? 'default' : 'pointer' }}>
        {result.code || '…'}
      </div>

      {opt.show && (
        <div className="w-full" style={{ maxWidth: 460, border: `1px solid ${opt.state === 'over' ? 'rgba(255,122,217,.45)' : opt.state === 'warn' ? 'rgba(155,123,255,.45)' : 'var(--border)'}`, borderRadius: 9, padding: '5px 9px', background: 'var(--surface)' }}>
          <div className="flex items-center gap-[5px]" style={{ fontSize: 10.5, fontWeight: 600, color: headerColor, marginBottom: 2 }}>
            {opt.state === 'over' ? <Ban size={11} /> : opt.state === 'warn' ? <TriangleAlert size={11} /> : <Lightbulb size={11} />}
            {opt.headerMsg}
          </div>
          <div className="flex flex-col gap-[1px]">
            {opt.tips.map((tip, i) =>
              tip.action ? (
                <div key={i} className="flex items-center justify-between gap-[8px]" style={{ fontSize: 10, color: '#ff9be3' }}>
                  <span className="flex items-center gap-[4px]"><X size={10} /> {tip.msg}</span>
                  <button onClick={() => (tip.action === 'font' ? resetFont(tip.field!) : removeField(tip.field!))} style={{ fontSize: 9, padding: '0px 7px', borderRadius: 5, border: '1px solid rgba(255,122,217,.4)', color: '#ff9be3', background: 'rgba(255,122,217,.1)', cursor: 'pointer', flex: '0 0 auto' }}>
                    {tip.action === 'font' ? 'reset' : 'remove'}
                  </button>
                </div>
              ) : (
                <div key={i} className="flex items-center gap-[4px]" style={{ fontSize: 10, color: tip.level === 'warn' ? '#b9a8ff' : tip.level === 'info' ? '#9fc9ff' : 'var(--muted)' }}>
                  {tip.level === 'warn' ? <TriangleAlert size={10} /> : tip.level === 'info' ? <ArrowRight size={10} /> : <span style={{ width: '.7em', textAlign: 'center', display: 'inline-block' }}>·</span>}
                  {tip.msg}
                </div>
              ),
            )}
          </div>
        </div>
      )}

      <div className="flex w-full" style={{ maxWidth: 460, gap: 8 }}>
        <button onClick={copy} disabled={overLimit} className="flex-1 flex items-center justify-center gap-[7px]" style={{ fontSize: 13, fontWeight: 600, padding: '11px 0', borderRadius: 9, cursor: overLimit ? 'not-allowed' : 'pointer', ...(overLimit ? { background: 'rgba(255,107,107,.12)', color: '#ff9b9b', border: '1px solid rgba(255,107,107,.4)' } : { background: 'linear-gradient(90deg,var(--ind),var(--cyan))', color: '#08131f', border: 'none', boxShadow: '0 0 18px rgba(87,224,240,.3)' }) }}>
          {overLimit ? <><Ban size={15} /> {t('g_too_long')}</> : copied ? <><Check size={15} /> {t('copied')}</> : <><Copy size={15} /> {t('copy_code')}</>}
        </button>
        <button onClick={share} className="flex-1 flex items-center justify-center gap-[7px]" style={{ fontSize: 13, fontWeight: 600, padding: '11px 0', borderRadius: 9, cursor: 'pointer', color: 'var(--ind)', background: 'transparent', border: '1px solid rgba(87,224,240,.4)' }}>
          {shared ? <><Check size={15} /> {t('g_link_copied')}</> : <><Share2 size={15} /> {t('g_share')}</>}
        </button>
        <button onClick={onReset} className="flex items-center justify-center gap-[6px]" style={{ fontSize: 13, fontWeight: 600, padding: '11px 14px', borderRadius: 9, cursor: 'pointer', color: '#cdd9f0', background: 'transparent', border: '1px solid var(--border)' }}>
          <RotateCcw size={15} /> {t('g_reset')}
        </button>
      </div>
    </div>
  );
}
