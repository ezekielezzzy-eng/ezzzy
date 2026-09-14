(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  function applyIntroClasses() {
    var selectors = [
      ".hero-text",
      ".hero-letter",
      ".wel",
      ".article-title",
      ".e2",
      ".form-header h1",
      ".card-category",
      ".card-title",
      ".card-content",
      ".card-author"
    ];

    selectors.forEach(function (selector, index) {
      document.querySelectorAll(selector).forEach(function (element) {
        element.classList.add("intense-entrance");
        element.style.setProperty("--intro-delay", Math.min(index * 70, 280) + "ms");
      });
    });

    document.querySelectorAll(".buttom, .btn-write, .btn-publish").forEach(function (element) {
      element.classList.add("pulse-glow");
    });

    document.querySelectorAll(".article-card").forEach(function (element) {
      element.classList.add("hover-lift", "reveal-on-scroll");
    });
  }

  function revealOnScroll() {
    var revealNodes = document.querySelectorAll(".reveal-on-scroll");

    if (!revealNodes.length) {
      return;
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.18,
        rootMargin: "0px 0px -6% 0px"
      });

      revealNodes.forEach(function (node) {
        observer.observe(node);
      });
      return;
    }

    revealNodes.forEach(function (node) {
      node.classList.add("is-visible");
    });
  }

  applyIntroClasses();
  requestAnimationFrame(function () {
    document.documentElement.classList.add("animations-ready");
    revealOnScroll();
  });
})();
