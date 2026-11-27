---
title: Практика
hide:
  - navigation
  - toc
---

<div class="hero">
  <span class="hero__kicker">один экран · три языка</span>
  <h1 class="hero__title">Практика</h1>
  <p class="hero__lead">
    Python, JavaScript и SQL в одной песочнице. Меняй один параметр, запускай
    и смотри, что меняется. Это не тест: ошибаться можно.
  </p>
</div>

<div class="practice-tabs" role="tablist" aria-label="Язык практики">
  <button type="button" class="practice-tab is-active" data-practice-tab="python">Python</button>
  <button type="button" class="practice-tab" data-practice-tab="js">JavaScript</button>
  <button type="button" class="practice-tab" data-practice-tab="sql">SQL</button>
</div>

<section class="practice-panel" data-panel="python" markdown="1">

## Python

Напиши `sum_squares(n)`: сумму квадратов от 1 до `n`. Для `n=4` должно быть
`30`.

```pyplay
# @mode write
# @expect 30
# @hint Создай сумму, пройди циклом range(1, n + 1), прибавь i * i и напечатай результат.
# Напиши функцию и вызови sum_squares(4).
```

</section>

<section class="practice-panel" data-panel="js" hidden markdown="1">

## JavaScript

То же самое на JavaScript. Для `n=4` в консоли должно быть `30`.

```jsplay
// @mode write
// @expect 30
// @hint Используй цикл for и console.log(sumSquares(4)).
// Напиши функцию sumSquares(n).
```

</section>

<section class="practice-panel" data-panel="sql" hidden markdown="1">

## SQL

Верни `pack_id` пачек, у которых нет ни одного измерения. В сиде это пачка `8`.

```sqlplay
-- @seed artillery_my
-- @mode write
-- @expect {"columns":["pack_id"],"rows":[[8]]}
-- @hint Начни с packs p, сделай left join parametrs par по pack_id и оставь par.id is null.
-- Напиши запрос ниже.
```

</section>

<div class="mission-note mission-note--blue">
  <strong>Куда дальше</strong>
  Вернись в курс, открой шаг практикума и запиши, что проверил. Или сразу
  переходи в [курсы](../courses/) и [повторение](../review/).
</div>
