---
title: "SQL: строки без пары"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-left-join-null" data-subtopic="sql-left-join-null" data-title="SQL: строки без пары" data-review="1,3,7,14,30" data-review-url="../../review/sql/" data-skills="left-join-null,count-null" data-strict="1" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">SQL · left join · одна подтема</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 7</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · жизненный пример · 3 минуты</span>

## В отчёте восемь пачек, а видно семь

Ты сдаёшь домашку по данным метеопоста. В отчёте должно быть 8 пачек
измерений. Заказчик открывает отчёт и видит 7.

| Что | Сколько |
| --- | ---: |
| `packs` — пачки | 8 |
| `parametrs` — измерения | 34 |
| пачек без измерений | **?** |

Если соединить `packs` и `parametrs` через обычный `join`, пачка без измерений
исчезнет. Отчёт станет «чистым», но неправильным.

**Артефакт:** запрос, который находит пачку без измерений и объясняет, почему
она потерялась. Это первая часть твоей домашки по качеству данных.

<div class="mission-note">
  <strong>Зачем это тебе</strong>
  В домашках часто проверяют не «среднее», а пропуски и несоответствия.
  `left join ... is null` — самый частый способ найти строку, у которой нет пары.
</div>

</section>

<section class="mission-step" data-step="2" markdown="1">

<span class="mission-label">Шаг 2 · теория · 5 минут</span>

## Как работает `left join`

`left join` сохраняет **все** строки левой таблицы. Если пары в правой таблице
нет, колонки справа становятся `null`.

```sql
select p.id as pack_id, par.id as measurement_id
from packs p
left join parametrs par on par.pack_id = p.id
where p.id in (1, 8)
order by p.id;
```

| `pack_id` | `measurement_id` |
| ---: | ---: |
| 1 | 1 |
| 1 | 2 |
| ... | ... |
| 8 | `null` |

### Правило

Ищи строки без пары так:

```sql
select p.id as pack_id
from packs p
left join parametrs par on par.pack_id = p.id
where par.id is null;
```

### Ловушка

Писать `where p.id is null` бессмысленно: `p.id` — левая таблица, она всегда
есть. Признак отсутствия пары — `null` в правой таблице.

<div class="mission-note mission-note--blue">
  <strong>Не путай</strong>
  `inner join` выбрасывает строки без пары. `left join` оставляет их, а
  `where par.id is null` оставляет только их.
</div>

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · диагностика · 5 минут</span>

## Проверь модель

Ответь на 5 вопросов. Нужно **80%** — это 4 из 5. Если меньше, вернись к теории
и пройди опрос снова. Это не оценка, а маршрут: от результата зависит, идём
дальше или углубляемся.

```quiz
{
  "title": "Диагностика · left join ... is null",
  "min": 80,
  "questions": [
    {"type":"choice","q":"Какой join оставит пачки, у которых нет измерений?","options":["inner join","left join","cross join","right join"],"answer":1,"explain":"left join сохраняет все строки левой таблицы. Для пачки без пары правая часть будет NULL."},
    {"type":"truefalse","q":"После inner join условие where par.id is null найдёт пачки без измерений.","answer":false,"explain":"inner join уже выбросил такие пачки. Нужен left join."},
    {"type":"find","q":"Где ошибка в запросе?","lines":["select p.id as pack_id","from packs p","left join parametrs par on par.pack_id = p.id","where p.id is null"],"answer":3,"explain":"Проверять надо par.id is null: именно правая таблица становится NULL, когда пары нет."},
    {"type":"input","q":"Какой pack_id останется без измерений в сиде artillery_my?","answer":["8"],"explain":"У пачки 8 нет ни одной строки в parametrs."},
    {"type":"choice","q":"Что вернёт count(par.id) для пачки без измерений?","options":["0","1","NULL","ошибку"],"answer":0,"explain":"count(column) не считает NULL, поэтому для пачки без измерений будет 0."}
  ]
}
```

<div class="mission-note mission-note--green">
  <strong>Ветвление</strong>
  80%+ → практика. 60–79% → перечитай «Ловушку» и пройди заново. &lt;60% →
  вернись к таблице с `null` и разбери пример по строкам.
</div>

</section>

<section class="mission-step" data-step="4" data-require-check data-require-all markdown="1">

<span class="mission-label">Шаг 4 · практика с каркасом · 20 минут</span>

## Почини и дострой

Сначала исправь запрос, потом добавь в него пользователя. Обе задачи должны
стать зелёными.

### 4.1. Почини join

Сейчас стоит `join`, поэтому пачка 8 исчезает. Оставь её в результате.

```sqlplay
-- @seed artillery_my
-- @mode fix
-- @expect {"columns":["pack_id"],"rows":[[8]]}
-- @hint inner join выбрасывает пачки без пары. Замени его на left join, а признак оставь par.id is null.
select p.id as pack_id
from packs p
join parametrs par on par.pack_id = p.id
where par.id is null
order by p.id;
```

### 4.2. Дострой результат

