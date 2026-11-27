---
title: "Front → OLAP: шпаргалка"
hide:
  - navigation
---

# Front → OLAP: шпаргалка

## Четыре файла

```text
01_olap_ddl.sql
02_mssql_source.sql
03_load.sql
04_dim_time.sql
```

## Схема

```text
dim_time      — месяцы, кварталы
dim_ranges    — размеры
dim_categories— категории
dim_vendors   — поставщики
dim_products  — товары
dim_personnel — сотрудники
dim_storages  — склады

fact_purchase — закупка
fact_sales    — продажа
fact_personnel— персонал
fact_inventory— остатки
```

## Правило измерения

```sql
id bigint primary key default nextval('имя_seq'),
external_id bigint,
name text,
date_add timestamp default now()
```

`external_id` — код из MSSQL. `id` — свой ключ PostgreSQL.

## Время

```sql
to_char(d, 'YYYYMM')::int              -- код
d::date                                -- начало месяца
(d + interval '1 month - 1 day')::date -- конец месяца
to_char(d, 'TMMonth')                  -- название месяца
extract(year from d)::int              -- год
extract(quarter from d)::int           -- номер квартала
'Q' || extract(quarter from d)::int    -- название квартала
```

## Проверки перед PR

```sql
select count(*) from dim_time;
select min(month_start), max(month_end) from dim_time;
select count(*), sum(amount) from fact_sales;
select count(*) from fact_purchase;
select count(*) from fact_inventory;
select count(*) from fact_personnel;
```

- `select *` — нет.
- `insert` — со списком колонок.
- `time_code` есть в `dim_time`.
- В PR только четыре SQL-файла.
