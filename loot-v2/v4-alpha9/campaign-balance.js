(function(root){'use strict';
const slots=[[-104,-435],[104,-275],[435,-104],[275,104],[104,435],[-104,275],[-435,104],[-275,-104]].map(([x,y])=>({x:1536+x,y:1536+y}));
function profile(level,{pilot=false}={}){return level===1&&pilot?{localWaves:8,phases:[[1,2],[3,5],[6,8]],slots:slots.map(p=>({...p})),maxTowers:6}:null;}
const api={profile};root.CampaignBalance=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
