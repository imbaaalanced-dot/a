/* Canonical V5b hero combat sheets. Legacy 96px hero entries remain disabled. */
(()=>{'use strict';
  const registry=globalThis.TD2DirectionalAssets;
  if(registry){delete registry.marcel;delete registry.kim;}
  // Uploaded 6x6 combat sheets contain genuine painted views only. Never mirror
  // a shield, bow, or other asymmetric equipment. Each direction uses its OWN
  // approved 768x768 WebP with the same 6x6 frame contract and foot anchor.
  // Marcel's base sheet faces right, Kim's base sheet faces left; the three
  // additionally painted directions per hero are registered under sheets.
  // A direction without its own sheet keeps the V5b walk sheet visible.
  const sheet='?v=hero-dir-v5b-20261114';
  globalThis.TD2HeroSideAssets={
    marcel:{
      file:globalThis.TD2CanonicalHeroArt?.marcel?.actions||'assets/hero/marcel-side-actions-v5b.webp?v=v5b-alpha-20261112',
      cell:128,frames:6,facing:'right',rows:{attack:2,hit:4,death:5},anchor:[64,116],height:95,
      sheets:{
        down:'assets/hero/marcel-down-actions-v5b.webp'+sheet,
        left:'assets/hero/marcel-left-actions-v5b.webp'+sheet,
        up:'assets/hero/marcel-up-actions-v5b.webp'+sheet
      }
    },
    kim:{
      file:globalThis.TD2CanonicalHeroArt?.kim?.actions||'assets/hero/kim-side-actions-v5b.webp?v=v5b-alpha-20261112',
      cell:128,frames:6,facing:'left',rows:{attack:2,hit:4,death:5},anchor:[64,117],height:100,
      sheets:{
        down:'assets/hero/kim-down-actions-v5b.webp'+sheet,
        right:'assets/hero/kim-right-actions-v5b.webp'+sheet,
        up:'assets/hero/kim-up-actions-v5b.webp'+sheet
      }
    }
  };
})();