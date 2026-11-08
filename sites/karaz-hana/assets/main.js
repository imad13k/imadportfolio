// Karaz Hana — shared behaviour for every page.
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = 'hanane.kaitri@gmail.com';

  // ---------- intro: the rose draws itself, once per visit ----------
  const intro = $('#intro');
  if (intro && !root.classList.contains('seen')) {
    const end = () => { intro.classList.add('out'); setTimeout(() => intro.remove(), 900); };
    const t = setTimeout(end, reduce ? 0 : 2600);
    intro.addEventListener('click', () => { clearTimeout(t); end(); }, { once: true });
  } else intro?.remove();

  // ---------- header ----------
  const hdr = $('#hdr');
  const burger = $('#burger');
  burger?.addEventListener('click', () => {
    const open = !hdr.classList.contains('open');
    hdr.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && hdr.classList.contains('open')) { hdr.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.focus(); } });
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (!hdr.classList.contains('open') && !hdr.contains(document.activeElement)) {
      if (y > 400 && y > lastY + 8) hdr.classList.add('away');
      else if (y < lastY - 8 || y < 400) hdr.classList.remove('away');
    }
    lastY = y;
  }, { passive: true });

  // Page changes: a soft pink circle grows from where you clicked
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  document.body.append(curtain);
  if (!reduce) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !url.pathname.endsWith('.html') || url.pathname === location.pathname) return;
      e.preventDefault();
      curtain.style.setProperty('--cx', `${e.clientX}px`);
      curtain.style.setProperty('--cy', `${e.clientY}px`);
      curtain.classList.add('on');
      setTimeout(() => { location.href = url.href; }, 520);
    });
    addEventListener('pageshow', () => curtain.classList.remove('on'));
  }

  // ---------- reveal on scroll ----------
  $$('[data-stagger]').forEach((g) => [...g.children].forEach((el, i) => el.style.setProperty('--d', `${i * 0.09}s`)));
  const items = $$('.reveal, .pop, .wc');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add('in'));

  // ---------- "Lire plus" ----------
  $$('.read-more').forEach((b) => {
    const box = document.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click', () => {
      const open = !box.classList.contains('open');
      box.classList.toggle('open', open);
      b.setAttribute('aria-expanded', String(open));
      b.textContent = open ? 'Lire moins' : 'Lire plus';
    });
  });

  // ---------- gallery tabs ----------
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        panel.classList.toggle('show', on);
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          select(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length], true);
        }
      });
    });
  });
  $$('.panel, .masonry').forEach((p) => $$('.tile', p).forEach((t, i) => t.style.setProperty('--i', i)));

  // ---------- lightbox ----------
  const lb = $('#lightbox');
  if (lb) {
    let group = [], idx = 0;
    const show = (i) => {
      idx = (i + group.length) % group.length;
      const t = group[idx];
      const img = $('img', lb);
      img.src = t.dataset.full || $('img', t).src;
      img.alt = $('img', t).alt;
      $('figcaption', lb).textContent = t.dataset.caption || $('img', t).alt;
    };
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-lb]');
      if (!t) return;
      group = $$(`[data-lb="${t.dataset.lb}"]`).filter((x) => x.offsetParent);
      show(group.indexOf(t));
      lb.showModal();
    });
    $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
    $('.lb-close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
    let x0 = null;
    lb.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    lb.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 50) show(idx + (e.clientX < x0 ? 1 : -1)); x0 = null; });
  }

  // ---------- testimonials: two copies make the loop seamless ----------
  const track = $('.quotes-track');
  if (track) track.append(...[...track.children].map((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; }));

  // ---------- wilaya list (commande form) ----------
  const wilaya = $('#wilaya');
  if (wilaya) {
    const W = ['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa'];
    const first = [13, 16, 22, 46, 31];
    const opt = (n) => `<option value="${n} - ${W[n - 1]}">${n} - ${W[n - 1]}</option>`;
    wilaya.insertAdjacentHTML('beforeend', `<optgroup label="Les plus proches">${first.map(opt).join('')}</optgroup><optgroup label="Toutes les wilayas">${W.map((_, i) => opt(i + 1)).join('')}</optgroup>`);
  }

  // ---------- forms: open the visitor's e-mail app with everything filled in ----------
  $$('form[data-mail]').forEach((form) => {
    const err = $('.form-error', form);
    const done = form.parentElement.querySelector('.form-done');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = $$('[required]', form).filter((el) => !el.value.trim() || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())));
      $$('input, select, textarea', form).forEach((el) => el.setAttribute('aria-invalid', String(bad.includes(el))));
      err.hidden = !bad.length;
      if (bad.length) { bad[0].focus(); return; }
      const lines = $$('[data-label]', form).map((el) => (el.value.trim() ? `${el.dataset.label} : ${el.value.trim()}` : '')).filter(Boolean);
      const subjectField = $('[data-subject]', form);
      const subject = `${form.dataset.mail}${subjectField && subjectField.value ? ` — ${subjectField.value}` : ''}`;
      const body = [...lines, '', form.dataset.footer || ''].join('\n').trim();
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      if (done) { form.hidden = true; done.hidden = false; done.focus(); }
    });
    $$('input, select, textarea', form).forEach((el) => el.addEventListener('input', () => el.setAttribute('aria-invalid', 'false')));
    done?.querySelector('[data-again]')?.addEventListener('click', () => { form.reset(); form.hidden = false; done.hidden = true; });
  });

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();

