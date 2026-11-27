# Шпаргалка

Короткая справка по синтаксису для домашки.

## DML — данные

```sql
insert into users (id, full_name, position_id) values (3, 'Сидоров', 3);
insert into parametrs (id, pack_id, parameter_type_id, value) values (35, 8, 1, 100);
update parametrs set value = 101 where id = 35;
delete from parametrs where id = 35;
```

## Агрегаты и группировка

```sql
select user_id, count(*) from packs group by user_id;
select user_id, count(*) from packs group by user_id having count(*) > 2;
select count(distinct cnt) from (
    select count(*) as cnt from packs group by user_id
) t;
```

## `where` и `having`

```sql
-- where — до группировки (по строкам)
select * from parametrs where value > 900;

-- having — после группировки (по группам)
select pack_id from parametrs group by pack_id having count(*) <> 5;
```

## `left join` и пустые пачки

```sql
select p.id
from packs p
left join parametrs par on par.pack_id = p.id
where par.id is null;

-- то же через not exists
select p.id from packs p
where not exists (select 1 from parametrs par where par.pack_id = p.id);
```

## Диапазоны

```sql
where value between 500 and 900;
where value not between 500 and 900;
where value < 500 or value > 900;
```

## NULL

```sql
where value is null;
where value is not null;
coalesce(value, 0);
```

## Сверка единиц

```sql
select pt.name, un.short_name
from parameter_types pt
join units un on un.id = pt.unit_id
where pt.name like 'температура%' and un.short_name <> '°C';
```

## Полезные запросы

```sql
-- все пачки
select * from packs order by id;

-- измерения одной пачки
select * from parametrs where pack_id = 8;

-- измерения с параметром
select par.*, pt.name, un.short_name
from parametrs par
join parameter_types pt on pt.id = par.parameter_type_id
join units un on un.id = pt.unit_id
order by par.id;
```

## Требования домашки — чек-лист

- [ ] DML-скрипт с данными (от ИИ) + промт в PR
- [ ] проверка 1: одинаковое число измерений у пользователей
- [ ] проверка 2: пустые пачки
- [ ] проверка 3: полный набор параметров (5)
- [ ] проверка 4: значения в диапазонах
- [ ] проверка 5: корректные единицы
- [ ] скриншот к каждому запросу
- [ ] отдельный Pull Request
