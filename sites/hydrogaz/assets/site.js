document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const fmt = (n, d = 1) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

// ---------- Data (from the Hydrogaz spec sheet) ----------
const DIAMETERS = [20, 25, 32, 40, 50, 63, 75, 90, 110];
const PNS = [10, 16, 20];
const WALL = {
  10: [2.0, 2.0, 2.1, 2.4, 3.0, 3.8, 4.5, 5.4, 6.6],
  16: [2.0, 2.3, 3.0, 3.7, 4.6, 5.8, 6.8, 8.2, 10.0],
  20: [2.3, 3.0, 3.6, 4.5, 5.6, 7.1, 8.4, 10.1, 12.3],
};
const DENSITY = 0.96; // g/cm³, typical for PEHD
const wall = (d, pn) => WALL[pn][DIAMETERS.indexOf(d)];
const kgPerM = (d, e) => Math.PI * e * (d - e) * DENSITY / 1000; // mm² × g/cm³ → kg/m

// ---------- Intro ----------
const introPlaying = document.documentElement.classList.contains('intro');
const intro = $('#intro');
if (introPlaying) {
  const end = () => intro.remove();
  const timer = setTimeout(end, 3200);
  const skip = () => { clearTimeout(timer); intro.classList.add('skip'); setTimeout(end, 350); };
  intro.addEventListener('click', skip, { once: true });
  window.addEventListener('keydown', skip, { once: true });
} else {
  intro.remove();
}
const heroDelay = reduceMotion ? 0 : (introPlaying ? 2500 : 0);

// Count-up for the hero chips
const countUp = (el) => {
  const to = Number(el.dataset.count);
  if (reduceMotion) return;
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / 1400);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  el.textContent = '0';
  requestAnimationFrame(tick);
};
setTimeout(() => $$('[data-count]').forEach(countUp), heroDelay + 600);

// ---------- Toast ----------
const toast = $('#toast');
let toastTimer;
const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
};

// ---------- Header, progress, back-to-top, reveal catch-up ----------
const hdr = $('#hdr');
const progress = $('#progress');
const toTop = $('#toTop');
let lastY = 0;
let ticking = false;
const onScroll = () => {
  ticking = false;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  hdr.classList.toggle('solid', y > 40);
  // Hide the header while scrolling down, bring it back on the way up
  hdr.classList.toggle('hide', y > 500 && y > lastY && !hdr.classList.contains('open'));
  lastY = y;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  toTop.classList.toggle('show', y > innerHeight);
  $$('.reveal:not(.in)').forEach((el) => { if (el.getBoundingClientRect().bottom < 0) el.classList.add('in'); });
};
onScroll();
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

// Mobile menu
const burger = $('#burger');
const setMenu = (open) => {
  hdr.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
};
burger.addEventListener('click', () => setMenu(!hdr.classList.contains('open')));
$$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

// Active nav link
const navLinks = $$('#nav a');
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => {
        const on = a.getAttribute('href') === `#${e.target.id}`;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => spy.observe(s));
}

// Reveal on scroll, staggered inside grids
$$('.benefits, .pillars').forEach((g) => [...g.children].forEach((el, i) => el.style.setProperty('--d', `${i * 0.1}s`)));
$$('.pillars li').forEach((li) => li.classList.add('reveal'));
const reveals = $$('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
}

