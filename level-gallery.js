/* TD2 campaign gallery: presentation only; existing game.js owns unlocks and saves. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TD2LevelGallery = api;
  if (typeof document !== 'undefined') api.mount(document);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const prefix = 'assets/menu/level-gallery/';
  const levelMeta = [
    {id:1, city:'Denkmal TD2', name:'Einleitung', image:'level-01-einleitung.webp'},
    {id:2, city:'Denkmal TD2', name:'Labyrinth', image:'level-02-labyrinth.webp'},
    {id:3, city:'Herdecke', name:'Kirchende', image:'level-03-kirchende.webp'},
    {id:4, city:'Herdecke', name:'Ender Dorfkirche', image:'level-04-ender-dorfkirche.webp'},
    {id:5, city:'Dortmund', name:'Hohensyburg', image:'level-05-hohensyburg.webp'},
    {id:6, city:'Herdecke', name:'Goethestraße', image:'level-06-goethestrasse.webp'},
    {id:7, city:'Schwerte', name:'Westhofen', image:null}
  ];
  function visibleLevel(id, unlocked) {
    const level = levelMeta.find(entry => entry.id === id);
    if (!level) return null;
    return unlocked ? {...level, locked:false} : {id:level.id, city:level.city, locked:true};
  }
  function mount(doc) {
    const list = doc.querySelector('#campaignMenu .map-card-list');
    if (!list || list.dataset.galleryMounted) return;
    const buttons = levelMeta.map(({id}) => doc.getElementById(id === 1 ? 'startBtn' : `level${id}Btn`));
    if (buttons.some(button => !button)) return;
    list.dataset.galleryMounted = 'true';
    const pages = Math.ceil(buttons.length / 4);
    let page = 0, swipeStart = null;
    list.classList.add('level-gallery');
    const pager = doc.createElement('nav');
    pager.className = 'level-gallery-pages';pager.setAttribute('aria-label','Levelseiten');
    const previous = doc.createElement('button'), next = doc.createElement('button'), label = doc.createElement('span');
    previous.type=next.type='button';previous.textContent='‹';next.textContent='›';
    previous.setAttribute('aria-label','Vorherige Levelseite');next.setAttribute('aria-label','Nächste Levelseite');
    pager.append(previous,label,next);list.after(pager);
    const visuals = buttons.map((button, index) => {
      for(const child of button.children) child.setAttribute('aria-hidden','true');
      const visual=doc.createElement('span');visual.className='level-gallery-visual';visual.setAttribute('aria-hidden','true');
      const title=doc.createElement('span');title.className='level-gallery-title';
      button.append(visual,title);
      button.dataset.galleryId=String(index+1);
      return {button,visual,title};
    });
    function render(){
      visuals.forEach(({button,visual,title},i)=>{
        const data=visibleLevel(i+1,!button.disabled);
        button.hidden=Math.floor(i/4)!==page;
        button.classList.toggle('gallery-locked',data.locked);
        button.classList.toggle('gallery-unlocked',!data.locked);
        button.setAttribute('aria-label',data.locked?`Level ${data.id}: ${data.city}, gesperrt`:`Level ${data.id}: ${data.name}`);
        title.textContent=data.locked?data.city:data.name;
        const image=data.locked?null:data.image;
        if(visual.dataset.image!==String(image)){
          visual.replaceChildren();
          if(image){const img=doc.createElement('img');img.src=prefix+image;img.alt='';img.loading='lazy';visual.append(img);}
          else{const icon=doc.createElement('span');icon.className='level-gallery-symbol';icon.textContent=data.locked?'🔒':'✦';visual.append(icon);}
          visual.dataset.image=String(image);
        }
      });
      label.textContent=`${page+1} / ${pages}`;previous.disabled=page===0;next.disabled=page===pages-1;
    }
    function setPage(value){page=Math.max(0,Math.min(pages-1,value));render();}
    previous.addEventListener('click',()=>setPage(page-1));next.addEventListener('click',()=>setPage(page+1));
    list.addEventListener('touchstart',event=>{swipeStart=event.touches[0]?.clientX??null;},{passive:true});
    list.addEventListener('touchend',event=>{if(swipeStart===null)return;const delta=(event.changedTouches[0]?.clientX??swipeStart)-swipeStart;swipeStart=null;if(Math.abs(delta)>55)setPage(page+(delta<0?1:-1));},{passive:true});
    pager.addEventListener('keydown',event=>{if(event.key==='ArrowLeft')previous.click();if(event.key==='ArrowRight')next.click();});
    const observer=new MutationObserver(records=>{if(records.some(record=>record.attributeName==='disabled'))render();});
    for(const button of buttons)observer.observe(button,{attributes:true,attributeFilter:['disabled']});
    render();
  }
  return {levelMeta, visibleLevel, mount};
});
