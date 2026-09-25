/**
 * Moving a whole line of the gift, and whether that is safe to do.
 *
 * The code is the truth here, so reordering lines in the preview is an edit to
 * the code string like any other — the line is lifted out and dropped back in
 * somewhere else, and everything downstream recomputes from it.
 *
 * The catch: a tag that opens on one line and closes on another. generate()
 * never writes one, but a hand-pasted gift can, and moving a line out from
 * between them would leave the colour running over the wrong words. So a gift
 * like that is simply not offered the handles.
 */

const TAG = /<(\/?)(color|size|b|i)(?:=[^>]*)?>/gi;

/** Does every tag this line opens also close on it? */
export function lineIsSelfContained(line: string): boolean {
  const stack: string[] = [];
  for (const m of line.matchAll(TAG)) {
    const tag = m[2].toLowerCase();
    if (m[1] === '/') {
      if (stack.pop() !== tag) return false;
    } else {
      stack.push(tag);
    }
  }
  return stack.length === 0;
}

/** Can the lines of this gift be moved around without breaking its tags? */
export function canReorderLines(code: string): boolean {
  return code.split('\n').every(lineIsSelfContained);
}

/** The gift with line `from` lifted out and put back at `to`. */
export function moveCodeLine(code: string, from: number, to: number): string {
  const lines = code.split('\n');
  if (from === to || from < 0 || to < 0 || from >= lines.length || to >= lines.length) return code;
  const [moved] = lines.splice(from, 1);
  lines.splice(to, 0, moved);
  return lines.join('\n');
}
