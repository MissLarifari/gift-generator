import { Sparkles, Undo2, Redo2, Gift } from 'lucide-react';
import type { GenerateResult, CounterStatus } from '../engine';
import { useI18n, LANGS, type Lang } from '../i18n';

const statusColor = (s: CounterStatus) => (s === 'over' ? '#ff6b6b' : s === 'warn' ? '#ffce8a' : '#fff');

// The Cloud's Discord server invite.
const THE_CLOUD_DISCORD = 'https://discord.gg/h3uAk96r68';

// Supporters shown in the brand hover popover (from the legacy topbar).
const THANKS_NAMES = ['Alert', 'BiigG', 'Crizzo', 'Denji', 'Endorfin', 'Esphio', 'Fabi', 'Hater', 'iVix', 'Maxr', 'OliverCream', 'Redji', 'ReneL', 'Sophey'];

// lucide has no brand logos — use the official Discord mark.
const DiscordGlyph = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9461 2.4189-2.1568 2.4189Z" />
  </svg>
);

export default function Topbar({
  result,
  undo,
  redo,
  canUndo,
  canRedo,
  compact = false,
}: {
  result: GenerateResult;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  compact?: boolean;
}) {
  const { lang, setLang, t } = useI18n();
  const histBtn = (enabled: boolean): React.CSSProperties => ({
    width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center',
    background: 'rgba(255,255,255,.05)', border: '1px solid var(--border)',
    color: enabled ? '#cdd9f0' : '#3a4861', cursor: enabled ? 'pointer' : 'not-allowed',
  });

  return (
    <div className={`flex items-center justify-between shrink-0 ${compact ? 'flex-wrap gap-y-2 px-[12px] py-[8px]' : 'px-[18px]'}`} style={{ ...(compact ? { minHeight: 54 } : { height: 56 }), borderBottom: '1px solid var(--border)', background: 'rgba(13,20,48,.5)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center gap-3">
        <span className="brand-wrap flex items-center gap-[7px]" style={{ position: 'relative' }}>
          <Gift size={compact ? 19 : 22} className="brand-gift" style={{ color: 'var(--ind)', filter: 'drop-shadow(0 0 8px rgba(87,224,240,.5))' }} />
          <span className="word" style={{ fontSize: compact ? 20 : 24 }}>GIFTY</span>
          <span className="brand-thanks">
            <span className="word" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 5 }}>♥ Thank you for the support</span>
            {THANKS_NAMES.map((n) => (
              <span key={n} style={{ fontWeight: 600, color: '#d8e2f5', lineHeight: 1.35 }}>{n}</span>
            ))}
            <span style={{ color: '#7e8fb5' }}>… and many more</span>
            <span style={{ marginTop: 6, color: '#9fb3d6', fontSize: 10.5 }}>made with <span style={{ color: 'var(--pink)' }}>♥</span> by MissLarifari</span>
          </span>
        </span>
        {!compact && (
          <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#bfeefa', border: '1px solid rgba(87,224,240,.4)', borderRadius: 20, padding: '3px 10px', boxShadow: '0 0 10px rgba(87,224,240,.22)' }}>
            <Sparkles size={13} /> No Tracking
          </span>
        )}
        <div className="flex gap-[5px]" style={{ marginLeft: 4 }}>
          <button title={t('undo_title')} onClick={undo} disabled={!canUndo} style={histBtn(canUndo)}><Undo2 size={15} /></button>
          <button title={t('redo_title')} onClick={redo} disabled={!canRedo} style={histBtn(canRedo)}><Redo2 size={15} /></button>
        </div>
      </div>

      <div className="flex items-center" style={{ gap: compact ? 6 : 11, background: 'rgba(6,9,18,.5)', border: '1px solid var(--border-2)', borderRadius: 20, padding: compact ? '4px 11px' : '6px 15px' }}>
        {!compact && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{t('chars')}</span>}
        <span className="mono" style={{ fontSize: compact ? 13 : 15, fontWeight: 700, color: statusColor(result.charStatus) }}>{result.chars}</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>/240</span>
        <span style={{ width: 1, height: 15, background: 'var(--border-2)' }} />
        {!compact && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{t('bytes')}</span>}
        <span className="mono" style={{ fontSize: compact ? 13 : 15, fontWeight: 700, color: statusColor(result.byteStatus) }}>{result.bytes}</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>/255</span>
      </div>

      <div className="flex items-center gap-[10px]">
        <a
          href={THE_CLOUD_DISCORD}
          target="_blank"
          rel="noopener noreferrer"
          title="The Cloud · Discord"
          className="flex items-center gap-[6px]"
          style={{ fontSize: 11, fontWeight: 600, color: '#e6e9ff', background: 'rgba(88,101,242,.16)', border: '1px solid rgba(124,131,255,.5)', borderRadius: 20, padding: compact ? '6px' : '5px 11px', textDecoration: 'none', boxShadow: '0 0 12px rgba(88,101,242,.25)' }}
        >
          <DiscordGlyph size={compact ? 16 : 14} /> {!compact && 'The Cloud'}
        </a>
        <div className="flex gap-[5px]">
        {LANGS.map((l: Lang) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{ fontSize: 11, padding: '5px 9px', borderRadius: 7, cursor: 'pointer', textTransform: 'uppercase', ...(l === lang ? { background: 'linear-gradient(90deg,var(--ind),var(--cyan))', color: '#08131f', fontWeight: 600, border: 'none' } : { background: 'transparent', border: '1px solid var(--border)', color: '#cdd9f0' }) }}
          >
            {l}
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}
