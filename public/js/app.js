// ── build marker (lets users verify which version is live) ──
console.log('%c[gift-generator] build 2026-05-26 — resetAll hardened, sans-serif preview', 'color:#7ec87e;font-weight:bold');

// ── debounce helper ──
function debounce(fn, ms) {
  let tid;
  return function(...args) { clearTimeout(tid); tid = setTimeout(() => fn.apply(this, args), ms); };
}

// ── shared TextEncoder (UTF-8 byte length) ──
// Re-instantiating TextEncoder every call is wasteful; encode() is hot in
// generate() / counter / trim-check, so we keep one instance module-wide.
const TEXT_ENCODER = new TextEncoder();
const byteLen = s => TEXT_ENCODER.encode(s || '').length;

// ── undo / redo ──
const UNDO_STACK = [];
const REDO_STACK = [];
const MAX_UNDO = 20;

function captureState() {
  const s = {};
  FIELDS.forEach(f => s[f] = document.getElementById(f).value);
  SIZE_IDS.forEach(id => s[id] = document.getElementById(id).value);
  CHECK_IDS.forEach(id => { const el = document.getElementById(id); if (el) s[id] = el.checked; });
  s._col = JSON.stringify(colors);
  s._grad = JSON.stringify(grads);
  s._nc = JSON.stringify(noColor);
  s._ff = JSON.stringify(fieldFonts);
  s._lay = currentLayout;
  s._lo = lineOrder.slice();
  s._kao = document.getElementById('kaoSection')?.style.display !== 'none';
  return s;
}

function applyState(s) {
  FIELDS.forEach(f => { const el = document.getElementById(f); if (el && s[f] != null) el.value = s[f]; });
  SIZE_IDS.forEach(id => { const el = document.getElementById(id); if (el && s[id] != null) el.value = s[id]; });
  CHECK_IDS.forEach(id => { const el = document.getElementById(id); if (el && s[id] != null) el.checked = s[id]; });
  if (s._col) Object.assign(colors, JSON.parse(s._col));
  if (s._grad) { const g = JSON.parse(s._grad); Object.keys(g).forEach(f => { if(grads[f]) Object.assign(grads[f], g[f]); }); }
  if (s._nc) Object.assign(noColor, JSON.parse(s._nc));
  if (s._ff) {
    Object.assign(fieldFonts, JSON.parse(s._ff));
    Object.keys(fieldFonts).forEach(f => {
      ['normal','fancy','smallcaps','thai'].forEach(st => {
        const el = document.getElementById('font_' + f + '_' + st);
        if (el) el.classList.toggle('on', fieldFonts[f] === st);
      });
    });
  }
  FIELDS.forEach(f => {
    const btn = document.getElementById('btn_' + f);
    if (!btn) return;
    const g = grads[f];
    btn.style.background = g.on ? `linear-gradient(to right,${g.c1},${g.c2})` : colors[f];
  });
  if (s._lay) {
    currentLayout = s._lay;
    document.querySelectorAll('[id^="lay_"]').forEach(el => el.classList.remove('on'));
    const b = document.getElementById('lay_' + s._lay);
    if (b) b.classList.add('on');
  }
  if (s._lo) lineOrder = s._lo.slice();
  if (s._kao != null) {
    document.getElementById('kaoSection').style.display = s._kao ? '' : 'none';
    document.getElementById('kao_on')?.classList.toggle('on', s._kao);
    document.getElementById('kao_off')?.classList.toggle('on', !s._kao);
  }
  generate();
}

// Suppression flag for synthetic pushUndo() calls (e.g. resetAll re-applying
// a template internally — we don't want an extra "factory state" entry to
// pollute the undo stack between the user's reset and the template re-apply).
let _suppressPushUndo = false;
function pushUndo() {
  if (_suppressPushUndo) return;
  UNDO_STACK.push(captureState());
  if (UNDO_STACK.length > MAX_UNDO) UNDO_STACK.shift();
  REDO_STACK.length = 0;
  updateUndoBtns();
}

// Tracks the most recently clicked template so Reset can return to that
// state instead of the factory default. Cleared on hard "factory" resets
// (i.e. a Reset when no template has been picked this session).
let lastTemplate = null;
function applyTemplate(fnName, main, top, bottom){
  lastTemplate = { fnName, main, top, bottom };
  const fn = window[fnName];
  if (typeof fn === 'function') fn(main, top, bottom);
}

function undo() {
  if (!UNDO_STACK.length) return;
  REDO_STACK.push(captureState());
  applyState(UNDO_STACK.pop());
  updateUndoBtns();
}

function redo() {
  if (!REDO_STACK.length) return;
  UNDO_STACK.push(captureState());
  applyState(REDO_STACK.pop());
  updateUndoBtns();
}

function updateUndoBtns() {
  const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn');
  if (u) u.classList.toggle('disabled', !UNDO_STACK.length);
  if (r) r.classList.toggle('disabled', !REDO_STACK.length);
}

// ── ui helpers ──
function toggleAllSections(scopeSelector) {
  const scope = document.querySelector(scopeSelector);
  if (!scope) return;
  const secs = scope.querySelectorAll('.sec');
  if (!secs.length) return;
  let openCount = 0;
  secs.forEach(s => { if (s.querySelector('.sec-head')?.classList.contains('open')) openCount++; });
  const shouldExpand = openCount < secs.length;
  secs.forEach(s => {
    const head = s.querySelector('.sec-head');
    const body = s.querySelector('.sec-body');
    if (!head || !body) return;
    head.classList.toggle('open', shouldExpand);
    body.classList.toggle('open', shouldExpand);
    if (s.id) { try { localStorage.setItem('sec_' + s.id, shouldExpand ? '1' : '0'); } catch(e) {} }
  });
  // update button label — scope to the surrounding column so left/right buttons stay independent
  const col = scope.classList.contains('col') ? scope : scope.closest('.col');
  const btn = col?.querySelector('.col-toolbar-btn');
  if (btn) {
    const key = shouldExpand ? 'collapse_all' : 'expand_all';
    const arrow = shouldExpand ? '▴' : '▾';
    const label = shouldExpand ? 'Collapse all' : 'Expand all';
    btn.setAttribute('data-i18n', key);
    btn.textContent = `${arrow} ${typeof t === 'function' ? t(key) || label : label}`;
  }
}
function toggleSec(head) {
  head.classList.toggle('open');
  head.nextElementSibling.classList.toggle('open');
  // persist open/closed state for sections with an id
  const sec = head.closest('.sec');
  if (sec && sec.id) {
    const isOpen = head.classList.contains('open');
    try { localStorage.setItem('sec_' + sec.id, isOpen ? '1' : '0'); } catch(e) {}
  }
}

// restore saved section states on load
function restoreSectionStates() {
  document.querySelectorAll('.sec[id]').forEach(sec => {
    try {
      const saved = localStorage.getItem('sec_' + sec.id);
      if (saved === null) return;          // no preference saved yet
      const head = sec.querySelector('.sec-head');
      const body = sec.querySelector('.sec-body');
      if (!head || !body) return;
      const wantOpen = saved === '1';
      const isOpen   = head.classList.contains('open');
      if (wantOpen !== isOpen) {
        head.classList.toggle('open');
        body.classList.toggle('open');
      }
    } catch(e) {}
  });
}

// ── auto-save: persist entire gift state ──
const FIELDS = ['dekoTop','topText','mainText','bottomText','kaomoji','dekoBottom'];
const SIZE_IDS = ['sizeDekoTop','sizeTopText','fontSize','sizeBottomText','sizeKaomoji','sizeDekoBottom'];
const CHECK_IDS = ['mainBold','mainItalic','topBold','topItalic','bottomBold','bottomItalic'];

function saveGiftState() {
  try {
    const state = {
      texts: {},
      sizes: {},
      checks: {},
      colors: Object.assign({}, colors),
      grads: JSON.parse(JSON.stringify(grads)),
      noColor: Object.assign({}, noColor),
      fieldFonts: Object.assign({}, fieldFonts),
      layout: currentLayout,
      lineOrder: lineOrder.slice(),
      kaoOn: document.getElementById('kaoSection').style.display !== 'none',
    };
    FIELDS.forEach(f => state.texts[f] = document.getElementById(f).value);
    SIZE_IDS.forEach(id => state.sizes[id] = document.getElementById(id).value);
    CHECK_IDS.forEach(id => { const el = document.getElementById(id); if (el) state.checks[id] = el.checked; });
    localStorage.setItem('giftState', JSON.stringify(state));
  } catch(e) {}
}

function restoreGiftState() {
  try {
    const raw = localStorage.getItem('giftState');
    if (!raw) return false;
    const state = JSON.parse(raw);

    // texts
    if (state.texts) FIELDS.forEach(f => {
      const el = document.getElementById(f);
      if (el && state.texts[f] != null) el.value = state.texts[f];
    });

    // sizes
    if (state.sizes) SIZE_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el && state.sizes[id] != null) el.value = state.sizes[id];
    });

    // checkboxes (bold/italic)
    if (state.checks) CHECK_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el && state.checks[id] != null) el.checked = state.checks[id];
    });

    // colors
    if (state.colors) Object.assign(colors, state.colors);
    if (state.noColor) Object.assign(noColor, state.noColor);
    if (state.grads) {
      Object.keys(state.grads).forEach(f => {
        if (grads[f]) Object.assign(grads[f], state.grads[f]);
      });
    }

    // update color buttons to reflect restored state
    FIELDS.forEach(f => {
      const btn = document.getElementById('btn_' + f);
      if (!btn) return;
      const g = grads[f];
      btn.style.background = g.on ? `linear-gradient(to right,${g.c1},${g.c2})` : colors[f];
    });

    // font styles
    if (state.fieldFonts) {
      Object.assign(fieldFonts, state.fieldFonts);
      Object.keys(fieldFonts).forEach(f => {
        ['normal','fancy','smallcaps','thai'].forEach(s => {
          const el = document.getElementById('font_' + f + '_' + s);
          if (el) el.classList.toggle('on', fieldFonts[f] === s);
        });
      });
      if (fieldFonts.mainText) currentFontStyle = fieldFonts.mainText;
    }

    // layout
    if (state.layout && layoutDefaults[state.layout]) {
      currentLayout = state.layout;
      document.querySelectorAll('[id^="lay_"]').forEach(el => el.classList.remove('on'));
      const layBtn = document.getElementById('lay_' + state.layout);
      if (layBtn) layBtn.classList.add('on');
    }

    // line order
    if (state.lineOrder && Array.isArray(state.lineOrder)) {
      lineOrder = state.lineOrder.slice();
    }

    // kaomoji on/off
    if (state.kaoOn != null) {
      document.getElementById('kaoSection').style.display = state.kaoOn ? '' : 'none';
      document.getElementById('kao_on').classList.toggle('on', state.kaoOn);
      document.getElementById('kao_off').classList.toggle('on', !state.kaoOn);
    }

    // if ALL text fields are empty, treat as no real saved state
    // (stale data from old resetAll that cleared everything)
    const allEmpty = FIELDS.every(f => !document.getElementById(f).value.trim());
    if (allEmpty) {
      try { localStorage.removeItem('giftState'); } catch(e2) {}
      return false;
    }

    return true;
  } catch(e) { return false; }
}

