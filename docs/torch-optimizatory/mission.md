---
title: "Оптимизаторы: выбор под задачу"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="torch-homework" data-subtopic="torch-optimizers" data-title="Оптимизаторы: выбор под задачу" data-review="1,3,7,14,30" data-review-url="../../review/optimizers/" data-skills="gradient-descent,conditioning,momentum,adam,experiment-design" data-strict="1" data-hint-default="Сначала попытка. Подсказка — после второй. Ответ — после третьей." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">Оптимизаторы · подтема · 3–5 дней</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 7</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · жизненный пример · 5 минут</span>

## Тебе не нужен зоопарк оптимизаторов

Ты сдаёшь домашку: обучить модель на `f(x, y) = sin(x) * cos(y)`, старт
`(10, 10)`, 1000 шагов, `lr = 0.1`. В задании есть SGD, Momentum и Adam.

Соблазн — прогнать все три и написать «Adam лучше». Но преподаватель спросит:

- почему именно этот оптимизатор;
- что было бы при другом `lr`;
- где он сломается;
- как ты понял, что он лучше, а не просто удачнее стартовал.

<div class="rule-grid">
  <div class="rule-card rule-card--green">
    <strong>Решение</strong>
    <span>Выбрать один оптимизатор и защитить выбор.</span>
  </div>
  <div class="rule-card rule-card--blue">
    <strong>Бюджет</strong>
    <span>Одинаковые старт, число шагов и сетка `lr`.</span>
  </div>
  <div class="rule-card rule-card--yellow">
    <strong>Артефакт</strong>
    <span>Ноутбук, таблица loss и короткое memo.</span>
  </div>
</div>

**Главный навык:** не «знать Adam», а **понимать, почему один шаг работает
именно так и когда он перестаёт работать**.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом тесты. Подсказка — после второй попытки,
  ожидаемый результат — после третьей. Решение заранее не открываем.
</div>

</section>

<section class="mission-step" data-step="2" markdown="1">

<span class="mission-label">Шаг 2 · теория · 12 минут</span>

## Три вещи, которые объясняют всё

### 1. Градиент — это направление и масштаб

Один шаг градиентного спуска:

$$
w_{t+1} = w_t - \eta \nabla f(w_t)
$$

`\eta` — шаг обучения, `\nabla f` — градиент. Знак минус потому, что мы идём
против роста функции, к минимуму.

В точке `(x, y)` для `f = sin(x) cos(y)`:

$$
\frac{\partial f}{\partial x} = \cos x \cos y,
\qquad
\frac{\partial f}{\partial y} = -\sin x \sin y
$$

### 2. Обусловленность — почему один `lr` неудобен

Для квадратичной функции `f(x, y) = x^2 + 100y^2` гессиан диагональный:

| Направление | Кривизна | Градиент в `(1,1)` | Шаг при `lr=0.01` |
| --- | ---: | ---: | ---: |
| `x` | 2 | 2 | -0.02 |
| `y` | 200 | 200 | -2.0 |

Число обусловленности:

$$
\kappa = \frac{\lambda_{\max}}{\lambda_{\min}} = \frac{200}{2} = 100
$$

По `x` шаг крошечный, по `y` — огромный. Если увеличить `lr`, по `y` начнётся
расходимость, а по `x` всё ещё будет медленно.

<div class="mission-note mission-note--blue">
  <strong>Запомни метафору</strong>
  Ты идёшь по длинному оврагу: дно почти плоское, а стенки крутые. Один размер
  шага не может быть удобным одновременно для дна и для стенки.
</div>

### 3. Состояние оптимизатора — чем он платит за ум

| Оптимизатор | Что хранит | Что делает | Когда полезен |
| --- | --- | --- | --- |
| **SGD** | ничего | шаг по текущему градиенту | простой baseline, мало памяти |
| **Momentum** | скорость `v` | накапливает градиент, разгоняется в плоском направлении | овраги, шумные градиенты |
| **Adam** | `m` и `v` для каждого параметра | масштабирует шаг по истории градиента | разные масштабы параметров |

Momentum:

$$
v_{t+1} = \beta v_t + g_t,
\qquad
w_{t+1} = w_t - \eta v_{t+1}
$$

