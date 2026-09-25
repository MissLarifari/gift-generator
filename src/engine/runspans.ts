import type { CodeRun } from './parse';

/**
 * Where each drawn run sits in the code.
 *
 * The preview draws a line as a handful of runs — ".. ∂єя " white and small,
 * "ѕυρρє ✿★" big and pink — because each is wrapped in its own tags. To let
 * someone type into one of those pieces, we need to know which stretch of the
 * code string it came from, so the new words can be put back exactly there and
 * the tags around them left alone.
 *
 * The parser does not record that, and teaching it to would change a shape
 * that a lot of tests compare exactly. It is not needed either: the runs of a
 * line appear in the source in order and untouched — tags sit between them,
 * never inside — so walking the line with a cursor finds each one.
 *
 * Returns null for a line whose runs cannot all be located, which is the
 * caller's signal not to offer editing there rather than to guess.
 */
export function runSpans(lineSource: string, runs: CodeRun[]): [number, number][] | null {
  const out: [number, number][] = [];
  let at = 0;
  for (const run of runs) {
    if (!run.text) return null;
    const i = lineSource.indexOf(run.text, at);
    if (i < 0) return null;
    out.push([i, i + run.text.length]);
    at = i + run.text.length;
  }
  return out;
}
