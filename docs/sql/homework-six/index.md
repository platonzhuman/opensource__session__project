---
title: "ДЗ 6: ошибки и Метео"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sql-homework-six" data-subtopic="sql-homework-six" data-title="ДЗ 6: ошибки и Метео" data-review="1,3,7,14,30" data-review-url="../../review/sql/" data-skills="sql-plpgsql,composite-type,validation,cte,window,meteo" data-strict="1" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">SQL · PL/pgSQL · одна подтема</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 8</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · жизненный пример · 5 минут</span>

## Заказчик приходит на демо и хочет три вещи

Ты показываешь решение по метеопосту. Заказчик открывает экран и просит:

1. **Проверить параметры.** В исходных данных есть ошибки: пропущенные
   измерения, значения вне диапазона, лишние параметры для оборудования.
   Нужен отчёт «Список параметров с ошибками» — одна строка на пачку.
2. **Найти лучшего стрелка.** Список пользователей и количество ошибок в их
   параметрах.
3. **Показать шапку Метео.** `ДДЧЧМ`, `ВВВВ`, `БББТТ` — три функции расчёта.

Если проверка врёт, заказчик увидит «всё хорошо» там, где данные сломаны.
Если шапка считается неправильно — неверным будет весь бюллетень.

**Артефакт захода:** три скрипта — константы, основной PL/pgSQL-скрипт и
SQL-запросы. Полный модуль — в шаге 8.

<div class="mission-note">
  <strong>План на 60–90 минут</strong>
  1. Модель: правила, отчёт, Метео. 2. Диагностика. 3. Практика с каркасом.
  4. Куски домашки. 5. Половина модуля. 6. Полный модуль и защита.
</div>

</section>

<section class="mission-step" data-step="2" markdown="1">

<span class="mission-label">Шаг 2 · теория · 10 минут</span>

## Модель: правила, отчёт, Метео

### 1. Проверка параметров

Ошибки хранятся не в коде, а в **таблицах правил**:

```sql
create table parameter_validation (
    parameter_type_id int primary key references parameter_types (id),
    min_value         numeric,
    max_value         numeric,
    scale             smallint not null default 0,
    error_message     text not null
);

create table equipment_parameter_requirements (
    eq_type_id        int not null references eq_types (id),
    parameter_type_id int not null references parameter_types (id),
    primary key (eq_type_id, parameter_type_id)
);
```

Первая таблица отвечает на вопрос «какое значение допустимо», вторая — «какие
параметры обязательны для ДМК и ВР».

Входные параметры одной пачки удобно передать **одним значением** — составным
типом:

```sql
create type parameter_list as (
    eq_type_id     integer,
    height         numeric(8,2),
    temperature    numeric(8,2),
    pressure       numeric(8,2),
    wind_direction numeric(8,2),
    wind_speed     numeric(8,2),
    drift_range    numeric(8,2)
);
```

Функция проверки принимает `parameter_list` и возвращает строку ошибок:

```sql
create function validate_parameters(p parameter_list)
returns text
language plpgsql
as $$
declare
    v_errors text := '';
begin
    -- 1. комплект: чего не хватает для оборудования
    -- 2. лишние параметры
    -- 3. диапазоны из parameter_validation
    -- 4. количество знаков после запятой (scale)
    return nullif(v_errors, '');
end $$;
```

`nullif(v_errors, '')` важен: нет ошибок → `NULL`, а не пустая строка.

### 2. Отчёты: одна строка на пачку

Из длинной таблицы `parametrs` делаем **проекцию**: каждый параметр — в свою
колонку. Помогает агрегатный `filter`:

```sql
with pack_data as (
    select p.id as pack_id,
           p.eq_type_id,
           max(par.value) filter (where par.parameter_type_id = 1) as height,
           max(par.value) filter (where par.parameter_type_id = 2) as temperature,
           max(par.value) filter (where par.parameter_type_id = 3) as pressure,
           max(par.value) filter (where par.parameter_type_id = 4) as wind_direction,
           max(par.value) filter (where par.parameter_type_id = 5) as wind_speed,
           max(par.value) filter (where par.parameter_type_id = 6) as drift_range
    from packs p
    left join parametrs par on par.pack_id = p.id
    group by p.id, p.eq_type_id
)
select * from pack_data order by pack_id;
```

