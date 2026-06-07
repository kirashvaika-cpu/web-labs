"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSql = logSql;
exports.all = all;
exports.get = get;
exports.run = run;
exports.esc = esc;
// src/db/dbClient.ts
const db_1 = require("./db");
function logSql(sql) {
    if (process.env.NODE_ENV !== "production") {
        console.log("[SQL]", sql.replace(/\s+/g, " ").trim());
    }
}
/** SELECT — масив рядків */
function all(sql) {
    logSql(sql);
    return new Promise((resolve, reject) => {
        db_1.db.all(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
}
/** SELECT — один рядок або undefined */
function get(sql) {
    logSql(sql);
    return new Promise((resolve, reject) => {
        db_1.db.get(sql, (err, row) => (err ? reject(err) : resolve(row)));
    });
}
/** INSERT / UPDATE / DELETE */
function run(sql) {
    logSql(sql);
    return new Promise((resolve, reject) => {
        db_1.db.run(sql, function (err) {
            if (err)
                return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}
/**
 * Екранування одинарних лапок у рядках для вставки в SQL.
 * ⚠️  Це НЕ параметризація — лише мінімальний захист від синтаксичних помилок.
 * Параметризовані запити будуть у ЛР №5.
 */
function esc(value) {
    return String(value).replace(/'/g, "''");
}
