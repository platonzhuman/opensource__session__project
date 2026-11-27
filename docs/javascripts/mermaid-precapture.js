(function () {
  "use strict";
  window.__mermaidSources = [];
  document.querySelectorAll(".mermaid").forEach(function (el) {
    window.__mermaidSources.push(el.textContent || "");
  });
})();
