// src/repositories/ticketMessages.repository.ts
import { v4 as uuidv4 } from "uuid";
import { all, get, run, esc } from "../db/dbClient";
import { TicketMessage, TicketMessageWithAuthor, CreateMessageDto } from "../models/models";

export async function findByTicket(ticketId: string): Promise<TicketMessageWithAuthor[]> {
  return await all<TicketMessageWithAuthor>(`
    SELECT
      m.id, m.ticketId, m.authorId, m.text, m.createdAt,
      u.name  AS authorName,
      u.email AS authorEmail
    FROM TicketMessages m
    JOIN Users u ON u.id = m.authorId
    WHERE m.ticketId = '${esc(ticketId)}'
    ORDER BY m.createdAt ASC;
  `);
}

export async function findById(id: string): Promise<TicketMessage | undefined> {
  return await get<TicketMessage>(`
    SELECT id, ticketId, authorId, text, createdAt
    FROM TicketMessages
    WHERE id = '${esc(id)}';
  `);
}

export async function create(ticketId: string, dto: CreateMessageDto): Promise<TicketMessageWithAuthor> {
  const id  = uuidv4();
  const now = new Date().toISOString();

  await run(`
    INSERT INTO TicketMessages (id, ticketId, authorId, text, createdAt)
    VALUES ('${id}', '${esc(ticketId)}', '${esc(dto.authorId)}', '${esc(dto.text)}', '${now}');
  `);

  return (await get<TicketMessageWithAuthor>(`
    SELECT
      m.id, m.ticketId, m.authorId, m.text, m.createdAt,
      u.name  AS authorName,
      u.email AS authorEmail
    FROM TicketMessages m
    JOIN Users u ON u.id = m.authorId
    WHERE m.id = '${esc(id)}';
  `))!;
}

export async function remove(id: string): Promise<boolean> {
  const result = await run(`DELETE FROM TicketMessages WHERE id = '${esc(id)}';`);
  return result.changes > 0;
}
