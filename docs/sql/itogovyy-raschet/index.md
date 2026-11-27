---
title: "Итоговый расчёт: справочники и метеосредний"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-itogovyy-raschet" data-subtopic="sql-meteo-final" data-format="hw-pieces" data-title="Итоговый расчёт: справочники и метеосредний" data-homework="Итоговый расчёт · Воловиков · до 08.11.2026 23:59 · 10 баллов" data-new="индекс массива,update,add column,array_position,returns setof,return query" data-review="1,3,7,14,30" data-review-url="../../review/sql/" data-skills="arrays,update,alter-table,array-position,setof,return-query,artillery" data-strict="1" data-hint-default="Сначала пример → допиши → почини → потом сам. Функция — в конце. Ответ после третьей попытки." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">SQL · итоговый расчёт · по кускам</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 8</span>
</div>

<section class="mission-step" data-step="1" data-kind="map" markdown="1">

<span class="mission-label">Шаг 1 · что вообще сдавать · 5 минут</span>

## Смотри, как Воловиков это формулирует

Текст из Forlabs, дословно:

> - Подготовить скрипт PL/pgSQL. В него включить учебный скрипт
>   `https://gitverse.ru/VolovikovAlexander/Db2026/content/master/_Infra/scripts/20261102.sql`.
>   Подготовить корректировки данных по справочникам (Таблица 2, Таблица 3).
>   Исправление данных. Добавление отсутствующих данных.
>   Добавить отдельную таблицу для хранения заголовков.
>   Изменить структуру таблицы «справочник типов таблиц исключений» с учётом связи с новым справочником.
>
> - Разработать хранимую процедуру для выполнения расчётов.
>   На вход тип «входящие параметры» и тип оборудования.
>   На выходе вывод расчётных данных по каждой типовой высоте.
>
> - Создать тестовый скрипт PL/pgSQL … скриншот с результатами.

Коротко по-человечески: всё в **своём** репо. Берёшь `classwork/20261102`, **встраиваешь в homework**, запускаешь homework, находишь «недочёты», чинишь — и только потом пишешь расчёт.

`classwork` — его учебный пример. Сдача — `homework`. Не «прогони чужие скрипты из Db2026», а положи classwork **внутрь** своего файла ДЗ.

### По кускам

| Кусок | Суть | Новое | Время |
|---|---|---|---|
| 1. Вставить classwork, найти косяки | «включить учебный скрипт…» | `v[i]` | 30 мин |
| 2. Починить данные + высоты | «исправление… добавление» | `update` | 30 мин |
| 3. Таблица заголовков + связь | «отдельную таблицу…» | `add column` | 25 мин |
| 4. Функция расчёта | «по каждой высоте» | `array_position`, `setof` | 45 мин |
| Сборка | тест + скрин + PR | — | 20 мин |
| Защита | вопросы | — | 10 мин |

В каждом куске одно и то же: сначала пример → допиши каркас → почини почти-верный код → потом чуть сам (но не с пустого редактора).

До срока: 06.11 — куски 1–2, 07.11 — 3–4, 08.11 — сборка и PR до 23:59. 09.11 — замечания.

<div class="mission-note mission-note--yellow" markdown="1">
<strong>Ловушка в хвосте classwork</strong>

В конце `classwork/20261102` уже лежит такое:

```sql
create table calc_correction_headers (id SERIAL PRIMARY KEY, header_values INT[]);
insert into calc_correction_headers (header_values)
select distinct header_values from calc_correction_types;
```

В PR так нельзя: `SERIAL` вместо sequence, а `distinct` утащит битый заголовок Таблицы 2.
В куске 3 сделаем нормально — sequence и числа с картинок.
</div>

<div class="mission-note mission-note--blue" markdown="1">
<strong>Про песочницу</strong>

Тут не надо руками поднимать чужие скрипты.
`meteo_final` = база после того, как homework уже прогнал встроенный classwork (со всеми косяками).
`meteo_fixed` = то же после правок данных и заголовков — для функции.
У себя правишь homework и запускаешь его.

На задачах `write` / `fix` с `@id` кнопка **Спросить** (и **В чат**) копирует готовый текст
в буфер — вставь его в чат Cursor Auto. Мост и API-ключ не обязательны. Граница та же:
только это ДЗ, без готового решения целиком. Подробнее: [репетитор](tutor.md).
</div>

