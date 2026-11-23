/* Size/perspective grid overlay (P1 #330 §2): opt-in via ?td2SizeGrid=1, draws a
   256-world-unit grid with labels over the current viewport, default off.
   Run: node tests/size-grid.test.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
(async()=>{
 const root=path.join(__dirname,'..');
 const source=fs.readFileSync(path.join(root,'dist/size-grid.js'),'utf8');
 function load(search){
  const context={location:{search},Math};
  vm.createContext(context);vm.runInContext(source,context);
  return context.TD2SizeGrid;
 }
 function recorder(){
  const lines=[],texts=[];
  const ctx={save(){},restore(){},beginPath(){},moveTo(x,y){lines.push(['m',x,y]);},lineTo(x,y){lines.push(['l',x,y]);},
   stroke(){},fillText(t,x,y){texts.push([t,x,y]);},set strokeStyle(v){},set fillStyle(v){},set lineWidth(v){},set font(v){},set textAlign(v){},set textBaseline(v){}};
  return {ctx,lines,texts};
 }
 let g=load('');
 assert.equal(g.enabled,false,'default off');
 let r=recorder();
 assert.equal(g.draw(r.ctx,3,{x:100,y:200},800,600),false,'disabled draws nothing');
 assert.equal(r.lines.length,0);
 g=load('?td2SizeGrid=1');
 assert.equal(g.enabled,true);
 r=recorder();
 assert.equal(g.draw(r.ctx,3,{x:100,y:200},800,600),true,'enabled draws grid');
 const vlines=r.lines.filter(l=>l[0]==='m').map(l=>l[1]);
 const hlines=r.lines.filter(l=>l[0]==='l').length>0?r.lines.filter((l,i)=>l[0]==='m'):[];
 assert.ok(vlines.includes(256)&&vlines.includes(512)&&vlines.includes(768),'vertical lines on 256 multiples within viewport');
 assert.ok(!vlines.includes(1280),'line beyond the rounded viewport end not drawn');
 assert.equal(Math.min(...vlines),0,'grid starts at world origin multiple');
 assert.equal(Math.max(...vlines),1024,'grid ends at rounded viewport end');
 assert.ok(r.texts.some(t=>t[0]==='x1024')&&r.texts.some(t=>t[0]==='y1024'),'coordinate labels on 1024 multiples');
 assert.ok(r.texts.some(t=>t[0].includes('Raster 256')),'legend label drawn');
 r=recorder();g.draw(r.ctx,3,{x:100,y:200},800,600);
 const again=r.lines.length;
 r=recorder();g.draw(r.ctx,3,{x:100,y:200},800,600);
 assert.equal(r.lines.length,again,'deterministic draw count');
 r=recorder();
 assert.equal(g.draw(r.ctx,3,null,800,600),false,'no camera -> no draw');
 const amb=fs.readFileSync(path.join(root,'dist/style2-ambience.js'),'utf8');
 assert.ok(amb.includes('TD2SizeGrid?.draw'),'ambience drawAir hooks the grid');
 const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
 assert.ok(html.includes('size-grid.js?v=sizegrid-20261123'),'index.html includes size-grid.js with cache key');
 console.log('Size grid overlay: opt-in, 256wu grid + labels in viewport, deterministic, default off');
})().catch(e=>{console.error(e);process.exitCode=1;});
