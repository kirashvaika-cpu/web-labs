"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.findById = findById;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.getStats = getStats;
exports.search = search;
// src/repositories/tickets.repository.ts
const uuid_1 = require("uuid");
const dbClient_1 = require("../db/dbClient");
const VALID_STATUSES = ["Open", "InProgress", "Resolved", "Closed"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];
async function findAll(opts) {
    const { status, priority, authorId, sortBy = "createdAt", sortDir = "desc", page = 1, pageSize = 20, } = opts;
    const allowedSort = ["id", "createdAt", "updatedAt", "priority", "status", "subject"].includes(sortBy)
        ? sortBy
        : "createdAt";
    const allowedOrder = sortDir.toLowerCase() === "asc" ? "ASC" : "DESC";
    const conds = [];
    if (status && VALID_STATUSES.includes(status))
        conds.push(`t.status   = '${(0, dbClient_1.esc)(status)}'`);
    if (priority && VALID_PRIORITIES.includes(priority))
        conds.push(`t.priority = '${(0, dbClient_1.esc)(priority)}'`);
    if (authorId)
        conds.push(`t.authorId = '${(0, dbClient_1.esc)(authorId)}'`);
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const limit = Math.min(Number(pageSize) || 20, 100);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;
    return await (0, dbClient_1.all)(`
    SELECT
      t.id, t.subject, t.message, t.priority, t.status,
      t.authorId, t.createdAt, t.updatedAt,
      u.name  AS authorName,
      u.email AS authorEmail
    FROM Tickets t
    JOIN Users u ON u.id = t.authorId
    ${where}
    ORDER BY t.${allowedSort} ${allowedOrder}
    LIMIT ${limit} OFFSET ${offset};
  `);
}
async function findById(id) {
    return await (0, dbClient_1.get)(`
    SELECT
      t.id, t.subject, t.message, t.priority, t.status,
      t.authorId, t.createdAt, t.updatedAt,
      u.name  AS authorName,
      u.email AS authorEmail
    FROM Tickets t
    JOIN Users u ON u.id = t.authorId
    WHERE t.id = '${(0, dbClient_1.esc)(id)}';
  `);
}
async function create(dto) {
    const id = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    const priority = dto.priority ?? "Medium";
    await (0, dbClient_1.run)(`
    INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt)
    VALUES (
      '${id}',
      '${(0, dbClient_1.esc)(dto.subject)}',
      '${(0, dbClient_1.esc)(dto.message)}',
      '${(0, dbClient_1.esc)(priority)}',
      'Open',
      '${(0, dbClient_1.esc)(dto.authorId)}',
      '${now}', '${now}'
    );
  `);
    return (await findById(id));
}
async function update(id, dto) {
    const now = new Date().toISOString();
    const fields = [`updatedAt = '${now}'`];
    if (dto.subject !== undefined)
        fields.push(`subject  = '${(0, dbClient_1.esc)(dto.subject)}'`);
    if (dto.message !== undefined)
        fields.push(`message  = '${(0, dbClient_1.esc)(dto.message)}'`);
    if (dto.priority !== undefined)
        fields.push(`priority = '${(0, dbClient_1.esc)(dto.priority)}'`);
    if (dto.status !== undefined)
        fields.push(`status   = '${(0, dbClient_1.esc)(dto.status)}'`);
    const result = await (0, dbClient_1.run)(`
    UPDATE Tickets SET ${fields.join(", ")} WHERE id = '${(0, dbClient_1.esc)(id)}';
  `);
    return result.changes === 0 ? null : (await findById(id));
}
async function remove(id) {
    const result = await (0, dbClient_1.run)(`DELETE FROM Tickets WHERE id = '${(0, dbClient_1.esc)(id)}';`);
    return result.changes > 0;
}
// ─── JOIN + Агрегація ─────────────────────────────────────────────────────────
async function getStats() {
    const [totalRow] = await (0, dbClient_1.all)("SELECT COUNT(*) AS total FROM Tickets;");
    const statusRows = await (0, dbClient_1.all)("SELECT status,   COUNT(*) AS cnt FROM Tickets GROUP BY status;");
    const priorityRows = await (0, dbClient_1.all)("SELECT priority, COUNT(*) AS cnt FROM Tickets GROUP BY priority;");
    const [avgRow] = await (0, dbClient_1.all)(`
    SELECT AVG(cnt) AS avg FROM (
      SELECT COUNT(*) AS cnt FROM TicketMessages GROUP BY ticketId
    );
  `);
    const byStatus = {};
    const byPriority = {};
    statusRows.forEach((r) => {
        byStatus[r.status] = r.cnt;
    });
    priorityRows.forEach((r) => {
        byPriority[r.priority] = r.cnt;
    });
    return {
        total: totalRow?.total ?? 0,
        byStatus,
        byPriority,
        avgMessagesPerTicket: Math.round((avgRow?.avg ?? 0) * 100) / 100,
    };
}
// ─── SQLi-демонстрація (НАВЧАЛЬНА, НЕБЕЗПЕЧНО) ───────────────────────────────
/**
 * ⚠️  ДЕМОНСТРАЦІЯ SQL INJECTION
 * Параметр `q` вставляється безпосередньо в SQL без будь-якого екранування.
 *
 * Приклад небезпечного вводу:
 *   q = %' OR '1'='1
 *
 * Формований запит стає:
 *   WHERE t.subject LIKE '%' OR '1'='1%'
 *
 * Умова '1'='1' завжди TRUE → повертаються ВСІ тікети незалежно від фільтра.
 *
 * ВИПРАВЛЕННЯ: параметризовані запити (ЛР №5).
 */
async function search(q) {
    const sql = `
    SELECT
      t.id, t.subject, t.message, t.priority, t.status,
      t.authorId, t.createdAt, t.updatedAt,
      u.name  AS authorName,
      u.email AS authorEmail
    FROM Tickets t
    JOIN Users u ON u.id = t.authorId
    WHERE t.subject LIKE '%${q}%'
    ORDER BY t.createdAt DESC;
  `;
    return await (0, dbClient_1.all)(sql);
}
