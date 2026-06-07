"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTickets = getAllTickets;
exports.getTicketById = getTicketById;
exports.getTicketWithAuthor = getTicketWithAuthor;
exports.getAllTicketsWithAuthors = getAllTicketsWithAuthors;
exports.createTicket = createTicket;
exports.updateTicket = updateTicket;
exports.deleteTicket = deleteTicket;
exports.getTicketStats = getTicketStats;
exports.getTicketsPerAuthor = getTicketsPerAuthor;
exports.searchTicketsUnsafe = searchTicketsUnsafe;
const dbClient_1 = require("../db/dbClient");
function escStr(s) {
    return String(s ?? "").replace(/'/g, "''");
}
const ALLOWED_SORT = ["createdAt", "updatedAt", "priority", "status", "subject"];
const ALLOWED_ORDER = ["asc", "desc"];
async function getAllTickets(filters = {}) {
    const conditions = [];
    if (filters.status)
        conditions.push(`status = '${escStr(filters.status)}'`);
    if (filters.priority)
        conditions.push(`priority = '${escStr(filters.priority)}'`);
    if (filters.authorId)
        conditions.push(`authorId = ${Number(filters.authorId)}`);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sortCol = ALLOWED_SORT.includes(filters.sort ?? "") ? filters.sort : "createdAt";
    const sortDir = ALLOWED_ORDER.includes((filters.order ?? "").toLowerCase())
        ? filters.order.toUpperCase()
        : "DESC";
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20));
    const offset = (page - 1) * pageSize;
    const countSql = `SELECT COUNT(*) as cnt FROM Tickets ${where};`;
    (0, dbClient_1.logSql)(countSql);
    const countRow = await (0, dbClient_1.get)(countSql);
    const count = countRow?.cnt ?? 0;
    const dataSql = `
    SELECT id, subject, message, status, priority, authorId, createdAt, updatedAt
    FROM Tickets
    ${where}
    ORDER BY ${sortCol} ${sortDir}
    LIMIT ${pageSize} OFFSET ${offset};
  `;
    (0, dbClient_1.logSql)(dataSql);
    const rows = await (0, dbClient_1.all)(dataSql);
    return { rows, count };
}
async function getTicketById(id) {
    const sql = `
    SELECT id, subject, message, status, priority, authorId, createdAt, updatedAt
    FROM Tickets WHERE id = ${id};
  `;
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.get)(sql);
}
// JOIN: ticket + author info
async function getTicketWithAuthor(id) {
    const sql = `
    SELECT
      t.id, t.subject, t.message, t.status, t.priority,
      t.authorId, t.createdAt, t.updatedAt,
      u.name AS authorName, u.email AS authorEmail
    FROM Tickets t
    JOIN Users u ON u.id = t.authorId
    WHERE t.id = ${id};
  `;
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.get)(sql);
}
// JOIN: list tickets with author info
async function getAllTicketsWithAuthors() {
    const sql = `
    SELECT
      t.id, t.subject, t.message, t.status, t.priority,
      t.authorId, t.createdAt, t.updatedAt,
      u.name AS authorName, u.email AS authorEmail
    FROM Tickets t
    JOIN Users u ON u.id = t.authorId
    ORDER BY t.createdAt DESC;
  `;
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.all)(sql);
}
async function createTicket(dto) {
    const now = new Date().toISOString();
    const sql = `
    INSERT INTO Tickets (subject, message, status, priority, authorId, createdAt, updatedAt)
    VALUES (
      '${escStr(dto.subject)}',
      '${escStr(dto.message)}',
      'Open',
      '${escStr(dto.priority)}',
      ${Number(dto.authorId)},
      '${now}',
      '${now}'
    );
  `;
    (0, dbClient_1.logSql)(sql);
    const result = await (0, dbClient_1.run)(sql);
    return (await getTicketById(result.lastID));
}
async function updateTicket(id, dto) {
    const now = new Date().toISOString();
    const fields = [`updatedAt = '${now}'`];
    if (dto.subject !== undefined)
        fields.push(`subject = '${escStr(dto.subject)}'`);
    if (dto.message !== undefined)
        fields.push(`message = '${escStr(dto.message)}'`);
    if (dto.status !== undefined)
        fields.push(`status = '${escStr(dto.status)}'`);
    if (dto.priority !== undefined)
        fields.push(`priority = '${escStr(dto.priority)}'`);
    const sql = `UPDATE Tickets SET ${fields.join(", ")} WHERE id = ${id};`;
    (0, dbClient_1.logSql)(sql);
    const result = await (0, dbClient_1.run)(sql);
    if (result.changes === 0)
        return null;
    return (await getTicketById(id)) ?? null;
}
async function deleteTicket(id) {
    const sql = `DELETE FROM Tickets WHERE id = ${id};`;
    (0, dbClient_1.logSql)(sql);
    const result = await (0, dbClient_1.run)(sql);
    return result.changes > 0;
}
async function getTicketStats() {
    const sql = `
    SELECT status, COUNT(*) AS count
    FROM Tickets
    GROUP BY status
    ORDER BY count DESC;
  `;
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.all)(sql);
}
async function getTicketsPerAuthor() {
    const sql = `
    SELECT
      u.id AS authorId,
      u.name AS authorName,
      u.email AS authorEmail,
      COUNT(t.id) AS ticketCount
    FROM Users u
    LEFT JOIN Tickets t ON t.authorId = u.id
    GROUP BY u.id
    ORDER BY ticketCount DESC;
  `;
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.all)(sql);
}
// ⚠️ НЕБЕЗПЕЧНИЙ endpoint — SQLi демонстрація (рядкова конкатенація без параметризації)
// Навмисно залишено вразливим для демонстрації SQL Injection у лаб. №5
async function searchTicketsUnsafe(q) {
    const sql = `
    SELECT id, subject, message, status, priority, authorId, createdAt, updatedAt
    FROM Tickets
    WHERE subject LIKE '%${q}%'
    ORDER BY createdAt DESC
    LIMIT 20;
  `;
    // ⚠️ q потрапляє в SQL без санітизації — це демонстрація SQLi
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.all)(sql);
}
