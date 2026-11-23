/* TD2 CDN pilot map. Opt-in only: enabled with ?td2Cdn=1 during the pilot.
 * Keys are the exact logical asset paths the modules request (before any ?v= suffix).
 * Values are immutable Cloudinary delivery versions; the uploads are byte-identical
 * copies of the GitHub files (verified 2026-11-23). Never apply transformations:
 * sprite atlases are pixel-anchored. On failure asset-manager.js retries the local file.
 */
(()=>{'use strict';
  const params=typeof URLSearchParams==='function'?new URLSearchParams(globalThis.location?.search||''):null;
  const enabled=!!params&&params.get('td2Cdn')==='1';
  const CLOUD='https://res.cloudinary.com/xs5rd7mt/image/upload';
  const MAP=Object.freeze({
    'assets/loading/kim-marcel-loading-v5.webp':{version:'v1795466831'},
    'assets/loading/gate.webp':{version:'v1795466833'},
    'assets/menu/memorial-yard-v4.webp':{version:'v1795466835'},
    'assets/menu/memorial-yard-mobile-v4.webp':{version:'v1795466837'},
    'assets/menu/crest-v4.webp':{version:'v1795466838'}
  });
  function resolve(url){
    const key=String(url).split('?')[0];
    const entry=MAP[key];
    if(!enabled||!entry)return {url,fallback:null};
    const publicId='td2/runtime/'+key.slice('assets/'.length).replace(/\.webp$/,'');
    return {url:CLOUD+'/'+entry.version+'/'+publicId+'.webp',fallback:url};
  }
  globalThis.TD2CdnMap=Object.freeze({resolve,enabled});
})();
