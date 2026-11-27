# Ответы и разборы

Открывай после своей попытки. Здесь тест самопроверки и полные решения домашки.

## Тест самопроверки — ответы

1. `4` — четыре куска.
2. `userProfileCard`.
3. `let b = a` — это второе имя, не копия.
4. `-1`.
5. Удаляет первые два элемента.
6. `v`.
7. `(d + 6) % 7 + 1`.
8. Неверно: `reverse()` портит `arr`, а `slice().reverse()` — нет.
9. `join`.
10. Копию объекта.

## Как запускать

Вариант проще всего — открыть консоль браузера (F12 → Console) и вставлять код.
Либо положить всё в один `.html` внутри `<script>` и открыть файл. Ниже — код,
вставляй и проверяй.

## 2.1. kebab-case → camelCase

```js
function kebabToCamel(s) {
  let words = s.split('-');
  for (let i = 1; i < words.length; i++) {
    words[i] = words[i].at(0).toUpperCase() + words[i].slice(1);
  }
  return words.join('');
}

console.log(kebabToCamel('background-color')); // backgroundColor
```

Разбор: режем по дефису, у всех слов кроме первого поднимаем первую букву через
`at(0).toUpperCase()`, хвост берём `slice(1)`, сшиваем `join('')`.

## 2.2. Две копии, два разворота

```js
let arr = [9, 8, 7, 6, 5, 4, 3, 2, 1];

let copy1 = [...arr];
copy1.reverse();

let copy2 = arr.slice();
let reversed = [];
for (let i = copy2.length - 1; i >= 0; i--) reversed.push(copy2[i]);
copy2 = reversed;

console.log(arr);
console.log(copy1);
console.log(copy2);
```

Разбор: `[...arr]` и `arr.slice()` — две разные копии. Первую перевернул встроенным
`reverse()`, вторую — циклом с конца и `push`. `arr` не тронут.

## 2.3. Перевод по словарю

```js
let en = { привет: 'hello', мир: 'world', книга: 'book', спасибо: 'thanks' };
let de = { привет: 'hallo', мир: 'welt', книга: 'buch', спасибо: 'danke' };

function translate(text, lang) {
  let dict = lang === 'de' ? de : en;
  let words = text.split(' ');
  let out = [];
  for (let i = 0; i < words.length; i++) {
    let w = words[i];
    out.push(dict[w] !== undefined ? dict[w] : w);
  }
  return out.join(' ');
}

console.log(translate('привет мир', 'en')); // hello world
console.log(translate('привет мир', 'de')); // hallo welt
```

Разбор: словарь — это объект. `dict[w]` даёт перевод или `undefined`. Если перевода
нет — оставляем слово как есть.

## 2.4. Дни недели и текущий день

```js
let days = {
  1: 'Понедельник', 2: 'Вторник', 3: 'Среда', 4: 'Четверг',
  5: 'Пятница', 6: 'Суббота', 7: 'Воскресенье',
  today: function () {
    let d = new Date().getDay();      // 0=воскресенье ... 6=суббота
    let n = (d + 6) % 7 + 1;          // понедельник=1 ... воскресенье=7
    return this[n];
  }
};

console.log(days.today());
```

Разбор: `getDay()` считает с воскресенья (0). Формула переносит начало на
понедельник. `this[n]` берёт название из этого же объекта.

## 2.5. Объект «персонал» и копия

```js
let personal = { директор: 'Иван', менеджер: 'Пётр', инженер: 'Сергей' };
let personal2 = { ...personal };

personal2.директор = 'Ольга';
personal2.менеджер = 'Анна';
personal2.инженер = 'Максим';

console.log('Персонал:\n' + JSON.stringify(personal, null, 2));
console.log('Персонал 2:\n' + JSON.stringify(personal2, null, 2));
```

Разбор: `{ ...personal }` — копия, поэтому правки не задевают оригинал. Каждый
объект превращаем в строку через `JSON.stringify`, отступ `2` расставляет переносы,
плюс `'\n'` перед выводом.

## 2.6. «Предметы» с добавлением и удалением

```js
let predmety = {
  list: 'Математика, Физика, Информатика',
  add: function (subject) {
    let arr = this.list.split(', ');
    if (arr.indexOf(subject) === -1) {
      arr.push(subject);
      this.list = arr.join(', ');
    }
  },
  remove: function (subject) {
    let arr = this.list.split(', ');
    let i = arr.indexOf(subject);
    if (i !== -1) {
      arr.splice(i, 1);
      this.list = arr.join(', ');
    }
  }
};

predmety.add('Химия');
console.log(predmety.list); // Математика, Физика, Информатика, Химия

predmety.remove('Физика');
console.log(predmety.list); // Математика, Информатика, Химия
```

Разбор: список строкой режем `split(', ')` на массив. Добавляем через `push`, если
`indexOf === -1`. Удаляем `splice(i, 1)` по позиции `i` из `indexOf`. Обратно —
`join(', ')`.

!!! tip "Проверка своей работы"
    Для 2.3 возьми слово, которого нет в словаре, — оно должно остаться без
    изменений. Для 2.6 вызови `add` дважды с одним предметом: второй раз список не
    должен измениться.
