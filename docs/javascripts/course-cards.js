(function () {
  "use strict";
  function init() {
    document.querySelectorAll(".course-card").forEach(function (card) {
      if (card.querySelector(".course-card__facts")) return;
      var date = card.getAttribute("data-date") || "26.11.2026";
      var duration = card.getAttribute("data-duration");
      if (!duration) {
        var metaText = (card.querySelector(".course-card__meta span") || {}).textContent || "";
        duration = metaText.indexOf("дней") !== -1 ? "3–5 дней" : "20–30 мин";
      }
      var facts = document.createElement("div");
      facts.className = "course-card__facts";
      facts.textContent = date + " · " + duration;
      var meta = card.querySelector(".course-card__meta");
      if (meta) meta.parentNode.insertBefore(facts, meta);
      else card.appendChild(facts);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
