# 4. LSA и кластеризация

Теперь LSA: сжимаем признаки и кластеризуем. Главное — выбрать `k` по данным и
проверить стабильность, а не подогнать под `target`.

!!! abstract "Артефакт урока"
    Журнал экспериментов: `k`, silhouette, размеры кластеров, ARI по seeds.

## Как думает senior

Он выбирает `k` по данным и проверяет стабильность. Высокий ARI на одном seed —
не доказательство, а совпадение.

## Твоя очередь

## Шаг 1 · LSA

```python
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import Normalizer
from sklearn.pipeline import make_pipeline

lsa = make_pipeline(
    TruncatedSVD(n_components=100, random_state=0),
    Normalizer(copy=False),
)
X_lsa = lsa.fit_transform(X)
print(X_lsa.shape)
print("explained:", lsa[0].explained_variance_ratio_.sum())
```

!!! question "Сделай"
    Сколько признаков было и стало? Какая объяснённая дисперсия?

??? success "Проверить"
    Было около `8–20` тысяч, стало `100`. Объяснённая дисперсия обычно
    `15–25 %`. Это нормально: TF-IDF шумный.

## Шаг 2 · Почему LSA помогает

- уменьшает размерность;
- убирает часть шума;
- делает KMeans устойчивее;
- ускоряет кластеризацию.

!!! warning "Ловушка"
    Считать, что LSA всегда улучшает ARI. Иногда улучшает silhouette, но
    ухудшает интерпретируемость. Сравнивай с baseline.

## Шаг 3 · Выбери k по данным

```python
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

rows = []
for k in [5, 10, 15, 20, 25, 30, 40]:
    sil = []
    sizes = []
    for seed in range(5):
        km = KMeans(n_clusters=k, random_state=seed, n_init=10).fit(X_lsa)
        sil.append(silhouette_score(X_lsa, km.labels_, sample_size=5000, random_state=seed))
        sizes.append(np.bincount(km.labels_).max() / len(km.labels_))
    rows.append({
        "k": k,
        "sil_mean": np.mean(sil),
        "sil_std": np.std(sil),
        "max_cluster_share": np.mean(sizes),
    })

import pandas as pd
print(pd.DataFrame(rows).to_string(index=False))
```

!!! question "Сделай"
    При каком `k` silhouette максимален? Насколько велик разброс?

??? success "Проверить"
    Silhouette обычно максимален при небольших `k`, разброс по seeds заметный.
    Если разница между `k` меньше разброса — выбор не обоснован.

## Шаг 4 · Проверь стабильность

```python
from sklearn.metrics import adjusted_rand_score

for k in [10, 20, 30]:
    labels = []
    for seed in range(5):
        km = KMeans(n_clusters=k, random_state=seed, n_init=10).fit(X_lsa)
        labels.append(km.labels_)
    pair_scores = [
        adjusted_rand_score(labels[i], labels[j])
        for i in range(len(labels)) for j in range(i + 1, len(labels))
    ]
    print(k, np.mean(pair_scores), np.std(pair_scores))
```

!!! question "Сделай"
    Насколько похожи разбиения при разных seeds?

??? success "Проверить"
    Если средний ARI между seeds низкий (`< 0.7`), кластеры нестабильны. Это
    важный результат, даже если внешний ARI высокий.

## Шаг 5 · Сравни с baseline

```python
# baseline: KMeans без LSA
for k in [10, 20, 30]:
    km = KMeans(n_clusters=k, random_state=0, n_init=10).fit(X)
    print("no LSA", k, adjusted_rand_score(data.target, km.labels_))
```

!!! question "Сделай"
    LSA улучшила ARI? А silhouette?

??? success "Проверить"
    Часто LSA улучшает и то, и другое, но не всегда. Запиши фактический
    результат, а не ожидаемый.

## Шаг 6 · Журнал

```md
# Experiment log

| id | изменение | k | silhouette | ARI (target) | stability (ARI между seeds) | вывод |
| --- | --- | --- | --- | --- | --- | --- |
| e00 | baseline no LSA | 20 | | | | |
| e01 | LSA 100 | 20 | | | | |
| e02 | LSA 100 | 10 | | | | |
```

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| LSA | SVD по TF-IDF + нормализация |
| silhouette | выбор `k` |
| stability | согласие разбиений по seeds |
| baseline | без LSA |

## Критерии приёмки

- [ ] LSA построена, дисперсия записана;
- [ ] `k` выбран по данным;
- [ ] проверена стабильность по seeds;
- [ ] сравнение с baseline;
- [ ] журнал заполнен.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** как изменится silhouette после LSA?
    2. **Объясни**, почему stability важнее одного ARI.
    3. **Напиши** критерий выбора `k`.

??? success "Проверить"
    1. Обычно вырастет, но не гарантированно.
    2. Один ARI можно получить случайно; stability показывает воспроизводимость.
    3. Например: «максимальный silhouette при разбросе по seeds меньше 0.02 и
       стабильности между seeds выше 0.8».

## Что дальше

Кластеры есть. Оцениваем их и разбираем ошибки.
