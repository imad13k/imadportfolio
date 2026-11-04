// Header, mobile menu, footer year and scroll reveal shared by the Orion Lab pages.
(() => {
  const $ = s => document.querySelector(s);
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  addEventListener('scroll', () => $('#hdr').classList.toggle('sc', scrollY > 10), { passive: true });
  const nav = $('#nav'), burger = $('#burger');
  burger.onclick = () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
  nav.onclick = e => { if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); } };
  window.oReveal = () => {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      // animated counters: data-n="78634.73" data-dec="0"
      e.target.querySelectorAll('[data-n]').forEach(el => {
        const n = +el.dataset.n, dec = +(el.dataset.dec || 0), t0 = performance.now();
        (function f(t) {
          const p = Math.min(1, (t - t0) / 1600), v = n * (1 - Math.pow(1 - p, 4));
          el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/ /g, ' ');
          if (p < 1) requestAnimationFrame(f);
        })(t0);
      });
    }), { threshold: .12 });
    document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
  };

})();
