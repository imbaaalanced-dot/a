'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
assert.ok(fs.existsSync('dist/elemental-sprites.js'),'elemental image renderer exists');
const images=[],draws=[],rotations=[];
class FakeImage{complete=false;naturalWidth=0;naturalHeight=0;constructor(){images.push(this);}}
const ctx={globalAlpha:1,save(){},restore(){},translate(){},rotate(a){rotations.push(a);},drawImage(...args){draws.push(args);}};
const box={Image:FakeImage,Math};vm.createContext(box);vm.runInContext(fs.readFileSync('dist/elemental-sprites.js','utf8'),box);
const art=box.ElementalSprites;
assert.equal(images.length,0,'images load only when used');
assert.equal(art.drawTower(ctx,'rift',100,200,1),false,'cold image permits procedural fallback');
images[0].complete=true;images[0].naturalWidth=1536;images[0].naturalHeight=512;
assert.equal(art.drawTower(ctx,'rift',100,200,3),true);assert.deepEqual(draws.at(-1).slice(1,5),[1024,0,512,512]);
assert.equal(art.drawTower(ctx,'bow',0,0,1),false);
images.at(-1).complete=true;images.at(-1).naturalWidth=1536;
assert.equal(art.drawTower(ctx,'bow',0,0,3),true);
assert.deepEqual(draws.at(-1).slice(1,5),[1024,0,512,512]);
assert.equal(art.drawProjectile(ctx,{kind:'bow'}),false,'bow projectiles retain existing renderer');
assert.equal(art.drawProjectile(ctx,{kind:'mage',level:2,x:10,y:20,vx:0,vy:100}),false);
images.at(-1).complete=true;images.at(-1).naturalWidth=384;images.at(-1).naturalHeight=128;
assert.equal(art.drawProjectile(ctx,{kind:'mage',level:2,x:10,y:20,vx:0,vy:100}),true);
assert.equal(rotations.at(-1),Math.PI/2);assert.deepEqual(draws.at(-1).slice(1,5),[128,0,128,128]);
const p={style2Impact:true,kind:'rift',level:3,x:20,y:30,max:1,life:1};assert.equal(art.drawImpact(ctx,p),false);
images.at(-1).complete=true;images.at(-1).naturalWidth=768;images.at(-1).naturalHeight=384;
for(let frame=0;frame<6;frame++){p.life=1-(frame+.1)/6;assert.equal(art.drawImpact(ctx,p),true);assert.deepEqual(draws.at(-1).slice(1,5),[frame*128,256,128,128]);}
const warm=images.length;for(let i=0;i<20;i++)art.drawTower(ctx,'rift',100,200,2);assert.equal(images.length,warm,'warm rendering does not recreate images');
assert.equal(art.drawImpact(ctx,{...p,life:0}),true);assert.equal(ctx.globalAlpha,0,'final phase fades completely');
const source=fs.readFileSync('dist/style2-towers.js','utf8');for(const fn of ['drawTower','drawProjectile','drawImpact'])assert.ok(source.includes('ElementalSprites?.'+fn),'renderer routes '+fn+' to generated assets');
console.log('Generated elemental assets: loading fallback, tier crops, projectile direction, six chronological impact frames and warm reuse passed.');
assert.equal(art.drawTower(ctx,'boomerang',0,0,1),false);
images.at(-1).complete=true;images.at(-1).naturalWidth=1536;
assert.equal(art.drawTower(ctx,'boomerang',0,0,2),true);
assert.deepEqual(draws.at(-1).slice(1,5),[512,0,512,512]);
assert.equal(box.Style2Enemies.draw(ctx,{type:'unknown'}),false);
assert.equal(box.Style2Enemies.draw(ctx,{type:'wraith',x:1,y:2}),false);
images.at(-1).complete=true;images.at(-1).naturalWidth=1024;ctx.scale=()=>{};
for(const [i,type] of ['wraith','runner','brute','archer','guardian','sapper','rootrunner','stoneguard','mistcaller','boss','uprooted'].entries()){
 assert.equal(box.Style2Enemies.draw(ctx,{type,x:1,y:2},-1),true);
 assert.deepEqual(draws.at(-1).slice(1,5),[(i%4)*256,Math.floor(i/4)*256,256,256]);
}
const runner={type:'runner',x:100,y:200};
assert.equal(box.Style2Enemies.draw(ctx,runner,1,0),true,'cold animation falls back to the original enemy atlas');
const animation=images.at(-1);assert.match(animation.src,/enemies-walk-alpha8\.webp/);
animation.complete=true;animation.naturalWidth=1448;animation.naturalHeight=1086;
box.Style2Enemies.draw(ctx,runner,1,0);
const first=draws.at(-1).slice(1,5);
box.Style2Enemies.draw(ctx,runner,1,1/7);
const second=draws.at(-1).slice(1,5);
assert.equal(first[1],1086/3,'runner uses the middle row');
assert.notEqual(first[0],second[0],'moving enemy changes walk frame');

const gameSource=fs.readFileSync('dist/game.js','utf8');
assert.ok(!gameSource.slice(gameSource.indexOf('function upgradeTower('),gameSource.indexOf('function sellTower(')).includes('ElementalSprites'),'tower upgrades never depend on image readiness');
assert.ok(gameSource.slice(gameSource.indexOf('function drawTower('),gameSource.indexOf('function drawBoomerangProjectile(')).includes("drawTower(ctx,'boomerang'"),'boomerang rendering uses atlas');

const cannon={kind:'cannon',level:3,x:10,y:20,vx:1,vy:0};
assert.equal(art.drawProjectile(ctx,cannon),false);
const shell=images.at(-1);assert.match(shell.src,/cannon-projectiles/);
shell.complete=true;shell.naturalWidth=384;shell.naturalHeight=128;
assert.equal(art.drawProjectile(ctx,cannon),true);assert.deepEqual(draws.at(-1).slice(1,5),[256,0,128,128]);
vm.runInContext(fs.readFileSync('dist/style2-cannon.js','utf8'),box);
assert.equal(box.Style2Cannon.drawProjectile(ctx,cannon),true,'live cannon delegates to painted shells');
const impact={cannonImpact:true,kind:'cannon',level:2,x:10,y:20,life:.5,max:1};
assert.equal(art.drawImpact(ctx,{...impact,style2Impact:true}),false);
const hit=images.at(-1);assert.match(hit.src,/cannon-impacts/);hit.complete=true;hit.naturalWidth=768;hit.naturalHeight=384;
assert.equal(box.Style2Cannon.drawImpact(ctx,impact),true,'live impacts delegate to painted six-frame animation');
assert.deepEqual(draws.at(-1).slice(1,5),[384,128,128,128]);
