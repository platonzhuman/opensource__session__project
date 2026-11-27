# Шпаргалка

Короткая справка по синтаксису для домашки.

## Тип-структура

```sql
create type public.interpolation_type as (
	x0 numeric, y0 numeric,
	x1 numeric, y1 numeric
);
```

Доступ к полям: в PL/pgSQL — `v.x0`; в SQL — `(f(...)).x0` или `(f(...)).*`.

## Функция

```sql
create function public.interpolate(par_x numeric, par_segment public.interpolation_type)
returns numeric
language plpgsql
as $body$
begin
	...
end
$body$;
```

## DDL внутри `do $$` — вложенные транзакции

```sql
do $$
begin
	begin
		-- шаг 1
	end;
	commit;

	begin
		-- шаг 2
	end;
	commit;
end $$;
```

Тела функций — в `$body$ … $body$`: если написать `$$` и снаружи, и внутри,
внешний блок закроется раньше времени.

## Повторный запуск

```sql
drop type if exists public.interpolation_type cascade;  -- снесёт и функции
```

## Оконная функция: следующая строка

```sql
lead(temperature) over (order by temperature)   -- следующая температура
lead(correction)  over (order by temperature)   -- следующая поправка
```

## Выбор отрезка по температуре t

```sql
where x0 <= t and (x1 > t or x1 is null)
order by x0 desc
limit 1;
```

## Формула интерполяции

```text
y = y0 + (x - x0) * (y1 - y0) / (x1 - x0)
```

Края: `x = x0 → y0`, `x = x1 → y1`.

## Защита от деления

```sql
if par_segment.x1 is null or par_segment.x1 = par_segment.x0 then
	return par_segment.y0;
end if;
```

## Границы (по ТЗ)

```sql
if par_temperature < 0 then   -- ниже 0 -> поправка 0
	v.x0 := 0; v.y0 := 0; v.x1 := 0; v.y1 := 0;
	return v;
end if;
```

Выше 40 — сработает условие `x1 is null` на последней строке (40, 4.5).

## Проверки

```sql
if <условие провала> then
	raise exception 'FAIL: получено %', значение;
end if;

raise notice 'Все проверки пройдены';   -- успех
```

Сравнение с NULL: `is distinct from` (вместо `<>`).

## Контрольные значения

| `t` | отрезок | `y` |
| --- | --- | --- |
| -5 | (0, 0) – (0, 0) | 0 |
| 0 | (0, 0.5) – (5, 0.5) | 0.5 |
| 26 | (25, 2) – (30, 3.5) | 2.3 |
| 40 | (40, 4.5) – (NULL, NULL) | 4.5 |
| 45 | (40, 4.5) – (NULL, NULL) | 4.5 |
