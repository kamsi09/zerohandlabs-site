(() => {
  'use strict';
  const slot = document.querySelector('[data-film-slot]');
  if (!slot) return;
  const video = slot.querySelector('video');
  const button = slot.querySelector('.verification-film-play');
  const label = slot.querySelector('.verification-film-play-label');
  const status = slot.querySelector('.verification-film-status');
  const direct = slot.querySelector('.verification-film-direct');
  if (!video || !button || !label || !status || !direct) return;

  let loadingTimer = null;
  const clearLoading = () => {
    clearTimeout(loadingTimer);
    loadingTimer = null;
    button.disabled = false;
  };
  const retry = () => {
    clearLoading();
    video.controls = false;
    button.hidden = false;
    direct.hidden = false;
    button.setAttribute('aria-label', 'Try playing the ZeroHand verification film again');
    label.textContent = 'Try again';
    status.textContent = 'Playback did not start. Try again, or use Open film below.';
    status.hidden = false;
  };

  button.addEventListener('click', () => {
    clearLoading();
    status.hidden = true;
    button.disabled = true;
    label.textContent = 'Loading film';
    if (video.error) video.load();
    loadingTimer = setTimeout(retry, 12000);
    try {
      // Call play in the click handler itself, preserving the iOS user gesture.
      const started = video.play();
      if (started && typeof started.catch === 'function') started.catch(retry);
    } catch (_) {
      retry();
    }
  });
  video.addEventListener('playing', () => {
    clearLoading();
    video.controls = true;
    button.hidden = true;
    direct.hidden = true;
    status.hidden = true;
  });
  video.addEventListener('ended', () => {
    clearLoading();
    video.controls = false;
    button.hidden = false;
    direct.hidden = true;
    status.hidden = true;
    button.setAttribute('aria-label', 'Replay the ZeroHand verification film');
    label.textContent = 'Replay film';
  });
  video.addEventListener('error', retry);
  const source = video.querySelector('source');
  if (source) source.addEventListener('error', retry);
  video.controls = false;
  direct.hidden = true;
  button.hidden = false;
})();
