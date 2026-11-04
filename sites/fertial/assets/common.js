// Header, mobile menu, quote badge and scroll reveal shared by Fertial pages.
(() => {
  const $ = s => document.querySelector(s);
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  addEventListener('scroll', () => $('#hdr').classList.toggle('sc', scrollY > 10), { passive: true });
  const nav = $('#nav'), burger = $('#burger');
  burger.onclick = () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
  nav.onclick = e => { if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); } };
  const badge = () => { const b = $('#cartCount'); if (b && window.FertialCart) { const n = FertialCart.count(); b.textContent = n; b.hidden = !n; } };
  document.addEventListener('cart', badge); badge();
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// Small toast helper
window.fertialToast = msg => {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2400);
};
