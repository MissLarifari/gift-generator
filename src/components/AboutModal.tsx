import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Gift, ExternalLink, UserPen } from 'lucide-react';
import { useI18n } from '../i18n';
import { THE_CLOUD_DISCORD, PROFILLY_URL, THANKS_NAMES } from './links';

// lucide has no brand logos — official Discord mark.
const DiscordGlyph = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9461 2.4189-2.1568 2.4189Z" />
  </svg>
);

// Credits / About dialog — everything that used to clutter the header
// (supporters, external links, disclaimer, the 3 how-it-works steps).
// Presentational only.
export default function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const steps = [t('g_intro_1'), t('g_intro_2'), t('g_intro_3')];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,8,11,.66)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="panel"
            style={{ width: 380, maxWidth: '94vw', maxHeight: '88vh', overflowY: 'auto', padding: 20, boxShadow: '0 22px 60px rgba(0,0,0,.5)' }}
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <span className="flex items-center" style={{ gap: 9 }}>
                <Gift size={17} style={{ color: 'var(--accent)' }} />
                <span className="display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '.02em' }}>Gifty</span>
              </span>
              <button className="icon-btn" onClick={onClose} aria-label={t('g_close')}><X size={16} /></button>
            </div>

            {/* how it works */}
            <div className="sec-label" style={{ marginBottom: 9 }}>{t('howto_title')}</div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
              {steps.map((s, i) => (
                <li key={s} className="flex items-center" style={{ gap: 10, fontSize: 12.5, color: 'var(--text)' }}>
                  <span className="mono" style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, flex: '0 0 auto', borderRadius: 6, background: 'var(--card)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--accent)' }}>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>

            {/* links */}
            <div className="sec-label" style={{ marginBottom: 9 }}>{t('g_links')}</div>
            <div className="flex flex-col" style={{ gap: 7, marginBottom: 18 }}>
              <a className="btn" href={THE_CLOUD_DISCORD} target="_blank" rel="noopener noreferrer" style={{ justifyContent: 'flex-start', textDecoration: 'none' }}>
                <DiscordGlyph size={15} /> The Cloud · Discord <ExternalLink size={13} style={{ marginLeft: 'auto', color: 'var(--muted)' }} />
              </a>
              <a className="btn" href={PROFILLY_URL} target="_blank" rel="noopener noreferrer" style={{ justifyContent: 'flex-start', textDecoration: 'none' }}>
                <UserPen size={15} /> Profilly · 3DX Profile Editor <ExternalLink size={13} style={{ marginLeft: 'auto', color: 'var(--muted)' }} />
              </a>
            </div>

            {/* supporters */}
            <div className="sec-label" style={{ marginBottom: 9 }}>{t('g_supporters')}</div>
            <div className="flex flex-wrap" style={{ gap: 5, marginBottom: 8 }}>
              {THANKS_NAMES.map((n) => (
                <span key={n} style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 999, background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{n}</span>
              ))}
              <span style={{ fontSize: 11.5, padding: '3px 4px', color: 'var(--dim)' }}>{t('g_and_more')}</span>
            </div>

            <div className="divider" style={{ margin: '14px 0 12px' }} />
            <div style={{ fontSize: 11, color: 'var(--dim)', lineHeight: 1.55 }}>{t('g_disclaimer')}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
              <a href="https://sophey.vodka/lari" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', textDecoration: 'none' }}>{t('g_made_by')}</a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
