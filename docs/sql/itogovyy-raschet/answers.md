---
title: "Итоговый расчёт: ответы"
hide:
  - navigation
---

# Итоговый расчёт: ответы

!!! warning "Сначала свой код"
    Сюда — после трёх попыток или чтобы сверить. В PR не класть.
    Порядок: classwork внутри homework → правки → заголовки → функция → тест.

## Кусок 1 — недочёты

```sql
-- @id find-t2-40
select h.height, c.row_values[13] as val
from calc_correction c
join calc_correction_heights h on h.id = c.height_id
where c.type_id = 8
order by h.height;
```

```sql
-- @id find-t2-40-fix
select h.height, c.row_values[13] as val
from calc_correction c
join calc_correction_heights h on h.id = c.height_id
where c.type_id = 8
order by h.height;
```

```sql
-- @id find-types
select c.type_id, t.description, count(*) as cnt
from calc_correction c
join calc_correction_types t on t.id = c.type_id
group by c.type_id, t.description
order by c.type_id;
```

## Кусок 2 — исправления

```sql
-- @id fix-types
do $$
begin
	begin
		update calc_correction set type_id = 9 where type_id = 8;
		update calc_correction set type_id = 8 where type_id = 7 and row_values[2] is not null;
	end;
	commit;
end $$;

select type_id, count(*) as cnt
from calc_correction
group by type_id
order by type_id;
```

```sql
-- @id fix-types-order
do $$
begin
	begin
		update calc_correction set type_id = 9 where type_id = 8;
		update calc_correction set type_id = 8 where type_id = 7 and row_values[2] is not null;
	end;
	commit;
end $$;

select type_id, count(*) as cnt
from calc_correction
group by type_id
order by type_id;
```

```sql
-- @id fix-values
do $$
begin
	begin
		update calc_correction set type_id = 9 where type_id = 8;
		update calc_correction set type_id = 8 where type_id = 7 and row_values[2] is not null;
	end;
	begin
		update calc_correction set row_values[13] = -38 where type_id = 9 and height_id = 2;
		update calc_correction set row_values[9] = 22 where type_id = 6 and height_id = 4;
	end;
	commit;
end $$;

select type_id, height_id, row_values[13] as v13, row_values[9] as v9
from calc_correction
where (type_id = 9 and height_id = 2) or (type_id = 6 and height_id = 4)
order by type_id;
```

Высоты 1600–4000 — с картинок (см. эталон `/tmp/fl/ref_final.sql` или ответы прошлого прогона).

## Кусок 3 — заголовки

```sql
-- @id headers-create
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
		comment on table calc_correction_headers is 'Заголовки справочников';

		insert into calc_correction_headers (description, header_values)
		values
		('Таблица 2, отклонение температуры', array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50]),
		('Таблица 3, скорость приземного ветра V0 (ДМК)', array[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
		('Таблица 3, дальность сноса пуль Дг (ВР)', array[40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]);
	end;
	commit;
end $$;

select id, header_values[1] as first, header_values[10] as tenth
from calc_correction_headers
order by id;
```

```sql
-- @id headers-fix-distinct
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
		comment on table calc_correction_headers is 'Заголовки справочников';

		insert into calc_correction_headers (description, header_values)
		values
		('Таблица 2, отклонение температуры', array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50]),
		('Таблица 3, скорость приземного ветра V0 (ДМК)', array[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
		('Таблица 3, дальность сноса пуль Дг (ВР)', array[40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]);
	end;
	commit;
end $$;

select id, header_values[1] as first, header_values[10] as tenth
from calc_correction_headers
order by id;
```

```sql
-- @id headers-link
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
		comment on table calc_correction_headers is 'Заголовки справочников';

		insert into calc_correction_headers (description, header_values)
		values
		('Таблица 2, отклонение температуры', array[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50]),
		('Таблица 3, скорость приземного ветра V0 (ДМК)', array[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
		('Таблица 3, дальность сноса пуль Дг (ВР)', array[40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]);
	end;

	begin
		alter table calc_correction_types add column header_id integer references calc_correction_headers (id);
		update calc_correction_types set header_id = 1 where id in (1, 8, 9);
		update calc_correction_types set header_id = 2 where id = 6;
		update calc_correction_types set header_id = 3 where id = 4;
		alter table calc_correction_types drop column header_values;
		comment on column calc_correction_types.header_id is 'Код заголовка';
	end;
	commit;
end $$;

select id, header_id
from calc_correction_types
order by id;
```

## Кусок 4 — расчёт

```sql
-- @id speed-dmk
select h.height, c.row_values[array_position(hd.header_values, 6)] as speed
from calc_correction c
join calc_correction_types t on t.id = c.type_id
join calc_correction_headers hd on hd.id = t.header_id
join calc_correction_heights h on h.id = c.height_id
where c.type_id = 6
order by h.height;
```

