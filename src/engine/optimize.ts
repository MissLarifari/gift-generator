import type { GiftState, FieldId } from './types';
import { applyFont } from './fonts';
import { byteLen } from './count';
import type { LineMap } from './layouts';

// Ported 1:1 from the legacy updateOptimizeTips(): the "getting long" panel
// with per-field overhead warnings and one-click removal suggestions.
// Text is localized via an injected translator `t` (see i18n) so the tips
// follow the chosen UI language; the legacy opt_* / fl_* keys are reused.

export type TipLevel = 'action' | 'warn' | 'info' | 'tip';
export interface Tip { level: TipLevel; msg: string; field?: FieldId; action?: 'remove' | 'font' }
export interface OptimizeResult { show: boolean; state: 'over' | 'warn' | 'info'; headerMsg: string; tips: Tip[] }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = (key: string, ...args: any[]) => string;

const FIELD_KEY: Record<FieldId, string> = {
  dekoTop: 'fl_dekoTop', topText: 'fl_topText', mainText: 'fl_mainText', bottomText: 'fl_bottomText', kaomoji: 'fl_kaomoji', dekoBottom: 'fl_dekoBottom',
};

export function buildOptimizeTips(s: GiftState, chars: number, bytes: number, lm: LineMap, t: T): OptimizeResult {
  const isOver = chars > 240 || bytes > 255;
  const isWarn = chars > 210 || bytes > 230;
  if (chars < 185 && bytes < 200) return { show: false, state: 'info', headerMsg: '', tips: [] };

  const raw = s.text;
  const tips: Tip[] = [];
  const fields = Object.keys(FIELD_KEY) as FieldId[];
  const label = (f: FieldId) => t(FIELD_KEY[f]);

  // font byte overhead
  fields.forEach((f) => {
    if (s.fonts[f] === 'normal') return;
    const text = raw[f] || '';
    if (!text) return;
    const overhead = byteLen(applyFont(text, s.fonts[f])) - byteLen(text);
    if (overhead > 3) {
      if (bytes > 220) tips.push({ level: 'action', field: f, action: 'font', msg: t('opt_rm_font', label(f), overhead) });
      else tips.push({ level: 'warn', msg: t('opt_rm_font', label(f), overhead) });
    }
  });

  // gradient overhead
  fields.forEach((f) => {
    if (!s.grads[f].on) return;
    const words = (raw[f] || '').trim().split(/\s+/).filter((w) => w.length > 0);
    if (!words.length) return;
    tips.push({ level: 'warn', msg: t('opt_grad', label(f), words.length * 17, words.length) });
  });

  // biggest field
  const lens = (Object.entries(lm) as [FieldId, string | null][])
    .filter(([, v]) => v)
    .map(([k, v]) => [k, (v as string).length] as [FieldId, number])
    .sort((a, b) => b[1] - a[1]);
  if (lens.length) tips.push({ level: 'info', msg: t('opt_longest', label(lens[0][0]), lens[0][1]) });

  // deco / kaomoji length
  if (raw.dekoTop && raw.dekoTop.length > 14) tips.push({ level: 'tip', msg: t('opt_deko_top_long') });
  if (raw.dekoBottom && raw.dekoBottom.length > 14) tips.push({ level: 'tip', msg: t('opt_deko_bot_long') });
  if (raw.kaomoji && raw.kaomoji.length > 9) tips.push({ level: 'tip', msg: t('opt_kao_long', raw.kaomoji.length) });

  const gradCount = Object.values(s.grads).filter((g) => g.on).length;
  if (raw.kaomoji && gradCount >= 1) tips.push({ level: 'warn', msg: t('opt_kao_grad', gradCount) });
  if (raw.dekoTop && raw.dekoTop.length > 8 && /(.)\1{2,}/.test(raw.dekoTop)) tips.push({ level: 'tip', msg: t('opt_dup_deko') });

  if ((chars > 220 || bytes > 240) && s.layout !== 'minimal' && s.layout !== 'compact') {
    tips.push({ level: 'tip', msg: t('opt_layout') });
  }

  // one-click removal actions
  if (chars > 210 || bytes > 230) {
    if (raw.kaomoji) { const save = lm.kaomoji ? (lm.kaomoji as string).length + 1 : raw.kaomoji.length; tips.push({ level: 'action', field: 'kaomoji', action: 'remove', msg: t('opt_rm_kao', save) }); }
    if (raw.dekoTop) { const save = lm.dekoTop ? (lm.dekoTop as string).length + 1 : raw.dekoTop.length; tips.push({ level: 'action', field: 'dekoTop', action: 'remove', msg: t('opt_rm_dt', save) }); }
    if (raw.dekoBottom) { const save = lm.dekoBottom ? (lm.dekoBottom as string).length + 1 : raw.dekoBottom.length; tips.push({ level: 'action', field: 'dekoBottom', action: 'remove', msg: t('opt_rm_db', save) }); }
  }

  const headerMsg = isOver ? t('opt_over') : isWarn ? t('opt_warn') : t('opt_info');
  return { show: true, state: isOver ? 'over' : isWarn ? 'warn' : 'info', headerMsg, tips };
}
