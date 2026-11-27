---
title: "S&P 500: домашка за один заход"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="sp500-homework" data-title="S&P 500: домашка за один заход" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">S&amp;P 500 · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 7</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 60 минут

Сегодня не учим весь курс. Сегодня собираем домашку и понимаем, где она
ломается. Пять шагов:

1. **Данные без утечки** — сдвиг на один шаг.
2. **Baseline** — zero, drift, mean12.
3. **Walk-forward** — честная проверка на будущем.
4. **Ошибки по режимам** — средняя прячет плохие периоды.
5. **Вывод** — 5 предложений и короткая проверка.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала пишешь свою попытку. Потом тесты. Подсказка — после второй попытки,
  ожидаемый результат — после третьей. Не открывай решение заранее.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 12 минут</span>

## Данные без утечки

В прогнозе на месяц `t` ты знаешь только прошлое. Значение `ret[t-1]` — можно,
`ret[t+1]` — нельзя. Это и есть лаг.

| t | ret | lag_1 |
| --- | --- | --- |
| 1 | 0.02 | — |
| 2 | -0.01 | 0.02 |
| 3 | 0.03 | -0.01 |

Сдвиг вправо: первый элемент становится пустым, каждый следующий берёт
предыдущий.

### Почини

В коде сдвиг влево. Исправь так, чтобы получилось `[None, 1, 2, 3]`.

```pyplay
# @mode fix
# @expect [None, 1, 2, 3]
# @hint Сдвинь значения вправо: первый элемент — None, дальше идут все, кроме последнего.
values = [1, 2, 3, 4]
lagged = values[1:] + [None]
print(lagged)
```

### Напиши сам

Напиши `make_lag(values)` и напечатай результат для `[10, 20, 30]`.
Ожидается `[None, 10, 20]`.

```pyplay
# @mode write
# @expect [None, 10, 20]
# @hint Верни список той же длины: None + все элементы, кроме последнего.
# Напиши функцию make_lag(values) и вызови её.
```

### Перенеси в домашку

В своём ноутбуке создай лаг доходности:

```python
df["lag_1"] = df["ret"].shift(1)
```

Проверь: в первой строке должен быть `NaN`, а не число из будущего. Если видишь
`shift(-1)` — это утечка.

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 12 минут</span>

## Baseline

Baseline — это не «плохая модель для галочки». Это точка отсчёта, которую твоя
модель обязана побить. Если не побила — это результат, а не провал.

Для train `[1, 2, 3, 4]` и трёх будущих точек:

| Baseline | Прогноз | Идея |
| --- | --- | --- |
| zero | `[0, 0, 0]` | доходность — белый шум |
| drift | `[2.5, 2.5, 2.5]` | средняя по прошлому |
| mean12 | `[2.5, 2.5, 2.5]` | средняя за последние 12 |

### Почини

Сейчас считается сумма прогнозов, а не средняя абсолютная ошибка. Исправь:
для `true=[1,2,3]`, `pred=[1,4,2]` должно получиться `1.0`.

```pyplay
# @mode fix
# @expect 1.0
# @hint MAE = сумма abs(pred - true), делённая на количество точек.
true = [1, 2, 3]
pred = [1, 4, 2]
mae = sum(pred) / len(true)
print(mae)
```

### Напиши сам

Напиши `baseline_drift(train, n)`: средняя по train, повторённая `n` раз.
Для `train=[1,2,3,4]`, `n=3` напечатай `[2.5, 2.5, 2.5]`.

```pyplay
# @mode write
# @expect [2.5, 2.5, 2.5]
# @hint Среднее по train, затем список из n одинаковых значений.
# Напиши baseline_drift(train, n) и напечатай результат.
```

### Перенеси в домашку

Посчитай три baseline на тех же walk-forward окнах, что и модель. Смотри не
только среднее, но и разброс по окнам. Если разница меньше разброса — это шум.

</section>

<section class="mission-step" data-step="4" data-require-check markdown="1">

<span class="mission-label">Шаг 4 · 15 минут</span>

## Walk-forward

Один `train_test_split` смешивает прошлое и будущее. Walk-forward идёт по
времени: обучение на всём прошлом, проверка на следующем окне, сдвиг вперёд.

Для `n=10`, `start=4`, `horizon=2`, `step=2`:

| Окно | Train | Validation |
| --- | --- | --- |
| 1 | `0..4` | `4..6` |
| 2 | `0..6` | `6..8` |
| 3 | `0..8` | `8..10` |

Train расширяется. Validation всегда идёт сразу после train.

### Почини

