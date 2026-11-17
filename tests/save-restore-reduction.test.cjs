/* Regression for the save/restore hot-path reduction (2026-11): the per-frame
 * draw helpers no longer push/pop the Canvas state stack; they restore only
 * the fields they set. Behavior stays identical, state stays clean.
 * Run: node tests/save-restore-reduction.test.cjs */
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');

// --- 1. combat-fx.js: drawDamage and drawParticle restore state without save/restore ---
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
class AudioContext{state='running';currentTime=0;destination={};createGain(){return{gain:param(),connect(){return this;},disconnect(){}};}createOscillator(){return{frequency:param(),connect(){return this;},disconnect(){},start(){},stop(){}};}}
const c={AudioContext,Math};vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/combat-fx.js'),'utf8'),c);
const fx=c.DenkmalCombatFX;

// Matrix-tracking 2D-context stub: records every state-relevant call.
function makeCtx(){
  const ops=[];let matrix=[1,0,0,1,0,0];
  const multiply=m=>{const[a,b,cc,d,e,f]=matrix,[A,B,C,D,E,F]=m;matrix=[a*A+cc*B,b*A+d*B,a*C+cc*D,b*C+d*D,a*E+cc*F+e,b*E+d*F+f];};
  const ctx={
    globalAlpha:1,textAlign:'start',font:'10px sans-serif',lineWidth:1,strokeStyle:'#000',fillStyle:'#000',lineCap:'butt',
    save(){ops.push('save');},restore(){ops.push('restore');},
    translate(x,y){multiply([1,0,0,1,x,y]);},scale(x,y){multiply([x,0,0,y,0,0]);},
    beginPath(){},arc(){},fill(){ops.push('fill');},stroke(){ops.push('stroke');},
    moveTo(){},lineTo(){},
    strokeText(){ops.push('strokeText');},fillText(){ops.push('fillText');},
  };
  ctx.__ops=ops;ctx.__matrix=()=>matrix;
  return ctx;
}

// drawDamage: per-text state (alpha, align, font, width, stroke, fill) restored, transform identity.
{
  const ctx=makeCtx();const before={alpha:ctx.globalAlpha,align:ctx.textAlign,font:ctx.font,width:ctx.lineWidth,stroke:ctx.strokeStyle,fill:ctx.fillStyle,matrix:ctx.__matrix().slice()};
  const game={damageTexts:[{x:10,y:20,amount:5,life:.8,maxLife:1,crit:false},{x:30,y:40,amount:99,life:.5,maxLife:1,crit:true}]};
  fx.drawDamage(ctx,game);
  assert.equal(ctx.__ops.filter(op=>op==='strokeText').length,2,'both damage texts stroke');
  assert.equal(ctx.__ops.filter(op=>op==='fillText').length,2,'both damage texts fill');
  assert.deepEqual(ctx.__ops.filter(op=>op==='save'||op==='restore'),[],'drawDamage avoids save/restore churn');
  assert.equal(ctx.globalAlpha,before.alpha,'drawDamage restores globalAlpha');
  assert.equal(ctx.textAlign,before.align,'drawDamage restores textAlign');
  assert.equal(ctx.font,before.font,'drawDamage restores font');
  assert.equal(ctx.lineWidth,before.width,'drawDamage restores lineWidth');
  assert.equal(ctx.strokeStyle,before.stroke,'drawDamage restores strokeStyle');
  assert.equal(ctx.fillStyle,before.fill,'drawDamage restores fillStyle');
  ctx.__matrix().forEach((v,i)=>assert.ok(Math.abs(v-before.matrix[i])<1e-9,'drawDamage restores the transform'));
}

// drawParticle: each branch restores the fields it set, without save/restore.
{
  const cases=[
    {label:'ring',p:{ring:true,life:.4,max:1,r:6,color:'#fff'},sets:['globalAlpha','strokeStyle','lineWidth'],paint:'stroke'},
    {label:'flash',p:{flash:true,life:.4,max:1,r:4,color:'#fff'},sets:['globalAlpha','fillStyle'],paint:'fill'},
    {label:'bolt',p:{bolt:true,life:.4,max:1,r:2,color:'#fff',vx:10,vy:0},sets:['globalAlpha','strokeStyle','lineWidth','lineCap'],paint:'stroke'},
    {label:'muzzle',p:{muzzle:true,life:.4,max:1,r:2,color:'#fff',vx:10,vy:0},sets:['globalAlpha','strokeStyle','lineWidth'],paint:'stroke'},
  ];
  const defaults={globalAlpha:1,fillStyle:'#feedcb',strokeStyle:'#0f1a1c',lineWidth:2,lineCap:'square'};
  for(const {label,p,sets,paint} of cases){
    const ctx=makeCtx();Object.assign(ctx,defaults);
    assert.equal(fx.drawParticle(ctx,p),true,label+' branch handles the particle');
    assert.deepEqual(ctx.__ops.filter(op=>op==='save'||op==='restore'),[],label+' avoids save/restore churn');
    assert.ok(ctx.__ops.includes(paint),label+' paints');
    for(const field of sets)assert.equal(ctx[field],defaults[field],label+' restores '+field);
  }
  // Particles the helper does not own still return false so the vector fallback draws them.
  assert.equal(fx.drawParticle(makeCtx(),{life:.4,max:1,r:2,color:'#fff'}),false,'unstyled particles fall through');
}

