import { describe, it, expect } from 'vitest';
import { detectFont, scriptTyped, applyFont, normalizeFontChars } from '../engine';

// The script a line is written in is not a tag — it lives in the letters. So
// typing a word into an ornate line used to produce plain letters in the middle
// of decorated ones. These two pieces are what lets the line write along.

describe('recognising the script of a line', () => {
  it('knows plain text when it sees it', () => {
    expect(detectFont('das salz')).toBe('normal');
    expect(detectFont('')).toBe('normal');
    expect(detectFont('123 ✿ ★')).toBe('normal');
  });

  it('recognises each script it can write back', () => {
    for (const style of ['fancy', 'smallcaps', 'thai'] as const) {
      expect(detectFont(applyFont('das salz', style)), style).toBe(style);
    }
  });

  it('does not claim a script for a half-converted line', () => {
    // A plain word sitting inside an ornate one — exactly what this feature
    // exists to prevent. It must not be mistaken for a clean ornate line.
    expect(detectFont('∂αѕ salz')).toBe('normal');
  });

  it('leaves what it cannot fold back alone', () => {
    expect(normalizeFontChars(applyFont('abc', 'fancy'))).toBe('abc');
  });
});

describe('what was just typed, in the script of its line', () => {
  const FANCY = applyFont('das salz', 'fancy');

  // Der wichtigste Fall: eine Zeile im Geschenk anklicken und lostippen. Das
  // ersetzt die Markierung — ab dem Markierungsanfang bis zum Cursor steht das
  // Neue.
  it('dresses a selection that was typed over', () => {
    const next = 'mein herz';
    expect(scriptTyped(next, 0, next.length, 'fancy')).toEqual({ at: 0, text: applyFont('mein herz', 'fancy') });
  });

  it('dresses a single letter typed at the caret', () => {
    expect(scriptTyped('abc', 2, 3, 'fancy')).toEqual({ at: 2, text: applyFont('c', 'fancy') });
  });

  // Genau daran ist der erste Anlauf gescheitert: vorher/nachher vergleichen
  // laesst das gemeinsame Schluss-z stehen. Mit dem Cursor gibt es das nicht.
  it('dresses the whole word, not all but its last letter', () => {
    // Ein Vergleich vorher/nachher wuerde bei ".. das salz" -> "mein herz" das
    // gemeinsame Schluss-z auslassen. Hier kommt das ganze Wort an — Zeichen
    // fuer Zeichen dasselbe, was die Schrift-Taste liefern wuerde.
    const done = scriptTyped('mein herz', 0, 9, 'fancy')!;
    expect(done.text).toBe(applyFont('mein herz', 'fancy'));
    expect(normalizeFontChars(done.text)).toBe('mein herz');
  });

  it('keeps the length, so the caret does not jump', () => {
    const done = scriptTyped('mein herz', 0, 9, 'fancy')!;
    expect(done.text).toHaveLength('mein herz'.length);
  });

  it('leaves a plain line alone', () => {
    expect(scriptTyped('mein herz', 0, 9, 'normal')).toBeNull();
  });

  it('does nothing when nothing was typed', () => {
    expect(scriptTyped(FANCY, 3, 3, 'fancy')).toBeNull();
    expect(scriptTyped(FANCY, 5, 2, 'fancy')).toBeNull();
  });

  // Ohne diese Bremse wuerde aus <size=40> ein <ѕιzє=40> und der Code waere hin.
  it('never touches a tag', () => {
    expect(scriptTyped('<size=40>x', 0, 10, 'fancy')).toBeNull();
  });

  // Buchstabe fuer Buchstabe getippt kommt das spitze Klammernpaar nie in EINEM
  // Stueck an: erst "<", dann "b", dann ">". Das mittlere b darf trotzdem nicht
  // verziert werden, sonst steht da <в> und 3dx versteht es nicht mehr.
  it('keeps its hands off a tag being typed letter by letter', () => {
    expect(scriptTyped('abc<b', 4, 5, 'fancy')).toBeNull();
    expect(scriptTyped('abc<bo', 4, 6, 'fancy')).toBeNull();
  });

  it('starts again once the tag is closed', () => {
    const done = scriptTyped('<b>x', 3, 4, 'fancy');
    expect(done).not.toBeNull();
    expect(done!.text).toBe(applyFont('x', 'fancy'));
  });

  it('says nothing when the text is already in that script', () => {
    expect(scriptTyped(FANCY, 0, FANCY.length, 'fancy')).toBeNull();
  });
});
