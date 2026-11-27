# 6. Метаданные: `information_schema`

Отдельный скрипт должен показать **метаданные** — описание твоей базы в виде
таблицы «№ / Наименование / Тип».

!!! abstract "Цель урока"
    Ты научишься читать метаданные из `information_schema` и оформлять их в нужный
    формат.

## Шаг 1 · Что такое метаданные

!!! note "Определение"
    **Метаданные** — «данные о данных»: какие есть таблицы, какие у них столбцы,
    какие типы. Сами строки таблиц — это не метаданные.

Postgres хранит метаданные в схеме `information_schema`.

!!! question "Сделай"
    Таблица `users` — это данные или метаданные?

??? success "Проверить"
    Сами сотрудники — данные. А факт «есть таблица `users` со столбцом `full_name`»
    — метаданные.

## Шаг 2 · Список таблиц

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

`information_schema.tables` — список всех таблиц. `table_schema = 'public'` —
только твои таблицы.

!!! question "Сделай"
    Что вернёт этот запрос?

??? success "Проверить"
    Имена всех таблиц в схеме `public` по алфавиту.

## Шаг 3 · Список столбцов

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;
```

`ordinal_position` — порядок столбца в таблице (`1`, `2`, …).

!!! question "Сделай"
    Что хранит `data_type`?

??? success "Проверить"
    Тип данных столбца: `integer`, `character varying`, `numeric` и т. д.

## Шаг 4 · Номер строки

Чтобы получить колонку «№», нужен `row_number()` — нумерует строки результата:

```sql
select
	row_number() over (order by table_name) as "№",
	table_name as "Наименование"
from information_schema.tables
where table_schema = 'public';
```

!!! question "Сделай"
    Что делает `row_number() over (order by table_name)`?

??? success "Проверить"
    Присваивает строкам номера 1, 2, 3 … в порядке сортировки по имени таблицы.

## Шаг 5 · Добавляем колонку «Тип»

Тип — «Таблица» для таблиц и «Столбец» для столбцов. Соберём оба списка через
`union all`:

```sql
select row_number() over (order by name) as "№", name as "Наименование", type as "Тип"
from (
	select table_name as name, 'Таблица' as type
	from information_schema.tables
	where table_schema = 'public'
	union all
	select column_name, 'Столбец'
	from information_schema.columns
	where table_schema = 'public'
) t;
```

!!! question "Сделай"
    Зачем `union all`?

??? success "Проверить"
    Чтобы соединить список таблиц и список столбцов в один набор строк. У обоих
    должно быть одинаковое число колонок.

!!! tip "Правило"
    Метаданные берут из `information_schema`. Формат «№ / Наименование / Тип» —
    это `row_number()` + два столбца.

## Откуда числа

`table_schema = 'public'` — твои таблицы из первой транзакции. `'Таблица'` и
`'Столбец'` — подписи, которые просит задание.

## Наивные вопросы

!!! question "Почему не `pg_catalog`?"
    `information_schema` — стандартный портируемый способ; его и просит учитель
    (ссылка на postgrespro/information-schema).

!!! question "`union` и `union all` — разница?"
    `union` убирает дубли (и медленнее), `union all` оставляет всё как есть.
    Тут дубли не нужны, поэтому `union all`.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** сколько строк вернёт список таблиц до первой транзакции?
    2. **Объясни**, зачем `where table_schema = 'public'`.
    3. **Напиши** запрос: все имена таблиц из `public`.

??? success "Проверить"
    1. Ноль — таблиц ещё нет.
    2. Чтобы показать только свои таблицы, а не системные.
    3. `select table_name from information_schema.tables where table_schema = 'public';`

## Что дальше

Осталось визуальное: ER-диаграмма в pgAdmin и таблица температуры.
