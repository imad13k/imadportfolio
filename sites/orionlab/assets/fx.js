// Motion layer: scroll progress, word-split headings, tilt, magnetic buttons, clip reveals, parallax,
// pointer glow and page transitions. Configured with data attributes on <body>:
//   data-tilt="selector"  data-clip="selector"  data-glow="selector"
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const body = document.body, root = document.documentElement;
  const ss = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  // scroll progress + parallax
  const bar = document.createElement('div'); bar.className = 'fx-progress'; body.append(bar);
  const par = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const h = root.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      if (!reduce) par.forEach(el => { if (scrollY < innerHeight * 1.5) el.style.transform = `translate3d(0,${scrollY * +el.dataset.parallax}px,0)`; });
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // headings split into words that rise one after another
  document.querySelectorAll('[data-split]').forEach(h => {
    let i = 0;
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 1) return walk(c);
      if (c.nodeType !== 3) return;
      const f = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(w => {
        if (!w) return;
        if (/^\s+$/.test(w)) return f.append(w);
        const o = document.createElement('span'), s = document.createElement('span');
        o.className = 'w'; s.textContent = w; s.style.animationDelay = (+(h.dataset.split || 0) + i++ * 80) + 'ms';
        o.append(s); f.append(o);
      });
      c.replaceWith(f);
    });
    walk(h);
    h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
  });

  // clip-path reveals
  const clips = body.dataset.clip ? document.querySelectorAll(body.dataset.clip) : [];
  clips.forEach(el => el.classList.add('fx-clip'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('fx-in'); io.unobserve(e.target); } }), { threshold: .15 });
  clips.forEach(el => io.observe(el));

  if (fine && !reduce) {
    // 3D tilt
    if (body.dataset.tilt) document.addEventListener('pointermove', e => {
      const el = e.target.closest(body.dataset.tilt);
      document.querySelectorAll('.fx-tilting').forEach(x => { if (x !== el) { x.classList.remove('fx-tilting'); x.style.transform = ''; } });
      if (!el) return;
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.classList.add('fx-tilting');
      el.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
      el.style.setProperty('--gx', (x + .5) * 100 + '%'); el.style.setProperty('--gy', (y + .5) * 100 + '%');
    });
    // magnetic buttons
    document.querySelectorAll('.btn').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    // pointer glow on dark sections
    if (body.dataset.glow) document.querySelectorAll(body.dataset.glow).forEach(s => {
      s.classList.add('fx-glow');
      s.addEventListener('pointermove', e => { const r = s.getBoundingClientRect(); s.style.setProperty('--mx', e.clientX - r.left + 'px'); s.style.setProperty('--my', e.clientY - r.top + 'px'); });
    });
  }

  // page transitions between the site's own pages
  const wipe = document.createElement('div'); wipe.className = 'fx-wipe'; body.append(wipe);
  if (ss.get('fx-nav') && !reduce) { wipe.classList.add('fx-cover'); requestAnimationFrame(() => requestAnimationFrame(() => wipe.classList.replace('fx-cover', 'fx-leave'))); }
  ss.set('fx-nav', '');
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname === location.pathname || !/\.html$|\/$/.test(u.pathname)) return;
    e.preventDefault();
    ss.set('fx-nav', '1');
    wipe.className = 'fx-wipe fx-enter';
    setTimeout(() => { location.href = u.href; }, 520);
  });
  addEventListener('pageshow', e => { if (e.persisted) wipe.className = 'fx-wipe'; });
})();
