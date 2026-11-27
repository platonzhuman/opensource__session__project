---
title: "Справочники Таблиц 2 и 3: ответы"
hide:
  - navigation
---

# Справочники Таблиц 2 и 3: ответы

!!! warning "Сначала свой код"
    Открывай после трёх попыток или чтобы сверить. В PR не класть.

## Кусок 1

```sql
-- @id read-v0-6
do $$
begin
	begin
		create table demo_good
		(
			id integer not null primary key,
			h integer not null,
			row_values integer[] not null
		);
		insert into demo_good (id, h, row_values)
		values (1, 200, array[4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22]);
	end;
	commit;
end $$;

select row_values[4] as speed
from demo_good;
```

## Кусок 2

```sql
-- @id heights
do $$
begin
	begin
		create sequence calc_correction_height_seq;
		create table calc_correction_heights
		(
			id integer not null primary key default nextval('public.calc_correction_height_seq'),
			height integer not null
		);
		comment on table calc_correction_heights is 'Таблица стандартных высот';
		comment on column calc_correction_heights.id is 'Уникальный код';
		comment on column calc_correction_heights.height is 'Высота';

		insert into calc_correction_heights (height)
		values (200), (400), (800), (1200), (1600), (2000), (2400), (3000), (4000);
	end;
	commit;
end $$;

select count(*) as cnt, min(height) as min_h, max(height) as max_h
from calc_correction_heights;
```

## Кусок 3

```sql
-- @id types
do $$
begin
	begin
		create sequence calc_correction_types_seq;
		create table calc_correction_types
		(
			id integer not null primary key default nextval('public.calc_correction_types_seq'),
			parent_id integer,
			measurment_equipment_id integer,
			description text not null,
			header_values integer[]
		);
		comment on table calc_correction_types is 'Справочник типов таблиц с собственными заголовками';

		insert into calc_correction_types (description, header_values)
		values ('Таблица 2', array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50]);

		insert into calc_correction_types (description, parent_id)
		values
		('Таблица 2, Положительные температуры', 1),
		('Таблица 2, Отрицательные температуры', 1);

		insert into calc_correction_types (description, measurment_equipment_id, header_values)
		values
		('Таблица 3, Скорость среднего ветра (ДМК)', 1, array[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
	end;
	commit;
end $$;

select t.id, t.parent_id, t.measurment_equipment_id as equipment, t.header_values[1] as first
from calc_correction_types t
order by t.id;
```

## Кусок 4

```sql
-- @id corr-neg
do $$
begin
	begin
		create sequence calc_correction_height_seq;
		create table calc_correction_heights
		(
			id integer not null primary key default nextval('public.calc_correction_height_seq'),
			height integer not null
		);
		insert into calc_correction_heights (height)
		values (200), (400), (800), (1200);

		create sequence calc_correction_types_seq;
		create table calc_correction_types
		(
			id integer not null primary key default nextval('public.calc_correction_types_seq'),
			description text not null
		);
		insert into calc_correction_types (description)
		values ('Таблица 2, Отрицательные температуры');

		create sequence calc_correction_seq;
		create table calc_correction
		(
			id integer not null primary key default nextval('public.calc_correction_seq'),
			height_id integer not null references calc_correction_heights (id),
			type_id integer not null references calc_correction_types (id),
			row_values integer[]
		);
		insert into calc_correction (height_id, type_id, row_values)
		values
		(1, 1, array[-1, -2, -3, -4, -5, -6, -7, -8, -8, -9, -20, -29, -39, -49]),
		(2, 1, array[-1, -2, -3, -4, -5, -6, -6, -7, -8, -9, -19, -29, -39, -48]),
		(3, 1, array[-1, -2, -3, -4, -5, -6, -6, -7, -7, -8, -18, -28, -37, -46]),
		(4, 1, array[-1, -2, -3, -4, -4, -5, -5, -6, -7, -8, -17, -26, -35, -44]);
	end;
	commit;
end $$;

select h.height, c.row_values[1] as first, c.row_values[13] as col40
from calc_correction c
join calc_correction_heights h on h.id = c.height_id
order by h.height;
```

## Сборка

