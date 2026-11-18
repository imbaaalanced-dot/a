// Denkmal TD2 Ansturm - Intro-Cutscene (v4.1.0)
// Spielt genau einmal pro Geraet nach Start und ist skippbar.
// WebView-freundlich: play() laeuft im Touch-Kontext, preload="none",
// src wird nach dem Abspielen freigegeben (Decoder-RAM auf 4-GB-Geraeten).
// Fehlt der Clip (assets/cutscenes/intro.mp4), startet das Spiel ohne Unterbrechung.

export const CUTSCENE_SRC='assets/cutscenes/intro.mp4';
export const CUTSCENE_KEY='td2.denkmalAnsturm.cutscene.intro.v1';

export function cutsceneSeen(storage){try{return storage.getItem(CUTSCENE_KEY)==='1'}catch{return true}}
export function rememberCutscene(storage){try{storage.setItem(CUTSCENE_KEY,'1')}catch{}}

export async function playIntroCutscene(storage){
  const overlay=document.getElementById('cutscene');
  const video=document.getElementById('cutsceneVideo');
  const skip=document.getElementById('cutsceneSkip');
  if(!overlay||!video||!skip||cutsceneSeen(storage))return;
  await new Promise(resolve=>{
    let done=false;
    const finish=()=>{
      if(done)return;done=true;
      skip.removeEventListener('click',finish);
      document.removeEventListener('visibilitychange',onVisibility);
      try{video.pause()}catch{}
      overlay.hidden=true;
      video.removeAttribute('src');try{video.load()}catch{} // Decoder-RAM freigeben
      rememberCutscene(storage);
      resolve();
    };
    const onVisibility=()=>{
      if(document.hidden){try{video.pause()}catch{}}
      else{video.play().catch(()=>{})}
    };
    overlay.hidden=false;
    video.addEventListener('ended',finish,{once:true});
    video.addEventListener('error',finish,{once:true});
    skip.addEventListener('click',finish,{once:true});
    document.addEventListener('visibilitychange',onVisibility);
    video.src=CUTSCENE_SRC;
    video.play().catch(finish); // Autoplay blockiert oder Clip fehlt: direkt ins Spiel
  });
}
