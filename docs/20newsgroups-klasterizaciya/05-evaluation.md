# 5. Оценка и ошибки

Метрики — это не конец. Senior смотрит, **какие темы смешались, почему и что это
значит для решения**. Здесь же — проверка на устойчивость и разбор ошибок.

!!! abstract "Артефакт урока"
    Error report: ARI/NMI/homogeneity/completeness, матрица, разбор смешений,
    проверка стабильности.

## Как думает senior

Метрика — это вопрос, на который она отвечает. ARI отвечает «похоже ли на
разметку», silhouette — «разделимы ли кластеры», stability — «повторится ли
результат». Senior не смешивает эти вопросы в один.

## Твоя очередь

## Шаг 1 · Посчитай полный набор метрик

```python
from sklearn.cluster import KMeans
from sklearn.metrics import (
    adjusted_rand_score, normalized_mutual_info_score,
    homogeneity_score, completeness_score, v_measure_score,
)

labels = KMeans(n_clusters=20, random_state=0, n_init=10).fit_predict(X_lsa)
print("ARI", adjusted_rand_score(data.target, labels))
print("NMI", normalized_mutual_info_score(data.target, labels))
print("homogeneity", homogeneity_score(data.target, labels))
print("completeness", completeness_score(data.target, labels))
print("v-measure", v_measure_score(data.target, labels))
```

!!! question "Сделай"
    Homogeneity и completeness сильно различаются? Что это значит?

??? success "Проверить"
    Если homogeneity высокая, а completeness низкая — кластеры чистые, но один
    класс размазан по нескольким кластерам. Наоборот — классы слиты.

## Шаг 2 · Матрица сопоставления

```python
import pandas as pd
from sklearn.metrics import confusion_matrix

cm = confusion_matrix(data.target, labels)
df = pd.DataFrame(cm, index=data.target_names)
df.columns = [f"c{i}" for i in range(20)]
print(df.shape)
print(df.sum(axis=1).sort_values(ascending=False).head())
```

!!! question "Сделай"
    Какие классы размазаны по многим кластерам? Какие кластеры «чистые»?

??? success "Проверить"
    Обычно `comp.*` и религия разделяются лучше, `talk.politics.*` и
    `soc.religion.*` смешиваются.

## Шаг 3 · Разбери смешения

```python
for name in ["talk.politics.guns", "soc.religion.christian"]:
    i = list(data.target_names).index(name)
    row = cm[i]
    top = row.argsort()[-3:][::-1]
    print(name, [(int(j), int(row[j])) for j in top])
```

!!! question "Сделай"
    В какие кластеры попали эти темы? Почему?

??? success "Проверить"
    Часто в кластеры, где много общих слов (например, обсуждение политики и
    религии). Это ограничение TF-IDF: он не понимает смысл.

## Шаг 4 · Проверь устойчивость

```python
import numpy as np
from sklearn.metrics import adjusted_rand_score

ari_by_seed = []
for seed in range(10):
    lab = KMeans(n_clusters=20, random_state=seed, n_init=10).fit_predict(X_lsa)
    ari_by_seed.append(adjusted_rand_score(data.target, lab))

print(np.mean(ari_by_seed), np.std(ari_by_seed))
```

!!! question "Сделай"
    ARI стабилен по seeds? Разброс большой?

??? success "Проверить"
    Если разброс `> 0.05–0.1`, вывод о качестве ненадёжен. Это важнее среднего
    значения.

## Шаг 5 · Проверь альтернативы

- `MiniBatchKMeans` — быстрее, но менее стабилен;
- `AgglomerativeClustering` — другой принцип;
- `DBSCAN` — в высокой размерности почти всё шум.

!!! question "Сделай"
    Какой альтернативный алгоритм стоит проверить и почему?

??? success "Проверить"
    Агломеративную — чтобы проверить, не артефакт ли KMeans. DBSCAN — чтобы
    показать ограничение плотностных методов.

## Шаг 6 · Error report

```md
# Error analysis

## Метрики
ARI, NMI, homogeneity, completeness, v-measure.

## Стабильность
ARI по seeds: mean ± std.

## Смешения
| класс | основные кластеры | причина |
| --- | --- | --- |

## Ограничения
TF-IDF не понимает смысл; KMeans предполагает сферические кластеры;
LSA теряет часть информации.

## Что это значит
Кластеры годятся / не годятся для навигации. Почему.
```

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| homogeneity | чистота кластеров |
| completeness | полнота классов |
| v-measure | гармоническое среднее |
| stability | разброс по seeds |
| смешение | несколько классов в кластере |

## Критерии приёмки

- [ ] посчитаны все метрики;
- [ ] построена матрица;
- [ ] разобраны смешения;
- [ ] проверена устойчивость;
- [ ] проверена альтернатива;
- [ ] есть вывод для решения.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что покажет homogeneity при `k = 20`?
    2. **Объясни**, почему высокий ARI при низкой stability — плохой результат.
    3. **Напиши** один смешанный класс и гипотезу причины.

??? success "Проверить"
    1. Обычно выше `0.3`, но не близко к `1`.
    2. Результат не воспроизводится: в следующий раз будет другой.
    3. Например, `talk.politics.misc` смешивается с `talk.politics.guns` из-за
       общей лексики.

## Что дальше

Осталось решение: годится ли это для заказчика. Memo и ревью.
