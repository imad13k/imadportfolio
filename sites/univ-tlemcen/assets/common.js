// Shared header, footer, search palette and scroll effects for every page of the redesign.
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const page = document.body.dataset.page || 'home';
  const D = window.UT;

  // discipline icon + colour class for each faculty domain
  const DISC = {
    'Sciences & technologies': ['d-sci', '<path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>'],
    'Santé': ['d-sante', '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>'],
    'Économie & droit': ['d-eco', '<path d="M12 3v18M5 21h14M4 7h16M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>'],
    'Lettres & sciences humaines': ['d-let', '<path d="M4 5a2 2 0 0 1 2-2h5v16H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2z"/>'],
  };
  window.utDisc = domain => {
    const [cls, path] = DISC[domain] || DISC['Sciences & technologies'];
    return { cls, icon: `<span class="disc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">${path}</svg></span>` };
  };

  // ---------- header ----------
  const links = [['home', 'index.html', 'Accueil'], ['univ', 'index.html#universite', 'L\'université'], ['fac', 'facultes.html', 'Facultés'],
    ['rech', 'index.html#recherche', 'Recherche'], ['news', 'actualites.html', 'Actualités'], ['serv', 'services.html', 'Services numériques']];
  $('#site-header').outerHTML = `
  <a class="skip" href="#main">Aller au contenu</a>
  <div class="ministry"><div class="wrap"><span class="flag" aria-hidden="true"><i></i><i></i></span><span>République Algérienne Démocratique et Populaire</span><span class="sep" aria-hidden="true"></span><span class="m2">Ministère de l'Enseignement Supérieur et de la Recherche Scientifique</span></div></div>
  <div class="util"><div class="wrap">
    <nav aria-label="Accès rapides"><a href="https://ent.univ-tlemcen.dz/uPortal/f/welcome/normal/render.uP" target="_blank" rel="noopener">ENT</a><a href="https://elearn.univ-tlemcen.dz/" target="_blank" rel="noopener">E-learning</a><a href="https://bu.univ-tlemcen.dz/" target="_blank" rel="noopener">Bibliothèque</a><a href="services.html#annuaire">Annuaire</a><a href="actualites.html">Agenda</a></nav>
    <div class="lang"><a class="on" href="#">FR</a><a href="#" lang="ar">ع</a><a href="#">EN</a></div>
  </div></div>
  <header class="hdr" id="hdr"><div class="wrap">
    <a class="logo" href="index.html"><img src="assets/img/logo-fr.png" alt="Université Abou Bekr Belkaïd — Tlemcen" width="370" height="100"><span class="since">Fondée en<b>1989</b></span></a>
    <nav class="nav" id="nav">${links.map(([k, u, l]) => `<a href="${u}"${k === page ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
    <button class="search-btn" id="openSearch" aria-label="Rechercher"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg><span>Rechercher</span><kbd>Ctrl K</kbd></button>
    <button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div></header>`;

  // ---------- footer ----------
  $('#site-footer').outerHTML = `
  <footer><div class="wrap">
    <div class="ft">
      <div><span class="logo-w"><img src="assets/img/logo-fr.png" alt="Université de Tlemcen" width="370" height="100"></span>
        <p>22, rue Abi Ayed Abdelkrim, Fg Pasteur<br>B.P 119 — 13000 Tlemcen, Algérie<br>Tél. 043 41 11 89</p>
        <p style="font:600 11px var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--gold-2)">Établissement public · Fondé en 1989</p></div>
      <div><h4>Université</h4><ul><li><a href="index.html#universite">Présentation</a></li><li><a href="facultes.html">Facultés et instituts</a></li><li><a href="index.html#recherche">Recherche</a></li><li><a href="services.html#annuaire">Rectorat et contacts</a></li></ul></div>
      <div><h4>Étudiants</h4><ul><li><a href="https://cf.univ-tlemcen.dz/offreFormation/" target="_blank" rel="noopener">Carte de formation</a></li><li><a href="services.html">Services numériques</a></li><li><a href="https://bu.univ-tlemcen.dz/" target="_blank" rel="noopener">Bibliothèque</a></li><li><a href="facultes.html#orientation">M'orienter</a></li></ul></div>
      <div><h4>Suivre</h4><ul><li><a href="actualites.html">Actualités et agenda</a></li><li><a href="http://webtv.univ-tlemcen.dz/" target="_blank" rel="noopener">Web TV</a></li><li><a href="https://www.univ-tlemcen.dz/fr" target="_blank" rel="noopener">Site officiel actuel ↗</a></li></ul></div>
    </div>
    <div class="ft-b"><span>© ${new Date().getFullYear()} Université Abou Bekr Belkaïd — Tlemcen</span><span>Concept de refonte · projet non officiel</span></div>
  </div></footer>`;

  addEventListener('scroll', () => $('#hdr').classList.toggle('sc', scrollY > 10), { passive: true });
  const nav = $('#nav'), burger = $('#burger');
  burger.onclick = () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
  nav.onclick = e => { if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); } };

  // ---------- command palette: one search for pages, faculties, services and news ----------
  const items = [
    ...D.pages.map(p => ({ g: 'Pages', n: p.n, s: '', url: p.url, ic: p.ic })),
    ...D.faculties.map(f => ({ g: 'Facultés', n: f.n, s: `${f.short} · ${f.tel}`, url: `facultes.html#${f.id}`, ic: '🎓', k: f.tags.join(' ') })),
    ...D.platforms.map(p => ({ g: 'Services numériques', n: p.n, s: p.d, url: p.url, ic: p.ic, ext: true })),
    ...D.news.map(n => ({ g: 'Actualités', n: n.t, s: n.cat, url: `actualites.html#${n.id}`, ic: '📰' })),
    ...D.contacts.map(c => ({ g: 'Contacts', n: c.n, s: [c.mail, c.tel].filter(Boolean).join(' · '), url: 'services.html#annuaire', ic: '☎️' })),
  ];
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const bg = document.createElement('div');
  bg.className = 'cmdk-bg'; bg.setAttribute('role', 'dialog'); bg.setAttribute('aria-modal', 'true'); bg.setAttribute('aria-label', 'Recherche');
  bg.innerHTML = `<div class="cmdk"><div class="cmdk-in"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg><input id="cmdkQ" placeholder="Une faculté, un service, une actualité…" autocomplete="off" aria-label="Rechercher"><kbd>Échap</kbd></div><div class="cmdk-list" id="cmdkList" role="listbox"></div><div class="cmdk-foot"><span>↑↓ naviguer</span><span>↵ ouvrir</span><span>Échap fermer</span></div></div>`;
  document.body.append(bg);
  let sel = 0, shown = [];
  function render() {
    const q = norm($('#cmdkQ').value.trim());
    shown = (q ? items.filter(i => norm(`${i.n} ${i.s} ${i.k || ''} ${i.g}`).includes(q)) : items.filter(i => i.g === 'Pages' || i.g === 'Services numériques').slice(0, 12)).slice(0, 40);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    let last = '', html = '';
    shown.forEach((i, k) => {
      if (i.g !== last) { html += `<div class="cmdk-grp">${i.g}</div>`; last = i.g; }
      html += `<div class="cmdk-item${k === sel ? ' sel' : ''}" role="option" aria-selected="${k === sel}" data-k="${k}"><span class="ic">${i.ic}</span><span><b>${esc(i.n)}</b>${i.s ? `<small>${esc(i.s)}</small>` : ''}</span>${i.ext ? '<span class="ext">↗</span>' : ''}</div>`;
    });
    $('#cmdkList').innerHTML = html || `<div class="cmdk-empty">Aucun résultat pour « ${esc($('#cmdkQ').value)} »</div>`;
    $('#cmdkList .sel')?.scrollIntoView({ block: 'nearest' });
  }
  function go(i) { if (!i) return; close(); if (i.ext) window.open(i.url, '_blank', 'noopener'); else location.href = i.url; }
  function open() { bg.classList.add('open'); $('#cmdkQ').value = ''; sel = 0; render(); setTimeout(() => $('#cmdkQ').focus(), 30); document.body.style.overflow = 'hidden'; }
  function close() { bg.classList.remove('open'); document.body.style.overflow = ''; }
  window.UTSearch = { open };
  $('#openSearch').onclick = open;
  bg.onclick = e => { if (e.target === bg) close(); const it = e.target.closest('.cmdk-item'); if (it) go(shown[+it.dataset.k]); };
  $('#cmdkQ').oninput = () => { sel = 0; render(); };
  addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); bg.classList.contains('open') ? close() : open(); return; }
    if (e.key === '/' && !bg.classList.contains('open') && !e.target.closest('input,textarea,select')) { e.preventDefault(); open(); return; }
    if (!bg.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); render(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); render(); }
    if (e.key === 'Enter') { e.preventDefault(); go(shown[sel]); }
  });

  // ---------- toast + reveal ----------
  window.utToast = msg => {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
  };
  window.utReveal = () => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
    document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
  };
  window.utReveal();
})();
