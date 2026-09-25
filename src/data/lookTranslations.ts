import { ROMANTIC_LOOKS } from './romanticLooks';

type Translation = [id: string, label: string, hint: string];
const entries = (rows: Translation[]): Record<string, string> => Object.fromEntries(rows.flatMap(([id, label, hint]) => [
  ['look_' + id, label], ['look_' + id + '_h', hint],
]));

export const LOOK_TRANSLATIONS = {
  de: entries(ROMANTIC_LOOKS.map(l => [l.id, l.label, l.hint])),
  en: entries([
    ['heartSmile', 'Floral Band', 'A row of flowers above a large pink headline'],
    ['sweetTemptation', 'Afterglow', 'Large white lettering followed by a pink accent'],
    ['homeIsYou', 'Arrow Focus', 'White arrows frame the pink centrepiece'],
    ['sneakyHeart', 'Interlude', 'A small coloured aside followed by a larger highlight'],
    ['littleDetour', 'Word Bridge', 'An arrow connects two lines with highlighted words'],
    ['happyPlace', 'Floral Frame', 'Two pink lines framed by decorative symbols'],
    ['favoriteTrouble', 'Floral Band · Compact', 'A floral header and a large word with a smaller introduction'],
    ['alwaysYou', 'Arrow Focus · Mini', 'Arrows around the main word with a small face underneath'],
    ['stolenHeart', 'Interlude · Exclamation', 'A colourful exclamation before the large main line'],
    ['littleMagic', 'Afterglow · Finale', 'Large white lettering with a pink word at the end'],
    ['oneMoreKiss', 'Floral Frame · Steps', 'Two coloured lines grow in size within a decorative frame'],
    ['bestDetour', 'Word Bridge · Contrast', 'Large words inside small text, linked by an arrow'],
    ['flyingHug', 'Heart Band', 'A small pink heart above the main line and a face below'],
    ['guiltyCute', 'Vertical', 'A downward arrow leads from one coloured line to the next'],
  ]),
  fr: entries([
    ['heartSmile', 'Bande fleurie', 'Une rangée de fleurs au-dessus du grand texte rose'],
    ['sweetTemptation', 'Rémanence', 'De grandes lettres blanches suivies d’une touche de rose'],
    ['homeIsYou', 'Cœur de flèches', 'Des flèches blanches encadrent le texte rose central'],
    ['sneakyHeart', 'Interlude', 'Une petite parenthèse colorée suivie d’un grand mot mis en valeur'],
    ['littleDetour', 'Pont de mots', 'Une flèche relie deux lignes aux mots mis en valeur'],
    ['happyPlace', 'Cadre fleuri', 'Deux lignes roses encadrées de symboles décoratifs'],
    ['favoriteTrouble', 'Bande fleurie · Compacte', 'Des fleurs et un grand mot précédé d’une petite introduction'],
    ['alwaysYou', 'Cœur de flèches · Mini', 'Des flèches autour du mot principal et un petit visage en dessous'],
    ['stolenHeart', 'Interlude · Exclamation', 'Une exclamation colorée avant la grande ligne principale'],
    ['littleMagic', 'Rémanence · Finale', 'De grandes lettres blanches et un mot rose en fin de phrase'],
    ['oneMoreKiss', 'Cadre fleuri · Paliers', 'Deux lignes colorées de taille croissante dans un cadre décoratif'],
    ['bestDetour', 'Pont de mots · Contraste', 'De grands mots dans un petit texte, reliés par une flèche'],
    ['flyingHug', 'Bande de cœurs', 'Un petit cœur rose au-dessus du texte et un visage en dessous'],
    ['guiltyCute', 'Verticale', 'Une flèche descendante relie les deux lignes colorées'],
  ]),
  ru: entries([
    ['heartSmile', 'Цветочная лента', 'Ряд цветов над крупной розовой надписью'],
    ['sweetTemptation', 'Послесвечение', 'Крупные белые буквы и розовый акцент под ними'],
    ['homeIsYou', 'В центре стрелок', 'Белые стрелки обрамляют главную розовую надпись'],
    ['sneakyHeart', 'Интерлюдия', 'Небольшая цветная вставка перед крупным акцентом'],
    ['littleDetour', 'Мост слов', 'Стрелка соединяет две строки с выделенными словами'],
    ['happyPlace', 'Цветочная рамка', 'Две розовые строки в обрамлении декоративных символов'],
    ['favoriteTrouble', 'Цветочная лента · Компакт', 'Цветы и крупное слово с небольшим вступлением'],
    ['alwaysYou', 'В центре стрелок · Мини', 'Стрелки вокруг главного слова и маленькая мордочка внизу'],
    ['stolenHeart', 'Интерлюдия · Восклицание', 'Цветное восклицание перед крупной основной строкой'],
    ['littleMagic', 'Послесвечение · Финал', 'Крупные белые буквы и розовое слово в конце фразы'],
    ['oneMoreKiss', 'Цветочная рамка · Ступени', 'Две цветные строки увеличиваются внутри декоративной рамки'],
    ['bestDetour', 'Мост слов · Контраст', 'Крупные слова внутри мелкого текста, соединённые стрелкой'],
    ['flyingHug', 'Лента с сердцем', 'Маленькое розовое сердце над текстом и мордочка внизу'],
    ['guiltyCute', 'Вертикаль', 'Стрелка вниз ведёт от одной цветной строки к другой'],
  ]),
};
