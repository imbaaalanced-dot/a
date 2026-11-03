/* PR87 preview only: keep test saves separate from the normal game. */
(() => {
  'use strict';
  let native;
  try { native = window.localStorage; } catch { return; }
  const prefix = 'td2-preview-pr87:';
  function keys() {
    const result = [];
    for (let i = 0; i < native.length; i++) {
      const key = native.key(i);
      if (key && key.startsWith(prefix)) result.push(key.slice(prefix.length));
    }
    return result;
  }
  const storage = {
    getItem(key) { return native.getItem(prefix + String(key)); },
    setItem(key, value) { native.setItem(prefix + String(key), String(value)); },
    removeItem(key) { native.removeItem(prefix + String(key)); },
    clear() { for (const key of keys()) native.removeItem(prefix + key); },
    key(index) { return keys()[index] ?? null; },
    get length() { return keys().length; }
  };
  Object.defineProperty(window, 'localStorage', {configurable: true, get: () => storage});
})();
