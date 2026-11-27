# 15. LEFT JOIN и NULL: чего нет в данных

Не всё в базе заполнено. Иногда нужно найти то, чего **нет**: пачки без измерений,
сотрудников без пачек. Для этого есть `left join` и `NULL`.

!!! abstract "Цель урока"
    Ты научишься отличать `inner join` от `left join` и искать отсутствующие данные.

## Шаг 1 · Сравни INNER и LEFT

В базе `base` у пачки `2` нет измерений.

```sqlplay
-- @seed base
select b.id as пачка, i.id as измерение
from measurment_baths as b
inner join measurment_input_params as i on i.measurment_bath_id = b.id
order by b.id;
```

!!! question "Сделай"
    Сколько пачек в результате?

??? success "Проверить"
    Одна — пачка `1`. Пачка `2` пропала: `inner join` оставляет только совпадения.

## Шаг 2 · LEFT JOIN оставляет левые строки

```sqlplay
-- @seed base
select b.id as пачка, i.id as измерение
from measurment_baths as b
left join measurment_input_params as i on i.measurment_bath_id = b.id
order by b.id;
```

!!! question "Сделай"
    Что появилось у пачки `2` в столбце `измерение`?

??? success "Проверить"
    `NULL` — «значения нет». `left join` сохранил пачку, хотя измерений у неё нет.

## Шаг 3 · NULL — это «неизвестно»

!!! note "Определение"
    `NULL` — не ноль и не пустая строка, а **отсутствие значения**. С ним нельзя
    сравниваться через `=`, только через `is null` / `is not null`.

!!! question "Сделай"
    Предскажи, что вернёт `select * from measurment_baths b left join measurment_input_params i on i.measurment_bath_id = b.id where i.id = null;`

??? success "Проверить"
    Пусто. `= null` не работает: `NULL` ничему не равен. Нужно `is null`.

## Шаг 4 · Найди отсутствующее

```sqlplay
-- @seed base
select b.id as пачка_без_измерений
from measurment_baths as b
left join measurment_input_params as i on i.measurment_bath_id = b.id
where i.id is null;
```

!!! question "Сделай"
    Что вернёт запрос?

??? success "Проверить"
    Пачку `2`. Приём «`left join` + `where ... is null`» — стандартный способ найти
    строки без связанных записей.

## Шаг 5 · COALESCE — подставь значение по умолчанию

```sqlplay
-- @seed base
select
    b.id as пачка,
    coalesce(i.id, 0) as измерение
from measurment_baths as b
left join measurment_input_params as i on i.measurment_bath_id = b.id
order by b.id;
```

!!! question "Сделай"
    Что делает `coalesce`?

??? success "Проверить"
    Возвращает первое не-`NULL` значение. У пачки `2` вместо `NULL` появится `0`.

## Тренажёр: автопроверка

### Почини код

Запрос должен найти пачки без измерений, но `inner join` их теряет. Исправь.

```sqlplay
-- @seed base
-- @mode fix
-- @expect {"columns":["пачка_без_измерений"],"rows":[[2]]}
-- @hint Нужен left join, а условие — i.id is null.
select b.id as пачка_без_измерений
from measurment_baths as b
join measurment_input_params as i on i.measurment_bath_id = b.id
where i.id is null;
```

### Напиши сам

Напиши запрос, который вернёт пачку без измерений. Проверка автоматическая.

```sqlplay
-- @seed base
-- @mode write
-- @expect {"columns":["пачка_без_измерений"],"rows":[[2]]}
-- @hint left join + where i.id is null
-- пиши запрос ниже
```

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| `inner join` | только строки с совпадением в обеих таблицах |
| `left join` | все строки левой таблицы + совпадения справа |
| `NULL` | отсутствие значения |
| `is null` / `is not null` | проверка на отсутствие/наличие |
| `coalesce(a, b)` | `a`, если не `NULL`, иначе `b` |

## Откуда числа

Пачка `2` без измерений — факт из данных `base` (в первом скрипте измерения только
для пачки `1`). Это реальное отсутствие, а не придуманное.

## Наивные вопросы

!!! question "Чем `left join` отличается от `right join`?"
    `left` сохраняет все строки левой таблицы, `right` — правой. На практике почти
    всегда пишут `left`, меняя таблицы местами.

!!! question "Почему `NULL` не равен `NULL`?"
    Потому что `NULL` означает «неизвестно». Два неизвестных не обязаны быть равны,
    поэтому сравнение не даёт истину.

!!! question "Когда `left join` обязателен?"
    Когда нужны записи, у которых может не быть связанных строк: пачки без измерений,
    оборудование без пачек.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** сколько строк вернёт `left join` пачек с измерениями, если
       измерений нет ни у одной пачки?
    2. **Объясни**, почему `= null` не работает.
    3. **Напиши** запрос: сотрудники, у которых нет ни одной пачки.

??? success "Проверить"
    1. Столько, сколько пачек — все строки сохранятся, справа будет `NULL`.
    2. `NULL` — отсутствие значения, сравнение с ним даёт «неизвестно», а не истину.
    3. `select e.name from employees e left join measurment_baths b on b.emploee_id = e.id where b.id is null;`

## Что дальше

Научимся задавать ограничения из ТЗ: диапазоны значений и значения по умолчанию.
