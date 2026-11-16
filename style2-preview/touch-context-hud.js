/* TD2 HUD 2.0 — small, optional touch-only context panel. */
globalThis.DenkmalTouchContext=(()=>{
  function create(root,actions){
    const title=root.querySelector('.touch-context-title');
    const options=root.querySelector('.touch-context-options');
    const closeButton=root.querySelector('.touch-context-close');
    let open=false;
    function close(){open=false;root.hidden=true;root.classList.add('hidden');root.setAttribute('aria-hidden','true');options.replaceChildren();}
    function show(heading,entries){
      if(!actions.isPlaying())return close();
      title.textContent=heading;
      options.replaceChildren();
      for(const entry of entries){
        const button=document.createElement('button');
        button.type='button';button.textContent=entry.label;
        button.disabled=entry.enabled===false;
        if(entry.kind)button.dataset.tower=entry.kind;
        button.onclick=()=>{
          if(!actions.isPlaying()){close();return;}
          if(entry.run()!==false)close();
        };
        options.appendChild(button);
      }
      open=true;root.hidden=false;root.classList.remove('hidden');root.setAttribute('aria-hidden','false');
    }
    function openBuild(slot,types){
      show('TURM BAUEN',types.map(t=>({
        kind:t.kind,label:`${t.label} · ${t.cost}`,enabled:t.enabled,
        run:()=>{
          if(!actions.canBuild(slot,t.kind)){close();return false;}
          return actions.build(slot,t.kind);
        }
      })));
    }
    function openTower(tower,entries){
      show('TURM VERWALTEN',entries.map(a=>({
        label:a.label,enabled:a.enabled,run:()=>a.run(tower)
      })));
    }
    closeButton.onclick=close;
    close();
    return {openBuild,openTower,close,isOpen:()=>open};
  }
  return {create};
})();
