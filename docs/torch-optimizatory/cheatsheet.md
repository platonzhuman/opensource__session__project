# Шпаргалка

## Протокол

| Фраза | Что зафиксировать |
| --- | --- |
| критерий | что значит «лучше» |
| бюджет | число шагов |
| порог | `f < -0.99` |
| `lr` | один для всех |
| seeds | для проверки устойчивости |
| метрики | steps_to, final f, time |

## Запуск

```python
def run(opt_cls, lr=0.1, steps=1000, **kwargs):
    x = torch.tensor([10.0], requires_grad=True)
    y = torch.tensor([10.0], requires_grad=True)
    opt = opt_cls([x, y], lr=lr, **kwargs)
    losses = []
    for _ in range(steps):
        loss = torch.sin(x) * torch.cos(y)
        opt.zero_grad()
        loss.backward()
        opt.step()
        losses.append(loss.item())
    return x.item(), y.item(), loss.item(), losses
```

## Методы

| Метод | Вызов |
| --- | --- |
| SGD | `optim.SGD([x, y], lr=0.1)` |
| Momentum | `optim.SGD([x, y], lr=0.1, momentum=0.9)` |
| Nesterov | `optim.SGD([x, y], lr=0.1, momentum=0.9, nesterov=True)` |
| ASGD | `optim.ASGD([x, y], lr=0.1)` |
| Rprop | `optim.Rprop([x, y], lr=0.1)` |
| Adagrad | `optim.Adagrad([x, y], lr=0.1)` |
| Adadelta | `optim.Adadelta([x, y], lr=0.1)` |
| RMSprop | `optim.RMSprop([x, y], lr=0.1)` |
| Adam | `optim.Adam([x, y], lr=0.1)` |
| AdamW | `optim.AdamW([x, y], lr=0.1)` |
| Adamax | `optim.Adamax([x, y], lr=0.1)` |
| NAdam | `optim.NAdam([x, y], lr=0.1)` |
| RAdam | `optim.RAdam([x, y], lr=0.1)` |

## Метрики

| Фраза | Код |
| --- | --- |
| шаги до порога | `next(i for i, v in enumerate(losses) if v < -0.99)` |
| финальное значение | `loss.item()` |
| время | `time.perf_counter()` |
| список методов | `[n for n in dir(optim) if n[0].isupper()]` |

## Диагностика

| Фраза | Код |
| --- | --- |
| гессиан | вторые производные |
| тип точки | знаки собственных значений |
| траектория | `plt.plot(px, py)` |
| сходимость | `plt.plot(losses)` |
| ablation | менять одно за раз |

## Правила, которые спасают

- Сначала критерий, потом запуск.
- Один `lr` для всех.
- Baseline обязателен.
- Расходящийся метод — результат.
- Средняя без разброса — не аргумент.
- Рекомендация — с условиями.
- В memo — числа и ограничения.

## Чек-лист перед сдачей

- [ ] ADR;
- [ ] протокол;
- [ ] baseline;
- [ ] журнал;
- [ ] диагностика;
- [ ] ablation;
- [ ] memo;
- [ ] ревью;
- [ ] запуск с нуля.

## Полное решение

Смотри [answers.md](answers.md) — только для сверки.
