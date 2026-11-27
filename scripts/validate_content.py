#!/usr/bin/env python3
"""Минимальный quality gate для подтем.

Проверяет только страницы с data-subtopic. Старый контент не блокирует сборку,
но новая подтема не должна проходить без обязательных частей.

Страницы с data-format="hw-pieces" проверяются по формату «карта ДЗ → куски →
сборка → защита» и по списку конструкций ученика (learner/constructs.json).

Блок ```mssqllocal — задача, которую ученик решает у себя в VS Code на MSSQL
и вставляет результат. Правила те же, что у sqlplay, только без @seed;
ответы к ним лежат в answers.md в блоках ```tsql.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SEEDS = DOCS / "javascripts" / "seeds"
CONSTRUCTS = ROOT / "learner" / "constructs.json"
WRITE_LINES_MAX = 15


def blocks(text: str, name: str) -> list[str]:
    pattern = re.compile(rf"```{name}\s*\n(.*?)```", re.S)
    return pattern.findall(text)


def validate_quiz(raw: str, errors: list[str]) -> None:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        errors.append(f"quiz JSON: {exc}")
        return
    if int(data.get("min", 0)) < 80:
        errors.append("quiz min должен быть >= 80")
    questions = data.get("questions") or []
    if len(questions) < 5:
        errors.append("в quiz меньше 5 вопросов")
    for i, question in enumerate(questions, 1):
        if not question.get("explain"):
            errors.append(f"quiz вопрос {i}: нет explain")
        if not question.get("q"):
            errors.append(f"quiz вопрос {i}: нет q")


def validate(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    errors: list[str] = []

    if "data-subtopic=" not in text:
        return errors
    if 'data-format="hw-pieces"' in text:
        return validate_hw_pieces(path, text)

    for attr in ("data-mission=", "data-review=", "data-strict="):
        if attr not in text:
            errors.append(f"нет {attr}")

    steps = [int(x) for x in re.findall(r'data-step="(\d+)"', text)]
    if steps != list(range(1, 8)):
        errors.append(f"ожидались шаги 1..7, получено {steps}")

    if text.count("data-require-check") < 4:
        errors.append("меньше 4 шагов с проверкой")
    if text.count("data-require-all") < 2:
        errors.append("нет шагов с несколькими обязательными задачами")
    if text.count("data-save=") < 2:
        errors.append("нет полей для объяснения/журнала ошибок")

    quizzes = blocks(text, "quiz")
    if not quizzes:
        errors.append("нет диагностического quiz")
    for raw in quizzes:
        validate_quiz(raw, errors)

    sqls = blocks(text, "sqlplay")
    pys = blocks(text, "pyplay")
    tasks = [("SQL", raw) for raw in sqls] + [("Python", raw) for raw in pys]
    if len(tasks) < 3:
        errors.append("меньше 3 интерактивных задач (sqlplay/pyplay)")
    for i, (kind, raw) in enumerate(tasks, 1):
        directives = ("@seed", "@expect", "@hint") if kind == "SQL" else ("@expect", "@hint")
        for directive in directives:
            if directive not in raw:
                errors.append(f"{kind}-задача {i}: нет {directive}")

    return errors


# ---------- формат hw-pieces ----------

def directive(raw: str, name: str) -> str | None:
    m = re.search(rf"^\s*--\s*@{name}\s+(.+?)\s*$", raw, re.M)
    return m.group(1) if m else None


def code_only(raw: str) -> str:
    """SQL без директив, комментариев и строковых литералов, в нижнем регистре."""
    text = re.sub(r"/\*.*?\*/", " ", raw, flags=re.S)
    text = re.sub(r"--[^\n]*", " ", text)
    text = re.sub(r"'(?:[^']|'')*'", "''", text)
    return text.lower()


def load_constructs() -> dict:
    return json.loads(CONSTRUCTS.read_text(encoding="utf-8"))


def validate_hw_pieces(path: Path, text: str) -> list[str]:
    errors: list[str] = []

    for attr in ("data-mission=", "data-review=", 'data-strict="1"', "data-homework=", "data-new="):
        if attr not in text:
            errors.append(f"нет {attr}")

    sections = re.findall(r"<section\b([^>]*)>(.*?)</section>", text, re.S)
    steps = [int(m) for attrs, _ in sections for m in re.findall(r'data-step="(\d+)"', attrs)]
    if steps != list(range(1, len(steps) + 1)) or not 5 <= len(steps) <= 12:
        errors.append(f"шаги должны идти 1..N, N от 5 до 12; получено {steps}")

    kinds = [(re.search(r'data-kind="([a-z]+)"', attrs) or [None, None])[1] for attrs, _ in sections]
    if not kinds or kinds[0] != "map":
        errors.append("первый шаг должен быть data-kind=\"map\" (карта ДЗ)")
    if len(kinds) < 2 or kinds[-1] != "defend":
        errors.append("последний шаг должен быть data-kind=\"defend\" (защита)")
    if len(kinds) < 3 or kinds[-2] != "assemble":
        errors.append("предпоследний шаг должен быть data-kind=\"assemble\" (сборка)")
    middle = kinds[1:-2]
    if len(middle) < 2 or any(kind != "piece" for kind in middle):
        errors.append(f"между картой и сборкой нужны минимум 2 шага data-kind=\"piece\"; получено {middle}")

    ordered: list[tuple[str, str]] = []  # (mode, raw) в порядке страницы
    ids: list[str] = []
    for number, ((attrs, body), kind) in enumerate(zip(sections, kinds), 1):
        sql_blocks = blocks(body, "sqlplay")
        local_blocks = blocks(body, "mssqllocal")
        modes = [(directive(raw, "mode") or "run").lower() for raw in sql_blocks]
        local_modes = [(directive(raw, "mode") or "run").lower() for raw in local_blocks]
        all_modes = modes + local_modes
        if kind == "piece":
            for marker in ("piece-why", "piece-hw"):
                if marker not in body:
                    errors.append(f"шаг {number}: нет блока {marker}")
            if "data-require-check" not in attrs or "data-require-all" not in attrs:
                errors.append(f"шаг {number}: кусок должен иметь data-require-check и data-require-all")
            if "run" not in all_modes:
                errors.append(f"шаг {number}: нет примера (@mode run) перед задачей")
            if not any(mode in ("write", "fix") for mode in all_modes):
                errors.append(f"шаг {number}: нет мини-задачи (@mode write/fix)")
        if kind == "defend":
            quizzes = blocks(body, "quiz")
            if not quizzes:
                errors.append(f"шаг {number}: в защите нет quiz")
            for raw in quizzes:
                validate_quiz(raw, errors)
            if 'data-save="error"' not in body:
                errors.append(f"шаг {number}: нет поля data-save=\"error\" (ошибка дня)")
        tasks = [(raw, mode, True) for raw, mode in zip(sql_blocks, modes)]
        tasks += [(raw, mode, False) for raw, mode in zip(local_blocks, local_modes)]
        for raw, mode, in_sandbox in tasks:
            ordered.append((mode, raw))
            label = directive(raw, "id") or f"шаг {number}, пример"
            required = ("seed", "expect", "hint") if in_sandbox else ("expect", "hint")
            for name in required:
                if directive(raw, name) is None:
                    errors.append(f"{label}: нет @{name}")
            seed = directive(raw, "seed")
            if seed and not (SEEDS / f"{seed}.sql").exists():
                errors.append(f"{label}: нет сида seeds/{seed}.sql")
            if mode in ("write", "fix"):
                task_id = directive(raw, "id")
                if not task_id:
                    errors.append(f"шаг {number}: у задачи нет @id")
                else:
                    ids.append(task_id)
                lines = [l for l in code_only(raw).splitlines() if l.strip()]
                if mode == "write" and len(lines) > WRITE_LINES_MAX:
                    errors.append(f"{label}: в заготовке {len(lines)} строк кода — похоже на готовое решение")

    answers_path = path.parent / "answers.md"
    answers: dict[str, str] = {}
    if not answers_path.exists():
        errors.append("нет answers.md рядом с курсом")
    else:
        answers_text = answers_path.read_text(encoding="utf-8")
        for raw in blocks(answers_text, "sql") + blocks(answers_text, "tsql"):
            task_id = directive(raw, "id")
            if task_id:
                answers[task_id] = raw
        for task_id in ids:
            if task_id not in answers:
                errors.append(f"{task_id}: нет ответа в answers.md")
        for task_id in answers:
            if task_id not in ids:
                errors.append(f"answers.md: ответ {task_id} не относится ни к одной задаче")

    errors.extend(check_constructs(text, ordered, list(answers.values())))
    return errors


def check_constructs(text: str, ordered: list[tuple[str, str]], answers: list[str]) -> list[str]:
    errors: list[str] = []
    rules = load_constructs()
    declared_attr = re.search(r'data-new="([^"]*)"', text)
    declared = {x.strip() for x in declared_attr.group(1).split(",")} if declared_attr else set()

    everything = [(mode, code_only(raw)) for mode, raw in ordered] + [("answer", code_only(raw)) for raw in answers]

    for rule in rules["stop"]:
        if any(re.search(rule["re"], code, re.M) for _, code in everything):
            errors.append(f"стоп-лист учителя: {rule['name']} ({rule['why']})")

    used: set[str] = set()
    for rule in rules["new"]:
        first = next((mode for mode, code in everything if re.search(rule["re"], code, re.M)), None)
        if first is None:
            continue
        used.add(rule["name"])
        if rule["name"] not in declared:
            errors.append(f"новая конструкция «{rule['name']}» не объявлена в data-new")
        if first != "run":
            errors.append(f"«{rule['name']}» впервые появляется не в примере (@mode run), а в {first}")
    for name in sorted(declared - used):
        errors.append(f"data-new: «{name}» объявлена, но не используется")
    return errors


def main() -> int:
    files = sorted(DOCS.rglob("*.md"))
    checked = 0
    failed = 0
    for path in files:
        errors = validate(path)
        if not errors and "data-subtopic=" not in path.read_text(encoding="utf-8"):
            continue
        checked += 1
        rel = path.relative_to(ROOT)
        if errors:
            failed += 1
            print(f"FAIL {rel}")
            for error in errors:
                print(f"  - {error}")
        else:
            print(f"OK   {rel}")

    print(f"\nПроверено подтем: {checked}, с ошибками: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
