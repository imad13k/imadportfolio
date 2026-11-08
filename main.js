(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const paras = s => String(s || '').split(/\n\s*\n/).filter(Boolean).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  // allow web, mail and phone links, and same-site paths — but not protocol-relative "//other.site"
  const safeUrl = u => /^(https?:\/\/|mailto:|tel:|\/(?![\/\\]))/i.test(u || '') ? u : '#';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  let projects = [];
  let content = {};

  // ---------- theme ----------
  try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch {}
  $('#themeBtn').onclick = () => {
    const light = root.dataset.theme ? root.dataset.theme === 'light' : matchMedia('(prefers-color-scheme: light)').matches;
    root.dataset.theme = light ? 'dark' : 'light';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
  };

  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- text helpers ----------
  // "*words*" in the headline become highlighted italics; every word is wrapped for the reveal.
  function splitHeadline(text) {
    let i = 0;
    return String(text || '').split(/(\*[^*]+\*)/).filter(Boolean).map(part => {
      const hl = /^\*.*\*$/.test(part);
      // keep the original spacing so punctuation can sit right after a highlight
      const words = (hl ? part.slice(1, -1) : part).split(/(\s+)/)
        .map(w => /^\s*$/.test(w) ? (w ? ' ' : '') : `<span class="w"><span style="transition-delay:${(i++) * 70}ms">${esc(w)}</span></span>`).join('');
      return hl ? `<em>${words}</em>` : words;
    }).join('');
  }
  function rollify(el) {
    if (el.dataset.rolled) return;
    const t = el.textContent; el.dataset.rolled = 1;
    el.innerHTML = `<span class="r">${esc(t)}</span><span class="r" aria-hidden="true">${esc(t)}</span>`;
  }
  const initials = name => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '✦';

  // ---------- rendering ----------
  const ro = new ResizeObserver(es => es.forEach(e => { const f = e.target.querySelector('iframe'); if (f) f.style.transform = `scale(${e.contentRect.width / 1440})`; }));
  function media(p) {
    if (p.cover) return `<img src="${esc(safeUrl(p.cover))}" alt="Site ${esc(p.title)}" loading="lazy">`;
    const src = p.link || p.external;
    return src ? `<iframe src="${esc(safeUrl(src))}" loading="lazy" tabindex="-1" aria-hidden="true" scrolling="no"></iframe>` : '';
  }

  const statusBadge = p => p.status ? `<span class="pstatus mono"><i aria-hidden="true"></i>${esc(p.status)}</span>` : '';
  function card(p, i, system = false) {
    return `
      <a class="pcard reveal${i === 0 ? ' wide' : ''}${system ? ' system' : ''}" style="transition-delay:${(i % 2) * 80}ms" href="#/work/${encodeURIComponent(p.id)}" data-cursor="Voir">
        <div class="pcard-media proj-media">${media(p)}
          <span class="pcard-num mono">${String(i + 1).padStart(2, '0')}</span>${statusBadge(p)}
          ${p.logo ? `<span class="pcard-logo" style="${p.logoBg ? `background:${esc(p.logoBg)}` : ''}"><img src="${esc(safeUrl(p.logo))}" alt="Logo ${esc(p.client || p.title)}" loading="lazy"></span>` : ''}
        </div>
        <div class="pcard-body">
          <div class="pcard-top"><span class="mono">${esc(p.category)}</span><span class="mono">${esc(p.year)}</span></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          <div class="pcard-foot"><ul class="tags">${(p.tags || []).slice(0, 3).map(t => `<li>${esc(t)}</li>`).join('')}</ul><span class="pcard-go" aria-hidden="true">→</span></div>
        </div>
      </a>`;
  }

  function render(c) {
    content = c;
    const pr = c.profile || {};
    document.title = c.seo?.title || pr.name || 'Portfolio';
    document.querySelector('meta[name=description]').content = c.seo?.description || pr.intro || '';
    // the dashboard colour is the brand; CSS derives a lighter accent for dark mode from it
    if (c.theme?.accent) root.style.setProperty('--brand', c.theme.accent);

    $$('[data-bind]').forEach(el => { el.textContent = pr[el.dataset.bind] || ''; });
    $('#status').hidden = !pr.available;
    $('#headline').innerHTML = splitHeadline(pr.headline || pr.name);

    $('#stats').innerHTML = (c.stats || []).map(s => `<div class="stat reveal"><b data-count="${esc(s.value)}">${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('');

    // marquees
    const skills = (c.skills || []).length ? c.skills : ['Design', 'Code', 'Motion'];
    const skillRun = skills.map(s => `<span>${esc(s)}</span>`).join('');
    $('#marquee').innerHTML = skillRun + skillRun;
    const talk = `<span>Parlons-en</span><span><em>Parlons-en</em></span>`;
    $('#talk').innerHTML = talk.repeat(4);

    // projects
    // websites first, then tools & systems in their own section; the case study browses them in that order
    const visible = (c.projects || []).filter(p => p.visible !== false);
    const sites = visible.filter(p => p.kind !== 'system');
    const systems = visible.filter(p => p.kind === 'system');
    projects = [...sites, ...systems];
    $('#workCount').textContent = `(${String(sites.length).padStart(2, '0')})`;
    $('#sysCount').textContent = `(${String(systems.length).padStart(2, '0')})`;
    $('#systems').hidden = !systems.length;
    $('#systemsGrid').innerHTML = systems.map((p, i) => card(p, i, true)).join('');
    $('#projects').innerHTML = sites.length ? sites.map((p, i) => card(p, i)).join('') : '<p class="wrap">Aucun projet pour le moment.</p>';
    $$('.proj-media').forEach(m => ro.observe(m));
    $('#projectList').innerHTML = sites.map((p, i) => `
      <a class="irow" href="#/work/${encodeURIComponent(p.id)}" data-cover="${esc(safeUrl(p.cover || ''))}" data-cursor="Voir">
        <span class="n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.title)}</h3>
        <span class="c">${esc(p.category)}</span><span class="y">${esc(p.year)}</span><span class="ar">→</span>
      </a>`).join('');

    // services
    $('#servicesList').innerHTML = (c.services || []).map((s, i) => `
      <div class="service reveal"><span class="n">(${String(i + 1).padStart(2, '0')})</span><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p><span class="arrow">→</span></div>`).join('');
    $('#services').hidden = !(c.services || []).length;

    // process
    $('#processList').innerHTML = (c.process || []).map((s, i) => `
      <div class="pstep reveal" style="transition-delay:${i * 90}ms"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p><span class="bar"></span></div>`).join('');
    $('#process').hidden = !(c.process || []).length;

    // about
    $('#avatar').innerHTML = pr.avatar ? `<img src="${esc(safeUrl(pr.avatar))}" alt="${esc(pr.name)}">` : esc(initials(pr.name));
    $('#aboutText').innerHTML = paras(pr.about);
    $$('#aboutText p').forEach(p => { p.innerHTML = p.innerHTML.split(/(\s+|<br>)/).map(w => /^\s+$|^<br>$|^$/.test(w) ? w : `<span class="sw">${w}</span>`).join(''); });
    $('#skills').innerHTML = (c.skills || []).map(s => `<li>${esc(s)}</li>`).join('');
    $('#experience').innerHTML = (c.experience || []).map(x => `
      <div class="tl reveal"><span class="when mono">${esc(x.period)}</span><div><b>${esc(x.role)}</b>${x.company ? ` <span class="co">— ${esc(x.company)}</span>` : ''}<p>${esc(x.description)}</p></div></div>`).join('');
    $('#resumeWrap').hidden = !pr.resume;
    if (pr.resume) $('#resume').href = safeUrl(pr.resume);

    // contact
    $('#mail').textContent = pr.email || '';
    $('#copyEmail').hidden = !pr.email;
    $('#phoneWrap').hidden = !pr.phone;
    if (pr.phone) { $('#phone').textContent = pr.phone; $('#phone').href = 'tel:' + pr.phone.replace(/\s/g, ''); }
    $('#socials').innerHTML = (pr.socials || []).filter(s => s.url).map(s =>
      `<li><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener" data-roll>${esc(s.label)} ↗</a></li>`).join('');

    $$('[data-roll]').forEach(rollify);
    observe();
    startClock(pr.timezone);
    route();
  }

  // ---------- preloader ----------
  function runLoader(ready) {
    let seen = false;
    try { seen = sessionStorage.getItem('seen') === '1'; sessionStorage.setItem('seen', '1'); } catch {}
    const loader = $('#loader');
    const finish = () => {
      loader.classList.add('done');
      document.body.classList.remove('loading');
      setTimeout(() => document.body.classList.add('ready'), seen || reduced ? 0 : 350);
      setTimeout(() => loader.remove(), 1200);
    };
    if (seen || reduced) { loader.style.transition = 'none'; return ready.then(finish); }
    const start = performance.now(), dur = 1500;
    let done = false; ready.then(() => done = true);
    (function tick(now) {
      const t = clamp((now - start) / dur, 0, 1), eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(eased * (done ? 100 : 92));
      $('#loadNum').textContent = v; $('#loadBar').style.width = v + '%';
      if (t < 1 || !done) requestAnimationFrame(tick); else setTimeout(finish, 150);
    })(start);
  }

  // ---------- clock ----------
  let clockT;
  function startClock(tz) {
    clearInterval(clockT);
    const fmt = (() => { try { return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: tz || 'Africa/Algiers' }); } catch { return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }); } })();
    const place = (content.profile?.location || '').split(',')[0];
    const tick = () => { $('#clock').textContent = `${place ? place + ' · ' : ''}${fmt.format(new Date())}`; };
    tick(); clockT = setInterval(tick, 15000);
  }

  // ---------- reveal & counters ----------
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    e.target.querySelectorAll('[data-count]').forEach(countUp);
  }), { rootMargin: '0px 0px -10% 0px' });
  function observe() { $$('.reveal:not(.in), .reveal-text:not(.in)').forEach(el => io.observe(el)); }
  function countUp(el) {
    const m = /^(\D*)(\d+(?:\.\d+)?)(.*)$/.exec(el.dataset.count);
    if (!m || reduced) return;
    const target = parseFloat(m[2]), dec = (m[2].split('.')[1] || '').length, start = performance.now();
    (function step(now) {
      const t = clamp((now - start) / 1400, 0, 1), v = target * (1 - Math.pow(1 - t, 4));
      el.textContent = m[1] + v.toFixed(dec) + m[3];
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  // ---------- scroll-driven effects (single rAF loop) ----------
  const nav = $('#nav'), progress = $('#progress');
  let lastY = scrollY, velocity = 0;
  const marquees = [{ el: $('#marquee'), x: 0, dir: -1, speed: .3 }, { el: $('#talk'), x: 0, dir: 1, speed: .45 }];
  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  const cursor = { x: pointer.x, y: pointer.y };
  const orb = { x: 0, y: 0 };

  function frame() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    velocity = lerp(velocity, y - lastY, .1);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('scrolled', y > 20);
    if (!document.body.classList.contains('menu-open')) nav.classList.toggle('away', y > 300 && y - lastY > 2 ? true : (y - lastY < -2 ? false : nav.classList.contains('away')));
    lastY = y;

    if (!reduced) {
      // marquees speed up and flip with scroll velocity
      for (const m of marquees) {
        if (!m.el.firstElementChild) continue;
        const half = m.el.scrollWidth / 2;
        const boost = clamp(Math.abs(velocity) * .4, 0, 12);
        const dir = velocity < -0.5 ? -m.dir : m.dir;
        m.x += dir * (m.speed + boost);
        if (m.x <= -half) m.x += half; if (m.x > 0) m.x -= half;
        m.el.style.transform = `translate3d(${m.x}px,0,0)`;
      }
      // about text lights up as you scroll through it
      const scrub = $('#aboutText');
      const words = scrub.querySelectorAll('.sw');
      if (words.length) {
        const r = scrub.getBoundingClientRect();
        const t = clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .35), 0, 1);
        const lit = Math.round(t * words.length);
        words.forEach((w, i) => w.classList.toggle('lit', i < lit));
      }
      // cursor & orb
      cursor.x = lerp(cursor.x, pointer.x, .2); cursor.y = lerp(cursor.y, pointer.y, .2);
      cursorEl.style.transform = `translate3d(${cursor.x}px,${cursor.y}px,0)`;
      orb.x = lerp(orb.x, (pointer.x / innerWidth - .5) * 120, .03); orb.y = lerp(orb.y, (pointer.y / innerHeight - .5) * 120 + y * .25, .06);
      orbEl.style.transform = `translate(calc(-50% + ${orb.x}px), calc(-50% + ${orb.y}px))`;
    } else {
      $$('#aboutText .sw').forEach(w => w.classList.add('lit'));
    }
    requestAnimationFrame(frame);
  }

  // ---------- cursor ----------
  const cursorEl = $('#cursor'), cursorLabel = $('#cursorLabel'), orbEl = $('#orb');
  addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; if (finePointer) cursorEl.classList.add('on'); }, { passive: true });
  document.addEventListener('pointerleave', () => cursorEl.classList.remove('on'));
  document.addEventListener('pointerover', e => {
    const labelled = e.target.closest('[data-cursor]');
    const clickable = e.target.closest('a,button,input,textarea,label');
    cursorEl.classList.toggle('big', !!labelled);
    cursorEl.classList.toggle('hover', !labelled && !!clickable);
    cursorLabel.textContent = labelled ? labelled.dataset.cursor : '';
  });

  // ---------- magnetic buttons & tilt ----------
  if (finePointer && !reduced) {
    document.addEventListener('pointermove', e => {
      $$('[data-magnetic]').forEach(el => {
        const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy, reach = Math.max(r.width, r.height);
        el.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1)';
        el.style.transform = Math.hypot(dx, dy) < reach ? `translate(${dx * .3}px,${dy * .3}px)` : '';
      });
      const tilt = $('[data-tilt]');
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const inside = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
        tilt.style.transform = inside ? `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - .5) * 14}deg) rotateX(${-((e.clientY - r.top) / r.height - .5) * 14}deg)` : '';
      }
    }, { passive: true });
  }

  // ---------- mobile menu ----------
  const menuBtn = $('#menuBtn');
  const setMenu = open => { document.body.classList.toggle('menu-open', open); menuBtn.setAttribute('aria-expanded', open); };
  menuBtn.onclick = () => setMenu(!document.body.classList.contains('menu-open'));
  $('#links').addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  // ---------- smooth anchor scrolling ----------
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').startsWith('#/')) return;
    const target = document.querySelector(a.getAttribute('href') === '#top' ? 'body' : a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  // ---------- copy email ----------
  $('#copyEmail').onclick = async () => {
    const email = content.profile?.email; if (!email) return;
    try { await navigator.clipboard.writeText(email); $('#copyHint').textContent = 'Copié ✓'; toast('E-mail copié dans le presse-papiers'); setTimeout(() => $('#copyHint').textContent = 'Cliquer pour copier', 2000); }
    catch { location.href = 'mailto:' + email; }
  };

  // ---------- case study (#/work/<id>) ----------
  const caseEl = $('#case');
  function openCase(p) {
    const i = projects.indexOf(p), next = projects[(i + 1) % projects.length];
    $('#caseIndex').textContent = `${String(i + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
    $('#caseMeta').innerHTML = statusBadge(p) + esc([p.category, p.year].filter(Boolean).join(' — '));
    $('#caseTitle').textContent = p.title;
    $('#caseSummary').textContent = p.summary || '';
    const live = p.external || p.link;
    $('#caseActions').innerHTML = [
      live ? `<a class="btn" href="${esc(safeUrl(live))}" target="_blank" rel="noopener" data-magnetic><span>Voir le site</span> <span>↗</span></a>` : '',
      p.external && p.link ? `<a class="btn ghost" href="${esc(safeUrl(p.link))}" target="_blank" rel="noopener">Aperçu local</a>` : '',
    ].join('');
    const frameSrc = p.link || p.external;
    $('#caseUrl').textContent = frameSrc ? (p.external || location.host + frameSrc) : '';
    $('#caseFrame').innerHTML = frameSrc ? `<iframe src="${esc(safeUrl(frameSrc))}" title="${esc(p.title)} — aperçu en direct"></iframe>` : (p.cover ? `<img src="${esc(safeUrl(p.cover))}" alt="">` : '');
    $('#caseDevice').hidden = !frameSrc && !p.cover;
    $$('#caseSizes button').forEach((b, k) => b.setAttribute('aria-pressed', k === 0));
    // one tab per page of the site, so visitors can browse it inside the preview
    const pages = (p.pages || []).filter(pg => pg.url);
    $('#casePages').innerHTML = pages.length > 1 ? pages.map((pg, k) => `<button role="tab" aria-selected="${k === 0}" data-url="${esc(safeUrl(pg.url))}">${esc(pg.label)}</button>`).join('') : '';
    $('#caseDesc').innerHTML = paras(p.description || p.summary);
    const feats = (p.features || []).filter(Boolean);
    $('#caseFeatures').innerHTML = feats.length ? `<h4>Pages & fonctionnalités</h4><ul>${feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : '';
    $('#caseCompare').hidden = !(p.before && p.cover);
    if (p.before && p.cover) { $('#baBefore').src = safeUrl(p.before); $('#baAfter').src = safeUrl(p.cover); setBA(50); }
    $('#caseFacts').innerHTML = [['Client', p.client], ['Année', p.year], ['Catégorie', p.category]]
      .filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    $('#caseTags').innerHTML = (p.tags || []).map(t => `<li>${esc(t)}</li>`).join('');
    const nextLink = $('#caseNext');
    nextLink.hidden = projects.length < 2;
    nextLink.href = `#/work/${encodeURIComponent(next.id)}`;
    $('#caseNextTitle').textContent = next.title;
    caseEl.hidden = false; caseEl.scrollTop = 0;
    document.body.classList.add('locked');
    requestAnimationFrame(() => requestAnimationFrame(() => caseEl.classList.add('open')));
    $('#caseClose').focus({ preventScroll: true });
  }
  function closeCase() {
    caseEl.classList.remove('open');
    document.body.classList.remove('locked');
    setTimeout(() => { if (!caseEl.classList.contains('open')) { caseEl.hidden = true; $('#caseFrame').innerHTML = ''; } }, reduced ? 0 : 900);
  }
  function route() {
    const m = /^#\/work\/(.+)$/.exec(location.hash);
    const p = m && projects.find(x => x.id === decodeURIComponent(m[1]));
    if (p) openCase(p); else if (!caseEl.hidden) closeCase();
  }
  const back = () => { history.pushState('', '', location.pathname + '#work'); closeCase(); };
  addEventListener('hashchange', route);
  $('#caseClose').onclick = back;
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!caseEl.hidden) back(); setMenu(false); }
    // arrow keys move between case studies (not while using the before/after slider)
    if (!caseEl.hidden && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.target.closest('.ba, input, textarea')) {
      const m = /^#\/work\/(.+)$/.exec(location.hash), i = projects.findIndex(x => m && x.id === decodeURIComponent(m[1]));
      if (i < 0) return;
      const to = projects[(i + (e.key === 'ArrowRight' ? 1 : -1) + projects.length) % projects.length];
      location.hash = `#/work/${encodeURIComponent(to.id)}`;
    }
  });

  // preview: page tabs and device sizes
  $('#casePages').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#casePages button').forEach(x => x.setAttribute('aria-selected', x === b));
    const f = $('#caseFrame iframe'); if (f) f.src = b.dataset.url;
    $('#caseUrl').textContent = location.host + b.dataset.url;
  };
  $('#caseSizes').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#caseSizes button').forEach(x => x.setAttribute('aria-pressed', x === b));
    const f = $('#caseFrame iframe'); if (f) f.style.width = b.dataset.w;
  };

  // before / after slider
  const ba = $('#ba');
  function setBA(v) { v = clamp(v, 0, 100); ba.style.setProperty('--p', v + '%'); ba.setAttribute('aria-valuenow', Math.round(v)); }
  function baFromEvent(e) { const r = ba.getBoundingClientRect(); setBA((e.clientX - r.left) / r.width * 100); }
  ba.addEventListener('pointerdown', e => { ba.setPointerCapture(e.pointerId); baFromEvent(e); });
  ba.addEventListener('pointermove', e => { if (ba.hasPointerCapture(e.pointerId)) baFromEvent(e); });
  ba.addEventListener('keydown', e => {
    const now = +ba.getAttribute('aria-valuenow');
    if (e.key === 'ArrowLeft') { e.preventDefault(); setBA(now - 5); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setBA(now + 5); }
  });

  // ---------- work view: cards or index list ----------
  let view = 'stack';
  try { view = localStorage.getItem('workView') || 'stack'; } catch {}
  function setView(v) {
    view = v;
    $$('.view-toggle button').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === v));
    $('#projects').hidden = v !== 'stack';
    $('#projectList').hidden = v !== 'list';
    try { localStorage.setItem('workView', v); } catch {}
  }
  $('.view-toggle').onclick = e => { const b = e.target.closest('button'); if (b) setView(b.dataset.view); };
  setView(view);
  const hp = $('#hoverPreview'), hpImg = hp.querySelector('img');
  const hpPos = { x: 0, y: 0, tx: 0, ty: 0 };
  $('#projectList').addEventListener('pointerover', e => {
    const row = e.target.closest('.irow');
    if (!row || !row.dataset.cover) return hp.classList.remove('on');
    if (hpImg.getAttribute('src') !== row.dataset.cover) hpImg.src = row.dataset.cover;
    hp.classList.add('on');
  });
  $('#projectList').addEventListener('pointerleave', () => hp.classList.remove('on'));
  $('#projectList').addEventListener('pointermove', e => { hpPos.tx = e.clientX + 24; hpPos.ty = e.clientY - 110; });
  (function hpLoop() {
    hpPos.x = lerp(hpPos.x, hpPos.tx, .15); hpPos.y = lerp(hpPos.y, hpPos.ty, .15);
    hp.style.transform = `translate3d(${hpPos.x}px,${hpPos.y}px,0) ${hp.classList.contains('on') ? 'scale(1)' : 'scale(.8)'}`;
    requestAnimationFrame(hpLoop);
  })();

  // ---------- contact form ----------
  $('#contact-form').onsubmit = async e => {
    e.preventDefault();
    const f = e.target, note = $('#formNote'), btn = f.querySelector('button');
    const data = Object.fromEntries(new FormData(f));
    // Published (static) copy: no server, so send to the form service, or fall back to the visitor's email app.
    if (content.static) {
      const endpoint = content.contact?.formEndpoint;
      if (!endpoint) {
        if (data.website) return;
        const pr = content.profile || {};
        location.href = `mailto:${pr.email}?subject=${encodeURIComponent('Projet — ' + (data.name || ''))}&body=${encodeURIComponent(`${data.message || ''}\n\n${data.name || ''} · ${data.email || ''}`)}`;
        note.className = 'form-note ok'; note.textContent = 'Votre application e-mail s\'ouvre avec votre message.';
        return;
      }
    }
    btn.disabled = true; note.className = 'form-note'; note.textContent = 'Envoi…';
    try {
      const r = content.static
        ? await fetch(content.contact.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: data.name, email: data.email, message: data.message, _gotcha: data.website || '' }) })
        : await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'portfolio' }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || (j.errors && j.errors[0]?.message) || '');
      f.reset(); note.className = 'form-note ok'; note.textContent = 'Merci, votre message est bien arrivé. À très vite !';
    } catch (err) {
      note.className = 'form-note err'; note.textContent = err.message || 'Une erreur est survenue. Écrivez-moi plutôt par e-mail.';
    } finally { btn.disabled = false; }
  };

  $('#yr').textContent = new Date().getFullYear();
  $$('[data-roll]').forEach(rollify);
  // local server serves /api/content; the published copy rewrites it to a static content.json
  const ready = fetch('/api/content').then(r => { if (!r.ok) throw new Error(); return r.json(); }).catch(() => fetch('/content.json').then(r => r.json())).then(render).catch(() => { $('#projects').innerHTML = '<p class="wrap">Impossible de charger le contenu.</p>'; });
  runLoader(ready);
  requestAnimationFrame(frame);
})();
