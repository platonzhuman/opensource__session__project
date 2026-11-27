# Ответы и разборы

Открывай после попытки. Здесь — решения, полный скрипт миграции и типичные ошибки.

## Ответы теста самопроверки

1. `PRIMARY KEY` — один на таблицу, запрещает `NULL`; `UNIQUE` — ограничений много,
   `NULL` обычно разрешён.
2. Столбец-ссылка на уникальный ключ другой таблицы. Защищает от ссылок на
   несуществующие строки (ссылочная целостность).
3. Таблица в `2НФ`, и ни один не-ключевой столбец не зависит от другого не-ключа.
4. `DDL` меняет структуру (`create`, `alter`, `drop`), `DML` — данные (`insert`,
   `update`, `delete`).
5. Склеивает результаты нескольких `select` в один список. В миграции разворачивает
   пять столбцов-параметров в пять строк.
6. Создать новое → перенести данные → удалить старое → переименовать новое.
7. `inner join` оставляет только совпавшие строки, `left join` сохраняет все строки
   левой таблицы.
8. `where` фильтрует строки до группировки, `having` — группы после.
9. `NULL` — отсутствие значения, сравнение с ним не даёт истину. Нужно `is null`.
10. Чтобы при ошибке на любом шаге откатить всё и не оставить базу в половинчатом
    состоянии (атомарность).
11. План выполнения запроса: как база будет его читать.
12. `VIEW` не хранит данные, а выполняет запрос при обращении; таблица хранит данные.

## Ответы к практике

- **Задание 5:** `select measurment_bath_id, count(*), max(value) from measurment_input_params group by measurment_bath_id order by measurment_bath_id;`
- **Задание 6:** `select parameter_type_id from measurment_input_params group by parameter_type_id having avg(value) > 100;` → параметры `1` и `3`.
- **Задание 7:** `select m.short_name from measurment_types m left join measurment_baths b on b.measurment_type_id = m.id where b.id is null;` → пусто.
- **Задание 9:** `select e.name from employees e inner join measurment_baths b on b.emploee_id = e.id group by e.name having count(*) > 1;` → `Воловиков`, `Петров`.

## Полный миграционный скрипт

Это решение для сверки. Сначала напиши своё и сравни.

```sql
-- ============================================================================
-- Миграционный скрипт №2
-- Нормализация параметров + справочники единиц измерения
-- Выполняется ПОСЛЕ первого скрипта (20260923.sql)
-- ============================================================================

begin;

-- 1. Исправляем структуру существующих таблиц: PK и FK ----------------------
alter table military_ranks
    add constraint pk_military_ranks primary key (id);

alter table employees
    add constraint pk_employees primary key (id);
alter table employees
    add constraint fk_employees_military_ranks
        foreign key (military_rank_id) references military_ranks (id);

alter table measurment_types
    add constraint pk_measurment_types primary key (id);
alter table measurment_types
    add constraint uq_measurment_types_short_name unique (short_name);

alter table measurment_baths
    add constraint pk_measurment_baths primary key (id);
alter table measurment_baths
    add constraint fk_measurment_baths_employees
        foreign key (emploee_id) references employees (id);
alter table measurment_baths
    add constraint fk_measurment_baths_measurment_types
        foreign key (measurment_type_id) references measurment_types (id);

-- 2. Справочник "Базовые единицы измерения" ---------------------------------
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

-- 3. Справочник "Единицы измерения" -----------------------------------------
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

-- 4. Справочник "Типы параметров" -------------------------------------------
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

-- 5. Новая структура параметров (EAV) ---------------------------------------
create table measurment_input_params_new
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

-- 6. Переносим данные (unpivot: 5 колонок -> 5 строк) -----------------------
insert into measurment_input_params_new (id, measurment_bath_id, parameter_type_id, value)
select (id - 1) * 5 + 1, measurment_bath_id, 1, height         from measurment_input_params
union all
select (id - 1) * 5 + 2, measurment_bath_id, 2, temperature    from measurment_input_params
union all
select (id - 1) * 5 + 3, measurment_bath_id, 3, pressure       from measurment_input_params
union all
select (id - 1) * 5 + 4, measurment_bath_id, 4, wind_direction from measurment_input_params
union all
select (id - 1) * 5 + 5, measurment_bath_id, 5, wind_speed     from measurment_input_params;

-- 7. Удаляем старые данные (DML) и структуру (DDL), переименовываем ---------
delete from measurment_input_params;
drop table measurment_input_params;
alter table measurment_input_params_new rename to measurment_input_params;

commit;
```

## Итоговый запрос

```sql
select mb.started                             as "Дата измерения",
       mb.id                                  as "Номер пачки",
       e.name                                 as "ФИО сотрудника",
       pt.name || ' (' || u.short_name || ')' as "Наименование параметра и ед. измерения",
       mip.value                              as "Значение"
from measurment_baths as mb
inner join employees as e
    on e.id = mb.emploee_id
inner join military_ranks as mr
    on mr.id = e.military_rank_id
inner join measurment_types as mt
    on mt.id = mb.measurment_type_id
inner join measurment_input_params as mip
    on mip.measurment_bath_id = mb.id
inner join parameter_types as pt
    on pt.id = mip.parameter_type_id
inner join units as u
    on u.id = pt.unit_id
order by mb.id, pt.id;
```

!!! note "Длина имени столбца"
    PostgreSQL режет имена до 63 байт. Кириллица — 2 байта на символ, поэтому
    «Наименование параметра и ед. измерения» (71 байт) отобразится как
    «Наименование параметра и ед. измер». Это ограничение базы, не ошибка.

Ожидаемый результат на данных первого скрипта — **5 строк** (пачка `1`,
сотрудник `Воловиков`):

| Дата измерения | Номер пачки | ФИО сотрудника | Наименование параметра и ед. измерения | Значение |
| --- | --- | --- | --- | --- |
| 2026-09-01 | 1 | Воловиков Александр Сергеевич | Высота метеопоста (м) | 100.00 |
| 2026-09-01 | 1 | Воловиков Александр Сергеевич | Температура воздуха на высоте метеопоста (°C) | 12.00 |
| 2026-09-01 | 1 | Воловиков Александр Сергеевич | Давление атмосферы на высоте метеопоста (мм рт. ст.) | 34.00 |
| 2026-09-01 | 1 | Воловиков Александр Сергеевич | Направление ветра в приземном слое воздуха (б. д. у.) | 0.20 |
| 2026-09-01 | 1 | Воловиков Александр Сергеевич | Скорость ветра в приземном слое воздуха (м/с) | 45.00 |

## Типичные ошибки

- **Забыли `primary key` перед `foreign key`.** Внешний ключ не встанет, пока у
  родителя нет уникального ключа.
- **Удалили старую таблицу до переноса данных.** Данные пропадут. Порядок:
  создать → перенести → удалить → переименовать.
- **Одинаковые `id` после `union all`.** Без формулы `(id - 1) * 5 + n` все пять
  строк получат один и тот же `id`, и `primary key` не даст их вставить.
- **`=` вместо `is` для `NULL`.** `where value = null` не находит ничего.
- **`having` вместо `where` и наоборот.** Фильтр по агрегату — только `having`.
- **Список таблиц через запятую.** Домашка требует `inner join ... on`.

## Что дальше

Собери свой скрипт, проверь его на контейнере, сделай скриншот результата и открой
Pull Request. Шпаргалка по синтаксису — в `cheatsheet.md`.
