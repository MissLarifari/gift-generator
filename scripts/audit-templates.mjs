// Audit every template in templates.js against the 240-char / 255-byte
// 3dxchat gift limit. Simulates exactly what generate() produces in the
// "center" layout (the default the page loads with).
//
// Run:  node scripts/audit-templates.mjs

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// ── load templates.js by extracting the TEMPLATES object ──
const src = readFileSync(new URL('../public/js/templates.js', import.meta.url), 'utf8');
const m = src.match(/const TEMPLATES = (\{[\s\S]*?\n\};)/);
if (!m) throw new Error('Could not locate TEMPLATES object in templates.js');
const TEMPLATES = eval('(' + m[1].replace(/;\s*$/, '') + ')');

// ── mirror constants from app.js ──
const DEFAULT_KAO    = '(❀◡❀)';
const DEFAULT_DEKO_T = '· ily ·←';
const DEFAULT_DEKO_B = '.. ･ ✦ ･ ..';

// Default per-field colors used by setSpruch (no theme applied):
const DEFAULT_COLORS = {
  dekoTop:    '#555555',
  topText:    '#8f8f8f',
  mainText:   '#ff71b8',
  bottomText: '#8f8f8f',
  kaomoji:    '#ffd84d',
  dekoBottom: '#5c5c7a',
};

// Default main font-size — always wrapped in <size=N>...</size>
const MAIN_SIZE_DEFAULT = '60';

// Pride pastel palette
const PRIDE_PALETTE = ['#ffadad','#ffd6a5','#fdffb6','#caffbf','#a0c4ff','#bdb2ff'];
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
  return words.map((w,i)=>{const b=Math.min(Math.floor(i*n/words.length),n-1);return{w,b};})
    .reduce((acc,{w,b})=>{const last=acc[acc.length-1];if(last&&last.b===b){last.ws.push(w);}else{acc.push({b,ws:[w]});}return acc;},[])
    .map(({b,ws})=>`<color=${cols[b]}>${ws.join(' ')}</color>`).join(' ');
}

function gradientText(text, c1, c2){
  // Simple 3-stop word-wise gradient (matches app behaviour roughly enough
  // for byte counting). Each word becomes <color=#hex>word</color>.
  // For byte purposes the EXACT hexes don't matter — every token is the
  // same length (#xxxxxx) → so we can fake with c1 for all.
  const words = text.split(' ').filter(Boolean);
  if (!words.length) return text;
  return words.map(w => `<color=${c1}>${w}</color>`).join(' ');
}

// ── per-setFn behaviour: what state does each set up before generate()? ──
// Each returns { colors, grads, decoTop, decoBottom, kaomoji, mainBold, mainItalic }
function stateForSetFn(name, main, top, bottom) {
  // Default state (matches resetAll / fresh page in center layout)
  const base = {
    colors: { ...DEFAULT_COLORS },
    mainGrad: null,           // null = no gradient, otherwise {c1, c2, rainbow}
    decoTop:    DEFAULT_DEKO_T,
    decoBottom: DEFAULT_DEKO_B,
    kaomoji:    DEFAULT_KAO,
  };

  // setSpruch / default — keeps defaults
  if (!name || name === 'setSpruch') return base;

  // setBday — keeps deco/kaomoji, adds gold gradient to main + colored top/bot
  if (name === 'setBday') {
    return {
      ...base,
      colors: { ...base.colors, topText: '#FFD700', bottomText: '#FFB300' },
      mainGrad: { c1: '#FFD700', c2: '#FF8C00' },
    };
  }

  // applyTheme — clears deco/kaomoji, applies 3 theme colors
  const themeColors = {
    setXmas:        ['#ef4444','#16a34a','#f59e0b'],
    setHalloween:   ['#fb923c','#a855f7','#7c3aed'],
    setEaster:      ['#f9a8d4','#fde047','#86efac'],
    setValentine:   ['#ff4d6d','#ff8fb3','#fbcfe8'],
    setWomansDay:   ['#c084fc','#ec4899','#d8b4fe'],
    setJuly4:       ['#ef4444','#1e40af','#3b82f6'],
    setHanukkah:    ['#3b82f6','#e2e8f0','#93c5fd'],
    setStPatricks:  ['#16a34a','#f59e0b','#4ade80'],
    setNewYear:     ['#fbbf24','#cbd5e1','#fde047'],
    setWedding:     ['#d4af37','#e8b4b8','#f5e6d3'],
    setSub:         ['#ec4899','#6b21a8','#831843'],
    setAftercare:   ['#fcd34d','#fbcfe8','#ddd6fe'],
    setGoth:        ['#a855f7','#6b7280','#831843'],
    setDrunk:       ['#f59e0b','#be185d','#fbbf24'],
    setSoft:        ['#86efac','#fbcfe8','#fde68a'],
    setThanksgiving:['#d97706','#92400e','#fbbf24'],
    setAnniv:       ['#e8b4b8','#d4af37','#f9d5e5'],
  };
  if (themeColors[name]) {
    const [cMain, cTop, cBot] = themeColors[name];
    return {
      colors: { ...DEFAULT_COLORS, mainText: cMain, topText: cTop, bottomText: cBot },
      mainGrad: null,
      decoTop: '', decoBottom: '', kaomoji: '',
    };
  }

  // setPride — clears decos, rainbow gradient on main, colored top/bot
  if (name === 'setPride') {
    return {
      colors: { ...DEFAULT_COLORS, topText: '#f9a8d4', bottomText: '#a0c4ff' },
      mainGrad: { c1: '#ffadad', c2: '#bdb2ff', rainbow: true },
      decoTop: '', decoBottom: '', kaomoji: '',
    };
  }

  throw new Error('Unknown setFn: ' + name);
}

