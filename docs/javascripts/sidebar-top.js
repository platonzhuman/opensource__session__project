/* Левое меню всегда открывается с начала, а не с середины списка. */
(function () {
  function reset() {
    window.setTimeout(function () {
      var panes = document.querySelectorAll(".md-sidebar--primary .md-sidebar__scrollwrap");
      for (var i = 0; i < panes.length; i += 1) panes[i].scrollTop = 0;
    }, 60);
  }
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(reset);
  } else {
    document.addEventListener("DOMContentLoaded", reset);
  }
})();
