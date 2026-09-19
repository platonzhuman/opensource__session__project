# 3. Убираем связи

Преподаватель сказал: «Связи мы пока не делаем. Это лишнее». После урока ты
поймёшь, что именно удаляем и что при этом остаётся.

## Что такое связь

!!! note "Определение"
    **Связь** (в схеме) — это объявленный `FOREIGN KEY`: правило, по которому
    столбец одной таблицы обязан ссылаться на существующую запись другой.

Пример из прошлой версии:

```sql
constraint fk_packs_user
    foreign key (user_id) references users (id)
```

Здесь `packs.user_id` не может указывать на несуществующего пользователя.

## Что значит «убрать связи»

Удаляем только строки `FOREIGN KEY`. **Столбцы остаются.** `user_id`,
`equipment_type_id`, `pack_id` продолжают существовать как обычные целые числа.

Было:

```sql
create table packs (
    id                integer not null,
    user_id           integer not null,
    equipment_type_id integer not null,
    constraint pk_packs primary key (id),
    constraint fk_packs_user foreign key (user_id) references users (id),
    constraint fk_packs_type foreign key (equipment_type_id) references equipment_types (id)
);
```

Стало:

```sql
create table packs (
    id                integer not null,
    user_id           integer not null,
    equipment_type_id integer not null,
    constraint pk_packs primary key (id)
);
```

Разница: пропали два `constraint ... foreign key`, столбцы те же.

## Что при этом меняется

| Было со связями | Стало без связей |
|-----------------|------------------|
| СУБД не даёт вставить «битую» ссылку | За корректность ссылок следишь сам |
| Порядок удаления таблиц критичен | Порядок удаления свободнее |
| `SELECT` соединяет по ключам | `SELECT` соединяет так же, но без гарантий |

!!! warning "Ошибка"
    Удалить вместе со связями и столбцы `user_id`, `equipment_type_id`, `pack_id`.
    Тогда объединять таблицы будет не по чему. Столбцы нужны, убираем только
    объявления `FOREIGN KEY`.

## Уникальные коды остаются

Требование «у каждой записи уникальный код» выполняет `PRIMARY KEY`, а не связь.
Поэтому `pk_...` оставляем у всех пяти таблиц.

```sql
constraint pk_packs primary key (id)
```

## Что дальше

В уроке 4 собираем все пять таблиц заново.
