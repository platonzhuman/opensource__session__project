# Ответы и разборы

Открывай после попытки. Здесь — решения, полный скрипт анализа и типичные ошибки.

## Ответы теста самопроверки

1. `DML` меняет данные (`insert`, `update`, `delete`), `DDL` — структуру (`create`, `alter`, `drop`).
2. Разбивает строки на группы по значению колонки.
3. `where` фильтрует строки **до** группировки, `having` — группы **после**.
4. `left join` оставляет пачки без измерений, чтобы их найти (у внутреннего `join` они исчезают).
5. Считает количество **уникальных** значений (например, сколько разных счётчиков).
6. `value between min and max`.
7. `is null` проверяет отсутствие значения; `= null` всегда даёт «неизвестно».
8. Чтобы единица соответствовала параметру (температура — `°C`, а не `м/с`).

## Ответы к практике

- **Задание 1:** `select count(*) from packs;` → `8`.
- **Задание 2:** `select u.full_name, count(p.id) from users u left join packs p on p.user_id = u.id group by u.full_name order by count(p.id);`
- **Задание 3:** `select count(*) from packs p left join parametrs par on par.pack_id = p.id where par.id is null;` → `1`.
- **Задание 4:** `select count(*) from (select p.id from packs p left join parametrs par on par.pack_id = p.id group by p.id having count(par.id) <> 5) t;` → `2`.
- **Задание 5:** то же, что проверка 4 → `1`.
- **Задание 6:** то же, что проверка 5 → `1`.
- **Задание 7:** `... having count(par.id) > 5` → пусто.
- **Задание 8:** `select u.full_name from users u left join packs p on p.user_id = u.id group by u.full_name order by count(p.id) limit 1;` → Сидоров.

## Полный скрипт анализа

Это решение для сверки. Сначала напиши своё и сравни.

```sql
-- 1. у каждого пользователя одинаковое число измерений?
select u.id, u.full_name, count(p.id) as packs
from users u
left join packs p on p.user_id = u.id
group by u.id, u.full_name
order by packs;

-- то же одним числом: 1 — одинаково, больше — нет
select count(distinct cnt) as разных_значений
from (
	select count(p.id) as cnt
	from users u
	left join packs p on p.user_id = u.id
	group by u.id
) t;

-- 2. пустые пачки
select p.id as pack_id
from packs p
left join parametrs par on par.pack_id = p.id
where par.id is null;

-- 3. пачки не с 5 параметрами
select p.id as pack_id, count(par.id) as cnt
from packs p
left join parametrs par on par.pack_id = p.id
group by p.id
having count(par.id) <> 5
order by p.id;

-- 4. значения вне диапазона
select par.id, pt.name, par.value
from parametrs par
join parameter_types pt on pt.id = par.parameter_type_id
where (pt.id = 2 and par.value not between -58 and 58)
   or (pt.id = 3 and par.value not between 500 and 900)
   or (pt.id = 4 and par.value not between 0 and 59)
   or (pt.id = 5 and par.value not between 0 and 15)
   or (pt.id = 6 and par.value not between 0 and 150);

-- 5. неверные единицы
select pt.id, pt.name, un.short_name
from parameter_types pt
join units un on un.id = pt.unit_id
where (pt.name like 'высота%' and un.short_name <> 'м')
   or (pt.name like 'температура%' and un.short_name <> '°C')
   or (pt.name like 'давление%' and un.short_name <> 'мм рт. ст.')
   or (pt.name like 'направление%' and un.short_name <> 'б. д. у.')
   or (pt.name like 'скорость%' and un.short_name <> 'м/с')
   or (pt.name like 'дальность%' and un.short_name <> 'м');
```

## Ожидаемые результаты на данных от ИИ

| Проверка | Что нашли |
| --- | --- |
| 1 | у Сидорова `2` пачки, у остальных по `3` → **нет** |
| 2 | пачка `8` пустая → **есть** |
| 3 | пачки `4` (4 шт) и `8` (0 шт) → **не полный** |
| 4 | измерение `32`, давление `980` → **вне диапазона** |
| 5 | параметр `7`, «температура воздуха» с `м/с` → **неверная единица** |

## Типичные ошибки

- **`join` вместо `left join`.** Пользователи и пачки без пар исчезают из результата.
- **`where` вместо `having`.** Фильтр по агрегату (`count`) в `where` не работает.
- **`= null` вместо `is null`.** Никогда не сработает.
- **`and` вместо `or`** в проверке диапазонов — тогда ищутся значения, нарушающие все условия сразу.
- **Забыли `join parameter_types`.** Без него не понять, какой это параметр и какой у него диапазон.

## Что дальше

Собери свой скрипт, сними скриншоты к каждому запросу и открой Pull Request.
Шпаргалка по синтаксису — в `cheatsheet.md`.
