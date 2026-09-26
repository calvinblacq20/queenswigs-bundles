// Runs before first paint: hide elements that will animate in, but only when motion is wanted.
// If the main script fails to start within 4s, everything is shown again.
(function () {
  var d = document.documentElement;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  d.classList.add('motion');
  window.setTimeout(function () {
    if (!window.__motion) d.classList.remove('motion');
  }, 4000);
})();
