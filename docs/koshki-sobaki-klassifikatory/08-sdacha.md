# 8. Что сдать

Цель: собрать всё в один ноутбук и проверить по чек-листу.

## Шаг 1 · Полный код ноутбука

Скопируй в `.ipynb` по ячейкам (или одним файлом — как удобно). Это ровно то, что
проходили, без лишних строк.

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

# --- 1. данные: 20 кошек и 20 собак 20x20 ---
np.random.seed(0)
X, y = [], []
for i in range(20):
    cat = np.random.randint(0, 60, (20, 20)); cat[:3] = 255      # кошка: полоса сверху
    X.append(cat); y.append(0)
    dog = np.random.randint(0, 60, (20, 20)); dog[:, :3] = 255   # собака: полоса сбоку
    X.append(dog); y.append(1)
X = np.array(X).reshape(40, 400)
y = np.array(y)
np.savez("koshki_sobaki.npz", X=X, y=y)      # датасет для сдачи

# --- 2. делим на обучение и проверку ---
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=0)

# --- 3. четыре модели ---
models = {
    "дерево": DecisionTreeClassifier(random_state=0),
    "SVM": SVC(),
    "PCA+дерево": make_pipeline(PCA(n_components=15), DecisionTreeClassifier(random_state=0)),
    "ансамбль": RandomForestClassifier(random_state=0),
}
for name, m in models.items():
    m.fit(Xtr, ytr)
    print(name, round(m.score(Xte, yte), 2))

# --- 4. качество ---
print(classification_report(yte, models["ансамбль"].predict(Xte)))

# --- 5. атака одним пикселем ---
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
```

## Шаг 2 · Приложи картинки

Добавь в конец, чтобы в ответе были сами изображения:

```python
plt.imshow(X[0].reshape(20, 20), cmap="gray"); plt.title("кошка"); plt.show()
plt.imshow(X[-1].reshape(20, 20), cmap="gray"); plt.title("собака"); plt.show()
```

## Шаг 3 · Чек-лист сдачи

- [ ] `20` кошек и `20` собак `20 × 20` — есть (`X.shape == (40, 400)`).
- [ ] `4` модели: дерево, SVM, PCA+дерево, ансамбль — обучены.
- [ ] Качество каждого измерено (`score` и `classification_report`).
- [ ] Атака одним пикселем — найдена (`found` не пусто).
- [ ] Датасет сохранён: `koshki_sobaki.npz`.
- [ ] Приложен `.ipynb`.

## Шаг 4 · Что отвечать по пунктам ДЗ

1. **Изображения** — код в шаге 1 (пункт 1), приложены картинки из шага 2.
2. **Четыре схемы** — пункт 3 кода: дерево, SVM, PCA+дерево, ансамбль.
3. **Оценка качества** — пункт 4: отчёт `macro avg`.
4. **Атака** — пункт 5: меняем один пиксель, ответ меняется.

## Наивные вопросы

!!! question "Обязательно ли `matplotlib`?"
    Нет. Задание просит сгенерировать и приложить изображения; для ответа хватит
    `imshow` или сохранения массива.

!!! question "Можно другой генератор (круги, уши)?"
    Да, любой. Здесь выбран самый простой: полоса сверху/сбоку. Важно, чтобы кошки и
    собаки различались и было по `20` штук.

## Финал

Ты собрал ДЗ сам: данные → `4` модели → качество → атака. Если где-то затык — открой
[практику](practice.md) или [ответы](answers.md).
