# Шпаргалка: готовый скрипт под ТЗ

Полный скрипт домашки: реальные данные из ТЗ, без связей, с уникальными кодами.
Запусти дважды подряд — оба раза должны пройти без ошибок.

## Скрипт

```sql
-- ============================================================
-- Домашка: база метеокомплекса (ТЗ, ДМК/ВР)
-- Запускается повторно, связей (FOREIGN KEY) нет
-- ============================================================

-- 1. Очистка в обратном порядке
drop table if exists parameters;
drop table if exists packs;
drop table if exists users;
drop table if exists positions;
drop table if exists equipment_types;

-- 2. Таблицы: у каждой уникальный код (PRIMARY KEY), без FOREIGN KEY
create table equipment_types (
    id   integer not null,
    name varchar(50) not null,
    constraint pk_equipment_types primary key (id),
    constraint uq_equipment_types_name unique (name)
);

create table positions (
    id   integer not null,
    name varchar(150) not null,
    constraint pk_positions primary key (id),
    constraint uq_positions_name unique (name)
);

create table users (
    id          integer not null,
    full_name   varchar(150) not null,
    position_id integer not null,
    constraint pk_users primary key (id)
);

create table packs (
    id                integer not null,
    user_id           integer not null,
    equipment_type_id integer not null,
    created_on        date not null,
    constraint pk_packs primary key (id)
);

create table parameters (
    id      integer not null,
    pack_id integer not null,
    name    varchar(150) not null,
    unit    varchar(20),
    value   numeric(10,2) not null,
    constraint pk_parameters primary key (id)
);

-- 3. Тестовые данные
insert into equipment_types (id, name) values
    (1, 'ДМК'),
    (2, 'ВР');

insert into positions (id, name) values
    (1, 'Оператор метеопоста'),
    (2, 'Начальник метеопоста'),
    (3, 'Техник');

insert into users (id, full_name, position_id) values
    (1, 'Иванов Иван', 1),
    (2, 'Петров Пётр', 2);

insert into packs (id, user_id, equipment_type_id, created_on) values
    (1, 1, 1, date '2026-09-01'),
    (2, 2, 2, date '2026-09-02');

insert into parameters (id, pack_id, name, unit, value) values
    (1, 1, 'Высота метеопоста', 'м', 100),
    (2, 1, 'Температура воздуха на высоте метеопоста', '°C', 15),
    (3, 1, 'Давление атмосферы на высоте метеопоста', 'мм рт. ст.', 750),
    (4, 1, 'Направление ветра в приземном слое воздуха', 'б. д. у.', 0),
    (5, 1, 'Скорость ветра в приземном слое воздуха', 'м/с', 0),
    (6, 2, 'Высота метеопоста', 'м', 100),
    (7, 2, 'Температура воздуха на высоте метеопоста', '°C', 12),
    (8, 2, 'Давление атмосферы на высоте метеопоста', 'мм рт. ст.', 760),
    (9, 2, 'Направление ветра в приземном слое воздуха', 'б. д. у.', 20),
    (10, 2, 'Дальность сноса пуль', 'м', 45);

-- 4. Проверка: объединение всех таблиц (для скриншота)
select p.id           as pack_id,
       p.created_on,
       u.full_name,
       pos.name       as position,
       et.name        as equipment_type,
       par.name       as parameter,
       par.unit,
       par.value
from packs p
join users u            on p.user_id = u.id
join positions pos      on u.position_id = pos.id
join equipment_types et on p.equipment_type_id = et.id
join parameters par     on par.pack_id = p.id
order by p.id, par.id;
```

## Соответствие имён

| В задании | В скрипте |
|-----------|-----------|
| пачки | `packs` |
| пользователи | `users` |
| должности | `positions` |
| параметры | `parameters` |
| типы оборудования | `equipment_types` |

## Чек-лист перед сдачей

- [ ] Скрипт запускается дважды без ошибок.
- [ ] У каждой таблицы есть `PRIMARY KEY`.
- [ ] `FOREIGN KEY` нет нигде.
- [ ] В `parameters` есть `value` со значениями.
- [ ] Типы оборудования — `ДМК` и `ВР`.
- [ ] `SELECT` возвращает данные из всех пяти таблиц.
- [ ] Сделан скриншот результата.
- [ ] Файл имеет расширение `.sql`.
- [ ] Работа в отдельной ветке, создан Pull Request.
