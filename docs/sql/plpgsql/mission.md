---
title: "Транзакции и метаданные"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-plpgsql" data-title="Транзакции и метаданные" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">PL/pgSQL · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 45 минут

Сегодня два связанных дела: собрать скрипт из трёх транзакций и показать
метаданные базы.

1. **Транзакции.** Структура, данные, связи — отдельными `begin; ... commit;`.
2. **Метаданные.** Сколько таблиц в `public` и сколько в каждой колонок.
3. **ER.** Связи между восемью таблицами.
4. **Проверка.** Счётчики, ключи и порядок транзакций.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 10 минут</span>

## Разобранный пример: `information_schema`

`information_schema.tables` — список таблиц. Без фильтра туда попадают системные
объекты. В `artillery_my` твоих таблиц восемь:

| Таблица | Что хранит |
| --- | --- |
| `positions` | должности |
| `eq_types` | оборудование |
| `users` | сотрудники |
| `packs` | пачки измерений |
| `base_units` | физические величины |
| `units` | единицы измерения |
| `parameter_types` | типы параметров |
| `parametrs` | измерения |

`table_schema = 'public'` оставляет только твои таблицы. `table_type = 'BASE TABLE'`
отсекает представления.

### Почини

Сейчас запрос считает все таблицы всех схем. Оставь только `public` и базовые
таблицы. Ожидается `8`.

```sqlplay
-- @seed artillery_my
-- @mode fix
-- @expect {"columns":["table_count"],"rows":[[8]]}
-- @hint Добавь where table_schema = 'public' и table_type = 'BASE TABLE'.
select count(*) as table_count
from information_schema.tables;
```

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 10 минут</span>

## Напиши сам

Выведи список таблиц и число колонок в каждой. Ожидается 8 строк, столбцы
`table_name` и `columns_count`.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["table_name","columns_count"],"rows":[["base_units",2],["eq_types",2],["packs",4],["parameter_types",3],["parametrs",4],["positions",2],["units",4],["users",3]]}
-- @hint Источник — information_schema.columns. Сгруппируй по table_name, посчитай count(*) и назови второе поле columns_count.
```

</section>

<section class="mission-step" data-step="4" markdown="1">

<span class="mission-label">Шаг 4 · 12 минут</span>

## Перенеси в домашку

1. Собери `home_work_four` из трёх транзакций: структура и счётчики, тестовые
   данные, связи и ограничения. В каждой — свой `begin; ... commit;`.
2. Не смешивай всё в одном `do $$`: один блок — одна транзакция. Если
   преподаватель разрешает `do $$`, всё равно оставь три пары `begin/commit`.
3. Проверь каждую транзакцию отдельно: после первой — 8 таблиц и 8 счётчиков,
   после второй — данные, после третьей — ключи.
4. Построй ER-диаграмму в pgAdmin: 8 таблиц и связи `1:N`:
   `positions → users`, `eq_types → packs`, `users → packs`, `packs → parametrs`,
   `base_units → units`, `units → parameter_types`, `parameter_types → parametrs`.
5. Сверь ER с `information_schema`: число таблиц 8, у каждой есть `primary key`,
   внешние ключи ссылаются на существующие строки.

Метаданные и ER должны рассказывать одну и ту же историю. Если на диаграмме
связь есть, а в `information_schema` её нет, диаграмма врёт.

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 4 минуты</span>

## Вывод

Пять предложений:

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Что создаёт первая транзакция...
2. Чем наполняет вторая...
3. Какие связи добавляет третья...
4. Что показал запрос метаданных...
5. Где на ER видно направление связей..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-tx"> Три отдельные транзакции, а не одна большая.</li>
  <li><input type="checkbox" data-save="check-tables"> В `public` ровно 8 таблиц.</li>
  <li><input type="checkbox" data-save="check-meta"> Запрос метаданных возвращает 8 строк с числом колонок.</li>
  <li><input type="checkbox" data-save="check-er"> ER совпадает с ключами в `information_schema`.</li>
  <li><input type="checkbox" data-save="check-clean"> Скрипт запускается на чистой базе.</li>
</ul>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 4 минуты</span>

## Память

Закрой текст и ответь по памяти. Не перечитывай. Если не получилось — вернись
к нужному шагу, а не ко всей теории.

<ul class="mission-memory">
  <li>Почему три транзакции, а не одна?</li>
  <li>Что показывает `information_schema.tables` и зачем фильтр `public`?</li>
  <li>Как по ER проверить связь `1:N`?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2, 3 и 4."></textarea>

<div class="mission-note mission-note--green">
  <strong>Завтра утром · 3 минуты</strong>
  Ответь на эти же три вопроса без подсказок. Короткий точный ответ лучше
  длинного пересказа.
</div>

<textarea class="mission-textarea" data-save="error" placeholder="Одна ошибка за сегодня: что думал, что оказалось, по какому признаку узнаю в следующий раз."></textarea>

</section>

<div class="mission-controls">
  <button type="button" class="mission-btn mission-btn--ghost" data-prev>Назад</button>
  <span class="mission-spacer"></span>
  <button type="button" class="mission-btn mission-btn--primary" data-next>Дальше</button>
</div>

<p class="mission-hint" data-hint>Один экран — один шаг. Сначала попытка, потом проверка.</p>

<div class="mission-done" data-complete hidden>
  <strong>Домашка собрана</strong>
  <p>
    Ты прошёл заход. Не закрывай вкладку сразу: запиши одну ошибку и вернись к
    трём вопросам завтра утром. Это и есть повторение.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../">К плану курса</a>
    <a class="button" href="../../../">На сегодня</a>
  </div>
</div>

</div>
