---
title: "Front → OLAP: перенос ресурсов"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-olap-perenos" data-subtopic="sql-olap-perenos" data-format="hw-pieces" data-title="Front → OLAP: перенос ресурсов" data-homework="Перенос ресурсов по направлениям · Воловиков · до 21.11.2026 23:59 · проверка до 22.11.2026 23:59" data-new="generate_series,top" data-review="1,3,7,14,30" data-review-url="../../review/sql/" data-skills="olap,dimensional-modeling,plpgsql,mssql" data-strict="1" data-tutor="off" data-hint-default="Сначала пример. Потом свой код." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">SQL · OLAP · Front → PostgreSQL</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 7</span>
</div>

<section class="mission-step" data-step="1" data-kind="map" markdown="1">

<span class="mission-label">Шаг 1 · что сдавать · 5 минут</span>

## Что просят

Нужно перенести данные из старой `Front` (MSSQL) в новую OLAP-базу на PostgreSQL.

Сдать **три скрипта + отдельный скрипт времени**:

| Файл | Что внутри |
|---|---|
| `01_olap_ddl.sql` | структура OLAP: измерения и факты |
| `02_mssql_source.sql` | запросы к MSSQL: что забираем |
| `03_load.sql` | PL/pgSQL-вставка в PostgreSQL |
| `04_dim_time.sql` | таблица времени: месяцы и кварталы |

Срок: **21.11.2026 23:59**, проверка до **22.11.2026 23:59**.

## Главная идея

OLTP — это `Front`, где много таблиц и всё связано. OLAP — это склад для анализа: **измерения** (кто, что, когда) и **факты** (сколько, на сколько).

- `dim_*` — справочники: время, товар, поставщик, персонал, склад.
- `fact_*` — числа: закупка, продажа, персонал, остатки.

У учителя уже есть пример:

- `dimensions_source.sql` — как выбрать размеры, категории и поставщиков из MSSQL;
- `dimensions_destination.sql` — как создать `dim_ranges` в PostgreSQL.

Порядок: **MSSQL-выборка → PostgreSQL-вставка**.

## План на два дня

| День | Что |
|---|---|
| 1 | карта, измерения, источники, загрузка |
| 2 | время, факты, сборка, проверка |

<div class="mission-note mission-note--blue" markdown="1">
<strong>Правила</strong>

- всё DDL/DML — в `do $$` с вложенными `begin … end; commit;`;
- `insert into ... (колонки) values ...` — всегда со списком колонок;
- у каждой таблицы свой `id` + `sequence`;
- `external_id` — код из MSSQL, `id` — уже ваш ключ в PostgreSQL;
- `comment on table/column` — коротко, по делу;
- без `select *` в финальных отчётах;
- в PR только эти четыре скрипта.
</div>

</section>

<section class="mission-step" data-step="2" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 1 · измерения · 20 минут</span>

## Из чего состоит OLAP

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

Без измерений факты не к чему привязать. Сначала делаем справочники: размеры, категории, поставщики, товары, персонал, склады.
</div>

Измерение — это таблица-справочник. У неё есть:

- свой `id` (sequence);
- `external_id` — код из MSSQL;
- название и пара атрибутов;
- `date_add` — когда загрузили.

Пример учителя — `dim_ranges` из `size`.

### Пример: сколько строк в источнике

```sqlplay
-- @seed olap_slice
-- @mode run
-- @expect {"columns":["rows"],"rows":[[5]]}
-- @hint src_size — маленький кусок size из Front. Просто count(*).
select count(*) as rows from src_size;
```

### Задача 1.1 — собери `dim_ranges`

Сделай свою таблицу размеров: `id`, `external_id`, `name`, `factor`, `date_add`. Заполни из `src_size`.

```sqlplay
-- @seed olap_slice
-- @mode write
-- @id dim-ranges
-- @expect {"columns":["ranges"],"rows":[[5]]}
-- @hint create sequence + create table dim_ranges, потом insert from src_size, потом count(*).
do $$
begin
	create sequence seq_dim_ranges;
	create table dim_ranges (
		id bigint primary key default nextval('seq_dim_ranges'),
		external_id bigint,
		name text,
		factor float,
		date_add timestamp default now()
	);
	-- твой код: insert into dim_ranges (external_id, name, factor)
	-- твой код: select ... from src_size
end $$;
-- твой код: select count(*) as ranges from dim_ranges;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>Кусок ДЗ</strong>

Добавь по такому же шаблону `dim_categories`, `dim_vendors`, `dim_products`, `dim_personnel`, `dim_storages`.

Не копируй все колонки: бери ключ, название и 1–2 нужных атрибута.
</div>

</section>

<section class="mission-step" data-step="3" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 2 · источники MSSQL · 20 минут</span>

## Что забираем из Front

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

OLAP-скрипт вставки должен получить данные из MSSQL. Сначала пишем источник: без `select *`, только нужные колонки.
</div>

Смотри `dimensions_source.sql`:

- `[size]` → `id`, `sizeid`, `portionrate`;
- `category` → `id`, `description`, `parentid`;
- `vendors` + `vendorgroup` → `id`, `clientid`, `clientgroup`, `description`.

### Пример: первые размеры

```mssqllocal
-- @mode run
-- @expect {"columns":["id","sizeid","portionrate"],"rows":[[1,"порция",1],[2,"100г",100],[3,"Бут.500мл.",500]]}
-- @hint top 3, order by id.
select top 3 id, sizeid, portionrate
from dbo.size
order by id;
```

### Задача 2.1 — пять размеров

```mssqllocal
-- @mode write
-- @id source-size
-- @expect {"columns":["id","sizeid","portionrate"],"rows":[[1,"порция",1],[2,"100г",100],[3,"Бут.500мл.",500],[4,"50 мл",50],[5,"1 день",1]],"ordered":true}
-- @hint top 5, order by id.
select top 5 id, sizeid, portionrate
from dbo.size
-- твой код: order by id
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>Кусок ДЗ</strong>

