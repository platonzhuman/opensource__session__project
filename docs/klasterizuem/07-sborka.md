# 7. Сборка `cluster_file`

Цель (5–7 мин): соединить все куски в одну функцию. Это и есть сдача.

```quiz
{
  "title": "Урок 7 · Сборка",
  "questions": [
    {"type":"order","q":"Расставь шаги главной функции:","items":["вернуть метки для всех точек","найти лучшего на подвыборке","прочитать файл и взять Freq, Range","обучить победителя на всех данных","привести к масштабу"],"answer":["прочитать файл и взять Freq, Range","привести к масштабу","найти лучшего на подвыборке","обучить победителя на всех данных","вернуть метки для всех точек"],"explain":"Чтение → масштаб → поиск → обучение победителя на всех → возврат."},
    {"type":"find","q":"Что не так? Функция должна отдать метки каждой точки.","lines":["def cluster_file(path):","    labels, name = auto_cluster(path)","    return name"],"answer":2,"explain":"Возвращать надо МЕТКИ (labels), а не имя. И ещё: auto_cluster принимает данные, а не путь — сначала читаем файл."},
    {"type":"choice","q":"Что должна вернуть cluster_file(path)?","options":["метки кластеров для каждой точки","имя файла","график","число кластеров"],"answer":0,"explain":"По условию: разметка каждой точки файла."},
    {"type":"fill","q":"Верни метки из функции: ___ labels","options":["return","print","append","open"],"answer":0,"explain":"return отдаёт результат наружу из функции."}
  ]
}
```

## Песочница: допиши выбор и собери функцию

```pyplay
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score
from sklearn.datasets import make_blobs

def cluster(X):
    Z = StandardScaler().fit_transform(X)
    rows = []
    for k in range(2, 7):
        lab = KMeans(k, n_init=5, random_state=0).fit_predict(Z)
        rows.append((f"kmeans k={k}", lab, silhouette_score(Z, lab)))
    lab = DBSCAN(eps=0.5, min_samples=5).fit_predict(Z)
    m = lab != -1
    if len(set(lab[m])) >= 2:
        rows.append(("dbscan eps=0.5", lab, silhouette_score(Z[m], lab[m])))

    scores = [r[2] for r in rows]
    best = rows[___]          # кандидат с лучшим (максимальным) баллом
    return best[1]            # метки

X, _ = make_blobs(n_samples=300, centers=3, random_state=0)
labels = cluster(X)
print("кластеров:", len(set(labels)))
```

??? success "Проверить"
    `best = rows[int(np.argmax(scores))]`. Функция вернёт метки победителя.

## Полный скелет главной функции

```python
def cluster_file(path, maxsearch=3000):
    X = load_freq_range(path)                       # 1. читаем Freq, Range
    Z = StandardScaler().fit_transform(X)           # 2. масштаб
    idx = np.random.default_rng(0).choice(len(Z), min(len(Z), maxsearch), replace=False)
    name = pick_best(Z[idx])                         # 3. ищем лучшего на подвыборке
    labels = all_candidates()[name](Z)[0]            # 4. обучаем победителя на всех
    return labels, name                              # 5. отдаём метки
```

Полное решение (все 5 алгоритмов и 5 метрик) — в [answers.md](answers.md).

## Что дальше

Собери свою программу по шагам из уроков 3–7 и сдай. Устал — вернись завтра,
прогресс сохранился.
