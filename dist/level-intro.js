(() => {
  'use strict';
  // Level-Intro-Videos (Kampagne): zentrales Overlay statt Eigenbau in game.js.
  // Mobile-Regeln: kein Preload, Decoder-Freigabe beim Schließen, Ton folgt dem
  // TON-AN/AUS-Schalter, und ein blockierter Autoplay-Start wird über den
  // INTRO-STARTEN-Buttons abfangbar (WebView-Geste).
  // Der Asset-Pfad wird bewusst zusammengesetzt: Das Video landet als separater
  // Binär-Upload in dist/assets/intro/ und ist optional. Fehlt es, schließt das
  // Overlay über den video-error-Fallback ohne die Wacht zu blockieren.
  const INTRO_VIDEOS = {
    3: {
      kicker: 'KAPITEL III',
      title: 'KRIEGERDENKMAL KIRCHENDE',
      src: ['assets/intro/', 'kirchende-intro-v1', '.mp4']
    }
  };
  let api = null, overlay = null, video = null, continueButton = null, current = null;
  let continueState = 'hidden';
  const seen = new Set();
  function $(id) { return document.getElementById(id); }
  function setContinue(mode, label) {
    continueState = mode;
    if (label) continueButton.textContent = label;
    continueButton.classList.toggle('hidden', mode === 'hidden');
  }
  function stopVideo() {
    // Gibt Puffer und Software-Decoder auf 4-GB-Geräten sofort frei.
    try { video.pause(); } catch {}
    try { video.removeAttribute('src'); video.load(); } catch {}
  }
  function hideOverlay() {
    current = null;
    stopVideo();
    overlay.classList.add('hidden');
    setContinue('hidden');
  }
  function close() {
    if (!current) return false;
    hideOverlay();
    if (api && api.getState() === 'levelintro') api.setState('playing');
    api?.focusGame?.();
    api?.updateUI?.();
    return true;
  }
  function attemptPlay() {
    if (!current) return;
    video.muted = api ? !api.soundOn() : true;
    setContinue('hidden');
    let started = null;
    try { started = video.play(); } catch {}
    if (started && typeof started.catch === 'function') {
      started.then(() => setContinue('hidden')).catch(() => setContinue('play', 'INTRO STARTEN'));
    }
  }
  function show(level) {
    const entry = INTRO_VIDEOS[level];
    if (!entry || !api || !overlay || seen.has(level) || api.getState() !== 'playing') return false;
    seen.add(level);
    current = level;
    $('levelIntroKicker').textContent = entry.kicker;
    $('levelIntroTitle').textContent = entry.title;
    video.src = entry.src.join('');
    overlay.classList.remove('hidden');
    api.clearInput();
    api.setState('levelintro');
    api.focusModal(overlay);
    api.updateUI();
    attemptPlay();
    return true;
  }
  function stop() { if (current) hideOverlay(); }
  function init(nextApi) {
    if (nextApi) api = nextApi;
    if (!api) return;
    overlay = $('levelIntroScreen');
    video = $('levelIntroVideo');
    continueButton = $('levelIntroContinue');
    if (!overlay || !video || !continueButton) return;
    video.addEventListener('play', () => setContinue('hidden'));
    video.addEventListener('pause', () => { if (current && !video.ended) setContinue('resume', 'WEITER'); });
    video.addEventListener('ended', () => setContinue('done', 'WEITER ZUR WACHT'));
    video.addEventListener('error', () => {
      if (close()) api.showToast?.('Intro nicht verfügbar · die Wacht beginnt');
    });
    $('levelIntroSkip').addEventListener('click', () => close());
    continueButton.addEventListener('click', () => { if (continueState === 'done') close(); else attemptPlay(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && current) { try { video.pause(); } catch {} } });
  }
  globalThis.DenkmalLevelIntro = { init, show, close, stop };
})();
