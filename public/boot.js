// Runs before first paint. Resolves the motion level once into <html data-motion>; CSS and JS read
// that attribute, never the media query, so they can't disagree.
//   full: nothing requested, everything runs
//   calm: reduced motion requested (also iOS Low Power Mode), fades and ambient loops only
//   off:  no JavaScript (the attribute never gets set past the markup default)
// ?motion=full|calm|off overrides it, to tell a device setting apart from a bug.
// If the main script fails to start within 4s, hidden content is shown again.
(function () {
  var d = document.documentElement;
  var level = 'full';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) level = 'calm';
  var forced = /[?&]motion=(full|calm|off)\b/.exec(window.location.search);
  if (forced) level = forced[1];
  d.setAttribute('data-motion', level);
  if (level === 'off') return;
  d.classList.add('motion');
  window.setTimeout(function () {
    if (!window.__motion) d.classList.remove('motion');
  }, 4000);
})();