В `02_mssql_source.sql` положи запросы:

- измерения: размеры, категории, поставщики, товары, персонал, склады;
- факты: закупка, продажа, персонал, остатки.

В каждом — только нужные колонки и `order by` для стабильного порядка.
</div>

</section>

<section class="mission-step" data-step="4" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 3 · время · 15 минут</span>

## Таблица времени

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

В OLAP почти каждый факт должен иметь код времени. Иначе не будет отчётов по месяцам и кварталам.
</div>

Нужна таблица:

| Код | Начало месяца | Конец месяца | Название месяца | Год | Номер квартала | Название квартала |
|---|---|---|---|---|---|---|

Месяцы удобно генерировать через `generate_series`.

### Пример: 12 месяцев

```sqlplay
-- @seed olap_slice
-- @mode run
-- @expect {"columns":["months"],"rows":[[12]]}
-- @hint generate_series от 2024-01-01 до 2024-12-01 с шагом 1 month.
select count(*) as months
from generate_series('2024-01-01'::date, '2024-12-01'::date, interval '1 month') g(d);
```

### Задача 3.1 — собери `dim_time`

```sqlplay
-- @seed olap_slice
-- @mode write
-- @id dim-time
-- @expect {"columns":["months","first_start","last_end"],"rows":[[12,"2024-01-01","2024-12-31"]]}
-- @hint код = YYYYMM, начало = d, конец = d + 1 month - 1 day, квартал = extract(quarter from d). В конце заверни даты в to_char.
do $$
begin
	create table dim_time (
		code integer primary key,
		month_start date not null,
		month_end date not null,
		month_name text not null,
		year integer not null,
		quarter_number integer not null,
		quarter_name text not null
	);
	-- твой код: insert into dim_time (...)
	-- твой код: select из generate_series
end $$;
-- твой код: select count(*), to_char(min(month_start), 'YYYY-MM-DD'), to_char(max(month_end), 'YYYY-MM-DD') from dim_time;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>Кусок ДЗ</strong>

Сделай `04_dim_time.sql` для всего периода данных Front — с 2020 по 2026 год.

Проверь: 12 месяцев в году, конец месяца — последнее число, квартал 1–4.
</div>

</section>

<section class="mission-step" data-step="5" data-kind="piece" data-require-check data-require-all markdown="1">

<span class="mission-label">Кусок 4 · факты · 25 минут</span>

## Числа по направлениям

<div class="mission-note mission-note--yellow piece-why" markdown="1">
<strong>Зачем</strong>

Измерения — это «кто/что/когда». Факты — это «сколько/на сколько». Без фактов OLAP бесполезен.
</div>

Факт обычно содержит:

- `time_code` — ссылка на `dim_time`;
- ключи измерений: товар, поставщик, персонал, склад;
- метрики: количество, сумма.

Факты нужны по четырём направлениям:

- `fact_purchase` — закупка;
- `fact_sales` — продажа;
- `fact_personnel` — персонал;
- `fact_inventory` — остатки.

### Пример: сколько продаж

```sqlplay
-- @seed olap_slice
-- @mode run
-- @expect {"columns":["rows","amount"],"rows":[[4,1650]]}
-- @hint count(*) и sum(amount)::int по src_sales.
select count(*) as rows, sum(amount)::int as amount
from src_sales;
```

### Задача 4.1 — собери `fact_sales`

```sqlplay
-- @seed olap_slice
-- @mode write
-- @id fact-sales
-- @expect {"columns":["rows","amount"],"rows":[[4,1650]]}
-- @hint time_code = to_char(dt, 'YYYYMM')::int; остальное из src_sales; сумма в конце ::int.
do $$
begin
	create sequence seq_fact_sales;
	create table fact_sales (
		id bigint primary key default nextval('seq_fact_sales'),
		time_code integer not null,
		product_id bigint not null,
		doc_id bigint,
		qty numeric(12,3),
		amount numeric(12,2)
	);
	-- твой код: insert into fact_sales (...)
	-- твой код: select ... from src_sales
