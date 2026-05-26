// ── template data ──
// Each section: { icon, label, items:[[label,main,top,bottom]], open?, titleStyle?, bday?, chipExtra? }
//   icon  = name from ICONS in icons.js (rendered as <i class="fa-icon" data-icon="…">)
//   label = plain text title shown next to the icon
const TEMPLATES = {
  en: [
    { icon: 'candy',   label: 'Sweet', open: true, titleStyle: 'color:#ff9ec7;text-shadow:0 0 12px rgba(255,158,199,.3)', items: [
      ['stay close',      'stay close',           'please always',         '.. stay close to me ..'],
      ['feel safe',       'you make me feel safe','every single day',      '.. thank you for that ..'],
      ['so cute',         'so cute',              'you are honestly',      '.. i cant handle it ..'],
      ['hold my hand',    'hold my hand',         'promise me you will',   '.. and never let go ..'],
      ['my person',       'my person',            'you are',               '.. and always will be ..'],
      ['i like you',      'i like you',           'just so you know',      '.. a lot ..'],
      ['you and me',      'you and me',           'no matter what',        '.. forever ..'],
      ['i miss you',      'i miss you',           'more than you know',    '.. every single day ..'],
      ['thank you',       'thank you',            'for always being there','.. it means everything ..'],
      ['safe place',      'safe place',           'you are my',            '.. and i am yours ..'],
      ['forever us',      'forever us',           'always you and me',     '.. no matter what ..'],
    ]},
    { icon: 'face-smile', label: 'Funny', open: true, titleStyle: 'color:var(--purple);text-shadow:0 0 12px rgba(179,136,255,.3)', items: [
      ['i like you',     'i like you',     'even though you drive me','.. completely crazy ..'],
      ['you annoy me',   'you annoy me',   'but please',              '.. never ever stop ..'],
      ['only you',       'only you',       'are allowed to',          '.. drive me this crazy ..'],
      ['i hate you',     'i hate you',     'not really though',       '.. i love you ..'],
      ['its your fault', 'its your fault', 'that i smile',            '.. like an idiot all day ..'],
      ['send help',      'send help',      'i think about you',       '.. way too much ..'],
      ['stay away',      'stay away',      'just kidding',            '.. never leave ..'],
      ['too late',       'too late',       'youre already',           '.. stuck with me ..'],
      ['pookie wookie',  'pookie wookie',  'i hope your poo poo time','.. went well today ..'],
    ]},
    { icon: 'users', label: 'Friends', open: true, titleStyle: 'color:var(--green);text-shadow:0 0 12px rgba(126,200,126,.3)', items: [
      ['best friend',       'best friend',       'you are simply',     '.. the best ..'],
      ['we are a team',     'we are a team',     'always have been',   '.. and always will be ..'],
      ['without you',       'without you',       'everything would be','.. only half as fun ..'],
      ['you know me',       'you know me',       'better than anyone', '.. and i love that ..'],
      ['no drama',          'no drama',          'just us',            '.. and good vibes ..'],
      ['laughing with you', 'laughing with you', 'is honestly',        '.. the best thing ..'],
      ['hard to find',      'friends like you',  'are hard to find',   '.. so i am keeping you ..'],
      ['i miss us',         'i miss us',         'our little moments', '.. the best ones ..'],
    ]},
    { icon: 'heart', label: 'Flirty', open: true, titleStyle: 'color:#ff8fb3;text-shadow:0 0 12px rgba(255,143,179,.3)', items: [
      ['just us',    'just us',    'no one else',         '.. you and me ..'],
      ['kiss me',    'kiss me',    'please',              '.. just once ..'],
      ['dont go',    'dont go',    'please just',         '.. stay with me ..'],
      ['come here',  'come here',  'stop being so far',   '.. i need you close ..'],
      ['hold me',    'hold me',    'hold me tight',       '.. and dont let go ..'],
      ['too pretty', 'too pretty', 'you are honestly',    '.. its not fair ..'],
      ['mine',       'mine',       'you are',             '.. and you know it ..'],
      ['dangerous',  'dangerous',  'you are so',          '.. for my heart ..'],
      ['be mine',    'be mine',    'please just',         '.. say yes ..'],
    ]},
    { icon: 'fire', label: 'Dominant', open: true, titleStyle: 'color:#ff7a7a;text-shadow:0 0 12px rgba(255,77,77,.3)', chipExtra: 'red', items: [
      ['follow me',     'follow me',          'good girls follow rules',     '.. bad girls follow me ..'],
      ['lipstick',      'ruin your lipstick', 'i wanna',                     '.. not your life ..'],
      ['pin you',       'pinned to the wall', 'you talk cute for someone',   '.. who should be pinned ..'],
      ['i win',         'either way i win',   'behave or dont',              '.. i still win ..'],
      ['behave',        'where is the fun',   'i can behave but',            '.. honestly in that ..'],
    ]},
    { icon: 'kiss', label: 'Flirty bold', open: true, titleStyle: 'color:var(--pink);text-shadow:0 0 12px rgba(255,113,184,.3)', chipExtra: 'pink', items: [
      ['lingerie',      'walk by again',      'love at first sight or',      '.. should i walk by in lingerie ..'],
      ['so hot',        'so hot',             'you made my dirty thoughts',  '.. actually blush ..'],
      ['not flirting',  'just describing',    'im not flirting',             '.. what id do to you ..'],
      ['lonely lips',   'meet mine',          'your lips look lonely',       '.. want them to meet mine ..'],
      ['bad decisions', 'bad decisions',      'you bring out the',           '.. in me ..'],
      ['trouble',       'into that',          'you look like trouble',       '.. and im into it ..'],
      ['tonight',       'bad decisions',      'wanna make some',             '.. tonight ..'],
      ['no sleep',      'ruin my sleep',      'youre hot enough to',         '.. ruin my schedule ..'],
      ['tempted',       'already tempted',    'id flirt harder but',         '.. you look ready ..'],
      ['bad ideas',     'i bring bad ideas',  'you bring the body',          '.. i bring the rest ..'],
      ['distracting',   'dangerously',        'you are dangerously',         '.. distracting me ..'],
      ['your eyes',     'your eyes got me',   'no pickup line needed',       '.. already done ..'],
      ['next mistake',  'my next mistake',    'you look like',               '.. and i want it ..'],
      ['i bite',        'i bite back',        'careful baby',                '.. i bite back ..'],
      ['that look',     'that look',          'you had me at',               '.. just one look ..'],
      ['obsessed',      'but damn',           'not saying im obsessed',      '.. but damn ..'],
    ]},
    { icon: 'pepper', label: 'Spicy', open: true, titleStyle: 'color:#ffa566;text-shadow:0 0 12px rgba(255,165,102,.3)', chipExtra: 'spicy', items: [
      ['no innocence',  'impossible',         'you make innocent thoughts',  '.. completely impossible ..'],
      ['one kiss',      'both in trouble',    'one kiss and were',           '.. both in trouble ..'],
      ['fantasies',     'better than dreams', 'you look way better',         '.. than my fantasies ..'],
      ['temptation',    'cant ignore',        'youre the kind of',           '.. temptation i need ..'],
    ]},
    { icon: 'face-laugh', label: 'Funny / Chaotic', open: true, titleStyle: 'color:var(--gold);text-shadow:0 0 12px rgba(255,216,77,.2)', items: [
      ['annoying',         'annoying but cute',  'youre annoying',           '.. but kinda cute ..'],
      ['playing cool',     'then you appeared',  'i was playing it cool',    '.. then there was you ..'],
      ['owe me',           'you owe me',         'i dropped my drink',       '.. staring at you ..'],
      ['shampoo',          'shampoo guy',        'youre the reason',         '.. bottles have instructions ..'],
      ['pro disaster',     'professional',       'you flirt like a',         '.. pro disappointment ..'],
      ['unemployed',       'emotionally broke',  'id flirt but im',          '.. emotionally unemployed ..'],
      ['monday vibes',     'like a monday',      'nobody asked but',         '.. here you are ..'],
      ['mom warned',       'mom warned me',      'you look like trouble',    '.. she told me about ..'],
      ['magician',         'pure magic',         'everyone else just',       '.. disappeared ..'],
      ['lucky',            'lucky youre hot',    'youre very lucky',         '.. that youre hot ..'],
      ['us = chaos',       'great stories',      'you plus me equals',       '.. bad ideas only ..'],
      ['save money',       'broke vibes',        'id take you out but',      '.. im saving money ..'],
      ['red flag',         'favorite red flag',  'youre my',                 '.. fav red flag ever ..'],
      ['tiktok flirt',     'tiktok energy',      'you flirt like you',       '.. learned it from tiktok ..'],
      ['the problem',      'im the problem',     'id fix your issues',       '.. but im one ..'],
      ['weird',            'i like weird',       'youre weird and',          '.. i love that ..'],
    ]},
    { icon: 'skull', label: 'Friends / Roast', open: true, titleStyle: 'color:#cc6666;text-shadow:0 0 12px rgba(204,102,102,.25)', chipExtra: 'danger', items: [
      ['still single',     'explains a lot',     'still single huh',         '.. that explains stuff ..'],
      ['loading',          'loading screen',     'you flirt like a',         '.. broken loading bar ..'],
      ['life roasted',     'life did it',        'id roast you but',         '.. life already did ..'],
      ['zero taste',       'zero taste',         'cute for someone',         '.. with no taste at all ..'],
      ['grandma texter',   'texts like granny',  'confident for someone',    '.. who texts like a grandma ..'],
      ['no charger',       'not my charger',     'id trust you with my drink','.. but never my charger ..'],
      ['autocorrect',      'human typo',         'youre basically a',        '.. real life autocorrect fail ..'],
      ['exhausting',       'so exhausting',      'lucky im funny cause',     '.. youre exhausting ..'],
      ['always wrong',     'always wrong',       'you talk a lot for',       '.. always being wrong ..'],
      ['headache',         'my headache',        'youre my favorite',        '.. little headache ..'],
      ['npc energy',       'big npc energy',     'you got that',             '.. major npc vibe ..'],
      ['goldfish',         'lose to a fish',     'youd lose a staring',      '.. contest to a goldfish ..'],
      ['studied',          'be studied',         'your confidence should',   '.. honestly be studied ..'],
      ['trust me',         'before bad ideas',   'you say trust me',         '.. right before chaos ..'],
      ['hot chaos',        'attractive chaos',   'youre proof that chaos',   '.. can be hot ..'],
      ['shh',              'cute when quiet',    'youre cute until',         '.. you start talking ..'],
      ['stay quiet',       'please stay quiet',  'i support your right',     '.. to stay silent ..'],
      ['mute button',      'mute button',        'youre why group chats',    '.. invented the mute ..'],
      ['smart dumb',       'smart and dumb',     'somehow youre both',       '.. at the same time ..'],
      ['ego',              'catch up someday',   'one day your personality', '.. will catch up to your ego ..'],
    ]},
    { icon: 'cake', label: 'Birthday', open: true, titleStyle: 'color:var(--gold);text-shadow:0 0 12px rgba(255,216,77,.2)', bday: true, chipExtra: 'gold', items: [
      ['happy birthday','happy birthday','wishing you all the best','.. today and always ..'],
      ['its your day',  'its your day',  'celebrate yourself',      '.. you deserve it ..'],
      ['make a wish',   'make a wish',   'the cake is ready',       '.. its all yours ..'],
      ['one more year', 'one more year', 'and you are still',       '.. so amazing ..'],
      ['birthday hugs', 'so many hugs',  'sending them all',        '.. just for you ..'],
      ['happy bday',    'happy bday',    'to my absolute favorite', '.. person ever ..'],
    ]},
  ],
};

