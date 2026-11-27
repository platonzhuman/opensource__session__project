#!/usr/bin/env python3
"""Прогоняет локальные T-SQL задачи курсов hw-pieces на настоящем MSSQL.

Блоки ```mssqllocal из index.md: примеры (@mode run) — как есть, задачи
(@mode write/fix) — по ответу ```tsql с тем же @id из answers.md.
Результат последнего набора строк сравнивается с @expect.

Запуск:  python3 scripts/check_mssql_answers.py [путь к index.md ...]

Подключение: docker exec <контейнер> sqlcmd, база Front.
Пароль sa — из переменной MSSQL_PASS, иначе из .env (ключ MSSQL_PASS).
Пароль никуда не печатается и не сохраняется.

Переменные окружения:
  MSSQL_PASS       пароль sa
  MSSQL_ENV_FILE   путь к .env (по умолчанию — _Infra/.env репозитория ученика)
  MSSQL_CONTAINER  имя контейнера (по умолчанию mssql2017)
  MSSQL_DB         база (по умолчанию Front)
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
DEFAULT_ENV_FILE = Path.home() / "Documents/DB/My_work_db_place/_Infra/.env"
SQLCMD = "/opt/mssql-tools/bin/sqlcmd"
SEP = "\x1f"
# курс только читает базу ученика
WRITE_WORDS = re.compile(
    r"\b(insert|update|delete|merge|drop|alter|create|truncate|exec|execute|grant|revoke|deny|backup|restore|dbcc|shutdown)\b"
)


def fences(text: str, lang: str) -> list[str]:
    return re.findall(rf"```{lang}\s*\n(.*?)```", text, re.S)


def parse(raw: str) -> dict:
    out = {"mode": "run", "expect": None, "id": None, "sql": []}
    for line in raw.splitlines():
        if m := re.match(r"^\s*--\s*@mode\s+(fix|write|run)\b", line, re.I):
            out["mode"] = m.group(1).lower()
        elif m := re.match(r"^\s*--\s*@expect\s+(.+)$", line):
            out["expect"] = json.loads(m.group(1))
        elif m := re.match(r"^\s*--\s*@id\s+(\S+)", line):
            out["id"] = m.group(1)
        elif re.match(r"^\s*--\s*@hint\s", line):
            continue
        else:
            out["sql"].append(line)
    out["sql"] = "\n".join(out["sql"]).strip()
    return out


def read_password() -> str:
    password = os.environ.get("MSSQL_PASS")
    if password:
        return password
    env_file = Path(os.environ.get("MSSQL_ENV_FILE", DEFAULT_ENV_FILE))
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            key, _, value = line.partition("=")
            if key.strip() == "MSSQL_PASS":
                return value.strip().strip('"').strip("'")
    raise SystemExit("Нет пароля: задай MSSQL_PASS или MSSQL_ENV_FILE (ключ MSSQL_PASS).")


def code_only(sql: str) -> str:
    text = re.sub(r"/\*.*?\*/", " ", sql, flags=re.S)
    text = re.sub(r"--[^\n]*", " ", text)
    text = re.sub(r"'(?:[^']|'')*'", "''", text)
    return text.lower()


def run_sql(sql: str, password: str) -> list[list[str | None]] | str:
    """Возвращает последнюю таблицу (первая строка — заголовок) или текст ошибки."""
    container = os.environ.get("MSSQL_CONTAINER", "mssql2017")
    database = os.environ.get("MSSQL_DB", "Front")
    cmd = [
        "docker", "exec", "-i", "-e", "SQLCMDPASSWORD", container, SQLCMD,
        "-S", "localhost", "-U", "sa", "-d", database, "-b", "-W", "-s", SEP, "-i", "/dev/stdin",
    ]
    env = dict(os.environ, SQLCMDPASSWORD=password)
    try:
        done = subprocess.run(cmd, input="set nocount on;\n" + sql + "\n", env=env,
                              capture_output=True, text=True, timeout=120)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return f"нет доступа к MSSQL: {exc}"
    if done.returncode != 0:
        message = (done.stdout + done.stderr).strip().splitlines()
        return " ".join(message[-2:]) or f"sqlcmd вернул {done.returncode}"
    return last_table(done.stdout)


def last_table(output: str) -> list[list[str | None]] | str:
    lines = [line for line in output.splitlines() if line.strip()]
    tables: list[list[list[str | None]]] = []
    i = 0
    while i < len(lines):
        cells = lines[i].split(SEP)
        nxt = lines[i + 1].split(SEP) if i + 1 < len(lines) else []
        if nxt and len(nxt) == len(cells) and all(re.fullmatch(r"-+", c) for c in nxt):
            tables.append([cells])
            i += 2
            continue
        if tables:
            tables[-1].append([None if c == "NULL" else c for c in cells])
        i += 1
    return tables[-1] if tables else "нет таблицы в результате"


def norm(value) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if re.fullmatch(r"-?\d+(\.\d+)?", text):
        return str(round(float(text), 6)).removesuffix(".0")
    return text


def compare(table: list[list[str | None]], expect: dict) -> str | None:
    header, rows = table[0], table[1:]
    want_cols = [str(c).lower() for c in expect.get("columns", [])]
    got_cols = [c.lower() for c in header]
    if want_cols and got_cols != want_cols:
        return f"колонки {','.join(got_cols)} вместо {','.join(want_cols)}"
    got = [[norm(c) for c in row] for row in rows]
    want = [[norm(c) for c in row] for row in expect.get("rows", [])]
    if not expect.get("ordered"):
        got.sort(key=json.dumps)
        want.sort(key=json.dumps)
    if got != want:
        return f"строки {json.dumps(got, ensure_ascii=False)}\n      ожидались {json.dumps(want, ensure_ascii=False)}"
    return None


def pages_from_args(args: list[str]) -> list[Path]:
    candidates = [Path(a).resolve() for a in args] if args else sorted(DOCS.rglob("*.md"))
    return [p for p in candidates if "```mssqllocal" in p.read_text(encoding="utf-8")]


def main() -> int:
    pages = pages_from_args(sys.argv[1:])
    if not pages:
        print("Нет страниц с ```mssqllocal")
        return 0
    password = read_password()
    failed = 0
    for page in pages:
        print(page.relative_to(ROOT) if page.is_relative_to(ROOT) else page)
        answers: dict[str, str] = {}
        answers_path = page.parent / "answers.md"
        if answers_path.exists():
            for raw in fences(answers_path.read_text(encoding="utf-8"), "tsql"):
                answer = parse(raw)
                if answer["id"]:
                    answers[answer["id"]] = answer["sql"]
        for block in map(parse, fences(page.read_text(encoding="utf-8"), "mssqllocal")):
            name = block["id"] or f"пример ({block['mode']})"
            sql = block["sql"] if block["mode"] == "run" else answers.get(block["id"] or "")
            if not sql:
                failed += 1
                print(f"  FAIL {name}: нет ответа ```tsql в answers.md")
                continue
            if WRITE_WORDS.search(code_only(sql)):
                failed += 1
                print(f"  FAIL {name}: запрос меняет базу — курс должен только читать")
                continue
            result = run_sql(sql, password)
            problem = result if isinstance(result, str) else (compare(result, block["expect"]) if block["expect"] else None)
            if problem:
                failed += 1
                print(f"  FAIL {name}: {problem}")
            else:
                print(f"  OK   {name}")
    print(f"\nОшибок: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