<div class="mission-note mission-note--green" markdown="1">
<strong>К чему придём</strong>

ДМК, пример ТЗ `(100, 25, 765, 15, 6, 0)`, оборудование 1:

| height | temperature | wind_direction | wind_speed |
|---|---|---|---|
| 200 | 11 | 16 | 9 |
| … | 11 | … | … |
| 4000 | 11 | 20 | 14 |

Скорости: 9, 11, 11, 12, 13, 13, 14, 14, 14. Направления: 16, 17, 18, 18, 19, 19, 19, 20, 20.
</div>

</section>

<section class="mission-step" data-step="2" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 1 · что лежит в classwork · 30 минут</span>

## Давай сначала просто посмотрим данные

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

ДЗ просит: вставь учебный скрипт в homework, запусти, найди недочёты.
Без списка косяков кусок 2 чинить нечего.
</div>

### Смотри: массив и высоты

В `row_values` лежит целая строка с картинки. Элемент — `row_values[номер]`, счёт **с 1**.

Числа и индексы тут не из воздуха. Заголовки и ячейки — с картинок ТЗ в `_Docs/Artillery/_Images/13–16.png` и из `header_values` / `row_values` в учебном classwork-скрипте (тот же дамп, что потом попадает в сид). Например, заголовок Т2 вида `[1..10, 20, 30, 40, 50]` — это четырнадцать слотов: после десятки идут 20, 30, 40, 50, поэтому столбец **40** сидит на индексе **13**, а не «где-то посередине». Когда в задаче просят `row_values[13]` или ждут `-39` на высоте 200 — это конкретная клетка с той же картинки / того же дампа преподавателя, а не рандом, который «придумала» песочница. Сверяйся с таблицей ниже и с `13.png`: индекс — позиция в массиве, значение — то, что нарисовано в столбце.

| Заголовок Т2 | 1 | 2 | … | 10 | 20 | 30 | 40 | 50 |
|---|---|---|---|---|---|---|---|---|
| Индекс | 1 | 2 | … | 10 | 11 | 12 | 13 | 14 |

Вопрос к себе: если написать `[12]` — это столбец 40 или 30?

Высота в метрах — не в `calc_correction`, а в `calc_correction_heights`. Как достанешь метры, если есть только `height_id`?

### Пример: заголовок Таблицы 2

Сверь с `13.png`: первый должен быть 1, десятый — 10. Что видишь в базе?

```sqlplay
-- @seed meteo_final
-- @mode run
-- @expect {"columns":["id","first","tenth","eleventh"],"rows":[[1,0,8,10]]}
-- @hint Пример. Песочница = homework уже выполнил встроенный classwork. Заголовок битый.
select id,
	header_values[1] as first,
	header_values[10] as tenth,
	header_values[11] as eleventh
from calc_correction_types
where id = 1;
```

### 1.1 Допиши: столбец 40 у «отрицательных»

Каркас почти готов — `from calc_correction c`, `type_id = 8`.
Тебе нужно только: join с высотами и какой индекс у столбца 40?

```sqlplay
-- @seed meteo_final
-- @mode write
-- @id find-t2-40
-- @expect {"columns":["height","val"],"rows":[[200,-39],[400,-39],[800,-37],[1200,-35]]}
-- @hint Join: h.id = c.height_id. Столбец 40 → индекс 13 (не 12).
select h.height,
	-- твой: c.row_values[…] as val  (столбец 40)
from calc_correction c
-- твой: join calc_correction_heights h on h.id = c.height_id
where c.type_id = 8
order by h.height;
```

### 1.2 Почини индекс

Почти то же, но стоит `[12]`. Это какой столбец? Поправь под 40.

```sqlplay
-- @seed meteo_final
-- @mode fix
-- @id find-t2-40-fix
-- @expect {"columns":["height","val"],"rows":[[200,-39],[400,-39],[800,-37],[1200,-35]]}
-- @hint Столбец 40 — 13-й элемент: 1…10,20,30,40.
select h.height, c.row_values[12] as val
from calc_correction c
join calc_correction_heights h on h.id = c.height_id
where c.type_id = 8
order by h.height;
```

