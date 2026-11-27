---
title: "Справочники Таблиц 2 и 3: ДМК и ВР"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-spravochniki-hw" data-subtopic="sql-reference-tables" data-format="hw-pieces" data-title="Справочники Таблиц 2 и 3: ДМК и ВР" data-homework="Проектирование справочников · Воловиков · до 02.11.2026 · 3 балла (сейчас 1)" data-new="индекс массива" data-review="1,3,7,14,30" data-review-url="../../review/sql/" data-skills="reference-data,arrays,normalization,er-diagram,artillery" data-strict="1" data-hint-default="Один кусок за раз. Свой код, потом проверка. Ответ — после третьей попытки." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">SQL · справочники · по кускам</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 7</span>
</div>

<section class="mission-step" data-step="1" data-kind="map" markdown="1">

<span class="mission-label">Шаг 1 · карта ДЗ · 5 минут</span>

## Что просил Воловиков и что пошло не так

Текст ДЗ из Forlabs, дословно:

> - Спроектировать структуры для хранения справочных данных для расчета ВР, ДМК.
>   Таблица 2, Таблица 3
> - Предоставить ER диаграммы и добавить описание (что и где хранится).
>   Диаграммы приложить в виде картинки.

**Что сдавать:** один SQL-скрипт со справочниками, картинка ER из pgAdmin, короткое описание своими словами, PR и ссылка на него в Forlabs.

**Что уже было в сдаче (1 из 3):** `eq_types` + `temp_corr` + `wind_speed` + `wind_dir` —
строка на каждое значение картинки. Учитель: «множественная денормализация» и «нет справочника высот».
Плюс сначала не было ссылки на PR.

Этот курс собирает схему **как у учителя** (`20261102.sql`): одна высота — одна строка с массивом значений.
Именно на ней потом строится «Итоговый расчёт».

### Карта: строка ДЗ → кусок

| Кусок | Строка ДЗ | Что нового | Время |
|---|---|---|---|
| 1. Почему не «строка на ячейку» | структуры без денормализации | ничего: сравниваем два подхода | 15 мин |
| 2. Справочник высот | Таблица 2 и 3 зависят от Y | ничего | 10 мин |
| 3. Типы таблиц и заголовки | структура Таблиц 2 и 3 | `array[…]` (видел у учителя) | 15 мин |
| 4. Значения строкой на высоту | хранение данных таблиц | индекс массива `v[1]` | 20 мин |
| Сборка | ER + описание + PR | ничего | 20 мин |
| Защита | вопросы из твоего ревью | ничего | 10 мин |

<div class="mission-note mission-note--yellow" markdown="1">
<strong>Где спрятана ловушка</strong>

Картинки ТЗ (`_Images/13.png` … `16.png`) выглядят как «ячейка = строка в БД».
Учитель хранит **целую строку картинки** в одном массиве `integer[]`.
Высоты — отдельный справочник, а не `check (h in (200, 400, …))` в каждой таблице.
</div>

<div class="mission-note mission-note--blue" markdown="1">
<strong>Песочница и homework</strong>

Оборудование `measurment_equipment` (ДМК = 1, ВР = 2) уже есть — новый `eq_types` не нужен.
Пишешь **свой homework** (`home_work_*`), а не цепочку скриптов из чужого Db2026.
В песочнице сид `meteo_pre_ref` — база до справочников Таблиц 2/3, на ней собираешь структуру.
</div>

<div class="mission-note mission-note--green" markdown="1">
<strong>Правила проверки</strong>

Всё в `do $$` с вложенными `begin … end;`. У каждой таблицы свой `id` + sequence.
`insert` со списком колонок. `comment on`. В PR — только файлы этого ДЗ и ссылка на PR в Forlabs.
</div>

</section>

<section class="mission-step" data-step="2" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 1 · ловушка денормализации · 15 минут</span>

## Одна строка картинки — одна ячейка с массивом

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

Именно за «строку на каждое значение» ты получил замечание «множественная денормализация».
Пока это не видно на маленьком примере, схема из ДЗ будет казаться «нормальной».
</div>

### Микро-теория

Картинка Таблицы 3 (ДМК, скорость) на высоте 200 м — это **одна строка** с 13 числами
для V0 = 3…15. Два способа положить её в БД:

| Способ | Сколько строк на одну высоту | Что сказал учитель |
|---|---|---|
| Колонки `h, inp, val` — строка на каждое V0 | 13 | «множественная денормализация» |
| Колонки `height_id, row_values integer[]` | 1 | его скрипт `20261102.sql` |

Массив пишется так: `array[4, 6, 8, 9]`. Элемент читается с **единицы**: `row_values[1]` → 4.

### Пример: плохая таблица и хорошая рядом

```sqlplay
-- @seed meteo_pre_ref
-- @mode run
-- @expect {"columns":["bad_rows","good_rows"],"rows":[[13,1]]}
-- @hint Пример. Поменяй одно число в array[…] и снова запусти select.
do $$
begin
	begin
		create table demo_bad
		(
			id integer not null primary key,
			h integer not null,
			inp integer not null,
			val integer not null
		);
		create table demo_good
		(
			id integer not null primary key,
			h integer not null,
			row_values integer[] not null
		);

		insert into demo_bad (id, h, inp, val) values
			(1, 200, 3, 4), (2, 200, 4, 6), (3, 200, 5, 8), (4, 200, 6, 9),
			(5, 200, 7, 10), (6, 200, 8, 12), (7, 200, 9, 14), (8, 200, 10, 15),
			(9, 200, 11, 16), (10, 200, 12, 18), (11, 200, 13, 20), (12, 200, 14, 21),
			(13, 200, 15, 22);

		insert into demo_good (id, h, row_values)
		values (1, 200, array[4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22]);
	end;
	commit;
end $$;

select
	(select count(*) from demo_bad) as bad_rows,
	(select count(*) from demo_good) as good_rows;
```

### Мини-задача 1.1: достань скорость при V0 = 6

В `demo_good` из примера V0 идёт с 3: позиция 1 → V0=3, позиция 4 → V0=6.
Выведи четвёртый элемент массива.

Сначала снова создай `demo_good` (песочница каждый раз с нуля).

```sqlplay
-- @seed meteo_pre_ref
-- @mode write
-- @id read-v0-6
-- @expect {"columns":["speed"],"rows":[[9]]}
-- @hint Создай demo_good как в примере и select row_values[4] as speed.
do $$
begin
	-- таблица demo_good и одна строка с array[…] как в примере
	commit;
end $$;

-- колонка: speed
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>Кусок ДЗ</strong>

В описании к ER одной фразой: «одна строка картинки = один массив на высоту, а не строка на ячейку».
Это ответ на вопрос, который уже был в ревью.
</div>

<textarea class="mission-textarea" data-save="denorm-note" placeholder="Своими словами: чем плоха схема temp_corr / wind_speed из сдачи?"></textarea>

</section>

<section class="mission-step" data-step="3" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 2 · справочник высот · 10 минут</span>

## Высоты — один раз, не check в каждой таблице

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

Замечание: «нет справочника высот». В ТЗ девять стандартных высот до 4 км.
Если высота числом в каждой таблице — при опечатке «2000» vs «200» связи не поймают ошибку.
</div>

### Микро-теория

Классический справочник учителя: `id` + sequence + значение.
Дальше другие таблицы ссылаются на `id`, а не копируют метры.

Девять высот из ТЗ: 200, 400, 800, 1200, 1600, 2000, 2400, 3000, 4000.

### Пример: маленький справочник

```sqlplay
-- @seed meteo_pre_ref
-- @mode run
-- @expect {"columns":["id","height"],"rows":[[1,200],[2,400]],"ordered":true}
-- @hint Пример. Добавь третью высоту 800.
do $$
begin
	begin
		create sequence demo_h_seq;
		create table demo_heights
		(
			id integer not null primary key default nextval('public.demo_h_seq'),
			height integer not null
		);
		comment on table demo_heights is 'Пример справочника высот';
		insert into demo_heights (height) values (200), (400);
	end;
	commit;
end $$;

select id, height from demo_heights order by id;
```

### Мини-задача 2.1: `calc_correction_heights`

```sqlplay
-- @seed meteo_pre_ref
-- @mode write
-- @id heights
-- @expect {"columns":["cnt","min_h","max_h"],"rows":[[9,200,4000]]}
-- @hint sequence + таблица (id, height) + 9 insert + comment on. Проверочный select уже есть.
do $$
begin
	-- sequence, таблица, comment on, 9 высот
	commit;
end $$;

