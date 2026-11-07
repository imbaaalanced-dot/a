'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

const script=path.join(__dirname,'../tools/prepare-v5-graphics-preview.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'td2-v5-preview-test-'));
const source=path.join(root,'dist');
const pages=path.join(root,'pages');
const preview=path.join(pages,'td2-v5-graphics-preview');
const heroes=path.join(source,'assets/menu/v5-avatars');

function run(){return spawnSync(process.execPath,[script,source,pages],{encoding:'utf8',env:{...process.env,GITHUB_SHA:'test-fixture-commit'}});}

try {
  fs.mkdirSync(heroes,{recursive:true});
  fs.mkdirSync(pages,{recursive:true});
  fs.writeFileSync(path.join(pages,'live-build-sentinel.txt'),'unchanged');
  fs.writeFileSync(path.join(source,'index.html'),'<!doctype html><title>TD2 preview</title>');
  fs.writeFileSync(path.join(heroes,'marcel-guardian-v5b.webp'),'marcel');
  fs.writeFileSync(path.join(heroes,'kim-marksman-v5b.webp'),'kim');

  const first=run();
  assert.equal(first.status,0,first.stderr);
  assert.match(fs.readFileSync(path.join(preview,'index.html'),'utf8'),/TD2 preview/);
  assert.equal(fs.readFileSync(path.join(preview,'preview-commit.txt'),'utf8'),'test-fixture-commit\n');
  assert.equal(fs.readFileSync(path.join(pages,'live-build-sentinel.txt'),'utf8'),'unchanged');

  fs.writeFileSync(path.join(preview,'stale.txt'),'must disappear');
  const second=run();
  assert.equal(second.status,0,second.stderr);
  assert.ok(!fs.existsSync(path.join(preview,'stale.txt')),'stale preview files are removed without touching siblings');
  assert.equal(fs.readFileSync(path.join(pages,'live-build-sentinel.txt'),'utf8'),'unchanged');

  fs.rmSync(path.join(heroes,'kim-marksman-v5b.webp'));
  const missing=run();
  assert.notEqual(missing.status,0,'missing hero blocks stage update');
  assert.ok(fs.existsSync(path.join(preview,'index.html')),'failed validation preserves last preview');
} finally {
  fs.rmSync(root,{recursive:true,force:true});
}

console.log('V5 preview staging keeps root/siblings intact, replaces only preview and rejects missing assets');
