import * as ticketsRepo from "../repositories/tickets.repository";
import * as usersRepo from "../repositories/users.repository";
import * as messagesRepo from "../repositories/ticketMessages.repository";
import { ListResponse } from "../dtos";
import { TicketStats, TicketPriority } from "../models/models";

interface TicketSchema {
  id: string | number;
  subject?: string;
  title?: string;
  message?: string;
  description?: string;
  priority: string;
  status: string;
  authorId: string | number;
}

interface UserSchema {
  id: string | number;
  name: string;
  email: string;
}

interface TicketFilterQuery {
  status?: string;
  priority?: string;
  authorId?: string;
  sortBy?: string;
  sortDir?: string;
  page?: string | number;
  pageSize?: string | number;
}

// Допоміжний метод для уникнення дублювання коду
async function resolveAuthorId(authorId: string): Promise<string> {
  // Якщо це вже UUID — повертаємо як є
  if (authorId.includes("-")) {
    return authorId;
  }
  // Якщо число — шукаємо за id
  if (!isNaN(Number(authorId))) {
    return authorId;
  }
  // Якщо ім'я — шукаємо за іменем
  const allUsers = await usersRepo.findAll();
  const user = (allUsers as UserSchema[]).find((u: UserSchema) => u.name === authorId);
  return user ? String(user.id) : authorId;
}

export const ticketsService = {
  // 1. Отримання всіх квитків із підставленням імен авторів для фронтенду
  async getAll(filters: TicketFilterQuery): Promise<ListResponse<TicketSchema>> {
    const rawTickets = await ticketsRepo.findAll({
      status: filters.status,
      priority: filters.priority,
      authorId: filters.authorId,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
      page: filters.page ? Number(filters.page) : undefined,
      pageSize: filters.pageSize ? Number(filters.pageSize) : undefined,
    });

    const allUsers = await usersRepo.findAll();

    const tickets = (rawTickets as TicketSchema[]).map((t: TicketSchema) => {
      const user = (allUsers as UserSchema[]).find(
        (u: UserSchema) => String(u.id) === String(t.authorId)
      );
      const authorName = user ? user.name : "Вікторія Тихомирова";

      let displayPriority = t.priority;
      if (t.priority === "Low") displayPriority = "Низький";
      if (t.priority === "Medium") displayPriority = "Середній";
      if (t.priority === "High") displayPriority = "Високий";

      let displayStatus = t.status;
      if (t.status === "Open") displayStatus = "Відкрито";

      return {
        ...t,
        subject: t.subject || t.title,
        message: t.message || t.description,
        priority: displayPriority,
        status: displayStatus,
        authorId: t.authorId,
        author: { id: t.authorId, name: authorName },
        authorName,
        user: { name: authorName },
      };
    });

    return { data: tickets, meta: { count: tickets.length } };
  },

  // Повертаємо чіткий системний тип TicketStats
  async getStats(): Promise<TicketStats> {
    return await ticketsRepo.getStats();
  },

  async search(q: string): Promise<TicketSchema[]> {
    return (await ticketsRepo.search(q)) as unknown as TicketSchema[];
  },

  // Приведення типів через обгортку усуває помилку TS2322 з null/undefined
  async getById(id: string): Promise<TicketSchema | undefined> {
    const ticket = await ticketsRepo.findById(id);
    if (!ticket) return undefined;
    return ticket as unknown as TicketSchema;
  },

  // Оновлено: типізовано через TicketPriority та усунуто дублювання коду
  async create(dto: Record<string, string | number>): Promise<TicketSchema> {
    let priorityStr = String(dto.priority ?? "Low");
    if (priorityStr === "Низький") priorityStr = "Low";
    if (priorityStr === "Середній") priorityStr = "Medium";
    if (priorityStr === "Високий") priorityStr = "High";

    const priority = priorityStr as TicketPriority;
    const authorId = await resolveAuthorId(String(dto.authorId ?? "1"));

    return (await ticketsRepo.create({
      subject: String(dto.subject),
      message: String(dto.message),
      priority,
      authorId,
    })) as unknown as TicketSchema;
  },

  async update(id: string, dto: Record<string, unknown>): Promise<TicketSchema | undefined> {
    const updated = await ticketsRepo.update(id, dto);
    if (!updated) return undefined;
    return updated as unknown as TicketSchema;
  },

  async delete(id: string): Promise<boolean> {
    return await ticketsRepo.remove(id);
  },

  async getMessages(ticketId: string): Promise<unknown[]> {
    return await messagesRepo.findByTicket(ticketId);
  },

  async addMessage(ticketId: string, dto: Record<string, string>): Promise<unknown> {
    const authorId = await resolveAuthorId(dto.authorId ?? "1");

    return await messagesRepo.create(ticketId, {
      text: dto.text,
      authorId,
    });
  },
};
