---
title: "Front → OLAP: ответы"
hide:
  - navigation
---

# Front → OLAP: ответы

!!! warning "Сначала свой код"
    Это сверка, а не файл для PR. В PR — только четыре скрипта домашки.

## Измерения

```sql
-- @id dim-ranges
do $$
begin
	begin
		drop table if exists dim_ranges cascade;
		drop sequence if exists seq_dim_ranges;
		create sequence seq_dim_ranges;
		create table dim_ranges (
			id bigint primary key default nextval('seq_dim_ranges'),
			external_id bigint,
			name text,
			factor float,
			date_add timestamp default now()
		);
	end;
	commit;

	begin
		insert into dim_ranges (external_id, name, factor)
		select id, sizeid, portionrate
		from src_size;
	end;
	commit;
end $$;

select count(*) as ranges from dim_ranges;
```

## Источник MSSQL

```tsql
-- @id source-size
select top 5 id, sizeid, portionrate
from dbo.size
order by id;
```

## Время

```sql
-- @id dim-time
do $$
begin
	begin
		drop table if exists dim_time cascade;
		create table dim_time (
			code integer primary key,
			month_start date not null,
			month_end date not null,
			month_name text not null,
			year integer not null,
			quarter_number integer not null,
			quarter_name text not null
		);
	end;
	commit;

	begin
		insert into dim_time (code, month_start, month_end, month_name, year, quarter_number, quarter_name)
		select
			to_char(d, 'YYYYMM')::int,
			d::date,
			(d + interval '1 month - 1 day')::date,
			to_char(d, 'TMMonth'),
			extract(year from d)::int,
			extract(quarter from d)::int,
			'Q' || extract(quarter from d)::int
		from generate_series('2024-01-01'::date, '2024-12-01'::date, interval '1 month') g(d);
	end;
	commit;
end $$;

select count(*) as months,
       to_char(min(month_start), 'YYYY-MM-DD') as first_start,
       to_char(max(month_end), 'YYYY-MM-DD') as last_end
from dim_time;
```

## Факт продаж

```sql
-- @id fact-sales
do $$
begin
	begin
		drop table if exists fact_sales cascade;
		drop sequence if exists seq_fact_sales;
		create sequence seq_fact_sales;
		create table fact_sales (
			id bigint primary key default nextval('seq_fact_sales'),
			time_code integer not null,
			product_id bigint not null,
			doc_id bigint,
			qty numeric(12,3),
			amount numeric(12,2)
		);
	end;
	commit;

	begin
		insert into fact_sales (time_code, product_id, doc_id, qty, amount)
		select
			to_char(dt, 'YYYYMM')::int,
			product_id,
			doc_id,
			qty,
			amount
		from src_sales;
	end;
	commit;
end $$;

select count(*) as rows, sum(amount)::int as amount
from fact_sales;
```

## Что нельзя копировать без понимания

- `external_id` — код из MSSQL, `id` — свой ключ PostgreSQL.
- `month_end` — последнее число месяца, а не первое следующего.
- `time_code` — `YYYYMM`, по нему факт связан с `dim_time`.
- В факте хранятся ключи и числа, а не названия товаров.
