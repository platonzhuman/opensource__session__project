/* ==========================================================================
   SQL-песочница для курса Learning
   - PGlite (PostgreSQL в WASM) + CodeMirror 5
   - Блок в markdown: ```sqlplay ... ``` (custom fence)
   - Директива первой строкой: -- @seed base | artillery
   ========================================================================== */
(function () {
  "use strict";

  var SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "";
  var BASE = SCRIPT_SRC ? SCRIPT_SRC.replace(/[^/]*$/, "") : "/javascripts/";

  var SEEDS = {
    base: BASE + "seeds/base.sql",
    artillery: BASE + "seeds/artillery.sql",
    artillery_my: BASE + "seeds/artillery_my.sql",
    artillery_hw6: BASE + "seeds/artillery_hw6.sql",
    meteo_final: BASE + "seeds/meteo_final.sql",
    meteo_fixed: BASE + "seeds/meteo_fixed.sql",
    meteo_pre_ref: BASE + "seeds/meteo_pre_ref.sql",
    front_slice: BASE + "seeds/front_slice.sql",
    olap_slice: BASE + "seeds/olap_slice.sql",
  };
  var DEFAULT_SEED = "artillery";

  var seedCache = {};
  var db = null;
  var dbReady = null;
  var currentSeed = null;

  /* ---------- utils ---------- */

  function loadSeed(name) {
    if (seedCache[name]) return Promise.resolve(seedCache[name]);
    var url = SEEDS[name] || SEEDS[DEFAULT_SEED];
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("Не найден сид: " + url);
        return r.text();
      })
      .then(function (txt) {
        seedCache[name] = txt;
        return txt;
      });
  }

  function parseDirectives(sql) {
    var lines = String(sql).replace(/\s+$/, "").split("\n");
    var seed = DEFAULT_SEED;
    var mode = "run";
    var expect = null;
    var hint = "";
    var id = "";
    var kept = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var m = line.match(/^\s*--\s*@seed\s+([A-Za-z0-9_-]+)/);
      if (m) { seed = m[1]; continue; }
      m = line.match(/^\s*--\s*@mode\s+(fix|write|run)\b/i);
      if (m) { mode = m[1].toLowerCase(); continue; }
      m = line.match(/^\s*--\s*@expect\s+(.+)$/);
      if (m) {
        try { expect = JSON.parse(m[1]); }
        catch (e) { expect = { error: "Не удалось разобрать @expect: " + e.message }; }
        continue;
      }
      m = line.match(/^\s*--\s*@hint\s+(.+)$/);
      if (m) { hint = m[1]; continue; }
      m = line.match(/^\s*--\s*@id\s+(\S+)/);
      if (m) { id = m[1]; continue; }
      kept.push(line);
    }
    return {
      seed: seed,
      mode: mode,
      expect: expect,
      hint: hint,
      id: id,
      sql: kept.join("\n").replace(/^\s+/, "").replace(/\s+$/, "")
    };
  }

  /* ---------- tutor bridge (local) ---------- */

  function tutorConfig() {
    var cfg = window.LEARNING_TUTOR || {};
    return {
      url: String(cfg.url || "http://127.0.0.1:8765").replace(/\/$/, "")
    };
  }

  function missionContext(fromEl) {
    var mission = (fromEl && fromEl.closest && fromEl.closest(".mission")) ||
      document.querySelector(".mission");
    var step = fromEl && fromEl.closest && fromEl.closest(".mission-step");
    return {
      missionId: (mission && mission.getAttribute("data-mission")) || "",
      homework: (mission && mission.getAttribute("data-homework")) || "",
      pieceStep: (step && step.getAttribute("data-step")) || "",
      pieceKind: (step && step.getAttribute("data-kind")) || ""
    };
  }

  function stuckKey(missionId) {
    return "learning:tutor:stuck:" + missionId;
  }

  function readStuck(missionId) {
    try {
      return JSON.parse(localStorage.getItem(stuckKey(missionId)) || "null") || null;
    } catch (e) {
      return null;
    }
  }

  function markStuck(missionId, taskId, pieceStep, ok) {
    if (!missionId || !taskId) return null;
    var cur = readStuck(missionId) || { task_id: taskId, piece_step: pieceStep, fails: 0 };
    if (ok) {
      if (cur.task_id === taskId) {
        cur.fails = 0;
        cur.cleared_at = Date.now();
      }
    } else if (cur.task_id === taskId) {
      cur.fails = Number(cur.fails || 0) + 1;
      cur.piece_step = pieceStep || cur.piece_step;
      cur.updated_at = Date.now();
    } else {
      cur = { task_id: taskId, piece_step: pieceStep, fails: 1, updated_at: Date.now() };
    }
    try { localStorage.setItem(stuckKey(missionId), JSON.stringify(cur)); } catch (e) {}
    return cur;
  }

  function setLastCheck(rootEl, check) {
    if (!rootEl) return;
    rootEl._lastCheck = check;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function fmt(v) {
    if (v === null || v === undefined) return { text: "NULL", cls: "sql-null" };
    if (v instanceof Date) {
      return {
        text:
          v.getFullYear() +
          "-" +
          pad(v.getMonth() + 1) +
          "-" +
          pad(v.getDate()) +
          " " +
          pad(v.getHours()) +
          ":" +
          pad(v.getMinutes()) +
          ":" +
          pad(v.getSeconds()),
        cls: "",
      };
    }
    if (typeof v === "object") return { text: JSON.stringify(v), cls: "" };
    return { text: String(v), cls: "" };
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ---------- database ---------- */

  function initDb() {
    if (dbReady) return dbReady;
    dbReady = import(BASE + "vendor/pglite/index.js").then(function (mod) {
      var PGlite = mod.PGlite || (mod.default && mod.default.PGlite) || mod.default;
      db = new PGlite();
      return db.waitReady.then(function () {
        return db.exec("set time zone 'UTC';");
      });
    });
    return dbReady;
  }

  function resetTo(seed) {
    return initDb().then(function () {
      return db.exec(
        "drop schema if exists public cascade; create schema public; set time zone 'UTC';"
      );
    }).then(function () {
      return loadSeed(seed);
    }).then(function (sql) {
      return db.exec(sql);
    }).then(function () {
      // Дамп в начале сида глушит raise notice через client_min_messages.
      return db.exec("set client_min_messages = notice;");
    }).then(function () {
      currentSeed = seed;
    });
  }

  // `commit` внутри `do $$` работает, только если блок пришёл отдельной командой.
  function splitStatements(sql) {
    var parts = [];
    var start = 0;
    var i = 0;
    var n = sql.length;
    while (i < n) {
      var ch = sql[i];
      var next = sql[i + 1];
      if (ch === "-" && next === "-") {
        var eol = sql.indexOf("\n", i);
        i = eol === -1 ? n : eol + 1;
      } else if (ch === "/" && next === "*") {
        var endComment = sql.indexOf("*/", i + 2);
        i = endComment === -1 ? n : endComment + 2;
      } else if (ch === "'" || ch === '"') {
        var close = i + 1;
        while (close < n && !(sql[close] === ch && sql[close + 1] !== ch)) {
          close += sql[close] === ch ? 2 : 1;
        }
        i = close + 1;
      } else if (ch === "$") {
        var tag = sql.slice(i).match(/^\$[A-Za-z_]*\$/);
        if (tag) {
          var endTag = sql.indexOf(tag[0], i + tag[0].length);
          i = endTag === -1 ? n : endTag + tag[0].length;
        } else {
          i++;
        }
      } else if (ch === ";") {
        parts.push(sql.slice(start, i + 1));
        start = i + 1;
        i++;
      } else {
        i++;
      }
    }
    parts.push(sql.slice(start));
    return parts.filter(function (part) {
      return part.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;/g, "").trim();
    });
  }

  function runSql(sql, seed) {
    // Всегда сбрасываем к сиду — блоки независимы и воспроизводимы.
    var results = [];
    var notices = [];
    var options = { onNotice: function (notice) { notices.push(notice.message); } };
    return resetTo(seed).then(function () {
      return splitStatements(sql).reduce(function (chain, statement) {
        return chain.then(function () {
          return db.exec(statement, options).then(function (res) {
            results.push.apply(results, res);
          });
        });
      }, Promise.resolve());
    }).then(function () {
      results.notices = notices;
      return results;
    }, function (err) {
      err.notices = notices;
      throw err;
    });
  }

  /* ---------- rendering ---------- */

  function renderNotices(host, notices) {
    if (!notices || !notices.length) return;
    var box = el("div", "sql-notices");
    box.setAttribute("aria-live", "polite");
    box.appendChild(el("div", "sql-notices-title", "Сообщения (raise notice)"));
    notices.forEach(function (message) {
      box.appendChild(el("div", "sql-notice", message));
    });
    host.appendChild(box);
  }

  function renderResults(host, results) {
    host.innerHTML = "";
    renderNotices(host, results.notices);
    var rendered = 0;
    results.forEach(function (res) {
      if (res && res.fields && res.fields.length) {
        rendered++;
        host.appendChild(renderTable(res));
      }
    });
    if (!rendered) {
      var affected = results.reduce(function (acc, r) {
        return acc + (r && typeof r.affectedRows === "number" ? r.affectedRows : 0);
      }, 0);
      var ok = el("div", "sql-ok", "Готово. Затронуто строк: " + affected);
      host.appendChild(ok);
    }
  }

  function renderTable(res) {
    var wrap = el("div", "sql-table-wrap");
    var table = el("table", "sql-table");
    var thead = el("thead");
    var trh = el("tr");
    res.fields.forEach(function (f) {
      trh.appendChild(el("th", null, f.name));
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    var tbody = el("tbody");
    res.rows.forEach(function (row) {
      var tr = el("tr");
      res.fields.forEach(function (f) {
        var td = el("td");
        var v = fmt(row[f.name]);
        if (v.cls) td.className = v.cls;
        td.textContent = v.text;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    var info = el("div", "sql-rowinfo", "Строк: " + res.rows.length);
    wrap.appendChild(info);
    return wrap;
  }

  function renderError(host, err) {
    host.innerHTML = "";
    renderNotices(host, err && err.notices);
    var box = el("div", "sql-error");
    box.appendChild(el("strong", null, "Ошибка: "));
    box.appendChild(document.createTextNode(err && err.message ? err.message : String(err)));
    host.appendChild(box);
  }

  function renderSchema(host) {
    var q =
      "select table_name, column_name, data_type " +
      "from information_schema.columns " +
      "where table_schema = 'public' " +
      "order by table_name, ordinal_position;";
    db.query(q).then(function (res) {
      host.innerHTML = "";
      var byTable = {};
      res.rows.forEach(function (r) {
        (byTable[r.table_name] = byTable[r.table_name] || []).push(r);
      });
      var names = Object.keys(byTable).sort();
      if (!names.length) {
        host.appendChild(el("div", "sql-rowinfo", "В базе нет таблиц."));
        return;
      }
      names.forEach(function (t) {
        var card = el("div", "sql-schema-table");
        card.appendChild(el("div", "sql-schema-name", t));
        var ul = el("ul");
        byTable[t].forEach(function (c) {
          ul.appendChild(el("li", null, c.column_name + " — " + c.data_type));
        });
        card.appendChild(ul);
        host.appendChild(card);
      });
    }).catch(function (e) {
      renderError(host, e);
    });
  }

  /* ---------- widget ---------- */

  function resolveContainer(node) {
    if (node.closest) {
      var hl = node.closest("div.highlight");
      if (hl) return hl;
    }
    if (node.tagName === "PRE") return node;
    var pre = node.closest && node.closest("pre");
    if (pre) return pre;
    return node;
  }

  function sourceText(node) {
    var code = node.tagName === "CODE" ? node : node.querySelector && node.querySelector("code");
    return (code || node).textContent || "";
  }

  function normCell(v) {
    if (v === null || v === undefined) return null;
    if (typeof v === "number") return Number(v.toFixed(6));
    return String(v).trim();
  }

  function rowKey(row) {
    return JSON.stringify(row.map(normCell));
  }

  function lastTable(results) {
    for (var i = results.length - 1; i >= 0; i--) {
      if (results[i] && results[i].fields && results[i].fields.length) return results[i];
    }
    return null;
  }

  function expectedTable(expect) {
    var wrap = el("div", "sql-expected");
    wrap.appendChild(el("div", "sql-expected-title", "Ожидаемый результат"));
    var table = el("table", "sql-table");
    var thead = el("thead");
    var trh = el("tr");
    (expect.columns || []).forEach(function (c) { trh.appendChild(el("th", null, c)); });
    thead.appendChild(trh);
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

  function bumpAttempt(rootEl) {
    var attempts = Number(rootEl && rootEl.dataset.attempts || 0) + 1;
    if (rootEl) rootEl.dataset.attempts = String(attempts);
    var hintBtn = rootEl && rootEl.querySelector(".sql-btn--hint");
    if (hintBtn) {
      hintBtn.disabled = attempts < 2;
      hintBtn.title = attempts < 2
        ? "Подсказка откроется после 2 попыток"
        : "Показать подсказку";
    }
    return attempts;
  }

  function renderCheck(out, results, expect) {
    var table = lastTable(results);
    var box = el("div", "sql-check");
    var rootEl = out.closest ? out.closest(".sql-playground") : null;
    if (!table) {
      var failed = bumpAttempt(rootEl);
      box.className += " sql-check--bad";
      box.appendChild(el("strong", null, "Нет результата для проверки"));
      box.appendChild(el("div", null, "Запрос должен вернуть таблицу."));
      if (failed < 3) {
        box.appendChild(el("div", "sql-check-detail",
          "Попытка " + failed + " из 3. Ожидаемый результат откроется после третьей."));
      } else {
        box.appendChild(expectedTable(expect));
      }
      setLastCheck(rootEl, {
        ok: false,
        summary: "нет таблицы для проверки",
        detail: "Запрос должен вернуть таблицу."
      });
      out.appendChild(box);
      return false;
    }

    var gotCols = table.fields.map(function (f) { return String(f.name).trim().toLowerCase(); });
    var wantCols = (expect.columns || []).map(function (c) { return String(c).trim().toLowerCase(); });
    var colsOk = !wantCols.length || JSON.stringify(gotCols) === JSON.stringify(wantCols);

    var gotRows = table.rows.map(function (r) {
      return table.fields.map(function (f) { return normCell(r[f.name]); });
    });
    var wantRows = (expect.rows || []).map(function (r) { return r.map(normCell); });
    if (!expect.ordered) {
      gotRows = gotRows.slice().sort(function (a, b) { return rowKey(a).localeCompare(rowKey(b)); });
      wantRows = wantRows.slice().sort(function (a, b) { return rowKey(a).localeCompare(rowKey(b)); });
    }
    var rowsOk = JSON.stringify(gotRows) === JSON.stringify(wantRows);
    var ok = colsOk && rowsOk;

    box.className += ok ? " sql-check--ok" : " sql-check--bad";
    if (ok) {
      markDone(Number(out.closest(".sql-playground").dataset.sqlIndex || 0));
      rootEl = out.closest(".sql-playground");
      if (rootEl) {
        rootEl.classList.add("sql-done");
        if (!rootEl.querySelector(".sql-done-badge")) {
          var barEl = rootEl.querySelector(".sql-bar");
          if (barEl) barEl.appendChild(el("span", "sql-done-badge", "пройдено"));
        }
        window.dispatchEvent(new CustomEvent("learning:check", {
          detail: { type: "sql", ok: true, root: rootEl }
        }));
      }
    }
    box.appendChild(el("strong", null, ok ? "Проверка пройдена" : "Результат не совпал"));
    var detailParts = [];
    if (!ok) {
      var attempt = bumpAttempt(rootEl);
      var summaryLine =
        "Колонки: " + (colsOk ? "ок" : "не совпали") +
        ". Строки: " + gotRows.length + " получено, " + wantRows.length + " ожидалось.";
      box.appendChild(el("div", null, summaryLine));
      detailParts.push(summaryLine);
      if (!colsOk) {
        var colLine = "Ожидались: " + wantCols.join(", ") + ". Получены: " + gotCols.join(", ") + ".";
        box.appendChild(el("div", "sql-check-detail", colLine));
        detailParts.push(colLine);
      }
      if (attempt < 3) {
        box.appendChild(el("div", "sql-check-detail",
          "Попытка " + attempt + " из 3. Ожидаемый результат откроется после третьей."));
      } else {
        box.appendChild(expectedTable(expect));
      }
    }
    setLastCheck(rootEl, {
      ok: ok,
      summary: ok ? "проверка пройдена" : "результат не совпал",
      detail: detailParts.join(" ")
    });
    out.appendChild(box);
    return ok;
  }

  function checkKey(index) {
    return "sqlcheck:" + location.pathname + ":" + index;
  }

  function wasDone(index) {
    try { return localStorage.getItem(checkKey(index)) === "1"; } catch (e) { return false; }
  }

  function markDone(index) {
    try { localStorage.setItem(checkKey(index), "1"); } catch (e) {}
  }

  function appendTutorMessage(logEl, role, text, whoLabel, extraClass) {
    var cls = "sql-tutor-msg sql-tutor-msg--" + role;
    if (extraClass) cls += " " + extraClass;
    var msg = el("div", cls);
    var who = el(
      "div",
      "sql-tutor-who",
      whoLabel || (role === "you" ? "Ты" : "Репетитор")
    );
    var body = el("div", "sql-tutor-body");
    body.textContent = text;
    msg.appendChild(who);
    msg.appendChild(body);
    logEl.appendChild(msg);
    logEl.scrollTop = logEl.scrollHeight;
    return msg;
  }

  function buildCursorChatPrompt(payload) {
    var hw = payload.homework || "Итоговый расчёт";
    var check = payload.check || {};
    var okLabel = check.ok ? "ok" : "fail";
    var summary = check.summary ? String(check.summary) : "";
    var detail = check.detail ? String(check.detail) : "";
    var lines = [
      "Вставь это сообщение в чат Cursor Auto (агент в IDE).",
      "",
      "Контекст: ДЗ «Итоговый расчёт» — помоги только с одной задачей ниже.",
      "Не давай готовое решение всего homework / PR целиком. Только этот @id.",
      "",
      "Миссия: " + (payload.mission_id || "sql-itogovyy-raschet"),
      "Домашка: " + hw,
      "Задача: @" + payload.task_id,
      "Сид песочницы: " + payload.seed,
      "Ступень куска: " + (payload.piece_step || "—") +
        (payload.piece_kind ? " (" + payload.piece_kind + ")" : ""),
      "Неудачных попыток по @id (localStorage): " +
        String(payload.tutor_fails != null ? payload.tutor_fails : 0),
      "",
      "Мой SQL:",
      "```sql",
      String(payload.student_sql || "").trim() || "-- (пусто)",
      "```",
      "",
      "Проверка @expect: " + okLabel +
        (summary ? " · " + summary : ""),
    ];
    if (detail) {
      lines.push("Детали проверки: " + detail);
    }
    lines.push(
      "",
      "Пожалуйста: короткий намёк или где ошибка в моём SQL по этой задаче.",
      "Граница жёсткая: только @" + payload.task_id +
        ", без полного решения «Итоговый расчёт»."
    );
    return lines.join("\n");
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return copyTextFallback(text);
      });
    }
    return Promise.resolve(copyTextFallback(text));
  }

  function copyTextFallback(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch (e) {
      return false;
    }
  }

  function probeTutorBridge() {
    var url = tutorConfig().url;
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = null;
    if (ctrl) {
      timer = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 900);
    }
    return fetch(url + "/health", {
      method: "GET",
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) {
        if (timer) clearTimeout(timer);
        return r.ok;
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        return false;
      });
  }

  function buildWidget(node) {
    if (node.dataset.sqlReady === "1") return;
    node.dataset.sqlReady = "1";

    var parsed = parseDirectives(sourceText(node));
    var container = resolveContainer(node);
    var mission = node.closest && node.closest(".mission");
    var tutorOff = !!mission && mission.getAttribute("data-tutor") === "off";
    var tutorEnabled = !tutorOff && !!parsed.id && (parsed.mode === "write" || parsed.mode === "fix");

    var root = el("div", "sql-playground");
    root.dataset.seed = parsed.seed;
    if (parsed.id) root.dataset.taskId = parsed.id;
    root.dataset.mode = parsed.mode;
    var widgetIndex = Number(node.dataset.sqlIndex || 0);
    root.dataset.sqlIndex = String(widgetIndex);
    if (wasDone(widgetIndex)) root.classList.add("sql-done");

    var bar = el("div", "sql-bar");
    var labelText = parsed.mode === "fix" ? "SQL · почини код"
      : parsed.mode === "write" ? "SQL · напиши запрос" : "SQL-песочница";
    var label = el("span", "sql-label", labelText);
    bar.appendChild(label);
    var seedBadge = el("span", "sql-seed", "данные: " + parsed.seed);
    bar.appendChild(seedBadge);
    if (parsed.id) {
      bar.appendChild(el("span", "sql-task-id", "@" + parsed.id));
    }
    if (wasDone(widgetIndex)) {
      bar.appendChild(el("span", "sql-done-badge", "пройдено"));
    }

    var actions = el("span", "sql-actions");
    var runBtn = el("button", "sql-btn sql-btn--run", "▶ Запустить");
    runBtn.type = "button";
    var askBtn = null;
    var chatBtn = null;
    if (tutorEnabled) {
      askBtn = el("button", "sql-btn sql-btn--ask", "Спросить");
      askBtn.type = "button";
      askBtn.title = "Скопировать запрос в буфер → вставь в чат Cursor Auto";
      chatBtn = el("button", "sql-btn sql-btn--chat", "В чат");
      chatBtn.type = "button";
      chatBtn.title = "Снова скопировать текст для чата Cursor (без моста)";
    }
    var resetBtn = el("button", "sql-btn", "Сбросить БД");
    resetBtn.type = "button";
    var schemaBtn = el("button", "sql-btn", "Схема");
    schemaBtn.type = "button";
    actions.appendChild(runBtn);
    if (askBtn) actions.appendChild(askBtn);
    if (chatBtn) actions.appendChild(chatBtn);
    actions.appendChild(resetBtn);
    actions.appendChild(schemaBtn);
    bar.appendChild(actions);
    root.appendChild(bar);

    if (tutorEnabled) {
      var banner = el(
        "div",
        "sql-tutor-banner",
        "Спросить → текст в буфер → вставь в чат Cursor. Только это ДЗ, без готового решения целиком."
      );
      banner.setAttribute("role", "note");
      root.appendChild(banner);
    }

    var editorHost = el("div", "sql-editor");
    root.appendChild(editorHost);
    var out = el("div", "sql-out");
    root.appendChild(out);
    var hint = el("div", "sql-hint", "Ctrl+Enter — выполнить");
    root.appendChild(hint);

    var tutorPanel = null;
    var tutorLog = null;
    var tutorStatus = null;
    if (tutorEnabled) {
      tutorPanel = el("div", "sql-tutor");
      tutorPanel.appendChild(el("div", "sql-tutor-title", "Диалог с репетитором"));
      tutorStatus = el("div", "sql-tutor-status");
      tutorStatus.setAttribute("aria-live", "polite");
      tutorLog = el("div", "sql-tutor-log");
      tutorLog.setAttribute("aria-live", "polite");
      tutorPanel.appendChild(tutorStatus);
      tutorPanel.appendChild(tutorLog);
      root.appendChild(tutorPanel);
    }

    var hintBox = null;
    if (parsed.hint) {
      var hintBtn = el("button", "sql-btn sql-btn--hint", "Подсказка");
      hintBtn.type = "button";
      hintBtn.disabled = true;
      hintBtn.title = "Подсказка откроется после 2 попыток";
      hintBtn.addEventListener("click", function () {
        if (!hintBox) {
          hintBox = el("div", "sql-hintbox", parsed.hint);
          root.appendChild(hintBox);
        } else {
          hintBox.hidden = !hintBox.hidden;
        }
      });
      actions.appendChild(hintBtn);
    }
    if (parsed.expect && parsed.expect.error) {
      out.appendChild(el("div", "sql-error", parsed.expect.error));
    }

    container.parentNode.replaceChild(root, container);

    var cm = null;
    if (window.CodeMirror) {
      cm = window.CodeMirror(editorHost, {
        value: parsed.sql,
        mode: "text/x-sql",
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        indentUnit: 4,
        lineWrapping: true,
        viewportMargin: Infinity,
      });
      cm.setSize("100%", null);
      cm.on("keydown", function (inst, e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          doRun();
        }
      });
    } else {
      var ta = el("textarea", "sql-textarea");
      ta.value = parsed.sql;
      ta.rows = Math.min(20, parsed.sql.split("\n").length + 1);
      editorHost.appendChild(ta);
      cm = {
        getValue: function () { return ta.value; },
        setValue: function (v) { ta.value = v; },
      };
    }

    root._cm = cm;

    function busy(on) {
      runBtn.disabled = on;
      resetBtn.disabled = on;
      schemaBtn.disabled = on;
      if (askBtn) askBtn.disabled = on;
      if (chatBtn) chatBtn.disabled = on;
      root.classList.toggle("sql-busy", on);
    }

    function buildAskPayload() {
      var ctx = missionContext(root);
      var sql = cm.getValue();
      var check = root._lastCheck || {
        ok: false,
        summary: "ещё не запускал проверку",
        detail: "Сначала нажми «Запустить»."
      };
      var stuck = rememberProgress(!!check.ok) || readStuck(ctx.missionId) || {
        task_id: parsed.id,
        piece_step: ctx.pieceStep,
        fails: Number(root.dataset.attempts || 0)
      };
      return {
        mission_id: ctx.missionId,
        homework: ctx.homework,
        task_id: parsed.id,
        seed: parsed.seed,
        student_sql: sql,
        check: check,
        piece_step: ctx.pieceStep,
        piece_kind: ctx.pieceKind,
        tutor_fails: Number(stuck.fails || 0),
        stuck: stuck,
        page_path: location.pathname
      };
    }

    function showClipboardPath(promptText, copied) {
      if (copied) {
        tutorStatus.textContent = "Скопировано — вставь в чат Cursor";
      } else {
        tutorStatus.textContent =
          "Буфер недоступен — скопируй текст ниже вручную и вставь в чат Cursor";
      }
      appendTutorMessage(
        tutorLog,
        "tutor",
        promptText,
        "Текст для чата",
        "sql-tutor-msg--prompt"
      );
    }

    function tryBridgeAsk(payload) {
      return probeTutorBridge().then(function (alive) {
        if (!alive) return null;
        tutorStatus.textContent =
          "Скопировано — вставь в чат Cursor. Мост отвечает…";
        return fetch(tutorConfig().url + "/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then(function (r) {
          return r.json().then(function (data) {
            return { okHttp: r.ok, data: data };
          });
        }).then(function (res) {
          if (!res.okHttp || !res.data || !res.data.reply) return null;
          var modeNote = res.data.mode ? " · " + res.data.mode : "";
          tutorStatus.textContent =
            "Скопировано — вставь в чат Cursor. Плюс ответ моста" + modeNote + ".";
          appendTutorMessage(tutorLog, "tutor", res.data.reply);
          return true;
        }).catch(function () {
          return null;
        });
      });
    }

    function doClipboardAsk(opts) {
      opts = opts || {};
      if (!askBtn || !tutorLog || !tutorStatus) return;
      var ctx = missionContext(root);
      if (!ctx.missionId) {
        tutorStatus.textContent =
          "Нет data-mission на странице — не к чему привязать подсказку.";
        return;
      }
      var payload = buildAskPayload();
      var promptText = buildCursorChatPrompt(payload);
      var check = payload.check;

      appendTutorMessage(
        tutorLog,
        "you",
        "Задача @" + parsed.id + " · " + (check.ok ? "ok" : "fail") +
          (check.summary ? " · " + check.summary : "")
      );

      askBtn.disabled = true;
      if (chatBtn) chatBtn.disabled = true;
      root.classList.add("sql-busy");
      tutorStatus.textContent = "Готовлю текст для чата Cursor…";

      copyTextToClipboard(promptText)
        .then(function (copied) {
          showClipboardPath(promptText, copied);
          if (opts.tryBridge) {
            return tryBridgeAsk(payload).then(function (bridged) {
              if (!bridged && copied) {
                tutorStatus.textContent =
                  "Скопировано — вставь в чат Cursor (мост не нужен)";
              } else if (!bridged && !copied) {
                tutorStatus.textContent =
                  "Скопируй текст ниже → вставь в чат Cursor (мост не нужен)";
              }
            });
          }
        })
        .then(function () {
          askBtn.disabled = false;
          if (chatBtn) chatBtn.disabled = false;
          root.classList.remove("sql-busy");
        });
    }

    function rememberProgress(checkOk) {
      var ctx = missionContext(root);
      return markStuck(ctx.missionId, parsed.id, ctx.pieceStep, !!checkOk);
    }

    function doRun() {
      var sql = cm.getValue();
      var meaningful = sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
      out.innerHTML = "";
      if (!meaningful) {
        out.appendChild(
          el("div", "sql-rowinfo", "Напиши запрос в редакторе и нажми «Запустить».")
        );
        return;
      }
      busy(true);
      var loading = el("div", "sql-loading", "Выполняю…");
      out.appendChild(loading);
      initDb()
        .then(function () { return runSql(sql, parsed.seed); })
        .then(function (results) {
          renderResults(out, results);
          if (parsed.expect && !parsed.expect.error) {
            var ok = renderCheck(out, results, parsed.expect);
            if (tutorEnabled) rememberProgress(ok);
          } else if (tutorEnabled) {
            setLastCheck(root, {
              ok: true,
              summary: "запрос выполнен (нет @expect)",
              detail: ""
            });
          }
        })
        .catch(function (err) {
          renderError(out, err);
          setLastCheck(root, {
            ok: false,
            summary: "ошибка выполнения",
            detail: err && err.message ? String(err.message).slice(0, 500) : String(err)
          });
          if (tutorEnabled) rememberProgress(false);
        })
        .then(function () { busy(false); });
    }

    function doAsk() {
      doClipboardAsk({ tryBridge: true });
    }

    function doChatCopy() {
      doClipboardAsk({ tryBridge: false });
    }

    runBtn.addEventListener("click", doRun);
    if (askBtn) askBtn.addEventListener("click", doAsk);
    if (chatBtn) chatBtn.addEventListener("click", doChatCopy);

    resetBtn.addEventListener("click", function () {
      busy(true);
      out.innerHTML = "";
      resetTo(parsed.seed)
        .then(function () {
          out.appendChild(el("div", "sql-ok", "База сброшена к сиду «" + parsed.seed + "»."));
        })
        .catch(function (err) { renderError(out, err); })
        .then(function () { busy(false); });
    });

    schemaBtn.addEventListener("click", function () {
      busy(true);
      out.innerHTML = "";
      initDb()
        .then(function () { return resetTo(parsed.seed); })
        .then(function () { renderSchema(out); })
        .catch(function (err) { renderError(out, err); })
        .then(function () { busy(false); });
    });
  }

  /* ---------- boot ---------- */

  function scan() {
    var nodes = document.querySelectorAll(".sqlplay");
    var found = false;
    nodes.forEach(function (n, i) {
      n.dataset.sqlIndex = String(i);
      buildWidget(n);
      found = true;
    });
    if (found && !dbReady) {
      // Прогреваем PGlite заранее, чтобы первый запуск был быстрым.
      initDb().catch(function () {});
    }
  }

  function boot() {
    scan();
    if (window.document$ && window.document$.subscribe) {
      window.document$.subscribe(scan);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
