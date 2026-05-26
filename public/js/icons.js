// ── Icon helper for self-hosted Fontawesome Free ──
//
// We mapped our internal names (e.g. "gift", "warning") to the real
// Fontawesome v6/v7 class names so the rest of the codebase keeps its
// readable names.
//
// Usage in HTML:
//   <i class="fa-icon" data-icon="gift"></i>
// gets hydrated into:
//   <i class="fa-icon fa-solid fa-gift"></i>
//
// Or directly use FA classes:
//   <i class="fa-solid fa-gift"></i>
//
// Usage in JS-Strings:
//   `... ${icon('check')} Text ...`
// returns:
//   `... <i class="fa-icon fa-solid fa-check"></i> Text ...`
//
// After DOM mutations call hydrateIcons(rootElement) to upgrade any
// <i data-icon="..."> placeholders that were freshly injected.

const ICON_MAP = {
  // chrome / utility
  gift:               'fa-solid fa-gift',
  'shield-halved':    'fa-solid fa-shield-halved',
  heart:              'fa-solid fa-heart',
  lightbulb:          'fa-solid fa-lightbulb',
  clipboard:          'fa-solid fa-clipboard',
  check:              'fa-solid fa-check',
  xmark:              'fa-solid fa-xmark',
  ban:                'fa-solid fa-ban',
  warning:            'fa-solid fa-triangle-exclamation',
  'rotate-left':      'fa-solid fa-rotate-left',
  search:             'fa-solid fa-magnifying-glass',
  info:               'fa-solid fa-circle-info',
  layout:             'fa-solid fa-table-cells-large',
  star:               'fa-solid fa-star',
  asterisk:           'fa-solid fa-asterisk',
  'chevron-up':       'fa-solid fa-chevron-up',
  'chevron-down':     'fa-solid fa-chevron-down',
  'arrow-right':      'fa-solid fa-arrow-right',
  sun:                'fa-solid fa-sun',
  moon:               'fa-solid fa-moon',
  font:               'fa-solid fa-font',

  // template category icons
  candy:              'fa-solid fa-candy-cane',
  'face-smile':       'fa-solid fa-face-smile',
  users:              'fa-solid fa-user-group',
  fire:               'fa-solid fa-fire',
  kiss:               'fa-solid fa-kiss-wink-heart',
  pepper:             'fa-solid fa-pepper-hot',
  'face-laugh':       'fa-solid fa-face-laugh-squint',
  skull:              'fa-solid fa-skull',
  cake:               'fa-solid fa-cake-candles',
  eye:                'fa-solid fa-eye',
  tree:               'fa-solid fa-tree',
  ghost:              'fa-solid fa-ghost',
  egg:                'fa-solid fa-egg',
  'heart-pulse':      'fa-solid fa-heart-pulse',
  venus:              'fa-solid fa-venus',
  'flag-usa':         'fa-solid fa-flag-usa',
  'star-of-david':    'fa-solid fa-star-of-david',
  clover:             'fa-solid fa-clover',
  'champagne-glasses':'fa-solid fa-champagne-glasses',
  ring:               'fa-solid fa-ring',
  handcuffs:          'fa-solid fa-handcuffs',
  'mug-hot':          'fa-solid fa-mug-hot',
  spider:             'fa-solid fa-spider',
  'wine-glass':       'fa-solid fa-wine-glass',
  leaf:               'fa-solid fa-leaf',
  drumstick:          'fa-solid fa-drumstick-bite',
  gem:                'fa-solid fa-gem',
  rainbow:            'fa-solid fa-rainbow',

  // brand icons
  discord:            'fa-brands fa-discord',
};

function icon(name, cls = '') {
  const fa = ICON_MAP[name];
  if (!fa) return '';
  const extra = cls ? ' ' + cls : '';
  return `<i class="fa-icon ${fa}${extra}" aria-hidden="true"></i>`;
}

function hydrateIcons(root) {
  root = root || document;
  root.querySelectorAll('i.fa-icon[data-icon]').forEach(el => {
    // skip if already hydrated (has a fa-* class)
    if (el.classList.contains('fa-solid') || el.classList.contains('fa-brands') || el.classList.contains('fa-regular')) return;
    const name = el.getAttribute('data-icon');
    const fa = ICON_MAP[name];
    if (!fa) return;
    fa.split(' ').forEach(c => el.classList.add(c));
    el.setAttribute('aria-hidden', 'true');
  });
}

// Auto-hydrate on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => hydrateIcons());
} else {
  hydrateIcons();
}
