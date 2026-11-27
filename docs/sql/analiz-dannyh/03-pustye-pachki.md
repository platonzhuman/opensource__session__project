# 3. Проверка 2: пустые пачки

Второй вопрос: **у нас нет пустых пачек измерения?** Пустая пачка — это пачка,
в которой ноль измерений.

!!! abstract "Цель урока"
    Ты научишься находить строки, которым **не нашлось пары** — через
    `left join ... is null`.

## Шаг 1 · Посчитай измерения в пачке

```sqlplay
-- @seed artillery_my
select p.id as pack_id, count(par.id) as cnt
from packs p
left join parametrs par on par.pack_id = p.id
group by p.id
order by cnt;
```

!!! question "Сделай"
    У какой пачки `cnt = 0`?

??? success "Проверить"
    Пачка `8`. Это и есть пустая пачка — в ней нет ни одного измерения.

## Шаг 2 · Найди пустые через `left join`

`left join` оставляет пачки даже без измерений, а в колонках из `parametrs`
ставит `NULL`. Значит, пустая пачка — там, где `par.id is null`.

```sqlplay
-- @seed artillery_my
select p.id as pack_id
from packs p
left join parametrs par on par.pack_id = p.id
where par.id is null;
```

!!! question "Сделай"
    Почему условие `is null`, а не `= null`?

??? success "Проверить"
    С `null` нельзя сравниваться через `=`: результат всегда «неизвестно».
    Проверка только через `is null`.

## Шаг 3 · Второй способ: `not exists`

«Пачка, для которой **не существует** измерений» — так и пишется.

```sqlplay
-- @seed artillery_my
select p.id as pack_id
from packs p
where not exists (
	select 1 from parametrs par where par.pack_id = p.id
);
```

!!! question "Сделай"
    Оба запроса вернули одно и то же?

??? success "Проверить"
    Да — пачку `8`. Это два равнозначных способа: `left join ... is null` и
    `not exists`.

!!! tip "Правило"
    «Нет связанных строк» = `left join ... where правая.id is null` **или**
    `where not exists (select 1 ...)`.

## Тренажёр: автопроверка

### Почини код

В запросе ошибка: `inner join` не оставляет пачки без измерений. Исправь так,
чтобы проверка стала зелёной.

```sqlplay
-- @seed artillery_my
-- @mode fix
-- @expect {"columns":["pack_id"],"rows":[[8]]}
-- @hint Замени inner join на left join.
select p.id as pack_id
from packs p
join parametrs par on par.pack_id = p.id
where par.id is null;
```

### Напиши сам

Напиши запрос, который вернёт `pack_id` пустых пачек. Проверка сравнивает
результат с эталоном.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["pack_id"],"rows":[[8]]}
-- @hint left join + where par.id is null
-- пиши запрос ниже
```

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что вернёт `select count(*) from parametrs where pack_id = 8;`?
    2. **Объясни**, почему `par.id is null` означает «измерений нет».
    3. **Напиши** запрос: id пачек без измерений.

??? success "Проверить"
    1. `0`.
    2. `left join` не нашёл пары — все колонки `parametrs` пустые (`null`).
    3. `select p.id from packs p left join parametrs par on par.pack_id = p.id where par.id is null;`

## Что дальше

Теперь проверим, что в каждой пачке **полный** набор параметров.
