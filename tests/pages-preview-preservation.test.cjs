'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/pages.yml'),'utf8');
const mainStep=workflow.split('- name: Publish main tester at root')[1];
const cleanup=mainStep.split('\n').find(line=>line.trim().startsWith('find /tmp/denkmal-gh-pages '));
assert.ok(cleanup,'main publisher has a bounded cleanup command');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'td2-pages-'));
try{
 const previews=['td2-combined','td2-ansturm-tutorial','td2-unified-ui','td2-level5-balance','td2-all-patches','loot-v2','td2-consolidation','v4-alpha9','v5-mobile-fps-preview','future-preview-not-in-whitelist'];
 for(const name of ['.git',...previews]){fs.mkdirSync(path.join(root,name));fs.writeFileSync(path.join(root,name,'keep.txt'),'retained');}
 for(const name of ['assets','ansturm']){fs.mkdirSync(path.join(root,name));fs.writeFileSync(path.join(root,name,'old-runtime.txt'),'obsolete');}
 fs.mkdirSync(path.join(root,'td2-all-patches/v4.1.0'));
 fs.writeFileSync(path.join(root,'td2-all-patches/v4.1.0/index.html'),'v4.1 preview');
 fs.writeFileSync(path.join(root,'old-root.js'),'stale');
 execFileSync('bash',['-c',cleanup.replaceAll('/tmp/denkmal-gh-pages',root)]);
 for(const name of previews)assert.equal(fs.readFileSync(path.join(root,name,'keep.txt'),'utf8'),'retained',name+' must survive main deployment');
 assert.equal(fs.readFileSync(path.join(root,'td2-all-patches/v4.1.0/index.html'),'utf8'),'v4.1 preview','nested V4.1 build survives the existing main cleanup');
 const preview=fs.readFileSync(path.join(__dirname,'../.github/workflows/v410-preview.yml'),'utf8');
 assert.match(preview,/cp -R dist\/\. \/tmp\/td2-v410-pages\/td2-all-patches\/v4\.1\.0\//);
 assert.ok(fs.existsSync(path.join(root,'.git/keep.txt')));
 assert.ok(!fs.existsSync(path.join(root,'old-root.js')),'stale root assets are removed');
 for(const name of ['assets','ansturm'])assert.ok(!fs.existsSync(path.join(root,name)),'main runtime directory '+name+' must be replaced, not merged with stale assets');
 console.log('Main publication preserves current and historical tester paths');
}finally{fs.rmSync(root,{recursive:true,force:true});}
