// Reading 3dxchat code back.
//
// Gifty used to own a structured gift and print code from it. Now the code is
// the truth — you can paste a finished gift in — so something has to read it
// back to draw the preview. That is this file.
//
// 3dxchat draws Unity rich text and understands exactly four tags: <size=N>,
// <color=…>, <b> and <i>. Anything else it prints literally, so we do too —
// seeing a stray <glow> in the preview is the honest answer.

import { normalizeFontChars } from './fonts';

export interface CodeRun {
  text: string;
  /** Undefined means untagged: 3dxchat draws its default white for free. */
  color?: string;
  size?: number;
  bold: boolean;
  italic: boolean;
}

/**
 * A problem in the code, as data. The engine used to phrase these in German,
 * which meant the one place that talks to the user in every language was the
 * one place that could only speak one.
 */
export interface Warning {
  code: 'unclosed' | 'stray';
  tag: string;
}

export interface ParsedCode {
  lines: CodeRun[][];
  warnings: Warning[];
}

type Open = { tag: 'size' | 'color' | 'b' | 'i'; value?: string; at: number };

const TAG = /<(\/?)(size|color|b|i)(?:=([^<>]*))?>/gi;

/** Splits 3dxchat code into styled runs, one array per line. */
export function parseCode(code: string): ParsedCode {
  const warnings: Warning[] = [];
  const stack: Open[] = [];
  const lines: CodeRun[][] = [[]];

  // The style in force right now is whatever sits deepest on the stack.
  const current = (): Omit<CodeRun, 'text'> => {
    let color: string | undefined;
    let size: number | undefined;
    let bold = false;
    let italic = false;
    for (const o of stack) {
      if (o.tag === 'color' && o.value) color = o.value;
      else if (o.tag === 'size' && o.value) size = parseInt(o.value, 10) || undefined;
      else if (o.tag === 'b') bold = true;
      else if (o.tag === 'i') italic = true;
    }
    return { color, size, bold, italic };
  };

  // Text is pushed run by run; a run that matches the one before it is merged
  // so the preview does not sprout a span per character.
  const push = (text: string) => {
    if (!text) return;
    for (const [n, part] of text.split('\n').entries()) {
      if (n > 0) lines.push([]);
      if (!part) continue;
      const line = lines[lines.length - 1];
      const st = current();
      const last = line[line.length - 1];
      if (last && last.color === st.color && last.size === st.size && last.bold === st.bold && last.italic === st.italic) {
        last.text += part;
      } else {
        line.push({ text: part, ...st });
      }
    }
  };

  let at = 0;
  TAG.lastIndex = 0;
  for (let m = TAG.exec(code); m; m = TAG.exec(code)) {
    push(code.slice(at, m.index));
    at = m.index + m[0].length;
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase() as Open['tag'];
    const value = m[3];

    if (closing) {
      const i = stack.map((o) => o.tag).lastIndexOf(tag);
      if (i < 0) warnings.push({ code: 'stray', tag });
      else stack.splice(i, 1);
    } else if ((tag === 'size' || tag === 'color') && !value) {
      // <size> without a value is not a tag 3dxchat understands — show it.
      push(m[0]);
    } else {
      stack.push({ tag, value, at: m.index });
    }
  }
  push(code.slice(at));

  for (const o of stack) warnings.push({ code: 'unclosed', tag: o.tag + (o.value ? '=' + o.value : '') });
  return { lines, warnings };
}

/** The plain words, with every tag stripped — what the reader actually reads. */
export function stripTags(code: string): string {
  return parseCode(code).lines.map((runs) => runs.map((r) => r.text).join('')).join('\n');
}

// --- changing tags that are already there -------------------------------
// Selecting a stretch that already carries a colour and picking a new one has
// to CHANGE that colour, not wrap a second one around it. Nesting would still
// render (the inner tag wins) but it costs 24 bytes for nothing and the code
// becomes unreadable.

export type ValueTag = 'color' | 'size';
export type FlagTag = 'b' | 'i';

/** Does this stretch already open such a tag itself? */
export function hasTag(text: string, name: ValueTag | FlagTag): boolean {
  return new RegExp(`<${name}(?:=[^<>]*)?>`, 'i').test(text);
}

/** Rewrites every <color=…>/<size=…> the stretch opens to the new value. */
export function retag(text: string, name: ValueTag, value: string): string {
  return text.replace(new RegExp(`<${name}=[^<>]*>`, 'gi'), `<${name}=${value}>`);
}

/** Drops the <b>/<i> pairs inside the stretch — pressing it again turns it off. */
export function untag(text: string, name: FlagTag): string {
  return text.replace(new RegExp(`</?${name}>`, 'gi'), '');
}

// --- pointing at a line ---------------------------------------------------
// The preview is drawn from the code, so a click in the preview can be turned
// back into a stretch of that code — which is how clicking the gift selects
// the line in the editor.

/** Where each line of the raw code begins and ends, as string offsets. */
export function lineSpans(code: string): [number, number][] {
  const out: [number, number][] = [];
  let at = 0;
  for (const line of code.split('\n')) {
    out.push([at, at + line.length]);
    at += line.length + 1;
  }
  return out;
}

/**
 * Is this line decoration rather than words? Ornate script has to be folded
 * back to plain letters first, or "∂υ вιѕт" would read as symbols too. Two letters
 * in a row is the test: a lone stray letter inside a deco row does not count.
 */
export function isDecoLine(line: string): boolean {
  const plain = normalizeFontChars(stripTags(line));
  return plain.trim() !== '' && !/[a-z]{2}/i.test(plain);
}