Adam хранит среднее градиента `m` и среднее квадрата `v`, корректирует смещение
и делает шаг, нормированный на масштаб каждого параметра.

<div class="rule-grid">
  <div class="rule-card rule-card--green">
    <strong>SGD</strong>
    <span>Честный baseline. Если он уже работает, усложнение нужно доказать.</span>
  </div>
  <div class="rule-card rule-card--blue">
    <strong>Momentum</strong>
    <span>Машина с инерцией: в плоском месте разгоняется, в крутом — сглаживает рывки.</span>
  </div>
  <div class="rule-card rule-card--purple">
    <strong>Adam</strong>
    <span>У каждого параметра свой масштаб шага. Дороже по состоянию и настройке.</span>
  </div>
</div>

### Где обычно ошибаются

1. Сравнивают только финальный loss, а не траекторию.
2. Дают оптимизаторам разный бюджет или разный старт.
3. Меняют `lr` только у одного кандидата.
4. Выкидывают расходящиеся запуски из таблицы.
5. Говорят «Adam лучше», не проверив, при каком условии он проиграет.

<div class="mission-note mission-note--green">
  <strong>Запомни</strong>
  Оптимизатор — это не «лучше/хуже», а **компромисс** между скоростью,
  устойчивостью, памятью и чувствительностью к гиперпараметрам.
</div>

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · диагностика · 6 минут</span>

## Проверь модель

Нужно **80%** — 5 из 6. Если меньше, вернись к теории и пройди опрос снова.

```quiz
{
  "title": "Диагностика · оптимизаторы",
  "min": 80,
  "questions": [
    {"type":"choice","q":"Что такое число обусловленности?","options":["сумма кривизн","отношение максимальной кривизны к минимальной","число шагов обучения","размер градиента"],"answer":1,"explain":"κ = λmax / λmin. Чем больше отношение, тем сильнее различаются масштабы направлений."},
    {"type":"truefalse","q":"При κ = 100 один и тот же lr удобен для обоих направлений.","answer":false,"explain":"Нет: по одному направлению шаг будет крошечным, по другому — опасно большим."},
    {"type":"input","q":"w = 1, grad = 0.5, lr = 0.4. Чему равен новый w?","answer":["0.8"],"explain":"w_new = w - lr * grad = 1 - 0.4 * 0.5 = 0.8."},
    {"type":"choice","q":"Что накапливает Momentum?","options":["квадрат градиента","скорость из прошлых градиентов","только финальный loss","число параметров"],"answer":1,"explain":"Momentum хранит v = beta * v + grad и использует его как инерцию."},
    {"type":"choice","q":"Чем Adam отличается от SGD?","options":["не использует градиент","масштабирует шаг по истории градиента для каждого параметра","всегда делает шаг больше","не требует обучения"],"answer":1,"explain":"Adam хранит первые и вторые моменты градиента и нормирует шаг по масштабу."},
    {"type":"truefalse","q":"Финального loss достаточно, чтобы выбрать оптимизатор.","answer":false,"explain":"Нужны траектория, устойчивость, одинаковый бюджет и проверка lr. Финальная точка может быть случайной."}
  ]
}
```

<div class="mission-note mission-note--green">
  <strong>Если меньше 80%</strong>
  Не перечитывай всё. Вернись к одному месту: обусловленность, формула
  Momentum или условие честного сравнения. Потом пройди опрос снова.
</div>

</section>

<section class="mission-step" data-step="4" data-require-check data-require-all markdown="1">

<span class="mission-label">Шаг 4 · практика с каркасом · 20 минут</span>

## Сначала рука, потом формула

### 4.1. Один шаг SGD

В коде перепутан знак. Для `w = [1.0, 0.0]`, `grad = [0.5, 0.2]`,
`lr = 0.4` ожидается `[0.8, -0.08]`.

```pyplay
# @mode fix
# @expect [0.8, -0.08]
# @hint Обновление вычитает lr * grad, а не прибавляет.
w = [1.0, 0.0]
grad = [0.5, 0.2]
lr = 0.4
w_new = [wi + lr * gi for wi, gi in zip(w, grad)]
print([round(x, 2) for x in w_new])
```

### 4.2. Один шаг Momentum

