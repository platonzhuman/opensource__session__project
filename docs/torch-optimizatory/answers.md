# Ответы и разборы

## Ответы теста самопроверки

1. Простейший метод, с которым сравнивают все остальные.
2. Иначе неизвестно, что дало результат — метод или настройка.
3. Скорость достижения порога качества.
4. Он показывает границу применимости и режим отказа.
5. Отключение одного компонента для измерения вклада.
6. Минимумов много; важно значение функции и критерий.
7. Рекомендацию, доказательства, ограничения, условия пересмотра.
8. При смене класса задач, данных, бюджета или требований.
9. Зависит от ограничения; в отчёте лучше оба.
10. Почему это решение; откуда знаешь; что сломается первым.

## Полный код

```python
import time
import numpy as np
import pandas as pd
import torch
import torch.optim as optim
import matplotlib.pyplot as plt

torch.manual_seed(0)

def loss_fn(x, y):
    return torch.sin(x) * torch.cos(y)

def run(opt_cls, lr=0.1, steps=1000, **kwargs):
    x = torch.tensor([10.0], requires_grad=True)
    y = torch.tensor([10.0], requires_grad=True)
    opt = opt_cls([x, y], lr=lr, **kwargs)

    losses, path = [], [(x.item(), y.item())]
    for _ in range(steps):
        loss = loss_fn(x, y)
        opt.zero_grad()
        loss.backward()
        opt.step()
        losses.append(loss.item())
        path.append((x.item(), y.item()))
    return {"x": x.item(), "y": y.item(), "f": loss.item(), "losses": losses, "path": path}

def steps_to(losses, threshold=-0.99):
    for i, v in enumerate(losses):
        if v < threshold:
            return i + 1
    return None

methods = [
    ("SGD", optim.SGD, {}),
    ("Momentum", optim.SGD, {"momentum": 0.9}),
    ("Nesterov", optim.SGD, {"momentum": 0.9, "nesterov": True}),
    ("ASGD", optim.ASGD, {}),
    ("Rprop", optim.Rprop, {}),
    ("Adagrad", optim.Adagrad, {}),
    ("Adadelta", optim.Adadelta, {}),
    ("RMSprop", optim.RMSprop, {}),
    ("Adam", optim.Adam, {}),
    ("AdamW", optim.AdamW, {}),
    ("Adamax", optim.Adamax, {}),
    ("NAdam", optim.NAdam, {}),
    ("RAdam", optim.RAdam, {}),
]

rows = []
for name, cls, kw in methods:
    t0 = time.perf_counter()
    r = run(cls, **kw)
    elapsed = time.perf_counter() - t0
    rows.append({
        "method": name,
        "x": round(r["x"], 4),
        "y": round(r["y"], 4),
        "f": round(r["f"], 4),
        "steps": steps_to(r["losses"]),
        "time_s": round(elapsed, 4),
        "losses": r["losses"],
        "path": r["path"],
    })

print(pd.DataFrame(rows).drop(columns=["losses", "path"]).sort_values("f").to_string(index=False))
```

## Разбор результатов

| Метод | Что ожидать | Почему |
| --- | --- | --- |
| SGD | `-1`, ~39 шагов | базовый градиентный спуск |
| Momentum | `-1`, быстрее | инерция |
| Nesterov | `-1`, стабильнее | смотрит вперёд |
| ASGD | `-1` | усреднение почти не влияет |
| Rprop | `-1` | адаптация по знаку |
| Adagrad | `-1`, медленнее к концу | затухающий шаг |
| Adadelta | может не сойтись при `lr=0.1` | маленький эффективный шаг |
| RMSprop | `≈ -0.997` | быстро, но не точно |
| Adam | `-1`, ~25 шагов | момент + дисперсия |
| AdamW | `-1` | как Adam, регуляризация |
| Adamax | `-1` | `L∞`-норма |
| NAdam | `-1` | Nesterov в Adam |
| RAdam | `-1` | warmup |

Числа зависят от версии `torch` и машины. Главное — сравнение при одинаковых
условиях.

## Типичные ошибки

| Ошибка | Severity | Почему |
| --- | --- | --- |
| нет `zero_grad()` | blocker | градиенты накапливаются |
| разный `lr` | blocker | нечестное сравнение |
| нет baseline | major | не с чем сравнивать |
| нет устойчивости | major | результат может быть случайным |
| выкинуты расходящиеся методы | major | скрыта граница применимости |
| нет времени | minor | непонятна стоимость |
| нет seed | minor | невоспроизводимо |

## Как выглядит сильный вывод

> «При бюджете 1000 шагов и `lr = 0.1` Adam достигает `f < -0.99` за 25 шагов
> против 39 у SGD и устойчив при `lr ± 20 %`. RMSprop быстрее (4 шага), но
> останавливается на `-0.997` и не проходит критерий. Adadelta при этом `lr`
> не сходится. Рекомендация: Adam по умолчанию для гладких задач с малым числом
> параметров; для шумных градиентов протокол повторить».

## Что улучшить

- `LBFGS` с `closure`;
- подбор `lr` для каждого метода отдельным экспериментом;
- 3D-график;
- логирование в TensorBoard;
- проверка на Розенброке и Растригине.

## Что дальше

Проверь пакет по [рубрике](../standards/review-rubric.md).
