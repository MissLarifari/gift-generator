import { useEffect, useState } from 'react';

// True when the viewport is narrow enough that the 3-column desktop layout
// doesn't fit — App then switches to a single-column tabbed mobile layout.
export function useIsMobile(query = '(max-width: 859px)'): boolean {
  const [matches, setMatches] = useState(() => {
    try { return window.matchMedia(query).matches; } catch { return false; }
  });
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    setMatches(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
