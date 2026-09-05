import { useEffect } from 'react';
import { X, LayoutGrid, Pencil, Eye, Gauge, Copy } from 'lucide-react';
import { useI18n } from '../i18n';

// What the thing does, in five steps.
//
// The one number worth knowing is the pair of ceilings: 3dxchat refuses a gift
// over 240 characters OR 255 bytes, and those are not the same limit — ornate
// script spends two to three bytes on a letter that costs one character. Which
// is why the counter shows both.

const STEPS = [
  { icon: LayoutGrid, key: 'howto_1' },
  { icon: Pencil, key: 'howto_2' },
  { icon: Eye, key: 'howto_3' },
  { icon: Gauge, key: 'howto_4' },
  { icon: Copy, key: 'howto_5' },
] as const;

export default function About({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();

  // Escape closes it, like every other dialog on the machine.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="veil" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={t('howto_title')} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <div className="panel-title">{t('howto_title')}</div>
            <div className="panel-sub">{t('howto_sub')}</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label={t('cancel')} style={{ width: 28, height: 28 }}>
            <X size={16} />
          </button>
        </div>

        <ol className="steps">
          {STEPS.map(({ icon: Icon, key }, i) => (
            <li key={key}>
              <span className="step-n">{i + 1}</span>
              <Icon size={14} className="step-i" />
              <span className="step-t">{t(key)}</span>
            </li>
          ))}
        </ol>

        <p className="sheet-note">{t('howto_note')}</p>
      </div>
    </div>
  );
}