// ── i18n ──
const I18N = {
  en: {
    chars:'Chars', bytes:'Bytes',
    feedback_pre:'Feedback · ', feedback_post:' on Discord',
    howto_title:'How It Works',
    howto_intro:'Make a 3dxchat gift in 4 quick steps:',
    howto_step1:'<b>Click a template</b> on the right — categories like Sweet, Flirty, Spicy. Your text fills in instantly.',
    howto_step2:'<b>Pick a Layout</b> on the left — Center, Inline, Compact, Framed, Minimal, Pyramid, or Custom. Decides how the lines are stacked.',
    howto_step3:'<b>Customize (optional)</b> — edit the text fields, change colors via the colored square next to each field, switch fonts with Aa / αв / ꜱᴄ.',
    howto_step4:'<b>Copy the code</b> under the preview, paste it in 3dxchat as a gift message. Done!',
    howto_extras_title:'Good to know',
    howto_extras:'<li>Click any line in the <b>preview</b> to jump to that field for editing.</li><li><b>Rearrange or remove lines:</b> click the teal <b>↕ Click to edit</b> pill above the preview — ↑ ↓ buttons appear to swap each line up/down, plus a red <b>×</b> to remove. Click <b>✓ Done</b> when finished.</li><li>Hit the <b>★</b> next to a template to save it as a favorite (shows up at the top of the templates list).</li><li><b>Share</b> copies a link to your clipboard — whoever opens it sees your exact gift in their generator.</li><li>The <b>counter</b> at the top stays green if your gift fits 3dxchat&#39;s limit (240 chars / 255 bytes). Yellow = warning, red = too long.</li>',
    layout:'Layout',
    layout_center:'Center', layout_inline:'Inline', layout_compact:'Compact',
    layout_framed:'Framed', layout_minimal:'Minimal', layout_pyramid:'Pyramid',
    layout_custom:'Custom',
    reset_all:'Reset All',
    deco_top:'Deco Top', top_line:'Top Line', main_text:'Main Text',
    bottom_line:'Bottom Line', kaomoji:'Kaomoji', deco_bottom:'Deco Bottom', symbols:'Symbols',
    plus_symbol:'+ Symbol', size:'Size', bold:'Bold', italic:'Italic',
    cute:'Cute', ascii:'ASCII', with_kao:'With', without_kao:'Without',
    hearts:'Hearts', stars:'Stars', flowers:'Flowers', arrows_deco:'Arrows & Deco', misc:'Misc',
    ph_deco_top:'Deco top…', ph_top:'Top line…', ph_main:'Main text…',
    ph_bottom:'Bottom line…', ph_kao:'Kaomoji…', ph_deco_bottom:'Deco bottom…',
    preview:'Preview', click_edit:'Click to edit', click_to_copy:'Click to copy',
    code:'Code', copy_code:'Copy Code', copied:'Copied!',
    tip_howto_title:'How It Works',
    fav_empty:'Click ★ on any template to pin it here',
    char_limit_tt:'3dxchat allows up to 240 characters and 255 bytes per gift message. Yellow = warning, red = over limit.',
    without:'Without',
    without_tt:'Render this line without decoration (empties the field)',
    grad_per_letter:'Per letter', grad_per_word:'Per word', grad_per_line:'Per line', grad_per_para:'Per paragraph',
    grad_mid_only:'Gradient only middle part',
    grad_mid_only_short:'Middle only',
    expand_all:'Expand all', collapse_all:'Collapse all',
    copy_blocked:'Too long to copy',
    copy_blocked_msg:'Your gift is over the limit. Shorten the text, remove emojis, or use less styling.',
    line_removed:'Line removed.',
    undo_action:'Undo',
    remove_line:'Remove line',
    reorder_btn:'Reorder', reorder_done:'Done',
    undo_btn:'Undo', redo_btn:'Redo',
    undo_title:'Undo last action (Ctrl+Z)', redo_title:'Redo (Ctrl+Y)',
    decos_trimmed:(names)=>`Trimmed ${names} to fit the 240/255 limit`,
    byte_breakdown:'Per-field bytes',
    tip_howto:'Gradients &amp; long deco lines use lots of characters. If the counter turns <span style="color:var(--red)">red</span>, try shorter text, remove deco lines, or disable gradients. Themed templates (Holidays, Celebrations, Vibes) apply matching colors automatically and clear deco lines to stay under the limit.',
    tip_howto2:'All fields show examples — click any line in the preview to jump to the matching field and edit it directly. Use the ★ checkbox next to Deco Top, Top Line or Bottom Line to wrap that line in * stars * — works in every layout.',
    disclaimer:'<strong>Disclaimer</strong><ul><li>Tool provided as-is, with no guarantees</li><li>Not responsible for errors, bugs, or character-limit issues</li><li>Use at your own risk</li><li>All texts are suggestions only</li></ul>',
    disclaimer_short:'Tool without warranty — all texts are suggestions.',
    modal_color:'Color · ', gradient:'Gradient', color_1:'Color 1', color_2:'Color 2',
    apply:'Apply', cancel:'Cancel', no_color:'No Color Tag', saves_chars:'· saves chars',
    custom_color:'Custom color — pick any hex',
    // dynamic optimize tips
    opt_over:'Over the limit — shorten your message',
    opt_warn:'Getting long — optimization hints',
    opt_info:'Optimization hints',
    opt_grad:(f,o,w)=>`Gradient on ${f} adds ~${o} extra chars (${w} word${w>1?'s':''})`,
    opt_longest:(f,n)=>`${f} is your longest section — ${n} chars`,
    opt_deko_top_long:'Deco Top is very long — try shortening it',
    opt_deko_bot_long:'Deco Bottom is very long — try shortening it',
    opt_kao_long:n=>`Kaomoji is quite long (${n} chars)`,
    opt_kao_grad:n=>`Kaomoji + gradient${n>1?'s':''} together may exceed the limit`,
    opt_dup_deko:'Try removing duplicate symbols in Deco Top',
    opt_layout:'Try switching to Compact or Minimal layout to save chars',
    opt_rm_kao:n=>`Remove Kaomoji — saves ~${n} chars`,
    opt_rm_dt:n=>`Remove Deco Top — saves ~${n} chars`,
    opt_rm_db:n=>`Remove Deco Bottom — saves ~${n} chars`,
    opt_rm_font:(f,n)=>`Fancy font on ${f} adds ~${n} extra bytes — switch to normal to fit`,
    opt_remove:'remove',
    opt_switch:'switch',
    fl_dekoTop:'Deco Top', fl_topText:'Top Line', fl_mainText:'Main Text',
    fl_bottomText:'Bottom Line', fl_kaomoji:'Kaomoji', fl_dekoBottom:'Deco Bottom',
  },
  de: {
    chars:'Zeichen', bytes:'Bytes',
    feedback_pre:'Feedback · ', feedback_post:' auf Discord',
    howto_title:'So geht\'s',
    howto_intro:'In 4 schnellen Schritten zum 3dxchat-Gift:',
    howto_step1:'<b>Klick eine Vorlage</b> rechts — Kategorien wie Sweet, Flirty, Spicy. Dein Text wird sofort eingefügt.',
    howto_step2:'<b>Layout wählen</b> links — Zentriert, Inline, Kompakt, Mit Rahmen, Minimal, Pyramide oder Eigenes. Bestimmt, wie die Zeilen angeordnet werden.',
    howto_step3:'<b>Anpassen (optional)</b> — Textfelder bearbeiten, Farben über das farbige Quadrat neben jedem Feld ändern, Schriftart mit Aa / αв / ꜱᴄ wechseln.',
    howto_step4:'<b>Code kopieren</b> unter der Vorschau, in 3dxchat als Gift-Nachricht einfügen. Fertig!',
    howto_extras_title:'Gut zu wissen',
    howto_extras:'<li>Klick eine Zeile in der <b>Vorschau</b>, um direkt in das passende Feld zu springen.</li><li><b>Zeilen tauschen oder entfernen:</b> klick die türkise <b>↕ Click to edit</b>-Pille über der Vorschau — neben jeder Zeile erscheinen ↑ ↓ Buttons zum nach oben/unten Schieben plus ein rotes <b>×</b> zum Entfernen. Mit <b>✓ Fertig</b> verlässt du den Modus wieder.</li><li>Das <b>★</b> neben einer Vorlage speichert sie als Favorit (taucht oben in der Vorlagen-Liste auf).</li><li><b>Share</b> kopiert einen Link in die Zwischenablage — wer ihn öffnet, sieht dein exaktes Gift im Generator.</li><li>Der <b>Zähler</b> oben bleibt grün, solange dein Gift ins Limit passt (240 Zeichen / 255 Bytes). Gelb = Warnung, Rot = zu lang.</li>',
    layout:'Layout',
    layout_center:'Zentriert', layout_inline:'Inline', layout_compact:'Kompakt',
    layout_framed:'Mit Rahmen', layout_minimal:'Minimal', layout_pyramid:'Pyramide',
    layout_custom:'Eigenes',
    reset_all:'Alles zurücksetzen',
    deco_top:'Deko oben', top_line:'Obere Zeile', main_text:'Haupttext',
    bottom_line:'Untere Zeile', kaomoji:'Kaomoji', deco_bottom:'Deko unten', symbols:'Symbole',
    plus_symbol:'+ Symbol', size:'Größe', bold:'Fett', italic:'Kursiv',
    cute:'Süß', ascii:'ASCII', with_kao:'Mit', without_kao:'Ohne',
    hearts:'Herzen', stars:'Sterne', flowers:'Blumen', arrows_deco:'Pfeile & Deko', misc:'Sonstige',
    ph_deco_top:'Deko oben…', ph_top:'Obere Zeile…', ph_main:'Haupttext…',
    ph_bottom:'Untere Zeile…', ph_kao:'Kaomoji…', ph_deco_bottom:'Deko unten…',
    preview:'Vorschau', click_edit:'Zum Bearbeiten klicken', click_to_copy:'Zum Kopieren klicken',
    code:'Code', copy_code:'Code kopieren', copied:'Kopiert!',
    tip_howto_title:'So geht\'s',
    fav_empty:'Klick ★ bei einer Vorlage, um sie hier zu speichern',
    char_limit_tt:'3dxchat erlaubt max. 240 Zeichen und 255 Bytes pro Gift. Gelb = Warnung, Rot = überm Limit.',
    without:'Ohne',
    without_tt:'Zeile ohne Deko anzeigen (leert das Feld)',
    grad_per_letter:'Pro Buchstabe', grad_per_word:'Pro Wort', grad_per_line:'Pro Zeile', grad_per_para:'Pro Absatz',
    grad_mid_only:'Verlauf nur im Mittelteil',
    grad_mid_only_short:'Nur Mitte',
    expand_all:'Alle ausklappen', collapse_all:'Alle einklappen',
    copy_blocked:'Zu lang zum Kopieren',
    copy_blocked_msg:'Dein Gift ist überm Limit. Kürze den Text, entferne Emojis oder reduziere das Styling.',
    line_removed:'Zeile entfernt.',
    undo_action:'Rückgängig',
    remove_line:'Zeile entfernen',
    reorder_btn:'Sortieren', reorder_done:'Fertig',
    undo_btn:'Rückgängig', redo_btn:'Wiederholen',
    decos_trimmed:(names)=>`${names} entfernt um ins 240/255-Limit zu passen`,
    byte_breakdown:'Bytes pro Feld',
    undo_title:'Letzte Aktion rückgängig machen (Strg+Z)', redo_title:'Wiederholen (Strg+Y)',
    tip_howto:'Verläufe und lange Deko-Zeilen verbrauchen viele Zeichen. Wird der Zähler <span style="color:var(--red)">rot</span>, probier es mit kürzerem Text, weniger Deko-Zeilen oder ohne Verlauf. Themen-Vorlagen (Feiertage, Anlässe, Vibes) setzen die Farben automatisch passend und leeren die Deko-Zeilen, damit du unterm Limit bleibst.',
    tip_howto2:'Alle Felder zeigen Beispiele — klick eine Zeile in der Vorschau, um direkt ins passende Feld zu springen. Mit der ★-Checkbox neben Deco Top, Top Line oder Bottom Line kannst du in jedem Layout eine Zeile in * Sternchen * wickeln.',
    disclaimer:'<strong>Haftungsausschluss</strong><ul><li>Tool wird ohne Gewähr bereitgestellt</li><li>Keine Haftung für Fehler, Bugs oder Probleme mit dem Zeichenlimit</li><li>Nutzung auf eigene Gefahr</li><li>Alle Texte sind nur Vorschläge</li></ul>',
    disclaimer_short:'Tool ohne Gewähr — alle Texte sind nur Vorschläge.',
    modal_color:'Farbe · ', gradient:'Verlauf', color_1:'Farbe 1', color_2:'Farbe 2',
    apply:'Übernehmen', cancel:'Abbrechen', no_color:'Kein Color-Tag', saves_chars:'· spart Zeichen',
    custom_color:'Eigene Farbe — beliebigen Hex wählen',
    opt_over:'Über dem Limit — kürz deine Nachricht',
    opt_warn:'Wird lang — Optimierungs-Tipps',
    opt_info:'Optimierungs-Tipps',
    opt_grad:(f,o,w)=>`Verlauf auf ${f} kostet ~${o} Extra-Zeichen (${w} Wort${w>1?'e':''})`,
    opt_longest:(f,n)=>`${f} ist dein längster Abschnitt — ${n} Zeichen`,
    opt_deko_top_long:'Deko oben ist sehr lang — versuch sie zu kürzen',
    opt_deko_bot_long:'Deko unten ist sehr lang — versuch sie zu kürzen',
    opt_kao_long:n=>`Kaomoji ist ziemlich lang (${n} Zeichen)`,
    opt_kao_grad:n=>`Kaomoji + Verlauf${n>1?'e':''} zusammen sprengen schnell das Limit`,
    opt_dup_deko:'Doppelte Symbole in Deko oben entfernen spart Zeichen',
    opt_layout:'Wechsle zum Layout Kompakt oder Minimal, um Zeichen zu sparen',
    opt_rm_kao:n=>`Kaomoji entfernen — spart ~${n} Zeichen`,
    opt_rm_dt:n=>`Deko oben entfernen — spart ~${n} Zeichen`,
    opt_rm_db:n=>`Deko unten entfernen — spart ~${n} Zeichen`,
    opt_rm_font:(f,n)=>`Sonderschrift auf ${f} braucht ~${n} Extra-Bytes — wechsle zu Normal`,
    opt_remove:'entfernen',
    opt_switch:'wechseln',
    fl_dekoTop:'Deko oben', fl_topText:'Obere Zeile', fl_mainText:'Haupttext',
    fl_bottomText:'Untere Zeile', fl_kaomoji:'Kaomoji', fl_dekoBottom:'Deko unten',
  },
  fr: {
    chars:'Caractères', bytes:'Octets',
    feedback_pre:'Feedback · ', feedback_post:' sur Discord',
    howto_title:'Comment ça marche',
    howto_intro:'Crée un cadeau 3dxchat en 4 étapes rapides :',
    howto_step1:'<b>Clique un modèle</b> à droite — catégories Sweet, Flirty, Spicy, etc. Ton texte s\'affiche tout de suite.',
    howto_step2:'<b>Choisis une Disposition</b> à gauche — Centré, Inline, Compact, Cadre, Minimal, Pyramide ou Perso. Décide comment les lignes sont empilées.',
    howto_step3:'<b>Personnalise (optionnel)</b> — modifie les champs, change les couleurs via le carré coloré à côté de chaque champ, change la police avec Aa / αв / ꜱᴄ.',
    howto_step4:'<b>Copie le code</b> sous l\'aperçu, colle-le dans 3dxchat comme message cadeau. C\'est fait !',
    howto_extras_title:'Bon à savoir',
    howto_extras:'<li>Clique une ligne dans l\'<b>aperçu</b> pour sauter directement au champ correspondant.</li><li><b>Réordonner ou supprimer des lignes :</b> clique la pastille turquoise <b>↕ Click to edit</b> au-dessus de l\'aperçu — des flèches ↑ ↓ apparaissent pour décaler chaque ligne, plus un <b>×</b> rouge pour la supprimer. Clique <b>✓ Terminé</b> pour finir.</li><li>L\'<b>★</b> à côté d\'un modèle le sauvegarde en favori (apparaît en haut de la liste).</li><li><b>Share</b> copie un lien dans ton presse-papiers — quiconque l\'ouvre voit ton cadeau exact dans son générateur.</li><li>Le <b>compteur</b> en haut reste vert si ton cadeau respecte la limite (240 car. / 255 octets). Jaune = attention, rouge = trop long.</li>',
    layout:'Disposition',
    layout_center:'Centré', layout_inline:'En ligne', layout_compact:'Compact',
    layout_framed:'Encadré', layout_minimal:'Minimal', layout_pyramid:'Pyramide',
    layout_custom:'Perso',
    reset_all:'Tout réinitialiser',
    deco_top:'Déco haut', top_line:'Ligne haut', main_text:'Texte principal',
    bottom_line:'Ligne bas', kaomoji:'Kaomoji', deco_bottom:'Déco bas', symbols:'Symboles',
    plus_symbol:'+ Symbole', size:'Taille', bold:'Gras', italic:'Italique',
    cute:'Mignon', ascii:'ASCII', with_kao:'Avec', without_kao:'Sans',
    hearts:'Cœurs', stars:'Étoiles', flowers:'Fleurs', arrows_deco:'Flèches & déco', misc:'Divers',
    ph_deco_top:'Déco haut…', ph_top:'Ligne haut…', ph_main:'Texte principal…',
    ph_bottom:'Ligne bas…', ph_kao:'Kaomoji…', ph_deco_bottom:'Déco bas…',
    preview:'Aperçu', click_edit:'Cliquer pour modifier', click_to_copy:'Cliquer pour copier',
    code:'Code', copy_code:'Copier le code', copied:'Copié !',
    tip_howto_title:'Comment ça marche',
    fav_empty:'Clique ★ sur un modèle pour l\'épingler ici',
    char_limit_tt:'3dxchat autorise max. 240 caractères et 255 octets par message cadeau. Jaune = attention, rouge = au-delà.',
    without:'Sans',
    without_tt:'Afficher cette ligne sans décoration (vide le champ)',
    grad_per_letter:'Par lettre', grad_per_word:'Par mot', grad_per_line:'Par ligne', grad_per_para:'Par paragraphe',
    grad_mid_only:'Dégradé uniquement au milieu',
    grad_mid_only_short:'Milieu uniq.',
    expand_all:'Tout déplier', collapse_all:'Tout replier',
    copy_blocked:'Trop long pour copier',
    copy_blocked_msg:'Ton cadeau dépasse la limite. Raccourcis le texte, retire les emojis ou réduis le style.',
    line_removed:'Ligne supprimée.',
    undo_action:'Annuler',
    remove_line:'Supprimer la ligne',
    reorder_btn:'Réordonner', reorder_done:'Terminé',
    undo_btn:'Annuler', redo_btn:'Refaire',
    decos_trimmed:(names)=>`${names} supprimé(s) pour rester sous la limite 240/255`,
    byte_breakdown:'Octets par champ',
    undo_title:'Annuler la dernière action (Ctrl+Z)', redo_title:'Refaire (Ctrl+Y)',
    tip_howto:'Les dégradés et les longues lignes de déco utilisent beaucoup de caractères. Si le compteur devient <span style="color:var(--red)">rouge</span>, essaie un texte plus court, retire des lignes de déco ou désactive les dégradés. Les modèles à thème (Fêtes, Célébrations, Vibes) appliquent automatiquement les bonnes couleurs et vident les lignes de déco pour rester sous la limite.',
    tip_howto2:'Tous les champs montrent des exemples — clique n\'importe quelle ligne dans l\'aperçu pour sauter au champ correspondant et le modifier. La case ★ à côté de Deco Top, Top Line ou Bottom Line entoure cette ligne d\'étoiles * — fonctionne dans tous les layouts.',
    disclaimer:'<strong>Avertissement</strong><ul><li>Outil fourni tel quel, sans garantie</li><li>Non responsable des erreurs, bugs ou problèmes de limite de caractères</li><li>Utilisation à tes propres risques</li><li>Tous les textes ne sont que des suggestions</li></ul>',
    disclaimer_short:'Outil sans garantie — tous les textes sont des suggestions.',
    modal_color:'Couleur · ', gradient:'Dégradé', color_1:'Couleur 1', color_2:'Couleur 2',
    apply:'Appliquer', cancel:'Annuler', no_color:'Pas de couleur', saves_chars:'· économise des caractères',
    custom_color:'Couleur personnalisée — n\'importe quel hex',
    opt_over:'Au-dessus de la limite — raccourcis ton message',
    opt_warn:'Devient long — conseils d\'optimisation',
    opt_info:'Conseils d\'optimisation',
    opt_grad:(f,o,w)=>`Dégradé sur ${f} ajoute ~${o} caractères en plus (${w} mot${w>1?'s':''})`,
    opt_longest:(f,n)=>`${f} est ta plus longue section — ${n} caractères`,
    opt_deko_top_long:'Déco haut est très longue — essaie de la raccourcir',
    opt_deko_bot_long:'Déco bas est très longue — essaie de la raccourcir',
    opt_kao_long:n=>`Kaomoji est assez long (${n} caractères)`,
    opt_kao_grad:n=>`Kaomoji + dégradé${n>1?'s':''} ensemble peuvent dépasser la limite`,
    opt_dup_deko:'Essaie de retirer les symboles dupliqués dans Déco haut',
    opt_layout:'Passe à la disposition Compact ou Minimal pour économiser des caractères',
    opt_rm_kao:n=>`Retirer Kaomoji — économise ~${n} caractères`,
    opt_rm_dt:n=>`Retirer Déco haut — économise ~${n} caractères`,
    opt_rm_db:n=>`Retirer Déco bas — économise ~${n} caractères`,
    opt_rm_font:(f,n)=>`Police spéciale sur ${f} ajoute ~${n} octets en plus — passe à Normal`,
    opt_remove:'retirer',
    opt_switch:'changer',
    fl_dekoTop:'Déco haut', fl_topText:'Ligne haut', fl_mainText:'Texte principal',
    fl_bottomText:'Ligne bas', fl_kaomoji:'Kaomoji', fl_dekoBottom:'Déco bas',
  },
  ru: {
    chars:'Знаки', bytes:'Байты',
    feedback_pre:'Обратная связь · ', feedback_post:' в Discord',
    howto_title:'Как это работает',
    howto_intro:'Сделай подарок 3dxchat за 4 быстрых шага:',
    howto_step1:'<b>Кликни шаблон</b> справа — категории Sweet, Flirty, Spicy и др. Текст вставится мгновенно.',
    howto_step2:'<b>Выбери Макет</b> слева — Центр, Inline, Компакт, Рамка, Минимал, Пирамида или Своё. Определяет, как строки расположены.',
    howto_step3:'<b>Подправь (по желанию)</b> — измени поля, поменяй цвета через цветной квадратик рядом с каждым полем, смени шрифт через Aa / αв / ꜱᴄ.',
    howto_step4:'<b>Скопируй код</b> под предпросмотром, вставь его в 3dxchat как сообщение подарка. Готово!',
    howto_extras_title:'Полезно знать',
    howto_extras:'<li>Кликни строку в <b>предпросмотре</b>, чтобы сразу перейти к нужному полю.</li><li><b>Переставить или удалить строки:</b> кликни бирюзовую пилюлю <b>↕ Click to edit</b> над предпросмотром — рядом с каждой строкой появятся ↑ ↓ для перемещения вверх/вниз и красный <b>×</b> для удаления. Нажми <b>✓ Готово</b>, когда закончишь.</li><li><b>★</b> рядом с шаблоном добавляет его в избранное (появится сверху списка).</li><li><b>Share</b> копирует ссылку в буфер обмена — кто её откроет, увидит твой подарок прямо в генераторе.</li><li><b>Счётчик</b> сверху остаётся зелёным, если подарок укладывается в лимит (240 знаков / 255 байт). Жёлтый = предупреждение, красный = слишком длинно.</li>',
    layout:'Макет',
    layout_center:'Центр', layout_inline:'Строка', layout_compact:'Компактный',
    layout_framed:'Рамка', layout_minimal:'Минимал', layout_pyramid:'Пирамида',
    layout_custom:'Своё',
    reset_all:'Сбросить всё',
    deco_top:'Декор сверху', top_line:'Верхняя строка', main_text:'Основной текст',
    bottom_line:'Нижняя строка', kaomoji:'Каомодзи', deco_bottom:'Декор снизу', symbols:'Символы',
    plus_symbol:'+ Символ', size:'Размер', bold:'Жирный', italic:'Курсив',
    cute:'Милые', ascii:'ASCII', with_kao:'С', without_kao:'Без',
    hearts:'Сердечки', stars:'Звёзды', flowers:'Цветы', arrows_deco:'Стрелки и декор', misc:'Разное',
    ph_deco_top:'Декор сверху…', ph_top:'Верхняя строка…', ph_main:'Основной текст…',
    ph_bottom:'Нижняя строка…', ph_kao:'Каомодзи…', ph_deco_bottom:'Декор снизу…',
    preview:'Предпросмотр', click_edit:'Нажми, чтобы редактировать', click_to_copy:'Нажми, чтобы скопировать',
    code:'Код', copy_code:'Скопировать код', copied:'Скопировано!',
    tip_howto_title:'Как это работает',
    fav_empty:'Нажми ★ на любом шаблоне, чтобы закрепить его здесь',
    char_limit_tt:'3dxchat допускает до 240 знаков и 255 байт на сообщение подарка. Жёлтый = предупреждение, красный = за лимитом.',
    without:'Без',
    without_tt:'Показать строку без декорации (очищает поле)',
    grad_per_letter:'По буквам', grad_per_word:'По словам', grad_per_line:'По строкам', grad_per_para:'По абзацам',
    grad_mid_only:'Градиент только в середине',
    grad_mid_only_short:'Только середина',
    expand_all:'Развернуть всё', collapse_all:'Свернуть всё',
    copy_blocked:'Слишком длинно',
    copy_blocked_msg:'Подарок превышает лимит. Сократи текст, убери эмодзи или уменьши стилизацию.',
    line_removed:'Строка удалена.',
    undo_action:'Отменить',
    remove_line:'Удалить строку',
    reorder_btn:'Порядок', reorder_done:'Готово',
    undo_btn:'Отменить', redo_btn:'Повторить',
    decos_trimmed:(names)=>`${names} убрано — чтобы уложиться в лимит 240/255`,
    byte_breakdown:'Байты по полям',
    undo_title:'Отменить последнее действие (Ctrl+Z)', redo_title:'Повторить (Ctrl+Y)',
    tip_howto:'Градиенты и длинные строки декора используют много знаков. Если счётчик стал <span style="color:var(--red)">красным</span>, попробуй сократить текст, убрать строки декора или отключить градиенты. Тематические шаблоны (Праздники, Торжества, Вайбы) автоматически применяют подходящие цвета и очищают строки декора, чтобы остаться в пределах лимита.',
    tip_howto2:'Все поля показывают примеры — кликни по любой строке в предпросмотре, чтобы перейти к соответствующему полю и редактировать его напрямую. Чекбокс ★ рядом с Deco Top, Top Line или Bottom Line оборачивает строку звёздочками * — работает в любом макете.',
    disclaimer:'<strong>Отказ от ответственности</strong><ul><li>Инструмент предоставляется как есть, без гарантий</li><li>Не несу ответственности за ошибки, баги или проблемы с лимитом знаков</li><li>Используй на свой страх и риск</li><li>Все тексты — лишь предложения</li></ul>',
    disclaimer_short:'Инструмент без гарантий — все тексты лишь предложения.',
    modal_color:'Цвет · ', gradient:'Градиент', color_1:'Цвет 1', color_2:'Цвет 2',
    apply:'Применить', cancel:'Отмена', no_color:'Без цвета', saves_chars:'· экономит знаки',
    custom_color:'Свой цвет — любой HEX',
    opt_over:'Превышен лимит — сократи сообщение',
    opt_warn:'Становится длинным — советы по оптимизации',
    opt_info:'Советы по оптимизации',
    opt_grad:(f,o,w)=>`Градиент на ${f} добавляет ~${o} лишних знаков (${w} слов${w===1?'о':w<5?'а':''})`,
    opt_longest:(f,n)=>`${f} — твоя самая длинная секция, ${n} знаков`,
    opt_deko_top_long:'Декор сверху очень длинный — попробуй сократить',
    opt_deko_bot_long:'Декор снизу очень длинный — попробуй сократить',
    opt_kao_long:n=>`Каомодзи довольно длинный (${n} знаков)`,
    opt_kao_grad:n=>`Каомодзи + градиент${n>1?'ы':''} вместе могут превысить лимит`,
    opt_dup_deko:'Попробуй убрать повторяющиеся символы в Декоре сверху',
    opt_layout:'Переключись на макет Компактный или Минимал, чтобы сэкономить знаки',
    opt_rm_kao:n=>`Убрать Каомодзи — экономит ~${n} знаков`,
    opt_rm_dt:n=>`Убрать Декор сверху — экономит ~${n} знаков`,
    opt_rm_db:n=>`Убрать Декор снизу — экономит ~${n} знаков`,
    opt_rm_font:(f,n)=>`Спецшрифт на ${f} добавляет ~${n} лишних байтов — переключи на Обычный`,
    opt_remove:'убрать',
    opt_switch:'сменить',
    fl_dekoTop:'Декор сверху', fl_topText:'Верхняя строка', fl_mainText:'Основной текст',
    fl_bottomText:'Нижняя строка', fl_kaomoji:'Каомодзи', fl_dekoBottom:'Декор снизу',
  }
};
// Detect the visitor's preferred UI language from the browser.
// Returns one of the 4 supported language codes; falls back to 'en'.
function detectBrowserLang(){
  const supported = ['en','de','fr','ru'];
  const candidates = [];
  try {
    if (typeof navigator !== 'undefined') {
      if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
      if (navigator.language) candidates.push(navigator.language);
      if (navigator.userLanguage) candidates.push(navigator.userLanguage); // IE / old Edge
    }
  } catch(e) {}
  for (const c of candidates) {
    const code = String(c||'').toLowerCase().split('-')[0];
    if (supported.includes(code)) return code;
  }
  return 'en';
}
// Priority: explicit user choice in localStorage > browser language > 'en'
let uiLang = (typeof localStorage!=='undefined' && localStorage.getItem('uiLang')) || detectBrowserLang();
function t(key,...args){
  const v = (I18N[uiLang]&&I18N[uiLang][key]) ?? (I18N.en[key] ?? key);
  return typeof v === 'function' ? v(...args) : v;
}
function applyUILang(){
  document.documentElement.lang = uiLang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    const v = t(k); if (v != null) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{
    const k = el.getAttribute('data-i18n-html');
    const v = t(k); if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const k = el.getAttribute('data-i18n-ph');
    const v = t(k); if (v != null) el.placeholder = v;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{
    const k = el.getAttribute('data-i18n-title');
    const v = t(k); if (v != null) el.title = v;
  });
  document.querySelectorAll('.ui-lang-tab').forEach(tab=>{
    tab.classList.toggle('on', tab.getAttribute('data-lang')===uiLang);
  });
  try{ if(typeof generate==='function') generate(); }catch(e){}
}
function setUILang(lang){
  uiLang = lang;
  try{ localStorage.setItem('uiLang', lang); }catch(e){}
  applyUILang();
}
function initUILang(){ applyUILang(); }
// ── favorites ──
let favorites = [];
try { favorites = JSON.parse(localStorage.getItem('giftFavs') || '[]'); } catch(e) { favorites = []; }

