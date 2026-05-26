// src/db/migrate.ts
import fs   from "fs";
import path from "path";
import { run, all, esc } from "./dbClient";

interface MigrationRow { filename: string }

export async function migrate(): Promise<void> {
  // Увімкнути перевірку зовнішніх ключів (у SQLite вимкнено за замовчуванням)
  await run("PRAGMA foreign_keys = ON;");

  // Таблиця фіксації застосованих міграцій
  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id        INTEGER PRIMARY KEY,
      filename  TEXT NOT NULL UNIQUE,
      appliedAt TEXT NOT NULL
    );
  `);

  const migrationsDir = path.join(__dirname, "..", "..", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => /^\d+_.+\.sql$/.test(f))
    .sort(); // гарантований порядок: 001_, 002_, ...

  const applied    = await all<MigrationRow>("SELECT filename FROM schema_migrations;");
  const appliedSet = new Set(applied.map((r) => r.filename));

  for (const file of files) {
    if (appliedSet.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8").trim();
    if (!sql) continue;

    await run(sql);

    await run(`
      INSERT INTO schema_migrations (filename, appliedAt)
      VALUES ('${esc(file)}', '${new Date().toISOString()}');
    `);

    console.log(`[migrate] Applied: ${file}`);
  }

  console.log("[migrate] Schema is up to date.");
}
