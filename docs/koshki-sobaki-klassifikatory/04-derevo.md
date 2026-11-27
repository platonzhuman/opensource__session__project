# 4. Первая модель: дерево решений

Цель: обучить первую модель и узнать её качество. Это три команды.

## Шаг 1 · Три команды любой модели

У всех моделей одинаковые команды:

- `fit(Xtr, ytr)` — «учись по примерам»;
- `predict(Xte)` — «дай ответы»;
- `score(Xte, yte)` — «сколько угадал» (доля `0…1`).

## Шаг 2 · Обучи дерево

Дерево — модель из вопросов вида «пиксель № `k` ярче порога?». Запусти:

```pyplay
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

np.random.seed(0)
X, y = [], []
for i in range(20):
    cat = np.random.randint(0, 60, (20, 20)); cat[:3] = 255
    X.append(cat); y.append(0)
    dog = np.random.randint(0, 60, (20, 20)); dog[:, :3] = 255
    X.append(dog); y.append(1)
X = np.array(X).reshape(40, 400); y = np.array(y)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=0)

model = DecisionTreeClassifier(random_state=0)   # создай модель
model.fit(Xtr, ytr)                              # учись на обучающих
print(model.score(Xte, yte))                     # проверь на новых
```

| Строка | По-русски |
| --- | --- |
| `DecisionTreeClassifier(random_state=0)` | создай модель-дерево |
| `model.fit(Xtr, ytr)` | обучи её на `30` картинках |
| `model.score(Xte, yte)` | сколько из `10` проверочных угадала |

!!! question "Сделай"
    Что напечатает `score`?

??? success "Проверить"
    `1.0` — модель угадала все `10` проверочных картинок. Полоса сверху/сбоку легко
    различима, поэтому дерево не ошибается.

## Шаг 3 · Посмотри ответы руками

`predict` возвращает ответы модели. Сравни их с правильными.

```pyplay
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

np.random.seed(0)
X, y = [], []
for i in range(20):
    cat = np.random.randint(0, 60, (20, 20)); cat[:3] = 255
    X.append(cat); y.append(0)
    dog = np.random.randint(0, 60, (20, 20)); dog[:, :3] = 255
    X.append(dog); y.append(1)
X = np.array(X).reshape(40, 400); y = np.array(y)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=0)

model = DecisionTreeClassifier(random_state=0).fit(Xtr, ytr)
print("модель:", model.predict(Xte))
print("ответы :", yte)
```

!!! question "Сделай"
    Совпадают ли два напечатанных списка?

??? success "Проверить"
    Да, списки одинаковые: модель угадала всё. `score` — это доля совпадений.

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| `DecisionTreeClassifier` | модель-дерево |
| `.fit(Xtr, ytr)` | обучение |
| `.predict(Xte)` | ответы модели |
| `.score(Xte, yte)` | доля правильных |

## Наивные вопросы

!!! question "Что делает `random_state=0` у дерева?"
    Фиксирует случайность, чтобы при каждом запуске было одно и то же.

!!! question "Почему `score = 1.0`, это не подозрительно?"
    Здесь данные простые (полоса сверху или сбоку), поэтому `1.0` честный. На сложных
    данных так не бывает.

## Чекпоинт

!!! question "Проверка"
    1. Предскажи: `score` на обучающих будет выше или ниже, чем на проверке?
    2. Объясни, что делает `.fit`.
    3. Напиши строку, которая узнаёт качество модели.

??? success "Проверить"
    1. Выше или равно (на обучающих модель запоминает).
    2. Обучает модель по примерам.
    3. `model.score(Xte, yte)`.

## Что дальше

Добавим ещё три модели — код почти такой же.
