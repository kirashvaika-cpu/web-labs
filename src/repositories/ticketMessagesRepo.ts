import { all, get, run, logSql } from "../db/dbClient";
import { MessageDto, MessageWithAuthorDto, CreateMessageDto } from "../dtos";

function escStr(s: unknown): string {
  return String(s ?? "").replace(/'/g, "''");
}

export async function getMessagesByTicketId(ticketId: number): Promise<MessageWithAuthorDto[]> {
  const sql = `
    SELECT
      m.id, m.ticketId, m.authorId, m.text, m.createdAt,
      u.name AS authorName
    FROM TicketMessages m
    JOIN Users u ON u.id = m.authorId
    WHERE m.ticketId = ${ticketId}
    ORDER BY m.createdAt ASC;
  `;
  logSql(sql);
  return all<MessageWithAuthorDto>(sql);
}

export async function getMessageById(id: number): Promise<MessageDto | undefined> {
  const sql = `SELECT id, ticketId, authorId, text, createdAt FROM TicketMessages WHERE id = ${id};`;
  logSql(sql);
  return get<MessageDto>(sql);
}

export async function createMessage(
  ticketId: number,
  dto: CreateMessageDto
): Promise<MessageWithAuthorDto> {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO TicketMessages (ticketId, authorId, text, createdAt)
    VALUES (${ticketId}, ${Number(dto.authorId)}, '${escStr(dto.text)}', '${now}');
  `;
  logSql(sql);
  const result = await run(sql);
  const messages = await getMessagesByTicketId(ticketId);
  return messages.find((m) => m.id === result.lastID)!;
}

export async function deleteMessage(id: number): Promise<boolean> {
  const sql = `DELETE FROM TicketMessages WHERE id = ${id};`;
  logSql(sql);
  const result = await run(sql);
  return result.changes > 0;
}

// Aggregation: message count per ticket
export interface MessageCount {
  ticketId: number;
  subject: string;
  messageCount: number;
}

export async function getMessageCountPerTicket(): Promise<MessageCount[]> {
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
  logSql(sql);
  return all<MessageCount>(sql);
}
