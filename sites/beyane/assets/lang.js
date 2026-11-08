// Picks the language before the page is drawn, so it never flashes the wrong one.
// Order: ?lang=fr|en in the address, then the visitor's last choice, then the browser's language.
(function () {
  var pick = null;
  try { pick = new URLSearchParams(location.search).get('lang'); } catch (e) { /* old browser */ }
  if (pick !== 'en' && pick !== 'fr') {
    try { pick = localStorage.getItem('beyane-lang'); } catch (e) { pick = null; }
  }
  if (pick !== 'en' && pick !== 'fr') {
    pick = /^fr\b/i.test(navigator.language || '') ? 'fr' : 'en';
  }
  document.documentElement.lang = pick;
  document.documentElement.classList.add('js');
  // The intro plays once per visit; later page views start with the logo already drawn
  try {
    if (sessionStorage.getItem('beyane-intro')) document.documentElement.classList.add('seen');
    else sessionStorage.setItem('beyane-intro', '1');
  } catch (e) { /* private window */ }
})();
