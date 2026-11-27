# Повторение 2.1–2.3

Новой теории нет. Только смешанные задания на строки, массивы и словарь. Прошёл —
идёшь дальше.

```quiz
{
  "title": "Повторение · Строки, массивы, словарь",
  "questions": [
    {"type":"input","q":"Что вернёт 'ab-cd'.split('-')[1]?","answer":["cd"],"explain":"split даёт массив ['ab','cd']; индекс 1 — 'cd'."},
    {"type":"input","q":"Что вернёт ['x', 'y'].join('-')?","answer":["x-y"],"explain":"join('-') сшивает куски, между ними дефис: 'x-y'."},
    {"type":"input","q":"camelCase для 'my-super-page'?","answer":["mySuperPage"],"explain":"['my','super','page'] → 'my' + 'Super' + 'Page'."},
    {"type":"truefalse","q":"let b = a копирует массив a.","answer":false,"explain":"Нет: b — второе имя той же коробки. Копия — это [...a] или a.slice()."},
    {"type":"input","q":"Что вернёт [1, 2, 3].reverse()[0]?","answer":["3"],"explain":"reverse переворачивает в [3,2,1]; первый элемент 3."},
    {"type":"input","q":"Что вернёт {да: 'yes'}['нет']?","answer":["undefined"],"explain":"Ключа 'нет' нет — undefined."},
    {"type":"choice","q":"Как проверить, есть ли слово w в словаре dict?","options":["dict[w] !== undefined","dict.length > 0","w.length > 0","dict[w] == true"],"answer":0,"explain":"Наличие ключа проверяют через сравнение значения с undefined."},
    {"type":"order","q":"Собери ручной разворот массива:","items":["res.push(a[i])","res = []","return res","for (i от конца к началу)"],"answer":["res = []","for (i от конца к началу)","res.push(a[i])","return res"],"explain":"Пустой массив → обход с конца → push → return."},
    {"type":"find","q":"Перевод слова из словаря не срабатывает. Где ошибка?","lines":["function tr(w, dict) {","  return dict.w;","}"],"answer":1,"explain":"dict.w — литеральный ключ 'w'. Нужен dict[w], чтобы взять значение по имени из переменной."}
  ]
}
```

## Мини-песочница

```jsplay
let dict = { кот: 'cat', пёс: 'dog' };
let a = [1, 2, 3];

console.log(dict['кот']);
console.log([...a].reverse().join(' '));
console.log(a.join(' '));
```

??? success "Проверить"
    Вывод: `cat`, затем `3 2 1`, затем `1 2 3`. Оригинал `a` цел — разворот шёл на
    копии `[...a]`.

## Что дальше

Переходим к объектам с собственными методами: дни недели и текущий день (2.4).
