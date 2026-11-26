/* Level-8 "Witten-Heven" design preview generator (no deps).
 * Computes the proposed layout with the same coordinate math as dist/levels.js
 * (center 1536,1536, offset coords, pathDistance, slot filters) and renders
 * docs/art/witten-heven-level8-preview.{png,svg}. Run: node tools/witten-heven-level-preview.cjs */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');

const center = { x: 1536, y: 1536 };
const point = (x, y) => ({ x: center.x + x, y: center.y + y });
function segmentDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
function pathDistance(p, path) {
  let best = Infinity;
  for (let i = 1; i < path.length; i++) best = Math.min(best, segmentDistance(p, path[i - 1], path[i]));
  return best;
}

// --- proposed layout (docs/WITTEN_HEVEN_LEVEL.md) ---
const hevenPlatform = { left: -300, right: 300, top: -300, bottom: 300, stair: { x: 0, top: 300, bottom: 540, width: 150 } };
const wallBand = { left: -420, right: 420, top: -400, bottom: -330 };
const hevenPaths = [
  [[-1060, -430], [-760, -330], [-520, -210], [-330, -90], [0, 0]],
  [[1040, -520], [760, -380], [520, -220], [300, -90], [0, 0]],
  [[80, 1060], [40, 700], [0, 540], [0, 0]]
].map(r => r.map(([x, y]) => point(x, y)));
const gateLabels = ['WALDRAND WEST', 'WALDRAND OST', 'ZUGANG SUED'];
const airGate = point(0, -1020);
const slotCandidates = [[-620, -160], [-560, 120], [-420, 330], [-240, 420], [-700, -60], [700, -160], [560, 120], [420, 330], [240, 420], [700, 60], [0, 660], [-260, 660], [260, 660], [-860, -240], [860, -300]];
const hevenSlots = [];
for (const [x, y] of slotCandidates) {
  const p = point(x, y);
  const onPlatform = x >= hevenPlatform.left - 45 && x <= hevenPlatform.right + 45 && y >= hevenPlatform.top - 45 && y <= hevenPlatform.bottom + 45;
  const onStair = Math.abs(x - hevenPlatform.stair.x) < hevenPlatform.stair.width / 2 + 65 && y > hevenPlatform.stair.top - 65 && y < hevenPlatform.stair.bottom + 65;
  const nearWall = x >= wallBand.left - 70 && x <= wallBand.right + 70 && y >= wallBand.top - 70 && y <= wallBand.bottom + 70;
  if (Math.hypot(x, y) >= 190 && !onPlatform && !onStair && !nearWall &&
      hevenPaths.every(pt => pathDistance(p, pt) >= 90) &&
      hevenSlots.every(s => Math.hypot(s.x - p.x, s.y - p.y) > 115)) hevenSlots.push(p);
}
const waves = [
  { wave: 29, name: 'NEBEL ÜBER HEVEN', comp: 'wraith x2, runner (Boden)', tuning: '40 x 0.58s, Gates 0+1' },
  { wave: 30, name: 'DIE VIER PFEILER', comp: '+ guardian, + Luft alle 8.', tuning: '50 x 0.48s, armorAll .05, Gates 0-2' },
  { wave: 31, name: 'STURM AUS DEM WALD', comp: '+ archer, + brute', tuning: '56 x 0.42s, speedAll 1.06' },
  { wave: 32, name: 'DIE LETZTE WACHT', comp: '+ sapper, BOSS idx 0', tuning: '60 x 0.38s, damageAll 1.08' }
];

// --- tiny 5x7 bitmap font ---
const F = {
  'A': ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], 'B': ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  'C': ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'], 'D': ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  'E': ['#####', '#....', '#....', '####.', '#....', '#....', '#####'], 'F': ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  'G': ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'], 'H': ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  'I': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'], 'J': ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  'K': ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'], 'L': ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  'M': ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'], 'N': ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  'O': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], 'P': ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  'Q': ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'], 'R': ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  'S': ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'], 'T': ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  'U': ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], 'V': ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  'W': ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'], 'X': ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  'Y': ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'], 'Z': ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'], '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '..##.', '.#...', '#....', '#####'], '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'], '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'], '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'], '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'], '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  '(': ['..#..', '.#...', '#....', '#....', '#....', '.#...', '..#..'], ')': ['..#..', '...#.', '....#', '....#', '....#', '...#.', '..#..'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'], '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'], ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '.##..', '.#...'], 'x': ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#']
};

