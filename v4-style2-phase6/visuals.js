/* Shared sprite sheet: one light direction, palette and foot anchor. */
(() => {
  'use strict';
  const sheet=new Image(), sprites={};
  sheet.onload=()=>{
    const keys=['hero','monument','gate','infantry','brute','boss'];
    keys.forEach((key,i)=>{
      const w=Math.floor(sheet.naturalWidth/3),h=Math.floor(sheet.naturalHeight/2);
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(sheet,(i%3)*w,Math.floor(i/3)*h,w,h,0,0,w,h);
      const data=ctx.getImageData(0,0,w,h).data;
      let x0=w,y0=h,x1=0,y1=0;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>40){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
      if(x1>x0&&y1>y0){const sw=x1-x0+1,sh=y1-y0+1;const small=document.createElement('canvas');small.height=key==='monument'?356:232;small.width=Math.ceil(small.height*sw/sh);small.getContext('2d').drawImage(canvas,x0,y0,sw,sh,0,0,small.width,small.height);sprites[key]={canvas:small,bounds:[0,0,small.width,small.height]};}
    });
  };
  sheet.src='assets/guardian-atlas-v27.png';
  function draw(ctx,key,x,y,height,face=1,opacity=1){
    const sprite=sprites[key];if(!sprite)return false;
    const [sx,sy,sw,sh]=sprite.bounds,width=height*sw/sh;
    ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.globalAlpha*=opacity;
    ctx.drawImage(sprite.canvas,sx,sy,sw,sh,-width/2,12-height,width,height);ctx.restore();return true;
  }
  globalThis.DenkmalArt={draw,get ready(){return !!sprites.hero;}};
})();
