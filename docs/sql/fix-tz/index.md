---
title: "SQL: исправляем под ТЗ"
hide:
  - navigation
  - toc
---

# SQL: исправляем под ТЗ

Одна домашка. Один заход до 30 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="sql-fix-tz">
      <span class="course-row__main">
        <span class="course-row__title">Привести схему к ТЗ</span>
        <span class="course-row__sub">Данные из ТЗ → пачки без измерений → NOT NULL/UNIQUE/CHECK</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Требования ТЗ.** Какие параметры, единицы и ограничения должны быть в схеме.
2. **Пачки без измерений.** `left join` и проверка на `null`.
3. **Тот же запрос с нуля.** Без подсказки.
4. **Ограничения.** `not null`, `unique`, `check`.
5. **Перенос.** Исправленная схема, а не только запрос.

## Что сдаёшь

- исправленный `.sql`-скрипт схемы под ТЗ;
- запрос, который находит пачки без измерений;
- список добавленных ограничений `not null`, `unique`, `check`;
- короткий вывод: что было не так и как проверено.

## Что понадобится

- базовые `create table` и `join`;
- PostgreSQL или `sqlplay` с сидом `artillery_my`;
- 30 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>
