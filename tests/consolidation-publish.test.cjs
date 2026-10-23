const fs=require('node:fs'),assert=require('node:assert/strict');
const pages=fs.readFileSync('.github/workflows/pages.yml','utf8');
const clean=pages.split('\n').find(s=>s.includes('find /tmp/denkmal-gh-pages -mindepth 1'));
assert.ok(clean.includes('! -name td2-consolidation'),'root publish must preserve the consolidation preview');
console.log('Pages cleanup preserves consolidation preview');
