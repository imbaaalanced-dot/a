const fs=require('node:fs'),assert=require('node:assert/strict');
const pages=fs.readFileSync('.github/workflows/pages.yml','utf8');
const clean=pages.split('\n').find(s=>s.includes('find /tmp/denkmal-gh-pages -mindepth 1'));
assert.ok(clean,'root publisher must have a bounded cleanup');
for(const token of ['-type f','-type l','-name assets','-name ansturm']){
  assert.ok(clean.includes(token),'runtime cleanup misses '+token);
}
assert.ok(!clean.includes('td2-consolidation'),'consolidation and all future preview directories are preserved generically');
console.log('Pages cleanup generically preserves consolidation and future previews');
