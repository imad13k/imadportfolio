/* global d3, topojson */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const TOPICS = [['conflict', 'Conflict'], ['diplomacy', 'Diplomacy'], ['politics', 'Politics'], ['economy', 'Economy'], ['energy', 'Energy'], ['humanitarian', 'Humanitarian'], ['climate', 'Climate'], ['general', 'General']];
  const TOPIC_NAME = Object.fromEntries(TOPICS);
  const PAGE = 60;
  const RANGE_LABEL = { 6: '6h', 24: '24h', 72: '3d', 168: '7d' };
  const IMPORTANT = 4;

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private window */ } },
  };

  const S = {
    items: [], feeds: [], at: 0, ids: new Set(), freshIds: new Set(),
    hours: 24, topic: '', source: '', q: '', selected: '', pair: '', watchOnly: false,
    watch: new Set(store.get('meridian-watch', [])), showLinks: store.get('meridian-links', true),
    mode: 'globe', shown: PAGE, open: new Set(), pendingNew: 0, connected: false,
    echo: null, majorOnly: false, ai: null, brief: null,
  };
  let COUNTRY = new Map();
  const nameOf = (iso) => COUNTRY.get(iso)?.name || iso;
  const rangeLabel = () => (S.echo ? 'this window' : RANGE_LABEL[S.hours]);

  // ---------- filtering ----------
  const inRange = (it) => (S.echo ? it.published >= S.echo.from && it.published <= S.echo.to : Date.now() - it.published <= S.hours * 3600e3);
  const matchesText = (it) => {
    if (!S.q) return true;
    const hay = `${it.title} ${it.summary} ${it.sourceName} ${it.countries.map(nameOf).join(' ')}`.toLowerCase();
    return S.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  };
  // General interest stories (sport, culture, lifestyle) stay out unless asked for.
  const matchesTopic = (it) => (S.topic ? it.topics.includes(S.topic) : it.topics[0] !== 'general');
  const base = () => S.items.filter((it) => inRange(it) && matchesTopic(it) && (!S.majorOnly || (it.ai?.importance || 0) >= IMPORTANT) && (!S.source || it.source === S.source) && matchesText(it));

  const scoped = (list) => list.filter((it) => {
    if (S.selected && !it.countries.includes(S.selected)) return false;
    if (S.pair) { const [a, b] = S.pair.split('|'); if (!(it.countries.includes(a) && it.countries.includes(b))) return false; }
    if (S.watchOnly && !it.countries.some((c) => S.watch.has(c))) return false;
    return true;
  });

  const groupStories = (list) => {
    const map = new Map();
    for (const it of list) {
      const g = map.get(it.cluster);
      if (g) g.push(it); else map.set(it.cluster, [it]);
    }
    return [...map.values()]; // list is newest first, so each group's lead is its newest story
  };

  function stats(list) {
    const seen = new Map();
    const pairs = new Map();
    const pairSeen = new Set();
    for (const it of list) {
      for (const iso of it.countries) {
        const k = iso + '/' + it.cluster;
        if (!seen.has(iso)) seen.set(iso, { n: 0, sources: new Set(), latest: 0, top: it.title, keys: new Set() });
        const s = seen.get(iso);
        s.sources.add(it.source);
        if (it.published > s.latest) { s.latest = it.published; s.top = it.title; }
        if (!s.keys.has(k)) { s.keys.add(k); s.n++; }
      }
      const L = it.links;
      for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
        const p = [L[i], L[j]].sort().join('|');
        const pk = p + '/' + it.cluster;
        if (pairSeen.has(pk)) continue;
        pairSeen.add(pk);
        pairs.set(p, (pairs.get(p) || 0) + 1);
      }
    }
    return { byIso: seen, pairs };
  }

  // ---------- map ----------
  const svg = d3.select('#map');
  const root = svg.append('g');
  const defs = svg.append('defs');
  const radial = (id, attrs, stops) => {
    const g = defs.append('radialGradient').attr('id', id);
    Object.entries(attrs).forEach(([k_, v]) => g.attr(k_, v));
    stops.forEach(([o, c, a]) => g.append('stop').attr('offset', o).attr('stop-color', c).attr('stop-opacity', a));
  };
  radial('atmoGlow', { cx: '50%', cy: '50%', r: '50%' }, [['86%', '#5FD0E0', 0.42], ['92%', '#3FB8AF', 0.13], ['100%', '#3FB8AF', 0]]);
  radial('globeShade', { cx: '50%', cy: '50%', r: '50%', fx: '36%', fy: '30%' }, [['0%', '#FFFFFF', 0.09], ['45%', '#FFFFFF', 0], ['78%', '#02060C', 0.22], ['100%', '#02060C', 0.72]]);
  const gAtmo = root.append('circle').attr('class', 'atmo').attr('fill', 'url(#atmoGlow)');
  const gSphere = root.append('path').attr('class', 'sphere').datum({ type: 'Sphere' });
  const gGrat = root.append('path').attr('class', 'grat').datum(d3.geoGraticule10());
  const gLand = root.append('g');
  const gNight = root.append('path').attr('class', 'night');
  const gShade = root.append('circle').attr('class', 'shade').attr('fill', 'url(#globeShade)');
  const gArcs = root.append('g');
  const gMarks = root.append('g');
  const gPings = root.append('g');

  let W = 800, H = 500;
  let features = [];
  let projection = d3.geoNaturalEarth1();
  let path = d3.geoPath(projection);
  let globeRot = [-38, -20];
  let globeScale = 1;
  let spinning = !reduceMotion;
  let current = { byIso: new Map(), pairs: new Map() };
  const ramp = d3.interpolateRgbBasis(['#1C2B36', '#205468', '#2C8C8C', '#E2B04A', '#EF6A3A', '#D8342B']);
  const EMPTY = '#26363F';

  const zoom = d3.zoom().scaleExtent([1, 10]).on('zoom', (e) => {
    root.attr('transform', e.transform);
    gMarks.selectAll('g.m').attr('transform', markTransform);
  });
  let k = () => d3.zoomTransform(svg.node()).k;

  function fit() {
    const box = $('#mapwrap').getBoundingClientRect();
    W = box.width; H = box.height;
    svg.attr('viewBox', `0 0 ${W} ${H}`);
    if (S.mode === 'flat') {
      projection = d3.geoNaturalEarth1().rotate([-10, 0]).fitExtent([[10, 10], [W - 10, H - 10]], { type: 'Sphere' });
    } else {
      projection = d3.geoOrthographic().clipAngle(90).rotate(globeRot).fitExtent([[16, 16], [W - 16, H - 16]], { type: 'Sphere' });
      projection.scale(projection.scale() * globeScale);
    }
    path = d3.geoPath(projection);
  }

  const visibleOnGlobe = (ll) => S.mode === 'flat' || d3.geoDistance(ll, [-globeRot[0], -globeRot[1]]) < Math.PI / 2 - 0.02;
  function markTransform(d) {
    const p = projection(d.ll);
    if (!p) return 'translate(-999,-999)';
    const scale = S.mode === 'flat' ? 1 / k() : 1;
    return `translate(${p[0]},${p[1]}) scale(${scale})`;
  }

  // Where it is night right now: the half of the Earth facing away from the sun
  let nightShape = null;
  let nightAt = 0;
  function nightCircle() {
    if (nightShape && Date.now() - nightAt < 60e3) return nightShape;
    const d = new Date();
    const day = (Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86400e3;
    const decl = -23.44 * Math.cos((2 * Math.PI * (day + 10)) / 365);
    const sunLon = (12 - (d.getUTCHours() + d.getUTCMinutes() / 60)) * 15;
    nightShape = d3.geoCircle().center([sunLon + 180, -decl]).radius(90)();
    nightAt = Date.now();
    return nightShape;
  }

  // On the globe, links rise off the surface instead of lying flat on it
  function arcShape(d) {
    if (S.mode === 'flat') return path(d.line);
    const [a, b] = d.line.coordinates;
    const between = d3.geoInterpolate(a, b);
    const lift = Math.min(0.3, 0.05 + d3.geoDistance(a, b) * 0.13);
    const [cx, cy] = projection.translate();
    const centre = [-globeRot[0], -globeRot[1]];
    const N = 32;
    let out = '';
    let pen = false;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const ll = between(t);
      if (d3.geoDistance(ll, centre) >= Math.PI / 2) { pen = false; continue; }
      const p = projection(ll);
      const h = 1 + lift * Math.sin(Math.PI * t);
      out += `${pen ? 'L' : 'M'}${(cx + (p[0] - cx) * h).toFixed(1)},${(cy + (p[1] - cy) * h).toFixed(1)}`;
      pen = true;
    }
    return out || null;
  }

  function drawGeometry() {
    const onGlobe = S.mode === 'globe';
    const [gx, gy] = projection.translate();
    const gr = projection.scale();
    gAtmo.style('display', onGlobe ? null : 'none').attr('cx', gx).attr('cy', gy).attr('r', gr * 1.16);
    gShade.style('display', onGlobe ? null : 'none').attr('cx', gx).attr('cy', gy).attr('r', gr);
    gNight.attr('d', path(nightCircle()));
    gSphere.attr('d', path);
    gGrat.attr('d', path);
    gLand.selectAll('path').attr('d', path);
    gArcs.selectAll('path').attr('d', arcShape);
    gMarks.selectAll('g.m')
      .attr('transform', markTransform)
      .style('display', (d) => (visibleOnGlobe(d.ll) ? null : 'none'));
    gPings.selectAll('circle').each(function (d) { const p = projection(d.ll); if (p) d3.select(this).attr('cx', p[0]).attr('cy', p[1]); });
  }

  function drawData() {
    current = stats(base());
    const counts = current.byIso;
    const max = Math.max(1, ...[...counts.values()].map((s) => s.n));
    const colour = (n) => (n ? ramp(Math.log1p(n) / Math.log1p(max)) : EMPTY);
    gLand.selectAll('path')
      .attr('fill', (f) => colour(counts.get(f.iso)?.n || 0))
      .classed('sel', (f) => f.iso && f.iso === S.selected)
      .classed('watched', (f) => f.iso && S.watch.has(f.iso) && f.iso !== S.selected);

    const marks = [...counts.entries()]
      .map(([iso, s]) => ({ iso, s, c: COUNTRY.get(iso) }))
      .filter((m) => m.c)
      .map((m) => ({ iso: m.iso, n: m.s.n, latest: m.s.latest, ll: m.c.lon !== undefined ? [m.c.lon, m.c.lat] : [0, 0] }))
      .sort((a, b) => b.n - a.n);
    const size = Math.min(1, Math.max(0.55, W / 900));
    const r = (n) => (1.6 + Math.sqrt(n) * 1.15) * size;
    const sel = gMarks.selectAll('g.m').data(marks, (d) => d.iso);
    sel.exit().remove();
    const enter = sel.enter().append('g').attr('class', 'm').attr('tabindex', 0).attr('role', 'button');
    enter.append('circle').attr('class', 'core');
    const all = enter.merge(sel);
    all.attr('aria-label', (d) => `${nameOf(d.iso)}: ${d.n} ${d.n === 1 ? 'story' : 'stories'}`).classed('sel', (d) => d.iso === S.selected);
    all.select('.core').attr('r', (d) => r(d.n));
    all.each(function (d) {
      const fresh = Date.now() - d.latest < 45 * 60e3;
      const g = d3.select(this);
      const ring = g.select('.ring');
      if (fresh && ring.empty()) g.insert('circle', '.core').attr('class', 'ring');
      if (!fresh && !ring.empty()) ring.remove();
      g.select('.ring').attr('r', r(d.n));
    });

    const linkLimit = S.mode === 'flat' ? 24 : W < 600 ? 6 : 12;
    const pairs = S.showLinks ? [...current.pairs.entries()].sort((a, b) => b[1] - a[1]).slice(0, linkLimit) : [];
    const arcs = pairs.map(([id, n]) => {
      const [a, b] = id.split('|');
      const A = COUNTRY.get(a), B = COUNTRY.get(b);
      return A && B ? { id, a, b, n, line: { type: 'LineString', coordinates: [[A.lon, A.lat], [B.lon, B.lat]] } } : null;
    }).filter(Boolean);
    const aSel = gArcs.selectAll('g').data(arcs, (d) => d.id);
    aSel.exit().remove();
    const aEnter = aSel.enter().append('g');
    aEnter.append('path').attr('class', 'arc');
    aEnter.append('path').attr('class', 'arc-hit');
    const aAll = aEnter.merge(aSel);
    aAll.each(function (d) { d3.select(this).selectAll('path').datum(d); });
    aAll.select('.arc').attr('stroke-width', (d) => Math.min(4, 0.8 + Math.sqrt(d.n) * 0.55)).classed('on', (d) => d.id === S.pair);

    $('#legendMax').textContent = max;
    $('#legendBar').style.background = `linear-gradient(90deg,${[0, 0.25, 0.5, 0.75, 1].map((t) => ramp(t)).join(',')})`;
    drawGeometry();
    drawBoard();
  }

  function drawBoard() {
    const top = [...current.byIso.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 9);
    const max = top[0]?.[1].n || 1;
    $('#boardRange').textContent = rangeLabel();
    $('#boardList').innerHTML = top.map(([iso, s]) => `<li><button type="button" data-iso="${esc(iso)}"><span class="b-n">${esc(nameOf(iso))}</span><span class="b-c">${s.n}</span><span class="b-bar"><i style="width:${(s.n / max) * 100}%"></i></span></button></li>`).join('');
  }

  function ping(iso) {
    const c = COUNTRY.get(iso);
    if (!c || reduceMotion) return;
    const ll = [c.lon, c.lat];
    if (!visibleOnGlobe(ll)) return;
    const p = projection(ll);
    if (!p) return;
    gPings.append('circle').datum({ ll }).attr('class', 'ping').attr('cx', p[0]).attr('cy', p[1]).attr('r', 6 / (S.mode === 'flat' ? k() : 1))
      .on('animationend', function () { this.remove(); });
  }

  // Tooltip
  const tip = $('#tip');
  function showTip(e, html) {
    tip.innerHTML = html;
    tip.classList.add('on');
    const b = $('#mapwrap').getBoundingClientRect();
    const x = e.clientX - b.left + 14, y = e.clientY - b.top + 14;
    tip.style.left = Math.min(x, b.width - tip.offsetWidth - 8) + 'px';
    tip.style.top = Math.min(y, b.height - tip.offsetHeight - 8) + 'px';
  }
  const hideTip = () => tip.classList.remove('on');
  const countryTip = (iso, label) => {
    const s = current.byIso.get(iso);
    return `<b>${esc(iso ? nameOf(iso) : label)}</b>${s ? `<small>${s.n} ${s.n === 1 ? 'story' : 'stories'} · ${s.sources.size} ${s.sources.size === 1 ? 'source' : 'sources'}</small>${esc(s.top)}` : '<small>No stories in this period</small>'}`;
  };
  svg.on('pointermove', (e) => {
    const t = e.target;
    const d = t.__data__ || t.parentNode?.__data__;
    if (t.classList.contains('c')) return d.iso || d.properties?.name ? showTip(e, countryTip(d.iso, d.properties?.name)) : hideTip();
    if (t.closest('.m')) return showTip(e, countryTip(t.closest('.m').__data__.iso));
    if (t.classList.contains('arc-hit')) return showTip(e, `<b>${esc(nameOf(d.a))} – ${esc(nameOf(d.b))}</b><small>${d.n} ${d.n === 1 ? 'story names' : 'stories name'} both</small>`);
    hideTip();
  }).on('pointerleave', hideTip);

  svg.on('click', (e) => {
    const t = e.target;
    if (t.classList.contains('c') && t.__data__.iso) return select(t.__data__.iso, true);
    if (t.closest('.m')) return select(t.closest('.m').__data__.iso, true);
    if (t.classList.contains('arc-hit')) { const d = t.__data__; S.pair = S.pair === d.id ? '' : d.id; S.selected = ''; return refresh(); }
    if (S.selected || S.pair) clearSelection();
  });
  svg.on('keydown', (e) => {
    const g = e.target.closest?.('.m');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(g.__data__.iso, true); }
  });

  // Flat map uses d3-zoom; the globe rotates on drag and scales on wheel.
  const drag = d3.drag()
    .on('start', () => { spinning = false; })
    .on('drag', (e) => {
      const s = (0.3 / globeScale) * (500 / Math.min(W, H));
      globeRot = [globeRot[0] + e.dx * s, Math.max(-85, Math.min(85, globeRot[1] - e.dy * s))];
      projection.rotate(globeRot);
      drawGeometry();
    });
  const onWheel = (e) => {
    if (S.mode !== 'globe') return;
    e.preventDefault();
    spinning = false;
    setGlobeScale(globeScale * (e.deltaY < 0 ? 1.1 : 0.9));
  };
  $('#map').addEventListener('wheel', onWheel, { passive: false });
  function setGlobeScale(v) {
    globeScale = Math.max(0.7, Math.min(5, v));
    fit();
    drawGeometry();
  }

  function setMode(m) {
    S.mode = m;
    $$('#mode button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
    root.attr('transform', null);
    svg.on('.zoom', null).on('.drag', null);
    svg.property('__zoom', d3.zoomIdentity);
    if (m === 'flat') svg.call(zoom).on('dblclick.zoom', null);
    else svg.call(drag);
    spinning = m === 'globe' && !reduceMotion && !S.selected;
    fit();
    drawGeometry();
    gMarks.selectAll('g.m').style('display', (d) => (visibleOnGlobe(d.ll) ? null : 'none'));
    if (m === 'globe') startSpin();
    if (features.length && S.items.length) drawData();
  }

  let spinOn = false;
  function startSpin() {
    if (spinOn) return;
    spinOn = true;
    let last = performance.now();
    const step = (t) => {
      if (S.mode !== 'globe' || !spinning) { spinOn = false; return; }
      if (!document.hidden) {
        globeRot = [globeRot[0] + (t - last) * 0.006, globeRot[1]];
        projection.rotate(globeRot);
        drawGeometry();
      }
      last = t;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function flyTo(iso) {
    const c = COUNTRY.get(iso);
    if (!c) return;
    const dur = reduceMotion ? 0 : 900;
    if (S.mode === 'flat') {
      const f = features.find((x) => x.iso === iso);
      let scale = 3.2, pt = projection([c.lon, c.lat]);
      if (f) {
        const [[x0, y0], [x1, y1]] = path.bounds(f);
        // Countries spanning most of the map (Russia, USA with Alaska) stay centred on their label point
        const wide = (x1 - x0) > W * 0.32;
        scale = Math.max(1.4, Math.min(5, 0.42 / Math.max((x1 - x0) / W, (y1 - y0) / H)));
        if (!wide) pt = [(x0 + x1) / 2, (y0 + y1) / 2];
      }
      const t = d3.zoomIdentity.translate(W / 2, H / 2).scale(scale).translate(-pt[0], -pt[1]);
      svg.transition().duration(dur).call(zoom.transform, t);
    } else {
      spinning = false;
      const from = globeRot, to = [-c.lon, -c.lat];
      const dLon = ((to[0] - from[0] + 540) % 360) - 180;
      d3.transition().duration(dur).tween('rotate', () => (t) => {
        globeRot = [from[0] + dLon * t, from[1] + (to[1] - from[1]) * t];
        projection.rotate(globeRot);
        drawGeometry();
      });
    }
  }

  function resetView() {
    if (S.mode === 'flat') svg.transition().duration(reduceMotion ? 0 : 500).call(zoom.transform, d3.zoomIdentity);
    else {
      globeScale = 1;
      fit();
      drawGeometry();
      spinning = !reduceMotion && !S.selected;
      if (spinning) startSpin();
    }
  }

  // ---------- selection ----------
  function select(iso, fly) {
    if (S.selected === iso) return clearSelection();
    S.selected = iso; S.pair = ''; S.shown = PAGE;
    hideTip();
    refresh();
    if (fly) flyTo(iso);
    $('#feed').scrollTop = 0;
  }
  function clearSelection() {
    S.selected = ''; S.pair = ''; S.shown = PAGE;
    refresh();
    resetView();
  }

  // ---------- panel ----------
  function spark(list) {
    const N = 24, span = S.echo ? S.echo.to - S.echo.from : S.hours * 3600e3, now = S.echo ? S.echo.to : Date.now();
    const b = new Array(N).fill(0);
    for (const it of list) {
      const i = N - 1 - Math.floor((now - it.published) / (span / N));
      if (i >= 0 && i < N) b[i]++;
    }
    const m = Math.max(1, ...b);
    return `<div class="spark" role="img" aria-label="Stories over time">${b.map((v) => `<i style="height:${Math.max(3, (v / m) * 100)}%"></i>`).join('')}</div>
      <div class="spark-l"><span>${S.echo ? `${utcTime(S.echo.from)} UTC` : `${rangeLabel()} ago`}</span><span>${S.echo ? `${utcTime(S.echo.to)} UTC` : 'now'}</span></div>`;
  }

  function drawPanel() {
    const list = scoped(base());
    const groups = groupStories(list);
    const sources = new Set(list.map((i) => i.source));
    const panel = $('#panel');
    if (S.selected) {
      const c = COUNTRY.get(S.selected) || { name: S.selected };
      const watching = S.watch.has(S.selected);
      const mix = {};
      list.forEach((i) => { mix[i.topics[0]] = (mix[i.topics[0]] || 0) + 1; });
      const mixE = Object.entries(mix).sort((a, b) => b[1] - a[1]);
      const withs = new Map();
      for (const it of list) for (const o of it.links) if (o !== S.selected && it.links.includes(S.selected)) withs.set(o, (withs.get(o) || 0) + 1);
      const topWith = [...withs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
      panel.innerHTML = `<div class="ov">
        <div class="cp-head"><div><h2>${esc(c.name)}</h2><div class="cp-sub">${esc([c.sub || c.region, c.capital].filter(Boolean).join(' · '))}</div></div>
          <div class="cp-acts">
            <button class="ic" type="button" id="watchBtn" aria-pressed="${watching}" aria-label="${watching ? 'Remove from' : 'Add to'} watchlist" title="Watchlist"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.8 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3.1 1.2-6.2L3 9.6l6.3-.8z" ${watching ? 'fill="currentColor"' : ''}/></svg></button>
            <button class="ic" type="button" id="closeC" aria-label="Back to world view" title="Back to world"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
          </div></div>
        <div class="ov-stats" style="margin-top:12px"><div><b>${groups.length}</b><span>stories, ${rangeLabel()}</span></div><div><b>${sources.size}</b><span>sources</span></div><div><b>${list[0] ? ago(list[0].published) : '—'}</b><span>latest</span></div></div>
        ${list.length ? spark(list) : ''}
        ${mixE.length ? `<div class="mix" aria-hidden="true">${mixE.map(([t, n]) => `<i style="width:${(n / list.length) * 100}%;background:var(--t-${t})"></i>`).join('')}</div>
        <div class="mix-l">${mixE.slice(0, 5).map(([t, n]) => `<span style="--c:var(--t-${t})">${esc(TOPIC_NAME[t])} ${Math.round((n / list.length) * 100)}%</span>`).join('')}</div>` : ''}
        ${topWith.length ? `<div class="withs"><span>Named with</span>${topWith.map(([o, n]) => { const id = [S.selected, o].sort().join('|'); return `<button type="button" data-pair="${esc(id)}" aria-pressed="false" title="${n} ${n === 1 ? 'story' : 'stories'}">${esc(nameOf(o))}</button>`; }).join('')}</div>` : ''}
      </div>`;
      $('#watchBtn').onclick = () => toggleWatch(S.selected);
      $('#closeC').onclick = clearSelection;
    } else if (S.pair) {
      const [a, b] = S.pair.split('|');
      panel.innerHTML = `<div class="ov"><div class="cp-head"><div><h2>${esc(nameOf(a))} – ${esc(nameOf(b))}</h2><div class="cp-sub">${groups.length} ${groups.length === 1 ? 'story names' : 'stories name'} both, ${rangeLabel()}</div></div>
        <div class="cp-acts"><button class="ic" type="button" id="closeC" aria-label="Back to world view"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div></div></div>`;
      $('#closeC').onclick = clearSelection;
    } else if (S.echo) {
      const e = S.echo;
      const note = e.note === undefined ? '<p class="echo-text wait">The local model is reading these stories…</p>' : e.note ? `<p class="echo-text">${esc(e.note)}</p>` : '';
      panel.innerHTML = `<div class="ov">
        <div class="cp-head"><div><div class="echo-tag">Echo</div><p class="echo-move">${esc(e.name)} ${e.pct >= 0 ? '▲ +' : '▼ '}${e.pct.toFixed(2)}%</p><div class="echo-when">${esc(echoWhen(e))}</div></div>
          <div class="cp-acts"><button class="ic" type="button" id="closeC" aria-label="Leave Echo" title="Back to now"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div></div>
        ${list.length ? `<div class="ov-stats" style="margin-top:8px"><div><b>${groups.length}</b><span>stories</span></div><div><b>${current.byIso.size}</b><span>countries</span></div><div><b>${sources.size}</b><span>sources</span></div></div>${note}` : '<p class="echo-text">Meridian has no stories stored from this moment. It keeps the last 7 days.</p>'}
        <p class="echo-warn">Reported around the same time. That doesn't show one caused the other.</p>
      </div>`;
      $('#closeC').onclick = exitEcho;
    } else {
      panel.innerHTML = `<div class="ov"><div class="ov-stats"><div><b>${groups.length}</b><span>stories, ${rangeLabel()}</span></div><div><b>${current.byIso.size}</b><span>countries</span></div><div><b>${sources.size}</b><span>sources</span></div></div>${spark(list)}</div>`;
    }
  }

  // ---------- feed ----------
  function ago(t) {
    const m = Math.max(0, Math.round((Date.now() - t) / 60e3));
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  function storyHTML(group) {
    const it = group[0];
    const others = group.slice(1);
    const t = S.topic && it.topics.includes(S.topic) ? S.topic : it.topics[0];
    const open = S.open.has(it.cluster);
    return `<article class="st ${S.freshIds.has(it.id) ? 'fresh' : ''}" data-cluster="${esc(it.cluster)}">
      <div class="st-meta"><span class="st-src">${esc(it.sourceName)}</span><time class="st-time" data-t="${it.published}" title="${esc(new Date(it.published).toUTCString())}">${ago(it.published)}</time><span class="st-topic" style="--c:var(--t-${t})">${esc(TOPIC_NAME[t])}</span>${(it.ai?.importance || 0) >= IMPORTANT ? '<span class="st-major">Major</span>' : ''}</div>
      <h3 class="st-title"><a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${esc(it.title)}</a></h3>
      ${it.summary && it.summary !== it.title ? `<p class="st-sum">${esc(it.summary)}</p>` : ''}
      <div class="st-foot">${it.countries.slice(0, 4).map((c) => `<button class="flag" type="button" data-iso="${esc(c)}">${esc(nameOf(c))}</button>`).join('')}${others.length ? `<button class="more-src" type="button" data-more="${esc(it.cluster)}" aria-expanded="${open}">+${others.length} more ${others.length === 1 ? 'source' : 'sources'}</button>` : ''}</div>
      ${it.image ? `<img class="st-img" src="${esc(it.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}
      ${open ? `<ul class="others">${others.map((o) => `<li><b>${esc(o.sourceName)} · ${ago(o.published)}</b><a href="${esc(o.url)}" target="_blank" rel="noopener noreferrer">${esc(o.title)}</a></li>`).join('')}</ul>` : ''}
    </article>`;
  }

  function drawFeed() {
    const feed = $('#feed');
    const groups = groupStories(scoped(base()));
    if (!S.items.length) {
      feed.innerHTML = S.connected ? '<p class="none">No stories have arrived yet. The first feeds usually answer within a few seconds.</p>' : '<div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div>';
      return;
    }
    if (!groups.length) {
      feed.innerHTML = `<p class="none">${S.watchOnly && !S.watch.size ? 'Your watchlist is empty. Select a country and press its star to follow it.' : 'No stories match these filters in this period.'}</p>`;
      return;
    }
    feed.innerHTML = groups.slice(0, S.shown).map(storyHTML).join('') + (groups.length > S.shown ? `<button class="more-btn" type="button" id="moreBtn">Show more (${groups.length - S.shown})</button>` : '');
  }

  $('#feed').addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.remove(); }, true);
  $('#feed').addEventListener('click', (e) => {
    const f = e.target.closest('.flag');
    if (f) return select(f.dataset.iso, true);
    const m = e.target.closest('.more-src');
    if (m) { const c = m.dataset.more; S.open.has(c) ? S.open.delete(c) : S.open.add(c); return drawFeed(); }
    if (e.target.id === 'moreBtn') { S.shown += PAGE; drawFeed(); }
  });
  $('#panel').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pair]');
    if (b) { S.pair = b.dataset.pair; S.selected = ''; S.shown = PAGE; refresh(); }
  });
  const setBoard = (open) => {
    $('#board').classList.toggle('closed', !open);
    $('#boardToggle').setAttribute('aria-expanded', String(open));
  };
  $('#boardToggle').addEventListener('click', () => {
    const open = $('#board').classList.contains('closed');
    setBoard(open);
    store.set('meridian-board', open);
  });
  // It sits over the South Pacific; on a small map that would cover land, so it starts folded there
  const mapBox = $('#mapwrap').getBoundingClientRect();
  setBoard(store.get('meridian-board', mapBox.width >= 880 && mapBox.height >= 640));
  $('#boardList').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) select(b.dataset.iso, true); });

  function toggleWatch(iso) {
    S.watch.has(iso) ? S.watch.delete(iso) : S.watch.add(iso);
    store.set('meridian-watch', [...S.watch]);
    refresh();
  }

  // ---------- ticker, status, clock ----------
  let tickerKey = '';
  function drawTicker() {
    const latest = groupStories(S.items.filter((i) => i.topics[0] !== 'general')).slice(0, 14).map((g) => g[0]);
    const key = latest.map((i) => i.id).join();
    if (key === tickerKey || !latest.length) return;
    tickerKey = key;
    const html = latest.map((i) => `<a href="${esc(i.url)}" target="_blank" rel="noopener noreferrer"><small>${esc(i.sourceName)}</small>${esc(i.title)}</a>`).join('');
    // Doubled so the loop is seamless; the copy is hidden from screen readers and tab order
    $('#ticker').innerHTML = html + `<span aria-hidden="true" style="display:contents" inert>${html}</span>`;
  }

  function drawStatus() {
    const ok = S.feeds.filter((f) => f.ok).length;
    const age = S.at ? Math.round((Date.now() - S.at) / 1000) : null;
    const stale = age !== null && age > 5 * 60;
    $('#liveDot').className = 'dot ' + (S.connected && !stale ? 'on' : S.at ? 'off' : '');
    $('#liveWord').textContent = S.connected && !stale ? 'Live' : S.at ? 'Reconnecting' : 'Connecting';
    $('#liveInfo').textContent = S.at ? `checked ${age < 60 ? age + 's' : Math.round(age / 60) + 'm'} ago · ${ok}/${S.feeds.length} sources` : '';
    // The portfolio prototype shows a saved copy, so it says so instead of "Live"
    if (window.MERIDIAN_PROTOTYPE) {
      $('#liveDot').className = 'dot off';
      $('#liveWord').textContent = 'Prototype';
      $('#liveInfo').textContent = `saved ${new Date(window.MERIDIAN_PROTOTYPE.at).toUTCString().slice(5, 22)} UTC · ${S.feeds.length} sources`;
    }
    const ai = S.ai;
    $('#majorOnly').hidden = !ai?.online && !S.items.some((i) => i.ai);
    $('#aiStatus').textContent = !ai ? '' : ai.online ? `${ai.model} is running on this computer. ${ai.tagged} stories read since the server started${ai.waiting ? `, ${ai.waiting} waiting` : ''}.` : `Off: ${ai.error}. Meridian is using keyword tags until it comes back.`;
    $('#feedList').innerHTML = S.feeds.map((f) => `<li><span class="fd ${f.ok === true ? 'ok' : f.ok === false ? 'bad' : ''}"></span><span>${esc(f.name)}</span><small>${f.ok === false ? 'unavailable' : f.ok === true ? `${ago(f.lastOk)}` : '…'}</small></li>`).join('');
  }

  function drawBrief() {
    const b = S.brief;
    const el = $('#brief');
    el.hidden = !b;
    if (!b) return;
    el.innerHTML = `<div class="brief-top"><b>Live brief</b><span>AI summary · <time id="briefAge"></time></span></div>${b.title ? `<h3>${esc(b.title)}</h3>` : ''}<p>${esc(b.text)}</p>`;
    tickBrief();
  }
  function tickBrief() {
    const age = $('#briefAge');
    if (!age || !S.brief) return;
    const s = Math.max(0, Math.round((Date.now() - S.brief.at) / 1000));
    age.textContent = s < 90 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
  }

  function tickClock() {
    const d = new Date();
    $('#clock').textContent = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
  }

  // ---------- refresh ----------
  function writeHash() {
    const h = new URLSearchParams();
    if (S.selected) h.set('c', S.selected);
    if (S.hours !== 24) h.set('r', S.hours);
    if (S.topic) h.set('t', S.topic);
    const s = h.toString();
    history.replaceState(null, '', s ? '#' + s : location.pathname + location.search);
  }
  function refresh() {
    drawData();
    drawPanel();
    drawFeed();
    drawControls();
    writeHash();
  }
  function drawControls() {
    $$('#range button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.h === S.hours)));
    $$('#topics button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.t === S.topic)));
    $('#watchOnly').setAttribute('aria-pressed', String(S.watchOnly));
    $('#majorOnly').setAttribute('aria-pressed', String(S.majorOnly));
    $('#watchN').textContent = S.watch.size || '';
    $('#links').setAttribute('aria-pressed', String(S.showLinks));
    $('#source').value = S.source;
    $('#mapMsg').hidden = true;
    drawStoryBtn();
  }

  // ---------- data ----------
  async function load(first) {
    const res = await fetch('/api/news', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const fresh = first ? [] : data.items.filter((i) => !S.ids.has(i.id));
    S.items = data.items;
    S.ids = new Set(data.items.map((i) => i.id));
    S.feeds = data.feeds;
    S.at = data.at;
    S.ai = data.ai;
    S.brief = data.brief;
    const select_ = $('#source');
    if (select_.options.length <= 1) select_.insertAdjacentHTML('beforeend', [...data.feeds].sort((a, b) => a.name.localeCompare(b.name)).map((f) => `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join(''));
    return fresh;
  }

  let reading = () => $('#feed').scrollTop > 140 || (innerWidth <= 860 && scrollY > innerHeight * 0.9);
  async function update(quiet = false) {
    try {
      const fresh = await load(quiet);
      S.freshIds = new Set(fresh.map((i) => i.id));
      const wasReading = reading();
      refresh();
      drawTicker();
      drawStatus();
      if (fresh.length) {
        fresh.slice(0, 12).forEach((it, i) => { if (it.countries[0]) setTimeout(() => ping(it.countries[0]), i * 180); });
        $('#announce').textContent = `${fresh.length} new ${fresh.length === 1 ? 'story' : 'stories'}`;
        if (wasReading) {
          S.pendingNew += fresh.length;
          const pill = $('#newPill');
          pill.textContent = `↑ ${S.pendingNew} new ${S.pendingNew === 1 ? 'story' : 'stories'}`;
          pill.hidden = false;
        }
        if (document.hidden) { unseen += fresh.length; document.title = `(${unseen}) Meridian — Live geopolitical monitor`; }
        storyAuto(fresh);
      }
    } catch (e) {
      S.connected = false;
      drawStatus();
    }
  }
  let unseen = 0;
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { unseen = 0; document.title = 'Meridian — Live geopolitical monitor'; } });
  $('#newPill').addEventListener('click', () => {
    $('#newPill').hidden = true;
    S.pendingNew = 0;
    if (innerWidth <= 860) $('.side').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    else $('#feed').scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  $('#feed').addEventListener('scroll', () => {
    if ($('#feed').scrollTop < 40 && S.pendingNew) { S.pendingNew = 0; $('#newPill').hidden = true; }
  }, { passive: true });

  function connect() {
    const es = new EventSource('/api/stream');
    es.onopen = () => { S.connected = true; drawStatus(); };
    // Several feeds can report within a moment of each other; one fetch covers them all
    let pending = null;
    es.addEventListener('update', (e) => {
      S.connected = true;
      const quiet = !!JSON.parse(e.data).quiet;
      if (pending) { pending.quiet = pending.quiet && quiet; return; }
      pending = { quiet };
      setTimeout(() => { const p = pending; pending = null; update(p.quiet); }, 400);
    });
    es.addEventListener('status', (e) => {
      S.connected = true;
      const d = JSON.parse(e.data);
      S.feeds = d.feeds;
      if (d.at) S.at = d.at;
      S.ai = d.ai;
      drawStatus();
    });
    es.addEventListener('markets', () => { loadMarkets(); loadStocks(); });
    es.addEventListener('brief', (e) => { S.brief = JSON.parse(e.data); drawBrief(); });
    es.onerror = () => { S.connected = false; drawStatus(); };
  }
  // Safety net if the stream is blocked by a proxy
  setInterval(() => { if (!S.connected) update(); }, 3 * 60e3);
  setInterval(() => {
    tickClock();
    $$('.st-time').forEach((el) => { el.textContent = ago(+el.dataset.t); });
  }, 15000);
  setInterval(() => { drawStatus(); drawMarketNote(); tickBrief(); }, 5000);
  setInterval(() => { if (!S.connected) loadMarkets(); }, 60e3);

  // ---------- story mode ----------
  // Plays conflict reports one by one: the globe flies to the country, an illustration plays there,
  // and the story opens as a card. Feeds give a country, never an exact place or a launch point,
  // so the illustration is placed on the country and says so; its routes are not real.
  const EVENT_INFO = {
    missile: { label: 'Missile launch reported', short: 'Missile' },
    drone: { label: 'Drone activity reported', short: 'Drones' },
    airstrike: { label: 'Strike reported', short: 'Strike' },
    attack: { label: 'Attack reported', short: 'Attack' },
    war: { label: 'Military activity', short: 'Military' },
  };
  const EVENT_ICON = {
    missile: '<path d="M12 2c3 3 4 7 3 11l2 3-2 1-1-2h-4l-1 2-2-1 2-3c-1-4 0-8 3-11Z"/><path d="M10 20l2 2 2-2"/>',
    drone: '<circle cx="5" cy="5" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M7 7l3 3m7-3-3 3m-7 7 3-3m7 3-3-3"/><rect x="10" y="10" width="4" height="4" rx="1"/>',
    airstrike: '<path d="M2 13l9-2 3-7h2l-1 7 7 1v2l-7 1 1 7h-2l-3-7-9-2Z"/>',
    attack: '<path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19"/><circle cx="12" cy="12" r="2.5"/>',
    war: '<path d="M4 20 20 4M14 4h6v6M4 4l16 16M4 14v6h6"/>',
  };
  const STORY_MS = 9500;
  const STORY = {
    list: [], i: 0, playing: false, paused: false, timer: null, startedAt: 0, left: STORY_MS,
    auto: store.get('meridian-story-auto', false), prevMode: null, prevScale: 1, lastUser: 0, raf: 0, fx: null,
  };
  const gFx = root.append('g').attr('class', 'fx');
  const card = $('#storyCard');
  const bar = $('#storyBar');
  const leader = d3.select('#storyLine');

  // Recent conflict reports, one per story cluster, newest first
  function storyList(limit = 10) {
    const seen = new Set();
    const out = [];
    for (const it of S.items) {
      if (!it.event || !it.countries[0] || !COUNTRY.has(it.countries[0])) continue;
      if (Date.now() - it.published > S.hours * 3600e3) break;
      if (seen.has(it.cluster)) continue;
      seen.add(it.cluster);
      out.push(it);
      if (out.length >= limit) break;
    }
    return out;
  }
  function drawStoryBtn() {
    const n = storyList().length;
    $('#storyN').textContent = n ? n : '';
    $('#storyBtn').disabled = !n;
    $('#storyBtn').title = n ? `Play the ${n} latest conflict ${n === 1 ? 'report' : 'reports'} on the globe` : 'No conflict reports in this period';
    $('#storyAuto').setAttribute('aria-pressed', String(STORY.auto));
  }

  // Projected point lifted above the surface (h = 0 is on the ground)
  function lifted(ll, h) {
    const p = projection(ll);
    if (!p) return null;
    const [cx, cy] = projection.translate();
    return [cx + (p[0] - cx) * (1 + h), cy + (p[1] - cy) * (1 + h)];
  }
  const onFront = (ll) => d3.geoDistance(ll, [-globeRot[0], -globeRot[1]]) < Math.PI / 2 - 0.05;
  const offset = (ll, bearing, deg) => {
    const r = Math.PI / 180, lat = ll[1] * r, lon = ll[0] * r, d = deg * r, b = bearing * r;
    const lat2 = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(b));
    const lon2 = lon + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat), Math.cos(d) - Math.sin(lat) * Math.sin(lat2));
    return [lon2 / r, lat2 / r];
  };

  // Fly the globe to a point while zooming in
  function flyStory(ll, scale, done) {
    const dur = reduceMotion ? 0 : 1300;
    spinning = false;
    const from = globeRot.slice(), to = [-ll[0], -Math.max(-60, Math.min(60, ll[1]))];
    const dLon = ((to[0] - from[0] + 540) % 360) - 180;
    const s0 = globeScale;
    d3.transition('story').duration(dur).ease(d3.easeCubicInOut).tween('fly', () => (t) => {
      globeRot = [from[0] + dLon * t, from[1] + (to[1] - from[1]) * t];
      // pull back a little mid-flight, then dive in
      globeScale = s0 + (scale - s0) * t - Math.sin(Math.PI * t) * 0.35 * Math.min(s0, scale);
      fit();
      drawGeometry();
    }).on('end', done);
    if (!dur) { globeRot = to; globeScale = scale; fit(); drawGeometry(); done(); }
  }

  // ----- illustrations, drawn in SVG every frame so they follow the globe -----
  function buildFx(kind, ll) {
    gFx.selectAll('*').remove();
    const g = gFx.append('g').attr('class', `fx-${kind}`);
    const fx = { kind, ll, g, t0: performance.now(), parts: {} };
    const P = fx.parts;
    P.rings = [0, 1, 2].map(() => g.append('circle').attr('class', 'fx-ring'));
    P.core = g.append('circle').attr('class', 'fx-core').attr('r', 5);
    if (kind === 'missile') {
      fx.from = offset(ll, 245, 9);
      P.trail = g.append('path').attr('class', 'fx-trail');
      P.body = g.append('path').attr('class', 'fx-missile').attr('d', 'M-11,0 L7,-2.6 L12,0 L7,2.6 Z M-11,0 L-15,-5 L-8,-1.5 Z M-11,0 L-15,5 L-8,1.5 Z');
      P.flame = g.append('path').attr('class', 'fx-flame').attr('d', 'M-12,0 L-24,-3 L-20,0 L-24,3 Z');
      P.flash = g.append('circle').attr('class', 'fx-flash');
    } else if (kind === 'drone') {
      P.drones = [0, 1, 2].map(() => {
        const d = g.append('g').attr('class', 'fx-drone');
        d.append('path').attr('d', 'M-7,-7 L7,7 M7,-7 L-7,7');
        [[-7, -7], [7, -7], [-7, 7], [7, 7]].forEach(([x, y]) => d.append('circle').attr('class', 'rotor').attr('cx', x).attr('cy', y).attr('r', 3.6));
        d.append('rect').attr('x', -2.5).attr('y', -2.5).attr('width', 5).attr('height', 5).attr('rx', 1);
        d.append('circle').attr('class', 'blink').attr('r', 1.3).attr('cy', -1);
        return d;
      });
      P.flash = g.append('circle').attr('class', 'fx-flash');
    } else if (kind === 'airstrike') {
      fx.a = offset(ll, 300, 7); fx.b = offset(ll, 120, 7);
      P.path = g.append('path').attr('class', 'fx-route');
      P.jet = g.append('path').attr('class', 'fx-jet').attr('d', 'M12,0 L2,-2 L-3,-10 L-6,-10 L-3,-2 L-9,-1.5 L-12,-5 L-14,-5 L-12,0 L-14,5 L-12,5 L-9,1.5 L-3,2 L-6,10 L-3,10 L2,2 Z');
      P.blasts = [0, 1, 2].map(() => g.append('circle').attr('class', 'fx-blast'));
    } else if (kind === 'attack') {
      P.spikes = g.append('path').attr('class', 'fx-spikes');
      P.flash = g.append('circle').attr('class', 'fx-flash');
    } else {
      fx.a = offset(ll, 20, 4); fx.b = offset(ll, 200, 4);
      P.front = g.append('path').attr('class', 'fx-front');
      P.arrows = [0, 1, 2, 3].map((k_) => g.append('path').attr('class', `fx-arrow ${k_ < 2 ? 'a' : 'b'}`).attr('d', 'M-5,-6 L3,0 L-5,6'));
    }
    STORY.fx = fx;
    if (!STORY.raf) STORY.raf = requestAnimationFrame(fxFrame);
  }

  function linePath(a, b, lift, n = 28) {
    const between = d3.geoInterpolate(a, b);
    let out = '';
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const ll = between(u);
      if (!onFront(ll)) continue;
      const p = lifted(ll, lift * Math.sin(Math.PI * u));
      if (p) out += `${out ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`;
    }
    return out;
  }

  function fxFrame(now) {
    STORY.raf = 0;
    const fx = STORY.fx;
    if (!fx) return;
    const { kind, ll, parts: P } = fx;
    const t = reduceMotion ? 1.6 : (now - fx.t0) / 1000;
    const visible = onFront(ll);
    fx.g.style('display', visible ? null : 'none');
    const c = projection(ll);
    const zoomK = Math.max(1, globeScale);
    if (visible && c) {
      // Rings that keep spreading from the place
      P.rings.forEach((r, i) => {
        const ph = ((t * 0.55 + i / 3) % 1);
        r.attr('cx', c[0]).attr('cy', c[1]).attr('r', 6 + ph * 34 * zoomK * 0.6).style('opacity', (1 - ph) * 0.8);
      });
      P.core.attr('cx', c[0]).attr('cy', c[1]);
      const cycle = 3.4;
      const u = (t % cycle) / cycle;
      if (kind === 'missile') {
        const fly = Math.min(1, u / 0.62);
        const between = d3.geoInterpolate(fx.from, ll);
        const pos = lifted(between(fly), 0.16 * Math.sin(Math.PI * fly));
        const ahead = lifted(between(Math.min(1, fly + 0.02)), 0.16 * Math.sin(Math.PI * Math.min(1, fly + 0.02)));
        const ang = pos && ahead ? (Math.atan2(ahead[1] - pos[1], ahead[0] - pos[0]) * 180) / Math.PI : 0;
        const inFlight = fly < 1;
        P.trail.style('opacity', inFlight ? 0.85 : Math.max(0, 1 - (u - 0.62) * 3)).attr('d', (() => {
          let out = '';
          for (let i = 0; i <= 26; i++) {
            const v = (i / 26) * fly;
            const q = lifted(between(v), 0.16 * Math.sin(Math.PI * v));
            if (q && onFront(between(v))) out += `${out ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`;
          }
          return out;
        })());
        const sc = 0.9 + 0.5 * Math.sin(Math.PI * fly);
        [P.body, P.flame].forEach((el) => el.attr('transform', pos ? `translate(${pos[0]},${pos[1]}) rotate(${ang}) scale(${sc})` : 'translate(-999,-999)').style('opacity', inFlight ? 1 : 0));
        P.flame.style('opacity', inFlight ? 0.6 + 0.4 * Math.sin(t * 40) : 0);
        const hit = u - 0.62;
        P.flash.attr('cx', c[0]).attr('cy', c[1]).attr('r', hit > 0 ? 4 + hit * 120 : 0).style('opacity', hit > 0 ? Math.max(0, 1 - hit * 2.6) : 0);
      } else if (kind === 'drone') {
        const R = 26 * Math.min(2.2, zoomK * 0.7);
        P.drones.forEach((d, i) => {
          const a = t * 0.9 + (i * Math.PI * 2) / 3;
          const dive = i === 0 && u > 0.6 ? Math.min(1, (u - 0.6) / 0.25) : 0;
          const x = c[0] + Math.cos(a) * R * (1 - dive);
          const y = c[1] + Math.sin(a) * R * 0.55 * (1 - dive) - 26 * (1 - dive);
          d.attr('transform', `translate(${x},${y}) scale(${1 - dive * 0.5})`).style('opacity', i === 0 && u > 0.86 ? 0 : 1);
          d.selectAll('.rotor').style('opacity', 0.45 + 0.4 * Math.abs(Math.sin(t * 30 + i)));
          d.select('.blink').style('opacity', Math.sin(t * 8 + i) > 0 ? 1 : 0.2);
        });
        const hit = u - 0.85;
        P.flash.attr('cx', c[0]).attr('cy', c[1]).attr('r', hit > 0 ? 4 + hit * 160 : 0).style('opacity', hit > 0 ? Math.max(0, 1 - hit * 6) : 0);
      } else if (kind === 'airstrike') {
        P.path.attr('d', linePath(fx.a, fx.b, 0.05));
        const between = d3.geoInterpolate(fx.a, fx.b);
        const pos = lifted(between(u), 0.05 * Math.sin(Math.PI * u));
        const ahead = lifted(between(Math.min(1, u + 0.02)), 0.05 * Math.sin(Math.PI * Math.min(1, u + 0.02)));
        const ang = pos && ahead ? (Math.atan2(ahead[1] - pos[1], ahead[0] - pos[0]) * 180) / Math.PI : 0;
        P.jet.attr('transform', pos ? `translate(${pos[0]},${pos[1]}) rotate(${ang}) scale(1.1)` : 'translate(-999,-999)');
        P.blasts.forEach((b, i) => {
          const at = 0.42 + i * 0.08;
          const ph = u - at;
          const q = projection(between(at));
          b.attr('cx', q ? q[0] : -999).attr('cy', q ? q[1] : -999).attr('r', ph > 0 ? 3 + ph * 90 : 0).style('opacity', ph > 0 ? Math.max(0, 1 - ph * 4) : 0);
        });
      } else if (kind === 'attack') {
        const ph = u < 0.5 ? u / 0.5 : 1;
        const n = 12;
        let d = '';
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + 0.3;
          const r1 = 8 + ph * 10, r2 = 8 + ph * 34;
          d += `M${(c[0] + Math.cos(a) * r1).toFixed(1)},${(c[1] + Math.sin(a) * r1).toFixed(1)}L${(c[0] + Math.cos(a) * r2).toFixed(1)},${(c[1] + Math.sin(a) * r2).toFixed(1)}`;
        }
        P.spikes.attr('d', d).style('opacity', u < 0.6 ? 1 - u : 0);
        P.flash.attr('cx', c[0]).attr('cy', c[1]).attr('r', 6 + ph * 22).style('opacity', u < 0.5 ? 0.9 - u : 0);
      } else {
        P.front.attr('d', linePath(fx.a, fx.b, 0, 16));
        const between = d3.geoInterpolate(fx.a, fx.b);
        P.arrows.forEach((ar, i) => {
          const along = 0.3 + (i % 2) * 0.4;
          const base_ = projection(between(along));
          const side = i < 2 ? -1 : 1;
          const push = 8 + 6 * Math.sin(t * 3 + i);
          const pa = projection(fx.a), pb = projection(fx.b);
          const nx = pa && pb ? -(pb[1] - pa[1]) : 0, ny = pa && pb ? pb[0] - pa[0] : 1;
          const len = Math.hypot(nx, ny) || 1;
          const ang = (Math.atan2(-side * ny, -side * nx) * 180) / Math.PI;
          if (base_) ar.attr('transform', `translate(${base_[0] + (side * nx / len) * push},${base_[1] + (side * ny / len) * push}) rotate(${ang})`);
        });
      }
    }
    placeCard();
    if (!reduceMotion && STORY.fx) STORY.raf = requestAnimationFrame(fxFrame);
  }

  // ----- the 3D story card -----
  function storyCardHTML(it) {
    const info = EVENT_INFO[it.event] || EVENT_INFO.attack;
    const group = S.items.filter((x) => x.cluster === it.cluster);
    const others = new Set(group.map((x) => x.sourceName));
    others.delete(it.sourceName);
    return `
      <div class="sc-media${it.image ? '' : ' no-img'}">
        ${it.image ? `<img src="${esc(it.image)}" alt="" referrerpolicy="no-referrer">` : ''}
        <svg class="sc-glyph" viewBox="0 0 24 24" aria-hidden="true">${EVENT_ICON[it.event] || EVENT_ICON.attack}</svg>
        <span class="sc-kind"><svg viewBox="0 0 24 24" aria-hidden="true">${EVENT_ICON[it.event] || EVENT_ICON.attack}</svg>${esc(info.label)}</span>
      </div>
      <div class="sc-body">
        <p class="sc-place">${esc(nameOf(it.countries[0]))} · <span class="st-time" data-t="${it.published}">${esc(ago(it.published))}</span></p>
        <h3>${esc(it.title)}</h3>
        ${it.summary ? `<p class="sc-sum">${esc(it.summary)}</p>` : ''}
        <p class="sc-src">${esc(it.sourceName)}${others.size ? ` <span>+ ${others.size} other ${others.size === 1 ? 'outlet' : 'outlets'}</span>` : ''}</p>
        <div class="sc-acts">
          <a class="sc-read" href="${esc(it.url)}" target="_blank" rel="noopener">Read the article ↗</a>
          <button type="button" class="sc-country" data-iso="${esc(it.countries[0])}">All ${esc(nameOf(it.countries[0]))} news</button>
        </div>
        <p class="sc-note">Illustration placed on the country, not the exact location. Routes and weapons shown are not real tracks.</p>
      </div>`;
  }

  function placeCard() {
    const fx = STORY.fx;
    if (!fx || card.hidden) return;
    const p = projection(fx.ll);
    const box = $('#mapwrap').getBoundingClientRect();
    if (!p || !onFront(fx.ll)) { leader.attr('d', null); return; }
    const cw = card.offsetWidth, ch = card.offsetHeight;
    const right = p[0] < box.width * 0.56;
    let x = right ? p[0] + 70 : p[0] - 70 - cw;
    let y = p[1] - ch * 0.42;
    x = Math.max(12, Math.min(box.width - cw - 12, x));
    y = Math.max(12, Math.min(box.height - ch - 70, y));
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    card.classList.toggle('from-left', !right);
    const ex = right ? x : x + cw, ey = y + Math.min(ch * 0.42, 120);
    const mx = (p[0] + ex) / 2;
    leader.attr('d', `M${p[0]},${p[1]} C${mx},${p[1]} ${mx},${ey} ${ex},${ey}`);
  }

  function showStory(i) {
    STORY.i = (i + STORY.list.length) % STORY.list.length;
    const it = STORY.list[STORY.i];
    const c = COUNTRY.get(it.countries[0]);
    const ll = [c.lon, c.lat];
    clearTimeout(STORY.timer);
    card.classList.remove('on');
    leader.attr('d', null);
    $('#storyCount').textContent = `${STORY.i + 1} / ${STORY.list.length}`;
    $('#storyKind').textContent = (EVENT_INFO[it.event] || EVENT_INFO.attack).short;
    const prog = $('#storyProg');
    prog.style.animation = 'none';
    gFx.selectAll('*').remove();
    STORY.fx = null;
    const shape = features.find((f) => f.iso === it.countries[0]);
    const area = shape ? d3.geoArea(shape) : 0.002;
    // small countries get a close-up, very large ones stay wide enough to see whole
    const zoomTo = Math.max(1.5, Math.min(3.6, 3.6 - 0.9 * Math.log10(1 + area * 4000)));
    flyStory(ll, zoomTo, () => {
      if (!STORY.playing) return;
      buildFx(it.event, ll);
      card.innerHTML = storyCardHTML(it);
      const img = card.querySelector('.sc-media img');
      if (img) img.addEventListener('error', () => { img.parentNode.classList.add('no-img'); img.remove(); }, { once: true });
      card.hidden = false;
      placeCard();
      requestAnimationFrame(() => card.classList.add('on'));
      prog.style.animation = '';
      void prog.offsetWidth;
      prog.style.animation = `storyProg ${STORY_MS}ms linear forwards`;
      prog.style.animationPlayState = STORY.paused ? 'paused' : 'running';
      ping(it.countries[0]);
      $('#announce').textContent = `${(EVENT_INFO[it.event] || EVENT_INFO.attack).label} in ${nameOf(it.countries[0])}: ${it.title}`;
      STORY.startedAt = Date.now();
      STORY.left = STORY_MS;
      if (!STORY.paused) STORY.timer = setTimeout(nextStory, STORY_MS);
    });
  }
  function nextStory() {
    if (STORY.i + 1 >= STORY.list.length) return stopStories();
    showStory(STORY.i + 1);
  }
  function playStories(list, auto = false) {
    if (!list.length) return;
    if (S.echo) exitEcho();
    STORY.list = list;
    STORY.paused = false;
    STORY.auto_run = auto;
    if (!STORY.playing) {
      STORY.prevMode = S.mode;
      STORY.prevScale = globeScale;
      if (S.mode !== 'globe') setMode('globe');
    }
    STORY.playing = true;
    document.body.classList.add('story-on');
    bar.hidden = false;
    $('#storyPause').setAttribute('aria-pressed', 'false');
    hideTip();
    showStory(0);
  }
  function stopStories() {
    if (!STORY.playing) return;
    STORY.playing = false;
    clearTimeout(STORY.timer);
    d3.select(document.documentElement).interrupt('story');
    cancelAnimationFrame(STORY.raf);
    STORY.raf = 0;
    STORY.fx = null;
    gFx.selectAll('*').remove();
    card.classList.remove('on');
    card.hidden = true;
    bar.hidden = true;
    leader.attr('d', null);
    document.body.classList.remove('story-on');
    globeScale = STORY.prevScale;
    if (STORY.prevMode && STORY.prevMode !== S.mode) setMode(STORY.prevMode);
    else resetView();
  }
  function pauseStories(p) {
    STORY.paused = p;
    $('#storyPause').setAttribute('aria-pressed', String(p));
    $('#storyProg').style.animationPlayState = p ? 'paused' : 'running';
    clearTimeout(STORY.timer);
    if (p) STORY.left = Math.max(800, STORY.left - (Date.now() - STORY.startedAt));
    else { STORY.startedAt = Date.now(); STORY.timer = setTimeout(nextStory, STORY.left); }
  }

  $('#storyBtn').addEventListener('click', () => (STORY.playing ? stopStories() : playStories(storyList())));
  $('#storyAuto').addEventListener('click', () => {
    STORY.auto = !STORY.auto;
    store.set('meridian-story-auto', STORY.auto);
    drawStoryBtn();
  });
  $('#storyPrev').addEventListener('click', () => showStory(STORY.i - 1));
  $('#storyNext').addEventListener('click', () => nextStory());
  $('#storyPause').addEventListener('click', () => pauseStories(!STORY.paused));
  $('#storyClose').addEventListener('click', stopStories);
  card.addEventListener('click', (e) => {
    const b = e.target.closest('.sc-country');
    if (!b) return;
    const iso = b.dataset.iso;
    stopStories();
    select(iso, true);
  });
  card.addEventListener('mouseenter', () => { if (STORY.playing && !STORY.paused) { STORY.hoverPaused = true; pauseStories(true); } });
  card.addEventListener('mouseleave', () => { if (STORY.hoverPaused) { STORY.hoverPaused = false; pauseStories(false); } });
  addEventListener('keydown', (e) => {
    if (!STORY.playing || e.target.closest?.('input, textarea, select')) return;
    if (e.key === 'Escape') stopStories();
    else if (e.key === 'ArrowRight') nextStory();
    else if (e.key === 'ArrowLeft') showStory(STORY.i - 1);
    else if (e.key === ' ' && !e.target.closest('button, a')) { e.preventDefault(); pauseStories(!STORY.paused); }
  });
  // Moving the globe by hand pauses the story instead of fighting the reader
  $('#map').addEventListener('pointerdown', () => { if (STORY.playing && !STORY.paused) pauseStories(true); });
  ['pointerdown', 'keydown', 'wheel'].forEach((ev) => addEventListener(ev, () => { STORY.lastUser = Date.now(); }, { passive: true }));
  addEventListener('resize', () => { if (STORY.playing) placeCard(); });

  // Auto: new conflict reports play by themselves, but only while the reader isn't busy with the page
  function storyAuto(fresh) {
    if (!STORY.auto || STORY.playing || S.echo || document.hidden) return;
    if (Date.now() - STORY.lastUser < 45e3) return;
    const list = fresh.filter((it) => it.event && it.countries[0] && COUNTRY.has(it.countries[0])).slice(0, 3);
    if (list.length) playStories(list, true);
  }

  // ---------- markets ----------
  const MK = { range: store.get('meridian-mk-range', '1d'), data: null, last: {} };
  if (!['1d', '5d', '1mo'].includes(MK.range)) MK.range = '1d';
  const money = (v) => (v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const utcTime = (t) => new Date(t).toISOString().slice(11, 16);
  const mkLabel = (t) => {
    const d = new Date(t);
    if (MK.range === '1d') return utcTime(t);
    if (MK.range === '5d') return d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  };
  const mkTipTime = (t) => (MK.range === '1d' ? `${utcTime(t)} UTC` : MK.range === '5d' ? `${mkLabel(t)} ${utcTime(t)}` : mkLabel(t));
  const MK_SPOKEN = { '1d': 'one day', '5d': 'five days', '1mo': 'one month' };

  // The largest moves on a chart, ones that don't overlap
  const MK_WINDOW = { '1d': 6, '5d': 4, '1mo': 1 };
  const MK_BAR = { '1d': 5 * 60e3, '5d': 30 * 60e3, '1mo': 86400e3 };
  const RETENTION = 7 * 86400e3;
  function mkMoves(pts) {
    const w = MK_WINDOW[MK.range];
    const found = [];
    for (let i = w; i < pts.length; i++) {
      const pct = ((pts[i][1] - pts[i - w][1]) / pts[i - w][1]) * 100;
      if (Math.abs(pct) >= 0.25 && Date.now() - pts[i][0] < RETENTION) found.push({ s: i - w, e: i, pct });
    }
    found.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
    const picked = [];
    for (const m of found) {
      if (picked.length === 3) break;
      if (picked.every((p) => m.e < p.s || m.s > p.e)) picked.push(m);
    }
    return picked;
  }
  const echoWhen = (e) => (e.to - e.start > 86400e3 || new Date(e.start).getUTCDate() !== new Date().getUTCDate()
    ? `${new Date(e.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}, ` : '') + `${utcTime(e.start)}–${utcTime(e.to)} UTC`;

  let echoRun = 0;
  function startEcho(item, s, e) {
    const pts = item.points;
    const start = pts[s][0];
    const to = pts[e][0] + MK_BAR[MK.range];
    const pct = ((pts[e][1] - pts[s][1]) / pts[s][1]) * 100;
    S.echo = { id: item.id, name: item.name, pct, start, from: start - 3600e3, to };
    S.selected = '';
    S.pair = '';
    S.shown = PAGE;
    refresh();
    drawMarkets();
    $('#feed').scrollTop = 0;
    const top = [...current.byIso.entries()].sort((a, b) => b[1].n - a[1].n).map(([iso]) => iso);
    if (top[0]) flyTo(top[0]);
    top.slice(0, 6).forEach((iso, i) => setTimeout(() => ping(iso), 1000 + i * 220));
    const run = ++echoRun;
    if (!base().length) { S.echo.note = ''; return; }
    fetch(`/api/echo?id=${item.id}&from=${S.echo.from}&to=${to}&pct=${pct.toFixed(3)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => ({ text: '' }))
      .then((d) => { if (run === echoRun && S.echo && !S.selected && !S.pair) { S.echo.note = d.text || ''; drawPanel(); } else if (run === echoRun && S.echo) S.echo.note = d.text || ''; });
  }
  function exitEcho() {
    if (!S.echo) return;
    S.echo = null;
    echoRun++;
    S.shown = PAGE;
    refresh();
    drawMarkets();
    resetView();
  }

  function drawChart(card, item) {
    const plot = $('.mk-plot', card);
    const focused = $('.mk-move:focus', plot)?.dataset.i;
    const w = plot.clientWidth;
    const h = plot.clientHeight;
    if (!w) return;
    const pts = item.points;
    const n = pts.length;
    if (n < 2) {
      plot.innerHTML = `<div class="mk-empty">${item.error ? 'Prices unavailable right now' : 'Loading prices…'}</div>`;
      return;
    }
    const pad = { l: 2, r: 44, t: 6, b: 15 };
    const showPrev = MK.range === '1d' && item.prevClose != null;
    const vals = pts.map((p) => p[1]).concat(showPrev ? [item.prevClose] : []);
    const y = d3.scaleLinear().domain(d3.extent(vals)).nice(3).range([h - pad.b, pad.t]);
    // Spaced by bar rather than clock time, so nights and weekends with no trading leave no gap
    const x = d3.scaleLinear().domain([0, n - 1]).range([pad.l, w - pad.r]);
    const line = d3.line().x((_, i) => x(i)).y((p) => y(p[1]))(pts);
    const labels = [0.03, 0.35, 0.66, 0.97].map((f) => Math.round((n - 1) * f));
    const moves = mkMoves(pts);
    // Echo's time window, shown on all three charts so they can be compared
    let band = '';
    if (S.echo) {
      const inside = pts.map((p, i) => [p[0], i]).filter(([t]) => t >= S.echo.start && t < S.echo.to).map(([, i]) => i);
      if (inside.length) band = `<rect class="mk-band" x="${x(inside[0]) - 2}" y="${pad.t}" width="${x(inside[inside.length - 1]) - x(inside[0]) + 4}" height="${h - pad.b - pad.t}"/>`;
    }
    plot.innerHTML = `<svg role="img" aria-label="${esc(item.name)} price over ${MK_SPOKEN[MK.range]}. Latest ${money(item.price)} ${esc(item.unit)}.">
      ${y.ticks(3).map((t) => `<line class="mk-grid" x1="${pad.l}" x2="${w - pad.r}" y1="${y(t)}" y2="${y(t)}"/><text class="mk-axis" x="${w - pad.r + 5}" y="${y(t) + 3}">${t.toLocaleString('en-US')}</text>`).join('')}
      ${showPrev ? `<line class="mk-prev" x1="${pad.l}" x2="${w - pad.r}" y1="${y(item.prevClose)}" y2="${y(item.prevClose)}"><title>Previous close ${money(item.prevClose)}</title></line>` : ''}
      ${band}
      <path class="mk-line" d="${line}"/>
      <circle class="mk-end" cx="${x(n - 1)}" cy="${y(pts[n - 1][1])}" r="4"/>
      ${labels.map((i, k) => `<text class="mk-axis" x="${x(i)}" y="${h - 3}" text-anchor="${k === 0 ? 'start' : k === 3 ? 'end' : 'middle'}">${mkLabel(pts[i][0])}</text>`).join('')}
      ${moves.map((m, k_) => `<circle class="mk-move" data-i="${k_}" cx="${x(m.e)}" cy="${y(pts[m.e][1])}" r="4" tabindex="0" role="button" aria-label="Echo: ${esc(item.name)} ${m.pct >= 0 ? 'rose' : 'fell'} ${Math.abs(m.pct).toFixed(2)} percent by ${esc(mkTipTime(pts[m.e][0]))}"/>`).join('')}
      <line class="mk-cross" y1="${pad.t}" y2="${h - pad.b}" visibility="hidden" pointer-events="none"/>
    </svg><div class="mk-tip" hidden></div>`;
    const svgEl = $('svg', plot);
    const tip = $('.mk-tip', plot);
    const cross = $('.mk-cross', plot);
    const show = (clientX) => {
      const i = Math.max(0, Math.min(n - 1, Math.round(x.invert(clientX - svgEl.getBoundingClientRect().left))));
      const px = x(i);
      cross.setAttribute('x1', px);
      cross.setAttribute('x2', px);
      cross.setAttribute('visibility', 'visible');
      tip.hidden = false;
      tip.innerHTML = `${money(pts[i][1])}<small>${mkTipTime(pts[i][0])}</small>`;
      tip.style.left = `${Math.max(0, Math.min(w - tip.offsetWidth, px - tip.offsetWidth / 2))}px`;
    };
    svgEl.addEventListener('pointermove', (e) => { MK.hover = { id: item.id, x: e.clientX }; show(e.clientX); });
    svgEl.addEventListener('pointerleave', () => { MK.hover = null; tip.hidden = true; cross.setAttribute('visibility', 'hidden'); });
    svgEl.addEventListener('click', (e) => {
      const ring = e.target.closest('.mk-move');
      if (ring) { const m = moves[+ring.dataset.i]; return startEcho(item, m.s, m.e); }
      const i = Math.max(0, Math.min(n - 1, Math.round(x.invert(e.clientX - svgEl.getBoundingClientRect().left))));
      startEcho(item, Math.max(0, i - MK_WINDOW[MK.range]), Math.max(i, 1));
    });
    svgEl.addEventListener('keydown', (e) => {
      const ring = e.target.closest?.('.mk-move');
      if (ring && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const m = moves[+ring.dataset.i]; startEcho(item, m.s, m.e); }
    });
    if (focused !== undefined) $(`.mk-move[data-i="${focused}"]`, plot)?.focus();
    // Prices redraw the chart while someone may be reading it; keep their place
    if (MK.hover?.id === item.id) show(MK.hover.x);
  }

  function drawMarkets() {
    const data = MK.data;
    if (!data) return;
    const host = $('#mkCards');
    if (!host.children.length) {
      host.innerHTML = data.items.map((it) => `<article class="mk" data-id="${esc(it.id)}"><div class="mk-top"><span class="mk-name">${esc(it.name)}</span><b class="mk-price"></b><span class="mk-chg"></span></div><div class="mk-plot"></div><div class="mk-foot"></div></article>`).join('');
    }
    data.items.forEach((it) => {
      const card = $(`.mk[data-id="${it.id}"]`, host);
      const price = $('.mk-price', card);
      price.textContent = it.price == null ? '–' : `$${money(it.price)}`;
      if (MK.last[it.id] != null && it.price !== MK.last[it.id]) {
        price.classList.remove('tick');
        void price.offsetWidth;
        price.classList.add('tick');
      }
      MK.last[it.id] = it.price;
      $('.mk-chg', card).innerHTML = it.pct == null ? '' : `<i class="${it.pct >= 0 ? 'up' : 'down'}" aria-hidden="true">${it.pct >= 0 ? '▲' : '▼'}</i>${it.pct >= 0 ? '+' : ''}${it.pct.toFixed(2)}%`;
      drawChart(card, it);
    });
    drawMarketNote();
  }

  function drawMarketNote() {
    const data = MK.data;
    if (!data) return;
    data.items.forEach((it) => {
      const foot = $(`.mk[data-id="${it.id}"] .mk-foot`);
      if (!foot) return;
      if (it.id === 'gold' && data.spot.price != null) {
        const age = data.spot.time ? Math.max(0, Math.round((Date.now() - data.spot.time) / 1000)) : null;
        foot.innerHTML = `Spot <b>$${money(data.spot.price)}</b>${age == null ? '' : ` · ${age < 90 ? `${age}s` : `${Math.round(age / 60)}m`} ago`}${data.spot.ok === false ? ' · not updating' : ''}`;
      } else {
        foot.innerHTML = it.low != null ? `Day <b>${money(it.low)} – ${money(it.high)}</b> ${esc(it.unit)}` : '';
      }
    });
    const times = data.items.map((i) => i.time).filter(Boolean);
    const failing = data.items.some((i) => i.error);
    const note = $('#mkNote');
    if (!times.length) { note.textContent = failing ? 'Prices unavailable right now' : ''; return; }
    const newest = Math.max(...times);
    const mins = Math.round((Date.now() - newest) / 60e3);
    note.textContent = (mins <= 25 ? `Futures delayed about ${Math.max(mins, 1)} min` : `Last trade ${utcTime(newest)} UTC`) + (failing ? ' · some prices not updating' : '');
  }

  async function loadMarkets() {
    try {
      const res = await fetch(`/api/markets?range=${MK.range}`, { cache: 'no-store' });
      if (!res.ok) return;
      MK.data = await res.json();
      drawMarkets();
    } catch { /* the next update tries again */ }
  }
  // ---------- companies (stocks) ----------
  const SECTORS = [['', 'All'], ['tech', 'Tech'], ['energy', 'Energy'], ['defense', 'Defence & aerospace'], ['finance', 'Finance'], ['auto', 'Automotive'], ['health', 'Health'], ['shipping', 'Shipping']];
  const STK = { view: store.get('meridian-mk-view', 'commodities'), sector: store.get('meridian-stk-sector', ''), data: null, last: {} };
  if (!['commodities', 'companies'].includes(STK.view)) STK.view = 'commodities';

  function stockSpark(points, up) {
    if (points.length < 2) return '';
    const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const W_ = 100, H_ = 28;
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${(((p[0] - x0) / (x1 - x0 || 1)) * W_).toFixed(1)},${(H_ - 2 - ((p[1] - y0) / (y1 - y0 || 1)) * (H_ - 4)).toFixed(1)}`).join('');
    return `<svg viewBox="0 0 ${W_} ${H_}" preserveAspectRatio="none" aria-hidden="true"><path class="${up ? 'up' : 'down'}" d="${d}"/></svg>`;
  }
  // How many headlines in the current period mention a company by name
  const mentions = (name) => {
    const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return S.items.filter((it) => inRange(it) && (re.test(it.title) || re.test(it.summary))).length;
  };

  function drawStocks() {
    $('#stkSectors').innerHTML = SECTORS.map(([id, label]) => `<button type="button" data-s="${id}" aria-pressed="${STK.sector === id}">${esc(label)}</button>`).join('');
    const data = STK.data;
    const host = $('#stkList');
    if (!data) { host.innerHTML = '<p class="stk-wait">Loading company prices…</p>'; return; }
    const list = data.items.filter((s) => !STK.sector || s.sector === STK.sector);
    host.innerHTML = list.map((s) => {
      const up = (s.pct ?? 0) >= 0;
      const n = mentions(s.name);
      const changed = STK.last[s.id] != null && s.price !== STK.last[s.id];
      STK.last[s.id] = s.price;
      return `<button type="button" class="stk" data-name="${esc(s.name)}" title="${esc(s.name)} (${esc(s.symbol)}) — show headlines that mention it">
        <span class="stk-top"><b>${esc(s.name)}</b><span class="stk-sym">${esc(s.symbol)}</span></span>
        <span class="stk-mid"><span class="stk-price${changed ? ' tick' : ''}">${s.price == null ? '–' : `${s.currency === 'USD' ? '$' : ''}${money(s.price)}${s.currency && s.currency !== 'USD' ? ` ${esc(s.currency)}` : ''}`}</span>
          ${s.pct == null ? '' : `<span class="stk-chg ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${up ? '+' : ''}${s.pct.toFixed(2)}%</span>`}</span>
        <span class="stk-plot">${stockSpark(s.points, up)}</span>
        <span class="stk-foot">${s.error ? esc(s.error) : n ? `${n} ${n === 1 ? 'headline' : 'headlines'}` : esc(SECTORS.find(([id]) => id === s.sector)?.[1] || '')}</span>
      </button>`;
    }).join('');
    const newest = Math.max(0, ...data.items.map((s) => s.time || 0));
    $('#stkNote').textContent = newest ? `Last trade ${new Date(newest).toUTCString().slice(5, 22)} UTC · delayed, for information only` : 'Delayed prices, for information only';
  }
  async function loadStocks() {
    if (STK.view !== 'companies') return;
    try {
      const res = await fetch('/api/stocks', { cache: 'no-store' });
      if (!res.ok) return;
      STK.data = await res.json();
      drawStocks();
    } catch { /* the next update tries again */ }
  }
  function setMkView(v) {
    STK.view = v;
    store.set('meridian-mk-view', v);
    $$('#mkView button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    $('#mkCards').hidden = v !== 'commodities';
    $('#mkRange').hidden = v !== 'commodities';
    $('.mk-hint').hidden = v !== 'commodities';
    $('#mkNote').hidden = v !== 'commodities';
    $('#stkWrap').hidden = v !== 'companies';
    if (v === 'companies') { drawStocks(); loadStocks(); }
  }
  $('#mkView').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setMkView(b.dataset.v); });
  $('#stkSectors').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    STK.sector = b.dataset.s;
    store.set('meridian-stk-sector', STK.sector);
    drawStocks();
  });
  // A company's tile filters the news to headlines that name it
  $('#stkList').addEventListener('click', (e) => {
    const b = e.target.closest('.stk');
    if (!b) return;
    const name = b.dataset.name;
    S.q = S.q === name ? '' : name;
    $('#q').value = S.q;
    S.shown = PAGE;
    refresh();
  });
  setInterval(() => { if (STK.view === 'companies' && !S.connected) loadStocks(); }, 60e3);

  const drawMkRange = () => $$('#mkRange button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.r === MK.range)));
  $('#mkRange').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    MK.range = b.dataset.r;
    store.set('meridian-mk-range', MK.range);
    drawMkRange();
    loadMarkets();
  });
  new ResizeObserver(() => { if (MK.data) drawMarkets(); }).observe($('#mkCards'));
  drawMkRange();
  loadMarkets();
  setMkView(STK.view);

  // ---------- live tv ----------
  // Players load only when asked for, so nothing streams or contacts YouTube until then.
  const CHANNELS = [
    { name: 'Al Jazeera', id: 'UCNye-wNBqNL5ZzHSJj3l8Bg' },
    { name: 'France 24', id: 'UCQfwfsi5VrQ8yKZ-UWmAEFg' },
    { name: 'DW', id: 'UCknLrEdhRCp1aegoMqRaCZg' },
    { name: 'CNA', id: 'UC83jt4dlz1Gjl58fzQrrKZg' },
    { name: 'Bloomberg', id: 'UCIALMKvObZNtJ6AmdCLP7Lg' },
  ];
  // YouTube refuses to play without a referrer, and the page's own policy sends none, so the frame asks for one
  const tvFrame = (ch, mute) => `<iframe class="tv-frame" src="https://www.youtube-nocookie.com/embed/live_stream?channel=${ch.id}&autoplay=1&mute=${mute ? 1 : 0}&rel=0&playsinline=1" title="${esc(ch.name)} live" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  let tvOn = '';
  function drawTv() {
    $$('#tvChips button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === tvOn)));
    const player = $('#tvPlayer');
    const ch = CHANNELS.find((c) => c.id === tvOn);
    player.hidden = !ch;
    $('#side').classList.toggle('tv-on', !!ch);
    player.innerHTML = ch ? `${tvFrame(ch, false)}<div class="tv-links"><a href="https://www.youtube.com/channel/${ch.id}/live" target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a><button type="button" id="tvStop">Stop</button></div>` : '';
    if (ch) $('#tvStop').onclick = () => { tvOn = ''; drawTv(); };
  }
  $('#tvChips').innerHTML = CHANNELS.map((c) => `<button type="button" data-id="${c.id}" aria-pressed="false">${esc(c.name)}</button>`).join('');
  $('#tvChips').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    tvOn = tvOn === b.dataset.id ? '' : b.dataset.id;
    drawTv();
  });
  $('#tvWall').addEventListener('click', () => {
    tvOn = '';
    drawTv();
    $('#wallGrid').innerHTML = CHANNELS.map((c) => `<div class="wall-tile"><b>${esc(c.name)}</b>${tvFrame(c, true)}</div>`).join('');
    $('#wall').showModal();
  });
  $('#wallClose').addEventListener('click', () => $('#wall').close());
  $('#wall').addEventListener('close', () => { $('#wallGrid').innerHTML = ''; });

  // ---------- controls ----------
  $('#topics').innerHTML = `<button type="button" data-t="">All</button>` + TOPICS.map(([k_, n]) => `<button type="button" data-t="${k_}" style="--c:var(--t-${k_})">${n}</button>`).join('');
  $('#topics').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { S.topic = b.dataset.t; S.shown = PAGE; refresh(); } });
  $('#range').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { S.hours = +b.dataset.h; S.shown = PAGE; if (S.echo) exitEcho(); else refresh(); } });
  $('#source').addEventListener('change', (e) => { S.source = e.target.value; S.shown = PAGE; refresh(); });
  $('#majorOnly').addEventListener('click', () => { S.majorOnly = !S.majorOnly; S.shown = PAGE; refresh(); });
  $('#watchOnly').addEventListener('click', () => { S.watchOnly = !S.watchOnly; S.shown = PAGE; refresh(); });
  let qT;
  $('#q').addEventListener('input', (e) => { clearTimeout(qT); qT = setTimeout(() => { S.q = e.target.value.trim(); S.shown = PAGE; refresh(); }, 160); });
  $('#mode').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { store.set('meridian-mode', b.dataset.m); setMode(b.dataset.m); } });
  $('#links').addEventListener('click', () => { S.showLinks = !S.showLinks; store.set('meridian-links', S.showLinks); refresh(); });
  const zoomBy = (f) => { if (S.mode === 'flat') svg.transition().duration(reduceMotion ? 0 : 250).call(zoom.scaleBy, f); else { spinning = false; setGlobeScale(globeScale * f); } };
  $('#zIn').addEventListener('click', () => zoomBy(1.5));
  $('#zOut').addEventListener('click', () => zoomBy(1 / 1.5));
  $('#zReset').addEventListener('click', clearSelection);
  $('#home').addEventListener('click', (e) => { e.preventDefault(); $('#q').value = ''; S.q = ''; S.echo = null; echoRun++; clearSelection(); drawMarkets(); });
  $('#liveBtn').addEventListener('click', () => $('#about').showModal());
  $('#aboutClose').addEventListener('click', () => $('#about').close());
  $('#about').addEventListener('click', (e) => { if (e.target.id === 'about') e.target.close(); });
  addEventListener('keydown', (e) => {
    const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName);
    if (e.key === '/' && !typing) { e.preventDefault(); $('#q').focus(); }
    if (e.key === 'Escape' && !$('#about').open && !$('#wall').open) {
      if (typing) { $('#q').value = ''; S.q = ''; $('#q').blur(); refresh(); } else if (S.selected || S.pair) clearSelection();
      else if (S.echo) exitEcho();
    }
  });
  new ResizeObserver(() => { fit(); drawGeometry(); }).observe($('#mapwrap'));

  // ---------- start ----------
  (async function start() {
    tickClock();
    drawFeed();
    const h = new URLSearchParams(location.hash.slice(1));
    if ([6, 24, 72, 168].includes(+h.get('r'))) S.hours = +h.get('r');
    if (TOPIC_NAME[h.get('t')]) S.topic = h.get('t');
    try {
      const [countries, atlas] = await Promise.all([fetch('/api/countries').then((r) => r.json()), fetch('vendor/countries-110m.json').then((r) => r.json())]);
      COUNTRY = new Map(countries.map((c) => [c.iso, c]));
      const byId = new Map(countries.filter((c) => c.id).map((c) => [c.id, c.iso]));
      const byName = new Map(countries.map((c) => [c.name, c.iso]));
      const special = { 'N. Cyprus': 'CYP', Somaliland: 'SOM' };
      features = topojson.feature(atlas, atlas.objects.countries).features.filter((f) => f.properties.name !== 'Antarctica');
      features.forEach((f) => { f.iso = byId.get(f.id) || byName.get(f.properties.name) || special[f.properties.name] || ''; });
      gLand.selectAll('path').data(features).join('path').attr('class', 'c');
      setMode(['flat', 'globe'].includes(store.get('meridian-mode')) ? store.get('meridian-mode') : 'globe');
      await load(true);
      drawBrief();
      if (COUNTRY.has(h.get('c'))) S.selected = h.get('c');
      S.connected = true;
      refresh();
      drawTicker();
      drawStatus();
      if (S.selected) flyTo(S.selected);
      connect();
      // A freshly started server has no stories yet; keep checking until the first round arrives
      if (!S.items.length) { const iv = setInterval(async () => { await update(); if (S.items.length) clearInterval(iv); }, 3000); }
    } catch (e) {
      S.connected = false;
      drawStatus();
      $('#mapMsg').hidden = false;
      $('#mapMsg').textContent = 'Could not reach the Meridian server. Check that it is running, then reload.';
      $('#feed').innerHTML = '<p class="none">No connection to the news server.</p>';
    }
  })();
})();
