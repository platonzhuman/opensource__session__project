# 8. ALTER TABLE: добавляем ключи существующим таблицам

Таблицы первого скрипта уже созданы и уже содержат данные. Добавить ключи можно
командой `ALTER TABLE` — не пересоздавая таблицу.

!!! abstract "Цель урока"
    Ты научишься добавлять `PRIMARY KEY` и `FOREIGN KEY` к уже существующим таблицам
    и поймёшь, в каком порядке это делать.

## Шаг 1 · Добавить первичный ключ

!!! tip "Правило"
    `alter table <таблица> add constraint <имя> primary key (<столбец>);`

```sqlplay
-- @seed base
create table departments (
    id   integer,
    name character varying(100)
);
insert into departments (id, name) values (1, 'Метео'), (2, 'Артиллерия');

alter table departments
    add constraint pk_departments primary key (id);

select constraint_name, constraint_type
from information_schema.table_constraints
where table_name = 'departments';
```

!!! question "Сделай"
    Что изменилось в таблице `departments`?

??? success "Проверить"
    Появилось ограничение `pk_departments` типа `primary key`. Данные не тронуты,
    структура изменена «на месте».

## Шаг 2 · Добавить внешний ключ

Внешний ключ требует, чтобы ссылки уже были валидны, и чтобы родительский ключ
существовал.

```sqlplay
-- @seed base
create table departments (id integer, name character varying(100));
insert into departments (id, name) values (1, 'Метео'), (2, 'Артиллерия');
alter table departments add constraint pk_departments primary key (id);

create table workers (
    id            integer,
    name          text,
    department_id integer
);
insert into workers (id, name, department_id) values (1, 'Иванов', 1), (2, 'Петров', 2);

alter table workers
    add constraint fk_workers_departments
    foreign key (department_id) references departments (id);

select * from workers order by id;
```

!!! question "Сделай"
    Почему `workers` можно создать до `alter` на `departments`, но внешний ключ
    добавить только после `primary key`?

??? success "Проверить"
    Внешний ключ ссылается на **уникальный** столбец родителя. Пока нет `primary key`,
    ссылаться не на что.

## Шаг 3 · Порядок и проверка данных

`alter table ... add constraint` проверяет существующие строки. Если данные не
подходят — команда упадёт.

!!! question "Сделай"
    Предскажи: что будет, если добавить `primary key` на таблицу с дублями `id`?

??? success "Проверить"
    Ошибка уникальности. Сначала нужно убрать дубли, потом добавлять ключ.

## Шаг 4 · Задание: ключи для таблиц первого скрипта

!!! question "Сделай"
    В базе `base` добавь ключи:

    - `military_ranks`: `primary key` на `id`;
    - `employees`: `primary key` на `id` и `foreign key` `military_rank_id` →
      `military_ranks(id)`;
    - `measurment_types`: `primary key` на `id` и `unique` на `short_name`;
    - `measurment_baths`: `primary key` на `id`, `foreign key` `emploee_id` →
      `employees(id)`, `foreign key` `measurment_type_id` → `measurment_types(id)`.

    Подсказка: порядок — сначала `primary key` родителя, потом `foreign key` ребёнка.

??? success "Проверить"
    Проверь результат:

    ```sql
    select table_name, constraint_type, constraint_name
    from information_schema.table_constraints
    where table_schema = 'public'
    order by table_name, constraint_type;
    ```

    Полное решение — в `answers.md`.

## Шаг 5 · Убедись, что ключи встали

!!! question "Сделай"
    После добавления ключей выведи список ограничений `departments` и `workers`.

```sqlplay
-- @seed base
create table departments (id integer, name character varying(100));
insert into departments (id, name) values (1, 'Метео');
alter table departments add constraint pk_departments primary key (id);
create table workers (id integer, name text, department_id integer);
insert into workers values (1, 'Иванов', 1);
alter table workers add constraint fk_workers_departments
    foreign key (department_id) references departments (id);

select table_name, constraint_type, constraint_name
from information_schema.table_constraints
where table_name in ('departments', 'workers')
order by table_name, constraint_type;
```

??? success "Проверить"
    У `departments` — `PRIMARY KEY`, у `workers` — `PRIMARY KEY` и `FOREIGN KEY`.
    Список ограничений — быстрый способ проверить структуру.

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| `alter table departments` | изменяем существующую таблицу |
| `add constraint pk_departments primary key (id)` | добавляем первичный ключ |
| `add constraint fk_workers_departments foreign key (...) references ...` | добавляем связь |
| `information_schema.table_constraints` | список ограничений базы |

## Откуда числа

Коды `1`, `2` в примере — придуманы для демонстрации. Валидность ссылок проверяется
по реальным данным `base`: `military_rank_id = 2` существует, значит ключ встанет.

## Наивные вопросы

!!! question "Почему `alter`, а не пересоздать таблицу?"
    `alter` сохраняет данные. Пересоздание потребовало бы выгрузить и залить их
    обратно — лишний риск.

!!! question "Что будет со ссылками, если удалить родительскую строку?"
    База не даст удалить, пока на неё ссылаются. Это защита от «висячих» ссылок.

!!! question "Можно ли добавить `not null` через `alter`?"
    Да: `alter table t alter column c set not null;`. Но только если нет `null` в
    данных.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что вернёт попытка добавить `foreign key` на `emploee_id` со
       значением `5`, которого нет в `employees`?
    2. **Объясни**, почему порядок «сначала родитель, потом ребёнок» обязателен.
    3. **Напиши** команду, добавляющую `unique` на `measurment_types.short_name`.

??? success "Проверить"
    1. Ошибка внешнего ключа — ссылка на несуществующую строку.
    2. Внешний ключ ссылается на уникальный столбец родителя; без `primary key`
       родителя ссылаться не на что.
    3. `alter table measurment_types add constraint uq_measurment_types_short_name unique (short_name);`

## Что дальше

Ключи добавлены. Осталась главная часть — превратить пять столбцов-параметров в
строки. Этим займётся `UNION ALL`.
