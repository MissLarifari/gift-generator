import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// UI language support — EN/DE/FR/RU. Strings ported verbatim from the legacy
// generator's I18N block, plus a handful of React-specific keys (g_*).
// NOTE: template phrases stay English (the legacy tool only had TEMPLATES.en);
// this only translates the surrounding UI chrome. The generated 3dx code is
// language-independent, so byte-identity is unaffected.

export type Lang = 'en' | 'de' | 'fr' | 'ru';
export const LANGS: Lang[] = ['en', 'de', 'fr', 'ru'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Val = string | ((...args: any[]) => string);
type Dict = Record<string, Val>;

export const I18N: Record<Lang, Dict> = {
  en: {
    chars: 'Chars', bytes: 'Bytes',
    howto_title: 'How It Works',
    layout: 'Layout',
    layout_center: 'Center', layout_inline: 'Inline', layout_compact: 'Compact',
    layout_framed: 'Framed', layout_minimal: 'Minimal', layout_pyramid: 'Pyramid', layout_sparkle: 'Sparkle', layout_heart: 'Heart',
    layout_flipped: 'Flipped', layout_custom: 'Custom',
    reset_all: 'Reset All',
    size: 'Size', plus_symbol: '+ Symbol', kaomoji: 'Kaomoji',
    preview: 'Preview', click_edit: 'Click to edit',
    copy_code: 'Copy Code', copied: 'Copied!', copy_blocked: 'Too long to copy',
    reorder_btn: 'Reorder', reorder_done: 'Done',
    undo_title: 'Undo last action (Ctrl+Z)', redo_title: 'Redo (Ctrl+Y)',
    fl_dekoTop: 'Deco Top', fl_topText: 'Top Line', fl_mainText: 'Main Text',
    fl_bottomText: 'Bottom Line', fl_kaomoji: 'Kaomoji', fl_dekoBottom: 'Deco Bottom',
    pyr_dekoTop: 'Star 1', pyr_dekoBottom: 'Star 2', pyr_bottomText: 'Star 3', pyr_topText: 'Top Text', pyr_mainText: 'Bottom Text', pyr_kaomoji: 'Extra',
    opt_over: 'Over the limit — shorten your message',
    opt_warn: 'Getting long — optimization hints',
    opt_info: 'Optimization hints',
    opt_grad: (f: string, o: number, w: number) => `Gradient on ${f} adds ~${o} extra chars (${w} word${w > 1 ? 's' : ''})`,
    opt_longest: (f: string, n: number) => `${f} is your longest section — ${n} chars`,
    opt_deko_top_long: 'Deco Top is very long — try shortening it',
    opt_deko_bot_long: 'Deco Bottom is very long — try shortening it',
    opt_kao_long: (n: number) => `Kaomoji is quite long (${n} chars)`,
    opt_kao_grad: (n: number) => `Kaomoji + gradient${n > 1 ? 's' : ''} together may exceed the limit`,
    opt_dup_deko: 'Try removing duplicate symbols in Deco Top',
    opt_layout: 'Try switching to Compact or Minimal layout to save chars',
    opt_rm_kao: (n: number) => `Remove Kaomoji — saves ~${n} chars`,
    opt_rm_dt: (n: number) => `Remove Deco Top — saves ~${n} chars`,
    opt_rm_db: (n: number) => `Remove Deco Bottom — saves ~${n} chars`,
    opt_rm_font: (f: string, n: number) => `Fancy font on ${f} adds ~${n} extra bytes — switch to normal to fit`,
    opt_remove: 'remove', opt_switch: 'switch',
    // React-specific
    g_step_pick: 'Pick a template on the right',
    g_step_edit: 'Tweak text & deco on the left',
    g_step_copy: '“Copy code” → paste in 3dxchat',
    g_open_main: 'Open main text',
    g_lines: 'Lines', g_empty: 'empty', g_text_ph: 'Text…', g_pick_deco: 'Pick deco',
    g_collapse_all: 'Collapse all', g_expand_all: 'Expand all',
    g_disclaimer: 'No liability for errors, bugs or character-limit issues — use at your own risk. All texts are suggestions.',
    g_tab_templates: 'Templates', g_tab_edit: 'Edit',
    g_search_ph: 'Search phrases…', g_hits: 'results', g_favorites: 'Favorites',
    g_link_copied: 'Link copied', g_too_long: 'Too long', g_share: 'Share', g_reset: 'Reset', g_budget: 'Budget',
    g_grp_themes: 'Themes', g_grp_vibes: 'Vibes', g_grp_holidays: 'Holidays', g_grp_celebrations: 'Celebrations',
    g_color: 'Color', g_solid: 'Solid', gradient: 'Gradient', g_from: 'From', g_to: 'To',
    g_no_color: 'No color tag', g_saves_chars: '· saves chars', apply: 'Apply', cancel: 'Cancel', g_line: 'Line',
    g_custom_code: 'Custom Code', g_custom_ph: 'Type or paste your gift code here…\nSelect text and format it with the toolbar.',
    g_custom_hint: 'Select text → the toolbar formats the selection. The code is your gift, 1:1.',
    g_customize: 'Customize', g_tab_text: 'Text', g_tab_deco: 'Deco', g_tab_colors: 'Colors',
    g_quick_actions: 'Quick actions', g_randomize: 'Randomize', g_clear_all: 'Clear all', g_import: 'Import', g_export: 'Export',
    g_tip: 'Keep within 255 bytes for 3DXChat.', g_none: '(none)', g_per_line: 'Per line',
    g_import_prompt: 'Paste a Gifty share link or code:', g_import_fail: 'Could not read that link.', g_link_copied2: 'Link copied!',
    // 2026 UI redesign
    g_search_gifts: 'Search gifts…', g_all: 'All', g_more: 'More',
    g_sec_text: 'Text', g_sec_style: 'Style', g_sec_deco: 'Decoration', g_sec_layout: 'Layout',
    g_deco_clear: 'Remove all decorations', g_deco_clear_hint: 'Words only — clears deco top, kaomoji and deco bottom',
    g_style_target: 'Applies to', g_font: 'Font', g_font_size: 'Font size',
    g_copy_gift: 'Copy Gift', g_characters: 'characters', g_bytes_short: 'bytes',
    g_optimize: 'Optimize', g_opt_none: 'Nothing to optimize yet.',
    g_about: 'About', g_supporters: 'Supporters', g_links: 'Links', g_close: 'Close',
    g_intro_title: 'Welcome to Gifty',
    g_intro_1: 'Pick a template', g_intro_2: 'Customize', g_intro_3: 'Copy to 3DXChat',
    g_update_title: 'Update on the way',
    g_update_text: 'A bigger update with new features is coming. Uploading it all takes a while, so it may not be here just yet.',
    g_got_it: 'Got it', g_language: 'Language', g_help: 'Help & credits',
    g_made_by: 'made with ♥ by Lari', g_and_more: '… and many more',
    g_profile_editor: 'Profile Editor',
  },
  de: {
    chars: 'Zeichen', bytes: 'Bytes',
    howto_title: "So geht's",
    layout: 'Layout',
    layout_center: 'Zentriert', layout_inline: 'Inline', layout_compact: 'Kompakt',
    layout_framed: 'Mit Rahmen', layout_minimal: 'Minimal', layout_pyramid: 'Pyramide', layout_sparkle: 'Glitzer', layout_heart: 'Herz',
    layout_flipped: 'Gedreht', layout_custom: 'Eigenes',
    reset_all: 'Alles zurücksetzen',
    size: 'Größe', plus_symbol: '+ Symbol', kaomoji: 'Kaomoji',
    preview: 'Vorschau', click_edit: 'Zum Bearbeiten klicken',
    copy_code: 'Code kopieren', copied: 'Kopiert!', copy_blocked: 'Zu lang zum Kopieren',
    reorder_btn: 'Anordnen', reorder_done: 'Fertig',
    undo_title: 'Letzte Aktion rückgängig machen (Strg+Z)', redo_title: 'Wiederholen (Strg+Y)',
    fl_dekoTop: 'Deko oben', fl_topText: 'Obere Zeile', fl_mainText: 'Haupttext',
    fl_bottomText: 'Untere Zeile', fl_kaomoji: 'Kaomoji', fl_dekoBottom: 'Deko unten',
    pyr_dekoTop: 'Stern 1', pyr_dekoBottom: 'Stern 2', pyr_bottomText: 'Stern 3', pyr_topText: 'Text oben', pyr_mainText: 'Text unten', pyr_kaomoji: 'Extra',
    opt_over: 'Über dem Limit — kürz deine Nachricht',
    opt_warn: 'Wird lang — Optimierungs-Tipps',
    opt_info: 'Optimierungs-Tipps',
    opt_grad: (f: string, o: number, w: number) => `Verlauf auf ${f} kostet ~${o} Extra-Zeichen (${w} Wort${w > 1 ? 'e' : ''})`,
    opt_longest: (f: string, n: number) => `${f} ist dein längster Abschnitt — ${n} Zeichen`,
    opt_deko_top_long: 'Deko oben ist sehr lang — versuch sie zu kürzen',
    opt_deko_bot_long: 'Deko unten ist sehr lang — versuch sie zu kürzen',
    opt_kao_long: (n: number) => `Kaomoji ist ziemlich lang (${n} Zeichen)`,
    opt_kao_grad: (n: number) => `Kaomoji + Verlauf${n > 1 ? 'e' : ''} zusammen sprengen schnell das Limit`,
    opt_dup_deko: 'Doppelte Symbole in Deko oben entfernen spart Zeichen',
    opt_layout: 'Wechsle zum Layout Kompakt oder Minimal, um Zeichen zu sparen',
    opt_rm_kao: (n: number) => `Kaomoji entfernen — spart ~${n} Zeichen`,
    opt_rm_dt: (n: number) => `Deko oben entfernen — spart ~${n} Zeichen`,
    opt_rm_db: (n: number) => `Deko unten entfernen — spart ~${n} Zeichen`,
    opt_rm_font: (f: string, n: number) => `Sonderschrift auf ${f} braucht ~${n} Extra-Bytes — wechsle zu Normal`,
    opt_remove: 'entfernen', opt_switch: 'wechseln',
    g_step_pick: 'Vorlage rechts wählen',
    g_step_edit: 'Text & Deko links anpassen',
    g_step_copy: '„Code kopieren" → in 3dxchat einfügen',
    g_open_main: 'Haupttext öffnen',
    g_lines: 'Zeilen', g_empty: 'leer', g_text_ph: 'Text…', g_pick_deco: 'Deko wählen',
    g_collapse_all: 'Alles einklappen', g_expand_all: 'Alle ausklappen',
    g_disclaimer: 'Keine Haftung für Fehler, Bugs oder Zeichenlimit-Probleme — Nutzung auf eigene Gefahr. Alle Texte sind nur Vorschläge.',
    g_tab_templates: 'Vorlagen', g_tab_edit: 'Bearbeiten',
    g_search_ph: 'Sprüche suchen…', g_hits: 'Treffer', g_favorites: 'Favoriten',
    g_link_copied: 'Link kopiert', g_too_long: 'Zu lang', g_share: 'Teilen', g_reset: 'Reset', g_budget: 'Budget',
    g_grp_themes: 'Themen', g_grp_vibes: 'Vibes', g_grp_holidays: 'Feiertage', g_grp_celebrations: 'Anlässe',
    g_color: 'Farbe', g_solid: 'Einfarbig', gradient: 'Verlauf', g_from: 'Von', g_to: 'Bis',
    g_no_color: 'Kein Farb-Tag', g_saves_chars: '· spart Zeichen', apply: 'Übernehmen', cancel: 'Abbrechen', g_line: 'Linie',
    g_custom_code: 'Eigener Code', g_custom_ph: 'Code hier eintippen oder einfügen…\nText markieren und mit der Toolbar formatieren.',
    g_custom_hint: 'Text markieren → Toolbar formatiert die Auswahl. Der Code ist 1:1 das Geschenk.',
    g_customize: 'Anpassen', g_tab_text: 'Text', g_tab_deco: 'Deko', g_tab_colors: 'Farben',
    g_quick_actions: 'Schnellaktionen', g_randomize: 'Zufall', g_clear_all: 'Alles löschen', g_import: 'Import', g_export: 'Export',
    g_tip: 'Bleib unter 255 Bytes für 3DXChat.', g_none: '(keine)', g_per_line: 'Pro Zeile',
    g_import_prompt: 'Gifty-Link oder -Code einfügen:', g_import_fail: 'Konnte den Link nicht lesen.', g_link_copied2: 'Link kopiert!',
    g_search_gifts: 'Geschenke suchen…', g_all: 'Alle', g_more: 'Mehr',
    g_sec_text: 'Text', g_sec_style: 'Stil', g_sec_deco: 'Dekoration', g_sec_layout: 'Layout',
    g_deco_clear: 'Alle Dekos entfernen', g_deco_clear_hint: 'Nur Worte — leert Deko oben, Kaomoji und Deko unten',
    g_style_target: 'Gilt für', g_font: 'Schrift', g_font_size: 'Schriftgröße',
    g_copy_gift: 'Geschenk kopieren', g_characters: 'Zeichen', g_bytes_short: 'Bytes',
    g_optimize: 'Optimieren', g_opt_none: 'Noch nichts zu optimieren.',
    g_about: 'Über', g_supporters: 'Unterstützer', g_links: 'Links', g_close: 'Schließen',
    g_intro_title: 'Willkommen bei Gifty',
    g_intro_1: 'Vorlage wählen', g_intro_2: 'Anpassen', g_intro_3: 'In 3DXChat einfügen',
    g_update_title: 'Update ist unterwegs',
    g_update_text: 'Ein größeres Update mit neuen Funktionen kommt. Bis alles hochgeladen ist, dauert es noch etwas.',
    g_got_it: 'Alles klar', g_language: 'Sprache', g_help: 'Hilfe & Credits',
    g_made_by: 'made with ♥ by Lari', g_and_more: '… und viele mehr',
    g_profile_editor: 'Profil-Editor',
  },
  fr: {
    chars: 'Caractères', bytes: 'Octets',
    howto_title: 'Comment ça marche',
    layout: 'Disposition',
    layout_center: 'Centré', layout_inline: 'En ligne', layout_compact: 'Compact',
    layout_framed: 'Encadré', layout_minimal: 'Minimal', layout_pyramid: 'Pyramide', layout_sparkle: 'Paillettes', layout_heart: 'Cœur',
    layout_flipped: 'Renversé', layout_custom: 'Perso',
    reset_all: 'Tout réinitialiser',
    size: 'Taille', plus_symbol: '+ Symbole', kaomoji: 'Kaomoji',
    preview: 'Aperçu', click_edit: 'Cliquer pour modifier',
    copy_code: 'Copier le code', copied: 'Copié !', copy_blocked: 'Trop long pour copier',
    reorder_btn: 'Réordonner', reorder_done: 'Terminé',
    undo_title: 'Annuler la dernière action (Ctrl+Z)', redo_title: 'Refaire (Ctrl+Y)',
    fl_dekoTop: 'Déco haut', fl_topText: 'Ligne haut', fl_mainText: 'Texte principal',
    fl_bottomText: 'Ligne bas', fl_kaomoji: 'Kaomoji', fl_dekoBottom: 'Déco bas',
    pyr_dekoTop: 'Étoile 1', pyr_dekoBottom: 'Étoile 2', pyr_bottomText: 'Étoile 3', pyr_topText: 'Texte haut', pyr_mainText: 'Texte bas', pyr_kaomoji: 'Extra',
    opt_over: 'Au-dessus de la limite — raccourcis ton message',
    opt_warn: "Devient long — conseils d'optimisation",
    opt_info: "Conseils d'optimisation",
    opt_grad: (f: string, o: number, w: number) => `Dégradé sur ${f} ajoute ~${o} caractères en plus (${w} mot${w > 1 ? 's' : ''})`,
    opt_longest: (f: string, n: number) => `${f} est ta plus longue section — ${n} caractères`,
    opt_deko_top_long: 'Déco haut est très longue — essaie de la raccourcir',
    opt_deko_bot_long: 'Déco bas est très longue — essaie de la raccourcir',
    opt_kao_long: (n: number) => `Kaomoji est assez long (${n} caractères)`,
    opt_kao_grad: (n: number) => `Kaomoji + dégradé${n > 1 ? 's' : ''} ensemble peuvent dépasser la limite`,
    opt_dup_deko: 'Essaie de retirer les symboles dupliqués dans Déco haut',
    opt_layout: 'Passe à la disposition Compact ou Minimal pour économiser des caractères',
    opt_rm_kao: (n: number) => `Retirer Kaomoji — économise ~${n} caractères`,
    opt_rm_dt: (n: number) => `Retirer Déco haut — économise ~${n} caractères`,
    opt_rm_db: (n: number) => `Retirer Déco bas — économise ~${n} caractères`,
    opt_rm_font: (f: string, n: number) => `Police spéciale sur ${f} ajoute ~${n} octets en plus — passe à Normal`,
    opt_remove: 'retirer', opt_switch: 'changer',
    g_step_pick: 'Choisis un modèle à droite',
    g_step_edit: 'Ajuste le texte et la déco à gauche',
    g_step_copy: '« Copier le code » → colle dans 3dxchat',
    g_open_main: 'Ouvrir le texte principal',
    g_lines: 'Lignes', g_empty: 'vide', g_text_ph: 'Texte…', g_pick_deco: 'Choisir la déco',
    g_collapse_all: 'Tout replier', g_expand_all: 'Tout déplier',
    g_disclaimer: 'Aucune responsabilité pour les erreurs, bugs ou problèmes de limite — à tes risques. Tous les textes sont des suggestions.',
    g_tab_templates: 'Modèles', g_tab_edit: 'Éditer',
    g_search_ph: 'Rechercher…', g_hits: 'résultats', g_favorites: 'Favoris',
    g_link_copied: 'Lien copié', g_too_long: 'Trop long', g_share: 'Partager', g_reset: 'Reset', g_budget: 'Budget',
    g_grp_themes: 'Thèmes', g_grp_vibes: 'Vibes', g_grp_holidays: 'Fêtes', g_grp_celebrations: 'Célébrations',
    g_color: 'Couleur', g_solid: 'Uni', gradient: 'Dégradé', g_from: 'De', g_to: 'À',
    g_no_color: 'Pas de couleur', g_saves_chars: '· économise', apply: 'Appliquer', cancel: 'Annuler', g_line: 'Ligne',
    g_custom_code: 'Code perso', g_custom_ph: 'Tape ou colle ton code cadeau ici…\nSélectionne du texte et formate-le avec la barre d\'outils.',
    g_custom_hint: 'Sélectionne du texte → la barre formate la sélection. Le code est ton cadeau tel quel.',
    g_customize: 'Personnaliser', g_tab_text: 'Texte', g_tab_deco: 'Déco', g_tab_colors: 'Couleurs',
    g_quick_actions: 'Actions rapides', g_randomize: 'Aléatoire', g_clear_all: 'Tout effacer', g_import: 'Importer', g_export: 'Exporter',
    g_tip: 'Reste sous 255 octets pour 3DXChat.', g_none: '(aucune)', g_per_line: 'Par ligne',
    g_import_prompt: 'Colle un lien ou code Gifty :', g_import_fail: 'Impossible de lire ce lien.', g_link_copied2: 'Lien copié !',
    g_search_gifts: 'Rechercher des cadeaux…', g_all: 'Tous', g_more: 'Plus',
    g_sec_text: 'Texte', g_sec_style: 'Style', g_sec_deco: 'Décoration', g_sec_layout: 'Disposition',
    g_deco_clear: 'Retirer toute la déco', g_deco_clear_hint: 'Mots seulement — vide déco haut, kaomoji et déco bas',
    g_style_target: "S'applique à", g_font: 'Police', g_font_size: 'Taille',
    g_copy_gift: 'Copier le cadeau', g_characters: 'caractères', g_bytes_short: 'octets',
    g_optimize: 'Optimiser', g_opt_none: 'Rien à optimiser pour le moment.',
    g_about: 'À propos', g_supporters: 'Soutiens', g_links: 'Liens', g_close: 'Fermer',
    g_intro_title: 'Bienvenue sur Gifty',
    g_intro_1: 'Choisis un modèle', g_intro_2: 'Personnalise', g_intro_3: 'Colle dans 3DXChat',
    g_update_title: 'Mise à jour en route',
    g_update_text: 'Une mise à jour avec de nouvelles fonctions arrive. Le téléversement complet prend un peu de temps.',
    g_got_it: 'Compris', g_language: 'Langue', g_help: 'Aide & crédits',
    g_made_by: 'made with ♥ by Lari', g_and_more: '… et bien d’autres',
    g_profile_editor: 'Éditeur de profil',
  },
  ru: {
    chars: 'Знаки', bytes: 'Байты',
    howto_title: 'Как это работает',
    layout: 'Макет',
    layout_center: 'Центр', layout_inline: 'Строка', layout_compact: 'Компактный',
    layout_framed: 'Рамка', layout_minimal: 'Минимал', layout_pyramid: 'Пирамида', layout_sparkle: 'Блёстки', layout_heart: 'Сердце',
    layout_flipped: 'Перевёрнутый', layout_custom: 'Своё',
    reset_all: 'Сбросить всё',
    size: 'Размер', plus_symbol: '+ Символ', kaomoji: 'Каомодзи',
    preview: 'Предпросмотр', click_edit: 'Нажми, чтобы редактировать',
    copy_code: 'Скопировать код', copied: 'Скопировано!', copy_blocked: 'Слишком длинно',
    reorder_btn: 'Порядок', reorder_done: 'Готово',
    undo_title: 'Отменить последнее действие (Ctrl+Z)', redo_title: 'Повторить (Ctrl+Y)',
    fl_dekoTop: 'Декор сверху', fl_topText: 'Верхняя строка', fl_mainText: 'Основной текст',
    fl_bottomText: 'Нижняя строка', fl_kaomoji: 'Каомодзи', fl_dekoBottom: 'Декор снизу',
    pyr_dekoTop: 'Звезда 1', pyr_dekoBottom: 'Звезда 2', pyr_bottomText: 'Звезда 3', pyr_topText: 'Текст сверху', pyr_mainText: 'Текст снизу', pyr_kaomoji: 'Доп.',
    opt_over: 'Превышен лимит — сократи сообщение',
    opt_warn: 'Становится длинным — советы по оптимизации',
    opt_info: 'Советы по оптимизации',
    opt_grad: (f: string, o: number, w: number) => `Градиент на ${f} добавляет ~${o} лишних знаков (${w} слов${w === 1 ? 'о' : w < 5 ? 'а' : ''})`,
    opt_longest: (f: string, n: number) => `${f} — твоя самая длинная секция, ${n} знаков`,
    opt_deko_top_long: 'Декор сверху очень длинный — попробуй сократить',
    opt_deko_bot_long: 'Декор снизу очень длинный — попробуй сократить',
    opt_kao_long: (n: number) => `Каомодзи довольно длинный (${n} знаков)`,
    opt_kao_grad: (n: number) => `Каомодзи + градиент${n > 1 ? 'ы' : ''} вместе могут превысить лимит`,
    opt_dup_deko: 'Попробуй убрать повторяющиеся символы в Декоре сверху',
    opt_layout: 'Переключись на макет Компактный или Минимал, чтобы сэкономить знаки',
    opt_rm_kao: (n: number) => `Убрать Каомодзи — экономит ~${n} знаков`,
    opt_rm_dt: (n: number) => `Убрать Декор сверху — экономит ~${n} знаков`,
    opt_rm_db: (n: number) => `Убрать Декор снизу — экономит ~${n} знаков`,
    opt_rm_font: (f: string, n: number) => `Спецшрифт на ${f} добавляет ~${n} лишних байтов — переключи на Обычный`,
    opt_remove: 'убрать', opt_switch: 'сменить',
    g_step_pick: 'Выбери шаблон справа',
    g_step_edit: 'Подправь текст и декор слева',
    g_step_copy: '«Скопировать код» → вставь в 3dxchat',
    g_open_main: 'Открыть основной текст',
    g_lines: 'Строки', g_empty: 'пусто', g_text_ph: 'Текст…', g_pick_deco: 'Выбрать декор',
    g_collapse_all: 'Свернуть всё', g_expand_all: 'Развернуть всё',
    g_disclaimer: 'Без ответственности за ошибки, баги или проблемы с лимитом — на свой страх и риск. Все тексты — лишь предложения.',
    g_tab_templates: 'Шаблоны', g_tab_edit: 'Править',
    g_search_ph: 'Поиск фраз…', g_hits: 'совпадений', g_favorites: 'Избранное',
    g_link_copied: 'Ссылка скопирована', g_too_long: 'Длинно', g_share: 'Поделиться', g_reset: 'Сброс', g_budget: 'Бюджет',
    g_grp_themes: 'Темы', g_grp_vibes: 'Вайбы', g_grp_holidays: 'Праздники', g_grp_celebrations: 'Торжества',
    g_color: 'Цвет', g_solid: 'Один цвет', gradient: 'Градиент', g_from: 'От', g_to: 'До',
    g_no_color: 'Без цвета', g_saves_chars: '· экономит', apply: 'Применить', cancel: 'Отмена', g_line: 'Строка',
    g_custom_code: 'Свой код', g_custom_ph: 'Введи или вставь код подарка…\nВыдели текст и форматируй через панель.',
    g_custom_hint: 'Выдели текст → панель форматирует выделение. Код — это твой подарок 1:1.',
    g_customize: 'Настройка', g_tab_text: 'Текст', g_tab_deco: 'Декор', g_tab_colors: 'Цвета',
    g_quick_actions: 'Быстрые действия', g_randomize: 'Случайно', g_clear_all: 'Очистить всё', g_import: 'Импорт', g_export: 'Экспорт',
    g_tip: 'Не превышай 255 байт для 3DXChat.', g_none: '(нет)', g_per_line: 'По строкам',
    g_import_prompt: 'Вставь ссылку или код Gifty:', g_import_fail: 'Не удалось прочитать ссылку.', g_link_copied2: 'Ссылка скопирована!',
    g_search_gifts: 'Поиск подарков…', g_all: 'Все', g_more: 'Ещё',
    g_sec_text: 'Текст', g_sec_style: 'Стиль', g_sec_deco: 'Декор', g_sec_layout: 'Макет',
    g_deco_clear: 'Убрать все украшения', g_deco_clear_hint: 'Только слова — очищает декор сверху, каомодзи и декор снизу',
    g_style_target: 'Применить к', g_font: 'Шрифт', g_font_size: 'Размер',
    g_copy_gift: 'Скопировать подарок', g_characters: 'знаков', g_bytes_short: 'байт',
    g_optimize: 'Оптимизация', g_opt_none: 'Пока нечего оптимизировать.',
    g_about: 'О Gifty', g_supporters: 'Поддержка', g_links: 'Ссылки', g_close: 'Закрыть',
    g_intro_title: 'Добро пожаловать в Gifty',
    g_intro_1: 'Выбери шаблон', g_intro_2: 'Настрой', g_intro_3: 'Скопируй в 3DXChat',
    g_update_title: 'Обновление в пути',
    g_update_text: 'Готовится большое обновление с новыми функциями. Загрузка всего займёт некоторое время.',
    g_got_it: 'Понятно', g_language: 'Язык', g_help: 'Помощь и благодарности',
    g_made_by: 'made with ♥ by Lari', g_and_more: '… и многие другие',
    g_profile_editor: 'Редактор профиля',
  },
};

// Detect the visitor's preferred UI language from the browser; fall back to 'en'.
export function detectBrowserLang(): Lang {
  try {
    const cands: string[] = [];
    if (Array.isArray(navigator.languages)) cands.push(...navigator.languages);
    if (navigator.language) cands.push(navigator.language);
    for (const c of cands) {
      const code = String(c || '').toLowerCase().split('-')[0];
      if ((LANGS as string[]).includes(code)) return code as Lang;
    }
  } catch { /* ignore */ }
  return 'en';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Translate = (key: string, ...args: any[]) => string;

interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; t: Translate }
const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try { const s = localStorage.getItem('uiLang'); if (s && (LANGS as string[]).includes(s)) return s as Lang; } catch { /* ignore */ }
    return detectBrowserLang();
  });
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('uiLang', l); } catch { /* ignore */ }
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useCallback<Translate>((key: string, ...args: any[]) => {
    const v = (I18N[lang] && I18N[lang][key]) ?? I18N.en[key] ?? key;
    return typeof v === 'function' ? v(...args) : (v as string);
  }, [lang]);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useI18n must be used within I18nProvider');
  return c;
}
