/* Загружает аудио целиком в Blob, чтобы перемотка работала даже без HTTP Range. */
(function () {
  "use strict";

  function prepare(audio) {
    if (audio.dataset.seekReady === "1") return;
    var src = audio.getAttribute("src");
    if (!src) return;
    audio.dataset.seekReady = "1";

    var status = audio.parentElement
      ? audio.parentElement.querySelector("[data-audio-status]")
      : null;
    if (status) status.textContent = "Загружаю аудио для перемотки…";

    fetch(src, { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.blob();
      })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        audio.src = url;
        audio.load();
        if (status) status.textContent = "Готово: можно перематывать.";
      })
      .catch(function () {
        if (status) status.textContent = "Перемотка недоступна: сервер не отдаёт файл целиком.";
      });
  }

  function init() {
    document.querySelectorAll("audio[data-seekable]").forEach(prepare);
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
