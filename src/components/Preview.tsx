import { X, Menu } from 'lucide-react';
import { parseCode, lineSpans, isDecoLine } from '../engine';
import { useI18n } from '../i18n';

// A replica of the 3dxchat gift popup at its real width, drawn straight from
// the code in the editor. Rebuilt 2026-09-05 from Lari's screenshot of a live
// gift; rewritten 2026-09-05 to read code instead of fields, so a gift pasted
// in from the game shows up exactly as it will there.
//
// Kept because the client draws them: the title row and the tab strip.
// Dropped as noise: the sender's name repeated under the gift.

const POPUP_W = 506;

// <size=N> is an absolute size. 3dxchat's default for gift text is 14, so one
// rule covers everything: N/14 rem. The old field-based preview divided the
// main line by 20 instead, which made two lines carrying the SAME <size=40>
// come out at different sizes. They match now.
const DEFAULT_SIZE = 14;

// The client stamps the day the gift was sent, in this shape: "September, 5 2026".
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const today = (): string => {
  const d = new Date();
  return `${MONTHS[d.getMonth()]}, ${d.getDate()} ${d.getFullYear()}`;
};
const rem = (size?: number) => (size ?? DEFAULT_SIZE) / DEFAULT_SIZE + 'rem';

const C = {
  frame: '#0e1014',
  body: '#1b1e25',
  bar: '#15181e',
  line: '#333944',
  name: '#e8467c',
  pill: '#f0a8bd',
  pillInk: '#2a1a20',
  tabInk: '#c3c8d1',
  tabOn: '#2f6d64',
  tabOnInk: '#ffffff',
  sender: '#9dd6a8',
  date: '#8b919b',
  /** Untagged text: 3dxchat draws its own near-white, and it costs no bytes. */
  noColor: '#dadce0',
};

const tab = (label: string, on = false) => (
  <span
    key={label}
    style={{
      flex: 1, textAlign: 'center', padding: '9px 4px', fontSize: 12.5, whiteSpace: 'nowrap',
      color: on ? C.tabOnInk : C.tabInk,
      background: on ? C.tabOn : 'transparent',
      borderRight: '1px solid ' + C.line,
    }}
  >
    {label}
  </span>
);

export default function Preview({ code, onPickLine }: { code: string; onPickLine?: (start: number, end: number, deco: boolean) => void }) {
  const { t } = useI18n();
  const { lines } = parseCode(code);
  // One span per drawn line — only then can a click be mapped back to the code
  // with certainty. A tag spanning a newline could in principle desync the two;
  // if it ever does, the gift simply stops being clickable instead of sending
  // the click to the wrong line.
  const spans = lineSpans(code);
  const clickable = !!onPickLine && spans.length === lines.length;

  return (
    <div style={{ width: POPUP_W, maxWidth: '100%', background: C.body, border: '1px solid ' + C.frame, borderRadius: 4, overflow: 'hidden', boxShadow: '0 18px 50px rgba(0,0,0,.5)' }}>
      <div className="flex items-center" style={{ gap: 10, padding: '9px 12px', background: C.bar }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.name }}>Sophey</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.pillInk, background: C.pill, padding: '3px 12px', borderRadius: 999 }}>Back to Profile</span>
        <span style={{ flex: 1 }} />
        <X size={18} style={{ color: '#ffffff' }} />
      </div>

      <div className="flex items-stretch" style={{ background: C.bar, borderTop: '1px solid ' + C.line, borderBottom: '1px solid ' + C.line }}>
        {tab('Message')}
        {tab('Gallery 10')}
        {tab('Gifts 729', true)}
        {tab('Send Gift')}
        <span style={{ display: 'grid', placeItems: 'center', width: 44, color: C.tabInk }}><Menu size={16} /></span>
      </div>

      <div style={{ padding: '20px 22px 26px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.sender }}>MissLarifari</div>
        <div style={{ fontSize: 13, color: C.date, marginTop: 3 }}>{today()}</div>

        <div className="flex items-center justify-center" style={{ margin: '16px 0 14px' }}>
          <img src={import.meta.env.BASE_URL + 'gift-sticker.png'} alt="" style={{ maxWidth: 240, maxHeight: 240, width: 'auto', height: 'auto', objectFit: 'contain' }} />
        </div>

        <div className="flex flex-col items-center" style={{ gap: 5 }}>
          {code.trim() === '' ? (
            <span style={{ color: '#5b616c', fontSize: 13 }}>{t('e_empty')}</span>
          ) : (
            lines.map((runs, i) => {
              const [a, b] = spans[i] ?? [0, 0];
              const deco = isDecoLine(code.slice(a, b));
              return (
              <div
                key={i}
                className={clickable ? 'gift-row' : undefined}
                title={clickable ? t(deco ? 'e_pick_deco' : 'e_pick_line') : undefined}
                onClick={clickable ? () => onPickLine(a, b, deco) : undefined}
                style={{ minHeight: 4, lineHeight: 1.25 }}
              >
                {runs.map((r, n) => (
                  <span
                    key={n}
                    style={{
                      color: r.color ?? C.noColor,
                      fontSize: rem(r.size),
                      fontWeight: r.bold ? 700 : 400,
                      fontStyle: r.italic ? 'italic' : 'normal',
                    }}
                  >
                    {r.text}
                  </span>
                ))}
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
