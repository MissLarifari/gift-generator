// Talking to the guestbook.
//
// The guestbook already exists: Projekte/guestbook-api, live behind
// https://sophey.vodka/The-Cloud/api, moderated in #gb-moderation by the Cloud
// bot. This file only speaks its language; nothing here is a service of its own.
//
// The contract, read off the running server:
//   GET  /entries  -> [{ id: number, name, message, createdAt: number }]
//                     approved only, newest first
//   POST /entries  <- { name, message, website } -> { ok: true }
//                     400 { error: "<a sentence>" } when it is refused
//
// Two things that are easy to get wrong:
//   - `name` is REQUIRED, 2–40 characters. The server refuses without it.
//   - `website` is a HONEYPOT — a field no human ever sees. Anything that
//     arrives with it filled in is dropped silently, and the server still
//     answers ok so bots learn nothing. We send it empty on purpose.
//
// The address is baked in rather than read from .env, because .env is
// gitignored and Soph's server builds from the public repo — an address that
// only exists on this laptop would deploy as "not connected" and look like
// nothing at all. VITE_GUESTBOOK_URL still overrides it for local work.

export interface GuestEntry {
  id: number | string;
  name: string;
  message: string;
  createdAt: number | string;
}

const FALLBACK = 'https://sophey.vodka/The-Cloud/api';
const BASE = ((import.meta.env.VITE_GUESTBOOK_URL as string | undefined) ?? FALLBACK).replace(/\/+$/, '');

export const guestbookReady = (): boolean => BASE !== '';

// The server's own limits (guestbook-api/src/filters.js), mirrored so the form
// refuses what the server would refuse — before someone has typed it all out.
export const MIN_NAME = 2;
export const MAX_NAME = 40;
export const MIN_TEXT = 2;
export const MAX_TEXT = 500;

/**
 * Why an entry was refused. The server answers in English sentences; the UI
 * speaks four languages, so its sentence is turned back into a reason here and
 * the wording is picked in i18n.
 */
export const REFUSALS = [
  'name', 'length', 'links', 'friendly', 'spam', 'shout', 'rate', 'unauthorized', 'failed',
] as const;
export type Refusal = (typeof REFUSALS)[number];

export class GuestbookError extends Error {
  readonly reason: Refusal;
  constructor(reason: Refusal) {
    super(reason);
    this.name = 'GuestbookError';
    this.reason = reason;
  }
}

/** Matches on words, not on whole sentences — the server uses a curly apostrophe. */
export function reasonOf(sentence: string): Refusal {
  const s = sentence.toLowerCase();
  if (s.includes('name must')) return 'name';
  if (s.includes('message must')) return 'length';
  if (s.includes('link')) return 'links';
  if (s.includes('friendly')) return 'friendly';
  if (s.includes('spam')) return 'spam';
  if (s.includes('shout')) return 'shout';
  return 'failed';
}

/** The approved entries. Throws, so the caller can say why the list is empty. */
export async function listEntries(signal?: AbortSignal): Promise<GuestEntry[]> {
  const res = await fetch(`${BASE}/entries`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error('unexpected payload');
  return data.filter(
    (e): e is GuestEntry => !!e && typeof e === 'object' && typeof (e as GuestEntry).message === 'string',
  );
}

/**
 * Hands one entry to moderation. Nothing shows up until somebody presses
 * Approve in #gb-moderation.
 */
export async function submitEntry(name: string, message: string): Promise<void> {
  const res = await fetch(`${BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name.trim().slice(0, MAX_NAME),
      message: message.trim().slice(0, MAX_TEXT),
      website: '',
    }),
  });
  if (res.ok) return;
  if (res.status === 429) throw new GuestbookError('rate');
  const body: unknown = await res.json().catch(() => null);
  const sentence = (body as { error?: unknown } | null)?.error;
  throw new GuestbookError(typeof sentence === 'string' ? reasonOf(sentence) : 'failed');
}

// ─── Moderation ──────────────────────────────────────────────────────────────
//
// Deleting needs the API's MOD_SECRET, the same one the Cloud bot uses for the
// buttons in #gb-moderation. There is no separate delete route: `reject` on an
// entry removes it whatever its state, so an entry that is already public comes
// down the same way a pending one is turned away.
//
// The secret lives in this browser and nowhere else — never in a URL, never in
// a log, never in the page's markup. It is Lari's own device; `forgetSecret()`
// takes it back out.

const SECRET_KEY = 'gifty_gb_mod';

export function loadSecret(): string {
  try { return localStorage.getItem(SECRET_KEY) ?? ''; } catch { return ''; }
}
export function saveSecret(secret: string): void {
  try { localStorage.setItem(SECRET_KEY, secret); } catch { /* private window */ }
}
export function forgetSecret(): void {
  try { localStorage.removeItem(SECRET_KEY); } catch { /* private window */ }
}

function moderate(id: number | string, action: 'approve' | 'reject', secret: string): Promise<Response> {
  return fetch(`${BASE}/entries/${encodeURIComponent(String(id))}/moderate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-mod-secret': secret },
    body: JSON.stringify({ action }),
  });
}

/**
 * Is this the right secret? Asked without changing anything: entry 0 cannot
 * exist (ids start at 1), so a correct secret gets past the guard and lands on
 * "not found", while a wrong one is turned away at the door.
 *
 *   401 -> wrong secret        404 -> right secret, no such entry
 */
export async function checkSecret(secret: string): Promise<boolean> {
  const res = await moderate(0, 'reject', secret);
  if (res.status === 401) return false;
  if (res.status === 404) return true;
  throw new GuestbookError('failed');
}

/** Takes one entry off the guestbook. There is no undo — the row is gone. */
export async function deleteEntry(id: number | string, secret: string): Promise<void> {
  const res = await moderate(id, 'reject', secret);
  if (res.ok) return;
  throw new GuestbookError(res.status === 401 ? 'unauthorized' : 'failed');
}
