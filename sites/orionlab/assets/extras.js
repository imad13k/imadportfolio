// Glossary tooltips, quick search (Ctrl/⌘ K) and a small toast, shared by the Orion Lab pages.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const onHome = !!$('#facility');
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- toast ----------
  const toastEl = document.createElement('div');
  toastEl.className = 'o-toast'; toastEl.setAttribute('role', 'status');
  document.body.append(toastEl);
  let tt;
  window.oToast = msg => { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 2400); };

  // ---------- glossary ----------
  const GLOSSARY = [
    ['GMP', /\bGMP\b/, 'Good Manufacturing Practice', 'The quality rules that govern how medicines are produced, controlled and documented.'],
    ['CDMO', /\bCDMO\b/, 'Contract Development and Manufacturing Organisation', 'A partner that develops formulations and processes for another company, then manufactures the product.'],
    ['CMO', /\bCMO\b/, 'Contract Manufacturing Organisation', 'A partner that manufactures medicines on behalf of another company.'],
    ['Oral solids', /\boral solids?(?: dosage)?\b/i, 'Oral solid dosage (OSD)', 'Medicines taken by mouth in solid form, such as tablets and capsules.'],
    ['API', /\bAPIs?\b/, 'Active pharmaceutical ingredient', 'The substance in a medicine that produces its therapeutic effect.'],
    ['Isolator', /\bisolators?\b/i, 'Isolator', 'A sealed enclosure, worked through glove ports, that separates operators from the product — protecting both.'],
    ['Aseptic', /\baseptic\b/i, 'Aseptic processing', 'Manufacturing under conditions that keep microorganisms out, for products that cannot be sterilised in their final container.'],
    ['Fill-finish', /\bfill[- ]finish\b/i, 'Fill-finish', 'Filling a medicine into vials, syringes or cartridges, then sealing and inspecting them.'],
    ['Lyophilisation', /\blyophili[sz]ation\b/i, 'Lyophilisation', 'Freeze-drying: water is removed from the frozen product under vacuum so it stays stable until reconstituted.'],
    ['Biosimilar', /\bbiosimilars?\b/i, 'Biosimilar', 'A biological medicine that is highly similar to an approved biological reference medicine.'],
    ['Serialisation', /\bseriali[sz]ation\b/i, 'Serialisation', 'Printing a unique code on each pack so it can be traced through the supply chain.'],
    ['Cleanroom', /\bcleanrooms?\b/i, 'Cleanroom', 'A room where airborne particles, air flow and pressure are controlled for sterile or sensitive production.'],
    ['LNCPP', /\bLNCPP\b/, 'LNCPP', "Laboratoire National de Contrôle des Produits Pharmaceutiques — Algeria's national laboratory for the control of medicines."],
    ['ICH', /\bICH\b/, 'ICH', 'International Council for Harmonisation — publishes shared technical guidelines, including how stability studies are run.'],
    ['HPLC', /\bHPLC\b/, 'High-performance liquid chromatography', 'Separates and measures the components of a sample, for identity, purity and assay testing.'],
    ['XRD', /\bXRD\b/, 'X-ray diffraction', 'Identifies the crystal form of a substance.'],
    ['TGA', /\bTGA\b/, 'Thermogravimetric analysis', 'Measures how a sample\'s mass changes as it is heated.'],
    ['DSC', /\bDSC\b/, 'Differential scanning calorimetry', 'Measures heat flow to reveal melting points and other thermal transitions.'],
    ['Exposure limit', /\bexposure limit\b/i, 'Occupational exposure limit', 'The highest airborne concentration of a substance operators may be exposed to — very low for potent oncology molecules.'],
  ];
  const SKIP = 'a,button,h1,h2,h3,label,select,option,textarea,input,script,style,.nav,.intro,.stmt,.gl,.k-scrim,.tag,figcaption,.plist,.seg,.presets,.prog,.gl-pop,.o-toast';

  const pop = document.createElement('div');
  pop.className = 'gl-pop'; pop.id = 'glPop'; pop.setAttribute('role', 'tooltip');
  document.body.append(pop);
  let openGl = null;
  const showGl = b => {
    $$('.gl[aria-expanded="true"]').forEach(x => x.setAttribute('aria-expanded', 'false'));
    openGl = b;
    if (!b) { pop.classList.remove('on'); return; }
    const g = GLOSSARY[+b.dataset.g];
    pop.innerHTML = `<small>Glossary</small><b>${esc(g[2])}</b><p>${esc(g[3])}</p>`;
    b.setAttribute('aria-expanded', 'true');
    const r = b.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    pop.style.left = Math.min(innerWidth - w - 16, Math.max(16, r.left + r.width / 2 - w / 2)) + 'px';
    pop.style.top = (r.top - h - 10 > 8 ? r.top - h - 10 : r.bottom + 10) + 'px';
    pop.classList.add('on');
  };

  const wrapTerms = (root, used) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (!n.nodeValue.trim() || n.parentElement.closest(SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      // Wrap the first mention of each term; the rest of the text node may hold other terms
      while (node) {
        let best = null;
        GLOSSARY.forEach((g, i) => {
          if (used.has(i)) return;
          const m = g[1].exec(node.nodeValue);
          if (m && (!best || m.index < best.m.index)) best = { i, m };
        });
        if (!best) return;
        used.add(best.i);
        const after = node.splitText(best.m.index);
        after.nodeValue = after.nodeValue.slice(best.m[0].length);
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'gl'; b.dataset.g = best.i;
        b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-describedby', 'glPop');
        b.textContent = best.m[0];
        after.before(b);
        node = after;
      }
    });
  };
  const usedMain = new Set();
  const main = $('main');
  if (main) wrapTerms(main, usedMain);
  // Facility tabs re-render their content: give each render its own first mentions
  const fac = $('#fac');
  if (fac) new MutationObserver(() => { if (!$('.gl', fac)) wrapTerms(fac, new Set()); }).observe(fac, { childList: true });
  if (fac) wrapTerms(fac, new Set());

  document.addEventListener('pointerover', e => { const b = e.target.closest?.('.gl'); if (b && e.pointerType === 'mouse') showGl(b); });
  document.addEventListener('pointerout', e => { const b = e.target.closest?.('.gl'); if (b && e.pointerType === 'mouse' && !b.contains(e.relatedTarget)) showGl(null); });
  document.addEventListener('click', e => {
    const b = e.target.closest('.gl');
    if (b) { showGl(openGl === b && pop.classList.contains('on') ? null : b); return; }
    if (!e.target.closest('.gl-pop')) showGl(null);
  });
  document.addEventListener('focusin', e => { if (e.target.classList?.contains('gl')) showGl(e.target); else if (openGl) showGl(null); });
  addEventListener('scroll', () => { if (openGl) showGl(null); }, { passive: true });

  // ---------- quick search ----------
  const ICONS = {
    sec: '<path d="M4 6h16M4 12h10M4 18h7"/>',
    unit: '<path d="M3 21V9l9-6 9 6v12M9 21v-6h6v6"/>',
    prod: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M7 8h10"/>',
    term: '<path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M8 9h8M8 13h5"/>',
    act: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',
  };
  const go = (page, hash) => {
    const here = onHome ? 'index.html' : 'partnership.html';
    if (page === here) {
      const el = $(hash);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.remove('k-flash'); void el.offsetWidth; el.classList.add('k-flash'); }
    } else {
      location.href = page + hash;
    }
  };
  const openUnit = u => {
    if (onHome) { go('index.html', '#facility'); $(`.fac-tabs [data-u="${u}"]`)?.click(); }
    else { try { sessionStorage.setItem('o-unit', u); } catch (e) {} location.href = 'index.html#facility'; }
  };
  const ITEMS = [
    ['Sections', 'sec', 'About Orion Lab', 'Founders, mission, Hassi Ameur', 'who we are founders amry family', () => go('index.html', '#about')],
    ['Sections', 'sec', 'Our facility', '5,000 m² GMP site, three units', 'plant site units gmp', () => go('index.html', '#facility')],
    ['Sections', 'sec', 'Our journey', 'Milestones from 2017 to 2026', 'history timeline milestones dates', () => go('index.html', '#journey')],
    ['Sections', 'sec', 'Products', 'Oncology portfolio', 'medicines portfolio packaging', () => go('index.html', '#products')],
    ['Sections', 'sec', 'Contact', 'contact@orionlab.com · +213 561 61 44 44', 'email phone address', () => go('index.html', '#contact')],
    ['Sections', 'sec', 'CMO / CDMO services', 'What we offer to partners', 'partnership contract manufacturing development offer', () => go('partnership.html', '#offer')],
    ['Facility units', 'unit', 'Oral solid dosage unit', '1,200 m² · 100 M tablets / year / shift', 'osd tablets capsules high containment granulation', () => openUnit('osd')],
    ['Facility units', 'unit', 'Sterile injectables unit', '900 m² cleanroom · isolator line', 'injectable vials syringes aseptic fill finish lyophilisation', () => openUnit('inj')],
    ['Facility units', 'unit', 'Quality control laboratory', 'LNCPP-accredited, ICH stability', 'qc lab hplc testing analytical', () => openUnit('qc')],
    ...['Bracavir®', 'Orion Bosentan®', 'Orion Epirubicine®', 'Orion Erlotinib®', 'Orion Imatinib®'].map(p => ['Products', 'prod', p, 'Orion Lab portfolio', 'product medicine', () => go('index.html', '#products')]),
    ['Actions', 'calc', 'Estimate my yearly volume', 'Capacity planner for partners', 'capacity planner shifts volume calculator', () => go('partnership.html', '#planner')],
    ['Actions', 'act', 'Start a partnership request', 'Four steps, reviewed before sending', 'cmo cdmo request form wizard', () => go('partnership.html', '#request')],
    ['Actions', 'mail', 'E-mail Orion Lab', 'contact@orionlab.com', 'mail write', () => { location.href = 'mailto:contact@orionlab.com'; }],
    ['Actions', 'mail', 'Copy the e-mail address', 'contact@orionlab.com', 'copy clipboard', async () => { try { await navigator.clipboard.writeText('contact@orionlab.com'); oToast('Copied: contact@orionlab.com'); } catch (e) { oToast('Copy failed — contact@orionlab.com'); } }],
    ['Actions', 'call', 'Call Orion Lab', '+213 561 61 44 44', 'phone telephone', () => { location.href = 'tel:+213561614444'; }],
    ...GLOSSARY.map((g, i) => ['Glossary', 'term', g[0], g[2], g[3], { def: i }]),
  ].map(([grp, ico, t, s, k, act]) => ({ grp, ico, t, s, hay: norm(`${t} ${s} ${k}`), act }));

  let scrim, input, list, results = [], sel = 0, lastFocus = null, defIdx = null;
  const build = () => {
    scrim = document.createElement('div');
    scrim.className = 'k-scrim'; scrim.hidden = true;
    scrim.innerHTML = `<div class="k-box" role="dialog" aria-modal="true" aria-label="Search the site">
      <div class="k-in"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
      <input id="kIn" type="text" placeholder="Search sections, units, products, terms…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="kList" aria-autocomplete="list"></div>
      <ul class="k-list" id="kList" role="listbox"></ul>
      <div class="k-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span><span><kbd>Esc</kbd> to close</span></div></div>`;
    document.body.append(scrim);
    input = $('#kIn'); list = $('#kList');
    input.addEventListener('input', () => { defIdx = null; search(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); run(results[sel]); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') e.preventDefault();
    });
    scrim.addEventListener('mousedown', e => { if (e.target === scrim) close(); });
    list.addEventListener('mousemove', e => { const li = e.target.closest('.k-item'); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; paint(); } });
    list.addEventListener('click', e => { const li = e.target.closest('.k-item'); if (li) run(results[+li.dataset.i]); });
  };
  const mark = (t, q) => {
    const w = norm(q).split(/\s+/).filter(Boolean)[0];
    if (!w) return esc(t);
    const i = norm(t).indexOf(w);
    return i < 0 ? esc(t) : esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + w.length)) + '</mark>' + esc(t.slice(i + w.length));
  };
  const search = () => {
    const q = input.value.trim();
    const words = norm(q).split(/\s+/).filter(Boolean);
    results = (words.length ? ITEMS.filter(it => words.every(w => it.hay.includes(w))) : ITEMS.filter(it => it.grp !== 'Glossary' && it.grp !== 'Products'))
      .map(it => ({ it, score: words.length && norm(it.t).startsWith(words[0]) ? 0 : 1 }))
      .sort((a, b) => a.score - b.score).map(x => x.it);
    if (words.length) { const order = ['Actions', 'Sections', 'Facility units', 'Products', 'Glossary']; results.sort((a, b) => order.indexOf(a.grp) - order.indexOf(b.grp)); }
    sel = 0; paint();
  };
  const paint = () => {
    if (!results.length) { list.innerHTML = `<li class="k-empty">No result for “${esc(input.value.trim())}”.</li>`; input.removeAttribute('aria-activedescendant'); return; }
    let html = '', grp = '';
    results.forEach((it, i) => {
      if (it.grp !== grp) { grp = it.grp; html += `<li class="k-grp" role="presentation">${grp}</li>`; }
      html += `<li class="k-item" id="k${i}" role="option" data-i="${i}" aria-selected="${i === sel}"><span class="k-ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[it.ico]}</svg></span><span><span class="k-t">${mark(it.t, input.value)}</span><span class="k-s">${esc(it.s)}</span></span><span class="k-go">${it.act.def !== undefined ? 'Define' : 'Open'} ↵</span></li>`;
      if (defIdx !== null && it.act.def === defIdx) { const g = GLOSSARY[defIdx]; html += `<li class="k-def" role="presentation"><b>${esc(g[2])}</b>${esc(g[3])}</li>`; }
    });
    list.innerHTML = html;
    input.setAttribute('aria-activedescendant', `k${sel}`);
    $(`#k${sel}`)?.scrollIntoView({ block: 'nearest' });
  };
  const move = d => { if (!results.length) return; sel = (sel + d + results.length) % results.length; paint(); };
  const run = it => {
    if (!it) return;
    if (it.act.def !== undefined) { defIdx = defIdx === it.act.def ? null : it.act.def; paint(); return; }
    close(true);
    it.act();
  };
  const open = () => {
    if (!scrim) build();
    lastFocus = document.activeElement;
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add('on'));
    input.value = ''; defIdx = null; search();
    input.focus();
    document.documentElement.style.overflow = 'hidden';
  };
  const close = keepFocus => {
    if (!scrim || scrim.hidden) return;
    scrim.classList.remove('on');
    document.documentElement.style.overflow = '';
    setTimeout(() => { scrim.hidden = true; }, 200);
    if (!keepFocus) lastFocus?.focus?.();
  };
  addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); scrim && !scrim.hidden ? close() : open(); }
    else if (e.key === '/' && !typing && (!scrim || scrim.hidden)) { e.preventDefault(); open(); }
    else if (e.key === 'Escape' && openGl) showGl(null);
  });
  $$('.k-btn').forEach(b => b.addEventListener('click', open));
  const mac = /Mac|iPhone|iPad/.test(navigator.platform);
  $$('.k-btn kbd').forEach(k => { k.textContent = mac ? '⌘K' : 'Ctrl K'; });

  // A unit chosen from the other page opens once the home page loads
  if (onHome) {
    let u = null; try { u = sessionStorage.getItem('o-unit'); sessionStorage.removeItem('o-unit'); } catch (e) {}
    if (u) $(`.fac-tabs [data-u="${u}"]`)?.click();
  }
})();
