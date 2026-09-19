# Шпаргалка: полный скрипт

Готовый скрипт домашки целиком. Скопируй, подставь свои данные, запусти дважды
подряд — оба раза должны пройти без ошибок.

## Скрипт

```sql
-- ============================================================
-- Домашнее задание: база оборудования
-- Скрипт можно запускать повторно
-- ============================================================

-- 1. Очистка: удаляем в обратном порядке связей
DROP TABLE IF EXISTS parameters;
DROP TABLE IF EXISTS packs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS equipment_types;
DROP TABLE IF EXISTS positions;

-- 2. Структура: родители первыми
CREATE TABLE positions (
    id   INTEGER      NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_positions PRIMARY KEY (id),
    CONSTRAINT uq_positions_name UNIQUE (name)
);

CREATE TABLE equipment_types (
    id   INTEGER      NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_equipment_types PRIMARY KEY (id),
    CONSTRAINT uq_equipment_types_name UNIQUE (name)
);

CREATE TABLE users (
    id          INTEGER      NOT NULL,
    full_name   VARCHAR(150) NOT NULL,
    position_id INTEGER      NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT fk_users_position
        FOREIGN KEY (position_id) REFERENCES positions (id)
);

CREATE TABLE parameters (
    id                INTEGER      NOT NULL,
    equipment_type_id INTEGER      NOT NULL,
    name              VARCHAR(100) NOT NULL,
    unit              VARCHAR(20),
    CONSTRAINT pk_parameters PRIMARY KEY (id),
    CONSTRAINT fk_parameters_type
        FOREIGN KEY (equipment_type_id) REFERENCES equipment_types (id)
);

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

-- 3. Данные: тот же порядок
INSERT INTO positions (id, name) VALUES
    (1, 'Оператор'),
    (2, 'Механик'),
    (3, 'Инженер');

INSERT INTO equipment_types (id, name) VALUES
    (1, 'Насос'),
    (2, 'Компрессор');

INSERT INTO users (id, full_name, position_id) VALUES
    (1, 'Иванов Иван', 1),
    (2, 'Петров Пётр', 2),
    (3, 'Сидорова Анна', 3);

INSERT INTO parameters (id, equipment_type_id, name, unit) VALUES
    (1, 1, 'Давление', 'бар'),
    (2, 1, 'Расход', 'м³/ч'),
    (3, 2, 'Мощность', 'кВт');

INSERT INTO packs (id, user_id, equipment_type_id, created_on, quantity) VALUES
    (1, 1, 1, DATE '2026-09-01', 10),
    (2, 2, 1, DATE '2026-09-02', 5),
    (3, 3, 2, DATE '2026-09-03', 7);

-- 4. Проверка: объединение всех таблиц (для скриншота)
SELECT u.id           AS user_id,
       u.full_name,
       pos.name       AS position,
       p.id           AS pack_id,
       p.created_on,
       p.quantity,
       et.name        AS equipment_type,
       par.name       AS parameter,
       par.unit
FROM users u
JOIN positions pos       ON u.position_id = pos.id
JOIN packs p             ON p.user_id = u.id
JOIN equipment_types et  ON p.equipment_type_id = et.id
JOIN parameters par      ON par.equipment_type_id = et.id
ORDER BY u.id, p.id, par.id;
```

## Соответствие имён

| В задании | В скрипте |
|-----------|-----------|
| пачки | `packs` |
| пользователи | `users` |
| должности | `positions` |
| параметры | `parameters` |
| типы оборудования | `equipment_types` |

## Мини-проверка перед сдачей

- [ ] Скрипт запускается дважды без ошибок.
- [ ] У каждой таблицы есть `PRIMARY KEY`.
- [ ] Порядок `DROP` — обратный порядку `CREATE`.
- [ ] `INSERT` идёт после всех `CREATE`.
- [ ] `SELECT` возвращает данные из всех пяти таблиц.
- [ ] Сделан скриншот результата.
- [ ] Работа в отдельной ветке, создан Pull Request.
