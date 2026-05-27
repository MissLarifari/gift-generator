// ── template data ──
// Each section: { icon, label, items:[[label,main,top,bottom]], open?, titleStyle?, bday?, chipExtra? }
//   icon  = name from ICONS in icons.js (rendered as <i class="fa-icon" data-icon="…">)
//   label = plain text title shown next to the icon
const TEMPLATES = {
  en: [
    { icon: 'candy',   label: 'Sweet', titleStyle: 'color:#ffa6cf;text-shadow:0 0 14px rgba(255,166,207,.5)', setFn: 'setSweet', items: [
      ['stay close',      'stay close',           'come here and please',    '.. dont go far again ..'],
      ['feel safe',       'i feel safe with you', 'every single day',        '.. thank you for that ..'],
      ['so cute',         'so cute',              'you are honestly',        '.. i cant handle it ..'],
      ['hold my hand',    'hold my hand',         'promise me you will',     '.. and never let go ..'],
      ['my person',       'my person',            'you are honestly',        '.. and always will be ..'],
      ['i like you',      'i like you',           'just so you know',        '.. a lot ..'],
      ['you and me',      'you and me',           'no matter what',          '.. forever ..'],
      ['i miss you',      'i miss you',           'more than you know',      '.. every single day ..'],
      ['thank you',       'thank you',            'for always being there',  '.. it means everything ..'],
      ['safe place',      'safe place',           'you are my',              '.. and i am yours ..'],
      ['forever us',      'forever us',           'always you and me',       '.. no matter what ..'],
    ]},
    { icon: 'users', label: 'Friends', titleStyle: 'color:#7ee0a2;text-shadow:0 0 14px rgba(126,224,162,.5)', setFn: 'setFriends', items: [
      ['best friend',       'best friend',       'youre simply the',         '.. best one i have ..'],
      ['we are a team',     'we are a team',     'always have been',         '.. and always will be ..'],
      ['without you',       'less fun',          'everything is honestly',   '.. less fun without you ..'],
      ['you know me',       'you know me',       'better than anyone',       '.. and i love that ..'],
      ['no drama',          'no drama',          'just us',                  '.. and good vibes ..'],
      ['laughing with you', 'the best part',     'laughing with you is',     '.. honestly my favorite thing ..'],
      ['hard to find',      'rare to find',      'friends like you are',     '.. honestly hard to find ..'],
      ['i miss us',         'i miss us',         'our little moments',       '.. the best ones ..'],
    ]},
    { icon: 'face-smile', label: 'Funny', titleStyle: 'color:#c4a7ff;text-shadow:0 0 14px rgba(196,167,255,.5)', setFn: 'setFunny', items: [
      ['i like you',     'i like you',     'you drive me crazy but',     '.. somehow i still do ..'],
      ['you annoy me',   'you annoy me',   'and somehow i hope',         '.. you never ever stop ..'],
      ['only you',       'only you',       'in this whole world',        '.. drive me this crazy ..'],
      ['i hate you',     'just kidding',   'i hate you no wait',         '.. i actually love you ..'],
      ['its your fault', 'your fault',     'i smile like an idiot',      '.. and its honestly your fault ..'],
      ['send help',      'send help',      'i think about you',          '.. way too much ..'],
      ['stay away',      'just kidding',   'stay away i was gonna say',  '.. never mind never leave ..'],
      ['too late',       'too late',       'youre already',              '.. stuck with me ..'],
      ['pookie wookie',  'pookie wookie',  'i hope your poo poo time',   '.. went well today ..'],
    ]},
    { icon: 'face-laugh', label: 'Funny / Chaotic', titleStyle: 'color:#ffd84d;text-shadow:0 0 14px rgba(255,216,77,.45)', setFn: 'setFunnyChaotic', items: [
      ['annoying',         'annoying',           'youre honestly so',         '.. but kinda cute too ..'],
      ['playing cool',     'then you appeared',  'i was playing it cool',     '.. you ruined the whole plan ..'],
      ['owe me',           'you owe me',         'i dropped my drink',        '.. staring at you ..'],
      ['shampoo',          'shampoo guy',        'youre the reason shampoo',  '.. bottles have instructions ..'],
      ['pro disaster',     'professional',       'you flirt like a',          '.. pro disappointment ..'],
      ['unemployed',       'emotionally broke',  'id flirt but im',           '.. emotionally unemployed ..'],
      ['monday vibes',     'like a monday',      'nobody asked but',          '.. here you are ..'],
      ['mom warned',       'mom warned me',      'you look like trouble',     '.. she told me about ..'],
      ['magician',         'pure magic',         'you walked in and',         '.. everyone else disappeared ..'],
      ['lucky',            'youre hot',          'lucky for you somehow',     '.. or this would be over ..'],
      ['us = chaos',       'great stories',      'you plus me equals',        '.. bad ideas only ..'],
      ['save money',       'broke vibes',        'id take you out but',       '.. im saving money ..'],
      ['red flag',         'favorite red flag',  'youre my',                  '.. fav red flag ever ..'],
      ['tiktok flirt',     'tiktok energy',      'you flirt like you',        '.. learned it from tiktok ..'],
      ['the problem',      'im the problem',     'id fix your issues but',    '.. im actually one of them ..'],
      ['weird',            'i like weird',       'youre weird and',           '.. i love that ..'],
    ]},
    { icon: 'skull', label: 'Friends / Roast', titleStyle: 'color:#ff5a5a;text-shadow:0 0 14px rgba(255,90,90,.5)', chipExtra: 'danger', setFn: 'setRoast', items: [
      ['still single',     'explains a lot',     'still single huh',          '.. that explains stuff ..'],
      ['loading',          'loading screen',     'you flirt like a',          '.. broken loading bar ..'],
      ['life roasted',     'already done',       'id roast you but honestly', '.. life already did it ..'],
      ['zero taste',       'zero taste',         'cute for someone',          '.. with no taste at all ..'],
      ['grandma texter',   'texts like granny',  'confident for someone',     '.. who texts like a grandma ..'],
      ['no charger',       'not my charger',     'id trust you with my drink','.. but never my charger ..'],
      ['autocorrect',      'human typo',         'youre basically a',         '.. real life autocorrect fail ..'],
      ['exhausting',       'youre exhausting',   'good thing im funny',       '.. dating you is exhausting ..'],
      ['always wrong',     'so confident',       'you talk a lot for someone','.. who is always wrong ..'],
      ['headache',         'cute headache',      'youre my favorite kind of', '.. tiny headache honestly ..'],
      ['npc energy',       'big npc energy',     'you got that',              '.. major npc vibe ..'],
      ['goldfish',         'lose to a fish',     'youd lose a staring',       '.. contest to a goldfish ..'],
      ['studied',          'lab worthy',         'your confidence honestly',  '.. should be studied in a lab ..'],
      ['trust me',         'before bad ideas',   'you say trust me',          '.. right before chaos ..'],
      ['hot chaos',        'attractive chaos',   'youre proof that chaos',    '.. can be hot ..'],
      ['shh',              'cute when quiet',    'youre honestly cute until', '.. you start talking again ..'],
      ['stay quiet',       'please stay quiet',  'i support your right',      '.. to stay silent ..'],
      ['mute button',      'mute button',        'youre why group chats',     '.. invented the mute ..'],
      ['smart dumb',       'smart and dumb',     'somehow youre both',        '.. at the same time ..'],
      ['ego',              'catch up someday',   'one day your personality',  '.. will catch up to your ego ..'],
    ]},
    { icon: 'heart', label: 'Flirty', titleStyle: 'color:#ff6ba0;text-shadow:0 0 14px rgba(255,107,160,.5)', setFn: 'setFlirty', items: [
      ['just us',    'just us',         'no one else',          '.. you and me ..'],
      ['kiss me',    'kiss me',         'please',               '.. just once ..'],
      ['dont go',    'dont go',         'please just',          '.. stay with me ..'],
      ['come here',  'come here',       'stop being so far',    '.. i need you close ..'],
      ['hold me',    'hold me tight',   'wrap your arms around','.. and dont let go ..'],
      ['too pretty', 'too pretty',      'you are honestly',     '.. its not fair ..'],
      ['mine',       'mine',            'you are honestly',     '.. and you know it ..'],
      ['dangerous',  'dangerous',       'you are so',           '.. for my heart ..'],
      ['be mine',    'be mine',         'please just',          '.. say yes ..'],
    ]},
    { icon: 'kiss', label: 'Flirty bold', titleStyle: 'color:#ff4d9d;text-shadow:0 0 14px rgba(255,77,157,.55)', chipExtra: 'pink', setFn: 'setFlirtyBold', items: [
      ['lingerie',      'walk by again',      'love at first sight or',      '.. should i walk by in lingerie ..'],
      ['so hot',        'youre so hot',       'you made my dirty thoughts',  '.. actually blush ..'],
      ['not flirting',  'just describing',    'im not flirting',             '.. what id do to you ..'],
      ['lonely lips',   'kiss me already',    'your lips look lonely',       '.. want them to meet mine ..'],
      ['bad decisions', 'bad decisions',      'you bring out the',           '.. in me ..'],
      ['trouble',       'into that',          'you look like trouble',       '.. and im into it ..'],
      ['tonight',       'bad decisions',      'wanna make some',             '.. tonight ..'],
      ['no sleep',      'ruin my sleep',      'youre hot enough to',         '.. ruin my schedule ..'],
      ['tempted',       'already tempted',    'id flirt harder but',         '.. you look ready ..'],
      ['bad ideas',     'i bring bad ideas',  'you bring the body',          '.. i bring the rest ..'],
      ['distracting',   'distracting me',     'you are honestly so',         '.. dangerously distracting ..'],
      ['your eyes',     'your eyes got me',   'no pickup line needed',       '.. already done ..'],
      ['next mistake',  'my next mistake',    'you look like',               '.. and i want it ..'],
      ['i bite',        'i bite back',        'careful with me darling',     '.. or you get bitten back ..'],
      ['that look',     'that look',          'you had me at',               '.. just one look ..'],
      ['obsessed',      'im obsessed',        'not saying im obsessed but',  '.. damn honestly ..'],
    ]},
    { icon: 'hat-wizard', label: 'Wicked', titleStyle: 'color:#e879f9;text-shadow:0 0 14px rgba(232,121,249,.5)', chipExtra: 'wicked', setFn: 'setWicked', items: [
      ['no halo',         'lost my halo',     'i lost it on the way to',           '.. somewhere fun probably ..'],
      ['wicked mind',     'wicked thoughts',  'my mind goes places that',          '.. you would not believe ..'],
      ['little devil',    'tiny devil',       'i look like trouble because',       '.. i am trouble actually ..'],
      ['bad intentions',  'bad ideas only',   'i came with nothing but',           '.. very bad intentions ..'],
      ['evil grin',       'evil grin',        'theres an evil little grin',        '.. waiting just for you ..'],
      ['sinful',          'worth a sin',      'youre honestly worth committing',   '.. one or maybe even two ..'],
      ['ruin you',        'wicked plans',     'i have plans for you tonight',      '.. that are not innocent ..'],
      ['naughty list',    'top of the list',  'theyre making extra space for me',  '.. on the naughty list ..'],
      ['mischief',        'pure mischief',    'fully powered today by',            '.. honestly nothing else ..'],
      ['trouble',         'big trouble',      'someone should hang a sign on me',  '.. honestly with a warning ..'],
    ]},
    { icon: 'fire', label: 'Dominant', titleStyle: 'color:#ff4d4d;text-shadow:0 0 14px rgba(255,77,77,.55)', chipExtra: 'red', setFn: 'setDominant', items: [
      ['follow me',     'follow me',          'good girls follow rules',     '.. bad girls follow me ..'],
      ['lipstick',      'ruin your lipstick', 'i wanna honestly',            '.. not your whole life ..'],
      ['pin you',       'pinned to the wall', 'you talk cute for someone',   '.. who should be pinned ..'],
      ['i win',         'i always win',       'behave or dont honestly',     '.. either way i still win ..'],
      ['behave',        'where is the fun',   'i can behave but honestly',   '.. where would the fun be ..'],
    ]},
    { icon: 'handcuffs', label: 'Submissive', titleStyle: 'color:#f472b6;text-shadow:0 0 14px rgba(244,114,182,.5)', chipExtra: 'sub', setFn: 'setSub', items: [
      ['kneel',         'on my knees',        'tell me what to do and ill',     '.. happily kneel for you ..'],
      ['yes please',    'good girl',          'good girls always say',          '.. yes please ..'],
      ['follow',        'leading me',         'just tell me what you want',     '.. ill follow your lead ..'],
      ['your rules',    'rules are rules',    'your rules and im honestly',     '.. so good at following ..'],
      ['behave',        'so good for you',    'im really trying to behave',     '.. but only for you honestly ..'],
      ['command me',    'command mode',       'tell me what to do and ill',     '.. say yes anyway ..'],
      ['yours',         'all yours',          'completely and entirely',        '.. yours to command ..'],
      ['please',        'pretty please',      'please is honestly my favorite', '.. word to say to you ..'],
    ]},
    { icon: 'pepper', label: 'Spicy', titleStyle: 'color:#ff9933;text-shadow:0 0 14px rgba(255,153,51,.5)', chipExtra: 'spicy', setFn: 'setSpicy', items: [
      ['no innocence',  'no longer innocent', 'innocent thoughts around you',   '.. are honestly impossible ..'],
      ['one kiss',      'in trouble',         'one kiss and were honestly',     '.. both in deep trouble ..'],
      ['fantasies',     'better than dreams', 'you look way better',            '.. than my fantasies ..'],
      ['temptation',    'cant ignore',        'youre the kind of',              '.. temptation i need ..'],
      ['on knees',      'down on my knees',   'trust me praying is not',        '.. what im doing down here ..'],
      ['quiet mouth',   'shut me up',         'you already know the best way',  '.. to shut me up ..'],
      ['dessert',       'sweet tooth',        'who needs dinner when i could',  '.. have you for dessert instead ..'],
      ['no lipstick',   'lipstick issue',     'wearing lipstick around you',    '.. is honestly a waste of time ..'],
    ]},
    { icon: 'eye', label: 'Voyeur', titleStyle: 'color:#a855f7;text-shadow:0 0 14px rgba(168,85,247,.5)', chipExtra: 'spicy', setFn: 'setVoyeur', items: [
      ['front row',     'vip viewing',     'dont mind me enjoying',                 '.. the view from over here ..'],
      ['mental notes',  'somewhere bad',   'i swear my mind instantly went',        '.. completely inappropriate places ..'],
      ['better than tv','too distracting', 'watching you two interact',             '.. is becoming my favorite hobby ..'],
      ['cant look away','stuck watching',  'every time i try looking away',         '.. something hotter happens instead ..'],
    ]},
    { icon: 'mug-hot', label: 'Aftercare', titleStyle: 'color:#fcd34d;text-shadow:0 0 14px rgba(252,211,77,.5)', chipExtra: 'aftercare', setFn: 'setAftercare', items: [
      ['hold me',       'cuddle close',    'just hold me and please',                '.. dont let go for a while ..'],
      ['water',         'water first',     'pass me water and a hug',                '.. in that exact order please ..'],
      ['blanket',       'warm blanket',    'wrap me up and honestly',                '.. never let me leave please ..'],
      ['safe place',    'safe with you',   'your arms are honestly the',             '.. safest place i know ..'],
      ['proud',         'so proud of you', 'just want you to know honestly',         '.. im so proud tonight ..'],
      ['stay',          'please stay',     'just stay close to me for',              '.. a little longer please ..'],
      ['snacks',        'snacks and you',  'snacks cuddles and you are',             '.. all i really need now ..'],
      ['no rush',       'take your time',  'no need to rush this i can',             '.. lay here all night ..'],
    ]},
    { icon: 'spider', label: 'Goth / Dark', titleStyle: 'color:#9333ea;text-shadow:0 0 14px rgba(147,51,234,.5)', chipExtra: 'goth', setFn: 'setGoth', divider: 'Vibes', items: [
      ['sun who',         'avoid sunlight',  'whats a sun ive only ever',         '.. seen the moon ..'],
      ['heart beats',     'i have a heart',  'yes i wear black but',              '.. my heart still beats for you ..'],
      ['my coffin',       'reserved seat',   'theres room in my coffin',          '.. just for you ..'],
      ['dead inside',     'dead but cute',   'dead inside but somehow',           '.. still in love with you ..'],
      ['haunt me',        'cute spooky',     'youre allowed to haunt me',         '.. literally any time ..'],
      ['black lipstick',  'smudges fine',    'my black lipstick promises',        '.. to ruin your shirt ..'],
      ['midnight',        'moonlight vibes', 'meet me at midnight and',           '.. ill explain my soul ..'],
      ['bite worthy',     'vampire energy',  'youre giving major',                '.. bite worthy energy tonight ..'],
    ]},
    { icon: 'wine-glass', label: 'Drunk vibes', titleStyle: 'color:#fbbf24;text-shadow:0 0 14px rgba(251,191,36,.5)', chipExtra: 'drunk', setFn: 'setDrunk', items: [
      ['ily',             'love drunk',      'just so you know i love you',       '.. like a lot a lot ..'],
      ['hot tonight',     'so hot',          'you look so good right now',        '.. or maybe its the wine ..'],
      ['kiss u',          'kiss attempt',    'im gonna kiss you so hard',         '.. just give me a second ..'],
      ['truth out',       'no filter',       'wine makes me say things',          '.. like i really like you ..'],
      ['one more',        'one more shot',   'just one more drink and im',        '.. confessing everything ..'],
      ['blurry',          'crystal clear',   'my vision is blurry but my',        '.. feelings are honestly clear ..'],
      ['drunk dial',      'sorry not sorry', 'sorry for the drunk dial but',      '.. i really miss you tonight ..'],
      ['dance with me',   'dance floor',     'come dance with me before i',       '.. trip over my own feet ..'],
    ]},
    { icon: 'leaf', label: 'Soft / Cottagecore', titleStyle: 'color:#4ade80;text-shadow:0 0 14px rgba(74,222,128,.5)', chipExtra: 'soft', setFn: 'setSoft', items: [
      ['flowers',         'pick flowers',    'lets go and honestly',              '.. forget the world today ..'],
      ['tiny picnic',     'picnic mood',     'lets have a tiny picnic and',       '.. pretend its still summer ..'],
      ['cottage',         'tiny cottage',    'just a small place with you',       '.. would honestly be enough ..'],
      ['warm tea',        'tea for two',     'warm tea soft blankets and',        '.. you next to me ..'],
      ['fresh bread',     'baking day',      'bake some bread with me and',       '.. ill be the happiest ..'],
      ['soft mornings',   'quiet days',      'soft mornings with you are',        '.. honestly my favorite ..'],
      ['garden',          'in the garden',   'come tend the garden with me',      '.. just for an hour or two ..'],
      ['storybook',       'storybook life',  'living like a fairytale honestly',  '.. would suit us perfectly ..'],
    ]},
    { icon: 'rainbow', label: 'Pride', titleStyle: 'color:#f472b6;text-shadow:0 0 14px rgba(244,114,182,.55)', chipExtra: 'pride', setFn: 'setPride', items: [
      ['love wins',       'love wins',       'love honestly wins every time',     '.. and youre the proof ..'],
      ['proud of you',    'so proud',        'just so you know im proud',         '.. of exactly who you are ..'],
      ['all colors',      'every color',     'youre every color of the',          '.. rainbow rolled into one ..'],
      ['be you',          'unapologetic',    'be unapologetically you and',       '.. ill love every version ..'],
      ['out loud',        'love out loud',   'lets be loud about it because',     '.. we honestly earned it ..'],
      ['fly the flag',    'flag up',         'fly your flag high and ill',        '.. fly mine right beside you ..'],
      ['on agenda',       'gay agenda',      'kissing you is honestly',           '.. always on my agenda ..'],
      ['shine bright',    'shine on',        'shine as bright as you want',       '.. youre worth every color ..'],
    ]},
    { icon: 'tree', label: 'Christmas', titleStyle: 'color:#ef4444;text-shadow:0 0 14px rgba(239,68,68,.5)', chipExtra: 'xmas', setFn: 'setXmas', divider: 'Holidays', items: [
      ['merry xmas',     'merry christmas',  'wishing you all the warm',          '.. magic this year ..'],
      ['under tree',     'under the tree',   'youre honestly the best gift',      '.. anyone could ever find ..'],
      ['cocoa weather',  'cuddle season',    'cocoa weather and warmth',          '.. is finally officially open ..'],
      ['naughty list',   'naughty list',     'i think were both ending up',       '.. on the naughty list ..'],
      ['mistletoe',      'check above',      'theres mistletoe above us',         '.. so you know the rules ..'],
      ['santa baby',     'i want you',       'all i really want this year',       '.. is honestly just you ..'],
      ['snow day',       'snow day',         'finally cold enough to stay',       '.. in bed all day long ..'],
      ['xmas list',      'top of the list',  'youve been on my list',             '.. since january honestly ..'],
    ]},
    { icon: 'ghost', label: 'Halloween', titleStyle: 'color:#ff8c3a;text-shadow:0 0 14px rgba(255,140,58,.55)', chipExtra: 'halloween', setFn: 'setHalloween', items: [
      ['boo babe',       'boo',              'youre the only thing tonight',      '.. thats scary in a good way ..'],
      ['trick treat',    'mostly trick',     'happy halloween im honestly',       '.. trick with a little treat ..'],
      ['witchy vibes',   'witchy mood',      'feeling extra magical tonight',     '.. so you better behave ..'],
      ['im the treat',   'im the treat',     'skip the candy this year',          '.. im the only treat you need ..'],
      ['ghosted',        'only good kind',   'this is the only ghosting',         '.. im honestly okay with ..'],
      ['pumpkin',        'cute pumpkin',     'youll always honestly be my',       '.. favorite little one ever ..'],
      ['one bite',       'careful baby',     'careful with me tonight because',   '.. i might just bite you ..'],
      ['scary cute',     'still cute',       'your scariest costume is',          '.. still way too cute ..'],
    ]},
    { icon: 'egg', label: 'Easter', titleStyle: 'color:#f9a8d4;text-shadow:0 0 14px rgba(249,168,212,.5)', chipExtra: 'easter', setFn: 'setEaster', items: [
      ['hoppy easter',   'hoppy easter',     'wishing you a really really',       '.. happy easter today ..'],
      ['my bunny',       'cutest bunny',     'youre cuter honestly than',         '.. any other bunny today ..'],
      ['egg hunt',       'only one egg',     'the only egg im hunting',           '.. is honestly just yours ..'],
      ['sweeter',        'sweet stuff',      'youre sweeter than every',          '.. chocolate egg ever ..'],
      ['basket full',    'all i need',       'my easter basket feels full',       '.. as long as youre in it ..'],
      ['spring vibes',   'springtime mood',  'spring is finally here and so is',  '.. your cute energy honestly ..'],
      ['choco fix',      'better than choc', 'youre way better than any',         '.. easter chocolate ..'],
    ]},
    { icon: 'clover', label: 'St Patricks', titleStyle: 'color:#22c55e;text-shadow:0 0 14px rgba(34,197,94,.5)', chipExtra: 'stpat', setFn: 'setStPatricks', items: [
      ['lucky',          'feeling lucky',    'feeling extra lucky today',         '.. because i have you ..'],
      ['four leaf',      'rare find',        'finding you was like finding',      '.. a four leaf clover ..'],
      ['pot of gold',    'pure gold',        'youre honestly worth more than',    '.. any pot of gold ..'],
      ['cheers green',   'slainte',          'raising a glass to you and',        '.. all the green vibes ..'],
      ['kiss irish',     'irish today',      'kiss me im irish today',            '.. or just kiss me anyway ..'],
      ['rainbow',        'end of rainbow',   'youre exactly what i found',        '.. at the very end of it ..'],
      ['leprechaun',     'tiny menace',      'youre cuter than any',              '.. cheeky little leprechaun ..'],
    ]},
    { icon: 'heart-pulse', label: 'Valentine', titleStyle: 'color:#ff4d6d;text-shadow:0 0 14px rgba(255,77,109,.55)', chipExtra: 'valentine', setFn: 'setValentine', items: [
      ['be mine',        'be my valentine',  'no overthinking it this year',      '.. honestly just say yes ..'],
      ['only you',       'same person',      'every valentines i pick is',        '.. honestly the same one ..'],
      ['still yours',    'heart check',      'just checking in my heart is',      '.. somehow still yours ..'],
      ['cheesy mode',    'cheesy on',        'cheesy mode officially on for',     '.. valentines and all year ..'],
      ['skip flowers',   'just you',         'forget the flowers this year',      '.. i honestly just want you ..'],
      ['cupid aim',      'good aim',         'cupid clearly aimed for me',        '.. and somehow hit twice ..'],
      ['sweet enough',   'no chocolate',     'i dont need chocolate when',        '.. youre already this sweet ..'],
    ]},
    { icon: 'venus', label: 'Womens Day', titleStyle: 'color:#c084fc;text-shadow:0 0 14px rgba(192,132,252,.5)', chipExtra: 'womans', setFn: 'setWomansDay', items: [
      ['queen',          'pure queen',       'just so you remember today',        '.. youre absolutely incredible ..'],
      ['unstoppable',    'cant stop her',    'youre honestly something',          '.. completely unstoppable ..'],
      ['so proud',       'proud of you',     'just want you to know honestly',    '.. im so proud today ..'],
      ['walking icon',   'icon energy',      'youre basically a walking',         '.. icon at this point honestly ..'],
      ['main char',      'main energy',      'your energy today is',              '.. pure main character ..'],
      ['no limits',      'beyond limits',    'limits clearly do not apply',       '.. to someone like you ..'],
      ['lead on',        'born to lead',     'keep leading the way',              '.. like you always do ..'],
      ['celebrate you',  'today is yours',   'today is one whole day to',         '.. celebrate all of you ..'],
    ]},
    { icon: 'flag-usa', label: '4th of July', titleStyle: 'color:#60a5fa;text-shadow:0 0 14px rgba(96,165,250,.5)', chipExtra: 'july4', setFn: 'setJuly4', items: [
      ['freedom',        'freedom mode',     'wishing you a really loud',         '.. independence day this year ..'],
      ['fireworks',      'better than them', 'honestly youre way more',           '.. exciting than any firework ..'],
      ['bbq vibes',      'grill is on',      'fire up the grill because so is',   '.. the july energy today ..'],
      ['stars stripes',  'patriotic',        'stars stripes and im still',        '.. thinking about you ..'],
      ['boom boom',      'loud and proud',   'wishing you the loudest',           '.. happiest 4th of july ever ..'],
      ['burgers beer',   'classic combo',    'nothing beats burgers beer',        '.. and great company ..'],
      ['extra color',    'one more color',   'red white blue and one more',       '.. color called happy ..'],
    ]},
    { icon: 'drumstick', label: 'Thanksgiving', titleStyle: 'color:#ea580c;text-shadow:0 0 14px rgba(234,88,12,.5)', chipExtra: 'thanksgiving', setFn: 'setThanksgiving', items: [
      ['grateful',       'thankful for you', 'just so you know im grateful',      '.. for you every day ..'],
      ['pass plate',     'plate please',     'pass me the plate and also',        '.. a hug if youre near ..'],
      ['pie first',      'pie before all',   'forget the turkey i need',          '.. pie and you first ..'],
      ['stuffed',        'food coma',        'fully stuffed and honestly',        '.. need a nap on you ..'],
      ['leftovers',      'leftover love',    'leftovers tomorrow but my love',    '.. honestly never expires ..'],
      ['turkey day',     'gobble gobble',    'happy turkey day to my',            '.. favorite person ever ..'],
      ['thankful for',   'top of the list',  'on my list of thanks tonight',      '.. you take the top spot ..'],
      ['cozy day',       'cozy thanks',      'cozy day full plate and',           '.. you across the table ..'],
    ]},
    { icon: 'star-of-david', label: 'Hanukkah', titleStyle: 'color:#7dd3fc;text-shadow:0 0 14px rgba(125,211,252,.55)', chipExtra: 'hanukkah', setFn: 'setHanukkah', items: [
      ['happy hanukkah', 'happy hanukkah',   'wishing you the warmest',           '.. happiest one ever ..'],
      ['eight nights',   'nights of joy',    'eight nights of light and',         '.. honestly so much joy ..'],
      ['light it up',    'candle by candle', 'lighting them up one by one',       '.. and thinking of you ..'],
      ['miracles',       'tiny miracles',    'wishing you all the small',         '.. and the big miracles ..'],
      ['family time',    'cozy moments',     'family time is honestly',           '.. the best part of all ..'],
      ['extra latkes',   'latke fan',        'extra latkes for everyone',         '.. and extra love for you ..'],
      ['dreidel spin',   'spin to win',      'spin the dreidel and wish',         '.. for a great year ahead ..'],
    ]},
    { icon: 'champagne-glasses', label: 'New Year', titleStyle: 'color:#fbbf24;text-shadow:0 0 14px rgba(251,191,36,.55)', chipExtra: 'newyear', setFn: 'setNewYear', items: [
      ['happy new year', 'happy new year',   'wishing you the brightest',         '.. and happiest one yet ..'],
      ['cheers',         'glass up',         'raising a glass to you and',        '.. another great year ..'],
      ['midnight kiss',  'kiss me',          'find me at midnight i want',        '.. that new year kiss ..'],
      ['new chapter',    'fresh page',       'new year new chapter and',          '.. youre still in it ..'],
      ['resolutions',    'only one rule',    'my only resolution is',             '.. more time with you ..'],
      ['fireworks',      'brightest one',    'the whole sky lights up but',       '.. youre still the brightest ..'],
      ['countdown',      'three two one',    'counting down to midnight and',     '.. straight into your arms ..'],
      ['fresh start',    'fresh new year',   'wishing you a really shiny',        '.. fresh start this year ..'],
    ]},
    { icon: 'ring', label: 'Wedding', titleStyle: 'color:#e0b94a;text-shadow:0 0 14px rgba(224,185,74,.5)', chipExtra: 'wedding', setFn: 'setWedding', divider: 'Celebrations', items: [
      ['big day',        'big day',          'today is finally the day you',      '.. start your forever together ..'],
      ['just married',   'married vibes',    'wishing you both a really',         '.. happy married life ..'],
      ['forever',        'forever begins',   'forever officially starts',         '.. for the two of you today ..'],
      ['perfect match',  'made for each',    'youre the most perfect',            '.. match for each other ..'],
      ['love wins',      'love wins',        'love clearly won today and',        '.. you two are honestly proof ..'],
      ['mr and mrs',     'mr and mrs',       'congrats to the brand new',         '.. couple today honestly ..'],
      ['cheers couple',  'to you two',       'raising a glass to the couple',     '.. of the whole year honestly ..'],
      ['hugs',           'best wishes',      'sending all my love and',           '.. happiest wishes today ..'],
    ]},
    { icon: 'gem', label: 'Anniversary', titleStyle: 'color:#fda4af;text-shadow:0 0 14px rgba(253,164,175,.5)', chipExtra: 'anniv', setFn: 'setAnniv', items: [
      ['year more',      'one more year',    'another year of us and im',         '.. still completely obsessed ..'],
      ['us forever',     'still us',         'somehow still picking you',         '.. every single year ..'],
      ['my favorite',    'still my favorite','still my favorite person',          '.. after all this time ..'],
      ['lucky me',       'lucky day',        'lucky me getting to love',          '.. you for another year ..'],
      ['best timeline',  'best year',        'every year with you is',            '.. honestly the best one ..'],
      ['my person',      'forever person',   'you really are honestly',           '.. my favorite person ever ..'],
      ['choose you',     'every time',       'id pick you again every',           '.. single time honestly ..'],
      ['anniversary',    'happy us day',     'happy anniversary to the love',     '.. of my entire life ..'],
    ]},
    { icon: 'arrows-rotate', label: 'Flipped', titleStyle: 'color:#ff4d8c;text-shadow:0 0 14px rgba(255,77,140,.55)', chipExtra: 'pink', setFn: 'setFlipped', items: [
      ['world flipped',  'still chose you',     'world flipped today and i',         '.. still chose you ♡ ..'],
      ['upside down',    'right side up',       'world is upside down but you',      '.. keep me right side up ..'],
      ['gravity gone',   'still falling',       'gravity left the building but',     '.. im still falling for you ..'],
      ['spinning',       'still my center',     'the whole world is spinning',       '.. youre still my center ..'],
      ['try four',       'number 4',            '3 wasnt enough apparently so',      '.. here comes number 4 ♡ ..'],
      ['everything off', 'except us',           'everythings off today honestly',    '.. except for us two ..'],
      ['compass broken', 'still find you',      'my compass is broken but i',        '.. still find my way to you ..'],
      ['sideways',       'sideways but here',   'world tilted sideways and im',      '.. honestly still here for you ..'],
      ['no gravity',     'still pulling',       'no gravity in the room but',        '.. youre still pulling me in ..'],
      ['stars wrong',    'still aligned',       'the stars are upside down but',     '.. ours are still aligned ..'],
    ]},
    { icon: 'cake', label: 'Birthday', titleStyle: 'color:#ffd84d;text-shadow:0 0 14px rgba(255,216,77,.5)', bday: true, chipExtra: 'gold', items: [
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
  // Flipped section uses smallcaps + upside-down chars that only read
  // correctly inside the Flipped layout. Hide it everywhere else so the
  // right panel doesn't show templates that look broken in the active
  // layout. setLayout() calls renderAllTemplates() so the panel
  // refreshes when the user switches in or out of Flipped.
  const filtered = sections.filter(sec => {
    if (sec.setFn === 'setFlipped' || sec.label === 'Flipped') {
      return typeof currentLayout !== 'undefined' && currentLayout === 'flipped';
    }
    return true;
  });
  panel.innerHTML = filtered.map(sec => {
    const fn = sec.setFn || (sec.bday ? 'setBday' : 'setSpruch');
    const titleAttr = sec.titleStyle ? ` style="${sec.titleStyle}"` : '';
    const chipCls = 'chip t' + (sec.chipExtra ? ' ' + sec.chipExtra : '');
    const headCls = 'sec-head' + (sec.open ? ' open' : '');
    const bodyCls = 'sec-body'  + (sec.open ? ' open' : '');
    const chips = sec.items.map(it => {
      const [label, main, top, bottom] = it;
      const favCls = (typeof isFav === 'function' && isFav(main, top, bottom)) ? ' fav-on' : '';
      const labelText = sec.chipExtra === 'pride' ? `<span class="chip-rainbow">${esc(label)}</span>` : esc(label);
      return `<span class="${chipCls}" onclick="applyTemplate('${fn}','${esc(main)}','${esc(top)}','${esc(bottom)}')">${labelText}<span class="fav-star${favCls}" onclick="event.stopPropagation();toggleFav('${esc(main)}','${esc(top)}','${esc(bottom)}',this)">★</span></span>`;
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
