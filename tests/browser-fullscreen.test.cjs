'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dist=path.join(__dirname,'../dist');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const game=fs.readFileSync(path.join(dist,'game.js'),'utf8');
for(const id of ['fullscreenBtn','menuFullscreenBtn'])assert.match(html,new RegExp('id="'+id+'".*?aria-pressed="false"'));
assert.match(game,/\$\('fullscreenBtn'\)\.onclick=toggleFullscreen/);
assert.match(game,/\$\('menuFullscreenBtn'\)\.onclick=toggleFullscreen/);

function createDom(ids){
  const elements=Object.fromEntries(ids.map(id=>[id,{textContent:'',attributes:{},setAttribute(k,v){this.attributes[k]=v;}}]));
  const listeners={};
  const document={
    fullscreenElement:null,
    documentElement:{},
    addEventListener(event,handler){listeners[event]=handler;},
  };
  let resizes=0,arrows=0;
  document.documentElement.requestFullscreen=async()=>{
    document.fullscreenElement=document.documentElement;
    listeners.fullscreenchange?.();
  };
  document.exitFullscreen=async()=>{
    document.fullscreenElement=null;
    listeners.fullscreenchange?.();
  };
  return {elements,listeners,document,resize(){resizes++;},arrow(){arrows++;},get resizes(){return resizes;},get arrows(){return arrows;}};
}
(async()=>{
  {
    const dom=createDom(['fullscreenBtn','menuFullscreenBtn','hudMenu']);
    const toasts=[];
    const ctx={document:dom.document,$:id=>dom.elements[id],showToast:t=>toasts.push(t),
      resize:dom.resize,positionTutorialArrow:dom.arrow};
    const start=game.indexOf('  function updateFullscreenButtons(){');
    const stop=game.indexOf('  function graphicsLabel(){',start);
    assert.ok(start>0&&stop>start);
    vm.createContext(ctx);
    vm.runInContext(game.slice(start,stop),ctx);
    await ctx.toggleFullscreen();
    assert.equal(dom.document.fullscreenElement,dom.document.documentElement);
    assert.equal(dom.elements.fullscreenBtn.attributes['aria-pressed'],'true');
    assert.equal(dom.elements.menuFullscreenBtn.textContent,'VOLLBILD: AN');
    assert.equal(dom.resizes,1);
    assert.equal(dom.arrows,1);
    await ctx.toggleFullscreen();
    assert.equal(dom.document.fullscreenElement,null);
    assert.equal(dom.elements.menuFullscreenBtn.attributes['aria-pressed'],'false');
    assert.equal(dom.resizes,2);
    delete dom.document.documentElement.requestFullscreen;
    await ctx.toggleFullscreen();
    assert.equal(toasts.length,1,'unsupported browsers show guidance');
  }
  console.log('Browser fullscreen: accessible controls, native enter/exit, resize and unsupported-browser fallback passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
