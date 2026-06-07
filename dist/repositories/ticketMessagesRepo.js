"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesByTicketId = getMessagesByTicketId;
exports.getMessageById = getMessageById;
exports.createMessage = createMessage;
exports.deleteMessage = deleteMessage;
exports.getMessageCountPerTicket = getMessageCountPerTicket;
const dbClient_1 = require("../db/dbClient");
function escStr(s) {
    return String(s ?? "").replace(/'/g, "''");
}
async function getMessagesByTicketId(ticketId) {
    const sql = `
    SELECT
      m.id, m.ticketId, m.authorId, m.text, m.createdAt,
      u.name AS authorName
    FROM TicketMessages m
    JOIN Users u ON u.id = m.authorId
    WHERE m.ticketId = ${ticketId}
    ORDER BY m.createdAt ASC;
  `;
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.all)(sql);
}
async function getMessageById(id) {
    const sql = `SELECT id, ticketId, authorId, text, createdAt FROM TicketMessages WHERE id = ${id};`;
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.get)(sql);
}
async function createMessage(ticketId, dto) {
    const now = new Date().toISOString();
    const sql = `
    INSERT INTO TicketMessages (ticketId, authorId, text, createdAt)
    VALUES (${ticketId}, ${Number(dto.authorId)}, '${escStr(dto.text)}', '${now}');
  `;
    (0, dbClient_1.logSql)(sql);
    const result = await (0, dbClient_1.run)(sql);
    const messages = await getMessagesByTicketId(ticketId);
    return messages.find((m) => m.id === result.lastID);
}
async function deleteMessage(id) {
    const sql = `DELETE FROM TicketMessages WHERE id = ${id};`;
    (0, dbClient_1.logSql)(sql);
    const result = await (0, dbClient_1.run)(sql);
    return result.changes > 0;
}
async function getMessageCountPerTicket() {
    const sql = `
    SELECT
      t.id AS ticketId,
      t.subject,
      COUNT(m.id) AS messageCount
    FROM Tickets t
    LEFT JOIN TicketMessages m ON m.ticketId = t.id
    GROUP BY t.id
    ORDER BY messageCount DESC
    LIMIT 10;
  `;
    (0, dbClient_1.logSql)(sql);
    return (0, dbClient_1.all)(sql);
}
