# 7. Три справочника: базовые единицы, единицы, типы параметров

Домашка требует три новых справочника. Урок учит строить **иерархию справочников**
на постороннем примере, а ты применишь это к артиллерии.

!!! abstract "Цель урока"
    Ты научишься создавать справочник со ссылкой на другой справочник и заполнять
    его типовыми данными.

## Шаг 1 · Идея иерархии

Справочники часто вложены: у города есть страна, у единицы измерения — физическая
величина, у параметра — единица. Каждый следующий ссылается на предыдущий кодом.

```sqlplay
-- @seed base
create table countries (
    id   integer not null,
    name character varying(100) not null,
    constraint pk_countries primary key (id),
    constraint uq_countries_name unique (name)
);

create table cities (
    id         integer not null,
    country_id integer not null,
    name       character varying(100) not null,
    constraint pk_cities primary key (id),
    constraint fk_cities_countries
        foreign key (country_id) references countries (id)
);

insert into countries (id, name) values (1, 'Россия'), (2, 'Беларусь');
insert into cities (id, country_id, name) values
    (1, 1, 'Москва'),
    (2, 1, 'Тула'),
    (3, 2, 'Минск');

select c.name as город, k.name as страна
from cities as c
inner join countries as k on k.id = c.country_id
order by c.id;
```

!!! question "Сделай"
    Какая связь между `countries` и `cities` и где она объявлена?

??? success "Проверить"
    «Один-ко-многим»: одна страна — много городов. Объявлена внешним ключом
    `fk_cities_countries` на столбце `country_id`.

## Шаг 2 · Назови связь по смыслу

В артиллерии иерархия такая:

`base_units` (физическая величина) → `units` (единица) → `parameter_types` (параметр).

!!! question "Сделай"
    Что на что ссылается: `units` на `base_units` или наоборот? Почему?

??? success "Проверить"
    `units` ссылается на `base_units`. Единица `м` принадлежит величине `Длина`,
    значит, ссылка идёт от единицы к величине.

## Шаг 3 · Заполни типовыми данными

Заполнять надо согласованно: сначала родитель, потом потомок, иначе внешний ключ
не даст вставить.

```sqlplay
-- @seed base
create table base_units (
    id   integer not null,
    name character varying(100) not null,
    constraint pk_base_units primary key (id),
    constraint uq_base_units_name unique (name)
);

insert into base_units (id, name) values
    (1, 'Длина'), (2, 'Температура'), (3, 'Давление'), (4, 'Плоский угол'), (5, 'Скорость');

select * from base_units order by id;
```

!!! question "Сделай"
    Почему `Длина`, `Температура` и `Давление` — это **базовые** единицы, а `м` и `°C`
    — обычные?

??? success "Проверить"
    Базовые описывают физическую величину (что измеряем). Обычные — конкретную шкалу
    (в чём измеряем). У величины `Длина` может быть много единиц.

## Шаг 4 · Задание: построй три справочника для артиллерии

!!! question "Сделай"
    Создай `base_units`, `units` (со ссылкой на `base_units`) и `parameter_types`
    (со ссылкой на `units`) и заполни:

    - величины: `Длина`, `Температура`, `Давление`, `Плоский угол`, `Скорость`;
    - единицы: `м`, `°C`, `мм рт. ст.`, `б. д. у.`, `м/с`;
    - параметры: `Высота метеопоста`, `Температура воздуха на высоте метеопоста`,
      `Давление атмосферы на высоте метеопоста`,
      `Направление ветра в приземном слое воздуха`,
      `Скорость ветра в приземном слое воздуха`, `Дальность сноса пуль`.

    Подсказки: у каждой таблицы `primary key` и `unique` на название; `units` и
    `parameter_types` получают `foreign key`.

??? success "Проверить"
    Должно получиться три таблицы, где `parameter_types.unit_id` ссылается на
    `units.id`, а `units.base_unit_id` — на `base_units.id`. Проверь себя:

    ```sql
    select p.name, u.short_name
    from parameter_types p
    inner join units u on u.id = p.unit_id
    order by p.id;
    ```

    Полное решение — в `answers.md`, сверься после попытки.

## Шаг 5 · Проверь иерархию запросом

!!! question "Сделай"
    Соедини три справочника и выведи «величина → единица → параметр».

```sqlplay
-- @seed artillery
select bu.name as величина, u.short_name as единица, pt.name as параметр
from parameter_types as pt
inner join units as u      on u.id = pt.unit_id
inner join base_units as bu on bu.id = u.base_unit_id
order by pt.id;
```

??? success "Проверить"
    Цепочка из трёх таблиц: параметр → единица → величина. Так проверяют, что
    иерархия собрана верно.

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| `create table countries (...)` | родительский справочник |
| `country_id integer` | столбец-ссылка |
| `foreign key (country_id) references countries (id)` | объявление связи |
| `insert into countries` до `insert into cities` | порядок заполнения по зависимостям |

## Откуда числа

Коды `1…5` для величин и единиц — просто уникальные числа, их придумываем мы.
Названия единиц (`м`, `°C`, `мм рт. ст.`, `б. д. у.`, `м/с`) — из ТЗ. Параметры — из
раздела «Входные данные» ТЗ.

## Наивные вопросы

!!! question "Почему у единиц два названия — полное и короткое?"
    Полное (`градус Цельсия`) — для интерфейса и отчётов, короткое (`°C`) — для
    компактной строки «параметр и единица» в итоговом запросе.

!!! question "Обязательно ли `unique` на название?"
    Нет, но полезно: две одинаковые единицы — почти всегда ошибка. `unique` её поймает.

!!! question "Что делать, если у параметра ещё нет единицы?"
    В модели единица обязательна (`unit_id not null`). Если параметр пока не придуман —
    не добавляй его, пока не определишь единицу.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что произойдёт при `insert into parameter_types` со ссылкой на
       несуществующий `unit_id`?
    2. **Объясни**, зачем разделять «базовую единицу» и «единицу».
    3. **Напиши** запрос: пары «параметр — полное название единицы».

??? success "Проверить"
    1. Ошибка внешнего ключа — единицы с таким кодом нет.
    2. Базовая величина отвечает «что измеряем», единица — «в чём». Это разные факты,
       их не смешивают в одном столбце.
    3. `select p.name, u.name from parameter_types p inner join units u on u.id = p.unit_id order by p.id;`

## Что дальше

Справочники есть. Теперь научимся менять структуру существующих таблиц — добавлять
ключи и связи командой `ALTER TABLE`.
