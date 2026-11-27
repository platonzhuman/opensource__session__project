---
title: "Среднее, интервал и p-value"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="cpt-homework" data-title="Среднее, интервал и p-value" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">ЦПТ и гипотезы · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 45 минут

Сегодня одна домашка: оценить среднее, построить интервал и проверить
гипотезу. Три числа, один вывод.

1. **Стандартная ошибка** — насколько среднее шумит.
2. **95% интервал** — диапазон вокруг оценки.
3. **p-value** — насколько данные несовместимы с H₀.
4. **Перенос** — считаешь всё на своих данных.
5. **Вывод** — три числа и одно ограничение.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 10 минут</span>

## Разобранный пример: стандартная ошибка

Среднее выборки — тоже случайная величина. Если `sigma = 10`, а `n = 100`,
стандартная ошибка равна `1.0`. Это типичное отклонение среднего от `mu`.

| `sigma` | `n` | `SE` |
| --- | --- | --- |
| 10 | 100 | 1.0 |
| 10 | 400 | 0.5 |

Формула: `SE = sigma / sqrt(n)`. В четыре раза больше данных — в два раза
меньше шума.

### Почини

Сейчас `sigma` делится на `n`. Исправь, чтобы для `sigma = 10`, `n = 100`
получилось `SE 1.0`.

```pyplay
# @mode fix
# @expect SE 1.0
# @hint Дели sigma на корень из n, а не на n.
import math
sigma = 10
n = 100
se = sigma / n
print("SE", round(se, 2))
```

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 12 минут</span>

## 95% доверительный интервал

При среднем `50` и `SE = 1` границы такие: `50 ± 1.96`. Получается
`48.04` и `51.96`. Множитель `1.96` соответствует уровню 95%.

Интервал не означает «параметр лежит внутри с вероятностью 95%». Он построен
так, что 95% таких интервалов накрывают истинное значение.

### Напиши сам

Для `mean = 50`, `se = 1` напечатай `CI 48.04 51.96`. Округли границы
до двух знаков.

```pyplay
# @mode write
# @expect CI 48.04 51.96
# @hint Нижняя граница — mean - 1.96 * se, верхняя — mean + 1.96 * se.
# Напиши функцию ci(mean, se) и напечатай "CI", low, high.
```

</section>

<section class="mission-step" data-step="4" data-require-check markdown="1">

<span class="mission-label">Шаг 4 · 10 минут</span>

## p-value

Считаем `z = (mean - mu0) / SE`. Для `mean = 52`, `mu0 = 50`, `SE = 1`
получаем `z = 2`. Двусторонний p-value — площадь двух хвостов: `0.0455`.

При `alpha = 0.05` H₀ отвергаем. Но p-value — это не вероятность, что H₀
верна. Это вероятность таких данных, если H₀ верна.

Порог выбираешь до проверки: в примере `0.05`, в домашке `0.001`.

### Почини

Сейчас берётся только один хвост. Сделай проверку двусторонней:
должно выйти `p 0.0455`.

```pyplay
# @mode fix
# @expect p 0.0455
# @hint Двусторонний p-value: удвой хвост 1 - Phi(|z|).
import math
mean = 52
mu0 = 50
se = 1
z = (mean - mu0) / se
phi = 0.5 * (1 + math.erf(abs(z) / math.sqrt(2)))
p = 1 - phi
print("p", round(p, 4))
```

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 5 минут</span>

## Перенеси в домашку

В домашке по фильтрации выбросов:

- [ ] прочитай `files/input/data.csv`, колонка `value`;
- [ ] посчитай `mu`, `sigma`, `n` и `SE` один раз по полным данным;
- [ ] построй 95% интервал для среднего;
- [ ] для каждого `x` посчитай `z = (x - mu) / sigma` и двусторонний `p`;
- [ ] отбери `p < 0.001` и запиши выбросы в отдельный файл;
- [ ] в выводе укажи число выбросов и что интервал говорит о среднем.

Для среднего знаменатель — `SE`, для отдельного значения — `sigma`. Не путай.

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 3 минуты</span>

## Вывод и память

Сначала вывод. Четыре предложения:

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Среднее, sigma и SE...
2. 95% интервал...
3. Сколько выбросов при p < 0.001...
4. Ограничение..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-se"> SE посчитан через sqrt(n), а не через n.</li>
  <li><input type="checkbox" data-save="check-ci"> В интервале есть множитель 1.96.</li>
  <li><input type="checkbox" data-save="check-p"> p-value двусторонний: хвост удвоен.</li>
  <li><input type="checkbox" data-save="check-text"> В выводе есть число выбросов, а не только «значимо».</li>
</ul>

Теперь закрой текст и ответь по памяти.

<ul class="mission-memory">
  <li>Чем `SE` отличается от `sigma`?</li>
  <li>Что означает «95%» в 95% интервале?</li>
  <li>Почему `p = 0.0455` не означает «H₀ верна с вероятностью 4.55%»?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2–4."></textarea>

<div class="mission-note mission-note--green">
  <strong>Завтра утром · 3 минуты</strong>
  Ответь на эти же три вопроса без подсказок. Короткий точный ответ лучше
  длинного пересказа.
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
  <strong>Домашка собрана</strong>
  <p>
    Ты прошёл заход. Запиши одну ошибку и вернись к трём вопросам завтра утром.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../">К плану курса</a>
    <a class="button" href="../../">На сегодня</a>
  </div>
</div>

</div>
