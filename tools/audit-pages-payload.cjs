'use strict';
// Read-only payload audit: no pruning, no change to gh-pages, no merge/deploy.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(process.argv[2]||'dist');
const output=process.argv[3];
const entries=[];
function walk(dir){
  for(const d of fs.readdirSync(dir,{withFileTypes:true})){
    if(d.name==='.git')continue;
    const absolute=path.join(dir,d.name);
    if(d.isDirectory())walk(absolute);
    else if(d.isFile()){
      const stat=fs.statSync(absolute);
      entries.push({absolute,relative:path.relative(root,absolute).replaceAll(path.sep,'/'),size:stat.size});
    }
  }
}
if(!fs.existsSync(root)||!fs.statSync(root).isDirectory())throw Error('Missing directory: '+root);
walk(root);
const fmt=n=>(n/1048576).toFixed(1)+' MiB';
const total=entries.reduce((n,e)=>n+e.size,0);
const groups=new Map();
for(const e of entries){
  const key=e.relative.split('/')[0];
  const g=groups.get(key)||{files:0,bytes:0};g.files++;g.bytes+=e.size;groups.set(key,g);
}
const bySize=[...entries].sort((a,b)=>b.size-a.size);
const sizeBuckets=new Map();
for(const e of entries){
  if(e.size<65536)continue;
  let group=sizeBuckets.get(e.size);
  if(!group){group=[];sizeBuckets.set(e.size,group);}
  group.push(e);
}
const sameContent=new Map();
for(const group of sizeBuckets.values()){
  if(group.length<2)continue;
  for(const entry of group){
    const digest=crypto.createHash('sha256').update(fs.readFileSync(entry.absolute)).digest('hex');
    let matches=sameContent.get(digest);
    if(!matches){matches=[];sameContent.set(digest,matches);}
    matches.push(entry);
  }
}
const duplicates=[...sameContent.values()].filter(group=>group.length>1);
const duplication=duplicates.reduce((bytes,group)=>bytes+group[0].size*(group.length-1),0);
const likelySource=entries.filter(e=>/(^|\/)(sources?|originals?|reference-inputs?)(\/|$)|(?:^|\/)[^/]+-source\.(?:png|jpg|jpeg|webp|psd|aseprite)$/i.test(e.relative));
const sourceBytes=likelySource.reduce((n,e)=>n+e.size,0);
const escape=s=>s.replaceAll('|','\\|');
const lines=[
'# TD2 Pages payload audit',
'',
'Directory: `'+root+'`',
'Files: **'+entries.length+'** · Total: **'+fmt(total)+'**',
'',
'> This is read-only. Duplication estimates are NOT safe-deletion recommendations. Historical URLs and runtime assets must stay intact.',
'',
'## Largest top-level paths',
'',
'| Path | Files | Bytes |','|---|---:|---:|',
...[...groups].sort((a,b)=>b[1].bytes-a[1].bytes).slice(0,30).map(([name,g])=>'| `'+escape(name)+'` | '+g.files+' | '+fmt(g.bytes)+' |'),
'',
'## Largest individual files',
'',
'| File | Bytes |','|---|---:|',
...bySize.slice(0,25).map(e=>'| `'+escape(e.relative)+'` | '+fmt(e.size)+' |'),
'',
'## Identical content at different paths (diagnostic only)',
'',
'Groups: **'+duplicates.length+'** · Theoretical duplicated bytes: **'+fmt(duplication)+'**',
'',
...duplicates.sort((a,b)=>b[0].size*(b.length-1)-a[0].size*(a.length-1)).slice(0,12)
 .map(g=>'- '+g.length+' paths × '+fmt(g[0].size)+' each; e.g. `'+g[0].relative+'`'),
'',
'## Reference/source-name candidates (do not delete without dependency checks)',
'',
'Files: '+likelySource.length+' · Total: '+fmt(sourceBytes),
...likelySource.sort((a,b)=>b.size-a.size).slice(0,12).map(e=>'- `'+e.relative+'` ('+fmt(e.size)+')'),
''
];
const report=lines.join('\n');
if(output)fs.writeFileSync(output,report);
console.log(report);
