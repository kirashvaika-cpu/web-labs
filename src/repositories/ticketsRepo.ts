import { all, get, run, logSql } from "../db/dbClient";
import {
  TicketDto,
  TicketWithAuthorDto,
  CreateTicketDto,
  UpdateTicketDto,
} from "../dtos";

function escStr(s: unknown): string {
  return String(s ?? "").replace(/'/g, "''");
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  authorId?: number;
  sort?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}

const ALLOWED_SORT = ["createdAt", "updatedAt", "priority", "status", "subject"];
const ALLOWED_ORDER = ["asc", "desc"];

export async function getAllTickets(filters: TicketFilters = {}): Promise<{
  rows: TicketDto[];
  count: number;
}> {
  const conditions: string[] = [];
  if (filters.status) conditions.push(`status = '${escStr(filters.status)}'`);
  if (filters.priority) conditions.push(`priority = '${escStr(filters.priority)}'`);
  if (filters.authorId) conditions.push(`authorId = ${Number(filters.authorId)}`);

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortCol = ALLOWED_SORT.includes(filters.sort ?? "") ? filters.sort : "createdAt";
  const sortDir = ALLOWED_ORDER.includes((filters.order ?? "").toLowerCase())
    ? filters.order!.toUpperCase()
    : "DESC";

  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20));
  const offset = (page - 1) * pageSize;

  const countSql = `SELECT COUNT(*) as cnt FROM Tickets ${where};`;
  logSql(countSql);
  const countRow = await get<{ cnt: number }>(countSql);
  const count = countRow?.cnt ?? 0;

  const dataSql = `
    SELECT id, subject, message, status, priority, authorId, createdAt, updatedAt
    FROM Tickets
    ${where}
    ORDER BY ${sortCol} ${sortDir}
    LIMIT ${pageSize} OFFSET ${offset};
  `;
  logSql(dataSql);
  const rows = await all<TicketDto>(dataSql);
  return { rows, count };
}

export async function getTicketById(id: number): Promise<TicketDto | undefined> {
  const sql = `
    SELECT id, subject, message, status, priority, authorId, createdAt, updatedAt
    FROM Tickets WHERE id = ${id};
  `;
  logSql(sql);
  return get<TicketDto>(sql);
}

// JOIN: ticket + author info
export async function getTicketWithAuthor(id: number): Promise<TicketWithAuthorDto | undefined> {
  const sql = `
    SELECT
      t.id, t.subject, t.message, t.status, t.priority,
      t.authorId, t.createdAt, t.updatedAt,
      u.name AS authorName, u.email AS authorEmail
    FROM Tickets t
    JOIN Users u ON u.id = t.authorId
    WHERE t.id = ${id};
  `;
  logSql(sql);
  return get<TicketWithAuthorDto>(sql);
}

// JOIN: list tickets with author info
export async function getAllTicketsWithAuthors(): Promise<TicketWithAuthorDto[]> {
  const sql = `
    SELECT
      t.id, t.subject, t.message, t.status, t.priority,
      t.authorId, t.createdAt, t.updatedAt,
      u.name AS authorName, u.email AS authorEmail
    FROM Tickets t
    JOIN Users u ON u.id = t.authorId
    ORDER BY t.createdAt DESC;
  `;
  logSql(sql);
  return all<TicketWithAuthorDto>(sql);
}

export async function createTicket(dto: CreateTicketDto): Promise<TicketDto> {
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
  logSql(sql);
  const result = await run(sql);
  return (await getTicketById(result.lastID))!;
}

export async function updateTicket(id: number, dto: UpdateTicketDto): Promise<TicketDto | null> {
  const now = new Date().toISOString();
  const fields: string[] = [`updatedAt = '${now}'`];
  if (dto.subject !== undefined) fields.push(`subject = '${escStr(dto.subject)}'`);
  if (dto.message !== undefined) fields.push(`message = '${escStr(dto.message)}'`);
  if (dto.status !== undefined) fields.push(`status = '${escStr(dto.status)}'`);
  if (dto.priority !== undefined) fields.push(`priority = '${escStr(dto.priority)}'`);

  const sql = `UPDATE Tickets SET ${fields.join(", ")} WHERE id = ${id};`;
  logSql(sql);
  const result = await run(sql);
  if (result.changes === 0) return null;
  return (await getTicketById(id)) ?? null;
}

export async function deleteTicket(id: number): Promise<boolean> {
  const sql = `DELETE FROM Tickets WHERE id = ${id};`;
  logSql(sql);
  const result = await run(sql);
  return result.changes > 0;
}

// Aggregation: stats per status
export interface TicketStats {
  status: string;
  count: number;
}

export async function getTicketStats(): Promise<TicketStats[]> {
  const sql = `
    SELECT status, COUNT(*) AS count
    FROM Tickets
    GROUP BY status
    ORDER BY count DESC;
  `;
  logSql(sql);
  return all<TicketStats>(sql);
}

// Aggregation: tickets per author
export interface AuthorStats {
  authorId: number;
  authorName: string;
  authorEmail: string;
  ticketCount: number;
  avgPriority: string;
}

export async function getTicketsPerAuthor(): Promise<AuthorStats[]> {
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
  logSql(sql);
  return all<AuthorStats>(sql);
}

// ⚠️ НЕБЕЗПЕЧНИЙ endpoint — SQLi демонстрація (рядкова конкатенація без параметризації)
// Навмисно залишено вразливим для демонстрації SQL Injection у лаб. №5
export async function searchTicketsUnsafe(q: string): Promise<TicketDto[]> {
  const sql = `
    SELECT id, subject, message, status, priority, authorId, createdAt, updatedAt
    FROM Tickets
    WHERE subject LIKE '%${q}%'
    ORDER BY createdAt DESC
    LIMIT 20;
  `;
  // ⚠️ q потрапляє в SQL без санітизації — це демонстрація SQLi
  logSql(sql);
  return all<TicketDto>(sql);
}
