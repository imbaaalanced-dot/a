/* Temporary CI diagnostic helper for the V5 CDN art PR: emits captured tool
 * output as check-run error annotations so failures are readable from the
 * public run page without log access. First file is reported from its tail
 * (assertion errors), second from its head (partial results). Remove this
 * file together with the tee/report debug steps before merge. */
'use strict';
const fs=require('fs');
function emit(label,text){
 const compact=String(text).replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n+/g,' | ');
 const parts=[];
 for(let i=0;i<compact.length&&parts.length<4;i+=700)parts.push(compact.slice(i,i+700));
 parts.forEach((part,j)=>{
  const data=part.replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A').replace(/:/g,'%3A');
  console.log('::error title='+label+' '+(j+1)+'/'+parts.length+'::'+data);
 });
}
const args=process.argv.slice(2);
if(args[0]){try{emit(args[0].split('/').pop(),fs.readFileSync(args[0],'utf8').slice(-2800));}catch{}}
if(args[1]){try{emit(args[1].split('/').pop(),fs.readFileSync(args[1],'utf8').slice(0,2800));}catch{}}
