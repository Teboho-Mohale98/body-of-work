/* ============================================================
   Kopano Madisa — Body of Work
   Gallery data + interactions / gadgets
   ============================================================ */

/* ---------- The body of work ---------- */
const WORK = [
  /* --- Art Pieces · Mixed Medium · A4 --- */
  { file: 'art-01.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2021/2022' },
  { file: 'art-02.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2025' },
  { file: 'art-03.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2025' },
  { file: 'art-04.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2025' },
  { file: 'art-05.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2025' },
  { file: 'art-06.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2025' },

  /* --- Morwadiwa · Photography / Mixed Medium · A2 --- */
  { file: 'morwadiwa-01.jpg', cat: 'morwadiwa', title: 'Untitled', medium: 'Photography', dims: 'A2', year: '2025' },
  { file: 'morwadiwa-02.jpg', cat: 'morwadiwa', title: 'Untitled', medium: 'Photography', dims: 'A2', year: '2025' },
  { file: 'morwadiwa-03.jpg', cat: 'morwadiwa', title: 'Untitled', medium: 'Photography', dims: 'A2', year: '2025' },
  { file: 'morwadiwa-04.jpg', cat: 'morwadiwa', title: 'Untitled', medium: 'Photography', dims: 'A2', year: '2025' },
  { file: 'morwadiwa-05.jpg', cat: 'morwadiwa', title: 'Untitled', medium: 'Photography', dims: 'A2', year: '2025' },
  { file: 'morwadiwa-06.jpg', cat: 'morwadiwa', title: 'Untitled', medium: 'Photography', dims: 'A2', year: '2025' },
  { file: 'morwadiwa-07.png', cat: 'morwadiwa', title: 'Untitled', medium: 'Photography', dims: 'A2', year: '2025' },
  { file: 'morwadiwa-08.png', cat: 'morwadiwa', title: 'Untitled', medium: 'Photography', dims: 'A2', year: '2025' },
  { file: 'morwadiwa-09.png', cat: 'morwadiwa', title: 'Untitled', medium: 'Photography', dims: 'A2', year: '2025' },
  { file: 'morwadiwa-10.jpg', cat: 'morwadiwa', title: 'Untitled', medium: 'Mixed Medium', dims: 'A2', year: '2025' },

  /* --- Digital Posters · A4/A2 --- */
  { file: 'poster-01.png', cat: 'poster', title: 'Morwadiwa Madisa', medium: 'Digital Poster', dims: 'A4 / A2', year: '2025' },
  { file: 'poster-02.png', cat: 'poster', title: 'Morwadiwa Madisa', medium: 'Digital Poster', dims: 'A4 / A2', year: '2025' },
];

const CAT_LABEL = { pieces: 'Art Piece', morwadiwa: 'Morwadiwa', poster: 'Digital Poster' };
const CAT_ORDER = { pieces: 0, morwadiwa: 1, poster: 2 };
const PATH = 'assets/art/';
const SITE_URL = () => location.origin + location.pathname;

const pad = (n) => String(n).padStart(2, '0');
const plateLabel = (w, i) => (w.title === 'Untitled' ? `Untitled — Plate ${pad(i + 1)}` : w.title);
const yearNum = (y) => parseInt((String(y).match(/\d{4}/) || ['0'])[0], 10);

/* ---------- State + storage ---------- */
const state = { cat: 'all', query: '', sort: 'default', favOnly: false };
let visibleIndices = [];
let lbPos = 0;
let favs = new Set(loadJSON('km-favs', []));

function loadJSON(key, def) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? def : v; }
  catch (e) { return def; }
}
function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}
const saveFavs = () => saveJSON('km-favs', [...favs]);

/* ---------- Build gallery ---------- */
const gallery = document.getElementById('gallery');
const tiles = [];

