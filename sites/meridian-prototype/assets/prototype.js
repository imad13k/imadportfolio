// Meridian prototype: runs the real interface from a saved snapshot instead of the live server.
// Loaded after data/snapshot.js and before the app. It answers the app's server requests from the
// snapshot, turns off the live stream, and sets the clock to the moment the snapshot was taken,
// so "24h", "15m ago" and the story mode read the saved news as if it had just arrived.
(() => {
  const D = window.MERIDIAN_DATA;
  if (!D) return;
  window.MERIDIAN_PROTOTYPE = { at: D.at };
  // The Live brief is written by the local model and is not checked: it stays off a published copy
  D.news.brief = null;

  // Time runs on from the snapshot moment
  const realNow = Date.now.bind(Date);
  const offset = D.at - realNow();
  Date.now = () => realNow() + offset;

  const json = (obj) => Promise.resolve(new Response(JSON.stringify(obj), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = String(typeof input === 'string' ? input : input.url);
    const u = new URL(url, location.href);
    const p = u.pathname;
    if (p.endsWith('/api/news')) return json(D.news);
    if (p.endsWith('/api/markets')) return json(D.markets[u.searchParams.get('range')] || D.markets['1d']);
    if (p.endsWith('/api/stocks')) return json(D.stocks);
    if (p.endsWith('/api/countries')) return json(D.countries);
    if (p.endsWith('/api/echo')) return json({ text: '' });
    if (p.endsWith('vendor/countries-110m.json')) return json(D.atlas);
    return realFetch(input, init);
  };

  // No live stream in the prototype
  window.EventSource = class {
    constructor() { this.readyState = 2; }
    addEventListener() {}
    removeEventListener() {}
    close() {}
  };

  // Banner
  const when = new Date(D.at).toUTCString().replace(/:\d\d GMT$/, ' UTC');
  addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('proto');
    const b = document.createElement('div');
    b.className = 'proto-banner';
    b.setAttribute('role', 'note');
    b.innerHTML = '<b>Prototype</b><span></span><button type="button" aria-label="Hide this note">×</button>';
    b.querySelector('span').textContent = `A saved copy of the news from ${when}. The full version updates live from 17 publishers every 20 seconds.`;
    b.querySelector('button').addEventListener('click', () => b.remove());
    document.body.prepend(b);
  });
})();
