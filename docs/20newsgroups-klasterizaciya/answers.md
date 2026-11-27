# Ответы и разборы

## Ответы теста самопроверки

1. Чтобы понять, лучше ли модель случайного разбиения и «наивного» подхода.
2. Согласие разбиений при разных seeds/параметрах.
3. Это утечка: `target` используется при выборе.
4. Чистоту кластеров: сколько в кластере одного класса.
5. Полноту: попали ли документы класса в один кластер.
6. Silhouette не использует метки, ARI использует.
7. Кластер, содержащий почти все документы, или множество одиночек.
8. Сжатие теряет часть смысла; верхние слова могут стать менее понятными.
9. Решение, доказательства, ограничения, условия пересмотра.
10. Когда stability низкая, кластеры неинтерпретируемы или решение требует
    точности, которой нет.

## Полный код

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import Normalizer
from sklearn.pipeline import make_pipeline
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.metrics import (
    silhouette_score, adjusted_rand_score, normalized_mutual_info_score,
    homogeneity_score, completeness_score, v_measure_score, confusion_matrix,
)

data = fetch_20newsgroups(
    subset="all", remove=("headers", "footers", "quotes"), random_state=42
)

vec = TfidfVectorizer(stop_words="english", min_df=5, max_df=0.5)
X = vec.fit_transform(data.data)

lsa = make_pipeline(TruncatedSVD(n_components=100, random_state=0), Normalizer(copy=False))
X_lsa = lsa.fit_transform(X)

rows = []
for k in [5, 10, 15, 20, 25, 30, 40]:
    sil, ari = [], []
    for seed in range(5):
        km = KMeans(n_clusters=k, random_state=seed, n_init=10).fit(X_lsa)
        sil.append(silhouette_score(X_lsa, km.labels_, sample_size=5000, random_state=seed))
        ari.append(adjusted_rand_score(data.target, km.labels_))
    rows.append({"k": k, "sil": np.mean(sil), "sil_std": np.std(sil), "ari": np.mean(ari)})

print(pd.DataFrame(rows).to_string(index=False))

labels = KMeans(n_clusters=20, random_state=0, n_init=10).fit_predict(X_lsa)
print("ARI", adjusted_rand_score(data.target, labels))
print("NMI", normalized_mutual_info_score(data.target, labels))
print("homogeneity", homogeneity_score(data.target, labels))
print("completeness", completeness_score(data.target, labels))
print("v-measure", v_measure_score(data.target, labels))

cm = confusion_matrix(data.target, labels)
print(pd.DataFrame(cm, index=data.target_names).shape)
```

## Разбор

- **Baseline без LSA** нужен, чтобы утверждать, что улучшение дала LSA.
- **`k` по silhouette и stability**, не по ARI.
- **Stability** — главный аргумент: если разбиения при разных seeds не
  совпадают, кластеры нельзя использовать.
- **Homogeneity/completeness** объясняют, что именно не так: чистота или
  полнота.
- **Матрица** показывает, какие темы смешались.
- **Ограничения** — часть результата, а не приписка.

## Типичные ошибки

| Ошибка | Severity | Почему |
| --- | --- | --- |
| `k` по ARI | blocker | утечка |
| нет baseline | major | не с чем сравнивать |
| один seed | major | результат может быть случайным |
| нет stability | major | невоспроизводимо |
| нет error analysis | major | непонятно, что смешалось |
| вырожденные кластеры не проверены | major | метрика врёт |
| нет ограничений | minor | вывод перенесут не туда |

## Как выглядит сильный вывод

> «TF-IDF + LSA + KMeans (`k=20`) даёт ARI `0.31 ± 0.04` против `0.18` у
> baseline без LSA. Stability между seeds `0.72`: кластеры воспроизводимы
> частично. Homogeneity `0.42`, completeness `0.38` — кластеры чистые, но
> классы размазаны. Политика и религия смешиваются из-за общей лексики.
> Решение: для навигации — ограниченно годится; для модерации — нет.
> Iterate: эмбеддинги + HDBSCAN».

## Что улучшить

- эмбеддинги (`sentence-transformers`);
- `HDBSCAN` вместо KMeans;
- `NMF`/`LDA` для тем;
- `UMAP` для визуализации;
- проверка на современных данных.

## Что дальше

Проверь пакет по [рубрике](../standards/review-rubric.md).