### 1.3 Сколько строк у каждого типа

Хочешь понять, куда какие строки попали. Join с types и group by — допиши дырки.

```sqlplay
-- @seed meteo_final
-- @mode write
-- @id find-types
-- @expect {"columns":["type_id","description","cnt"],"rows":[[4,"Таблица 3, Скорость среднего ветра (ВР)",4],[5,"Таблица 3, Направление среднего ветра (ВР)",4],[6,"Таблица 3, Скорость среднего ветра (ДМК)",4],[7,"Таблица 3, Направление среднего ветра (ДМК)",8],[8,"Таблица 2, Положительные температуры",4]]}
-- @hint Join types по id. group by type_id и description. У типа 7 окажется 8 строк.
select c.type_id, t.description, count(*) as cnt
from calc_correction c
-- твой: join calc_correction_types t on t.id = c.type_id
group by -- твой: c.type_id, t.description
order by c.type_id;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>В свой homework</strong>

1. Возьми `classwork/20261102` без хвоста с `SERIAL` / `select distinct`, встрой в homework.
2. Запусти homework у себя.
3. Выпиши недочёты ниже — это план на кусок 2.
</div>

<textarea class="mission-textarea" data-save="errors-found" placeholder="1. Заголовок Т2 … 2. Типы 7/8/9 … 3. …"></textarea>

<details markdown="1">
<summary>Сверить список</summary>

1. Заголовок Таблицы 2 `{0,1,…,8,8,10,…}` вместо `{1,…,10,20,30,40,50}`.
2. Отрицательные под типом 8 («Положительные») — должны быть под 9.
3. Положительные под типом 7 (направление ДМК) — должны быть под 8.
4. Высота 400, отрицательные, столбец 40: `-39`, по ТЗ `-38`.
5. ДМК скорость, высота 1200, V0=11: `23`, по ТЗ `22`.
6. Нет высот 1600–4000 ни в одной таблице корректировок.

</details>

</section>

<section class="mission-step" data-step="3" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 2 · чиним данные · 30 минут</span>

## Теперь правим то, что нашли

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

ДЗ: «Исправление данных. Добавление отсутствующих».
Пока типы перепутаны — функция потом будет врать.
</div>

### Тут фишка с порядком `update`

`update … set … where …` меняет уже лежащие строки. Без `where` — всю таблицу.

Сейчас в базе примерно так:

| Сейчас | Что там | Куда |
|---|---|---|
| `type_id = 8` | отрицательные Т2 | → 9 |
| `type_id = 7` и `row_values[2] is not null` | положительные Т2 | → 8 |
| `type_id = 7` и одно число | направление ДМК | остаётся 7 |

Подумай: если сначала сделать `7 → 8`, а потом `8 → 9` — куда уедут положительные?

Один элемент массива тоже можно: `set row_values[13] = -38 where …`.

### Пример: поменяли один элемент

```sqlplay
-- @seed meteo_final
-- @mode run
-- @expect {"columns":["id","v1","v2","v3"],"rows":[[1,2,4,6],[2,10,25,30]]}
-- @hint Пример. Поменяй номер в скобках.
do $$
begin
	begin
		create table demo_rows
		(
			id integer not null primary key,
			list_values integer[] not null
		);
		insert into demo_rows (id, list_values)
		values (1, array[2, 4, 6]), (2, array[10, 20, 30]);
		update demo_rows set list_values[2] = 25 where id = 2;
	end;
	commit;
end $$;

select id, list_values[1] as v1, list_values[2] as v2, list_values[3] as v3
from demo_rows
order by id;
```

### 2.1 Допиши второй `update`

Первый сдвиг (`8 → 9`) уже есть. Как отличить положительные среди типа 7 и куда их подвинуть?

```sqlplay
-- @seed meteo_final
-- @mode write
-- @id fix-types
-- @expect {"columns":["type_id","cnt"],"rows":[[4,4],[5,4],[6,4],[7,4],[8,4],[9,4]],"ordered":true}
-- @hint Второй update: type_id = 8 where type_id = 7 and row_values[2] is not null.
do $$
begin
	begin
		update calc_correction set type_id = 9 where type_id = 8;
		-- твой: update … set type_id = 8 where type_id = 7 and row_values[2] is not null;
	end;
	commit;
