# 3. Baseline и autograd

Baseline здесь — SGD без улучшений. Если метод не бьёт его, он не нужен. Плюс
проверяем, что autograd считает тот же градиент, что и формула.

!!! abstract "Артефакт урока"
    Baseline report: SGD при `lr = 0.1`, число шагов до порога, финальное
    значение, проверка градиента.

## Как думает senior

Он проверяет градиент до эксперимента и строит baseline до сравнений. Иначе
непонятно, что именно измеряется.

## Твоя очередь

## Шаг 1 · Проверь градиент

```python
import torch

def loss_fn(x, y):
    return torch.sin(x) * torch.cos(y)

x = torch.tensor([10.0], requires_grad=True)
y = torch.tensor([10.0], requires_grad=True)
loss_fn(x, y).backward()

manual_x = torch.cos(x) * torch.cos(y)
manual_y = -torch.sin(x) * torch.sin(y)

print("autograd:", x.grad.item(), y.grad.item())
print("manual:  ", manual_x.item(), manual_y.item())
```

!!! question "Сделай"
    Совпали ли значения? Что это доказывает?

??? success "Проверить"
    Совпали с точностью до машинной погрешности. Это доказывает, что формула
    градиента верна и autograd можно использовать в эксперименте.

!!! warning "Ловушка"
    Запускать оптимизаторы, не проверив градиент. Если формула неверна, весь
    эксперимент бессмыслен.

## Шаг 2 · Baseline SGD

```python
import torch.optim as optim

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

base = run(optim.SGD)
print(base["x"], base["y"], base["f"])
```

!!! question "Сделай"
    За сколько шагов SGD достигает `f < -0.99`?

??? success "Проверить"
    При `lr = 0.1` — примерно за `39` шагов. Запиши своё число в журнал.

## Шаг 3 · Посчитай метрики baseline

```python
def steps_to(losses, threshold=-0.99):
    for i, v in enumerate(losses):
        if v < threshold:
            return i + 1
    return None

print("steps:", steps_to(base["losses"]))
print("final f:", round(base["f"], 4))
```

!!! question "Сделай"
    Почему «финальное значение» без «шагов до порога» — неполная метрика?

??? success "Проверить"
    Метод может прийти в минимум, но очень медленно. Для выбора важны обе
    характеристики: качество и скорость.

## Шаг 4 · Проверь чувствительность к lr

```python
for lr in [0.01, 0.05, 0.1, 0.5, 1.0]:
    r = run(optim.SGD, lr=lr)
    print(lr, round(r["f"], 4), steps_to(r["losses"]))
```

!!! question "Сделай"
    При каком `lr` SGD расходится или прыгает?

??? success "Проверить"
    При `0.01` медленно, при `0.1` стабильно, при `1.0` возможны прыжки и
    расхождение. Это baseline-поведение, с которым будем сравнивать остальные.

## Шаг 5 · Baseline report

```md
# Baseline report: SGD

## Протокол
Старт (10, 10), 1000 шагов, lr = 0.1.

## Результат
- steps_to(-0.99): 39
- final f: -1.0000
- финальная точка: (7.854, 9.425)

## Чувствительность
| lr | final f | steps |
| --- | --- | --- |

## Вывод
SGD — рабочая точка отсчёта. Остальные методы должны быть лучше
по скорости или устойчивости, иначе их выбор не обоснован.
```

## Что здесь что

| Элемент | Что означает |
| --- | --- |
| autograd check | проверка градиента |
| baseline | SGD без улучшений |
| steps_to | скорость достижения порога |
| sensitivity | чувствительность к `lr` |

## Критерии приёмки

- [ ] градиент проверен вручную;
- [ ] baseline посчитан;
- [ ] есть `steps_to` и `final f`;
- [ ] проверена чувствительность к `lr`;
- [ ] baseline report записан.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что будет при `lr = 1.0`?
    2. **Объясни**, зачем проверять autograd вручную.
    3. **Напиши** функцию `steps_to`.

??? success "Проверить"
    1. Возможны колебания или расхождение.
    2. Чтобы отделить баг в формуле от поведения оптимизатора.
    3. См. шаг 3.

## Что дальше

Baseline есть. Запускаем все методы по единому протоколу.
