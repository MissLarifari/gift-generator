import { expect, it } from 'vitest';
import * as looks from '../data/looks';

it('groups every layout once without losing a variant', () => {
  expect('LOOK_FAMILIES' in looks).toBe(true);
  const families = (looks as unknown as { LOOK_FAMILIES: string[][] }).LOOK_FAMILIES;
  expect(families.flat().sort()).toEqual(looks.LOOKS.map(l => l.id).sort());
  expect(families.length).toBeLessThan(looks.LOOKS.length);
});