// ---------- paper sheets and hand-drawn buttons ----------
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  // Same "random" tilt every visit, so the page doesn't reshuffle on reload
  let seed = 7;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  document.querySelectorAll('.card.reveal, .arch-item.reveal').forEach((el) => {
    const tilt = (rand() - 0.5) * 2.4;
    el.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
    el.style.setProperty('--tilt-in', `${(tilt * 3 + (rand() > 0.5 ? 5 : -5)).toFixed(2)}deg`);
  });

  // A wobbly rounded rectangle, like a pen going round the button once (and a bit past the start)
  function sketch(w, h, r, wobble, s) {
    let k = s;
    const j = () => { k = (k * 9301 + 49297) % 233280; return (k / 233280 - 0.5) * 2 * wobble; };
    const pts = [];
    const add = (x, y) => pts.push([x + j(), y + j()]);
    const steps = 6;
    const arc = (cx, cy, a0, a1) => { for (let i = 0; i <= 4; i++) { const a = a0 + ((a1 - a0) * i) / 4; add(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } };
    for (let i = 1; i < steps; i++) add(r + ((w - 2 * r) * i) / steps, 0);
    arc(w - r, r, -Math.PI / 2, 0);
    for (let i = 1; i < 3; i++) add(w, r + ((h - 2 * r) * i) / 3);
    arc(w - r, h - r, 0, Math.PI / 2);
    for (let i = steps - 1; i > 0; i--) add(r + ((w - 2 * r) * i) / steps, h);
    arc(r, h - r, Math.PI / 2, Math.PI);
    for (let i = 2; i > 0; i--) add(0, r + ((h - 2 * r) * i) / 3);
    arc(r, r, Math.PI, Math.PI * 1.5);
    add(r + (w - 2 * r) / steps + 6, -1); // overshoot past the start, as a hand would
    // Smooth curve through the points
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y] = pts[i], [nx, ny] = pts[i + 1];
      d += ` Q${x.toFixed(1)},${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)},${((y + ny) / 2).toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    return `${d} L${last[0].toFixed(1)},${last[1].toFixed(1)}`;
  }

  const buttons = [...document.querySelectorAll('.btn')];
  let n = 0;
  function draw(btn, animate) {
    const w = btn.offsetWidth, h = btn.offsetHeight;
    if (!w || !h) return;
    let svg = btn.querySelector(':scope > .ink');
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'ink');
      svg.setAttribute('aria-hidden', 'true');
      svg.append(document.createElementNS(NS, 'path'), document.createElementNS(NS, 'path'));
      btn.append(svg);
    }
    svg.setAttribute('viewBox', `-6 -6 ${w + 12} ${h + 12}`);
    const r = Math.min(h / 2, 24);
    const s = (btn.__seed = (btn.__seed || ++n * 97) + 13);
    const [a, b] = svg.querySelectorAll('path');
    a.setAttribute('d', sketch(w, h, r, 1.6, s));
    b.setAttribute('d', sketch(w + 3, h + 2, r, 2.4, s + 51).replace(/^M/, 'M').replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (m, x, y) => `${(+x - 1.5).toFixed(1)},${(+y - 1).toFixed(1)}`));
    if (animate) btn.__drawn = true;
    if (reduce || !animate) { [a, b].forEach((p) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }); svg.classList.remove('drawing'); return; }
    [a, b].forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = `${L}`; p.style.strokeDashoffset = `${L}`; });
    svg.classList.remove('drawing');
    void svg.getBoundingClientRect();
    svg.style.setProperty('--ink-ms', `${Math.min(1.3, 0.55 + (w + h) / 600).toFixed(2)}s`);
    svg.classList.add('drawing');
  }
  // Draw each button the first time it comes into view
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      setTimeout(() => draw(e.target, true), 250);
    }), { threshold: 0.6 });
    buttons.forEach((b) => { draw(b, false); b.querySelector('.ink')?.querySelectorAll('path').forEach((p) => { if (!reduce) { const L = p.getTotalLength(); p.style.strokeDasharray = `${L}`; p.style.strokeDashoffset = `${L}`; } }); io.observe(b); });
  } else buttons.forEach((b) => draw(b, false));
  // Keep outlines matched to the button size (fonts loading, window resizing)
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver((es) => es.forEach((e) => {
      const svg = e.target.querySelector(':scope > .ink');
      if (e.target.__drawn && svg && !svg.classList.contains('drawing')) draw(e.target, false);
    }));
    buttons.forEach((b) => ro.observe(b));
  }
})();
