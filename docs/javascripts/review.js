/* ==========================================================================
   Spaced review: 1 → 3 → 7 дней.
   Завершённая миссия попадает в очередь повторений. «Сегодня» показывает,
   что пора вернуть в память, а не что «ещё пройти».
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "learning:reviews:v1";

  function readAll() {
    try {
      var raw = localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function writeAll(value) {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch (e) {}
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function dateKey(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function addDays(date, days) {
    var next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    next.setDate(next.getDate() + days);
    return next;
  }

  function daysBetween(from, to) {
    var a = new Date(from + "T00:00:00");
    var b = new Date(to + "T00:00:00");
    return Math.round((b - a) / 86400000);
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

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function intervalsFor(raw) {
    var values = String(raw || "1,3,7").split(",").map(function (item) {
      return Number(item);
    }).filter(function (item) {
      return isFinite(item) && item > 0;
    });
    return values.length ? values : [1, 3, 7];
  }

  function record(detail) {
    var all = readAll();
    var id = detail.id;
    if (!id) return;
    var intervals = intervalsFor(detail.review);
    var previous = all[id];
    var today = todayKey();
    var stage = previous ? Number(previous.stage || 0) : -1;
    var sameDay = previous && previous.last === today;

    if (!sameDay) stage += 1;
    if (stage < 0) stage = 0;
    // Если пришлось много раз исправлять — возвращаем заход уже завтра.
    if (Number(detail.attempts || 0) >= 3) stage = 0;
    if (stage >= intervals.length) stage = intervals.length - 1;

    all[id] = {
      id: id,
      title: detail.title || id,
      url: detail.url || location.pathname,
      reviewUrl: detail.reviewUrl || "",
      skills: detail.skills || [],
      attempts: Number(detail.attempts || 0),
      review: detail.review || "1,3,7",
      stage: stage,
      last: today,
      due: dateKey(addDays(new Date(), intervals[stage]))
    };
    writeAll(all);
    render();
    renderReviewResult();
  }

  function completeReview(id, meta) {
    if (!id) return;
    var all = readAll();
    var previous = all[id];
    var intervals = intervalsFor(previous && previous.review);
    var today = todayKey();
    var early = previous && previous.due && previous.due > today;
    var stage = early ? Number(previous.stage || 0) : (previous ? Number(previous.stage || 0) + 1 : 0);
    if (stage >= intervals.length) stage = intervals.length - 1;
    all[id] = {
      id: id,
      title: (previous && previous.title) || meta.title || id,
      url: (previous && previous.url) || meta.url || location.pathname,
      reviewUrl: (previous && previous.reviewUrl) || meta.reviewUrl || "",
      skills: (previous && previous.skills) || [],
      attempts: (previous && previous.attempts) || 0,
      review: (previous && previous.review) || "1,3,7",
      stage: stage,
      last: today,
      due: early ? previous.due : dateKey(addDays(new Date(), intervals[stage]))
    };
    writeAll(all);
    render();
    renderReviewResult();
  }

  function dueRecords() {
    var all = readAll();
    var today = todayKey();
    return Object.keys(all).map(function (id) {
      return all[id];
    }).filter(function (item) {
      return item && item.due && item.due <= today;
    }).sort(function (a, b) {
      return a.due.localeCompare(b.due);
    });
  }

  function render() {
    var host = document.querySelector("[data-review-list]");
    if (!host) return;
    host.innerHTML = "";
    var panel = host.closest ? host.closest(".review-panel") : null;

    var due = dueRecords();
    if (panel) panel.classList.toggle("is-empty", due.length === 0);
    var all = readAll();
    var future = Object.keys(all).map(function (id) {
      return all[id];
    }).filter(function (item) {
      return item && item.due && item.due > todayKey();
    }).sort(function (a, b) {
      return a.due.localeCompare(b.due);
    });

    if (due.length) {
      var head = el("div", "review-head");
      head.appendChild(el("span", "pill pill--blue", "пора повторить"));
      head.appendChild(el("span", "review-head__note", due.length + " " + plural(due.length, "заход", "захода", "заходов")));
      host.appendChild(head);

      due.forEach(function (item) {
        var late = daysBetween(item.due, todayKey());
        var card = el("a", "review-item");
        card.href = item.reviewUrl || (item.url + (item.url.indexOf("?") === -1 ? "?" : "&") + "review=1");
        var main = el("span", "review-item__main");
        main.appendChild(el("span", "review-item__title", item.title));
        main.appendChild(el("span", "review-item__sub",
          late > 0 ? "Просрочено на " + late + " " + plural(late, "день", "дня", "дней") : "Повторить сегодня"));
        card.appendChild(main);
        card.appendChild(el("span", "review-item__arrow", "›"));
        host.appendChild(card);
      });
    } else {
      var empty = el("div", "review-empty");
      empty.appendChild(el("strong", null, "Повторений на сегодня нет"));
      if (future.length) {
        var next = future[0];
        empty.appendChild(el("span", null,
          "Следующее: " + next.title + " — " + formatDate(next.due)));
      } else {
        empty.appendChild(el("span", null,
          "После первого захода здесь появятся возвраты через 1, 3, 7, 14 и 30 дней."));
      }
      host.appendChild(empty);
    }
  }

  function renderReviewResult() {
    var host = document.querySelector("[data-review-result]");
    if (!host) return;
    var id = host.getAttribute("data-review-result");
    var item = readAll()[id];
    host.innerHTML = "";
    if (!item) {
      host.textContent = "Сначала пройди заход, потом здесь появится дата возврата.";
      return;
    }
    host.textContent = "Следующее повторение: " + formatDate(item.due) +
      ". Интервал: " + (Number(item.stage || 0) + 1) + " из " + intervalsFor(item.review).length + ".";
  }

  function plural(n, one, few, many) {
    var mod10 = n % 10;
    var mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  window.addEventListener("learning:mission-complete", function (event) {
    if (event.detail) record(event.detail);
  });

  window.addEventListener("learning:quiz-complete", function (event) {
    var detail = event.detail || {};
    if (!detail.ok) return;
    var wrap = detail.root && detail.root.closest
      ? detail.root.closest("[data-review-topic]")
      : null;
    if (!wrap) return;
    completeReview(wrap.getAttribute("data-review-topic"), {
      title: wrap.getAttribute("data-review-title") || "",
      url: location.pathname,
      reviewUrl: location.pathname
    });
  });

  function boot() {
    render();
    renderReviewResult();
    if (window.document$ && window.document$.subscribe) {
      window.document$.subscribe(function () {
        render();
        renderReviewResult();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