function toggleFav(main, top, bottom, el) {
  const key = main + '|' + top + '|' + bottom;
  const idx = favorites.indexOf(key);
  if (idx >= 0) { favorites.splice(idx, 1); el.classList.remove('fav-on'); }
  else { favorites.push(key); el.classList.add('fav-on'); }
  try { localStorage.setItem('giftFavs', JSON.stringify(favorites)); } catch(e) {}
  renderFavPanel();
}

function isFav(main, top, bottom) {
  return favorites.includes(main + '|' + top + '|' + bottom);
}

function renderFavPanel() {
  const panel = document.getElementById('favPanel');
  if (!panel) return;
  if (!favorites.length) {
    panel.style.display = '';
    panel.querySelector('.chips').innerHTML = `<span class="fav-empty">${t('fav_empty')}</span>`;
    return;
  }
  panel.style.display = '';
  const chips = favorites.map(key => {
    const [main, top, bottom] = key.split('|');
    return `<span class="chip t fav-chip" onclick="applyTemplate('setSpruch','${esc(main)}','${esc(top)}','${esc(bottom)}')">${esc(main)}<span class="fav-rm" onclick="event.stopPropagation();removeFav('${esc(key)}')">×</span></span>`;
  }).join('');
  panel.querySelector('.chips').innerHTML = chips;
}

function removeFav(key) {
  const idx = favorites.indexOf(key);
  if (idx >= 0) favorites.splice(idx, 1);
  try { localStorage.setItem('giftFavs', JSON.stringify(favorites)); } catch(e) {}
  renderFavPanel();
}

// ── layout ──
let userHasEdited = false;
let currentLayout = 'center';
const pyramidStars = { dekoTop: false, topText: false, bottomText: false };
function setPyramidStars(field, on){ pushUndo(); pyramidStars[field] = on; generate(); }
const layoutDefaults = {
  center:  {dekoTop:'· ily ·←', topText:'.. stop being ..', mainText:'so cute', bottomText:'.. i cant handle it ..', kaomoji:'(❀◡❀)', dekoBottom:'.. ･ ✦ ･ ..'},
  inline:  {dekoTop:'❀', topText:'you are', mainText:'so cute', bottomText:'.. i cant handle it ..', kaomoji:'(❀◡❀)', dekoBottom:'.. ✦ ..'},
  compact: {dekoTop:'· · ·', topText:'wollt nur sagen', mainText:'danke dir', bottomText:'für alles', kaomoji:'(˘³˘)♥', dekoBottom:'· · ·'},
  framed:  {dekoTop:'❀ · ❀ · ❀', topText:'du bist mein', mainText:'liebling', bottomText:'· kein scherz ·', kaomoji:'', dekoBottom:''},
  minimal: {dekoTop:'', topText:'', mainText:'nur wir', bottomText:'', kaomoji:'(❀◡❀)', dekoBottom:''},
  pyramid: {dekoTop:'✦ · ✦', topText:'.. stop being ..', mainText:'so cute', bottomText:'.. i cant handle it ..', kaomoji:'(❀◡❀)', dekoBottom:''},
  custom: {dekoTop:'', topText:'', mainText:'', bottomText:'', kaomoji:'', dekoBottom:''}
};
function setLayout(layout) {
  pushUndo();
  currentLayout = layout;
  document.querySelectorAll('[id^="lay_"]').forEach(el=>el.classList.remove('on'));
  document.getElementById('lay_'+layout).classList.add('on');

  // toggle custom editor visibility
  const ce = document.getElementById('customEditor');
  const ob = document.getElementById('outputBox');
  const pvWrap = document.querySelector('.pv-popup');
  const codeLabel = document.querySelector('.code-label');
  const pvLabel = document.querySelector('.pv-label');
  if (layout === 'custom') {
    ce.style.display = '';
    ob.style.display = 'none';
    pvWrap.style.display = 'none';
    if (codeLabel) codeLabel.style.display = 'none';
    if (pvLabel) pvLabel.style.display = 'none';
    // hide optimization tips from previous layout
    const optPanel = document.getElementById('optimizeTips');
    if (optPanel) optPanel.style.display = 'none';
    // keep whatever the user typed; don't auto-fill from old layout
    const ta = document.getElementById('ceTextarea');
    ceSync();
    return;
  } else {
    ce.style.display = 'none';
    ob.style.display = '';
    pvWrap.style.display = '';
    if (codeLabel) codeLabel.style.display = '';
    if (pvLabel) pvLabel.style.display = '';
  }

  if (!userHasEdited) {
    const d = layoutDefaults[layout];
    if (d) ['dekoTop','topText','mainText','bottomText','kaomoji','dekoBottom'].forEach(f=>document.getElementById(f).value=d[f]);
  }
  if(typeof lineOrder!=='undefined') lineOrder=DEFAULT_ORDER.slice();
  generate();
}
// Wrap a field's text in `* X *` if its star checkbox is on.
// Only dekoTop / topText / bottomText have star checkboxes — other fields
// fall through unchanged because pyramidStars[f] is undefined for them.
function withStars(t, f){
  if(!t) return t;
  return pyramidStars[f] ? `* ${t} *` : t;
}
function applyLayout(lm) {
  const ord = (typeof lineOrder!=='undefined') ? lineOrder : ['dekoTop','topText','mainText','bottomText','kaomoji','dekoBottom'];
  // Pre-wrap once so every branch below sees star-wrapped text where applicable.
  const w = {
    dekoTop:    withStars(lm.dekoTop,    'dekoTop'),
    topText:    withStars(lm.topText,    'topText'),
    mainText:   lm.mainText,
    bottomText: withStars(lm.bottomText, 'bottomText'),
    kaomoji:    lm.kaomoji,
    dekoBottom: lm.dekoBottom,
  };
  if(currentLayout==='center')  return ord.map(f=>w[f]).filter(Boolean).join('\n');
  if(currentLayout==='inline')  return [[w.dekoTop,w.topText,w.mainText,w.dekoTop].filter(Boolean).join(' '),w.bottomText,w.kaomoji,w.dekoBottom].filter(Boolean).join('\n');
  if(currentLayout==='compact') return [w.dekoTop,[w.topText,w.mainText,w.bottomText].filter(Boolean).join(' · '),w.kaomoji,w.dekoBottom].filter(Boolean).join('\n');
  if(currentLayout==='framed'){
    const body=ord.map(f=>w[f]).filter(Boolean);
    if(w.dekoTop && !w.dekoBottom) body.push(w.dekoTop);
    return body.join('\n');
  }
  if(currentLayout==='minimal') return ord.filter(f=>f==='mainText'||f==='kaomoji').map(f=>w[f]).filter(Boolean).join('\n');
  if(currentLayout==='pyramid'){
    // pyramid keeps its indent prefixes, but the * X * wrap is already baked in via w.
    const pyrFmt={
      dekoTop:    t => t,
      topText:    t => '　　' + t,
      bottomText: t => '　　　　　　　　　　' + t,
      mainText:   t => t,
      kaomoji:    t => t,
    };
    const lines=[];
    ord.forEach(f=>{if(pyrFmt[f]&&w[f]) lines.push(pyrFmt[f](w[f]));});
    return lines.join('\n');
  }
  return Object.values(w).filter(Boolean).join('\n');
}

