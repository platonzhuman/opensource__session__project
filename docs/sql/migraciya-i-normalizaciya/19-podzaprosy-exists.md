# 19. Подзапросы и EXISTS: ищем аномалии

Иногда условие зависит от результата другого запроса: «пачки, у которых есть
дальность сноса», «сотрудники, у которых нет пачек». Здесь помогают подзапросы.

!!! abstract "Цель урока"
    Ты научишься вкладывать один запрос в другой через `in`, скалярный подзапрос и
    `exists`.

## Шаг 1 · Подзапрос через IN

```sqlplay
-- @seed artillery
select distinct measurment_bath_id as пачка
from measurment_input_params
where parameter_type_id in (
    select id from parameter_types where name = 'Дальность сноса пуль'
)
order by пачка;
```

`in (подзапрос)` — «значение входит в список, который вернул подзапрос».

!!! question "Сделай"
    Что вернёт запрос?

??? success "Проверить"
    Пачки `2` и `5` — те, где измерялась дальность сноса пуль (оборудование `ВР`).

## Шаг 2 · Скалярный подзапрос

Подзапрос может вернуть одно значение — его используют как обычное число.

```sqlplay
-- @seed artillery
select
    round(avg(value), 2) as средняя_высота
from measurment_input_params
where parameter_type_id = (
    select id from parameter_types where name = 'Высота метеопоста'
);
```

!!! question "Сделай"
    Что вернёт запрос?

??? success "Проверить"
    Среднюю высоту по всем пачкам: `(100 + 120 + 95 + 110 + 100) / 5 = 105`.

## Шаг 3 · EXISTS — есть ли вообще

`exists (подзапрос)` истинно, если подзапрос вернул хотя бы одну строку.

```sqlplay
-- @seed artillery
select b.id as пачка
from measurment_baths as b
where exists (
    select 1 from measurment_input_params as i
    where i.measurment_bath_id = b.id
        and i.parameter_type_id = 6
)
order by b.id;
```

!!! question "Сделай"
    Чем этот запрос отличается по смыслу от первого?

??? success "Проверить"
    Тот же результат (пачки `2` и `5`), но `exists` проверяет «есть ли хоть одно
    совпадение», не строя список значений.

## Шаг 4 · Найди аномалию

```sqlplay
-- @seed artillery
select b.id as пачка
from measurment_baths as b
where not exists (
    select 1 from measurment_input_params as i
    where i.measurment_bath_id = b.id
)
order by b.id;
```

!!! question "Сделай"
    Что ищет этот запрос и что вернёт на данных `artillery`?

??? success "Проверить"
    Пачки без измерений. В `artillery` таких нет — вернётся пусто. На данных `base`
    нашлась бы пачка `2`.

## Шаг 5 · Сравни IN и EXISTS

!!! question "Сделай"
    Перепиши первый запрос через `exists` и сравни результаты.

```sqlplay
-- @seed artillery
select distinct i.measurment_bath_id as пачка
from measurment_input_params as i
where exists (
    select 1 from parameter_types as p
    where p.id = i.parameter_type_id and p.name = 'Дальность сноса пуль'
)
order by пачка;
```

??? success "Проверить"
    Тот же результат — пачки `2` и `5`. `in` и `exists` дают одно и то же, разница в
    способе проверки.

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| `in (подзапрос)` | значение входит в результат подзапроса |
| скалярный подзапрос | подзапрос возвращает одно значение |
| `exists (подзапрос)` | истина, если подзапрос непустой |
| `not exists` | истина, если подзапрос пустой |

## Откуда числа

Средняя высота `105` — вычисление по пяти значениям `value`. Пачки `2` и `5` — из
данных `artillery` (только у `ВР` есть параметр `6`).

## Наивные вопросы

!!! question "Что быстрее, `in` или `exists`?"
    Зависит от данных и планировщика. Часто `exists` лучше на больших таблицах, `in`
    — на маленьких списках. Оба корректны.

!!! question "Можно ли вложить подзапрос в подзапрос?"
    Да, но вложенность снижает читаемость. Часто лучше `join`.

!!! question "Чем подзапрос хуже `join`?"
    Ничем, если задача — фильтр. Для вывода столбцов из другой таблицы удобнее `join`.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что вернёт `exists (select ...)` при пустом подзапросе?
    2. **Объясни**, зачем `distinct` в первом запросе.
    3. **Напиши** запрос: пачки, где давление (параметр `3`) больше `750`.

??? success "Проверить"
    1. Ложь — подзапрос не вернул строк.
    2. Один параметр может встречаться в нескольких измерениях, а пачка нужна один раз.
    3. `select distinct measurment_bath_id from measurment_input_params where parameter_type_id = 3 and value > 750;`

## Что дальше

Сохраним готовый отчёт как `VIEW` — чтобы не писать длинный запрос каждый раз.