`left join` обязателен: пачка без измерений должна остаться в отчёте.
Дальше к `pack_data` добавляем проверку и получаем флаг + описание ошибки.
«Лучший стрелок» — тот же CTE, но с `left join users` и подсчётом ошибок.

### 3. Метео: шапка

Три функции из ТЗ:

| Что | Формула | Пример |
| --- | --- | --- |
| `ДДЧЧМ` | день + часы + десятки минут | 24.10 09:30 → `24093` |
| `ВВВВ` | высота четырьмя цифрами | 60 → `0060` |
| `БББ` | давление − 750; минус кодируется `5` | 765 → `015`, 743 → `507` |
| `ТТ` | `round(t0 + ΔT_V(t0) − 15.9)` | 25° → 11, 23° → 09 |

`ΔT_V` берётся из таблицы 1 ТЗ (та же, что в ДЗ-5). Для 23°:
`1.5 + (23−20)/(25−20)·0.5 = 1.8`, затем `23 + 1.8 − 15.9 = 8.9 → 9`.

Константы (`750`, `15.9` и другие) — **в отдельной таблице** и отдельном скрипте,
а не зашиты в функциях.

<div class="mission-note mission-note--blue">
  <strong>Ловушки</strong>
  <ul>
    <li><code>temperature_correction</code> хранит интервалы, а <code>lead</code> по <code>t0_from</code> даёт точки. Проверь, что отрезок не перескочил через промежуточную точку.</li>
    <li><code>count(*)</code> посчитает пустую пачку как 1. Нужен <code>count(par.id)</code>.</li>
    <li><code>filter (where ...)</code> — это часть агрегата, а не <code>where</code> после группировки.</li>
    <li>Функция проверки должна вернуть <code>NULL</code> при отсутствии ошибок, а не пустую строку.</li>
  </ul>
</div>

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · диагностика · 8 минут</span>

## Проверь модель

Ответь на вопросы. Нужно **80%** — это 6 из 8. Это не оценка, а маршрут: от
результата зависит, идём дальше или углубляемся.

```quiz
{
  "title": "Диагностика · ДЗ 6",
  "min": 80,
  "questions": [
    {"type":"choice","q":"Зачем в ДЗ нужен тип parameter_list?","options":["Чтобы функция возвращала одно значение с семью полями","Чтобы ускорить соединения таблиц","Чтобы заменить таблицу parametrs","Чтобы хранить историю изменений"],"answer":0,"explain":"Композитный тип — один параметр функции, внутри которого семь именованных полей."},
    {"type":"truefalse","q":"Функция проверки может вернуть несколько ошибок сразу — строкой или массивом.","answer":true,"explain":"Именно поэтому в задании просят строку со списком ошибок."},
    {"type":"choice","q":"Почему в отчёте нужен left join от packs к parametrs?","options":["Чтобы пустые пачки тоже попали в отчёт","Чтобы ускорить запрос","Чтобы отсортировать пачки","Чтобы получить только пачки с ошибками"],"answer":0,"explain":"inner join выбросит пачки без измерений — а их как раз надо показать."},
    {"type":"find","q":"Где ошибка в запросе «одна строка на пачку»?","lines":["select p.id, par.value","from packs p","join parametrs par on par.pack_id = p.id","group by p.id"],"answer":0,"explain":"par.value не входит в group by и не агрегирован — нужен max(...) filter (...)."},
    {"type":"choice","q":"Что вернёт count(par.id) для пачки без измерений?","options":["0","1","NULL","ошибку"],"answer":0,"explain":"count(column) не считает NULL."},
    {"type":"choice","q":"Как закодировать отклонение давления −7 в БББ?","options":["507","−007","007","700"],"answer":0,"explain":"По ТЗ отрицательное отклонение начинается с 5: 5 + 07."},
    {"type":"input","q":"Какое ДДЧЧМ получится для 24 октября 09:47?","answer":["24094"],"explain":"ДД=24, ЧЧ=09, десятки минут: 47 → 4."},
    {"type":"input","q":"Какая поправка ΔT_V для 23° по таблице 1 ТЗ (интерполяция)?","answer":["1.8","1,8"],"explain":"Между 20 (1.5) и 25 (2): 1.5 + 3/5·0.5 = 1.8."}
  ]
}
```

