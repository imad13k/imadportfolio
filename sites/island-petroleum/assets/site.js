document.documentElement.classList.add('js');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Data (from island-petroleum.dz project pages) ----------
const PLACES = {
  alger: { n: 'Kouba, Alger', lon: 3.07, lat: 36.72 },
  arzew: { n: 'Arzew', lon: -0.32, lat: 35.85 },
  bethioua: { n: 'Béthioua', lon: -0.2, lat: 35.72 },
  hassi: { n: 'Hassi Messaoud', lon: 6.07, lat: 31.68 },
  rhourde: { n: 'Rhourde El Baguel', lon: 6.95, lat: 31.38 },
  ghardaia: { n: 'Ghardaïa', lon: 3.67, lat: 32.49 },
  oran: { n: 'Oran', lon: -0.63, lat: 35.7 },
  laghouat: { n: 'Laghouat', lon: 2.87, lat: 33.8 },
  tiaret: { n: 'Tiaret', lon: 1.32, lat: 35.37 },
  relizane: { n: 'Relizane', lon: 0.56, lat: 35.74 },
  ouargla: { n: 'Ouargla', lon: 5.33, lat: 31.95 },
  jijel: { n: 'Jijel', lon: 5.77, lat: 36.82 },
};
const SITES = [
  ['alger', 'Siège social'],
  ['arzew', 'Ateliers · 25 000 m²'],
  ['bethioua', 'Base de vie · 3 500 m², 250 personnes'],
  ['hassi', 'Ateliers · 20 000 m²'],
];
const PROJECTS = [
  {
    id: 'tecnimont', status: 'en-cours', client: 'Tecnimont', final: 'Sonatrach', sector: 'Oil & Gas',
    title: 'Préfabrication & montage de tuyauterie et montage des équipements',
    place: 'Rhourde El Baguel, Hassi Messaoud', places: ['rhourde'], years: '2025 – 2026', duration: '12 mois',
    kpi: ['40 000 ID', 'de tuyauterie préfabriqués'],
    kpis: [['40 000 ID', 'préfabriqués'], ['30 000 ID', 'soudage & montage'], ['1 000 t', "d'équipements montés"], ['160 t', 'de supports montés'], ['16 000 m²', 'de peinture'], ['1 500 m²', 'de calorifugeage']],
    list: [], contract: { 'Études': false, 'Construction': true },
    imgs: ['tec-1', 'tec-2', 'tec-3', 'tec-4', 'tec-5', 'tec-6'],
  },
  {
    id: 'ghardaia', status: 'en-cours', client: 'Sonatrach', final: '', sector: 'Oil & Gas',
    title: 'Montage de bacs de stockage', place: 'Ghardaïa', places: ['ghardaia'], years: '2025 – 2027', duration: '18 mois',
    kpi: ['EPC', 'étude, approvisionnement et construction'],
    kpis: [['EPC', 'étude, approvisionnement, construction'], ['CS', 'bac en acier carbone'], ['18 mois', 'de travaux']],
    list: ["Étude, approvisionnement et construction d'un bac en acier carbone (CS)"], contract: { 'Études': true, 'Fourniture': true, 'Construction': true },
    imgs: ['gha-1', 'gha-2', 'gha-3', 'gha-4', 'gha-5'],
  },
  {
    id: 'cobra', status: 'realise', client: 'Cobra', final: 'Sonatrach TRC', sector: 'Oil & Gas',
    title: 'Préfabrication & montage de tuyauterie, montage des équipements & instruments',
    place: 'Atelier d\'Arzew · stations de pompage · Laghouat, Tiaret, Relizane', places: ['arzew', 'laghouat', 'tiaret', 'relizane'], years: '2021 – 2023', duration: '',
    kpi: ['47 modules', '2 000 t montées'],
    kpis: [['60 000 ID', 'soudage & CND en atelier'], ['24 000 ID', 'PWHT en atelier'], ['15 000 ID', 'soudure & CND sur site'], ['47 modules', '2 000 tonnes'], ['700 t', 'de charpente métallique'], ['840', 'vannes installées']],
    list: ['Préfabrication à l\'atelier d\'Arzew : 8 800 m² de peinture', 'Montage des stations de pompage de Timzhert, Mseka, Medareg, Nador et Kenanda : 6 000 ID de PWHT, 1 200 m² de peinture, 61 t de supports, tests hydrostatiques', 'Assemblage de moteurs aéros (Laghouat), installation de l\'arbre de transmission (Tiaret) et des hélices (Relizane), calibrage des courroies et hélices'],
    contract: { 'Études': false, 'Construction': true },
    imgs: ['cob-1', 'cob-2', 'cob-3', 'cob-4', 'cob-5', 'cob-6', 'cob-7'],
  },
  {
    id: 'tosyali', status: 'realise', client: 'Tosyali', final: '', sector: 'Hydraulique',
    title: 'Transfert des eaux', place: 'Oran', places: ['oran'], years: '2023 – 2024', duration: '',
    kpi: ['7 km', 'de conduite en acier 36″'],
    kpis: [['7 km', 'conduite acier 36″'], ['5', 'chambres de contrôle'], ['7', 'ventouses'], ['6', 'vidanges'], ['2', 'chambres de connexion'], ['2', 'chambres de comptage']],
    list: ['Travaux de génie civil et mécaniques'], contract: { 'Études': false, 'Construction': true },
    imgs: ['tos-1', 'tos-2', 'tos-3', 'tos-4'],
  },
  {
    id: 'ctco', status: 'realise', client: 'CTCO · Dodsal', final: 'Sonatrach', sector: 'Oil & Gas',
    title: 'Construction de pipelines', place: 'Ouargla', places: ['ouargla'], years: '2019 – 2021', duration: '',
    kpi: ['87 km', 'de pipelines 6″, 16″ et 20″'],
    kpis: [['33 km', 'crude oil 16″'], ['30 km', 'gaz naturel 20″'], ['24 km', 'gas lift 6″']],
    list: ['Travaux mécaniques'], contract: { 'Études': false, 'Construction': true },
    imgs: ['ctc-1', 'ctc-2'],
  },
  {
    id: 'butec', status: 'realise', client: 'Butec', final: 'AQS', sector: 'Industrie',
    title: 'Préfabrication et montage de tuyauterie', place: 'Jijel', places: ['jijel'], years: 'Depuis 2018', duration: '',
    kpi: ['60 000 ID', 'de tuyauterie préfabriqués'],
    kpis: [['60 000 ID', 'préfabriqués'], ['15 000 ID', 'montés'], ['Tests', 'hydrostatiques']],
    list: [], contract: { 'Études': false, 'Construction': true },
    imgs: ['but-1', 'but-2'],
  },
];
const SECTORS = [
  { t: 'Oil & Gas', f: 'Oil & Gas', img: 'sec-oil', p: "Spécialisée dans le pétrole et le gaz, Island Petroleum apporte son savoir-faire aux projets pétroliers et gaziers, dans le respect des standards internationaux.",
    l: [['Préfabrication & montage de tuyauterie', 'Pour centrales, usines et complexes : des réseaux de fluides installés vite et bien'], ['Construction de pipelines', 'Gazoducs et oléoducs pour un acheminement sûr des ressources'], ['Montage des équipements & instruments', 'Rotatifs, statiques, électriques, contrôle et sécurité'], ['Ouvrages concentrés', 'Installations de surface, stations et génie civil']] },
  { t: 'Industrie', f: 'Industrie', img: 'sec-ind', p: "Dans l'industrie, l'entreprise mène des projets de grande envergure, conformes aux normes internationales, avec qualité, sécurité et respect des délais.",
    l: [["Construction d'usines", 'Tuyauterie, charpente, équipements, instrumentation et électricité'], ['Maintenance des installations', 'Complexes sidérurgiques, cimenteries…']] },
  { t: 'Énergie', f: null, img: 'tec-1', p: "Conception, installation et maintenance de solutions énergétiques modernes et durables : centrales électriques, photovoltaïques et éoliennes.",
    l: [['Solaire photovoltaïque', "Production d'énergie renouvelable, écologique et économique"], ['Électrique', 'Centrales et complexes pour une fourniture stable et fiable']] },
  { t: 'Hydraulique', f: 'Hydraulique', img: 'sec-hydro', p: "Des solutions complètes pour la gestion, la distribution et le contrôle de l'eau, avec une qualification de catégorie 8 en hydraulique.",
    l: [['Transfert des eaux', 'Canalisations en acier ou en PEHD'], ['Travaux VRD', 'Voirie et réseaux divers'], ['Stations', 'Traitement et épuration']] },
];
const CLIENTS = [['sonatrach.jpg', 'Sonatrach'], ['tosyali.jpg', 'Tosyali Algérie'], ['cobra.png', 'Cobra'], ['butec.png', 'Butec'], ['aqs.png', 'Algerian Qatari Steel'], ['cevital.png', 'Cevital'], ['etrhb-haddad.png', 'ETRHB Haddad'], ['brandt.png', 'Brandt'], ['sinosteel.png', 'Sinosteel'], ['gica.png', 'GICA'], ['ceeg.png', 'CEEG'], ['grtg.png', 'GRTG']];
const img = (k) => `assets/img/${k}.jpg`;

