/* Correct the v4.10 hero action-manifest exports; enemy atlas paths stay untouched. */
(()=>{'use strict';
  const registry=globalThis.TD2DirectionalAssets;
  if(!registry)return;
  for(const name of ['marcel','kim']){
    if(!registry[name]||registry[name].cell!==192||registry[name].frames!==4)continue;
    registry[name].file=`assets/directional-v410/${name}.webp?v=v5-hero-actions-a1`;
  }
  // Uploaded 6x6 combat sheets contain genuine side views only. Never mirror
  // a shield, bow, or other asymmetric equipment, and keep the existing 4-way
  // 4x12 action atlas for all other facings and during lazy image decoding.
  globalThis.TD2HeroSideAssets={
    marcel:{file:'assets/hero/marcel-side-actions-v5b.webp?v=v5-heroes-b1',cell:128,frames:6,facing:'right',rows:{attack:2,hit:4,death:5},anchor:[64,116],height:95},
    kim:{file:'assets/hero/kim-side-actions-v5b.webp?v=v5-heroes-b1',cell:128,frames:6,facing:'left',rows:{attack:2,hit:4,death:5},anchor:[64,117],height:100}
  };
})();
