// Motion layer for the Hyproc redesign: opening intro, hero extras, split headings, clip reveals,
// tilt, magnetic buttons, cursor ring, scroll progress and route sweeps.
// app.js re-renders #app on every route change, so page effects are re-applied by watching #app.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const root = document.documentElement, app = document.getElementById('app');
  const T = (fr, en) => root.lang === 'en' ? en : fr;
  const ss = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: k => { try { sessionStorage.setItem(k, '1'); } catch (e) {} } };

  // ---------- opening intro ----------
  const intro = document.getElementById('intro');
  if (intro) {
    if (ss.get('h-intro') || reduce) intro.remove();
    else {
      root.classList.add('fx-hold');
      document.getElementById('hero')?.classList.add('paused');
      const done = () => {
        if (intro.classList.contains('out')) return;
        intro.classList.add('out');
        root.classList.remove('fx-hold');
        document.getElementById('hero')?.classList.remove('paused');
        ss.set('h-intro');
        setTimeout(() => intro.remove(), 1300);
      };
      setTimeout(done, 3500);
      intro.addEventListener('click', done);
      addEventListener('keydown', e => { if (e.key === 'Escape') done(); });
    }
  }

  // ---------- scroll progress ----------
  const bar = document.createElement('div'); bar.className = 'fx-progress'; document.body.append(bar);
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { ticking = false; const h = root.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; });
  }, { passive: true });

  // ---------- per-page enhancements ----------
  const splitWords = h => {
    if (h.dataset.fx) return;
    h.dataset.fx = '1'; h.classList.add('fx-split');
    let i = 0;
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 1) return walk(c);
      if (c.nodeType !== 3) return;
      const f = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(w => {
        if (!w) return;
        if (/^\s+$/.test(w)) return f.append(w);
        const o = document.createElement('span'), s = document.createElement('span');
        o.className = 'w'; s.textContent = w; s.style.animationDelay = (120 + i++ * 75) + 'ms';
        o.append(s); f.append(o);
      });
      c.replaceWith(f);
    });
    walk(h);
  };
  const clipIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('fx-in'); clipIO.unobserve(e.target); } }), { threshold: .15 });

  const PORTS = () => `<aside class="ports" aria-label="${T('Nos agences portuaires', 'Our port agencies')}">
    <h4>${T('Agences portuaires', 'Port agencies')} <i>4 ports</i></h4>
    <svg viewBox="0 0 300 118" aria-hidden="true">
      <path class="coast" d="M0 72C30 66 52 76 84 70S140 58 176 64 236 74 300 62V118H0Z"/>
      <path class="route" id="fxRoute" d="M40 62C76 40 104 46 134 52S176 42 196 54 236 44 256 58"/>
      ${[[40, 70, 'Arzew'], [134, 61, T('Alger', 'Algiers')], [196, 66, 'Béjaïa'], [256, 68, 'Skikda']].map(([x, y, n], k) =>
        `<circle class="pulse" cx="${x}" cy="${y}" r="5" style="animation-delay:${k * .6}s"/><circle class="pt" cx="${x}" cy="${y}" r="3"/><text x="${x}" y="${y + 18}" text-anchor="middle">${n}</text>`).join('')}
      ${reduce ? '' : `<path class="boat" d="M-6 -3H5L8 0 5 3H-6Z"><animateMotion dur="12s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear"><mpath href="#fxRoute"/></animateMotion></path>`}
    </svg>
    <p>Arzew · ${T('Alger', 'Algiers')} · Béjaïa · Skikda — ISO 9001:2015</p>
  </aside>`;
  const WAVES = `<div class="hero-waves" aria-hidden="true">${['M0 60C240 30 480 30 720 60S1200 90 1440 60 1920 30 2160 60 2640 90 2880 60V120H0Z', 'M0 74C240 50 480 50 720 74S1200 98 1440 74 1920 50 2160 74 2640 98 2880 74V120H0Z', 'M0 88C240 70 480 70 720 88S1200 106 1440 88 1920 70 2160 88 2640 106 2880 88V120H0Z']
    .map(d => `<svg viewBox="0 0 2880 120" preserveAspectRatio="none"><path fill="var(--bg)" d="${d}"/></svg>`).join('')}</div>`;

  function enhance() {
    document.querySelectorAll('.hero-copy h1, .hero-copy .h1like, .s-head h2, .phero h1').forEach(splitWords);
    document.querySelectorAll('.media, .tile, .featured .img').forEach(el => { if (!el.classList.contains('fx-clip')) { el.classList.add('fx-clip'); clipIO.observe(el); } });
    const hero = document.getElementById('hero');
    if (hero && !hero.querySelector('.ports')) {
      hero.insertAdjacentHTML('beforeend', PORTS() + WAVES + '<div class="hero-num" aria-hidden="true"><span>01</span></div>');
      hero.querySelector('.slides').insertAdjacentHTML('afterend', '<div class="beam" aria-hidden="true"></div>');
      const num = hero.querySelector('.hero-num'), cur = document.getElementById('hcur');
      if (cur) new MutationObserver(() => { num.innerHTML = `<span>${cur.textContent}</span>`; }).observe(cur, { childList: true, characterData: true, subtree: true });
      if (root.classList.contains('fx-hold')) hero.classList.add('paused');
      if (fine && !reduce) {
        const slides = hero.querySelector('.slides');
        hero.addEventListener('pointermove', e => {
          const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
          slides.style.transform = `translate3d(${-x * 22}px,${-y * 14}px,0) scale(1.05)`;
        });
        hero.addEventListener('pointerleave', () => { slides.style.transform = ''; });
      }
    }
    const kpis = document.querySelector('.kpis');
    if (kpis && !document.querySelector('.ed-index')) {
      // editorial index of business lines; a photo follows the cursor over the hovered row
      const L = [[T('Transport de GNL', 'LNG shipping'), T('5 méthaniers chargeant à Arzew et Skikda.', '5 LNG carriers loading at Arzew and Skikda.'), 'ougarta2.jpg', 'compagnie/activites'],
        [T('Transport de GPL', 'LPG shipping'), T('6 navires, cabotage national et trafic international.', '6 vessels, coastal and international trades.'), 'berga2.jpg', 'flotte'],
        [T('Produits raffinés', 'Refined products'), T('Transport et affrètement pour produits pétroliers et chimiques.', 'Shipping and chartering for petroleum and chemicals.'), 'inecker.jpg', 'compagnie/activites'],
        [T('Bitume', 'Bitumen'), T('2 navires bitumiers dédiés.', '2 dedicated bitumen carriers.'), 'azeft.jpg', 'flotte'],
        [T('Consignation', 'Ship agency'), T('4 agences portuaires, près de 2 000 escales par an.', '4 port agencies, nearly 2,000 port calls a year.'), 'slide2.jpg', 'compagnie/agences'],
        ['Shipmanagement', T('Gestion technique et nautique pour compte de tiers.', 'Technical and nautical management for third parties.'), 'tessala2.jpg', 'compagnie/activites']];
      const base = root.lang === 'en' ? '#/en/' : '#/';
      kpis.insertAdjacentHTML('afterend', `<section class="ed-index"><div class="wrap">
        <div class="ed-head"><span class="eyebrow">${T('Nos métiers', 'What we do')}</span><span>(${String(L.length).padStart(2, '0')})</span></div>
        <ol class="ed-list">${L.map(([t, d, im, h], i) => `<li><a href="${base}${h}" data-img="assets/img/${im}">
          <span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${t}</span><span class="d">${d}</span>
          <svg class="ar" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M8 7h9v9"/></svg></a></li>`).join('')}</ol>
        </div><div class="ed-photo" aria-hidden="true"><img alt=""></div></section>`);
      const list = document.querySelector('.ed-list'), ph = document.querySelector('.ed-photo'), pimg = ph.querySelector('img');
      if (fine) {
        let px = 0, py = 0, tx = 0, ty = 0, raf = 0;
        const follow = () => { px += (tx - px) * .16; py += (ty - py) * .16; ph.style.transform = `translate(${px}px,${py}px)`; raf = Math.abs(tx - px) + Math.abs(ty - py) > .5 ? requestAnimationFrame(follow) : 0; };
        list.addEventListener('pointermove', e => { tx = e.clientX + 60; ty = e.clientY - 105; if (!raf) raf = requestAnimationFrame(follow); });
        list.addEventListener('pointerover', e => { const a = e.target.closest('a'); if (!a) return; if (!ph.classList.contains('on')) { px = tx; py = ty; } pimg.src = a.dataset.img; ph.classList.add('on'); list.classList.add('hov'); });
        list.addEventListener('pointerleave', () => { ph.classList.remove('on'); list.classList.remove('hov'); });
      }
    }
  }
  let first = true;
  new MutationObserver(() => {
    enhance();
    if (!first && !reduce) {
      const w = document.createElement('div'); w.className = 'route-wipe'; document.body.append(w);
      w.addEventListener('animationend', () => w.remove());
    }
  }).observe(app, { childList: true });
  enhance(); first = false;

  // ---------- pointer effects ----------
  if (fine && !reduce) {
    const TILT = '.kpi,.card.hover,.ship,.news-card,.tile,.commit li,.pkg,.featured';
    let tilted = null, mag = null;
    const untilt = () => { if (tilted) { tilted.style.transform = ''; tilted.classList.remove('fx-tilt'); tilted.querySelector(':scope > .fx-shine')?.remove(); tilted = null; } };
    document.addEventListener('pointermove', e => {
      const el = e.target.closest(TILT);
      if (el !== tilted) { untilt(); if (el) { tilted = el; el.classList.add('fx-tilt'); el.insertAdjacentHTML('beforeend', '<span class="fx-shine"></span>'); } }
      if (el) {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-4px)`;
        el.style.setProperty('--gx', (x + .5) * 100 + '%'); el.style.setProperty('--gy', (y + .5) * 100 + '%');
      }
      const b = e.target.closest('.btn');
      if (mag && mag !== b) mag.style.transform = '';
      mag = b;
      if (b) { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; }
    });
    // cursor ring
    const cur = document.createElement('div'); cur.className = 'cursor'; document.body.append(cur);
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    document.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); cur.classList.toggle('big', !!e.target.closest('a,button,.ship,.news-card')); });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  }
})();
