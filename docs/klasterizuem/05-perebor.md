# 5. Перебор кандидатов

Цель (5–7 мин): получить метки и метрику для **каждого** варианта и сложить их в список.

Кандидат = алгоритм + его настройка. Мы не знаем заранее, какой лучше, поэтому пробуем
несколько и храним результат каждого.

```quiz
{
  "title": "Урок 5 · Перебор",
  "questions": [
    {"type":"order","q":"Расставь шаги перебора:","items":["добавить (имя, метки, метрику) в список","пройти по значениям гиперпараметра","обучить алгоритм и получить метки","посчитать метрику"],"answer":["пройти по значениям гиперпараметра","обучить алгоритм и получить метки","посчитать метрику","добавить (имя, метки, метрику) в список"],"explain":"Цикл → обучение → метрика → сохранить."},
    {"type":"fill","q":"Пройди по k от 2 до 6: for k in ___:","options":["range(2, 7)","range(2, 6)","range(6)","[2..6]"],"answer":0,"explain":"range(2, 7) даёт 2,3,4,5,6 (правая граница не входит)."},
    {"type":"find","q":"Где ошибка? Хотим сохранить имя, метки и метрику.","lines":["rows = []","lab = KMeans(k).fit_predict(Z)","rows.append(silhouette_score(Z, lab))"],"answer":2,"explain":"Потеряли имя и метки: нужно rows.append((name, lab, metric)). Иначе потом не найдём победителя."},
    {"type":"choice","q":"Зачем хранить имя вместе с метриками?","options":["чтобы знать, какой алгоритм победил","чтобы ускорить","чтобы нарисовать","не зачем"],"answer":0,"explain":"Потом выбираем лучшего по метрике и должны знать, кто это."}
  ]
}
```

## Песочница: перебери k и посмотри метрики

```pyplay
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=300, centers=3, random_state=0)
Z = StandardScaler().fit_transform(X)

rows = []
for k in range(2, 7):
    lab = KMeans(k, n_init=5, random_state=0).fit_predict(Z)
    s = ___                       # посчитай силуэт
    rows.append((k, s))

for k, s in rows:
    print("k =", k, " silhouette =", round(s, 3))
```

??? success "Проверить"
    `s = silhouette_score(Z, lab)`. Самый большой силуэт обычно у `k = 3` — там три
    настоящих облака.

!!! tip "В реальной программе"
    Точно так же перебираешь и другие алгоритмы (`DBSCAN`, `GaussianMixture`,
    `AgglomerativeClustering`, `MeanShift`) и копишь всех в `rows`.

## Что дальше

Выберем лучшего из всех кандидатов.
