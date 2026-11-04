// Header, mobile menu and scroll reveal shared by EGSA inner pages.
(() => {
  const $ = s => document.querySelector(s);
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  addEventListener('scroll', () => $('#hdr').classList.toggle('sc', scrollY > 20), { passive: true });
  const nav = $('#nav'), burger = $('#burger');
  burger.onclick = () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
  nav.onclick = e => { if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); } };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
