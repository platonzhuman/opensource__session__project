---
title: "SQL: домашка — базовый скрипт"
hide:
  - navigation
  - toc
---

# SQL: домашка — базовый скрипт

Одна домашка. Один заход до 45 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="sql-domashka">
      <span class="course-row__main">
        <span class="course-row__title">Собрать базовый скрипт за один заход</span>
        <span class="course-row__sub">Таблицы и ключи → повторный запуск → JOIN → перенос в скрипт</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Таблицы и ключи.** У каждой записи уникальный код, связи идут по `primary key`.
2. **Повторный запуск.** `drop table if exists` в обратном порядке связей.
3. **JOIN.** Пачки соединяются с пользователями и оборудованием.
4. **Две проверки.** Количество пачек по пользователям и по оборудованию.
5. **Перенос.** Скрипт целиком, а не отдельные куски.

## Что сдаёшь

- `.sql`-файл с таблицами, данными и повторным запуском;
- `JOIN`-запрос: пачки, пользователь, оборудование;
- скриншот результата, если требует преподаватель;
- короткий вывод: что проверено и где остались риски.

## Что понадобится

- PostgreSQL или `sqlplay` с сидом `artillery_my`;
- `select`, `join`, `group by`;
- 45 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>

## Старое

Старые уроки остались в [архиве](../../archive/index.md) и не входят в основной поток.
