/* ==========================================================================
   Mission runtime: один шаг на экран, прогресс, мягкая проверка, память.
   Без календарей и дедлайнов.
   ========================================================================== */
(function () {
  "use strict";

  var LS = {
    step: function (id) { return "learning:mission:" + id + ":step"; },
    done: function (id) { return "learning:mission:" + id + ":done"; },
    save: function (id, name) { return "learning:mission:" + id + ":save:" + name; },
    last: "learning:last-mission"
  };

  function read(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function currentDate(root) {
    var el = root.querySelector("[data-today-date]");
    if (!el || el.dataset.filled === "1") return;
    try {
      el.textContent = new Intl.DateTimeFormat("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long"
      }).format(new Date());
      el.dataset.filled = "1";
    } catch (e) {}
  }

  function initMission(root) {
    if (root.dataset.missionReady === "1") return;
    root.dataset.missionReady = "1";

    var id = root.getAttribute("data-mission") || "mission";
    var title = root.getAttribute("data-title") || document.title;
    write("learning:mission:" + id + ":title", title);
    var pageTitle = document.querySelector(".md-content__inner > h1:first-child");
    if (pageTitle && pageTitle.nextElementSibling === root) {
      pageTitle.hidden = true;
    }

    // Старым 6-шаговым миссиям добавляем седьмой шаг-практикум.
    // Он не заменяет содержание курса, но даёт песочницу и возврат к материалу.
    var existingSteps = root.querySelectorAll(".mission-step").length;
    if (existingSteps < 7) {
      var practice = document.createElement("section");
      practice.className = "mission-step";
      practice.setAttribute("data-step", String(existingSteps + 1));
      practice.setAttribute("data-universal-practice", "1");
      var sandboxHref = new URL("../../sandbox/", location.href).pathname;
      practice.innerHTML =
        '<span class="mission-label">Шаг 7 · практикум · 10 минут</span>' +
        '<h2>Проверь руками</h2>' +
        '<p>Открой песочницу и повтори главный приём подтемы. Это не экзамен: ' +
        'тебе нужно увидеть, как код/запрос меняется, когда ты меняешь один параметр.</p>' +
        '<div class="mission-note mission-note--blue"><strong>Что сделать</strong>' +
        'Выбери один пример из шагов выше, измени в нём одно условие и объясни, ' +
        'что изменилось в результате.</div>' +
        '<div class="mission-card__actions">' +
        '<a class="button button--primary" href="' + sandboxHref + '">Открыть песочницу</a>' +
        '</div>' +
        '<textarea class="mission-textarea" data-save="practice" placeholder="Что я проверил в песочнице и что изменилось..."></textarea>' +
        '<textarea class="mission-textarea" data-save="practice-error" placeholder="Где я застрял и что проверю в следующий раз..."></textarea>';
      var controls = root.querySelector(".mission-controls");
      if (controls) root.insertBefore(practice, controls);
      else root.appendChild(practice);
    }

    var steps = Array.prototype.slice.call(root.querySelectorAll(".mission-step"));
    if (!steps.length) return;

    var params = new URLSearchParams(location.search);
    var urlStep = params.get("step");
    var isReview = params.get("review") === "1";
    var index = isReview ? 0 : (urlStep ? Number(urlStep) - 1 : Number(read(LS.step(id), "0")));
    if (!isFinite(index) || index < 0 || index >= steps.length) index = 0;

    var track = root.querySelector("[data-progress]");
    var count = root.querySelector("[data-count]");
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    var hint = root.querySelector("[data-hint]");
    var complete = root.querySelector("[data-complete]");
    var warned = {};

    function render() {
      steps.forEach(function (step, i) {
        step.hidden = i !== index;
        step.setAttribute("aria-hidden", i === index ? "false" : "true");
      });

      if (track) track.style.width = ((index + 1) / steps.length * 100) + "%";
      if (count) count.textContent = (index + 1) + " / " + steps.length;
      if (prev) prev.disabled = index === 0;
      if (next) {
        next.textContent = index === steps.length - 1 ? "Завершить" : "Дальше";
      }
      if (hint) {
        hint.textContent = root.dataset.hintDefault || "";
        hint.classList.remove("is-warn");
      }

      var active = steps[index];
      if (active) {
        setTimeout(function () {
          active.querySelectorAll(".igu-pg, .sql-playground").forEach(function (widget) {
            if (!widget._cm) return;
            if (widget._cm.setSize) widget._cm.setSize("100%", null);
            if (widget._cm.refresh) widget._cm.refresh();
          });
          window.dispatchEvent(new CustomEvent("learning:step-shown", {
            detail: { step: active, index: index }
          }));
        }, 30);
      }

      write(LS.step(id), String(index));
      write(LS.last, JSON.stringify({
        id: id,
        title: title,
        url: location.pathname,
        step: index + 1
      }));
    }

    function go(delta) {
      index = Math.max(0, Math.min(steps.length - 1, index + delta));
      render();
      var step = steps[index];
      if (step) step.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    function stepChecked(step) {
      return step && step.dataset.checked === "1";
    }

    function finish() {
      write(LS.done(id), "1");
      if (complete) {
        complete.hidden = false;
        complete.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      if (next) {
        next.disabled = true;
        next.textContent = "Пройдено";
      }

      var attempts = 0;
      root.querySelectorAll(".sql-playground, .igu-pg").forEach(function (widget) {
        attempts = Math.max(attempts, Number(widget.dataset.attempts || 0));
      });

      var reviewUrl = root.getAttribute("data-review-url");
      if (reviewUrl) {
        try { reviewUrl = new URL(reviewUrl, location.href).pathname; } catch (e) {}
      }

      window.dispatchEvent(new CustomEvent("learning:mission-complete", {
        detail: {
          id: id,
          title: title,
          url: location.pathname,
          reviewUrl: reviewUrl || "",
          attempts: attempts,
          review: root.getAttribute("data-review") || "1,3,7",
          skills: (root.getAttribute("data-skills") || "").split(",").filter(Boolean)
        }
      }));
    }

    function markStepChecked(step, message) {
      if (!step) return;
      step.dataset.checked = "1";
      step.classList.add("is-checked");
      if (hint && step === steps[index]) {
        hint.textContent = message || "Проверка пройдена. Можно идти дальше.";
        hint.classList.remove("is-warn");
      }
    }

    function allWidgetsDone(step) {
      if (!step || !step.hasAttribute("data-require-all")) return true;
      var widgets = step.querySelectorAll(".sql-playground, .igu-pg");
      if (!widgets.length) return true;
      var done = 0;
      widgets.forEach(function (widget) {
        if (widget.classList.contains("sql-done") || widget.classList.contains("igu-done")) done++;
      });
      return done === widgets.length;
    }

    if (prev) prev.addEventListener("click", function () { go(-1); });

    // Навигация по шагам из боковой панели курса.
    window.addEventListener("learning:goto-step", function (event) {
      var detail = event.detail || {};
      var target = Number(detail.index);
      if (!isFinite(target) || target < 0 || target >= steps.length) return;
      index = target;
      render();
    });

    if (next) next.addEventListener("click", function () {
      var step = steps[index];
      var needsCheck = step && step.hasAttribute("data-require-check");

      if (needsCheck && !stepChecked(step)) {
        if (root.getAttribute("data-strict") === "1") {
          if (hint) {
            hint.textContent = "Сначала пройди проверку. Этот заход не пропускает нерешённую задачу.";
            hint.classList.add("is-warn");
          }
          return;
        }
        if (!warned[index]) {
          warned[index] = true;
          if (hint) {
            hint.textContent = "Сначала запусти проверку в песочнице. Если хочешь всё равно дальше — нажми «Дальше» ещё раз.";
            hint.classList.add("is-warn");
          }
          return;
        }
      }

      if (index === steps.length - 1) {
        finish();
        return;
      }

      go(1);
    });

    // Песочницы сообщают об успешной проверке событием learning:check.
    window.addEventListener("learning:check", function (e) {
      var detail = e.detail || {};
      if (!detail.ok) return;
      var step = detail.root && detail.root.closest
        ? detail.root.closest(".mission-step")
        : null;
      if (!step || steps.indexOf(step) === -1) return;
      if (!allWidgetsDone(step)) {
        if (hint && step === steps[index]) {
          hint.textContent = "Одна задача прошла. Проверь остальные задачи на этом шаге.";
          hint.classList.remove("is-warn");
        }
        return;
      }
      markStepChecked(step);
    });

    // Диагностический опрос тоже закрывает шаг, но только при 80%+.
    window.addEventListener("learning:quiz-complete", function (e) {
      var detail = e.detail || {};
      var step = detail.root && detail.root.closest
        ? detail.root.closest(".mission-step")
        : null;
      if (!step || steps.indexOf(step) === -1) return;
      if (!detail.ok) {
        if (hint && step === steps[index]) {
          hint.textContent = "Нужно не меньше 80%. Разбери ошибки и пройди опрос ещё раз.";
          hint.classList.add("is-warn");
        }
        return;
      }
      markStepChecked(step, "Диагностика пройдена: " + detail.pct + "%. Можно к практике.");
    });

    // Восстанавливаем уже пройденные SQL-задачи после перезагрузки.
    function restoreStepChecks() {
      steps.forEach(function (step) {
        if (!step.hasAttribute("data-require-check")) return;
        var widgets = step.querySelectorAll(".sql-playground, .igu-pg");
        if (!widgets.length) return;
        var done = 0;
        widgets.forEach(function (widget) {
          if (widget.classList.contains("sql-done") || widget.classList.contains("igu-done")) done++;
        });
        if (done === widgets.length) {
          step.dataset.checked = "1";
          step.classList.add("is-checked");
        }
      });
    }

    restoreStepChecks();
    setTimeout(restoreStepChecks, 350);

    // Автосохранение выводов и чек-листов.
    root.querySelectorAll("[data-save]").forEach(function (field) {
      var name = field.getAttribute("data-save") || "text";
      var key = LS.save(id, name);
      var saved = read(key, "");
      if (saved && field.tagName === "TEXTAREA") field.value = saved;
      field.addEventListener("input", function () {
        if (field.type === "checkbox") {
          write(key, field.checked ? "1" : "0");
        } else {
          write(key, field.value);
        }
        write(key + ":at", new Date().toISOString());
      });
      if (field.type === "checkbox") {
        field.checked = saved === "1";
      }
    });

    render();
  }

  function initCourse(root) {
    root.querySelectorAll("[data-mission-id]").forEach(function (row) {
      var id = row.getAttribute("data-mission-id");
      if (!id) return;
      var done = read(LS.done(id), "0") === "1";
      var step = Number(read(LS.step(id), "0"));
      row.classList.toggle("is-done", done);
      row.classList.toggle("is-current", !done && step > 0);
      var meta = row.querySelector("[data-mission-status]");
      if (meta) {
        meta.textContent = done ? "Пройдено" : (step > 0 ? "Продолжить" : "Начать");
      }
    });

    root.querySelectorAll("[data-continue]").forEach(function (link) {
      var raw = read(LS.last, "");
      if (!raw) return;
      try {
        var last = JSON.parse(raw);
        if (last && last.url && last.title) {
          link.setAttribute("href", last.url);
          var title = document.querySelector("[data-continue-title]");
          if (title) title.textContent = last.title;
          var meta = document.querySelector("[data-continue-meta]");
          if (meta) meta.textContent = "Шаг " + (last.step || 1);
        }
      } catch (e) {}
    });

    currentDate(root);
  }

  function init() {
    document.querySelectorAll("[data-mission]").forEach(initMission);
    initCourse(document);
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
