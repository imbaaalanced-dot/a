'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../dist/index.html'), 'utf8');
const script = html.match(/<script id="td2-android-developer-toggle">([\s\S]*?)<\/script>/)[1];
for (const scenario of ['enabled', 'disabled', 'blocked']) {
  const events = [], listeners = {};
  const node = () => ({style: {}, setAttribute() {}, addEventListener() {}});
  const button = {...node(), addEventListener(type, fn) {listeners[type] = fn;}};
  const toast = node();
  const window = {dispatchEvent(event) {events.push(event.detail.enabled);}};
  vm.runInNewContext(script, {
    window,
    document: {querySelector: node, getElementById: id => id === 'menuDeveloperBtn' ? button : toast},
    localStorage: {
      getItem() {if (scenario === 'blocked') throw Error('blocked'); return String(scenario === 'enabled');},
      setItem() {if (scenario === 'blocked') throw Error('blocked');}
    },
    CustomEvent: function(type, options) {this.detail = options.detail;},
    setTimeout() {return 1;}, clearTimeout() {}
  });
  const initial = scenario === 'enabled';
  assert.deepEqual(events, [initial], 'restore must notify the already initialized game');
  listeners.click();
  assert.equal(window.TD2DeveloperMode, !initial);
  assert.equal(events.at(-1), !initial);
  listeners.click();
  assert.equal(window.TD2DeveloperMode, initial);
}
console.log('Developer restore, repeated toggle and denied storage passed');
