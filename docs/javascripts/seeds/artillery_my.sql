-- ============================================================================
-- Песочница: база измерений (твоя схема) с данными от ИИ.
-- Состояние после: home_work_one -> home_work_two -> home_work_three_dml.
-- ============================================================================

drop table if exists parametrs;
drop table if exists packs;
drop table if exists users;
drop table if exists eq_types;
drop table if exists positions;
drop table if exists parameter_types;
drop table if exists units;
drop table if exists base_units;

-- 1. Должности
create table positions
(
    id   int primary key,
    name varchar(150) not null unique
);
insert into positions (id, name) values
    (1, 'оператор метеопоста'),
    (2, 'начальник метеопоста'),
    (3, 'техник');

-- 2. Оборудование
create table eq_types
(
    id   int primary key,
    name varchar(150) not null unique
);
insert into eq_types (id, name) values
    (1, 'ДМК'),
    (2, 'ВР');

-- 3. Сотрудники
create table users
(
    id          int primary key,
    full_name   varchar(150) not null,
    position_id int references positions (id)
);
insert into users (id, full_name, position_id) values
    (1, 'Иванов Иван', 1),
    (2, 'Петров Пётр', 2),
    (3, 'Сидоров Алексей Викторович', 3);

-- 4. Пачки измерений
create table packs
(
    id         int primary key,
    user_id    int references users (id),
    eq_type_id int references eq_types (id),
    created_on date not null
);
insert into packs (id, user_id, eq_type_id, created_on) values
    (1, 1, 1, date '2026-09-01'),
    (2, 2, 2, date '2026-09-02'),
    (3, 1, 1, date '2026-09-03'),
    (4, 1, 1, date '2026-09-04'),
    (5, 2, 2, date '2026-09-05'),
    (6, 2, 2, date '2026-09-06'),
    (7, 3, 1, date '2026-09-07'),
    (8, 3, 1, date '2026-09-08');

-- 5. Базовые единицы (величины)
create table base_units
(
    id   int primary key,
    name varchar(100) not null unique
);
insert into base_units (id, name) values
    (1, 'длина'),
    (2, 'температура'),
    (3, 'давление'),
    (4, 'плоский угол'),
    (5, 'скорость');

-- 6. Единицы измерения
create table units
(
    id           int primary key,
    base_unit_id int references base_units (id),
    name         varchar(100),
    short_name   varchar(20) unique
);
insert into units (id, base_unit_id, name, short_name) values
    (1, 1, 'метр', 'м'),
    (2, 2, 'градус Цельсия', '°C'),
    (3, 3, 'миллиметр ртутного столба', 'мм рт. ст.'),
    (4, 4, 'большое деление угломера', 'б. д. у.'),
    (5, 5, 'метр в секунду', 'м/с');

-- 7. Типы параметров
create table parameter_types
(
    id      int primary key,
    unit_id int references units (id),
    name    varchar(150) unique
);
insert into parameter_types (id, unit_id, name) values
    (1, 1, 'высота метеопоста'),
    (2, 2, 'температура воздуха на высоте метеопоста'),
    (3, 3, 'давление атмосферы на высоте метеопоста'),
    (4, 4, 'направление ветра в приземном слое воздуха'),
    (5, 5, 'скорость ветра в приземном слое воздуха'),
    (6, 1, 'дальность сноса пуль'),
    (7, 5, 'температура воздуха');

-- 8. Измерения (данные от ИИ)
create table parametrs
(
    id                int primary key,
    pack_id           int references packs (id),
    parameter_type_id int references parameter_types (id),
    value             numeric(8,2)
);
insert into parametrs (id, pack_id, parameter_type_id, value) values
    (1,  1, 1, 100), (2,  1, 2, 15), (3,  1, 3, 750), (4,  1, 4, 0),  (5,  1, 5, 0),
    (6,  2, 1, 100), (7,  2, 2, 12), (8,  2, 3, 760), (9,  2, 4, 20), (10, 2, 6, 45),
    (11, 3, 1, 105), (12, 3, 2, 14), (13, 3, 3, 752), (14, 3, 4, 5),  (15, 3, 5, 3),
    (16, 4, 1, 110), (17, 4, 2, 16), (18, 4, 3, 748), (19, 4, 4, 8),
    (20, 5, 1, 120), (21, 5, 2, 18), (22, 5, 3, 745), (23, 5, 4, 30), (24, 5, 6, 60),
    (25, 6, 1, 115), (26, 6, 2, 20), (27, 6, 3, 740), (28, 6, 4, 25), (29, 6, 6, 90),
    (30, 7, 1, 100), (31, 7, 2, 22), (32, 7, 3, 980), (33, 7, 4, 10), (34, 7, 5, 6);
