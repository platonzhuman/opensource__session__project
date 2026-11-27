/* Постоянный вход в песочницу с любой страницы сервиса. */
(function () {
  "use strict";

  var SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "";
  var BASE = SCRIPT_SRC ? SCRIPT_SRC.replace(/javascripts\/practice-dock\.js.*$/, "") : "";

  function addDock() {
    if (document.querySelector(".practice-dock")) return;
    if (/\/sandbox\/?(index\.html)?$/.test(location.pathname)) return;

    var link = document.createElement("a");
    link.className = "practice-dock";
    link.href = BASE + "sandbox/";
    link.innerHTML = '<span class="practice-dock__mark">⌘</span><span>Практика</span>';
    document.body.appendChild(link);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addDock);
  } else {
    addDock();
  }

  if (window.document$ && window.document$.subscribe) {
    window.document$.subscribe(addDock);
  }
})();
