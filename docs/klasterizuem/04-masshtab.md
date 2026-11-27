# 4. Масштаб и одна метрика

Цель (5–7 мин): привести данные к одному масштабу и посчитать качество кластеризации.

`Freq` — единицы, `Range` — сотни. Без масштаба `Range` «задавит» `Freq`. Поэтому
`StandardScaler`.

```quiz
{
  "title": "Урок 4 · Масштаб и метрика",
  "questions": [
    {"type":"choice","q":"Зачем StandardScaler?","options":["чтобы координаты были в равном масштабе","чтобы ускорить код","чтобы удалить шум","чтобы нарисовать график"],"answer":0,"explain":"Иначе координата с большими числами задавит маленькую."},
    {"type":"fill","q":"Посчитай силуэт: s = ___ (Z, labels)","options":["silhouette_score","np.argmax","StandardScaler","DBSCAN"],"answer":0,"explain":"silhouette_score(X, labels) — метрика: больше = лучше."},
    {"type":"truefalse","q":"У силуэта чем больше значение, тем лучше кластеры.","answer":true,"explain":"Да, в пределах от -1 до 1."},
    {"type":"choice","q":"Как получить метки кластеров одной командой?","options":["model.fit_predict(Z)","model.score(Z)","model.predict_labels()","StandardScaler().fit(Z)"],"answer":0,"explain":"fit_predict сразу обучает и выдаёт метки для каждой точки."}
  ]
}
```

## Песочница: допиши метрику

```pyplay
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=200, centers=3, random_state=0)
Z = StandardScaler().fit_transform(X)
labels = KMeans(3, n_init=5, random_state=0).fit_predict(Z)
s = ___              # посчитай силуэт между Z и labels
print("silhouette =", round(s, 3))
```

??? success "Проверить"
    `s = silhouette_score(Z, labels)` → примерно `0.7…0.8`. Три облака разделяются
    хорошо.

## Что дальше

Переберём несколько алгоритмов и соберём метрики каждого.