function esc(s){return s.replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function renderTemplatePanel(panel, sections){
  panel.innerHTML = sections.map(sec => {
    const fn = sec.bday ? 'setBday' : 'setSpruch';
    const titleAttr = sec.titleStyle ? ` style="${sec.titleStyle}"` : '';
    const chipCls = 'chip t' + (sec.chipExtra ? ' ' + sec.chipExtra : '');
    const headCls = 'sec-head' + (sec.open ? ' open' : '');
    const bodyCls = 'sec-body'  + (sec.open ? ' open' : '');
    const chips = sec.items.map(it => {
      const [label, main, top, bottom] = it;
      const favCls = (typeof isFav === 'function' && isFav(main, top, bottom)) ? ' fav-on' : '';
      return `<span class="${chipCls}" onclick="${fn}('${esc(main)}','${esc(top)}','${esc(bottom)}')">${esc(label)}<span class="fav-star${favCls}" onclick="event.stopPropagation();toggleFav('${esc(main)}','${esc(top)}','${esc(bottom)}',this)">★</span></span>`;
    }).join('');
    // category title = icon span + label span (consistent gap via CSS .cat-title)
    const iconHtml = sec.icon ? `<span class="category-icon"><i class="fa-icon" data-icon="${esc(sec.icon)}"></i></span>` : '';
    const labelHtml = `<span class="category-label">${esc(sec.label || sec.title || '')}</span>`;
    return `<div class="sec">
      <div class="${headCls}" onclick="toggleSec(this)">
        <span class="sec-title cat-title"${titleAttr}>${iconHtml}${labelHtml}</span><span class="sec-arrow"><i class="fa-icon" data-icon="chevron-down"></i></span>
      </div>
      <div class="${bodyCls}"><div class="sec-inner"><div class="chips">${chips}</div></div></div>
    </div>`;
  }).join('');
}

function renderAllTemplates(){
  const en = document.getElementById('lang-en');
  if(en) renderTemplatePanel(en, TEMPLATES.en);
  if(typeof hydrateIcons === 'function') hydrateIcons(en);
}
