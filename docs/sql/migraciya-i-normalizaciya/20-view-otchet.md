# 20. VIEW и отчёт метеобюллетеня

Итоговый запрос длинный. Чтобы не писать его каждый раз, его сохраняют как
**представление** — `VIEW`.

!!! abstract "Цель урока"
    Ты научишься сохранять запрос под именем и использовать его как таблицу.

## Шаг 1 · Зачем VIEW

!!! note "Определение"
    **VIEW** (представление) — сохранённый запрос, к которому можно обращаться как к
    таблице. Данные не копируются, запрос выполняется при обращении.

```sqlplay
-- @seed artillery
create view v_measurements as
select
    b.started          as measured_at,
    b.id               as bath_id,
    e.name             as employee,
    p.name || ' (' || u.short_name || ')' as parameter,
    i.value            as value
from measurment_baths as b
inner join employees as e              on e.id = b.emploee_id
inner join measurment_input_params as i on i.measurment_bath_id = b.id
inner join parameter_types as p         on p.id = i.parameter_type_id
inner join units as u                   on u.id = p.unit_id;

select * from v_measurements order by bath_id, parameter;
```

!!! question "Сделай"
    Сколько строк вернёт `select count(*) from v_measurements;`?

??? success "Проверить"
    `25` — по строке на каждое измерение в данных.

## Шаг 2 · VIEW — это окно, а не копия

!!! question "Сделай"
    Если добавить новое измерение в `measurment_input_params`, появится ли оно в
    `v_measurements`?

??? success "Проверить"
    Да. `view` не хранит данные, а выполняет запрос в момент обращения. Новые строки
    сразу видны.

## Шаг 3 · Отчёт по параметру

```sqlplay
-- @seed artillery
create view v_measurements as
select
    b.id               as bath_id,
    e.name             as employee,
    p.name || ' (' || u.short_name || ')' as parameter,
    i.value            as value
from measurment_baths as b
inner join employees as e               on e.id = b.emploee_id
inner join measurment_input_params as i on i.measurment_bath_id = b.id
inner join parameter_types as p         on p.id = i.parameter_type_id
inner join units as u                   on u.id = p.unit_id;

select bath_id, employee, parameter, value
from v_measurements
where parameter like 'Температура%'
order by bath_id;
```

!!! question "Сделай"
    Что делает `like 'Температура%'`?

??? success "Проверить"
    Оставляет строки, где `parameter` начинается с `Температура`. `%` — любое
    продолжение. Вернёт 5 строк температур.

## Шаг 4 · Удали VIEW, если он больше не нужен

```sqlplay
-- @seed artillery
drop view if exists v_measurements;
```

!!! question "Сделай"
    Чем `drop view` отличается от `drop table`?

??? success "Проверить"
    `drop view` удаляет только сохранённый запрос, данные в таблицах не трогает.
    `drop table` удалил бы данные.

## Шаг 5 · Отфильтруй представление

!!! question "Сделай"
    Выведи из `v_measurements` только измерения сотрудника `Сидоров`.

```sqlplay
-- @seed artillery
create view v_meas as
select b.id as bath_id, e.name as employee, i.value as value
from measurment_baths as b
inner join employees as e on e.id = b.emploee_id
inner join measurment_input_params as i on i.measurment_bath_id = b.id;

select * from v_meas where employee like 'Сидоров%' order by bath_id;
```

??? success "Проверить"
    Пять строк — все измерения пачки `4`, которую сделал `Сидоров`. Фильтровать
    представление можно как обычную таблицу.

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| `create view имя as select ...` | сохранить запрос под именем |
| `select * from имя` | обратиться к представлению как к таблице |
| `drop view` | удалить представление |
| `like 'Температура%'` | фильтр по началу строки |

## Откуда числа

`25` строк — число измерений в `artillery`. `5` температур — по одной на каждую пачку.
Это данные, а не вычисления.

## Наивные вопросы

!!! question "VIEW занимает место на диске?"
    Почти нет — хранится только текст запроса. Данные берутся из таблиц при обращении.

!!! question "Можно ли фильтровать VIEW?"
    Да, `where`, `order by`, `join` — всё как с обычной таблицей.

!!! question "Когда VIEW лучше копии таблицы?"
    Когда данные меняются и нужен всегда актуальный результат. Копия устарела бы.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что вернёт `select count(*) from v_measurements;` после удаления
       одной пачки с пятью измерениями?
    2. **Объясни**, почему VIEW всегда актуален.
    3. **Напиши** запрос к `v_measurements` по сотруднику `Петров`.

??? success "Проверить"
    1. `20` — 25 минус 5 измерений удалённой пачки.
    2. Он выполняет запрос заново при каждом обращении, данные не копируются.
    3. `select * from v_measurements where employee like 'Петров%';`

## Что дальше

Последний шаг — оформить работу отдельной веткой и открыть Pull Request.
