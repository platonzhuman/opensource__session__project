/* ==========================================================================
   Course shell: курс вокруг миссии.
   Слева — программа, в центре — шаг, справа — прогресс и повторение.
   ========================================================================== */
(function () {
  "use strict";

  var REVIEW_KEY = "learning:reviews:v1";

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long"
      }).format(new Date(value + "T00:00:00"));
    } catch (e) {
      return value;
    }
  }

  function todayKey() {
    var date = new Date();
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  function stepHeading(step, index) {
    var heading = step.querySelector("h2");
    return heading
      ? heading.textContent.replace(/¶/g, "").trim()
      : "Шаг " + (index + 1);
  }

  function build(mission) {
    if (mission.dataset.shellReady === "1") return;
    mission.dataset.shellReady = "1";

    var steps = Array.prototype.slice.call(mission.querySelectorAll(".mission-step"));
    if (!steps.length) return;

    var title = mission.getAttribute("data-title") || document.title.replace(/\s*[-—]\s*Learning$/, "");
    var kicker = mission.querySelector(".mission-kicker");
    var missionId = mission.getAttribute("data-mission") || "";
    var reviewUrl = new URL("../../review/", location.href).pathname;

    var layout = el("div", "mission-layout");
    var rail = el("aside", "mission-rail");
    var main = el("div", "mission-main");
    var side = el("aside", "mission-side");

    var back = el("a", "mission-rail__back", "← К курсу");
    back.href = "../";
    rail.appendChild(back);
    rail.appendChild(el("div", "mission-rail__kicker", kicker ? kicker.textContent : "курс"));
    rail.appendChild(el("div", "mission-rail__title", title));

    var outline = el("ol", "mission-outline");
    steps.forEach(function (step, index) {
      var button = el("button", "mission-outline__item");
      button.type = "button";
      button.dataset.index = String(index);
      button.appendChild(el("span", "mission-outline__num", String(index + 1).padStart(2, "0")));
      var body = el("span", "mission-outline__body");
      var label = step.querySelector(".mission-label");
      body.appendChild(el("span", "mission-outline__label", label ? label.textContent : "Шаг " + (index + 1)));
      body.appendChild(el("span", "mission-outline__heading", stepHeading(step, index)));
      button.appendChild(body);
      button.addEventListener("click", function () {
        window.dispatchEvent(new CustomEvent("learning:goto-step", {
          detail: { index: index }
        }));
      });
      outline.appendChild(button);
    });
    rail.appendChild(outline);

    var progressCard = el("div", "mission-side__card");
    progressCard.appendChild(el("div", "mission-side__eyebrow", "прогресс"));
    var ring = el("div", "shell-ring");
    var ringValue = el("b", null, "1 / " + steps.length);
    ring.appendChild(ringValue);
    progressCard.appendChild(ring);
    var countLine = el("div", "mission-side__muted", "шаг 1 из " + steps.length);
    progressCard.appendChild(countLine);
    side.appendChild(progressCard);

    var reviewCard = el("div", "mission-side__card");
    reviewCard.appendChild(el("div", "mission-side__eyebrow", "повторение"));
    var reviewText = el("div", "mission-side__muted", "После завершения подтемы");
    var reviewLink = el("a", "button button--small", "Открыть повторение");
    reviewLink.href = reviewUrl;
    reviewCard.appendChild(reviewText);
    reviewCard.appendChild(reviewLink);
    side.appendChild(reviewCard);

    var ruleCard = el("div", "mission-side__card mission-side__card--quiet");
    ruleCard.appendChild(el("div", "mission-side__eyebrow", "правило"));
    ruleCard.appendChild(el("div", "mission-side__muted",
      "Сначала попытка. Подсказка — после второй. Ответ — после третьей."));
    side.appendChild(ruleCard);

    var todayLink = el("a", "mission-side__today", "На сегодня →");
    todayLink.href = "../../";
    side.appendChild(todayLink);

    mission.parentNode.insertBefore(layout, mission);
    main.appendChild(mission);
    layout.appendChild(rail);
    layout.appendChild(main);
    layout.appendChild(side);
    document.body.classList.add("mission-page");

    function activeIndex() {
      for (var i = 0; i < steps.length; i++) {
        if (!steps[i].hidden) return i;
      }
      return 0;
    }

    function updateProgress() {
      var index = activeIndex();
      var pct = Math.round((index + 1) / steps.length * 100);
      ring.style.setProperty("--pct", pct);
      ringValue.textContent = (index + 1) + " / " + steps.length;
      countLine.textContent = "шаг " + (index + 1) + " из " + steps.length;
      outline.querySelectorAll(".mission-outline__item").forEach(function (item, i) {
        item.classList.toggle("is-active", i === index);
        item.classList.toggle("is-done", steps[i].dataset.checked === "1");
        if (i === index) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
    }

    function updateReview() {
      var all = readJson(REVIEW_KEY, {});
      var record = all[missionId];
      if (!record) {
        reviewText.textContent = "После завершения подтемы";
        reviewLink.hidden = true;
        return;
      }
      reviewLink.hidden = false;
      reviewLink.href = record.reviewUrl || (location.pathname + "?review=1");
      if (record.due <= todayKey()) {
        reviewText.textContent = "Пора повторить: " + formatDate(record.due);
      } else {
        reviewText.textContent = "Следующее: " + formatDate(record.due);
      }
    }

    window.addEventListener("learning:step-shown", updateProgress);
    window.addEventListener("learning:check", updateProgress);
    window.addEventListener("learning:quiz-complete", updateProgress);
    window.addEventListener("learning:mission-complete", updateReview);
    updateProgress();
    updateReview();
  }

  function init() {
    var missions = document.querySelectorAll(".mission");
    document.body.classList.toggle("mission-page", missions.length > 0);
    missions.forEach(build);
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
