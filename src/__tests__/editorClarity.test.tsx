import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import EditorPanel from '../components/EditorPanel';
import { I18nProvider } from '../i18n';
import { LOOKS, composeLook } from '../data/looks';
import { createDefaultState } from '../state';

it('opens on editable text instead of the full layout gallery', () => {
  const look = LOOKS.find(l => l.id === 'heartSmile')!;
  const html = renderToStaticMarkup(<I18nProvider><EditorPanel
    state={composeLook(createDefaultState(), look)} looks={LOOKS} activeLook={look.id}
    commit={() => {}} onOpenColor={() => {}} onApplyLook={() => {}}
  /></I18nProvider>);
  expect(html).toContain('value="heart smile"');
  expect(html).not.toContain('class="lay"');
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('aria-controls="editor-layout-picker"');
});
