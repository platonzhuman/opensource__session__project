/* ==========================================================================
   Песочницы кода для плана ИГУ
   - Python: Pyodide (WebAssembly) с CDN
   - C++: компиляция через Wandbox API
   - JavaScript: выполнение в изолированном iframe
   - виджет: .igu-pg[data-lang="python|cpp|js"]
   ========================================================================== */
(function () {
  "use strict";

  var PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/";
  var WANDBOX_URL = "https://wandbox.org/api/compile.json";

  var pyodidePromise = null;
  var JS_RUNS = {};

  var STARTER = {
    python:
      "# Песочница Python. Ctrl+Enter — выполнить.\n" +
      "for i in range(1, 6):\n" +
      "    print(i, i * i)\n",
    cpp:
      "#include <iostream>\n" +
      "using namespace std;\n\n" +
      "int main() {\n" +
      "    for (int i = 1; i <= 5; i++) {\n" +
      '        cout << i << " " << i * i << "\\n";\n' +
      "    }\n" +
      "    return 0;\n" +
      "}\n",
    js:
      "// Песочница JavaScript. Ctrl+Enter — выполнить.\n" +
      "for (let i = 1; i <= 5; i++) {\n" +
      "  console.log(i, i * i);\n" +
      "}\n",
  };

  window.addEventListener("message", function (e) {
    var d = e.data;
    if (d && d.__jsplay && JS_RUNS[d.id]) {
      var run = JS_RUNS[d.id];
      run.buf += d.text + "\n";
      setOut(run.out, run.buf, /^Ошибка:/.test(d.text));
    }
  });


  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Не удалось загрузить " + src)); };
      document.head.appendChild(s);
    });
  }

  function ensurePyodide() {
    if (pyodidePromise) return pyodidePromise;
    pyodidePromise = loadScript(PYODIDE_URL + "pyodide.js").then(function () {
      return window.loadPyodide({ indexURL: PYODIDE_URL });
    });
    return pyodidePromise;
  }

  function setOut(out, text, isError) {
    out.textContent = text || "(нет вывода)";
    out.classList.toggle("is-error", !!isError);
  }

  function runPython(code, out, setStatus, stdinText) {
    setStatus("Загружаю Python…");
    return ensurePyodide().then(function (py) {
      setStatus("");
      var buf = "";
      py.setStdout({ batched: function (s) { buf += s + "\n"; } });
      py.setStderr({ batched: function (s) { buf += s + "\n"; } });
      var lines = String(stdinText == null ? "" : stdinText).split("\n");
      py.setStdin({ stdin: function () { return lines.length ? lines.shift() + "\n" : ""; } });
      var loadPkgs = py.loadPackagesFromImports
        ? py.loadPackagesFromImports(code).catch(function () {})
        : Promise.resolve();
      return loadPkgs.then(function () {
        return py.runPythonAsync(code);
      }).then(function () {
        setOut(out, buf, false);
        checkOutput(out, buf);
      }).catch(function (err) {
        var msg = (err && err.message) ? err.message : String(err);
        if (/EOFError|input/i.test(msg)) {
          msg += "\n\nПодсказка: впиши данные в поле «Данные для input()» над кодом — по одному значению на строку.";
        }
        setOut(out, (buf ? buf + "\n" : "") + msg, true);
      });
    }).catch(function (err) {
      setOut(out, (err && err.message) ? err.message : String(err), true);
    });
  }

  function runCpp(code, out, setStatus) {
    setStatus("Компилирую C++…");
    return fetch(WANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code, compiler: "gcc-head", options: "warning,gnu++17" }),
    }).then(function (r) {
      if (!r.ok) throw new Error("Сервис компиляции ответил " + r.status);
      return r.json();
    }).then(function (data) {
      setStatus("");
      var text = "";
      if (data.compiler_error) text += data.compiler_error;
      if (data.program_output) text += data.program_output;
      if (data.program_error) text += data.program_error;
      setOut(out, text, !!(data.compiler_error || data.program_error));
      checkOutput(out, text);
    }).catch(function (err) {
      setOut(out, "Не удалось скомпилировать: " + ((err && err.message) ? err.message : String(err)), true);
    });
  }

  function runJs(code, out, setStatus) {
    setStatus("");
    var id = "js" + Math.random().toString(36).slice(2);
    JS_RUNS[id] = { out: out, buf: "" };
    var safe = String(code).replace(/<\/script/gi, "<\\/script");
    var html = "<!doctype html><meta charset='utf-8'><script>(function(){" +
      "function send(t){parent.postMessage({__jsplay:1,id:'" + id + "',text:String(t)},'*');}" +
      "function fmt(x){try{if(x&&typeof x==='object')return JSON.stringify(x);}catch(e){}return String(x);}" +
      "console.log=function(){send([].slice.call(arguments).map(fmt).join(' '));};" +
      "console.error=console.log;console.warn=console.log;console.info=console.log;" +
      "window.onerror=function(m){send('Ошибка: '+m);return true;};" +
      "try{\n" + safe + "\n}catch(e){send('Ошибка: '+(e&&e.message?e.message:e));}" +
      "})();<\/script>";
    var iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.cssText = "display:none";
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
    setTimeout(function () {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      checkOutput(out, JS_RUNS[id] ? JS_RUNS[id].buf : "");
      delete JS_RUNS[id];
    }, 300);
  }

  function parseMeta(code) {
    var lines = String(code).split("\n");
    var kept = [];
    var meta = { mode: "run", expect: null, hint: "" };
    for (var i = 0; i < lines.length; i++) {
      var m = lines[i].match(/^\s*(?:#|\/\/)\s*@(mode|expect|hint)\s*(.*)$/);
      if (!m) { kept.push(lines[i]); continue; }
      var key = m[1], val = m[2].trim();
      if (key === "mode") meta.mode = /^(fix|write|run)$/i.test(val) ? val.toLowerCase() : "run";
      else if (key === "hint") meta.hint = val;
      else if (key === "expect") {
        if (val.charAt(0) === "{") {
          try { meta.expect = JSON.parse(val); } catch (e) { meta.expect = { error: e.message }; }
        } else {
          meta.expect = { equals: val };
        }
      }
    }
    meta.code = kept.join("\n").replace(/^\s+/, "").replace(/\s+$/, "");
    return meta;
  }

  function normOut(s) {
    return String(s == null ? "" : s).replace(/\r/g, "").split("\n")
      .map(function (l) { return l.replace(/\s+$/, ""); })
      .filter(function (l) { return l.length > 0; })
      .join("\n").trim();
  }

  function checkKey(index) {
    return "igucheck:" + location.pathname + ":" + index;
  }

  function wasDone(index) {
    try { return localStorage.getItem(checkKey(index)) === "1"; } catch (e) { return false; }
  }

  function markDone(index) {
    try { localStorage.setItem(checkKey(index), "1"); } catch (e) {}
  }

  function checkOutput(out, actual) {
    var root = out.closest ? out.closest(".igu-pg") : null;
    if (!root || !root.dataset.expect) return;
    var raw = root.dataset.expect;
    var spec;
    try { spec = JSON.parse(raw); } catch (e) { spec = { equals: raw }; }
    if (spec.error) {
      var errBox = document.createElement("div");
      errBox.className = "igu-check igu-check--bad";
      errBox.textContent = "Ошибка в @expect: " + spec.error;
      root.appendChild(errBox);
      return;
    }
    var got = normOut(actual);
    var ok = false;
    if (spec.contains) {
      var parts = Array.isArray(spec.contains) ? spec.contains : [spec.contains];
      ok = parts.every(function (p) { return got.indexOf(normOut(p)) !== -1; });
    } else if (spec.equals) {
      ok = got === normOut(spec.equals);
    } else {
      ok = got === normOut(raw);
    }
    var box = document.createElement("div");
    box.className = "igu-check " + (ok ? "igu-check--ok" : "igu-check--bad");
    box.textContent = ok ? "Проверка пройдена" : "Результат не совпал";
    var attempts = Number(root.dataset.attempts || 0);
    if (!ok) {
      attempts += 1;
      root.dataset.attempts = String(attempts);
      var hintBtn = root.querySelector(".igu-btn--hint");
      if (hintBtn) {
        hintBtn.disabled = attempts < 2;
        hintBtn.title = attempts < 2
          ? "Подсказка откроется после 2 попыток"
          : "Показать подсказку";
      }
    }
    if (!ok) {
      var d = document.createElement("div");
      d.className = "igu-check-detail";
      if (attempts < 3) {
        d.textContent = "Попытка " + attempts + " из 3. Ожидаемый результат откроется после третьей.";
      } else {
        d.textContent = "Ожидалось: " + normOut(spec.equals || spec.contains || raw) +
          "\nПолучено: " + (got || "(пусто)");
      }
      box.appendChild(d);
    } else {
      var idx = Number(root.dataset.iguIndex || 0);
      markDone(idx);
      root.classList.add("igu-done");
      var bar = root.querySelector(".igu-pg-bar");
      if (bar && !bar.querySelector(".igu-done-badge")) {
        var b = document.createElement("span");
        b.className = "igu-done-badge";
        b.textContent = "пройдено";
        bar.appendChild(b);
      }
      window.dispatchEvent(new CustomEvent("learning:check", {
        detail: { type: "igu", ok: true, root: root }
      }));
    }
    root.appendChild(box);
  }

  function build(root) {
    if (root.dataset.iguReady === "1") return;
    root.dataset.iguReady = "1";

    var lang = root.getAttribute("data-lang") || "python";
    var editorHost = root.querySelector(".igu-pg-editor");
    var out = root.querySelector(".igu-pg-out");
    var runBtn = root.querySelector("[data-run]");
    var clearBtn = root.querySelector("[data-clear]");
    var bar = root.querySelector(".igu-pg-bar");
    var status = document.createElement("span");
    status.className = "igu-pg-status";
    status.style.cssText = "font-size:.66rem;color:var(--igu-muted);margin-left:.5rem";
    if (bar) bar.appendChild(status);

    var parsed = parseMeta(root.dataset.code || "");
    var meta = {
      code: parsed.code || root.dataset.code || "",
      mode: root.dataset.mode || parsed.mode || "run",
      hint: root.dataset.hint || parsed.hint || "",
      expect: parsed.expect || null,
    };
    if (root.dataset.expect) {
      try { meta.expect = JSON.parse(root.dataset.expect); } catch (e) { meta.expect = { equals: root.dataset.expect }; }
    }
    var value = meta.code || STARTER[lang] || "";
    var cm = null;

    var CM_MODE = { python: "text/x-python", cpp: "text/x-c++src", js: "javascript" };
    var RUN = { python: runPython, cpp: runCpp, js: runJs };

    if (window.CodeMirror && editorHost) {
      cm = window.CodeMirror(editorHost, {
        value: value,
        mode: CM_MODE[lang] || "javascript",
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        indentUnit: 4,
        lineWrapping: true,
        viewportMargin: Infinity,
      });
      cm.setSize("100%", null);
      var lineCount = String(value).split("\n").length;
      cm.setSize("100%", Math.max(96, Math.min(420, lineCount * 23 + 12)) + "px");
      cm.on("keydown", function (inst, e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); doRun(); }
      });
    } else if (editorHost) {
      var ta = document.createElement("textarea");
      ta.value = value;
      ta.rows = Math.min(20, value.split("\n").length + 1);
      ta.style.cssText = "width:100%;box-sizing:border-box;border:none;padding:.7rem;font-family:'JetBrains Mono',monospace;font-size:.74rem";
      editorHost.appendChild(ta);
      cm = { getValue: function () { return ta.value; }, setValue: function (v) { ta.value = v; } };
    }

    root._cm = cm;

    function getValue() { return cm ? cm.getValue() : value; }
    function setStatus(t) { status.textContent = t || ""; }

    function busy(on) {
      if (runBtn) runBtn.disabled = on;
      if (clearBtn) clearBtn.disabled = on;
      root.classList.toggle("igu-pg-busy", on);
    }

    var stdinEl = root.querySelector(".igu-pg-stdin");

    function doRun() {
      var code = getValue();
      if (!String(code).trim()) { setOut(out, "Напиши код и нажми «Запустить».", false); return; }
      busy(true);
      setOut(out, "Выполняю…", false);
      var stdinText = stdinEl ? stdinEl.value : "";
      var fn = RUN[lang] || runJs;
      Promise.resolve(fn(code, out, setStatus, stdinText)).then(function () { busy(false); });
    }

    if (runBtn) runBtn.addEventListener("click", doRun);
    if (clearBtn) clearBtn.addEventListener("click", function () {
      cm.setValue(root.dataset.code || STARTER[lang] || "");
      setOut(out, "", false);
      setStatus("");
    });
  }

  function fenceToWidget(pre) {
    var lang = pre.classList.contains("pyplay") ? "python"
      : pre.classList.contains("jsplay") ? "js" : "cpp";
    var code = pre.textContent;
    var meta = parseMeta(code);
    var label = lang === "python" ? "Python · Pyodide"
      : lang === "js" ? "JavaScript · в браузере" : "C++ · g++";
    var root = document.createElement("div");
    root.className = "igu-pg";
    root.setAttribute("data-lang", lang);
    root.dataset.iguIndex = pre.dataset.iguIndex || "0";
    root.dataset.code = meta.code;
    var modeLabel = meta.mode === "fix" ? " · почини код"
      : meta.mode === "write" ? " · напиши код" : "";
    root.innerHTML =
      '<div class="igu-pg-bar"><span class="igu-pg-label">' + label + modeLabel + "</span>" +
      '<span class="igu-pg-actions"><button type="button" class="igu-btn igu-btn--run" data-run>▶ Запустить</button>' +
      '<button type="button" class="igu-btn" data-clear>Очистить</button></span></div>' +
      '<div class="igu-pg-editor"></div>' +
      (lang === "python"
        ? '<textarea class="igu-pg-stdin" rows="1" placeholder="Данные для input() — по одному значению на строку"></textarea>'
        : "") +
      '<pre class="igu-pg-out" aria-live="polite"></pre>';
    if (meta.hint) {
      root.dataset.hint = meta.hint;
    }
    if (meta.expect) {
      root.dataset.expect = typeof meta.expect === "string" ? meta.expect : JSON.stringify(meta.expect);
    }
    if (meta.mode) root.dataset.mode = meta.mode;
    pre.replaceWith(root);
    if (wasDone(Number(root.dataset.iguIndex || 0))) {
      root.classList.add("igu-done");
      var bar0 = root.querySelector(".igu-pg-bar");
      if (bar0 && !bar0.querySelector(".igu-done-badge")) {
        var b0 = document.createElement("span");
        b0.className = "igu-done-badge";
        b0.textContent = "пройдено";
        bar0.appendChild(b0);
      }
    }
    if (root.dataset.hint) {
      var hintBtn = document.createElement("button");
      hintBtn.type = "button"; hintBtn.className = "igu-btn igu-btn--hint"; hintBtn.textContent = "Подсказка";
      hintBtn.disabled = true;
      hintBtn.title = "Подсказка откроется после 2 попыток";
      var hintBox = null;
      hintBtn.addEventListener("click", function () {
        if (!hintBox) {
          hintBox = document.createElement("div");
          hintBox.className = "igu-hintbox";
          hintBox.textContent = root.dataset.hint;
          root.appendChild(hintBox);
        } else {
          hintBox.hidden = !hintBox.hidden;
        }
      });
      var barEl = root.querySelector(".igu-pg-actions");
      if (barEl) barEl.appendChild(hintBtn);
    }
    build(root);
  }

  function scan() {
    var pre = document.querySelectorAll("pre.pyplay, pre.cppplay, pre.jsplay");
    pre.forEach(function (n, i) {
      n.dataset.iguIndex = String(i);
      fenceToWidget(n);
    });
    document.querySelectorAll(".igu-pg[data-lang]").forEach(function (n, i) {
      if (!n.dataset.iguIndex) n.dataset.iguIndex = String(i);
      build(n);
    });
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
