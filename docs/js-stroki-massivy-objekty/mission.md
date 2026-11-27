---
title: "Собрать домашку №2 за один заход"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="js-homework" data-title="Собрать домашку №2 за один заход" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">JavaScript · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 5 минут</span>

## План на 45 минут

Собираем домашку №2: шесть маленьких программ за один заход. Не читаем весь
курс — пишем, проверяем, переносим.

1. **Строки.** `kebab-case` → `camelCase`.
2. **Массивы.** Копия и разворот без порчи оригинала.
3. **Словарь.** Перевод по ключу.
4. **Дни недели.** Объект, `this`, `new Date()`.
5. **Персонал и предметы.** Копия объекта и `split`/`join`.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 8 минут</span>

## kebab-case → camelCase

`font-size` → `fontSize`. Дефис в JavaScript — знак минус, поэтому в имени
свойства его не оставляют. Порядок: разрезать по дефису, поднять первую букву
каждого слова после первого, склеить без разделителя.

| Шаг | Код | Результат |
| --- | --- | --- |
| разрезать | `'font-size'.split('-')` | `['font', 'size']` |
| поднять | `'size'.at(0).toUpperCase() + 'size'.slice(1)` | `'Size'` |
| склеить | `['font', 'Size'].join('')` | `'fontSize'` |

### Почини

Заполни пропуски: разделитель, метод регистра и разделитель для `join`.

```jsplay
// @mode fix
// @expect fontSizeWeight
// @hint Режь по дефису, поднимай первую букву каждого слова после первого и склеивай без разделителя.
function toCamel(s) {
  let words = s.split('___');
  for (let i = 1; i < words.length; i++) {
    words[i] = words[i].at(0).___() + words[i].slice(1);
  }
  return words.join('___');
}

console.log(toCamel('font-size-weight'));
```

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 8 минут</span>

## Копия и разворот массива

`let b = a` не копирует массив: у `a` и `b` один адрес. `reverse()` переворачивает
массив на месте, поэтому оригинал портится, если не сделать копию.

| Задача | Код |
| --- | --- |
| копия | `[...arr]` или `arr.slice()` |
| разворот копии | `copy.reverse()` |
| ручной разворот | цикл с конца и `push` |

### Напиши сам

Напиши `reverseCopy(items)`: верни развёрнутую копию, не меняя `items`.
Напечатай копию и оригинал через ` | `.

```jsplay
// @mode write
// @expect 5 4 3 2 1 | 1 2 3 4 5
// @hint Сначала копия ([...items] или items.slice()), потом reverse. Оригинал не меняй.
let arr = [1, 2, 3, 4, 5];

function reverseCopy(items) {
  // Верни развёрнутую копию, не меняя items.
}

console.log(reverseCopy(arr).join(' ') + ' | ' + arr.join(' '));
```

</section>

<section class="mission-step" data-step="4" data-require-check markdown="1">

<span class="mission-label">Шаг 4 · 8 минут</span>

## Объект-словарь и дни недели

Ассоциативный массив в JavaScript — это объект: ключ → значение. Объект ищет
по ключу, а не по номеру: `days[1]` → `'Понедельник'`. Если ключа нет, вернётся
`undefined`.

| Код | Результат |
| --- | --- |
| `{ привет: 'hello' }['привет']` | `'hello'` |
| `{ привет: 'hello' }['стол']` | `undefined` |
| `Object.values(days)` | `['Понедельник', ...]` |
| `Object.keys(days)` | `['1', '2', ...]` |

`new Date().getDay()` даёт воскресенье = 0. Для понедельника = 1 формула:
`(d + 6) % 7 + 1`.

### Почини

Сейчас печатаются ключи. Исправь так, чтобы печатались названия дней.

```jsplay
// @mode fix
// @expect Понедельник Вторник Среда Четверг Пятница Суббота Воскресенье
// @hint Object.values(obj) даёт значения, Object.keys(obj) — ключи.
let days = {
  1: 'Понедельник', 2: 'Вторник', 3: 'Среда', 4: 'Четверг',
  5: 'Пятница', 6: 'Суббота', 7: 'Воскресенье'
};

console.log(Object.keys(days).join(' '));
```

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 11 минут</span>

