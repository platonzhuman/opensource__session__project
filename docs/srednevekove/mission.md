---
title: "Парный тест и Мак-Немар"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="srednevekove-homework" data-title="Парный тест и Мак-Немар" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">Средневековье · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 4 минуты</span>

## План на 30 минут

В файле — рейтинг Ивана Грозного до и после фильма для одних и тех же людей.
Сравниваем пары, а не две независимые группы.

1. **Пары** — до и после одного человека.
2. **Разности** — знак и размер изменения.
3. **Средний рейтинг** — парный t-критерий.
4. **Поддержка** — бинарные пары и критерий Мак-Немара.
5. **Вывод** — что изменилось и насколько уверенно.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 8 минут</span>

## Разобранный пример: разности

Пара — это два числа одного человека. Сначала считаем `diff = after - before`.
Знак показывает направление, модуль — размер изменения.

| before | after | diff |
| --- | --- | --- |
| 60 | 63 | +3 |
| 70 | 68 | -2 |
| 80 | 84 | +4 |

Средняя разница здесь `1.67`. Но это пока описание, а не проверка гипотезы.

### Почини

Сейчас разность считается в обратном порядке. Исправь: для
`before = [60, 70, 80]`, `after = [63, 68, 84]` должно выйти `[3, -2, 4]`.

```pyplay
# @mode fix
# @expect [3, -2, 4]
# @hint after минус before, а не наоборот.
before = [60, 70, 80]
after = [63, 68, 84]
diffs = [b - a for a, b in zip(after, before)]
print(diffs)
```

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 8 минут</span>

## Средний рейтинг: парный t

Для `diffs = [3, 2, 4, 1, 5]` средняя разница `3.0`, выборочное отклонение
`1.581`. Тогда `t = mean / (stdev / sqrt(n)) ≈ 4.24`.

При `df = 4` это `p < 0.05`: средняя разница значима. Парный тест проверяет
H₀ «средняя разница равна нулю», а не сравнивает две независимые группы.

### Напиши сам

Для `diffs = [3, 2, 4, 1, 5]` напечатай `mean 3.0 stdev 1.581`.

```pyplay
# @mode write
# @expect mean 3.0 stdev 1.581
# @hint mean — сумма / n; stdev — выборочное СКО с n − 1, округли до 3 знаков.
# Напиши расчёт и напечатай "mean", mean, "stdev", stdev.
```

</section>

<section class="mission-step" data-step="4" data-require-check markdown="1">

<span class="mission-label">Шаг 4 · 5 минут</span>

## Поддержка: Мак-Немар

Поддержка — это доля рейтингов `>= 50`. Признак бинарный. Для пар считаем
только несогласованные случаи:

|  | после: да | после: нет |
| --- | --- | --- |
| **до: да** | a | b |
| **до: нет** | c | d |

`b` — потерял поддержку, `c` — приобрёл. Согласованные `a` и `d` в критерий
не входят.

Статистика: `chi2 = (|b - c| - 1)² / (b + c)`, `df = 1`. Для `b = 14`,
`c = 4` получается `chi2 = 4.5` и `p = 0.0339`.

### Почини

Сейчас p-value считается по неправильной формуле. Исправь:
должно выйти `b 14 c 4 p 0.0339`.

```pyplay
# @mode fix
# @expect b 14 c 4 p 0.0339
# @hint Для df = 1 p-value равно erfc(sqrt(chi2 / 2)).
import math
b = 14
c = 4
chi2 = (abs(b - c) - 1) ** 2 / (b + c)
p = math.erfc(math.sqrt(chi2))
print("b", b, "c", c, "p", round(p, 4))
```

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 3 минуты</span>

## Перенеси в домашку

В своём скрипте:

- [ ] загрузи `ivaniv.dat.txt` и возьми колонки до/после;
- [ ] посчитай `diffs = after - before`, среднее, `stdev` и `n`;
- [ ] прогони парный t и запиши `t` и `p`;
- [ ] сделай бинарные признаки `before >= 50` и `after >= 50`, посчитай `b` и `c`;
- [ ] посчитай критерий Мак-Немара для поддержки;
- [ ] сформулируй два вывода отдельно: рейтинг и поддержка.

Не сравнивай поддержку обычным t: это доли, а пары связанные.

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 2 минуты</span>

## Вывод и память

Сначала вывод. Четыре предложения:

1. Средний рейтинг: направление и p-value.
2. Поддержка: `b`, `c` и p-value.
3. Что изменилось сильнее.
4. Какое ограничение есть у данных.

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Средний рейтинг...
2. Поддержка...
3. Что заметнее...
4. Ограничение..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-pairs"> Разности считаются внутри пар.</li>
  <li><input type="checkbox" data-save="check-t"> Для среднего использован парный t.</li>
  <li><input type="checkbox" data-save="check-bc"> В Мак-Немаре учтены только `b` и `c`.</li>
  <li><input type="checkbox" data-save="check-two"> Выводы по рейтингу и поддержке разделены.</li>
</ul>

Теперь закрой текст и ответь по памяти.

<ul class="mission-memory">
  <li>Почему для «до/после» нужен парный тест, а не две группы?</li>
  <li>Что такое `b` и `c` в таблице Мак-Немара?</li>
  <li>Почему `p < 0.05` не говорит о размере эффекта?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2–4."></textarea>

<div class="mission-note mission-note--green">
  <strong>Завтра утром · 3 минуты</strong>
  Ответь на эти же три вопроса без подсказок. Если ответ короче и точнее —
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
