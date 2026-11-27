---
title: Повторение
hide:
  - navigation
  - toc
---

# Повторение: SQL

Короткий возврат к тому, что уже проходил. Не новый урок: только память,
разбор ошибки и следующая дата.

<div class="mission-note mission-note--green">
  <strong>5–7 минут</strong>
  Если ответил меньше чем на 80%, не листай теорию целиком. Вернись к одному
  месту, где ошибся, и пройди карточки ещё раз.
</div>

<div data-review-topic="sql-left-join-null" data-review-title="SQL: строки без пары" markdown="1">

```quiz
{
  "title": "Повторение · left join ... is null",
  "min": 80,
  "questions": [
    {"type":"choice","q":"Что сохраняет left join?","options":["только строки с парой","все строки левой таблицы","только строки без пары","все строки обеих таблиц без условий"],"answer":1,"explain":"left join сохраняет все строки левой таблицы, а справа ставит NULL, если пары нет."},
    {"type":"truefalse","q":"После inner join where par.id is null находит пачки без измерений.","answer":false,"explain":"inner join уже выбросил такие пачки. Для поиска пропусков нужен left join."},
    {"type":"find","q":"Где ошибка?","lines":["select p.id as pack_id","from packs p","left join parametrs par on par.pack_id = p.id","where p.id is null"],"answer":3,"explain":"Проверять надо par.id is null, потому что NULL появляется в правой таблице."},
    {"type":"input","q":"Какой pack_id останется без измерений в artillery_my?","answer":["8"],"explain":"У пачки 8 нет строк в parametrs."},
    {"type":"choice","q":"Что вернёт count(par.id) для пачки без измерений?","options":["0","1","NULL","ошибку"],"answer":0,"explain":"count(column) не считает NULL, поэтому пустая пачка получает 0."}
  ]
}
```

</div>

<div class="review-result" data-review-result="sql-left-join-null">
  Загружаю дату следующего возврата…
</div>

<div data-review-topic="sql-homework-six" data-review-title="ДЗ 6: ошибки и Метео" markdown="1">

```quiz
{
  "title": "Повторение · ДЗ 6",
  "min": 80,
  "questions": [
    {"type":"choice","q":"Зачем нужен тип parameter_list?","options":["Чтобы передать в функцию одну структуру из семи полей","Чтобы ускорить join","Чтобы заменить таблицу parametrs","Чтобы хранить историю"],"answer":0,"explain":"Композитный тип — один аргумент функции вместо семи."},
    {"type":"choice","q":"Почему в отчёте нужен left join от packs к parametrs?","options":["Чтобы пустые пачки остались в отчёте","Чтобы быстрее работало","Чтобы отсортировать строки","Чтобы оставить только ошибки"],"answer":0,"explain":"inner join выбросит пачки без измерений."},
    {"type":"choice","q":"Что вернёт count(par.id) для пачки без измерений?","options":["0","1","NULL","ошибку"],"answer":0,"explain":"count(column) не считает NULL."},
    {"type":"input","q":"Какое ДДЧЧМ получится для 24 октября 09:30?","answer":["24093"],"explain":"ДД=24, ЧЧ=09, десятки минут: 30 → 3."},
    {"type":"choice","q":"Как закодировать отклонение давления −7 в БББ?","options":["507","−007","007","700"],"answer":0,"explain":"Отрицательное отклонение начинается с 5: 5 + 07."},
    {"type":"choice","q":"Что делает filter (where ...) в агрегате?","options":["Считает только строки, подходящие под условие","Фильтрует результат после group by","Работает как where до группировки","Заменяет join"],"answer":0,"explain":"Это агрегатный фильтр: он ограничивает строки внутри max/count/sum."}
  ]
}
```

<div class="review-result" data-review-result="sql-homework-six">
  Загружаю дату следующего возврата…
</div>

<div class="mission-card__actions">
  <a class="button" href="../../sql/homework-six/">К подтеме</a>
</div>

</div>

<div class="mission-card__actions">
  <a class="button button--primary" href="../../">На сегодня</a>
  <a class="button" href="../../sql/start/">К подтеме</a>
  <a class="button" href="../optimizers/">Повторение: оптимизаторы</a>
</div>