// ── colors ──
const COLORS=['#ff71b8','#FF6B9D','#FF4D8C','#FF85C2','#f48fb1','#FF7F7F','#FF5555','#FF7043','#FFB347','#ffd84d','#FFD700','#FFEE58','#c8e65a','#7EC87E','#4DD9AC','#26C6DA','#66BB6A','#85C8FF','#42A5F5','#aaaaff','#b388ff','#CC88FF','#E040FB','#ffffff','#cccccc','#888888','#555577','#5c5c7a','#8f8f8f','#444455'];
const colors={dekoTop:'#555555',topText:'#8f8f8f',mainText:'#ff71b8',bottomText:'#8f8f8f',kaomoji:'#ffd84d',dekoBottom:'#5c5c7a'};
const noColor={dekoTop:false,topText:false,mainText:false,bottomText:false,kaomoji:false,dekoBottom:false};
const grads={dekoTop:{on:false,c1:'#ff71b8',c2:'#b388ff'},topText:{on:false,c1:'#ff71b8',c2:'#b388ff'},mainText:{on:false,c1:'#ff71b8',c2:'#b388ff'},bottomText:{on:false,c1:'#ff71b8',c2:'#b388ff'},kaomoji:{on:false,c1:'#ff71b8',c2:'#b388ff'},dekoBottom:{on:false,c1:'#ff71b8',c2:'#b388ff'}};
const fieldFonts={dekoTop:'normal',topText:'normal',mainText:'normal',bottomText:'normal',kaomoji:'normal',dekoBottom:'normal'};
let currentFontStyle='normal', currentField=null;

// ── modal ──
function openModal(field){
  currentField=field;
  document.getElementById('modalTitle').textContent=t('modal_color')+t('fl_'+field, field);
  const wrap=document.getElementById('modalSwatches'); wrap.innerHTML='';
  COLORS.forEach(c=>{const d=document.createElement('div');d.className='swatch';d.style.background=c;d.onclick=()=>selectModalColor(c);wrap.appendChild(d);});
  const g=grads[field];
  document.getElementById('useGrad').checked=g.on;
  document.getElementById('useNoColor').checked=noColor[field]||false;
  document.getElementById('grad1').value=g.c1; document.getElementById('grad1Picker').value=g.c1;
  document.getElementById('grad2').value=g.c2; document.getElementById('grad2Picker').value=g.c2;
  document.getElementById('gradPreview').style.background=`linear-gradient(to right,${g.c1},${g.c2})`;
  document.getElementById('customHex').value=colors[field];
  document.getElementById('customPicker').value=colors[field];
  updateGradUI();
  document.getElementById('colorModal').classList.add('open');
}
function closeModal(){document.getElementById('colorModal').classList.remove('open');currentField=null;}
function selectModalColor(hex){colors[currentField]=hex;document.getElementById('customHex').value=hex;document.getElementById('customPicker').value=hex;}
function setCustomColor(input){
  let hex = String(input || '').trim();
  if (hex && !hex.startsWith('#')) hex = '#' + hex;
  // expand #abc → #aabbcc
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) hex = '#' + hex.slice(1).split('').map(c => c+c).join('');
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  colors[currentField] = hex;
  document.getElementById('customPicker').value = hex;
  const hexInput = document.getElementById('customHex');
  if (hexInput && hexInput.value.trim().toLowerCase() !== hex.toLowerCase()) hexInput.value = hex;
}
function syncGrad(idx,hex){
  if(!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  if(idx===0){document.getElementById('grad1').value=hex;document.getElementById('grad1Picker').value=hex;}
  else{document.getElementById('grad2').value=hex;document.getElementById('grad2Picker').value=hex;}
  const c1=document.getElementById('grad1').value,c2=document.getElementById('grad2').value;
  document.getElementById('gradPreview').style.background=`linear-gradient(to right,${c1},${c2})`;
}
function updateGradUI(){const on=document.getElementById('useGrad').checked;document.getElementById('gradSection').style.opacity=on?'1':'0.4';}
function updateNoColorUI(){const off=document.getElementById('useNoColor').checked;document.getElementById('useGrad').disabled=off;document.getElementById('gradSection').style.opacity=off?'0.25':(document.getElementById('useGrad').checked?'1':'0.4');}
function applyColor(){
  if(!currentField) return;
  pushUndo();
  noColor[currentField]=document.getElementById('useNoColor').checked;
  const g=grads[currentField]; g.on=document.getElementById('useGrad').checked;
  g.c1=document.getElementById('grad1').value; g.c2=document.getElementById('grad2').value;
  const btn=document.getElementById('btn_'+currentField);
  if(btn) btn.style.background=g.on?`linear-gradient(to right,${g.c1},${g.c2})`:colors[currentField];
  closeModal(); generate();
}
document.getElementById('colorModal').addEventListener('click',function(e){if(e.target===this)closeModal();});

// ── color math ──
function hexToRgb(h){return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)};}
function rgbToHex(r,g,b){return'#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');}
function gradientText(text,c1,c2){
  const words=text.split(' ').filter(w=>w.length>0);
  if(!words.length) return text;
  const r1=hexToRgb(c1),r2=hexToRgb(c2);
  if(words.length===1){const w=words[0];if(w.length<=2)return`<color=${c1}>${w}</color>`;const t=Math.ceil(w.length/3);const p=[w.slice(0,t),w.slice(t,t*2),w.slice(t*2)].filter(x=>x);return p.map((x,i)=>{const f=i/(p.length-1)||0;return`<color=${rgbToHex(r1.r+(r2.r-r1.r)*f,r1.g+(r2.g-r1.g)*f,r1.b+(r2.b-r1.b)*f)}>${x}</color>`;}).join('');}
  return words.map((w,i)=>{const f=i/(words.length-1);return`<color=${rgbToHex(r1.r+(r2.r-r1.r)*f,r1.g+(r2.g-r1.g)*f,r1.b+(r2.b-r1.b)*f)}>${w}</color>`;}).join(' ');
}
// pastel rainbow — for Pride. limits to 3 segments to stay under byte cap.
const PRIDE_PALETTE=['#ffadad','#ffd6a5','#fdffb6','#caffbf','#a0c4ff','#bdb2ff'];
function rainbowText(text){
  const pick=n=>Array.from({length:n},(_,i)=>PRIDE_PALETTE[Math.round(i*(PRIDE_PALETTE.length-1)/(n-1||1))]);
  const words=text.split(' ').filter(w=>w.length>0);
  if(!words.length) return text;
  if(words.length===1){
    const w=words[0]; if(w.length<=2) return `<color=${PRIDE_PALETTE[0]}>${w}</color>`;
    const t=Math.ceil(w.length/3);
    const parts=[w.slice(0,t),w.slice(t,t*2),w.slice(t*2)].filter(Boolean);
    const cols=pick(parts.length);
    return parts.map((x,i)=>`<color=${cols[i]}>${x}</color>`).join('');
  }
  const n=Math.min(words.length,3);
  const cols=pick(n);
  // group words into n buckets so we cap color tags at 3
  return words.map((w,i)=>{const b=Math.min(Math.floor(i*n/words.length),n-1);return{w,b};})
    .reduce((acc,{w,b})=>{const last=acc[acc.length-1];if(last&&last.b===b){last.ws.push(w);}else{acc.push({b,ws:[w]});}return acc;},[])
    .map(({b,ws})=>`<color=${cols[b]}>${ws.join(' ')}</color>`).join(' ');
}
// ── custom layout editor ──

// Tag-aware applyFont. The custom editor textarea contains raw Unity
// rich-text markup (<color=…>, <size=N>, <b>, <i>) intermixed with plain
// content. A naive applyFont() would happily turn `<color=#ff71b8>test`
// into `<¢σℓσя=#ff71в8>тєѕт` — mangling the tag itself (the `b` in the
// hex code becomes Cyrillic `в`, etc). So we split on tags first and
// only convert the text segments between them.
function ceApplyFontPreservingTags(text, style){
  return text.split(/(<[^>]*>)/).map(part => {
    if (part.startsWith('<') && part.endsWith('>')) return part;
    return applyFont(part, style);
  }).join('');
}

function ceApplyFont(style) {
  const ta = document.getElementById('ceTextarea');
  const { s, e } = ceGetSel(ta);
  if (s === e) return;
  const sel = ta.value.substring(s, e);
  const converted = ceApplyFontPreservingTags(sel, style);
  ta.value = ta.value.substring(0, s) + converted + ta.value.substring(e);
  ta.selectionStart = s;
  ta.selectionEnd = s + converted.length;
  ta.focus();
  ceSync();
}

// Toggle-wrap for simple paired tags (<b>, <i>). Mirrors the size/color
// logic so the toggle works EVEN IF there are other tags (color, size)
// between the selection and the matching <b>…</b> wrapper.
//
//   1) selection IS <tag>X</tag>                        → unwrap to X
//   2) some <tag>…</tag> wraps the selection            → remove THAT
//      pair (peels one layer; click again to peel more — handles the
//      'I accidentally clicked Bold 11 times' situation cleanly)
//   3) no wrapper found                                 → add fresh wrap
function ceWrap(tag) {
  const ta = document.getElementById('ceTextarea');
  const { s, e } = ceGetSel(ta);
  if (s === e) return; // no selection
  const val = ta.value;
  const sel = val.substring(s, e);
  const openLen = tag.length + 2;
  const closeLen = tag.length + 3;
  const open = '<' + tag + '>';
  const close = '</' + tag + '>';

  // Case 1: selection IS already <tag>X</tag> → unwrap to X
  if (sel.startsWith(open) && sel.endsWith(close)) {
    const inner = sel.slice(openLen, sel.length - closeLen);
    ta.value = val.substring(0, s) + inner + val.substring(e);
    ta.selectionStart = s;
    ta.selectionEnd = s + inner.length;
    ta.focus(); ceSync(); return;
  }

  // Case 2: an enclosing <tag>…</tag> wraps the selection (possibly
  // through other tags like <color>, <size>) — remove that pair.
  // RegExp metacharacter-safe: tag is always 'b' or 'i' here, so escape
  // is unnecessary, but keep open/close patterns explicit for clarity.
  const openRe  = new RegExp('<' + tag + '>');
  const closeRe = new RegExp('<\\/' + tag + '>');
  const enclosing = findEnclosingTag(val, s, e, openRe, closeRe);
  if (enclosing) {
    const newVal = val.substring(0, enclosing.openStart)
                 + val.substring(enclosing.openEnd, enclosing.closeStart)
                 + val.substring(enclosing.closeEnd);
    ta.value = newVal;
    // The open tag in front of the selection just vanished; shift the
    // selection left by its length so the user's cursor stays on the
    // same characters.
    const shift = -(enclosing.openEnd - enclosing.openStart);
    ta.selectionStart = s + shift;
    ta.selectionEnd   = e + shift;
    ta.focus(); ceSync(); return;
  }

  // Case 3: nothing wraps it — plain wrap
  const wrapped = open + sel + close;
  ta.value = val.substring(0, s) + wrapped + val.substring(e);
  ta.selectionStart = s;
  ta.selectionEnd = s + wrapped.length;
  ta.focus(); ceSync();
}

function ceSetSize(sz) {
  document.getElementById('ceSize').value = sz;
  ceWrapSize();
}

// Walks the text outside [s..e] to find the INNERMOST paired tag that
// wraps the selection — even through other tags. So in
//   <size=20><color=#ff71b8>welcome ♡</color></size>
// selecting "welcome ♡" still finds the outer <size=20>...</size>
// because the color tags balance themselves.
//
// openPattern matches the opening tag (capture groups allowed); closePattern
// matches the closing tag. Both must use forms that don't start with </
// for opens and start with </ for closes — we use a simple textual check
// to tell them apart in the combined match.
function findEnclosingTag(val, s, e, openPattern, closePattern){
  const combinedSrc = openPattern.source + '|' + closePattern.source;
  // Walk all tags in val[0..s], maintaining a stack of unmatched opens.
  const before = val.substring(0, s);
  const stack = [];
  const beforeRe = new RegExp(combinedSrc, 'g');
  let m;
  while ((m = beforeRe.exec(before)) !== null) {
    if (m[0].startsWith('</')) {
      if (stack.length) stack.pop();
    } else {
      stack.push({ idx: m.index, len: m[0].length });
    }
  }
  if (!stack.length) return null;
  const innermost = stack[stack.length - 1];

  // Walk forward from selection end until we hit the unmatched closing tag
  // (any siblings opened after [s..e] must close before this one does).
  const after = val.substring(e);
  const afterRe = new RegExp(combinedSrc, 'g');
  let depth = 0;
  while ((m = afterRe.exec(after)) !== null) {
    if (m[0].startsWith('</')) {
      if (depth === 0) {
        return {
          openStart:  innermost.idx,
          openEnd:    innermost.idx + innermost.len,
          closeStart: e + m.index,
          closeEnd:   e + m.index + m[0].length,
        };
      }
      depth--;
    } else {
      depth++;
    }
  }
  return null;
}

// Smart-wrap that swaps an existing size tag instead of nesting one
// inside another. Three cases:
//   1) selection is exactly <size=N>X</size>        → replace N
//   2) any <size=N>…</size> wraps the selection     → swap N on that wrapper
//   3) anything else                                → strip any nested
//      size tags from the selection, then wrap with new size
function ceWrapSize() {
  const ta = document.getElementById('ceTextarea');
  const sz = document.getElementById('ceSize').value;
  const { s, e } = ceGetSel(ta);
  if (s === e) return;
  const val = ta.value;
  let sel = val.substring(s, e);

  // Case 1: selection IS already a complete <size=N>...</size> — just swap N
  const full = sel.match(/^<size=\d+>([\s\S]*)<\/size>$/);
  if (full) {
    const wrapped = '<size=' + sz + '>' + full[1] + '</size>';
    ta.value = val.substring(0, s) + wrapped + val.substring(e);
    ta.selectionStart = s;
    ta.selectionEnd = s + wrapped.length;
    ta.focus(); ceSync(); return;
  }

  // Case 2: some <size=N>…</size> wraps the selection (possibly through
  // intervening color/b/i tags). Swap N on that wrapper, leave the
  // selection's surrounding markup intact.
  const enclosing = findEnclosingTag(val, s, e, /<size=\d+>/, /<\/size>/);
  if (enclosing) {
    const newOpen = '<size=' + sz + '>';
    const oldOpenLen = enclosing.openEnd - enclosing.openStart;
    ta.value = val.substring(0, enclosing.openStart) + newOpen + val.substring(enclosing.openEnd);
    const shift = newOpen.length - oldOpenLen;
    ta.selectionStart = s + shift;
    ta.selectionEnd   = e + shift;
    ta.focus(); ceSync(); return;
  }

  // Case 3: ordinary wrap — strip any nested size tags from the selection
  // first so we don't pile up <size=A><size=B>x</size></size>.
  sel = sel.replace(/<\/?size(=\d+)?>/g, '');
  const wrapped = '<size=' + sz + '>' + sel + '</size>';
  ta.value = val.substring(0, s) + wrapped + val.substring(e);
  ta.selectionStart = s;
  ta.selectionEnd = s + wrapped.length;
  ta.focus(); ceSync();
}

