'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
assert.ok(fs.existsSync('dist/westhofen-enemy-actions.js'),'Westhofen action renderer missing');
const code=fs.readFileSync('dist/westhofen-enemy-actions.js','utf8');
const boxes=[],images=[];let depth=0,alpha=1,throwDraw=false;const stack=[],scales=[];
const ctx={get globalAlpha(){return alpha},set globalAlpha(v){alpha=v},save(){stack.push(alpha);depth++},restore(){alpha=stack.pop();depth--},translate(){},scale(x,y){scales.push([x,y])},drawImage(...a){if(throwDraw)throw Error('decode');boxes.push({a,alpha})}};
const ready=new Map();const requests=[];const sandbox={Math,console,DenkmalAssets:{ready(url){requests.push(url);return ready.get(url)||null}}};vm.createContext(sandbox);vm.runInContext(code,sandbox);const art=sandbox.DenkmalWesthofenEnemyActions;
const e={type:'wraith',x:20,y:40,velX:10,velY:0,hit:0,attackAnim:0};const opts={level:7};
assert.equal(art.draw(ctx,e,1,0,{level:6}),false);assert.equal(requests.length,0);
assert.equal(art.draw(ctx,{...e,type:'gargoyle',flying:true},1,0,opts),false);assert.equal(requests.length,0);
assert.equal(art.draw(ctx,e,1,0,opts),false,'cold art defers');
const urls=['swordsman','guardian','archer','censer','golem'].map(n=>'assets/enemies/westhofen/'+n+'-v1.webp?v=whactors1');
for(const url of urls)ready.set(url,{naturalWidth:576,naturalHeight:url.includes('golem')?720:576});
const before=JSON.stringify(e);function draw(enemy=e,time=0,options=opts){assert.equal(art.draw(ctx,enemy,1,time,options),true);assert.equal(depth,0);return boxes.at(-1)}
assert.equal(draw().a[1],0);assert.equal(draw(e,1/6).a[1],144);
assert.equal(draw({...e,velX:0},5).a[1],0,'idle holds contact pose');
assert.equal(draw({...e,hit:.1,attackAnim:.22}).a[2],288,'hit wins over attack');
assert.equal(draw({...e,attackAnim:.22}).a[2],144);assert.equal(draw({...e,attackAnim:.01}).a[1],432);
assert.equal(draw({...e,hit:.01}).a[1],432);
assert.equal(draw({...e,hit:.1},0,{...opts,deathProgress:1}).a[2],432,'death wins over hit');
assert.equal(draw(e,0,{...opts,deathProgress:9}).a[1],432,'death holds final frame');
assert.equal(draw(e,0,{...opts,deathProgress:-1}).a[1],0);
assert.equal(draw(e,NaN).a[1],0);
assert(Number.isFinite(draw({...e,visualVariant:Number.MAX_VALUE},Number.MAX_VALUE).a[1]),'large finite clocks keep a valid source crop');
assert.equal(draw(e,0,{...opts,deathProgress:NaN}).a[1],0);
assert.equal(draw(e,12,{...opts,low:true}).a[1],0);
assert.equal(draw(e,0,{...opts,reduced:true,deathProgress:0}).a[1],432);
alpha=.4;assert.equal(draw(e,0,{...opts,deathProgress:.5,alphaApplied:true}).alpha,.4,'parent alpha applied once');assert.equal(alpha,.4);
alpha=1;assert.equal(draw(e,0,{...opts,deathProgress:.5}).alpha,.5);assert.equal(alpha,1);
assert.equal(art.draw(ctx,e,-1,0,opts),true);assert.equal(scales.at(-1)[0],-1);
for(const type of ['wraith','runner','guardian','archer','sapper','boss'])for(const progress of [0,.25,.5,.75,1]){const {a}=draw({...e,type},0,{...opts,deathProgress:progress});assert(a[1]>=0&&a[1]+a[3]<=a[0].naturalWidth);assert(a[2]>=0&&a[2]+a[4]<=a[0].naturalHeight);assert.equal(a[5],-72*a[7]/144);assert.equal(a[6],-136*a[8]/144)}
assert.equal(JSON.stringify(e),before,'render leaves enemy data unchanged');
throwDraw=true;assert.equal(art.draw(ctx,e,1,0,opts),false);assert.equal(depth,0);throwDraw=false;
ready.set(urls[0],{naturalWidth:1,naturalHeight:1});assert.equal(art.draw(ctx,e,1,0,opts),false,'bad dimensions defer');ready.delete(urls[0]);assert.equal(art.draw(ctx,e,1,0,opts),false,'failed art defers');
const combined={...sandbox,TD2DirectionalActions:{enemy(){throw Error('old renderer must not shadow ready Westhofen art')}}};ready.set(urls[0],{naturalWidth:576,naturalHeight:576});vm.createContext(combined);vm.runInContext(fs.readFileSync('dist/enemy-animations.js','utf8'),combined);assert.equal(combined.DenkmalEnemyAnimations.draw(ctx,e,1,0,opts),true);
(async()=>{
 class Image{constructor(){images.push(this);this.complete=false;this.naturalWidth=576;this.naturalHeight=576}set src(v){this.url=v}get src(){return this.url}decode(){return Promise.resolve()}}
 const box={Image,console};vm.createContext(box);vm.runInContext(fs.readFileSync('dist/asset-manager.js','utf8'),box);const assets=box.DenkmalAssets;
 assert.equal(images.length,0);assert.equal(assets.levelAssets[7].length,5);
 const p=assets.level(7);const first=images.length;assets.level(7);assert.equal(images.length,first,'level group reuses images');assets.release('level:7');for(const image of images)await image.onload?.();await p;assert(images.every(im=>im.src===''),'in-flight load is evicted after release');
 assert(!assets.levelAssets[6].some(s=>s.includes('westhofen')),'no eager loading from prior level');
 console.log('Westhofen renderer: scope, priority, timing, bounds, alpha, mirrors, fallback, read-only state, early routing and release during decode passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
