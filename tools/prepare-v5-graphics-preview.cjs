#!/usr/bin/env node
'use strict';
/* Assemble a single isolated Pages preview without altering its siblings. */
const fs=require('node:fs');
const path=require('node:path');

const [sourceArg,rootArg]=process.argv.slice(2);
if(!sourceArg||!rootArg)throw new Error('usage: node prepare-v5-graphics-preview.cjs DIST_DIR PAGES_ROOT');
const source=fs.realpathSync(sourceArg);
const root=fs.realpathSync(rootArg);
const target=path.resolve(root,'td2-v5-graphics-preview');
if(root===path.parse(root).root||source===root||source.startsWith(root+path.sep)||path.dirname(target)!==root){
  throw new Error('unsafe preview directories');
}

for(const relative of [
  'index.html',
  'assets/menu/v5-avatars/marcel-guardian-v5b.webp',
  'assets/menu/v5-avatars/kim-marksman-v5b.webp'
]){
  const file=path.join(source,relative);
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()||fs.statSync(file).size===0){
    throw new Error('missing preview input: '+relative);
  }
}

// Only this fixed, checked subdirectory may be replaced; never delete the site root.
if(fs.existsSync(target))fs.rmSync(target,{recursive:true});
fs.cpSync(source,target,{recursive:true});
fs.writeFileSync(path.join(target,'preview-commit.txt'),(process.env.GITHUB_SHA||'local-unpublished')+'\n');
fs.closeSync(fs.openSync(path.join(root,'.nojekyll'),'a'));

function bytes(item){
  const stat=fs.statSync(item);
  if(!stat.isDirectory())return stat.size;
  return fs.readdirSync(item).reduce((n,name)=>n+bytes(path.join(item,name)),0);
}
const total=bytes(root);
if(total>=900_000_000)throw new Error('Pages total exceeds 900 MB: '+total);
console.log('V5_PREVIEW_READY=td2-v5-graphics-preview/ PAGES_BYTES='+total);