// Build the code string exactly like generate() does for the center layout.
// `overrides` allows the auto-trim simulator to blank deco/kaomoji fields.
function buildCode(setFn, main, top, bottom, overrides = {}) {
  const s = stateForSetFn(setFn, main, top, bottom);
  if ('decoTop'    in overrides) s.decoTop    = overrides.decoTop;
  if ('decoBottom' in overrides) s.decoBottom = overrides.decoBottom;
  if ('kaomoji'    in overrides) s.kaomoji    = overrides.kaomoji;

  const colorTag = (text, field) => {
    if (field === 'mainText' && s.mainGrad) {
      if (s.mainGrad.rainbow) return rainbowText(text);
      return gradientText(text, s.mainGrad.c1, s.mainGrad.c2);
    }
    return `<color=${s.colors[field]}>${text}</color>`;
  };

  // sz wraps in <size> only when value differs from default — defaults match
  // the HTML, so out-of-the-box no size tags are added for the side fields.
  const sz = (text, s_, def) => s_ !== def ? `<size=${s_}>${text}</size>` : text;

  // Field rendering (center layout = lines joined by \n in DEFAULT_ORDER)
  const lines = [];
  if (s.decoTop)    lines.push(sz(colorTag(s.decoTop, 'dekoTop'), 12, 12));
  if (top)          lines.push(sz(colorTag(top, 'topText'), 14, 14));
  if (main)         lines.push(`<size=${MAIN_SIZE_DEFAULT}>${colorTag(main, 'mainText')}</size>`);
  if (bottom)       lines.push(sz(colorTag(bottom, 'bottomText'), 14, 14));
  if (s.kaomoji)    lines.push(sz(colorTag(s.kaomoji, 'kaomoji'), 16, 16));
  if (s.decoBottom) lines.push(sz(colorTag(s.decoBottom, 'dekoBottom'), 12, 12));

  return lines.join('\n');
}

// ── audit ──
const CHAR_LIMIT = 240;
const BYTE_LIMIT = 255;
const WARN_CHAR  = 210;
const WARN_BYTE  = 230;

const enc = new TextEncoder();
const rows = [];

// Mirror the new trimDecoToFit() behaviour: if the initial code is over the
// limit, progressively drop kaomoji → dekoBottom → dekoTop and stop when
// we fit. Only applies to setFns that keep defaults (setSpruch / setBday).
function buildCodeWithAutoTrim(setFn, main, top, bottom) {
  let code = buildCode(setFn, main, top, bottom);
  if (setFn !== 'setSpruch' && setFn !== 'setBday') return code;
  // Already over → trim in order kaomoji, dekoBottom, dekoTop
  const trimSteps = [
    { kaomoji: '' },
    { kaomoji: '', decoBottom: '' },
    { kaomoji: '', decoBottom: '', decoTop: '' },
  ];
  for (const overrides of trimSteps) {
    if (!isOver(code)) return code;
    code = buildCode(setFn, main, top, bottom, overrides);
  }
  return code;
}
function isOver(code){
  return code.length > 240 || enc.encode(code).length > 255;
}

for (const section of TEMPLATES.en) {
  const setFn = section.setFn || (section.bday ? 'setBday' : 'setSpruch');
  for (const [label, main, top, bottom] of section.items) {
    const code = buildCodeWithAutoTrim(setFn, main, top, bottom);
    const chars = code.length;
    const bytes = enc.encode(code).length;
    let status = 'ok';
    if (chars > CHAR_LIMIT || bytes > BYTE_LIMIT) status = 'OVER';
    else if (chars > WARN_CHAR || bytes > WARN_BYTE) status = 'warn';
    rows.push({
      section: section.label,
      label, setFn, chars, bytes, status,
      main, top, bottom,
    });
  }
}

// ── output ──
const over  = rows.filter(r => r.status === 'OVER');
const warn  = rows.filter(r => r.status === 'warn');

console.log(`\nAudited ${rows.length} templates across ${TEMPLATES.en.length} sections.`);
console.log(`  Char limit: ${CHAR_LIMIT}  (warn ${WARN_CHAR})`);
console.log(`  Byte limit: ${BYTE_LIMIT}  (warn ${WARN_BYTE})\n`);

if (over.length) {
  console.log(`❌ OVER LIMIT (${over.length}):`);
  for (const r of over) {
    console.log(`  [${r.section}] '${r.label}'  chars=${r.chars}  bytes=${r.bytes}  via ${r.setFn}`);
    console.log(`      main="${r.main}"`);
    console.log(`      top="${r.top}"`);
    console.log(`      bottom="${r.bottom}"`);
  }
  console.log('');
}

if (warn.length) {
  console.log(`⚠️  CLOSE TO LIMIT (${warn.length}):`);
  for (const r of warn) {
    console.log(`  [${r.section}] '${r.label}'  chars=${r.chars}  bytes=${r.bytes}`);
  }
  console.log('');
}

if (!over.length && !warn.length) {
  console.log('✅ All templates fit comfortably under the limit.\n');
} else {
  // Worst offenders even within "ok" — useful to see how close we are
  rows.sort((a,b) => b.bytes - a.bytes);
  console.log('Top 10 by byte count:');
  for (const r of rows.slice(0, 10)) {
    console.log(`  ${r.bytes.toString().padStart(3)} bytes  ${r.chars.toString().padStart(3)} chars  [${r.section}] ${r.label}`);
  }
}

// Exit non-zero if anything is over the hard limit
if (over.length) process.exit(1);