function buildGallery() {
  const frag = document.createDocumentFragment();

  WORK.forEach((w, i) => {
    const fig = document.createElement('figure');
    fig.className = 'tile';
    fig.dataset.cat = w.cat;
    fig.dataset.index = i;

    fig.innerHTML = `
      <button class="tile-btn" type="button" aria-label="View ${plateLabel(w, i)}">
        <span class="tile-num">${pad(i + 1)}</span>
        <span class="tile-media">
          <img src="${PATH}${w.file}" alt="${plateLabel(w, i)} — ${w.medium}, ${w.dims}, ${w.year}"
               loading="lazy" decoding="async" />
        </span>
        <span class="tile-cap">
          <span class="tile-cat">${CAT_LABEL[w.cat]} · ${w.year}</span>
          <span class="tile-title">${plateLabel(w, i)}</span>
          <span class="tile-meta">${w.medium} · ${w.dims}</span>
        </span>
      </button>
      <button class="tile-fav" type="button" data-fav aria-pressed="false" aria-label="Save ${plateLabel(w, i)} to favourites" title="Favourite">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
          <path d="M12 20s-7-4.5-9.2-9A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 21.2 11C19 15.5 12 20 12 20Z"/>
        </svg>
      </button>`;

    fig.querySelector('.tile-btn').addEventListener('click', () => openLightbox(i));
    fig.querySelector('.tile-fav').addEventListener('click', (e) => {
      e.preventDefault();
      toggleFav(w.file);
    });

    tiles[i] = fig;
    frag.appendChild(fig);
  });

  gallery.appendChild(frag);
  refreshFavUI();
}

/* ---------- Visible set (filter + search + sort) ---------- */
function computeVisible() {
  let idx = WORK.map((_, i) => i);

  if (state.favOnly) idx = idx.filter((i) => favs.has(WORK[i].file));
  else if (state.cat !== 'all') idx = idx.filter((i) => WORK[i].cat === state.cat);

  const q = state.query.trim().toLowerCase();
  if (q) {
    idx = idx.filter((i) => {
      const w = WORK[i];
      return `${plateLabel(w, i)} ${w.medium} ${w.dims} ${w.year} ${CAT_LABEL[w.cat]}`.toLowerCase().includes(q);
    });
  }

  const s = state.sort;
  if (s === 'year-desc') idx.sort((a, b) => yearNum(WORK[b].year) - yearNum(WORK[a].year));
  else if (s === 'year-asc') idx.sort((a, b) => yearNum(WORK[a].year) - yearNum(WORK[b].year));
  else if (s === 'collection') idx.sort((a, b) => CAT_ORDER[WORK[a].cat] - CAT_ORDER[WORK[b].cat]);

  return idx;
}

function render() {
  visibleIndices = computeVisible();
  const shown = new Set(visibleIndices);

  WORK.forEach((_, i) => { if (!shown.has(i)) tiles[i].classList.add('hidden'); });

  visibleIndices.forEach((idx, n) => {
    const t = tiles[idx];
    const wasHidden = t.classList.contains('hidden');
    gallery.appendChild(t);
    t.classList.remove('hidden');
    if (wasHidden || !t.classList.contains('in')) {
      t.classList.remove('in');
      setTimeout(() => t.classList.add('in'), Math.min(n * 35, 360));
    }
  });

  document.getElementById('emptyState').hidden = visibleIndices.length !== 0;
  const rc = document.getElementById('resultCount');
  rc.textContent = `${visibleIndices.length} ${visibleIndices.length === 1 ? 'work' : 'works'}`;
}

/* ---------- Favourites ---------- */
function toggleFav(file) {
  if (favs.has(file)) favs.delete(file);
  else favs.add(file);
  saveFavs();
  refreshFavUI();
  if (lb.classList.contains('open')) refreshLbFav();
  if (state.favOnly) render();
}
function refreshFavUI() {
  document.querySelectorAll('.tile').forEach((tile) => {
    const w = WORK[Number(tile.dataset.index)];
    const on = favs.has(w.file);
    const btn = tile.querySelector('.tile-fav');
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
  });
  document.getElementById('favCount').textContent = favs.size;
}

