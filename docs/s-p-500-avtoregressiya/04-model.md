# 4. Модель и walk-forward

Теперь модель. Но главное — не `fit`, а **как ты доказываешь**, что она лучше.
Один запуск ничего не доказывает: нужен журнал экспериментов и проверка на
будущем.

!!! abstract "Артефакт урока"
    AR-модель, прогнанная по walk-forward окнам, и журнал экспериментов с
    ablation.

## Как думает senior

Он меняет одно за раз и записывает всё, включая провалы. Ему нужен не лучший
результат, а объяснимая причина, почему результат такой.

## Твоя очередь

## Шаг 1 · Признаки

```python
def make_lags(series, p):
    out = pd.DataFrame({"y": series})
    for k in range(1, p + 1):
        out[f"lag_{k}"] = series.shift(k)
    return out.dropna()

X = make_lags(data["ret"], p=3)
print(X.shape)
```

!!! warning "Ловушка"
    Считать лаги на всём ряде, а потом резать на train/test без учёта `NaN` —
    даты разъедутся. Всегда привязывай строки к датам.

## Шаг 2 · Один эксперимент — одно изменение

Журнал:

| id | гипотеза | изменение | split | MAE | RMSE | вывод |
| --- | --- | --- | --- | --- | --- | --- |
| e00 | baseline | zero | walk-forward | | | точка отсчёта |
| e01 | лаг 1 полезен | p=1 | walk-forward | | | |
| e02 | больше памяти | p=3 | walk-forward | | | |
| e03 | регуляризация | Ridge α=1 | walk-forward | | | |

```python
from sklearn.linear_model import LinearRegression, Ridge

def fit_ar(y, p, model_cls=LinearRegression, **kw):
    frame = make_lags(pd.Series(y), p).dropna()
    X = frame[[f"lag_{k}" for k in range(1, p + 1)]].values
    target = frame["y"].values
    model = model_cls(**kw).fit(X, target)
    return model
```

!!! question "Сделай"
    Почему нельзя менять `p` и `alpha` одновременно?

??? success "Проверить"
    Тогда непонятно, что дало улучшение. Одно изменение за раз — основа
    ablation.

## Шаг 3 · Walk-forward для модели

```python
def evaluate_model(y, p, model_cls=LinearRegression, **kw):
    scores = []
    for tr, va in windows:
        y_tr = y[tr]
        y_va = y[va]
        if len(y_tr) < p + 20:
            continue
        frame_tr = make_lags(pd.Series(y_tr), p).dropna()
        frame_va = make_lags(pd.Series(y_va), p).dropna()
        cols = [f"lag_{k}" for k in range(1, p + 1)]
        model = model_cls(**kw).fit(frame_tr[cols], frame_tr["y"])
        pred = model.predict(frame_va[cols])
        scores.append({
            "mae": mean_absolute_error(frame_va["y"], pred),
            "rmse": mean_squared_error(frame_va["y"], pred) ** 0.5,
        })
    return pd.DataFrame(scores)
```

!!! question "Сделай"
    Почему на валидационном окне лаги считаются внутри окна, а не берутся из
    общего ряда?

??? success "Проверить"
    Чтобы не протащить значения из будущего и не потерять первые строки окна.
    Лаги должны быть построены в тех же границах, что и прогноз.

## Шаг 4 · Сравни с baseline

```python
results = {}
for p in [1, 2, 3, 6, 12]:
    scores = evaluate_model(data["ret"].values, p)
    results[p] = scores
    print(f"p={p:2d}  RMSE={scores['rmse'].mean():.5f} ± {scores['rmse'].std():.5f}")
```

!!! question "Сделай"
    Какой `p` лучший? Разница с baseline больше разброса по окнам?

??? success "Проверить"
    Обычно разница микроскопическая. Если модель не бьёт baseline устойчиво —
    это результат, а не провал. Записывай его.

## Шаг 5 · Ablation

Проверь вклад каждого решения:

- убрать лаги → насколько хуже?
- добавить `Ridge` → лучше или хуже?
- убрать центрирование/масштаб → меняется ли что-то?

```python
ablation = {
    "zero": ...,
    "AR(1)": ...,
    "AR(3)": ...,
    "AR(3)+Ridge": ...,
}
```

!!! warning "Ловушка"
    «Добавил признаки, стало лучше на train». На train всегда лучше. Смотри
    только out-of-sample.

## Шаг 6 · Заполни журнал

```md
# Experiment log

| id | гипотеза | изменение | MAE | RMSE | std | вывод |
| --- | --- | --- | --- | --- | --- | --- |
| e00 | baseline | zero | | | | |
| e01 | память 1 | p=1 | | | | |
| e02 | память 3 | p=3 | | | | |
| e03 | регуляризация | Ridge α=1 | | | | |
```

Правила:

- каждая строка — один запуск;
- неудачные запуски тоже;
- вывод формулируется до следующего запуска;
- seed и версии — в шапке.

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| walk-forward | проверка на будущем |
| ablation | вклад одного изменения |
| experiment log | история решений |
| out-of-sample | данные, не виденные при обучении |

## Критерии приёмки

- [ ] модель обучена по walk-forward;
- [ ] сравнение с baseline на тех же окнах;
- [ ] есть среднее и разброс;
- [ ] ablation показывает вклад изменений;
- [ ] журнал заполнен, включая неудачные запуски.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что покажет ablation при удалении лагов?
    2. **Объясни**, зачем нужен разброс по окнам.
    3. **Напиши** одну строку журнала для своего эксперимента.

??? success "Проверить"
    1. Модель станет baseline (или почти), потому что признаков не останется.
    2. Средняя может быть лучше, но в половине окон — хуже; это не устойчивое
       преимущество.
    3. Например: `e02 | память 3 | p=3 | RMSE 0.0402 ± 0.003 | лучше baseline в 55 % окон | не доказано`.

## Что дальше

Модель посчитана. Теперь — error analysis: где именно и почему она ошибается.
