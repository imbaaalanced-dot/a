'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/pages.yml'),'utf8');
const mainStep=workflow.split('- name: Publish main tester at root')[1];
const cleanup=mainStep.split('\n').find(line=>line.trim().startsWith('find /tmp/denkmal-gh-pages '));
assert.ok(cleanup,'main publisher has a bounded cleanup command');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'td2-pages-'));
try{
 const previews=['td2-combined','td2-ansturm-tutorial','td2-unified-ui','td2-level5-balance','td2-all-patches','loot-v2','td2-consolidation','v4-alpha9'];
 for(const name of ['.git',...previews]){fs.mkdirSync(path.join(root,name));fs.writeFileSync(path.join(root,name,'keep.txt'),'retained');}
 fs.writeFileSync(path.join(root,'old-root.js'),'stale');
 execFileSync('bash',['-c',cleanup.replaceAll('/tmp/denkmal-gh-pages',root)]);
 for(const name of previews)assert.equal(fs.readFileSync(path.join(root,name,'keep.txt'),'utf8'),'retained',name+' must survive main deployment');
 assert.ok(fs.existsSync(path.join(root,'.git/keep.txt')));
 assert.ok(!fs.existsSync(path.join(root,'old-root.js')),'stale root assets are removed');
 console.log('Main publication preserves current and historical tester paths');
}finally{fs.rmSync(root,{recursive:true,force:true});}
