export function bindShopToggle(app, button) {
  if (!app || !button) return false;
  button.addEventListener('click', () => {
    const collapsed = app.classList.toggle('shop-collapsed');
    button.setAttribute('aria-expanded', String(!collapsed));
    button.textContent = collapsed ? '⚡ UPGRADES' : '× UPGRADES SCHLIESSEN';
  });
  return true;
}