// ---------- Applications tabs ----------
const USES = [
  {
    title: 'Eau potable',
    text: "Adduction et distribution d'eau potable : un réseau étanche qui tient la pression de service, du forage jusqu'au branchement.",
    scene: '<g class="scene"><rect x="210" y="46" width="62" height="50" fill="#fff" stroke="#0B57A4" stroke-width="3"/><path d="M202 50l39-30 39 30" fill="none" stroke="#EE7D22" stroke-width="4" stroke-linejoin="round"/><rect x="234" y="66" width="16" height="30" fill="#0B57A4"/><path d="M60 96V60h20" fill="none" stroke="#0B57A4" stroke-width="5"/><path d="M80 60v10" stroke="#0B57A4" stroke-width="5"/><path class="flowdash" d="M80 74v20"/><path d="M241 96v16" stroke="#1B1F24" stroke-width="8"/></g>',
  },
  {
    title: 'Assainissement',
    text: "Évacuation des eaux usées : un matériau qui ne craint ni la corrosion ni les sols agressifs, pour des réseaux qui durent.",
    scene: '<g class="scene"><rect x="140" y="62" width="40" height="34" rx="4" fill="#5B6B7B"/><ellipse cx="160" cy="62" rx="24" ry="6" fill="#3A4148"/><path d="M152 62h16M152 58h16" stroke="#9AA6B2" stroke-width="2"/><path d="M30 96c20-16 40-16 60 0" fill="none" stroke="#0B57A4" stroke-width="3" stroke-dasharray="4 5"/><circle cx="270" cy="56" r="20" fill="#fff" stroke="#0B57A4" stroke-width="3"/><path d="M262 56h16M270 48v16" stroke="#EE7D22" stroke-width="3"/></g>',
  },
  {
    title: 'Irrigation',
    text: 'Réseaux agricoles : des couronnes légères et souples, faciles à dérouler sur de longues distances et à raccorder sur le terrain.',
    scene: '<g class="scene"><path d="M40 96V76M40 80c-10-4-12-14-10-20 8 2 12 10 10 20Zm0 0c10-4 12-14 10-20-8 2-12 10-10 20Z" fill="#3E9B4F" stroke="#2E7B3D" stroke-width="2"/><path d="M110 96V70M110 76c-12-5-14-16-12-24 10 3 14 12 12 24Zm0 0c12-5 14-16 12-24-10 3-14 12-12 24Z" fill="#3E9B4F" stroke="#2E7B3D" stroke-width="2"/><path d="M190 96V78M190 82c-9-3-11-12-9-17 7 2 10 9 9 17Zm0 0c9-3 11-12 9-17-7 2-10 9-9 17Z" fill="#3E9B4F" stroke="#2E7B3D" stroke-width="2"/><circle cx="270" cy="40" r="14" fill="#EE7D22"/><path class="flowdash" d="M75 100v10M150 100v10M230 100v10"/></g>',
  },
];
const useTabs = $$('.uses-tabs button');
const setUse = (i, focus) => {
  useTabs.forEach((b, j) => { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
  $('#useTitle').textContent = USES[i].title;
  $('#useText').textContent = USES[i].text;
  $('#useScene').innerHTML = USES[i].scene;
  if (focus) useTabs[i].focus();
};
useTabs.forEach((b, i) => {
  b.addEventListener('click', () => setUse(i));
  b.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') setUse((i + 1) % useTabs.length, true);
    if (e.key === 'ArrowLeft') setUse((i + useTabs.length - 1) % useTabs.length, true);
  });
});
setUse(0);

// ---------- Range picker + table ----------
const state = { d: 63, pn: 16 };
const segD = $('#segD');
const segPN = $('#segPN');
segD.innerHTML = DIAMETERS.map((d) => `<button type="button" data-d="${d}" aria-pressed="false">${d}</button>`).join('');
segPN.innerHTML = PNS.map((p) => `<button type="button" data-pn="${p}" aria-pressed="false">PN ${p}</button>`).join('');
const tbody = $('#spec tbody');
tbody.innerHTML = DIAMETERS.map((d, i) => `<tr data-d="${d}"><th scope="row">${d}</th>${PNS.map((p) => `<td class="cell" data-d="${d}" data-pn="${p}" tabindex="0" aria-label="Ø ${d} PN ${p} : ${fmt(WALL[p][i])} mm">${fmt(WALL[p][i])}</td>`).join('')}<td>50 / 100</td></tr>`).join('');

// Cross-section: water particles drifting in the bore
const flow = $('#xsFlow');
const bubbles = Array.from({ length: 14 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), s: 0.004 + Math.random() * 0.01, el: document.createElementNS('http://www.w3.org/2000/svg', 'circle') }));
bubbles.forEach((b) => { b.el.setAttribute('r', String(2 + Math.random() * 3)); flow.append(b.el); });
let boreR = 90;
const drawBubbles = () => {
  bubbles.forEach((b) => {
    b.a += b.s;
    const rr = b.r * (boreR - 6);
    b.el.setAttribute('cx', (Math.cos(b.a) * rr).toFixed(1));
    b.el.setAttribute('cy', (Math.sin(b.a) * rr).toFixed(1));
  });
  if (!reduceMotion) requestAnimationFrame(drawBubbles);
};
drawBubbles();

