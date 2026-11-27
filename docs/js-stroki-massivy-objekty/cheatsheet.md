# Словарь команд

Держи под рукой. Не помнишь метод — не «не умею», а «сейчас найду».

## Строки

| Фраза | Команда | Пример |
| --- | --- | --- |
| разрезать по разделителю | `s.split(x)` | `'a-b'.split('-')` → `['a','b']` |
| склеить массив | `a.join(x)` | `['a','b'].join('')` → `'ab'` |
| взять символ | `s.at(i)` | `'cat'.at(0)` → `'c'` |
| взять кусок | `s.slice(i)` | `'ab'.slice(1)` → `'b'` |
| поднять регистр | `s.toUpperCase()` | `'ab'` → `'AB'` |
| опустить регистр | `s.toLowerCase()` | `'AB'` → `'ab'` |
| длина строки | `s.length` | `'abc'.length` → `3` |

## Массивы

| Фраза | Команда | Пример |
| --- | --- | --- |
| копия (spread) | `[...a]` | новый массив |
| копия (срез) | `a.slice()` | новый массив |
| развернуть на месте | `a.reverse()` | меняет `a` |
| добавить в конец | `a.push(x)` | новая длина |
| удалить по позиции | `a.splice(i, 1)` | удаляет 1 элемент |
| где стоит элемент | `a.indexOf(x)` | номер или `-1` |
| длина | `a.length` | число элементов |
| последний | `a[a.length - 1]` | элемент |

## Объекты

| Фраза | Команда |
| --- | --- |
| словарь | `{ ключ: значение }` |
| взять по имени | `obj[key]` или `obj.key` |
| заменить поле | `obj.key = v` |
| есть ли ключ | `obj[k] !== undefined` |
| список ключей | `Object.keys(obj)` |
| копия | `{ ...obj }` или `Object.assign({}, obj)` |
| объект → строка | `JSON.stringify(obj, null, 2)` |
| метод | `имя: function () { ... }` |
| свой объект внутри метода | `this` |

## Полезное

| Фраза | Команда |
| --- | --- |
| текущая дата | `new Date()` |
| номер дня (вс=0…сб=6) | `new Date().getDay()` |
| понедельник=1 | `(d + 6) % 7 + 1` |
| перенос строки | `'\n'` |
| вывод в консоль | `console.log(...)` |

## Каркасы задач

```js
// 2.1 camelCase
function kebabToCamel(s) {
  let words = s.split('-');
  for (let i = 1; i < words.length; i++)
    words[i] = words[i].at(0).toUpperCase() + words[i].slice(1);
  return words.join('');
}

// 2.2 копии и разворот
let c1 = [...arr]; c1.reverse();
let c2 = arr.slice();
let r = [];
for (let i = c2.length - 1; i >= 0; i--) r.push(c2[i]);

// 2.3 словарь
function translate(text, lang) {
  let dict = lang === 'de' ? de : en;
  let words = text.split(' '), out = [];
  for (let i = 0; i < words.length; i++)
    out.push(dict[words[i]] !== undefined ? dict[words[i]] : words[i]);
  return out.join(' ');
}

// 2.4 дни
today: function () {
  let d = new Date().getDay();
  return this[(d + 6) % 7 + 1];
}

// 2.5 копия объекта
let personal2 = { ...personal };
console.log(JSON.stringify(personal2, null, 2));

// 2.6 предметы
add: function (s) {
  let a = this.list.split(', ');
  if (a.indexOf(s) === -1) { a.push(s); this.list = a.join(', '); }
}
```

## Правила, которые спасают

- `.reverse()` и `splice()` меняют массив **на месте** — работай на копии.
- `let b = a` **не копирует** ни массив, ни объект: это второе имя.
- `split` и `join` — парные: сначала разобрал, потом собрал.
- `indexOf` вернул `-1` — значит элемента нет.
- `at` понимает отрицательные номера, `[i]` — нет.
- Объект в строку — только через `JSON.stringify`.

## Полное решение

Смотри [answers.md](answers.md) — только для сверки.
