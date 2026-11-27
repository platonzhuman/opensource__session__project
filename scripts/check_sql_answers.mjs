#!/usr/bin/env node
// Прогоняет SQL-задачи курсов формата hw-pieces в PGlite:
// примеры (@mode run) — как есть, задачи (@mode write/fix) — по ответу с тем же @id из answers.md.
// Запуск: node scripts/check_sql_answers.mjs [путь к index.md ...]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const SEEDS = path.join(DOCS, "javascripts", "seeds");
const { PGlite } = await import(path.join(DOCS, "javascripts", "vendor", "pglite", "index.js"));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith(".md") ? [p] : [];
  });
}

function fences(text, lang) {
  const re = new RegExp("```" + lang + "\\s*\\n([\\s\\S]*?)```", "g");
  return [...text.matchAll(re)].map((m) => m[1]);
}

function parse(raw) {
  const out = { seed: "base", mode: "run", expect: null, id: null, sql: [] };
  for (const line of raw.split("\n")) {
    let m;
    if ((m = line.match(/^\s*--\s*@seed\s+([A-Za-z0-9_-]+)/))) out.seed = m[1];
    else if ((m = line.match(/^\s*--\s*@mode\s+(fix|write|run)\b/i))) out.mode = m[1].toLowerCase();
    else if ((m = line.match(/^\s*--\s*@expect\s+(.+)$/))) out.expect = JSON.parse(m[1]);
    else if ((m = line.match(/^\s*--\s*@id\s+(\S+)/))) out.id = m[1];
    else if (/^\s*--\s*@hint\s/.test(line)) continue;
    else out.sql.push(line);
  }
  out.sql = out.sql.join("\n").trim();
  return out;
}

function splitStatements(sql) {
  const parts = [];
  let start = 0;
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (ch === "-" && next === "-") {
      const eol = sql.indexOf("\n", i);
      i = eol === -1 ? n : eol + 1;
    } else if (ch === "/" && next === "*") {
      const end = sql.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
    } else if (ch === "'" || ch === '"') {
      let close = i + 1;
      while (close < n && !(sql[close] === ch && sql[close + 1] !== ch)) {
        close += sql[close] === ch ? 2 : 1;
      }
      i = close + 1;
    } else if (ch === "$") {
      const tag = sql.slice(i).match(/^\$[A-Za-z_]*\$/);
      if (tag) {
        const end = sql.indexOf(tag[0], i + tag[0].length);
        i = end === -1 ? n : end + tag[0].length;
      } else i++;
    } else if (ch === ";") {
      parts.push(sql.slice(start, i + 1));
      start = i + 1;
      i++;
    } else i++;
  }
  parts.push(sql.slice(start));
  return parts.filter((p) => p.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;/g, "").trim());
}

const normCell = (v) => (v === null || v === undefined ? null : typeof v === "number" ? Number(v.toFixed(6)) : String(v).trim());
const rowKey = (row) => JSON.stringify(row.map(normCell));

function compare(results, expect) {
  const table = [...results].reverse().find((r) => r && r.fields && r.fields.length);
  if (!table) return "нет таблицы в результате";
  const gotCols = table.fields.map((f) => f.name.toLowerCase());
  const wantCols = (expect.columns || []).map((c) => String(c).toLowerCase());
  if (wantCols.length && JSON.stringify(gotCols) !== JSON.stringify(wantCols)) {
    return `колонки ${gotCols.join(",")} вместо ${wantCols.join(",")}`;
  }
  let got = table.rows.map((r) => table.fields.map((f) => normCell(r[f.name])));
  let want = (expect.rows || []).map((r) => r.map(normCell));
  if (!expect.ordered) {
    got = got.sort((a, b) => rowKey(a).localeCompare(rowKey(b)));
    want = want.sort((a, b) => rowKey(a).localeCompare(rowKey(b)));
  }
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    return `строки ${JSON.stringify(got)}\n      ожидались ${JSON.stringify(want)}`;
  }
  return null;
}

const db = new PGlite();
await db.waitReady;

async function run(sql, seed) {
  await db.exec("drop schema if exists public cascade; create schema public; set time zone 'UTC';");
  await db.exec(fs.readFileSync(path.join(SEEDS, seed + ".sql"), "utf8"));
  await db.exec("set client_min_messages = notice;");
  const results = [];
  for (const statement of splitStatements(sql)) results.push(...(await db.exec(statement)));
  return results;
}

const args = process.argv.slice(2);
const pages = (args.length ? args.map((a) => path.resolve(a)) : walk(DOCS)).filter((p) =>
  fs.readFileSync(p, "utf8").includes('data-format="hw-pieces"')
);

let failed = 0;
for (const page of pages) {
  const rel = path.relative(ROOT, page);
  const answersPath = path.join(path.dirname(page), "answers.md");
  const answers = new Map();
  if (fs.existsSync(answersPath)) {
    for (const raw of fences(fs.readFileSync(answersPath, "utf8"), "sql")) {
      const a = parse(raw);
      if (a.id) answers.set(a.id, a.sql);
    }
  }
  console.log(rel);
  for (const block of fences(fs.readFileSync(page, "utf8"), "sqlplay").map(parse)) {
    const name = block.id || `пример (${block.mode})`;
    const sql = block.mode === "run" ? block.sql : answers.get(block.id);
    if (!sql) {
      failed++;
      console.log(`  FAIL ${name}: нет ответа в answers.md`);
      continue;
    }
    try {
      const results = await run(sql, block.seed);
      const problem = block.expect ? compare(results, block.expect) : null;
      if (problem) {
        failed++;
        console.log(`  FAIL ${name}: ${problem}`);
      } else console.log(`  OK   ${name}`);
    } catch (err) {
      failed++;
      console.log(`  FAIL ${name}: ${err.message}`);
    }
  }
}
console.log(`\nОшибок: ${failed}`);
process.exit(failed ? 1 : 0);
