import { useEffect, useRef, useState } from 'react';
import { Undo2, Redo2, Gift, ChevronDown, HelpCircle, Check, UserPen } from 'lucide-react';
import { useI18n, LANGS, type Lang } from '../i18n';
import { THE_CLOUD_DISCORD, PROFILLY_URL, LARI_URL } from './links';

// The header: who made this, the two undo arrows, language, help. Everything
// else — credits, supporters, disclaimer — lives in the About sheet.
export default function Header({
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
    const onDown = (e: MouseEvent) => { if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLangOpen(false); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [langOpen]);

  return (
    <header
      className="flex items-center justify-between shrink-0"
      style={{
        height: compact ? 50 : 56,
        padding: compact ? '0 12px' : '0 18px',
        borderBottom: '1px solid var(--line)',
        background: 'linear-gradient(180deg, rgba(255,255,255,.015), transparent), var(--panel)',
      }}
    >
      <div className="flex items-center" style={{ gap: 10, minWidth: 0 }}>
        <Gift size={17} style={{ color: 'var(--accent)', flex: '0 0 auto' }} />
        {!compact && (
          <>
            <a
              href={THE_CLOUD_DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow"
              style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              The&nbsp;Cloud
            </a>
            <span aria-hidden="true" style={{ color: 'var(--bloom)', fontSize: 11, lineHeight: 1 }}>✿</span>
          </>
        )}
        <span className="flex items-baseline" style={{ gap: 7, minWidth: 0 }}>
          <span className="display" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '.02em' }}>Gifty</span>
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

      <div className="flex items-center" style={{ gap: 5 }}>
        {/* Sister tool — Lari's 3dx profile-text editor. Labelled like the brand
            on the left, so it reads as "what it is › what it's called". Compact
            keeps the icon only; the full label would overflow a phone header. */}
        <a
          className="btn btn-sm"
          href={PROFILLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          title={`Profilly · 3DX ${t('g_profile_editor')}`}
          style={{ gap: 7, textDecoration: 'none', marginRight: 3, ...(compact ? { padding: '7px 9px' } : null) }}
        >
          <UserPen size={14} style={{ color: 'var(--muted)' }} />
          {!compact && (
            <>
              <span className="eyebrow">{t('g_profile_editor')}</span>
              <span style={{ color: 'var(--dim)' }}>›</span>
              <span style={{ color: 'var(--text)' }}>Profilly</span>
            </>
          )}
        </a>

        <button className="icon-btn" title={t('undo_title')} onClick={undo} disabled={!canUndo}><Undo2 size={15} /></button>
        <button className="icon-btn" title={t('redo_title')} onClick={redo} disabled={!canRedo}><Redo2 size={15} /></button>

        <span style={{ width: 1, height: 18, background: 'var(--line)', margin: '0 5px' }} />

        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            className="btn btn-sm"
            onClick={() => setLangOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
            title={t('g_language')}
            style={{ gap: 5, textTransform: 'uppercase', color: 'var(--muted)' }}
          >
            {lang} <ChevronDown size={13} />
          </button>
          {langOpen && (
            <div className="pop" role="listbox" style={{ top: 'calc(100% + 7px)', right: 0, minWidth: 100 }}>
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