<div class="mission-note mission-note--green">
  <strong>Ветвление</strong>
  80%+ → практика. 60–79% → перечитай «Ловушки» и пройди заново. &lt;60% →
  вернись к теории и разбери пример с пачкой 8.
</div>

</section>

<section class="mission-step" data-step="4" data-require-check data-require-all markdown="1">

<span class="mission-label">Шаг 4 · практика с каркасом · 20 минут</span>

## Почини и напиши

### 4.1. Пустая пачка

Сейчас `join` выбрасывает пачку 8 — у неё нет измерений. Оставь её в результате.

```sqlplay
-- @seed artillery_hw6
-- @mode fix
-- @expect {"columns":["pack_id","height","temperature","pressure","wind_direction","wind_speed","drift_range"],"rows":[[8,null,null,null,null,null,null]]}
-- @hint Замени join на left join: пачка без измерений должна остаться, а все её параметры будут NULL.
select p.id as pack_id,
       max(par.value) filter (where par.parameter_type_id = 1) as height,
       max(par.value) filter (where par.parameter_type_id = 2) as temperature,
       max(par.value) filter (where par.parameter_type_id = 3) as pressure,
       max(par.value) filter (where par.parameter_type_id = 4) as wind_direction,
       max(par.value) filter (where par.parameter_type_id = 5) as wind_speed,
       max(par.value) filter (where par.parameter_type_id = 6) as drift_range
from packs p
join parametrs par on par.pack_id = p.id
where p.id = 8
group by p.id;
```

### 4.2. Значения вне диапазона

Сейчас запрос возвращает **допустимые** значения. Найди те, что выходят за
границы.

```sqlplay
-- @seed artillery_hw6
-- @mode fix
-- @expect {"columns":["pack_id","parameter_type_id","value"],"rows":[[7,3,"980.00"]]}
-- @hint Поменяй between на проверку выхода за min/max. Не забудь, что min или max могут быть NULL.
select par.pack_id, par.parameter_type_id, par.value
from parametrs par
join parameter_validation v on v.parameter_type_id = par.parameter_type_id
where par.value between v.min_value and v.max_value
order by par.pack_id;
```

### 4.3. ДДЧЧМ

Собери `ДДЧЧМ` для `24.10.2026 09:37`. Ожидается `24093`.

```sqlplay
-- @seed artillery_hw6
-- @mode write
-- @expect {"columns":["code"],"rows":[["24093"]]}
-- @hint to_char(ts, 'DDHH24') даёт день и часы. Десятки минут: extract(minute from ts)::int / 10.
-- Напиши запрос ниже.
```

### 4.4. ВВВВ

Высота 60 метров должна стать `0060`.

```sqlplay
-- @seed artillery_hw6
-- @mode write
-- @expect {"columns":["code"],"rows":[["0060"]]}
-- @hint lpad(60::int::text, 4, '0').
-- Напиши запрос ниже.
```

### 4.5. БББ

Давление 743 даёт отклонение −7. Закодируй его в `БББ`.

```sqlplay
-- @seed artillery_hw6
-- @mode write
-- @expect {"columns":["code"],"rows":[["507"]]}
-- @hint Если отклонение отрицательное — добавь '5' и две цифры модуля.
-- Напиши запрос ниже.
```

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · разбор · 10 минут</span>

## Если тебе не объясняли ДДЧЧМ, ВВВВ и БББ

Этот шаг добавлен специально: в шаге 4 уже нужно собрать `ДДЧЧМ`, `ВВВВ`
и `БББ`, но сами функции SQL в курсе не разбирались. Если `to_char`,
`extract`, `lpad`, `abs` и `case` тебе незнакомы — начни отсюда.

### Главная идея: это строка, а не число

`24093` — не число «двадцать четыре тысячи девяносто три». Это строка из
трёх частей:

```text
24 | 09 | 3
```

- `24` — день месяца;
- `09` — часы;
- `3` — десятки минут.

Поэтому в SQL мы не складываем числа, а склеиваем строки через `||` и
дополняем их нулями через `lpad`.

| Поле | Длина | Как получается | Пример |
| --- | ---: | --- | --- |
| `ДДЧЧМ` | 5 | день + часы + десятки минут | 24.10.2026 09:37 → `24093` |
| `ВВВВ` | 4 | высота, дополненная нулями | 60 → `0060` |
| `БББ` | 3 | давление − 750; минус кодируется `5` | 743 → `507` |
| `ТТ` | 2 | температура; отрицательное — `50 + модуль` | +11 → `11`, −13 → `63` |