const flash = (el) => { const box = el.closest('div'); box.classList.remove('flash'); void box.offsetWidth; box.classList.add('flash'); };
const renderPick = () => {
  const { d, pn } = state;
  const e = wall(d, pn);
  const di = d - 2 * e;
  const R = 120 * d / 110;
  boreR = R * di / d;
  $('#xsWall').setAttribute('r', R.toFixed(1));
  $('#xsBore').setAttribute('r', boreR.toFixed(1));
  $('#xsStripe').setAttribute('r', ((R + boreR) / 2).toFixed(1));
  $('#xsLabel').textContent = `Ø ${d} × ${fmt(e)}`;
  const vals = { rE: fmt(e), rDi: fmt(di), rSdr: fmt(d / e), rS: fmt(Math.PI * (di / 20) ** 2), rKg: fmt(kgPerM(d, e), 2) };
  Object.entries(vals).forEach(([id, v]) => { const el = $('#' + id); if (el.textContent !== v) { el.textContent = v; flash(el); } });
  $$('button', segD).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.d) === d)));
  $$('button', segPN).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.pn) === pn)));
  $$('tr', tbody).forEach((tr) => tr.classList.toggle('row-on', Number(tr.dataset.d) === d));
  $$('td.cell', tbody).forEach((td) => {
    td.classList.toggle('col-on', Number(td.dataset.pn) === pn);
    td.classList.toggle('sel', Number(td.dataset.d) === d && Number(td.dataset.pn) === pn);
  });
};
segD.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.d = Number(b.dataset.d); renderPick(); } });
segPN.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.pn = Number(b.dataset.pn); renderPick(); } });
const pickCell = (td) => { state.d = Number(td.dataset.d); state.pn = Number(td.dataset.pn); renderPick(); };
tbody.addEventListener('click', (e) => { const td = e.target.closest('td.cell'); if (td) pickCell(td); });
tbody.addEventListener('keydown', (e) => { const td = e.target.closest('td.cell'); if (td && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pickCell(td); } });
renderPick();

// ---------- Calculator ----------
const cD = $('#cD');
const cPN = $('#cPN');
cD.innerHTML = DIAMETERS.map((d) => `<option value="${d}">Ø ${d} mm</option>`).join('');
cPN.innerHTML = PNS.map((p) => `<option value="${p}">PN ${p}</option>`).join('');
const cLen = $('#cLen');
const cLenR = $('#cLenR');
const cMargin = $('#cMargin');
let lastCalc = null;
const calcCoils = (len, margin) => {
  const need = Math.ceil(len * (1 + margin / 100));
  let n100 = Math.floor(need / 100);
  let n50 = 0;
  const rest = need - n100 * 100;
  if (rest > 50) n100 += 1; else if (rest > 0) n50 = 1;
  return { need, n100, n50, delivered: n100 * 100 + n50 * 50 };
};
const renderCalc = () => {
  const d = Number(cD.value);
  const pn = Number(cPN.value);
  const len = Math.max(1, Math.min(100000, Math.round(Number(cLen.value) || 0)));
  const margin = Number(cMargin.value);
  const r = calcCoils(len, margin);
  const kg = r.delivered * kgPerM(d, wall(d, pn));
  $('#cMarginOut').textContent = `${margin} %`;
  $('#n100').textContent = r.n100;
  $('#n50').textContent = r.n50;
  $('#lenOut').textContent = r.delivered.toLocaleString('fr-FR');
  $('#waste').textContent = (r.delivered - r.need).toLocaleString('fr-FR');
  $('#weight').textContent = Math.round(kg).toLocaleString('fr-FR');
  const icons = [...Array(Math.min(r.n100, 24)).fill('<span class="coil"></span>'), ...Array(r.n50).fill('<span class="coil half" title="50 m"></span>')];
  const more = r.n100 > 24 ? `<span class="coil-more">+${r.n100 - 24}</span>` : '';
  const html = icons.join('') + more;
  const coils = $('#coils');
  if (coils.dataset.key !== `${r.n100}-${r.n50}`) { coils.innerHTML = html; coils.dataset.key = `${r.n100}-${r.n50}`; }
  coils.setAttribute('aria-label', `${r.n100} couronnes de 100 m et ${r.n50} de 50 m`);
  lastCalc = { d, pn, len, n100: r.n100, n50: r.n50, kg };
};
cLenR.addEventListener('input', () => { cLen.value = cLenR.value; renderCalc(); });
cLen.addEventListener('input', () => { cLenR.value = Math.min(5000, Number(cLen.value) || 0); renderCalc(); });
[cD, cPN, cMargin].forEach((el) => el.addEventListener('input', renderCalc));
const syncCalcFromPick = () => { cD.value = String(state.d); cPN.value = String(state.pn); renderCalc(); };
syncCalcFromPick();
$('#toCalc').addEventListener('click', () => {
  syncCalcFromPick();
  $('#calcul').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  setTimeout(() => cLen.focus({ preventScroll: true }), reduceMotion ? 0 : 700);
  showToast(`Ø ${state.d} PN ${state.pn} sélectionné dans le calculateur`);
});

