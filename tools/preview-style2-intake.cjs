/* Local, read-only Chromium comparison of candidate images and canonical V5 art.
 * The source directory is intentionally NOT part of the game or its manifest.
 * Usage: TD2_STYLE2_CANDIDATES=/path/to/sources TD2_STYLE2_REVIEW_OUT=/tmp/qa \
 *        node tools/preview-style2-intake.cjs
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const project = path.resolve(__dirname, '..');
const dist = path.join(project, 'dist');
const candidates = path.resolve(process.env.TD2_STYLE2_CANDIDATES || path.join(project, '../project_sources'));
const output = path.resolve(process.env.TD2_STYLE2_REVIEW_OUT || '/tmp/td2-style2-intake-review');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' };
const rows = [
  { label: 'Aktuell · Marcel V5b', url: '/dist/assets/hero/marcel-walk-v5b.webp', cols: 3, rows: 4, col: 1, row: 0 },
  { label: 'Kandidat · Walk (gesperrt)', url: '/candidate/10-marcel_walk_4x3.png', cols: 3, rows: 4, col: 1, row: 0 },
  { label: 'Aktuell · Marcel-Menü V6', url: '/dist/assets/menu/v5-avatars/marcel-guardian-v6.webp', cols: 1, rows: 1, col: 0, row: 0 },
  { label: 'Kandidat · Topdown (gesperrt)', url: '/candidate/05-marcel_topdown_transparent.png', cols: 1, rows: 1, col: 0, row: 0 },
];

const html = `<!doctype html><html lang="de"><head><meta charset="UTF-8" />
<style>body{margin:0;padding:22px;font:15px system-ui;background:#24272e;color:#eee}
h1{font-size:24px;margin:0}p{max-width:1050px;line-height:1.4;color:#ddd}
.row{border:1px solid #555;border-radius:12px;margin:12px 0;padding:14px;background:#30333d}
.row strong{display:block;margin-bottom:12px}.samples{display:flex;gap:18px;align-items:start;flex-wrap:wrap}
.sample{display:flex;flex-direction:column;gap:6px;align-items:center}
canvas{border:1px solid #777;image-rendering:auto}.dark{background:#101721}.light{background:#eee5da}
.hint{font-size:12px;color:#bbb}</style></head><body>
<h1>Denkmal TD2 V5 · Style-2-Kandidaten</h1>
<p>64/128 px · dunkler und heller Hintergrund · keine Runtime-Aktivierung. Die visuelle Identität und exakte Atlas-Anker müssen separat abgenommen werden.</p>
<div id="grid"></div><script>
const rows=${JSON.stringify(rows)};
async function build(){
 for(const item of rows){
  const img=new Image();img.src=item.url;await img.decode();
  const cellW=img.naturalWidth/item.cols,cellH=img.naturalHeight/item.rows;
  const row=document.createElement('section');row.className='row';
  const heading=document.createElement('strong');heading.textContent=item.label+' · '+img.naturalWidth+' × '+img.naturalHeight;
  row.appendChild(heading);
  const samples=document.createElement('div');samples.className='samples';
  for(const size of [64,128])for(const bg of ['dark','light']){
   const wrap=document.createElement('div');wrap.className='sample';
   const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;canvas.className=bg;
   const ctx=canvas.getContext('2d',{alpha:true});
   const scale=Math.min(size/cellW,size/cellH);
   const w=cellW*scale,h=cellH*scale;
   ctx.drawImage(img,item.col*cellW,item.row*cellH,cellW,cellH,(size-w)/2,(size-h)/2,w,h);
   const label=document.createElement('span');label.className='hint';label.textContent=size+' px · '+(bg==='dark'?'dunkel':'hell');
   wrap.append(canvas,label);samples.appendChild(wrap);
  }
  row.appendChild(samples);document.getElementById('grid').appendChild(row);
 }
 document.body.dataset.done='yes';
}
build().catch(e=>{document.body.dataset.error=e.message});
</script></body></html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/review') { res.writeHead(200, { 'Content-Type': 'text/html' }).end(html); return; }
  const which = url.pathname.startsWith('/candidate/') ? 'candidate' : 'dist';
  const root = which === 'candidate' ? candidates : dist;
  const relative = which === 'candidate' ? url.pathname.slice('/candidate/'.length) : url.pathname.replace(/^\/dist\//, '');
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404).end('not found'); return;
  }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  fs.mkdirSync(output, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true,
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader'] });
  const results = { chromium: browser.version(), physicalAndroidTested: false, review: null, gameplay: [] };
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await browser.newPage({ viewport: { width: 1160, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(`${base}/review`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.done === 'yes' || document.body.dataset.error);
    const error = await page.locator('body').getAttribute('data-error');
    assert(!error, error || 'comparison failed');
    await page.screenshot({ path: path.join(output, 'marcel-64-128-compare.png'), fullPage: true });
    results.review = { samples: rows.length * 4, screenshot: 'marcel-64-128-compare.png' };
    await page.close();

    for (const touch of [false, true]) {
      const context = await browser.newContext({ viewport: touch ? { width: 412, height: 915 } : { width: 1280, height: 800 },
        hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
      const scene = await context.newPage();
      const errors = [], failed = [];
      scene.on('pageerror', error => errors.push(error.message));
      scene.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
      await scene.goto(`${base}/dist/index.html`, { waitUntil: 'networkidle' });
      await scene.locator('#td2Loading').waitFor({ state: 'detached', timeout: 45000 });
      const activeLevel = await scene.evaluate(async () => {
        DenkmalTestHooks.startGame(1);
        HeroSaga.continueStory();
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return DenkmalTestHooks.getGame()?.level;
      });
      await scene.screenshot({ path: path.join(output, touch ? 'mobile-gameplay.png' : 'desktop-gameplay.png') });
      assert.equal(activeLevel, 1);
      assert.deepEqual(errors, []);
      assert.deepEqual(failed, []);
      results.gameplay.push({ touchEmulation: touch, level: activeLevel, scriptErrors: errors, failedRequests: failed });
      await context.close();
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