Сейчас окно сдвигается на 1, а не на `step`. Исправь:

```pyplay
# @mode fix
# @expect [(0, 4, 4, 6), (0, 6, 6, 8), (0, 8, 8, 10)]
# @hint Увеличивай i на step, а не на 1.
def walk_forward(n, start=4, horizon=2, step=2):
    out = []
    i = start
    while i + horizon <= n:
        out.append((0, i, i, i + horizon))
        i += 1
    return out

print(walk_forward(10))
```

### Напиши сам

Напиши `walk_forward(n, start=6, horizon=3, step=3)` и напечатай окна для
`n=12`. Ожидается `[(0, 6, 6, 9), (0, 9, 9, 12)]`.

```pyplay
# @mode write
# @expect [(0, 6, 6, 9), (0, 9, 9, 12)]
# @hint start=6, horizon=3, step=3. Train всегда начинается с 0 и заканчивается в i.
# Напиши функцию walk_forward и напечатай результат для n=12.
```

### Перенеси в домашку

Прогони модель по этим окнам. Не перемешивай строки. Не смотри на validation
при выборе `p`. Зафиксируй правило остановки до запуска.

</section>

<section class="mission-step" data-step="5" data-require-check markdown="1">

<span class="mission-label">Шаг 5 · 8 минут</span>

## Ошибки по режимам

Средняя ошибка `3` может означать «везде по 3» или «обычно 1, но в кризис 9».
Это разные решения.

### Почини

Сейчас `high` берёт все ошибки. Раздели их по волатильности: `vol > 5`.
Должно получиться `low 1.5 high 8.5`.

```pyplay
# @mode fix
# @expect low 1.5 high 8.5
# @hint Для high нужно условие v > 5, а не все элементы.
errors = [1, 2, 1, 8, 9, 2]
vol = [1, 1, 1, 10, 10, 1]

low = [e for e, v in zip(errors, vol) if v <= 5]
high = [e for e in errors]
print("low", sum(low) / len(low), "high", sum(high) / len(high))
```

### Перенеси в домашку

В ноутбуке:

1. Посчитай `abs_err = abs(y_true - y_pred)`.
2. Посчитай rolling-волатильность на прошлом.
3. Раздели ошибки на 3 режима по волатильности.
4. Выведи таблицу: режим, средняя ошибка, медиана, число точек.

Если в одном режиме ошибка в разы больше — это уже вывод, а не «модель плохая».

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 5 минут</span>

## Вывод

Не memo. Пять предложений, которые можно показать преподавателю и самому себе.

<div class="mission-note mission-note--blue">
  <strong>Шаблон</strong>
  1. Какие данные и какой протокол. 2. Какой baseline. 3. Как проверял.
  4. Где ошибка больше. 5. Что делать: ship, iterate или stop.
</div>

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Данные и протокол...
2. Baseline...
3. Walk-forward...
4. Ошибки по режимам...
5. Решение..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-run"> Ноутбук запускается сверху вниз без ручных правок.</li>
  <li><input type="checkbox" data-save="check-leak"> Нет `shift(-1)`, случайного split и нормировки по всему ряду.</li>
  <li><input type="checkbox" data-save="check-baseline"> Baseline посчитан на тех же окнах, что и модель.</li>
  <li><input type="checkbox" data-save="check-std"> Есть среднее и разброс по окнам, а не одно число.</li>
  <li><input type="checkbox" data-save="check-conclusion"> Вывод — 5 предложений, без ADR и memo.</li>
</ul>

</section>

<section class="mission-step" data-step="7" markdown="1">

<span class="mission-label">Шаг 7 · 5 минут</span>

## Память

Закрой текст и ответь по памяти. Не перечитывай. Если не получилось — вернись
к нужному шагу, а не ко всей теории.

<ul class="mission-memory">
  <li>Почему `shift(1)`, а не `shift(-1)`?</li>
  <li>Почему walk-forward, а не случайный `train_test_split`?</li>
  <li>Что означает «модель лучше baseline в 60% окон»?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2, 4 и 5."></textarea>

<div class="mission-note mission-note--green">
  <strong>Завтра утром · 3 минуты</strong>
  Закрой всё и ответь на эти же три вопроса. Если ответы стали короче и точнее —
  память работает. Если нет — это не провал, а место для повторения.
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
    Ты прошёл заход. Не закрывай вкладку сразу: запиши одну ошибку и вернись к
    трём вопросам завтра утром. Это и есть повторение.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../">К плану курса</a>
    <a class="button" href="../../">На сегодня</a>
  </div>
</div>

</div>
