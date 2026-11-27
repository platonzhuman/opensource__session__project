/* Доступный переключатель языков на странице «Практика». */
(function () {
  "use strict";

  function init() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-practice-tab]"));
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-panel]"));
    if (!tabs.length || !panels.length) return;
    if (tabs[0].dataset.tabsReady === "1") return;
    tabs[0].dataset.tabsReady = "1";

    var panelByLang = {};
    panels.forEach(function (panel) {
      var lang = panel.getAttribute("data-panel");
      panelByLang[lang] = panel;
      panel.id = "practice-panel-" + lang;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", "practice-tab-" + lang);
    });

    function activate(lang, focus) {
      tabs.forEach(function (tab) {
        var active = tab.getAttribute("data-practice-tab") === lang;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-panel") !== lang;
      });
    }

    tabs.forEach(function (tab, index) {
      var lang = tab.getAttribute("data-practice-tab");
      tab.id = "practice-tab-" + lang;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "practice-panel-" + lang);
      tab.addEventListener("click", function () { activate(lang); });
      tab.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" &&
            event.key !== "Home" && event.key !== "End") return;
        event.preventDefault();
        var next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        activate(tabs[next].getAttribute("data-practice-tab"), true);
      });
    });

    activate("python");
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
