import { v4 as uuidv4 } from "uuid";
import { TicketMessageEntity } from "../models";

const store = new Map<string, TicketMessageEntity>();

export const ticketMessagesRepository = {
  getByTicketId(ticketId: string): TicketMessageEntity[] {
    return Array.from(store.values()).filter((m) => m.ticketId === ticketId);
  },

  getById(id: string): TicketMessageEntity | undefined {
    return store.get(id);
  },

  add(data: Omit<TicketMessageEntity, "id" | "createdAt">): TicketMessageEntity {
    const entity: TicketMessageEntity = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    store.set(entity.id, entity);
    return entity;
  },

  deleteByTicketId(ticketId: string): void {
    for (const [id, msg] of store.entries()) {
      if (msg.ticketId === ticketId) store.delete(id);
    }
  },
};
