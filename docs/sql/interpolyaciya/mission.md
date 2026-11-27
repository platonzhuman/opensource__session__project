---
title: "Функция интерполяции на SQL"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-interpolyaciya" data-title="Функция интерполяции на SQL" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">Интерполяция · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 40 минут

Сегодня одна формула и две проверки: посчитать `y` между двумя точками.

1. **Понять отрезок.** Доля пути по `x` равна доле пути по `y`.
2. **Починить формулу.** Для `x = 5` на отрезке `(0,0)` и `(10,40)`.
3. **Написать с нуля.** Для `x = 2.5` на том же отрезке.
4. **Перенести в функцию.** Границы и защита от деления на ноль.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 8 минут</span>

## Разобранный пример: доля пути

Пусть точки `(0,0)` и `(10,50)`, ищем `y` при `x = 5`. По `x` пройдена половина
пути: `(5 - 0) / (10 - 0) = 0.5`. По `y` — тоже половина:
`0 + 0.5 * (50 - 0) = 25`.

| `x` | Доля пути | `y` |
| --- | --- | --- |
| 0 | 0.0 | 0 |
| 5 | 0.5 | 25 |
| 10 | 1.0 | 50 |

Формула:

```text
y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
```

Здесь `(x1, y1)` — левая точка, `(x2, y2)` — правая.

### Почини

Сейчас в числителе стоит длина всего отрезка `(x2 - x1)`, поэтому для `x = 5`
на точках `(0,0)` и `(10,40)` получается `40`. Исправь: ожидается `20`.

```sqlplay
-- @seed artillery_my
-- @mode fix
-- @expect {"columns":["y"],"rows":[[20]]}
-- @hint В числителе должна быть пройденная часть (x - x1), а не весь отрезок (x2 - x1).
select round(
    y1 + (x2 - x1) * (y2 - y1) / (x2 - x1),
    2
)::int as y
from generate_series(5, 5) as x
cross join (values (0.0, 0.0, 10.0, 40.0)) as p(x1, y1, x2, y2);
```

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 8 минут</span>

## Напиши сам

Посчитай `y` для `x = 2.5` на том же отрезке `(0,0)` и `(10,40)`. Ожидается `10`.
Используй `select`, `round` и приведение к целому. Назови результат `y`.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["y"],"rows":[[10]]}
-- @hint Подставь x = 2.5 в формулу. round(..., 2)::int даст целое число.
```

</section>

<section class="mission-step" data-step="4" markdown="1">

<span class="mission-label">Шаг 4 · 10 минут</span>

## Перенеси в домашку

1. Оформи формулу в `home_work_five`: функцией `interpolate(x, segment)` или
   отдельным `select`, если функция ещё не готова.
2. Проверь на отрезке из ТЗ: `25 → 2`, `30 → 3.5`, `26 → 2.3`.
3. Обработай `x2 is null` и `x2 = x1`: возвращай `y1`, иначе будет деление на
   ноль.
4. Ниже 0 верни 0, выше 40 — последнюю поправку. Это правила ТЗ, а не формула.
5. Сверь таблицу корректировок с ТЗ: в классной таблице для 20° стоит `1.0`, в ТЗ
   `1.5`. Из-за этого 23° даёт `1.6` или `1.8`. Уточни, какая таблица эталонная.

Формула не должна «продолжать прямую» за границы таблицы. Для границ есть
отдельные правила из ТЗ.

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 4 минуты</span>

## Вывод

Пять предложений:

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Какая формула и что означают четыре точки...
2. Что получилось для x = 5...
3. Что получилось для x = 2.5...
4. Какие границы обработал...
5. Что проверить в домашке..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-formula"> В формуле есть `(x - x1)` и деление на `(x2 - x1)`.</li>
  <li><input type="checkbox" data-save="check-5"> Для `x = 5` получено `20`.</li>
  <li><input type="checkbox" data-save="check-25"> Для `x = 2.5` получено `10`.</li>
  <li><input type="checkbox" data-save="check-edge"> Обработаны `x2 is null` и `x2 = x1`.</li>
  <li><input type="checkbox" data-save="check-boundary"> Ниже 0 и выше 40 есть отдельные правила.</li>
</ul>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 5 минут</span>

## Память

Закрой текст и ответь по памяти. Не перечитывай. Если не получилось — вернись
к нужному шагу, а не ко всей теории.

<ul class="mission-memory">
  <li>Почему доля пути по `x` равна доле пути по `y`?</li>
  <li>Что вернуть, если `x2 = x1`?</li>
  <li>Почему границы обрабатываются отдельно, а не формулой?</li>
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
