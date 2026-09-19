# Ответы и разборы

Сначала пробуй сам, потом сверяйся. Ниже — решения и объяснения.

## Задание 1

```sql
CREATE TABLE positions (
    id   INTEGER      NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_positions PRIMARY KEY (id),
    CONSTRAINT uq_positions_name UNIQUE (name)
);
```

Почему так: `id` — уникальный код записи, поэтому `PRIMARY KEY`. Название должности
повторяться не должно, поэтому `UNIQUE`.

!!! warning "Частая ошибка"
    Поставить `PRIMARY KEY` на `name`. Тогда две должности с одинаковым названием
    станут невозможны, а код записи останется без ключа.

## Задание 2

```sql
CREATE TABLE equipment_types (
    id   INTEGER      NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_equipment_types PRIMARY KEY (id),
    CONSTRAINT uq_equipment_types_name UNIQUE (name)
);
```

Почему так: структура та же, но имена ограничений свои. В одной базе два
ограничения с именем `pk_positions` существовать не могут.

## Задание 3

```sql
DROP TABLE IF EXISTS parameters;
DROP TABLE IF EXISTS packs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS equipment_types;
DROP TABLE IF EXISTS positions;
```

Почему так: сначала дети, потом родители. `packs` ссылается на `users` и
`equipment_types`, поэтому удаляется раньше них. `parameters` ссылается на
`equipment_types`, поэтому тоже раньше. `positions` — последняя, на неё никто не
ссылается после удаления `users`.

!!! warning "Частая ошибка"
    Скопировать порядок из блока `CREATE`. Там `positions` первая, здесь она
    должна быть последней.

## Задание 4

```sql
CREATE TABLE users (
    id          INTEGER      NOT NULL,
    full_name   VARCHAR(150) NOT NULL,
    position_id INTEGER      NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT fk_users_position
        FOREIGN KEY (position_id) REFERENCES positions (id)
);
```

Почему так: `position_id` хранит код должности, а `FOREIGN KEY` не даёт вставить
пользователя с несуществующей должностью.

## Задание 5

```sql
CREATE TABLE parameters (
    id                INTEGER      NOT NULL,
    equipment_type_id INTEGER      NOT NULL,
    name              VARCHAR(100) NOT NULL,
    unit              VARCHAR(20),
    CONSTRAINT pk_parameters PRIMARY KEY (id),
    CONSTRAINT fk_parameters_type
        FOREIGN KEY (equipment_type_id) REFERENCES equipment_types (id)
);
```

Почему так: `unit` без `NOT NULL` — единица измерения может быть не указана,
пустое значение здесь допустимо.

## Задание 6

```sql
CREATE TABLE packs (
    id                INTEGER NOT NULL,
    user_id           INTEGER NOT NULL,
    equipment_type_id INTEGER NOT NULL,
    created_on        DATE    NOT NULL,
    quantity          INTEGER NOT NULL,
    CONSTRAINT pk_packs PRIMARY KEY (id),
    CONSTRAINT fk_packs_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_packs_type
        FOREIGN KEY (equipment_type_id) REFERENCES equipment_types (id)
);
```

Почему так: `packs` — центральная таблица, она ссылается на двух родителей.
Поэтому её создаём последней, а удаляем первой.

## Задание 7

```sql
INSERT INTO positions (id, name) VALUES
    (1, 'Оператор'),
    (2, 'Механик');

INSERT INTO equipment_types (id, name) VALUES
    (1, 'Насос'),
    (2, 'Компрессор');

INSERT INTO users (id, full_name, position_id) VALUES
    (1, 'Иванов Иван', 1),
    (2, 'Петров Пётр', 2);

INSERT INTO parameters (id, equipment_type_id, name, unit) VALUES
    (1, 1, 'Давление', 'бар'),
    (2, 1, 'Расход', 'м³/ч'),
    (3, 2, 'Мощность', 'кВт');

INSERT INTO packs (id, user_id, equipment_type_id, created_on, quantity) VALUES
    (1, 1, 1, DATE '2026-09-01', 10),
    (2, 2, 1, DATE '2026-09-02', 5),
    (3, 2, 2, DATE '2026-09-03', 7);
```

Почему так: порядок совпадает с порядком создания. Каждый `position_id` в `users`
уже существует, каждый `user_id` в `packs` тоже.

!!! warning "Частая ошибка"
    Вставить пачку с `user_id = 5`, когда пользователя с кодом 5 нет. Внешний
    ключ отклонит строку.

## Задание 8

```sql
SELECT u.id           AS user_id,
       u.full_name,
       p.name         AS position,
       pk.id          AS pack_id,
       pk.created_on,
       pk.quantity,
       et.name        AS equipment_type,
       pr.name        AS parameter,
       pr.unit
FROM users u
JOIN positions p        ON u.position_id = p.id
JOIN packs pk           ON pk.user_id = u.id
JOIN equipment_types et ON pk.equipment_type_id = et.id
JOIN parameters pr      ON pr.equipment_type_id = et.id
ORDER BY u.id, pk.id, pr.id;
```

Почему так: четыре `JOIN` соединяют пять таблиц в одну цепочку. Псевдонимы
сокращают имена. `ORDER BY` делает результат читаемым.

!!! warning "Частая ошибка"
    Соединить `parameters` с `packs` напрямую. Общего ключа у них нет. Связь идёт
    через `equipment_types`.

## Задание 9

```bash
git checkout -b homework-sql
git add homework.sql
git commit -m "Add homework SQL script"
git push -u origin homework-sql
```

Почему так: ветка создаётся до коммита, `push -u` публикует её и связывает с
локальной. После этого на сервере можно открыть Pull Request.

## Ответы на самопроверку

1. `PRIMARY KEY`. Ключ гарантирует уникальность и запрет пустых значений.
2. СУБД уже хранит таблицу с таким именем. `CREATE TABLE` не пересоздаёт её.
3. В обратном порядке создания. Сначала дети, потом родители.
4. Удаляет таблицу, если она есть, иначе ничего не делает.
5. `UNIQUE` допускает `NULL`, ключ — нет.
6. `JOIN positions p ON u.position_id = p.id`. Связь по паре «внешний ключ →
   первичный ключ».
7. Из-за связи «один ко многим» при соединении. Один тип оборудования с
   несколькими параметрами размножает строки.
8. Отправляет ветку на сервер и связывает её с локальной.
9. Нет, это расширение СУБД. В строгом ANSI-92 у `DROP TABLE` нет `IF EXISTS`.
10. Да, иначе легко ошибиться с порядком значений.
