import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  reasonOf, submitEntry, listEntries, checkSecret, deleteEntry,
  loadSecret, saveSecret, forgetSecret,
  GuestbookError, MAX_NAME, MAX_TEXT,
} from '../guestbook';

// The point of these tests is that Gifty and guestbook-api agree. The sentences
// below are copied verbatim out of guestbook-api/src/filters.js — including the
// curly apostrophe in "don’t", which is exactly the kind of character an
// equality check would trip over.

const SERVER_SENTENCES: Array<[string, string]> = [
  ['Name must be 2–40 characters.', 'name'],
  ['Message must be 2–500 characters.', 'length'],
  ['Links are not allowed.', 'links'],
  ['Please keep it friendly.', 'friendly'],
  ['That looks like spam.', 'spam'],
  ['Please don’t shout.', 'shout'],
];

function mockFetch(res: Partial<Response> & { json?: () => Promise<unknown> }) {
  const spy = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}), ...res });
  vi.stubGlobal('fetch', spy);
  return spy;
}

afterEach(() => vi.unstubAllGlobals());

describe('reasonOf', () => {
  it('recognises every sentence the server can answer with', () => {
    for (const [sentence, reason] of SERVER_SENTENCES) {
      expect(reasonOf(sentence)).toBe(reason);
    }
  });

  it('falls back to a generic failure for anything unknown', () => {
    expect(reasonOf('teapot')).toBe('failed');
  });
});

describe('submitEntry', () => {
  it('posts to /entries with name, message and the empty honeypot', async () => {
    const spy = mockFetch({});
    await submitEntry('  Lari  ', '  hello  ');
    const [url, init] = spy.mock.calls[0];
    expect(url).toMatch(/\/entries$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ name: 'Lari', message: 'hello', website: '' });
  });

  it('never sends more than the server accepts', async () => {
    const spy = mockFetch({});
    await submitEntry('n'.repeat(80), 'm'.repeat(900));
    const body = JSON.parse(spy.mock.calls[0][1].body);
    expect(body.name).toHaveLength(MAX_NAME);
    expect(body.message).toHaveLength(MAX_TEXT);
  });

  it('turns a refusal into its reason', async () => {
    mockFetch({ ok: false, status: 400, json: async () => ({ error: 'Links are not allowed.' }) });
    await expect(submitEntry('Lari', 'see http://x.tld')).rejects.toMatchObject({ reason: 'links' });
  });

  it('knows the rate limit by its status alone', async () => {
    mockFetch({ ok: false, status: 429, json: async () => ({ error: 'Too many submissions' }) });
    await expect(submitEntry('Lari', 'again')).rejects.toMatchObject({ reason: 'rate' });
  });

  it('survives a response that is not JSON at all', async () => {
    mockFetch({ ok: false, status: 502, json: async () => { throw new Error('not json'); } });
    const err = await submitEntry('Lari', 'hi').catch((e) => e);
    expect(err).toBeInstanceOf(GuestbookError);
    expect(err.reason).toBe('failed');
  });

  // The honeypot makes the server answer ok while dropping the entry. There is
  // nothing to detect and nothing to do — but the caller must not blow up.
  it('treats the silent spam-drop as success', async () => {
    mockFetch({ ok: true, status: 200, json: async () => ({ ok: true }) });
    await expect(submitEntry('Lari', 'hi')).resolves.toBeUndefined();
  });
});

describe('listEntries', () => {
  it('reads the server shape, including a numeric createdAt', async () => {
    mockFetch({ json: async () => [{ id: 6, name: 'McFarts Alot', message: 'Best club eva!!!', createdAt: 1781298518719 }] });
    const [entry] = await listEntries();
    expect(entry.message).toBe('Best club eva!!!');
    expect(new Date(entry.createdAt).getFullYear()).toBeGreaterThan(2020);
  });

  it('drops rows without a message instead of rendering blanks', async () => {
    mockFetch({ json: async () => [{ id: 1 }, null, { id: 2, name: 'a', message: 'ok', createdAt: 1 }] });
    expect(await listEntries()).toHaveLength(1);
  });

  it('throws when the guestbook is unreachable, so the panel can say so', async () => {
    mockFetch({ ok: false, status: 502 });
    await expect(listEntries()).rejects.toThrow();
  });
});

describe('moderation', () => {
  // Deleting rides on the API's `reject`, the same route the Cloud bot's
  // buttons use. There is no separate delete endpoint to get wrong.
  it('rejects the entry through the moderate route, with the secret in the header', async () => {
    const spy = mockFetch({});
    await deleteEntry(7, 's3cret');
    const [url, init] = spy.mock.calls[0];
    expect(url).toMatch(/\/entries\/7\/moderate$/);
    expect(init.headers['x-mod-secret']).toBe('s3cret');
    expect(JSON.parse(init.body)).toEqual({ action: 'reject' });
  });

  it('says so when the secret is not accepted', async () => {
    mockFetch({ ok: false, status: 401, json: async () => ({ error: 'unauthorized' }) });
    await expect(deleteEntry(7, 'wrong')).rejects.toMatchObject({ reason: 'unauthorized' });
  });

  // The probe must never remove anything: id 0 cannot exist, ids start at 1.
  it('checks a secret against an entry that cannot exist', async () => {
    const spy = mockFetch({ ok: false, status: 404, json: async () => ({ error: 'not found' }) });
    expect(await checkSecret('right')).toBe(true);
    expect(spy.mock.calls[0][0]).toMatch(/\/entries\/0\/moderate$/);
  });

  it('reads a 401 as the wrong secret rather than an outage', async () => {
    mockFetch({ ok: false, status: 401, json: async () => ({ error: 'unauthorized' }) });
    expect(await checkSecret('wrong')).toBe(false);
  });

  it('does not call a broken server a wrong secret', async () => {
    mockFetch({ ok: false, status: 502, json: async () => ({}) });
    await expect(checkSecret('right')).rejects.toBeInstanceOf(GuestbookError);
  });

  it('keeps the secret in this browser and gives it back', () => {
    // The tests run in Node, where there is no localStorage. The client's own
    // try/catch hides that, so the store has to be supplied to test it at all.
    const box = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => box.get(k) ?? null,
      setItem: (k: string, v: string) => void box.set(k, v),
      removeItem: (k: string) => void box.delete(k),
    });
    forgetSecret();
    expect(loadSecret()).toBe('');
    saveSecret('abc');
    expect(loadSecret()).toBe('abc');
    forgetSecret();
    expect(loadSecret()).toBe('');
  });

  it('never puts the secret in the address', async () => {
    const spy = mockFetch({});
    await deleteEntry(7, 's3cret');
    expect(String(spy.mock.calls[0][0])).not.toContain('s3cret');
  });

  it('does not fall over where there is no storage at all', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadSecret()).toBe('');
    expect(() => saveSecret('abc')).not.toThrow();
    expect(() => forgetSecret()).not.toThrow();
  });
});
