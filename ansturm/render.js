import {sprite} from './sprites.js?v=v6-style2full1';
import {ENEMY} from './config.js';import {getStats} from './model.js?v=v410a1sim1';
// Graphics pass: atmosphere + readability. Every layer below is built once and
// cached; per frame it costs two drawImage calls plus one small drawImage per
// enemy. Nothing allocates gradients or canvases in the render loop.
let atmosphere=null,enemyGlows=null;
const FOG_BLOBS=[[-.48,.30,.9],[-.24,-.52,.75],[.46,.38,1.05],[.58,-.34,.8],[-.62,-.18,.85],[.30,.62,.95]];
function getAtmosphere(w,h,unit,cx,cy){
 const key=Math.round(w)+'x'+Math.round(h);
 if(atmosphere&&atmosphere.key===key)return atmosphere;
 const iw=Math.max(1,Math.round(w)),ih=Math.max(1,Math.round(h));
 const glow=document.createElement('canvas');glow.width=iw;glow.height=ih;
 const q=glow.getContext('2d');
 // Warm key light from the upper left (ART-DIRECTION: warmes Licht von links oben).
 q.globalCompositeOperation='lighter';
 let pool=q.createRadialGradient(cx-unit*.18,cy-unit*.26,Math.max(1,unit*.06),cx-unit*.18,cy-unit*.26,unit*1.15);
 pool.addColorStop(0,'rgba(255,196,118,.20)');pool.addColorStop(.5,'rgba(240,168,92,.10)');pool.addColorStop(1,'rgba(240,168,92,0)');
 q.fillStyle=pool;q.fillRect(0,0,iw,ih);
 q.globalCompositeOperation='source-over';
 // Edge vignette grounds the arena and pulls focus onto the monument.
 let vig=q.createRadialGradient(cx,cy,Math.min(iw,ih)*.34,cx,cy,Math.max(iw,ih)*.78);
 vig.addColorStop(0,'rgba(6,10,18,0)');vig.addColorStop(1,'rgba(6,10,18,.42)');
 q.fillStyle=vig;q.fillRect(0,0,iw,ih);
 const fog=document.createElement('canvas');fog.width=iw;fog.height=ih;
 const f=fog.getContext('2d');
 for(const [dx,dy,scale] of FOG_BLOBS){
  const bx=cx+dx*unit,by=cy+dy*unit,br=Math.max(4,unit*.42*scale);
  let b=f.createRadialGradient(bx,by,br*.08,bx,by,br);
  b.addColorStop(0,'rgba(148,170,196,.26)');b.addColorStop(1,'rgba(148,170,196,0)');
  f.fillStyle=b;f.beginPath();f.arc(bx,by,br,0,Math.PI*2);f.fill();
 }
 return atmosphere={key,glow,fog};
}
function getEnemyGlows(){
 if(enemyGlows)return enemyGlows;
 const make=(color)=>{const c=document.createElement('canvas');c.width=64;c.height=64;const q=c.getContext('2d');const g=q.createRadialGradient(32,32,3,32,32,30);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=g;q.fillRect(0,0,64,64);return c;};
 // Warm rim lifts enemies off the dark floor; frost marks chilled enemies.
 enemyGlows={warm:make('rgba(255,204,130,.38)'),frost:make('rgba(140,215,255,.38)')};
 return enemyGlows;
}
export function renderArena(ctx,s,{width,height,pixelRatio=1}){const dpr=Math.min(2,pixelRatio),c=ctx.canvas;if(c.width!==Math.round(width*dpr)||c.height!==Math.round(height*dpr)){c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);const w=width,h=height,cx=w/2,cy=h/2,unit=Math.min(w*.44,h*.44);ctx.clearRect(0,0,w,h);
let grad=ctx.createRadialGradient(cx,cy,4,cx,cy,Math.max(w,h)*.75);grad.addColorStop(0,'#34403e');grad.addColorStop(1,'#111923');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
// The floor is screen anchored: scaling it with the world unit would repeat hard seams.
ctx.save();ctx.globalAlpha=.5;sprite(ctx,'arena_ground',cx,h,w,h);ctx.restore();
const atmo=getAtmosphere(w,h,unit,cx,cy);ctx.drawImage(atmo.glow,0,0,w,h);
ctx.save();ctx.translate(cx,cy);ctx.strokeStyle='#c3b18d14';ctx.lineWidth=1;for(let n=0;n<11;n++){let d=n*unit/5;ctx.beginPath();ctx.moveTo(-w/2,d);ctx.lineTo(w/2,d);ctx.moveTo(d,-h/2);ctx.lineTo(d,h/2);ctx.stroke();}
const range=getStats(s).rangeRatio*unit;ctx.strokeStyle='#d8b46940';ctx.lineWidth=2;ctx.setLineDash([5,7]);ctx.beginPath();ctx.arc(0,0,range,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
// Ground mist breathes on simulation time only; the layer itself is cached.
ctx.globalAlpha=.45+.3*Math.sin(s.elapsed*.4);ctx.drawImage(atmo.fog,0,0,w,h);ctx.globalAlpha=1;
ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(0,unit*.09,unit*.18,unit*.09,0,0,Math.PI*2);ctx.fill();
if(!sprite(ctx,'monument',0,unit*.16,unit*.58,unit*.66)){ctx.fillStyle='#796b5e';ctx.strokeStyle='#cfad7b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-unit*.11,unit*.08);ctx.lineTo(-unit*.14,-unit*.03);ctx.lineTo(unit*.14,-unit*.03);ctx.lineTo(unit*.11,unit*.08);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#88919a';ctx.fillRect(-unit*.07,-unit*.2,unit*.14,unit*.17);ctx.fillStyle='#b1a492';ctx.fillRect(-unit*.04,-unit*.3,unit*.08,unit*.13);ctx.fillStyle='#e4c37c';ctx.beginPath();ctx.moveTo(0,-unit*.39);ctx.lineTo(-unit*.045,-unit*.29);ctx.lineTo(unit*.045,-unit*.29);ctx.closePath();ctx.fill();
}
if(s.upgrades.shield){ctx.strokeStyle='#5abcf7aa';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,unit*.17,0,Math.PI*2);ctx.stroke();}if(s.upgrades.tesla){ctx.fillStyle='#63cfff';for(let i=0;i<4;i++){let a=i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*unit*.14,Math.sin(a)*unit*.14,4+s.upgrades.tesla,0,Math.PI*2);ctx.fill();}}
for(const [i,id] of ['multishot','tesla','explosion','frost','shield','fire','pierce'].entries()){const n=s.upgrades[id]||0;if(n){const theta=(i/7)*Math.PI*2-Math.PI/2;const k='weapon_'+id+'_'+Math.min(3,n);sprite(ctx,k,Math.cos(theta)*unit*.26,Math.sin(theta)*unit*.26,unit*.15,unit*.19);}}
const glows=getEnemyGlows();
for(const e of s.enemies){const x=e.x*unit,y=e.y*unit,p=ENEMY[e.type],r=e.type==='boss'?Math.max(13,unit*.095):['armored','shieldbearer','siege'].includes(e.type)?Math.max(8,unit*.05):Math.max(7,unit*.036);const chilled=e.slowUntil>s.elapsed,walkT=(chilled?.35:1)*s.elapsed,d=Math.hypot(e.x,e.y),nx=-(e.x/(d||1)),ny=-(e.y/(d||1)),attacking=d<=.1002,attackPulse=Math.sin(s.elapsed*(chilled?2.1:4.6)+e.id*1.13),eStep=attacking?attackPulse:Math.sin(walkT*(e.type==='runner'?10:7)+e.id*1.73),bob=attacking?Math.max(0,attackPulse)*r*(chilled?.03:.1):eStep*r*(chilled?.05:.16),sway=attacking?0:Math.cos(walkT*(e.type==='runner'?8:5)+e.id*1.73)*r*(chilled?.02:.05),lunge=attacking?Math.max(0,attackPulse)*r*(chilled?.08:.22):0;
// Readability rim: one cached glow blob per enemy, biased toward the key light so the silhouette separates from the dark floor.
const glowImg=chilled?glows.frost:glows.warm,gw=r*3.4,gh=r*2.4;ctx.drawImage(glowImg,x-gw*.5-r*.25,y-gh*.5-r*1.2,gw,gh);
ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(x,y+r*.6,r*1.1*(1-eStep*.06),r*.55*(1-eStep*.06),0,0,7);ctx.fill();ctx.save();ctx.translate(x+sway+nx*lunge,y+r*.8+bob+ny*lunge);ctx.rotate(attacking?attackPulse*.12:eStep*(chilled?.01:.05));if(!sprite(ctx,e.spriteKey||`enemy_${e.type}`,0,0,r*2.7,r*3.5)){ctx.fillStyle=p.color;ctx.strokeStyle='#e3c9a5';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();ctx.stroke();}ctx.restore();if(attacking&&attackPulse>0){ctx.strokeStyle='#ffd28f';ctx.globalAlpha=Math.min(.75,attackPulse*.75);ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r*1.35,Math.atan2(ny,nx)-.45,Math.atan2(ny,nx)+.45);ctx.stroke();ctx.globalAlpha=1;}if(e.type==='boss'){
const warning=e.bossPhase==='warning',protectedPhase=e.bossPhase==='protected';ctx.strokeStyle=warning?'#ffbc55':protectedPhase?'#79d7ff':'#b3f39c';ctx.lineWidth=warning?3:2;ctx.setLineDash(warning?[5,4]:[]);ctx.beginPath();ctx.arc(x,y,r*1.5,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
// Boss tells: all special attacks are visible before they resolve.
if(warning){const pulse=.55+.25*Math.sin(s.elapsed*9);ctx.strokeStyle='rgba(255,188,85,'+pulse+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x,y,e.spriteKey==='boss_stonebreaker'?unit*.3:r*2.1,0,Math.PI*2);ctx.stroke();}
if(e.bossPhase==='charge'){ctx.strokeStyle='#ff7658bb';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x*.55,y*.55);ctx.stroke();}
if(e.bossPhase==='haste'){ctx.strokeStyle='#c487ff88';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,unit*.45,0,Math.PI*2);ctx.stroke();}
if(e.bossPhase==='vulnerable'||e.bossPhase==='recovery'){ctx.strokeStyle='#a4e6a488';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r*1.8,0,Math.PI*2);ctx.stroke();}
ctx.fillStyle='#fff3d0';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(e.bossPhase==='warning'?'! '+e.bossTimer.toFixed(1)+'s':e.bossPhase==='protected'?'SCHUTZ':e.bossPhase==='vulnerable'?'VERWUNDBAR':e.bossPhase==='charge'?'ANSTURM':e.bossPhase==='haste'?'TEMPO':'',x,y-r-14);
}
// Health plates get a dark backing and a hairline light rim so they stay readable over floor, fog and glow.
ctx.fillStyle='#0d120e';ctx.fillRect(x-r-1,y-r-8.5,r*2+2,6);ctx.strokeStyle='#e8dcc42e';ctx.lineWidth=1;ctx.strokeRect(x-r-.5,y-r-8,r*2+1,5);ctx.fillStyle=e.burnUntil>s.elapsed?'#ff9b50':'#8fd478';ctx.fillRect(x-r,y-r-7,r*2*Math.max(0,e.hp/e.maxHp),4);}
const dmgAge=s.elapsed-s.lastDamage;if(dmgAge<.14){ctx.strokeStyle='#ff8f66';ctx.globalAlpha=1-dmgAge/.14;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,unit*.05,unit*.62,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
for(const e of s.effects){const a=Math.max(0,e.life/(e.total||.45));ctx.globalAlpha=a;if(e.type==='projectile'){const x=(e.tx||0)*e.progress*unit,y=(e.ty||0)*e.progress*unit;if(!sprite(ctx,e.spriteKey,x,y,unit*.105,unit*.12)){ctx.fillStyle='#ffe29b';ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill();}}else if(e.type==='impact'||e.type==='tesla'){if(!sprite(ctx,e.spriteKey,e.x*unit,e.y*unit,unit*.18,unit*.17)){ctx.strokeStyle=e.type==='tesla'?'#71d9ff':e.spriteKey==='effect_fire'?'#ff9851':e.spriteKey==='effect_ice'?'#8edcff':e.spriteKey==='effect_lance'?'#d4a7ff':'#fff1b9';ctx.lineWidth=e.type==='tesla'?3:2;ctx.beginPath();ctx.arc(e.x*unit,e.y*unit,(1-a)*14+4,0,7);ctx.stroke();}}else{ctx.strokeStyle=e.type==='kill'?'#e4b865':'#fff1b9';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x*unit,e.y*unit,(1-a)*14+4,0,7);ctx.stroke();}}ctx.globalAlpha=1;ctx.restore();}
