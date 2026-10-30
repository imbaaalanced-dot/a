const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

// Catches missing published entry pages and redirects that escape /a/, loop,
// drop tester parameters, or depend on a trailing slash after index.html.
for(const [file,paths] of [
 ['dist/td2-ansturm-tutorial/index.html',['/a/td2-ansturm-tutorial/','/a/td2-ansturm-tutorial/index.html']],
 ['dist/td2-ansturm-tutorial/ansturm/index.html',['/a/td2-ansturm-tutorial/ansturm/','/a/td2-ansturm-tutorial/ansturm/index.html']]
]){
 const html=fs.readFileSync(file,'utf8');
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script,`${file}: automatic navigation missing`);
 const fallback=html.match(/<a href="([^"]+)"/)[1];
 for(const path of paths){
  for(const suffix of ['', '?qa=menu%204&td2UserTowers=1#anleitung']){
   const from=new URL('https://imbaaalanced-dot.github.io'+path+suffix);
   let destination;
   const location={href:from.href,search:from.search,hash:from.hash,replace:url=>destination=url};
   vm.runInNewContext(script,{URL,location});
   assert.equal(destination,'https://imbaaalanced-dot.github.io/a/ansturm/'+suffix);
   assert.equal(new URL(fallback,from).href,'https://imbaaalanced-dot.github.io/a/ansturm/');
  }
 }
}
console.log('Legacy Ansturm links redirect to the published game with query/hash intact');