### 1. `select` — это калькулятор

Тебе не нужны таблицы. Можно проверить любое выражение:

```sql
select 2 + 2 as result;
select 743 - 750 as delta;
```

`select` — «выведи», `as result` — имя столбца в результате.

### 2. Строки склеиваются через `||`

```sql
select '5' || '07' as result;
```

Результат:

```text
507
```

Важно: `+` — это сложение чисел, а `||` — склейка строк.

### 3. ДДЧЧМ: день, часы и десятки минут

`to_char` форматирует дату в строку:

```sql
select to_char(timestamp '2026-10-24 09:37', 'DDHH24');
-- 2409
```

- `DD` — день месяца: `24`;
- `HH24` — часы: `09`.

`extract` достаёт минуты:

```sql
select extract(minute from timestamp '2026-10-24 09:37');
-- 37
```

Нам нужны десятки минут, поэтому делим на 10 нацело:

```sql
select extract(minute from timestamp '2026-10-24 09:37')::int / 10;
-- 3
```

`::int` нужен, потому что `37 / 10` — это `3.7`, а нам нужна целая часть.

Собираем всё вместе:

```sql
select to_char(timestamp '2026-10-24 09:37', 'DDHH24')
       || (extract(minute from timestamp '2026-10-24 09:37')::int / 10)::text
       as code;
```

Ожидается:

```text
24093
```

### 4. ВВВВ: высота четырьмя цифрами

`lpad(строка, длина, чем_дополнить)` добавляет нули слева:

```sql
select lpad('60', 4, '0');
-- 0060
```

Если высота — число, сначала приводим её к строке:

```sql
select lpad(60::text, 4, '0') as code;
```

Ожидается:

```text
0060
```

### 5. БББ: отклонение давления

Считаем отклонение:

```sql
select 743 - 750;
-- -7
```

Убираем минус:

```sql
select abs(743 - 750);
-- 7
```

Дополняем до двух цифр:

```sql
select lpad(abs(743 - 750)::text, 2, '0');
-- 07
```

Добавляем `5` — признак отрицательного отклонения:

```sql
select '5' || lpad(abs(743 - 750)::text, 2, '0');
-- 507
```

Полный запрос с проверкой знака:

```sql
select case
           when 743 - 750 < 0
               then '5' || lpad(abs(743 - 750)::text, 2, '0')
           else lpad((743 - 750)::text, 3, '0')
       end as code;
```

Ожидается:

```text
507
```

`case` читается так: «если отклонение отрицательное — сделай одно, иначе —
другое».

### 6. Если дойдёшь до БББТТ

`БББТТ` — это `БББ` плюс `ТТ`. Для температуры:

1. `T0 = t0 + ΔTv`, где `ΔTv` берётся из таблицы температурной поправки;
2. `ΔT = T0 − 15.9`;
3. округляем до целого;
4. положительное записываем двумя цифрами: `9 → 09`, `11 → 11`;
5. отрицательное — `50 + модуль`: `−13 → 63`.

Пример из ТЗ:

```text
давление 765, температура 25
ΔTv(25) = 2.0
T0 = 25 + 2.0 = 27.0
ΔT = 27.0 − 15.9 = 11.1 → 11
БББ = 015
ТТ = 11
БББТТ = 01511
```

### 7. Частые ошибки

- `+` не склеивает строки. Для строк нужен `||`.
- `lpad(60, 4, '0')` может не сработать: нужно `60::text`.
- `37 / 10` даёт `3.7`, а не `3`. Нужно `37::int / 10`.
- Строки пишутся в одинарных кавычках: `'24093'`, а не `"24093"`.
- В конце запроса ставь `;`.

### 8. Проверь себя

Запусти маленькие куски по отдельности:

```sql
select '5' || '07';                 -- 507
select lpad('7', 2, '0');           -- 07
select lpad(60::text, 4, '0');      -- 0060
select 743 - 750;                   -- -7
select abs(743 - 750);              -- 7
```

Если каждый кусок работает, собери из них полный запрос — как в шаге 4.

<div class="mission-note mission-note--blue">
  <strong>Если всё равно непонятно</strong>
  Это нормально. Вернись в шаг 4 и запусти куски по одному: сначала
  <code>select 743 - 750;</code>, потом <code>select abs(...)</code>, потом
  <code>lpad(...)</code>. Так видно, что делает каждая часть.
