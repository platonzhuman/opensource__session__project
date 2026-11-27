---
title: "ЦПТ, квантили и гипотезы"
hide:
  - navigation
  - toc
---

# ЦПТ, квантили и гипотезы

Одна домашка. Один заход до 45 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="cpt-homework">
      <span class="course-row__main">
        <span class="course-row__title">Среднее, интервал и p-value</span>
        <span class="course-row__sub">Стандартная ошибка → 95% интервал → p-value</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Стандартная ошибка.** Насколько среднее шумит при данном `n`.
2. **95% интервал.** Границы вокруг оценки и множитель `1.96`.
3. **p-value.** Двусторонняя проверка H₀ и порог `0.001` для выбросов.
4. **Перенос.** Свои данные: `SE`, интервал, p-value и вывод.

## Что сдаёшь

- расчёт `SE` и 95% интервала для среднего;
- p-value для каждого значения и список выбросов при `p < 0.001`;
- короткий вывод: сколько выбросов и что осталось неопределённым;
- блокнот, который запускается сверху вниз.

## Что понадобится

- Python 3 и `math`;
- среднее и СКО;
- 45 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>

## Старое

Старые уроки остались в [архиве](../archive/index.md) и не входят в основной поток.
