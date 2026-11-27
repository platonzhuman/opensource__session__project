---
title: "DBSCAN: найти недостижимое здание"
hide:
  - navigation
  - toc
---

<div class="mission" data-mission="batman-homework" data-title="DBSCAN: найти недостижимое здание" data-hint-default="Один экран — один шаг. Сначала попытка, потом проверка." markdown="1">

<div class="mission-top">
  <span class="mission-kicker">Где спрятался Во · один заход</span>
  <span class="mission-track"><span data-progress></span></span>
  <span class="mission-count" data-count>1 / 6</span>
</div>

<section class="mission-step" data-step="1" markdown="1">

<span class="mission-label">Шаг 1 · 3 минуты</span>

## План на 30 минут

Во спрятался на крыше, до которой Бэтмен не может добраться по цепочке
прыжков. Ищем это здание среди точек `(X, Y, H)`.

1. **Расстояние** — хватит ли прыжка в `300` футов.
2. **Соседи** — `eps = 300` и `min_samples = 2`.
3. **Достижимость** — BFS по цепочке прыжков.
4. **Метка `-1`** — так DBSCAN помечает шум.
5. **Карта** — показываем крышу Во.

<div class="mission-note">
  <strong>Правило захода</strong>
  Сначала своя попытка. Потом проверка. Подсказка — после второй попытки,
  ожидаемый результат — после третьей.
</div>

</section>

<section class="mission-step" data-step="2" data-require-check markdown="1">

<span class="mission-label">Шаг 2 · 9 минут</span>

## Разобранный пример: расстояние

Прыжок — это евклидово расстояние в трёх координатах:

`dist = sqrt(dX² + dY² + dH²)`.

Высота тоже входит в расстояние. Две крыши в одной точке карты могут быть
далеко друг от друга.

| A | B | `dist` | Прыжок |
| --- | --- | --- | --- |
| `(0, 0, 100)` | `(0, 0, 350)` | 250 | да |
| `(0, 0, 100)` | `(0, 0, 500)` | 400 | нет |

Условие одно: `dist <= 300`.

### Почини

Сейчас высота не входит в расстояние. Исправь, чтобы для этих точек
получилось `250.0`.

```pyplay
# @mode fix
# @expect 250.0
# @hint Добавь под корень квадрат разницы по третьей координате.
import math
a = (0, 0, 100)
b = (0, 0, 350)
dist = math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2)
print(round(dist, 2))
```

</section>

<section class="mission-step" data-step="3" data-require-check markdown="1">

<span class="mission-label">Шаг 3 · 8 минут</span>

## Соседи и достижимость

Сосед — точка на расстоянии не больше `eps`. При `min_samples = 2` одинокой
точке не хватает соседа, и DBSCAN помечает её шумом `-1`.

Достижимость — это цепочка. Даже если две крыши далеко, между ними может
быть промежуточная. BFS собирает всё, до чего есть хоть какой-то путь.

Для точек `(0,0,0)`, `(250,0,0)`, `(500,0,0)`, `(900,0,0)` и `eps = 300`
из первой крыши достижимы три.

### Напиши сам

Напиши `reachable(points, eps=300, start=0)` и напечатай `reachable 3`.

```pyplay
# @mode write
# @expect reachable 3
# @hint Очередь, множество посещённых, проверка расстояния до каждой новой точки.
# Напиши reachable(points, eps=300, start=0) и напечатай "reachable", len(seen).
```

</section>

<section class="mission-step" data-step="4" markdown="1">

<span class="mission-label">Шаг 4 · 5 минут</span>

## Перенеси в домашку

В своём скрипте:

- [ ] загрузи `buildings.dat.txt` с колонками `X`, `Y`, `H`;
- [ ] запусти `DBSCAN(eps=300, min_samples=2)`;
- [ ] найди точки с меткой `-1`;
- [ ] проверь каждую: ближайший сосед дальше `300`;
- [ ] выбери здание Во и отметь его на карте.

Если шумных точек много, проверь `eps` и `min_samples`. Не подгоняй параметры
под заранее выбранное здание.

</section>

<section class="mission-step" data-step="5" markdown="1">

<span class="mission-label">Шаг 5 · 3 минуты</span>

## Вывод

Четыре предложения:

1. Сколько зданий и сколько кластеров.
2. Какое здание недостижимо и почему.
3. Как проверено: BFS, DBSCAN или оба способа.
4. Где это видно на карте.

<textarea class="mission-textarea" data-save="conclusion" placeholder="1. Данные и число кластеров...
2. Недостижимое здание и ближайший сосед...
3. Проверка цепочкой...
4. Карта..."></textarea>

<ul class="mission-checklist">
  <li><input type="checkbox" data-save="check-dist"> В расстоянии учтены `X`, `Y` и `H`.</li>
  <li><input type="checkbox" data-save="check-eps"> `eps = 300`, `min_samples = 2`.</li>
  <li><input type="checkbox" data-save="check-noise"> Кандидат имеет метку `-1` и проверен цепочкой.</li>
  <li><input type="checkbox" data-save="check-map"> На карте отмечено именно это здание.</li>
</ul>

</section>

<section class="mission-step" data-step="6" markdown="1">

<span class="mission-label">Шаг 6 · 2 минуты</span>

## Память

Закрой текст и ответь по памяти.

<ul class="mission-memory">
  <li>Почему высота входит в расстояние между крышами?</li>
  <li>Чем сосед отличается от достижимой точки?</li>
  <li>Что означает метка `-1` в DBSCAN?</li>
</ul>

<textarea class="mission-textarea" data-save="memory" placeholder="Ответы по памяти. Потом сверь с шагами 2–4."></textarea>

<div class="mission-note mission-note--green">
  <strong>Завтра утром · 3 минуты</strong>
  Ответь на эти же три вопроса без подсказок. Если ответ короче и точнее —
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
    Ты прошёл заход. Запиши одну ошибку и вернись к трём вопросам завтра утром.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="../">К плану курса</a>
    <a class="button" href="../../">На сегодня</a>
  </div>
</div>

</div>
