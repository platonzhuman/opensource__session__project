# 6. Выбор лучшего

Цель (5–7 мин): из списка кандидатов выбрать одного — самого лучшего по метрикам.

Метрики в разных единицах: силуэт `0…1`, Дэвис-Болдин — единицы. Складывать их напрямую
нельзя. Поэтому **нормируем** каждую к `0…1` и считаем средний балл.

```quiz
{
  "title": "Урок 6 · Выбор",
  "questions": [
    {"type":"choice","q":"Почему нельзя просто сложить силуэт и Дэвиса-Болдина?","options":["они в разных масштабах","они одинаковые","их нельзя считать","это медленно"],"answer":0,"explain":"Сначала нормируют, потом складывают."},
    {"type":"fill","q":"Индекс лучшего элемента массива score: best = np.___(score)","options":["argmax","argsort","max","sum"],"answer":0,"explain":"argmax возвращает ИНДЕКС максимума. argsort — порядок сортировки."},
    {"type":"truefalse","q":"argmax возвращает сам максимум.","answer":false,"explain":"Нет: argmax — это индекс. Само значение даёт max."},
    {"type":"input","q":"Что вернёт np.argmax([0.1, 0.9, 0.3])?","answer":["1"],"explain":"Максимум 0.9 стоит на позиции 1."}
  ]
}
```

## Песочница: выбери лучшее k

```pyplay
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=300, centers=3, random_state=0)
Z = StandardScaler().fit_transform(X)

rows = []
for k in range(2, 7):
    lab = KMeans(k, n_init=5, random_state=0).fit_predict(Z)
    rows.append((k, silhouette_score(Z, lab), davies_bouldin_score(Z, lab)))

sil = np.array([r[1] for r in rows])   # больше лучше
db = np.array([r[2] for r in rows])    # меньше лучше

score = sil / sil.max() + (1 - db / db.max())   # оба к 0..1, потом сложить
best = ___                                      # индекс максимума score
print("лучшее k =", rows[best][0])
```

??? success "Проверить"
    `best = np.argmax(score)`. Получится `k = 3` — верное число облаков.

## Что дальше

Собираем всё в одну функцию `cluster_file(path)`.
