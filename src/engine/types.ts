import type { FontStyle } from './fonts';
import type { Grad } from './colorTags';
import type { StyleRange } from './ranges';

export type FieldId = 'dekoTop' | 'topText' | 'mainText' | 'bottomText' | 'kaomoji' | 'dekoBottom';
export type Layout = 'center' | 'inline' | 'pyramid' | 'sparkle' | 'heart' | 'custom';

export interface GiftState {
  text: Record<FieldId, string>;
  /**
   * Styling inside a line, as character ranges over `text[field]`. A field
   * without ranges renders exactly as it always has — one string, one style —
   * which is what keeps the byte-exact tests untouched. See engine/ranges.ts.
   */
  ranges?: Partial<Record<FieldId, StyleRange[]>>;
  sizes: Record<FieldId, number>;
  fonts: Record<FieldId, FontStyle>;
  colors: Record<FieldId, string>;
  noColor: Record<FieldId, boolean>;
  grads: Record<FieldId, Grad>;
  bold: { top: boolean; main: boolean; bottom: boolean };
  italic: { top: boolean; main: boolean; bottom: boolean };
  stars: { dekoTop: boolean; topText: boolean; bottomText: boolean };
  layout: Layout;
  lineOrder: FieldId[];
  // Free-form gift code for the 'custom' layout — the code IS this text verbatim.
  customText: string;
}

export const FIELD_ORDER: FieldId[] = ['dekoTop', 'topText', 'mainText', 'bottomText', 'kaomoji', 'dekoBottom'];

// Size-select defaults from the original tool — used by sz() to decide
// whether a <size=…> wrap is needed (main always wraps, others only when
// the chosen size differs from its default).
export const DEFAULT_SIZES: Record<FieldId, number> = { dekoTop: 12, topText: 14, mainText: 60, bottomText: 14, kaomoji: 16, dekoBottom: 12 };
