# Ответы и разборы

Сначала пробуй сам, потом сверяйся.

## Задание 1

Типов два: `ДМК` (десантный метеокомплект) и `ВР` (ветровое ружьё).

```sql
insert into equipment_types (id, name) values
    (1, 'ДМК'),
    (2, 'ВР');
```

Почему так: других типов в ТЗ нет, придумывать не нужно.

## Задание 2

```sql
(3, 1, 'Давление атмосферы на высоте метеопоста', 'мм рт. ст.', 750)
```

- название: `Давление атмосферы на высоте метеопоста`;
- единица: `мм рт. ст.`;
- значение по умолчанию: `750`.

!!! warning "Частая ошибка"
    Записать в `name` число `750`. Название и значение — разные столбцы.

## Задание 3

```sql
create table packs (
    id                integer not null,
    user_id           integer not null,
    equipment_type_id integer not null,
    constraint pk_packs primary key (id)
);
```

Почему так: убраны оба `foreign key`, столбцы и `primary key` остались.

## Задание 4

```sql
create table parameters (
    id      integer not null,
    pack_id integer not null,
    name    varchar(150) not null,
    unit    varchar(20),
    value   numeric(10,2) not null,
    constraint pk_parameters primary key (id)
);
```

Почему так: `pack_id` — обычный столбец (без `FOREIGN KEY`), `value` хранит
измеренное значение.

## Задание 5

```sql
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
```

Почему так: пачка 1 — `ДМК` (есть скорость ветра), пачка 2 — `ВР` (есть
дальность сноса пуль). `pack_id` ссылается на существующие пачки.

!!! warning "Частая ошибка"
    Вставить параметр с `pack_id = 5`, когда пачки с кодом 5 нет. Без `FOREIGN KEY`
    СУБД не остановит — проверяй сам.

## Задание 6

```sql
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

Почему так: четыре `JOIN` соединяют пять таблиц. Цепочка идёт от пачки к
пользователю, должности, типу и параметрам.

!!! warning "Частая ошибка"
    Соединить `parameters` с `users` напрямую. Общего столбца нет — только через
    `packs`.

## Задание 7

В PR должно быть:

1. Файл `homework.sql` с расширением.
2. Скриншот результата `SELECT`.
3. Отдельная ветка, не `main`.
4. Описание: какие таблицы и что взято из ТЗ.
5. Никаких посторонних файлов (тестовые скрипты, правки `docker-compose`).

## Ответы на самопроверку

1. `ДМК`, `ВР`.
2. Добавить в `parameters` столбец `value`.
3. Удалить объявления `FOREIGN KEY`, столбцы оставить.
4. `PRIMARY KEY`.
5. Удаляет таблицу, если она есть, иначе ничего не делает.
6. `name` — что измеряем, `value` — сколько измерено.
7. У пачки несколько параметров — строки размножаются при соединении.
8. Тестовые файлы и правки `docker-compose`.
