# Шпаргалка

Короткая справка по синтаксису для домашки.

## DDL — структура

```sql
create table units (
    id           integer not null,
    base_unit_id integer not null,
    name         character varying(100) not null,
    short_name   character varying(20) not null,
    constraint pk_units primary key (id),
    constraint uq_units_short_name unique (short_name),
    constraint fk_units_base_units foreign key (base_unit_id) references base_units (id)
);

alter table employees add constraint pk_employees primary key (id);
alter table employees add constraint fk_employees_rank
    foreign key (military_rank_id) references military_ranks (id);
alter table t add column c integer;
alter table t drop column c;
alter table t rename to t2;
drop table t;
```

## DML — данные

```sql
insert into units (id, base_unit_id, name, short_name) values (1, 1, 'метр', 'м');
update employees set name = 'Иванов' where id = 1;
delete from measurment_input_params where id = 1;
```

## Чтение

```sql
select id, name from employees where military_rank_id = 2 order by name desc;
select distinct measurment_bath_id from measurment_input_params;
select count(*), avg(value) from measurment_input_params group by parameter_type_id
having count(*) > 3;
```

## JOIN (ANSI-92)

```sql
select b.id, e.name
from measurment_baths as b
inner join employees as e            on e.id = b.emploee_id
inner join measurment_types as m     on m.id = b.measurment_type_id
left join measurment_input_params i  on i.measurment_bath_id = b.id;
```

## Unpivot (развернуть столбцы в строки)

```sql
insert into params_new (id, bath_id, parameter_type_id, value)
select (id - 1) * 5 + 1, measurment_bath_id, 1, height         from measurment_input_params
union all
select (id - 1) * 5 + 2, measurment_bath_id, 2, temperature    from measurment_input_params
union all
select (id - 1) * 5 + 3, measurment_bath_id, 3, pressure       from measurment_input_params
union all
select (id - 1) * 5 + 4, measurment_bath_id, 4, wind_direction from measurment_input_params
union all
select (id - 1) * 5 + 5, measurment_bath_id, 5, wind_speed     from measurment_input_params;
```

## Миграция таблицы — порядок

```
1. create table <новая>
2. insert into <новая> select ...   (перенос)
3. delete from <старая>; drop table <старая>;
4. alter table <новая> rename to <рабочее имя>;
```

## NULL

```sql
where value is null;
where value is not null;
coalesce(value, 0);
```

## Транзакция

```sql
begin;
-- команды миграции
commit;      -- или rollback;
```

## Полезные запросы

```sql
-- список таблиц
select table_name from information_schema.tables where table_schema = 'public' order by table_name;

-- ограничения таблицы
select constraint_name, constraint_type from information_schema.table_constraints
where table_name = 'employees';

-- план запроса
explain select * from measurment_input_params where measurment_bath_id = 1;
```

## Требования домашки — чек-лист

- [ ] три справочника: `base_units`, `units`, `parameter_types`
- [ ] у всех таблиц `primary key`, у связей — `foreign key`
- [ ] `measurment_input_params`: `id`, `measurment_bath_id`, `parameter_type_id`, `value`
- [ ] данные перенесены, старые структуры удалены
- [ ] итоговый запрос на `inner join ... on`
- [ ] результат: 5 столбцов, как в задании
- [ ] отдельный Pull Request
