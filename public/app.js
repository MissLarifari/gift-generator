// ── ui helpers ──
function toggleSec(head) {
  head.classList.toggle('open');
  head.nextElementSibling.classList.toggle('open');
}

// ── i18n ──
const I18N = {
  en: {
    chars:'Chars', bytes:'Bytes',
    feedback_pre:'Feedback · ', feedback_post:' on Discord',
    howto_title:'How It Works',
    howto_step1:'<b>Pick a layout</b> below — Center, Inline, Compact, Framed, Minimal or Pyramid. Each one arranges the lines differently.',
    howto_step2:'<b>Edit each line.</b> A gift has six fields: <i>Deco top</i>, <i>Top line</i>, <i>Main text</i>, <i>Bottom line</i>, <i>Kaomoji</i> and <i>Deco bottom</i>. Type your own text or click a chip suggestion.',
    howto_step3:'<b>Style each field</b> with the little color square next to the input — pick a color, a gradient, or toggle "no color" to save characters. Font toggle (Aa / αв / ꜱᴄ) switches normal, fancy or small caps.',
    howto_step_reorder:'<b>Reorder or remove lines directly in the preview</b> — hover any line and use the <b>▲ / ▼</b> arrows to move it up or down, or the <b>✕</b> button to clear it. Works in Center, Framed, Minimal and Pyramid layouts. The generated code below updates instantly.',
    howto_step4:'<b>Browse the templates</b> on the right — Sweet, Funny, Flirty, Dominant, Spicy, Roast, Birthday and more. One click fills all three text lines at once.',
    howto_step5:'<b>Watch the counter</b> in the topbar. 3dxchat allows <b>240 chars / 255 bytes</b>. If it turns red, shorten text, drop a line, or remove a gradient.',
    howto_step6:'<b>Copy the code</b> with the big button under the preview, then paste it in 3dxchat as a gift message. Done.',
    howto_tip:'💡 Tip — click any line in the live preview to jump straight to its input field.',
    layout:'Layout',
    layout_center:'Center', layout_inline:'Inline', layout_compact:'Compact',
    layout_framed:'Framed', layout_minimal:'Minimal', layout_pyramid:'Pyramid',
    reset_all:'↺ Reset All',
    deco_top:'Deco Top', top_line:'Top Line', main_text:'Main Text',
    bottom_line:'Bottom Line', kaomoji:'Kaomoji', deco_bottom:'Deco Bottom', symbols:'Symbols',
    plus_symbol:'+ Symbol', size:'Size', bold:'Bold', italic:'Italic',
    cute:'Cute', ascii:'ASCII', with_kao:'✦ With', without_kao:'✕ Without',
    hearts:'Hearts', stars:'Stars', flowers:'Flowers', arrows_deco:'Arrows & Deco', misc:'Misc',
    ph_deco_top:'Deco top…', ph_top:'Top line…', ph_main:'Main text…',
    ph_bottom:'Bottom line…', ph_kao:'Kaomoji…', ph_deco_bottom:'Deco bottom…',
    ph_search:'Search templates…',
    preview:'Preview', click_edit:'Click to edit', click_to_copy:'Click to copy',
    code:'Code', copy_code:'📋 Copy Code', copied:'✓ Copied!',
    tip_howto_title:'💡 How It Works',
    tip_howto:'Gradients &amp; long deco lines use lots of characters. If the counter turns <span style="color:var(--red)">red</span>, try shorter text, remove deco lines, or disable gradients. Gradients work best on the main text only.',
    tip_howto2:'All fields show examples — click any line in the preview to jump to the matching field and edit it directly.',
    disclaimer:'Disclaimer: This tool is provided as-is, without any guarantees. I am not responsible for any errors, bugs, or character limit issues. Use at your own risk. All texts are just suggestions.',
    disclaimer_short:'Tool without warranty — all texts are suggestions.',
    prototype_badge:'PROTOTYPE',
    prototype_thanks:'💛 This is a prototype — thank you to everyone who uses it and supports me!',
    modal_color:'Color · ', gradient:'Gradient', color_1:'Color 1', color_2:'Color 2',
    apply:'✓ Apply', cancel:'Cancel', no_color:'No Color Tag', saves_chars:'· saves chars',
    // dynamic optimize tips
    opt_over:'⛔ Over the limit — shorten your message',
    opt_warn:'⚠ Getting long — optimization hints',
    opt_info:'💡 Optimization hints',
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
    opt_remove:'remove',
    fl_dekoTop:'Deco Top', fl_topText:'Top Line', fl_mainText:'Main Text',
    fl_bottomText:'Bottom Line', fl_kaomoji:'Kaomoji', fl_dekoBottom:'Deco Bottom',
  },
  de: {
    chars:'Zeichen', bytes:'Bytes',
    feedback_pre:'Feedback · ', feedback_post:' auf Discord',
    howto_title:'So funktioniert es',
    howto_step1:'<b>Wähle ein Layout</b> unten — Zentriert, Inline, Kompakt, Rahmen, Minimal oder Pyramide. Jedes ordnet die Zeilen anders an.',
    howto_step2:'<b>Bearbeite jede Zeile.</b> Ein Gift hat sechs Felder: <i>Deko oben</i>, <i>Obere Zeile</i>, <i>Haupttext</i>, <i>Untere Zeile</i>, <i>Kaomoji</i> und <i>Deko unten</i>. Schreib eigenen Text oder klick einen Vorschlag.',
    howto_step3:'<b>Style jedes Feld</b> mit dem kleinen Farbquadrat neben dem Input — wähl eine Farbe, einen Verlauf, oder schalt "Kein Color-Tag" ein, um Zeichen zu sparen. Der Font-Toggle (Aa / αв / ꜱᴄ) wechselt zwischen normal, fancy und small caps.',
    howto_step_reorder:'<b>Zeilen direkt in der Vorschau umsortieren oder entfernen</b> — fahr mit der Maus über eine Zeile und nutze die <b>▲ / ▼</b>-Pfeile, um sie nach oben oder unten zu verschieben, oder das <b>✕</b>, um sie zu leeren. Funktioniert in den Layouts Zentriert, Rahmen, Minimal und Pyramide. Der generierte Code unten aktualisiert sich sofort.',
    howto_step4:'<b>Durchstöber die Vorlagen</b> rechts — Sweet, Funny, Flirty, Dominant, Spicy, Roast, Birthday und mehr. Ein Klick füllt alle drei Textzeilen auf einmal.',
    howto_step5:'<b>Beobachte den Counter</b> in der Topbar. 3dxchat erlaubt <b>240 Zeichen / 255 Bytes</b>. Wird er rot, kürze den Text, lass eine Zeile weg oder entferne einen Verlauf.',
    howto_step6:'<b>Kopiere den Code</b> mit dem großen Button unter der Vorschau und füg ihn als Gift-Nachricht in 3dxchat ein. Fertig.',
    howto_tip:'💡 Tipp — klick eine Zeile in der Live-Vorschau, um direkt zum passenden Feld zu springen.',
    layout:'Layout',
    layout_center:'Zentriert', layout_inline:'Inline', layout_compact:'Kompakt',
    layout_framed:'Rahmen', layout_minimal:'Minimal', layout_pyramid:'Pyramide',
    reset_all:'↺ Alles zurücksetzen',
    deco_top:'Deko oben', top_line:'Obere Zeile', main_text:'Haupttext',
    bottom_line:'Untere Zeile', kaomoji:'Kaomoji', deco_bottom:'Deko unten', symbols:'Symbole',
    plus_symbol:'+ Symbol', size:'Größe', bold:'Fett', italic:'Kursiv',
    cute:'Süß', ascii:'ASCII', with_kao:'✦ Mit', without_kao:'✕ Ohne',
    hearts:'Herzen', stars:'Sterne', flowers:'Blumen', arrows_deco:'Pfeile & Deko', misc:'Sonstige',
    ph_deco_top:'Deko oben…', ph_top:'Obere Zeile…', ph_main:'Haupttext…',
    ph_bottom:'Untere Zeile…', ph_kao:'Kaomoji…', ph_deco_bottom:'Deko unten…',
    ph_search:'Vorlagen suchen…',
    preview:'Vorschau', click_edit:'Klicken zum Bearbeiten', click_to_copy:'Klicken zum Kopieren',
    code:'Code', copy_code:'📋 Code kopieren', copied:'✓ Kopiert!',
    tip_howto_title:'💡 So funktioniert es',
    tip_howto:'Verläufe und lange Deko-Zeilen brauchen viele Zeichen. Wird der Counter <span style="color:var(--red)">rot</span>, probier kürzeren Text, entferne Deko-Zeilen oder deaktiviere Verläufe. Verläufe funktionieren am besten nur beim Haupttext.',
    tip_howto2:'Alle Felder zeigen Beispiele — klick eine Zeile in der Vorschau, um direkt zum passenden Feld zu springen.',
    disclaimer:'Haftungsausschluss: Dieses Tool wird ohne Gewähr bereitgestellt. Ich übernehme keine Verantwortung für Fehler, Bugs oder Probleme mit dem Zeichenlimit. Benutzung auf eigene Gefahr. Alle Texte sind nur Vorschläge.',
    disclaimer_short:'Tool ohne Gewähr — alle Texte sind Vorschläge.',
    prototype_badge:'PROTOTYP',
    prototype_thanks:'💛 Das ist ein Prototyp — danke an alle, die ihn nutzen und mich damit supporten!',
    modal_color:'Farbe · ', gradient:'Verlauf', color_1:'Farbe 1', color_2:'Farbe 2',
    apply:'✓ Übernehmen', cancel:'Abbrechen', no_color:'Kein Color-Tag', saves_chars:'· spart Zeichen',
    opt_over:'⛔ Über dem Limit — kürze deine Nachricht',
    opt_warn:'⚠ Wird lang — Optimierungs-Tipps',
    opt_info:'💡 Optimierungs-Tipps',
    opt_grad:(f,o,w)=>`Verlauf auf ${f} bringt ~${o} Extra-Zeichen (${w} Wort${w>1?'e':''})`,
    opt_longest:(f,n)=>`${f} ist dein längster Abschnitt — ${n} Zeichen`,
    opt_deko_top_long:'Deko oben ist sehr lang — probier es zu kürzen',
    opt_deko_bot_long:'Deko unten ist sehr lang — probier es zu kürzen',
    opt_kao_long:n=>`Kaomoji ist ziemlich lang (${n} Zeichen)`,
    opt_kao_grad:n=>`Kaomoji + Verlauf${n>1?'e':''} zusammen können das Limit sprengen`,
    opt_dup_deko:'Probier doppelte Symbole in Deko oben zu entfernen',
    opt_layout:'Wechsel zu Layout Kompakt oder Minimal, um Zeichen zu sparen',
    opt_rm_kao:n=>`Kaomoji entfernen — spart ~${n} Zeichen`,
    opt_rm_dt:n=>`Deko oben entfernen — spart ~${n} Zeichen`,
    opt_rm_db:n=>`Deko unten entfernen — spart ~${n} Zeichen`,
    opt_remove:'entfernen',
    fl_dekoTop:'Deko oben', fl_topText:'Obere Zeile', fl_mainText:'Haupttext',
    fl_bottomText:'Untere Zeile', fl_kaomoji:'Kaomoji', fl_dekoBottom:'Deko unten',
  },
  fr: {
    chars:'Caractères', bytes:'Octets',
    feedback_pre:'Feedback · ', feedback_post:' sur Discord',
    howto_title:'Comment ça marche',
    howto_step1:'<b>Choisis une disposition</b> en bas — Centré, En ligne, Compact, Encadré, Minimal ou Pyramide. Chacune arrange les lignes différemment.',
    howto_step2:'<b>Modifie chaque ligne.</b> Un cadeau a six champs : <i>Déco haut</i>, <i>Ligne haut</i>, <i>Texte principal</i>, <i>Ligne bas</i>, <i>Kaomoji</i> et <i>Déco bas</i>. Tape ton propre texte ou clique une suggestion.',
    howto_step3:'<b>Style chaque champ</b> avec le petit carré de couleur à côté du champ — choisis une couleur, un dégradé, ou active "Pas de couleur" pour économiser des caractères. Le toggle de police (Aa / αв / ꜱᴄ) bascule entre normal, fancy et petites majuscules.',
    howto_step_reorder:'<b>Réordonne ou supprime les lignes directement dans l\'aperçu</b> — survole une ligne et utilise les flèches <b>▲ / ▼</b> pour la déplacer vers le haut ou le bas, ou le <b>✕</b> pour la vider. Fonctionne dans les dispositions Centré, Encadré, Minimal et Pyramide. Le code généré en dessous se met à jour immédiatement.',
    howto_step4:'<b>Parcours les modèles</b> à droite — Sweet, Funny, Flirty, Dominant, Spicy, Roast, Birthday et plus. Un clic remplit les trois lignes de texte d\'un coup.',
    howto_step5:'<b>Surveille le compteur</b> dans la topbar. 3dxchat permet <b>240 caractères / 255 octets</b>. S\'il devient rouge, raccourcis le texte, enlève une ligne ou retire un dégradé.',
    howto_step6:'<b>Copie le code</b> avec le grand bouton sous l\'aperçu, puis colle-le dans 3dxchat comme message cadeau. C\'est fini.',
    howto_tip:'💡 Astuce — clique n\'importe quelle ligne dans l\'aperçu en direct pour sauter directement à son champ.',
    layout:'Disposition',
    layout_center:'Centré', layout_inline:'En ligne', layout_compact:'Compact',
    layout_framed:'Encadré', layout_minimal:'Minimal', layout_pyramid:'Pyramide',
    reset_all:'↺ Tout réinitialiser',
    deco_top:'Déco haut', top_line:'Ligne haut', main_text:'Texte principal',
    bottom_line:'Ligne bas', kaomoji:'Kaomoji', deco_bottom:'Déco bas', symbols:'Symboles',
    plus_symbol:'+ Symbole', size:'Taille', bold:'Gras', italic:'Italique',
    cute:'Mignon', ascii:'ASCII', with_kao:'✦ Avec', without_kao:'✕ Sans',
    hearts:'Cœurs', stars:'Étoiles', flowers:'Fleurs', arrows_deco:'Flèches & déco', misc:'Divers',
    ph_deco_top:'Déco haut…', ph_top:'Ligne haut…', ph_main:'Texte principal…',
    ph_bottom:'Ligne bas…', ph_kao:'Kaomoji…', ph_deco_bottom:'Déco bas…',
    ph_search:'Rechercher des modèles…',
    preview:'Aperçu', click_edit:'Cliquer pour modifier', click_to_copy:'Cliquer pour copier',
    code:'Code', copy_code:'📋 Copier le code', copied:'✓ Copié !',
    tip_howto_title:'💡 Comment ça marche',
    tip_howto:'Les dégradés et les longues lignes de déco utilisent beaucoup de caractères. Si le compteur devient <span style="color:var(--red)">rouge</span>, essaie un texte plus court, retire des lignes de déco ou désactive les dégradés. Les dégradés marchent mieux uniquement sur le texte principal.',
    tip_howto2:'Tous les champs montrent des exemples — clique n\'importe quelle ligne dans l\'aperçu pour sauter au champ correspondant et le modifier.',
    disclaimer:'Avertissement : Cet outil est fourni tel quel, sans garantie. Je ne suis pas responsable des erreurs, bugs ou problèmes de limite de caractères. Utilisation à tes propres risques. Tous les textes ne sont que des suggestions.',
    disclaimer_short:'Outil sans garantie — tous les textes sont des suggestions.',
    prototype_badge:'PROTOTYPE',
    prototype_thanks:'💛 Ceci est un prototype — merci à tous ceux qui l\'utilisent et me soutiennent !',
    modal_color:'Couleur · ', gradient:'Dégradé', color_1:'Couleur 1', color_2:'Couleur 2',
    apply:'✓ Appliquer', cancel:'Annuler', no_color:'Pas de couleur', saves_chars:'· économise des caractères',
    opt_over:'⛔ Au-dessus de la limite — raccourcis ton message',
    opt_warn:'⚠ Devient long — conseils d\'optimisation',
    opt_info:'💡 Conseils d\'optimisation',
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
    opt_remove:'retirer',
    fl_dekoTop:'Déco haut', fl_topText:'Ligne haut', fl_mainText:'Texte principal',
    fl_bottomText:'Ligne bas', fl_kaomoji:'Kaomoji', fl_dekoBottom:'Déco bas',
  },
  ru: {
    chars:'Знаки', bytes:'Байты',
    feedback_pre:'Обратная связь · ', feedback_post:' в Discord',
    howto_title:'Как это работает',
    howto_step1:'<b>Выбери макет</b> ниже — Центр, Строка, Компактный, Рамка, Минимал или Пирамида. Каждый располагает строки по-своему.',
    howto_step2:'<b>Редактируй каждую строку.</b> У подарка шесть полей: <i>Декор сверху</i>, <i>Верхняя строка</i>, <i>Основной текст</i>, <i>Нижняя строка</i>, <i>Каомодзи</i> и <i>Декор снизу</i>. Введи свой текст или кликни по подсказке.',
    howto_step3:'<b>Стилизуй каждое поле</b> маленьким цветным квадратом рядом с полем — выбери цвет, градиент или включи "Без цвета", чтобы сэкономить знаки. Переключатель шрифта (Aa / αв / ꜱᴄ) меняет обычный, фенси или малые прописные.',
    howto_step_reorder:'<b>Меняй порядок или убирай строки прямо в предпросмотре</b> — наведи курсор на строку и используй стрелки <b>▲ / ▼</b>, чтобы переместить её вверх или вниз, или <b>✕</b>, чтобы очистить. Работает в макетах Центр, Рамка, Минимал и Пирамида. Код снизу обновляется мгновенно.',
    howto_step4:'<b>Просмотри шаблоны</b> справа — Sweet, Funny, Flirty, Dominant, Spicy, Roast, Birthday и другие. Один клик заполняет все три строки сразу.',
    howto_step5:'<b>Следи за счётчиком</b> в топбаре. 3dxchat позволяет <b>240 знаков / 255 байт</b>. Если он стал красным, сократи текст, убери строку или отключи градиент.',
    howto_step6:'<b>Скопируй код</b> большой кнопкой под предпросмотром, затем вставь его в 3dxchat как сообщение подарка. Готово.',
    howto_tip:'💡 Совет — кликни по любой строке в живом предпросмотре, чтобы сразу перейти к её полю.',
    layout:'Макет',
    layout_center:'Центр', layout_inline:'Строка', layout_compact:'Компактный',
    layout_framed:'Рамка', layout_minimal:'Минимал', layout_pyramid:'Пирамида',
    reset_all:'↺ Сбросить всё',
    deco_top:'Декор сверху', top_line:'Верхняя строка', main_text:'Основной текст',
    bottom_line:'Нижняя строка', kaomoji:'Каомодзи', deco_bottom:'Декор снизу', symbols:'Символы',
    plus_symbol:'+ Символ', size:'Размер', bold:'Жирный', italic:'Курсив',
    cute:'Милые', ascii:'ASCII', with_kao:'✦ С', without_kao:'✕ Без',
    hearts:'Сердечки', stars:'Звёзды', flowers:'Цветы', arrows_deco:'Стрелки и декор', misc:'Разное',
    ph_deco_top:'Декор сверху…', ph_top:'Верхняя строка…', ph_main:'Основной текст…',
    ph_bottom:'Нижняя строка…', ph_kao:'Каомодзи…', ph_deco_bottom:'Декор снизу…',
    ph_search:'Поиск шаблонов…',
    preview:'Предпросмотр', click_edit:'Нажми, чтобы редактировать', click_to_copy:'Нажми, чтобы скопировать',
    code:'Код', copy_code:'📋 Скопировать код', copied:'✓ Скопировано!',
    tip_howto_title:'💡 Как это работает',
    tip_howto:'Градиенты и длинные строки декора используют много знаков. Если счётчик стал <span style="color:var(--red)">красным</span>, попробуй сократить текст, убрать строки декора или отключить градиенты. Градиенты лучше работают только на основном тексте.',
    tip_howto2:'Все поля показывают примеры — кликни по любой строке в предпросмотре, чтобы перейти к соответствующему полю и редактировать его напрямую.',
    disclaimer:'Отказ от ответственности: этот инструмент предоставляется как есть, без каких-либо гарантий. Я не несу ответственности за ошибки, баги или проблемы с лимитом знаков. Используй на свой страх и риск. Все тексты — лишь предложения.',
    disclaimer_short:'Инструмент без гарантий — все тексты лишь предложения.',
    prototype_badge:'ПРОТОТИП',
    prototype_thanks:'💛 Это прототип — спасибо всем, кто им пользуется и поддерживает меня!',
    modal_color:'Цвет · ', gradient:'Градиент', color_1:'Цвет 1', color_2:'Цвет 2',
    apply:'✓ Применить', cancel:'Отмена', no_color:'Без цвета', saves_chars:'· экономит знаки',
    opt_over:'⛔ Превышен лимит — сократи сообщение',
    opt_warn:'⚠ Становится длинным — советы по оптимизации',
    opt_info:'💡 Советы по оптимизации',
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
    opt_remove:'убрать',
    fl_dekoTop:'Декор сверху', fl_topText:'Верхняя строка', fl_mainText:'Основной текст',
    fl_bottomText:'Нижняя строка', fl_kaomoji:'Каомодзи', fl_dekoBottom:'Декор снизу',
  }
};
let uiLang = (typeof localStorage!=='undefined' && localStorage.getItem('uiLang')) || 'en';
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
function filterTpl(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('.chip.t').forEach(c=>{
    c.style.display = (!q || c.textContent.toLowerCase().includes(q)) ? '' : 'none';
  });
}

