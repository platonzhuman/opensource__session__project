# Шпаргалка

## Весь код ДЗ (одним куском)

```python
import numpy as np
import matplotlib.pyplot as plt
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
X = np.array(X).reshape(40, 400)
y = np.array(y)
np.savez("koshki_sobaki.npz", X=X, y=y)

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

## Три команды любой модели

```python
m.fit(Xtr, ytr)      # учись
m.predict(Xte)       # дай ответы
m.score(Xte, yte)    # сколько угадал
```

## Числа

| Что | Значение |
| --- | --- |
| Размер картинки | `20 × 20` |
| Признаков | `400` |
| Картинок | `40` (`20` + `20`) |
| Ответы | `0` кошка, `1` собака |
| `test_size` | `0.25` |
| `n_components` у PCA | `15` |
| Попытки атаки | `400 × 2 = 800` |

## Атака одним пикселем

```python
tree = DecisionTreeClassifier(random_state=0).fit(X, y)
pred = tree.predict(X)
for i in range(40):
    if pred[i] != y[i]:
        continue
    base = X[i].copy(); target = 1 - y[i]
    for p in range(400):
        for v in (0, 255):
            if base[p] == v:
                continue
            f = base.copy(); f[p] = v
            if tree.predict(f[None, :])[0] == target:
                print("сломал:", i, p, v); raise SystemExit
```

## Правила, которые спасают

- `cat[:3] = 255` — полоса сверху; `dog[:, :3] = 255` — полоса сбоку.
- `train_test_split` делит `X` и `y` **вместе**.
- Проверять модель только на `Xte`, не на обучающих.
- `fit`/`score` одинаковы у всех моделей.
- Менять пиксель только на **копии** (`base.copy()`).
- Номер пикселя → строка и столбец: `p // 20`, `p % 20`.

## Запуск сайта

```bash
/home/platoxa/Documents/Learning/serve.sh
```

Открой `http://127.0.0.1:8000`.
