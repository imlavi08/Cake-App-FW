/**
 * 11's Kitchen – Order / Creations page interactions
 * Shows toast only for cards that don't have their own page yet.
 */

(function () {
  'use strict';

  // Only select div-based cards (not anchor links which navigate themselves)
  const cards = document.querySelectorAll('div.menu-card');
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast() {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.classList.add('toast-visible');
    toastTimer = setTimeout(() => {
      toast.classList.remove('toast-visible');
    }, 2800);
  }

  cards.forEach((card) => {
    card.addEventListener('click', showToast);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showToast();
      }
    });
  });

})();
