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
export type Refusal = 'name' | 'length' | 'links' | 'friendly' | 'spam' | 'shout' | 'rate' | 'failed';

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
