/* Original procedural score and sound design. Shared by both modes, no downloads. */
(function(root){
'use strict';
const KEY='td2-audio-v42';
const defaults={effects:.55,music:.18,ambience:.15,muted:false};
function create({storage,contextFactory}={}){
 let settings={...defaults};try{const saved=JSON.parse(storage?.getItem(KEY)||'null');for(const key of ['effects','music','ambience'])if(Number.isFinite(saved?.[key]))settings[key]=Math.max(0,Math.min(1,saved[key]));if(typeof saved?.muted==='boolean')settings.muted=saved.muted;}catch{}
 let ac=null,master=null,buses=null,noise=null,ambient=null,paused=false,scene='menu',nextNote=0,noteIndex=0;
 const voices=new Set(),last=new Map();
 const persist=()=>{try{storage?.setItem(KEY,JSON.stringify(settings));}catch{}};
 function levels(){if(!master)return;master.gain.value=paused||settings.muted?0:.65;for(const key of ['effects','music','ambience'])buses[key].gain.value=settings[key];}
 function stopAll(){for(const source of [...voices]){try{source.stop();}catch{}try{source.disconnect();}catch{}}voices.clear();ambient=null;nextNote=0;}
 function unlock(){
  try{
   if(!ac){const C=root.AudioContext||root.webkitAudioContext;if(!contextFactory&&!C)return false;ac=contextFactory?contextFactory():new C();master=ac.createGain();master.connect(ac.destination);buses={};for(const key of ['effects','music','ambience']){buses[key]=ac.createGain();buses[key].connect(master);}noise=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const samples=noise.getChannelData(0);let seed=731;for(let i=0;i<samples.length;i++){seed=(seed*16807)%2147483647;samples[i]=(seed/2147483647*2-1)*.5;}levels();}
   if(ac.state==='suspended')ac.resume()?.catch(()=>{});return true;
  }catch{ac=null;master=null;buses=null;return false;}
 }
 function voice(freq,duration,level,type='sine',bus='effects',end=freq){
  if(!ac||voices.size>=12)return false;
  const source=type==='noise'?ac.createBufferSource():ac.createOscillator(),gain=ac.createGain();
  if(type==='noise')source.buffer=noise;else{source.type=type;source.frequency.setValueAtTime(freq,ac.currentTime);source.frequency.exponentialRampToValueAtTime(Math.max(20,end),ac.currentTime+duration);}
  const now=ac.currentTime;gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(level,now+Math.min(.02,duration/5));gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  source.connect(gain);gain.connect(buses[bus]);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();};source.start(now);source.stop(now+duration+.02);return true;
 }
 function play(kind){
  if(!ac||ac.state!=='running'||paused||settings.muted||settings.effects===0)return false;
  const priority=['boss','defeat','wave','purchase'].includes(kind),now=ac.currentTime;
  if(voices.size>=(priority?12:9)||now-(last.get(kind)??-100)<(priority?.35:.08))return false;
  last.set(kind,now);
  try{
   if(kind==='cannon'||kind==='explosion'){voice(85,.28,.2,'triangle','effects',27);voice(0,.12,.09,'noise');}
   else if(kind==='bow'||kind==='pierce'){voice(0,.07,.09,'noise');voice(850,.08,.045,'triangle','effects',180);}
   else if(kind==='rift'||kind==='tesla'){voice(1500,.1,.055,'sawtooth','effects',220);voice(0,.05,.03,'noise');}
   else if(kind==='mage'||kind==='frost'||kind==='fire'){voice(330,.23,.075,'sine','effects',900);voice(660,.18,.035,'triangle','effects',440);}
   else if(kind==='boss'){voice(110,.65,.14,'triangle','effects',82);voice(164.8,.6,.07,'sine','effects',110);}
   else if(kind==='defeat'){voice(164.8,.9,.1,'triangle','effects',55);voice(130.8,.75,.07,'sine','effects',65.4);}
   else if(kind==='purchase'||kind==='wave'){voice(523.3,.22,.08,'sine','effects',659.3);voice(783.9,.35,.04,'sine');}
   else{voice(0,.045,.045,'noise');voice(190,.07,.04,'triangle','effects',90);}
   return true;
  }catch{return false;}
 }
 function tick(){
  if(!ac||ac.state!=='running'||paused||settings.muted)return;
  try{
   if(settings.ambience>0&&!ambient){const source=ac.createBufferSource(),filter=ac.createBiquadFilter(),gain=ac.createGain();source.buffer=noise;source.loop=true;filter.type='lowpass';filter.frequency.value=260;gain.gain.value=.12;source.connect(filter);filter.connect(gain);gain.connect(buses.ambience);ambient=source;voices.add(source);source.onended=()=>{voices.delete(source);filter.disconnect();gain.disconnect();};source.start();}
   if(settings.music>0&&ac.currentTime>=nextNote){nextNote=ac.currentTime+(scene==='combat'?1.8:2.8);const notes=scene==='combat'?[146.83,174.61,220,164.81,146.83,130.81,164.81,110]:[146.83,220,261.63,174.61,146.83,130.81,164.81,110];const f=notes[noteIndex++%notes.length];voice(f,1.6,.065,'sine','music');if(noteIndex%4===1)voice(f/2,2.5,.05,'triangle','music');}
  }catch{}
 }
 function setVolumes(values){for(const key of ['effects','music','ambience'])if(Number.isFinite(values[key]))settings[key]=Math.max(0,Math.min(1,values[key]));levels();persist();}
 function mute(value){const changed=settings.muted!==!!value;settings.muted=!!value;if(settings.muted)stopAll();levels();if(changed)persist();}
 function pause(value){if(paused===!!value)return;paused=!!value;if(paused)stopAll();levels();}
 function setScene(value){const next=value==='combat'?'combat':'menu';if(scene!==next){scene=next;nextNote=0;noteIndex=0;}}
 return {unlock,play,tick,setVolumes,mute,pause,setScene,get settings(){return {...settings}},get activeVoices(){return voices.size}};
}
let storage;try{storage=root.localStorage;}catch{}
root.DenkmalAudio={create,KEY};root.TD2Audio=create({storage});
// Sliders work independently of the game loop and survive unavailable storage/audio.
root.DenkmalAudio.bindControls=function(doc){
 for(const name of ['effects','music','ambience']){const input=doc.getElementById('volume-'+name);if(!input)continue;input.value=String(Math.round(root.TD2Audio.settings[name]*100));input.addEventListener('input',()=>{root.TD2Audio.unlock();root.TD2Audio.setVolumes({[name]:Number(input.value)/100});});}
};
})(globalThis);
