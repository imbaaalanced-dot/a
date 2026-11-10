/* Canonical V5b hero combat sheets. Enemy directional manifests stay untouched. */
(()=>{'use strict';
  const registry=globalThis.TD2DirectionalAssets;
  if(registry){delete registry.marcel;delete registry.kim;}
  // Uploaded 6x6 combat sheets contain genuine side views only. Never mirror
  // a shield, bow, or other asymmetric equipment. For unpainted directions
  // the matching V5b walk sheet remains visible.
  globalThis.TD2HeroSideAssets={
    marcel:{file:'assets/hero/marcel-side-actions-v5b.webp?v=v5-heroes-b1',cell:128,frames:6,facing:'right',rows:{attack:2,hit:4,death:5},anchor:[64,116],height:95},
    kim:{file:'assets/hero/kim-side-actions-v5b.webp?v=v5-heroes-b1',cell:128,frames:6,facing:'left',rows:{attack:2,hit:4,death:5},anchor:[64,117],height:100}
  };
})();
