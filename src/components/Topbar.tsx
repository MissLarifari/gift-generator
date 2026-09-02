import { useEffect, useRef, useState } from 'react';
import { Undo2, Redo2, Gift, ChevronDown, HelpCircle, Check, UserPen } from 'lucide-react';
import { useI18n, LANGS, type Lang } from '../i18n';
import { THE_CLOUD_DISCORD, PROFILLY_URL, LARI_URL } from './links';

// Minimal header: THE CLOUD / Gifty  ·  undo/redo  ·  EN ▾  ·  ?
// Credits, supporters and external links live in the About dialog now.
export default function Topbar({
  undo,
  redo,
  canUndo,
  canRedo,
  onAbout,
  compact = false,
}: {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAbout: () => void;
  compact?: boolean;
}) {
  const { lang, setLang, t } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLangOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [langOpen]);

  return (
    <header
      className="flex items-center justify-between shrink-0"
      style={{ height: compact ? 48 : 52, padding: compact ? '0 12px' : '0 16px', borderBottom: '1px solid var(--border)', background: 'var(--panel)' }}
    >
      {/* brand */}
      <div className="brand flex items-center" style={{ gap: 9, minWidth: 0 }}>
        <Gift size={16} className="brand-gift" style={{ color: 'var(--accent)', flex: '0 0 auto' }} />
        {!compact && (
          <>
            <a
              href={THE_CLOUD_DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.11em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              The&nbsp;Cloud
            </a>
            <span style={{ color: '#39414d', fontSize: 13 }}>/</span>
          </>
        )}
        <span className="flex items-baseline" style={{ gap: 6, minWidth: 0 }}>
          <span className="display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '.02em' }}>Gifty</span>
          <a
            href={LARI_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Gifty by Lari"
            style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            by&nbsp;Lari
          </a>
        </span>
      </div>

      {/* actions */}
      <div className="flex items-center" style={{ gap: 4 }}>
        {/* sister tool — Lari's 3dx profile-text editor. Labelled like the brand on
            the left (THE CLOUD / Gifty) so it reads as "what it is › what it's called".
            Compact keeps the icon only; the full label would overflow a phone header. */}
        <a
          className="btn btn-sm"
          href={PROFILLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          title={`Profilly · 3DX ${t('g_profile_editor')}`}
          style={{ gap: 7, textDecoration: 'none', marginRight: 4, ...(compact ? { padding: '6px 8px' } : null) }}
        >
          <UserPen size={14} style={{ color: 'var(--muted)' }} />
          {!compact && (
            <>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                {t('g_profile_editor')}
              </span>
              <span style={{ color: '#39414d' }}>›</span>
              <span style={{ color: 'var(--text)' }}>Profilly</span>
            </>
          )}
        </a>

        <button className="icon-btn" title={t('undo_title')} onClick={undo} disabled={!canUndo}><Undo2 size={15} /></button>
        <button className="icon-btn" title={t('redo_title')} onClick={redo} disabled={!canRedo}><Redo2 size={15} /></button>

        <span style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 5px' }} />

        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            className="btn btn-sm"
            onClick={() => setLangOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
            title={t('g_language')}
            style={{ gap: 4, textTransform: 'uppercase', color: 'var(--muted)' }}
          >
            {lang} <ChevronDown size={13} />
          </button>
          {langOpen && (
            <div className="pop" role="listbox" style={{ top: 'calc(100% + 6px)', right: 0, minWidth: 96 }}>
              {LANGS.map((l: Lang) => (
                <button key={l} role="option" aria-selected={l === lang} className="menu-item" data-on={l === lang} onClick={() => { setLang(l); setLangOpen(false); }} style={{ textTransform: 'uppercase' }}>
                  {l}
                  {l === lang && <Check size={13} style={{ marginLeft: 'auto' }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="icon-btn" onClick={onAbout} title={t('g_help')} aria-label={t('g_help')}><HelpCircle size={16} /></button>
      </div>
    </header>
  );
}