end $$;
-- твой код: select count(*), sum(amount)::int from fact_sales;
```

<div class="mission-note mission-note--green piece-hw" markdown="1">
<strong>Кусок ДЗ</strong>

Повтори шаблон для `fact_purchase`, `fact_personnel`, `fact_inventory`.

В каждом факте проверь: строки вставились, суммы не нулевые, `time_code` есть в `dim_time`.
</div>

</section>

<section class="mission-step" data-step="6" data-kind="assemble" data-require-check markdown="1">

<span class="mission-label">Сборка · 10 минут</span>

## Сложи четыре скрипта

```text
01_olap_ddl.sql      -- измерения и факты
02_mssql_source.sql  -- запросы к Front
03_load.sql          -- вставка в PostgreSQL
04_dim_time.sql      -- месяцы и кварталы
```

Порядок запуска в PostgreSQL:

1. `01_olap_ddl.sql`
2. `04_dim_time.sql`
3. `03_load.sql`
4. проверки: `count(*)`, `min/max` времени, суммы фактов.

Перед PR проверь:

- `select *` нигде нет;
- `insert` со списком колонок;
- у каждой таблицы свой `id` + sequence;
- `external_id` заполнен;
- `time_code` есть в `dim_time`;
- в PR только эти четыре файла.

[Краткая шпаргалка](cheatsheet.md) и [ответы для сверки](answers.md) — не для копирования в PR.

</section>

<section class="mission-step" data-step="7" data-kind="defend" data-require-check markdown="1">

<span class="mission-label">Защита · 5 минут</span>

## Что спросит учитель

<textarea class="mission-textarea" data-save="defend-1" placeholder="Чем OLAP отличается от OLTP в твоих словах?"></textarea>
<textarea class="mission-textarea" data-save="defend-2" placeholder="Зачем external_id, если есть свой id?"></textarea>
<textarea class="mission-textarea" data-save="defend-3" placeholder="Почему конец месяца — последнее число, а не первое следующего?"></textarea>
<textarea class="mission-textarea" data-save="defend-4" placeholder="Почему факт не хранит название товара, а хранит product_id?"></textarea>
<textarea class="mission-textarea" data-save="defend-5" placeholder="Что сломается, если time_code не будет в dim_time?"></textarea>

```quiz
{
  "title": "Защита · OLAP",
  "min": 80,
  "questions": [
    {"type":"choice","q":"Чем OLAP отличается от OLTP?","options":["OLAP — для анализа и агрегатов, OLTP — для операций","OLAP — только для PostgreSQL","OLTP — только для MSSQL","Они одинаковые"],"answer":0,"explain":"В OLTP много транзакций, в OLAP — измерения и факты для отчётов."},
    {"type":"choice","q":"Зачем в измерении external_id?","options":["Чтобы хранить код из источника","Чтобы заменить primary key","Чтобы ускорить select","Чтобы хранить пароль"],"answer":0,"explain":"Свой id — для PostgreSQL, external_id — связь с MSSQL."},
    {"type":"choice","q":"Что такое факт?","options":["Таблица с числами и ключами измерений","Справочник названий","Настройки базы","Журнал ошибок"],"answer":0,"explain":"Факт хранит метрики: количество, сумма и ссылки на измерения."},
    {"type":"choice","q":"Почему конец месяца = начало + 1 month - 1 day?","options":["Чтобы получить последнее число месяца","Чтобы получить первое число следующего","Чтобы убрать время","Чтобы получить квартал"],"answer":0,"explain":"Иначе получится первое число следующего месяца."},
    {"type":"choice","q":"Как получить номер квартала в PostgreSQL?","options":["extract(quarter from d)","datepart(q, d)","quarter(d)","to_char(d, 'QQ')"],"answer":0,"explain":"В PostgreSQL используется extract(quarter from date)."},
    {"type":"truefalse","q":"Можно хранить в факте название товара вместо product_id.","answer":false,"explain":"Название — в измерении product; в факте должен быть ключ."},
    {"type":"choice","q":"Что не должно попасть в PR?","options":["Файлы курса и classwork","01_olap_ddl.sql","03_load.sql","04_dim_time.sql"],"answer":0,"explain":"В PR только четыре скрипта этого ДЗ."}
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

<p class="mission-hint" data-hint>Сначала пример. Потом свой код.</p>

<div class="mission-done" data-complete hidden>
  <strong>OLAP-перенос собран</strong>
  <p>Четыре скрипта, измерения, время и факты — можно проверять.</p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="answers/">Ответы для сверки</a>
    <a class="button" href="../">Все SQL-заходы</a>
  </div>
</div>

</div>
