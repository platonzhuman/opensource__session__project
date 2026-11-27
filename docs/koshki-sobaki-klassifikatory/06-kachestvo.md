# 6. Оценка качества

Цель: оценить каждую модель отчётом `classification_report`.

## Шаг 1 · Одного числа мало

`score` даёт одно число — долю угаданных. Отчёт показывает качество **по каждому
классу** отдельно: сколько кошек угадали, сколько собак.

## Шаг 2 · Напечатай отчёт

```pyplay
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

np.random.seed(0)
X, y = [], []
for i in range(20):
    cat = np.random.randint(0, 60, (20, 20)); cat[:3] = 255
    X.append(cat); y.append(0)
    dog = np.random.randint(0, 60, (20, 20)); dog[:, :3] = 255
    X.append(dog); y.append(1)
X = np.array(X).reshape(40, 400); y = np.array(y)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=0)

models = {
    "дерево": DecisionTreeClassifier(random_state=0),
    "SVM": SVC(),
    "PCA+дерево": make_pipeline(PCA(n_components=15), DecisionTreeClassifier(random_state=0)),
    "ансамбль": RandomForestClassifier(random_state=0),
}
for name, m in models.items():
    m.fit(Xtr, ytr)
    print(name, round(m.score(Xte, yte), 2))

print(classification_report(yte, models["ансамбль"].predict(Xte)))
```

| Строка | По-русски |
| --- | --- |
| `classification_report(yte, ответы)` | сравни правильные ответы `yte` с ответами модели |
| `models["ансамбль"].predict(Xte)` | ответы ансамбля на проверочных картинках |

## Шаг 3 · Как читать таблицу

| Столбец | Что значит |
| --- | --- |
| `precision` | из названных «кошками» сколько правда кошки |
| `recall` | из всех кошек сколько нашли |
| `f1-score` | удобный итог по классу (`1.0` — идеально) |
| `support` | сколько картинок этого класса |
| `macro avg` | **главная строка** — среднее по классам |

!!! tip "Правило"
    Смотри строку `macro avg`, столбец `f1-score`. Это итоговая оценка модели.

!!! question "Сделай"
    Какое `macro avg f1-score` у ансамбля?

??? success "Проверить"
    `1.00` — модель не ошибается ни на кошках, ни на собаках.

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| `classification_report` | таблица качества по классам |
| `macro avg` | среднее по классам (итог) |
| `support` | размер класса |

## Наивные вопросы

!!! question "Почему у меня `precision` и `recall` могут отличаться от `score`?"
    `score` — общая доля. Precision и recall смотрят на классы по отдельности.

!!! question "Зачем это в ДЗ, если `score` уже есть?"
    Задание просит «оценить качество для каждого метода». Отчёт — самый наглядный
    способ. `score` тоже подходит, но отчёт подробнее.

## Чекпоинт

!!! question "Проверка"
    1. Предскажи: `macro avg f1-score` будет `0.5` или `1.0`?
    2. Объясни, что такое `recall`.
    3. Напиши строку, которая печатает отчёт для модели `m`.

??? success "Проверить"
    1. `1.0`.
    2. Из всех кошек (или собак) — какую долю модель нашла.
    3. `print(classification_report(yte, m.predict(Xte)))`.

## Что дальше

Осталось сломать одну модель одним пикселем.
