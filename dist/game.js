(() => {
  'use strict';
  const saga = globalThis.HeroSaga;
  const campaign = globalThis.DenkmalLevels;
  const fx = globalThis.DenkmalCombatFX;
  document.addEventListener('pointerdown',()=>{fx.unlock();fx.mute(!audioOn);});
  document.addEventListener('keydown',()=>{fx.unlock();fx.mute(!audioOn);});
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', {alpha:false});
  const mobileRender=matchMedia('(pointer:coarse)').matches;
  globalThis.DenkmalMobileRender=mobileRender;
  const atlas = new Image();
  const hellscape = new Image();
  const art = {};
  const towerArt = { bow:new Image(), cannon:new Image(), ballista:new Image(), mage:new Image(), mortar:new Image(), rift:new Image(), shrine:new Image() };
  const towerLevelArt = {
    bow:[new Image(),new Image(),new Image()],
    cannon:[new Image(),new Image(),new Image()],
    ballista:[new Image(),new Image(),new Image()],
    rift:[new Image(),new Image(),new Image()]
  };
  // Visible bounds of the original transparent PNGs; retain their source bytes.
  // Rendering ignores uneven transparent margins and keeps each base on its slot.
  const towerSpriteBounds = {
    bow:[[242,118,772,1061],[216,63,852,1165],[238,13,945,1222]],
    cannon:[[202,185,877,937],[156,55,977,1155],[123,30,1009,1205]],
    ballista:[[195,67,916,1127],[134,10,1026,1234],[57,44,1169,1190]]
  };
  for(const kind of ['bow','cannon']){
    towerLevelArt[kind].forEach((image,index)=>{image.src=`assets/tower-${kind}-l${index+1}-v2.png`;});
  }
  atlas.src = 'assets/asset-atlas.png';
  hellscape.src = 'assets/stone-terrain-v27.png';
  towerArt.bow.src = 'assets/tower-bow-infernal-v1.png';
  towerArt.cannon.src = 'assets/tower-cannon-ash-v1.png';
  towerArt.ballista.src = 'assets/tower-ballista-rift-v1.png';
  towerArt.mage.src = 'assets/tower-mage-hellfire-v1.png';
  towerArt.mortar.src = 'assets/tower-mortar-volcanic-v1.png';
  towerArt.rift.src = 'assets/tower-rift-lance-v1.png';
  towerLevelArt.rift[0].src = 'assets/tower-rift-lance-l1.png';
  towerLevelArt.rift[1].src = 'assets/tower-rift-lance-l2.png';
  towerLevelArt.rift[2].src = 'assets/tower-rift-lance-l3.png';
  towerArt.shrine.src = 'assets/tower-warden-shrine-v1.png';
  const WORLD_W=3072,WORLD_H=3072;
  let zoom=.56,zoomMode='wide',graphicsMode='auto';
  function portraitLayout(){return H>W;}
  function zoomForMode(){
    if(zoomMode==='wide')return portraitLayout()?.46:(mobileRender?.50:.52);
    return portraitLayout()?.54:(mobileRender?.58:.62);
  }
  atlas.onload = () => {
    const cut = (name,x,y,w,h,threshold=44) => {
      const c=document.createElement('canvas');c.width=w;c.height=h;
      const q=c.getContext('2d',{willReadFrequently:true});q.drawImage(atlas,x,y,w,h,0,0,w,h);
      const im=q.getImageData(0,0,w,h),d=im.data;
      for(let i=0;i<d.length;i+=4){const lum=(d[i]+d[i+1]+d[i+2])/3;if(lum<threshold){d[i+3]=Math.max(0,Math.min(255,(lum-18)/(threshold-18)*255))}}
      q.putImageData(im,0,0);art[name]=c;
    };
    cut('monument',22,76,390,425,44);
    cut('bow',446,35,86,105);cut('cannon',442,158,100,118);cut('ballista',443,286,101,124);cut('mage',442,425,104,102);
    cut('infantry',795,35,66,90);cut('archer',797,121,70,84);cut('brute',918,205,104,95);cut('boss',795,397,130,132);
  };
  const $ = id => document.getElementById(id);
  const ui = { wave:$('wave'), playerHp:$('playerHp'), playerHpText:$('playerHpText'), monumentHp:$('monumentHp'), monumentHpText:$('monumentHpText'), essence:$('essence'), towerCount:$('towerCount'), towerMax:$('towerMax'), waveProgress:$('waveProgress'), enemyCount:$('enemyCount'), objectiveText:$('objectiveText'), storyText:$('storyText'), toast:$('toast'), start:$('startScreen'), perk:$('perkScreen'), perkGrid:$('perkGrid'), gameover:$('gameover'), gameoverStats:$('gameoverStats'),bossHud:$('bossHud'),bossHp:$('bossHp') };
  const uiCache=new WeakMap();
  function setText(el,value){value=String(value);if(uiCache.get(el)!==value){el.textContent=value;uiCache.set(el,value);}}
  function setWidth(el,value){if(uiCache.get(el)!==value){el.style.width=value;uiCache.set(el,value);}}
  function setHidden(el,hidden){const key='h'+hidden;if(uiCache.get(el)!==key){el.classList.toggle('hidden',hidden);uiCache.set(el,key);}}
  function setDisabled(el,disabled){disabled=!!disabled;if(el.disabled!==disabled)el.disabled=disabled;}
  let W=0,H=0,dpr=1,last=0,time=0,state='start',audioOn=true,shake=0,toastTimer=0;
  let keys={}, mouse={x:0,y:0}, touch={x:0,y:0}, facing={x:0,y:-1}, moveIntent={x:0,y:0}, hudClock=0,camera={x:0,y:0};
  let telemetryOn=false,telemetryFrames=0,telemetryLast=0,telemetryFps=0;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enabledTowers=new Set(['bow','cannon','mage','rift']);
  const towerRoles={
    bow:{label:'PRÄZISION',icon:'➶'},
    cannon:{label:'FLÄCHE',icon:'✹'},
    mage:{label:'KONTROLLE',icon:'✦'},
    rift:{label:'KETTE',icon:'ϟ'}
  };
  const lootTable=[
    {id:'ash',name:'ASCHENSPLITTER',rarity:'GEWÖHNLICH',desc:'+3 Runenstab-Schaden für diesen Lauf.'},
    {id:'rune',name:'RISSRUNE',rarity:'SELTEN',desc:'6 % kürzere Angriffspausen für diesen Lauf.'},
    {id:'seal',name:'WÄCHTERSIEGEL',rarity:'BOSS',desc:'+30 maximale LP, heilt 50 Helden-LP und 80 Monument-LP.'}
  ];
  const towerSpecs={
    bow:{name:'BOGENTURM',cost:25,damage:12,rate:.50,range:300,color:'#d4b879'},
    cannon:{name:'KANONENTURM',cost:35,damage:34,rate:1.15,range:275,color:'#d7a16c',splash:64},
    ballista:{name:'BALLISTATURM',cost:45,damage:45,rate:1.42,range:300,color:'#e8d9ae'},
    mage:{name:'MAGIETURM',cost:46,damage:17,rate:.68,range:282,color:'#69bfff',slow:.58,slowDuration:1.6},
    mortar:{name:'LAVAMÖRSER',cost:62,damage:34,rate:1.55,range:330,color:'#ff7446',splash:74},
    rift:{name:'RIFTLANZE',cost:58,damage:21,rate:.46,range:292,color:'#ee58ff',chain:2},
    shrine:{name:'WÄCHTERSCHREIN',cost:58,damage:13,rate:.62,range:240,color:'#7ee5d7',heal:2.2}
  };
  const enemySpecs={
    wraith:{hp:38,speed:58,damage:11,r:12,bounty:2},
    runner:{hp:25,speed:92,damage:8,r:10,bounty:2},
    brute:{hp:92,speed:39,damage:23,r:18,bounty:3},
    archer:{hp:46,speed:46,damage:10,r:12,bounty:3,attackRange:170,attackCooldown:1.25},
    guardian:{hp:118,speed:34,damage:17,r:17,bounty:4,armor:.32},
    sapper:{hp:62,speed:52,damage:32,r:14,bounty:4,focusMonument:true,attackCooldown:1.05},
    boss:{hp:760,speed:30,damage:46,r:34,bounty:35,attackCooldown:.82}
  };
  const waveSizes=[0,7,9,11,14,16,18,21,24];
  function waveSize(wave){return waveSizes[wave]||Math.min(42,20+wave*2);}
  function enemyTypeForSpawn(wave,index){
    if(wave===5&&index===0)return 'boss';
    const pool=['wraith'];
    if(wave>=2)pool.push('runner');
    if(wave>=3)pool.push('brute');
    if(wave>=4)pool.push('archer');
    if(wave>=6)pool.push('guardian');
    if(wave>=7)pool.push('sapper');
    return pool[(index+wave)%pool.length];
  }
  const wavePlans={
    1:{name:'ERSTE GLUT'},
    2:{name:'HETZJAGD',speed:{runner:1.14}},
    3:{name:'BRECHERSTURM',hp:{brute:1.12}},
    4:{name:'PFEILREGEN',cooldown:{archer:.82}},
    5:{name:'DER BELAGERER'},
    6:{name:'SCHILDWALL',armor:{guardian:.06}},
    7:{name:'SABOTAGE',speed:{sapper:1.15},damage:{sapper:1.12}},
    8:{name:'RISSSTURM',speedAll:1.06,damageAll:1.06}
  };
  function wavePlan(wave){return wavePlans[wave]||{name:wave%2?'NACHTWACHT':'RISSWELLE',speedAll:1+Math.min(.12,Math.max(0,wave-8)*.01)};}
  const targetModes=['first','strongest','nearest','boss'];
  const targetLabels={first:'ERSTER',strongest:'STÄRKSTER',nearest:'NÄCHSTER',boss:'BOSS'};
  const enemyLabels={wraith:'GEIST',runner:'LÄUFER',brute:'BRECHER',archer:'SCHÜTZE',guardian:'WÄCHTER',sapper:'SAPPEUR',boss:'BOSS'};
  function waveComposition(wave){
    const counts={};
    for(let i=0;i<waveSize(wave);i++){const type=enemyTypeForSpawn(wave,i);counts[type]=(counts[type]||0)+1;}
    return counts;
  }
  function wavePreview(wave){return Object.entries(waveComposition(wave)).map(([type,count])=>`${count}× ${enemyLabels[type]||type.toUpperCase()}`).join(' · ');}
  function applyWavePlan(type,base,wave){
    const plan=wavePlan(wave);
    return {
      hp:(plan.hp?.[type]||1),
      speed:(plan.speed?.[type]||1)*(plan.speedAll||1),
      damage:(plan.damage?.[type]||1)*(plan.damageAll||1),
      armor:plan.armor?.[type]||0,
      cooldown:plan.cooldown?.[type]||1
    };
  }
  const chapters=[
    {name:'DAS TOR DER ASCHE',note:'Die Asche trägt noch die Namen der Gefallenen.',until:3},
    {name:'DIE SCHLUCHT DER RISSEN',note:'Unter dem Basalt schlägt ein fremdes Licht.',until:7},
    {name:'DIE VERGLASTE KRONE',note:'Der Aschenkönig hat deine Spur aufgenommen.',until:Infinity}
  ];
  function clearInput(){keys={};touch={x:0,y:0};if(pointerId!==null&&stick.hasPointerCapture?.(pointerId)){try{stick.releasePointerCapture(pointerId);}catch{}}pointerId=null;activeTouchId=null;$('joystick').firstElementChild.style.transform='translate(0,0)';}
  function focusModal(el){clearInput();document.querySelectorAll('#app > :not(.modal)').forEach(n=>n.inert=true);el.querySelector('button')?.focus();}
  function focusGame(){document.querySelectorAll('#app > :not(.modal)').forEach(n=>n.inert=false);canvas.focus({preventScroll:true});}
  function pauseGame(){if(state!=='playing')return;state='paused';clearInput();saga.stopVoice();$('pauseScreen').classList.remove('hidden');focusModal($('pauseScreen'));updateUI();}
  function resumeGame(){if(state!=='paused')return;state='playing';$('pauseScreen').classList.add('hidden');last=performance.now();focusGame();updateUI();}
  function dodge(){if(state!=='playing'||game.hero.dodgeCd>0)return;const h=game.hero;h.dodge=.18;h.dodgeCd=1.2*saga.stats(h).dodge;h.invuln=.35;h.dodgeX=facing.x;h.dodgeY=facing.y;spark(h.x,h.y,'#dbc07e',9);}
  const rand=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

  let game;
  function reset(level=1){
    clearInput();time=0;shake=0;facing={x:1,y:0};moveIntent={x:0,y:0};
    game={level,wave:level===2?6:1,elapsed:0,essence:level===2?130:70,selectedTower:'bow',kills:0,waveSpawned:0,waveKilled:0,waveTotal:waveSize(level===2?6:1),spawnTimer:1.2,intermission:5,
      hero:{x:WORLD_W*.5+140,y:WORLD_H*.5+80,r:13,hp:100,maxHp:100,speed:205,damage:18,fireRate:.47,fireCd:0,range:340,dodgeCd:0,dodge:0,invuln:0,kind:'wand'},
      monument:{x:WORLD_W*.5,y:WORLD_H*.5,r:48,hp:500,maxHp:500},
      enemies:[],bullets:[],particles:[],loot:[],inventory:[],maxInventory:6,towers:[],maxTowers:level===2?6:4};
    game.waveTotal=waveSize(game.wave);
    saga.reset(game.hero);updateCamera();ui.perk.classList.add('hidden');ui.gameover.classList.add('hidden');selectTower('bow');updateUI();
  }
  function cameraLead(){
    const amount=mobileRender?68:88;
    return {x:moveIntent.x*amount,y:moveIntent.y*amount*.68};
  }
  function updateCamera(){if(!game)return;const vw=W/zoom,vh=H/zoom,focusY=portraitLayout()?.43:.5,lead=cameraLead();camera.x=vw>WORLD_W?(WORLD_W-vw)/2:clamp(game.hero.x+lead.x-vw*.5,0,WORLD_W-vw);camera.y=vh>WORLD_H?(WORLD_H-vh)/2:clamp(game.hero.y+lead.y-vh*focusY,0,WORLD_H-vh);}
  function screenToWorld(x,y){const rect=canvas.getBoundingClientRect();return {x:(x-rect.left)*W/rect.width/zoom+camera.x,y:(y-rect.top)*H/rect.height/zoom+camera.y};}
  function resize(pauseOnResize=true){const cap=graphicsMode==='high'?1.75:graphicsMode==='low'?1:mobileRender?1:1.5;dpr=Math.min(cap,devicePixelRatio||1);W=innerWidth;H=innerHeight;zoom=zoomForMode();$('app').classList.toggle('portrait',portraitLayout());canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingQuality=graphicsMode==='high'?'medium':'low';if(game){updateCamera();if(pauseOnResize&&state==='playing')pauseGame();}}

  function chapter(){return chapters.find(c=>game.wave<=c.until)||chapters.at(-1)}
  function menuStatus(){
    $('level2Btn').disabled=!campaign.unlocked;
    $('levelProgress').textContent=campaign.unlocked?(campaign.storageAvailable?'Level 2 freigeschaltet · jederzeit hier starten':'Level 2 freigeschaltet · Speichern blockiert, nur für diese Sitzung'):'Level 2 wird nach Welle 5 freigeschaltet.';
  }
  function closeScreens(){saga.stopVoice();for(const id of ['startScreen','pauseScreen','perkScreen','gameover','levelComplete','storyScreen','characterScreen','inventoryScreen'])$(id).classList.add('hidden');}
  function mainMenu(){closeScreens();clearInput();state='start';menuStatus();ui.start.classList.remove('hidden');focusModal(ui.start);updateUI();}
  function startGame(level=1){
    level=level===2?2:1;if(level===2&&!campaign.unlocked)return;
    closeScreens();reset(level);state='playing';focusGame();tone(220,.1);last=performance.now();
    if(level===1)saga.chapter(1);else showToast('LEVEL 2 · WELLE 6');updateUI();
  }
  function renderInventory(){
    const grid=$('inventoryGrid');if(!grid||!game)return;grid.innerHTML='';
    for(let i=0;i<game.maxInventory;i++){const item=game.inventory[i],slot=document.createElement('div');slot.className='inventory-slot'+(item?' filled':'');slot.innerHTML=item?`<span>${i+1}</span><b>${item.name}</b><small>${item.rarity}</small><p>${item.desc}</p>`:`<span>${i+1}</span><b>LEERER SLOT</b><small>—</small>`;grid.appendChild(slot);}
  }
  function pickupItem(item,silent=false){
    if(game.inventory.length>=game.maxInventory){game.essence+=8;if(!silent)showToast('INVENTAR VOLL · +8 ESSENZ');return false;}
    game.inventory.push({...item});
    if(item.id==='ash')game.hero.damage+=3;
    if(item.id==='rune')game.hero.fireRate*=.94;
    if(item.id==='seal'){game.hero.maxHp+=30;game.hero.hp=Math.min(game.hero.maxHp,game.hero.hp+50);game.monument.hp=Math.min(game.monument.maxHp,game.monument.hp+80);}
    if(!silent)showToast(`${item.name} GEFUNDEN`);renderInventory();return true;
  }
  function openInventory(){if(state!=='playing')return;state='inventory';clearInput();renderInventory();$('inventoryScreen').classList.remove('hidden');focusModal($('inventoryScreen'));updateUI();}
  function closeInventory(){if(state!=='inventory')return;$('inventoryScreen').classList.add('hidden');state='playing';last=performance.now();focusGame();updateUI();}
  function lootFor(enemy,index){
    if(enemy.type==='boss'&&index===0)return {kind:'item',item:lootTable[2]};
    if(enemy.type!=='boss'&&Math.random()<.10)return {kind:'item',item:Math.random()<.22?lootTable[1]:lootTable[0]};
    return {kind:'essence'};
  }
  function completeLevel(){
    collectWaveLoot();campaign.unlock();saga.stopVoice();state='levelcomplete';clearInput();
    game.enemies=[];game.bullets=[];game.loot=[];
    $('levelSaveNote').textContent=campaign.storageAvailable?'Freischaltung gespeichert. Level 2 bleibt im Hauptmenü verfügbar.':'Speichern ist im Browser blockiert. Level 2 bleibt für diese Sitzung verfügbar.';
    $('levelComplete').classList.remove('hidden');focusModal($('levelComplete'));updateUI();
  }
  function showToast(t){ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),1500)}
  function showWaveBanner(label){
    const el=$('waveBanner');if(!el)return;setText(el,label);el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
    clearTimeout(showWaveBanner.timer);showWaveBanner.timer=setTimeout(()=>el.classList.remove('show'),1250);
  }
  function spawnEnemy(){
    const level=campaign.levels[game.level],gateIndex=game.waveSpawned%level.gates.length;
    const {x,y}=level.gates[gateIndex],type=enemyTypeForSpawn(game.wave,game.waveSpawned),base=enemySpecs[type],plan=applyWavePlan(type,base,game.wave);
    const hpScale=(1+Math.max(0,game.wave-1)*.13)*plan.hp,damageScale=(1+Math.max(0,game.wave-1)*.055)*plan.damage,speedScale=(game.level===2?1.16:1)*plan.speed;
    const maxHp=base.hp*hpScale;
    const enemy={x,y,gateIndex,waypoint:1,type,hit:0,hitKick:0,slow:0,slowFactor:1,enraged:false,shieldBroken:false,phase:type==='boss'?1:0,
      r:base.r,hp:maxHp,maxHp,speed:base.speed*speedScale,damage:base.damage*damageScale,
      attackCd:0,attackRange:base.attackRange||0,attackCooldown:(base.attackCooldown||.85)*plan.cooldown,armor:clamp((base.armor||0)+plan.armor,0,.7),focusMonument:!!base.focusMonument};
    if(game.waveSpawned===0)showWaveBanner(type==='boss'?`BOSSWELLE ${game.wave} · ${wavePlan(game.wave).name}`:`WELLE ${game.wave} · ${wavePlan(game.wave).name}`);
    game.enemies.push(enemy);game.waveSpawned++;
    if(type==='boss'){showToast('BOSSWELLE · DER BELAGERER');tone(62,.7,.07);shake=12}
  }
  function shoot(from,target,damage,speed=520,color='#e9c477',effect={}){
    const d=dist(from,target)||1;const bullet={kind:from.kind||'magic',level:from.level||1,x:from.x,y:from.y,vx:(target.x-from.x)/d*speed,vy:(target.y-from.y)/d*speed,r:effect.splash?7:4,damage,life:1.1,color,...effect};game.bullets.push(bullet);fx.burst(game,bullet,false,audioOn,reducedMotion);
  }
  function remainingRoute(e){const path=campaign.levels[game.level].paths[e.gateIndex]||campaign.levels[game.level].paths[0];if(game.level===1)return dist(e,game.monument);let remaining=dist(e,path[Math.min(e.waypoint,path.length-1)]);for(let i=e.waypoint;i<path.length-1;i++)remaining+=dist(path[i],path[i+1]);return remaining;}
  function towerTarget(t){
    const candidates=game.enemies.filter(e=>!e.dead&&dist(t,e)<=t.range);
    if(!candidates.length)return null;
    const mode=t.targetMode||'first';
    if(mode==='boss'){const boss=candidates.find(e=>e.type==='boss');if(boss)return boss;}
    if(mode==='strongest')return candidates.reduce((a,b)=>b.hp>a.hp?b:a);
    if(mode==='nearest')return candidates.reduce((a,b)=>dist(t,b)<dist(t,a)?b:a);
    return candidates.reduce((a,b)=>remainingRoute(b)<remainingRoute(a)?b:a);
  }
  function projectileSynergy(b,e){
    const slowed=(e.slow||0)>0,cannon=slowed&&b.kind==='cannon';
    return {
      impact:cannon?1.25:1,
      splash:b.splash||0,
      splashFactor:cannon?.58*1.25:.58,
      chain:(b.chain||0)+(slowed&&b.kind==='rift'?1:0)
    };
  }
  function launchWave(){if(state==='playing'&&game.intermission>0){game.intermission=0;game.spawnTimer=.4;updateUI();}}
  function collectWaveLoot(){for(const l of game.loot){if(l.kind==='item')pickupItem(l.item,true);else game.essence+=4;}game.loot=[];}
  function nearest(from,range){let best=null,bd=range;for(const e of game.enemies){if(e.dead)continue;const d=dist(from,e);if(d<bd){bd=d;best=e}}return best}
  function spark(x,y,color,n=7){for(let i=0;i<n&&game.particles.length<fx.MAX_PARTICLES;i++)game.particles.push({x,y,vx:rand(-90,90),vy:rand(-90,90),life:rand(.2,.6),max:.6,r:rand(1,3),color})}
  function bossPhaseLabel(phase){return ['I','II','III'][clamp((phase||1)-1,0,2)];}
  function updateEnemyPressure(e){
    if(e.dead)return;
    const ratio=e.hp/e.maxHp;
    if(e.type==='runner'&&!e.enraged&&ratio<=.45){e.enraged=true;e.speed*=1.28;e.damage*=1.08;e.hitKick=1;spark(e.x,e.y,'#ef8b62',12);}
    if(e.type==='guardian'&&!e.shieldBroken&&ratio<=.5){e.shieldBroken=true;e.armor=Math.max(0,e.armor-.2);e.speed*=1.18;e.hitKick=1;spark(e.x,e.y,'#d9c47a',16);}
    if(e.type==='boss'){
      const next=ratio<=.33?3:ratio<=.66?2:1;
      if(next>(e.phase||1)){
        while((e.phase||1)<next){e.phase=(e.phase||1)+1;if(e.phase===2){e.speed*=1.18;e.damage*=1.08;e.attackCooldown*=.88;e.armor=Math.max(e.armor,.06);}else if(e.phase===3){e.speed*=1.15;e.damage*=1.12;e.attackCooldown*=.82;e.armor=Math.max(e.armor,.12);}}
        e.hitKick=1.4;shake=10;spark(e.x,e.y,'#ef7158',28);showWaveBanner(`BELAGERER · PHASE ${bossPhaseLabel(e.phase)}`);showToast('DER BELAGERER WIRD GEFÄHRLICHER');
      }
    }
  }
  function retireEnemy(e){if(e.dead)return;e.dead=true;game.waveKilled++;spark(e.x,e.y,'#d76b50',18);}
  function hurtEnemy(e,dmg){if(e.dead)return;const crit=Math.random()<.09;dmg*=crit?2:1;dmg*=1-(e.armor||0);e.hp-=dmg;e.hit=.1;e.hitKick=Math.max(e.hitKick||0,crit?1:.55);spark(e.x,e.y,crit?'#fff1a6':'#e6c57b',crit?12:5);if(crit){shake=3}if(e.hp>0)updateEnemyPressure(e);if(e.hp<=0){game.kills++;game.waveKilled++;game.essence+=enemySpecs[e.type]?.bounty||2;e.dead=true;saga.onKill(e);const drops=e.type==='boss'?9:1;for(let i=0;i<drops;i++)game.loot.push({x:e.x+rand(-18,18),y:e.y+rand(-18,18),r:e.type==='boss'?7:5,life:12,vx:rand(-20,20),vy:rand(-20,20),...lootFor(e,i)});spark(e.x,e.y,e.type==='boss'?'#f5a14f':'#72d0c2',e.type==='boss'?34:11);if(e.type==='boss'){showToast('WÄCHTERSIEGEL GEFALLEN');shake=16;tone(520,.45,.08)}}}
  function towerPosition(){const h=game.hero,p={x:h.x+facing.x*58,y:h.y+facing.y*58};return campaign.nearestSlot(p,game.level)||p;}
  function placementPreview(){
    if(!game||state!=='playing')return null;
    const h=game.hero,probe={x:h.x+facing.x*58,y:h.y+facing.y*58},p=campaign.nearestSlot(probe,game.level);
    if(!p||game.towers.some(t=>dist(t,p)<20))return null;
    const spec=towerSpecs[game.selectedTower],role=towerRoles[game.selectedTower]||{label:'TURM',icon:'▲'};
    return {x:p.x,y:p.y,range:spec.range,color:spec.color,role:role.label,icon:role.icon,affordable:game.essence>=spec.cost&&game.towers.length<game.maxTowers,valid:placementError(p)===''};
  }
  function buildContextActive(){if(state!=='playing')return false;return placementError(towerPosition())==='';}
  function placementError(p){const level=campaign.levels[game.level];if(level.slots.length&&!level.slots.some(s=>dist(s,p)<1))return 'NUR AUF MARKIERTEN BAUPLÄTZEN';if(level.gates.some(g=>dist(g,p)<75))return 'TOR FREIHALTEN';if(p.x<28||p.x>WORLD_W-28||p.y<28||p.y>WORLD_H-28)return 'ZU NAH AM WELTRAND';if(level.paths.some(path=>campaign.pathDistance(p,path)<64))return 'NEBEN DEM WEG BAUEN';if(dist(p,game.monument)<110)return 'ZU NAH AM MONUMENT';if(game.towers.some(t=>dist(p,t)<62))return 'BAUPLATZ BELEGT';return '';}
  function buildTower(){
    if(state!=='playing')return;
    const spec=towerSpecs[game.selectedTower];if(game.essence<spec.cost)return showToast('NOCH '+(spec.cost-game.essence)+' ESSENZ NÖTIG');if(game.towers.length>=game.maxTowers)return showToast('TURMLIMIT ERREICHT');
    const p=towerPosition(),error=placementError(p);if(error)return showToast(error);
    game.essence-=spec.cost;game.towers.push({...p,r:18,damage:spec.damage,fireRate:spec.rate,fireCd:.1,range:spec.range,kind:game.selectedTower,level:1,spent:spec.cost,targetMode:'first'});spark(p.x,p.y,'#d9b66b',18);showToast(spec.name.toUpperCase()+' ERRICHTET');tone(150,.12);updateUI();
  }
  function nearbyTower(){let best=null,bd=92;for(const t of game.towers){const d=dist(game.hero,t);if(d<bd){bd=d;best=t}}return best}
  function cycleTargetMode(){
    if(state!=='playing')return;
    const t=nearbyTower();if(!t)return showToast('GEHE NÄHER AN EINEN TURM');
    const index=targetModes.indexOf(t.targetMode||'first');t.targetMode=targetModes[(index+1)%targetModes.length];
    showToast(`ZIELPRIORITÄT · ${targetLabels[t.targetMode]}`);updateUI();
  }
  function upgradeTower(){if(state!=='playing')return;const t=nearbyTower();if(!t)return showToast('GEHE NÄHER AN EINEN TURM');if(t.level>=3)return showToast('MAXIMALE AUSBAUSTUFE');const cost=20+t.level*15;if(game.essence<cost)return showToast('NICHT GENUG ESSENZ');game.essence-=cost;t.spent+=cost;t.level++;t.damage*=1.42;t.fireRate*=.86;t.range+=18;spark(t.x,t.y,t.kind==='mage'?'#69bfff':'#edc575',26);showToast(`TURM AUF STUFE ${t.level}`);tone(360,.18)}
  function sellTower(){if(state!=='playing')return;const t=nearbyTower();if(!t)return showToast('GEHE NÄHER AN EINEN TURM');const refund=Math.floor(t.spent*.6);game.essence+=refund;game.towers=game.towers.filter(x=>x!==t);spark(t.x,t.y,'#7dd8c8',18);showToast(`TURM VERKAUFT · +${refund}`);tone(220,.12)}
  function selectTower(kind){if(!towerSpecs[kind]||!enabledTowers.has(kind))return;game.selectedTower=kind;document.querySelectorAll('.arsenal button').forEach(b=>{b.classList.toggle('selected',b.dataset.tower===kind);b.setAttribute('aria-pressed',String(b.dataset.tower===kind));});$('buildText').textContent=`${towerSpecs[kind].name} BAUEN · ${towerSpecs[kind].cost}`;updateUI()}
  function endWave(){if(state!=='playing')return;if(game.level===1&&game.wave===5){completeLevel();return;}saga.stopVoice();state='perk';collectWaveLoot();game.enemies.length=0;game.bullets.length=0;ui.objectiveText.textContent='WELLE ABGESCHLOSSEN';const perks=getPerks();ui.perkGrid.innerHTML='';perks.forEach((p,i)=>{const b=document.createElement('button');b.className='perk';b.innerHTML=`<span class="num">${i+1}</span><div class="perk-icon">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p>`;b.onclick=()=>selectPerk(p);ui.perkGrid.appendChild(b)});ui.perk.classList.remove('hidden');focusModal(ui.perk);tone(440,.18)}
  function getPerks(){const pool=[
    {name:'Eiserner Eid',icon:'✦',desc:'+25 maximale und aktuelle Hüter-LP.',apply:g=>{g.hero.maxHp+=25;g.hero.hp+=25}},
    {name:'Runenmeister',icon:'◆',desc:'+30 % Feuerrate des Hüters.',apply:g=>g.hero.fireRate=Math.max(.09,g.hero.fireRate/1.3)},
    {name:'Kraft des Stabes',icon:'✧',desc:'+8 Schaden pro Geschoss.',apply:g=>g.hero.damage+=8},
    {name:'Steinmetzsegen',icon:'⬟',desc:'Heilt das Monument um 140 LP.',apply:g=>g.monument.hp=Math.min(g.monument.maxHp,g.monument.hp+140)},
    {name:'Festungsplan',icon:'▲',desc:'+1 maximales Turmlimit und 20 Essenz.',apply:g=>{g.maxTowers++;g.essence+=20}},
    {name:'Marschtritt',icon:'➹',desc:'+15 % Bewegungstempo.',apply:g=>g.hero.speed*=1.15}
  ];for(let i=pool.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[pool[i],pool[k]]=[pool[k],pool[i]]}return pool.slice(0,3)}
  function selectPerk(p){if(state!=='perk')return;p.apply(game);game.wave++;game.waveSpawned=0;game.waveKilled=0;game.waveTotal=waveSize(game.wave);game.spawnTimer=1.2;game.intermission=6;game.hero.hp=Math.min(game.hero.maxHp,game.hero.hp+18);if(game.wave===4||game.wave===8){game.essence+=35;showToast(`${chapter().name} · +35 ESSENZ`)}else showToast(`WELLE ${game.wave}`);state='playing';ui.perk.classList.add('hidden');focusGame();saga.chapter(game.wave);updateUI()}
  function gameOver(){saga.stopVoice();state='gameover';$('gameoverTitle').textContent=game.monument.hp<=0?'DAS MONUMENT IST GEFALLEN':'DER HÜTER IST GEFALLEN';ui.gameoverStats.textContent=`${game.wave-1} Wellen überstanden · ${game.kills} Feinde besiegt · ${Math.floor(game.elapsed/60)}:${String(Math.floor(game.elapsed%60)).padStart(2,'0')} Minuten`;ui.gameover.classList.remove('hidden');focusModal(ui.gameover);tone(75,.5);}


  function update(dt){
    if(state!=='playing')return;if(lowFX()&&game.particles.length>90)game.particles.splice(0,game.particles.length-90);time+=dt;game.elapsed+=dt;const h=game.hero,m=game.monument,heroStats=saga.stats(h);
    h.fireCd-=dt;h.dodgeCd-=dt;h.invuln-=dt;if(h.dodge>0)h.dodge-=dt;
    let dx=((keys.KeyD||keys.ArrowRight)?1:0)-((keys.KeyA||keys.ArrowLeft)?1:0)+touch.x,dy=((keys.KeyS||keys.ArrowDown)?1:0)-((keys.KeyW||keys.ArrowUp)?1:0)+touch.y;const len=Math.hypot(dx,dy);if(len>0){dx/=Math.max(1,len);dy/=Math.max(1,len);facing={x:dx/(Math.hypot(dx,dy)||1),y:dy/(Math.hypot(dx,dy)||1)};}let sp=heroStats.speed;if(h.dodge>0){dx=h.dodgeX;dy=h.dodgeY;sp*=3.2;}const motion=Math.hypot(dx,dy);moveIntent=motion>0?{x:dx/motion,y:dy/motion}:{x:0,y:0};h.x=clamp(h.x+dx*sp*dt,26,WORLD_W-26);h.y=clamp(h.y+dy*sp*dt,26,WORLD_H-26);updateCamera();saga.update(dt,len>0||h.dodge>0,facing);

    const target=nearest(h,h.range);if(target&&h.fireCd<=0){shoot(h,target,heroStats.damage,560,h.equipment.weapon==='echo'?'#9affdf':'#83cfff');saga.onAttack();h.fireCd=heroStats.rate}
    if(game.intermission>0)game.intermission=Math.max(0,game.intermission-dt);
    else if(game.waveSpawned<game.waveTotal){game.spawnTimer-=dt;if(game.spawnTimer<=0){spawnEnemy();game.spawnTimer=Math.max(.32,1.15-game.wave*.035)}}
    for(const t of game.towers){t.fireCd-=dt;const e=towerTarget(t);const spec=towerSpecs[t.kind];if(t.kind==='shrine')m.hp=Math.min(m.maxHp,m.hp+spec.heal*dt*t.level);if(e&&t.fireCd<=0){const speed=t.kind==='ballista'?610:t.kind==='cannon'?350:t.kind==='mortar'?275:460;shoot(t,e,t.damage,speed,spec.color,{splash:spec.splash,chain:spec.chain,slow:spec.slow,slowDuration:spec.slowDuration});t.fireCd=t.fireRate;if(t.kind==='cannon'||t.kind==='mortar')shake=1.7}}
    for(const b of game.bullets){b.prevX=b.x;b.prevY=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;for(const e of game.enemies){if(!e.dead&&segmentDistance(e,b)<e.r+b.r){const synergy=projectileSynergy(b,e);hurtEnemy(e,b.damage*synergy.impact);if(b.slow&&!e.dead){e.slow=Math.max(e.slow||0,b.slowDuration||1.4);e.slowFactor=Math.min(e.slowFactor||1,b.slow);}fx.burst(game,{...b,x:e.x,y:e.y},true,audioOn,lowFX());if(synergy.splash){for(const other of game.enemies){if(other!==e&&!other.dead&&dist(e,other)<synergy.splash)hurtEnemy(other,b.damage*synergy.splashFactor)}spark(e.x,e.y,b.color,18)}if(synergy.chain){let chained=0;for(const other of game.enemies){if(other!==e&&!other.dead&&dist(e,other)<108&&chained++<synergy.chain)hurtEnemy(other,b.damage*.62)}}b.life=0;break}}}
    game.bullets=game.bullets.filter(b=>b.life>0);
    for(const e of game.enemies){
      if(e.dead)continue;e.hit-=dt;e.hitKick=Math.max(0,(e.hitKick||0)-dt*5);e.attackCd-=dt;e.slow=Math.max(0,(e.slow||0)-dt);
      const speedMul=e.slow>0?(e.slowFactor||.58):1;
      if(game.level===2&&e.waypoint<campaign.levels[2].paths[0].length){const speed=e.speed;e.speed*=speedMul;campaign.advance(e,dt);e.speed=speed;continue;}
      // Maze enemies stay on their route; the hero cannot pull them through corners.
      const targetObj=game.level===2?m:(e.focusMonument?m:(dist(e,h)<dist(e,m)*.82?h:m));
      const d=dist(e,targetObj)||1,attackRange=e.attackRange||e.r+targetObj.r;
      if(e.type==='archer'&&targetObj===h&&d<92){const step=Math.min(e.speed*speedMul*.7*dt,92-d);e.x-=(targetObj.x-e.x)/d*step;e.y-=(targetObj.y-e.y)/d*step;}
      else if(d>attackRange){const step=Math.min(e.speed*speedMul*dt,d-attackRange);e.x+=(targetObj.x-e.x)/d*step;e.y+=(targetObj.y-e.y)/d*step;}
      else if(e.attackCd<=0){
        if(targetObj===m&&e.type==='sapper'){m.hp-=e.damage*1.65;retireEnemy(e);shake=12;spark(m.x,m.y,'#e66f52',22);tone(72,.12,.07);continue;}
        if(targetObj===h&&h.invuln<=0)saga.damage(e.damage);else if(targetObj===m)m.hp-=e.damage;e.attackCd=e.attackCooldown||.85;shake=e.type==='archer'?3:8;spark(targetObj.x,targetObj.y,e.type==='archer'?'#d7c28a':'#b7533d',8);tone(e.type==='archer'?210:95,.05,.04);
      }
    }
    game.enemies=game.enemies.filter(e=>!e.dead);
    for(const l of game.loot){l.life-=dt;if(l.life<=0&&l.kind==='item'){pickupItem(l.item,true);continue;}const d=dist(l,h);if(d<170){l.x+=(h.x-l.x)*dt*7;l.y+=(h.y-l.y)*dt*7}if(l.life>0&&d<20){if(l.kind==='item')pickupItem(l.item);else game.essence+=4;l.life=0;tone(l.kind==='item'?760:640,.04,.03)}}game.loot=game.loot.filter(l=>l.life>0);
    for(const p of game.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt}game.particles=game.particles.filter(p=>p.life>0);
    if(h.hp<=0||m.hp<=0)gameOver();else if(game.waveSpawned>=game.waveTotal&&game.enemies.length===0)endWave();hudClock+=dt;if(hudClock>=.12||state!=='playing'){updateUI();hudClock=0;}
  }
  function segmentDistance(e,b){const dx=b.x-b.prevX,dy=b.y-b.prevY;const t=clamp(((e.x-b.prevX)*dx+(e.y-b.prevY)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(e.x-(b.prevX+t*dx),e.y-(b.prevY+t*dy));}
  function updateUI(){if(!game)return;saga.updateUI();const h=game.hero,m=game.monument,playing=state==='playing';const preview=$('wavePreview');if(preview){setText(preview,game.intermission>0?`VORSCHAU · ${wavePlan(game.wave).name} · ${wavePreview(game.wave)}`:'');setHidden(preview,game.intermission<=0||!playing);}setText(ui.wave,game.wave);setText($('levelLabel'),`LEVEL ${game.level}`);setWidth(ui.playerHp,`${clamp(h.hp/h.maxHp*100,0,100)}%`);setText(ui.playerHpText,`${Math.ceil(Math.max(0,h.hp))} / ${h.maxHp}`);setWidth(ui.monumentHp,`${clamp(m.hp/m.maxHp*100,0,100)}%`);setText(ui.monumentHpText,`${Math.ceil(Math.max(0,m.hp))} / ${m.maxHp}`);setText(ui.essence,game.essence);setText($('inventoryCount'),`${game.inventory.length} / ${game.maxInventory}`);setDisabled($('inventoryBtn'),!playing);setText(ui.towerCount,game.towers.length);setText(ui.towerMax,game.maxTowers);setWidth(ui.waveProgress,`${game.waveKilled/game.waveTotal*100}%`);setText(ui.enemyCount,`${Math.max(0,game.waveTotal-game.waveKilled)} FEINDE VERBLEIBEN`);setText(ui.objectiveText,state==='perk'?'WELLE ABGESCHLOSSEN':state==='paused'?'WACHT PAUSIERT':game.intermission>0?`BAUPAUSE · ${Math.ceil(game.intermission)} s`:game.wave===5?'BOSSWELLE':`WELLE ${game.wave}`);const nextWave=$('nextWaveBtn');setHidden(nextWave,!playing||game.intermission<=0);setText(ui.storyText,game.level===2?'LABYRINTH · FESTE BAUPLÄTZE':`VIER TORE · FESTE BAUPLÄTZE · WELLE ${game.wave} / 5`);setDisabled($('pauseBtn'),!playing);setDisabled($('dodgeBtn'),!playing||h.dodgeCd>0);setText($('dodgeText'),h.dodgeCd>0?`BEREIT IN ${h.dodgeCd.toFixed(1)} s`:'AUSWEICHEN');setDisabled($('buildBtn'),!playing||game.essence<towerSpecs[game.selectedTower].cost||game.towers.length>=game.maxTowers);setText($('buildText'),game.towers.length>=game.maxTowers?'TURMLIMIT':`${towerSpecs[game.selectedTower].name.replace('TURM','')} · ${towerSpecs[game.selectedTower].cost}`);const boss=game.enemies.find(e=>e.type==='boss'&&!e.dead);setHidden(ui.bossHud,!boss);setText($('bossName'),boss?`DER BELAGERER · ${bossPhaseLabel(boss.phase)}`:'DER BELAGERER');ui.bossHud.classList.toggle('phase-2',!!boss&&boss.phase===2);ui.bossHud.classList.toggle('phase-3',!!boss&&boss.phase===3);if(boss)setWidth(ui.bossHp,`${clamp(boss.hp/boss.maxHp*100,0,100)}%`);const buildContext=buildContextActive();setHidden($('arsenal'),!buildContext);setHidden($('buildBtn'),!buildContext);const nearby=nearbyTower();setHidden($('upgradeBtn'),!nearby);setHidden($('sellBtn'),!nearby);setHidden($('targetBtn'),!nearby);setDisabled($('upgradeBtn'),!playing||!nearby||nearby.level>=3||game.essence<20+nearby.level*15);setText($('upgradeText'),nearby?(nearby.level>=3?'STUFE III':`AUFWERTEN · ${20+nearby.level*15}`):'AUFWERTEN');setDisabled($('sellBtn'),!playing||!nearby);setText($('sellText'),nearby?`VERKAUFEN · +${Math.floor(nearby.spent*.6)}`:'VERKAUFEN');setDisabled($('targetBtn'),!playing||!nearby);setText($('targetText'),nearby?`ZIEL · ${targetLabels[nearby.targetMode||'first']}`:'ZIEL');}

  function diamond(x,y,w,h,fill,stroke){ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x+w,y);ctx.lineTo(x,y+h);ctx.lineTo(x-w,y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
  let groundCache=null,groundLoaded=false;
  function drawGround(){
    const loaded=hellscape.complete&&hellscape.naturalWidth>0;
    if(!groundCache||loaded!==groundLoaded){
      groundLoaded=loaded;groundCache=document.createElement('canvas');groundCache.width=1536;groundCache.height=1536;
      const q=groundCache.getContext('2d');q.scale(.5,.5);
      q.fillStyle='#151b1b';q.fillRect(0,0,WORLD_W,WORLD_H);
      if(loaded)q.drawImage(hellscape,0,0,WORLD_W,WORLD_H);
      const v=q.createRadialGradient(1536,1536,180,1536,1536,WORLD_W*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(7,12,14,.3)');q.fillStyle=v;q.fillRect(0,0,WORLD_W,WORLD_H);
      const fog=q.createLinearGradient(0,WORLD_H*.45,0,WORLD_H);fog.addColorStop(0,'transparent');fog.addColorStop(1,'#66746c12');q.fillStyle=fog;q.fillRect(0,WORLD_H*.4,WORLD_W,WORLD_H*.6);
    }
    const x=Math.max(0,camera.x-32),y=Math.max(0,camera.y-32),w=Math.min(WORLD_W-x,W/zoom+64),h=Math.min(WORLD_H-y,H/zoom+64);
    ctx.fillStyle='#151b1b';ctx.fillRect(camera.x-32,camera.y-32,W/zoom+64,H/zoom+64);
    ctx.drawImage(groundCache,x/2,y/2,w/2,h/2,x,y,w,h);
    ctx.save();ctx.translate(game.monument.x,game.monument.y);ctx.rotate(time*.015);ctx.strokeStyle='#bca16a28';ctx.lineWidth=2;for(let r of [105,132]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke()}for(let i=0;i<8;i++){const a=i*Math.PI/4;diamond(Math.cos(a)*118,Math.sin(a)*118,5,3,'#c4a96b30')}ctx.restore();
  }
  function visible(o,margin=180){return o.x+margin>=camera.x&&o.x-margin<=camera.x+W/zoom&&o.y+margin>=camera.y&&o.y-margin<=camera.y+H/zoom;}

  function drawLevel(){
    const level=campaign.levels[game.level];ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    for(const path of level.paths){
      ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.strokeStyle='#0a0f1188';ctx.lineWidth=94;ctx.stroke();
      ctx.strokeStyle='#cabd9940';ctx.lineWidth=74;ctx.stroke();ctx.strokeStyle='#a49c7a16';ctx.lineWidth=68;ctx.stroke();
      ctx.setLineDash([12,22]);ctx.strokeStyle='#d8bb7755';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
    }
    for(const p of level.slots){if(!visible(p,35))continue;if(game.towers.some(t=>dist(t,p)<20))continue;ctx.strokeStyle='#d6c38c';ctx.fillStyle='#14201fdd';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,25,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#e1cc8d';ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText('+',p.x,p.y+8);}
    level.gates.forEach((p,i)=>{if(!visible(p))return;const active=game.intermission<=0&&game.waveSpawned<game.waveTotal&&i===game.waveSpawned%level.gates.length;ctx.strokeStyle=active?'#f0b873cc':'#bda66c55';ctx.lineWidth=active?4:2;ctx.beginPath();ctx.arc(p.x,p.y,54+(active?Math.sin(time*4)*5:0),0,Math.PI*2);ctx.stroke();ctx.fillStyle=active?'#f0c982':'#b9aa7a';ctx.font='700 13px sans-serif';ctx.textAlign='center';ctx.fillText(game.level===1?`TOR ${i+1}`:'EINGANG',p.x,p.y+72);if(active){ctx.strokeStyle='#d6886388';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,48+Math.sin(time*4)*4,0,Math.PI*2);ctx.stroke();}if(globalThis.DenkmalArt?.draw(ctx,'gate',p.x,p.y,116)){ctx.fillStyle='#d7c8a1';ctx.textAlign='center';ctx.font='600 16px sans-serif';ctx.fillText(game.level===1?['NORDTOR','OSTTOR','SÜDTOR','WESTTOR'][i]:'MAZE-EINGANG',p.x,p.y-115);return;}ctx.fillStyle='#171719';ctx.strokeStyle='#cf8d52';ctx.lineWidth=5;ctx.fillRect(p.x-38,p.y-38,76,76);ctx.strokeRect(p.x-38,p.y-38,76,76);ctx.fillStyle='#a64b2b';ctx.fillRect(p.x-23,p.y-29,46,58);ctx.fillStyle='#ffe0a1';ctx.textAlign='center';ctx.font='bold 15px sans-serif';ctx.fillText(game.level===1?['NORDTOR','OSTTOR','SÜDTOR','WESTTOR'][i]:'MAZE-EINGANG',p.x,p.y-52);});
    ctx.restore();
  }
  function shadow(x,y,r){ctx.beginPath();ctx.ellipse(x,y+r*.65,r*1.25,r*.48,0,0,Math.PI*2);ctx.fillStyle='#0005';ctx.fill()}
  function drawMonument(m){shadow(m.x,m.y,60);if(globalThis.DenkmalArt?.draw(ctx,'monument',m.x,m.y,178))return;if(art.monument){ctx.save();ctx.translate(m.x,m.y+10);ctx.shadowBlur=25;ctx.shadowColor='#d0ad5a55';ctx.drawImage(art.monument,-96,-112,192,218);ctx.restore();return}ctx.save();ctx.translate(m.x,m.y);for(let i=0;i<3;i++)diamond(0,20-i*7,58-i*8,24-i*5,i===0?'#343a37':i===1?'#4b4f49':'#61625a','#8d816866');ctx.fillStyle='#74736a';ctx.fillRect(-14,-68,28,82);ctx.restore()}
  function drawHero(h){saga.draw(ctx,h)}
  function drawEnemy(e){
    shadow(e.x,e.y,e.r);
    const key=e.type==='boss'?'boss':e.type==='brute'||e.type==='guardian'?'brute':e.type==='archer'?'archer':'infantry';
    const height=e.type==='boss'?108:e.type==='brute'||e.type==='guardian'?78:e.type==='runner'?50:58;
    ctx.save();
    if(e.hitKick>0&&!lowFX())ctx.translate(Math.sin((time+e.x*.01)*90)*4*e.hitKick,0);
    if(e.type==='boss'&&e.phase>1){ctx.strokeStyle=e.phase===3?'#f05f4f88':'#d9965b66';ctx.lineWidth=e.phase===3?4:3;ctx.beginPath();ctx.arc(e.x,e.y,48+Math.sin(time*5)*5+(e.phase-2)*8,0,Math.PI*2);ctx.stroke();}
    if(e.hit>0)ctx.filter='brightness(1.7)';
    else if(e.type==='runner'&&e.enraged)ctx.filter='sepia(.55) saturate(2) brightness(1.18)';
    else if(e.type==='guardian'&&e.shieldBroken)ctx.filter='grayscale(.15) contrast(1.12) brightness(1.06)';
    else if(e.type==='runner')ctx.filter='sepia(.35) saturate(1.45) brightness(1.12)';
    else if(e.type==='guardian')ctx.filter='grayscale(.4) contrast(1.25) brightness(.9)';
    else if(e.type==='sapper')ctx.filter='sepia(.6) saturate(1.6)';
    else if(e.slow>0)ctx.filter='hue-rotate(155deg) brightness(1.15)';
    const drawn=globalThis.DenkmalArt?.draw(ctx,key,e.x,e.y,height,e.x<game.monument.x?1:-1);
    if(!drawn){const sprite=art[key];if(sprite)ctx.drawImage(sprite,e.x-height/2,e.y+12-height,height,height);}
    ctx.restore();
    if(e.type!=='boss'&&e.hp<e.maxHp){ctx.fillStyle='#111a1d';ctx.fillRect(e.x-e.r,e.y+18,e.r*2,4);ctx.fillStyle=e.armor?'#b6a56c':e.slow>0?'#72b9d5':'#c48870';ctx.fillRect(e.x-e.r,e.y+18,e.r*2*clamp(e.hp/e.maxHp,0,1),4);}
  }
  const towerCache=new WeakMap();
  function drawTower(t){
    shadow(t.x,t.y,24);
    const kind=t.kind||'bow',level=Math.max(1,Math.min(3,t.level||1)),index=level-1;
    // Disabled ballista assets load only if this tower is actually rendered.
    const levelSprite=towerLevelArt[kind]?.[index];
    if(kind==='ballista'&&levelSprite&&!levelSprite.src){
      levelSprite.src=`assets/tower-ballista-l${level}-v2.png`;
    }
    const premium=towerArt[kind];
    const sprite=levelSprite?.complete&&levelSprite.naturalWidth?levelSprite:
      (premium?.complete&&premium.naturalWidth?premium:art[kind]);
    if(sprite){
      const base={bow:78,cannon:82,ballista:88,mage:92,mortar:96,rift:94,shrine:96}[kind]||88;
      const size=base*(1+index*.09);
      ctx.save();ctx.translate(t.x,t.y);ctx.filter='none';
      if(dist(game.hero,t)<92){
        ctx.fillStyle='#c7b67a09';ctx.strokeStyle='#cfbc7b38';ctx.beginPath();ctx.arc(0,0,t.range,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#f0cb7a99';ctx.setLineDash([4,5]);ctx.beginPath();
        ctx.arc(0,0,28+level*3,0,7);ctx.stroke();ctx.setLineDash([]);
      }
      ctx.shadowBlur=lowFX()?0:(['mage','rift','shrine'].includes(kind)?22:12);
      ctx.shadowColor=kind==='shrine'?'#5be8d1':kind==='rift'?'#e846ff':kind==='mage'?'#f04b30':'#000';
      const bounds=sprite===levelSprite?towerSpriteBounds[kind]?.[index]:null;
      if(bounds){
        const [sx,sy,sw,sh]=bounds,height=size*sh/sw;
        let cached=towerCache.get(sprite);
        if(!cached&&sprite.complete&&sprite.naturalWidth){cached=document.createElement('canvas');cached.width=192;cached.height=Math.ceil(192*sh/sw);const q=cached.getContext('2d');q.filter='saturate(.8) brightness(.93)';q.drawImage(sprite,sx,sy,sw,sh,0,0,cached.width,cached.height);towerCache.set(sprite,cached);}
        if(cached)ctx.drawImage(cached,-size/2,20-height,size,height);else ctx.drawImage(sprite,sx,sy,sw,sh,-size/2,20-height,size,height);
      }else{
        ctx.drawImage(sprite,-size/2,-size*.7,size,size);
      }
      for(let i=0;i<level;i++){
        ctx.fillStyle=i===2?'#f2cd72':'#82b9c0';
        diamond((i-index/2)*8,25,3,5,ctx.fillStyle);
      }
      ctx.restore();return;
    }
    ctx.save();ctx.translate(t.x,t.y);
    diamond(0,8,23,12,'#4c514c','#9e8d68');ctx.fillStyle='#333b38';
    ctx.fillRect(-11,-20,22,27);ctx.restore();
  }

  function drawPlacementPreview(preview){
    if(!preview)return;
    ctx.save();ctx.translate(preview.x,preview.y);
    const ok=preview.valid&&preview.affordable;
    ctx.globalAlpha=ok?.18:.12;ctx.fillStyle=ok?preview.color:'#c56c5d';ctx.beginPath();ctx.arc(0,0,preview.range,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.82;ctx.strokeStyle=ok?preview.color:'#d66b5e';ctx.lineWidth=2;ctx.setLineDash([10,12]);ctx.beginPath();ctx.arc(0,0,preview.range,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=.92;ctx.fillStyle='#101719dd';ctx.strokeStyle=ok?'#e8cb8c':'#d66b5e';ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=ok?'#f0ddb0':'#e59a8e';ctx.textAlign='center';ctx.font='700 18px sans-serif';ctx.fillText(preview.icon,0,6);
    ctx.font='700 10px sans-serif';ctx.fillText(preview.role,0,46);ctx.restore();
  }
  function worldToScreen(p){return {x:(p.x-camera.x)*zoom,y:(p.y-camera.y)*zoom};}
  function threatIndicators(){
    if(!game||state!=='playing')return [];
    const out=[],level=campaign.levels[game.level];
    if(game.intermission<=0&&game.waveSpawned<game.waveTotal){
      const gateIndex=game.waveSpawned%level.gates.length,gate=level.gates[gateIndex];
      if(!visible(gate,70))out.push({kind:'gate',label:game.level===1?`TOR ${gateIndex+1}`:'EINGANG',x:gate.x,y:gate.y});
    }
    const boss=game.enemies.find(e=>e.type==='boss'&&!e.dead);
    if(boss&&!visible(boss,100))out.push({kind:'boss',label:'BOSS',x:boss.x,y:boss.y});
    return out;
  }
  function drawThreatIndicators(){
    const indicators=threatIndicators();if(!indicators.length)return;
    const cx=W*.5,cy=H*.5,inset=34;
    for(const indicator of indicators){
      const s=worldToScreen(indicator),dx=s.x-cx,dy=s.y-cy;
      const scale=Math.min((cx-inset)/Math.max(Math.abs(dx),.001),(cy-inset)/Math.max(Math.abs(dy),.001));
      const x=cx+dx*scale,y=cy+dy*scale,a=Math.atan2(dy,dx);
      ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=indicator.kind==='boss'?'#cf6657':'#d9bc80';ctx.shadowBlur=lowFX()?0:10;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-9,-8);ctx.lineTo(-5,0);ctx.lineTo(-9,8);ctx.closePath();ctx.fill();ctx.restore();
      ctx.save();ctx.fillStyle='#eee2c8';ctx.font='700 10px sans-serif';ctx.textAlign='center';ctx.fillText(indicator.label,x,y+20);ctx.restore();
    }
  }
  function draw(){if(!game)return;ctx.save();if(shake>0&&!reducedMotion){ctx.translate(rand(-shake,shake),rand(-shake,shake));shake*=.82;if(shake<.3)shake=0}ctx.scale(zoom,zoom);ctx.translate(-camera.x,-camera.y);drawGround();drawLevel();const objs=[{o:game.monument,t:'m'},...game.towers.map(o=>({o,t:'t'})),...game.enemies.map(o=>({o,t:'e'})),{o:game.hero,t:'h'}].filter(a=>visible(a.o,a.t==='t'?a.o.range:180)).sort((a,b)=>a.o.y-b.o.y);for(const a of objs){if(a.t==='t')drawTower(a.o);else if(a.t==='e')drawEnemy(a.o);else if(a.t==='m')drawMonument(a.o);else drawHero(a.o)}for(const l of game.loot){if(!visible(l,35))continue;ctx.save();const item=l.kind==='item';ctx.shadowBlur=lowFX()?0:(item?20:13);ctx.shadowColor=item?'#efb85b':'#69d4c5';diamond(l.x,l.y,item?7:5,item?10:8,item?'#f0bd62':'#79d1c5');if(item){ctx.strokeStyle='#fff0b0';ctx.beginPath();ctx.arc(l.x,l.y,12+Math.sin(time*5)*2,0,7);ctx.stroke()}ctx.restore()}for(const b of game.bullets)if(visible(b,50))fx.draw(ctx,b,lowFX());for(const p of game.particles){if(!visible(p,30))continue;if(fx.drawParticle?.(ctx,p))continue;ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;if(p.smoke){ctx.globalAlpha*=.35;ctx.beginPath();ctx.arc(p.x,p.y,p.r*(2-p.life/p.max),0,7);ctx.fill()}else ctx.fillRect(p.x,p.y,p.r,p.r)}ctx.globalAlpha=1;
    drawPlacementPreview(placementPreview());ctx.restore();drawThreatIndicators()}
  let lastIdleDraw=0;
  function updateTelemetry(now){
    const overlay=$('fpsOverlay');if(!telemetryOn){telemetryFrames=0;telemetryLast=0;overlay.classList.add('hidden');return;}
    overlay.classList.remove('hidden');if(!telemetryLast)telemetryLast=now;telemetryFrames++;const span=now-telemetryLast;
    if(span>=500){telemetryFps=Math.round(telemetryFrames*1000/span);telemetryFrames=0;telemetryLast=now;overlay.textContent=`FPS ${telemetryFps} · E ${game?.enemies.length||0} · FX ${game?.particles.length||0}`;}
  }
  function loop(now){const dt=Math.min(.034,(now-last)/1000||0);last=now;update(dt);if(!document.hidden&&(state==='playing'||now-lastIdleDraw>=100)){draw();lastIdleDraw=now;}updateTelemetry(now);requestAnimationFrame(loop)}
  function tone(freq,dur=.05,vol=.035){if(!audioOn)return;try{const ac=tone.ac||(tone.ac=new (AudioContext||webkitAudioContext)());if(ac.state==='suspended')void ac.resume();const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(vol,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+dur);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+dur)}catch{}}
  addEventListener('resize',()=>resize(false));
  addEventListener('blur',()=>{clearInput();saga.stopVoice();pauseGame();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();saga.stopVoice();pauseGame();}});
  addEventListener('keydown',e=>{
    const active=document.querySelector('.modal:not(.hidden)');
    if(e.code==='Tab'&&active){const buttons=[...active.querySelectorAll('button')];if(buttons.length){const i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}return;}
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&state==='playing')e.preventDefault();
    if(e.code==='KeyI'&&!e.repeat){state==='inventory'?closeInventory():openInventory();return;}
    if(e.code==='KeyH'&&!e.repeat){state==='character'?saga.closeCharacter():saga.openCharacter();return;}
    if(e.code==='Escape'&&state==='inventory'){closeInventory();return;}
    if(e.code==='Escape'&&state==='character'){saga.closeCharacter();return;}
    if(e.code==='Escape'||e.code==='KeyP'){if(!e.repeat){e.preventDefault();state==='paused'?resumeGame():pauseGame();}return;}
    if(state==='playing')keys[e.code]=true;
    if(e.repeat)return;
    if(e.code==='Space'&&state==='playing')dodge();
    if(e.code==='KeyF'&&state==='playing')saga.unleash();
    if(e.code==='KeyE'&&state==='playing')buildTower();
    if(e.code==='KeyQ'&&state==='playing')upgradeTower();
    if(e.code==='KeyX'&&state==='playing')sellTower();
    if(e.code==='KeyT'&&state==='playing')cycleTargetMode();
    if(state==='playing'&&/^Digit[1-4]$/.test(e.code))selectTower(['bow','cannon','mage','rift'][+e.code.slice(-1)-1]);
    if(e.code==='KeyR'&&state==='gameover')startGame(game.level);
    if(state==='perk'&&['Digit1','Digit2','Digit3'].includes(e.code))ui.perkGrid.children[+e.code.slice(-1)-1]?.click();
  });
  addEventListener('keyup',e=>keys[e.code]=false);
  canvas.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;mouse=screenToWorld(e.clientX,e.clientY);const d=dist(mouse,game.hero);if(d>5)facing={x:(mouse.x-game.hero.x)/d,y:(mouse.y-game.hero.y)/d};});
  const stick=$('joystick');let pointerId=null,activeTouchId=null;
  function joystickVector(dx,dy,radius){
    const len=Math.hypot(dx,dy),dead=radius*.14;if(len<=dead)return {x:0,y:0,knobX:0,knobY:0};
    const limited=Math.min(len,radius),nx=dx/(len||1),ny=dy/(len||1),magnitude=clamp((limited-dead)/(radius-dead),0,1),response=Math.pow(magnitude,.82);
    return {x:nx*response,y:ny*response,knobX:nx*limited,knobY:ny*limited};
  }
  function setStick(clientX,clientY){
    const r=stick.getBoundingClientRect(),radius=Math.max(30,Math.min(r.width,r.height)*.36);
    const v=joystickVector(clientX-r.left-r.width/2,clientY-r.top-r.height/2,radius);
    touch={x:v.x,y:v.y};stick.classList.add('active');stick.firstElementChild.style.transform=`translate(${v.knobX}px,${v.knobY}px)`;
  }
  function resetStick(){pointerId=null;activeTouchId=null;touch={x:0,y:0};stick.classList.remove('active');stick.firstElementChild.style.transform='translate(0,0)';}
  function moveStick(e){if(e.pointerId!==pointerId)return;e.preventDefault();setStick(e.clientX,e.clientY);}
  if('PointerEvent' in window){
    stick.addEventListener('pointerdown',e=>{
      if(state!=='playing'||pointerId!==null)return;
      e.preventDefault();pointerId=e.pointerId;
      try{stick.setPointerCapture(pointerId);}catch{}
      setStick(e.clientX,e.clientY);
    });
    stick.addEventListener('pointermove',moveStick);
    const releaseStick=e=>{if(e.pointerId!==pointerId)return;e.preventDefault();resetStick();};
    for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,releaseStick);
  }else{
    stick.addEventListener('touchstart',e=>{
      if(state!=='playing'||activeTouchId!==null)return;
      const t=e.changedTouches[0];if(!t)return;e.preventDefault();activeTouchId=t.identifier;setStick(t.clientX,t.clientY);
    },{passive:false});
    stick.addEventListener('touchmove',e=>{
      const t=[...e.changedTouches].find(x=>x.identifier===activeTouchId);if(!t)return;e.preventDefault();setStick(t.clientX,t.clientY);
    },{passive:false});
    const releaseTouch=e=>{if(![...e.changedTouches].some(x=>x.identifier===activeTouchId))return;e.preventDefault();resetStick();};
    stick.addEventListener('touchend',releaseTouch,{passive:false});
    stick.addEventListener('touchcancel',releaseTouch,{passive:false});
  }
  $('startBtn').onclick=()=>startGame(1);$('level2Btn').onclick=()=>startGame(2);$('nextLevelBtn').onclick=()=>startGame(2);$('completeMenuBtn').onclick=mainMenu;$('pauseMenuBtn').onclick=mainMenu;$('gameoverMenuBtn').onclick=mainMenu;$('restartBtn').onclick=()=>startGame(game.level);$('pauseBtn').onclick=pauseGame;$('resumeBtn').onclick=resumeGame;$('dodgeBtn').onclick=()=>{dodge();canvas.focus();};$('buildBtn').onclick=()=>{buildTower();canvas.focus();};
  document.querySelectorAll('.arsenal button').forEach(b=>b.onclick=()=>{if(state==='playing'){selectTower(b.dataset.tower);canvas.focus();}});
  $('upgradeBtn').onclick=()=>{upgradeTower();updateUI();canvas.focus();};$('sellBtn').onclick=()=>{sellTower();updateUI();canvas.focus();};$('targetBtn').onclick=()=>{cycleTargetMode();canvas.focus();};$('inventoryBtn').onclick=openInventory;$('inventoryClose').onclick=closeInventory;$('nextWaveBtn').onclick=launchWave;
  function lowFX(){return reducedMotion||graphicsMode==='low'||(graphicsMode==='auto'&&mobileRender);}
  function graphicsLabel(){$('graphicsBtn').textContent=`GRAFIK: ${graphicsMode.toUpperCase()}`;}
  function cycleGraphics(){graphicsMode=graphicsMode==='auto'?'low':graphicsMode==='low'?'high':'auto';try{localStorage.setItem('denkmal-graphics',graphicsMode);}catch{}graphicsLabel();resize(false);}
  function zoomLabel(){$('zoomBtn').textContent=`KAMERA: ${zoomMode==='wide'?'WEIT':'STANDARD'}`;}
  function cycleZoom(){zoomMode=zoomMode==='wide'?'standard':'wide';zoom=zoomForMode();try{localStorage.setItem('denkmal-zoom',zoomMode);}catch{}zoomLabel();updateCamera();}
  try{audioOn=localStorage.getItem('denkmal-sound')!=='off';const gm=localStorage.getItem('denkmal-graphics');if(['auto','low','high'].includes(gm))graphicsMode=gm;const zm=localStorage.getItem('denkmal-zoom');if(['wide','standard'].includes(zm))zoomMode=zm;telemetryOn=localStorage.getItem('denkmal-telemetry')==='on';}catch{}
  function telemetryLabel(){$('telemetryBtn').textContent=`FPS: ${telemetryOn?'AN':'AUS'}`;$('telemetryBtn').setAttribute('aria-pressed',String(telemetryOn));$('fpsOverlay').classList.toggle('hidden',!telemetryOn);}
  function toggleTelemetry(){telemetryOn=!telemetryOn;telemetryFrames=0;telemetryLast=0;try{localStorage.setItem('denkmal-telemetry',telemetryOn?'on':'off');}catch{}telemetryLabel();}
  function soundLabel(){$('soundBtn').textContent=`TON: ${audioOn?'AN':'AUS'}`;$('soundBtn').setAttribute('aria-pressed',String(audioOn));}
  $('soundBtn').onclick=()=>{audioOn=!audioOn;fx.mute(!audioOn);if(!audioOn)saga.stopVoice();soundLabel();try{localStorage.setItem('denkmal-sound',audioOn?'on':'off');}catch{}if(audioOn)tone(440,.1);};$('graphicsBtn').onclick=cycleGraphics;$('zoomBtn').onclick=cycleZoom;$('telemetryBtn').onclick=toggleTelemetry;soundLabel();graphicsLabel();zoomLabel();telemetryLabel();
  atlas.onerror=()=>showToast('GRAFIK KONNTE NICHT GELADEN WERDEN');
  saga.init({getGame:()=>game,getState:()=>state,setState:s=>{state=s;last=performance.now();},focusModal,focusGame,clearInput,updateUI,soundOn:()=>audioOn,hurtEnemy,spark,tone,nearest,shoot});
  resize();reset();menuStatus();focusModal(ui.start);requestAnimationFrame(loop);
})();
