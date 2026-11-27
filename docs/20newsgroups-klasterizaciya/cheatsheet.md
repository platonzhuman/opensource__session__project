# Шпаргалка

## Протокол

| Фраза | Что зафиксировать |
| --- | --- |
| решение | зачем кластеризация |
| внутренняя метрика | silhouette |
| внешняя метрика | ARI/NMI, только отчёт |
| baseline | случайное разбиение / без LSA |
| seeds | 0…4 |
| stop rule | когда выбор `k` не обоснован |

## Данные

| Фраза | Код |
| --- | --- |
| загрузить | `fetch_20newsgroups(subset="all", remove=("headers","footers","quotes"))` |
| тексты | `data.data` |
| метки | `data.target` |
| классы | `data.target_names` |
| размер | `len(data.data)` |
| баланс | `np.bincount(data.target)` |
| дубли | `len(set(hashlib.md5(t.encode()).hexdigest() for t in data.data))` |

## TF-IDF

| Фраза | Код |
| --- | --- |
| векторизатор | `TfidfVectorizer(stop_words="english", min_df=5, max_df=0.5)` |
| матрица | `X = vec.fit_transform(texts)` |
| плотность | `X.nnz / (X.shape[0] * X.shape[1])` |
| словарь | `vec.get_feature_names_out()` |

## LSA

| Фраза | Код |
| --- | --- |
| пайплайн | `make_pipeline(TruncatedSVD(100, random_state=0), Normalizer(copy=False))` |
| преобразовать | `X_lsa = lsa.fit_transform(X)` |
| дисперсия | `lsa[0].explained_variance_ratio_.sum()` |

## Кластеризация

| Фраза | Код |
| --- | --- |
| KMeans | `KMeans(n_clusters=k, random_state=seed, n_init=10)` |
| метки | `km.fit_predict(X_lsa)` |
| размеры | `np.bincount(km.labels_)` |
| silhouette | `silhouette_score(X_lsa, labels, sample_size=5000)` |
| агломеративная | `AgglomerativeClustering(n_clusters=k)` |

## Метрики

| Фраза | Код |
| --- | --- |
| ARI | `adjusted_rand_score(data.target, labels)` |
| NMI | `normalized_mutual_info_score(data.target, labels)` |
| homogeneity | `homogeneity_score(data.target, labels)` |
| completeness | `completeness_score(data.target, labels)` |
| матрица | `confusion_matrix(data.target, labels)` |
| stability | `adjusted_rand_score(labels_i, labels_j)` |

## Правила, которые спасают

- `target` — только для отчёта.
- `k` — по silhouette и stability.
- Baseline — обязателен.
- Один seed — не результат.
- Вырожденные кластеры проверяй.
- Смешения объясняй, а не прячь.
- В memo — числа, ограничения, условия.

## Чек-лист перед сдачей

- [ ] ADR;
- [ ] протокол;
- [ ] data audit;
- [ ] baseline;
- [ ] LSA + KMeans;
- [ ] stability;
- [ ] error report;
- [ ] memo;
- [ ] ревью;
- [ ] запуск с нуля.

## Полное решение

Смотри [answers.md](answers.md) — только для сверки.
