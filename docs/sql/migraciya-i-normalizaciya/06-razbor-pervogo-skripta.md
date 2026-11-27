# 6. Разбор первого скрипта: что не так

Начинаем домашку. Прежде чем что-то менять, надо точно назвать проблемы первого
скрипта. Это и есть «исправить структуру».

!!! abstract "Цель урока"
    Ты составишь список того, что нарушено в первом скрипте, и поймёшь, что именно
    должна исправить твоя миграция.

## Шаг 1 · Прочитай первый скрипт

Вот он целиком (сокращённо до структуры):

```sql
create table military_ranks (id integer, description character varying(255));
create table employees (id integer, name text, birthday timestamp, military_rank_id integer);
create table measurment_types (id integer, short_name character varying(50), description text);
create table measurment_input_params (
    id integer,
    measurment_bath_id integer,
    height numeric(8,2) default 0,
    temperature numeric(8,2) default 0,
    pressure numeric(8,2) default 0,
    wind_direction numeric(8,2) default 0,
    wind_speed numeric(8,2) default 0
);
create table measurment_baths (id integer, emploee_id integer, measurment_type_id integer, started timestamp default now());
```

!!! question "Сделай"
    Найди строку, где параметры хранятся столбцами. Сколько их?

??? success "Проверить"
    В `measurment_input_params`: `height`, `temperature`, `pressure`,
    `wind_direction`, `wind_speed` — пять столбцов-параметров.

## Шаг 2 · Проверь, есть ли первичные ключи

```sqlplay
-- @seed base
select table_name, constraint_type, count(*)
from information_schema.table_constraints
where table_schema = 'public'
group by table_name, constraint_type
order by table_name;
```

!!! question "Сделай"
    Сколько ограничений нашлось?

??? success "Проверить"
    Ноль строк — в первом скрипте нет ни одного `PRIMARY KEY` и ни одного
    `FOREIGN KEY`. Это первая проблема.

## Шаг 3 · Проверь связи

Даже если добавить ключи, в первом скрипте связи **не объявлены**: `emploee_id`,
`military_rank_id`, `measurment_type_id` — это просто числа без ссылок.

!!! question "Сделай"
    Что мешает вставить пачку с несуществующим сотрудником прямо сейчас?

??? success "Проверить"
    Ничего. Без `FOREIGN KEY` база примет любое число — это вторая проблема.

## Шаг 4 · Найди старый синтаксис объединения

Итоговый запрос первого скрипта перечисляет таблицы через запятую:

```sql
select *
from measurment_baths, measurment_input_params, measurment_types, employees, military_ranks
where employees.id = measurment_baths.emploee_id
  and ...
```

Это синтаксис **до** `ANSI-92`. Домашка требует явный `JOIN ... ON`.

!!! question "Сделай"
    Чем опасен список таблиц через запятую?

??? success "Проверить"
    Легко забыть одно условие в `where` — и получишь перемножение строк. Явный
    `join ... on` держит условие связи рядом с таблицей, ошибиться труднее.

## Шаг 5 · Собери чек-лист миграции

!!! tip "Правило"
    Твоя миграция должна закрыть четыре пункта: ключи, справочники, нормализация
    параметров, новый запрос.

!!! question "Сделай"
    Сформулируй своими словами четыре пункта, которые надо сделать.

??? success "Проверить"
    1. Добавить `PRIMARY KEY`/`FOREIGN KEY` существующим таблицам.
    2. Создать три справочника (базовые единицы, единицы, типы параметров) и заполнить.
    3. Переделать `measurment_input_params` в `(id, bath_id, parameter_type_id, value)`.
    4. Переписать итоговый запрос на `join`.

## Что здесь что

| Проблема | Где | Что делать |
| --- | --- | --- |
| нет `PRIMARY KEY` | все таблицы | `alter table ... add constraint ... primary key` |
| нет `FOREIGN KEY` | `employees`, `measurment_baths`, `measurment_input_params` | `add constraint ... foreign key` |
| широкая таблица параметров | `measurment_input_params` | нормализовать в `EAV` |
| нет справочников единиц и типов | — | создать три таблицы |
| запятая вместо `JOIN` | итоговый запрос | переписать на `join ... on` |

## Откуда числа

Пять столбцов-параметров — из первого скрипта. Ноль ограничений — результат запроса
к `information_schema`. Это факты о текущей базе.

## Наивные вопросы

!!! question "Почему первый скрипт вообще так написали?"
    Это учебный пример «как бывает». Задача второго скрипта — показать миграцию:
    перевод плохой структуры в хорошую без потери данных.

!!! question "Можно ли просто пересоздать таблицы заново?"
    Можно, но тогда потеряешь данные. Домашка требует именно **миграцию** — перенести
    данные из старой формы в новую.

!!! question "Почему `emploee_id` написан с ошибкой?"
    Это опечатка в первом скрипте (`emploee` вместо `employee`). В миграции её лучше
    не тиражировать, но переименование — отдельный шаг. Если не уверен — оставь как
    есть, чтобы не ломать связи.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что произойдёт, если добавить `primary key` на таблицу с
       повторяющимися `id`?
    2. **Объясни**, почему широкая таблица параметров мешает добавлять новые параметры.
    3. **Напиши** запрос, который покажет все таблицы в `public`.

??? success "Проверить"
    1. База вернёт ошибку уникальности — нельзя сделать ключом столбец с дублями.
    2. Каждый новый параметр требует `alter table add column` и правки всех запросов.
    3. `select table_name from information_schema.tables where table_schema = 'public' order by table_name;`

## Что дальше

Список проблем готов. Теперь создаём первые два справочника — базовые единицы и
единицы измерения.
