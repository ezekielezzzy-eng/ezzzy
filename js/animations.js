(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  var style = document.createElement("style");
  style.textContent = ""
    + ".page-intro { opacity: 0; transform: translateY(8px); }"
    + ".animations-ready .page-intro {"
    + " opacity: 1; transform: translateY(0);"
    + " transition: opacity 520ms ease, transform 520ms ease;"
    + " transition-delay: var(--intro-delay, 0ms);"
    + " }";
  document.head.appendChild(style);

  var selectors = [
    ".hero-card",
    ".hero-text",
    ".hero-letter",
    ".wel",
    ".article-title",
    ".e2",
    ".form-header h1"
  ];

  selectors.forEach(function (selector, index) {
    document.querySelectorAll(selector).forEach(function (element) {
      element.classList.add("page-intro");
      element.style.setProperty("--intro-delay", Math.min(index * 70, 280) + "ms");
    });
  });

  requestAnimationFrame(function () {
    document.documentElement.classList.add("animations-ready");
  });
})();
