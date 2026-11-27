---
title: "SQL: анализ данных"
hide:
  - navigation
  - toc
---

# SQL: анализ данных

Одна домашка. Один заход до 45 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="sql-analiz">
      <span class="course-row__main">
        <span class="course-row__title">Пять проверок качества</span>
        <span class="course-row__sub">Полный набор → пустые пачки → диапазоны → единицы → вывод</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Полный набор.** В каждой пачке 5 параметров, `group by` и `having`.
2. **Пустые пачки.** `left join`, а не потеря строк.
3. **Диапазоны.** Температуры вне рабочего диапазона 10..20.
4. **Единицы.** Сверка `parameter_types.unit_id` с `units.short_name`.
5. **Сводка.** Пять проверок в одном скрипте.

## Что сдаёшь

- SQL-файл с пятью проверками;
- список найденных проблем с `pack_id` или `parameter_type_id`;
- короткий вывод: какие проверки прошли, какие нет.

## Что понадобится

- `select`, `join`, `group by`, `having`;
- PostgreSQL или `sqlplay` с сидом `artillery_my`;
- 45 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>

## Старое

Старые уроки остались в [архиве](../../archive/index.md) и не входят в основной поток.