// ── layout ──
let currentLayout = 'center';
const layoutDefaults = {
  center:  {dekoTop:'· ily ·←', topText:'.. stop being ..', mainText:'so cute', bottomText:'.. i cant handle it ..', kaomoji:'(❀◡❀)', dekoBottom:'.. ･ ✦ ･ ..'},
  inline:  {dekoTop:'❀', topText:'you are', mainText:'so cute', bottomText:'.. i cant handle it ..', kaomoji:'(❀◡❀)', dekoBottom:'.. ✦ ..'},
  compact: {dekoTop:'· · ·', topText:'wollt nur sagen', mainText:'danke dir', bottomText:'für alles', kaomoji:'(˘³˘)♥', dekoBottom:'· · ·'},
  framed:  {dekoTop:'❀ · ❀ · ❀', topText:'du bist mein', mainText:'liebling', bottomText:'· kein scherz ·', kaomoji:'', dekoBottom:''},
  minimal: {dekoTop:'', topText:'', mainText:'nur wir', bottomText:'', kaomoji:'(❀◡❀)', dekoBottom:''},
  pyramid: {dekoTop:'✦ · ✦', topText:'.. stop being ..', mainText:'so cute', bottomText:'.. i cant handle it ..', kaomoji:'(❀◡❀)', dekoBottom:''}
};
function setLayout(layout) {
  currentLayout = layout;
  document.querySelectorAll('[id^="lay_"]').forEach(el=>el.classList.remove('on'));
  document.getElementById('lay_'+layout).classList.add('on');
  const d = layoutDefaults[layout];
  ['dekoTop','topText','mainText','bottomText','kaomoji','dekoBottom'].forEach(f=>document.getElementById(f).value=d[f]);
  if(typeof lineOrder!=='undefined') lineOrder=DEFAULT_ORDER.slice();
  generate();
}
function applyLayout(lm) {
  const ord = (typeof lineOrder!=='undefined') ? lineOrder : ['dekoTop','topText','mainText','bottomText','kaomoji','dekoBottom'];
  if(currentLayout==='center')  return ord.map(f=>lm[f]).filter(Boolean).join('\n');
  if(currentLayout==='inline')  return [[lm.dekoTop,lm.topText,lm.mainText,lm.dekoTop].filter(Boolean).join(' '),lm.bottomText,lm.kaomoji,lm.dekoBottom].filter(Boolean).join('\n');
  if(currentLayout==='compact') return [lm.dekoTop,[lm.topText,lm.mainText,lm.bottomText].filter(Boolean).join(' · '),lm.kaomoji,lm.dekoBottom].filter(Boolean).join('\n');
  if(currentLayout==='framed'){
    const body=ord.map(f=>lm[f]).filter(Boolean);
    if(lm.dekoTop && !lm.dekoBottom) body.push(lm.dekoTop);
    return body.join('\n');
  }
  if(currentLayout==='minimal') return ord.filter(f=>f==='mainText'||f==='kaomoji').map(f=>lm[f]).filter(Boolean).join('\n');
  if(currentLayout==='pyramid'){
    const pyrFmt={dekoTop:t=>'* '+t+' *',topText:t=>'　　* '+t+' *',bottomText:t=>'　　　　　　　　　　* '+t+' *',mainText:t=>t,kaomoji:t=>t};
    const lines=[];
    ord.forEach(f=>{if(pyrFmt[f]&&lm[f]) lines.push(pyrFmt[f](lm[f]));});
    return lines.join('\n');
  }
  return Object.values(lm).filter(Boolean).join('\n');
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
function setCustomColor(hex){if(/^#[0-9a-fA-F]{6}$/.test(hex)){colors[currentField]=hex;document.getElementById('customPicker').value=hex;}}
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
function colorTag(text,field){const g=grads[field];if(g?.on)return gradientText(text,g.c1,g.c2);if(noColor[field])return text;return`<color=${colors[field]}>${text}</color>`;}

// ── fonts ──
const FM={'a':'α','b':'в','c':'¢','d':'∂','e':'є','f':'f','g':'g','h':'н','i':'ι','j':'נ','k':'к','l':'ℓ','m':'м','n':'η','o':'σ','p':'ρ','q':'q','r':'я','s':'ѕ','t':'т','u':'υ','v':'ν','w':'ω','x':'χ','y':'у','z':'z'};
const SM={'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ','i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ','q':'ǫ','r':'ʀ','s':'s','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x','y':'ʏ','z':'ᴢ'};
function applyFont(text,style){if(style==='fancy')return text.split('').map(c=>FM[c.toLowerCase()]||c).join('');if(style==='smallcaps')return text.split('').map(c=>SM[c.toLowerCase()]||c).join('');return text;}
function setFontStyle(field,style){
  fieldFonts[field]=style;
  if(field==='mainText') currentFontStyle=style;
  // remove active from all 3 variants for this field
  ['normal','fancy','smallcaps'].forEach(function(s){
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
function copySymbol(sym){navigator.clipboard?.writeText(sym).catch(()=>{});const fb=document.getElementById('copyFeedback');fb.textContent='✓ '+sym;setTimeout(()=>fb.textContent='',1800);}
function setField(id,val){document.getElementById(id).value=val;generate();}
function setSpruch(main,top,bottom){document.getElementById('mainText').value=main;document.getElementById('topText').value=top;document.getElementById('bottomText').value=bottom;generate();}
function setBday(main,top,bottom){
  setSpruch(main,top,bottom);
  grads.mainText={on:true,c1:'#FFD700',c2:'#FF8C00'};
  colors.topText='#FFD700';colors.bottomText='#FFB300';
  document.getElementById('btn_mainText').style.background='linear-gradient(to right,#FFD700,#FF8C00)';
  document.getElementById('btn_topText').style.background='#FFD700';
  document.getElementById('btn_bottomText').style.background='#FFB300';
  generate();
}
function setKaoMode(on){
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
  ['dekoTop','topText','mainText','bottomText','kaomoji','dekoBottom'].forEach(f=>document.getElementById(f).value='');
  ['fontSize','sizeDekoTop','sizeTopText','sizeBottomText','sizeKaomoji','sizeDekoBottom'].forEach((f,i)=>document.getElementById(f).value=[60,12,14,14,16,12][i]);
  ['mainBold','mainItalic','topBold','topItalic','bottomBold','bottomItalic'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false;});
  currentFontStyle='normal';
  Object.keys(fieldFonts).forEach(f=>fieldFonts[f]='normal');
  document.querySelectorAll('[id^="font_"]').forEach(el=>el.classList.remove('on'));
  ['dekoTop','topText','mainText','bottomText','dekoBottom'].forEach(function(f){var el=document.getElementById('font_'+f+'_normal');if(el)el.classList.add('on');});
  lineOrder=DEFAULT_ORDER.slice();
  generate();
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

  const chars=code.length, bytes=new TextEncoder().encode(code).length;
  const cc=document.getElementById('charCount'),bc=document.getElementById('byteCount');
  cc.textContent=chars; bc.textContent=bytes;
  cc.className='cv '+(chars>240?'over-v':chars>210?'warn-v':'ok');
  bc.className='cv '+(bytes>255?'over-v':bytes>230?'warn-v':'ok');
  const bar=document.getElementById('counterBar');
  bar.className='tb-counter '+(chars>240||bytes>255?'over':chars>210||bytes>230?'warn':'');

  updateOptimizeTips(chars,bytes,lm,{dekoTop,topText,mainText:main,bottomText:bottom,kaomoji,dekoBottom});

  // preview
  const pms=Math.max(0.8,parseInt(size)/20)+'rem';
  const pvMain=document.getElementById('pvMain');
  function setMainStyle(el){
    if(grads.mainText.on){el.style.cssText=`font-family:var(--font-display);font-size:${pms};font-weight:700;background:linear-gradient(to right,${grads.mainText.c1},${grads.mainText.c2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text`;}
    else{el.style.cssText=`font-family:var(--font-display);font-size:${pms};font-weight:700;color:${colors.mainText}`;}
  }
  ['pvInlineRow','pvCompactRow','pvFramedBot','pvPyramidWrap'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
  const pDT=document.getElementById('pvDekoTop'),pTR=document.getElementById('pvTopRow'),pBT=document.getElementById('pvBottom'),pKA=document.getElementById('pvKaomoji'),pDB=document.getElementById('pvDekoBottom'),card=document.getElementById('previewCard');
  [pDT,pTR,pvMain,pBT,pKA,pDB].forEach(el=>el.style.display='');
  pDT.textContent=applyFont(dekoTop,fieldFonts.dekoTop); pDT.style.color=colors.dekoTop; pDT.style.fontSize=sd/14+'rem'; pDT.style.letterSpacing='4px';
  pTR.textContent=applyFont(topText,fieldFonts.topText); pTR.style.color=colors.topText; pTR.style.fontSize=st/14+'rem';
  pTR.style.fontWeight=topB?'700':''; pTR.style.fontStyle=topI?'italic':'';
  pvMain.textContent=applyFont(main,fieldFonts.mainText); setMainStyle(pvMain);
  pBT.textContent=applyFont(bottom,fieldFonts.bottomText); pBT.style.color=colors.bottomText; pBT.style.fontSize=sb/14+'rem';
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
    const up=document.createElement('span');up.className='pv-arr';up.textContent='▲';up.title='move up';
    if(idx===0) up.classList.add('disabled');
    else up.onclick=(e)=>{e.stopPropagation();swapInOrder(field,visibleList[idx-1]);};
    const dn=document.createElement('span');dn.className='pv-arr';dn.textContent='▼';dn.title='move down';
    if(idx===visibleList.length-1) dn.classList.add('disabled');
    else dn.onclick=(e)=>{e.stopPropagation();swapInOrder(field,visibleList[idx+1]);};
    const rm=document.createElement('span');rm.className='pv-arr pv-arr-rm';rm.textContent='✕';rm.title='remove line';
    rm.onclick=(e)=>{e.stopPropagation();if(field==='kaomoji'){setKaoMode(false);}else{setField(field,'');}};
    ctrl.appendChild(up);ctrl.appendChild(dn);ctrl.appendChild(rm);
    el.appendChild(ctrl);
  };
  DEFAULT_ORDER.forEach(f=>card.appendChild(pvMap[f])); // restore default DOM order first
  if(STACK_LAYOUTS.includes(currentLayout)){
    lineOrder.forEach(f=>card.appendChild(pvMap[f]));   // reorder by lineOrder
    const visible=lineOrder.filter(f=>pvMap[f].style.display!=='none');
    visible.forEach((f,idx)=>attachReorder(pvMap[f],f,visible,idx));
  }

  function mkS(text,css,fid){const s=document.createElement('span');s.textContent=text;s.style.cssText=css+';cursor:pointer;border-radius:4px;padding:2px 4px;transition:background .15s;';s.onmouseenter=()=>s.style.background='rgba(255,255,255,.05)';s.onmouseleave=()=>s.style.background='';s.onclick=()=>pvClick(fid);return s;}

  if(currentLayout==='inline'){
    [pDT,pTR,pvMain].forEach(el=>el.style.display='none');
    const row=document.createElement('div');row.id='pvInlineRow';row.style.cssText='display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:4px;';
    if(dekoTop)row.appendChild(mkS(applyFont(dekoTop,fieldFonts.dekoTop),`color:${colors.dekoTop};font-size:${sd/14}rem`,'dekoTop'));
    if(topText)row.appendChild(mkS(applyFont(topText,fieldFonts.topText),`color:${colors.topText};font-size:${st/14}rem`,'topText'));
    if(main)row.appendChild(mkS(applyFont(main,fieldFonts.mainText),`font-family:var(--font-display);font-size:${pms};font-weight:700;color:${colors.mainText}`,'mainText'));
    if(dekoTop)row.appendChild(mkS(applyFont(dekoTop,fieldFonts.dekoTop),`color:${colors.dekoTop};font-size:${sd/14}rem`,'dekoTop'));
    card.insertBefore(row,pBT);
  }
  if(currentLayout==='compact'){
    [pDT,pTR,pvMain,pBT].forEach(el=>el.style.display='none');
    const row=document.createElement('div');row.id='pvCompactRow';row.style.cssText='display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:4px;';
    if(topText){row.appendChild(mkS(applyFont(topText,fieldFonts.topText),`color:${colors.topText};font-size:${st/14}rem`,'topText'));const d=document.createElement('span');d.textContent='·';d.style.color='#444';row.appendChild(d);}
    if(main)row.appendChild(mkS(applyFont(main,fieldFonts.mainText),`font-family:var(--font-display);font-size:${pms};font-weight:700;color:${colors.mainText}`,'mainText'));
    if(bottom){const d=document.createElement('span');d.textContent='·';d.style.color='#444';row.appendChild(d);row.appendChild(mkS(applyFont(bottom,fieldFonts.bottomText),`color:${colors.bottomText};font-size:${sb/14}rem`,'bottomText'));}
    card.insertBefore(row,pDT.nextSibling);
  }
  if(currentLayout==='framed'){
    pDB.style.display='none';
    const b=document.createElement('div');b.id='pvFramedBot';b.textContent=applyFont(dekoTop||dekoBottom,fieldFonts.dekoTop);
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
    const buildPyramidLine={
      dekoTop:    ()=> dekoTop ? mkPL('* '+applyFont(dekoTop,fieldFonts.dekoTop)+' *',`color:${colors.dekoTop};font-size:${sd/14}rem`,'dekoTop','0') : null,
      topText:    ()=> topText ? mkPL('* '+applyFont(topText,fieldFonts.topText)+' *',`color:${colors.topText};font-size:${st/14}rem`,'topText','2rem') : null,
      bottomText: ()=> bottom ? mkPL('* '+applyFont(bottom,fieldFonts.bottomText)+' *',`color:${colors.bottomText};font-size:${sb/14}rem`,'bottomText','7.5rem') : null,
      mainText:   ()=>{
        if(!main) return null;
        const d=document.createElement('div');d.style.cssText='text-align:center;margin-top:8px;margin-bottom:3px;';
        const s=document.createElement('span');s.textContent=applyFont(main,fieldFonts.mainText);
        if(grads.mainText.on)s.style.cssText=`font-family:var(--font-display);font-size:${pms};font-weight:700;background:linear-gradient(to right,${grads.mainText.c1},${grads.mainText.c2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;cursor:pointer;`;
        else s.style.cssText=`font-family:var(--font-display);font-size:${pms};font-weight:700;color:${colors.mainText};cursor:pointer;`;
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
}

function copyCode(){
  const text=document.getElementById('outputBox').textContent;
  navigator.clipboard?.writeText(text).then(()=>{flashCopy();}).catch(()=>{legacyCopy(text);});
  function legacyCopy(t){const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0;';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);flashCopy();}
  function flashCopy(){const btn=document.querySelector('.btn-copy');btn.textContent=t('copied');setTimeout(()=>btn.textContent=t('copy_code'),2000);}
}

// ── optimization tips ──
function fieldLabel(f){return t('fl_'+f, f);}
function updateOptimizeTips(chars,bytes,lm,raw){
  const panel=document.getElementById('optimizeTips');
  const header=document.getElementById('optHeader');
  const list=document.getElementById('optList');
  if(chars<185){panel.style.display='none';return;}
  panel.style.display='block';
  panel.className='opt-panel '+(chars>240?'over-state':chars>210?'warn-state':'');
  const tips=[];

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
  if(chars>220&&currentLayout!=='minimal'&&currentLayout!=='compact') tips.push({lvl:'tip',msg:t('opt_layout')});

  // ── ACTION tips: one-click removal to save space ──
  if(chars>210){
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
  header.textContent=chars>240?t('opt_over'):chars>210?t('opt_warn'):t('opt_info');
  header.style.color=chars>240?'var(--red)':chars>210?'var(--orange)':'var(--subtle)';

  // render list
  list.innerHTML='';
  tips.forEach(tip=>{
    const item=document.createElement('div');
    if(tip.lvl==='action'){
      item.className='opt-item opt-act';
      item.style.color='var(--pink)';
      item.innerHTML=`<span class="opt-icon">✕</span><span>${tip.msg}</span><span class="opt-act-btn">${t('opt_remove')}</span>`;
      item.onclick=()=>{
        if(tip.field==='kaomoji') setKaoMode(false);
        else { setField(tip.field,''); generate(); }
      };
    } else {
      item.className='opt-item';
      const icon=tip.lvl==='warn'?'⚠':tip.lvl==='info'?'→':'·';
      const col=tip.lvl==='warn'?'var(--orange)':tip.lvl==='info'?'var(--purple)':'var(--muted)';
      item.style.color=col;
      item.innerHTML=`<span class="opt-icon">${icon}</span><span>${tip.msg}</span>`;
    }
    list.appendChild(item);
  });
}

document.querySelectorAll('input[type="text"],input[type="number"]').forEach(el=>el.addEventListener('input',generate));
generate();
