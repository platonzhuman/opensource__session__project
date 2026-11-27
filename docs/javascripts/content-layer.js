/* Дополнительный слой для старых миссий: короткая глубокая теория + quiz.
   Новые 7-шаговые подтемы не трогаем. */
(function () {
  "use strict";

  var THEORY = {
    "sp500-homework": {
      title: "Прогноз как решение",
      points: [
        "Сначала baseline: наивный прогноз и честный split. Модель без baseline ничего не доказывает.",
        "Walk-forward сохраняет порядок времени: обучение только на прошлом, проверка на будущем.",
        "Утечка — это любая информация из будущего или из target, попавшая в признаки.",
        "Смотри не только RMSE, но и error analysis: где, когда и на каком режиме модель ошибается."
      ],
      mistakes: ["Случайный shuffle временного ряда", "Подбор модели по test", "Отчёт только по средней метрике"],
      quiz: {title: "Проверка · S&P 500", min: 80, questions: [
        {type:"choice",q:"Что делать первым в задаче прогноза?",options:["Сразу брать XGBoost","Посчитать наивный baseline","Оптимизировать гиперпараметры","Нормализовать target"],answer:1,explain:"Baseline задаёт точку отсчёта: без него нельзя понять, полезна ли модель."},
        {type:"truefalse",q:"Случайный shuffle временного ряда — нормальный способ сделать validation.",answer:false,explain:"Для времени нужен walk-forward или хронологический split, иначе прошлое и будущее перемешиваются."}
      ]}
    },
    "cpt-homework": {
      title: "Оценка, интервал и p-value",
      points: [
        "Стандартная ошибка показывает, насколько оценка может гулять от выборки к выборке.",
        "Доверительный интервал — диапазон правдоподобных значений параметра, а не вероятность для конкретного интервала.",
        "p-value — вероятность увидеть такие или более крайние данные при верной нулевой гипотезе.",
        "ЦПТ помогает для средних, но не отменяет проверку выбросов и размера выборки."
      ],
      mistakes: ["«p = 0.03 значит гипотеза верна»", "Смотреть только на среднее", "Игнорировать размер эффекта"],
      quiz: {title: "Проверка · ЦПТ", min: 80, questions: [
        {type:"choice",q:"Что показывает стандартная ошибка среднего?",options:["разброс одного наблюдения","неопределённость оценки среднего","p-value","размер эффекта"],answer:1,explain:"SE оценивает, насколько среднее может отличаться между выборками."},
        {type:"truefalse",q:"p-value — это вероятность того, что нулевая гипотеза верна.",answer:false,explain:"p-value считается при условии нулевой гипотезы; это не её вероятность."}
      ]}
    },
    "batman-homework": {
      title: "DBSCAN: плотность, а не центры",
      points: [
        "DBSCAN ищет области высокой плотности; число кластеров заранее не задаётся.",
        "eps задаёт радиус соседства, min_samples — порог плотности.",
        "Точки делятся на core, border и noise; шум — это не ошибка, а часть модели.",
        "Масштаб признаков критичен: расстояние без нормализации может определять один признак."
      ],
      mistakes: ["Сырые координаты без масштаба", "Подбор eps по глазам", "Считать шум «плохими данными»"],
      quiz: {title: "Проверка · DBSCAN", min: 80, questions: [
        {type:"choice",q:"Что делает eps в DBSCAN?",options:["число кластеров","радиус соседства","число признаков","скорость обучения"],answer:1,explain:"eps определяет, какие точки считаются соседями."},
        {type:"truefalse",q:"Перед DBSCAN масштаб признаков можно не трогать.",answer:false,explain:"Расстояние зависит от масштаба, поэтому признаки нужно приводить к сопоставимому виду."}
      ]}
    },
    "srednevekove-homework": {
      title: "Связанные выборки",
      points: [
        "Парный t-критерий работает с разностями внутри пары, а не с двумя независимыми группами.",
        " McNemar используется для парных бинарных исходов.",
        "Сначала смотри на дизайн: пары действительно связаны?",
        "Проверяй распределение разностей и выбросы; t-критерий чувствителен к ним."
      ],
      mistakes: ["Использовать независимый t для пар", "Забыть про парность", "Игнорировать выбросы"],
      quiz: {title: "Проверка · парные данные", min: 80, questions: [
        {type:"choice",q:"Что анализирует парный t-критерий?",options:["два независимых средних","разности внутри пар","дисперсию признака","корреляцию всех столбцов"],answer:1,explain:"Парный тест сводит задачу к одной выборке разностей."},
        {type:"truefalse",q:"McNemar подходит для парных бинарных исходов.",answer:true,explain:"McNemar сравнивает согласованные пары бинарных ответов."}
      ]}
    },
    "klasterizuem-homework": {
      title: "Кластеризация как решение",
      points: [
        "Масштабирование признаков меняет расстояния и результат кластеризации.",
        "k нельзя выбирать только по «красивой картинке»; нужны silhouette, elbow и доменная проверка.",
        "Функция должна быть воспроизводимой: seed, порядок данных, версия библиотек.",
        "Кластеры — гипотезы о структуре, а не доказательство истинных групп."
      ],
      mistakes: ["Кластеризовать без масштаба", "Подбирать k по test", "Забыть seed"],
      quiz: {title: "Проверка · кластеризация", min: 80, questions: [
        {type:"choice",q:"Зачем масштабировать признаки перед KMeans?",options:["чтобы ускорить Python","чтобы расстояния не определял один большой признак","чтобы увеличить k","чтобы убрать пропуски"],answer:1,explain:"KMeans использует расстояния; масштаб признака влияет на вклад в расстояние."},
        {type:"truefalse",q:"Silhouette — единственный критерий выбора k.",answer:false,explain:"Нужны несколько критериев и проверка смысла кластеров."}
      ]}
    },
    "20news-homework": {
      title: "Текст: TF-IDF и структура",
      points: [
        "TF-IDF повышает вес редких слов и снижает вес частых служебных.",
        "LSA сжимает разреженную матрицу в латентные компоненты, но теряет интерпретируемость.",
        "KMeans на текстах чувствителен к числу кластеров и preprocessing.",
        "Silhouette и ARI отвечают на разные вопросы: плотность и совпадение с разметкой."
      ],
      mistakes: ["Считать мешок слов без нормализации", "Подбирать k по ARI на test", "Игнорировать дисбаланс классов"],
      quiz: {title: "Проверка · 20 newsgroups", min: 80, questions: [
        {type:"choice",q:"Что делает TF-IDF с очень частым словом?","options":["повышает вес","понижает вес","удаляет слово","переводит в число"],answer:1,explain:"IDF снижает вес слов, которые встречаются почти во всех документах."},
        {type:"truefalse",q:"ARI можно использовать для выбора k на тестовой разметке.",answer:false,explain:"Если ARI считается по разметке, она не должна участвовать в выборе модели."}
      ]}
    },
    "catsdogs-homework": {
      title: "Классификатор картинок",
      points: [
        "Сначала фиксируй split и метрику; accuracy при дисбалансе может врать.",
        "Аугментация расширяет данные, но не должна менять смысл класса.",
        "Transfer learning обычно сильнее обучения с нуля на маленьком датасете.",
        "Смотри не только accuracy, но и confusion matrix, precision/recall и ошибки на срезах."
      ],
      mistakes: ["Аугментация, меняющая класс", "Утечка validation в подбор", "Оценка только по accuracy"],
      quiz: {title: "Проверка · классификация", min: 80, questions: [
        {type:"choice",q:"Что важнее при сильном дисбалансе классов?","options":["только accuracy","precision/recall и confusion matrix","скорость обучения","число слоёв"],answer:1,explain:"Accuracy может быть высокой за счёт мажоритарного класса."},
        {type:"truefalse",q:"Аугментация может случайно превратить кошку в собаку по смыслу.",answer:true,explain:"Слишком агрессивные преобразования меняют семантику и портят обучение."}
      ]}
    },
    "sql-domashka": {
      title: "Скрипт, ключи и повторный запуск",
      points: [
        "primary key делает строку уникальной; foreign key не даёт ссылке указывать в пустоту.",
        "drop table if exists идёт в обратном порядке связей: сначала дочерние таблицы.",
        "Скрипт должен запускаться дважды подряд без ошибок.",
        "После join считай уникальные сущности через count(distinct ...), а не строки."
      ],
      mistakes: ["Удалять родителя раньше ребёнка", "Считать count(*) после join", "Оставлять скрипт неидемпотентным"],
      quiz: {title: "Проверка · SQL-скрипт", min: 80, questions: [
        {type:"choice",q:"В каком порядке удалять таблицы?",options:["сначала родительские","сначала дочерние","в алфавитном","в любом"],answer:1,explain:"Иначе foreign key не даст удалить родителя."},
        {type:"truefalse",q:"После join с parametrs count(*) всегда равен числу пачек.",answer:false,explain:"Одна пачка повторяется по числу измерений; нужен count(distinct p.id)."}
      ]}
    },
    "sql-fix-tz": {
      title: "Ограничения и пустые пачки",
      points: [
        "left join + par.id is null находит строки без пары.",
        "not null, unique и check закрывают разные правила схемы.",
        "Ограничения добавляют после исправления данных, иначе alter table упадёт.",
        "Один check на value не заменяет диапазоны, зависящие от типа параметра."
      ],
      mistakes: ["Проверять p.id is null вместо par.id", "Добавлять constraint до очистки", "Дублировать ограничения"],
      quiz: {title: "Проверка · ТЗ и ограничения", min: 80, questions: [
        {type:"choice",q:"Что проверять после left join?","options":["p.id is null","par.id is null","count(*) = 0","primary key"],answer:1,explain:"NULL появляется в правой таблице, поэтому признак отсутствия пары — par.id is null."},
        {type:"truefalse",q:"check (value between -1000 and 1000) заменяет проверки диапазонов по типам параметров.",answer:false,explain:"Для разных типов параметров диапазоны разные; нужна отдельная проверка."}
      ]}
    },
    "sql-migraciya": {
      title: "Wide → long и целостность",
      points: [
        "union all сохраняет все строки; union удаляет дубликаты и может скрыть ошибку.",
        "Новые таблицы связывают foreign key с справочниками.",
        "Миграция должна быть идемпотентной: повторный запуск не удваивает данные.",
        "Счётчики old/new и проверка null — обязательная часть миграции."
      ],
      mistakes: ["union вместо union all", "Забыть FK", "Не проверить повторный запуск"],
      quiz: {title: "Проверка · миграция", min: 80, questions: [
        {type:"choice",q:"Чем union all отличается от union?",options:["удаляет дубликаты","сохраняет все строки","меняет типы","сортирует"],answer:1,explain:"union all не удаляет дубликаты, поэтому не скрывает повторяющиеся данные."},
        {type:"truefalse",q:"Повторный запуск миграции может удвоить строки, если нет защиты.",answer:true,explain:"Поэтому нужна идемпотентность: drop/if not exists, транзакция или проверка to_regclass."}
      ]}
    },
    "sql-analiz": {
      title: "Проверки качества данных",
      points: [
        "count(*) считает строки, count(column) — непустые значения.",
        "Дубликаты ищут group by + having count(*) > 1.",
        "Диапазоны проверяют min/max и условия на допустимые значения.",
        "Каждая проверка должна возвращать ожидаемый результат, а не «примерно ноль»."
      ],
      mistakes: ["Путать count(*) и count(col)", "Не проверять null", "Оставлять запрос без ожидаемого результата"],
      quiz: {title: "Проверка · качество данных", min: 80, questions: [
        {type:"choice",q:"Что считает count(column)?","options":["все строки","только непустые значения","уникальные значения","число таблиц"],answer:1,explain:"count(column) игнорирует NULL."},
        {type:"truefalse",q:"group by + having count(*) > 1 помогает найти дубликаты.",answer:true,explain:"Группировка по ключу и условие на количество показывает повторяющиеся значения."}
      ]}
    },
    "sql-plpgsql": {
      title: "Транзакции и метаданные",
      points: [
        "Транзакция — единица работы: либо всё, либо ничего.",
        "information_schema описывает таблицы и колонки, но требует фильтра по схеме.",
        "ER-диаграмма должна совпадать с реальными primary/foreign key.",
        "Счётчики после каждой транзакции помогают увидеть, где сломался сценарий."
      ],
      mistakes: ["Одна огромная транзакция", "Забыть table_schema = 'public'", "Рисовать ER без проверки ключей"],
      quiz: {title: "Проверка · транзакции", min: 80, questions: [
        {type:"choice",q:"Зачем нужны отдельные транзакции в скрипте?","options":["чтобы было длиннее","чтобы фиксировать этапы и упрощать диагностику","чтобы удалить ключи","чтобы ускорить SELECT"],answer:1,explain:"Разбиение на этапы позволяет проверить каждый шаг и не тащить ошибку дальше."},
        {type:"truefalse",q:"information_schema.tables без фильтра показывает только пользовательские таблицы.",answer:false,explain:"Там есть системные объекты; нужен фильтр по схеме и типу."}
      ]}
    },
    "sql-interpolyaciya": {
      title: "Тип, формула и границы",
      points: [
        "Сначала опиши тип-структуру: какие поля, типы, ограничения.",
        "Интерполяция — правило между известными точками; экстраполяция — за их пределами.",
        "Проверяй деление на ноль, пустые диапазоны и границы.",
        "Функция должна быть детерминированной и покрытой тестами на краях."
      ],
      mistakes: ["Не проверять границы", "Путать интерполяцию и экстраполяцию", "Игнорировать NULL"],
      quiz: {title: "Проверка · интерполяция", min: 80, questions: [
        {type:"choice",q:"Что такое интерполяция?","options":["значение за пределами данных","значение между известными точками","удаление выбросов","сортировка"],answer:1,explain:"Интерполяция оценивает значение внутри известного диапазона."},
        {type:"truefalse",q:"Границы диапазона можно не тестировать, если формула выглядит правильно.",answer:false,explain:"Ошибки чаще всего живут на границах, пустых диапазонах и делении на ноль."}
      ]}
    },
    "js-homework": {
      title: "Строки, массивы и объекты",
      points: [
        "split превращает строку в массив, join собирает массив обратно в строку.",
        "slice не мутирует, splice мутирует; выбирай осознанно.",
        "Копия массива через spread поверхностная: вложенные объекты остаются общими.",
        "Object.entries/fromEntries удобны для преобразования структуры данных."
      ],
      mistakes: ["Путать slice и splice", "Мутировать исходный массив", "Забыть про вложенные объекты"],
      quiz: {title: "Проверка · JavaScript", min: 80, questions: [
        {type:"choice",q:"Что делает split('-')?","options":["собирает строку","режет строку на массив по дефису","удаляет дефис","сортирует"],answer:1,explain:"split возвращает массив кусков."},
        {type:"truefalse",q:"spread-копия массива полностью копирует вложенные объекты.",answer:false,explain:"Это поверхностная копия; вложенные объекты остаются по ссылке."}
      ]}
    }
  };

  function inject(mission) {
    if (mission.dataset.contentLayer === "1") return;
    if (mission.hasAttribute("data-subtopic")) return;
    var id = mission.getAttribute("data-mission");
    var data = THEORY[id];
    if (!data) return;
    mission.dataset.contentLayer = "1";
    var step = mission.querySelector(".mission-step");
    if (!step) return;

    var box = document.createElement("div");
    box.className = "deep-dive";
    var details = document.createElement("details");
    details.open = true;
    var summary = document.createElement("summary");
    summary.textContent = "Теория глубже · " + data.title;
    details.appendChild(summary);

    var points = document.createElement("ul");
    points.className = "deep-dive__points";
    data.points.forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text;
      points.appendChild(li);
    });
    details.appendChild(points);

    if (data.mistakes) {
      var mistakes = document.createElement("div");
      mistakes.className = "deep-dive__mistakes";
      var label = document.createElement("strong");
      label.textContent = "Ловушки";
      mistakes.appendChild(label);
      var list = document.createElement("ul");
      data.mistakes.forEach(function (text) {
        var li = document.createElement("li");
        li.textContent = text;
        list.appendChild(li);
      });
      mistakes.appendChild(list);
      details.appendChild(mistakes);
    }
    box.appendChild(details);

    var quiz = document.createElement("div");
    quiz.className = "quiz";
    quiz.textContent = JSON.stringify(data.quiz);
    box.appendChild(quiz);
    step.appendChild(box);
  }

  function init() {
    document.querySelectorAll(".mission").forEach(inject);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  if (window.document$ && window.document$.subscribe) {
    window.document$.subscribe(init);
  }
})();