// --- raster canvas ---
const S = 0.42, W = Math.round(3072 * S), H = W, PAD = 150;
const CW = W + PAD * 2, CH = H + 300;
const img = Buffer.alloc(CW * CH * 4, 0);
function px(x, y, r, g, b, a = 255) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= CW || y >= CH) return;
  const i = (y * CW + x) * 4;
  img[i] = img[i] * (255 - a) / 255 + r * a / 255;
  img[i + 1] = img[i + 1] * (255 - a) / 255 + g * a / 255;
  img[i + 2] = img[i + 2] * (255 - a) / 255 + b * a / 255;
  img[i + 3] = Math.min(255, img[i + 3] + a);
}
function rect(x0, y0, x1, y1, c, fill) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  for (let y = Math.max(0, y0); y < Math.min(CH, y1); y++) for (let x = Math.max(0, x0); x < Math.min(CW, x1); x++) {
    if (fill || (x === x0 || x === x1 - 1 || y === y0 || y === y1 - 1)) px(x, y, c[0], c[1], c[2]);
  }
}
function circle(cx, cy, r, c, fill) {
  for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
    const d = Math.hypot(x - cx, y - cy);
    if (fill ? d <= r : d >= r - 1.6 && d <= r) px(x, y, c[0], c[1], c[2]);
  }
}
function line(x0, y0, x1, y1, w, c) {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    for (let dy = -w / 2; dy <= w / 2; dy++) for (let dx = -w / 2; dx <= w / 2; dx++) if (dx * dx + dy * dy <= w * w / 4) px(Math.round(x + dx), Math.round(y + dy), c[0], c[1], c[2]);
  }
}
function text(x, y, str, c, scale = 2) {
  let cx = x;
  for (const ch of str.toUpperCase()) {
    const g = F[ch] || F[' '];
    for (let r = 0; r < 7; r++) for (let col = 0; col < 5; col++) if (g[r][col] === '#') rect(cx + col * scale, y + r * scale, cx + (col + 1) * scale, y + (r + 1) * scale, c, true);
    cx += 6 * scale;
  }
}
const sx = v => PAD + v * S, sy = v => PAD + v * S;

