-- ============================================================================
-- Песочница для миссии «ДЗ 6: ошибки и Метео»
-- Базовая схема измерений + таблицы правил/требований/температур/констант.
-- ============================================================================

drop table if exists parametrs;
drop table if exists packs;
drop table if exists users;
drop table if exists eq_types;
drop table if exists positions;
drop table if exists parameter_types;
drop table if exists units;
drop table if exists base_units;
drop table if exists parameter_validation;
drop table if exists equipment_parameter_requirements;
drop table if exists temperature_correction;
drop table if exists meteo_constants;
drop type if exists interpolation_type cascade;

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

-- 5. Базовые единицы
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
    (6, 1, 'дальность сноса пуль');

-- 8. Измерения
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

-- 9. Правила проверки входных параметров
create table parameter_validation
(
    parameter_type_id int primary key references parameter_types (id),
    min_value         numeric,
    max_value         numeric,
    scale             smallint not null default 0,
    error_message     text not null,
    check (scale >= 0),
    check (min_value is null or max_value is null or min_value <= max_value)
);
insert into parameter_validation
    (parameter_type_id, min_value, max_value, scale, error_message)
values
    (1, null, null, 0, 'Высота метеопоста должна быть целым числом'),
    (2, -58, 58, 1, 'Температура должна быть числом от -58 до 58 с одним знаком после запятой'),
    (3, 500, 900, 0, 'Давление должно быть целым числом от 500 до 900'),
    (4, 0, 59, 0, 'Направление ветра должно быть целым числом от 0 до 59'),
    (5, 0, 15, 0, 'Скорость ветра должна быть целым числом от 0 до 15'),
    (6, 0, 150, 0, 'Дальность сноса пуль должна быть целым числом от 0 до 150');

-- 10. Комплект параметров по типу оборудования
create table equipment_parameter_requirements
(
    eq_type_id        int not null references eq_types (id),
    parameter_type_id int not null references parameter_types (id),
    primary key (eq_type_id, parameter_type_id)
);
insert into equipment_parameter_requirements (eq_type_id, parameter_type_id) values
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),   -- ДМК
    (2, 1), (2, 2), (2, 3), (2, 4), (2, 6);   -- ВР

-- 11. Таблица 1 ТЗ: поправка ΔT_V по температуре
create table temperature_correction
(
    id       int primary key,
    t0_from  numeric,
    t0_to    numeric,
    delta_tv numeric not null
);
insert into temperature_correction (id, t0_from, t0_to, delta_tv) values
    (1, null, 0,  0),
    (2, 0,    5,  0.5),
    (3, 10,   15, 1),
    (4, 20,   20, 1.5),
    (5, 25,   25, 2),
    (6, 30,   30, 3.5),
    (7, 40,   40, 4.5);

-- 12. Константы метеорасчёта
create table meteo_constants
(
    code        text primary key,
    value       numeric not null,
    description text
);
insert into meteo_constants (code, value, description) values
    ('pressure_base', 750, 'Табличное наземное давление, мм рт. ст.'),
    ('temperature_base', 15.9, 'Табличная наземная виртуальная температура, °C');

-- 13. Тип и функции интерполяции из ДЗ-5 (уже есть в твоей базе)
create type interpolation_type as
(
    x0 numeric, y0 numeric,
    x1 numeric, y1 numeric
);

create function get_interpolation_type_correction(par_temperature numeric)
returns interpolation_type
language plpgsql
stable
as $body$
declare
    v interpolation_type;
begin
    if par_temperature < 0 then
        v.x0 := 0; v.y0 := 0;
        v.x1 := 0; v.y1 := 0;
        return v;
    end if;

    select t.x0, t.y0, t.x1, t.y1
    into v.x0, v.y0, v.x1, v.y1
    from (
        select t0_from as x0,
               delta_tv as y0,
               lead(t0_from) over (order by t0_from) as x1,
               lead(delta_tv) over (order by t0_from) as y1
        from temperature_correction
        where t0_from is not null
    ) t
    where t.x0 <= par_temperature
      and (t.x1 > par_temperature or t.x1 is null)
    order by t.x0 desc
    limit 1;

    return v;
end
$body$;

create function interpolate(par_x numeric, par_point interpolation_type)
returns numeric
language plpgsql
stable
as $body$
declare
    dx numeric := par_point.x1 - par_point.x0;
    dy numeric := par_point.y1 - par_point.y0;
begin
    if dx = 0 or dx is null then
        return par_point.y0;
    end if;
    return par_point.y0 + (par_x - par_point.x0) * dy / dx;
end
$body$;
