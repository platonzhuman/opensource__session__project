---
title: "Факт закупки: шпаргалка"
---

# Факт закупки: шпаргалка

## Карта

| Факт | Измерения |
|---|---|
| `fact_purchase` | `dim_product`, `dim_unit`, `dim_group`, `dim_vendor`, `dim_time` |

## Поля

`id`, `code`, `product_id`, `unit_id`, `group_id`, `vendor_id`, `quantity`, `amount`, `date_add`, `time_id`.

## Скелет DDL

```sql
do $$
begin
    begin
        create sequence seq_fact_purchase;
        create table fact_purchase (
            id bigint primary key default nextval('seq_fact_purchase'),
            -- твои поля и references
        );
    end;
    commit;
end $$;
```

## Чек-лист

- [ ] `do $$` и вложенные блоки.
- [ ] Свой `id` + sequence.
- [ ] FK на 5 измерений.
- [ ] `check` на количество и сумму.
- [ ] `comment on`.
- [ ] `insert` со списком колонок.
- [ ] Проверочные `select`.

## Нельзя

`on conflict`, `create table` вне `do $$`, цикл вместо CTE, `insert` без колонок, `delete` без `where`.
