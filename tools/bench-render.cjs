// Reproduzierbarer Rendering-Benchmark: misst JS-Zeit pro draw() und Zeichenoperations-Zahlen.
// Nutzung: node tools/bench-render.cjs [--level N] [--frames N] [--mobile]
const path = require('path');
const { createRenderSandbox, buildStressScene } = require(path.join(__dirname, '../tests/helpers/render-sandbox.cjs'));

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const LEVEL = parseInt(opt('--level', '1'), 10);
const FRAMES = parseInt(opt('--frames', '240'), 10);
const MOBILE = args.includes('--mobile');

const harness = createRenderSandbox({ mobile: MOBILE });
const t = harness.test;
const g = buildStressScene(harness, LEVEL);

const DT = 1 / 60;
let drawNs = 0, updateNs = 0, drawn = 0;
harness.resetCounts();
for (let f = 0; f < FRAMES; f++) {
  let a = process.hrtime.bigint();
  t.update(DT);
  updateNs += Number(process.hrtime.bigint() - a);
  a = process.hrtime.bigint();
  t.draw();
  drawNs += Number(process.hrtime.bigint() - a);
  drawn++;
}

const drawMs = drawNs / 1e6 / drawn;
const updateMs = updateNs / 1e6 / drawn;
const counts = harness.counts, gradients = harness.gradients;
const totalOps = Object.values(counts).reduce((s, v) => s + v, 0);
const canvas = harness.element('game');
const out = {
  level: LEVEL, mobile: MOBILE, frames: drawn,
  drawMsPerFrame: +drawMs.toFixed(3),
  updateMsPerFrame: +updateMs.toFixed(3),
  jsMsPerFrame: +(drawMs + updateMs).toFixed(3),
  opsPerFrame: { total: Math.round(totalOps / drawn), ...(Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, Math.round(v / drawn)]))) },
  gradientsPerFrame: { radial: +(gradients.radial / drawn).toFixed(2), linear: +(gradients.linear / drawn).toFixed(2) },
  entities: { enemies: g.enemies.length, towers: g.towers.length, bullets: g.bullets.length, particles: g.particles.length },
  canvas: { width: canvas.width, height: canvas.height },
  graphicsMode: t.graphicsMode, qualityTier: t.qualityTier
};
console.log(JSON.stringify(out, null, 2));
