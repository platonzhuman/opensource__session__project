---
title: "Кластеризуем: домашка за один заход"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="klasterizuem-homework" data-title="Кластеризуем: домашка за один заход" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">Кластеризуем · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 40 минут

Сегодня не проходим весь курс. Собираем одну функцию `cluster_file(path)`: на
вход — путь к файлу, на выход — номер кластера для каждой строки.

Пять мыслей, которые нужны:

1. **Файл** — пропустить шапку и взять `Freq` и `Range`.
2. **Масштаб** — z-score, иначе `Range` задавит `Freq`.
3. **KMeans** — k центроидов и метка для каждой точки.
4. **Выбор k** — максимум silhouette на сетке от 2 до 6.
5. **Сборка** — одна функция, один запуск, метки той же длины.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала пишешь свою попытку. Потом тесты. Подсказка — после второй попытки,
  ожидаемый результат — после третьей. Не открывай решение заранее.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 10 минут</span>

## Разобранный пример: файл и масштаб

В файле ионозонда сверху шапка, ниже — данные. Нужны две числовые колонки:
`Freq` в единицах и `Range` в сотнях. Если подать их в KMeans как есть, расстояние
будет почти полностью определяться `Range`.

Z-score переводит каждую колонку в общий масштаб:

`z = (x - mean) / sd`

После этого у колонки среднее 0, а стандартное отклонение 1. Для двух точек:

| Freq | z(Freq) | Range | z(Range) |
| --- | --- | --- | --- |
| 0.875 | -1.0 | 367.5 | -1.0 |
| 1.075 | 1.0 | 500.0 | 1.0 |

KMeans ищет k центроидов, относит каждую точку к ближайшему и пересчитывает
центры. Ему нужны числа в одном масштабе, иначе одна колонка решает всё.

### Почини

В коде дисперсия считается неверно. Исправь: для `[2, 4, 0]` ожидается
`[0.0, 1.225, -1.225]`.

```pyplay
# @mode fix
# @expect [0.0, 1.225, -1.225]
# @hint Дисперсия — это среднее квадратов отклонений: сумму нужно разделить на n.
def zscore(values):
    mean = sum(values) / len(values)
    var = sum((x - mean) ** 2 for x in values)
    sd = var ** 0.5
    return [round((x - mean) / sd, 3) for x in values]

print(zscore([2, 4, 0]))
```

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 10 минут</span>

## Выбор k по силуэту

KMeans нужно сказать, сколько кластеров искать. Силуэт сравнивает, насколько
точка ближе к своему кластеру, чем к соседнему: 1 — идеально, 0 — на границе,
-1 — точка ближе к чужому. Метки для этого не нужны, только координаты.

Для одного файла получились такие scores:

| k | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- |
| silhouette | 0.41 | 0.52 | 0.63 | 0.58 | 0.49 |

Максимум при `k = 4`. Выбирай k по метрике, а не по числу кластеров, которое
хочется увидеть на картинке.

### Напиши сам

Даны `scores = [0.41, 0.52, 0.63, 0.58, 0.49]` для k от 2 до 6. Напиши
`best_k(scores)` и напечатай `лучшее k = ...`.

```pyplay
# @mode write
# @expect лучшее k = 4
# @hint Индекс максимума + 2: первый score относится к k = 2.
# Напиши best_k(scores) и напечатай результат для данных выше.
```

</section>

<section class="mission-step" data-step="4" markdown="1">

<span class="mission-label">Шаг 4 · 9 минут</span>

## Перенеси в домашку

Собери `cluster_file(path)` в своём файле или ноутбуке. Не копируй функцию
целиком: собери её из кусков, которые уже разобрал.

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-read"> Прочитать файл, найти строку с `Freq` и `Range`, пропустить шапку.</li>
  <li><input type="checkbox" data-save="check-scale"> Взять два числовых столбца и посчитать z-score по каждому отдельно.</li>
  <li><input type="checkbox" data-save="check-loop"> Для `k` от 2 до 6 обучить `KMeans(n_clusters=k, n_init=10, random_state=0)` и посчитать `silhouette_score`.</li>
  <li><input type="checkbox" data-save="check-best"> Выбрать k с максимальным silhouette, обучить KMeans на всех точках и вернуть `labels`.</li>
  <li><input type="checkbox" data-save="check-length"> Проверить: `len(labels) == len(X)`, уникальных меток ровно k, функция запускается на файле без ручных правок.</li>
</ul>

Если файл не читается или в нём меньше двух точек, сначала разберись с данными.
Менять метрику или подгонять k под желаемый ответ — не решение.

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 3 минуты</span>

## Вывод

Четыре предложения, не memo:

1. Какие данные и сколько строк.
2. Как масштабировал колонки.
3. Какое k выбрал и какой silhouette получился.
4. Где метод может ошибиться.

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Данные и число строк...
2. Масштаб...
3. k и silhouette...
4. Ограничение метода..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-run"> `cluster_file(path)` запускается на исходном файле.</li>
  <li><input type="checkbox" data-save="check-k"> k выбран по silhouette, а не по желаемому числу.</li>
  <li><input type="checkbox" data-save="check-rows"> Меток столько же, сколько строк в файле.</li>
  <li><input type="checkbox" data-save="check-limit"> В выводе есть ограничение метода, а не только «всё хорошо».</li>
</ul>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 3 минуты</span>

## Память

Закрой текст и ответь по памяти. Не перечитывай. Если не получилось — вернись
к нужному шагу, а не ко всей теории.

<ul class="mission-memory">
  <li>Зачем z-score перед KMeans, если обе колонки уже числа?</li>
  <li>Что показывает silhouette и почему для выбора k не нужны метки?</li>
  <li>Что проверяешь у `cluster_file(path)` перед сдачей?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2, 3 и 4."></textarea>

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
