import { useCallback, useEffect, useState } from 'react';
import { Send, MessageSquare, ShieldCheck, Loader2, MessageSquareHeart } from 'lucide-react';
import {
  listEntries, submitEntry, guestbookReady,
  MIN_NAME, MAX_NAME, MIN_TEXT, MAX_TEXT,
  GuestbookError, type GuestEntry,
} from '../guestbook';
import { useI18n } from '../i18n';

// The guestbook: thanks and feedback from whoever uses this.
//
// It lives UNDER the editor rather than in a window. The editor sits at its
// natural height, which left the bottom half of that column empty; this is the
// thing that belongs there, and it does not interrupt anyone to be found.
//
// Nothing appears here on its own. An entry goes to #gb-moderation on The Cloud
// and stays invisible until someone approves it — that is the whole troll
// defence, and it is worth saying on the form so people know their words are
// read before they are shown.
//
// The name is REQUIRED: the server refuses an entry without one. Saying
// "optional" here and letting the server say no afterwards is the worse of the
// two, so the form asks for it up front.

type Phase = 'loading' | 'ready' | 'failed' | 'off';

export default function Guestbook() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>(guestbookReady() ? 'loading' : 'off');
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!guestbookReady()) return;
    const stop = new AbortController();
    listEntries(stop.signal)
      .then((list) => { setEntries(list); setPhase('ready'); })
      .catch((e) => { if (e?.name !== 'AbortError') setPhase('failed'); });
    return () => stop.abort();
  }, []);

  // Exactly the server's rules, so the button is grey for the same reasons the
  // server would have said no.
  const okName = name.trim().length >= MIN_NAME && name.trim().length <= MAX_NAME;
  const okText = text.trim().length >= MIN_TEXT && text.trim().length <= MAX_TEXT;
  const canSend = okName && okText && !sending && guestbookReady();

  const send = useCallback(async () => {
    if (!canSend) return;
    setSending(true);
    setFailed(null);
    try {
      await submitEntry(name, text);
      setSent(true);
      setText('');
      setName('');
    } catch (e) {
      setFailed(t(e instanceof GuestbookError ? `gb_e_${e.reason}` : 'gb_e_failed'));
    } finally {
      setSending(false);
    }
  }, [canSend, name, text, t]);

  // A refusal is about what stood in the box a moment ago. As soon as it is
  // being changed, the sentence is stale — it must not sit there over new text.
  const edit = (set: (v: string) => void) => (v: string) => { set(v); if (failed) setFailed(null); };

  const left = MAX_TEXT - text.length;

  // Why the button is grey belongs AT the button.
  const why = !guestbookReady() ? t('gb_off')
    : !okName ? t('gb_need_name')
    : !okText ? t('gb_need_text')
    : undefined;

  return (
    <section className="slab flex flex-col" style={{ minHeight: 0, flex: '2 1 0', overflow: 'hidden' }}>
      <div className="panel-head flex items-start" style={{ gap: 9 }}>
        <MessageSquareHeart size={16} style={{ color: 'var(--bloom)', flex: '0 0 auto', marginTop: 2 }} />
        <div>
          <div className="panel-title">{t('gb_title')}</div>
          <div className="panel-sub">{t('gb_sub')}</div>
        </div>
      </div>

      <div className="scroll-y" style={{ flex: 1, minHeight: 0, padding: '13px 15px 16px' }}>

        {/* The form first: most people open this to say something, not to read. */}
        {sent ? (
          <div className="gb-done">
            <ShieldCheck size={15} />
            <span>{t('gb_queued')}</span>
          </div>
        ) : (
          <div className="gb-form">
            <input
              className="gb-name"
              value={name}
              maxLength={MAX_NAME}
              onChange={(e) => edit(setName)(e.target.value)}
              placeholder={t('gb_name_ph')}
              aria-label={t('gb_name_ph')}
            />
            <textarea
              className="gb-text"
              value={text}
              maxLength={MAX_TEXT}
              onChange={(e) => edit(setText)(e.target.value)}
              placeholder={t('gb_text_ph')}
              aria-label={t('gb_text_ph')}
            />
            <div className="gb-foot">
              <span className="hint" style={{ flex: 1 }}>
                <ShieldCheck size={11} /> {why ?? t('gb_moderated')}
              </span>
              <span className="mono" style={{ fontSize: 10, color: left < 30 ? 'var(--warn)' : 'var(--dim)' }}>{left}</span>
              <button className="btn btn-sm btn-primary" onClick={send} title={why} disabled={!canSend}>
                {sending ? <Loader2 size={13} className="spin" /> : <Send size={13} />} {t('gb_send')}
              </button>
            </div>
            {failed && <p className="gb-error">{failed}</p>}
          </div>
        )}

        <div className="sechead" style={{ marginTop: 18 }}>
          <span className="sechead-t">{t('gb_entries')}</span>
          {phase === 'ready' && <span className="sechead-n">{entries.length}</span>}
        </div>

        {phase === 'loading' && <p className="hint">{t('gb_loading')}</p>}
        {phase === 'failed' && <p className="hint">{t('gb_unreachable')}</p>}
        {phase === 'off' && <p className="hint">{t('gb_off')}</p>}
        {phase === 'ready' && entries.length === 0 && <p className="hint">{t('gb_empty')}</p>}
        {phase === 'ready' && entries.length > 0 && (
          <ul className="gb-list">
            {entries.map((e) => (
              <li key={e.id}>
                <div className="gb-head">
                  <MessageSquare size={11} />
                  <span className="gb-who">{e.name || t('gb_anon')}</span>
                  <span className="gb-when">{new Date(e.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="gb-body">{e.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
