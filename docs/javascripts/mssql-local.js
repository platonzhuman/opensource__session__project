/* ==========================================================================
   Локальная T-SQL задача: решается у себя в VS Code на настоящем MSSQL.
   - Блок в markdown: ```mssqllocal ... ``` (custom fence)
   - Директивы: -- @mode run|write|fix, -- @id, -- @expect {...}, -- @hint ...
   - Ученик вставляет результат из Query Results (Ctrl+C по ячейкам),
     страница сверяет его с @expect.
   - Корень виджета — .sql-playground, поэтому mission.js считает его
     вместе с песочницей (класс sql-done + событие learning:check).
   ========================================================================== */
(function () {
  "use strict";

  var MAX_ATTEMPTS_BEFORE_ANSWER = 3;
  var MIN_ATTEMPTS_FOR_HINT = 2;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function parseDirectives(source) {
    var parsed = { mode: "run", expect: null, hint: "", id: "", code: "" };
    var kept = [];
    String(source).replace(/\s+$/, "").split("\n").forEach(function (line) {
      var m = line.match(/^\s*--\s*@mode\s+(fix|write|run)\b/i);
      if (m) { parsed.mode = m[1].toLowerCase(); return; }
      m = line.match(/^\s*--\s*@expect\s+(.+)$/);
      if (m) {
        try { parsed.expect = JSON.parse(m[1]); }
        catch (e) { parsed.expect = { error: "Не удалось разобрать @expect: " + e.message }; }
        return;
      }
      m = line.match(/^\s*--\s*@hint\s+(.+)$/);
      if (m) { parsed.hint = m[1]; return; }
      m = line.match(/^\s*--\s*@id\s+(\S+)/);
      if (m) { parsed.id = m[1]; return; }
      kept.push(line);
    });
    parsed.code = kept.join("\n").replace(/^\s+/, "").replace(/\s+$/, "");
    return parsed;
  }

  function splitCells(line) {
    if (line.indexOf("\t") !== -1) return line.split("\t");
    if (line.indexOf("|") !== -1) return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|");
    return line.trim().split(/\s{2,}/);
  }

  function normCell(value) {
    if (value === null || value === undefined) return null;
    var text = String(value).trim();
    if (text.toUpperCase() === "NULL") return null;
    if (/^-?\d+(\.\d+)?$/.test(text)) return String(Number(text));
    return text.toLowerCase();
  }

  function sameRow(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function parsePasted(text, columns) {
    var rows = String(text).split(/\r?\n/)
      .filter(function (line) { return line.trim() !== ""; })
      .map(function (line) { return splitCells(line).map(normCell); });
    var header = (columns || []).map(normCell);
    if (rows.length && header.length && sameRow(rows[0], header)) rows.shift();
    return rows;
  }

  function sortRows(rows) {
    return rows.slice().sort(function (a, b) {
      return JSON.stringify(a).localeCompare(JSON.stringify(b));
    });
  }

  function compare(pastedRows, expect) {
    var want = (expect.rows || []).map(function (row) { return row.map(normCell); });
    var got = pastedRows;
    if (!expect.ordered) {
      got = sortRows(got);
      want = sortRows(want);
    }
    return { ok: JSON.stringify(got) === JSON.stringify(want), got: got.length, want: want.length };
  }

  function expectedTable(expect) {
    var wrap = el("div", "sql-expected");
    wrap.appendChild(el("div", "sql-expected-title", "Ожидаемый результат"));
    var table = el("table", "sql-table");
    var head = el("tr");
    (expect.columns || []).forEach(function (c) { head.appendChild(el("th", null, c)); });
    var thead = el("thead");
    thead.appendChild(head);
    table.appendChild(thead);
    var tbody = el("tbody");
    (expect.rows || []).forEach(function (row) {
      var tr = el("tr");
      row.forEach(function (c) { tr.appendChild(el("td", null, c === null ? "NULL" : String(c))); });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function doneKey(task) {
    return "mssqlcheck:" + location.pathname + ":" + task;
  }

  function wasDone(task) {
    try { return localStorage.getItem(doneKey(task)) === "1"; } catch (e) { return false; }
  }

  function markDone(task) {
    try { localStorage.setItem(doneKey(task), "1"); } catch (e) { /* приватный режим */ }
  }

  function copyText(text, button) {
    var restore = button.textContent;
    var done = function (label) {
      button.textContent = label;
      setTimeout(function () { button.textContent = restore; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done("Скопировано"); }, function () { done("Не вышло"); });
    } else {
      done("Выдели и Ctrl+C");
    }
  }

  var LABELS = {
    run: "T-SQL · запусти у себя",
    write: "T-SQL · напиши у себя",
    fix: "T-SQL · почини у себя"
  };

  function buildWidget(node, index) {
    if (node.dataset.mssqlReady === "1") return;
    node.dataset.mssqlReady = "1";

    var code = node.querySelector("code") || node;
    var parsed = parseDirectives(code.textContent || "");
    var container = (node.closest && node.closest("div.highlight")) || node;
    var fieldId = "mssql-paste-" + index;
    var task = parsed.id || "example-" + index;

    var root = el("div", "sql-playground mssql-local");
    root.dataset.mode = parsed.mode;
    if (parsed.id) root.dataset.taskId = parsed.id;

    var bar = el("div", "sql-bar");
    bar.appendChild(el("span", "sql-label", LABELS[parsed.mode] || LABELS.run));
    bar.appendChild(el("span", "sql-seed", "база: Front · VS Code"));
    if (parsed.id) bar.appendChild(el("span", "sql-task-id", "@" + parsed.id));
    var actions = el("span", "sql-actions");
    var copyBtn = el("button", "sql-btn", "Копировать код");
    copyBtn.type = "button";
    var hintBtn = el("button", "sql-btn sql-btn--hint", "Подсказка");
    hintBtn.type = "button";
    hintBtn.disabled = true;
    hintBtn.title = "Подсказка откроется после 2 попыток";
    actions.appendChild(copyBtn);
    if (parsed.hint) actions.appendChild(hintBtn);
    bar.appendChild(actions);
    root.appendChild(bar);

    var pre = el("pre", "mssql-code");
    pre.appendChild(el("code", null, parsed.code));
    root.appendChild(pre);

    var form = el("div", "mssql-paste");
    var label = el("label", "mssql-paste-label", "Вставь сюда результат из Query Results (выдели ячейки → Ctrl+C → Ctrl+V)");
    label.htmlFor = fieldId;
    var area = el("textarea", "mssql-paste-area");
    area.id = fieldId;
    area.rows = 3;
    area.spellcheck = false;
    var checkBtn = el("button", "sql-btn sql-btn--run", "Проверить");
    checkBtn.type = "button";
    var out = el("div", "sql-out");
    out.setAttribute("aria-live", "polite");
    form.appendChild(label);
    form.appendChild(area);
    form.appendChild(checkBtn);
    root.appendChild(form);
    root.appendChild(out);

    function setDone() {
      root.classList.add("sql-done");
      if (!bar.querySelector(".sql-done-badge")) bar.appendChild(el("span", "sql-done-badge", "пройдено"));
    }

    if (wasDone(task)) setDone();

    copyBtn.addEventListener("click", function () { copyText(parsed.code, copyBtn); });

    hintBtn.addEventListener("click", function () {
      if (out.querySelector(".sql-hintbox")) return;
      out.appendChild(el("div", "sql-hintbox", parsed.hint));
    });

    checkBtn.addEventListener("click", function () {
      out.textContent = "";
      var box = el("div", "sql-check");
      if (!parsed.expect || parsed.expect.error) {
        box.textContent = (parsed.expect && parsed.expect.error) || "У задачи нет @expect.";
        out.appendChild(box);
        return;
      }
      if (!area.value.trim()) {
        box.textContent = "Сначала запусти запрос у себя и вставь результат.";
        out.appendChild(box);
        return;
      }
      var result = compare(parsePasted(area.value, parsed.expect.columns), parsed.expect);
      if (result.ok) {
        box.className += " sql-check--ok";
        box.appendChild(el("strong", null, "Проверка пройдена"));
        out.appendChild(box);
        markDone(task);
        setDone();
        window.dispatchEvent(new CustomEvent("learning:check", { detail: { type: "mssql", ok: true, root: root } }));
        return;
      }
      var attempts = Number(root.dataset.attempts || 0) + 1;
      root.dataset.attempts = String(attempts);
      hintBtn.disabled = attempts < MIN_ATTEMPTS_FOR_HINT;
      hintBtn.title = hintBtn.disabled ? "Подсказка откроется после 2 попыток" : "Показать подсказку";
      box.className += " sql-check--bad";
      box.appendChild(el("strong", null, "Результат не совпал"));
      box.appendChild(el("div", null, "Строк: " + result.got + " вставлено, " + result.want + " ожидалось."));
      if (attempts < MAX_ATTEMPTS_BEFORE_ANSWER) {
        box.appendChild(el("div", "sql-check-detail",
          "Попытка " + attempts + " из 3. Ожидаемый результат откроется после третьей. Проверь базу: сверху вкладки должно быть Front, а не master."));
      } else {
        box.appendChild(expectedTable(parsed.expect));
      }
      out.appendChild(box);
    });

    container.parentNode.replaceChild(root, container);
  }

  function scan() {
    document.querySelectorAll(".mssqllocal").forEach(function (node, i) {
      buildWidget(node, i);
    });
  }

  function boot() {
    scan();
    if (window.document$ && window.document$.subscribe) window.document$.subscribe(scan);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
