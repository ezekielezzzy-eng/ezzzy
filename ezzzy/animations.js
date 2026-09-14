(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pageWrap = document.querySelector('.page-wrap');

  if (prefersReducedMotion) {
    document.body.classList.add('reduced-motion');
    if (pageWrap) pageWrap.classList.add('animate-page');
    return;
  }

  if (pageWrap) {
    pageWrap.classList.add('animate-page');
  }
})();
