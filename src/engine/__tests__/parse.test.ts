import { describe, it, expect } from 'vitest';
import { parseCode, stripTags, hasTag, retag, untag, lineSpans, isDecoLine } from '../parse';

// Lari's own gift, the one she wrote out by hand. Reading it back has to give
// exactly the five lines she sees in the game, with ".. ∂єя" untagged.
const LARI = [
  '▶ .. ∂υ вιѕт .. ◀',
  '<size=40><color=#ffd84d>.. ∂αѕ ѕαℓz</color></size>',
  '<color=#ff9ec7>° ✿ ★ ιη ✦ ✿</color>',
  '.. ∂єя <size=40><color=#ff4fa3>ѕυρρє ✿★</color></size>',
  '<color=#ff9ec7>↖(✿ ∩◡∩)↗</color>',
].join('\n');

describe('parseCode', () => {
  it('reads Lari\u2019s gift back into five lines', () => {
    const { lines, warnings } = parseCode(LARI);
    expect(lines).toHaveLength(5);
    expect(warnings).toEqual([]);
  });

  it('an untagged line stays untagged, so it draws the free default white', () => {
    const [first] = parseCode(LARI).lines;
    expect(first).toEqual([{ text: '▶ .. ∂υ вιѕт .. ◀', color: undefined, size: undefined, bold: false, italic: false }]);
  });

  it('splits the two-part line into the white lead-in and the loud word', () => {
    const bottom = parseCode(LARI).lines[3];
    expect(bottom.map((r) => r.text)).toEqual(['.. ∂єя ', 'ѕυρρє ✿★']);
    expect(bottom[0].color).toBeUndefined();
    expect(bottom[0].size).toBeUndefined();
    expect(bottom[1]).toMatchObject({ color: '#ff4fa3', size: 40 });
  });

  it('nests: the inner colour wins while the outer size still applies', () => {
    const [line] = parseCode('<size=30>a<color=#ff0000>b</color>c</size>').lines;
    expect(line.map((r) => [r.text, r.size, r.color])).toEqual([
      ['a', 30, undefined],
      ['b', 30, '#ff0000'],
      ['c', 30, undefined],
    ]);
  });

  it('merges neighbouring runs that came out identical', () => {
    const [line] = parseCode('<b>a</b><b>b</b>').lines;
    expect(line).toHaveLength(1);
    expect(line[0].text).toBe('ab');
  });

  it('prints a tag 3dxchat does not know instead of hiding it', () => {
    expect(stripTags('<glow>hi</glow>')).toBe('<glow>hi</glow>');
  });

  // Warnings are data, not sentences: the wording lives in the four language
  // files, because this is the one place that has to speak to everyone.
  it('warns about a tag that is never closed', () => {
    expect(parseCode('<color=#fff>hi').warnings).toEqual([{ code: 'unclosed', tag: 'color=#fff' }]);
  });

  it('warns about a closing tag with nothing open', () => {
    expect(parseCode('hi</b>').warnings).toEqual([{ code: 'stray', tag: 'b' }]);
  });

  it('a colour opened on one line carries into the next, as Unity does', () => {
    const { lines } = parseCode('<color=#ff0000>a\nb</color>');
    expect(lines[1][0].color).toBe('#ff0000');
  });

  it('stripTags gives back the words alone', () => {
    expect(stripTags(LARI).split('\n')[3]).toBe('.. ∂єя ѕυρρє ✿★');
  });
});

describe('changing a tag that is already there', () => {
  // Lari selected a whole coloured line and picked a new colour; the editor
  // wrapped a second <color> around it instead of changing the one there.
  const LINE = '<size=44><color=#ff4fa3>ѕтαу α ℓιттℓє</color></size>';

  it('sees the colour the stretch already opens', () => {
    expect(hasTag(LINE, 'color')).toBe(true);
    expect(hasTag(LINE, 'size')).toBe(true);
    expect(hasTag('just words', 'color')).toBe(false);
  });

  it('changes that colour instead of adding one', () => {
    const out = retag(LINE, 'color', '#3ad1c4');
    expect(out).toContain('<color=#3ad1c4>');
    expect(out).not.toContain('#ff4fa3');
    expect((out.match(/<color=/g) ?? []).length).toBe(1);
  });

  it('changes the size the same way', () => {
    expect(retag(LINE, 'size', '30')).toContain('<size=30>');
  });

  it('rewrites every occurrence, not just the first', () => {
    const two = '<color=#111111>a</color> und <color=#222222>b</color>';
    expect(retag(two, 'color', '#fff')).toBe('<color=#fff>a</color> und <color=#fff>b</color>');
  });

  it('untag turns bold back off', () => {
    expect(untag('<b>fett</b> und mehr', 'b')).toBe('fett und mehr');
  });

  it('leaves a stretch without the tag alone, so the caller wraps it', () => {
    expect(retag('plain', 'color', '#fff')).toBe('plain');
  });
});

describe('pointing at a line', () => {
  it('gives the offsets of every line', () => {
    expect(lineSpans('ab\ncde\nf')).toEqual([[0, 2], [3, 6], [7, 8]]);
  });

  it('the offsets cut the code back into its lines', () => {
    const code = LARI;
    expect(lineSpans(code).map(([a, b]) => code.slice(a, b))).toEqual(code.split('\n'));
  });

  it('one span per line of the preview, so a click cannot land on the wrong one', () => {
    expect(lineSpans(LARI)).toHaveLength(parseCode(LARI).lines.length);
  });

  it('knows deco from words, ornate script included', () => {
    expect(isDecoLine('<color=#ff9ec7>° ✿ ★ ιη ✦ ✿</color>')).toBe(false); // "in" is a word
    expect(isDecoLine('° ✿ ★ ✦ ✿')).toBe(true);
    expect(isDecoLine('↖(✿ ∩◡∩)↗')).toBe(true);
    expect(isDecoLine('ʚɞ')).toBe(true);
    expect(isDecoLine('<size=40>.. ∂αѕ ѕαℓz</size>')).toBe(false);
    expect(isDecoLine('')).toBe(false);
  });
});
