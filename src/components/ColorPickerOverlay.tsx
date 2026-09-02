import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, Ban } from 'lucide-react';
import { GIFT_COLORS } from '../data/palette';
import { useI18n } from '../i18n';

export type ColorState = {
  noColor: boolean;
  gradient: boolean;
  color: string; // solid colour
  c1: string; // gradient stop 1
  c2: string; // gradient stop 2
};

type Props = {
  open: boolean;
  fieldLabel?: string;
  initial: ColorState;
  onApply: (s: ColorState) => void;
  onClose: () => void;
};

const HEX = /^#[0-9a-fA-F]{6}$/;

function normalizeHex(v: string): string | null {
  let h = v.trim();
  if (h && !h.startsWith('#')) h = '#' + h;
  if (/^#[0-9a-fA-F]{3}$/.test(h)) h = '#' + h.slice(1).split('').map((c) => c + c).join('');
  return HEX.test(h) ? h : null;
}

export default function ColorPickerOverlay({ open, fieldLabel, initial, onApply, onClose }: Props) {
  const { t } = useI18n();
  const [s, setS] = useState<ColorState>(initial);
  const [hexText, setHexText] = useState(initial.color);

  // re-seed when (re)opened for a different field
  useEffect(() => {
    if (open) {
      setS(initial);
      setHexText(initial.color);
    }
  }, [open, initial]);

  // Esc to cancel
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const pickSolid = (hex: string) => {
    // choosing a single colour turns gradient OFF (the bug we fixed in the old app)
    setS((p) => ({ ...p, color: hex, gradient: false, noColor: false }));
    setHexText(hex);
  };

  const previewBg = s.noColor
    ? 'repeating-conic-gradient(#3a4049 0% 25%, transparent 0% 50%) 50% / 12px 12px'
    : s.gradient
      ? `linear-gradient(90deg, ${s.c1}, ${s.c2})`
      : s.color;

  const segBtn = (active: boolean) =>
    `flex-1 text-[13px] font-medium py-1.5 rounded-md transition-colors ${
      active ? 'text-[#10121a]' : 'text-[var(--muted)] hover:text-[var(--text)]'
    }`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,8,11,0.66)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="w-[348px] max-w-[94vw] rounded-[14px] border p-5"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              boxShadow: '0 22px 60px rgba(0,0,0,0.5)',
            }}
            initial={{ scale: 0.94, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            {/* header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-lg border"
                  style={{ background: previewBg, borderColor: 'var(--border-2)' }}
                />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--dim)' }}>
                    {t('g_color')}
                  </div>
                  <div className="text-[14px] font-medium">{fieldLabel || t('g_line')}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label={t('cancel')}
                className="grid place-items-center w-8 h-8 rounded-lg border transition-colors hover:text-[var(--text)]"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* mode tabs */}
            <div
              className="relative flex p-1 rounded-lg mb-4"
              style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
            >
              <button
                className={segBtn(!s.gradient && !s.noColor)}
                onClick={() => setS((p) => ({ ...p, gradient: false, noColor: false }))}
                style={!s.gradient && !s.noColor ? { background: 'var(--accent)' } : undefined}
              >
                {t('g_solid')}
              </button>
              <button
                className={segBtn(s.gradient && !s.noColor)}
                onClick={() => setS((p) => ({ ...p, gradient: true, noColor: false }))}
                style={s.gradient && !s.noColor ? { background: 'var(--accent)' } : undefined}
              >
                {t('gradient')}
              </button>
            </div>

            {/* SOLID */}
            {!s.gradient && (
              <div className={s.noColor ? 'opacity-40 pointer-events-none' : ''}>
                <div className="grid grid-cols-10 gap-1.5 mb-4">
                  {GIFT_COLORS.map((c) => {
                    const sel = !s.gradient && s.color.toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        onClick={() => pickSolid(c)}
                        title={c}
                        className="w-full aspect-square rounded-md transition-transform hover:scale-110"
                        style={{
                          background: c,
                          outline: sel ? '2px solid var(--accent)' : 'none',
                          outlineOffset: '1px',
                          border: '1px solid rgba(0,0,0,0.25)',
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={HEX.test(s.color) ? s.color : '#ffffff'}
                    onChange={(e) => pickSolid(e.target.value)}
                    className="w-9 h-9 rounded-md cursor-pointer bg-transparent border"
                    style={{ borderColor: 'var(--border)' }}
                  />
                  <input
                    value={hexText}
                    onChange={(e) => {
                      setHexText(e.target.value);
                      const n = normalizeHex(e.target.value);
                      if (n) pickSolid(n);
                    }}
                    placeholder="#rrggbb"
                    spellCheck={false}
                    className="mono flex-1 px-3 py-2 rounded-md text-[13px] tracking-wider outline-none border"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
              </div>
            )}

            {/* GRADIENT */}
            {s.gradient && (
              <div className={s.noColor ? 'opacity-40 pointer-events-none' : ''}>
                <div
                  className="h-7 rounded-lg mb-3 border"
                  style={{ background: `linear-gradient(90deg, ${s.c1}, ${s.c2})`, borderColor: 'var(--border)' }}
                />
                <div className="grid grid-cols-2 gap-3">
                  {(['c1', 'c2'] as const).map((key, i) => (
                    <div key={key}>
                      <div className="text-[10px] mb-1" style={{ color: 'var(--muted)' }}>
                        {i === 0 ? t('g_from') : t('g_to')}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={s[key]}
                          onChange={(e) => setS((p) => ({ ...p, [key]: e.target.value, noColor: false }))}
                          className="w-8 h-8 rounded-md cursor-pointer bg-transparent border"
                          style={{ borderColor: 'var(--border)' }}
                        />
                        <input
                          value={s[key]}
                          onChange={(e) => {
                            const n = normalizeHex(e.target.value);
                            setS((p) => ({ ...p, [key]: n ?? e.target.value }));
                          }}
                          spellCheck={false}
                          className="mono flex-1 min-w-0 px-2 py-1.5 rounded-md text-[12px] outline-none border"
                          style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* no-colour */}
            <button
              onClick={() => setS((p) => ({ ...p, noColor: !p.noColor }))}
              className="flex items-center gap-2 w-full mt-4 pt-3 text-[12px] border-t"
              style={{ borderColor: 'var(--border)', color: s.noColor ? 'var(--accent)' : 'var(--muted)' }}
            >
              <span
                className="grid place-items-center w-5 h-5 rounded-md border"
                style={{
                  borderColor: s.noColor ? 'var(--accent)' : 'var(--border)',
                  background: s.noColor ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                {s.noColor && <Check size={12} />}
              </span>
              <Ban size={13} />
              {t('g_no_color')} {t('g_saves_chars')}
            </button>

            {/* footer */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onApply(s)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold"
                style={{ background: 'var(--accent)', color: '#10121a' }}
              >
                <Check size={15} /> {t('apply')}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-[13px] border"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                {t('cancel')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