// ---------- Quote basket (kept in this browser only) ----------
let quote = [];
try { quote = JSON.parse(localStorage.getItem('hg-quote') || '[]'); } catch { quote = []; }
const saveQuote = () => { try { localStorage.setItem('hg-quote', JSON.stringify(quote)); } catch {} };
const lineText = (q) => q.len
  ? `Ø ${q.d} mm PN ${q.pn} — ${q.len.toLocaleString('fr-FR')} m (${q.n100} × 100 m${q.n50 ? ` + ${q.n50} × 50 m` : ''}, ≈ ${Math.round(q.kg).toLocaleString('fr-FR')} kg)`
  : `Ø ${q.d} mm PN ${q.pn} — quantité à préciser`;
const itemHTML = (q, i) => `<li class="q-item"><span class="q-badge">Ø${q.d}</span><span class="q-main"><b>PN ${q.pn} · ép. ${fmt(wall(q.d, q.pn))} mm</b><small>${q.len ? `${q.len.toLocaleString('fr-FR')} m · ${q.n100} × 100 m${q.n50 ? ` + ${q.n50} × 50 m` : ''} · ≈ ${Math.round(q.kg).toLocaleString('fr-FR')} kg` : 'Quantité à préciser'}</small></span><button class="q-del" type="button" data-del="${i}" aria-label="Retirer Ø ${q.d} PN ${q.pn}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>`;
const cartBtn = $('#cartBtn');
const renderQuote = () => {
  const html = quote.map(itemHTML).join('');
  $('#quoteList').innerHTML = html;
  $('#drawerList').innerHTML = html;
  $('#quoteEmpty').hidden = quote.length > 0;
  $('#drawerEmpty').hidden = quote.length > 0;
  $('#cartCount').textContent = quote.length;
  cartBtn.setAttribute('aria-label', `Ma demande de devis, ${quote.length} ligne${quote.length > 1 ? 's' : ''}`);
  const kg = quote.reduce((s, q) => s + (q.kg || 0), 0);
  $('#drawerKg').textContent = `${Math.round(kg).toLocaleString('fr-FR')} kg`;
};
const addLine = (q) => {
  const same = quote.findIndex((x) => x.d === q.d && x.pn === q.pn && !x.len && !q.len);
  if (same === -1) quote.push(q);
  saveQuote();
  renderQuote();
  cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
  showToast(same === -1 ? `Ajouté au devis : Ø ${q.d} PN ${q.pn}` : 'Ce tube est déjà dans votre devis');
};
$('#addPick').addEventListener('click', () => addLine({ d: state.d, pn: state.pn }));
$('#calcForm').addEventListener('submit', (e) => { e.preventDefault(); renderCalc(); addLine({ ...lastCalc }); });
document.addEventListener('click', (e) => {
  const del = e.target.closest('[data-del]');
  if (!del) return;
  quote.splice(Number(del.dataset.del), 1);
  saveQuote();
  renderQuote();
});
renderQuote();

// Drawer
const drawer = $('#drawer');
const scrim = $('#scrim');
const setDrawer = (open) => {
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  scrim.hidden = !open;
  if (open) $('#drawerClose').focus(); else cartBtn.focus({ preventScroll: true });
};
cartBtn.addEventListener('click', () => setDrawer(true));
$('#drawerClose').addEventListener('click', () => setDrawer(false));
scrim.addEventListener('click', () => setDrawer(false));
$('#drawerGo').addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (drawer.classList.contains('open')) setDrawer(false);
  setMenu(false);
});

