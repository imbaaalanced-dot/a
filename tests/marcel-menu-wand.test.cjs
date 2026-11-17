'use strict';
/* Beta #330: the approved Marcel crystal-staff graphic is menu-only. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'../dist');
const portrait='assets/menu/v6/marcel-wand-menu-portrait-20261117.avif';
const menuUrl=portrait+'?v=wand-menu-v6-20261117';
const bytes=fs.readFileSync(path.join(root,portrait));
assert.equal(bytes.length,17687,'menu image must remain mobile-lightweight');
assert.equal(bytes.toString('ascii',4,12),'ftypavif','file is an AVIF image');
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '49cbffd9363b7498eb20bca19227082115ae18306888dfa9379dbfdb25fc567e',
  'image bytes must match the approved 448x672 transparent export');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const canonical=fs.readFileSync(path.join(root,'canonical-hero-art-v5.js'),'utf8');
const nativeDuo=html.match(/<figure class="menu-hero-figure"[\s\S]*?<\/figure>/)?.[0]||'';
assert.ok(nativeDuo.includes(menuUrl),'initial Marcel figure must use the staff art');
assert.ok(nativeDuo.includes('kim-marksman-v6.webp'),'Kim retains her bow portrait');
assert.ok(game.includes("const menuMarcelPortrait='"+menuUrl+"'"),'character switch uses staff menu image');
assert.ok(game.includes('const bannerUrl=kim?portraitUrl:menuMarcelPortrait;'),'selected Marcel uses staff art');
assert.ok(game.includes("const companionUrl=otherCharacter==='marcel'?menuMarcelPortrait:"),'Kim selection shows Marcel with staff as companion');
assert.ok(canonical.includes("portrait:'assets/menu/v5-avatars/marcel-guardian-v6.webp"),'canonical HUD/armory remains unchanged');
assert.ok(!canonical.includes(portrait),'menu illustration must not alter gameplay art mapping');
assert.ok(html.includes('game.js?v=wand-menu-v6-20261117'),'game JS cache key is updated');
console.log('Menu-only Marcel wand AVIF fingerprint, selection and HUD isolation passed');
