---
title: "Пять проверок качества"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-analiz" data-title="Пять проверок качества" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">SQL · анализ данных · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 45 минут: пять проверок

Анализ данных — это пять вопросов к базе, а не один запрос. В заходе:

1. У всех ли пользователей одинаковое число пачек?
2. Есть ли пустые пачки?
3. В каждой ли пачке полный набор из 5 параметров?
4. Все ли температуры в рабочем диапазоне 10..20?
5. Все ли единицы совпадают с параметром?

Две проверки прогоняем в песочнице, остальные собираем в переносе.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей. Готовое решение до попытки не показывается.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 10 минут</span>

## Полный набор параметров

В пачке должно быть ровно 5 строк в `parametrs`. Считаем `count(par.id)` и
фильтруем группы через `having`.

`where` фильтрует строки до группировки, `having` — уже посчитанные группы.
`count(par.id)` не считает `null` от `left join`, поэтому пустая пачка получает
0, а не 1.

### Почини

Сейчас `count(*)` считает строку, которую оставил `left join`, поэтому у пачки 8
получается 1. Исправь, чтобы получить пачку 4 → 4 и пачку 8 → 0.

```sqlplay
-- @seed artillery_my
-- @mode fix
-- @expect {"columns":["pack_id","cnt"],"rows":[[4,4],[8,0]]}
-- @hint count(*) считает и пустую строку left join. Считай count(par.id).
select p.id as pack_id, count(*) as cnt
from packs p
left join parametrs par on par.pack_id = p.id
group by p.id
having count(*) < 5
order by p.id;
```

</section>

<section class="mission-step" data-step="3" markdown="1">

<span class="mission-label">Шаг 3 · 7 минут</span>

## Пустые пачки

Пустая пачка — это ноль строк в `parametrs`. Это не то же самое, что неполная:
у пачки 4 есть 4 измерения, у пачки 8 — ни одного.

| Пачка | Число параметров | Что это |
| --- | --- | --- |
| 4 | 4 | неполная |
| 8 | 0 | пустая |

`inner join` теряет пустую пачку. `left join` оставляет её, а справа появляются
`null`. Поэтому пустую пачку видно по `par.id is null`.

Проверка 1 — число пачек по пользователям — отвечает на другой вопрос: 3, 3 и 2
пачки. Разные числа сами по себе не ошибка, пока не понятно, должно ли быть
одинаково.

</section>

<section class="mission-step" data-step="4" data-require-check markdown="1">

<span class="mission-label">Шаг 4 · 12 минут</span>

## Диапазоны температур

В этой проверке рабочий диапазон температуры — 10..20 включительно. Тип
`температура воздуха на высоте метеопоста` — `parameter_type_id = 2`.

Нарушение — `value < 10` или `value > 20`, то же самое `not between 10 and 20`.

### Напиши сам

Верни `pack_id` и `value` для температур вне диапазона. Ожидается одна строка:
пачка 7, значение 22. Чтобы проверка сравнила число, приведи `value` к `float8`.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["pack_id","value"],"rows":[[7,22]]}
-- @hint Соедини packs и parametrs, отфильтруй parameter_type_id = 2 и value not between 10 and 20.
-- Напиши запрос ниже.
```

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 6 минут</span>

## Единицы и перенос

Пятая проверка — единицы. Они лежат в `parameter_types.unit_id`, название — в
`units.short_name`.

| Параметр | Ожидаемая единица |
| --- | --- |
| высота | м |
| температура | °C |
| давление | мм рт. ст. |
| направление ветра | б. д. у. |
| скорость ветра | м/с |
| дальность сноса пуль | м |

В сиде у параметра 7 (`температура воздуха`) стоит `м/с` вместо `°C`. Это ошибка
данных, а не ошибка запроса.

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-users"> Проверка 1: число пачек по пользователям.</li>
  <li><input type="checkbox" data-save="check-empty"> Проверка 2: пустые пачки.</li>
  <li><input type="checkbox" data-save="check-full"> Проверка 3: полный набор из 5 параметров.</li>
  <li><input type="checkbox" data-save="check-range"> Проверка 4: температуры вне 10..20.</li>
  <li><input type="checkbox" data-save="check-units"> Проверка 5: единицы совпадают с параметром.</li>
</ul>

<div class="mission-note mission-note--green">
  <strong>Собери в один файл</strong>
  Каждая проверка — отдельный запрос с комментарием: что ищу и почему это
  проблема. Пустой результат — нормальный ответ, если проблем нет.
</div>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 5 минут</span>

## Вывод и память

Сформулируй вывод в четырёх предложениях: какие пять проверок сделал, что
нашли, что это значит для данных, что исправить в первую очередь.

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Проверил пять вещей...
2. Нашёл...
3. Для данных это значит...
4. Сначала исправить..."></textarea>

Закрой текст и ответь по памяти.

<ul class="mission-memory">
  <li>Почему <code>count(*)</code> и <code>count(par.id)</code> дают разное для пустой пачки?</li>
  <li>Зачем в проверке диапазона фильтровать по <code>parameter_type_id</code>?</li>
  <li>Почему пустой результат проверки — это хороший знак?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2–5."></textarea>

<div class="mission-note mission-note--green">
  <strong>Завтра утром · 3 минуты</strong>
  Закрой всё и ответь на эти же три вопроса. Если ответы стали короче и точнее —
  память работает.
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
  <strong>Пять проверок собраны</strong>
  <p>
    Ты прошёл заход. Не закрывай вкладку сразу: запиши одну ошибку и вернись к
    трём вопросам завтра утром.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../">К плану курса</a>
    <a class="button" href="../../../">На сегодня</a>
  </div>
</div>

</div>