// ---------- Pipe marking explainer (example from the spec sheet) ----------
const MARKS = [
  ['53', 'Marquage métrique', "Un repère imprimé à chaque mètre : il indique la longueur et permet de savoir ce qu'il reste sur une couronne."],
  ['XXX', 'Référence commerciale', 'Le nom commercial du tube chez le fabricant.'],
  ['000', 'N° NF du fabricant', "Le numéro attribué au fabricant par l'organisme de certification."],
  ['NF', 'Monogramme NF', 'La marque de certification, présente quand le tube est certifié.', true],
  ['PE100', 'Identification de la résine', 'La classe du polyéthylène utilisé pour fabriquer le tube.'],
  ['Eau potable', 'Application du tube', 'Eau potable, irrigation, eau non potable ou industrie.'],
  ['16 SDR 11', 'Pression nominale + SDR', 'PN 16 bars ; le SDR est le rapport entre le diamètre extérieur et l’épaisseur.'],
  ['160x14,6', 'Dimensions du tube', 'Diamètre extérieur × épaisseur de paroi, en millimètres.'],
  ['04G', 'Date de fabrication', 'L’année et la quinzaine de fabrication.'],
  ['XXX', 'N° de lot du fabricant', 'Pour retrouver le lot de production en cas de besoin.'],
  ['X', 'Code de la matière', 'Le code de la matière première utilisée.'],
  ['54', 'Marquage métrique', 'Le repère du mètre suivant.'],
];
const pipeText = $('#pipeText');
pipeText.innerHTML = MARKS.map((m, i) => `<button type="button" class="tok${m[3] ? ' circled' : ''}" data-i="${i}">${m[0]}</button>`).join('');
const toks = $$('.tok', pipeText);
const markInfo = $('#markInfo');
let markIdx = 0;
let markAuto = !reduceMotion;
const setMark = (i) => {
  markIdx = i;
  toks.forEach((t, j) => t.classList.toggle('on', i === j));
  $('#miNum').textContent = String(i + 1).padStart(2, '0');
  $('#miTitle').textContent = MARKS[i][1];
  $('#miText').textContent = MARKS[i][2];
  markInfo.classList.remove('swap'); void markInfo.offsetWidth; markInfo.classList.add('swap');
  const t = toks[i];
  const box = pipeText.getBoundingClientRect();
  const r = t.getBoundingClientRect();
  if (r.left < box.left || r.right > box.right) pipeText.scrollBy({ left: r.left - box.left - box.width / 2 + r.width / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
};
const stopAuto = () => { markAuto = false; };
toks.forEach((t, i) => {
  t.addEventListener('mouseenter', () => { stopAuto(); setMark(i); });
  t.addEventListener('focus', () => { stopAuto(); setMark(i); });
  t.addEventListener('click', () => { stopAuto(); setMark(i); });
});
setMark(0);
let markVisible = false;
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => { markVisible = e.isIntersecting; }, { threshold: 0.3 }).observe($('#marquage'));
}
setInterval(() => { if (markAuto && markVisible && !document.hidden) setMark((markIdx + 1) % MARKS.length); }, 3200);

// ---------- Copy ----------
$$('.copy').forEach((btn) => btn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(btn.dataset.copy); showToast(`Copié : ${btn.dataset.copy}`); }
  catch { showToast('Copie impossible, sélectionnez le texte manuellement'); }
}));

// ---------- Contact form ----------
const form = $('#form');
const err = $('#formError');
const done = $('#formDone');
form.addEventListener('input', (e) => {
  if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim() && e.target.checkValidity()) {
    e.target.setAttribute('aria-invalid', 'false');
    if (!form.querySelector('[aria-invalid="true"]')) err.hidden = true;
  }
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const required = $$('[required]', form);
  let ok = true;
  required.forEach((f) => {
    const valid = f.value.trim() !== '' && f.checkValidity();
    f.setAttribute('aria-invalid', String(!valid));
    if (!valid) ok = false;
  });
  err.hidden = ok;
  if (!ok) { required.find((f) => f.getAttribute('aria-invalid') === 'true').focus(); return; }
  const d = Object.fromEntries(new FormData(form));
  const lines = [
    `Nom : ${d.nom}`,
    d.societe && `Société : ${d.societe}`,
    `Téléphone : ${d.tel}`,
    `E-mail : ${d.email}`,
    '',
    quote.length ? 'Tubes demandés :' : '',
    ...quote.map((q) => `- ${lineText(q)}`),
    quote.length ? '' : null,
    d.message,
  ].filter((l) => l !== null && l !== undefined && l !== false);
  const subject = quote.length ? `Demande de devis — tubes PEHD (${quote.length} ligne${quote.length > 1 ? 's' : ''})` : 'Demande de devis — tubes PEHD';
  window.location.href = `mailto:contact@groupe-cheurfa.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  form.classList.add('done');
  done.hidden = false;
});
$('#formReset').addEventListener('click', () => {
  form.reset();
  form.classList.remove('done');
  done.hidden = true;
  form.elements.nom.focus();
});

$('#year').textContent = new Date().getFullYear();
