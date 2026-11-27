# 8. Финиш: доводим твой код до сдачи

Быстрый путь: у тебя уже есть почти рабочий код — доведём его до требований ДЗ. Ниже
что не так и как починить, а в конце готовый код.

## Твой код (как есть)

```python
import numpy as np
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
import matplotlib.pyplot as plt

def read_file(path):
    rows, start = [], False
    for line in open(path, encoding="utf-8", errors="ignore"):
        if "Freq" in line and "Range" in line:
            start = True
            continue
        if start:
            p = line.split()
            if len(p) >= 2:
                rows.append([float(p[0]), float(p[1])])
    return np.array(rows)

def cluster(X):
    Z = StandardScaler().fit_transform(X)          # StandardScaler не импортирован
    rows = []
    for k in range(2, 7):
        lab = KMeans(k, n_init=5, random_state=0).fit_predict(Z)
        rows.append((f"kmeans k={k}", lab, silhouette_score(Z, lab)))
    lab = DBSCAN(eps=0.5, min_samples=5).fit_predict(Z)
    m = lab != -1
    if len(set(lab[m])) >= 2:
        rows.append(("dbscan eps=0.5", lab, silhouette_score(Z[m], lab[m])))
    scores = [r[2] for r in rows]
    best = rows[int(np.argmax(scores))]
    return best[1]

base = "files/input/clustering2test/2test/"
base = read_file(base)            # ошибка: это ПАПКА, а не файл
result = cluster(base)
X = load_freq_range(file)         # load_freq_range и file не определены
plt.scatter(X[:, 0], X[:, 1], c=labels, s=8)   # labels не определён
```

## 5 правок — и готово

1. **Импорт.** `StandardScaler` используется, но не импортирован. Добавь
   `from sklearn.preprocessing import StandardScaler`.

2. **Читаешь папку, а не файл.** `base = "…/2test/"` — это директория. Нужен конкретный
   файл: `file = base + "20230328-Belem"` и `read_file(file)`.

3. **Мало алгоритмов и метрик.** В ДЗ нужно **≥5 алгоритмов** и **≥5 метрик**. У тебя
   `KMeans`+`DBSCAN` (2) и один `silhouette` (1). Добавь `AgglomerativeClustering`,
   `GaussianMixture`, `MeanShift`, а метрик — `calinski_harabasz_score`,
   `davies_bouldin_score` и у GMM `bic` и `aic` (правдоподобие — как на уроке).

4. **В демо переменные не определены.** `load_freq_range`, `file`, `labels`, `name` —
   их нет. Используй свои же `read_file` и `cluster`.

5. **Выбор по одной метрике.** Метрики в разных масштабах → нормируй каждую к `0…1` и
   усредни, потом `np.argmax`.

## Проверь свою логику в песочнице

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
    best = rows[int(np.argmax(scores))]
    return best[0], best[1]

X, _ = make_blobs(n_samples=300, centers=3, random_state=0)
name, labels = cluster(X)
print("победитель:", name, "| кластеров:", len(set(labels)))
```

??? success "Проверить"
    Твой код (с добавленным импортом) работает: печатает победителя и число кластеров.

## Готовый код (доведён до ДЗ)

5 алгоритмов и 5 метрик — **всё из sklearn**, без самописных функций.

```python
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, MeanShift
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score


# читаем файл — берём Freq и Range
def read_file(path):
    rows, start = [], False
    for line in open(path, encoding="utf-8", errors="ignore"):
        if "Freq" in line and "Range" in line:
            start = True
            continue
        if start:
            p = line.split()
            if len(p) >= 2:
                rows.append([float(p[0]), float(p[1])])
    return np.array(rows)


def cluster(X):
    Z = StandardScaler().fit_transform(X)
    rows = []

    # 5 алгоритмов: kmeans, agglo, gmm, dbscan, meanshift
    for k in range(2, 7):
        rows.append((f"kmeans k={k}", KMeans(k, n_init=5, random_state=0).fit_predict(Z), np.nan, np.nan, "kmeans", k))
        rows.append((f"agglo k={k}", AgglomerativeClustering(k).fit_predict(Z), np.nan, np.nan, "agglo", k))
    for k in range(2, 7):
        g = GaussianMixture(k, random_state=0).fit(Z)
        rows.append((f"gmm k={k}", g.predict(Z), g.bic(Z), g.aic(Z), "gmm", k))
    for eps in (0.3, 0.5, 0.8):
        rows.append((f"dbscan eps={eps}", DBSCAN(eps=eps, min_samples=5).fit_predict(Z), np.nan, np.nan, "dbscan", eps))
    rows.append(("meanshift", MeanShift().fit_predict(Z), np.nan, np.nan, "meanshift", None))

    # 5 метрик (все из sklearn): silhouette, calinski, davies + bic, aic у GMM
    table = []
    for name, lab, bic, aic, kind, param in rows:
        m = lab != -1
        Zm, lm = Z[m], lab[m]
        if len(set(lm)) < 2:
            continue
        table.append((name, lab, kind, param, dict(
            sil=silhouette_score(Zm, lm),
            ch=calinski_harabasz_score(Zm, lm),
            db=davies_bouldin_score(Zm, lm),
            bic=bic,
            aic=aic)))

    # нормируем каждую метрику к 0..1 и усредняем
    keys = ["sil", "ch", "db", "bic", "aic"]
    higher = [True, True, False, False, False]
    score = np.zeros(len(table)); cnt = np.zeros(len(table))
    for key, hi in zip(keys, higher):
        v = np.array([r[4][key] if np.isfinite(r[4][key]) else np.nan for r in table])
        good = np.isfinite(v)
        if good.sum() < 2:
            continue
        o = np.argsort(v[good]); rk = np.empty(good.sum()); rk[o] = np.arange(good.sum()); rk /= (good.sum() - 1)
        score[good] += rk if hi else 1 - rk
        cnt[good] += 1
    score = score / np.maximum(cnt, 1)

    best = table[int(np.argmax(score))]
    kind, param = best[2], best[3]

    # победителя обучаем на ВСЕХ точках
    if kind == "kmeans":
        labels = KMeans(param, n_init=5, random_state=0).fit_predict(Z)
    elif kind == "agglo":
        labels = AgglomerativeClustering(param).fit_predict(Z)
    elif kind == "gmm":
        labels = GaussianMixture(param, random_state=0).fit(Z).predict(Z)
    elif kind == "dbscan":
        labels = DBSCAN(eps=param, min_samples=5).fit_predict(Z)
    else:
        labels = MeanShift().fit_predict(Z)
    return best[0], labels


def cluster_file(path):
    return cluster(read_file(path))
```

## Запуск (в Colab, где есть файлы)

```python
import matplotlib.pyplot as plt
base = "files/input/clustering2test/2test/"
file = base + "20230328-Belem"          # замени на любой файл из папки
X = read_file(file)
name, labels = cluster(X)
print("победитель:", name, "| кластеров:", len(set(labels)) - (1 if -1 in labels else 0))

plt.scatter(X[:, 0], X[:, 1], c=labels, s=8)
plt.xlabel("Freq"); plt.ylabel("Range"); plt.title(name); plt.show()
```

## Чек-лист сдачи

- [ ] функция читает **конкретный файл** (не папку);
- [ ] **≥ 5 алгоритмов** (`kmeans, dbscan, agglo, gmm, meanshift`);
- [ ] **≥ 5 метрик** (`silhouette, calinski, davies, bic, aic`) — все из sklearn;
- [ ] возвращает **метки для каждой точки**;
- [ ] есть график `scatter` по кластерам.

Полное решение — в [answers.md](answers.md).
