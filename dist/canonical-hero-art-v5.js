/* Single V5b identity lock shared by preloader, menu, HUD and Canvas renderers.
 * Older art remains in the repository as source/fallback; it is not an option here.
 */
(()=>{'use strict';
  const art={
    marcel:{
      walk:'assets/hero/marcel-walk-v5b.webp?v=v5-heroes-b1',
      actions:'assets/hero/marcel-side-actions-v5b.webp?v=v5-heroes-b1',
      portrait:'assets/menu/v5-avatars/marcel-guardian-v6.webp',
      walkGrid:[3,4],actionGrid:[6,6],walkCell:256,actionCell:128
    },
    kim:{
      walk:'assets/hero/kim-walk-v5b.webp?v=v5-heroes-b1',
      actions:'assets/hero/kim-side-actions-v5b.webp?v=v5-heroes-b1',
      portrait:'assets/menu/v5-avatars/kim-marksman-v6.webp',
      walkGrid:[3,4],actionGrid:[6,6],walkCell:256,actionCell:128
    }
  };
  for(const entry of Object.values(art)){
    Object.freeze(entry.walkGrid);Object.freeze(entry.actionGrid);Object.freeze(entry);
  }
  globalThis.TD2CanonicalHeroArt=Object.freeze(art);
})();