// ---------- Toast ----------
const toast = $('#toast');
let toastT;
const showToast = (m) => { toast.textContent = m; toast.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2400); };

// ---------- Intro ----------
const introOn = document.documentElement.classList.contains('intro');
const intro = $('#intro');
if (introOn) {
  const end = () => intro.remove();
  const t = setTimeout(end, 3500);
  const skip = () => { clearTimeout(t); intro.classList.add('skip'); setTimeout(end, 350); };
  intro.addEventListener('click', skip, { once: true });
  addEventListener('keydown', skip, { once: true });
} else intro.remove();
const heroDelay = reduceMotion ? 0 : introOn ? 2700 : 0;

// ---------- Counters ----------
const fmtN = (n, sep) => sep ? Math.round(n).toLocaleString('fr-FR').replace(/ /g, ' ') : String(Math.round(n));
const countUp = (el) => {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const to = +el.dataset.count, from = +(el.dataset.from || 0), sep = 'sep' in el.dataset;
  if (reduceMotion) { el.textContent = fmtN(to, sep); return; }
  const t0 = performance.now();
  const tick = (t) => { const p = Math.min(1, (t - t0) / 1700); el.textContent = fmtN(from + (to - from) * (1 - Math.pow(1 - p, 4)), sep); if (p < 1) requestAnimationFrame(tick); };
  el.textContent = fmtN(from, sep);
  requestAnimationFrame(tick);
};
setTimeout(() => $$('.hero-stats [data-count]').forEach(countUp), heroDelay + 700);
const years = new Date().getFullYear() - 2011;
$$('[data-years]').forEach((el) => { el.textContent = years; });