// Same tag-swap logic as ceWrapSize but for <color=#hex>...</color>.
function ceWrapColor() {
  const ta = document.getElementById('ceTextarea');
  const col = document.getElementById('ceColor').value;
  const { s, e } = ceGetSel(ta);
  if (s === e) return;
  const val = ta.value;
  let sel = val.substring(s, e);

  // Case 1: selection IS a complete <color=#xxx>...</color> — swap the colour
  const full = sel.match(/^<color=#[0-9a-fA-F]{3,8}>([\s\S]*)<\/color>$/);
  if (full) {
    const wrapped = '<color=' + col + '>' + full[1] + '</color>';
    ta.value = val.substring(0, s) + wrapped + val.substring(e);
    ta.selectionStart = s;
    ta.selectionEnd = s + wrapped.length;
    ta.focus(); ceSync(); return;
  }

  // Case 2: some <color=#…>…</color> wraps the selection — swap its hex
  // (works even through intervening size/b/i tags)
  const enclosing = findEnclosingTag(val, s, e, /<color=#[0-9a-fA-F]{3,8}>/, /<\/color>/);
  if (enclosing) {
    const newOpen = '<color=' + col + '>';
    const oldOpenLen = enclosing.openEnd - enclosing.openStart;
    ta.value = val.substring(0, enclosing.openStart) + newOpen + val.substring(enclosing.openEnd);
    const shift = newOpen.length - oldOpenLen;
    ta.selectionStart = s + shift;
    ta.selectionEnd   = e + shift;
    ta.focus(); ceSync(); return;
  }

  // Case 3: strip nested colour tags, then wrap
  sel = sel.replace(/<\/?color(=#[0-9a-fA-F]{3,8})?>/g, '');
  const wrapped = '<color=' + col + '>' + sel + '</color>';
  ta.value = val.substring(0, s) + wrapped + val.substring(e);
  ta.selectionStart = s;
  ta.selectionEnd = s + wrapped.length;
  ta.focus(); ceSync();
}

// Last non-empty textarea selection — restored when the focus has drifted
// to the color picker or an Apply button (some browsers collapse the
// textarea selection at that point, making s === e and the early-return
// trap fire).
let _ceLastSel = { s: 0, e: 0 };
function ceRememberSel(){
  const ta = document.getElementById('ceTextarea');
  if (!ta) return;
  if (ta.selectionStart !== ta.selectionEnd) {
    _ceLastSel = { s: ta.selectionStart, e: ta.selectionEnd };
  }
}
function ceGetSel(ta){
  let s = ta.selectionStart, e = ta.selectionEnd;
  if (s === e && _ceLastSel.e > _ceLastSel.s) {
    s = _ceLastSel.s; e = _ceLastSel.e;
    try { ta.setSelectionRange(s, e); } catch(_) {}
  }
  return { s, e };
}

// Build a gradient over an array of segments (letters / words / lines /
// paragraphs). If middleOnly=true, the first and last segments stay
// pinned to c1/c2 respectively and only the segments in between fade
// across — matches the 3dxchat profile editor's "Gradient only middle
// part" checkbox.
function _buildGradientSegments(segments, c1, c2, middleOnly){
  const r1 = hexToRgb(c1), r2 = hexToRgb(c2);
  const n = segments.length;
  if (n === 0) return [];
  if (n === 1) return [{ hex: c1, txt: segments[0] }];

  return segments.map((txt, i) => {
    let f;
    if (middleOnly) {
      // first stays c1, last stays c2, middle is linearly interpolated
      if (i === 0) f = 0;
      else if (i === n - 1) f = 1;
      else if (n <= 2) f = i / (n - 1);
      else f = (i - 1) / (n - 1 - 1 || 1);   // (n-2) middle slots, indices 1..n-2
    } else {
      f = i / (n - 1);
    }
    const hex = rgbToHex(r1.r + (r2.r - r1.r) * f, r1.g + (r2.g - r1.g) * f, r1.b + (r2.b - r1.b) * f);
    return { hex, txt };
  });
}

function ceWrapGradient() {
  const ta = document.getElementById('ceTextarea');
  const c1 = document.getElementById('ceGrad1').value;
  const c2 = document.getElementById('ceGrad2').value;
  const modeEl = document.getElementById('ceGradMode');
  const mode = modeEl ? modeEl.value : 'word';
  const middleOnly = !!document.getElementById('ceGradMid')?.checked;
  const { s, e } = ceGetSel(ta);
  if (s === e) return;

  // Pull selection. Strip any existing <color=…>…</color> tags inside it
  // so we don't nest a gradient inside an outer color (the outer one
  // wins in Unity, which is what made gradients silently 'not work').
  let sel = ta.value.substring(s, e).replace(/<\/?color(=#[0-9a-fA-F]{3,8})?>/g, '');

  // If an enclosing <color=…>…</color> wraps the selection (through
  // intervening tags), strip it too — same reason.
  const val0 = ta.value;
  const enclosingColor = findEnclosingTag(val0, s, e, /<color=#[0-9a-fA-F]{3,8}>/, /<\/color>/);
  let baseVal = val0;
  let baseS = s, baseE = e;
  if (enclosingColor) {
    const openLen = enclosingColor.openEnd - enclosingColor.openStart;
    baseVal = val0.substring(0, enclosingColor.openStart)
            + val0.substring(enclosingColor.openEnd, enclosingColor.closeStart)
            + val0.substring(enclosingColor.closeEnd);
    baseS = s - openLen;
    baseE = e - openLen;
  }

  // ── split into segments per mode ───────────────────────────────────
  // For each split we keep the SEPARATOR string so it can be re-inserted
  // verbatim between the colored segments (preserves spacing/newlines).
  let segments;     // strings to color
  let separators;   // joined back between segments
  if (mode === 'letter') {
    // Use Array.from to handle surrogate pairs correctly (e.g. emoji).
    segments = Array.from(sel);
    separators = segments.map(() => '');
    separators.pop();
  } else if (mode === 'line') {
    segments = sel.split('\n');
    separators = segments.map(() => '\n'); separators.pop();
  } else if (mode === 'paragraph') {
    // Paragraphs are separated by one or more blank lines.
    segments = sel.split(/\n\s*\n/);
    separators = segments.map((_, i) => i < segments.length - 1 ? '\n\n' : ''); separators.pop();
  } else {
    // word (default)
    // Preserve runs of whitespace between words.
    const parts = sel.split(/(\s+)/);
    segments = [];
    separators = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) { if (parts[i].length) segments.push(parts[i]); else if (i + 1 < parts.length) separators.push(parts[i+1]); }
      else { if (segments.length) separators.push(parts[i]); }
    }
  }
  segments = segments.filter(seg => seg.length > 0);
  if (!segments.length) return;

  // If the chosen mode doesn't yield ≥2 segments (e.g. "Per word" on a
  // single word, "Per line" on a one-line selection), silently fall
  // back to per-letter so the user always gets a visible gradient
  // instead of a single-colour wrap.
  if (segments.length < 2 && mode !== 'letter') {
    segments = Array.from(sel);
    separators = segments.map(() => '');
    separators.pop();
    segments = segments.filter(seg => seg.length > 0);
  }

  const colored = _buildGradientSegments(segments, c1, c2, middleOnly);

  let wrapped = '';
  for (let i = 0; i < colored.length; i++) {
    wrapped += '<color=' + colored[i].hex + '>' + colored[i].txt + '</color>';
    if (i < colored.length - 1) wrapped += (separators[i] || '');
  }

  ta.value = baseVal.substring(0, baseS) + wrapped + baseVal.substring(baseE);
  ta.selectionStart = baseS;
  ta.selectionEnd = baseS + wrapped.length;
  _ceLastSel = { s: baseS, e: baseS + wrapped.length };
  ta.focus();
  ceSync();
}

function ceSync() {
  const code = document.getElementById('ceTextarea').value;
  document.getElementById('outputBox').textContent = code;
  // update counters
  const chars = code.length, bytes = byteLen(code);
  const cc = document.getElementById('charCount'), bc = document.getElementById('byteCount');
  cc.textContent = chars; bc.textContent = bytes;
  cc.className = 'cv ' + (chars > 240 ? 'over-v' : chars > 210 ? 'warn-v' : 'ok');
  bc.className = 'cv ' + (bytes > 255 ? 'over-v' : bytes > 230 ? 'warn-v' : 'ok');
  const bar = document.getElementById('counterBar');
  bar.className = 'tb-counter ' + (chars > 240 || bytes > 255 ? 'over' : chars > 210 || bytes > 230 ? 'warn' : '');
  // render live preview
  ceRenderPreview(code);
  // optimization tips for custom mode
  ceUpdateTips(chars, bytes, code);
  // save state
  if (typeof _saveDebounced === 'function') _saveDebounced();
}

function ceUpdateTips(chars, bytes, code) {
  const panel = document.getElementById('optimizeTips');
  const header = document.getElementById('optHeader');
  const list = document.getElementById('optList');
  if (chars < 185) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  panel.className = 'opt-panel ' + (chars > 240 ? 'over-state' : chars > 210 ? 'warn-state' : '');
  const tips = [];

  // count tag overhead
  const tagMatches = code.match(/<\/?(?:color(?:=[^>]*)?|size(?:=[^>]*)?|b|i)>/gi);
  const tagChars = tagMatches ? tagMatches.join('').length : 0;
  const textChars = chars - tagChars;
  if (tagChars > 0) {
    tips.push({lvl:'info', msg: 'Tags use <b>' + tagChars + '</b> chars — text uses <b>' + textChars + '</b> chars'});
  }

  // count gradient color tags
  const colorTags = code.match(/<color=[^>]*>/gi);
  if (colorTags && colorTags.length > 3) {
    tips.push({lvl:'warn', msg: colorTags.length + ' color tags — gradients use lots of chars'});
  }

  // count lines
  const lines = code.split('\n').filter(l => l.trim());
  if (lines.length > 4 && chars > 210) {
    tips.push({lvl:'tip', msg: 'Try fewer lines to save space (' + lines.length + ' lines)'});
  }

  // over limit
  if (chars > 240) tips.push({lvl:'warn', msg: '<b>' + (chars - 240) + '</b> chars over the 240 limit!'});
  if (bytes > 255) tips.push({lvl:'warn', msg: '<b>' + (bytes - 255) + '</b> bytes over the 255 limit!'});

  // header
  const headerIcon = chars > 240 ? icon('ban') : chars > 210 ? icon('warning') : icon('lightbulb');
  header.innerHTML = '<span class="opt-header-icon">' + headerIcon + '</span><span>' + (chars > 240 ? t('opt_over') : chars > 210 ? t('opt_warn') : t('opt_info')) + '</span>';
  header.style.color = chars > 240 ? 'var(--red)' : chars > 210 ? 'var(--orange)' : 'var(--subtle)';

  // render tips
  list.innerHTML = '';
  tips.forEach(tip => {
    const item = document.createElement('div');
    item.className = 'opt-item';
    const ic = tip.lvl === 'warn' ? icon('warning') : tip.lvl === 'info' ? icon('arrow-right') : '<span style="display:inline-block;width:.6em;text-align:center">·</span>';
    const col = tip.lvl === 'warn' ? 'var(--orange)' : tip.lvl === 'info' ? 'var(--purple)' : 'var(--muted)';
    item.style.color = col;
    item.innerHTML = '<span class="opt-icon">' + ic + '</span><span>' + tip.msg + '</span>';
    list.appendChild(item);
  });
  if (typeof hydrateIcons === 'function') { hydrateIcons(header); hydrateIcons(list); }
}

function ceEsc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function ceRenderPreview(code) {
  const pv = document.getElementById('cePreviewContent');
  if (!pv) return;
  const lines = code.split('\n');
  pv.innerHTML = lines.map(line => {
    if (!line.trim()) return '<div class="ce-line">&nbsp;</div>';
    let html = ceEsc(line);
    // <size=N>…</size> → scaled span
    html = html.replace(/&lt;size=(\d+)&gt;([\s\S]*?)&lt;\/size&gt;/gi, (_, sz, inner) => {
      const rem = Math.max(0.5, parseInt(sz) / 14);
      return '<span style="font-size:' + rem + 'rem">' + inner + '</span>';
    });
    // <color=#HEX>…</color> → colored span
    html = html.replace(/&lt;color=(#[0-9a-fA-F]{3,8})&gt;([\s\S]*?)&lt;\/color&gt;/gi, (_, col, inner) => {
      return '<span style="color:' + col + '">' + inner + '</span>';
    });
    // <b>…</b>
    html = html.replace(/&lt;b&gt;([\s\S]*?)&lt;\/b&gt;/gi, (_, inner) => '<b>' + inner + '</b>');
    // <i>…</i>
    html = html.replace(/&lt;i&gt;([\s\S]*?)&lt;\/i&gt;/gi, (_, inner) => '<i>' + inner + '</i>');
    return '<div class="ce-line">' + html + '</div>';
  }).join('');
}

function colorTag(text,field){const g=grads[field];if(g?.rainbow)return rainbowText(text);if(g?.on)return gradientText(text,g.c1,g.c2);if(noColor[field])return text;return`<color=${colors[field]}>${text}</color>`;}

// ── fonts ──
const FM={'a':'α','b':'в','c':'¢','d':'∂','e':'є','f':'f','g':'g','h':'н','i':'ι','j':'נ','k':'к','l':'ℓ','m':'м','n':'η','o':'σ','p':'ρ','q':'q','r':'я','s':'ѕ','t':'т','u':'υ','v':'ν','w':'ω','x':'χ','y':'у','z':'z'};
const SM={'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
const TM={'a':'ล','b':'в','c':'¢','d':'∂','e':'э','f':'ƒ','g':'φ','h':'ђ','i':'เ','j':'נ','k':'к','l':'ℓ','m':'м','n':'и','o':'๏','p':'ק','q':'ợ','r':'я','s':'ร','t':'†','u':'µ','v':'√','w':'ω','x':'җ','y':'ý','z':'ž'};
function applyFont(text,style){if(style==='fancy')return text.split('').map(c=>FM[c.toLowerCase()]||c).join('');if(style==='smallcaps')return text.split('').map(c=>SM[c.toLowerCase()]||c).join('');if(style==='thai')return text.split('').map(c=>TM[c.toLowerCase()]||c).join('');return text;}
function setFontStyle(field,style){
  pushUndo();
  fieldFonts[field]=style;
  if(field==='mainText') currentFontStyle=style;
  // remove active from all 3 variants for this field
  ['normal','fancy','smallcaps','thai'].forEach(function(s){
    var el=document.getElementById('font_'+field+'_'+s);
    if(el) el.classList.remove('on');
  });
  // add active to selected
  var active=document.getElementById('font_'+field+'_'+style);
  if(active) active.classList.add('on');
  generate();
}

// ── field helpers ──
function insertIntoField(id,sym){const el=document.getElementById(id);const s=el.selectionStart,e=el.selectionEnd;el.value=el.value.slice(0,s)+sym+el.value.slice(e);el.selectionStart=el.selectionEnd=s+sym.length;el.focus();generate();}
function copySymbol(sym){
  navigator.clipboard?.writeText(sym).catch(()=>{});
  // show toast
  let toast = document.getElementById('copyToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copyToast';
    toast.className = 'copy-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = icon('check') + ' <span>Copied: <b>' + sym + '</b></span>';
  if (typeof hydrateIcons === 'function') hydrateIcons(toast);
  toast.classList.remove('show');
  void toast.offsetWidth; // force reflow
  toast.classList.add('show');
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => toast.classList.remove('show'), 1800);
}
function setField(id,val){pushUndo();userHasEdited=true;document.getElementById(id).value=val;generate();}
// Empty a single field (used by the "Without" buttons on the deco rows).
function setFieldEmpty(id){ setField(id, ''); }
let lastWasThemed = false;
const DEFAULT_COLORS = { mainText:'#ff71b8', topText:'#8f8f8f', bottomText:'#8f8f8f' };
function resetThemeColors(){
  grads.mainText = { on:false, rainbow:false, c1:'#ff71b8', c2:'#b388ff' };
  colors.mainText = DEFAULT_COLORS.mainText;
  colors.topText = DEFAULT_COLORS.topText;
  colors.bottomText = DEFAULT_COLORS.bottomText;
  document.getElementById('btn_mainText').style.background = DEFAULT_COLORS.mainText;
  document.getElementById('btn_topText').style.background = DEFAULT_COLORS.topText;
  document.getElementById('btn_bottomText').style.background = DEFAULT_COLORS.bottomText;
}
// ── per-theme deco/kaomoji presets ──
// Each themed setter passes its own deco-set to setSpruch so the supporting
// lines actually MATCH the theme instead of inheriting the romantic
// "ily" + pink-heart kaomoji defaults. Sizes stay small enough to leave
// room for the actual message text inside the 240/255 budget.
const DECO_BDAY        = { dekoTop:'· ✦ ✦ ✦ ·', kaomoji:'\\(°◡°)/',  dekoBottom:'.. ✦ · ✦ ..' };
const DECO_XMAS        = { dekoTop:'· ❄ ✦ ❄ ·', kaomoji:'(◕‿◕)❄',     dekoBottom:'.. ❄ · ❄ ..' };
const DECO_HALLOWEEN   = { dekoTop:'· ✦ ◯ ✦ ·', kaomoji:'(◕ω◕)',      dekoBottom:'.. ◯ ✦ ◯ ..' };
const DECO_EASTER      = { dekoTop:'· ✿ ✦ ✿ ·', kaomoji:'(◕ω◕)♡',     dekoBottom:'.. ✿ · ✿ ..' };
const DECO_VALENTINE   = { dekoTop:'· ♡ ✦ ♡ ·', kaomoji:'(˘◡˘)♡',     dekoBottom:'.. ♡ · ♡ ..' };
const DECO_WOMANS      = { dekoTop:'· ✿ ♥ ✿ ·', kaomoji:'(◕‿◕)♥',     dekoBottom:'.. ✿ · ✿ ..' };
const DECO_JULY4       = { dekoTop:'· ★ ✦ ★ ·', kaomoji:'(★‿★)',      dekoBottom:'.. ★ · ★ ..' };
const DECO_HANUKKAH    = { dekoTop:'· ✦ ✡ ✦ ·', kaomoji:'(◕‿◕)',      dekoBottom:'.. ✡ · ✡ ..' };
const DECO_STPAT       = { dekoTop:'· ☘ ✦ ☘ ·', kaomoji:'(◕‿◕)☘',     dekoBottom:'.. ☘ · ☘ ..' };
const DECO_NEWYEAR     = { dekoTop:'· ★ ✦ ★ ·', kaomoji:'\\(°◡°)/',   dekoBottom:'.. ★ · ★ ..' };
const DECO_WEDDING     = { dekoTop:'· ❀ ✦ ❀ ·', kaomoji:'(◡‿◡)♡',     dekoBottom:'.. ❀ · ❀ ..' };
const DECO_SUB         = { dekoTop:'· ♡ ✦ ♡ ·', kaomoji:'(◡ω◡)♡',     dekoBottom:'.. ♡ · ♡ ..' };
const DECO_AFTERCARE   = { dekoTop:'· ✦ ♡ ✦ ·', kaomoji:'(´◡`)♡',     dekoBottom:'.. ♡ ✦ ♡ ..' };
const DECO_GOTH        = { dekoTop:'· ☾ ✦ ☾ ·', kaomoji:'(◉ω◉)',      dekoBottom:'.. ☾ · ☾ ..' };
const DECO_DRUNK       = { dekoTop:'· ✦ ✿ ✦ ·', kaomoji:'(￣▽￣)~*',    dekoBottom:'.. ✿ · ✿ ..' };
const DECO_SOFT        = { dekoTop:'· ✿ ✦ ✿ ·', kaomoji:'(◡‿◡)',      dekoBottom:'.. ✿ · ✿ ..' };
const DECO_THANKSGIV   = { dekoTop:'· ✦ ♥ ✦ ·', kaomoji:'(◕‿◕)♥',     dekoBottom:'.. ♥ · ♥ ..' };
const DECO_ANNIV       = { dekoTop:'· ♡ ∞ ♡ ·', kaomoji:'(◕‿◕)♡',     dekoBottom:'.. ♡ · ♡ ..' };
const DECO_PRIDE       = { dekoTop:'· ✦ ❤ ✦ ·', kaomoji:'(✿◕‿◕)',     dekoBottom:'.. ✦ ❤ ✦ ..' };

// Auto-trim default decoration lines + kaomoji whenever applying a template
// would overflow 240 chars / 255 bytes. We strip in this order:
//   kaomoji → dekoBottom → dekoTop
// (most decorative → most structural) and stop the moment we fit.
function _isCodeOverLimit(){
  const el = document.getElementById('outputBox');
  if (!el) return false;
  const code = el.textContent || '';
  return code.length > 240 || byteLen(code) > 255;
}
function trimDecoToFit(){
  const ids = ['kaomoji','dekoBottom','dekoTop'];
  const cleared = [];
  for (const id of ids) {
    if (!_isCodeOverLimit()) break;
    const el = document.getElementById(id);
    if (!el || !el.value) continue;
    el.value = '';
    cleared.push(id);
    generate();
  }
  // Inform the user that decos were stripped — otherwise it looks like
  // a bug when a template appears without its kaomoji/deco lines.
  if (cleared.length && typeof showToast === 'function') {
    const names = cleared.map(id => t('fl_'+id, id)).join(', ');
    showToast('<i class="fa-icon" data-icon="warning"></i> <span>'+t('decos_trimmed',names)+'</span>');
  }
}

// Apply a deco/kaomoji preset to the form fields. Called by every template
// setter so each click starts from a coherent, theme-matching base instead
// of inheriting whatever was left over from the previous template.
function applyDecos(decos){
  const d = decos || ((typeof layoutDefaults !== 'undefined') && layoutDefaults[currentLayout]) || {};
  ['dekoTop','dekoBottom','kaomoji'].forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = d[f] || '';
  });
}

function setSpruch(main,top,bottom,decos){
  pushUndo(); userHasEdited=true;
  // if previous click was a themed template, revert to defaults so colors don't bleed across
  if (lastWasThemed) { resetThemeColors(); lastWasThemed = false; }
  if (grads.mainText) grads.mainText.rainbow=false;
  applyDecos(decos);                       // theme-aware decos, layout defaults if none given
  document.getElementById('mainText').value=main;
  document.getElementById('topText').value=top;
  document.getElementById('bottomText').value=bottom;
  generate();
  trimDecoToFit();
}
// Unified preset applier — replaces the near-duplicate setBday / applyTheme
// / setPride blocks. One source of truth for the "click a themed template"
// behaviour.
//
//   main/top/bottom : line texts
//   decos           : { dekoTop, dekoBottom, kaomoji } preset
//   topColor        : flat colour for the top line     (required)
//   botColor        : flat colour for the bottom line  (required)
//   mainColor       : flat colour for the main line    (when no gradient)
//   mainGrad        : { c1, c2, rainbow? } when main should use a gradient
//   mainBtnBg       : CSS background for the main color button (defaults
//                     to a flat `mainColor` or a `c1→c2` gradient string)
//   resetFonts      : true → revert topText/mainText/bottomText fonts to 'normal'
function applyPreset({main, top, bottom, decos, mainColor, topColor, botColor, mainGrad, mainBtnBg, resetFonts}){
  setSpruch(main, top, bottom, decos);

  if (mainGrad) {
    grads.mainText = { on: true, c1: mainGrad.c1, c2: mainGrad.c2, rainbow: !!mainGrad.rainbow };
  } else if (mainColor) {
    grads.mainText = { on: false, c1: mainColor, c2: mainColor };
    colors.mainText = mainColor;
  }
  if (topColor) colors.topText = topColor;
  if (botColor) colors.bottomText = botColor;
  if (resetFonts) ['topText','mainText','bottomText'].forEach(f => { fieldFonts[f] = 'normal'; });

  const btnMain = mainBtnBg
    || (mainGrad ? `linear-gradient(to right,${mainGrad.c1},${mainGrad.c2})` : mainColor);
  if (btnMain)  document.getElementById('btn_mainText').style.background = btnMain;
  if (topColor) document.getElementById('btn_topText').style.background = topColor;
  if (botColor) document.getElementById('btn_bottomText').style.background = botColor;

  lastWasThemed = true;
  generate();
  trimDecoToFit();
}

function setBday(main, top, bottom){
  applyPreset({
    main, top, bottom, decos: DECO_BDAY,
    mainGrad: { c1:'#FFD700', c2:'#FF8C00' },
    topColor: '#FFD700', botColor: '#FFB300',
  });
}
function applyTheme(main, top, bottom, cMain, cTop, cBot, decos){
  applyPreset({
    main, top, bottom, decos,
    mainColor: cMain, topColor: cTop, botColor: cBot,
  });
}
function setXmas(main,top,bottom){         applyTheme(main,top,bottom,'#ef4444','#16a34a','#f59e0b', DECO_XMAS); }
function setHalloween(main,top,bottom){    applyTheme(main,top,bottom,'#fb923c','#a855f7','#7c3aed', DECO_HALLOWEEN); }
function setEaster(main,top,bottom){       applyTheme(main,top,bottom,'#f9a8d4','#fde047','#86efac', DECO_EASTER); }
function setValentine(main,top,bottom){    applyTheme(main,top,bottom,'#ff4d6d','#ff8fb3','#fbcfe8', DECO_VALENTINE); }
function setWomansDay(main,top,bottom){    applyTheme(main,top,bottom,'#c084fc','#ec4899','#d8b4fe', DECO_WOMANS); }
function setJuly4(main,top,bottom){        applyTheme(main,top,bottom,'#ef4444','#1e40af','#3b82f6', DECO_JULY4); }
function setHanukkah(main,top,bottom){     applyTheme(main,top,bottom,'#3b82f6','#e2e8f0','#93c5fd', DECO_HANUKKAH); }
function setStPatricks(main,top,bottom){   applyTheme(main,top,bottom,'#16a34a','#f59e0b','#4ade80', DECO_STPAT); }
function setNewYear(main,top,bottom){      applyTheme(main,top,bottom,'#fbbf24','#cbd5e1','#fde047', DECO_NEWYEAR); }
function setWedding(main,top,bottom){      applyTheme(main,top,bottom,'#d4af37','#e8b4b8','#f5e6d3', DECO_WEDDING); }
function setSub(main,top,bottom){          applyTheme(main,top,bottom,'#ec4899','#6b21a8','#831843', DECO_SUB); }
function setAftercare(main,top,bottom){    applyTheme(main,top,bottom,'#fcd34d','#fbcfe8','#ddd6fe', DECO_AFTERCARE); }
function setGoth(main,top,bottom){         applyTheme(main,top,bottom,'#a855f7','#6b7280','#831843', DECO_GOTH); }
function setDrunk(main,top,bottom){        applyTheme(main,top,bottom,'#f59e0b','#be185d','#fbbf24', DECO_DRUNK); }
function setSoft(main,top,bottom){         applyTheme(main,top,bottom,'#86efac','#fbcfe8','#fde68a', DECO_SOFT); }
function setThanksgiving(main,top,bottom){ applyTheme(main,top,bottom,'#d97706','#92400e','#fbbf24', DECO_THANKSGIV); }
function setAnniv(main,top,bottom){        applyTheme(main,top,bottom,'#e8b4b8','#d4af37','#f9d5e5', DECO_ANNIV); }
function setPride(main, top, bottom){
  applyPreset({
    main, top, bottom, decos: DECO_PRIDE,
    mainGrad: { c1:'#ffadad', c2:'#bdb2ff', rainbow:true },
    topColor: '#f9a8d4', botColor: '#a0c4ff',
    // 6-stop pastel rainbow swatch for the main-color button
    mainBtnBg: 'linear-gradient(to right,#ffadad,#ffd6a5,#fdffb6,#caffbf,#a0c4ff,#bdb2ff)',
    resetFonts: true,  // fancy fonts + rainbow blow the byte budget
  });
}
function setKaoMode(on){
  pushUndo();
  document.getElementById('kaoSection').style.display=on?'':'none';
  document.getElementById('kao_on').classList.toggle('on',on);
  document.getElementById('kao_off').classList.toggle('on',!on);
  if(!on) document.getElementById('kaomoji').value='';
  generate();
}
let _pvActive=null;
function pvClick(id){
  const el=document.getElementById(id); if(!el) return;
  // find the sec-body that contains this field
  let secBody=null,p=el.parentElement;
  while(p){if(p.classList.contains('sec-body')){secBody=p;break;}p=p.parentElement;}
  // second click on same field while its section is open → close it
  if(_pvActive===id && secBody && secBody.classList.contains('open')){
    if(document.activeElement===el) el.blur();
    secBody.classList.remove('open');
    const h=secBody.previousElementSibling;
    if(h && h.classList.contains('sec-head')) h.classList.remove('open');
    _pvActive=null;
    return;
  }
  // first click (or different field) → open & focus
  _pvActive=id;
  focusField(id);
}
function focusField(id){
  const el=document.getElementById(id); if(!el) return;
  // open the parent sec-body if it's collapsed
  var parent=el.parentElement;
  while(parent){
    if(parent.classList.contains('sec-body')){
      if(!parent.classList.contains('open')){
        parent.classList.add('open');
        var head=parent.previousElementSibling;
        if(head && head.classList.contains('sec-head')) head.classList.add('open');
      }
      break;
    }
    parent=parent.parentElement;
  }
  setTimeout(function(){
    el.scrollIntoView({behavior:'smooth',block:'center'});
    el.focus(); el.select();
    el.style.borderColor='var(--pink)';
    setTimeout(function(){el.style.borderColor='';},1200);
  },50);
}
function resetAll(){
  // wrap each step in its own try so one failure doesn't kill the rest
  const safe = (label, fn) => { try { fn(); } catch(e) { console.warn('[resetAll]', label, 'failed:', e); } };

  safe('pushUndo', () => pushUndo());
  safe('userHasEdited flag', () => { userHasEdited = false; });

  // text fields → layout defaults
  safe('text fields', () => {
    const resetLayout = (currentLayout === 'custom') ? 'center' : currentLayout;
    const d = layoutDefaults[resetLayout];
    ['dekoTop','topText','mainText','bottomText','kaomoji','dekoBottom'].forEach(f => {
      const el = document.getElementById(f); if (el) el.value = d ? (d[f] || '') : '';
    });
  });

  // size fields
  safe('size fields', () => {
    const sizes = {fontSize:60, sizeDekoTop:12, sizeTopText:14, sizeBottomText:14, sizeKaomoji:16, sizeDekoBottom:12};
    Object.entries(sizes).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val; });
  });

  // bold/italic checkboxes
  safe('bold/italic', () => {
    ['mainBold','mainItalic','topBold','topItalic','bottomBold','bottomItalic'].forEach(id => {
      const el = document.getElementById(id); if (el) el.checked = false;
    });
  });

  // fonts
  safe('fonts', () => {
    currentFontStyle = 'normal';
    Object.keys(fieldFonts).forEach(f => fieldFonts[f] = 'normal');
    document.querySelectorAll('[id^="font_"]').forEach(el => el.classList.remove('on'));
    ['dekoTop','topText','mainText','bottomText','dekoBottom'].forEach(f => {
      const el = document.getElementById('font_' + f + '_normal'); if (el) el.classList.add('on');
    });
  });

  // colors + gradients
  safe('colors', () => {
    Object.assign(colors, {dekoTop:'#555555',topText:'#8f8f8f',mainText:'#ff71b8',bottomText:'#8f8f8f',kaomoji:'#ffd84d',dekoBottom:'#5c5c7a'});
    Object.keys(noColor).forEach(f => noColor[f] = false);
    Object.keys(grads).forEach(f => { grads[f].on = false; grads[f].rainbow = false; grads[f].c1 = '#ff71b8'; grads[f].c2 = '#b388ff'; });
    ['dekoTop','topText','mainText','bottomText','kaomoji','dekoBottom'].forEach(f => {
      const btn = document.getElementById('btn_' + f); if (btn) btn.style.background = colors[f];
    });
  });

  // theme tracking + pyramid stars
  safe('theme/pyramid flags', () => {
    if (typeof lastWasThemed !== 'undefined') lastWasThemed = false;
    if (typeof pyramidStars !== 'undefined') {
      Object.keys(pyramidStars).forEach(f => { pyramidStars[f] = false; });
      ['dekoTopStars','topStars','bottomStars'].forEach(id => {
        const el = document.getElementById(id); if (el) el.checked = false;
      });
    }
  });

  // kaomoji mode
  safe('kaomoji mode', () => {
    const ks = document.getElementById('kaoSection'); if (ks) ks.style.display = '';
    const on = document.getElementById('kao_on'); if (on) on.classList.add('on');
    const off = document.getElementById('kao_off'); if (off) off.classList.remove('on');
  });

  // line order
  safe('line order', () => { lineOrder = DEFAULT_ORDER.slice(); });

  // custom editor cleanup
  safe('custom editor', () => {
    const ceTa = document.getElementById('ceTextarea'); if (ceTa) ceTa.value = '';
    const cePv = document.getElementById('cePreviewContent'); if (cePv) cePv.innerHTML = '';
  });

  // saved state
  safe('localStorage', () => { localStorage.removeItem('giftState'); });

  // exit custom layout
  safe('exit custom layout', () => {
    if (currentLayout === 'custom') {
      currentLayout = 'center';
      document.querySelectorAll('[id^="lay_"]').forEach(el => el.classList.remove('on'));
      const lc = document.getElementById('lay_center'); if (lc) lc.classList.add('on');
      const ce = document.getElementById('customEditor'); if (ce) ce.style.display = 'none';
      const ob = document.getElementById('outputBox'); if (ob) ob.style.display = '';
      ['.pv-popup','.code-label','.pv-label'].forEach(sel => { const el = document.querySelector(sel); if (el) el.style.display = ''; });
    }
  });

  // re-render
  safe('generate', () => generate());

  // If the user had picked a template earlier this session, snap back to
  // THAT state instead of the bare factory defaults — matches the mental
  // model "Reset = undo my changes since the template was chosen".
  // Suppress the template setter's own pushUndo so the undo stack stays
  // [pre-reset-state] → [post-reset-state], without an intermediate
  // factory-state entry.
  safe('re-apply last template', () => {
    if (!lastTemplate) return;
    const fn = window[lastTemplate.fnName];
    if (typeof fn !== 'function') return;
    _suppressPushUndo = true;
    try { fn(lastTemplate.main, lastTemplate.top, lastTemplate.bottom); }
    finally { _suppressPushUndo = false; }
  });
}

// ── line order (reorderable in preview) ──
const DEFAULT_ORDER=['dekoTop','topText','mainText','bottomText','kaomoji','dekoBottom'];
let lineOrder=DEFAULT_ORDER.slice();
const STACK_LAYOUTS=['center','framed','minimal'];
function moveLine(field,dir){
  const i=lineOrder.indexOf(field); if(i<0) return;
  const j=i+dir; if(j<0||j>=lineOrder.length) return;
  [lineOrder[i],lineOrder[j]]=[lineOrder[j],lineOrder[i]];
  generate();
}

// ── main generate ──
function generate(){
  // skip auto-generate in custom mode
  if (currentLayout === 'custom') return;
  const v=f=>document.getElementById(f).value;
  const dekoTop=v('dekoTop'),topText=v('topText'),main=v('mainText'),bottom=v('bottomText'),kaomoji=v('kaomoji'),dekoBottom=v('dekoBottom');
  const size=v('fontSize');
  const sd=parseInt(v('sizeDekoTop')),st=parseInt(v('sizeTopText')),sb=parseInt(v('sizeBottomText')),sk=parseInt(v('sizeKaomoji')),sdb=parseInt(v('sizeDekoBottom'));
  const sz=(text,s,def)=>s!==def?`<size=${s}>${text}</size>`:text;

  const wrapBI=(s,b,i)=>{if(b)s=`<b>${s}</b>`;if(i)s=`<i>${s}</i>`;return s;};
  const topB=document.getElementById('topBold')?.checked, topI=document.getElementById('topItalic')?.checked;
  const botB=document.getElementById('bottomBold')?.checked, botI=document.getElementById('bottomItalic')?.checked;
  const lm={
    dekoTop:    dekoTop    ? sz(colorTag(applyFont(dekoTop,   fieldFonts.dekoTop),   'dekoTop'),   sd,  12) : null,
    topText:    topText    ? sz(wrapBI(colorTag(applyFont(topText,fieldFonts.topText),'topText'),topB,topI),   st,  14) : null,
    mainText:   main       ? (()=>{let m=colorTag(applyFont(main,fieldFonts.mainText),'mainText');if(document.getElementById('mainBold').checked)m=`<b>${m}</b>`;if(document.getElementById('mainItalic').checked)m=`<i>${m}</i>`;return`<size=${size}>${m}</size>`;})() : null,
    bottomText: bottom     ? sz(wrapBI(colorTag(applyFont(bottom,fieldFonts.bottomText),'bottomText'),botB,botI), sb,  14) : null,
    kaomoji:    kaomoji    ? sz(colorTag(applyFont(kaomoji,   fieldFonts.kaomoji),   'kaomoji'),   sk,  16) : null,
    dekoBottom: dekoBottom ? sz(colorTag(applyFont(dekoBottom,fieldFonts.dekoBottom),'dekoBottom'),sdb, 12) : null,
  };

  const code=applyLayout(lm);
  document.getElementById('outputBox').textContent=code;

  const chars=code.length, bytes=byteLen(code);
  const cc=document.getElementById('charCount'),bc=document.getElementById('byteCount');
  cc.textContent=chars; bc.textContent=bytes;
  cc.className='cv '+(chars>240?'over-v':chars>210?'warn-v':'ok');
  bc.className='cv '+(bytes>255?'over-v':bytes>230?'warn-v':'ok');
  const bar=document.getElementById('counterBar');
  bar.className='tb-counter '+(chars>240||bytes>255?'over':chars>210||bytes>230?'warn':'');

  // Per-field byte breakdown shown on hover — lets the user see which
  // field is eating the budget instead of guessing.
  const breakdown = Object.entries(lm)
    .filter(([,v]) => v)
    .map(([f,v]) => [f, byteLen(v)])
    .sort((a,b) => b[1]-a[1])
    .map(([f,b]) => `${t('fl_'+f, f)}: ${b} B`)
    .join('\n');
  bar.title = `${t('char_limit_tt')}\n\n${t('byte_breakdown')}:\n${breakdown}`;

  // sync copy button — disabled look when over limit, plus label swap
  const copyBtn = document.querySelector('.btn-copy');
  if (copyBtn) {
    const overLimit = chars > 240 || bytes > 255;
    copyBtn.classList.toggle('over-limit', overLimit);
    const lbl = copyBtn.querySelector('span[data-i18n]');
    if (lbl) lbl.textContent = overLimit ? t('copy_blocked') : t('copy_code');
  }

  updateOptimizeTips(chars,bytes,lm,{dekoTop,topText,mainText:main,bottomText:bottom,kaomoji,dekoBottom});

  // per-field char costs + clear-button sync
  Object.entries(lm).forEach(([f, v]) => {
    const badge = document.getElementById('fc_' + f);
    if (badge) badge.textContent = v ? v.length : 0;
  });
  FIELDS.forEach(f => {
    const inp = document.getElementById(f);
    const clr = inp?.nextElementSibling;
    if (clr?.classList.contains('field-clear')) clr.classList.toggle('has-val', (inp.value||'').length > 0);
  });

  // font tooltips
  FIELDS.forEach(f => {
    const text = document.getElementById(f)?.value || 'abc';
    const preview = text.substring(0, 20);
    ['normal','fancy','smallcaps','thai'].forEach(s => {
      const btn = document.getElementById('font_' + f + '_' + s);
      if (btn) btn.title = applyFont(preview, s);
    });
  });

  // preview
  const pms=Math.max(0.8,parseInt(size)/20)+'rem';
  const pvMain=document.getElementById('pvMain');
  const mainB=document.getElementById('mainBold')?.checked, mainI=document.getElementById('mainItalic')?.checked;
  // 3dxchat renders the main message in a regular (~400) weight by default;
  // only when the user explicitly ticks Bold should it become heavy. Was
  // 700/800 here, which always looked too thick compared to the real client.
  const mainWeight = mainB ? '700' : '400';
  const mainStyle = mainI ? 'italic' : 'normal';
  function setMainStyle(el){
    if(grads.mainText.on){el.style.cssText=`font-family:var(--font-display);font-size:${pms};font-weight:${mainWeight};font-style:${mainStyle};background:linear-gradient(to right,${grads.mainText.c1},${grads.mainText.c2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text`;}
    else{el.style.cssText=`font-family:var(--font-display);font-size:${pms};font-weight:${mainWeight};font-style:${mainStyle};color:${colors.mainText}`;}
  }
  ['pvInlineRow','pvCompactRow','pvFramedBot','pvPyramidWrap'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
  const pDT=document.getElementById('pvDekoTop'),pTR=document.getElementById('pvTopRow'),pBT=document.getElementById('pvBottom'),pKA=document.getElementById('pvKaomoji'),pDB=document.getElementById('pvDekoBottom'),card=document.getElementById('previewCard');
  [pDT,pTR,pvMain,pBT,pKA,pDB].forEach(el=>el.style.display='');
  pDT.textContent=withStars(applyFont(dekoTop,fieldFonts.dekoTop),'dekoTop'); pDT.style.color=colors.dekoTop; pDT.style.fontSize=sd/14+'rem'; pDT.style.letterSpacing='4px';
  pTR.textContent=withStars(applyFont(topText,fieldFonts.topText),'topText'); pTR.style.color=colors.topText; pTR.style.fontSize=st/14+'rem';
  pTR.style.fontWeight=topB?'700':''; pTR.style.fontStyle=topI?'italic':'';
  pvMain.textContent=applyFont(main,fieldFonts.mainText); setMainStyle(pvMain);
  pvMain.classList.toggle('pv-main-bold', !!mainB);
  pvMain.classList.toggle('pv-main-italic', !!mainI);
  pBT.textContent=withStars(applyFont(bottom,fieldFonts.bottomText),'bottomText'); pBT.style.color=colors.bottomText; pBT.style.fontSize=sb/14+'rem';
  pBT.style.fontWeight=botB?'700':''; pBT.style.fontStyle=botI?'italic':'';
  pKA.textContent=kaomoji; pKA.style.color=colors.kaomoji; pKA.style.fontSize=sk/14+'rem';
  pDB.textContent=applyFont(dekoBottom,fieldFonts.dekoBottom); pDB.style.color=colors.dekoBottom; pDB.style.fontSize=sdb/14+'rem';

  // ── reorder support: shared helpers used by stack layouts AND pyramid ──
  const pvMap={dekoTop:pDT,topText:pTR,mainText:pvMain,bottomText:pBT,kaomoji:pKA,dekoBottom:pDB};
  card.querySelectorAll('.pv-reorder').forEach(el=>el.remove());
  const swapInOrder=(f1,f2)=>{
    const i=lineOrder.indexOf(f1),j=lineOrder.indexOf(f2);
    if(i<0||j<0) return;
    [lineOrder[i],lineOrder[j]]=[lineOrder[j],lineOrder[i]];
    generate();
  };
  const attachReorder=(el,field,visibleList,idx)=>{
    el.classList.add('has-reorder');
    el.style.position='relative';
    const ctrl=document.createElement('div');ctrl.className='pv-reorder';
    const up=document.createElement('span');up.className='pv-arr';up.innerHTML=icon('chevron-up');up.title='move up';
    if(idx===0) up.classList.add('disabled');
    else up.onclick=(e)=>{e.stopPropagation();swapInOrder(field,visibleList[idx-1]);};
    const dn=document.createElement('span');dn.className='pv-arr';dn.innerHTML=icon('chevron-down');dn.title='move down';
    if(idx===visibleList.length-1) dn.classList.add('disabled');
    else dn.onclick=(e)=>{e.stopPropagation();swapInOrder(field,visibleList[idx+1]);};
    const rm=document.createElement('span');rm.className='pv-arr pv-arr-rm';rm.innerHTML=icon('xmark');rm.title=t('remove_line');
    if(typeof hydrateIcons==='function'){hydrateIcons(up);hydrateIcons(dn);hydrateIcons(rm);}
    rm.onclick=(e)=>{
      e.stopPropagation();
      if(field==='kaomoji'){setKaoMode(false);} else {setField(field,'');}
      // show "Line removed — Undo" toast with a clickable Undo action
      showToast(
        '<i class="fa-icon" data-icon="rotate-left"></i> <span>' + t('line_removed') +
        ' <button class="toast-action" onclick="undo();document.getElementById(\'copyToast\').classList.remove(\'show\')">' + t('undo_action') + '</button></span>',
        'info'
      );
    };
    ctrl.appendChild(up);ctrl.appendChild(dn);ctrl.appendChild(rm);
    el.appendChild(ctrl);
  };
  DEFAULT_ORDER.forEach(f=>card.appendChild(pvMap[f])); // restore default DOM order first
  if(STACK_LAYOUTS.includes(currentLayout)){
    lineOrder.forEach(f=>card.appendChild(pvMap[f]));   // reorder by lineOrder
    // only attach reorder controls to rows that actually have content — otherwise the empty .pvc keeps a reorder-only ghost row visible
    const visible=lineOrder.filter(f=>{
      const el=pvMap[f];
      if(el.style.display==='none') return false;
      return (el.textContent||'').trim().length>0;
    });
    visible.forEach((f,idx)=>attachReorder(pvMap[f],f,visible,idx));
  }

  function mkS(text,css,fid){const s=document.createElement('span');s.textContent=text;s.style.cssText=css+';cursor:pointer;border-radius:4px;padding:2px 4px;transition:background .15s;';s.onmouseenter=()=>s.style.background='rgba(255,255,255,.05)';s.onmouseleave=()=>s.style.background='';s.onclick=()=>pvClick(fid);return s;}

  // helper: build bold/italic css fragment for top/bottom in non-default layouts
  const biCss = (b,i) => `font-weight:${b?'bold':'normal'};font-style:${i?'italic':'normal'};`;
  if(currentLayout==='inline'){
    [pDT,pTR,pvMain].forEach(el=>el.style.display='none');
    const row=document.createElement('div');row.id='pvInlineRow';row.style.cssText='display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:4px;';
    if(dekoTop)row.appendChild(mkS(withStars(applyFont(dekoTop,fieldFonts.dekoTop),'dekoTop'),`color:${colors.dekoTop};font-size:${sd/14}rem`,'dekoTop'));
    if(topText)row.appendChild(mkS(withStars(applyFont(topText,fieldFonts.topText),'topText'),`${biCss(topB,topI)}color:${colors.topText};font-size:${st/14}rem`,'topText'));
    if(main){const ms=mkS(applyFont(main,fieldFonts.mainText),`font-family:var(--font-display);font-size:${pms};font-weight:${mainWeight};font-style:${mainStyle};color:${colors.mainText}`,'mainText');ms.classList.toggle('pv-main-bold',!!mainB);ms.classList.toggle('pv-main-italic',!!mainI);row.appendChild(ms);}
    if(dekoTop)row.appendChild(mkS(withStars(applyFont(dekoTop,fieldFonts.dekoTop),'dekoTop'),`color:${colors.dekoTop};font-size:${sd/14}rem`,'dekoTop'));
    card.insertBefore(row,pBT);
  }
  if(currentLayout==='compact'){
    [pDT,pTR,pvMain,pBT].forEach(el=>el.style.display='none');
    const row=document.createElement('div');row.id='pvCompactRow';row.style.cssText='display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:4px;';
    if(topText){row.appendChild(mkS(withStars(applyFont(topText,fieldFonts.topText),'topText'),`${biCss(topB,topI)}color:${colors.topText};font-size:${st/14}rem`,'topText'));const d=document.createElement('span');d.textContent='·';d.style.color='#444';row.appendChild(d);}
    if(main){const ms=mkS(applyFont(main,fieldFonts.mainText),`font-family:var(--font-display);font-size:${pms};font-weight:${mainWeight};font-style:${mainStyle};color:${colors.mainText}`,'mainText');ms.classList.toggle('pv-main-bold',!!mainB);ms.classList.toggle('pv-main-italic',!!mainI);row.appendChild(ms);}
    if(bottom){const d=document.createElement('span');d.textContent='·';d.style.color='#444';row.appendChild(d);row.appendChild(mkS(withStars(applyFont(bottom,fieldFonts.bottomText),'bottomText'),`${biCss(botB,botI)}color:${colors.bottomText};font-size:${sb/14}rem`,'bottomText'));}
    card.insertBefore(row,pDT.nextSibling);
  }
  if(currentLayout==='framed'){
    pDB.style.display='none';
    const b=document.createElement('div');b.id='pvFramedBot';b.textContent=withStars(applyFont(dekoTop||dekoBottom,fieldFonts.dekoTop),'dekoTop');
    b.style.cssText=`color:${colors.dekoTop};font-size:${sd/14}rem;letter-spacing:4px;cursor:pointer;border-radius:4px;padding:2px 6px;transition:background .15s;`;
    b.onmouseenter=()=>b.style.background='rgba(255,255,255,.05)';b.onmouseleave=()=>b.style.background='';b.onclick=()=>pvClick('dekoTop');
    card.appendChild(b);
  }
  if(currentLayout==='minimal')[pDT,pTR,pBT,pDB].forEach(el=>el.style.display='none');
  if(currentLayout==='pyramid'){
    [pDT,pTR,pvMain,pBT,pKA,pDB].forEach(el=>el.style.display='none');
    const wrap=document.createElement('div');wrap.id='pvPyramidWrap';wrap.style.cssText='width:100%;max-width:380px;';
    const mkPL=(text,css,fid,indent)=>{
      const d=document.createElement('div');d.style.cssText='text-align:left;margin-bottom:3px;padding-left:'+indent+';';
      const s=document.createElement('span');s.textContent=text;s.style.cssText=css+';cursor:pointer;border-radius:3px;padding:1px 4px;transition:background .15s;';
      s.onmouseenter=()=>s.style.background='rgba(255,255,255,.05)';s.onmouseleave=()=>s.style.background='';s.onclick=()=>pvClick(fid);
      d.appendChild(s);return d;
    };
    const star=(t,field)=>pyramidStars[field]?'* '+t+' *':t;
    const buildPyramidLine={
      dekoTop:    ()=> dekoTop ? mkPL(star(applyFont(dekoTop,fieldFonts.dekoTop),'dekoTop'),`color:${colors.dekoTop};font-size:${sd/14}rem`,'dekoTop','0') : null,
      topText:    ()=> topText ? mkPL(star(applyFont(topText,fieldFonts.topText),'topText'),`${biCss(topB,topI)}color:${colors.topText};font-size:${st/14}rem`,'topText','2rem') : null,
      bottomText: ()=> bottom ? mkPL(star(applyFont(bottom,fieldFonts.bottomText),'bottomText'),`${biCss(botB,botI)}color:${colors.bottomText};font-size:${sb/14}rem`,'bottomText','7.5rem') : null,
      mainText:   ()=>{
        if(!main) return null;
        const d=document.createElement('div');d.style.cssText='text-align:center;margin-top:8px;margin-bottom:3px;';
        const s=document.createElement('span');s.textContent=applyFont(main,fieldFonts.mainText);
        if(grads.mainText.on)s.style.cssText=`font-family:var(--font-display);font-size:${pms};font-weight:${mainWeight};font-style:${mainStyle};background:linear-gradient(to right,${grads.mainText.c1},${grads.mainText.c2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;cursor:pointer;`;
        else s.style.cssText=`font-family:var(--font-display);font-size:${pms};font-weight:${mainWeight};font-style:${mainStyle};color:${colors.mainText};cursor:pointer;`;
        s.classList.toggle('pv-main-bold',!!mainB);s.classList.toggle('pv-main-italic',!!mainI);
        s.onmouseenter=()=>s.style.opacity='.8';s.onmouseleave=()=>s.style.opacity='1';s.onclick=()=>pvClick('mainText');
        d.appendChild(s);return d;
      },
      kaomoji:    ()=>{
        if(!kaomoji) return null;
        const d=document.createElement('div');d.style.cssText='text-align:center;';
        const s=document.createElement('span');s.textContent=kaomoji;s.style.cssText=`color:${colors.kaomoji};font-size:${sk/14}rem;cursor:pointer;border-radius:3px;padding:1px 4px;transition:background .15s;`;
        s.onmouseenter=()=>s.style.background='rgba(255,255,255,.05)';s.onmouseleave=()=>s.style.background='';s.onclick=()=>pvClick('kaomoji');
        d.appendChild(s);return d;
      },
      dekoBottom: ()=> null   // pyramid does not render dekoBottom
    };
    // build in lineOrder, collect visible
    const builtLines=[]; // [{field, el}]
    lineOrder.forEach(f=>{
      const el = buildPyramidLine[f] && buildPyramidLine[f]();
      if(el){ builtLines.push({field:f, el}); wrap.appendChild(el); }
    });
    const visiblePyr = builtLines.map(x=>x.field);
    builtLines.forEach(({field,el},idx)=>attachReorder(el,field,visiblePyr,idx));
    card.insertBefore(wrap,pDT);
  }

  // auto-save state (debounced to avoid localStorage thrashing)
  if (typeof _saveDebounced === 'function') _saveDebounced();
}

// ── reorder mode toggle ──
let reorderMode = false;
function toggleReorderMode(){
  reorderMode = !reorderMode;
  const card = document.getElementById('previewCard');
  const btn = document.getElementById('reorderToggle');
  if (card) card.classList.toggle('reorder-mode', reorderMode);
  if (btn) {
    btn.classList.toggle('on', reorderMode);
    const lbl = btn.querySelector('span[data-i18n]');
    if (lbl) {
      const key = reorderMode ? 'reorder_done' : 'click_edit';
      lbl.setAttribute('data-i18n', key);
      lbl.textContent = t(key);
    }
  }
}

function showToast(html, type){
  let toast = document.getElementById('copyToast');
  if (!toast) { toast = document.createElement('div'); toast.id = 'copyToast'; toast.className = 'copy-toast'; document.body.appendChild(toast); }
  toast.classList.remove('warn','show');
  if (type === 'warn') toast.classList.add('warn');
  toast.innerHTML = html;
  if (typeof hydrateIcons === 'function') hydrateIcons(toast);
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => toast.classList.remove('show'), type === 'warn' ? 4000 : 1800);
}

function copyCode(){
  const text=document.getElementById('outputBox').textContent;
  const chars=text.length, bytes=byteLen(text);
  if (chars > 240 || bytes > 255) {
    showToast('<i class="fa-icon" data-icon="warning"></i> <span><b>' + t('copy_blocked') + '</b><br>' + t('copy_blocked_msg') + '</span>', 'warn');
    return;
  }
  navigator.clipboard?.writeText(text).then(()=>{flashCopy();}).catch(()=>{legacyCopy(text);});
  function legacyCopy(tx){const ta=document.createElement('textarea');ta.value=tx;ta.style.cssText='position:fixed;opacity:0;';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);flashCopy();}
  function flashCopy(){
    const btn=document.querySelector('.btn-copy');
    const lbl=btn.querySelector('span[data-i18n]');
    if(lbl){lbl.textContent=t('copied');setTimeout(()=>lbl.textContent=t('copy_code'),2000);}
    else {btn.textContent=t('copied');setTimeout(()=>btn.textContent=t('copy_code'),2000);}
  }
}

// ── optimization tips ──
function fieldLabel(f){return t('fl_'+f, f);}
function updateOptimizeTips(chars,bytes,lm,raw){
  const panel=document.getElementById('optimizeTips');
  const header=document.getElementById('optHeader');
  const list=document.getElementById('optList');
  const isOver=chars>240||bytes>255;
  const isWarn=chars>210||bytes>230;
  if(chars<185&&bytes<200){panel.style.display='none';return;}
  panel.style.display='block';
  panel.className='opt-panel '+(isOver?'over-state':isWarn?'warn-state':'');
  const tips=[];

  // ── font byte overhead analysis ──
  Object.entries(fieldFonts).forEach(([field,font])=>{
    if(font==='normal') return;
    const text=raw[field]||'';
    if(!text) return;
    const normalBytes=byteLen(text);
    const styledBytes=byteLen(applyFont(text,font));
    const overhead=styledBytes-normalBytes;
    if(overhead>3){
      if(bytes>220) tips.push({lvl:'action',field:field,fontAction:true,msg:t('opt_rm_font',fieldLabel(field),overhead)});
      else tips.push({lvl:'warn',msg:t('opt_rm_font',fieldLabel(field),overhead)});
    }
  });

  // gradient overhead analysis
  Object.entries(grads).forEach(([field,g])=>{
    if(!g.on) return;
    const text=raw[field]||'';
    const words=text.trim().split(/\s+/).filter(w=>w.length>0);
    if(words.length===0) return;
    const overhead=words.length*17;
    tips.push({lvl:'warn',msg:t('opt_grad', fieldLabel(field), overhead, words.length)});
  });

  // find biggest field contribution
  const fieldLens=Object.entries(lm).filter(([,v])=>v).map(([k,v])=>[k,v.length]).sort((a,b)=>b[1]-a[1]);
  if(fieldLens.length>0){
    const [topField,topLen]=fieldLens[0];
    tips.push({lvl:'info',msg:t('opt_longest', fieldLabel(topField), topLen)});
  }

  // deco line length warnings
  if(raw.dekoTop&&raw.dekoTop.length>14) tips.push({lvl:'tip',msg:t('opt_deko_top_long')});
  if(raw.dekoBottom&&raw.dekoBottom.length>14) tips.push({lvl:'tip',msg:t('opt_deko_bot_long')});

  // kaomoji length
  if(raw.kaomoji&&raw.kaomoji.length>9) tips.push({lvl:'tip',msg:t('opt_kao_long', raw.kaomoji.length)});

  // kaomoji + gradient warning
  const gradCount=Object.values(grads).filter(g=>g.on).length;
  if(raw.kaomoji&&gradCount>=1) tips.push({lvl:'warn',msg:t('opt_kao_grad', gradCount)});

  // duplicate deco symbols
  if(raw.dekoTop&&raw.dekoTop.length>8&&/(.)\1{2,}/.test(raw.dekoTop)) tips.push({lvl:'tip',msg:t('opt_dup_deko')});

  // layout suggestion
  if((chars>220||bytes>240)&&currentLayout!=='minimal'&&currentLayout!=='compact') tips.push({lvl:'tip',msg:t('opt_layout')});

  // ── ACTION tips: one-click removal to save space ──
  if(chars>210||bytes>230){
    if(raw.kaomoji){
      const save=lm.kaomoji?lm.kaomoji.length+1:raw.kaomoji.length;
      tips.push({lvl:'action',field:'kaomoji',msg:t('opt_rm_kao', save)});
    }
    if(raw.dekoTop){
      const save=lm.dekoTop?lm.dekoTop.length+1:raw.dekoTop.length;
      tips.push({lvl:'action',field:'dekoTop',msg:t('opt_rm_dt', save)});
    }
    if(raw.dekoBottom){
      const save=lm.dekoBottom?lm.dekoBottom.length+1:raw.dekoBottom.length;
      tips.push({lvl:'action',field:'dekoBottom',msg:t('opt_rm_db', save)});
    }
  }

  // render header
  const headerIcon = isOver ? icon('ban') : isWarn ? icon('warning') : icon('lightbulb');
  header.innerHTML = `<span class="opt-header-icon">${headerIcon}</span><span>${isOver?t('opt_over'):isWarn?t('opt_warn'):t('opt_info')}</span>`;
  header.style.color=isOver?'var(--red)':isWarn?'var(--orange)':'var(--subtle)';

  // render list
  list.innerHTML='';
  tips.forEach(tip=>{
    const item=document.createElement('div');
    if(tip.lvl==='action'){
      item.className='opt-item opt-act';
      item.style.color='var(--pink)';
      if(tip.fontAction){
        item.innerHTML=`<span class="opt-icon">${icon('font')}</span><span>${tip.msg}</span><span class="opt-act-btn">${t('opt_switch')}</span>`;
        item.onclick=()=>{ setFontStyle(tip.field,'normal'); };
      } else {
        item.innerHTML=`<span class="opt-icon">${icon('xmark')}</span><span>${tip.msg}</span><span class="opt-act-btn">${t('opt_remove')}</span>`;
        item.onclick=()=>{
          if(tip.field==='kaomoji') setKaoMode(false);
          else { setField(tip.field,''); generate(); }
        };
      }
    } else {
      item.className='opt-item';
      const ic = tip.lvl==='warn' ? icon('warning') : tip.lvl==='info' ? icon('arrow-right') : '<span style="display:inline-block;width:.6em;text-align:center">·</span>';
      const col=tip.lvl==='warn'?'var(--orange)':tip.lvl==='info'?'var(--purple)':'var(--muted)';
      item.style.color=col;
      item.innerHTML=`<span class="opt-icon">${ic}</span><span>${tip.msg}</span>`;
    }
    list.appendChild(item);
  });
  if(typeof hydrateIcons==='function'){hydrateIcons(header);hydrateIcons(list);}
}

// ── URL sharing ──
function shareGift() {
  const state = {
    t: {}, s: {}, c: {}, col: colors, gr: grads, nc: noColor, ff: fieldFonts,
    lay: currentLayout, lo: lineOrder,
    kao: document.getElementById('kaoSection')?.style.display !== 'none'
  };
  FIELDS.forEach(f => state.t[f] = document.getElementById(f).value);
  SIZE_IDS.forEach(id => state.s[id] = document.getElementById(id).value);
  CHECK_IDS.forEach(id => { const el = document.getElementById(id); if (el) state.c[id] = el.checked; });
  const hash = '#g=' + btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  history.replaceState(null, '', hash);
  navigator.clipboard?.writeText(location.href).then(() => {
    const btn = document.getElementById('shareBtn');
    if (btn) { const orig = btn.innerHTML; btn.innerHTML = '<i class="fa-icon" data-icon="check"></i> Link copied!'; if(typeof hydrateIcons==='function') hydrateIcons(btn); setTimeout(() => { btn.innerHTML = orig; if(typeof hydrateIcons==='function') hydrateIcons(btn); }, 2000); }
  });
}

function loadFromURL() {
  const h = location.hash;
  if (!h.startsWith('#g=')) return false;
  try {
    const state = JSON.parse(decodeURIComponent(escape(atob(h.slice(3)))));
    if (state.t) FIELDS.forEach(f => { const el = document.getElementById(f); if (el && state.t[f] != null) el.value = state.t[f]; });
    if (state.s) SIZE_IDS.forEach(id => { const el = document.getElementById(id); if (el && state.s[id] != null) el.value = state.s[id]; });
    if (state.c) CHECK_IDS.forEach(id => { const el = document.getElementById(id); if (el && state.c[id] != null) el.checked = state.c[id]; });
    if (state.col) Object.assign(colors, state.col);
    if (state.nc) Object.assign(noColor, state.nc);
    if (state.gr) Object.keys(state.gr).forEach(f => { if(grads[f]) Object.assign(grads[f], state.gr[f]); });
    FIELDS.forEach(f => { const btn = document.getElementById('btn_' + f); if(!btn) return; const g=grads[f]; btn.style.background = g.on ? `linear-gradient(to right,${g.c1},${g.c2})` : colors[f]; });
    if (state.ff) {
      Object.assign(fieldFonts, state.ff);
      Object.keys(fieldFonts).forEach(f => { ['normal','fancy','smallcaps','thai'].forEach(s => { const el = document.getElementById('font_'+f+'_'+s); if(el) el.classList.toggle('on', fieldFonts[f]===s); }); });
    }
    if (state.lay) {
      currentLayout = state.lay;
      document.querySelectorAll('[id^="lay_"]').forEach(el => el.classList.remove('on'));
      const b = document.getElementById('lay_' + state.lay); if(b) b.classList.add('on');
    }
    if (state.lo) lineOrder = state.lo.slice();
    if (state.kao != null) {
      document.getElementById('kaoSection').style.display = state.kao ? '' : 'none';
      document.getElementById('kao_on')?.classList.toggle('on', state.kao);
      document.getElementById('kao_off')?.classList.toggle('on', !state.kao);
    }
    return true;
  } catch(e) { return false; }
}

// ── theme ──
// Light mode was removed — page is dark-mode only now.
// Clear any previously saved 'light' preference so old visitors don't see weird state.
try { if (localStorage.getItem('theme')) localStorage.removeItem('theme'); } catch(e) {}
document.documentElement.removeAttribute('data-theme');

// ── keyboard shortcuts ──
document.addEventListener('keydown', function(e) {
  // Ctrl+Z = undo
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    e.preventDefault(); undo();
  }
  // Ctrl+Y or Ctrl+Shift+Z = redo
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    e.preventDefault(); redo();
  }
  // Ctrl+Shift+C = copy code (when not in input)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault(); copyCode();
  }
  // Escape = close modal
  if (e.key === 'Escape') {
    closeModal();
  }
});