select count(*) as cnt, min(height) as min_h, max(height) as max_h
from calc_correction_heights;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>Кусок ДЗ</strong>

Блок `calc_correction_heights` — первый в файле ДЗ. Имя как у учителя: так проще на паре и в следующем ДЗ.
</div>

</section>

<section class="mission-step" data-step="4" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 3 · типы таблиц и заголовки · 15 минут</span>

## Один справочник типов вместо трёх «плоских» таблиц

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

Таблица 2 одна для ДМК и ВР (значения совпадают). Таблица 3 делится на скорость и направление,
у каждого оборудования свой заголовок (V0 или Дг). Это дерево типов, а не четыре независимые таблицы.
</div>

### Микро-теория

| Поле | Зачем |
|---|---|
| `id` + sequence | свой ключ справочника |
| `parent_id` | «скорость ДМК» лежит под «Таблица 3, скорость» |
| `measurment_equipment_id` | ссылка на уже существующее оборудование (1 = ДМК, 2 = ВР) |
| `description` | что за таблица |
| `header_values integer[]` | заголовок картинки: `{3,4,…,15}` или `{1,…,10,20,…,50}` |

У родителей (Таблица 2, «скорость», «направление») заголовок может быть пустым или общим.
У листьев — конкретный.

`array[…]` ты видел в скрипте учителя; здесь пишешь сам.

### Пример: два типа с заголовком

```sqlplay
-- @seed meteo_pre_ref
-- @mode run
-- @expect {"columns":["id","first","twelfth"],"rows":[[1,3,14],[2,40,150]],"ordered":true}
-- @hint Пример. Посмотри measurment_equipment — id уже 1 и 2.
do $$
begin
	begin
		create sequence demo_types_seq;
		create table demo_types
		(
			id integer not null primary key default nextval('public.demo_types_seq'),
			equipment_id integer,
			description text not null,
			header_values integer[]
		);
		insert into demo_types (equipment_id, description, header_values)
		values
		(1, 'скорость ДМК', array[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
		(2, 'скорость ВР', array[40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]);
	end;
	commit;
end $$;

select id, header_values[1] as first, header_values[12] as twelfth
from demo_types
order by id;
```

### Мини-задача 3.1: `calc_correction_types`

Создай таблицу как у учителя и вставь минимум: родитель «Таблица 2», два листа
«положительные» / «отрицательные» (`parent_id` = 1), плюс скорость ДМК с заголовком V0.

Заголовок Таблицы 2 бери **с картинки**: `1…10, 20, 30, 40, 50` (не копируй опечатку из скрипта учителя с лишним 0).

```sqlplay
-- @seed meteo_pre_ref
-- @mode write
-- @id types
-- @expect {"columns":["id","parent_id","equipment","first"],"rows":[[1,null,null,1],[2,1,null,null],[3,1,null,null],[4,null,1,3]],"ordered":true}
-- @hint 4 строки: id 1 — Таблица 2 с заголовком; 2 и 3 — листья parent_id=1 без заголовка; 4 — скорость ДМК, equipment 1, заголовок с 3.
do $$
begin
	-- sequence, calc_correction_types, comment on, 4 insert
	commit;
end $$;

select t.id, t.parent_id, t.measurment_equipment_id as equipment, t.header_values[1] as first
from calc_correction_types t
order by t.id;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>Кусок ДЗ</strong>

В файле ДЗ — полный набор типов как у учителя (родители 1–3, листья 4–9).
Оборудование не создавай заново: используй `measurment_equipment`.
</div>

</section>

<section class="mission-step" data-step="5" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 4 · значения на высоту · 20 минут</span>

## `calc_correction`: высота + тип + массив

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

Это и есть хранение Таблиц 2 и 3. Одна строка = одна строка картинки на одной высоте для одного типа.
</div>

### Микро-теория

| Поле | Смысл |
|---|---|
| `height_id` | ссылка на `calc_correction_heights.id` |
| `type_id` | ссылка на `calc_correction_types.id` |
| `row_values` | числа строки картинки |

Связи (`references`) лучше добавить — так ER из pgAdmin покажет линии.
Индекс массива: `row_values[1]` — первое число строки (ты уже трогал в куске 1).

### Пример: одна строка отрицательных на 200 м

```sqlplay
-- @seed meteo_pre_ref
-- @mode run
-- @expect {"columns":["height","first","last"],"rows":[[200,-1,-49]]}
-- @hint Пример. Числа — с картинки 13.png для 200 м, отрицательные.
do $$
begin
	begin
		create sequence calc_correction_height_seq;
		create table calc_correction_heights
		(
			id integer not null primary key default nextval('public.calc_correction_height_seq'),
			height integer not null
		);
		insert into calc_correction_heights (height) values (200);

		create sequence calc_correction_types_seq;
		create table calc_correction_types
		(
			id integer not null primary key default nextval('public.calc_correction_types_seq'),
			description text not null
		);
		insert into calc_correction_types (description) values ('Таблица 2, отрицательные');

		create sequence calc_correction_seq;
		create table calc_correction
		(
			id integer not null primary key default nextval('public.calc_correction_seq'),
			height_id integer not null references calc_correction_heights (id),
			type_id integer not null references calc_correction_types (id),
			row_values integer[]
		);
		insert into calc_correction (height_id, type_id, row_values)
		values (1, 1, array[-1, -2, -3, -4, -5, -6, -7, -8, -8, -9, -20, -29, -39, -49]);
	end;
	commit;
