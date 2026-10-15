/* Cached visual terrain renderer: ground, paths, stars and crowns. */
(()=>{'use strict';function drawStars(ctx,x,y,level){for(let i=0;i<level;i++){ctx.fillStyle='#ffcc55';ctx.fillRect(x+i*12,y+38,8,8)}}globalThis.DenkmalTerrain={drawStars};})();
