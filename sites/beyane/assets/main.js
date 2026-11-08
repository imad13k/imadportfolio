// Language switch, the mail link's subject, and the year.
(() => {
  const root = document.documentElement;
  const SUBJECT = { en: 'Beyane — Project inquiry', fr: 'Beyane — Demande de projet' };
  const META = {
    en: { title: 'Beyane — Strategic Ideas | Consulting & Ideation', locale: 'en_US' },
    fr: { title: 'Beyane — Idées stratégiques | Consulting & Ideation', locale: 'fr_FR' },
  };
  const mail = document.getElementById('mailBtn');

  function apply(lang) {
    root.lang = lang;
    document.title = META[lang].title;
    document.querySelectorAll('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === lang)));
    mail.href = `mailto:contact@beyane-dz.com?subject=${encodeURIComponent(SUBJECT[lang])}`;
  }

  document.querySelectorAll('[data-set-lang]').forEach((b) => b.addEventListener('click', () => {
    const lang = b.dataset.setLang;
    try { localStorage.setItem('beyane-lang', lang); } catch { /* private window */ }
    // Keep the address shareable in the chosen language
    try {
      const url = new URL(location.href);
      if (lang === 'fr') url.searchParams.set('lang', 'fr'); else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    } catch { /* file:// or old browser */ }
    apply(lang);
  }));

  apply(root.lang === 'fr' ? 'fr' : 'en');
  document.getElementById('year').textContent = new Date().getFullYear();
})();
