# 3. Читаем файл с шапкой

Цель (5–7 мин): собрать первую деталь — команду чтения файла.

В файлах ионозонда сверху «шапка» (дата, станция, названия столбцов), а данные — ниже.
Нам нужны только столбцы `Freq` и `Range`.

## Фраза → команды

| Фраза | Команда |
| --- | --- |
| открыть файл | `open(path)` |
| пройти по строкам | `for line in f:` |
| найти конец шапки | `if "Freq" in line and "Range" in line:` |
| разбить строку | `line.split()` |
| взять числа | `float(p[0])`, `float(p[1])` |
| сложить | `X.append([...])` |

```quiz
{
  "title": "Урок 3 · Чтение",
  "questions": [
    {"type":"find","q":"Где ошибка? Нужно собрать пары чисел [freq, range].","lines":["X = []","for line in open(path):","    X.append(line.split())"],"answer":2,"explain":"line.split() даёт куски-строки и всю строку. Нужно взять два числа: float(p[0]), float(p[1])."},
    {"type":"order","q":"Расставь шаги чтения:","items":["взять float(p[0]), float(p[1])","открыть файл","пропустить шапку","разбить строку через line.split()"],"answer":["открыть файл","пропустить шапку","разбить строку через line.split()","взять float(p[0]), float(p[1])"],"explain":"Открыть → пропустить шапку → split → float."},
    {"type":"fill","q":"Куда добавить найденную пару в список X?","options":["X.append([f, r])","print(X)","return X","len(X)"],"answer":0,"explain":"append добавляет один элемент в конец списка."},
    {"type":"truefalse","q":"float(p[0]) превращает текст в число.","answer":true,"explain":"Да. Без float координаты останутся строками и модели не заработают."}
  ]
}
```

## Песочница: допиши чтение

```pyplay
# вот маленький кусок файла
text = """2024.06.28 (180) 00:02:13
Station name: Tromso
  Freq  Range Pol MPA
 0.875  367.5  90  30
 1.075  500.0  90  33"""

X = []
start = False
for line in text.splitlines():
    if "Freq" in line and "Range" in line:
        ___          # после шапки начинаются данные
        continue
    if start:
        p = line.split()
        if len(p) >= 2:
            X.append([float(p[0]), float(p[1])])
print(X)   # ожидаем две пары
```

??? success "Проверить"
    `start = True`. Теперь всё, что ниже заголовка, добавляется в `X`.

## Готовый кусок (не запускай в песочнице — файла нет)

```python
def load_freq_range(path):
    X, start = [], False
    for line in open(path, encoding="utf-8", errors="ignore"):
        if "Freq" in line and "Range" in line:
            start = True
            continue
        if start:
            p = line.split()
            if len(p) >= 2:
                X.append([float(p[0]), float(p[1])])
    return X
```

## Что дальше

Приведём данные к одному масштабу и посчитаем первую метрику.
