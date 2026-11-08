// Runs before the page is drawn: enables animations, and plays the intro only on the first page of a visit.
document.documentElement.classList.add('js');
try {
  if (sessionStorage.getItem('kh-intro')) document.documentElement.classList.add('seen');
  else sessionStorage.setItem('kh-intro', '1');
} catch (e) { document.documentElement.classList.add('seen'); }