end $$;

select type_id, count(*) as cnt
from calc_correction
group by type_id
order by type_id;
```

### 2.2 Почини порядок

Тут сначала `7 → 8`, потом `8 → 9`. Запусти — посмотри счётчики. Что не так? Поменяй местами.

```sqlplay
-- @seed meteo_final
-- @mode fix
-- @id fix-types-order
-- @expect {"columns":["type_id","cnt"],"rows":[[4,4],[5,4],[6,4],[7,4],[8,4],[9,4]],"ordered":true}
-- @hint Сначала 8→9 (отрицательные), потом 7→8 (положительные).
do $$
begin
	begin
		update calc_correction set type_id = 8 where type_id = 7 and row_values[2] is not null;
		update calc_correction set type_id = 9 where type_id = 8;
	end;
	commit;
end $$;

select type_id, count(*) as cnt
from calc_correction
group by type_id
order by type_id;
```

### 2.3 Две опечатки

Типы починил — остались два кривых числа в массивах. Какие элементы и у каких строк?

```sqlplay
-- @seed meteo_final
-- @mode write
-- @id fix-values
-- @expect {"columns":["type_id","height_id","v13","v9"],"rows":[[6,4,30,22],[9,2,-38,-8]],"ordered":true}
-- @hint После типов: row_values[13] = -38 (тип 9, height_id 2); row_values[9] = 22 (тип 6, height_id 4).
do $$
begin
	begin
		-- блок 2.1: два update типов (сначала 8→9, потом 7→8)
	end;
	begin
		-- твой: update … set row_values[13] = -38 where type_id = 9 and height_id = 2;
		-- твой: update … set row_values[9] = 22 where type_id = 6 and height_id = 4;
	end;
	commit;
end $$;

select type_id, height_id, row_values[13] as v13, row_values[9] as v9
from calc_correction
where (type_id = 9 and height_id = 2) or (type_id = 6 and height_id = 4)
order by type_id;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>В свой homework</strong>

Следом за встроенным classwork:

1. Два `update` типов и две опечатки.
2. `insert` строк на высоты 1600–4000 (`height_id` 5–9) по всем шести типам — с `13.png`…`16.png`.
3. Проверка: `select type_id, count(*) …` — везде по 9.
</div>

</section>

<section class="mission-step" data-step="4" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 3 · заголовки отдельно · 25 минут</span>

## Заголовки выносим в свою таблицу

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

ДЗ: отдельная таблица заголовков и связь с `calc_correction_types` вместо колонки `header_values`.
</div>

### Как это обычно собирают

1. `create sequence` + таблица `(id, description, header_values)`.
2. Три строки **с картинок** (Т2, V0 ДМК, Дг ВР) — не копируй из битых типов.
3. `alter … add column header_id … references …`.
4. Проставь `header_id`: типы 1/8/9 → 1, тип 6 → 2, тип 4 → 3.
5. `drop column header_values`.

Почему не `select distinct` из classwork? Что окажется в первой строке заголовка Т2?

### Пример: add / update / drop на игрушечной таблице

```sqlplay
-- @seed meteo_final
-- @mode run
-- @expect {"columns":["id","name","list_id"],"rows":[[1,"первый",10],[2,"второй",10],[3,"третий",null]]}
-- @hint Пример. Убери where — увидишь, почему он обязателен.
do $$
begin
	begin
		create table demo_types
		(
			id integer not null primary key,
			name text not null,
			old_list integer[]
		);
		insert into demo_types (id, name, old_list)
		values (1, 'первый', array[1, 2]), (2, 'второй', array[1, 2]), (3, 'третий', null);
		alter table demo_types add column list_id integer;
		update demo_types set list_id = 10 where id in (1, 2);
		alter table demo_types drop column old_list;
	end;
	commit;
end $$;

select id, name, list_id from demo_types order by id;
```

### 3.1 Допиши `insert`

Sequence и таблица уже стоят. Тебе — три `values` с картинок. Какие массивы у Т2 / V0 / Дг?

