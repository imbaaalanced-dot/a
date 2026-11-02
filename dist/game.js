(() => {
  'use strict';
  const saga = globalThis.HeroSaga;
  const campaign = globalThis.DenkmalLevels;
  const fx = globalThis.DenkmalCombatFX;
  const kirchende = globalThis.KirchendeCombat;
  document.addEventListener('pointerdown',()=>{fx.unlock();fx.mute(!audioOn);});
  document.addEventListener('keydown',()=>{fx.unlock();fx.mute(!audioOn);});
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', {alpha:false});
  const mobileRender=matchMedia('(pointer:coarse)').matches;
  globalThis.DenkmalMobileRender=mobileRender;
  const atlas = new Image();
  const monumentImage = new Image();
  monumentImage.src = 'assets/monument-level1-v2.webp';
  const hellscape = new Image();
  const art = {};
  const towerArt = { bow:new Image(), cannon:new Image(), ballista:new Image(), mage:new Image(), mortar:new Image(), rift:new Image(), shrine:new Image() };
  const towerLevelArt = {
    bow:[new Image(),new Image(),new Image()],
    cannon:[new Image(),new Image(),new Image()],
    ballista:[new Image(),new Image(),new Image()],
    rift:[new Image(),new Image(),new Image()],
    boomerang:[new Image()]
  };
  // Visible bounds of the original transparent PNGs; retain their source bytes.
  // Rendering ignores uneven transparent margins and keeps each base on its slot.
  const towerSpriteBounds = {
    bow:[[242,118,772,1061],[216,63,852,1165],[238,13,945,1222]],
    cannon:[[202,185,877,937],[156,55,977,1155],[123,30,1009,1205]],
    ballista:[[195,67,916,1127],[134,10,1026,1234],[57,44,1169,1190]]
  };
  // Large legacy PNGs are fallback art, requested only if their renderer is needed.
  const legacyTowerFiles={bow:'tower-bow-infernal-v1.webp',cannon:'tower-cannon-ash-v1.webp',ballista:'tower-ballista-rift-v1.png',mage:'tower-mage-hellfire-v1.png',mortar:'tower-mortar-volcanic-v1.png',rift:'tower-rift-lance-v1.webp',shrine:'tower-warden-shrine-v1.png'};
  towerLevelArt.boomerang[0].src='assets/tower-boomerang-atlas.webp?v=v400a5combined1';
  atlas.src = 'assets/asset-atlas.webp';
  // All six maps render their own ground; do not decode the unused 1254px legacy terrain.
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
  let W=0,H=0,dpr=1,last=0,time=0,state='start',audioOn=true,shake=0,hitStop=0,toastTimer=0,tutorialActive=false,tutorialPending=false,tutorialStepIndex=0,speedMultiplier=1,levelLoadRequest=0;
  let keys={}, mouse={x:0,y:0}, touch={x:0,y:0}, facing={x:0,y:-1}, moveIntent={x:0,y:0}, hudClock=0,camera={x:0,y:0},cameraLeadState={x:0,y:0};
  let telemetryOn=false,telemetryFrames=0,telemetryLast=0,telemetryFps=0;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // A tester-only preview must not unlock or complete campaign chapters in shared localStorage.
  const viewDepth=globalThis.Style2Phase6?.depth||1;
  const alpha8Preview=!!globalThis.location?.pathname?.includes('/v4.1.0/')||!!globalThis.location?.pathname?.includes('/v4-alpha8/')||!!globalThis.location?.pathname?.includes('/v4-alpha9/');
  const style2Preview=alpha8Preview||!!globalThis.location?.pathname?.includes('/v4-style2-phase6/')||!!globalThis.location?.pathname?.includes('/v4-style2/')||!!globalThis.location?.pathname?.includes('/v4-style2-cannon/')||!!globalThis.location?.pathname?.includes('/v4-style2-towers/')||!!globalThis.location?.pathname?.includes('/v4-style2-maps/')||!!globalThis.location?.pathname?.includes('/v4-style2-phase7/')||!!globalThis.location?.pathname?.includes('/v4-style2-reference/')||!!globalThis.location?.pathname?.includes('/v4-20261018/');
  const level4Preview=style2Preview||!!globalThis.location?.pathname?.includes('/v4-level4/');
  const level5Preview=style2Preview||!!globalThis.location?.pathname?.includes('/v4-level5/');
  const enabledTowers=new Set(['bow','cannon','mage','rift']);
  const towerRoles={
    bow:{label:'PRÄZISION',icon:'➶'},
    cannon:{label:'FLÄCHE',icon:'✹'},
    mage:{label:'KONTROLLE',icon:'✦'},
    rift:{label:'KETTE',icon:'ϟ'},boomerang:{label:'RÜCKFLUG',icon:'↶'}
  };
  let inventoryReturn='start';
  let storage;try{storage=localStorage;}catch{}
  const preferenceKey='denkmal-preferences-v1',preferenceVersion=1;
  const preferenceDefaults={character:'marcel',graphics:'auto',zoom:'wide',sound:true,telemetry:false,tutorialSeen:false};
  const validPreferences=p=>!!p&&typeof p==='object'&&!Array.isArray(p)&&['marcel','kim'].includes(p.character)&&['auto','low','high'].includes(p.graphics)&&['wide','standard'].includes(p.zoom)&&typeof p.sound==='boolean'&&typeof p.telemetry==='boolean'&&typeof p.tutorialSeen==='boolean';
  const preferenceStore=globalThis.DenkmalPersistence.create(storage);
  const preferenceLoaded=preferenceStore.load(preferenceKey,preferenceVersion,preferenceDefaults,validPreferences,s=>{
    const character=s.getItem('denkmal-character'),graphics=s.getItem('denkmal-graphics'),zoom=s.getItem('denkmal-zoom');
    return {character:character==='kim'?'kim':'marcel',graphics:['auto','low','high'].includes(graphics)?graphics:'auto',zoom:['wide','standard'].includes(zoom)?zoom:'wide',sound:s.getItem('denkmal-sound')!=='off',telemetry:s.getItem('denkmal-telemetry')==='on',tutorialSeen:s.getItem('td2-v4-intro-tutorial')==='done'};
  });
  const preferences=preferenceLoaded.value;
  function savePreference(key,value){preferences[key]=value;return preferenceStore.save(preferenceKey,preferenceVersion,preferences,validPreferences);}
  audioOn=preferences.sound;graphicsMode=preferences.graphics;zoomMode=preferences.zoom;telemetryOn=preferences.telemetry;
  const lootModel=globalThis.DenkmalLoot.create({storage,canManage:()=>state==='inventory'&&inventoryReturn==='start',getHero:()=>state==='inventory'&&inventoryReturn!=='start'?(game?.hero.character||selectedCharacter):selectedCharacter});
  if(lootModel.profile.level2&&!campaign.unlocked)campaign.unlock();
  if(campaign.unlocked&&!lootModel.profile.level2)lootModel.unlockLevel();
  const lootUI=globalThis.DenkmalLootUI?.create(lootModel,{editable:()=>inventoryReturn==='start',getHero:()=>inventoryReturn==='start'?selectedCharacter:game?.hero.character,onClose:()=>closeInventory(),onImport:()=>{if(lootModel.profile.level2)campaign.unlock();menuStatus();}});
  const towerSpecs={
    boomerang:{name:'BUMERANGTURM',cost:48,damage:8,rate:1.75,range:265,color:'#d9b976'},
    bow:{name:'BOGENTURM',cost:25,damage:12,rate:.50,range:300,color:'#d4b879'},
    cannon:{name:'KANONENTURM',cost:35,damage:34,rate:1.15,range:275,color:'#d7a16c',splash:64},
    ballista:{name:'BALLISTATURM',cost:45,damage:45,rate:1.42,range:300,color:'#e8d9ae'},
    mage:{name:'MAGIETURM',cost:46,damage:17,rate:.68,range:282,color:'#69bfff',slow:.58,slowDuration:1.6},
    mortar:{name:'LAVAMÖRSER',cost:62,damage:34,rate:1.55,range:330,color:'#ff7446',splash:74},
    rift:{name:'RIFTLANZE',cost:58,damage:21,rate:.46,range:292,color:'#ee58ff',chain:2},
    shrine:{name:'WÄCHTERSCHREIN',cost:58,damage:13,rate:.62,range:240,color:'#7ee5d7',heal:2.2}
  };
  // Enemy pressure pass: stronger archetypes instead of indiscriminate tower nerfs.
  const enemySpecs={
    ...globalThis.FlightEnemies?.specs,
    rootrunner:{hp:40.5,speed:89.1,damage:10,r:11,bounty:3},
    stoneguard:{hp:175,speed:34.5,damage:27,r:20,bounty:5,armor:.35},
    mistcaller:{hp:54,speed:56.1,damage:11,r:14,bounty:5},
    uprooted:{hp:1248,speed:22.75,damage:52,r:40,bounty:45,attackRange:140,attackCooldown:6},
    wraith:{hp:54,speed:66,damage:13,r:12,bounty:2},
    runner:{hp:38,speed:106,damage:10,r:10,bounty:2},
    brute:{hp:125,speed:46,damage:27,r:18,bounty:3},
    archer:{hp:64,speed:51,damage:13,r:12,bounty:3,attackRange:170,attackCooldown:1.10},
    guardian:{hp:165,speed:38,damage:21,r:17,bounty:4,armor:.32},
    sapper:{hp:88,speed:58,damage:38,r:14,bounty:4,focusMonument:true,attackCooldown:1.05},
    boss:{hp:1040,speed:35,damage:52,r:34,bounty:35,attackCooldown:.74}
  };
  const waveSizes=[0,9,12,15,18,21,23,26,29];
  // Avoid the old abrupt 8 -> 9 jump while increasing endless pressure.
  function waveSize(wave){if(inPortal())return portalRun.section===3&&portalRun.waveInSection===2?12:10+portalRun.section*3;const opening=game?.level===5?globalThis.DenkmalHohensyburg.campaignWave(wave,game.mode):null;return opening?.count??(waveSizes[wave]||Math.min(48,30+(wave-8)*3));}
  function enemyTypeForSpawn(wave,index){
    if(game?.mode==='campaign-pilot'){if(wave===8&&index===0)return 'boss';const pool=['wraith','runner',...(wave>=3?['archer']:[]),...(wave>=6?['guardian','sapper']:[])];return pool[index%pool.length];}
    if(inPortal()){if(portalRun.section===3&&portalRun.waveInSection===2&&index===0)return 'boss';const pool=portalRun.section===1?['wraith','wraith','runner']:portalRun.section===2?['wraith','runner','archer']:['wraith','guardian','archer'];return pool[index%pool.length];}

    if(game?.level===6)return globalThis.DenkmalGoethe.enemyType(wave,index);
    if(game?.level===5)return globalThis.DenkmalHohensyburg.enemyType(wave,index,game.mode);
    if(game?.level===4){
      if(wave===16&&index===0)return 'boss';
      const pool=['wraith','runner','guardian'];
      if(wave>=14)pool.push('archer');
      if(wave>=15)pool.push('sapper');
      return pool[(index+wave)%pool.length];
    }
    if(game?.level===3){if(wave===12&&index===0)return 'uprooted';const pool=['wraith','rootrunner'];if(wave>=10)pool.push('stoneguard');if(wave>=11)pool.push('mistcaller');return pool[index%pool.length];}
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
  const miniBossPlans=[
    {name:'MINI-BOSS · PANZERWACHE',miniBoss:true,hpAll:1.28,armorAll:.12,speedAll:.94},
    {name:'MINI-BOSS · BLUTSTURM',miniBoss:true,hpAll:1.14,damageAll:1.20,speedAll:1.08},
    {name:'MINI-BOSS · RISSJÄGER',miniBoss:true,hpAll:1.18,damageAll:1.12,cooldownAll:.78}
  ];
  function wavePlan(wave){
    if(inPortal())return {name:'PORTALREISE · ABSCHNITT '+portalRun.section};
    if(game?.mode==='campaign-pilot')return {name:wave<=2?'DIE SÜDFLANKE':wave<=5?'ZWEI FRONTEN':'VIER TORE',speedAll:1};
    if(game?.level===6)return {name:globalThis.DenkmalGoethe.waveName(wave)};
    if(game?.level===5)return {name:globalThis.DenkmalHohensyburg.waveName(wave)};
    if(game?.level===4&&wave<=16)return {name:{13:'SCHATTEN DES KIRCHHOFS',14:'NEBEL AM KIRCHWEG',15:'DIE LETZTE GLOCKE',16:'DER GRABWÄCHTER'}[wave]};
    if(game?.level===3&&wave<=12)return {name:{9:'DIE WURZELN ERWACHEN',10:'STEINWACHT',11:'NEBEL ÜBER KIRCHENDE',12:'DER ENTWURZELTE'}[wave]||'KIRCHENDER WACHT'};
    if(wavePlans[wave])return wavePlans[wave];
    if(wave>=12&&wave%4===0)return miniBossPlans[(Math.floor(wave/4)-3)%miniBossPlans.length];
    return {name:wave%2?'NACHTWACHT':'RISSWELLE',speedAll:1+Math.min(.12,Math.max(0,wave-8)*.01)};
  }
  const targetModes=['first','strongest','nearest','boss'];
  const targetLabels={first:'ERSTER',strongest:'STÄRKSTER',nearest:'NÄCHSTER',boss:'BOSS'};
  const enemyLabels={shadowwing:'SCHATTENFLÜGLER',gargoyle:'GARGOYLE',stormwing:'STURMGEIST',rootrunner:'WURZELLÄUFER',stoneguard:'STEINPANZER',mistcaller:'NEBELRUFER',uprooted:'DER ENTWURZELTE',wraith:'GEIST',runner:'LÄUFER',brute:'BRECHER',archer:'SCHÜTZE',guardian:'WÄCHTER',sapper:'SAPPEUR',boss:'BOSS'};
  function waveComposition(wave){
    const counts={};
    for(let i=0;i<waveSize(wave);i++){const type=enemyTypeForSpawn(wave,i);counts[type]=(counts[type]||0)+1;}
    return counts;
  }
  function wavePreview(wave){return Object.entries(waveComposition(wave)).map(([type,count])=>`${count}× ${enemyLabels[type]||type.toUpperCase()}`).join(' · ');}
  function applyWavePlan(type,base,wave){
    const plan=wavePlan(wave);
    return {
      hp:(plan.hp?.[type]||1)*(plan.hpAll||1),
      speed:(plan.speed?.[type]||1)*(plan.speedAll||1),
      damage:(plan.damage?.[type]||1)*(plan.damageAll||1),
      armor:(plan.armor?.[type]||0)+(plan.armorAll||0),
      cooldown:(plan.cooldown?.[type]||1)*(plan.cooldownAll||1)
    };
  }
  const chapters=[
    {name:'DAS TOR DER ASCHE',note:'Die Asche trägt noch die Namen der Gefallenen.',until:3},
    {name:'DIE SCHLUCHT DER RISSEN',note:'Unter dem Basalt schlägt ein fremdes Licht.',until:7},
    {name:'DIE VERGLASTE KRONE',note:'Der Aschenkönig hat deine Spur aufgenommen.',until:Infinity}
  ];
  function clearInput(){keys={};touch={x:0,y:0};if(pointerId!==null&&stick.hasPointerCapture?.(pointerId)){try{stick.releasePointerCapture(pointerId);}catch{}}pointerId=null;activeTouchId=null;$('joystick').firstElementChild.style.transform='translate(0,0)';}
  function focusModal(el){clearInput();document.querySelectorAll('#app > :not(.modal)').forEach(n=>n.inert=true);if(el.id==='startScreen')$(menuPanel==='home'?'menuPlayBtn':'menuBackBtn').focus();else el.querySelector('button')?.focus();}
  function focusGame(){document.querySelectorAll('#app > :not(.modal)').forEach(n=>n.inert=false);canvas.focus({preventScroll:true});}
  function pauseGame(){if(state!=='playing'||tutorialActive)return;state='paused';clearInput();saga.stopVoice();$('pauseScreen').classList.remove('hidden');focusModal($('pauseScreen'));updateUI();}
  function resumeGame(){if(state!=='paused')return;state='playing';$('pauseScreen').classList.add('hidden');last=performance.now();focusGame();updateUI();}
  function dodge(){if(state!=='playing'||tutorialActive||game.hero.dodgeCd>0)return;const h=game.hero;h.dodge=.18;h.dodgeCd=1.2*saga.stats(h).dodge;h.invuln=.35;h.dodgeX=facing.x;h.dodgeY=facing.y;spark(h.x,h.y,'#dbc07e',9);}
  const rand=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

  let game,assetLevel=0;
  let selectedCharacter=preferences.character,runSerial=0;
  let originalIntroSlots=null;
  function reset(level=1,mode='campaign'){
    if(!originalIntroSlots)originalIntroSlots=campaign.levels[1].slots;campaign.levels[1].slots=mode==='campaign-pilot'?CampaignBalance.profile(1,{pilot:true}).slots:originalIntroSlots;
    clearInput();speedMultiplier=1;time=0;shake=0;hitStop=0;facing={x:1,y:0};moveIntent={x:0,y:0};cameraLeadState={x:0,y:0};
    const definition=campaign.levels[level];
    game={runId:(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+(++runSerial)+'-'+Math.random().toString(36).slice(2)),spawnSerial:0,level,mode,wave:definition.firstWave,elapsed:0,essence:definition.startEssence??(level===2?130:70),deathFx:[],selectedTower:'bow',kills:0,waveSpawned:0,waveKilled:0,waveTotal:0,spawnTimer:1.2,intermission:5,
      hero:{character:selectedCharacter,x:WORLD_W*.5+140,y:WORLD_H*.5+80,r:13,hp:100,maxHp:100,speed:205,damage:18,fireRate:.47,fireCd:0,range:340,dodgeCd:0,dodge:0,invuln:0,kind:'wand'},
      monument:{x:WORLD_W*.5,y:WORLD_H*.5,r:48,hp:500,maxHp:500},
      enemies:[],bullets:[],particles:[],damageTexts:[],loot:[],inventory:[],maxInventory:30,rewardedWaves:new Set(),towers:[],maxTowers:definition.maxTowers??(level===2?6:4)};
    game.waveTotal=waveSize(game.wave);
    if(mode==='campaign-pilot')game.maxTowers=6;
    saga.reset(game.hero,lootModel.snapshot(selectedCharacter));game.inventory=lootModel.view(selectedCharacter).bag;updateCamera();ui.perk.classList.add('hidden');ui.gameover.classList.add('hidden');selectTower('bow');updateUI();
  }
  function cameraLead(){
    const amount=mobileRender?44:72,magnitude=clamp(Math.hypot(moveIntent.x,moveIntent.y),0,1);
    if(magnitude<=.08)return {x:0,y:0};
    const scaled=(magnitude-.08)/.92,nx=moveIntent.x/magnitude,ny=moveIntent.y/magnitude;
    return {x:nx*amount*scaled,y:ny*amount*.68*scaled};
  }
  function updateCamera(dt=0){
    if(!game)return;
    const vw=W/zoom,vh=H/(zoom*viewDepth),focusY=portraitLayout()?.43:.5,targetLead=cameraLead();
    const alpha=dt>0?1-Math.exp(-dt*(mobileRender?9:11)):1;
    cameraLeadState.x+=(targetLead.x-cameraLeadState.x)*alpha;
    cameraLeadState.y+=(targetLead.y-cameraLeadState.y)*alpha;
    const lead=cameraLeadState;
    camera.x=vw>WORLD_W?(WORLD_W-vw)/2:clamp(game.hero.x+lead.x-vw*.5,0,WORLD_W-vw);
    camera.y=vh>WORLD_H?(WORLD_H-vh)/2:clamp(game.hero.y+lead.y-vh*focusY,0,WORLD_H-vh);
  }
  function screenToWorld(x,y){const rect=canvas.getBoundingClientRect();return {x:(x-rect.left)*W/rect.width/zoom+camera.x,y:(y-rect.top)*H/rect.height/(zoom*viewDepth)+camera.y};}
  function resize(pauseOnResize=true){
    W=innerWidth;H=innerHeight;
    const cap=graphicsMode==='high'?1.75:graphicsMode==='low'?.85:mobileRender?1:1.5;
    // A tall phone can otherwise allocate several million canvas pixels even at DPR 1.
    // Choose the buffer size when the viewport/mode changes; never resize it in the render loop.
    const pixelBudget=mobileRender?(graphicsMode==='high'?2000000:graphicsMode==='low'?550000:900000):Infinity;
    dpr=Math.min(cap,devicePixelRatio||1,Math.sqrt(pixelBudget/Math.max(1,W*H)));
    zoom=zoomForMode();$('app').classList.toggle('portrait',portraitLayout());
    const pixelWidth=Math.round(W*dpr),pixelHeight=Math.round(H*dpr);
    const bufferChanged=canvas.width!==pixelWidth||canvas.height!==pixelHeight;
    if(canvas.width!==pixelWidth)canvas.width=pixelWidth;
    if(canvas.height!==pixelHeight)canvas.height=pixelHeight;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingQuality=graphicsMode==='high'?'medium':'low';
    if(game){updateCamera();if(bufferChanged)draw();if(pauseOnResize&&state==='playing')pauseGame();}
  }

  function chapter(){return chapters.find(c=>game.wave<=c.until)||chapters.at(-1)}
  function setMapStatus(id,unlocked){
    const button=$(id);if(!button)return;button.disabled=!unlocked;
    const status=button.querySelector('[data-map-status]');
    if(status)status.textContent=unlocked?'FREIGESCHALTET':'GESPERRT';
    button.setAttribute('aria-label',`${button.querySelector('.map-copy strong')?.textContent||'Karte'} · ${unlocked?'freigeschaltet':'gesperrt'}`);
  }
  function menuStatus(){
    setMapStatus('level2Btn',campaign.unlocked||alpha8Preview);
    setMapStatus('level3Btn',lootModel.profile.level3||style2Preview);
    if(style2Preview&&!lootModel.profile.level3){
      const label=$('level3Btn')?.querySelector('[data-map-status]');
      if(label)label.textContent='TESTVORSCHAU';
    }
    setMapStatus('level4Btn',lootModel.profile.kirchendeCompleted||level4Preview);
    if(level4Preview&&!lootModel.profile.kirchendeCompleted){
      const label=$('level4Btn')?.querySelector('[data-map-status]');
      if(label)label.textContent='TESTVORSCHAU';
    }
    setMapStatus('level5Btn',campaign.level4Completed||level5Preview);
    if(level5Preview&&!campaign.level4Completed){const label=$('level5Btn')?.querySelector('[data-map-status]');if(label)label.textContent='TESTVORSCHAU';}
    setMapStatus('level6Btn',campaign.level5Completed||campaign.level6Completed||style2Preview);
    if(style2Preview&&!campaign.level5Completed){const label=$('level6Btn')?.querySelector('[data-map-status]');if(label)label.textContent='TESTVORSCHAU';}
    setMapStatus('endless5Btn',campaign.level5Completed);
    setMapStatus('endless6Btn',campaign.level6Completed);
    setMapStatus('endless1Btn',campaign.unlocked);
    setMapStatus('endlessBtn',lootModel.profile.level3);
    setMapStatus('endless3Btn',lootModel.profile.kirchendeCompleted);
    setMapStatus('endless4Btn',campaign.level4Completed);
    const chapter=campaign.level6Completed?'Kampagne abgeschlossen':`Kampagne · Level ${campaign.level5Completed?6:campaign.level4Completed?5:lootModel.profile.kirchendeCompleted?4:lootModel.profile.level3?3:campaign.unlocked?2:1}`;
    $('menuCompactStatus').textContent=`${chapter} · Rucksack ${lootModel.view(selectedCharacter).bag.length}/30${lootModel.view(selectedCharacter).overflow.length?' · +'+lootModel.view(selectedCharacter).overflow.length+' Überlauf':''}`;
    $('menuStorageWarning').textContent=lootModel.status;
    $('menuStorageWarning').hidden=!lootModel.status;
    if($('collectionSummary'))$('collectionSummary').textContent=`${lootModel.view(selectedCharacter).bag.length}/30 im Rucksack · ${lootModel.view(selectedCharacter).overflow.length} im Überlauf · Ausrüstung nur hier wechseln`;
    if($('saveStatus'))$('saveStatus').textContent=lootModel.status||'Beute und Ausrüstung werden auf diesem Gerät gespeichert.';
    $('levelProgress').textContent=campaign.level6Completed?'Goethestraße verteidigt · Endlosmodus Level 6 verfügbar':campaign.level5Completed?'Hohensyburg verteidigt · Goethestraße und Endlosmodus Level 5 verfügbar':campaign.level4Completed?'Dorfkirche verteidigt · Hohensyburg und Endlosmodus Level 4 verfügbar':lootModel.profile.kirchendeCompleted?'Level 4 Dorfkirche freigeschaltet · verteidige den schlafenden Löwen':lootModel.profile.level3?'Kirchende freigeschaltet · Level 3 und Endlosmodus verfügbar':campaign.unlocked?(campaign.storageAvailable?'Level 2 freigeschaltet · jederzeit hier starten':'Level 2 freigeschaltet · Speichern blockiert, nur für diese Sitzung'):'Level 2 wird nach Welle 5 freigeschaltet.';
  }
  // V4 alpha.4: the HUD menu is a <details> overlay; every screen switch must close it.
  function closeHudMenu(){const menu=$('hudMenu');if(menu)menu.open=false;return true;}
  function closeScreens(){closeHudMenu();tutorialActive=false;tutorialPending=false;saga.stopVoice();for(const id of ['startScreen','pauseScreen','perkScreen','gameover','levelComplete','storyScreen','characterScreen','inventoryScreen','introTutorial'])$(id).classList.add('hidden');}
  const introTutorialSteps=[
    {title:'Bewegen und automatisch angreifen',text:'Am PC bewegst du deinen Helden mit WASD oder den Pfeiltasten. Auf dem Handy ziehst du den linken Steuerstick. Dein Runenstab greift Gegner automatisch an.',target:()=>mobileRender?$('joystick'):$('game')},
    {title:'Seelenruf und Ausweichen',text:'Der Seelenruf (F oder antippen) trifft Gegner in deiner Nähe und schützt dich kurz. Mit Leertaste oder AUSWEICHEN weichst du Angriffen aus.',target:()=>$('soulBtn')},
    {title:'Türme wählen und bauen',text:'Wähle einen Turmtyp in der Leiste. Baue auf markierten Bauplätzen mit E oder BAUEN. Türme kosten Essenz; nahe Türme kannst du aufwerten oder verkaufen.',target:()=>$('arsenal')},
    {title:'Wellen und Baupause',text:'Während der Baupause kannst du Türme setzen. Starte die nächste Welle mit WELLE STARTEN oder warte kurz. Halte Gegner vom Denkmal fern.',target:()=>$('objective')},
    {title:'Beute und Inventar',text:'Gefundene Beute bleibt auch nach einer Niederlage erhalten. Öffne den Rucksack mit I oder über MENÜ · BEUTE. Ausrüstung wechselst du im Hauptmenü.',target:()=>document.querySelector('.hud-menu summary')}
  ];
  function tutorialSeen(){return preferences.tutorialSeen;}
  function positionTutorialArrow(){
    if(!tutorialActive)return;
    const arrow=$('tutorialArrow'),bubble=document.querySelector('#introTutorial .tutorial-bubble'),target=introTutorialSteps[tutorialStepIndex]?.target();
    if(!arrow||!bubble||!target)return;
    const a=target.getBoundingClientRect(),b=bubble.getBoundingClientRect();
    if(!a.width||!a.height||!b.width||!b.height)return;
    const tx=a.left+a.width/2,ty=a.top+a.height/2,cx=b.left+b.width/2,cy=b.top+b.height/2;
    const dx=tx-cx,dy=ty-cy;
    const sx=Math.min((b.width/2)/Math.max(Math.abs(dx),.001),(b.height/2)/Math.max(Math.abs(dy),.001));
    const x0=cx+dx*sx,y0=cy+dy*sx;
    const inset=Math.min(18,Math.min(a.width,a.height)*.25),x1=tx-(dx/(Math.hypot(dx,dy)||1))*inset,y1=ty-(dy/(Math.hypot(dx,dy)||1))*inset;
    const length=Math.hypot(x1-x0,y1-y0);
    arrow.style.left=x0+'px';arrow.style.top=y0+'px';arrow.style.width=Math.max(0,length)+'px';arrow.style.transform='rotate('+Math.atan2(y1-y0,x1-x0)+'rad)';
  }
  function renderIntroTutorialStep(){
    const step=introTutorialSteps[tutorialStepIndex];
    $('introTutorial').dataset.step=String(tutorialStepIndex);
    $('tutorialTitle').textContent=step.title;$('tutorialText').textContent=step.text;
    $('tutorialCount').textContent=`${tutorialStepIndex+1} / ${introTutorialSteps.length}`;
    $('tutorialNext').textContent=tutorialStepIndex===introTutorialSteps.length-1?'LOS GEHT’S':'WEITER';
    requestAnimationFrame(positionTutorialArrow);
  }
  function showIntroTutorial(){
    if(tutorialSeen()||!game||game.level!==1||state!=='playing'){tutorialPending=false;return;}
    tutorialPending=false;tutorialActive=true;tutorialStepIndex=0;
    $('introTutorial').classList.remove('hidden');renderIntroTutorialStep();focusModal($('introTutorial'));
  }
  function queueIntroTutorial(){
    if(tutorialSeen()||!game||game.level!==1)return;
    tutorialPending=true;
    requestAnimationFrame(()=>{if(state==='playing'&&game?.level===1)showIntroTutorial();else tutorialPending=false;});
  }
  function finishIntroTutorial(){
    if(!tutorialActive)return;
    tutorialActive=false;tutorialPending=false;
    savePreference('tutorialSeen',true);
    $('introTutorial').classList.add('hidden');focusGame();last=performance.now();updateUI();
  }
  function nextIntroTutorial(){
    if(!tutorialActive)return;
    if(tutorialStepIndex<introTutorialSteps.length-1){tutorialStepIndex++;renderIntroTutorialStep();$('tutorialNext').focus();}
    else finishIntroTutorial();
  }
  function releaseLevelArt(level){
    if(!level)return;
    globalThis.DenkmalAssets?.release('level:'+level);
    if(level<=2)globalThis.Style2Maps?.reset?.();
    if(level===5)globalThis.DenkmalHohensyburgArt?.release?.();
    if(level===6)globalThis.DenkmalGoetheArt?.release?.();
    globalThis.Style2Phase6?.reset?.();
    globalThis.DenkmalMapPolish?.reset?.();globalThis.TD2DirectionalActions?.setLevel?.(0);
  }
  function mainMenu(){levelLoadRequest++;if(game&&state!=='start')collectWaveLoot();releaseLevelArt(assetLevel);globalThis.DenkmalAssets?.release('level:'+(assetLevel+1));assetLevel=0;closeScreens();clearInput();state='start';showMenuPanel('home',false);menuStatus();ui.start.classList.remove('hidden');focusModal(ui.start);updateUI();}
  // Portal runs use local wave numbers, independent of campaign unlock milestones.
  let portalRun=null,portalSavedRevision=null,portalInside=false,portalRewardPending=null;
  const portalStore=globalThis.PortalRun?.createStore(storage);
  const portalPoint=()=>({x:campaign.center.x,y:campaign.center.y-760});
  const inPortal=()=>game?.mode==='portal';
  const perkStats=()=>globalThis.PortalPerks?.derive({},portalRun?.perkRanks||{})||{};
  function commitPortal(candidate){
    if(!candidate)return false;
    const ok=portalStore.save(candidate,portalSavedRevision);
    if(ok){portalRun=candidate;portalSavedRevision=candidate.revision;}
    else showToast('Portalstand konnte nicht gespeichert werden · erneut versuchen');
    return ok;
  }
  function portalTransition(event,checkpoint){
    const candidate=PortalRun.reduce(portalRun,event).run;
    if(candidate===portalRun)return false;
    if(checkpoint!==undefined)candidate.checkpoint=checkpoint;
    return commitPortal(candidate);
  }
  function portalSnapshot(){return {hero:JSON.parse(JSON.stringify(game.hero)),gold:game.essence,monumentHp:game.monument.hp,towers:JSON.parse(JSON.stringify(game.towers)),wave:game.wave};}
  function applyPortalSnapshot(c){if(!c)return;Object.assign(game.hero,c.hero);game.essence=c.gold;game.monument.hp=c.monumentHp??100;game.towers=c.towers.map(t=>({...t}));game.wave=c.wave;}
  function portalWaveSetup(run=portalRun){game.waveSpawned=0;game.waveKilled=0;game.waveTotal=run.section===3&&run.waveInSection===2?12:10+run.section*3;game.spawnTimer=.6;game.intermission=999999;game.enemies=[];game.bullets=[];game.loot=[];}
  function setupPortalSection(run=portalRun){
    reset(1,'portal');tutorialPending=false;tutorialActive=false;closeScreens();state='playing';
    game.maxTowers=6;game.essence=run.gold;game.wave=(run.section-1)*2+run.waveInSection;
    game.monument.hp=game.monument.maxHp=100;
    const stats=globalThis.PortalPerks?.derive({},run.perkRanks||{})||{};game.hero.maxHp*=stats.healthMultiplier||1;
    game.hero.hp=run.heroHp===null?game.hero.maxHp:Math.min(game.hero.maxHp,run.heroHp);
    game.hero.y=campaign.center.y+720;game.hero.x=campaign.center.x+100;
    portalWaveSetup(run);portalInside=false;focusGame();updateCamera();updateUI();
  }
  function startPortalRun({resume=false}={}){
    if(!portalStore||!globalThis.PortalPerks)return false;
    const saved=portalStore.load();portalSavedRevision=saved.status==='ok'?saved.run.revision:null;
    if(resume){if(saved.status!=='ok'||['finished','failed'].includes(saved.run.phase)){showToast('Kein fortsetzbarer Portalstand');return false;}portalRun=saved.run;selectedCharacter=portalRun.heroId;}
    else {if(saved.status==='incompatible'||saved.status==='corrupt'){showToast('Portalstand unlesbar · bestehende Daten bleiben erhalten');return false;}portalRun=PortalRun.create({runId:globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),seed:Math.floor(Math.random()*4294967296),heroId:selectedCharacter,startBudget:towerSpecs.bow.cost*3,maxSections:3});}
    levelLoadRequest++;portalRewardPending=null;saga.stopVoice();
    if(resume&&portalRun.phase==='combat'){
      const candidate=JSON.parse(JSON.stringify(portalRun));candidate.phase='build';candidate.revision++;
      if(!commitPortal(candidate))return false;
    }
    if(resume&&portalRun.phase==='loading'){
      const candidate=PortalRun.reduce(portalRun,{type:'READY'}).run;
      setupPortalSection(candidate);candidate.checkpoint=portalSnapshot();
      if(!commitPortal(candidate)){mainMenu();return false;}
    }else setupPortalSection();
    if(resume&&portalRun.checkpoint)applyPortalSnapshot(portalRun.checkpoint);
    if(!resume){const candidate=JSON.parse(JSON.stringify(portalRun));candidate.checkpoint=portalSnapshot();if(!commitPortal(candidate)){mainMenu();return false;}}
    if(portalRun.phase==='perk')showPortalPerks();
    else if(portalRun.phase==='exit'){game.intermission=999999;showToast('Portal oben ist offen · gehe hindurch');}
    updateUI();return true;
  }
  function showPortalPerks(){
    let offered=portalRun.offers,durable=true;
    if(!offered){const offer=PortalPerks.offer(portalRun.perkRanks,portalRun.rngState,{}),candidate=JSON.parse(JSON.stringify(portalRun));candidate.offers=offer.ids;candidate.rngState=offer.rngState;candidate.revision++;offered=offer.ids;durable=commitPortal(candidate);}
    state='perk';clearInput();ui.perkGrid.innerHTML='';
    offered.forEach((id,i)=>{const p=PortalPerks.catalog.find(p=>p.id===id),rank=portalRun.perkRanks[id]||0,b=document.createElement('button');b.className='perk';b.disabled=!durable;
      b.innerHTML=`<span class="num">${i+1}</span><small>${p.group}</small><h3>${p.name} ${rank+1}/3</h3><p>${p.desc}: ${rank?p.values[rank-1]:0} → ${p.values[rank]} %</p>`;
      b.onclick=()=>choosePortalPerk(id);ui.perkGrid.appendChild(b);});
    ui.perk.classList.remove('hidden');focusModal(ui.perk);
    if(!durable){const retry=document.createElement('button');retry.textContent='SPEICHERN ERNEUT VERSUCHEN';retry.onclick=showPortalPerks;ui.perkGrid.appendChild(retry);}
  }
  function choosePortalPerk(id){if(!inPortal()||state!=='perk'||!portalRun.offers?.includes(id))return;
    const candidate=PortalRun.reduce(portalRun,{type:'CHOOSE',id}).run;if(candidate===portalRun)return;
    const snapshot=portalSnapshot();
    if(id==='endurance'){const extra=game.hero.maxHp/(1+.1*(candidate.perkRanks.endurance-1))*.1;snapshot.hero.maxHp+=extra;snapshot.hero.hp+=extra;}
    candidate.checkpoint=snapshot;if(!commitPortal(candidate))return;
    applyPortalSnapshot(snapshot);
    ui.perk.classList.add('hidden');state='playing';portalInside=dist(game.hero,portalPoint())<52;focusGame();updateUI();showToast('Portal oben geöffnet · ↑');
  }
  function enterPortal(){
    if(!inPortal()||portalRun.phase!=='exit')return false;
    if(!portalTransition({type:'ENTER',gold:game.essence,monumentHp:game.monument.hp,towers:game.towers,hp:game.hero.hp,maxHp:game.hero.maxHp}))return false;
    const candidate=PortalRun.reduce(portalRun,{type:'READY'}).run;
    setupPortalSection(candidate);candidate.checkpoint=portalSnapshot();
    if(!commitPortal(candidate)){mainMenu();return false;}showToast('PORTALREISE · ABSCHNITT '+portalRun.section+' / 3');return true;
  }
  function endPortalWave(){
    if(portalRun.phase!=='combat')return;
    if(portalRewardPending){const reward=lootModel.claimBoss(portalRewardPending);if(!(reward.persisted||(reward.state==='duplicate'&&lootModel.save()))){showToast('Bossbeute nicht gespeichert · Speicherung erneut versuchen');return;}portalRewardPending=null;}
    const candidate=PortalRun.reduce(portalRun,{type:'CLEAR'}).run;if(candidate===portalRun)return;
    const snapshot=portalSnapshot();if(candidate.phase==='build')snapshot.wave=game.wave+1;
    candidate.checkpoint=snapshot;
    if(candidate.phase==='perk'&&!candidate.offers){const offer=PortalPerks.offer(candidate.perkRanks,candidate.rngState,{});candidate.offers=offer.ids;candidate.rngState=offer.rngState;candidate.revision++;}
    if(!commitPortal(candidate))return;
    game.enemies=[];game.bullets=[];
    if(portalRun.phase==='finished'){state='gameover';$('gameoverTitle').textContent='PORTALREISE GESCHAFFT';ui.gameoverStats.textContent='3 Abschnitte · Boss besiegt · Beute gesichert';ui.gameover.classList.remove('hidden');focusModal(ui.gameover);return;}
    if(portalRun.phase==='perk'){showPortalPerks();return;}
    game.wave++;portalWaveSetup();updateUI();
  }
  function portalTick(dt){
    const h=game.hero,phase=portalRun.phase;
    if(phase==='exit'){let dx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+touch.x,dy=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+touch.y;const l=Math.max(1,Math.hypot(dx,dy));h.x=clamp(h.x+dx/l*saga.stats(h).speed*dt,26,WORLD_W-26);h.y=clamp(h.y+dy/l*saga.stats(h).speed*dt,26,WORLD_H-26);updateCamera(dt);saga.update(dt,Math.hypot(dx,dy)>0,{x:dx,y:dy});const inside=dist(h,portalPoint())<52;if(inside&&!portalInside)enterPortal();portalInside=inside;return true;}
    return phase==='loading'||phase==='finished'||phase==='failed';
  }
  function drawPortal(){if(!inPortal())return;const p=portalPoint(),open=portalRun.phase==='exit';ctx.save();ctx.strokeStyle=open?'#7ee9e0':'#626e73';ctx.fillStyle=open?'#184c55cc':'#1a2428cc';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(p.x,p.y,48,66,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f0dfb4';ctx.textAlign='center';ctx.font='bold 20px sans-serif';ctx.fillText(open?'↑ ZUM NÄCHSTEN ABSCHNITT':'PORTAL · NOCH VERSIEGELT',p.x,p.y-88);ctx.restore();}
  function startGame(level=1,mode='campaign'){
    if(mode==='portal')return startPortalRun({resume:false});
    level=[1,2,3,4,5,6].includes(level)?level:1;
    if(level===5&&!campaign.level4Completed&&!level5Preview)return;
    if(level===6&&!campaign.level5Completed&&!campaign.level6Completed&&!style2Preview)return;
    if(level===2&&!campaign.unlocked&&!alpha8Preview||level===3&&!lootModel.profile.level3&&!style2Preview||level===4&&!lootModel.profile.kirchendeCompleted&&!level4Preview)return;
    if(mode==='endless'&&(level===6&&!campaign.level6Completed||level===1&&!campaign.unlocked||level===2&&!lootModel.profile.level3||level===3&&!lootModel.profile.kirchendeCompleted||level===4&&!campaign.level4Completed||level===5&&!campaign.level5Completed))return;
    const request=++levelLoadRequest,art=globalThis.KirchendeArt;
    if(level===3&&art?.ready&&!art.ready('monument')){
      const fromState=state;showToast('Denkmal wird geladen …');
      art.load(true).then(()=>{
        if(request!==levelLoadRequest||state!==fromState)return;
        if(art.ready('monument'))startGame(level,mode);
        else showToast('Denkmalgrafik nicht verfügbar · bitte Level erneut starten');
      });
      return;
    }
    art?.load(level===3);
    if(assetLevel!==level){
      globalThis.DenkmalAssets?.level(level);
      if(assetLevel)releaseLevelArt(assetLevel);
      assetLevel=level;
    }
    closeScreens();reset(level,mode);state='playing';focusGame();tone(220,.1);last=performance.now();
    setTimeout(()=>{if(levelLoadRequest===request&&assetLevel===level)globalThis.DenkmalAssets?.next(level);},1800);
    if(level===1){const storyShown=saga.chapter(1);if(!storyShown)queueIntroTutorial();}else showToast(`LEVEL ${level} · ${campaign.levels[level].name}`);updateUI();
  }
  function renderInventory(){if(state==='inventory')lootUI?.render();}
  function openInventory(){
    if(!['start','playing','paused'].includes(state))return;
    closeHudMenu();inventoryReturn=state;state='inventory';clearInput();saga.stopVoice();
    for(const id of ['startScreen','pauseScreen'])$(id).classList.add('hidden');
    renderInventory();$('inventoryScreen').classList.remove('hidden');focusModal($('inventoryScreen'));updateUI();
  }
  function closeInventory(){
    if(state!=='inventory')return;lootUI?.close();$('inventoryScreen').classList.add('hidden');state=inventoryReturn;last=performance.now();
    if(state==='start'){menuStatus();ui.start.classList.remove('hidden');focusModal(ui.start);}else if(state==='paused'){$('pauseScreen').classList.remove('hidden');focusModal($('pauseScreen'));}else focusGame();updateUI();
  }
  function lootFor(){return {kind:'essence'};}
  function rewardWave(){game.rewardedWaves.add(game.wave);}
  function isBoss(e){return e.type==='boss'||e.type==='uprooted';}
  function completeLevel(){
    collectWaveLoot();rewardWave();
    if(game.level===1&&!alpha8Preview){campaign.unlock();lootModel.unlockLevel();}
    else if(game.level===2&&!alpha8Preview)lootModel.unlockLevel3();
    else if(game.level===3&&!style2Preview)lootModel.claimKirchendeCompletion();
    else if(game.level===4&&!level4Preview)campaign.completeLevel4();
    else if(game.level===5&&!level5Preview)campaign.completeLevel5();
    else if(game.level===6&&!style2Preview)campaign.completeLevel6();
    saga.stopVoice();state='levelcomplete';clearInput();game.enemies=[];game.bullets=[];game.loot=[];
    $('levelCompleteTitle').textContent=game.level===6?'DIE GOETHESTRASSE IST SICHER':game.level===5?'HOHENSYBURG IST SICHER':game.level===1?'DAS LABYRINTH IST OFFEN':game.level===2?'KIRCHENDE IST OFFEN':game.level===3?'DIE DORFKIRCHE IST OFFEN':'DER SCHLAFENDE LÖWE IST SICHER';
    $('levelSaveNote').textContent=(style2Preview&&game.level===6||level5Preview&&game.level===5)?'Testvorschau abgeschlossen · keine Kampagnenfreischaltung gespeichert.':lootModel.status||(!campaign.storageAvailable?'Speichern blockiert · Freischaltung nur für diese Sitzung.':'Freischaltung und Beute gespeichert.');
    $('levelCompleteInfo').textContent=game.level===6?'Ehrenmal verteidigt · drei Bodenzuläufe und Luftangriff überstanden.':game.level===5?'Kaiser-Wilhelm-Denkmal verteidigt · Level 6 Goethestraße ist jetzt spielbar.':game.level===1?'Level 2 · Welle 6 · 130 Essenz':game.level===2?'Level 3 · Welle 9 · 180 Essenz · acht Türme':game.level===3?'Kirchende verteidigt. Level 4 · Welle 13 · 245 Essenz · zehn Turmplätze':'Löwendenkmal verteidigt · Endlosmodus Dorfkirche verfügbar.';
    $('nextLevelBtn').textContent=game.level===6?'GOETHESTRASSE ENDLOS':game.level===5?(level5Preview?'HOHENSYBURG ENDLOS':'LEVEL 6 STARTEN'):game.level===4?'LEVEL 5 STARTEN':game.level===1?'LEVEL 2 STARTEN':game.level===2?'LEVEL 3 STARTEN':game.level===3?'LEVEL 4 STARTEN':'DORFKIRCHE ENDLOS';
    $('continueEndlessBtn').classList.toggle('hidden',game.level===1);
    $('levelComplete').classList.remove('hidden');focusModal($('levelComplete'));updateUI();
  }
  function continueEndless(){if(state!=='levelcomplete')return;game.mode='endless';state='playing';$('levelComplete').classList.add('hidden');endWave();}
  function showToast(t){ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),1500)}
  function showWaveBanner(label){
    const el=$('waveBanner');if(!el)return;setText(el,label);el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
    clearTimeout(showWaveBanner.timer);showWaveBanner.timer=setTimeout(()=>el.classList.remove('show'),1250);
  }
  function spawnEnemy(typeOverride){
    if(game.enemies.filter(e=>!e.dead).length>=40)return;
    const level=campaign.levels[game.level],activeGates=inPortal()?[[2],[1,3],[1,2,3]][portalRun.section-1]:game.mode==='campaign-pilot'?(game.wave<=2?[2]:game.wave<=5?[1,3]:[0,1,2,3]):campaign.getWaveGates(game.level,game.wave),gateIndex=activeGates[game.waveSpawned%activeGates.length];
    const type=enemySpecs[typeOverride]?typeOverride:enemyTypeForSpawn(game.wave,game.waveSpawned),base=enemySpecs[type],plan=applyWavePlan(type,base,game.wave);
    const spawn=base.flying&&level.airGate?level.airGate:level.gates[gateIndex],{x,y}=spawn;
    const hpScale=(1+Math.max(0,game.wave-1)*.17)*plan.hp,damageScale=(1+Math.max(0,game.wave-1)*.07)*plan.damage,speedScale=(game.level===2?1.16:1)*plan.speed;
    const maxHp=base.hp*(inPortal()?1+.08*(portalRun.section-1):hpScale);
    const enemy={spawnId:String(++game.spawnSerial),x,y,prevX:x,prevY:y,velX:0,velY:0,visualVariant:game.waveSpawned,gateIndex,waypoint:1,type,hit:0,hitKick:0,attackAnim:0,slow:0,slowFactor:1,enraged:false,shieldBroken:false,phase:(type==='boss'||type==='uprooted')?1:0,
      flying:!!base.flying,r:base.r,hp:maxHp,maxHp,speed:base.speed*(inPortal()?1:speedScale),damage:base.damage*(inPortal()?1+.05*(portalRun.section-1):damageScale),
      attackCd:0,attackRange:base.attackRange||0,attackCooldown:(base.attackCooldown||.85)*plan.cooldown,armor:clamp((base.armor||0)+plan.armor,0,.7),focusMonument:!!base.focusMonument,miniBoss:!!wavePlan(game.wave).miniBoss};
    if(game.waveSpawned===0)showWaveBanner(type==='boss'?`BOSSWELLE ${game.wave} · ${wavePlan(game.wave).name}`:`WELLE ${game.wave} · ${wavePlan(game.wave).name}`);
    game.enemies.push(enemy);game.waveSpawned++;
    if(type==='boss'||type==='uprooted'){showToast(type==='uprooted'?'BOSSWELLE · DER ENTWURZELTE':'BOSSWELLE · DER BELAGERER');tone(62,.7,.07)}
  }
  // V4 alpha.4 combat: unified projectile speeds and iterative target prediction.
  // Towers no longer aim at where an enemy was; they solve for the intercept point.
  function projectileSpeed(kind){const map={bow:520,cannon:430,mortar:350,ballista:660,mage:520,rift:520,shrine:520,boomerang:440};return map[kind]||520;}
  function interceptPoint(from,target,speed){
    const vx=target?.velX||0,vy=target?.velY||0;
    if(!vx&&!vy)return{x:target.x,y:target.y};
    let aim={x:target.x,y:target.y};
    for(let i=0;i<3;i++){const t=Math.min(1.05,Math.hypot(aim.x-from.x,aim.y-from.y)/speed);aim={x:target.x+vx*t,y:target.y+vy*t};}
    return aim;
  }
  function shoot(from,target,damage,speed=520,color='#e9c477',effect={}){
    const heroShot=from===game.hero,gear=game.hero.gear;
    if(heroShot&&gear?.powers.chain)effect={...effect,chain:Math.max(1,effect.chain||0)};
    if(!heroShot&&towerSpecs[from.kind])damage*=(1+(gear?.tower||0))*(inPortal()?perkStats().towerDamage:1);
    const aim=interceptPoint(from,target,speed);const d=dist(from,aim)||1;const bullet={heroShot,kind:from.kind||'magic',level:from.level||1,x:from.x,y:from.y,vx:(aim.x-from.x)/d*speed,vy:(aim.y-from.y)/d*speed,r:effect.splash?7:4,damage,life:1.1,color,...effect};game.bullets.push(bullet);fx.burst(game,bullet,false,audioOn,reducedMotion);
  }
  // One low-damage hit per enemy on the way out, and one on the way back.
  // Both legs have independent hit sets: no damage falloff or critical hits.
  function shootBoomerang(t,target){
    const spec=towerSpecs.boomerang,speed=projectileSpeed('boomerang');
    const aim=interceptPoint(t,target,speed),length=dist(t,aim)||1;
    const nx=(aim.x-t.x)/length,ny=(aim.y-t.y)/length;
    const bullet={boomerang:true,heroShot:false,kind:'boomerang',level:t.level||1,
      x:t.x,y:t.y,originX:t.x,originY:t.y,vx:nx*speed,vy:ny*speed,speed,
      maxDistance:t.range,distanceTravelled:0,phase:'out',collisionPhase:'out',
      hitOut:new Set(),hitBack:new Set(),damage:t.damage*(1+(game.hero.gear?.tower||0))*(inPortal()?perkStats().towerDamage:1),
      r:10,life:3,color:spec.color};
    game.bullets.push(bullet);fx.burst(game,bullet,false,audioOn,reducedMotion);
  }
  function moveBoomerang(b,dt){
    b.prevX=b.x;b.prevY=b.y;b.collisionPhase=b.phase;
    if(b.phase==='out'){
      const step=Math.min(b.speed*dt,b.maxDistance-b.distanceTravelled);
      b.x+=b.vx/b.speed*step;b.y+=b.vy/b.speed*step;b.distanceTravelled+=step;
      if(b.distanceTravelled>=b.maxDistance-0.001)b.phase='back';
    }else{
      const dx=b.originX-b.x,dy=b.originY-b.y,d=Math.hypot(dx,dy);
      const step=Math.min(b.speed*dt,d);
      if(d){b.vx=dx/d*b.speed;b.vy=dy/d*b.speed;b.x+=dx/d*step;b.y+=dy/d*step;}
      if(step>=d-0.001)b.life=0;
    }
    b.life-=dt;
  }
  function remainingRoute(e){const path=campaign.levels[game.level].paths[e.gateIndex]||campaign.levels[game.level].paths[0];if(e.flying||game.level===1)return dist(e,game.monument);let remaining=dist(e,path[Math.min(e.waypoint,path.length-1)]);for(let i=e.waypoint;i<path.length-1;i++)remaining+=dist(path[i],path[i+1]);return remaining;}
  function towerTarget(t){
    const mode=t.targetMode||'first';
    let best=null,boss=null,score=mode==='strongest'?-Infinity:Infinity;
    const range=t.range*(inPortal()?perkStats().towerRange:1),range2=range*range;
    for(const e of game.enemies){
      if(e.dead||(e.flying&&!globalThis.FlightEnemies?.canHit(t,e)))continue;
      const dx=t.x-e.x,dy=t.y-e.y,d2=dx*dx+dy*dy;
      if(d2>range2)continue;
      if(mode==='boss'&&isBoss(e)&&!boss)boss=e;
      const value=mode==='strongest'?e.hp:mode==='nearest'?d2:remainingRoute(e);
      if(!best||(mode==='strongest'?value>score:value<score)){best=e;score=value;}
    }
    return boss||best;
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
  function launchWave(){if(inPortal()){if(state!=='playing'||portalRun.phase!=='build')return;if(!portalTransition({type:'START'},portalSnapshot()))return;}if(state==='playing'&&!tutorialActive&&game.intermission>0){game.intermission=0;game.spawnTimer=.4;updateUI();}}
  function collectWaveLoot(){game.essence+=game.loot.length*4;game.loot=[];}
  function nearest(from,range){let best=null,bd=range;for(const e of game.enemies){if(e.dead)continue;const d=dist(from,e);if(d<bd){bd=d;best=e}}return best}
  function spark(x,y,color,n=7){if(lowFX())n=Math.min(n,4);for(let i=0;i<n&&game.particles.length<fx.MAX_PARTICLES;i++)game.particles.push({x,y,vx:rand(-90,90),vy:rand(-90,90),life:rand(.2,.6),max:.6,r:rand(1,3),color})}
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
        e.hitKick=1.4;shake=Math.max(shake,10);spark(e.x,e.y,'#ef7158',28);showWaveBanner(`BELAGERER · PHASE ${bossPhaseLabel(e.phase)}`);showToast('DER BELAGERER WIRD GEFÄHRLICHER');
      }
    }
  }
  function spawnDeathFx(e){if(!game||e.deathFxEmitted)return;e.deathFxEmitted=true;game.deathFx.push({x:e.x,y:e.y,type:e.type,visualVariant:e.visualVariant||0,flying:!!e.flying,r:e.r||12,velX:e.velX||0,velY:e.velY||0,targetX:e.targetX,targetY:e.targetY,deathDirection:globalThis.TD2DirectionalActions?.enemyDirection(e,{x:e.targetX,y:e.targetY},e.attackAnim>0?'attack':'hit')||e.direction,direction:e.direction,life:.65,maxLife:.65});}
  function retireEnemy(e){if(e.dead)return;spawnDeathFx(e);e.dead=true;game.waveKilled++;if(!inPortal())game.essence+=enemySpecs[e.type]?.bounty||2;spark(e.x,e.y,'#d76b50',18);}
  function portalHit(e,damage,impact){
    if(!inPortal()||impact.effectOrigin==='perk')return damage;
    const ps=perkStats();
    if(impact.heroShot){
      if(ps.mark)e.portalMarkUntil=game.elapsed+2;
      if(game.hero.portalCounter){damage*=1+ps.counter;game.hero.portalCounter=false;}
    }else if(impact.towerShot){
      if(e.portalMarkUntil>game.elapsed){damage*=1+ps.mark;e.portalMarkUntil=0;}
      if(ps.slow){e.slow=Math.max(e.slow||0,1);e.slowFactor=Math.min(e.slowFactor||1,1-ps.slow);}
      if(ps.counter&&game.elapsed>=(game.hero.portalCounterAt||0)){game.hero.portalCounter=true;game.hero.portalCounterAt=game.elapsed+2;}
    }
    return damage;
  }
  function hurtEnemy(e,dmg,impact={}){if(e.dead)return 0;dmg=portalHit(e,dmg,impact);const before=e.hp;const crit=!impact.fixedDamage&&Math.random()<(.09+(impact.heroShot?(game.hero.gear?.crit||0):0));dmg*=crit?2:1;if(impact.heroShot&&game.hero.gear?.powers.wardlight&&e.shield>0)dmg*=1.25;if(!impact.bypassShield&&kirchende&&e.shield>0)dmg=kirchende.applyShieldDamage(e,dmg).hpDamage;dmg*=impact.fixedDamage?1:1-Math.max(0,(e.armor||0)-(impact.heroShot&&game.hero.gear?.powers.splinter?.1:0));e.hp-=dmg;if(e.hp<=0)e.dead=true;if(e.type==='uprooted')kirchende?.registerBossHit(e,dmg);fx.damage?.(game,e.x,e.y-e.r-10,dmg,{crit,reduced:lowFX()});e.hit=.1;e.hitKick=Math.max(e.hitKick||0,crit?1:.55);spark(e.x,e.y,crit?'#fff1a6':'#e6c57b',crit?12:5);const bossHit=isBoss(e);const impactShake=bossHit?3:(impact.shake||0);if(impactShake>0)shake=Math.max(shake,impactShake);if(!reducedMotion&&(bossHit||impact.hitStop>0))hitStop=Math.max(hitStop,bossHit ? .045 : (impact.hitStop||0));if(e.hp>0)updateEnemyPressure(e);if(impact.heroShot&&game.hero.gear?.powers.grove){game.hero.groveHits=(game.hero.groveHits||0)+1;if(game.hero.groveHits%5===0)for(const other of game.enemies){if(other!==e&&!other.dead&&dist(e,other)<=60)hurtEnemy(other,saga.stats(game.hero).damage*.2);}}if(e.hp<=0){game.kills++;game.waveKilled++;if(!inPortal())game.essence+=enemySpecs[e.type]?.bounty||2;spawnDeathFx(e);e.dead=true;saga.onKill(e);const drops=inPortal()?0:isBoss(e)?9:1;for(let i=0;i<drops;i++)game.loot.push({x:e.x+rand(-18,18),y:e.y+rand(-18,18),r:isBoss(e)?7:5,life:12,vx:rand(-20,20),vy:rand(-20,20),...lootFor(e,i)});spark(e.x,e.y,isBoss(e)?'#f5a14f':'#72d0c2',isBoss(e)?34:11);if(isBoss(e)){const request={mapId:game.level,wave:game.wave,bossType:e.type,runId:inPortal()?portalRun.runId:game.runId,spawnId:inPortal()?'section-'+portalRun.section+'-boss':e.spawnId};const reward=lootModel.claimBoss(request);if(inPortal())portalRewardPending=reward.persisted?null:request;game.inventory=lootModel.view(selectedCharacter).bag;if(reward.item)showToast(reward.state==='granted'?reward.item.name+' · '+globalThis.DenkmalLoot.rarities[reward.item.rarity].label+' · '+(reward.persisted?'BOSSBEUTE GESICHERT':'NUR IN DIESER SITZUNG'):'BOSSFUND AUSSTEHEND · EXPORT ODER INVENTAR PRÜFEN');tone(520,.45,.08)}else if(!inPortal()){
      const reward=lootModel.claimEnemy({mapId:game.level,wave:game.wave,enemyType:e.type,runId:game.runId,spawnId:e.spawnId});
      if(reward.item){game.inventory=lootModel.view(selectedCharacter).bag;showToast(reward.state==='granted'?reward.item.name+' · '+globalThis.DenkmalLoot.rarities[reward.item.rarity].label+' · '+(reward.persisted?'BEUTE GESICHERT':'NUR IN DIESER SITZUNG'):'FUND AUSSTEHEND · EXPORT ODER INVENTAR PRÜFEN');tone(760,.12,.04);}
    }}return Math.max(0,Math.min(before,dmg));}
  function towerPosition(){const h=game.hero,p={x:h.x+facing.x*58,y:h.y+facing.y*58};return campaign.nearestSlot(p,game.level)||p;}
  function placementPreview(){
    if(!game||state!=='playing')return null;
    const h=game.hero,probe={x:h.x+facing.x*58,y:h.y+facing.y*58},p=campaign.nearestSlot(probe,game.level);
    if(!p||game.towers.some(t=>dist(t,p)<20))return null;
    const spec=towerSpecs[game.selectedTower],role=towerRoles[game.selectedTower]||{label:'TURM',icon:'▲'};
    return {x:p.x,y:p.y,kind:game.selectedTower,cost:spec.cost,range:spec.range,color:spec.color,role:role.label,icon:role.icon,affordable:game.essence>=spec.cost&&game.towers.length<game.maxTowers,valid:placementError(p)===''};
  }
  function buildContextActive(){if(state!=='playing')return false;return placementError(towerPosition())==='';}
  function placementError(p){const level=campaign.levels[game.level];if(level.slots.length&&!level.slots.some(s=>dist(s,p)<1))return 'NUR AUF MARKIERTEN BAUPLÄTZEN';if(level.gates.some(g=>dist(g,p)<75))return 'TOR FREIHALTEN';if(p.x<28||p.x>WORLD_W-28||p.y<28||p.y>WORLD_H-28)return 'ZU NAH AM WELTRAND';if(level.paths.some(path=>campaign.pathDistance(p,path)<64))return 'NEBEN DEM WEG BAUEN';if(dist(p,game.monument)<110)return 'ZU NAH AM MONUMENT';if(game.towers.some(t=>dist(p,t)<62))return 'BAUPLATZ BELEGT';return '';}
  function buildTower(){
    if(inPortal()&&!['build','combat'].includes(portalRun.phase))return;
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
  function upgradeTower(){if(inPortal()&&!['build','combat'].includes(portalRun.phase))return;if(state!=='playing')return;const t=nearbyTower();if(!t)return showToast('GEHE NÄHER AN EINEN TURM');if(t.level>=3)return showToast('MAXIMALE AUSBAUSTUFE');const cost=20+t.level*15;if(game.essence<cost)return showToast('NICHT GENUG ESSENZ');game.essence-=cost;t.spent+=cost;t.level++;if(t.kind==='boomerang'){const spec=towerSpecs.boomerang;t.damage=[8,11,14][t.level-1];t.range=[265,285,305][t.level-1];t.fireRate=[1.75,1.65,1.55][t.level-1];}else{t.damage*=1.32;t.fireRate*=.92;t.range+=18;}spark(t.x,t.y,t.kind==='mage'?'#69bfff':'#edc575',26);showToast(`TURM AUF STUFE ${t.level}`);tone(360,.18)}
  function sellTower(){if(inPortal()&&!['build','combat'].includes(portalRun.phase))return;if(state!=='playing')return;const t=nearbyTower();if(!t)return showToast('GEHE NÄHER AN EINEN TURM');const refund=(inPortal()?t.spent*(portalRun.phase==='build'?1:.75):Math.floor(t.spent*.6));game.essence+=refund;game.towers=game.towers.filter(x=>x!==t);spark(t.x,t.y,'#7dd8c8',18);showToast(`TURM VERKAUFT · +${refund}`);tone(220,.12)}
  function selectTower(kind){if(!towerSpecs[kind]||!(enabledTowers.has(kind)||game.level>=3&&kind==='boomerang'))return;game.selectedTower=kind;document.querySelectorAll('.arsenal button').forEach(b=>{b.classList.toggle('selected',b.dataset.tower===kind);b.setAttribute('aria-pressed',String(b.dataset.tower===kind));});$('buildText').textContent=`${towerSpecs[kind].name} BAUEN · ${towerSpecs[kind].cost}`;updateUI()}
  function endWave(){if(state!=='playing')return;if(game.mode==='campaign-pilot'&&game.wave===8){collectWaveLoot();state='gameover';$('gameoverTitle').textContent='KAMPAGNENPILOT GESCHAFFT';ui.gameoverStats.textContent='8 Wellen · Keine Kampagnenfreischaltungen verändert';ui.gameover.classList.remove('hidden');return;}if(inPortal()){endPortalWave();return;}if(!['endless','campaign-pilot'].includes(game.mode)&&(game.level===1&&game.wave===5||game.level===2&&game.wave===8||game.level===3&&game.wave===12||game.level===4&&game.wave===16||game.level===5&&game.wave===20||game.level===6&&game.wave===24)){completeLevel();return;}saga.stopVoice();state='perk';collectWaveLoot();rewardWave();game.enemies.length=0;game.bullets.length=0;ui.objectiveText.textContent='WELLE ABGESCHLOSSEN';const perks=getPerks();ui.perkGrid.innerHTML='';perks.forEach((p,i)=>{const b=document.createElement('button');b.className='perk';b.innerHTML=`<span class="num">${i+1}</span><div class="perk-icon">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p>`;b.onclick=()=>selectPerk(p);ui.perkGrid.appendChild(b)});ui.perk.classList.remove('hidden');focusModal(ui.perk);tone(440,.18)}
  function getPerks(){const pool=[
    {name:'Eiserner Eid',icon:'✦',desc:'+25 maximale und aktuelle Hüter-LP.',apply:g=>{g.hero.maxHp+=25;g.hero.hp+=25}},
    {name:'Runenmeister',icon:'◆',desc:'+30 % Feuerrate des Hüters.',apply:g=>g.hero.fireRate=Math.max(.09,g.hero.fireRate/1.3)},
    {name:'Kraft des Stabes',icon:'✧',desc:'+6 Schaden pro Geschoss.',apply:g=>g.hero.damage+=6},
    {name:'Steinmetzsegen',icon:'⬟',desc:'Heilt das Monument um 140 LP.',apply:g=>g.monument.hp=Math.min(g.monument.maxHp,g.monument.hp+140)},
    {name:'Festungsplan',icon:'▲',desc:'+1 maximales Turmlimit und 20 Essenz.',apply:g=>{g.maxTowers++;g.essence+=20}},
    {name:'Marschtritt',icon:'➹',desc:'+15 % Bewegungstempo.',apply:g=>g.hero.speed*=1.15}
  ];for(let i=pool.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[pool[i],pool[k]]=[pool[k],pool[i]]}return pool.slice(0,3)}
  function selectPerk(p){if(state!=='perk')return;if(inPortal()){choosePortalPerk(typeof p==='string'?p:p.id);return;}p.apply(game);game.wave++;game.waveSpawned=0;game.waveKilled=0;game.waveTotal=waveSize(game.wave);game.spawnTimer=1.2;game.intermission=6;game.hero.hp=Math.min(game.hero.maxHp,game.hero.hp+12);if(game.wave===4||game.wave===8){game.essence+=35;showToast(`${chapter().name} · +35 ESSENZ`)}else showToast(`WELLE ${game.wave}`);state='playing';ui.perk.classList.add('hidden');focusGame();saga.chapter(game.wave);updateUI()}
  function gameOver(){if(state==='gameover')return;if(inPortal())portalTransition({type:'FAIL'});collectWaveLoot();saga.stopVoice();state='gameover';$('gameoverTitle').textContent=game.monument.hp<=0?'DAS MONUMENT IST GEFALLEN':'DER HÜTER IST GEFALLEN';ui.gameoverStats.textContent=`${game.wave-1} Wellen überstanden · ${game.kills} Feinde besiegt · ${Math.floor(game.elapsed/60)}:${String(Math.floor(game.elapsed%60)).padStart(2,'0')} Minuten`;ui.gameover.classList.remove('hidden');focusModal(ui.gameover);tone(75,.5);}


  // The church blocks the player, even during a dodge. Movement resolves each
  // axis separately so touch controls slide naturally along the masonry.
  function churchBlocks(x,y,r=13){
    if(game?.level!==4)return false;
    const q=campaign.levels[4].churchFootprint,c=campaign.center;
    return x+r>c.x+q.left&&x-r<c.x+q.right&&
      y+r>c.y+q.top&&y-r<c.y+q.bottom;
  }
  function update(dt){
    if(state!=='playing'||tutorialPending||tutorialActive)return;if(inPortal()&&portalTick(dt))return;if(hitStop>0){hitStop=Math.max(0,hitStop-dt);return;}if(lowFX()&&game.particles.length>90)game.particles.splice(0,game.particles.length-90);time+=dt;game.elapsed+=dt;const h=game.hero,m=game.monument,heroStats=saga.stats(h);
    h.fireCd-=dt;h.dodgeCd-=dt;h.invuln-=dt;if(h.dodge>0)h.dodge-=dt;
    let dx=((keys.KeyD||keys.ArrowRight)?1:0)-((keys.KeyA||keys.ArrowLeft)?1:0)+touch.x,dy=((keys.KeyS||keys.ArrowDown)?1:0)-((keys.KeyW||keys.ArrowUp)?1:0)+touch.y;const len=Math.hypot(dx,dy);if(len>0){dx/=Math.max(1,len);dy/=Math.max(1,len);facing={x:dx/(Math.hypot(dx,dy)||1),y:dy/(Math.hypot(dx,dy)||1)};}let sp=heroStats.speed*(inPortal()?1+.05*(portalRun.perkRanks.step||0):1);if(h.dodge>0){dx=h.dodgeX;dy=h.dodgeY;sp*=3.2;}const motion=Math.hypot(dx,dy);moveIntent=motion>0?{x:dx,y:dy}:{x:0,y:0};{const nx=clamp(h.x+dx*sp*dt,26,WORLD_W-26),ny=clamp(h.y+dy*sp*dt,26,WORLD_H-26);
      if(!churchBlocks(nx,h.y,h.r))h.x=nx;
      if(!churchBlocks(h.x,ny,h.r))h.y=ny;
    }updateCamera(dt);saga.update(dt,len>0||h.dodge>0,facing);

    const target=nearest(h,h.range);if(target&&h.fireCd<=0){shoot(h,target,heroStats.damage*(inPortal()?1+.08*(portalRun.perkRanks.power||0):1),560,h.equipment.weapon==='echo'?'#9affdf':'#83cfff');saga.onAttack(target);h.fireCd=heroStats.rate}
    if(game.intermission>0&&!inPortal())game.intermission=Math.max(0,game.intermission-dt);