// background + clearing
rect(0, 0, CW, CH, [11, 20, 26], true);
circle(sx(center.x), sy(center.y), 760 * S, [22, 34, 28], true);
// forest ring (deterministic)
let seed = 42; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
for (let i = 0; i < 90; i++) {
  const a = rnd() * Math.PI * 2, r = (1120 + rnd() * 380) * S, x = sx(center.x) + Math.cos(a) * r, y = sy(center.y) + Math.sin(a) * r, rr = (26 + rnd() * 30);
  if (x > 10 && x < CW - 10 && y > 10 && y < CH - 10) circle(x, y, rr, [24 + (i % 3) * 2, 44, 30], true);
}
// platform + stair + wall band
rect(sx(center.x + hevenPlatform.left), sy(center.y + hevenPlatform.top), sx(center.x + hevenPlatform.right), sy(center.y + hevenPlatform.bottom), [74, 72, 62], true);
rect(sx(center.x + hevenPlatform.left), sy(center.y + hevenPlatform.top), sx(center.x + hevenPlatform.right), sy(center.y + hevenPlatform.bottom), [150, 140, 110], false);
rect(sx(center.x - hevenPlatform.stair.width / 2), sy(center.y + hevenPlatform.stair.top), sx(center.x + hevenPlatform.stair.width / 2), sy(center.y + hevenPlatform.stair.bottom), [88, 82, 66], true);
rect(sx(center.x + wallBand.left), sy(center.y + wallBand.top), sx(center.x + wallBand.right), sy(center.y + wallBand.bottom), [96, 92, 80], true);
rect(sx(center.x + wallBand.left), sy(center.y + wallBand.top), sx(center.x + wallBand.right), sy(center.y + wallBand.bottom), [170, 160, 130], false);
// paths
for (const p of hevenPaths) for (let i = 1; i < p.length; i++) line(sx(p[i - 1].x), sy(p[i - 1].y), sx(p[i].x), sy(p[i].y), 16 * S, [122, 100, 66]);
// gates + labels
hevenPaths.forEach((p, i) => {
  circle(sx(p[0].x), sy(p[0].y), 15 * S + 6, [220, 90, 60], true);
  circle(sx(p[0].x), sy(p[0].y), 15 * S + 6, [255, 140, 90], false);
  text(sx(p[0].x) - 40, sy(p[0].y) + 16, `G${i} ${gateLabels[i]}`, [255, 170, 120], 2);
});
circle(sx(airGate.x), sy(airGate.y), 13 * S + 5, [170, 90, 220], true);
text(sx(airGate.x) - 60, sy(airGate.y) - 22, 'AIR HIMMEL NORD', [200, 150, 255], 2);
// slots
hevenSlots.forEach((s, i) => {
  rect(sx(s.x) - 9, sy(s.y) - 9, sx(s.x) + 9, sy(s.y) + 9, [88, 220, 205], true);
  rect(sx(s.x) - 9, sy(s.y) - 9, sx(s.x) + 9, sy(s.y) + 9, [180, 255, 240], false);
  text(sx(s.x) + 12, sy(s.y) - 6, `S${i}`, [150, 240, 225], 2);
});
// monument
circle(sx(center.x), sy(center.y), 26, [240, 200, 90], true);
circle(sx(center.x), sy(center.y), 34, [240, 200, 90], false);
text(sx(center.x) - 70, sy(center.y) + 40, 'KRIEGERDENKMAL HEVEN', [245, 215, 130], 2);
text(sx(center.x) - 44, sy(center.y + wallBand.top) - 26, 'GEDENKWAND NORD', [200, 190, 160], 2);
text(sx(center.x) - 30, sy(center.y + 430), 'TREPPE', [200, 190, 160], 2);
// title + legend
text(PAD, 24, 'LEVEL 8 WIT-TEN-HEVEN - DESIGNENTWURF (26.11.2026)', [240, 220, 160], 3);
text(PAD, 58, `3 BODEN-GATES + 1 AIRGATE - ${hevenSlots.length} SLOTS (maxTowers 12, startEssence 360) - WELLEN 29-32`, [180, 200, 200], 2);
let ly = CH - 260;
text(PAD, ly, 'WELLEN:', [240, 220, 160], 2); ly += 24;
for (const w of waves) { text(PAD, ly, `W${w.wave} ${w.name} - ${w.comp} - ${w.tuning}`, [190, 205, 205], 2); ly += 24; }
text(PAD, ly + 6, 'ROT=GATE, LILA=AIR, TUERKIS=SLOT, GOLD=DENKMAL, GRAU=PLATTFORM/MAUER, BRAUN=WEGE, GRUEN=WALD', [160, 175, 175], 2);

// --- PNG encode ---
function crc32(buf) {
  let t = crc32.t || (crc32.t = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; }));
  let c = 0xffffffff;
  for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(CW, 0); ihdr.writeUInt32BE(CH, 4); ihdr[8] = 8; ihdr[9] = 6;
const raw = Buffer.alloc(CH * (1 + CW * 4));
for (let y = 0; y < CH; y++) { raw[y * (1 + CW * 4)] = 0; img.copy(raw, y * (1 + CW * 4) + 1, y * CW * 4, (y + 1) * CW * 4); }
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);

// --- SVG (same geometry, text native) ---
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const svg = [`<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}" font-family="monospace">`,
  `<rect width="${CW}" height="${CH}" fill="#0b141a"/>`,
  `<circle cx="${sx(center.x)}" cy="${sy(center.y)}" r="${760 * S}" fill="#16221c"/>`];
