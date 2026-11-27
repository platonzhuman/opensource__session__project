---
title: "SQL: интерполяция"
hide:
  - navigation
  - toc
---

# SQL: интерполяция

Одна домашка. Один заход до 40 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="sql-interpolyaciya">
      <span class="course-row__main">
        <span class="course-row__title">Функция интерполяции на SQL</span>
        <span class="course-row__sub">Доля пути → формула → x = 5 → x = 2.5 → границы</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Доля пути.** По `x` и по `y` проходится одна и та же доля отрезка.
2. **Формула.** `y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)`.
3. **Две проверки.** `x = 5` даёт `20`, `x = 2.5` даёт `10`.
4. **Функция и границы.** `x2 is null`, `x2 = x1`, ниже 0 и выше 40.

## Что сдаёшь

- SQL-функцию или запрос линейной интерполяции в `home_work_five`;
- проверки для `x = 5` и `x = 2.5`;
- обработку границ и вырожденного отрезка;
- короткий вывод о формуле и ограничениях.

## Что понадобится

- `SELECT`, `round`, `generate_series`, числовые типы;
- базовое понимание PL/pgSQL-функций;
- 40 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>
