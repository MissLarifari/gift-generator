import { useState } from 'react';
import { Copy, Share2, Check, Ban, RotateCcw, Wand2, ChevronUp, AlertTriangle } from 'lucide-react';
import { giftChars, giftBytes, optimize } from '../engine';
import { buildCodeShareUrl } from '../share';
import { useI18n } from '../i18n';

// Under the stage: what the gift costs, and the two ways to get it out.
// 3dxchat enforces both ceilings — 240 characters AND 255 bytes — so the meter
// tracks whichever is tighter.

export default function Actions({ code, setCode, onReset }: { code: string; setCode: (next: string) => void; onReset: () => void }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [openTips, setOpenTips] = useState(false);
  // Recomputed from the code every render: apply one and the rest re-measure
  // themselves against the result.
  const tips = optimize(code);
  // Counted off the code itself, so the meter cannot disagree with what the
  // clipboard hands to 3dxchat.
  const chars = giftChars(code);
  const bytes = giftBytes(code);
  const over = chars > 240 || bytes > 255;

  const copy = () => {
    if (over) return;
    navigator.clipboard?.writeText(code)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); })
      .catch(() => {});
  };

  const share = () => {
    navigator.clipboard?.writeText(buildCodeShareUrl(code))
      .then(() => { setShared(true); setTimeout(() => setShared(false), 1600); })
      .catch(() => {});
  };

  const pct = Math.min(100, Math.round(Math.max(chars / 240, bytes / 255) * 100));
  const meterColor = over ? 'var(--danger)' : pct >= 88 ? 'var(--warn)' : 'var(--accent)';

  return (
    // A card of its own under the gift: the two counters as a readout, then
    // the two ways out. The old version had the numbers floating loose above
    // the buttons, which read as debris rather than as part of the gift.
    <section className="slab" style={{ width: '100%', marginTop: 14, padding: '13px 15px 14px' }}>
      <div className="flex items-end justify-between" style={{ gap: 12, marginBottom: 9 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 2 }}>{t('g_characters')}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span className="mono" style={{ fontSize: 21, fontWeight: 700, lineHeight: 1, color: chars > 240 ? 'var(--danger)' : 'var(--text)' }}>{chars}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>/ 240</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="eyebrow" style={{ marginBottom: 2 }}>{t('g_bytes_short')}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'flex-end' }}>
            <span className="mono" style={{ fontSize: 21, fontWeight: 700, lineHeight: 1, color: bytes > 255 ? 'var(--danger)' : 'var(--text)' }}>{bytes}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>/ 255</span>
          </div>
        </div>
      </div>

      {/* One bar for whichever ceiling is closer — that is the one that stops you. */}
      <div className="meter"><span style={{ width: pct + '%', background: meterColor }} /></div>

      <div className="flex" style={{ gap: 9, marginTop: 13 }}>
        <button className="btn btn-lg btn-primary" onClick={copy} disabled={over} style={{ flex: 1 }}>
          {over ? <><Ban size={16} /> {t('g_too_long')}</> : copied ? <><Check size={16} /> {t('copied')}</> : <><Copy size={16} /> {t('g_copy_gift')}</>}
        </button>
        <button className="btn btn-lg" onClick={share} style={{ minWidth: 112 }}>
          {shared ? <><Check size={15} /> {t('g_link_copied')}</> : <><Share2 size={15} /> {t('g_share')}</>}
        </button>
      </div>

      {/* The list opens UPWARD: this card sits at the bottom of the column, so
          downward it would push itself off the screen. */}
      <div className="optzone">
        {openTips && tips.length > 0 && (
          <div className="optlist">
            {tips.map((tip) => (
              <button key={tip.id} className="opt" onClick={() => { setCode(tip.fixed); setOpenTips(false); }}>
                <span className="opt-save">-{tip.saves}</span>
                <span className="opt-body">
                  <span className="opt-t">{t(tip.key)}</span>
                  {tip.changesLook && <span className="opt-warn">{t('g_opt_changes')}</span>}
                </span>
              </button>
            ))}
            {tips.filter((x) => !x.changesLook).length > 1 && (
              <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 2 }}
                onClick={() => {
                  // One at a time, re-measuring in between: two rewrites can
                  // overlap, and only the engine knows what is left to save.
                  let next = code;
                  for (let i = 0; i < 6; i++) {
                    const safe = optimize(next).find((x) => !x.changesLook);
                    if (!safe) break;
                    next = safe.fixed;
                  }
                  setCode(next);
                  setOpenTips(false);
                }}>
                {t('g_opt_all')}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between" style={{ marginTop: 11, paddingTop: 10, borderTop: '1px solid var(--line-soft)', gap: 8 }}>
          {tips.length > 0 ? (
            <button className="btn btn-sm optbtn" data-over={over} onClick={() => setOpenTips((o) => !o)}>
              {over ? <AlertTriangle size={13} /> : <Wand2 size={13} />}
              {t('g_optimize')}
              <span className="optn">{tips.length}</span>
              <ChevronUp size={12} style={{ transform: openTips ? 'rotate(180deg)' : undefined, transition: 'transform .15s ease' }} />
            </button>
          ) : (
            <span className="hint">{t('g_paste_hint')}</span>
          )}
          <button className="btn btn-sm btn-quiet" onClick={onReset} title={t('reset_all')}>
            <RotateCcw size={13} /> {t('g_reset')}
          </button>
        </div>
      </div>
    </section>
  );
}

const NAME = 'MissLarifari';

/**
 * A quiet ask, once, where the work is done — not a banner. The guestbook sits
 * with it on purpose: this is the sentence people are reading when they feel
 * like saying something back.
 */
export function ThankYou() {
  const { t } = useI18n();
  // Same shape as Profilly's credit line: the name carries the weight, and the
  // heart closes the sentence instead of announcing it. The name is spelled the
  // same in all four languages, so splitting on it needs no extra keys.
  const [before, after] = t('g_thanks').split(NAME);
  return (
    <div className="thanks">
      <p>
        {before}<b>{NAME}</b>{after}
        {' '}<span className="hrt" aria-hidden="true">♥</span>
      </p>
    </div>
  );
}
