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
