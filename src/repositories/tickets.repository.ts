// src/repositories/tickets.repository.ts
import { v4 as uuidv4 } from "uuid";
import { all, get, run, esc } from "../db/dbClient";
import {
  Ticket,
  TicketWithAuthor,
  CreateTicketDto,
  UpdateTicketDto,
  TicketStats,
  TicketStatus,
  TicketPriority,
} from "../models/models";

const VALID_STATUSES: TicketStatus[] = ["Open", "InProgress", "Resolved", "Closed"];
const VALID_PRIORITIES: TicketPriority[] = ["Low", "Medium", "High"];

export async function findAll(opts: {
  status?: string;
  priority?: string;
  authorId?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
}): Promise<TicketWithAuthor[]> {
  const {
    status,
    priority,
    authorId,
    sortBy = "createdAt",
    sortDir = "desc",
    page = 1,
    pageSize = 20,
  } = opts;

  const allowedSort = ["id", "createdAt", "updatedAt", "priority", "status", "subject"].includes(
    sortBy
  )
    ? sortBy
    : "createdAt";
  const allowedOrder = sortDir.toLowerCase() === "asc" ? "ASC" : "DESC";

  const conds: string[] = [];
  if (status && VALID_STATUSES.includes(status as TicketStatus))
    conds.push(`t.status   = '${esc(status)}'`);
  if (priority && VALID_PRIORITIES.includes(priority as TicketPriority))
    conds.push(`t.priority = '${esc(priority)}'`);
  if (authorId) conds.push(`t.authorId = '${esc(authorId)}'`);

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const limit = Math.min(Number(pageSize) || 20, 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

  return await all<TicketWithAuthor>(`
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

export async function findById(id: string): Promise<TicketWithAuthor | undefined> {
  return await get<TicketWithAuthor>(`
    SELECT
      t.id, t.subject, t.message, t.priority, t.status,
      t.authorId, t.createdAt, t.updatedAt,
      u.name  AS authorName,
      u.email AS authorEmail
    FROM Tickets t
    JOIN Users u ON u.id = t.authorId
    WHERE t.id = '${esc(id)}';
  `);
}

export async function create(dto: CreateTicketDto): Promise<TicketWithAuthor> {
  const id = uuidv4();
  const now = new Date().toISOString();
  const priority = dto.priority ?? "Medium";

  await run(`
    INSERT INTO Tickets (id, subject, message, priority, status, authorId, createdAt, updatedAt)
    VALUES (
      '${id}',
      '${esc(dto.subject)}',
      '${esc(dto.message)}',
      '${esc(priority)}',
      'Open',
      '${esc(dto.authorId)}',
      '${now}', '${now}'
    );
  `);

  return (await findById(id))!;
}

export async function update(id: string, dto: UpdateTicketDto): Promise<TicketWithAuthor | null> {
  const now = new Date().toISOString();
  const fields: string[] = [`updatedAt = '${now}'`];

  if (dto.subject !== undefined) fields.push(`subject  = '${esc(dto.subject)}'`);
  if (dto.message !== undefined) fields.push(`message  = '${esc(dto.message)}'`);
  if (dto.priority !== undefined) fields.push(`priority = '${esc(dto.priority)}'`);
  if (dto.status !== undefined) fields.push(`status   = '${esc(dto.status)}'`);

  const result = await run(`
    UPDATE Tickets SET ${fields.join(", ")} WHERE id = '${esc(id)}';
  `);

  return result.changes === 0 ? null : (await findById(id))!;
}

export async function remove(id: string): Promise<boolean> {
  const result = await run(`DELETE FROM Tickets WHERE id = '${esc(id)}';`);
  return result.changes > 0;
}

// ─── JOIN + Агрегація ─────────────────────────────────────────────────────────

export async function getStats(): Promise<TicketStats> {
  interface TotalRow {
    total: number;
  }
  interface StatusRow {
    status: string;
    cnt: number;
  }
  interface PriorRow {
    priority: string;
    cnt: number;
  }
  interface AvgRow {
    avg: number | null;
  }

  const [totalRow] = await all<TotalRow>("SELECT COUNT(*) AS total FROM Tickets;");
  const statusRows = await all<StatusRow>(
    "SELECT status,   COUNT(*) AS cnt FROM Tickets GROUP BY status;"
  );
  const priorityRows = await all<PriorRow>(
    "SELECT priority, COUNT(*) AS cnt FROM Tickets GROUP BY priority;"
  );
  const [avgRow] = await all<AvgRow>(`
    SELECT AVG(cnt) AS avg FROM (
      SELECT COUNT(*) AS cnt FROM TicketMessages GROUP BY ticketId
    );
  `);

  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
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
export async function search(q: string): Promise<TicketWithAuthor[]> {
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
  return await all<TicketWithAuthor>(sql);
}
