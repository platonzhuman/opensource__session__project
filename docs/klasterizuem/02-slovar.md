# 2. Словарь команд

Цель (5–7 мин): узнать команды, которых не хватало. Это «слова», из которых ты потом
соберёшь программу.

## Мини-словарь

| Фраза по-русски | Команда |
| --- | --- |
| открыть файл | `open(path)` |
| пройти по строкам | `for line in f:` |
| разбить строку на куски | `line.split()` |
| превратить текст в число | `float(text)` |
| добавить в список | `spisok.append(x)` |
| сделать массив | `np.array(spisok)` |
| привести к одному масштабу | `StandardScaler().fit_transform(X)` |
| обучить алгоритм и получить метки | `model.fit_predict(X)` |
| метрики качества | `silhouette_score`, `calinski_harabasz_score`, `davies_bouldin_score` |
| номера по возрастанию | `np.argsort(v)` |
| номер максимума | `np.argmax(v)` |
| своя команда | `def имя(...): ... return` |

```quiz
{
  "title": "Урок 2 · Словарь",
  "questions": [
    {"type":"wordbank","q":"Собери строку, которая приводит X к одному масштабу:","bank":[".fit_transform(X)","Z","StandardScaler()","="],"answer":["Z","=","StandardScaler()",".fit_transform(X)"],"explain":"Z = StandardScaler().fit_transform(X) — создать масштабер и сразу применить."},
    {"type":"fill","q":"Получи метки кластеров: labels = ___ .fit_predict(X)","options":["KMeans(3)","np.argsort","open","print"],"answer":0,"explain":"Создаём модель (например KMeans) и зовём .fit_predict(X)."},
    {"type":"multi","q":"Отметь метрики качества кластеризации:","options":["silhouette_score","davies_bouldin_score","calinski_harabasz_score","train_test_split"],"answer":[0,1,2],"explain":"Три первые — метрики. train_test_split — деление данных, не метрика."},
    {"type":"choice","q":"Что делает np.argmax(v)?","options":["номер самого большого элемента","сумму","максимум","сортировку"],"answer":0,"explain":"argmax возвращает ИНДЕКС максимума, а не само число."},
    {"type":"truefalse","q":"Команду нужно вспомнить самому, без словаря.","answer":false,"explain":"Нет: команды смотрят в словаре/справке. Это нормально."}
  ]
}
```

## Песочница: собери строку

```pyplay
import numpy as np
from sklearn.preprocessing import StandardScaler

X = np.array([[1.0, 100.0], [2.0, 200.0], [3.0, 300.0]])
Z = ___   # приведи X к одному масштабу (StandardScaler)
print(np.round(Z, 2))
```

??? success "Проверить"
    `Z = StandardScaler().fit_transform(X)`. Теперь у обоих столбцов среднее `0`, а
    разброс `1`.

## Что дальше

Первая настоящая часть домашки — прочитать файл.