Допиши `momentum_step`. Для `w = [1.0, 1.0]`, `grad = [1.0, -1.0]`,
`v = [0.5, 0.5]`, `lr = 0.2`, `beta = 0.9` ожидается `[0.71, 1.11]`.

```pyplay
# @mode write
# @expect [0.71, 1.11]
# @hint Сначала v_new = beta * v + grad. Потом w_new = w - lr * v_new. Обнови оба компонента.
def momentum_step(w, grad, v, lr, beta):
    # твой код
    return w, v

w = [1.0, 1.0]
grad = [1.0, -1.0]
v = [0.5, 0.5]
lr = 0.2
beta = 0.9
w_new, v_new = momentum_step(w, grad, v, lr, beta)
print([round(x, 2) for x in w_new])
```

</section>

<section class="mission-step" data-step="5" data-require-check data-require-all markdown="1">

<span class="mission-label">Шаг 5 · куски домашки · 20 минут</span>

## Три куска, которые войдут в ноутбук

### 5.1. SGD вручную

Для `w = [1.0, 1.0]`, `grad = [0.5, -0.5]`, `lr = 0.1` верни новый `w`.
Ожидается `[0.95, 1.05]`.

```pyplay
# @mode write
# @expect [0.95, 1.05]
# @hint w_new = w - lr * grad для каждого компонента.
# Напиши код ниже.
```

### 5.2. Momentum вручную

Для `w = [2.0, 0.0]`, `grad = [1.0, 2.0]`, `v = [0.0, 1.0]`,
`lr = 0.1`, `beta = 0.9` верни новый `w`. Ожидается `[1.9, -0.29]`.

```pyplay
# @mode write
# @expect [1.9, -0.29]
# @hint v_new = 0.9 * v + grad; w_new = w - 0.1 * v_new.
# Напиши код ниже.
```

### 5.3. Градиент функции

Для `f(x, y) = sin(x) * cos(y)` посчитай градиент в точке `(0.5, 0.5)`.
Округли до 6 знаков. Ожидается `[0.770151, -0.229849]`.

```pyplay
# @mode write
# @expect [0.770151, -0.229849]
# @hint df/dx = cos(x)cos(y), df/dy = -sin(x)sin(y). Не забудь import math.
# Напиши код ниже.
```

</section>

<section class="mission-step" data-step="6" data-require-check markdown="1">

<span class="mission-label">Шаг 6 · половина модуля · 30 минут</span>

## Половина эксперимента

Собери функцию `train(kind, lr=0.01, steps=100, beta=0.9)`, которая делает
шаги на `f(x, y) = sin(x) * cos(y)` из старта `(10, 10)` и возвращает loss на
шагах **10, 50 и 100**.

Выведи две строки:

- `train("sgd")`
- `train("momentum")`

Ожидаемые значения:

```text
[0.397542, 0.159037, -0.131482]
[0.212311, -0.99467, -0.999746]
```

```pyplay
# @mode write
# @expect {"contains":["[0.397542, 0.159037, -0.131482]","[0.212311, -0.99467, -0.999746]"]}
# @hint В цикле считай grad, обновляй x/y. Для momentum храни vx, vy и обновляй их до шага. Записывай loss, когда t равен 10, 50 или 100.
import math

def f(x, y):
    return math.sin(x) * math.cos(y)

def grad(x, y):
    return math.cos(x) * math.cos(y), -math.sin(x) * math.sin(y)

def train(kind, lr=0.01, steps=100, beta=0.9):
    # твой код
    return []

print(train("sgd"))
print(train("momentum"))
```

<div class="mission-note mission-note--blue">
  <strong>Почему это половина модуля</strong>
  Ты уже реализовал два оптимизатора и видишь траекторию. Осталось добавить
  Adam, сетку `lr` и защиту выбора — это полный модуль.
</div>

</section>

<section class="mission-step" data-step="7" data-require-check markdown="1">

<span class="mission-label">Шаг 7 · полный модуль · 40–60 минут</span>

## Полный модуль: ноутбук и решение

Собери ноутбук по заданию:

