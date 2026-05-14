import { ticketsRepository } from "../repositories/tickets.repository";
import { ticketMessagesRepository } from "../repositories/ticketMessages.repository";
import { usersRepository } from "../repositories/users.repository";
import { ApiError } from "../middleware/ApiError";
import { requireString, requireEnum, collectErrors } from "../middleware/validation";
import {
  CreateTicketRequestDto,
  UpdateTicketRequestDto,
  TicketResponseDto,
  ListResponseDto,
} from "../dtos";
import { TicketEntity } from "../models";

const PRIORITIES = ["Low", "Medium", "High"] as const;
const STATUSES = ["Open", "InProgress", "Resolved", "Closed"] as const;

function toDto(e: TicketEntity): TicketResponseDto {
  return {
    id: e.id,
    subject: e.subject,
    message: e.message,
    priority: e.priority,
    status: e.status,
    authorId: e.authorId,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

interface TicketListFilters {
  status?: string;
  priority?: string;
  authorId?: string;
  sortBy?: string;
  sortDir?: string;
  page?: string;
  pageSize?: string;
}

export const ticketsService = {
  getAll(filters: TicketListFilters): ListResponseDto<TicketResponseDto> {
    let items = ticketsRepository.getAll();

    // Фільтрація
    if (filters.status) items = items.filter((t) => t.status === filters.status);
    if (filters.priority) items = items.filter((t) => t.priority === filters.priority);
    if (filters.authorId) items = items.filter((t) => t.authorId === filters.authorId);

    // Сортування
    const sortBy = filters.sortBy ?? "createdAt";
    const sortDir = filters.sortDir === "asc" ? 1 : -1;
    items = [...items].sort((a, b) => {
      const aVal = a[sortBy as keyof TicketEntity] ?? "";
      const bVal = b[sortBy as keyof TicketEntity] ?? "";
      return aVal < bVal ? -sortDir : aVal > bVal ? sortDir : 0;
    });

    const total = items.length;

    // Пагінація
    const page = Math.max(1, parseInt(filters.page ?? "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize ?? "10", 10) || 10));
    items = items.slice((page - 1) * pageSize, page * pageSize);

    return { items: items.map(toDto), total };
  },

  getById(id: string): TicketResponseDto {
    const ticket = ticketsRepository.getById(id);
    if (!ticket) throw ApiError.notFound("Тікет");
    return toDto(ticket);
  },

  create(dto: CreateTicketRequestDto): TicketResponseDto {
    const errors = collectErrors([
      requireString(dto.subject, "subject", 3, 200),
      requireString(dto.message, "message", 5, 2000),
      requireEnum(dto.priority, "priority", [...PRIORITIES]),
      requireString(dto.authorId, "authorId", 1),
    ]);
    if (errors.length > 0) throw ApiError.validationError(errors);

    const author = usersRepository.getById(dto.authorId);
    if (!author) throw ApiError.badRequest("Автор (authorId) не знайдений");

    const entity = ticketsRepository.add({
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      priority: dto.priority,
      status: "Open",
      authorId: dto.authorId,
    });
    return toDto(entity);
  },

  update(id: string, dto: UpdateTicketRequestDto): TicketResponseDto {
    const existing = ticketsRepository.getById(id);
    if (!existing) throw ApiError.notFound("Тікет");

    const errors = collectErrors([
      dto.subject !== undefined ? requireString(dto.subject, "subject", 3, 200) : null,
      dto.priority !== undefined ? requireEnum(dto.priority, "priority", [...PRIORITIES]) : null,
      dto.status !== undefined ? requireEnum(dto.status, "status", [...STATUSES]) : null,
    ]);
    if (errors.length > 0) throw ApiError.validationError(errors);

    const updated = ticketsRepository.update(id, {
      ...(dto.subject ? { subject: dto.subject.trim() } : {}),
      ...(dto.priority ? { priority: dto.priority } : {}),
      ...(dto.status ? { status: dto.status } : {}),
    });
    return toDto(updated!);
  },

  delete(id: string): void {
    const existing = ticketsRepository.getById(id);
    if (!existing) throw ApiError.notFound("Тікет");
    ticketMessagesRepository.deleteByTicketId(id);
    ticketsRepository.delete(id);
  },
};