for (let i = 0; i < 90; i++) {
  const a = (i * 0.0698) % (Math.PI * 2), r = (1120 + ((i * 137) % 380)) * S, x = sx(center.x) + Math.cos(a) * r, y = sy(center.y) + Math.sin(a) * r;
  if (y < CH - 10) svg.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(26 + (i * 53) % 30).toFixed(1)}" fill="#182c1e"/>`);
}
svg.push(`<rect x="${sx(center.x + hevenPlatform.left)}" y="${sy(center.y + hevenPlatform.top)}" width="${(hevenPlatform.right - hevenPlatform.left) * S}" height="${(hevenPlatform.bottom - hevenPlatform.top) * S}" fill="#4a483e" stroke="#968c6e" stroke-width="2"/>`);
svg.push(`<rect x="${sx(center.x - 75)}" y="${sy(center.y + 300)}" width="${150 * S}" height="${240 * S}" fill="#585242"/>`);
svg.push(`<rect x="${sx(center.x + wallBand.left)}" y="${sy(center.y + wallBand.top)}" width="${(wallBand.right - wallBand.left) * S}" height="${(wallBand.bottom - wallBand.top) * S}" fill="#605c50" stroke="#aaa082" stroke-width="2"/>`);
for (const p of hevenPaths) svg.push(`<polyline points="${p.map(q => `${sx(q.x)},${sy(q.y)}`).join(' ')}" fill="none" stroke="#7a6442" stroke-width="${16 * S}" stroke-linecap="round" stroke-linejoin="round"/>`);
hevenPaths.forEach((p, i) => { svg.push(`<circle cx="${sx(p[0].x)}" cy="${sy(p[0].y)}" r="${15 * S + 6}" fill="#dc5a3c" stroke="#ff8c5a" stroke-width="2"/>`); svg.push(`<text x="${sx(p[0].x) - 40}" y="${sy(p[0].y) + 34}" fill="#ffaa78" font-size="16">G${i} ${esc(gateLabels[i])}</text>`); });
svg.push(`<circle cx="${sx(airGate.x)}" cy="${sy(airGate.y)}" r="${13 * S + 5}" fill="#aa5adc"/><text x="${sx(airGate.x) - 60}" y="${sy(airGate.y) - 12}" fill="#c896ff" font-size="16">AIR HIMMEL NORD</text>`);
hevenSlots.forEach((s, i) => { svg.push(`<rect x="${sx(s.x) - 9}" y="${sy(s.y) - 9}" width="18" height="18" fill="#58dccd" stroke="#b4fff0" stroke-width="2"/><text x="${sx(s.x) + 12}" y="${sy(s.y) + 5}" fill="#96f0e1" font-size="14">S${i}</text>`); });
svg.push(`<circle cx="${sx(center.x)}" cy="${sy(center.y)}" r="26" fill="#f0c85a" stroke="#f0c85a" stroke-width="8" stroke-opacity=".5"/><text x="${sx(center.x) - 70}" y="${sy(center.y) + 60}" fill="#f5d782" font-size="16">KRIEGERDENKMAL HEVEN</text>`);
svg.push(`<text x="${sx(center.x) - 44}" y="${sy(center.y + wallBand.top) - 10}" fill="#c8bfa0" font-size="14">GEDENKWAND NORD</text>`);
svg.push(`<text x="${sx(center.x) - 30}" y="${sy(center.y + 430)}" fill="#c8bfa0" font-size="14">TREPPE</text>`);
svg.push(`<text x="${PAD}" y="40" fill="#f0dca0" font-size="24">LEVEL 8 WITTEN-HEVEN - DESIGNENTWURF (26.11.2026)</text>`);
svg.push(`<text x="${PAD}" y="66" fill="#b4c9c9" font-size="14">3 BODEN-GATES + 1 AIRGATE - ${hevenSlots.length} SLOTS (maxTowers 12, startEssence 360) - WELLEN 29-32</text>`);
let syy = CH - 260;
svg.push(`<text x="${PAD}" y="${syy}" fill="#f0dca0" font-size="14">WELLEN:</text>`); syy += 22;
for (const w of waves) { svg.push(`<text x="${PAD}" y="${syy}" fill="#becdd" font-size="14">W${w.wave} ${esc(w.name)} - ${esc(w.comp)} - ${esc(w.tuning)}</text>`); syy += 22; }
svg.push(`<text x="${PAD}" y="${syy + 8}" fill="#a0afaf" font-size="13">ROT=GATE LILA=AIR TUERKIS=SLOT GOLD=DENKMAL GRAU=PLATTFORM/MAUER BRAUN=WEG GRUEN=WALD</text>`);
svg.push('</svg>');

const outDir = path.join(__dirname, '..', 'docs', 'art');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'witten-heven-level8-preview.png'), png);
fs.writeFileSync(path.join(outDir, 'witten-heven-level8-preview.svg'), svg.join('\n'));
console.log(`slots=${hevenSlots.length} gates=${hevenPaths.length} -> docs/art/witten-heven-level8-preview.{png,svg} (${CW}x${CH})`);
