import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { LOOKS, LOOK_FAMILIES, composeLook, type Look } from '../data/looks';
import { generate, parseCode } from '../engine';
import { createDefaultState } from '../state';
import { useI18n } from '../i18n';

// Every layout, drawn as the gift it makes — the real code through the real
// engine, shrunk. Not coloured bars: the actual words, colours, sizes, script
// and ornament, so a layout can be recognised instead of guessed.
//
// It lives inside the shelf, under the slim row of names, and opens only when
// asked. Standing open it pushed the sayings off the screen, which is the one
// thing the shelf is for.
const samples = new Map(LOOKS.map((look) => [look.id, parseCode(generate(composeLook(createDefaultState(), look)).code).lines]));

export default function LayoutGallery({ activeLook, onApplyLook }: {
  activeLook?: string | null;
  onApplyLook: (look: Look) => void;
}) {
  const { t } = useI18n();
  const [variants, setVariants] = useState<Record<string, string>>({});
  const families = useMemo(() => LOOK_FAMILIES.map((ids) => ids.map((id) => LOOKS.find((l) => l.id === id)!)), []);

  return (
    <div className="layout-family-grid">
      {families.map((family) => {
        const root = family[0];
        const selected = family.find((l) => l.id === activeLook) ?? family.find((l) => l.id === variants[root.id]) ?? root;
        const active = family.some((l) => l.id === activeLook);
        return (
          <div className="layout-family" data-active={active} key={root.id}>
            <button className="layout-sample" aria-pressed={active} aria-label={t('look_' + selected.id)}
              title={t('look_' + selected.id + '_h')} onClick={() => onApplyLook(selected)}>
              <div className="layout-miniature" aria-hidden="true">
                <div className="layout-miniature-content">
                  {samples.get(selected.id)!.map((line, i) => (
                    <div key={i} style={{ minHeight: 5, lineHeight: 1.25 }}>
                      {line.map((run, j) => (
                        <span key={j} style={{
                          color: run.color ?? '#dadce0',
                          fontSize: (run.size ?? 14) + 'px',
                          fontWeight: run.bold ? 700 : 400,
                          fontStyle: run.italic ? 'italic' : 'normal',
                        }}>{run.text}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <span className="layout-family-label">{t('look_' + root.id)}{active && <Check size={13} aria-hidden="true" />}</span>
            </button>
            {family.length > 1 && (
              <div className="layout-variants" role="group" aria-label={t('g_variants') + ': ' + t('look_' + root.id)}>
                {family.map((look, index) => (
                  <button key={look.id} aria-pressed={selected.id === look.id}
                    onClick={() => { setVariants((v) => ({ ...v, [root.id]: look.id })); onApplyLook(look); }}>
                    {index === 0 ? t('g_standard') : t('look_' + look.id).split(' · ').slice(1).join(' · ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
