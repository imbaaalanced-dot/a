'use strict';
/* Beta #330: the revised Marcel crystal-staff graphic is menu-only. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'../dist');
const portrait='assets/menu/v6/marcel-wand-menu-portrait-20261117-refined.webp';
const menuUrl=portrait+'?v=wand-menu-refined-20261117';
const bytes=fs.readFileSync(path.join(root,portrait));
assert.equal(bytes.length,35682,'menu image must remain mobile-lightweight');
assert.equal(bytes.toString('ascii',0,4),'RIFF','file has RIFF container');
assert.equal(bytes.toString('ascii',8,12),'WEBP','file is WebP');
assert.equal(bytes.toString('ascii',12,16),'VP8X','file supports extended alpha');
assert.ok((bytes[20]&0x10)!==0,'WebP alpha flag present');
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '0a28d5e0bac6fabc9ac8da986467f07f15f728161118777590b18c12d38d6cf5',
  'image bytes must match the revised 384x576 transparent preview export');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
const canonical=fs.readFileSync(path.join(root,'canonical-hero-art-v5.js'),'utf8');
const nativeDuo=html.match(/<figure class="menu-hero-figure"[\s\S]*?<\/figure>/)?.[0]||'';
assert.ok(nativeDuo.includes(menuUrl),'initial Marcel figure must use the staff art');
assert.ok(nativeDuo.includes('kim-marksman-v6.webp'),'Kim retains her bow portrait');
assert.ok(game.includes("const menuMarcelPortrait='"+menuUrl+"'"),'character switch uses staff menu image');
assert.ok(game.includes('const bannerUrl=kim?portraitUrl:menuMarcelPortrait;'),'selected Marcel uses staff art');
assert.ok(game.includes("const companionUrl=otherCharacter==='marcel'?menuMarcelPortrait:"),'Kim selection shows Marcel with staff as companion');
assert.ok(canonical.includes("portrait:'assets/menu/v5-avatars/marcel-guardian-v7.webp"),'canonical HUD/armory now projects the wand portrait v7');
assert.ok(!canonical.includes(portrait),'menu illustration must not alter gameplay art mapping');
assert.ok(html.includes('game.js?v=gameplay-restoration-20261123'),'game JS cache key is updated');
console.log('Menu-only Marcel wand WebP fingerprint, selection and HUD isolation passed');
