// Beyane website: intro, language, header, slideshow, scroll effects and the contact form.
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lang = () => (root.lang === 'fr' ? 'fr' : 'en');

  // ---------- intro (once per visit, any click or key skips it) ----------
  const intro = $('#intro');
  if (intro && !root.classList.contains('seen')) {
    document.body.style.overflow = 'hidden';
    const end = () => {
      if (intro.classList.contains('out')) return;
      intro.classList.add('out');
      document.body.style.overflow = '';
      setTimeout(() => intro.classList.add('gone'), 800);
      startSlides();
    };
    const t = setTimeout(end, reduce ? 300 : 2300);
    const skip = () => { clearTimeout(t); end(); };
    intro.addEventListener('click', skip, { once: true });
    addEventListener('keydown', skip, { once: true });
  } else {
    intro?.classList.add('gone');
    requestAnimationFrame(() => startSlides());
  }

  // ---------- language ----------
  const TITLES = {
    en: 'Beyane — Strategic Ideas | Consulting & Ideation',
    fr: 'Beyane — Idées stratégiques | Consulting & Ideation',
  };
  function applyLang(l) {
    root.lang = l;
    document.title = TITLES[l];
    $$('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === l)));
    $$('option[data-fr]').forEach((o) => { o.dataset.en = o.dataset.en || o.textContent; o.textContent = l === 'fr' ? o.dataset.fr : o.dataset.en; });
  }
  $$('[data-set-lang]').forEach((b) => b.addEventListener('click', () => {
    const l = b.dataset.setLang;
    try { localStorage.setItem('beyane-lang', l); } catch { /* private window */ }
    try {
      const url = new URL(location.href);
      if (l === 'fr') url.searchParams.set('lang', 'fr'); else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    } catch { /* file:// */ }
    applyLang(l);
  }));
  applyLang(lang());
  $('#year').textContent = new Date().getFullYear();

  // ---------- header ----------
  const hdr = $('#hdr');
  const burger = $('#burger');
  const toTop = $('#toTop');
  const setOpen = (open) => {
    hdr.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setOpen(!hdr.classList.contains('open')));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && hdr.classList.contains('open')) { setOpen(false); burger.focus(); } });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  // Current section in the menu
  const links = $$('#nav a:not(.nav-cta)');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((s) => spy.observe(s));
  }

  // ---------- scroll effects ----------
  const band = $('.band');
  const bandImg = $('.band-img');
  const steps = $('#steps');
  const stepItems = $$('.step');
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY;
    hdr.classList.toggle('solid', y > innerHeight * 0.75 - 80 || hdr.classList.contains('open'));
    toTop.classList.toggle('show', y > innerHeight * 1.2);
    if (reduce) return;
    // Quote band: the photo moves slower than the page
    const br = band.getBoundingClientRect();
    if (br.bottom > 0 && br.top < innerHeight) bandImg.style.transform = `translateY(${(br.top + br.height / 2 - innerHeight / 2) * -0.12}px)`;
    // Approach: the orange line follows the reader down the steps
    const sr = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - sr.top) / sr.height));
    steps.style.setProperty('--progress', p.toFixed(3));
    stepItems.forEach((li) => li.classList.toggle('lit', li.getBoundingClientRect().top < innerHeight * 0.6));
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  if (reduce) { steps.style.setProperty('--progress', 1); stepItems.forEach((li) => li.classList.add('lit')); }

  // Reveal on scroll, staggered inside grids
  $$('.svc-grid, .pillars, .coords, .steps').forEach((g) => [...g.children].forEach((el, i) => el.style.setProperty('--d', `${i * 0.12}s`)));
  const items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add('in'));

  // ---------- slideshow ----------
  const hero = $('.hero');
  const slides = $$('.slide');
  const dots = $$('.dot');
  const now = $('#slideNow');
  const live = $('#slides');
  const pauseBtn = $('#pauseBtn');
  const MS = 6500;
  hero.style.setProperty('--slide-ms', `${MS}ms`);
  let index = 0;
  let timer = null;
  let started = false;
  let userPaused = reduce; // reduced motion: no automatic changes
  let hover = false;

  function show(i, byUser = false) {
    const n = slides.length;
    index = (i + n) % n;
    slides.forEach((s, k) => {
      const on = k === index;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', String(!on));
      s.inert = !on;
    });
    dots.forEach((d, k) => {
      d.classList.toggle('is-active', k === index);
      d.classList.toggle('is-done', k < index);
      if (k === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      // restart the progress bar
      const bar = d.querySelector('i');
      bar.replaceWith(bar.cloneNode(true));
    });
    now.textContent = String(index + 1).padStart(2, '0');
    live.setAttribute('aria-live', byUser ? 'polite' : 'off');
    schedule();
  }
  function running() { return started && !userPaused && !hover && !document.hidden; }
  function schedule() {
    clearTimeout(timer);
    hero.classList.toggle('paused', !running());
    if (running()) timer = setTimeout(() => show(index + 1), MS);
  }
  function startSlides() {
    if (started) return;
    started = true;
    if (userPaused) { hero.classList.add('paused'); pauseBtn.setAttribute('aria-pressed', 'true'); }
    show(0);
  }
  $('#nextBtn').addEventListener('click', () => show(index + 1, true));
  $('#prevBtn').addEventListener('click', () => show(index - 1, true));
  dots.forEach((d) => d.addEventListener('click', () => show(Number(d.dataset.go), true)));
  pauseBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    schedule();
  });
  // Pause while the pointer or keyboard focus is on the slideshow, or the tab is hidden
  hero.addEventListener('mouseenter', () => { hover = true; schedule(); });
  hero.addEventListener('mouseleave', () => { hover = false; schedule(); });
  hero.addEventListener('focusin', () => { hover = true; schedule(); });
  hero.addEventListener('focusout', (e) => { if (!hero.contains(e.relatedTarget)) { hover = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1, true); }
  });
  // Swipe on phones and tablets
  let x0 = null;
  hero.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
  hero.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), true);
  });

  // ---------- contact form: opens the visitor's e-mail app ----------
  const form = $('#form');
  const err = $('#formError');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const bad = [];
    if (!d.name.trim()) bad.push('name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) bad.push('email');
    if (!d.message.trim()) bad.push('message');
    $$('input, textarea', form).forEach((el) => el.setAttribute('aria-invalid', String(bad.includes(el.name))));
    err.hidden = !bad.length;
    if (bad.length) { form.elements[bad[0]].focus(); return; }
    const fr = lang() === 'fr';
    const service = form.elements.service.selectedOptions[0].textContent;
    const subject = `${fr ? 'Demande' : 'Inquiry'} — ${service} — ${d.company.trim() || d.name.trim()}`;
    const body = [
      d.message.trim(),
      '',
      '—',
      `${fr ? 'Nom' : 'Name'} : ${d.name.trim()}`,
      d.company.trim() ? `${fr ? 'Entreprise' : 'Company'} : ${d.company.trim()}` : '',
      `E-mail : ${d.email.trim()}`,
      d.phone.trim() ? `${fr ? 'Téléphone' : 'Phone'} : ${d.phone.trim()}` : '',
      `Service : ${service}`,
    ].filter((l, i) => l !== '' || i === 1).join('\n');
    location.href = `mailto:contact@beyane-dz.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