```sqlplay
-- @seed meteo_final
-- @mode write
-- @id headers-create
-- @expect {"columns":["id","first","tenth"],"rows":[[1,1,10],[2,3,12],[3,40,130]],"ordered":true}
-- @hint Т2: 1..10,20,30,40,50. V0 ДМК: 3..15. Дг ВР: 40..150 шаг 10.
do $$
begin
	begin
		create sequence calc_correction_headers_seq;
		create table calc_correction_headers (
			id integer not null primary key default nextval('public.calc_correction_headers_seq'),
			description text not null, header_values integer[] not null);
		-- твой insert (description, header_values) values
		-- ('Таблица 2…', array[1,2,…,10,20,30,40,50]),
		-- ('…V0 ДМК', array[3,4,…,15]),
		-- ('…Дг ВР', array[40,50,…,150]);
	end;
	commit;
end $$;

select id, header_values[1] as first, header_values[10] as tenth
from calc_correction_headers
order by id;
```

### 3.2 Почини `select distinct`

Этот код тащит заголовки из типов. Запусти — first у id=1 будет 0, не 1. Чем заменить вставку?

```sqlplay
-- @seed meteo_final
-- @mode fix
-- @id headers-fix-distinct
-- @expect {"columns":["id","first","tenth"],"rows":[[1,1,10],[2,3,12],[3,40,130]],"ordered":true}
-- @hint distinct утащит битый Т2. Пиши три values с картинок, свой description.
do $$
begin
	begin
		create sequence calc_correction_headers_seq;
		create table calc_correction_headers
		(
			id integer not null primary key default nextval('public.calc_correction_headers_seq'),
			description text not null,
			header_values integer[] not null
		);
		insert into calc_correction_headers (description, header_values)
		select 'из типов', header_values
		from (
			select distinct header_values
			from calc_correction_types
			where header_values is not null
		) t;
	end;
	commit;
end $$;

select id, header_values[1] as first, header_values[10] as tenth
from calc_correction_headers
order by id;
```

### 3.3 Свяжи типы через `header_id`

Собери целиком: заголовки → колонка → update → drop. Какие типы на какой header?

```sqlplay
-- @seed meteo_final
-- @mode write
-- @id headers-link
-- @expect {"columns":["id","header_id"],"rows":[[1,1],[2,null],[3,null],[4,3],[5,null],[6,2],[7,null],[8,1],[9,1]],"ordered":true}
-- @hint Типы 1,8,9 → header 1; тип 6 → 2; тип 4 → 3. Значения заголовков — с картинок.
do $$
begin
	-- твой: sequence + calc_correction_headers (3 строки с картинок)
	-- твой: alter … add column header_id … references …
	-- твой: update header_id; drop column header_values; comment on
	commit;
end $$;

select id, header_id
from calc_correction_types
order by id;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>В свой homework</strong>

Если хвост classwork с `SERIAL` уже успел выполниться — снеси таблицу/колонку и сделай блок заново.
В PR не должно быть ни `SERIAL`, ни `select distinct header_values`.
</div>

</section>

<section class="mission-step" data-step="5" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 4 · считаем · 45 минут</span>

## Данные починены — можно считать

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

ДЗ хочет функцию: на вход параметры + оборудование, на выход — строка на каждую высоту.
Тут база уже как после кусков 2–3 (`meteo_fixed`).
</div>

### 4.1 Где в заголовке стоит V0?

`array_position(заголовок, значение)` отвечает на вопрос «на каком месте это число?», а не «дай элемент номер N».

V0 = 6 в `{3,4,5,6,…}` — это какой по счёту элемент? Не 6-й.
Дальше: `row_values[array_position(header_values, 6)]`.

А если V0 = 2, а в заголовке минимум 3 — что вернёт `array_position`?

```sqlplay
-- @seed meteo_fixed
-- @mode run
-- @expect {"columns":["pos_6","pos_2"],"rows":[[4,null]]}
-- @hint Пример. null для 2 → скорость 0 при V0 &lt; 3.
select array_position(header_values, 6) as pos_6,
	array_position(header_values, 2) as pos_2
from calc_correction_headers
where id = 2;
```

### 4.1 Допиши скорость ДМК при V0 = 6

Join с заголовками есть. Чего не хватает, чтобы получить `height` и число из строки?

```sqlplay
-- @seed meteo_fixed
-- @mode write
-- @id speed-dmk
-- @expect {"columns":["height","speed"],"rows":[[200,9],[400,11],[800,11],[1200,12],[1600,13],[2000,13],[2400,14],[3000,14],[4000,14]],"ordered":true}
-- @hint speed = row_values[array_position(header_values, 6)], type_id = 6.
select h.height,
	-- твой: c.row_values[array_position(hd.header_values, 6)] as speed
