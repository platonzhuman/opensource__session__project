---
title: Сегодня
hide:
  - navigation
  - toc
---

<div class="hero">
  <span class="hero__kicker" data-today-date>один день · один следующий шаг</span>
  <h1 class="hero__title">Сегодня</h1>
  <p class="hero__lead">
    Верни вчерашнее, сделай один маленький шаг и не открывай десять курсов
    одновременно. Сервис сам подскажет, что делать дальше.
  </p>
</div>

<div class="dashboard-grid">
  <div class="dash-card dash-card--accent">
    <div class="dash-card__head">
      <span class="dash-card__kicker">следующий шаг</span>
      <span class="pill">до 20.12</span>
    </div>
    <h2 class="dash-card__title">Зачёт: ИИ и анализ данных</h2>
    <p class="dash-card__text">
      25 подтем, 6 вопросов на модуль, порог 80%. Открой карту, выбери модуль
      и пройди диагностику — она покажет, где дыры, вместо перечитывания всего.
    </p>
    <div class="row-actions">
      <a class="button button--primary" href="learn/ai/">Карта ИИ</a>
      <a class="button" href="learn/da/">Карта DA</a>
    </div>
  </div>

  <div class="dash-card">
    <div class="dash-card__head">
      <span class="dash-card__kicker">память</span>
      <a class="pill pill--blue" href="review/">Все повторения</a>
    </div>
    <h2 class="dash-card__title">Повторение</h2>
    <div data-review-list aria-live="polite">
      <div class="review-empty">Загружаю очередь повторений…</div>
    </div>
    <div class="row-actions">
      <a class="button button--small" href="review/">Открыть повторение</a>
    </div>
  </div>
</div>

<div class="stat-strip">
  <div class="stat"><b>20–30</b><span>минут на один заход</span></div>
  <div class="stat"><b>7</b><span>шагов в подтеме</span></div>
  <div class="stat"><b>1→30</b><span>дней интервал возврата</span></div>
  <div class="stat"><b>1</b><span>артефакт за подтему</span></div>
</div>

<div class="dashboard-grid">
  <div class="dash-card">
    <div class="dash-card__head">
      <span class="dash-card__kicker">быстро</span>
      <span class="pill pill--muted">5–10 минут</span>
    </div>
    <h2 class="dash-card__title">Практика без курса</h2>
    <p class="dash-card__text">
      Python, JavaScript и SQL в одной песочнице. Проверь одну идею, а не
      проходи ещё один урок.
    </p>
    <div class="row-actions">
      <a class="button button--primary" href="sandbox/">Открыть практику</a>
    </div>
  </div>

  <div class="dash-card">
    <div class="dash-card__head">
      <span class="dash-card__kicker">записи</span>
      <span class="pill pill--yellow">конспекты</span>
    </div>
    <h2 class="dash-card__title">Лекции под рукой</h2>
    <p class="dash-card__text">
      Расшифровки лекций и практик по ИИ и анализу данных. Открывай, когда
      нужно вернуться к формулировке или примеру.
    </p>
    <div class="row-actions">
      <a class="button" href="notes/">Открыть записи</a>
    </div>
  </div>
</div>

<div class="section-head">
  <h2>Курсы</h2>
  <span>2 новых формата · остальные постепенно</span>
</div>

<div class="course-grid course-grid--mixed">
  <a class="course-card course-card--featured course-card--torch" href="torch-optimizatory/">
    <div class="course-card__top">
      <span class="pill">готово</span>
      <span class="pill pill--blue">Python</span>
    </div>
    <h3>Оптимизаторы: выбор под задачу</h3>
    <p>Градиент, обусловленность, Momentum, Adam и защита выбора по loss.</p>
    <div class="course-card__meta"><span>7 шагов · 3–5 дней</span><b>Начать →</b></div>
  </a>

  <a class="course-card course-card--featured course-card--sql" href="sql/start/">
    <div class="course-card__top">
      <span class="pill">готово</span>
      <span class="pill pill--blue">SQL</span>
    </div>
    <h3>Строки без пары</h3>
    <p><code>left join ... is null</code>, <code>count(par.id)</code> и полный диагностический запрос.</p>
    <div class="course-card__meta"><span>7 шагов · 3–5 дней</span><b>Начать →</b></div>
  </a>

  <a class="course-card course-card--ai" href="learn/ai/" data-date="27.11.2026" data-duration="3–5 дней">
    <div class="course-card__top"><span class="pill">новая</span><span class="pill pill--blue">ИИ · 13</span></div>
    <h3>ИИ к зачёту</h3>
    <p>Фундамент, SVM, CNN, текст, RNN, NER, GAN — 7 стадий.</p>
    <div class="course-card__meta"><span>7 шагов · 3–5 дней</span><b>Начать →</b></div>
  </a>

  <a class="course-card course-card--da" href="learn/da/" data-date="27.11.2026" data-duration="3–5 дней">
    <div class="course-card__top"><span class="pill">новая</span><span class="pill pill--blue">DA · 12</span></div>
    <h3>Анализ данных к зачёту</h3>
    <p>Гипотезы, кластеры, регрессия, временные ряды, сигналы, аномалии.</p>
    <div class="course-card__meta"><span>7 шагов · 3–5 дней</span><b>Начать →</b></div>
  </a>

  <a class="course-card" href="courses/">
    <div class="course-card__top">
      <span class="pill pill--muted">каталог</span>
      <span class="pill pill--muted">15 курсов</span>
    </div>
    <h3>Все курсы</h3>
    <p>Анализ данных, ML, SQL, веб и старые миссии — в одном каталоге.</p>
    <div class="course-card__meta"><span>выбрать</span><b>Открыть →</b></div>
  </a>
</div>

<div class="mission-note mission-note--green">
  <strong>Правило сервиса</strong>
  Один заход — один экран, одна задача, одна проверка. Повторение — отдельно.
  Полный модуль — только после половины.
</div>
