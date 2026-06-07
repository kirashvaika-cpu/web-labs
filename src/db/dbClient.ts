// src/db/dbClient.ts
import { db } from "./db";

export interface RunResult {
  lastID: number;
  changes: number;
}

export function logSql(sql: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[SQL]", sql.replace(/\s+/g, " ").trim());
  }
}

/** SELECT — масив рядків */
export function all<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  logSql(sql);
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => (err ? reject(err) : resolve(rows as T[])));
  });
}

/** SELECT — один рядок або undefined */
export function get<T = Record<string, unknown>>(sql: string): Promise<T | undefined> {
  logSql(sql);
  return new Promise((resolve, reject) => {
    db.get(sql, (err, row) => (err ? reject(err) : resolve(row as T | undefined)));
  });
}

/** INSERT / UPDATE / DELETE */
export function run(sql: string): Promise<RunResult> {
  logSql(sql);
  return new Promise((resolve, reject) => {
    db.run(sql, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Екранування одинарних лапок у рядках для вставки в SQL.
 * ⚠️  Це НЕ параметризація — лише мінімальний захист від синтаксичних помилок.
 * Параметризовані запити будуть у ЛР №5.
 */
export function esc(value: string): string {
  return String(value).replace(/'/g, "''");
}