1. `f(x, y) = sin(x) * cos(y)`, старт `(10, 10)`, 1000 шагов.
2. SGD, Momentum и Adam на одном бюджете.
3. `lr = 0.1`, плюс проверка `0.08` и `0.12`.
4. Loss на шагах `0, 100, 500, 1000`.
5. Таблица: оптимизатор × `lr` × loss.
6. Расходящиеся запуски остаются в таблице.
7. Вывод: выбор + условие, при котором он перестанет работать.

### Чек-лист

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-budget"> Одинаковые старт, число шагов и сетка `lr`.</li>
  <li><input type="checkbox" data-save="check-loss"> Loss записан на 0, 100, 500 и 1000 шагах.</li>
  <li><input type="checkbox" data-save="check-diverged"> Расходящиеся запуски не выкинуты.</li>
  <li><input type="checkbox" data-save="check-lr"> Проверены `lr` 0.08, 0.1 и 0.12.</li>
  <li><input type="checkbox" data-save="check-choice"> Выбор защищён условием применимости.</li>
  <li><input type="checkbox" data-save="check-run"> Ноутбук запускается сверху вниз.</li>
</ul>

### Защита решения

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Где ландшафт крутой, а где плоский...
2. Что показал SGD...
3. Что изменили Momentum и Adam...
4. Как сравнивал: бюджет, lr, loss...
5. Какой выбор и при каком условии он перестанет работать..."></textarea>

### Финальная проверка

Ответь на 5 вопросов. Нужно 80% — 4 из 5.

```quiz
{
  "title": "Защита · выбор оптимизатора",
  "min": 80,
  "questions": [
    {"type":"choice","q":"Что нужно зафиксировать для честного сравнения?","options":["только финальный loss","одинаковые старт, бюджет и сетку lr","только число параметров","только название оптимизатора"],"answer":1,"explain":"Иначе разница может быть из-за старта, бюджета или несправедливой настройки lr."},
    {"type":"choice","q":"SGD сходится, а Momentum осциллирует. Что проверить первым?","options":["увеличить lr","уменьшить lr или beta","удалить Momentum из таблицы","добавить больше шагов"],"answer":1,"explain":"Momentum накапливает скорость; слишком большой lr или beta даёт перелёт."},
    {"type":"truefalse","q":"Если Adam дал лучший финальный loss, этого достаточно для выбора.","answer":false,"explain":"Нужны траектория, устойчивость и проверка lr. Одна финальная точка не показывает надёжность."},
    {"type":"choice","q":"Зачем смотреть loss на 0, 100, 500 и 1000 шагах?","options":["чтобы увидеть скорость и устойчивость, а не только финал","чтобы увеличить число строк","чтобы не считать градиент","чтобы выбрать lr наугад"],"answer":0,"explain":"Траектория показывает, как быстро и стабильно оптимизатор идёт к минимуму."},
    {"type":"input","q":"w = 1, grad = 0.5, lr = 0.4. Новый w?","answer":["0.8"],"explain":"w_new = 1 - 0.4 * 0.5 = 0.8."}
  ]
}
```

### Память

<ul class="mission-memory">
  <li>Почему при κ = 100 один `lr` неудобен для обоих направлений?</li>
  <li>Что Momentum накапливает и почему это помогает в плоском направлении?</li>
  <li>Почему «Adam лучше» без одинакового бюджета и проверки `lr` — не вывод?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2–6."></textarea>

<textarea class="mission-textarea" data-save="error" placeholder="Одна ошибка за сегодня: что думал, что оказалось, по какому признаку узнаю в следующий раз."></textarea>

</section>

<div class="mission-controls">
  <button type="button" class="mission-btn mission-btn--ghost" data-prev>Назад</button>
  <span class="mission-spacer"></span>
  <button type="button" class="mission-btn mission-btn--primary" data-next>Дальше</button>
</div>

<p class="mission-hint" data-hint>Сначала попытка. Подсказка — после второй. Ответ — после третьей.</p>

<div class="mission-done" data-complete hidden>
  <strong>Подтема собрана</strong>
  <p>
    Ты прошёл путь от одного шага SGD до полного эксперимента. Заход попадёт в
    повторение через 1, 3, 7, 14 и 30 дней.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../../../">К повторениям</a>
    <a class="button" href="../">К плану курса</a>
  </div>
</div>

</div>
