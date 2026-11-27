---
title: "Средневековье: рейтинг"
hide:
  - navigation
  - toc
---

# Средневековье: рейтинг

Одна домашка. Один заход до 30 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="srednevekove-homework">
      <span class="course-row__main">
        <span class="course-row__title">Парный тест и Мак-Немар</span>
        <span class="course-row__sub">Разности → paired t → бинарные пары → McNemar</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **Пары.** До и после одного и того же человека.
2. **Разности.** Знак и размер изменения.
3. **Средний рейтинг.** Парный t-критерий.
4. **Поддержка.** `b`, `c` и критерий Мак-Немара.

## Что сдаёшь

- скрипт по `ivaniv.dat.txt`;
- парный t для среднего рейтинга;
- критерий Мак-Немара для поддержки `rating >= 50`;
- вывод по двум вопросам отдельно.

## Что понадобится

- Python 3, `math`, `statistics`;
- `scipy.stats` для `ttest_rel`;
- среднее, СКО и доля;
- 30 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>
