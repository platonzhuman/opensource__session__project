---
title: "20 newsgroups: исследование"
hide:
  - navigation
  - toc
---

# 20 newsgroups: исследование

Одна домашка. Один заход до 45 минут. Без ADR, журналов и memo.

<div class="course-group">
  <div class="course-group__title">Миссия</div>
  <div class="course-list">
    <a class="course-row is-current" href="mission/" data-mission-id="20news-homework">
      <span class="course-row__main">
        <span class="course-row__title">TF-IDF → LSA → KMeans</span>
        <span class="course-row__sub">TF-IDF → SVD → KMeans → silhouette → ARI</span>
      </span>
      <span class="course-row__meta" data-mission-status>Начать</span>
      <span class="course-row__arrow">›</span>
    </a>
  </div>
</div>

## Что будет в заходе

1. **TF-IDF.** Частота слова в документе и редкость в корпусе.
2. **LSA.** `TruncatedSVD` сжимает разреженные TF-IDF-векторы.
3. **KMeans.** k кластеров на плотных LSA-векторах.
4. **Метрики.** Silhouette выбирает k, ARI проверяет после.
5. **Утечки.** Заголовки, цитаты и `target` не участвуют в обучении.

## Что сдаёшь

- pipeline TF-IDF → LSA → KMeans, который запускается сверху вниз;
- выбранное k, silhouette и разброс по seeds;
- ARI против `target`, посчитанный после фиксации k;
- короткий разбор смешанных тем и вывод: годится ли это для discovery.

## Что понадобится

- Python, `numpy`, `pandas`, `matplotlib`;
- `scikit-learn` для домашки — песочницы здесь на чистом Python;
- базовое понимание `fit`, `transform` и расстояния между векторами;
- 45 минут без переключения на другие задачи.

<div class="mission-note mission-note--green">
  <strong>Главное правило</strong>
  Сначала своя попытка. Подсказка — после второй, ожидаемый результат — после
  третьей. Готовое решение до попытки не показывается.
</div>

## Старое

Старые уроки остались в [архиве](../archive/index.md) и не входят в основной поток.
