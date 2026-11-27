---
title: "Привести схему к ТЗ"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-fix-tz" data-title="Привести схему к ТЗ" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">SQL · исправление под ТЗ · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 3 минуты</span>

## План на 30 минут

Приводим схему к ТЗ. Не переписываем всё заново: находим проблемные данные,
добавляем ограничения и проверяем, что схема их держит.

1. **Требования ТЗ** — типы оборудования, параметры, единицы.
2. **Пачки без измерений** — данные, которые не проходят проверку.
3. **Тот же запрос с нуля** — без подсказки.
4. **NOT NULL, UNIQUE, CHECK** — правила ТЗ внутри схемы.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей. Готовое решение до попытки не показывается.
</div>

</section>

<section class="mission-step" data-step="2" markdown="1">

<span class="mission-label">Шаг 2 · 5 минут</span>

## Что требует ТЗ

В ТЗ заданы два типа оборудования — `ДМК` и `ВР`, шесть параметров, их единицы
и диапазоны. Схема должна хранить значения, а не только названия параметров.

| Правило ТЗ | Как его держит схема |
| --- | --- |
| У пачки есть пользователь, оборудование и дата | `not null` |
| Название оборудования не повторяется | `unique` |
| Значение параметра заполнено | `not null` |
| Параметр относится к известному типу | `foreign key` |
| Значение не выходит за общий диапазон | `check` |

Сначала данные, потом ограничения. Если в таблице уже есть `null` или дубли,
`alter table` упадёт. Поэтому проверки из этого захода идут до миграции.

```sql
create table packs (
    id int primary key,
    user_id int not null,
    eq_type_id int not null,
    created_on date not null
);
```

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 7 минут</span>

## Пачки без измерений

Пачка без измерений — это пачка, для которой в `parametrs` нет ни одной строки.
`left join` оставляет её в результате, а колонки справа заполняет `null`.
Признак — `par.id is null`.

Сейчас стоит `join`, поэтому пачка 8 исчезает и запрос возвращает ноль строк.

### Почини

Оставь пачки без измерений. Ожидается одна строка — `pack_id = 8`.

```sqlplay
-- @seed artillery_my
-- @mode fix
-- @expect {"columns":["pack_id"],"rows":[[8]]}
-- @hint inner join выбрасывает пачки без пары. Оставь пачки через left join.
select p.id as pack_id
from packs p
join parametrs par on par.pack_id = p.id
where par.id is null
order by p.id;
```

</section>

<section class="mission-step" data-step="4" data-require-check markdown="1">

<span class="mission-label">Шаг 4 · 7 минут</span>

## То же с нуля

Напиши запрос без подсказки из шага 3. Верни только `pack_id` пачек, у которых
нет ни одного измерения.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["pack_id"],"rows":[[8]]}
-- @hint left join parametrs по pack_id, затем where par.id is null.
-- Напиши запрос ниже.
```

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 5 минут</span>

## Перенеси в схему

Три ограничения закрывают разные правила:

| Ограничение | Что гарантирует | Пример |
| --- | --- | --- |
| `not null` | значение обязательно | `created_on date not null` |
| `unique` | повторов нет | `name varchar(150) unique` |
| `check` | условие истинно | `check (value between -1000 and 1000)` |

Ограничение добавляй после того, как данные исправлены. Если ограничение уже
есть, повторно его не добавляй.

```sql
alter table packs
    alter column created_on set not null;

alter table eq_types
    add constraint uq_eq_types_name unique (name);

alter table parametrs
    add constraint ck_parametrs_value
    check (value between -1000 and 1000);
```

<div class="mission-note mission-note--blue">
  <strong>Важно для EAV</strong>
  Диапазон зависит от <code>parameter_type_id</code>: температура 10..20 и
  давление 500..900 — разные правила. Один <code>check</code> на
  <code>value</code> этого не заменит. Такие диапазоны проверяй запросом.
</div>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-empty"> Пачки без измерений найдены до миграции.</li>
  <li><input type="checkbox" data-save="check-not-null"> <code>not null</code> стоит на обязательных полях.</li>
  <li><input type="checkbox" data-save="check-unique"> <code>unique</code> — на названиях, которые не должны повторяться.</li>
  <li><input type="checkbox" data-save="check-check"> <code>check</code> не противоречит данным и не дублирует существующее ограничение.</li>
  <li><input type="checkbox" data-save="check-migration"> Скрипт миграции запускается на чистой базе без ошибок.</li>
</ul>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 3 минуты</span>

## Вывод и память

Сформулируй вывод в четырёх предложениях: что было не так в схеме, какое
ограничение добавил, как проверил, что осталось проверять запросом.

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. В схеме было...
2. Добавил ограничение...
3. Проверил так...
4. Запросом осталось проверить..."></textarea>

Закрой текст и ответь по памяти.

<ul class="mission-memory">
  <li>Почему <code>left join ... is null</code> находит пачку без измерений?</li>
  <li>Чем <code>not null</code> отличается от <code>check</code>?</li>
  <li>Почему один <code>check</code> на <code>value</code> не заменяет проверку диапазонов по типам?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 3–5."></textarea>

<div class="mission-note mission-note--green">
  <strong>Завтра утром · 2 минуты</strong>
  Закрой всё и ответь на эти же три вопроса. Если ответы стали короче и точнее —
  память работает.
</div>

<textarea class="mission-textarea" data-save="error" placeholder="Одна ошибка за сегодня: что думал, что оказалось, по какому признаку узнаю в следующий раз."></textarea>

</section>

<div class="mission-controls">
  <button type="button" class="mission-btn mission-btn--ghost" data-prev>Назад</button>
  <span class="mission-spacer"></span>
  <button type="button" class="mission-btn mission-btn--primary" data-next>Дальше</button>
</div>

<p class="mission-hint" data-hint>Один экран — один шаг. Сначала попытка, потом проверка.</p>

<div class="mission-done" data-complete hidden>
  <strong>Схема приведена к ТЗ</strong>
  <p>
    Ты прошёл заход. Не закрывай вкладку сразу: запиши одну ошибку и вернись к
    трём вопросам завтра утром.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../">К плану курса</a>
    <a class="button" href="../../../">На сегодня</a>
  </div>
</div>

</div>
