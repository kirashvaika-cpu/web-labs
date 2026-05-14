import { ticketMessagesRepository } from "../repositories/ticketMessages.repository";
import { ticketsRepository } from "../repositories/tickets.repository";
import { usersRepository } from "../repositories/users.repository";
import { ApiError } from "../middleware/ApiError";
import { requireString, collectErrors } from "../middleware/validation";
import {
  CreateTicketMessageRequestDto,
  TicketMessageResponseDto,
  ListResponseDto,
} from "../dtos";
import { TicketMessageEntity } from "../models";

function toDto(e: TicketMessageEntity): TicketMessageResponseDto {
  return { id: e.id, ticketId: e.ticketId, text: e.text, authorId: e.authorId, createdAt: e.createdAt };
}

export const ticketMessagesService = {
  getByTicketId(ticketId: string): ListResponseDto<TicketMessageResponseDto> {
    if (!ticketsRepository.getById(ticketId)) throw ApiError.notFound("Тікет");
    const items = ticketMessagesRepository.getByTicketId(ticketId);
    return { items: items.map(toDto), total: items.length };
  },

  create(ticketId: string, dto: CreateTicketMessageRequestDto): TicketMessageResponseDto {
    if (!ticketsRepository.getById(ticketId)) throw ApiError.notFound("Тікет");

    const errors = collectErrors([
      requireString(dto.text, "text", 1, 2000),
      requireString(dto.authorId, "authorId", 1),
    ]);
    if (errors.length > 0) throw ApiError.validationError(errors);

    if (!usersRepository.getById(dto.authorId)) {
      throw ApiError.badRequest("Автор (authorId) не знайдений");
    }

    const entity = ticketMessagesRepository.add({
      ticketId,
      text: dto.text.trim(),
      authorId: dto.authorId,
    });
    return toDto(entity);
  },
};
