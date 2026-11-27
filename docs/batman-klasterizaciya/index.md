---
title: "Где спрятался Во"
hide:
  - navigation
  - toc
---

# Где спрятался Во

Одна домашка. Один заход до 30 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="batman-homework">
      <span class="course-row__main">
        <span class="course-row__title">DBSCAN: найти недостижимое здание</span>
        <span class="course-row__sub">Расстояние → соседи и eps → BFS → метка -1</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Расстояние.** Прыжок `300` в трёх координатах, включая высоту.
2. **Соседи.** `eps = 300` и `min_samples = 2`.
3. **Достижимость.** BFS по цепочке прыжков.
4. **Ответ.** Шум `-1` и карта с крышей Во.

## Что сдаёшь

- скрипт, который читает `buildings.dat.txt`;
- найденное недостижимое здание и проверку цепочкой;
- карту с выделенным зданием.

## Что понадобится

- Python 3 и `math`;
- координаты и теорема Пифагора;
- 30 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>

## Старое

Старые уроки остались в [архиве](../archive/index.md) и не входят в основной поток.
