document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hdr = document.getElementById('hdr');
const progress = document.getElementById('progress');
const toTop = document.getElementById('toTop');
const ring = document.getElementById('ring');
const RING = 2 * Math.PI * 21;

// Intro screen (enabled by the inline script in <head> on the first visit): click or key to skip
const introPlaying = document.documentElement.classList.contains('intro');
const intro = document.getElementById('intro');
if (introPlaying) {
  const endIntro = () => intro.remove();
  const timer = setTimeout(endIntro, 2800);
  const skip = () => {
    clearTimeout(timer);
    intro.classList.add('skip');
    setTimeout(endIntro, 350);
  };
  intro.addEventListener('click', skip, { once: true });
  window.addEventListener('keydown', skip, { once: true });
} else {
  intro.remove();
}

// Hero: split the title into words so they can rise one after another
const h1 = document.querySelector('.hero h1');
if (!reduceMotion) {
  let i = 0;
  const wrapWords = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.innerHTML = `<span style="--i:${i++}"></span>`;
          w.firstChild.textContent = part;
          frag.append(w);
        });
        child.replaceWith(frag);
      } else {
        wrapWords(child);
      }
    });
  };
  wrapWords(h1);
  h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
}
const scrollHint = document.createElement('a');
scrollHint.className = 'hero-scroll';
scrollHint.href = '#entreprise';
scrollHint.setAttribute('aria-label', 'Faire défiler vers la suite');
document.querySelector('.hero').append(scrollHint);

// Counters in the hero strip
const countUp = (el) => {
  const to = Number(el.dataset.count);
  const from = Number(el.dataset.from || 0);
  if (reduceMotion) { el.textContent = to; return; }
  const dur = 1600;
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  el.textContent = from;
  requestAnimationFrame(tick);
};
setTimeout(() => document.querySelectorAll('[data-count]').forEach(countUp), reduceMotion ? 0 : 1100 + (introPlaying ? 2100 : 0));

// Parallax on large photos
const parallax = [...document.querySelectorAll('.defis-img, .about-img, .commit-img, .improve-img')];
if (!reduceMotion) parallax.forEach((f) => f.classList.add('parallax'));

// Scroll-driven bits: header, progress bar, back-to-top ring, parallax
let ticking = false;
const onScroll = () => {
  ticking = false;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? y / max : 0;
  hdr.classList.toggle('solid', y > 40);
  progress.style.transform = `scaleX(${p})`;
  ring.style.strokeDashoffset = String(RING * (1 - p));
  toTop.classList.toggle('show', y > innerHeight * 0.8);
  // Anchor jumps can skip a section without it ever intersecting: reveal whatever is above the fold
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
    if (el.getBoundingClientRect().bottom < 0) el.classList.add('in');
  });
  if (!reduceMotion) {
    parallax.forEach((f) => {
      const r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const center = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      f.style.setProperty('--py', `${(center * -6).toFixed(2)}%`);
    });
  }
};
ring.style.strokeDasharray = String(RING);
onScroll();
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
window.addEventListener('resize', onScroll);
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

// Mobile menu
const burger = document.getElementById('burger');
const setOpen = (open) => {
  hdr.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
};
burger.addEventListener('click', () => setOpen(!hdr.classList.contains('open')));
document.querySelectorAll('#nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

// Active section in the nav: each block of the page belongs to the last nav anchor above it
const navLinks = [...document.querySelectorAll('#nav a:not(.nav-cta)')];
const navIds = navLinks.map((a) => a.getAttribute('href').slice(1));
const owner = new Map();
let current = null;
document.querySelectorAll('main > section, main > .ticker').forEach((s) => {
  if (s.id) current = navIds.includes(s.id) ? s.id : null;
  owner.set(s, current);
});
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = owner.get(e.target);
      navLinks.forEach((a) => {
        const on = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  owner.forEach((_, s) => spy.observe(s));
}

// Ticker: duplicate the track so the loop is seamless
const track = document.querySelector('.ticker-track');
track.innerHTML += track.innerHTML;

// Reveal on scroll, staggering cards that sit in the same grid
document.querySelectorAll('.values-grid, .svc-grid, .commit-grid, .means-grid, .mission-list, .works-grid').forEach((grid) => {
  [...grid.children].forEach((el, i) => el.style.setProperty('--d', `${(i % 4) * 0.1}s`));
});
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('in'));
}

