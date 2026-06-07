// src/models/models.ts
// Внутрішні моделі даних — повторюють структуру БД

export type UserRole = "student" | "teacher" | "admin" | "support";
export type TicketStatus = "Open" | "InProgress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: TicketPriority;
  status: TicketStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

/** Тікет з JOIN-даними автора */
export interface TicketWithAuthor extends Ticket {
  authorName: string;
  authorEmail: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface TicketMessageWithAuthor extends TicketMessage {
  authorName: string;
  authorEmail: string;
}

// ─── DTO ─────────────────────────────────────────────────────────────────────

export interface CreateUserDto {
  name: string;
  email: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
}

export interface CreateTicketDto {
  subject: string;
  message: string;
  priority?: TicketPriority;
  authorId: string;
}

export interface UpdateTicketDto {
  subject?: string;
  message?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
}

export interface CreateMessageDto {
  text: string;
  authorId: string;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface ApiList<T> {
  data: T[];
  meta: { count: number };
}

export interface ApiItem<T> {
  data: T;
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

export interface TicketStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  avgMessagesPerTicket: number;
}
