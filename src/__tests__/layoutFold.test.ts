import { describe, expect, it } from 'vitest';
// Vite hands the file over as text. Reading it with node:fs would mean
// putting Node's types into the app's tsconfig, and then browser code could
// import fs as well — a door opened for one test is a door.
import src from '../components/Shelf.tsx?raw';

/**
 * Picking a layout must not fold the layout list away.
 *
 * It used to, on purpose — seventeen names take a third of the panel, so the
 * section was built to shut after a pick. But a layout is chosen by comparing:
 * the change it makes lands in the preview on the other side of the screen,
 * and the list that folds away is the very thing still being read from. Five
 * layouts tried meant five re-openings.
 *
 * There is no jsdom here, so nothing can click. This reads the source instead
 * and guards the two halves of the rule: the pick leaves the fold alone, and
 * the head button is the only thing that moves it.
 */
/** The stretch of source from a marker to the end of its JSX element. */
const from = (marker: string, until: string) => {
  const a = src.indexOf(marker);
  expect(a, 'not found in Shelf.tsx: ' + marker).toBeGreaterThan(-1);
  const b = src.indexOf(until, a);
  return src.slice(a, b > a ? b : undefined);
};

describe('the layout list', () => {
  it('stays open when a layout is picked', () => {
    const picker = from("className=\"seg layout-picker\"", '</div>');
    expect(picker).toContain('onApplyLook(l)');
    expect(picker).not.toMatch(/setLooksOpen|foldLooks/);
  });

  it('is folded only by its own heading, and remembers that', () => {
    // Not '>' as the end marker: the first one belongs to the arrow of
    // the arrow function inside the handler.
    const head = from('aria-controls="shelf-looks"', '</button>');
    expect(head).toContain('foldLooks(');
    expect(src).toContain('const [looksOpen, setLooksOpen] = useState(readLooksOpen)');
    expect(src).toContain("localStorage.setItem(LOOKS_OPEN_KEY");
  });

  it('survives a browser that refuses storage', () => {
    // Private mode throws on getItem; the shelf must open anyway, closed.
    const helper = from('const readLooksOpen', '};');
    expect(helper).toContain('catch { return false; }');
  });
});