// Réalisations: lightbox with arrows, keyboard and swipe
const works = [...document.querySelectorAll('.work')];
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
let lbIndex = 0;
const showWork = (i) => {
  lbIndex = (i + works.length) % works.length;
  const w = works[lbIndex];
  lbImg.src = w.dataset.full;
  lbImg.alt = w.querySelector('img').alt;
  lbImg.style.animation = 'none';
  void lbImg.offsetWidth;
  lbImg.style.animation = '';
  document.getElementById('lbCount').textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(works.length).padStart(2, '0')}`;
  document.getElementById('lbTitle').textContent = w.dataset.title;
  document.getElementById('lbClient').textContent = w.dataset.client ? `Client : ${w.dataset.client}` : '';
};
works.forEach((w, i) => w.addEventListener('click', () => { showWork(i); lb.showModal(); }));
lb.addEventListener('click', (e) => {
  const action = e.target.closest('[data-lb]')?.dataset.lb;
  if (action === 'close' || e.target === lb) lb.close();
  else if (action === 'prev') showWork(lbIndex - 1);
  else if (action === 'next') showWork(lbIndex + 1);
});
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showWork(lbIndex - 1);
  if (e.key === 'ArrowRight') showWork(lbIndex + 1);
});
let touchX = null;
lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showWork(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

// Toast
const toast = document.getElementById('toast');
let toastTimer;
const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
};

// Copy phone / e-mail
document.querySelectorAll('.copy').forEach((btn) => btn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(btn.dataset.copy);
    showToast(`Copié : ${btn.dataset.copy}`);
  } catch {
    showToast('Copie impossible, sélectionnez le texte manuellement');
  }
}));

// Quote form
const form = document.getElementById('form');
const err = document.getElementById('formError');
const done = document.getElementById('formDone');
const select = form.elements.prestation;

// "Demander un devis" on each service card pre-selects it in the form
document.querySelectorAll('.svc').forEach((card) => {
  const name = card.querySelector('h3').textContent.trim();
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'svc-cta';
  btn.innerHTML = 'Demander un devis <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  btn.setAttribute('aria-label', `Demander un devis : ${name}`);
  btn.addEventListener('click', () => {
    const opt = [...select.options].find((o) => o.text === name);
    if (opt) select.value = opt.value;
    form.classList.remove('done');
    done.hidden = true;
    document.getElementById('contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    form.classList.remove('flash');
    void form.offsetWidth;
    form.classList.add('flash');
    setTimeout(() => form.elements.nom.focus({ preventScroll: true }), reduceMotion ? 0 : 700);
    showToast(`Prestation sélectionnée : ${name}`);
  });
  card.querySelector('.svc-body').append(btn);
});

// Clear the error state as soon as a field is fixed
form.addEventListener('input', (e) => {
  if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim() !== '' && e.target.checkValidity()) {
    e.target.setAttribute('aria-invalid', 'false');
    if (!form.querySelector('[aria-invalid="true"]')) err.hidden = true;
  }
});

// No backend, so compose an e-mail in the visitor's mail client
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const required = [...form.querySelectorAll('[required]')];
  let ok = true;
  required.forEach((f) => {
    const valid = f.value.trim() !== '' && f.checkValidity();
    f.setAttribute('aria-invalid', String(!valid));
    if (!valid) ok = false;
  });
  err.hidden = ok;
  if (!ok) { required.find((f) => f.getAttribute('aria-invalid') === 'true').focus(); return; }

  const d = Object.fromEntries(new FormData(form));
  const subject = `Demande de devis — ${d.prestation}`;
  const body = [
    `Nom : ${d.nom}`,
    d.societe ? `Société : ${d.societe}` : '',
    `Téléphone : ${d.tel}`,
    `E-mail : ${d.email}`,
    `Prestation : ${d.prestation}`,
    '',
    d.message,
  ].filter((l, i) => l !== '' || i === 5).join('\n');
  window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  form.classList.add('done');
  done.hidden = false;
});
document.getElementById('formReset').addEventListener('click', () => {
  form.reset();
  form.classList.remove('done');
  done.hidden = true;
  form.elements.nom.focus();
});

document.getElementById('year').textContent = new Date().getFullYear();