from calc_correction c
join calc_correction_types t on t.id = c.type_id
join calc_correction_headers hd on hd.id = t.header_id
-- твой: join calc_correction_heights h on h.id = c.height_id
where c.type_id = 6
order by h.height;
```

### 4.2 Почини `type_id`

Стоит тип 7. Это скорость или направление? Поправь.

```sqlplay
-- @seed meteo_fixed
-- @mode fix
-- @id speed-dmk-fix
-- @expect {"columns":["height","speed"],"rows":[[200,9],[400,11],[800,11],[1200,12],[1600,13],[2000,13],[2400,14],[3000,14],[4000,14]],"ordered":true}
-- @hint Тип скорости ДМК = 6. Тип 7 — направление (одно число в строке).
select h.height, c.row_values[array_position(hd.header_values, 6)] as speed
from calc_correction c
join calc_correction_types t on t.id = c.type_id
join calc_correction_headers hd on hd.id = t.header_id
join calc_correction_heights h on h.id = c.height_id
where c.type_id = 7
order by h.height;
```

### Температура: десятки + единицы

ΔT = −12 → смотришь столбец 10 и столбец 2, складываешь.
В бюллетень отрицательное кодируется как `50 + abs(v)`. Тип строки: 9 если ΔT &lt; 0, иначе 8.

### 4.3 Температура для ΔT = −12

Joins уже стоят. Как собрать `val` из двух столбцов и `code` для бюллетеня?

```sqlplay
-- @seed meteo_fixed
-- @mode write
-- @id temp-minus12
-- @expect {"columns":["height","val","code"],"rows":[[200,-11,61],[400,-11,61],[800,-10,60],[1200,-10,60],[1600,-9,59],[2000,-9,59],[2400,-9,59],[3000,-8,58],[4000,-8,58]],"ordered":true}
-- @hint val = столбец 10 + столбец 2 через array_position. code = case when val &lt; 0 then 50+abs(val) else val end.
select h.height,
	-- твой: sum двух элементов as val
	-- твой: case … as code
from calc_correction c
join calc_correction_types t on t.id = c.type_id
join calc_correction_headers hd on hd.id = t.header_id
join calc_correction_heights h on h.id = c.height_id
where c.type_id = 9
order by h.height;
```

### Функция, которая отдаёт набор строк

Нужно вернуть несколько строк, как из таблицы. Схема такая:

1. Тип строки: `create type … as (height integer, …)`.
2. В функции: `returns setof имя_типа`.
3. В теле: `return query select …;` — один запрос, без цикла (он как раз ругал циклы 28.10).
4. Вызов: `select * from fn(…);`.

В ДЗ написано «процедура», но `procedure` в `select` не отдаёт строки. У него везде `fn_…`.

```sqlplay
-- @seed meteo_fixed
-- @mode run
-- @expect {"columns":["height","km"],"rows":[[2000,2],[2400,2],[3000,3],[4000,4]],"ordered":true}
-- @hint Пример каркаса setof: тип → returns setof → return query → select * from fn.
do $$
begin
	begin
		create type demo_height_type as (height integer, km integer);
		create function fn_demo_heights(par_min integer)
		returns setof demo_height_type
		language plpgsql
		as $body$
		begin
			return query
			select h.height, h.height / 1000
			from calc_correction_heights h
			where h.height >= par_min
			order by h.height;
		end;
		$body$;
	end;
	commit;
end $$;

