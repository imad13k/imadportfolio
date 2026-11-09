// Decides before the page is drawn whether the intro plays: once per visit, never for reduced motion.
(function () {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('egsa-intro')) return;
    sessionStorage.setItem('egsa-intro', '1');
    document.documentElement.classList.add('intro-on');
  } catch (e) { /* private window: no intro */ }
})();
