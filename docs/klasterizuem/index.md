---
title: "Кластеризуем"
hide:
  - navigation
  - toc
---

# Кластеризуем

Одна домашка. Один заход до 40 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="klasterizuem-homework">
      <span class="course-row__main">
        <span class="course-row__title">Собрать cluster_file за один заход</span>
        <span class="course-row__sub">Файл → z-score → KMeans → выбор k → cluster_file</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Файл с шапкой.** Пропустить заголовок и взять `Freq` и `Range`.
2. **Масштаб.** Z-score по каждой колонке, чтобы `Range` не задавил `Freq`.
3. **KMeans.** k центроидов и метка для каждой точки.
4. **Выбор k.** Максимум silhouette на сетке от 2 до 6.
5. **Сборка.** `cluster_file(path)` возвращает метки для каждой строки.

## Что сдаёшь

- рабочий `cluster_file(path)`, который запускается на исходном файле;
- метки кластеров для каждой строки;
- выбранное k и значение silhouette;
- короткий вывод: почему это k и где метод может ошибиться.

## Что понадобится

- Python: списки, циклы, функции, `open`;
- `numpy` и `scikit-learn` для домашки — песочницы здесь на чистом Python;
- 40 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>

## Старое

Старые уроки остались в [архиве](../archive/index.md) и не входят в основной поток.
