/* TD2 V5: optional, independently delivered full-body hero art for the portrait home.
 * Deliberately read-only: no save writes, no change to existing menu button handlers.
 * The currently deployed menu stays intact until BOTH compressed WebP files exist.
 */
(function () {
  'use strict';
  const home=document.querySelector('#startScreen .td2-portrait-home');
  if(!home || home.querySelector('.td2-v5-duo-stage'))return;
  const actions=home.querySelector('.td2-mode-stack');
  if(!actions)return;

  const stage=document.createElement('div');
  stage.className='td2-v5-duo-stage';
  stage.setAttribute('role','img');
  stage.setAttribute('aria-label','Marcel, der Beschützer, mit Schwert und Schild; Kim, die Zielsichere, mit Bogen');
  const art=document.createElement('div');
  art.className='td2-v5-duo-art';
  stage.appendChild(art);

  const sources=[
    {name:'marcel',path:'assets/menu/v5-avatars/marcel-guardian-v5.webp'},
    {name:'kim',path:'assets/menu/v5-avatars/kim-marksman-v5.webp'}
  ];
  let successful=0;
  let failed=false;
  for(const source of sources){
    const figure=document.createElement('img');
    figure.className='td2-v5-hero td2-v5-hero-'+source.name;
    figure.alt='';
    figure.decoding='async';
    figure.loading='eager';
    figure.addEventListener('load',()=>{
      if(failed || !figure.naturalWidth || !figure.naturalHeight)return;
      successful+=1;
      if(successful===sources.length)stage.classList.add('is-ready');
    },{once:true});
    figure.addEventListener('error',()=>{
      failed=true;
      stage.remove();
    },{once:true});
    figure.src=source.path;
    art.appendChild(figure);
  }

  const names=document.createElement('div');
  names.className='td2-v5-duo-names';
  names.setAttribute('aria-hidden','true');
  names.innerHTML='<span>Marcel <small>DER BESCHÜTZER</small></span><span>Kim <small>DIE ZIELSICHERE</small></span>';
  stage.appendChild(names);
  home.insertBefore(stage,actions);
})();