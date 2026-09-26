// Runs before first paint: picks the motion level once and writes it to <html data-motion>.
//   full  every effect (default)
//   calm  visitor prefers reduced motion: fades, counters and tickers only, nothing slides or zooms
//   off   no scripted motion at all; content is simply there
// ?motion=full|calm|off overrides the system setting for this tab (handy for testing on a phone);
// ?motion=auto clears the override. When motion is on, elements that will animate in start
// hidden; if the main script fails to start within 4s, everything is shown again.
(function () {
  var d = document.documentElement;
  var valid = /^(full|calm|off)$/;
  var level = null;
  try {
    level = new URLSearchParams(window.location.search).get('motion');
  } catch (e) {
    // Very old browser: no URL override.
  }
  try {
    if (level === 'auto') window.sessionStorage.removeItem('motion');
    else if (valid.test(level)) window.sessionStorage.setItem('motion', level);
    else level = window.sessionStorage.getItem('motion');
  } catch (e) {
    // Storage blocked (private mode): the override applies to this page only.
  }
  if (!valid.test(level)) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    level = reduce ? 'calm' : 'full';
  }
  d.setAttribute('data-motion', level);
  if (level === 'off') return;
  d.classList.add('motion');
  window.setTimeout(function () {
    if (!window.__motion) d.classList.remove('motion');
  }, 4000);
})();