// --- 2. style2-phase6.js: upright applies the exact inverse transform in finally ---
{
  const box={Image:class{},Math,localStorage:{getItem(){return null;}}};vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/style2-phase6.js'),'utf8'),box);
  const p=box.Style2Phase6;
  let matrix=[1,0,0,.82,0,0];const before=matrix.slice();
  const multiply=m=>{const[a,b,c,d,e,f]=matrix,[A,B,C,D,E,F]=m;matrix=[a*A+c*B,b*A+d*B,a*C+c*D,b*C+d*D,a*E+c*F+e,b*E+d*F+f];};
  const ctx={save(){throw new Error('upright must not push the state stack');},restore(){throw new Error('upright must not pop the state stack');},translate(x,y){multiply([1,0,0,1,x,y]);},scale(x,y){multiply([x,0,0,y,0,0]);}};
  let painted=0;
  p.upright(ctx,{x:1536,y:2048},()=>{painted++;});
  assert.equal(painted,1,'upright paints exactly once');
  matrix.forEach((v,i)=>assert.ok(Math.abs(v-before[i])<1e-9,'upright restores the world transform'));
  // An exception inside paint must still restore the transform.
  assert.throws(()=>p.upright(ctx,{x:100,y:200},()=>{throw new Error('boom');}),/boom/);
  matrix.forEach((v,i)=>assert.ok(Math.abs(v-before[i])<1e-9,'upright restores the transform even when paint throws'));
}

// --- 3. game.js: shadow() and the armor badge are save/restore-free hot paths ---
{
  const source=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
  const line=source.split('\n').find(l=>l.trim().startsWith('function shadow('));
  assert.ok(line,'shadow must exist in production');
  assert.ok(!line.includes('ctx.save()')&&!line.includes('ctx.restore()'),'shadow avoids save/restore churn');
  assert.ok(line.includes('ctx.fillStyle=prevFill'),'shadow restores the previous fill style');
  const armorLine=source.split('\n').find(l=>l.includes("e.armor>0){const sx"));
  assert.ok(armorLine,'armor badge must exist in production');
  assert.ok(!armorLine.includes('ctx.save()')&&!armorLine.includes('ctx.restore()'),'armor badge avoids save/restore churn');
  assert.ok(armorLine.includes('ctx.fillStyle=prevFill'),'armor badge restores the previous fill style');
}

// --- 4. Whole-frame budget: the 40-enemy benchmark frame stays below the
//        pre-patch save/restore level (260) with identical paint counts.
{
  const makeGame=(()=>{  // same sandbox patch technique as tools/bench-td2.cjs
    const fs2=require('fs'),orig=fs2.readFileSync;
    fs2.readFileSync=(p,...r)=>{
      const s=orig(p,...r);
      return String(p).endsWith('game.js')?s
        .replace('function tutorialSeen(){return preferences.tutorialSeen;}','function tutorialSeen(){return true;}')
        .replace("const ctx = canvas.getContext('2d', {alpha:false});","globalThis.__ctxCounts={};const ctx = (()=>{const raw=canvas.getContext('2d',{alpha:false});return new Proxy(raw,{get(t,k){const v=t[k];return typeof v==='function'?(...a)=>{const C=globalThis.__ctxCounts;C[k]=(C[k]||0)+1;return v.apply(t,a)}:v}})})();"):s;
    };
    return require('./helpers/game.cjs');
  })();
  const {t,box,element}=makeGame();
  t.startGame(1,'campaign');
  for(let i=0;i<10&&t.state==='story';i++)element('storyContinue').onclick();
  const g=t.game;
  g.level=3;g.mode='endless';g.wave=25;g.waveTotal=1e9;g.intermission=0;g.spawnTimer=.01;g.essence=99999;
  const slots=box.DenkmalLevels.levels[3].slots;
  for(let i=0;i<8&&i<slots.length;i++)g.towers.push({x:slots[i].x,y:slots[i].y,r:18,damage:20,fireRate:.6,fireCd:0,range:290,kind:['bow','cannon','mage','rift','boomerang'][i%5],level:(i%3)+1,spent:40,targetMode:'first'});
  g.hero.x=box.DenkmalLevels.center.x+120;g.hero.y=box.DenkmalLevels.center.y;
  for(let i=0;i<600&&g.enemies.filter(e=>!e.dead).length<40;i++)t.update(1/60);
  for(let i=0;i<300;i++){g.monument.hp=g.monument.maxHp;g.hero.hp=g.hero.maxHp;if(g.enemies.length<40)g.spawnTimer=Math.min(g.spawnTimer,.01);t.update(1/60);t.draw();}
  const C=box.__ctxCounts;
  const perFrame=n=>n/300;
  assert.ok(perFrame(C.save||0)<=150,'save/frame budget (was ~231 pre-patch): got '+perFrame(C.save||0));
  assert.ok(perFrame(C.restore||0)<=150,'restore/frame budget (was ~231 pre-patch): got '+perFrame(C.restore||0));
  // Paint work must stay identical to the pre-patch measurement in this scenario:
  // fill ~209.4, stroke ~69.4, drawImage 10 (allowance covers simulation randomness).
  assert.ok(perFrame(C.fill||0)>=200&&perFrame(C.fill||0)<=220,'path fills unchanged (pre-patch ~209): got '+perFrame(C.fill||0));
  assert.ok(perFrame(C.stroke||0)>=64&&perFrame(C.stroke||0)<=75,'strokes unchanged (pre-patch ~69): got '+perFrame(C.stroke||0));
  assert.ok(perFrame(C.drawImage||0)===10,'sprite copies unchanged (pre-patch 10): got '+perFrame(C.drawImage||0));
}

console.log('Save/restore hot-path reduction tests passed.');