Ниже — каркас как у учителя на 4 высоты × 6 типов = 24 строки. Полные 9 высот допиши с картинок.

```sql
-- @id assemble
do $$
begin
	-- структуры
	begin
		create sequence calc_correction_height_seq;
		create table calc_correction_heights
		(
			id integer not null primary key default nextval('public.calc_correction_height_seq'),
			height integer not null
		);
		comment on table calc_correction_heights is 'Таблица стандартных высот';

		insert into calc_correction_heights (height)
		values (200), (400), (800), (1200), (1600), (2000), (2400), (3000), (4000);

		create sequence calc_correction_types_seq;
		create table calc_correction_types
		(
			id integer not null primary key default nextval('public.calc_correction_types_seq'),
			parent_id integer,
			measurment_equipment_id integer references measurment_equipment (id),
			description text not null,
			header_values integer[]
		);
		comment on table calc_correction_types is 'Справочник типов таблиц с собственными заголовками';

		insert into calc_correction_types (description, header_values)
		values
		('Таблица 2', array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50]),
		('Таблица 3, скорость среднего ветра', null),
		('Таблица 3, направление среднего ветра', null);

		insert into calc_correction_types (description, parent_id, measurment_equipment_id, header_values)
		values
		('Таблица 3, Скорость среднего ветра (ВР)', 2, 2, array[40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]),
		('Таблица 3, Направление среднего ветра (ВР)', 3, 2, null),
		('Таблица 3, Скорость среднего ветра (ДМК)', 2, 1, array[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
		('Таблица 3, Направление среднего ветра (ДМК)', 3, 1, null);

		insert into calc_correction_types (description, parent_id)
		values
		('Таблица 2, Положительные температуры', 1),
		('Таблица 2, Отрицательные температуры', 1);

		create sequence calc_correction_seq;
		create table calc_correction
		(
			id integer not null primary key default nextval('public.calc_correction_seq'),
			height_id integer not null references calc_correction_heights (id),
			type_id integer not null references calc_correction_types (id),
			row_values integer[]
		);
		comment on table calc_correction is 'Универсальная таблица корректировок';
	end;

	-- данные на высоты 200..1200
	begin
		insert into calc_correction (height_id, type_id, row_values)
		values
		-- Т2 отрицательные (тип 9)
		(1, 9, array[-1, -2, -3, -4, -5, -6, -7, -8, -9, -9, -20, -29, -39, -49]),
		(2, 9, array[-1, -2, -3, -4, -5, -6, -6, -7, -8, -9, -19, -29, -38, -48]),
		(3, 9, array[-1, -2, -3, -4, -5, -6, -6, -7, -7, -8, -18, -28, -37, -46]),
		(4, 9, array[-1, -2, -3, -4, -4, -5, -5, -6, -7, -8, -17, -26, -35, -44]),
		-- Т2 положительные (тип 8)
		(1, 8, array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30]),
		(2, 8, array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30]),
		(3, 8, array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30]),
		(4, 8, array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30]),
		-- ВР скорость (4)
		(1, 4, array[3, 4, 5, 6, 7, 7, 8, 9, 10, 11, 12, 12]),
		(2, 4, array[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
		(3, 4, array[4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16]),
		(4, 4, array[4, 5, 7, 8, 8, 9, 11, 12, 13, 15, 15, 16]),
		-- ВР направление (5)
		(1, 5, array[0]), (2, 5, array[1]), (3, 5, array[2]), (4, 5, array[2]),
		-- ДМК скорость (6)
		(1, 6, array[4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22]),
		(2, 6, array[5, 7, 10, 11, 12, 14, 17, 18, 20, 22, 23, 25, 27]),
		(3, 6, array[5, 8, 10, 11, 13, 15, 18, 19, 21, 23, 25, 27, 28]),
		(4, 6, array[5, 8, 11, 12, 13, 16, 19, 20, 22, 24, 26, 28, 30]),
		-- ДМК направление (7)
		(1, 7, array[1]), (2, 7, array[2]), (3, 7, array[3]), (4, 7, array[3]);
	end;
	commit;
end $$;

select
	(select count(*) from calc_correction_heights) as heights,
	(select count(*) from calc_correction_types) as types,
	(select count(*) from calc_correction) as rows;
```