</div>

</section>

<section class="mission-step" data-step="6" data-require-check data-require-all markdown="1">

<span class="mission-label">Шаг 6 · куски домашки · 20 минут</span>

## Три маленьких куска

### 6.1. Тип parameter_list

Создай тип для семи полей пачки и достань поля из одного значения.

```sqlplay
-- @seed artillery_hw6
-- @mode write
-- @expect {"columns":["eq_type_id","height","temperature","pressure","wind_direction","wind_speed","drift_range"],"rows":[[1,"100.00","15.00","750.00","0.00","0.00",null]]}
-- @hint Создай type parameter_list (eq_type_id integer; остальные — numeric(8,2)). Затем собери значение (1, 100, 15, 750, 0, 0, NULL)::parameter_list и достань поля через (p).height.
-- Напиши код ниже.
```

### 6.2. Правила на месте

Проверь, что в таблице правил шесть строк — по числу параметров.

```sqlplay
-- @seed artillery_hw6
-- @mode write
-- @expect {"columns":["rules"],"rows":[[6]]}
-- @hint Простой count(*) по parameter_validation.
-- Напиши запрос ниже.
```

### 6.3. Мини-функция проверки

Напиши функцию `check_temperature(par numeric)`: `ОК`, если значение в
диапазоне −58…58, иначе `ОШИБКА`. Проверь её на 100.

```sqlplay
-- @seed artillery_hw6
-- @mode write
-- @expect {"columns":["result"],"rows":[["ОШИБКА"]]}
-- @hint create function ... returns text language sql as 'select case when ...'. Затем select check_temperature(100::numeric) as result.
-- Напиши код ниже.
```

### 6.4. Пачка 7

Верни `pack_id` и признак ошибки для пачки 7: есть ли у неё значение вне
диапазона.

```sqlplay
-- @seed artillery_hw6
-- @mode write
-- @expect {"columns":["pack_id","has_error"],"rows":[[7,true]]}
-- @hint exists (select 1 from parametrs par join parameter_validation v ... where par.pack_id = p.id and значение вне диапазона).
-- Напиши запрос ниже.
```

### 6.5. Лучший стрелок по диапазонам

Посчитай пользователям только ошибки **выхода за диапазон** (пропущенные
параметры здесь не считаем).

```sqlplay
-- @seed artillery_hw6
-- @mode write
-- @expect {"columns":["user_id","errors"],"rows":[[1,0],[2,0],[3,1]]}
-- @hint Иди от users. Left join packs и parametrs. Считай ошибки через sum(case when ... then 1 else 0 end) или отдельный CTE с count.
-- Напиши запрос ниже.
```

</section>

<section class="mission-step" data-step="7" data-require-check data-require-all markdown="1">

<span class="mission-label">Шаг 7 · половина модуля · 25 минут</span>

## Соединяем куски

### 7.1. Полный отчёт об ошибках

Собери запрос: одна строка на пачку, флаг ошибки и количество ошибок.
Пропущенные обязательные параметры тоже считаются ошибками.

Ожидаются пачки 4, 7 и 8 с ошибками.

```sqlplay
-- @seed artillery_hw6
-- @mode write
-- @expect {"columns":["pack_id","has_error","error_count"],"rows":[[1,false,0],[2,false,0],[3,false,0],[4,true,1],[5,false,0],[6,false,0],[7,true,1],[8,true,5]]}
-- @hint Два CTE: pack_data (pivot) и required (комплект по equipment_parameter_requirements). Затем missing — count недостающих, invalid — count выходов за диапазон. Сложи их.
-- Напиши запрос ниже.
```

### 7.2. Шапка Метео

Создай три функции и проверь их на примере ТЗ: 24.10.2026 09:30, высота 100,
давление 765, температура 25. Ожидается `24093`, `0100`, `01511`.

```sqlplay
-- @seed artillery_hw6
-- @mode write
-- @expect {"columns":["ddchchm","vvvv","bbbtt"],"rows":[["24093","0100","01511"]]}
-- @hint ДДЧЧМ — to_char + десятки минут. ВВВВ — lpad. БББТТ — pressure_base/temperature_base из meteo_constants и ΔT_V из get_interpolation_type_correction.
-- Напиши код ниже.
```

