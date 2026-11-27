---
title: "4 классификатора и атака одним пикселем"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="catsdogs-homework" data-title="4 классификатора и атака одним пикселем" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">Кошки и собаки · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 45 минут

Сегодня собираем одну домашку: 20 кошек и 20 собак, четыре классификатора,
accuracy и атака одним пикселем. Не теория курса, а рабочий ноутбук.

1. **Картинка как числа.** 20×20×3 — это 1200 чисел, нормализация и flatten.
2. **Train/test.** 40 картинок, проверка на тех, которые модель не видела.
3. **Четыре модели.** Дерево, SVM, PCA+дерево и ансамбль.
4. **Accuracy.** Одно число и отчёт по классам.
5. **Атака.** Один пиксель — и модель меняет ответ.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 10 минут</span>

## Картинка — это числа

Картинка 20×20 с тремя каналами — это три таблицы 20×20: красный, зелёный и
синий. В каждой клетке число от 0 до 255. Для модели картинка — одна строка.

| Что | Размер | Чисел |
| --- | --- | --- |
| один канал | 20×20 | 400 |
| RGB | 20×20×3 | 1200 |

Нормализация делит каждое число на 255: значения становятся от 0 до 1. Flatten
разворачивает вложенные списки в один список — его и получает модель. Чтобы не
печатать 1200 чисел, проверяем на маленькой картинке 2×2×3.

### Почини

Сейчас нормализация делит на 100. Исправь делитель, чтобы получились значения
от 0 до 1.

```pyplay
# @mode fix
# @expect [[[0.0, 0.5, 1.0], [1.0, 0.2, 0.0]], [[0.04, 0.08, 0.12], [0.39, 0.59, 0.78]]]
# @hint Каждый канал делится на 255. Ошибка в делителе: сейчас там 100.
image = [
    [[0, 128, 255], [255, 51, 0]],
    [[10, 20, 30], [100, 150, 200]],
]

def normalize(img):
    return [[[round(v / 100, 2) for v in pixel] for pixel in row] for row in img]

print(normalize(image))
```

### Напиши сам

Напиши `flatten(img)`: собери все каналы всех пикселей в один список. Напечатай
результат для картинки 2×2×3.

```pyplay
# @mode write
# @expect [0, 128, 255, 255, 51, 0, 10, 20, 30, 40, 50, 60]
# @hint Пройди по строкам, потом по пикселям, потом по каналам. Добавляй каждое число в один список.
image = [
    [[0, 128, 255], [255, 51, 0]],
    [[10, 20, 30], [40, 50, 60]],
]

# Напиши flatten(img): верни все числа одной строкой.
# Напечатай flatten(image).
```

<div class="mission-note mission-note--blue">
  <strong>Проверка размера</strong>
  У 40 картинок 20×20×3 таблица <code>X</code> имеет размер 40×1200. Если
  оставляешь один канал, будет 40×400. Дальше код одинаковый.
</div>

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 12 минут</span>

## Train/test и четыре модели

Делим 40 картинок на train и test, например `test_size=0.25`: 30 на обучение,
10 на проверку. Модель учится на train, а accuracy считаем только на test.
Иначе она просто запомнит примеры и покажет красивую цифру.

`accuracy` — доля правильных ответов: число совпадений делим на число примеров.

### Почини

Сейчас accuracy считает сумму ответов, а не совпадения. Для этих данных должно
получиться `0.75`.

```pyplay
# @mode fix
# @expect accuracy 0.75
# @hint Сравни пары y_true и y_pred. Совпадения раздели на количество примеров.
y_true = [0, 1, 1, 0]
y_pred = [0, 1, 0, 0]

acc = sum(y_pred) / len(y_true)
print("accuracy", acc)
```

### Четыре модели

| Модель | Класс | Идея |
| --- | --- | --- |
| дерево | `DecisionTreeClassifier` | вопросы «пиксель ярче порога?» |
| SVM | `SVC` | граница между классами |
| PCA+дерево | `make_pipeline(PCA(15), DecisionTreeClassifier())` | сжатие 1200 чисел до 15 |
| ансамбль | `RandomForestClassifier` | много деревьев голосуют |

У всех моделей одинаковые команды: `fit`, `predict`, `score`. Поэтому они
помещаются в один цикл по словарю. В ноутбуке accuracy бери из
`model.score(Xte, yte)`. Все четыре модели обучай на одном и том же `Xtr, ytr` и
сравнивай на одном `Xte, yte`.

</section>

<section class="mission-step" data-step="4" markdown="1">

<span class="mission-label">Шаг 4 · 8 минут</span>

## Атака одним пикселем

Берём картинку, которую модель угадывает. Меняем ровно один пиксель: один его
канал или все три. Если ответ стал противоположным — атака удалась. На практике
часто хватает одного канала.

| Что меняем | Сколько чисел | Индекс |
| --- | --- | --- |
| один канал одного пикселя | 1 | `p` |
| весь пиксель RGB | 3 | `3p`, `3p+1`, `3p+2` |

Порядок:

1. Найди картинку, где модель даёт правильный ответ.
2. Скопируй её, чтобы не испортить `X`.
3. Перебери каналы и значения 0, 255.
4. Остановись на первом, где модель ошибается.
5. Запиши номер картинки, канал и значение.

<div class="mission-note">
  <strong>Важно</strong>
  Модель не меняется. Меняется только одна картинка. Это и есть атака одним
  пикселем.
</div>

### Перенеси в домашку

- [ ] Сгенерируй 20 кошек и 20 собак 20×20×3.
- [ ] Сложи их в `X` размера 40×1200 и `y` из 0 и 1.
- [ ] Раздели `X` и `y` на train/test с `test_size=0.25` и `random_state=0`.
- [ ] Обучи четыре модели и выведи accuracy каждой.
- [ ] Найди один канал, который переворачивает ответ.

Если оставил один канал, `X` будет 40×400. Это допустимо, если в ответе
объяснишь размер.

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 5 минут</span>

## Вывод

Пять предложений, которые можно сдать преподавателю.

<div class="mission-note mission-note--blue">
  <strong>Шаблон</strong>
  1. Какие картинки и сколько. 2. Как делил на train/test. 3. Какие четыре
  модели. 4. Какая accuracy. 5. Какой пиксель или канал сломал модель.
</div>

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Данные: 20 кошек и 20 собак...
2. Train/test: ...
3. Модели: ...
4. Accuracy: ...
5. Атака: ..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-data"> <code>X</code> имеет размер 40×1200 или 40×400, <code>y</code> — 40 ответов.</li>
  <li><input type="checkbox" data-save="check-split"> Train и test не пересекаются.</li>
  <li><input type="checkbox" data-save="check-models"> Обучены четыре модели, accuracy выведена.</li>
  <li><input type="checkbox" data-save="check-attack"> Найден один канал, который меняет ответ.</li>
  <li><input type="checkbox" data-save="check-run"> Ноутбук запускается сверху вниз.</li>
</ul>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 5 минут</span>

## Память

Закрой текст и ответь по памяти. Не перечитывай.

<ul class="mission-memory">
  <li>Почему картинка 20×20×3 — это 1200 чисел?</li>
  <li>Зачем делить на train и test?</li>
  <li>Как один пиксель может изменить ответ модели?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2, 3 и 4."></textarea>

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
  <strong>Домашка собрана</strong>
  <p>
    Ты прошёл заход. Не закрывай вкладку сразу: запиши одну ошибку и вернись к
    трём вопросам завтра утром.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../">К плану курса</a>
    <a class="button" href="../../">На сегодня</a>
  </div>
</div>

</div>
