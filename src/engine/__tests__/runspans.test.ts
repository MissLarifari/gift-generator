import { describe, it, expect } from 'vitest';
import { runSpans } from '../runspans';
import { parseCode, lineSpans } from '../parse';
import { generate } from '../generate';
import { composeLook, LOOKS } from '../../data/looks';
import { createDefaultState } from '../../state';

describe('finding a drawn run back in the code', () => {
  it('points at the text between the tags, not at the tags', () => {
    const line = '<size=44><color=#ff4fa3>hallo</color></size> welt';
    const { lines } = parseCode(line);
    const spans = runSpans(line, lines[0])!;
    expect(spans.map(([a, b]) => line.slice(a, b))).toEqual(['hallo', ' welt']);
  });

  it('keeps two runs apart even when they say the same thing', () => {
    const line = '<color=#ff0000>ja</color>ja';
    const { lines } = parseCode(line);
    const spans = runSpans(line, lines[0])!;
    expect(spans).toEqual([[15, 17], [25, 27]]);
  });

  it('gives up rather than guess when a run cannot be found', () => {
    expect(runSpans('etwas ganz anderes', [{ text: 'fehlt', bold: false, italic: false }])).toBeNull();
  });

  // The point of the whole thing: every line of every layout has to be
  // locatable, or that line silently cannot be typed into.
  it('locates every run of every layout the app builds', () => {
    for (const look of LOOKS) {
      const code = generate(composeLook(createDefaultState(), look)).code;
      const { lines } = parseCode(code);
      const spans = lineSpans(code);
      expect(spans.length, look.label).toBe(lines.length);
      lines.forEach((runs, i) => {
        if (!runs.length) return;
        const [a, b] = spans[i];
        expect(runSpans(code.slice(a, b), runs), `${look.label} Zeile ${i}`).not.toBeNull();
      });
    }
  });
});
