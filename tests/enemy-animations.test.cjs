'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
assert.ok(fs.existsSync('dist/enemy-animations.js'),'the new enemy animation renderer exists');
let now=0;const images=[],draws=[],scales=[];
class Image {complete=false;naturalWidth=0;naturalHeight=0;constructor(){images.push(this);}}
const context={save(){},restore(){},translate(){},scale(x,y){scales.push([x,y]);},drawImage(...args){draws.push(args);}};
const box={Image,Math,Date:{now:()=>now},console};vm.createContext(box);vm.runInContext(fs.readFileSync('dist/enemy-animations.js','utf8'),box);
const art=box.DenkmalEnemyAnimations;assert.ok(art);
assert.equal(images.length,0,'new atlas does not download before use');
const enemy={type:'wraith',x:50,y:70,visualVariant:0,velX:10,velY:0};
assert.equal(art.draw(context,enemy,1,0),false,'cold image returns control to existing fallback');
assert.equal(images.length,1);const atlas=images[0];
atlas.complete=true;atlas.naturalWidth=640;atlas.naturalHeight=3360;
const before=JSON.stringify(enemy);
assert.equal(art.draw(context,enemy,1,0),true);const first=draws.at(-1).slice(1,5);
art.draw(context,enemy,1,1/6);assert.notEqual(draws.at(-1)[1],first[0],'simulation time advances the four-frame animation');
assert.equal(JSON.stringify(enemy),before,'drawing does not mutate combat or enemy state');
art.draw(context,enemy,-1,2,{reduced:true});assert.equal(scales.at(-1)[0],-1,'left-facing enemies are mirrored');
const reduced=draws.at(-1).slice(1,5);art.draw(context,enemy,1,10,{reduced:true});assert.deepEqual(draws.at(-1).slice(1,5),reduced,'reduced motion holds one pose');
const stationary={...enemy,velX:0,velY:0};art.draw(context,stationary,1,1);const idle=draws.at(-1).slice(1,5);art.draw(context,stationary,1,5);assert.deepEqual(draws.at(-1).slice(1,5),idle,'stopped ground enemies do not slide through walk frames');
const all=new Set();for(const type of ['wraith','runner','brute','archer','guardian','sapper','rootrunner','stoneguard','mistcaller','boss','uprooted','shadowwing','gargoyle','stormwing']){
 for(let level=1;level<=6;level++)for(let v=0;v<6;v++){
  const e={...enemy,type,visualVariant:v,flying:['shadowwing','gargoyle','stormwing'].includes(type)};
  assert.equal(art.draw(context,e,1,.5,{level}),true,type+' renders');all.add(art.select(e,level));
  const [,x,y,w,h]=draws.at(-1);assert.ok(x>=0&&x+w<=640&&y>=0&&y+h<=3360,'source crop stays inside decoded atlas');
 }
}
assert.equal(all.size,21,'all twenty-one generated designs are reachable');
const flyer={type:'gargoyle',x:0,y:0,flying:true,velX:0,velY:0};art.draw(context,flyer,1,0);const flap=draws.at(-1)[1];art.draw(context,flyer,1,1/6);assert.notEqual(draws.at(-1)[1],flap,'flying enemies flap while hovering');
assert.equal(images.length,1,'warm horde rendering reuses one atlas');
assert.equal(art.draw(context,{type:'unknown'},1,0),false);
atlas.onerror();assert.equal(art.draw(context,enemy,1,1),false,'failed image leaves fallback active');now=6000;assert.equal(art.draw(context,enemy,1,1),false);assert.equal(images.length,2,'failed image retries after backoff');
const game=fs.readFileSync('dist/game.js','utf8');assert.ok(game.indexOf('DenkmalEnemyAnimations?.draw')<game.indexOf('FlightEnemies?.draw(ctx,e'),'new animations render before the flight fallback');
const html=fs.readFileSync('dist/index.html','utf8');assert.match(html,/enemy-animations\.js\?v=/);
console.log('Enemy animation integration: all 21 designs, stable identity, simulation clock, idle/reduced motion, flight, bounds and fallback passed.');
