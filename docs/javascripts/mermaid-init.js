(function () {
  "use strict";

  var initialized = false;
  var attempts = 0;

  function ensureInit() {
    if (!window.mermaid) return false;
    if (initialized) return true;
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "base",
      flowchart: { htmlLabels: true, curve: "basis" }
    });
    initialized = true;
    return true;
  }

  // Material сам берёт fence с class="mermaid" и тянет mermaid с CDN.
  // У нас локальная сборка, поэтому fence приходит как mermaid-src,
  // а в .mermaid превращаем его только когда шаг миссии видим.
  function prepare() {
    Array.prototype.forEach.call(document.querySelectorAll("pre.mermaid-src"), function (pre) {
      if (pre.dataset.prepared) return;
      var code = pre.textContent || "";
      var host = document.createElement("div");
      host.className = "mermaid";
      host.dataset.mermaidSrc = code;
      pre.replaceWith(host);
    });
  }

  function renderVisible() {
    if (!ensureInit()) return;
    var nodes = [];
    Array.prototype.forEach.call(document.querySelectorAll(".mermaid"), function (el) {
      if (el.offsetParent === null) return;
      var svg = el.querySelector("svg");
      if (svg && svg.getBoundingClientRect().width > 5) return;
      // Схема, отрисованная в скрытом шаге, остаётся 0×0: чистим и рисуем заново.
      if (svg) {
        el.innerHTML = "";
        el.removeAttribute("data-processed");
      }
      if (!el.textContent.trim() && el.dataset.mermaidSrc) {
        el.textContent = el.dataset.mermaidSrc;
      }
      if (el.textContent.trim()) nodes.push(el);
    });
    if (!nodes.length) return;
    window.mermaid.run({ nodes: nodes }).catch(function (err) {
      console.error("mermaid:", err);
    });
  }

  function tick() {
    attempts += 1;
    prepare();
    if (attempts <= 120) {
      renderVisible();
      window.setTimeout(tick, 400);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick);
  } else {
    tick();
  }

  document.addEventListener("click", function () {
    window.setTimeout(renderVisible, 250);
  });
})();
