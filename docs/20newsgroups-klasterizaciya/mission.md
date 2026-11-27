---
title: "20 newsgroups: домашка за один заход"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="20news-homework" data-title="20 newsgroups: домашка за один заход" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">20 newsgroups · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 45 минут

В корпусе 20 newsgroups тексты без меток. `target` есть, но это только проверка,
не вход. Нужно провести исследование: TF-IDF, LSA, KMeans и честная оценка.

Пять мыслей, которые нужны:

1. **TF-IDF** — частота слова в документе и редкость в корпусе.
2. **LSA** — SVD сжимает разреженные векторы в плотные.
3. **KMeans** — k групп на LSA-векторах.
4. **Метрики** — silhouette для выбора k, ARI только после фиксации.
5. **Утечки** — заголовки, цитаты и `target` не должны влиять на обучение.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала пишешь свою попытку. Потом тесты. Подсказка — после второй попытки,
  ожидаемый результат — после третьей. Не открывай решение заранее.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 12 минут</span>

## Разобранный пример: TF

TF в этой задаче — доля слова в документе. Если просто считать вхождения,
длинный документ получит большие числа по всем словам. Поэтому делим на общее
число слов.

Для документа `cat dog dog`:

| Слово | Count | TF |
| --- | --- | --- |
| cat | 1 | 1 / 3 = 0.333 |
| dog | 2 | 2 / 3 = 0.667 |

TF-IDF умножает эту долю на IDF — редкость слова в корпусе. Сначала починим TF.

### Почини

В коде TF нормируется не по длине документа. Исправь: для `counts = [2, 1, 1]`
ожидается `[0.5, 0.25, 0.25]`.

```pyplay
# @mode fix
# @expect [0.5, 0.25, 0.25]
# @hint TF — это count / сумма всех counts в документе, а не count / минимум.
counts = [2, 1, 1]
tf = [c / min(counts) for c in counts]
print(tf)
```

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 10 минут</span>

## IDF и LSA

IDF = `ln(N / df)`, где `N` — число документов, `df` — в скольких документах
встретилось слово. Слово, которое есть везде, получает 0: оно не помогает
различить документы. Редкое слово получает больший вес. В `TfidfVectorizer`
формула со сглаживанием, но смысл тот же.

LSA сжимает TF-IDF через `TruncatedSVD`, например до 100 компонент. Получаются
плотные векторы, на которых KMeans обычно работает быстрее и устойчивее.
`target` в SVD не участвует.

### Напиши сам

В корпусе `N = 2` документа. Для трёх слов `df = [2, 1, 1]`. Напиши
`idf(n_docs, df)` и напечатай IDF для этих слов, округлённый до трёх знаков.
Ожидается `[0.0, 0.693, 0.693]`.

```pyplay
# @mode write
# @expect [0.0, 0.693, 0.693]
# @hint IDF = ln(N / df). Если df = N, логарифм даёт 0. Не забудь округлить.
# Напиши idf(n_docs, df) и напечатай результат для N = 2, df = [2, 1, 1].
```

</section>

<section class="mission-step" data-step="4" markdown="1">

<span class="mission-label">Шаг 4 · 12 минут</span>

## Перенеси в домашку: pipeline и выбор k

Собери в ноутбуке цепочку `Pipeline`: TF-IDF → SVD → KMeans. Сначала выбери k,
потом один раз посмотри на `target`.

| Метрика | Нужны метки | Что показывает | Когда считать |
| --- | --- | --- | --- |
| silhouette | нет | насколько кластеры разделены | при выборе k |
| ARI | да | согласие с `target` | один раз после фиксации k |

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-load"> Загрузить корпус (`subset="all"`) с `remove=("headers", "footers", "quotes")`: в них есть метаданные и подсказки о теме.</li>
  <li><input type="checkbox" data-save="check-pipeline"> Собрать `TfidfVectorizer(min_df=5, stop_words="english")` → `TruncatedSVD(n_components=100, random_state=0)` → `KMeans`.</li>
  <li><input type="checkbox" data-save="check-k"> Перебрать `k` от 5 до 20 и seeds 0, 1, 2; для каждого посчитать silhouette на LSA-векторах.</li>
  <li><input type="checkbox" data-save="check-fix"> Выбрать k по среднему silhouette и разбросу; зафиксировать k до расчёта ARI.</li>
  <li><input type="checkbox" data-save="check-ari"> После фиксации k один раз посчитать ARI против `target`, а также размеры кластеров.</li>
  <li><input type="checkbox" data-save="check-leak"> Проверить утечки: `target` не участвует в fit, transform и выборе k; при train/test TF-IDF и SVD fit только на train.</li>
</ul>

Если кластеры смешали темы — это результат для анализа, а не повод подкрутить k
по `target`.

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 3 минуты</span>

## Вывод

Четыре предложения, не memo:

1. Корпус и очистка текста.
2. Параметры TF-IDF и LSA.
3. Выбранное k, silhouette и разброс по seeds.
4. ARI и где кластеры смешались; годится ли это для discovery.

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Корпус и очистка...
2. TF-IDF и LSA...
3. k, silhouette, seeds...
4. ARI, смешанные темы, решение..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-run"> Ноутбук запускается сверху вниз без ручных правок.</li>
  <li><input type="checkbox" data-save="check-k-final"> k выбран по silhouette, `target` не участвовал.</li>
  <li><input type="checkbox" data-save="check-ari-final"> ARI посчитан после фиксации k.</li>
  <li><input type="checkbox" data-save="check-error"> В выводе есть смешанные темы и ограничение метода.</li>
</ul>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 3 минуты</span>

## Память

Закрой текст и ответь по памяти. Не перечитывай. Если не получилось — вернись
к нужному шагу, а не ко всей теории.

<ul class="mission-memory">
  <li>Почему IDF уменьшает вес слова, которое есть во всех документах?</li>
  <li>Чем silhouette отличается от ARI и почему нельзя выбирать k по ARI?</li>
  <li>Где в этой задаче может возникнуть утечка?</li>
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
