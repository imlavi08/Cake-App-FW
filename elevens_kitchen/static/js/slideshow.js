/**
 * 11's Kitchen – Slideshow / Carousel
 * Auto-plays every 4 seconds. Supports arrows + dot nav.
 * Works with any number of slides — no code changes needed
 * when new images are added to the folder.
 */

(function () {
  'use strict';

  const AUTOPLAY_INTERVAL = 4000; // ms between slides

  const slides   = document.querySelectorAll('.slide');
  const dots     = document.querySelectorAll('.dot');
  const btnPrev  = document.getElementById('arrow-prev');
  const btnNext  = document.getElementById('arrow-next');
  const currentEl = document.getElementById('slide-current');

  if (!slides.length) return;  // no images — nothing to do

  let current  = 0;
  let timer    = null;

  // ── helpers ────────────────────────────────────────────
  function showSlide(index) {
    // wrap around
    if (index >= slides.length) index = 0;
    if (index < 0)              index = slides.length - 1;

    // hide all
    slides.forEach((s) => { s.style.display = 'none'; });
    dots.forEach((d)  => {
      d.classList.remove('dot-active');
      d.setAttribute('aria-selected', 'false');
    });

    // show target
    slides[index].style.display = 'block';
    if (dots[index]) {
      dots[index].classList.add('dot-active');
      dots[index].setAttribute('aria-selected', 'true');
    }
    if (currentEl) currentEl.textContent = index + 1;

    current = index;
  }

  function nextSlide() { showSlide(current + 1); }
  function prevSlide() { showSlide(current - 1); }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // ── initial display ────────────────────────────────────
  // First slide is already visible from server-rendered HTML;
  // just make sure the rest are hidden.
  slides.forEach((s, i) => {
    if (i !== 0) s.style.display = 'none';
  });

  // ── arrow buttons ──────────────────────────────────────
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      prevSlide();
      startAutoplay(); // reset timer on manual nav
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      nextSlide();
      startAutoplay();
    });
  }

  // ── dot buttons ────────────────────────────────────────
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      showSlide(idx);
      startAutoplay();
    });
  });

  // ── keyboard navigation ────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prevSlide(); startAutoplay(); }
    if (e.key === 'ArrowRight') { nextSlide(); startAutoplay(); }
  });

  // ── pause on hover ─────────────────────────────────────
  const wrapper = document.getElementById('slideshow-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAutoplay);
    wrapper.addEventListener('mouseleave', startAutoplay);
  }

  // ── start ──────────────────────────────────────────────
  startAutoplay();

})();
