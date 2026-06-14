import { useCallback, useRef, useState } from 'react';

interface HistoryState<T> { past: T[]; present: T; future: T[] }

const MAX = 80;

/**
 * Undo/redo history. `commit(producer, coalesceKey?)` updates the present;
 * passing the same coalesceKey on consecutive commits merges them into one
 * undo step (used so typing a word is a single undo, not one-per-keystroke).
 */
export function useHistory<T>(initial: T) {
  const [hist, setHist] = useState<HistoryState<T>>({ past: [], present: initial, future: [] });
  const lastKey = useRef<string | undefined>(undefined);

  const commit = useCallback((producer: (s: T) => T, coalesceKey?: string) => {
    setHist((h) => {
      const next = producer(h.present);
      if (next === h.present) return h;
      const coalesce = coalesceKey !== undefined && coalesceKey === lastKey.current;
      lastKey.current = coalesceKey;
      if (coalesce) return { past: h.past, present: next, future: [] };
      return { past: [...h.past, h.present].slice(-MAX), present: next, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    lastKey.current = undefined;
    setHist((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h));
  }, []);

  const redo = useCallback(() => {
    lastKey.current = undefined;
    setHist((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h));
  }, []);

  const reset = useCallback((s: T) => {
    lastKey.current = undefined;
    setHist((h) => ({ past: [...h.past, h.present].slice(-MAX), present: s, future: [] }));
  }, []);

  return { state: hist.present, commit, undo, redo, reset, canUndo: hist.past.length > 0, canRedo: hist.future.length > 0 };
}