/* ---------- Category filters ---------- */
document.querySelectorAll('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((b) => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');
    state.cat = btn.dataset.filter;
    state.favOnly = false;
    document.getElementById('favToggle').setAttribute('aria-pressed', 'false');
    document.getElementById('favToggle').classList.remove('is-active');
    render();
  });
});

/* ---------- Toolbar: search / sort / favourites / surprise ---------- */
function initToolbar() {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('searchClear');
  let t;
  input.addEventListener('input', () => {
    clear.hidden = !input.value;
    clearTimeout(t);
    t = setTimeout(() => { state.query = input.value; render(); }, 160);
  });
  clear.addEventListener('click', () => {
    input.value = ''; clear.hidden = true; state.query = ''; render(); input.focus();
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    state.sort = e.target.value; render();
  });

  const favBtn = document.getElementById('favToggle');
  favBtn.addEventListener('click', () => {
    state.favOnly = !state.favOnly;
    favBtn.setAttribute('aria-pressed', String(state.favOnly));
    favBtn.classList.toggle('is-active', state.favOnly);
    if (state.favOnly) {
      document.querySelectorAll('.filter').forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelector('.filter[data-filter="all"]').classList.add('is-active');
    }
    render();
  });
}

/* ---------- Random artwork ---------- */
function surprise() {
  if (!visibleIndices.length) { toast('No works available'); return; }
  const pick = visibleIndices[Math.floor(Math.random() * visibleIndices.length)];
  openLightbox(pick);
}
document.getElementById('surpriseBtn').addEventListener('click', surprise);
document.getElementById('heroSurprise').addEventListener('click', () => {
  document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
  setTimeout(surprise, 500);
});

/* ---------- Lightbox ---------- */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbTitle = document.getElementById('lbTitle');
const lbMeta = document.getElementById('lbMeta');
const lbCount = document.getElementById('lbCount');
const lbFav = document.getElementById('lbFav');
const lbZoom = document.getElementById('lbZoom');
const lbPlay = document.getElementById('lbPlay');

function currentWork() { return WORK[visibleIndices[lbPos]]; }
function workURL(w) { return `${SITE_URL()}?work=${encodeURIComponent(w.file)}`; }

function renderLightbox() {
  const i = visibleIndices[lbPos];
  const w = WORK[i];
  lbImg.src = PATH + w.file;
  lbImg.alt = `${plateLabel(w, i)} — ${w.medium}, ${w.dims}, ${w.year}`;
  lbTitle.textContent = plateLabel(w, i);
  lbMeta.textContent = `${w.medium} · ${w.dims} · ${w.year}`;
  lbCount.textContent = `${pad(lbPos + 1)} / ${pad(visibleIndices.length)}`;
  disableZoom();
  refreshLbFav();
}
function refreshLbFav() {
  const on = favs.has(currentWork().file);
  lbFav.classList.toggle('is-on', on);
  lbFav.setAttribute('aria-pressed', String(on));
}