select height, km from fn_demo_heights(2000);
```

### 4.4 Допиши функцию скорости

Тип и сигнатура есть. В `return query` — тот же смысл, что в 4.1, но фильтр через `parent_id` / оборудование и `par_wind` вместо шестёрки. Как напишешь?

```sqlplay
-- @seed meteo_fixed
-- @mode write
-- @id fn-speed
-- @expect {"columns":["height","wind_speed"],"rows":[[200,9],[400,11],[800,11],[1200,12],[1600,13],[2000,13],[2400,14],[3000,14],[4000,14]],"ordered":true}
-- @hint returns setof, parent_id = 2 и measurment_equipment_id = par_equipment_id, par_wind вместо 6.
do $$
begin
	begin
		create type calc_speed_type as (height integer, wind_speed integer);
		create function fn_calc_speed(par_equipment_id integer, par_wind integer)
		returns setof calc_speed_type language plpgsql as $body$
		begin
			-- твой return query: height + row_values[array_position(...)]
			-- join types/headers/heights; where parent_id=2 и equipment / par_wind
			return query select null::integer, null::integer where false;
		end; $body$;
	end;
	commit;
end $$;

select height, wind_speed from fn_calc_speed(1, 6);
```

### Направление

`α = α0 + Δα`. Если вылезло за 59 — минус 60. Скорость 0 → направление 0.

### 4.5 α0 = 58

Δα лежит в `row_values[1]` у типа 7. Как завернуть в `case`?

```sqlplay
-- @seed meteo_fixed
-- @mode write
-- @id direction-58
-- @expect {"columns":["height","direction"],"rows":[[200,59],[400,0],[800,1],[1200,1],[1600,2],[2000,2],[2400,2],[3000,3],[4000,3]],"ordered":true}
-- @hint type_id = 7, Δα = row_values[1]. case when 58 + Δα &gt; 59 then −60.
select h.height,
	-- твой: case when 58 + c.row_values[1] > 59 then … else … end as direction
from calc_correction c
join calc_correction_heights h on h.id = c.height_id
where c.type_id = 7
order by h.height;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>В свой homework</strong>

Собери `fn_calc_meteo_average(par_params, par_equipment_id)`:
`var_dt := round(fn_calc_header_temperature(…))`, для ВР вход — Дг до десятков,
три CTE (`temperature`, `speed`, `direction`) + `return query` по высотам.
</div>

</section>

<section class="mission-step" data-step="6" data-kind="assemble" data-require-check markdown="1">

<span class="mission-label">Сборка · файл и тест · 20 минут</span>

## Как сложить homework

Один homework (или несколько файлов **этой** сдачи) — не «отдельно прогнать classwork»:

1. Встроенный `classwork/20261102` без хвоста `SERIAL` / `select distinct`.
2. Правки данных + высоты 1600–4000.
3. `calc_correction_headers` + `header_id` + `drop header_values`.
4. Тип результата + `fn_calc_meteo_average`.
5. Отдельный тестовый скрипт + скриншот.

### Собери функцию на исправленной базе

Имена переменных подсказаны в комментариях. Тело — твоё: `var_dt` / десятки / единицы / ветер и три CTE.

