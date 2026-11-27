# 14. GROUP BY и HAVING: сводки по измерениям

Журнал измерений бесполезен, если нельзя быстро получить сводку: средняя
температура, число измерений, максимальная скорость ветра.

!!! abstract "Цель урока"
    Ты научишься группировать строки, считать агрегаты и фильтровать группы.

## Шаг 1 · Сгруппируй и посчитай

```sqlplay
-- @seed artillery
select
    measurment_bath_id as пачка,
    count(*)           as измерений
from measurment_input_params
group by measurment_bath_id
order by measurment_bath_id;
```

`group by` собирает строки с одинаковым значением в группы, `count(*)` считает
строки в каждой группе.

!!! question "Сделай"
    Сколько измерений в пачке `2`?

??? success "Проверить"
    `5` — у неё пять параметров (для `ВР` вместо скорости ветра — дальность сноса).

## Шаг 2 · Другие агрегаты

!!! tip "Правило"
    Агрегат превращает много значений в одно: `count` — количество, `sum` — сумма,
    `avg` — среднее, `min`/`max` — минимум/максимум.

```sqlplay
-- @seed artillery
select
    parameter_type_id as параметр,
    count(*)          as сколько,
    min(value)        as минимум,
    max(value)        as максимум,
    round(avg(value), 2) as среднее
from measurment_input_params
group by parameter_type_id
order by parameter_type_id;
```

!!! question "Сделай"
    Почему по параметру `6` (`Дальность сноса пуль`) только две строки, а по `1`
    (`Высота`) — пять?

??? success "Проверить"
    Параметр `6` измеряется только у `ВР` (2 пачки), а высота — у всех пачек (5).

## Шаг 3 · В SELECT только группируемые столбцы

!!! warning "Ошибка"
    Нельзя вывести обычный столбец, которого нет в `group by`: у группы много значений,
    и база не знает, какое показать.

!!! question "Сделай"
    Что вернёт `select value from measurment_input_params group by parameter_type_id;`?

??? success "Проверить"
    Ошибку: `value` не входит в `group by` и не обёрнут в агрегат.

## Шаг 4 · HAVING — фильтр групп

`where` фильтрует **строки до группировки**, `having` — **группы после**.

```sqlplay
-- @seed artillery
select
    measurment_bath_id as пачка,
    count(*)           as измерений
from measurment_input_params
group by measurment_bath_id
having count(*) >= 5
order by measurment_bath_id;
```

!!! question "Сделай"
    Чем этот запрос отличается от такого же с `where count(*) >= 5`?

??? success "Проверить"
    `where` не умеет работать с агрегатами и выдаст ошибку. Фильтровать по результату
    агрегата можно только через `having`.

## Шаг 5 · Среднее по пачке

!!! question "Сделай"
    Посчитай среднее значение параметров в каждой пачке.

```sqlplay
-- @seed artillery
select measurment_bath_id as пачка, round(avg(value), 2) as среднее
from measurment_input_params
group by measurment_bath_id
order by measurment_bath_id;
```

??? success "Проверить"
    Пять строк — по одной на пачку. Средние разные, потому что наборы значений разные.

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| `group by столбец` | собрать строки в группы по значению |
| `count(*)` | число строк в группе |
| `avg(value)` | среднее значение в группе |
| `having условие` | отфильтровать группы по агрегату |
| `where` | отфильтровать строки до группировки |

## Откуда числа

`5` измерений у пачки — из данных: у `ДМК`/`ВР` по пять параметров. Числа `min`/`max`
считаются по значениям `value`, а не заданы.

## Наивные вопросы

!!! question "Можно ли группировать по двум столбцам?"
    Да: `group by a, b` — группа определяется парой значений.

!!! question "Что вернёт агрегат без `group by`?"
    Одну строку-итог по всей таблице: например, `select count(*) from measurment_input_params;`.

!!! question "Почему `having` не заменяет `where`?"
    Они работают на разных этапах: `where` отбрасывает строки раньше (быстрее),
    `having` — уже посчитанные группы.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что вернёт `select count(*) from measurment_input_params;` без
       `group by`?
    2. **Объясни** разницу между `where` и `having`.
    3. **Напиши** запрос: пачки, у которых больше трёх измерений.

??? success "Проверить"
    1. `25` — всего строк в таблице измерений.
    2. `where` фильтрует строки до группировки, `having` — группы после.
    3. `select measurment_bath_id from measurment_input_params group by measurment_bath_id having count(*) > 3;`

## Что дальше

Разберём `left join` и `NULL` — как находить то, чего в данных нет.
