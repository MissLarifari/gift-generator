import { describe, expect, it } from 'vitest';
import { LOOKS, composeLook, lookIdOf } from '../../data/looks';
import { createDefaultState } from '../../state';
import { generate } from '../generate';
import { applyFont } from '../fonts';
import { TEMPLATE_CATEGORIES, composeTemplate } from '../../data/templates';

const ids = ['heartSmile', 'sweetTemptation', 'homeIsYou', 'sneakyHeart', 'littleDetour', 'happyPlace', 'favoriteTrouble', 'alwaysYou', 'stolenHeart', 'littleMagic', 'oneMoreKiss', 'bestDetour', 'flyingHug', 'guiltyCute'];

describe('Die 14 gesammelten Geschenk-Layouts', () => {
  it('behält bearbeitete Zusatzzeilen beim Layoutwechsel', () => {
    const source = composeLook(createDefaultState(), LOOKS.find(l => l.id === 'sneakyHeart')!);
    source.text.dekoTop = 'my own introduction';
    const next = composeLook(source, LOOKS.find(l => l.id === 'heartSmile')!);
    expect(next.text.dekoTop).toBe('my own introduction');
    expect(next.text.dekoBottom).toBe('.. and stay there ♥');
  });

  it('stellt die Dekoration alter Layouts ohne mitgebrachte Farbreste her', () => {
    const source = composeLook(createDefaultState(), LOOKS.find(l => l.id === 'heartSmile')!);
    source.text.mainText = 'my own words';
    const next = composeLook(source, LOOKS.find(l => l.id === 'note')!);
    expect(next.noColor.dekoTop).toBe(false);
    expect(next.noColor.kaomoji).toBe(false);
    expect(next.ranges?.dekoTop).toBeUndefined();
    expect(next.text.mainText).toBe('my own words');
  });
  it('zeigt dasselbe Beispiel aus der Sammlung und aus dem Layoutschalter', () => {
    for (const id of ids) {
      const look = LOOKS.find(l => l.id === id)!;
      const cat = TEMPLATE_CATEGORIES.find(c => c.theme.lookId === id)!;
      expect(cat, id).toBeDefined();
      expect(generate(composeTemplate(createDefaultState(), cat, cat.items[0])).code, id)
        .toBe(generate(composeLook(createDefaultState(), look)).code);
    }
  });
  it('bietet alle Beispiele einzeln und mit passenden Namen an', () => {
    for (const id of ids) expect(LOOKS.find(l => l.id === id), id).toBeDefined();
  });

  it('verwendet fancy im Haupttext und bleibt in beiden Grenzen', () => {
    for (const id of ids) {
      const look = LOOKS.find(l => l.id === id)!;
      expect(look, id).toBeDefined();
      if (!look) continue;
      const state = composeLook(createDefaultState(), look);
      const result = generate(state);
      expect(state.fonts.mainText, id).toBe('fancy');
      expect(result.code, id).toContain(applyFont(state.text.mainText, 'fancy').split(' ')[0]);
      expect(result.bytes, id).toBeLessThanOrEqual(255);
      expect(result.chars, id).toBeLessThanOrEqual(240);
      expect(result.code.split('\n').length, id).toBeLessThanOrEqual(6);
      expect(lookIdOf(state), id).toBe(id);
    }
  });

  it('wechselt jedes Beispiel ohne Reste des vorherigen Beispiels', () => {
    let previous = composeLook(createDefaultState(), LOOKS[1]);
    for (const id of [...ids, 'note', ...ids.slice().reverse()]) {
      const look = LOOKS.find(l => l.id === id)!;
      expect(look, id).toBeDefined();
      if (!look) continue;
      const next = composeLook(previous, look);
      expect(generate(next).code, id).toBe(generate(composeLook(createDefaultState(), look)).code);
      previous = next;
    }
  });
});
