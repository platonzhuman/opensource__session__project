---
title: "Собрать базовый скрипт за один заход"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-domashka" data-title="Собрать базовый скрипт за один заход" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">SQL · базовый скрипт · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 45 минут

Собираем не весь курс, а рабочую домашку: таблицы, данные, повторный запуск и
один `JOIN`. Четыре решения за заход:

1. **Таблицы и ключи** — у каждой записи есть уникальный код, связи идут по ключам.
2. **Повторный запуск** — скрипт можно запустить второй раз без ошибок.
3. **JOIN** — пачки соединяются с пользователями и оборудованием.
4. **Перенос** — то же самое появляется в твоём `.sql`-файле.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей. Готовое решение до попытки не показывается.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 10 минут</span>

## Таблицы и ключи

Одна строка в `packs` — один сеанс измерений. Пользователь и оборудование
хранятся не текстом, а кодами: `user_id` и `eq_type_id`.

| Таблица | Что хранит | Ключ |
| --- | --- | --- |
| `users` | сотрудники | `id` |
| `packs` | пачки измерений | `id`, `user_id → users.id`, `eq_type_id → eq_types.id` |
| `parametrs` | измерения внутри пачки | `id`, `pack_id → packs.id` |

`primary key` делает код уникальным. `foreign key` не даёт сослаться на
несуществующую запись. Этого достаточно, чтобы связи не расползались.

### Почини

Запрос считает строки после соединения с `parametrs`. Одна пачка повторяется
столько раз, сколько в ней измерений, поэтому числа завышены. Верни `user_id`
и количество пачек в колонке `packs`: у пользователей 1, 2 и 3 должно быть 3, 3 и 2.

```sqlplay
-- @seed artillery_my
-- @mode fix
-- @expect {"columns":["user_id","packs"],"rows":[[1,3],[2,3],[3,2]]}
-- @hint Считай уникальные пачки, а не строки после соединения с parametrs.
select u.id as user_id, count(*) as packs
from users u
left join packs p on p.user_id = u.id
left join parametrs par on par.pack_id = p.id
group by u.id
order by u.id;
```

</section>

<section class="mission-step" data-step="3" markdown="1">

<span class="mission-label">Шаг 3 · 8 минут</span>

## Повторный запуск

Первый запуск создаёт таблицы. Второй пытается создать их снова и падает:
`relation "packs" already exists`. Домашка требует, чтобы скрипт запускался
повторно.

Перед `create table` удаляй старые таблицы. Порядок обратный связям: сначала
дочерние, потом родительские.

```sql
drop table if exists parametrs;
drop table if exists packs;
drop table if exists users;
drop table if exists eq_types;
drop table if exists positions;
```

`if exists` спасает первый запуск: удалять пока нечего, ошибки нет. Если
удалить `users` раньше `packs`, внешний ключ не даст это сделать.

<div class="mission-note mission-note--blue">
  <strong>Проверка</strong>
  Запусти готовый скрипт дважды подряд. Оба запуска должны пройти без ошибок.
</div>

</section>

<section class="mission-step" data-step="4" data-require-check markdown="1">

<span class="mission-label">Шаг 4 · 10 минут</span>

## JOIN: пачки по оборудованию

Теперь считаем пачки по типам оборудования. Начни с `eq_types`: тип, у которого
ещё нет пачек, тоже должен попасть в результат. Затем присоедини `packs` и
посчитай пачки.

### Напиши сам

Верни `eq_type_id` и число пачек в колонке `packs`. Ожидается `1 → 5`, `2 → 3`.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["eq_type_id","packs"],"rows":[[1,5],[2,3]]}
-- @hint Иди от eq_types: left join packs по eq_type_id, затем count(p.id) и group by e.id.
-- Напиши запрос ниже.
```

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 7 минут</span>

## Перенеси в скрипт

Собери свой `.sql`-файл. Проверяй не по частям, а запуском целиком.

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-drop"> Перед <code>create table</code> есть <code>drop table if exists</code> в порядке от <code>parametrs</code> к <code>positions</code>.</li>
  <li><input type="checkbox" data-save="check-pk"> У каждой основной таблицы есть <code>primary key</code>.</li>
  <li><input type="checkbox" data-save="check-fk"> <code>packs.user_id</code> и <code>packs.eq_type_id</code> ссылаются на справочники, <code>parametrs.pack_id</code> — на <code>packs.id</code>.</li>
  <li><input type="checkbox" data-save="check-rerun"> Скрипт запускается дважды подряд без ошибок.</li>
  <li><input type="checkbox" data-save="check-join"> <code>JOIN</code>-запрос возвращает пачки с пользователем и оборудованием.</li>
</ul>

<div class="mission-note mission-note--green">
  <strong>Не усложняй</strong>
  Сначала рабочий скрипт из пяти основных таблиц. Справочники единиц и типов
  параметров добавь только если они нужны твоему преподавателю.
</div>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 5 минут</span>

## Вывод и память

Сформулируй вывод в четырёх предложениях: что создаёт скрипт, как проверяется
повторный запуск, что показывает `JOIN`, где остался риск.

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Скрипт создаёт...
2. Повторный запуск...
3. JOIN показывает...
4. Риск..."></textarea>

Закрой текст и ответь по памяти.

<ul class="mission-memory">
  <li>Зачем нужен <code>drop table if exists</code> перед <code>create table</code>?</li>
  <li>Почему <code>parametrs</code> удаляется раньше <code>packs</code>?</li>
  <li>Почему после соединения с <code>parametrs</code> считают <code>distinct p.id</code>, а не <code>*</code>?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2–4."></textarea>

<div class="mission-note mission-note--green">
  <strong>Завтра утром · 3 минуты</strong>
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
  <strong>Скрипт собран</strong>
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
