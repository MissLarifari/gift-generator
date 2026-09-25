import { describe, it, expect } from 'vitest';
import { parseCode, lineSpans } from '../parse';
import { runSpans } from '../runspans';
import { detectFont, applyFont, normalizeFontChars } from '../fonts';

// Typing into one coloured piece of the gift, the way the preview does it.
// The whole point is what must NOT change: the tags around the piece, and the
// pieces beside it.
const edit = (code: string, line: number, run: number, text: string): string => {
  const [a, b] = lineSpans(code)[line];
  const places = runSpans(code.slice(a, b), parseCode(code).lines[line])!;
  const [ra, rb] = places[run];
  const next = applyFont(normalizeFontChars(text), detectFont(code.slice(a + ra, a + rb)));
  return code.slice(0, a + ra) + next + code.slice(a + rb);
};

describe('typing into one piece of a line', () => {
  const code = '.. ∂єя <size=40><color=#ff4fa3>ѕυρρє ✿★</color></size>';

  it('leaves the tags exactly where they were', () => {
    const out = edit(code, 0, 1, 'sahne');
    expect(out).toBe('.. ∂єя <size=40><color=#ff4fa3>ѕαнηє</color></size>');
  });

  it('writes what you type in the script that piece is already in', () => {
    expect(edit(code, 0, 1, 'sahne')).toContain('ѕαнηє');
    expect(edit(code, 0, 0, '.. mit ')).toContain('.. мιт ');
  });

  it('does not touch the piece beside it', () => {
    expect(edit(code, 0, 1, 'x')).toContain('.. ∂єя ');
    expect(edit(code, 0, 0, 'y')).toContain('<color=#ff4fa3>ѕυρρє ✿★</color>');
  });

  it('keeps a plain piece plain', () => {
    const plain = '<size=32>straight</size> to you';
    expect(edit(plain, 0, 1, ' to me')).toBe('<size=32>straight</size> to me');
  });

  it('accepts ornate text pasted in and keeps one script per piece', () => {
    // Pasting fancy letters into a fancy piece must not double-convert.
    expect(edit(code, 0, 1, 'ѕαнηє')).toContain('ѕαнηє');
  });
});
