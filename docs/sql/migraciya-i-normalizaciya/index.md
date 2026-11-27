---
title: "SQL: миграции и нормализация"
hide:
  - navigation
  - toc
---

# SQL: миграции и нормализация

Одна домашка. Один заход до 60 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="sql-migraciya">
      <span class="course-row__main">
        <span class="course-row__title">Миграция и нормализация за один заход</span>
        <span class="course-row__sub">Широкая таблица → long → справочники → FK → повторный запуск</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Wide → long.** Пять столбцов параметров превращаются в пять строк.
2. **Справочники.** Базовые единицы, единицы измерения и типы параметров.
3. **Ключи и `alter table`.** `primary key`, `foreign key` и переименование таблиц.
4. **Повторный запуск.** Скрипт не должен удваивать данные при втором прогоне.

## Что сдаёшь

- SQL-скрипт миграции `home_work_two`, который запускается на `base` сверху вниз;
- три справочника с данными и внешними ключами;
- перенос параметров в long без потерь;
- проверку повторного запуска и короткий вывод.

## Что понадобится

- `base.sql` и понимание структуры `measurment_*`;
- `CREATE TABLE`, `INSERT`, `ALTER TABLE`, `UNION ALL`;
- 60 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>
