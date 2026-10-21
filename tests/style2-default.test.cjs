const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const [search,expected] of [['',true],['?td2UserTowers=1',true],['?td2UserTowers=0',false]]){
 const box={URLSearchParams,location:{search}};vm.createContext(box);
 vm.runInContext(fs.readFileSync('dist/style2-user-towers.js','utf8'),box);
 assert.equal(box.UserStyle2Towers.enabled,expected,'approved tower graphics should be enabled by default with explicit fallback override');
}
console.log('Style 2: default graphics and explicit fallback override passed');
