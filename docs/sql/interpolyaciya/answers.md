# Полное решение

Сверяйся **после** собственной попытки. Два скрипта: DDL и проверки.

DDL — **один `do $$` с вложенными транзакциями** (`begin … commit;` внутри) — как
требует учитель.

## Скрипт 1 · `home_work_five`

```sql
-- тип + две функции; один do $$, вложенные транзакции, повторный запуск
do $$
begin
	-- 1. чистим прошлую версию (cascade удалит и функции)
	begin
		drop type if exists public.interpolation_type cascade;
	end;
	commit;

	-- 2. тип-структура для интерполяции
	begin
		create type public.interpolation_type as (
			x0 numeric, y0 numeric,   -- нижняя граница
			x1 numeric, y1 numeric    -- верхняя граница
		);
	end;
	commit;

	-- 3. поиск отрезка по температуре
	begin
		create function public.get_interpolation_type_correction(par_temperature numeric)
		returns public.interpolation_type
		language plpgsql
		as $body$
		declare
			v public.interpolation_type;
		begin
			-- граница «ниже 0»: по ТЗ поправка равна 0
			if par_temperature < 0 then
				v.x0 := 0; v.y0 := 0;
				v.x1 := 0; v.y1 := 0;
				return v;
			end if;

			select t.x0, t.y0, t.x1, t.y1
			into v.x0, v.y0, v.x1, v.y1
			from (
				select temperature as x0,
				       correction  as y0,
				       lead(temperature) over (order by temperature) as x1,
				       lead(correction)  over (order by temperature) as y1
				from public.calc_temperature_correction
			) t
			where t.x0 <= par_temperature and (t.x1 > par_temperature or t.x1 is null)
			order by t.x0 desc
			limit 1;

			return v;
		end
		$body$;
	end;
	commit;

	-- 4. расчёт интерполяции
	begin
		create function public.interpolate(par_x numeric, par_point public.interpolation_type)
		returns numeric
		language plpgsql
		as $body$
		declare
			dx numeric := par_point.x1 - par_point.x0;
			dy numeric := par_point.y1 - par_point.y0;
		begin
			-- x1 = null (верхняя граница таблицы) или деление на ноль
			if dx = 0 or dx is null then
				return par_point.y0;
			end if;

			return par_point.y0 + (par_x - par_point.x0) * dy / dx;
		end
		$body$;
	end;
	commit;
end $$;
```

!!! warning "Запускать на верхнем уровне"
    Весь скрипт — как обычный запрос в pgAdmin. Не оборачивай его в
    `begin; … commit;` — тогда `commit` внутри `do $$` упадёт с
    `invalid transaction termination`.

## Скрипт 2 · `home_work_five_check`

```sql
do $$
declare
	v interpolation_type;
begin
	-- пример из задания: 26° -> 25-2 и 30-3.5
	v := get_interpolation_type_correction(26);
	if v.x0 is distinct from 25 or v.y0 is distinct from 2
	   or v.x1 is distinct from 30 or v.y1 is distinct from 3.5 then
		raise exception 'FAIL 26: получено %-% / %-%', v.x0, v.y0, v.x1, v.y1;
	end if;
	if round(interpolate(26, v), 2) is distinct from 2.3 then
		raise exception 'FAIL y(26) = %', interpolate(26, v);
	end if;

	-- узлы: интерполяция в узле даёт табличное значение
	v := get_interpolation_type_correction(25);
	if interpolate(25, v) is distinct from 2 then
		raise exception 'FAIL y(25) = %', interpolate(25, v);
	end if;

	v := get_interpolation_type_correction(30);
	if interpolate(30, v) is distinct from 3.5 then
		raise exception 'FAIL y(30) = %', interpolate(30, v);
	end if;

	-- границы
	v := get_interpolation_type_correction(-5);
	if interpolate(-5, v) is distinct from 0 then
		raise exception 'FAIL y(-5) = %', interpolate(-5, v);
	end if;

	v := get_interpolation_type_correction(45);
	if interpolate(45, v) is distinct from 4.5 then
		raise exception 'FAIL y(45) = %', interpolate(45, v);
	end if;

	raise notice 'Все проверки пройдены';
end $$;
```

## Как проверить руками

`select` по контрольным температурам:

| `t` | что должно получиться | `y(t)` |
| --- | --- | --- |
| -5 | (0, 0) – (0, 0) | 0 |
| 0 | (0, 0.5) – (5, 0.5) | 0.5 |
| 23 | (20, 1) – (25, 2) | 1.6 |
| 26 | (25, 2) – (30, 3.5) | 2.3 |
| 30 | (30, 3.5) – (40, 4.5) | 3.5 |
| 40 | (40, 4.5) – (NULL, NULL) | 4.5 |
| 45 | (40, 4.5) – (NULL, NULL) | 4.5 |

```sql
select t as "t°", (r).x0, (r).y0, (r).x1, (r).y1, round(interpolate(t, r), 2) as y
from (values (-5), (0), (23), (26), (30), (40), (45)) p(t),
     lateral (select get_interpolation_type_correction(p.t) as r) s;
```

!!! note "Про 23°"
    С таблицей из класса получается `1.6`. Если учитель приведёт таблицу к ТЗ
    (`20 → 1.5`), станет `1.8` — как в примере ТЗ. Проверку для 23° добавляй
    осознанно: она зависит от данных таблицы.
