export function buildLegacyExport(storage){
  const read=(k)=>storage.getItem(k);
  const oldRecord=read('td2.denkmalAnsturm.alpha1.bestWave.v1');
  const bestWave=oldRecord===null?0:Number(oldRecord);
  if(!Number.isSafeInteger(bestWave)||bestWave<0)throw Error('Ungültiger Rekord');
  const run=read('td2.denkmalAnsturm.run.v1');
  if(run!==null){
    if(run.length>2000000)throw Error('Spielstand zu groß');
    const data=JSON.parse(run);
    if(!data||data.version!==1||!data.state||typeof data.state!=='object')throw Error('Ungültiger Spielstand');
  }
  return JSON.stringify({game:'ansturm',version:1,bestWave,run},null,2);
}
