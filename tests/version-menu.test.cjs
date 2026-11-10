'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
const script = html.match(/<script id="td2-version-label">([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'version controller exists');
const metadata = html.match(/<meta name="application-version" content="([^"]+)"/);
assert.ok(metadata, 'canonical version metadata exists');
const elements = Object.fromEntries(['menuVersionTop', 'menuVersion'].map(id => [id, {
  textContent: '',
  attributes: {},
  setAttribute(key, value) { this.attributes[key] = value; },
}]));
const document = {
  querySelector: selector => selector === 'meta[name="application-version"]' ? {content: metadata[1]} : null,
  getElementById: id => elements[id] || null,
};
vm.runInNewContext(script, {document});
assert.equal(elements.menuVersionTop.textContent, 'V5 · ALPHA');
assert.equal(elements.menuVersion.textContent, elements.menuVersionTop.textContent);
assert.equal(elements.menuVersionTop.attributes['aria-label'], 'Spielversion V5 · ALPHA');
console.log('Canonical V5 metadata updates both visible menu labels');
