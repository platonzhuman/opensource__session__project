# 3. Baseline

Baseline — это не «плохая модель для галочки». Это утверждение, которое ты
обязан побить. Если не побил — честно фиксируешь это.

!!! abstract "Артефакт урока"
    Baseline report: три baseline, метрики на walk-forward окнах, вывод о том,
    какой из них считать основным.

## Как думает senior

Baseline — не формальность, а гипотеза «здесь вообще есть сигнал». Пока она не
опровергнута, любая модель — украшение.

## Твоя очередь

## Шаг 1 · Собери доходность

```python
df["ret"] = np.log(df["SP500"]).diff()
data = df.dropna(subset=["ret"]).reset_index(drop=True)
print(data["ret"].describe())
```

!!! question "Сделай"
    Чему равно среднее и стандартное отклонение? Похоже ли на белый шум?

??? success "Проверить"
    Среднее около `0.004`, std около `0.04`. Автокорреляция слабая — ряд близок
    к белому шуму. Это ожидание, которое baseline должен подтвердить численно.

## Шаг 2 · Три baseline

```python
def baseline_zero(y_true):
    return np.zeros(len(y_true))

def baseline_drift(y_train, n):
    return np.full(n, y_train.mean())

def baseline_mean12(y_train, n):
    return np.full(n, y_train[-12:].mean())
```

| Baseline | Идея | Когда силён |
| --- | --- | --- |
| zero | доходность = 0 | если ряд — белый шум |
| drift | средняя по train | если есть устойчивая премия |
| mean12 | средняя за 12 месяцев | если режим локально стабилен |

!!! question "Сделай"
    Какой baseline должен победить в финансовом ряду и почему?

??? success "Проверить"
    Часто zero (random walk). Если drift стабильно лучше — это уже интересный
    вывод о премии за риск. Если mean12 лучше — возможно, есть режимность.

## Шаг 3 · Walk-forward, а не один split

Один split на 150 лет смешивает разные режимы. Правильнее — идти окнами.

```python
def walk_forward(y, start=120, horizon=12, step=12):
    """Возвращает список (train_slice, val_slice) по времени."""
    windows = []
    i = start
    while i + horizon <= len(y):
        windows.append((slice(0, i), slice(i, i + horizon)))
        i += step
    return windows

windows = walk_forward(data["ret"].values)
print(len(windows))
```

!!! question "Сделай"
    Почему окно расширяется, а не скользит фиксированной длины?

??? success "Проверить"
    Расширяющееся окно использует всю доступную историю и лучше отражает
    реальную ситуацию «каждый месяц у нас есть всё прошлое». Скользящее окно
    полезно, если режим быстро меняется; это отдельный эксперимент.

## Шаг 4 · Посчитай baseline на всех окнах

```python
from sklearn.metrics import mean_absolute_error, mean_squared_error

rows = []
for tr, va in windows:
    y_tr = data["ret"].values[tr]
    y_va = data["ret"].values[va]
    preds = {
        "zero": baseline_zero(y_va),
        "drift": baseline_drift(y_tr, len(y_va)),
        "mean12": baseline_mean12(y_tr, len(y_va)),
    }
    for name, pred in preds.items():
        rows.append({
            "baseline": name,
            "mae": mean_absolute_error(y_va, pred),
            "rmse": mean_squared_error(y_va, pred) ** 0.5,
        })

import pandas as pd
summary = pd.DataFrame(rows).groupby("baseline").agg(["mean", "std"])
print(summary)
```

!!! question "Сделай"
    Какой baseline лучший по среднему RMSE? Насколько велик разброс между
    окнами?

??? success "Проверить"
    Обычно `zero` и `drift` близки, разброс между окнами большой. Если разница
    между baseline меньше разброса по окнам — она незначима.

## Шаг 5 · Зафиксируй основной baseline

```text
Основной baseline: zero (random walk).
Причина: ряд близок к белому шуму; drift не даёт устойчивого преимущества.
Порог: модель должна улучшить RMSE не менее чем в 60 % окон,
       иначе преимущество считаем шумом.
```

!!! warning "Ловушка"
    Сравнивать средние метрики без разброса. Средняя RMSE может быть лучше на
    `0.0001`, а разброс по окнам — `0.02`. Это шум.

## Шаг 6 · Baseline report

```md
# Baseline report

## Данные
Лог-доходность, 1871–2026, walk-forward, окно 120, горизонт 12.

## Результаты
| baseline | MAE (mean) | RMSE (mean) | RMSE (std) |
| --- | --- | --- | --- |

## Вывод
Основной baseline — zero. Модель должна побить его устойчиво, а не в среднем.

## Что дальше
AR(p) на лагах, сравнение по тем же окнам.
```

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| random walk | прогноз нулевой доходности |
| drift | средняя доходность |
| walk-forward | расширяющееся окно по времени |
| устойчивость | преимущество в большинстве окон |

## Критерии приёмки

- [ ] три baseline посчитаны;
- [ ] используется walk-forward, а не один split;
- [ ] есть среднее и разброс по окнам;
- [ ] основной baseline выбран и обоснован;
- [ ] порог «достаточного» преимущества записан до модели.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** какой baseline окажется самым сильным?
    2. **Объясни**, почему средняя RMSE без разброса — плохой аргумент.
    3. **Напиши** порог, при котором ты признаешь модель лучше baseline.

??? success "Проверить"
    1. Скорее всего, zero.
    2. Улучшение может быть меньше шума между окнами.
    3. Например: «лучше в 60 % окон и средняя RMSE ниже на величину больше
       одного стандартного отклонения по окнам».

## Что дальше

Baseline есть. Теперь AR-модель, которая обязана его побить — или не побить.