```sqlplay
-- @seed meteo_fixed
-- @mode write
-- @id fn-final
-- @expect {"columns":["height","temperature","wind_direction","wind_speed"],"rows":[[200,11,16,9],[400,11,17,11],[800,11,18,11],[1200,11,18,12],[1600,11,19,13],[2000,11,19,13],[2400,11,19,14],[3000,11,20,14],[4000,11,20,14]],"ordered":true}
-- @hint var_dt := round(fn_calc_header_temperature(…)). CTE: temperature / speed / direction. wind_direction::integer.
do $$
begin
	begin
		-- твой: create type calc_meteo_result_type (height, temperature, wind_direction, wind_speed)
		-- твой: create function fn_calc_meteo_average(par_params, par_equipment_id)
		-- returns setof … language plpgsql as $body$
		-- declare: var_dt, var_tens, var_units, var_wind
		-- тело: посчитай переменные; return query with temperature, speed, direction
		null;
	end;
	commit;
end $$;

select height, temperature, wind_direction, wind_speed
from fn_calc_meteo_average((100, 25, 765, 15, 6, 0)::input_params_type, 1);
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>Тест</strong>

`do $$` с `raise notice` / `raise exception` на примере ТЗ для ДМК; снаружи —
`select * from fn_calc_meteo_average(…)` для ДМК и ВР → скрин в решение.
</div>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="pr-script"> Classwork встроен в homework, а не лежит только в classwork.</li>
  <li><input type="checkbox" data-save="pr-fix"> Данные починены, высоты 1600–4000 есть.</li>
  <li><input type="checkbox" data-save="pr-headers"> Заголовки через sequence, числа с картинок, не `select distinct`.</li>
  <li><input type="checkbox" data-save="pr-fn"> Есть `fn_calc_meteo_average`, тест и скрин.</li>
  <li><input type="checkbox" data-save="pr-pr"> PR только файлы ДЗ; ссылка в Forlabs.</li>
</ul>

</section>

<section class="mission-step" data-step="7" data-kind="defend" data-require-check markdown="1">

<span class="mission-label">Защита · 10 минут</span>

## Как будто он спрашивает

<textarea class="mission-textarea" data-save="defend-1" placeholder="Почему сначала учебный скрипт и недочёты, а не сразу функция?"></textarea>
<textarea class="mission-textarea" data-save="defend-2" placeholder="Почему нельзя insert … select distinct header_values из classwork?"></textarea>
<textarea class="mission-textarea" data-save="defend-3" placeholder="Какие недочёты нашёл в данных? Назови три."></textarea>
<textarea class="mission-textarea" data-save="defend-4" placeholder="Почему функция setof, а не procedure / цикл?"></textarea>
<textarea class="mission-textarea" data-save="defend-5" placeholder="В ТЗ для t0=+3 поправка 0.3, у fn_calc_header_temperature по таблице 0.5. Что у тебя?"></textarea>

```quiz
{
  "title": "Защита · итоговый расчёт",
  "min": 80,
  "questions": [
    {"type":"choice","q":"С чего начинается работа по ДЗ?","options":["Встроить classwork/20261102 в homework, запустить homework, найти недочёты","Сразу писать fn_calc_meteo_average","Сделать свой eq_types","Отдельно прогнать все скрипты учителя из Db2026"],"answer":0,"explain":"Classwork — учебный пример; его кладут внутрь homework. Не «поднять базу чужими скриптами», а сдать свой homework."},
    {"type":"choice","q":"Почему select distinct header_values опасен?","options":["Скопирует ошибочный заголовок Таблицы 2 из учебного скрипта","Потому что distinct запрещён в PostgreSQL","Потому что массивы нельзя вставлять","Потому что так медленно"],"answer":0,"explain":"В учебном примере заголовок Т2 уже кривой. distinct перенесёт его как есть."},
    {"type":"choice","q":"В каком порядке чинить type_id 7/8/9?","options":["Сначала 8→9, потом 7→8","Сначала 7→8, потом 8→9","Одним update без where","Удалить все строки и вставить заново обязательно"],"answer":0,"explain":"Иначе положительные, только что ставшие 8, уедут в 9."},
    {"type":"choice","q":"Что вернёт array_position(array[3,4,5,6], 2)?","options":["null","0","1","Ошибку"],"answer":0,"explain":"Нет значения — null. Отсюда нули при V0 < 3."},
    {"type":"choice","q":"Зачем returns setof?","options":["Вернуть набор строк по высотам через return query","Чтобы функция была быстрее","Чтобы вернуть одно число","Так пишут только процедуры"],"answer":0,"explain":"setof + return query = таблица; вызов select * from fn(…)." },
    {"type":"choice","q":"Куда девать classwork/20261102?","options":["Встроить в homework этой сдачи","Оставить только в classwork — так и сдать","Держать только в чужом Db2026","Положить в Learning"],"answer":0,"explain":"Classwork — пример учителя. Сдача — homework, внутри которого этот пример уже включён."}
  ]
}
```

<textarea class="mission-textarea" data-save="error" placeholder="Что сегодня было неочевидно? Коротко."></textarea>

</section>

<div class="mission-controls">
  <button type="button" class="mission-btn mission-btn--ghost" data-prev>Назад</button>
  <span class="mission-spacer"></span>
  <button type="button" class="mission-btn mission-btn--primary" data-next>Дальше</button>
</div>

<p class="mission-hint" data-hint>Сначала пример. Потом допиши. Потом почини. Функция — в конце.</p>

<div class="mission-done" data-complete hidden>
  <strong>Собрал в правильном порядке</strong>
  <p>Classwork → недочёты → заголовки → функция → тест. Хвост с SERIAL в PR не тащи.</p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="answers/">Сверить с ответами</a>
    <a class="button" href="../">Все SQL-заходы</a>
  </div>
</div>

</div>
