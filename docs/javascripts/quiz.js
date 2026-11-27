/* ==========================================================================
   Мини-практика (Duolingo-style) — расширенный движок
   - блок в markdown: ```quiz  { json } ```
   - типы: choice, multi, input, truefalse, order, find, fill, wordbank
   - по одному вопросу за раз, мгновенная проверка, объяснение, счёт
   ========================================================================== */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function norm(v) {
    return String(v == null ? "" : v)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/,/g, ".")
      .replace(/\u00a0/g, " ");
  }

  function typeset(el) {
    if (window.MathJax && window.MathJax.typesetPromise) {
      try { window.MathJax.typesetPromise([el]); } catch (e) {}
    }
  }

  var SEQ = { order: 1, wordbank: 1 };
  var SINGLE = { choice: 1, fill: 1, find: 1, truefalse: 1 };

  function build(root) {
    if (root.dataset.quizReady === "1") return;
    root.dataset.quizReady = "1";

    var data;
    try {
      data = JSON.parse(root.textContent);
    } catch (e) {
      root.innerHTML = '<div class="quiz-error">Не удалось прочитать данные практики.</div>';
      return;
    }
    var questions = data.questions || [];
    if (!questions.length) return;

    var host = document.createElement("div");
    host.className = "quiz-widget";
    if (data.min) host.dataset.min = String(data.min);
    root.replaceWith(host);

    var idx = 0, score = 0, answered = false;

    function header() {
      return (
        '<div class="quiz-head">' +
          '<span class="quiz-title">' + esc(data.title || "Мини-практика") + "</span>" +
          '<span class="quiz-counter">' + (idx + 1) + " / " + questions.length + "</span>" +
        "</div>" +
        '<div class="quiz-progress"><span style="width:' + Math.round((idx / questions.length) * 100) + '%"></span></div>'
      );
    }

    function optionsBody(q, hint) {
      return (
        '<div class="quiz-q">' + esc(q.q) + hint + "</div>" +
        '<div class="quiz-options">' +
        (q.options || []).map(function (o, i) {
          return '<button type="button" class="quiz-option" data-i="' + i + '">' +
            esc(o) + "</button>";
        }).join("") +
        "</div>"
      );
    }

    function seqBody(q, tokens) {
      return (
        '<div class="quiz-q">' + esc(q.q) + ' <span class="quiz-hint">(нажимай по порядку)</span></div>' +
        '<div class="quiz-seq" data-built></div>' +
        '<div class="quiz-bank">' +
        (tokens || []).map(function (t, i) {
          return '<button type="button" class="quiz-token" data-t="' + esc(t) + '" data-i="' + i + '">' + esc(t) + "</button>";
        }).join("") +
        "</div>"
      );
    }

    function findBody(q) {
      return (
        '<div class="quiz-q">' + esc(q.q) + "</div>" +
        '<div class="quiz-lines">' +
        (q.lines || []).map(function (l, i) {
          return '<button type="button" class="quiz-line" data-i="' + i + '"><span class="quiz-ln">' + (i + 1) + "</span>" + esc(l) + "</button>";
        }).join("") +
        "</div>"
      );
    }

    function body(q) {
      if (q.type === "input") {
        return '<div class="quiz-q">' + esc(q.q) + "</div>" +
          '<input class="quiz-input" type="text" autocomplete="off" placeholder="Твой ответ">';
      }
      if (q.type === "truefalse") {
        return optionsBody({ q: q.q, options: ["Верно", "Неверно"] });
      }
      if (q.type === "find") return findBody(q);
      if (q.type === "order") return seqBody(q, q.items);
      if (q.type === "wordbank") return seqBody(q, q.bank);
      var hint = q.type === "multi" ? ' <span class="quiz-hint">(выбери все верные)</span>' : "";
      return optionsBody(q, hint);
    }

    function render() {
      if (idx >= questions.length) return renderScore();
      answered = false;
      var q = questions[idx];

      host.innerHTML =
        header() +
        '<div class="quiz-card">' + body(q) +
          '<div class="quiz-feedback" hidden></div>' +
          '<div class="quiz-actions">' +
            '<button type="button" class="igu-btn igu-btn--run quiz-check">Проверить</button>' +
            '<button type="button" class="igu-btn quiz-next" hidden>Далее</button>' +
          "</div>" +
        "</div>";

      typeset(host);
      wire(q);
    }

    function selected() {
      var q = questions[idx];
      if (q.type === "input") {
        var inp = host.querySelector(".quiz-input");
        return inp ? inp.value : "";
      }
      if (SEQ[q.type]) {
        return Array.prototype.slice.call(host.querySelectorAll(".quiz-seq .quiz-token"))
          .map(function (b) { return b.getAttribute("data-t"); });
      }
      return Array.prototype.slice.call(host.querySelectorAll(".quiz-option.is-picked, .quiz-line.is-picked"))
        .map(function (b) { return Number(b.getAttribute("data-i")); });
    }

    function sameSeq(a, b) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    }

    function isCorrect(q, val) {
      if (q.type === "input") {
        var accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
        return accepted.map(norm).indexOf(norm(val)) !== -1;
      }
      if (q.type === "multi") {
        return (q.answer || []).slice().sort().join(",") === (val || []).slice().sort().join(",");
      }
      if (q.type === "truefalse") return (q.answer ? 0 : 1) === Number(val[0]);
      if (SEQ[q.type]) return sameSeq(q.answer || [], val);
      return Number(q.answer) === Number(val[0]);
    }

    function wire(q) {
      var opts = host.querySelectorAll(".quiz-option, .quiz-line");
      opts.forEach(function (b) {
        b.addEventListener("click", function () {
          if (answered) return;
          if (q.type === "multi") {
            b.classList.toggle("is-picked");
          } else {
            opts.forEach(function (x) { x.classList.remove("is-picked"); });
            b.classList.add("is-picked");
          }
        });
      });

      if (SEQ[q.type]) {
        var built = host.querySelector("[data-built]");
        host.querySelectorAll(".quiz-bank .quiz-token").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (answered) return;
            var clone = btn.cloneNode(true);
            clone.classList.remove("in-bank");
            btn.disabled = true;
            btn.classList.add("is-used");
            clone.addEventListener("click", function () {
              if (answered) return;
              clone.remove();
              btn.disabled = false;
              btn.classList.remove("is-used");
            });
            built.appendChild(clone);
          });
        });
      }

      var input = host.querySelector(".quiz-input");
      if (input) {
        input.focus();
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); host.querySelector(".quiz-check").click(); }
        });
      }

      host.querySelector(".quiz-check").addEventListener("click", function () { check(q); });
      host.querySelector(".quiz-next").addEventListener("click", function () { idx++; render(); });
    }

    function check(q) {
      if (answered) return;
      var val = selected();
      var empty = (q.type === "input") ? !String(val).trim()
        : SEQ[q.type] ? !(val && val.length)
        : (!val || !val.length);
      if (empty) return;
      answered = true;
      var ok = isCorrect(q, val);
      if (ok) score++;

      if (q.type === "input") {
        var inp = host.querySelector(".quiz-input");
        inp.disabled = true; inp.classList.add(ok ? "is-correct" : "is-wrong");
      } else if (SEQ[q.type]) {
        host.querySelectorAll(".quiz-seq .quiz-token").forEach(function (b) {
          b.classList.add("is-correct");
        });
        host.querySelectorAll(".quiz-bank .quiz-token").forEach(function (b) { b.disabled = true; });
      } else {
        host.querySelectorAll(".quiz-option, .quiz-line").forEach(function (b) {
          var i = Number(b.getAttribute("data-i"));
          var want = (q.type === "multi") ? (q.answer || []).indexOf(i) !== -1
            : (q.type === "truefalse") ? ((q.answer ? 0 : 1) === i) : (Number(q.answer) === i);
          if (want) b.classList.add("is-correct");
          else if (b.classList.contains("is-picked")) b.classList.add("is-wrong");
          b.disabled = true;
        });
      }

      var fb = host.querySelector(".quiz-feedback");
      fb.hidden = false;
      fb.className = "quiz-feedback " + (ok ? "is-ok" : "is-bad");
      fb.setAttribute("role", "status");
      fb.setAttribute("aria-live", "polite");
      var answerTxt = "";
      if (!ok) {
        if (q.type === "input") answerTxt = "Правильно: <b>" + esc(Array.isArray(q.answer) ? q.answer[0] : q.answer) + "</b>. ";
        else if (q.type === "multi") answerTxt = "Верные: <b>" + (q.answer || []).map(function (i) { return esc(q.options[i]); }).join(", ") + "</b>. ";
        else if (q.type === "truefalse") answerTxt = "Правильно: <b>" + (q.answer ? "Верно" : "Неверно") + "</b>. ";
        else if (SEQ[q.type]) answerTxt = "Правильно: <b>" + (q.answer || []).join(" ") + "</b>. ";
        else if (q.type === "find") answerTxt = "Ошибка в строке <b>" + (q.answer + 1) + "</b>. ";
        else answerTxt = "Правильно: <b>" + esc(q.options[q.answer]) + "</b>. ";
      }
      fb.innerHTML = "<b>" + (ok ? "Верно!" : "Не совсем.") + "</b> " + answerTxt + esc(q.explain || "");
      typeset(fb);

      host.querySelector(".quiz-check").hidden = true;
      var next = host.querySelector(".quiz-next");
      next.hidden = false;
      next.textContent = idx === questions.length - 1 ? "Показать результат" : "Далее";
      next.focus();
    }

    function saveResult(title, sc, total) {
      try {
        var key = "igu-quiz-results-v1";
        var all = JSON.parse(localStorage.getItem(key) || "{}");
        var pct = Math.round((sc / total) * 100);
        var rec = all[title] || { best: 0, last: 0, attempts: 0 };
        rec.last = pct; rec.best = Math.max(rec.best, pct);
        rec.attempts = (rec.attempts || 0) + 1; rec.total = total;
        rec.updated = new Date().toISOString();
        all[title] = rec;
        localStorage.setItem(key, JSON.stringify(all));
      } catch (e) {}
    }

    function renderScore() {
      var pct = Math.round((score / questions.length) * 100);
      saveResult(data.title || "Мини-практика", score, questions.length);
      var passed = pct >= Number(data.min || 80);
      window.dispatchEvent(new CustomEvent("learning:quiz-complete", {
        detail: {
          root: host,
          ok: passed,
          pct: pct,
          score: score,
          total: questions.length,
          title: data.title || "Мини-практика"
        }
      }));
      var verdict = pct >= 80 ? "Отличный результат." : pct >= 60 ? "Хорошо, но есть что подтянуть." : "Стоит пройти урок ещё раз.";
      host.innerHTML =
        '<div class="quiz-card quiz-score">' +
          '<div class="quiz-score__ring" style="--pct:' + pct + '"><b>' + pct + '%</b></div>' +
          '<h3>Правильно ' + score + " из " + questions.length + "</h3>" +
          "<p>" + verdict + "</p>" +
          '<button type="button" class="igu-btn igu-btn--run quiz-restart">Пройти заново</button>' +
        "</div>";
      host.querySelector(".quiz-restart").addEventListener("click", function () {
        idx = 0; score = 0; render();
      });
    }

    render();
  }

  function scan() {
    document.querySelectorAll(".quiz").forEach(build);
  }

  function boot() {
    scan();
    if (window.document$ && window.document$.subscribe) {
      window.document$.subscribe(function () { scan(); });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
