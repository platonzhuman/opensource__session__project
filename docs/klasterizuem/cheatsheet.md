# Словарь команд

Держи под рукой. Не помнишь команду — не «не умею», а «сейчас найду».

## Чтение и данные

| Фраза | Команда |
| --- | --- |
| открыть файл | `open(path, encoding="utf-8", errors="ignore")` |
| пройти по строкам | `for line in f:` |
| разбить строку на куски | `p = line.split()` |
| текст → число | `float(p[0])` |
| добавить в список | `X.append([f, r])` |
| список → массив | `np.array(X)` |
| размер массива | `X.shape` |

## Масштаб и модели

| Фраза | Команда |
| --- | --- |
| к одному масштабу | `Z = StandardScaler().fit_transform(X)` |
| KMeans | `KMeans(k, n_init=5, random_state=0)` |
| DBSCAN | `DBSCAN(eps=0.5, min_samples=5)` |
| смесь гауссовых | `GaussianMixture(k, random_state=0)` |
| иерархический | `AgglomerativeClustering(k)` |
| сгущения | `MeanShift()` |
| обучить и получить метки | `model.fit_predict(Z)` |
| у GMM ещё BIC | `GaussianMixture(k).fit(Z).bic(Z)` |

## Метрики

| Метрика | Куда лучше |
| --- | --- |
| `silhouette_score(Z, lab)` | больше |
| `calinski_harabasz_score(Z, lab)` | больше |
| `davies_bouldin_score(Z, lab)` | меньше |
| BIC (у GMM) | меньше |
| AIC (у GMM) | меньше |

## Выбор и функции

| Фраза | Команда |
| --- | --- |
| индексы по возрастанию | `np.argsort(v)` |
| индекс максимума | `np.argmax(v)` |
| нормализовать к 0..1 | `v / v.max()` |
| своя функция | `def имя(...): ... return` |

## Каркас функции

```python
def load_freq_range(path):      # читает Freq, Range
def all_candidates():           # 5 алгоритмов x сетки
def pick_best(X):               # считает метрики и возвращает имя победителя
def cluster_file(path):         # ГЛАВНАЯ: файл -> метки
```

## Правила, которые спасают

- Пиши по **2–3 строки** и запускай.
- Метки — это `.fit_predict(Z)`, а не `.fit` или `.score`.
- Метрики в разных масштабах → сначала нормировка, потом сложение.
- `argmax` — индекс, `max` — значение.
- Ищем победителя на подвыборке (3000 точек), обучаем на всех.
- Вернуть надо **метки для каждой точки**, а не имя алгоритма.

## Полное решение

Смотри [answers.md](answers.md) — только для сверки.
