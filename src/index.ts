// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { migrate } from "./db/migrate";
import { errorHandler } from "./middleware/errorHandler";
import * as usersRepo    from "./repositories/users.repository";
import * as ticketsRepo  from "./repositories/tickets.repository";
import * as messagesRepo from "./repositories/ticketMessages.repository";
import {
  UserRole, TicketStatus, TicketPriority,
  CreateUserDto, UpdateUserDto,
  CreateTicketDto, UpdateTicketDto,
  CreateMessageDto,
} from "./models/models";

const app  = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────

const VALID_ROLES: UserRole[] = ["student", "teacher", "admin", "support"];

/** GET /api/users?role=student&sortBy=name&sortDir=asc */
app.get("/api/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, sortBy, sortDir } = req.query as Record<string, string>;
    const users = await usersRepo.findAll(role, sortBy, sortDir);
    res.json({ data: users, meta: { count: users.length } });
  } catch (e) { next(e); }
});

/** GET /api/users/:id */
app.get("/api/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersRepo.findById(req.params.id);
    if (!user) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    res.json({ data: user });
  } catch (e) { next(e); }
});

/** POST /api/users */
app.post("/api/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, role } = req.body as CreateUserDto;
    if (!name || !email)
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "name and email are required" } });
    if (role && !VALID_ROLES.includes(role))
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: `role must be one of: ${VALID_ROLES.join(", ")}` } });

    const created = await usersRepo.create({ name, email, role });
    res.status(201).json({ data: created });
  } catch (e) { next(e); }
});

/** PUT /api/users/:id */
app.put("/api/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, role } = req.body as UpdateUserDto;
    if (role && !VALID_ROLES.includes(role))
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: `role must be one of: ${VALID_ROLES.join(", ")}` } });

    const updated = await usersRepo.update(req.params.id, { name, role });
    if (!updated) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    res.json({ data: updated });
  } catch (e) { next(e); }
});

/** DELETE /api/users/:id */
app.delete("/api/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ok = await usersRepo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    res.status(204).send();
  } catch (e) { next(e); }
});

// ─────────────────────────────────────────────────────────────────────────────
// TICKETS
// ─────────────────────────────────────────────────────────────────────────────

const VALID_STATUSES:   TicketStatus[]   = ["Open", "InProgress", "Resolved", "Closed"];
const VALID_PRIORITIES: TicketPriority[] = ["Low", "Medium", "High"];

/** GET /api/tickets?status=Open&priority=High&page=1&pageSize=5&sortBy=createdAt&sortDir=desc */
app.get("/api/tickets", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority, authorId, sortBy, sortDir, page, pageSize } = req.query as Record<string, string>;
    const tickets = await ticketsRepo.findAll({ status, priority, authorId, sortBy, sortDir, page: Number(page), pageSize: Number(pageSize) });
    res.json({ data: tickets, meta: { count: tickets.length } });
  } catch (e) { next(e); }
});

/** GET /api/tickets/stats — агрегація (має бути перед /:id) */
app.get("/api/tickets/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await ticketsRepo.getStats();
    res.json({ data: stats });
  } catch (e) { next(e); }
});

/**
 * GET /api/tickets/search?q=...
 * ⚠️  НАВЧАЛЬНА SQLi-ДЕМОНСТРАЦІЯ — рядок q вставляється БЕЗ екранування
 */
app.get("/api/tickets/search", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? "");
    const results = await ticketsRepo.search(q);
    res.json({ data: results, meta: { count: results.length } });
  } catch (e) { next(e); }
});

/** GET /api/tickets/:id */
app.get("/api/tickets/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await ticketsRepo.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
    res.json({ data: ticket });
  } catch (e) { next(e); }
});

/** POST /api/tickets */
app.post("/api/tickets", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, message, priority, authorId } = req.body as CreateTicketDto;
    const errors: { field: string; message: string }[] = [];

    if (!subject  || subject.length  < 3) errors.push({ field: "subject",  message: "subject є обов'язковим рядком (мін. 3 символів)" });
    if (!message  || message.length  < 5) errors.push({ field: "message",  message: "message є обов'язковим рядком (мін. 5 символів)" });
    if (priority  && !VALID_PRIORITIES.includes(priority)) errors.push({ field: "priority", message: `priority має бути одним з: ${VALID_PRIORITIES.join(", ")}` });
    if (!authorId || authorId.length  < 1) errors.push({ field: "authorId", message: "authorId є обов'язковим рядком (мін. 1 символів)" });

    if (errors.length > 0)
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Некоректні дані запиту", details: errors } });

    const created = await ticketsRepo.create({ subject, message, priority, authorId });
    res.status(201).json({ data: created });
  } catch (e) { next(e); }
});

/** PUT /api/tickets/:id */
app.put("/api/tickets/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = req.body as UpdateTicketDto;
    if (dto.status   && !VALID_STATUSES.includes(dto.status))
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: `status має бути одним з: ${VALID_STATUSES.join(", ")}` } });
    if (dto.priority && !VALID_PRIORITIES.includes(dto.priority))
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: `priority має бути одним з: ${VALID_PRIORITIES.join(", ")}` } });

    const updated = await ticketsRepo.update(req.params.id, dto);
    if (!updated) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
    res.json({ data: updated });
  } catch (e) { next(e); }
});

/** DELETE /api/tickets/:id */
app.delete("/api/tickets/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ok = await ticketsRepo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
    res.status(204).send();
  } catch (e) { next(e); }
});

// ─────────────────────────────────────────────────────────────────────────────
// TICKET MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/tickets/:id/messages */
app.get("/api/tickets/:id/messages", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await ticketsRepo.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });

    const messages = await messagesRepo.findByTicket(req.params.id);
    res.json({ data: messages, meta: { count: messages.length } });
  } catch (e) { next(e); }
});

/** POST /api/tickets/:id/messages */
app.post("/api/tickets/:id/messages", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await ticketsRepo.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });

    const { text, authorId } = req.body as CreateMessageDto;
    if (!text || !authorId)
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "text and authorId are required" } });

    const created = await messagesRepo.create(req.params.id, { text, authorId });
    res.status(201).json({ data: created });
  } catch (e) { next(e); }
});

/** DELETE /api/tickets/:ticketId/messages/:messageId */
app.delete("/api/tickets/:ticketId/messages/:messageId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ok = await messagesRepo.remove(req.params.messageId);
    if (!ok) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Message not found" } });
    res.status(204).send();
  } catch (e) { next(e); }
});

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLER (завжди останній)
// ─────────────────────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  await migrate(); // міграції ДО listen()
  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("[server] Fatal error:", err);
  process.exit(1);
});
