# Learning

Локальный сайт курсов на MkDocs Material: 7-стадийные подтемы, SQL/Python-практика, повторение.
`desktop/` и `BOT_HQ/` — внешние артефакты, в репозиторий не входят.

## Запуск

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
./serve.sh
```

Сайт: http://127.0.0.1:8010/. Порт задаётся только в `serve.sh` (PORT=8010).

## Проверки

```bash
python3 scripts/validate_content.py
.venv/bin/mkdocs build
```
