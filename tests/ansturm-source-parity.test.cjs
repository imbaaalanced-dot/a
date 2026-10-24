const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source='ansturm-alpha1-5',deployed='dist/ansturm';
for(const name of fs.readdirSync(source).filter(n=>/\.(js|html|css|json)$/.test(n)&&n!=='package.json')){
 assert.ok(fs.existsSync(path.join(deployed,name)),`missing deployed ${name}`);
 assert.ok(fs.readFileSync(path.join(source,name)).equals(fs.readFileSync(path.join(deployed,name))),`source/deploy mismatch: ${name}`);
}
console.log('All Ansturm runtime source/deploy files match');
