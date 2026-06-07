import * as ticketMessagesRepoModule from "../repositories/ticketMessagesRepo";
import * as ticketsRepoModule from "../repositories/ticketsRepo";
import * as usersRepoModule from "../repositories/usersRepo";
import { ApiError } from "../middleware/ApiError";
import { requireString, collectErrors } from "../middleware/validation";
import { CreateMessageDto, ListResponse } from "../dtos";
import { TicketMessageEntity } from "../models";

// Визначаємо типи для репозиторіїв, щоб уникнути 'any'
interface ITicketRepo {
  getById: (id: string | number) => unknown;
}
interface IUserRepo {
  getById: (id: string | number) => unknown;
}
interface IMessageRepo {
  getByTicketId: (id: string | number) => TicketMessageEntity[];
  add: (data: unknown) => TicketMessageEntity;
}

const ticketMessagesRepo = ticketMessagesRepoModule as unknown as IMessageRepo;
const ticketsRepo = ticketsRepoModule as unknown as ITicketRepo;
const usersRepo = usersRepoModule as unknown as IUserRepo;

interface MessageResponse {
  id: number;
  ticketId: number;
  text: string;
  authorId: number;
  createdAt: Date;
}

function toDto(e: TicketMessageEntity): MessageResponse {
  return {
    id: Number(e.id),
    ticketId: Number(e.ticketId),
    text: e.text,
    authorId: Number(e.authorId),
    createdAt: new Date(e.createdAt),
  };
}

export const ticketMessagesService = {
  getByTicketId(ticketId: string): ListResponse<MessageResponse> {
    if (!ticketsRepo.getById(ticketId)) throw ApiError.notFound("Тікет");
    const items = ticketMessagesRepo.getByTicketId(ticketId);

    return {
      data: items.map(toDto),
      meta: { count: items.length },
    };
  },

  create(ticketId: string, dto: CreateMessageDto): MessageResponse {
    if (!ticketsRepo.getById(ticketId)) throw ApiError.notFound("Тікет");

    const errors = collectErrors([
      requireString(dto.text, "text", 1, 2000),
      requireString(String(dto.authorId), "authorId", 1),
    ]);
    if (errors.length > 0) throw ApiError.validationError(errors);

    if (!usersRepo.getById(dto.authorId)) {
      throw ApiError.badRequest("Автор (authorId) не знайдений");
    }

    const entity = ticketMessagesRepo.add({
      ticketId: Number(ticketId),
      text: dto.text.trim(),
      authorId: Number(dto.authorId),
    });
    return toDto(entity);
  },
};