<div class="mission-note mission-note--blue">
  <strong>Стоп-проверка</strong>
  Если 7.1 или 7.2 не зелёные — не переходи к шагу 8. Вернись к 4.1–4.5:
  почти всегда ошибка в join, группировке или формате кода.
</div>

<h3>Объясни</h3>

<textarea class="mission-textarea" data-save="half-explain" placeholder="Почему в отчёте нужен left join? Почему пропущенные параметры считаются ошибкой? Как ты кодируешь отрицательные БББ и ТТ?"></textarea>

</section>

<section class="mission-step" data-step="8" data-require-check markdown="1">

<span class="mission-label">Шаг 8 · полный модуль · 40–60 минут</span>

## Собери и сдай

### Три файла

| Файл | Что внутри |
| --- | --- |
| `home_work_six_constants.sql` | таблицы правил, требований и констант + `insert` |
| `home_work_six.sql` | тип `parameter_list`, проверка, метео-функции |
| `home_work_six_queries.sql` | отчёт об ошибках, лучший стрелок, проверка Метео |

Порядок запуска: **constants → main → queries**. Каждый скрипт — повторно
запускаемый (`create if not exists` / `create or replace`).

### Чек-лист качества

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="full-columns"> Колонки перечислены явно, без <code>select *</code>.</li>
  <li><input type="checkbox" data-save="full-left"> В отчётах — <code>left join</code>, пустые пачки не теряются.</li>
  <li><input type="checkbox" data-save="full-count"> Считается <code>count(par.id)</code>, а не <code>count(*)</code>.</li>
  <li><input type="checkbox" data-save="full-filter"> Проекция сделана через <code>filter (where ...)</code>, одна строка на пачку.</li>
  <li><input type="checkbox" data-save="full-cte"> Все запросы — с CTE; где уместно — окно и группировка.</li>
  <li><input type="checkbox" data-save="full-constants"> Константы — в отдельных таблицах, не в теле функций.</li>
  <li><input type="checkbox" data-save="full-null"> Проверка возвращает <code>NULL</code> при отсутствии ошибок.</li>
  <li><input type="checkbox" data-save="full-rerun"> Все три скрипта запускаются повторно без ошибок.</li>
  <li><input type="checkbox" data-save="full-pr"> PR — из свежего <code>main</code>, только файлы этой домашки.</li>
</ul>

### Что сказать на уроке за 60 секунд

1. Тип `parameter_list` — один параметр вместо семи.
2. Проверка: комплект по оборудованию, диапазоны, знаки после запятой.
3. Отчёт: CTE + `filter`, одна строка на пачку, `left join` для пустых.
4. «Лучший стрелок» — те же ошибки, сгруппированные по пользователю.
5. Метео: `ДДЧЧМ` из времени, `ВВВВ` из высоты, `БББТТ` из давления и температуры.
6. Главный риск: перепутать интервалы и точки в `temperature_correction`.

### Объясни и запиши ошибку

<textarea class="mission-textarea" data-save="full-explain" placeholder="Почему проверка хранится в таблицах, а не в коде? Что сломается, если в отчёте заменить left join на join? Почему константы вынесены в отдельный скрипт?"></textarea>

<textarea class="mission-textarea" data-save="error" placeholder="Одна ошибка за сегодня: что думал, что оказалось, по какому признаку узнаю в следующий раз."></textarea>

<div class="mission-note">
  <strong>Перед PR</strong>
  Проверь запуск на чистой базе: constants → main → queries. Убедись, что в
  ветке нет файлов прошлых домашек и классных работ — учитель это уже отмечал.
</div>

</section>

<div class="mission-controls">
  <button type="button" class="mission-btn mission-btn--ghost" data-prev>Назад</button>
  <span class="mission-spacer"></span>
  <button type="button" class="mission-btn mission-btn--primary" data-next>Дальше</button>
</div>

<p class="mission-hint" data-hint>Один экран — один шаг. Сначала попытка, потом проверка.</p>

<div class="mission-done" data-complete hidden>
  <strong>Подтема собрана</strong>
  <p>
    Ты прошёл путь от требований заказчика до трёх скриптов и защиты. Заход
    попадёт в повторение через 1, 3, 7, 14 и 30 дней.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../../../">К повторениям</a>
    <a class="button" href="../../">Все SQL-заходы</a>
  </div>
</div>

</div>
