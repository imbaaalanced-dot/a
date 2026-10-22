export function bindPortraitShop({layout, toggle, media, document:doc}) {
  if (!layout || !toggle || !media || !doc) return false;
  let open = false;
  const sync = () => {
    const active = media.matches;
    layout.classList.toggle('portrait-shop-open', active && open);
    toggle.hidden = !active;
    toggle.setAttribute('aria-expanded', String(active && open));
    toggle.textContent = open ? '✕ Schließen' : '⚙ Upgrades';
  };
  toggle.addEventListener('click', () => {
    if (!media.matches) return;
    open = !open;
    sync();
  });
  media.addEventListener('change', () => {
    open = false;
    sync();
  });
  doc.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !media.matches || !open) return;
    open = false;
    sync();
    toggle.focus();
  });
  sync();
  return true;
}
