'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'menu.css'), 'utf8');
const preloader = fs.readFileSync(path.join(root, 'preloader.js'), 'utf8');

// The preloader must load the scenery variant the viewport will actually show.
assert.match(preloader, /(?:matchMedia\('\(max-width:700px\)'\)|mobileQuery='\(max-width:700px\)'[\s\S]*?matchMedia\(mobileQuery\))/, 'preloader picks scenery per viewport');
assert.match(preloader, /memorial-yard-mobile-v4\.webp\?v=menu-v4a1/, 'mobile scenery referenced by preloader');
assert.match(preloader, /memorial-yard-v4\.webp\?v=menu-v4a1/, 'desktop scenery referenced by preloader');

// Only the saved hero banner is preloaded; the other loads on demand in game.js.
assert.match(preloader, /character\s*===\s*'kim'\s*\?\s*'kim-marksman-v6\.webp'\s*:\s*'marcel-guardian-v7\.webp'/, 'approved hero art is selected per character');
assert.doesNotMatch(preloader, /hero-banner-(?:marcel|kim)-v3\.webp/, 'retired banner references stay unloaded');

// Character preference is read from the versioned envelope with the legacy key as fallback.
assert.match(preloader, /denkmal-preferences-v1/, 'reads versioned preference envelope');
assert.match(preloader, /denkmal-character/, 'legacy character key fallback kept');
assert.match(preloader, /saved\?\.data\?\.character\s*===\s*'marcel'\s*\|\|\s*saved\?\.data\?\.character\s*===\s*'kim'/, 'character values validated');

// Hidden scenery must not be downloaded eagerly on mobile (CSS display swap + lazy).
const scene = html.match(/<div class="menu-scene"[\s\S]*?<\/div>/)?.[0] || '';
assert.match(scene, /data-td2-asset="assets\/menu\/memorial-yard-v4\.webp\?v=menu-v4a1"/, 'desktop scenery is assigned after the CDN-aware preload');
assert.match(scene, /data-td2-asset="assets\/menu\/memorial-yard-mobile-v4\.webp\?v=menu-v4a1"/, 'mobile scenery is assigned after the CDN-aware preload');
assert.doesNotMatch(scene, /src="assets\/menu\/memorial-yard-(?:mobile-)?v4\.webp/, 'menu scenery must not start a duplicate local request before preload');

// Cache key bumped for the changed preloader.
assert.match(html, /preloader\.js\?v=preloader-v8-art-20261127/);

// The CSS swap breakpoint stays in sync with the preloader breakpoint.
assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*?menu-scene-mobile/, 'CSS scenery swap at 700px');

console.log('Menu v3b device-aware preloader regression passed');
