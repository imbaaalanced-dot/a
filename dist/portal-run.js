/* Portalreise state/economy core. No DOM, inventory or campaign side effects. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PortalRun=api;
})(globalThis,function(){
  'use strict';
  function integer(value,min,max=Number.MAX_SAFE_INTEGER){
    return Number.isSafeInteger(value)&&value>=min&&value<=max;
  }
  // A quarter essence is the smallest unit. Reject unsafe sums rather than
  // silently rounding, including when reading a tower's actual investment.
  function units(value){
    if(typeof value!=='number'||!Number.isFinite(value)||!integer(value*4,0))throw new TypeError('Invalid quarter-unit essence');
    return value*4;
  }
  function refund(towers){
    if(!Array.isArray(towers))throw new TypeError('Expected remaining towers');
    let sum=0;
    for(const tower of towers){
      if(!tower||typeof tower!=='object')throw new TypeError('Invalid tower');
      sum+=units(tower.spent);
      if(!integer(sum,0))throw new RangeError('Essence overflow');
    }
    return sum/4;
  }
  function create({runId,seed,heroId,startBudget,maxSections}){
    if(typeof runId!=='string'||!runId.trim())throw new TypeError('Invalid runId');
    if(!integer(seed,0,0xffffffff))throw new TypeError('Invalid seed');
    if(heroId!=='marcel'&&heroId!=='kim')throw new TypeError('Invalid heroId');
    if(!integer(maxSections,1))throw new TypeError('Invalid maxSections');
    units(startBudget);
    // Regular and boss premiums must also be representable in quarters.
    units(startBudget/4);
    return {version:1,revision:0,runId,heroId,startBudget,maxSections,
      section:1,waveInSection:0,phase:'build',heroHp:100,gold:startBudget,
      perkRanks:{},rngState:seed,checkpoint:null,rewardIds:[]};
  }
  /**
   * Events always carry {type,runId,section,revision}. The revision belongs to
   * the state on which the caller acted, not the state at delivery time.
   * WAVE_CLEARED carries remaining towers on wave two. It settles once;
   * SECTION_LOADED must never pay again. Perk application/storage are separate
   * modules (Tasks 2/3); PERK_SELECTED only acknowledges that completed work.
   */
  function reduce(run,event){
    const unchanged=()=>({run,effects:[]});
    if(!run||run.version!==1||!event||event.runId!==run.runId||
      event.section!==run.section||event.revision!==run.revision||
      !integer(run.revision,0,Number.MAX_SAFE_INTEGER-1)||
      !integer(run.section,1,run.maxSections))return unchanged();
    let patch;
    switch(event.type){
      case 'START_WAVE':
        if(run.phase!=='build'||!integer(run.waveInSection,0,1))return unchanged();
        patch={phase:'combat'};break;
      case 'WAVE_CLEARED':
        if(run.phase!=='combat'||!integer(run.waveInSection,0,1))return unchanged();
        if(run.waveInSection===0){patch={phase:'build',waveInSection:1};break;}
        try{
          const final=run.section===run.maxSections;
          const premium=final?0:run.startBudget*(run.section===5?0.5:0.25);
          const total=units(run.gold)+units(refund(event.towers))+units(premium);
          if(!integer(total,0))return unchanged();
          patch={gold:total/4,waveInSection:2,phase:final?'finished':'perk'};
        }catch(_){return unchanged();}
        break;
      case 'PERK_SELECTED':
        if(run.phase!=='perk')return unchanged();
        patch={phase:'exit'};break;
      case 'PORTAL_ENTER':
        if(run.phase!=='exit'||run.section>=run.maxSections)return unchanged();
        patch={phase:'loading'};break;
      case 'LOAD_FAILED':
        if(run.phase!=='loading')return unchanged();
        patch={phase:'exit'};break;
      case 'SECTION_LOADED':
        if(run.phase!=='loading'||run.section>=run.maxSections)return unchanged();
        patch={phase:'build',section:run.section+1,waveInSection:0};break;
      case 'FAIL':
        if(!['build','combat','perk','exit','loading'].includes(run.phase))return unchanged();
        patch={phase:'failed'};break;
      default:return unchanged();
    }
    return {run:{...run,...patch,revision:run.revision+1},effects:[]};
  }
  return Object.freeze({create,reduce,refund});
});