## Персонал, предметы и сборка

### Объект персонала

`personal` хранит пары «должность — имя». `let p2 = personal` — второе имя, а не
копия. `{ ...personal }` или `Object.assign({}, personal)` создаёт новый объект с
теми же полями. `JSON.stringify(obj, null, 2)` превращает его в строку с
отступами и переносами.

### Объект предметов

Объект `predmety` держит строку `list` и два метода — `add` и `remove`. Список
хранится строкой: `'Математика, Физика, Информатика'`. Чтобы добавить или
удалить предмет, строку разбирают на массив, меняют и собирают обратно.

| Шаг | Код |
| --- | --- |
| разобрать | `this.list.split(', ')` |
| добавить | `arr.push(x)`, если `arr.indexOf(x) === -1` |
| удалить | `let i = arr.indexOf(x); if (i !== -1) arr.splice(i, 1)` |
| собрать | `arr.join(', ')` |

`this` внутри метода указывает на сам объект. Так метод не зависит от имени
переменной.

### Перенеси в домашку

- [ ] 2.1: `toCamel('font-size-weight')` → `fontSizeWeight`.
- [ ] 2.2: две копии массива и два разворота, оригинал не изменён.
- [ ] 2.3: перевод фразы по словарю, незнакомое слово остаётся как есть.
- [ ] 2.4: `days.today()` возвращает текущий день недели.
- [ ] 2.5: копия `personal`, правки только в копии, оба объекта выведены строкой.
- [ ] 2.6: `add` и `remove` не дублируют предметы и не ломают список.

### Вывод

Пять предложений: что сделал, где применял `split`/`join`, где копия спасла
оригинал, как проверял и что пришлось исправлять.

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Сделал шесть программ...
2. split и join использовал...
3. Копия нужна была...
4. Проверял через console.log...
5. Ошибка была..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-six"> Все шесть заданий 2.1–2.6 запускаются.</li>
  <li><input type="checkbox" data-save="check-copy"> Исходные массив в 2.2 и объект в 2.5 не изменились.</li>
  <li><input type="checkbox" data-save="check-duplicates"> Предметы не дублируются.</li>
  <li><input type="checkbox" data-save="check-output"> У каждой программы есть вывод в консоль.</li>
  <li><input type="checkbox" data-save="check-own"> Решения написаны самостоятельно, без копирования ответов.</li>
</ul>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 5 минут</span>

## Память

Закрой текст и ответь по памяти. Не перечитывай.

<ul class="mission-memory">
  <li>Почему <code>split</code> и <code>join</code> — обратные операции?</li>
  <li>Почему <code>reverse()</code> без копии меняет оригинал?</li>
  <li>Чем <code>Object.values(obj)</code> отличается от <code>Object.keys(obj)</code>?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2, 3 и 4."></textarea>

<div class="mission-note mission-note--green">
  <strong>Завтра утром · 3 минуты</strong>
  Закрой всё и ответь на эти же три вопроса. Если ответы стали короче и точнее —
  память работает.
</div>

<textarea class="mission-textarea" data-save="error" placeholder="Одна ошибка за сегодня: что думал, что оказалось, по какому признаку узнаю в следующий раз."></textarea>

</section>

<div class="mission-controls">
  <button type="button" class="mission-btn mission-btn--ghost" data-prev>Назад</button>
  <span class="mission-spacer"></span>
  <button type="button" class="mission-btn mission-btn--primary" data-next>Дальше</button>
</div>

<p class="mission-hint" data-hint>Один экран — один шаг. Сначала попытка, потом проверка.</p>

<div class="mission-done" data-complete hidden>
  <strong>Домашка собрана</strong>
  <p>
    Ты прошёл заход. Не закрывай вкладку сразу: запиши одну ошибку и вернись к
    трём вопросам завтра утром.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../">К плану курса</a>
    <a class="button" href="../../">На сегодня</a>
  </div>
</div>

</div>
