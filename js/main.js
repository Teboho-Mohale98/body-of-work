/* ============================================================
   Kopano Madisa — Body of Work
   Gallery data + interactions
   ============================================================ */

/* ---------- The body of work ---------- */
const WORK = [
  /* --- Art Pieces · Mixed Medium · A4 --- */
  { file: 'art-01.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2021/2022' },
  { file: 'art-02.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2025' },
  { file: 'art-03.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2025' },
  { file: 'art-04.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2025' },
  { file: 'art-05.jpg', cat: 'pieces', title: 'Untitled', medium: 'Mixed Medium', dims: 'A4', year: '2025' },

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
const PATH = 'assets/art/';

const pad = (n) => String(n).padStart(2, '0');
const plateLabel = (w, i) => (w.title === 'Untitled' ? `Untitled — Plate ${pad(i + 1)}` : w.title);

/* ---------- Build gallery ---------- */
const gallery = document.getElementById('gallery');

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
      </button>`;

    fig.querySelector('.tile-btn').addEventListener('click', () => openLightbox(i));
    frag.appendChild(fig);
  });

  gallery.appendChild(frag);
}

/* ---------- Filtering ---------- */
let activeFilter = 'all';
let visibleIndices = WORK.map((_, i) => i);

function applyFilter(filter) {
  activeFilter = filter;
  visibleIndices = [];

  document.querySelectorAll('.tile').forEach((tile) => {
    const idx = Number(tile.dataset.index);
    const show = filter === 'all' || WORK[idx].cat === filter;
    tile.classList.toggle('hidden', !show);
    if (show) {
      visibleIndices.push(idx);
      tile.classList.remove('in');
      requestAnimationFrame(() => requestAnimationFrame(() => tile.classList.add('in')));
    }
  });
}

document.querySelectorAll('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((b) => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');
    applyFilter(btn.dataset.filter);
  });
});

/* ---------- Lightbox ---------- */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbTitle = document.getElementById('lbTitle');
const lbMeta = document.getElementById('lbMeta');
const lbCount = document.getElementById('lbCount');
let lbPos = 0;

function renderLightbox() {
  const i = visibleIndices[lbPos];
  const w = WORK[i];
  lbImg.src = PATH + w.file;
  lbImg.alt = `${plateLabel(w, i)} — ${w.medium}, ${w.dims}, ${w.year}`;
  lbTitle.textContent = plateLabel(w, i);
  lbMeta.textContent = `${w.medium} · ${w.dims} · ${w.year}`;
  lbCount.textContent = `${pad(lbPos + 1)} / ${pad(visibleIndices.length)}`;
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
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function step(dir) {
  if (!visibleIndices.length) return;
  lbPos = (lbPos + dir + visibleIndices.length) % visibleIndices.length;
  renderLightbox();
}

lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
lb.querySelector('.lb-prev').addEventListener('click', () => step(-1));
lb.querySelector('.lb-next').addEventListener('click', () => step(1));
lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

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

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  buildGallery();
  initHeader();
  initJumps();
  observeReveals();

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});
