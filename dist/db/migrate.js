"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
// src/db/migrate.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dbClient_1 = require("./dbClient");
async function migrate() {
    // Увімкнути перевірку зовнішніх ключів (у SQLite вимкнено за замовчуванням)
    await (0, dbClient_1.run)("PRAGMA foreign_keys = ON;");
    // Таблиця фіксації застосованих міграцій
    await (0, dbClient_1.run)(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id        INTEGER PRIMARY KEY,
      filename  TEXT NOT NULL UNIQUE,
      appliedAt TEXT NOT NULL
    );
  `);
    const migrationsDir = path_1.default.join(__dirname, "..", "..", "migrations");
    const files = fs_1.default
        .readdirSync(migrationsDir)
        .filter((f) => /^\d+_.+\.sql$/.test(f))
        .sort(); // гарантований порядок: 001_, 002_, ...
    const applied = await (0, dbClient_1.all)("SELECT filename FROM schema_migrations;");
    const appliedSet = new Set(applied.map((r) => r.filename));
    for (const file of files) {
        if (appliedSet.has(file))
            continue;
        const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), "utf8").trim();
        if (!sql)
            continue;
        await (0, dbClient_1.run)(sql);
        await (0, dbClient_1.run)(`
      INSERT INTO schema_migrations (filename, appliedAt)
      VALUES ('${(0, dbClient_1.esc)(file)}', '${new Date().toISOString()}');
    `);
        console.log(`[migrate] Applied: ${file}`);
    }
    console.log("[migrate] Schema is up to date.");
}
