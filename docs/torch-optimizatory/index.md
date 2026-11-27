---
title: "Оптимизаторы: выбор под задачу"
hide:
  - navigation
  - toc
---

<div class="today-head">
  <span class="eyebrow">курс · оптимизация · 3–5 дней</span>
  <h1 class="today-title">Оптимизаторы:<br>выбор под задачу</h1>
  <p class="today-lead">
    Не «прогнать SGD, Momentum и Adam», а понять, как шаг зависит от ландшафта,
    почему один `lr` ломается на овраге и как защитить выбор цифрами.
  </p>
</div>

<div class="mission-card">
  <div class="mission-card__top">
    <span class="pill">подтема</span>
    <span class="pill pill--muted">7 шагов</span>
    <span class="pill pill--blue">Python · torch</span>
  </div>
  <h2>Выбрать оптимизатор и объяснить почему</h2>
  <p>
    Жизненный пример → теория → диагностика → практика → куски ноутбука →
    половина модуля → полный эксперимент с защитой.
  </p>
  <div class="mission-card__actions">
    <a class="button button--primary" href="mission/">Начать подтему</a>
    <a class="button" href="../courses/">Все курсы</a>
  </div>
</div>

## Что ты освоишь

<div class="rule-grid">
  <div class="rule-card rule-card--green">
    <strong>Градиент</strong>
    <span>Один шаг, знак, масштаб и связь с кривизной.</span>
  </div>
  <div class="rule-card rule-card--blue">
    <strong>Обусловленность</strong>
    <span>Почему овраг ломает один `lr` и как это увидеть в числах.</span>
  </div>
  <div class="rule-card rule-card--yellow">
    <strong>Momentum</strong>
    <span>Инерция, `beta` и разгон в плоском направлении.</span>
  </div>
  <div class="rule-card rule-card--purple">
    <strong>Adam</strong>
    <span>Адаптивный шаг, состояние и цена удобства.</span>
  </div>
</div>

## Карта подтемы

<ol class="mission-memory">
  <li><strong>Жизненный пример.</strong> Что именно решаем и какой артефакт сдаём.</li>
  <li><strong>Теория.</strong> Градиент, обусловленность, состояние оптимизаторов.</li>
  <li><strong>Диагностика.</strong> 6 вопросов; 80%+ открывает практику.</li>
  <li><strong>Практика с каркасом.</strong> Починить SGD, дописать Momentum.</li>
  <li><strong>Куски домашки.</strong> Три ручных шага и градиент функции.</li>
  <li><strong>Половина модуля.</strong> Реализовать два оптимизатора и снять loss.</li>
  <li><strong>Полный модуль.</strong> Ноутбук, таблица, проверка `lr` и защита выбора.</li>
</ol>

## Что сдаёшь

- ноутбук с `f(x, y) = sin(x) * cos(y)`, стартом `(10, 10)`, 1000 шагов и `lr = 0.1`;
- таблицу SGD, Momentum и Adam: loss на шагах `0, 100, 500, 1000`;
- проверку `lr` `0.08`, `0.1`, `0.12`;
- расходящиеся запуски в таблице;
- вывод: какой оптимизатор, почему и при каком условии он перестанет работать.

<div class="mission-note mission-note--green">
  <strong>Как проходить</strong>
  Один шаг — один экран. Не пытайся пройти всю подтему за один вечер: теория
  и практика должны чередоваться, а полный модуль — собираться после половины.
</div>

## Что понадобится

- Python, `numpy`, `matplotlib`;
- `torch` для эксперимента в ноутбуке;
- производная функции двух переменных;
- 20–60 минут на один заход.
