# Шпаргалка

Короткая справка по синтаксису для домашки.

## PL/pgSQL: блок

```sql
do $$
declare
	n integer := 1;
begin
	raise notice 'n = %', n;
end $$;
```

## Транзакции

```sql
begin;
-- команды
commit;      -- сохранить
-- rollback; -- отменить
```

Три отдельные транзакции = три пары `begin…commit`, в каждой свой `do $$ … $$`.

## Счётчики (sequence)

```sql
create sequence seq_users;
alter table users alter column id set default nextval('seq_users');
```

## Структура

```sql
create table users(id integer, full_name varchar(150), position_id integer);
```

## Данные

```sql
insert into users (full_name, position_id) values ('Иванов', 1);
```

## Связи и ограничения

```sql
alter table users add primary key (id);
alter table users add foreign key (position_id) references positions (id);
alter table users alter column full_name set not null;
alter table units add constraint uq_units_short_name unique (short_name);
```

## Метаданные

```sql
-- таблицы
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;

-- столбцы
select table_name, column_name, data_type from information_schema.columns
where table_schema = 'public' order by table_name, ordinal_position;

-- формат «№ / Наименование / Тип»
select row_number() over (order by name) as "№", name as "Наименование", type as "Тип"
from (
    select table_name as name, 'Таблица' as type
    from information_schema.tables where table_schema = 'public'
    union all
    select column_name, 'Столбец'
    from information_schema.columns where table_schema = 'public'
) t;
```

## Полезные запросы

```sql
-- проверить счётчик
select last_value from seq_users;

-- посмотреть таблицу
select * from users;

-- описание таблицы
\d users
```

## Требования домашки — чек-лист

- [ ] `home_work_four`: три транзакции `begin…commit`
- [ ] структура со счётчиками
- [ ] тестовые данные (без `id`)
- [ ] связи и ограничения в третьей транзакции
- [ ] таблица температуры (7 строк)
- [ ] `home_work_four_metadata` в формате «№ / Наименование / Тип»
- [ ] ER-диаграмма (pgAdmin ERD Tool) + скриншот
- [ ] отдельный Pull Request без лишних файлов
