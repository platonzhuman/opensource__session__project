---
title: "SQL: PL/pgSQL и метаданные"
hide:
  - navigation
  - toc
---

# SQL: PL/pgSQL и метаданные

Одна домашка. Один заход до 45 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="sql-plpgsql">
      <span class="course-row__main">
        <span class="course-row__title">Транзакции и метаданные</span>
        <span class="course-row__sub">Три транзакции → 8 таблиц → число колонок → ER</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Транзакции.** Структура и счётчики, данные, связи — тремя отдельными шагами.
2. **Метаданные.** Запрос к `information_schema` показывает 8 таблиц в `public`.
3. **Колонки.** Для каждой таблицы считается число столбцов.
4. **ER.** Диаграмма связей `1:N` сверяется с ключами в базе.

## Что сдаёшь

- PL/pgSQL-скрипт `home_work_four` из трёх транзакций;
- запрос метаданных: 8 таблиц с числом колонок;
- ER-диаграмму в pgAdmin;
- короткий вывод о структуре и связях.

## Что понадобится

- `artillery_my` и понимание восьми таблиц из прошлых домашек;
- `information_schema`, `begin/commit`, `primary key`, `foreign key`;
- 45 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>
