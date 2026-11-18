// Denkmal TD2 Ansturm - Intro-Cutscene (v4.1.0)
// Spielt die Clips einmalig pro Geraet hintereinander nach Start und ist skippbar.
// WebView-freundlich: play() laeuft im Touch-Kontext, preload="none",
// src wird nach jedem Clip freigegeben (Decoder-RAM auf 4-GB-Geraeten).
// Fehlt ein Clip oder blockiert der Autoplay, geht es ohne Unterbrechung weiter.

export const CUTSCENE_CLIPS=[
  {src:'../1038180366_1795018262039150.mp4'}, // Hohensyburg
  {src:'../877558426_1795017624234177.mp4'} // Loewe
];
export const CUTSCENE_KEY='td2.denkmalAnsturm.cutscene.intro.v1';

export function cutsceneSeen(storage){try{return storage.getItem(CUTSCENE_KEY)==='1'}catch{return true}}
export function rememberCutscene(storage){try{storage.setItem(CUTSCENE_KEY,'1')}catch{}}

const el=id=>document.getElementById(id);

function playClip(video,src){
  return new Promise(resolve=>{
    let done=false;
    const finish=()=>{if(done)return;done=true;cleanup();resolve()};
    const onVisibility=()=>{
      if(document.hidden){try{video.pause()}catch{}}
      else{video.play().catch(()=>{})}
    };
    const cleanup=()=>{
      video.removeEventListener('ended',finish);
      video.removeEventListener('error',finish);
      document.removeEventListener('visibilitychange',onVisibility);
      try{video.pause()}catch{}
      video.removeAttribute('src');try{video.load()}catch{} // Decoder-RAM freigeben
    };
    document.addEventListener('visibilitychange',onVisibility);
    video.addEventListener('ended',finish,{once:true});
    video.addEventListener('error',finish,{once:true}); // Clip fehlt: weiter ohne Abbruch
    video.src=src;
    video.play().catch(finish); // Autoplay blockiert: Clip ueberspringen
  });
}

export async function playIntroCutscene(storage){
  const overlay=el('cutscene'),video=el('cutsceneVideo'),skip=el('cutsceneSkip');
  if(!overlay||!video||!skip||cutsceneSeen(storage))return;
  overlay.hidden=false;
  const skipAll=new Promise(resolve=>skip.addEventListener('click',resolve,{once:true}));
  for(const clip of CUTSCENE_CLIPS){
    await Promise.race([playClip(video,clip.src),skipAll]);
  }
  overlay.hidden=true;
  rememberCutscene(storage);
}
