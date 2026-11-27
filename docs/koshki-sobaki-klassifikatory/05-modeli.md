# 5. Ещё три модели

Цель: получить все `4` модели из ДЗ. Код почти такой же, как у дерева.

## Шаг 1 · Что это за модели

- **SVM** — ищет разделяющую границу между кошками и собаками.
- **PCA + дерево** — сначала сжимает `400` чисел до `15`, потом дерево.
- **Ансамбль** (`RandomForestClassifier`) — много деревьев, которые голосуют.

Тебе **не нужно** понимать их устройство. Важно: зовутся они **одинаково** —
`.fit`, `.score`.

## Шаг 2 · Собери четыре модели и обучи их в цикле

```pyplay
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline
from sklearn.ensemble import RandomForestClassifier

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
    "дерево":     DecisionTreeClassifier(random_state=0),
    "SVM":        SVC(),
    "PCA+дерево": make_pipeline(PCA(n_components=15), DecisionTreeClassifier(random_state=0)),
    "ансамбль":   RandomForestClassifier(random_state=0),
}
for name, m in models.items():
    m.fit(Xtr, ytr)
    print(name, round(m.score(Xte, yte), 2))
```

| Строка | По-русски |
| --- | --- |
| `models = { "имя": модель, ... }` | словарь: список «название → модель» |
| `for name, m in models.items():` | пройди по каждой паре: имя `name`, модель `m` |
| `m.fit(Xtr, ytr)` | обучи текущую модель |
| `m.score(Xte, yte)` | её качество |
| `round(..., 2)` | округли до сотых |

!!! question "Сделай"
    Что напечатает код? Сколько моделей обучено?

??? success "Проверить"
    Четыре строки с качеством (везде `1.0`), обучены все `4` модели. Каждая — те же
    две команды `fit` и `score`.

## Шаг 3 · Запомни главное

Все модели вызываются одинаково. Чтобы добавить новую — меняешь только имя в скобках.
Именно поэтому в ДЗ легко уместить `4` схемы: цикл один.

!!! tip "Правило"
    `PCA+дерево` — это не новая команда, а `make_pipeline(PCA(...), DecisionTreeClassifier())`:
    «сначала `PCA`, потом дерево», за один вызов.

## Что здесь что

| Модель | Класс | Что делает |
| --- | --- | --- |
| дерево | `DecisionTreeClassifier` | вопросы «ярче/нет» |
| SVM | `SVC` | разделяющая граница |
| PCA+дерево | `make_pipeline(PCA(15), дерево)` | сжатие, потом дерево |
| ансамбль | `RandomForestClassifier` | много деревьев голосуют |

## Наивные вопросы

!!! question "Почему у всех `.fit` и `.score` одинаковые?"
    Так устроена библиотека `sklearn`: у любой модели одинаковый набор команд.

!!! question "Что означает `n_components=15`?"
    Сжать `400` чисел-пикселей до `15` самых важных.

!!! question "Почему у ансамбля нет числа деревьев?"
    По умолчанию их `100` — этого достаточно, можно не указывать.

## Чекпоинт

!!! question "Проверка"
    1. Предскажи: у всех моделей качество будет высоким или низким?
    2. Объясни, почему `4` модели помещаются в один цикл.
    3. Напиши строку, которая обучает модель `m`.

??? success "Проверить"
    1. Высоким — признак «полоса сверху/сбоку» легко заметить.
    2. У всех моделей одинаковые команды `fit`/`score`.
    3. `m.fit(Xtr, ytr)`.

## Что дальше

Посмотрим отчёт о качестве по каждому классу.
