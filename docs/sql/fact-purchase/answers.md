---
title: "Факт закупки: разбор"
---

# Факт закупки: разбор

**Сначала своя попытка.** Это ориентир для сверки, а не текст для копирования в PR.

## Что должно быть в скрипте

- `create sequence` для своего `id`;
- `create table fact_purchase` с 9 полями;
- `primary key (id)`;
- `references` на `dim_product`, `dim_unit`, `dim_group`, `dim_vendor`, `dim_time`;
- `check (quantity >= 0)`, `check (amount >= 0)`;
- `comment on table/column`;
- `insert into ... (колонки) values (...)`.

## Проверки

```sql
select count(*) as cnt from fact_purchase;
select code, quantity::int, amount::int from fact_purchase order by code;
select v.name, sum(f.amount)::int as total
from fact_purchase f
join dim_vendor v on v.id = f.vendor_id
group by v.name
order by v.name;
```

## Частые ошибки

- `id` без sequence/PK.
- `insert` без списка колонок.
- FK на несуществующий справочник.
- `delete` без `where`.
- `on conflict` вместо явной проверки.
- Цикл вместо CTE.

## Не копировать

Скрипт в PR должен быть твоим: ты объясняешь каждую строку и каждую связь.
