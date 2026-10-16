/* Final Style 2 release boundaries: node tests/style2-release.test.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const html=read('dist/index.html'),preloader=read('dist/preloader.js'),game=read('dist/game.js'),mapArt=read('dist/map-art.js');
const manifests=[1,2,3,4].map(level=>JSON.parse(read(`dist/assets/maps/level-${level}/map.json`)));
const versions=new Set(manifests.map(item=>item.version));
assert.deepEqual([...versions],['v4-style2-1'],'all map manifests share one reviewed cache version');
assert.ok(html.includes('map-art.js?v=v4style2-1'),'index cache key matches Style 2 release');
assert.ok(mapArt.includes('map.json?v=v4style2-1'),'loader cache key matches Style 2 release');
assert.doesNotMatch(preloader,/assets\/maps\/level-[1-4]/,'boot preloader must not eagerly request any map');
assert.match(preloader,/DenkmalPreloadSelectedMap/,'only selected-map preload entry point is exposed');
assert.match(game,/debug=maps/,'map debug remains explicit');
assert.doesNotMatch(html,/data-map-debug="true"/,'map debug is disabled by default');
for(const manifest of manifests)assert.ok(manifest.layers.find(layer=>layer.pass==='decor-front').actorNearOpacity>=.22);

const testsWorkflow=read('.github/workflows/test.yml');
for(const command of ['node tests/map-manifest.test.cjs','node tests/map-renderer.test.cjs','node tests/map-layout.test.cjs --levels 1 2 3 4','python tests/map-assets.test.py --levels 1 2 3 4','node tests/style2-release.test.cjs'])
  assert.ok(testsWorkflow.includes(command),`CI must run ${command}`);

const pages=read('.github/workflows/pages.yml');
assert.ok(pages.includes("github.event_name == 'workflow_dispatch' && github.ref_name == 'feature/v4-graphic-overhaul-style2'"),'Style 2 publish must be manual and branch-scoped');
assert.ok(pages.includes('/v4-style2'),'Style 2 uses an isolated tester directory');
assert.ok(pages.includes('! -name v4-style2'),'main root publish preserves the Style 2 tester');
assert.ok(read('tests/assets.test.py').includes('map-assets.test.py'),'standard asset verification includes all map layers');
console.log('Style 2 release: lazy loading, cache keys, CI, and isolated manual publish gate passed.');
