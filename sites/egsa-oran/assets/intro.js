// EGSA Oran — intro: the split-flap board spells the welcome, then the page is revealed.
(() => {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  if (!intro) return;
  if (!root.classList.contains('intro-on')) { intro.remove(); return; }

  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀ0123456789·';
  const rows = [...intro.querySelectorAll('.flaps')];
  let longest = 0;
  rows.forEach((row, r) => {
    const text = row.dataset.text;
    row.innerHTML = '';
    [...text].forEach((ch, i) => {
      const cell = document.createElement('span');
      cell.className = ch === ' ' ? 'cell space' : 'cell';
      if (ch !== ' ') {
        const inner = document.createElement('span');
        inner.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        cell.append(inner);
        // each letter spins through a few characters, left to right, before settling
        const start = 120 + r * 220 + i * 55;
        const flips = 6 + Math.floor(Math.random() * 5);
        longest = Math.max(longest, start + flips * 70);
        for (let f = 0; f <= flips; f++) {
          setTimeout(() => {
            inner.textContent = f === flips ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
            cell.classList.remove('flip'); void cell.offsetWidth; cell.classList.add('flip');
            if (f === flips) cell.classList.add('done');
          }, start + f * 70);
        }
      }
      row.append(cell);
    });
  });

  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    intro.classList.add('out');
    setTimeout(() => { root.classList.remove('intro-on'); intro.remove(); }, 1150);
  };
  const timer = setTimeout(end, Math.max(2900, longest + 900));
  const skip = () => { clearTimeout(timer); end(); };
  intro.addEventListener('click', skip, { once: true });
  addEventListener('keydown', skip, { once: true });
})();