```sql
-- @id speed-dmk-fix
select h.height, c.row_values[array_position(hd.header_values, 6)] as speed
from calc_correction c
join calc_correction_types t on t.id = c.type_id
join calc_correction_headers hd on hd.id = t.header_id
join calc_correction_heights h on h.id = c.height_id
where c.type_id = 6
order by h.height;
```

```sql
-- @id temp-minus12
select h.height,
	c.row_values[array_position(hd.header_values, 10)] + c.row_values[array_position(hd.header_values, 2)] as val,
	case
		when c.row_values[array_position(hd.header_values, 10)] + c.row_values[array_position(hd.header_values, 2)] < 0
		then 50 + abs(c.row_values[array_position(hd.header_values, 10)] + c.row_values[array_position(hd.header_values, 2)])
		else c.row_values[array_position(hd.header_values, 10)] + c.row_values[array_position(hd.header_values, 2)]
	end as code
from calc_correction c
join calc_correction_types t on t.id = c.type_id
join calc_correction_headers hd on hd.id = t.header_id
join calc_correction_heights h on h.id = c.height_id
where c.type_id = 9
order by h.height;
```

```sql
-- @id fn-speed
do $$
begin
	begin
		create type calc_speed_type as (height integer, wind_speed integer);
		create function fn_calc_speed(par_equipment_id integer, par_wind integer)
		returns setof calc_speed_type
		language plpgsql
		as $body$
		begin
			return query
			select h.height, c.row_values[array_position(hd.header_values, par_wind)]
			from calc_correction c
			join calc_correction_types t on t.id = c.type_id
			join calc_correction_headers hd on hd.id = t.header_id
			join calc_correction_heights h on h.id = c.height_id
			where t.parent_id = 2 and t.measurment_equipment_id = par_equipment_id
			order by h.height;
		end;
		$body$;
	end;
	commit;
end $$;

select height, wind_speed from fn_calc_speed(1, 6);
```

```sql
-- @id direction-58
select h.height,
	case
		when 58 + c.row_values[1] > 59 then 58 + c.row_values[1] - 60
		else 58 + c.row_values[1]
	end as direction
from calc_correction c
join calc_correction_heights h on h.id = c.height_id
where c.type_id = 7
order by h.height;
```

## Сборка

```sql
-- @id fn-final
do $$
begin
	begin
		create type calc_meteo_result_type as
		(
			height integer,
			temperature integer,
			wind_direction integer,
			wind_speed integer
		);

		create function public.fn_calc_meteo_average(
			par_params input_params_type,
			par_equipment_id integer)
		returns setof calc_meteo_result_type
		language plpgsql
		as $body$
		declare
			var_dt integer;
			var_tens integer;
			var_units integer;
			var_wind integer;
		begin
			var_dt := round(public.fn_calc_header_temperature(par_params.temperature));
			var_tens := (abs(var_dt) / 10) * 10;
			var_units := abs(var_dt) - var_tens;

			if par_equipment_id = 1 then
				var_wind := par_params.wind_speed;
			else
				var_wind := round(par_params.bullet_demolition_range / 10) * 10;
			end if;

			return query
			with temperature as (
				select c.height_id,
					coalesce(c.row_values[array_position(hd.header_values, var_tens)], 0)
					+ coalesce(c.row_values[array_position(hd.header_values, var_units)], 0) as value
				from calc_correction c
				join calc_correction_types t on t.id = c.type_id
				join calc_correction_headers hd on hd.id = t.header_id
				where c.type_id = case when var_dt < 0 then 9 else 8 end
			),
			speed as (
				select c.height_id,
					c.row_values[array_position(hd.header_values, var_wind)] as value
				from calc_correction c
				join calc_correction_types t on t.id = c.type_id
				join calc_correction_headers hd on hd.id = t.header_id
				where t.parent_id = 2 and t.measurment_equipment_id = par_equipment_id
			),
			direction as (
				select c.height_id, c.row_values[1] as value
				from calc_correction c
				join calc_correction_types t on t.id = c.type_id
				where t.parent_id = 3 and t.measurment_equipment_id = par_equipment_id
			)
			select h.height,
				case when tm.value < 0 then 50 + abs(tm.value) else tm.value end,
				case
					when sp.value is null then 0
					when par_params.wind_direction::integer + d.value > 59 then par_params.wind_direction::integer + d.value - 60
					else par_params.wind_direction::integer + d.value
				end,
				coalesce(sp.value, 0)
			from calc_correction_heights h
			left join temperature tm on tm.height_id = h.id
			left join speed sp on sp.height_id = h.id
			left join direction d on d.height_id = h.id
			order by h.height;
		end;
		$body$;

		comment on function public.fn_calc_meteo_average(input_params_type, integer)
		is 'Расчет метеосреднего по стандартным высотам';
	end;
	commit;
end $$;

select height, temperature, wind_direction, wind_speed
from fn_calc_meteo_average((100, 25, 765, 15, 6, 0)::input_params_type, 1);
```
