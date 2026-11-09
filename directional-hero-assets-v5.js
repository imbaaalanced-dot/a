/* Correct the v4.10 hero action-manifest exports; enemy atlas paths stay untouched. */
(()=>{'use strict';
  const registry=globalThis.TD2DirectionalAssets;
  if(!registry)return;
  for(const name of ['marcel','kim']){
    if(!registry[name]||registry[name].cell!==192||registry[name].frames!==4)continue;
    registry[name].file=`assets/directional-v410/${name}.webp?v=v5-hero-actions-a1`;
  }
})();