Теперь верни ещё и `user_id`. Ожидается одна строка: пачка 8, пользователь 3.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["pack_id","user_id"],"rows":[[8,3]]}
-- @hint Начни с packs p, сделай left join parametrs par по pack_id, оставь par.id is null и выбери p.id, p.user_id.
-- Напиши запрос ниже.
```

</section>

<section class="mission-step" data-step="5" data-require-check data-require-all markdown="1">

<span class="mission-label">Шаг 5 · куски домашки · 20 минут</span>

## Три маленьких куска

Это не полная домашка. Три проверки, которые потом войдут в твой скрипт.

### 5.1. Пачка без измерений

Верни `pack_id` и `user_id` пачки, у которой нет ни одного измерения.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["pack_id","user_id"],"rows":[[8,3]]}
-- @hint left join parametrs + where par.id is null.
-- Напиши запрос ниже.
```

### 5.2. Сколько пачек у пользователя 3

Верни число пачек в колонке `packs`.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["packs"],"rows":[[2]]}
-- @hint Простой count(*) с where user_id = 3.
-- Напиши запрос ниже.
```

### 5.3. Сколько измерений у пачки 8

Верни число измерений в колонке `measurements`.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["measurements"],"rows":[[0]]}
-- @hint Считай строки в parametrs, где pack_id = 8.
-- Напиши запрос ниже.
```

</section>

<section class="mission-step" data-step="6" data-require-check markdown="1">

<span class="mission-label">Шаг 6 · половина модуля · 25 минут</span>

## Все пачки, включая пустые

Собери запрос для проверки качества: для каждой пачки верни `pack_id`,
`user_id` и число измерений. Пачки без измерений тоже должны остаться.

Ожидается 8 строк. У пачки 8 измерений должно быть `0`.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["pack_id","user_id","measurements"],"rows":[[1,1,5],[2,2,5],[3,1,5],[4,1,4],[5,2,5],[6,2,5],[7,3,5],[8,3,0]]}
-- @hint Начни с packs p, сделай left join parametrs par по pack_id, сгруппируй по p.id и p.user_id, считай count(par.id). Почему не count(*)?
-- Напиши запрос ниже.
```

<div class="mission-note mission-note--blue">
  <strong>Почему <code>count(par.id)</code></strong>
  `count(*)` посчитает строку даже тогда, когда измерений нет. `count(par.id)`
  не считает `null`, поэтому пустая пачка получает `0`.
</div>

</section>

<section class="mission-step" data-step="7" data-require-check markdown="1">

<span class="mission-label">Шаг 7 · полный модуль · 40–60 минут</span>

## Полный модуль: диагностика по пользователям

Собери итоговый запрос для отчёта. Для каждого пользователя верни:

- `user_id`;
- число пачек;
- число измерений;
- число пачек без измерений.

Ожидается:

| user_id | packs | measurements | packs_without_measurements |
| ---: | ---: | ---: | ---: |
| 1 | 3 | 14 | 0 |
| 2 | 3 | 15 | 0 |
| 3 | 2 | 5 | 1 |

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["user_id","packs","measurements","packs_without_measurements"],"rows":[[1,3,14,0],[2,3,15,0],[3,2,5,1]]}
-- @hint Иди от users. Два left join: packs и parametrs. Считай count(distinct p.id), count(par.id) и count(distinct p.id) filter (where par.id is null). Не забудь group by.
-- Напиши запрос ниже.
```

### Проверь перед завершением

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="full-left"> Оба соединения — <code>left join</code>.</li>
  <li><input type="checkbox" data-save="full-distinct"> Пачки считаются через <code>count(distinct p.id)</code>.</li>
  <li><input type="checkbox" data-save="full-count"> Измерения считаются через <code>count(par.id)</code>.</li>
  <li><input type="checkbox" data-save="full-filter"> Пустые пачки считаются через <code>filter (where par.id is null)</code>.</li>
  <li><input type="checkbox" data-save="full-run"> Запрос запускается на сиде без ошибок.</li>
</ul>

### Объясни

<textarea class="mission-textarea" data-save="full-explain" placeholder="Почему здесь нужны два left join? Почему count(par.id), а не count(*)? Что сломается, если заменить left join на join?"></textarea>

<textarea class="mission-textarea" data-save="error" placeholder="Одна ошибка за сегодня: что думал, что оказалось, по какому признаку узнаю в следующий раз."></textarea>

</section>

<div class="mission-controls">
  <button type="button" class="mission-btn mission-btn--ghost" data-prev>Назад</button>
  <span class="mission-spacer"></span>
  <button type="button" class="mission-btn mission-btn--primary" data-next>Дальше</button>
</div>

<p class="mission-hint" data-hint>Один экран — один шаг. Сначала попытка, потом проверка.</p>

<div class="mission-done" data-complete hidden>
  <strong>Подтема собрана</strong>
  <p>
    Ты прошёл путь от примера до полного модуля. Заход попадёт в повторение
    через 1, 3, 7, 14 и 30 дней.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../../../">К повторениям</a>
    <a class="button" href="../../">Все SQL-заходы</a>
  </div>
</div>

</div>
