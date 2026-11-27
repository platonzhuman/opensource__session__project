# 5. Проверка 4: диапазоны значений

Четвёртый вопрос: **все значения корректны и в рамках нужных диапазонов?**
У каждого параметра свой диапазон из ТЗ.

!!! abstract "Цель урока"
    Ты научишься писать `where` с диапазонами для разных параметров.

## Шаг 1 · Диапазоны из ТЗ

| id | параметр | диапазон |
|----|----------|----------|
| 2 | температура | −58…58 |
| 3 | давление | 500…900 |
| 4 | направление ветра | 0…59 |
| 5 | скорость ветра | 0…15 |
| 6 | дальность сноса пуль | 0…150 |

!!! question "Сделай"
    Что значит «значение вне диапазона» для давления?

??? success "Проверить"
    `value < 500` или `value > 900`. Например, `980` — вне диапазона.

## Шаг 2 · Найди все значения вне диапазона

Для каждого параметра — своя проверка. Проверки объединяем через `or` (достаточно
одного нарушения), а внутри условия параметра — через `and`.

```sqlplay
-- @seed artillery_my
select par.id, pt.name, par.value
from parametrs par
join parameter_types pt on pt.id = par.parameter_type_id
where (pt.id = 2 and (par.value < -58 or par.value > 58))
   or (pt.id = 3 and (par.value < 500 or par.value > 900))
   or (pt.id = 4 and (par.value < 0 or par.value > 59))
   or (pt.id = 5 and (par.value < 0 or par.value > 15))
   or (pt.id = 6 and (par.value < 0 or par.value > 150));
```

!!! question "Сделай"
    Что нашёл запрос?

??? success "Проверить"
    Измерение `32`: давление `980` — больше `900`. Вопрос «все в диапазоне?» → **нет**.

## Шаг 3 · Второй способ: `between`

`value between a and b` — то же, что `value >= a and value <= b`. Удобно для
диапазона.

```sqlplay
-- @seed artillery_my
select par.id, pt.name, par.value
from parametrs par
join parameter_types pt on pt.id = par.parameter_type_id
where (pt.id = 2 and par.value not between -58 and 58)
   or (pt.id = 3 and par.value not between 500 and 900)
   or (pt.id = 4 and par.value not between 0 and 59)
   or (pt.id = 5 and par.value not between 0 and 15)
   or (pt.id = 6 and par.value not between 0 and 150);
```

!!! question "Сделай"
    Результат совпал с шагом 2?

??? success "Проверить"
    Да — то же измерение `32`. `between` и пара `<`/`>` дают одно и то же.

!!! tip "Правило"
    «Значение в диапазоне?» = `value between min and max`. Нарушение —
    `not between` (или `< min or > max`).

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что вернёт проверка диапазона, если все значения корректны?
    2. **Объясни**, почему условия объединяются через `or`, а не `and`.
    3. **Напиши** условие: температура вне −58…58.

??? success "Проверить"
    1. Ничего (ноль строк).
    2. Достаточно одного нарушения по **любому** параметру, поэтому `or`.
    3. `pt.id = 2 and par.value not between -58 and 58`

## Что дальше

Последняя проверка: соответствуют ли единицы измерения своим параметрам.