// ── debounced generate for input events (80ms) ──
const generateDebounced = debounce(generate, 80);
document.querySelectorAll('input[type="text"],input[type="number"]').forEach(el=>{
  el.addEventListener('input',generateDebounced);
  el.addEventListener('input',()=>{ userHasEdited=true; });
});
// save state after every generate — debounced to avoid thrashing
const _saveDebounced = debounce(saveGiftState, 200);

// ── field clear buttons ──
FIELDS.forEach(f => {
  const input = document.getElementById(f);
  if (!input) return;
  const row = input.closest('.row');
  if (!row) return;
  const btn = document.createElement('span');
  btn.className = 'field-clear';
  btn.textContent = '✕';
  btn.onclick = (e) => { e.stopPropagation(); setField(f, ''); };
  row.insertBefore(btn, input.nextSibling);
  // show/hide based on value
  const sync = () => btn.classList.toggle('has-val', input.value.length > 0);
  input.addEventListener('input', sync);
  sync();
});

// custom editor sync
document.getElementById('ceTextarea')?.addEventListener('input', ceSync);
// Keep _ceLastSel in sync so Apply buttons can recover when focus drift
// during color-picker / button-click collapses the textarea selection.
['select','mouseup','keyup','blur','input'].forEach(ev => {
  document.getElementById('ceTextarea')?.addEventListener(ev, ceRememberSel);
});

