'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const textures=JSON.parse(fs.readFileSync('dist/assets/expansion-v2/manifest.json')).assets;
const ready=new Map(),requests=[],waiting=[];
const box={Date,Math,performance:{now:()=>500},DenkmalAssets:{ready:u=>ready.get(u)||null,retain(group,urls){requests.push({group,urls});return new Promise(resolve=>waiting.push(()=>{for(const u of urls){const rec=textures.find(r=>u.includes('/'+r.file+'?'));ready.set(u,{naturalWidth:rec?.size[0]||128,naturalHeight:rec?.size[1]||128});}resolve([]);}));},release(group){for(const u of ready.keys())if(group==='expansion-v2:'+u.split('/').pop().split('?')[0])ready.delete(u);}}};
vm.createContext(box);for(const file of ['persisted-state.js','levels.js','v2-expansion-data.js','v2-expansion.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),box);
const api=box.V2Expansion;
const ctx=()=>({globalAlpha:1,depth:0,draws:[],save(){this.depth++;},restore(){this.depth--;},translate(){},scale(){},drawImage(...a){this.draws.push(a);}});
async function drain(){for(let i=0;i<20;i++){while(waiting.length)waiting.shift()();await new Promise(r=>setImmediate(r));}}
(async()=>{
 for(let i=0;i<3;i++)assert.equal(api.image('enemies-'+i+'.webp'),null);
 assert.equal(requests.length,2,'only two new texture loads can start concurrently');await drain();assert.equal(requests.length,3);
 for(const name of Object.keys(box.V2ExpansionData.actors)){api.image(box.V2ExpansionData.actors[name].file);}await drain();
 for(const [name,spec]of Object.entries(box.V2ExpansionData.actors))for(const [row,kind]of ['attack','hit','death'].entries())for(let frame=0;frame<4;frame++){
  const c=ctx();assert.equal(api.action(c,name,kind,(frame+.1)/4,0,0,70,-1),true);assert.equal(c.depth,0);assert.deepEqual(c.draws[0].slice(1,5),[frame*spec.cell,(spec.row+row)*spec.cell,spec.cell,spec.cell]);
 }
 const c=ctx();api.action(c,'marcel','death',.1,0,0,70,1,true);assert.equal(c.draws[0][1],3*192,'reduced motion uses final death pose');
 box.DenkmalEnemyAnimations={select:e=>e.skin};
 for(let skin=0;skin<21;skin++)for(const state of ['attack','hit','death']){
  const e={skin,type:'guardian',x:0,y:0,attackAnim:state==='attack'?.11:0,hit:state==='hit'?.05:0};
  const c=ctx();assert(api.enemy(c,e,1,{level:1,...(state==='death'?{deathProgress:.5}:{})}));assert.equal(c.depth,0);
 }
 const saved=box.V2ExpansionData;box.V2ExpansionData=undefined;
 const fallback={DenkmalAssets:box.DenkmalAssets,DenkmalEnemyAnimations:box.DenkmalEnemyAnimations,Date,Math,performance:box.performance};vm.createContext(fallback);vm.runInContext(fs.readFileSync('dist/v2-expansion.js','utf8'),fallback);assert.equal(fallback.V2Expansion.enemy(ctx(),{skin:1},1),false,'missing optional data preserves old renderer');box.V2ExpansionData=saved;
 const broken=ctx();broken.drawImage=()=>{throw Error('decode lost');};assert.equal(api.action(broken,'kim','hit',.2,0,0,70),false);assert.equal(broken.depth,0,'failed draw restores Canvas state');
 assert.equal(api.action(ctx(),'missing','hit',.2,0,0,70),false);
 for(let level=1;level<=6;level++){
  const layout={...box.DenkmalLevels.levels[level],center:box.DenkmalLevels.center};const props=api.placements(level,layout);assert(props.length>0);
  for(const p of props){assert(layout.paths.every(path=>box.DenkmalLevels.pathDistance(p,path)>=140));assert(layout.slots.every(s=>Math.hypot(p.x-s.x,p.y-s.y)>=125));}
 }
 api.impact(ctx(),{kind:'cannon',level:1,x:0,y:0,life:1,max:1});await drain();
 for(const [row,[kind,level]]of [['cannon',1],['cannon',2],['boomerang',1],['boomerang',2]].entries()){
  const c=ctx();assert(api.impact(c,{kind,level,x:0,y:0,life:.6,max:1}));assert.deepEqual(c.draws[0].slice(1,5),[256,row*128,128,128]);assert.equal(c.depth,0);
 }
 assert.equal(api.impact(ctx(),{kind:'cannon',level:3,x:0,y:0,life:1,max:1}),false);
 assert.equal(api.impact(ctx(),{kind:'cannon',level:1,x:0,y:0,life:1,max:1,reduced:true}),false);
 assert.equal(Object.keys(box.V2ExpansionData.items).length,21);
 console.log('V2 expansion: 23 identities × 12 action frames, queue cap, failed draw recovery, six-map clearance, material-specific impacts and item mapping passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
