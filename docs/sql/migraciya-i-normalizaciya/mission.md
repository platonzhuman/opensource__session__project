---
title: "Миграция и нормализация за один заход"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-migraciya" data-title="Миграция и нормализация за один заход" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">Миграции · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 60 минут

Сегодня одна миграция: широкая таблица параметров становится длинной, а вокруг
появляются справочники и ключи.

1. **Понять wide → long.** Одна строка с пятью столбцами должна стать пятью
   строками.
2. **Собрать long для пачки 1.** `union all` и номера типов параметров.
3. **Написать unpivot с нуля.** Без готового шаблона.
4. **Перенести в скрипт.** Справочники, внешние ключи, `alter table`, повторный
   запуск.
5. **Сверить числа.** В `base` одна пачка — значит, пять строк, а не одна.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 12 минут</span>

## Разобранный пример: строка становится пятью

В `base` у пачки 1 такие значения:

| `parameter_type_id` | Столбец | Значение |
| --- | --- | --- |
| 1 | `height` | 100 |
| 2 | `temperature` | 12 |
| 3 | `pressure` | 34 |
| 4 | `wind_direction` | 0.20 |
| 5 | `wind_speed` | 45 |

В long одна строка — один параметр. Первый `select` задаёт имена столбцов:
`parameter_type_id` и `value`. Остальные `select` только добавляют строки.
`union all` не убирает дубликаты — здесь каждая строка своя.

### Почини

Сейчас в разворот попали четыре параметра из пяти. Добавь пропущенный, чтобы
для пачки 1 получилось пять строк.

```sqlplay
-- @seed base
-- @mode fix
-- @expect {"columns":["parameter_type_id","value"],"rows":[[1,"100.00"],[2,"12.00"],[3,"34.00"],[4,"0.20"],[5,"45.00"]]}
-- @hint В широкой таблице пять параметров. Проверь, какой select потерялся, и добавь его через union all.
select 1 as parameter_type_id, height as value
from measurment_input_params
where measurment_bath_id = 1
union all
select 2, temperature
from measurment_input_params
where measurment_bath_id = 1
union all
select 3, pressure
from measurment_input_params
where measurment_bath_id = 1
union all
select 4, wind_direction
from measurment_input_params
where measurment_bath_id = 1;
```

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 12 минут</span>

## Напиши сам

Теперь тот же разворот с нуля: пять строк для пачки 1, столбцы
`parameter_type_id` и `value`. Значения не округляй.

```sqlplay
-- @seed base
-- @mode write
-- @expect {"columns":["parameter_type_id","value"],"rows":[[1,"100.00"],[2,"12.00"],[3,"34.00"],[4,"0.20"],[5,"45.00"]]}
-- @hint Пять select — по одному на столбец. В каждом: номер типа, значение, from measurment_input_params, where measurment_bath_id = 1. Имена столбцов задай в первом select. Соедини через union all.
```

</section>

<section class="mission-step" data-step="4" markdown="1">

<span class="mission-label">Шаг 4 · 20 минут</span>

## Перенеси в домашку

Собери миграцию в своём скрипте `home_work_two`. Порядок:

1. Создай `base_units`, `units`, `parameter_types` с `primary key`, `unique` и
   `foreign key`. Заполни: 5 величин, 5 единиц и 6 типов параметров — пять из
   wide-таблицы плюс `Дальность сноса пуль` из ТЗ.
2. Создай `measurment_input_params_new` с полями `id`, `measurment_bath_id`,
   `parameter_type_id`, `value`. Поставь `primary key` и два `foreign key`.
3. Перенеси все строки, не только пачку 1. Коды новых строк считай так:
   `(id - 1) * 5 + n`, где `n` — номер параметра. В `base` id идут подряд, поэтому
   формула работает. Если в данных есть дыры, используй `row_number()` или
   sequence.
4. Проверь: `count(new) = 5 * count(old)`, `value` не `null`, все
   `parameter_type_id` лежат в `1..5`.
5. Сделай `alter table`: переименуй старую таблицу в `..._old`, новую — в
   `measurment_input_params`; добавь недостающие `primary key` и `foreign key`
   старым таблицам (`military_ranks`, `employees`, `measurment_types`,
   `measurment_baths`).
6. Проверь повторный запуск: на копии базы второй прогон не должен давать
   дубликаты и не должен падать на середине. Для этого используй транзакцию
   `begin; ... commit;` и один выбранный способ защиты: `drop table if exists`
   для новых таблиц или проверку `to_regclass`.

Проверочные запросы после переноса:

```sql
select count(*) as old_rows from measurment_input_params_old;
select count(*) as new_rows from measurment_input_params;
select count(*) as bad_values from measurment_input_params where value is null;
```

В `base` должно получиться `old_rows = 1` и `new_rows = 5`. Если после второго
прогона стало `10`, защита от повторного запуска не работает.

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 6 минут</span>

## Вывод

Пять предложений:

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Что перенёс и в каком порядке...
2. Сколько строк было в wide и стало в long...
3. Какие ключи и справочники добавил...
4. Как проверил повторный запуск...
5. Что осталось хрупким или требует проверки..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-run"> Скрипт запускается сверху вниз на чистом `base`.</li>
  <li><input type="checkbox" data-save="check-rows"> В long ровно 5 строк на каждую строку wide.</li>
  <li><input type="checkbox" data-save="check-fk"> Все внешние ключи проходят, `information_schema` показывает ограничения.</li>
  <li><input type="checkbox" data-save="check-rerun"> Второй прогон не удваивает данные.</li>
  <li><input type="checkbox" data-save="check-tx"> Миграция обёрнута в `begin; ... commit;`.</li>
</ul>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 5 минут</span>

## Память

Закрой текст и ответь по памяти. Не перечитывай. Если не получилось — вернись
к нужному шагу, а не ко всей теории.

<ul class="mission-memory">
  <li>Почему `union all`, а не `union`?</li>
  <li>Почему `primary key` родителя добавляют до `foreign key` ребёнка?</li>
  <li>Что именно проверяет повторный запуск миграции?</li>
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
