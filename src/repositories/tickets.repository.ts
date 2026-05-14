import { v4 as uuidv4 } from "uuid";
import { TicketEntity } from "../models";

const store = new Map<string, TicketEntity>();

export const ticketsRepository = {
  getAll(): TicketEntity[] {
    return Array.from(store.values());
  },

  getById(id: string): TicketEntity | undefined {
    return store.get(id);
  },

  add(data: Omit<TicketEntity, "id" | "createdAt" | "updatedAt">): TicketEntity {
    const now = new Date().toISOString();
    const entity: TicketEntity = {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    store.set(entity.id, entity);
    return entity;
  },

  update(id: string, data: Partial<Omit<TicketEntity, "id" | "createdAt">>): TicketEntity | undefined {
    const existing = store.get(id);
    if (!existing) return undefined;
    const updated: TicketEntity = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    store.set(id, updated);
    return updated;
  },

  delete(id: string): boolean {
    return store.delete(id);
  },
};
