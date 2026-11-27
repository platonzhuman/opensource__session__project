# 3. TF-IDF baseline

Baseline здесь — TF-IDF + KMeans без снижения размерности. Он покажет, нужна ли
LSA вообще. Без baseline любое улучшение — самообман.

!!! abstract "Артефакт урока"
    Baseline report: параметры векторизатора, размер матрицы, метрики KMeans без
    LSA.

## Как думает senior

Baseline нужен, чтобы утверждать, что улучшение дала именно следующая идея, а не
случайность. Без него LSA нечего доказывать.

## Твоя очередь

## Шаг 1 · Настрой векторизатор

```python
from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer(
    stop_words="english",
    min_df=5,
    max_df=0.5,
    ngram_range=(1, 1),
)
X = vectorizer.fit_transform(data.data)
print(X.shape, X.nnz / (X.shape[0] * X.shape[1]))
```

!!! question "Сделай"
    Сколько признаков? Какая плотность матрицы?

??? success "Проверить"
    Около `8–20` тысяч признаков, плотность меньше `1 %`. Матрица разреженная.

## Шаг 2 · Почему такие параметры

| Параметр | Значение | Причина |
| --- | --- | --- |
| `min_df=5` | слово минимум в 5 документах | убрать опечатки и редкий шум |
| `max_df=0.5` | убрать слова в > 50 % документов | они не различают темы |
| `stop_words="english"` | убрать служебные слова | меньше шума |
| `ngram_range=(1, 1)` | отдельные слова | базовый вариант |

!!! question "Сделай"
    Почему `max_df=0.5`, а не `0.95`?

??? success "Проверить"
    Для тематической кластеризации слова, встречающиеся в половине документов,
    уже почти не различают темы. Более жёсткий порог уменьшает шум, но может
    убрать полезные общие термины.

## Шаг 3 · Baseline KMeans без LSA

```python
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, adjusted_rand_score, normalized_mutual_info_score

for k in [10, 20, 30]:
    km = KMeans(n_clusters=k, random_state=0, n_init=10).fit(X)
    sil = silhouette_score(X, km.labels_, sample_size=5000, random_state=0)
    ari = adjusted_rand_score(data.target, km.labels_)
    nmi = normalized_mutual_info_score(data.target, km.labels_)
    print(f"k={k:2d} silhouette={sil:.3f} ARI={ari:.3f} NMI={nmi:.3f}")
```

!!! question "Сделай"
    Как меняются silhouette и ARI с ростом `k`?

??? success "Проверить"
    Silhouette может падать, ARI — расти или колебаться. Важно: `k` выбирается
    по silhouette/стабильности, а ARI — только отчёт.

!!! warning "Ловушка"
    На разреженных TF-IDF KMeans может инициализироваться на изолированных
    точках и давать вырожденные кластеры (один гигантский, остальные по одному
    документу). Проверяй размеры кластеров.

```python
import numpy as np
print(np.bincount(km.labels_))
```

## Шаг 4 · Зафиксируй baseline

```md
# Baseline report: TF-IDF + KMeans

## Признаки
TF-IDF: min_df=5, max_df=0.5, stop_words=english, 1-gram.
Размер: ... признаков, плотность ...

## Результаты
| k | silhouette | ARI | NMI | размеры кластеров |
| --- | --- | --- | --- | --- |

## Вывод
Baseline работает / не работает. LSA нужна / не нужна.
```

!!! question "Сделай"
    Почему baseline без LSA важен, даже если ты уверен, что LSA лучше?

??? success "Проверить"
    Иначе нельзя утверждать, что улучшение дала именно LSA. Это ablation.

## Шаг 5 · Проверь интерпретируемость

```python
terms = vectorizer.get_feature_names_out()
for i in range(3):
    center = km.cluster_centers_[i]
    top = center.argsort()[-10:][::-1]
    print(i, [terms[j] for j in top])
```

!!! question "Сделай"
    Кластеры выглядят осмысленно или это случайные слова?

??? success "Проверить"
    Обычно верхние слова дают представление о теме. Если нет — возможно,
    кластер вырожденный или `k` слишком велик.

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| TF-IDF | признаки |
| baseline | KMeans без LSA |
| silhouette | внутренняя метрика |
| ARI/NMI | внешние метрики, только отчёт |
| вырожденный кластер | один гигантский или много одиночек |

## Критерии приёмки

- [ ] параметры векторизатора обоснованы;
- [ ] baseline посчитан для нескольких `k`;
- [ ] проверены размеры кластеров;
- [ ] проверена интерпретируемость;
- [ ] baseline report записан.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что будет с silhouette при росте `k`?
    2. **Объясни**, зачем проверять размеры кластеров.
    3. **Напиши** параметры векторизатора и обоснуй каждый.

??? success "Проверить"
    1. Обычно падает: кластеры мельче и менее разделимы.
    2. Вырожденные кластеры выглядят как «успех» по метрике, но бесполезны.
    3. См. шаг 2.

## Что дальше

Baseline есть. Добавляем LSA и выбираем `k` по данным.