function openLightbox(workIndex) {
  const pos = visibleIndices.indexOf(workIndex);
  lbPos = pos < 0 ? 0 : pos;
  renderLightbox();
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  stopPlay();
  disableZoom();
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function step(dir) {
  if (!visibleIndices.length) return;
  lbPos = (lbPos + dir + visibleIndices.length) % visibleIndices.length;
  renderLightbox();
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => step(-1));
document.getElementById('lbNext').addEventListener('click', () => step(1));
lbFav.addEventListener('click', () => toggleFav(currentWork().file));
lbZoom.addEventListener('click', (e) => { e.stopPropagation(); zoomed ? disableZoom() : enableZoom(); });
lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

/* zoom / pan gestures — mouse, touch and pen */
lbImg.addEventListener('pointerdown', onPointerDown);
lbImg.addEventListener('pointermove', onPointerMove);
lbImg.addEventListener('pointerup', onPointerUp);
lbImg.addEventListener('pointercancel', onPointerUp);
lbImg.addEventListener('wheel', onWheel, { passive: false });

document.addEventListener('keydown', (e) => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

/* ---------- Zoom / pan (mouse, touch, pen) ---------- */
const Z_DEFAULT = 1.9, Z_MIN = 1, Z_MAX = 3.4;
let zoomed = false, scale = 1, tx = 0, ty = 0, baseCx = 0, baseCy = 0;
const pointers = new Map();
let pinchDist = 0, pinchScale = 1, startX = 0, startY = 0, moved = false;

function applyTransform() { lbImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; }
function captureBase() {
  const r = lbImg.getBoundingClientRect();
  baseCx = r.left + r.width / 2;
  baseCy = r.top + r.height / 2;
}
function enableZoom() {
  captureBase();
  zoomed = true; scale = Z_DEFAULT; tx = 0; ty = 0;
  lbImg.classList.add('zoomed');
  lbZoom.classList.add('is-on'); lbZoom.setAttribute('aria-pressed', 'true');
  applyTransform();
}
function disableZoom() {
  zoomed = false; scale = 1; tx = 0; ty = 0;
  pointers.clear(); pinchDist = 0;
  lbImg.classList.remove('zoomed'); lbImg.style.transform = '';
  lbZoom.classList.remove('is-on'); lbZoom.setAttribute('aria-pressed', 'false');
}
function panZoom(x, y) {
  if (!zoomed) return;
  tx = -(x - baseCx) * (scale - 1);
  ty = -(y - baseCy) * (scale - 1);
  applyTransform();
}
function pinchZoom(next, fx, fy) {
  const clamped = Math.max(Z_MIN, Math.min(Z_MAX, next));
  if (clamped <= 1.01) { disableZoom(); return; }
  if (!zoomed) {
    captureBase(); zoomed = true; lbImg.classList.add('zoomed');
    lbZoom.classList.add('is-on'); lbZoom.setAttribute('aria-pressed', 'true');
  }
  scale = clamped;
  tx = -(fx - baseCx) * (scale - 1);
  ty = -(fy - baseCy) * (scale - 1);
  applyTransform();
}

function onPointerDown(e) {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  startX = e.clientX; startY = e.clientY; moved = false;
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    pinchScale = zoomed ? scale : 1;
  } else {
    try { lbImg.setPointerCapture(e.pointerId); } catch (err) {}
  }
}
function onPointerMove(e) {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) moved = true;

  if (pointers.size >= 2) {
    const [a, b] = [...pointers.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
    if (pinchDist > 0) pinchZoom(pinchScale * (dist / pinchDist), midX, midY);
    moved = true;
    e.preventDefault();
  } else if (zoomed) {
    panZoom(e.clientX, e.clientY);
    moved = true;
  }
}
function onPointerUp(e) {
  const had = pointers.size;
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchDist = 0;
  if (had === 1 && !moved) { zoomed ? disableZoom() : enableZoom(); }
}
function onWheel(e) {
  e.preventDefault();
  pinchZoom((zoomed ? scale : 1) * (e.deltaY < 0 ? 1.15 : 0.87), e.clientX, e.clientY);
}

/* ---------- Slideshow ---------- */
let playing = false, playTimer = null;
function startPlay() {
  if (visibleIndices.length < 2) { toast('Add more works to slideshow'); return; }
  playing = true;
  lbPlay.classList.add('is-on');
  lbPlay.setAttribute('aria-pressed', 'true');
  playTimer = setInterval(() => step(1), 4200);
}
function stopPlay() {
  playing = false;
  lbPlay.classList.remove('is-on');
  lbPlay.setAttribute('aria-pressed', 'false');
  clearInterval(playTimer);
  playTimer = null;
}
lbPlay.addEventListener('click', () => (playing ? stopPlay() : startPlay()));

/* ---------- Share + copy link ---------- */
async function copyText(text, msg) {
  try { await navigator.clipboard.writeText(text); toast(msg); }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(msg); } catch (e2) { toast('Copy failed'); }
    ta.remove();
  }
}
document.getElementById('lbLink').addEventListener('click', () => copyText(workURL(currentWork()), 'Link copied'));
document.getElementById('lbShare').addEventListener('click', async () => {
  const i = visibleIndices[lbPos];
  const w = WORK[i];
  const data = { title: `${plateLabel(w, i)} — Kopano Madisa`, text: `${w.medium}, ${w.dims}, ${w.year}`, url: workURL(w) };
  if (navigator.share) { try { await navigator.share(data); return; } catch (e) {} }
  copyText(workURL(w), 'Link copied');
});
document.getElementById('footerShare').addEventListener('click', async () => {
  const data = { title: 'Body of Work — Kopano Madisa', text: 'An art portfolio by Kopano Madisa', url: SITE_URL() };
  if (navigator.share) { try { await navigator.share(data); return; } catch (e) {} }
  copyText(SITE_URL(), 'Site link copied');
});

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- Scroll reveal ---------- */
function observeReveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .tile').forEach((el) => io.observe(el));
}