end $$;

select h.height, c.row_values[1] as first, c.row_values[14] as last
from calc_correction c
join calc_correction_heights h on h.id = c.height_id;
```

### Мини-задача 4.1: четыре высоты отрицательных

Собери высоты 200–1200, один тип «отрицательные», четыре строки `calc_correction`.
Значения — с картинки (или как в примере учителя для этих высот).

```sqlplay
-- @seed meteo_pre_ref
-- @mode write
-- @id corr-neg
-- @expect {"columns":["height","first","col40"],"rows":[[200,-1,-39],[400,-1,-39],[800,-1,-37],[1200,-1,-35]],"ordered":true}
-- @hint height_id 1..4, type_id = 1. Столбец 40 — это row_values[13]. На 400 м в ТЗ -38, в скрипте учителя пока -39 — для этой задачи сверься с expect.
do $$
begin
	-- высоты, тип, calc_correction с 4 строками
	commit;
end $$;

select h.height, c.row_values[1] as first, c.row_values[13] as col40
from calc_correction c
join calc_correction_heights h on h.id = c.height_id
order by h.height;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>Кусок ДЗ</strong>

В файле — все нужные типы и строки по картинкам (хотя бы высоты 200–1200; 1600–4000 тоже лучше сразу).
Числа только с картинок ТЗ, не «от себя».
</div>

</section>

<section class="mission-step" data-step="6" data-kind="assemble" data-require-check markdown="1">

<span class="mission-label">Сборка · скрипт, ER, описание · 20 минут</span>

## Собираем сдачу

Порядок в одном `do $$`:

1. `calc_correction_heights` + 9 высот.
2. `calc_correction_types` + дерево типов и заголовки.
3. `calc_correction` + `references` на высоту и тип + данные с картинок.
4. `comment on` у всего нового.

### Мини-задача: каркас трёх таблиц и счётчики

Вставь свой код так, чтобы запрос ниже вернул эти числа (минимум для проверки структуры).

