# 10. Удаляем старое: DROP и RENAME без потери данных

Данные перенесены в новую таблицу. Пора убрать старую структуру. Главное — не
удалить новую случайно.

!!! abstract "Цель урока"
    Ты научишься различать удаление данных и удаление структуры и правильно
    переименовывать таблицы.

## Шаг 1 · DML и DDL — разные удаления

!!! note "Определение"
    `DELETE` — это DML: удаляет
    **строки**, структура остаётся. `DROP` — это
    DDL: удаляет **таблицу целиком**,
    вместе со структурой и данными.

```sqlplay
-- @seed base
create table demo (id integer, name text);
insert into demo values (1, 'a'), (2, 'b');

delete from demo where id = 1;
select * from demo;
```

!!! question "Сделай"
    Что осталось в `demo` после `delete`?

??? success "Проверить"
    Одна строка `id = 2`. Таблица и её структура на месте — удалили только строку.

## Шаг 2 · DROP удаляет таблицу целиком

```sqlplay
-- @seed base
create table demo (id integer, name text);
insert into demo values (1, 'a');

drop table demo;

select table_name from information_schema.tables
where table_schema = 'public' and table_name = 'demo';
```

!!! question "Сделай"
    Что вернёт последний `select`?

??? success "Проверить"
    Ничего — таблицы `demo` больше нет. `drop` убрал и данные, и структуру.

## Шаг 3 · RENAME — переименовать

```sqlplay
-- @seed base
create table temp_params (id integer, value numeric(8,2));
insert into temp_params values (1, 100);

alter table temp_params rename to demo_params;

select * from demo_params;
```

!!! question "Сделай"
    Почему переименование не потеряло данные?

??? success "Проверить"
    `rename` меняет только имя таблицы. Строки и столбцы остаются на месте.

## Шаг 4 · Порядок шагов миграции

!!! tip "Правило"
    Порядок обязателен: **создать новое → перенести данные → удалить старое →
    переименовать новое**. Если удалить старое раньше переноса — данные пропадут.

```sqlplay
-- @seed base
-- 1) новая таблица
create table params_new (id integer, bath_id integer, value numeric(8,2));
-- 2) перенос
insert into params_new (id, bath_id, value)
select id, measurment_bath_id, height from measurment_input_params;
-- 3) удаляем старое
drop table measurment_input_params;
-- 4) переименовываем
alter table params_new rename to measurment_input_params;

select * from measurment_input_params;
```

!!! question "Сделай"
    Что будет, если поменять местами шаги 2 и 3?

??? success "Проверить"
    Ошибка: `measurment_input_params` уже удалена, переносить неоткуда. Данные
    потеряны безвозвратно.

## Шаг 5 · Задание: заверши миграцию

!!! question "Сделай"
    В базе `base` доведи миграцию до конца: удали старую `measurment_input_params`
    (это `DML`-удаление строк и `DDL`-удаление таблицы) и переименуй
    `measurment_input_params_new` в `measurment_input_params`. Убедись, что данные
    на месте.

??? success "Проверить"
    ```sql
    select measurment_bath_id, parameter_type_id, value
    from measurment_input_params
    order by id;
    ```

    Должно быть 5 строк для пачки `1`. Полное решение — в `answers.md`.

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| `delete from t where ...` | удалить строки (структура остаётся) |
| `drop table t` | удалить таблицу целиком |
| `alter table t rename to t2` | переименовать таблицу |
| порядок шагов | новый → перенос → drop → rename |

## Откуда числа

Одна строка `demo` — из вставки. Пять строк результата — из данных пачки `1` в
`base` (`height`…`wind_speed`). Данные не вычисляются, а переносятся.

## Наивные вопросы

!!! question "Зачем вообще удалять старую таблицу?"
    Иначе в базе останутся две таблицы с параметрами, и непонятно, какая главная.
    Домашка прямо требует удалить старые ненужные структуры.

!!! question "Можно ли переименовать старую, а новую оставить как есть?"
    Можно, но тогда рабочим именем станет `..._new`. Лучше, чтобы рабочее имя было
    привычным, а мусорное — удалено.

!!! question "Что если `drop` не сработает?"
    Если на таблицу ссылаются внешним ключом, `drop` не пройдёт. Наша старая таблица
    ни на что не ссылается, поэтому удаляется спокойно.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что вернёт `select * from measurment_input_params;` сразу после
       `drop` старой таблицы и **до** `rename`?
    2. **Объясни** разницу между `delete` и `drop`.
    3. **Напиши** команду переименования `params_new` в `measurment_input_params`.

??? success "Проверить"
    1. Ошибку: таблицы с таким именем ещё нет (новая называется `..._new`).
    2. `delete` убирает строки, оставляя структуру; `drop` убирает таблицу целиком.
    3. `alter table params_new rename to measurment_input_params;`

## Что дальше

Миграция структуры готова. Осталось собрать итоговый запрос в синтаксисе `ANSI-92`.
