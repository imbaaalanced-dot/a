'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'menu.css'), 'utf8');
const preloader = fs.readFileSync(path.join(root, 'preloader.js'), 'utf8');

// The preloader must load the scenery variant the viewport will actually show.
assert.match(preloader, /matchMedia\('\(max-width:700px\)'\)/, 'preloader picks scenery per viewport');
assert.match(preloader, /memorial-yard-mobile-style2\.webp/, 'mobile scenery referenced by preloader');
assert.match(preloader, /memorial-yard-style2\.webp/, 'desktop scenery referenced by preloader');

// Only the saved hero banner is preloaded; the other loads on demand in game.js.
assert.match(preloader, /character\s*===\s*'kim'\s*\?\s*'kim-marksman-v6\.webp'\s*:\s*'marcel-guardian-v6\.webp'/, 'approved hero art is selected per character');
assert.doesNotMatch(preloader, /hero-banner-(?:marcel|kim)-v3\.webp/, 'retired banner references stay unloaded');

// Character preference is read from the versioned envelope with the legacy key as fallback.
assert.match(preloader, /denkmal-preferences-v1/, 'reads versioned preference envelope');
assert.match(preloader, /denkmal-character/, 'legacy character key fallback kept');
assert.match(preloader, /character === 'marcel' \|\| envelope\.data\.character === 'kim'|envelope\.data\.character === 'marcel' \|\| envelope\.data\.character === 'kim'/, 'character values validated');

// Hidden scenery must not be downloaded eagerly on mobile (CSS display swap + lazy).
const scene = html.match(/<div class="menu-scene"[\s\S]*?<\/div>/)?.[0] || '';
assert.match(scene, /memorial-yard-v3\.webp[^>]*loading="lazy"/, 'desktop scenery is lazy');
assert.match(scene, /memorial-yard-mobile-v3\.webp[^>]*loading="lazy"/, 'mobile scenery is lazy');

// Cache key bumped for the changed preloader.
assert.match(html, /preloader\.js\?v=copy-20261110a/);

// The CSS swap breakpoint stays in sync with the preloader breakpoint.
assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*?menu-scene-mobile/, 'CSS scenery swap at 700px');

console.log('Menu v3b device-aware preloader regression passed');