// ---------- Header, progress, back to top ----------
const hdr = $('#hdr'), progress = $('#progress'), toTop = $('#toTop');
let lastY = 0, ticking = false;
const onScroll = () => {
  ticking = false;
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  hdr.classList.toggle('solid', y > 40);
  hdr.classList.toggle('hide', y > 600 && y > lastY && !hdr.classList.contains('open'));
  lastY = y;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  toTop.classList.toggle('show', y > innerHeight);
  $$('.reveal:not(.in)').forEach((el) => { if (el.getBoundingClientRect().bottom < 0) reveal(el); });
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
const burger = $('#burger');
const setMenu = (o) => { hdr.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu'); };
burger.addEventListener('click', () => setMenu(!hdr.classList.contains('open')));
$$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

// Active nav link
const navLinks = $$('#nav a');
const owner = new Map();
let cur = null;
$$('main > section').forEach((s) => { if (s.id && navLinks.some((a) => a.hash === '#' + s.id)) cur = s.id; else if (s.id === 'contact') cur = 'contact'; owner.set(s, cur); });
const navObs = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  const id = owner.get(e.target);
  navLinks.forEach((a) => { const on = a.hash === '#' + id; a.classList.toggle('active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
}), { rootMargin: '-45% 0px -50% 0px' });
owner.forEach((_, s) => navObs.observe(s));

// ---------- Reveal ----------
function reveal(el) {
  el.classList.add('in');
  $$('[data-count]', el).forEach(countUp);
  if (el.matches('.certs .reveal') && $('#qBar')) $('#qBar').style.width = qPct + '%';
}
$$('.values, .site-list, .figures .wrap').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--d', `${i * 0.1}s`)));
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
$$('.reveal').forEach((el) => io.observe(el));

// ---------- Hero embers ----------
const cv = $('#embers');
if (cv && !reduceMotion) {
  const cx = cv.getContext('2d');
  let W, H, run = true;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const size = () => { W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  const spawn = () => ({ x: W * (0.45 + Math.random() * 0.55), y: H + 10, vx: (Math.random() - 0.6) * 0.5, vy: -(0.4 + Math.random() * 1.1), r: 0.6 + Math.random() * 1.8, life: 0, max: 220 + Math.random() * 260, f: Math.random() * 6 });
  const ps = Array.from({ length: 70 }, () => { const p = spawn(); p.y = Math.random() * H; p.life = Math.random() * p.max; return p; });
  const draw = () => {
    if (!run || document.hidden) return;
    cx.clearRect(0, 0, W, H);
    cx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      p.life++; p.x += p.vx + Math.sin((p.life + p.f * 40) / 40) * 0.25; p.y += p.vy;
      const a = Math.max(0, 1 - p.life / p.max) * (0.6 + 0.4 * Math.sin(p.life / 6 + p.f));
      if (a <= 0 || p.y < -10) { ps[i] = spawn(); continue; }
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(255,200,120,${a})`); g.addColorStop(0.4, `rgba(236,131,11,${a * 0.6})`); g.addColorStop(1, 'rgba(236,131,11,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.r * 4, 0, 6.283); cx.fill();
    }
    cx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  };
  new IntersectionObserver(([e]) => { const was = run; run = e.isIntersecting; if (run && !was) requestAnimationFrame(draw); }).observe(cv);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && run) requestAnimationFrame(draw); });
  setTimeout(() => requestAnimationFrame(draw), heroDelay);
}

// ---------- Sectors ----------
const sxTabs = $$('.sx-tabs button');
let sxI = 0, sxAuto = !reduceMotion, sxTimer, sxVisible = false;
const sxSet = (i, user) => {
  sxI = i;
  if (user) sxAuto = false;
  const s = SECTORS[i];
  sxTabs.forEach((b, j) => { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
  const im = $('#sxImg');
  im.classList.add('swap');
  setTimeout(() => { im.src = img(s.img); im.alt = `Chantier — ${s.t}`; im.onload = () => im.classList.remove('swap'); if (im.complete) im.classList.remove('swap'); }, reduceMotion ? 0 : 250);
  $('#sxTitle').textContent = s.t;
  $('#sxText').textContent = s.p;
  $('#sxList').innerHTML = s.l.map(([b, t], k) => `<li style="animation-delay:${k * 0.08}s"><b>${esc(b)}</b><span>${esc(t)}</span></li>`).join('');
  const link = $('#sxLink');
  if (s.f) { link.firstChild.textContent = 'Voir les projets du secteur '; link.href = '#projets'; link.dataset.f = s.f; }
  else { link.firstChild.textContent = 'Parler de votre projet énergie '; link.href = '#contact'; delete link.dataset.f; }
  const bar = $('#sxBar'); bar.classList.remove('run'); void bar.offsetWidth; if (sxAuto) bar.classList.add('run');
};
sxTabs.forEach((b, i) => {
  b.addEventListener('click', () => sxSet(i, true));
  b.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = (i + (e.key === 'ArrowRight' ? 1 : 3)) % 4; sxSet(n, true); sxTabs[n].focus(); } });
});
$('#sxLink').addEventListener('click', (e) => { const f = e.currentTarget.dataset.f; if (f) setFilter(f); });
new IntersectionObserver(([e]) => { sxVisible = e.isIntersecting; }, { threshold: 0.4 }).observe($('.sx'));
sxTimer = setInterval(() => { if (sxAuto && sxVisible && !document.hidden) sxSet((sxI + 1) % 4); }, 7000);
sxSet(0);

// ---------- Map ----------
const X = (lon) => 20 + (lon + 8.7) * 24, Y = (lat) => 16 + (37.2 - lat) * 24;
const BORDER = [[-2.2, 35.1], [-1.3, 35.3], [-0.6, 35.75], [0.2, 36.0], [1.3, 36.5], [2.3, 36.6], [3.0, 36.8], [3.9, 36.9], [5.1, 36.75], [5.8, 36.85], [6.6, 37.05], [7.8, 36.95], [8.6, 36.95], [8.4, 36.4], [8.3, 35.6], [8.2, 35.0], [7.7, 34.3], [7.5, 33.5], [8.1, 32.8], [9.0, 32.1], [9.55, 30.25], [9.85, 29.5], [9.8, 28.3], [9.4, 26.6], [10.0, 25.3], [10.3, 24.4], [11.55, 24.3], [11.98, 23.52], [7.45, 20.85], [5.84, 19.45], [4.25, 19.15], [3.33, 18.98], [3.15, 19.82], [1.85, 20.3], [1.15, 20.75], [-4.8, 25.0], [-6.67, 26.13], [-8.67, 27.29], [-8.67, 28.7], [-7.1, 29.6], [-5.6, 29.85], [-4.9, 30.1], [-3.65, 30.85], [-3.6, 31.6], [-2.8, 31.8], [-1.2, 32.1], [-1.25, 32.7], [-1.0, 32.95], [-1.55, 33.5], [-1.75, 34.7]];
const d = 'M' + BORDER.map(([lo, la]) => `${X(lo).toFixed(1)} ${Y(la).toFixed(1)}`).join('L') + 'Z';
$('#dzLand').setAttribute('d', d);
$('#dzDots').setAttribute('d', d);
const routes = [['arzew', 'relizane'], ['arzew', 'tiaret'], ['arzew', 'laghouat'], ['hassi', 'rhourde'], ['alger', 'ghardaia']];
$('#dzRoutes').innerHTML = routes.map(([a, b]) => {
  const A = PLACES[a], B = PLACES[b], x1 = X(A.lon), y1 = Y(A.lat), x2 = X(B.lon), y2 = Y(B.lat);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.18;
  return `<path class="dz-route" d="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}"/>`;
}).join('');
const pinData = [];
SITES.forEach(([k, what]) => pinData.push({ k, kind: 'site', label: PLACES[k].n, lines: [what], proj: null }));
PROJECTS.forEach((p) => p.places.forEach((k) => pinData.push({ k, kind: p.status === 'en-cours' ? 'run' : 'done', label: PLACES[k].n, lines: [`${p.client} — ${p.title}`], proj: p.id })));
const LABELS = { alger: [-74, -10], arzew: [-48, -10], hassi: [-34, 24], ghardaia: [-62, 4], jijel: [6, -10], ouargla: [-58, -8], rhourde: [12, 4] };
$('#dzPins').innerHTML = pinData.map((p, i) => {
  const x = X(PLACES[p.k].lon), y = Y(PLACES[p.k].lat);
  const lb = LABELS[p.k] && (p.kind === 'site' || !SITES.some(([s]) => s === p.k)) && !pinData.slice(0, i).some((q) => q.k === p.k) ? `<text x="${x + LABELS[p.k][0]}" y="${y + LABELS[p.k][1]}">${esc(PLACES[p.k].n)}</text>` : '';
  return `<g class="pin ${p.kind}" data-i="${i}" ${p.proj ? `data-p="${p.proj}"` : ''} tabindex="0" role="button" aria-label="${esc(p.label + ' : ' + p.lines.join(', '))}"><circle class="halo" cx="${x}" cy="${y}" r="7"/><circle class="core" cx="${x}" cy="${y}" r="${p.kind === 'site' ? 5.5 : 6}"/>${lb}</g>`;
}).join('');
const tip = $('#mapTip'), mapCard = $('.map-card');
const showTip = (g) => {
  if (!g) { tip.classList.remove('on'); $$('.card.hot, .pin.hot').forEach((e) => e.classList.remove('hot')); return; }
  const p = pinData[+g.dataset.i];
  tip.innerHTML = `<b>${esc(p.label)}</b>${p.lines.map(esc).join('<br>')}${p.proj ? '<br><small>Cliquer pour le détail</small>' : ''}`;
  const r = g.getBoundingClientRect(), c = mapCard.getBoundingClientRect();
  tip.style.left = Math.min(c.width - 250, Math.max(8, r.left - c.left + 14)) + 'px';
  tip.style.top = (r.top - c.top + 14) + 'px';
  tip.classList.add('on');
  if (p.proj) { $(`.card[data-p="${p.proj}"]`)?.classList.add('hot'); $$(`.pin[data-p="${p.proj}"]`).forEach((e) => e.classList.add('hot')); }
};
$('#dzPins').addEventListener('pointerover', (e) => { const g = e.target.closest('.pin'); if (g) { showTip(null); showTip(g); } });
$('#dzPins').addEventListener('pointerout', (e) => { if (!e.relatedTarget?.closest?.('.pin')) showTip(null); });
$('#dzPins').addEventListener('focusin', (e) => { const g = e.target.closest('.pin'); if (g) { showTip(null); showTip(g); } });
$('#dzPins').addEventListener('focusout', () => showTip(null));
$('#dzPins').addEventListener('click', (e) => { const g = e.target.closest('.pin'); if (g?.dataset.p) openProject(g.dataset.p); });
$('#dzPins').addEventListener('keydown', (e) => { const g = e.target.closest('.pin'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (g.dataset.p) openProject(g.dataset.p); } });

// ---------- Project cards + filters ----------
let filter = 'all';
const ICON_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const ICON_CAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>';
const matches = (p) => filter === 'all' || p.status === filter || p.sector === filter;
const renderCards = () => {
  const list = PROJECTS.filter(matches);
  $('#cards').innerHTML = list.length ? list.map((p, i) => `<button type="button" class="card" data-p="${p.id}" style="animation-delay:${i * 0.06}s" aria-label="${esc(p.client)} — ${esc(p.title)}, voir le détail">
    <span class="c-img"><img src="${img(p.imgs[0])}" alt="" loading="lazy"><span class="c-status ${p.status === 'en-cours' ? 'run' : ''}">${p.status === 'en-cours' ? 'En cours' : 'Réalisé'}</span><span class="c-n">${p.imgs.length} photos</span></span>
    <span class="c-body"><span class="c-client">${esc(p.client)}</span><span class="c-title">${esc(p.title)}</span>
    <span class="c-meta"><span>${ICON_PIN}${esc(p.place.split('·')[0].trim())}</span><span>${ICON_CAL}${esc(p.years)}</span></span>
    <span class="c-kpi"><b>${esc(p.kpi[0])}</b><span>${esc(p.kpi[1])}</span></span></span></button>`).join('') : '<p class="empty">Aucun projet détaillé pour ce filtre.</p>';
  $$('.pin').forEach((g) => { const p = PROJECTS.find((q) => q.id === g.dataset.p); g.classList.toggle('dim', !!p && !matches(p)); });
};
const setFilter = (f) => {
  filter = f;
  $$('.filters button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
  renderCards();
};
$('.filters').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setFilter(b.dataset.f); });
$('#cards').addEventListener('click', (e) => { const c = e.target.closest('.card'); if (c) openProject(c.dataset.p); });
$('#cards').addEventListener('pointerover', (e) => { const c = e.target.closest('.card'); $$('.pin.hot').forEach((g) => g.classList.remove('hot')); if (c) $$(`.pin[data-p="${c.dataset.p}"]`).forEach((g) => g.classList.add('hot')); });
$('#cards').addEventListener('pointerleave', () => $$('.pin.hot').forEach((g) => g.classList.remove('hot')));
renderCards();

// ---------- Project dialog ----------
const pd = $('#pd');
let pdIdx = 0, pdImgs = [];
const setPdImg = (i) => {
  pdIdx = (i + pdImgs.length) % pdImgs.length;
  const im = $('#pdImg'); im.style.animation = 'none'; void im.offsetWidth; im.style.animation = '';
  im.src = img(pdImgs[pdIdx]);
  $$('#pdThumbs button').forEach((b, j) => b.setAttribute('aria-current', String(j === pdIdx)));
};
function openProject(id) {
  const visible = PROJECTS.filter(matches);
  const list = visible.some((p) => p.id === id) ? visible : PROJECTS;
  const k = list.findIndex((p) => p.id === id);
  const p = list[k];
  pdImgs = p.imgs;
  $('#pdImg').alt = `${p.client} — ${p.title}`;
  $('#pdThumbs').innerHTML = p.imgs.map((s, j) => `<button type="button" aria-label="Photo ${j + 1} sur ${p.imgs.length}"><img src="${img(s)}" alt="" loading="lazy"></button>`).join('');
  setPdImg(0);
  const facts = [['Client', p.client], p.final && ['Client final', p.final], ['Secteur', p.sector], ['Localisation', p.place], ['Période', p.years], p.duration && ['Durée des travaux', p.duration]].filter(Boolean);
  const prev = list[(k - 1 + list.length) % list.length], next = list[(k + 1) % list.length];
  $('#pdBody').innerHTML = `<span class="c-status ${p.status === 'en-cours' ? 'run' : ''}">${p.status === 'en-cours' ? 'Projet en cours' : 'Projet réalisé'}</span>
    <h2 id="pdTitle">${esc(p.client)}</h2><p class="pd-title">${esc(p.title)}</p>
    <dl class="pd-facts">${facts.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
    <div class="pd-works"><h3>Détail des travaux</h3><div class="pd-kpis">${p.kpis.map(([a, b]) => `<div><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div>
    ${p.list.length ? `<ul class="pd-list">${p.list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
    <h3>Type de contrat</h3><ul class="pd-contract">${Object.entries(p.contract).map(([a, b]) => `<li class="${b ? 'yes' : 'no'}">${esc(a)}${b ? '' : ' (non inclus)'}</li>`).join('')}</ul></div>
    ${list.length > 1 ? `<div class="pd-nav"><button type="button" data-go="${prev.id}">← ${esc(prev.client)}</button><button type="button" data-go="${next.id}">${esc(next.client)} →</button></div>` : ''}`;
  $('#pdBody').scrollTop = 0;
  if (!pd.open) pd.showModal();
}
$('#pdThumbs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setPdImg([...b.parentNode.children].indexOf(b)); });
$('#pdBody').addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) openProject(b.dataset.go); });
$('#pdClose').addEventListener('click', () => pd.close());
pd.addEventListener('click', (e) => { if (e.target === pd) pd.close(); });
pd.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' && !e.target.closest('input')) setPdImg(pdIdx + 1); if (e.key === 'ArrowLeft') setPdImg(pdIdx - 1); });
let tx = null;
$('#pdImg').addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
$('#pdImg').addEventListener('touchend', (e) => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) setPdImg(pdIdx + (dx < 0 ? 1 : -1)); tx = null; });

// ---------- Qualification validity ----------
const qStart = new Date(2024, 10, 1), qEnd = new Date(2029, 10, 1), now = new Date();
var qPct = Math.max(0, Math.min(100, (now - qStart) / (qEnd - qStart) * 100));
const months = Math.max(0, (qEnd.getFullYear() - now.getFullYear()) * 12 + qEnd.getMonth() - now.getMonth());
$('#qLeft').textContent = months > 0 ? `Valide encore ${Math.floor(months / 12)} an${Math.floor(months / 12) > 1 ? 's' : ''}${months % 12 ? ` et ${months % 12} mois` : ''}` : 'Échue — à renouveler';

// ---------- Clients marquee ----------
const logos = CLIENTS.map(([f, n]) => `<div class="m-logo"><img src="assets/img/clients/${f}" alt="${esc(n)}" loading="lazy"></div>`).join('');
$('#mTrack').innerHTML = logos + logos;
$('#refsList').innerHTML = CLIENTS.map(([, n]) => `<li>${esc(n)}</li>`).join('');

// ---------- Gallery ----------
const GAL = [...Array.from({ length: 15 }, (_, i) => `chantier-${String(i + 1).padStart(2, '0')}`)];
$('#gStrip').innerHTML = GAL.map((k) => `<figure><img src="${img(k)}" alt="Chantier Island Petroleum" loading="lazy"></figure>`).join('');
const gStep = () => ($('#gStrip figure')?.offsetWidth || 300) + 12;
$('#gPrev').addEventListener('click', () => $('#gStrip').scrollBy({ left: -gStep() * 2, behavior: reduceMotion ? 'auto' : 'smooth' }));
$('#gNext').addEventListener('click', () => $('#gStrip').scrollBy({ left: gStep() * 2, behavior: reduceMotion ? 'auto' : 'smooth' }));

// ---------- Opening hours (Algiers time) ----------
try {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Algiers', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  const open = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].includes(parts.weekday) && +parts.hour >= 9 && +parts.hour < 17;
  const el = $('#openNow');
  el.classList.toggle('is-open', open);
  el.textContent = `${open ? 'Ouvert maintenant' : 'Fermé actuellement'} · Dim – Jeu, 9 h – 17 h`;
} catch (e) {}

// ---------- Copy ----------
$$('.copy').forEach((b) => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); showToast(`Copié : ${b.dataset.copy}`); } catch (e) { showToast('Copie impossible'); }
}));

// ---------- Quote form (2 steps) ----------
const form = $('#form');
const sel = (id) => $$(`#${id} button[aria-pressed="true"]`).map((b) => b.textContent);
$('#fSector').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const on = b.getAttribute('aria-pressed') !== 'true'; $$('#fSector button').forEach((x) => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', String(on)); $('#err1').hidden = true; });
$('#fWorks').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); $('#err1').hidden = true; });
const step = (n) => {
  $$('.fs', form).forEach((f) => f.classList.toggle('on', +f.dataset.step === n));
  const st = $('.steps');
  st.classList.toggle('two', n === 2);
  st.children[0].className = n === 2 ? 'done' : 'on';
  st.children[2].className = n === 2 ? 'on' : '';
  if (n === 2) {
    const s = sel('fSector'), w = sel('fWorks'), lieu = form.elements.lieu.value.trim(), delai = form.elements.delai.value;
    $('#recap').innerHTML = [s.length && `<b>Secteur :</b> ${esc(s.join(', '))}`, w.length && `<b>Travaux :</b> ${esc(w.join(', '))}`, lieu && `<b>Lieu :</b> ${esc(lieu)}`, delai && `<b>Démarrage :</b> ${esc(delai)}`].filter(Boolean).join('<br>');
    form.elements.nom.focus({ preventScroll: true });
  }
  form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
};
$('#toStep2').addEventListener('click', () => {
  if (!sel('fSector').length && !sel('fWorks').length) { $('#err1').hidden = false; return; }
  step(2);
});
$('#toStep1').addEventListener('click', () => step(1));
form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim() && e.target.checkValidity()) { e.target.setAttribute('aria-invalid', 'false'); if (!form.querySelector('[aria-invalid="true"]')) $('#err2').hidden = true; } });
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!$('.fs[data-step="2"]').classList.contains('on')) { $('#toStep2').click(); return; }
  const req = $$('[required]', form);
  let ok = true;
  req.forEach((f) => { const v = f.value.trim() !== '' && f.checkValidity(); f.setAttribute('aria-invalid', String(!v)); if (!v) ok = false; });
  $('#err2').hidden = ok;
  if (!ok) { req.find((f) => f.getAttribute('aria-invalid') === 'true').focus(); return; }
  const el = form.elements;
  const lines = [
    `Nom : ${el.nom.value.trim()}`, `Société : ${el.societe.value.trim()}`, `E-mail : ${el.email.value.trim()}`, el.tel.value.trim() && `Téléphone : ${el.tel.value.trim()}`, '',
    sel('fSector').length && `Secteur : ${sel('fSector').join(', ')}`, sel('fWorks').length && `Travaux : ${sel('fWorks').join(', ')}`,
    el.lieu.value.trim() && `Localisation : ${el.lieu.value.trim()}`, el.delai.value && `Démarrage souhaité : ${el.delai.value}`, '', el.message.value.trim(),
  ].filter((l) => l !== false && l !== undefined && l !== null);
  location.href = `mailto:contact@island-petroleum.dz?subject=${encodeURIComponent(`Demande de devis — ${el.societe.value.trim()}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
  form.classList.add('done');
  $('#formDone').hidden = false;
});
$('#formReset').addEventListener('click', () => {
  form.reset();
  $$('.chips button', form).forEach((b) => b.setAttribute('aria-pressed', 'false'));
  form.classList.remove('done'); $('#formDone').hidden = true; step(1);
});

$('#year').textContent = new Date().getFullYear();
onScroll();
