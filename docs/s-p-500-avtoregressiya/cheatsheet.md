# Шпаргалка

Не помнишь команду — не «не умею», а «сейчас найду». Но сначала подумай, какое
решение принимаешь.

## Протокол

| Фраза | Что записать |
| --- | --- |
| решение | какое действие изменится |
| успех | метрика + порог + устойчивость |
| провал | когда фиксируем stop |
| baseline | zero / drift / mean12 |
| splits | train / val / test по датам |
| stop rule | когда прекращаем улучшать |

## Данные

| Фраза | Код |
| --- | --- |
| загрузить | `pd.read_csv(URL, parse_dates=["Date"])` |
| порядок | `df.sort_values("Date").reset_index(drop=True)` |
| пропуски | `df.isna().sum()` |
| диапазоны | `df.describe()` |
| частота | `df["Date"].diff().dt.days.value_counts()` |
| лог-доходность | `np.log(df["SP500"]).diff()` |

## Baseline

| Baseline | Код |
| --- | --- |
| zero | `np.zeros(len(y))` |
| drift | `np.full(n, y_train.mean())` |
| mean12 | `np.full(n, y_train[-12:].mean())` |
| метрики | `mean_absolute_error`, `mean_squared_error ** 0.5` |

## Walk-forward

```python
def walk_forward(y, start=120, horizon=12, step=12):
    windows = []
    i = start
    while i + horizon <= len(y):
        windows.append((slice(0, i), slice(i, i + horizon)))
        i += step
    return windows
```

## Модель

| Фраза | Код |
| --- | --- |
| лаги | `series.shift(k)` |
| AR | `LinearRegression().fit(X, y)` |
| Ridge | `Ridge(alpha=1.0)` |
| прогноз | `model.predict(X)` |
| ablation | менять одно за раз |

## Оценка

| Фраза | Код |
| --- | --- |
| MAE | `mean_absolute_error` |
| RMSE | `mean_squared_error(...) ** 0.5` |
| directional | `(np.sign(pred) == np.sign(y)).mean()` |
| разброс | `scores.std()` |

## Ревью

| Severity | Когда |
| --- | --- |
| `blocker` | неверный результат, утечка, невоспроизводимо |
| `major` | нет baseline, error analysis, хрупкий код |
| `minor` | читаемость, структура |
| `nit` | вкусовое |

## Правила, которые спасают

- Протокол — до кода.
- Baseline — до модели.
- Test — один раз.
- Одно изменение за раз.
- Средняя без разброса — не аргумент.
- Неудачный эксперимент — результат.
- Stop — полноценное решение.
- В memo — числа, ограничения, условия пересмотра.

## Чек-лист перед сдачей

- [ ] бриф и протокол;
- [ ] data audit;
- [ ] baseline на walk-forward;
- [ ] журнал экспериментов;
- [ ] ablation;
- [ ] error analysis;
- [ ] memo;
- [ ] ревью по рубрике;
- [ ] запуск с нуля.

## Полное решение

Смотри [answers.md](answers.md) — только для сверки.