// keyboard shortcuts — Ctrl/Cmd + S (share), Ctrl/Cmd + Shift + C (copy code), Ctrl/Cmd + Z handled natively in inputs
document.addEventListener('keydown', e => {
  const mod = e.ctrlKey || e.metaKey;
  if (!mod) return;
  const tag = (e.target?.tagName || '').toLowerCase();
  const inField = tag === 'input' || tag === 'textarea';
  // Ctrl+S → Share
  if (e.key === 's' && !e.shiftKey) {
    e.preventDefault();
    if (typeof shareGift === 'function') shareGift();
    return;
  }
  // Ctrl+Shift+C → Copy code (avoid clashing with browser default copy)
  if (e.key === 'C' && e.shiftKey) {
    e.preventDefault();
    if (typeof copyCode === 'function') copyCode();
    return;
  }
  // Ctrl+Z when NOT in an input → undo (so it doesn't interfere with text-editing undo)
  if (e.key === 'z' && !inField && !e.shiftKey) {
    e.preventDefault();
    if (typeof undo === 'function') undo();
  }
});

// restore section open/closed states from localStorage
document.querySelectorAll('.sec[id]').forEach(sec => {
  try {
    const saved = localStorage.getItem('sec_' + sec.id);
    if (saved === null) return;
    const head = sec.querySelector('.sec-head');
    const body = sec.querySelector('.sec-body');
    if (!head || !body) return;
    if (saved === '1') { head.classList.add('open'); body.classList.add('open'); }
    else { head.classList.remove('open'); body.classList.remove('open'); }
  } catch(e) {}
});
// initial favorites render so the empty-state hint shows
renderFavPanel();

// ── init: fresh load every F5, only restore from shared URL (#g=…) ──
try { localStorage.removeItem('giftState'); } catch(e) {}
const hadURLState = loadFromURL();
if (hadURLState) {
  userHasEdited = true;
} else {
  // fresh load — fill fields with the default layout's demo texts
  const d = layoutDefaults[currentLayout];
  if (d) ['dekoTop','topText','mainText','bottomText','kaomoji','dekoBottom'].forEach(f => document.getElementById(f).value = d[f]);
}
generate();
