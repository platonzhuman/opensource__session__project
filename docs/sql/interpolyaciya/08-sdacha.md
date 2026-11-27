# 8. Сдача: файлы и Pull Request

Всё готово. Собираем и оформляем сдачу.

!!! abstract "Цель урока"
    Ты соберёшь файлы домашки и откроешь отдельный Pull Request.

## Шаг 1 · Собери файлы

В `_Infra/scripts/`:

| Файл | Что это |
| --- | --- |
| `home_work_five` | PL/pgSQL-скрипт: тип + две функции |
| `home_work_five_check` | проверочный `do $$` |
| `home_work_five_check.png` | скриншот Messages со «Все проверки пройдены» |

!!! question "Сделай"
    Сколько файлов должно уйти в PR?

??? success "Проверить"
    Три: DDL-скрипт, проверочный скрипт и скриншот проверок.

## Шаг 2 · Проверь на чистой базе

Порядок:

1. выполнить `home_work_five` — тип и функции создадутся;
2. выполнить `home_work_five` ещё раз — не должно быть ошибок (повторный запуск!);
3. выполнить `home_work_five_check` — в Messages «Все проверки пройдены».

!!! question "Сделай"
    Что должно появиться после DDL-скрипта?

??? success "Проверить"
    Тип `interpolation_type` (во вкладке Types) и две функции: поиск отрезка и
    `interpolate` (во вкладке Functions).

## Шаг 3 · Ветка и Pull Request

```bash
git checkout main
git pull
git checkout -b homework_five

git add _Infra/scripts/home_work_five
git add _Infra/scripts/home_work_five_check
git add _Infra/scripts/home_work_five_check.png

git commit -m "homework five: interpolation type, functions, checks"
git push -u origin homework_five
```

Затем на GitHub: **Compare & pull request** → base `main`, compare `homework_five`.

!!! tip "Правило"
    Одна домашка — одна ветка — один Pull Request. В PR только свои файлы этой
    домашки: без решений классных занятий, без промтов и черновиков (учитель
    это уже отмечал), и не тащи новые коммиты в старые открытые PR.

## Шаг 4 · Чек-лист задания

- [ ] `do $$`-скрипт: тип `interpolation_type` (x0, y0, x1, y1);
- [ ] функция поиска отрезка: принимает температуру, возвращает структуру;
- [ ] функция расчёта: принимает `x` и структуру, возвращает `y`;
- [ ] проверочный `do $$` с примерами (26°, узлы, границы);
- [ ] скриншот результатов проверок;
- [ ] отдельный Pull Request.

## Откуда числа

Требования — из задания: три пункта (скрипт, проверки, скриншот) плюс
git-процедура из практики курса (ветка от `main`, отдельный PR).

## Наивные вопросы

!!! question "Куда положить скриншот?"
    В `_Infra/scripts/` рядом со скриптами — и добавить его в PR тем же
    коммитом.

!!! question "А если учитель попросит поправить?"
    Дописываешь/коммитишь в ту же ветку — PR обновится сам. Ждёшь апрув — и
    только потом merge.

## Чекпоинт

!!! question "Проверка"
    1. **Предскажи:** что покажет повторный запуск `home_work_five_check`?
    2. **Объясни**, почему ветка называется `homework_five`, а не `homework_one`.
    3. **Напиши** команды: создать ветку `homework_five` и закоммитить DDL-скрипт.

??? success "Проверить"
    1. То же самое: «Все проверки пройдены» — скрипт идемпотентен.
    2. Каждая домашка — своя ветка и свой PR; старую `homework_one` больше не трогаем.
    3. `git checkout -b homework_five` → `git add _Infra/scripts/home_work_five` → `git commit -m "homework five"`.

## Что дальше

Собери своё решение сам — иди в практику. Полное решение для сверки — в
`answers.md`.
