---
title: S&P 500: прогноз как решение
hide:
  - navigation
  - toc
---
# S&P 500: прогноз как решение

Одна домашка. Один заход до 60 минут. Без ADR, журналов экспериментов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="sp500-homework">
      <span class="course-row__main">
        <span class="course-row__title">Домашка за один заход</span>
        <span class="course-row__sub">Данные без утечки → baseline → walk-forward → ошибки → вывод</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Данные без утечки.** Сдвиг на один шаг, а не на минус один.
2. **Baseline.** Zero, drift и mean12 — точка отсчёта, которую надо побить.
3. **Walk-forward.** Расширяющееся окно, а не случайный split.
4. **Ошибки по режимам.** Средняя ошибка прячет плохие периоды.
5. **Вывод.** 5 предложений: что получилось, где ломается, что делать.

## Что сдаёшь

- рабочий ноутбук, который запускается сверху вниз;
- три baseline на walk-forward окнах;
- сравнение модели с baseline по среднему и разбросу;
- короткий вывод на 5 предложений.

Никаких ADR, журналов и memo. Если преподаватель отдельно требует memo — делаешь его после миссии, а не вместо неё.

## Что понадобится

- `pandas`, `numpy`;
- базовое понимание `shift` и скользящих окон;
- 60 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка в песочнице. Подсказка — после второй, ожидаемый
  результат — после третьей. Готовое решение до попытки не показывается.
</div>
