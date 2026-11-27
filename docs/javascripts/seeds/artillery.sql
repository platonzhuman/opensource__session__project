-- ============================================================================
-- Песочница: НОРМАЛИЗОВАННАЯ база «Артиллерия» с данными.
-- Это состояние ПОСЛЕ второй миграции: справочники единиц и типов параметров,
-- параметры в формате EAV (одна строка = один параметр одной пачки).
-- Используется в упражнениях частей I, III и IV.
-- ============================================================================

drop table if exists measurment_input_params;
drop table if exists measurment_baths;
drop table if exists parameter_types;
drop table if exists units;
drop table if exists base_units;
drop table if exists measurment_types;
drop table if exists employees;
drop table if exists military_ranks;

-- 1. Должности
create table military_ranks
(
    id          integer not null,
    description character varying(255) not null,
    constraint pk_military_ranks primary key (id),
    constraint uq_military_ranks_description unique (description)
);
insert into military_ranks (id, description) values
    (1, 'Рядовой'),
    (2, 'Лейтенант'),
    (3, 'Капитан');

-- 2. Сотрудники
create table employees
(
    id               integer not null,
    name             text not null,
    birthday         timestamp,
    military_rank_id integer not null,
    constraint pk_employees primary key (id),
    constraint fk_employees_military_ranks
        foreign key (military_rank_id) references military_ranks (id)
);
insert into employees (id, name, birthday, military_rank_id) values
    (1, 'Воловиков Александр Сергеевич', '1978-06-24', 2),
    (2, 'Петров Пётр Иванович',          '1990-03-15', 1),
    (3, 'Сидоров Сидор Сидорович',       '1985-11-02', 3);

-- 3. Измерительное оборудование
create table measurment_types
(
    id          integer not null,
    short_name  character varying(50) not null,
    description text,
    constraint pk_measurment_types primary key (id),
    constraint uq_measurment_types_short_name unique (short_name)
);
insert into measurment_types (id, short_name, description) values
    (1, 'ДМК', 'Десантный метео комплекс'),
    (2, 'ВР',  'Ветровое ружье');

-- 4. Базовые единицы измерения (физические величины)
create table base_units
(
    id   integer not null,
    name character varying(100) not null,
    constraint pk_base_units primary key (id),
    constraint uq_base_units_name unique (name)
);
insert into base_units (id, name) values
    (1, 'Длина'),
    (2, 'Температура'),
    (3, 'Давление'),
    (4, 'Плоский угол'),
    (5, 'Скорость');

-- 5. Единицы измерения (привязаны к базовой величине)
create table units
(
    id           integer not null,
    base_unit_id integer not null,
    name         character varying(100) not null,
    short_name   character varying(20) not null,
    constraint pk_units primary key (id),
    constraint uq_units_short_name unique (short_name),
    constraint fk_units_base_units
        foreign key (base_unit_id) references base_units (id)
);
insert into units (id, base_unit_id, name, short_name) values
    (1, 1, 'метр', 'м'),
    (2, 2, 'градус Цельсия', '°C'),
    (3, 3, 'миллиметр ртутного столба', 'мм рт. ст.'),
    (4, 4, 'большое деление угломера', 'б. д. у.'),
    (5, 5, 'метр в секунду', 'м/с');

-- 6. Типы параметров (привязаны к единице измерения)
create table parameter_types
(
    id      integer not null,
    unit_id integer not null,
    name    character varying(150) not null,
    constraint pk_parameter_types primary key (id),
    constraint uq_parameter_types_name unique (name),
    constraint fk_parameter_types_units
        foreign key (unit_id) references units (id)
);
insert into parameter_types (id, unit_id, name) values
    (1, 1, 'Высота метеопоста'),
    (2, 2, 'Температура воздуха на высоте метеопоста'),
    (3, 3, 'Давление атмосферы на высоте метеопоста'),
    (4, 4, 'Направление ветра в приземном слое воздуха'),
    (5, 5, 'Скорость ветра в приземном слое воздуха'),
    (6, 1, 'Дальность сноса пуль');

-- 7. Пачки (один сеанс измерения)
create table measurment_baths
(
    id                  integer not null,
    emploee_id          integer not null,
    measurment_type_id  integer not null,
    started             timestamp not null,
    constraint pk_measurment_baths primary key (id),
    constraint fk_measurment_baths_employees
        foreign key (emploee_id) references employees (id),
    constraint fk_measurment_baths_measurment_types
        foreign key (measurment_type_id) references measurment_types (id)
);
insert into measurment_baths (id, emploee_id, measurment_type_id, started) values
    (1, 1, 1, '2026-09-01 08:30:00'),
    (2, 1, 2, '2026-09-02 09:15:00'),
    (3, 2, 1, '2026-09-03 07:45:00'),
    (4, 3, 1, '2026-09-04 10:20:00'),
    (5, 2, 2, '2026-09-05 06:50:00');

-- 8. Параметры (EAV: одна строка = один параметр одной пачки)
create table measurment_input_params
(
    id                 integer not null,
    measurment_bath_id integer not null,
    parameter_type_id  integer not null,
    value              numeric(8,2) not null,
    constraint pk_measurment_input_params primary key (id),
    constraint fk_mip_measurment_baths
        foreign key (measurment_bath_id) references measurment_baths (id),
    constraint fk_mip_parameter_types
        foreign key (parameter_type_id) references parameter_types (id)
);

insert into measurment_input_params (id, measurment_bath_id, parameter_type_id, value) values
    -- пачка 1, ДМК
    (1,  1, 1, 100.00),
    (2,  1, 2, 15.00),
    (3,  1, 3, 750.00),
    (4,  1, 4, 12.00),
    (5,  1, 5, 5.00),
    -- пачка 2, ВР
    (6,  2, 1, 120.00),
    (7,  2, 2, 18.50),
    (8,  2, 3, 745.00),
    (9,  2, 4, 30.00),
    (10, 2, 6, 45.00),
    -- пачка 3, ДМК
    (11, 3, 1, 95.00),
    (12, 3, 2, -3.50),
    (13, 3, 3, 760.00),
    (14, 3, 4, 0.00),
    (15, 3, 5, 0.00),
    -- пачка 4, ДМК
    (16, 4, 1, 110.00),
    (17, 4, 2, 25.00),
    (18, 4, 3, 735.00),
    (19, 4, 4, 45.00),
    (20, 4, 5, 12.00),
    -- пачка 5, ВР
    (21, 5, 1, 100.00),
    (22, 5, 2, 10.00),
    (23, 5, 3, 752.00),
    (24, 5, 4, 15.00),
    (25, 5, 6, 80.00);