/* ---------- Header + mobile nav ---------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.site-nav a').forEach((a) =>
    a.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

/* ---------- Progress bar + back to top ---------- */
function initScrollUI() {
  const bar = document.getElementById('progressBar');
  const toTop = document.getElementById('toTop');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(window.scrollY / h, 1) : 0})`;
    toTop.classList.toggle('show', window.scrollY > 640);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- Theme ---------- */
function initTheme() {
  const btn = document.getElementById('themeToggle');
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('km-theme', next); } catch (e) {}
  });
}

/* ---------- Custom cursor ---------- */
function initCursor() {
  if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  document.body.append(ring, dot);

  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    if (mx > 0 || my > 0) document.documentElement.classList.add('has-cursor');
  }, { passive: true });

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  const hoverSel = 'a, button, input, select, .tile-btn, .tile-fav, .lb-tool, .filter, .chip';
  document.addEventListener('mouseover', (e) => { if (e.target.closest(hoverSel)) ring.classList.add('grow'); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest(hoverSel)) ring.classList.remove('grow'); });
}

/* ---------- Hover magnifier on tiles ---------- */
const finePointer = matchMedia('(pointer:fine)').matches;
function initMagnifier() {
  if (!finePointer) return;
  document.querySelectorAll('.tile-media').forEach((media) => {
    const img = media.querySelector('img');
    media.addEventListener('mouseenter', () => img.classList.add('magnifying'));
    media.addEventListener('mousemove', (e) => {
      const r = media.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = 'scale(1.85)';
    });
    media.addEventListener('mouseleave', () => {
      img.classList.remove('magnifying');
      img.style.transformOrigin = '';
      img.style.transform = '';
    });
  });
}

/* ---------- Deep link ---------- */
function openFromURL() {
  const file = new URLSearchParams(location.search).get('work');
  if (!file) return;
  const i = WORK.findIndex((w) => w.file === decodeURIComponent(file));
  if (i >= 0) setTimeout(() => openLightbox(i), 350);
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  buildGallery();
  initHeader();
  initToolbar();
  initScrollUI();
  initTheme();
  initCursor();
  initMagnifier();
  observeReveals();
  initJumps();

  visibleIndices = computeVisible();

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  openFromURL();
});

/* ---------- Jump links that also set a filter ---------- */
function initJumps() {
  document.querySelectorAll('[data-jump]').forEach((el) => {
    el.addEventListener('click', () => {
      const cat = el.dataset.jump;
      const btn = document.querySelector(`.filter[data-filter="${cat}"]`);
      if (btn) btn.click();
    });
  });
}
