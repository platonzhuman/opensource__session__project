-- ============================================================================
-- Песочница: состояние ПОСЛЕ первого миграционного скрипта (20260923.sql)
-- Это «как есть» из скрипта преподавателя: без PRIMARY KEY и FOREIGN KEY,
-- а параметры лежат «широкой» таблицей (колонка на каждый параметр).
-- Используется в упражнениях части II (миграция).
-- ============================================================================

drop table if exists military_ranks;
drop table if exists employees;
drop table if exists measurment_types;
drop table if exists measurment_input_params;
drop table if exists measurment_baths;

-- 1. Справочник должностей
create table military_ranks
(
	id integer,
	description character varying(255)
);
insert into military_ranks(id, description)
values(1,'Рядовой'),(2,'Лейтенант');

-- 2. Пользователи
create table employees
(
    id integer,
	name text,
	birthday timestamp,
	military_rank_id integer
);
insert into employees(id, name, birthday, military_rank_id)
values(1, 'Воловиков Александр Сергеевич', '1978-06-24', 2);

-- 3. Измерительное оборудование
create table measurment_types
(
   id integer,
   short_name character varying(50),
   description text
);
insert into measurment_types(id, short_name, description)
values(1, 'ДМК', 'Десантный метео комплекс'),
      (2, 'ВР', 'Ветровое ружье');

-- 4. Таблица с параметрами (широкая)
create table measurment_input_params
(
    id integer,
	measurment_bath_id integer,
	height numeric(8,2) default 0,
	temperature numeric(8,2) default 0,
	pressure numeric(8,2) default 0,
	wind_direction numeric(8,2) default 0,
	wind_speed numeric(8,2) default 0
);
insert into measurment_input_params
    (id, measurment_bath_id, height, temperature, pressure, wind_direction, wind_speed)
values(1, 1, 100, 12, 34, 0.2, 45);

-- 5. Таблица с историей (пачки)
create table measurment_baths
(
	id integer,
	emploee_id integer,
	measurment_type_id integer,
	started timestamp default now()
);
insert into measurment_baths(id, emploee_id, measurment_type_id, started)
values(1, 1, 1, '2026-09-01'),
      (2, 1, 2, '2026-09-02');