```sqlplay
-- @seed meteo_pre_ref
-- @mode write
-- @id assemble
-- @expect {"columns":["heights","types","rows"],"rows":[[9,9,24]]}
-- @hint 9 высот, 9 типов (как у учителя: 3 родителя + 6 листьев), по 4 высоты × 6 типов данных = 24 строки (1600+ можно добавить позже).
do $$
begin
	-- три таблицы + данные
	commit;
end $$;

select
	(select count(*) from calc_correction_heights) as heights,
	(select count(*) from calc_correction_types) as types,
	(select count(*) from calc_correction) as rows;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>Кусок ДЗ: ER и описание</strong>

1. В pgAdmin: ER, чтобы были видны связи heights → correction ← types → equipment.
2. Описание (5–7 предложений своими словами): что в каждой таблице, почему массив, почему высоты отдельно, почему не нужен свой `eq_types`.
3. PR только с файлами этого ДЗ + картинка ER + описание. Ссылка на PR — в отклике Forlabs.
</div>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="chk-heights"> Есть `calc_correction_heights` с 9 высотами и своим sequence.</li>
  <li><input type="checkbox" data-save="chk-types"> Типы с `parent_id`, `measurment_equipment_id`, `header_values`.</li>
  <li><input type="checkbox" data-save="chk-array"> Значения — массивы на высоту, не строка на ячейку.</li>
  <li><input type="checkbox" data-save="chk-do"> Весь скрипт в `do $$`, insert со списком колонок, есть `comment on`.</li>
  <li><input type="checkbox" data-save="chk-er"> ER-картинка приложена, связи читаются.</li>
  <li><input type="checkbox" data-save="chk-pr"> В PR только это ДЗ; в Forlabs есть ссылка на PR.</li>
</ul>

</section>

<section class="mission-step" data-step="7" data-kind="defend" data-require-check markdown="1">

<span class="mission-label">Защита · вопросы из ревью · 10 минут</span>

## Что он уже спрашивал и что спросит ещё

<textarea class="mission-textarea" data-save="defend-1" placeholder="Почему схема temp_corr / wind_speed — «множественная денормализация»?"></textarea>
<textarea class="mission-textarea" data-save="defend-2" placeholder="Зачем отдельный справочник высот, если можно check (h in (…))?"></textarea>
<textarea class="mission-textarea" data-save="defend-3" placeholder="Почему не создаёшь eq_types, а берёшь measurment_equipment?"></textarea>
<textarea class="mission-textarea" data-save="defend-4" placeholder="Что лежит в header_values и что в row_values?"></textarea>

```quiz
{
  "title": "Защита · справочники Таблиц 2 и 3",
  "min": 80,
  "questions": [
    {"type":"choice","q":"Почему одна высота Таблицы 3 не должна превращаться в 13 строк БД?","options":["Это дублирование одной строки картинки — денормализация","Потому что PostgreSQL не умеет много строк","Потому что так нельзя сделать primary key","Потому что учитель запретил insert"],"answer":0,"explain":"Строка картинки — один факт. Разнести её по 13 строкам — размножить одно и то же измерение высоты."},
    {"type":"choice","q":"Где хранить девять стандартных высот?","options":["В отдельном справочнике со своим id","Числом в каждой таблице с check","В JSON-поле настроек","В коде функции"],"answer":0,"explain":"Замечание из ревью: «нет справочника высот». Классический справочник — id + sequence + значение."},
    {"type":"choice","q":"Таблица 2 для ДМК и ВР по картинкам…","options":["Одинаковая — один набор данных","Разная — две таблицы обязательно","Нужна только для ДМК","Хранится только в Excel"],"answer":0,"explain":"Сначала смотрим данные. Значения совпадают — не плодим копии по оборудованию."},
    {"type":"choice","q":"Что такое header_values?","options":["Заголовок столбцов картинки (V0, Дг, Δτ)","Скорость ветра на высоте","Список высот","Текст description"],"answer":0,"explain":"Заголовок отделён от строк данных: строки лежат в row_values."},
    {"type":"choice","q":"С какого номера берётся элемент массива в PostgreSQL?","options":["С 1","С 0","С -1","Как в Python"],"answer":0,"explain":"row_values[1] — первый элемент. Это нужно помнить в следующем ДЗ при расчёте."},
    {"type":"choice","q":"Что обязательно приложить, кроме SQL?","options":["ER-картинку и описание, что где хранится","Только скриншот select *","Только prompt.md","Только classwork"],"answer":0,"explain":"Текст ДЗ: ER диаграммы картинкой и описание. И отдельно — ссылка на PR."}
  ]
}
```

<textarea class="mission-textarea" data-save="error" placeholder="Ошибка дня: что думал, что оказалось, по какому признаку узнаю."></textarea>

</section>

<div class="mission-controls">
  <button type="button" class="mission-btn mission-btn--ghost" data-prev>Назад</button>
  <span class="mission-spacer"></span>
  <button type="button" class="mission-btn mission-btn--primary" data-next>Дальше</button>
</div>

<p class="mission-hint" data-hint>Один кусок за раз. Свой код, потом проверка. Ответ — после третьей попытки.</p>

<div class="mission-done" data-complete hidden>
  <strong>Справочники собраны</strong>
  <p>
    Ты закрыл замечания про денормализацию и справочник высот. Дальше тот же каркас
    нужен в «Итоговом расчёте».
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="answers/">Сверить с ответами</a>
    <a class="button" href="../itogovyy-raschet/">К итоговому расчёту</a>
  </div>
</div>

</div>
