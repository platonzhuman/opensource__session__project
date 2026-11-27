# Ответы и разборы

Открывай после попытки. Здесь полное решение и ответы на тест.

## Тест самопроверки — ответы

1. **б** — одно число-пиксель.
2. **а** — кошка.
3. **б** — проверить на новых данных.
4. **б** — «учись».
5. **б** — поменять один пиксель, чтобы модель ошиблась.

## Финальное задание (ДЗ) — решение

Признак: **кошка — белая полоса сверху, собака — белая полоса сбоку.**

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

# 1. 20 кошек + 20 собак 20x20
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

# 2. деление
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=0)

# 3. четыре модели
models = {
    "дерево": DecisionTreeClassifier(random_state=0),
    "SVM": SVC(),
    "PCA+дерево": make_pipeline(PCA(n_components=15), DecisionTreeClassifier(random_state=0)),
    "ансамбль": RandomForestClassifier(random_state=0),
}
for name, m in models.items():
    m.fit(Xtr, ytr)
    print(name, round(m.score(Xte, yte), 2))

# 4. качество
print(classification_report(yte, models["ансамбль"].predict(Xte)))

# 5. атака одним пикселем (дерево)
tree = DecisionTreeClassifier(random_state=0).fit(X, y)
pred = tree.predict(X)
found = None
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
                found = (i, p, v); break
        if found:
            break
    if found:
        break
print("сломал:", found)

# картинки для ответа
plt.imshow(X[0].reshape(20, 20), cmap="gray"); plt.title("кошка"); plt.show()
plt.imshow(X[-1].reshape(20, 20), cmap="gray"); plt.title("собака"); plt.show()
```

### Результат (пример)

```
дерево 1.0
SVM 1.0
PCA+дерево 1.0
ансамбль 1.0
... macro avg f1-score 1.00
сломал: (0, 322, 255)   # пиксель 322 = строка 16, столбец 2 (сбоку)
```

### Почему так

- `X` — таблица `40 × 400`: каждая картинка развёрнута в строку чисел.
- `.fit` / `.score` — одинаковые у всех `4` моделей; поэтому цикл один.
- `classification_report` показывает качество по каждому классу; итог — `macro avg`.
- Атака перебирает пиксели и меняет один; когда ответ переворачивается — найдено.

!!! warning "Частая ошибка"
    Менять пиксель прямо в `X` (`X[i][p] = v`). Нужна копия `base.copy()`, иначе
    испортишь датасет.

!!! warning "Частая ошибка"
    Проверять модель на обучающих данных. Тогда `score = 1.0` ничего не значит —
    нужна проверка на `Xte`.

## Что прислать

- `.ipynb` с этим кодом.
- `koshki_sobaki.npz` (датасет).
- Картинки кота и собаки.
- Ответы: качество `4` моделей и найденный пиксель.
