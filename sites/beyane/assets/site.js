// Beyane website: intro, language, header, slideshow, scroll effects, services, approach and the contact form.
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lang = () => (root.lang === 'fr' ? 'fr' : 'en');
  const T = (en, fr) => (lang() === 'fr' ? fr : en);

  // ---------- toast ----------
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

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

  // ---------- headings rise word by word (both languages) ----------
  function splitWords(el) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.style.setProperty('--i', i++);
            inner.textContent = part;
            w.append(inner);
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
    el.classList.add('split');
  }
  if (!reduce) $$('.sec h2.reveal, .band blockquote.reveal').forEach(splitWords);

  // ---------- language ----------
  const TITLES = {
    en: 'Beyane — Strategic Ideas | Consulting & Ideation',
    fr: 'Beyane — Idées stratégiques | Consulting & Ideation',
  };
  function applyLang(l) {
    root.lang = l;
    document.title = TITLES[l];
    $$('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === l)));
  }
  $$('[data-set-lang]').forEach((b) => b.addEventListener('click', () => {
    const l = b.dataset.setLang;
    if (l === lang()) return;
    try { localStorage.setItem('beyane-lang', l); } catch { /* private window */ }
    try {
      const url = new URL(location.href);
      if (l === 'fr') url.searchParams.set('lang', 'fr'); else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    } catch { /* file:// */ }
    if (!reduce) {
      document.body.classList.remove('lang-fade');
      void document.body.offsetWidth;
      document.body.classList.add('lang-fade');
      setTimeout(() => applyLang(l), 150);
      setTimeout(() => document.body.classList.remove('lang-fade'), 500);
    } else applyLang(l);
  }));
  applyLang(lang());
  $('#year').textContent = new Date().getFullYear();

  // ---------- header ----------
  const hdr = $('#hdr');
  const burger = $('#burger');
  const toTop = $('#toTop');
  const setOpen = (open) => {
    hdr.classList.toggle('open', open);
    hdr.classList.remove('away');
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setOpen(!hdr.classList.contains('open')));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && hdr.classList.contains('open')) { setOpen(false); burger.focus(); } });
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  // Keyboard users always get the header back
  hdr.addEventListener('focusin', () => hdr.classList.remove('away'));

  const links = $$('#nav a:not(.nav-cta)');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((s) => spy.observe(s));
  }

  // ---------- scroll effects ----------
  const progress = $('#progress');
  const ring = $('#toTop');
  const band = $('.band');
  const bandImg = $('.band-img');
  const steps = $('#steps');
  const stepItems = $$('.step');
  const symbol = $('#approachSymbol');
  const stageNum = $('#stageNum');
  let lastY = scrollY;
  let ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    const read = max > 0 ? Math.min(1, y / max) : 0;
    progress.style.transform = `scaleX(${read})`;
    ring.style.setProperty('--read', (1 - read).toFixed(3));
    hdr.classList.toggle('solid', y > innerHeight * 0.75 - 80 || hdr.classList.contains('open'));
    // Hide the header while reading down, bring it back on the way up
    if (!hdr.classList.contains('open') && !hdr.contains(document.activeElement)) {
      if (y > innerHeight && y > lastY + 6) hdr.classList.add('away');
      else if (y < lastY - 6 || y < innerHeight) hdr.classList.remove('away');
    }
    lastY = y;
    toTop.classList.toggle('show', y > innerHeight * 1.2);

    // Approach: the line, the steps and the symbol follow the reader
    const sr = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - sr.top) / sr.height));
    steps.style.setProperty('--progress', reduce ? 1 : p.toFixed(3));
    let lit = 0;
    stepItems.forEach((li, i) => { const on = reduce || li.getBoundingClientRect().top < innerHeight * 0.6; li.classList.toggle('lit', on); if (on) lit = i + 1; });
    steps.classList.toggle('engaged', lit > 0 && lit < stepItems.length);
    symbol.dataset.step = String(lit);
    stageNum.textContent = String(Math.max(1, lit)).padStart(2, '0');

    if (reduce) return;
    const br = band.getBoundingClientRect();
    if (br.bottom > 0 && br.top < innerHeight) bandImg.style.transform = `translateY(${(br.top + br.height / 2 - innerHeight / 2) * -0.12}px)`;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // Reveal on scroll, staggered inside grids
  $$('.svc-grid, .pillars, .coords, .steps').forEach((g) => [...g.children].forEach((el, i) => el.style.setProperty('--d', `${i * 0.12}s`)));
  const items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add('in'));

  // Ribbon: two copies make the loop seamless
  const ribbon = $('#ribbon');
  ribbon.append(...[...ribbon.children].map((n) => n.cloneNode(true)));

  // ---------- slideshow ----------
  const hero = $('.hero');
  const slides = $$('.slide');
  const dots = $$('.dot');
  const now = $('#slideNow');
  const live = $('#slides');
  const pauseBtn = $('#pauseBtn');
  const wipe = $('#wipe');
  const MS = 6500;
  hero.style.setProperty('--slide-ms', `${MS}ms`);
  let index = 0;
  let timer = null;
  let started = false;
  let userPaused = reduce; // reduced motion: no automatic changes
  let hover = false;

  function show(i, byUser = false) {
    const n = slides.length;
    const next = (i + n) % n;
    const changing = started && next !== index;
    index = next;
    if (changing && !reduce) {
      wipe.classList.remove('go');
      void wipe.offsetWidth;
      wipe.classList.add('go');
    }
    const apply = () => {
      slides.forEach((s, k) => {
        const on = k === index;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
        s.inert = !on;
      });
    };
    // The new slide appears while the orange sweep covers the screen
    if (changing && !reduce) setTimeout(apply, 380); else apply();
    dots.forEach((d, k) => {
      d.classList.toggle('is-active', k === index);
      d.classList.toggle('is-done', k < index);
      if (k === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
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
    if (userPaused) { hero.classList.add('paused'); pauseBtn.setAttribute('aria-pressed', 'true'); }
    show(0);
    started = true;
    schedule();
  }
  $('#nextBtn').addEventListener('click', () => show(index + 1, true));
  $('#prevBtn').addEventListener('click', () => show(index - 1, true));
  dots.forEach((d) => d.addEventListener('click', () => show(Number(d.dataset.go), true)));
  pauseBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    schedule();
  });
  hero.addEventListener('mouseenter', () => { hover = true; schedule(); });
  hero.addEventListener('mouseleave', () => {
    hover = false;
    schedule();
    hero.style.removeProperty('--px'); hero.style.removeProperty('--py');
    $$('.slide-text').forEach((t) => { t.style.translate = ''; });
  });
  hero.addEventListener('focusin', () => { hover = true; schedule(); });
  hero.addEventListener('focusout', (e) => { if (!hero.contains(e.relatedTarget)) { hover = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1, true); }
  });
  let x0 = null;
  hero.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
  hero.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), true);
  });
  // The photo and the text drift slightly with the mouse
  if (finePointer && !reduce) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--px', `${(-dx * 18).toFixed(1)}px`);
      hero.style.setProperty('--py', `${(-dy * 12).toFixed(1)}px`);
      const t = $('.slide.is-active .slide-text');
      if (t) t.style.translate = `${(dx * 10).toFixed(1)}px ${(dy * 6).toFixed(1)}px`;
    });
  }

  // ---------- services: tilt, and "Request this service" ----------
  if (finePointer && !reduce) {
    $$('.svc').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('tilting');
        card.style.transform = `perspective(900px) rotateX(${(-dy * 5).toFixed(2)}deg) rotateY(${(dx * 6).toFixed(2)}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => { card.classList.remove('tilting'); card.style.transform = ''; });
    });
    // Main buttons lean toward the pointer
    $$('.btn-sun, .btn-dark, .nav-cta').forEach((b) => {
      b.classList.add('magnetic');
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${((e.clientX - r.left) / r.width - 0.5) * 8}px, ${((e.clientY - r.top) / r.height - 0.5) * 6}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }

  const form = $('#form');
  $$('.svc-cta').forEach((a) => a.addEventListener('click', () => {
    const radio = form.querySelector(`input[name="service"][value="${a.dataset.service}"]`);
    if (radio) radio.checked = true;
    setTimeout(() => {
      form.classList.remove('flash');
      void form.offsetWidth;
      form.classList.add('flash');
      form.elements.name.focus({ preventScroll: true });
    }, reduce ? 0 : 700);
  }));

  // ---------- copy buttons ----------
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  }
  $$('.copy').forEach((b) => b.addEventListener('click', async () => {
    const ok = await copyText(b.dataset.copy);
    toast(ok ? T(`Copied: ${b.dataset.copy}`, `Copié : ${b.dataset.copy}`) : b.dataset.copy);
  }));

  // ---------- contact form: opens the visitor's e-mail app ----------
  const err = $('#formError');
  const done = $('#formDone');
  const counter = $('#counter');
  const message = form.elements.message;
  const MAX = Number(message.getAttribute('maxlength')) || 1500;
  const count = () => {
    counter.textContent = `${message.value.length} / ${MAX}`;
    counter.classList.toggle('near', message.value.length > MAX * 0.85);
  };
  message.addEventListener('input', count);
  count();
  // Fields clear their error as soon as they are corrected
  $$('input, textarea', form).forEach((el) => el.addEventListener('input', () => {
    if (el.getAttribute('aria-invalid') === 'true') el.setAttribute('aria-invalid', 'false');
  }));

  const LABELS = {
    service: {
      communication: ['Corporate Communication', 'Communication corporate'],
      branding: ['Corporate Branding', "Image de marque d'entreprise"],
      personal: ['Personal Branding for Executives', 'Personal branding pour dirigeants'],
      other: ['Something else', 'Autre chose'],
    },
    when: {
      asap: ['As soon as possible', 'Dès que possible'],
      soon: ['Within 3 months', "D'ici 3 mois"],
      exploring: ['Just exploring', 'Je me renseigne'],
    },
  };
  const label = (group, value) => (LABELS[group][value] ? LABELS[group][value][lang() === 'fr' ? 1 : 0] : '');
  let lastMessage = '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const bad = [];
    if (!String(d.name || '').trim()) bad.push('name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.email || '').trim())) bad.push('email');
    if (!String(d.message || '').trim()) bad.push('message');
    $$('input:not([type=radio]), textarea', form).forEach((el) => el.setAttribute('aria-invalid', String(bad.includes(el.name))));
    err.hidden = !bad.length;
    if (bad.length) { form.elements[bad[0]].focus(); return; }
    const fr = lang() === 'fr';
    const service = label('service', d.service);
    const when = d.when ? label('when', d.when) : '';
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
      when ? `${fr ? 'Démarrage' : 'Start'} : ${when}` : '',
    ].filter((l, i) => l !== '' || i === 1).join('\n');
    lastMessage = `${subject}\n\n${body}`;
    location.href = `mailto:contact@beyane-dz.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    done.hidden = false;
    done.focus();
  });
  $('#copyMsg').addEventListener('click', async () => {
    const ok = await copyText(lastMessage);
    toast(ok ? T('Message copied. Paste it into an e-mail to contact@beyane-dz.com', 'Message copié. Collez-le dans un e-mail à contact@beyane-dz.com') : T('Copy did not work in this browser', "La copie n'a pas fonctionné dans ce navigateur"));
  });
  $('#newMsg').addEventListener('click', () => {
    form.reset();
    count();
    done.hidden = true;
    form.elements.name.focus();
  });
})();
