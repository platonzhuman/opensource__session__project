---
title: "Front: ответы"
hide:
  - navigation
---

# Front: ответы

!!! warning "Сначала сам"
    Сюда — после попытки. В PR не класть.
    Полный код домашки — на странице [«Полный код для сверки»](reference.md),
    но и его нельзя копировать в PR.

## Сумма продаж

```tsql
-- @id sales-amount
select sum(quantity) as quantity,
	sum(amount) as amount
from journal
where transtype = 101;
```

## Пример данных для README

```tsql
-- @id readme-example
select top 3 ID, DocumentID, OperationID, ProductID, Count, Amount
from bm_StorageOperations
where OperationID = 1
order by ID;
```

## ER: строки в чеке

```tsql
-- @id er-lines-per-receipt
select top 5 receiptn, count(*) as lines
from journal
where transtype = 101
group by receiptn
order by lines desc, receiptn;
```

## Что нельзя копировать без понимания

- `sum(Count)` — почему не `Quantity` и не `Rest`.
- `count(distinct receiptn)` — чем отличается от `count(*)`.
- `top 5` — чем отличается от `limit 5` в PostgreSQL.
- `cast(... as date)` — зачем убирать время.
