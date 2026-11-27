# 5. Транзакция 3: связи и ограничения

Третья транзакция превращает «просто таблицы» в связанную схему: добавляет ключи,
связи и ограничения.

!!! abstract "Цель урока"
    Ты научишься навешивать `PRIMARY KEY`, `FOREIGN KEY` и `NOT NULL` через `alter
    table` внутри третьей транзакции.

## Шаг 1 · Три вида ограничений

| Ограничение | Что делает |
| --- | --- |
| `PRIMARY KEY` | уникальный код строки |
| `FOREIGN KEY` | ссылка на другую таблицу |
| `NOT NULL` | запрет пустых значений |
| `UNIQUE` | запрет повторов |

!!! question "Сделай"
    Чем `PRIMARY KEY` отличается от `FOREIGN KEY`?

??? success "Проверить"
    `PRIMARY KEY` — свой уникальный код строки. `FOREIGN KEY` — ссылка на чужой
    код (связь).

## Шаг 2 · Добавляем первичный ключ

Ключ добавляют командой `alter table`:

```sql
alter table positions add primary key (id);
alter table users add primary key (id);
```

!!! question "Сделай"
    Почему `alter table`, а не переписать `create table`?

??? success "Проверить"
    Таблицы уже созданы в первой транзакции. Ограничения навешивают поверх, не
    трогая данные.

## Шаг 3 · Добавляем связи

Связь — это `foreign key` на ключ другой таблицы:

```sql
alter table users
	add foreign key (position_id) references positions (id);

alter table packs
	add foreign key (user_id) references users (id);
```

!!! question "Сделай"
    На что ссылается `users.position_id`?

??? success "Проверить"
    На `positions.id` — код должности.

## Шаг 4 · И `NOT NULL`

Если колонка обязательна — запрещаем `null`:

```sql
alter table users alter column full_name set not null;
alter table users alter column position_id set not null;
```

!!! question "Сделай"
    Что произойдёт при вставке `null` в `full_name` после этого?

??? success "Проверить"
    База вернёт ошибку: `null value in column "full_name" violates not-null
    constraint`.

## Шаг 5 · Оформляем третью транзакцию

```sql
begin;

do $$ begin
	alter table positions add primary key (id);
	alter table users add foreign key (position_id) references positions (id);
	alter table users alter column full_name set not null;
	-- и так далее
end $$;

commit;
```

!!! question "Сделай"
    Чем содержимое блока отличается от двух предыдущих?

??? success "Проверить"
    Здесь только `alter table` — меняем структуру, а не создаём и не вставляем.

!!! tip "Правило"
    Порядок: сначала `primary key` родителя, потом `foreign key` ребёнка. Иначе
    ссылаться не на что.

!!! warning "Важно про прошлые замечания"
    На второй домашке учитель писал «не делай ключи и связи». Здесь — наоборот:
    задание **прямо** требует «создать связи между таблицами и ограничения».
    Так что в этой домашке они нужны.

## Откуда числа

Имена таблиц и колонок — из твоей схемы. `position_id`, `user_id` и так далее —
колонки-ссылки, которые уже существуют после первой транзакции.

## Наивные вопросы

!!! question "Что если данные «битые» (ссылка на несуществующий код)?"
    `alter table … add foreign key` проверит данные и упадёт. Тогда сначала
    исправляем данные, потом связь.

!!! question "Можно объявить ключ сразу в `create table`?"
    Можно. Но задание требует отдельную транзакцию со связями — значит, навешиваем
    их здесь.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что будет при `insert` сотрудника с `position_id = 999`?
    2. **Объясни**, почему `foreign key` добавляют после `primary key`.
    3. **Напиши** `NOT NULL` для `packs.created_on`.

??? success "Проверить"
    1. Ошибка внешнего ключа — должности с кодом 999 нет.
    2. Внешний ключ ссылается на уникальный код родителя; пока его нет — не на что ссылаться.
    3. `alter table packs alter column created_on set not null;`

## Что дальше

Схема готова. Теперь отдельный скрипт, который покажет **метаданные**.
