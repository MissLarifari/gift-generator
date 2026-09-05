import { createDefaultState } from './state';
import { generate, type GiftState } from './engine';

// A shared gift is the whole GiftState, JSON → URL-safe base64, behind "#g=".
const PREFIX = 'g=';

function b64encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64decode(s: string): string {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// Merge a decoded object over fresh defaults so missing/added keys stay valid.
function mergeState(base: GiftState, patch: Record<string, unknown>): GiftState {
  const out = { ...base } as unknown as Record<string, unknown>;
  for (const k of Object.keys(base)) {
    const bv = (base as unknown as Record<string, unknown>)[k];
    const pv = patch[k];
    if (pv == null) continue;
    if (Array.isArray(bv)) out[k] = Array.isArray(pv) ? pv : bv;
    else if (bv && typeof bv === 'object') out[k] = { ...(bv as object), ...(pv as object) };
    else out[k] = pv;
  }
  return out as unknown as GiftState;
}

export function encodeState(state: GiftState): string {
  return b64encode(JSON.stringify(state));
}

export function decodeState(encoded: string): GiftState | null {
  try {
    const obj = JSON.parse(b64decode(encoded));
    if (!obj || typeof obj !== 'object') return null;
    return mergeState(createDefaultState(), obj as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function buildShareUrl(state: GiftState): string {
  return location.origin + location.pathname + '#' + PREFIX + encodeState(state);
}

// If the URL carries a shared gift, return it; otherwise null.
export function readShareFromUrl(): GiftState | null {
  const h = location.hash.replace(/^#/, '');
  if (!h.startsWith(PREFIX)) return null;
  return decodeState(h.slice(PREFIX.length));
}

// Strip the share hash so later edits aren't pinned to the shared URL.
export function clearShareHash(): void {
  const h = location.hash.replace(/^#/, '');
  if (h.startsWith(PREFIX) || h.startsWith('c=')) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

// --- code links ---------------------------------------------------------
// Since the rewrite the code itself is the gift, so a link carries the code:
// far shorter than a whole state, and it survives hand-written tags.
const CODE_PREFIX = 'c=';

export function buildCodeShareUrl(code: string): string {
  return location.origin + location.pathname + '#' + CODE_PREFIX + b64encode(code);
}

/** The shared gift as code — reading links from before the rewrite too. */
export function readShareCodeFromUrl(): string | null {
  const h = location.hash.replace(/^#/, '');
  if (h.startsWith(CODE_PREFIX)) {
    try { return b64decode(h.slice(CODE_PREFIX.length)); } catch { return null; }
  }
  const old = readShareFromUrl();
  return old ? generate(old).code : null;
}
