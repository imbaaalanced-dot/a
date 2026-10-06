/* Marcel: character, equipment, dialogue and animation. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const equipment = {
    weapon: [
      {id:'ember', name:'Abendrot', label:'Runenstab', wave:1, desc:'Verdichtete Seelengeschosse. +25 % Angriffsschaden.', detail:'Der Denkmalstab bündelt das Licht der bewahrten Erinnerungen.', color:'#ffb36c'},
      {id:'echo', name:'Nachhall', label:'Echo-Stab', wave:4, desc:'30 % kürzere Angriffspausen. Zwei zusätzliche Seelenechos beim Ruf.', detail:'Jeder Schuss antwortet einer Stimme, die du zurückgeholt hast.', color:'#9af8ed'}
    ],
    armor: [
      {id:'oath', name:'Steinwacht', label:'Schutzrune', wave:1, desc:'25 % weniger erlittener Schaden.', detail:'Eine Rune schützt Marcel, ohne seine Bewegungsfreiheit einzuschränken.', color:'#e3c489'},
      {id:'ash', name:'Aschenläufer', label:'Bewegungsrune', wave:3, desc:'+20 % Lauftempo. Ausweichen lädt 30 % schneller nach.', detail:'Die Bewegungsrune macht Marcel schneller und beweglicher.', color:'#d87663'}
    ],
    relic: [
      {id:'lantern', name:'Erinnerungslicht', label:'Seelenlicht', wave:1, desc:'Der Seelenruf heilt dich um 25 LP.', detail:'Eine Flamme, die selbst unter der Asche noch deinen Namen kennt.', color:'#8cf0dc'},
      {id:'bell', name:'Die letzte Glocke', label:'Namenreliquie', wave:8, desc:'+40 % Seelenruf-Schaden. Jeder besiegte Feind lädt 1 Punkt zusätzlich.', detail:'Sie läutet erst, wenn der letzte vergessene Name gesprochen wurde.', color:'#f4c671'}
    ]
  };
  const lines = {
    intro:'Ich bin Marcel, der Denkmalschützer. Vier Tore. Ein Denkmal. Wir halten die Wacht.',
    chapter2:'Die Tore werden stärker. Unser Stab auch. Kein Stein wird aufgegeben.',
    chapter3:'Sie drängen durch das Labyrinth. Wir halten sie am Weg auf.',
    ultimate:'Kein Name geht verloren!',lowhp:'Noch ein Atemzug. Die Wacht geht weiter.',
    ending:'Das Denkmal steht. Und die Erinnerung bleibt.'
  };
  const story = [
    {wave:1,id:'intro',kicker:'MARCEL · DER DENKMALSCHÜTZER',title:'Vier Tore. Eine Wacht.',text:'Verteidige das Denkmal mit deinem Runenstab und Türmen neben den Wegen. Der Stab zielt automatisch. Nutze die Baupause vor jeder Welle.',objective:'Nach Welle 5 wird das Labyrinth freigeschaltet. Auf dem Handy: Joystick zum Laufen und die Aktionsknöpfe zum Bauen.',reward:'Beute wirkt sofort · Ausrüstung mit H · Beute mit I'},
    {wave:4,id:'chapter2',kicker:'WELLE 4 · DIE TORE ERWACHEN',title:'Das nächste Siegel.',text:'Marcel hat den Echo-Stab freigeschaltet. Bogen trifft schnell und weit. Die Kanone trifft Gegnergruppen. Werte deine Türme auf, bevor der Belagerer kommt.',objective:'Überstehe Welle 5 und beschütze das Denkmal.',reward:'NEUE AUSRÜSTUNG · NACHHALL'},
    {wave:8,id:'chapter3',kicker:'WELLE 8 · DAS LABYRINTH',title:'Haltet den Weg.',text:'Im Labyrinth bleiben Gegner auf ihrem Weg. Türme konzentrieren sich auf den Gegner, der dem Denkmal am nächsten kommt.',objective:'Nutze die markierten Bauplätze und verbinde Bogen mit Kanone.',reward:'NEUE AUSRÜSTUNG · DIE LETZTE GLOCKE'},
    {wave:16,id:'ending',kicker:'DIE WACHT BESTEHT',title:'Die Erinnerung bleibt.',text:'Marcel hat den Aschenkönig zurückgeschlagen. Das Denkmal steht. Die Wacht geht als endlose Herausforderung weiter.',objective:'Verstärke deine Verteidigung für die kommenden Wellen.',reward:'DIE NAMEN SIND FREI'}
  ];
  const heroAtlas = new Image();
  heroAtlas.src = 'assets/hero/marcel-lantern-sprite-v1.webp';
  const heroCells = {
    up:[0,0],
    down:[128,0],
    left:[0,128],
    right:[128,128]
  };
  let api, currentAudio=null, voiceEnabled=true, captionTimer=0, voiceGeneration=0, currentStory=null, returnState='playing';
  let selectedTab='equipment', lowHpSpoken=false, storySeen=new Set(), animationTime=0;
  let pulse=null, echoes=[], trail=[], attackTime=0, walkTime=0;
  const getHero = () => api.getGame().hero;
  const ready = img => img && img.complete && img.naturalWidth > 0;
  const item = (h, slot) => equipment[slot].find(i=>i.id===h.equipment[slot]);

  function reset(h) {
    stopVoice();
    h.equipment={weapon:'ember',armor:'oath',relic:'lantern'};
    h.soul=100;h.moving=false;h.faceX=0;h.faceY=1;h.direction='down';h.hitFlash=0;
    lowHpSpoken=false;storySeen=new Set();pulse=null;echoes=[];trail=[];attackTime=0;walkTime=0;animationTime=0;
    $('storyScreen').classList.add('hidden');$('characterScreen').classList.add('hidden');
    $('subtitle').classList.add('hidden');$('sagaComplete').classList.add('hidden');
  }
  function stats(h) {
    return {damage:h.damage*(h.equipment.weapon==='ember'?1.25:1), rate:h.fireRate*(h.equipment.weapon==='echo'?.7:1), speed:h.speed*(h.equipment.armor==='ash'?1.2:1), armor:h.equipment.armor==='oath'?.75:1, dodge:h.equipment.armor==='ash'?.7:1};
  }
  function stopVoice() {
    voiceGeneration++;
    if(currentAudio){currentAudio.pause();currentAudio=null;}
    if(globalThis.speechSynthesis)globalThis.speechSynthesis.cancel();
    clearTimeout(captionTimer);
    $('subtitle').classList.add('hidden');
  }
  function voiceLabel() {
    $('voiceBtn').textContent=`STIMME: ${voiceEnabled?'AN':'AUS'}`;
    $('voiceBtn').setAttribute('aria-pressed',String(voiceEnabled));
  }
  function say(id, inStory=false) {
    if(!lines[id])return;
    stopVoice();
    if(!inStory){$('subtitleText').textContent=lines[id];$('subtitle').classList.remove('hidden');captionTimer=setTimeout(()=>$('subtitle').classList.add('hidden'),Math.max(4500,lines[id].length*62));}
    if(!voiceEnabled||!api.soundOn())return;
    if(!globalThis.speechSynthesis||!globalThis.SpeechSynthesisUtterance)return;
    const utterance=new SpeechSynthesisUtterance(lines[id]);utterance.lang='de-DE';utterance.rate=.92;utterance.pitch=.85;
    utterance.voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('de'))||null;
    speechSynthesis.speak(utterance);
  }

  function chapter(wave) {
    const entry=story.find(s=>s.wave===wave);
    if(!entry||storySeen.has(entry.id))return false;
    stopVoice();storySeen.add(entry.id);currentStory=entry;
    api.setState('story');api.clearInput();
    $('storyKicker').textContent=entry.kicker;$('storyTitle').textContent=entry.title;
    $('storyBody').textContent=entry.text;$('storyQuote').textContent=`„${lines[entry.id]}“`;
    $('storyObjective').textContent=entry.objective;$('storyReward').textContent=entry.reward;
    $('storyContinue').textContent=entry.id==='ending'?'ENDLOSE WACHT BEGINNEN':'WEITER ZUR WACHT';
    $('storyScreen').classList.remove('hidden');api.focusModal($('storyScreen'));say(entry.id,true);return true;
  }
  function continueStory() {
    if(api.getState()!=='story')return;
    stopVoice();$('storyScreen').classList.add('hidden');api.setState('playing');api.focusGame();
    if(currentStory?.id==='ending')$('sagaComplete').classList.remove('hidden');
    currentStory=null;api.updateUI();
  }
  function renderCharacter() {
    const h=getHero(), g=api.getGame(), s=stats(h);
    $('characterStats').textContent=`${Math.round(s.damage)} Schaden · ${(1/s.rate).toFixed(1)} Angriffe/s · ${Math.round(s.speed)} Tempo`;
    $('characterLevel').textContent=`WELLE ${g.wave} · ${storySeen.has('ending')?'HÜTER DER ERINNERUNG':'DER DENKMALSCHÜTZER'}`;
    $('equippedNames').textContent=Object.keys(equipment).map(slot=>item(h,slot).name).join(' · ');
    const display=$('characterPreview');display.dataset.armor=h.equipment.armor;display.dataset.weapon=h.equipment.weapon;
    display.dataset.relic=h.equipment.relic;
    $('equipmentPanel').classList.toggle('hidden',selectedTab!=='equipment');$('journalPanel').classList.toggle('hidden',selectedTab!=='journal');
    $('equipmentTab').setAttribute('aria-selected',String(selectedTab==='equipment'));$('journalTab').setAttribute('aria-selected',String(selectedTab==='journal'));
    const grid=$('gearGrid');grid.innerHTML='';
    for(const [slot, options] of Object.entries(equipment)){
      const section=document.createElement('section');section.className='gear-slot';
      const heading=document.createElement('h3');heading.textContent={weapon:'01 / WAFFE',armor:'02 / RÜSTUNG',relic:'03 / RELIKT'}[slot];section.appendChild(heading);
      for(const option of options){
        const unlocked=g.wave>=option.wave, equipped=h.equipment[slot]===option.id;
        const button=document.createElement('button');button.type='button';button.className=`gear-card${equipped?' equipped':''}`;button.disabled=!unlocked;
        button.setAttribute('aria-pressed',String(equipped));
        button.innerHTML=`<small>${option.label}</small><strong>${option.name}</strong><span>${option.desc}</span><em>${equipped?'ANGELEGT':unlocked?'ANLEGEN':`AB WELLE ${option.wave}`}</em>`;
        button.title=option.detail;
        button.onclick=()=>{equip(slot,option.id);};section.appendChild(button);
      }grid.appendChild(section);
    }
    const journal=$('journalEntries');journal.innerHTML='';
    for(const entry of story){const block=document.createElement('article');const known=storySeen.has(entry.id);block.className='journal-entry';block.innerHTML=`<small>${known?entry.kicker:`ERINNERUNG · AB WELLE ${entry.wave}`}</small><h3>${known?entry.title:'Noch unter Asche verborgen'}</h3><p>${known?entry.text:'Setze Marcels Wacht fort, um diese Erinnerung zu finden.'}</p>`;journal.appendChild(block);}
  }
  function equip(slot,id) {
    if(api.getState()!=='character')return false;
    const option=equipment[slot]?.find(i=>i.id===id);if(!option||api.getGame().wave<option.wave)return false;
    getHero().equipment[slot]=id;renderCharacter();api.tone(420,.06);api.updateUI();return true;
  }
  function openCharacter() {
    if(!['playing','paused'].includes(api.getState()))return;
    returnState=api.getState();api.setState('character');api.clearInput();stopVoice();renderCharacter();
    $('characterScreen').classList.remove('hidden');api.focusModal($('characterScreen'));api.updateUI();
  }
  function closeCharacter() {
    if(api.getState()!=='character')return;
    $('characterScreen').classList.add('hidden');api.setState(returnState);
    if(returnState==='paused')api.focusModal($('pauseScreen'));else api.focusGame();api.updateUI();
  }
  function onKill(enemy) { const h=getHero();h.soul=clamp(h.soul+(enemy.type==='boss'?25:8)+(h.equipment.relic==='bell'?1:0),0,100); }
  function onAttack() { attackTime=.24; }
  function damage(amount) {
    const h=getHero();h.hp-=amount*stats(h).armor;h.hitFlash=.16;
    if(h.hp>0&&h.hp/h.maxHp<.3&&!lowHpSpoken){lowHpSpoken=true;say('lowhp');}
  }
  function unleash() {
    const h=getHero();if(api.getState()!=='playing'||h.soul<100)return false;
    h.soul=0;h.invuln=Math.max(h.invuln,1.1);const power=h.equipment.relic==='bell'?1.4:1;
    if(h.equipment.relic==='lantern')h.hp=Math.min(h.maxHp,h.hp+25);
    pulse={x:h.x,y:h.y,life:.8,max:.8};
    for(const enemy of api.getGame().enemies){if(!enemy.dead&&distance(h,enemy)<270)api.hurtEnemy(enemy,(70+h.damage*2)*power);}
    const count=h.equipment.weapon==='echo'?5:3;
    echoes=Array.from({length:count},(_,i)=>({angle:i*Math.PI*2/count,life:5,fire:.3+i*.14}));
    say('ultimate');api.spark(h.x,h.y,'#96ffdf',32);api.tone(180,.4,.05);api.updateUI();return true;
  }
  function directionFromFace(face,fallback='down') {
    const x=face?.x||0,y=face?.y||0;
    if(Math.abs(x)<.12&&Math.abs(y)<.12)return fallback;
    if(Math.abs(y)>=Math.abs(x))return y<0?'up':'down';
    return x<0?'left':'right';
  }
  function update(dt,moving,face) {
    const h=getHero();animationTime+=dt;h.moving=moving;
    if(Math.abs(face.x)>.12||Math.abs(face.y)>.12){
      const len=Math.hypot(face.x,face.y)||1;
      h.faceX=face.x/len;h.faceY=face.y/len;h.direction=directionFromFace(face,h.direction||'down');
    }
    if(moving)walkTime+=dt;else walkTime=0;
    attackTime=Math.max(0,attackTime-dt);h.hitFlash=Math.max(0,h.hitFlash-dt);
    if(h.hp/h.maxHp>.6)lowHpSpoken=false;
    if(h.dodge>0&&!reduced){trail.push({x:h.x,y:h.y,life:.2,direction:h.direction||'down'});if(trail.length>8)trail.shift();}
    for(const t of trail)t.life-=dt;trail=trail.filter(t=>t.life>0);
    if(pulse){pulse.life-=dt;if(pulse.life<=0)pulse=null;}
    for(const echo of echoes){
      echo.life-=dt;if(!reduced)echo.angle+=dt*1.7;echo.fire-=dt;
      const from={x:h.x+Math.cos(echo.angle)*70,y:h.y+Math.sin(echo.angle)*42};
      const enemy=api.nearest(from,300);
      if(enemy&&echo.fire<=0){api.shoot(from,enemy,14,520,'#94ffe1');echo.fire=.65;}
    }echoes=echoes.filter(e=>e.life>0);
  }
  function drawSprite(ctx,x,y,direction='down',opacity=1,size=86) {
    if(ready(heroAtlas)){
      const [sx,sy]=heroCells[direction]||heroCells.down;
      ctx.save();ctx.translate(x,y);ctx.globalAlpha=opacity;
      ctx.drawImage(heroAtlas,sx,sy,128,128,-size/2,12-size,size,size);
      ctx.restore();return true;
    }
    const fallbackFace=direction==='left'?-1:1;
    return !!globalThis.DenkmalArt?.draw(ctx,'hero',x,y,size,fallbackFace,opacity);
  }
  function draw(ctx,h) {
    const moving=h.moving&&!reduced,direction=h.direction||'down';
    for(const t of trail)drawSprite(ctx,t.x,t.y,t.direction,t.life/.2*.28);
    ctx.save();ctx.translate(h.x,h.y);
    ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(0,11,22,8,0,0,Math.PI*2);ctx.fill();
    const relicColor=h.equipment.relic==='bell'?'#f5c572':'#79dfff';
    ctx.strokeStyle=relicColor;ctx.globalAlpha=.4;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,12,27,11,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    if(h.equipment.armor==='oath'){ctx.strokeStyle='#dfc79155';ctx.beginPath();ctx.arc(0,-20,34,-.8,.8);ctx.stroke();}
    const bob=reduced?0:moving?Math.sin(walkTime*18)*1.6:Math.sin(animationTime*2.4)*.7;
    ctx.translate(0,bob);if(!reduced&&h.dodge>0)ctx.rotate((h.faceX||0)*.14);
    ctx.shadowColor=relicColor;ctx.shadowBlur=globalThis.DenkmalMobileRender?0:(h.dodge>0?20:6);
    if(h.hitFlash>0)ctx.filter='brightness(1.8)';
    if(!drawSprite(ctx,0,0,direction,1,90)){ctx.fillStyle='#e9dcc2';ctx.beginPath();ctx.arc(0,-18,12,0,Math.PI*2);ctx.fill();}
    ctx.filter='none';ctx.shadowBlur=0;
    if(attackTime>0){
      const fx=h.faceX||0,fy=h.faceY||0,ax=fx*30,ay=-24+fy*18;
      ctx.save();ctx.globalAlpha=attackTime/.24;ctx.fillStyle=item(h,'weapon').color;ctx.shadowBlur=globalThis.DenkmalMobileRender?0:18;ctx.shadowColor=item(h,'weapon').color;
      ctx.beginPath();ctx.arc(ax,ay,5+attackTime*9,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#fff1c4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(fx*10,-16+fy*6);ctx.lineTo(ax,ay);ctx.stroke();ctx.restore();
    }
    if(h.equipment.weapon==='echo'){ctx.fillStyle='#a4ffed';ctx.beginPath();ctx.arc((h.faceX||0)*25,-24+(h.faceY||0)*14,3,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    for(const echo of echoes)drawSprite(ctx,h.x+Math.cos(echo.angle)*70,h.y+Math.sin(echo.angle)*42,direction,Math.min(.42,echo.life*.42),78);
    if(pulse){ctx.save();ctx.globalAlpha=pulse.life/pulse.max;ctx.strokeStyle='#9affdf';ctx.lineWidth=4;ctx.beginPath();ctx.arc(pulse.x,pulse.y,reduced?270:270*(1-pulse.life/pulse.max),0,Math.PI*2);ctx.stroke();ctx.restore();}
  }
  function updateUI() {
    const h=getHero(),playing=api.getState()==='playing';
    $('soulFill').style.width=`${h.soul}%`;$('soulValue').textContent=`${Math.floor(h.soul)} / 100`;
    $('soulBtn').disabled=!playing||h.soul<100;$('soulBtn').classList.toggle('ready',playing&&h.soul>=100);
    $('soulText').textContent=h.soul>=100?'SEELENRUF':`SEELENRUF · ${Math.floor(h.soul)} %`;
    $('heroBtn').disabled=!['playing','paused','character'].includes(api.getState());
    $('heroGearLabel').textContent=`${item(h,'weapon').name} · ${item(h,'relic').name}`;
  }
  function init(callbacks) {
    api=callbacks;
    try{voiceEnabled=localStorage.getItem('denkmal-voice')==='on';}catch{}
    voiceLabel();
    $('heroBtn').onclick=()=>api.getState()==='character'?closeCharacter():openCharacter();
    $('characterClose').onclick=closeCharacter;$('storyContinue').onclick=continueStory;
    $('storyReplay').onclick=()=>{if(currentStory)say(currentStory.id,true);};
    $('soulBtn').onclick=()=>{unleash();$('game').focus();};
    $('equipmentTab').onclick=()=>{selectedTab='equipment';renderCharacter();};
    $('journalTab').onclick=()=>{selectedTab='journal';renderCharacter();};
    $('voiceBtn').onclick=()=>{voiceEnabled=!voiceEnabled;stopVoice();voiceLabel();try{localStorage.setItem('denkmal-voice',voiceEnabled?'on':'off');}catch{}if(voiceEnabled&&currentStory)say(currentStory.id,true);};
  }
  globalThis.HeroSaga={init,reset,stats,chapter,continueStory,openCharacter,closeCharacter,equip,update,draw,updateUI,onKill,onAttack,damage,unleash,stopVoice,lines};
})();
