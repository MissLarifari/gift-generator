// ── template data ──
// Each section: { icon, label, items:[[label,main,top,bottom]], open?, titleStyle?, bday?, chipExtra? }
//   icon  = name from ICONS in icons.js (rendered as <i class="fa-icon" data-icon="…">)
//   label = plain text title shown next to the icon
const TEMPLATES = {
  en: [
    { icon: 'candy',   label: 'Sweet', titleStyle: 'color:#ff9ec7;text-shadow:0 0 12px rgba(255,158,199,.3)', divider: 'Cute', items: [
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
    { icon: 'users', label: 'Friends', titleStyle: 'color:var(--green);text-shadow:0 0 12px rgba(126,200,126,.3)', items: [
      ['best friend',       'best friend',       'you are simply',     '.. the best ..'],
      ['we are a team',     'we are a team',     'always have been',   '.. and always will be ..'],
      ['without you',       'without you',       'everything would be','.. only half as fun ..'],
      ['you know me',       'you know me',       'better than anyone', '.. and i love that ..'],
      ['no drama',          'no drama',          'just us',            '.. and good vibes ..'],
      ['laughing with you', 'laughing with you', 'is honestly',        '.. the best thing ..'],
      ['hard to find',      'friends like you',  'are hard to find',   '.. so i am keeping you ..'],
      ['i miss us',         'i miss us',         'our little moments', '.. the best ones ..'],
    ]},
    { icon: 'face-smile', label: 'Funny', titleStyle: 'color:var(--purple);text-shadow:0 0 12px rgba(179,136,255,.3)', divider: 'Funny', items: [
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
    { icon: 'face-laugh', label: 'Funny / Chaotic', titleStyle: 'color:var(--gold);text-shadow:0 0 12px rgba(255,216,77,.2)', items: [
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
    { icon: 'skull', label: 'Friends / Roast', titleStyle: 'color:#cc6666;text-shadow:0 0 12px rgba(204,102,102,.25)', chipExtra: 'danger', items: [
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
    { icon: 'heart', label: 'Flirty', titleStyle: 'color:#ff8fb3;text-shadow:0 0 12px rgba(255,143,179,.3)', divider: 'Flirty', items: [
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
    { icon: 'kiss', label: 'Flirty bold', titleStyle: 'color:var(--pink);text-shadow:0 0 12px rgba(255,113,184,.3)', chipExtra: 'pink', items: [
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
    { icon: 'hat-wizard', label: 'Wicked', titleStyle: 'color:#d946ef;text-shadow:0 0 12px rgba(217,70,239,.35)', chipExtra: 'wicked', items: [
      ['no halo',         'lost my halo',     'i lost my halo on the way',         '.. somewhere fun probably ..'],
      ['wicked mind',     'wicked thoughts',  'my mind goes places that',          '.. you would not believe ..'],
      ['little devil',    'tiny devil',       'i look like trouble because',       '.. i am trouble actually ..'],
      ['bad intentions',  'bad ideas only',   'i came with nothing but',           '.. very bad intentions ..'],
      ['evil grin',       'evil smile',       'theres an evil little smile',       '.. waiting just for you ..'],
      ['sinful',          'worth a sin',      'youre honestly worth a sin',        '.. or maybe even two ..'],
      ['ruin you',        'not innocent',     'i have plans for you tonight',      '.. they are not innocent ..'],
      ['naughty list',    'top of the list',  'theyre making extra space for me',  '.. on the naughty list ..'],
      ['mischief',        'pure mischief',    'fully powered today by',            '.. mischief and nothing else ..'],
      ['trouble',         'big trouble',      'someone should hang a sign on me',  '.. saying trouble incoming ..'],
    ]},
    { icon: 'fire', label: 'Dominant', titleStyle: 'color:#ff7a7a;text-shadow:0 0 12px rgba(255,77,77,.3)', chipExtra: 'red', divider: 'Adult', items: [
      ['follow me',     'follow me',          'good girls follow rules',     '.. bad girls follow me ..'],
      ['lipstick',      'ruin your lipstick', 'i wanna',                     '.. not your life ..'],
      ['pin you',       'pinned to the wall', 'you talk cute for someone',   '.. who should be pinned ..'],
      ['i win',         'either way i win',   'behave or dont',              '.. i still win ..'],
      ['behave',        'where is the fun',   'i can behave but',            '.. honestly in that ..'],
    ]},
    { icon: 'handcuffs', label: 'Submissive', titleStyle: 'color:#ec4899;text-shadow:0 0 12px rgba(236,72,153,.3)', chipExtra: 'sub', setFn: 'setSub', items: [
      ['kneel',         'on my knees',        'tell me what to do and ill',  '.. happily kneel for you ..'],
      ['yes please',    'good girl',          'good girls always say',       '.. yes please ..'],
      ['follow',        'leading me',         'just tell me what you want',  '.. ill follow your lead ..'],
      ['your rules',    'rules are rules',    'your rules and im honestly',  '.. so good at following ..'],
      ['behave',        'trying to behave',   'im really trying to behave',  '.. but only for you ..'],
      ['command me',    'command mode',       'tell me what to do and ill',  '.. say yes anyway ..'],
      ['yours',         'all yours',          'completely and entirely',     '.. yours to command ..'],
      ['please',        'pretty please',      'please is honestly my favorite','.. word to say to you ..'],
    ]},
    { icon: 'pepper', label: 'Spicy', titleStyle: 'color:#ffa566;text-shadow:0 0 12px rgba(255,165,102,.3)', chipExtra: 'spicy', items: [
      ['no innocence',  'impossible',         'you make innocent thoughts',  '.. completely impossible ..'],
      ['one kiss',      'both in trouble',    'one kiss and were',           '.. both in trouble ..'],
      ['fantasies',     'better than dreams', 'you look way better',         '.. than my fantasies ..'],
      ['temptation',    'cant ignore',        'youre the kind of',           '.. temptation i need ..'],
      ['on knees',      'down on my knees',   'trust me, praying is not',    '.. what i’m doing down here ..'],
      ['quiet mouth',   'too loud again',     'you already know the best way','.. to shut me up ..'],
      ['dessert',       'sweet tooth',        'who needs dinner when i could have','.. you for dessert instead ..'],
      ['no lipstick',   'lipstick issue',     'wearing lipstick around you is honestly','.. a complete waste of time ..'],
    ]},
    { icon: 'eye', label: 'Voyeur', titleStyle: 'color:#c084fc;text-shadow:0 0 12px rgba(192,132,252,.3)', chipExtra: 'spicy', items: [
      ['front row',     'vip viewing',     'don’t mind me enjoying',                 '.. the view from over here ..'],
      ['mental notes',  'not behaving',    'i swear my mind instantly went',         '.. somewhere completely inappropriate ..'],
      ['better than tv','too distracting', 'watching you two interact is honestly',  '.. turning into my favorite hobby ..'],
      ['cant look away','stuck watching',  'every time i try looking away',          '.. something hotter happens instead ..'],
    ]},
    { icon: 'mug-hot', label: 'Aftercare', titleStyle: 'color:#fcd34d;text-shadow:0 0 12px rgba(252,211,77,.3)', chipExtra: 'aftercare', setFn: 'setAftercare', items: [
      ['hold me',       'cuddle close',    'just hold me close and dont',            '.. let go for a while ..'],
      ['water',         'hydrate me',      'pass me water and a hug',                '.. in that exact order ..'],
      ['blanket',       'warm blanket',    'wrap me in a blanket and',               '.. never let me leave ..'],
      ['safe place',    'safest place',    'your arms are honestly the',             '.. safest place i know ..'],
      ['proud',         'so proud',        'just want you to know im',               '.. proud of you tonight ..'],
      ['stay',          'please stay',     'just stay close to me for',              '.. a little longer please ..'],
      ['snacks',        'snack run',       'snacks cuddles and you are',             '.. all i really need now ..'],
      ['no rush',       'take your time',  'no need to rush this i can',             '.. lay here all night ..'],
    ]},
    { icon: 'spider', label: 'Goth / Dark', titleStyle: 'color:#a855f7;text-shadow:0 0 12px rgba(168,85,247,.3)', chipExtra: 'goth', setFn: 'setGoth', divider: 'Vibes', items: [
      ['sun who',         'avoid sunlight',  'whats a sun ive only ever',         '.. seen the moon ..'],
      ['heart beats',     'i have a heart',  'yes i wear black but',              '.. my heart still beats for you ..'],
      ['my coffin',       'reserved seat',   'theres room in my coffin',          '.. just for you ..'],
      ['dead inside',     'dead but cute',   'dead inside but somehow',           '.. still in love with you ..'],
      ['haunt me',        'cute spooky',     'youre allowed to haunt me',         '.. literally any time ..'],
      ['black lipstick',  'smudges fine',    'my black lipstick promises',        '.. to ruin your shirt ..'],
      ['midnight',        'moonlight vibes', 'meet me at midnight and',           '.. ill explain my soul ..'],
      ['bite worthy',     'vampire energy',  'youre giving major',                '.. bite worthy energy tonight ..'],
    ]},
    { icon: 'wine-glass', label: 'Drunk vibes', titleStyle: 'color:#f59e0b;text-shadow:0 0 12px rgba(245,158,11,.3)', chipExtra: 'drunk', setFn: 'setDrunk', items: [
      ['ily',             'love drunk',      'just so you know i love you',       '.. like a lot a lot ..'],
      ['hot tonight',     'so hot',          'you look so good right now',        '.. or maybe its the wine ..'],
      ['kiss u',          'kiss attempt',    'im gonna kiss you so hard',         '.. just give me a second ..'],
      ['truth out',       'no filter',       'wine makes me say things',          '.. like i really like you ..'],
      ['one more',        'one more shot',   'just one more drink and im',        '.. confessing everything ..'],
      ['blurry',          'blurry feelings', 'my vision is blurry but my',        '.. feelings are crystal clear ..'],
      ['drunk dial',      'sorry not sorry', 'sorry for the drunk dial but',      '.. i really miss you tonight ..'],
      ['dance with me',   'dance floor',     'come dance with me before i',       '.. trip over my own feet ..'],
    ]},
    { icon: 'leaf', label: 'Soft / Cottagecore', titleStyle: 'color:#86efac;text-shadow:0 0 12px rgba(134,239,172,.3)', chipExtra: 'soft', setFn: 'setSoft', items: [
      ['flowers',         'pick flowers',    'wanna go pick flowers and',         '.. forget the world today ..'],
      ['tiny picnic',     'picnic mood',     'lets have a tiny picnic and',       '.. pretend its still summer ..'],
      ['cottage',         'tiny cottage',    'a tiny cottage with you',           '.. would honestly be enough ..'],
      ['warm tea',        'tea for two',     'warm tea, soft blankets and',       '.. you next to me ..'],
      ['fresh bread',     'baking day',      'bake some bread with me and',       '.. ill be the happiest ..'],
      ['soft mornings',   'quiet days',      'soft mornings with you are',        '.. honestly my favorite ..'],
      ['garden',          'tend the garden', 'come tend the garden with me',      '.. just for an hour ..'],
      ['storybook',       'storybook life',  'living like its a storybook',       '.. would suit us perfectly ..'],
    ]},
    { icon: 'rainbow', label: 'Pride', titleStyle: 'color:#ec4899;text-shadow:0 0 12px rgba(236,72,153,.35)', chipExtra: 'pride', setFn: 'setPride', items: [
      ['love wins',       'love wins',       'love wins every single time',       '.. and youre the proof ..'],
      ['proud of you',    'so proud',        'just so you know im proud',         '.. of exactly who you are ..'],
      ['all colors',      'rainbow',         'youre every color of the',          '.. rainbow rolled into one ..'],
      ['be you',          'unapologetic',    'be unapologetically you and',       '.. ill love every version ..'],
      ['out loud',        'love out loud',   'lets love out loud because',        '.. we honestly earned it ..'],
      ['fly the flag',    'flag up',         'fly your flag high and ill',        '.. fly mine right beside you ..'],
      ['on agenda',       'gay agenda',      'kissing you is honestly',           '.. always on my agenda ..'],
      ['shine bright',    'shine on',        'shine as bright as you want',       '.. youre worth every color ..'],
    ]},
    { icon: 'tree', label: 'Christmas', titleStyle: 'color:#ff5252;text-shadow:0 0 12px rgba(76,175,80,.35)', chipExtra: 'xmas', setFn: 'setXmas', divider: 'Holidays', items: [
      ['merry xmas',     'merry christmas',  'wishing you all the warm',          '.. christmas magic this year ..'],
      ['under tree',     'under the tree',   'youre honestly the best gift',      '.. anyone could ever find ..'],
      ['cocoa weather',  'cuddle season',    'cuddle season is finally',          '.. officially open ..'],
      ['naughty list',   'naughty list',     'i think were both ending up',       '.. on the naughty list ..'],
      ['mistletoe',      'check above',      'theres mistletoe above us',         '.. so you know the rules ..'],
      ['santa baby',     'all i want',       'all i really want is',              '.. honestly just you ..'],
      ['snow day',       'stay in bed',      'finally cold enough to',            '.. stay in bed all day ..'],
      ['xmas list',      'top of the list',  'youve been on my list',             '.. since january honestly ..'],
    ]},
    { icon: 'ghost', label: 'Halloween', titleStyle: 'color:#ff8c3a;text-shadow:0 0 12px rgba(168,85,247,.35)', chipExtra: 'halloween', setFn: 'setHalloween', items: [
      ['boo babe',       'boo',              'youre the only thing tonight',      '.. thats scary in a good way ..'],
      ['trick treat',    'mostly trick',     'happy halloween, im mostly',        '.. trick with a little treat ..'],
      ['witchy vibes',   'witchy mood',      'feeling extra witchy tonight',      '.. you better behave ..'],
      ['im the treat',   'forget candy',     'forget the candy this year',       '.. im the only treat you need ..'],
      ['ghosted',        'only good kind',   'this is the only ghosting',         '.. im honestly okay with ..'],
      ['pumpkin',        'cute pumpkin',     'youll always be my',                '.. favorite little pumpkin ..'],
      ['one bite',       'i bite',           'careful with me tonight',           '.. i might just bite ..'],
      ['scary cute',     'still cute',       'your scariest costume is',          '.. still way too cute ..'],
    ]},
    { icon: 'egg', label: 'Easter', titleStyle: 'color:#f9a8d4;text-shadow:0 0 12px rgba(196,181,253,.4)', chipExtra: 'easter', setFn: 'setEaster', items: [
      ['hoppy easter',   'hoppy easter',     'wishing you a really really',       '.. hoppy easter today ..'],
      ['my bunny',       'cutest bunny',     'youre cuter than every',            '.. bunny ill see today ..'],
      ['egg hunt',       'only one egg',     'the only egg im hunting',           '.. is honestly just yours ..'],
      ['sweeter',        'sweet stuff',      'youre sweeter than every',          '.. chocolate egg ever ..'],
      ['basket full',    'all i need',       'my easter basket feels full',       '.. as long as youre in it ..'],
      ['spring vibes',   'spring is here',   'spring is here and so is',          '.. your cute energy ..'],
      ['choco fix',      'better than choc', 'youre way better than any',         '.. easter chocolate ..'],
    ]},
    { icon: 'clover', label: 'St Patricks', titleStyle: 'color:#22c55e;text-shadow:0 0 12px rgba(34,197,94,.35)', chipExtra: 'stpat', setFn: 'setStPatricks', items: [
      ['lucky',          'feeling lucky',    'feeling extra lucky today',         '.. because i have you ..'],
      ['four leaf',      'rare find',        'finding you was like finding',      '.. a four leaf clover ..'],
      ['pot of gold',    'worth more',       'youre honestly worth more than',    '.. any pot of gold ..'],
      ['cheers green',   'slainte',          'raising a glass to you and',        '.. all the green vibes ..'],
      ['kiss irish',     'kiss me',          'kiss me im irish today',            '.. or just kiss me anyway ..'],
      ['rainbow',        'end of rainbow',   'youre exactly what i found',        '.. at the end of the rainbow ..'],
      ['leprechaun',     'tiny menace',      'youre cuter than any',              '.. cheeky little leprechaun ..'],
    ]},
    { icon: 'heart-pulse', label: 'Valentine', titleStyle: 'color:#ff4d6d;text-shadow:0 0 12px rgba(255,77,109,.35)', chipExtra: 'valentine', setFn: 'setValentine', items: [
      ['be mine',        'be my valentine',  'no overthinking it this year',      '.. just be my valentine ..'],
      ['only you',       'same person',      'every valentines i pick is',        '.. honestly the same person ..'],
      ['still yours',    'heart check',      'just checking in, my heart is',     '.. somehow still yours ..'],
      ['cheesy mode',    'cheesy on',        'cheesy mode officially on for',     '.. valentines and all year ..'],
      ['skip flowers',   'just you',         'forget the flowers this year',      '.. i honestly just want you ..'],
      ['cupid aim',      'good aim',         'cupid clearly aimed for me',        '.. and somehow hit twice ..'],
      ['sweet enough',   'no chocolate',     'i dont need chocolate when',        '.. youre already this sweet ..'],
    ]},
    { icon: 'venus', label: 'Womens Day', titleStyle: 'color:#c084fc;text-shadow:0 0 12px rgba(192,132,252,.35)', chipExtra: 'womans', setFn: 'setWomansDay', items: [
      ['queen',          'pure queen',       'just so you remember today',        '.. youre a complete queen ..'],
      ['unstoppable',    'cant stop her',    'youre honestly something',          '.. completely unstoppable ..'],
      ['so proud',       'proud of you',     'just want you to know im',          '.. so proud of you today ..'],
      ['walking icon',   'literal icon',     'youre basically a walking',         '.. icon at this point ..'],
      ['main char',      'main energy',      'your energy today is',              '.. pure main character ..'],
      ['no limits',      'beyond limits',    'limits clearly do not apply',       '.. to someone like you ..'],
      ['lead on',        'born to lead',     'keep leading the way',              '.. like you always do ..'],
      ['celebrate you',  'today is yours',   'today is one whole day to',         '.. celebrate all of you ..'],
    ]},
    { icon: 'flag-usa', label: '4th of July', titleStyle: 'color:#60a5fa;text-shadow:0 0 12px rgba(239,68,68,.35)', chipExtra: 'july4', setFn: 'setJuly4', items: [
      ['freedom',        'freedom mode',     'wishing you a really loud',         '.. independence day this year ..'],
      ['fireworks',      'better than fw',   'honestly youre way more',           '.. exciting than any firework ..'],
      ['bbq vibes',      'grill on',         'grill is on and so is',             '.. the july energy today ..'],
      ['stars stripes',  'patriotic',        'stars stripes and im still',        '.. thinking about you ..'],
      ['boom boom',      'loudest day',      'wishing you the loudest',           '.. happiest 4th of july ..'],
      ['burgers beer',   'classic combo',    'nothing beats burgers, beer',       '.. and great company ..'],
      ['extra color',    'one more color',   'red white blue and one more',       '.. color called happy ..'],
    ]},
    { icon: 'drumstick', label: 'Thanksgiving', titleStyle: 'color:#d97706;text-shadow:0 0 12px rgba(217,119,6,.35)', chipExtra: 'thanksgiving', setFn: 'setThanksgiving', items: [
      ['grateful',       'thankful for you', 'just so you know im grateful',      '.. for you every day ..'],
      ['pass plate',     'pass the plate',   'pass me the plate and also',        '.. a hug if youre near ..'],
      ['pie first',      'pie before all',   'forget the turkey i need',          '.. pie and you first ..'],
      ['stuffed',        'food coma',        'fully stuffed and honestly',        '.. need a nap on you ..'],
      ['leftovers',      'leftover love',    'leftovers tomorrow but my love',    '.. honestly never expires ..'],
      ['turkey day',     'gobble gobble',    'happy turkey day to my',            '.. favorite person ever ..'],
      ['thankful for',   'list of thanks',   'on my list of thanks tonight',      '.. you take the top spot ..'],
      ['cozy day',       'cozy thanks',      'cozy day, full plate and',          '.. you across the table ..'],
    ]},
    { icon: 'star-of-david', label: 'Hanukkah', titleStyle: 'color:#7dd3fc;text-shadow:0 0 12px rgba(125,211,252,.35)', chipExtra: 'hanukkah', setFn: 'setHanukkah', items: [
      ['happy hanukkah', 'happy hanukkah',   'wishing you the warmest',           '.. happiest hanukkah ever ..'],
      ['eight nights',   'nights of joy',    'eight nights of light and',         '.. honestly so much joy ..'],
      ['light it up',    'candle by candle', 'lighting them up one by one',       '.. and thinking of you ..'],
      ['miracles',       'small miracles',   'wishing you all the small',         '.. and the big miracles ..'],
      ['family time',    'cozy moments',     'family time is honestly',           '.. the best part of all ..'],
      ['extra latkes',   'latke fan',        'extra latkes for everyone',         '.. and extra love for you ..'],
      ['dreidel spin',   'spin to win',      'spin the dreidel and wish',         '.. for a great year ahead ..'],
    ]},
    { icon: 'champagne-glasses', label: 'New Year', titleStyle: 'color:#fbbf24;text-shadow:0 0 12px rgba(251,191,36,.4)', chipExtra: 'newyear', setFn: 'setNewYear', items: [
      ['happy new year', 'happy new year',   'wishing you the brightest',         '.. new year ever ..'],
      ['cheers',         'glass up',         'raising a glass to you and',        '.. another great year ..'],
      ['midnight kiss',  'kiss me',          'find me at midnight i want',        '.. that new year kiss ..'],
      ['new chapter',    'fresh page',       'new year new chapter and',          '.. youre still in it ..'],
      ['resolutions',    'only one rule',    'my only resolution is',             '.. more time with you ..'],
      ['fireworks',      'whole sky',        'the whole sky lights up but',       '.. youre still the brightest ..'],
      ['countdown',      'three two one',    'counting down to midnight and',     '.. straight into your arms ..'],
      ['fresh start',    'shiny new year',   'wishing you a really shiny',        '.. fresh start this year ..'],
    ]},
    { icon: 'ring', label: 'Wedding', titleStyle: 'color:#d4af37;text-shadow:0 0 12px rgba(212,175,55,.35)', chipExtra: 'wedding', setFn: 'setWedding', divider: 'Celebrations', items: [
      ['big day',        'big day finally',  'today is finally the day you',      '.. start your forever ..'],
      ['just married',   'married vibes',    'wishing you both a really',         '.. happy married life ..'],
      ['forever',        'forever starts',   'forever officially starts',         '.. for the two of you today ..'],
      ['perfect match',  'made for each',    'youre the most perfect',            '.. match for each other ..'],
      ['love wins',      'love won',         'love clearly won today and',        '.. you two are proof ..'],
      ['mr and mrs',     'mr and mrs',       'congrats to the new',               '.. mr and mrs today ..'],
      ['cheers couple',  'to the couple',    'raising a glass to the couple',     '.. of the whole year ..'],
      ['hugs',           'best wishes',      'sending all my love and',           '.. happiest wishes today ..'],
    ]},
    { icon: 'gem', label: 'Anniversary', titleStyle: 'color:#e8b4b8;text-shadow:0 0 12px rgba(232,180,184,.35)', chipExtra: 'anniv', setFn: 'setAnniv', items: [
      ['year more',      'one more year',    'another year of us and im',         '.. still completely obsessed ..'],
      ['us forever',     'still us',         'somehow still picking you',         '.. every single year ..'],
      ['my favorite',    'favorite person',  'still my favorite person',          '.. after all this time ..'],
      ['lucky me',       'lucky day',        'lucky me getting to love',          '.. you for another year ..'],
      ['best timeline',  'best year',        'every year with you is',            '.. honestly the best one ..'],
      ['my person',      'forever person',   'you really are honestly',           '.. my favorite person ever ..'],
      ['choose you',     'pick you again',   'id pick you again every',           '.. single time honestly ..'],
      ['anniversary',    'happy anniv',      'happy anniversary to the love',     '.. of my entire life ..'],
    ]},
    { icon: 'cake', label: 'Birthday', titleStyle: 'color:var(--gold);text-shadow:0 0 12px rgba(255,216,77,.2)', bday: true, chipExtra: 'gold', items: [
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
    const fn = sec.setFn || (sec.bday ? 'setBday' : 'setSpruch');
    const titleAttr = sec.titleStyle ? ` style="${sec.titleStyle}"` : '';
    const chipCls = 'chip t' + (sec.chipExtra ? ' ' + sec.chipExtra : '');
    const headCls = 'sec-head' + (sec.open ? ' open' : '');
    const bodyCls = 'sec-body'  + (sec.open ? ' open' : '');
    const chips = sec.items.map(it => {
      const [label, main, top, bottom] = it;
      const favCls = (typeof isFav === 'function' && isFav(main, top, bottom)) ? ' fav-on' : '';
      const labelText = sec.chipExtra === 'pride' ? `<span class="chip-rainbow">${esc(label)}</span>` : esc(label);
      return `<span class="${chipCls}" onclick="${fn}('${esc(main)}','${esc(top)}','${esc(bottom)}')">${labelText}<span class="fav-star${favCls}" onclick="event.stopPropagation();toggleFav('${esc(main)}','${esc(top)}','${esc(bottom)}',this)">★</span></span>`;
    }).join('');
    // category title = icon span + label span (consistent gap via CSS .cat-title)
    const iconExtra = sec.chipExtra === 'pride' ? ' chip-rainbow' : '';
    const iconHtml = sec.icon ? `<span class="category-icon"><i class="fa-icon${iconExtra}" data-icon="${esc(sec.icon)}"></i></span>` : '';
    const labelCls = 'category-label' + (sec.chipExtra === 'pride' ? ' chip-rainbow' : '');
    const labelHtml = `<span class="${labelCls}">${esc(sec.label || sec.title || '')}</span>`;
    const titleExtraCls = '';
    const dividerHtml = sec.divider ? `<div class="sec-divider"><span>${esc(sec.divider)}</span></div>` : '';
    return `${dividerHtml}<div class="sec">
      <div class="${headCls}" onclick="toggleSec(this)">
        <span class="sec-title cat-title${titleExtraCls}"${titleAttr}>${iconHtml}${labelHtml}</span><span class="sec-arrow"><i class="fa-icon" data-icon="chevron-down"></i></span>
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
