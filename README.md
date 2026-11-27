# Learning

Сайт курсов на MkDocs Material: SQL, анализ данных, ИИ, веб, практика и
повторение.

## Запуск

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
.venv/bin/mkdocs serve -a 127.0.0.1:8010
```

Открыть: http://127.0.0.1:8010/

## Проверки

```bash
python3 scripts/validate_content.py
.venv/bin/mkdocs build
```

## Структура

- `docs/learn` — подготовка к зачёту: ИИ и анализ данных.
- `docs/sql` — SQL-курсы и домашки.
- `docs/notes` — записи лекций и практик.
- `docs/review` — повторение.
- `mkdocs.yml` — навигация и настройки сборки.
