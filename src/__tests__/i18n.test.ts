import { describe, it, expect } from 'vitest';
import { I18N, LANGS } from '../i18n';
import { REFUSALS } from '../guestbook';

// A missing key does not crash: t() quietly falls back to English, so a gap
// shows up as one stray English word in an otherwise German panel — easy to
// add, hard to notice. This is the guard.

describe('translations', () => {
  const enKeys = Object.keys(I18N.en);

  it('English is the yardstick and has keys at all', () => {
    expect(enKeys.length).toBeGreaterThan(100);
  });

  for (const lang of LANGS) {
    it(`${lang} has every key English has`, () => {
      expect(enKeys.filter((k) => !(k in I18N[lang]))).toEqual([]);
    });

    it(`${lang} has no key English lacks`, () => {
      expect(Object.keys(I18N[lang]).filter((k) => !(k in I18N.en))).toEqual([]);
    });
  }
});

describe('nothing German leaks into the other languages', () => {
  // The layout names and the parser's warnings used to be hardcoded German in
  // the data and the engine, so English mode showed "Zweiteiler" and
  // "wird nie geschlossen".
  const GERMAN = /[äöüßÄÖÜ]|zweiteil|geschlossen|öffnend|geschenk|zeichen(?!s)/i;

  for (const lang of LANGS.filter((l) => l !== 'de')) {
    it(`${lang} has no German left in it`, () => {
      const bad = Object.entries(I18N[lang])
        .filter(([, v]) => typeof v === 'string' && GERMAN.test(v as string))
        .map(([k]) => k);
      expect(bad).toEqual([]);
    });
  }

  it('every layout has a name and a hint in every language', () => {
    for (const lang of LANGS)
      for (const id of ['note', 'twoWords', 'sparkle'])
        for (const suffix of ['', '_h']) expect(I18N[lang]['look_' + id + suffix], `${lang}.${id}${suffix}`).toBeTruthy();
  });

  it('both parser warnings are phrased in every language', () => {
    for (const lang of LANGS)
      for (const key of ['warn_unclosed', 'warn_stray']) {
        const fn = I18N[lang][key];
        expect(typeof fn, `${lang}.${key}`).toBe('function');
        expect((fn as (t: string) => string)('color')).toContain('color');
      }
  });
});

describe('the how-it-works text', () => {
  const KEYS = ['howto_title', 'howto_sub', 'howto_1', 'howto_2', 'howto_3', 'howto_4', 'howto_5', 'howto_note'];

  for (const lang of LANGS) {
    it(`${lang} has all five steps`, () => {
      for (const k of KEYS) expect(I18N[lang][k], `${lang}.${k}`).toBeTruthy();
    });
  }

  it('names both ceilings, because they are not the same limit', () => {
    for (const lang of LANGS) {
      const step = String(I18N[lang].howto_4);
      expect(step, lang).toContain('240');
      expect(step, lang).toContain('255');
    }
  });
});

describe('the guestbook speaks every language', () => {
  // Every reason the server can refuse an entry for is turned into a
  // `gb_e_<reason>` key. Add a reason without its sentence and the panel
  // silently shows the bare key, in all four languages.
  // Straight from the source list, so a new reason cannot be added without a
  // sentence for it in all four languages.
  const REASONS = REFUSALS;
  const KEYS = ['gb_title', 'gb_sub', 'gb_name_ph', 'gb_text_ph', 'gb_send', 'gb_moderated', 'gb_queued',
    'gb_entries', 'gb_empty', 'gb_anon', 'gb_loading', 'gb_unreachable', 'gb_off',
    'gb_need_name', 'gb_need_text',
    'gb_mod_title', 'gb_mod_hint', 'gb_mod_ph', 'gb_mod_unlock', 'gb_mod_wrong', 'gb_mod_on',
    'gb_mod_lock', 'gb_mod_del', 'gb_mod_sure', 'gb_mod_yes', 'gb_mod_no', 'gb_mod_gone',
    ...REASONS.map((r) => `gb_e_${r}`)];

  for (const lang of LANGS)
    it(`${lang} has a sentence for every part of it`, () => {
      expect(KEYS.filter((k) => typeof I18N[lang][k] !== 'string' || !I18N[lang][k])).toEqual([]);
    });
});

describe('the thank-you line', () => {
  // ThankYou() splits this sentence on the name to set it in bold. A language
  // that spells the name differently would lose the second half of the sentence.
  for (const lang of LANGS)
    it(`${lang} names MissLarifari exactly once`, () => {
      const s = I18N[lang].g_thanks as string;
      expect(typeof s).toBe('string');
      expect(s.split('MissLarifari')).toHaveLength(2);
    });
});
