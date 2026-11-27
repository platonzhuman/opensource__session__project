# Ответы и разборы

Открывай после попытки. Здесь полное решение с обоснованием.

## Тест самопроверки — ответы

1. **б** — группа близких точек.
2. **б** — `k`.
3. **б** — `DBSCAN`.
4. **в** — Дэвиса-Болдина.
5. **б** — среднее нормированных метрик.

## Финальное задание (ДЗ) — решение

### Идея

Одна функция `cluster_file(path)`: читает точки `(Freq, Range)`, стандартизует,
перебирает пять алгоритмов с сетками гиперпараметров, считает пять метрик, сводит их в
нормированный балл, выбирает лучшего и возвращает метки.

### Код

```python
import numpy as np
import warnings
warnings.filterwarnings("ignore")

from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, MeanShift
from sklearn.mixture import GaussianMixture
from sklearn.metrics import (silhouette_score, calinski_harabasz_score,
                             davies_bouldin_score)


def load_freq_range(path):
    """Читает файл ионозонда: после строки с 'Freq' ... 'Range' идут данные."""
    rows, started = [], False
    with open(path, encoding="utf-8", errors="ignore") as f:
        for line in f:
            if not started:
                if "Freq" in line and "Range" in line:
                    started = True
                continue
            p = line.split()
            if len(p) >= 2:
                try:
                    rows.append((float(p[0]), float(p[1])))
                except ValueError:
                    pass
    return np.array(rows)


def _quality(Z, lab, bic, aic):
    mask = lab != -1
    Zm, lm = Z[mask], lab[mask]
    if len(set(lm)) < 2 or min(np.bincount(lm)) < 2:
        return None
    return dict(
        silhouette=silhouette_score(Zm, lm, sample_size=min(1000, len(Zm)), random_state=0),
        calinski=calinski_harabasz_score(Zm, lm),
        davies=davies_bouldin_score(Zm, lm),
        bic=bic,
        aic=aic,
    )


def _candidates(Z):
    out = []
    for k in range(2, 9):
        out.append((f"kmeans k={k}",
                    lambda Z, k=k: (KMeans(k, n_init=5, random_state=0).fit_predict(Z), np.nan, np.nan)))
    for k in range(2, 9):
        out.append((f"agglo k={k}",
                    lambda Z, k=k: (AgglomerativeClustering(n_clusters=k).fit_predict(Z), np.nan, np.nan)))
    for k in range(2, 9):
        def gmm(Z, k=k):
            g = GaussianMixture(k, random_state=0).fit(Z)
            return g.predict(Z), g.bic(Z), g.aic(Z)
        out.append((f"gmm k={k}", gmm))
    dd = np.linalg.norm(Z[:300, None, :] - Z[None, :300, :], axis=-1)
    for eps in np.unique(np.percentile(dd, [20, 35, 50, 65, 80])):
        out.append((f"dbscan eps={eps:.2f}",
                    lambda Z, e=eps: (DBSCAN(eps=e, min_samples=5).fit_predict(Z), np.nan, np.nan)))
    out.append(("meanshift", lambda Z: (MeanShift().fit_predict(Z), np.nan, np.nan)))
    return out


KEYS = ["silhouette", "calinski", "davies", "bic", "aic"]
HIGHER = [True, True, False, False, False]


def cluster_file(path, max_points=3000):
    X = load_freq_range(path)
    Z = StandardScaler().fit_transform(X)
    idx = (np.random.default_rng(0).choice(len(Z), max_points, replace=False)
           if len(Z) > max_points else np.arange(len(Z)))
    Zs = Z[idx]

    rows = []
    for name, builder in _candidates(Zs):
        try:
            lab, bic, aic = builder(Zs)
        except Exception:
            continue
        q = _quality(Zs, lab, bic, aic)
        if q is not None:
            rows.append((name, q))

    scores = np.zeros(len(rows)); cnt = np.zeros(len(rows))
    for key, higher in zip(KEYS, HIGHER):
        vals = np.array([r[1][key] if np.isfinite(r[1][key]) else np.nan for r in rows])
        good = np.isfinite(vals)
        if good.sum() < 2:
            continue
        order = np.argsort(vals[good]); rk = np.empty(good.sum())
        rk[order] = np.arange(good.sum()); rk /= (good.sum() - 1)
        if not higher:
            rk = 1 - rk
        scores[good] += rk; cnt[good] += 1
    scores /= np.maximum(cnt, 1)

    best_name = rows[int(np.argmax(scores))][0]
    for name, builder in _candidates(Z):
        if name == best_name:
            return X, builder(Z)[0], best_name
    return X, KMeans(2, n_init=5, random_state=0).fit_predict(Z), "kmeans k=2"

  
# --- пример запуска ---
if __name__ == "__main__":
    import matplotlib.pyplot as plt
    path = "clustering2test/2test/20240628-Tromso"
    X, labels, best = cluster_file(path)
    print("лучший метод:", best, "| кластеров:", len(set(labels)) - (1 if -1 in labels else 0))
    plt.scatter(X[:, 0], X[:, 1], c=labels, s=8)
    plt.xlabel("Freq"); plt.ylabel("Range"); plt.title(best)
    plt.show()
```

### Что получается

Пример на файле `20240628-Tromso` (около `7700` точек): победитель — компактный
метод (`KMeans`/`Agglomerative`), число кластеров `4–6`. На файлах с изогнутыми
структурами выигрывает `DBSCAN` или `MeanShift`. Выбор меняется от файла к файлу —
именно этого требует задание.

### Как это работает

- `load_freq_range` — достаёт только `Freq` и `Range`.
- `StandardScaler` — уравнивает координаты.
- `_candidates` — `5` алгоритмов и сетки параметров (`k = 2…8`, несколько `eps`).
- `_quality` — `5` метрик; для `GMM` считается `bic`, для остальных он «не применим».
- Нормировка по рангу + средний балл → победитель.
- Победителя обучаем на **всех** точках файла.

### Обсуждение (для ответа)

- **Почему так.** Правильных меток нет, поэтому сравниваем «изнутри» пятью метриками —
  они страхуют друг друга от перекоса.
- **Почему авто.** Число кластеров и плотность у файлов разные, фиксировать `k` или
  `eps` нельзя.
- **Иллюстрация.** `plt.scatter(X[:,0], X[:,1], c=labels)` — точки `(Freq, Range)`,
  раскрашенные по кластерам.
- **Ограничения.** Метрики не истина в последней инстанции; на части файлов выводы
  разных метрик расходятся, это обсуждается, а не прячется.

!!! warning "Частая ошибка"
    Оставить `eps` фиксированным для всех файлов — тогда на больших файлах `DBSCAN`
    развалится или зависнет, а на маленьких не найдёт кластеры.

!!! warning "Частая ошибка"
    Складывать метрики без нормировки: Калински (сотни) забьёт силуэт (`0…1`).

## Что прислать

- `.ipynb`/`.py` с функцией `cluster_file`.
- Для 2–3 файлов: название победившего метода, число кластеров, график.
- Короткое обсуждение: как выбирали, почему, ограничения.
