"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByTicket = findByTicket;
exports.findById = findById;
exports.create = create;
exports.remove = remove;
// src/repositories/ticketMessages.repository.ts
const uuid_1 = require("uuid");
const dbClient_1 = require("../db/dbClient");
async function findByTicket(ticketId) {
    return await (0, dbClient_1.all)(`
    SELECT
      m.id, m.ticketId, m.authorId, m.text, m.createdAt,
      u.name  AS authorName,
      u.email AS authorEmail
    FROM TicketMessages m
    JOIN Users u ON u.id = m.authorId
    WHERE m.ticketId = '${(0, dbClient_1.esc)(ticketId)}'
    ORDER BY m.createdAt ASC;
  `);
}
async function findById(id) {
    return await (0, dbClient_1.get)(`
    SELECT id, ticketId, authorId, text, createdAt
    FROM TicketMessages
    WHERE id = '${(0, dbClient_1.esc)(id)}';
  `);
}
async function create(ticketId, dto) {
    const id = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    await (0, dbClient_1.run)(`
    INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt)
    VALUES ('${id}', '${(0, dbClient_1.esc)(ticketId)}', '${(0, dbClient_1.esc)(dto.authorId)}', '${(0, dbClient_1.esc)(dto.text)}', '${now}');
  `);
    return (await (0, dbClient_1.get)(`
    SELECT
      m.id, m.ticketId, m.authorId, m.text, m.createdAt,
      u.name  AS authorName,
      u.email AS authorEmail
    FROM TicketMessages m
    JOIN Users u ON u.id = m.authorId
    WHERE m.id = '${(0, dbClient_1.esc)(id)}';
  `));
}
async function remove(id) {
    const result = await (0, dbClient_1.run)(`DELETE FROM TicketMessages WHERE id = '${(0, dbClient_1.esc)(id)}';`);
    return result.changes > 0;
}
