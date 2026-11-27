/* Progressive reveal and small interaction polish. */
(function () {
  "use strict";

  var SELECTOR = ".course-card, .dash-card, .review-deck, .stat, .deep-dive";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealNow(node) {
    node.classList.add("motion-reveal", "is-visible");
  }

  function init() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
    if (!nodes.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach(revealNow);
      return;
    }

    document.documentElement.classList.add("motion-ready");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });

    nodes.forEach(function (node, index) {
      if (node.dataset.motionReady === "1") return;
      node.dataset.motionReady = "1";
      node.classList.add("motion-reveal");
      node.style.setProperty("--reveal-index", String(index % 7));
      observer.observe(node);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  if (window.document$ && window.document$.subscribe) {
    window.document$.subscribe(init);
  }
})();
